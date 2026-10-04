// SVEGLIA DEL GUARDIANO (Cloudflare Worker, 4/10/2026)
// GitHub ogni tanto salta per notti intere i suoi giri programmati, guardiano
// compreso (3->4/10: niente dalle 22:13 UTC al mattino). I lanci «a mano» via
// API invece partono subito. Questo worker, da fuori GitHub, la mattina lancia
// il guardiano; il guardiano poi ri-lancia quello che manca.
// Orari: cron `0,30 4-6 * * *` (UTC) = 6:00-8:30 italiane d'estate, 5:00-7:30 d'inverno.
// Segreto GH_TOKEN: chiave GitHub fine-grained, solo questo repo, solo Actions read/write.

const REPO = 'AvventureMicologiche/Mappa-Precipitazioni-Nord';
const WF = 'guardiano.yml';

async function sveglia(env) {
  for (let tentativo = 1; tentativo <= 3; tentativo++) {
    const r = await fetch(`https://api.github.com/repos/${REPO}/actions/workflows/${WF}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GH_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'sveglia-guardiano',   // GitHub rifiuta le chiamate senza
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: 'main' }),
    });
    if (r.status === 204) { console.log('guardiano lanciato'); return; }
    console.log(`tentativo ${tentativo}: HTTP ${r.status} ${await r.text()}`);
    if (r.status === 401 || r.status === 403 || r.status === 404) return; // chiave scaduta o sbagliata: riprovare non serve
    await new Promise(ok => setTimeout(ok, 20000));
  }
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(sveglia(env));
  },
  // aprire l'indirizzo del worker NON lancia niente: dice solo che c'e'
  async fetch() {
    return new Response('sveglia del guardiano attiva\n');
  },
};
