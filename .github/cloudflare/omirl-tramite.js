// omirl-tramite (23/10/2026): OMIRL (ARPA Liguria) dal 22/10 sera non risponde piu' ai runner
// di GitHub (timeout gia' sulla lista stazioni), mentre dal PC e da Cloudflare risponde in 0,3 s.
// Il collector della Liguria su GitHub chiede i dati a questo worker, che li gira a OMIRL.
// Passa SOLO le GET sotto /Omirl/rest/ e solo con l'intestazione X-Chiave uguale al segreto
// CHIAVE: non e' un passaggio aperto per chiunque. Copia in repo: .github/cloudflare/omirl-tramite.js
const OMIRL = 'https://omirl.regione.liguria.it';

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method !== 'GET' || !url.pathname.startsWith('/Omirl/rest/')) return new Response('no', { status: 404 });
    if (!env.CHIAVE || req.headers.get('X-Chiave') !== env.CHIAVE) return new Response('no', { status: 403 });
    try {
      const r = await fetch(OMIRL + url.pathname + url.search, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(20000),
      });
      return new Response(r.body, { status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'application/json' } });
    } catch (e) {
      // 504 = OMIRL non ha risposto nemmeno a Cloudflare: il collector lo tratta come un timeout
      return new Response('OMIRL non risponde: ' + e, { status: 504 });
    }
  }
};
