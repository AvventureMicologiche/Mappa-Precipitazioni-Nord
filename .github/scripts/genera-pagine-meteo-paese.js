#!/usr/bin/env node
/**
 * LE PAGINE «METEO <PAESE>»: meteo/<regione>/<paese>/index.html (28/10/2026, TEST su 20 posti).
 *
 * PERCHE' ESISTONO. Suo, 28/10/2026: «trasformo definitivamente la sezione meteo in un sito vero», e poi «facciamo 20
 * pagine meteo paese di prova, così abbiamo dei dati da studiare, prendi i paesi più cliccati; giustamente non devono
 * andare in conflitto con le pagine funghi». I grandi (ilMeteo, 3B) ragionano per comune: questa e' la famiglia che
 * porta il volume. I 20 posti sono METEO_PAESI in genera-pagine-meteo-zona.js (le pagine paese funghi con piu' clic da
 * Google in 28 giorni), con la loro sitemap (sitemap-meteo-paesi.xml) per misurarli da soli in Search Console.
 *
 * ⚠️ NIENTE CONFLITTO CON LE PAGINE FUNGHI: due domande diverse, due titoli diversi.
 *   funghi  «Funghi a Sassello oggi: stanno nascendo?»   /funghi/liguria/sassello/   (la pioggia che conta)
 *   meteo   «Meteo Sassello: previsioni a 7 giorni»      /meteo/liguria/sassello/    ← questa (il tempo che fara')
 * Qui «funghi» non compare nel titolo ne' nella descrizione, e la pagina funghi porta qui col link di linkMeteoPaese,
 * cosi' Google sa quale delle due risponde a cosa. Da qui si va solo SULLA MAPPA: radar, previsioni e pluviometri
 * della regione, tre bottoni con l'anteprima (suo, 28/10: «i funghi è inutile», «le altre pagine sono troppo simili»).
 *
 * COSA C'E' DENTRO: la pagina di zona (genera-pagine-meteo-zona.js, stesso stile e stesso codice del browser, con
 * C.solo) centrata su UN posto: la scheda ora per ora si apre da sola sul paese, i 7 giorni e il «punto di stamattina»
 * sono del paese, mappa e tabella dei paesi intorno (gli stessi di «Che tempo farà» della pagina funghi:
 * /api/previsioni?paese=<reg>/<slug>, data/paesi-localita/<reg>.json), il grafico con la pioggia caduta AL PLUVIOMETRO
 * (data/funghi/<reg>-giorni.json, 25 giorni, lo stesso file della pagina funghi) e i 7 giorni previsti.
 *
 * Uso: node .github/scripts/genera-pagine-meteo-paese.js     (SOLO=sassello: una pagina sola, indice e sitemap non toccati)
 * Si lancia DOPO genera-pagine-regione.js: il foglio di stile si prende dalla pagina regione, come le zone.
 */

const fs = require('fs');
const path = require('path');
const { REGIONI, briciolaJson } = require('./genera-pagine-regione.js');
const { slug } = require('./lib-nomi.js');
const { regioneDati } = require('./lib-posti.js');
const { confineDi } = require('./genera-pagine-adesso.js');   // il confine della regione nelle anteprime dei bottoni
const { quotePaesi, chiave } = require('./lib-quota-paesi.js');
const MZ = require('./genera-pagine-meteo-zona.js');
const { METEO_PAESI, ZONE_METEO_TUTTE, CSS, clientePagina, paginaIndice, scrivi, esc, agenziaDi, indirizzoMeteoPaese,
  SITO, RAW, RILIEVO, GA_ID, CANALE, POSTI, ZONE, SLUG_REG } = MZ;

const RADICE = path.join(__dirname, '..', '..');

// i tre bottoni con l'anteprima (28/10/2026): l'etichetta gialla all'85% come i riquadri «Guarda la pioggia» delle
// pagine funghi (lib-striscia.js, sua scelta del 20/10), su una cartina viva che non si tocca (il clic va al link)
const CSS_PAESE = `
.pz-ant{display:grid;grid-template-columns:1fr;gap:14px;margin:12px 0 22px}
/* l'anteprima sopra, l'etichetta gialla SOTTO (28/10/2026): sopra la cartina copriva la Sicilia e le citta' della costa */
.pz-ant-c{position:relative;display:block;border-radius:14px;overflow:hidden;border:1px solid #c9d5e1;background:#fff;text-decoration:none;box-shadow:0 2px 10px rgba(15,61,110,.10)}
.pz-ant-v{position:relative;height:250px;pointer-events:none;background:#e8eef4 center/cover no-repeat}
.pz-ant-v.leaflet-container{background:#e8eef4}
.pz-ant-t{display:block;padding:10px 14px 11px;font-weight:800;font-size:16.5px;line-height:1.25;color:#3d1f04;background:linear-gradient(180deg,#f9c93e,#eda40c);border-top:1px solid rgba(160,106,8,.35)}
.pz-ant-t small{display:block;font-weight:600;font-size:12.5px;opacity:.92;margin-top:1px}
.pz-ant-q{position:absolute;top:8px;right:8px;z-index:1000;font-style:normal;font-size:12px;font-weight:700;background:rgba(255,255,255,.92);border-radius:6px;padding:2px 7px;color:#0f3d6e}
.pz-ant-q:empty{display:none}
.pz-ant-v .leaflet-control-attribution{font-size:10px;background:rgba(255,255,255,.7)}
/* le citta' dell'anteprima piu' piccole di quelle della mappa grande: e' un'anteprima, e cosi' ce ne stanno di piu' */
.pz-ant-v .pz-et{padding:1px 5px 2px}.pz-ant-v .pz-et .r1{font-size:10.5px}.pz-ant-v .pz-et .ic{font-size:13px}.pz-ant-v .pz-et .nm{font-size:9.5px}
/* quelle che col nome non ci stanno: prima senza nome, poi solo icona e massima (si toglie solo quella che non ci sta nemmeno cosi') */
.pz-ant-v .pz-et.corta .nm,.pz-ant-v .pz-et.mini .nm,.pz-ant-v .pz-et.mini .mn{display:none}
.pz-ant-v .pz-et.mini{padding:0 4px 1px}.pz-ant-v .pz-et.mini .ic{margin-right:1px}
@media (min-width:700px){.pz-ant-v{height:300px}}
`;

function pagina(p, QUOTE_DI) {
  const [reg, locSlug] = p.loc.split('/');
  const casa = REGIONI.find(x => x.k === reg);
  if (!casa) throw new Error('regione sconosciuta: ' + reg);
  const id = Object.keys(SLUG_REG[reg]).find(k => SLUG_REG[reg][k] === locSlug);
  const anag = id && POSTI[reg].find(x => String(x[0]) === id);
  if (!anag) throw new Error('nessun pluviometro per ' + p.loc + ' in funghi-posti.json');
  const lista = JSON.parse(fs.readFileSync(path.join(RADICE, 'data', 'paesi-localita', reg + '.json'), 'utf8'))[locSlug];
  if (!lista || !lista.length) throw new Error('nessun paese per ' + p.loc + ' in data/paesi-localita/' + reg + '.json');
  const serie = JSON.parse(fs.readFileSync(path.join(RADICE, 'data', 'funghi', reg + '-giorni.json'), 'utf8')).serie || {};
  if (!serie[id]) console.log('  ⚠️ ' + p.loc + ': il pluviometro ' + id + ' non e\' nel file dei 25 giorni, il grafico restera\' vuoto');

  const nomeDi = x => (p.nomi && p.nomi[x.n]) || x.n;
  const quote = {};
  for (const x of lista) quote[nomeDi(x)] = x.qui ? x.q : QUOTE_DI[chiave(x.lat, x.lon)];
  const intorno = lista.map(nomeDi).filter(n => n !== p.n);
  const ente = agenziaDi(regioneDati(reg, anag)) || '';
  const alPluv = 'al pluviometro ' + (p.pluv || p.di);
  const ga = 'meteo-paese-' + p.slug;
  const NREG = casa.nomeTitolo || casa.nome;

  const TITOLO = `Meteo ${p.n}: previsioni a 7 giorni, ora per ora`;
  const DESCR = `Previsioni meteo ${p.dove} per i prossimi 7 giorni, ora per ora: pioggia e probabilità, minime e massime. `
    + `E il tempo nei paesi intorno (${intorno.slice(0, 3).join(', ')}), con la pioggia già caduta ${alPluv}${ente ? ' (' + ente + ')' : ''}.`;

  const modello = path.join(RADICE, casa.k, 'index.html');
  if (!fs.existsSync(modello)) { console.error('⚠️ manca ' + modello + ': lancia prima genera-pagine-regione.js'); process.exit(1); }
  const m = fs.readFileSync(modello, 'utf8');
  let STILE = m.slice(m.indexOf('<style>') + 7, m.indexOf('</style>'));
  const iMeteo = STILE.indexOf('/* ── IL METEO NELLE PAGINE REGIONE');
  if (iMeteo >= 0) STILE = STILE.slice(0, iMeteo);

  const C = { sito: SITO, raw: RAW, slug: 'paese-' + p.slug, reg, dove: p.dove, valle: 'zona', inValle: p.dove, diValle: '',
    rilievo: RILIEVO, quote, pluv: [], solo: true, paese: p.loc, giorni: 'funghi/' + reg + '-giorni.json', id,
    nomi: p.nomi || null, primo: p.primo || null, intorno: p.n + ' e i paesi intorno', alPluv, evento: 'meteo_paese',
    ant: { confine: confineDi(casa) } };
  /* ⚠️ TRE BOTTONI, CON L'ANTEPRIMA, UNO SOTTO L'ALTRO, E TUTTI VERSO LA MAPPA (28/10/2026, suo: «i pulsanti devono essere
     meno, i funghi è inutile, basta radar, previsioni Liguria, pluvio Liguria»; e poi: «rimandi a un'altra pagina tipo
     dove ha piovuto, ma per chi legge è una pagina troppo simile: quei 3 pulsanti ti devono mandare sulle rispettive
     funzioni sulla mappa»). Prima c'erano il bottone del radar e quattro link ad altre pagine: funghi, zona, regione.
     ⚠️ Niente zona del pluviometro: quella delle pagine funghi a volte e' larga (Sassello sta nella «Val Bormida», ma
     e' in valle dell'Erro). Le anteprime le disegna il browser (clientePagina, C.ant) quando arrivano sullo schermo. */
  const bottone = (href, k, testo, sotto) => `<a class="pz-ant-c" href="${href}" onclick="try{gtag('event','apri_mappa',{da:'${ga}-${k}'})}catch(e){}">`
    + `<div class="pz-ant-v" id="ant-${k}"></div><i class="pz-ant-q" id="ant-${k}-q"></i><span class="pz-ant-t">${testo}<small>${sotto}</small></span></a>`;
  const bottoni = [
    bottone(`${SITO}/?r=${reg}&amp;radar=ora`, 'radar', '📡 Radar piogge', 'Dove sta piovendo adesso, in Italia e in Europa'),
    bottone(`${SITO}/previsioni/?r=${reg}`, 'prev', `☀️ Previsioni ${esc(NREG)}`, 'Il tempo città per città, ora per ora'),
    bottone(`${SITO}/?r=${reg}&amp;g=7`, 'pluvio', `💧 Pluviometri ${esc(NREG)}`, 'La pioggia degli ultimi 7 giorni, pluviometro per pluviometro'),
  ];

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(TITOLO)}</title>
<meta name="description" content="${esc(DESCR)}">
<link rel="canonical" href="${indirizzoMeteoPaese(p)}">
<meta property="og:title" content="${esc(TITOLO)}">
<meta property="og:description" content="${esc(DESCR)}">
<meta property="og:image" content="${SITO}/preview.jpg">
<meta property="og:url" content="${indirizzoMeteoPaese(p)}">
<meta property="og:type" content="website">
${briciolaJson([['Mappa pluviometrica', `${SITO}/`], ['Previsioni meteo', `${SITO}/meteo/`], ['Meteo ' + p.n, null]])}
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
<style>${STILE}${CSS}${CSS_PAESE}</style>
</head>
<body>
<header>
  <a class="logo" href="${SITO}/">🌧️ Mappa Pluviometrica</a>
  <a class="yt" href="${CANALE}" target="_blank" rel="noopener"
     onclick="try{gtag('event','click_youtube',{pulsante:'${ga}'})}catch(e){}">▶ Iscriviti</a>
</header>
<main>
<p class="bric"><a href="${SITO}/">Mappa pluviometrica</a> › <a href="${SITO}/meteo/">Previsioni meteo</a> › ${esc(p.n)}</p>
<h1>Meteo ${esc(p.n)}</h1>
<p class="sotto"><b>Che tempo farà ${esc(p.dove)} nei prossimi 7 giorni</b>, ora per ora, e nei ${intorno.length} paesi intorno, ognuno alla sua quota; e quanta pioggia è già caduta ${esc(alPluv)}.</p>

<div class="pz-cerca"><input id="cerca" type="search" autocomplete="off" placeholder="Cerca il tuo paese, anche una frazione" aria-label="Cerca un paese o una frazione"><div class="pz-drop" id="drop"></div></div>
<section class="pz-scheda" id="scheda" aria-live="polite"></section>

<div class="pz-punto" id="punto"><span class="pz-quando">Il punto di stamattina</span>Sto leggendo previsioni e pluviometro…</div>

<h2>I prossimi 7 giorni ${esc(p.dove)}</h2>
<p class="nota" style="margin-top:0">Tocca un giorno: la mappa e la tabella dei paesi intorno passano a quel giorno. 💧 è la probabilità di pioggia.</p>
<div class="pz-giorni" id="giorni"></div>
<p class="pz-tot" id="tot"></p>

<div class="pz-mappa-testa"><span class="dove" id="mappa-giorno"></span></div>
<div id="pz-mappa"></div>
<p class="nota" id="mappa-nota" style="margin-top:2px">Tocca un paese per vederlo ora per ora.</p>

<h2>${esc(p.n)} e i paesi intorno</h2>
<p class="nota" style="margin-top:0">Dal più in basso al più in alto (quota del terreno, ~). Tocca un paese per le ore; scorri di lato per tutti i giorni. 💧 è la probabilità di pioggia.</p>
<div class="pz-scorri"><table class="pz-tab" id="tab"></table></div>

<h2>La pioggia caduta e quella in arrivo</h2>
<p class="nota" style="margin-top:0">Gli ultimi 25 giorni misurati ${esc(alPluv)}${ente ? ' (' + esc(ente) + ')' : ''} e i 7 giorni previsti ${esc(p.dove)}. Tocca una barra.</p>
<div class="pz-graf" id="graf"></div>
<div class="pz-graf-date" id="graf-date"></div>
<div class="pz-graf-info" id="graf-info"></div>
<div class="pz-leg"><span><i style="background:#1a5fa8"></i>misurata</span><span><i style="background:repeating-linear-gradient(45deg,#7fb0e0,#7fb0e0 3px,#b9d4ef 3px,#b9d4ef 6px)"></i>prevista</span><span id="leg-date"></span></div>
<div class="griglia" style="margin-top:14px">
  <div class="card"><h3 id="r1h">Ieri</h3><div class="numerone" id="r1">…</div><div id="r1t"></div></div>
  <div class="card"><h3>Ultimi 7 giorni</h3><div class="numerone" id="r7">…</div><div id="r7t"></div></div>
</div>

<h2>Guarda le nostre mappe</h2>
<div class="pz-ant" id="ant">
  ${bottoni.join('\n  ')}
</div>

<h2>Come funziona questa pagina</h2>
<p>Le previsioni sono quelle del modello ECMWF, distribuite da MET Norway (CC BY 4.0), chieste per ${esc(p.n)} e per ognuno dei paesi intorno alla sua quota, e aggiornate più volte al giorno; la probabilità di pioggia (💧) è di Open-Meteo (CC BY 4.0). La pioggia caduta è misurata ${esc(alPluv)}${ente ? ', rete ' + esc(ente) : ''}: non è una stima. Le due cose stanno separate anche nel grafico, perché una è un dato e l'altra una previsione.</p>
</main>

<footer>
  Previsioni: MET Norway (ECMWF) · Probabilità di pioggia: Open-Meteo · Pioggia misurata: ${esc(ente || casa.nome)} ·
  <a href="${SITO}/fonti">tutte le fonti e licenze</a> ·
  <a href="${SITO}/guida/">guida alla mappa</a> ·
  <a href="https://avventuremicologiche.it">Avventure Micologiche</a>
</footer>

<script src="/lib/leaflet/1.9.4/leaflet.js"></script>
<script>
(${clientePagina.toString()})(${JSON.stringify(C)});
</script>
</body>
</html>
`;
}

if (require.main === module) {
  (async () => {
    const SOLO = process.env.SOLO;
    const posti = METEO_PAESI.filter(p => !SOLO || p.slug === SOLO);
    if (!posti.length) throw new Error('nessun posto con SOLO=' + SOLO);
    const punti = [];
    for (const p of posti) {
      const [reg, s] = p.loc.split('/');
      const l = JSON.parse(fs.readFileSync(path.join(RADICE, 'data', 'paesi-localita', reg + '.json'), 'utf8'))[s] || [];
      punti.push(...l.filter(x => !x.qui));
    }
    const QUOTE_DI = await quotePaesi(punti);
    for (const p of posti) {
      const html = pagina(p, QUOTE_DI);
      // lo script della pagina deve girare (i nomi con l'apostrofo: «Santo Stefano d'Aveto»), come genera-pagine-localita.js
      for (const s of html.match(/<script>[\s\S]*?<\/script>/g) || []) new Function(s.slice(8, -9));
      const [reg] = p.loc.split('/');
      scrivi(path.join(RADICE, 'meteo', reg, p.slug, 'index.html'), html);
      console.log('  meteo/' + reg + '/' + p.slug + '/');
    }
    if (SOLO) { console.log(`1 pagina scritta (SOLO=${SOLO}), indice e sitemap non toccati.`); return; }
    // la pagina madre /meteo/ elenca anche i paesi: si riscrive con le zone di sempre
    const zone = ZONE_METEO_TUTTE.map(s => ZONE.find(x => slug(x.n) === s));
    scrivi(path.join(RADICE, 'meteo', 'index.html'), paginaIndice(zone));
    console.log('  meteo/ (la pagina madre, con i paesi)');
    const { scriviSitemap } = require('./genera-sitemap.js');
    const tot = scriviSitemap(SITO, RADICE);
    console.log(`${posti.length} pagine «Meteo <paese>» scritte, sitemap.xml con ${tot} indirizzi.`);
  })().catch(e => { console.error(e); process.exit(1); });
}
