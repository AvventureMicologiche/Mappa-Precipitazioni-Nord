/**
 * check-doppioni.js — GitHub Actions (1 run al giorno, dentro alert-fonti.yml)
 *
 * LA SPIA CHE MANCAVA (30/9/2026). Trova la pioggia di ieri TRASCINATA sul giorno
 * dopo: stazioni bagnate che hanno LO STESSO valore, al decimo, in due giorni
 * consecutivi. E' la firma comune dei bug #17, #18 e #19, e fino a oggi la si
 * cercava solo a mano (punto 6 del check periodico). Cosi' e' passato inosservato
 * per cinque settimane il caso Toscana: dal 26/8/2026 i tre giri di chiusura serali
 * partivano con due ore e mezza di ritardo, atterravano dopo mezzanotte e
 * chiudevano il giorno sbagliato; 1.240 mm doppi in settembre (Empoli 78,5 mm
 * il 17 E il 18/9), trovati per caso confrontando i pluviometri con Open-Meteo.
 *
 * Tutti gli altri controlli guardano se i dati ARRIVANO (check-fonti, guardiano).
 * Questo guarda se i dati di oggi sono una COPIA di ieri.
 *
 * NON CHIAMA NESSUNA FONTE ESTERNA: legge i nostri file, gia' nel checkout.
 * NON TOCCA UN SOLO DATO: manda l'elenco, la riparazione resta una scelta umana.
 *
 * COME CONTA. Per ogni regione con file giornalieri a stazioni, confronta gli
 * ultimi due giorni chiusi (ieri e l'altro ieri, piu' la coppia prima per non
 * perdere niente se un giorno il run salta). Una stazione conta se e' bagnata
 * il giorno dopo con almeno 1 mm e il valore e' identico al decimo a quello del
 * giorno prima. Sotto 1 mm le coincidenze vere (pioviggine) sono normali.
 *
 * LA SOGLIA: almeno 5 stazioni identiche O almeno 30 mm doppi in una coppia di
 * giorni. Su 40 giorni di tutte le regioni (agosto-settembre 2026) le
 * coincidenze vere non hanno mai superato 2 stazioni fuori dalla Toscana,
 * mentre i giorni malati toscani stavano a 5-47 stazioni e 48-566 mm.
 * Dall'8/11/2026 la soglia da sola non basta: serve anche il PICCO SULLO ZERO
 * (vedi sotto, `attesePerCaso`).
 *
 * Prova in locale:  node .github/scripts/check-doppioni.js          (ieri e l'altro ieri)
 *                   GIORNO=2026-09-18 node .github/scripts/check-doppioni.js
 *                   PICCO_VOLTE=0 PICCO_PIU=-99 ...  = la regola di prima, senza picco
 * Senza GITHUB_OUTPUT non scrive output ne' mail .eml, stampa e basta.
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const DATA_DIR   = process.env.DATA_DIR || 'data';
const MIN_STAZ   = parseInt(process.env.MIN_STAZ || '5', 10);
const MIN_MM     = parseFloat(process.env.MIN_MM || '30');
const SOGLIA_MM  = 1;      // sotto, le coincidenze sono normali
const COPPIE     = 2;      // quante coppie di giorni guardare all'indietro
const PICCO_VOLTE = parseFloat(process.env.PICCO_VOLTE || '3');  // uguali almeno 3 volte le attese per caso
const PICCO_PIU   = parseFloat(process.env.PICCO_PIU || '4');    // e almeno 4 in piu' delle attese

const fmt = d => d.toISOString().slice(0, 10);
/* ⚠️ LE ORE DI PIOGGIA FANNO DA TESTIMONE (20/10/2026). Le reti con la serie oraria scrivono anche
   i: [ore bagnate, punta oraria] (lib-intensita.js). Una pioggia TRASCINATA e' una copia e copia anche
   quelle; due giorni veri con lo stesso totale hanno ore e punta diverse. Se tutti e due i giorni hanno
   `i` e non coincide, la coppia non conta. Nato dal falso allarme francia-bfc 17-18/10/2026: 5 stazioni
   con lo stesso totale (Novillard 15,7 in 13 ore e poi in 17), confermate al decimo dall'archivio orario
   ufficiale di Meteo-France; quattro su cinque misurano a scatti di 1 mm, dove coincidere e' facile.
   Toscana, Alto Adige e Trentino (le reti dei bug #17-#19) `i` non ce l'hanno: li' il controllo e' quello di prima. */
const oreDiverse = (p, s) => Array.isArray(p.i) && Array.isArray(s.i) && (p.i[0] !== s.i[0] || Math.abs((+p.i[1] || 0) - (+s.i[1] || 0)) >= 0.05);
const eStima = j => !!j && typeof j.source === 'string' && /open-meteo|icon-2i-gapfill/i.test(j.source);

/* ⚠️ IL PICCO SULLO ZERO (8/11/2026, scheda 129 bis). Una COPIA mette tante stazioni a differenza
   zero fra un giorno e l'altro; il CASO ne mette a zero piu' o meno quante a un passo o due dello
   strumento (+-0,2 e +-0,4 mm per i pluviometri a scatti di 0,2). Nato dal falso allarme emilia
   6-7/11/2026: due giorni di pioggia diffusa (271 stazioni sopra 1 mm in tutti e due), scatti di 0,2
   mm, 6 uguali contro 4 e 2 a +-0,2 e 7 e 6 a +-0,4. L'Emilia `i` non ce l'ha, il testimone delle ore
   non poteva aiutare. Le attese per caso = stazioni a uno o due passi dallo zero, diviso i quattro
   passi; la mail parte se le uguali sono almeno PICCO_VOLTE volte le attese E PICCO_PIU in piu'.
   Provato su tutte le cartelle dal 1/7 al 7/11/2026 (4.657 coppie, Toscana letta com'era prima della
   riparazione del 30/9): i 7 giorni toscani malati (rapporto 19-128) e l'Alto Adige del 31/7-3/8
   (bug #18 di ritorno) restano tutti; cadono 8 allarmi da 1-6 stazioni (emilia 6-7/11 e 7-8/10,
   veneto 17-18/7 e 20-21/10, francia-occitania 20-21/8, lombardia 20-21/8 e 9-10/9, valledaosta
   24-25/8), da 19 a 11. Si perde la mail per una o due stazioni grosse uguali sopra i 30 mm: col caso
   non si distinguono, e nessun giorno toscano malato dipendeva da quella. */
function passo(vals) {
  const v = vals.filter(x => x > 0);
  if (!v.length) return 0.1;
  const multipli = q => v.filter(x => Math.abs(Math.round(x / q) * q - x) < 0.011).length / v.length;
  if (multipli(1) >= 0.8) return 1;      // alcune Meteo-France, scatti di 1 mm
  if (multipli(0.2) >= 0.8) return 0.2;  // ARPAE, ARPA Lombardia, ARPAV...
  return 0.1;
}
function attesePerCaso(prima, b, chiave) {
  const coppie = [];
  for (const s of b.stations) {
    const p = prima.get(chiave(s));
    const x = p ? (+p.mm || 0) : 0, y = +s.mm || 0;
    if (p && x >= SOGLIA_MM && y >= SOGLIA_MM) coppie.push([x, y]);
  }
  const q = passo(coppie.flat());
  const vicine = coppie.filter(([x, y]) => { const d = Math.abs(y - x); return d > q - 0.011 && d < 2 * q + 0.011; }).length;
  return { attese: vicine / 4, passo: q };
}

function leggi(regione, giorno) {
  const p = path.join(DATA_DIR, regione, giorno + '.json');
  if (!fs.existsSync(p)) return null;
  try { const j = JSON.parse(fs.readFileSync(p, 'utf8')); return (j && Array.isArray(j.stations) && !eStima(j)) ? j : null; }
  catch (e) { return null; }
}

// la data di riferimento: ieri (il giorno chiuso), o GIORNO per le prove
const rif = process.env.GIORNO ? new Date(process.env.GIORNO + 'T12:00:00Z') : new Date(Date.now() - 86400000);
const giorni = [];
for (let k = COPPIE; k >= 0; k--) giorni.push(fmt(new Date(rif.getTime() - k * 86400000)));

// abruzzo: la PROVA del 27/10/2026 (MeteoNetwork + stime ICON-2I), fuori dalla sorveglianza finche' non si decide
const regioni = fs.readdirSync(DATA_DIR).filter(n => {
  const p = path.join(DATA_DIR, n);
  return fs.statSync(p).isDirectory() && !/vento|funghi|riepiloghi|vetrine|abruzzo/.test(n);
}).sort();

const allarmi = [];
console.log(`Doppioni: coppie ${giorni.map((g, i) => i ? giorni[i - 1] + '->' + g : '').filter(Boolean).join(', ')}\n`);
for (const r of regioni) {
  for (let i = 1; i < giorni.length; i++) {
    const a = leggi(r, giorni[i - 1]), b = leggi(r, giorni[i]);
    if (!a || !b) continue;
    const chiave = s => s.id != null ? String(s.id) : s.n;
    const prima = new Map(a.stations.map(s => [chiave(s), s]));
    const bagnate = b.stations.filter(s => (+s.mm || 0) > 0);
    const identiche = bagnate.filter(s => {
      const p = prima.get(chiave(s));
      if (!p || (+s.mm || 0) < SOGLIA_MM || Math.abs((+p.mm || 0) - (+s.mm || 0)) >= 0.05) return false;
      return !oreDiverse(p, s);
    });
    const mm = identiche.reduce((t, s) => t + (+s.mm || 0), 0);
    const { attese, passo: q } = attesePerCaso(prima, b, chiave);
    if (identiche.length) console.log(`${r.padEnd(20)} ${giorni[i - 1]} -> ${giorni[i]}: ${identiche.length} identiche su ${bagnate.length} bagnate, ${mm.toFixed(1)} mm, attese per caso ${attese.toFixed(1)} (passo ${q})`);
    const sopra = identiche.length >= MIN_STAZ || mm >= MIN_MM;
    const picco = identiche.length >= PICCO_VOLTE * attese && identiche.length - attese >= PICCO_PIU;
    if (sopra && !picco) console.log(`${''.padEnd(20)} sopra la soglia ma senza picco sullo zero: per caso, nessuna mail`);
    if (sopra && picco) {
      identiche.sort((x, y) => (+y.mm || 0) - (+x.mm || 0));
      allarmi.push({ regione: r, da: giorni[i - 1], a: giorni[i], n: identiche.length, bagnate: bagnate.length, mm, attese, esempi: identiche.slice(0, 5).map(s => `${s.n || s.id} ${String(s.mm).replace('.', ',')}`) });
    }
  }
}

const out = process.env.GITHUB_OUTPUT;
const scrivi = (k, v) => { if (out) fs.appendFileSync(out, `${k}=${v}\n`); };

if (!allarmi.length) {
  console.log('\nNessun doppione sopra soglia: nessuna mail.');
  scrivi('mail', 'false');
  process.exit(0);
}

const vir = n => String(n).replace('.', ',');
const righe = allarmi.map(x =>
  `• ${x.regione}: ${x.n} stazioni con lo stesso valore il ${x.da} e il ${x.a} (su ${x.bagnate} bagnate; per caso se ne aspetterebbero ${vir(x.attese.toFixed(1))}), ${vir(x.mm.toFixed(1))} mm doppi.\n` +
  `  Per esempio: ${x.esempi.join('; ')}.`
).join('\n\n');

const corpo =
`In queste regioni la pioggia di un giorno si ritrova IDENTICA, al decimo, il
giorno dopo, su molte piu' stazioni di quante ne darebbe il caso (il metro
sono le stazioni che cambiano di un passo o due dello strumento, 0,2-0,4 mm):
e' la firma della pioggia trascinata sul giorno dopo (bug #17, #18, #19).
Il caso toscano di settembre 2026 si e'
presentato esattamente cosi' e nessuno l'ha visto per cinque settimane.

${righe}

Cosa fare: aprire i due file in data/<regione>/ e confrontare stazione per
stazione; controllare a che ora sono partiti davvero i giri di chiusura del
collector (gh run list --workflow <regione>.yml, ora italiana); se la pioggia
del giorno dopo non e' vera, ripararla come a luglio 2026 (campo repaired).

Nessun dato e' stato modificato: questo controllo non tocca niente.`;

const oggetto = allarmi.length === 1
  ? `Pioggia doppia in ${allarmi[0].regione}: ${allarmi[0].n} stazioni uguali il ${allarmi[0].da} e il ${allarmi[0].a}`
  : `Pioggia doppia in ${allarmi.length} regioni (${[...new Set(allarmi.map(x => x.regione))].join(', ')})`;

const mail =
`From: ${process.env.MAIL_USER || 'bot'}\r\n` +
`To: ${process.env.MAIL_TO || 'bot'}\r\n` +
`Subject: ${oggetto}\r\n` +
`Content-Type: text/plain; charset=UTF-8\r\n\r\n` +
corpo.replace(/\n/g, '\r\n') + '\r\n';

if (out) fs.writeFileSync('doppioni-mail.eml', mail);
console.log(`\nALLARME: ${allarmi.length} coppie sopra soglia.` + (out ? ' Mail preparata.' : ' (prova locale: nessuna mail)'));
console.log('\n' + corpo);
scrivi('mail', 'true');
