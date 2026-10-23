// omirl-tramite (23/10/2026): OMIRL (ARPA Liguria) dal 22/10 sera non risponde piu' ai runner di GitHub, e
// risponde a Cloudflare SOLO dai centri dati italiani: misurato il 23/10, Roma (FCO) e Milano si', Marsiglia (MRS)
// e Minneapolis (MSP) no, con la connessione che resta appesa. Chiamato da GitHub il worker girava negli Stati
// Uniti, quindi il wrangler.toml lo FISSA vicino a Milano ([placement] region = "aws:eu-south-1"), da chiunque
// arrivi la richiesta. Passa SOLO le GET sotto /Omirl/rest/ e solo con l'intestazione X-Chiave uguale al segreto
// CHIAVE: non e' un passaggio aperto per chiunque. /dove (con la chiave) dice da quale centro dati esce la chiamata.
// Copia in repo: .github/cloudflare/omirl-tramite.js (+ omirl-tramite.wrangler.toml)
const OMIRL = 'https://omirl.regione.liguria.it';

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method !== 'GET' || !(url.pathname.startsWith('/Omirl/rest/') || url.pathname === '/dove')) return new Response('no', { status: 404 });
    if (!env.CHIAVE || req.headers.get('X-Chiave') !== env.CHIAVE) return new Response('no', { status: 403 });
    if (url.pathname === '/dove') {
      const t = await (await fetch('https://www.cloudflare.com/cdn-cgi/trace')).text();
      return new Response(t, { headers: { 'content-type': 'text/plain' } });
    }
    try {
      const r = await fetch(OMIRL + url.pathname + url.search, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(20000),
      });
      return new Response(r.body, { status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'application/json' } });
    } catch (e) {
      // 504 = OMIRL non ha risposto nemmeno da Cloudflare: il collector lo tratta come un guasto
      return new Response('OMIRL non risponde: ' + e, { status: 504 });
    }
  }
};
