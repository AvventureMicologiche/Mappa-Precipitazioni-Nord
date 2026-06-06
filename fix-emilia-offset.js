/**
 * fix-emilia-offset.js
 * Corregge lo sfasamento di +1 giorno nei file storici Emilia.
 * Il file "2026-06-04.json" contiene in realtà i dati meteo del 3 giugno → rinominato a 2026-06-03.json
 * 
 * Eseguire dalla root del repo:
 *   node fix-emilia-offset.js
 * 
 * NON tocca il file 2026-06-05.json e successivi (già corretti dal nuovo collect)
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data', 'emilia');
const CUTOFF = '2026-06-05'; // questo file e successivi sono già corretti

function shiftDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// 1. Leggi tutti i file in memoria
const files = fs.readdirSync(DATA_DIR)
  .filter(f => f.endsWith('.json'))
  .sort();

const toFix = [];
const toKeep = [];

files.forEach(f => {
  const dateStr = f.replace('.json', '');
  if (dateStr < CUTOFF) {
    toFix.push({ oldName: f, oldDate: dateStr, newDate: shiftDate(dateStr) });
  } else {
    toKeep.push(f);
  }
});

console.log(`File da correggere: ${toFix.length}`);
console.log(`File già corretti (non toccati): ${toKeep.length}`);
console.log(`Range correzione: ${toFix[0]?.oldDate} → ${toFix[0]?.newDate}  ...  ${toFix[toFix.length-1]?.oldDate} → ${toFix[toFix.length-1]?.newDate}`);

// 2. Leggi tutti i file da correggere in memoria
const fileData = {};
toFix.forEach(({ oldName, newDate }) => {
  const content = JSON.parse(fs.readFileSync(path.join(DATA_DIR, oldName), 'utf8'));
  content.date = newDate; // aggiorna il campo date interno
  fileData[newDate] = content;
});

// 3. Cancella i file vecchi
toFix.forEach(({ oldName }) => {
  fs.unlinkSync(path.join(DATA_DIR, oldName));
});

// 4. Scrivi i file con i nuovi nomi
let written = 0;
Object.keys(fileData).sort().forEach(newDate => {
  const outPath = path.join(DATA_DIR, newDate + '.json');
  // Non sovrascrivere file già corretti
  if (toKeep.includes(newDate + '.json')) {
    console.log(`  SKIP ${newDate}.json (già corretto)`);
    return;
  }
  fs.writeFileSync(outPath, JSON.stringify(fileData[newDate]), 'utf8');
  written++;
});

console.log(`\nScritti: ${written} file`);
console.log('Il file più vecchio ora è: ' + Object.keys(fileData).sort()[0] + '.json');
console.log('\nDone! Fai commit e push.');
