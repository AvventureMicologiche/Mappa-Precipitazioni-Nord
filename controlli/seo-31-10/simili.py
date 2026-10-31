#!/usr/bin/env python3
"""Quota di testo statico "da modello" per famiglia: frazione delle sequenze di 6 parole
di una pagina che compaiono in almeno meta' delle pagine della stessa famiglia.
I numeri sono sostituiti da # (cosi' «12 mm» e «40 mm» contano uguali). Legge dati.json."""
import json, re, statistics as st, sys
from collections import Counter, defaultdict
D = json.load(open(sys.argv[1] if len(sys.argv) > 1 else 'dati.json'))['pagine']
def sh(t):
    w = [re.sub(r'\d+([.,]\d+)?', '#', x.lower()) for x in re.findall(r"[0-9A-Za-zÀ-ÿ'’,.]+", t)]
    return set(' '.join(w[i:i+6]) for i in range(max(0, len(w) - 5)))
fam = defaultdict(list)
for u, p in D.items(): fam[p['fam']].append((u, sh(p['testo'])))
out = {}
for f, v in sorted(fam.items()):
    if len(v) < 3: continue
    df = Counter(); [df.update(s) for _, s in v]
    soglia = len(v) / 2
    q = [(sum(1 for x in s if df[x] >= soglia) / max(1, len(s)), u, len(s)) for u, s in v]
    qq = [x[0] for x in q]
    out[f] = dict(n=len(v), mediana=round(st.median(qq) * 100), max=round(max(qq) * 100), min=round(min(qq) * 100),
                  peggiori=[(u, round(a * 100)) for a, u, _ in sorted(q, reverse=True)[:3]])
    print(f"{f:18} {len(v):4} pagine  testo da modello: mediana {out[f]['mediana']}%  min {out[f]['min']}%  max {out[f]['max']}%  {out[f]['peggiori'][:2]}")
json.dump(out, open('simili.json', 'w'), ensure_ascii=False, indent=1)
