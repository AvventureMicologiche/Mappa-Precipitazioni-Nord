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
  Col telefono girato la scheda copriva anche la barra: corretto dopo, sezione qui sotto.
- **Gli angoli del riquadro col telefono girato** (A2). `#legend-panel{border-radius:0 14px 0 0}` del blocco girato
  perdeva contro `html:root #legend-panel{border-radius:12px}` della grafica nuova (piu' forte): quattro angoli tondi e due
  spicchi di mappa a sinistra. I periodi vincevano gia' (stessa forza, vengono dopo). Ora nel blocco girato
  `html:root:where(:not(.schermo-dritto)) body #legend-panel` (forza di `html:root body #legend-panel`): angoli dei
  periodi in pioggia, radar e boschi; al telefono dritto e al PC identico. L'ombra laterale scritta nel blocco non era mai
  arrivata ed e' tolta: resta quella della grafica nuova, come i periodi. Il margine sopra era gia' giusto (10 px).
- Giro largo della copia unica (`giro-errori.js` con `prove-veloci.js`): 24 aperture (pioggia, periodi, meteo, radar,
  boschi; PC, telefono, girato), zoom fino al 19 e ritorno, nessun errore della pagina. ⚠️ `prove-veloci.js` non vede
  «pronta» Austria a 7 giorni al telefono (25 s): uguale prima, e' l'attrezzo.

## La scheda del pluviometro col telefono girato (2/11/2026, scheda 109 quater)

- **Il difetto.** Sopra i 600 px `histPosition()` mette la scheda come al PC, accanto al punto toccato, senza altezza
  massima. Col telefono girato (667×325 … 852×393) la scheda e' alta 343-360 px e la mappa ne ha 287-355, con in fondo
  la barra delle citta' (`#pg-nastro`): la scheda usciva dal fondo dello schermo (667×325: 81 px, 740×340: 49-66 px), il
  riepilogo del giorno scelto e «vai alle previsioni» non si raggiungevano, e copriva la barra e le pastiglie «+ regione».
- **La correzione.** Sopra i 600 px, se la barra e' accesa (`body.pg-nastro-on`), si misura quanto la barra entra nella
  mappa (`sotto`): la scheda finisce 8 px sopra, `maxHeight` = spazio libero (minimo 120 px) e `overflowY:auto`, cioe'
  scorre dentro col dito come la colonna del riquadro. Sotto i 600 px (scheda fissa in basso) `maxHeight` e `overflowY`
  si ripuliscono, come gia' `bottom` nell'altro verso.
- **Provato** su una copia sul sito vero (`misura-scheda2.js`, `barra667.js`, `dito.js` nel banco, cartella
  `scheda-109-quater\`): girati 667, 740, 852 e 915 mai fuori schermo e mai sulla barra (alta 233-313 px), il dito la fa
  scorrere fino a «vai alle previsioni» e la mappa resta ferma; telefono dritto 393, tablet 768, PC 1440 e 1366 posizione
  e altezza identiche. ⚠️ Nelle prove lo scorrimento si fa con eventi di tocco CDP (`Input.dispatchTouchEvent`):
  `Input.synthesizeScrollGesture` NON fa scorrere la scheda, e' l'attrezzo.

## Le macchie squadrate sul mare della foto dal satellite (2/11/2026, scheda 111 quater)

Trovate dalla 111 bis lungo l'Adriatico (anche nelle strisce delle pagine, che fotografano la mappa); suo «Sì,
sistemale». Misurate su tutta l'Europa della foto: rettangoli scuri o chiari sul mare lungo le coste, agli zoom 9 e 10,
in **755 tessere dello zoom 9 e 2.138 dello zoom 10** (macchie di almeno 30 pixel), su 61 tratti di costa dalla
Groenlandia est a Cipro. Gli zoom 4-8 sono solo Blue Marble: puliti.
- **Causa**: lungo le coste la foto ESA ha una striscia di mare che finisce a gradini (fin dove arrivano i dati). In
  `blue-marble.py` quell'acqua diventava Blue Marble solo se il suo COLORE era vicino al blu dell'acqua (entro 50) e col
  peso che scendeva col colore: l'acqua verde scura (Adriatico, 8,30,18) restava ESA a meta', quella torbida e chiara tutta.
- **Rimedio**: `mockup-pluvio-104\mare-pulito.py` (fasi `mappa`, `acqua`, `misura`, `rifai`, `controlla`, `ritocca`;
  lavoro in `D:\claude-dati\sat-111q`, la copia buona si legge e basta). Mare e terra li dice la **carta di ESA
  WorldCover 2021** (classi: 80 acqua, 0 fuori dai dati), letta a 1/8 (80 m; 227 riquadri da 3x3 gradi in 101 s).
  L'acqua della carta collegata al mare aperto, dove Blue Marble vede mare, diventa Blue Marble PIENA, sfumata sulla
  costa con la frazione d'acqua; il colore e' quello del pixel piu' vicino di mare VERO di Blue Marble (blu meno rosso
  almeno 50 sul grezzo, somma RGB sotto 330); senza mare vero entro ~60 pixel la tessera resta com'era. Si toglie ESA,
  non se ne aggiunge mai; laghi e fiumi lontani dal mare di Blue Marble restano ESA come prima.
- ⚠️ **Il ghiaccio azzurrino**: sopra i 65° N Blue Marble di luglio ha neve e ghiaccio blu appena piu' del rosso
  (25-30, il mare vero 100). Presi per mare facevano CHIAZZE CHIARE TONDE nei fiordi (87 tessere, Narvik e Groenlandia):
  da qui la regola del «mare vero». Trovate con un confronto vecchie/nuove (pixel di mare diventati chiari), che la
  misura delle macchie non vede.
- **Esito**: 6.173 tessere rifatte (zoom 9 e 10). Controllo automatico sulle nuove: macchie da 755 a 11 (zoom 9) e da
  2.138 a 44 (zoom 10), rimaste solo in Groenlandia est (ghiaccio in mare, al bordo della foto) e attorno a Narvik, dove
  si e' lasciata la foto di prima. Repo Satellite: commit unico `ef0c3dbb` (push forzato); `FOTO_COMMIT` in index.html
  col commit `077b0053d5`, pubblicato (deploy `1955c2a3`), verificato online su delta del Po e Venezia, telefono e PC.
- ⚠️ **`FOTO_COMMIT` sta anche nelle 21 pagine «adesso»** (avviso della 111 ter): dal 2/11 `genera-pagine-adesso.js` lo
  copia da index.html (con FOTO_URL, FOTO_LIMITI, FOTO_CREDITI, LUCE_SAT) nella riga `adesso-dati`. Chi cambia
  FOTO_COMMIT lancia `node .github/scripts/genera-pagine-adesso.js` e mette nello stesso giro le 21 `*/adesso/index.html`
  (cambia solo quella riga), lasciando fuori `pagine-impronte.json` e le sitemap che il generatore riscrive. Se no le
  «adesso» restano col commit vecchio, che dopo il push forzato su GitHub non c'e' piu'. Fatto qui: `33251f875f`, deploy
  `e1a55d0e`, verificate online Veneto (telefono) e Marche (PC).
- ⚠️ **jsDelivr**: col commit nell'indirizzo sono NUOVE tutte le 53.234 tessere, non solo quelle cambiate: si
  scaldano tutte. `attrezzi\scalda.js` ora prende `ELENCO`, `LOG` e `COMMIT`; con `PARALLELE=40` va a 6-10 tessere al
  secondo, circa due ore: prima Italia e Alpi, poi gli zoom 4-8, poi il resto per distanza dall'Italia.
- ⚠️ `attrezzi\commit-veloce.py` su un `main` che esiste gia': `FORZA=1`, se no fast-import non aggiorna il ramo
  («does not contain») e lo script usciva lo stesso con 0 (ora esce con l'errore vero).
- Attrezzi della prova: `mockup-pluvio-104\server-111q.js` (8975: index.html di origin/main con le tessere servite in
  locale, `?foto=vecchia` per il prima), `attrezzi\prova-mare-locale.js` (prima|dopo agli zoom 7-12, pioggia e
  previsioni), `attrezzi\mare-per-costa.py` (elenco per costa), `attrezzi\foglio-mare.py`, `attrezzi\controlla-z8.py`.
  Immagini e misure in `immagini\111-quater\`.

## Le date sotto i periodi andavano a capo al telefono a cavallo dei mesi (2/11/2026, scheda 114, check-10)

- Trovato dal check-10 (M2). Le date sotto i tasti dei periodi (31/10, `291b8b5c5d`) al telefono scrivevano
  «26/10–1/11» quando il periodo scavalca il mese: sotto ogni tasto ci sono 50 px a 393, 44 a 360, 38 a 320, e la data
  (58 px) andava a capo, «26/10–» sopra e «1/11» sotto, con la riga dei tasti 10 px piu' alta e la mappa 10 px piu'
  bassa. Il 31/10 e il 1/11 stava tutto dentro ottobre: il 2/11 e' stato il primo giorno; da li' succede quasi ogni
  giorno del mese (il 30 giorni scavalca sempre).
- Ora al telefono, a cavallo di due mesi, solo l'inizio: «dal 26/10» (la fine e' sempre ieri, scritta sotto «Ieri»).
  E nel CSS delle date: sotto i 600 px niente a capo e lettere -0,2 px, sotto i 380 il carattere a 10 px, sotto i 340 a
  9 px (accanto a `.tp-d`). Al PC resta «26 ott–1 nov», che ci sta. Lo stesso mese resta «26–31».
- Prova sul sito vero col file nuovo (`check-10\prova-m2-10.js` del banco, `NUOVO=1` di prove-veloci), oggi e con
  l'orologio della pagina al 15/11, a 320, 360, 393, 412, 768, 1440, 1366: una riga sola dappertutto, niente che sborda,
  tasti alti 45 (393) come il 1/11 invece di 55. Scatti in `immagini\check-10\m2\`.

## La pioggia non si spegne piu' zoomando e trascinando (3/11/2026, scheda 116)

- Suo: «rispetto a quando c'era OpenStreetMap perde fluidita' quando si zooma», con la rotellina al PC. Misurato sul sito
  vero (`scratchpad c5b15e68\fluidita-116.js`, `rotellina-116.js`: GPU vera anche senza finestra, una pagina alla
  volta): i fotogrammi erano gli stessi di OSM (55-58 al secondo), anche togliendo il filtro di luce della foto, la
  sfocata sotto e i nomi nostri. La causa era la PIOGGIA: la tela andava a opacita' 0 a `zoomstart`, `movestart` e
  `move` e tornava col ridisegno 80-100 ms dopo la fine. Uno scatto di rotella = 0,38 s di buio, tre scatti 0,5-0,8 s in
  due lampi, un trascinamento di 1 s = 1,4 s (`pioggia-nascosta-116.js`). Era cosi' da sempre: sulla cartina chiara si
  notava poco, sulla foto scura con la pioggia all'80% lo schermo passava dai colori al buio e indietro.
- Ora (modulo «LA PIOGGIA SEGUE ZOOM E TRASCINAMENTO» sopra `initCanvas`) la tela fa come la foto: e' piu' grande dello
  schermo di `HEAT_MARGINE` (0,5) per lato e sta nel pannello della mappa, quindi trascinando viene con la mappa; nello
  zoom si ingrandisce con l'animazione di Leaflet (classe `leaflet-zoom-animated`, `zoomanim` col riquadro in gradi
  `heatBox`, come L.ImageOverlay); col pizzico e coi salti senza animazione si rimette a posto a ogni `zoom`/`viewreset`;
  alla fine si ridisegna nitida come prima. `drawGrid` non disegna a meta' animazione (lo rifa' lo zoomend). I pallini
  restano nascosti durante lo zoom (sua scelta del 3/8).
- Prove (copia servita sulla 9020 contro il sito vero): pioggia nascosta 0 ms con rotellina e trascinamento (prima
  0,4-1,4 s); a mappa ferma la pioggia e' IDENTICA pixel per pixel su Toscana 30 gg, Sicilia al telefono, Trentino-AA
  a 1920, Abruzzo 21/10 (contro la pagina vecchia servita uguale: online i dati dell'Abruzzo arrivano da raw), Lombardia
  1 pixel su 10.508, a 4 px dal fondo sotto la barra delle citta' (`uguale-116.js`); scatti a meta' rotellina, a meta'
  trascinamento e a meta' pizzico al telefono (eventi touch veri) con la pioggia al suo posto (`immagini\116\zoom-*`,
  `pizzico-*`); boschi, satellite, radar, telefono senza errori; fotogrammi e compiti lunghi uguali a prima.

## Il tetto di zoom: pioggia 13, previsioni 14, boschi e satellite 19 (3/11/2026, scheda 116)

- Suo: «e' necessario uno zoom cosi' elevato sulla pagina meteo e piogge? non vorrei che il consumo di Esri sia
  esagerato; se uno vuole il satellite per vedere zoom elevati lo abbiamo, lo guarda li'». Fino ad allora pioggia e
  previsioni arrivavano al 19 (la singola casa), ma la pioggia viene da pluviometri a chilometri l'uno dall'altro: oltre
  il 13 e' lo stesso colore sopra la foto, e ogni scatto in piu' chiede tessere nuove a Esri. Suo «te le approvo gia'».
- Modulo «IL TETTO DI ZOOM» subito dopo quello della foto: `map.setMaxZoom` a ogni cambio di classe del body, 19 con
  `modo-boschi` o `sat-on` (il satellite sta solo dentro i boschi), 14 con `modo-prev`, 13 per tutto il resto (pioggia e
  radar). Leaflet ferma rotellina e tasto + (che si spegne) e, uscendo dai boschi da piu' vicino, riporta la mappa al tetto.
- Provato in locale (`scratchpad c5b15e68\tetto-116.js`, `tetto-sat-116.js`, server `server-116.js` su prova.localhost:9021):
  pioggia ferma al 13 col + spento; boschi al 19 e uscendo torna al 13; satellite al 19; previsioni al 14; 0 errori.

## Le tessere che arrivavano in ritardo zoomando e il tremolio trascinando: tessere d'arrivo subito e respiro fermo nel moto (4/11/2026, scheda 117)

- Suo, sulla pioggia all'apertura senza aver scelto niente: «se zoommo avanti e indietro vedo a volte le tessere che
  appaiono un po' in ritardo l'una dall'altra» e «se sposto la mappa a misura piena col mouse trema leggermente».
  Misurato sul sito vero, una pagina alla volta (`scratchpad 490e1f73\fluidita-117.js`: `PROVA=zoom` registra quando
  nasce e quando arriva ogni tessera e da dove; `PROVA=trascina` fotogrammi e passi della mappa con un mouse vero, un
  movimento ogni 8 ms; `VISTA`, `DPR`, `RIP`, `INDICE=<copia>`).
- **Le tessere: non era la rete.** jsDelivr risponde dalla sua cache (Cloudflare HIT, mediana 95 ms, `immutable` per un
  anno). Erano due regole di Leaflet 1.9.4 nell'animazione dello zoom: zoomando INDIETRO `_getTiledPixelBounds` prende
  `Math.max(_animateToZoom, getZoom())`, cioe' l'area dello zoom di partenza, e l'anello esterno nasce a fine animazione
  (12-20 tessere ~300 ms dopo le altre, anche dalla cache del browser: per questo «a volte», solo tornando indietro);
  zoomando AVANTI a cavallo di un livello (da 6,75 a 7,5, livello 8) `_update` vede piu' di 1 fra lo zoom attuale e il
  livello d'arrivo e non chiede niente fino alla fine (470-650 ms). In `_fotoNostra` (quindi anche la sfocata e la foto
  delle previsioni) tutt'e due guardano lo zoom d'ARRIVO; Esri no, per non cambiarne il consumo. Copia sul sito vero:
  ritardate 0, ultime a 150-200 ms invece di 450-480; zoom avanti 175-360 ms invece di 470-650; le stesse tessere.
- **Il tremolio: il respiro dei confini.** `path.conf-pulse` anima fill-opacity e stroke-opacity, e il browser ridisegna
  tutti i confini a ogni fotogramma, anche trascinando. A 1920x1080 (apertura allo zoom 6,25) 42-51 fotogrammi al secondo
  e 22-35 sopra i 25 ms; a 1536x864 al 125% 54-56 e 10-14; a 1366x768 gia' 60. Ora (subito sotto `aggiornaConfPulse`) il
  respiro si ferma a movestart/zoomstart e a moveend riparte da dove era, tutte le animazioni con lo stesso inizio
  (`respiroT0`, che aggiornaConfPulse usa al posto dello 0 di prima: un confine che riceve la classe dopo batte con gli
  altri, e alla ripartenza si rimette in passo anche quello che il passaggio del mouse aveva sfasato). Copia a 1920x1080:
  58-59 fotogrammi e 3-6 sopra i 25 ms. Respiro fermo davvero nel moto e ripartito senza salti (`respiro-117.js`).
- Non erano cause (misurate): il filtro di luce della foto, la sfocata sotto, lo zoom d'apertura frazionario (5,75 a
  1366x768 e 1280x720, 6,25 a 1920x1080 e 2560x1440, 6 a 1440x900 e 1536x864).
- Giro largo della copia (`scheda-109-quater\giro-errori.js`, 24 aperture, zoom fino in fondo e ritorno): uguale riga per
  riga al sito online. ⚠️ Nelle prove col profilo pulito la finestra «Novita'» copre la mappa (c'e' un video): si mette
  `localStorage.novitaVista`, se no il mouse finto preme sulla finestra e la mappa non si muove.
- ⚠️ **Regressione dello stesso giorno, trovata da lui** dopo la pubblicazione (deploy `a3aaebca`): «con emilia e le date
  selezionate la mappa pulsava ancora… alcune regioni pulsano ancora». A moveend si rimetteva `startTime` anche sulle
  animazioni che CSS aveva TOLTO durante il moto (classe tolta scegliendo una regione, `:hover` = animation:none): uno
  startTime le fa rivivere come animazioni dello script, staccate dalla classe, che pulsano per sempre. Riprodotto
  online (`scratchpad 490e1f73\respiro-orfano-117.js`): Emilia scelta mentre la mappa scorre = 37 confini accesi senza
  classe; mouse su una regione nel moto = quella resta accesa anche dopo la scelta. Ora ripartono solo le animazioni
  ancora `paused` (le tolte sono `idle`): 0 e 0, pausa e ripartenza come prima. Lezione: un'animazione CSS fermata con
  l'API va rimessa in moto solo se e' ancora `paused`.

## La barra delle citta': solo pluviometri veri, niente scritta finta all'apertura, niente barra senza citta' (4/11/2026, scheda 118)

Tre cose viste dalla 116 e lasciate lì, sistemate su suo «faile». Tutte nel modulo «LA BARRA CHE SCORRE NELLA PIOGGIA»
in fondo a `index.html`.

- **Le stime ICON non entrano piu' nella barra.** In Abruzzo la mappa ha anche le stime del modello sui paesi (`_src`
  `'icon'`, `loadAbruzzoRegion`), coi pallini uguali agli altri per sua scelta del 27/10. La barra prendeva il pallino
  piu' vicino entro 10 km e basta: Sulmona diceva la stima di Pettorano sul Gizio (7 gg 46 mm), Avezzano la stima di
  Avezzano, contro la regola scritta in testa al modulo («il numero e' di quel pluviometro, non una stima»). Ora
  `stima(s)` le salta: una citta' senza pluviometro vero entro 10 km esce dalla barra. Abruzzo 7 gg: da 7 citta' a 4
  (Chieti, Teramo, Roccaraso, L'Aquila); Pescara c'e' quando la sua MeteoNetwork copre il periodo.
- **«nessun pluviometro vicino ai capoluoghi» era un lampo di ogni apertura, non un difetto del giorno solo.**
  `data/capoluoghi.json` si chiede alla prima analisi e arriva dopo: intanto `voci()` era vuota e la barra scriveva la
  scritta per 0,4-1,1 s, in tutte le regioni e in tutti i periodi (misurato sul sito con un osservatore dalla nascita
  della barra: Abruzzo, Sicilia, Toscana, Lombardia). La 116 l'aveva vista «su un giorno solo» perche' li' l'analisi e'
  veloce e lo scatto cadeva nel lampo. Ora `scrivi()` non scrive niente finche' l'elenco non c'e'.
- **Nessuna citta' = niente barra** (sua scelta «Barra nascosta» fra barra nascosta, stime con «stima» e scritta): senza
  le stime l'Abruzzo sui 30 giorni e oltre non ha citta', perche' le MeteoNetwork ci sono dal 19-21/10 e restano sotto
  il 60% dei giorni (sui 30 giorni passano verso l'8/11). `serve()` dice no e tornano titolo e tasti, come col pannello
  ridotto. La scritta non c'e' piu'.
- **`?r=piemonte&m=boschi` «allo zoom 13 anche online» era l'attrezzo.** Il sito apre i boschi con `boschi=1` e il radar
  con `radar=ora` (come i link delle pagine); `m=` conosce solo `prev`. `scheda-109-quater\giro-errori.js` (banco) usava
  `m=boschi` e `m=radar`: apriva la pioggia, col suo tetto 13. Corretto l'attrezzo: boschi 19, radar 13, verificato.
- Prove con la copia sul sito vero (`INDICE=`, attrezzi in `scratchpad c1ffc0c8\`: `barra-lampo-118.js`,
  `tre-cose-118.js`, `barra-vuota-118.js`): niente lampo nelle cinque aperture; Abruzzo 7 gg 4 citta', 30 gg niente
  barra e titolo visibile, ritorno cambiando periodo (7 → 30 → 7 → ieri → 30) al PC e al telefono; Sicilia, Molise,
  Toscana, Lombardia come prima; giro largo identico (gli «non pronta» di Austria 7 gg al telefono e di
  `/meteo/val-bormida/` sono dell'attrezzo, uguali online).

## La cassetta dei video, le previsioni sempre sotto i numeri e la pillola un'analisi su quattro (4/11/2026, scheda 119)

- **Perche'.** GA4 31/10-3/11, solo telefono: l'invito giallo alle previsioni toccato 84 volte (682 persone lo hanno
  visto), la pillola dei video 21, il tasto «Iscriviti» della testata 12. Sua decisione: le previsioni sempre sotto i
  numeri, ma «non possiamo togliere i video e gli iscriviti». Provato e scartato: giallo e pillola uno sopra l'altro
  (mappa da 533 a 489 px a 393, −8%: «non mi convince»), il video nuovo «una volta sola» («se non ha tempo in quel
  momento e' fottuto»), due tasti affiancati.
- **Il tasto giallo** («E nei prossimi giorni? ☀️ Previsioni …») ora e' SEMPRE sotto i numeri, anche col RADAR (prima
  mai), al computer e al telefono; `serve()` nell'invito. Al telefono tutte le analisi tranne UNA SU QUATTRO (la 4a,
  l'8a…; la prima della visita mai): `window._turnoPillola()`, che legge `window._analisiN` (scritto in `loadData`:
  `_analisiChieste` sta in uno scope che da fuori non si vede). Non conta piu' `prevUsate` (prima: invito sempre solo
  per chi non aveva mai aperto le previsioni, per gli altri una voce del giro). Col radar il giallo prende il posto
  della pillola: al telefono la mappa resta uguale (360: −1 px) o guadagna (393: +15, la pillola era 61 px); al PC il
  riquadro del radar si allunga di 41-49 px verso il basso (fondo a 739/900 e 665/768), nulla di coperto
  (`radar-spazio-119.js`). A 1366x768 il giallo e' alto 33 px: e' la regola degli schermi bassi che c'era gia'.
- **La pillola al telefono ha un giro suo** («IL GIRO DELLA PILLOLA AL TELEFONO» nella vetrina, `giroTelefono()`): gli
  ULTIMI 3 VIDEO del canale, il quiz, «Iscriviti»; il primo da una voce a caso, poi la successiva a ogni turno. Un video
  che sta nel sorteggio di `data/vetrina.json` usa la sua voce curata, gli altri titolo e copertina di YouTube (due
  righe al massimo, `.cp-g`). Al telefono `_vetrinaGira` non fa piu' il giro della vetrina; al COMPUTER la scheda grande
  gira come prima (sua scelta: «la vetrina su pc la lascerei cosi' com'e'»).
- **La cassetta dei video** (blocco «📺 LA CASSETTA DEI VIDEO» dopo l'invito; mockup in sette giri, scratchpad 6b0dade4
  `wt-119c\mock-cassetta.js`): l'icona YouTube della testata (telefono `#hdr-yt`, computer la `.hdr-soc` di YouTube)
  apre la cassetta invece del canale. Pallino rosso col numero dei video nuovi non ancora visti, che lampeggia finche'
  non la si tocca (`localStorage.cassettaVista`, gli id visti); il pallino e' un `<b>` perche' al telefono
  `body.con-sezioni #hdr-yt span` nasconde ogni span. Dentro: i NUOVI (usciti da meno di 14 giorni, al massimo 2, a
  colonne uguali, pastiglia NUOVO rossa accanto a «Video · 4 giorni fa», mai sulla copertina che copriva il titolo
  dell'anteprima); «La mappa e' un progetto gratuito e libero / Sostienici con un like e un'iscrizione» col tasto
  ISCRIVITI (solo quello: Archie e il nome del canale bocciati) che pulsa con un alone tenue ogni 2,8 s (il rosso che
  si accendeva «flashava»); ALTRI VIDEO a caso fra gli ultimi 10, elenco verticale con tre in vista e la barra (al
  telefono un filo del quarto), «Vai al canale ›»; il QUIZ in fondo, riquadro giallo-oro da 112 px. Fondo blu, bianco
  smorzato #e6edf6 a 600-700 (pieno e in grassetto «sembrava sfocato»). ISCRIVITI sempre senza scorrere (467/852 a
  393, 444/900 al PC); al PC la cassetta sta tutta nello schermo. Esc e il velo chiudono.
- **I video vengono da soli** da `functions/api/canale.js` (`/api/canale`): il feed pubblico del canale
  (`youtube.com/feeds/videos.xml?channel_id=UCBAul56IRwckppf-skNqVlA`, niente chiave), i 10 piu' recenti con id, titolo,
  data, short; Cache API un'ora (al massimo una richiesta a YouTube all'ora per nodo), riserva di 7 giorni se YouTube
  non risponde o manda una pagina senza video, 502 solo senza nessuna copia. Prova `prova-canale-119.mjs` 9/9 (cache e
  YouTube finti). Senza la funzione la cassetta usa i video del sorteggio (non prima di `da`, non dopo `fino`), senza
  nuovi e senza pallino; il giro del telefono idem.
- **GA**: `cassetta` {azione: apri, nuovi} e i tocchi `click_youtube` con pulsante `cassetta-nuovo`, `-altri`,
  `-iscriviti`, `-canale`, `-quiz`. Da guardare dopo una settimana: tocchi del giallo, della pillola (uno su quattro),
  della cassetta.
- Prove in locale con `server-119.mjs` (9043: i file del worktree e la funzione vera; 9044 senza la funzione):
  `giro-tel-119.js` (telefono: analisi 1-3 giallo, 4 pillola «ARCHIE A CACCIA DOPO LA PIOGGIA», 5-7 giallo, 8 lo short;
  pallino «2», cassetta, Esc, pallino spento anche ricaricando; PC: giallo sempre, scheda grande che gira, cassetta).
- **IN PRODUZIONE il 4/11/2026** (`b24c8a4dd3`, deploy `a04ba17a`): /api/canale 200 coi 10 video anche dai server di
  Cloudflare; `giro-tel-119.js` col sito vero uguale alla prova in locale.
- **Il quiz che non si vedeva** (stessa sera, sua foto dal telefono: con la barra degli indirizzi e quella dei tasti il
  quiz era tutto sotto, «almeno un angolo per invogliare a scorrere»): nei nuovi la riga sopra il titolo su una riga con
  la data corta («Video · 31 ott», `breve()`: «2 settimane / fa» andava a capo) e il titolo al massimo su due righe;
  e se la cima del quiz non entra con 46 px nella cassetta, l'elenco degli altri video si accorcia di quel tanto, fino
  a un video e mezzo. `quiz-in-vista-119.js`: 46 px di quiz a 412x760, 393x720, 360x780 e al PC 1366x768, 39 a 360x640
  (elenco al minimo), 68 a 393x852, 130 al PC 1440x900; ISCRIVITI sempre senza scorrere.
- **IN PRODUZIONE il 4/11/2026** (`5451187ba7`, deploy `b010eb33`, scheda 120): `quiz-in-vista` col sito vero dà gli
  stessi numeri della prova in locale, su tutti e 7 gli schermi.

## Il video nuovo entra in un quarto d'ora, e la vetrina si accende col feed (4/11/2026 sera, scheda 120 bis)

- **Il fatto** (4/11, il primo giorno della cassetta): lo short dei chiodini (qCgUhj8XqAU) è uscito alle 17:00. Alle
  17:52 lui non aveva il pallino, nei NUOVI c'era un video solo e i chiodini non c'erano. Il sito era giusto (Chrome
  pulito: pallino 2, chiodino primo): a lui arrivava la lista di PRIMA. `/api/canale` aveva letto il feed alle 16:46 e
  la teneva un'ora nel nodo, più 10 minuti nel browser. Il secondo nuovo di stamattina («Archie a caccia dopo la
  pioggia», 21/10 15:15Z) era uscito dai NUOVI alle 16:15 per i 14 giorni. La vetrina del computer invece aspettava le
  18:00 scritte a mano in `data/vetrina.json` dalla 118 (sua domanda: «perché la vetrina alle 18 non deve entrare anche
  lei col feed?»).
- **`functions/api/canale.js`**: `FRESCA_S` da 3600 a **900** (al massimo 4 letture del feed all'ora per nodo) e
  `BROWSER_S` = **120** al posto dei 600 (la riserva, quando YouTube non risponde, 60 invece di 300). Un video nuovo
  arriva in cassetta, pallino, pillola e vetrina entro ~20 minuti dall'uscita.
- **`index.html`, «LA VETRINA SI ACCENDE COL FEED»**: `primaDiDa(v, ora)` al posto dei due controlli su `da` (sorteggio
  e vetrina scelta): una vetrina il cui video (`idVideo`, dal link) è nel feed (`window._canaleVideo()`) è accesa
  anche prima di `da`. `da` resta la riserva quando il feed non si legge. Il contrario no: passata l'ora si accende
  anche se il video nel feed non c'è (il feed tiene solo gli ultimi 10, i video vecchi del sorteggio non ci sono).
  `monta()` aspetta il feed al massimo `ATTESA_FEED` = 1000 ms, e SOLO se una vetrina del sorteggio (o quella
  inchiodata) ha `da` nel futuro (`aspettaFeed`): il feed lo segnala la cassetta con `window._canaleFatto` e le
  funzioni in `window._suCanale`, bene o male che vada. Chi arriva mentre una vetrina aspetta non passa (vince la
  prima, come prima). Vale anche al telefono: la voce curata dei chiodini nel giro della pillola usciva «Iscriviti»
  fino a `da`, ora esce appena il video è nel feed.
- **Prova in locale** (`vetrina-feed-120bis.js`, server 9050 con la funzione vera e 9051 senza feed, vetrina.json
  finto con i chiodini a domani): feed su → chiodini in vetrina (log «(dopo il feed)»); senza feed → «Iscriviti»;
  video finto non nel feed → «Iscriviti»; file vero → nessuna attesa, giro uguale a prima con i chiodini dentro;
  sorteggio vero coi chiodini a domani → chiodini nel giro; telefono → «canale1» = chiodino curato. Nessun errore.
- **IN PRODUZIONE il 4/11/2026 alle 18:14** (`c540949faa`, deploy `63251fac`): index online uguale al repo,
  `/api/canale` con `max-age=120`; `vetrina-feed-online-120bis.js` (le stesse prove sul sito vero, vetrina.json finto
  intercettato) dà gli stessi risultati della prova in locale, senza errori.

## La scheda «Iscriviti» del computer con la foto di Archie in testa (4/11/2026 sera, scheda 121)

- **Sue parole**: «mi migliori l'iscriviti pc della vetrina? le 3 righe superiori non hanno la simmetria e comunque
  la grafica è veramente brutta». Quattro alternative con le stesse parole (mockup statico
  `D:\video youtube\claudio\mockup-iscriviti-121\index.html`, immagine `immagini\iscriviti-pc-alternative-121.png`):
  A foto in testa, B tutta centrata con Archie che sporge, C come prima con le righe centrate, D foto a tutta scheda.
  **Sua scelta: la A, con le parole della cassetta dei video**: «La mappa è un progetto / gratuito e libero» (l'a
  capo è suo) e «Sostienici con un like e un'iscrizione». Spariscono «Questo sito è gratuito» e «Se ti è stato utile,
  clicca: lascia un like e iscriviti».
- **Come è fatta**: in testa `.v-foto-iscr`, 104 px, sfondo `/archie-bosco.webp` (ritaglio 828x208 di
  `data/vetrine/archie-instagram.jpg`, Archie dietro il tronco nel bosco, 32 KB); esce dal riquadro bianco coi margini
  negativi -12/-13 (l'imbottitura di `#channel-logo`), così il contenitore resta quello della vetrina e non serve
  nessuna classe sul contenitore. Il bollo bianco «Canale YouTube» col logo rosso sta a cavallo del bordo della foto,
  centrato. Sotto, TUTTO CENTRATO: nome (23 px, 21 sotto i 900), `.v-t1` 16,5/700 blu del nome, `.v-t2` 15/600 blu
  grigio, bottone rosso di sempre (uguale alle vetrine dei video, `margin-top` 11). Tolte la faccia tonda `.ch-ava`
  e la sua animazione, `.v-sotto`, `.v-grazie`, `.v-alto.v-iscr`, `.v-occhio.v-iscr`: stavano solo in questo markup.
- **Due trappole misurate**: (1) la scheda sta dentro la mappa e prende l'**Arial di Leaflet**: nel mockup era Segoe
  UI, e con l'Arial le righe venivano più larghe e più brutte; il carattere è scritto su `.v-corpo-iscr` e `.v-bollo`.
  (2) La foto è uno sfondo CSS di una scheda nascosta (`prevetrina`) e il browser non scarica gli sfondi delle cose
  nascoste: c'è un `<link rel="preload" … media="(min-width:601px)">`, che **deve stare DOPO il meta viewport**: messo
  in cima alla testa, il telefono lo valutava sulla larghezza finta di 980 e scaricava la foto per niente.
- **Misure**: PC 414x292 (prima 414x246), 800 px 368x290; righe centrate al decimo di pixel (nome 256, «La mappa è un
  progetto» 186, «gratuito e libero» 126, «Sostienici…» 243). Il telefono non cambia (la pillola ha il suo markup) e
  non scarica la foto.
- **La pillola del telefono resta con le parole di prima** («Questo sito è gratuito / Se ti è stato utile, clicca:
  lascia un like e iscriviti»): provate le parole nuove col suo a capo (mockup `mockup-iscriviti-121\pillola.html`),
  la pillola passava da 45 a 61 px. Sua decisione: «no lascia quello di adesso ruba troppi pixel», «solo pc».
- **Prova** (`prova-iscr-121.js` nello scratchpad della 121: il sito vero col solo `index.html` e la foto del worktree
  intercettati, niente server): PC e 800 px con `sorteggio` vuoto, giro vero con `_vetrinaGira()` («Iscriviti» al suo
  turno con la foto, le vetrine dei video prima e dopo identiche, 183 px), telefono 393 (scheda nascosta, foto non
  scaricata). Nessun errore.
- **IN PRODUZIONE il 4/11/2026 alle 19:08** (`ea71781056`, deploy `95641545`): index online uguale al repo,
  `/archie-bosco.webp` 200 (32.206 byte); `prova-iscr-121.js` con `ONLINE=1` (niente intercettato tranne
  `vetrina.json`) dà le stesse misure della prova: PC 414x292, 800 px 368x290, giro coi video a 183, telefono senza
  scheda e senza foto, nessun errore.

## La pillola del telefono gira sulle stesse voci della vetrina del computer (4/11/2026 sera, scheda 121)

- **Sue parole**: «fai nel cellulare lo stesso giro del pc». Prima (scheda 119) `giroTelefono()` girava sugli ULTIMI 3
  VIDEO del feed del canale (`/api/canale`, con la voce curata se il video stava nel sorteggio, se no titolo e
  copertina di YouTube), il quiz e «Iscriviti».
- **Ora** `giroTelefono()` prende il `sorteggio` di `data/vetrina.json` come la scheda del computer: stesso ordine,
  stessi filtri di `costruisci` (`primaDiDa` e `fino`), `iscriviti` dove sta nell'elenco; senza voci accese resta
  «Iscriviti». Prima voce a caso, poi la successiva, come al computer. Tolta `vetrinaDaVideo()`, che serviva solo al
  giro vecchio. **Restano**: l'una su quattro (`_turnoPillola`, le altre tre analisi il giallo delle previsioni, sua
  scelta della 119), la pillola «Iscriviti» con le parole di prima.
- **Conseguenza detta a lui prima del sì**: un video appena uscito entra nella pillola solo quando ha la sua voce in
  `vetrina.json`, come al computer; la cassetta dei video lo prende comunque da sola dal feed.
- **Prova** (`giro-tel-121.js`, sito vero con l'`index.html` del worktree intercettato, 393x852, `_analisiN=4` e
  `_vetrinaGira()` dieci volte): aggiornamento tartufo 2026 › quiz › chiodini › ep. 1 › ep. 2 › ep. 3 › ep. 4 ›
  «Iscriviti» › di nuovo dall'inizio, le stesse 8 del computer e nello stesso ordine. Il computer gira come prima
  (lungo25 › iscriviti › aggiornamento2026 › …). Nessun errore.
- **IN PRODUZIONE il 4/11/2026 alle 19:28** (`b162fccb2d`, deploy `afcadc74`): index online uguale al repo;
  `giro-tel-121.js` con `VECCHIO=1` (niente intercettato) sul sito vero dà lo stesso giro della prova, nessun errore.

## Due chiavi Esri: il satellite dei boschi conta a parte (7/11/2026, scheda 126 bis)

- **Perché.** Consumo letto il 7/11 su location.arcgis.com: 301.566 tessere dal 30/10 (15,1% dei 2 M), dal 3/11 fra
  27 e 36 mila al giorno, fine ciclo ~1,03-1,10 M. Sua domanda «come mai sono così alte e dove possiamo risparmiare
  ancora? senza toccare il satellite ovviamente». Tutto passava da UNA chiave: Esri non diceva chi consuma.
- **Misura per schermata** (sito vero, tessere CONTATE e BLOCCATE prima di partire, zero consumate; scratchpad della 126
  bis `conta-esri-126bis.js`): aprire la mappa 0; pioggia e previsioni 0 fino al 10, poi 15 a schermata al PC (1920) e
  3-6 al telefono; pagina /meteo/garfagnana/ letta tutta 6 al PC, 0 al telefono; satellite dei boschi tessere PIENE a
  ogni zoom, 50 a schermata al PC e 15 al telefono. Stima: il grosso e' il satellite (64 utenti il 30/10).
- **Fatto**: credenziale nuova nel portale (`avventurepluvio.maps.arcgis.com`, Contenuto → credenziali sviluppatore)
  «Pioggia previsioni e pagine meteo», applicazione pubblica, Mappe di base 2/2 (Basemap Styles service + Tile mappa di
  base statica), stessi 4 referrer di «Satellite mappa precipitazioni», **scade il 29/9/2027 come l'altra**. In
  index.html `var ESRI_ALTRO` subito sotto `SAT_FOTO` e `window._esriChiave=ESRI_ALTRO` (foto da vicino della pioggia e
  delle previsioni); `SAT_FOTO`/`ANTE_SAT` restano al satellite dei boschi. `genera-pagine-meteo-zona.js` legge
  `ESRI_ALTRO` (se manca, SAT_FOTO come prima); 89 pagine meteo rigenerate. Zoom invariati.
- **Come si legge**: location.arcgis.com → Developer credentials → «View usage» di ciascuna credenziale (oppure Usage →
  scheda Developer credentials). ⚠️ Una tessera chiesta con un token sbagliato risponde lo stesso 200 con l'immagine:
  la chiave non si collauda con curl, si guarda il consumo della credenziale.
- **Prove sul sito vero con Esri bloccato** (banco, non il repo): `collaudo-lib.js` (CDP `Network.setBlockedURLs`) e
  `prove-veloci.js` bloccano Esri di base; `ESRI=1` per provare proprio la foto Esri o il satellite; i `registra-*.js`
  dei filmati mettono `ESRI=1` da soli. check-9 e check-10 avevano bruciato 5.378 tessere.
- **Scartato per ora: Esri dallo zoom 12.** All'11 la tessera a un quarto e' la z10 di Esri, stessa griglia della nostra
  del 10 ingrandita, ma nella foto prima/dopo (`immagini\126bis\zoom11-sassello-prima-dopo.png`, `-firenze-`) la nostra
  e' piu' scura e morbida e le citta' quasi spariscono: non pubblicato senza il suo sguardo. Pronto sul ramo locale
  `scheda-126bis-zoom12` (`9aa3732584`, non spinto): 0 tessere all'11 invece di 15/6 a schermata.
- **IN PRODUZIONE il 7/11/2026 alle 7:40** (`1dd71add42`, deploy `8e050fdc`): online uguale al repo (index e pagine
  meteo con la chiave nuova); sul sito vero pioggia allo zoom 12 8 tessere su 8 con la chiave nuova, satellite dei boschi
  acceso con 18 su 18 con la sua, nessun errore.

## I nomi dei paesi fra due zoom interi: la soglia scende a ogni quarto (7/11/2026, scheda 126)

- **Perché.** Suo screen di Chrome su Parma (Lombardia + Emilia, «Ieri»): «a questo livello di zoom si vedono pochi
  nomi di città, non se ne dovrebbero vedere di più?». Lo zoom, misurato dalle distanze fra i paesi nello screen, era
  10,75 (la mappa va a quarti, `zoomSnap 0.25`). Il modulo «NOMI NOSTRI» prendeva `Math.floor` dello zoom e la soglia
  di abitanti di quello zoom intero (`SOGLIA`: 10 = 8.000, 11 = 2.500, 12 = 700; le soglie «meno fitti» del 29/9 sono
  sue): da 10 a 10,75 restava quella del 10 mentre lo schermo inquadrava sempre meno terra.
- **Misura sul sito vero alla sua inquadratura** (PC 1920, Esri bloccato): nomi 62 a 10, 48 a 10,25, 30 a 10,5, **17
  a 10,75** (il buco, uguale al suo screen), 36 all'11.
- **Fatto.** Fra due zoom interi la soglia scende in proporzione geometrica (`s0 * (s1/s0)^frazione`; fra il 13 e il
  14, dove la soglia è 0, in linea retta). A 10,75 è ~3.300 abitanti. Stessa vista: 62, 67, 58, **52**, 36; al
  telefono a 10,75 da 12 a 21. Agli zoom interi non cambia niente. Vale anche col satellite dei boschi (stesso modulo).
  Medesano (10.663) manca anche così: il suo nome toccherebbe quello di Collecchio (l'aria attorno ai nomi, +44 px in
  larghezza e +20 in altezza, è rimasta com'era).
- **Prove** (scratchpad della scheda 126): `nomi-zoom-126.js` (MODO=prima|dopo, ZOOM=lista), `prova-nomi-126.js`
  (pagine del worktree intercettate sul sito vero: pioggia, previsioni Liguria, /meteo/garfagnana/, telefono;
  `VECCHIO=1` le pagine online). Foto `immagini\126\nomi-zoom1075-oggi-proposta.png`.
- ⚠️ **Il credito «Esri» dallo zoom 11 è GIUSTO, non toccarlo.** Leaflet decide lo zoom delle tessere con
  `Math.round` (`GridLayer._setView`) ma le butta via col valore vero (`_pruneTiles`: zoom < `minZoom` →
  `_removeAllTiles`). A 10,5 e 10,75 le tessere Esri si CHIEDONO (21 col tasto +, 15 con la rotellina a 10,75, provato
  anche con Esri vero) e spariscono subito: in mappa resta la foto nostra. Tessere pagate e mai mostrate: rimedio nella
  sezione qui sotto.
- **IN PRODUZIONE il 7/11/2026 alle 18:39** (`c1f50ca0f4`, deploy `740007f6`): online alla sua inquadratura 62/67/58/52/36
  nomi al PC e 14/21/17 al telefono, crediti come prima, nessun errore.

## Esri da vicino non chiede più tessere sotto il suo zoom (7/11/2026, scheda 126)

- **Perché.** Trovato guardando i nomi a 10,75 (sezione qui sopra): Leaflet sceglie lo zoom delle tessere con
  `Math.round` (`GridLayer._setView`) e le pota col valore vero (`_pruneTiles`: zoom sotto `minZoom` →
  `_removeAllTiles`). Con lo zoom a quarti, a 10,5 e 10,75 le tessere Esri (minZoom 11) si chiedevano, si pagavano e
  sparivano subito. Sua scelta fra A (questo rimedio) e B (Esri dal 12, ramo `scheda-126bis-zoom12`): «facciamo la A».
- **Analisi** (`analisi-esri-126.js` nello scratchpad della 126, MODO=oggi|rimedio|ramo; conta le tessere DIVERSE, perché
  il browser tiene in memoria quelle già scaricate: con Esri vero 10,5 → 11 nello stesso posto = 0 richieste all'11).
  Giri: ricerca di un paese, + da 9 a 12 e − indietro, rotellina al PC, previsioni Liguria + da 9,5 a 12, tre pagine
  meteo. Prima: PC 134 tessere, **13 mai mostrate (10%)**; telefono 24, 2 (8%); pagine meteo nessuna buttata. Chi si
  ferma a 10,5-10,75 buttava tutto quello che chiedeva lì: 15-21 tessere a schermata al PC, ~6 al telefono.
- **Fatto.** `EsriDaVicino` in index.html (accanto a `FOTO_CREDITI`, esposta come `window._EsriDaVicino` perché lo script
  è tutto dentro una funzione): sottoclasse di `L.TileLayer` che, sotto il suo minZoom, alza il minimo di uno solo
  mentre `_setView` decide (try/finally): nessuna tessera, come Leaflet poi vorrebbe. La usano la foto sotto la pioggia
  (`vicino`) e quella delle previsioni (`vicinoL`); stessa classe dentro `fotoSat` di `genera-pagine-meteo-zona.js`
  (creata lì dentro, quando Leaflet c'è), 89 pagine meteo rigenerate (zone e paesi). Dopo: PC 0 buttate, telefono 0;
  con Esri vero a 10,5 nessuna richiesta, all'11 15 tessere caricate e visibili, credito come prima, nessun errore.
  ⚠️ Da sola, B sposterebbe lo spreco a 11,5-11,75; con questa classe no.
- ⚠️ **CONTROLLO DEI CONSUMI fra qualche giorno (suo, 7/11):** su location.arcgis.com → Developer credentials →
  «View usage» delle due credenziali (dal 7/11 ~7:40 «Pioggia previsioni e pagine meteo» è separata dal satellite dei
  boschi). Guardare le tessere al giorno della credenziale della pioggia dall'8/11 e quanto pesa contro il satellite:
  da lì si decide se vale la B (Esri dal 12), che costa nitidezza all'11. Con la lettura del 16/11 già in calendario.
- **IN PRODUZIONE il 7/11/2026 alle 19:31** (`54580f5d57`, deploy `9d6a471b`): online, stessi giri senza intercettare niente,
  PC 121 tessere e 0 buttate, telefono 22 e 0; nomi e crediti come prima, nessun errore.

## L'ombra delle icone del meteo e i collegamenti preparati (8/11/2026, scheda 127 bis, dall'analisi notturna)

Dall'analisi notturna del 7/11 (`D:\video youtube\claudio\analisi-127bis\ELENCO-PROBLEMI-E-SOLUZIONI.md`, punti 4 e 7),
suo «va bene 4 e 7». Attrezzi e misure in `analisi-127bis\` (banco).
- **L'ombra delle icone della vista Italia (punto 4).** Trascinando la vista Italia delle previsioni al PC la mappa
  andava a 24-30 fps (regione 58, pioggia 55) senza nessun compito lungo: la traccia dava 8,8 s di lavoro alla scheda
  grafica contro 1,5-2,5 negli altri modi. Causa: `.pv-m.vi-ico .ic` con TRE `filter:drop-shadow` sulle 92 icone,
  rifatte a ogni fotogramma. Prova con lo stile cambiato solo nella pagina (`prova-ombre.js`): 3 drop-shadow 24-26 fps;
  senza ombra, una drop-shadow o text-shadow 60. Scelta: le STESSE tre ombre come `text-shadow` (le icone sono emoji),
  per tenere il bordo scuro scelto da lui il 28/10, e `filter:none`: la regola generale `.pv-m .ic` ha una drop-shadow
  leggera che le icone ereditavano, e con quella si restava a 52-57 fps. ⚠️ Non rimettere `filter` su quelle icone.
  Provato sul sito vero con la pagina nuova intercettata (`prova-127bis.js`, due giri): trascinando **34 → 59 fps**;
  icone a occhio identiche (`analisi-127bis\foto\127bis\icone-pc-vero.png` e `-nuovo.png`).
- **I collegamenti preparati (punto 7).** In testa c'era il `preconnect` solo a raw.githubusercontent; mancava
  `cdn.jsdelivr.net`, da cui arrivano la foto nostra e le tessere dei boschi (tutte con crossOrigin, quindi il preconnect
  ha `crossorigin`). E lo script in testa di `/previsioni/` apriva il collegamento a `ibasemaps-api.arcgis.com`: nato il
  29/10 col rilievo Esri della vista Italia, inutile dal 31/10 (foto nostra, Esri solo dallo zoom 11): tolto. Limite
  ereditato dalla cosa sostituita. Provato: su `/` e `/previsioni/`, PC e telefono, preparati raw.githubusercontent e
  jsDelivr (con crossorigin), ArcGIS non più. Stati della mappa uguali alla vera (`prova-senza-commenti.js` con
  `INDICE=`, 10 scene × PC e telefono: 17 su 20 identici, gli altri 3 scene del telefono non ferme né con la vera né con
  la nuova, stessi pallini e stazioni), nessun errore.
- **IN PRODUZIONE l'8/11/2026 alle 8:23** (`3bd0055b18`, deploy `4dcf9e15`, 26 file), suo «Sì, tutt'e due». Online `/`
  identica al repo, `/previsioni/` con le stesse modifiche (preconnect jsDelivr, niente ArcGIS, `filter:none` +
  text-shadow). Misurato online senza intercettare niente (`fluidita.js prev-italia-pc`, Chrome visibile): trascinando
  la vista Italia **59 fps** (prima 30), rotellina 52-55 (prima 48-51), zoom animato 56 (prima 51-52), ferma 60.

## Etichette del meteo, testata del telefono, respiro e confini più leggeri (8/11/2026, scheda 127 bis, analisi notturna)

Punti 2, 3 (parte mappa), 5 e 6 del resoconto `D:\video youtube\claudio\analisi-127bis\ELENCO-PROBLEMI-E-SOLUZIONI.md`,
suo «falli tutti». Il punto 1 (commenti fuori dalla copia pubblicata) lo fa la 127 ter nello script di pubblicazione; la
parte PAGINE del punto 3 (funghi, meteo, zone che saltano caricando) la 127 nei generatori. Attrezzi in `analisi-127bis\`.
- **Punto 2, le etichette del meteo diradate in un colpo.** Nelle previsioni di regione al telefono (CPU ×4) ogni
  pizzico bloccava la mappa fino a 0,6-0,8 s: nel profilo 8,9 s su 16,6 erano `getBoundingClientRect` dentro
  `veDirada`/`metti`, che per ogni etichetta scrivevano lo stile e subito misuravano (un ricalcolo dell'impaginazione per
  etichetta). Ora `veDirada` e `dirada` rimettono a posto tutte le etichette, le misurano tutte insieme (`l._r0`) e poi
  decidono (vedi «PRIMA TUTTE LE SCRITTURE, POI TUTTE LE LETTURE»). In più: `tel()` (tre copie) usa
  `matchMedia('(max-width:900px)')` invece di `innerWidth`, che forzava anch'esso il ricalcolo (0,6 s); `dirada` agganciata
  solo a `moveend` (dopo uno zoom Leaflet manda zoomend E moveend: si diradava due volte). Prova `prova-etichette.js`
  (9 viste × 3 schermi × 5 zoom, pagina vera contro nuova, un giro di diradamento uguale prima della foto):
  **135 su 135 identiche**, chi si vede, chi no, chi scostato su o giù. Al telefono, previsioni Toscana: pizzico dentro
  da 11-19 a 30 fps, blocco più lungo da 0,6-0,8 a 0,27 s; pizzico fuori da 45 a 60 fps.
- **Punto 3, la testata del telefono ferma.** Al telefono la testata nasceva di 46 px, diventava 38 quando il browser
  arrivava alla regola «TELEFONO PIU' COMPATTO» (a metà pagina) e 44 quando le previsioni montavano le schede
  Storico/Previsioni (`con-sezioni`): tre altezze nei primi secondi, e mappa e barra della regione che si spostavano.
  Ora in testa (fine del primo `<style>`, «L'ALTEZZA FINALE DELLA TESTATA FIN DAL PRIMO DISEGNO») le misure finali
  valgono da subito: 38 px fino a 900 di larghezza, 44 fino a 600. CLS (`spostamenti.js`, telefono 4G lento): `/` da
  0,50 a 0,22, `/?r=toscana&g=1` da 0,51 a 0,34, `/previsioni/` da 0,10 a 0,03. Resta il riquadro dei periodi che si apre
  e cresce dopo 2-3 s (0,17): da guardare a parte.
- **Punto 5, il respiro dei confini sul pannello.** `confPulse` cambiava riempimento e bordo di ogni confine e il browser
  ridipingeva tutto a ogni fotogramma: all'apertura al PC (nessuna regione scelta) 54 fps da ferma, 27-28 con la
  rotellina. Ora (CSS «IL RESPIRO SI FA SUL PANNELLO») i confini che respirano stanno fermi al massimo (.16 e 1) e
  respira l'opacità di tutto il loro `<svg>`, .55-1: il bordo va da .55 a 1 come prima, il riempimento da .09 invece di
  .04 a .16. Stesse eccezioni di prima (radar, boschi, temperature, previsioni non vuote o d'Italia, apre-prev, movimento
  ridotto) scritte nei `:not()`; col mouse sopra un confine il pannello si ferma pieno; fermo nel moto con
  `#map.respiro-fermo` (stessi agganci del 4/11). Browser senza `:has()`: resta confPulse com'era. ⚠️ Un'eccezione
  nuova del respiro va aggiunta anche lì. Misurato (Chrome visibile, riscaldato): ferma 54 → 60, rotellina 27-28 →
  47-53, trascinando 43 → 59, zoom animato 29 → 55. Stati controllati vero contro nuovo (`prova-respiro2.js`): previsioni
  d'Italia e regione scelta identici; radar e boschi senza regione non partono né prima né ora (chiedono una regione).
- **Punto 6, i confini disegnati semplificati.** `perDisegno(feat)`: Douglas-Peucker a 0,0001° (~11 m), da 70.908 a
  40.028 punti (-44%), solo per DISEGNARE (`setRegionBorder` e il selettore); i conti «dentro o fuori» (`regionRings`,
  pipGeo) usano sempre il confine intero. Foto prima/dopo (`foto-confini.js`, `differenza-foto.js`): allo zoom 12-14
  0,03-0,13% di pixel diversi, solo sfumature dentro il tratto. Al PC i blocchi a ogni zoom calano di circa un quarto;
  sull'apertura conta il respiro, non i punti.
- Controllo finale: stati della mappa vera e nuova in 10 scene × PC e telefono (`prova-senza-commenti.js` con `INDICE=`).
- **IN PRODUZIONE l'8/11/2026 alle 11:04** (suo «Sì, tutt'e due»): push `3937c3ef96`, deploy `616a2d3c`. Verificato
  online (`analisi-127bis/attrezzi/verifica-online.js`): i sei segni nuovi nella pagina servita, al PC il respiro gira
  sul pannello (`confRespiro`), al telefono testata a 44 px e 14 etichette visibili su 214 nelle previsioni della
  Toscana, nessun errore.

## Il radar si apre col +40 minuti in movimento (8/11/2026, scheda 128 ter)

- **Suo**, l'8/11: «da adesso le apriamo col +40 min, in movimento, per la mappa e per le pagine ovunque uno clicca
  radar, se non dà problemi»; poi, sulla proposta `D:\video youtube\claudio\proposte-128ter\PROPOSTA-RADAR-40.md` (tre
  modi, misure, termini), «Vai con B», «Sì, parti» (la mappa), «Va bene», «Sincronizza e pubblica».
- **Cosa fa ora** (blocco del radar di `index.html`, `APRI`, `PREVISTI_S`, `SOSTA`, `PASSO`): il tasto «Radar pioggia»
  e i link `?radar=ora` e `?radar=prev` delle pagine aprono il «+40 min» acceso e il giro adesso, +10, +20, +30, +40.
  Il primo fotogramma è la MISURA di adesso («Radar · h 12:00»), gli altri sono previsti («Previsione per le 12:10»,
  strati con `_prev`). Sosta di 1,5 s su adesso e sull'ultimo, 0,7 s gli altri; «-2 ore» resta a 0,7 fisso; «Adesso»
  ferma. `?radar=due` apre «-2 ore». Senza previsti da LibreWXR si torna su «Adesso» fermo (tasto e titolo compresi),
  nessun ripiego. `ultimoBuono` (la scorta) prende solo le misure: «ultimo dato delle 12:40» alle 12:05 sarebbe falso.
- ⚠️ **Il «+40» arrivava a +60**: LibreWXR dà 6 previsti (il 31/8 erano 5, fino a +50) e il tasto li mostrava tutti.
  Ora si taglia per ORA (`f.time - ultimo.time <= 40 min`), non per numero, così regge se LibreWXR cambia il passo.
- ⚠️ **Il link caricava un fotogramma di troppo**: `entra()` chiamava `vai('ora')` e poi il link `vai(q)`. Ora
  `entra(modo)` entra già sul modo giusto: `?radar=due` 72 tessere invece di 78, `?radar=prev` 30 invece di 42.
- Il timer è un `setTimeout` a catena (per le soste), fermato con `clearTimeout`.
- **Il carico su LibreWXR** (misurato prima, nella proposta): tessere a zoom 6, 6 per fotogramma al PC e 4 al telefono;
  apertura da elenco + 6 a elenco + 30 (al telefono da 46 a ~160 KB con poca pioggia). Con ~44 aperture al giorno (GA4,
  62% telefono) tutto il sito passa da ~2.500 a ~4.000 richieste al giorno; LibreWXR ne serve ~350 al secondo. I termini
  (librewxr.net/terms.html, 20/6/2026) scrivono che l'animazione è uso normale, le tessere stanno 5 minuti nella loro
  cache Cloudflare.
- Guida: la frase del radar («la pioggia in movimento… +40 min, acceso quando si apre»). La foto `guida/radar.jpg`
  mostra ancora «Adesso» acceso: da rifare se lo chiede.
- Prove (`proposte-128ter\misure\prova-radar-128ter.js`, server `server-128ter.js` sulla 9115): 28/28 al PC e al
  telefono, 0 errori.
- **Restano** (da proposta, NON fatti): le pagine «adesso» (`lib/pagina-adesso.js`) e il riquadro delle pagine meteo,
  dopo il 14/11 (la 127 ci fa il lotto della goccia); le tre cose che abbassano le chiamate (le «adesso» si aggiornano
  anche nascoste, elenco richiesto a ogni tocco); ⚠️ **sull'Italia LibreWXR usa il radar DPC (composito ITCOMP), non
  OPERA**: «composito europeo OPERA» e «LibreWXR / OPERA (CC BY)» sono imprecisi e manca il credito «Radar-DPC»
  (CC BY-SA 4.0). Tutti da decidere con lui.
- **IN PRODUZIONE l'8/11/2026 alle 12:27**: push `7f8c35526a` alle 12:24 (sopra il `549a784299` della 128, già spinto:
  il deploy contiene anche le sue pagine), deploy `40d5cceb` dal worktree allineato a origin/main. Verificato online
  con la stessa prova (`BASE=https://precipitazioni.avventuremicologiche.it`): 28/28, PC e telefono, 0 errori; la
  frase nuova nella guida c'è.

## Il riquadro dei periodi e i crediti al telefono non saltano più aprendo la mappa (8/11/2026, scheda 128 bis)

Punto 3 di «Dopo l'8/11» dell'analisi notturna (`D:\video youtube\claudio\analisi-127bis\ELENCO-PROBLEMI-E-SOLUZIONI.md`):
il CLS 0,17 rimasto sulla mappa al telefono dopo la testata ferma della 127 bis. Proposte e misure in
`D:\video youtube\claudio\proposte-128bis\PROPOSTE.md`, suo «Il punto 3». Attrezzi in `proposte-128bis\attrezzi\`.
- **La causa, fotogramma per fotogramma** (`spia-periodi.js`, telefono 393×760, 4G lento + CPU ×4). Al telefono il
  riquadro dei periodi nasce chiuso (striscia di 44 px) e `initMobile` lo apriva 200 ms dopo il suo script, a metà
  pagina. Già aperto: (1) si allungava di una riga, quando gli script più avanti montavano «Radar | Boschi | Satellite»
  (~228 → 277 px; è appoggiato al fondo, quindi la cima sale); (2) i tasti cambiavano misura con gli stili in fondo alla
  pagina (periodi 40 → 31 → 45 px); (3) **i crediti saltavano di ~280 px**: nascevano in fondo alla mappa, dietro la
  striscia, e lo script dei crediti li portava sopra il riquadro tutto in una volta. Google conta anche quello che sta
  dietro un altro riquadro: da solo 0,13-0,17. In più, aprendosi, la riga del titolo cresceva di 5 px (la «i» c'è solo
  da aperta): 0,023 a ogni apertura.
- **Quattro ritocchi, solo fino a 900 px (crediti) o 600 (riquadro):**
  - A. **I crediti nascono nascosti** (`html.cr-attesa`, messa da uno script di una riga in testa, dopo la testata della
    127 bis) e compaiono una volta sola al loro posto: `aspetta()` nello script dei crediti attende il riquadro aperto
    da solo, la riga dei tasti montata e i riquadri fermi per due giri da 150 ms; poi i soliti 5 s e la «i». Tetto
    4,5 s, e la scorta di 6 s nello script in testa. `_creditiInteri` (lo scatto) toglie anche `cr-attesa`.
  - B. **`initMobile` apre il riquadro quando è completo**: pagina letta tutta e `.rd-coppia.con-sat` presente, tetto
    3 s. Si apre ~0,7 s più tardi al telefono lento delle prove, già alla sua altezza.
  - C. **I crediti fermi mentre un riquadro scorre** (`scorre()`, `getAnimations` delle transizioni di `transform`):
    si rimisura a fine corsa (`transitionend`) o fra 350 ms. Prima, a metà corsa, facevano due salti o scendevano in
    fondo per un attimo (il cambio periodi → legenda).
  - D. **`.tp-title-row` con `min-height:25px`** sotto i 600 px: alta uguale da chiusa e da aperta.
- **Misure, pagina vera contro nuova servite allo stesso modo (`INDICE=`), su main `1f999aa966`:** `/` CLS **0,217 →
  0,004**; `/?r=toscana&g=1` 0,168 → 0,090; `/?r=toscana&radar=ora` 0,257 → 0,037; `/previsioni/` 0,029 → 0,003. Nei
  giri di prova: A da sola 0,03-0,15 (se la riga dei tasti arriva dopo l'apertura il riquadro cresce lo stesso), A+B
  0,026, tutti e quattro 0,004-0,005. Al PC non cambia niente (0,006).
- **Resta 0,09 col link di un periodo**: a 7-9 s, quando arrivano i numeri, la riga «Calcolo…» allunga il riquadro di
  29 px e poi al posto dei periodi sale la legenda, più bassa; crediti e tasto delle temperature la seguono. È il
  passaggio voluto da un riquadro all'altro: prima di toccarlo, il rapporto «Core Web Vitals» di Search Console.
- **Stati della mappa uguali** (`stati-mappa.js`, la prova della 127 bis con in più tablet 768×1024 e telefono girato
  740×360: 10 posti × 4 schermi): 32 uguali, 8 diverse solo dove la scena non si ferma nemmeno con main (o al PC, dove
  la modifica non agisce), lo stesso rumore di vera contro vera (7 diverse). Crediti presenti e `cr-attesa` tolta in
  tutte le scene strette, nessun errore.
- ⚠️ Un riquadro nuovo appoggiato in basso al telefono va aggiunto a `RIQUADRI` dello script dei crediti (lo era già):
  `aspetta()` guarda quelli. Se un giorno il riquadro dei periodi non si aprisse più da solo, `aspetta()` arriva al
  tetto di 4,5 s e i crediti compaiono lo stesso.
- **IN PRODUZIONE l'8/11/2026 alle 13:35** (suo «Sì, tutt'e due»): push `669413ad1e` alle 13:24, deploy `6c66b05c` dal
  worktree della 128 bis allineato a origin/main (3 file cambiati); alle 13:38 è rientrato anche nel deploy `7c04dfe9`
  della 128 quater. Verificato online senza intercettare niente: pagina servita identica a `senzaCommenti(repo)`; CLS al
  telefono `/` 0,004 (due giri), `/previsioni/` 0,003, `/?r=toscana&g=1` 0,092, radar 0,057 (il resto è il riquadro del
  radar che cresce montando la linea del tempo, non i crediti); `stati-mappa.js` sul sito vero 33 uguali e 7 nel rumore,
  crediti visibili in 30 scene strette su 30, nessun errore.

## Le pulsazioni dei tasti si fermano dopo 5 giri (8/11/2026, scheda 128 bis)

Dall'analisi notturna, punto 8 («giri a tempo sempre accesi»), rimisurato dalla 128 bis: i giri a tempo costano 16-70 ms
di JavaScript in 20 s, niente; il lavoro a mappa ferma lo facevano le **pulsazioni CSS**. Proposta in
`D:\video youtube\claudio\proposte-128bis\PROPOSTE.md` (6a), sua scelta «A: si fermano dopo 8 s».
- **La causa.** `mappa-ferma.js` (20 s senza toccare niente, telefono CPU ×4, contatori di Chrome) e
  `animazioni-accese.js` (`document.getAnimations()` a mappa pronta): il browser ricalcolava gli stili 60 volte al
  secondo in tutte le scene, anche dove il JavaScript non faceva niente. Erano le chiamate che pulsavano per sempre
  animando **ombre e bordi** (`box-shadow`, `border-color`), che la scheda grafica non sa fare da sola: `newPulsa` (il
  «new» di `#sez-prev`, `#btn-sat-riga`, `#bo-sat-btn`), `loc-bordo-pulsa` (la casella, «Lombardia ▼» e la casella
  delle previsioni), `loc-cartello-pulsa` (la casella nel cartello blu) e le gemelle `geo-anello-pulsa(-blu)` del tasto
  della posizione («o pulsano tutti e due o nessuno», 26/8). Il «new» del Satellite girava anche nelle previsioni al PC,
  dove il tasto non si vede.
- **Cosa cambia:** le nove righe da `infinite` a `5 forwards` (8-8,5 s), con il commento «LE CHIAMATE PULSANO 5 VOLTE E
  POI SI FERMANO» accanto a `loc-bordo-pulsa`. `forwards` lascia l'ultimo fotogramma, che è quello fermo della
  pulsazione: **0 pixel diversi** fra la pagina di prima fermata sul fotogramma 0 e la nuova dopo i 5 giri, in 7 foto
  (PC e telefono, mappa e previsioni; `foto-pulsazioni.js` + `differenza-foto.js` della 127 bis). Si riaccendono come
  prima quando la classe torna (uscendo dalla casella senza scegliere, il «new» che ricompare). Restano com'erano il
  pallino della cassetta (`casOnda`: trasformazione e opacità, leggero), il respiro dei confini al PC (`confRespiro`,
  già sull'opacità del pannello dalla 127 bis), la guida a lampeggio del PC (`panelPulse`, non nella sua lista), le
  rotelle di caricamento e le finestre «Novità».
- **Misure, telefono CPU ×4, 20 s a mappa ferma** (main contro nuova, servite allo stesso modo): `/` **9,8 s → 0,27 s**
  di processore occupato; boschi 11,1 → 0,29; radar 9,3 → 1,7 (resta l'animazione del radar); pioggia ieri 11,6 → 10,2
  e previsioni 10,5-11,4 → 9,7-10,0: lì resta il **nastro che scorre** (la barra delle città, il banner del meteo),
  mosso dal JavaScript a ogni fotogramma, proposta a parte (6a in PROPOSTE.md). Stati della mappa (`stati-mappa.js`, 40
  scene): 34 uguali, 6 nel rumore, nessun errore.
- ⚠️ Una chiamata NUOVA che anima ombre o bordi va messa anche lei a giri contati.
- **IN PRODUZIONE l'8/11/2026 alle 14:36** (suo «Sì, tutt'e due»): push `333415176f` alle 14:34, deploy `11d4d50f` dal
  worktree intero della 128 bis allineato a origin/main (1 file cambiato). Verificato online senza intercettare niente:
  pagina servita identica a `senzaCommenti(repo)`; `animazioni-accese.js` sul sito vero, 12 scene: tutte le pulsazioni
  `finished`, a mappa ferma `/` 1 ricalcolo degli stili in 3 s (prima 180); `stati-mappa.js` 40 scene su 40, crediti in
  30 strette su 30, nessun errore.

## Il pizzico nelle previsioni di regione: il ridisegno a pezzi (8/11/2026, scheda 128 bis)

Punto 4 di «Dopo l'8/11» dell'analisi notturna (pizzico dentro nelle previsioni della Toscana al telefono a 30 fps anche
dopo la 127 bis). Proposta in `D:\video youtube\claudio\proposte-128bis\PROPOSTE.md` (4 B), suo «Sì, il pizzico».
- **La causa** (`conta-ridisegni.js`: una copia della pagina che segna le chiamate; `traccia-pizzico.js`; telefono CPU
  ×4). Le letture forzate che restavano (`naSopraDet`, `striscia`, `naGira`) NON erano ricalcoli in più: tolte, il
  ricalcolo lo pagava il primo che leggeva dopo (provato, nessun guadagno: `proposte-128bis\prove\punto4-letture-nascoste-P4b.diff`).
  Il costo vero: (1) durante il gesto Leaflet sposta una per una le 214 etichette a ogni fotogramma (50-70 ms l'uno; con
  le etichette nascoste 54 fps: e' la variante A della proposta, non fatta); (2) dopo il gesto una CASCATA: diradamento →
  arrivano a gruppi le previsioni dei paesi comparsi → `veRidisegna` → `disegna()` che toglieva e rimetteva TUTTE le
  etichette, riscriveva i giorni e la scheda ora per ora (0,27-0,33 s) → nuovo diradamento → altri paesi → secondo
  ridisegno. Al primo pizzico dentro 2 ridisegni e 4 diradamenti.
- **Il rimedio, «IL RIDISEGNO A PEZZI»** (commento in `veDisegna`): `disegna()` toglie solo i segnaposto che non sono
  della vista a etichette (`l._ve`); `veDisegna()`, se la scena e' la stessa (`VE.mkLista===VE.lista` e le stesse
  etichette nello stesso ordine nel gruppo), le tiene e riscrive il contenuto solo di quelle che cambiano
  (`mk._html`, `options.icon.options.html` e l'`innerHTML` dell'elemento) e lo strato solo se cambia
  (`setZIndexOffset`); se la scena cambia le rifa' tutte nell'ordine di `VE.lista` (veDirada conta su quell'ordine). Il
  tocco legge il paese da `mk._ve`. Vista Italia, capoluoghi o elenco in arrivo: via anche loro (`VE.mkLista=null`). In
  piu' i giorni (`#pv-gg`) e la scheda ora per ora (`renderDet`, «NIENTE DA RIFARE, NIENTE DA RISCRIVERE») non si
  riscrivono se sono uguali; tutt'e due confrontano anche il primo nodo, perche' altri (avvisi, «carico la
  previsione…», chiusura) scrivono negli stessi riquadri.
- **Misure** (pagina di main contro nuova servite allo stesso modo): `fluidita.js prev-toscana-tel` (Chrome visibile,
  tre giri alternati) pizzico dentro **22-26 → 35 fps**, fotogramma piu' lungo 384-501 → 250-267 ms, compiti lunghi
  1,24-1,58 → 0,85-0,96 s; pizzico fuori e dito restano a 60. `conta-ridisegni.js`: ogni ridisegno da 0,28-0,33 s a
  0,06-0,13 s; secondo pizzico dentro 0,95 → 0,48 s di compiti lunghi.
- **Stesse etichette:** `prova-etichette.js` (quella della 127 bis, con anche la vera servita allo stesso modo):
  **135 su 135 identiche** (9 viste × PC, PC basso, telefono × 5 zoom), nessun errore. `giorno-e-tocco.js` (cambio di
  giorno, tocco su un paese, ritorno al primo giorno; Toscana telefono e PC, Garfagnana telefono): etichette visibili,
  scheda e giorno acceso uguali in tutti i passi. ⚠️ Una corsa di tempi che c'era già: cambiando giorno il diradamento
  dentro `disegna()` parte prima che scheda e banner si siano rimessi (naSopraDet in setTimeout, tieniInVista), e per un
  giro si vede un paese in più (in Garfagnana Bagni di Lucca), che veChiedi chiede alle previsioni; il giro dopo lo
  rinasconde. Visto anche con la pagina di prima (`visti-diradamento.js`), con la nuova capita più spesso: al più un
  punto in più chiesto alla nostra Function, a etichetta nascosta. Se un giorno serve: il diradamento di `disegna()`
  dopo che il banner si è rimesso.
- Restano i 50-70 ms a fotogramma durante il gesto (le 214 etichette spostate da Leaflet) e il diradamento dopo lo zoom
  (una misura di tutte le etichette): la variante A (etichette nascoste mentre si pizzica) e' in PROPOSTE.md, da vedere
  col filmato.
- **IN PRODUZIONE l'8/11/2026 alle 15:14** (suo «Sì, tutt'e due»): push `76fb1790d3` alle 15:11, deploy `7931af2f` dal
  worktree intero della 128 bis allineato a origin/main (11 file: la pagina e i dati arrivati nel frattempo). Verificato
  online senza intercettare niente: pagina servita identica a `senzaCommenti(repo)`; `fluidita.js prev-toscana-tel` sul
  sito vero, pizzico dentro 34 e 30 fps (prima 22-26), pizzico fuori e dito 60; `stati-mappa.js` 40 scene su 40, quelle
  delle previsioni tutte uguali a prima, nessun errore.

## I nastri che scorrono li muove il browser (8/11/2026, scheda 128 bis)

Dall'analisi notturna, punto 8 («le due strisce che scorrono ridisegnate a ogni fotogramma dal JavaScript»), proposta in
`D:\video youtube\claudio\proposte-128bis\PROPOSTE.md` (6a), suo «Sì, i nastri». Il banner del meteo (`#vi-nastro`,
`naGira`) e la barra delle città della pioggia (`#pg-nastro`, `gira`) dal 29/10 li muoveva il JavaScript a ogni
fotogramma (sua richiesta: trascinarli e lanciarli col dito): a mappa ferma, telefono CPU ×4, il processore occupato
9-10 s su 20 (`mappa-ferma.js`), con il ricalcolo degli stili 60 volte al secondo.
- **Come va ora** (commento «LO SCORRIMENTO NORMALE LO FA IL BROWSER» sopra `naGira`): il passo normale (45 px al
  secondo) è una Web Animation (`window._nastroAnima`: da `translate3d(0)` a `-w` in `w/0,045` ms, ripetuta, che parte
  dalla posizione di adesso con `currentTime`), che la scheda grafica fa da sola. `naGira`/`gira` girano solo per il
  dito, lo slancio del lancio e il primo fotogramma di un nastro nuovo (la larghezza, come prima), poi ripassano la mano.
  Al `pointerdown` `window._nastroDove` legge dove sta il nastro dall'animazione, la toglie e da lì lo muove il
  JavaScript come prima. Mouse sopra: animazione in pausa (`naPausa`/`pausa`), via il mouse riparte; nastro nascosto
  (`viPezzi`, `sistema()`): in pausa. Nastro riscritto (giorno nuovo, altra regione, altro periodo): l'elemento `.t` è
  nuovo e l'animazione si rifà su di lui. Senza Web Animations resta il giro di prima. ⚠️ `NA.an`, `NA.tr`, `NA.anW`:
  chi tocca `NA.pos` con l'animazione accesa deve passare da `_nastroDove`.
- **Misure, main contro nuova servite allo stesso modo:** mappa ferma (telefono CPU ×4, 20 s) pioggia ieri Toscana
  **10,3 → 0,51 s**, previsioni Italia **8,9 → 0,29 s**, previsioni Toscana **9,0 → 0,31 s**; `nastri-prova.js` (banner
  del meteo e barra della pioggia, PC e telefono): stessa velocità (-90 px in 2 s), stesso trascinamento (+159 px), stesso
  lancio, fermi col mouse sopra e ripartenza uguale, il tocco apre la stessa città (Torino, Grosseto); a riposo
  `requestAnimationFrame` 120 volte in 2 s prima, 0 ora. Gesti (`fluidita.js`, Chrome visibile): uguali. Stati della mappa
  40 scene, nessun errore (una del radar al telefono non partita in 25 s, riprovata: 3 su 3 accese in 4,3-4,5 s come main).
- **IN PRODUZIONE l'8/11/2026 alle 16:11** (suo «Sì, tutt'e due»): push `a2ac39df39` alle 16:09, deploy `24e4c0ca` dal
  worktree intero della 128 bis allineato a origin/main (4 file: la pagina e i dati arrivati nel frattempo). Verificato
  online senza intercettare niente: pagina servita identica a `senzaCommenti(repo)`; `mappa-ferma.js` sul sito vero, 20 s:
  `/` 0,29 s, pioggia ieri Toscana 0,51, previsioni 0,26 e 0,34, boschi 0,32, radar 1,56 (la sua animazione);
  `stati-mappa.js` 40 scene su 40, crediti in 30 strette su 30, nessun errore.

## Le etichette del meteo fuori dal gioco mentre si pizzica (8/11/2026, scheda 128 bis)

La variante A del punto 4 (proposta in `D:\video youtube\claudio\proposte-128bis\PROPOSTE.md`), suo «Sì, falla» dopo il
filmato `D:\video youtube\claudio\12 gg\pizzico-previsioni-oggi-e-nuova.mp4` (`registra-pizzico.js`: telefono CPU ×4,
fotogrammi veri del browser rimontati coi loro tempi, tondi delle dita solo nel filmato).
- **Il filmato ha mostrato una cosa che non sapevo:** già prima, durante il pizzico, le etichette NON si vedevano
  (spariscono quando partono le dita e tornano a fine zoom, dentro e fuori). Leaflet però le spostava una per una a ogni
  fotogramma (214 in Toscana, 50-70 ms a fotogramma al telefono lento): lavoro per etichette invisibili.
- **La modifica** (blocco «LE ETICHETTE DEL METEO FUORI DAL GIOCO MENTRE SI PIZZICA», in fondo prima di `</body>`): col
  tocco a DUE dita e solo nelle previsioni (`body.modo-prev`) `#map` prende `pv-pizzico`, che mette il pannello dei
  segnaposto in `display:none`; su `zoomend` (che Leaflet manda prima di `moveend`, quindi veDirada misura etichette già
  visibili) la classe si toglie. Due dita appoggiate senza zoomare: niente zoomend, si toglie 0,6 s dopo aver alzato le
  dita. ⚠️ In `display:none` va TUTTO il pannello dei segnaposto: nelle previsioni ci sono solo le etichette e la
  targhetta del posto cercato, che durante il pizzico non si vedevano già.
- **Misure** (sopra il main col ridisegno a pezzi, `fluidita.js prev-toscana-tel`, Chrome visibile, tre giri alternati):
  pizzico dentro **31-36 → 38-47 fps**, fotogrammi lenti (p95) 100-150 → 33-50 ms, compiti lunghi 0,97-1,15 → 0,55-0,82
  s; pizzico fuori 60 → 58 (un blocco di ~0,1 s quando le etichette tornano); dito 60. A vedersi uguale (filmato).
  `controlla-pizzico.js`: dopo ogni zoom le stesse etichette visibili della pagina di prima (5, poi 14). Stati della mappa
  40 scene: 35 uguali, 5 nel rumore, nessun errore.
- **IN PRODUZIONE l'8/11/2026 alle 16:51** (suo «Sì, tutt'e due»): push `18277abd56` alle 16:50, deploy `f4627602` dal
  worktree intero della 128 bis allineato a origin/main. Verificato online senza intercettare niente: pagina servita
  identica a `senzaCommenti(repo)`; `controlla-pizzico.js` sul sito vero: classe accesa col pizzico e spenta a fine zoom,
  stesse etichette (5, poi 14); `fluidita.js prev-toscana-tel` sul sito vero, quattro giri: pizzico dentro 32, 37, 40, 45
  fps (i primi due a browser freddo; prima della modifica, sul sito vero, 30 e 34), pizzico fuori 57-58, dito 59-60;
  `stati-mappa.js` 40 scene su 40, le 12 delle previsioni uguali, nessun errore.

## I crediti del radar: sull'Italia è il radar della Protezione Civile (9/11/2026, scheda 130)

- **Perché.** Valutando le regole di LibreWXR prima di mettere il +40 nelle pagine (suo, 8/11 sera: «non l'abbiamo
  fatta per non intasare il fornitore di dati, prima valuta se rientriamo nelle sue policy»), è venuto fuori che
  sull'Italia LibreWXR non usa OPERA (l'Italia non c'è) ma il composito della Protezione Civile, **Radar-DPC, licenza
  CC BY-SA 4.0** (README di LibreWXR: fonte «Dipartimento della Protezione Civile, Presidenza del Consiglio dei
  Ministri»). Noi scrivevamo ovunque «OPERA (CC BY)»: era l'unica loro regola che non rispettavamo. Valutazione intera in
  `D:\video youtube\claudio\proposte-130\VALUTAZIONE-LIBREWXR-40.md`, proposta in `PROPOSTA-CREDITI-RADAR.md` accanto.
- **Cosa dice adesso.** Mappa col radar acceso: crediti «radar LibreWXR · Radar-DPC · OPERA», «Radar-DPC» (nowrap)
  porta alla riga del radar di fonti (`fonti.html#radar`, `id` nuovo), dove ci sono licenza e fonte: la licenza CC 4.0
  ammette il link a una pagina con le informazioni. Prima prova con le licenze per esteso: a 1920 andava a capo
  («OPERA (CC BY 4.0)» da solo sotto, suo screen); misurato (`scratchpad\radar40\misura-crediti-130.js`): oggi online 1
  riga da 1536 in su, per esteso 2 righe ovunque, corto 1 riga a 1920-1600 e 2 da 1536 in giù (riquadro al 34% dello
  schermo). Riga sotto il radar «Protezione Civile e OPERA».
  Pagine «adesso» (`lib/pagina-adesso.js` + generatore): stessi crediti corti nella cartina (per esteso nel piede), riga «Radar della Protezione Civile
  sull'Italia, OPERA fuori, circa 2 km.», «Come funziona il radar» e piede; `VERSIONE_JS` 20. Riquadro «Radar piogge»
  delle pagine meteo: «radar LibreWXR · Radar-DPC · OPERA» (le licenze per esteso in «tutte le fonti e licenze»).
  `fonti.html` e guida: Protezione Civile sull'Italia, OPERA fuori, **184 radar in 27 paesi** (erano 155 e 24); sotto la
  foto `guida/radar.jpg` «Radar: LibreWXR, Radar-DPC, licenza CC BY-SA 4.0».
- **Trovato strada facendo:** le «adesso» scrivevano «un fotogramma nuovo arriva ogni 5 minuti»: è ogni **10** (l'elenco
  dei fotogrammi va di 10 in 10). Corretto nel testo; la pagina si rinfresca ancora ogni 5 minuti (punto 2 del modo A).
- **Pagine:** 21 regioni e 30 città «adesso», 49 valli e 44 paesi meteo rigenerati nello stesso commit del codice
  (accordo con la Goccia, ex 127): cambiano solo le righe dei crediti, «ogni 10» e `?v=20`. Prove
  (`scratchpad\radar40\prova-crediti-130.js` e `prova-pagine-130.js`, Esri bloccato): mappa PC 1440 e 1366 e telefono,
  riquadro dei crediti grande come prima; 10 pagine × PC e telefono, crediti dentro la cartina, nessun errore nuovo.
- **Per il futuro:** un video o un post col radar sull'Italia porta «Radar: LibreWXR, Radar-DPC, CC BY-SA 4.0».
- **Restano del modo A** (sua scelta dell'8/11): 2. le «adesso» ferme quando la pagina è nascosta e aggiornate ogni 10
  minuti (oggi una scheda dimenticata fa ~4.500 richieste al giorno); 3. il +40 delle «adesso» tagliato davvero (oggi
  arriva a +60, anche nella riga viva) e l'elenco dei fotogrammi chiesto una volta. Poi, dopo il 14/11, il +40 nelle pagine.
- **IN PRODUZIONE il 9/11/2026 alle 7:41** (suo «Sì, tutt'e due»): push `ea0cec6054` (5 commit sopra `d3be0c24d6`), deploy
  `995dfc4d` dal worktree intero della 130 allineato, dopo il deploy della Goccia del mattino (`161d30e6`). Verificato
  online: mappa a 1920 una riga, 1440 due, telefono come prima; fonti e guida; Milano e Sicilia «adesso» con
  `pagina-adesso.js?v=20` e il link `fonti.html#radar`; Garfagnana e Crespano col riquadro nuovo; nessun errore nuovo.

## Al telefono giallo e pillola a turno, e il chiodino fuori dalla vetrina (12/11/2026, scheda 131)

- **Perche'** (misura della scheda GA4 5, settimana 5-11/11 contro 28/10-3/11, pagine della mappa, al telefono, al
  giorno): la pillola dei video da 6,6 a 0,7 tocchi, le uscite vere verso YouTube da 10 a 2, il giallo delle previsioni
  fermo a 21 tocchi con gli utenti scesi da 426 a 323. Chi fa analisi al telefono ne fa in media 2,76 a visita
  (`analisi_regione`): con l'una su quattro della scheda 119 alla pillola arrivavano in pochi. Scartate il 4/11 (e non
  riproposte): giallo e pillola uno sopra l'altro, il video nuovo «una volta sola», due tasti affiancati. Sua scelta del
  12/11: «La 1, a turno».
- **Ora** `window._turnoPillola` fa `n%2===0` (era `n%4===0`): giallo alla 1a, 3a, 5a analisi…, pillola alla 2a, 4a,
  6a…. Una riga sola di codice, piu' i commenti. Al COMPUTER e col RADAR non cambia niente: `serve()` dell'invito dà il
  giallo prima di guardare il turno, e la scheda grande della vetrina gira come prima, a ogni analisi.
- **Controllato prima**: `window._analisiN` (scritto in `loadData`) conta anche l'analisi che parte da sola aprendo un
  link (`?r=…&g=…`, ramo dei link condivisi); la riprova automatica no (`_retryCall`). Aprendo `/` senza link resta
  vuoto: nessuna analisi finche' la persona non sceglie. In tutti e due i casi la prima analisi vista e' la 1, quindi
  al giallo. `_vetrinaGira` chiama `giroTelefono()` solo al turno della pillola, e ogni turno passa alla voce dopo
  (prima voce a caso dal montaggio).
- **Il chiodino fuori dal giro** (stessa sera, suo «togliamo il chiodino»): tolta la chiave `chiodini` dal `sorteggio` di
  `data/vetrina.json`, quindi esce dalla pillola del telefono e dalla scheda grande del PC. La voce resta in `vetrine`
  (si rimette rimettendo la chiave). Il giro e' ora: aggiornamento di novembre › quiz › EP. 1 › EP. 2 › EP. 3 › EP. 4 ›
  «Iscriviti». Nella cassetta dei video lo short resta, perche' la cassetta prende gli ultimi 10 dal feed del canale; ma
  fuori dal sorteggio mostra titolo e copertina di YouTube invece della voce curata (`curata(id)` guarda il sorteggio).
- **Prove** (`scratchpad fe9f9e60…\giro-tel-131.js`, `BASE=http://127.0.0.1:9140` per il server locale,
  `VETRINA_LOCALE=1` per leggere la vetrina del repo invece di GitHub raw, `SOLO_GIRO=1` solo 393 e PC): telefono 393 e
  360, nove analisi di fila cambiando periodo, giallo alle dispari e pillola alle pari con la voce che cambia a ogni
  turno; PC 1440 giallo sempre e scheda grande che gira. L'avviso «non pronta in 25 s (periodi)» dei telefoni e' di
  `prove-veloci.js`, che col solo `g=7` nel link aspetta la scena sbagliata: le analisi vanno tutte a buon fine.
- **IN PRODUZIONE il 12/11/2026** (suo «ok quando sei a posto pubblica»): push `f86d544027` (turno) e `cbe8e49c6f`
  (vetrina), deploy `8a5e7251`. Verificato online: `_turnoPillola` con `n%2===0`, vetrina senza chiodino su GitHub raw e
  nella copia del sito, `giro-tel-131.js` sul sito vero uguale alla prova in locale, nessun errore.
- **Da misurare**: dopo una settimana in produzione la scheda GA4 5 rifà la misura coi numeri al giorno (tocchi della
  pillola, uscite verso YouTube, tocchi del giallo, utenti al telefono), contro la settimana 5-11/11.
- **⚠️ Trappola presa strada facendo: `grep -c $'\r$'` in Git Bash dice 0 anche su un file tutto CRLF.** Il grep di Git
  per Windows toglie i `\r` prima di cercare (senza `-U`), quindi il conto viene sempre zero. Così il 12/11 ho creduto
  che `index.html` e i `CLAUDE*.md` fossero diventati LF e ho cambiato la regola 11 in «LF» (`9464e47069`, col suo sì
  dato su un dato sbagliato). Contati in byte con Python, sono tutti CRLF: `index.html` 20.438 righe CRLF su 20.438
  (anche in HEAD), `fonti.html`, `guida/index.html`, i `CLAUDE*.md` e `data/vetrina.json` uguali. La regola 11 è
  rimessa com'era (CRLF) lo stesso giorno. **I fini riga si contano in byte**, per esempio
  `python -c "b=open('index.html','rb').read(); print(b.count(b'\r\n'), b.count(b'\n')-b.count(b'\r\n'))"`
  (CRLF e LF soli), oppure con `grep -cU`.

## Il radar in un giro solo, da -2 ore a +40 minuti, con la barra di ilMeteo (13/11/2026, scheda 133)

- **Suo**, il 13/11: il radar di ilMeteo fa un giro solo da -2 ore alla previsione, con una barra di avanzamento; noi
  avevamo tre tasti (Adesso · -2 ore · +40 min) e ogni giro andava per conto suo. Mockup di tre barre (A tacche, B come
  ilMeteo, C ora sul cursore), poi suo «previsioni in giallo?» e «B, come ilMeteo». Mockup e proposta in
  `D:/video youtube/claudio/proposte-133/` (`mockup-radar-giro/`, `PROPOSTA-RADAR-GIRO.md`).
- **Cosa fa ora** (blocco «MODO RADAR» di `index.html`): `vai()` chiede una lista sola, misure delle ultime 2 ore
  (`past`, 12 fotogrammi) + previsti fino a +40 (`PREVISTI_S`, tagliati per ora: 4). `crea()` aggiunge in mappa PER PRIMO
  lo strato di adesso (`AD`, l'ultima misura) e lo accende: chi apre vede subito la pioggia di adesso, ferma; quando tutti
  gli strati hanno il `load` (tetto 8 s) il giro parte da -2 ore. `passo()`: 0,7 s, 1,5 su adesso e sull'ultimo.
  `fermo` = l'ha fermato chi guarda (❚❚ o un tocco sulla barra): allora il giro non riparte da solo; `giroN` evita che il
  tetto di 8 s di un'entrata vecchia faccia partire il giro di una nuova. Titolo `titolo()`: «Radar pioggia · da -2 ore a
  +40 min», senza previsti «· ultime 2 ore» (nessun ripiego).
- **La barra** (`linea()`, classi `rd-giro`, `rd-play`, `rd-ora`, `rd-pezzi`, `rd-lingua`, `rd-cursore`): ▶/❚❚, l'ora in
  una casella (gialla nella previsione), un pezzo `<i>` per fotogramma (blu le misure, `.p` gialli a righe i previsti), la
  linguetta «previsione» larga quanto i previsti ma mai sotto 68 px, il cursore messo in PERCENTUALE (`(i+0,5)/n`): col
  pannello ancora nascosto la misura del pezzo darebbe zero. Tocco e trascinamento con i pointer event e
  `touch-action:none` sulla barra: provato col mouse e col dito, la mappa sotto non si sposta. Il giallo è quello delle
  previsioni del sito (`#ffdf5e` → `#ffcc1f`, bordo `#e0ad00`, scritta blu): suo, sul mockup.
- **Tolti**: i tasti `.rd-d` e `#rd-durate`, la linea `.rd-tacche`/`.rd-capi`, le loro regole sparse (`#reg-sheet .rd-d`,
  la «forma di Previsioni», il tratteggio del «+40», `.rd-durate` negli spazi), le variabili `APRI` e `scelta`, `segna()`.
- **Link**: `?radar=ora|due|prev` aprono tutti il giro (`entra()` senza modo); `window._radarModo` è sempre `'ora'`, quindi
  il link condiviso scrive `radar=ora`, che capiscono tutte le versioni. Testo della condivisione: «Dove va la pioggia: le
  ultime 2 ore e i prossimi 40 minuti al radar».
- **GA4**: l'evento `radar` non conta più `tasto-ora`, `tasto-due`, `tasto-prev`; conta `pausa`, `riparti` e `barra`
  (restano `acceso` e `link`).
- **Carico su LibreWXR, misurato** sulla Liguria: 16 fotogrammi, **96 tessere** all'apertura al PC (1366) e al telefono
  (393), 144 a 360 px; il «+40» di prima aveva 5 fotogrammi invece di 16, quindi circa un terzo. Si scaricano UNA volta
  all'apertura: il giro riaccende gli strati e non chiede niente (rientrando col tasto, altre 96).
- **Guida**: frase della «diretta radar» riscritta per il giro; `guida/radar.jpg` rifatta il 13/11 alle 15:10 (pioggia
  su Umbria, Romagna e alto Adriatico, giro fermato su adesso) con `scratchpad/scatta-radar-giro.js` della 133 (lo stesso
  ritaglio di `scatta-guida-radar.js` del banco, 1440x1000, clip 893x656, più il tocco su adesso prima dello scatto);
  testo alternativo e didascalia nuovi.
- **Prove** (server locale 9143 dal worktree, Esri bloccato; `scratchpad/prova-giro.js` della 133): giro, soste e ordine
  misurati (adesso 1,4 s mentre arrivano le tessere, poi 13:20 → 15:10 a 0,7 s, 1,5 s su 15:10 e 15:50); ❚❚, ▶, tocco e
  trascinamento al PC e col dito; link ora/due/prev e link condiviso; uscita col tasto e con un periodo, rientro; zoom 13;
  LibreWXR muto (il modo non si apre); PC 1366 e 1920, telefono 393 e 360 dritto e ridotto (pannello 275 → 171 px, la
  barra resta), telefono girato. Nessun errore. Mappa intera con `prove-veloci.js` (pioggia, boschi, radar, PC e
  telefono) a posto; `/previsioni/` in locale non parte perché manca la funzione delle previsioni (succede anche senza
  questa modifica).
- ⚠️ **Già così prima, non toccato**: col telefono girato il titolo del radar va a capo su 4 righe (78 px), anche sul sito
  vero con la scritta vecchia «prossimi 40 minuti». Allo zoom 13 la foto sotto è Esri da vicino (8 tessere, bloccate
  nelle prove): è la regola della foto, non del radar.
- **Resta**: lo stesso giro nelle pagine «adesso» e nei riquadri radar (`lib/pagina-adesso.js`) dopo il 18/11 (Goccia),
  proposta a parte con le sue misure.
