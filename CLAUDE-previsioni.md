# CLAUDE-previsioni.md: le previsioni meteo

Pezzo del `CLAUDE.md` del repo, diviso per argomento il 1/11/2026 (scheda 107, sua scelta). **Prima si legge il
`CLAUDE.md`**: le regole che valgono sempre e l'indice di tutti i file. Qui sotto le sezioni sono quelle di prima,
tali e quali e nello stesso ordine: quando una nota dice «più su», «qui sotto» o «in fondo al CLAUDE.md», la sezione
può stare in un altro file, e il titolo si trova nell'indice del `CLAUDE.md`.

Per arrivare a una sezione: `grep -n "^## \|^### " CLAUDE-previsioni.md`, poi si legge da quella riga.
**Le note nuove di questo argomento vanno IN FONDO a questo file**, con una riga nell'indice del `CLAUDE.md`.

Sezioni:

- Pagine «Previsioni meteo <zona>» (/meteo/<zona>/, 24/10/2026)
  - Pagine «Meteo <paese>» (/meteo/<regione>/<paese>/, 28/10/2026)
- `/previsioni/`: la mappa delle previsioni con un indirizzo suo (28/10/2026)
- Previsioni senza regione: la vista Italia (27/10/2026)
  - Rifatta il 28/10/2026 sera: icone, cartina a rilievo, banner che scorre
  - Regione, valle e paese: la vista a etichette (29/10/2026 sera, scheda 100)
  - Controllo della mappa meteo del 30/10/2026 (sessione cloud, scheda 102)
  - Controllo della mappa e delle pagine del 31/10/2026 (scheda 103)
  - «agg.» a pochi minuti, come 3BMeteo e ilMeteo (30/10/2026 sera, scheda 102)
  - La schermata delle previsioni si aggiorna da sola (30/10/2026 sera, scheda 102)

---

## Pagine «Previsioni meteo <zona>» (/meteo/<zona>/, 24/10/2026)

Un TEST deciso dall'utente dopo l'analisi di 3B Meteo e ilMeteo: le ricerche «meteo + valle» le prendono poco, perché
i grandi ragionano per comune (ilMeteo ha 207 zone, 3B nessuna; delle nostre 114 zone circa 71 non le copre nessuno).
Una pagina FATTA PER la previsione della zona, accanto a quella piogge e a quella funghi: tre titoli per tre domande
(«Dove ha piovuto in…», «Funghi in… oggi», «Previsioni meteo…»).
- **Generatore** `.github/scripts/genera-pagine-meteo-zona.js` (`SOLO=<slug>` per una sola, sitemap non toccata). Tre
  gruppi: `ZONE_METEO` (A, le 10 zone più viste in GA4 + Val Brembana, il campione) in `sitemap-meteo.xml`,
  `ZONE_METEO_B` (le 20 successive) in `sitemap-meteo-b.xml` e, dal 30/10/2026, `ZONE_METEO_C` (le 20 dopo ancora per
  visite GA4 di 28 giorni, pagine zona piogge + zona funghi: dalla Riviera di Levante ai Monti Sabini) in
  `sitemap-meteo-c.xml`, ognuno misurato a parte in Search Console. Il C è stato preparato prima di leggere i numeri di
  A e B (suo: «sì, prepara le valli») e si pubblica dopo quella lettura (~3-4/11). ⚠️ **Dal 1/11/2026 il C ne ha 18**:
  Candalla e Val Serina tolte perche' quasi uguali ad Alpi Apuane e Val Brembana (7 paesi su 9 e 8 su 12 in comune),
  rimando 301 in `_redirects`, e `METEO_ASSORBITE` fa linkare alle loro pagine zona la pagina meteo che le contiene.
  Una zona nuova vuole anche la riga
  «Previsioni meteo <zona> →» nelle sue pagine zona piogge e zona funghi (`linkMeteo`: rigenerandole c'è da sola,
  altrimenti si inserisce dopo «Sto leggendo le previsioni dei paesi…»; ⚠️ le zona funghi hanno fini riga misti) e la
  rigenerazione delle «adesso» della sua regione (blocco «valle per valle»).
  ⚠️ **La Carnia, entrata col C, aveva 5 pluviometri su 6 FUORI dalla Carnia** (Tramonti di Sotto, Tramonti Invaso,
  Campone, S. Francesco, Sella Chianzutan: Prealpi pordenonesi), e la pagina meteo mostrava Tramonti e Frisanco. Rifatti
  il 30/10/2026 in `funghi-zone.json` (suo: «sistema la carnia»): Enemonzo, Villa Santina, Forni di Sotto, Sauris di
  Sopra, Comeglians, Ravascletto e Tolmezzo (in comune con la Valle del But, che resta la zona della sua pagina località:
  12 km contro 19). Paesi: Ampezzo, Enemonzo, Villa Santina, Forni di Sotto, Ovaro, Raveo, Sauris, Lauco, Tolmezzo,
  Comeglians, Ravascletto, Socchieve. Rigenerate le pagine della zona (piogge, funghi, meteo), le 11 località che
  entrano o escono, `funghi/friuli/` e la quota in `data/zone-regioni.json` (440 → 570 m). ⚠️ L'API delle previsioni
  tiene in cache la risposta della zona (30 minuti, poi la vecchia per altre 3 ore mentre ricalcola): dopo un cambio di
  paesi la pagina mostra quelli vecchi per un po'; in locale si toglie `.wrangler/state/v3/cache`.
- **Cosa c'è** (ogni punto deciso da lui sul campione): casella «Cerca il tuo paese, anche una frazione»; la **scheda del
  posto ora per ora si apre DA SOLA** sul primo paese della zona e, toccando o cercando un paese, si apre **sempre su
  OGGI**; «Il punto di stamattina» scritto dai dati; i 7 giorni da toccare (mappa, tabella e titolo seguono); la mappa
  col **RILIEVO del sito** (TINITALY/INGV, stessa ricetta dei boschi: qui si può, sotto non c'è la heatmap) e le
  etichette **CENTRATE SUL PAESE, su due righe** (sopra icona del cielo, minima blu e massima arancio, «💧0,8» solo se
  piove; sotto il nome), fondo bianco, niente puntino a parte e niente lineette. ⚠️ **REGOLA: DIRADARE, MAI SPOSTARE**
  (24/10/2026 sera, suo, dopo tre prove bocciate con puntino, etichetta spostata e lineetta; e' come fa la mappa di 3B):
  `sistemaEtichette` passa i paesi in ordine di importanza (quello di `paesi-zone.json`) e NASCONDE (`.via`) chi
  toccherebbe un'etichetta gia' messa o uscirebbe dalla mappa; sotto la mappa «Ingrandisci la mappa (+) per vedere gli
  altri N paesi» (`#mappa-nota`), e ingrandendo ricompaiono. Margine dell'inquadratura = mezza etichetta per lato
  (padding tel [58,26], pc [80,34]: se no i paesi sul bordo sparivano). Telefono: almeno 4 visibili, di solito 5-9;
  zero sovrapposizioni in 31 zone × 7 giorni; **niente pallini
  dei pluviometri** sulla mappa (confondevano: stanno nel blocco della pioggia caduta); tabella paese per paese; grafico
  30 giorni misurati + 7 previsti. **Le ore della scheda sono RIGHE, come 3B** (29/10/2026, suo, scelta fra tre bozze
  in `claudio\mockup-tabella-oraria\`: prima erano caselle in fila e «non c'è la tabella oraria»): ora, icona e parola
  («Nubi sparse»), temperatura, mm solo se piove e la %, vento con freccia e direzione (`vd` dell'API); al telefono la
  parola sparisce. **Oggi = il resto della giornata, come 3B, ma almeno 8 righe**: la sera continua con le prime ore
  di domani (riga «Domani» dove cambia il giorno; le 24 ore da adesso, provate, «allungavano troppo», suo); dal terzo giorno MET dà solo le fasce di 6 ore (notte, mattina, pomeriggio, sera). Codice comune a zone e paesi
  (`oreDi`, `righeOre`, stile `.tv`).
- ⚠️ **Il vento dell'API è in m/s**: la scheda moltiplica per 3,6 (il campione sbagliava).
- **La % di pioggia dappertutto (25/10/2026, suo)**: 7 giorni (la più alta fra i paesi), tabella, mappa (dal 10%),
  scheda (ore, fasce, giorni), grafico e «punto di stamattina». **Il segno è la GOCCIA 💧** (sua scelta, come
  weather.com e Google; 3B e ilMeteo scrivono solo «Prob. prec.») e i millimetri sono scritti «0,8 mm», anche nelle
  etichette della mappa. La pagina chiede `/api/previsioni?zona=<slug>&pr=1`: solo con `pr=1` la Function aggiunge `pc`
  ai giorni dei paesi, con UNA richiesta Open-Meteo per tutti (`probDi`, latitudini e longitudini separate da virgole),
  così resta sotto i 50 sottorichieste e le 6 connessioni.
  **Dal 25/10 sera anche il blocco «Che tempo farà» di tutte le pagine** (`meteoClient` di `lib-meteo-regione.js`:
  regioni, zone piogge e funghi, paesi, regioni funghi, indice /funghi/, mappa forestale): chiede `&pr=1` per
  `capoluoghi=`, `zona=`, `paese=`, `zonedi=` e `posti=`, e scrive «💧 X%» sotto ogni giorno (la più alta delle ore).
  Provato sull'anteprima `prova` coi tetti veri: Toscana con 21 zone e indice con 20 posti, tutte le righe con la %.
  ⚠️ Open-Meteo conta ogni posto della richiesta: se si arriva al tetto gratuito la % sparisce e il resto va.
  ⚠️ mm e icone sono di MET, la % di Open-Meteo: due modelli, a volte non tornano (5,8 mm con l'8%).
- **Link «Previsioni meteo <Zona> →»** nel blocco «Che tempo farà» delle zone piogge e funghi delle zone del test
  (`linkMeteo()`, chiamato dai due generatori di zona; evento GA4 `apri_meteo_zona`). La pagina ha il suo evento
  `meteo_zona` (azione) e `apri_mappa` con `da: meteo-<zona>-…`.
- **Paesi**: `data/paesi-zone.json` di `genera-pagine-zona-piogge.js`, ora con **almeno 8 paesi** (`MIN_PAESI`: sotto,
  il cerchio si allarga di 3 km fino a 30 nella regione). Quote cotte in `.github/scripts/quote-paesi.json`
  (`lib-quota-paesi.js`: Open-Meteo Elevation, ripiego tessere terrarium; `QUOTE_RIFAI=1` per rifarle).
- **Prove in locale**: le previsioni vogliono la Function, quindi `npx wrangler@4 pages dev . --port 8789` nel repo
  (con `http.server` dicono «non disponibili»). ⚠️ Il server locale tiene in cache le risposte di `/api/previsioni`:
  cambiando `paesi-zone.json` va fermato (anche i processi workerd) e tolto `.wrangler/state/v3/cache`. Gli attrezzi
  (campione, prove puppeteer, resoconto della sessione cloud) stanno nel banco, `claudio\mockup-previsioni-zona\`.
  ⚠️ **La mappa in locale chiede le previsioni alla porta 8788** (`API` in index.html): per provare le previsioni
  DENTRO LA MAPPA wrangler va sulla 8788, su un'altra porta la vista Italia cade sull'invito.
- ~~**La pagina madre `/meteo/`**~~ c'e' stata solo il 28/10/2026 (`paginaIndice`: le 31 zone per regione e i 20
  paesi). La sera stessa, suo: «la pagina madre meteo, ma che roba è? e a cosa serve? la pagina madre dovrebbe essere la
  mappa»: **la madre delle pagine meteo e' la mappa delle previsioni, `/previsioni/`**. Il percorso delle zone e dei
  paesi e' «Mappa pluviometrica › Previsioni meteo (→ /previsioni/) › <zona>», anche nel BreadcrumbList; `/meteo` e
  `/meteo/` rimandano a `/previsioni/` con un 301 in `_redirects`; niente voce in `sitemap-meteo.xml`. Google zone e
  paesi li trova dalle loro sitemap e dai link delle pagine piogge e funghi (`linkMeteo`, `linkMeteoPaese`).
- **«Guarda le nostre mappe» anche nelle zone (28/10/2026 sera)**: le tre anteprime vive delle pagine paese (vedi sotto,
  `mappeHtml` e `CSS_ANT` in `genera-pagine-meteo-zona.js`) al posto del bottone del radar e delle «altre pagine» (zona
  piogge, zona funghi, mappa, previsioni). `<reg>-7g.webp` si scatta per le regioni di `METEO_PAESI` E delle zone
  meteo (`SETTE` in `genera-anteprime.js`, 12 regioni). Fino al 29/10/2026 solo per i paesi, e nelle 10 zone di
  Lombardia, Lazio, Marche, Umbria, Campania, Calabria e Sicilia l'anteprima «Pluviometri» ripiegava su quella di IERI
  sotto la scritta «ultimi 7 giorni» (suo, sulla Val Brembana). Una zona meteo nuova in un'altra regione la aggiunge da
  sola; se il 7 giorni manca, la pagina ripiega ancora su ieri (la pillola in alto lo dice).
- **La barra che scorre SOPRA LA SCHEDA ORA PER ORA (30/10/2026, scheda 101 bis, suo: «sì, la barra»)**, zone e
  paesi: la stessa della vista Italia della mappa (`#vi-nastro`: fascia gialla, filetti rossi, blocco rosso tagliato in
  diagonale), `.pz-nastro` nello stile, `nastroHtml()` nell'HTML, `disegnaNastro()`/`naGira()` in `clientePagina`.
  ⚠️ **Fa da testata della scheda, nella stessa cornice blu** (suo, fra tre posizioni provate con `?nb=` e un
  confronto a quattro telefoni: «C, sopra la scheda»): prima stava sotto la mappa, e lui: «è un po' sprecata, è il
  nostro pezzo wow e uno deve scrollare tutto» (al telefono era a 2.750 px dall'inizio). Scartate: in cima sotto il
  menu, e in cima attaccata in alto scorrendo (40 px di schermo per sempre, e si muove mentre si leggono le ore).
  Toccando un paese la scheda li' sotto passa a quel paese e si porta in vista la barra; con la scheda chiusa (×) la
  cornice si chiude sotto la barra (`:has`). Mai fissa in fondo allo schermo: coprirebbe il testo. Nelle ZONE i paesi dal
  più basso al più alto coi metri (la valle che sale e la temperatura che scende); nelle pagine PAESE prima il paese,
  poi gli altri dal più vicino coi km. Blocco rosso «METEO <ZONA>» (`C.nastro`) e il giorno scelto nei 7 giorni; se il
  nome non ci sta (telefono oltre due righe, computer oltre metà barra: Colline Metallifere grossetane, Media Valle del
  Serchio) resta «METEO» col giorno (`taglia()`, classe `corto`). Scorre a 45 px/s, si trascina col dito o col mouse con
  lo slancio, un tocco sotto i 6 px apre la scheda ora per ora (evento `scheda-nastro`); ferma col mouse sopra, fuori
  dallo schermo (IntersectionObserver) e con «riduci movimento». ⚠️ `touch-action: pan-y`, non `none` come nella mappa:
  col dito in su e in giù la pagina deve scorrere. ⚠️ Si ridisegna solo se cambia la LARGHEZZA: al telefono la barra
  degli indirizzi che sparisce è un resize e la faceva ripartire. Il contenuto è ripetuto quanto basta a riempire la
  fascia e il primo paese parte dopo il blocco rosso (`padding-left`). Prova: 51 pagine × telefono 393, computer 1366 e
  1920, 153/153 (scratchpad 79554e37 `prova-nastro.js`).
- **La mappa col SATELLITE, come la vista a etichette (30/10/2026, scheda 101 bis)**, zone e paesi. Suo il 29/10:
  «dentro le pagine meteo la mappa deve diventare come quella nuova»; il 30/10, con la vista in prod: «dobbiamo rifare
  ovunque compaiono immagini meteo». Al posto di OpenStreetMap col rilievo TINITALY: la foto Esri World_Imagery
  schiarita come la mappa, fino allo zoom 13,5 (più vicino la cartina coi nomi delle strade, come `viFondo`). ⚠️ **La
  chiave e la luce si LEGGONO da `index.html`** al momento di generare (`SAT` = `SAT_FOTO`, `LUCE` = `LUCE_SAT` in
  `genera-pagine-meteo-zona.js`, in `C.sat`): se cambiano (la chiave scade il 29/9/2027) basta rigenerare le 51
  pagine. Etichette coi colori di `.ve-et` (bianco pieno, minima blu, massima rossa, ombra più scura), al computer su
  UNA riga (icona, nome, gradi, poi 💧 e mm) con `.r1{display:contents}` e `order`, al telefono su due; il paese della
  scheda aperta in BLU (`.scelto`, `SCELTO` in `apri()`), messo per primo nel diradare. ⚠️ **`#pz-mappa .pz-et.via`
  serve**: la regola con l'id batteva `.pz-et.via{display:none}` e i paesi da nascondere restavano a schermo sopra gli
  altri (il conto era giusto, la foto no: la prova ora guarda il `display` calcolato). Anche l'anteprima «Previsioni
  <Regione>» sta sul satellite (`miniMappa(id, larga, sat)`, confine bianco: il blu scuro sul mare scuro spariva); il
  radar resta sulla cartina. Prova: 51 pagine × telefono e computer (scratchpad 79554e37 `prova-mappa-sat.js`).
  Le foto delle previsioni di guida e home rifatte lo stesso giorno da `scatta-previsioni-nuove.js` del banco.

### Pagine «Meteo <paese>» (/meteo/<regione>/<paese>/, 28/10/2026)

Secondo TEST, deciso dall'utente il 28/10/2026 («la sezione meteo diventa un sito vero»; «20 pagine meteo paese di
prova, i paesi più cliccati, non devono andare in conflitto con le pagine funghi»). I grandi ragionano per comune: questa
e' la famiglia che porta il volume.
- **I 20 posti** sono `METEO_PAESI` in `genera-pagine-meteo-zona.js`: le pagine paese funghi con piu' clic da Google in
  28 giorni (Search Console al 28/10; GA4 dava quasi lo stesso ordine). Ognuno ha nome, preposizioni («sul Mottarone»),
  e se serve `nomi` (il pluviometro ha il nome della rete: «Mottarone - Baita Cai» → «Mottarone») e `primo` (Monticiano e
  Urbe: il pluviometro sta fuori dal paese, si mette in testa il comune). `sitemap-meteo-paesi.xml` a parte, data
  `meteoPaesi` in `pagine-lastmod.json`. Non aggiungerne senza aver letto i numeri.
- **Generatore** `genera-pagine-meteo-paese.js` (`SOLO=<slug>` per una sola): usa lo stile e il codice del browser delle
  pagine di zona (`clientePagina` con `C.solo`): scheda ora per ora aperta da sola sul paese, 7 giorni, «punto di
  stamattina» e grafico DEL PAESE; mappa e tabella dei paesi intorno, gli stessi di «Che tempo farà» della pagina funghi
  (`/api/previsioni?paese=<reg>/<slug>`, `data/paesi-localita/`); pioggia caduta AL PLUVIOMETRO dal file dei 25 giorni
  delle pagine funghi (`data/funghi/<reg>-giorni.json`, `C.giorni` + `C.id`). Senza `C.solo` e' la pagina di zona di prima.
- **Niente conflitto coi funghi**: titolo «Meteo Sassello: previsioni a 7 giorni, ora per ora», senza «funghi» ne' nel
  titolo ne' nella descrizione (la ricerca «meteo funghi Sassello» resta della pagina funghi). La pagina funghi porta
  qui: «Meteo Sassello: previsioni ora per ora →» in fondo a «Che tempo farà» (`linkMeteoPaese`, chiamato da
  `genera-pagine-localita.js`; evento GA4 `apri_meteo_paese`). Il 28/10 il link e' stato MESSO nelle 20 pagine funghi
  gia' fatte con gli stessi byte del generatore (rigenerandole con `SOLO` si sarebbe rinfrescato anche il ritratto del
  pluviometro, che si rifa' col giro stagionale).
- **Da qui si va solo SULLA MAPPA** (suo, 28/10: «i funghi è inutile», «le altre pagine sono troppo simili, quei 3
  pulsanti ti devono mandare sulle rispettive funzioni sulla mappa»): «Guarda le nostre mappe», tre bottoni uno
  sotto l'altro, anteprima VIVA sopra e etichetta gialla SOTTO (sopra copriva la Sicilia e le citta' della costa):
  - 📡 **Radar piogge** (`?r=<reg>&radar=ora`): l'ultima immagine LibreWXR su TUTTA ITALIA E UN PEZZO D'EUROPA, uguale
    per tutte (suo: «sulla regione è quasi sempre senza nuvole, almeno qualche nuvola si vede»);
  - ☀️ **Previsioni** (`/previsioni/?r=<reg>`): il tempo di oggi in TUTTE le citta' di `capoluoghi.json` della regione
    (`/api/previsioni?capoluoghi=`), inquadrate le citta' e non il confine; un'etichetta che non ci sta col nome perde il
    nome, poi la minima, e sparisce solo se non ci sta nemmeno cosi' (suo: «se metti solo 2 zone fa ridere»).
    ⚠️ **I capoluoghi di provincia prima di tutti** (28/10/2026, suo: «è più importante Savona di Millesimo»): in
    `capoluoghi.json` «s» e' la SIGLA della provincia, non «capoluogo» (Millesimo e Savona: SV), e nell'ordine
    alfabetico dell'API Millesimo si prendeva il posto. L'ordine lo da' il generatore (`ordineCitta` di
    `lib-capoluoghi.js`, `C.ant.ord` e `C.ant.cap`): capoluogo di regione, di provincia (elenco scritto in
    `lib-capoluoghi.js`: gli abitanti non bastano, Busto Arsizio > Varese), poi gli altri, dal piu' abitato
    (`data/elenco-paesi.txt`). La stessa regola nelle tabelle e nelle pagine «adesso»: vedi la sezione della testata
    qui sotto. I capoluoghi tutti interi o
    tutti senza minima, mai senza nome finche' ci stanno; dove uno non ci sta il posto resta vuoto (al telefono
    Montepulciano compariva al posto di Siena). Forzarli tutti no: in Toscana finivano uno sopra l'altro. Lo zoom
    sulle citta' e' senza animazione: le etichette si misurano subito e a meta' zoom Arezzo spariva senza toccare niente.
    Al telefono in Toscana ne stanno 6 su 10 (Prato, Pistoia e Pisa sono addosso a Firenze in 359 px). In
    `capoluoghi.json` mancano Biella e Vercelli;
  - 💧 **Pluviometri** (`?r=<reg>&g=7`): la pioggia degli ULTIMI 7 GIORNI, `<reg>-7g.webp` del ramo `anteprime`, che
    `genera-anteprime.js` scatta solo per le regioni di `METEO_PAESI` (5 scatti in piu' al giorno); se manca, quella di ieri.
  L'HTML e' `mappeHtml` di `genera-pagine-meteo-zona.js` (lo usano anche le zone dal 28/10 sera). Le disegna
  `clientePagina` (`C.ant`, il confine da `confineDi` di `genera-pagine-adesso.js`) quando i bottoni
  arrivano vicino allo schermo. Niente zona del pluviometro: quella delle pagine funghi a volte e' larga (Sassello sta
  nella «Val Bormida», ma e' in valle dell'Erro).
- **Il grafico** (anche delle zone, quando si rigenerano; suo: «ieri e oggi così è brutto, fai una cosa più di
  design»): i giorni previsti su un fondo azzurro chiaro col filo a sinistra, MISURATA e PREVISTA in maiuscoletto
  sopra le due parti, sotto l'asse una data ogni 7 giorni da ieri all'indietro, la pillola «oggi» e l'ultimo giorno
  previsto (`#graf-date`).
- **I sei bottoni sotto la scheda ora per ora** (`porte()` in `clientePagina`, anche delle zone quando si rigenerano;
  28/10/2026, suo): via «Temperature» («sono quelle di ieri e loro stanno vedendo le attuali»), al suo posto la pioggia
  a 30 giorni accanto a quella a 7: Vai alla mappa · Pioggia caduta ultimi 7 giorni (`g=7`) · ultimi 30 giorni (`g=30`) ·
  Radar piogge · Mappa boschi · Boschi + satellite. Righe alte uguali (`grid-auto-rows:1fr`), sotto i 380 px a 12 px:
  misurato a 360, 393 e 1366, nessuna scritta oltre le due righe.
- **La testata** (28/10/2026, suo: «non c'è intestazione nell'header, ma solo mappa pluviometrica, non c'è scritto chi
  siamo»): scelta fra tre proposte provate sulla pagina vera dopo aver guardato 3B Meteo, ilMeteo e Meteo.it; la sua e'
  la «B», come ilMeteo (dal 28/10 sera `lib-testata.js`, per tutte le famiglie: sezione qui sotto). Striscia scura col menu: Storico
  piogge (la mappa) · Previsioni meteo (gialla: la sezione) · Guida, a destra Chi siamo e Contatti (la home, `#noi` e
  `#piede`); sotto la fascia bianca: 🌧️ Mappa Pluviometrica, «Previsioni, radar e pioggia misurata in tutta Italia · un
  progetto di Avventure Micologiche», Iscriviti. Al telefono il menu sta sotto il nome e scorre di lato. **Larga come
  la pagina** (suo: «le scritte in alto non sono simmetriche»): la colonna di `main`, 760 px con 16 di margine, cosi'
  «Storico piogge», il logo e il titolo partono allo stesso pixel e «Contatti», Iscriviti e la scheda finiscono allo
  stesso pixel (misurato a 1905, 1366, 393 e 360); per starci il bottone e' «Iscriviti» e non «Iscriviti al canale».
  Tolti da lui: Radar, Pioggia caduta (doppione dello storico), Meteo dei paesi (doppione delle previsioni), Mappa
  boschi. Classi tutte `t-`: la pagina usa gia' `.pc`. ⚠️ `header` ha gia' `display:flex`, `align-items:center` e
  `flex-wrap:wrap` dallo stile della pagina regione: senza `nowrap` e `stretch` al telefono la pagina sbordava a 741 px.
- Eventi GA4: `meteo_paese` (azione, come `meteo_zona`), `apri_mappa` da `meteo-paese-<slug>-…` (anche
  `…-testata-storico` e `…-testata-previsioni`).

## `/previsioni/`: la mappa delle previsioni con un indirizzo suo (28/10/2026)

Chi cercava «previsioni meteo» trovava solo la radice, che per Google e' la mappa della pioggia. `/previsioni/` e' la
stessa mappa aperta sulla vista Italia delle previsioni, con titolo, descrizione, canonico e anteprima suoi. Il
sottodominio (`meteo.`) e' stato scartato: per Google e' un sito nuovo e dividerebbe i segnali; semmai un rimando 301.
- `functions/previsioni/index.js` prende LO STESSO index.html (`env.ASSETS`) e riscrive solo i meta con HTMLRewriter:
  niente copia da tenere allineata. `/previsioni` senza barra → 301 con la query.
- index.html: l'indirizzo `/previsioni/` vale come `?m=prev` (testata e «link con ?m=prev»); `/previsioni/?r=toscana`
  come `?r=toscana&m=prev`. Uscendo dalle previsioni l'indirizzo torna `/` (`indirizzoMappa`, anche dopo il passo
  indietro asincrono di `togliPassi`), e `buildShareUrl` non costruisce mai un link `/previsioni/`. `archie-avatar.webp`
  con la barra davanti: era l'unico file scritto senza percorso.
- In `sitemap-mappa.xml` solo se la Function c'e' (il repo di test non l'ha). La home punta a `/previsioni/`.
- **Fase B, da decidere coi numeri (~3-4/11)**: i link «Apri le previsioni» delle oltre 1.300 pagine da `?m=prev` a
  `/previsioni/`. ~~e il sottodominio come rimando~~ fatto il 31/10, qui sotto.
- **La porta `meteo.avventuremicologiche.it` (31/10/2026, scheda 103 bis, suo: «facciamo a e b»)**: un indirizzo da dire
  nei video, sui social e nei QR. Tutto → 301 a `/previsioni/`, il percorso si perde e la query resta
  (`meteo.…/?r=toscana` → `/previsioni/?r=toscana`). NON sta in questo repo: e' il progetto Pages `avventurepluvio-meteo`
  (un `_worker.js` solo, nel banco in `cloudflare-pages\porta-meteo\`), cosi' il sito vero non si tocca; si ripubblica da
  quella cartella con `npx wrangler@4 pages deploy . --project-name avventurepluvio-meteo`. Il dominio e' un custom
  domain di quel progetto. ⚠️ **Il DNS di avventuremicologiche.it sta su CLOUDFLARE** (nameserver
  addyson/giancarlo.ns.cloudflare.com, dal trasloco della home): il pannello DNS di Aruba e' vecchio (mostra ancora
  `@ → 75.2.60.5` di Netlify) e quello che ci si scrive non conta. I bottoni della home restano DIRETTI su
  `precipitazioni.` (dalla porta sarebbe un salto in piu'). Un dominio nuovo tutto suo e' rimandato: se ne riparla se le
  pagine meteo crescono (il meteo senza funghi, 2-30/10: 13 clic su 17.045).
- **Il nome del sito per Google (31/10/2026, stessa scheda)**: in testa a index.html `og:site_name` e il blocco WebSite
  (`application/ld+json`): «Mappa Pluviometrica», con alternateName «Mappa Pluviometrica Italia» e «Precipitazioni
  Avventure Micologiche» (come ci cercano davvero). Prima Google sceglieva da solo il nome sopra i nostri risultati.
  Arriva anche su `/previsioni/` (stesso index.html): innocuo, Google lo legge solo dalla pagina principale.

## Previsioni senza regione: la vista Italia (27/10/2026)

Il tasto «Previsioni» della home apriva `?r=liguria&m=prev`, perche' senza regione la mappa aspettava 15 s e restava
sullo storico. Adesso la home apre `?m=prev` e la mappa mostra la **vista Italia**: il tempo sui capoluoghi di regione,
come fanno 3B Meteo e ilMeteo (guardati quel giorno: nessuno parte da un riquadro vuoto con le istruzioni). Vale anche
per la linguetta «Previsioni» premuta senza regione. Mockup e prova nel banco di lavoro, `mockup-invito-previsioni\`.
Il repo di test non l'ha.
- **Il link senza regione e senza posto entra subito**: aspetta solo i confini sul computer e la barra in alto sul
  telefono. ⚠️ Sul telefono i confini da cliccare non si disegnano (c'e' la tendina): aspettando quelli si restava 15 s.
- **L'area finta `italia` in `data/capoluoghi.json`**: i 21 capoluoghi di regione (Aosta e Bolzano compresi), dal piu'
  abitato, perche' l'ordine decide chi resta quando le etichette si diradano. Non e' una regione scelta: `regioni()` e
  `zone()` restano vuote, `chiavi()` da' `['italia']` e la usa solo il disegno. ⚠️ 21 citta' in una richiesta sono lo
  stesso numero delle 21 zone della Toscana (`zonedi=`), che col tetto di 50 sottorichieste di Cloudflare va; in locale
  quel tetto non c'e', quindi si guarda su un'anteprima di ramo prima della produzione.
- **Si diradano, non si spostano** (`dirada()`, la regola delle pagine /meteo/): chi toccherebbe un'etichetta piu'
  importante o un riquadro (giorni, scheda, vetrina, barra del telefono) si nasconde e ricompare ingrandendo: 11 su 21
  sul computer, 8 sul telefono. ⚠️ Si nasconde il CONTENITORE di Leaflet: nascondendo solo l'etichetta il contenitore
  restava cliccabile, e un clic vicino a Siena apriva una citta' invisibile invece della Toscana.
- Le temperature restano anche sotto lo zoom 7,6 (`lontano()` salta la vista Italia).
- **Computer**: si tocca una citta' (scheda ora per ora) o una regione (si passa ai suoi capoluoghi; i confini non
  pulsano ma restano cliccabili e si scuriscono sotto il mouse). Sopra la casella il **fumetto** azzurro «Tocca una
  citta', una regione o digita una localita' qui sotto» (sua scelta fra quattro stili; la frase sotto i giorni l'ha
  bocciata, «troppo lunga»). **Telefono**: niente fumetto, la ricerca e' la barra in alto.
- Se le previsioni dell'Italia non arrivano resta l'invito di prima (`invito()`, la variante C4 dell'8/10).
- **Telefono, dal 28/10/2026 (suo: «la Sicilia e' tagliata»)**: `inquadraItalia()` mette l'Italia intera
  (`ITALIA_TEL`, Brennero-Capo Passero, Monte Bianco-Otranto, senza Lampedusa) al centro della striscia fra la barra in
  alto e il riquadro dei giorni. Prima restava la vista di apertura del sito: 86 px vuoti sopra le Alpi e Capo Passero
  sotto il riquadro. Lo zoom resta 5,25 (limita la larghezza). ⚠️ **La barra «Cerca il paese o scegli la regione»
  copre i primi 44 px della mappa**: le misure si fanno da sotto di lei (`sopraTel()`), se no l'Italia sembra scentrata.
- ⚠️ **Il riquadro dei giorni cresce DOPO l'inquadratura** (la vetrina arriva qualche secondo dopo: 139 → 189 px):
  un ResizeObserver su `#pv-pan` rifa' l'ultima inquadratura (Italia o regioni) se nel frattempo nessuno ha toccato la
  mappa (`toccata`), non c'e' una scheda aperta e non era quella di un posto (`inquadraPosto` spegne `rifai`).
- Sul telefono, nelle previsioni, la scritta della fonte in alto (`.fonte-tag`) non c'e': e' la stessa riga del
  riquadro («ECMWF via MET Norway · agg.»). Sul computer resta. Prova: `vista-italia-tel\prova.js` (scratchpad
  1cc91c9d), 23 casi: tre misure, dito sulla mappa, citta' toccata e richiusa, posto da link, tre regioni, computer.
- **Niente lampo dello storico coi link `?m=prev`**: le previsioni partono a mappa pronta e fino ad allora si vedeva lo
  storico (su una rete lenta da telefono ~12 s, col pannello dei periodi). Uno script in fondo alla `<head>` mette la
  classe `apre-prev` su `<html>`: periodi, aiuto, legenda e pallini nascosti, linguetta Previsioni accesa. La toglie
  `entra()`, o da sola dopo 20 s se le previsioni non partono. Contato fotogramma per fotogramma: lo storico prima si
  vedeva in 3-6 fotogrammi anche in locale, adesso in 0. Vale per tutti i link alle previsioni, anche delle pagine.

### Rifatta il 28/10/2026 sera: icone, cartina a rilievo, banner che scorre

⚠️ **Le etichette coi nomi qui sopra NON ci sono piu'** (punti «L'area finta», «Si diradano»: storia). Suo, dopo un'ora
di tentativi sulle etichette: «mancano Padova, Firenze, Genova», «deve sembrare un sito al livello loro», «come fanno gli
altri?». Guardati 3B Meteo, ilMeteo e Meteo.it su telefono e computer: tutti e tre ICONE SENZA NOMI su una cartina SENZA
SCRITTE, e le temperature a parte. Sue scelte fra quattro proposte e tre stili:
- **Solo icone** (`.pv-m.vi-ico`, bordo scuro perche' stacchino) su 92 citta' fisse: le 29 di `italia` (i 21 capoluoghi
  + Catania, Verona, Messina, Udine, Sassari, Grosseto, Brescia, Lecce; Padova e Bergamo tolte da lui) e i punti a 40 km
  di `italia-nord` (35) e `italia-sud` (28) in `data/capoluoghi.json`: tre richieste, ognuna sotto il tetto di 50
  sottorichieste. Un'icona che tocca un'altra icona, un riquadro o il banner si nasconde (`dirada()`), misurata sull'icona
  sola: le citta' sono fisse e l'icona non cambia misura col giorno (le etichette si, e Aosta andava e veniva).
- **Cartina a rilievo senza nomi** (`viFondo()`): Esri Ocean Base per il mare + Esri `Elevation/World_Hillshade` fusa in
  multiply, scurite col CSS; due pane sopra la cartina di sempre, solo nella vista Italia e sotto lo zoom 7,5. Tessere con
  la chiave ArcGIS del satellite (`window._esriChiave`, presa da `SAT_FOTO`); senza chiave (repo di test) il servizio
  pubblico. ⚠️ Con la chiave `World_Shaded_Relief` da' 404. Scartate: Light_Gray_Base (ha i nomi), Terrain_Base ritinta
  (mare rosa), colori pieni con la sagoma verde.
- **Banner che scorre** (`viPezzi()`, `#vi-nastro`): le 29 di `italia` con icona, minima e massima, stile Sky: fascia
  gialla, filetti rossi, blocco rosso «METEO ITALIA» col giorno, tagliato in diagonale. Scorre a ~45 px/s, fermo col mouse
  sopra e al tocco (riparte dopo 3 s), un tocco su una citta' apre la sua scheda. Al computer in fondo alla mappa (i
  crediti salgono sopra, `inquadraItaliaPc()` mette l'Italia sopra il banner); al telefono in fondo allo schermo sotto il
  riquadro dei giorni (suo: «il banner sotto e il meteo sopra»).
- **Niente vetrina** nella vista Italia (`vi-senza-vetrina`), computer e telefono. Scegliendo una regione torna tutto
  com'era: etichette coi nomi, cartina di sempre, vetrina.
- Misurato (prova `prova-finale.js`, scratchpad cfea5199 `meteo-paese\`): Capo Passero 22-232 px sopra il banner in 4
  misure, 63 icone a 1920 px e 33 al telefono, tessere Esri tutte con la chiave e nessuna a vuoto.
- ⚠️ **Lenta e col lampo della versione vecchia** (suo, la sera stessa sull'anteprima): il disegno aspettava tutte le
  aree, e la prima volta `italia` ci metteva 2,7 s, i 35 punti del nord 14 s e i 28 del sud oltre 60 s (la Function
  chiede MET a gruppi di 6). Adesso si aspetta solo `italia`; le icone in piu' sono quattro gruppi da ~16
  (`italia-alto`, `italia-nord`, `italia-centro`, `italia-sud`, divisi per latitudine), chiesti dopo e in parallelo da
  `caricaIcone()`, e si aggiungono man mano; il banner si riscrive solo cambiando giorno, se no ripartirebbe da capo a
  ogni gruppo. Il link senza regione ne' posto mette `apre-italia` su `<html>` (script in testa): vetrina e cartina di
  sempre nascoste e fondo scuro da subito, rilievo chiesto gia' in `entra()`; la toglie `viPezzi()` al primo disegno
  (o `invito()`, o i 20 s di sicurezza). Prova `prova-apertura.js`: sull'anteprima icone a 1,3 s al computer, vetrina e
  OpenStreetMap mai visibili.
- **29/10/2026, suoi**: al TELEFONO il banner sta SOPRA la riga dei crediti di MET Norway (`viPezzi()` lo mette DENTRO
  `#pv-pan`, fra i giorni e la riga `.fo`); al computer resta com'era, attaccato al fondo coi crediti sopra («su desktop
  i crediti andavano bene come prima», provato `bottom:26px` e tolto). E si TRASCINA («se lo tocchi
  si blocca, sarebbe bello muoverlo piu' veloce o indietro»): niente animazione CSS, `naGira()` lo muove a 45 px/s con
  requestAnimationFrame; col dito o col mouse avanti e indietro, al rilascio prosegue con lo slancio (smorzato 0,94 a
  fotogramma) e torna al passo; un tocco sotto i 6 px apre la citta'; fermo solo col MOUSE sopra (`pointerType`: col
  dito «enter» arriva senza «leave»). Prova `prova-trascina.js`.
- **29/10/2026, velocita' (suo: «velocizzare come si apre la pagina meteo madre»)**: lo script in testa, col link
  senza regione ne' posto, chiede SUBITO `italia` e i quattro gruppi delle icone (`window._previPronte`, indirizzo →
  promessa) e apre il collegamento a `ibasemaps-api.arcgis.com` (preconnect). `chiedi()` le prende da li'; se una e'
  andata male la richiede normale (i gruppi non hanno altre riprove). ⚠️ L'indirizzo deve essere identico a quello di
  `chiedi()`: alzando `API_V` va alzato anche `&v=14` nello script in testa, se no le anticipate restano inutili (niente
  si rompe, si perde solo il guadagno). Prima `italia` partiva a mappa pronta (sul sito: computer 1,3 s, telefono 2,9 s)
  e i gruppi dopo di lei. Misurato in locale (server HTTP/2 compresso, telefono 4G lento e CPU ×4): prime icone PC
  1,14 → 0,77 s, telefono 3,50 → 3,27 s; col calcolo da rifare (+2,3 s) PC 3,46 → 2,80, telefono 5,13 → 4,36, e
  TUTTE le icone PC 6,2 → 2,7 s, telefono 7,6 → 3,7 s. Attrezzi nello scratchpad db5b737b `velocita\` (server-prova.js,
  confronta.js, prova-funzioni.js, prova-guasti.js, prova-rinvio.js, prova-cache-function.mjs).
- **29/10/2026, il rinvio**: `window._dopoItalia(fn)` (script in testa, solo col link della vista Italia) fa partire DOPO
  la cartina OSM (sotto il rilievo non si vede; boschi e satellite accesi = non si tocca), la vetrina, le temperature di
  ieri e, al telefono, i confini delle regioni (li' non si disegnano; il caricatore se ne va subito). Scatta a vista
  disegnata e rilievo arrivato, o 3 s dopo il disegno, o a 10 s. Al computer i confini NO: `entra()` li aspetta.
  I gruppi delle icone arrivati insieme si disegnano una volta sola, 60 ms dopo il primo disegno (`ridisegnaIcone`):
  cinque disegni di fila tenevano fermo lo schermo del telefono.
- **29/10/2026, functions/api/previsioni.js**: «quella di prima subito, la nuova dietro» (`daCache`, `FRESCA` 30 min,
  `VECCHIA` 3 h): aree e posti in cache 3 h e mezza, dopo 30 minuti si rispondono subito e si ricalcolano con
  `waitUntil` (uno solo alla volta: la rimessa con 2 minuti di freschezza). Le risposte incomplete restano escluse.
  Prova `prova-cache-function.mjs` (15 su 15, cache e MET finti) e wrangler. Misura finale in locale (1+2+3+4, cache
  calda): prime icone PC 1,19 → 0,75 s, telefono 3,65 → 3,10 s; rilievo completo al telefono 4,92 → 4,39 s.
  Resta, da decidere: la pagina che si riscarica intera a ogni visita (niente ETag su `/`, 336 KB).
- **29/10/2026, bug del banner (suo: «bug grave»)**: dalla mappa senza regione, Previsioni e poi Indietro di Chrome (o la
  linguetta Storico), al computer il banner restava in fondo alla mappa della pioggia, e toccando una citta' si apriva la
  sua scheda e le icone si ridisegnavano sopra lo storico. `esci()` toglieva icone e rilievo ma non il banner: ora lo
  nasconde e toglie `vi-nastro-on` e `vi-senza-vetrina`; e il tocco sul banner fuori dalle previsioni non fa niente.
  Prova `prova-indietro.js` (scratchpad db5b737b `velocita\`): con la versione di prima NO al computer, ora 4 su 4.

### Regione, valle e paese: la vista a etichette (29/10/2026 sera, scheda 100)

La grafica della vista Italia portata su tutte le previsioni (sua idea: «se digito val bormida appare centrata sulla val
bormida e sempre barra scorrevole che scorre sui paesi della zona, lo stesso se digito calizzano»). Decisa su una bozza
nel banco (`mockup-vista-zone\`) dopo aver guardato 3B e ilMeteo: la mappa della valle o del paese coi vicini non ce
l'hanno. Codice in `index.html`, blocco «LA VISTA A ETICHETTE» (funzioni `ve*`), e `functions/api/previsioni.js`.
- **Fondo**: vista Italia sulla FOTO (Esri `World_Imagery`, `satL`, classe `vi-fondo`); regione, valle e paese anche
  (`FONDO_VICINO='sat'`) sotto lo zoom 13,5. Provato e lasciato nel codice il rilievo verde (`'verde'`: Ocean Base e
  Hillshade in multiply su un rettangolo `#cfe3a6` nel pane `vzColore`, classe `vz-fondo`): suo, «troppo anonimo, non si
  vedono case e strade». ⚠️ Con la nostra chiave Esri ci sono SOLO World_Imagery, Elevation/World_Hillshade e
  Ocean/World_Ocean_Base: strade, cartine, Terrain, Physical, Light/Dark Gray rispondono 404. **Satellite DECISO** (30/10,
  scheda 101, decisione 4: «a me non dispiace satellite, puoi schiarirlo leggermente per renderlo meno buio»): la foto e'
  schiarita a tacche, `LUCE_SAT` (0 = com'e', ogni tacca +6% di `brightness` sul pane `viFondo`, variabile CSS
  `--sat-luce`), su Italia, regione, valle e paese. **Sua scelta la 5** (+30%) fra 0, 2, 4, 5, 6: con la 6 neve e marmo
  diventano bianco pieno. Scartata una «6 morbida» (curva gamma con filtro SVG: solo le ombre, ma scorreva meno fluida).
  Per ritararla si cambia solo `LUCE_SAT`. Confronto con le foto: `mockup-vista-zone\decisione-4-luce.html` nel banco.
- **Quali paesi** (`veCandidati`): dall'elenco della ricerca (`data/elenco-paesi.txt`, gia' in memoria: `window._locCarica`,
  `window._locElenco`). Ordine: il posto cercato, poi i paesi della ZONA cercata (`data/paesi-zone.json`, chiave =
  `veSlug(nome)`), poi i CAPOLUOGHI di provincia (`veCapoluoghi`: il piu' abitato per sigla, piu' `CAP_FISSI` IM/CS/CL/TP/BT;
  ⚠️ la sigla «s» di capoluoghi.json NON vuol dire capoluogo, ce l'ha anche Millesimo), poi gli abitanti. Sulla regione
  anche le citta' delle regioni vicine, sbiadite (`.ve-et.altra`, abitanti ×0,35, mai nel banner); nella zona i paesi
  fuori zona ×0,25. **Diradare, mai spostare** (`veDirada`): almeno 14 px fra le etichette al computer e 6 al telefono,
  al massimo 28 e 14 (suo: «non e' troppo densa?» sulla zona di Brescia); gli altri compaiono ingrandendo. ⚠️ Unica
  eccezione, **i capoluoghi sulla regione si scostano** (30/10, scheda 101, sua scelta «D» fra quattro provate, decisione
  1): fra capoluogo e capoluogo basta 1 px, e quello che si toccherebbe sale o scende di mezza etichetta con una punta e
  un puntino giallo sul suo posto (classi `.su`/`.giu`); punta e puntino contano come etichetta, ma solo per la loro
  larghezza (14 px al centro: contata larga quanto l'etichetta, Bari non saliva sopra Napoli per 1 px). **Prima tutti i
  capoluoghi che stanno al loro posto, poi chi non ci sta si scosta, poi gli altri paesi** (30/10: in un giro solo
  Venezia scostata toglieva il posto a Trento e Trieste, che ci stavano). Scartate: etichette
  corte (icona + nome + sola massima) e sigle di provincia, +5 capoluoghi su 54 (Varese, Como e Lecco sono in fila a 25
  km: nessuna etichetta col nome ci passa). Con la D, su 6 regioni e 54 capoluoghi: PC 1536×702 da 41 a 50, telefono da
  39 a 43. ⚠️ **Allargando si vedono i capoluoghi di regione** (30/10, sua foto: Lombardia rimpicciolita, tre etichette
  su mezza Europa): i 21 `CAPITALI` stanno sempre in lista (`capreg`, sbiaditi se di altre regioni, mai nel banner),
  valgono come capoluoghi (1 px, fuori dal tetto) e passano subito dopo quelli di provincia; allargata di uno scatto o piu'
  oltre l'inquadratura (`VE.z0`) passano davanti a tutti. Lombardia al PC 1920×920: zoom 6 → 14 capoluoghi di regione,
  5,75 → 14 (Bari compreso, sua foto: «a questo zoom non c'e' Bari»), 5,5 → 12, 5 → 9.
- **Etichette** `.ve-et`: icona, nome, minima (blu), massima (rossa), centrate sul punto; il paese della scheda in blu
  (`.scelto`); al telefono sulla regione su due righe (`.due`).
- **Inquadratura** (`veInquadra`): regione = i suoi capoluoghi di provincia (non i confini interi, non le 5 citta' piu'
  grandi: la Lombardia non si vedeva intera); con meno di 3 capoluoghi tutti i comuni. Paese = 15 km attorno, zona = i suoi
  paesi (senza elenco: 18 km). Al telefono la regione e' spinta in basso sopra la scheda. ⚠️ Le ISOLE LONTANE non si
  inquadrano (30/10): fuori chi ha il comune piu' vicino della sua regione a oltre 40 km (Lampedusa, Linosa, Pantelleria,
  Ustica, Capraia); con loro la Sicilia al computer era a zoom 7,25 con 4 capoluoghi su 9 nascosti.
- **Banner**: anche fuori dall'Italia (`veNastro`), «METEO <REGIONE>», «METEO <ZONA>», «METEO <PAESE> E DINTORNI» coi km.
- **Scheda ora per ora**: si apre da sola (`veApri`, una volta per vista, a inquadratura fatta) sul cercato o sul primo
  paese che si vede. Al computer SOTTO il riquadro dei giorni (`posizionaDet`, classe `stretta` se e' bassa); al telefono
  foglio al 40% che si scorre. ⚠️ **Schermi bassi** (mappa sotto i 760 px, classe `pv-bassa` da `segnaBassa`; 30/10,
  scheda 101, sua scelta «A» fra tre, decisione 2): a 1536×702 (schermo 1920 al 125%) e 1366×768 la scheda mostrava 0 ore;
  ora «Indietro» sale accanto allo zoom, il riquadro si accorcia e a scheda aperta i giorni stanno solo nella scheda:
  6-7 ore e 5. Scartata la scheda a destra sopra la mappa (piu' ore, ma la regione si stringeva: Lombardia 4 capoluoghi
  su 12 a 1366). Bottone «💧 Storico piogge di <paese>», niente funghi («deve sembrare un sito meteo vero»).
- **Vince l'ultimo gesto** (`VE.ultimo`): paese poi regione = regione (la scheda del paese si chiude se non c'e'), regione
  poi paese = paese. Una ZONA dell'elenco che si chiama come la sua regione («Lombardia», «Emilia») e' quella regione; le
  regioni si cercano per nome intero («Emilia-Romagna», «Friuli Venezia Giulia»): `locCarica` le aggiunge come zone con
  sigla «regione» (`posto.regione`).
- **Dati**: `?punti=lat,lon;...` nella Function, al massimo 15 (a freddo 3 sottorichieste a punto, tetto 50), ognuno con la
  sua cache di cella; si chiedono solo i paesi che si vedono. Su Cloudflare vero 15 a freddo in 1,2 s.
- Prove nello scratchpad db5b737b `velocita\`: `prova-vista-zone.js`, `prova-bardolino.js`, `prova-regioni.js`
  (le 21 regioni: tutti i capoluoghi visibili?), `prova-correzioni.js`, `prova-nomi-zone.js` (la ricerca vera nella casella).
- **Caccia ai bug del 29/10 sera** (scheda «100 ter», rapporto `side-session-notes\local_e1840b66…\bug-vista-zone.md`),
  corretti: al telefono il banner coperto dalla scheda → con la scheda aperta si appoggia sopra di lei (`naSopraDet`);
  al computer la regione tagliata → si inquadrano TUTTI i comuni (al telefono restano i capoluoghi); etichette ferme sui
  trattini → chi non risponde si nasconde e si riprova dopo 15 s, fino a 3 volte (`VE.falliti`); «METEO ITALIA» rimasto
  dopo una ricerca → il banner cambia nome subito; titolo coi nomi delle regioni → il nome del posto; etichette sotto
  «Indietro», i crediti e la fonte → sono ostacoli anche loro; paese di montagna con un'etichetta sola → il cerchio si
  allarga finche' ci sono 10 comuni (fino a 40 km); il cercato sotto la casella → anche lui si nasconde sotto i riquadri;
  il blu che non passava → passa al tocco; zona aperta su un paese di un'altra valle (Mugello → Sesto Fiorentino) → la
  scheda si apre sul PRIMO paese dell'elenco della zona o, senza elenco, sul comune piu' vicino al suo punto. ⚠️ **Il
  primo dell'elenco e' il piu' vicino al punto, non sempre il principale** (Lunigiana → Podenzana): per 51 zone su 114
  vale `ZONA_PRINCIPALE` in index.html (30/10, scheda 101, decisione 3: lista mia, i dubbi controllati sulle fonti, suo
  «va bene»; Lunigiana → Aulla, Val Trompia → Gardone, Carnia → Tolmezzo, Valbelluna → Belluno). Lista con i motivi:
  `mockup-vista-zone\decisione-3.html` nel banco. Le pagine meteo delle zone usano ancora il primo dell'elenco; «Molise» apriva il comune di Molise → la regione passa davanti, e «Trentino-Alto Adige» (le due province), «Val
  d'Aosta», «Valle Aosta», «Südtirol», «FVG», «Lucania» sono nomi delle regioni; il capoluogo di REGIONE (`CAPITALI`) viene
  prima e la scheda si apre li' (in Abruzzo si apriva Pescara, in Calabria Reggio); i capoluoghi di provincia si nascondono
  solo se si sovrappongono davvero (margine 1 px).
- **Secondo giro della caccia, corretti il 30/10 (scheda 101)**: **22** (alto) dal telefono al computer o viceversa
  restavano i pezzi dell'altra misura (banner a meta' mappa col `bottom` del telefono, niente ricerca nel riquadro, il
  «Seleziona regione» del telefono sopra «Indietro», la regione inquadrata per il telefono) → passata la soglia dei 900
  px `nuovaMisura()` rimette tutto come all'ingresso (`cercaNelRiquadro`, `pillolaNelRiquadro`, `window.updateGuidePulse`
  esposta apposta) e la vista si rifa'; **19** il tetto (28 al computer, 14 al telefono) conta TUTTE le etichette,
  capoluoghi compresi (contando solo gli altri si arrivava a 34 e 20), e i capoluoghi passano sempre per primi; **21**
  aspettando l'elenco dei paesi si disegnava la grafica vecchia, e se l'elenco non arrivava nessuno lo richiedeva → si
  aspetta senza disegnare (`veDisegna` torna `'attesa'`) e si riprova dopo 3 s, fino a 5 volte; **17** «Indietro» dopo
  regione e paese chiudeva la scheda aperta da sola (sembrava non fare niente) e poi usciva dal sito → **come un sito a
  pagine** (sua scelta «B» fra A «la scheda da sola non conta, Indietro esce» e B): ogni cambio di VISTA e' un passo e
  Indietro rimette la vista di prima (paese → regione → Italia → fuori). I passi in `pila` ('prev', 'scena', 'det'),
  ogni voce con la sua vista (`pvs`: regioni spuntate, posto cercato, `VE.ultimo`), la prima vista timbrata sulla voce
  che c'e' gia' (`timbra`); `segnaScena` dopo ogni caricamento; `rimettiScena` rimette con le strade di chi sceglie
  (tendina, spunte, ricerca); la scheda aperta da sola (`apriPunto(...,true)`) non e' un passo, quella toccata si', e se
  poi cambia la vista il suo passo diventa quello della vista. NON corretti, apposta:
  **20** (al telefono la Campania senza il Cilento: al telefono si inquadrano i capoluoghi, scelta del 29/10, e si
  vedono tutti) e **23** (al telefono l'etichetta blu sparisce ingrandendo: la prova ingrandiva sul centro con un
  comando, al telefono i tasti + e − non ci sono e col dito si ingrandisce dove si tocca).
- **Giro di caccia sul sito VERO, 30/10 pomeriggio (scheda 101, dopo la pubblicazione; suo: «se flashano pagine
  diverse, avanti e indietro tra le funzioni, formati di schermo»)**: gesti veri in Chrome headless (clic, tocchi, frecce
  del browser) con un registratore che ogni 40 ms annota cosa cambia, e i fotogrammi dello schermo dell'apertura. Trovati
  e corretti: **il lampo della cartina stradale** col link di una regione o di un paese (1,5-2 s di cartina OSM dello
  storico, prima su tutto il nord e poi sulla regione col confine, e al computer la vetrina, poi il satellite) → classe
  `apre-vista`, gemella di `apre-italia`, che la toglie `viPezzi()` a vista fatta; **il banner fermo** tornando
  all'Italia con Indietro («METEO CALIZZANO E DINTORNI» sopra le icone di tutta Italia: `na._g` restava quello di
  prima) → `veNastro` azzera `na._g` e viPezzi azzera `VE.nastro`; **«Avanti» che non faceva niente** (e dopo, il primo
  Indietro andava a vuoto) → ogni voce nostra porta `pd` (l'altezza nella pila) e, se scheda toccata, `pt`: una voce piu'
  alta della pila e' un Avanti e si rifa' il passo (dallo storico solo l'entrata 'prev', con `entra(true)`); **Indietro
  da una scheda toccata** lasciava la vista senza scheda → riapre quella di prima (`detPrima`, di solito quella aperta
  da sola). Sui **16 schermi** (dal 2560×1300 al 320×568 e al telefono girato; `giro-formati.js` nello scratchpad della
  101): **telefoni bassi** senza regione (Liguria a 375×667 = nord Italia, a 360×640 l'Europa con l'Islanda, a 320×568 il
  mare: i margini di `veInquadra` superavano la mappa) → alla vista restano almeno 180 px, si toglie prima la spinta in
  basso, poi il margine sotto; **banner mai visibile nella vista di un paese al telefono** (scheda gia' aperta al primo
  disegno: `naSopraDet` cercava nella pagina il banner appena creato) → viPezzi lo appende prima; **«METEO ITALIA
  UNDEFINED NAN»** al telefono, chiudendo una scheda nella vista Italia (c'era gia' in produzione: `chiudiDettaglio`
  chiama `viPezzi()` senza giorno) → senza giorno non si riscrive. Al computer, 6 schermi: nessun difetto. Poi (suo
  «sistema anche questi»): **telefono girato** (852×393 prende le regole fino a 900 px del tablet in verticale: alla
  mappa restava una striscia) → `@media(max-width:900px) and (max-height:500px) and (orientation:landscape)`: via le
  due strisce in fondo e la vetrina, riquadro e scheda in una colonna a sinistra di 330 px (`COLONNA`), banner in fondo
  accanto; in JS `oriz()` per veInquadra, inquadraItalia, inquadraPosto, tieniInVista e il ridimensionamento;
  **«Avanti» nello storico** (modulo «Indietro in tutto il sito»: ogni popstate valeva Indietro) → le voci `{st:1,i}`
  col numero, `rifare` (come si riaccende il livello spento: regioni o paese, periodo, tasto, `window._riapriScheda`) e
  `rifacendo` (si aspetta che il livello ci sia prima di riallineare); **Indietro dal radar aperto dalle previsioni**
  lasciava lo storico → `window._radarDaPrev` (messo dal «📡 Diretta radar», visto acceso in `guarda`), e Indietro
  spento il radar rientra nelle previsioni (`window._prevEntra`, col suo passo).

### Controllo della mappa meteo del 30/10/2026 (sessione cloud, scheda 102)
Suo: «check completo, in particolare mappa meteo e tutti i passaggi tra storico e meteo». Fatto da una sessione cloud
(PR in bozza «[NON UNIRE] Controllo mappa meteo del 30/10», ramo `claude/zealous-wright-ktc8ti`, resoconto
`check-meteo-30-10.md` sul ramo). ⚠️ Dal cloud il sito vero NON si raggiunge (proxy 403 su sito, api.met.no, Esri,
OSM): ha provato una copia di main con previsioni finte. 13 difetti; suo «ok a tutto» sulle soluzioni proposte. Tutti
i punti hanno un commento «controllo del 30/10/2026» in `index.html`:
1. **Risultati della ricerca sotto la scheda** (computer): `#loc-drop` sta in `#pv-pan` (z 1200), `#pv-det` ha 1250 →
   `body.modo-prev #pv-pan:has(#loc-drop.aperta){z-index:1300}` sopra i 900 px.
2. **Paese cercato + tocco su un vicino → Storico vuoto, paese perso**: il tocco azzera `cercato` → in `esci()`, senza
   regioni scelte, vale `posto.src`.
3. **La ricerca nelle previsioni cancellava il periodo dello storico** (`_svuotaScelta`), e un Indietro andava a vuoto →
   `entra()` si ricorda il tasto del periodo (`periodoPrima`), `esci()` lo ripreme se l'analisi non c'e' piu'
   (`rimettiPeriodo`, aspetta le regioni).
4. **Radar o boschi spenti entrando non tornavano** → `modoPrima` in `entra()`, riacceso da `esci()` (non uscendo con un
   periodo, il radar, i boschi o «Storico piogge di <paese>»).
5. **Stessa regione dopo l'Italia: la scheda non si apriva piu' da sola** → in `disegna()`, nella vista Italia,
   `VE.scena=''`.
6. **Cartina stradale per ~1 s** entrando dalla linguetta e passando dall'Italia a una regione → `apreVista()` (la
   classe `apre-vista` dei link, fondo scuro senza cartina, 8 s di sicurezza): in `entra()` senza link e in `viFondo()`
   quando la foto dell'Italia se ne va prima della vista nuova; la toglie `viPezzi()` a vista fatta. Misurato col
   campionamento ogni 40 ms: sito pubblicato 200 e 440 ms, corretto 0.
7. **Telefono girato sulla vista Italia senza reinquadratura** → `nuovaMisura()` chiama `inquadra()` se `italia()`.
8. Schermi bassi: a scheda aperta il «📡 Diretta radar» sparisce dal riquadro. **Lasciato** (scelta «A» degli schermi
   bassi; chiudendo la scheda torna).
9. **Icona della vista Italia sotto i crediti** (1536x702) → `dirada()` conta crediti e scritta della fonte, come
   `veDirada`.
10. **`?m=prev` restava nell'indirizzo uscendo** → `indirizzoMappa()` toglie anche lui (solo lui).
11. **Link alle previsioni di una regione: l'ultimo Indietro toglieva la regione invece di uscire** → al primo gesto a
    previsioni accese il modulo «Indietro in tutto il sito» prende la base lo stesso (`base=attivi()`).
12. Andata e ritorno da un link di pagina: lo storico prende anche le regioni vicine. **Lasciato**: e' la ricerca normale.
13. **Link vecchi `?m=prev&l=…&n=…` senza `r`: 15 s di mappa vuota** → `l` nello script in testa (apre-vista) e
    `soloPosto` nell'attesa dei link: si entra a mappa pronta e si cerca il posto (`tieniPosto`).
Prova: `prova-correzioni.js` nello scratchpad della scheda 102 (un caso per difetto, la ricerca vera dalla casella),
16/16 al telefono 393x760, tutti al computer 1366x657 e 1920x920, 6 e 9 a 1536x702, 7 a 393x852 girato.

### Controllo della mappa e delle pagine del 31/10/2026 (scheda 103)
Suo: «controllo accurato su tutto il resto della mappa», poi «via per i 6 punti». Attrezzi nello scratchpad della scheda
103: legenda della mappa contro `data/riepiloghi` stazione per stazione (`giro-numeri2.js`, gancio in render iniettato
nella copia in memoria), schede dei pluviometri (`giro-schede.js`: numero grande = somma delle barre), 22 tipi di link
delle pagine (`giro-link.js`), schermi, ricerca, Invia link/foto. Tutto il resto tornava (contando la regola del
confine del 19/10). Corretto:
1. **Giorni a stima nelle pagine** (Puglia 26-29/10, tutto `open-meteo-gapfill`): la pagina scriveva «Il 29 ottobre
   2,9 mm a Monopoli» e «non stime da modello», e il suo bottone apriva la mappa su «Nessun dato». Ora
   `genera-riepiloghi.js` usa la regola di `usaGiorno` (`soloVere`: su UN giorno le stazioni `om` non contano, una
   cartella con meno di 5 vere non conta) e segna `stime: {dal, al}` sui periodi lunghi (`stimeInCoda`, come
   `avvisoStime`); `lib-numeri-regione.js` e la pagina di zona scrivono in cima l'avviso giallo `.avviso-stime`, e la
   frase «non stime da modello» dice dell'avviso. Senza periodo 1 la descrizione parte dai 7 giorni (maiuscola) e
   `genera-sitemap.js` prende la data dal tasto `t7`.
2. **`FRIULI_ESCLUSE`** in `index.html` (letta anche da `lib-escluse.js`): Pontebba OSMER `osmer_213200` (0 mm in ogni
   ora consegnata, verificato sull'archivio orario OSMER; manca nei giorni di pioggia) e Pontebba T.P. MeteoHub.
3. **Friuli all'80% anche nelle pagine** (`COPERTURA_REGIONE` in `genera-riepiloghi.js`, regione e zone): la mappa ce
   l'ha dal pilota (`COV_MIN`), e la pagina contava pluviometri che la mappa non mostra.
4. **Abruzzo**: finche' la mappa e' su Open-Meteo, la scheda del pluviometro non legge `data/abruzzo` (i file della
   prova MeteoNetwork + ICON, accoppiati per nome davano barre di un'altra fonte): «Storico non disponibile».
6. **Ricerca**: un posto del geocoder col nome identico a quello scritto e piu' abitanti del primo dell'elenco va in
   cima («nizza» → Nizza di Francia); «frazione» non per le sedi di comune (PPLA*, PPLC: Reggio Calabria); i nomi
   scritti attaccati («santanna», «santangelo») trovano l'inizio del nome senza spazi. Lasciata «Sant'Anna di Stazzema»
   (GeoNames ha solo «Sant'Anna», senza comune).
5. **Legenda sui PC con lo schermo basso** (1366x768: finestra utile ~657-717 px; la legenda scorreva in un riquadro,
   184 px di contenuto e 108-152 in vista, numeri e invito sotto): sua scelta «A» fra due varianti del mockup
   (`D:\video youtube\claudio\mockup-legenda-pc-bassi\`; la B, invito in cima, a 657 tagliava i numeri). In `index.html`
   `@media (min-width:901px) and (max-height:780px)`, lo stesso pannello compatto della mappa forestale: sei periodi su
   una riga («7 gg», `.tp-corta`), `#tp-status.tp-ok` via, invito un filo piu' basso. In `positionLegend` un
   ResizeObserver anche sul pannello del periodo: la riga «✅» sparisce a caricamento finito e la legenda restava 39 px
   sotto. Prova `prova-legenda-bassa.js` (7 altezze da 600 a 920, ieri/7/30 giorni/3 regioni/paese/radar/boschi/errore,
   telefono): 51/51; sotto i 657 px (1366x600) la legenda scorre ancora.

### «agg.» a pochi minuti, come 3BMeteo e ilMeteo (30/10/2026 sera, scheda 102)
Suo: alle 20:07 la scritta diceva «agg. 18:17» (l'ora in cui MET aveva calcolato la previsione, la piu' recente che
c'era), mentre 3BMeteo e ilMeteo scrivono un'ora di pochi minuti prima. MET dice fino a quando ogni previsione e' quella
in vigore (`Expires`, misurato da 5 a 31 minuti, diverso per ogni punto) e chiede di NON richiederla prima. Quindi:
- `functions/api/previsioni.js`: ogni punto porta `scade` (l'Expires di MET); un'area porta `valida` (la prima
  scadenza delle sue citta') e resta fresca fino a li', al massimo ogni 2 minuti; il ricalcolo dietro riceve l'area di
  prima e chiede a MET SOLO le citta' scadute («OGNI CITTA' QUANDO SCADE LA SUA» in previsioniDi).
- `index.html`: «agg.» = l'ora di adesso o `valida`, se viene prima («AGGIORNATE A POCHI MINUTI FA»); senza `valida`
  (cache di prima) l'ora di MET come prima.
Prova di 8 minuti sulla vista Italia (`prova-scadenze.mjs` nello scratchpad della scheda 102): 2 citta' richieste a
MET, zero prima della scadenza, scritta al massimo 145 s indietro. ⚠️ Capita che MET, appena scaduta, risponda ancora
con la stessa scadenza (la sua copia non e' rinnovata): si riprova dopo i 2 minuti, e intanto la scritta resta a quella
scadenza. Dal 31/10/2026 lo stesso nelle pagine «adesso» (lib/pagina-adesso.js), vedi «La pagina «adesso»: «aggiornate
alle» a pochi minuti» nella sezione della testata.

### La schermata delle previsioni si aggiorna da sola (30/10/2026 sera, scheda 102)
Suo: «immagina un locale o un pc che tiene aperta una schermata meteo». Prima restava ai dati dell'apertura (icone,
gradi, banner, «agg.») e dopo mezzanotte «oggi» era ieri. Ora (`index.html`, «SI AGGIORNA DA SOLA» nel modulo previsioni):
ogni 10 minuti, SOLO a pagina in vista (`visibilitychange`: tornando in vista, subito se ne sono passati 10), si
richiedono le aree caricate, le etichette viste (`?punti=`) e la scheda aperta, con `&r=<minuto>` per saltare la cache
del browser (non quella del server); si mettono al posto delle vecchie quando arrivano e si ridisegna solo se i dati sono
cambiati (il banner non riparte da capo per niente). La mappa non si sposta, la scheda resta aperta. A mezzanotte
`giorno=0`. «agg.» si riscrive ogni 30 s (`scriviAgg`, `ultimaVal`). Per le prove `window._prevRinfresca(mezzanotte)`.
Prova `prova-rinfresco.js` nello scratchpad della scheda 102: PC 7/7; telefono 6/7 (a scheda aperta il tocco della prova
su «domani» non arriva ai giorni del riquadro), e la mezzanotte al telefono provata a parte: riquadro e scheda tornano
a «oggi».

## Lo sfarfallio aprendo le previsioni dalla home (1/11/2026 sera, scheda 108)

Suo: «se apro da home page previsioni il sito sfarfalla un po' all'apertura». Il tasto della home apre `/previsioni/`
(= `?m=prev` senza regione: `apre-prev` + `apre-italia`). Dal 31/10 (scheda 104, «La foto dal satellite sotto la pioggia»
in `CLAUDE-mappa.md`) la foto della pioggia sta nel pannello `foto` (z 205), FUORI da `.leaflet-tile-pane`: le regole
`apre-italia` e `apre-vista` del 28-30/10 nascondono solo il tile-pane. Misurato sul sito vero (filmato a fotogrammi e un
registratore ogni 25 ms), prima della vista delle previsioni si vedevano: al PC il riquadro bianco «Seleziona regione»
dello storico (c'e' finche' `updateGuidePulse` non lo spegne); il fondo da grigio `#3e526b` a blu `#123a52` e ritorno
(`body.foto-on #map` vince su `html.apre-italia #map`: stessa specificita', viene dopo); la foto della pioggia a pezzi
sull'inquadratura dello storico, coi confini bianchi; poi la foto SPARITA (icone sul grigio) e ricomparsa piu' in la' (al
telefono ~0,4 s); al telefono `#fonte-tag` dello storico in alto («Fonte: —», poi «5.919 pluviometri in 5 nazioni»).
Stesso difetto con `?m=prev`, col link di una regione e col telefono girato.
- **Correzione, solo CSS**, nel blocco in testa dopo `html.apre-vista #map{...}` («E LA FOTO DELLA PIOGGIA»): pannello
  `foto` nascosto sotto `apre-italia` e `apre-vista` (si scarica lo stesso: sono le tessere della foto delle previsioni,
  che poi arrivano dalla cache), fondo `#3e526b` anche con `foto-on`, `.leaflet-overlay-pane` nascosto sotto
  `apre-italia`, `#fonte-tag` sotto `apre-prev`, `#region-panel` sotto `apre-prev` oltre i 900 px (la stessa soglia di
  `updateGuidePulse`, `innerWidth<=900` = telefono). Copre anche la foto sfocata della scheda 106 bis (stesso pannello,
  classe `foto-sotto`): senza questa regola lampeggiava anche lei.
- **Prova** (banco, `sfarfallio-108\`: `misura.js`, `tempi.py`, `strade.sh`, `coppia.py`): 15 strade col file del repo
  sul sito vero: `/previsioni/` al PC e al telefono, prima visita e gia' visitato, telefono girato, `?m=prev`,
  `/previsioni/?r=liguria`, `?r=toscana&m=prev` al PC, al telefono e girato, radice al PC, al telefono e girato, linguetta
  Previsioni e ritorno. Sempre un fondo solo, nessuna foto che sparisce, zero errori; radice e linguetta come prima. Tempi
  uguali entro il rumore (giri uno alla volta: vista al PC 0,9-1,5 s, al telefono 4G con CPU ×4 2,9-4,7 s). Da sapere:
  prima la prima immagine (quella sbagliata) arrivava ~1 s prima; adesso si resta sul grigio fino alla vista vera.
- **Resta, piccolo, solo coi link di una regione** (`apre-vista`): i confini della regione bianchi sul grigio per un
  attimo (PC ~0,15 s, telefono girato ~1 s), finche' `foto-on` si spegne e tornano blu. C'erano anche prima, sopra la
  foto. Li toglierebbe `html.apre-vista #map .leaflet-overlay-pane{visibility:hidden}`, non messa: `apre-vista` vale
  anche fra una vista e l'altra delle previsioni (linguetta, dall'Italia a una regione) e andrebbe provata li'.

