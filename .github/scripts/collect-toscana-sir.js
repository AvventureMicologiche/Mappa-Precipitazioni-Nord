/**
 * collect-toscana-sir.js  —  GitHub Actions
 * Raccoglie precipitazioni giornaliere Toscana da SIR Toscana (Servizio Idrologico Regionale)
 * anziché da CFR Toscana: il feed CFR (action=PLUVIO su cfr.toscana.it) si è rivelato inaffidabile,
 * restituisce Valore=0 anche con pioggia reale in corso per la maggioranza delle stazioni
 * (verificato confrontando in tempo reale con SIR, che usa la stessa rete/stessi ID stazione).
 *
 * Le coordinate (lat/lon) sono lette da un file statico bundlato nel repo (toscana-stazioni-coords.json),
 * generato una tantum dal base-call CFR (action=PLUVIO) — CFR è affidabile per i metadati (le
 * coordinate non cambiano quasi mai) ma NON per i valori, e soprattutto da GitHub Actions
 * l'endpoint CFR va spesso in timeout (rete CFR sembra bloccare/limitare i runner GH), quindi
 * niente più chiamata live a CFR per evitare un punto di fallimento inutile ad ogni run.
 * I valori di pioggia vengono letti da SIR (sir.toscana.it/monitoraggio/stazioni.php?type=pluvio),
 * che usa gli stessi IDStazione di CFR.
 *
 * ATTENZIONE — Δ24h di SIR è una FINESTRA MOBILE (ultime 24 ore da adesso), non un totale di
 * calendario mezzanotte-mezzanotte. Stesso problema già noto per cum_rain_24h di Piemonte.
 * Per questo la formula di merge NON usa max() tra run diversi dello stesso giorno (trascinerebbe
 * pioggia del giorno precedente in avanti): vince sempre la lettura più recente, che con il passare
 * della giornata "scivola via" dalla pioggia di ieri e converge verso il vero totale del giorno.
 * L'unica eccezione è la protezione dai glitch a 0: se la lettura più recente è 0 ma quella
 * precedente dello stesso giorno era >0, si preserva il valore precedente.
 *
 * La protezione glitch è però DISATTIVATA nei run di chiusura serali (CLOSING=1 dal
 * workflow, o comunque ora locale ≥ 22): a fine giornata la finestra Δ24h copre quasi
 * esattamente il giorno di calendario, quindi uno 0 lì è un dato reale. Tenerla attiva
 * congelerebbe per sempre la pioggia di IERI trascinata nel file dai run del mattino —
 * bug #17: ogni giornata piovosa veniva duplicata sul giorno successivo se asciutto
 * (il 16/7/2026 aveva 74 stazioni con valori identici al 15/7, ~219mm fantasma).
 */

const https  = require('https');
const fs     = require('fs');
const path   = require('path');

const DATA_DIR      = path.join(__dirname, '../..', 'data', 'toscana');
const COORDS_FILE   = path.join(__dirname, 'toscana-stazioni-coords.json');
const SIR_URL       = 'https://www.sir.toscana.it/monitoraggio/stazioni.php?type=pluvio';

function getItalyOffset(date) {
  const year = date.getUTCFullYear();
  const lastSunMarch = new Date(Date.UTC(year, 2, 31));
  lastSunMarch.setUTCDate(31 - lastSunMarch.getUTCDay());
  const lastSunOct = new Date(Date.UTC(year, 9, 31));
  lastSunOct.setUTCDate(31 - lastSunOct.getUTCDay());
  return (date >= lastSunMarch && date < lastSunOct) ? 2 : 1;
}

function fmtDate(d) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}

function fetchRaw(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'Accept': '*/*',
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

function stripHtml(v) {
  return (v || '').replace(/<\/?b>/gi, '').trim();
}

function parseSirValues(html) {
  const re = /VALUES\[\d+\]\s*=\s*new Array\((.*)\);\s*$/gm;
  const out = [];
  let match;
  while ((match = re.exec(html))) {
    const args = match[1].match(/"((?:[^"\\]|\\.)*)"/g);
    if (!args || args.length < 19) continue;
    const parts = args.map(s => s.slice(1, -1));
    const id      = parts[0];
    const nomeRaw = parts[1];
    const prov    = parts[2];
    const dh24Raw = parts[9];
    const quota   = parseInt(parts[17], 10) || 0;
    if (!id) continue;
    const nome = nomeRaw.replace(/\s*\((RADIO|GPRS|MANUALE)\)\s*$/i, '').trim();
    const val24 = parseFloat(stripHtml(dh24Raw));
    if (isNaN(val24) || val24 < 0 || val24 > 500) continue;
    out.push({ id, nome, prov, quota, mm: Math.round(val24 * 10) / 10 });
  }
  return out;
}

async function main() {
  console.log('=== collect-toscana-sir avviato ===');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  function getTargetDate() {
    if (process.env.DATE_OVERRIDE && process.env.DATE_OVERRIDE.trim()) return process.env.DATE_OVERRIDE.trim();
    const now = new Date();
    const italy = new Date(now.getTime() + getItalyOffset(now) * 3600000);
    return fmtDate(italy);
  }
  const dateStr = getTargetDate();

  console.log('  Carico metadati stazioni (lat/lon) dal file statico...');
  const meta = JSON.parse(fs.readFileSync(COORDS_FILE, 'utf8'));
  console.log(`  Metadati disponibili per ${Object.keys(meta).length} stazioni`);

  console.log('  Fetch valori pioggia (Δ24h) da SIR...');
  const html = await fetchRaw(SIR_URL);
  const sirStations = parseSirValues(html);
  console.log(`  Stazioni SIR con valore Δ24h valido: ${sirStations.length}`);

  const stations = sirStations.map(s => {
    const m = meta[s.id];
    if (!m) return null;
    return { id: s.id, n: s.nome, lat: m.lat, lon: m.lon, q: s.quota, p: s.prov, mm: s.mm };
  }).filter(Boolean);

  console.log(`  Stazioni con dati completi (lat/lon + pioggia): ${stations.length}`);
  if (stations.length < 10) throw new Error(`Troppo poche stazioni: ${stations.length}`);

  const outFile = path.join(DATA_DIR, `${dateStr}.json`);

  // Merge: vince la lettura più recente (Δ24h "scivola" verso il totale di calendario col
  // passare della giornata), con protezione solo sui glitch a 0. MAI max() tra run diversi:
  // trascinerebbe pioggia del giorno precedente in avanti (vedi commento in testa al file).
  // Nei run di chiusura serali la protezione glitch NON si applica: lo 0 a fine giornata
  // è un dato reale, e preservare il valore precedente congelerebbe la pioggia di ieri
  // trascinata dai run del mattino (bug #17, vedi commento in testa al file).
  const nowRun = new Date();
  const italyHour = new Date(nowRun.getTime() + getItalyOffset(nowRun) * 3600000).getUTCHours();
  const isClosing = process.env.CLOSING === '1' || italyHour >= 22;
  let finalStations = stations;
  if (fs.existsSync(outFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(outFile, 'utf8'));
      if (existing.date === dateStr && existing.stations) {
        const existMap = {};
        existing.stations.forEach(s => { existMap[s.id] = s.mm || 0; });
        finalStations = stations.map(s => {
          const prevMM = existMap[s.id] || 0;
          if (!isClosing && s.mm === 0 && prevMM > 0) return { ...s, mm: prevMM };
          return s;
        });
        const newIds = new Set(stations.map(s => s.id));
        existing.stations.forEach(s => {
          if (!newIds.has(s.id) && s.mm > 0) finalStations.push(s);
        });
        console.log(isClosing
          ? '  Merge (run di chiusura: ultima lettura vince, 0 inclusi) applicato'
          : '  Merge (ultima lettura vince, protezione glitch 0) applicato');
      }
    } catch(e) {
      console.warn('  Warn: merge fallito, uso dati nuovi:', e.message);
    }
  }

  fs.writeFileSync(outFile, JSON.stringify({
    date:      dateStr,
    collected: new Date().toISOString(),
    source:    'sir-toscana',
    count:     finalStations.length,
    stations:  finalStations
  }));
  console.log(`✅ Scritto ${outFile} (${finalStations.length} stazioni)`);

  // ── Pulizia file > 730 giorni (retention finestra scorrevole) ──
  const MAX_DAYS = 730;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MAX_DAYS);
  const cutoffStr = cutoff.toISOString().substring(0, 10);
  let deleted = 0;
  fs.readdirSync(DATA_DIR)
    .filter(function(f) { return /^\d{4}-\d{2}-\d{2}\.json$/.test(f); })
    .forEach(function(f) {
      if (f.replace('.json', '') < cutoffStr) {
        fs.unlinkSync(path.join(DATA_DIR, f));
        deleted++;
      }
    });
  if (deleted > 0) console.log('Pulizia retention: ' + deleted + ' file oltre i ' + MAX_DAYS + ' giorni eliminati');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
