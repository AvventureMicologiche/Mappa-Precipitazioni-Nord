// Parte 1: controllo statico delle pagine. Sola lettura del repo.
const fs = require('fs'), path = require('path');
const REPO = process.argv[2];
const SP = path.dirname(__filename);
const DOM = 'precipitazioni.avventuremicologiche.it';
const FUORI = new Set(['.git', '.github', '.netlify', '.claude', 'netlify', 'prove', '_pages', 'node_modules', 'functions', '.wrangler', '_anteprime-prova']);
const FILE_FUORI = /^(netlify\.toml|.*\.md|backfill-.*\.js|populate-history.*\.js|diagnose-.*\.js|_headers|_redirects|alert-mail\.eml|\.gitattributes|\.gitignore)$/;
const files = new Set(); const htmls = [];
(function walk(d, rel) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) { if (!rel && FUORI.has(e.name)) continue; if (r === 'tessere-boschi/italia') { files.add('tessere-boschi/italia/'); continue; } walk(path.join(d, e.name), r); continue; }
    if (!rel && FILE_FUORI.test(e.name)) continue;
    files.add(r);
    if (e.name.endsWith('.html') && !r.startsWith('data/')) htmls.push(r);
  }
})(REPO, '');
// tessere-boschi/italia: non pubblicate, ma esistono nel repo
const tessereRepo = fs.existsSync(path.join(REPO, 'tessere-boschi/italia'));
const anteprime = new Set(fs.readFileSync(path.join(SP, 'anteprime.txt'), 'utf8').split('\n').filter(Boolean));
// funzioni Pages
const funzioni = ['/api/cerca', '/api/previsioni', '/previsioni/', '/previsioni'];
// _redirects
const redir = [];
fs.readFileSync(path.join(REPO, '_redirects'), 'utf8').replace(/\r/g, '').split('\n').forEach((l, i) => {
  l = l.trim(); if (!l || l[0] === '#') return; const p = l.split(/\s+/); redir.push({ from: p[0], to: p[1], st: p[2] || '302', riga: i + 1 });
});
redir.unshift({ from: '/index-5.html', to: '/', st: '301', riga: 0 });
function trovaRedir(p) { for (const r of redir) { if (r.from === p) return r; if (r.from.includes('*')) { const re = new RegExp('^' + r.from.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'); if (re.test(p)) return r; } } return null; }
// esiste come pagina servita da Pages? ritorna 'ok' | 'slash' (Pages aggiunge lo slash) | null
function esiste(p) {
  let q = decodeURIComponent(p);
  if (funzioni.includes(q)) return 'ok';
  if (q === '/') return files.has('index.html') ? 'ok' : null;
  const r = q.replace(/^\//, '');
  if (r.startsWith('tessere-boschi/italia/')) return tessereRepo ? 'ok' : null;
  if (q.endsWith('/')) return files.has(r + 'index.html') ? 'ok' : null;
  if (files.has(r)) return 'ok';
  if (files.has(r + '/index.html')) return 'slash';
  if (files.has(r + '.html')) return 'ok';
  return null;
}
function risolvi(p) { // segue i rediretti: {fin, catena, rotto}
  const catena = []; let cur = p;
  for (let k = 0; k < 6; k++) {
    const r = trovaRedir(cur);
    if (r) { catena.push(r); let to = r.to; if (/^https?:/.test(to)) { const u = new URL(to); if (u.host !== DOM) return { fin: to, catena, ext: true }; to = u.pathname + u.search; } cur = to.split('?')[0].split('#')[0]; continue; }
    const e = esiste(cur); return { fin: cur, catena, ok: !!e, slash: e === 'slash' };
  }
  return { fin: cur, catena, loop: true };
}
const famiglia = f => {
  const s = f.split('/');
  if (f === 'index.html') return 'mappa';
  if (s[0] === 'funghi') { if (s[1] === 'zone') return 'funghi/zone'; if (s.length === 2) return 'funghi/indice'; if (s.length === 3) return 'funghi/regione'; return 'funghi/paese'; }
  if (s[0] === 'meteo') return s.length === 3 ? 'meteo/zona-o-paese' : 'meteo/' + s.length;
  if (s[0] === 'mappa-forestale') return 'mappa-forestale/' + (s[1] === 'zone' ? 'zone' : s.length === 2 ? 'indice' : 'regione');
  if (s[0] === 'zone') return 'zone-piogge';
  if (s.length === 2) return 'regione'; if (s.length === 3) return 'regione/' + s[1];
  return s[0];
};
const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const rotti = [], immagini = [], externals = {}, pageInfo = {};
const attrRe = /<(a|link|img|script|source|iframe|meta)\b([^>]*)>/gi;
for (const f of htmls) {
  const html = fs.readFileSync(path.join(REPO, f), 'utf8');
  const url = '/' + f.replace(/index\.html$/, '');
  const fam = famiglia(f);
  const info = pageInfo[f] = { url, fam };
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i); info.title = t ? decode(t[1].trim()) : null;
  const d = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i); info.desc = d ? decode(d[1].trim()) : null;
  const h = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i); info.h1 = h ? h[1].replace(/<[^>]+>/g, '').trim() : null;
  const c = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i) || html.match(/<link\s+href="([^"]*)"\s+rel="canonical"/i); info.canon = c ? c[1] : null;
  info.nCanon = (html.match(/rel="canonical"/g) || []).length;
  info.noindex = /<meta\s+name="robots"\s+content="[^"]*noindex/i.test(html);
  // via gli script inline per gli attributi? no: gli href stanno fuori. Togliamo <script>..</script> per non leggere stringhe JS
  const senzaScript = html.replace(/<script\b(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  let m; attrRe.lastIndex = 0;
  while ((m = attrRe.exec(senzaScript))) {
    const tag = m[1].toLowerCase(), at = m[2];
    const vals = [];
    const get = n => { const r = new RegExp('\\b' + n + '\\s*=\\s*"([^"]*)"', 'i').exec(at) || new RegExp('\\b' + n + "\\s*=\\s*'([^']*)'", 'i').exec(at); return r ? decode(r[1]) : null; };
    if (tag === 'meta') { const p = get('property') || get('name') || ''; if (/^(og:image|twitter:image|og:url)$/i.test(p)) vals.push([p, get('content')]); }
    else { for (const n of ['href', 'src']) { const v = get(n); if (v != null) vals.push([tag + ' ' + n, v]); } const ss = get('srcset'); if (ss) ss.split(',').forEach(x => vals.push([tag + ' srcset', x.trim().split(/\s+/)[0]])); }
    for (const [kind, v0] of vals) {
      if (v0 == null) continue; let v = v0.trim();
      if (!v || /^(#|mailto:|tel:|javascript:|data:|whatsapp:)/i.test(v)) continue;
      if (v.includes('{') || v.includes('${')) continue;
      let p;
      if (/^https?:\/\//i.test(v) || v.startsWith('//')) {
        const u = new URL(v.startsWith('//') ? 'https:' + v : v);
        if (u.host === DOM || u.host === 'www.' + DOM) p = u.pathname;
        else if (u.host === 'raw.githubusercontent.com' || u.host === 'cdn.jsdelivr.net') {
          let mm = u.pathname.match(/^\/AvventureMicologiche\/Mappa-Precipitazioni-Nord\/([^/]+)\/(.*)$/i) || u.pathname.match(/^\/gh\/AvventureMicologiche\/Mappa-Precipitazioni-Nord@([^/]+)\/(.*)$/i);
          if (mm) {
            const ramo = mm[1], rp = decodeURIComponent(mm[2]);
            let ok = ramo === 'anteprime' ? anteprime.has(rp) : ramo === 'main' ? (files.has(rp) || (rp.startsWith('tessere-boschi/italia/') && tessereRepo) || fs.existsSync(path.join(REPO, rp))) : null;
            if (ok === false) immagini.push({ f, fam, kind, v, causa: 'manca sul ramo ' + ramo });
            externals[u.host + ' ' + ramo] = (externals[u.host + ' ' + ramo] || 0) + 1;
          } else externals[u.host + ' altro-repo'] = (externals[u.host + ' altro-repo'] || 0) + 1;
          continue;
        } else continue;
      } else p = new URL(v, 'https://' + DOM + url).pathname;
      p = p.replace(/\/\/+/g, '/');
      const ris = risolvi(p);
      const imm = /img|og:image|twitter:image|srcset/.test(kind);
      if (!ris.ok && !ris.ext) (imm ? immagini : rotti).push({ f, fam, kind, v, p, catena: ris.catena.map(r => r.riga), fin: ris.fin, loop: ris.loop });
      else if (ris.catena.length) (info.viaRedir = info.viaRedir || []).push({ kind, v, righe: ris.catena.map(r => r.riga), fin: ris.fin, n: ris.catena.length });
      else if (ris.slash) (info.senzaSlash = info.senzaSlash || []).push(v);
    }
  }
}
// ---- sitemap
const sm = {}; const inSitemap = new Map();
for (const s of fs.readdirSync(REPO).filter(x => /^sitemap.*\.xml$/.test(x))) {
  const x = fs.readFileSync(path.join(REPO, s), 'utf8');
  const locs = [...x.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map(m => m[1]);
  sm[s] = { n: locs.length, rotti: [], redir: [], noindex: [], doppi: [], indice: /<sitemapindex/.test(x) };
  for (const l of locs) {
    const u = new URL(l.replace(/&amp;/g, '&'));
    if (u.host !== DOM) { sm[s].rotti.push(l + ' (dominio ' + u.host + ')'); continue; }
    if (inSitemap.has(u.pathname)) sm[s].doppi.push(l + ' anche in ' + inSitemap.get(u.pathname));
    if (!sm[s].indice) inSitemap.set(u.pathname, s);
    if (sm[s].indice) { if (!files.has(u.pathname.slice(1))) sm[s].rotti.push(l); continue; }
    const r = risolvi(u.pathname);
    if (r.catena.length) sm[s].redir.push(l + ' -> ' + r.fin);
    else if (!r.ok) sm[s].rotti.push(l);
    else if (r.slash) sm[s].redir.push(l + ' (senza slash, Pages rimanda)');
    else { const f = u.pathname.endsWith('/') ? u.pathname.slice(1) + 'index.html' : u.pathname.slice(1); if (pageInfo[f] && pageInfo[f].noindex) sm[s].noindex.push(l); }
  }
}
// sitemap indice: che elenchi tutte le sitemap
const indiceTxt = fs.readFileSync(path.join(REPO, 'sitemap.xml'), 'utf8');
const nonInIndice = Object.keys(sm).filter(s => s !== 'sitemap.xml' && !indiceTxt.includes('/' + s));
// pagine indicizzabili fuori dalle sitemap
const fuoriSitemap = [];
for (const f of htmls) { const i = pageInfo[f]; if (i.noindex) continue; if (!inSitemap.has(i.url)) fuoriSitemap.push(f); }
// ---- canonical
const canon = { manca: [], diverso: [], rediretto: [], doppio: [], nonAssoluto: [] };
for (const f of htmls) {
  const i = pageInfo[f];
  if (i.nCanon > 1) canon.doppio.push(f);
  if (!i.canon) { canon.manca.push(f + (i.noindex ? ' (noindex)' : '')); continue; }
  if (!/^https:\/\//.test(i.canon)) canon.nonAssoluto.push(f + ' ' + i.canon);
  let u; try { u = new URL(i.canon, 'https://' + DOM + i.url); } catch (e) { canon.diverso.push(f + ' ' + i.canon); continue; }
  if (u.host !== DOM || u.pathname !== i.url) { const r = risolvi(u.pathname); canon.diverso.push(f + ' -> ' + i.canon + (i.noindex ? ' [noindex]' : '') + (r.catena.length ? ' [rediretto a ' + r.fin + ']' : !r.ok ? ' [NON ESISTE]' : '')); continue; }
  const r = risolvi(u.pathname); if (r.catena.length) canon.rediretto.push(f + ' -> ' + r.fin);
}
// ---- _redirects
const red = { versoNulla: [], catene: [], doppie: [], ombra: [], daEsistente: [] };
const visti = new Map();
for (const r of redir) {
  if (visti.has(r.from)) red.doppie.push(`riga ${r.riga} ${r.from} (gia' a riga ${visti.get(r.from).riga}${visti.get(r.from).to !== r.to ? ', DESTINAZIONE DIVERSA ' + visti.get(r.from).to + ' / ' + r.to : ''})`);
  else visti.set(r.from, r);
  if (/^https?:/.test(r.to)) continue;
  const to = r.to.split('?')[0];
  if (to === '/' && r.to.includes('?')) { /* mappa con parametro */ }
  const rr = trovaRedir(to);
  if (rr) red.catene.push(`riga ${r.riga} ${r.from} -> ${r.to} -> (riga ${rr.riga}) ${rr.to}`);
  else if (!esiste(to)) red.versoNulla.push(`riga ${r.riga} ${r.from} -> ${r.to}`);
  else if (esiste(to) === 'slash') red.catene.push(`riga ${r.riga} ${r.from} -> ${r.to} (senza slash: Pages rimanda ancora a ${to}/)`);
  if (esiste(r.from)) red.daEsistente.push(`riga ${r.riga} ${r.from} esiste ancora come file (Pages: il file vince? no, _redirects vince sui file statici solo se... vedi nota)`);
}
// ---- titoli, descrizioni
const dup = (k) => { const m = new Map(); for (const f of htmls) { const v = pageInfo[f][k]; if (!v) continue; if (!m.has(v)) m.set(v, []); m.get(v).push(f); } return [...m].filter(([, a]) => a.length > 1); };
const vuoti = { titleVuoto: htmls.filter(f => !pageInfo[f].title), h1Vuoto: htmls.filter(f => !pageInfo[f].h1), senzaDesc: htmls.filter(f => !pageInfo[f].desc), descCorta: htmls.filter(f => pageInfo[f].desc && pageInfo[f].desc.length < 70).map(f => f + ' (' + pageInfo[f].desc.length + ')'), titleLungo: htmls.filter(f => pageInfo[f].title && pageInfo[f].title.length > 70).length };
const out = { nHtml: htmls.length, rotti, immagini, externals, sm, nonInIndice, fuoriSitemap, canon, red, dupTitle: dup('title'), dupDesc: dup('desc'), dupH1: dup('h1'), vuoti,
  viaRedir: htmls.filter(f => pageInfo[f].viaRedir).map(f => ({ f, l: pageInfo[f].viaRedir })), senzaSlash: htmls.filter(f => pageInfo[f].senzaSlash).map(f => ({ f, l: pageInfo[f].senzaSlash })) };
fs.writeFileSync(path.join(SP, 'parte1.json'), JSON.stringify(out, null, 1));
fs.writeFileSync(path.join(SP, 'pageinfo.json'), JSON.stringify(pageInfo));
const grp = (arr, key) => { const m = {}; for (const x of arr) { const k = key(x); m[k] = (m[k] || 0) + 1; } return m; };
console.log('html', htmls.length);
console.log('rotti', rotti.length, JSON.stringify(grp(rotti, x => x.fam + ' | ' + x.p)).slice(0, 4000));
console.log('immagini', immagini.length, JSON.stringify(grp(immagini, x => x.fam + ' | ' + (x.p || x.v))).slice(0, 3000));
console.log('externals', JSON.stringify(externals));
for (const s in sm) console.log(s, sm[s].n, 'rotti', sm[s].rotti.length, 'redir', sm[s].redir.length, 'noindex', sm[s].noindex.length, 'doppi', sm[s].doppi.length);
console.log('nonInIndice', nonInIndice, 'fuoriSitemap', fuoriSitemap.length, JSON.stringify(grp(fuoriSitemap, famiglia)));
console.log('canon', Object.fromEntries(Object.entries(canon).map(([k, v]) => [k, v.length])));
console.log('red', Object.fromEntries(Object.entries(red).map(([k, v]) => [k, v.length])));
console.log('dupTitle', out.dupTitle.length, 'dupDesc', out.dupDesc.length, 'dupH1', out.dupH1.length, 'vuoti', JSON.stringify(Object.fromEntries(Object.entries(vuoti).map(([k, v]) => [k, Array.isArray(v) ? v.length : v]))));
console.log('viaRedir pagine', out.viaRedir.length, 'senzaSlash pagine', out.senzaSlash.length);
