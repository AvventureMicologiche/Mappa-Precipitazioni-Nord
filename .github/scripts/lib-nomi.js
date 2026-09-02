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
 *
 * ⚠️ QUESTO FILE E' PIENO DI ESPRESSIONI REGOLARI: non si modifica con `sed`
 * ne' con patch passate alla shell. Il 2/9/2026 una `\b` scritta cosi' e'
 * arrivata nel file come un carattere di ritorno indietro vero: la regex non
 * trovava piu' niente, nessun errore, e i 35 santi restavano abbreviati senza
 * che nulla lo dicesse. Si tocca con l'editor. E' la stessa trappola gia'
 * scritta in fondo alla scheda Slovenia del CLAUDE.md.
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

// ── I SANTI ABBREVIATI ──────────────────────────────────────────────────────
// ⚠️ Le fonti scrivono «S. Stefano d'Aveto», «Stella S. Giustina», «Serra
// S.Bruno»: sono 35 nomi nelle 19 regioni. Chi cerca invece scrive «Santo
// Stefano d'Aveto» per esteso — ed e' proprio il paese che il 27/8/2026 non si
// trovava sulla mappa. Quindi la pagina e l'indirizzo lo dicono per esteso.
//
// ⚠️ NON SI PUO' DEDURRE DALLA SOLA LETTERA: «S.» vale San, Sant', Santo e
// Santa, e quale delle quattro dipende dal nome che segue (genere, e se comincia
// per vocale o per s + consonante). In mappa lo stesso problema era stato
// risolto allargando la DOMANDA (`locVarianti`), perche' li' bastava trovare la
// riga; qui invece bisogna SCEGLIERE come si scrive, quindi serve sapere il nome.
//
// L'elenco e' esplicito apposta: un nome che non c'e' resta abbreviato e finisce
// in `santiIgnoti`, invece di uscire sbagliato in silenzio. Aggiungerne uno e'
// una riga.
const SANTI = {
  // maschili
  benedetto: 'San', bruno: 'San', cassiano: 'San', dalmazio: 'San', donato: 'San',
  ferdinando: 'San', francesco: 'San', giacomo: 'San', giovanni: 'San',
  giuseppe: 'San', marcello: 'San', martino: 'San', michele: 'San',
  pietro: 'San', salvatore: 'San', sosti: 'San', valentino: 'San',
  vito: 'San', volfango: 'San', zeno: 'San',
  // femminili
  brigida: 'Santa', fiora: 'Santa', giustina: 'Santa', maddalena: 'Santa',
  valburga: 'Santa',
  // ⚠️ «Santo» e non «San» davanti a s + consonante: si dice Santo Stefano.
  stefano: 'Santo',
};

// I nomi che restano abbreviati, per poterlo dire a fine giro invece di
// scoprirlo per caso guardando una pagina.
const santiIgnoti = new Set();

// ⚠️ I nomi in cui abbreviato non e' solo il «Santo» ma anche il nome del
// santo: «Abbadia S. S.» sta per «Abbadia San Salvatore» (la stazione toscana
// del Laghetto Verde). La regola qui sotto non puo' indovinarlo — la seconda
// «S.» non e' un nome — e infatti lo segnalava invece di sbagliarlo. E' l'unico
// caso in tutte e diciannove le regioni, e si scioglie a mano.
const ECCEZIONI = [
  ['Abbadia S. S.', 'Abbadia San Salvatore'],
];

// «S.» a inizio parola, poi il nome: «S. Stefano», «S.Bruno», «Serra S.Bruno».
const RE_SANTO = /\bS\.\s*([A-Za-zÀ-ÿ']+)/g;

function sciogliSanto(n) {
  for (const [da, a] of ECCEZIONI) if (n.startsWith(da)) n = a + n.slice(da.length);
  return String(n).replace(RE_SANTO, (tutto, nome) => {
    const art = SANTI[nome.toLowerCase()];
    if (!art) { santiIgnoti.add(tutto.trim()); return tutto; }
    return art + ' ' + nome;
  });
}

// ⚠️ ARPA Piemonte pubblica i nomi TUTTI IN MAIUSCOLO, 97 posti su 97, ed e'
// l'unica delle diciannove. Si riscrivono in tondo QUI, che e' presentazione,
// non in `funghi-posti.json`, che deve restare fedele alla fonte.
// La guardia `[A-Z]{3}` lascia stare le sigle corte tipo «Cima M. Bianco».
function bello(n) {
  const tondo = (n !== n.toUpperCase() || !/[A-Z]{3}/.test(n))
    ? n
    : n.toLowerCase().replace(/[a-zàèéìòù]+/g,
        (parola, i) => (i > 0 && PARTICELLE.has(parola))
          ? parola : parola.charAt(0).toUpperCase() + parola.slice(1));
  // ⚠️ Il santo si scioglie DOPO il tondo: su un nome tutto maiuscolo
  // «S. GIACOMO DEMONTE» diventa prima «S. Giacomo Demonte», e solo allora la
  // chiave dell'elenco combacia.
  return sciogliSanto(tondo);
}

// Il nome che diventa indirizzo: «Passo del Turchino» -> «passo-del-turchino»,
// «Urbe - Vara Sup.» -> «urbe-vara-sup», «Ca' de Massa» -> «ca-de-massa».
// ⚠️ L'apostrofo diventa un trattino e non sparisce: «santolcese» non si legge.
// ⚠️ Gli accenti si sciolgono nella lettera semplice (NFD, poi via i segni
// combinanti U+0300-U+036F): un indirizzo con la «à» dentro funziona ma viaggia
// percentuato e illeggibile ovunque lo si incolli.
function slug(nome) {
  return String(nome)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Gli slug di tutti i posti di una regione, con le collisioni gia' sciolte.
// ⚠️ LE COLLISIONI ESISTONO DAVVERO: in Toscana ci sono DUE «Pieve S. Stefano»
// e nel progetto tre «Giralda». Due pagine che si contendono lo stesso
// indirizzo vorrebbe dire che la seconda scritta cancella la prima, in
// silenzio. Qui la seconda si prende la sigla della provincia, e se non basta
// l'id, che e' unico per definizione. Il conflitto viene stampato: va guardato,
// non subito.
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

module.exports = { LOCALITA, bello, slug, slugRegione, santiIgnoti };
