/* ═══════════════════════════════════════════════════════════════
   GUARDIANO DEI COLLECTOR IN RITARDO — 28 agosto 2026
   ═══════════════════════════════════════════════════════════════

   PERCHE' ESISTE. Lo scheduler di GitHub su questo repo non e' puntuale e
   ogni tanto salta i giri del tutto. Misurato su 1.650 giri reali:
   ritardo mediano 38 minuti, solo l'1% parte entro 5 minuti, il 24% sfora
   l'ora. E nelle notti storte si perde molto di piu':
       26->27 agosto   78 giri programmati, 23 partiti   (71% saltati)
       27->28 agosto   78 giri programmati, 48 partiti   (38% saltati)

   ⚠️ IN TUTTE E DUE LE NOTTI, ZERO RUN FALLITI. Quelli che partono
   riescono; gli altri non nascono proprio. Quindi **guardare gli esiti dei
   workflow non serve a niente**: l'unico segnale onesto sono i FILE dei dati.
   Questo script guarda quelli.

   COSA FA. La mattina controlla che ogni cartella di data/ abbia il giorno
   che dovrebbe avere. Se manca a qualcuno E il suo ultimo giro programmato
   e' passato da un pezzo, ri-lancia il workflow che la produce.

   COSA NON FA. Non tocca un dato, non scrive in data/ se non il proprio
   registro, e non zittisce nessuno: se una fonte e' morta davvero,
   check-fonti.js suona lo stesso dopo tre giorni. Questo rimedia ai giri
   persi, non ai guasti.

   ⚠️ IL LIMITE, DETTO SUBITO: il guardiano e' anche lui un cron, e nella
   notte del 71% sarebbe stato saltato pure lui. Per questo ha TRE orari
   invece di uno. Copre il caso «GitHub ha saltato la notte ed e' tornato in
   se' la mattina», che e' il piu' frequente, non «GitHub e' giu' da dodici
   ore» — li' non c'e' guardiano che tenga, e quando torna ripartono da soli
   anche i collector.

   USO
     node .github/scripts/guardiano-collector.js          guarda e basta
     LANCIA=1 node .github/scripts/guardiano-collector.js  ri-lancia davvero
     GIORNO=2026-08-27 ...                                finge un altro giorno
   ═══════════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RADICE = path.join(__dirname, '..', '..');
const DATA = path.join(RADICE, 'data');
const WF_DIR = path.join(RADICE, '.github', 'workflows');
const REGISTRO = path.join(DATA, 'guardiano.json');

// ⚠️ L'anagrafica cartella -> workflow sta in UN posto solo, in check-fonti.js.
// Due elenchi che divergono direbbero due verita' diverse sulla stessa cosa.
const { REGIONI } = require('./check-fonti.js');

const LANCIA = process.env.LANCIA === '1';

/* ── Le tarature, con il perche' accanto ────────────────────────── */

// Quanto deve essere passato dall'ultimo giro programmato prima di dire
// «questo e' in ritardo». Il ritardo mediano e' 38 minuti e il 6% sfora le
// due ore: sotto le 2h30 si ri-lancerebbero workflow che stanno solo
// arrivando tardi, cioe' si farebbe rumore invece che riparazione.
const MARGINE_MIN = 150;

// Se il prossimo giro programmato e' dietro l'angolo si lascia stare: fra
// poco ci pensa lui. Finestra STRETTA apposta — con un giro su tre che salta,
// aspettare il prossimo e' una scommessa, non una certezza.
const PROSSIMO_MIN = 20;

// Tetto per giro. Se ne mancano piu' di cosi' non e' un giro perso, e'
// GitHub giu': ri-lanciarne venti insieme non aiuta nessuno.
// Regolabile da fuori perche' altrimenti non si prova: nella pratica le due
// tarature qui sopra trattengono quasi tutto e a questo ramo non ci si arriva
// mai — cioe' resterebbe codice mai visto girare.
const MAX_LANCI = Number(process.env.MAX_LANCI || 8);

// Le fonti che dichiarano un ritardo loro: per queste «ieri» non esiste mai.
// ⚠️ ARSO pubblica con ~34 ore di scarto (vedi CLAUDE.md, scheda Slovenia):
// senza questa riga il guardiano la troverebbe in ritardo TUTTE le mattine.
const RITARDO_DICHIARATO = { slovenia: 2 };

// I riepiloghi delle pagine regione: il sito cade sul ripiego (20-40
// richieste invece di una) quando superano le 36 ore. Si interviene prima.
const RIEPILOGHI_ORE = 30;
const WF_RIEPILOGHI = 'riepiloghi.yml';

/* ── Date, in ora italiana ──────────────────────────────────────── */

// ⚠️ I runner girano in UTC e il progetto ragiona sul giorno solare
// ITALIANO. Si usa Intl invece di sommare a mano le ore dell'ora legale:
// non ha casi limite a fine marzo e fine ottobre.
const FMT_IT = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit',
});
const giornoIT = (d) => FMT_IT.format(d);

function giorniFa(n) {
  const d = new Date(Date.now() - n * 24 * 3600 * 1000);
  return giornoIT(d);
}

/* ── I cron, letti dai .yml ─────────────────────────────────────── */

// Restituisce gli orari programmati (ora, minuto) in UTC di un workflow.
// ⚠️ Si saltano le righe commentate: nei .yml del progetto ci sono cron
// spenti lasciati li' per memoria (ticino.yml, i piloti nel repo di test).
function cronDi(wf) {
  const p = path.join(WF_DIR, wf);
  if (!fs.existsSync(p)) return [];
  const out = [];
  for (const riga of fs.readFileSync(p, 'utf8').split('\n')) {
    if (riga.trim().startsWith('#')) continue;
    const m = riga.match(/^\s*-\s*cron:\s*['"]([^'"]+)/);
    if (!m) continue;
    const [mi, hh] = m[1].split(/\s+/);
    const ore = hh === '*' ? [...Array(24).keys()] : hh.split(',').map(Number);
    for (const h of ore) out.push({ h, mi: Number(mi) });
  }
  return out;
}

// Da quanti minuti e' passato l'ultimo giro programmato, e fra quanti arriva
// il prossimo. Null se il workflow non ha cron (solo a mano).
function quandoGirava(wf, adesso) {
  const cron = cronDi(wf);
  if (!cron.length) return null;
  let ultimo = Infinity, prossimo = Infinity;
  for (const c of cron) {
    for (const g of [-1, 0, 1]) {
      const t = new Date(adesso);
      t.setUTCDate(t.getUTCDate() + g);
      t.setUTCHours(c.h, c.mi, 0, 0);
      const dm = (adesso - t) / 60000;
      if (dm >= 0 && dm < ultimo) ultimo = dm;
      if (dm < 0 && -dm < prossimo) prossimo = -dm;
    }
  }
  return { daUltimo: ultimo, alProssimo: prossimo };
}

/* ── Il controllo ───────────────────────────────────────────────── */

function controllaCartelle(adesso) {
  const atteso = process.env.GIORNO || null;
  // SIMULA=liguria,emilia finge che a quelle cartelle manchi il giorno, senza
  // toccare un file. Serve a provare il ramo che scatta: un guardiano che non
  // si e' mai visto agire non si sa se agisce. Stessa idea del SIMULA di
  // check-fonti.js.
  const finti = new Set((process.env.SIMULA || '').split(',').map(s => s.trim()).filter(Boolean));
  if (finti.size) console.log(`SIMULA: fingo che manchi il giorno a ${[...finti].join(', ')}\n`);

  const inRitardo = [];
  for (const r of REGIONI) {
    // Di norma si aspetta IERI; per chi dichiara un ritardo suo, il giorno
    // che quel ritardo consente (Slovenia: 2 = l'altro ieri).
    const giorno = atteso || giorniFa(RITARDO_DICHIARATO[r.dir] || 1);
    const file = path.join(DATA, r.dir, `${giorno}.json`);
    if (!finti.has(r.dir) && fs.existsSync(file)) continue;

    const t = quandoGirava(r.wf, adesso);
    // ⚠️ Quando si simula, si DICE perche' si e' deciso di non fare niente:
    // un «tutto a posto» in risposta a una simulazione sembra un difetto del
    // guardiano e invece e' quasi sempre una taratura che lavora.
    const spiega = (perche) => {
      if (finti.has(r.dir)) console.log(`   ${r.dir}: non lo lancio — ${perche}`);
    };
    if (!t) { spiega(`${r.wf} non ha cron, non e' compito mio`); continue; }
    if (t.daUltimo < MARGINE_MIN) {
      spiega(`l'ultimo giro e' di ${Math.round(t.daUltimo)}' fa, sotto il margine di ${MARGINE_MIN}'`);
      continue;
    }
    if (t.alProssimo < PROSSIMO_MIN) {
      spiega(`il prossimo giro e' fra ${Math.round(t.alProssimo)}', ci pensa lui`);
      continue;
    }

    inRitardo.push({
      dir: r.dir, nome: r.nome, wf: r.wf, giorno,
      daUltimo: Math.round(t.daUltimo), alProssimo: Math.round(t.alProssimo),
    });
  }
  return inRitardo;
}

// I riepiloghi non sono una cartella di dati come le altre: si guarda il
// campo `generato`, non l'esistenza di un file. ⚠️ La freschezza si misura su
// QUELLO e non sull'ultimo giorno contenuto: Slovenia e Puglia possono essere
// legittimamente indietro e un riepilogo sanissimo sembrerebbe vecchio.
function controllaRiepiloghi(adesso) {
  const d = path.join(DATA, 'riepiloghi');
  if (!fs.existsSync(d)) return null;
  let piuVecchio = null;
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith('.json')) continue;
    let j;
    try { j = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')); } catch (e) { continue; }
    if (!j.generato) continue;
    const ore = (adesso - new Date(j.generato)) / 3600000;
    if (piuVecchio === null || ore > piuVecchio.ore) piuVecchio = { file: f, ore };
  }
  if (!piuVecchio || piuVecchio.ore < RIEPILOGHI_ORE) return null;
  const t = quandoGirava(WF_RIEPILOGHI, adesso);
  if (t && t.alProssimo < PROSSIMO_MIN) return null;
  return { wf: WF_RIEPILOGHI, ore: Math.round(piuVecchio.ore), file: piuVecchio.file };
}

/* ── Il lancio ──────────────────────────────────────────────────── */

function lancia(wf) {
  // `gh` c'e' sempre sui runner; serve permissions: actions: write e GH_TOKEN.
  // ⚠️ workflow_dispatch e' l'ECCEZIONE documentata alla regola «gli eventi
  // innescati dal GITHUB_TOKEN non creano nuovi run»: qui il run nasce.
  execFileSync('gh', ['workflow', 'run', wf], { stdio: 'pipe', cwd: RADICE });
}

function main() {
  // ORA=2026-08-28T09:00:00Z finge un altro momento: serve a provare le
  // tarature (margine, tetto) senza aspettare l'ora giusta del giorno.
  const adesso = process.env.ORA ? new Date(process.env.ORA) : new Date();
  console.log(`Guardiano — ${adesso.toISOString()}  (giorno italiano ${giornoIT(adesso)})`);
  console.log(`margine ${MARGINE_MIN}'  ·  prossimo ${PROSSIMO_MIN}'  ·  tetto ${MAX_LANCI}`);
  console.log(LANCIA ? 'modo: LANCIA' : 'modo: guardo e basta (LANCIA=1 per agire)');
  console.log('');

  const ritardo = controllaCartelle(adesso);
  const riep = controllaRiepiloghi(adesso);

  if (!ritardo.length && !riep) {
    console.log('✅ Tutte le cartelle hanno il giorno che devono avere.');
    aggiornaRegistro(adesso, [], []);
    return;
  }

  for (const r of ritardo) {
    console.log(`⏳ ${r.nome} (${r.dir}): manca ${r.giorno}. ` +
                `${r.wf}, ultimo giro ${r.daUltimo}' fa, prossimo fra ${r.alProssimo}'`);
  }
  if (riep) console.log(`⏳ Riepiloghi vecchi di ${riep.ore} h (${riep.file})`);

  // Dedup per workflow: le 13 cartelle francesi e le 11 di MeteoHub sono un
  // lancio solo. Senza questo, una piattaforma giu' produrrebbe 13 dispatch.
  const daLanciare = [...new Set(ritardo.map(r => r.wf).concat(riep ? [riep.wf] : []))];

  console.log('');
  if (daLanciare.length > MAX_LANCI) {
    console.log(`⚠️ ${daLanciare.length} workflow in ritardo: sopra il tetto di ${MAX_LANCI}. ` +
                `Non e' un giro perso, e' GitHub giu': non lancio niente.`);
    aggiornaRegistro(adesso, ritardo, []);
    return;
  }

  const lanciati = [];
  for (const wf of daLanciare) {
    if (!LANCIA) { console.log(`   (lancerei ${wf})`); continue; }
    try { lancia(wf); lanciati.push(wf); console.log(`🚀 lanciato ${wf}`); }
    catch (e) { console.log(`❌ ${wf}: ${String(e.message).split('\n')[0]}`); }
  }
  aggiornaRegistro(adesso, ritardo, lanciati);
}

// Il registro serve a due cose: non ripetersi all'infinito su una fonte morta,
// e soprattutto MISURARE quanto spesso capita, che era la domanda di partenza.
// Nessuna chiamata di rete: il conto si fa sui nostri stessi dati.
function aggiornaRegistro(adesso, ritardo, lanciati) {
  let reg = { giri: [] };
  if (fs.existsSync(REGISTRO)) {
    try { reg = JSON.parse(fs.readFileSync(REGISTRO, 'utf8')); } catch (e) {}
  }
  if (!Array.isArray(reg.giri)) reg.giri = [];
  reg.giri.push({
    quando: adesso.toISOString(),
    inRitardo: ritardo.map(r => r.dir),
    lanciati,
  });
  reg.giri = reg.giri.slice(-120);          // ~40 giorni con tre giri al giorno
  reg.aggiornato = adesso.toISOString();

  const conMancanze = reg.giri.filter(g => g.inRitardo.length).length;
  reg.riassunto = `${conMancanze} giri con qualcosa in ritardo su ${reg.giri.length}`;
  fs.writeFileSync(REGISTRO, JSON.stringify(reg, null, 2));
  console.log(`\nregistro: ${reg.riassunto}`);
}

if (require.main === module) main();
