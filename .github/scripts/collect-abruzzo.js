/**
 * collect-abruzzo.js — L'ABRUZZO SENZA OPEN-METEO  (PROVA del 26/10/2026, solo in locale)
 * =====================================================================================
 *
 * L'Abruzzo non pubblica i suoi pluviometri (Polaris ha 15 giorni di ritardo e vuole il login) e fino a
 * oggi la mappa lo calcolava dal vivo con Open-Meteo su 40 paesi: stime, e con un'API che vieta i siti con
 * pubblicita'. Questo collector scrive data/abruzzo/<giorno>.json con due famiglie di punti:
 *
 *  1. MeteoNetwork, rete `mnw` su MeteoHub (CC BY 4.0, attribuzione «MeteoNetwork Association OdV»): le
 *     stazioni amatoriali DENTRO l'Abruzzo, solo con almeno MIN_ORE ore lette. `rete:'mnw'`. Dal 3/11/2026 anche
 *     la temperatura minima e massima (`t`, vedi temperatureMnw).
 *  2. Il modello ICON-2I di ItaliaMeteo (CC BY 4.0, file aperti di MeteoHub): ~145 punti sui paesi, uniformi
 *     su tutta la regione (vedi PUNTI_KM). `rete:'icon'` e `stima:1`. La MAPPA tiene solo quelli lontani da un
 *     pluviometro vero; qui si scrivono tutti, cosi' servono anche a misurare quanto sbaglia il modello
 *     dove una stazione c'e'. Dal 3/11/2026 un punto con un pluviometro vero entro CORR_KM e' CORRETTO con
 *     quanto ICON ha sbagliato su di lui (vedi correggiIcon): `mm` corretto, `grezzo` quello di ICON, `corr` il fattore.
 *
 * I pluviometri ufficiali delle regioni vicine (Lazio, Marche, Molise) NON stanno qui: la mappa li legge
 * dalle loro cartelle meteohub-*, come il Friuli fa con le cinque stazioni venete del Cadore.
 *
 * In piu', data/abruzzo/icon-pluviometri/<giorno>.json (27/10/2026): ICON nel punto esatto di ogni pluviometro
 * VERO (gli ufficiali di Lazio, Marche e Molise entro CONFINE_KM dal confine e le MeteoNetwork), stessa media 3x3.
 * La mappa non lo legge: serve al confronto ICON / Open-Meteo / pluviometri (claudio\abruzzo-prova\), che cosi' si
 * puo' fare quando si vuole e non entro gli ~8 giorni dei file ICON. Open-Meteo lo chiede il confronto, non questo
 * giro. Stessi id del confronto: '<cartella>:<id>' e 'mnw:<codice>'.
 *
 * ICON-2I, COME SI LEGGE SENZA LIBRERIE: in lib-icon2i.js (dal 2/11/2026, la usano anche i due script che tappano
 * i buchi delle altre reti). Il giorno e' quello italiano, ogni ora dalla corsa piu' recente partita prima di lei.
 *
 * ⚠️ I file aperti di ICON restano ~8 giorni e MeteoNetwork da anonimi ~10: oltre non si recupera.
 *
 * Uso: node collect-abruzzo.js                (ieri e i due giorni prima)
 *      GIORNI=7 node collect-abruzzo.js       (gli ultimi 7)
 *      DATA=2026-10-24 node collect-abruzzo.js
 *      SOLO_CORREZIONE=1 GIORNI=8 node collect-abruzzo.js   (rifa' solo la correzione sui file gia' scritti, senza rete)
 */
const fs = require('fs');
const path = require('path');
const { MIN_ORE, creaOre, segna, intensita } = require('./lib-intensita.js');
const { finestraGiorno } = require('./lib-giorno-italiano.js');
const { quoteTerrarium } = require('./lib-terrarium.js');
const { MH, UA, G, corseIcon, oraIcon, iconGiorno } = require('./lib-icon2i.js');
const { escluse } = require('./lib-escluse.js');

const RADICE = path.join(__dirname, '../..');
const CARTELLA = path.join(RADICE, 'data', 'abruzzo');
const ANAGRAFE = path.join(CARTELLA, 'anagrafe.json');   // nomi e quote, assegnati una volta e tenuti

// I PUNTI DELLA STIMA stanno sui PAESI, non su una griglia (27/10/2026, suo: «i paesi piu' grandi, uniformi su
// tutto l'Abruzzo, una disposizione naturale»): la griglia ogni ~9 km in mappa si riconosceva a colpo d'occhio.
//  1. i comuni dal piu' popoloso: un comune si prende se dista almeno PUNTI_KM da quelli gia' presi;
//  2. i buchi: finche' un punto della regione resta oltre BUCO_KM da tutti, nel buco piu' largo va il posto
//     abitato (GeoNames, luoghi/: gli stessi della ricerca del sito) piu' popoloso entro 3,5 km; se non ce n'e',
//     un punto nel buco stesso col nome del posto piu' vicino.
// Misurato il 27/10: 145 punti (101 comuni, 44 nei buchi) contro i 148 della griglia, nessun punto della regione
// oltre 7,5 km; 23 comuni su 27 sopra i 10.000 abitanti hanno il loro punto (gli altri quattro stanno sulla costa a
// meno di 7 km da uno piu' grande). Prova col disegno: claudio\abruzzo-prova\scegli-punti-stima.py.
// Il valore di un punto e' la media delle 3x3 celle intorno (~7 km): un modello a 2,2 km sbaglia di qualche km
// dove mette il temporale, e la cella singola raddoppierebbe l'errore (pioggia dove non e' caduta, niente dove e'
// caduta). Se la regola cambia si alza PUNTI_VERSIONE: l'anagrafe rifa' i punti al giro dopo.
const PUNTI_KM = 7, BUCO_KM = 7.5, PUNTI_VERSIONE = 2;

// ─── Confine dell'Abruzzo e paesi (per i nomi) ─────────────────────────────
const geo = JSON.parse(fs.readFileSync(path.join(RADICE, 'italia-regioni-confine.geojson'), 'utf8'));
const feat = geo.features.find(f => /abruzz/i.test(f.properties.reg_name || ''));
const POLI = feat.geometry.type === 'Polygon' ? [feat.geometry.coordinates] : feat.geometry.coordinates;
function inAnello(lon, lat, r) {
  let c = false;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [xi, yi] = r[i], [xj, yj] = r[j];
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
const inAbruzzo = (lat, lon) => POLI.some(p => inAnello(lon, lat, p[0]) && !p.slice(1).some(h => inAnello(lon, lat, h)));
const km = (a1, o1, a2, o2) => Math.hypot((o2 - o1) * Math.cos((a1 + a2) * Math.PI / 360) * 111.32, (a2 - a1) * 110.57);

const PAESI = fs.readFileSync(path.join(RADICE, 'data', 'elenco-paesi.txt'), 'utf8').split('\n')
  .map(r => r.split('|')).filter(c => c[4] === 'abruzzo')
  .map(c => ({ n: c[0], lat: +c[1], lon: +c[2], p: c[3], pop: +c[5] || 0 }));
function paeseVicino(lat, lon) {
  let best = null, d = Infinity;
  for (const p of PAESI) { const x = km(lat, lon, p.lat, p.lon); if (x < d) { d = x; best = p; } }
  return best;
}

// ─── Giorni ────────────────────────────────────────────────────────────────
function giorniDaFare() {
  if (process.env.DATA) return [process.env.DATA];
  const n = parseInt(process.env.GIORNI || '3', 10), out = [];
  const oggi = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(new Date());
  for (let g = 1; g <= n; g++) {
    const d = new Date(oggi + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - g);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

async function json(url, ms = 60000) {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error('HTTP ' + r.status + ' su ' + url);
  return r.json();
}

// ─── 1. MeteoNetwork ───────────────────────────────────────────────────────
// Un giorno a richiesta (da anonimi MeteoHub ne da' al massimo tre). Le letture sono accumuli che
// FINISCONO al loro reftime (UTC): l'ora e' quella di (ref - 1 ms), il giorno e' (inizio, fine].
async function meteoNetwork(giorno) {
  const { start, end } = finestraGiorno(giorno);
  const f = t => new Date(t).toISOString().slice(0, 16).replace('T', ' ');
  const q = `reftime: >=${f(start)},<=${f(end)};product:B13011;license:CCBY_COMPLIANT`;
  const d = await json(`${MH}/api/observations?networks=mnw&q=${encodeURIComponent(q)}`, 120000);
  const out = [];
  for (const x of d.data || []) {
    const { lat, lon } = x.stat;
    if (!(lat > 41.6 && lat < 43.0 && lon > 13.0 && lon < 14.9) || !inAbruzzo(lat, lon)) continue;
    const cod = ((x.stat.details || []).find(v => v.var === 'B01019') || {}).val;
    if (!cod) continue;
    // la serie piu' fitta, come collect-meteohub.js
    const serie = (x.prod || []).filter(p => p.var === 'B13011').sort((a, b) => b.val.length - a.val.length)[0];
    if (!serie) continue;
    const ore = creaOre();
    let mm = 0;
    for (const v of serie.val) {
      const t = Date.parse(v.ref + 'Z');
      if (!(t > start && t <= end) || typeof v.val !== 'number') continue;
      const chiave = new Date(t - 1).toISOString().slice(0, 13);
      segna(ore, chiave, v.val);
      if (v.val > 0) mm += v.val;
    }
    const h = Object.keys(ore).length;
    if (h < MIN_ORE) continue;   // giornata bucata: meglio nessun pallino che un totale di mezza giornata
    out.push({ cod, lat, lon, h, mm: Math.round(mm * 10) / 10, i: intensita(ore) });
  }
  return out;
}

// ─── 1b. La temperatura delle MeteoNetwork (3/11/2026, scheda 115, suo «aggiungile») ─────
// Fino al 3/11 si chiedeva solo la pioggia e l'Abruzzo non aveva temperature. Stesse regole di collect-meteohub.js
// (meteoDelGiorno): B12101 in kelvin se una lettura supera 100 (allora sotto e' un dato non pervenuto), serie tutta a
// zero = termometro muto, una lettura che si stacca di oltre 10° dalla precedente e dalla successiva si scarta, fra -45
// e 50 °C, almeno MIN_ORE_METEO ore coperte. Scrive `t: [minima, massima]` per codice. Sulla mappa le temperature
// entrano solo dopo il controllo coi vicini di genera-temperature-ieri.js. Una richiesta in piu' per giorno.
const MIN_ORE_METEO = 20;
async function temperatureMnw(giorno) {
  const { start, end } = finestraGiorno(giorno);
  const f = t => new Date(t).toISOString().slice(0, 16).replace('T', ' ');
  const q = `reftime: >=${f(start)},<=${f(end)};product:B12101;license:CCBY_COMPLIANT`;
  const d = await json(`${MH}/api/observations?networks=mnw&q=${encodeURIComponent(q)}`, 120000);
  const out = {};
  for (const x of d.data || []) {
    const { lat, lon } = x.stat;
    if (!(lat > 41.6 && lat < 43.0 && lon > 13.0 && lon < 14.9) || !inAbruzzo(lat, lon)) continue;
    const cod = ((x.stat.details || []).find(v => v.var === 'B01019') || {}).val;
    const serie = (x.prod || []).filter(p => p.var === 'B12101').sort((a, b) => b.val.length - a.val.length)[0];
    if (!cod || !serie) continue;
    const letture = serie.val.filter(v => { const t = Date.parse(v.ref + 'Z'); return t > start && t <= end && typeof v.val === 'number'; });
    if (!letture.length || letture.every(v => v.val === 0)) continue;   // tutta zeri: termometro muto
    const kelvin = letture.some(v => v.val > 100);
    const s = letture.filter(v => !kelvin || v.val > 100).map(v => ({ ref: v.ref, c: v.val > 100 ? v.val - 273.15 : v.val }))
      .filter(v => v.c >= -45 && v.c <= 50).sort((a, b) => (a.ref < b.ref ? -1 : a.ref > b.ref ? 1 : 0));
    const vals = s.filter((v, i) => !(i > 0 && i < s.length - 1 && Math.abs(v.c - s[i - 1].c) > 10 && Math.abs(v.c - s[i + 1].c) > 10)).map(v => v.c);
    const ore = new Set(letture.map(v => v.ref.slice(11, 13))).size;
    if (vals.length && ore >= MIN_ORE_METEO) out[cod] = [Math.round(Math.min(...vals) * 10) / 10, Math.round(Math.max(...vals) * 10) / 10];
  }
  return out;
}

// ─── 2. ICON-2I: la lettura sta in lib-icon2i.js (corseIcon, iconGiorno) ─────

// ─── Anagrafe: nomi e quote assegnati una volta ────────────────────────────
// I nomi devono restare uguali da un giorno all'altro (il grafico della scheda cerca la stazione per
// nome nei file dei giorni), quindi si scrivono la prima volta e poi si rileggono.
function caricaAnagrafe() {
  try { return JSON.parse(fs.readFileSync(ANAGRAFE, 'utf8')); } catch (e) { return { mnw: {}, icon: [] }; }
}
async function puntiIcon(an) {
  if (an.icon.length && an.iconV === PUNTI_VERSIONE) return an.icon;
  const pts = [];
  for (const c of [...PAESI].sort((a, b) => b.pop - a.pop)) {
    if (pts.every(p => km(c.lat, c.lon, p.lat, p.lon) >= PUNTI_KM)) pts.push({ n: c.n, lat: c.lat, lon: c.lon });
  }
  const luoghi = [];
  for (const f of fs.readdirSync(path.join(RADICE, 'luoghi')).filter(f => f.endsWith('.tsv'))) {
    for (const r of fs.readFileSync(path.join(RADICE, 'luoghi', f), 'utf8').split('\n')) {
      const c = r.split('\t');
      if (c[7] === 'Abruzzo' && /^PPL/.test(c[11] || '')) luoghi.push({ n: c[3], lat: +c[4], lon: +c[5], pop: +c[10] || 0 });
    }
  }
  const tutti = luoghi.concat(PAESI);
  // la regione a celle di ~1 km, e per ogni cella quanto dista il punto piu' vicino
  const celle = [];
  for (let lat = 41.66; lat <= 42.92; lat += 0.009) for (let lon = 13.0; lon <= 14.82; lon += 0.012) if (inAbruzzo(lat, lon)) celle.push([lat, lon]);
  const d = celle.map(([a, o]) => Math.min(...pts.map(p => km(a, o, p.lat, p.lon))));
  for (;;) {
    let k = 0;
    d.forEach((x, i) => { if (x > d[k]) k = i; });
    if (d[k] <= BUCO_KM) break;
    const [a, o] = celle[k];
    const cand = tutti.filter(l => km(a, o, l.lat, l.lon) <= 3.5 && inAbruzzo(l.lat, l.lon) &&
      pts.every(p => km(l.lat, l.lon, p.lat, p.lon) >= PUNTI_KM * 0.7))
      .sort((x, y) => (y.pop - x.pop) || (km(a, o, x.lat, x.lon) - km(a, o, y.lat, y.lon)));
    let p;
    if (cand.length) p = { n: cand[0].n, lat: cand[0].lat, lon: cand[0].lon };
    else {
      const v = tutti.reduce((m, l) => (km(a, o, l.lat, l.lon) < km(a, o, m.lat, m.lon) ? l : m));
      p = { n: v.n, lat: Math.round(a * 1000) / 1000, lon: Math.round(o * 1000) / 1000 };
    }
    pts.push(p);
    celle.forEach(([ca, co], i) => { const x = km(ca, co, p.lat, p.lon); if (x < d[i]) d[i] = x; });
  }
  const q = await quoteTerrarium(pts);
  const usati = {};
  an.icon = pts.map((pt, k) => {
    usati[pt.n] = (usati[pt.n] || 0) + 1;
    return { id: 'icon_' + pt.lat.toFixed(3) + '_' + pt.lon.toFixed(3), n: pt.n, lat: pt.lat, lon: pt.lon, q: q[k], p: paeseVicino(pt.lat, pt.lon).p };
  });
  // due punti con lo stesso nome (non capita il 27/10, ma GeoNames ha molte «San Martino»): il secondo prende un 2
  const conta = {};
  an.icon.forEach(pt => { if (usati[pt.n] > 1) { conta[pt.n] = (conta[pt.n] || 0) + 1; if (conta[pt.n] > 1) pt.n += ' ' + conta[pt.n]; } });
  an.iconV = PUNTI_VERSIONE;
  console.log(`📌 ${an.icon.length} punti di stima sui paesi (comuni ogni ${PUNTI_KM} km, buchi fino a ${BUCO_KM} km)`);
  return an.icon;
}
async function nomiMnw(an, staz) {
  const nuove = staz.filter(s => !an.mnw[s.cod]);
  if (!nuove.length) return;
  const q = await quoteTerrarium(nuove);
  nuove.forEach((s, k) => {
    const pv = paeseVicino(s.lat, s.lon);
    let n = pv.n;
    const presi = new Set(Object.values(an.mnw).map(x => x.n));
    for (let i = 2; presi.has(n); i++) n = pv.n + ' ' + i;
    an.mnw[s.cod] = { n, p: pv.p, q: q[k] };
  });
}

// ─── Le stazioni MeteoNetwork FERME ────────────────────────────────────────
// Una stazione amatoriale puo' restare a zero col pluviometro intasato o rotto: in mappa diventa un buco
// bianco in mezzo alla pioggia (L'Aquila abr034, 27/10/2026: 0,0 mm in 8 giorni contro 29,2 dei vicini).
// Stessa idea di check-stazioni-ferme.js, sui soli pluviometri VERI vicini (le altre MeteoNetwork e gli
// ufficiali di confine entro FERME_KM), su una finestra corta: si guardano i giorni con almeno due
// testimoni, si somma lei e si somma la mediana dei testimoni; FERMA se i testimoni fanno almeno
// FERME_MIN_MM e lei meno del FERME_QUOTA. Si rifa' a ogni giro: se torna a misurare, rientra da sola.
// Non tocca un dato: segna `ferma` nell'anagrafe e la mappa non la disegna.
// Misurato il 27/10 su 19 stazioni: fuori solo abr034; la piu' bassa dopo e' Castel di Sangro al 26% (piu'
// asciutta dei vicini di montagna del Molise, ma misura: resta).
const FERME_KM = 25, FERME_GIORNI = 30, FERME_MIN_MM = 20, FERME_QUOTA = 0.15, FERME_MIN_GIORNI = 3;
const VICINE = ['meteohub-lazio', 'meteohub-marche', 'meteohub-molise'];

// ─── ICON sui pluviometri veri, per il confronto ───────────────────────────
// Gli stessi pluviometri e gli stessi id di confronto-raccogli.js (banco di lavoro): gli ufficiali delle tre
// vicine entro CONFINE_KM dal confine abruzzese, dai file del giorno nel checkout (non le stime che coprono i
// buchi), e le MeteoNetwork del giorno. Se il file di una vicina non c'e' ancora, quei punti li prende il giro dopo.
const CONFINE_KM = 15;
const VERTICI = POLI.flatMap(p => p[0]).filter((_, i) => i % 3 === 0);
const distConfine = (lat, lon) => Math.min(...VERTICI.map(([lo, la]) => km(lat, lon, la, lo)));
function pluviometriVeri(giorno, mnw, prima) {
  const out = {};
  for (const dir of VICINE) {
    let d; try { d = JSON.parse(fs.readFileSync(path.join(RADICE, 'data', dir, giorno + '.json'), 'utf8')); } catch (e) { continue; }
    if (/open-meteo|icon-2i-gapfill/.test(d.source || '')) continue;
    for (const s of d.stations || []) {
      if (s.om || s.mm == null || s.lat == null || !(s.lat > 41.3 && s.lat < 43.2 && s.lon > 12.6 && s.lon < 15.3)) continue;
      if (distConfine(s.lat, s.lon) <= CONFINE_KM) out[dir + ':' + s.id] = s;
    }
  }
  ((prima && prima.stations) || []).concat(mnw).forEach(s => { if (s.cod) out['mnw:' + s.cod] = s; });   // solo le MeteoNetwork hanno cod
  return Object.entries(out).map(([id, s]) => ({ id, i: Math.round((s.lon - G.lon0) / G.dlon), j: Math.round((s.lat - G.lat0) / G.dlat) }));
}
// Un file per giorno: {id: mm di ICON}. Rifacendo un giorno si aggiorna, e un punto che stavolta manca resta.
function scriviIconPluviometri(giorno, veri, mm, corse) {
  const dir = path.join(CARTELLA, 'icon-pluviometri'), f = path.join(dir, giorno + '.json');
  fs.mkdirSync(dir, { recursive: true });
  let icon = {};
  try { icon = JSON.parse(fs.readFileSync(f, 'utf8')).icon || {}; } catch (e) {}
  veri.forEach((p, k) => { icon[p.id] = mm[k]; });
  fs.writeFileSync(f, JSON.stringify({ date: giorno, collected: new Date().toISOString(), icon_corse: corse, count: Object.keys(icon).length, icon }));
}

// ─── ICON corretto coi pluviometri vicini (3/11/2026, scheda 115) ──────────
// ICON-2I sbaglia di qualche km dove mette il temporale: il 2/11/2026 dava 157 mm a Corfinio, che ne ha misurati
// 37,7, e 73 a Cepagatti, che ne ha misurati 163,6. Dove un pluviometro VERO sta entro CORR_KM, la stima di un punto
// si moltiplica per quanto ICON ha sbagliato su di lui: il rapporto (vero + 1) / (ICON + 1) nel punto del pluviometro
// (ICON da icon-pluviometri, stessa media 3x3), in logaritmo, mediato coi pesi 1/d² e con un peso in piu' 1/CORR_D0²
// che lo riporta verso 1 quando i pluviometri sono pochi o lontani; il fattore resta fra CORR_MIN e CORR_MAX. Oltre
// CORR_KM ICON resta com'e'.
// Perche' cosi': prova «a occhi chiusi» sui 14 giorni dal 20/10 al 2/11 (claudio\abruzzo-prova\correzione-prova-115.js,
// 82 pluviometri: ognuno nascosto insieme ai vicini entro 10 km e indovinato dagli altri). Nei giorni bagnati l'errore
// medio scende da 13,5 a 9,2 mm e gli errori oltre 20 mm da 50 a 25; il 21/10 da 14,8 a 7,5, il 2/11 da 17,3 a 12,5.
// Oltre i 15 km la correzione PEGGIORA (fra 15 e 20 km da 13,7 a 19 mm): per questo il taglio.
// Pluviometri usati: quelli che la mappa mostra. Le MeteoNetwork del giorno non ferme (anagrafe) e gli ufficiali di
// Lazio, Marche e Molise entro CONFINE_KM dal confine, non esclusi (MH_ESCLUSE di index.html, via lib-escluse.js):
// il 2/11 Mafalda, esclusa perche' segna troppo poco, avrebbe portato San Salvo da 73 a 17,5 mm.
// Nel file il valore di ICON resta in `grezzo` (rifacendo un giorno si riparte sempre da quello), il fattore in `corr`
// (solo sui punti corretti); la mappa scrive «corretto coi pluviometri vicini» nel pallino. Senza il file
// icon-pluviometri del giorno (prima del 27/10/2026) non si corregge niente e il file non cambia.
const CORR_KM = 15, CORR_D0 = 15, CORR_MIN = 0.25, CORR_MAX = 4;
const PER_VICINA = { 'meteohub-lazio': 'lazio', 'meteohub-marche': 'marche', 'meteohub-molise': 'molise' };
function correggiIcon(giorno, stations, an, ESC) {
  let iconP;
  try { iconP = JSON.parse(fs.readFileSync(path.join(CARTELLA, 'icon-pluviometri', giorno + '.json'), 'utf8')).icon; } catch (e) { return null; }
  const pluvio = [];
  for (const s of stations) {
    if (s.rete !== 'mnw' || s.mm == null || (an.mnw[s.cod] && an.mnw[s.cod].ferma)) continue;
    const ic = iconP['mnw:' + s.cod];
    if (ic != null) pluvio.push({ lat: s.lat, lon: s.lon, mm: s.mm, ic });
  }
  for (const dir of VICINE) {
    let d; try { d = JSON.parse(fs.readFileSync(path.join(RADICE, 'data', dir, giorno + '.json'), 'utf8')); } catch (e) { continue; }
    if (/open-meteo|icon-2i-gapfill/.test(d.source || '')) continue;
    const esc = ESC[PER_VICINA[dir]] || new Set();
    for (const s of d.stations || []) {
      if (s.om || s.mm == null || s.lat == null || esc.has(String(s.id))) continue;
      const ic = iconP[dir + ':' + s.id];
      if (ic != null && distConfine(s.lat, s.lon) <= CONFINE_KM) pluvio.push({ lat: s.lat, lon: s.lon, mm: s.mm, ic });
    }
  }
  let corretti = 0;
  for (const s of stations) {
    if (s.rete !== 'icon') continue;
    const grezzo = s.grezzo != null ? s.grezzo : s.mm;
    let somma = 0, peso = 1 / CORR_D0 ** 2, usati = 0;
    for (const p of pluvio) {
      const d = km(s.lat, s.lon, p.lat, p.lon);
      if (d > CORR_KM) continue;
      const w = 1 / Math.max(d, 1) ** 2;
      somma += w * Math.log((p.mm + 1) / (p.ic + 1)); peso += w; usati++;
    }
    s.grezzo = grezzo;
    if (!usati) { s.mm = grezzo; delete s.corr; continue; }
    const f = Math.min(CORR_MAX, Math.max(CORR_MIN, Math.exp(somma / peso)));
    s.mm = Math.max(0, Math.round(((grezzo + 1) * f - 1) * 10) / 10);
    s.corr = Math.round(f * 100) / 100;
    corretti++;
  }
  return { pluviometri: pluvio.length, corretti };
}

function segnaFerme(an) {
  const giorni = fs.readdirSync(CARTELLA).filter(f => /^\d{4}-\d\d-\d\d\.json$/.test(f)).sort().slice(-FERME_GIORNI).map(f => f.slice(0, 10));
  const mnw = {}, altri = {};
  for (const g of giorni) {
    const d = JSON.parse(fs.readFileSync(path.join(CARTELLA, g + '.json'), 'utf8'));
    for (const s of d.stations) {
      if (s.rete !== 'mnw') continue;
      (mnw[s.cod] = mnw[s.cod] || { lat: s.lat, lon: s.lon, mm: {} }).mm[g] = s.mm;
    }
    for (const dir of VICINE) {
      let v; try { v = JSON.parse(fs.readFileSync(path.join(RADICE, 'data', dir, g + '.json'), 'utf8')); } catch (e) { continue; }
      if (/open-meteo|icon-2i-gapfill/.test(v.source || '')) continue;
      for (const s of v.stations || []) {
        if (s.om || s.mm == null || s.lat == null || !(s.lat > 41.3 && s.lat < 43.3 && s.lon > 12.6 && s.lon < 15.3)) continue;
        (altri[dir + ':' + s.id] = altri[dir + ':' + s.id] || { lat: s.lat, lon: s.lon, mm: {} }).mm[g] = s.mm;
      }
    }
  }
  const oggi = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(new Date());
  for (const cod in mnw) {
    const s = mnw[cod], a = an.mnw[cod];
    if (!a) continue;
    const testi = Object.entries(mnw).filter(([k]) => k !== cod).map(([, v]) => v).concat(Object.values(altri))
      .filter(v => km(s.lat, s.lon, v.lat, v.lon) <= FERME_KM);
    let lei = 0, vicini = 0, n = 0;
    for (const g in s.mm) {
      const w = testi.filter(v => v.mm[g] != null).map(v => v.mm[g]).sort((x, y) => x - y);
      if (w.length < 2) continue;
      const h = w.length >> 1;
      vicini += w.length % 2 ? w[h] : (w[h - 1] + w[h]) / 2;
      lei += s.mm[g]; n++;
    }
    const ferma = n >= FERME_MIN_GIORNI && vicini >= FERME_MIN_MM && lei < FERME_QUOTA * vicini;
    if (ferma) {
      if (!a.ferma) console.log(`🚫 ${cod} ${a.n}: ${lei.toFixed(1)} mm contro ${vicini.toFixed(1)} dei vicini in ${n} giorni: fuori dalla mappa`);
      a.ferma = { dal: (a.ferma && a.ferma.dal) || oggi, lei: Math.round(lei * 10) / 10, vicini: Math.round(vicini * 10) / 10, giorni: n };
    } else if (a.ferma) {
      console.log(`✅ ${cod} ${a.n}: ${lei.toFixed(1)} mm contro ${vicini.toFixed(1)} dei vicini: rientra`);
      delete a.ferma;
    }
  }
}

// ─── Giro ──────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(CARTELLA, { recursive: true });
  const an = caricaAnagrafe();
  const ESC = escluse(RADICE);
  if (process.env.SOLO_CORREZIONE) {   // senza rete: solo la correzione sui file gia' scritti (vedi correggiIcon)
    for (const giorno of giorniDaFare()) {
      const file = path.join(CARTELLA, giorno + '.json');
      let d; try { d = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { continue; }
      const c = correggiIcon(giorno, d.stations, an, ESC);
      if (!c) { console.log(`— ${giorno}: niente icon-pluviometri, file non toccato`); continue; }
      fs.writeFileSync(file, JSON.stringify(d));
      console.log(`✅ ${giorno}: corretti ${c.corretti} punti ICON con ${c.pluviometri} pluviometri`);
    }
    return;
  }
  const punti = (await puntiIcon(an)).map(p => ({ ...p,
    i: Math.round((p.lon - G.lon0) / G.dlon), j: Math.round((p.lat - G.lat0) / G.dlat) }));
  let corse = [];
  try { corse = await corseIcon(); } catch (e) { console.log('⚠️ elenco ICON non disponibile:', e.message); }

  let errori = 0;
  for (const giorno of giorniDaFare()) {
    const file = path.join(CARTELLA, giorno + '.json');
    let prima = null;
    try { prima = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) {}
    const vecchie = {};
    (prima && prima.stations || []).forEach(s => { vecchie[s.id] = s; });

    let mnw = [];
    try { mnw = await meteoNetwork(giorno); await nomiMnw(an, mnw); }
    catch (e) { errori++; console.log(`⚠️ ${giorno} MeteoNetwork:`, e.message); }
    let temp = {};   // la temperatura e' a parte: se cade, la pioggia si scrive lo stesso
    try { temp = await temperatureMnw(giorno); }
    catch (e) { console.log(`⚠️ ${giorno} temperature MeteoNetwork:`, e.message); }

    // i punti della stima e, in coda, i pluviometri veri: una lettura sola dei file ICON per tutti e due
    const veri = pluviometriVeri(giorno, mnw, prima);
    let icon = null;
    try { if (corse.length) icon = await iconGiorno(giorno, corse, punti.concat(veri)); }
    catch (e) { errori++; console.log(`⚠️ ${giorno} ICON-2I:`, e.message); }
    if (icon) scriviIconPluviometri(giorno, veri, icon.mm.slice(punti.length), icon.corse);

    const st = {};
    for (const s of mnw) {
      const a = an.mnw[s.cod], id = 'mnw_' + s.cod;
      const v = vecchie[id];
      if (v && v.h > s.h) continue;   // vince chi ha letto piu' ore, come il Piemonte
      st[id] = { id, n: a.n, lat: s.lat, lon: s.lon, q: a.q, qt: 1, p: a.p, mm: s.mm, h: s.h, rete: 'mnw', cod: s.cod };
      if (s.i) st[id].i = s.i;
    }
    if (icon) punti.forEach((pt, k) => {
      st[pt.id] = { id: pt.id, n: pt.n, lat: pt.lat, lon: pt.lon, q: pt.q, qt: 1, p: pt.p, mm: icon.mm[k], rete: 'icon', stima: 1 };
    });
    // quello che non e' arrivato stavolta resta com'era (un giro andato male non cancella)
    for (const id in vecchie) if (!st[id] && !(icon && vecchie[id].rete === 'icon')) st[id] = vecchie[id];
    // la temperatura di questo giro, se no quella gia' nel file (anche quando vince la pioggia del file, sopra)
    for (const id in st) if (st[id].rete === 'mnw') {
      const t = temp[st[id].cod] || st[id].t || (vecchie[id] && vecchie[id].t);
      if (t) st[id].t = t;
    }

    const stations = Object.values(st).sort((a, b) => (a.rete === b.rete ? 0 : a.rete === 'mnw' ? -1 : 1) || a.n.localeCompare(b.n, 'it'));
    if (!stations.length) { console.log(`— ${giorno}: niente da scrivere`); continue; }
    const corr = correggiIcon(giorno, stations, an, ESC);
    const out = {
      date: giorno, collected: new Date().toISOString(), source: 'meteonetwork+icon-2i',
      icon_corse: icon ? icon.corse : (prima && prima.icon_corse) || null,
      count: stations.length, stations,
    };
    fs.writeFileSync(file, JSON.stringify(out));
    const nm = stations.filter(s => s.rete === 'mnw'), ni = stations.filter(s => s.rete === 'icon');
    const media = a => a.length ? (a.reduce((t, s) => t + s.mm, 0) / a.length).toFixed(1) : '—';
    console.log(`✅ ${giorno}: MeteoNetwork ${nm.length} (media ${media(nm)} mm) · ICON ${ni.length} punti (media ${media(ni)} mm)` +
      (icon ? ` · corse ${icon.corse.join(', ')} · ICON su ${veri.length} pluviometri veri` : ' · ICON non disponibile') +
      (corr ? ` · corretti ${corr.corretti} punti con ${corr.pluviometri} pluviometri` : ''));
  }
  segnaFerme(an);
  fs.writeFileSync(ANAGRAFE, JSON.stringify(an, null, 1));
  if (errori) process.exitCode = 1;
}

// Lanciato da solo fa il giro; con require presta i pezzi (il confronto con Open-Meteo e coi pluviometri veri).
if (require.main === module) main().catch(e => { console.error('❌', e); process.exit(1); });
module.exports = { meteoNetwork, temperatureMnw, corseIcon, oraIcon, iconGiorno, inAbruzzo, km, G, segnaFerme, caricaAnagrafe, puntiIcon, ANAGRAFE };
