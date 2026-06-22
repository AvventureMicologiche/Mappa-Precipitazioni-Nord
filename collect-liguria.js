/**
 * collect-liguria.js
 * Fonte: omirl.regione.liguria.it (stazioni pluviometriche)
 * Endpoint primario: /Omirl/rest/stations/Pluvio24h → cumulativo 24h
 * Fallback: /Omirl/rest/stations/Pluvio → per lista stazioni base
 * Merge MAX tra run per protezione da glitch.
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'liguria');
const MAX_DAYS = 365;
const OMIRL_BASE = 'https://omirl.regione.liguria.it/Omirl/rest/stations';

function getItalyOffset(date) {
  const year = date.getUTCFullYear();
  const lastSunMarch = new Date(Date.UTC(year, 2, 31));
  lastSunMarch.setUTCDate(31 - lastSunMarch.getUTCDay());
  const lastSunOct = new Date(Date.UTC(year, 9, 31));
  lastSunOct.setUTCDate(31 - lastSunOct.getUTCDay());
  return (date >= lastSunMarch && date < lastSunOct) ? 2 : 1;
}

function getItalyDate(offsetHours) {
  const now = new Date();
  const italy = new Date(now.getTime() + (getItalyOffset(now) + (offsetHours||0)) * 3600000);
  return italy.toISOString().substring(0, 10);
}

function getTargetDate() {
  if (process.env.DATE_OVERRIDE && process.env.DATE_OVERRIDE.trim()) return process.env.DATE_OVERRIDE.trim();
  return getItalyDate(0);
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error('JSON parse error: ' + e.message)); }
      });
    }).on('error', reject);
  });
}

async function main() {
  const targetDate = getTargetDate();
  console.log(`\n=== Raccolta dati Liguria per ${targetDate} ===\n`);

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const outFile = path.join(DATA_DIR, `${targetDate}.json`);

  // ── Step 1: scarica lista stazioni base da Pluvio ────────────
  console.log('Scarico lista stazioni da OMIRL Pluvio...');
  let rawBase;
  try {
    rawBase = await fetchJSON(OMIRL_BASE + '/Pluvio');
  } catch(e) {
    console.error('Errore fetch Pluvio:', e.message);
    process.exit(1);
  }
  console.log(`  Stazioni base: ${rawBase.length}`);

  // ── Step 2: scarica cumulativo 24h da Pluvio24h ──────────────
  console.log('Scarico dati 24h da OMIRL Pluvio24h...');
  let raw24h = [];
  try {
    raw24h = await fetchJSON(OMIRL_BASE + '/Pluvio24h');
    if (!Array.isArray(raw24h)) raw24h = [];
  } catch(e) {
    console.warn('  Pluvio24h non disponibile:', e.message);
    raw24h = [];
  }
  console.log(`  Stazioni con pioggia 24h: ${raw24h.length}`);

  // ── Step 3: costruisci mappa stazioni con mm 24h ─────────────
  // Index delle stazioni 24h per shortCode
  const rain24h = {};
  raw24h.forEach(s => {
    if (!s.shortCode) return;
    const v = parseFloat(s.value);
    if (!isNaN(v) && v >= 0 && v < 500) rain24h[s.shortCode] = v;
  });

  // Bounding box Liguria
  const newData = {};
  rawBase.forEach(s => {
    if (!s.lat || !s.lon || !s.name) return;
    if (s.lat < 43.7 || s.lat > 44.8 || s.lon < 7.4 || s.lon > 10.3) return;
    const mm24 = rain24h[s.shortCode] || 0;
    newData[s.shortCode] = {
      id:  s.shortCode,
      n:   s.name,
      lat: Math.round(s.lat * 10000) / 10000,
      lon: Math.round(s.lon * 10000) / 10000,
      q:   s.alt || 0,
      p:   s.municipality || '',
      mm:  Math.round(mm24 * 10) / 10
    };
  });
  console.log(`  Stazioni in Liguria: ${Object.keys(newData).length}`);

  // ── Step 4: sovrascrittura (l'ultimo run della giornata vince) ─
  // Alle 23:50 Pluvio24h copre 23:50 ieri → 23:50 oggi ≈ giorno calendario
  // Ogni run sovrascrive il precedente, nessun accumulo
  const output = Object.values(newData);
  console.log(`  Stazioni finali: ${output.length}`);

  if (output.length < 10) {
    console.warn('Poche stazioni (' + output.length + '), salto salvataggio.');
  } else {
    fs.writeFileSync(outFile, JSON.stringify({
      date:      targetDate,
      collected: new Date().toISOString(),
      source:    'arpa-liguria-omirl-24h',
      count:     output.length,
      stations:  output
    }), 'utf8');
    console.log(`Salvato: ${outFile} (${output.length} stazioni)`);
  }

  // ── Step 5: pulizia ───────────────────────────────────────────
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MAX_DAYS);
  const cutoffStr = cutoff.toISOString().substring(0, 10);
  const allFiles = fs.readdirSync(DATA_DIR)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
  let deleted = 0;
  allFiles.forEach(f => {
    if (f.replace('.json', '') < cutoffStr) {
      fs.unlinkSync(path.join(DATA_DIR, f));
      deleted++;
    }
  });
  console.log(`Pulizia: ${deleted} eliminati, ${allFiles.length - deleted} rimanenti`);
  console.log('\n=== Completato! ===\n');
}

main().catch(e => { console.error('Errore fatale:', e); process.exit(1); });
