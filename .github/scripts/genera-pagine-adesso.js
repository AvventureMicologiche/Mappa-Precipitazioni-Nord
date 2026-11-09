#!/usr/bin/env node
/**
 * Genera le pagine «Dove sta piovendo adesso» (/<regione>/adesso/), 18/10/2026.
 *
 * PERCHE' ESISTONO. Search Console, 90 giorni al 16/10/2026: le ricerche «dove sta
 * piovendo adesso in …» (121 modi diversi di chiederlo) hanno mostrato il sito 2.664
 * volte con 23 clic, 0,9%, intorno al decimo posto; piu' di meta' dal sud (Sicilia 717,
 * Campania 629, Puglia 320). Google mostrava le pagine regione, che rispondono a
 * un'altra domanda («Pluviometria …, ieri e 30 giorni»). Per «dove ha piovuto oggi in …»,
 * con la pagina giusta, eravamo quarti col 12,7%. Il mockup approvato da lui sta in
 * `D:\video youtube\claudio\mockup-pagina-adesso\`.
 *
 * COME SONO FATTE. Gusci statici come le pagine regione: titolo, testi, citta' e link
 * sono nell'HTML (Google li legge), le cose vive le porta `lib/pagina-adesso.js`:
 * radar LibreWXR (lo stesso del tasto «Diretta radar»), previsioni delle citta' dalla
 * funzione /api/previsioni (MET Norway), casella «Cerca una località» sull'elenco paesi.
 * Non si rigenerano coi dati: solo se cambia il modello qui sotto.
 *   node .github/scripts/genera-pagine-adesso.js
 *
 * ⚠️ REGIONI: le italiane dell'anagrafe di genera-pagine-regione.js (fuori le ESTERE)
 * PIU' L'ABRUZZO, che la pagina regione non ce l'ha (stime Open-Meteo) ma il radar e le
 * previsioni si': la sua pagina non ha il blocco «Dove ha piovuto ieri».
 * ⚠️ STILE: lo stesso delle pagine regione (STILE_BASE, STILE_NUOVO, STILE_IERI, RILIEVO), piu' il
 * pezzo di questa pagina. Se cambia lo stile delle pagine regione, si rigenera anche qui.
 * ⚠️ CONFINE: dentro la pagina, alleggerito (3 decimali + Douglas-Peucker ~150 m): il
 * file nazionale pesa 1,4 MB, la Sardegna da sola 160 KB a piena precisione.
 */

const fs = require('fs');
const path = require('path');
const { REGIONI, GEN, navAltre, STILE_BASE, STILE_IERI, ESTERE, SITO, GA_ID, CANALE, scrivi, stazDi, briciolaJson, briciolaHtml, BRIC_CSS } = require('./genera-pagine-regione.js');
// «zona per zona» solo se la pagina della regione ha l'elenco delle zone (1/11/2026): Puglia, Basilicata, Sardegna e
// Molise le zone non le hanno, e la riga prometteva una cosa che la pagina non ha
const HA_ZONE = new Set(JSON.parse(require('fs').readFileSync(require('path').join(__dirname, 'funghi-zone.json'), 'utf8')).map(z => z.reg));
const { STILE_NUOVO, RILIEVO, QUIZ_REGIONI, QUIZ_CSS, coppiaQuiz } = require('./lib-pagina-funghi.js');   // quiz accanto a YouTube (20/10/2026)
const { scriviSitemap } = require('./genera-sitemap.js');
const { senzaCommenti } = require('./lib-senza-commenti.js');   // i commenti restano qui, non nelle pagine (2/11/2026)
const { TESTATA_CSS, testata } = require('./lib-testata.js');   // la testata del sito (28/10/2026)
const { capoluogo } = require('./lib-capoluoghi.js');

const RADICE = path.resolve(__dirname, '..', '..');
const VERSIONE_JS = 22;   // si alza quando cambia lib/pagina-adesso.js: il browser riprende il file nuovo (5: /api/cerca, 25/10/2026; 6: la barra che scorre, 7: la riga viva, 30/10/2026; 8: «aggiornate alle» a pochi minuti e carte che si rinfrescano, 31/10/2026; 9: «e un'altra città», 1/11/2026; 10: zoom minimo, non piu' fino al planisfero, 2/11/2026; 11: il radar sulla foto della mappa, 2/11/2026; 12: le previsioni su /previsioni/, 2/11/2026; 13: le pagine delle citta', 4/11/2026; 14: le citta' si aprono come le regioni, 8/11/2026, mai uscita; 15: le citta' centrate, due zoom sopra l'Italia, senza confine della regione, 8/11/2026; 16: al telefono uno zoom e mezzo, 8/11/2026; 17: le regioni come le citta', segnalino al centro e confine piu' leggero, 8/11/2026, mai uscita; 18: il segnalino delle regioni sul capoluogo, 8/11/2026; 19: il «+» delle regioni verso il capoluogo e i comuni intorno delle citta' dal primo «+», 8/11/2026, scheda 128 quater; 20: i crediti del radar, Radar-DPC sull'Italia, 9/11/2026, scheda 130; 21: radar e riga viva fermi a pagina nascosta, rifatti solo col fotogramma nuovo, elenco unico e «+40» vero, 9/11/2026, scheda 130; 22: si apre col «+40» in movimento, fermo se la pagina o la cartina non si vedono, 9/11/2026, scheda 130)

/* LA FOTO DELLA MAPPA SOTTO IL RADAR (2/11/2026, scheda 111 ter; regola sua del 2/11: le immagini e le cartine delle
   pagine hanno sempre la stessa faccia della mappa). La foto NOSTRA della pioggia di index.html (modulo «LA FOTO DAL
   SATELLITE SOTTO LA PIOGGIA»): indirizzo col commit, limiti dell'Europa, crediti corti, e la stessa luce (LUCE_SAT,
   +6% a tacca). Si leggono da index.html come fa genera-pagine-meteo-zona.js con SAT_FOTO: se cambiano, basta
   rigenerare. Se non si trovano il generatore si ferma, invece di scrivere pagine che tornano alla cartina. */
const INDEX = fs.readFileSync(path.join(RADICE, 'index.html'), 'utf8');
function fotoDellaMappa() {
  const commit = /var FOTO_COMMIT='([0-9a-f]{40})'/.exec(INDEX), url = /var FOTO_URL='([^']+)'\+FOTO_COMMIT\+'([^']+)'/.exec(INDEX);
  const lim = /var FOTO_LIMITI=(\[\[[^;]+\]\]);/.exec(INDEX), cr = /var FOTO_CREDITI='([^']+)'/.exec(INDEX);
  if (!commit || !url || !lim || !cr) throw new Error("la foto della mappa non si trova in index.html (FOTO_COMMIT, FOTO_URL, FOTO_LIMITI, FOTO_CREDITI)");
  return { u:url[1] + commit[1] + url[2], lim:JSON.parse(lim[1]), cr:cr[1] };
}
const FOTO = fotoDellaMappa();
const LUCE = +(1 + 0.06 * +((/var LUCE_SAT=(\d+)/.exec(INDEX) || [])[1] || 5)).toFixed(2);

// le regioni: l'anagrafe italiana + l'Abruzzo dopo il Lazio (stesso ordine nord-sud delle altre liste)
const ABRUZZO = { k:'abruzzo', nome:'Abruzzo', prep:'in', senzaPagina:true };
const LISTA = [];
for (const r of REGIONI) {
  if (ESTERE.includes(r.k)) continue;
  LISTA.push(r);
  if (r.k === 'lazio') LISTA.push(ABRUZZO);
}
const GEN2 = Object.assign({ abruzzo:"dell'Abruzzo" }, GEN);

// il confine di ogni regione: file e pezzo del nome (lo stesso criterio di geojsonFilter in index.html)
const CONFINI = {
  trentino: ['italia-province-tn-bz-confine.geojson', 'prov_name', 'Trento'],
  altoadige: ['italia-province-tn-bz-confine.geojson', 'prov_name', 'Bolzano'],
};
const NOME_CONFINE = { valledaosta:"Valle d", friuli:'Friuli', emilia:'Emilia' };
function confineDi(r) {
  const [file, prop, val] = CONFINI[r.k] || ['italia-regioni-confine.geojson', 'reg_name', NOME_CONFINE[r.k] || r.nome];
  const g = JSON.parse(fs.readFileSync(path.join(RADICE, file), 'utf8'));
  const f = g.features.filter(x => String(x.properties[prop] || '').indexOf(val) > -1);
  if (f.length !== 1) throw new Error(`confine di ${r.k}: trovate ${f.length} forme per «${val}»`);
  return { type:'Feature', properties:{}, geometry:alleggerisci(f[0].geometry) };
}

// ── Douglas-Peucker. ⚠️ Su un anello CHIUSO primo e ultimo punto coincidono, la retta di
// riferimento degenera e sopravvivono due punti (trappola gia' pagata con la Slovenia):
// si spezza in due catene aperte al punto piu' lontano dal primo.
const TOLL = 0.0015;
function dp(pts) {
  if (pts.length < 3) return pts.slice();
  const tieni = new Uint8Array(pts.length); tieni[0] = tieni[pts.length - 1] = 1;
  const pila = [[0, pts.length - 1]];
  while (pila.length) {
    const [a, b] = pila.pop();
    const [x1, y1] = pts[a], [x2, y2] = pts[b], dx = x2 - x1, dy = y2 - y1, L2 = dx * dx + dy * dy;
    let max = -1, im = -1;
    for (let i = a + 1; i < b; i++) {
      const [x, y] = pts[i];
      let t = L2 ? ((x - x1) * dx + (y - y1) * dy) / L2 : 0; t = Math.max(0, Math.min(1, t));
      const ex = x1 + t * dx - x, ey = y1 + t * dy - y, d = ex * ex + ey * ey;
      if (d > max) { max = d; im = i; }
    }
    if (im > -1 && max > TOLL * TOLL) { tieni[im] = 1; pila.push([a, im], [im, b]); }
  }
  return pts.filter((_, i) => tieni[i]);
}
function anello(r) {
  const p = r.map(([x, y]) => [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000])
    .filter((q, i, a) => i === 0 || q[0] !== a[i - 1][0] || q[1] !== a[i - 1][1]);
  if (p.length < 4) return null;
  let lontano = 0, dmax = -1;
  p.forEach((q, i) => { const d = (q[0] - p[0][0]) ** 2 + (q[1] - p[0][1]) ** 2; if (d > dmax) { dmax = d; lontano = i; } });
  const s = dp(p.slice(0, lontano + 1)).concat(dp(p.slice(lontano)).slice(1));
  return s.length >= 4 ? s : null;
}
function alleggerisci(g) {
  const poli = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
  const out = poli.map(pl => pl.map(anello).filter(Boolean)).filter(pl => pl.length);
  return { type:'MultiPolygon', coordinates:out };
}

// le citta': i capoluoghi dell'area (lo stesso elenco della sezione Previsioni), prima il capoluogo di regione, poi
// quelli di provincia (28/10/2026, suo: «è più importante Savona di Millesimo»: Imperia prima di Sanremo), poi gli
// altri; ognuno dal piu' popoloso
const CAPOLUOGHI = JSON.parse(fs.readFileSync(path.join(RADICE, 'data', 'capoluoghi.json'), 'utf8'));
// i capoluoghi di regione (il segnalino del radar delle pagine regione, 8/11/2026): capoluoghi.json e' in ordine alfabetico
const CAPOLUOGO_REGIONE = { lombardia:'Milano', piemonte:'Torino', valledaosta:'Aosta', liguria:'Genova', emilia:'Bologna',
  veneto:'Venezia', friuli:'Trieste', trentino:'Trento', altoadige:'Bolzano', toscana:'Firenze', umbria:'Perugia',
  marche:'Ancona', lazio:'Roma', abruzzo:"L'Aquila", molise:'Campobasso', campania:'Napoli', puglia:'Bari',
  basilicata:'Potenza', calabria:'Catanzaro', sicilia:'Palermo', sardegna:'Cagliari' };
const POP = {};
for (const riga of fs.readFileSync(path.join(RADICE, 'data', 'elenco-paesi.txt'), 'utf8').split('\n')) {
  const c = riga.split('|'); if (c.length >= 6) POP[c[0]] = Math.max(POP[c[0]] || 0, +c[5]);
}
function cittaDi(r) {
  const peso = c => c.c ? 2 : capoluogo(c.n) ? 1 : 0;
  return (CAPOLUOGHI[r.k] || []).slice().sort((a, b) => peso(b) - peso(a) || (POP[b.n] || 0) - (POP[a.n] || 0))
    .map(c => ({ n:c.n, lat:c.lat, lon:c.lon, q:c.q == null ? null : c.q, reg:r.k }));
}

/* I NOMI SOPRA LA FOTO (2/11/2026, scheda 111 ter): la foto non ha scritte, come nella mappa (modulo «NOMI NOSTRI» di
   index.html). Prima le citta' della regione (sono gia' nei dati, lib/pagina-adesso.js le mette davanti), poi i
   capoluoghi delle regioni d'Italia e le citta' estere sopra i 300.000 abitanti dell'elenco dei nomi della mappa
   (data/nomi-esteri-grandi.txt, da OpenStreetMap), nel pezzo d'Europa che la cartina mostra da lontano. La mappa sceglie
   fra migliaia di nomi per abitanti e zoom; qui sono un centinaio, in ordine, e decide lo spazio. */
const ESTERI = fs.readFileSync(path.join(RADICE, 'data', 'nomi-esteri-grandi.txt'), 'utf8').split('\n').map(r => r.split('|'))
  .filter(p => p.length >= 4 && +p[3] >= 300000 && +p[1] > 34 && +p[1] < 60 && +p[2] > -12 && +p[2] < 36)
  .sort((a, b) => b[3] - a[3]).map(p => ({ n:p[0].trim(), lat:+(+p[1]).toFixed(3), lon:+(+p[2]).toFixed(3) }));
function nomiDi(r) {
  const visti = new Set(cittaDi(r).map(c => c.n));
  return CAPOLUOGHI.italia.map(c => ({ n:c.n, lat:c.lat, lon:c.lon })).concat(ESTERI)
    .filter(c => !visti.has(c.n) && visti.add(c.n));
}

/* ── LE PAGINE «ADESSO» DELLE CITTA' (4/11/2026, scheda 118 bis) ──────────────────────────────────────────────────────
   Sua decisione del 4/11 («Due tappe»): le «adesso» per i capoluoghi di provincia, prima ~20-25, il resto dopo due
   settimane di misura. Le 21 regioni sono la famiglia che rende di piu' su Google (18/10-3/11: 20.460 viste, 275 clic),
   ma chi cerca «sta piovendo a Cagliari» o «dove sta piovendo adesso a Roma» finiva sulla pagina della regione. La
   PRIMA ONDATA sono le sei regioni dove le «adesso» hanno preso piu' clic (Sardegna 53, Liguria 37, Puglia 34, Sicilia
   32, Campania 17, Veneto 14), dentro ognuna le citta' piu' grandi con un pluviometro vero vicino, piu' Roma (la citta'
   piu' cercata per nome). Indirizzo /<regione>/adesso/<citta>/, sitemap a parte (sitemap-adesso-citta.xml).
   ⚠️ OGNI PAGINA HA ROBA SUA, se no Google la tiene fuori come copia della regione: il radar inquadrato sulla citta' e la
   riga viva su di lei (lib/pagina-adesso.js, D.qui), la previsione della citta' ora per ora, e i millimetri dei
   pluviometri piu' vicini (ieri, 7 e 30 giorni) SCRITTI NELL'HTML. Per questi la pagina e' «cotta» come le regioni e le
   zone piogge: il giro del mattino (pagine-regione.yml, SOLO=citta) la riscrive coi numeri nuovi.
   Le citta' si scrivono col nome di data/capoluoghi.json.
   ⚠️ A ONDATE (5/11/2026, scheda 124, suo sì al posto della seconda tappa unica del ~18/11): Google prende bene una
   ventina di pagine nuove alla volta se ha la loro sitemap inviata il giorno stesso (sc.py invia), mentre i blocchi
   grossi restano fermi per settimane. Ogni ondata e' un elemento di ONDATE_ADESSO e ha la SUA sitemap
   (sitemap-adesso-citta.xml la prima, sitemap-adesso-citta-2.xml la seconda, e cosi' via): la pagina porta
   data-ondata e genera-sitemap.js la mette nel file giusto. L'ondata nuova si aggiunge in fondo, quando la precedente
   e' indicizzata al ~70%. Seconda ondata: i capoluoghi di regione che mancavano (L'Aquila no: l'Abruzzo non ha la
   pagina dei pluviometri, la citta' linkerebbe una pagina che non c'e') piu' i sei piu' grandi rimasti nelle regioni
   della prima, e Reggio di Calabria al posto dell'Aquila. */
const ONDATE_ADESSO = [
  { // prima ondata, 4/11/2026 (scheda 118 bis)
    liguria: ['Genova', 'Savona', 'La Spezia', 'Imperia'],
    veneto: ['Venezia', 'Verona', 'Padova'],
    lazio: ['Roma'],
    campania: ['Napoli', 'Salerno', 'Caserta'],
    puglia: ['Bari', 'Lecce', 'Taranto', 'Foggia'],
    sicilia: ['Palermo', 'Catania', 'Messina', 'Siracusa', 'Ragusa'],
    sardegna: ['Cagliari', 'Sassari', 'Olbia', 'Nuoro'],
  },
  { // seconda ondata, preparata il 5/11/2026 (scheda 124)
    lombardia: ['Milano'], piemonte: ['Torino'], emilia: ['Bologna'], toscana: ['Firenze'], friuli: ['Trieste'],
    marche: ['Ancona'], umbria: ['Perugia'], basilicata: ['Potenza'], calabria: ['Catanzaro', 'Reggio di Calabria'],
    molise: ['Campobasso'], trentino: ['Trento'], altoadige: ['Bolzano'], valledaosta: ['Aosta'],
    veneto: ['Vicenza', 'Treviso'], puglia: ['Andria', 'Brindisi'], sicilia: ['Trapani', 'Agrigento'],
  },
];
/* ⚠️ A GOCCIA (7/11/2026, scheda 127, suo «ok programma una settimana così facciamo la prova»): la seconda ondata non
   esce tutta insieme ma tre citta' al giorno, dall'8 al 14/11, mescolate con due «Meteo <paese>» (METEO_PAESI_C di
   genera-pagine-meteo-zona.js), e ogni sera le pagine del giorno si chiedono a mano a Google. Prima le 24 della prima
   ondata con la sola sitemap erano 0 su 24 a tre giorni, mentre le pagine chieste a mano entrano in poche ore e la quota
   a mano e' 11 al giorno. Una citta' con la data qui sotto NON ESISTE finche' quel giorno non arriva (ora italiana; per
   le prove OGGI=AAAA-MM-GG): niente pagina, pillole, elenchi ne' sitemap. Il giro del mattino (SOLO=citta) la scrive da
   solo il suo giorno; le pillole delle pagine regione arrivano col generatore intero della sera.
   ⚠️ 9/11/2026, sua scelta («Prima la 1», con la GA4 5; «Sì, spostale» nella Goccia): da 5 a 10 pagine nuove al giorno,
   perche' entra solo quello che si chiede a mano (22/22 chieste il 7-8/11 dentro, 0/31 con la sola sitemap). Sei citta'
   il 10 e l'11/11, due il 12/11, insieme ai «Meteo <paese>» (4, 4, 3). */
const USCITA_ADESSO = {
  'lombardia/Milano': '2026-11-08', 'toscana/Firenze': '2026-11-08', 'sicilia/Trapani': '2026-11-08',
  'piemonte/Torino': '2026-11-09', 'umbria/Perugia': '2026-11-09', 'calabria/Reggio di Calabria': '2026-11-09',
  'emilia/Bologna': '2026-11-10', 'trentino/Trento': '2026-11-10', 'puglia/Brindisi': '2026-11-10',
  'friuli/Trieste': '2026-11-10', 'marche/Ancona': '2026-11-10', 'sicilia/Agrigento': '2026-11-10',
  'altoadige/Bolzano': '2026-11-11', 'veneto/Vicenza': '2026-11-11', 'calabria/Catanzaro': '2026-11-11',
  'veneto/Treviso': '2026-11-11', 'valledaosta/Aosta': '2026-11-11', 'puglia/Andria': '2026-11-11',
  'basilicata/Potenza': '2026-11-12', 'molise/Campobasso': '2026-11-12',
};
const OGGI = process.env.OGGI || new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome' }).format(new Date());
const CITTA_ADESSO = {}, ONDATA_DI = {};
ONDATE_ADESSO.forEach((o, i) => {
  for (const [k, tutte] of Object.entries(o)) {
    const nomi = tutte.filter(n => !USCITA_ADESSO[k + '/' + n] || USCITA_ADESSO[k + '/' + n] <= OGGI);
    if (!nomi.length) continue;
    CITTA_ADESSO[k] = (CITTA_ADESSO[k] || []).concat(nomi);
    for (const n of nomi) ONDATA_DI[k + '/' + n] = i + 1;
  }
});
const { slug, bello } = require('./lib-nomi.js');
function cittaAdesso(k) {
  return (CITTA_ADESSO[k] || []).map(n => {
    const c = (CAPOLUOGHI[k] || []).find(x => x.n === n);
    if (!c) throw new Error(`citta' «${n}» non trovata in capoluoghi.json (${k})`);
    return { n:c.n, lat:c.lat, lon:c.lon, q:c.q == null ? null : c.q, s:c.s, reg:k, slug:slug(c.n), ondata:ONDATA_DI[k + '/' + n] };
  });
}

/* I PLUVIOMETRI VICINI E I LORO MILLIMETRI. Dai file giornalieri gia' nel repo (nessuna rete, nessuna chiamata alle
   fonti), con le regole dei riepiloghi (genera-riepiloghi.js): le stesse cartelle della regione (REGIONI), i pluviometri
   esclusi dalla mappa fuori (lib-escluse.js), un totale su 7 o 30 giorni vale solo con il 60% dei giorni in cui la rete
   ha il file. ⚠️ IL GIORNO E' QUELLO DELLA PAGINA REGIONE: «ieri» e' l'ultimo giorno completo del suo riepilogo
   (data/riepiloghi/<regione>.json, la fine dei 7 giorni), cosi' le due pagine dicono lo stesso giorno. ⚠️ Qui si scrive
   «misurati» al pluviometro: i giorni a stima (stazione `om`, i buchi tappati con ICON-2I) non entrano nelle somme e
   contano come giorni mancanti (nelle zone piogge entrano nei periodi lunghi perche' sono medie dichiarate).
   Si prendono i pluviometri veri entro 10 km, al massimo 5, dal piu' vicino; se non ce n'e' nessuno, i tre piu' vicini
   entro 20 km (Olbia: Golfo Aranci, 13 km), e la pagina dice dove sono. */
const { leggi, giorniIndietro } = require('./lib-giorni.js');
const { escluse, escluso } = require('./lib-escluse.js');
let ESCLUSE = null;
const COPERTURA = k => k === 'friuli' ? 0.8 : 0.6;   // come COPERTURA_REGIONE di genera-riepiloghi.js
const kmDa = (a, b) => { const r = Math.PI / 180, x = (b.lon - a.lon) * r * Math.cos((a.lat + b.lat) / 2 * r), y = (b.lat - a.lat) * r; return Math.sqrt(x * x + y * y) * 6371; };
function ultimoGiornoDi(k) {
  try {
    const p = JSON.parse(fs.readFileSync(path.join(RADICE, 'data', 'riepiloghi', k + '.json'), 'utf8')).periodi || {};
    return (p['7'] || p['1'] || {}).ultimo || null;
  } catch (e) { return null; }
}
const fileCache = {};
function staz(dir, g) { const c = dir + '/' + g; return c in fileCache ? fileCache[c] : (fileCache[c] = leggi(dir, g)); }
function pluviometriVicini(r, c) {
  if (!ESCLUSE) ESCLUSE = escluse(RADICE);
  const fine = ultimoGiornoDi(r.k);
  if (!fine) return null;
  const gg = [fine].concat(giorniIndietro(fine, 29));   // 30 giorni, gg[0] = «ieri»
  // i candidati: veri (non `om`) in almeno uno degli ultimi 7 giorni, non esclusi, entro 20 km
  const cand = new Map();
  for (const d of r.dirs) for (let i = 0; i < 7; i++) for (const s of staz(d, gg[i]) || []) {
    const id = d + ':' + s.id;
    // solo chi misura la pioggia: le stazioni con la sola temperatura hanno mm sempre null (Palermo UIR)
    if (cand.has(id) || s.om || s.mm == null || s.lat == null || escluso(ESCLUSE, r.k, [s.id, s.n])) continue;
    const km = kmDa(c, s);
    if (km <= 20) cand.set(id, { id:s.id, dir:d, n:bello(s.n), lat:s.lat, lon:s.lon, q:s.q == null ? null : s.q, km });
  }
  let scelti = [...cand.values()].sort((a, b) => a.km - b.km || String(a.id).localeCompare(String(b.id)));
  // due cartelle della stessa regione possono avere lo stesso pluviometro (gemelle, ~1 km): si tiene il primo
  scelti = scelti.filter((p, i) => !scelti.slice(0, i).some(q => q.dir !== p.dir && kmDa(p, q) < 1));
  const somma = (p, n) => {
    let t = 0, visti = 0, disponibili = 0;
    for (let i = 0; i < n; i++) {
      const tutte = staz(p.dir, gg[i]); if (!tutte) continue;
      disponibili++;
      const s = tutte.find(x => String(x.id) === String(p.id));
      if (!s || s.mm == null || s.om) continue;   // niente dato o stima: giorno mancante
      t += s.mm; visti++;
    }
    return visti && visti >= disponibili * COPERTURA(r.k) ? Math.round(t * 10) / 10 : null;
  };
  for (const p of scelti) { p.m1 = somma(p, 1); p.m7 = somma(p, 7); p.m30 = somma(p, 30); }
  // un pluviometro con tre trattini (quasi muto nel mese: Palermo UIR) non dice niente e resta fuori
  scelti = scelti.filter(p => p.m1 != null || p.m7 != null || p.m30 != null);
  const vicini = scelti.filter(p => p.km <= 10);
  return { fine, lista: (vicini.length ? vicini : scelti).slice(0, vicini.length ? 5 : 3) };
}

// numeri e date scritti come nelle pagine meteo: «0», «2,2», «162»; «1,6 km», «13 km»; «3 novembre»
const mmT = n => n == null ? '—' : n === 0 ? '0' : n < 10 ? n.toFixed(1).replace('.', ',') : String(Math.round(n));
const kmT = k => k < 10 ? k.toFixed(1).replace('.', ',') + ' km' : Math.round(k) + ' km';
const dataT = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString('it-IT', { day:'numeric', month:'long', timeZone:'UTC' });
const aCitta = n => (/^[Aa]/.test(n) ? 'ad ' : 'a ') + n;
const agenziaDi = r => r.agenziaCorta || String(r.agenzia || '').replace(/\s*\(.*\)$/, '');

// i nomi sopra la foto della pagina citta'. ⚠️ Dall'8/11/2026 (scheda 127) la cartina si apre come quella della regione
// (Italia e un pezzo d'Europa, vedi lib/pagina-adesso.js), quindi PRIMA gli stessi nomi della regione (le sue citta',
// i capoluoghi d'Italia, le grandi citta' estere) e solo DOPO i comuni intorno sopra i 10.000 abitanti, dal piu'
// popoloso, che compaiono avvicinandosi col «+» (prima, coi vicini davanti, all'apertura usciva Savona accanto a Milano
// al posto di Firenze). La citta' stessa e' gia' in testa (D.citta).
// ⚠️ I comuni intorno portano `v:1` (8/11/2026, scheda 128 quater): lib/pagina-adesso.js li scrive solo dal primo «+» in
// su. All'apertura entravano dove c'era posto: a Trapani Bagheria al posto di Palermo (che urta la scritta di Trapani).
const PAESI_POP = fs.readFileSync(path.join(RADICE, 'data', 'elenco-paesi.txt'), 'utf8').split('\n').map(r => r.split('|'))
  .filter(p => p.length >= 6 && +p[5] >= 10000).map(p => ({ n:p[0], lat:+(+p[1]).toFixed(3), lon:+(+p[2]).toFixed(3), pop:+p[5] }))
  .sort((a, b) => b.pop - a.pop);
function nomiCitta(r, c) {
  const visti = new Set([c.n]);
  const vicini = PAESI_POP.filter(p => Math.abs(p.lat - c.lat) < 1.3 && Math.abs(p.lon - c.lon) < 1.8).slice(0, 60)
    .map(p => ({ n:p.n, lat:p.lat, lon:p.lon, v:1 }));
  return cittaDi(r).map(x => ({ n:x.n, lat:x.lat, lon:x.lon })).concat(nomiDi(r), vicini)
    .filter(p => !visti.has(p.n) && visti.add(p.n));
}

const attr = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const nomeCortoDi = r => r.nomeTitolo || r.nome;
const linkPrev = c => `${SITO}/previsioni/?r=${c.reg}&amp;pl=${c.lat},${c.lon}&amp;pn=${encodeURIComponent(c.n)}`;

// lo stile di questa pagina (dal mockup approvato il 18/10)
const STILE_ADESSO = `
.rb{border:1px solid var(--bordo);border-radius:14px;overflow:hidden;background:#fff;margin:14px 0 8px;box-shadow:0 8px 20px rgba(15,45,77,.14);}
.rb-testa{display:flex;align-items:center;gap:10px;background:#0f2d4d;color:#fff;padding:10px 14px;font-size:15.5px;}
.rb-testa b{font-weight:800;letter-spacing:.3px;}
.rb-testa .quando{margin-left:auto;opacity:.9;font-size:14.5px;white-space:nowrap;}
.vivo{width:11px;height:11px;border-radius:50%;background:#ff3b30;flex:none;box-shadow:0 0 0 0 rgba(255,59,48,.7);animation:vivo 1.6s infinite;}
@keyframes vivo{0%{box-shadow:0 0 0 0 rgba(255,59,48,.7)}70%{box-shadow:0 0 0 9px rgba(255,59,48,0)}100%{box-shadow:0 0 0 0 rgba(255,59,48,0)}}
/* fondo = il mare aperto della foto, come nella mappa (body.foto-on #map): al telefono fra due tessere resta un filo di
   fondo (la mappa cade a mezzo pixel). Se la foto non arriva torna la cartina (.osm), col suo mare */
#mappa{height:470px;background:#123a52;}
#mappa.osm{background:#aad3df;}
/* la foto della mappa con la sua luce (LUCE_SAT di index.html), e i nomi bianchi come i «NOMI NOSTRI» della mappa */
#mappa .leaflet-foto-pane{filter:brightness(${LUCE}) saturate(1.1);}
.nome-paese{white-space:nowrap;pointer-events:none;}
.nome-paese span{position:absolute;left:0;top:0;transform:translate(-50%,-100%);margin-top:-5px;color:#fff;font-weight:600;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;line-height:1.15;text-shadow:0 0 3px rgba(0,0,0,.85),0 1px 2px rgba(0,0,0,.6);}
.rb .tasti{grid-template-columns:repeat(3,1fr);margin:0;padding:12px 12px 4px;}
.rb .tasti a{cursor:pointer;user-select:none;}
.rb-scala{padding:8px 14px 12px;}
.rb-barra{height:11px;border-radius:4px;background:linear-gradient(90deg,#00a3e0 0%,#005588 26%,#ffee00 45%,#ffaa00 63%,#ff4400 81%,#c10000 100%);}
.rb-num{display:flex;justify-content:space-between;font-size:12px;color:#6b7a8d;margin-top:3px;}
.rb-par{display:flex;justify-content:space-between;font-size:13px;color:#445;margin-top:1px;font-weight:600;}
.rb-stato{font-size:13.5px;color:#6b7a8d;padding:0 14px 12px;margin-top:-4px;}
.rb-stato.err{color:#b3261e;font-weight:600;}
.pila{display:grid;gap:18px;margin:22px 0 10px;}
.reg-lista{display:grid;grid-template-columns:repeat(3,1fr);gap:4px 14px;margin:10px 0 4px;padding:0;list-style:none;}
.reg-lista a{display:block;padding:7px 2px;border-bottom:1px solid var(--bordo);font-weight:600;color:var(--blu);text-decoration:none;font-size:16px;}
.reg-lista a:hover{text-decoration:underline;}
.leaflet-container{font:inherit;}
.leaflet-container .leaflet-control-attribution{font-size:11px;line-height:1.4;}
/* leaflet.css mette «plus-lighter» sulle tessere: col fondo non nero il filo fra due tessere diventa PIU' CHIARO */
#mappa .fondo img.leaflet-tile{mix-blend-mode:normal;}
.pv-cerca{position:relative;background:#fff;border:2px solid var(--blu);border-radius:14px;padding:14px 16px 12px;margin:12px 0 6px;box-shadow:0 6px 16px rgba(15,45,77,.14);}
.pv-cerca label{display:block;font-weight:800;font-size:18px;color:var(--blu-scuro);margin-bottom:8px;}
.pv-riga{display:flex;gap:10px;}
.pv-riga input{flex:1;min-width:0;font:inherit;font-size:17px;padding:11px 13px;border:1px solid #b9c7da;border-radius:10px;color:#10263f;}
.pv-riga input:focus{outline:2px solid #3f8fe8;outline-offset:0;border-color:#3f8fe8;}
.pv-riga button{font:inherit;font-size:16px;font-weight:700;color:#fff;background:var(--blu);border:none;border-radius:10px;padding:0 18px;cursor:pointer;box-shadow:0 3px 0 #0c2440;}
.pv-cerca .nota{margin:8px 0 0;font-size:13.5px;}
.pv-lista{position:absolute;left:16px;right:16px;top:100%;margin-top:-6px;z-index:900;list-style:none;padding:4px 0;background:#fff;border:1px solid #c9d6e6;border-radius:10px;box-shadow:0 12px 28px rgba(15,45,77,.25);display:none;}
.pv-lista.aperta{display:block;}
.pv-lista li{display:flex;align-items:baseline;gap:8px;padding:10px 14px;cursor:pointer;font-size:16.5px;}
.pv-lista li:hover,.pv-lista li.su{background:#eef4fd;}
.pv-lista li small{color:#6b7a8d;font-size:13.5px;margin-left:auto;white-space:nowrap;}
.pv-lista li.vuoto{color:#6b7a8d;cursor:default;}
.cit-tit{font-size:18px;color:var(--blu-scuro);margin:22px 0 2px;}
#pv-quando{margin:0 0 10px;}
/* le carte vanno a capo e l'ULTIMA RIGA SI CENTRA: in 12 regioni su 19 l'ultima riga non e' piena */
.citta{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;}
.cit{flex:0 0 calc((100% - 24px) / 3);display:flex;flex-direction:column;background:var(--grigio);border:1px solid var(--bordo);border-radius:14px;padding:12px 14px 13px;text-decoration:none;color:#334;transition:background .1s;}
.cit:hover{background:#e7eef9;}
.cit-testa{display:flex;justify-content:space-between;align-items:flex-start;gap:6px;}
.cit-testa b{font-size:17px;color:var(--blu-scuro);line-height:1.25;}
.cit-ic{font-size:34px;line-height:1;margin-top:-2px;}
.cit-t{font-size:34px;font-weight:800;color:var(--blu-scuro);line-height:1.05;margin-top:-6px;}
.cit-t small{font-size:13.5px;font-weight:600;color:#6b7a8d;margin-left:6px;letter-spacing:0;}
.cit-cond{font-size:14px;color:#555;margin:2px 0 8px;}
.cit-gg{font-size:14px;line-height:1.55;padding-bottom:10px;}
.cit-gg b{color:var(--blu-scuro);}
.cit-gg .mmw,.cit-cond .mmw{color:#1f6fd1;font-weight:700;white-space:nowrap;margin-left:3px;}
.cit-vai{margin-top:auto;align-self:flex-start;font-size:14px;font-weight:700;color:var(--blu);background:#fff;border:1px solid #c9d6e6;border-radius:20px;padding:4px 13px;white-space:nowrap;}
/* LA RIGA VIVA (30/10/2026, suo: «dovrebbe dire se e come sta piovendo»): la scrive il radar (rigaViva in
   lib/pagina-adesso.js), come «Il punto di stamattina» delle pagine meteo; il pallino rosso e' quello di IN DIRETTA */
.ad-ora{background:#eef5fb;border-left:4px solid var(--blu);border-radius:8px;padding:11px 14px 12px;margin:4px 0 12px;font-size:16px;line-height:1.5;color:#1f2d3a;min-height:48px;}
.ad-ora b{color:var(--blu-scuro);}
.ad-q{display:flex;align-items:center;gap:7px;font-size:12px;color:#5a6b7d;margin-bottom:3px;text-transform:uppercase;letter-spacing:.04em;font-weight:700;}
.ad-q::before{content:"";width:8px;height:8px;border-radius:50%;background:#ff3b30;flex:none;}
#ad-t{display:block;}
/* «Previsioni meteo valle per valle» e «paese per paese» (30/10/2026): le pagine meteo della regione, linkMeteoRegione
   di genera-pagine-meteo-zona.js; pillole che vanno a capo */
.mv-nota{margin:0 0 10px;}
.mv{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 6px;}
.mv-c{display:inline-block;padding:8px 14px;border:1px solid #c9d6e6;border-radius:20px;background:#fff;color:var(--blu);font-weight:700;font-size:15px;text-decoration:none;}
.mv-c:hover{background:#eef4fd;}
.mv-c::after{content:" →";}
/* LA BARRA CHE SCORRE sotto il radar (30/10/2026, suo: «sì, tutti e due»): le citta' della regione con icona, minima e
   massima di oggi, come la vista Italia della mappa e le pagine meteo. ⚠️ Le stesse regole di .pz-nastro in
   genera-pagine-meteo-zona.js e lo stesso codice (lib/pagina-adesso.js): se cambia li', si cambia anche qui */
.pz-nastro{position:relative;height:44px;overflow:hidden;background:#ffd400;border-top:1px solid #e0b800;scroll-margin-top:12px;display:flex;align-items:center;touch-action:pan-y;user-select:none;-webkit-user-select:none}
.pz-nastro[hidden]{display:none}
.pz-nastro .lab{position:absolute;left:0;top:0;bottom:0;z-index:2;display:flex;align-items:center;gap:8px;padding:0 30px 0 16px;background:#c8102e;color:#fff;clip-path:polygon(0 0,100% 0,calc(100% - 14px) 100%,0 100%);font:900 13px/1.1 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;letter-spacing:.05em;white-space:nowrap}
.pz-nastro .lab span{font-size:12px;font-weight:800;color:#ffe36b;letter-spacing:.06em}
.pz-nastro .lab b{font-weight:900}.pz-nastro .lab em{font-style:normal}.pz-nastro .lab.corto em{display:none}
.pz-nastro .t{display:flex;white-space:nowrap;will-change:transform;cursor:grab}
.pz-nastro .v{flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;border:0;background:none;color:#111;font:700 14px system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;padding:0 16px;border-right:2px solid #c8102e;cursor:pointer}
.pz-nastro .v b{font-weight:900;text-transform:uppercase;letter-spacing:.03em}.pz-nastro .v .ic{font-size:18px}
.pz-nastro .v .mn{color:#5c4a00;font-weight:700}.pz-nastro .v .mx{color:#111;font-weight:900}
@media (max-width:600px){.pz-nastro{height:40px}
  .pz-nastro .lab{flex-direction:column;align-items:flex-start;justify-content:center;gap:0;font-size:10.5px;line-height:1.05;padding:0 22px 0 10px;white-space:normal;max-width:38%}.pz-nastro .lab span{font-size:10px}
  .pz-nastro .v{font-size:13px;padding:0 12px;gap:5px}.pz-nastro .v .ic{font-size:15px}}
@media(max-width:640px){.citta{gap:10px;} .cit{flex-basis:calc((100% - 10px) / 2);padding:11px 12px 12px;}
  .cit-t{font-size:30px;} .cit-ic{font-size:30px;} .cit-gg{font-size:13.5px;} .cit-vai{font-size:13.5px;padding:4px 11px;}
  #mappa{height:380px;} .reg-lista{grid-template-columns:repeat(2,1fr);}
  /* «Foto: NASA, ESA WorldCover» e' piu' lunga di «© OpenStreetMap»: a 11 px i crediti andavano a capo a 393 */
  .leaflet-container .leaflet-control-attribution{font-size:10.5px;}
  .rb-testa{font-size:14.5px;} .rb-testa .quando{font-size:13.5px;}}
`;

// lo stile in piu' delle pagine citta' (4/11/2026, scheda 118 bis): la previsione della citta' e la tabella dei pluviometri
const STILE_CITTA = `
.cq{background:var(--grigio);border:1px solid var(--bordo);border-radius:14px;padding:14px 16px 12px;margin:12px 0 8px;}
.cq-ora{display:flex;align-items:center;gap:14px;min-height:62px;}
.cq-ora .cit-ic{font-size:46px;margin:0;}
.cq-ora .cit-t{margin:0;}
.cq-ora .cit-cond{margin:2px 0 0;}
.cq-ore{display:flex;gap:8px;overflow-x:auto;padding:12px 0 8px;margin:10px 0 2px;border-top:1px solid var(--bordo);scrollbar-width:thin;}
.cq-h{flex:0 0 auto;min-width:58px;text-align:center;font-size:13.5px;color:#445;background:#fff;border:1px solid var(--bordo);border-radius:10px;padding:6px 5px 7px;}
.cq-h b{display:block;color:var(--blu-scuro);font-size:13px;}
.cq-h .ic{display:block;font-size:22px;line-height:1.35;}
.cq-h .t{font-weight:800;color:var(--blu-scuro);font-size:15px;}
.cq-h .mmw{display:block;margin:1px 0 0;font-size:12.5px;}
.cq-h .pc{display:block;font-size:11.5px;color:#5a6b7d;}
.cq-gg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0 12px;}
.cq-g{background:#fff;border:1px solid var(--bordo);border-radius:10px;padding:8px 10px;font-size:14px;line-height:1.5;}
.cq-g b{color:var(--blu-scuro);}
.cq-g .mmw{color:#1f6fd1;font-weight:700;white-space:nowrap;}
/* il link alle previsioni sulla mappa: la pillola delle carte della regione, che li' sta dentro un <a> (qui e' lui il link) */
.cq .cit-vai{display:inline-block;text-decoration:none;}
.cq .cit-vai:hover{background:#eef4fd;}
.pc-frase{font-size:16px;line-height:1.55;margin:6px 0 10px;}
.pc-tab{width:100%;border-collapse:collapse;font-size:15px;margin:6px 0 6px;}
.pc-tab th{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#5a6b7d;text-align:right;padding:6px 8px;border-bottom:2px solid var(--bordo);white-space:nowrap;}
.pc-tab th:first-child,.pc-tab td:first-child{text-align:left;}
.pc-tab td{padding:8px;border-bottom:1px solid var(--bordo);text-align:right;font-variant-numeric:tabular-nums;font-weight:800;color:var(--blu-scuro);white-space:nowrap;}
.pc-tab td:first-child{font-weight:700;color:#1f2d3a;white-space:normal;}
.pc-tab td small{display:block;font-weight:500;color:#5a6b7d;font-size:12.5px;}
@media(max-width:640px){.cq{padding:12px 12px 10px;} .cq-gg{gap:6px;} .cq-g{font-size:13px;padding:7px 7px;}
  .pc-tab{font-size:14px;} .pc-tab td,.pc-tab th{padding:7px 4px;} .pc-tab th{font-size:11px;letter-spacing:0;}}
`;

// ⚠️ 31/10/2026 (scheda 104 bis, suo «tutte e sei»): «RADAR METEO <REGIONE>» IN TESTA.
// Search Console 19-30/10: 11.729 viste e l'1,5% di clic. «radar meteo <regione>» ci
// vede al 9°-21° posto, e su Google tutti quelli sopra cominciano il titolo cosi'.
// «pioggia in diretta <regione>» invece e' quasi sempre il nome di un altro sito
// (Pioggia Diretta, primo): li' siamo gia' terzi. «Dove sta piovendo adesso» resta
// dentro, e la scritta grande comincia come il titolo (Google, quando lo riscrive,
// prende lei).
function titoloDi(r) {
  const n = nomeCortoDi(r);
  return [`Radar meteo ${n}: dove sta piovendo adesso, in diretta`,
          `Radar meteo ${n}: dove sta piovendo adesso`,
          `Radar meteo ${n}: dove piove adesso`].find(t => t.length <= 62);
}
function descrDi(r) {
  const n = nomeCortoDi(r);
  return [`Radar meteo ${n} in diretta: dove sta piovendo in questo momento, le ultime 2 ore e i prossimi 40 minuti, e le previsioni delle città.`,
          `Radar meteo ${n} in diretta: dove piove adesso, le ultime 2 ore e i prossimi 40 minuti, con le previsioni delle città.`,
          `Radar meteo ${n} in diretta: dove piove adesso e le previsioni delle città.`].find(t => t.length <= 158);
}

function pagina(r) {
  const citta = cittaDi(r), gen = GEN2[r.k];
  // dove/gen per la riga viva: «Non piove in Toscana», «bagna il 15% della Toscana»
  // foto e nomi: la cartina con la faccia della mappa (2/11/2026, scheda 111 ter)
  // capo: il capoluogo di regione, dove sta il segnalino rosso del radar (8/11/2026, scheda 127, suo: «il segnalino delle
  // regioni deve essere sul capoluogo»)
  const cp = (CAPOLUOGHI[r.k] || []).find(x => x.n === CAPOLUOGO_REGIONE[r.k]);
  const dati = JSON.stringify({ k:r.k, nome:nomeCortoDi(r), dove:`${r.prep} ${r.nome}`, gen, sito:SITO, citta, confine:confineDi(r),
    foto:FOTO, nomi:nomiDi(r), capo:cp ? { n:cp.n, lat:cp.lat, lon:cp.lon } : null }).replace(/</g, '\\u003c');
  // le pagine meteo della regione (qui e non in cima: genera-pagine-meteo-zona.js chiede confineDi a questo file)
  const valli = require('./genera-pagine-meteo-zona.js').linkMeteoRegione(r.k, 'pagina-' + r.k + '-adesso');
  // il percorso (31/10/2026, scheda 104 bis): la regione in mezzo solo se ha la sua pagina (l'Abruzzo no)
  const briciola = [['Mappa pluviometrica', SITO + '/']].concat(r.senzaPagina
    ? [['Radar meteo ' + r.nome, null]] : [[r.nome, `${SITO}/${r.k}/`], ['Radar adesso', null]]);
  const carte = citta.map((c, i) => `<a class="cit" data-i="${i}" href="${linkPrev(c)}"><div class="cit-testa"><b>${c.n}</b><span class="cit-ic"></span></div>`
    + `<div class="cit-t">&nbsp;</div><div class="cit-cond">&nbsp;</div><div class="cit-gg">&nbsp;<br>&nbsp;</div><span class="cit-vai">7 giorni →</span></a>`).join('\n');
  const altre = LISTA.filter(x => x.k !== r.k).map(x => `<li><a href="${SITO}/${x.k}/adesso/">${x.nome}</a></li>`).join('\n');
  const ieri = r.senzaPagina ? '' : `
<h2>Quanta pioggia è caduta</h2>
<p>Il radar dice dove piove adesso. Quanta acqua è caduta davvero lo misurano i pluviometri a terra, millimetro per millimetro: ieri, negli ultimi 7, 20 e 30 giorni.</p>
<a class="ieri-btn" href="${SITO}/${r.k}/">
  <b>Dove ha piovuto ieri ${r.prep} ${r.nome}</b><small>I millimetri di ${stazDi(r, RADICE)} pluviometri${HA_ZONE.has(r.k) ? ', zona per zona' : ''}</small><i>→</i></a>
`;
  // le pagine delle citta' (4/11/2026, scheda 118 bis): dalla regione alla citta', subito sotto il radar
  const cittaPag = cittaAdesso(r.k);
  const radarCitta = !cittaPag.length ? '' : `
<h2>Il radar città per città</h2>
<p class="mv-nota">Il radar centrato sulla città, la previsione ora per ora e i millimetri dei pluviometri più vicini.</p>
<div class="mv">${cittaPag.map(c => `<a class="mv-c" href="${SITO}/${r.k}/adesso/${c.slug}/" onclick="try{gtag('event','apri_adesso_citta',{da:'pagina-${r.k}-adesso',posto:'${c.slug}'})}catch(e){}">Radar ${c.n}</a>`).join('')}</div>
`;
  const radarPluvio = r.senzaPagina
    ? `<p>Il radar guarda la pioggia in quota: può vedere gocce che evaporano prima di toccare terra, o perderla dietro le montagne.</p>`
    : `<p>Il radar guarda la pioggia in quota: può vedere gocce che evaporano prima di toccare terra, o perderla dietro le montagne.
I pluviometri la misurano a terra. Per sapere quanta ne è caduta c'è la pagina <a href="${SITO}/${r.k}/">Dove ha piovuto ${r.prep} ${r.nome}</a>.</p>`;
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${attr(titoloDi(r))}</title>
<meta name="description" content="${attr(descrDi(r))}">
<link rel="canonical" href="${SITO}/${r.k}/adesso/">
${briciolaJson(briciola)}
<meta property="og:title" content="${attr(`Dove sta piovendo adesso ${r.prep} ${r.nome}`)}">
<meta property="og:description" content="${attr(descrDi(r))}">
<meta property="og:image" content="${SITO}/preview.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta property="og:url" content="${SITO}/${r.k}/adesso/">
<meta property="og:type" content="website">
<!-- Google tag: il config solo sul dominio vero, come le pagine regione -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  if (/(^|\\.)avventuremicologiche\\.it$/.test(location.hostname)) {
    gtag('config', '${GA_ID}');
  }
</script>
<link rel="stylesheet" href="/lib/leaflet/1.9.4/leaflet.css">
<style>
${STILE_BASE}
${STILE_NUOVO}
${STILE_IERI}
${RILIEVO}${STILE_ADESSO}${QUIZ_REGIONI[r.k] ? QUIZ_CSS : ''}${BRIC_CSS}${TESTATA_CSS}</style>
</head>
<body>
${testata({ sito: SITO, canale: CANALE, reg: r.k, ga: 'pagina-' + r.k + '-adesso', attiva: '' })}
<main>
${briciolaHtml(briciola)}
<h1>Radar meteo ${r.nome}: dove sta piovendo adesso</h1>
<p class="sotto"><b>Radar della pioggia in diretta</b>: le macchie colorate sono la pioggia che sta cadendo adesso. Si aggiorna da solo ogni 5 minuti.</p>
<div class="ad-ora" aria-live="polite"><span class="ad-q" id="ad-q">Adesso</span><span id="ad-t">Sto guardando il radar…</span></div>

<div class="rb">
  <div class="rb-testa"><span class="vivo"></span><b>IN DIRETTA</b><span class="quando" id="quando">carico il radar…</span></div>
  <div id="mappa"></div>
  <div class="pz-nastro" id="nastro"><div class="lab"><b>METEO<em> ${attr(nomeCortoDi(r).toUpperCase())}</em></b><span>OGGI</span></div><div class="t"></div></div>
  <div class="tasti">
    <a data-id="ora">Adesso</a>
    <a data-id="due">▶ −2 ore</a>
    <a class="forte" data-id="prev">+40 min</a>
  </div>
  <div class="rb-scala">
    <div class="rb-barra"></div>
    <div class="rb-num"><span>0,5</span><span>3</span><span>6</span><span>12</span><span>24</span><span>50 mm/h</span></div>
    <div class="rb-par"><span>pioviggine</span><span>pioggia forte</span></div>
  </div>
  <div class="rb-stato" id="stato">Radar della Protezione Civile sull'Italia, OPERA fuori, circa 2 km.</div>
</div>

<div class="pv-cerca">
  <label for="pv-in">☀️ Cerca una località</label>
  <div class="pv-riga"><input id="pv-in" type="search" placeholder="Paese o città" autocomplete="off" enterkeyhint="search"><button id="pv-vai" type="button">Cerca</button></div>
  <ul class="pv-lista" id="pv-lista"></ul>
  <p class="nota">Tutti i comuni d'Italia: si aprono le previsioni a 7 giorni, ora per ora.</p>
</div>

<div class="pila">
  <a class="ieri-btn" href="${SITO}/?r=${r.k}&amp;radar=ora"
     onclick="try{gtag('event','apri_mappa',{da:'pagina-${r.k}-adesso-mappa'})}catch(e){}">
    <b>Apri il radar sulla mappa completa</b><small>Ingrandisci, spostati, guarda le regioni vicine</small><i>→</i></a>
</div>
${radarCitta}
<h2>Previsioni meteo ${r.prep} ${r.nome}</h2>

<h3 class="cit-tit">Previsioni nelle città ${gen}</h3>
<p class="nota" id="pv-quando">Previsioni del modello ECMWF via MET Norway. La pioggia che cade adesso la mostra il radar qui sopra.</p>
<div class="citta" id="citta">
${carte}
</div>
${valli}${ieri}
<h2>Dove sta piovendo adesso nelle altre regioni</h2>
<ul class="reg-lista">
${altre}
</ul>

<div class="noioso">
<h2>Come funziona il radar</h2>
<p>Il radar meteo manda un fascio di onde radio e misura quanto ne torna indietro dalle gocce: più il colore è acceso, più forte piove.
Sull'Italia le immagini sono quelle della rete radar della Protezione Civile (Radar-DPC), fuori dall'Italia quelle della rete europea OPERA, a circa 2 km di risoluzione, distribuite da LibreWXR. Un fotogramma nuovo arriva ogni 10 minuti
e la pagina lo carica da sola.</p>
<h2>Le ultime 2 ore e i prossimi 40 minuti</h2>
<p>«▶ −2 ore» fa scorrere i fotogrammi delle ultime due ore: si vede da dove arriva la pioggia e dove sta andando. «+40 min»
sposta le macchie di adesso nella direzione in cui si muovono, per i prossimi quaranta minuti. Non è una previsione del tempo, vale solo per l'ora che viene.</p>
<h2>Radar e pluviometri: perché a volte non coincidono</h2>
${radarPluvio}
<p><a href="${SITO}/guida/" onclick="try{gtag('event','click_guida',{pulsante:'pagina-${r.k}-adesso'})}catch(e){}">📖 Guida alla mappa: come si usa, tutte le funzioni</a></p>
${coppiaQuiz(r.k, `<a href="${CANALE}" target="_blank" rel="noopener" class="yt-btn"
   onclick="try{gtag('event','click_youtube',{pulsante:'pagina-${r.k}-adesso-fondo'})}catch(e){}"><svg width="21" height="15" viewBox="0 0 42 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="42" height="30" rx="6" fill="#e12b2b"/><polygon points="16,7 16,23 31,15" fill="#fff"/></svg>Vieni a trovarci su YouTube</a>`, 'pagina-' + r.k + '-adesso-fondo')}
</div>
</main>

<footer>
${navAltre('regione')}
  Radar: <a href="https://librewxr.net/" target="_blank" rel="noopener">LibreWXR</a> · <a href="https://radar.protezionecivile.it/" target="_blank" rel="noopener">Radar-DPC</a>, Dipartimento della Protezione Civile (<a href="https://creativecommons.org/licenses/by-sa/4.0/deed.it" target="_blank" rel="noopener">CC BY-SA 4.0</a>) · EUMETNET OPERA (CC BY 4.0) ·
  Previsioni: MET Norway (CC BY 4.0) ·
  <a href="${SITO}/fonti">tutte le fonti e licenze</a> ·
  <a href="https://avventuremicologiche.it">Avventure Micologiche</a><br>
  La mappa copre Italia, Svizzera, Austria, Francia e Slovenia — 5000+ stazioni.
</footer>

<script id="adesso-dati" type="application/json">${dati}</script>
<script src="/lib/leaflet/1.9.4/leaflet.js"></script>
<script src="/lib/pagina-adesso.js?v=${VERSIONE_JS}"></script>
</body>
</html>
`;
}

/* ── LA PAGINA DI UNA CITTA' (4/11/2026, scheda 118 bis): vedi CITTA_ADESSO qui sopra ── */
function titoloCitta(c) {
  return [`Radar meteo ${c.n}: sta piovendo adesso? In diretta`, `Radar meteo ${c.n}: sta piovendo adesso?`, `Radar meteo ${c.n}: piove adesso?`].find(t => t.length <= 62);
}
function descrCitta(c) {
  const a = aCitta(c.n);
  return [`Sta piovendo ${a}? Radar meteo in diretta su ${c.n} e dintorni: la pioggia di adesso, le ultime 2 ore, la previsione e i pluviometri vicini.`,
          `Sta piovendo ${a}? Radar meteo in diretta, la pioggia delle ultime 2 ore, la previsione e i pluviometri vicini.`,
          `Sta piovendo ${a}? Il radar meteo in diretta e i pluviometri vicini.`].find(t => t.length <= 158);
}
// il blocco dei pluviometri, scritto coi numeri di oggi; data-ultimo = il giorno dei numeri (la sitemap lo legge)
function bloccoPluviometri(r, c, pv) {
  const IN = aCitta(c.n);
  if (!pv || !pv.lista.length) return `
<h2>La pioggia caduta ${IN}</h2>
<p class="pc-frase">Nei 20 km intorno ${IN} non c'è un pluviometro della rete ${attr(agenziaDi(r))} con dati recenti. Quanta pioggia è caduta nel resto della regione lo dice la pagina <a href="${SITO}/${r.k}/">Dove ha piovuto ${r.prep} ${r.nome}</a>.</p>
`;
  const L0 = pv.lista, giorno = dataT(pv.fine);
  // dove sta il pluviometro: «in città» sotto il chilometro, se no la distanza dal centro
  const dove = p => p.km < 1 ? 'in città' : `a ${kmT(p.km)} dal centro`;
  const p0 = L0.find(p => p.m1 != null) || L0[0];
  const frase = [];
  if (p0.m1 == null) frase.push(`<span class="pc-ieri">Il ${giorno}</span> il pluviometro <b>${attr(p0.n)}</b>, ${dove(p0)}, non ha mandato dati.`);
  else frase.push(`<span class="pc-ieri">Ieri, ${giorno},</span> al pluviometro <b>${attr(p0.n)}</b>, ${dove(p0)}, ` + (p0.m1 > 0 ? `sono caduti <b>${mmT(p0.m1)} mm</b>.` : `non è caduta pioggia.`));
  const lunghi = [p0.m7 != null ? `negli ultimi 7 giorni <b>${mmT(p0.m7)} mm</b>` : '', p0.m30 != null ? `negli ultimi 30 giorni <b>${mmT(p0.m30)} mm</b>` : ''].filter(Boolean);
  if (lunghi.length) frase.push(lunghi.join(', ').replace(/^n/, 'N') + '.');
  // il piu' bagnato dei vicini, se non e' il primo
  const bagnato = L0.filter(p => p !== p0 && p.m1 != null && p.m1 > (p0.m1 || 0)).sort((a, b) => b.m1 - a.m1)[0];
  if (bagnato) frase.push(`Fra i pluviometri vicini il più bagnato è stato <b>${attr(bagnato.n)}</b>, ${dove(bagnato)}, con <b>${mmT(bagnato.m1)} mm</b>.`);
  if (p0.km > 10) frase.push(`Più vicino ${IN} non ci sono pluviometri della rete con dati recenti.`);
  const righe = L0.map(p => `<tr><td>${attr(p.n)}<small>${dove(p)}${p.q != null ? ' · ' + Math.round(p.q) + ' m' : ''}</small></td><td>${mmT(p.m1)}</td><td>${mmT(p.m7)}</td><td>${mmT(p.m30)}</td></tr>`).join('\n');
  return `
<h2>La pioggia caduta ${IN}</h2>
<p class="pc-frase" data-ultimo="${pv.fine}">${frase.join(' ')}</p>
<table class="pc-tab">
<thead><tr><th>${L0.length > 1 ? 'I pluviometri più vicini' : 'Il pluviometro più vicino'}</th><th>Ieri</th><th>7 giorni</th><th>30 giorni</th></tr></thead>
<tbody>
${righe}
</tbody>
</table>
<p class="nota">Millimetri misurati a terra (dati ${attr(agenziaDi(r))}), fino al ${giorno}. Un trattino: quel pluviometro non ha mandato abbastanza dati nel periodo.</p>
<a class="ieri-btn" href="${SITO}/${r.k}/">
  <b>Dove ha piovuto ieri ${r.prep} ${r.nome}</b><small>I millimetri di ${stazDi(r, RADICE)} pluviometri${HA_ZONE.has(r.k) ? ', zona per zona' : ''}</small><i>→</i></a>
`;
}
/* ⚠️ LA CASELLA «CERCA» SUBITO SOTTO IL RADAR (4/11/2026, sua correzione dopo averle viste in locale): per lui la casella
   e' uno degli strumenti migliori per portare altri clic, e in fondo alla pagina non la vedeva nessuno. Spostata sotto il
   radar anche nelle 21 pagine regione (suo «sì, anche lì»), dove stava dopo il tasto della mappa e le pillole delle citta'. Chi arriva per una
   citta' deve trovare subito il modo di cercarne un'altra. Etichetta «Previsioni meteo in un'altra località» (sua: la
   parola «località», non «posto»); niente h2, il titolo e' l'etichetta. Qui il commento e non nella pagina: i commenti
   delle pagine sono pubblici. */
function paginaCitta(r, c) {
  const gen = GEN2[r.k], pv = pluviometriVicini(r, c), IN = aCitta(c.n);
  const qui = { n:c.n, lat:c.lat, lon:c.lon, q:c.q, reg:r.k };
  // citta = [la citta'] per il codice delle pagine regione (nomi davanti, «entro le…»); qui = il modo citta'
  const dati = JSON.stringify({ k:r.k, nome:nomeCortoDi(r), dove:IN, gen, sito:SITO, citta:[qui], qui, confine:confineDi(r),
    foto:FOTO, nomi:nomiCitta(r, c) }).replace(/</g, '\\u003c');
  const url = `${SITO}/${r.k}/adesso/${c.slug}/`, ga = `pagina-${r.k}-adesso-${c.slug}`;
  const briciola = [['Mappa pluviometrica', SITO + '/'], [r.nome, `${SITO}/${r.k}/`], ['Radar adesso', `${SITO}/${r.k}/adesso/`], [c.n, null]];
  const stessa = cittaAdesso(r.k).filter(x => x.slug !== c.slug);
  const altre = LISTA.filter(x => x.k !== r.k).flatMap(x => cittaAdesso(x.k).map(y => ({ ...y, rn:x.nome })));
  const p0 = pv && pv.lista[0];
  const pluvioFrase = p0 ? ` ${IN.charAt(0).toUpperCase() + IN.slice(1)} il pluviometro più vicino è <b>${attr(p0.n)}</b>, ${p0.km < 1 ? 'in città' : 'a ' + kmT(p0.km) + ' dal centro'}${p0.q != null ? ', a ' + Math.round(p0.q) + ' m di quota' : ''}.` : '';
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${attr(titoloCitta(c))}</title>
<meta name="description" content="${attr(descrCitta(c))}">
<link rel="canonical" href="${url}">
${briciolaJson(briciola)}
<meta property="og:title" content="${attr(`Sta piovendo ${IN}? Il radar in diretta`)}">
<meta property="og:description" content="${attr(descrCitta(c))}">
<meta property="og:image" content="${SITO}/preview.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta property="og:url" content="${url}">
<meta property="og:type" content="website">
<!-- Google tag: il config solo sul dominio vero, come le pagine regione -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  if (/(^|\\.)avventuremicologiche\\.it$/.test(location.hostname)) {
    gtag('config', '${GA_ID}');
  }
</script>
<link rel="stylesheet" href="/lib/leaflet/1.9.4/leaflet.css">
<style>
${STILE_BASE}
${STILE_NUOVO}
${STILE_IERI}
${RILIEVO}${STILE_ADESSO}${STILE_CITTA}${QUIZ_REGIONI[r.k] ? QUIZ_CSS : ''}${BRIC_CSS}${TESTATA_CSS}</style>
</head>
<body>
${testata({ sito: SITO, canale: CANALE, reg: r.k, ga, attiva: '' })}
<main data-ondata="${c.ondata}">
${briciolaHtml(briciola)}
<h1>Radar meteo ${c.n}: sta piovendo adesso?</h1>
<p class="sotto"><b>Radar della pioggia in diretta su ${c.n}</b> e dintorni: le macchie colorate sono la pioggia che sta cadendo adesso. Si aggiorna da solo ogni 5 minuti.</p>
<div class="ad-ora" aria-live="polite"><span class="ad-q" id="ad-q">Adesso</span><span id="ad-t">Sto guardando il radar su ${c.n}…</span></div>

<div class="rb">
  <div class="rb-testa"><span class="vivo"></span><b>IN DIRETTA</b><span class="quando" id="quando">carico il radar…</span></div>
  <div id="mappa"></div>
  <div class="pz-nastro" id="nastro"><div class="lab"><b>METEO<em> ${attr(c.n.toUpperCase())}</em></b><span>PROSSIME ORE</span></div><div class="t"></div></div>
  <div class="tasti">
    <a data-id="ora">Adesso</a>
    <a data-id="due">▶ −2 ore</a>
    <a class="forte" data-id="prev">+40 min</a>
  </div>
  <div class="rb-scala">
    <div class="rb-barra"></div>
    <div class="rb-num"><span>0,5</span><span>3</span><span>6</span><span>12</span><span>24</span><span>50 mm/h</span></div>
    <div class="rb-par"><span>pioviggine</span><span>pioggia forte</span></div>
  </div>
  <div class="rb-stato" id="stato">Radar della Protezione Civile sull'Italia, OPERA fuori, circa 2 km.</div>
</div>

<div class="pv-cerca">
  <label for="pv-in">☀️ Previsioni meteo in un'altra località</label>
  <div class="pv-riga"><input id="pv-in" type="search" placeholder="Paese o città" autocomplete="off" enterkeyhint="search"><button id="pv-vai" type="button">Cerca</button></div>
  <ul class="pv-lista" id="pv-lista"></ul>
  <p class="nota">Tutti i comuni d'Italia: si aprono le previsioni a 7 giorni, ora per ora.</p>
</div>

<div class="pila">
  <a class="ieri-btn" href="${SITO}/?r=${r.k}&amp;radar=ora"
     onclick="try{gtag('event','apri_mappa',{da:'${ga}-mappa'})}catch(e){}">
    <b>Apri il radar sulla mappa completa</b><small>Ingrandisci, spostati, guarda tutta la regione</small><i>→</i></a>
</div>

<h2>Previsioni meteo ${IN}</h2>
<div class="cq" id="cq">
  <div class="cq-ora"><span class="cit-ic" id="cq-ic"></span><div><div class="cit-t" id="cq-t">&nbsp;</div><div class="cit-cond" id="cq-c">Sto chiedendo la previsione…</div></div></div>
  <div class="cq-ore" id="cq-ore"></div>
  <div class="cq-gg" id="cq-gg"></div>
  <a class="cit-vai" id="cq-vai" href="${linkPrev(qui)}">7 giorni, ora per ora →</a>
</div>
<p class="nota" id="pv-quando">Previsioni del modello ECMWF via MET Norway. La pioggia che cade adesso la mostra il radar qui sopra.</p>
${bloccoPluviometri(r, c, pv)}
<h2>Il radar nelle altre città</h2>
${stessa.length ? `<div class="mv">${stessa.map(x => `<a class="mv-c" href="${SITO}/${r.k}/adesso/${x.slug}/">Radar ${x.n}</a>`).join('')}</div>\n` : ''}<p class="mv-nota">Tutta la regione: <a href="${SITO}/${r.k}/adesso/">Radar meteo ${r.nome}, dove sta piovendo adesso</a>.</p>
<ul class="reg-lista">
${altre.map(x => `<li><a href="${SITO}/${x.reg}/adesso/${x.slug}/">${x.n}</a></li>`).join('\n')}
</ul>

<div class="noioso">
<h2>Come funziona il radar</h2>
<p>Il radar meteo manda un fascio di onde radio e misura quanto ne torna indietro dalle gocce: più il colore è acceso, più forte piove.
Sull'Italia le immagini sono quelle della rete radar della Protezione Civile (Radar-DPC), fuori dall'Italia quelle della rete europea OPERA, a circa 2 km di risoluzione, distribuite da LibreWXR. Un fotogramma nuovo arriva ogni 10 minuti
e la pagina lo carica da sola. La riga in alto guarda il radar nel punto di ${c.n} e intorno: dice se piove in città, dov'è la pioggia più vicina e se nei prossimi 40 minuti potrebbe arrivare.</p>
<h2>Le ultime 2 ore e i prossimi 40 minuti</h2>
<p>«▶ −2 ore» fa scorrere i fotogrammi delle ultime due ore: si vede da dove arriva la pioggia e dove sta andando. «+40 min»
sposta le macchie di adesso nella direzione in cui si muovono, per i prossimi quaranta minuti. Non è una previsione del tempo, vale solo per l'ora che viene.</p>
<h2>Radar e pluviometri: perché a volte non coincidono</h2>
<p>Il radar guarda la pioggia in quota: può vedere gocce che evaporano prima di toccare terra, o perderla dietro le montagne.
I pluviometri la misurano a terra.${pluvioFrase}</p>
<p><a href="${SITO}/guida/" onclick="try{gtag('event','click_guida',{pulsante:'${ga}'})}catch(e){}">📖 Guida alla mappa: come si usa, tutte le funzioni</a></p>
${coppiaQuiz(r.k, `<a href="${CANALE}" target="_blank" rel="noopener" class="yt-btn"
   onclick="try{gtag('event','click_youtube',{pulsante:'${ga}-fondo'})}catch(e){}"><svg width="21" height="15" viewBox="0 0 42 30" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="42" height="30" rx="6" fill="#e12b2b"/><polygon points="16,7 16,23 31,15" fill="#fff"/></svg>Vieni a trovarci su YouTube</a>`, ga + '-fondo')}
</div>
</main>

<footer>
${navAltre('regione')}
  Radar: <a href="https://librewxr.net/" target="_blank" rel="noopener">LibreWXR</a> · <a href="https://radar.protezionecivile.it/" target="_blank" rel="noopener">Radar-DPC</a>, Dipartimento della Protezione Civile (<a href="https://creativecommons.org/licenses/by-sa/4.0/deed.it" target="_blank" rel="noopener">CC BY-SA 4.0</a>) · EUMETNET OPERA (CC BY 4.0) ·
  Previsioni: MET Norway (CC BY 4.0) ·
  Pluviometri: ${attr(agenziaDi(r))} ·
  <a href="${SITO}/fonti">tutte le fonti e licenze</a> ·
  <a href="https://avventuremicologiche.it">Avventure Micologiche</a><br>
  La mappa copre Italia, Svizzera, Austria, Francia e Slovenia — 5000+ stazioni.
</footer>

<script id="adesso-dati" type="application/json">${dati}</script>
<script src="/lib/leaflet/1.9.4/leaflet.js"></script>
<script src="/lib/pagina-adesso.js?v=${VERSIONE_JS}"></script>
</body>
</html>
`;
}
const TUTTE_CITTA = () => LISTA.flatMap(r => cittaAdesso(r.k).map(c => [r, c]));

if (require.main === module) {
  const senza = LISTA.filter(r => !GEN2[r.k]).map(r => r.k);
  if (senza.length) { console.error('⚠️ manca il genitivo per: ' + senza.join(', ')); process.exit(1); }
  // SOLO=liguria: una pagina sola, per i campioni (sitemap non toccata, 28/10/2026). SOLO=citta (4/11/2026): solo le
  // pagine delle citta', coi numeri nuovi, e la sitemap: e' il giro del mattino (pagine-regione.yml). SOLO=citta:genova:
  // una citta' sola, sitemap non toccata
  const SOLO = process.env.SOLO || '';
  const soloCitta = /^citta(:|$)/.test(SOLO), unaCitta = soloCitta ? SOLO.split(':')[1] || '' : '';
  if (!soloCitta) for (const r of LISTA.filter(r => !SOLO || r.k === SOLO)) {
    const html = pagina(r);
    const nc = cittaDi(r).length;
    if (!nc) { console.error(`⚠️ ${r.k}: nessuna città in capoluoghi.json`); process.exit(1); }
    scrivi(path.join(RADICE, r.k, 'adesso', 'index.html'), senzaCommenti(html), true);
    console.log(`  /${r.k}/adesso/  ${nc} città · ${Math.round(Buffer.byteLength(html) / 1024)} KB · «${titoloDi(r)}» (${titoloDi(r).length})`);
  }
  let nCitta = 0;
  if (!SOLO || soloCitta) for (const [r, c] of TUTTE_CITTA().filter(([, c]) => !unaCitta || c.slug === unaCitta)) {
    const html = paginaCitta(r, c), pv = pluviometriVicini(r, c);
    scrivi(path.join(RADICE, r.k, 'adesso', c.slug, 'index.html'), senzaCommenti(html), true);
    nCitta++;
    console.log(`  /${r.k}/adesso/${c.slug}/  ${Math.round(Buffer.byteLength(html) / 1024)} KB · «${titoloCitta(c)}» (${titoloCitta(c).length}) · `
      + (pv && pv.lista.length ? `${pv.lista.length} pluv. al ${pv.fine}: ` + pv.lista.map(p => `${p.n} ${kmT(p.km)} [${mmT(p.m1)}|${mmT(p.m7)}|${mmT(p.m30)}]`).join(', ')
        : '⚠️ nessun pluviometro'));
  }
  if (unaCitta && !nCitta) { console.error(`⚠️ nessuna città «${unaCitta}» in CITTA_ADESSO`); process.exit(1); }
  if (SOLO && !(soloCitta && !unaCitta)) console.log(`(SOLO=${SOLO}: sitemap non toccata)`);
  else console.log(`\n${soloCitta ? 0 : LISTA.length} pagine regione e ${nCitta} pagine città scritte, sitemap.xml con ${scriviSitemap(SITO, RADICE)} indirizzi.`);
}

// i nomi del radar di una regione, nello stesso ordine della sua pagina «adesso» (le sue citta', poi i capoluoghi d'Italia e
// le grandi citta' estere): anche per il riquadro radar delle pagine meteo (8/11/2026, scheda 127, suo «come le adesso»)
const nomiRadar = k => cittaDi({ k }).map(c => ({ n:c.n, lat:c.lat, lon:c.lon })).concat(nomiDi({ k }));
module.exports = { LISTA, confineDi, CITTA_ADESSO, nomiRadar };   // confineDi anche per le anteprime delle pagine «Meteo <paese>» (28/10/2026)
