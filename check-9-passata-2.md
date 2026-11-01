# Check 9, seconda passata (notte 1-2/11/2026, sola lettura)

> Resoconto in costruzione: la parte 1 e' finita, le parti 2, 3 e 4 arrivano nei prossimi commit.

## Parte 1: le pagine generate, controllo statico

Fatto sul ramo `check-9` (uguale a `main` delle 19:02 UTC del 1/11 per tutto quello che non e' `data/`).
Script: `check-9/check1.js` e `check-9/check1b.js` (si lanciano con `node check1.js <repo>`; il primo vuole accanto
`anteprime.txt`, l'elenco dei file del ramo `anteprime`: `git ls-tree -r --name-only origin/anteprime > anteprime.txt`).

Nota sui numeri: nel repo le pagine HTML sono **1.487**, non 14.000 (1.120 sotto `funghi/`, 138 `mappa-forestale/`,
114 `zone/`, 69 `meteo/`, 2 per regione cioe' pagina regione e `adesso/`, piu' mappa, guida, fonti). I 14.000 file
sono il sito intero con dati e tessere. Le cartelle di dati sono escluse dal controllo come pagine, ma contano come
destinazioni dei link.

Cosa e' stato controllato e cosa e' uscito:

| Controllo | Esito |
|---|---|
| `href`/`src`/`srcset` nell'HTML (fuori dagli script) verso il sito, relativi o col dominio | 0 rotti, 0 che passano da un rimando |
| Ogni URL assoluto del dominio scritto ovunque nella pagina (anche dentro script e JSON-LD) | 0 rotti, 0 verso indirizzi rediretti |
| Link costruiti dal JavaScript dei paesi funghi (`anagrafe` di `data/funghi/<regione>-giorni.json`, campo slug) | 985 slug, 0 senza pagina |
| `og:image`, `twitter:image`, `<img>` (anche raw.githubusercontent `anteprime/` e `main/`) | 0 mancanti: 1.392 rimandi al ramo `anteprime` e 1.119 a `main/tessere-boschi`, tutti esistenti |
| `og:url` uguale al canonico, JSON-LD leggibile | tutte le pagine |
| Sitemap: 1.508 indirizzi in 11 file, piu' l'indice `sitemap.xml` con 10 sitemap | 0 rotti, 0 rediretti, 0 `noindex` |
| Pagine indicizzabili fuori da ogni sitemap | 0 (l'unica segnalata, `fonti.html`, sta in sitemap come `/fonti`, che Pages serve) |
| Canonico presente, uno solo, uguale all'indirizzo | tutte le 1.487 (stesso caso `/fonti`) |
| `_redirects`: 111 regole | 0 verso pagine inesistenti, 0 catene, 0 doppie, 0 che coprono un file ancora presente |
| Titoli, descrizioni, `<h1>` doppi fra pagine diverse | 0, 0, 0 |
| `<title>` o `<h1>` vuoti, pagine senza `meta description`, descrizioni sotto 70 caratteri | 0 |
| Testo visibile con `undefined`, `NaN`, `null`, `[object Object]`, «Sila Greca», `/slovenia/` | 0 |
| Rinominati e tolti del 1/11: Sila Greca, `/slovenia/`, meteo Candalla e Val Serina, 19 posti Sicilia, 4 Calabria, 2 Campania | nessuna pagina li linka piu'; ognuno ha la sua regola in `_redirects`, con e senza barra finale |

I riferimenti a «Candalla» e «Val Serina» rimasti (79 e 48 pagine) puntano alle zone funghi e alle carte forestali
`/funghi/zone/candalla/`, `/mappa-forestale/zone/val-serina/` e simili, che esistono: sono state tolte solo le due
pagine meteo.

**Sito vero non raggiungibile da qui**: il proxy dell'ambiente cloud risponde 403 a
`precipitazioni.avventuremicologiche.it`, quindi non ho potuto provare dal vivo i rimandi (`/zone/sila-greca/`,
`/slovenia/`, `/meteo/candalla/`) ne' confrontare le pagine in linea con quelle del repo. Per aprirlo serve
aggiungere il dominio fra gli «Allowed domains» dell'ambiente (menu dell'ambiente nella barra del titolo, Edit;
https://code.claude.com/docs/en/cloud-environments#network-access).

Osservazione, non difetto: `sitemap-paesi-prova.xml` (20 paesi lombardi, prova del 25/10, commit `7048b8936`) non sta
nell'indice `sitemap.xml` ne' in `robots.txt`, quindi Google la legge solo se e' stata inviata a mano in Search
Console; i suoi 20 indirizzi stanno anche in `sitemap-localita.xml` e la sua `lastmod` e' ferma al 20/10. Nessun
generatore la riscrive (non compare in `.github/scripts/`). Se la prova e' finita, si toglie; se no, va bene cosi'.
