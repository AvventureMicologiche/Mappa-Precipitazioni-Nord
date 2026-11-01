# CLAUDE-prod-e-test.md: prod e test, migrazioni e promozioni

Pezzo del `CLAUDE.md` del repo, diviso per argomento il 1/11/2026 (scheda 107, sua scelta). **Prima si legge il
`CLAUDE.md`**: le regole che valgono sempre e l'indice di tutti i file. Qui sotto le sezioni sono quelle di prima,
tali e quali e nello stesso ordine: quando una nota dice «più su», «qui sotto» o «in fondo al CLAUDE.md», la sezione
può stare in un altro file, e il titolo si trova nell'indice del `CLAUDE.md`.

Per arrivare a una sezione: `grep -n "^## \|^### " CLAUDE-prod-e-test.md`, poi si legge da quella riga.
**Le note nuove di questo argomento vanno IN FONDO a questo file**, con una riga nell'indice del `CLAUDE.md`.

Sezioni:

- Migrazione Italia v5.0 (1 agosto 2026)
- Promozione a non-BETA
- Promozione del 27 agosto 2026 (v9.1)
  - 1. «La mia posizione», SOLO da telefono
  - 2. La quota: `testoQuota()`
  - 3. Tetto dei pallini 150 → 400
  - 4. «S.» vale San, Sant', Santo, Santa
  - Attrezzi di collaudo nati qui (cartella claudio)
- ⚠️ TEST E PROD NON SONO PIÙ «PROD + QUATTRO RIGHE» (31 agosto 2026)

---

## Migrazione Italia v5.0 (1 agosto 2026)
Portata in produzione dal repo di test seguendo `MIGRAZIONE-v5.md` (che resta lì):
**22 regioni** — le 11 del Nord invariate, **10 nuove via MeteoHub** (Marche, Umbria,
Lazio, Molise, Campania, Puglia, Basilicata, Calabria, Sicilia, Sardegna) e
l'**Abruzzo** in Open-Meteo live. Multiregione max 3, tasto 📷 Screen, tendina
mobile con fallback centro/zoom per il centro-sud.
- **Centro-Sud dichiarato "in fase di test"**: badge `(beta)` sulle 10 regioni
  MeteoHub nella tendina mobile + pillola gialla `#beta-note` sopra la chip fonte
  (compare solo con una regione `dataSource:'meteohub'` attiva; gestita in
  `renderMulti` e nel reset). L'Abruzzo NON è beta: è dichiarato come stime.
- **Giorni di dati reali alla migrazione** (file `source: meteohub-dpcn`):
  Marche/Umbria dal 13/7 (16-17/7 stimati), le altre 8 dal 19/7; Puglia col
  27/7 interamente stimato. Prima: backfill Open-Meteo dal 14-20/5.
- **Uscita dal beta, piano**: dall'**11/8** la finestra Piogge per funghi
  (16-23 gg) è tutta reale anche al sud; ~12-14/8 Marche/Umbria raggiungono i
  30 giorni reali, ~18/8 le altre; la **Puglia esce per ultima e comunque dopo
  il bollettino pluviometrico regionale di luglio** (il giudice su MeteoHub —
  vedi PILOTA nel CLAUDE.md del test).
- I cron MeteoHub del repo di test sono spenti (commentati, stile ticino.yml).

---

## Promozione a non-BETA
**Completata il 18 luglio 2026**: header da "(BETA V3.0)" a "(v4.0)", su decisione dell'utente, anticipando il target originale dell'11 agosto 2026 (30 giorni di dati corretti per tutte le regioni; il vincolo più recente era lo switch Toscana a SIR del 12 luglio 2026).

---

## Promozione del 27 agosto 2026 (v9.1)

Tutto il lavoro del 26/8, portato in produzione in un solo deploy. ⚠️ Il file
NON e' stato copiato alla cieca: prima si e' misurato il diff prod↔test (682
righe), classificata ogni riga, e verificato che le uniche davvero solo-prod
fossero le due `og:image`/`twitter:image` — rimesse a mano. Conteggio delle
chiavi prod-only prima e dopo: EMILIA_ESCLUSE 5, HIST_RAW_BY_REGION 2,
analisi_regione 1, getSelectedValues 4, LOMB/TOSCANA/LIGURIA/PIEMONTE/MH_ESCLUSE
e PILOT_DATA_BASE invariati. Nessuno calato.

### 1. «La mia posizione», SOLO da telefono
Blocco NOVITA' dentro la tendina: bottone + casella. ⚠️ Sul PC non c'e', e la
regola e' `(hover:hover) and (pointer:fine)` — **non la larghezza**: un computer
con la finestra stretta scende sotto i 901 px, prende le regole del telefono e
si riprenderebbe il tasto, mentre il GPS non ce l'ha lo stesso.
- **Due tentativi in PARALLELO** (watchPosition col GPS + getCurrentPosition di
  rete): il ripiego partiva solo dopo un errore, ma su Chrome Android il
  watch a volte non richiama NESSUNO dei due callback e l'errore non arrivava
  mai. Era una porta di sicurezza chiusa dall'interno.
- **`coords.accuracy` si guarda**: sotto 3 km si parte subito, fra 3 e 20 km si
  aspettano 2 s, sopra 8 s e poi si rinuncia dicendolo. E' il caso Caserta: al
  computer la posizione arriva dall'indirizzo internet e sbaglia di 600 km.
- Attesa spiegata a gradini (3 s e 10 s), rotella nel dischetto, riclic =
  `maximumAge:0`, spia `?geodebug=1` con codici e tempi.
- ⚠️ **PRIVACY**: col GPS il punto non viaggia col link e il centro mappa si
  arrotonda a 2 decimali (~1 km). La ricerca scritta resta intatta.

### 2. La quota: `testoQuota()`
«—» se ignota, «~ 1.240 m slm» se viene dal modello del terreno (`qt`), il
numero secco se la dichiara l'ente. ⚠️ Zero NON e' ignoto (Grado, Chioggia,
Viareggio...). Vedi la scheda «La quota delle stazioni» piu' sopra.

### 3. Tetto dei pallini 150 → 400
⚠️ Trovato perche' l'utente cercava **Santo Stefano d'Aveto e non la vedeva**.
Il dato c'era in tutti i 384 file: era il diradamento dei pallini del 20-21/8,
che sulla Liguria (arco stretto, 4 stazioni per casella) ne disegnava **111 su
197**. Nascondeva il 44% della Liguria, il 56% della Toscana, il 40% della
Lombardia, il 37% del Piemonte: proprio le reti a cui avevamo tolto le
whitelist per mostrarle intere. Il DATO non si perdeva (colore, massimo, media
e classifica si calcolano su TUTTE), ma senza pallino non c'e' tooltip ne'
grafico. A 400 restano diradate solo la Sicilia (431 su un'isola compatta, il
caso per cui il diradamento era nato) e le reti estere fitte: **1.071 pallini
restituiti**, Liguria da 111 a 195.

### 4. «S.» vale San, Sant', Santo, Santa
In produzione «s. stefano d'aveto», «s margherita lig», «s. angelo» davano
**zero righe**. Nell'elenco il santo e' sempre per esteso (494 comuni su 8.610,
nessuno abbreviato), quindi non si tocca l'elenco: `locVarianti()` allarga la
DOMANDA. Il punto diventa punteggiatura come l'apostrofo. ⚠️ Si allarga solo
con l'abbreviazione, e il grassetto segue la variante trovata.

### Attrezzi di collaudo nati qui (cartella claudio)
`prova-geo.js` (nove casi di GPS simulato, compreso `mutosolo` = watch muto),
`prova-geo-tempi.js`, `prova-attesa.js`, `prova-riclic.js`,
`prova-tasto-mouse.js` (⚠️ hover/pointer si emulano col protocollo di Chrome,
`emulateMediaFeatures` non li conosce), `prova-telefono-css.js` (⚠️ **dopo
aver toccato la struttura del CSS si riprova a TUTTE le larghezze**: il 26/8 una
parentesi rimasta indietro ha spento tutte le regole del telefono senza un solo
errore in console), `prova-ricerca-santo.js`, `verifica-aveto.js`,
`verifica-diradamento.js`, `prova-quota-tooltip.js`.
---

## ⚠️ TEST E PROD NON SONO PIÙ «PROD + QUATTRO RIGHE» (31 agosto 2026)

La regola scritta al 17/8 («prod è la base, il test = prod + quattro righe»)
**non vale più**, e crederci fa danni. Il 31/8, andando a portare il radar in
produzione, la differenza fra i due `index.html` era di **323 righe presenti
solo in prod**, e dentro c'era codice vero: tutto il lavoro dei **pallini di
partenza reali** (`loadStazioniPallini`, `PALLINI_CARTELLE`, `_pallEscluso`,
Lombardia spostata su `data/lombardia`), fatto in prod la mattina stessa e mai
portato sul test.

**Copiare l'index del test sopra quello di produzione avrebbe cancellato tutto
quel lavoro**, in silenzio e senza un errore.

**Come si fa invece**: si portano i pezzi uno per uno con uno script che
sostituisce stringhe esatte e **conta le occorrenze prima di sostituire**
(se non ne trova esattamente una, si ferma). Lo script del 31/8 sta in
`scratchpad/porta-in-prod.js`. E prima di scrivere si controlla che il numero
di riferimenti a `Nord-Test` non sia cambiato: ce n'è **uno legittimo** già in
prod (la mappa nome-repo → sito), quindi il controllo è sul CONTEGGIO, non
sulla presenza.

---

