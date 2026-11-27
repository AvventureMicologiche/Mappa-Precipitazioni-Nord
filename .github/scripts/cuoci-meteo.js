#!/usr/bin/env node
/**
 * LA PREVISIONE SCRITTA DENTRO LE PAGINE METEO DI VALLE (23/11/2026, scheda 142, PROVA sul gruppo B).
 *
 * PERCHE'. Le pagine /meteo/<valle>/ stanno ferme in posizione ~10,7 su Google da quattro settimane (analisi-142\
 * METEO-VISITE.md). Nel loro HTML la previsione non c'e': «Il punto di stamattina» dice «Sto leggendo previsioni e
 * pluviometri…» e i numeri arrivano dopo, col browser. ilMeteo e 3B li hanno scritti nella pagina. Qui il giro del
 * mattino scrive dentro la pagina il punto della settimana (lo stesso testo che fa il browser, punto() di
 * genera-pagine-meteo-zona.js), i 7 giorni in una riga e la data, e la descrizione per Google col tempo di oggi.
 * Il browser poi riscrive il punto coi numeri freschi, come prima.
 *
 * ⚠️ E' UNA PROVA, decisa dall'utente il 23/11/2026 («Sì, prova sul B»): SOLO le 20 valli di sitemap-meteo-b.xml. A, C e D
 * restano come sono e fanno da confronto in Search Console (ogni gruppo ha la sua sitemap). Si misura dopo 2-3 settimane.
 *
 * ⚠️ UNA RICHIESTA PER VALLE al nostro /api/previsioni?zona=<valle>&pr=1 (la stessa della pagina, con la cache del worker
 * davanti a MET): 20 al giorno. Nessuna richiesta agli enti dei pluviometri: la pioggia caduta e' il riepilogo della zona
 * gia' nel repo (data/riepiloghi/zone/<valle>.json). Se una valle non risponde, la sua pagina resta com'e'.
 *
 * Uso: node .github/scripts/cuoci-meteo.js         (GRUPPO=b di default; SOLO=sila-grande per una valle sola)
 * Gira nel giro del mattino (pagine-regione.yml), dopo le pagine meteo e lo storico.
 */
const fs = require('fs');
const path = require('path');

const RADICE = path.join(__dirname, '..', '..');
const API = process.env.API || 'https://precipitazioni.avventuremicologiche.it/api/previsioni';
const GRUPPO = process.env.GRUPPO || 'b';
const GL = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

const giornoRoma = (ms = Date.now()) => new Date(ms).toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
const OGGI = giornoRoma(), DOMANI = giornoRoma(Date.now() + 864e5), IERI = giornoRoma(Date.now() - 864e5);
const num = n => n.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const mm = n => n === 0 ? '0' : n < 10 ? num(n) : String(Math.round(n));
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const maiusc = s => s[0].toUpperCase() + s.slice(1);
const d = s => new Date(s + 'T12:00:00Z');
const nome = s => s === OGGI ? 'oggi' : s === DOMANI ? 'domani' : s === IERI ? 'ieri' : GL[d(s).getUTCDay()] + ' ' + d(s).getUTCDate();

// le valli del gruppo: quelle della sua sitemap
function valli() {
  const f = path.join(RADICE, GRUPPO === 'a' ? 'sitemap-meteo.xml' : `sitemap-meteo-${GRUPPO}.xml`);
  return [...fs.readFileSync(f, 'utf8').matchAll(/\/meteo\/([a-z0-9-]+)\/<\/loc>/g)].map(m => m[1]);
}

// i 7 giorni della valle, come giorniDi() del browser: media dei mm, minima e massima fra i paesi, la % piu' alta
function giorni(paesi) {
  const per = {};
  for (const c of paesi) for (const g of c.giorni || []) if (g.g >= OGGI) (per[g.g] = per[g.g] || []).push({ c, g });
  return Object.keys(per).sort().slice(0, 7).map(k => {
    const l = per[k];
    let mmS = 0, mmMax = 0, pc = null, dpc = '';
    for (const x of l) { mmS += x.g.mm; if (x.g.mm > mmMax) mmMax = x.g.mm; if (x.g.pc != null && (pc == null || x.g.pc > pc)) { pc = x.g.pc; dpc = x.c.n; } }
    const mn = Math.min(...l.map(x => x.g.mn)), mx = Math.max(...l.map(x => x.g.mx));
    return { g: k, mn, mx, dmn: l.find(x => x.g.mn === mn).c.n, dmx: l.find(x => x.g.mx === mx).c.n, mm: mmS / l.length, mmMax, pc, dpc };
  });
}

function punto(G, rip, dove) {
  const p = [];
  const i = rip && rip.periodi ? rip.periodi['1'] : null, s = rip && rip.periodi ? rip.periodi['7'] : null;
  if (i && s) p.push(`${i.ultimo === IERI ? 'Ieri' : maiusc(nome(i.ultimo))} ${dove} ${i.media < 0.1 ? '<b>non è piovuto</b>'
    : `sono caduti in media <b>${mm(i.media)} mm</b>${i.top && i.top[0] ? ` (${esc(i.top[0].n)} ${mm(i.top[0].mm)})` : ''}`}; negli ultimi 7 giorni <b>${mm(s.media)} mm</b>.`);
  const tot = G.reduce((a, x) => a + x.mm, 0);
  const picco = G.slice().sort((a, b) => b.mmMax - a.mmMax)[0];
  p.push(tot < 0.5 ? 'Nei prossimi 7 giorni <b>non è prevista pioggia</b>.' : `Nei prossimi 7 giorni sono previsti in media <b>${mm(tot)} mm</b>, soprattutto ${nome(picco.g)}.`);
  const rischio = G.filter(x => x.pc != null).sort((a, b) => b.pc - a.pc)[0];
  if (rischio) p.push(rischio.pc < 30 ? 'La probabilità di pioggia resta <b>sotto il 30%</b> per tutta la settimana.'
    : `La probabilità di pioggia più alta è ${nome(rischio.g)}, <b>${rischio.pc}%</b> a ${esc(rischio.dpc)}.`);
  const fr = G.slice().sort((a, b) => a.mn - b.mn)[0], cal = G.slice().sort((a, b) => b.mx - a.mx)[0];
  p.push(`La notte più fredda è ${nome(fr.g)}, con <b>${fr.mn}°</b> a ${esc(fr.dmn)}; il giorno più caldo ${nome(cal.g)}, <b>${cal.mx}°</b> a ${esc(cal.dmx)}.`);
  // i 7 giorni in una riga: e' il testo che Google legge al posto dei riquadri disegnati dal browser
  p.push('Giorno per giorno: ' + G.map(x => `${nome(x.g)} ${x.mn}°/${x.mx}°, ${x.mm < 0.1 ? 'asciutto' : mm(x.mm) + ' mm'}`).join('; ') + '.');
  return p.join(' ');
}

async function cuoci(slug) {
  const f = path.join(RADICE, 'meteo', slug, 'index.html');
  if (!fs.existsSync(f)) return `${slug}: pagina che non c'e'`;
  let h = fs.readFileSync(f, 'utf8');
  const dove = (/"slug":"[^"]+","reg":"[^"]+","dove":"([^"]+)"/.exec(h) || [])[1];
  const nomeValle = (/<h1>Meteo ([^:<]+)/.exec(h) || [])[1];
  if (!dove || !nomeValle) return `${slug}: pagina senza i campi attesi, lasciata com'e'`;
  let J;
  try {
    const r = await fetch(`${API}?zona=${slug}&pr=1`, { signal: AbortSignal.timeout(25000) });
    if (!r.ok) return `${slug}: previsioni ${r.status}, lasciata com'e'`;
    J = await r.json();
  } catch (e) { return `${slug}: previsioni non risponde (${e.message}), lasciata com'e'`; }
  const paesi = (J.capoluoghi || []).filter(c => c.giorni && c.giorni.length && !c.errore);
  const G = giorni(paesi);
  if (G.length < 3) return `${slug}: previsioni vuote, lasciata com'e'`;
  let rip = null;
  try { rip = JSON.parse(fs.readFileSync(path.join(RADICE, 'data', 'riepiloghi', 'zone', slug + '.json'), 'utf8')); } catch (e) {}
  const oraAgg = J.agg ? new Date(J.agg).toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' }) : '';
  // ⚠️ 27/11/2026 (scheda 143): «di oggi», non «di stamattina». Il giro gira anche il pomeriggio e oraAgg è l'ora
  // della previsione: usciva «Il punto di stamattina, 27 novembre alle 12:19».
  const quando = `Il punto di oggi, ${+OGGI.slice(8)} ${MESI[+OGGI.slice(5, 7) - 1]}${oraAgg ? ' alle ' + oraAgg : ''}`;
  const div = `<div class="pz-punto" id="punto" data-cotto="${OGGI}"><span class="pz-quando">${quando}</span> ${punto(G, rip, dove)}</div>`;
  const nuovo = h.replace(/<div class="pz-punto" id="punto"[^>]*>[\s\S]*?<\/div>/, div);
  if (nuovo === h) return `${slug}: riquadro del punto non trovato, lasciata com'e'`;
  h = nuovo;
  // la descrizione per Google col tempo di oggi: cambia ogni giorno, e accanto ai titoli tutti uguali si fa notare
  const o = G[0], nPaesi = paesi.length;
  const descr = [`Meteo ${nomeValle} oggi: ${o.mm < 0.1 ? 'niente pioggia' : mm(o.mm) + ' mm di pioggia in media'}, minime ${o.mn}°, massime ${o.mx}°. Previsioni a 7 giorni in ${nPaesi} paesi, ora per ora, e la pioggia già caduta.`,
    `Meteo ${nomeValle} oggi: ${o.mm < 0.1 ? 'niente pioggia' : mm(o.mm) + ' mm di pioggia'}, ${o.mn}°/${o.mx}°. Previsioni a 7 giorni in ${nPaesi} paesi, ora per ora.`]
    .find(t => t.length <= 158) || `Meteo ${nomeValle}: previsioni a 7 giorni in ${nPaesi} paesi, ora per ora.`;
  h = h.replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(descr)}$2`).replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(descr)}$2`);
  fs.writeFileSync(f, h);
  return `${slug}: cotta (${G.length} giorni, ${nPaesi} paesi) · ${descr}`;
}

(async () => {
  const lista = valli().filter(s => !process.env.SOLO || s === process.env.SOLO);
  let ok = 0;
  for (const s of lista) { const r = await cuoci(s); if (/: cotta/.test(r)) ok++; console.log('  ' + r); }
  console.log(`Previsione scritta in ${ok} pagine meteo su ${lista.length} (gruppo ${GRUPPO}).`);
})();
