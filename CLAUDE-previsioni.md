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
- ~~**Fase B, da decidere coi numeri (~3-4/11)**: i link «Apri le previsioni» delle oltre 1.300 pagine da `?m=prev` a
  `/previsioni/`.~~ fatta il 2/11/2026: sezione «La fase B delle previsioni» in fondo. ~~e il sottodominio come
  rimando~~ fatto il 31/10, qui sotto.
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

## Lo zoom minimo delle cartine delle pagine meteo (2/11/2026, scheda 109)

- Trovato dal check notturno: la cartina delle 49 pagine meteo di zona e delle 20 di paese (`pz-mappa`, stesso codice
  in `genera-pagine-meteo-zona.js`) non aveva zoom minimo e si rimpiccioliva fino al planisfero (zoom 0). Ora, dopo
  `fitBounds`, `setMinZoom(Math.max(6, Math.floor(zoom) - 4))`: al massimo 4 livelli sotto l'inquadratura, mai sotto il
  6. Misurato sul sito vero col file nuovo: telefono inquadratura 9,75-10,75 → minimo 6, PC 10,25-11,5 → 6-7; a quel
  punto si vede l'Italia del nord e del centro sulla foto, e il tasto «−» si spegne. 69 pagine rigenerate, +3 righe
  ciascuna, nient'altro cambiato. Le pagine «adesso» (`lib/pagina-adesso.js`, cartina OSM) hanno lo stesso minimo a 0:
  non toccate (fatte il 2/11 dalla 110 bis, con un altro minimo: nota in fondo).

## I confini coi link di una regione e la scheda della sera (2/11/2026, scheda 109 quater)

Tre ritocchi delle previsioni in `index.html`, provati su copie sul sito vero (suo «sì, tutte e sei»). Attrezzi nel
banco, `scheda-109-quater\`: `fai0.py`, `fai4.py`, `fai4b.py`; `misura.js` e' la copia di quella della 108 con i confini
annotati (`conf=`) e il cambio di regione (`CLIC=reg=toscana:6000`), `riassumi0.py` li riassume; `prova4.js`,
`prova4u.js` e `prova4b.js` portano l'orologio della pagina alle 21:15 e tolgono alle risposte di `/api/previsioni` le
ore di oggi prima delle 21, come le darebbe MET la sera.
- **I confini coi link di una regione** (urgente suo del 2/11, avanzo della 108). Con `?r=<regione>&m=prev` e
  `/previsioni/?r=<regione>`, in attesa della vista, i confini si vedevano sul grigio: bianchi finche' c'era `foto-on` (PC
  0,2 s, telefono 0,9 s, telefono girato 1,3 s), poi blu fino alla vista. Ora `.leaflet-overlay-pane` nascosto anche sotto
  `apre-vista`, accanto alla regola di `apre-italia` nel blocco in testa («E I CONFINI COI LINK DI UNA REGIONE»). Provato
  anche dove `apre-vista` vale fra una vista e l'altra: dalla linguetta e dall'Italia a una regione i confini blu sul
  grigio duravano fino a 2,5 s, ora mai. In 8 strade su 8 a vista pronta i confini sono identici a prima. ⚠️ Se la pagina
  ci mette piu' di 20 s (PC carico, telefono lento a freddo) il tempo di sicurezza dello script in testa toglie il grigio
  prima delle previsioni e per un attimo si vede lo storico coi confini bianchi: c'era uguale prima.
- **La sera OGGI e' «stasera»** (check notturno, punto 8). MET da' le ore da adesso in avanti, le passate non le ha:
  dopo le 20 minima e massima di oggi vengono da tre o quattro ore e spesso sono uguali, «8° 8°», che sembra un errore.
  «Minima e massima di tutta la giornata» non si possono fare senza un'altra fonte per le ore passate. Ora in `chip()`,
  dalle 20 (la stessa ora in cui il giorno di partenza diventa domani), la casella di oggi dice «stasera» e con i due
  numeri uguali ne scrive uno («STASERA 9°» invece di «OGGI 9° 9°»); anche la riga dei giorni del riquadro dice «stasera».
- **La sera si accendeva DOM 8** (trovato provando la sera). Dopo le 20 la scheda al telefono parte da domani e la
  striscia delle ore scorre fin li'; se la scheda si ridisegna subito dopo, lo scorrimento arriva alla striscia di prima,
  gia' staccata dalla pagina: misure a zero, `segna()` la crede «in fondo» e accende l'ultimo giorno sopra le ore di
  domani. Misurato alle 21:15: 5 aperture su 14. Ora `segna()` esce se `oz` non e' piu' nella pagina (`isConnected`): 11
  su 11 giuste. Di giorno non capitava (si parte da oggi, la striscia non scorre).

## Lo zoom minimo della cartina delle pagine «adesso» (2/11/2026, scheda 110 bis)

- L'avanzo della 109 (punto 8 della 110, suo «fai la 8»): la cartina OSM delle 21 pagine «adesso» (`lib/pagina-adesso.js`)
  non aveva zoom minimo e si rimpiccioliva fino al planisfero. La formula delle meteo (`Math.max(6, Math.floor(z) - 4)`)
  qui non va: l'inquadratura e' gia' l'Italia con un pezzo d'Europa (4,75 al telefono 393, 5 al PC 1440, uguale su tutte
  le 21 pagine, Sicilia compresa) e un minimo 6, sopra l'inquadratura, farebbe ingrandire la cartina all'apertura. Ora,
  dopo `fitBounds`, `setMinZoom(m.getZoom() - 1)`: un tocco del «−» e si vede l'Europa del radar, dall'Irlanda al Mar
  Nero, poi il tasto si spegne.
- Misurato in locale (server del repo, 21 pagine al telefono e al PC): prima minimo 0, si arrivava a 0; dopo minimo 3,75
  al telefono e 4 al PC; inquadratura e centro identici a prima in 42 aperture su 42, nessun errore. Coi tasti veri il
  «−» porta al minimo e si spegne, il secondo tocco non fa niente, il «+» torna all'inquadratura. Attrezzi nel banco,
  `scheda-110-bis\`: `prova-zoom-adesso.js` (`FASE=prima|dopo`) e `tasti-adesso.js`; scatti in `immagini\110-bis\`.
- `VERSIONE_JS` 10 in `genera-pagine-adesso.js`, 21 pagine rigenerate: una riga ciascuna (`?v=10`), CRLF intatti.
  ⚠️ Il generatore chiama `scriviSitemap` e quindi riscrive anche `pagine-impronte.json`: quel giorno ha aggiornato
  l'impronta di `index.html`, rimasta indietro dopo la 109 quater. Tolta dal commit perche' non c'entrava (la rifa' il
  giro del mattino).

## Il radar delle pagine «adesso» sulla foto della mappa (2/11/2026, scheda 111 ter)

- Regola sua del 2/11: le immagini e le cartine delle pagine hanno sempre la stessa faccia della mappa. Le 21 pagine
  «adesso» (`lib/pagina-adesso.js`) avevano ancora il radar sulla cartina OSM chiara (controllo della 111 bis, suo «sì,
  sistemale»). Ora il radar sta sulla foto NOSTRA della mappa, come col radar acceso in `/?r=<regione>&radar=ora`:
  Blue Marble ed ESA WorldCover, luce `LUCE_SAT` (1,3), confine della regione BIANCO (2,2 a .9, la regione scelta
  della mappa sulla foto), nomi nostri bianchi sopra il radar, fondo `#123a52` (il mare aperto della foto).
- **Il «+» si ferma allo zoom 10** (suo «sì, zoom fino al 10»): oltre c'era solo la foto del 10 ingrandita, sfocata, e
  Esri qui non si usa (il suo tetto lo usano meteo e boschi). Con la cartina si arrivava al 12.
- Indirizzo col commit, limiti, crediti corti e luce li legge `genera-pagine-adesso.js` da `index.html` (`FOTO_COMMIT`,
  `FOTO_URL`, `FOTO_LIMITI`, `FOTO_CREDITI`, `LUCE_SAT`), come fa `genera-pagine-meteo-zona.js` con `SAT_FOTO`, e li
  scrive nei dati della pagina: se la foto si rigenera (commit nuovo) basta rigenerare le 21 pagine. Se non li trova,
  il generatore si ferma invece di scrivere pagine che tornano alla cartina.
- I nomi: prima le citta' della regione (quelle delle carte), poi i capoluoghi delle regioni d'Italia e le citta' estere
  sopra i 300.000 abitanti di `data/nomi-esteri-grandi.txt` (lo stesso elenco della mappa), ~150 nomi, +7 KB a pagina.
  Stesso stile e stesso respiro dei «NOMI NOSTRI» della mappa; un nome che urta uno gia' messo, che uscirebbe dal bordo o
  finirebbe sotto i crediti si salta (la cartina e' piccola: la mappa a schermo pieno i nomi tagliati li tiene).
- Ripiego come la mappa: tre tentativi per tessera (2, 5, 12 s); al terzo errore senza nessuna tessera arrivata torna
  la cartina OSM di prima, col confine blu, senza i nostri nomi e di nuovo fino al 12.
- Da lontano niente rettangolo: lo zoom minimo resta il tocco del «−» della 110 bis (3,75 al telefono, 4 al PC), ma non
  scende sotto quello in cui la foto riempie la cartina, e `maxBounds` tiene la cartina dentro la foto (prima il bordo
  sud della foto, al 34° parallelo, entrava come una striscia blu). ⚠️ Al minimo `maxBounds` sposta il centro verso nord
  di quasi 5°, e il «+» di Leaflet ingrandiva li', sulla Germania: sotto l'inquadratura il «+» torna al centro di
  partenza (`m.zoomIn` riscritto), se la persona non ha trascinato la cartina (al PC si puo').
- ⚠️ Due trappole pagate: (1) `var NOMI` esisteva gia' piu' sotto (i nomi del tempo, «Sereno»): la lista dei posti si
  chiama `POSTI`, se no al PC la si perdeva al primo spostamento; (2) la foto NON ha la classe `fondo` (che toglie il
  «plus-lighter» di leaflet.css, e serve alla cartina chiara): con `normal` fra due tessere allo zoom 4,75 si vedeva un
  filo del fondo scuro. Crediti al telefono a 10,5 px: «Foto: NASA, ESA WorldCover» e' piu' lunga di «© OpenStreetMap».
- Misurato in locale (server del repo, porta 8970): 42 aperture su 42 con inquadratura, centro e zoom minimo identici a
  prima, massimo 10, foto arrivata, zero tessere OSM ed Esri, nessun errore; coi tasti veri «−» fino in fondo e «+» fino
  in fondo; radar «−2 ore» (11 fotogrammi) e «+40 min» (6) animati, riga viva, carte e barra che portano al paese; foto
  bloccata = cartina di prima. Attrezzi nel banco, `scheda-111-ter\` (`collaudo.js` con `PROVA=tutte|zoom|radar|rotta`,
  `finale.js`, `scatta2.js`, `scatta-mappa.js` per la mappa vera nello stesso punto, `affianca.py`); scatti in
  `immagini\111-ter\`. ⚠️ Il server di Python con 3-4 browser insieme a volte rifiuta la connessione
  (`ERR_CONNECTION_REFUSED`, anche con la pagina vecchia): non e' la pagina, si riprova.
- `VERSIONE_JS` 11. Le 21 pagine cambiano in tre punti: lo stile della cartina, i dati (foto e nomi), `?v=11`. Il
  generatore ha riscritto `pagine-impronte.json` (impronte di `index.html`, `fonti.html`, `guida`, cambiate da altre
  schede): rimesso com'era, non committato.

## La fase B delle previsioni: i link su /previsioni/ e 20 «Meteo <paese>» nuovi (2/11/2026, scheda 112 ter)

Decisa coi numeri (suo «sì, tutta», dopo la lettura del 2/11). Search Console fino all'1/11: le 31 valli A+B indicizzate
31 su 31, 30 mostrate, 1.514 viste, 13 clic, posizione 9,8, da 17 viste al giorno il primo giorno a ~350; il gruppo C
(30/10) 4 su 18 indicizzate; i 20 paesi 13 su 20, 10 mostrati, 137 viste, 1 clic. Le zone piogge e funghi delle stesse
valli e le pagine funghi dei 20 paesi NON hanno perso niente: posizioni migliori sulle stesse ricerche (zone funghi A+B
6,6 → 5,0, pagine funghi dei paesi 6,1 → 4,2), e il calo di viste delle zone piogge (−48%) c'e' uguale nelle zone senza
pagina meteo (−46%). Numeri e attrezzi nella nota `112-ter-numeri-pagine-meteo-2-11.md` delle schede.
- **I link alle previsioni vanno su `/previsioni/?r=<regione>`** (e `&pl=…&pn=…[&pz=1]` col posto), non piu' su
  `/?r=<regione>&m=prev`: il bottone «☀️ Previsioni» delle pagine piogge, funghi e forestali, «Previsioni» delle porte
  (regioni, zone piogge, «Che tempo farà»), le citta' e la casella di «Che tempo farà», «Vai alla mappa» delle pagine meteo,
  le carte e la barra delle «adesso» (`lib/pagina-adesso.js`, `VERSIONE_JS` 12). Cambiati: `lib-meteo-regione.js` (4
  stringhe del codice del browser), `lib-numeri-regione.js`, `genera-pagine-{funghi,localita,zona,zona-piogge,regione,
  meteo-zona,adesso}.js`. ⚠️ **`index.html` non cambia e `?m=prev` resta valido**: link vecchi, preferiti, link condivisi
  (`buildShareUrl` non costruisce mai `/previsioni/`). Chi clicca vede la stessa mappa: cambia solo l'indirizzo. Su Google
  il guadagno e' piccolo, perche' la testata di tutte le pagine linkava gia' `/previsioni/?r=<reg>` dal 28/10: serve ad
  avere un indirizzo solo per le previsioni. Ogni apertura passa dalla Function di `/previsioni/` (~40-60 al giorno,
  lontanissimo dal tetto gratuito).
- **Le pagine non si sono rigenerate tutte**: paesi funghi (986), zone funghi (114) e mappa forestale (138) sono state
  riscritte SOLO nelle righe del link, con gli stessi caratteri dei generatori (cosi' il ritratto del pluviometro non si
  rinfresca fuori dal giro stagionale; lo script e' `riscrivi-link.js` nello scratchpad della 112 ter). Rigenerate coi
  generatori: regioni, zone piogge, funghi regione e indice, «adesso», 49 valli meteo e 40 paesi meteo. Queste si sono
  portate dietro anche «stime del modello» al posto di «stime Open-Meteo», che la 111 aveva gia' messo nei generatori.
- **20 «Meteo <paese>» nuove, `METEO_PAESI_B`** in `genera-pagine-meteo-zona.js` (`METEO_PAESI_TUTTI` per i link e per le
  pillole «paese per paese»), `sitemap-meteo-paesi-b.xml` a parte, data `meteoPaesiB` in `pagine-lastmod.json`. Criterio
  NUOVO: i paesi per cui Google mostrava gia' la nostra pagina funghi a chi cercava «meteo <paese>» SENZA «funghi»
  (Search Console 3/10-1/11), con zero clic. I primi 20 erano stati scelti coi clic dei funghi, ma quelle ricerche sono
  «meteo funghi <posto>» e restano apposta alla pagina funghi: al 2/11 meta' non erano mai uscite. Serravalle di Carda,
  Giffone, Rofrano, Licenza, Lagonegro, Sefro, Rocca di Papa, Badia Agnano, Porlezza, Rocca Sinibalda, Val di Breguzzo,
  Lago Ballano, Gambarie, Roccaforte Mondovi', Caronia, Cellio con Breia, Solofra, Cervinara, Fabrizia, Paluzza. Nomi dei
  pluviometri che non sono il paese: «Porlezza torrente», «Turano a Rocca Sinibalda», «Val di Breguzzo (Ponte Arnò)»
  rinominati; a Caronia il pluviometro e' nel bosco di Pomiere a 1.482 m, quindi la pagina si apre sul paese (`primo`,
  come Monticiano e Urbe). Le 20 pagine funghi hanno la riga «Meteo <paese>: previsioni ora per ora →», messa senza
  rigenerarle. Le pillole «Previsioni meteo paese per paese» compaiono da sole nelle regioni nuove (Basilicata, Calabria,
  Campania, Lazio, Lombardia, Marche, Sicilia, Friuli...).
- Prova in locale (wrangler sulla 8985 nella copia di lavoro, scratchpad della 112 ter `prova-fase-b.js`; la mappa chiede
  l'API alla 8788, la prova gira quelle richieste sulla 8985): una pagina per famiglia senza un solo `m=prev` e coi link
  nuovi; 14 link aperti, computer e telefono, con previsioni accese sulla regione e sul posto giusti; le 20 pagine nuove
  al computer e al telefono con scheda aperta, 3-8 etichette, 7 giorni, niente sbordi ne' errori. Unico posto che non
  compare: Stretti di Giaredo dalla pagina funghi della Toscana, uguale col link vecchio (sta fuori dalla Toscana).

## «Ieri a Caronia» era la pioggia di Pomiere: il punto di stamattina coi pluviometri fuori dal paese (2/11/2026, scheda 113)

- Nelle pagine «Meteo <paese>» col pluviometro fuori dal paese (`primo` in `METEO_PAESI`: Monticiano a 5 km, Urbe a 3,5 km
  e 265 m piu' su, Caronia a 15 km e 1.482 m) «Il punto di stamattina» diceva «Ieri a Caronia sono caduti…» con la pioggia
  del pluviometro. Ora, solo con `C.primo`, dice dove e' stata misurata: «Ieri al pluviometro di Pomiere, nel bosco di
  Caronia, sono caduti…» (`C.alPluv`, con la virgola di chiusura se il nome ne ha una). `punto()` in
  `genera-pagine-meteo-zona.js`; le previsioni restano «a Caronia», perche' sono chieste per il paese.
- Rigenerate le 49 pagine di zona e le 40 di paese, una riga ciascuna (`pagine-impronte.json` rimesso com'era). Prova sul
  sito vero con la pagina del repo iniettata (scratchpad 54de8904 `prova-punto-113.js`): cambiano solo Caronia, Monticiano
  e Urbe; Sassello e Valtiberina identiche, nessun errore.

## Il credito della probabilita' di pioggia solo in fonti.html (3/11/2026, scheda 114)

- Suo «no non la devi mettere lì in quel punto», sulla riga «Previsioni ECMWF via MET Norway · probabilità di pioggia:
  Open-Meteo» in fondo alla scheda delle previsioni. Regola sua del 2/11: Open-Meteo si nomina solo in `fonti.html`
  (dove la riga «Previsioni meteo» dice gia' «per la sola probabilità di pioggia, Open-Meteo», CC BY 4.0).
- Tolto da: la scheda della mappa (`index.html`, ora «Previsioni ECMWF via MET Norway»); le 89 pagine meteo (49 zone, 40
  paesi: la frase «la probabilità di pioggia (💧) è di Open-Meteo (CC BY 4.0)» e «Probabilità di pioggia: Open-Meteo» nei
  crediti), cambiate frase per frase senza rigenerare, e i due generatori (`genera-pagine-meteo-zona.js`,
  `genera-pagine-meteo-paese.js`) con lo stesso testo; la frase della guida (`guida/index.html`). In `index.html` anche il
  testo morto dell'avviso dell'Abruzzo («stime Open-Meteo» → «stime del modello»). La % di pioggia resta (dati di
  Open-Meteo dal server, `functions/api/previsioni.js`, interruttore `PROB`). Restano solo commenti nel codice.
- Prova sul sito vero col file nuovo (`check-10\prova-crediti-114.js` del banco): PC e telefono, scheda di Milano, riga
  «Previsioni ECMWF via MET Norway», zero «Open-Meteo» nel testo della pagina.

## Le previsioni da vicino a un quarto delle tessere Esri (3/11/2026, scheda 116)

- Sua domanda «ma le previsioni non hanno le tessere a 1/4?»: no. Dal 31/10 (scheda 104) la pioggia prendeva Esri a un
  quarto dallo zoom 11 e le previsioni piene («li' conta il dettaglio delle case»); il 31/10 lui aveva chiesto «e se
  mettiamo anche il meteo a 1/4?», misurato, ma poi si e' fatta prima la foto nostra fino al 10 e da 11 in su e' rimasto
  pieno senza una sua scelta. Suo «Si', a un quarto»: `vicinoL` (modulo della foto delle previsioni, `viFondo`) con
  `tileSize:512, zoomOffset:-1` come la pioggia, `maxNativeZoom` 18 = Esri fino al suo 17 come prima.
- Misura sul sito vero, stesso giro (Lombardia, Val Brembana agli zoom 11, 12, 13 e uno spostamento;
  `scratchpad c5b15e68\previsioni-quarto-116.js`, `INDICE=` di prove-veloci): PC 80 tessere (433 KB) → 32 (230 KB),
  telefono 32 (245 KB) → 16 (127 KB), 0 errori. Allo zoom 13 la foto e' un po' piu' morbida
  (`immagini\116\previsioni-z13-*`).

## Le pagine meteo con la foto nostra fino allo zoom 10 (3/11/2026, scheda 116)

- Suo «la nostra foto fino allo zoom 10 nelle pagine /meteo/<zona>/» (approvata insieme al tetto di zoom). Le 49 pagine
  di zona e le 40 «Meteo <paese>» chiedevano Esri a OGNI zoom, anche all'apertura: la cartina della valle (fino al 15) e
  l'anteprima «Previsioni» della regione (fino al 12). Ora `fotoSat` nel codice del browser di
  `genera-pagine-meteo-zona.js` (lo usa anche genera-pagine-meteo-paese.js): la foto NOSTRA fino al 10 (`FOTO`, letta da
  index.html come in genera-pagine-adesso.js: FOTO_COMMIT, FOTO_URL, FOTO_LIMITI, FOTO_CREDITI), Esri dall'11 a un quarto
  come la mappa, la nostra sotto se Esri si ferma, Esri a ogni zoom se la nostra non arriva, tre tentativi per tessera
  per jsDelivr, credito di Esri solo da vicino. Rigenerate tutte e 89: cambiano solo quelle righe (sitemap uguale).
- Tessere Esri aprendo la pagina e scendendo fino alle cartine (online → nuova, `tetto-116.js`): Garfagnana PC 20 → 6,
  telefono 15 → 0; Val Brembana PC 30 → 6, telefono 12 → 2; Paluzza PC 22 → 4, telefono 12 → 0. 290 script compilati, 0
  errori.

## Le pagine «adesso» delle città, prima ondata: 24 capoluoghi (4/11/2026, scheda 118 bis)

- Sua decisione del 4/11 («Due tappe», scheda GA4 5): le «adesso» per i capoluoghi di provincia, ~20-25 prima e il resto
  dopo due settimane di misura. Le 21 regioni sono la famiglia che rende di più (Search Console 18/10-3/11: 20.460 viste,
  275 clic, 7,3 clic a pagina a 7 giorni contro 0,2 delle meteo), ma chi cerca «sta piovendo a Cagliari» o «dove sta
  piovendo adesso a Roma» finiva sulla regione. Poi il suo «sì, procedi» sulla proposta.
- **Le 24 città** (`CITTA_ADESSO` in `genera-pagine-adesso.js`, nomi di `data/capoluoghi.json`): le sei regioni dove le
  «adesso» hanno preso più clic (Sardegna 53, Liguria 37, Puglia 34, Sicilia 32, Campania 17, Veneto 14), dentro ognuna
  le città più grandi con un pluviometro vero vicino, più Roma (la più cercata per nome). Liguria Genova, Savona, La
  Spezia, Imperia; Veneto Venezia, Verona, Padova; Lazio Roma; Campania Napoli, Salerno, Caserta; Puglia Bari, Lecce,
  Taranto, Foggia; Sicilia Palermo, Catania, Messina, Siracusa, Ragusa; Sardegna Cagliari, Sassari, Olbia, Nuoro.
  **La seconda tappa** (dopo ~18/11, quando lo dice lui) si aggiunge in `CITTA_ADESSO`: il resto si fa da solo
  (pagine, pillole, sitemap, giro del mattino). Rimasti fuori apposta: Andria, Barletta, Brindisi, Trapani, Agrigento,
  Carbonia, Oristano, Tempio e le altre regioni.
- **Indirizzo** `/<regione>/adesso/<città>/` (`/liguria/adesso/la-spezia/`), percorso «Mappa pluviometrica › Liguria ›
  Radar adesso › Genova». Titolo «Radar meteo Genova: sta piovendo adesso? In diretta» (la forma delle ricerche vere),
  og:title «Sta piovendo a Genova? Il radar in diretta».
- **Roba SUA in ogni pagina**, se no Google la tiene fuori come copia della regione:
  1. il radar inquadrato sulla città (±0,75° e ±1,05°: zoom ~8,5 al PC, ~7,5 al telefono), punto rosso sulla città, il «−»
     scende di tre tocchi; nomi sopra la foto: prima i comuni intorno sopra i 10.000 abitanti (`nomiCitta`);
  2. la riga viva sulla città (`scriviRigaCitta` in `lib/pagina-adesso.js`): «Sta piovendo a Genova: pioggia debole.»,
     «A Sassari adesso non piove. La pioggia più vicina è a ovest, a circa 30 km.» (sotto gli 8 km «Piove però a pochi
     chilometri, verso sud»), «Tempo asciutto a Padova e in tutte le zone vicine.», «Entro le 11:40 la pioggia potrebbe
     arrivare a…» / «Entro le 11:40 potrebbe smettere.»;
  3. la previsione della città (`chiediQui`): adesso, le prossime 12 ore (con la % se ≥10), oggi, domani e dopodomani; la
     barra che scorre porta le sue ore («METEO GENOVA · PROSSIME ORE»). È la STESSA domanda della sua carta nella pagina
     regione (stesso punto e quota), quindi il server la ha già in cache: nessuna richiesta nuova a MET;
  4. **i millimetri dei pluviometri vicini SCRITTI NELL'HTML** (`pluviometriVicini`, `bloccoPluviometri`): i veri entro
     10 km, al massimo 5, dal più vicino (se nessuno, i 3 più vicini entro 20 km: Olbia, Siracusa), con distanza, quota e
     ieri / 7 / 30 giorni, più la frase «Ieri, 3 novembre, al pluviometro Lecce, in città, sono caduti 51 mm…» e il più
     bagnato dei vicini. Dai file giornalieri già nel repo (zero chiamate alle fonti), con le regole dei riepiloghi:
     esclusi dalla mappa fuori (`lib-escluse.js`), 60% dei giorni per i totali, **giorno = quello del riepilogo della
     regione** (fine dei 7 giorni di `data/riepiloghi/<regione>.json`), così la città e la regione dicono lo stesso
     «ieri». ⚠️ Qui i giorni a stima (`om`, ICON-2I) NON entrano nelle somme (la pagina dice «misurati»): contano come
     giorni mancanti. Fuori anche le stazioni senza pioggia (`mm` sempre null) e quelle coi tre trattini (Palermo UIR).
     `data-ultimo` sulla frase = il giorno dei numeri; se la pagina è rimasta indietro il browser scrive «Il 3 novembre»
     al posto di «Ieri, 3 novembre,» e la data nella colonna.
- **Cotte ogni mattina**: in `pagine-regione.yml`, dopo le zone piogge, `SOLO=citta node .github/scripts/genera-pagine-adesso.js`
  (solo le città, non le 21 regioni «adesso», più la sitemap). `SOLO=citta:genova` = una sola, sitemap non toccata.
- **Collegamenti**: nelle «adesso» delle sette regioni il blocco «Il radar città per città» sotto «Apri il radar sulla
  mappa completa» (pillole «Radar Genova →», evento `apri_adesso_citta` {da, posto}); ogni città ha le pillole delle altre
  della sua regione, il link alla regione «adesso» e l'elenco delle altre 23. Eventi della pagina città: gli stessi della
  regione (`adesso_radar`, `adesso_barra`, `adesso_cerca`) con in più `citta`.
- **Sitemap a parte** `sitemap-adesso-citta.xml` (famiglia `adessoCitta` in `genera-sitemap.js`), lastmod = `data-ultimo`
  della pagina, come le regioni cotte. `pagine-lastmod.json`: `adesso` e `adessoCitta` al 4/11. `VERSIONE_JS` 13.
- **La casella «Cerca» subito sotto il radar**, nelle città e nelle 21 regioni (sua correzione dopo averle viste in
  locale: è uno degli strumenti migliori per portare altri clic, e nelle città stava in fondo; poi «sì, anche lì» per le
  regioni, dove stava dopo il tasto della mappa e le pillole). Etichetta delle città «☀️ Previsioni meteo in un'altra
  località» (sua: la parola «località», non «posto»; niente h2), delle regioni «☀️ Cerca una località» come prima.
  Al telefono 393: città da ~3.700 px a ~1.100 (1,3 schermate), regioni da 1,9 a 1,3-1,4 schermate. Le pagine meteo
  (zona e paese) l'avevano già in cima (0,3-0,5 schermate), ma aprono la scheda nella pagina e non hanno etichetta.
- Le 21 «adesso» regione cambiano in `?v=13`, nella casella spostata sotto il radar (e il numero dei pluviometri della
  Toscana, 360 → 370), più il blocco delle pillole nelle sette con città.
- Prova in locale (server del worktree sulla 9035, `prova-citta-118bis.js` nello scratchpad della 118 bis, scatti in
  `immagini\118-bis\`): 24 città + 4 regioni × PC 1366 e telefono 393, radar, foto, riga viva, previsione con 12 ore e 3
  giorni, barra, tabella, niente sbordi. Gli unici guasti erano dell'API: 502 a raffica con 4 browser insieme (anche
  nelle carte delle regioni) e **Padova**, dove MET rimandava per quel punto una risposta TAGLIATA a 26 KB («Unterminated
  string in JSON»), anche nella carta di Padova della pagina Veneto: la pagina scrive «Previsione non disponibile in
  questo momento» e passa da sola quando MET rinfresca.
- **IN PRODUZIONE il 4/11/2026** (suoi «sì, sincronizza» e «sì, pubblica»): commit `8d5bb09e1e`, deploy `8a93a10d`.
  Verificato online (`BASE=https://precipitazioni.avventuremicologiche.it INSIEME=2 node prova-citta-118bis.js`): 24
  città + 4 regioni × PC e telefono, 47/56 a posto; i 9 guasti tutti dell'API: Caserta, Salerno e Padova senza
  previsione (502: «Unterminated string in JSON at position 36641», «Unexpected end of JSON input», cioè il corpo della
  risposta di MET arriva TAGLIATO in `perPunto` di `functions/api/previsioni.js`, `TEMPO_MET_MS` 8000) e qualche carta
  della Liguria e della Toscana per lo stesso motivo. Guardato subito dopo: vedi la sezione qui sotto, «La previsione
  di riserva quando MET manda il JSON tagliato».
  Sitemap `sitemap-adesso-citta.xml` online (24 indirizzi) e nell'indice `sitemap.xml`; home online = index.html del repo.

## La previsione di riserva quando MET manda il JSON tagliato (4/11/2026, scheda 118 bis)

- **Cosa succedeva.** Il 4/11 MET Norway mandava per alcuni punti il JSON TAGLIATO A METÀ, con un Content-Length che
  gli dava ragione: Salerno 13.659 byte fermi alle 13 del giorno dopo, anche chiesto dal PC con lo stesso indirizzo del
  server (`lat=40.6800&lon=14.7600&altitude=10`) e anche dopo il suo aggiornamento delle 10:45 UTC; Caserta intera dal
  PC (39.591 byte) e tagliata al server; Padova tagliata per un'ora e poi buona. In `perPunto` di
  `functions/api/previsioni.js` `met.json()` falliva («Unterminated string in JSON at position…», «Unexpected end of
  JSON input») e l'API rispondeva 502 in 0,27 s (non era il nostro tempo massimo di 8 s): «Previsione non disponibile»
  su Salerno, Caserta, Padova e su qualche carta di Liguria e Toscana. Gli errori non si tengono in cache: ogni visita
  richiedeva a MET lo stesso file rotto.
- **Il rimedio** (suo «sì, procedi»): la previsione di riserva, SENZA nessuna chiamata in più a MET. Solo nelle
  richieste di UN punto (`?lat&lon`: carte delle regioni e delle città, scheda ora per ora della mappa, `riserva` = 9°
  argomento di `perPunto`): ogni previsione buona si tiene anche in una seconda chiave della cache SENZA DATA
  (`cache.previsioni/riserva?…`) per 12 ore (`RISERVA_S`); se MET sbaglia (stato non 200, corpo tagliato, tempo
  scaduto) si risponde 200 con quella, segnata `riserva: 1` e `guasto: "MET Norway: …"`, e la si tiene 5 minuti nella
  cache normale (`RISERVA_USA_S`): MET si richiede al massimo ogni 5 minuti per quel punto, non a ogni visita. Senza
  riserva (punto mai visto nelle 12 ore) resta il 502 di prima. Una copia di ieri non passa per oggi: le pagine
  prendono i giorni per DATA (bug 11). `scade` resta quella vecchia, quindi «aggiornate alle» dice l'ora vera della
  previsione. `VERSIONE` non cambia (la forma della risposta è la stessa, la cache resta buona).
- ⚠️ **Non nelle richieste a gruppi** (`perArea`, `perPosti`, `perPunti`): un punto a freddo costa già 3 sottorichieste
  e il tetto di Cloudflare è 50 (vedi `senzaCache`); la riserva ne aggiunge una a ogni previsione buona. Lì un punto
  rotto resta `errore` come prima.
- Scartati: richiedere subito a MET (una chiamata in più alla fonte, regola sua) e recuperare il pezzo intero del file
  tagliato (a Salerno sarebbe rimasto circa un giorno su sette).
- Prova senza wrangler (`prova-riserva.mjs` nello scratchpad della 118 bis: cache finta, MET finto buono, tagliato, 503,
  appeso): buono → 200 e riserva salvata; tagliato, 503 e tempo scaduto → 200 con `riserva: 1` e max-age 300, e la
  visita dopo non richiede MET; punto mai visto → 502 come prima; gruppo `?punti` → errore del punto come prima; MET
  di nuovo buono → previsione nuova. Con `VERA=1` una richiesta vera a MET (Genova): 7 giorni e 88 ore come prima.
- **IN PRODUZIONE il 4/11/2026** (suoi «sì, sincronizza» e «sì, pubblica»): commit `5f9eee4a16`, deploy `83a19caa`.
  Online Genova e Padova 200 con 7 giorni e 88 ore; Caserta e Salerno ancora 502 («MET Norway: Unterminated string…»,
  la scritta nuova): MET li tagliava già da prima della pubblicazione, quindi una copia buona non c'era. La riserva li
  copre dal primo giro buono in poi. Rischio di blocco da MET (sua domanda): basso, User-Agent col contatto, al massimo 4
  decimali, cache sull'Expires, molto sotto i 20 al secondo; un blocco sarebbe 403 o 429, non un 200 tagliato. Non
  usato: If-Modified-Since (con la cache sull'Expires cambierebbe poco).

## La riserva per tutti i punti quando MET risponde 503, e i guasti che non moltiplicano piu' le chiamate (4/11/2026 sera, scheda 122)

- **Cosa succedeva.** La sera del 4/11 MET Norway rispondeva **503** («servizio non funzionante»: un guasto suo, non un
  blocco, che sarebbe 403, ne' un «troppe richieste», che sarebbe 429; [StatusCodes](https://docs.api.met.no/doc/StatusCodes))
  a una parte delle richieste, a intermittenza. Visto dalla 120 mentre girava un reel: 18:55 la Toscana buona; ~19:05
  etichette «--°» per piu' di 30 s, nessuna scheda, mappa grigia; 19:10 Certaldo 502 «MET Norway 503». Visto dalla
  122: 19:29 Certaldo buona; 19:36 `capoluoghi=toscana` con 4 citta' su 14 in 503; 19:56 `capoluoghi=italia` 3,2 s
  con la sola Aosta in 503. Spia sui log dalle 19:35 alle 19:56 (`wrangler pages deployment tail <id> --format json`,
  passiva, non chiama MET): 53 richieste di previsioni, 5 in 502 e **9 abbandonate** dal visitatore prima della
  risposta. Prima delle 18:55 non si sa: la funzione non tiene log, il pannello di Cloudflare chiede il suo accesso.
- **Cosa vedeva chi usava il sito** (simulato in Chrome senza finestra con le risposte d'errore finte, nessuna chiamata):
  coi paesi in errore la foto della regione senza niente sopra, il banner fermo su «METEO…» e nessuna scheda (la scheda
  si apre solo coi dati del primo paese, `veApri`); con anche i capoluoghi in errore la mappa GRIGIA coi confini e
  «Previsioni non disponibili» (la vista non si disegna). Aprendo le previsioni, lo schermo blu di `apre-italia` per
  3-4 secondi (suo, 19:55): l'area `italia` con anche una sola citta' in errore non restava in cache e ogni visitatore
  aspettava che la funzione richiedesse a MET tutte e 29 le citta'.
- **E il guasto moltiplicava le chiamate a MET.** Gli errori non si tenevano in cache e la mappa richiede i paesi
  falliti dopo 15 e 30 s (`veChiedi`, fino a 3 volte): una visita della Toscana chiedeva 143 paesi tre volte, **429
  chiamate a MET in mezzo minuto**, anche con le copie buone di mezz'ora prima (la riserva della 118 bis copriva solo
  i punti singoli). Le aree con errori, senza l'area di prima in cache, richiedevano a MET tutte le citta' a ogni
  visita. Il tetto di MET e' 20 richieste al secondo per tutto il sito
  ([TermsOfService](https://docs.api.met.no/doc/TermsOfService)): due visitatori durante un guasto ci arrivavano. Le
  riprese della 120 non hanno causato il 503.
- **Il rimedio** (suo «sì, procedi»), solo `functions/api/previsioni.js`, `index.html` non cambia:
  1. **L'ultima buona fa da riserva per tutti i punti** (`perPunto`, anche i `?punti=` delle etichette): la copia
     normale resta in cache 12 ore (`TIENI_S`) con tre intestazioni: `X-Fresca-Fino` (l'Expires di MET, fra 10 minuti e
     un'ora come prima), `X-Giorno` (bug 11: la copia di ieri non passa per fresca) e `X-Buona` (quando era buona). Se
     MET sbaglia si risponde con la copia, `riserva: 1` e `guasto`, rimessa fresca 5 minuti (`RISERVA_USA_S`), mai oltre
     12 ore da quando era buona. Prende il posto della seconda chiave della 118 bis (`cache.previsioni/riserva?…`, non
     si scrive piu'). La chiave del punto non ha piu' la data, cosi' la copia di ieri copre anche dopo mezzanotte.
  2. **Un errore senza copia si ricorda 2 minuti** (`ERRORE_S`): i tentativi della mappa e gli altri visitatori non
     richiamano MET.
  3. **Nelle aree la citta' che sbaglia tiene quella di prima** (`previsioniDi`, da `prima`, fino a 12 ore dalla sua
     scadenza) e l'area si tiene SEMPRE: con errori o riserve fresca 2 minuti e poi «vecchia» come prima (daCache:
     quella di prima subito, il ricalcolo dietro chiede a MET solo le citta' senza previsione valida); senza nessuna
     citta' 2 minuti e mai vecchia. Cache-Control al browser 120 s anche quando c'e' una riserva.
- **Chiamate a MET**: uguali in tempi normali (si chiede solo dopo l'Expires). Durante un guasto: la visita della
  Toscana da 429 a 143 (una per paese ogni 5 minuti; i tentativi a 15 e 30 s non chiamano), capoluoghi toscani con 4
  citta' in 503 da 14 a 4 ogni 2 minuti, area tutta in errore da 14 a ogni tentativo a 14 ogni 2 minuti.
  **Sottorichieste**: un punto singolo 4 invece di 5, i gruppi `?punti=` 45 al massimo come prima (tetto 50).
- **Prove senza rete** (scratchpad della 122): `prova-122.mjs` (cache finta che rispetta max-age, orologio finto,
  MET finto buono, 503, tagliato, appeso; lo stesso giro sul codice di prima e su quello nuovo: 47 righe di casi, fra
  cui la mezzanotte e il limite delle 12 ore) e `simula-nuovo.mjs` (la mappa vera in Chrome senza finestra, le
  richieste a `/api/previsioni` servite dal codice nuovo con MET finto): +31 minuti con MET in 503 la Toscana si vede
  identica a MET buono, 28 etichette coi gradi, scheda di Firenze aperta, banner pieno, una chiamata a MET per punto.
  Foto in `immagini\scheda-122\`.
- Scartati: richiedere MET subito (chiamate in piu', regola sua), cache piu' lunga dell'Expires (previsioni vecchie in
  tempi normali), celle piu' grandi per le etichette (MET corregge la temperatura con la quota del punto).
- ⚠️ **Da sapere, non toccato**: a cache fredda una vista di regione chiede a MET ~140 paesi in 2-3 secondi (una ventina
  di `?punti=` insieme, 6 alla volta per chiamata): per quei secondi sopra i 20 al secondo. Nessun 429 visto.
- **IN PRODUZIONE il 4/11/2026 alle 20:01** (suo «Sincronizza e pubblica»): commit `20aa529469`, deploy `91e1c5be`
  (primo dell'elenco, nessuno piu' nuovo sotto). Online: `capoluoghi=italia` due volte di fila 0,21 e 0,15 s con 3
  citta' in 503 (Campobasso, Aosta, Grosseto), max-age 120: l'area con errori ora resta in cache (prima 3,2 s a ogni
  visita). ⚠️ Effetto del cambio di chiave: le copie dei PUNTI ripartono da zero (quelle di prima stavano sotto la
  chiave con la data, e la seconda chiave della 118 bis non si legge piu'): Certaldo `q=130` alle 20:01 dava 502
  «MET Norway 503». Ogni punto torna coperto dalla prima risposta buona di MET; le aree hanno la chiave di prima e
  hanno tenuto le loro copie.

## Minima e massima, sempre in quest'ordine (6/11/2026, scheda 125)

Suo «in Che tempo farà hai messo solo una temperatura, meglio sia minima che massima», poi «non è più logico prima
minime e poi massime?» e «sì, ovunque». **Regola: prima la minima (blu `#1856b8`) e poi la massima (rossa `#c21f1f`)**,
in tutto il sito.
- La tabella «Che tempo farà» delle pagine (`meteoClient` in `lib-meteo-regione.js`) mostrava SOLO la massima, da
  sempre: ora «−2° 10°» (`b.mk-t`). Sotto i 400 px l'icona sta SOPRA i gradi in tutte le caselle (a 360 px «10° −2°»
  accanto all'icona non stava: 65 px in 63, e andavano a capo solo alcune caselle); millimetri e probabilita' senza
  rientro e senza a capo. Le pagine funghi rigenerate subito; le altre famiglie col loro prossimo giro.
- Nella mappa delle previsioni (`index.html`) le etichette dei paesi («Ponti 8° 11°»), la vista a etichette e la
  striscia gialla avevano gia' la minima prima; al contrario c'erano i giorni della scheda (`chip`, `.pv-gg .tx`) e le
  vecchie etichette `.pv-m`: girati. Dopo le 20 con minima e massima uguali la casella «stasera» ne scrive una.
- Prova: `prova-mappa-ordine-125.js` (scratchpad della 125, `INDICE=` l'index.html del worktree sul sito vero):
  /previsioni/ della Liguria e di Sassello, telefono e PC, 7 giorni su 7 e tutte le etichette con la minima prima.
- **IN PRODUZIONE il 6/11/2026 alle 14:20** (`cd120aca9f`, deploy `46e4cd9c`): online index.html = repo, la stessa prova
  sul sito vero senza `INDICE=` uguale; «Che tempo farà» delle pagine funghi «1° 5°» al telefono e al PC.

## Le pagine «adesso» delle città a ondate, e la seconda ondata: 20 città (5/11/2026, scheda 124)

- **Perché a ondate** (suo «prima possibile, ma senza intasare Google che dopo ci tocca farle tutte a mano», poi «sì»
  al posto della seconda tappa unica del ~18/11). Search Console del 5/11: Google l'indice `sitemap.xml` non lo rilegge
  dal 24/10 e `sitemap-localita.xml` dal 20/10 (i 77 paesi del 1/11 a 4 giorni erano tutti sconosciuti), mentre una
  sitemap inviata da sola con `sc.py invia` la legge il giorno stesso (meteo paesi B del 2/11: 12 su 20 dentro in 2
  giorni senza giri a mano). Le 24 città del 4/11 a un giorno: 0 dentro, 12 rilevate, 12 sconosciute, perché la loro
  sitemap non era mai stata inviata (inviata il 5/11). Ondate passate da ~20: Google ne prende 60-70% in 2-5 giorni, il
  resto sta in un giro a mano (11 al giorno); i blocchi grossi restano fermi per settimane.
- **Come si fa**: `ONDATE_ADESSO` in `genera-pagine-adesso.js` è un elenco di ondate (`{ regione: [città] }`), da cui
  nascono `CITTA_ADESSO` e il numero dell'ondata di ogni città. La pagina città porta `<main data-ondata="N">` e
  `genera-sitemap.js` la mette in `sitemap-adesso-citta.xml` (ondata 1, o nessun numero) o in
  `sitemap-adesso-citta-N.xml` (dalla 2), scritta e messa nell'indice da sola. Il giro del mattino (`SOLO=citta`) la
  tiene viva (`git add 'sitemap*.xml'`). **L'ondata nuova si aggiunge in fondo quando la precedente è al ~70%**
  (Controllo URL via API, zero quota a mano), e la sua sitemap si invia a Google il giorno stesso della pubblicazione.
- **Seconda ondata, 20 città**: i capoluoghi di regione che mancavano, Milano, Torino, Bologna, Firenze, Trieste,
  Ancona, Perugia, Potenza, Catanzaro, Campobasso, Trento, Bolzano, Aosta; Reggio di Calabria al posto dell'Aquila
  (l'Abruzzo non ha la pagina dei pluviometri: la città linkerebbe `/abruzzo/` che non c'è, più il percorso; da fare a
  parte); e le più grandi rimaste nelle regioni della prima, Vicenza, Treviso, Andria, Brindisi, Trapani, Agrigento.
  Barletta tolta dopo la prova: il suo unico pluviometro (6 km) non aveva né ieri né 7 giorni. Tutte già in
  `data/capoluoghi.json`: nessun cambio alla mappa né alle aree delle previsioni. Rimangono fuori Biella e Vercelli,
  che in `capoluoghi.json` non ci sono: aggiungerle cambia anche le etichette della mappa delle previsioni del
  Piemonte (due punti in più a MET per area), quindi si decide con lui.
- **Cosa cambia**: 20 pagine nuove, le 24 della prima ondata (elenco delle altre città, da 23 a 43), le pillole «Il
  radar città per città» in 16 regioni «adesso» (le 13 nuove più Veneto, Puglia e Sicilia), `sitemap.xml`
  con la figlia nuova. La previsione di ogni città è la stessa domanda della sua carta nella pagina regione: nessuna
  richiesta nuova a MET.
- Prova in locale (server python del worktree sulla 9070, `prova-citta-124.js` nello scratchpad della 124, copia di
  quella della 118 bis, scatti in `immagini\124\`): 20 città + Lombardia, Puglia, Valle d'Aosta e Genova × PC 1366 e
  telefono 393, **48/48 a posto** (radar, foto, riga viva, previsione con 12 ore e 3 giorni, barra, pluviometri, niente
  sbordi).
- ⚠️ **Il giorno della pubblicazione**: dopo il pull, generatore INTERO (`node .github/scripts/genera-pagine-adesso.js`,
  non `SOLO=citta`, che non riscrive le pagine regione con le pillole), `adesso` in `.github/scripts/pagine-lastmod.json`
  al giorno della pubblicazione (le pagine regione «adesso» cambiano), poi push, pubblicazione e
  `python sc.py invia sitemap-adesso-citta-2.xml`.
- ⚠️ **La seconda ondata NON è uscita tutta insieme**: dal 7/11 esce a goccia, tre città al giorno (vedi la sezione qui
  sotto).

## La settimana a goccia: 20 città «adesso» e 15 «Meteo <paese>», cinque pagine al giorno dall'8 al 14/11 (7/11/2026, scheda 127)

- **Perché** (suo, 7/11 sera: «invece di mettere 20 pagine quasi uguali tutte insieme, ne mettiamo ogni giorno poche e
  miste, non più di 10 al giorno», poi «ok programma una settimana così facciamo la prova» e «Sì, parti», con un sì solo
  per pubblicare ogni giorno). I numeri: le 24 città della prima ondata con la sola sitemap (letta da Google il 5/11)
  erano 0 su 24 dopo tre giorni, 12 rilevate e 12 sconosciute: non bocciate, mai aperte. Le pagine chieste a mano invece
  entrano in poche ore (33 su 33 il 4, 5 e 6/11), e la quota a mano è 11 ogni 24 ore. Il numero da solo non è il
  problema (le 20 «Meteo <paese>» B uscite insieme il 2/11: 12 dentro in 5 ore da sole): lo è per le città. Quindi
  poche pagine al giorno, chieste la sera stessa: 5 nuove + 6 arretrate = 11.
- **Calendario** (le date stanno nei generatori): 8/11 Milano, Firenze, Trapani + Corio, Corleto Monforte · 9/11
  Torino, Perugia, Reggio di Calabria + Crespano del Grappa, Santa Margherita di Staffora · 10/11 Bologna, Trento,
  Brindisi + Canolo Nuova, Demonte · 11/11 Trieste, Ancona, Agrigento + Atella, Ussita · 12/11 Bolzano, Vicenza,
  Catanzaro + Selva dei Molini, Vivaro Romano · 13/11 Treviso, Aosta, Andria + Passo del Brattello, San Sosti · 14/11
  Potenza, Campobasso + Val Ugovizza, Chiusa di Pesio, Orecchiella. Elenco per la scheda dei giri a mano:
  `D:\video youtube\claudio\da-indicizzare\goccia-2026-11-08-14.txt`.
- **Le città**: `USCITA_ADESSO` in `genera-pagine-adesso.js` dà il giorno a ogni città della seconda ondata; prima di
  quel giorno (ora italiana, `OGGI=AAAA-MM-GG` per le prove) la città non esiste: niente pagina, pillole, elenchi né
  sitemap. **Il giro del mattino la scrive da solo il suo giorno** (`SOLO=citta`; `git add -- '*/index.html'` prende
  anche le cartelle nuove e `pubblica-pages.js` copia la cartella intera), anche col PC spento; le pillole «Il radar città
  per città» delle pagine regione arrivano col generatore intero della sera.
- **I paesi**: `METEO_PAESI_C` in `genera-pagine-meteo-zona.js`, ognuno col suo `dal`, criterio del gruppo B (Google
  mostra già la pagina funghi a chi cerca «meteo <paese>» SENZA «funghi», Search Console 8/8-5/11: Corio 124 viste,
  Corleto Monforte 43, Crespano 34, Santa Margherita 33, poi 10-17; le valli senza pagina meteo quasi zero ricerche, per
  questo niente valli). Tolti Borca di Cadore (pluviometro a Cancia, 1.373 m, e il paese non è fra quelli intorno) e
  Monte Cucco («meteo a cucca»). Pluviometri fuori dal paese, con `primo` sul paese: Corleto Monforte (Savuco, 4 km),
  Santa Margherita di Staffora (Passo del Giovà, 10 km), Atella (torrente Atella al ponte della statale 381, 4 km),
  Chiusa di Pesio («Alta Valle Pesio», 10 km). Canolo Nuova e Val Ugovizza col nome del posto del pluviometro.
  **Due elenchi**: `METEO_PAESI_DA_SCRIVERE` (il giorno è arrivato: `genera-pagine-meteo-paese.js` scrive la pagina) e
  `METEO_PAESI_TUTTI` (in più la pagina deve esserci nel repo: pillole «paese per paese», riga nelle pagine funghi,
  sitemap). Così il giro del mattino, che riscrive le pagine regione, non linka una pagina che esce la sera.
  Sitemap sua `sitemap-meteo-paesi-c.xml` (famiglia `meteoPaesiC`, data `meteoPaesiC` in `pagine-lastmod.json`).
- **Il lotto della sera** (`lotto-127.js <worktree>` nello scratchpad della 127, ~25 s): paesi meteo due volte (la seconda
  vede le pagine nate nella prima), valli meteo, «adesso» intero, `genera-pagine-regione.js` e `genera-pagine-funghi.js`
  con `SOLO` sulle regioni dei paesi usciti, la riga «Meteo <paese>: previsioni ora per ora →» nelle pagine funghi di
  quei paesi (una riga, senza rigenerarle, come la 112 ter), `adesso` e `meteoPaesiC` in `pagine-lastmod.json`; poi
  commit, push, pubblicazione, `sc.py invia` delle due sitemap e la richiesta a mano. Cambiano anche `quote-paesi.json`
  (quote dei paesi intorno ai nuovi) e, la prima volta, il CSS del freddo nelle 21 «adesso» regione (mai rigenerate dal
  4/11) e `data-ondata="1"` nelle 24 città vecchie. A data di oggi (7/11) il lotto non cambia nessuna pagina meteo.
- **Condizione**: se l'8/11 mattina le 11 città chieste a mano il 7/11 risultano «scansionata, non indicizzata», le
  città si fermano (Google le giudica copie: si lavora prima sulle parole) e vanno avanti solo i paesi.
- **Misura**: ogni lotto via API a 24 e 72 ore, contro le città della prima ondata (0/24 a tre giorni con la sola
  sitemap) e le meteo paesi B (12/20 in 5 ore).

## Il radar delle città «adesso»: centrato sulla città, due zoom sopra l'Italia, senza confine (8/11/2026, scheda 127)

- Il 28/10 le «adesso» delle regioni erano passate al radar su tutta Italia e un pezzo d'Europa («sulla regione è quasi
  sempre una cartina vuota»); le città, nate il 4/11 (118 bis), si aprivano invece sulla città e un centinaio di km
  intorno (±0,75° e ±1,05°, tessere allo zoom 8): troppo vicino, quasi sempre senza pioggia. Suo, l'8/11, guardando
  Milano: «è la logica che abbiamo scelto [...] per quale motivo sulle città devi fare diverso». Prima prova (mai uscita,
  `VERSIONE_JS` 14): la città con la stessa inquadratura della regione e il confine. Suo: «non ha senso che metti il
  confine regionale, aumenta lo zoom centrando la città, proviamo 2 punti di zoom», e «dobbiamo modificare tutte le
  pagine col radar, cominciamo dalla città» (le regioni vengono dopo, con lui).
- **Ora** (`lib/pagina-adesso.js`, `VERSIONE_JS` 15): la città è CENTRATA, **due zoom sopra** l'inquadratura d'Italia
  della sua regione (`getBoundsZoom` dell'Italia estesa alla regione col margine del `fitBounds`, senza spostare la
  cartina: al PC 7 invece di 5, al telefono 6,75 invece di 4,75), punto rosso, **niente confine della regione** (il
  livello si crea solo per misurare, `if(!QUI) lay.addTo(m)`). Il «−» scende di tre tocchi, fino al minimo della
  regione. Il «+» si avvicina alla città (`setView` su `QUI` finché la cartina non è stata trascinata).
- I nomi sopra la foto (`nomiCitta` in `genera-pagine-adesso.js`): prima le città della regione e i capoluoghi d'Italia,
  poi i comuni intorno sopra i 10.000 abitanti, che compaiono avvicinandosi (coi vicini davanti, con la cartina larga
  usciva Savona accanto a Milano al posto di Firenze).
- Prova in locale (server del worktree sulla 9090, `zoom-piu-127.js` e `confronta-zoom2-127.js` nello scratchpad della
  127): Milano all'apertura Como, Brescia, Cremona, Sondrio, Torino, Genova, Bologna, Venezia e la pioggia sulla Liguria;
  col «+» al secondo tocco Monza, Bergamo, Varese, Lecco, al terzo (zoom 10, il tetto) Sesto San Giovanni, Rho, Rozzano;
  riga viva, previsione e pluviometri come prima, 0 errori.

