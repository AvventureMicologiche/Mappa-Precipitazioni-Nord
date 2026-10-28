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

/* ⚠️ I CAPOLUOGHI DI PROVINCIA SI VEDONO SEMPRE nell'anteprima «Previsioni» (28/10/2026, suo: «i capoluoghi di provincia
   si devono vedere sempre, è più importante Savona di Millesimo»). In capoluoghi.json «s» e' la SIGLA della provincia e
   non dice chi e' il capoluogo (Millesimo e Savona: SV), e col numero di abitanti non basta (Busto Arsizio > Varese,
   Marsala > Trapani, Gela > Caltanissetta): l'elenco e' scritto qui. Province con piu' capoluoghi: tutti. */
const normNome = t => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’`]/g, "'").replace(/\s+/g, ' ').trim();
const CAPOLUOGHI_PROVINCIA = new Set([
  'Torino', 'Alessandria', 'Asti', 'Biella', 'Cuneo', 'Novara', 'Verbania', 'Vercelli', 'Aosta',
  'Milano', 'Bergamo', 'Brescia', 'Como', 'Cremona', 'Lecco', 'Lodi', 'Mantova', 'Monza', 'Pavia', 'Sondrio', 'Varese',
  'Trento', 'Bolzano', 'Venezia', 'Belluno', 'Padova', 'Rovigo', 'Treviso', 'Verona', 'Vicenza',
  'Trieste', 'Gorizia', 'Pordenone', 'Udine', 'Genova', 'Imperia', 'La Spezia', 'Savona',
  'Bologna', 'Ferrara', 'Forlì', 'Cesena', 'Modena', 'Parma', 'Piacenza', 'Ravenna', 'Reggio Emilia', "Reggio nell'Emilia", 'Rimini',
  'Firenze', 'Arezzo', 'Grosseto', 'Livorno', 'Lucca', 'Massa', 'Carrara', 'Pisa', 'Pistoia', 'Prato', 'Siena',
  'Perugia', 'Terni', 'Ancona', 'Ascoli Piceno', 'Fermo', 'Macerata', 'Pesaro', 'Urbino',
  'Roma', 'Frosinone', 'Latina', 'Rieti', 'Viterbo', "L'Aquila", 'Chieti', 'Pescara', 'Teramo', 'Campobasso', 'Isernia',
  'Napoli', 'Avellino', 'Benevento', 'Caserta', 'Salerno', 'Bari', 'Barletta', 'Andria', 'Trani', 'Brindisi', 'Foggia', 'Lecce', 'Taranto',
  'Potenza', 'Matera', 'Catanzaro', 'Cosenza', 'Crotone', 'Reggio Calabria', 'Reggio di Calabria', 'Vibo Valentia',
  'Palermo', 'Agrigento', 'Caltanissetta', 'Catania', 'Enna', 'Messina', 'Ragusa', 'Siracusa', 'Trapani',
  'Cagliari', 'Sassari', 'Nuoro', 'Oristano', 'Carbonia', 'Iglesias', 'Olbia', 'Tempio Pausania', 'Tortolì', 'Lanusei', 'Sanluri', 'Villacidro',
].map(normNome));
// le citta' dell'anteprima nell'ordine in cui si mettono: capoluogo di regione, di provincia, poi gli altri, dal piu' abitato
let ABITANTI = null;
function ordineCitta(reg) {
  if (!ABITANTI) {
    ABITANTI = {};
    for (const r of fs.readFileSync(path.join(RADICE, 'data', 'elenco-paesi.txt'), 'utf8').split('\n')) {
      const p = r.split('|'); if (p.length >= 6) ABITANTI[normNome(p[0]) + '|' + p[4]] = +p[5] || 0;
    }
  }
  const tutte = JSON.parse(fs.readFileSync(path.join(RADICE, 'data', 'capoluoghi.json'), 'utf8'))[reg] || [];
  const cap = c => c.c || CAPOLUOGHI_PROVINCIA.has(normNome(c.n));
  const ab = c => ABITANTI[normNome(c.n) + '|' + reg] || 0;
  const ord = tutte.slice().sort((a, b) => (b.c ? 1 : 0) - (a.c ? 1 : 0) || (cap(b) ? 1 : 0) - (cap(a) ? 1 : 0) || ab(b) - ab(a));
  return { ord: ord.map(c => c.n), cap: ord.filter(cap).length };
}

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
/* i capoluoghi di provincia non perdono mai il nome: se non ci stanno perdono la minima (28/10/2026) */
.pz-ant-v .pz-et.nome .mn{display:none}
@media (min-width:700px){.pz-ant-v{height:300px}}

/* ── LA TESTATA (28/10/2026, suo: «non c'è intestazione nell'header, ma solo mappa pluviometrica, non c'è scritto chi
   siamo o altri bottoni ma solo quello iscriviti»). Scelta fra tre proposte provate sulla pagina vera, dopo aver guardato
   3B Meteo, ilMeteo e Meteo.it: la «B», come ilMeteo. In alto la striscia scura col menu, le voci come i due bottoni della
   home (Storico piogge, Previsioni meteo: suo, «come in home») piu' la Guida, a destra Chi siamo e Contatti (la home,
   #noi e #piede); sotto la fascia bianca col nome, chi siamo e Iscriviti. Tolti su sua richiesta Radar, Pioggia caduta
   (doppione dello storico), Meteo dei paesi (doppione delle previsioni) e Mappa boschi. Al telefono il menu sta SOTTO il
   nome e scorre di lato, senza ☰ da scoprire. Classi tutte «t-»: la pagina usa gia' .pc (la probabilita' di pioggia).
   ⚠️ header ha gia' display:flex, align-items:center e flex-wrap:wrap (lo stile della pagina regione): senza nowrap e
   stretch la striscia al telefono si allargava quanto le sue voci e la pagina sbordava a 741 px. */
header.tB{display:flex;flex-direction:column;flex-wrap:nowrap;align-items:stretch;padding:0;background:#fff;color:#123252;border-bottom:1px solid #d0d8e8}
.tB a{text-decoration:none}
/* LARGA COME LA PAGINA (28/10/2026, suo: «le scritte in alto non sono simmetriche», scelta «testata larga come la
   pagina»): la stessa colonna di main (760 px con 16 di margine), cosi' «Storico piogge» e il logo partono dove parte
   il titolo e «Contatti» e Iscriviti finiscono dove finisce la scheda. Nella striscia 5 px di margine: con gli 11 delle
   voci fanno i 16 della pagina. In 728 px «Iscriviti al canale» e la frase sotto il nome non ci stavano: «Iscriviti». */
.tB .t-in{max-width:760px;margin:0 auto;width:100%;padding:0 16px;display:flex;align-items:center}
.tB .t-striscia{background:#0f2d4f}
.tB .t-striscia .t-in{gap:2px;height:38px;padding:0 5px}
.tB .t-striscia a{color:rgba(255,255,255,.86);font-size:13.5px;font-weight:600;padding:0 11px;height:38px;display:flex;align-items:center;white-space:nowrap}
.tB .t-striscia a:hover{color:#fff;background:rgba(255,255,255,.08)}
.tB .t-striscia a.on{color:#0f2d4f;background:#f9c93e}
.tB .t-striscia .t-dx{margin-left:auto;display:flex;gap:2px}
.tB .t-banda .t-in{gap:16px;padding-top:14px;padding-bottom:14px}
.tB .t-marchio{display:flex;align-items:center;gap:12px}
.tB .t-goccia{font-size:34px;line-height:1}
.tB .t-marchio b{display:block;font-size:24px;font-weight:800;letter-spacing:-.015em;line-height:1.1;color:#123252}
.tB .t-marchio small{display:block;font-size:13.5px;color:#4a5a6e;font-weight:500;margin-top:3px;line-height:1.3}
.tB .t-tel{display:none}
.tB .t-ytp{margin-left:auto;display:inline-flex;align-items:center;gap:8px;background:#e12b2b;color:#fff;font-size:14.5px;font-weight:700;padding:9px 16px 9px 13px;border-radius:999px;white-space:nowrap}
.tB .t-ytp svg{width:18px;height:18px;fill:#fff}
@media (max-width:760px){
  .tB .t-striscia{order:2}
  .tB .t-in{padding:0 16px}
  .tB .t-banda .t-in{padding-top:10px;padding-bottom:10px;gap:10px}
  .tB .t-goccia{font-size:26px}
  .tB .t-marchio b{font-size:18px}
  .tB .t-marchio small{font-size:12px;margin-top:1px}
  .tB .t-pc{display:none}.tB .t-tel{display:inline}
  .tB .t-ytp{font-size:13px;padding:7px 11px 7px 9px;gap:6px}
  .tB .t-striscia .t-in{overflow-x:auto;scrollbar-width:none;padding:0 5px;-webkit-mask-image:linear-gradient(90deg,#000 86%,transparent);mask-image:linear-gradient(90deg,#000 86%,transparent)}
  .tB .t-striscia .t-in::-webkit-scrollbar{display:none}
  .tB .t-striscia .t-dx{margin-left:0;padding-right:30px}
}
/* a 360 px «Mappa Pluviometrica» andava su due righe */
@media (max-width:389px){.tB .t-marchio{gap:8px}.tB .t-goccia{font-size:23px}.tB .t-marchio b{font-size:16px;white-space:nowrap}}
`;
const YT_ICONA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>';
function testata(reg, ga) {
  const vai = k => ` onclick="try{gtag('event','apri_mappa',{da:'${ga}-testata-${k}'})}catch(e){}"`;
  return `<header class="tB">
  <nav class="t-striscia" aria-label="Menu"><div class="t-in">`
    + `<a href="${SITO}/?r=${reg}"${vai('storico')}>Storico piogge</a>`
    + `<a class="on" href="${SITO}/previsioni/?r=${reg}"${vai('previsioni')}>Previsioni meteo</a>`
    + `<a href="${SITO}/guida/">Guida</a>`
    + `<span class="t-dx"><a href="https://avventuremicologiche.it/#noi">Chi siamo</a><a href="https://avventuremicologiche.it/#piede">Contatti</a></span></div></nav>
  <div class="t-banda"><div class="t-in">
    <a class="t-marchio" href="${SITO}/"><span class="t-goccia">🌧️</span><span><b>Mappa Pluviometrica</b><small><span class="t-pc">Previsioni, radar e pioggia misurata in tutta Italia · un progetto di Avventure Micologiche</span><span class="t-tel">di Avventure Micologiche</span></small></span></a>
    <a class="t-ytp" href="${CANALE}" target="_blank" rel="noopener" onclick="try{gtag('event','click_youtube',{pulsante:'${ga}'})}catch(e){}">${YT_ICONA}<span>Iscriviti</span></a>
  </div></div>
</header>
<script>(function(){var a=document.querySelector('.tB .t-striscia a.on'),f=a&&a.parentNode;if(f&&a.offsetLeft+a.offsetWidth>f.clientWidth-30)f.scrollLeft=a.offsetLeft-40;})()</script>`;
}

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
    ant: Object.assign({ confine: confineDi(casa) }, ordineCitta(reg)) };
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
${testata(reg, ga)}
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
