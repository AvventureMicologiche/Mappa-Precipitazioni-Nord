/**
 * check-stazioni-ferme.js — GitHub Actions (1 run a settimana, il lunedì)
 *
 * Trova i pluviometri MORTI: quelli che continuano a consegnare il dato ogni
 * giorno, ma il dato è sempre zero (o quasi) mentre intorno a loro piove.
 *
 * Perché serve (21/8/2026). Una stazione spenta si vede subito: il file non
 * arriva e ci pensa check-fonti.js. Una stazione FERMA invece è invisibile:
 * il file c'è, la stazione c'è, il numero c'è, ed è 0. Sulla mappa diventa un
 * buco bianco in mezzo alla pioggia e abbassa la media della regione. Il
 * 20/8/2026, cercandoli a mano, ne sono usciti quattro in un pomeriggio: fra
 * questi 3014 Ferriere Pluvio (Emilia, 9% dei vicini in 46 giorni) e VIFRA
 * Villafranca Lunigiana (Liguria, 0,0 mm in 46 giorni). Quel pomeriggio è la
 * ragione di questo file: la stessa domanda, fatta ogni lunedì da sola.
 *
 * NON CHIAMA NESSUNA FONTE ESTERNA. Legge solo i nostri file, che sono già nel
 * checkout: nessuna rete, nessuna chiave, nessun limite di quota da rispettare.
 * È l'opposto di check-mnw-sud.js, che interrogava un testimone di fuori e in
 * 45 giorni non ha trovato un solo errore dimostrabile. Qui il testimone sono
 * i pluviometri vicini, che sono già nostri.
 *
 * NON TOCCA UN SOLO DATO e non esclude niente da sola: manda l'elenco, la
 * decisione di escludere resta una scelta umana, come è stato per 3014 e VIFRA.
 *
 * LE SOGLIE, e perché queste.
 *  - FINESTRA 45 giorni: è la misura con cui i quattro morti sono stati
 *    trovati a mano, ed è il minimo per avere pioggia quasi ovunque anche in
 *    un'estate secca. Più corta, in una settimana asciutta sarebbero tutti
 *    "fermi"; più lunga, un pluviometro riparato resterebbe accusato per mesi.
 *  - ALMENO 30 GIORNI DI DATO REALE nella finestra: sotto quella soglia il
 *    problema è un buco di raccolta, e quello è mestiere di check-fonti.js e
 *    check-gaps-nord.js. Qui si giudica solo chi ha consegnato con regolarità.
 *  - 5 VICINI ENTRO 25 KM, mediana: un solo vicino può essere rotto pure lui,
 *    la mediana di cinque no. Venticinque chilometri perché oltre, in montagna,
 *    due stazioni non vedono più lo stesso tempo.
 *  - I VICINI DEVONO AVERE ALMENO 50 mm nel periodo: senza pioggia intorno non
 *    c'è niente da misurare e uno zero è la verità, non un guasto. È questa
 *    condizione che tiene buono il controllo in una regione asciutta.
 *  - SOTTO IL 15% della mediana dei vicini: Ferriere stava al 9%, VIFRA a 0%.
 *    Un pluviometro sano, anche in un punto riparato, non scende sotto un
 *    quinto dei vicini su 45 giorni.
 *
 * I GIORNI STIMATI NON CONTANO. Se il giorno è stato coperto con Open-Meteo
 * (campo `source` che contiene "open-meteo") viene saltato: la stima è
 * calcolata sulle coordinate della stazione e darebbe pioggia anche a un
 * pluviometro morto, cioè coprirebbe esattamente il guasto che cerchiamo.
 * Stesso test usato da check-fonti.js.
 *
 * IL REGISTRO data/stazioni-ferme.json serve a non ripetersi: una stazione si
 * segnala una volta sola. Se torna a misurare esce dal registro in silenzio,
 * senza mail: un rientro è una buona notizia, e le buone notizie non svegliano
 * nessuno (vedi la regola sugli avvisi per i casi rari).
 *
 * TRE PORTE. La prima è quella descritta sopra (45 giorni, sotto il 15%). La
 * seconda è lo ZERO ASSOLUTO (22/8/2026, vedi più giù). La terza, dall'8/11/2026,
 * è SORDA NEGLI ULTIMI GIORNI DI PIOGGIA: prende i pluviometri morti DA POCO, che
 * la prima vede solo dopo un mese perché la pioggia buona delle settimane prima
 * li tiene sopra il 15% (vedi la sua sezione).
 *
 * Variabili d'ambiente: DATA_DIR (default data/), FINESTRA, MIN_GIORNI,
 * MIN_VICINI_MM, RAPPORTO, RAGGIO_KM, BAGNATI_N, BAGNATI_GIORNI, SOLO_ELENCO=1
 * (stampa e basta, non scrive registro né mail: è il modo in cui si prova in
 * locale).
 */
const fs = require('fs');
const path = require('path');

const DATA_DIR      = process.env.DATA_DIR || 'data';
const FINESTRA      = parseInt(process.env.FINESTRA || '45', 10);
const MIN_GIORNI    = parseInt(process.env.MIN_GIORNI || '30', 10);
const MIN_VICINI_MM = parseFloat(process.env.MIN_VICINI_MM || '50');
const RAPPORTO      = parseFloat(process.env.RAPPORTO || '0.15');
const RAGGIO_KM     = parseFloat(process.env.RAGGIO_KM || '25');
const N_VICINI      = 5;
// Il vicino piu' prossimo e' il testimone piu' forte che esista: se la stazione
// non e' bassa nemmeno rispetto a lui, la mediana dei cinque puo' essere gonfiata
// da pluviometri dall'altra parte di un crinale. Aggiunta il 21/8/2026 dopo la
// Val Borbera: Cabella Ligure faceva 27,7 mm contro una mediana di 92 (il 30%),
// ma a 5,5 km Roccaforte ne faceva 14 e sulle creste ne facevano 99. Era il
// gradiente fondovalle-crinale, non un guasto.
const VICINO_RAP    = parseFloat(process.env.VICINO_RAP || '0.50');
const VICINO_MIN_MM = 20;   // sotto questa pioggia il vicino non fa testimonianza
const SOLO_ELENCO   = process.env.SOLO_ELENCO === '1';
const REGISTRO      = path.join(DATA_DIR, 'stazioni-ferme.json');

const fmt = d => d.toISOString().slice(0, 10);
const eStima = j => !!j && typeof j.source === 'string' && /open-meteo|icon-2i-gapfill/i.test(j.source);

function giorniFinestra() {
  const g = [];
  const oggi = new Date();
  for (let i = FINESTRA; i >= 1; i--) {
    const d = new Date(Date.UTC(oggi.getUTCFullYear(), oggi.getUTCMonth(), oggi.getUTCDate() - i));
    g.push(fmt(d));
  }
  return g;
}

// Distanza in km, formula dell'emisenoverso. Basta e avanza: qui si decide se
// due pluviometri vedono lo stesso temporale, non si naviga.
function km(a, b) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const s = Math.sin(dLat / 2) ** 2 +
            Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

const mediana = a => {
  const v = [...a].sort((x, y) => x - y);
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
};

// abruzzo: la PROVA del 27/10/2026 (MeteoNetwork + stime ICON-2I) resta fuori finche' non si decide: le stime
// non sono pluviometri, e le sue MeteoNetwork ferme le toglie gia' il collector (segnaFerme)
function regioni() {
  return fs.readdirSync(DATA_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'abruzzo')
    .map(d => d.name)
    .sort();
}

// ── Somma dei 45 giorni, regione per regione ────────────────────────────────
const giorni = giorniFinestra();
const stazioni = [];   // { regione, id, nome, prov, quota, lat, lon, tot, giorni }
/**
 * ⚠️ LE STAZIONI GIA' ESCLUSE NON SI CONTROLLANO (21/9/2026).
 * Il controllo legge i FILE dei dati, ma l'esclusione di un pluviometro guasto
 * vive in `index.html` (`MH_ESCLUSE`): i suoi zeri falsi restano nei file e il
 * controllo li ritrova ogni lunedi'. Il 21/9 ha risegnalato Sellia Superiore,
 * che era fuori dal 10/9: attenzione sprecata, e il rischio di dare per nuovo
 * un guasto gia' noto. Stessa funzione di `check-mnw-sud.js`, che questa
 * regola ce l'ha dal 20/8/2026.
 */
function escluse() {
  const fuori = {};
  try {
    const html = fs.readFileSync(path.join(__dirname, '..', '..', 'index.html'), 'utf8');
    const blocco = (html.match(/var\s+MH_ESCLUSE\s*=\s*\{([\s\S]*?)\n\};/) || [])[1];
    if (!blocco) return fuori;
    for (const riga of blocco.split('\n')) {
      const reg = (riga.match(/([a-z]+)\s*:\s*\{/) || [])[1];
      if (!reg) continue;
      const nomi = riga.match(/'([^']+)'\s*:\s*true/g) || [];
      fuori[reg] = fuori[reg] || {};
      for (const x of nomi) fuori[reg][x.match(/'([^']+)'/)[1]] = true;
    }
  } catch (e) { console.warn('Warn: MH_ESCLUSE non letta (' + e.message + ')'); }
  return fuori;
}
const ESCLUSE = escluse();
let saltateEscluse = 0;

let filiLetti = 0, filiStima = 0;

for (const reg of regioni()) {
  const dir = path.join(DATA_DIR, reg);
  const acc = new Map();
  for (let gi = 0; gi < giorni.length; gi++) {
    const g = giorni[gi];
    const f = path.join(dir, g + '.json');
    if (!fs.existsSync(f)) continue;
    let j;
    try { j = JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { continue; }
    if (eStima(j)) { filiStima++; continue; }
    filiLetti++;
    for (const s of (j.stations || [])) {
      if (typeof s.mm !== 'number' || typeof s.lat !== 'number' || typeof s.lon !== 'number') continue;
      const k = String(s.id);
      /* ⚠️ In MH_ESCLUSE le regioni si chiamano «calabria», qui le cartelle
         si chiamano «meteohub-calabria»: senza togliere il prefisso il filtro
         non trova niente e le gia' escluse tornano nell'elenco ogni lunedi'. */
      const chiaveReg = reg.replace(/^meteohub-/, '');
      if (ESCLUSE[chiaveReg] && ESCLUSE[chiaveReg][k]) { if (!acc.has(k)) saltateEscluse++; acc.set(k, null); continue; }
      let a = acc.get(k);
      if (!a) { a = { regione: reg, id: k, nome: s.n, prov: s.p, quota: s.q, lat: s.lat, lon: s.lon, tot: 0, giorni: 0, per: new Array(giorni.length).fill(null), tx: new Array(giorni.length).fill(null) }; acc.set(k, a); }
      a.per[gi] = s.mm;
      // la massima del giorno, per la guardia della neve della terza porta
      if (Array.isArray(s.t) && typeof s.t[1] === 'number') a.tx[gi] = s.t[1];
      a.tot += s.mm;
      a.giorni++;
      a.nome = s.n || a.nome;          // l'ultimo nome visto, se cambia grafia
      a.lat = s.lat; a.lon = s.lon;
    }
  }
  for (const a of acc.values()) if (a) stazioni.push(a);
}

// Solo chi ha consegnato con regolarità puo' essere giudicato: gli altri sono
// un problema di buchi, non di pluviometro fermo.
const giudicabili = stazioni.filter(s => s.giorni >= MIN_GIORNI);

console.log(`Finestra ${giorni[0]} → ${giorni[giorni.length - 1]} (${FINESTRA} giorni)`);
console.log(`File reali letti: ${filiLetti}, giorni stimati saltati: ${filiStima}`);
console.log(`Stazioni totali: ${stazioni.length}, giudicabili (>=${MIN_GIORNI} giorni): ${giudicabili.length}`);

// ── Il confronto con i vicini ───────────────────────────────────────────────
// ⚠️ SI SOMMA SUI SOLI GIORNI CHE LA STAZIONE HA CONSEGNATO. Confrontare il suo
// totale con vicini sommati su tutti i 45 giorni fa sembrare rotta ogni stazione
// che ha dei buchi: e' l'errore che il 21/8/2026 aveva fatto escludere Croce
// Arcana (27 giorni su 40), che sui SUOI giorni fa il 71% dei vicini, cioe' e'
// sana. Un vicino vale come testimone solo se copre almeno il 90% di quei giorni.
function sommaSuiGiorni(v, indici) {
  let t = 0, n = 0;
  for (const i of indici) { if (v.per[i] === null) continue; t += v.per[i]; n++; }
  return n >= indici.length * 0.9 ? t : null;
}

const sospette = [];
for (const s of giudicabili) {
  const indici = [];
  s.per.forEach((v, i) => { if (v !== null) indici.push(i); });
  const mio = indici.reduce((a, i) => a + s.per[i], 0);
  const vicini = [];
  for (const v of giudicabili) {
    if (v === s) continue;
    const d = km(s, v);
    if (d > RAGGIO_KM) continue;
    const tot = sommaSuiGiorni(v, indici);
    if (tot === null) continue;             // ha buchi diversi dai suoi: non fa testo
    vicini.push({ d, tot, nome: v.nome, regione: v.regione });
  }
  if (vicini.length < N_VICINI) continue;   // troppo isolata per essere giudicata
  vicini.sort((a, b) => a.d - b.d);
  const primi = vicini.slice(0, N_VICINI);
  const med = mediana(primi.map(v => v.tot));
  if (med < MIN_VICINI_MM) continue;        // non e' piovuto: uno zero e' la verita'
  if (mio >= med * RAPPORTO) continue;
  const vicino = vicini.filter(v => v.tot >= VICINO_MIN_MM)[0];
  if (!vicino || mio >= vicino.tot * VICINO_RAP) continue;   // vedi VICINO_RAP
  sospette.push({
    chiave: s.regione + '/' + s.id,
    regione: s.regione, id: s.id, nome: s.nome, prov: s.prov, quota: s.quota,
    tot: Math.round(mio * 10) / 10,
    vicini: Math.round(med * 10) / 10,
    perc: med > 0 ? Math.round((mio / med) * 1000) / 10 : 0,
    vicinoNome: vicino.nome, vicinoTot: Math.round(vicino.tot * 10) / 10, vicinoKm: Math.round(vicino.d * 10) / 10,
    giorniDato: s.giorni,
    // L'ULTIMO GIORNO CHE HA CONSEGNATO: serve alla mail, che prima dava per
    // scontato che consegnassero tutte tutti i giorni (vedi sotto).
    ultimo: giorni[indici[indici.length - 1]],
    esempiVicini: primi.slice(0, 3).map(v => `${v.nome} ${Math.round(v.tot)} mm a ${v.d.toFixed(1)} km`)
  });
}
// ── SECONDA PORTA: LO ZERO ASSOLUTO (22/8/2026) ─────────────────────────────
// Aperta dopo Imola2 (BO): 0,0 mm in 99 giorni consecutivi, ultima pioggia
// misurata il 10 maggio, e nessun controllo l'aveva mai vista. Il motivo e'
// MIN_VICINI_MM: in pianura padana la mediana dei cinque vicini su 45 giorni
// stava a 43,2 mm, sotto la soglia di 50, e la porta di sopra si chiudeva prima
// di guardare. Quella soglia serve — in una regione secca uno zero e' la verita'
// — ma di fatto ACCECA IL CONTROLLO IN TUTTA LA PIANURA, cioe' proprio dove la
// rete e' piu' fitta e i confronti sarebbero piu' affidabili.
//
// Lo zero ASSOLUTO e' un'altra cosa dal «misura poco»: un pluviometro sano, in
// quaranta giorni, un decimo di millimetro lo raccoglie. Per questo qui bastano
// 20 mm di pioggia intorno invece di 50, e non c'e' nessun rapporto da
// calcolare: il rapporto e' zero per definizione. Restano invece uguali il
// raggio, i cinque vicini e la somma sui SOLI giorni consegnati.
//
// COSTO MISURATO sull'intera rete il 22/8/2026: 5 stazioni su 4.398 con almeno
// 40 giorni di dato, di cui una (VIFRA) gia' esclusa. Nessun rumore. La strada
// semplice — abbassare MIN_VICINI_MM da 50 a 25 — portava invece le sospette da
// 7 a 18, con dentro parecchi falsi allarmi del sud secco: la porta dedicata
// costa molto meno di una soglia piu' larga per tutti.
const ZERO_GIORNI    = parseInt(process.env.ZERO_GIORNI || '40', 10);
const ZERO_VICINI_MM = parseFloat(process.env.ZERO_VICINI_MM || '20');
const giaSospette = new Set(sospette.map(s => s.chiave));
for (const s of giudicabili) {
  const chiave = s.regione + '/' + s.id;
  if (giaSospette.has(chiave)) continue;    // gia' passata dalla porta di sopra
  if (s.giorni < ZERO_GIORNI) continue;
  const indici = [];
  s.per.forEach((v, i) => { if (v !== null) indici.push(i); });
  const mio = indici.reduce((a, i) => a + s.per[i], 0);
  if (mio !== 0) continue;                  // zero ASSOLUTO, non «quasi zero»
  const vicini = [];
  for (const v of giudicabili) {
    if (v === s) continue;
    const d = km(s, v);
    if (d > RAGGIO_KM) continue;
    const tot = sommaSuiGiorni(v, indici);
    if (tot === null) continue;             // ha buchi diversi dai suoi: non fa testo
    vicini.push({ d, tot, nome: v.nome, regione: v.regione });
  }
  if (vicini.length < N_VICINI) continue;   // troppo isolata per essere giudicata
  vicini.sort((a, b) => a.d - b.d);
  const primi = vicini.slice(0, N_VICINI);
  const med5 = mediana(primi.map(v => v.tot));
  if (med5 < ZERO_VICINI_MM) continue;      // non e' piovuto: uno zero e' la verita'
  const vicino = vicini.filter(v => v.tot >= VICINO_MIN_MM)[0];
  if (!vicino) continue;                    // nessun testimone abbastanza bagnato
  sospette.push({
    chiave, regione: s.regione, id: s.id, nome: s.nome, prov: s.prov, quota: s.quota,
    tot: 0, vicini: Math.round(med5 * 10) / 10, perc: 0, zeroAssoluto: true,
    vicinoNome: vicino.nome, vicinoTot: Math.round(vicino.tot * 10) / 10, vicinoKm: Math.round(vicino.d * 10) / 10,
    giorniDato: s.giorni,
    // L'ULTIMO GIORNO CHE HA CONSEGNATO: serve alla mail, che prima dava per
    // scontato che consegnassero tutte tutti i giorni (vedi sotto).
    ultimo: giorni[indici[indici.length - 1]],
    esempiVicini: primi.slice(0, 3).map(v => `${v.nome} ${Math.round(v.tot)} mm a ${v.d.toFixed(1)} km`)
  });
}

// ── TERZA PORTA: SORDA NEGLI ULTIMI GIORNI DI PIOGGIA (8/11/2026) ───────────
// Aperta dopo le anteprime «Pluviometri 7 giorni» dell'8/11/2026: buchi scuri a
// Sarezzo (BS), Castiglione d'Orcia, Orbetello, Alpicella (SV). Pluviometri che in
// ottobre misuravano bene e nei giorni di pioggia di novembre segnavano zero.
// La prima porta non li vedeva e non li avrebbe visti fino al 7/12: la pioggia
// grossa del 20-21/10, misurata bene, li teneva fra il 42 e il 77% dei vicini
// finche' non usciva dai 45 giorni. Lui: «se non ce ne accorgevamo oggi, quando
// ce ne saremmo accorti?».
//
// LA DOMANDA E' UN'ALTRA: non «quanto ha misurato in 45 giorni» ma «negli ultimi
// GIORNI DI PIOGGIA ha sentito qualcosa?». Un giorno di pioggia e' un giorno in
// cui la mediana dei 5 vicini piu' prossimi (entro 25 km, col dato quel giorno)
// fa almeno 5 mm; la stazione e' SORDA se segna al massimo il 10% di quella
// mediana (e comunque al massimo 0,2 mm). Scatta se gli ultimi 3 giorni di
// pioggia degli ultimi 21 sono tutti sordi.
//
// PERCHE' 3 E NON MENO, e non una finestra corta: PROVA A SECCO dell'8/11/2026,
// tutti i lunedi' dal 16/2 su 6.034 stazioni, giudicando ogni segnalazione da
// cosa faceva la stazione nei giorni di pioggia DOPO:
//   regola di sempre (45 gg)     1,4 a settimana, 17 su 44 rientrate subito
//   finestra di 21 / 15 giorni   5,4 / 7,7 a settimana, META' rientrate subito
//                                (i temporali d'estate bagnano un paese e non
//                                quello accanto: ad agosto 50 falsi allarmi)
//   2 giorni di pioggia sordi    4,5 a settimana, 69 su 162 rientrate subito
//   3 giorni di pioggia sordi    1,6 a settimana, 13 su 54 rientrate subito,
//                                anticipo mediano 1 settimana, fino a 5
// Un temporale locale e' UN giorno; un imbuto pieno di foglie e' sordo tutte le
// volte. Questa porta NON sostituisce la prima: non vede gli imbuti che si
// intasano piano e misurano a meta' (Monastero d'Ombrone, Vercelli), che restano
// sopra il 10% nei singoli giorni.
//
// ⚠️ LA NEVE. Un pluviometro non riscaldato sotto la neve segna zero e non e'
// rotto: senza guardia, il 16/2 la porta avrebbe segnalato 5 stazioni lombarde
// d'alta quota (Lago Reguzzo, Lago della Vacca, Merdarola, Presolana, Spluga) e
// il 9/11 tre piemontesi sopra i 2.300 m. Un giorno non conta se la stazione ha
// fatto una massima di 3 gradi o meno; se la temperatura non c'e', se sta sopra
// i 1.200 m fra novembre e aprile. Con la guardia, di quei casi ne resta uno.
//
// IL RIENTRO. Le altre porte tolgono la stazione dal registro appena non e' piu'
// sospetta. Questa no: i suoi giorni sordi escono dai 21 giorni anche se la
// stazione resta morta, e la si risegnalerebbe ogni volta che piove. Una
// stazione entrata da questa porta resta nel registro finche' il suo ultimo
// giorno di pioggia non e' BUONO (almeno il 30% della mediana dei vicini).
//
// Salta anche le stazioni gia' tolte a mano dalla mappa (LOMB_ESCLUSE,
// TOSCANA_ESCLUSE e le altre): guardando solo gli ultimi giorni, le ritroverebbe.
const BAGNATI_N      = parseInt(process.env.BAGNATI_N || '3', 10);
const BAGNATI_GIORNI = parseInt(process.env.BAGNATI_GIORNI || '21', 10);
const BAGNATO_MM     = 5;      // mediana dei vicini del giorno: sotto, il giorno non fa testo
const SORDA_RAP      = 0.10;   // sorda: al massimo il 10% della mediana (e al massimo 0,2 mm)
const BUONA_RAP      = 0.30;   // rientro: almeno il 30%
const NEVE_MAX       = 3;      // gradi di massima: puo' nevicare
const NEVE_QUOTA     = 1200;   // senza temperatura: sopra questa quota, da novembre ad aprile

// Gli elenchi delle escluse a mano nella mappa, tranne MH_ESCLUSE che e' gia'
// tolta sopra. Si leggono contando le graffe, perche' alcuni stanno su una riga
// sola (var LOMB_ESCLUSE={'2239':1,...};) e altri su cento, coi commenti.
function leggiEscluseMappa() {
  const PREF = { LOMB: 'lombardia', PIEMONTE: 'piemonte', LIGURIA: 'liguria', EMILIA: 'emilia',
                 FRANCIA: 'francia-', FRIULI: 'friuli', TOSCANA: 'toscana' };
  const fuori = [];
  try {
    const html = fs.readFileSync(path.join(__dirname, '..', '..', 'index.html'), 'utf8');
    for (const m of html.matchAll(/var ([A-Z]+)_ESCLUSE\s*=\s*\{/g)) {
      const pref = PREF[m[1]];
      if (!pref) continue;
      let i = m.index + m[0].length, prof = 1, corpo = '';
      while (i < html.length && prof > 0) {
        const c = html[i];
        if (c === '/' && html[i + 1] === '/') { const fine = html.indexOf('\n', i); corpo += '\n'; i = fine < 0 ? html.length : fine + 1; continue; }
        if (c === "'") { const fine = html.indexOf("'", i + 1); corpo += html.slice(i, fine + 1); i = fine + 1; continue; }
        if (c === '{') prof++;
        if (c === '}') prof--;
        if (prof > 0) corpo += c;
        i++;
      }
      for (const x of corpo.matchAll(/'([^']+)'\s*:/g)) fuori.push({ pref, key: x[1].toUpperCase() });
    }
  } catch (e) { console.warn('Warn: elenchi delle escluse non letti (' + e.message + ')'); }
  console.log(`Escluse a mano lette dalla mappa (per la terza porta): ${fuori.length}`);
  return s => fuori.some(e => s.regione.startsWith(e.pref) &&
    (e.key === String(s.id).toUpperCase() || e.key === String(s.nome || '').toUpperCase()));
}
const esclusaMappa = leggiEscluseMappa();

// I vicini di ogni stazione fra TUTTE quelle col dato (non solo le giudicabili:
// qui conta il singolo giorno), in ordine di distanza, calcolati una volta.
const viciniDi = new Map();
function viciniTutti(s) {
  if (viciniDi.has(s)) return viciniDi.get(s);
  const v = [];
  for (const o of stazioni) {
    if (o === s || Math.abs(o.lat - s.lat) > 0.25) continue;   // 0,25 gradi = 28 km: fuori di sicuro
    const d = km(s, o);
    if (d <= RAGGIO_KM) v.push({ o, d });
  }
  v.sort((a, b) => a.d - b.d);
  viciniDi.set(s, v);
  return v;
}
// mediana dei 5 vicini piu' prossimi che hanno il dato quel giorno (almeno 4)
function medianaGiorno(s, i) {
  const v = [];
  for (const { o } of viciniTutti(s)) {
    if (o.per[i] === null) continue;
    v.push(o.per[i]);
    if (v.length === N_VICINI) break;
  }
  return v.length >= N_VICINI - 1 ? mediana(v) : null;
}
function neve(s, i) {
  if (s.tx[i] !== null) return s.tx[i] <= NEVE_MAX;
  const mese = +giorni[i].slice(5, 7);
  return (s.quota || 0) >= NEVE_QUOTA && (mese >= 11 || mese <= 4);
}
// i giorni di pioggia della stazione negli ultimi BAGNATI_GIORNI, neve esclusa
function giorniBagnati(s) {
  const w = [];
  for (let i = Math.max(0, giorni.length - BAGNATI_GIORNI); i < giorni.length; i++) {
    if (s.per[i] === null || neve(s, i)) continue;
    const md = medianaGiorno(s, i);
    if (md !== null && md >= BAGNATO_MM) w.push({ i, mm: s.per[i], md });
  }
  return w;
}
const sordo = g => g.mm <= Math.max(0.2, SORDA_RAP * g.md);

const giaSospette3 = new Set(sospette.map(s => s.chiave));
for (const s of stazioni) {
  const chiave = s.regione + '/' + s.id;
  if (giaSospette3.has(chiave) || esclusaMappa(s)) continue;
  const w = giorniBagnati(s);
  if (w.length < BAGNATI_N) continue;
  const ultimi = w.slice(-BAGNATI_N);
  if (!ultimi.every(sordo)) continue;
  const mio = ultimi.reduce((a, g) => a + g.mm, 0), loro = ultimi.reduce((a, g) => a + g.md, 0);
  const indici = [];
  s.per.forEach((v, i) => { if (v !== null) indici.push(i); });
  sospette.push({
    chiave, regione: s.regione, id: s.id, nome: s.nome, prov: s.prov, quota: s.quota,
    tot: Math.round(mio * 10) / 10, vicini: Math.round(loro * 10) / 10,
    perc: loro > 0 ? Math.round((mio / loro) * 1000) / 10 : 0,
    bagnati: ultimi.map(g => ({ giorno: giorni[g.i], mm: g.mm, vicini: Math.round(g.md * 10) / 10 })),
    giorniDato: s.giorni,
    ultimo: giorni[indici[indici.length - 1]],
    esempiVicini: viciniTutti(s).slice(0, 3).map(v => `${v.o.nome} a ${v.d.toFixed(1)} km`)
  });
}

sospette.sort((a, b) => a.perc - b.perc);

console.log(`\nSOSPETTE: ${sospette.length}`);
for (const s of sospette) {
  console.log(`  ${s.perc.toFixed(1)}%  ${s.regione}/${s.id} ${s.nome}${s.prov ? ' (' + s.prov + ')' : ''}` +
              `  ${s.tot} mm contro ${s.vicini} mm dei vicini, ${s.giorniDato} giorni di dato` +
              `${s.zeroAssoluto ? '  [zero assoluto]' : ''}${s.bagnati ? '  [sorda negli ultimi ' + s.bagnati.length + ' giorni di pioggia]' : ''}`);
  if (s.bagnati) console.log(`         giorni: ${s.bagnati.map(g => `${g.giorno} ${g.mm} contro ${g.vicini}`).join(' · ')}`);
  console.log(`         vicini: ${s.esempiVicini.join(' · ')}`);
}

if (SOLO_ELENCO) { console.log('\n(solo elenco: nessun registro, nessuna mail)'); process.exit(0); }

// ── Registro e mail: si segnala solo chi non e' gia' segnalato ──────────────
let registro = { aggiornato: null, ferme: [] };
if (fs.existsSync(REGISTRO)) {
  try { registro = JSON.parse(fs.readFileSync(REGISTRO, 'utf8')); } catch (e) {}
}
const gia = new Set((registro.ferme || []).map(x => x.chiave));
const nuove = sospette.filter(s => !gia.has(s.chiave));
const oraSospette = new Set(sospette.map(s => s.chiave));
// Le entrate dalla terza porta restano finche' l'ultimo giorno di pioggia non e'
// buono (vedi TERZA PORTA, IL RIENTRO). Se nei 45 giorni non c'e' piu' nessun dato
// la stazione non sta nemmeno sulla mappa: esce.
const perChiave = new Map(stazioni.map(s => [s.regione + '/' + s.id, s]));
const trattenute = (registro.ferme || []).filter(x => {
  if (oraSospette.has(x.chiave) || x.porta !== 'bagnati') return false;
  const s = perChiave.get(x.chiave);
  if (!s) return false;
  const w = giorniBagnati(s);
  if (!w.length) return true;               // nessun giorno di pioggia: non si sa ancora
  const u = w[w.length - 1];
  return u.mm < BUONA_RAP * u.md;           // l'ultimo giorno di pioggia non e' buono: resta
});
const tenute = new Set(trattenute.map(x => x.chiave));
const rientrate = (registro.ferme || []).filter(x => !oraSospette.has(x.chiave) && !tenute.has(x.chiave));

registro = {
  aggiornato: fmt(new Date()),
  finestra: FINESTRA,
  ferme: sospette.map(s => ({
    chiave: s.chiave, nome: s.nome, regione: s.regione, perc: s.perc,
    porta: s.bagnati ? 'bagnati' : s.zeroAssoluto ? 'zero' : 'totale',
    dal: (registro.ferme || []).find(x => x.chiave === s.chiave)?.dal || fmt(new Date())
  })).concat(trattenute)
};
fs.writeFileSync(REGISTRO, JSON.stringify(registro, null, 2) + '\n');

if (rientrate.length) {
  console.log('\nRientrate (tolte dal registro, nessuna mail): ' +
              rientrate.map(x => x.chiave + ' ' + x.nome).join(', '));
}

const out = process.env.GITHUB_OUTPUT;
const scrivi = (k, v) => { if (out) fs.appendFileSync(out, `${k}=${v}\n`); };
scrivi('registro', 'true');

if (!nuove.length) {
  console.log('\nNessuna stazione ferma nuova: nessuna mail.');
  scrivi('mail', 'false');
  process.exit(0);
}

// Nei testi che legge una persona i decimali vanno con la virgola, e la
// percentuale sta fra parentesi: così si evita anche il problema dell'articolo
// («il 0,0%» era sgrammaticato).
const vir = n => String(n).replace('.', ',');
// Da quanti giorni non consegna, contati fino alla fine della finestra. Sotto
// i tre giorni non e' silenzio, e' il ritardo normale di una rete.
const mutaDa = s => {
  if (!s.ultimo) return 0;
  const g = Math.round((new Date(giorni[giorni.length - 1]) - new Date(s.ultimo)) / 86400000);
  return g >= 3 ? g : 0;
};
const righe = nuove.map(s =>
  `• ${s.nome}${s.prov ? ' (' + s.prov + ')' : ''} — ${s.regione}, id ${s.id}\n` +
  // Per lo zero assoluto la percentuale non dice niente (e' zero per
  // definizione): quello che deve saltare all'occhio e' che non ha raccolto
  // NEMMENO UN DECIMO in quaranta giorni e passa.
  (s.zeroAssoluto
    ? `  ZERO ASSOLUTO: nemmeno un decimo di millimetro in ${s.giorniDato} giorni di dato,\n` +
      `  mentre i cinque vicini piu' prossimi ne facevano ${vir(s.vicini)} mm.\n`
    // terza porta: i giorni uno per uno, che sono la prova
    : s.bagnati
    ? `  SORDA NEGLI ULTIMI ${s.bagnati.length} GIORNI DI PIOGGIA: ` +
      s.bagnati.map(g => `il ${+g.giorno.slice(8)}/${+g.giorno.slice(5, 7)} ${vir(g.mm)} mm contro ${vir(g.vicini)}`).join('; ') +
      `\n  (mediana dei cinque vicini piu' prossimi quel giorno).\n`
    : `  ${vir(s.tot)} mm nei ${s.giorniDato} giorni consegnati su ${FINESTRA} contro ${vir(s.vicini)} mm\n` +
      `  dei cinque vicini piu' prossimi (${vir(s.perc.toFixed(1))}%).\n`) +
  // ⚠️ SE HA SMESSO, SI DICE. Il controllo chiede 30 giorni su 45, quindi una
  // stazione puo' passare avendo consegnato solo nella prima meta' della
  // finestra ed essere muta da due settimane: e' successo il 7/9/2026 con la
  // 198 VERCELLI, che la mail annunciava come se consegnasse ogni giorno.
  (mutaDa(s) ? `  ATTENZIONE: non consegna piu' dal ${s.ultimo}, cioe' da ${mutaDa(s)} giorni.\n` : '') +
  `  Vicini: ${s.esempiVicini.join('; ')}.`
).join('\n\n');

const corpo =
`Queste stazioni consegnano il dato ma non misurano quasi piu' niente, mentre
intorno a loro piove. Alcune hanno anche smesso di consegnare: dove succede
c'e' scritto da quando. Sono candidate all'esclusione, come lo sono state 3014
Ferriere Pluvio e VIFRA Villafranca Lunigiana il 20 agosto, e VERCELLI il 7
settembre.

${righe}

Come si controlla, prima di escludere: apri la mappa sulla regione con il
periodo di 30 giorni e guarda il punto. Se e' un buco bianco in mezzo al
colore, e' morto. Se la zona e' asciutta anche intorno, e' un falso allarme e
va segnalato, perche' vuol dire che la soglia dei vicini non ha funzionato.
Per quelle SORDE NEGLI ULTIMI GIORNI DI PIOGGIA basta il periodo di 7 giorni:
si sono fermate da poco e sui 30 giorni la pioggia di prima le copre ancora.

Finestra ${giorni[0]} - ${giorni[giorni.length - 1]}. Nessun dato e' stato
modificato: questo controllo non tocca niente e non esclude niente da solo.`;

const oggetto = nuove.length === 1
  ? `Pluviometro fermo: ${nuove[0].nome} (${nuove[0].regione})`
  : `${nuove.length} pluviometri fermi da controllare`;

const mail =
`From: ${process.env.MAIL_USER || 'bot'}\r\n` +
`To: ${process.env.MAIL_TO || 'bot'}\r\n` +
`Subject: ${oggetto}\r\n` +
`Content-Type: text/plain; charset=UTF-8\r\n\r\n` +
corpo.replace(/\n/g, '\r\n') + '\r\n';

fs.writeFileSync('ferme-mail.eml', mail);
console.log(`\nMail preparata per ${nuove.length} stazioni nuove.`);
scrivi('mail', 'true');
