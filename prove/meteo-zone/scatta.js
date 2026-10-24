// Scatta la pagina campione a misura di telefono e di computer, e riporta gli errori della console.
//   node scatta.js   (col server locale acceso: python -m http.server 8897 in questa cartella)
const puppeteer = require('D:/video youtube/claudio/grafiche-social/node_modules/puppeteer-core');
const fs = require('fs');
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => fs.existsSync(p));
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  for (const [nome, w, h, m] of [['telefono', 393, 852, true], ['computer', 1366, 900, false]]) {
    const p = await b.newPage();
    const err = [];
    p.on('console', c => { if (c.type() === 'error') err.push(c.text()); });
    p.on('pageerror', e => err.push(e.message));
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 2, isMobile: m, hasTouch: m });
    await p.goto('http://localhost:8897/val-brembana/', { waitUntil: 'networkidle0', timeout: 60000 });
    await new Promise(r => setTimeout(r, 1500));
    const info = await p.evaluate(() => ({ punto: document.getElementById('punto').innerText, giorni: document.querySelectorAll('.pz-g').length,
      righe: document.querySelectorAll('#tab tbody tr').length, barre: document.querySelectorAll('#graf .b').length,
      largo: document.documentElement.scrollWidth, vista: innerWidth }));
    await p.screenshot({ path: __dirname + '/campione-' + nome + '.png', fullPage: true });
    console.log(nome, JSON.stringify(info), err.length ? 'ERRORI: ' + err.join(' | ') : 'nessun errore');
  }
  await b.close();
})();
