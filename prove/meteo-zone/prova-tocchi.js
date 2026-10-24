// Prova le parti cliccabili della pagina campione su un telefono (393x852), con tocchi veri.
//   node prova-tocchi.js   (col server locale acceso: python -m http.server 8897 in questa cartella)
const puppeteer = require('D:/video youtube/claudio/grafiche-social/node_modules/puppeteer-core');
const fs = require('fs');
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => fs.existsSync(p));
const attesa = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const b = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
  const p = await b.newPage();
  const err = [];
  p.on('pageerror', e => err.push(e.message));
  p.on('console', c => { if (c.type() === 'error' && !/favicon|404/.test(c.text())) err.push(c.text()); });
  await p.setViewport({ width: 393, height: 852, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await p.goto('http://localhost:8897/val-brembana/', { waitUntil: 'networkidle0', timeout: 60000 });
  await attesa(1500);
  const sovrapposte = () => p.$$eval('#pz-mappa .pz-et', l => { const r = l.map(x => x.getBoundingClientRect()); let n = 0; for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) if (!(r[i].right < r[j].left || r[i].left > r[j].right || r[i].bottom < r[j].top || r[i].top > r[j].bottom)) n++; return n; });
  const etichette = () => p.$$eval('#pz-mappa .pz-et', l => l.map(x => x.textContent));
  console.log('1. mappa: paesi', (await etichette()).length, '| pluviometri', (await p.$$('#pz-mappa .pz-pl')).length, '| esempio', (await etichette()).slice(0, 3).join(' · '), '| coppie sovrapposte:', await sovrapposte());
  // tocco su giovedi' (6° giorno)
  const g = await p.$$('.pz-g'); await g[5].tap(); await attesa(500);
  console.log('2. tocco 6° giorno →', await p.$eval('#mappa-giorno', e => e.textContent), '| selezionato:', await p.$eval('.pz-g.sel .n', e => e.textContent),
    '| colonna tabella:', await p.$eval('#tab th.col-sel', e => e.textContent), '| mappa:', (await etichette()).slice(0, 3).join(' · '));
  // temperature
  await p.tap('#sw-t'); await attesa(300);
  console.log('3. temperature →', (await etichette()).slice(0, 3).join(' · '), '| sovrapposte:', await sovrapposte());
  await p.screenshot({ path: __dirname + '/tocco-giorno.png' });
  // tocco su un paese della tabella
  const tr = await p.$$('#tab tbody tr'); await tr[11].tap(); await attesa(2500);
  console.log('4. tocco paese →', await p.$eval('#scheda h3', e => e.textContent), '| ore:', (await p.$$('#scheda .pz-ora')).length, '| porte:', (await p.$$('#scheda .pz-porte a')).length);
  // giorno dentro la scheda
  const gs = await p.$$('#scheda .giorni button'); await gs[1].tap(); await attesa(300);
  console.log('5. scheda domani → ore:', (await p.$$('#scheda .pz-ora')).length, '| prima ora:', await p.$eval('#scheda .pz-ora', e => e.innerText.replace(/\n/g, ' ')));
  await p.screenshot({ path: __dirname + '/tocco-scheda.png' });
  // ricerca
  await p.tap('#cerca'); await p.type('#cerca', 'carona', { delay: 60 }); await attesa(1800);
  const righe = await p.$$eval('#drop .r', l => l.map(x => x.innerText.replace(/\n/g, ' ')));
  console.log('6. cerca «carona» →', righe.slice(0, 4).join(' | '));
  if (righe.length) { const r = await p.$$('#drop .r'); await r[0].tap(); await attesa(2500);
    console.log('7. scelto →', await p.$eval('#scheda h3', e => e.textContent), '| sub:', await p.$eval('#scheda .sub', e => e.textContent), '| ore:', (await p.$$('#scheda .pz-ora')).length); }
  await p.screenshot({ path: __dirname + '/tocco-cerca.png' });
  // barra del grafico (una misurata)
  const barre = await p.$$('#graf .b'); await barre[12].tap(); await attesa(300);
  console.log('8. barra →', await p.$eval('#graf-info', e => e.innerText));
  console.log('larghezza pagina', await p.evaluate(() => document.documentElement.scrollWidth), '| errori:', err.length ? err.join(' | ') : 'nessuno');
  await b.close();
})();
