# CLAUDE-mappa.md: l'interfaccia della mappa

Pezzo del `CLAUDE.md` del repo, diviso per argomento il 1/11/2026 (scheda 107, sua scelta). **Prima si legge il
`CLAUDE.md`**: le regole che valgono sempre e l'indice di tutti i file. Qui sotto le sezioni sono quelle di prima,
tali e quali e nello stesso ordine: quando una nota dice «più su», «qui sotto» o «in fondo al CLAUDE.md», la sezione
può stare in un altro file, e il titolo si trova nell'indice del `CLAUDE.md`.

Per arrivare a una sezione: `grep -n "^## \|^### " CLAUDE-mappa.md`, poi si legge da quella riga.
**Le note nuove di questo argomento vanno IN FONDO a questo file**, con una riga nell'indice del `CLAUDE.md`.

Sezioni:

- UI Features
- Inquadratura su telefono — metodo di misura, strumenti e stato (9 agosto 2026)
  - Come si misura (il metodo giusto, imparato a caro prezzo)
  - Strumenti (cartella claudio, fuori dal repo)
  - La corsa dei 50ms (trovata l'8/8, chiusa il 9/8 — commit `355e9a00`)
  - Stato e limiti (dopo gli interventi del 9/8)
- L'etichetta del tasto posizione (30 agosto 2026, v9.2)
  - La correzione: il tasto dichiara lo stato del permesso
  - ⚠️ TUTTO SU UNA RIGA SOLA, e non e' un vezzo
  - Due trappole
  - Collaudo
  - La promozione
- I pallini di partenza e le due voci rimaste aperte (30 agosto 2026)
  - 1. I pallini di partenza erano NOMI DI PAESI
  - 2. «La mappa disegna meno stazioni di quante ne conta»: non e' un difetto
  - 3. Due pluviometri allo stesso identico punto: le Giralda
- «Diretta radar» in produzione (31 agosto 2026, v9.3)
  - Le cose da sapere se ci si torna
- La scheda «Iscriviti» e il ringraziamento (31 agosto 2026)
- L'intensita' della pioggia: ore bagnate e punta oraria (12 settembre 2026)
  - La libreria, e perche' ce n'e' una
  - Chi ce l'ha e chi no
  - La chiave dell'ora, rete per rete
  - ⚠️ La trappola che ha morso, e che mordera' ancora
  - Come si e' collaudato
  - La scala, quando si mostrera'
- La mappa boschi (v10.2, 21 settembre 2026)
  - 🔵 IL DECIMO COLORE: «carpino nero, orniello e aceri» (21 settembre 2026)
  - ⚠️ IL CONTROLLO A TAPPETO, E PERCHE' ESISTE
  - ⚠️ LA LEGENDA TAGLIATA SU FINESTRA BASSA (21 settembre 2026)
  - Altri due difetti della legenda, trovati da lui lo stesso giorno
  - Dove sta la roba
  - I nove gruppi
  - Il tocco sul bosco
  - La tendina pioggia | boschi
  - Altre cose della v10
  - Licenze e fonti
  - Come si collauda
- La barra in basso sul telefono (v10.1, 20 settembre 2026)
  - Cosa se ne va quando la legenda e' ridotta
  - La regola dello stato (dettata dall'utente dopo la prova dal telefono)
  - La maniglia, e perche' non basta il trattino grigio
  - ⏱ LA RIDUZIONE AUTOMATICA E' STATA TOLTA (21 settembre 2026)
  - Il pannello periodo: 287 → 241 px
  - Il ricentro, che e' la meta' del lavoro
  - La nuvoletta della tendina rubava il gesto
  - Come si collauda
  - Allineamento test/prod fatto quel giorno
- La forma dei tasti e la barra che scorre nella pioggia (31/10/2026, scheda 104 ter)
- La foto dal satellite sotto la pioggia e nelle previsioni (31/10/2026, scheda 104)
- Il riquadro della pioggia al telefono e il banner del meteo (31/10/2026 sera, scheda 104)
- Telefono girato, crediti al telefono e blocco rosso del meteo (1/11/2026 sera, scheda 106)
- La velocita' della pioggia dopo le date (1/11/2026 sera, scheda 106 bis)

---

## UI Features
- **Le ore della scheda meteo IN ORIZZONTALE al telefono (1/11/2026, scheda 105 ter)**, suo dal telefono sull'anteprima:
  «una striscia piccolissima, si vede un'ora alla volta» e «lo scorrimento si e' bloccato, ho dovuto cambiare giorno».
  Misurato a 393×717: scheda al 40% = 269 px, alle ore ne restavano 51 (1,9 righe); il «blocco» era la lista di OGGI che
  finisce alle 23 senza nessun segno. Tre proposte coi grandi (Windy, Meteo di Apple, Google; 3B ha la pagina intera),
  scelta la A. In `renderDet`, solo con `tel()` (fino a 900 px; al PC resta la tabella, suo: «se sono 5 ore minimo
  lasciamo il verticale su pc»): una colonna per ora (`.oriz`/`.et`/`.oz`/`.c`), tutti i giorni di seguito separati da
  una colonnina blu verticale (`.gs`), giorni in cima su tre righe («MAR 3», `chip(...,corto)`). `striscia()`: apre sul
  giorno scelto, scorrendo accende il giorno letto (la mappa resta sul giorno scelto), in fondo l'ultimo. Ore a vista:
  393×717 7,1 (prima 1,9), 360×640 6,4, girato 740×360 5,8 (prima 0), tablet 14,9. Insieme:
  - **la scheda non si riscrive sotto il dito** (rinfresco dei 10 minuti, etichette dopo uno spostamento): col dito
    appoggiato si aspetta che si stacchi (`ditoSu`, 350 ms), e ridisegnando lo stesso posto e giorno la posizione resta;
  - ⚠️ **ai bordi della striscia il gesto si consuma** (`preventDefault` sul touchmove orizzontale): un dito di lato senza
    niente da scorrere era «pagina precedente» del browser (popstate → la scheda di prima, poi fuori dal sito; c'era anche
    con la tabella). `overscroll-behavior` NON lo ferma, nemmeno su html/body. `touch-action:pan-x` sulla striscia;
  - col mouse (finestra stretta, tablet col mouse): rotellina, trascinamento e una barra sottile (`(hover:hover) and
    (pointer:fine)`); la scheda non scende sotto 268 px (`max(40%,268px)`, sotto i 700 px di altezza 258);
  - sotto i 900 px col mouse il pie' di pagina (`.fonte`, `.fonte-reg`) si toglie come al telefono: a 820×706 la mappa
    passa da 598 a 668 px (suo «toglilo»);
  - telefono girato: «💧 Storico» accanto a «× Chiudi» (`.sto`), niente riga sotto il nome.
  Resta com'era: 915×412 (disegno da PC, piede della scheda fuori di 47 px). Attrezzi e mockup nel banco,
  `mockup-meteo-ore\` (`patch-a.py`, `attrezzi\prova-patch-a.js`, `prova-barra.js`, `prova-piede.js`; il dito finto che
  scorre davvero e' `Input.dispatchTouchEvent`, `dito.js`).
- **Finestra «Novità» 30/10/2026 (VERSIONE `2026-10-30`, NV_FINO `2026-11-08T21:00`: domenica 8/11 alle 21), sua
  richiesta: far conoscere la NUOVA SEZIONE METEO** («hai visto la nuova sezione meteo? fai un giro nella nostra nuova
  sezione meteo»). Una pagina, «Hai visto la nuova sezione meteo?», filmato `novita/meteo.mp4` (~9 s, 786x1056, da
  `registra-meteo-novita.js` nel banco): l'inizio del film verticale della home (l'Italia scura, i pluviometri che si
  accendono, da `apertura-v-1080.mp4`) che si dissolve nella mappa delle previsioni con la STESSA inquadratura (centro
  42,0 12,55, zoom 6,85 a 1080 px = 5,50 a 393 px CSS), A TUTTA MAPPA col banner in fondo (testata, riquadri e controlli
  nascosti solo nel filmato); poi a stacchi la Toscana, il dito che tocca Siena (cerchio del tocco solo nel filmato) e
  la sua scheda con le ore (al 55%, senza il piede). Due versioni bocciate: la prima (freccia sulla linguetta, scheda
  ora per ora a schermo stretto: «dimmi dov'e' la mappa? quella striscia di 2 cm?») e la seconda con le scritte
  «Regione per regione» e «Paese per paese» («e' ovvio che un sito meteo ha tutti i paesi... devi far vedere anche
  senza frasi come uno naviga e apre le previsioni»). Due scritte sole: «Migliaia di pluviometri» · «Ora anche le
  previsioni». Bottoni «Chiudi» (`fine`) e GIALLO «☀️ Vai alle previsioni» (sotto i 440 px senza il sole; `vai.prev`,
  `#nv-gioca.prev`); a filmato finito pulsa solo il giallo:
  chiude la finestra e preme la linguetta «Previsioni» (`#sez-prev`), nella stessa pagina; GA `novita_finestra`
  azione=`previsioni`. **DUE VOLTE** (suo: «alla prima chiusura torna a una visita successiva, alla seconda chiusura non
  appare piu'»): con una pagina sola (`BIS`) la visita dopo (`RIM_DOPO`, 30') rivede la stessa pagina (`seconda`), poi
  `novitaVista` = VERSIONE. Chi arriva da un link resta rimandato come prima. **Non si apre sopra le previsioni gia'
  aperte** (`aperte()`: `_prevAttivo` o `apre-prev`), e in quel caso non segna niente. Prova dei 22 casi (due volte,
  bottone, link, `?m=prev`, `/previsioni/`, `?novita=1/0`, scadenza con l'orologio finto) su 393, 360 e PC:
  `prova-novita-meteo.js` nello scratchpad della scheda 102. ⚠️ In locale la pagina chiede le previsioni alla 8788:
  aperta come `http://prova.localhost:8790/` le chiede a se stessa (e il satellite funziona). Le cerrete sono uscite.
- **Invito alle previsioni nello storico (30/10/2026, scheda 102)**, sua domanda («ha senso una pubblicita' al meteo nella
  vetrina?»): non nella vetrina (sembra un video e toglie posto al canale), ma un bottone giallo «E nei prossimi giorni?
  ☀️ Previsioni <posto> →» nel riquadro dei numeri, dopo QUALUNQUE periodo scelto, con regione, valle o paese cercati
  (modulo «INVITO ALLE PREVISIONI NELLO STORICO» in `index.html`). **Sopra i 600 px sempre** (li' la pillola del video
  non c'e'). **Al telefono al posto di `#channel-pill`** (`body.inv-prev-on`): per chi le previsioni non le ha mai aperte
  su quel telefono (`localStorage.prevUsate`, la mette `entra()` delle previsioni da qualunque strada) sempre; per gli
  altri e' una voce in piu' del giro della vetrina (suo, 30/10 sera: «ci sono 4 o 5 video e questo si aggiunge nel
  ciclo»): la vetrina aggiunge `'previsioni'` alle sue scelte se `window._invitoNelGiro()`, e quando tocca a lei
  (`window._vetrinaQuale`) non disegna il video. Con 8 video in giro l'invito torna una volta ogni 9. Prova
  `prova-invito-giro.js` nello scratchpad della scheda 102: telefono 3/3, PC 2/2. Posto:
  paese o valle cercati (mai la posizione del GPS), se no una o due regioni (testo della tendina), se no niente nome.
  Una riga sola a gradini (`adatta()`): via la domanda, poi via il nome. Il tocco preme `#sez-prev`. Niente invito col
  radar, coi boschi o col riquadro ridotto. GA `invito_previsioni` {azione: visto (una volta per visita) / tocco, dove}.
  Mockup (tre varianti, scelta la A): banco `mockup-invito-storico\`. Prova `prova-invito.js` nello scratchpad della
  scheda 102: 12/12 a 393 e 360, 11/11 al PC.
- **Finestra «Novità» 26/10/2026 (VERSIONE `2026-10-26`, NV_FINO `2026-11-01T21:00`: domenica alle 21, ora del
  telefono; da questa volta NV_FINO porta anche l'ora)**, sua richiesta: un GRAZIE che spinge il
  canale, con la novita' delle cerrete. Una pagina, «Mappa dei boschi: arrivano le cerrete», filmato `novita/cerrete.mp4`
  (9,5 s, suo «se no la gente skippa»: l'inizio del film verticale della home accelerato fino ai boschi sull'Italia intera,
  poi lo zoom rifatto col bordeaux; montato da `archivio\2026-10-25\monta-cerrete.py` nel banco), tre scritte («Siete
  tantissimi. Grazie!» · «Novità: le cerrete hanno un colore loro» · «Ti è utile? Sostienici su YouTube») e bottone ROSSO
  «▶ Iscriviti su YouTube» (`pg.vai.yt`, `?sub_confirmation=1`, evento `click_youtube` pulsante `novita`) accanto a «Vai
  alla mappa». Tolta la frase «per portarti nei posti giusti» (promette funghi).
- **Finestra «Novità» 20/10/2026 (VERSIONE `2026-10-20`), sua richiesta: UNA pagina sul quiz tartufi**, «Hai già provato il quiz dei tartufi?» con la targa «Ora anche Lombardia, Piemonte, Emilia-Romagna e Liguria». Immagine FISSA al posto del filmato (`pg.img`, `novita/quiz-regioni.jpg`, scelta della regione presa dal sito del quiz, `object-fit:contain` su sfondo marrone: col ritaglio sparivano le regioni in fondo) e bottone verso fuori (`pg.vai`): «Gioca al quiz →» arancione `#e8891c` che pulsa, apre il quiz in una scheda nuova e chiude la finestra (GA `novita_finestra` azione=`quiz`); anche un tocco sull'immagine apre il quiz. «Vai alla mappa» in secondo piano, i due bottoni in coppia uguali (regola delle simmetrie). **SCADE**: si apre da sola solo fino a `NV_FINO` compreso (`2026-10-27`, una settimana: suo «per un tempo limitato e poi sparisce»), data del telefono; dopo non si apre e non si rimanda, `?novita=1` la mostra sempre. Previsioni e satellite escono dalla finestra (i filmati restano in `novita/`). Patch e 32 prove (calendario spostato compreso): scratchpad della scheda «Quiz tartufi 3», `novita/patch-novita-quiz.py` e `prova-novita-quiz.js`.
- **Finestra «Novità» RIFATTA il 4/10/2026 (VERSIONE `2026-10-04`)**: DUE pagine, «Temperature di ieri» e «Satellite», e **UNA PER VISITA** (sua idea): alla prima visita solo la prima, a una visita nuova (almeno 30', `RIM_DOPO`) solo la seconda, poi mai più. `novitaVista` vale `VERSIONE|1|<ora>` dopo la prima e `VERSIONE` quando le ha viste tutte; `SEQ` = pagine di quell'apertura. La seconda si apre anche arrivando da un link (ormai conosce la mappa); la prima resta rimandata per chi arriva da link, come dal 2/10. `?novita=1` le mostra tutte di seguito. Filmati corti (`novita/temperature.mp4`, `novita/satellite-corto.mp4`, 786 px, ~3,5 Mbit/s), con una freccia rossa sul tasto e uno zoom CSS che parte dallo schermo intero (suo: «come fanno a sapere dov'è?»): li registra `registra-temperature.js` nel banco di lavoro (la freccia e lo zoom esistono solo nel filmato). I quattro filmati del 30/9 sono tolti. Prova dei 10 casi: `prova-novita-spezzata.js` (scratchpad della scheda 71). Il paragrafo qui sotto è la versione del 30/9.
- **Finestra «Novità» alla prima apertura** (30/9/2026, in PRODUZIONE dal 30/9 col resto del lavoro del test): modulo in FONDO a `index.html` (`#nv-velo`, z-index 12000). QUATTRO pagine nell'ordine suo: satellite (castagneto di Borzonasca, manopola, zoom 19 = massimo del sito sulle case di Santo Stefano d'Aveto col bosco sotto il dito), tocca un bosco, filtro di altitudine all'Abetone, e per ultima quota/versante/pendenza su un lariceto dell'Alpe di Siusi. Ogni pagina un filmato a tutta larghezza ripreso dal sito vero a misura di telefono (`novita/satellite-a|boschi|filtro|nuvoletta.mp4` + copertine `.jpg`; registrati con `registra-novita.js` nel banco di lavoro `D:/video youtube/claudio/`, fotogrammi a scala 2, zoom a STACCHI nitidi, mai animato: sfocava). Scritte SOPRA il filmato, nella parte bianca (suo: «uno o guarda sopra o sotto», prima legge poi guarda; sovrapposte coprivano legende e frecce), da slogan: titolo fisso e didascalia su TARGA BLU (sua scelta fra tre stili) che cambia coi «marchi» della registrazione (`<nome>-tempi.json`, montati da `build-novita.py` che rigenera il modulo da `novita-modulo.html` e copia i filmati). Finito un filmato si passa DA SOLI alla pagina dopo (1,2 s); sull'ultima ci si ferma sull'ultimo fotogramma e «Vai alla mappa» pulsa; un tocco sul filmato lo fa ripartire; «Indietro» e frecce della tastiera. Compare una volta sola: localStorage `novitaVista` = `VERSIONE` (oggi `2026-09-30`); **quando le novità cambiano si alza VERSIONE** e chi aveva visto le vecchie rivede le nuove. Solo su `/` senza parametri (chi arriva con un link vuole quella mappa), non in iframe, dopo che la mappa è pronta. `?novita=1` la riapre (rimando in `/guida/` sotto «Ultimi aggiornamenti»), `?novita=0` mai. Evento GA `novita_finestra` {azione: aperta/pagina/auto/indietro/chiusa/finita, pagina}. ⚠️ Le prove puppeteer devono segnare `novitaVista` prima di aprire la pagina (lo fa `collaudo-lib.js`), se no la finestra copre tutto.
- **Mappa|Satellite nei boschi** (in PRODUZIONE dal 30/9/2026, sviluppato sul test 28-29/9): nel pannello della mappa boschi «🛰 Satellite» ↔ «🗺 Torna alla mappa», foto Esri World Imagery sotto i boschi, manopola «Intensità boschi» (35% di partenza) e «Nascondi boschi», nomi dei paesi NOSTRI (`data/nomi-esteri-*.txt` per l'estero, da OpenStreetMap), zoom fino a 19. ⚠️ IN PROD IL SERVIZIO E' A CHIAVE: `SAT_FOTO`/`ANTE_SAT` puntano a `ibasemaps-api.arcgis.com/.../World_Imagery/MapServer/tile/{z}/{y}/{x}?token=…` (account ArcGIS Location Platform «avventuremicologiche», chiave con referrer prod/test/localhost, 2 milioni di tessere al mese gratis, oltre si ferma senza addebiti, **scade il 29/9/2027**); il test usa `server.arcgisonline.com` senza chiave. Sono le uniche righe, con og:image e twitter:image, in cui `index.html` di prod e del test differiscono. Il satellite si accende solo nei boschi e si spegne tornando alla pioggia; ogni sessione parte dalla cartina. Lo scatto Immagine porta la foto e i crediti Esri. Vedi la memoria «foto aerea sotto boschi».
- **Grafici stazione: scheda Umidità (18 agosto 2026, commit `a18a68e1`; test `4ef57277`).** Quarta scheda «💦 Umidità» con lo stesso grafico a linee della temperatura: **massima BLU** (la notte satura), **minima ARANCIO** (il secco del pomeriggio), scala in %, a decine, tetto 100. Campo compatto `u:[min,max]` % nei file giornalieri, con la stessa soglia di t/w (≥20 ore valide) e sanity 0-100. **Prima ondata, reti a costo zero** (l'umidità era già negli stessi record che scaricavamo): Piemonte (`humidity` oraria del realtime, ~128 stazioni; ripiego `umin/umax` dell'archivio ufficiale nel v2), Emilia (`umidita_minima/massima_giornaliera_2m` ARPAE, ~101 su 315: molti pluviometri puri), Austria (`rf` di klima-v2-1h, 258/267), Svizzera (`ure200h0` del CSV orario, 135: la sola rete SMN, la rete pluvio non ha l'igrometro), Francia (`u`/`un`/`ux` del pacchetto orario, ~28% delle stazioni). `UMID_HIST_FROM` = 18/8/2026 per queste cinque; per le altre reti il pannello resta prudente («non ha misurato in queste date»). **Seconda ondata FATTA lo stesso 18/8** (commit `b4eb0e3d`; test `1982cbdc`): Lombardia (terza anagrafe Socrata «Umidità Relativa» 220 sensori, stessa query oraria di t/w: 159/252 stazioni), Liguria (`/stations/Igro` 108 + `/charts/{code}/Igro`, una serie a 30' in %: 96/199), Toscana (pagina SIR `type=igro`, STESSO tracciato della termo, [8]/[10] oggi e [12]/[14] ieri: 205/379), Alto Adige (sensore `LF` 97 stazioni, in un try accanto a LT/WG: 53/57), MeteoHub (prodotto B13003, una query in più per rete/giorno: Marche 77/113, Sicilia 353/428). La legenda della scheda dice «umidità relativa dell'aria» (richiesta utente). ⚠️ Nel repo di test Alto Adige/Toscana/Liguria/MeteoHub non girano e i loro dati sono fermi a luglio: la prova vera è stata in prod coi run manuali. **Terza ondata FATTA la sera del 18/8 (sul test, poi promossa in prod lo stesso giorno):** Slovenia (pid 19/20 = min/max umidità dell'intervallo, nella stessa chiamata: +0,5 s a chiamata, 1,6 → 2,1 s; backfill dal 27/6 **a blocchi di 8 giorni**, perché la finestra intera con 7 variabili risponde 502; 84 stazioni su 115), OASI Ticino (parametro `RH` a 10', 6 stazioni), VdA (prid 2 «Umidità relativa» nella stessa chiamata oraria, 43/70, backfill dal 27/6), OSMER (colonna «Umidita' %» dello stesso CSV, ricaricati 53 giorni; ⚠️ l'archivio OSMER a volte risponde solo per ~14 stazioni su 51 in una passata, le altre le riprende il cron nella finestra), Veneto (sensore `UMID` a 30' negli stessi XML, 133/186, dal 17/8), **Trentino** (`getLastDataOfMeteoStation?codice=Txxxx`: serie a 15' di ieri e oggi con `relative_humidity_list` E `wind_list` con velocità MEDIA e raffica → 42 stazioni con umidità e **43 col vento**, che prima mancava del tutto; una chiamata per stazione a gruppi di 6 sul file di ieri, in try; date `+01` FISSO come ARSO; niente storico, dal 17/8; `trentino` tolto da `RETI_SENZA`). ⚠️ Le date di `UMID_HIST_FROM` sono quelle in cui i FILE hanno la `u`: 15/8 Piemonte, 16/8 Austria/Svizzera/Francia/Lombardia/MeteoHub, 17/8 Emilia/Liguria/Toscana/Alto Adige/Veneto/Trentino, 27/6 Slovenia/VdA/OSMER (Ticino segue la chiave svizzera). Nessuna rete a dati reali resta senza umidità; il **vento manca solo alla Toscana** (SIR pubblica pluvio/termo/igro/idro/nivo, MeteoHub non ha reti toscane: l'unica strada è LaMMA, via email). Copertura sul giorno più recente: temperatura 85% delle 5.729 stazioni, vento 33%, umidità 48% (tabella per rete nel report del 18/8). ⚠️ Solo umidità dell'ARIA: quella del terreno nelle reti pubbliche non esiste (solo modelli).
- **Grafici stazione: schede Temperatura e Vento (11 agosto 2026).** Il pannello
  stazione ha tre schede — 💧 Pioggia | 🌡 Temp (linee min/max) | 💨 Vento — su dati
  REALI di stazione: campi compatti `t:[min,max]` °C e `w:[media,raffica]` km/h
  dentro i file giornalieri esistenti, scritti dai collector solo con ore valide
  ≥20. Reti coperte dall'11/8: Austria (dal 2/7), Svizzera, Francia, Alto Adige,
  Ticino, VdA e Friuli (dal 27/6), Emilia (dal 27/7, finestra API), Lombardia
  (dal 28/6), Liguria (dal 28/7, finestra charts), Piemonte (dal 9/8) e Veneto
  (dal 9/8) — le due finestre API più corte, crescono un giorno al giorno;
  Trentino (dal 5/8, SOLO temperatura: l'API ha la sola raffica e senza media
  il grafico non disegna); le 10 reti MeteoHub del sud (dal 3/8, finestra API);
  Toscana (dal 10/8, SOLO temperatura dalla pagina SIR termo, live-only).
  **TUTTE le 15 reti a dati reali sono coperte.** L'Abruzzo resta fuori: è
  Open-Meteo live (stime, niente collector né file) — mettergli t/w di modello
  tradirebbe la regola «dati reali di stazione»; la strada è trovargli una
  fonte reale (Centro Funzionale allarmeteo, in coda). Le stazioni scoperte dicono
  «Temperatura/Vento non disponibile» e si riempiranno estendendo i collector,
  senza altri deploy. Sviluppata sul repo di test (pilota Austria 10/8), portata
  in prod pezzo per pezzo l'11/8 su decisione utente («facciamo direttamente in
  produzione»). Dettagli di impianto:
  - `histFileCache` tiene oggetti `{mm,t,w}` (Lombardia Socrata avvolta in
    `{mm,t:null,w:null}`); `histRenderPioggia` (barre di sempre) +
    `histRenderLinee` (segmenti sui buchi, giorno isolato = trattino);
    `histTab` si ricorda tra stazioni; `METEO_HIST_FROM` = date di inizio t/w
    (le 13 régions francesi condividono la chiave `francia`; la chiave
    `svizzera` copre anche il Ticino, il regionKey delle stazioni OASI è quello).
  - **Vento: SOLA media nel grafico** (decisione utente 10/8): la raffica in
    scala schiacciava la media sul fondo. La raffica resta nel tooltip del
    giorno e nei file (`w[1]`).
  - ⚠️ Il pannello vive DENTRO il contenitore Leaflet: la barra schede ha
    `L.DomEvent.disableClickPropagation`, senza cui il click risale a
    `map.on('click')` e chiude il pannello. Vale per qualsiasi elemento
    interattivo futuro nel pannello.
  - Backfill una tantum in `.github/scripts/backfill-meteo-<rete>.js` (GIORNI=n,
    idempotenti, toccano solo t/w). Push di soli data/.github = zero crediti.
- Spinner di caricamento (overlay CSS, z-index 800)
- YouTube "ISCRIVITI" button nel box canale (nascosto su mobile ≤600px)
- Home icon nell'header
- Pulsanti periodo: Ieri/7gg/10gg/15gg/20gg/30gg
- "Piogge per funghi" (range **13-20 gg fa** dal 27 agosto 2026; 15-21 dal 7 agosto, 16-23 dal 24 luglio, prima ancora 18-25). Otto giorni di accumulo invece di sette
- Date personalizzate
- Nota "I dati escludono la giornata odierna"
- IDW_RAD: 0.15 per ≤24h, 0.35 per periodi più lunghi
- CACHE_VER: arpa5v7_
- Eventi Google Analytics (18 luglio 2026): `analisi_regione` con parametro `regione` in loadData (dimensione personalizzata "Regioni" in GA4), `click_home` e `click_youtube` sui link header/canale. **Dal 6/8/2026 tutti i `click_*` portano il parametro `pulsante`** (dimensione GA4 "Pulsante", ambito Evento) per distinguere QUALE bottone: `iscriviti-header`, `icona-social`, `box-desktop` (box canale), `pillola-mobile` (pillola cumulati), `archie-header` (click_home). Come per le condivisioni, niente storico: i valori esistono solo dal deploy in poi, il `(not set)` è il pregresso e cala da solo
- **Crediti fonte dati dinamici** (22 luglio 2026): il piè di pagina (`#fonte-dati`) e l'attribuzione Leaflet dicevano "ARPA Lombardia" fisso qualunque regione fosse selezionata — scorretto verso le altre agenzie, ed era finito anche nell'anteprima social. Ora `aggiornaCrediti()` li aggiorna dal campo `fonte` delle regioni attive, usando i nomi canonici (`ARPAE Emilia-Romagna`, `SIR Toscana`, `OASI Ticino`…). Nella stessa occasione sono state allineate anche le etichette runtime della chip sulla mappa: cinque regioni dicevano genericamente "🟢 ARPA live" mentre Toscana e Ticino nominavano l'agenzia, ora tutte nominano l'agenzia e l'emoji resta a indicare lo stato (🟢 dati di stazione, 🌍 ripiego Open-Meteo). La chip parte da "Fonte: —" invece che da un nome fisso, perché prima della prima selezione non c'è nessun dato in mappa. L'attribuzione Leaflet si gestisce con `attributionControl.removeAttribution/addAttribution`, non riscrivendo quella del tile layer. Nota: da desktop la mappa è ora **multi-regione** (fino a 3 regioni insieme, dal 25 luglio 2026 — vedi voce dedicata); i crediti uniscono più fonti con ` · `. Su mobile resta single-region (tendina).
- **Anteprima social `preview.jpg`** (rifatta il 22 luglio 2026): 1200×630, Emilia Romagna a 30 giorni con i pannelli visibili, generata con Chrome headless via puppeteer-core (lo script sta in `grafiche-social/node_modules`, non nel repo). L'inquadratura si ottiene misurando l'ingombro dei path `.leaflet-interactive` e calcolando zoom e trascinamento: attenzione che nel contenitore mappa c'è anche la bandierina ucraina dell'attribuzione Leaflet, tre path che se non filtrati falsano la misura. Nei meta il file è referenziato con `?v=20260722` perché i social tengono l'anteprima in cache per URL
- **GA attivo solo sul dominio di produzione** (22 luglio 2026): `gtag('config', ...)` è dentro un controllo `/(^|\.)avventuremicologiche\.it$/` sull'hostname, così l'`index.html` può essere copiato tal quale sul repo di test senza che il sito di test (`avventurepluvio-test.netlify.app`) sporchi le statistiche. Senza `config`, gtag.js non invia nulla e le chiamate `gtag('event',...)` sparse nella pagina restano innocue. La regex copre anche dominio nudo e `www.`, per non perdere il tracking se il sito venisse servito da lì
- **Multiregione desktop** (in produzione dal 25 luglio 2026, sviluppata nel repo di test): su desktop si selezionano fino a **3 regioni** insieme (checkbox; scritta "(MAX 3)" accanto al titolo "Seleziona regione", messaggio "Massimo 3 regioni per volta" in rosso — classe `error`; debounce 550ms sui toggle). Su mobile resta single-region (tendina). `getActiveRegions()` legge le caselle spuntate, l'handler NON deseleziona più le altre; `loadData`→`onRegionDone`→`renderMulti` unisce i dati di tutte le regioni attive e ogni stazione è taggata con `s._region`.
  - **Inquadratura** (`fitMapToRegions`): orizzontale centrata sulla **regione di mezzo** (quella che confina con entrambe le altre, via `REGION_ADJ`+`middleRegion`; ripiego = più vicina al centroide della terna), verticale sul **contenuto reale** (non simmetrica sulla regione di mezzo, altrimenti lo "specchio" del mare a sud spinge il contenuto in alto e ritaglia le Alpi). Zoom regolabile con **`ZOOM_STEP`** (mezzi/quarti di livello sopra il "tutto visibile" `_fit`, cap al "riempi pieno" `_fill`) e **`VSHIFT`** (spostamento verticale del centro; >0 abbassa il contenuto — regola #5). `zoomSnap` portato a **0.25** per il controllo fine (zoomDelta resta 0.5 → zoom manuale con +/- e rotellina invariato).
  - **`REGION_BOUNDS`** completa per tutte e **11 le regioni**: indispensabile al fit multi-regione — se ne manca una, la bbox unificata resta ai valori invertiti e Leaflet zooma sul **mondo intero** (bug trovato con Toscana+Emilia). Con una sola regione fuori tabella c'è una rete di sicurezza che ricava la bbox dalle stazioni.
  - **Performance**: `buildGrid` con pre-check **AABB** sul bbox dell'anello esterno di ogni confine (scarta O(1) le celle fuori regione senza il point-in-polygon sui migliaia di vertici) + **griglia adattiva** (`activeGridRes`: passo ×1.5 a 1 regione, ×1.7 a 2, ×2.4 a 3) + campionamento stazioni per l'IDW a 320 in multiregione → 3 regioni × 30gg da **~16s a ~1s** (i fetch erano solo ~0,3s: il collo di bottiglia era la griglia sincrona).
  - **Grafico storico**: usa la regione della stazione cliccata (`s._region`), non `getActiveRegions()[0]`.
- **Niente più salti della pagina all'apertura** (30 luglio 2026, corretti insieme in prod e test): il sito, aperto, si assestava con due scatti visibili. Segnalato dall'utente sul primo, il secondo è saltato fuori misurando.
  - **Loader iniziale.** Il `<div id="loader">` (spinner + "Caricamento mappa…") **non aveva nessuna regola CSS** — c'erano solo quelle dei figli (`.spinner`, `#lmsg`, `#lsub`), la sua era andata persa in qualche modifica passata. Restava quindi un blocco statico, primo figlio del `body` (flex column alto `100dvh`), e per tutta la durata del caricamento si prendeva **66px in cima** schiacciando header e mappa; a fine caricamento andava a `display:none` e tutto risaliva di colpo. CLS misurato **0,089 in prod** (0,045 sul test), in 2-3 scatti perché il riquadro cresceva a gradini man mano che cambiavano i messaggi. Succedeva a ogni apertura, anche a pagina in cache (lì il loader dura ~340ms: il salto c'è comunque, solo più breve). Fix: `position:fixed` in basso al centro (`top:40%` sotto i 600px, altrimenti finisce dietro al pannello periodo aperto), `z-index:2500` (a 1200 restava coperto: i pannelli mobile stanno a 2100), `width:max-content` (con `left:50%` la larghezza a contenuto di un `fixed` viene tagliata a metà viewport e il testo andava a capo). **Comparsa ritardata di 2,5s** via `animation-delay`: il caricamento normale dura 1,4s (test) / 1,9s (prod), quindi la pillola non si vede mai — appare solo su rete lenta, così l'utente non pensa che il sito sia bloccato. Ripulito anche `#lsub` quando i confini sono pronti (altrimenti la pillola annunciava una fase già conclusa).
  - **Pannello periodo.** `positionPanels()` (che riaggancia `#time-panel` sotto `#region-panel`) era chiamato **solo** da `setTimeout(..., 100)`: la pagina veniva disegnata col pannello alla posizione del CSS (`top:182px`, valore ormai scollegato dalla realtà) e subito dopo spostato a quella vera — in prod **397px, cioè 215px di salto**. Sul repo di test non si notava perché lì il pannello regioni è nascosto (c'è la barra "Clicca sulla mappa…") e il calcolo dà 161px, vicino al valore CSS. Fix: chiamata **diretta** oltre al `setTimeout` (che resta come rete di sicurezza e ricalcola lo stesso valore); a quel punto del file il pannello regioni è già stato letto dal parser, quindi la misura è valida. Verificato con A/B delle due versioni servite in locale: prima il pannello compariva a y=228 e ~100ms dopo saltava a y=443, ora nasce già a 443.
  - **Come misurare** (se si tocca ancora il caricamento): Chrome headless via puppeteer-core in `grafiche-social\node_modules`, `PerformanceObserver` su `layout-shift` (con `sources` per sapere CHI si muove) più campionamento diretto di `getBoundingClientRect()` a intervalli. **Il CLS da solo inganna**: sul sito live resta un residuo di ~0,027 con rettangoli scalati di ~1,08 rispetto a quelli reali — è il ridimensionamento della finestra headless durante il caricamento, non un movimento vero. Fidarsi del campionamento delle posizioni, non del numero.
- **Centratura misurata su telefono + pannello cumulati compatto** (6 agosto 2026, prod e test): la pillola canale ha allungato il pannello dei cumulati e tutte le regioni della tendina finivano troppo in basso (le viste erano tarate a mano sul pannello di prima — segnalato su Svizzera e Liguria). Due interventi: (a) su ≤600px statistiche, gradiente e pillola compattati (`.sv` 26→20px, `.grad` 18→14, avatar 46→38; ~25px recuperati); (b) `centraRegioneInStriscia()` — si MISURA quanto i pannelli (`legend-panel`/`time-panel`) coprono la mappa e si porta la regione al centro della striscia visibile, invece di ritarare 13 centri a occhio. Chiamata dopo la selezione dalla tendina e dopo `showLegendMobile` (i due pannelli hanno altezze diverse) — **dal 9/8 non più con timer fissi ma all'arrivo vero del pannello**, via `centraDopoPannello` (vedi «La corsa dei 50ms» nella sezione inquadratura); non tocca nulla se nessun pannello copre la mappa (desktop/tablet coi pannelli laterali) o se lo scarto è ≤12px. (c) La stessa funzione applica lo zoom **"riempi la striscia"** (richiesta utente, stesso giorno): si alza lo zoom finché la regione riempie la larghezza quasi piena (tolleranza 5%) o il 92% dell'altezza della striscia, il primo che scatta; le regioni più alte della striscia vengono invece fatte entrare; arrotondamento per DIFETTO e banda morta contro l'oscillazione fra le due chiamate (**dal 9/8: passo 0,1 col tetto al 100% della larghezza, banda morta 0,98-1,09** — i valori del 6/8 erano quarto di livello, tetto 105% e banda 0,85-1,09; il perché del cambio sta nella sezione inquadratura). ⚠️ Il debordo laterale "tanto si scorre col dito" (tetto 1,35×) è stato **provato e scartato**: su una regione ad arco come la Liguria i due estremi tagliati sono terra vera, e la forma della bbox NON distingue l'arco dal blocco (il rettangolo della Liguria è 2:1 come la Svizzera). ⚠️ Per misurare a mappa ferma, i `setView` della tendina sono ora **senza animazione**: la chiamata a 420ms misurava il volo a metà (confine a metà scala e `getZoom()` già al valore d'arrivo → Liguria a zoom 8 invece di 7.75). ⚠️ La dimensione si misura sul **DISEGNATO** (path dell'overlay-pane), non su `REGION_BOUNDS`: quella bbox è più stretta dei confini veri (Lombardia senza Livigno, Sicilia senza isole) e usandola sola il confine sbordava sotto il pannello di 48-84px; se il confine non è ancora scaricato (prima selezione a freddo) si ripiega sulla bbox e la chiamata all'apertura dei cumulati corregge sul disegno vero. Verificata headless su TUTTE le regioni a 375×812 (prod e test, Austria compresa): delta dal centro striscia ≤1px, nessun confine sotto il pannello. Sopravvive a future modifiche di altezza dei pannelli.
- **Foto condivisa: didascalia + link tracciato (18 agosto 2026, prima nel test, poi prod).** Il link viaggiava già con la foto (`navigator.share({files,text:url})` dal 30/7), ma in GA4 le aperture da foto e da link erano indistinguibili. Ora il link della foto porta **`s=i`** e chi lo apre manda **`open_shared_image`** al posto di `open_shared_map` (nome evento nuovo: niente dimensioni da creare); la didascalia è «Dove ha piovuto in <regioni> (date): mappa dei pluviometri, dati reali di stazione» (`didascaliaFoto()`) con l'URL nel campo `url`, così Chrome Android non lo raddoppia. `buildShareUrl` non rigenera `s`: chi ri-condivide dalla pagina aperta produce un link pulito. Provato dall'utente da telefono: didascalia e link arrivano. Le app fanno di testa loro (WhatsApp iPhone tende a scartare il testo): il numero vero è `open_shared_image` in GA4.
- **Marchio sull'immagine condivisa** (7 agosto 2026): in fondo allo scatto una striscia blu alta 26 punti con `precipitazioni.avventuremicologiche.it` e, a destra, periodo + «dati di stazione reali». **Perché**: il tasto Immagine è usato quasi quanto il tasto Link (17 contro 22 in un mese, GA4) e quelle foto girano nei gruppi WhatsApp, ma **non dicevano da dove venivano** — sul Piemonte-VdA cinque immagini condivise e ZERO aperture. È la leva più economica che abbiamo: trasforma in traffico un passaparola che avviene già.
  - **La striscia ALLUNGA il canvas, non lo copre** (26 punti in più in altezza): non si perde né mappa né pannello. Provata prima la versione sovrapposta e scartata.
  - **La riga di destra si misura prima di scriverla** e si omette se non entra: su telefono (390 punti) finiva sopra l'indirizzo. Stessa logica dei paesi nell'header.
  - Il periodo è ripetuto lì perché in alto **si perde se qualcuno ritaglia**, e un'immagine senza date dopo qualche giorno in un gruppo non vuol più dire niente. Viene da `currentLabel`, quindi segue anche la finestra funghi.
  - Tutto dentro un `try` che in caso di guaio restituisce l'immagine senza striscia: **un marchio non deve mai far fallire lo scatto**.
- **Lo zoom scelto dall'utente sopravvive a scatto e link** (7 agosto 2026 — segnalato dall'utente: «se faccio lo screen non prende lo zoom»). **Due difetti distinti**, tutti e due nati da scelte fatte apposta:
  - **L'immagine ignorava lo zoom.** Dal 30/7 `captureMapBlob` allarga la vista se non contiene tutte le regioni attive (rimedio all'immagine tagliata sull'Italia intera). La condizione però non distingue *«il fit automatico non ci sta»* da *«l'utente ha zoomato apposta»*: appena zoomi, la vista non contiene più la regione e lo scatto si riallarga. Misurato: zoom 11,25 → 9 durante la cattura. E siccome **la vista viene ripristinata subito dopo**, a schermo non si vede nulla: sembrava stregoneria. **Rimedio:** flag `_vistaUtente`, acceso solo da gesti UMANI (`dragstart` — che non scatta sui `panBy` programmatici — più rotellina, pinch a due dita, doppio clic e i bottoni +/−), spento a ogni nuova analisi e a ogni cambio regione. Lo scatto si allarga solo a flag spento.
  - **Il link perdeva la vista su TELEFONO.** L'URL conteneva già `z` e `c`, ma chi lo apriva li applicava solo sopra i 900px: sotto, la mappa si riadattava alla regione, cioè **il 69% di chi riceve un link vedeva un'altra inquadratura**. **Rimedio:** si applicano tali e quali su qualunque schermo, più il flag `_vistaDaLink` perché su telefono `centraRegioneInStriscia` non riporti la vista sulla regione 350 ms dopo.
  - ⚠️ **Provata e SCARTATA la compensazione sulla larghezza** (parametro `w` + `z − log2(w_mittente/w_suo)`, per mostrare la stessa *porzione di territorio*): messa online sul test e provata dall'utente, allargava di due livelli da PC a telefono e stringeva di due nell'altro verso. **Chi condivide si aspetta la stessa SCALA, non la stessa area** — il rapporto fra le larghezze è proprio la cosa da non compensare.
  - ⚠️ **Trappola del collaudo**: simulare lo zoom con `map.setZoom()` NON prova niente — non è un gesto umano, il flag resta spento e il test dice "rotto" anche quando funziona. Serve la rotellina vera (`page.mouse.wheel`). Verificate **entrambe le facce**: vista stretta programmatica → si allarga ancora (12,25→9, rimedio 30/7 intatto); vista stretta dell'utente → rispettata (15,25→15,25). Link: PC→telefono e telefono→PC, stessa scala e stesso centro.
  - **Limite noto, non un difetto**: una foto scattata dal telefono mostra molto meno territorio di una scattata dal PC (390px contro 1440 = quasi due livelli di zoom) ed esce a doppia densità, quindi aperta sul PC sembra ingrandita. Se dovesse dare fastidio, le strade sono: immagine sempre sulla regione intera da telefono, oppure zoom dell'utente meno un livello per dare contesto.
- **Caricamento robusto ai clic troppo rapidi** (1 agosto 2026, prod e test insieme): un utente che clicca un periodo nei primissimi istanti della prima visita (cache fredda) poteva incagliare il caricamento — 30s di «Calcolo mappa…» e poi «⚠️ Caricamento timeout» (visto dal vivo, mai riprodotto a comando; al secondo tentativo rientrava sempre). Due difese, agganciate al meccanismo di sessione esistente (`loadSessionId`, "l'ultimo clic vince", più `if(isLoading) return` che ignora i clic durante un caricamento):
  - **Riprova automatica sul timeout di sicurezza**: allo scadere dei 30s, se la sessione è ancora quella (= l'utente è rimasto in attesa, non ha cliccato altro), il sito riprova **una volta sola** da solo (`_autoRetryUsed`/`_retryCall` accanto a `loadSessionId`); se fallisce anche la riprova, errore come prima. Il budget si rinnova a ogni caricamento chiesto dall'utente. Provato strozzando `window.fetch` sui file Lombardia: rete che torna dopo 25s → a 30,1s riprova silenziosa, ✅ a 30,7s senza che l'utente veda nulla; rete rotta per sempre → un solo giro di riprova e poi l'errore, nessun avvitamento.
  - **Barriera confini in `renderMulti`** (portata dal test, dove girava dal 29/7 — fix "Toscana scomparsa dalla heatmap"): se il GeoJSON di una regione attiva non è ancora arrivato, si aspetta con `loadAllBorders` e si ridisegna, un solo retry. Prima la prod disegnava col confine vuoto, escludendo la regione dalla heatmap.
  - Provato anche il **cliccatore compulsivo** (16 azioni a caso in 2,6s su periodi e regioni): converge sempre sull'ultimo clic, nessun errore — il comportamento è identico a prima, le due difese non aggiungono stati nuovi.

---

## Inquadratura su telefono — metodo di misura, strumenti e stato (9 agosto 2026)

Revisione completa delle 21 voci della tendina (Android 360×800), con tre interventi in produzione: banda morta della centratura da 0,85 a **0,98** (il Friuli tagliava 46px di terra a ovest — l'11,5% del contorno — perché il fattore correttivo 0,94 cadeva nella banda morta e veniva zittito; commit `88f2a950`), **passo di zoom 0,1 col tetto al 100% della larghezza** (tagli da 4 regioni a 1, dieci regioni più grandi di +3,9 punti; quattro modifiche, la quarta protegge il desktop — dettagli in `esperimento-passo01-cap100.md` nella cartella claudio; commit `2ac8b70d`), e la **corsa dei 50ms** (sotto; commit `355e9a00`).

### Come si misura (il metodo giusto, imparato a caro prezzo)
- **Si proiettano i vertici VERI del GeoJSON** (2.000-7.500 punti a regione): si prendono i layer Leaflet con `fill:false` (i confini), si spianano i `getLatLngs()` e si passa ogni vertice per `latLngToContainerPoint`. Conta quanti px stanno fuori dai quattro lati e sotto il pannello.
- ⚠️ **Il rettangolo del path SVG mente**: `getBoundingClientRect()` sul path include la padding di clipping di Leaflet, non è il confine. Era la fonte dei "numeri assurdi" del primo strumento desktop, cestinato.
- ⚠️ **`window.map` non è la mappa**: gli id HTML diventano proprietà di `window`, quindi `window.map` è il `<div id="map">`. La mappa vera è **`window._mapDebug`**.
- **Si misura due volte**: dopo la selezione dalla tendina E dopo l'apertura dei cumulati — i due pannelli coprono la mappa in modo diverso e la centratura corregge in due tempi.
- La copertura del pannello si misura come fa il sito: rect di `legend-panel`/`time-panel` se visibili e alti ≥40px, `mBox.bottom - max(r.top, mBox.top)`.

### Strumenti (cartella claudio, fuori dal repo)
- **`verifica-inquadratura.js`** — le 21 voci della tendina a 360×800, una riga a regione (px fuori per lato + riempimento + zoom). Il collaudo mobile completo.
- **`collaudo-desktop.js`** — modalità `mobile` (3 regioni sentinella) e `desktop` (8 casi: singole problematiche + combo multiregione a 1440×900). Scrive un JSON confrontabile. È il sostituto del vecchio `verifica-desktop.js`, che misurava col rettangolo SVG ed è stato cestinato.
- **`riproduci-corsa-50ms.js`** — riproduzione della corsa (sotto): modalità `lento:N` (transizione allungata a N ms via CSS iniettato) e `blocco:N` (busy-wait di N ms nel microtask dell'apertura pannello).
- Serve il sito in locale: `python -m http.server 8888` dalla cartella del repo.

### La corsa dei 50ms (trovata l'8/8, chiusa il 9/8 — commit `355e9a00`)
La centratura partiva da timer fissi (350ms cumulati, 420ms periodo) contro transizioni da ~300ms. **I timer scaduti durante un blocco del main thread (il disegno di stazioni e heatmap) girano PRIMA del frame che avvia la transizione**: pannello misurato a `top=800` su viewport 800, `coperto=0`, la funzione conclude «nessun pannello», esce, e nessuno la richiama più — regione scentrata in modo PERMANENTE (il Lazio: 138px, riprodotto identico due volte su telefono; colpiva anche Veneto e Trentino).
- **Rimedio**: `centraDopoPannello(elId)` — misura al `transitionend` del `transform` del pannello (scatta esatto su qualunque motore), con riserva a 900ms per il pannello già aperto. **La riserva non conclude**: la sua misura è provvisoria e l'evento, se arriva, la corregge — la centratura è idempotente, rieseguirla a pannello fermo non muove nulla.
- ⚠️ **Su Chrome desktop la corsa non si innesca mai** (il rendering arretrato passa prima dei timer scaduti, e la transizione retrodatata risulta già finita quando il timer misura): per riprodurla non si rincorre lo scheduling del telefono, si **allarga la finestra** — `lento:6000` → misura a metà corsa, 57px sotto il pannello permanenti; `lento:20000` → misura prima del primo frame, uscita secca e vista mai corretta (la forma del Lazio).
- ⚠️ **Misurare a metà corsa danneggia poco** (2-26px): la catastrofe è solo il ramo `coperto<=20 → return`. E la catena della selezione spesso ripara quella dei cumulati: per vedere il difetto serve il test discriminante (vista guastata apposta + click su un ALTRO periodo, dove l'unica correzione possibile è la catena dei cumulati).
- ⚠️ **Niente contatori di riprova condivisi**: provati l'8/8, le catene si azzeravano a vicenda e il giro di collaudo è passato da 28 a 150 secondi a regione.

### Stato e limiti (dopo gli interventi del 9/8)
- **Unico residuo: Friuli 3px a sinistra** (0,6% del contorno) — accettato.
- **17 regioni su 21 sono limitate dalla LARGHEZZA, non dall'altezza**: accorciare il pannello dei cumulati non le ingrandirebbe quasi per niente.
- **Larghe e basse restano mezze vuote e non c'è rimedio**: Liguria 36%, Austria 37%, Emilia 40% di altezza riempita — sono già al 96-99% della larghezza; per riempirle in verticale bisognerebbe tagliare i lati, provato e scartato il 6/8 (su una regione ad arco come la Liguria gli estremi tagliati sono terra vera).
- ⚠️ Ipotesi scartata durante la caccia al Friuli: NON erano le 5 stazioni ARPA Veneto del Cadore (la più occidentale sta a −23px, il confine a −46).

---

## L'etichetta del tasto posizione (30 agosto 2026, v9.2)

**Il numero che ha fatto partire il lavoro.** Le tre dimensioni personalizzate
GA4 registrate quel giorno (`esito`, `codice`, `precisione`) hanno dato il primo
dato leggibile sul tasto «La mia posizione», tre giorni di raccolta:

| esito | tentativi | quota |
|---|---|---|
| `negato` | 26 | **53%** |
| `ok` | 18 | 37% |
| `lento` | 2 | 4% |
| non registrati | 3 | 6% |
| `fuori` | 0 | — |
| `errore` | 0 | — |

**49 tentativi, uno su due finisce col permesso negato.** E siccome `fuori` e
`errore` sono a zero, il difetto non e' nostro: non e' il GPS che sbaglia, non
e' il punto che cade fuori copertura. E' che **la richiesta del browser arriva
inaspettata**, e chi non se l'aspetta dice no.

### La correzione: il tasto dichiara lo stato del permesso
Non si tira a indovinare, perche' **il browser lo sa gia' e lo dice**
(`navigator.permissions.query({name:'geolocation'})`). Tre stati, tutti in
`geoEtichetta()`:

| stato | a riposo | premuto |
|---|---|---|
| `prompt` | «La mia posizione **· autorizzazione richiesta**» | (parte la ricerca) |
| `granted` | «La mia posizione» | (parte la ricerca) |
| `denied` | «La mia posizione» | «**Sbloccala dalle impostazioni**» + pallino `#8a1a12` |

- La coda e' uno `<span class="gb-coda">` in **tono minore** (peso 500, opacita'
  0,82, corpo 12,5 px): e' un'informazione, non un guasto, e il rosso qui
  direbbe una cosa falsa.
- Con l'evento `change` della PermissionStatus **la coda sparisce da sola** nel
  momento in cui l'utente autorizza, senza ricaricare la pagina.
- Lo stato `denied` premuto torna «La mia posizione» **riaprendo la tendina**:
  lo fa `regApri()`, che chiama `geoNota('')`, che rimette `_geoBloccato=false`.
  E' voluto: il messaggio serve subito dopo il tocco, non per sempre.
- Quando il messaggio sta NEL tasto, la riga sotto (`.gb-nota`) si **spegne**:
  se no la stessa cosa e' scritta due volte, una sopra l'altra.

### ⚠️ TUTTO SU UNA RIGA SOLA, e non e' un vezzo
Misurati a 360 px di larghezza, i tre testi stanno in **249, 106 e 179 px**, e
soprattutto **il blocco resta 114 px in tutti e tre i casi**, cioe' identico a
com'era prima della modifica.

La prima versione, provata la mattina del 30/8 (`8fed5f52`, solo sul test),
metteva l'avviso su una **riga separata sotto il titolo**: costava **13 px** e
spingeva la tendina a 15 px dal fondo dello schermo. Scartata. L'idea di
mettere la coda accanto al titolo invece che sotto **e' dell'utente**, ed e'
quella che non costa niente. Vale come promemoria: su un pannello che e' gia'
40vh, ogni riga nuova si paga, e spesso la si evita cambiando dove va il testo
invece di accorciarlo.

### Due trappole
- ⚠️ **L'etichetta non si ripristina copiando il testo di prima.** Il vecchio
  `geoTrova()` faceva `var vecchio = et.textContent` e lo rimetteva a fine
  ricerca: con la coda quello avrebbe riscritto «La mia posizione ·
  autorizzazione richiesta» come **testo semplice**, perdendo lo `<span>` e
  quindi il tono minore. Adesso si **RICOSTRUISCE dallo stato** chiamando
  `geoEtichetta()`. Regola generale: quando un'etichetta ha degli stati, si
  rigenera, non si fotografa.
- ⚠️ **Safari non risponde**: `navigator.permissions` non supporta
  `geolocation` su tutte le versioni. Li' si ricade sul **mostrare** la coda,
  che e' il ramo prudente — **dire una cosa vera a chi non serviva costa meno
  che tacerla a chi serviva**. Stesso principio del `~` sulla quota dedotta.

### Collaudo
Sul sito di test **col permesso VERO del browser**, non simulato
(`Browser.setPermission` via CDP), a 360x640, cinque casi: prima volta
(`prompt`), autorizzato, negato a riposo, negato premuto, chiuso e riaperto.
Larghezza del testo e altezza del blocco misurate una per una, tabella qui
sopra. In produzione ricontrollato online lo stato `denied` nei due momenti
(riposo e tocco), pallino `rgb(138,26,18)`, riga sotto vuota, zero errori in
console.

### La promozione
Commit `be41fb5f`, un deploy. **Il file NON e' stato copiato dal test**: si e'
preso il diff dei due commit del test (`2f419aa0..1380f9f5`) e lo si e'
applicato con `git apply` alla produzione, che nel frattempo aveva 43 righe che
il test non ha (l'altezza dell'anemometro Veneto dello stesso giorno). Quattro
pezzi, offset di 27 righe, **79 righe aggiunte e 4 tolte**. Chiavi prod-only
ricontate prima e dopo: EMILIA_ESCLUSE 5, HIST_RAW_BY_REGION 2,
analisi_regione 1, getSelectedValues 4, le cinque `*_ESCLUSE` e
`PILOT_DATA_BASE` invariate. `og:image` e `twitter:image` restano quelle del
dominio di produzione.

⚠️ **E' ricapitata la trappola del `sed -i`**, gia' scritta in fondo alla scheda
Slovenia: due commenti da cambiare, `sed -i`, e i **CRLF spariti dall'intero
file** — `git diff --stat` da 19.897 righe invece che da 83. Non da' nessun
errore e il file funziona lo stesso: se ne accorge solo chi guarda il diff
prima di committare. Rifatto da capo con lo strumento di Edit normale.
---

## I pallini di partenza e le due voci rimaste aperte (30 agosto 2026)

Tre cose chiuse nella stessa sessione, nate da due domande dell'utente: «il
Piemonte ha le quote sbagliate» e «la mappa disegna 314 stazioni dove il conto
ne prevede 317».

### 1. I pallini di partenza erano NOMI DI PAESI

I pallini bianchi che si vedono dopo aver scelto la regione e **prima** di aver
scelto il periodo uscivano da `cfg.stations`, una lista scritta a mano dentro
`index.html`. Non erano pluviometri: erano paesi, con le coordinate del centro
abitato e la quota battuta a mano. Misurato il 30/8 contro la rete vera:

| regione | voci | su un pluviometro vero (<200 m) |
|---|---|---|
| Piemonte | 65 | **0** (e 30 stavano oltre 3 km) |
| Veneto | 61 | **0** |
| Emilia | 30 | 1 |
| Liguria | 30 | 1 |
| Friuli | 15 | 2 |
| Alto Adige | 30 | 6 |
| Toscana | 30 | 20 |
| Trentino | 50 | 42 |

⚠️ **La nota che stava qui («due numeri ARPA diversi per la stessa stazione,
Acqui Terme 156 contro 217») ERA SBAGLIATA.** Non c'erano due anagrafiche che
litigavano: il 156 era un numero battuto a mano per il PAESE di Acqui Terme, e
il pallino stava 989 m lontano dalla stazione vera, che sta a 217 m. Il caso
peggiore era Vinadio: 905 m scritti contro 1.433 veri, a 2,9 km. Il tooltip
dichiarava nome, provincia e quota di una stazione inesistente, con sotto la
fonte vera.

**Rimedio**: `loadStazioniPallini()`, una funzione sola che legge l'ULTIMO file
giornaliero della cartella dati, la stessa ricetta che Austria, Slovenia,
Svizzera, Francia e MeteoHub usavano gia' (`loadAustriaStations` e' il
modello). **354 stazioni inventate via, 1.680 vere al loro posto**:

| regione | prima | dopo |
|---|---|---|
| Toscana | 30 | **367** |
| Emilia | 30 | **298** |
| Piemonte | 65 | **265** |
| Liguria | 30 | **195** |
| Veneto | 61 | **183** |
| Friuli | 15 | **141** |
| Trentino | 50 | 103 |
| Valle d'Aosta | 43 | 70 |
| Alto Adige | 30 | 57 |
| Lombardia | 200 diradati da 326 | **254** |

I numeri quadrano con quelli gia' scritti altrove in questo file: Liguria 195 e'
il valore del tetto a 400 del 27/8, Toscana 367 quello del giorno in cui e'
stata tolta la whitelist, Emilia 298 e' identico a quello che la mappa disegna
DOPO aver scelto il periodo (prima erano 30).

Cose da sapere se ci si torna:
- ⚠️ **`EMILIA_ESCLUSE` e' stata portata FUORI dal suo loader.** Era una `var`
  dentro `loadARPAEmiliaRegion`, quindi irraggiungibile: senza spostarla, i
  pallini di partenza dell'Emilia mostravano le 8 gemelle liguri e i
  pluviometri fermi, che poi sparivano al clic sul periodo. Le altre quattro
  liste (`PIEMONTE_`, `LIGURIA_`, `TOSCANA_`, `MH_`) stavano gia' fuori.
- ⚠️ **Il tetto dei pallini era rimasto a 150** mentre quello dei dati e'
  passato a 400 il 27/8. Non si notava perche' le liste a mano erano corte; con
  le stazioni vere Piemonte e Toscana si sarebbero DIRADATI alla scelta della
  regione per poi infittirsi al clic sul periodo. Allineato a 400. Effetto
  voluto: anche l'Austria passa da 150 a 307 pallini di partenza, cioe' quelli
  che aveva comunque dopo il clic.
- Il **Friuli ha due cartelle** (`friuli-osmer` + `meteohub-friuli`): i doppioni
  si scartano sotto il chilometro e vince OSMER, stessa regola e stessa
  tolleranza di `loadOSMERFriuliRegion`, che resta il posto dove e' spiegata.
- Se il file non si scarica **non si disegna niente**, come per le estere:
  meglio nessun pallino che pallini finti.
- **La LOMBARDIA e' entrata anche lei, in un secondo giro lo stesso giorno.**
  I suoi pallini non erano paesi inventati: venivano dall'anagrafe ARPA vera,
  chiesta alla function Netlify `/arpa` e assottigliata a 200 con
  `selectUniform`. Ma quell'anagrafe elenca **tutti** i sensori, anche i tre
  con le coordinate corrotte di `LOMB_ESCLUSE` che il loader dei dati scarta:
  letta in produzione il 30/8, «Ispra prato» risulta a 45.996/9.955, cioe' nel
  bergamasco, e «Virgilio Mantova Cerese» a Dorio in provincia di Lecco, 150 km
  da Mantova. Adesso legge `data/lombardia` come le altre: **254 pallini,
  identici a quelli che restano dopo il clic sul periodo** (erano 200 diradati
  da 326, coi morti dentro).
  ⚠️ **Conseguenza: la function `/arpa` non la chiama piu' nessuno.** Era
  l'ultima chiamata rimasta nel sito. Con lei sono cadute `ARPA_STATIONS`,
  `caricaAnagrafeLombardia()` e **l'attesa dentro `whenLombardiaReady`**, che
  all'apertura di un link condiviso conteneva la Lombardia si fermava fino a
  8 secondi ad aspettare quell'anagrafe: dal 24/7/2026, cioe' da quando la
  Lombardia legge i file, **`ARPA_STATIONS` non lo leggeva piu' nessuno**, e si
  aspettava un valore che non serviva a niente. La function resta nel repo, non
  la chiama piu' il sito. `LOMBARDIA_STATIONS` invece **resta**: e' l'elenco dei
  punti su cui si chiedono le stime a Open-Meteo se i file mancassero.
- **Fuori dal giro resta il solo ABRUZZO**, dove la lista non e' un
  abbellimento ma l'elenco dei punti su cui si chiedono le stime a Open-Meteo,
  cioe' la fonte stessa. Non si tocca finche' non ha una rete vera.
- Residuo cosmetico: sul Piemonte il tooltip dei pallini di partenza ora dice
  «PROVINCIA DI ALESSANDRIA» invece di «AL», perche' e' cosi' che ARPA scrive il
  campo. Non e' una regressione: dopo il clic sul periodo diceva gia' cosi'.

### 2. «La mappa disegna meno stazioni di quante ne conta»: non e' un difetto

Il badge e i pallini **coincidono sempre**: misurato in produzione, Emilia sola,
299 e 299 sia su «Ieri» sia su 30 giorni. Il divario che si vede confrontando
col numero di stazioni presenti nei file e' il **filtro di copertura al 60%**
(in produzione dal 22/8), che fa esattamente il suo mestiere:

| periodo | stazioni con almeno un dato | disegnate | tolte dal filtro |
|---|---|---|---|
| Ieri | 299 | 299 | 0 |
| 7 giorni | 303 | 297 | 6 |
| 30 giorni | 314 | 299 | 15 |

⚠️ **La cosa che non ci si aspetta: delle 15 tolte a 30 giorni, 11 sono stazioni
NUOVE**, che l'ARPAE ha cominciato a pubblicare il **17 agosto** e che riportano
ancora ieri (Alfonsine, Faenza, Ponte dell'Olio, Fiorenzuola d'Arda,
Castell'Arquato, Fiorano, Castelnovo di Sotto, Ravenna urbana, Copparo,
Martorano, Forli' Urbana). Solo 2 sono morte davvero (Modena urbana, ferma dal
12/8, e S. Bartolomeo in Bosco dal 3/8) e 2 sono a singhiozzo.

Il filtro, nato per nascondere i pluviometri spenti, oggi nasconde soprattutto
quelli appena nati, **e fa bene lo stesso**: una stazione con 13 giorni di dati
su una mappa da 30 mostrerebbe un cumulato di 13 giorni accanto a cumulati di
30, cioe' la macchia secca falsa che il filtro esiste per impedire. **Deciso il
30/8 di non toccare niente.**

### 3. Due pluviometri allo stesso identico punto: le Giralda

⚠️ **Di «Giralda» ce ne sono TRE**, e due hanno lo stesso nome in due posti
diversi. Si ragiona per **id**, mai per nome:

| id | nome | coordinate | sensori | note |
|---|---|---|---|---|
| 3730 | Giralda | 44.8138, **12.2483** | solo pioggia | dal 3/5, nessun giorno mancante |
| 14727 | Giralda | 44.8138, **12.2002** | solo pioggia | 3,8 km piu' a ovest, **ferma dal 20/8** |
| 53432 | GIRALDA meteo | 44.8138, **12.2483** | pioggia, t, vento, umidita' | dal 18/5 |

La 3730 e la 53432 stanno a **zero metri** l'una dall'altra: cercando in tutto
il progetto (5.700 stazioni, 40 cartelle) e' **l'unica coppia sotto i 50 m
dentro la stessa rete**. Costo: due pallini nello stesso pixel (se ne clicca uno
solo, e il grafico dell'altro non lo apre nessuno) e un punto che pesa doppio
nell'IDW in una zona del delta dove il vicino piu' prossimo sta a 12 km.

⚠️ **Nessuna delle due e' rotta**: su 22 giorni bagnati in comune 11 sono
identici entro 0,3 mm e solo 2 si scostano di piu' di 3 mm (15/7: 8,8 contro
4,6; 21/8: 30,8 contro 21,8, con Codigoro a 12 km che segna 19,4). Sono due
strumenti veri sullo stesso sito, uno della rete idrometrica e uno della
stazione meteo. Il controllo del lunedi' non le vede, ed e' giusto: 84%.

**Decisione del 30/8: esclusa la 3730**, col criterio gia' scritto in
`togliGemelleDiConfine`, cioe' vince il record piu' ricco di sensori: la 53432
porta anche temperatura, vento e umidita'.
⚠️ **Il prezzo, misurato e accettato**: la 53432 ha 4 giorni mancanti sugli
ultimi 40 (22, 23, 25 e 26 agosto) e il 25 la 3730 misurava 9,8 mm, che in quel
punto adesso non ci sono piu'. Sulle finestre corte costa il pallino: **5
finestre da 7 giorni su 54** fanno cadere il sito sotto il 60% di copertura. Da
10 giorni in su, mai.

---

## «Diretta radar» in produzione (31 agosto 2026, v9.3)

Un tasto accanto a «📅 Scegli date» che apre un **modo**: la heatmap si spegne,
i pallini spariscono, restano i confini, la vista si allarga e il pannello dei
cumulati diventa il pannello del radar. Tre tasti: **Adesso · ▶ -2 ore ·
+40 min**, con la scala colori vera in dBZ e mm/h e una **linea del tempo** a
tacche cliccabili. Si esce col tasto o scegliendo un periodo.

**FONTE UNICA: LibreWXR** (`api.librewxr.net/public/weather-maps.json`),
progetto open source che serve il composito europeo EUMETNET OPERA, CC BY,
senza chiave. Voce in `fonti.html`.

⚠️ **PERCHÉ NON IL RADAR DELLA PROTEZIONE CIVILE**, che sarebbe stata la scelta
ovvia. Due difetti misurati, non impressioni:
1. **le cumulate non tornano**: contati i pixel di pioggia sulla stessa
   tessera, 1h=2.888, 3h=204, 6h=1.272, 12h=19.156, 24h=128. Una finestra più
   lunga CONTIENE quella più corta, quindi 24 ore non può essere meno di 12;
2. **il velo grigio**: il VMI disegna la maschera della copertura radar come un
   grigio semitrasparente, il 41,5% dei pixel della tessera con sotto lo 0,02%
   di pioggia vera. LibreWXR sulla stessa zona: 0,6% di grigio e 2,52% di
   pioggia.
⚠️ **E nemmeno RainViewer**: API gratuita «solo uso personale o didattico», e
sopra lo zoom 7 restituisce sempre la stessa immagine finta.

### Le cose da sapere se ci si torna

⚠️ **LE FUNZIONI DEL SITO NON SONO GLOBALI.** Tutto lo script principale sta
dentro una IIFE: il radar è un `<script>` separato in fondo e vedeva
`fitMapToRegions` come `undefined`, scartandola IN SILENZIO dentro un `typeof`.
Un guasto muto, il tipo peggiore: il radar non inquadrava più niente e si
limitava a togliere zoom a quello che trovava, sommando le sottrazioni a ogni
chiamata (misurato: 6 → 5 → 4). Sono esposte `window._fitRegioni`,
`window._regioniAttive` e `window._centraStriscia`. Se una funzione del radar
«non fa niente», è la prima cosa da guardare.

⚠️ **LA LARGHEZZA SI MISURA DALL'INQUADRATURA DEL SITO, non da un fit sui
pallini.** Il fit sui pallini non c'entra niente con l'inquadratura vera della
regione, che riserva 420 px al pannello su desktop: sulla Lombardia il primo
dava 8,5 e lo standard 6, due tacche e mezzo di scarto che cambia con la
finestra e con la regione. Adesso si chiede al sito la SUA inquadratura e si
toglie `LARGHEZZA` (1 livello) da lì. Misurato: analisi 9,25 → radar 8,25.

⚠️ **USCENDO SI TORNA ALL'INQUADRATURA DELL'ANALISI**, e sul telefono NON basta
`fitMapToRegions`: quella inquadra la mappa intera, ma metà mappa sta sotto al
pannello. Va seguita da `centraRegioneInStriscia`, in due tempi. Senza, la
regione restava mezza nascosta dietro al pannello: lo zoom giusto, la posizione
no.

⚠️ **L'ANIMAZIONE PARTE QUANDO SONO PRONTI TUTTI I FOTOGRAMMI**, non solo il
primo: era quello il tremolio del «+40 min», che ha pochi fotogrammi e ci
ripassa sopra in fretta. Tetto di 8 secondi per non restare fermi su rete lenta.

⚠️ **LA SCORTA.** Tetto di 3 secondi e una riprova (misurati 8-9 s reali: i
timer slittano mentre la pagina carica le tessere). Se cade ENTRANDO il modo non
si apre e lo dice `#tp-status`; se cade a radar acceso resta l'ultimo fotogramma
e la riga dichiara di quando è, **ma solo se quel fotogramma c'è davvero**
(`strati.length`): annunciare una cosa che lo schermo non mostra è peggio del
guasto. Cache di 60 secondi. NESSUN ripiego su un'altra fonte.

⚠️ **IL TASTO «IMMAGINE» SPARISCE APPOSTA** in modo radar: le tessere LibreWXR
non mandano `Access-Control-Allow-Origin` e sporcherebbero il canvas dello
scatto, rompendo la foto per tutto il resto. Il link invece resta e porta il
radar (`?radar=ora|due|prev`).

⚠️ **IL NOME È «DIRETTA RADAR»**, misurato: a 360 px «Radar meteo live» e
«Radar in diretta» vanno a capo e fanno il tasto alto 77 px contro i 54 del
gemello «Scegli date». Ci stanno su una riga «Radar meteo», «Radar pioggia» e
«Diretta radar».

⚠️ **LE NUVOLE DA SATELLITE SONO STATE TOLTE**, non dimenticate: l'infrarosso
copre il 100% della tessera e il cielo sereno è un grigio medio (luminosità 92
su 255), si vedevano male comunque. Non riproporle senza una fonte migliore.

⚠️ **MISURARE LO ZOOM COL RIQUADRO DEL BROWSER NASCOSTO NON VALE NIENTE**: la
finestra è 0×0, `getBoundsZoom` restituisce il massimo e si legge zoom 16,5 dove
non c'è nessun difetto. Prima di misurare un'inquadratura si impone una
dimensione alla finestra.

---

## La scheda «Iscriviti» e il ringraziamento (31 agosto 2026)

Sul desktop il nome sta su **una riga** e sotto, a tutta larghezza, c'è il
ringraziamento per le analisi; sul telefono la stessa cosa in due righe dentro
la pillola. La guida al pluviometro è stata **riaccesa** e adesso «Iscriviti»
**partecipa al sorteggio** come una faccia della moneta: prima il dado sceglieva
solo fra le vetrine, quindi era o sempre vetrina o mai. Misurato su 26 aperture:
11 vetrina e 15 Iscriviti.

⚠️ **IL NOME A 21 px E NON 23.** A 23 «Avventure Micologiche» NON ci sta nella
colonna accanto ad Archie e va a capo in «Avventure» / «Micologiche»: era così
da sempre. La colonna è larga 249 px. Archie resta 80 px.

⚠️ **IL RINGRAZIAMENTO STA SOTTO**, non nella colonna: lì andrebbe a capo
quattro volte e la scheda diventerebbe una colonna sbilenca. La scheda passa da
162 a 234 px.

⚠️ **LA VETRINA NON CAMBIA DI UN PIXEL**: quando parte, l'innerHTML di
`#channel-logo` viene riscritto e `.v-grazie` sparisce da sola.

**Il numero**, letto da GA4 il 31/8/2026: `analisi_regione` = **35.791 eventi da
3.264 utenti**, dal 18/7/2026 (giorno in cui l'evento è stato aggiunto) al 31/8.
Verificato che allargando la finestra al 1/1/2025 il numero non cambia: è tutto
lo storico. In pagina si scrive «oltre 35.000», che resta vero mentre il conto
sale.

---

## L'intensita' della pioggia: ore bagnate e punta oraria (12 settembre 2026)

Ogni stazione-giorno porta un campo compatto in piu':

    i: [ore bagnate, punta oraria in mm]

I millimetri all'ora si ricavano dividendo `mm` per le ore bagnate: non si
scrivono, sarebbero un terzo numero deducibile dagli altri due.

**PERCHE'.** La stessa pioggia in un'ora vale meno che in otto: quella che
scende piano entra nel terreno, quella che scroscia corre via. Il 10 settembre
2026 in Liguria **Fontana Fresca** ha contato **35,6 mm in 3 ore** con una
punta di 19,8, e **Passo della Cisa 34,6 mm in 8 ore** sparse dalle tre del
mattino alle sette di sera. Sulla mappa erano la stessa giornata. Per chi cerca
funghi no. Idea nata dal confronto con labuttata.it del 10/9.

**COSTA ZERO RICHIESTE.** I collector percorrevano gia' la serie oraria per
fare la somma del giorno e contavano gia' le ore valide: sono due numeri dentro
un ciclo che esiste. Stessa ricetta con cui sono entrati temperatura, vento e
umidita'. Peso sui file: **+8,6%** misurato su sette cartelle in un giorno
piovoso, ed e' lo stesso ordine del campo `u` (+8% il 18/8). Sui giorni asciutti
il campo non si scrive affatto.

### La libreria, e perche' ce n'e' una

`.github/scripts/lib-intensita.js` — `creaOre()`, `segna(ore, chiave, mm)`,
`intensita(ore)`.

⚠️ **SI CONTA SEMPRE PER ORE PIENE, anche dove la rete pubblica ogni 5, 10 o
30 minuti.** Senza questo passaggio una rete a 10 minuti direbbe «84 fasce
bagnate» e una oraria «7»: i due numeri non sarebbero confrontabili fra loro
ne' con la scala meteorologica, che e' in millimetri ALL'ORA. Il collector non
conta i campioni, li versa nell'ora a cui appartengono e il conto lo fa la
libreria.

⚠️ **`segna()` si chiama ANCHE per gli zeri**: il secchiello vuoto e' la prova
che quell'ora l'abbiamo letta. Chiamandola solo quando piove, un giorno con due
ore di pioggia e ventidue di silenzio risulterebbe letto per due ore e finirebbe
scartato dalla soglia.

Tre casi danno `null`, cioe' nessun campo nel file: meno di **20 ore lette**
(la durata non e' misurabile, stessa soglia di t/w/u), nessuna ora bagnata,
oppure meno di **0,5 mm** in tutto il giorno (0,2 mm in un'ora fanno 0,2 mm
all'ora, tecnicamente «lenta», ma e' rumore).

### Chi ce l'ha e chi no

**Nove collector**: Liguria, Piemonte, Lombardia, Svizzera, Austria, Francia,
Slovenia, OSMER Friuli e le 11 reti MeteoHub.

**Non ce l'hanno, e non e' una dimenticanza**: Toscana (il SIR pubblica solo la
differenza su 24 ore), Emilia e Trentino (solo l'aggregato del giorno), Veneto e
Alto Adige (contatori cumulativi letti sei o sette volte al giorno: con sette
letture l'ora non si ricostruisce). Sono quasi le stesse reti rimaste fuori dal
vento, e non e' un caso: chi non pubblica la serie non pubblica nemmeno quella.

### La chiave dell'ora, rete per rete

| rete | passo | chiave |
|---|---|---|
| Liguria, Piemonte, Francia, Svizzera, Austria | oraria | la marca del punto |
| Slovenia | mezz'ore | ora di (fine - 1 ms) |
| MeteoHub | da 5' a 60', varia per rete | ora di (`ref` - 1 ms) |
| Lombardia | 10' | l'ora la aggrega Socrata |
| OSMER Friuli | oraria, due giornate cucite | `'p'+h` e `'c'+h` |

⚠️ **OSMER: il prefisso non e' un vezzo.** Il giorno solare italiano si cuce
con la coda di ieri e la testa di oggi: senza `p`/`c`, l'ora 23 di ieri e
l'ora 23 di oggi finirebbero nello stesso secchiello.

⚠️ **LOMBARDIA: qui e' cambiata la QUERY, unico caso.** Prima chiedeva
`sum(valore)` raggruppato per sensore, cioe' un numero al giorno senza ore;
adesso raggruppa anche per ora con `date_extract_hh`, come faceva gia'
`fetchMeteoDay` per temperatura e vento, e la somma del giorno si fa in codice.
**Resta UNA sola richiesta**: cambia il numero di righe, non di chiamate. Il
tetto e' passato da 5.000 a 80.000 perche' ~250 sensori per 24 ore fanno 6.000
righe e a 5.000 la risposta verrebbe **troncata in silenzio**.

### ⚠️ La trappola che ha morso, e che mordera' ancora

Il collector **svizzero ricostruisce il record campo per campo** prima di
scriverlo (`const rec = {id, n, lat, lon, q, p, mm}` e poi copia `t`, `w`, `u`).
Il campo `i` veniva calcolato correttamente e **spariva li'**: millimetri
giusti, nessun errore, zero `i` nei file. E' la stessa firma del ramo
`addDefaultMarkersForRegion` dimenticato all'Austria il 7/8: **il pezzo che
manca e' la consegna, non il calcolo**.

**Quindi la prova non e' «il codice c'e'», e' APRIRE IL FILE SCRITTO** e
contare le stazioni che hanno il campo.

### Come si e' collaudato

- `prova-intensita.js` (cartella claudio): 17 prove — casi limite, i numeri
  veri del 10 settembre, e la chiave dell'ora di ogni rete compreso MeteoHub a
  tutti e cinque i passi. Da rilanciare quando si tocca la libreria.
- `scratchpad/prova-collector.py`: lancia un collector VERO spostando la sola
  riga della cartella di uscita su una cartella di prova, e poi la rimette.
  Cosi' si prova contro l'API vera senza toccare `data/`, che e' tracciata e la
  riscrivono i cron.
- **Il controllo che conta e' che i MILLIMETRI non cambino di un decimo.**
  Misurato: Liguria 0 differenze su 198, Svizzera 0 su 270, Slovenia 0 su 798,
  OSMER 0 su 246, Lombardia 0 su 254 (ed e' quella dove la query e' cambiata),
  Austria 3 su 2.683, Piemonte 1 su 270 (la passata ufficiale, non noi).
- **Francia e MeteoHub non si sono potute provare in locale**: vogliono la
  chiave Meteo-France e i secret MH_USER/MH_PASS, che stanno su GitHub. Per
  loro valgono le prove sintetiche e **il primo giro dei cron va guardato**.

⚠️ **LA SCADENZA, ED E' MISURATA.** Il passato non si recupera. Chiesto a OMIRL
il 12/9: le ore del **10 e dell'11 settembre** rispondono con 198 stazioni,
quelle del **9 con ZERO**. La finestra e' ~69 ore, il Piemonte ~2 giorni. Da qui
in avanti il dato cresce di un giorno al giorno.

⚠️ **SULLE PAGINE FUNGHI ARRIVA CON VENTI GIORNI DI RITARDO**: la finestra dei
funghi guarda da 13 a 20 giorni fa, quindi la prima interamente coperta si
chiude venti giorni dopo la partenza. In mappa invece funziona dal giorno dopo.

### La scala, quando si mostrera'

**2 e 6 mm all'ora**, scelte dall'utente il 12/9 sui dati veri: sotto 2 lenta,
da 2 a 6 media, sopra 6 forte. Sono **le stesse soglie della convenzione
meteorologica italiana** (il WMO taglia a 2,5 e 7,6).
⚠️ Le soglie dette il 10/9 (1 e 4) **non reggevano alla prova**: sulle 87
stazioni liguri sopra i 5 mm del 10 settembre davano 4 lente e 45 forti, cioe'
la prima fascia quasi sempre vuota. Con 2 e 6 fanno 16 / 42 / 29.
⚠️ **Il nostro numero non e' l'intensita' istantanea**: e' il totale diviso le
ore bagnate, e quelle ore non sono attaccate. Sta sempre sotto la punta, e sulla
pagina va scritto cosa si e' misurato. Chi e' direttamente confrontabile con la
scala e' la **punta oraria**.
⚠️ **Niente scala di colori sui pallini**: il colore significa gia' i
millimetri, un secondo significato sullo stesso oggetto va spiegato.

**Dal 13/9/2026 l'intensita' si mostra anche nella scheda della mappa e sotto il
grafico delle pagine di paese**, solo numeri («10 set · 143,7 mm in 19 ore ·
punta 30,3 mm in un'ora»), con l'invito «Tocca/Clicca una barra».
- Mappa: `histFromFiles` porta `i`; `histRigaIntensita` racconta il giorno piu'
  piovoso del periodo, le colonne `.sh-bars .sh-hits` cambiano giorno; col
  periodo di un giorno solo durata e punta vanno nelle righe `.sh-ore` in alto.
- Pagine di paese: `serieI` in `data/funghi/<reg>-giorni.json`, scritta da
  `genera-funghi.js` SOLO per i giorni da 5 mm in su (la serie piena costava
  +51%). L'aggettivo lenta/media/battente resta nella frase della pioggia forte.

---

## La mappa boschi (v10.2, 21 settembre 2026)

Un **modo** della mappa, come il radar: tasto «🌲 Mappa boschi» nel pannello,
heatmap e pallini spenti, sopra la mappa il retino delle **carte forestali
ufficiali** in **dieci** colori. In produzione dal 16/9 con nove regioni; dalla
v10 sono **21, cioe' tutta Italia**. Nata il 15/9 dal confronto con
ilcercafunghi.it.

### 🔵 IL DECIMO COLORE: «carpino nero, orniello e aceri» (21 settembre 2026)

Nato da una domanda sua sulla Toscana. Gli orno-ostrieti finivano in «altri
boschi», e in **Toscana e Campania erano piu' di META' del grigio** (52,6% e
60,1%): toccando una macchia grigia li', quasi sempre sotto c'era questo.
**Diciotto regioni su 21** ce l'hanno nella loro carta. Grigio complessivo
**-35%**, Marche da 46,1% a 15,7%.

⚠️ **Non e' il carpino BIANCO**: querco-carpineti e «boschi di carpino bianco»
restano nei querceti. Quello sta in pianura umida ed e' un altro albero.

⚠️ **IL NOME DICE «E ACERI» PERCHE' IL DATO DICE COSI'.** Chiesti gli ettari a
ISPRA: nelle Marche l'**89%** e in Campania il **100%** dell'azzurro viene dal
codice MISTO «boschi xerici a ornielli, carpini e aceri», non dal codice puro
`41.81`. In Toscana e Umbria e' il contrario (91-92% puro). Chiamarlo solo
«carpino nero e orniello» prometteva piu' precisione di quella che il dato ha:
stessa regola di «conifere non precisate».

⚠️ **La dimensione e' della fonte, non nostra**: ISPRA dice che nelle Marche gli
orno-ostrieti sono il **32,0%** del bosco, le nostre tessere dicono 31,8%.

### ⚠️ IL CONTROLLO A TAPPETO, E PERCHE' ESISTE

Il 21/9 il primo giro aveva dichiarato «13 regioni». **Una sola domanda sua
(«mettimi la Lombardia zona Bergamo-Brescia») ha fatto saltare fuori altre
cinque regioni** che ce l'avevano e finivano nel grigio. Il censimento cercava
le PAROLE dentro il nostro codice: cieco dove ci sono solo sigle (`OS` in
Piemonte e Liguria), numeri (Abruzzo 41-43) o id di livello (Lombardia).

**La regola che ne esce: si interroga la FONTE, non la nostra tabella.** Gli
attrezzi stanno in `audit-boschi\` (cartella di lavoro, non nel repo):
`audit-ispra.py`, `audit-arcgis.py`, `audit-shapefile.py`, `audit-wfs*.py`,
`sonda-piemonte2.py`, `audit-sicilia.py`. Esito su tutte e 21: ISPRA 7/7
complete, Veneto 18/18, Trentino 54/54, Emilia 48/48, Friuli 21/21, Alto Adige
86/86, Lazio 16/16, Liguria 18/18 (52.044 poligoni letti a pagine: ⚠️ GeoServer
tronca a 5.000), Lombardia 47/47, Abruzzo 33/33, Puglia 20/20, Basilicata 44/44,
Valle d'Aosta 17/17.

⚠️ **PIEMONTE: mancava la categoria `OV`** (Alneti di ontano verde) e quelle
aree **non venivano disegnate affatto**, buchi trasparenti: ~1,1% del bosco
piemontese, 3,3% in Val Sesia, e su un blocco alpino la superficie disegnata
passa da 11,1% a 22,3%. Trovata chiedendo al WMS di disegnare **tutto cio' che
NON e' nella nostra tabella**: e' la sonda da riusare. Messa in «altri boschi»
come gli alneti e per la ragione delle mughete.

✅ **SICILIA, CHIUSO il 22/9/2026 e non si riapre.** Il codice `06070202ZY`
(«non definito») resta mappato a `None` ed e' GIUSTO cosi'. Il «32,8% dei
poligoni» era un conto troncato (l'ArcGIS siciliano da' al massimo 500 poligoni
per richiesta, e sei riquadri da 500 sono la firma del taglio). E `ZY` non e'
bosco: la carta ha anche la classe inventariale, e i «non definito» stanno solo
in 05 prati-pascoli-incolti (95%), 04 aree prive di soprassuolo e 01
arboricoltura; il server conferma **zero** poligoni di bosco, bosco rado o
arbusteti col tipo non definito. Disegnarli dipingerebbe di bosco i pascoli.
Controprova: le tessere disegnano 5.267 km², l'Inventario Forestale regionale
dichiara 5.156 (+2,2%). Attrezzo: `audit-boschi\sicilia-che-cosa-e-zy.py`.

### ⚠️ LA LEGENDA TAGLIATA SU FINESTRA BASSA (21 settembre 2026)

Sua schermata: «perche' con questo pc la legenda finisce fuori?». Monitor
1920x1080 con **Windows al 125%** = finestra **1536x702 px CSS**. Sparivano due
voci intere.

⚠️ **IL LIMITE E' IL FONDO DELLA MAPPA, NON `window.innerHeight`.** Il pannello
e' `position:absolute` dentro `#map`, che ha `overflow:hidden`. Quando la
finestra e' bassa la mappa e' piu' corta della finestra (sotto c'e' il pie' di
pagina) e taglia. `positionPanels` controllava la finestra, quindi il conto
tornava sempre e non si vedeva niente: alla sua misura mappa alta 618, pannello
219 a partire da 451, **52 px fuori**. In produzione sbordava in **sei casi su
nove** fra le misure provate, fino a 71 px.

Non l'ha causato il decimo colore: il pannello e' alto uguale con nove voci, si
perdeva una voce sola invece di due.

**Il rimedio e' triplo, perche' da solo nessuno bastava:**
1. il limite e' `leg.offsetParent.clientHeight`, cioe' la mappa; se non basta il
   pannello si accorcia e scorre invece di tagliare;
2. sotto i 780 px di finestra la legenda dei boschi ha le righe **piu' fitte e
   un filo piu' piccole**: 219 -> 203 px naturali, e alla sua misura le voci
   visibili senza scorrere passano da 6 a 8 su 10;
3. un `ResizeObserver` sul pannello, perche' **cresce dopo** il posizionamento
   (il radar quando arrivano le durate, i boschi con `indice.json`): a 30 ms era
   ancora corto e il tetto si calcolava su un numero vecchio.

⚠️ **TRE COLONNE: PROVATA, PUBBLICATA E TOLTA NEL GIRO DI UN'ORA.** Per far
stare dieci voci in quattro righe il pannello andava allargato a 660 px, e lui
l'ha bocciata appena vista: «si allarga a destra e copre troppo la mappa». Ed e'
giusto: **sulla mappa lo spazio ORIZZONTALE vale piu' di quello verticale**,
perche' e' quello che fa vedere il territorio. Stringere di piu' in verticale
(via la riga della fonte, meno imbottitura) porta il naturale a 170 px ma **non
aggiunge nemmeno una voce visibile**, perche' lo spazio utile e' 157: quindi ci
si ferma, e la riga della fonte resta, che e' l'attribuzione della licenza.

⚠️ **Il tetto si calcola sull'altezza NATURALE**: `max-height` si azzera prima di
misurare. Senza, il conto si fa su un numero che dipende da se stesso e al
secondo giro si annulla da solo (lo ha fatto venire fuori l'osservatore).

### Altri due difetti della legenda, trovati da lui lo stesso giorno

⚠️ **LA ROTELLINA SULLA LEGENDA ZOOMAVA LA MAPPA.** Il pannello vive dentro il
contenitore Leaflet, che si prende la rotellina prima che arrivi alla barra di
scorrimento: misurato, girando la rotella sulla legenda lo zoom passava da 8,5 a
7,25 e la legenda non scorreva di un pixel. Rimedio: `disableScrollPropagation`
+ `disableClickPropagation` sul pannello, la stessa cura gia' usata per la
casella di ricerca (22/8) e per la tendina dei boschi. Si mette una volta sola
(`_scrollFermato`), se no si riattacca a ogni riposizionamento.
⚠️ Controllato che non rompa i comandi DENTRO la legenda: «Confronta con piogge»
e' uno `<span role=button>` e non un `<button>`, ed e' proprio il caso a rischio;
si apre identico a prima. Sul telefono la maniglia funziona in tutti e sei i
passaggi.

⚠️ **LE DATE PULSAVANO COI BOSCHI ACCESI.** La regola che spegne il richiamo
c'era dal 31/8 **ma solo per il radar**: i boschi sono arrivati dopo e nessuno ce
li ha aggiunti. Una riga di CSS. ⚠️ Verificato che il pulsare resti quando serve
davvero, cioe' regione scelta, nessun periodo e nessuna modalita' accesa.

**Collaudo**: `prova-tre-modi.js` (6 misure x 3 modalita' = 18 combinazioni,
tutte dentro la mappa) e `prova-telefono-legenda.js` (360x640 e 393x760
identici a prima: la regola parte da 901 px).

⚠️ **Valle d'Aosta, unica mappata per COLORE**: i 17 titoli del server
combaciano ancora uno a uno. I pixel di bordo fuori legenda vanno al colore piu'
vicino entro 35; quelli davvero scartati sono l'**1,45%**, misurato.

### Dove sta la roba

- **Tessere**: `tessere-boschi/italia/<z>/<x>/<y>.png`, zoom 5-13, ~31.500
  file, una serie SOLA per tutta Italia (ai confini le carte si fondono senza
  cuciture). Le fa `tessere-boschi.py` nel banco di lavoro (cartella claudio),
  dalla cache `cache-boschi`; ogni regione ha il suo scaricatore (`wms-sld`,
  `arcgis-def`, `arcgis-query`...), tutte finiscono negli stessi gruppi.
- **`tessere-boschi/italia/indice.json`**: gruppi e colori, regioni con fonte e
  licenza, elenco delle tessere esistenti. **E' l'unica fonte di verita'**: lo
  leggono la legenda della mappa, il tocco sul bosco e `.github/scripts/lib-boschi.js`
  (blocco «Che boschi ci sono» delle pagine funghi). Niente liste doppie.
- **Anteprime** per le pagine funghi: `tessere-boschi/anteprime/<regione>.jpg`
  (21, 1600x1000), accanto alle tessere e NON sul ramo `anteprime` delle piogge,
  perche' non cambiano. Le fa `anteprime-boschi.js` (cartella claudio).
- ⚠️ **Le tessere viaggiano col deploy** (`tessere-boschi/` non e' nella regola
  ignore): ogni cambio di tessere e' un deploy, ~15 crediti. Il commit di ~30.000
  file impiega **circa mezz'ora**: si lancia in background.

### I nove gruppi

| gruppo | colore |
|---|---|
| faggete | `#1b9e77` |
| castagneti | `#d95f02` |
| querceti | `#e6ab02` |
| cerrete | `#7a1f3d` |
| abetaie e peccete | `#264b73` |
| lariceti | `#ffe14d` |
| pinete | `#e7298a` |
| robinieti | `#66a61e` |
| conifere non precisate | `#7a5cc8` |
| carpino, orniello e aceri | `#2e9bd6` |
| pioppi, salici, ontani e frassini | `#f7a1c4` |
| altri boschi | `#8c8c8c` |

⚠️ **UNDICESIMO COLORE, 26/9/2026: «pioppi, salici, ontani e frassini»** (rosa
chiaro, scelto da lui sul Ticino fra giallo, rosa, lilla e turchese: il giallo
si fondeva coi querceti). Voci ripariali di TUTTE le 21 carte (ISPRA 44.*,
Piemonte SP e AN, Lombardia 5/7/27/39, Puglia 3115, Basilicata 136-140...).
NON ci vanno: ontano verde, Alnus cordata, pioppo tremulo, forre,
aceri-frassineti di monte, pioppeti coltivati, le «Alnete» di Veneto e Friuli.
⚠️ **Le Alnete restano nel grigio, DECISO il 28/9/2026 (suo), non riproporlo**:
quelle due carte mettono nella stessa voce l'ontano verde (arbusto d'alta quota,
grigio dappertutto) e l'ontano nero/bianco dei fiumi, e dalla voce non si
separano. Scartata la separazione per quota (riscarico + tessere, un deploy):
col rosa si colorerebbero da fiume gli ontani verdi di montagna.
Nel centro-sud il rosa e' 70% pioppi. In Italia e' il 3,3% del bosco.
- Il carpino ha perso «nero» nel nome (sua scelta): la legenda sta su TRE
  colonne a 11 px in 4 righe, e «carpino, orniello e aceri» entra nella terza.
  E' sempre il carpino NERO (Ostrya); il bianco resta nei querceti.
- ~~Tessere su un RAMO del repo Tessere (`boschi-di-fiume`)~~: storia chiusa. Con le cerrete (25/10/2026) main e'
  diventato un commit unico (`928ee210` + `e19f7b19`); il ramo `boschi-di-fiume` e' stato CANCELLATO il 26/10/2026
  (GitHub, locale, gc: da 1,86 GB a 731 MB), dopo aver spostato su e19f7b19 il rilievo delle 31 pagine /meteo/, che
  lo leggevano ancora da li'. ⚠️ Cambiando `TESSERE_COMMIT` in index.html va cambiato anche `RILIEVO` in
  `genera-pagine-meteo-zona.js` (e rigenerate le pagine /meteo/).
- ⚠️ **PUGLIA: il suo ArcGIS in affanno restituisce immagini VUOTE senza
  errore.** Riscaricata intera perdeva il 25% del bosco. Rifatta partendo
  dalla cache vecchia col rosa sopra (`puglia-fiume-sopra.py` nel banco).
  **Dopo ogni riscarico si confronta la copertura regione per regione** con la
  cache precedente (`cache-boschi\_<reg>-prima-dell-undicesimo`).
- Il riscarico ha chiuso un **buco nel Lazio orientale** (Monti Lucretili):
  +3,5% di bosco nel Lazio, 17 tessere nuove.
- Quote per regione (riconosciuto / conifere n.p. / grigio):
  `audit-boschi\quote-per-regione.py`. Italia 82,4 / 3,6 / 14,1.

⚠️ **DODICESIMO COLORE, 25/10/2026: «cerrete»** (bordeaux `#7a1f3d`, scelto da lui: il marrone era troppo
simile ai castagneti). Nato da una segnalazione sulla carta toscana, che separa le cerrete dai querceti. Gli
undici colori di prima NON cambiano («sono abituati»). Solo nelle **14 regioni la cui carta le separa**
(Piemonte, Lombardia, Liguria, Emilia, Toscana, Umbria, Marche, Lazio, Abruzzo, Molise, Campania, Basilicata,
Calabria, Sicilia; ISPRA 41.741/41.7511/41.7512, «cerro e farnetto» compreso); **la Puglia resta nei querceti**,
e altrove il cerro sta nei querceti. 1.251.000 ha contro 2.170.000 di querceti.
- **Dipinte sopra la cache**, non riscaricate: `dipingi-cerrete.py` (banco) mette il bordeaux solo dove la cache
  e' ocra E la maschera del cerro della carta regionale dice cerro. Cache di prima in `cache-boschi\_<reg>-prima-delle-cerrete`.
- ⚠️ **I PUNTINI BORDEAUX DOVE IL CERRO NON C'E'** (trovati e corretti la sera stessa). Le tessere si rimpiccioliscono
  con LANCZOS e poi ogni pixel va al colore piu' vicino: col dodicesimo colore il misto di bordo (abetaie accanto a
  pinete) finiva a volte sul bordeaux, e in Alto Adige o in Comelico il tocco diceva «cerrete». Ora `finalizza(t, cerr)`
  in `tessere-boschi.py` sceglie il bordeaux solo dove la frazione di cerrete vere del pixel (maschera del blocco z14
  ridotta a media semplice) e' >= 25%: fuori dalle cerrete le tessere sono identiche a quelle di prima, pixel per
  pixel. **Vale per ogni colore nuovo futuro**: un colore aggiunto alla tavolozza «ruba» i misti di bordo degli altri.
- Legenda a **12 voci su 4 righe** (variante C, sua scelta): in legenda «pioppi, salici e ontani», il nome intero
  nel `title`, nel tocco e nelle pagine (`BO_CORTI` in index.html).
- Pagina **«Querceti e cerrete»** allo stesso indirizzo `/mappa-forestale/querceti/` (somma i due tipi, barre a due
  colori); `tipi-per-le-pagine.py` tiene le cerrete solo nelle 14 regioni (altrove erano pixel di bordo della cache).
- Repo Tessere: main = `928ee210` (commit unico, push forzato) + `e19f7b19` (il rimedio, 3.148 tessere).
  ⚠️ **Un commit orfano rimanda TUTTO** (git non trova tessere in comune senza un antenato comune: 712 MB per un
  cambio di 120), quindi le correzioni dopo si fanno come commit figli. Rilievo e quote sono identici a prima.

- ⚠️ **«abetaie e peccete», MAI «abetine»** (decisione dell'utente, 16/9).
- ⚠️ **«pinete» solo se la carta dice pino.** Una conifera senza specie va in
  **«conifere non precisate»** (~295.000 ha, quasi tutti ISPRA Carta della
  Natura, codici 42.G e 83.31, piu' Lazio, Abruzzo, Sicilia ed Emilia). Prima
  finivano in «altri boschi», e Boscolungo all'Abetone, abetaia vera, era grigio:
  il grigio diceva «non conifera», che e' un'altra cosa falsa.
- **Riserve naturali biogenetiche dello Stato**: dentro i confini EUAP le
  conifere non precisate prendono la specie della riserva (abetaie ad Abetone,
  Vallombrosa, Camaldoli, Acquerino, Pian degli Ontani, Campolino, Scodella,
  Badia Prataglia, Campigna; pinete di laricio a Trenta Coste; **Gariglione
  esclusa** perche' mista). ~1.700 ha. `riserve-boschi.json` nel banco,
  `correggi_riserve()` in `tessere-boschi.py`, al momento delle tessere: la
  cache resta pura.
- ⚠️ **PROVATE E SCARTATE**, non riproporle: la carta europea delle specie di
  OpenGeoHub (0 abeti su 124 abetaie note dell'Appennino) e la soglia di quota
  per separare pini e abeti (in Abruzzo il 78% delle pinete sta sopra i 1.200 m).
- **I colori si cambiano riscrivendo la sola tavolozza** delle tessere (PNG a
  tavolozza di 9 colori, chunk `PLTE`), senza rifare il disegno: pochi secondi
  su 31.500 file. Cosi' il 19/9 il viola e' passato da `#7570b3` a `#7a5cc8`:
  con l'opacita' 0,7 il vecchio diventava un lilla-grigio che si confondeva col
  blu notte e col grigio. **Un colore si sceglie sulla mappa vera**, non sul
  quadratino: in puppeteer si intercettano tessere e `indice.json` e si
  ricolora al volo (`prova-colori-abetaie.js` nello scratchpad del 19/9).
  Scartati quel giorno: azzurro puffo, cobalto e ciano per le abetaie.
- ⚠️ Cambiando un colore si cambiano TRE posti: tavolozza delle tessere,
  `indice.json`, `GRUPPI` in `tessere-boschi.py`. E si riscattano le immagini
  con la legenda dentro: le 21 anteprime, le foto della guida, l'immagine della
  home.

### Il tocco sul bosco

Un tocco (o un clic) dice il tipo di bosco in quel punto, in una nuvoletta.
**Non chiede niente a nessuno**: legge il COLORE della tessera sotto il dito
(PNG servite dal nostro dominio, quindi il canvas le puo' leggere) e lo riporta
al gruppo piu' vicino di `indice.gruppi`. Se il dito cade in un buco del mosaico
guarda intorno per qualche pixel e scrive «qui intorno». Evento GA4
`click_boschi` con `stato:'tocco'`.
- ⚠️ In modo boschi i contorni delle regioni hanno `pointer-events:none`: si
  mangiavano il tocco e TOGLIEVANO la regione, e con lei l'analisi.
- ⚠️ In modo boschi il tocco non apre le schede dei pallini (`_boschiAcceso`).

### La tendina pioggia | boschi

«⇆ Confronta con piogge», nella riga del titolo della legenda (su una riga a
parte il pannello del telefono cresceva di 33 px). Una linea da trascinare: a
sinistra SOLO la pioggia dell'analisi, a destra SOLO i boschi. Pioggia e boschi
sovrapposti erano stati bocciati il 15/9; qui non si sovrappongono mai.
- ⚠️ **Si ritagliano DUE strati**: il pane dei boschi e il canvas della
  heatmap. Le tessere sono al 70%, e la pioggia si vedrebbe attraverso.
- ⚠️ **`clip` e non `clip-path`**: il pane dei boschi e' un div di dimensione
  zero (Leaflet) e le percentuali di `clip-path` non avrebbero niente su cui
  calcolarsi.
- **Senza un'analisi dietro** il tasto non sceglie il periodo da solo
  (bocciato: «io devo poter scegliere»): chiede il periodo in rosso e, calcolato
  quello, torna ai boschi con la tendina aperta.
- **Con la tendina aperta, un periodo nuovo la CHIUDE** e si torna alla pioggia
  (dal 19/9, sua decisione: «chiudila come su Android»). Sul telefono lo faceva
  gia': per cambiare data si passa da «Indietro».
- **La barra si spiega da sola alle prime QUATTRO aperture col tasto**: va
  avanti e indietro (1,6 s), il pallino pulsa, la nuvoletta «Trascina la barra ⇆»
  resta fino al primo trascinamento. Contatore in localStorage `boTendVolte`
  (dentro `try`: in navigazione privata la dimostrazione compare sempre). Le
  riaperture automatiche dopo un cambio di periodo non ne consumano una. Nata
  dalla prova con gli utenti sul test: «pensavano fosse la stessa zona a
  confronto».
- L'etichetta di sinistra dice il periodo («◀ 💧 Pioggia 12-18 set»), letto dal
  link dell'analisi.
- Sul telefono pomello ed etichette stanno al 30% dell'altezza: la meta' bassa
  della mappa e' sotto la legenda.

### Altre cose della v10

- **Con una scheda di pluviometro aperta, un clic dentro la regione chiude la
  scheda** invece di accendere o spegnere la regione (dal computer). Il
  poligono fermava il clic e `map.on('click')` non lo vedeva mai.
  ⚠️ `histEl.style.display==='block'` e non `!=='none'`: all'apertura lo style
  e' vuoto e il primo clic sulle regioni si perdeva.
- **In modo boschi sul telefono la pillola del canale sparisce** e la regione si
  rimette al centro della striscia libera.
- **Niente riga «Segnalacelo» nella legenda** (tolta il 19/9: la legenda ha gia'
  troppo poco spazio). L'invito a segnalare i boschi sbagliati sta in guida,
  fonti e nei testi social.

### Licenze e fonti

Una voce per carta in `fonti.html`, e il campo `licenza` di `indice.json` finisce
nell'attribuzione della mappa («fonte (licenza)»): **diciture CORTE**. Casi da
ricordare: Veneto «citazione obbligatoria» (la scheda del 2006 vieta la
distribuzione a terzi); Abruzzo CC BY-NC 3.0 (mail per il non commerciale:
**lui ha detto di lasciar perdere**, non riproporla); Puglia e Basilicata senza
licenza scritta, dato aperto per CAD art. 52; Alto Adige CC0 ma **tipi
naturali**, modellati e poi tarati sul terreno (l'utente non vuole avvertenze in
guida o nelle pagine, resta la sola nota in fonti).

### Come si collauda

In locale (`python -m http.server` o il `launch.json` su 8898), mai sul test:
- `collaudo-boschi.js` (cartella claudio): desktop, 393 e 360.
- La tendina e il cambio di periodo vogliono **clic veri**: il sito ascolta solo
  gli eventi `isTrusted`. Col riquadro del browser nascosto i clic non arrivano:
  si usa puppeteer headless (`prova-tendina-periodo.js` nello scratchpad del 19/9).
- Dopo una ricolorazione: legenda col colore nuovo e tocco su un pixel di quel
  colore che restituisce il nome giusto (`prova-tocco-conifere.js`).

---

## La barra in basso sul telefono (v10.1, 20 settembre 2026)

Segnalazione di un utente: «da telefono la barra in basso toglie molto spazio
alla mappa, non sarebbe possibile un menu' a parte oppure ottimizzazione?».
Misurato a 360x640: la mappa aveva il **33%** dello schermo prima di scegliere
il periodo e il **37%** dopo. Ora arriva al **61%**.

⚠️ **LA BARRA DELLA SEGNALAZIONE E' LA LEGENDA, non il pannello dei periodi.**
Appena l'analisi riesce, `showLegendMobile` mette `#time-panel` in
`display:none` e al suo posto sale `#legend-panel`. Il pannello periodo, sul
telefono, si vede solo PRIMA della scelta e dopo «Indietro»: la prima mezza
giornata di lavoro e' andata sul pannello sbagliato.

### Cosa se ne va quando la legenda e' ridotta

Restano titolo, scala e «Indietro»; se ne vanno condivisione, statistiche,
vetrina e righe di provenienza.

| modo | intera | ridotta | mappa a 360x640 |
|---|---|---|---|
| pioggia | 278 px | **103** | 36% → **61%** |
| boschi | 245 px | **102** | 41% → **61%** |
| radar | 289 px | **151** | 34% → **55%** |

⚠️ **Gli avvisi rossi NON sono nell'elenco e non ci devono finire** (ieri, stime,
archivio GitHub, ritardo OSMER): stanno in questo pannello proprio perche' il
pannello periodo sotto e' spento e nessuno li leggerebbe. Verificato accendendone
uno a forza con la legenda ridotta.

### La regola dello stato (dettata dall'utente dopo la prova dal telefono)

Lo stato «ridotta» e' **di SESSIONE e legato alla FUNZIONE**. Niente
`localStorage`: chiudendo il sito si riparte grandi.

- si parte sempre grandi, qualunque analisi sia;
- ridotta a mano resta ridotta finche' si resta nella stessa funzione:
  **cambiare periodo non e' cambiare funzione**, e nemmeno aprire la tendina
  «Confronta»;
- **ogni passaggio fra date, mappa forestale e radar riparte grande**, in tutti e
  due i versi, anche tornando alle date con «Indietro»: il contenuto del pannello
  cambia da cima a fondo e uno gia' ridotto nasconderebbe roba mai vista (chi
  entra nei boschi ridotto non saprebbe nemmeno che i nove colori ci sono).

⚠️ **L'osservatore guarda QUALE funzione e' attiva, non `document.body.className`
intero.** Sul body cambiano anche `bo-tendina` (che si accende APRENDO LA
TENDINA), `senza-pallini` e `bo-lontano-on`: col confronto sulla stringa, aprire
«Confronta» riapriva il pannello da solo.

⚠️ Il legame con la funzione e' scritto anche in `funzRidotta`, non solo
nell'azzeramento all'evento: la classe sul body e `showLegendMobile` non
arrivano in un ordine garantito, e senza quello si vedeva un lampeggiamento.

### La maniglia, e perche' non basta il trattino grigio

⚠️ **Il trattino grigio da solo non lo legge nessuno, e la prova e' in casa**: il
pannello periodo ne ha uno identico dal primo giorno, e la segnalazione arriva da
un utente che non sapeva di poter chiudere. Quindi accanto alla freccia c'e' una
PAROLA — «riduci» da intera, «mostra tutto» da ridotta. Costa 7 px, ne
restituisce 175.

⚠️ **LA PASTICCA STA AL CENTRO, AL POSTO DELLA BARRETTA** (21/9/2026). Prima
stava a destra in `position:absolute`, e da ridotta finiva **esattamente sopra
«Indietro»: zero px di aria, stessa colonna**. Segnalato da lui con due
schermate, e misurato. In piu' da grande era testo nudo e da ridotta una
pasticca col bordo: le due facce dello stesso comando non si somigliavano.
Adesso e' **una faccia sola nei due stati**, al centro, e «Indietro» resta a
destra: non si possono piu' incrociare per nessuna lunghezza del titolo. Non e'
una questione di margini, e' la posizione. Costa **zero px** (la riga era alta
24, la pasticca e' alta 24).
⚠️ Il fondo e' **pieno e senza bordo** apposta: «Indietro» e' bianco col bordo
blu, e due pasticche uguali una sopra l'altra si confonderebbero.

⚠️ **La maniglia sta in una riga SUA, non nella riga del titolo**: la testata
cambia contenuto da un modo all'altro, e col radar lo spazio riservato li' dentro
spingeva «Invia link» fuori dallo schermo.

### ⏱ LA RIDUZIONE AUTOMATICA E' STATA TOLTA (21 settembre 2026)

C'era vissuta un giorno: otto secondi, solo le prime tre volte per telefono
(`legMiniVolte`), solo nel modo pioggia. Faceva due mestieri insieme, guadagnare
spazio e far vedere che il pannello si muove, e col tasto «riduci» scritto in
chiaro il secondo era gia' fatto: restava una cosa che si muove sotto le dita
mentre uno guarda la mappa.

**I numeri che l'hanno chiusa** (GA4 `legenda_mobile`, dalle 15:55 del 20/9 alle
7:45 del 21/9): **67 persone hanno ridotto il pannello da sole** (55 il primo
pomeriggio-sera su 383 utenti da telefono, 12 la mattina dopo su 41). Il tasto si
trova senza che nessuno lo dimostri.

⚠️ **Le riaperture non erano misurabili come si deve**: la riduzione automatica
non mandava nessun evento, quindi «intera» mescolava chi riapriva quello che
aveva ridotto lui e chi riapriva perche' gliel'aveva chiuso la dimostrazione. Se
un giorno si rimette una cosa che agisce da sola, **l'evento va mandato anche sul
passaggio automatico**, se no i due casi restano attaccati.

⚠️ `legMiniVolte` resta nel `localStorage` di chi c'e' passato: non si legge piu'
e non fa danno.

### Il pannello periodo: 287 → 241 px

I sei periodi su **una riga sola** (`.tp-periodi` + `display:contents` sui due
`.tp-grid3`), con «7 gg» al posto di «7 giorni» solo sul telefono, con la coppia
di span alla `.bo-nota .bo-lunga/.bo-corta`. Provato fino a **320 px**: nessuna
scritta va a capo. Da chiuso la striscia scrive il periodo scelto.
⚠️ La striscia si ricostruisce da `dataset.type`/`dataset.val`, **non da
`textContent`**: dentro il tasto ci sono due etichette e una e' nascosta col CSS,
quindi textContent scriverebbe «7 giornigg».
⚠️ **Il ripristino automatico non e' piu' appeso a `resize`**: sul telefono un
resize arriva a ogni comparsa della barra degli indirizzi, quindi chi chiudeva il
pannello a mano se lo ritrovava aperto al primo scorrimento della pagina.

### Il ricentro, che e' la meta' del lavoro

A ogni apertura e chiusura la regione si rimette al centro della striscia
visibile con `centraRegioneInStriscia`. **La mappa sta DIETRO al pannello** (il
div e' alto tutto lo schermo), quindi senza ricentro lo spazio guadagnato
sarebbe tutto mare: misurato sulla Liguria, la latitudine passa da 43,72 a 44,20
riducendo. Se l'utente ha spostato la mappa a mano (`_vistaUtente`, la stessa
spia dello scatto) **non si tocca niente**: provato con pinch e trascinamento
veri, zoom e centro invariati.
⚠️ **Il pannello periodo dimagrito ha allargato le regioni da solo**: la funzione
si misura il pannello a ogni chiamata, quindi non c'era niente da ritarare.
Misurato su otto regioni, scarto dal centro 0-5 px e zoom +0,25/+0,5 su sei
(Toscana 6,25 → 6,75, Sicilia 6,5 → 7); Liguria ed Emilia invariate perche' sono
gia' al 90-92% della larghezza.

### La nuvoletta della tendina rubava il gesto

`.bo-tend-guida` aveva `pointer-events:none`: dito e mouse le passavano
ATTRAVERSO e arrivavano alla mappa, che si spostava mentre la tendina restava
ferma. Ed e' il punto dove viene istintivo appoggiare il dito, visto che c'e'
scritto «Trascina la barra».
⚠️ **Col mouse funzionava e col dito no**: `fermaGuida` STACCAVA la nuvoletta dal
documento al primo tocco, e **un dito partito su un elemento orfano non consegna
piu' i `touchmove` ai gestori su `document`** — 0 px di spostamento col dito
contro 100 col mouse. Ora si nasconde (`style.display='none'`) invece di sparire,
e `guida()` la riaccende: verificato che torni alle prime 4 aperture e alla
quinta no.
⚠️ **Partendo dalla nuvoletta il gesto e' RELATIVO** (`scarto`): il pomello e'
largo 38 px e prenderlo di lato sposta la linea al massimo di 19, ma la nuvoletta
e' larga 141 e per un angolo la barra sarebbe schizzata di 70 px prima di
seguire il dito.

### Come si collauda

Tutto in locale (`launch.json` su 8898) con puppeteer headless e **tocchi veri**:
- `prova-regola-sessione.js` — gli undici passaggi della regola, uno per uno.
- `prova-nuvoletta-trascina.js` — trascina dall'angolo piu' scomodo della
  nuvoletta, col dito e col mouse, e controlla che la MAPPA non si muova.
- `prova-senza-8s.js` — i sei passaggi dopo aver tolto la riduzione automatica:
  dodici secondi fermi senza che si muova niente, tocco, cambio periodo, dentro e
  fuori dai boschi. (`prova-8secondi.js` e' di quando la dimostrazione c'era.)
  ⚠️ I gesti devono essere veri: `setZoom` da codice non accende `_vistaUtente` e
  la prova dice il contrario del vero. Il pinch si fa con `Input.dispatchTouchEvent`
  a due dita.
- `inq-pannello-periodo.js` — l'inquadratura col pannello periodo aperto,
  proiettando i vertici veri del confine; `BASE=<url>` per confrontare col sito
  vivo.
- `prova-maniglia-desktop.js` / `prova-periodi-desktop.js` — PC e tablet devono
  restare identici (maniglia 0x0 a 1440, 768 e 601 px).

⚠️ **Il confronto fra i due `index.html` si fa in Python, non in shell**: `sed` di
Git Bash scrivendo nello scratchpad spoglia i CRLF, e il diff dice «25.425 righe
diverse» cioe' tutto. Le righe davvero diverse erano 29 nel test e 434 in prod.

### Allineamento test/prod fatto quel giorno

⚠️ **Le uniche due righe davvero del test sono `og:image` e `twitter:image`**:
tutti gli URL dei dati sono identici, perche' il test legge dal repo di
produzione. Quindi `index.html` si copia intero e si rimettono quelle due.
⚠️ **NON si allineano le 1.045 pagine funghi, le 114 di zona e le 23 di regione**:
li' il TEST e' avanti (ha la riga «Ricordati» committata dal 18/9), e copiare
prod → test la cancellerebbe. Si guarda dentro i COMMIT, non i file sul disco.
⚠️ **L'esito di un push si legge da `$?`, non da una pipe**: `if git push | tail -3`
legge lo stato di `tail`, che riesce sempre, e il ciclo dichiara «riuscito» su un
push rifiutato. Sul test capita davvero, perche' i cron scrivono in `data/` mentre
il nostro invio dura minuti (`pubblica-test.sh` nello scratchpad, sei tentativi).

---

## La forma dei tasti e la barra che scorre nella pioggia (31/10/2026, scheda 104 ter)

Sua richiesta alla scheda 104: «la parte meteo e' talmente bella che fa sembrare la parte pluvio obsoleta... pero' non
voglio sconvolgere le abitudini degli utenti», punti 2 (la barra che scorre anche in pluvio) e 3 (i tasti). Il punto 1
(la cartina satellite) e il 4 sono della 104. Provato dal vivo sulla mappa vera nel banco (`mockup-pluvio-104-ter\`:
`server-ter.js` porta 8900, `funzioni.html` = sei telefoni affiancati, uno per funzione) e deciso da lui punto per punto.
Codice: modulo «LA FORMA DEI TASTI E LA BARRA CHE SCORRE NELLA PIOGGIA» in fondo a `index.html` (uno `<style>` e uno
`<script>`), piu' due agganci nello script principale (`window._barraPioggia(sorted)` in `render()` subito dopo
`addMarkers`, e `window._pioggiaPer` accanto a `window._mapDebug`: regioni, nomi, periodo, `col`, pallini).
- **Una forma per tutti i tasti, regola SUA**: «come Previsioni Lombardia sotto, la stessa forma per qualsiasi tasto nella
  schermata, e il tasto riduci uguale in tutte le funzioni». La forma di `.inv-prev`: angoli 10, bordo di 1 px, gradino
  sotto di 3 px (`box-shadow:0 3px 0`), fondo sfumato dall'alto, premuto scende di 1 px. Il COLORE dice cosa fa: chiaro
  (`#fff→#e8eef7`, gradino `#a8b8ce`) normale, blu del meteo (`#3d8ce8→#1f6fd1`, gradino `#124a8a`) acceso, verde funghi
  e satellite acceso, giallo previsioni; «+40 min» del radar resta tratteggiato. I quattro numeri si leggono e non si
  toccano: piatti, angoli 10. Prima al telefono sette forme (angoli 0, 5, 9, 10, 14, 22 e la pillola di «riduci»).
  Vale per periodi, date, radar/boschi/satellite, funghi, Invia/Immagine/Copia link, Indietro, i tasti dei boschi,
  Adesso/-2 ore/+40 min, «+ regione», «Lombardia ▼», «riduci», il termometro, Nascondi boschi, Applica. Le previsioni
  restano col loro disegno (`body:not(.modo-prev)`). Specificita' con `html:root`: ⚠️ i quattro tasti dei boschi al
  telefono hanno `.tessera.tessera.tessera` con !important e hanno un selettore loro.
- **Gli spazi, una regola sola** (suo: «in seleziona periodo non e' distanziato correttamente»; misurati 0, 5, 5 px fra le
  righe): 6 px fra due tasti affiancati, 9 da una riga all'altra (6 d'aria sotto il gradino), 8 sotto «riduci» in tutte
  le funzioni (prima 6 nei boschi, 0 nella pioggia e nel radar). La riga «+ regione» tagliava il gradino (scorre di
  lato): 4 px sotto e 9 da «Lombardia ▼».
- Pannelli bianchi pieni (via il vetro, che sul satellite diventava grigio), angoli 12. Sotto ogni periodo le sue date
  (`.tp-d`: «7 gg / 24–30», al PC «7 giorni / 24–30 ott»; al PC basso, ≤780 px, niente date), riscritte a ogni ritorno
  sulla pagina (mezzanotte).
- **La barra che scorre** (`#pg-nastro`, le misure e lo scorrimento di `#vi-nastro`: 45 px/s, trascinabile con lo
  slancio, ferma col mouse sopra): i CAPOLUOGHI delle regioni scelte (`data/capoluoghi.json`, `piemonte-vda` e
  `trentino-aa` sono due regioni), ognuno col PLUVIOMETRO PIU' VICINO entro 10 km (il numero e' suo, non una stima), dal
  piu' bagnato; goccia col colore della scala. Sua scelta fra «Le citta'» e «Le piu' piovose» (nomi di stazione lunghi e
  sconosciuti). ⚠️ **Sotto 1 mm la citta' dice «asciutto»** (suo: «con ieri tantissimi posti danno 0,2 mm anche se non ha
  piovuto»): 0,2 mm e' una basculata (rugiada, nebbia); il 30/10 in Lombardia 23 pluviometri a 0,2, 229 a zero, uno sopra
  1 mm. Un tocco su una citta' porta la mappa al pluviometro e apre la sua scheda (GA `barra_pioggia` azione=tocco).
  **Il blocco rosso dice SOLO il periodo**, una riga: IERI, 7 GIORNI, 30 GIORNI, oppure le date (5–12 OTT, 28 SET–4 OTT; i
  funghi i loro giorni). Il posto e' gia' in cima allo schermo: con 2-3 regioni o un paese lungo il blocco non cambia
  (suo: «si puo' stringere; cosa scrivi con 2/3 regioni o un paese lungo?»). Colori del meteo, giallo e rosso.
  **Al telefono subito sotto «riduci»**, dentro la legenda, a tutta larghezza, al posto della riga «MM CUMULATI»; col
  pannello ridotto se ne va e il titolo torna. **Al computer in fondo alla mappa** come il meteo (crediti, fonte e
  termometro salgono). Solo sulla pioggia con un'analisi disegnata: via con previsioni, radar e boschi.
  Scartate da lui, non riproporre: barra sopra il pannello («toglie un sacco di spazio»), in fondo al pannello (decisa da
  me senza chiedere: «quando lo abbiamo deciso?»), «riduci» dentro la barra a destra («non si vedono le citta' che
  scorrono») o a linguetta sopra («e' brutto»), angoli tondi sulla barra, varianti «tessere» e «pillole» dei tasti.
- Boschi e satellite: «🛰 Satellite» a foto spenta, **«Torna alla mappa»** a foto accesa (era «🗺 Mappa» col disegnino,
  suo); il «new» del satellite nei boschi a sinistra.
- Lezione della giornata (suo: «mi stai facendo cose a caso senza logica e gusto estetico minimo»): le osservazioni
  si raccolgono tutte e si ragiona sul disegno intero, in TUTTE le funzioni (pioggia, ridotta, periodi, boschi,
  satellite, radar), non una pezza alla volta sulla sola pioggia.
- Prova: `prova-vera.js` (scratchpad della scheda 104 ter) sull'index.html vero servito in locale, al telefono 393 e
  360 e al PC: barra, spazi, angoli, tocco, riduci, previsioni avanti e indietro, ieri, tre regioni con date scelte,
  boschi, satellite, radar.

## La foto dal satellite sotto la pioggia e nelle previsioni (31/10/2026, scheda 104)

Suo il 31/10: «la parte meteo ora sulla mappa e' molto bella, ma talmente bella che fa sembrare la parte pluvio
obsoleta», senza sconvolgere le abitudini. Scelte sue nella prova a schermo pieno in Chrome (banco
`mockup-pluvio-104\`, server `server-104.js` che inietta `variante.js` in una copia di index.html): **satellite**,
niente velo fuori dalla regione, pallini «via di mezzo», nomi sopra la pioggia, pioggia all'80%.
- **La foto e' NOSTRA fino allo zoom 10**: repo `AvventureMicologiche/Mappa-Precipitazioni-Satellite` (un commit solo,
  push forzato, come `Mappa-Precipitazioni-Tessere`), servito da jsDelivr col **commit** nell'indirizzo
  (`FOTO_COMMIT`, mai @main). Dentro `europa/{z}/{x}/{y}.webp`, zoom 4-10, da 25° O a 45° E e da 34° a 72° N.
  - Zoom 4-8 e tutto il mare: **NASA Blue Marble Next Generation** topo-bathy di luglio 2004 (pubblico dominio, 500 m,
    col rilievo del fondale), colori tarati sulle tessere Esri dello zoom 7 con DUE tabelle, terra e mare.
  - Terra agli zoom 9-10: **ESA WorldCover 2021 Sentinel-2 RGBNIR** (CC BY 4.0), tarata su Esri.
  - ⚠️ La sola ESA (scura, mare piatto) e' stata bocciata accanto al meteo: «non c'e' paragone, e' un altro pianeta».
    Da lontano Esri non e' una foto: e' un mosaico ritoccato col fondale disegnato, e Blue Marble e' di quella famiglia.
  - Attrezzi nel banco: `satellite-europa.py` (ESA: gradi → z10 → acqua → piramide) e `blue-marble.py` (calibra,
    basse, alte; `SAT_BOX`, `RIPRENDI`). ⚠️ Su Windows con Chrome e le schede aperte la memoria finisce: GDAL_CACHEMAX
    64 e OpenBLAS a un filo (gia' nei programmi), e i giri riprendono dalle tessere fatte.
- **Dallo zoom 11 Esri**: nella pioggia a «un quarto» delle tessere (512 px, zoomOffset -1, suo «un quarto va bene»),
  nelle previsioni piena (valli e paesi, il dettaglio delle case). Consumo vero letto su location.arcgis.com il 31/10:
  ~45-56 mila tessere al giorno senza la pioggia, cioe' 1,4-1,7 M sui 2 M gratis: la pioggia su Esri non ci stava.
- **Codice**: modulo «LA FOTO DAL SATELLITE SOTTO LA PIOGGIA» subito dopo `window._baseTiles`. La cartina OSM resta
  SOTTO (la usano boschi, satellite dei boschi, scatto, `quandoMappaDisegnata`); la foto sta nel pannello `foto`
  (z 205) con la luce della foto del meteo (`--sat-luce`, filtro CSS, rifatto anche nello scatto). Classe `foto-on`
  sul body quando c'e': spenta coi boschi, col satellite dei boschi e nelle previsioni (che hanno la loro, `viFondo`,
  fatta con la stessa `window._fotoNostra`). Con `foto-on`: pioggia all'80% (`drawGrid`), confini bianchi anche
  all'apertura col loro respiro, nomi NOSTRI sopra la pioggia (modulo «NOMI NOSTRI», pannello `sat-nomi`, che ora
  crea la foto), sfondo `#123a52` fuori dall'Europa della foto. Pallini raggio 4 e bordo 1,25 (erano 5 e 1,5) in
  `addMarkers` e `addDefaultMarkersForRegion`.
- **Ripieghi** (suo: «spiegami meglio i ripieghi»): Esri fermo (tetto o guasto) → sotto resta la nostra del 10
  ingrandita, niente buchi, nessuna scritta; la nostra che non arriva (3 errori senza nessuna tessera arrivata) →
  per quella visita la cartina di prima nella pioggia, Esri a ogni zoom nelle previsioni. **Satellite dei boschi senza
  Esri**: torna da solo alla cartina dei boschi e per 5 secondi «Foto dal satellite al momento non disponibile»
  (`#foto-avviso`; suo: «non possiamo mettere una scritta?»): li' la nostra del 10 non servirebbe a niente.
- ⚠️ Nella prova (`variante.js`) la pioggia all'80% passava da `window._satOn`, che e' la spia dei BOSCHI: nei boschi
  il tasto sbagliava (trovato dalla 104 ter). Nel sito vero la spia e' la classe `foto-on`, `_satOn` non si tocca.
- ⚠️ **jsDelivr alla PRIMA richiesta di un file** va a prenderlo da GitHub e, con tante richieste insieme, risponde 403 a
  circa il 4% (poi 200): visto da lui come quadrati di cartina sotto la pioggia. In `_fotoNostra` tre tentativi per
  tessera (2, 5, 12 s); dopo una rigenerazione si «scaldano» le tessere chiedendole tutte una volta
  (`mockup-pluvio-104\attrezzi\`: elenco e registro). Il commit del repo si crea con `git fast-import`
  (`attrezzi\commit-veloce.py`): `git add` su 53 mila file andava a 18 al secondo.
- **Crediti corti**: «Foto: NASA, ESA WorldCover» col link a `fonti.html#satellite` (le tre foto con la licenza intera,
  Esri compreso, che prima non era citato); Esri «da vicino» solo quando la sua foto c'e'. «Previsioni: MET Norway»
  tolto dai crediti: lo dice gia' la pillola della fonte (suo: «perche' lo citiamo due volte?»).

## Il riquadro della pioggia al telefono e il banner del meteo (31/10/2026 sera, scheda 104)

- **Riquadro in basso al telefono (sotto i 600 px) proporzionato**: suo «possiamo ridurre di qualche pixel?», poi «hai
  esagerato», «i pulsanti sono attaccati alla scala piogge», «deve avere un'estetica proporzionata e simmetrica».
  Spazi VISIVI misurati con `attrezzi\riquadro-spazi.js` (ombre «0 3px 0» comprese): erano 4/5/9/0/4/4/9/15, ora 7 fra
  tutti i blocchi (6 dal bordo, 3 fra scala e numeri); tasti e scala come prima; riquadro 264 → 253. Blocco CSS in
  fondo al modulo della 104 ter, solo pioggia (`:not(.modo-boschi):not(.modo-radar)`). Lezione: prima si MISURANO gli
  spazi, poi si toglie; i tasti non si abbassano (gia' 30 px, sotto i 44-48 consigliati per il dito).
- **Banner del meteo con una citta' sola** (c'era gia' in produzione): allargando una regione verso l'Italia le
  etichette si diradano e il banner le seguiva (Lombardia 32 → 8 → «Milano» due volte). `veNastro` ora prende tutti i
  paesi della vista (`gruppo`) che hanno gia' le previsioni, nell'ordine del gruppo: 21 citta' a ogni zoom.

## Telefono girato, crediti al telefono e blocco rosso del meteo (1/11/2026 sera, scheda 106)

I tre difetti che c'erano gia' in produzione prima della grafica nuova, lasciati dalla scheda 105 (suo: «facciamo i
problemi della 4?», poi «fai tutte e tre ma fammi vedere prima e dopo»). Misurati sul sito vero e corretti; attrezzi nel
banco, `mockup-106\` (`lib106.js` con `NUOVO=1` mette l'index.html del repo al posto di quello del sito vero e il resto
arriva dal sito: prova senza server). Al telefono dritto, al tablet e al PC i riquadri e lo zoom sono rimasti identici a
prima in tutte le 25 combinazioni provate (393, 360, 768, 1440, 1366×657 × pioggia, periodi, previsioni, radar, boschi).

- **La pioggia al telefono girato** (modulo «LA PIOGGIA AL TELEFONO GIRATO» in fondo a index.html). Con le altezze VERE
  (tolta la barra del browser: 667×325 … 932×380, non 852×393) fino a 900 px la pioggia prendeva il disegno del tablet
  dritto: fila delle regioni di 83 px, periodi tagliati di 44-99 px e senza scorrimento (funghi irraggiungibili), riquadro
  della pioggia in basso da meta' schermo, alla mappa ~80 px e la regione persa in mezzo all'Europa (centraRegioneInStriscia
  la centrava in una striscia di 79 px). Ora come il meteo girato del 30/10: «Lombardia ▼» e «＋ regione» in UNA riga,
  periodi o riquadro (radar e boschi compresi) in una colonna di 330 px a sinistra che scorre dentro se serve, mappa a
  destra, barra delle citta' in fondo alla mappa accanto alla colonna (`serve`/`sistema`/`accorcia` del modulo della
  barra: prima col telefono girato la barra non c'era), termometro sopra la barra, fonte in cima all'area libera.
  Condizione: la stessa media query del meteo, in JS `window._girato()`. Tasti dei periodi di 31-32 px e 9 px fra le righe:
  a 740×310 ci stanno interi. Inquadratura: `window._centraGirato()` in cima a `centraRegioneInStriscia` (il rettangolo
  libero: a destra della colonna, sotto la riga, sopra la barra; sul paese cercato si sposta e basta) e un ramo nel
  `inquadra()` del radar (contava la colonna come «copre dal basso» e la Liguria finiva fuori). «Date personalizzate» si
  apre sotto i funghi: la colonna scorre da sola fino a lei. L'IIFE «TABLET DRITTO» della 105 col telefono girato si ferma.
- **I telefoni grandi girati** (script «I TELEFONI GRANDI GIRATI» in testa, dopo leaflet.js): 915×412 e 932×430 sono
  piu' larghi di 900 e prendevano il disegno da PC col pie' di pagina, riquadro della pioggia tutto fuori schermo e
  scheda del meteo fuori di 18-38 px. Col dito, in orizzontale, lato corto dello schermo fino a 500 e lungo oltre 900, il
  viewport diventa `width=900` (lo schermo si legge da `screen`, che il viewport non tocca; si rifa' a ogni giro): la
  pagina si allarga del 2-4% e valgono le regole del telefono girato, pioggia e meteo. ⚠️ Provato col telefono finto di
  Chrome (puppeteer, `isLandscape`), non ancora su un telefono vero che gira.
- **I crediti al telefono** (modulo «I CREDITI AL TELEFONO SOPRA IL RIQUADRO»): fino a 900 px stavano in fondo alla mappa
  SOTTO il riquadro, visti allo 0% in pioggia, previsioni, radar e da vicino (al tablet si vedevano solo coi periodi).
  Ora come Google Maps e MapLibre: a sinistra, 10 px sopra il riquadro come il termometro (`--cr-giu`, `--cr-sx`: col
  telefono girato a destra della colonna e sopra barra o banner), la riga intera per 5 secondi e poi una «i» tonda
  (`#cr-i`, «i Esri» quando c'e' la foto Esri) che la riapre per 8 secondi; il primo tocco sulla mappa la chiude. Le
  regole di OpenStreetMap lo permettono (osmfoundation.org, Licence/Attribution_Guidelines: chiusi dopo 5 secondi o al
  primo gesto, purche' resti un «(i)»). Nello scatto i crediti vanno interi: `window._creditiInteri(doc)` nell'onclone.
  Al PC non cambia niente.
- **Il blocco rosso del banner meteo dice solo «METEO» e il giorno** (`veNastro`): col nome del posto, a 360 px,
  prendeva il 92% del banner con San Giovanni in Persiceto, il 97% con Castelnuovo di Garfagnana e usciva dallo schermo
  con San Valentino in Abruzzo Citeriore (111%), e con due o tre regioni peggio; il nome era gia' scritto quattro volte
  (in cima, sulla mappa, nella scheda, nel tasto dello storico). E' la stessa regola che lui ha dato il 31/10 per la barra
  della pioggia. Ora il 21% del banner. «METEO ITALIA» della vista Italia resta (lo scrive `viPezzi`).

## La velocita' della pioggia dopo le date (1/11/2026 sera, scheda 106 bis)

Suo: «vedo in mappa pluvio le tessere apparire una alla volta, l'attesa dopo che ho scelto le date e' lunga e vedo per
qualche attimo lo schermo grigio». Misurato sul sito vero, GA bloccato, al PC e al telefono (4G «Fast» e CPU ×4); gli
attrezzi stanno nel banco, `velocita-106-bis\` (le prove dentro la pagina usano una COPIA di index.html coi cronometri,
servita al posto della pagina vera con l'intercettazione di puppeteer: lo script principale e' in una IIFE e da fuori le
sue funzioni non si vedono).
- **Fatto: il calcolo dei colori 20-50 volte piu' veloce, risultato identico.** Dopo «Applica» i file dei giorni
  arrivavano in 0,1-1 s, ma il calcolo (`buildGridAFette`) durava 0,8-1,2 s al PC e 5,5-6 s al telefono: il 93-97% era
  `pipGeo` rifatto su OGNI cella contro tutti i punti del confine (Lombardia 4.969). Ora `celleRiga` cerca gli incroci
  del confine UNA volta per riga (`incrociRiga`, stessa formula di pipGeo) e per ogni cella conta quelli a destra
  (`dentroRiga`); l'IDW guarda solo le stazioni della fascia di latitudine, nello stesso ordine. buildGrid e
  buildGridAFette usano tutte e due `celleRiga`. Provato: griglia identica cella per cella su 9 casi nel browser e
  heatmap identica PIXEL PER PIXEL su tutte le regioni a 30 giorni, funghi, ieri, tre regioni e telefono
  (`giro-calcolo.js`, 29 casi su 29; ⚠️ confrontare DOPO che tutte e due le pagine hanno finito: col calcolo lento la
  vecchia si fotografava a meta' dei ridisegni); telefono girato uguale alla misura della 106 (`mockup-106\
  misura-girati.js`, 6 su 6). Tempi: telefono, 30 giorni Lombardia, colori a 1,3 s dal tocco invece di 6,4 (calcolo 5,5 s →
  0,18); PC 0,25 s invece di 1,0. ⚠️ In multiregione l'ordine in cui arrivano le regioni cambia le ultime cifre dell'IDW
  (somme in ordine diverso): succedeva anche prima, non si vede, e falsa un confronto fra due caricamenti.
- **Fatti poi gli altri tre (suo «sì, tutti e tre»), lo «schermo grigio» e le «tessere una alla volta»:**
  1. **Il velo**: `#map-spinner` stendeva il bianco al 45% su tutta la mappa fino a fine calcolo, e sulla foto scura era
     lo «schermo grigio». Con `foto-on` resta la sola rotellina (`body.foto-on #map-spinner{background:transparent}`).
  2. **La foto pronta (era una regressione della foto)**: `precaricaTileDestinazione` scaricava tessere OSM e
     `quandoMappaDisegnata` aspettava il «load» di OSM (fino a 1,5 s), che dal 31/10 sta sotto la foto; la foto non la
     preparava nessuno. Ora con `foto-on` il precarico chiede le tessere NOSTRE della vista d'arrivo (zoom 4-10, stesso
     indirizzo e crossOrigin dello strato; Esri mai) e l'attesa guarda la foto (`window._fondoFoto`). In piu', SOTTO la
     nitida, una **foto sfocata**: la stessa foto fino allo zoom 6 (`sotto`, className `foto-sotto`, zIndex 0 nel pannello
     `foto`), poche tessere gia' in memoria. Il fit del periodo e' un `setView` senza animazione (3/8) e Leaflet butta le
     tessere di ogni strato (`viewprereset` → `_invalidateAll`); alla sfocata quell'evento e' tolto (`getEvents`), quindi
     le sue tessere restano e Leaflet le sposta con la mappa: mai fondo vuoto, prima sfocato e poi nitido. Allineata sotto
     il pixel dopo regione, «Applica», boschi, radar, zoom 11 e 5, salto in Campania (`allineata.js`). Lo scatto la salta.
  3. **Niente OSM sotto la foto** (`osmSeServe`, chiamata da `giusta()` a ogni cambio di classe del body): la cartina sta
     in mappa solo coi boschi e quando la foto della pioggia non arriva (ripiego); mai con `foto-on`, `sat-on` o
     `modo-prev` (le previsioni hanno la loro foto a ogni zoom, e la cartina entrava per un attimo prima di lei: 12-40
     richieste per niente). Toglierla mentre carica non rompe Leaflet 1.9.4 (`TileLayer._tileReady` esce senza mappa):
     esplode solo DENTRO il suo «load». ⚠️ **Il credito «© OpenStreetMap contributors» resta**: i nomi esteri sopra la foto
     sono di OpenStreetMap (ODbL), quindi tolta la cartina la scritta si rimette a mano (`osmCreditoAMano`), nello stesso
     posto (Leaflet conta i crediti e tiene la voce a zero); col satellite dei boschi no, ha gia' il suo. Crediti uguali a
     prima in tutti i passi della prova. ⚠️ Entrando nei boschi la cartina ora si scarica in quel momento (40 tessere al
     PC, 12 al telefono): prima era gia' li', nascosta.
  Misure (sito vero, copia servita al posto della pagina): al PC a 8 Mbit, Italia → Lombardia → «Applica» 30 giorni, la
  foto non manca mai (prima mancava da 0,2 a 1,65 s), colori a 0,75-0,94 s (prima 1,9), dopo il tocco 80 KB scaricati
  (prima 2 MB di OSM + 635 KB di foto); apertura al PC 0 tessere OSM (prima 75), al telefono 0 (prima 26). Prove:
  `prova-234.js` (apertura, date, boschi, satellite, radar, previsioni e ritorni, PC e telefono, e SENZAFOTO=1: con
  jsDelivr bloccato la cartina torna), `lampo-osm.js` della 105 (0 su 5 giri), scatto al PC uguale (tranne i «new» che
  pulsano), telefono girato della 106 6 su 6. ⚠️ I tempi si misurano UNA pagina alla volta: con piu' pagine insieme
  raw.githubusercontent frena i file dei giorni (fino a 30 s) e il confronto non vale; le prove di funzione invece si
  fanno in parallelo.
  jsDelivr risponde bene (HTTP/2, primo byte 35-190 ms). Noti, non cause: la pagina (1,27 MB, senza cache: rimedio 5
  della scheda 100) e i file dei giorni (~10 KB l'uno: 90 giorni = 841 KB al telefono).

## Telefono dritto con la tastiera, barra della Sicilia e angoli del telefono girato (2/11/2026, scheda 109 quater)

Tre difetti della mappa trovati dal check notturno del 1-2/11 (scheda 109: cloud A2, A3, A4, confermati nel browser) e
corretti su copie provate sul sito vero (suo «sì, tutte e sei»). Attrezzi nel banco, `scheda-109-quater\`: `fai1..fai3.py`
fanno le copie da `index-prod.html` (in catena con `fai0`, `fai4`, `fai4b` danno `index-tutte.html`, quella messa qui),
`prova1.js`, `prova1b.js`, `prova2.js`, `prova3.js`, `giro-errori.js`; fogli prima/dopo in `immagini\109-quater\`.
- **Il telefono dritto con la tastiera** (A4). Le regole del telefono girato guardano la FINESTRA
  (`(max-width:900px) and (max-height:500px) and (orientation:landscape)`), non il telefono: Firefox per Android, e altri,
  aprendo la tastiera abbassano la finestra (393×852 → 393×300) e al telefono dritto scattava il disegno girato, colonna di
  330 px su 393. Nel meteo con la scheda di una citta' aperta la mappa andava allo zoom 19 sopra Milano: l'inquadratura
  accanto alla colonna restava con uno spazio NEGATIVO e Leaflet (`getBoundsZoom`) risponde con lo zoom massimo. Nella
  vista Italia la mappa finiva nell'Atlantico (longitudine −16) e ci restava anche richiudendo la tastiera. Ora lo script
  «I TELEFONI GRANDI GIRATI» in testa mette su `html` la classe `schermo-dritto` col dito e lo schermo dritto
  (`window._schermoDritto()`, rifatta a ogni giro e a ogni resize); le 28 regole dei due blocchi girati (meteo e
  pioggia) la escludono con `:where(html:not(.schermo-dritto))` (stessa forza di prima: `:where` vale zero) e
  `window._girato()` e `oriz()` del meteo la chiedono. ⚠️ Lo schermo si legge da `screen.orientation.type` (riserva
  `window.orientation`), NON da `screen.width>screen.height` come proponeva il cloud: sull'iPhone `screen` resta quello
  del telefono dritto anche girato. Col mouse (finestra stretta del PC) non cambia niente. Una regola nuova nei due
  blocchi girati va scritta col prefisso anche lei. Provato: tastiera nella pioggia, nel meteo con la scheda e nella
  vista Italia, anche col percorso vero (tocco su «Cerca la tua località» o su «Lombardia ▼», finestra a 300, si
  scrive): casella sempre libera, zoom fermo; telefoni girati 740×340 e 852×393, telefono grande 915×412 e PC 800×450
  identici a prima (misure dei riquadri, zoom, centro). ⚠️ Lo zoom d'apertura della pioggia a 393 cambia da solo fra 7,5
  e 7,75 a seconda del caricamento: non confrontare due aperture su quello.
- **La barra delle citta' in Sicilia** (A3). La barra sceglie il pluviometro dalla classifica INTERA, ma le reti fitte
  sono diradate a 400 pallini (Sicilia 431): toccando Palermo, Enna, Ragusa o Caltanissetta il pallino non c'era, la mappa
  si spostava e restava aperta la scheda della citta' di prima. Ora senza pallino la scheda si apre direttamente
  (`window._pioggiaPer.apri(s,x,y)`, che fa quello che fa il clic sul pallino). Enna apre Villarosa Diga R2, Ragusa Modica,
  Caltanissetta Imera Meridionale, Palermo Palermo Abela (i piu' vicini al capoluogo), al PC, al telefono e girato;
  Austria e Lombardia come prima. ⚠️ `closeStationHistory` NON e' globale: nelle prove la scheda non si chiude da fuori.
  Resta, non toccato: col telefono girato la scheda del pluviometro (296×360 a destra) copre in parte la barra.
- **Gli angoli del riquadro col telefono girato** (A2). `#legend-panel{border-radius:0 14px 0 0}` del blocco girato
  perdeva contro `html:root #legend-panel{border-radius:12px}` della grafica nuova (piu' forte): quattro angoli tondi e due
  spicchi di mappa a sinistra. I periodi vincevano gia' (stessa forza, vengono dopo). Ora nel blocco girato
  `html:root:where(:not(.schermo-dritto)) body #legend-panel` (forza di `html:root body #legend-panel`): angoli dei
  periodi in pioggia, radar e boschi; al telefono dritto e al PC identico. L'ombra laterale scritta nel blocco non era mai
  arrivata ed e' tolta: resta quella della grafica nuova, come i periodi. Il margine sopra era gia' giusto (10 px).
- Giro largo della copia unica (`giro-errori.js` con `prove-veloci.js`): 24 aperture (pioggia, periodi, meteo, radar,
  boschi; PC, telefono, girato), zoom fino al 19 e ritorno, nessun errore della pagina. ⚠️ `prove-veloci.js` non vede
  «pronta» Austria a 7 giorni al telefono (25 s): uguale prima, e' l'attrezzo.
