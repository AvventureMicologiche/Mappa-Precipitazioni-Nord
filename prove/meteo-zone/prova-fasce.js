// Scatta la scheda di Zogno su mercoledi' (fasce di 6 ore) al computer e al telefono.
const puppeteer = require('D:/video youtube/claudio/grafiche-social/node_modules/puppeteer-core');
const fs = require('fs');
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => fs.existsSync(p));
const attesa = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  for (const [nome, w, h, m] of [['computer', 860, 900, false], ['telefono', 393, 852, true]]) {
    const p = await b.newPage();
    await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: m, hasTouch: m });
    await p.goto('http://localhost:8897/val-brembana/', { waitUntil: 'networkidle0', timeout: 60000 }); await attesa(1200);
    await p.evaluate(() => { const tr = [...document.querySelectorAll('#tab tbody tr')].find(t => t.dataset.n === 'Zogno'); tr.click(); });
    await attesa(2500);
    await p.evaluate(() => { const bt = document.querySelectorAll('#scheda .giorni button'); bt[4].click(); });
    await attesa(400);
    const el = await p.$('#scheda'); await el.screenshot({ path: __dirname + '/fasce-' + nome + '.png' });
    console.log(nome, await p.$$eval('#scheda .pz-ora', l => l.map(x => Math.round(x.getBoundingClientRect().width) + 'px').join(' ')), '| riga larga', await p.$eval('#scheda .pz-ore', e => Math.round(e.getBoundingClientRect().width)));
  }
  await b.close();
})();
