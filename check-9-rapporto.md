# Check 9, notte del 1-2/11/2026 (sola lettura)

**In breve.** Ho letto i 17 commit della mappa (da `291b8b5c` a `66977c65`, nessun commit di codice arrivato dopo) e ho fatto il check dei dati dal 27/10 al 1/11. Sulla mappa non ho trovato difetti gravi: niente errori di variabili non definite, niente osservatori che si rimbalzano all'infinito, e il calcolo veloce dei colori è identico al vecchio (l'ho ricontrollato riga per riga). I difetti nuovi sono 0 di gravità alta, 3 media e 8 bassa. I tre da correggere per primi:
1. **Puglia dal 26 al 29/10 tutta Open-Meteo**, cioè stime oltre la frontiera del dato reale (B1).
2. **Biasca Val Pontirone, 84,4 mm falsi il 27/10**: per un mese sarà una macchia sulla mappa del Ticino (B2).
3. **Telefono girato, link `?r=` aperto per primo**: l'inquadratura accanto alla colonna può partire prima che esista. È un'ipotesi da provare nel browser (A1).

Tutto il resto è cosmetico o capita di rado. Non ho corretto niente. `main` e `data/` non sono stati toccati.

---

## Difetti di gravità media

### B1. Puglia 26-29/10: quattro giornate intere di stime Open-Meteo dopo la frontiera (dati)
- **Dove**: `data/meteohub-puglia/2026-10-26.json`, `-27`, `-28`, `-29`: `source: "open-meteo-gapfill"`, 131 stazioni su 131 con `om:true`. Il `2026-10-30.json` ha 60 stazioni reali e 71 stimate; il 31/10 è di nuovo tutto reale (130).
- **Cosa succede**: la frontiera del centro-sud è il 19 luglio (regola 1), quindi per regola qui non ci devono essere stime. Il buco è già registrato in `data/meteohub-gaps.json`: per il 26-29/10 «mancante, 0/127, coperto-openmeteo», per il 30/10 «parziale». Sui periodi di più giorni la mappa somma le stime (le toglie solo sul giorno singolo) e lo dichiara con l'avviso delle stime. Il 30-31/10 in Puglia ha piovuto davvero (Lesina 66,9 mm, Poggio Imperiale 60,2): la coda del 30/10 per metà stimata pesa.
- **Come si vede**: `/?r=puglia`, «7 giorni» o «10 giorni».
- **Sicurezza**: verificato sui file.
- **Correzione proposta**: chiedere a MeteoHub se la Puglia di quei giorni è arrivata dopo (ultimo giro del 1/11: Basilicata 26/10 riscritta, Puglia no). Se non arriva, rifare come a luglio col Bollettino Pluviometrico mensile della Regione Puglia (c'è l'evento del 27/7 in `meteohub-gaps.json`) quando esce quello di ottobre.

### B2. Ticino, Biasca Val Pontirone: 84,4 mm il 27/10, falso (dati)
- **Dove**: `data/ticino/2026-10-27.json`, stazione `meteo_u_122` (1405 m).
- **Cosa succede**: è l'unica stazione bagnata di tutto il Ticino quel giorno. Tutti i vicini segnano 0: Biasca (7,4 km), Bodio-Tenciarolo (8,8), Moleno (12,0), Acquarossa e S. Bernardino di MeteoSvizzera (12,3 e 13,9). I giorni attorno valgono 0,1 · 0 · 0,1 · **84,4** · 0,1 · 0. Il valore è uguale in tutti e sei i giri, dal 28/10 al 29/10. Per un mese la stazione entra in «7/10/15/20/30 giorni» e in tutti i periodi personalizzati che la contengono: una macchia gialla su una valle asciutta, e il «massimo» del Ticino.
- **Come si vede**: `/?r=ticino` (o `svizzera`), «7 giorni», zona di Biasca.
- **Sicurezza**: il dato è verificato sui file. La causa è un'ipotesi: il 27/10 alle 07:46 è entrato il commit `ad9a04707` («Ticino: richieste a periodi…»), da guardare per primo; può anche essere un sensore che scarica di colpo l'accumulato o un errore di OASI.
- **Correzione proposta**: confrontare con OASI in diretta. Se il valore è falso, toglierlo dal file (con il suo sì, è `data/`). Valutare se il collector OASI debba scartare un dato giornaliero con un salto così isolato (regola 10: solo se è semplice).

### A1. Telefono girato, link con la regione aperto per primo: l'inquadratura vecchia (ipotesi da provare)
- **Dove**: `index.html:5187` (`centraRegioneInStriscia`, commit `809ea326`) chiama `window._centraGirato`, che nasce solo a `index.html:19619` nell'ultimo `<script>` della pagina. Lo stesso vale per `window._girato` (19605), che la barra delle città guarda in `serve()`/`sistema()`.
- **Cosa succede**: il commento in `render()` (index.html:6090-6093, `291b8b5c`) dice che «coi link la prima analisi arriva PRIMA che il browser legga il modulo in fondo alla pagina». Per la barra se n'è tenuto conto (`window._pioggiaPer.classifica`), per l'inquadratura del telefono girato no. Se la prima inquadratura avviene prima che l'ultimo script sia letto, `centraRegioneInStriscia` fa il suo lavoro vecchio. Cioè centra la regione nella striscia fra la fila delle regioni e il riquadro, che col telefono girato è quasi nulla: è proprio il difetto che la scheda 106 ha corretto («la regione persa in mezzo all'Europa»).
- **Come si riproduce**: telefono finto 740×340 in orizzontale, `/?r=liguria` (meglio `&da=...&a=...`) aperto da zero, senza cache, con la rete rallentata (4G). Guardare se la Liguria parte inquadrata accanto alla colonna o piccola in mezzo.
- **Sicurezza**: l'ordine di definizione è verificato sul codice. Che la prima inquadratura arrivi davvero prima dipende dalla rete: va provato nel browser.
- **Correzione proposta**: spostare `window._girato` e `window._centraGirato` (sono funzioni pure, senza stato) nello script principale accanto a `window._pioggiaPer`. Oppure, a fine modulo, rifare una volta `centraRegioneInStriscia()` se `girato()` e c'è già un'analisi.

---

## Difetti di gravità bassa

### A2. Telefono girato: il riquadro della pioggia ha angoli, ombra e margine sbagliati
- **Dove**: il blocco «LA PIOGGIA AL TELEFONO GIRATO» (`index.html:19583-19586`, `809ea326`) scrive `#legend-panel{... border-radius:0 14px 0 0 !important; ... box-shadow:4px 0 14px ... !important}` con specificità (1,0,0). Perde contro `html:root #legend-panel{border-radius:12px !important; box-shadow:0 2px 10px ... !important}` (`index.html:19095`, `291b8b5c`, specificità 1,1,1). E il `padding:10px 12px !important` perde il lato alto contro `html:root body:not(.modo-prev) #legend-panel{padding-top:12px !important}` (`c195177c`).
- **Cosa succede**: la colonna del riquadro (pioggia, radar, boschi) col telefono girato ha 12 px di angolo anche in basso a sinistra e in alto a sinistra, dove tocca i bordi dello schermo: restano due spicchi di mappa. L'ombra è quella generica e non quella laterale voluta, e sopra ci sono 2 px in più. Per `#time-panel` invece il blocco girato vince, perché a pari specificità viene dopo: periodi e riquadro hanno angoli diversi.
- **Come si riproduce**: telefono 740×340 in orizzontale, `/?r=lombardia`, «7 giorni»: confrontare gli angoli della colonna dei periodi con quelli del riquadro.
- **Sicurezza**: verificato sul codice (specificità e ordine). L'effetto a schermo va guardato.
- **Correzione proposta**: nel blocco girato, scrivere il selettore come `html:root body #legend-panel` (o `html:root body:not(.modo-prev) #legend-panel`) per angoli, ombra e padding.

### A3. Barra delle città: il tocco non apre la scheda se il pluviometro è fra quelli diradati
- **Dove**: `apri()` in `index.html:19430-19438` (`291b8b5c`): `P().pallino(s)` cerca il pallino fra `activeMarkers`, che però contiene solo i pallini disegnati. Le reti fitte (`_cap`: MeteoHub, Svizzera, Austria, Slovenia, Friuli, VdA, Francia) sono diradate a 400 per regione (`index.html:6089`).
- **Cosa succede**: la barra sceglie il pluviometro più vicino al capoluogo nella classifica INTERA (giusto). Se quello è stato diradato, il tocco sposta la mappa e basta: nessuna scheda, contro quanto dice il commento («come toccare il suo pallino»). Succede soprattutto in Sicilia (oltre 400 stazioni) e nelle reti estere.
- **Come si riproduce**: `/?r=sicilia` o `/?r=austria`, «7 giorni», toccare le città della barra una per una.
- **Sicurezza**: verificato sul codice. Per quali città capiti in pratica va visto nel browser.
- **Correzione proposta**: se `pallino(s)` è null, aprire la scheda direttamente (`openStationHistory(s, rank, x, y)`, da esporre in `_pioggiaPer` come `apri`).

### A4. Il disegno «telefono girato» può scattare al telefono dritto con la tastiera aperta (ipotesi)
- **Dove**: la condizione `(max-width:900px) and (max-height:500px) and (orientation:landscape)`, in CSS a `index.html:19571` e in JS `_girato()` a `19604` (`809ea326`). È la stessa del meteo girato del 30/10.
- **Cosa succede**: l'orientamento CSS dipende dalle misure della finestra, non dal telefono. Sui browser che rimpiccioliscono la finestra quando si apre la tastiera (Firefox per Android, Chrome con certe impostazioni; Chrome dal 108 di solito no), scrivendo nella ricerca a 393 px la finestra diventa per esempio 393×300. Allora è «landscape» e sotto i 500 px di altezza: entra la colonna di 330 px su uno schermo di 393, la fila delle regioni cambia e la mappa si reinquadra mentre si scrive. Col meteo c'era già dal 30/10; ora vale anche per la pioggia.
- **Come si riproduce**: Chrome per PC in modalità telefono 393×852, poi ridurre l'altezza a 300 con la casella di ricerca a fuoco; meglio su un Android con Firefox.
- **Sicurezza**: ipotesi, da provare.
- **Correzione proposta**: in `_girato()` aggiungere `screen.width>screen.height` (o `screen.orientation.type` landscape), come fa già lo script «I TELEFONI GRANDI GIRATI» in testa. Per il CSS, una classe `girato` messa dal JS al posto della sola media query.

### A5. Previsioni: se non arrivano né la foto nostra né Esri, il fondo resta grigio
- **Dove**: `osmSeServe()` (`index.html:2979-2995`, `f97d45a3`) toglie la cartina OSM in `modo-prev`.
- **Cosa succede**: nelle previsioni il ripiego della foto nostra è Esri a ogni zoom (`viFondo`, `index.html:18207-18208`). Prima, se mancavano tutte e due, sotto restava la cartina OSM; ora c'è il grigio `#3e526b` con le sole icone. Succede solo con jsDelivr fermo e insieme il tetto mensile di Esri finito (la nota della 106 bis lo considera accettato: «col suo ripiego su Esri»).
- **Sicurezza**: verificato sul codice; caso raro.
- **Correzione proposta**: se si vuole, nel ripiego di `nostraL` contare anche gli errori di Esri e, se falliscono tutti e due, togliere `modo-prev` dalla condizione di `osmSeServe` (una spia `window._prevSenzaFoto`).

### A6. Uscendo da boschi e satellite insieme, la cartina OSM entra e riesce subito
- **Dove**: `spegni()` del satellite dei boschi (`index.html:16184-16190`) chiama `osmTorna()`, che rimette la cartina subito. Un attimo dopo l'osservatore della foto (`giusta()`, poi `osmSeServe()`) la toglie di nuovo, perché la pioggia ha la foto. Ci sono due padroni della stessa cartina (il secondo è di `f97d45a3`).
- **Cosa succede**: le richieste delle tessere OSM partono e si annullano (una manciata per giro). Non si vede, perché la regola `body.foto-on #map .osm-base{visibility:hidden}` la copre. È il residuo del noto «OSM nascosta ma scaricata comunque».
- **Sicurezza**: verificato sul codice.
- **Correzione proposta**: in `osmTorna()` chiamare `osmSeServe()` (da esporre) invece di `bt.addTo(mp)`.

### B3. Veneto, Castana: 29,8 mm il 30/10 con tutti i vicini a zero (dati, sospetto)
- `data/veneto/2026-10-30.json`, id `68`. Da sola fa 29,8 dei 32 mm del Veneto quel giorno. Vicini a 0: Brustolè (3,1 km), Molini (4,5), Tonezza (6,1), Contrà Doppio (6,5), Valli del Pasubio (9,8). Nei giri della giornata è cresciuta 0 → 20 → 29,8; il 31/10 torna a 0. Sembra manutenzione o un guasto, non pioggia. Ipotesi: da confrontare con ARPAV in diretta.

### B4. MeteoHub: stazioni mancanti in Basilicata e Campania (dati)
- Basilicata 26-29/10: 50 stazioni contro una mediana di 61 (−18%). Mancano sempre le stesse 12 del Vulture-Melfese (Lagopesole, Melfi, M.te Vulture, Venosa, Forenza, San Fele, Monticchio Bagni…); il 30/10 ne tornano 10.
- Campania 29/10: 148 stazioni contro 176 (−16%), soprattutto nel Salernitano e in Costiera. Campania 26-28/10: 169-170 (−4%, Irpinia).
- Sono già registrate in `meteohub-gaps.json` come «aperto, lieve». Verificato. Da riguardare dopo i prossimi giri di MeteoHub.

### B5. Slovenia 30/10: 109 stazioni invece di 114 (dati)
- Mancano Podčetrtek, Sevno, Planina pod Golico, Trojane-Limovce e Vodice. Il 30/10 è l'ultimo giorno per costruzione (ARSO arriva a due giorni prima e ogni giro rifà gli ultimi otto): probabilmente si sistema da solo.

---

## Note minori (non difetti)
- **Commento sbagliato**: `FOTO_LIMITI` (`index.html:3024`) dice «Islanda e Canarie comprese», ma il limite sud a 34° esclude le Canarie (27-29° N). Non cambia niente.
- **Esri «da vicino» nella pioggia creato tardi**: `esri()` restituisce null finché non esiste `window._esriChiave`, che nasce nel modulo dei boschi più in fondo; il `setTimeout(…,0)` di `avvia()` (`index.html:3143`) può scattare prima che quello script sia letto. Si sistema da solo al primo cambio di classe del body, che all'apertura c'è sempre. Nessun effetto visto.
- **Lombardia**: alle 19:00 UTC del 1/11 l'ultimo commit dei dati è delle 11:33 UTC. Negli altri giorni il giro della sera era caduto fra le 17:22 e le 18:38 UTC (lo fa partire anche il lanciatore esterno, oltre ai due cron delle 04:40 e 12:40). Forse è solo in ritardo; da ricontrollare domattina.

## Cose controllate e trovate a posto
- **Calcolo veloce dei colori** (`a29eab60`): `incrociRiga`/`dentroRiga` danno esattamente la parità di `pipGeo` (stessa formula, stessa disuguaglianza stretta). La fascia di latitudine scarta solo stazioni che l'IDW scartava comunque, nello stesso ordine; il coseno precalcolato è lo stesso numero.
- **Osservatori**: `giusta()` cambia `foto-on` e si richiama una volta senza effetto. `sistema()`, il modulo dei crediti, `sotto()` del tablet e `cima()` del telefono girato scrivono stili che nessun altro osserva in modo da tornare indietro. Nessun giro infinito.
- **Ascoltatori**: quelli sulla scheda del meteo (`touchstart/end`) si aggiungono una volta sola (creazione di `#pv-det`). Quelli della striscia delle ore stanno su un nodo che si ricrea a ogni disegno.
- **Zoom**: `map.maxZoom` 19. La foto nostra arriva al 19 (ingrandita dal 10), Esri nella pioggia dall'11 al 19 (512 px, offset −1), Esri delle previsioni ora fino al 19 (`c4b7010c`), OSM al 19. `zoomMinimo()` è globale e vale in tutte le funzioni: con le misure di finestra fino a 3840 px resta sotto le inquadrature di Italia e regioni. Al 4K il minimo sale a ~6,5, sopra lo zoom iniziale da PC (6,25): Leaflet lo alza da solo, senza danni.
- **Classi `apre-*`** (`66977c65`): `html.apre-italia body.foto-on #map` vince su `body.foto-on #map` per specificità, non per ordine. `apre-prev` si toglie a `entra()` e comunque dopo 20 s.
- **Barra delle città**: `/data/capoluoghi.json` è pubblicato (pubblica-pages copia tutto `data/` tranne i file-giorno vecchi) e ha le chiavi delle regioni; date sotto i periodi coerenti col clic (fine inclusa).
- **Pagine** (`25d085df`, `338f5937`, `9ca913d4`): il JavaScript nuovo che gira nelle pagine (`lib-striscia.js`) è ES5 (`var`, `function`), e il ripiego alla cartina di ieri se manca quella dei 7 giorni c'è.
- **Dati**: nessun valore sopra 150 mm dal 27/10 al 1/11. Il massimo vero è Lesina 66,9 mm il 31/10; due picchi isolati in Sicilia il 30/10 (Nunziata 24,4, Buturro 24,9) sono plausibili, temporali di una cella.
- **File identici al giorno prima** (solo stazioni bagnate, giorni con almeno 20 mm): sopra il 30% solo Francia NAQ, Occitania e Provenza, ma i valori uguali sono 0,2 mm (uno scatto del pluviometro) in giornate quasi asciutte, e i totali cambiano. Nessun file trascinato.
- **Giri dei collector**: nessuno fermo; le pause di 14-16 ore si ripetono uguali ogni giorno (sono gli orari dei giri).
- **`check-confini.js`**: è in sola lettura e gira senza rete, 8 confini su 8. Due avvisi: emilia-piemonte, +6,75 mm su sole 7 coppie (gemelle di cresta genovesi contro stazioni piemontesi sottovento, l'8/10 pesa +33 mm), e slovenia-austria, +1,69 mm (Caravanche, segno che cambia da un giorno all'altro). In tutti e due l'ipotesi è il rilievo, non una formula sbagliata. Gemelle Emilia/Liguria uguali al decimale dal 27 al 31/10.
- **Già noti, ritrovati senza approfondire**: Piemonte senza `source` (ripiego MeteoHub); Abruzzo `meteonetwork+icon-2i` senza stazioni `om` (la prova).

## Cosa non ho controllato, e perché
- **Niente browser**: tutto è lettura del codice e dei file. Le parti visive (lampi, misure in pixel, telefono vero che gira, `ctx.filter` nello scatto su Safari) restano alla sessione locale di stanotte. A1, A2 e A4 vanno provate lì.
- **Fonti in diretta** (OASI per Biasca, ARPAV per Castana, MeteoHub per la Puglia): non le ho interrogate.
- **Il 1/11** è escluso dai confronti perché è il giorno in corso: c'è solo per Alto Adige, Toscana, Piemonte e Veneto, senza valori anomali.
- **Non ho letto riga per riga** le parti del 31/10-1/11 che toccano solo l'aspetto (spazi in px dei tasti, forme, colori): ho controllato solo che i selettori non si pestino fra loro.
- **Gli script dei dati** del check stanno nello scratchpad di questa sessione (`dati/check.py`, `isolati.py`, `near.py`, `gaps.py`), che non sopravvive alla sessione; i numeri sono riportati qui sopra.
