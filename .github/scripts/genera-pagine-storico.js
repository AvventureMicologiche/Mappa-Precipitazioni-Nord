#!/usr/bin/env node
/**
 * Le pagine «Storico precipitazioni <regione>» (/<regione>/storico/) e il loro riassunto data/storico/<regione>.json.
 *
 * PERCHE' ESISTONO (21/11/2026, scheda 140, suo «Lo storico» fra le proposte di pagine nuove, bozza della Toscana
 * approvata col suo «Sì, va bene»). Su Google si cerca «storico precipitazioni <regione>» e ci trovava gia', a
 * posizione 5-7, sulle pagine regione, che non sono fatte per questo. ilMeteo e 3B hanno lo storico di UNA stazione
 * per citta'; qui c'e' la regione mese per mese con centinaia di pluviometri, e la mappa di ogni mese.
 *
 * COSA C'E', dall'alto: il riquadro blu col mese in cima (il mese in corso fino a ieri; nei primi 6 giorni del mese il
 * mese prima), la mappa grande di quel mese, le barre mese per mese, una scheda per mese con la sua miniatura, le zone
 * (link alle pagine zona), le province dove la rete le dice, il giorno piu' bagnato di ogni mese (link alla mappa di
 * quel giorno sul pluviometro).
 *
 * LE REGOLE DEI NUMERI sono quelle della mappa e dei riepiloghi (genera-riepiloghi.js): un pluviometro conta nel mese
 * se c'e' almeno il 60% dei giorni in cui la regione ha il file (80% in Friuli), gli esclusi della mappa fuori, le
 * gemelle di un'altra cartella fuori; un giorno di pioggia e' un giorno in cui la media della regione arriva a 1 mm.
 * I giorni coperti da una stima (rete ferma, file *-gapfill) contano, come nei periodi lunghi della mappa, e la scheda
 * del mese li dice. ⚠️ LA FRONTIERA DEL DATO REALE: i mesi prima del primo file della rete vera (backfill da modello)
 * NON entrano: la pagina dice da quando parte lo storico misurato.
 *
 * ⚠️ IL RIASSUNTO CHE RESTA. I file dei giorni si tengono 730 giorni, poi la pulizia li cancella. Ogni mese si
 * ricalcola finche' i suoi file ci sono (una correzione tardiva entra da sola); un mese i cui file non ci sono piu'
 * resta com'era nel riassunto, che la pulizia non tocca: cosi' lo storico cresce oltre i due anni.
 *
 * LE FOTO DELLA MAPPA le fa il giro delle anteprime (genera-anteprime.js, scattaStorico) sul ramo `anteprime`:
 * <regione>-storico-<AAAA-MM>.jpg (grande) e -mini.webp. Se una foto manca, il suo riquadro sparisce (onerror).
 *
 * Uso: node .github/scripts/genera-pagine-storico.js      (SOLO=toscana: una regione sola, sitemap non toccata)
 * Gira nel giro del mattino (pagine-regione.yml), dopo le zone piogge. Nessuna rete, nessuna fonte: solo i file del repo.
 */
const fs = require('fs');
const path = require('path');
const { REGIONI, ESTERE, SITO, GA_ID, CANALE, GEN, scrivi, briciolaJson, briciolaHtml, BRIC_CSS, STILE_BASE, STILE_IERI,
  IERI_GRANDE, navAltre } = require('./genera-pagine-regione.js');
const { STILE_NUOVO, RILIEVO } = require('./lib-pagina-funghi.js');   // RILIEVO: i bottoni in rilievo, come la pagina regione
const { METEO_CSS } = require('./lib-meteo-regione.js');
const { TESTATA_CSS, testata } = require('./lib-testata.js');
const { senzaCommenti } = require('./lib-senza-commenti.js');
const { leggi, oggiItalia, giorniIndietro } = require('./lib-giorni.js');
const { escluse, escluso } = require('./lib-escluse.js');
const { slug, diEnte, postiDellaZona } = require('./lib-nomi.js');
const { capoluogo } = require('./lib-capoluoghi.js');
const { scriviSitemap } = require('./genera-sitemap.js');

const RADICE = path.join(__dirname, '..', '..');
const DATI = path.join(RADICE, 'data');
const USCITA = path.join(DATI, 'storico');
const ANTEPRIME = 'https://raw.githubusercontent.com/AvventureMicologiche/Mappa-Precipitazioni-Nord/anteprime';
const LISTA = REGIONI.filter(r => !ESTERE.includes(r.k));   // le 20 regioni italiane con la pagina piogge
const ESC = escluse(RADICE);
const STIMA = /open-meteo|icon-2i|gapfill|backfill|stima/;     // un file fatto da un modello, non dai pluviometri
const GAPFILL = /-gapfill$/;                                    // stima DOPO la frontiera: rete ferma qualche giorno
const COPERTURA = { friuli: 0.8 };                              // come genera-riepiloghi.js (COPERTURA_REGIONE)
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const ZONE = JSON.parse(fs.readFileSync(path.join(__dirname, 'funghi-zone.json'), 'utf8'));
const POSTI = JSON.parse(fs.readFileSync(path.join(__dirname, 'funghi-posti.json'), 'utf8'));

const attr = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const num = (x, d = 1) => Number(x).toLocaleString('it-IT', { minimumFractionDigits: d, maximumFractionDigits: d });
const giorno = g => `${+g.slice(8)} ${MESI[+g.slice(5, 7) - 1]}`;
const maiusc = s => s[0].toUpperCase() + s.slice(1);
// l'articolo davanti al giorno (suo, 21/11: «il 11 novembre» era sbagliato): l'1, l'8, l'11; dall'1, dall'8, dall'11
const elide = n => [1, 8, 11].includes(+n);
const ilGiorno = g => (elide(g.slice(8)) ? "l'" : 'il ') + giorno(g);
const dalN = n => (elide(n) ? "dall'" : 'dal ') + (+n);
const ultimoDelMese = m => { const [a, mm] = m.split('-').map(Number); return `${m}-${String(new Date(a, mm, 0).getDate()).padStart(2, '0')}`; };
const nomeMese = m => `${MESI[+m.slice(5, 7) - 1]} ${m.slice(0, 4)}`;

// i file di una cartella (date ordinate) e la loro fonte
const giorniDi = dir => { try { return fs.readdirSync(path.join(DATI, dir)).filter(f => /^20\d\d-\d\d-\d\d\.json$/.test(f)).map(f => f.slice(0, 10)).sort(); } catch (e) { return []; } };
const fonteCache = {};
function fonte(dir, g) {
  const k = dir + '/' + g;
  if (!(k in fonteCache)) { let s = ''; try { s = JSON.parse(fs.readFileSync(path.join(DATI, dir, g + '.json'), 'utf8')).source || ''; } catch (e) {} fonteCache[k] = s; }
  return fonteCache[k];
}
/* LE GEMELLE, come gemelleDaScartare di genera-riepiloghi.js (e la mappa): quando una regione legge piu' cartelle, le
   stazioni delle cartelle dopo la prima che stanno entro ~1 km da una della prima sono la stessa stazione letta da
   un'altra porta, e non contano. Oggi serve solo al Friuli (OSMER + MeteoHub). */
function gemelle(dirs, giorni) {
  const fuori = new Set();
  if (dirs.length < 2) return fuori;
  const pos = [];
  const visteCasa = new Set();
  for (const g of giorni) for (const s of leggi(dirs[0], g) || []) if (!visteCasa.has(s.id)) { visteCasa.add(s.id); pos.push([s.lat, s.lon]); }
  for (const dir of dirs.slice(1)) for (const g of giorni) for (const s of leggi(dir, g) || []) {
    const id = dir + ':' + s.id;
    if (!fuori.has(id) && pos.some(q => Math.abs(q[0] - s.lat) < 0.009 && Math.abs(q[1] - s.lon) < 0.013)) fuori.add(id);
  }
  return fuori;
}

/* LE PROVINCE: si mostrano solo dove la rete le scrive davvero (fra 3 e 15 valori diversi). Le reti MeteoHub ci
   mettono la sigla della regione (tutte uguali), la Liguria il comune (122 valori): li' niente tabella. */
let SIGLE = null;
function nomeProvincia(p) {
  if (/^[A-Z]{2}$/.test(p)) {
    if (!SIGLE) {   // la sigla -> i capoluoghi di quella provincia, dall'elenco dei comuni (nome|lat|lon|sigla|regione|abitanti)
      SIGLE = {};
      for (const riga of fs.readFileSync(path.join(DATI, 'elenco-paesi.txt'), 'utf8').split('\n')) {
        const c = riga.split('|');
        if (c.length >= 6 && capoluogo(c[0])) (SIGLE[c[3]] = SIGLE[c[3]] || []).includes(c[0]) || SIGLE[c[3]].push(c[0]);
      }
    }
    return (SIGLE[p] || [p]).join('-');
  }
  const t = String(p).replace(/^PROVINCIA\s+(DELLA|DELL'|DEL|DI)\s*/i, '').trim();
  return t === t.toUpperCase() && t.length > 3 ? t.toLowerCase().replace(/(^|[\s'’-])([a-zà-ü])/g, (m, a, c) => a + c.toUpperCase()) : t;
}

/* ── I NUMERI DI UNA REGIONE, MESE PER MESE ─────────────────────────────────────────────────────────────────────── */
function calcola(r, fine) {
  const casa = giorniDi(r.dirs[0]);
  const frontiera = casa.find(g => !STIMA.test(fonte(r.dirs[0], g)));
  if (!frontiera) return null;
  const tutti = [...new Set(r.dirs.flatMap(giorniDi))].filter(g => g >= frontiera && g <= fine).sort();
  const perMese = {};
  for (const g of tutti) (perMese[g.slice(0, 7)] = perMese[g.slice(0, 7)] || []).push(g);
  const mesi = [], somme = {};
  for (const [m, gg] of Object.entries(perMese)) {
    const fuori = gemelle(r.dirs, gg);
    const somma = {}, conta = {}, nome = {}, prov = {}, pos = {}, max = {};
    const medie = [];
    let presenti = 0, stimati = 0;
    for (const g of gg) {
      let qualcosa = false, t = 0, n = 0;
      if (r.dirs.some(d => GAPFILL.test(fonte(d, g)))) stimati++;
      for (const dir of r.dirs) {
        const st = leggi(dir, g);
        if (!st) continue;
        qualcosa = true;
        for (const s of st) {
          if (s.mm == null) continue;
          const id = dir + ':' + s.id;
          if (fuori.has(id) || escluso(ESC, r.k, [s.id, s.n])) continue;
          somma[id] = (somma[id] || 0) + s.mm; conta[id] = (conta[id] || 0) + 1; nome[id] = s.n; pos[id] = [s.lat, s.lon];
          if (s.p) prov[id] = s.p;
          if (!max[id] || s.mm > max[id][1]) max[id] = [g, s.mm];
          t += s.mm; n++;
        }
      }
      if (!qualcosa) continue;
      presenti++;
      if (n) medie.push([g, t / n]);
    }
    if (!presenti) continue;
    const ids = Object.keys(somma).filter(id => conta[id] >= presenti * (COPERTURA[r.k] || 0.6)).sort();
    if (!ids.length) continue;
    somme[m] = Object.fromEntries(ids.map(id => [id.split(':').slice(1).join(':'), somma[id]]));   // per le zone, per id
    const media = ids.reduce((a, id) => a + somma[id], 0) / ids.length;
    const provinceSi = (() => { const v = new Set(ids.map(id => prov[id]).filter(Boolean)); return v.size >= 3 && v.size <= 15; })();
    const etichetta = id => provinceSi && prov[id] ? (/^[A-Z]{2}$/.test(prov[id]) ? prov[id] : nomeProvincia(prov[id])) : null;
    const top = ids.slice().sort((a, b) => somma[b] - somma[a] || String(nome[a]).localeCompare(String(nome[b]), 'it')).slice(0, 5)
      .map(id => ({ n: nome[id], p: etichetta(id), mm: +somma[id].toFixed(1) }));
    let province = null;
    if (provinceSi) {
      const per = {};
      for (const id of ids) if (prov[id]) (per[nomeProvincia(prov[id])] = per[nomeProvincia(prov[id])] || []).push(somma[id]);
      province = Object.fromEntries(Object.entries(per).map(([p, v]) => [p, +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1)]));
    }
    const piu = medie.slice().sort((a, b) => b[1] - a[1])[0];
    const rec = ids.slice().sort((a, b) => max[b][1] - max[a][1])[0];
    mesi.push({ mese: m, dal: gg[0], al: gg[gg.length - 1], intero: gg[0].endsWith('-01') && gg[gg.length - 1] === ultimoDelMese(m),
      giorni: presenti, stimati, stazioni: ids.length, media: +media.toFixed(1), giorniPioggia: medie.filter(x => x[1] >= 1).length,
      giornoPiovoso: piu ? { g: piu[0], mm: +piu[1].toFixed(1) } : null, top, province, zone: {},
      record: { n: nome[rec], p: etichetta(rec), g: max[rec][0], mm: max[rec][1], lat: pos[rec][0], lon: pos[rec][1] } });
  }
  return { frontiera, mesi, somme };
}

// la zona: la media dei suoi pluviometri, gli stessi della pagina zona (postiDellaZona), anche di un'altra regione
function mediaZona(z, m, CALC) {
  const { ids, regDi } = postiDellaZona(POSTI, z);
  const v = ids.map(id => CALC[regDi[id]] && CALC[regDi[id]].somme[m] && CALC[regDi[id]].somme[m][id]).filter(x => x != null);
  return v.length ? +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : null;
}

/* ── LA PAGINA ──────────────────────────────────────────────────────────────────────────────────────────────────── */
const ST_CSS = `
.st-grande{display:block;width:100%;height:auto;border-radius:12px;border:1px solid #c9d6e6;box-shadow:0 2px 10px rgba(15,61,110,.10)}
.st-mini{display:block;width:100%;height:auto;border-radius:8px;border:1px solid #c9d6e6;margin:8px 0 6px}
.st-barre{display:grid;gap:8px;margin:10px 0 4px}
.st-r{display:grid;grid-template-columns:44px 1fr 72px;align-items:center;gap:10px;text-decoration:none;color:inherit}
.st-m{font-weight:700;text-transform:capitalize}
.st-b{height:22px;background:#eef3f8;border-radius:6px;overflow:hidden}.st-b i{display:block;height:100%;background:#2f74e8;border-radius:6px}
.st-v{text-align:right;font-weight:700;color:var(--blu)}
.st-scorri{overflow-x:auto}.st-tab{border-collapse:collapse;width:100%}
.st-tab td,.st-tab th{text-align:right;padding:7px 9px;white-space:nowrap;border-bottom:1px solid var(--bordo)}
.st-tab td:first-child,.st-tab th:first-child{text-align:left;white-space:normal;min-width:7.5em}
.st-tab td a{font-weight:600;color:var(--blu)}
.st-prov{margin:14px 0 4px}.st-prov summary{cursor:pointer;font-weight:700;color:var(--blu);padding:8px 0;font-size:17px}
.st-scala{margin:10px 0 6px}.st-scala b{display:block;font-size:13.5px;font-weight:600;color:#5a7192;margin-bottom:4px}
.st-scala .g{height:14px;border-radius:4px;border:1px solid var(--bordo);background:linear-gradient(to right,#ffffff 0%,#ffffff 2%,#e4f1fd 5%,#badcfa 12%,#6496f0 15%,#326edc 20%,#00b4c8 28%,#00b450 35%,#008c28 42%,#78c800 49%,#dce600 55%,#ffb400 61%,#ff7800 67%,#f03200 73%,#b40000 79%,#8c00b4 85%,#c864dc 90%,#f0aaf0 95%,#ffdcff 100%)}
.st-scala .l{display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:#5a7192;margin-top:3px}
.st-rec{margin:6px 0 0 20px;line-height:1.7}.st-rec a{color:inherit;text-decoration:none}.st-rec a:hover{text-decoration:underline}.st-rec a b{color:var(--blu)}
@media(max-width:480px){.st-tab td,.st-tab th{padding:7px 5px;font-size:15px}.st-tab td:first-child{min-width:6.5em}.st-tab .v6{display:none}}
@media(max-width:483px){.st-gia .st-mini{display:none}}
`;

function pagina(r, S) {
  const k = r.k, nomeCorto = r.nomeTitolo || r.nome, gen = GEN[k] || ('di ' + r.nome);
  const mesi = S.mesi.slice().reverse();                          // dal piu' recente
  const corto = m => MESI[+m.mese.slice(5, 7) - 1];
  const ultimoIntero = mesi.find(m => m.intero) || mesi[mesi.length - 1];
  const inCorso = mesi[0].intero ? null : (mesi[0].mese === S.fine.slice(0, 7) ? mesi[0] : null);
  /* ⚠️ IN CIMA IL MESE IN CORSO (21/11/2026, suo: chi apre la pagina a novembre vuole sapere quanto ha piovuto a
     novembre); nei primi 6 giorni, quando dice ancora poco, il mese prima. Niente riga del mese prima fra il riquadro e
     la mappa (suo «Toglila»: spezzava il mese in cima e ripeteva la sua scheda). */
  const primo = inCorso && inCorso.giorni >= 7 ? inCorso : ultimoIntero;
  const interi = S.mesi.filter(m => m.intero);
  const piuDiTutti = primo === inCorso && interi.length >= 2 && interi.every(m => inCorso.media > m.media);
  const mappa = m => `${SITO}/?r=${k}&amp;da=${m.dal}&amp;a=${m.al}&amp;s=p`;
  const ga = da => `onclick="try{gtag('event','apri_mappa',{da:'storico-${k}-${da}'})}catch(e){}"`;
  const lab = t => t.p ? `${t.n} (${t.p})` : t.n;
  const top3 = m => m.top.slice(0, 3).map(t => `<b>${attr(lab(t))}</b> ${num(t.mm)} mm`).join(', ');
  const stime = m => m.stimati ? ` ${m.stimati === 1 ? 'Un giorno coperto' : m.stimati + ' giorni coperti'} da una stima del modello, con la rete ferma.` : '';
  const foto = (m, mini) => `${ANTEPRIME}/${k}-storico-${m.mese}${mini ? '-mini.webp' : '.jpg'}`;
  const nascondi = `onerror="this.parentNode.style.display='none'"`;

  const verdetto = `<div class="verdetto"><div class="si">${maiusc(nomeMese(primo.mese))}</div><div class="gr">${num(primo.media, 0)} mm<small>di media</small></div>`
    + `<div class="top">Dove ha piovuto di più: ${top3(primo)}.</div>`
    + `<div class="dett">${primo === inCorso ? `${maiusc(dalN(primo.dal.slice(8)))} al ${giorno(primo.al)}, fino a ieri${piuDiTutti ? ': già più di qualunque mese intero dello storico' : ''}. ` : ''}`
    + `${primo.giorniPioggia} giorni di pioggia${primo.giornoPiovoso ? `; il più piovoso ${primo === inCorso ? 'finora ' : ''}${ilGiorno(primo.giornoPiovoso.g)}, con ${num(primo.giornoPiovoso.mm)} mm di media` : ''}. Media di ${primo.stazioni} pluviometri.${stime(primo)}</div>`
    + `<div class="capo-btns"><a class="ieri-btn" href="${mappa(primo)}" ${ga('riquadro')}><b>Apri la mappa di ${corto(primo)}</b><i>→</i><small>la pioggia del mese in tutte le località</small></a></div>`
    + `<div class="mk-porte"><a href="${SITO}/previsioni/?r=${k}" ${ga('porta-previsioni')}><span>☀️</span>Previsioni</a><a href="${SITO}/${k}/adesso/" ${ga('porta-radar')}><span>📡</span>Radar piogge</a>`
    + `<a href="${SITO}/?r=${k}&amp;boschi=1" ${ga('porta-boschi')}><span>🌲</span>Mappa boschi</a><a href="${SITO}/?r=${k}&amp;boschi=1&amp;sat=1" ${ga('porta-satellite')}><span>🛰️</span>Boschi + satellite</a></div></div>`;
  /* ⚠️ LA SCALA DEI COLORI (21/11/2026, suo «non si vede la scala colori delle piogge», poi «Scala nella pagina»): le
     foto sono la mappa pulita, senza il pannello, quindi la scala sta qui. E' la stessa della mappa (.grad e .grad-l di
     index.html, STOPS) e non cambia col periodo: una sotto la mappa grande, una sopra le schede per tutte le miniature. */
  const scala = `<div class="st-scala"><b>Millimetri caduti nel mese</b><div class="g"></div><div class="l"><span>0</span><span>20</span><span>60</span><span>125</span><span>200</span><span>300+</span></div></div>`;
  const grande = `<h2>La mappa di ${corto(primo)}</h2>
<a href="${mappa(primo)}" ${ga('mappa-grande')}><img class="st-grande" src="${foto(primo)}" ${nascondi} alt="La mappa delle piogge di ${nomeMese(primo.mese)} ${r.prep} ${attr(r.nome)}, pluviometro per pluviometro" width="1600" height="916"></a>
${scala}
<p class="nota">La mappa vera${primo === inCorso ? ', fino a ieri' : ''}: toccala per aprirla e guardare ogni pluviometro.</p>`;
  const max = Math.max(...S.mesi.map(m => m.media));
  const parziali = S.mesi.filter(m => !m.intero).map(m => m === S.mesi[0] && m.dal !== m.mese + '-01' ? `${corto(m)} ${dalN(m.dal.slice(8))}` : `${corto(m)} fino a ${m === inCorso ? 'ieri' : giorno(m.al)}`);
  const barre = `<div class="st-barre">${S.mesi.map(m => `<a class="st-r" href="${mappa(m)}" ${ga('barra')}><span class="st-m">${corto(m).slice(0, 3)}${m.intero ? '' : '*'}</span>`
    + `<span class="st-b"><i style="width:${Math.max(2, Math.round(m.media / max * 100))}%"></i></span><span class="st-v">${num(m.media, 0)} mm</span></a>`).join('')}</div>`
    + (parziali.length ? `<p class="nota">* mese non intero: ${parziali.join(', ')}.</p>` : '');
  const dalAl = m => m.intero ? '' : `${maiusc(dalN(m.dal.slice(8)))} al ${giorno(m.al)}${m === inCorso ? ', fino a ieri' : ''}. `;
  /* ⚠️ LE SCHEDE IN VISTA SONO LE ULTIME 6 (21/11/2026): la Lombardia ha gia' 11 mesi e fra un anno saranno 23; con la
     miniatura ogni scheda al telefono e' alta ~600 px. Le altre stanno in una tendina chiusa (loading=lazy).
     ⚠️ LA SCHEDA DEL MESE IN CIMA NON HA LA MINIATURA AL TELEFONO (21/11/2026, scheda 141, suo «si vede due volte
     novembre la mappa di fila», scelta «A, solo al telefono»): con la griglia a una colonna la miniatura e' larga quasi
     quanto la mappa grande poco sopra. La classe st-gia la toglie solo sotto i 484 px, dove .griglia (minmax 220px)
     ha una colonna sola; da due colonne in su resta, se no la fila delle schede non e' piu' simmetrica. */
  const scheda = m => `<div class="card${m === primo ? ' st-gia' : ''}"><h3>${maiusc(nomeMese(m.mese))}</h3><div class="numerone">${num(m.media, 0)} mm <small>di media</small></div>`
    + `<a href="${mappa(m)}" ${ga('miniatura')}><img class="st-mini" src="${foto(m, true)}" ${nascondi} loading="lazy" width="640" height="366" alt="La pioggia di ${nomeMese(m.mese)} ${r.prep} ${attr(r.nome)} sulla mappa"></a>`
    + `<ol class="top-staz">${m.top.slice(0, 3).map(t => `<li>${attr(lab(t))} — ${num(t.mm)} mm</li>`).join('')}</ol>`
    + `<p class="nota">${dalAl(m)}${m.giorniPioggia} giorni di pioggia${m.giornoPiovoso ? `; il più piovoso ${ilGiorno(m.giornoPiovoso.g)} (${num(m.giornoPiovoso.mm)} mm di media)` : ''}.${stime(m)}</p>`
    + `<a class="vai" href="${mappa(m)}" ${ga('scheda')}>Apri la mappa →</a></div>`;
  const carte = `<div class="griglia">\n${mesi.slice(0, 6).map(scheda).join('\n')}\n</div>`
    + (mesi.length > 6 ? `\n<details class="st-prov"><summary>Gli altri mesi (${mesi.length - 6})</summary><div class="griglia">\n${mesi.slice(6).map(scheda).join('\n')}\n</div></details>` : '');
  /* nelle tabelle i mesi dal piu' recente: al telefono il mese in cima sta accanto al nome, non fuori schermo.
     ⚠️ AL MASSIMO 12 MESI, AL TELEFONO 5 (21/11/2026): con gli 11 mesi della Lombardia la tabella delle zone usciva dallo
     schermo del telefono. Le colonne dopo la quinta hanno la classe v6; i mesi prima stanno nelle schede e nelle barre. */
  const mesiTab = mesi.slice(0, 12), cl = i => i >= 5 ? ' class="v6"' : '';
  const testaMesi = mesiTab.map((m, i) => `<th${cl(i)}>${corto(m).slice(0, 3)}${m.intero ? '' : '*'}</th>`).join('');
  const notaTel = mesiTab.length > 5 ? ' Al telefono gli ultimi 5 mesi.' : '';
  const zone = S.zone.filter(z => mesi.some(m => m.zone[z.slug] != null)).sort((a, b) => (primo.zone[b.slug] || 0) - (primo.zone[a.slug] || 0));
  const tabZone = !zone.length ? '' : `<h2>Zona per zona</h2>
<div class="st-scorri"><table class="st-tab"><thead><tr><th>Zona</th>${testaMesi}</tr></thead><tbody>`
    + zone.map(z => `<tr><td><a href="${SITO}/zone/${z.slug}/" ${ga('zona')}>${attr(z.n)}</a></td>${mesiTab.map((m, i) => `<td${cl(i)}>${m.zone[z.slug] == null ? '—' : num(m.zone[z.slug], 0)}</td>`).join('')}</tr>`).join('')
    + `</tbody></table></div><p class="nota">Millimetri, media dei pluviometri di ogni zona; dalla più bagnata a ${corto(primo)}. Ogni nome porta alla pagina della zona.${notaTel}</p>`;
  const nomiProv = [...new Set(mesi.flatMap(m => Object.keys(m.province || {})))].sort((a, b) => ((primo.province || {})[b] || 0) - ((primo.province || {})[a] || 0));
  const tabProv = nomiProv.length < 3 ? '' : `<details class="st-prov"><summary>Provincia per provincia</summary><div class="st-scorri"><table class="st-tab"><thead><tr><th>Provincia</th>${testaMesi}</tr></thead><tbody>`
    + nomiProv.map(p => `<tr><td>${attr(p)}</td>${mesiTab.map((m, i) => `<td${cl(i)}>${!m.province || m.province[p] == null ? '—' : num(m.province[p], 0)}</td>`).join('')}</tr>`).join('')
    + `</tbody></table></div><p class="nota">Millimetri, media dei pluviometri di ogni provincia.${notaTel}</p></details>`;
  const record = `<ul class="st-rec">${mesi.map(m => `<li><a href="${SITO}/?r=${k}&amp;da=${m.record.g}&amp;a=${m.record.g}&amp;pl=${m.record.lat},${m.record.lon}&amp;pn=${encodeURIComponent(m.record.n)}&amp;s=p" ${ga('record')}>`
    + `<b>${maiusc(corto(m))}:</b> ${num(m.record.mm)} mm in un giorno a ${attr(lab(m.record))}, ${ilGiorno(m.record.g)} →</a></li>`).join('')}</ul>
<p class="nota">Ogni riga apre la mappa di quel giorno sul pluviometro.</p>`;

  const BRICIOLA = [['Mappa pluviometrica', SITO + '/'], [nomeCorto, `${SITO}/${k}/`], ['Storico', null]];
  const titolo = [`Storico precipitazioni ${nomeCorto}: la pioggia mese per mese`, `Storico precipitazioni ${nomeCorto}: mese per mese`,
    `Storico precipitazioni ${nomeCorto}`].find(t => t.length <= 62);
  const ag = r.agenziaCorta || r.agenzia;
  const descr = [`Quanta pioggia è caduta ${r.prep} ${r.nome} mese per mese: la media di ${primo.stazioni} pluviometri ${diEnte(ag)}, i giorni di pioggia, il giorno più piovoso, la mappa di ogni mese.`,
    `Quanta pioggia è caduta ${r.prep} ${r.nome} mese per mese: la media di ${primo.stazioni} pluviometri, i giorni di pioggia e la mappa di ogni mese.`,
    `La pioggia ${r.prep} ${r.nome} mese per mese, dai pluviometri: media, giorni di pioggia e la mappa di ogni mese.`].find(t => t.length <= 158);
  const fonteFooter = r.url ? `<a href="${r.url}" target="_blank" rel="noopener">${r.agenzia}</a>` : r.agenzia;
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${attr(titolo)}</title>
<meta name="description" content="${attr(descr)}">
<link rel="canonical" href="${SITO}/${k}/storico/">
${briciolaJson(BRICIOLA)}
<meta property="og:title" content="${attr(titolo)}">
<meta property="og:description" content="${attr(descr)}">
<meta property="og:image" content="${foto(primo)}">
<meta name="twitter:card" content="summary_large_image">
<meta property="og:url" content="${SITO}/${k}/storico/">
<meta property="og:type" content="website">
<!-- Google tag: il config solo sul dominio vero, come nelle pagine regione -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  if (/(^|\\.)avventuremicologiche\\.it$/.test(location.hostname)) {
    gtag('config', '${GA_ID}');
  }
</script>
<style>
${STILE_BASE}
${STILE_NUOVO}
${STILE_IERI}
${RILIEVO}${IERI_GRANDE}${METEO_CSS}${BRIC_CSS}${TESTATA_CSS}${ST_CSS}</style>
</head>
<body>
${testata({ sito: SITO, canale: CANALE, reg: k, ga: 'storico-' + k, attiva: 'storico' })}
<main data-fine="${S.fine}">
${briciolaHtml(BRICIOLA)}
<h1>${attr(titolo)}</h1>
<p class="sotto"><b>Quanta pioggia è caduta ${r.prep} ${attr(r.nome)}, mese per mese</b>: la media di ${primo.stazioni} pluviometri ${diEnte(r.agenzia)}, i giorni di pioggia, il giorno più piovoso, zona per zona. Lo storico misurato parte ${dalN(S.frontiera.slice(8))} ${MESI[+S.frontiera.slice(5, 7) - 1]} ${S.frontiera.slice(0, 4)}.</p>
${verdetto}
${grande}
<h2>La pioggia mese per mese</h2>
${barre}
<h2>I pluviometri più bagnati</h2>
${scala}
${carte}
${tabZone}
${tabProv}
<h2>I giorni più bagnati</h2>
${record}
<h2>Ieri e gli ultimi 30 giorni</h2>
<p>La pioggia di ieri, degli ultimi 7, 20 e 30 giorni, zona per zona: <a href="${SITO}/${k}/" ${ga('regione')}>Pluviometria ${attr(nomeCorto)}: dove ha piovuto</a>. Per la pioggia che cade adesso: <a href="${SITO}/${k}/adesso/" ${ga('radar')}>Radar meteo ${attr(nomeCorto)}</a>.</p>
<div class="noioso">
<h2>Come sono fatti questi numeri</h2>
<p>Ogni mese è la media dei pluviometri che hanno misurato almeno il ${Math.round((COPERTURA[k] || 0.6) * 100)}% dei suoi giorni, la stessa regola della mappa; un giorno di pioggia è un giorno in cui la media della regione arriva a 1 mm. I pluviometri che la mappa esclude qui non contano. La rete ${diEnte(r.agenzia)} è sulla mappa ${dalN(S.frontiera.slice(8))} ${MESI[+S.frontiera.slice(5, 7) - 1]} ${S.frontiera.slice(0, 4)}: per i mesi di prima ci sono solo stime da modello, segnate sulla mappa, e qui non entrano. Il mese in corso si aggiorna ogni mattina; un mese nuovo si aggiunge da solo.</p>
</div>
</main>

<footer>
${navAltre('regione', k)}
  Dati: ${fonteFooter} ·
  <a href="${SITO}/fonti">tutte le fonti e licenze</a> ·
  <a href="https://avventuremicologiche.it">Avventure Micologiche</a><br>
  La mappa copre Italia, Svizzera, Austria, Francia e Slovenia — 5000+ stazioni.
</footer>
</body>
</html>
`;
}

/* ── IL GIRO ────────────────────────────────────────────────────────────────────────────────────────────────────── */
// l'ultimo giorno completo: quello del riepilogo della pagina regione (data/riepiloghi/<regione>.json), cosi' le due
// pagine dicono lo stesso «ieri»; se manca, ieri
function fineDi(k) {
  try { const u = JSON.parse(fs.readFileSync(path.join(DATI, 'riepiloghi', k + '.json'), 'utf8')).periodi['1'].ultimo; if (u) return u; } catch (e) {}
  return giorniIndietro(oggiItalia(), 1)[0];
}
function leggiRiassunto(k) { try { return JSON.parse(fs.readFileSync(path.join(USCITA, k + '.json'), 'utf8')); } catch (e) { return null; } }

if (require.main === module) {
  const SOLO = process.env.SOLO || '';
  const lista = LISTA.filter(r => !SOLO || r.k === SOLO);
  if (SOLO && !lista.length) { console.error('regione sconosciuta: ' + SOLO); process.exit(1); }
  // prima i numeri di TUTTE le regioni (le zone possono usare pluviometri di una regione vicina), poi le pagine
  const CALC = {};
  for (const r of LISTA) CALC[r.k] = Object.assign(calcola(r, fineDi(r.k)) || { mesi: [], somme: {} }, { fine: fineDi(r.k) });
  fs.mkdirSync(USCITA, { recursive: true });
  let n = 0;
  for (const r of lista) {
    const C = CALC[r.k];
    if (!C.mesi.length) { console.log(`  ${r.k}: nessun mese misurato, pagina non scritta`); continue; }
    const zone = ZONE.filter(z => z.reg === r.k).map(z => Object.assign({}, z, { slug: slug(z.n) }))
      .filter(z => fs.existsSync(path.join(RADICE, 'zone', z.slug, 'index.html')));
    for (const m of C.mesi) for (const z of zone) { const v = mediaZona(z, m.mese, CALC); if (v != null) m.zone[z.slug] = v; }
    // il riassunto: i mesi ricalcolati prendono il posto dei vecchi; quelli i cui file non ci sono piu' restano
    const vecchio = leggiRiassunto(r.k), nuovi = new Set(C.mesi.map(m => m.mese));
    const tenuti = vecchio ? vecchio.mesi.filter(m => !nuovi.has(m.mese) && m.mese < C.mesi[0].mese) : [];
    const S = { regione: r.k, nome: r.nome, frontiera: vecchio && vecchio.frontiera < C.frontiera ? vecchio.frontiera : C.frontiera, fine: C.fine,
      zone: zone.map(z => ({ slug: z.slug, n: z.n })), mesi: tenuti.concat(C.mesi) };
    const prima = vecchio ? JSON.stringify(Object.assign({}, vecchio, { aggiornato: null })) : '';
    if (JSON.stringify(Object.assign({}, S, { aggiornato: null })) !== prima) S.aggiornato = oggiItalia();
    else S.aggiornato = vecchio.aggiornato;
    fs.writeFileSync(path.join(USCITA, r.k + '.json'), JSON.stringify(S, null, 1) + '\n');
    scrivi(path.join(RADICE, r.k, 'storico', 'index.html'), senzaCommenti(pagina(r, S)), true);
    n++;
    const ult = S.mesi[S.mesi.length - 1];
    console.log(`  ${r.k.padEnd(12)} ${S.mesi.length} mesi dal ${S.frontiera}, ultimo ${ult.mese} (${ult.giorni} giorni) ${num(ult.media, 0)} mm, ${zone.length} zone`);
  }
  if (SOLO) { console.log(`${n} pagina scritta (SOLO=${SOLO}), sitemap non toccata.`); process.exit(0); }
  scriviSitemap(SITO, RADICE);
  console.log(`${n} pagine «Storico precipitazioni» scritte.`);
}

module.exports = { LISTA_STORICO: LISTA.map(r => r.k), calcola };
