#!/usr/bin/env node
/**
 * Scrive i riepiloghi delle pagine regione: data/riepiloghi/<regione>.json
 *
 * PERCHE' ESISTE. Ogni pagina regione (/friuli/, /toscana/, ...) si calcolava i
 * suoi due numeri scaricando i file giornalieri UNO PER UNO dal browser del
 * visitatore: 20 giorni per ogni cartella dati, cioe' 20 richieste a
 * raw.githubusercontent per la maggior parte delle regioni e 40 per Friuli e
 * Svizzera, che di cartelle ne hanno due. Funzionava, ma:
 *  - raw limita le raffiche per IP e risponde 429 (misurato il 18/8/2026: su
 *    120 file in raffica, 2-3 lo prendono davvero). Sulla mappa c'e' la riserva
 *    sulla copia Netlify; sulle pagine no, e un 429 fa sparire in silenzio il
 *    giorno di quella cartella — cioe' una media piu' bassa senza dirlo;
 *  - la scheda comparve dopo qualche secondo invece che subito.
 * Con questo script il conto si fa UNA VOLTA AL GIORNO qui, sui file gia' nel
 * checkout (nessuna rete, nessuna API di nessun ente), e la pagina fa UNA sola
 * richiesta. La vecchia strada resta nella pagina come ripiego, se il riepilogo
 * manca o e' piu' vecchio di due giorni.
 *
 * DOVE SCRIVE E QUANTO COSTA. `data/riepiloghi/`, che sta dentro `data/` e
 * quindi e' nella regola ignore di netlify.toml: **nessun deploy**, come per i
 * collector. I file sono ~1 KB l'uno.
 *
 * ⚠️ L'ANAGRAFE DELLE REGIONI NON SI RICOPIA: si prende da
 * `genera-pagine-regione.js` (module.exports). Se le due liste di cartelle
 * divergessero, la pagina direbbe una cosa e il riepilogo un'altra sullo stesso
 * indirizzo, e nessuno se ne accorgerebbe.
 *
 * ⚠️ LE GEMELLE: quando una regione legge piu' cartelle si unisce per POSIZIONE
 * e non per cartella+id, se no il Friuli conta due volte i 37 pluviometri che
 * MeteoHub ripubblica dall'OSMER. Stessa regola della mappa e del ripiego dentro
 * la pagina: le tre copie devono restare gemelle.
 *
 * Uso: `node .github/scripts/genera-riepiloghi.js` (nessun parametro).
 */

const fs = require('fs');
const path = require('path');
const { REGIONI } = require('./genera-pagine-regione.js');
const { DATI, oggiItalia, giorniIndietro, leggi } = require('./lib-giorni.js');

const USCITA = path.join(DATI, 'riepiloghi');
const PERIODI = [7, 20];          // le due schede della pagina
const FINESTRA = Math.max(...PERIODI);

// Il calendario (che giorno e' in Italia, quali sono gli ultimi N giorni, come
// si legge il file di una cartella) sta in lib-giorni.js dal 2/9/2026: lo usa
// anche genera-funghi.js, e due copie che divergessero darebbero due pagine
// con finestre diverse sullo stesso giorno.

// Le stazioni delle cartelle successive che cadono entro ~1 km da una della
// PRIMA cartella sono la stessa stazione fisica letta da un'altra porta: si
// tengono quelle della prima, che e' la fonte di casa. Tolleranza larga
// apposta (le due fonti arrotondano le coordinate in modo diverso, e due
// pluviometri veri non stanno mai cosi' vicini).
function gemelleDaScartare(dirs, giorni) {
  const fuori = new Set();
  if (dirs.length < 2) return fuori;
  const casa = new Map();
  for (const g of giorni) {
    for (const s of leggi(dirs[0], g) || []) casa.set(s.id, [s.lat, s.lon]);
  }
  const pos = [...casa.values()];
  const visti = new Set();
  for (const dir of dirs.slice(1)) {
    for (const g of giorni) {
      for (const s of leggi(dir, g) || []) {
        const id = dir + ':' + s.id;
        if (visti.has(id)) continue;
        visti.add(id);
        if (pos.some(q => Math.abs(q[0] - s.lat) < 0.009 && Math.abs(q[1] - s.lon) < 0.013)) fuori.add(id);
      }
    }
  }
  return fuori;
}

// La provincia si scrive solo se DICE qualcosa: le reti MeteoHub ci mettono la
// sigla della REGIONE (tutte le siciliane «SIC»), il Friuli «FVG», la VdA «AO».
// Ripetere lo stesso valore su ogni riga e' rumore. Il Piemonte scrive
// «PROVINCIA DI ALESSANDRIA» in maiuscolo, la Liguria il comune.
function etichette(prov) {
  const distinti = new Set(Object.values(prov));
  const mostra = distinti.size > 1;
  return (id, nome) => {
    if (!mostra || !prov[id]) return nome;
    let p = String(prov[id]).replace(/^PROVINCIA DI\s+/i, '');
    if (p === p.toUpperCase() && p.length > 4) p = p.charAt(0) + p.slice(1).toLowerCase();
    return nome + ' (' + p + ')';
  };
}

function riepilogo(r, giorni, fuori) {
  const somma = {}, nomi = {}, prov = {};
  let presenti = 0, primo = null, ultimo = null;
  for (const g of giorni) {
    let qualcosa = false;
    for (const dir of r.dirs) {
      const staz = leggi(dir, g);
      if (!staz) continue;
      qualcosa = true;
      for (const s of staz) {
        if (s.mm == null) continue;
        const id = dir + ':' + s.id;
        if (fuori.has(id)) continue;
        somma[id] = (somma[id] || 0) + s.mm;
        nomi[id] = s.n;
        if (s.p) prov[id] = s.p;
      }
    }
    if (!qualcosa) continue;
    presenti++;
    if (!ultimo) ultimo = g;      // giorni e' ordinato dal piu' recente
    primo = g;
  }
  if (!presenti) return null;
  const chiavi = Object.keys(somma);
  if (!chiavi.length) return null;
  const et = etichette(prov);
  const media = chiavi.reduce((a, id) => a + somma[id], 0) / chiavi.length;
  const top = chiavi.sort((a, b) => somma[b] - somma[a]).slice(0, 5)
    .map(id => ({ n: et(id, nomi[id]), mm: Math.round(somma[id] * 10) / 10 }));
  return {
    media: Math.round(media * 10) / 10,
    giorni: presenti,
    stazioni: chiavi.length,
    primo, ultimo, top,
  };
}

const oggi = oggiItalia();
const giorni = giorniIndietro(oggi, FINESTRA);
fs.mkdirSync(USCITA, { recursive: true });

// ── LETTURE DEL GIORNO, per la riga «5.584 pluviometri letti stamattina» ──
//
// PERCHE': il sito non aveva nessun modo di dire che dietro c'e' una macchina
// che si sveglia ogni mattina. Questa riga lo dice con un numero verificabile:
// torni domani e l'ora e' cambiata. Il conto e' gratis, i file sono gia' qui.
//
// ⚠️ SI CONTA UN GIORNO SOLO, IERI, non «l'ultimo giorno che ogni rete ha».
// Sommare l'ultimo giorno disponibile cartella per cartella gonfierebbe il
// totale mescolando giorni diversi. Cosi' invece le reti in ritardo dichiarato
// (Slovenia 34 ore, Puglia quando MeteoHub salta) semplicemente non entrano, e
// il numero esce piu' BASSO del vero: e' il verso giusto in cui sbagliare.
//
// ⚠️ `letto` e' l'istante in cui gira QUESTO script, non l'ora dei collector:
// e' l'ora in cui abbiamo guardato, ed e' quella che la pagina scrive.
function letture(giorno) {
  let stazioni = 0, cartelle = 0;
  for (const d of fs.readdirSync(DATI)) {
    if (d === 'riepiloghi') continue;
    let st;
    try {
      if (!fs.statSync(path.join(DATI, d)).isDirectory()) continue;
      st = leggi(d, giorno);
    } catch (e) { continue; }
    if (!st) continue;
    stazioni += st.length;
    cartelle++;
  }
  return { giorno, stazioni, cartelle, letto: new Date().toISOString() };
}
// ⚠️ NON «ieri» e basta: questo script gira DUE volte, alle 7:10 e all'1:20.
// All'1:20 il giorno di ieri e' appena finito ma i collector lo devono ancora
// scrivere — girano fra le 6:00 e le 7:15 della mattina dopo. Il 25/8/2026
// alle 1:40 il conto usciva 2.957 pluviometri in 19 cartelle, e restava
// esposto sul sito fino al giro del mattino: alle 7:42 lo stesso identico
// giorno ne dava 5.573 in 36. Quasi sei ore col numero dimezzato, proprio la
// fascia di chi apre presto (segnalato dall'utente alle 7:24).
//
// Si sceglie fra ieri e l'altroieri quello con piu' CARTELLE, non con piu'
// stazioni: le cartelle dicono quante reti hanno consegnato (19 contro 36 e'
// un giorno a meta'), mentre il totale delle stazioni oscilla di suo di qualche
// decina da un giorno all'altro (5.573 contro 5.597 il 24 e il 23) e sceglierlo
// come arbitro terrebbe fisso l'altroieri per una manciata di pluviometri.
// Resta comunque UN GIORNO SOLO: la regola di non mescolare giorni non si tocca.
const cIeri  = letture(giorni[0]);
const cPrima = letture(giorni[1]);
const conteggio = (cPrima.cartelle > cIeri.cartelle) ? cPrima : cIeri;
// Questo file si riscrive SEMPRE, anche identico: l'ora e' il suo contenuto.
fs.writeFileSync(path.join(USCITA, 'letture.json'), JSON.stringify(conteggio, null, 1) + '\n', 'utf8');
console.log(`  letture: ${conteggio.stazioni} pluviometri in ${conteggio.cartelle} cartelle il ${conteggio.giorno}\n`);

let scritti = 0, saltati = [];
for (const r of REGIONI) {
  const fuori = gemelleDaScartare(r.dirs, giorni);
  const periodi = {};
  for (const n of PERIODI) {
    const p = riepilogo(r, giorni.slice(0, n), fuori);
    if (p) periodi[String(n)] = p;
  }
  // ⚠️ Se non e' uscito niente NON si scrive: si lascia il file di ieri e la
  // pagina, vedendolo vecchio, si ricalcola i numeri da sola. Sovrascrivere con
  // un riepilogo vuoto sarebbe il modo peggiore di gestire una fonte ferma —
  // la pagina direbbe «dati non disponibili» credendo di essere aggiornata.
  if (!periodi[String(FINESTRA)]) { saltati.push(r.k); continue; }
  const dest = path.join(USCITA, r.k + '.json');
  const testo = JSON.stringify({ regione: r.k, generato: new Date().toISOString(), periodi }, null, 1) + '\n';
  const prima = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : '';
  // Il campo `generato` cambia a ogni giro: se il resto e' identico non si
  // riscrive, cosi' un run in piu' non produce un commit di sole date.
  const uguale = prima && prima.replace(/"generato":[^,]+,/, '') === testo.replace(/"generato":[^,]+,/, '');
  if (!uguale) { fs.writeFileSync(dest, testo, 'utf8'); scritti++; }
  const p20 = periodi['20'];
  console.log(`  ${r.k.padEnd(12)} ${String(p20.stazioni).padStart(4)} staz.  ${String(Math.round(p20.media)).padStart(3)} mm/20gg  ${p20.primo}→${p20.ultimo}${uguale ? '  (invariato)' : ''}`);
}
console.log(`\n${scritti} riepiloghi scritti su ${REGIONI.length}${saltati.length ? ', SALTATI (nessun dato): ' + saltati.join(', ') : ''}`);
