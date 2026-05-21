/**
 * collect-toscana-gh.js  —  GitHub Actions
 * Raccoglie precipitazioni giornaliere Toscana da CFR Toscana
 * Usa lo stesso URL stazioni.php?type=pluvio_men ma con Accept:text/plain
 * che restituisce TSV con cumulato giornaliero ("dalle 00.00")
 *
 * Colonne TSV (0-based):
 *  0: Codice  1: Stazione  2: Comune  3: Provincia  4: Zona allerta
 *  5: Quota   6: dalle 00.00 (mm oggi)  7: Ultimi dati
 *  8: 1g  9: 2g  10: 5g  11: 7g  12: 10g  13: 15g  14: 30g  15: gg s.
 */

const https  = require('https');
const fs     = require('fs');
const path   = require('path');

const DATA_DIR   = path.join(__dirname, '..', 'data', 'toscana');
const LIST_URL   = 'https://www.cfr.toscana.it/monitoraggio/actions.php?action=list&rt=0&type_gauge=pluvio&speed=km/h';
const TSV_URL    = 'https://www.cfr.toscana.it/monitoraggio/stazioni.php?type=pluvio_men';

function fmtDate(d) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}

function fetchText(url, acceptHeader) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'Accept': acceptHeader || 'text/plain,text/tab-separated-values,*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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

// Fetch lista stazioni per lat/lon
async function fetchStationList() {
  const text = await fetchText(LIST_URL, 'application/json,*/*');
  const data = JSON.parse(text);
  const stazioni = {};
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
  console.log(`  Lista stazioni: ${Object.keys(stazioni).length}`);
  return stazioni;
}

// Fetch TSV con cumulati giornalieri
async function fetchTSV() {
  const text = await fetchText(TSV_URL, 'text/plain,text/tab-separated-values,*/*');
  const rows = [];
  const lines = text.split('\n');

  for (const line of lines) {
    const cells = line.split('\t');
    if (cells.length < 8) continue;
    const codice = cells[0].trim();
    if (!codice.match(/^TOS\d+/i)) continue; // salta header e righe vuote

    const mm = parseFloat(cells[6]);
    if (isNaN(mm) || mm < 0) continue;

    rows.push({
      codice,
      stazione: cells[1].trim(),
      provincia: cells[3].trim(),
      quota: parseInt(cells[5], 10) || 0,
      mm: Math.round(mm * 10) / 10
    });
  }

  console.log(`  Righe TSV: ${rows.length}`);
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
    return {
      id:  row.codice,
      n:   info.n || row.stazione,
      lat: info.lat,
      lon: info.lon,
      q:   info.q || row.quota,
      p:   info.p || row.provincia,
      mm:  row.mm
    };
  }).filter(Boolean);
}

async function main() {
  console.log('=== collect-toscana-gh avviato ===');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const today   = new Date();
  const dateStr = fmtDate(today);

  const [stationList, tsvRows] = await Promise.all([
    fetchStationList(),
    fetchTSV()
  ]);

  const stations = buildStations(tsvRows, stationList);
  console.log(`  Stazioni con coordinate: ${stations.length}`);

  if (stations.length < 10) throw new Error(`Troppo poche stazioni: ${stations.length}`);

  const outFile = path.join(DATA_DIR, `${dateStr}.json`);
  fs.writeFileSync(outFile, JSON.stringify({
    date:      dateStr,
    collected: new Date().toISOString(),
    source:    'cfr-toscana',
    count:     stations.length,
    stations
  }));
  console.log(`✅ Scritto ${outFile} (${stations.length} stazioni)`);
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
