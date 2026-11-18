/**
 * lib-escluse.js — i pluviometri che la MAPPA esclude perche' misurano male,
 * letti dalle liste *_ESCLUSE di index.html (17/10/2026).
 *
 * PERCHE'. Le esclusioni stanno in index.html e valevano solo per la mappa:
 * le pagine funghi non le leggevano. Il 17/10/2026 otto posti esclusi dalla
 * mappa come guasti avevano ancora la loro pagina coi numeri sbagliati
 * (Cantagallo fermo a zero dal 19/9 con Acquerino a 4 km a 49 mm in tre giorni,
 * Sassa, Gabbro, Serra Pistoiese, Parana, Cimone, Sella Giassina, Osini).
 * Una lista sola, quella della mappa: quando una stazione rientra la sua pagina
 * torna normale al primo giro, senza ricordarsi di niente.
 *
 * ⚠️ LE CHIAVI VALGONO PER REGIONE, come nella mappa: l'Emilia esclude l'id
 * '8' (Loiano) e in Lombardia ci sono id numerici piccoli. Una lista unica
 * avrebbe tolto pluviometri sani di un'altra regione, in silenzio.
 * Piemonte per NOME (s.n, maiuscolo, come in mappa), le altre per id.
 *
 * Se index.html cambia forma e una lista non si legge piu', lo si stampa e si
 * va avanti senza: le pagine tornano come prima, non si rompe il giro.
 */
const fs = require('fs');
const path = require('path');

const PER_LISTA = {
  LOMB_ESCLUSE: 'lombardia', PIEMONTE_ESCLUSE: 'piemonte', LIGURIA_ESCLUSE: 'liguria',
  EMILIA_ESCLUSE: 'emilia', TOSCANA_ESCLUSE: 'toscana',
  FRIULI_ESCLUSE: 'friuli',   // 31/10/2026: Pontebba, nelle due cartelle friuli-osmer e meteohub-friuli (per ID)
  // ⚠️ PROMEMORIA (19/10/2026, quinto check, bug 18): FRANCIA_ESCLUSE di index.html (Bastia 20033015)
  // qui NON si legge. Oggi non serve, nessuna pagina usa le stazioni francesi. Se un giorno arrivano,
  // aggiungerla con la chiave delle cartelle (francia-corsica, francia-provenza…), non 'francia'.
};

/* ⚠️ LE LISTE SI LEGGONO COME LE LEGGE LA MAPPA (18/11/2026, check-139). Prima si contavano le graffe e si pescavano le
   chiavi con una regex: una graffa dentro un commento (`// vedi {…}`) spostava la fine della lista, una regione MeteoHub
   scritta fra apici ('lazio':{…}) non si leggeva, e una chiave col valore 0 (per la mappa «non esclusa») risultava
   esclusa. Le pagine si sarebbero separate dalla mappa senza avviso. Ora l'oggetto si ritaglia saltando stringhe e
   commenti, si VALUTA (vm, come fa la mappa) e valgono le chiavi col valore vero. Il 18/11 le liste uscivano identiche
   a quelle di prima (claudio\check-139). Il 17/11 (scheda 137) la trappola dei commenti sulle righe CRLF. */
const vm = require('vm');
// L'oggetto `var NOME={...}` intero, graffe comprese: le graffe dentro stringhe e commenti non contano.
function blocco(h, nome) {
  const m = new RegExp('var ' + nome + '\\s*=\\s*\\{').exec(h);
  if (!m) return null;
  const da = m.index + m[0].length - 1;
  let d = 0;
  for (let j = da; j < h.length; j++) {
    const c = h[j];
    if (c === '/' && h[j + 1] === '/') { const f = h.indexOf('\n', j); j = f < 0 ? h.length : f; continue; }
    if (c === '/' && h[j + 1] === '*') { const f = h.indexOf('*/', j + 2); j = f < 0 ? h.length : f + 1; continue; }
    if (c === "'" || c === '"') { let k = j + 1; while (k < h.length && h[k] !== c) { if (h[k] === '\\') k++; k++; } j = k; continue; }
    if (c === '{') d++;
    else if (c === '}' && --d === 0) return h.slice(da, j + 1);
  }
  return null;
}
function valuta(t, nome) {
  try { return vm.runInNewContext('(' + t + ')', {}, { timeout: 1000 }); }
  catch (e) { console.warn(`  ⚠️ lib-escluse: ${nome} non si valuta (${e.message}): pagine senza questa lista`); return null; }
}
const vere = o => Object.keys(o).filter(k => o[k]);

// { regione: Set(chiavi) }
function escluse(radice) {
  const h = fs.readFileSync(path.join(radice, 'index.html'), 'utf8');
  const out = {};
  for (const [nome, reg] of Object.entries(PER_LISTA)) {
    const b = blocco(h, nome);
    if (b == null) { console.warn(`  ⚠️ lib-escluse: ${nome} non trovata in index.html`); continue; }
    const o = valuta(b, nome);
    if (o) out[reg] = new Set(vere(o));
  }
  const mh = blocco(h, 'MH_ESCLUSE');
  const o = mh == null ? null : valuta(mh, 'MH_ESCLUSE');
  if (mh == null) console.warn('  ⚠️ lib-escluse: MH_ESCLUSE non trovata in index.html');
  else if (o) for (const reg of Object.keys(o)) {
    if (o[reg] && typeof o[reg] === 'object') out[reg] = new Set([...(out[reg] || []), ...vere(o[reg])]);
  }
  return out;
}

// Il posto p di funghi-posti.json ([id, nome, ...]) della regione reg e' escluso?
function escluso(ESC, reg, p) {
  const s = ESC[reg];
  return !!(s && (s.has(String(p[0])) || s.has(String(p[1]))));
}

module.exports = { escluse, escluso };
