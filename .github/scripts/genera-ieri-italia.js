#!/usr/bin/env node
/**
 * La pagina «Ieri in Italia» (/ieri-in-italia/): la classifica MISURATA di ieri, una pagina sola.
 *
 * PERCHE' ESISTE (21/11/2026, scheda 142, mockup `claudio\mockup-ieri-italia\` approvato col suo «Va bene, facciamola»).
 * Nella ricerca sui grandi del meteo (analisi-142\RESOCONTO.md) ilMeteo ha /meteo-record, le citta' piu' calde, fredde e
 * piovose, ma fatta con le PREVISIONI. Qui sono i valori dei pluviometri e dei termometri delle reti regionali, gli
 * stessi della mappa. E' anche la sua idea «Top 10 zone piu' piovose» del 15/8, allargata all'Italia e alle temperature.
 *
 * COSA C'E': il riquadro blu coi tre primati e i bottoni verso la mappa (come le pagine storico), le tre classifiche dei
 * primi 10 (pioggia, notte piu' fredda, giorno piu' caldo; ogni riga apre la mappa di ieri sul pluviometro), la pioggia
 * regione per regione (ogni riga apre la mappa di ieri della regione), i 20 link alle pagine regione con radar e storico.
 * Niente link alle pagine funghi: piogge e funghi non si mescolano (CLAUDE-pagine.md, «Le due categorie di pagine»).
 *
 * ⚠️ I VALORI FALSI NON ENTRANO, e in testa alla classifica ci finirebbero proprio loro:
 *  - pioggia: un pluviometro entra solo se un vicino entro 25 km ne ha almeno un quarto. Il 20/11/2026 in testa sarebbe
 *    andato Fluminimannu a Decimomannu (meteohub-sardegna) con 52,8 mm in un'ora sola e tutti i vicini a 0;
 *  - temperature: due numeri diversi, non 0/0, escursione fino a 25 gradi, fra -30 e 45; una minima sotto zero solo se un
 *    termometro entro 25 km ha la minima a 3 gradi o meno (la regola «certa» delle gelate del 3/10/2026); una massima
 *    solo se un termometro entro 25 km arriva a 5 gradi da lei;
 *  - un posto per volta: chi sta a meno di 10 km da uno gia' in classifica non entra (se no dieci pluviometri della
 *    stessa valle).
 * Gli esclusi della mappa (lib-escluse) non contano.
 *
 * IERI e' il giorno che dicono i riepiloghi della maggior parte delle regioni (data/riepiloghi/<regione>.json, «ultimo»
 * del periodo di 1 giorno): cosi' la pagina dice lo stesso «ieri» delle pagine regione.
 *
 * Uso: node .github/scripts/genera-ieri-italia.js   Gira nel giro del mattino (pagine-regione.yml), dopo lo storico.
 * Nessuna rete, nessuna fonte: solo i file del repo.
 */
const fs = require('fs');
const path = require('path');
const { REGIONI, ESTERE, SITO, GA_ID, CANALE, scrivi, briciolaJson, briciolaHtml, BRIC_CSS, STILE_BASE, STILE_IERI,
  IERI_GRANDE, navAltre } = require('./genera-pagine-regione.js');
const { STILE_NUOVO, RILIEVO } = require('./lib-pagina-funghi.js');
const { METEO_CSS } = require('./lib-meteo-regione.js');
const { TESTATA_CSS, testata } = require('./lib-testata.js');
const { senzaCommenti } = require('./lib-senza-commenti.js');
const { leggi, oggiItalia, giorniIndietro } = require('./lib-giorni.js');
const { escluse, escluso } = require('./lib-escluse.js');

const RADICE = path.join(__dirname, '..', '..');
const LISTA = REGIONI.filter(r => !ESTERE.includes(r.k));   // le 20 regioni italiane
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const num = (x, k = 1) => Number(x).toLocaleString('it-IT', { minimumFractionDigits: k, maximumFractionDigits: k });
const attr = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const km = (a, b) => Math.hypot((a.lat - b.lat) * 111, (a.lon - b.lon) * 111 * Math.cos(a.lat * Math.PI / 180));
// i nomi tutti maiuscoli di alcune reti («PASSO DEL MORO») in minuscolo con le iniziali grandi
const nome = t => t === t.toUpperCase() ? t.toLowerCase().replace(/(^|[\s'’(-])([a-zà-ü])/g, (m, a, c) => a + c.toUpperCase()) : t;

// ieri: il giorno piu' frequente fra gli «ultimo» dei riepiloghi delle regioni; se mancano tutti, ieri
function ieri() {
  const conta = {};
  for (const r of LISTA) {
    try { const u = JSON.parse(fs.readFileSync(path.join(RADICE, 'data', 'riepiloghi', r.k + '.json'), 'utf8')).periodi['1'].ultimo; if (u) conta[u] = (conta[u] || 0) + 1; } catch (e) {}
  }
  const g = Object.entries(conta).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? 1 : -1))[0];
  return g ? g[0] : giorniIndietro(oggiItalia(), 1)[0];
}

function calcola(G) {
  const ESC = escluse(RADICE);
  const tutte = [], medie = [];
  for (const r of LISTA) {
    let somma = 0, n = 0;
    for (const dir of r.dirs) for (const s of leggi(dir, G) || []) {
      if (escluso(ESC, r.k, [s.id, s.n])) continue;
      tutte.push({ reg: r.k, nomeReg: r.nome, n: s.n, p: s.p && /^[A-Z]{2}$/.test(s.p) ? s.p : null, q: s.q, lat: s.lat, lon: s.lon, mm: s.mm, t: s.t });
      if (s.mm != null) { somma += s.mm; n++; }
    }
    if (n) medie.push({ k: r.k, nome: r.nome, media: somma / n, n });
  }
  const tOk = s => Array.isArray(s.t) && s.t.length === 2 && s.t.every(v => typeof v === 'number') && !(s.t[0] === 0 && s.t[1] === 0)
    && s.t[0] < s.t[1] && s.t[1] - s.t[0] <= 25 && s.t[0] >= -30 && s.t[1] <= 45;
  const conT = tutte.filter(tOk);
  const confermaFreddo = s => s.t[0] >= 0 || conT.some(v => v !== s && km(s, v) <= 25 && v.t[0] <= 3);
  const confermaCaldo = s => conT.some(v => v !== s && km(s, v) <= 25 && v.t[1] >= s.t[1] - 5);
  const confermaPioggia = s => tutte.some(v => v !== s && v.mm != null && km(s, v) <= 25 && v.mm >= s.mm / 4);
  const top = (lista, val, n = 10) => {
    const out = [];
    for (const s of lista.sort((a, b) => val(b) - val(a))) { if (out.some(o => km(o, s) < 10)) continue; out.push(s); if (out.length === n) break; }
    return out;
  };
  const conPioggia = tutte.filter(s => s.mm != null);
  return {
    pioggia: top(tutte.filter(s => s.mm != null && s.mm > 0 && confermaPioggia(s)), s => s.mm),
    fredde: top(conT.filter(confermaFreddo), s => -s.t[0]),
    calde: top(conT.filter(confermaCaldo), s => s.t[1]),
    pluviometri: conPioggia.length, termometri: conT.length, bagnate: conPioggia.filter(s => s.mm >= 1).length,
    regioni: medie.sort((a, b) => b.media - a.media || a.nome.localeCompare(b.nome, 'it')),
  };
}

const CSS = `
.ii-tre{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0 4px}
.ii-tre a,.ii-tre div.ii-c{display:block;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:10px 12px;color:#fff;text-decoration:none}
.ii-tre .e{font-size:13px;font-weight:600;opacity:.85}.ii-tre .v{font-size:30px;font-weight:800;line-height:1.15;margin:2px 0}
.ii-tre .p{font-size:14px;line-height:1.3}
.ii-lista{list-style:none;margin:8px 0 4px;padding:0;border:1px solid var(--bordo);border-radius:12px;overflow:hidden;background:#fff}
.ii-lista li+li{border-top:1px solid var(--bordo)}
.ii-lista a{display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:10px;padding:9px 12px;color:inherit;text-decoration:none}
.ii-lista a:hover{background:#f4f8fc}
.ii-n{font-weight:800;color:#5a7192;text-align:center}.ii-l b{display:block;font-weight:700;color:var(--blu)}.ii-l small{color:#5a7192;font-size:13.5px}
.ii-v{font-weight:800;font-size:19px;white-space:nowrap}
.ii-v.piog{color:#1f5fd1}.ii-v.fredd{color:#1a6fb0}.ii-v.cald{color:#c2410c}
.ii-reg{display:grid;gap:7px;margin:10px 0 4px}
.ii-reg a{display:grid;color:inherit;text-decoration:none;grid-template-columns:118px 1fr 64px;align-items:center;gap:10px}
.ii-reg span:first-child{font-weight:700}.ii-reg .b{height:18px;background:#eef3f8;border-radius:5px;overflow:hidden}
.ii-reg .b i{display:block;height:100%;background:#2f74e8;border-radius:5px}.ii-reg span:last-child{text-align:right;font-weight:700;color:var(--blu);white-space:nowrap}
.st-grande{display:block;width:100%;height:auto;border-radius:12px;border:1px solid #c9d6e6;box-shadow:0 2px 10px rgba(15,61,110,.10)}
.st-scala{margin:10px 0 6px}.st-scala b{display:block;font-size:13.5px;font-weight:600;color:#5a7192;margin-bottom:4px}
.st-scala .g{height:14px;border-radius:4px;border:1px solid var(--bordo);background:linear-gradient(to right,#ffffff 0%,#ffffff 2%,#e4f1fd 5%,#badcfa 12%,#6496f0 15%,#326edc 20%,#00b4c8 28%,#00b450 35%,#008c28 42%,#78c800 49%,#dce600 55%,#ffb400 61%,#ff7800 67%,#f03200 73%,#b40000 79%,#8c00b4 85%,#c864dc 90%,#f0aaf0 95%,#ffdcff 100%)}
.st-scala .l{display:flex;justify-content:space-between;font-size:13px;font-weight:600;color:#5a7192;margin-top:3px}
.ii-mm{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:10px 0 4px}
.ii-mm .c{border:1px solid var(--bordo);border-radius:12px;background:#fff;overflow:hidden}
.ii-mm .c>a.f{display:block}.ii-mm img{display:block;width:100%;height:auto;aspect-ratio:1600/1330;object-fit:cover;background:#eef3f8}
.ii-mm .t{padding:7px 10px 8px}.ii-mm .t .r{display:flex;align-items:center;justify-content:space-between;margin-top:2px}
.ii-mm .t a.n{display:block;font-weight:700;color:var(--blu);line-height:1.25}.ii-mm .t small{color:#5a7192;font-weight:700;white-space:nowrap}
.ii-mm .t .r span{white-space:nowrap;flex-shrink:0}.ii-mm .t span a{text-decoration:none;font-size:18px;margin-left:8px}
@media(max-width:600px){.ii-tre{grid-template-columns:1fr;gap:8px}.ii-tre .v{font-size:26px}
.ii-reg a{grid-template-columns:104px 1fr 62px;gap:8px}.ii-reg span{font-size:15px}
.ii-mm{grid-template-columns:1fr 1fr;gap:8px}.ii-mm .t{padding:6px 8px}.ii-mm .t a.n{font-size:14.5px}.ii-mm .t span a{font-size:16px;margin-left:5px}}
`;
/* ⚠️ LE MAPPE SONO LE FOTO DI IERI DELLE PAGINE REGIONE (21/11/2026, suo «mettiamoci una mappa, è la nostra cosa bella e
   colorata», poi «tutte e due»): <regione>-ieri.webp del ramo `anteprime`, che il giro delle anteprime rifà ogni mattina.
   In alto la mappa grande della regione dove e' piovuto di piu' in media, in fondo una mini mappa per regione. Nessuna
   foto nuova da scattare; se una manca, il suo riquadro sparisce (onerror). La scala e' quella della mappa (STOPS).
   Le mini mappe sono 20: 4 colonne al PC e 2 al telefono, cosi' l'ultima fila e' sempre piena (simmetria). */
const ANTEPRIME = 'https://raw.githubusercontent.com/AvventureMicologiche/Mappa-Precipitazioni-Nord/anteprime';
const SCALA = `<div class="st-scala"><b>Millimetri caduti ieri</b><div class="g"></div><div class="l"><span>0</span><span>20</span><span>60</span><span>125</span><span>200</span><span>300+</span></div></div>`;

function pagina(G, C) {
  const d = new Date(G + 'T12:00:00Z');
  const dataLunga = `${GIORNI[d.getUTCDay()]} ${+G.slice(8)} ${MESI[+G.slice(5, 7) - 1]}`;
  const Maiusc = dataLunga[0].toUpperCase() + dataLunga.slice(1);
  const ga = da => `onclick="try{gtag('event','apri_mappa',{da:'ieri-italia-${da}'})}catch(e){}"`;
  const lab = s => `${attr(nome(s.n))}${s.p ? ` (${s.p})` : ''}`;
  const mappa = s => `${SITO}/?r=${s.reg}&amp;da=${G}&amp;a=${G}&amp;pl=${s.lat},${s.lon}&amp;pn=${encodeURIComponent(nome(s.n))}&amp;s=p`;
  const lista = (L, f, cl, da) => `<ol class="ii-lista">${L.map((s, i) => `<li><a href="${mappa(s)}" ${ga(da)}><span class="ii-n">${i + 1}</span>`
    + `<span class="ii-l"><b>${lab(s)}</b><small>${s.nomeReg}${s.q ? ` · ${num(s.q, 0)} m` : ''}</small></span><span class="ii-v ${cl}">${f(s)}</span></a></li>`).join('')}</ol>`;
  const reg0 = (C.regioni[0] || { k: 'toscana' }).k;   // la regione dove e' piovuto di piu': da li' partono i bottoni
  const carta = (s, e, v, da) => s ? `<a href="${mappa(s)}" ${ga(da)}><div class="e">${e}</div><div class="v">${v}</div><div class="p">${lab(s)}</div></a>`
    : `<div class="ii-c"><div class="e">${e}</div><div class="v">—</div><div class="p">nessun dato certo</div></div>`;
  const p0 = C.pioggia[0], f0 = C.fredde[0], c0 = C.calde[0];
  const maxR = Math.max(0.1, ...C.regioni.map(r => r.media));
  const media = Object.fromEntries(C.regioni.map(r => [r.k, r.media]));
  const nascondi = `onerror="this.closest('a').style.display='none'"`;
  const prepNome = k => { const r = REGIONI.find(x => x.k === k); return `${r.prep || 'in'} ${r.nome}`; };
  const titolo = 'Ieri in Italia: dove ha piovuto di più, la notte più fredda, il giorno più caldo';
  const descr = `La classifica di ${dataLunga}, misurata: i 10 posti più piovosi d'Italia, la notte più fredda e il giorno più caldo, dai pluviometri e dai termometri delle reti regionali.`;
  const BRICIOLA = [['Mappa pluviometrica', SITO + '/'], ['Ieri in Italia', null]];
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${attr(titolo)}</title>
<meta name="description" content="${attr(descr)}">
<link rel="canonical" href="${SITO}/ieri-in-italia/">
${briciolaJson(BRICIOLA)}
<meta property="og:title" content="${attr(titolo)}">
<meta property="og:description" content="${attr(descr)}">
<meta property="og:url" content="${SITO}/ieri-in-italia/">
<meta property="og:type" content="website">
<!-- Google tag: il config solo sul dominio vero, come nelle pagine regione -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  if (/(^|\\.)avventuremicologiche\\.it$/.test(location.hostname)) {
    gtag('config', '${GA_ID}');
  }
</script>
<style>
${STILE_BASE}
${STILE_NUOVO}
${STILE_IERI}
${RILIEVO}${IERI_GRANDE}${METEO_CSS}${BRIC_CSS}${TESTATA_CSS}${CSS}</style>
</head>
<body>
${testata({ sito: SITO, canale: CANALE, reg: reg0, ga: 'ieri-italia', attiva: 'storico' })}
<main data-fine="${G}">
${briciolaHtml(BRICIOLA)}
<h1>${attr(titolo)}</h1>
<p class="sotto"><b>La classifica di ${dataLunga}, misurata</b>: ${num(C.pluviometri, 0)} pluviometri e ${num(C.termometri, 0)} termometri delle reti regionali, gli stessi della mappa. Si aggiorna ogni mattina.</p>
<div class="verdetto"><div class="si">${Maiusc}</div>
<div class="ii-tre">
${carta(p0, '💧 Più pioggia', p0 ? num(p0.mm) + ' mm' : '', 'primato-pioggia')}
${carta(f0, '🥶 Notte più fredda', f0 ? num(f0.t[0]) + '°' : '', 'primato-freddo')}
${carta(c0, '☀️ Giorno più caldo', c0 ? num(c0.t[1]) + '°' : '', 'primato-caldo')}
</div>
<div class="dett">Ha piovuto almeno 1 mm in ${num(C.bagnate, 0)} pluviometri su ${num(C.pluviometri, 0)}.</div>
<div class="capo-btns"><a class="ieri-btn" href="${SITO}/?r=${reg0}&amp;da=${G}&amp;a=${G}&amp;s=p" ${ga('riquadro')}><b>Apri la mappa di ieri</b><i>→</i><small>la pioggia di ogni pluviometro, regione per regione</small></a></div>
<div class="mk-porte"><a href="${SITO}/previsioni/" ${ga('porta-previsioni')}><span>☀️</span>Previsioni</a><a href="${SITO}/${reg0}/adesso/" ${ga('porta-radar')}><span>📡</span>Radar piogge</a>
<a href="${SITO}/?r=${reg0}&amp;boschi=1" ${ga('porta-boschi')}><span>🌲</span>Mappa boschi</a><a href="${SITO}/${reg0}/storico/" ${ga('porta-storico')}><span>📅</span>Storico piogge</a></div></div>
${C.regioni[0] ? `<h2>La mappa di ieri: ${C.regioni[0].nome}</h2>
<a href="${SITO}/?r=${reg0}&amp;da=${G}&amp;a=${G}&amp;s=p" ${ga('mappa-grande')}><img class="st-grande" src="${ANTEPRIME}/${reg0}-ieri.webp" ${nascondi} alt="La pioggia di ieri ${attr(prepNome(reg0))}, pluviometro per pluviometro" width="1600" height="1330"></a>
${SCALA}
<p class="nota">La regione dove ieri ha piovuto di più in media (${num(C.regioni[0].media)} mm): toccala per aprire la mappa vera e guardare ogni pluviometro.</p>` : ''}
<h2>Dove ha piovuto di più</h2>
${C.pioggia.length ? lista(C.pioggia, s => `${num(s.mm)} mm`, 'piog', 'pioggia') : '<p>Ieri non ha piovuto in nessun pluviometro.</p>'}
<p class="nota">Un posto per volta: un pluviometro a meno di 10 km da uno già in classifica non entra. Ogni riga apre la mappa di ieri su quel pluviometro.</p>
<h2>La notte più fredda</h2>
${lista(C.fredde, s => `${num(s.t[0])}°`, 'fredd', 'freddo')}
<h2>Il giorno più caldo</h2>
${lista(C.calde, s => `${num(s.t[1])}°`, 'cald', 'caldo')}
<p class="nota">Una minima sotto zero entra solo se un termometro vicino, entro 25 km, conferma il freddo della notte; i termometri con valori impossibili sono scartati. Anche la pioggia deve trovare conferma in un pluviometro vicino.</p>
<h2>La pioggia di ieri regione per regione</h2>
<div class="ii-reg">${C.regioni.map(r => `<a href="${SITO}/?r=${r.k}&amp;da=${G}&amp;a=${G}&amp;s=p" ${ga('regione')}><span>${r.nome}</span><span class="b"><i style="width:${Math.max(2, Math.round(r.media / maxR * 100))}%"></i></span><span>${num(r.media)} mm</span></a>`).join('')}</div>
<p class="nota">Media dei pluviometri di ogni regione. Ogni riga apre la mappa di ieri di quella regione.</p>
<h2>Regione per regione</h2>
<p>Per ogni regione: la pioggia di ieri e degli ultimi 30 giorni zona per zona, il radar e lo storico mese per mese.</p>
<div class="ii-mm">${LISTA.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'it')).map(r => `<div class="c"><a class="f" href="${SITO}/?r=${r.k}&amp;da=${G}&amp;a=${G}&amp;s=p" ${ga('mini-mappa')}><img src="${ANTEPRIME}/${r.k}-ieri.webp" ${nascondi} loading="lazy" alt="La pioggia di ieri ${attr(prepNome(r.k))}" width="1600" height="1330"></a>`
  + `<div class="t"><a class="n" href="${SITO}/${r.k}/">${r.nome}</a><div class="r"><small>${media[r.k] != null ? num(media[r.k]) + ' mm' : ''}</small><span><a href="${SITO}/${r.k}/adesso/" title="Radar ${attr(r.nome)}">📡</a><a href="${SITO}/${r.k}/storico/" title="Storico ${attr(r.nome)}">📅</a></span></div></div></div>`).join('')}</div>
${SCALA}
<p class="nota">Ogni mappa apre la pioggia di ieri della regione; il nome porta alla sua pagina con le zone, 📡 al radar, 📅 allo storico mese per mese.</p>
</main>

<footer>
${navAltre('piogge')}
  Dati: le reti regionali dei pluviometri ·
  <a href="${SITO}/fonti">tutte le fonti e licenze</a> ·
  <a href="https://avventuremicologiche.it">Avventure Micologiche</a><br>
  La mappa copre Italia, Svizzera, Austria, Francia e Slovenia — 5000+ stazioni.
</footer>
</body>
</html>
`;
}

if (require.main === module) {
  const G = process.env.GIORNO || ieri();
  const C = calcola(G);
  if (!C.pluviometri) { console.log(`Ieri in Italia: nessun file del ${G}, pagina non toccata.`); process.exit(0); }
  scrivi(path.join(RADICE, 'ieri-in-italia', 'index.html'), senzaCommenti(pagina(G, C)), true);
  console.log(`Ieri in Italia ${G}: ${C.pluviometri} pluviometri, ${C.termometri} termometri; ` +
    `${C.pioggia[0] ? nome(C.pioggia[0].n) + ' ' + C.pioggia[0].mm + ' mm' : 'niente pioggia'}, ` +
    `${C.fredde[0] ? nome(C.fredde[0].n) + ' ' + C.fredde[0].t[0] + '°' : '-'}, ${C.calde[0] ? nome(C.calde[0].n) + ' ' + C.calde[0].t[1] + '°' : '-'}`);
}

module.exports = { calcola, pagina, ieri };
