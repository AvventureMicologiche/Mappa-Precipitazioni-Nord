# Pagine «Previsioni meteo <zona>»: resoconto (24/10/2026, sessione cloud)

Tutto sta sul ramo `meteo-zone`. Niente su `main`, niente pubblicazione, niente Search Console.

## Cosa ho fatto

1. **Il generatore** `.github/scripts/genera-pagine-meteo-zona.js`, sullo stile di `genera-pagine-zona-piogge.js`:
   scrive `meteo/<slug>/index.html` con il campione della Val Brembana come riferimento (casella di ricerca con la scheda
   del posto che si apre sempre su OGGI, i 7 giorni da toccare, mappa con il rilievo del sito ed etichette variante F
   con l'icona del cielo sempre, tabella paese per paese dal più basso al più alto, grafico 30 + 7, «Il punto di
   stamattina», radar, le altre pagine della zona, «Come funziona»).
   - L'elenco delle 11 zone è `ZONE_METEO` nel generatore. Il generatore esporta anche `linkMeteo()`, che usano le
     pagine di zona (sotto): l'elenco resta in un posto solo.
   - Il codice del browser è una funzione (`clientePagina`) copiata con `toString()`, come `meteoClient`. **Solo ES5**:
     controllato con acorn in modalità ES5 su tutte le 11 pagine.
   - Le richieste vanno al sito stesso: `/api/previsioni`, `/data/elenco-paesi.txt`, `/lib/leaflet/1.9.4/`. Il
     riepilogo dei pluviometri va come nella zona piogge (raw su GitHub, `/data/` in locale).
   - Il foglio di stile si prende dalla pagina regione di casa, tagliato prima del blocco meteo (come le zone piogge),
     più le regole del campione. Briciole, canonical, og, GA come le altre pagine; in fondo il piè di pagina con le
     fonti (MET Norway e l'ente dei pluviometri).
   - Testi adattati alla zona: «in / nel / sui / sulle», «della valle» o «della zona» (campo `t` di `funghi-zone.json`),
     l'ente dei pluviometri preso con `retiDei` come nelle zone piogge (Lunigiana: «ARPA Liguria e SIR Toscana»).
     Titolo e H1 come deciso: «Previsioni meteo <Zona>: che tempo farà nei prossimi 7 giorni, paese per paese».
   - Eventi GA4: `apri_mappa` con `da: meteo-<zona>-…` sui bottoni, `meteo_zona` con `azione` (giorno, scheda-mappa,
     scheda-tabella, scheda-cerca).
2. **Le 11 pagine**: `meteo/garfagnana`, `lunigiana`, `casentino`, `valsassina`, `valdarno`, `mugello`, `nebrodi`,
   `val-bormida`, `colline-metallifere-grossetane`, `val-d-aveto`, `val-brembana`.
3. **La sitemap**: famiglia `meteo` in `genera-sitemap.js` → `sitemap-meteo.xml` (11 indirizzi, priorità 0.7), aggiunta
   all'indice `sitemap.xml`; data del guscio `"meteo": "2026-10-24"` in `pagine-lastmod.json`. Le altre sitemap figlie
   non sono cambiate di un byte.
4. **I link «Previsioni meteo <Zona> →»** in fondo al blocco «Che tempo farà» delle 11 zone piogge (`/zone/<slug>/`) e
   delle 11 zone funghi (`/funghi/zone/<slug>/`). **Diff: 22 file, 22 righe aggiunte, nient'altro.**
   - Anche i due generatori lo scrivono (`meteoHtml` ha un quinto argomento `dopo`, `genera-pagine-zona-piogge.js` e
     `genera-pagine-zona.js` chiamano `linkMeteo`), così una rigenerazione futura non lo cancella.
   - Le zone piogge le ho rigenerate col generatore e sono uscite identiche tranne la riga. Le zone funghi invece hanno
     numeri cotti che nel frattempo erano cambiati (107 file diversi): ho annullato la rigenerazione e inserito solo la
     riga, presa dall'uscita del generatore, rispettando i fine riga di ogni file.

## Tre cose diverse dal campione, e perché

- **Il vento nella scheda**: il campione scriveva `o.v` come km/h, ma l'API dà la velocità di MET Norway in **m/s**
  (la mappa moltiplica per 3,6, `index.html`). Qui è moltiplicato per 3,6.
- **Il piazzamento delle etichette**: le 24 posizioni del campione bastano in Val Brembana, non in Garfagnana e
  Lunigiana al telefono (12 paesi in una fascia stretta, etichette larghe quasi come la mappa: 6-7 sovrapposizioni al
  giorno). Le prime 24 posizioni sono rimaste identiche; dopo si prova più lontano in verticale (fino a 10 righe),
  l'etichetta scivola di lato se uscirebbe dalla mappa (Castelfranco Piandiscò, 250 px su 361), e se resta qualcosa che
  si tocca si riprova negli altri tre ordini e vince il piazzamento che copre meno. I rettangoli si calcolano invece di
  misurarli a ogni prova, così resta veloce.
- **Le lineette** stanno in un pannello Leaflet sotto le etichette: una lineetta lunga passava sopra la pillola di un
  altro paese. Niente interruttore pioggia/temperature e niente `?et=`: c'è solo la variante F.

## Le quote dei paesi

Cotte nel generatore (`lib-quota-paesi.js`), in un archivio `.github/scripts/quote-paesi.json` (chiave «lat,lon», con
la fonte): rigenerando le pagine non si va in rete se i paesi sono gli stessi.
- Fonte 1 è **Open-Meteo Elevation** come nel campione; **da questa sessione non era raggiungibile**, quindi 102 paesi su
  114 vengono dalla fonte 2, le tessere **terrarium** (Terrain Tiles su AWS) allo zoom 12.
- Le 12 della Val Brembana sono quelle del campione (Open-Meteo). Confronto sulle stesse 12: terrarium dà in media
  **15 m in meno** (da +3 a −31 m), cioè dentro il «~».
- Per riallineare tutto a Open-Meteo dal PC: `QUOTE_RIFAI=1 node .github/scripts/genera-pagine-meteo-zona.js`.

## Come si prova in locale

```
python -m http.server 8897                            # nella radice del repo
node .github/scripts/genera-pagine-meteo-zona.js      # rigenera le 11 pagine e la sitemap (SOLO=garfagnana: una sola)
node prove/meteo-zone/prova-pagine.js                 # le 11 pagine, telefono 393 px e computer 1366 px
FINTO=0 node prove/meteo-zone/prova-pagine.js         # con l'API vera di produzione (vedi sotto)
SCATTI=1 node prove/meteo-zone/prova-pagine.js garfagnana nebrodi   # anche gli scatti
```

Per guardarle a occhio con le previsioni vere: `/api/previsioni` in locale non esiste. Nella pagina generata si mette
temporaneamente `var API = 'https://precipitazioni.avventuremicologiche.it/api/previsioni'` (prima riga di
`clientePagina`, risponde anche a localhost) e poi si rimette `'/api/previsioni'`. La prova automatica non ha bisogno
di toccare niente: con `FINTO=0` gira lei stessa le chiamate all'API di produzione.

`prova-pagine.js` controlla, per pagina e misura: errori della pagina, sbordo orizzontale (anche con la scheda aperta),
etichette che si toccano o escono dalla mappa **in tutti e 7 i giorni**, icona del cielo su ogni etichetta, scheda che
si apre su **oggi** con le ore anche col terzo giorno scelto, i sei bottoni della scheda, la riga della tabella che apre
la scheda, la casella di ricerca, le barre del grafico.

**Esito: 22 casi su 22 senza difetti** (11 pagine × telefono e computer): zero errori, zero sbordi a 393 px, zero
etichette sovrapposte o fuori mappa. Le pagine di zona col link nuovo si aprono senza errori e il link sta dentro il
blocco «Che tempo farà».

## Cosa non si è potuto provare da qui

- **L'API vera delle previsioni**: da questa sessione `precipitazioni.avventuremicologiche.it`, `api.open-meteo.com`,
  le tessere OpenStreetMap e jsDelivr erano bloccati dalla rete. La prova ha risposto a `/api/previsioni` con
  previsioni **inventate**, nella stessa forma dell'API (`functions/api/previsioni.js`): servono a provare impaginazione,
  etichette e comandi, **non i numeri**. Negli scatti le previsioni sono quindi finte; i pluviometri (ieri, 7 giorni,
  grafico dei 30 giorni) sono veri, dai riepiloghi in `data/`. Per le etichette i dati finti sono più duri dei veri
  (più giorni di pioggia, quindi pillole più larghe), ma va ricontrollato con `conta`/`prova-pagine.js` sulle
  previsioni vere.
- **Le frazioni** dal geocoder Open-Meteo (bloccato): ho provato solo i comuni dell'elenco del sito e che, se il
  geocoder non risponde, la tendina lo dice invece di restare su «Cerco anche fra le frazioni…».
- **Il fondo OpenStreetMap**: negli scatti c'è solo il rilievo (preso da raw.githubusercontent al posto di jsDelivr,
  stessa versione delle tessere); sul sito ci saranno strade e nomi sotto.

## Da sapere

- Nebrodi ha **4 paesi** e le Colline Metallifere grossetane **3** in `data/paesi-zone.json`: le pagine sono più
  povere delle altre (tabella corta). Se si vuole di più, va allargato `paesiDellaZona` per queste due.
- `meteo/` viene pubblicata da `pubblica-pages.js` (non è fra le cartelle escluse) e `robots.txt` non la blocca.
- Il `CLAUDE.md` non l'ho toccato: è un test, da scrivere lì quando si decide se tenerlo.

## Scatti

Con le previsioni finte (vedi sopra), pagina appena aperta:
- `scatto-garfagnana-telefono.png`, `scatto-garfagnana-computer.png` (12 paesi, due enti)
- `scatto-nebrodi-telefono.png`, `scatto-nebrodi-computer.png` (4 paesi, MeteoHub)
