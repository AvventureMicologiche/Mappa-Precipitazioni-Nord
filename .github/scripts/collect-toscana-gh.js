/**
 * collect-toscana-gh.js  —  GitHub Actions
 * Raccoglie precipitazioni giornaliere Toscana da CFR Toscana
 * Strategia: somma tutti i valori mm/15min del giorno corrente
 * usando action=PLUVIO con ogni timestamp della lista giornaliera
 */

const https  = require('https');
const fs     = require('fs');
const path   = require('path');

const DATA_DIR  = path.join(__dirname, '../..', 'data', 'toscana');
const BASE_URL  = 'https://www.cfr.toscana.it/monitoraggio/actions.php';

function fmtDate(d) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'Accept': 'application/json,*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode !== 200) reject(new Error(`HTTP ${res.statusCode}`));
        else {
          try { resolve(JSON.parse(data)); }
          catch(e) { reject(new Error('JSON parse error: ' + e.message)); }
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  console.log('=== collect-toscana-gh avviato ===');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const today   = new Date();
  const dateStr = fmtDate(today);

  // Step 1: fetch base — ottieni stazioni + lista timestamp del giorno
  console.log('  Fetch lista stazioni e timestamps...');
  const base = await fetchJSON(`${BASE_URL}?action=PLUVIO`);

  if (!base.data || !Array.isArray(base.data)) {
    throw new Error('Risposta inattesa da action=PLUVIO');
  }

  // Costruisci mappa stazioni con metadati
  const stMeta = {};
  base.data.forEach(s => {
    const id  = s.IDStazione;
    const lat = parseFloat(s.Lat);
    const lon = parseFloat(s.Lon);
    if (!id || isNaN(lat) || isNaN(lon)) return;

    // Estrai nome pulito dal campo Nome (formato: "NomeStazione - Comune\r\n...")
    const nomeParts = (s.Nome || id).split('\r\n')[0].split(' - ');
    const nome = nomeParts[0].trim();

    stMeta[id] = { n: nome, lat, lon, q: 0, p: '—' };
  });

  console.log(`  Stazioni trovate: ${Object.keys(stMeta).length}`);

  // Ottieni lista timestamp disponibili oggi
  const timestamps = base.list || [];
  console.log(`  Timestamps disponibili: ${timestamps.length}`);

  if (timestamps.length === 0) {
    throw new Error('Nessun timestamp disponibile');
  }

  // Step 2: per ogni timestamp, somma i Valore (mm/15min) per stazione
  const rainTot = {}; // IDStazione -> mm totali

  for (let i = 0; i < timestamps.length; i++) {
    const ts = timestamps[i];
    try {
      const data = await fetchJSON(`${BASE_URL}?action=PLUVIO&last=${ts}`);
      if (data.data && Array.isArray(data.data)) {
        data.data.forEach(s => {
          const id  = s.IDStazione;
          const val = parseFloat(s.Valore);
          if (!id || isNaN(val) || val < 0 || val > 200) return;
          rainTot[id] = (rainTot[id] || 0) + val;
        });
      }
      process.stdout.write(`  Processati ${i+1}/${timestamps.length} timestamps\r`);
      await sleep(200); // piccola pausa per non sovraccaricare il server
    } catch(e) {
      console.warn(`\n  Warn: timestamp ${ts} fallito: ${e.message}`);
    }
  }

  console.log(`\n  Somma completata per ${Object.keys(rainTot).length} stazioni`);

  // Step 3: costruisci array stazioni con mm totali
  // Per le coordinate usiamo stMeta dalla chiamata base
  // Per provincia dobbiamo aggiungerla dalla lista stazioni CFR
  const LIST_URL = `${BASE_URL}?action=list&rt=0&type_gauge=pluvio&speed=km/h`;
  let stList = {};
  try {
    const listData = await fetchJSON(LIST_URL);
    const items = Array.isArray(listData) ? listData
                : (listData.features || listData.data || listData.result || []);
    items.forEach(s => {
      const id = String(s.IDStazione || '').trim();
      if (!id) return;
      stList[id] = {
        p: (s.Provincia || '—').trim(),
        q: parseInt(s.Quota || 0, 10) || 0
      };
    });
    console.log(`  Lista stazioni (provincia/quota): ${Object.keys(stList).length}`);
  } catch(e) {
    console.warn('  Warn: lista stazioni fallita, provincia non disponibile');
  }

  // Assembla output
  const stations = Object.keys(rainTot).map(id => {
    const meta = stMeta[id];
    if (!meta) return null;
    const extra = stList[id] || {};
    const mm = Math.round(rainTot[id] * 10) / 10;
    if (mm < 0 || mm > 500) return null;
    return {
      id,
      n:   meta.n,
      lat: meta.lat,
      lon: meta.lon,
      q:   extra.q || meta.q || 0,
      p:   extra.p || meta.p || '—',
      mm
    };
  }).filter(Boolean);

  console.log(`  Stazioni con dati: ${stations.length}`);

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
