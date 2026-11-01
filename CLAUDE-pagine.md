# CLAUDE-pagine.md: le pagine del sito (regioni, zone, funghi, SEO)

Pezzo del `CLAUDE.md` del repo, diviso per argomento il 1/11/2026 (scheda 107, sua scelta). **Prima si legge il
`CLAUDE.md`**: le regole che valgono sempre e l'indice di tutti i file. Qui sotto le sezioni sono quelle di prima,
tali e quali e nello stesso ordine: quando una nota dice «più su», «qui sotto» o «in fondo al CLAUDE.md», la sezione
può stare in un altro file, e il titolo si trova nell'indice del `CLAUDE.md`.

Per arrivare a una sezione: `grep -n "^## \|^### " CLAUDE-pagine.md`, poi si legge da quella riga.
**Le note nuove di questo argomento vanno IN FONDO a questo file**, con una riga nell'indice del `CLAUDE.md`.

Sezioni:

- Riepiloghi delle pagine regione (24 agosto 2026)
- «Diretta radar» sulle 1.085 pagine, e il segnaposto nei link (3 settembre 2026)
  - ⚠️ Le cinque trappole, tutte trovate DOPO aver dichiarato fatto
  - Come si collauda (e come NON si collauda)
  - Dove sta la roba
- Il ritratto del pluviometro, e perche' e' una faccenda di indicizzazione (4 settembre 2026)
  - Cosa si cuoce e cosa NO
  - `lib-clima.js` — il ritratto
  - I link dei vicini stanno nell'HTML, non nel javascript
  - La sitemap e' un indice
  - Quanto e' servito, misurato
  - Il rinnovo si fa da solo, ogni mese (dal 1/11/2026; prima quattro volte l'anno)
- Le due categorie di pagine (13 settembre 2026)
- La vetrina si configura da un file di dati (20 settembre 2026)
  - Come si cambia vetrina, adesso
  - ⚠️ ANCHE LE COPERTINE STANNO IN `data/vetrine/`
  - La copertina anche sul TELEFONO (20 settembre 2026)
  - Le cose da sapere
- Zone piogge e zone funghi anche meteo (19-20 ottobre 2026)
- La testata del sito e le idee delle pagine meteo su tutte le famiglie (28/10/2026 sera)
- Controllo SEO del 31/10/2026 (scheda 104 bis): le parole di sei famiglie
- Correzioni del 1/11/2026 (scheda 105 bis, dopo l'analisi delle famiglie di pagine)
  - Secondo giro dello stesso giorno: i punti medi dell'analisi (suo «fai i medi»)
  - ⚠️ DA FARE SENZA URGENZA (la memoria, aggiornata la sera del 1/11/2026; si riparte dalla scheda 105)

---

## Riepiloghi delle pagine regione (24 agosto 2026)

Le 23 pagine regione si calcolavano i loro due numeri **dal browser di chi le
apre**, scaricando i file giornalieri uno per uno: **20 richieste** a
raw.githubusercontent per la maggior parte delle regioni, **40** per Friuli e
Svizzera che di cartelle ne hanno due. Funzionava, ma appoggiava a raw una
raffica per ogni visita, ed e' la stessa raffica che il 18/8 prendeva 2-3 429
veri su 120 file. La mappa quel caso lo para (scorta, riserva Netlify, avviso);
**le pagine no**, e un 429 li' faceva sparire in silenzio il giorno di quella
cartella: media piu' bassa senza dirlo.

- **`genera-riepiloghi.js` + `riepiloghi.yml`**, due giri al giorno (05:10 e
  23:20 UTC), scrivono `data/riepiloghi/<regione>.json` (~1,5 KB l'uno): media,
  giorni, stazioni, primo/ultimo giorno e le prime cinque stazioni gia' pronte
  da stampare, per la scheda a 7 e per quella a 20 giorni. **Zero rete**: legge i
  file gia' nel checkout, nessuna API di nessun ente, 0,7 s per tutte e 23. E
  **zero crediti Netlify**, perche' `data/` e' nella regola ignore.
- **La pagina fa UNA richiesta.** Il vecchio calcolo resta come **ripiego** se il
  riepilogo manca o e' vecchio. ⚠️ **La freschezza si misura su `generato`, non
  sull'ultimo giorno contenuto**: la Slovenia dichiara 34 ore di ritardo e la
  Puglia ha giornate che MeteoHub non consegna, quindi un riepilogo sanissimo
  puo' finire due giorni indietro — col controllo sbagliato quelle due regioni
  sarebbero cadute sul ripiego tutti i giorni. Soglia 36 ore, cioe' un giro
  saltato si perdona, due no.
- **L'anagrafe delle regioni sta in UN posto solo**: `genera-pagine-regione.js`
  ora si lascia anche `require`, e il generatore dei riepiloghi prende da li'
  `dirs`. Due elenchi di cartelle divergenti darebbero pagina e riepilogo
  diversi sullo stesso indirizzo, senza che nessuno se ne accorga.
- ⚠️ **La regola delle gemelle esiste ora in TRE copie** (mappa, ripiego dentro
  la pagina, generatore dei riepiloghi) e devono restare uguali.
- I pulsanti prendono le date dal riepilogo: se no la mappa si apriva su un
  periodo diverso da quello scritto nella scheda.
- **La riga «5.584 pluviometri letti stamattina alle 7:10» (24/8/2026) esce da
  qui**: lo stesso script scrive `data/riepiloghi/letture.json` (stazioni,
  cartelle, giorno, ora in cui abbiamo guardato). ⚠️ Si conta **un giorno solo,
  ieri**, non l'ultimo giorno disponibile cartella per cartella: sommando giorni
  diversi il totale si gonfia. Le reti in ritardo dichiarato (Slovenia 34 ore,
  Puglia quando MeteoHub salta) restano fuori e il numero esce **piu' basso** del
  vero. In mappa sono DUE caselle mai visibili insieme: `#letture-fonte` sotto la
  mappa sopra i 600px, `#letture-pannello` dentro il pannello dei cumulati sotto
  i 600px (li' il pie' di pagina e' `display:none`, e su telefono sta l'86% degli
  utenti). Il `:empty` le tiene sparite finche' il numero non arriva: se il file
  non si scarica la pagina e' identica a prima. Misurato in produzione: la
  richiesta parte a 386 ms e dura 313, mentre l'ultimo file dei dati arriva a
  1.777 ms — sta tutta nell'ombra del caricamento e nessuno la aspetta. Il
  pannello passa da 268 a 295 px, verificato a 393x760 e 360x640.
  ⚠️ **L'indirizzo del file e' quello di PRODUZIONE anche nel repo di test** (li'
  il workflow non gira), cosi' la riga resta identica nei due `index.html` e non
  diventa una sesta riga di dominio.
  ⚠️ **Niente `toLocaleString` per le migliaia**: in italiano Intl non punta i
  numeri di quattro cifre (5584) e punta quelli di cinque (55.840), quindi la
  riga cambierebbe faccia da sola il giorno che le stazioni passano 9.999.
- **Perche' NON e' un contatore di visite o di analisi, che era la richiesta di
  partenza**: le analisi vere sono 16.473 in 28 giorni (GA4, 18/8) e sarebbero
  un bel numero, ma per farlo salire in diretta serviva una funzione Netlify con
  un archivio, e **il piano e' quello gratuito da 1.000 crediti** dove i soli
  deploy ne avevano gia' consumati 1.024 in un mese. Decisione dell'utente:
  niente costi incerti. Il conto delle letture invece e' gratis, sta gia' nei
  file, e dice la stessa cosa da un'altra parte: che la macchina lavora.
- **Collaudo, tutte e tre le strade** (misurate sul browser, sito di test prima e
  produzione poi): riepilogo fresco → 1 richiesta; mancante → 41; vecchio di 5
  giorni → 40. Numeri identici nei tre casi (Friuli 77 e 98 mm).

---

## «Diretta radar» sulle 1.085 pagine, e il segnaposto nei link (3 settembre 2026)

Tutte le pagine contano i giorni **già chiusi** e oggi lo escludono, ma chi
cerca «dove ha piovuto **oggi** in puglia» atterrava proprio lì e trovava
scritto che no. La Puglia lo mostrava nero su bianco: **posizione media 2 in
Search Console e un secondo di permanenza** dal traffico Google, contro 1m42s-
7m56s di tutte le altre pagine regione. Non era la pagina rotta, era
l'intenzione sbagliata. Da qui il blocco «Sta piovendo adesso?» con il tasto
alla diretta radar, su **23 pagine regione, 948 di paese e 114 di zona**, e la
precisazione in chiaro che **il radar non è un pluviometro** (misura dal cielo,
2 km di risoluzione) e che i millimetri della pagina restano quelli misurati a
terra.

Insieme, tre cose che le pagine di paese e di zona non facevano:

- **il segnaposto sul posto**, via `pl` (coordinate) e `pn` (nome) nel link,
  più `pz=1` quando il posto è un'area e va inquadrata più larga;
- **le regioni vicine**, fino a 3, con lo STESSO criterio della ricerca per
  località e la STESSA griglia (`data/regioni-vicine.txt`) — Alpe Gorreto passa
  da 195 a **757 stazioni**, e sparisce la mezza mappa vuota oltre il confine;
- **un periodo già scelto**: il tasto sotto l'anteprima apriva la mappa senza
  date, e chi non conosce il sito non capiva di doverle scegliere.

### ⚠️ Le cinque trappole, tutte trovate DOPO aver dichiarato fatto

**1. Il segnaposto è disegnato in SVG, e col radar acceso sparisce.** Due
regole nate per i pallini delle stazioni se lo mangiavano:
`.modo-radar #map path{fill-opacity:0}` e
`body.senza-pallini #map .leaflet-marker-pane svg{display:none}`. Il commento
accanto alla seconda diceva «i pallini sono svg, quelli del paese e della
posizione sono div»: **vero per il contenitore, falso per il disegno dentro**,
che è un `<svg><path fill="#e12b2b">`. Il difetto **c'era da prima**: valeva
anche per chi cercava un paese e poi accendeva il radar. Corretto con due
eccezioni su `.loc-pin`.
⚠️ **Il controllo automatico non lo vedeva**: `document.querySelector('.loc-pin')`
rispondeva sì, e il `getBoundingClientRect` dava misure sensate. Da qui in poi,
per una cosa che si deve VEDERE, si controlla anche `display` dell'svg e
`fill-opacity` del path — o si guarda lo scatto.

**2. `_daRicerca` va alzato PRIMA del `change`, non dopo.** Mettendo il
segnaposto dentro l'attesa dei confini, il gestore del cambio regione lo
spegneva (`if(!_daRicerca){ _vistaPaese=null; locSegnapostoVia(); }`) e faceva
la sua **mezza inquadratura** sulle regioni: la puntina arrivava al quarto
secondo e la mappa faceva un salto. È **la stessa correzione del 22/8/2026**
per la ricerca per località («un istante sull'inquadratura vecchia, poi lo
scatto sul paese»): cambia solo da dove arriva il posto. Il flag esiste apposta,
si riusa. Modello da copiare: `locVai`.

**3. Col radar non si inquadra niente.** L'inquadratura è del radar, che si
riquadra da solo sulla regione e lo rifà a ogni cambio di pallini: qualunque
nostra inquadratura si vede come uno scatto. Misurato sulla Garfagnana:
**z7,25 → z8,5 → z7,25** in mezzo secondo. E per lo stesso motivo col radar si
alza `_daRicerca` anche senza segnaposto, se no la mezza inquadratura resta e
**sfarfalla** (Puglia: 7,25 e subito 7,50, mentre il tasto «Diretta radar»
dentro al sito non sfarfalla perché di inquadrature ne parte una sola).

**4. Le regioni vicine NON si mettono sul tasto del radar.** Il radar è un
composito europeo e **non dipende dalle regioni scelte**: aggiungerle allargava
l'inquadratura di oltre un livello senza mostrare un dato in più. Sulle analisi
sì, perché lì le regioni sono i pluviometri.

**5. ⚠️ I TRE TASTI IN CIMA ALLE PAGINE LI COSTRUISCE IL JAVASCRIPT DELLA
PAGINA, NON IL GENERATORE.** Avevo messo `pl`/`pn` solo sui tasti che scrivo io
nel modello, e quelli restavano senza puntina: l'utente ha cliccato proprio
quelli e ha visto la mappa senza segnaposto. Stanno dentro `disegna()`, nella
funzione `link(dal, al, centra)`. **Toccando i link di una pagina si cercano
TUTTI i punti in cui nascono**, non solo quelli nel modello.

### Come si collauda (e come NON si collauda)

`collauda-bottoni.js` (cartella claudio): apre ogni pagina, **clicca ogni tasto che
porta alla mappa** e riporta regioni accese, periodo analizzato, se la puntina
è DISEGNATA (non solo presente) e l'inquadratura. Ne esiste il gemello sul sito
vero. Tredici tasti su tre famiglie di pagine: è così che sono venuti fuori
«Tutta la regione» che apriva tre regioni mentre il tasto ne prometteva una, e
il link di una stazione della zona che buttava via le vicine.
⚠️ **Provando in locale, i tasti delle pagine puntano alla PRODUZIONE**: per
seguire la catena fino in fondo si girano i link sul server locale, e prima di
committare si rigenera e si controlla che `localhost` non compaia in nessuna
delle 1.085 pagine.

### Dove sta la roba

- `.github/scripts/lib-vicine.js` — la griglia delle regioni vicine letta a
  build time. **La regola sta in un posto solo**: il sito la applica a runtime
  con `locRegioniVicine`, i generatori con questo, sulla stessa griglia.
- Il tetto di **3 regioni** non è gusto: è il massimo che la mappa accetta.
  Superandolo il link perde le regioni in coda senza dirlo.
- ⚠️ **Barre e apici**: `genera-pagine-zona.js` è tutto stringhe con apici
  singoli e `genera-pagine-localita.js` è un modello con apici inversi. In un
  giorno solo hanno rotto la compilazione tre volte: un `che e' il` dentro una
  stringa, un apice inverso dentro il modello, e uno script passato al volo alla
  shell che si è **mangiato le barre** di `\n`. Le patch si scrivono su file con
  lo strumento di Write e si lanciano da lì, con il conteggio delle occorrenze
  prima di sostituire. È la stessa regola già scritta per `index.html`.

---

## Il ritratto del pluviometro, e perche' e' una faccenda di indicizzazione (4 settembre 2026)

Le 948 pagine di localita' e le 114 di zona erano **gusci identici**: stesso
testo per tutte, i numeri scaricati dal browser. Misurato quel giorno su due
pagine sorelle della Liguria: **su 35 frasi, 28 identiche parola per parola**;
fra regioni diverse 22 su 35. E' il profilo classico delle pagine che Google
scansiona e poi lascia in **«scansionata, attualmente non indicizzata»** —
che non e' una coda, e' un verdetto, e rivederlo costa piu' tempo che prenderlo
bene la prima volta. Le pagine erano online da due giorni: la finestra giusta.

### Cosa si cuoce e cosa NO

- **Si cuoce quello che non cambia**: totale dell'archivio, giorni di pioggia,
  giorno piu' bagnato, mese piu' piovoso, posizione in classifica. Si scrive
  una volta e resta vero per sempre, perche' e' dichiarato col suo periodo.
- **NON si cuociono i millimetri di oggi**: cambiano ogni giorno e ogni
  aggiornamento sarebbe un deploy, ~15 crediti, **450 al mese su 1.000**. Il
  commento in cima a `genera-pagine-localita.js` diceva gia' perche' l'anagrafe
  non e' cotta: quel motivo vale per l'anagrafe, non per l'archivio.

### `lib-clima.js` — il ritratto

`clima(dirs)` legge tutti i file di una regione e per ogni id restituisce
giorni, primo e ultimo, totale, giornate bagnate, giorno piu' bagnato, mese
piu' piovoso. Tre paletti, tutti e tre necessari:

1. ⚠️ **Solo misure VERE.** Si scartano i file di stima (`source:
   open-meteo-*`) e le singole stazioni contrassegnate (`om:true`, `src`). Il
   test sul file e' **per esclusione**, perche' Piemonte e Veneto il campo
   `source` non lo scrivono affatto. Senza questo filtro il Lazio contava 106
   giorni invece dei 55 veri: cinquanta giorni di modello dentro una frase che
   dice «questo strumento ha misurato».
2. ⚠️ **Solo la finestra affidabile.** La tabella `AFFIDABILE_DA` era dentro
   `check-confini.js`; dal 4/9 sta in **`lib-affidabile.js`** e la usano tutt'e
   due. Le chiavi sono le CARTELLE (`friuli-osmer`), non le regioni.
3. ⚠️ **Il mese piu' piovoso solo fra i mesi INTERI** (90% dei giorni): un mese
   entrato in archivio a meta' perderebbe il confronto per un motivo che col
   tempo non c'entra.

**`GIORNI_MINIMI = 30`, scelto su un conto**: con 30 il ritratto ce l'hanno
tutti e 948 i posti, con 45 ne restavano fuori 66, con 60 addirittura 410 — la
meta' del centro-sud, dove il dato reale comincia a luglio.

⚠️ **La classifica si fa solo fra pluviometri con lo STESSO periodo alle
spalle** (giorni entro il ±10%), e solo se ce ne sono almeno dieci. Uno entrato
in archivio a meta' avrebbe meno millimetri per un motivo che con la pioggia
non c'entra niente. Per le ZONE il gruppo e' il **piu' numeroso** a pari
periodo, non il piu' lungo: la Garfagnana e' emilia+toscana (90 giorni contro
55) e coi piu' lunghi restavano due pluviometri, cioe' nessun ritratto. Sei
zone su 114 restano senza, e va bene cosi'.

⚠️ **Le frasi con i numeri vogliono la grammatica.** «in 1 giornate bagnate»,
«ha contato 0 mm», «il mese piu' piovoso e' agosto con 0 mm»: singolare,
plurale e il caso dei **5 pluviometri del sud che in tutto l'archivio non hanno
passato il millimetro**. Un numero cotto dentro non ha nessuno che lo rilegge:
i casi limite si contano PRIMA di scrivere la frase.

### I link dei vicini stanno nell'HTML, non nel javascript

Le tabelle («i cinque vicini» sulle localita', «i pluviometri della zona»)
nascevano a pagina aperta con `innerHTML`. **Nell'HTML servito non c'era nessun
link fra pagine sorelle**: ogni localita' aveva UN solo link in entrata in tutto
il sito, e le zone non linkavano nessuna delle loro localita'. Google i link nel
javascript li segue, ma dopo e pesano meno.

Adesso le righe sono cotte, coi nomi, le quote, le distanze e i link; il
javascript **riempie le caselle dei millimetri** e, sulle zone, **riordina le
righe** dal piu' bagnato spostando i nodi.
⚠️ **Non si rifa' la tabella con `innerHTML`**: cancellerebbe i link proprio
dalla pagina che Google ha in mano dopo il rendering, cioe' l'opposto di quello
che si voleva. Se un giorno si tocca quella parte, il controllo e' guardare
l'HTML servito con `curl`, non la pagina aperta nel browser.
⚠️ L'elenco dei vicini e' **congelato fino alla prossima generazione**: un posto
nuovo non compare da solo. E' il prezzo, ed e' accettato — sono cinque righe,
non le centododici dell'elenco in fondo, che infatti resta disegnato dal file.

### La sitemap e' un indice

`sitemap.xml` e' diventato un `<sitemapindex>` con quattro figlie:
`sitemap-mappa.xml` (25), `sitemap-funghi.xml` (19), `sitemap-localita.xml`
(948), `sitemap-zone.xml` (114). **Non accelera niente**: serve a MISURARE. Con
1.106 indirizzi in un file solo, il rapporto Pagine di Search Console li conta
tutti insieme e non si vede se sono le localita' a restare fuori o le zone.
⚠️ Le figlie si scrivono solo se hanno voci e l'indice elenca solo quelle
scritte: il repo di test non ha sempre le stesse famiglie della produzione.
⚠️ **`lastmod` si cambia a mano**, e solo quando il GUSCIO cambia davvero.
Mettendoci la data di oggi a ogni giro, a Google risulterebbe un sito che
riscrive mille pagine ogni notte, e smetterebbe di crederci.

### Quanto e' servito, misurato

| | prima | dopo |
|---|---|---|
| parole per pagina di localita' | 426 | **642** |
| frasi identiche a una sorella | 80% | **69%** |
| link statici a pagine sorelle | 0 | **6 per pagina** |
| link in entrata di una localita' | 1 | **fino a 7** |

Il resto lo dira' il rapporto Pagine di Search Console fra tre settimane, ed e'
per quello che la sitemap e' divisa.

### Il rinnovo si fa da solo, ogni mese (dal 1/11/2026; prima quattro volte l'anno)

`rinnova-pagine.js` + `rinnova-pagine.yml`, cron `20 11 1 3,6,9,12 *` (il primo
di marzo, giugno, settembre e dicembre). Rigenera funghi -> paese -> zona, e se
qualcosa e' cambiato davvero sposta la data in `pagine-lastmod.json` **solo per
le famiglie toccate**, rifa' la sitemap, committa e spinge.

⚠️ ~~QUESTO GIRO COSTA ~15 CREDITI NETLIFY~~ (vero fino al 7/10/2026). Dal trasloco
su Cloudflare Pages pubblicare e' gratis e il push NON pubblica da solo: le pagine
rinnovate vanno online col giro `pagine-regione.yml` del mattino dopo, che pubblica
tutto main (ottavo check, punto C, 21/10/2026), o subito con `pubblica-pages.js`.
Il ritratto contiene l'archivio e non i millimetri di ieri per la stessa ragione di
prima: quelli vorrebbero una pubblicazione al giorno.

⚠️ **Le quattro date della sitemap sono uscite dal codice** e stanno in
`.github/scripts/pagine-lastmod.json`, cosi' il rinnovo puo' aggiornarle senza
riscrivere un sorgente. Si possono ancora cambiare a mano quando si tocca un
modello.

⚠️ Se non e' cambiato niente **non committa e non spende**. `DRY_RUN=1` guarda e
dice cosa farebbe — ma attenzione: rigenera comunque le pagine sul disco, quindi
dopo una prova si fa `git checkout -- funghi/`.

⚠️ **Non tocca le 23 pagine regione ne' le 19 funghi**: quelle il ritratto non
ce l'hanno e la loro data deve restare quella vera dell'ultima modifica.

---

## Le due categorie di pagine (13 settembre 2026)

**Decisione dell'utente, e vale per ogni pagina futura.** Il sito ha due
famiglie che rispondono a due ricerche diverse, e non si mescolano:

| categoria | ricerca | pagine |
|---|---|---|
| **PIOGGE** | «dove ha piovuto ieri in Toscana / in Garfagnana» | 22 regioni (`/toscana/`, la Slovenia tolta il 1/11/2026) + **114 zone** (`/zone/<slug>/`) |
| **FUNGHI** | «dove andare a funghi oggi in Toscana» | 19 regioni, 114 zone, 911 localita', indice (`/funghi/...`) |

- **Piogge**: si deve essere i piu' avanti possibile su IERI. Le regioni hanno
  la scheda «Ieri» (piu' 7, 20, 30 giorni) e l'elenco «Dove ha piovuto, zona per
  zona». Le zone (`genera-pagine-zona-piogge.js`) hanno ieri, 7 e 30 giorni e la
  tabella dei pluviometri. ⚠️ **Pagine piogge per LOCALITA' no**, deciso: 911
  gusci quasi uguali ai gemelli funghi sono il profilo «scansionata, non
  indicizzata».
- **Funghi**: «oggi» nel titolo TUTTO L'ANNO (e' la ricerca), e sotto l'H1 la
  **riga di stagione** di `lib-stagione.js`, scritta dal browser col SUO mese:
  dicembre-febbraio fuori stagione, novembre e marzo ai margini, vuota il resto.
  Scartati: titoli senza «oggi» e titoli che cambiano con la stagione.
- Ogni pagina funghi rimanda alla sua pagina piogge («Ti serve un altro
  periodo?») e le zone piogge rimandano alla zona funghi.
- ⚠️ **«Ieri» solo se e' davvero ieri.** `genera-riepiloghi.js` sceglie
  l'ultimo giorno COMPLETO (`ultimoCompleto`: nel giro notturno, prima delle 5
  italiane, ieri si salta; e un giorno con meno del 90% delle stazioni dei giorni
  dopo non conta). Le pagine scrivono il giorno vero («Giovedi' 11 set») quando
  il riepilogo e' di altroieri.
- I riepiloghi di zona stanno in `data/riepiloghi/zone/<slug>.json`, scritti
  dallo stesso giro (zero crediti). ⚠️ Le medie dell'elenco zone sulle pagine
  funghi usano TUTTI i pluviometri della zona anche fuori regione e lo stesso
  arrotondamento della pagina di zona: prima 41 zone su 114 davano un numero
  diverso da quello che trovavi aprendola.
- `slug`, `elenco`, `diZona` stanno in `lib-nomi.js`: una regola sola per gli
  indirizzi delle zone. Sitemap: famiglia `sitemap-zone-piogge.xml`.


---

## La vetrina si configura da un file di dati (20 settembre 2026)

Richiesta dell'utente: «fai la vetrina file di dati cosi' non spendiamo piu'
deploy al cambio vetrina».

⚠️ **LA REGOLA IGNORE ANNULLA LA BUILD, MA LA FILA SE LA FA LO STESSO**
(21/9/2026). Il 21/9 un deploy vero ha aspettato **43 minuti** in coda con la
scritta «enqueued: awaiting capacity». Contati i commit delle 24 ore precedenti:
**93 in produzione e 36 sul test, tutti dentro `data/`, contro 1 solo di roba
vera**. Ognuno mette in fila una build che poi viene annullata: non costa
crediti, ma occupa la coda. ⚠️ **E la capacita' e' DI SQUADRA, non di progetto**:
un solo slot in parallelo per prod e test insieme, quindi si contendono la fila.

**Rimedio: `[skip netlify]` nel messaggio di commit dei collector**, che li fa
saltare del tutto senza entrare in coda (documentato da Netlify; le modifiche
saltate vengono pubblicate dal primo commit vero successivo, quindi non si perde
niente). Messo su 23 workflow di produzione e 12 del test.
⚠️ **NON `[skip ci]`**: quello lo legge anche GitHub Actions e rischierebbe di
spegnere i collector.
⚠️ **`rinnova-pagine.yml` NON ce l'ha e non deve averlo**: scrive `funghi/` e le
sitemap, cioe' pagine vere, e deve pubblicare. `anteprime.yml` non serve, spinge
sul ramo `anteprime`.
⚠️ **La soluzione sbagliata era comprare capacita'**: Netlify offre un container
in piu' a 40 dollari al mese. Sarebbe stato pagare una corsia per traffico che
non doveva esserci.

**IL CONTO, che e' tutta la ragione:** `data/` sta nella regola ignore di
Netlify, quindi **un commit li' dentro NON fa partire un deploy**. Cambiare il
video in vetrina passa da **~15 crediti a ZERO**. Con un'uscita a settimana sono
~750 crediti l'anno risparmiati su un piano da 1.000 al mese, e soprattutto
nessuna attesa: si modifica `data/vetrina.json`, si committa, e nel giro di
qualche minuto (raw tiene la sua copia 5 minuti) il sito mostra la vetrina nuova.

### Come si cambia vetrina, adesso

1. si apre `data/vetrina.json`;
2. si aggiunge una voce in `vetrine` e si mette la sua chiave in `sorteggio`;
3. commit e push. **Nessun deploy, nessun credito.**

**Vetrina che non porta a un video (dal 4/10/2026)**: `"tipo": "gioco"` nella voce (la prima è il quiz esame tartufi, `avventuremicologiche.it/esame-tartufi/`). Al posto del logo YouTube una coppa: accanto all'occhiello sul computer, 🏆 nella riga piccola e bottone giallo con la coppa nella pillola del telefono; il title dice «Gioca». Senza `tipo` resta un video. L'evento GA resta `click_youtube` col campo `vetrina` (stessa regola dei link Facebook).

Il file ha in cima un campo `_leggimi` con le istruzioni, cosi' chi lo apre fra
sei mesi non deve cercarle altrove. `sorteggio` vuoto = niente vetrina, resta la
scheda «Iscriviti». `mostra` vale `alterna` (usa il sorteggio), una chiave
qualsiasi (inchioda quella), o `''` (spegne tutto). `da` e `fino` accendono e
spengono da soli all'ora giusta.

### ⚠️ ANCHE LE COPERTINE STANNO IN `data/vetrine/`

La prima versione lasciava i `.jpg` nella RADICE, e cosi' il risparmio valeva
solo per i cambi senza immagine nuova. Sua domanda, mezz'ora dopo: «se metto
l'immagine devo cmq usare 15 crediti?». Si', e quindi **il lavoro non serviva al
caso che conta**: un video nuovo porta sempre una copertina nuova.

Le undici copertine sono state spostate in `data/vetrine/` (`git mv`, 444 KB) e
`index.html` le legge da li'. **Adesso un video nuovo costa ZERO crediti,
copertina compresa.** Unico punto di codice toccato: `urlCopertina(V.copertina)`
nel `background-image` della scheda.

⚠️ **Si leggono da RAW, non dal nostro dominio**: la copia su Netlify si aggiorna
solo ai deploy, e una copertina appena aggiunta li' non ci sarebbe ancora. Se raw
non risponde si ripiega su `/data/vetrine/`, che ha le copertine fino all'ultimo
deploy — provato servendo un 503 da raw: la scheda passa all'indirizzo locale da
sola. ⚠️ Un `background-image` non ha `onerror`: l'immagine si precarica con un
`new Image()` a parte e si cambia solo se fallisce.

⚠️ Un valore di `copertina` che contiene una barra o comincia per `http` si usa
com'e': serve a puntare altrove senza toccare il codice.

⚠️ **Le copertine vecchie in `data/vetrine/` NON si cancellano** anche quando
`vetrina.json` non le usa piu': le usa la configurazione incorporata in
`index.html`, che e' il ripiego. Cancellarle vuol dire che il giorno in cui il
file non si scarica la scheda esce senza immagine. Il 20/9 e' stato tolto solo
`vetrina-video.jpg`, che non era citato da nessuna parte.

### La copertina anche sul TELEFONO (20 settembre 2026)

Fino a quel giorno la pillola del telefono mostrava l'avatar di Archie e la
copertina la vedeva **solo il computer, cioe' il 10% del traffico**. Adesso, se
la vetrina ha una copertina, quella prende il posto dell'avatar (l'avatar resta
dappertutto nel resto del sito). Vale per tutt'e due le forme della pillola,
quella semplice e quella con i tre bottoni social.

⚠️ **56x32 e non di piu', ed e' un numero misurato.** A 64 px il titolo va su
DUE righe e la pillola passa da 61 a **78 px**: 17 px di mappa ripresi indietro
il giorno dopo averli liberati con la barra in basso. Il limite vero e' 60; 56
tiene il margine per i font dei telefoni veri. Provato a 360x640 e 393x760:
altezza invariata, niente sbordi.

⚠️ A quella misura l'«EP. 1» stampato dentro la miniatura e' piccolo: il numero
che si legge e' quello nel titolo, non quello in copertina.

### Le cose da sapere

⚠️ **La configurazione incorporata in `index.html` RESTA, ed e' il ripiego.** Se
il file non si scarica — GitHub giu', rete a pezzi, JSON scritto male — il sito
fa esattamente quello che faceva prima. Una vetrina che non parte non deve mai
diventare una pagina rotta. Provate tutte e quattro le strade: file servito
(«da data/vetrina.json»), 404, JSON troncato, e nessuna risposta — **in tutti e
quattro i casi la scheda esce identica, 183 px**, e la console dice quale strada
ha preso.

⚠️ **L'indirizzo e' quello di PRODUZIONE anche nel repo di test**, come per
`letture.json`: cosi' i due `index.html` restano identici e la vetrina e' una
sola per tutt'e due i siti. Cadendo sotto `raw.../main/data/` eredita gratis la
riserva su Netlify gia' scritta per i file dei giorni — ⚠️ quella copia pero' e'
ferma all'ultimo DEPLOY, quindi se cambi la vetrina senza pubblicare niente la
riserva serve quella vecchia; vale solo quando GitHub e' irraggiungibile.

⚠️ **Il tetto e' 1,2 s.** Oltre quello si monta il ripiego: la scheda del canale
non e' la mappa e non deve far aspettare nessuno.

⚠️ **Niente salti di impaginazione**, e non e' fortuna: `#channel-logo` e'
`position:absolute` sopra la mappa, quindi cambiando altezza non sposta niente.
Misurato tre volte per parte: locale 0,0099 costante, produzione 0,0099 con un
picco a 0,0772. Sul telefono la pillola sta dentro la legenda, che compare
secondi dopo: CLS 0,0007 sia col file immediato sia con 900 ms di ritardo.

⚠️ **La configurazione si e' estratta DAL CODICE, non ribattuta a mano**
(`estrai-vetrine.js` nello scratchpad): nove vetrine con tutti i loro campi, e a
mano una virgola sbagliata non la vede nessuno finche' la vetrina non sparisce.

⚠️ **`ganciopx` NON si tira a indovinare**: si misura sulla colonna da 199 px del
computer, se no il gancio va a capo. E' scritto anche nel `_leggimi`.

**Collaudo** (`prova-vetrina-file.js`, `prova-vetrina-cambio.js`,
`prova-vetrina-telefono.js` nello scratchpad del 20/9): le quattro strade; poi
cinque configurazioni diverse servite al volo — vetrina di oggi, sorteggio
spostato sulla guida, un video inventato, sorteggio vuoto e vetrina scaduta — e
la scheda cambia di conseguenza senza toccare `index.html`.


---

## Zone piogge e zone funghi anche meteo (19-20 ottobre 2026)

Le 114 zone piogge (`/zone/<slug>/`) e le 114 zone funghi (`/funghi/zone/<slug>/`) usano lo stesso codice nel
browser delle pagine regione: `meteoClient` di `lib-meteo-regione.js`, copiato nella pagina con `toString()` e
chiamato con un quinto parametro `OPZ` (senza `OPZ` e' la pagina regione di sempre). ⚠️ Quel codice gira nel
browser: solo ES5, niente frecce, `let`, `const` o backtick.
- **I paesi di «Che tempo farà»**: `data/paesi-zone.json`, scritto da `genera-pagine-zona-piogge.js` (fino a 12 per
  zona: i comuni dei pluviometri e quelli dentro l'area dei pluviometri prima, poi i paesi vicini della regione).
  La Function li legge con `/api/previsioni?zona=<slug>` dai file del SITO (`env.ASSETS`): vanno online solo con
  la pubblicazione. Regola sua: «meglio un paese in piu', anche fuori zona, che uno in meno», e la pagina scrive
  «I paesi della X e dei dintorni». Limite noto: in Lunigiana Pontremoli e Fivizzano restano fuori.
- **Zone funghi**: in piu' «🌲 Trova i boschi» (`boschiHtml`, casella che apre `?boschi=1` sul posto), il blocco
  meteo ha l'id `mk-meteo` (li' `#meteo` e' il grafico delle temperature) e `OPZ.grafico=false`: **niente giorni
  previsti nel grafico dei funghi** (impronta etica: niente previsioni di crescita).
- **«Apri la mappa di ieri» piu' grande** (`IERI_GRANDE` in `genera-pagine-regione.js`, PRIMA di `METEO_CSS`: le
  zone piogge copiano il foglio della regione e lo tagliano all'inizio del blocco meteo, cosi' lo ereditano). Non
  sta in `STILE_IERI`, che usano anche le pagine «adesso».
- `SOLO=<slug>` rigenera una zona sola (campioni), senza toccare la sitemap.
- **Le 908 pagine paese (20/10/2026)** hanno gli stessi pezzi delle zone funghi (cerca in testata, «Trova i boschi»,
  «Che tempo farà» al posto della striscia blu, grafico senza giorni previsti). Prima riga della tabella = il punto
  del PLUVIOMETRO alla sua quota («al pluviometro», campo `qui`), poi fino a 7 comuni entro 12 km (20 km se ne
  restano meno di 5). I paesi stanno in `data/paesi-localita/<regione>.json` (UN FILE PER REGIONE: tutto in uno
  sarebbe ~600 KB contro i 10 ms di CPU della Function), letti da `/api/previsioni?paese=<reg>/<slug>`.
  `genera-pagine-localita.js` accetta `SOLO=<reg>/<slug>`. Nella Function la chiave di cache usa il nome INTERO
  del file (`paesi-zone` e `paesi-localita` davano tutti e due «pa»).
- **Quiz tartufi**: dal 20/10 anche Lombardia, Piemonte, Liguria ed Emilia (`QUIZ_REGIONI` in
  `lib-pagina-funghi.js`); l'Emilia ha indirizzo (`QUIZ_SLUG`: emilia-romagna) ed etichetta corta sue.
- **Le 19 regioni funghi (20/10)**: «Che tempo farà nelle zone dei funghi della X», una riga per zona al CENTRO della
  zona e alla QUOTA MEDIANA dei suoi pluviometri («a 1040 m», campo `sotto`), nell'ordine dell'elenco «Le zone dove
  andare» (`OPZ.ordine = 'zone-dove'`, meteoClient aspetta che la pagina lo riordini). `data/zone-regioni.json` lo
  scrive `genera-pagine-funghi.js`, lo legge `/api/previsioni?zonedi=<reg>`. Senza zone (Puglia, Basilicata,
  Sardegna): le citta'. ⚠️ Il foglio delle regioni funghi e' il modello di paesi e zone: `METEO_CSS` sta IN FONDO, cosi'
  `stileDelModello` lo taglia, e toglie anche `STRISCIA_CSS`.
- **La mappa nella scheda in cima (20/10, tutte le pagine funghi)**: `lib-striscia.js`. Il bottone «Vedi sulla mappa»
  diventa due riquadri «💧 Guarda la pioggia / ultimi 20 giorni» e «🌲 Guarda i boschi / tipo per tipo», ritagliati
  nel browser da UNA immagine per regione: `<reg>-mappa.webp` + `<reg>-mappa.json` (zoom e pixel mondo dell'angolo,
  EPSG:3857). Pioggia: le scrive `genera-anteprime.js` a ogni giro sul ramo `anteprime`; boschi: fisse in
  `tessere-boschi/anteprime/`, si rifanno a mano con `BOSCHI=1 SITO=http://localhost:8788/ OUT=tessere-boschi/anteprime
  node .github/scripts/genera-anteprime.js <regioni>` quando cambiano le tessere. In locale la pioggia si legge da
  `/_anteprime-prova/` (in .git/info/exclude). Ingrandimento massimo 1,1 (oltre, nelle regioni grandi, sgrana).
  Etichette GIALLE all'85% su tutte (`OPZ.colore`, di partenza `giallo`; sua scelta sul confronto col blu scuro).
- **Pagine PIOGGE (regioni 23 e zone 114, 20/10)**: la stessa libreria con `ieri: true, modo: 'bottone'`: il bottone
  «Apri la mappa di ieri» DIVENTA la mappa della pioggia di IERI (`<reg>-ieri.webp/json`, che `genera-anteprime.js`
  scatta a ogni giro con `scattaIeri` e `anteprime.yml` copia sul ramo), con la sua scritta sull'etichetta gialla.
  Solo la pioggia, niente boschi (suo: «in alto solo la mappa piogge»). La mappa di un giorno e' piu' sbiadita di
  quella dei 20 giorni: nei giorni asciutti e' quasi solo cartina coi pallini, ed e' il dato vero.
  ⚠️ **DAL 1/11/2026 LA CARTINA E' QUELLA DEI 7 GIORNI, GRANDE** (suo, sulla Sila Grande: «da quando le scritte sono
  cosi' grandi e la cartina non si vede?», «sempre una merda piccolissima con un titolo gigantesco»). La scheda resta su
  IERI (numeri e titolo), la cartina e' `<reg>-7g` (ora scattata per TUTTE le regioni) alta 300 px al telefono e 440 al
  PC (era 140 / 185 con sotto la fascia gialla), sulle pagine regione la regione INTERA; dentro la cartina la pillola
  gialla «💧 Pioggia degli ultimi 7 giorni →» (porta a #cta7) e SOTTO il bottone giallo largo «Oppure guarda la pioggia
  di ieri →» (`a.mk-oppure`, il link del vecchio «Apri la mappa di ieri»; suo: «i due bottoni devono essere simili» e
  «la gente non capisce a quanti giorni e' la mappa»: per questo la pillola dice i 7 giorni). Se la cartina dei 7 giorni
  manca o non finisce a ieri si torna alla cartina di ieri, senza il bottone. Scartate: scritta sotto la cartina (28/10),
  due pillole sulla cartina, due bottoni a meta'.
  ⚠️ **ANCHE LE PAGINE FUNGHI, la sera del 1/11/2026** (suo: «sì ingrandiscili anche qui», proposta B): i due riquadri
  (pioggia 20 giorni e boschi) sono tutto cartina, con la pillola gialla sopra che dice il periodo («💧 Pioggia 20 giorni
  →», «🌲 Boschi, tipo per tipo →»); al telefono uno SOTTO l'altro, larghi quanto la scheda e alti 240 px, al PC
  affiancati e alti 320 (erano 122 / 150 con la fascia sotto). Classe `mk-grandi`: i riquadri dell'indice `/funghi/`
  (`mk-italia`) restano loro. Le regioni si vedono intere anche qui (ritaglia). Le 1.120 pagine funghi NON sono state
  rigenerate: si e' sostituito solo il blocco della striscia (CSS dal suo commento d'inizio alla riga dell'opacita' del
  giallo, e la funzione `strisciaMappa`), cosi' i ritratti restano.
- **Mappa forestale (138 pagine, 20/10)**: `genera-mappa-forestale.js` ha ricerca in testata, «🌲 Trova i boschi»
  dopo lo scorcio, «Che tempo farà» dopo «Che boschi ci sono» (regioni: zone dei funghi alla loro quota con
  `zonedi=`, o le citta' dove le zone non ci sono; zone: i paesi con `zona=`; tipi di bosco e indice: niente meteo),
  quiz accanto a YouTube (`youtube(id, k)` → `coppiaQuiz`), ed EVENTI GA4 `apri_mappa` da `forestale-<pagina>-<pezzo>`
  con un ascoltatore unico sui link `/?…` (prima nessun evento: in GA4 risultavano «0» aperture). `zone-regioni.json`
  e' in ordine alfabetico; le regioni funghi lo riordinano da se'. Anche le pagine «adesso» hanno il quiz.
- **Il bottone del radar (20/10)**: in `meteoClient`, sotto la tabella di «Che tempo farà», al posto della riga
  piccola. Blu pieno col pallino che pulsa se un posto della tabella ha >= 1 mm OGGI («Oggi è prevista pioggia X /
  guardala arrivare col radar piogge»), se no «📡 Dove sta piovendo adesso / guarda il radar piogge». Porta al primo
  `main a[href*="radar=ora"]` della pagina, se no a `/<regione>/adesso/`.

## La testata del sito e le idee delle pagine meteo su tutte le famiglie (28/10/2026 sera)

Suo, dopo aver approvato le pagine «Meteo <paese>»: «prendi le idee nuove che abbiamo messo in queste pagine e applicale
anche alle altre famiglie di pagine dove è possibile», poi una pagina campione per famiglia (16, viste in locale) e «tutto
approvato». Famiglie: regioni, «adesso», zone piogge, funghi (regioni, zone, paesi, indice), mappa forestale (generale,
regioni, tipi di bosco, zone), meteo (zone e paesi), guida e fonti. Restano fuori solo la mappa e la home.
- **La testata, `lib-testata.js`** (`testata({ sito, canale, reg, ga, attiva })` + `TESTATA_CSS` IN FONDO al foglio): la
  «B» delle pagine meteo (sezione sopra). La voce gialla e' quella della famiglia: `attiva: 'storico'` regioni e zone
  piogge, `'previsioni'` le pagine meteo, nessuna le altre. Le voci aprono la mappa sulla regione della pagina (`reg`;
  vuota = Italia). ⚠️ **La colonna e' quella di `main` della famiglia** (suo: «non simmetriche»): variabili `--t-max` e
  `--t-pad`, di partenza 760 e 16; funghi e mappa forestale 860 e, sotto i 640 px, 12 (`TESTATA_CSS_FUNGHI`); guida
  1080 e 20; fonti 860. Misurato su tutte e 16 a 393 e 1366: logo e titolo allo stesso pixel, Iscriviti e fine pagina
  allo stesso pixel. Al posto di «🍄 Avventure Micologiche · piogge» delle pagine funghi c'e' la testata comune.
- **La lente del cerca** (`meteoClient`, pagine regione, zone, funghi, mappa forestale) sta nella fascia bianca prima di
  Iscriviti (`.t-ytp`), tonda e blu; toccandola la casella si apre sopra la fascia, al computer come al telefono. Con la
  lente mancavano 64 px al computer e 14 a 393: dove c'e' (`.t-in:has(.mk-lente)`) la frase perde «in tutta Italia» e il
  nome al telefono scende a 16 px. Senza lente la testata resta quella approvata.
- **Le sei porte del cerca** (`seiPorte` in `meteoClient`) come i sei bottoni delle pagine meteo: Previsioni · Pioggia
  caduta 7 giorni · 30 giorni · Radar piogge · Mappa boschi · Boschi + satellite (via Temperature), righe alte uguali.
  La riga sotto «Apri la mappa di ieri» (regioni e zone piogge): Previsioni · Radar piogge · Mappa boschi · Boschi +
  satellite, righe alte uguali e testo centrato. «📡 Radar adesso» → «📡 Radar piogge» in tutti i bottoni.
- **I capoluoghi di provincia prima degli altri paesi**, «in tutte le pagine»: `lib-capoluoghi.js` (l'elenco, `capoluogo`,
  `ordineCitta`, e `CAPI`, la stessa lista scritta come la normalizza il browser). Le tabelle «Che tempo farà» di
  `meteoClient` (Imperia prima di Sanremo) hanno `CAPI` scritta dentro: in fondo a `lib-meteo-regione.js` un controllo
  ferma il generatore se non e' uguale a quella della libreria. Le citta' delle pagine «adesso» idem (`cittaDi`).
- **Le anteprime in cima** (`lib-striscia.js`, pagine piogge e funghi, e i due riquadri dell'indice /funghi/): cartina
  sopra (`i.mk-img`, dove `ritaglia` mette l'immagine) ed etichetta SOTTO, gialla piena, come le anteprime delle pagine
  meteo. ⚠️ Selettori `div.mk-str`: alcune pagine copiano il foglio da un'altra pagina che ha ancora le regole vecchie
  (etichetta in posizione assoluta, ombra, angoli), e le nuove devono vincere comunque; altezza, posizione, ombra e
  angoli vecchi si annullano esplicitamente.
- **La pagina «adesso»: il radar su Italia e un pezzo d'Europa** per tutte le 21 regioni (suo, «indipendentemente»),
  col confine della regione disegnato: `lib/pagina-adesso.js`, `fitBounds([[37.2,6.5],[50.2,18.5]])` allargato alla
  regione intera (la Sicilia scende sotto i 37,2°).
- **La pagina «adesso»: la barra che scorre sotto il radar e «Previsioni meteo valle per valle»** (30/10/2026, scheda
  101 bis, suo: «sì, tutti e due»). La barra (`#nastro` fra `#mappa` e i tasti del riquadro `.rb`) e' quella delle
  pagine meteo (sezione «Pagine «Previsioni meteo <zona>»»): le citta' delle carte con icona, minima e massima di OGGI,
  scritta quando sono arrivate tutte (nessuna richiesta in piu'), «METEO <REGIONE> OGGI»; un tocco apre la citta' sulla
  mappa come la sua carta (evento `adesso_barra`). Sta sotto il radar e non sopra le carte perche' cosi' e' nella prima
  schermata anche al telefono. ⚠️ Stile e codice sono COPIATI da `genera-pagine-meteo-zona.js` (`.pz-nastro`, `naGira`,
  `taglia`): se cambia li', si cambia anche qui. Il blocco dei link: `linkMeteoRegione(reg)` di
  `genera-pagine-meteo-zona.js`, dopo le carte delle citta', «Meteo <nome>» in pillole, prima le valli poi i paesi, in
  ordine alfabetico (eventi `apri_meteo_zona` / `apri_meteo_paese`, `da: pagina-<reg>-adesso`). Le «adesso» sono su
  Google da subito e passano la strada alle pagine meteo; nelle regioni senza pagine meteo il blocco non c'e' e compare
  da solo rigenerando. ⚠️ Una zona o un paese meteo nuovo: si rigenerano anche le «adesso».
- **La pagina «adesso»: la riga viva «se e come sta piovendo»** (30/10/2026, scheda 101 bis, suo: «il commento in alto
  dovrebbe dire qualcosa che dice se e come sta piovendo», poi «sì, solo la riga»: la goccia «PIOVE» nella barra no,
  l'icona della barra e' la previsione del giorno e accanto a un'osservazione confondeva). Riquadro `.ad-ora` sotto il
  sottotitolo, prima del radar, scritto da `rigaViva()` in `lib/pagina-adesso.js` (`VERSIONE_JS` 7) all'apertura e ogni
  5 minuti: «Adesso · radar delle 11:20» e frasi da bollettino (suo, lo stesso giorno: «metti delle frasi più eleganti»,
  la brutta era «Non piove in Veneto, e nemmeno nei 150 km intorno»): «Pioggia moderata su Bari, debole su Taranto.
  Nelle altre sei città è asciutto. Le precipitazioni interessano l'11% circa della Puglia.», «Le città sono all'asciutto, ma
  piove debolmente nella zona di Salerno.», «Tempo asciutto in Toscana. La pioggia più vicina è a est di Arezzo, a circa
  75 km.», «Tempo asciutto in Veneto e in tutte le zone vicine.», «Entro le 12:00 la pioggia potrebbe raggiungere anche
  Gubbio.». La percentuale si scrive solo se una frase prima ha detto che piove. Vedi anche la voce sotto, sulle carte. ⚠️ **Legge i PIXEL del radar**: le tessere LibreWXR con lo SCHEMA 0 (`/0/0_0.png`, grigio = dBZ
  + 32, provato contro lo schema 2: 42 = 10 dBZ, il minimo), lette in una tela (le tessere hanno
  `access-control-allow-origin: *`), zoom 6 (~2 km a pixel). mm/h con Marshall-Palmer (Z = 200·R^1,6); classi con le
  soglie della pagina: sotto 0,3 niente, debole < 2, moderata < 6, forte < 24, molto forte. Citta' = il pixel piu' forte
  nei 3×3 intorno; regione = maschera del confine disegnata sulla tela; «più forte» solo con almeno 4 pixel di quella
  classe (un pixel solo puo' essere un'eco spuria); pioggia piu' vicina cercata nella regione e 1,5° intorno, oltre
  150 km «e in tutte le zone vicine»; «entro le…» dai fotogrammi `nowcast` per le citta' ancora asciutte. Il testo
  fisso del sottotitolo resta (Google legge quello). Provata il 30/10 mattina con pioggia vera al sud: 21 regioni × 2,
  42/42 (scratchpad 79554e37 `prova-adesso.js`, `radar-colori.js`).
- **La pagina «adesso»: «aggiornate alle» a pochi minuti, e le carte che si rinfrescano da sole** (31/10/2026, scheda 103,
  era il «da allineare» della scheda 102). Come la mappa («agg.» a pochi minuti e «La schermata delle previsioni si
  aggiorna da sola», piu' sotto): `#pv-quando` scrive l'ora di adesso o la prima `scade` delle citta' (l'Expires di MET
  che `/api/previsioni` manda per ogni punto), se viene prima; senza `scade` l'ora di MET come prima. Si riscrive ogni
  30 s; ogni 10 minuti, SOLO a pagina in vista (tornando in vista, subito se ne sono passati 10), `chiediCitta()` richiede
  le citta' con `&r=<minuto>` e rimette carte, barra e ora; la barra si ridisegna solo se il giorno di oggi di qualche
  citta' e' cambiato; una citta' che al rinfresco non risponde resta com'era (se e' ancora di oggi). A mezzanotte si
  richiede tutto e il numero grande riprende l'ora che viene. `VERSIONE_JS` 8. Per le prove `window._cittaRinfresca()` e
  `window._cittaGiri`. Prova `prova-adesso-agg.js` nello scratchpad della scheda 103 (orologio finto: 10 minuti dopo,
  pagina nascosta, richieste fallite, mezzanotte): Liguria, Sicilia e Abruzzo, PC 1366 e telefono 393.
- **Guida e fonti** non hanno generatore: la testata la mette `testata-pagine-a-mano.js`, da RILANCIARE quando cambia
  `lib-testata.js`. La guida perde «← Torna alla mappa» (ci porta il logo), le fonti la barra «← Mappa» (il titolo
  passa dentro la pagina).
- **`SOLO`** ora anche in `genera-pagine-adesso.js` (`SOLO=liguria`), `genera-pagine-funghi.js` (`SOLO=liguria`, niente
  `zone-regioni.json` ne' sitemap), `genera-indice-funghi.js` (`SOLO=1`, niente sitemap) e `genera-mappa-forestale.js`
  (`SOLO=liguria`, `SOLO=castagneti`, `SOLO=italia`, `SOLO=zona/<slug>`).
- **Non portato, deciso**: le tre anteprime vive (radar sull'Europa) nelle pagine piogge e funghi (vogliono Leaflet,
  che quelle 1.300 pagine non caricano: le farebbe piu' pesanti; in cima c'e' gia' l'anteprima della pioggia); il
  grafico nuovo nelle pagine piogge (e' un altro codice, si puo' rifare a parte).
- Date della sitemap (`pagine-lastmod.json`): tutte le famiglie al 28/10/2026, il guscio e' cambiato.
- Attrezzi delle prove (scratchpad della scheda 99 bis, `148ca25d-…\scratchpad\`): `prova-famiglie.js` (una pagina per
  famiglia a 360, 393, 1366: errori, sbordi, testata, lente, anteprime, porte, capoluoghi), `misura-colonne.js` (testata
  contro colonna), `prova-lente.js`, `prova-capoluoghi.js`, `campioni.ps1` e `rigenera-tutto.ps1`.

## Controllo SEO del 31/10/2026 (scheda 104 bis): le parole di sei famiglie

Suo il 31/10: «check completo di verifica e ottimizzazione seo», poi «considera solo i dati da quando abbiamo fatto le
modifiche» e, sulle sei proposte, «tutte e sei». Search Console 3-30/10, ogni famiglia contata solo dal giorno in cui ha
le parole di adesso (date ricostruite dal git). Il resoconto e gli attrezzi stanno nel banco, `seo-31-10\`
(`resoconto-search-console.md`). Il controllo dei FILE l'ha fatto una sessione cloud, cartella `controlli/seo-31-10/`
sul suo ramo. Solo parole: nessuna funzione nuova.
1. **Paesi e zone funghi** (`genera-pagine-localita.js`, `genera-pagine-zona.js`): titolo e scritta grande
   «Meteo funghi Sassello oggi: stanno nascendo?» (dentro c'e' ancora, attaccata, «funghi Sassello oggi»); descrizione
   e riga sotto la scritta grande cominciano con «Crescita funghi a Sassello». Motivo: «meteo funghi <paese>» 7.137
   viste in posizione 8,1 e «crescita funghi <paese>» 3.812 al 2,3% di clic, e nel titolo non c'erano. ⚠️ Val Clarea e
   Alpe di Poti sono anche pagine di paese: le loro ZONE tengono «Funghi in Val Clarea oggi» (`OMONIMA`), se no i due
   titoli sarebbero identici.
2. **«Adesso»** (`genera-pagine-adesso.js`): «Radar meteo Sardegna: dove sta piovendo adesso, in diretta», scritta grande
   «Radar meteo <regione>: dove sta piovendo adesso». «radar meteo <regione>» ci vedeva al 9°-21° posto e chi sta sopra
   comincia cosi'. ⚠️ «pioggia in diretta <regione>» e' quasi sempre il NOME di un altro sito (Pioggia Diretta,
   pioggiadiretta.blogspot.com, primo): li' siamo terzi e i pochi clic non sono colpa del titolo.
3. **Pagine meteo** (`genera-pagine-meteo-zona.js`, `genera-pagine-meteo-paese.js`): titoli «Meteo Casentino:
   previsioni a 7 giorni, paese per paese» (erano fino a 102 caratteri, 52 su 71 oltre i 60), og:title uguale al titolo
   (per «meteo casentino» Google costruiva il titolo da lui), scritta grande «Meteo <zona>: previsioni a 7 giorni»,
   descrizioni sotto i 155. Dopo «Il punto di stamattina» uno spazio: e' un blocco e non si vede, ma senza Google
   leggeva «stamattinaIeri nel Casentino».
4. **Mappa** (`index.html`, solo `<title>`): «Mappa Pluviometrica Italia: piogge e precipitazioni misurate». Gli Stati
   restano in descrizione, og:title e scritta grande. «mappa precipitazioni», «mappa piogge», «precipitazioni» ci vedevano
   al 7°-9° posto con zero clic.
5. **Mappa forestale, pagine regione** (`genera-mappa-forestale.js`): «Carta forestale della Toscana: mappa dei boschi,
   tipo per tipo» («carta forestale <regione>» 112 viste in posizione 8).
6. **Guida**: titoletto «Quanti giorni dopo la pioggia nascono i funghi?» (`#quanti-giorni`) nel capitolo del tasto
   Piogge per funghi. In `/funghi/` la domanda c'era gia'.
7. **Le pagine meteo non sono piu' un vicolo cieco** (proposta 1 del cloud, suo «sì, le pagine meteo», stesso giorno,
   dopo la pubblicazione delle sei). Prima le 71 pagine meteo non linkavano nessun'altra pagina meteo e ne ricevevano
   2-3 link a testa. Ora il blocco delle «adesso», `linkMeteoRegione` (pillole «Meteo <nome> →», «valle per valle» e
   «paese per paese» della stessa regione), sta anche: in fondo alle pagine meteo di zona e di paese sotto
   «Previsioni meteo in <regione>» (`altreMeteo`, senza la pagina stessa: parametro `salta`; niente blocco e niente stile
   dove la regione non ne ha altre: Carnia, Monti Sibillini, Nebrodi, Valtiberina) e dentro «Che tempo farà» delle
   regioni piogge e funghi (5° argomento di `meteoHtml`; `require` di `genera-pagine-meteo-zona.js` DENTRO la funzione,
   perche' quel file chiede `genera-pagine-regione.js`). Stile `MV_CSS`, le stesse regole delle «adesso». 868 link in
   piu', zero rotti. Pagine rigenerate per intero (non hanno ritratti): 13 regioni, 13 funghi regione, 67 meteo; nelle
   meteo entra anche la riga `.avviso-stime` dello stile della regione (della 103, innocua). La Slovenia, che
   rigenerandola prendeva le righe della 103 rimaste indietro sul suo guscio, e' stata lasciata com'era.
8. **Terzo giro, stesso giorno (suo «cominciamo col tuo ordine, ma dobbiamo fare tutto entro sera»)**, le altre
   proposte del cloud:
   - **Nomi dei paesi nelle pagine meteo**: sottotitolo «… a Bibbiena, Castel Focognano, Chiusi della Verna e negli
     altri 9 paesi della valle» (`aiPaesi`) e tabella «Paese per paese» che nasce coi nomi e le quote (`tabellaFissa`,
     righe senza `data-n`: prima delle previsioni non si aprono; `disegnaTab` la riscrive). Paesi meteo: i paesi intorno
     nel sottotitolo.
   - **Percorso su regioni, «adesso» e /funghi/** (le sole 45 pagine senza): `briciolaHtml` + `briciolaJson`, stile
     `BRIC_CSS` (in `genera-pagine-regione.js`, dopo lo stile del meteo, cosi' le pagine meteo che lo tagliano non lo
     prendono). «Mappa pluviometrica › Toscana › Radar adesso»; l'Abruzzo, senza pagina regione, «› Radar meteo Abruzzo».
   - **90 nomi tecnici nei titoli dei paesi** («Dossena ST1», «Rio Rudan INADEF DX briglia»): `nomi-titolo.json`
     (<regione>/<slug> → nome), letto da `genera-pagine-localita.js` come `NOME_T` per titolo, scritta grande,
     descrizione, frasi e briciola; il nome della stazione resta nel ritratto e nelle tabelle. Davanti il posto dove sta
     DAVVERO il pluviometro (suo, su Carpe: il comune Toirano e' a 38 m, il pluviometro a 445), il comune fra parentesi
     se aiuta. `aPosto`: «Val …» prende «in»; nelle frasi «intorno» diventa «intorno alla Val …» (`INTORNO`). Cambiate
     col trapianto delle righe (93 pagine, 1.014 righe), senza toccare i ritratti.
   - **Le 114 zone piogge nascono coi numeri** (`riepilogoZona`, `verdettoCotto`, `descrCotta`, schede 7/30 e tabella
     cotte, ordinate come le ordina il browser), se il riepilogo della zona e' fresco (<36 ore) e la regione sta in
     `COTTE` (ora esportata). Il browser poi le riscrive coi dati del momento e aggiunge i bottoni. Le rifa' il giro del
     mattino: passo «Rigenera le zone piogge cotte» in `pagine-regione.yml`, dopo le regioni (commit e pubblicazione
     c'erano gia': `*/index.html` comprende `zone/`). `data/paesi-zone.json` a dati uguali esce identico. Sitemap:
     `data-giorno` del riquadro di ieri come data, `daily`.
   - Lasciate: «(v11.0)» nell'h1 della mappa (lo prende la 104, che rifa' la testata), titolo di `/emilia/` (regioni in
     misura fino al 9-16/11), anteprima social uguale per tutti, Valle Sabbia senza pagina forestale.
   - In nota per ~1/12 (suo): togliere le pagine paese con zero clic o clic ridicoli, a stagione finita.
- ⚠️ **Come sono state cambiate le 1.135 pagine, e perche' non si sono rigenerate.** Rigenerarle per intero avrebbe
  rinfrescato anche il ritratto del pluviometro (1.785 righe nei paesi: si rifa' col giro di marzo, giugno, settembre e
  dicembre) e aggiunto una riga di stile alle «adesso» e alle meteo. Si sono lanciati i generatori vecchi e nuovi in una
  copia pulita (`git archive`) e nelle pagine vere si sono sostituite SOLO le righe che cambiano fra le due uscite
  (titolo, descrizione, og, scritta grande, riga breve, «punto di stamattina»), controllando che ogni riga vecchia ci
  fosse una volta sola: 4.708 righe, zero intoppi. Dopo, pagine vere = generatore nuovo su quelle righe.
- **Date delle sitemap spostate al 31/10** (le aveva trovate indietro anche il cloud): in `pagine-lastmod.json`
  funghi, localita, zone, zonePiogge, adesso, meteo, meteoPaesi; in `genera-sitemap.js` `/` (era ferma al 14/8),
  `/guida/` e le 21 regioni della mappa forestale (`FORESTALE_REGIONI_LASTMOD`; i tre tipi e le zone restano al 20/10).
  Sitemap riscritte con `scriviSitemap(SITO, RADICE)`: cambiano solo le righe `<lastmod>`.
- **Da NON toccare, sono in misura**: «pluviometria toscana» (scritta grande del 26/10, misura 9-16/11), «Meteo
  funghi» delle pagine funghi regione (dal 31/10, si misura dal ~7/11), il quiz tartufi (parole del 30/10, misura
  13-14/11). Le nuove di oggi si misurano dalla pubblicazione in poi, con la stessa regola delle finestre.
- Prove: lunghezze e doppioni su tutte le pagine toccate (titoli 39-62, descrizioni sotto i 158, un solo h1, zero
  titoli doppi); 14 pagine × computer e telefono 393 sul server locale, 28/28 senza errori e senza scritte fuori schermo
  (in locale col solo `http.server` le previsioni non rispondono: si ignorano solo quelle richieste).

---

## Correzioni del 1/11/2026 (scheda 105 bis, dopo l'analisi delle famiglie di pagine)

L'analisi completa sta in `analisi-famiglie-pagine-2026-11-01.md`, nella radice. Corretti lo stesso giorno, su sua
richiesta («la pagina slovenia la togliamo, quando mancano dati come in puglia mettiamo stime e le dichiariamo»,
«sistema anche carnia e abruzzo»):

- **La pagina `/slovenia/` e' tolta.** ARSO pubblica con ~34 ore di ritardo: la pagina prometteva «ieri» senza
  averlo mai, non era fra le COTTE e diceva «oltre 110 pluviometri» col riquadro a 109. Fatto togliendo la voce da
  `REGIONI` in `genera-pagine-regione.js`: spariscono da soli la pagina, la voce di `sitemap-mappa.xml`, il riepilogo e
  i link della mappa del sito (guida, fonti) e delle pagine funghi. `data/riepiloghi/slovenia.json` cancellato: il
  guardiano guarda il piu' vecchio dei riepiloghi, e uno non piu' aggiornato gli avrebbe fatto rilanciare i riepiloghi
  ogni giorno. Tolta anche dagli scatti di `genera-anteprime.js`. Rimando in `_redirects`: `/slovenia/` → `/?r=slovenia`
  (301). ⚠️ La Slovenia RESTA sulla mappa, nei collector, in `check-fonti.js` e nel guardiano: si toglie solo la pagina.
- **Le stime si dichiarano nelle pagine funghi.** Fino a oggi `genera-funghi.js` leggeva i file con `leggi()` senza
  guardare la provenienza, e i giorni stimati (gapfill Open-Meteo, stazioni `om`) finivano nei totali sotto la scritta
  «misurati a terra» (Puglia 26-30/10, Bosco Umbra 38,5 mm in 7 giorni di cui 15,5 stimati). Le stime restano nei
  totali (sua scelta), ma ora `leggiS()` le segna e il file `<regione>-giorni.json` ha `stime`: {id: [indici della
  serie, 0 = ieri]}, solo per chi ne ha (le regioni senza stime non cambiano file). `italia.json` ha un sesto elemento
  `1` nelle righe con giorni stimati nella finestra 13-20. Nelle pagine: `avvisoStime()` (`JS_STIME` di
  `lib-pagina-funghi.js`) mette in cima al verdetto il riquadro giallo con le parole delle pagine piogge («Dal 26 al 30
  ottobre questo pluviometro non ha trasmesso: quei giorni sono stime Open-Meteo, non misure»), sui paesi, sulle zone
  (con «2 pluviometri su 14» quando non sono tutti, date allineate come la serie) e sulle regioni funghi; l'indice
  `/funghi/` mette l'asterisco ai posti e una riga sotto la finestra. ⚠️ Il ripiego delle regioni funghi (`daiFile`,
  quando `<regione>.json` e' vecchio) non lo dice: e' raro, e l'avviso in cima viene comunque dal file dei giorni.
  Le 1.022 pagine di paese e di zona NON sono state rigenerate: trapiantate solo le righe che cambiano fra generatore
  vecchio e nuovo, come il 31/10, per non rinfrescare i ritratti. Prove: Puglia, Sardegna (15/10) e Sicilia (7/10)
  vere, zona e indice con stime finte iniettate nel browser, telefono 393 e PC 1366; 6.668 script compilati.
- **Mappa forestale, Carnia.** `mappa-forestale-dati.json` era del 25/10 e la Carnia e' stata rifatta il 30/10: la
  pagina descriveva le Prealpi pordenonesi (Tramonti Invaso). Ricalcolata QUI la sola Carnia coi 7 pluviometri nuovi
  (gia' presenti in `paesi` col loro bosco): bosco = media, tipi = media pesata sul bosco. E' un'approssimazione del
  metodo del banco (unione dei cerchi), che sulle zone senza sovrapposizioni torna al decimo e sulle altre sbaglia di
  qualche punto. Bosco da 80 a 69%, abetaie e peccete da 1 a 29%, pinete da 38,5 a 15,4%. `generato` resta 25/10: al
  prossimo giro del banco la Carnia si ricalcola col metodo vero.
- **Mappa forestale, Abruzzo.** Il modello scriveva per tutte «i pluviometri della regione, con la pioggia vera giorno
  per giorno»; per le regioni senza pagina piogge (`HA_PIOGGE`, cioe' l'Abruzzo) ora dice «la pioggia dell'Abruzzo
  giorno per giorno (qui sono stime di modello, non misure di pluviometri)».

### Secondo giro dello stesso giorno: i punti medi dell'analisi (suo «fai i medi»)

- **Un solo numero di pluviometri per pagina regione** (`reteDi` in `genera-pagine-regione.js`): titolo, descrizione e
  sottotitolo («oltre N», `stazDi`, anche nelle «adesso» e nelle regioni funghi) usano la rete, il piu' alto fra i periodi
  del riepilogo. La Basilicata diceva 50, «oltre 45» e 62; ora 62 e «oltre 60». L'indice forestale scrive
  `D.gruppi.length` tipi di bosco (12) invece di un 11 scritto a mano.
- **Le zone non contano i pluviometri esclusi dalla mappa**: zone piogge (via dalla tabella e dal conto, la media li
  toglieva gia') e zone funghi (`nAttivi`; in tabella restano col trattino come dal 17/10); anche la frase «con i suoi N
  pluviometri» delle pagine paese. Riviera di Levante 3 → 2, Calvana 16 → 13.
- **Quattro zone corrette in `funghi-zone.json`**: Valle Sessera senza i tre posti novaresi (Armeno, Monte Mesma,
  Paruzzaro) e Cellio (Valsesia), con Valdilana, Camparient e Bielmonte, centro spostato a 45,69 8,16; Valtiberina senza
  i quattro posti marchigiani del versante adriatico (Biscubio, Monte Nerone, Pianello di Cagli, Serravalle di Carda);
  Calvana senza le dighe bolognesi di Pavana e Suviana; Val d'Aveto con Santo Stefano d'Aveto e Amborzasco. Rifatti i
  riepiloghi, le pagine di zona (piogge, funghi, meteo) e, in `mappa-forestale-dati.json`, posti, bosco e tipi di quelle
  quattro zone con la stessa media della Carnia (le foto restano valide: i loro paesi sono ancora dentro).
- **Nomi**: `bello()` (lib-nomi.js) trasforma l'apostrofo finale dopo una vocale nell'accento grave (Malè, Mondovì,
  Fiè, Nicolò, Viù, Prà, Cesarò...), tranne «Ca'»; gli indirizzi non cambiano (verificato su 908). Quindici nomi in
  piu' in `nomi-titolo.json` (Branzi, Idro, Verceia, Porto Ceresio, Lavena Ponte Tresa, Omegna, Ponte di Nava, Fucine
  (Viù), Fusino (Grosio), Lago della Piastra (Entracque), Lago del Brugneto, Lago di Ca' Zul, Lago di Ca' Selva, Lago di
  Tramonti, Tolmezzo). ⚠️ «San Michele (CI)» NON e' toccato: le province sarde sono state rifatte e la sigla va
  verificata prima.
- **Ritratti**: `lib-clima.js` conta come «intero» solo un mese FINITO; `rinnova-pagine.yml` gira il 2 di ogni mese
  (`20 11 2 * *`): i crediti Netlify, che imponevano il trimestre, non ci sono piu'.
- **Verdetto delle pagine paese**: sopra la soglia del 60% i giorni senza dato contano zero, e ora il riquadro lo dice
  («Questo pluviometro non ha mandato dati per N giorni su M: il totale può essere più basso del vero»).
- **La mappa forestale non e' piu' un'isola**: sotto «Che boschi ci sono» le regioni funghi linkano la carta forestale
  della regione, le zone funghi quella della zona (o della regione se la zona non ha la sua, Valle Sabbia), i 908 paesi
  quella della loro zona o della regione. ⚠️ Nel generatore dei paesi `GEN` e' il genitivo della regione (stringa,
  `GENITIVO[REG]`), non la tabella di genera-pagine-regione.js: importarla col suo nome non serve, viene coperta.
- **Le date della sitemap si calcolano da sole** per la mappa, `/previsioni/`, la guida, le fonti e le 138 pagine
  forestali: `pagine-impronte.json` tiene un'impronta del file per pagina, e la data diventa oggi quando l'impronta
  cambia (`dataDi` in genera-sitemap.js). Il file va committato con le sitemap: pagine-regione.yml e rinnova-pagine.yml
  lo aggiungono. Le altre famiglie restano su `pagine-lastmod.json` (funghi, localita, zone e indice spostati al 1/11).
- **Pagine meteo**: ogni paese di `data/paesi-zone.json` e di `data/paesi-localita/` porta la quota `q` dall'archivio
  `quote-paesi.json` (riempito il 1/11 con 536 quote nuove dalle tessere terrarium): tabella e scheda chiedono a MET la
  stessa quota. La Riviera di Levante ha i paesi della costa (`PAESI_IN_PIU` in genera-pagine-zona-piogge.js: Recco,
  Camogli, Rapallo, Santa Margherita, Zoagli, Chiavari, Lavagna, Sestri Levante) prima di quelli della Fontanabuona.
- **Terzo giro, la sera (suo «per i doppioni procedi come hai detto, per il punto 10 approfondisci»)**: tolte le pagine
  meteo di Candalla e Val Serina (sopra, nella sezione delle pagine meteo).
- ⚠️ **PERCHE' IL SUD HA POCHI POSTI FUNGHI (punto 10, misurato il 1/11/2026, niente ancora cambiato)**: i posti si
  scelgono con quota 200-1.600 m e **almeno il 37% di bosco entro 3 km su OPENSTREETMAP** (il settimo campo di
  `funghi-posti.json`, lo stesso numero che la pagina paese scrive «di bosco entro 3 km»), e OpenStreetMap al sud
  disegna pochi boschi. Le carte forestali ufficiali (le nostre tessere) danno sugli stessi 908 posti in media 17 punti
  in piu'. Il bosco della mappa forestale (`mappa-forestale-dati.json`, `paesi`) e' un cerchio di 3 km sulle tessere
  z13, e si rifa' anche senza il banco leggendo le tessere da raw.githubusercontent.com (repo Tessere, cartella
  `boschi/13/`): ritrovato al decimo. Con le carte forestali e soglia 50% entrerebbero 280 posti nuovi in tutta Italia, al sud
  Sicilia 41, Calabria 24, Campania 18, Sardegna 9, Basilicata 3, Puglia 2, piu' 10 nel Molise, che oggi la pagina funghi non ce
  l'ha. La Puglia resta sottile con qualunque regola (al massimo 5). Le strade e i numeri sono nel resoconto
  `analisi-famiglie-pagine-2026-11-01.md`, «Terzo aggiornamento».
- ⚠️ **FATTO LA STESSA SERA, STRADA 1 (suo: «facciamo la 1, poi valuteremo se ampliarla al nord»)**: 102 posti funghi
  nuovi, solo al sud, coi criteri: quota 200-1.600 m, almeno il 50% di bosco entro 3 km sulle carte forestali (le nostre
  tessere, stesso calcolo della mappa forestale), almeno 24 giorni di dato vero sugli ultimi 30, non esclusi dalla mappa
  ne' fermi, e niente doppioni sotto i 2-3 km (fuori Agerola, Ravello, Scala, Vandra a Fornelli). Sicilia +41, Calabria
  +24, Campania +14, Sardegna +9, Basilicata +3, Puglia +2, e il **Molise con 9: pagina funghi nuova** (`LOCALITA` in
  lib-nomi.js, i due `GENITIVO`, la riga in index.html, la frase dell'indice). Nessun posto di oggi tolto. Pagine paese:
  da 908 a 1.010.
  - **Accodati in fondo all'elenco di ogni regione**, in ordine di nome: `slugRegione` assegna i nomi in ordine, e cosi'
    nessun indirizzo di prima cambia. Il nome resta quello della rete (`p[1]`); i titoli in `nomi-titolo.json` (32
    nuovi: «Antillo SIAS» -> «Antillo», «Messina SP50Bis» -> «Monti Peloritani»). Le due «Montalbano Elicona»: quella a
    1.231 m e' «Montalbano Elicona - Portella dello Zoppo». `aPosto` conosce «Monti» (sui/ai Monti).
  - **Il settimo campo di `funghi-posti.json` ora e' il bosco delle CARTE FORESTALI su tutti i 1.010 posti** (lo stesso di
    `mappa-forestale-dati.json`): prima la pagina scriveva il numero di OpenStreetMap e, sotto, la carta forestale ne
    diceva un altro (Ligonchio 37% e 87%). I valori di OpenStreetMap restano nella storia di git. Il testo della regola,
    in regioni, zone, indice, paesi e guida: «almeno il 37% entro 3 km sulle mappe di OpenStreetMap, o il 50% sulle carte
    forestali delle regioni».
  - Bosco e tipi dei posti nuovi aggiunti a `mappa-forestale-dati.json` (`paesi`), calcolati qui dalle tessere lette da
    raw.githubusercontent.com (cartella `boschi/13/` del repo Tessere, cerchio di 3 km). Il generatore forestale ora scrive
    i nomi con `bello()` (Forlì, non «Forli'»).
  - Le pagine paese di prima sono state aggiornate col trapianto delle righe (bosco, regola, vicini), non rigenerate: i
    ritratti restano. ⚠️ La frase della classifica nel ritratto («Su 17 pluviometri da bosco della Calabria...») resta coi
    numeri vecchi su 56 pagine del sud: la rinfresca il rinnovo del 2/12.
  - **Restano da fare**: i posti nuovi non sono nelle ZONE (`funghi-zone.json` elenca i posti a mano: Nebrodi, Sila,
    Cilento ne avrebbero di nuovi); manca l'anteprima boschi del Molise (`tessere-boschi/anteprime/molise-mappa.webp`,
    si fa dal PC con `BOSCHI=1 ... genera-anteprime.js molise`: senza, il riquadro «Guarda i boschi» resta blu con la
    scritta). La pulizia di dicembre non deve giudicare queste pagine: hanno un mese di vita.
- **Punto 12, San Michele e Punta Sebera: «CI» -> «SU».** La provincia di Carbonia-Iglesias non c'e' dal 2016; i suoi
  comuni sono nella provincia del Sulcis Iglesiente, attiva dal 2025, che ha preso la sigla SU (l'ha lasciata il Sud
  Sardegna). Sigle sarde di oggi: CA, SS, NU, OR, OT (Gallura), OG (Ogliastra), VS (Medio Campidano), SU. ⚠️
  `data/elenco-paesi.txt` ha ancora le sigle sarde del 2016-2024 (SU = Sud Sardegna): la ricerca scrive «Teulada (SU)»
  anche per i comuni passati a Cagliari o al Medio Campidano. Da rifare quando ISTAT pubblica i confini nuovi.
- **I punti piccoli dell'analisi, fatti la stessa sera** (suo «per me va bene»; il 7, l'H1 di `/previsioni/`, aspetta
  la testata della scheda 104):
  - descrizioni delle regioni: «meno di 0,1 mm» al posto di «0,0», niente doppio punto senza numeri, i giorni stimati
    dei 7 giorni detti e senza il massimo della settimana (`descrMappa`, `descrCotta`);
  - «zona per zona» nelle «adesso» solo se la regione ha zone (`HA_ZONE` in genera-pagine-adesso.js);
  - «e un'altra città» / «e altre due città» nella riga viva (lib/pagina-adesso.js, `VERSIONE_JS` 9);
  - «il più asciutto X con 370 mm» nel ritratto delle zone funghi (107 pagine);
  - piede delle regioni piogge: «Le regioni vicine» (`VICINE`, solo regioni con pagina) e «le pagine funghi, regione
    per regione» al posto di «il riepilogo delle regioni» (anche nella mappa);
  - `og:description` = la descrizione della pagina (era uguale su 1.145 pagine) e `twitter:card` summary_large_image
    su tutte;
  - un solo stile di percorso, «Mappa pluviometrica › …» (classe `bric`, stile in linea) anche su pagine funghi e mappa
    forestale, e la radice nel BreadcrumbList;
  - guida: le pagine meteo e «adesso» nell'elenco delle pagine; l'alt della foto dei boschi senza «dieci gruppi»;
  - riga di stagione senza «i millimetri sono veri» (lib-stagione.js), che stava sopra l'avviso delle stime;
  - il ripiego delle regioni funghi (`daiFile`) dice anch'esso i giorni stimati, senza doppioni d'avviso;
  - «l'1 novembre» nella descrizione delle zone piogge;
  - «Iscriviti» della testata con `?sub_confirmation=1` (lib-testata.js), su tutte le pagine.
- **Quarto giro, la notte (suo: «vai con la Sicilia a 22, sfoltisci Calabria e Campania, poi la 2, la 3, la 4, la 6»):**
  - ⚠️ **I posti nuovi sono 77, non piu' 102** (pagine paese 985). Tolti 25: in **Sicilia** da 41 a 22, fuori quelli con
    meno di meta' del bosco di tipi da funghi (faggete, castagneti, querceti, cerrete, pinete, abetaie, lariceti, conifere)
    perche' intorno c'era soprattutto «altri boschi», quelli sotto i 400 m e uno per coppia sotto i 4 km (33 su 41 erano
    in provincia di Messina, dove la rete e' fittissima); in **Calabria** Rogliano, Tiriolo, Petilia Policastro e
    Villaggio del Pino, in **Campania** Montella e Tramonti, tutti a meno di 4 km da un altro posto. Sono state online al
    massimo poche ore: per sicurezza `_redirects` le rimanda (301) alla pagina funghi della loro regione. ⚠️ **La regola per i prossimi posti**:
    bosco >= 50% sulle carte forestali, tipi da funghi >= 50% del bosco, quota >= 400 m al sud, niente doppioni sotto i
    4 km. Se si allarga al nord, si parte da qui.
  - **Nove posti nuovi nelle zone** (`funghi-zone.json`), solo dove stanno davvero: Cilento (Gioi, Ceraso-Isca), Monti
    Lattari (Sambuco di Ravello, Chiunzi), Serre calabresi (San Nicola da Crissa), Nebrodi (Ambola, San Fratello
    Forestale), Valle del Fitalia (Galati Mamertino, Mastrostefano). Rifatte le pagine di quelle cinque zone (funghi per
    intero, piogge, meteo, forestali con la media della Carnia) e i riepiloghi. ⚠️ **La zona «Sila Greca» in realta' era
    la Sila Grande** (Monte Curcio, Camigliatello, Spineto): Longobucco, che e' Sila Greca vera, sta a 21 km dai suoi
    pluviometri e non e' entrato. **Rinominata «Sila Grande» la stessa notte** (suo): `funghi-zone.json` («nella Sila
    Grande»), `mappa-forestale-dati.json`, `ZONE_METEO_B` (`sila-grande`), la riga della zona in `elenco-paesi.txt`, la
    foto `mappa-forestale/zone/sila-grande/scorcio.jpg`; le quattro pagine cambiano indirizzo (zone, funghi/zone, meteo,
    mappa-forestale/zone) e i vecchi `sila-greca` rimandano con un 301. ⚠️ Nella misura del gruppo B delle meteo, in Search
    Console la pagina compare con l'indirizzo nuovo dal 2/11.
  - **Sigle sarde 2025 nell'elenco dei paesi** (`data/elenco-paesi.txt`): CA 70, SS 66, NU 53, OR 87, OT 26 (Gallura),
    OG 23 (Ogliastra), VS 28 (Medio Campidano), SU 24 (Sulcis Iglesiente). Le appartenenze vengono da un elenco ISTAT 2025
    trovato su GitHub (alessandroamormino/fuorirotta, `data/elenco-comuni-istat.csv`), che pero' da' «CI» al Sulcis: la
    sigla giusta e' SU (decreto in vigore dal 28/10/2026, Conferenza Stato-Citta'). In `data/capoluoghi.json` Olbia e
    Tempio hanno la sigla OT. Effetto in mappa: `veCapoluoghi` sceglie il capoluogo per sigla, quindi in Sardegna
    compaiono anche Olbia, Tortoli' e Villacidro (Carbonia c'era gia').
  - **La scritta grande di `/previsioni/`** (il 7 dei piccoli): nelle previsioni lo span dei paesi dell'H1 dice
    « · Previsioni meteo» (`data-prev`), uscendo torna l'elenco (`data-storico`, `titoloSezione()` in `entra`/`esci` del
    modulo previsioni); la Function `functions/previsioni/index.js` lo riscrive gia' nell'HTML (`Sezione`), cosi' Google
    legge «Mappa Pluviometrica · Previsioni meteo». Provato con wrangler e nel browser. ⚠️ Se la scheda 104 rifa' la
    testata della mappa, tenga `data-prev`/`data-storico` (o sposti la riga della Function sul titolo nuovo).
  - **La foto dei boschi del Molise NON si e' potuta fare qui**: lo scatto contiene la cartina di OpenStreetMap, e dal
    cloud le sue tessere non rispondono. Va fatta dal PC.

### ⚠️ DA FARE SENZA URGENZA (la memoria, aggiornata la sera del 1/11/2026; si riparte dalla scheda 105)
Fatti il 1/11 e tolti dall'elenco: foto dei boschi del Molise, percorso in cima a `fonti.html`, cartina grande nelle
pagine piogge e nelle pagine funghi (vedi la nota della striscia, sezione «Zone piogge e zone funghi anche meteo»).
1. **Posti funghi al nord con le carte forestali** (circa 170 posti): da riprendere a fine estate 2027, con la regola dei
   posti scritta sopra (bosco >= 50% sulle carte, tipi da funghi >= 50%, niente doppioni sotto i 4 km) e i numeri di
   Search Console. Suo: «la stagione e' quasi conclusa, non vale la pena, preferisco indicizzare le meteo».
2. **Promemoria di dicembre, senza lavoro**: il rinnovo del 2/12 (`rinnova-pagine.yml`) aggiorna da solo la frase della
   classifica nel ritratto di ~56 pagine del sud; la pulizia delle pagine paese senza clic (~1/12) NON deve giudicare le
   77 pagine nuove del sud (hanno un mese di vita).
3. **Una zona «Sila Greca» vera** (Longobucco, Acri, Bocchigliero), se un giorno ci saranno abbastanza posti funghi li'.
4. **Il codice comune delle pagine in file a parte**: le pagine passerebbero da ~113 a ~15 KB. Lavoro medio-grande.
5. **Il verdetto delle pagine funghi scritto nell'HTML ogni mattina**, come gia' le zone piogge. Lavoro medio.
- **Come far vedere un'anteprima dal cloud** (il cloud non ha il token di Cloudflare e non apre il sito): sul ramo di
  lavoro un workflow che parte al push e pubblica con `pubblica-pages.js <repo> avventurepluvio --ramo=riquadro`, cioe' su
  `https://riquadro.avventurepluvio.pages.dev` e non sul sito vero (`anteprima-riquadro.yml`, sul solo ramo
  `claude/hopeful-volta-4m7kfp`: NON va portato su main). Per uno scatto che dal cloud non si fa (cartina OSM), stesso
  trucco: un giro sul ramo che scatta e salva sul ramo stesso, poi si portano i file su main.

