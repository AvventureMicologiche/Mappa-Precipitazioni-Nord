// Pagina CAMPIONE «Previsioni meteo Val Brembana» (24/10/2026, scheda 92). Mockup fuori dal repo, da guardare in
// Chrome con un server locale in questa cartella:  python -m http.server 8897  →  http://localhost:8897/val-brembana/
// Prende stile e testata dalla pagina di zona vera (zone/val-brembana/index.html), la quota dei paesi dal modello del
// terreno (Open-Meteo Elevation, come quote-terreno.js), e scrive una pagina che legge DAL VIVO le previsioni
// (/api/previsioni di produzione, che risponde anche a localhost), i pluviometri (riepilogo di zona su raw) e
// l'elenco dei paesi del sito (/data/elenco-paesi.txt, CORS aperto).
// v2 (stesso giorno, suo «non c'e' niente di cliccabile» e «metti cerca localita'»): giorni da scegliere, mappa della
// valle, scheda del posto ora per ora (tocco su un paese o ricerca), barre del grafico che dicono il numero.
const fs = require('fs'), path = require('path');
const REPO = 'D:/video youtube/claudio/claudio pluviometro/Mappa-Precipitazioni-Nord';
const SITO = 'https://precipitazioni.avventuremicologiche.it';
const SLUG = 'val-brembana', NOME = 'Val Brembana', REG = 'lombardia', REGNOME = 'Lombardia', ENTE = 'ARPA Lombardia';
const CENTRO = [45.8725, 9.65194];

(async () => {
  const zona = fs.readFileSync(path.join(REPO, 'zone', SLUG, 'index.html'), 'utf8');
  const stile = zona.match(/<style[^>]*>([\s\S]*?)<\/style>/)[1];
  const testata = zona.slice(zona.indexOf('<header>'), zona.indexOf('</header>') + 9);
  const paesi = require(path.join(REPO, 'data', 'paesi-zone.json'))[SLUG];
  const q = await (await fetch('https://api.open-meteo.com/v1/elevation?latitude=' + paesi.map(p => p.lat).join(',')
    + '&longitude=' + paesi.map(p => p.lon).join(','))).json();
  const quote = {}; paesi.forEach((p, i) => { quote[p.n] = Math.round(q.elevation[i]); });
  // i pluviometri della zona: id dalla tabella della pagina vera, posizione e quota da funghi-posti.json
  const posti = JSON.parse(fs.readFileSync(path.join(REPO, '.github/scripts/funghi-posti.json'), 'utf8'))[REG];
  const pluv = [...zona.matchAll(/data-id="(\w+)"><td><a href="([^"]+)">([^<]+)/g)].map(m => {
    const p = posti.find(r => String(r[0]) === m[1]) || [];
    return { id: m[1], n: m[3], url: m[2], q: p[3], lat: p[4], lon: p[5] };
  });

  const html = `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Previsioni meteo ${NOME}: che tempo farà nei prossimi 7 giorni, paese per paese</title>
<meta name="description" content="Previsioni meteo della ${NOME} per i prossimi 7 giorni: pioggia prevista, minime e massime in ${paesi.length} paesi della valle, ognuno alla sua quota, ora per ora. E quanta pioggia è già caduta nei pluviometri di ${ENTE}.">
<link rel="stylesheet" href="${SITO}/lib/leaflet/1.9.4/leaflet.css">
<style>${stile}
/* ── pagina previsioni di zona (campione 24/10/2026) ── */
.pz-campione{background:#fff7e0;border:1px dashed #d9a400;color:#7a5a00;border-radius:8px;padding:6px 10px;font-size:12.5px;margin:10px 0}
.pz-cerca{position:relative;margin:14px 0 4px}
.pz-cerca input{width:100%;box-sizing:border-box;font-size:16px;padding:12px 14px 12px 40px;border:2px solid #1a5fa8;border-radius:12px;outline:none;background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%231a5fa8' stroke-width='2.6' stroke-linecap='round'%3E%3Ccircle cx='10.5' cy='10.5' r='6.5'/%3E%3Cpath d='M15.5 15.5 21 21'/%3E%3C/svg%3E") no-repeat 13px center}
.pz-drop{display:none;position:absolute;left:0;right:0;top:100%;margin-top:4px;background:#fff;border:1px solid #c9d5e1;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.15);z-index:1000;overflow:hidden}
.pz-drop.on{display:block}
.pz-drop .r{padding:10px 14px;cursor:pointer;border-bottom:1px solid #eef2f6;display:flex;justify-content:space-between;gap:10px}
.pz-drop .r:hover,.pz-drop .r.sel{background:#eef5fb}
.pz-drop .r small{color:#7a8796}
.pz-drop .t{padding:10px 14px;color:#5a6b7d;font-size:14px}
.pz-punto{background:#eef5fb;border-left:4px solid #1a5fa8;border-radius:8px;padding:12px 14px;margin:14px 0 6px;font-size:15.5px;line-height:1.5}
.pz-punto b{color:#0f3d6e}
.pz-punto .pz-quando{display:block;font-size:12px;color:#5a6b7d;margin-bottom:4px;text-transform:uppercase;letter-spacing:.04em}
.pz-giorni{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;margin:10px 0 4px}
.pz-g{background:#fff;border:1px solid #d8e2ec;border-radius:10px;padding:8px 4px;text-align:center;cursor:pointer;font:inherit;color:inherit;transition:transform .1s}
.pz-g:hover{border-color:#1a5fa8}
.pz-g.sel{background:#1a5fa8;border-color:#1a5fa8;color:#fff}
.pz-g.sel .t .mn,.pz-g.sel .t .mx,.pz-g.sel .p,.pz-g.sel .n{color:#fff}
.pz-g .n{font-size:12px;font-weight:700;color:#333;text-transform:capitalize}
.pz-g .ic{font-size:26px;line-height:1.3}
.pz-g .t{font-size:13px}.pz-g .t .mn{color:#1a5fa8}.pz-g .t .mx{color:#c4501a;font-weight:700}
.pz-g .p{font-size:13px;font-weight:700;color:#1a5fa8;margin-top:4px;min-height:17px}
.pz-g .p.zero{opacity:.6;font-weight:400}
.pz-g .barra{height:4px;background:#e3edf7;border-radius:2px;margin:4px 6px 0;overflow:hidden}
.pz-g .barra i{display:block;height:100%;background:#1a5fa8}
.pz-g.sel .barra{background:rgba(255,255,255,.3)}.pz-g.sel .barra i{background:#fff}
.pz-tot{font-size:14px;color:#333;margin:6px 0 0}
.pz-mappa-testa{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-top:10px}
.pz-mappa-testa .dove{font-weight:700;color:#0f3d6e}
.pz-sw{display:inline-flex;border:1px solid #1a5fa8;border-radius:999px;overflow:hidden}
.pz-sw button{border:0;background:#fff;color:#1a5fa8;font:inherit;font-size:13.5px;font-weight:700;padding:7px 12px;cursor:pointer}
.pz-sw button.on{background:#1a5fa8;color:#fff}
#pz-mappa{height:460px;border-radius:12px;border:1px solid #c9d5e1;margin:8px 0 4px;z-index:1}
.pz-pt{position:relative}
.pz-pt i{position:absolute;left:-4px;top:-4px;width:8px;height:8px;border-radius:50%;background:#1a5fa8;border:1.5px solid #fff;box-shadow:0 0 0 1px #1a5fa8}
.pz-et{position:absolute;left:0;top:0;white-space:nowrap;cursor:pointer;text-align:center;line-height:1.15;transform:translate(-50%,-112%);padding:2px}
.pz-et .v{display:inline-block;font-size:12px;font-weight:800;border-radius:999px;padding:1px 7px;background:#fff;color:#0f3d6e;box-shadow:0 1px 3px rgba(0,0,0,.35)}
.pz-et .v.bagnato{background:#1a5fa8;color:#fff}
.pz-et .ic{font-size:18px;line-height:1;vertical-align:-3px;margin-right:2px;filter:drop-shadow(0 0 1px #fff) drop-shadow(0 0 1px #fff)}
.pz-et .v.asc{font-weight:600;color:#5a6b7d;font-size:11px}
.pz-et .v .mn{color:#1a5fa8}.pz-et .v .mx{color:#c4501a}
.pz-et .nm{display:block;font-size:11.5px;font-weight:700;color:#1f2d3a;margin-top:1px}
.pz-ln{position:absolute;left:0;top:0;width:1px;height:1px;overflow:visible;pointer-events:none}
.pz-ln line{stroke:#1f2d3a;stroke-width:1.2;opacity:.75}
/* VARIANTI delle etichette, da scegliere con ?et=A|B|C|D (24/10/2026) */
.et-A .pz-et .nm{font-size:12px;text-shadow:0 0 2px #fff,0 0 2px #fff,0 0 3px #fff,0 0 4px #fff,0 0 5px #fff,0 0 6px #fff}
.et-B .pz-et .nm{display:inline-block;background:rgba(255,255,255,.88);border-radius:5px;padding:0 5px;margin-top:2px;box-shadow:0 1px 2px rgba(0,0,0,.2)}
.et-C .pz-et{background:#fff;border-radius:999px;padding:2px 8px 2px 4px;box-shadow:0 1px 4px rgba(0,0,0,.35)}
.et-C .pz-et .v{box-shadow:none;padding:0 6px}
.et-C .pz-et .ic{font-size:16px;filter:none}
.et-C .pz-et .nm{display:inline;font-size:11.5px;margin:0 0 0 1px}
.et-C .pz-et{padding:1px 7px 1px 3px}
.et-D .pz-et{background:rgba(15,61,110,.88);border-radius:8px;padding:3px 7px;box-shadow:0 1px 4px rgba(0,0,0,.35)}
.et-D .pz-et .v{background:none;box-shadow:none;color:#fff;padding:0}
.et-D .pz-et .v.bagnato{background:none;color:#9fd0ff}
.et-D .pz-et .v.asc{color:#d6e3f0}
.et-D .pz-et .v .mn{color:#9fd0ff}.et-D .pz-et .v .mx{color:#ffb38a}
.et-D .pz-et .nm{color:#fff;font-weight:600}
/* E: cartellino bianco su due righe; F: tutto su una riga nella pillola bianca */
.et-E .pz-et{background:#fff;border-radius:8px;padding:2px 7px 3px;box-shadow:0 1px 4px rgba(0,0,0,.35)}
.et-E .pz-et .v{box-shadow:none;padding:0 3px;background:none}
.et-E .pz-et .v.bagnato,.et-F .pz-et .v.bagnato{background:#1a5fa8;color:#fff;padding:0 6px 0 3px;margin-left:3px}
.et-E .pz-et .v.poco,.et-F .pz-et .v.poco{color:#1a5fa8;margin-left:2px}
.et-E .pz-et .ic{font-size:16px;filter:none}
.et-E .pz-et .nm{font-size:11.5px;margin-top:0;border-top:1px solid #e3e9ef;padding-top:1px}
.et-F .pz-et{background:#fff;border-radius:999px;padding:1px 8px 1px 3px;box-shadow:0 1px 4px rgba(0,0,0,.35)}
.et-F .pz-et .v{box-shadow:none;padding:0 3px;background:none}
.et-F .pz-et .ic{font-size:16px;filter:none}
.et-F .pz-et .nm{display:inline;font-size:11.5px;margin-left:3px}
.tutto .pz-sw{display:none}
.pz-pl{width:12px;height:12px;border-radius:50%;background:#0b7a3e;border:2px solid #fff;box-shadow:0 0 0 1px #0b7a3e;transform:translate(-50%,-50%)}
.pz-scorri{overflow-x:auto;-webkit-overflow-scrolling:touch;margin:8px 0}
table.pz-tab{border-collapse:collapse;min-width:640px;width:100%;font-size:13px}
table.pz-tab th,table.pz-tab td{padding:6px 4px;border-bottom:1px solid #e6ecf2;text-align:center;white-space:nowrap}
table.pz-tab th:first-child,table.pz-tab td:first-child{text-align:left;position:sticky;left:0;background:#fff;padding-right:10px}
table.pz-tab tbody tr{cursor:pointer}table.pz-tab tbody tr:hover td{background:#f4f8fc}
table.pz-tab td:first-child{color:#1a5fa8;font-weight:700;text-decoration:underline;text-decoration-color:#bcd2e8}
table.pz-tab .col-sel{background:#eef5fb}
table.pz-tab th.col-sel{color:#1a5fa8}
table.pz-tab td .q{display:block;font-size:11px;color:#7a8796;font-weight:400;text-decoration:none}
table.pz-tab td .ic{font-size:17px}
table.pz-tab td .mn{color:#1a5fa8}table.pz-tab td .mx{color:#c4501a;font-weight:700}
table.pz-tab td .mm{display:block;font-size:11.5px;color:#1a5fa8;font-weight:700;min-height:14px}
.pz-scheda{display:none;border:2px solid #1a5fa8;border-radius:14px;padding:12px 14px;margin:14px 0;background:#fff;scroll-margin-top:12px}
.pz-scheda.on{display:block}
.pz-scheda .testa{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
.pz-scheda h3{margin:0;font-size:19px;color:#0f3d6e}
.pz-scheda .sub{font-size:12.5px;color:#5a6b7d;margin-top:2px}
.pz-scheda .chiudi{border:0;background:#eef2f6;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer;flex:none}
.pz-scheda .giorni{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(66px,1fr);gap:6px;overflow-x:auto;margin:10px 0 6px;padding-bottom:4px}
.pz-scheda .giorni button{border:1px solid #d8e2ec;background:#fff;border-radius:10px;padding:6px 4px;font:inherit;font-size:12.5px;cursor:pointer;text-align:center}
.pz-scheda .giorni button.sel{background:#1a5fa8;color:#fff;border-color:#1a5fa8}
.pz-scheda .giorni b{display:block;text-transform:capitalize}
.pz-ore{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(54px,1fr);gap:4px;overflow-x:auto;padding:6px 0 8px}
.pz-ora{text-align:center;border-radius:8px;padding:5px 2px;background:#f6f9fc;font-size:12px}
.pz-ore.fasce .pz-ora{padding:8px 4px;font-size:13px}.pz-ore.fasce .pz-ora .ic{font-size:26px}.pz-ore.fasce .pz-ora .h b{display:block;color:#0f3d6e;font-size:13px}
.pz-ora .h{color:#5a6b7d}.pz-ora .ic{font-size:20px}.pz-ora .t{font-weight:700}
.pz-ora .mm{color:#1a5fa8;font-weight:700;min-height:15px}.pz-ora .v{color:#7a8796;font-size:11px}
.pz-porte{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:8px}
.pz-porte a{display:block;text-align:center;border:1px solid #c9d5e1;border-radius:10px;padding:8px 4px;text-decoration:none;color:#0f3d6e;font-size:12.5px;font-weight:700}
.pz-porte a span{display:block;font-size:20px}
.pz-graf{display:flex;align-items:flex-end;gap:2px;height:130px;margin:12px 0 4px;padding-bottom:2px;border-bottom:1px solid #c9d5e1}
.pz-graf .b{flex:1;background:#1a5fa8;border-radius:2px 2px 0 0;min-height:2px;cursor:pointer}
.pz-graf .b:hover,.pz-graf .b.sel{background:#c4501a}
.pz-graf .b.prev{background:repeating-linear-gradient(45deg,#7fb0e0,#7fb0e0 3px,#b9d4ef 3px,#b9d4ef 6px)}
.pz-graf .b.prev.sel,.pz-graf .b.prev:hover{background:#c4501a}
.pz-graf-info{font-size:14px;min-height:20px;color:#0f3d6e;margin-top:6px}
.pz-leg{display:flex;gap:14px;flex-wrap:wrap;font-size:12.5px;color:#4a5866;margin-top:4px}
.pz-leg i{display:inline-block;width:12px;height:10px;margin-right:5px;vertical-align:-1px;border-radius:2px}
.pz-radar{display:block;background:#1a5fa8;color:#fff!important;text-decoration:none;border-radius:12px;padding:14px 16px;margin:18px 0;font-weight:700}
.pz-radar small{display:block;font-weight:400;opacity:.9;margin-top:2px}
.pz-vai{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}
.pz-vai a{display:block;border:1px solid #c9d5e1;border-radius:10px;padding:12px;text-decoration:none;color:#0f3d6e;font-weight:700;background:#fff}
.pz-vai a small{display:block;font-weight:400;color:#5a6b7d;margin-top:3px}
@media (max-width:600px){.pz-giorni{gap:4px}.pz-g{padding:6px 2px}.pz-g .ic{font-size:22px}.pz-g .t,.pz-g .p{font-size:12px}.pz-vai{grid-template-columns:1fr}#pz-mappa{height:480px}}
</style>
</head>
<body>
${testata}
<main>
<p class="pz-campione">Pagina CAMPIONE in locale (24/10/2026): non è online.</p>
<p class="bric"><a href="${SITO}/">Mappa pluviometrica</a> › <a href="${SITO}/${REG}/">${REGNOME}</a> › <a href="${SITO}/zone/${SLUG}/">${NOME}</a> › Previsioni</p>
<h1>Previsioni meteo ${NOME}</h1>
<p class="sotto"><b>Che tempo farà in ${NOME} nei prossimi 7 giorni</b>: pioggia, minime e massime in ${paesi.length} paesi della valle, ognuno alla sua quota, e quanta pioggia è già caduta nei pluviometri di ${ENTE}.</p>

<div class="pz-cerca"><input id="cerca" type="search" autocomplete="off" placeholder="Cerca il tuo paese, anche una frazione" aria-label="Cerca un paese o una frazione"><div class="pz-drop" id="drop"></div></div>
<section class="pz-scheda" id="scheda" aria-live="polite"></section>

<div class="pz-punto" id="punto"><span class="pz-quando">Il punto di stamattina</span>Sto leggendo previsioni e pluviometri…</div>

<h2>I prossimi 7 giorni in ${NOME}</h2>
<p class="nota" style="margin-top:0">Tocca un giorno: la mappa e la tabella qui sotto passano a quel giorno.</p>
<div class="pz-giorni" id="giorni"></div>
<p class="pz-tot" id="tot"></p>

<div class="pz-mappa-testa"><span class="dove" id="mappa-giorno"></span>
  <span class="pz-sw" role="group"><button id="sw-mm" class="on">💧 Pioggia</button><button id="sw-t">🌡 Temperature</button></span></div>
<div id="pz-mappa"></div>
<p class="nota" style="margin-top:2px">Tocca un paese per vederlo ora per ora. I puntini verdi sono i pluviometri di ${ENTE}.</p>

<h2>Paese per paese</h2>
<p class="nota" style="margin-top:0">Dal più in basso al più in alto (quota del terreno, ~). Tocca un paese per le ore; scorri di lato per tutti i giorni.</p>
<div class="pz-scorri"><table class="pz-tab" id="tab"></table></div>

<h2>La pioggia caduta e quella in arrivo</h2>
<p class="nota" style="margin-top:0">Gli ultimi 30 giorni misurati dai pluviometri di ${ENTE} (media della valle) e i 7 giorni previsti. Tocca una barra.</p>
<div class="pz-graf" id="graf"></div>
<div class="pz-graf-info" id="graf-info"></div>
<div class="pz-leg"><span><i style="background:#1a5fa8"></i>misurata</span><span><i style="background:repeating-linear-gradient(45deg,#7fb0e0,#7fb0e0 3px,#b9d4ef 3px,#b9d4ef 6px)"></i>prevista</span><span id="leg-date"></span></div>
<div class="griglia" style="margin-top:14px">
  <div class="card"><h3>Ieri</h3><div class="numerone" id="r1">…</div><div id="r1t"></div></div>
  <div class="card"><h3>Ultimi 7 giorni</h3><div class="numerone" id="r7">…</div><div id="r7t"></div></div>
</div>

<a class="pz-radar" href="${SITO}/${REG}/adesso/">📡 Sta piovendo adesso in ${NOME}?<small>Guarda il radar delle piogge in diretta</small></a>

<h2>Le altre pagine della ${NOME}</h2>
<div class="pz-vai">
  <a href="${SITO}/zone/${SLUG}/">💧 Quanto ha piovuto in ${NOME}<small>Ieri, 7 e 30 giorni, pluviometro per pluviometro</small></a>
  <a href="${SITO}/funghi/zone/${SLUG}/">🍄 Funghi in ${NOME}<small>La pioggia che conta, da 13 a 20 giorni fa</small></a>
  <a href="${SITO}/?r=${REG}&amp;g=7&amp;pl=${CENTRO.join(',')}&amp;pn=${encodeURIComponent(NOME)}&amp;pz=1">🗺 La mappa della pioggia<small>La ${NOME} sulla mappa pluviometrica</small></a>
  <a href="${SITO}/?r=${REG}&amp;m=prev&amp;pl=${CENTRO.join(',')}&amp;pn=${encodeURIComponent(NOME)}&amp;pz=1">☀️ Le previsioni sulla mappa<small>Tocca un paese qualsiasi della valle</small></a>
</div>

<h2>Come funziona questa pagina</h2>
<p>Le previsioni sono quelle del modello ECMWF, distribuite da MET Norway (CC BY 4.0), chieste per ognuno dei ${paesi.length} paesi e aggiornate più volte al giorno. La pioggia caduta è misurata dai pluviometri di ${ENTE}: non è una stima. Le due cose stanno separate anche nel grafico, perché una è un dato e l'altra una previsione.</p>
</main>
<script src="${SITO}/lib/leaflet/1.9.4/leaflet.js"></script>
<script>
(function () {
  var SITO = '${SITO}', REG = '${REG}';
  var API = SITO + '/api/previsioni';
  var RIP = 'https://raw.githubusercontent.com/AvventureMicologiche/Mappa-Precipitazioni-Nord/main/data/riepiloghi/zone/${SLUG}.json';
  var ET = (new URLSearchParams(location.search).get('et') || 'F').toUpperCase(), TUTTO = ET === 'E' || ET === 'F';
  // la pioggia come «💧0,8» invece di «0,8 mm» (24/10, suo «prova con la gocciolina»); ?goccia=0 per tornare ai mm
  var GOCCIA = new URLSearchParams(location.search).get('goccia') !== '0';
  var RILIEVO = 'https://cdn.jsdelivr.net/gh/AvventureMicologiche/Mappa-Precipitazioni-Tessere@90a532e7a3f95e6cde1fc4fd0ee6fc658ffb2f6d/rilievo/';
  var QUOTE = ${JSON.stringify(quote)};
  var PLUV = ${JSON.stringify(pluv)};
  var GS = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'], GL = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var ICONE = [[/clearsky_day|fair_day/, '☀️'], [/clearsky_night|fair_night/, '🌙'], [/partlycloudy_day/, '⛅'], [/partlycloudy_night|^cloudy|fog/, '☁️'],
               [/thunder/, '⛈️'], [/heavyrain|heavysleet/, '🌧️'], [/rain|sleet|drizzle/, '🌦️'], [/snow/, '🌨️']];
  function icona(s) { for (var i = 0; i < ICONE.length; i++) if (ICONE[i][0].test(s || '')) return ICONE[i][1]; return '☁️'; }
  function iso(ms) { return new Date(ms).toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' }); }
  function piu(s, n) { var p = s.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n, 12)).toISOString().slice(0, 10); }
  var OGGI = iso(Date.now()), DOMANI = piu(OGGI, 1), IERI = piu(OGGI, -1);
  function d(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function nome(s, lungo) { var x = d(s); return s === OGGI ? 'oggi' : s === DOMANI ? 'domani' : s === IERI ? 'ieri' : (lungo ? GL : GS)[x.getDay()] + ' ' + x.getDate(); }
  function num(n) { return (Math.round(n * 10) / 10).toFixed(1).replace('.', ','); }
  function mm(n) { return n === 0 ? '0' : n < 10 ? num(n) : String(Math.round(n)); }
  function esc(t) { return String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function norm(t) { return String(t).toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/['’.-]/g, ' ').replace(/\\s+/g, ' ').trim(); }
  function $(id) { return document.getElementById(id); }
  var J = null, G = [], RIPJ = null, SEL = OGGI, MODO = 'mm', mappa = null, strato = null;

  /* ── i 7 giorni della valle ── */
  function giorniDi(j) {
    var per = {};
    j.capoluoghi.forEach(function (c) { (c.giorni || []).forEach(function (g) { if (g.g < OGGI) return; (per[g.g] = per[g.g] || []).push({ c: c, g: g }); }); });
    return Object.keys(per).sort().slice(0, 7).map(function (k) {
      var l = per[k], conti = {}, top = null, mmS = 0, mmMax = 0, dove = '';
      l.forEach(function (x) { var i = icona(x.g.s); conti[i] = (conti[i] || 0) + 1; mmS += x.g.mm; if (x.g.mm > mmMax) { mmMax = x.g.mm; dove = x.c.n; } });
      Object.keys(conti).forEach(function (i) { if (!top || conti[i] > conti[top]) top = i; });
      var mn = Math.min.apply(null, l.map(function (x) { return x.g.mn; })), mx = Math.max.apply(null, l.map(function (x) { return x.g.mx; }));
      return { g: k, ic: top, mn: mn, mx: mx, dmn: l.filter(function (x) { return x.g.mn === mn; })[0].c.n, dmx: l.filter(function (x) { return x.g.mx === mx; })[0].c.n, mm: mmS / l.length, mmMax: mmMax, dove: dove };
    });
  }
  function disegnaGiorni() {
    var maxMm = Math.max(5, Math.max.apply(null, G.map(function (x) { return x.mm; })));
    $('giorni').innerHTML = G.map(function (x) {
      return '<button class="pz-g' + (x.g === SEL ? ' sel' : '') + '" data-g="' + x.g + '"><div class="n">' + nome(x.g) + '</div><div class="ic">' + x.ic + '</div>'
        + '<div class="t"><span class="mn">' + x.mn + '°</span> / <span class="mx">' + x.mx + '°</span></div>'
        + '<div class="p' + (x.mm < 0.1 ? ' zero' : '') + '">' + (x.mm < 0.1 ? 'asciutto' : mm(x.mm) + ' mm') + '</div>'
        + '<div class="barra"><i style="width:' + Math.min(100, x.mm / maxMm * 100) + '%"></i></div></button>';
    }).join('');
  }
  function totale() {
    var tot = G.reduce(function (a, x) { return a + x.mm; }, 0), picco = G.slice().sort(function (a, b) { return b.mmMax - a.mmMax; })[0];
    $('tot').innerHTML = tot < 0.5 ? 'Nei prossimi 7 giorni <b>non è prevista pioggia</b> che conti in valle.'
      : 'In tutta la settimana sono previsti in media <b>' + mm(tot) + ' mm</b>; il giorno più bagnato è <b>' + nome(picco.g, true) + '</b>, fino a ' + mm(picco.mmMax) + ' mm a ' + picco.dove + '.';
    return tot;
  }
  function sceglie(g) {
    SEL = g; disegnaGiorni(); disegnaMappa(); disegnaTab();
    var x = G.filter(function (y) { return y.g === g; })[0];
    $('mappa-giorno').textContent = 'La valle ' + (g === OGGI ? 'oggi' : g === DOMANI ? 'domani' : nome(g, true)) + (x ? ': ' + (x.mm < 0.1 ? 'asciutto' : mm(x.mm) + ' mm in media') : '');
  }

  /* ── la mappa della valle ── */
  function disegnaMappa() {
    if (!window.L || !J) return;
    if (!mappa) {
      mappa = L.map('pz-mappa', { scrollWheelZoom: false, attributionControl: true, zoomSnap: 0.25 });
      $('pz-mappa').classList.add('et-' + ET);
      if (TUTTO) document.body.classList.add('tutto');
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 15, attribution: '© OpenStreetMap' }).addTo(mappa);
      /* il RILIEVO del sito (tessere TINITALY 1.1, INGV, CC BY 4.0): stessa ricetta della mappa boschi, pane sotto le
         tessere e tessere in «multiply». Qui si puo': sotto non c'e' la pioggia colorata (la regola del 24/9) */
      mappa.createPane('rilievo'); mappa.getPane('rilievo').style.zIndex = 190; mappa.getPane('tilePane').style.mixBlendMode = 'multiply';
      L.tileLayer(RILIEVO + '{z}/{x}/{y}.png', { pane: 'rilievo', minZoom: 5, maxNativeZoom: 13, maxZoom: 15, errorTileUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==',
        attribution: 'rilievo: TINITALY 1.1, INGV (CC BY 4.0)' }).addTo(mappa);
      mappa.fitBounds(L.latLngBounds(J.capoluoghi.map(function (c) { return [c.lat, c.lon]; })), { padding: [28, 40] });
      mappa.on('zoomend', sistemaEtichette);
      PLUV.forEach(function (p) {
        if (!p.lat) return;
        var ieri = RIPJ && RIPJ.posti && RIPJ.posti[p.id] ? RIPJ.posti[p.id] : null;
        L.marker([p.lat, p.lon], { icon: L.divIcon({ className: '', html: '<div class="pz-pl"></div>', iconSize: [0, 0] }) }).addTo(mappa)
          .bindPopup('<b>' + esc(p.n) + '</b><br>pluviometro ${ENTE}, ' + p.q + ' m' + (ieri ? '<br>ieri <b>' + mm(ieri[0]) + ' mm</b>, 7 giorni <b>' + mm(ieri[1]) + ' mm</b>' : '') + '<br><a href="' + p.url + '">La sua pagina →</a>');
      });
    }
    if (strato) mappa.removeLayer(strato);
    strato = L.layerGroup().addTo(mappa);
    J.capoluoghi.forEach(function (c) {
      var g = (c.giorni || []).filter(function (x) { return x.g === SEL; })[0]; if (!g) return;
      // l'icona del cielo c'e' SEMPRE, in tutti e due i modi (suo, 24/10: «l'icona del tempo l'hai tolta?»)
      var v = '<span class="ic">' + icona(g.s) + '</span>' + (MODO === 'mm' ? (g.mm >= 0.1 ? '<span class="v' + (g.mm >= 1 ? ' bagnato' : '') + '">' + mm(g.mm) + ' mm</span>' : '<span class="v asc">asciutto</span>')
        : '<span class="v"><span class="mn">' + g.mn + '°</span> <span class="mx">' + g.mx + '°</span></span>');
      // E ed F (24/10, suo «temperature sempre e anche il paese con lo sfondo bianco»): icona + temperature sempre,
      // i millimetri solo se piove; l'interruttore pioggia/temperature non serve
      if (TUTTO) v = '<span class="ic">' + icona(g.s) + '</span><span class="v"><span class="mn">' + g.mn + '°</span> <span class="mx">' + g.mx + '°</span></span>'
        + (g.mm >= 0.1 ? '<span class="v' + (g.mm >= 1 ? ' bagnato' : ' poco') + '" title="' + mm(g.mm) + ' mm di pioggia">' + (GOCCIA ? '💧' + mm(g.mm) : mm(g.mm) + ' mm') + '</span>' : '');
      L.marker([c.lat, c.lon], { icon: L.divIcon({ className: '', html: '<div class="pz-pt"><svg class="pz-ln"><line x1="0" y1="0" x2="0" y2="0"/></svg><i></i><span class="pz-et">' + v + '<span class="nm">' + esc(c.n) + '</span></span></div>', iconSize: [0, 0] }), zIndexOffset: 1000 })
        .addTo(strato).on('click', function () { apri({ n: c.n, lat: c.lat, lon: c.lon, quota: QUOTE[c.n], reg: REG }, SEL); });
    });
    sistemaEtichette();
  }
  /* i nomi sempre visibili: un'etichetta che ne tocca una gia' messa prova sotto, a destra, a sinistra, poi piu' lontano;
     il puntino resta sul paese, quindi si capisce sempre di chi e' */
  function sistemaEtichette() {
    var labs = [].slice.call(document.querySelectorAll('#pz-mappa .pz-et')), messi = [];
    var centro = function (l) { var r = l.parentNode.getBoundingClientRect(); return [r.left, r.top]; };
    labs.sort(function (a, b) { var pa = centro(a), pb = centro(b); return pa[1] - pb[1] || pa[0] - pb[0]; });
    var POSTI = [[-50, -112], [-50, 12], [8, -50], [-108, -50], [8, -112], [-108, -112], [8, 12], [-108, 12], [-50, -224], [-50, 124], [60, -50], [-160, -50], [60, -150], [-160, -150], [60, 50], [-160, 50], [-50, -336], [-50, 236], [8, -224], [-108, -224], [8, 124], [-108, 124], [110, -50], [-210, -50]];
    var bordo = $('pz-mappa').getBoundingClientRect();
    function coperto(r) {   // quanta area copre delle etichette gia' messe, piu' quanta ne esce dalla mappa (0 = posto libero)
      var fuori = Math.max(0, bordo.left + 4 - r.left) + Math.max(0, r.right - bordo.right + 4) + Math.max(0, bordo.top + 4 - r.top) + Math.max(0, r.bottom - bordo.bottom + 22);
      return fuori * 400 + messi.reduce(function (a, m) { var w = Math.min(r.right + 2, m.right) - Math.max(r.left - 2, m.left), h = Math.min(r.bottom + 2, m.bottom) - Math.max(r.top - 2, m.top); return a + (w > 0 && h > 0 ? w * h : 0); }, 0);
    }
    labs.forEach(function (l) {
      var meglio = null;
      for (var i = 0; i < POSTI.length; i++) {
        l.style.transform = 'translate(' + POSTI[i][0] + '%,' + POSTI[i][1] + '%)';
        var c = coperto(l.getBoundingClientRect());
        if (!meglio || c < meglio.c) meglio = { c: c, i: i };
        if (!c) break;
      }
      l.style.transform = 'translate(' + POSTI[meglio.i][0] + '%,' + POSTI[meglio.i][1] + '%)';
      var r = l.getBoundingClientRect(); messi.push(r);
      // la lineetta: dal puntino al bordo piu' vicino dell'etichetta, solo se l'etichetta si e' allontanata
      var o = l.parentNode.getBoundingClientRect(), ln = l.parentNode.querySelector('line');
      var x = Math.max(r.left, Math.min(o.left, r.right)) - o.left, y = Math.max(r.top, Math.min(o.top, r.bottom)) - o.top;
      var lungo = Math.sqrt(x * x + y * y) > 9;
      ln.setAttribute('x2', lungo ? x : 0); ln.setAttribute('y2', lungo ? y : 0);
    });
  }

  /* ── la tabella paese per paese ── */
  function disegnaTab() {
    if (!J) return;
    var date = G.map(function (x) { return x.g; });
    var righe = J.capoluoghi.slice().sort(function (a, b) { return (QUOTE[a.n] || 0) - (QUOTE[b.n] || 0); });
    $('tab').innerHTML = '<thead><tr><th>Paese</th>' + date.map(function (g) { return '<th class="' + (g === SEL ? 'col-sel' : '') + '">' + nome(g) + '</th>'; }).join('') + '</tr></thead><tbody>'
      + righe.map(function (c) {
        var per = {}; (c.giorni || []).forEach(function (g) { per[g.g] = g; });
        return '<tr data-n="' + esc(c.n) + '"><td>' + esc(c.n) + '<span class="q">~ ' + (QUOTE[c.n] != null ? QUOTE[c.n].toLocaleString('it-IT') : '–') + ' m</span></td>'
          + date.map(function (g) { var x = per[g], k = g === SEL ? ' class="col-sel"' : ''; if (!x) return '<td' + k + '>–</td>';
              return '<td' + k + '><span class="ic">' + icona(x.s) + '</span><br><span class="mn">' + x.mn + '°</span>/<span class="mx">' + x.mx + '°</span><span class="mm">' + (x.mm >= 0.1 ? mm(x.mm) + ' mm' : '') + '</span></td>'; }).join('') + '</tr>';
      }).join('') + '</tbody>';
  }

  /* ── la scheda del posto: 7 giorni e ore ── */
  var SCHEDA = null;
  function FASCIA(h) { return h < 6 ? 'notte' : h < 12 ? 'mattina' : h < 18 ? 'pomeriggio' : 'sera'; }
  function porte(x) {
    var pl = '&pl=' + (+x.lat).toFixed(4) + ',' + (+x.lon).toFixed(4) + '&pn=' + encodeURIComponent(x.n);
    return [['☀️', 'Sulla mappa', '/?r=' + x.reg + '&m=prev' + pl], ['💧', 'Pioggia caduta', '/?r=' + x.reg + '&g=7' + pl], ['📡', 'Radar adesso', '/?r=' + x.reg + '&radar=ora' + pl],
            ['🌡', 'Temperature', '/?r=' + x.reg + '&g=1&tq=1' + pl], ['🌲', 'Boschi', '/?r=' + x.reg + '&boschi=1' + pl], ['🛰', 'Satellite', '/?r=' + x.reg + '&boschi=1&sat=1' + pl]]
      .map(function (p) { return '<a href="' + SITO + p[2] + '"><span>' + p[0] + '</span>' + p[1] + '</a>'; }).join('');
  }
  function disegnaScheda(g) {
    var s = SCHEDA, j = s.j;
    var giorni = (j.giorni || []).filter(function (x) { return x.g >= OGGI; }).slice(0, 7);
    if (!giorni.some(function (x) { return x.g === g; })) g = giorni[0] && giorni[0].g;
    var ore = (j.ore || []).filter(function (o) { return o.g === g && (o.g !== OGGI || o.h >= new Date().getHours() || o.h6); });
    $('scheda').innerHTML = '<div class="testa"><div><h3>' + esc(s.x.n) + '</h3><div class="sub">' + (s.x.quota != null ? '~ ' + s.x.quota + ' m · ' : (s.j.q != null ? '~ ' + Math.round(s.j.q) + ' m · ' : '')) + 'previsioni ora per ora</div></div><button class="chiudi" aria-label="Chiudi">×</button></div>'
      + '<div class="giorni">' + giorni.map(function (x) { return '<button data-g="' + x.g + '" class="' + (x.g === g ? 'sel' : '') + '"><b>' + nome(x.g) + '</b>' + icona(x.s) + ' ' + x.mn + '°/' + x.mx + '°<br>' + (x.mm >= 0.1 ? mm(x.mm) + ' mm' : '–') + '</button>'; }).join('') + '</div>'
      + (ore.length ? '<div class="pz-ore' + (ore[0].h6 ? ' fasce' : '') + '">' + ore.map(function (o) {
          return '<div class="pz-ora"><div class="h">' + (o.h6 ? '<b>' + FASCIA(o.h) + '</b>' + o.h + '-' + ((o.h + 6) % 24) : String(o.h).padStart(2, '0') + ':00') + '</div><div class="ic">' + icona(o.s) + '</div><div class="t">' + Math.round(o.t) + '°</div>'
            + '<div class="mm">' + (o.mm >= 0.1 ? mm(o.mm) : '') + '</div><div class="v">' + (o.v != null ? Math.round(o.v) + ' km/h' : '') + '</div></div>'; }).join('') + '</div>'
        : '<p class="nota">Ore non disponibili per questo giorno.</p>')
      + '<div class="pz-porte">' + porte(s.x) + '</div>';
  }
  function apri(x, g) {
    var sc = $('scheda'); sc.classList.add('on');
    sc.innerHTML = '<p class="nota">Sto leggendo le previsioni di ' + esc(x.n) + '…</p>';
    sc.scrollIntoView({ behavior: 'smooth', block: 'start' });
    fetch(API + '?lat=' + (+x.lat).toFixed(3) + '&lon=' + (+x.lon).toFixed(3) + (x.quota != null ? '&q=' + x.quota : ''))
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { SCHEDA = { x: x, j: j }; disegnaScheda(OGGI); })   // sempre su OGGI, con le ore (suo, 24/10)
      .catch(function () { sc.innerHTML = '<p class="nota">Previsioni non disponibili ora, riprova fra poco.</p>'; });
  }
  $('scheda').addEventListener('click', function (e) {
    if (e.target.closest('.chiudi')) { $('scheda').classList.remove('on'); return; }
    var b = e.target.closest('.giorni button'); if (b && SCHEDA) disegnaScheda(b.getAttribute('data-g'));
  });

  /* ── la casella: elenco dei comuni del sito + frazioni dal geocoder ── */
  var ELENCO = null, ARRIVO = null;
  function carica() {
    if (ELENCO) return Promise.resolve(ELENCO);
    if (!ARRIVO) ARRIVO = fetch(SITO + '/data/elenco-paesi.txt').then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (t) {
      ELENCO = t.split('\\n').map(function (r) { var p = r.split('|'); return p.length < 6 ? null : { n: p[0], lat: +p[1], lon: +p[2], sg: p[3], reg: p[4], pop: +p[5] || 0, qn: norm(p[0]) }; }).filter(Boolean);
      return ELENCO;
    }).catch(function (e) { ARRIVO = null; throw e; });
    return ARRIVO;
  }
  function frazioni(t) {
    return fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(t) + '&count=8&language=it&countryCode=IT').then(function (r) { return r.json(); })
      .then(function (j) { return (j.results || []).map(function (x) { return { n: x.name, lat: x.latitude, lon: x.longitude, quota: x.elevation != null ? Math.round(x.elevation) : null, reg: REG, fraz: 'frazione · ' + (x.admin2 || x.admin1 || '').replace(/^Provincia (di )?/, ''), qn: norm(x.name) }; }); });
  }
  var righe = [], sel = -1, giro = 0;
  function mostra(t) {
    var qq = norm(t), drop = $('drop'); if (qq.length < 2) { drop.classList.remove('on'); return; }
    righe = (ELENCO || []).filter(function (x) { var i = x.qn.indexOf(qq); return i === 0 || (i > 0 && x.qn.charAt(i - 1) === ' '); })
      .sort(function (a, b) { return (b.reg === REG) - (a.reg === REG) || b.pop - a.pop; }).slice(0, 6);
    var mio = ++giro;
    function disegna() { drop.innerHTML = righe.length ? righe.map(function (x, i) { return '<div class="r" data-i="' + i + '"><span>' + esc(x.n) + '</span><small>' + (x.fraz || (x.sg + ' · ' + x.reg)) + '</small></div>'; }).join('') : '<div class="t">Cerco anche fra le frazioni…</div>'; drop.classList.add('on'); }
    disegna();
    if (righe.length < 6 && qq.length >= 3) setTimeout(function () {
      if (mio !== giro) return;
      frazioni(t.trim()).then(function (f) { if (mio !== giro) return; var visti = {}; righe.forEach(function (x) { visti[x.qn] = 1; });
        righe = righe.concat(f.filter(function (x) { return !visti[x.qn]; })).slice(0, 7); if (righe.length) disegna(); else drop.innerHTML = '<div class="t">Nessun posto con questo nome</div>'; });
    }, 350);
  }
  function scegli(x) { $('cerca').value = x.n; $('drop').classList.remove('on'); apri(x, SEL); }
  $('cerca').addEventListener('focus', function () { carica().catch(function () {}); });
  $('cerca').addEventListener('input', function () { var v = this.value; carica().catch(function () {}).then(function () { mostra(v); }); });
  $('cerca').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); if (righe.length) scegli(righe[sel >= 0 ? sel : 0]); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); var rs = $('drop').querySelectorAll('.r'); if (!rs.length) return; sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + rs.length) % rs.length; for (var i = 0; i < rs.length; i++) rs[i].classList.toggle('sel', i === sel); }
  });
  $('drop').addEventListener('click', function (e) { var r = e.target.closest('.r'); if (r) scegli(righe[+r.getAttribute('data-i')]); });
  document.addEventListener('click', function (e) { if (!e.target.closest('.pz-cerca')) $('drop').classList.remove('on'); });

  /* ── il grafico, la pioggia caduta, il punto ── */
  var BARRE = [];
  function disegnaGraf() {
    var serie = RIPJ && RIPJ.serie ? RIPJ.serie.slice(0, 30).reverse() : [];
    BARRE = serie.map(function (v, i) { return { g: piu(RIPJ.ultimoGiorno, i - serie.length + 1), mm: v, prev: false }; })
      .concat(G.map(function (x) { return { g: x.g, mm: x.mm, prev: true, mx: x.mmMax, dove: x.dove }; }));
    var mx = Math.max(5, Math.max.apply(null, BARRE.map(function (b) { return b.mm; })));
    $('graf').innerHTML = BARRE.map(function (b, i) { return '<div class="b' + (b.prev ? ' prev' : '') + '" data-i="' + i + '" style="height:' + (b.mm / mx * 100) + '%"></div>'; }).join('');
    if (RIPJ) $('leg-date').textContent = 'dal ' + d(BARRE[0].g).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) + ' a ' + nome(G[G.length - 1].g, true);
  }
  $('graf').addEventListener('click', function (e) {
    var el = e.target.closest('.b'); if (!el) return;
    var b = BARRE[+el.getAttribute('data-i')], tutte = $('graf').querySelectorAll('.b');
    for (var i = 0; i < tutte.length; i++) tutte[i].classList.toggle('sel', tutte[i] === el);
    var giorno = d(b.g).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
    $('graf-info').innerHTML = b.prev ? '<b>' + giorno + '</b>: previsti in media <b>' + mm(b.mm) + ' mm</b>' + (b.mx >= 0.1 ? ', fino a ' + mm(b.mx) + ' a ' + b.dove : '')
      : '<b>' + giorno + '</b>: misurati in media <b>' + mm(b.mm) + ' mm</b> dai pluviometri della valle';
    if (b.prev) sceglie(b.g);
  });
  function disegnaCaduta() {
    if (!RIPJ) { $('r1').textContent = '–'; $('r7').textContent = '–'; return; }
    var link = {}; PLUV.forEach(function (p) { link[p.n] = p.url; });
    [['1', 'r1'], ['7', 'r7']].forEach(function (p) {
      var x = RIPJ.periodi[p[0]]; $(p[1]).innerHTML = mm(x.media) + ' <small>mm di media</small>';
      $(p[1] + 't').innerHTML = (x.top || []).slice(0, 3).map(function (t) { return '<div class="nota" style="margin:2px 0">' + (link[t.n] ? '<a href="' + link[t.n] + '">' + esc(t.n) + '</a>' : esc(t.n)) + ': <b>' + mm(t.mm) + ' mm</b></div>'; }).join('');
    });
  }
  function punto(tot) {
    var p = [];
    if (RIPJ) {
      var i = RIPJ.periodi['1'], s = RIPJ.periodi['7'];
      p.push((RIPJ.ultimoGiorno === IERI ? 'Ieri' : nome(RIPJ.ultimoGiorno, true).replace(/^./, function (c) { return c.toUpperCase(); })) + ' in ${NOME} ' + (i.media < 0.1 ? '<b>non è piovuto</b>'
        : 'sono caduti in media <b>' + mm(i.media) + ' mm</b> (' + i.top[0].n + ' ' + mm(i.top[0].mm) + ')') + '; negli ultimi 7 giorni <b>' + mm(s.media) + ' mm</b>.');
    }
    var picco = G.slice().sort(function (a, b) { return b.mmMax - a.mmMax; })[0];
    p.push(tot < 0.5 ? 'Nei prossimi 7 giorni <b>non è prevista pioggia</b>.' : 'Nei prossimi 7 giorni sono previsti in media <b>' + mm(tot) + ' mm</b>, soprattutto ' + nome(picco.g, true) + '.');
    var fr = G.slice().sort(function (a, b) { return a.mn - b.mn; })[0], cal = G.slice().sort(function (a, b) { return b.mx - a.mx; })[0];
    p.push('La notte più fredda è ' + nome(fr.g, true) + ', con <b>' + fr.mn + '°</b> a ' + fr.dmn + '; il giorno più caldo ' + nome(cal.g, true) + ', <b>' + cal.mx + '°</b> a ' + cal.dmx + '.');
    $('punto').innerHTML = '<span class="pz-quando">Il punto di stamattina</span>' + p.join(' ');
  }

  /* ── i comandi ── */
  $('giorni').addEventListener('click', function (e) { var b = e.target.closest('.pz-g'); if (b) sceglie(b.getAttribute('data-g')); });
  $('sw-mm').addEventListener('click', function () { MODO = 'mm'; this.classList.add('on'); $('sw-t').classList.remove('on'); disegnaMappa(); });
  $('sw-t').addEventListener('click', function () { MODO = 't'; this.classList.add('on'); $('sw-mm').classList.remove('on'); disegnaMappa(); });
  $('tab').addEventListener('click', function (e) {
    var tr = e.target.closest('tbody tr'); if (!tr || !J) return;
    var c = J.capoluoghi.filter(function (x) { return x.n === tr.getAttribute('data-n'); })[0];
    if (c) apri({ n: c.n, lat: c.lat, lon: c.lon, quota: QUOTE[c.n], reg: REG }, SEL);
  });

  Promise.all([fetch(API + '?zona=${SLUG}').then(function (r) { return r.json(); }),
               fetch(RIP).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; })]).then(function (x) {
    J = x[0]; RIPJ = x[1]; G = giorniDi(J);
    var tot = totale(); disegnaGraf(); disegnaCaduta(); punto(tot); sceglie(G[0].g);
  }).catch(function (e) { $('punto').textContent = 'Previsioni non disponibili: ' + e.message; });
})();
</script>
</body>
</html>`;
  const out = path.join(__dirname, SLUG);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), html, 'utf8');
  console.log('scritta', path.join(out, 'index.html'), '| pluviometri:', pluv.map(p => p.n + (p.lat ? '' : ' SENZA POSIZIONE')).join(', '));
})();
