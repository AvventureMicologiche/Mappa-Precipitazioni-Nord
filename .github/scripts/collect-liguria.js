/**
 * collect-liguria.js
 * Fonte: omirl.regione.liguria.it (stazioni pluviometriche)
 * Endpoint: /Omirl/rest/stations/Pluvio → 199 stazioni con mm ultima ora
 * Nota: OMIRL fornisce solo dati real-time (ultima misura).
 *       Lo script accumula i mm giornalieri sommando le chiamate nel corso del giorno.
 *       Se il file del giorno esiste già, aggiorna solo le stazioni con valore maggiore.
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'liguria');
const MAX_DAYS = 365;
const OMIRL_URL = 'https://omirl.regione.liguria.it/Omirl/rest/stations/Pluvio';

function getItalyDate(offsetHours) {
  const now = new Date();
  const italy = new Date(now.getTime() + (getItalyOffset(now) + (offsetHours||0)) * 3600000);
  return italy.toISOString().substring(0, 10);
}

function getItalyOffset(date) {
  // Calcola offset italiano basato sul calendario (non getTimezoneOffset che è 0 su server UTC)
  // CEST (UTC+2): ultima domenica marzo → ultima domenica ottobre
  // CET  (UTC+1): resto dell'anno
  const year = date.getUTCFullYear();
  const lastSunMarch = new Date(Date.UTC(year, 2, 31));
  lastSunMarch.setUTCDate(31 - lastSunMarch.getUTCDay());
  const lastSunOct = new Date(Date.UTC(year, 9, 31));
  lastSunOct.setUTCDate(31 - lastSunOct.getUTCDay());
  return (date >= lastSunMarch && date < lastSunOct) ? 2 : 1;
}

function getTargetDate() {
  if (process.env.DATE_OVERRIDE && process.env.DATE_OVERRIDE.trim()) return process.env.DATE_OVERRIDE.trim();
  return getItalyDate(0);
}

// Nelle prime ore italiane (00:00-05:59) aggiorna anche il giorno precedente
// perché la pioggia notturna cade a cavallo della mezzanotte
function shouldAlsoUpdateYesterday() {
  if (process.env.DATE_OVERRIDE && process.env.DATE_OVERRIDE.trim()) return false;
  const now = new Date();
  const italyHour = new Date(now.getTime() + getItalyOffset(now) * 3600000).getHours();
  return italyHour >= 0 && italyHour < 6;
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
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

  // ── Step 1: scarica dati OMIRL ─────────────────────────────────
  console.log('Scarico dati da OMIRL...');
  let rawStations;
  try {
    rawStations = await fetchJSON(OMIRL_URL);
  } catch(e) {
    console.error('Errore fetch OMIRL:', e.message);
    process.exit(1);
  }
  console.log(`  Stazioni ricevute: ${rawStations.length}`);

  // ── Step 2: filtra e normalizza ────────────────────────────────
  // Bounding box Liguria + margine per stazioni di confine
  const newData = {};
  rawStations.forEach(s => {
    if (!s.lat || !s.lon || !s.name) return;
    if (s.lat < 43.7 || s.lat > 44.8 || s.lon < 7.4 || s.lon > 10.3) return;
    const mm = (typeof s.value === 'number' && s.value >= 0 && s.value < 500) ? s.value : 0;
    newData[s.shortCode] = {
      id:  s.shortCode,
      n:   s.name,
      lat: Math.round(s.lat * 10000) / 10000,
      lon: Math.round(s.lon * 10000) / 10000,
      q:   s.alt || 0,
      p:   s.municipality || '',
      mm:  Math.round(mm * 10) / 10
    };
  });
  console.log(`  Stazioni in Liguria: ${Object.keys(newData).length}`);

  // ── Step 3: merge con file esistente (accumulo giornaliero) ───
  // OMIRL dà l'ultimo valore real-time, non il cumulato del giorno.
  // Manteniamo il valore massimo tra quello esistente e il nuovo.
  let existingStations = {};
  if (fs.existsSync(outFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(outFile, 'utf8'));
      if (existing.stations) {
        existing.stations.forEach(s => { existingStations[s.id] = s; });
        console.log(`  File esistente: ${existing.stations.length} stazioni`);
      }
    } catch(e) {
      console.log('  Nessun file esistente o corrotto, creo nuovo.');
    }
  }

  // Merge: SOMMA i mm (ogni run porta l'incremento dell'ultima ora)
  const merged = {};
  Object.assign(merged, existingStations);
  Object.values(newData).forEach(s => {
    if (merged[s.id]) {
      merged[s.id].mm = Math.round((merged[s.id].mm + s.mm) * 10) / 10;
    } else {
      merged[s.id] = s;
    }
  });

  const output = Object.values(merged);
  console.log(`  Stazioni finali: ${output.length}`);

  if (output.length < 10) {
    console.warn('Poche stazioni oggi (' + output.length + '), salto salvataggio oggi ma aggiorno ieri.');
  } else {

  // ── Step 4: salva file del giorno corrente ────────────────────
  fs.writeFileSync(outFile, JSON.stringify({
    date:      targetDate,
    collected: new Date().toISOString(),
    source:    'arpa-liguria-omirl',
    count:     output.length,
    stations:  output
  }), 'utf8');
  console.log(`Salvato: ${outFile} (${output.length} stazioni)`);
  } // fine if output.length >= 10

  // ── Step 4b: nelle prime ore aggiorna anche ieri ──────────────
  // La pioggia caduta tra le 23:00 e le 05:59 appartiene visivamente a ieri
  if (shouldAlsoUpdateYesterday()) {
    const yesterdayDate = getItalyDate(-24);
    const yesterdayFile = path.join(DATA_DIR, `${yesterdayDate}.json`);
    console.log(`Aggiorno anche ieri: ${yesterdayDate}`);
    let yesterdayStations = {};
    if (fs.existsSync(yesterdayFile)) {
      try {
        const existing = JSON.parse(fs.readFileSync(yesterdayFile, 'utf8'));
        if (existing.stations) {
          existing.stations.forEach(s => { yesterdayStations[s.id] = s; });
        }
      } catch(e) { console.log('File ieri corrotto, creo nuovo.'); }
    }
    // Somma i mm dell'ultima ora anche al file di ieri
    Object.values(newData).forEach(s => {
      if (s.mm > 0) {
        if (yesterdayStations[s.id]) {
          yesterdayStations[s.id].mm = Math.round((yesterdayStations[s.id].mm + s.mm) * 10) / 10;
        } else {
          yesterdayStations[s.id] = {...s};
        }
      }
    });
    const yesterdayOutput = Object.values(yesterdayStations);
    if (yesterdayOutput.length >= 10) {
      fs.writeFileSync(yesterdayFile, JSON.stringify({
        date:      yesterdayDate,
        collected: new Date().toISOString(),
        source:    'arpa-liguria-omirl',
        count:     yesterdayOutput.length,
        stations:  yesterdayOutput
      }), 'utf8');
      console.log(`Aggiornato ieri: ${yesterdayFile}`);
    }
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
