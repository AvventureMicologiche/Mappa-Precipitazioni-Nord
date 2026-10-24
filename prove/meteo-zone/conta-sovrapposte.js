// Conta le etichette che si toccano, per variante (?et=A..D), oggi e giovedi', pioggia e temperature, al telefono.
const puppeteer = require('D:/video youtube/claudio/grafiche-social/node_modules/puppeteer-core');
const fs = require('fs');
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => fs.existsSync(p));
const attesa = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  for (const v of ['E', 'F']) {
    const p = await b.newPage();
    await p.setViewport({ width: 393, height: 852, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    await p.goto('http://localhost:8897/val-brembana/?et=' + v, { waitUntil: 'networkidle0', timeout: 60000 }); await attesa(1500);
    const conta = () => p.$$eval('#pz-mappa .pz-et', l => { const r = l.map(x => x.getBoundingClientRect()); let n = 0;
      for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) if (!(r[i].right < r[j].left || r[i].left > r[j].right || r[i].bottom < r[j].top || r[i].top > r[j].bottom)) n++; return n; });
    const out = [];
    for (const k of [0, 5]) {
      const g = await p.$$('.pz-g'); await g[k].tap(); await attesa(500); out.push('giorno ' + (k + 1) + ' pioggia ' + await conta());
      
    }
    console.log('variante ' + v + ': ' + out.join(', '));
    await p.close();
  }
  await b.close();
})();
