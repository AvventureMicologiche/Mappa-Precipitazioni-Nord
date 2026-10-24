/**
 * LA QUOTA DEI PAESI, cotta nelle pagine «Previsioni meteo <zona>» (24/10/2026).
 *
 * Le pagine meteo di zona mettono i paesi dal piu' basso al piu' alto e mandano la quota all'API delle previsioni
 * (le temperature cambiano coi metri). La quota e' l'ALTEZZA DEL TERRENO nel punto del paese, come per le stazioni
 * di quote-terreno.js, e la pagina la scrive col «~» davanti. Il browser non chiede niente a nessuno: si cuoce qui.
 *
 * ⚠️ UN ARCHIVIO, NON UNA CHIAMATA A OGNI GIRO: `quote-paesi.json` accanto a questo file, chiave «lat,lon» del paese
 * (le coordinate di elenco-paesi.txt, tre decimali). Si chiede solo quello che manca, quindi rigenerare le pagine non
 * va in rete se i paesi sono gli stessi.
 *
 * DUE FONTI, nell'ordine:
 *  1. Open-Meteo Elevation (Copernicus DEM GLO-90), la stessa di quote-terreno.js e del campione;
 *  2. se Open-Meteo non risponde (la sessione cloud del 24/10 non lo raggiungeva), le tessere «terrarium» del
 *     modello del terreno di Mapzen/AWS (Terrain Tiles, open data su AWS), lette allo zoom 12 (~30 m di pixel).
 * Ogni voce porta la sua fonte (`f`: om | ter). `QUOTE_RIFAI=1` le richiede tutte da capo.
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const FILE = path.join(__dirname, 'quote-paesi.json');
const chiave = (lat, lon) => (+lat).toFixed(3) + ',' + (+lon).toFixed(3);

async function daOpenMeteo(punti) {
  const out = [];
  for (let i = 0; i < punti.length; i += 50) {   // lotti da 50 come quote-terreno.js: Open-Meteo conta a peso
    const lotto = punti.slice(i, i + 50);
    const r = await fetch('https://api.open-meteo.com/v1/elevation?latitude=' + lotto.map(p => p.lat).join(',')
      + '&longitude=' + lotto.map(p => p.lon).join(','), { signal: AbortSignal.timeout(15000) });
    if (!r.ok) throw new Error('Open-Meteo ' + r.status);
    const j = await r.json();
    if (!j.elevation || j.elevation.length !== lotto.length) throw new Error('Open-Meteo: risposta incompleta');
    j.elevation.forEach(q => out.push(Math.round(q)));
  }
  return out;
}

/* ── le tessere terrarium: PNG RGB, quota = R*256 + G + B/256 - 32768 ── */
function png(buf) {
  let p = 8, w = 0, h = 0, tipo = 0, idat = [];
  while (p < buf.length) {
    const n = buf.readUInt32BE(p), t = buf.toString('ascii', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + n);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); tipo = d[9]; if (d[8] !== 8) throw new Error('PNG a ' + d[8] + ' bit'); }
    else if (t === 'IDAT') idat.push(d);
    p += 12 + n;
  }
  const bpp = tipo === 6 ? 4 : tipo === 2 ? 3 : 0;
  if (!bpp) throw new Error('PNG di tipo ' + tipo);
  const raw = zlib.inflateSync(Buffer.concat(idat)), riga = w * bpp, px = Buffer.alloc(riga * h);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (riga + 1)], src = raw.subarray(y * (riga + 1) + 1, (y + 1) * (riga + 1)), o = y * riga;
    for (let x = 0; x < riga; x++) {
      const a = x >= bpp ? px[o + x - bpp] : 0, b = y ? px[o - riga + x] : 0, c = y && x >= bpp ? px[o - riga + x - bpp] : 0;
      let v = src[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[o + x] = v & 255;
    }
  }
  return { w, bpp, px };
}
async function daTerrarium(punti) {
  const Z = 12, n = 2 ** Z, tessere = new Map(), out = [];
  for (const pt of punti) {
    const x = (pt.lon + 180) / 360 * n, s = Math.sin(pt.lat * Math.PI / 180);
    const y = (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * n;
    const tx = Math.floor(x), ty = Math.floor(y), k = tx + '/' + ty;
    if (!tessere.has(k)) {
      const r = await fetch('https://s3.amazonaws.com/elevation-tiles-prod/terrarium/' + Z + '/' + k + '.png', { signal: AbortSignal.timeout(20000) });
      if (!r.ok) throw new Error('terrarium ' + r.status + ' su ' + k);
      tessere.set(k, png(Buffer.from(await r.arrayBuffer())));
    }
    const t = tessere.get(k), px = Math.min(255, Math.floor((x - tx) * 256)), py = Math.min(255, Math.floor((y - ty) * 256));
    const i = (py * t.w + px) * t.bpp;
    out.push(Math.max(0, Math.round(t.px[i] * 256 + t.px[i + 1] + t.px[i + 2] / 256 - 32768)));
  }
  return out;
}

// punti: [{lat, lon}] → restituisce { "lat,lon": quota } per tutti, chiedendo solo quelli che mancano
async function quotePaesi(punti) {
  const arch = !process.env.QUOTE_RIFAI && fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : {};
  const mancano = [...new Map(punti.filter(p => !arch[chiave(p.lat, p.lon)]).map(p => [chiave(p.lat, p.lon), p])).values()];
  if (mancano.length) {
    let q, f = 'om';
    try { q = await daOpenMeteo(mancano); }
    catch (e) {
      console.log('  quote: Open-Meteo non risponde (' + e.message + '), uso le tessere terrarium');
      q = await daTerrarium(mancano); f = 'ter';
    }
    mancano.forEach((p, i) => { arch[chiave(p.lat, p.lon)] = { q: q[i], f }; });
    const ord = {};
    Object.keys(arch).sort().forEach(k => { ord[k] = arch[k]; });
    fs.writeFileSync(FILE, JSON.stringify(ord, null, 0).replace(/},"/g, '},\n"') + '\n', 'utf8');
    console.log('  quote: ' + mancano.length + ' paesi nuovi (' + f + ')');
  }
  const out = {};
  for (const p of punti) out[chiave(p.lat, p.lon)] = arch[chiave(p.lat, p.lon)].q;
  return out;
}

module.exports = { quotePaesi, chiave };
