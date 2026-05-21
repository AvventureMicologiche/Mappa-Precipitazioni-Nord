/**
 * collect-toscana-gh.js
 * Versione GitHub Actions di collect-toscana.js
 * Scrive in data/toscana/ (committata nel repo) invece di /tmp
 *
 * Uso: node scripts/collect-toscana-gh.js
 */

const https  = require('https');
const fs     = require('fs');
const path   = require('path');

const DATA_DIR   = path.join(__dirname, '..', 'data', 'toscana');
const LIST_URL   = 'https://www.cfr.toscana.it/monitoraggio/actions.php?action=list&rt=0&type_gauge=pluvio&speed=km/h';
const SCRAPE_URL = 'https://www.cfr.toscana.it/monitoraggio/stazioni.php?type=pluvio_men';

function fmtDate(d) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'Accept': 'text/html,application/json,*/*',
        'User-Agent': 'Mozilla/5.0 (compatible; MappaPluvio/1.0)'
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode !== 200) reject(new Error(`HTTP ${res.statusCode}`));
        else resolve(data);
      });
    }).on('error', reject);
  });
}

async function fetchStationList() {
  const data = await fetchText(LIST_URL).then(t => JSON.parse(t));
  const stazioni = {};
  // Response è GeoJSON: { type:"featureCollection", features:[{IDStazione, Nome, Lat, Lon, ...}] }
  const items = Array.isArray(data) ? data
              : (data.features || data.data || data.stazioni || data.result || []);
  items.forEach(s => {
    const id  = String(s.IDStazione || s.id || '').trim();
    const lat = parseFloat(s.Lat || s.lat || 0);
    const lon = parseFloat(s.Lon || s.lon || 0);
    if (!id || !lat || !lon) return;
    stazioni[id] = {
      n:   (s.Nome || s.nome || id).trim(),
      lat: Math.round(lat * 10000) / 10000,
      lon: Math.round(lon * 10000) / 10000,
      q:   parseInt(s.Quota || s.quota || 0, 10) || 0,
      p:   (s.Provincia || s.provincia || '—').trim()
    };
  });
  return stazioni;
}

async function fetchPrecipData() {
  const html = await fetchText(SCRAPE_URL);
  const rows = [];
  const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const stripTags = s => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim();
  let trMatch;
  while ((trMatch = trRegex.exec(html)) !== null) {
    const cells = [];
    const tdRe = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    let tdMatch;
    while ((tdMatch = tdRe.exec(trMatch[1])) !== null) cells.push(stripTags(tdMatch[1]));
    if (cells.length < 8) continue;
    const codice = cells[0].replace(/\s+/g, '');
    if (!codice.match(/^TOS\d+$/i) && !codice.match(/^\d+$/)) continue;
    const mmOggi = parseFloat(cells[6]);
    if (isNaN(mmOggi) || mmOggi < 0) continue;
    rows.push({ codice, stazione: cells[1], provincia: cells[3], quota: parseInt(cells[5], 10) || 0, mm: Math.round(mmOggi * 10) / 10 });
  }
  return rows;
}

function buildStations(rows, stationList) {
  return rows.map(row => {
    let info = stationList[row.codice];
    if (!info) {
      const n = row.codice.replace(/^TOS0*/i, '');
      info = stationList[n] || stationList['TOS' + n.padStart(8, '0')];
    }
    if (!info) return null;
    return { id: row.codice, n: info.n || row.stazione, lat: info.lat, lon: info.lon, q: info.q || row.quota, p: info.p || row.provincia, mm: row.mm };
  }).filter(Boolean);
}

async function main() {
  console.log('=== collect-toscana-gh avviato ===');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const today   = new Date();
  const dateStr = fmtDate(today);

  const [stationList, precipRows] = await Promise.all([
    fetchStationList(),
    fetchPrecipData()
  ]);

  const stations = buildStations(precipRows, stationList);
  console.log(`  Stazioni: ${stations.length}`);

  if (stations.length < 10) throw new Error(`Troppo poche stazioni: ${stations.length}`);

  const outFile = path.join(DATA_DIR, `${dateStr}.json`);
  fs.writeFileSync(outFile, JSON.stringify({
    date:      dateStr,
    collected: new Date().toISOString(),
    source:    'cfr-toscana',
    count:     stations.length,
    stations
  }));
  console.log(`✅ Scritto ${outFile}`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
