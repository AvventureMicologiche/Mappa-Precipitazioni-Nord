# I punti «da guardare» del settimo e dell'ottavo check — mercoledì 21/10/2026

Lavoro **solo in lettura** sul main di oggi (`a5aa3c05`, 16:10 italiane). Non ho toccato codice né `data/`, non ho
lanciato workflow e non ho fatto richieste al sito vero né a MET Norway. Ho letto i workflow, i collector, i dati, la
storia dei commit (ultimi ~3.000 su main, dal 29/9) e i **600 giri di GitHub Actions** dal 17/10 17:52 al 21/10 16:09
(quelli leggibili da qui), più lo storico completo di `alert-fonti.yml`.

**Nessuno dei 13 punti è stato superato** dalle correzioni del settimo (`d2f4c1d3`) e dell'ottavo check (`18294b42`):
quei due commit non toccano nessuno dei file in questione, salvo `index.html` in punti diversi. Tutti e 13 ci sono
ancora. La buona notizia: **nessuno ha fatto danni misurabili finora**. Tre meritano una correzione piccola (5, 7, 13),
gli altri si possono fare quando si passa da quei file, o lasciare.

In fondo, due cose viste per strada che non erano nella lista.

---

## 1. Piemonte sopra 300 mm: vince l'archivio ufficiale, che conta il giorno in UTC

- **C'è ancora?** Sì. `.github/scripts/collect-piemonte.js`, riga 57 (`SOGLIA_UFF_SEMPRE_MM = 300`) e riga 315
  (`(mine.h || 0) < 24 || (mine.mm || 0) > SOGLIA_UFF_SEMPRE_MM`).
- **Quanto succede davvero:** **mai.** Su tutti i 441 file di `data/piemonte` nessuna stazione supera i 300 mm; sopra i
  150 ce ne sono due in tutto (Omegna 156 il 28/8/2025, Cannobio 205,4 il 2/6/2026). Alla fonte un giorno così c'è
  stato il 2/10/2020 (tempesta Alex, 16 pluviometri sopra i 300).
- **Chi lo vede e cosa vede:** nel giorno di un'alluvione, sulle stazioni sopra i 300 mm: il valore di G diventa quello
  ufficiale «da mezzanotte UTC», cioè **perde la pioggia fra le 00 e le 02 italiane di G e prende quella fra le 00 e le
  02 di G+1** (che finisce anche nel file di G+1, dal realtime: contata due volte). In mappa e nelle pagine.
- **Perché la regola c'è:** il tetto orario di 150 mm ferma un'ora guasta, ma non un sensore che scrive 140 mm ogni ora
  per 24 ore. Sopra i 300 l'ufficiale fa da arbitro. Togliere la regola toglie anche l'arbitro.
- **Cosa costerebbe correggerlo:** tenere l'arbitro solo quando serve davvero, cioè quando l'ufficiale smentisce il
  nostro numero, e non quando lo conferma con due ore di scarto. Una riga:
  ```js
  // riga 315, al posto di (mine.mm || 0) > SOGLIA_UFF_SEMPRE_MM
  || ((mine.mm || 0) > SOGLIA_UFF_SEMPRE_MM && ptot < (mine.mm || 0) * 0.5)
  ```
  Con l'ufficiale sotto la metà del nostro è un guasto (vince l'ufficiale); altrimenti si tiene il realtime, col giorno
  italiano giusto. Rischio: il 50% è una soglia scelta a tavolino; con un guasto «a metà» resterebbe il nostro numero.
- **Raccomandazione: correggere quando si tocca il file.** Non è mai successo e quando succederà conterà poco rispetto
  all'evento; ma la regola scritta nel CLAUDE.md dice di non usare il giorno UTC, e la riga sopra la rispetta.

## 2. Id uguali in due cartelle sommati come un pluviometro solo

- **C'è ancora?** Sì. `lib-clima.js` riga 110 (`somma[s.id] = (somma[s.id] || 0) + s.mm`) e `genera-funghi.js`
  riga 105 (`m[s.id] = (m[s.id] || 0) + s.mm`).
- **Quanto succede davvero:** ho incrociato tutti gli id di tutte le regioni che leggono più cartelle
  (lombardia+emilia, piemonte+liguria, toscana+liguria, friuli-osmer+meteohub-friuli), su tutti i file:
  - **Lombardia + Emilia:** id `11` (Bormio Ponte sul Frodolfo / Panocchia, a 198 km) con **168 giorni in comune, 71
    bagnati**; id `14741` (Rho Scalo Fiorenza / Ponticelli) con 5 giorni in comune.
  - **Piemonte + Liguria:** 50 id `om_0`…`om_49`, ma solo nei vecchi file di stima Open-Meteo: `clima()` li scarta
    (`leggiVere`) e `perGiorno` guarda solo le ultime settimane. Innocui.
  - Toscana + Liguria e le due cartelle del Friuli: **nessun id in comune.**
- **Chi lo vede e cosa vede:** **nessuno, oggi.** Le somme si leggono solo per gli id dei posti funghi, e né 11 né
  14741 sono posti funghi. Anche la classifica delle pagine paese (`genera-pagine-localita.js` r. 238) si fa solo fra i
  posti della regione. Bormio ha il totale sbagliato in memoria, ma non lo stampa nessuno.
- **Cosa costerebbe correggerlo:** in `cartelleDi` restituire, per le cartelle ospiti, solo gli id dei posti ospiti, e
  in `perGiorno`/`clima` saltare gli altri id di quella cartella. 6-8 righe fra `lib-posti.js`, `lib-clima.js` e
  `genera-funghi.js`, e la rigenerazione delle pagine. Rischio: tre file che devono restare d'accordo.
- **Raccomandazione: lasciare così**, con un controllo gratis: quando si aggiunge un posto funghi, guardare che il suo
  id non esista anche nella cartella ospite. Diventa un problema solo se Bormio o Rho diventano posti funghi.

## 3. Due giri che scrivono gli stessi file: chi spinge per secondo perde il giro

- **C'è ancora?** Sì. I file del giorno sono **JSON su una riga sola**: qualunque modifica concorrente allo stesso file
  è un conflitto, e `git pull --rebase` non lo può risolvere. Il `git rebase --abort` del sesto check fa solo ripartire
  pulito il tentativo dopo, che fallisce uguale.
- **Quanto succede davvero:** nei 600 giri dal 17/10 i rossi sono 9. **Uno solo è un conflitto sul contenuto**:
  MeteoHub del 18/10 alle 16:52 («Could not apply f154e87... # meteohub», 5 tentativi falliti). Ma era fra **due giri
  di MeteoHub**, prima che il sesto check mettesse `ref: main`: il giro in coda ripartiva dallo SHA vecchio. Quella
  causa è già chiusa. Gli altri 8 rossi: Valle d'Aosta 18-19/10 (6), Alto Adige 19/10 23:10 (già noto), Veneto 21/10
  01:06 (ARPAV non risponde, `ETIMEDOUT`).
  - **MeteoHub contro meteohub-gaps:** 4 giri dei buchi in 4 giorni, nessuno sovrapposto a un giro MeteoHub (il più
    vicino a 5 minuti). meteohub-gaps ha committato 8 giorni su 23.
  - **gaps-nord:** **nessun commit dal 29/9** (non trova buchi da coprire). Esposizione zero.
  - **«Temperature impossibili» in `riepiloghi.yml`:** è il caso vero. 56 commit dal 29/9, 4-5 al giorno, e toccano
    proprio i file che i collector riscrivono (vedi «visto per strada» A: Baunei). Se spinge per primo lui, il
    collector che sta girando sullo stesso file perde il giro. Nei 4 giorni misurati non è successo, ma il 21/10 il
    passo ha spinto alle 11:40 e MeteoHub aveva finito alle 11:29.
- **Chi lo vede e cosa vede:** un giro rosso e un giro di dati in meno; il giro dopo ripara (MeteoHub ripassa 5 volte
  al giorno). Danno solo se il giro perso è l'ultimo che chiude un giorno.
- **Cosa costerebbe correggerlo:** due strade.
  - **La più economica (consigliata):** in caso di conflitto il collector non riprova lo stesso rebase, ma butta il suo
    commit, riparte da `origin/main` e **rilancia lo script** (che legge il file aggiornato e riscrive). È una modifica
    al ciclo del passo «Commit e push» di 17 workflow (~4 righe l'uno), sempre uguale.
  - Più semplice ma più lenta: lo stesso gruppo di `concurrency` per `meteohub.yml` e `meteohub-gaps.yml`. Non serve
    per le temperature, che già lasciano perdere da sole.
  Rischio: rilanciare lo script raddoppia le richieste alla fonte in quel giro (solo nel caso del conflitto).
- **Raccomandazione: lasciare così per ora**, ma togliere la causa più frequente di sovrapposizione, che è il ping-pong
  delle temperature (vedi A). Senza quello, i conflitti restano un caso raro che il giro dopo ripara.

## 4. `alert-fonti.yml`: se la mail fallisce, il registro non si salva

- **C'è ancora?** Sì. `.github/workflows/alert-fonti.yml` riga 241, il passo «Commit del registro» ha solo
  `if: steps.check.outputs.registro == 'true' || …`, quindi vale anche `success()`. In più c'è un dettaglio non scritto
  nel settimo check: **basta che fallisca la mail dei campi spariti** (passo di riga 216, che col registro non c'entra)
  e il registro non si salva lo stesso.
- **Quanto succede davvero:** **mai.** Gli ultimi 14 giri leggibili (8-20/10) sono tutti verdi. Il 7/10 manca un commit
  del registro, ma il giro non risulta proprio: GitHub l'ha saltato.
- **Chi lo vede e cosa vede:** una mail «nuovo allarme» ripetuta il giorno dopo invece del promemoria. Fastidio, non
  dati sbagliati.
- **Cosa costerebbe correggerlo:** una riga, `if: always() && (steps.check.outputs.registro == 'true' || steps.ferme.outputs.registro == 'true')`.
  Rischio: se la mail fallisce, l'allarme risulta «già mandato» e non riparte: la mail di quel giorno si perde del
  tutto. Ma GitHub manda già la notifica di workflow rosso.
- **Raccomandazione: correggere quando si tocca il file.** Una riga, rischio basso, ma il caso non è mai capitato.

## 5. Nessun tempo massimo: né sui giri né sulle richieste

- **C'è ancora?** Sì, e **più largo di come era scritto**:
  - `timeout-minutes` manca in tutti i 17 collector (c'è solo in anteprime, mnw-check, pagine-regione, riepiloghi,
    rinnova-pagine).
  - Richieste senza tempo massimo: non solo Emilia (`collect-emilia.js` r. 92) e Trentino (r. 33 e 54), ma anche
    **Veneto** (r. 46), **Alto Adige** (r. 48) e soprattutto **Toscana**: la richiesta principale al SIR
    (`collect-toscana-sir.js` r. 215, `fetchRaw(SIR_URL)`) non ha tetto; ce l'ha solo quella della mappa SIR (r. 232).
- **Quanto succede davvero:** **mai, nei dati che ho.** Il giro più lungo dei 600 è di 32 minuti (Alto Adige, con
  l'attesa in coda), i collector stanno di norma sotto i 5. Le chiusure toscane: dal 6/10 **ogni giorno** il file è
  chiuso alle 23:40, nessuno saltato.
- **Chi lo vede e cosa vede, se succede:** è il punto più serio della lista per la Toscana. Se il giro delle 22:15
  resta appeso, le quattro chiusure di Cloudflare vanno in coda nel gruppo `toscana`. **GitHub tiene in coda un giro
  solo**: ogni nuovo arrivato cancella quello che aspettava. Resta l'ultimo, che parte quando l'appeso muore (6 ore
  dopo, alle ~04:15), senza `CLOSING` (punto 6) e quindi scrive sul giorno nuovo. **Il giorno prima non si chiude più**
  e il SIR non si può interrogare a posteriori: la pioggia della sera è persa.
- **Cosa costerebbe correggerlo:**
  - `timeout-minutes: 20` sotto `runs-on:` nei 17 collector (una riga l'uno; 20 minuti stanno larghi sopra il giro
    più lento visto). Per la Toscana basterebbe 10.
  - Un tempo massimo sulle richieste in Emilia, Trentino, Veneto, Alto Adige e Toscana, come già fa la Liguria:
    `{ timeout: 30000 }` nelle opzioni di `https.get` e `.on('timeout', function () { this.destroy(new Error('timeout')); })`.
    2 righe per funzione, 6 funzioni.
  Rischio: basso; un giro lento davvero verrebbe tagliato, ma il giro dopo riprova e con la Toscana il primo tentativo
  ha già il Retry.
- **Raccomandazione: correggere ora, almeno `timeout-minutes` sulla Toscana e la richiesta SIR di r. 215.** È l'unico
  caso della lista in cui un guasto esterno (un server che non risponde) fa perdere un dato non recuperabile.

## 6. Le chiusure della Toscana lanciate da Cloudflare non impostano `CLOSING`

- **C'è ancora?** Sì. `toscana.yml` riga 26: `CLOSING` vale 1 solo per i tre cron. La sveglia
  (`.github/cloudflare/sveglia-guardiano.js` r. 37-41) lancia `toscana.yml` alle 22:40, 23:00, 23:25 e 23:40 italiane
  senza input.
- **Quanto succede davvero:** **non serve, finché partono in orario.** Il collector chiude comunque dalle 22 in poi
  (`isClosing = italyHour >= 22 || …`, r. 191). Misurato sui 600 giri: le chiusure di Cloudflare partono **tutte entro
  un minuto** dall'orario (17, 18, 19, 20/10). I file dal 6/10 sono tutti chiusi alle 23:40. La sveglia ragiona in
  ora italiana con `Intl`, quindi il 25/10 non si sposta niente.
- **Chi lo vede e cosa vede:** nessuno, salvo il caso del punto 5 (una chiusura in coda che parte dopo mezzanotte).
- **Cosa costerebbe correggerlo:** un input `closing` nel `workflow_dispatch` di `toscana.yml`, l'espressione di riga 26
  che lo legge, e `inputs: { closing: '1' }` nel corpo del POST della sveglia per le righe di chiusura. ~5 righe in due
  file più il redeploy del worker. Rischio: un lancio a mano con `closing` messo per errore di mattina chiuderebbe ieri.
- **Raccomandazione: lasciare così.** Il problema esiste solo insieme al punto 5: correggendo il 5, questo non serve.

## 7. Sette collector senza `permissions:`; `anteprime.yml` senza `ref: main`

- **C'è ancora?** Sì: `altoadige.yml`, `emilia.yml`, `liguria.yml`, `piemonte.yml`, `toscana.yml`, `trentino.yml`,
  `veneto.yml` non hanno il blocco. `anteprime.yml` r. 50 fa `actions/checkout@v5` senza `ref: main`.
- **Quanto succede davvero:** **niente.** Spingono tutti, quindi l'impostazione del repo dà già la scrittura.
  `anteprime` dallo SHA del lancio legge solo `data/riepiloghi/<regione>.json` per sapere qual è «ieri»
  (`genera-anteprime.js` r. 117); le immagini le scatta dal sito vero.
- **Chi lo vede e cosa vede:** oggi nessuno. Il giorno che qualcuno mettesse il repo su «token in sola lettura» (è il
  valore di partenza di GitHub per i repo nuovi) i 7 collector smetterebbero tutti insieme di salvare, in rosso.
  Per `anteprime`: un giro rimasto in coda potrebbe scattare «ieri» con la data vecchia; dall'ottavo check la pagina
  la scarta e mostra il riquadro blu.
- **Cosa costerebbe correggerlo:** `permissions:\n  contents: write` (2 righe) nei 7 file; `with:\n  ref: main`
  (2 righe) in `anteprime.yml`. Rischio nullo: è quello che hanno già gli altri 10 collector.
- **Raccomandazione: correggere ora.** 16 righe, nessun rischio, rende i 17 collector uguali. Da fare insieme al
  punto 5, nello stesso commit sui workflow.

## 8. Date senza anno nell'etichetta del periodo

- **C'è ancora?** Sì, in tre posti di `index.html`, tutti con `{day:'2-digit',month:'short'}`: r. 5416 (inizio dati),
  r. 10134 (date personalizzate) e r. 11028 (link condivisi).
- **Quanto succede davvero:** non misurabile da qui (servirebbe GA4). Riguarda chi sceglie date dell'anno scorso o apre
  un link vecchio. **Dal 1/1/2027 riguarderà anche dicembre 2026**, cioè i periodi più comuni di inizio anno.
- **Chi lo vede e cosa vede:** in mappa «01 set → 30 set», e la stessa etichetta finisce **nella striscia blu della
  foto condivisa** (il marchio usa `currentLabel`): una foto di settembre 2025 che gira nei gruppi sembra di quest'anno.
- **Cosa costerebbe correggerlo:** una funzione sola al posto delle tre:
  ```js
  function dataBreve(dd){ var o={day:'2-digit',month:'short'};
    if(dd.getFullYear()!==new Date().getFullYear()) o.year='numeric';
    return dd.toLocaleDateString('it-IT',o); }
  ```
  4 righe più tre sostituzioni. Rischio: l'etichetta si allunga di 5 caratteri solo in quei casi; va guardata a 360 px
  e nella striscia della foto (che misura già lo spazio e la omette se non entra).
- **Raccomandazione: correggere quando si tocca `index.html`, ma prima di gennaio.**

## 9. `loadOpenMeteo` è codice morto che scrive 0 mm

- **C'è ancora?** Sì, `index.html` r. 5016-5145. Nessuna chiamata (cercato in tutto il file: c'è solo la definizione;
  l'altra occorrenza è `loadOpenMeteoStorico`, una funzione diversa). A r. 5037 `mm: results[s.n] || 0`.
- **Quanto succede / chi lo vede:** niente e nessuno.
- **Cosa costerebbe correggerlo:** cancellare le 130 righe. Rischio nullo (provare una regione e l'Abruzzo dopo).
- **Raccomandazione: correggere quando si tocca `index.html`.** È pulizia, ma toglie una trappola: chi la riusasse
  riporterebbe la giornata asciutta inventata.

## 10. `check-meteohub-gaps.js`: copertura parziale chiusa come completa

- **C'è ancora?** Sì. `.github/scripts/check-meteohub-gaps.js` r. 199-215: se Open-Meteo risponde solo per una parte
  delle mancanti, l'evento diventa comunque `coperto-openmeteo` e la riga 181 (`if (ev.stato !== 'aperto') continue`)
  non lo riguarda più.
- **Quanto succede davvero:** **mai.** Nel registro `data/meteohub-gaps.json` ci sono 48 eventi, 19 coperti; per
  nessuno le stazioni coperte sono meno di quelle mancanti (scarto > 2: zero casi).
- **Chi lo vede e cosa vede:** se capitasse, in mappa alcune stazioni del sud mancherebbero quel giorno (buco, non zero:
  il sesto check ha già tolto lo 0 mm inventato).
- **Cosa costerebbe correggerlo:** a r. 215 chiudere l'evento solo se `nuove.length === mancanti.length`, altrimenti
  segnare `ev.parziale = …` e lasciarlo aperto: il giro dopo ricalcola le mancanti dal file e chiede solo quelle. 2-3
  righe. Rischio: una stazione che Open-Meteo non ha mai (in mare) verrebbe richiesta ogni giorno per sempre.
- **Raccomandazione: lasciare così.** Mai successo, e il rimedio ha il suo difetto.

## 11. Pagine paese: «Il pluviometro (1399 m) e i paesi intorno»

- **C'è ancora?** Sì. `.github/scripts/genera-pagine-localita.js` r. 891.
- **Quanto succede davvero:**
  - **Punto delle migliaia:** 212 pagine su 908 hanno la quota sopra i 1.000 m. Ma **tutta la pagina** scrive la quota
    così (Anterselva di Sopra: «1327 m» nel testo, «1327 metri» nel ritratto e nella descrizione). La frase è coerente
    con la sua pagina; diversa è la mappa, che scrive «1.240 m slm».
  - **«~» mancante:** stessa cosa. Sulle pagine delle reti senza quota (MeteoHub, OSMER) la quota viene dal terreno ma
    nessun punto della pagina mette il «~» (Amandola: «476 metri» due volte e «476 m» nella frase).
  - **Frase che annuncia un pluviometro assente:** succede solo se MET non risponde per quel punto e risponde per gli
    altri; la Function in quel caso risponde 200 per 2 minuti. Raro.
- **Chi lo vede e cosa vede:** chi apre una pagina paese di montagna: «1327 m» invece di «1.327 m». Nel caso raro, la
  riga «Il pluviometro … e i paesi intorno» sopra una tabella dove il pluviometro non c'è.
- **Cosa costerebbe correggerlo:**
  - Frase senza pluviometro: in `meteoClient` (`lib-meteo-regione.js` r. 332) scrivere `OPZ.sopra` solo se
    `cc.some(function(c){return c.qui;})`, altrimenti «I paesi intorno». 1-2 righe, poi rigenerare le 908 pagine (che
    vanno online gratis col giro del mattino).
  - Punto e «~»: è una **scelta di tutta la pagina**, non della frase. Toccarla solo qui renderebbe la pagina
    incoerente. Servirebbe un `qt` nel `funghi-posti.json` (oggi non c'è) e la stessa formattazione in tutti i punti.
- **Raccomandazione:** la frase **quando si tocca `lib-meteo-regione.js`**; punto e «~» **lasciare così**, salvo
  decidere che le pagine paese diventino come la mappa (allora è un lavoro a sé).

## 12. Testata del telefono: aperta la lente e scritto qualcosa, non si chiude

- **C'è ancora?** Sì. `lib-meteo-regione.js` r. 272: il tocco fuori chiude solo se `!hinp.value`.
- **Quanto succede davvero:** non misurabile da qui. Le uscite però ci sono: la casella è `type="search"`, che sui
  telefoni ha la sua ✕ per svuotarla, e dopo un tocco fuori chiude. Scegliendo un posto si cambia pagina.
- **Chi lo vede e cosa vede:** chi scrive, ci ripensa e tocca fuori: logo e YouTube restano nascosti finché non svuota.
- **Cosa costerebbe correggerlo:** togliere `&& !hinp.value` (il testo resta nella casella, riaprendo la lente si
  ritrova) e chiudere anche la tendina `hdrop`. 1-2 righe, poi rigenerare le pagine. Rischio: chi tocca per sbaglio
  fuori mentre scrive vede sparire la casella.
- **Raccomandazione: lasciare così**, è una scelta di progetto. Se la si cambia, quando si tocca quel file.

## 13. Heatmap a fasce su Safari/iOS

- **C'è ancora?** Sì. `index.html` r. 3268-3276 (`drawGrid`): `heatCtx.drawImage(small, 0, r0, nx, r1-r0, …)`, una
  fascia alta al massimo 64 px alla volta, presa da un pezzo del canvas piccolo.
- **Quanto è probabile, dal codice e da come lavorano i motori:** **probabile.** Da qui non si può provare (nel
  contenitore c'è solo Chromium; installare WebKit è vietato).
  - Chrome (Skia) per `drawImage` con smussatura legge i pixel **anche oltre** il ritaglio: per questo da noi le
    giunture sono continue.
  - Safari disegna con Core Graphics, e per un ritaglio della sorgente WebKit crea una **sotto-immagine**
    (`CGImageCreateWithImageInRect` in `GraphicsContextCG::drawNativeImage`). Una sotto-immagine non ha niente oltre il
    bordo: la sfumatura si ferma lì e il pixel di bordo si ripete.
  - Effetto atteso: a ogni giuntura di fascia, al posto della sfumatura fra due righe di celle, un **gradino netto
    orizzontale** ogni ~64 px. Ad alto zoom (una riga di celle più alta di 64 px, quindi una fascia = una riga) la
    heatmap diventa **a strisce orizzontali piatte**, sfumata solo in orizzontale.
  - Chi lo vede: gli utenti iPhone e Safari, cioè una parte grossa dell'86% da telefono. Dal 20/10, su ogni analisi.
- **Cosa costerebbe correggerlo:** due strade, tutte e due provabili solo su un iPhone vero.
  - **La più economica (~8 righe):** prendere ogni fascia con **una riga in più sopra e sotto** e ritagliare il
    disegno ai bordi veri della fascia:
    ```js
    var s0=Math.max(r0-1,0), s1=Math.min(r1+1,ny);
    var y0=Math.round(yb[s0]), y1=Math.round(yb[s1]);
    heatCtx.save(); heatCtx.beginPath(); heatCtx.rect(pNW.x, dy, pSE.x-pNW.x, dh); heatCtx.clip();
    heatCtx.drawImage(small, 0, s0, nx, s1-s0, pNW.x, y0, pSE.x-pNW.x, y1-y0);
    heatCtx.restore();
    ```
    Il ritaglio si somma a quello sul confine (già attivo dentro il `save` esterno). Dentro una fascia allargata di una
    riga Mercatore resta lineare al decimo di pixel. Costo: un `save/clip/restore` per fascia, poche decine a schermo.
  - Più pulita ma più lunga (~15 righe): ricampionare il canvas piccolo in verticale già in Mercatore (una riga per
    ogni pixel-fascia a schermo) e tornare a **un solo** `drawImage` intero, come prima del 20/10. Nessuna differenza
    fra motori.
- **Raccomandazione: guardare subito su un iPhone** (`/?r=lombardia,puglia,sicilia&da=2026-10-01&a=2026-10-20`, zoom
  11-14). Se i gradini ci sono, **correggere ora** con la prima strada: è la cosa più visibile della lista.

---

## Visto per strada (non era nella lista)

**A. Ping-pong su Baunei (Sardegna, 19/10).** MeteoHub scrive per Baunei una minima di **−12,8 °C** (max 23,4): a ogni
giro (5 al giorno) la rimette, e il passo «temperature impossibili» dei riepiloghi la toglie (4-5 al giorno). Il file
`data/meteohub-sardegna/2026-10-19.json` è stato riscritto **21 volte in due giorni**, 9 dalle pulizie. Fra un giro e
l'altro la temperatura sbagliata sta nel file per qualche ora (grafico della stazione). Lo stesso giro tondo c'era su
Piemonte e Sicilia del 14/10 fino al quarto check (19/10). Durerà finché il 19/10 resta nella finestra di MeteoHub
(~28/10). È anche **la fonte principale dei conflitti del punto 3**. Rimedio, da decidere: applicare lo stesso filtro
dentro `collect-meteohub.js` prima di scrivere, così la temperatura impossibile non rientra.

**B. L'allarme fonti arriva di pomeriggio.** Il cron è alle 11:43 italiane, ma negli ultimi 14 giorni è partito fra le
15:34 e le 21:20 (13/10 alle 19:08, 12/10 alle 21:20). La sveglia di Cloudflare non lo lancia. Se si vuole la mail al
mattino, basta aggiungerlo alla tabella della sveglia (una riga).

---

## Riepilogo

| # | Punto | C'è ancora | Successo davvero | Raccomandazione |
|---|---|---|---|---|
| 1 | Piemonte > 300 mm: vince l'ufficiale in giorno UTC | sì | mai (0 su 441 file) | correggere quando si tocca il file |
| 2 | Id uguali in due cartelle sommati | sì | Bormio+Panocchia in memoria, mai stampato | lasciare così |
| 3 | Conflitti di contenuto fra giri sugli stessi file | sì | 1 in 4 giorni, causa già chiusa | lasciare; togliere il ping-pong (A) |
| 4 | Registro allarmi non salvato se la mail fallisce | sì | mai | correggere quando si tocca il file |
| 5 | Nessun tempo massimo su giri e richieste (anche Veneto, Alto Adige, SIR) | sì | mai; ma rischia chiusure toscane non recuperabili | **correggere ora** (Toscana prima) |
| 6 | Chiusure Toscana da Cloudflare senza `CLOSING` | sì | mai (partono entro 1 minuto) | lasciare; lo copre il 5 |
| 7 | 7 collector senza `permissions:`, anteprime senza `ref: main` | sì | mai | **correggere ora**, col 5 |
| 8 | Date senza anno nell'etichetta e nella foto | sì | non misurabile | correggere prima di gennaio |
| 9 | `loadOpenMeteo` morto, scrive 0 mm | sì | mai chiamato | cancellare quando si tocca index.html |
| 10 | Copertura Open-Meteo parziale chiusa come completa | sì | mai (0 su 19) | lasciare così |
| 11 | Frase «Il pluviometro (1399 m)»: punto, «~», riga assente | sì | 212 pagine sopra 1.000 m, coerenti col resto | frase quando si tocca; formato lasciare |
| 12 | Testata telefono resta in ricerca | sì | non misurabile | lasciare così (scelta) |
| 13 | Heatmap a fasce su Safari: possibili gradini | sì | da provare su iPhone | **guardare subito**; se c'è, correggere ora |
