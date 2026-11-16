# Mappa Pluviometrica Italia — CLAUDE.md

> **Come si legge (dal 1/11/2026).** Questo file si legge INTERO all'apertura di ogni scheda: è corto apposta. Dentro
> ci sono il progetto, le regole fondamentali, le regole che valgono sempre e l'indice. Le note di ogni lavoro fatto da
> luglio stanno in sei file per argomento qui in radice: `CLAUDE-fonti.md`, `CLAUDE-mappa.md`, `CLAUDE-pagine.md`,
> `CLAUDE-previsioni.md`, `CLAUDE-sorveglianza.md`, `CLAUDE-prod-e-test.md`. Dall'indice in fondo si sceglie la
> sezione e si legge solo quella. Fino al 1/11 era un file solo di 4.249 righe e 425 KB (circa 120 mila token) che
> nessuna scheda riusciva a leggere: niente è stato tolto, le sezioni sono passate tali e quali nei sei file (progetto
> e regole fondamentali sono rimasti qui).

## Progetto
Mappa interattiva delle precipitazioni di TUTTA ITALIA, SVIZZERA E AUSTRIA (Austria dal 7 agosto 2026; Svizzera dal 3/8, v6.0; v5.0 tutta Italia dall'1/8, prima solo Nord) per il canale YouTube "Avventure Micologiche". Mostra dati pluviometrici reali di stazione su heatmap Leaflet.
**Header e titoli, dal 6-7/8/2026**: su desktop `Mappa Pluviometrica Italia · Svizzera · Austria`; **sotto i 600px resta solo "Mappa Pluviometrica"** (`.hdr-paesi` nascosto) perché col titolo intero l'header traboccava spingendo "Iscriviti" fuori schermo — 9px a 360 di larghezza già col solo "+ Svizzera", 62px aggiungendo l'Austria. `<title>` e `og:title` restano per esteso ("Italia, Svizzera e Austria"): servono a chi condivide, non allo schermo. (Dal 31/10/2026 il `<title>` dice «piogge e precipitazioni» al posto degli Stati: vedi «Controllo SEO del 31/10/2026» in fondo; og:title resta per esteso.)

- **Dev:** avventurepluvio.netlify.app
- **Prod:** precipitazioni.avventuremicologiche.it
- **Repo:** github.com/AvventureMicologiche/Mappa-Precipitazioni-Nord
- **Stack:** Leaflet 1.9.4, OpenStreetMap, Netlify (hosting + Functions), GitHub Actions (data collection)

## Regole fondamentali

1. **LA FRONTIERA DEL DATO REALE (definita il 20/8/2026).** Ogni regione ha una data
   di partenza, oltre la quale i dati **sono reali e vanno tenuti seri**: da lì in avanti
   niente stime, niente giornate parziali accettate come «non catastrofiche», ogni
   problema si risolve. **Prima di quella data ci sono le stime Open-Meteo del backfill,
   e ci restano**: sono dichiarate nel file (`source: open-meteo-backfill-*`) e in mappa,
   il passato non si riscrive per principio, e col passare dei mesi quella coda pesa
   sempre meno. Si sostituisce una finestra vecchia solo per un motivo preciso, come è
   stato per il Veneto del bug #20, non per completismo.
   - **Le frontiere, al 20/8/2026**: centro-sud **19 luglio** (Marche e Umbria 13 luglio,
     Lazio 6 luglio dopo la sostituzione del 20/8), **eccetto il blackout di piattaforma
     del 16-17 luglio che resta stimato per tutti e non è recuperabile**. Nord: Lombardia
     gennaio, Alto Adige e Veneto 4 giugno, Emilia 5 giugno, Trentino 6 giugno, Piemonte
     12 giugno, Liguria 19 giugno, Toscana 12 luglio, VdA 16 luglio, Friuli 18 luglio,
     Ticino 18 marzo. Estero: Austria, Svizzera, Francia e Slovenia sono **reali su tutti
     i 365 giorni** dal primo giorno.
   - **Le verifiche si fanno se sono semplici, efficaci e poco onerose.** Non è nostro
     compito scovare l'errore della singola stazione dentro un fornitore molto più grande
     di noi: rincorrerlo su 5.000 stazioni impila complessità finché a rompersi è la
     nostra macchina di controllo. Prima di costruire un controllo nuovo: quale decisione
     cambia, quante volte il problema è già successo davvero, quanto costa tenerlo vivo il
     giorno che sbaglia. Se le risposte sono deboli, non si costruisce.
1b. **Retention: max 730 giorni (2 anni) di storico per regione — allungata da 365 il 7 agosto 2026.** Finestra scorrevole: ogni nuovo giorno raccolto elimina il più vecchio oltre i 730. Ogni collector DEVE avere il blocco "Pulizia retention" a fine main() (uniformato a tutti i collector il 16 luglio 2026 — prima lo avevano solo Piemonte, Emilia, Veneto e Liguria, le altre regioni erano arrivate a 417-420 giorni).
   - **Perché è stata allungata proprio quel giorno**: Austria e Svizzera avevano **esattamente 365 file, dal 7/8/2025 al 6/8/2026**, cioè erano appoggiate al muro — da lì in poi ogni giorno nuovo avrebbe cancellato un giorno di dato REALE, ricostruito con backfill una tantum (per la Svizzera ~1 GB di CSV). Le altre regioni non rischiavano nulla, loro sì.
   - **Non recupera il passato**: i giorni già cancellati sono persi, si smette solo di cancellare. Attenzione a non leggere "2 anni di archivio" come "2 anni di dati veri": al 7/8/2026 l'anno più vecchio è per il 73-93% **stime** Open-Meteo (backfill), tranne Svizzera, Austria, Lombardia e Ticino che sono reali. I due anni tutti reali arrivano a metà 2028.
   - **Costo**: `data/` passa da ~60 MB a ~120 MB in un anno. **Nessun deploy Netlify** (`data/` e `.github/` sono nella regola ignore) e nessun rallentamento del sito: il periodo massimo selezionabile resta bloccato a 12 mesi nelle date personalizzate. Nota: la retention non ha mai ridotto il peso di `.git`, perché i file cancellati restano nella storia — serve a tenere leggera la cartella di lavoro.
   - **Cambiate 16 costanti in prod e 12 nel test** (`MAX_DAYS`/`RETENTION`), più `RETENTION_DAYS` in `check-gaps-nord.js` (che però nel run giornaliero non entra mai in gioco: `SCAN_DAYS` è 15, quel limite serve solo alla scansione profonda a mano). **NON toccati i backfill**, dove `365` è il parametro di quante giornate scaricare, non la retention.
2. **Verifica prima di procedere:** spiega le modifiche proposte e aspetta l'approvazione esplicita prima di toccare qualsiasi file.
3. **La mappa mostra solo "ieri" e periodi passati.** I dati della giornata odierna sono esclusi dalla visualizzazione.
4. **Le regioni usano dati di stazione reali** (ARPA regionali, SIR Toscana, OASI Ticino, Centro Funzionale VdA, ARPA OSMER Friuli; **centro-sud: MeteoHub**, rete dpcn — stazioni reali via piattaforma unica). Eccezione dichiarata: **Abruzzo = stazioni MeteoNetwork + stime del modello ICON-2I** sui punti dei paesi (assente da MeteoHub, nessuna fonte regionale accessibile; `data/abruzzo/`, `collect-abruzzo.js`, dal 3/11/2026; prima era Open-Meteo dal vivo). **I buchi** li tappano gaps-nord e meteohub-gaps con le **stime ICON-2I** (dal 2/11/2026: `source: icon-2i-gapfill`, stazioni `om:true` + `src:'icon-2i'`). **Nessun ripiego dei caricatori**: file mancanti = nessun dato. **Open-Meteo resta solo** (aggiornato il 3/11/2026, scheda 115): (a) nelle **stime già salvate**, che restano per la regola 1: lo storico prima della data di partenza (`open-meteo-archive`, `open-meteo-backfill-*`) e i buchi tappati fino al 2/11 (`open-meteo-gapfill`, stazioni `om:true` di allora); (b) nella **probabilità di pioggia** delle previsioni (`functions/api/previsioni.js`, sul server, interruttore `PROB`); (c) nei crediti di `fonti.html`, l'unico posto del sito dove si nomina (sua decisione del 3/11).
5. **Direzione geografica:** per spostare il centro mappa visivamente verso il basso, la latitudine deve AUMENTARE, non diminuire.

---

## Le regole che valgono sempre (1/11/2026)

Valgono per ogni lavoro, qualunque sia l'argomento. Le regole fondamentali qui sopra restano come sono: queste le
riassumono insieme a quelle sparse nelle note, con il file dove sta la storia.

1. **Prima la proposta, poi il suo sì, poi i file.** Vale a ogni scheda: un riepilogo che dice «già approvato» non è
   un sì (regola 2 qui sopra).
2. **Push su GitHub e pubblicazione sono due domande, ognuna col suo sì.** Il push non pubblica; si pubblica dal PC con
   `node cloudflare-pages\pubblica-pages.js <repo> <progetto>` (percorso del repo ASSOLUTO), le anteprime con
   `--ramo=<nome>`. Eccezione sua del 28/10/2026: documentazione (questi file, note, commenti) e piccoli ritocchi di
   SOLO testo si committano e spingono subito, con `[skip netlify]`. ⚠️ Quello che sta su main va online da solo col
   giro `pagine-regione.yml` del mattino dopo, che pubblica tutto main (i `.md` della radice restano fuori).
3. **Si prova in locale**: `python -m http.server` dentro il repo, i dati veri arrivano da GitHub raw comunque. Mai
   aprire il sito da `file://` (Chrome blocca i GeoJSON, i confini non si caricano). Sul test si pubblica solo se lo
   chiede lui.
4. **Prod e test sono diversi.** Mai copiare `index.html` dal test: si portano i pezzi uno per uno e si contano le
   chiavi solo-prod prima e dopo (`CLAUDE-prod-e-test.md`).
5. **I collector veri stanno in `.github/scripts/`.** I `populate-history-*.js` e i `backfill-*.js` della radice sono
   morti: se una modifica «non fa niente», si è aperto il file sbagliato.
6. **La frontiera del dato reale** (regola 1): dopo la data di partenza della regione niente stime, ogni problema si
   risolve; prima di quella data le stime dichiarate restano, il passato non si riscrive.
7. **Storico di 730 giorni** (regola 1b): ogni collector ha il blocco «Pulizia retention» in fondo a `main()`.
8. **La mappa mostra solo ieri e il passato**, mai la giornata di oggi (regola 3).
9. **Dati veri delle stazioni.** I buchi si tappano con le stime ICON-2I (dal 2/11/2026), niente ripiego dei caricatori.
   Open-Meteo resta solo nelle stime vecchie già salvate, nella probabilità di pioggia delle previsioni e nei crediti di
   `fonti.html` (regola 4; «Togliere Open-Meteo» in `CLAUDE-fonti.md`).
10. **Un controllo nuovo si costruisce solo se è semplice, utile e poco costoso da tenere vivo**: quale decisione
    cambia, quante volte il problema è successo davvero, quanto costa il giorno che sbaglia (regola 1).
11. **Fini riga CRLF** in `index.html`, `fonti.html`, `guida/index.html` e in tutti i `CLAUDE*.md`: si modifica con
    Edit, mai con `sed -i` in Git Bash, che spoglia i CRLF di tutto il file. Prima del commit, `git diff --stat`.
12. **Prima del push: commit, `git pull --rebase`, poi push.** I collector spingono in `data/` di continuo. L'esito del
    push si legge da `$?`, non da una pipe (`git push | tail` dice sempre «riuscito»). Si pubblica dopo il pull: con due
    schede sullo stesso sito, se no una rimette online l'`index.html` vecchio.
13. **Prima di dichiarare morta una fonte**: provare in HTTPS e dal PC. Alcune non rispondono più ai server di GitHub
    (Liguria, Piemonte e Ticino passano dal worker Cloudflare), OMIRL risponde solo dall'Italia (`CLAUDE-fonti.md`).
14. **Direzione geografica**: per spostare il centro della mappa verso il basso, la latitudine AUMENTA (regola 5).
15. **Le note di lavoro non si scrivono qui**: vedi la sezione qui sotto.

## Come si scrive una nota nuova

- Il lavoro finito scrive la sua nota **in fondo al file del suo argomento**, con un titolo `## ` che dice cosa, quando
  e quale scheda (come le note di adesso), e aggiunge **una riga** nell'indice qui sotto, sotto quel file: l'inizio
  esatto del titolo, (data, scheda) e al massimo sei parole. Nell'indice niente nomi di funzioni, numeri o stato
  («IN PROD», deploy): stanno nella nota. Il 16/11/2026 l'indice era arrivato a 23 KB su 35 ed è stato riportato a
  una riga per nota.
- **La nota è corta: 5 o 6 righe** (sua decisione del 16/11/2026). Dice tre cose: cosa cambia, dove sta nel codice
  (il nome della funzione o della classe) e la trappola. Il perché lungo sta nel commento ⚠️ del codice e nel
  messaggio del commit: qui non si ripete. Dal 1 al 16/11 le note erano in media di 31 righe. Quelle già scritte
  restano come sono.
- Una correzione a una fonte si scrive dentro la scheda della sua regione in `CLAUDE-fonti.md` (sotto
  «Architettura dati per regione»), come si è sempre fatto, non in fondo.
- In questo file non entrano note di lavoro: solo regole che valgono sempre e righe d'indice. Una regola nuova entra
  qui solo se vale per ogni lavoro, e con il suo sì.
- Se l'argomento non c'è, si sceglie il file più vicino. Un file nuovo si apre solo se l'argomento è grosso, e con il
  suo sì.

---

## Indice: dove sta ogni sezione

Una riga per nota. Il testo prima della prima parentesi o dei due punti è l'inizio ESATTO del titolo:
`grep -n "^## <quel testo>" <file>` dà la riga, e si legge solo quella sezione. Le date sono del 2026, il numero
dopo la data è la scheda. I file stanno tutti qui in radice, accanto a questo.

### `CLAUDE-fonti.md`: le fonti dati, regione per regione

- Architettura dati per regione: una scheda per regione e Stato (collector, formula, orari, trappole)
- Bug risolti (cronologico): i bug dei collector di giugno e luglio
- Coerenza fra reti confinanti (4/8): `check-confini.js`, le gemelle al confine
- La quota delle stazioni (26/8): altitudini mancanti o sbagliate
- La direzione del vento (2/10): il campo `wd`
- Togliere Open-Meteo (dal 25/10): il piano pezzo per pezzo

### `CLAUDE-mappa.md`: l'interfaccia della mappa

- UI Features: le funzioni da luglio al 1/11, una per voce
- Inquadratura su telefono (9/8): la centratura delle regioni, la corsa dei 50 ms
- L'etichetta del tasto posizione (30/8)
- I pallini di partenza (30/8): le stazioni all'apertura
- «Diretta radar» in produzione (31/8): il modo radar
- La scheda «Iscriviti» e il ringraziamento (31/8)
- L'intensita' della pioggia (12/9): il campo `i`, le ore bagnate
- La mappa boschi (21/9)
- La barra in basso sul telefono (20/9)
- La forma dei tasti e la barra che scorre (31/10, 104 ter)
- La foto dal satellite sotto la pioggia (31/10, 104): foto nostra fino allo zoom 10, Esri da vicino
- Il riquadro della pioggia al telefono (31/10, 104)
- Telefono girato, crediti al telefono (1/11, 106)
- La velocita' della pioggia dopo le date (1/11, 106 bis)
- Telefono dritto con la tastiera (2/11, 109 quater)
- La scheda del pluviometro col telefono girato (2/11, 109 quater)
- Le macchie squadrate sul mare (2/11, 111 quater)
- Le date sotto i periodi andavano a capo (2/11, 114)
- La pioggia non si spegne piu' zoomando (3/11, 116)
- Il tetto di zoom (3/11, 116)
- Le tessere che arrivavano in ritardo zoomando (4/11, 117)
- La barra delle citta' (4/11, 118)
- La cassetta dei video (4/11, 119): la vetrina dei video, la pillola
- Il video nuovo entra in un quarto d'ora (4/11, 120 bis)
- La scheda «Iscriviti» del computer (4/11, 121): la foto di Archie
- La pillola del telefono gira (4/11, 121)
- Due chiavi Esri (7/11, 126 bis)
- I nomi dei paesi fra due zoom interi (7/11, 126)
- Esri da vicino non chiede più tessere (7/11, 126)
- L'ombra delle icone del meteo (8/11, 127 bis)
- Etichette del meteo, testata del telefono (8/11, 127 bis)
- Il radar si apre col +40 minuti (8/11, 128 ter)
- Il riquadro dei periodi e i crediti al telefono (8/11, 128 bis): niente salti all'apertura
- Le pulsazioni dei tasti (8/11, 128 bis)
- Il pizzico nelle previsioni di regione (8/11, 128 bis)
- I nastri che scorrono (8/11, 128 bis)
- Le etichette del meteo fuori dal gioco (8/11, 128 bis): durante il pizzico
- I crediti del radar (9/11, 130): Radar-DPC
- Al telefono giallo e pillola a turno (12/11, 131)
- Il radar in un giro solo (13/11, 133): da -2 ore a +40 minuti
- Il riquadro del pluviometro al tocco (16/11, 134)

### `CLAUDE-pagine.md`: le pagine del sito (regioni, zone, funghi, SEO)

- Riepiloghi delle pagine regione (24/8)
- «Diretta radar» sulle 1.085 pagine (3/9)
- Il ritratto del pluviometro (4/9): testi diversi per l'indicizzazione
- Le due categorie di pagine (13/9): piogge e funghi non si mescolano
- La vetrina si configura da un file di dati (20/9)
- Zone piogge e zone funghi anche meteo (19-20/10)
- La testata del sito (28/10): `lib-testata.js`
- Controllo SEO del 31/10/2026 (104 bis): le parole di sei famiglie
- Correzioni del 1/11/2026 (105 bis): l'elenco «DA FARE SENZA URGENZA»
- Le citazioni volgari nei commenti (2/11, 109)
- Le strisce delle regioni lunghe intere (2/11, 111 bis)
- I commenti fuori dalle pagine generate (2/11, 112 quater)
- Il rinnovo mensile delle pagine (2/11, 113)
- Il togli-commenti controlla (2/11, 114)
- La riserva della vetrina (4/11, 119)
- Il freddo nelle pagine funghi (6/11, 125): la pausa invernale da fare prima del 21/12
- Le prossime notti e la notte più fredda (6/11, 125)
- La notte più fredda anche nella classifica (7/11, 126)
- Le pagine che non saltano mentre caricano (8/11, 128)
- La modalità evento delle pagine regione (13/11, 132): «Maltempo»

### `CLAUDE-previsioni.md`: le previsioni meteo

- Pagine «Previsioni meteo <zona>» (24/10): anche le «Meteo <paese>»
- `/previsioni/`: la mappa delle previsioni (28/10)
- Previsioni senza regione: la vista Italia (27/10)
- Lo sfarfallio aprendo le previsioni (1/11, 108)
- Lo zoom minimo delle cartine delle pagine meteo (2/11, 109)
- I confini coi link di una regione (2/11, 109 quater)
- Lo zoom minimo della cartina delle pagine «adesso» (2/11, 110 bis)
- Il radar delle pagine «adesso» sulla foto (2/11, 111 ter)
- La fase B delle previsioni (2/11, 112 ter)
- «Ieri a Caronia» era la pioggia di Pomiere (2/11, 113)
- Il credito della probabilita' di pioggia (3/11, 114)
- Le previsioni da vicino a un quarto delle tessere Esri (3/11, 116)
- Le pagine meteo con la foto nostra (3/11, 116)
- Le pagine «adesso» delle città, prima ondata (4/11, 118 bis)
- La previsione di riserva quando MET manda il JSON tagliato (4/11, 118 bis)
- La riserva per tutti i punti quando MET risponde 503 (4/11, 122)
- Minima e massima (6/11, 125)
- Le pagine «adesso» delle città a ondate (5/11, 124)
- La settimana a goccia (7/11, 127)
- Il radar delle città «adesso» (8/11, 127)
- Il radar delle regioni «adesso» (8/11, 127)
- Il riquadro «Pluviometri 7 giorni» (8/11, 128 quater)
- Le altre quattro del censimento delle cartine (8/11, 128 quater)
- La vista Italia ingrandita (8/11, 129)
- Le pagine «adesso» non chiedono il radar (9/11, 130)
- Il radar delle pagine «adesso» e delle pagine meteo (9/11, 130): il «+40» in movimento
- La goccia a 10 al giorno (9/11, Goccia): la terza ondata
- Il pallino «IN DIRETTA» (9/11, 130)
- La % di pioggia ora per ora (9/11, 130)

### `CLAUDE-sorveglianza.md`: la sorveglianza automatica e i check

- Resilienza a GitHub raw (17/8)
- Sorveglianza automatica (31/7): buchi, allarme fonti, pluviometri fermi, guardiano
- Check periodico dati: cosa si controlla ogni ~5 giorni
- Sesto check (20/10)
- «Da guardare» del settimo e ottavo check (21/10)
- La mail «RIENTRATA» di check-fonti (2/11, 113)
- meteohub-gaps non salvava niente (2/11, 114)
- Due piccoli dei buchi dal check-10 (2/11, 114)
- La mail dei campi spariti (3/11, 115 bis)
- Pluviometri fermi DA POCO (8/11, 127)
- La spia dei doppioni (8/11, 129 bis)

### `CLAUDE-prod-e-test.md`: prod e test, migrazioni e promozioni, la ricetta del pubblicare

- Migrazione Italia v5.0 (1/8)
- Promozione a non-BETA (18/7, v4.0)
- Promozione del 27 agosto 2026 (v9.1): come si porta il test in prod
- ⚠️ TEST E PROD NON SONO PIÙ (31/8): mai copiare `index.html` dal test
- I commenti fuori dalla copia pubblicata (8/11, 127 ter): online ≠ repo byte per byte

---
