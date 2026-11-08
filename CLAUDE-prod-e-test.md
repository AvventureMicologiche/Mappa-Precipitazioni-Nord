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

## I commenti fuori dalla copia pubblicata: la mappa da 431 a 191 KB (8/11/2026, scheda 127 ter, dall'analisi notturna)

**Perché.** Punto 1 dell'analisi notturna della 127 bis (`D:\video youtube\claudio\analisi-127bis\ELENCO-PROBLEMI-E-SOLUZIONI.md`).
`index.html` (che è anche `/previsioni/`, tramite la Function) pesa 1,34 MB e arrivava compresso in **431 KB**, ogni
volta: Pages manda l'HTML con `max-age=0, must-revalidate` e **senza ETag né Last-Modified**, quindi il browser non può
chiedere «è cambiata?» e la riscarica intera anche a chi torna. Dentro, 585 KB erano commenti del codice.

**Cosa fa adesso `pubblica-pages.js`.** In `copiaFile()` ogni `.html` passa da `senzaCommenti()` di
`lib-senza-commenti.js` (la stessa delle pagine generate, scheda 112 quater, e del controllo «lo script si legge ancora»,
scheda 114) invece di essere copiato tale e quale. **Il repo non cambia**: i generatori continuano a leggere le pagine
modello coi loro commenti, solo la copia che va online ne è senza. Restano i commenti HTML (segnaposto come
PAGINE:INIZIO), le licenze `/*!`, il JSON-LD e gli script che la libreria non sa leggere (apice inverso).
- **Robusto per il giro del mattino** (`pagine-regione.yml` usa lo stesso script): se il modulo non si carica, tutto
  esce coi commenti come prima; pagina per pagina, se il file non è UTF-8 pulito, se contiene una «İ» (U+0130: in
  `toLowerCase()` diventa più lunga e le posizioni dei `</script>` slitterebbero), se `senzaCommenti` dà errore, o se la
  copia viene vuota, più lunga o senza `</html>`, **quella pagina si copia com'è** con un avviso nel log e si va avanti.
  Mai una pubblicazione fermata per i commenti.
- Nel log una riga in più: `senza commenti: 46 pagine ripulite (7.06 → 5.37 MB, -24%), 1485 gia' senza, 0 copiate
  com'erano per prudenza`. Se il numero delle ripulite cresce di molto, un generatore ha smesso di togliere i commenti.

**Le 46 pagine che cambiano** (le altre 1.485 erano già senza): la mappa, le 22 regioni (Austria e Svizzera comprese),
le 20 funghi regione, la zona funghi della Garfagnana, `/guida/` e `fonti.html`. L'indice `/funghi/` era già pulito.

**Pesi serviti da Cloudflare, prima (sito vero) e dopo (anteprima `prova-127ter`), brotli:**

| pagina | prima | dopo |
|---|---|---|
| `/` e `/previsioni/` | 431 KB | **191 KB (-56%)** |
| `/toscana/` (regione) | 37,2 KB | 27,9 KB (-25%) |
| `/funghi/toscana/` | 51,6 KB | 38,5 KB (-25%) |
| `/guida/` | 25,6 KB | 24,1 KB |

**Al telefono** (4G lento 1,6 Mbit/s e processore ×4, `velocita.js` della 127 bis, sito vero contro anteprima, alle
8:57 dell'8/11): la pagina della mappa arriva **in 1,2-1,9 s invece di 2,6-3,2** (`/`: prima visita 3,2 e 2,6 s → 1,9 e
1,5; chi torna 2,6 → 1,2), `/previsioni/` in 1,3-1,5 s invece di 2,3-2,7. Il JavaScript in linea da leggere scende da
984 a 503 KB, il CSS da 228 a 134. Gli altri tempi (LCP, mappa pronta) dipendono anche da dati e previsioni e ballano
da un giro all'altro: il guadagno sicuro è quello della pagina, circa **1,2 s a ogni apertura**. Sulle regioni e sulle
funghi regione, piccole, al telefono non si vede differenza.

**Quanto costa al giro di pubblicazione: ~1,3 s.** Le 1.531 pagine sono 150 MB e `senzaCommenti` le scorre carattere
per carattere: tutte insieme 17 s al PC, per togliere commenti solo da 46. Un filtro le salta prima (`FORSE_COMMENTI`:
niente `/*` e nessun `//` fuori da un indirizzo vuol dire niente commenti): l'8/11 salta esattamente le 1.485 già pulite,
nessuna con commenti. Se un giorno sbagliasse, quella pagina esce coi commenti, come prima.

**Prove.** (1) La mappa del repo e la copia uscita dallo script aperte **a coppie, nello stesso momento** (stessa rete,
stesso carico del PC), 10 scene × PC e telefono: stato della mappa identico in 18 su 20, le altre 2 diverse solo di
posizione (scene del telefono che non si fermano in 30 s, con l'una e con l'altra); **stessi nomi globali in tutte e
20** (se uno script si rompe, i suoi nomi mancano), nessun errore. ⚠️ Fatte una dopo l'altra (prima la vera, poi la
copia) con 4 pagine insieme, stamattina col PC carico le stesse scene uscivano diverse per tempi, non per la copia: le
prove di confronto si fanno a coppie. (2) L'anteprima contro il sito vero, 14 pagine × PC e telefono (mappa,
previsioni, regioni, funghi regione, Garfagnana, guida, fonti, meteo, paese): nessun errore di pagina né in console,
stessi nomi globali, stesso testo (a parte il minuto di «agg.» e la scheda della vetrina, estratta a sorte). (3) La
Function di `/previsioni/` sull'HTML senza commenti: titolo, descrizione, canonico, scritta grande e rimando 301 giusti.
(4) Le strade di ripiego su un repo finto: «İ» e byte non UTF-8 copiati identici, senza la libreria accanto tutto coi
commenti e la pubblicazione va avanti. (5) Con lo script finale (filtro compreso) le pagine escono identiche byte per
byte a quelle dell'anteprima provata.

**⚠️ Da sapere dopo questo cambio.**
- Online le 46 pagine **non sono più uguali al repo byte per byte**. Un controllo «online = repo» (come
  `pagine-giro.js` della 127 bis) confronta con `senzaCommenti(<file del repo>)`, non col file.
- Chi cerca un commento guardando il sorgente della pagina online non lo trova: i commenti si leggono nel repo.
- Per vedere che cosa va online davvero: `--solo-cartella` e si guarda `_pages/`.
- Attrezzi nel banco, `analisi-127bis\attrezzi\`: `ab-senza-commenti.js <index A> <index B>` (prova a coppie),
  `controllo-anteprima.js [nome anteprima]` (anteprima contro sito vero), `pesi-senza-commenti.js <repo>` (pesi di
  `_pages/` contro il repo, dopo `--solo-cartella`).

**IN PRODUZIONE l'8/11/2026 alle 11:08** (suo «Sì, tutt'e due» e «Sì, insieme»): commit `84fcf77af0`, deploy Cloudflare
**`7714b10b`**, pubblicato dal checkout condiviso su `732dec6ec4` (dentro anche i punti 2, 3, 5, 6 della 127 bis, già
online dalle 11:05 col deploy `616a2d3c` ma coi commenti, perché partito prima del push). Online `/` = **192 KB** br (era
434), `/previsioni/` 193, `/toscana/` 27,9, `/funghi/toscana/` 38,8; il `/` online è identico byte per byte a
`senzaCommenti(index.html del repo)`. Function `/previsioni/`: titolo, canonico e 301 giusti. `controllo-anteprima.js
7714b10b` (sito vero contro lo stesso deploy, 14 pagine × PC e telefono): nessun errore di pagina né in console, stessi
nomi globali in 28 su 28.
- ⚠️ **Quel giorno dal checkout condiviso il log diceva 71 pagine ripulite, non 46**: le 25 in più erano di `_mockup/`,
  che sta solo nel checkout condiviso (fuori da git, esclusa in `.git/info/exclude`) e che la pubblicazione da lì caricava
  online da prima (`/_mockup/...` rispondeva 200, senza noindex). **Dall'8/11 ~11:20 (suo «ok toglili») `_mockup` è
  in `CARTELLE_FUORI` di `pubblica-pages.js`**, come `_anteprime-prova` dal 22/10: non va più online e il log dice 46 da
  qualunque copia. Provato con i mockup veri copiati nel worktree: 36 file in meno, nient'altro cambia. I mockup si
  guardano in locale. Il segnale «un generatore ha smesso di togliere i commenti» è un numero che cresce oltre 46.

---

