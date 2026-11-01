# Check 9, seconda passata (notte 1-2/11/2026, sola lettura)

**In breve.** Difetti verificati: 0 di gravita' alta, 3 media, 3 bassa, piu' 4 dubbi minori. Le 1.487 pagine del repo
sono pulite: 0 link interni rotti, 0 immagini mancanti, sitemap, canonici e `_redirects` coerenti, nessun titolo o
descrizione doppia; i generatori cambiati dal 31/10 sono rigenerati e il loro JavaScript e' ES5. I tre da correggere
per primi:
1. **Una citazione volgare dentro il CSS di 1.256 pagine** («sempre una merda piccolissima...», `lib-striscia.js:38`,
   commit `25d085df0`): e' su `main`, quindi va in linea col giro del mattino se non c'e' gia' (D1, NUOVO).
2. **Biasca Val Pontirone 84,4 mm il 27/10**: falso, ma e' OASI a darlo, non il commit `ad9a04707` (D2, conferma B2).
3. **Castana 29,8 mm il 30/10**: falso, lo da' ARPAV (D3, conferma B3).
Il sito vero non si raggiunge dal cloud (proxy 403): niente prove dal vivo. Nessun file del sito o di `data/` toccato.

---

## Difetti, in ordine di gravita'

### D1 (media, NUOVO). Una citazione volgare del proprietario nel sorgente di 1.256 pagine
- **Dove**: `.github/scripts/lib-striscia.js:38-39`, commit `25d085df0` (1/11, 11:39 UTC). Il commento dentro
  `STRISCIA_CSS` cita: «sempre una merda piccolissima con un titolo gigantesco per dire quasi niente».
- **Cosa succede**: il CSS entra nelle pagine coi commenti. `git grep -l merda -- '*.html'` da' 1.256 file: 22 regioni,
  114 zone piogge, 114 zone funghi, 20 regioni funghi, `funghi/index.html`, 985 pagine di paese. Non si vede a
  schermo, ma basta «visualizza sorgente», e lo leggono anche i motori e i bot dei modelli. Della stessa specie, da
  prima: «le scritte cosi' piccole fanno schifo» in 226 pagine (`genera-pagine-regione.js:420`,
  `lib-pagina-funghi.js:316`).
- **Come si riproduce**: `git grep -c merda -- toscana/index.html` da' 1.
- **Sicurezza**: certa sul repo. Se sia gia' in linea non l'ho potuto vedere (sito non raggiungibile); il giro
  `pagine-regione.yml` pubblica tutto `main`.
- **Correzione proposta**: togliere le citazioni dai commenti; meglio, togliere i commenti `/* */` dal CSS che va
  nelle pagine (circa 2,3 KB in meno per pagina). Attenzione: `lib-pagina-funghi.js:427` (`stileDelModello`) toglie
  `STRISCIA_CSS` dalle pagine cercando la stringa identica, quindi va cambiato insieme. Poi rigenerare le famiglie.

### D2 (media, conferma B2 e ne smentisce l'ipotesi). Biasca Val Pontirone, 84,4 mm falsi il 27/10
- **Dove**: `data/ticino/2026-10-27.json`, stazione `meteo_u_122`.
- **Causa**: la fonte. Il primo giro (03:32 UTC del 28/10, `9b27ab90d`) l'ha calcolato sommando i dati a 10 minuti,
  quello delle 16:12 del 28/10 dal giornaliero ufficiale OASI: stesso 84,4 in tutte e sei le versioni del file. Il
  commit `ad9a04707` non c'entra (dettagli piu' sotto, parte 3). Nessun altro salto isolato in Ticino in ottobre.
- **Sicurezza**: alta.
- **Correzione proposta**: togliere la stazione dal file del 27/10 (assente, non a zero), col suo si' perche' e'
  `data/`. Il filtro automatico e' la proposta comune qui sotto D3.

### D3 (media, conferma B3). Castana (Arsiero, VI), 29,8 mm falsi il 30/10
- **Dove**: `data/veneto/2026-10-30.json`, id `68`.
- **Causa**: la fonte. Il valore cresce nell'XML di ARPAV durante il giorno (0, 20, 29,8 nei commit `43acfc7fd`,
  `372d3cd4d`, `028bd60e5`), somma di `totalePrecGiorno` (`collect-veneto.js:96-106`); 8 vicini entro 15 km a 0.
- **Sicurezza**: alta.
- **Correzione proposta**: togliere la stazione 68 dal file del 30/10. **Per D2 e D3 insieme**, da decidere con lui
  (regola 10): spostare `togliPicchiFalsi` di MeteoHub in una lib con soglia 20 mm e vicini della stessa rete tutti
  sotto 1 mm (almeno 2 entro 5 km o 3 entro 15 km), chiamata in `writeDay` di Ticino e Veneto. Provata su 61 giorni di
  11 reti del nord: 7 casi (Biasca, Castana, Bertonico 17/9, quattro toscane da guardare una per una).

### D4 (bassa, precisa la nota «Lombardia» della prima passata). Il giro lombardo della sera cade sul 429 in silenzio
- **Dove**: `collect-lombardia.js:347` (avviso e uscita con 0); `daRifare` (righe 340-355) copre solo meteo e direzione.
- **Cosa succede**: il 1/11 il giro della sera e' partito alle 18:03 UTC (run 41334608701), ha preso `HTTP 429` da
  Socrata su 30 e 31/10 e non ha scritto niente; i Retry del workflow non partono perche' l'uscita e' 0. Non era un
  ritardo. Il file del 31/10 e' completo; si perde solo la correzione serale di ARPA (che esiste davvero: Bormio 2000
  il 29/10 da 13 a 0 mm).
- **Sicurezza**: alta (log letto).
- **Correzione proposta**: se la pioggia di un giorno cade per 429, metterlo in `daRifare`, o uscire con 1 quando il
  file del giorno manca.

### D5 (bassa, conferma B1 e aggiunge una scadenza). Puglia 26-29/10: la riparazione automatica smette fra pochi giorni
- **Dove**: `collect-meteohub.js:605-625`, riparazione da 3 a 9 giorni indietro.
- **Cosa succede**: il collector riprova da solo a ogni giro (log delle 17:15 UTC del 1/11: «contiene stime,
  riprovo»), ma MeteoHub da' una stazione sola per giorno. Smette di riprovare il 26/10 il 4/11, il 29/10 il 7/11, il
  30/10 l'8/11. Il file vero entra solo se MeteoHub ricarica quei giorni e se si supera la soglia (114 stazioni).
- **Sicurezza**: alta.
- **Correzione proposta**: se i dati arrivano dopo, lancio a mano di `meteohub.yml` con
  `date_override=2026-10-26:2026-10-30`; oppure allargare la riparazione a circa 20 giorni quando il giro entra con
  l'account (la finestra di 10 giorni vale per l'accesso anonimo). Resta valida la via del Bollettino regionale (B1).

### D6 (bassa, osservazione). `sitemap-paesi-prova.xml` fuori dall'indice e doppia
- 20 indirizzi gia' in `sitemap-localita.xml`, `lastmod` ferma al 20/10, nessun generatore la scrive (prova del 25/10,
  `7048b8936`). Se la prova e' finita, si toglie. Sicurezza: certa; effetto quasi nullo.

### Dubbi, non dimostrati come difetti
1. **Puglia, due periodi di stime diversi**: la pagina regione dice «Dal 26 al 29 ottobre», le pagine funghi (secondo
   il sottoagente, testo scritto dal JavaScript) «dal 26 al 30»: il riepilogo guarda la fonte del file
   (`stimeInCoda`, `genera-riepiloghi.js:141`), i funghi stazione per stazione, e il 30/10 e' per meta' stimato. Il
   commento dice che fa come la mappa: forse voluto. Non l'ho verificato io sul testo delle pagine funghi.
2. `pagine-impronte.json` indietro per `index.html`, `fonti.html` e `guida`: al prossimo giro la data in sitemap
   slitta di un giorno. Trascurabile.
3. Classe `mk-grande` senza CSS: codice morto.
4. `descrCotta` scriverebbe «NaN mm» se nel riepilogo mancasse la media dei 7 giorni; oggi c'e' sempre.

---

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
  lombardo resta `328e090e3` delle 11:33 UTC (che aveva gia' preso 429 sul 31/10). Il file del 31/10 e' quello del giro
  delle 03:30 UTC del 1/11 (`257d6eb27`), completo (253 sensori): niente si vede in mappa, si perde solo la correzione serale di ARPA (esempio vero:
  Bormio 2000 il 29/10 passato da 13 a 0 mm solo col giro della sera del 30/10).
- Meccanismo: `getJSON` riprova il 429 cinque volte in circa 100 s, poi `main` lo scrive come avviso
  (`collect-lombardia.js:347`) ed esce con 0, quindi i Retry del workflow non partono. Il secondo tentativo dopo un
  minuto (`daRifare`, riga 340-355) vale solo per meteo e direzione, non per la pioggia.
- Correzione proposta: se cade la pioggia di un giorno per 429, metterlo in `daRifare` (o uscire con 1 quando il
  file del giorno manca del tutto).

## Parte 2: i generatori e il JavaScript delle pagine cambiati dal 31/10

Commit letti (fuori dai giri automatici): `b817c2193`, `2e1ab55fc`, `d5c723102`, `e88f1cefc`, `d2b1f09a6`, `fd57c23ee`,
`9ca913d40`, `25d085df0`, `338f59378`, piu' quelli del 31/10. L'unico difetto vero e' D1.
- **Pagine rigenerate dopo l'ultimo cambio del generatore: si', tutte le famiglie.** I dieci generatori, rilanciati su
  una copia del repo fuori dal repo, danno un diff fatto solo di numeri che cambiano coi dati (ritratti dei paesi):
  nessuna differenza di struttura, testi o script. Tutte le 1.256 pagine con la striscia portano la `strisciaMappa` e
  lo `STRISCIA_CSS` di oggi (ultimo cambio di generatore `338f59378` alle 12:11 UTC, pagine committate nello stesso
  commit e nei giri successivi).
- **Le modifiche dei messaggi ci sono davvero**, viste in Chrome headless a 390 e 1280 px coi dati veri: cartina dei 7
  giorni alta 300 px al telefono e 440 al PC con la pillola e il bottone giallo «Oppure guarda la pioggia di ieri»
  (`25d085df0`, scatti presenti per le 22 regioni); i due riquadri grandi `mk-grandi` sulle pagine funghi
  (`338f59378`); Sila Grande al posto di Sila Greca ovunque; via solo le due pagine meteo di Candalla e Val Serina. Le
  28 pagine cancellate dal 31/10 hanno tutte il loro 301. In mappa forestale manca solo la Valle Sabbia, decisione del
  27/9.
- **ES5**: tutti gli script inline di tutte le pagine e `lib/pagina-adesso.js` passano acorn con `ecmaVersion 5`
  (niente `let`, `const`, frecce, template string), quindi apostrofi e accenti nei nomi non rompono il JS. Ci sono
  `padStart`, `findIndex` e `normalize` (ES2015): non li conto, le stesse pagine usano gia' `fetch`.
- **Casi limite**: su 20 pagine di tutte le famiglie in Chrome nessun errore JS, nessuno scroll orizzontale, nessun
  `undefined` o `NaN`; in tutte le pagine nessun attributo rotto, niente «0,0 mm», «..» o «il 1»; nomi giusti (Pian di
  Sco', Fie', Viu', Ala' dei Sardi, «Ca'», «Sant'Agata»); i conti dei pluviometri di zona tornano su 589 pagine di paese.

La verifica nel browser della parte 2 l'ha fatta un sottoagente su una copia locale (server `python -m http.server`
spento alla fine), non sul sito vero e non sui punti A1-A4, che restano alla sessione locale.

## Parte 4: confronto con la prima passata (`check-9-rapporto.md`)

| Prima passata | Questa passata |
|---|---|
| B1 Puglia 26-29/10 stimata | **confermato**; in piu' la scadenza della riparazione automatica (4-8/11) e cosa serve (D5) |
| B2 Biasca, ipotesi commit `ad9a04707` | **dato confermato, ipotesi smentita**: e' OASI, anche nel giornaliero ufficiale (D2) |
| B3 Castana, sospetto | **confermato**, la causa e' ARPAV (D3) |
| Nota «Lombardia forse in ritardo» | **smentita**: il giro e' partito e ha preso 429, uscendo senza errore (D4) |
| «Pagine: `lib-striscia.js` ES5, ripiego alla cartina di ieri» | **confermato**, e allargato a tutti gli script inline |
| A1-A6 (mappa nel browser), B4, B5 | non ricontrollati: fuori dal compito di questa passata |
| D1 citazione volgare, D6 sitemap di prova, i quattro dubbi | **nuovi** |

## Cosa non sono riuscito a controllare, e perche'
- **Sito vero e fonti in diretta** (OASI, ARPAV, MeteoHub, `precipitazioni.avventuremicologiche.it`): il proxy
  dell'ambiente cloud risponde 403. Quindi niente prova dei rimandi in linea e niente confronto fra pagine in linea
  e repo (per D1: se la citazione sia gia' online). Si apre aggiungendo i domini agli «Allowed domains»
  dell'ambiente.
- **I link dentro il JavaScript** li ho controllati dove sono dati (slug dei paesi funghi, elenco della ricerca che
  porta solo alla mappa con parametri), non ogni stringa costruita a pezzi.
- **I parametri della mappa** nei link (`?r=slovenia`, `&pl=...`) li ho dati per buoni se la pagina `/` esiste: se la
  mappa li legga bene e' lavoro del browser.
- **Il testo «dal 26 al 30» delle pagine funghi della Puglia** (dubbio 1) e' scritto dal JavaScript: l'ha visto il
  sottoagente, non io.
- Gli script stanno in `check-9/` (parte 1); quelli delle parti 2 e 3 erano nello scratchpad della sessione e non
  sopravvivono, i numeri sono riportati qui.
