// Prova delle 11 pagine «Previsioni meteo <zona>» (24/10/2026), in locale:
//   python -m http.server 8897   (nella radice del repo)
//   node prove/meteo-zone/prova-pagine.js [slug ...]          SCATTI=1 per le foto, FINTO=0 per l'API vera
// Per ogni pagina, al telefono (393 px) e al computer (1366 px): errori della pagina, sbordi orizzontali, etichette
// della mappa che si toccano o escono dalla mappa (tutti e 7 i giorni), scheda del posto che si apre su OGGI anche
// con un altro giorno scelto, casella di ricerca, barre del grafico.
//
// ⚠️ FINTO (di partenza): /api/previsioni in locale non esiste. Con FINTO=0 la pagina chiede l'API di produzione
// (che risponde anche a localhost); con FINTO=1 la prova risponde con previsioni INVENTATE nella stessa forma, utili
// SOLO a provare impaginazione ed etichette. La sessione cloud del 24/10 non raggiungeva produzione: ha usato FINTO.
// I fondi OpenStreetMap si sostituiscono con una tessera bianca se non arrivano; il rilievo si chiede a raw.github.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const BASE = process.env.BASE || 'http://127.0.0.1:8897';
const FINTO = process.env.FINTO !== '0', SCATTI = process.env.SCATTI === '1';
const RADICE = path.join(__dirname, '..', '..');
const ZONE = process.argv.slice(2).length ? process.argv.slice(2) : ['garfagnana', 'lunigiana', 'casentino', 'valsassina', 'valdarno', 'mugello',
  'nebrodi', 'val-bormida', 'colline-metallifere-grossetane', 'val-d-aveto', 'val-brembana'];
const PAESI = JSON.parse(fs.readFileSync(path.join(RADICE, 'data', 'paesi-zone.json'), 'utf8'));
const attesa = ms => new Promise(r => setTimeout(r, ms));
const BIANCO = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/x8AAwMB/6X8hHkAAAAASUVORK5CYII=', 'base64');

// ── le previsioni inventate: stessa forma di functions/api/previsioni.js ──
const SIMB = ['clearsky_day', 'fair_day', 'partlycloudy_day', 'cloudy', 'lightrainshowers_day', 'rain', 'heavyrain', 'rainshowersandthunder_day'];
function oggiRoma() { return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' }); }
function piu(s, n) { const p = s.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n, 12)).toISOString().slice(0, 10); }
function rnd(seme) { let x = seme % 2147483647 || 7; return () => (x = x * 16807 % 2147483647) / 2147483647; }
function giorni(lat, lon, n) {
  const r = rnd(Math.round(lat * 1000 + lon * 77)), o = oggiRoma();
  return Array.from({ length: n }, (_, i) => { const s = SIMB[Math.floor(r() * SIMB.length)], piove = /rain|thunder/.test(s);
    const mn = Math.round(2 + r() * 8), mm = piove ? Math.round(r() * 250) / 10 : (r() < 0.3 ? 0.2 : 0);
    return { g: piu(o, i), mn, mx: mn + Math.round(5 + r() * 9), mm, pc: null, s }; });
}
function punto(lat, lon, q) {
  const g = giorni(lat, lon, 9), ore = [], o = oggiRoma(), r = rnd(Math.round(lat * 999));
  for (let k = 0; k < 9; k++) {
    if (k < 3) for (let h = 0; h < 24; h++) ore.push({ g: piu(o, k), h, t: 5 + r() * 10, mm: r() < 0.2 ? Math.round(r() * 30) / 10 : 0, s: SIMB[Math.floor(r() * 4)], v: r() * 6 });
    else for (const h of [0, 6, 12, 18]) ore.push({ g: piu(o, k), h, h6: true, t: 5 + r() * 10, mm: r() < 0.3 ? Math.round(r() * 60) / 10 : 0, s: SIMB[Math.floor(r() * 6)], v: r() * 6 });
  }
  return { lat, lon, q: q || null, giorni: g, ore, fonte: 'PROVA (dati inventati)' };
}

(async () => {
  const b = await chromium.launch();
  const esiti = [];
  for (const [nomeV, vp] of [['telefono', { width: 393, height: 852, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }], ['computer', { width: 1366, height: 900, deviceScaleFactor: 2 }]]) {
    const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch, deviceScaleFactor: vp.deviceScaleFactor, locale: 'it-IT', timezoneId: 'Europe/Rome' });
    await ctx.route('**/*', async rt => {
      const u = rt.request().url();
      if (FINTO && u.includes('/api/previsioni')) {
        const q = new URL(u).searchParams;
        if (q.get('zona')) return rt.fulfill({ json: { area: q.get('zona'), capoluoghi: (PAESI[q.get('zona')] || []).map(p => ({ n: p.n, lat: p.lat, lon: p.lon, r: p.r, giorni: giorni(p.lat, p.lon, 9) })) } });
        return rt.fulfill({ json: punto(+q.get('lat'), +q.get('lon'), +q.get('q')) });
      }
      // FINTO=0: la stessa domanda all'API di produzione, che risponde anche a localhost
      if (!FINTO && u.startsWith(BASE + '/api/previsioni'))
        return rt.fetch({ url: u.replace(BASE, 'https://precipitazioni.avventuremicologiche.it') }).then(r => rt.fulfill({ response: r }));
      if (u.includes('cdn.jsdelivr.net/gh/AvventureMicologiche/Mappa-Precipitazioni-Tessere@'))
        return rt.continue({ url: u.replace('cdn.jsdelivr.net/gh/AvventureMicologiche/Mappa-Precipitazioni-Tessere@', 'raw.githubusercontent.com/AvventureMicologiche/Mappa-Precipitazioni-Tessere/') }).catch(() => rt.fulfill({ body: BIANCO, contentType: 'image/png' }));
      if (/tile\.openstreetmap\.org/.test(u)) return rt.fetch({ timeout: 4000 }).then(r => rt.fulfill({ response: r })).catch(() => rt.fulfill({ body: BIANCO, contentType: 'image/png' }));
      if (/googletagmanager|geocoding-api\.open-meteo/.test(u)) return rt.abort();
      return rt.continue();
    });
    for (const z of ZONE) {
      const p = await ctx.newPage(), errori = [];
      p.on('pageerror', e => errori.push('pageerror: ' + e.message));
      p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED|net::/.test(m.text())) errori.push('console: ' + m.text()); });
      await p.goto(BASE + '/meteo/' + z + '/', { waitUntil: 'load', timeout: 60000 });
      await p.waitForSelector('#tab tbody tr', { timeout: 20000 }).catch(() => errori.push('la tabella non arriva'));
      await attesa(1500);
      const sbordo = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      // etichette: sovrapposte e fuori dalla mappa, giorno per giorno
      const conta = () => p.$$eval('#pz-mappa .pz-et', l => { const r = l.map(x => x.getBoundingClientRect()), m = document.getElementById('pz-mappa').getBoundingClientRect(); let s = 0, f = 0;
        for (let i = 0; i < r.length; i++) { if (r[i].left < m.left || r[i].right > m.right || r[i].top < m.top || r[i].bottom > m.bottom) f++;
          for (let j = i + 1; j < r.length; j++) if (!(r[i].right <= r[j].left || r[i].left >= r[j].right || r[i].bottom <= r[j].top || r[i].top >= r[j].bottom)) s++; }
        return { n: r.length, s, f, icone: l.filter(x => x.querySelector('.ic')).length }; });
      const giorniEt = [], nG = await p.$$eval('.pz-g', x => x.length);
      for (let k = 0; k < nG; k++) { await p.locator('.pz-g').nth(k).click(); await attesa(250); giorniEt.push(await conta());
        if (process.env.DETTAGLIO && giorniEt[k].f) console.log('  fuori, giorno ' + (k + 1) + ':', await p.$$eval('#pz-mappa .pz-et', l => { const m = document.getElementById('pz-mappa').getBoundingClientRect();
          return l.map(x => [x.textContent, x.getBoundingClientRect()]).filter(([, r]) => r.left < m.left || r.right > m.right || r.top < m.top || r.bottom > m.bottom)
            .map(([t, r]) => t + ' ' + [r.left - m.left, m.right - r.right, r.top - m.top, m.bottom - r.bottom].map(Math.round).join('/')).join(' | '); })); }
      // scheda: con il TERZO giorno scelto, il tocco su un paese deve aprire OGGI con le ore
      await p.locator('.pz-g').nth(2).click(); await attesa(200);
      await p.locator('#pz-mappa .pz-et').first().click({ force: true });
      await p.waitForSelector('#scheda .giorni button.sel', { timeout: 10000 }).catch(() => errori.push('la scheda non si apre'));
      const scheda = await p.evaluate(() => { const s = document.querySelector('#scheda .giorni button.sel'), b = document.querySelector('#scheda .giorni button');
        const o = document.querySelectorAll('#scheda .pz-ora'), r = document.querySelector('#scheda .pz-ore'), c = r && r.getBoundingClientRect();
        let vuoto = 0; if (o.length && c && r.scrollWidth <= r.clientWidth) vuoto = Math.round(c.right - o[o.length - 1].getBoundingClientRect().right);
        return { suOggi: !!s && s === b, testo: s ? s.querySelector('b').textContent : '', ore: o.length, porte: document.querySelectorAll('#scheda .pz-porte a').length, vuotoDestra: vuoto }; });
      const sbordoScheda = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      // riga della tabella e ricerca
      await p.locator('#scheda .chiudi').click(); await p.locator('#tab tbody tr').last().click(); await attesa(300);
      const tabOk = await p.$eval('#scheda', s => s.classList.contains('on') && !!s.querySelector('.giorni button.sel'));
      await p.locator('#cerca').fill('Castel'); await attesa(900);
      const cerca = await p.$$eval('#drop .r', x => x.length);
      if (cerca) { await p.locator('#drop .r').first().click(); await attesa(300); }
      const cercaApre = await p.$eval('#scheda', s => s.classList.contains('on'));
      // il grafico
      const barre = await p.$$eval('#graf .b', x => [x.length, x.filter(y => y.classList.contains('prev')).length]);
      await p.locator('#graf .b').first().click(); const info = await p.$eval('#graf-info', e => e.textContent);
      const puntoT = await p.$eval('#punto', e => e.textContent);
      const peggio = giorniEt.reduce((a, x) => ({ s: Math.max(a.s, x.s), f: Math.max(a.f, x.f) }), { s: 0, f: 0 });
      if (process.env.DETTAGLIO) console.log(z, nomeV, giorniEt.map(x => x.s + "/" + x.f).join(" "));
      const e = { z, v: nomeV, errori, sbordo, sbordoScheda, etichette: giorniEt[0] && giorniEt[0].n, iconeSempre: giorniEt.every(x => x.icone === x.n), sovrapposte: peggio.s, fuori: peggio.f,
        scheda, tabOk, cerca, cercaApre, barre, info: info.slice(0, 60), punto: puntoT.slice(0, 80) };
      esiti.push(e);
      console.log(JSON.stringify(e));
      if (SCATTI) {
        // lo scatto si fa sulla pagina appena aperta, come la vede chi arriva
        await p.goto(BASE + '/meteo/' + z + '/', { waitUntil: 'load', timeout: 60000 });
        await p.waitForSelector('#tab tbody tr', { timeout: 20000 }).catch(() => {}); await attesa(3500);
        await p.screenshot({ path: path.join(__dirname, 'scatto-' + z + '-' + nomeV + '.png'), fullPage: true });
      }
      await p.close();
    }
    await ctx.close();
  }
  await b.close();
  const male = esiti.filter(e => e.errori.length || e.sbordo > 0 || e.sbordoScheda > 0 || e.sovrapposte || e.fuori || !e.iconeSempre || !e.scheda.suOggi || !e.scheda.ore || !e.tabOk || !e.cercaApre);
  console.log(male.length ? '\n⚠️ ' + male.length + ' casi da guardare: ' + male.map(e => e.z + '/' + e.v).join(', ') : '\n✅ ' + esiti.length + ' casi senza difetti');
})();
