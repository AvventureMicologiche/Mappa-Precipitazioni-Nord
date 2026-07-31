/**
 * check-fonti.js — GitHub Actions (1 run/giorno)
 *
 * Allarme via mail quando la fonte dati di una regione smette di rispondere.
 *
 * Perché serve (31/7/2026). Da oggi i giorni mancanti del Nord vengono coperti
 * con stime Open-Meteo (check-gaps-nord.js). È la cosa giusta per la mappa —
 * meglio una stima dichiarata di un buco silenzioso che falsa i totali — ma
 * rende INVISIBILE il guasto: passata la grazia il file compare, la mappa non
 * mostra niente di strano, e una regione morta sembrerebbe viva per sempre.
 * Questo controllo guarda quindi solo i file di dati REALI e ignora le stime.
 *
 * SCELTA DELLA SOGLIA, sulla stessa misura fatta per il gapfill (45 giorni di
 * cronologia git): il file di un giorno arriva entro D+1 in tutte le regioni,
 * mai oltre. Tre giorni consecutivi senza dato reale non è un ritardo, è un
 * guasto. Tre è anche il giorno in cui il gapfill inizia a coprire: la mail
 * arriva esattamente quando il buco smetterebbe di vedersi.
 * ECCEZIONE Ticino: 5 giorni, perché il suo collector interroga l'archivio
 * OASI fino a D-7 e recupera davvero (in 135 giorni: zero buchi). Allarmarlo
 * a 3 vorrebbe dire allarmare su un dato che stava arrivando.
 *
 * Cosa NON guarda: il numero di stazioni. Un giorno presente ma mezzo vuoto
 * (il caso Puglia di MeteoHub: 1 stazione buona su 132) qui non suona —
 * scelta esplicita del 31/7/2026, resta in carico al check periodico.
 * Un file con ZERO stazioni conta invece come giorno mancante.
 *
 * Una sola mail per run, che raccoglie tutto: allarmi nuovi, promemoria dei
 * guasti ancora aperti, rientri, e il lunedì il riepilogo delle 11 regioni.
 * Il registro `data/alert-fonti.json` serve a non ripetersi: alla rilevazione
 * parte la mail, poi un promemoria ogni 3 giorni finché il problema resta.
 *
 * Prove a mano (nessuna delle due tocca il registro):
 *   TEST_MAIL=1 node check-fonti.js          → mail di prova
 *   SIMULA=liguria:4 node check-fonti.js     → finge la Liguria ferma da 4 giorni
 */

const fs = require('fs');
const path = require('path');

const DATA_ROOT = path.join(__dirname, '..', '..', 'data');
const REGISTRO = path.join(DATA_ROOT, 'alert-fonti.json');
const MAIL_FILE = path.join(__dirname, '..', '..', 'alert-mail.eml');
const REPO = 'https://github.com/AvventureMicologiche/Mappa-Precipitazioni-Nord';

const SOGLIA_DEFAULT = 3;
const SOGLIA_PER_REGIONE = { ticino: 5 };
const PROMEMORIA_GIORNI = 3;   // ogni quanto ripetere la mail su un guasto aperto
const MAX_INDIETRO = 30;       // oltre non serve guardare: è comunque un guasto grave

// Le 11 regioni attive. Escluse `valledaosta` e `friuli` (Open-Meteo, dismesse
// il 26/7/2026 e sostituite da valledaosta-cf e friuli-osmer): le loro cartelle
// sono ferme per scelta, allarmarle sarebbe rumore.
const REGIONI = [
  { dir: 'altoadige',      nome: 'Alto Adige',    wf: 'altoadige.yml',      sito: 'https://weather.provinz.bz.it/' },
  { dir: 'emilia',         nome: 'Emilia Romagna', wf: 'emilia.yml',        sito: 'https://apps.arpae.it/REST/meteo_giornalieri' },
  { dir: 'friuli-osmer',   nome: 'Friuli VG',     wf: 'friuli-osmer.yml',   sito: 'https://www.meteo.fvg.it/' },
  { dir: 'liguria',        nome: 'Liguria',       wf: 'liguria.yml',        sito: 'https://omirl.regione.liguria.it/' },
  { dir: 'lombardia',      nome: 'Lombardia',     wf: 'lombardia.yml',      sito: 'https://dati.lombardia.it/' },
  { dir: 'piemonte',       nome: 'Piemonte',      wf: 'piemonte.yml',       sito: 'https://utility.arpa.piemonte.it/api_realtime' },
  { dir: 'ticino',         nome: 'Ticino',        wf: 'ticino.yml',         sito: 'https://oasi.ti.ch/' },
  { dir: 'toscana',        nome: 'Toscana',       wf: 'toscana.yml',        sito: 'https://sir.toscana.it/monitoraggio/stazioni.php?type=pluvio' },
  { dir: 'trentino',       nome: 'Trentino',      wf: 'trentino.yml',       sito: 'https://dati.meteotrentino.it/' },
  { dir: 'valledaosta-cf', nome: "Valle d'Aosta", wf: 'valledaosta-cf.yml', sito: 'https://presidi2.regione.vda.it/' },
  { dir: 'veneto',         nome: 'Veneto',        wf: 'veneto.yml',         sito: 'https://www.arpa.veneto.it/' }
];

const TEST_MAIL = process.env.TEST_MAIL === '1' || process.env.TEST_MAIL === 'true';
const SIMULA = (process.env.SIMULA || '').trim();

/* ---------- date (stessa logica degli altri script del progetto) ---------- */
function getItalyOffset(date) {
  const year = date.getUTCFullYear();
  const lastSunMarch = new Date(Date.UTC(year, 2, 31));
  lastSunMarch.setUTCDate(31 - lastSunMarch.getUTCDay());
  const lastSunOct = new Date(Date.UTC(year, 9, 31));
  lastSunOct.setUTCDate(31 - lastSunOct.getUTCDay());
  return (date >= lastSunMarch && date < lastSunOct) ? 2 : 1;
}
const fmtDate = d => {
  const p = n => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
};
const daysDiff = (a, b) =>
  Math.round((new Date(a + 'T12:00:00Z') - new Date(b + 'T12:00:00Z')) / 86400000);
const itaDate = g => { const [y, m, d] = g.split('-'); return `${d}/${m}/${y}`; };

function leggi(f) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } }
/** File nato da stime nostre (gapfill, backfill, archivio), non dato di stazione. */
const eStima = j => !!j && typeof j.source === 'string' && /open-meteo/.test(j.source);

/* ---------- analisi di una regione ---------- */
/**
 * Risale da ieri all'indietro e si ferma al primo giorno con dati REALI.
 * Piemonte e Veneto non scrivono il campo `source`: il test è per esclusione
 * (è una stima solo se il source dice open-meteo), quindi vanno bene lo stesso.
 */
function analizza(dir, noon) {
  let mancanti = 0;
  for (let i = 1; i <= MAX_INDIETRO; i++) {
    const g = fmtDate(new Date(noon - i * 86400000));
    const j = leggi(path.join(dir, g + '.json'));
    const stazioni = (j && j.stations || []).length;
    if (j && !eStima(j) && stazioni > 0) {
      return { mancanti, ultimoReale: g, stazioni, fonte: j.source || '(senza campo source)' };
    }
    mancanti++;
  }
  return { mancanti, ultimoReale: null, stazioni: 0, fonte: '?' };
}

/* ---------- composizione della mail ---------- */
function blocco(r, st, soglia, dal) {
  const primoMancante = fmtDate(new Date(new Date(st.ultimoReale || dal) .getTime() + 86400000));
  return [
    `  ${r.nome}`,
    `    fonte              ${st.fonte}`,
    `    ultimo dato reale  ${st.ultimoReale ? `${itaDate(st.ultimoReale)} (${st.stazioni} stazioni)` : `nessuno negli ultimi ${MAX_INDIETRO} giorni`}`,
    `    giorni mancanti    ${st.mancanti}${st.ultimoReale ? `, dal ${itaDate(primoMancante)}` : ''} (soglia ${soglia})`,
    `    ferma da           ${itaDate(dal)}`,
    '',
    `    workflow  ${REPO}/actions/workflows/${r.wf}`,
    `    fonte     ${r.sito}`,
    ''
  ].join('\n');
}

/** Subject con accenti ed emoji: encoded-word base64, spezzato per non sforare i 75 caratteri. */
function encodeSubject(s) {
  if (/^[\x20-\x7E]*$/.test(s)) return s;
  const chars = [...s];              // per code point: non spezza le coppie surrogate delle emoji
  const parti = [];
  for (let i = 0; i < chars.length; i += 15) {
    const pezzo = chars.slice(i, i + 15).join('');
    parti.push(`=?UTF-8?B?${Buffer.from(pezzo, 'utf8').toString('base64')}?=`);
  }
  return parti.join('\r\n ');
}

function scriviEml(subject, body) {
  const from = process.env.MAIL_USER || 'alert@example.invalid';
  const to = process.env.MAIL_TO || from;
  const b64 = Buffer.from(body, 'utf8').toString('base64').replace(/(.{76})/g, '$1\r\n');
  const eml = [
    `From: Mappa Precipitazioni <${from}>`,
    `To: <${to}>`,
    `Subject: ${encodeSubject(subject)}`,
    `Date: ${new Date().toUTCString().replace('GMT', '+0000')}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64,
    ''
  ].join('\r\n');
  fs.writeFileSync(MAIL_FILE, eml);
}

function output(chiave, valore) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${chiave}=${valore}\n`);
}

/* ---------- main ---------- */
function main() {
  const now = new Date();
  const oraItalia = new Date(now.getTime() + getItalyOffset(now) * 3600000);
  const oggi = fmtDate(oraItalia);
  const noon = new Date(oggi + 'T12:00:00Z').getTime();
  const lunedi = oraItalia.getUTCDay() === 1;
  const prova = TEST_MAIL || !!SIMULA;   // le prove non devono sporcare il registro

  console.log(`=== check-fonti — ${oggi}${prova ? ' (PROVA, registro non toccato)' : ''} ===`);

  const registro = fs.existsSync(REGISTRO) ? leggi(REGISTRO) : null;
  const reg = registro && registro.regioni ? registro : {
    nota: 'Stato delle fonti dati per regione e mail di allarme già inviate. Scritto da .github/scripts/check-fonti.js',
    regioni: {},
    ultimoHeartbeat: null
  };

  const [simReg, simGiorni] = SIMULA ? SIMULA.split(':') : [null, null];

  const allarmi = [], promemoria = [], rientri = [], riepilogo = [];
  let cambiato = false;

  for (const r of REGIONI) {
    const dir = path.join(DATA_ROOT, r.dir);
    if (!fs.existsSync(dir)) { console.log(`-- ${r.dir}: cartella assente, salto`); continue; }

    const soglia = SOGLIA_PER_REGIONE[r.dir] ?? SOGLIA_DEFAULT;
    const st = analizza(dir, noon);
    if (simReg === r.dir) {
      st.mancanti = parseInt(simGiorni || '99', 10);
      st.ultimoReale = fmtDate(new Date(noon - (st.mancanti + 1) * 86400000)); // coerente col conteggio
    }

    const prec = reg.regioni[r.dir] || { stato: 'ok' };
    riepilogo.push({ r, st, soglia, ferma: st.mancanti >= soglia });

    if (st.mancanti >= soglia) {
      if (prec.stato !== 'allarme') {
        const dal = oggi;
        allarmi.push(blocco(r, st, soglia, dal));
        reg.regioni[r.dir] = { stato: 'allarme', dal, ultimoReale: st.ultimoReale, giorniMancanti: st.mancanti, ultimaMail: oggi };
        cambiato = true;
        console.log(`🔴 ${r.dir}: ferma da ${st.mancanti} giorni (soglia ${soglia}) — ALLARME NUOVO`);
      } else {
        const attesa = prec.ultimaMail ? daysDiff(oggi, prec.ultimaMail) : 99;
        if (attesa >= PROMEMORIA_GIORNI) {
          promemoria.push(blocco(r, st, soglia, prec.dal || oggi));
          prec.ultimaMail = oggi;
          console.log(`🔴 ${r.dir}: ferma da ${st.mancanti} giorni — promemoria`);
        } else {
          console.log(`🔴 ${r.dir}: ferma da ${st.mancanti} giorni — già segnalata, prossimo promemoria fra ${PROMEMORIA_GIORNI - attesa}g`);
        }
        prec.ultimoReale = st.ultimoReale;
        prec.giorniMancanti = st.mancanti;
        reg.regioni[r.dir] = prec;
        cambiato = true;
      }
    } else {
      if (prec.stato === 'allarme') {
        rientri.push(`  ${r.nome} — dati reali di nuovo presenti (ultimo: ${itaDate(st.ultimoReale)}, ${st.stazioni} stazioni).\n` +
                     `    Era ferma dal ${itaDate(prec.dal)}. I giorni scoperti nel frattempo restano stime Open-Meteo.\n`);
        console.log(`🟢 ${r.dir}: rientrata`);
        cambiato = true;
      }
      reg.regioni[r.dir] = { stato: 'ok', ultimoReale: st.ultimoReale, giorniMancanti: st.mancanti };
      if (prec.stato !== 'ok' || prec.ultimoReale !== st.ultimoReale) cambiato = true;
      console.log(`   ${r.dir}: ultimo dato reale ${st.ultimoReale || '—'} (${st.mancanti} giorni indietro, soglia ${soglia})`);
    }
  }

  /* --- heartbeat del lunedì --- */
  const heartbeat = TEST_MAIL || (lunedi && reg.ultimoHeartbeat !== oggi);
  if (heartbeat && !prova) { reg.ultimoHeartbeat = oggi; cambiato = true; }

  /* --- una sola mail, con dentro tutto quello che c'è --- */
  const sezioni = [];
  if (TEST_MAIL) sezioni.push('PROVA DI CONSEGNA\n\n  Se leggi questa mail, l\'allarme sulle fonti dati funziona.\n  Nessun problema in corso: sotto trovi lo stato delle 11 regioni.\n');
  if (allarmi.length) {
    sezioni.push(`ALLARME — ${allarmi.length === 1 ? '1 regione ferma' : `${allarmi.length} regioni ferme`}\n\n` + allarmi.join('\n') +
      '\n  La rete di sicurezza sta coprendo i giorni mancanti con stime Open-Meteo:\n' +
      '  la mappa non mostra buchi, ma quei totali sono stime, non pioggia misurata.\n' +
      `\n  Prossimo promemoria fra ${PROMEMORIA_GIORNI} giorni, se resta così.\n`);
  }
  if (promemoria.length) sezioni.push('ANCORA FERMA\n\n' + promemoria.join('\n'));
  if (rientri.length) sezioni.push('RIENTRATA\n\n' + rientri.join('\n'));
  if (heartbeat) {
    const righe = riepilogo.map(x =>
      `  ${x.r.nome.padEnd(15)} ${(x.st.ultimoReale ? itaDate(x.st.ultimoReale) : '—').padEnd(12)} ` +
      `${String(x.st.stazioni).padStart(4)} staz.  ${x.ferma ? '🔴' : '🟢'}`);
    sezioni.push('STATO DELLE FONTI\n\n  regione         ultimo dato  stazioni\n' + righe.join('\n') + '\n');
  }

  if (!sezioni.length) {
    console.log('=== Niente da segnalare ===');
    output('mail', 'false');
    output('registro', String(cambiato && !prova));
    if (cambiato && !prova) salvaRegistro(reg);
    return;
  }

  let subject;
  if (TEST_MAIL) subject = '🧪 Pluviometro: prova di consegna';
  else if (allarmi.length || promemoria.length) {
    const ferme = riepilogo.filter(x => x.ferma);
    subject = ferme.length === 1
      ? `🔴 Pluviometro: ${ferme[0].r.nome} ferma da ${ferme[0].st.mancanti} giorni`
      : `🔴 Pluviometro: ${ferme.length} regioni ferme`;
  }
  else if (rientri.length) subject = `🟢 Pluviometro: ${rientri.length === 1 ? 'fonte rientrata' : 'fonti rientrate'}`;
  else subject = '🟢 Pluviometro: tutte le fonti attive';

  const ora = `${itaDate(oggi)} ${String(oraItalia.getUTCHours()).padStart(2, '0')}:${String(oraItalia.getUTCMinutes()).padStart(2, '0')}`;
  const body = sezioni.join('\n') +
    `\n--\nMappa Precipitazioni Nord · controllo automatico delle fonti\n${ora} (ora italiana) · ${REPO}/actions/workflows/alert-fonti.yml\n`;

  scriviEml(subject, body);
  output('mail', 'true');
  output('registro', String(cambiato && !prova));
  if (cambiato && !prova) salvaRegistro(reg);

  console.log(`=== Mail pronta: ${subject} ===`);
  if (!process.env.GITHUB_OUTPUT) console.log('\n' + body);
}

function salvaRegistro(reg) {
  reg.aggiornato = new Date().toISOString();
  fs.writeFileSync(REGISTRO, JSON.stringify(reg, null, 2));
}

try { main(); } catch (e) { console.error('❌', e.message); process.exit(1); }
