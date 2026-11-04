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
  e quale scheda (come le note di adesso), e aggiunge **una riga** nell'indice qui sotto, sotto quel file: titolo
  esatto e due parole.
- Una correzione a una fonte si scrive dentro la scheda della sua regione in `CLAUDE-fonti.md` (sotto
  «Architettura dati per regione»), come si è sempre fatto, non in fondo.
- In questo file non entrano note di lavoro: solo regole che valgono sempre e righe d'indice. Una regola nuova entra
  qui solo se vale per ogni lavoro, e con il suo sì.
- Se l'argomento non c'è, si sceglie il file più vicino. Un file nuovo si apre solo se l'argomento è grosso, e con il
  suo sì.

---

## Indice: dove sta ogni sezione

Una riga per sezione, col titolo ESATTO del file: `grep -n "^## <inizio del titolo>" <file>` dà la riga, e si
legge solo quella sezione. I file stanno tutti qui in radice, accanto a questo.

### `CLAUDE-fonti.md`: le fonti dati, regione per regione (123 KB)

- **Architettura dati per regione**: una scheda per regione e Stato: collector, formula, orari, trappole. Dentro: Lombardia · Piemonte · Emilia Romagna · Veneto · Trentino · Alto Adige · Toscana · Liguria · Austria · Francia intera · Svizzera intera · Ticino · Centro-Sud via MeteoHub · Abruzzo · Valle d'Aosta · Friuli Venezia Giulia · Slovenia.
- **Bug risolti (cronologico)**: i bug dei collector di giugno e luglio 2026, numerati
- **Coerenza fra reti confinanti (4 agosto 2026)**: `check-confini.js`, le gemelle al confine
- **La quota delle stazioni (26 agosto 2026)**: altitudini mancanti o sbagliate, terrarium
- **La direzione del vento: campo `wd` (2 ottobre 2026)**: da dove viene il vento, salvato dal 2/10
- **Togliere Open-Meteo (dal 25/10/2026)**: il piano pezzo per pezzo e a che punto è

### `CLAUDE-mappa.md`: l'interfaccia della mappa (121 KB)

- **UI Features**: le funzioni una per voce, dalle più nuove (1/11) alle più vecchie (luglio): ore meteo in orizzontale, finestre «Novità», invito alle previsioni, Mappa|Satellite, grafici stazione, crediti, anteprima social, multiregione, centratura, foto condivisa
- **Inquadratura su telefono — metodo di misura, strumenti e stato (9 agosto 2026)**: come si misura la centratura delle regioni, la corsa dei 50 ms
- **L'etichetta del tasto posizione (30 agosto 2026, v9.2)**: il tasto «La mia posizione» e i suoi numeri GA4
- **I pallini di partenza e le due voci rimaste aperte (30 agosto 2026)**: le stazioni disegnate all'apertura, quote del Piemonte
- **«Diretta radar» in produzione (31 agosto 2026, v9.3)**: il modo radar della mappa
- **La scheda «Iscriviti» e il ringraziamento (31 agosto 2026)**: la pillola «Iscriviti» al PC e al telefono
- **L'intensita' della pioggia: ore bagnate e punta oraria (12 settembre 2026)**: il campo `i` dei file giornalieri, e perché la stessa pioggia in otto ore vale di più
- **La mappa boschi (v10.2, 21 settembre 2026)**: carte forestali in dieci colori, legenda, tocco sul bosco, licenze, collaudo
- **La barra in basso sul telefono (v10.1, 20 settembre 2026)**: la mappa dal 33% al 61% dello schermo, la legenda ridotta
- **La forma dei tasti e la barra che scorre nella pioggia (31/10/2026, scheda 104 ter)**: i tasti della pioggia nella forma di «Previsioni», la barra delle città
- **La foto dal satellite sotto la pioggia e nelle previsioni (31/10/2026, scheda 104)**: foto nostra fino allo zoom 10, Esri da vicino
- **Il riquadro della pioggia al telefono e il banner del meteo (31/10/2026 sera, scheda 104)**: gli spazi misurati del riquadro in basso sotto i 600 px, il banner del meteo
- **Telefono girato, crediti al telefono e blocco rosso del meteo (1/11/2026 sera, scheda 106)**: la pioggia col telefono in orizzontale, i crediti sopra il riquadro, «METEO» + giorno
- **La velocita' della pioggia dopo le date (1/11/2026 sera, scheda 106 bis)**: il calcolo dei colori 20-50 volte più veloce, niente velo grigio sulla foto, foto precaricata con la sfocata sotto, niente OSM sotto la foto (credito OSM tenuto)
- **Telefono dritto con la tastiera, barra della Sicilia e angoli del telefono girato (2/11/2026, scheda 109 quater)**: classe `schermo-dritto` (niente zoom 19 con la tastiera), scheda del pluviometro senza pallino, angoli del riquadro girato
- **La scheda del pluviometro col telefono girato (2/11/2026, scheda 109 quater)**: la scheda finisce sopra la barra delle città e scorre dentro, non esce più dallo schermo
- **Le macchie squadrate sul mare della foto dal satellite (2/11/2026, scheda 111 quater)**: il mare delle coste lo decide la carta ESA WorldCover, il ghiaccio azzurrino di Blue Marble, jsDelivr da riscaldare tutto
- **Le date sotto i periodi andavano a capo al telefono a cavallo dei mesi (2/11/2026, scheda 114, check-10)**: «dal 26/10» e niente a capo
- **La pioggia non si spegne piu' zoomando e trascinando (3/11/2026, scheda 116)**: la tela piu' grande dello schermo segue zoom, pizzico e trascinamento
- **Il tetto di zoom: pioggia 13, previsioni 14, boschi e satellite 19 (3/11/2026, scheda 116)**: `setMaxZoom` a ogni cambio di modo
- **Le tessere che arrivavano in ritardo zoomando e il tremolio trascinando: tessere d'arrivo subito e respiro fermo nel moto (4/11/2026, scheda 117)**: due regole di Leaflet in `_fotoNostra`, `respiroT0`
- **La barra delle citta': solo pluviometri veri, niente scritta finta all'apertura, niente barra senza citta' (4/11/2026, scheda 118)**: `stima(s)`, `scrivi()` aspetta `capoluoghi`, `serve()` con `NV.length`

### `CLAUDE-pagine.md`: le pagine del sito (regioni, zone, funghi, SEO) (75 KB)

- **Riepiloghi delle pagine regione (24 agosto 2026)**: i numeri delle pagine regione calcolati prima, non dal browser
- **«Diretta radar» sulle 1.085 pagine, e il segnaposto nei link (3 settembre 2026)**: il blocco «Sta piovendo adesso?» col tasto al radar su 1.085 pagine
- **Il ritratto del pluviometro, e perche' e' una faccenda di indicizzazione (4 settembre 2026)**: le 948 pagine di località e le 114 di zona con testi diversi l'una dall'altra
- **Le due categorie di pagine (13 settembre 2026)**: piogge e funghi non si mescolano (sua decisione)
- **La vetrina si configura da un file di dati (20 settembre 2026)**: la vetrina si cambia in un file di dati, senza pubblicare
- **Zone piogge e zone funghi anche meteo (19-20 ottobre 2026)**: `meteoClient` nelle zone, solo ES5
- **La testata del sito e le idee delle pagine meteo su tutte le famiglie (28/10/2026 sera)**: `lib-testata.js` e le idee delle pagine meteo portate sulle altre famiglie
- **Controllo SEO del 31/10/2026 (scheda 104 bis): le parole di sei famiglie**: Search Console 3-30/10 e le sei correzioni di titoli e testi
- **Correzioni del 1/11/2026 (scheda 105 bis, dopo l'analisi delle famiglie di pagine)**: `/slovenia/` tolta, stime dichiarate, e l'elenco «DA FARE SENZA URGENZA»
- **Le citazioni volgari nei commenti delle pagine (2/11/2026, scheda 109)**: i commenti del CSS delle pagine sono pubblici, le sue frasi si parafrasano
- **Le strisce delle regioni lunghe intere, e la pagina di paese della guida (2/11/2026, scheda 111 bis)**: anteprime allungate in altezza in `genera-anteprime.js` (regioni lunghe intere nei riquadri), boschi di 4 regioni, `guida/scheda-paese.jpg` e il suo elenco
- **I commenti fuori dalle pagine generate (2/11/2026, scheda 112 quater)**: `lib-senza-commenti.js` scrivendo le pagine non modello (-24,5% compresse); le pagine modello (regioni, funghi regione, Garfagnana) restano coi commenti
- **Il rinnovo mensile delle pagine non era mai partito: ora prova dal 2 al 6 (2/11/2026, scheda 113)**: cron `2-6` + `gia-fatto` sul mese
- **Il togli-commenti controlla che lo script si legga ancora (2/11/2026, scheda 114, check-10 B7)**: se togliendoli lo script si rompe, restano i commenti

### `CLAUDE-previsioni.md`: le previsioni meteo (59 KB)

- **Pagine «Previsioni meteo <zona>» (/meteo/<zona>/, 24/10/2026)**: `/meteo/<zona>/` e le pagine «Meteo <paese>»
- **`/previsioni/`: la mappa delle previsioni con un indirizzo suo (28/10/2026)**: titolo, descrizione e canonico suoi; il sottodominio `meteo.` scartato
- **Previsioni senza regione: la vista Italia (27/10/2026)**: la vista Italia, poi icone, vista a etichette, controlli del 30-31/10
- **Lo sfarfallio aprendo le previsioni dalla home (1/11/2026 sera, scheda 108)**: la foto della pioggia fuori da `apre-italia`, coperta col CSS in testa
- **Lo zoom minimo delle cartine delle pagine meteo (2/11/2026, scheda 109)**: non piu' fino al planisfero, al massimo 4 livelli sotto l'inquadratura
- **I confini coi link di una regione e la scheda della sera (2/11/2026, scheda 109 quater)**: confini nascosti sotto `apre-vista`, «stasera» dopo le 20, niente DOM 8 acceso la sera
- **Lo zoom minimo della cartina delle pagine «adesso» (2/11/2026, scheda 110 bis)**: un tocco del «−» sotto l'inquadratura, l'Europa del radar, non piu' il planisfero
- **Il radar delle pagine «adesso» sulla foto della mappa (2/11/2026, scheda 111 ter)**: foto nostra, confine bianco e nomi come la mappa col radar, zoom fino al 10, ripiego sulla cartina
- **«Ieri a Caronia» era la pioggia di Pomiere: il punto di stamattina coi pluviometri fuori dal paese (2/11/2026, scheda 113)**: con `primo` il punto dice dove e' stata misurata la pioggia
- **Il credito della probabilita' di pioggia solo in fonti.html (3/11/2026, scheda 114)**: via dalla scheda, dalle 89 pagine meteo e dalla guida
- **La fase B delle previsioni: i link su /previsioni/ e 20 «Meteo <paese>» nuovi (2/11/2026, scheda 112 ter)**: i numeri delle pagine meteo, i link da `?m=prev` a `/previsioni/?r=`, `METEO_PAESI_B` scelti dalle ricerche «meteo <paese>»
- **Le previsioni da vicino a un quarto delle tessere Esri (3/11/2026, scheda 116)**: dallo zoom 11 come la pioggia, 512 px e zoomOffset -1
- **Le pagine meteo con la foto nostra fino allo zoom 10 (3/11/2026, scheda 116)**: `fotoSat` nelle 89 pagine di zona e di paese, Esri a un quarto da vicino
- **Le pagine «adesso» delle città, prima ondata: 24 capoluoghi (4/11/2026, scheda 118 bis)**: `/<regione>/adesso/<città>/`, `CITTA_ADESSO`, pluviometri vicini cotti ogni mattina, `sitemap-adesso-citta.xml`
- **La previsione di riserva quando MET manda il JSON tagliato (4/11/2026, scheda 118 bis)**: `riserva` in `perPunto`, 12 ore senza data, 5 minuti nella cache normale, niente chiamate in più a MET

### `CLAUDE-sorveglianza.md`: la sorveglianza automatica e i check (35 KB)

- **Resilienza a GitHub raw (17 agosto 2026)**: l'incidente del 17/8 e i ripieghi quando raw non risponde
- **Sorveglianza automatica (31 luglio 2026)**: buchi, allarme fonti via mail, pluviometri fermi, guardiano, campi che spariscono
- **Check periodico dati**: cosa si controlla ogni ~5 giorni
- **Sesto check (20/10/2026)**: difetti dei workflow e dati riparati
- **«Da guardare» del settimo e ottavo check (21/10/2026)**: tempi massimi, conflitti di push, i 13 punti aperti
- **La mail «RIENTRATA» di check-fonti diceva la data sbagliata (2/11/2026, scheda 113)**: «Allarme partito il», buchi lievi spiegati
- **meteohub-gaps non salvava niente se ICON-2I non si leggeva (2/11/2026, scheda 114, check-10)**: l'errore ICON e' un avviso, il commit parte
- **Due piccoli dei buchi dal check-10: chiusure a 20 giorni e quota delle stime (2/11/2026, scheda 114)**: B3 e B4, scartati B2 e B6
- **La mail dei campi spariti suonava per un giro in ritardo: ora guarda l'altro ieri (3/11/2026, scheda 115 bis)**: mail solo per buchi certi, 2 invece di 5

### `CLAUDE-prod-e-test.md`: prod e test, migrazioni e promozioni (8 KB)

- **Migrazione Italia v5.0 (1 agosto 2026)**: le 22 regioni, il centro-sud via MeteoHub, il piano di uscita dal beta
- **Promozione a non-BETA**: la v4.0 del 18/7/2026
- **Promozione del 27 agosto 2026 (v9.1)**: come si porta il test in prod contando le chiavi solo-prod
- **⚠️ TEST E PROD NON SONO PIÙ «PROD + QUATTRO RIGHE» (31 agosto 2026)**: mai copiare `index.html` dal test: si portano i pezzi uno per uno

---
