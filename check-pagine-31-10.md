# Controllo pagine, dati e link del 31/10/2026

Sessione cloud, ramo `claude/epic-hopper-opas4w`, partendo da `main` al commit `e570bd5d` (pagine regione cotte del 31/10 alle 05:31 UTC). Da qui il sito vero non si raggiunge: il proxy risponde 403 su precipitazioni.avventuremicologiche.it, api.met.no, YouTube, Esri, OSM, jsDelivr. Ho lavorato sui file del repo e su una copia pubblicata in locale (la cartella `_pages/` costruita con `pubblica-pages.js --solo-cartella`).

## Riassunto

1. **Link: nessun link interno rotto.** 1.413 pagine, 56.930 link nell'HTML e i link creati dal JavaScript dopo il rendering di tutte le pagine: zero rotti, zero ancore mancanti, zero errori JavaScript, zero file mancanti (dati, anteprime, Leaflet).
2. **Sitemap, canonical, og:url, JSON-LD, rimandi: in ordine.** Ogni pagina è in una sitemap, nessuna sitemap punta a una pagina che non c'è, nessuna pagina orfana.
3. **ALTA: le pagine regione, zone e funghi contano le stime Open-Meteo come pluviometri.** Oggi `/puglia/` scrive in cima e nella descrizione per Google «29 ottobre, 2,9 mm a Monopoli»: quel giorno è tutto stimato, e la pagina dice «non stime da modello».
4. **ALTA: un picco falso del Ticino (84,4 mm il 27/10 a Biasca Val Pontirone, vicini a 0) è il primo della Svizzera** a 7, 20 e 30 giorni e sta nella descrizione di `/svizzera/` per Google.
5. **MEDIA: altri valori isolati arrivano in testa alle pagine** (Castana 29,8 mm «ieri» in `/veneto/`, Careggine e Prunetta in Toscana), e **cinque pluviometri scrivono 0 mentre intorno piove** (3 in Liguria, 2 in Molise).
6. **MEDIA, ipotesi forte da verificare: il giorno della Liguria potrebbe finire alle 23 invece che a mezzanotte** (stessa trappola corretta il 26/10 per Piemonte e Lombardia).
7. **I numeri cotti tornano:** 22 pagine regione uguali ai riepiloghi, 114 zone piogge uguali ai riepiloghi di zona, 899 ritratti d'archivio rifatti da zero tutti uguali, ente giusto nelle 908 pagine paese. Fuori posto: 5 zone su 114 nell'elenco funghi regionale (definizione diversa dalla pagina di zona) e 9 pagine meteo che scrivono «0» dove le altre scrivono «meno di 0,1».
8. **Corretti sul ramo (piccoli):** il conto «pluviometri letti» non conta più la cartella di prova dell'Abruzzo e le stime (6.011 del 29/10 diventa 5.692 del 30/10); `fonti.html` cita Esri, che mancava.
9. **Da decidere:** il gruppo C delle pagine meteo (20 zone) è già in sitemap e online dal giro del 31/10 mattina, prima della data prevista nel CLAUDE.md (3-4/11).
10. Link esterni: 63 indirizzi su 50 domini, elencati ma non verificabili dal cloud.

## Come ho controllato

- **Link nell'HTML** (`link.js`): ogni `href`/`src`/`og:image`/`canonical`/`og:url` delle 1.413 pagine risolto contro la cartella pubblicata, con le regole di Cloudflare Pages (cartella → `index.html`, `/fonti` → `fonti.html`), `_redirects` e le Functions (`/api/previsioni`, `/api/cerca`, `/previsioni/`). Ancore `#...` contro gli `id` della pagina di arrivo. Indirizzi raw su `main` contro i file del repo.
- **Link creati dal JavaScript** (`render.js`): tutte le 1.411 pagine aperte in Chromium senza testa, servite in locale su un nome non `localhost` (così leggono raw GitHub come in produzione, con i file `data/` del repo), scorse fino in fondo per accendere i pezzi che si caricano a vista; poi gli stessi controlli sul DOM finale, più errori JavaScript e richieste fallite. Le previsioni rispondevano 503 apposta: tutte le pagine mostrano il loro messaggio di guasto e nessuna si rompe.
- **Parametri della mappa** (`param.js`): 18.035 link `/?...` controllati (regioni esistenti in `index.html`, date valide e non future, `radar`, `m`, `g`, `pl` dentro l'area, al massimo 3 regioni). Nessun problema (`quota=` è letto da `index.html`).
- **Numeri**: pagine cotte rifatte con `numeriRegione` dal riepilogo; zone piogge e pagine meteo lette dal testo dopo il rendering e confrontate coi riepiloghi di zona; ritratti d'archivio rifatti con `lib-clima.js` a cinque giorni di taglio diversi; elenchi zone regionali contro le pagine di zona.
- **Pagine contro generatori**: ho rilanciato in una copia i generatori di regioni, zone piogge, funghi (regioni, zone, indice), mappa forestale e pagine meteo. Le pagine escono identiche, salvo i numeri d'archivio che crescono col passare dei giorni: nessuna famiglia è rimasta indietro rispetto al suo generatore.
- **Dati 21-30/10**: 40 cartelle, giorno per giorno, con un agente dedicato (script e risultati grezzi nello scratchpad della sessione, non nel repo); le segnalazioni nuove le ho ricontrollate io sui file prima di scriverle qui.

## Problemi trovati, dal più grave

### 1. Le stime Open-Meteo entrano nelle pagine come se fossero pluviometri

- **Famiglia:** regioni piogge (cotte), zone piogge, funghi (regioni, zone, paesi), elenco zone delle pagine regione.
- **Pagine colpite:** oggi `/puglia/` (cotta) in modo pieno; in modo lieve le pagine e le classifiche di Sicilia, Sardegna e Basilicata.
  - `/puglia/`: «Giovedì 29 ottobre, 0,3 mm di media. Dove ha piovuto di più: Monopoli 2,9 mm, Polignano 2,9 mm, Castellana Grotte 2,5 mm. Media di 129 pluviometri». Descrizione per Google: «Il 29 ottobre 2,9 mm a Monopoli, in 7 giorni 78 mm a Sannicandro Garganico». Il file del 29/10 (come 26, 27 e 28/10) è `source: open-meteo-gapfill`: 131 stazioni, tutte stimate. Nella stessa pagina: «I millimetri li misurano oltre 120 pluviometri di MeteoHub, strumenti a terra, non stime da modello». I 7 e 30 giorni della Puglia contengono 4 giorni di stime.
  - Il 30/10 la Puglia ha un file vero con 60 stazioni (contro 125-127): `ultimoCompleto` lo scarta perché 60 è meno del 90% dei 131 punti stimati del giorno prima, e sceglie il giorno stimato.
  - Finestra di 34 giorni: anche Sicilia 6-7/10 (345 stazioni `om:true`), Sardegna 15/10 (61), Basilicata 2/10 (46) finiscono nelle medie a 20 e 30 giorni e nelle pagine funghi (8 posti siciliani e 5 sardi hanno un giorno stimato nella finestra di 25 giorni, con valori piccoli).
- **Gravità:** alta (testo per Google e verdetto in cima con numeri di modello presentati come misure; va contro la regola 1 del CLAUDE.md).
- **Causa:** `lib-giorni.js:40` `leggi()` non scarta niente; la usano `genera-riepiloghi.js:118` (`riepilogo`), `:171` (`mediaGiorno`), `:207` (`ultimoCompleto`, che conta anche i punti stimati) e `genera-funghi.js:100` e `:165`. Il filtro giusto esiste già in `lib-clima.js:72` (`leggiVere`) e in `genera-temperature-ieri.js:47`.
- **Soluzione proposta (da decidere):**
  - A) usare nei riepiloghi e in `genera-funghi.js` una lettura «solo vere» come `leggiVere`. Effetto sulla Puglia di oggi: «ieri» diventerebbe il 30/10 con le sue 60 stazioni vere, e i periodi direbbero «4 giornate di dati in meno», come già fanno quando un file manca;
  - B) tenere le stime ma dichiararle nella pagina («di cui N giorni stimati») e togliere da quei giorni la frase «non stime da modello».
- **Corretto sul ramo:** no.

### 2. Ticino: picco falso di 84,4 mm, primo della Svizzera e nella descrizione per Google

- **Famiglia:** regioni piogge (`/svizzera/`), mappa (dati).
- **Pagine colpite:** `/svizzera/` (descrizione: «in 7 giorni 85 mm a Biasca Val Pontirone»; primo posto a 7, 20 e 30 giorni con 84,7, 195,3 e 252,3 mm) e ogni periodo della mappa che contiene il 27/10.
- **Fatto:** `data/ticino/2026-10-27.json`, `meteo_u_122` Biasca Val Pontirone 84,4 mm; 26/10 e 28/10 0,1 mm; Biasca (7,4 km), Bodio (8,8 km) e Moleno (11,9 km) a 0; nessuna altra stazione del Ticino sopra 2 mm, nessuna della Svizzera sopra 5 mm.
- **Gravità:** alta (è il testo che Google mostra per la Svizzera).
- **Causa:** è il giornaliero consolidato di OASI; `collect-ticino-gh.js` non ha un filtro dei picchi (nessuna delle reti lo ha sotto i 200-300 mm).
- **Soluzione proposta:** escludere quel giorno di quella stazione (una riga di riparazione nel file, come per il 27/7 della Puglia) e, in generale, il punto 3.
- **Corretto sul ramo:** no (riparare un file dati è una decisione tua).

### 3. Valori isolati che finiscono in testa alle pagine

- **Famiglia:** regioni piogge, zone piogge, funghi.
- **Pagine colpite e fatti:**
  - `/veneto/`: «Ieri, 30 ottobre: 29,8 mm a Castana» nel verdetto e nella descrizione per Google; Castana (VI, id 68) 29,8 mm il 30/10 con i 5 vicini entro 10 km a 0, 0 il 25-28/10 e 0,2 il 29/10. File raccolto il 31/10 alle 03:30 UTC, lo stesso giro del file del 31/10. Probabile lettura spuria (da verificare sull'XML ARPAV di quel giorno).
  - Toscana 24/10: Careggine 28 mm (23/10: 30,2) e Prunetta 28,8 mm (23/10: 15) con tutti i vicini entro 12 km fra 0 e 0,2 mm. Sono primo e secondo della Toscana a 7 giorni (`/toscana/`) e Careggine è il primo della Garfagnana (`/zone/garfagnana/`, «Careggine 28,0 mm» contro 1,0 del secondo). Stessa forma il 20→21/10 a Prunetta, e Vallelunga e Montecchio il 22/10.
  - Trentino: Rovereto (Malga Zugna) 9,6, 12 e 13,2 mm il 23-25/10 con i vicini a 0, primo a 7 giorni in `/trentino/`. Piemonte: Rifugio Gastaldi 15 e 6,6 mm il 26-27/10 con i vicini a 0 (probabile neve che fonde nel pluviometro dopo il 25/10: dato fisico, non un difetto).
- **Gravità:** media.
- **Causa probabile:**
  - Toscana: `collect-toscana-sir.js:162-181` (`parseSirValues`) legge solo il Δ24h della riga SIR e non guarda l'ora dell'ultima lettura: se una stazione smette di trasmettere a inizio giornata, il suo Δ24h resta quello della sera prima (ipotesi, da verificare su quale colonna della riga è l'orario).
  - Veneto e Ticino: nessun filtro, valore della fonte.
- **Soluzione proposta (scegli tu quanta):**
  - a) un controllo leggero solo sulle classifiche delle pagine (`genera-riepiloghi.js`, `top`): un pluviometro con almeno 10 mm e la mediana dei 5 vicini sotto 1 mm non va fra i primi (resta nella media e in mappa). Costa poco e protegge proprio i testi che legge Google;
  - b) in più, la stessa regola come riga nella mail dell'allarme fonti, per decidere a mano se riparare;
  - c) per la Toscana, scartare le letture SIR più vecchie di qualche ora, una volta trovata la colonna dell'orario.
- **Corretto sul ramo:** no.

### 4. Pluviometri che scrivono 0 mentre intorno piove

- **Famiglia:** dati, mappa, pagine regione e funghi delle zone toccate.
- **Fatti:**
  - Liguria, dal 20-21/10: Viganego (VIGAN) 0 tutti i giorni dal 20/10, il 21/10 con La Presa (1,9 km) a 40 mm e Bargagli a 33,4; Sarzana (SRZAN) 0 dal 20/10, il 21/10 con Castelnuovo Magra (3,7 km) a 21 e Vezzano a 32,8; S. Margherita Ligure (SMARG) 0,2 mm in 10 giorni, il 23/10 con Rapallo 31,6 e Camogli 44,2. Temperatura e umidità arrivano: la stazione è viva, il pluviometro no.
  - Molise: Trigno (Bagnoli del Trigno) a 0 dal 15/10, Mafalda a 0 dal 14/10 (ultima pioggia l'8/10), contro una mediana dei vicini di 36-38 mm nei 10 giorni.
- **Gravità:** media (macchie asciutte false nei giorni di pioggia, che è il difetto peggiore per questa mappa).
- **Causa:** guasti a monte; la fonte pubblica zeri, non dato assente. Non sono in `LIGURIA_ESCLUSE` né in `MH_ESCLUSE`, e il controllo del lunedì (`check-stazioni-ferme.js`) non li vede ancora: lavora su 45 giorni e chiede ai vicini almeno 50 mm (il Molise è stato troppo asciutto; i liguri hanno ancora la pioggia vera del 18/10 nella finestra).
- **Soluzione proposta:** aggiungerli alle esclusioni (per id), con la regola già scritta nel CLAUDE.md (restano almeno tre pluviometri vicini?); oppure aspettare che il controllo del lunedì li prenda da solo, sapendo che per qualche settimana restano in mappa.
- **Corretto sul ramo:** no (le esclusioni stanno in `index.html`, che non tocco).

### 5. Liguria: il giorno potrebbe finire alle 23 invece che a mezzanotte (ipotesi forte)

- **Famiglia:** dati Liguria, tutte le pagine che la usano.
- **Fatti** (gemelle, cioè gli stessi pluviometri pubblicati da due reti):
  - 20→21/10, 6 gemelle ARPAE/OMIRL: il 20 Emilia 250,2 mm contro Liguria 217,1; il 21 Emilia 273,8 contro Liguria 298,9; sui due giorni le somme tornano (Cabanne 128,2 contro 124,4).
  - Stesso verso con le 23 gemelle SIR/OMIRL: il 20 Toscana 780 contro 744, il 21 Toscana 771 contro 804. Il 7→8/10 lo stesso.
  - Dal 12/7 al 30/10 il verso opposto (Liguria più alta il giorno G) non capita mai. L'ordine in cui le reti «chiudono» il giorno è Liguria, poi Toscana (che chiude al più tardi alle 23:40), poi Emilia.
- **Gravità:** media (sposta di giorno la pioggia fra le 23 e mezzanotte su tutte le 198 stazioni; pesa su «ieri» e sugli estremi dei periodi, non sui totali di più giorni).
- **Causa probabile:** `collect-liguria.js:295` tiene i punti in `[inizio, fine)`. Se OMIRL marca ogni ora alla sua FINE (come ARPA Piemonte e Socrata Lombardia), il punto delle 00:00 è la pioggia delle 23-24 del giorno prima e quello delle 24:00 resta fuori.
- **Soluzione proposta:** prima verificare dal PC su una serie `/charts/{code}/Pluvio` di un giorno di pioggia serale (confronto ora per ora con MeteoHub o con le gemelle ARPAE), poi, se confermato, passare a `(inizio, fine]` come per il Piemonte, lasciando lo storico com'è.
- **Corretto sul ramo:** no.

### 6. Il conto «pluviometri letti» contava la prova dell'Abruzzo e le stime

- **Famiglia:** mappa (riga «N pluviometri letti stamattina», file `data/riepiloghi/letture.json`).
- **Fatto:** il 31/10 il file dice 6.011 pluviometri del 29/10. Dentro ci sono 145 punti del modello ICON della cartella di prova `data/abruzzo` (che la mappa non legge) e 131 stime Open-Meteo della Puglia; e siccome l'Abruzzo di prova non aveva ancora il 30/10, il conto ha perso il confronto ed è tornato al 29/10.
- **Gravità:** media (numero pubblico gonfiato di circa il 5% e giorno sbagliato).
- **Causa:** `genera-riepiloghi.js:239` (`letture`) legge tutte le cartelle di `data/` e non guarda il `source`.
- **Soluzione:** fuori la cartella `abruzzo`, i file con `source` open-meteo e le stazioni `om:true` o con `src` open-meteo.
- **Corretto sul ramo: sì.** Provato in una copia del repo: `letture.json` passa a 5.692 pluviometri del 30/10 in 37 cartelle; tutti gli altri riepiloghi (23 regioni e 114 zone) escono identici byte per byte, campi `generato` a parte.

### 7. `fonti.html` non cita Esri

- **Famiglia:** fonti.
- **Fatto:** le foto Esri World Imagery (tasto «Satellite» dei boschi, sfondo delle previsioni, anteprime delle 51 pagine meteo) e le cartine Esri World Ocean Base e World Hillshade non compaiono nella pagina «tutte le fonti e licenze». La dicitura c'è sulla mappa («Foto: Esri, Vantor, Earthstar Geographics»).
- **Gravità:** media (attribuzione).
- **Soluzione:** una riga nella tabella «Stime, mappe e software», prima di Leaflet.
- **Corretto sul ramo: sì** (una riga aggiunta, fini riga CRLF conservati; il testo è una proposta, cambialo come vuoi).

### 8. Elenco zone funghi regionale e pagina di zona: 5 numeri diversi

- **Famiglia:** funghi (regioni e zone).
- **Pagine colpite:** `/funghi/lombardia/` Valle Sabbia 5,3 mm contro 7,9 aprendola; `/funghi/piemonte/` Valle di Viù 1,6 contro 2,3; `/funghi/emilia/` Romagna toscana 3,6 contro 3,8; `/funghi/umbria/` Valtiberina 2,2 contro 2,4; `/funghi/trentino/` Giudicarie 6,1 contro 6,0. Le altre 108 coincidono. La pagina regione scrive «lo stesso che trovi aprendola».
- **Gravità:** media-bassa.
- **Causa:** due definizioni diverse quando un pluviometro ha giorni mancanti. L'elenco (`genera-pagine-funghi.js:642`, `ordinaZone`) fa la media dei totali 13-20 dei pluviometri (`posti[id][0]`, dove i giorni mancanti non contano); la pagina di zona (`lib-pagina-funghi.js:181`, `somma(s,20,13)`) somma le medie giornaliere della zona, dove il pluviometro muto sparisce solo da quel giorno. In Valle di Viù S4127 manca 6 giorni su 25.
- **Soluzione proposta:** una definizione sola. La più semplice: nell'elenco usare la stessa serie giornaliera di zona (`-giorni.json`) che usa la pagina di zona.
- **Corretto sul ramo:** no.

### 9. Il gruppo C delle pagine meteo è già online

- **Famiglia:** meteo zone, sitemap.
- **Fatto:** le 20 pagine del gruppo C (`ZONE_METEO_C`, dalla Riviera di Levante ai Monti Sabini), `sitemap-meteo-c.xml` nell'indice `sitemap.xml` e i link «Previsioni meteo <zona> →» dalle loro pagine piogge e funghi sono su `main` dal 30/10 sera. I giri `pagine-regione.yml` del 31/10 alle 04:15 e alle 05:31 UTC sono riusciti e pubblicano tutto `main`. Il CLAUDE.md dice che il C «si pubblica dopo quella lettura (~3-4/11)».
- **Gravità:** media se non era voluto (la misura A/B/C in Search Console parte prima del previsto), nessuna se era voluto.
- **Soluzione:** solo verificare; se non era voluto, togliere `sitemap-meteo-c.xml` dall'indice fino al 3-4/11 non basta più a nasconderle (sono già linkate), quindi conviene tenerle e far partire la misura del C da oggi.
- **Corretto sul ramo:** no.

### 10. Pagine meteo: titoli e descrizioni troppo lunghi

- **Famiglia:** meteo zone e meteo paesi.
- **Pagine colpite:** 31 titoli delle zone da 78 a 102 caratteri («Previsioni meteo Colline Metallifere grossetane: che tempo farà nei prossimi 7 giorni, paese per paese»); 51 descrizioni da 207 a 253 caratteri. Il resto del sito si tiene a 62 e 158, con forme di ripiego.
- **Gravità:** bassa (Google taglia; il pezzo importante sta all'inizio).
- **Causa:** `genera-pagine-meteo-zona.js:972-973`, `genera-pagine-meteo-paese.js:65-66` senza forme corte.
- **Soluzione proposta:** due o tre forme dalla più lunga alla più corta, la prima che sta nei limiti, come in `genera-pagine-localita.js`.
- **Corretto sul ramo:** no (sono testi SEO di una famiglia in prova: decidi tu).

### 11. Pagine meteo: «0 mm di media» dove le altre pagine dicono «meno di 0,1»

- **Famiglia:** meteo zone.
- **Pagine colpite:** 9 il 30/10 (Candalla, Carnia, Casentino, Garfagnana, Mugello, Val Borbera, Val Bormida, Val di Luce, Valdarno), con sotto il pluviometro che ha misurato 0,2 mm. La pagina piogge della stessa zona scrive «meno di 0,1 mm» (regola del 16/10). Il «punto di stamattina» scrive «non è piovuto».
- **Gravità:** bassa.
- **Causa:** `genera-pagine-meteo-zona.js:732` usa `mm(x.media)` senza il caso «meno di 0,1» di `lib-numeri-regione.js` (`mediaMm`); `:741` usa `i.media < 0.1 ? 'non è piovuto'`.
- **Soluzione proposta:** la stessa regola di `mediaMm` nei due punti, poi rigenerare le 51 pagine.
- **Corretto sul ramo:** no.

### 12. Pagine paese di pluviometri fermi da settimane

- **Famiglia:** funghi paesi.
- **Pagine colpite:** `/funghi/emilia/bore/` (nessun dato dal 7/10) e `/funghi/toscana/campagrina/` (dal 10/10). La pagina lo dice bene in cima («Questo pluviometro non manda dati dal 7 ottobre»), ma più sotto scrive «Ieri, 30 ottobre: il dato non è ancora arrivato».
- **Gravità:** bassa.
- **Causa:** `genera-pagine-localita.js:608` usa la stessa frase per il ritardo di un giorno e per il pluviometro fermo.
- **Soluzione proposta:** come per Cannobio (17/10), un rimando 301 al pluviometro vicino con pagina se non tornano entro un tempo che scegli tu; oppure «il dato non arriva dal 7 ottobre» quando l'ultimo giorno è vecchio.
- **Corretto sul ramo:** no.

### 13. Sitemap: `lastmod` fermi dove il guscio è cambiato il 28/10

- **Famiglia:** sitemap.
- **Fatto:** mappa forestale (138 pagine) 20/10, `/guida/` 12/9, `/fonti` 8/10, `/` 14/8, mentre il 28/10 la testata è stata messa anche a queste famiglie (CLAUDE.md, «tutte le famiglie al 28/10/2026»). Il 28/10 è stato aggiornato solo `pagine-lastmod.json`, che queste quattro non leggono.
- **Gravità:** bassa.
- **Causa:** date scritte nel codice in `genera-sitemap.js:73`, `:79`, `:85`, `:167`.
- **Soluzione proposta:** portarle a `2026-10-28` (o in `pagine-lastmod.json`, così le aggiorna anche il rinnovo).
- **Corretto sul ramo:** no.

### 14. `sitemap-paesi-prova.xml`: 20 indirizzi con due `lastmod` diversi

- **Famiglia:** sitemap.
- **Fatto:** le 20 pagine della prova del 25/10 sono anche in `sitemap-localita.xml`; nella prova hanno `lastmod` 20/10, nella sitemap di famiglia 28/10.
- **Gravità:** bassa (la prova è voluta e fuori indice).
- **Soluzione proposta:** a prova finita togliere il file, o allineare la data a mano.
- **Corretto sul ramo:** no.

### 15. `/previsioni/`: anteprima social della mappa delle piogge

- **Famiglia:** previsioni.
- **Fatto:** `functions/previsioni/index.js` riscrive titolo, descrizione, canonical e `og:url`, ma `og:image` e `og:image:alt` restano quelli della mappa («L'Italia due volte: a sinistra la pioggia degli ultimi 90 giorni...»).
- **Gravità:** bassa.
- **Soluzione proposta:** un'immagine delle previsioni (le foto rifatte il 30/10 per guida e home) e il suo testo alternativo.
- **Corretto sul ramo:** no.

### 16. Solo segnalazioni (file che non tocco)

- `index.html`: un link `href="#"` senza testo né etichetta (l'unico «link vuoto» del sito).
- Pagine «adesso» (21): nessun link rotto, nessun errore JavaScript nel rendering; i numeri dipendono da radar e previsioni, che dal cloud non rispondono, quindi non li ho potuti controllare.
- `robots.txt`: la riga `Disallow: /.netlify/` e il commento «Le funzioni Netlify» sono rimasti dall'epoca Netlify; innocui.

### 17. Dati minori 21-30/10 (dall'analisi dei file, non ricontrollati uno per uno)

- **Già noti:** Puglia 26-29/10 stime intere e 30/10 a 60 stazioni su 127 (MeteoHub, allarme partito il 29/10); Basilicata 26-29/10 50 stazioni contro 61 (Vulture-Melfese); Slovenia senza il 30/10 (ritardo dichiarato); `toscana-vento` spento dal 2/10.
- **Nuovi, bassi:** Sardegna 22/10 61 stazioni contro 93; Campania 29/10 temperatura su 37 stazioni contro 81 e vento su 7 contro 17 (lo vede anche `check-campi`); Sicilia, Citelli 23/10 44,6 mm in un'ora con 33 stazioni entro 25 km a 0; Piemonte, Fobello 21/10 69,2 mm con 11 ore valide su 24 (probabile sottostima); Monistrol-sur-Loire 27/10 massima 33,7 °C contro 20-26 dei vicini; Agrigento SR24 umidità ferma al 100% dal 25 al 29/10; Dro 27/10 raffica 128,5 km/h con media 6.
- **Stazioni sparite** (una o due per rete): Rechnitz (Austria, ultima il 23/10), Casaselvatica e Lagosanto (Emilia, 20 e 23/10), Montauban-S-Ouv (Francia AURA, 18/10), Bricola (Svizzera, 21/10).
- **Commit inutili:** il collector MeteoHub riscrive ogni giro file identici salvo l'ora di raccolta per i giorni sotto soglia (Basilicata 26-29/10, Sardegna 22/10).

## Controllato e in ordine

- **Link:** 0 rotti nell'HTML (56.930) e 0 nel DOM finale dopo il JavaScript; 0 ancore mancanti; 0 errori JavaScript; 0 richieste fallite verso file del sito, raw GitHub (`main` e ramo `anteprime`, 23 anteprime fisse controllate anche dal vivo) e Leaflet.
- **Sitemap:** 1.413 indirizzi nelle 10 sitemap dell'indice; ogni pagina indicizzabile è in una sitemap; nessuna sitemap punta a una pagina che non c'è; nessuna pagina `noindex` in sitemap (l'unico `noindex` è il `404.html`); nessuna pagina orfana (tutte hanno almeno un link in entrata).
- **Canonical e og:url:** uguali all'indirizzo vero su tutte le pagine (`/fonti.html` dichiara `/fonti`, che è l'indirizzo con cui la serve Cloudflare Pages); nessun `hreflang`.
- **JSON-LD:** 1.365 BreadcrumbList e 1 FAQPage, tutti validi, posizioni in ordine, ogni voce punta a una pagina che esiste.
- **Titoli e descrizioni:** nessun doppione su 1.412 pagine; ogni pagina ha un `h1`.
- **Rimandi:** i 47 rimandi di `_redirects` portano a pagine che esistono, nessuna sorgente esiste ancora come pagina, nessuna pagina li linka; `/index-5.html` lo aggiunge `pubblica-pages.js`.
- **Parametri della mappa:** 18.035 link `/?...` tutti validi.
- **Numeri cotti delle 22 pagine regione:** identici a quelli rifatti dal riepilogo (verdetto, 7/20/30 giorni, grafico, elenco zone); l'elenco zone di ogni regione coincide coi riepiloghi delle 114 zone.
- **«Ieri» solo se è ieri:** tutte le regioni dicono «Ieri, 30 ottobre»; Puglia «Giovedì 29 ottobre» con l'avviso, Slovenia il 29/10 (non cotta): giusto secondo `ultimoCompleto` (ma vedi il punto 1).
- **Zone piogge:** 114 pagine su 114 scrivono dopo il rendering gli stessi numeri del riepilogo di zona (ieri, 7 e 30 giorni).
- **Ritratti d'archivio:** 899 pagine paese su 899 coincidono col conto rifatto da `lib-clima.js` (9 pagine non hanno ritratto, come previsto sotto i 30 giorni o per pluviometro sospeso).
- **Ente citato:** 908 pagine paese su 908 citano l'ente della rete da cui il pluviometro prende i dati (anche i 5 posti col campo `rete`); 585 frasi «la zona con i suoi N pluviometri» coincidono con la pagina di zona; i 31 «in N paesi della zona» delle pagine meteo coincidono con `data/paesi-zone.json`.
- **Pagine contro generatori:** zone piogge, mappa forestale e pagine meteo escono identiche; regioni, funghi e zone funghi cambiano solo nei numeri d'archivio dei giorni passati da quando sono state scritte.
- **Dati:** nessun millimetro negativo o non numerico, nessuna minima sopra la massima, umidità sempre fra 0 e 100, vento sempre sotto i 200 km/h, direzioni valide, nessuna coordinata fuori area, nessun id doppio nello stesso file, nessun file copia del giorno prima (`check-doppioni`), retention sotto i 730 giorni ovunque (il più vecchio è dell'1/8/2025).

## Link esterni (non verificabili dal cloud)

Dal cloud risponde solo GitHub; gli altri domini danno 403 dal proxy. 63 indirizzi distinti su 50 domini. I più usati: `avventuremicologiche.it` (3.955 link), `www.youtube.com` (2.754), `www.googletagmanager.com` (1.412), `www.isprambiente.gov.it` (54), `geodati.gov.it` (29), `librewxr.net` (22), le carte forestali regionali (Lombardia, Liguria, Piemonte, Veneto, Emilia-Romagna, Lazio, Bolzano, Sicilia, Abruzzo, Puglia, Basilicata), le fonti dei dati in `fonti.html` (ARPA e servizi regionali, MeteoHub, GeoSphere, ARSO, MeteoSvizzera, OASI, Météo-France, MET Norway, Open-Meteo, GeoNames, EUMETNET, AWS Terrain Tiles, INGV), i social (`facebook.com`, `instagram.com`, `youtu.be`, `suno.com`). Due da guardare dal PC perché in `http`: `opendata.regione.abruzzo.it` e `webapps.sit.puglia.it` (carte forestali di Abruzzo e Puglia).

## Cosa c'è sul ramo

- `.github/scripts/genera-riepiloghi.js`: punto 6 (conto «pluviometri letti»).
- `fonti.html`: punto 7 (riga Esri).
- questo file.

Nessun file dati, nessuna pagina generata, nessun workflow toccato. Gli script del controllo (link, rendering, parametri, numeri, ritratti) stanno nello scratchpad della sessione cloud e non nel repo.
