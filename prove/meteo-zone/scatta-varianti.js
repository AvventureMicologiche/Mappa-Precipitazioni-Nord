// Scatta la mappa della valle nelle quattro varianti di etichetta (?et=A..D), giovedi', pioggia e temperature,
// a misura di telefono, e scrive confronto.html per guardarle affiancate.
const puppeteer = require('D:/video youtube/claudio/grafiche-social/node_modules/puppeteer-core');
const fs = require('fs');
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => fs.existsSync(p));
const attesa = ms => new Promise(r => setTimeout(r, ms));
const NOMI = { A: 'A · nome con alone (come sulle carte)', B: 'B · nome su velo bianco', C: 'C · pillola bianca unica', D: 'D · pillola blu scuro', E: 'E · cartellino bianco su due righe, temperature sempre', F: 'F · pillola bianca su una riga, temperature sempre' };
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  const righe = [];
  for (const v of ['E', 'F']) {
    const p = await b.newPage();
    await p.setViewport({ width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await p.goto('http://localhost:8897/val-brembana/?et=' + v, { waitUntil: 'networkidle0', timeout: 60000 }); await attesa(1500);
    const g = await p.$$('.pz-g'); await g[5].tap(); await attesa(800);
    const m = await p.$('#pz-mappa'); await m.screenshot({ path: __dirname + '/var-' + v + '-pioggia.png' });
    const g0 = await p.$$('.pz-g'); if (v === 'C') { await p.tap('#sw-t'); } else { await g0[0].tap(); } await attesa(800); await m.screenshot({ path: __dirname + '/var-' + v + '-temp.png' });
    righe.push(`<section><h2>${NOMI[v]}</h2><div><img src="var-${v}-pioggia.png"><img src="var-${v}-temp.png"></div></section>`);
    await p.close();
  }
  await b.close();
  fs.writeFileSync(__dirname + '/confronto.html', `<!doctype html><meta charset="utf-8"><title>Etichette: confronto</title>
<style>body{font-family:system-ui,sans-serif;margin:16px;background:#f3f5f8;color:#1f2d3a}h1{font-size:20px}section{background:#fff;border-radius:12px;padding:10px 14px;margin:12px 0}
h2{font-size:17px;margin:4px 0 8px;color:#0f3d6e}section div{display:flex;gap:12px;flex-wrap:wrap}img{width:360px;max-width:100%;border-radius:10px;border:1px solid #c9d5e1}</style>
<h1>Etichette dei paesi: quattro varianti (E ed F: a sinistra giovedì 29 con un po' di pioggia, a destra oggi; C per confronto: giovedì pioggia e temperature)</h1>${righe.join('\n')}`);
  console.log('fatto');
})();
