#!/usr/bin/env python3
"""Controlli in piu' sopra dati.json, aggiunti in fondo a problemi.csv.
Ordine: analizza.py, simili.py, extra.py (dalla radice del repo: cd controlli/seo-31-10 prima)."""
import json, re, csv, os
J = json.load(open('dati.json')); D = J['pagine']; E = J['entrate']
RADICE = os.path.abspath('../..')
uscite = {}
for d, ss in E.items():
    for s in ss: uscite.setdefault(s, set()).add(d)
righe = []
add = lambda u, t, d: righe.append([u, D[u]['fam'] if u in D else '', t, d])
CODICE = re.compile(r"\b[A-Z]{2,}\d*\b|\bSP ?\d+|\bSS\d+|\b[A-Z]+\d+\b| \d+$| \d+ oggi|\bPluvio\b|\bv\.|\bMte\b|\bSup\.|\(|\)| - ")
for u, p in D.items():
    if p['fam'] == 'paese-funghi':
        nome = re.sub(r"^Funghi \S+ ", "", p['title']); nome = re.sub(r" oggi.*$", "", nome)
        if CODICE.search(nome): add(u, 'nome-pluviometro-nel-title', p['title'])
        if re.match(r"Funghi a (Val|Valle) ", p['title']): add(u, 'preposizione', p['title'])
    if p['fam'] in ('regione', 'adesso', 'funghi-indice') and not p['tipi']:
        add(u, 'jsonld-assente', 'nessun BreadcrumbList')
    if p['fam'] in ('meteo-zona', 'meteo-paese'):
        n = len([x for x in uscite.get(u, []) if x not in ('/', '/fonti', '/guida/', '/previsioni/')])
        if n == 0: add(u, 'vicolo-cieco', 'nessun link verso altre pagine del sito (solo /, /fonti, /guida/, /previsioni/)')
pz = json.load(open(os.path.join(RADICE, 'data', 'paesi-zone.json')))
for u, p in D.items():
    if p['fam'] == 'meteo-zona':
        slug = u.strip('/').split('/')[-1]
        nomi = [x['n'] for x in pz.get(slug, [])]
        dentro = [x for x in nomi if x in p['testo']]
        if nomi and len(dentro) < len(nomi) / 2:
            add(u, 'paesi-solo-da-javascript', f"{len(dentro)}/{len(nomi)} nomi dei paesi nell'HTML statico")
for u, p in D.items():
    if p['fam'] in ('regione', 'funghi-regione'):
        if not any(x.startswith('/meteo/') for x in uscite.get(u, [])):
            reg = u.strip('/').split('/')[-1]
            if any(m.startswith('/meteo/' + reg + '/') for m in D) or os.path.exists(os.path.join(RADICE, reg, 'adesso')):
                pass
            add(u, 'nessun-link-a-pagine-meteo', '')
with open('problemi.csv', 'a', newline='', encoding='utf8') as f:
    csv.writer(f).writerows(sorted(righe, key=lambda r: (r[2], r[0])))
from collections import Counter
print(Counter(r[2] for r in righe))
