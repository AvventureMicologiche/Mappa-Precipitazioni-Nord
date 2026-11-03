# CLAUDE-sorveglianza.md: la sorveglianza automatica e i check

Pezzo del `CLAUDE.md` del repo, diviso per argomento il 1/11/2026 (scheda 107, sua scelta). **Prima si legge il
`CLAUDE.md`**: le regole che valgono sempre e l'indice di tutti i file. Qui sotto le sezioni sono quelle di prima,
tali e quali e nello stesso ordine: quando una nota dice «più su», «qui sotto» o «in fondo al CLAUDE.md», la sezione
può stare in un altro file, e il titolo si trova nell'indice del `CLAUDE.md`.

Per arrivare a una sezione: `grep -n "^## \|^### " CLAUDE-sorveglianza.md`, poi si legge da quella riga.
**Le note nuove di questo argomento vanno IN FONDO a questo file**, con una riga nell'indice del `CLAUDE.md`.

Sezioni:

- Resilienza a GitHub raw (17 agosto 2026)
- Sorveglianza automatica (31 luglio 2026)
  - 1. Rete di sicurezza sui buchi — `check-gaps-nord.js` + `gaps-nord.yml` (09:10 UTC)
  - 2. Allarme fonti via mail — `check-fonti.js` + `alert-fonti.yml` (09:43 UTC)
  - 3. Pluviometri fermi — `check-stazioni-ferme.js`, dentro `alert-fonti.yml` (dal 21 agosto 2026)
  - 4. Guardiano dei collector in ritardo — `guardiano-collector.js` + `guardiano.yml` (dal 28 agosto 2026)
  - 5. I campi che spariscono — `check-campi.js`, dentro `alert-fonti.yml` (dal 12 ottobre 2026)
- Check periodico dati
- Sesto check (20/10/2026)
- «Da guardare» del settimo e ottavo check (21/10/2026)

---

## Resilienza a GitHub raw (17 agosto 2026)

**Cosa e' successo.** Incidente GitHub dalle ~14:00 alle ~18:15 UTC: `raw.githubusercontent.com` rispondeva
429/503 a tutti (verificato da PC, rete cellulare e un'altra rete; githubstatus «raw repository content
downloads ~50% error rate»). Il sito prendeva da raw TUTTI i file giornalieri e i **confini delle regioni
italiane** (openpolis): senza confine le regioni italiane non si disegnavano (barriera confini in `renderMulti`),
le estere reggevano solo per cache del browser e perche' i loro GeoJSON stanno nel repo. All'utente arrivava
«⚠️ Caricamento timeout» dopo 30 s, che sembra colpa del telefono. Prod e test erano intatti.

**Tre rimedi, un deploy (commit `fdaf7461` prod, `ec74efb6`+`400827e6` test), tutti AUTOMATICI — decisione utente: nessun cartello manuale.**
1. **Confini italiani nel repo**: `italia-regioni-confine.geojson` (copia di openpolis `limits_IT_regions`,
   2,75 MB) e `italia-province-tn-bz-confine.geojson` (solo Trento e Bolzano, 170 KB); `GEOJSON_URL` e
   `GEOJSON_PROVINCE_URL` puntano li' (i campi `geojson:` per regione sono decorativi, il loader usa le
   costanti). Erano l'unico pezzo vitale del sito preso da un repo altrui. openpolis resta citato in `fonti.html`.
2. **Riserva dati** (shim su `window.fetch`, sopra `HIST_RAW`): per gli URL `raw.githubusercontent.com/AvventureMicologiche/<repo>/main/data/...`,
   se raw risponde 429/5xx/rete o non risponde entro **6 s** (`TETTO_RAW_MS`), lo stesso percorso si riprova sulla
   **copia del sito** (`_RISERVA_DATI`: prod → `precipitazioni.avventuremicologiche.it/data/`, test → `avventurepluvio-test.netlify.app/data/`),
   che Netlify pubblica a ogni deploy — quindi copre lo storico **fino all'ultimo deploy**, i giorni dopo danno 404.
   Dopo **3 fallimenti** nello stesso caricamento (`INTERRUTTORE`) si va dritti alla riserva; i contatori
   (`_archivio`) si azzerano a ogni `loadData`, cosi' appena GitHub torna ci si torna da soli. Il **404 di raw passa
   com'e'** (un giorno mancante e' normale). ⚠️ **jsdelivr provato e SCARTATO**: per i file che non ha in cache va a
   chiederli a GitHub, con GitHub giu' risponde 404 dopo 20-45 s. ⚠️ Raw in errore e' LENTO (4-31 s a rispondere):
   senza il tetto la riserva arrivava dopo il timeout di sicurezza (34 s → 9,7 s col tetto).
   `netlify.toml`: `Access-Control-Allow-Origin: *` su `/data/*`, perche' il test legge la riserva di prod da un altro dominio.
3. **Avviso automatico** (`notaArchivio()`, elemento `#archivio-notice` sotto `#ieri-notice`): analisi riuscita con
   riserva → «Archivio dati (GitHub) non raggiungibile: dati dalla copia del sito, gli ultimi giorni possono mancare»;
   riuscita con raw a singhiozzo senza riserva utile → «instabile, alcuni giorni possono mancare»; finita a vuoto o
   timeout → «non raggiungibile in questo momento: non dipende da te, riprova tra qualche minuto» al posto di
   «Nessun dato»/«Caricamento timeout». Ha la precedenza su «dati di ieri non pervenuti» in `aggiornaAvvisoIeri`.

**Richiesta di scorta e avviso silenzioso (18/8/2026).** Misurato dal browser su prod (3 regioni × 30 gg, ~120 file in
raffica, tre prove): **ogni volta 2-3 file prendono un 429 VERO** da raw (limite per IP sulle raffiche; il 429 arriva dopo
4-20 s) e 1-3 superano i 6 s; tutti gli altri in 50-500 ms. Siccome l'analisi finisce all'ultimo file, quel 2% costava
**6,3 s a ogni analisi invece di ~1,5**, e l'avviso «dati dalla copia del sito» compariva sempre a GitHub sano. Non era il
peso dei campi `u` (+1,5-3,4 KB a file, +8%). ⚠️ Prima del 17/8 il 429 c'era uguale e il giorno veniva BUTTATO in silenzio
(`!r.ok → catch`): la riserva l'ha reso visibile. Rimedi nello shim: (1) **scorta** — se raw non risponde entro
`SCORTA_MS` (1,5 s) parte in parallelo la stessa richiesta alla copia e vince chi arriva prima → fase di scarico
6,3 s → **2,0 s**, visto dal sito max 1,8 s; (2) i **giorni freschi** (`GIORNI_FRESCHI`=2) non hanno scorta né interruttore:
la copia si aggiorna solo ai deploy e per loro vale solo se raw fallisce davvero (prima, con l'interruttore scattato, i
file di IERI andavano dritti alla copia vecchia); (3) `INTERRUTTORE` 3 → **8** e conta solo errori veri (`_archivio.errori`:
429/5xx/rete), non i timeout; (4) `notaArchivio()` parla **solo se `riservaKo>0`** o analisi a vuoto: se la copia ha
coperto tutto la mappa è completa e resta una riga `console.info('[archivio] …')`. Collaudo rifatto nei 4 modi
(ok/simula/nulla/reale) più la misura live: zero avvisi, giorni freschi sempre da raw.

**Collaudo** (`collaudo-riserva.js` nello scratchpad della sessione, puppeteer): tre modi — GitHub giu' per davvero,
`simula` (raw→429), `ok` (raw emulato sano: ⚠️ le risposte emulate DEVONO avere `Access-Control-Allow-Origin`, se
no il browser le scarta e sembra che la riserva scatti a torto), `nulla` (raw giu' + riserva 404). Con GitHub sano:
zero chiamate alla riserva, nessun avviso, «ieri non incluso» della Slovenia invariato.
⚠️ Il sito vive tutto dentro una funzione: le sue variabili NON sono globali, `page.evaluate` non le vede — si
legge il DOM (`#tp-status`, `#archivio-notice`, path dell'overlay-pane).

**Come si diagnostica la prossima volta**: `curl -s -o /dev/null -w '%{http_code}' https://raw.githubusercontent.com/AvventureMicologiche/Mappa-Precipitazioni-Nord/main/data/piemonte/<ieri>.json`
+ `https://www.githubstatus.com/api/v2/summary.json`; nel browser `performance.getEntriesByType('resource')` filtrato su `responseStatus>=400`.

---

## Sorveglianza automatica (31 luglio 2026)
Due pezzi complementari, nati lo stesso giorno e da leggere insieme: il primo **ripara**, il secondo **avvisa**. Il secondo esiste proprio perché il primo, riparando, nasconde il guasto.

### 1. Rete di sicurezza sui buchi — `check-gaps-nord.js` + `gaps-nord.yml` (09:10 UTC)
Trova i giorni **interamente mancanti** nelle 11 regioni attive e, passata la grazia, li copre con stime Open-Meteo sulle coordinate delle stazioni vere (`source: open-meteo-gapfill`). Serve perché il sito somma i giorni che trova e scrive "✅ 30 giorni" con un totale più basso del vero, senza dirlo: fra una stima dichiarata e un buco silenzioso che falsa i totali, la stima è meglio.
- **Grazia 3 giorni per tutti, Ticino e Svizzera compresi (dal 26/10/2026; prima 8 e 11).** Per le fonti con un archivio la stima e' un TAPPABUCHI TEMPORANEO: i collector di Ticino (OASI) e Svizzera (MeteoSvizzera) trattano un file `open-meteo` come un giorno mancante e lo riscrivono col dato vero appena la fonte risponde, fino a D-30 (Ticino al massimo 8 giorni per giro); il registro segna `sostituito-dal-reale`. Prima la grazia lunga serviva a non mettere una stima che poi restava per sempre (si riparavano solo i file mancanti): nato da OASI giu' dal 21 al 26/10, la stima sarebbe arrivata il 29/10, lo stesso giorno in cui il 21/10 usciva dalla finestra di recupero. Austria e Slovenia non hanno stime (non sono in questa rete) ma recuperano da sole i giorni mancanti fino a D-30; la Francia no, il pacchetto orario tiene ~5 giorni. ⚠️ Un collector con merge per stazione NON deve fondersi con un file di stima (Svizzera e Austria ripartono da zero): le stazioni stimate resterebbero dentro un file che si dichiara vero. Misurata su 45 giorni di cronologia git: il file di un giorno arriva entro D+1 in tutte le regioni, mai oltre; e a D-3 nessun collector sta più scrivendo su quel giorno, quindi una stima non può finire dentro un merge MAX.
- Rileva **solo** i giorni interi, non quelli "corti": nel Nord il numero di stazioni oscilla da sé e una soglia sulle stazioni darebbe falsi allarmi a raffica.
- Tetto di 5 coperture per run, riprova sul 429. Registro `data/gaps-nord.json`.
- Uso a mano per buchi vecchi: `SCAN_DAYS=400 node check-gaps-nord.js`. Al primo giro (31/7) ha tappato i 5 buchi storici del Nord su ~4.000 giorni-regione.

### 2. Allarme fonti via mail — `check-fonti.js` + `alert-fonti.yml` (09:43 UTC)
Manda una mail quando una fonte si rompe. **Due guasti sorvegliati, stessa soglia di giorni:**

**(a) Nessun dato** — nessun file con dati reali per 3 giorni consecutivi (5 per il Ticino).
- **Guarda solo i file reali, ignora quelli `open-meteo-*`.** È il punto centrale: senza questa esclusione, dal terzo giorno il gapfill fa comparire il file e una regione morta sembrerebbe viva per sempre. Piemonte e Veneto non scrivono il campo `source`, quindi il test è **per esclusione** (è una stima solo se il source dice open-meteo), mai per inclusione. Un file con zero stazioni conta come giorno mancante.
- Tre è anche il giorno in cui il gapfill inizia a coprire: la mail arriva esattamente quando il buco smetterebbe di vedersi.

**(b) Dati parziali** (dal 31/7/2026) — meno del **50%** delle stazioni per lo stesso numero di giorni consecutivi.
- Serve perché una fonte che consegna il 6% delle stazioni è rotta quanto una spenta, ma il file c'è e il controllo (a) la vedrebbe sana. In mappa è peggio di un buco: il totale sembra plausibile e le zone scoperte risultano asciutte anche se ci ha piovuto.
- **Il 50% non può dare falsi allarmi**, misurato su 731 giorni-regione: il calo più profondo mai registrato è **97,8%** (sei stazioni su 272 in Piemonte, sette su 323 in Emilia), nessun giorno sotto il 90%. Fra il rumore vero e la soglia c'è un abisso. Lo script di misura è usa e getta, il numero è qui.
- Servono 3 giorni e non 1 perché un run parzialmente fallito capita (la Liguria fa 199 chiamate, una per stazione) e il run dopo lo ripara da sé.
- **Il riferimento è il massimo fra tre numeri**: mediana a 14 giorni, mediana a 45, e valore congelato nel registro all'apertura dell'allarme. Non è pignoleria: con la sola mediana a 14 giorni, 20 giorni di Liguria a 20 stazioni su 199 **non suonavano affatto** — la finestra si era riempita di giorni degradati e il guasto era diventato la normalità. Trovato provando sul serio (accorciando davvero i file), non ragionando.

**Comune ai due:**
- Il guasto più grave vince: una regione spenta è segnalata come assente, non come "a stazioni ridotte". Se la natura del guasto cambia, riparte un allarme nuovo.
- Una sola mail per run con dentro tutto: allarmi nuovi, promemoria ogni 3 giorni sui guasti aperti, rientri, e il lunedì il riepilogo delle 11 regioni. Registro `data/alert-fonti.json`, che si aggiorna ogni giorno e fa da cruscotto: per ogni regione dice l'ultimo dato **reale**, le stazioni di ieri e la loro normalità.
- **Invio con `curl` verso `smtps://smtp.gmail.com:465`, non con un'action di terzi**, così la password per le app di Gmail non esce dal runner. Lo script scrive il messaggio completo (intestazioni comprese, oggetto in encoded-word base64 per emoji e accenti) in `alert-mail.eml`, che è in `.gitignore`. Secret: `MAIL_USER`, `MAIL_PASS`, `MAIL_TO`. Se mancano, il workflow **fallisce apposta** — meglio la notifica di errore di GitHub che un allarme che tace credendo di funzionare.
- Prove a mano, nessuna tocca il registro: `TEST_MAIL=1` (mail di prova), `SIMULA=liguria:4` (ferma da 4 giorni), `SIMULA=liguria:4:staz` (stazioni ridotte da 4 giorni). Disponibili anche come input del workflow.
**(c) Eventi-buco MeteoHub** (dal 1/8/2026, con la migrazione v5.0) — le 10 regioni MeteoHub sono nella lista `REGIONI` (21 totali sorvegliate), ma per loro il controllo (b) da solo **non basta**: `check-meteohub-gaps.js` integra le stazioni mancanti dentro il file marcandole `om:true`, quindi il conteggio torna pieno e il giorno sembra sano (il 27/7 la Puglia aveva 0 stazioni buone su 128: guardata dopo, non si vedeva più). `check-fonti.js` legge quindi il registro `data/meteohub-gaps.json`, che i giorni rotti li misura PRIMA della copertura: **3 giorni consecutivi con eventi (mancante o parziale) che finiscono a ieri** (tolleranza 1 giorno per il lag di rilevamento) fanno partire la mail, tipo di guasto `eventi`. Prova a mano: `SIMULA=puglia:4:eventi` (per le reti MeteoHub vale anche il nome corto: `puglia` = `meteohub-puglia`). Collaudato il 1/8/2026: `simula puglia:4` → "Puglia ferma da 4 giorni", `puglia:4:eventi` → "Puglia con buchi MeteoHub da 4 giorni" coi dettagli dal registro.

---

### 3. Pluviometri fermi — `check-stazioni-ferme.js`, dentro `alert-fonti.yml` (dal 21 agosto 2026)

I primi due pezzi sorvegliano le FONTI; questo sorveglia le singole STAZIONI, ed
e' il buco che restava scoperto. Una stazione spenta si vede subito, il file non
arriva. Una stazione **ferma** e' invisibile: il file c'e', la stazione c'e', il
numero c'e', ed e' 0. In mappa diventa un buco bianco in mezzo alla pioggia e
abbassa la media della regione — cioe' manda la gente a cercare dove non ha
piovuto, che e' il difetto peggiore per questo sito.

Nasce dal pomeriggio del 20/8/2026, quando cercandoli a mano ne sono usciti
quattro: la stessa domanda, fatta ogni lunedi' da sola.

- **Sui nostri soli dati, nessuna fonte esterna.** I testimoni sono i
  pluviometri vicini, che sono gia' nostri e stanno gia' nel checkout: niente
  rete, niente chiavi, niente quote. E' l'opposto di `check-mnw-sud.js`, che
  interrogava un testimone di fuori e in 45 giorni non ha trovato un solo
  errore dimostrabile.
- **Soglie**: finestra **45 giorni**, almeno **30 giorni di dato reale** (sotto
  quella soglia il problema e' un buco, e quello e' mestiere di `check-fonti.js`),
  **5 vicini entro 25 km** con mediana **>= 50 mm** (senza pioggia intorno uno
  zero e' la verita', non un guasto), sospetta **sotto il 15%** di quella mediana.
- **I giorni stimati non contano** (`source` con open-meteo): la stima e'
  calcolata sulle coordinate della stazione e darebbe pioggia anche a un
  pluviometro morto, cioe' coprirebbe proprio il guasto che si cerca.
- **Gira solo il lunedi'**, dentro il workflow dell'allarme fonti (stessa posta,
  stesso registro, stesso commit): il segnale si muove su 45 giorni. Il controllo
  del giorno sta dentro il `run` e non in un `if:`, cosi' gli output esistono
  sempre e il passo del commit non deve indovinare. Input `ferme_ora` per
  lanciarlo subito. Registro `data/stazioni-ferme.json`: una stazione si segnala
  una volta sola, se rientra esce in silenzio.
- **NON tocca un dato e non esclude niente da solo**: manda l'elenco, la
  decisione resta umana.

**Primo giro (21/8/2026): 5.717 stazioni giudicate, 12 sospette** — e fra queste
sono riemersi da soli i due esclusi a mano il giorno prima, 3014 Ferriere Pluvio
e VIFRA Villafranca Lunigiana, che il controllo non conosceva. E' la prova che
il metro funziona.

**Come si legge l'elenco: il numero da guardare non e' la percentuale, e' la
STORIA.** Guardando indietro 200 giorni, le 12 si dividono in tre famiglie, e
solo le prime due sono da escludere:
- **mai una goccia** — VIFRA (0,0 mm in 98 giorni su 98), Poggio San Vicino
  (0,0 in 37), Ponte S.Maria (0,2 in 37);
- **morte con una data** — Ferriere Pluvio (97,5 mm a maggio, poi 0,0 in agosto,
  ultima pioggia il 15 luglio), Lugo RA (ultima l'11 luglio), Serra Pistoiese
  (ultima il 15 luglio), Corte Centrale (ultima il 26 luglio);
- **vive, solo piu' asciutte dei vicini** — Camaiore, Villanova Solaro,
  Roccelletta, Corte in Corsica, e **Sella Giassina**, che e' il caso
  interessante: misura ancora (ultima pioggia il 20 agosto) ma fa 17 mm dove
  Torriglia a 3,7 km ne fa 209. Non e' ferma, e' **sorda** — probabile imbuto
  parzialmente ostruito. Restano in mappa e il registro le tiene zitte.

**Escluse in conseguenza, il 21/8/2026** (in `index.html`, un solo deploy):
`EMILIA_ESCLUSE` + 12863 Lugo RA e 14719 Corte Centrale; `MH_ESCLUSE` + Poggio
San Vicino (Marche) e Ponte S.Maria (Umbria); **`TOSCANA_ESCLUSE` nuova** con
Serra Pistoiese. Quest'ultima e' una lista a parte invece della cancellazione
della riga da `TOSCANA_STATIONS`: cosi' il motivo resta scritto e una futura
rigenerazione della whitelist non se la riporta dentro in silenzio.
Verifica prima del push, in locale contro il sito vivo: Toscana+Emilia 479 → 476
stazioni, Marche+Umbria 195 → 193. Esattamente le cinque tolte.

---

### 4. Guardiano dei collector in ritardo — `guardiano-collector.js` + `guardiano.yml` (dal 28 agosto 2026)

I tre pezzi qui sopra sorvegliano le FONTI e le STAZIONI. Questo sorveglia
**GitHub**, che e' l'anello di cui nessuno si occupava.

**Il fatto, misurato su 1.650 giri reali:** lo scheduler di GitHub su questo
repo ha un ritardo **mediano di 38 minuti**, solo l'**1% parte entro 5 minuti**,
il 24% sfora l'ora. E nelle notti storte salta i giri del tutto:

| notte | programmati | partiti | saltati |
|---|---|---|---|
| 26 → 27 agosto | 78 | 23 | **71%** |
| 27 → 28 agosto | 78 | 48 | **38%** |

⚠️ **IN TUTTE E DUE LE NOTTI, ZERO RUN FALLITI.** Quelli che partono riescono;
gli altri non nascono proprio. Quindi **guardare gli esiti dei workflow non
serve a niente** — e' verde anche quando manca il 71% del lavoro. **L'unico
segnale onesto sono i FILE dei dati**, ed e' quello che il guardiano guarda.

**Chi si salva e' chi ha ridondanza.** La notte del 38% i dati c'erano tutti
perche' i collector con 4-7 cron hanno avuto un superstite. Non ce l'hanno fatta
i workflow con uno o due cron: `riepiloghi` (0 giri su 2), `meteohub-gaps` (0 su
1), `anteprime` (0 su 1). ⚠️ Questo va **contro** l'idea di «diradare i cron»:
quella notte diradare avrebbe fatto peggio.

**⚠️ DAL 5/10/2026 LA RIDONDANZA LA DA' LA SVEGLIA, NON I CRON.** L'orologio su
Cloudflare (`.github/cloudflare/sveglia-guardiano.js`) lancia in ora italiana i
giri che contano, e un `workflow_dispatch` parte in 1-3 minuti. Per questo il
27/10/2026 (fase 1 dell'alleggerimento delle fonti, dopo i blocchi di OMIRL, ARPA
Piemonte e OASI) i cron GitHub dei collector sono scesi **da 82 a 34 al giorno**:
due di riserva per collector, quattro la Toscana (le tre chiusure e il mattino).
Misurato prima di toglierli: i giri di giorno rifacevano solo «oggi», che la
mappa non mostra, e a ieri non aggiungevano niente (OSMER 40 stazioni gia'
all'1 di notte, MeteoHub Sicilia identica dalle 4:30, Emilia +3 stazioni su 324).
Toscana e Alto Adige sono entrati nel giro delle 4:30: vento e temperature
complete di ieri arrivano solo con un giro del giorno dopo.
**Fase 2, lo stesso giorno (codice):** Veneto una lettura per stazione, Friuli
finestra lunga una volta al giorno, meteo di ieri una volta sola in Alto Adige,
Trentino e Liguria (`lib-meteo-una-volta.js`). Provata in locale vecchio contro
nuovo sulle stesse copie dei dati: file identici stazione per stazione, richieste
a giro Veneto 381→191, Friuli 409→154 (dopo il primo giro), Alto Adige 229→1,
Trentino 106→2, Liguria 551→200.
**Fase 3, la sera del 27/10:** Svizzera senza i giri del mattino quando ieri e'
completo (spia `completo`, il pomeriggio rifa' tutto), MeteoHub coi due giorni in
una richiesta e il meteo una volta (`meteo_completo`, ritorno al giorno singolo se la
richiesta cade o arriva corta), Lombardia con l'anagrafe in una richiesta, vento
toscano da MeteoHub una volta al giorno. Prima la misura sulla storia di git (quando
il file di ieri smette di cambiare), poi vecchio contro nuovo: file identici in tutte
e quattro. Stima: da ~6.250 a ~5.000 richieste al giorno.
**30/10/2026: `meteohub-gaps.yml` entra nella sveglia alle 6:15** (salta se GitHub l'ha fatto
nell'ultima ora). Il suo cron delle 8:40 UTC partiva da giorni verso le 15:30 UTC: la stima di un
giorno MeteoHub perso (Puglia 26-29/10) arrivava a G+2 di pomeriggio, e l'allarme fonti delle 11:45
leggeva un registro vecchio di un giorno. Il cron resta come riserva: un secondo giro aggiorna il
registro e non copre due volte.

**Cosa fa.** Per ogni cartella di `data/` controlla che ci sia il giorno che
dovrebbe esserci; se manca e l'ultimo giro programmato di quel workflow e'
passato da un pezzo, lo ri-lancia con `gh workflow run`. Piu' i riepiloghi, che
non sono una cartella di dati e si giudicano sul campo `generato`.

- **Gli orari programmati si LEGGONO dai `.yml` a runtime**, non da una tabella:
  due elenchi che divergono direbbero due verita' diverse. Stessa ragione per
  cui l'anagrafica cartella → workflow sta in un posto solo, `check-fonti.js`,
  che ora si lascia anche `require` (`module.exports = { REGIONI }`).
- **Le tarature, col perche':** `MARGINE_MIN=150` (il ritardo mediano e' 38' e
  il 6% sfora le due ore: sotto le 2h30 si ri-lancerebbero workflow che stanno
  solo arrivando tardi), `PROSSIMO_MIN=20` (se il prossimo giro e' dietro
  l'angolo ci pensa lui), `MAX_LANCI=8` (piu' di cosi' non e' un giro perso, e'
  GitHub giu': non si lancia niente).
- ⚠️ **La Slovenia e' in `RITARDO_DICHIARATO`** (2 giorni): ARSO pubblica con
  ~34 ore di scarto e per lei «ieri» non esiste mai. Senza quella riga il
  guardiano l'avrebbe trovata in ritardo tutte le mattine.
- **Deduplica per workflow**: le 13 cartelle francesi e le 11 di MeteoHub sono
  un lancio solo. Senza, una piattaforma giu' produrrebbe 13 dispatch.
- **`permissions: actions: write`** e' cio' che permette di ri-lanciare gli
  altri workflow. ⚠️ `workflow_dispatch` e' l'**eccezione documentata** alla
  regola «gli eventi innescati dal GITHUB_TOKEN non creano nuovi run».
- **TRE cron** (06:55, 08:50, 10:10 UTC) e non uno: il guardiano e' anche lui un
  cron e nella notte del 71% sarebbe saltato pure lui. ⚠️ I tre minuti sono
  scelti su misura — nessun altro workflow parte entro cinque minuti. Il primo
  tentativo metteva le 08:20, dove ne partono gia' due.
- **Registro** `data/guardiano.json`: serve a non ripetersi e soprattutto a
  MISURARE quanto spesso capita, **senza nessuna chiamata di rete**.
- **Una fonte ferma: tre tentativi al mattino, uno dalle 17, poi niente fino
  al giorno dopo** (dal 25/10/2026, regola sua: `TENTATIVI_MATTINA`,
  `ORA_SERA`, `TENTATIVI_SERA`). Il conto si fa sul registro, per workflow e in
  ora italiana; il log dice «⏸ … riprovo dalle 17» o «riprovo domani». Nata dal
  Ticino del 25/10: OASI giu' dal 21/10 (irraggiungibile anche dal PC), il
  guardiano lo rilanciava a ogni passaggio, quattro volte fra le 6 e le 7:30, e
  ogni volta ripartivano anche i riepiloghi. Non si perde niente: i giri normali
  del collector restano tutti. Per il tentativo delle 17 c'e' un **quarto cron,
  16:00 UTC** (d'inverno le 17, d'estate le 18). ⚠️ I riepiloghi non hanno il
  tetto, hanno la loro regola «mai due giri di fila».
- **Una cartella sola ferma, con le sorelle a posto, non si rilancia** (dal
  28/10/2026). Se un workflow scrive piu' cartelle (MeteoHub 11, Francia 13) e
  PIU' della meta' delle altre ha il giorno, il giro c'e' stato: il buco e' della
  fonte, e il log lo dice fra le cartelle «su cui NON agisco». Nata da MeteoHub
  Puglia (una stazione al giorno dal 26/10): meteohub.yml rilanciato quattro
  volte al giorno, coi riepiloghi dietro. Con meta' o piu' delle sorelle ferme
  si rilancia come prima. Il buco resta nel registro (`mancanti`).

**⚠️ IL LIMITE, DETTO CHIARO:** copre il caso «GitHub ha saltato la notte ed e'
tornato in se' la mattina», che e' il piu' frequente. Non copre «GitHub e' giu'
da dodici ore»: li' salta anche lui, e quando torna ripartono da soli anche i
collector. **Non e' un sostituto di `check-fonti.js`**: se una fonte e' morta
davvero, la mail arriva lo stesso dopo tre giorni.

**Prove a mano** (`workflow_dispatch` o da riga di comando):
`SIMULA=liguria,emilia` finge che manchi il giorno · `ORA=2026-08-28T09:00:00Z`
finge il momento · `MAX_LANCI=1` per vedere il ramo del tetto · senza `LANCIA=1`
guarda e basta. ⚠️ Quando si simula, il guardiano **dice perche'** ha deciso di
non lanciare: un «tutto a posto» in risposta a una simulazione sembra un difetto
e invece e' quasi sempre una taratura che lavora.

**Al primo giro serio ha trovato una cosa vera**: la Slovenia sembrava ferma al
25 agosto. Non lo era — ARSO aveva il 26 (114 stazioni, verificato lanciando il
collector a mano) e il collector conta i suoi due giorni di ritardo a partire da
oggi, quindi lo scrive col giro del mattino. **Il guardiano l'ha segnalata solo
all'orario in cui era giusto segnalarla**, non a quello vero.

### 5. I campi che spariscono — `check-campi.js`, dentro `alert-fonti.yml` (dal 12 ottobre 2026)

Gli altri pezzi guardano se i file ARRIVANO, se la pioggia e' COPIATA e se le
stazioni sono FERME. Questo guarda se dentro un file arrivato **manca a un
tratto un campo**. Nasce dalla Liguria: dalla sera del 9/10/2026 OMIRL ha
pubblicato la direzione del vento per 5 stazioni invece di 46, per tre giorni,
senza un solo errore nei giri. L'ha vista lui per caso, e il 9/10 era ormai
fuori dalle ~69 ore di OMIRL: e' servita una riparazione mirata del solo `wd`.

- **Ogni giorno, tutte le reti**: **dal 3/11/2026 solo l'altro ieri** (prima ieri
  e l'altro ieri: vedi la nota del 3/11 in fondo), conteggio di stazioni, `t`, `w`, `wd`, `u` contro la
  **mediana dei 14 giorni prima** (almeno 7 validi). Suona **sotto il 60%**, e
  solo dove quel campo arriva ad almeno 5 stazioni.
- ⚠️ **L'intensita' `i` NON si guarda**: si scrive solo da 0,5 mm, nei giorni
  asciutti e' vuota per forza.
- ⚠️ **Salta i file con `gapfill` e `repaired`, anche nella mediana.** MeteoHub
  completa i giorni a posteriori con stazioni che hanno solo la pioggia: sono
  buchi gia' dichiarati, e da soli facevano **19 falsi allarmi su 26**.
- **La misura, 20/8-11/10/2026: 5 casi, tutti veri.** Alto Adige `u` 1/9 (0
  contro 55), Sardegna `t`/`w` 7/9 (19 contro 93), Friuli `w`/`u` 11-14/9 (14
  contro 36), Liguria `wd` 9-11/10 (5 contro 47). Sui file liguri com'erano il
  10/10 alle 10 avrebbe suonato quella mattina, in tempo per un rilancio.
- La mail dice rete, campo e quanti contro quanti, e come rilanciare il
  collector con `date_override` finche' la fonte tiene i dati. Niente registro
  e niente commit: un buco di piu' giorni manda una mail ogni mattina, un giorno
  per volta, un campo sparito per sempre si zittisce in circa una settimana,
  quando la mediana si adegua.
- **Legge solo i nostri file, non tocca un dato.** Prova in locale:
  `node .github/scripts/check-campi.js`, `GIORNO=2026-09-07` per un giorno
  passato, `DATA_DIR=<cartella>` per i file di un altro momento (si estraggono
  con `git archive <commit> data/<regione>`).
- Sul repo di test non c'e': li' l'allarme fonti e' spento.

## Check periodico dati
Ogni ~5 giorni verificare:
1. Confronto stazioni al confine tra regioni confinanti (stessa pioggia?) — **automatizzato dal 4 agosto 2026: `node .github/scripts/check-confini.js <confine>`**, `--lista` per i nomi (svizzera, emilia-piemonte, emilia-liguria, toscana-emilia, lombardia-trentino). Vedi la sezione dedicata più sotto.
2. Nessun valore anomalo (>150mm/giorno)
3. Nessun calo improvviso nel numero di stazioni
4. Workflow tutti verdi
5. Confronto puntuale con fonti ufficiali (cfr.toscana.it, omirl.regione.liguria.it, apps.arpae.it)
6. **Nessun file giornaliero identico a quello del giorno precedente** (confronto stazione per stazione, non solo del totale): è la firma comune dei bug #17, #18 e #19 — pioggia di ieri trascinata sul giorno dopo. Quando salta fuori, confrontare sempre con l'API interrogata in diretta prima di concludere.
   - **Come NON farlo** (provato il 4/8/2026): contando tutte le stazioni identiche escono oltre cento "casi" su 24 cartelle, tutti falsi. In una giornata quasi asciutta il 97% delle stazioni è 0 in entrambi i giorni, quindi "identiche" per forza — il controllo misura il bel tempo, non un guasto.
   - **Come farlo**: confrontare **solo le stazioni bagnate** (almeno una delle due giornate sopra zero), su giornate con almeno ~20 mm complessivi, escludendo il giorno in corso (durante il giorno Toscana e Alto Adige contengono per costruzione la coda di ieri, ed è regolare: la mappa esclude oggi comunque, regola #3). Con questi paletti il 4/8 il risultato era pulito su 25 giorni e tutte le cartelle.

---

## Sesto check (20/10/2026)

Fatto da una sessione cloud la notte del 19-20/10, verificato punto per punto sul codice e sui dati veri prima di
correggere. In produzione col commit di codice del 20/10 e uno separato `[skip netlify]` per i dati riparati.
- **Workflow, i due difetti che contavano** (25 file): il «Retry 2» partiva anche quando il «Retry 1» era riuscito e,
  fallendo, faceva saltare il commit: **137 giri persi** (Veneto 56, Trentino 45, VdA 14). Ora parte solo se sono
  falliti tutti e due (`id: retry1`). E un giro messo in fila dalla `concurrency` ripartiva dallo SHA fissato quando
  era nato, non dalla punta di main, e il push andava in conflitto (Alto Adige 19/10, Slovenia 4/10, MeteoHub 18/10):
  ora `ref: main` nel checkout di tutti e `git rebase --abort` nel ciclo dei tentativi.
- **Ente giusto** sui 5 posti con la rete di un'altra regione (Bagnone, Casoni di Suvero, Alto, Romagnese, Valverde)
  e sulle zone che li contengono: `regioneDati` per il paese, `retiDei` (lib-posti.js) per zone e regioni. E' la
  citazione obbligatoria della licenza. Trovato insieme: `genera-pagine-localita.js` tagliava il posto a 7 campi,
  quindi l'ottavo (la rete) non arrivava mai.
- **genera-funghi.js e il ripiego della pagina** contano i giorni buoni solo sulle cartelle della regione: se SIR si
  ferma, la classifica non esce piu' «fresca» con 2 paesi liguri su 169.
- **Mappa (index.html)**: le date chieste restano a parte da quelle tagliate dall'inizio dei dati (cambiando regione
  non resta il periodo accorciato); `TICINO_HIST_FROM` (le stazioni OASI fuori dai periodi prima del 18/3/2026,
  MeteoSvizzera resta dal 7/8/2025); i link condivisi senza il tetto fisso dei 365 giorni (resta il tetto sulla
  durata); `isoPiu()` = un giorno di CALENDARIO (al cambio d'ora +24 h sbaglia); Abruzzo ora per ora dall'01:00 alle
  00:00 del giorno dopo (il valore delle ore H e' la pioggia dell'ora prima), senza zeri inventati e col filtro di
  copertura; il «~» della quota non dipende piu' dall'ordine di arrivo dei file.
- **lib-meteo-regione.js**: «domani» di calendario, elenco dei comuni che si ritenta dopo un errore, tabella delle
  zone disegnata senza aspettare l'elenco, media delle previsioni per data. **previsioni.js**: `q` non numerico =
  assente (prima 502).
- **MeteoHub**: nomi riparati (Trinita' 119 file, Pranu Sangun 119, Fortore 4), `qt` copiato dal registro dei buchi
  (1.267 stazioni in 8 file), e un valore che Open-Meteo non da' non diventa piu' 0 mm.
- Minori: link della mappa forestale alle regioni nuove; `stileDelModello` taglia il blocco meteo (se no la mappa
  forestale, rigenerata, prendeva 6 KB e spostava il tasto YouTube); province «Asti» e niente «(F)»; il rinnovo
  trimestrale rigenera e committa anche le zone piogge e `paesi-zone.json`.
- NON toccati, per scelta: i pallini di partenza col «ieri» a −24 h (innocui), il badge «OASI Ticino» quando OASI e'
  saltata, il −48 h dell'avviso delle stime.

## «Da guardare» del settimo e ottavo check (21/10/2026)

Tredici punti rimasti aperti, studiati in sola lettura da una sessione cloud (resoconto `da-guardare-rapporto.md` sul
ramo `da-guardare`), verificati sul codice e decisi con lui. Corretti:
- **Tempo massimo su giri e richieste.** Nessun collector aveva `timeout-minutes`: un giro appeso restava li' 6 ore.
  Per la Toscana era l'unico modo di perdere un giorno per sempre: se il giro delle 22:15 si appende, le chiusure di
  Cloudflare (senza `CLOSING`) si cancellano in fila, l'ultima parte verso le 4 e scrive sul giorno nuovo. Ora 20 minuti
  sui collector e sui due gaps, **10 sulla Toscana** (misurati gli ultimi 100 giri di ognuno: il piu' lungo 8,6 minuti,
  la Toscana sotto il minuto). E 30 s senza risposta sulle sei `https.get` che non ne avevano (Emilia, Trentino x2,
  Veneto, Alto Adige, richiesta principale al SIR), con `.setTimeout(30000, …destroy)` dopo `.on('error', reject)`.
- **`permissions: contents: write`** nei sette collector che non l'avevano, e `ref: main` nel checkout di
  `anteprime.yml`: i 17 collector adesso sono uguali.
- **Le temperature impossibili si tolgono anche dentro `meteohub.yml`**, prima del commit (`pulisci-temperature.js` con
  `SOLO=meteohub-`: giudica con tutti i vicini, tocca solo quelle cartelle). MeteoHub rimetteva a ogni giro la minima che
  `riepiloghi.yml` toglieva (Baunei 19/10, −12,8°: 22 riscritture in due giorni, ed era la prima causa dei conflitti di
  push fra giri).
**Corretti il 25/10/2026** (erano «quando si passa da quel file»):
- **Piemonte sopra 300 mm**: l'archivio ufficiale (giorno UTC) vince sul realtime completo solo se ci SMENTISCE, cioe'
  se da' meno della meta' del nostro (sensore guasto); se no resta il giorno italiano. Provato abbassando per prova la
  soglia a 10 mm sul 19-21/10: da 91 stazioni complete sostituite a 12. ⚠️ Il prezzo: una pioggia concentrata fra le
  00 e le 02 italiane sembra un guasto (a 300 mm servono 150 mm in quelle due ore).
- **Registro di alert-fonti**: il passo del commit ha `!cancelled() &&`, cosi' una mail fallita non lo fa saltare.
- **Date senza anno**: `periodoBreve(a,b)` in `index.html` per le tre etichette (inizio dati, date scelte, link);
  l'anno compare su tutte e due le date se una non e' dell'anno in corso («20 dic 2025 → 10 gen 2026», a 360 px su
  una riga).
- **`loadOpenMeteo` tolto** (142 righe mai chiamate, che scrivevano 0 mm se Open-Meteo non rispondeva), con
  `fmtDate` che usava solo lei. Abruzzo e Valle d'Aosta provati dopo.
- **Frase del pluviometro**: `OPZ.sopraSenzaQui` in `meteoClient`; le pagine paese passano «I paesi intorno», usata
  se nella tabella non c'e' la riga `qui`. Rigenerate le 908 pagine (cambiano anche i numeri d'archivio).
Lasciati, con lui: id doppi Bormio/Panocchia, `CLOSING` da Cloudflare (lo copre il tetto), coperture parziali di
meteohub-gaps, testata del telefono, punto delle migliaia e «~» delle pagine paese. La heatmap a fasce su Safari: **CHIUSA
la sera del 21/10/2026** (provata su Safari vero da un Mac di GitHub, ramo `prova-safari` poi cancellato: strisce
confermate e tolte con una riga in piu' sopra e sotto ogni fascia, `918afb5e4c`, commento in index.html). Il link per
riguardarla, se servisse, resta questo; per le prove del canvas basta Playwright sul Mac, su Windows no. Era: «va
guardata su un iPhone» (`/?r=lombardia,puglia,sicilia&da=2026-10-01&a=2026-10-20`, zoom 11-14).

## La mail «RIENTRATA» di check-fonti diceva la data sbagliata (2/11/2026, scheda 113)

- Il 2/11 la mail diceva «Puglia — nessun nuovo evento-buco MeteoHub. In guasto dal 31/10/2026» il giorno in cui la Puglia
  aveva un buco lieve nuovo (1/11, 104 su 130) e il guasto era cominciato il 26/10: `prec.dal` e' il giorno della mail
  d'allarme, non l'inizio del guasto. Ora le tre righe dei rientri dicono «Allarme partito il …», e quella degli
  eventi-buco dice quanti giorni di fila con buchi gravi restano contro la soglia e che i buchi lievi (rete sopra il 60%)
  restano nel registro e non si coprono. `check-fonti.js`, blocco dei `rientri`.
- Prova su una copia (scratchpad 54de8904 `sandbox-fonti\`, registro con tre allarmi finti, dati letti dal repo): le tre
  frasi nuove come previsto, registro e mail del repo non toccati.

## meteohub-gaps non salvava niente se ICON-2I non si leggeva (2/11/2026, scheda 114, check-10)

- Trovato dal check-10 (`check-10\RESOCONTO-check-10.md` del banco, M1). In `check-meteohub-gaps.js` un errore nel
  leggere ICON-2I (MeteoHub opendata giu', un file appena tolto, un formato cambiato) faceva finire il giro con 1: il
  workflow ritentava dopo 30 s e, se falliva anche il ritentativo, il passo «Commit e push» non partiva. Si perdevano le
  coperture riuscite sulle altre regioni, i buchi nuovi, i «risolto-meteohub» e il registro, e con un errore che si
  ripete ogni giorno il registro restava fermo senza che `check-fonti.js` lo sapesse.
- Ora l'errore di ICON non fa finire il giro in errore: si scrive come avviso di GitHub (`::warning::`, giallo nel giro),
  l'evento resta aperto e lo riprova il giro dopo, come faceva gia' `check-gaps-nord.js`. Un crollo vero dello script
  (`main().catch`) esce ancora con 1 e non committa: e' giusto, a meta' giro file e registro non tornano. Per questo NON
  `if: always()` sul commit.
- Prova su due copie leggere (scratchpad 3f257665 `prova-m1\`, ultimi 13 giorni di dati MeteoHub, file del Molise del
  30/10 tolto, `lib-icon2i.js` sostituito da uno che da' sempre errore): vecchio esce con 1, nuovo con 0 e la riga
  `::warning::`; registri identici (Molise 30/10 «aperto», mancante, 0/28), resto del giro identico.

## Due piccoli dei buchi dal check-10: chiusure a 20 giorni e quota delle stime (2/11/2026, scheda 114)

- **B3, le chiusure del registro MeteoHub fino a 20 giorni.** Dal 2/11 (`ae6d822b37`) `collect-meteohub.js` ripara i
  giorni coperti fino a 20 giorni indietro (`RIPARA_FINO` con l'account), ma `check-meteohub-gaps.js` guardava solo i 10
  giorni della scansione: un giorno fra l'11° e il 20° tornato vero restava «coperto» per sempre (dati giusti, conto
  dei giorni a stime sbagliato). Ora, dopo la scansione, per ogni regione si chiudono anche gli eventi aperti o coperti
  fino a `CHIUDI_FINO` = 20 giorni, con la stessa regola (file vero, stazioni vere almeno alla soglia); i buchi nuovi si
  cercano sempre e solo nei 10 giorni. Sui dati del 2/11 non cambia niente (Sardegna 15/10 e 22/10 non ancora piene).
  Prova (scratchpad 3f257665 `prova-b3\`): evento finto Calabria 18/10 «coperto-icon» col file vero pieno, il nuovo lo
  chiude «risolto, stime sostituite», il vecchio no; gli altri 60 eventi identici.
- **B4, la quota delle stime di gaps-nord.** `anagrafeVicina` di `check-gaps-nord.js` scriveva `q: s.q || 0` e non
  copiava `qt`: nei giorni coperti la quota presa dal terreno perdeva il «~» (il Friuli ce l'ha su tutte e 40 le
  stazioni, la Toscana su 2). Ora come `registroStazione` di meteohub-gaps (20/10): quota com'e' e `qt`. Il «0 m» per
  la quota mancante in pratica non capitava: al 1/11 nessuna stazione delle 12 reti del Nord e' senza quota. Prova
  (`prova-b4\`): Friuli 41 stazioni, `qt` da 0 a 41; Toscana da 0 a 2.
- Scartati dello stesso check, con lui: B2 (la finestra di ICON per gaps-nord: 8 eventi da luglio, mai piu' di uno o
  due insieme) e B6 (il rinnovo mensile col giro a mano del 1°: caso rarissimo).

## La mail dei campi spariti suonava per un giro in ritardo: ora guarda l'altro ieri (3/11/2026, scheda 115 bis)

- **Il caso.** Mail di `check-campi.js` del 3/11 alle 11:45: «toscana, 2/11, vento su 0 stazioni contro 143». La fonte
  non c'entrava. Le tre chiusure GitHub della Toscana (cron 21:00/21:20/21:40 UTC) sono partite alle 3:44, 3:56 e 4:02
  italiane e, da chiusure tardive, hanno lavorato sul 2/11 come «oggi». La sveglia delle 4:30 ha visto «Toscana partita
  28' fa» (`saltaSe` 45 della riga MATTINO) e ha saltato il giro che attacca il vento di ieri. Il vento e' arrivato col
  cron `15 4` di GitHub, partito alle 12:51 italiane: 138 stazioni dalla rete di sicurezza MeteoHub, come i giorni prima.
- **Sua regola: le mail solo per problemi certi, non per il ritardo di un workflow.** E niente giri in piu' per coprire
  il caso: la Toscana sempre alle 4:30 (`saltaSe` 0) e' stata scartata, perche' le chiamate alle fonti le abbiamo
  ridotte apposta e i fornitori ci bannano.
- **Il rimedio: `check-campi.js` guarda solo l'altro ieri** (`rif` = oggi − 2, `GIORNI` 1). Il meteo di ieri lo
  attaccano i giri del giorno dopo, anche in ritardo di ore; l'altro ieri nessun giro lo tocca piu', quindi un campo che
  manca e' perso davvero. La mail lo dice («il giorno segnalato e' l'altro ieri»).
- **La misura, log di alert-fonti dal 14/10 (40 giri riusciti): 5 mail dei campi.** Ritardi rientrati da soli: Toscana
  `w`/`wd` 2/11 (mail 3/11), Lombardia `wd` 29/10 (mail 30/10). Buchi MeteoHub poi dichiarati `gapfill`, che il controllo
  salta: Sardegna 15/10 (mail 16/10), Puglia 30/10 (mail 31/10). Persi davvero: Toscana `t`/`u` 17/10 (mail 19/10),
  Campania 29/10 (mail 30 e 31/10). Col nuovo controllo, provato sui file di origin/main del 3/11: suonano solo
  Toscana 17/10 e Campania 29/10, **2 mail invece di 5, una per buco**.
- **Il prezzo**: un buco vero arriva un giorno dopo. Per la Liguria (OMIRL ~69 ore) il rilancio si fa ancora la sera
  stessa; la temperatura toscana, che il SIR tiene solo per ieri, gia' prima arrivava tardi (17/10 avvisato il 19/10).
  Se alert-fonti salta un giorno intero (sveglia delle 11:45 e cron delle 16:40), quel giorno non si guarda.

