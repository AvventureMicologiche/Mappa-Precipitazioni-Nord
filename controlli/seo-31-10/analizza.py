#!/usr/bin/env python3
"""Controllo SEO dei FILE del sito (31/10/2026). Legge tutte le pagine HTML del repo,
le sitemap, robots.txt e _redirects; scrive pagine.csv, doppioni.csv, link-interni.csv,
problemi.csv e dati.json (per il resoconto). Solo lettura: non tocca il sito.
Uso: python3 controlli/seo-31-10/analizza.py   (dalla radice del repo)"""
import os, re, json, csv, html, sys
from html.parser import HTMLParser
from collections import defaultdict, Counter, deque
from urllib.parse import urlparse, unquote

RADICE = os.getcwd()
SITO = 'https://precipitazioni.avventuremicologiche.it'
OUT = os.path.join(RADICE, 'controlli', 'seo-31-10')
REGIONI = set('abruzzo altoadige austria basilicata calabria campania emilia friuli lazio liguria lombardia marche molise piemonte puglia sardegna sicilia slovenia svizzera toscana trentino umbria valledaosta veneto'.split())

def famiglia(u):
    p = [x for x in u.strip('/').split('/') if x]
    if u == '/': return 'mappa'
    if u in ('/fonti', '/guida/'): return 'servizio'
    if len(p) == 1 and p[0] in REGIONI: return 'regione'
    if len(p) == 2 and p[0] in REGIONI and p[1] == 'adesso': return 'adesso'
    if p[0] == 'funghi':
        if len(p) == 1: return 'funghi-indice'
        if p[1] == 'zone': return 'zona-funghi'
        if len(p) == 2: return 'funghi-regione'
        return 'paese-funghi'
    if p[0] == 'zone': return 'zona-piogge'
    if p[0] == 'mappa-forestale':
        if len(p) == 1: return 'forestale-indice'
        if p[1] == 'zone': return 'forestale-zona'
        if p[1] in REGIONI: return 'forestale-regione'
        return 'forestale-tipo'
    if p[0] == 'meteo':
        return 'meteo-paese' if len(p) == 3 else 'meteo-zona'
    return 'altro'

# ---------- stima dei pixel del titolo (Arial 20px, come i titoli di Google) ----------
W = {}
for ch in "ijl.,;:!|'": W[ch] = 4.4
for ch in "ft()[]-/ rI": W[ch] = 6.1
for ch in "sczJ\"": W[ch] = 9.5
for ch in "abdeghknopquvxy0123456789$": W[ch] = 11.1
for ch in "FLTZ": W[ch] = 12.2
for ch in "ABEKPSVXYw": W[ch] = 13.3
for ch in "CDHNRU": W[ch] = 14.4
for ch in "GOQ": W[ch] = 15.6
for ch in "mM": W[ch] = 16.7
W['W'] = 18.9; W['—'] = 20; W['–'] = 11.1; W['·'] = 6.6; W['’'] = 4.4; W['«'] = 11.1; W['»'] = 11.1
def px(s):
    t = 0
    for ch in s:
        c = ch
        if c in 'àáèéìíòóùú': c = 'a'
        elif c in 'ÀÈÉÌÒÙ': c = 'E'
        t += W.get(c, 11.1)
    return round(t)

VUOTI = {'area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr'}
class P(HTMLParser):
    def __init__(s):
        super().__init__(convert_charrefs=True)
        s.title = None; s._in_title = False; s.metas = []; s.links = []; s.lang = None
        s.h = []  # (livello, testo)
        s._hstack = None
        s.anchors = []  # (href, testo, rel)
        s._a = None
        s.imgs = []
        s.jsonld = []; s._jl = None
        s.stack = []  # (tag, nascosto, nascosto_tel)
        s.testo = []; s.testo_tel = []
        s.script_inline = 0; s._scr = False; s.style = []; s._sty = False
        s.script_ext = []
    def nascosto(s):
        return any(x[1] for x in s.stack)
    def nascosto_tel(s):
        return any(x[2] for x in s.stack)
    def handle_starttag(s, tag, attrs):
        a = dict(attrs)
        if tag == 'html': s.lang = a.get('lang')
        if tag == 'meta': s.metas.append(a)
        if tag == 'link': s.links.append(a)
        if tag == 'title' and s.title is None: s._in_title = True; s.title = ''
        if tag == 'img': s.imgs.append(a)
        if tag == 'script':
            if a.get('type') == 'application/ld+json': s._jl = ''
            elif a.get('src'): s.script_ext.append(a)
            else: s._scr = True
        if tag == 'style': s._sty = True
        if tag in ('h1','h2','h3'): s._hstack = [tag, '']
        if tag == 'a': s._a = [a.get('href'), '', a.get('rel'), a.get('aria-label'), a.get('title')]
        if tag in VUOTI: return
        st = (a.get('style') or '').replace(' ', '').lower()
        hid = ('hidden' in a) or 'display:none' in st or tag in ('script','style','template','noscript','svg') or a.get('aria-hidden') == 'true' and False
        cls = set((a.get('class') or '').split())
        hid_tel = bool(cls & CLASSI_NASCOSTE_TEL) or (a.get('id') and a.get('id') in ID_NASCOSTI_TEL)
        s.stack.append((tag, hid, hid_tel))
    def handle_endtag(s, tag):
        if tag == 'title': s._in_title = False
        if tag == 'script':
            if s._jl is not None: s.jsonld.append(s._jl); s._jl = None
            s._scr = False
        if tag == 'style': s._sty = False
        if s._hstack and tag == s._hstack[0]:
            s.h.append((s._hstack[0], re.sub(r'\s+', ' ', s._hstack[1]).strip())); s._hstack = None
        if tag == 'a' and s._a is not None:
            s._a[1] = re.sub(r'\s+', ' ', s._a[1]).strip(); s.anchors.append(tuple(s._a)); s._a = None
        if tag in VUOTI: return
        # chiude fino al tag
        for i in range(len(s.stack) - 1, -1, -1):
            if s.stack[i][0] == tag:
                del s.stack[i:]; break
    def handle_data(s, d):
        if s._in_title: s.title += d
        if s._jl is not None: s._jl += d; return
        if s._scr: s.script_inline += len(d.encode()); return
        if s._sty: s.style.append(d); return
        if s.nascosto(): return
        if s._hstack: s._hstack[1] += d
        if s._a is not None: s._a[1] += d
        s.testo.append(d)
        if not s.nascosto_tel(): s.testo_tel.append(d)

CLASSI_NASCOSTE_TEL = set(); ID_NASCOSTI_TEL = set()
def classi_nascoste_tel(css):
    """classi/id messi a display:none dentro @media (max-width:...) — semplice, regole piatte."""
    cl, ids = set(), set()
    for m in re.finditer(r'@media[^{]*max-width\s*:\s*(\d+)px[^{]*\{((?:[^{}]*\{[^{}]*\})*)\s*\}', css):
        if int(m.group(1)) < 380: continue
        for r in re.finditer(r'([^{}]+)\{([^{}]*)\}', m.group(2)):
            if re.search(r'display\s*:\s*none', r.group(2)):
                for sel in r.group(1).split(','):
                    sel = sel.strip()
                    if re.fullmatch(r'\.[\w-]+', sel): cl.add(sel[1:])
                    elif re.fullmatch(r'#[\w-]+', sel): ids.add(sel[1:])
    return cl, ids

def leggi_sitemap(nome, visti):
    p = os.path.join(RADICE, nome)
    if not os.path.exists(p): return {}
    t = open(p, encoding='utf8').read()
    out = {}
    if '<sitemapindex' in t:
        for loc in re.findall(r'<loc>([^<]+)</loc>', t):
            figlia = loc.replace(SITO + '/', '')
            visti.add(figlia)
            out.update(leggi_sitemap(figlia, visti))
        return out
    for blocco in re.findall(r'<url>(.*?)</url>', t, re.S):
        loc = re.search(r'<loc>([^<]+)</loc>', blocco).group(1)
        lm = re.search(r'<lastmod>([^<]+)</lastmod>', blocco)
        out[loc.replace(SITO, '') or '/'] = (nome, lm.group(1) if lm else '')
    return out

def url_di(rel):
    rel = rel.replace(os.sep, '/')
    if rel == 'index.html': return '/'
    if rel.endswith('/index.html'): return '/' + rel[:-len('index.html')]
    if rel.endswith('.html'): return '/' + rel[:-5]
    return '/' + rel

def norm_href(h, base):
    """porta un href a un percorso del sito ('/x/'), o None se esterno."""
    if not h: return None
    h = html.unescape(h.strip())
    if h.startswith(('mailto:', 'tel:', 'javascript:', '#', 'data:')): return None
    u = urlparse(h)
    if u.scheme in ('http', 'https'):
        if u.netloc != urlparse(SITO).netloc: return None
        path = u.path or '/'
    elif u.scheme: return None
    else:
        if h.startswith('/'): path = u.path or '/'
        else:
            b = base if base.endswith('/') else base.rsplit('/', 1)[0] + '/'
            path = os.path.normpath(b + u.path).replace('\\', '/')
            if u.path.endswith('/') and not path.endswith('/'): path += '/'
            if u.path == '': path = base
    path = unquote(path)
    if path.endswith('/index.html'): path = path[:-10]
    if path.endswith('.html'): path = path[:-5]
    q = u.query
    return path, q

def parole(t):
    return re.findall(r"[0-9A-Za-zÀ-ÿ'’]+", t)

def main():
    files = []
    for d, ds, fs in os.walk(RADICE):
        ds[:] = [x for x in ds if not x.startswith('.') and x not in ('node_modules', 'data', 'controlli', 'novita', 'lib', 'luoghi', 'tessere-boschi', 'functions', 'netlify')]
        for f in fs:
            if f.endswith('.html'): files.append(os.path.relpath(os.path.join(d, f), RADICE))
    visti_sm = set()
    sm = leggi_sitemap('sitemap.xml', visti_sm)
    sm_prova = leggi_sitemap('sitemap-paesi-prova.xml', set())
    redirects = {}
    for r in open(os.path.join(RADICE, '_redirects'), encoding='utf8'):
        r = r.strip()
        if r and not r.startswith('#'):
            x = r.split()
            if len(x) >= 2: redirects[x[0]] = x[1]
    pagine = {}
    for rel in sorted(files):
        raw = open(os.path.join(RADICE, rel), 'rb').read()
        t = raw.decode('utf8', 'replace')
        global CLASSI_NASCOSTE_TEL, ID_NASCOSTI_TEL
        css = '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', t, re.S))
        CLASSI_NASCOSTE_TEL, ID_NASCOSTI_TEL = classi_nascoste_tel(css)
        p = P(); p.feed(t)
        u = url_di(rel)
        m = {}
        for a in p.metas:
            k = a.get('name') or a.get('property')
            if k and k not in m: m[k] = a.get('content', '')
        can = [l.get('href') for l in p.links if (l.get('rel') or '').lower() == 'canonical']
        jl = []; jlerr = []
        for b in p.jsonld:
            try:
                o = json.loads(b); jl.append(o)
            except Exception as e: jlerr.append(str(e)[:80])
        tipi = []
        def tipi_di(o):
            if isinstance(o, dict):
                if '@type' in o: tipi.append(o['@type'] if isinstance(o['@type'], str) else ','.join(o['@type']))
                for v in o.values(): tipi_di(v)
            elif isinstance(o, list):
                for v in o: tipi_di(v)
        for o in jl: tipi_di(o)
        testo = re.sub(r'\s+', ' ', ' '.join(p.testo)).strip()
        testo_tel = re.sub(r'\s+', ' ', ' '.join(p.testo_tel)).strip()
        ink = []
        for href, at, rel_, aria, tit in p.anchors:
            n = norm_href(href, u)
            if n: ink.append((n[0], n[1], at or aria or tit or '', rel_ or ''))
        pagine[u] = dict(file=rel, url=u, fam=famiglia(u), bytes=len(raw), title=html.unescape((p.title or '').strip()),
            desc=m.get('description'), robots=m.get('robots', ''), canonical=can, og_url=m.get('og:url'), og_image=m.get('og:image'),
            og_title=m.get('og:title'), og_desc=m.get('og:description'), tw_image=m.get('twitter:image'), lang=p.lang,
            h=p.h, jsonld=jl, jlerr=jlerr, tipi=tipi, testo=testo, testo_tel=testo_tel, links=ink,
            imgs=p.imgs, script_inline=p.script_inline, script_ext=[(a.get('src'), 'async' in a or 'defer' in a or a.get('type') == 'module') for a in p.script_ext],
            insitemap=sm.get(u), crlf=b'\r\n' in raw[:2000])
    # ---------- grafo dei link ----------
    entrate = defaultdict(set); ancore = defaultdict(Counter); rotti = []
    for u, pg in pagine.items():
        for path, q, at, rel_ in pg['links']:
            dest = path
            if dest not in pagine and dest + '/' in pagine: dest = dest + '/'
            if dest in redirects: dest = redirects[dest]
            if dest in pagine:
                if dest != u: entrate[dest].add(u)
                ancore[dest][at[:80]] += 1
            elif dest in ('/previsioni/', '/previsioni', '/meteo/', '/meteo'):
                ancore[dest][at[:80]] += 1; entrate[dest].add(u)
            else:
                ext = os.path.splitext(dest)[1]
                if ext in ('', '.html') and not dest.startswith(('/api', '/data', '/.netlify')):
                    rotti.append((u, dest, at[:60]))
    # profondita' (solo link senza query o con query verso / = mappa)
    prof = {'/': 0}; dq = deque(['/'])
    while dq:
        x = dq.popleft()
        if x not in pagine: continue
        for path, q, at, rel_ in pagine[x]['links']:
            dest = path if path in pagine else (path + '/' if path + '/' in pagine else path)
            if dest in redirects: dest = redirects[dest]
            if dest in pagine and dest not in prof:
                prof[dest] = prof[x] + 1; dq.append(dest)
    for u, pg in pagine.items():
        pg['in'] = len(entrate[u]); pg['prof'] = prof.get(u)
        pg['in_da_fam'] = Counter(pagine[x]['fam'] for x in entrate[u])
    # ---------- scrive ----------
    def can_ok(pg):
        c = pg['canonical']
        return len(c) == 1 and c[0] == SITO + pg['url']
    with open(os.path.join(OUT, 'pagine.csv'), 'w', newline='', encoding='utf8') as f:
        w = csv.writer(f)
        w.writerow(['url','famiglia','title','title_car','title_px','description','desc_car','h1','n_h1','parole_statiche','parole_telefono','link_in_entrata','profondita','in_sitemap','lastmod','canonical_ok','kb'])
        for u, pg in sorted(pagine.items(), key=lambda x: (x[1]['fam'], x[0])):
            h1 = [t for l, t in pg['h'] if l == 'h1']
            w.writerow([u, pg['fam'], pg['title'], len(pg['title']), px(pg['title']), pg['desc'] or '', len(pg['desc'] or ''), ' | '.join(h1), len(h1),
                len(parole(pg['testo'])), len(parole(pg['testo_tel'])), pg['in'], pg['prof'] if pg['prof'] is not None else '', 'si' if pg['insitemap'] else ('prova' if u in sm_prova else 'no'),
                pg['insitemap'][1] if pg['insitemap'] else '', 'si' if can_ok(pg) else 'NO', round(pg['bytes'] / 1024)])
    # doppioni
    dop = []
    for campo in ('title', 'desc'):
        c = defaultdict(list)
        for u, pg in pagine.items():
            if pg[campo]: c[pg[campo].strip().lower()].append(u)
        for k, v in c.items():
            if len(v) > 1: dop.append([campo, 'esatto', len(v), k, ' '.join(sorted(v))])
    # quasi doppioni di titolo su stesso luogo fra famiglie (slug finale)
    perslug = defaultdict(list)
    for u, pg in pagine.items():
        if pg['fam'] in ('zona-piogge','zona-funghi','meteo-zona','forestale-zona','paese-funghi','meteo-paese'):
            perslug[u.strip('/').split('/')[-1]].append(u)
    for s, v in perslug.items():
        if len(v) > 1:
            dop.append(['stesso-luogo', 'famiglie diverse', len(v), s, ' || '.join(f"{x} = {pagine[x]['title']}" for x in sorted(v))])
    with open(os.path.join(OUT, 'doppioni.csv'), 'w', newline='', encoding='utf8') as f:
        w = csv.writer(f); w.writerow(['campo','tipo','quante','testo','pagine']); w.writerows(sorted(dop, key=lambda r: (r[0], -r[2])))
    with open(os.path.join(OUT, 'link-interni.csv'), 'w', newline='', encoding='utf8') as f:
        w = csv.writer(f); w.writerow(['url','famiglia','link_in_entrata','da_famiglie','profondita','ancore_principali'])
        for u, pg in sorted(pagine.items(), key=lambda x: x[1]['in']):
            w.writerow([u, pg['fam'], pg['in'], '; '.join(f'{k}:{v}' for k, v in pg['in_da_fam'].most_common()), pg['prof'] if pg['prof'] is not None else 'irraggiungibile',
                        ' | '.join(f'{k} ({v})' for k, v in ancore[u].most_common(4))])
    # problemi
    pr = []
    def add(u, tipo, det): pr.append([u, pagine[u]['fam'] if u in pagine else '', tipo, det])
    for u, pg in pagine.items():
        if not pg['title']: add(u, 'title-mancante', '')
        elif px(pg['title']) > 580: add(u, 'title-lungo', f"{len(pg['title'])} car, ~{px(pg['title'])} px")
        if not pg['desc']: add(u, 'description-mancante', '')
        elif len(pg['desc']) > 160: add(u, 'description-lunga', f"{len(pg['desc'])} car")
        elif len(pg['desc']) < 70: add(u, 'description-corta', f"{len(pg['desc'])} car")
        h1 = [t for l, t in pg['h'] if l == 'h1']
        if len(h1) != 1: add(u, 'h1-non-uno', f'{len(h1)}: ' + ' | '.join(h1)[:150])
        if not can_ok(pg): add(u, 'canonical', str(pg['canonical']))
        if pg['og_url'] and pg['og_url'] != SITO + pg['url']: add(u, 'og-url-diverso', pg['og_url'])
        if not pg['og_url']: add(u, 'og-url-mancante', '')
        if not pg['og_image']: add(u, 'og-image-mancante', '')
        if pg['lang'] != 'it': add(u, 'lang', str(pg['lang']))
        if 'noindex' in pg['robots']: add(u, 'noindex', pg['robots'])
        if pg['jlerr']: add(u, 'jsonld-errore', '; '.join(pg['jlerr']))
        if not pg['insitemap'] and u not in sm_prova: add(u, 'fuori-sitemap', '')
        if pg['in'] == 0 and u != '/': add(u, 'orfana', 'nessun link da altre pagine')
        elif pg['in'] <= 2 and u != '/': add(u, 'pochi-link', f"{pg['in']} link")
        if pg['prof'] is None and u != '/': add(u, 'irraggiungibile-da-home', '')
        elif pg['prof'] and pg['prof'] > 4: add(u, 'profonda', f"{pg['prof']} clic")
        for im in pg['imgs']:
            if im.get('alt') is None: add(u, 'img-senza-alt', im.get('src', '')[:80])
            if not im.get('width') or not im.get('height'): add(u, 'img-senza-dimensioni', im.get('src', '')[:80])
        if pg['og_image']:
            oi = pg['og_image'].split('?')[0].replace(SITO, '')
            if oi.startswith('/') and not os.path.exists(os.path.join(RADICE, oi.lstrip('/'))) and 'raw.githubusercontent' not in pg['og_image']:
                add(u, 'og-image-file-assente', pg['og_image'])
    for u, (nome, lm) in sm.items():
        if u not in pagine and u not in ('/previsioni/',): pr.append([u, '', 'sitemap-senza-file', nome])
    for u, d, at in rotti: add(u, 'link-a-pagina-inesistente', f'{d} «{at}»')
    with open(os.path.join(OUT, 'problemi.csv'), 'w', newline='', encoding='utf8') as f:
        w = csv.writer(f); w.writerow(['url','famiglia','problema','dettaglio']); w.writerows(sorted(pr, key=lambda r: (r[2], r[0])))
    # dati per il resoconto
    ridotto = {u: {k: v for k, v in pg.items() if k not in ('links', 'testo_tel', 'imgs')} for u, pg in pagine.items()}
    for u in ridotto: ridotto[u]['testo'] = ridotto[u]['testo'][:20000]; ridotto[u]['in_da_fam'] = dict(pagine[u]['in_da_fam']); ridotto[u]['parole'] = len(parole(pagine[u]['testo'])); ridotto[u]['parole_tel'] = len(parole(pagine[u]['testo_tel']))
    json.dump({'pagine': ridotto, 'sitemap': sm, 'sitemap_figlie': sorted(visti_sm), 'prova': list(sm_prova), 'ancore': {u: dict(c.most_common(15)) for u, c in ancore.items()}, 'entrate': {u: sorted(v) for u, v in entrate.items()}},
              open(os.path.join(OUT, 'dati.json'), 'w', encoding='utf8'), ensure_ascii=False)
    print(len(pagine), 'pagine;', len(pr), 'problemi;', len(dop), 'righe doppioni;', len(rotti), 'link rotti')
    print(Counter(pg['fam'] for pg in pagine.values()))
    print(Counter(r[2] for r in pr).most_common())

if __name__ == '__main__': main()
