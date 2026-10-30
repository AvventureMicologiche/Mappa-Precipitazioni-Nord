# Controllo della mappa meteo, 30/10/2026

Controllo della sezione «☀️ Previsioni» e dei passaggi fra «💧 Storico piogge» e «☀️ Previsioni».
Solo controllo: main non è stato toccato. Le correzioni proposte stanno sul ramo
`claude/zealous-wright-ktc8ti`, in una PR da NON unire.

## Come è stato fatto (e cosa NON copre)

**Il sito vero non era raggiungibile da qui.** Il proxy dell'ambiente cloud rifiuta
`precipitazioni.avventuremicologiche.it` (CONNECT 403), e così anche `api.met.no`, `api.open-meteo.com`,
`api.librewxr.net`, le tessere Esri e OpenStreetMap. Per provare lo stesso i passaggi ho fatto girare
**una copia locale di main** (commit `652a28aa`, che è quello pubblicato) in Chromium headless (Playwright):

- file del sito serviti tali e quali dal repo, porta 8788 (quella che `index.html` usa in locale per le previsioni);
- le due Functions **vere** (`functions/api/previsioni.js` e `functions/api/cerca.js`) eseguite in Node, con
  **MET Norway e Open-Meteo finti**: dati sintetici con la stessa forma, quindi temperature e icone sono inventate;
- i file di `data/` presi dal checkout al posto di raw.githubusercontent;
- tessere a tinta unita per riconoscere i lampi a colpo d'occhio: **cartina stradale magenta, foto satellite verde**,
  rilievo grigio, radar trasparente; quindi nelle foto la mappa è verde;
- `localStorage.novitaVista='2026-10-26'` prima di ogni apertura;
- un registratore che ogni 40 ms annota cosa si vede (linguette, riquadro, scheda, banner, etichette, pallini,
  heatmap, legenda, pannello dei periodi, vetrina, tessere stradali o satellite) e, dopo ogni passo, il controllo
  delle etichette (sotto un riquadro, fuori dalla mappa, sovrapposte), dei testi (`undefined`, `NaN`, `null`)
  e di errori JS e richieste fallite.

Cosa resta fuori: i tempi veri di rete (li ho simulati con +900 ms sulle previsioni e +300 ms sulle tessere), le
immagini vere, eventuali differenze fra main e quello che è davvero online (si pubblica dal PC), e Safari.
Gli attrezzi stanno nello scratchpad della sessione (`check/`); si possono rilanciare sul PC contro il sito vero
cambiando `BASE` in `lib.mjs` e togliendo le finte.

Formati provati: 360x640, 393x760, 393x852, 852x393 (telefono girato), 768x1024, 1366x657, 1536x702, 1920x920,
più 1366x768 e 1440x900 per la ricerca, e i passaggi 800↔1200 e 393x852↔852x393.

## Riepilogo

| # | Gravità | Difetto | Formati |
|---|---|---|---|
| 1 | Alta | I risultati della ricerca finiscono sotto la scheda ora per ora | computer, soprattutto schermi bassi |
| 2 | Alta | Paese cercato nelle previsioni + tocco su un vicino: lo Storico si apre vuoto e il paese si perde | tutti |
| 3 | Media | Una ricerca nelle previsioni cancella l'analisi dello storico; poi un «Indietro» va a vuoto | tutti |
| 4 | Media | Entrando nelle previsioni da Radar o Boschi, uscendo il modo non torna e un «Indietro» va a vuoto | tutti |
| 5 | Media | Tornando all'Italia e rientrando nella stessa regione o valle, la scheda non si apre più da sola | tutti |
| 6 | Media | Lampo della cartina stradale entrando dalla linguetta e passando dall'Italia a una regione | tutti |
| 7 | Media | Telefono girato nella vista Italia: l'Italia non si reinquadra | telefono |
| 8 | Bassa | Schermi bassi: a scheda aperta il «📡 Diretta radar» sparisce dal riquadro | 1366x657, 1536x702 |
| 9 | Bassa | Vista Italia: un'icona sotto i crediti di Leaflet | 1536x702 |
| 10 | Bassa | `?m=prev` resta nell'indirizzo uscendo dalle previsioni | tutti |
| 11 | Bassa | Da un link `?r=…&m=prev`, la regione del link diventa un passo di «Indietro» | tutti |
| 12 | Bassa | Andata e ritorno da un link di pagina: lo storico prende una regione in più | tutti |
| 13 | Bassa | Link vecchio `?m=prev&l=…&n=…` senza `r`: 15-20 s di mappa vuota | tutti |

Non ho trovato: errori JS, richieste 4xx/5xx del sito (le uniche erano delle finte), testi `UNDEFINED`/`NaN`,
etichette sotto i riquadri nelle viste regione, valle e paese su nessuno degli 8 formati, pezzi delle previsioni
rimasti nello storico (banner, scheda, etichette) dopo l'uscita, lampi all'apertura dei link.

---

## 1. Alta: i risultati della ricerca finiscono sotto la scheda ora per ora

- **Formati**: computer. A 1366x657, 1366x768 e 1536x702 TUTTE le righe; a 1440x900 e 1920x920 dalla quarta riga in giù.
- **Passi**: apri `/?r=liguria&m=prev` (la scheda di Genova si apre da sola), scrivi «Calizzano» nella casella del riquadro.
- **Cosa succede**: la tendina dei risultati si apre dietro la scheda: a 1366x657 si vede solo una striscia della prima
  riga fra la casella e la scheda, e il clic finisce sulla scheda. Funziona solo con freccia giù e Invio, o chiudendo
  prima la scheda. In regione, valle e paese la scheda è quasi sempre aperta, quindi la ricerca col mouse non va.
- **Cosa ci si aspetta**: la tendina sopra la scheda.
- **Da dove nasce**: la tendina `#loc-drop` vive dentro `#pv-pan` (z-index 1200, `index.html:16614`), la scheda
  `#pv-det` ha 1250 (`index.html:16740`) e sugli schermi bassi parte subito sotto il riquadro.
- **Correzione proposta (sul ramo)**: una regola solo al computer,
  `body.modo-prev #pv-pan:has(#loc-drop.aperta){z-index:1300}`. Verificata: tutte le righe cliccabili a
  1366x657, 1366x768, 1440x900, 1920x920 (l'ultima riga di una lista lunga resta da scorrere, come prima). Al
  telefono non cambia niente (lì la scheda deve restare sopra il riquadro).

## 2. Alta: paese cercato nelle previsioni + tocco su un vicino, lo Storico si apre vuoto e il paese si perde

- **Formati**: tutti (provato 1366x657 e 393x760).
- **Passi**: apri `/`, linguetta «Previsioni», cerca «Calizzano», tocca l'etichetta di un paese vicino (Vado Ligure,
  Carcare), linguetta «Storico piogge», poi di nuovo «Previsioni».
- **Cosa succede**: lo storico resta zoomato sulla zona di Calizzano ma **senza regioni, pallini né segnaposto**; al
  telefono la barra in alto dice ancora «📍 Calizzano». Tornando alle previsioni si riparte dalla **vista Italia**:
  il paese cercato è perso.
- **Cosa ci si aspetta**: come senza il tocco sul vicino (che funziona): storico sul paese col segnaposto, e
  rientrando nelle previsioni ancora Calizzano.
- **Da dove nasce**: il tocco su un'etichetta azzera `cercato` (`index.html:17756`, `if(!p.cuore) cercato=null;`);
  `esci()` rifà la ricerca solo se `cercato` c'è (`index.html:17222` e `17225`), e senza regioni scelte (la ricerca
  nelle previsioni le toglie, `index.html:18004`) non inquadra niente; `posto` si azzera e l'opzione «📍 Calizzano»
  della tendina resta.
- **Correzione proposta (sul ramo)**: in `esci()`, se `cercato` è vuoto, non ci sono regioni scelte e c'è un posto
  cercato (`posto.src`), lo storico si apre su quel posto. «Storico piogge di <paese>» della scheda non cambia (usa
  ancora il paese toccato). Verificata al computer e al telefono.

## 3. Media: una ricerca nelle previsioni cancella l'analisi dello storico; poi un «Indietro» va a vuoto

- **Formati**: tutti (visto a 393x760; a 1366x657 la ricerca è bloccata dal difetto 1, e con la sua correzione
  il risultato è lo stesso).
- **Passi**: apri `/?r=liguria`, scegli «7 giorni», linguetta «Previsioni», cerca «Calizzano», poi «Indietro» del
  browser tre volte.
- **Cosa succede**: 1° Indietro: previsioni della Liguria (giusto). 2° Indietro: storico della Liguria **senza
  heatmap** (l'analisi a 7 giorni è sparita). 3° Indietro: **non succede niente**.
- **Cosa ci si aspetta**: il 2° Indietro riporta lo storico com'era (Liguria, 7 giorni, heatmap); il 3° toglie
  l'analisi.
- **Da dove nasce**: `window._prevVai` svuota le scelte dello storico (`index.html:18004`, `_svuotaScelta()`), che
  porta via anche il periodo; `rimettiScena` rimette solo la regione dalla tendina (`index.html:16950`). Il modulo
  «Indietro in tutto il sito» ha ancora il passo dell'analisi in `ordine`, ma l'analisi non c'è più: il popstate
  dopo lo consuma senza togliere niente.
- **Correzione**: non proposta (va deciso cosa deve succedere al periodo quando si cerca un paese nelle previsioni:
  per esempio ricordarlo e rimetterlo con `rimettiScena`, o non svuotare le scelte finché non si torna allo storico).

## 4. Media: entrando nelle previsioni da Radar o Boschi, uscendo il modo non torna e un «Indietro» va a vuoto

- **Formati**: tutti (provato 1366x657 e 393x760).
- **Passi**: apri `/?r=piemonte`, «Radar pioggia» (o «Mappa boschi»), linguetta «Previsioni», poi «Indietro» del
  browser due volte.
- **Cosa succede**: 1° Indietro: storico **senza radar**. 2° Indietro: **non succede niente**. Lo stesso con la
  linguetta «Storico piogge»: il radar o i boschi non tornano.
- **Cosa ci si aspetta**: il 1° Indietro riporta il radar acceso (la pagina da cui si veniva), il 2° lo spegne.
- **Da dove nasce**: `entra()` spegne radar e boschi con un clic da codice (`index.html:17174-17175`); il modulo
  «Indietro in tutto il sito» in quel momento è fermo (`_prevAttivo`, `index.html:18090`), quindi il passo del radar
  resta nella cronologia con il radar spento, e il popstate dopo non trova niente da spegnere.
- **Correzione proposta (sul ramo)**: `entra()` si ricorda il modo acceso (`modoPrima`, non per il radar aperto da
  «📡 Diretta radar») e `esci()` lo riaccende quando si esce con Indietro, la linguetta o il tasto «↩ Indietro»; non
  quando si esce scegliendo un periodo, il radar, i boschi o «Storico piogge di <paese>». Verificata: Indietro →
  storico col radar, Indietro → radar spento.

## 5. Media: tornando all'Italia e rientrando nella stessa regione o valle, la scheda non si apre più da sola

- **Formati**: tutti (1366x657, 393x760).
- **Passi**: apri `/previsioni/`, scegli «Toscana» (la scheda di Firenze si apre da sola), «Indietro» (vista
  Italia), scegli di nuovo «Toscana». Uguale con «Avanti», e con una valle cercata (Val Bormida → Indietro → Avanti).
- **Cosa succede**: la seconda volta la scheda **non si apre**; la prima sì.
- **Cosa ci si aspetta**: la stessa vista si comporta allo stesso modo.
- **Da dove nasce**: nella vista Italia `veDisegna` non viene chiamata (`index.html:17382`), quindi `VE.scena`
  resta quella della regione di prima; rientrando nella stessa regione la chiave è uguale, la vista non è «nuova» e
  `VE.aperto0` resta vero (`index.html:17746`).
- **Correzione proposta (sul ramo)**: in `disegna()`, nella vista Italia, si azzera `VE.scena`. Verificata.

## 6. Media: lampo della cartina stradale entrando dalla linguetta e passando dall'Italia a una regione

- **Formati**: tutti.
- **Passi e misure** (previsioni +900 ms, tessere +300 ms):
  - dallo storico, linguetta «Previsioni» (con o senza regione, anche col paese di una pagina): la **cartina
    stradale resta sotto il riquadro delle previsioni per ~1 s** (951-1129 ms misurati), senza etichette, finché
    non arrivano le previsioni; poi fondo scuro e satellite;
  - nella vista Italia, scegliendo una regione (Toscana, computer): per ~1,3 s **cartina stradale con sopra le 92
    icone dell'Italia e il banner «METEO ITALIA»**, mentre il titolo dice già «Toscana».
- **Cosa ci si aspetta**: come per i link (`apre-italia`/`apre-vista`, aperture misurate pulite anche con la rete
  lenta): niente cartina stradale finché la vista nuova non c'è.
- **Da dove nasce**: le classi che nascondono le tessere stradali (`index.html:1792`, `1799`) le mette solo lo script
  in testa coi link (`index.html:1805`); entrando dalla linguetta il fondo arriva con `viPezzi` a previsioni arrivate.
  Passando dall'Italia alla regione, `zoomend` chiama `viFondo` (`index.html:17190`) quando `italia()` è già falso e
  `VE.scena` è ancora vuota (`index.html:17474`): il satellite si spegne e torna la cartina, con le icone vecchie
  sopra finché non arriva la regione. Senza la ricerca usata prima, la regione aspetta anche `elenco-paesi.txt`
  (366 KB, 136 KB compressi), e intanto resta la cartina.
- **Correzione**: non proposta (per esempio mettere `apre-vista` anche in `entra()` e quando cambiano le regioni,
  fino al primo disegno della vista nuova).

## 7. Media: telefono girato nella vista Italia, l'Italia non si reinquadra

- **Formati**: 393x852 → 852x393 (e al contrario).
- **Passi**: apri `/previsioni/` in verticale, gira il telefono.
- **Cosa succede**: resta lo zoom e il centro del verticale (5,25): in orizzontale il sud (Calabria, Sicilia) esce
  sotto lo schermo e una parte dell'Italia sta dietro la colonna di sinistra. Aperta direttamente in orizzontale
  invece è giusta (zoom 4,75, accanto alla colonna).
- **Cosa ci si aspetta**: l'Italia reinquadrata come all'apertura.
- **Da dove nasce**: `nuovaMisura()` (`index.html:17160-17165`) azzera solo `VE.scena`, che rifà l'inquadratura di
  regione, valle e paese; la vista Italia non ha una scena e nessuno chiama `inquadra()`.
- **Correzione**: non proposta (una riga: in `nuovaMisura()`, se `italia()`, chiamare `inquadra()`).

## 8. Bassa: schermi bassi, a scheda aperta il «📡 Diretta radar» sparisce dal riquadro

- **Formati**: 1366x657, 1536x702 (scelta «A» degli schermi bassi).
- **Passi**: apri `/?r=toscana&m=prev`.
- **Cosa succede**: la riga della fonte col «📡 Diretta radar» è nascosta (`display:none`) finché la scheda è aperta,
  e in regione la scheda si apre da sola. Per arrivare al radar bisogna chiudere la scheda.
- **Nota**: al telefono la stessa cosa è già nota (la scheda copre il link); qui il link non è coperto ma tolto.
  `index.html:16715`.

## 9. Bassa: vista Italia, un'icona sotto i crediti di Leaflet

- **Formati**: 1536x702.
- **Passi**: apri `/previsioni/`.
- **Cosa succede**: un'icona della Sicilia sud-orientale finisce in parte sotto i crediti in basso a destra.
- **Da dove nasce**: `dirada()` della vista Italia (`index.html:17436`) non conta crediti e scritta della fonte fra
  gli ostacoli; `veDirada` sì (difetto 8 della caccia).

## 10. Bassa: `?m=prev` resta nell'indirizzo uscendo dalle previsioni

- **Passi**: apri `/?r=toscana&m=prev`, «📡 Diretta radar» o linguetta «Storico piogge», ricarica la pagina.
- **Cosa succede**: si riaprono le previsioni, non lo storico o il radar.
- **Da dove nasce**: `indirizzoMappa()` (`index.html:16958`) toglie solo `/previsioni/`, non `m=prev`.

## 11. Bassa: da un link `?r=…&m=prev`, la regione del link diventa un passo di «Indietro»

- **Passi** (1920x920): apri `/?r=toscana&m=prev`, «📡 Diretta radar», ✕ chiudi radar, linguetta «Previsioni»,
  «Indietro» due volte.
- **Cosa succede**: l'ultimo Indietro toglie la Toscana (mappa d'apertura) invece di uscire dal sito.
- **Da dove nasce**: il modulo «Indietro in tutto il sito» fissa la base (le cose accese dall'apertura) al primo
  `guarda()` senza gesti (`index.html:18125`), ma finché le previsioni sono accese è fermo: la base resta vuota e la
  regione del link viene contata come passo.

## 12. Bassa: andata e ritorno da un link di pagina, lo storico prende una regione in più

- **Passi**: apri `/?r=liguria&s=p&pl=44.2361,8.1182&pn=Calizzano&g=7` (il link di una pagina paese), linguetta
  «Previsioni», linguetta «Storico piogge».
- **Cosa succede**: lo storico torna su Calizzano ma con **Liguria + Piemonte** (prima solo Liguria) e un'altra
  inquadratura: `esci()` rifà la ricerca vera (`index.html:17225`), che aggiunge le regioni vicine. Uguale con
  `/?r=liguria&m=prev&pl=…&pn=Calizzano`. L'analisi a 7 giorni resta.

## 13. Bassa: link vecchio `?m=prev&l=…&n=…` senza `r`

- **Passi**: apri `/?m=prev&l=44.2361,8.1182&n=Calizzano`.
- **Cosa succede**: per ~15 s mappa scura vuota (lo script in testa mette `apre-italia`, perché `l` non è fra i
  parametri di `index.html:1805`), le previsioni non partono (si aspetta una regione che non arriva,
  `index.html:17117`), poi a 20 s compare lo storico.
- **Nota**: le pagine non producono link così (usano `r` + `pl`/`pn` + `m=prev`): conta solo se ne girano di vecchi.

---

## Cosa funziona (provato)

- Aperture di `/previsioni/`, `/?m=prev`, `/?r=toscana&m=prev`, `/?r=…&m=prev&pl=…&pn=…`: nessun lampo dello storico,
  della legenda, dei pallini, della vetrina o della cartina stradale, anche con la rete lenta.
- Vista Italia, regione, valle, paese, tocco su etichetta e su città del banner, cambio di giorno (banner e scheda
  seguono il giorno), chiusura della scheda con ×.
- Linguette avanti e indietro con e senza regione; paese cercato nello storico che resta evidenziato nei due sensi;
  scheda di un pluviometro → «vai alle previsioni» → linguetta Storico (l'analisi resta).
- «📡 Diretta radar» dalle previsioni e Indietro che ci rientra, anche partendo da un paese cercato senza regioni.
- Indietro/Avanti dentro le previsioni (scheda toccata → torna quella aperta da sola; valle → Italia → Avanti).
- Passaggio 800↔1200 e 1200↔800 in regione e paese: banner, casella nel riquadro, pillola, «Indietro» e scheda
  tornano al posto giusto; telefono girato in regione: colonna a sinistra e banner sopra la scheda.
- 8 formati × 5 viste: nessuna etichetta sotto i riquadri o sovrapposta (salvo il punto 9), niente scorrimento
  orizzontale, niente testi sbagliati.

## Correzioni proposte sul ramo

Quattro modifiche piccole a `index.html` (26 righe), ognuna col suo commento nello stile del file: difetti 1, 2, 4 e 5.
Non sono pubblicate e non vanno unite così: sono una base da guardare.

Verifiche dopo le modifiche, sempre sulla copia locale:

- **1**: righe dei risultati cliccabili a 1366x657, 1366x768, 1440x900 e 1920x920 (l'ultima di una lista lunga resta
  da scorrere, come prima); a 1366x657 la ricerca di Calizzano col clic ora funziona.
- **2**: al computer e al telefono, Calizzano cercato nelle previsioni → tocco su Vado Ligure / Carcare → Storico:
  Liguria + Piemonte col segnaposto; → Previsioni: di nuovo Calizzano.
- **4**: radar e boschi, al computer e al telefono: Previsioni → Indietro riporta il modo, l'Indietro dopo lo spegne;
  con la linguetta Storico il modo torna. «📡 Diretta radar» e ritorno invariati.
- **5**: Toscana → Indietro → Toscana di nuovo, e Avanti: la scheda di Firenze si riapre da sola; Val Bormida →
  Indietro → Avanti: la scheda di Cairo Montenotte si riapre.
- Ripasso senza differenze: vista Italia e linguette (A), paese cercato nello storico (B), analisi a 7 giorni con
  Indietro/Avanti e «↩ Indietro» (C), «📡 Diretta radar» (D, R1), linguette col paese cercato (G), valle (L),
  Avanti dopo la linguetta (R2).
- Il difetto 3 resta (ora visibile anche a 1366x657, perché la ricerca funziona).
