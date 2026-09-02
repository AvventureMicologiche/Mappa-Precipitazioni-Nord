#!/usr/bin/env node
/**
 * I nomi dei posti: come si scrivono e come diventano un indirizzo.
 *
 * PERCHE' STA IN UN FILE SUO. `bello()` viveva dentro `genera-pagine-funghi.js`
 * e andava benissimo finche' lo usava solo lui. Dal 2/9/2026 lo vogliono in
 * tre: le pagine funghi, le pagine localita' e `genera-funghi.js`, che scrive
 * l'anagrafe dentro il file dei giorni. Lasciandolo dov'era, `genera-pagine-
 * funghi.js` e `genera-pagine-localita.js` si sarebbero richiesti a vicenda —
 * lo stesso giro che aveva gia' morso con la sitemap, dove `REGIONI` arrivava
 * `undefined`. Un file terzo che non chiede niente a nessuno chiude la
 * questione.
 */

// ⚠️ QUALI REGIONI HANNO LE PAGINE PER LOCALITA'. Il 2/9/2026: la sola
// Liguria, 112 pagine, per decisione dell'utente. NON e' una limitazione
// tecnica, il generatore le farebbe tutte e 948: e' che Google tratta male le
// pagine sottili sfornate in massa, e finche' non sappiamo se una pagina
// localita' porta clic sarebbe una scommessa su novecento carte in una volta.
// La Liguria e' la regione con i numeri di riferimento in Search Console (33
// clic su 625 impressioni al 24/8) e quella del Passo del Turchino, cioe' il
// confronto diretto con la pagina d'esempio di 3bmeteo.
// Per aprirne un'altra si aggiunge la chiave qui e si rilancia il generatore.
const LOCALITA = ['liguria'];

// Le particelle che dentro un nome restano minuscole: «Colle di Cadibona», non
// «Colle Di Cadibona».
const PARTICELLE = new Set(['di', 'de', 'del', 'dello', 'della', 'dei', 'degli', 'delle',
  'da', 'dal', 'dalla', 'al', 'alla', 'allo', 'ai', 'agli', 'alle', 'in', 'e', 'ed', 'a', 'su',
  'sul', 'sulla', 'con', 'per', 'il', 'lo', 'la', 'i', 'gli', 'le', 'd', 'l']);

// ⚠️ ARPA Piemonte pubblica i nomi TUTTI IN MAIUSCOLO, 97 posti su 97, ed e'
// l'unica delle diciannove. Si riscrivono in tondo QUI, che e' presentazione,
// non in `funghi-posti.json`, che deve restare fedele alla fonte.
// La guardia `[A-Z]{3}` lascia stare le sigle corte tipo «Cima M. Bianco».
function bello(n) {
  if (n !== n.toUpperCase() || !/[A-Z]{3}/.test(n)) return n;
  return n.toLowerCase().replace(/[a-zàèéìòù]+/g,
    (parola, i) => (i > 0 && PARTICELLE.has(parola))
      ? parola : parola.charAt(0).toUpperCase() + parola.slice(1));
}

// Il nome che diventa indirizzo: «Passo del Turchino» -> «passo-del-turchino»,
// «Urbe - Vara Sup.» -> «urbe-vara-sup», «Sant'Olcese» -> «sant-olcese».
// ⚠️ L'apostrofo diventa un trattino e non sparisce: «santolcese» non si legge.
// ⚠️ Gli accenti si sciolgono nella lettera semplice (NFD + via i segni): un
// indirizzo con la «à» dentro funziona ma viaggia percentuato e illeggibile
// ovunque lo si incolli.
function slug(nome) {
  return String(nome)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Gli slug di tutti i posti di una regione, con le collisioni gia' sciolte.
// ⚠️ LE COLLISIONI ESISTONO DAVVERO: nel progetto ci sono TRE «Giralda», e due
// stanno allo stesso punto. Due pagine che si contendono lo stesso indirizzo
// vorrebbe dire che la seconda scritta cancella la prima, in silenzio. Qui la
// seconda si prende la sigla della provincia, e se non basta l'id, che e'
// unico per definizione. Il conflitto viene stampato: va guardato, non subito.
function slugRegione(posti, avvisa) {
  const presi = new Map();
  const out = {};
  for (const p of posti) {
    const base = slug(bello(p[1]));
    let s = base;
    if (presi.has(s)) s = base + '-' + slug(p[2]);
    if (presi.has(s)) s = base + '-' + slug(p[0]);
    if (presi.has(s)) throw new Error(`slug irrisolvibile per ${p[0]} «${p[1]}»`);
    if (s !== base && avvisa) avvisa(`«${p[1]}» va in «${s}»: «${base}» era gia' di ${presi.get(base)}`);
    presi.set(s, p[0]);
    out[p[0]] = s;
  }
  return out;
}

module.exports = { LOCALITA, bello, slug, slugRegione };
