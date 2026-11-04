// Gli ultimi video del canale YouTube «Avventure Micologiche» (4/11/2026, scheda 119, suo «automatico vai»): li usano la
// cassetta dei video (l'icona YouTube in alto col pallino) e il giro della pillola al telefono, cosi' un video nuovo
// entra da solo, senza toccare data/vetrina.json.
//
//   /api/canale  →  { video: [{ id, titolo, uscita, short }], letto: "2026-11-04T14:00:00.000Z" }   (i 10 piu' recenti)
//
// Fonte: il FEED PUBBLICO del canale (lo stesso degli aggregatori: niente chiave, niente quota). Cache API di Cloudflare:
// un'ora fresca, quindi al massimo UNA richiesta a YouTube all'ora per nodo; se YouTube non risponde o manda altro, si
// serve l'ultima lettura buona (riserva di 7 giorni), e la cassetta non resta mai vuota per un intoppo suo.

const FEED = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCBAul56IRwckppf-skNqVlA';
const UA = 'precipitazioni.avventuremicologiche.it (avventuremicologiche@gmail.com)';
const VERSIONE = 1;                       // alzare quando cambia la forma della risposta: la cache vecchia non si rilegge
const FRESCA_S = 3600, RISERVA_S = 7 * 86400, TEMPO_MS = 6000, QUANTI = 10;
const ORIGINI = /^https?:\/\/(precipitazioni\.avventuremicologiche\.it|avventurepluvio(-test)?\.pages\.dev|localhost(:\d+)?|127\.0\.0\.1(:\d+)?)$/;

export async function onRequestGet({ request, waitUntil }) {
  const cors = intestazioni(request);
  const cache = caches.default;
  const fresca = new Request(`https://cache.canale/ultimi?v=${VERSIONE}`);
  const riserva = new Request(`https://cache.canale/riserva?v=${VERSIONE}`);
  try {
    const c = await cache.match(fresca);
    if (c) return rispondi(await c.text(), cors, 200, 600);
    let dati = null;
    try {
      const r = await fetch(FEED, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(TEMPO_MS) });
      if (r.ok) dati = leggiFeed(await r.text());
    } catch (e) { dati = null; }
    if (dati && dati.video.length) {
      const testo = JSON.stringify(dati);
      const salva = Promise.all([
        cache.put(fresca, new Response(testo, { headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${FRESCA_S}` } })),
        cache.put(riserva, new Response(testo, { headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${RISERVA_S}` } })),
      ]);
      if (typeof waitUntil === 'function') waitUntil(salva); else await salva;
      return rispondi(testo, cors, 200, 600);
    }
    // YouTube giu' o feed strano: l'ultima lettura buona, tenuta poco nel browser cosi' si riprova presto
    const r2 = await cache.match(riserva);
    if (r2) return rispondi(await r2.text(), cors, 200, 300);
    return rispondi(JSON.stringify({ errore: 'feed del canale non raggiungibile', video: [] }), cors, 502);
  } catch (e) {
    return rispondi(JSON.stringify({ errore: String(e && e.message || e), video: [] }), cors, 502);
  }
}

export async function onRequestOptions({ request }) { return new Response(null, { status: 204, headers: intestazioni(request) }); }

// Il feed e' Atom: un <entry> per video, col suo <yt:videoId>, <title>, <published> e il link, che per gli Short e'
// youtube.com/shorts/<id>. Si tiene solo quello che serve; i titoli restano quelli veri (li ripulisce la pagina).
export function leggiFeed(xml) {
  const dec = s => String(s || '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n)).replace(/&amp;/g, '&');
  const video = [];
  for (const m of String(xml || '').matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const e = m[1];
    const id = (e.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/) || [])[1];
    const titolo = dec((e.match(/<title>([\s\S]*?)<\/title>/) || [])[1]).trim();
    const uscita = (e.match(/<published>([^<]+)<\/published>/) || [])[1];
    if (!id || !titolo || !uscita || isNaN(Date.parse(uscita))) continue;
    video.push({ id, titolo, uscita, short: /youtube\.com\/shorts\//.test(e) });
  }
  video.sort((a, b) => Date.parse(b.uscita) - Date.parse(a.uscita));
  return { video: video.slice(0, QUANTI), letto: new Date().toISOString() };
}

function intestazioni(request) {
  const o = request.headers.get('Origin') || '';
  const h = { 'Content-Type': 'application/json; charset=utf-8', 'Vary': 'Origin' };
  if (ORIGINI.test(o)) { h['Access-Control-Allow-Origin'] = o; h['Access-Control-Allow-Methods'] = 'GET'; }
  return h;
}
function rispondi(testo, h, status = 200, maxAge = 0) {
  const hh = { ...h };
  hh['Cache-Control'] = status === 200 && maxAge > 0 ? `public, max-age=${maxAge}` : 'no-store';
  return new Response(testo, { status, headers: hh });
}
