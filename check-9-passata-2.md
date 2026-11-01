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

## Parte 3: le cause dei problemi di dati della prima passata

Le fonti in diretta (OASI, ARPAV, MeteoHub) non rispondono dal cloud: il proxy dell'ambiente dà 403. Le prove
vengono dalla storia git di `data/` (versioni successive dello stesso file) e dai log delle esecuzioni GitHub Actions.
Ho ricontrollato io nelle versioni dei file i valori di Biasca e Castana e il codice citato.

**1. Biasca Val Pontirone, `data/ticino/2026-10-27.json`, 84,4 mm: errore della stazione OASI, non del collector.**
Sicurezza alta.
- Il valore c'e' identico in tutte e sei le versioni del file (dal giro delle 03:32 UTC del 28/10, commit
  `9b27ab90d`, a quello delle 16:19 del 29/10, `c8d85b53f`). Il primo giro lo ha fatto con la somma dei dati a
  10 minuti (il giornaliero OASI non era ancora uscito), quello delle 16:12 del 28/10 col giornaliero ufficiale:
  stesso 84,4. Due vie diverse che danno lo stesso numero vogliono dire che la pioggia sta nelle letture grezze.
- Il commit `ad9a04707` non c'entra: periodi sovrapposti, accumulato al posto dell'incremento, unita' e ora di
  confine scartati (una riga per data, filtro `r.date === g`; dopo il cambio d'ora i bordi coincidono col giorno
  italiano). Un confronto con i vicini entro 15 km su tutto ottobre trova solo questo caso in Ticino.
- Correzione proposta: togliere la stazione `meteo_u_122` dal file del 27/10 (assente, non a zero). I giri
  automatici quel giorno non lo riscrivono piu'.

**2. Castana, `data/veneto/2026-10-30.json`, 29,8 mm: errore della stazione ARPAV.** Sicurezza alta.
- E' la Castana di Arsiero (VI), id 68, 420 m, non l'Oltrepo'. Il valore cresce nella giornata come una pioggia
  vera nell'XML di ARPAV: 0 alle 03:30 (`43acfc7fd`), 20 alle 10:49 (`372d3cd4d`), 29,8 alle 17:59 (`028bd60e5`), poi
  resta 29,8. E' la somma degli incrementi di `totalePrecGiorno` (`collect-veneto.js` righe 96-106), cioe' la fonte.
  Gli 8 vicini entro 15 km sono a 0, il resto del Veneto sotto 0,4 mm. Nel mese c'e' un caso simile, Gallio il
  9/10 (17,4 mm).
- Correzione proposta: togliere la stazione 68 dal file del 30/10.

**Proposta comune per 1 e 2, da decidere con lui (regola 10):** `togliPicchiFalsi` di MeteoHub scatta solo da 200 mm.
Una prova con soglia 20 mm e vicini della stessa rete tutti sotto 1 mm (almeno 2 entro 5 km o 3 entro 15 km), su
61 giorni di 11 reti del nord, prende 7 casi: Biasca, Castana, Bertonico (Lombardia, 17/9) e quattro stazioni
toscane da guardare una per una. Due casi veri in un mese, funzione gia' scritta: il costo e' basso, ma la
decisione e' sua. Sicurezza media sul fatto che non scarti piogge vere (temporali isolati d'estate).

**3. Puglia 26-29/10 stimata: buco di MeteoHub, il collector riprova da solo.**
- Oggi 26-29/10 sono `open-meteo-gapfill`, 131 stazioni stimate su 131; il 30/10 ha 60 vere e 71 stimate; il 31/10
  e' tornato intero (130 vere). `data/meteohub-gaps.json` segna 0 stazioni viste su 127 nei quattro giorni.
- Il giro delle 17:15 UTC del 1/11 (run 41330524710) scrive «contiene stime, riprovo» per ogni giorno: MeteoHub,
  interrogato con l'account, restituisce una stazione sola per giorno. Per il 30/10: «60 < soglia 114, tengo il file
  con le stime».
- Fino a quando: la riparazione automatica guarda da 3 a 9 giorni indietro (`collect-meteohub.js` righe 605-625).
  Il 26 si riprova fino al 4/11, il 29 fino al 7/11, il 30 fino all'8/11.
- Perche' i dati veri rientrino: MeteoHub deve ricaricare la Puglia di quei giorni, e la raccolta deve superare la
  soglia (114), se no `writeDay` tiene le stime. Se arrivano dopo i 9 giorni, basta un lancio a mano di
  `meteohub.yml` con `date_override=2026-10-26:2026-10-30`.
- Proposta (bassa): col giro autenticato la finestra dei 10 giorni pubblici non vale; si puo' allargare la
  riparazione a circa 20 giorni. Il 26-29/10 sta oltre la frontiera del centro-sud (19/7), quindi per la regola 1
  va recuperato appena la fonte lo ridà.

**4. Lombardia, giro della sera del 1/11: e' partito, ma non ha scritto niente.** Sicurezza alta (log letto).
- Il cron delle 12:40 UTC di `lombardia.yml` e' partito alle 18:03 (run 41334608701, ritardo di GitHub). Log:
  `Warn 2026-10-31: HTTP 429` e `Warn 2026-10-30: HTTP 429`, nessun file cambiato, nessun commit. L'ultimo commit
  lombardo resta `328e090e3` delle 11:33 UTC (che aveva gia' preso 429 sul 31/10). Il file del 31/10 e' quello delle
  03:30, completo (253 sensori): niente si vede in mappa, si perde solo la correzione serale di ARPA (esempio vero:
  Bormio 2000 il 29/10 passato da 13 a 0 mm solo col giro della sera del 30/10).
- Meccanismo: `getJSON` riprova il 429 cinque volte in circa 100 s, poi `main` lo scrive come avviso
  (`collect-lombardia.js:347`) ed esce con 0, quindi i Retry del workflow non partono. Il secondo tentativo dopo un
  minuto (`daRifare`, riga 340-355) vale solo per meteo e direzione, non per la pioggia.
- Correzione proposta: se cade la pioggia di un giorno per 429, metterlo in `daRifare` (o uscire con 1 quando il
  file del giorno manca del tutto).
