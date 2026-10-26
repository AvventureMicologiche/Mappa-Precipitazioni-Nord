# Cambio d'ora del 25/10/2026: resoconto

Controllo fatto lunedì 26/10 fra le 9:00 e le 9:40 italiane, sui file di main fino al commit `7b76389e`
(meteohub delle 8:58). Tutti gli orari sono in ora italiana, salvo dove scrivo UTC.

## Da fare subito

1. **Niente di urgente per il cambio d'ora.** Il giorno di 25 ore è passato bene in tutte le reti che hanno già scritto il 25.
2. Se volete il Piemonte del 25 sulle pagine già oggi: rilanciare a mano `riepiloghi.yml`, poi pagine regione e
   anteprime. Adesso mostrano il 24 come «ieri» (il 25 è arrivato alle 8:02, dopo i giri del mattino). Vale anche per la
   riga «pluviometri letti», ferma al 24. Non è il cambio d'ora: è ARPA ferma. Stanotte si sistema da solo.
3. Da guardare con calma: il giro Trentino delle 0:45 è fallito e il «tetto di 30 s» è scattato dopo 5 s (punto 7).

⚠️ **Non raggiungibili da qui**: il sito vero (`/api/previsioni`, `/api/cerca`), MET Norway, Open-Meteo e ARPA Piemonte.
I punti 5, 6 e 9 li ho guardati solo sul codice (e `/api/cerca` facendo girare la Function in locale). Le prove vere
vanno fatte da voi.

## 1. I file del 24, 25 e 26/10

**A posto.** Tabella: stazioni del 25 contro la media dal 17 al 23/10.

| rete | media | 24 | 25 | note |
|---|---|---|---|---|
| Svizzera | 269 | 269 | 269 | `i` fino a **25 ore bagnate** il 25: le 25 ore sono contate tutte |
| Austria | 268 | 266 | 264 | |
| Francia (13) | | uguali | uguali | |
| MeteoHub (11) | | uguali | uguali | Puglia 130, Sardegna 93: sopra la media |
| OSMER Friuli | 41 | 40 | 40 | |
| Liguria | 198 | 198 | 198 | |
| Lombardia | 252 | 252 | 252 | |
| Piemonte | 280 | 283 | 278 | 25 tutto da MeteoHub, come descritto |
| Emilia | 328 | 325 | 321 | ARPAE completa entro le 11 |
| Veneto, Trentino, Alto Adige, Toscana, VdA | | uguali | uguali | |
| Slovenia | 114 | 111 | manca | normale: ritardo di 34 ore, arriva domattina |
| Ticino | 40 | manca | manca | OASI ferma dal 21/10 |

- **Le reti che sommano le ore** (Svizzera, Austria, Francia, MeteoHub, Liguria, Piemonte, Slovenia) usano tutte
  `finestraGiorno` di `lib-giorno-italiano.js` (o la stessa regola per la Slovenia): il 25 va dalle 22:00 UTC del 24 alle
  23:00 UTC del 25, 25 ore. La soglia `MIN_ORE=20` non toglie nessuno in un giorno lungo. Nessun campo `i` sopra 25.
- **OSMER Friuli** ha la sua cucitura (`confini` con due fusi): il 25 prende le ore 23-24 UTC del 24 e 1-23 del 25,
  cioè 25 ore. Giusto. Il 25 era quasi asciutto (1 mm su 40 stazioni, MeteoHub Friuli 39 mm su 139): coerente.
- **Valle d'Aosta** usa ancora la vecchia `getItalyOffset` (cambio alla mezzanotte UTC) per dare la data ai
  valori orari e giornalieri: fra le 00 e le 01 UTC del 25 la data esce comunque 25, quindi nessun danno.
- **Lombardia**: Socrata è in ora solare fissa (UTC+1, lo dice il commento sopra `toARPAISO` in `index.html`) e la
  query chiede 00:00-23:59 del giorno. Il 25 sono 24 ore di ora solare, quindi giuste. Vedi «cose viste per strada».
- **Toscana**: il 25 è chiuso. Giri di chiusura da Cloudflare alle 22:40, 23:00, 23:25, 23:40 (in orario, ragionano in
  ora italiana) più due di GitHub alle 23:32 e 23:59. Il file finale ha `collected` 22:59 UTC (23:59 italiane) e
  nessun `closing_late`. Il giro tardivo delle 0:19 non ha toccato i millimetri (guardia `giaChiusoInOrario`).
  Stazioni bagnate uguali fra 24 e 25: 3 (4 mm), cioè nulla. Fra 25 e 26 sono 66, ma il 26 è il file di **oggi**,
  che al mattino contiene per costruzione la coda Δ24h di ieri: si sistema coi giri di oggi.
  - Piccolo limite, non riparabile: la lettura Δ24h delle 23:59 copre 24 ore, quindi la prima ora del 25 (00-01 ora
    legale) non è finita in nessun file. Succede solo nel giorno di 25 ore.
- **Alto Adige**: nessuna copia. 24→25 e 25→26: 0 stazioni bagnate uguali. I giri delle 0:37 e 1:03 del 25 hanno
  scritto 0 mm (contatore già azzerato), il 26 alle 6:04 è a 0 mm.
- Stesso controllo su Veneto, Trentino, Emilia, Liguria, Piemonte, Lombardia: nessuna copia.

**A che ora è arrivato il 25 completo** (dalla storia dei commit, millimetri uguali al file finale):

| rete | primo file completo | chi l'ha lanciato |
|---|---|---|
| Austria | 0:45 | Cloudflare 0:45 |
| Valle d'Aosta | 0:45 | Cloudflare 0:45 |
| Francia | 0:48 | Cloudflare 0:45 (38 stazioni ritoccate dopo, Météo-France consolida) |
| Trentino | **2:32** | cron GitHub. Il giro Cloudflare delle 0:45 è **fallito** (punto 7) |
| Liguria | 2:47 | cron GitHub 23:45 UTC, partito con 2 ore di ritardo |
| Lombardia, Svizzera, MeteoHub, Veneto, OSMER | 4:30-4:35 | Cloudflare 4:30 |
| Piemonte | 8:02 a mano, 8:17 automatico | ARPA ferma |

Nota: i cron di chiusura di Austria, VdA, Francia e Trentino **non sono più** alle 22:40-22:50 UTC. Dal 19/10 (commit
`15b6309dd`) sono alle 23:40, 23:50, 23:55 e 23:30 UTC, cioè 0:30-0:55 d'inverno. Quindi non partono prima della fine
del giorno. La notte 25-26 GitHub li ha fatti partire verso le 2:45 (2 ore di ritardo): il 25 è arrivato grazie a Cloudflare.

## 2. Il guardiano

**A posto.** Legge i cron in UTC e confronta con l'ora UTC: il cambio non lo tocca. La notte non gira (primo giro alle 6:00).
- 26/10 alle 6:00, 6:30, 7:00: ha rilanciato Piemonte (il 25 mancava davvero) e Ticino, poi si è fermato col tetto. Voluto.
- Alle 6:00 ha rilanciato anche la Slovenia: alle 6:00 il 24 non c'era ancora (è arrivato alle 6:03). Lo fa ogni
  mattina, anche il 24 e il 25: non è il cambio d'ora.
- Nessun rilancio a torto.

## 3. Allarme fonti

**A posto.** Il 25 è partito alle 11:45 (Cloudflare), nessuna segnalazione: il Ticino era a 4 giorni, soglia 5.
Il 26 non è ancora partito (parte alle 11:45). Fatti girare qui sui dati di stamattina, senza scrivere niente:
- `check-fonti.js`: **solo il Ticino**, «ferma da 5 giorni, ALLARME NUOVO». Tutte le altre reti hanno il 25.
- `check-doppioni.js`: nessun doppione sopra soglia (massimo 3 stazioni in Toscana fra 24 e 25).
- `check-campi.js`: nessun campo sotto soglia per il 24 e il 25.

## 4. Riepiloghi e pagine

**A posto per il cambio d'ora.** `ultimoCompleto` e `giorniIndietro` lavorano per giorni di calendario a mezzogiorno e
per ora italiana con `Intl`: il giorno di 25 ore non li disturba.
- Giro delle 5:15 del 26: «ieri» = **25** per 21 regioni su 23, con le stazioni giuste. Fanno eccezione:
  - **Piemonte**: ieri = 24 (il 25 non c'era alle 5:15). Vedi «Da fare subito».
  - **Slovenia**: ieri = 24. Normale.
- `letture.json` dice **24/10, 5.832 stazioni** (giro delle 7:30). Il 25 aveva una cartella in meno (Piemonte), quindi
  ha vinto il 24. Stesso motivo.
- Pagine regione cotte (5:16): date del 25 (Toscana: «25 ottobre»), Piemonte del 24.
- Anteprime del 26 (ramo `anteprime`, 5:25): «ieri» del 25 per tutte, Piemonte 24, Slovenia 23 (scattate prima delle 6:03).

## 5. «Oggi» e «domani» sul sito

**A posto sul codice, non provato dal vivo** (sito e MET non raggiungibili da qui).
- `functions/api/previsioni.js`: ore di MET in UTC, convertite in giorno e ora italiana con un `Intl` su `Europe/Rome`.
  La % di Open-Meteo si chiede in `timezone=GMT` e si aggancia per istante: il commento dice proprio che in ora
  italiana Open-Meteo il 25 dava 24 ore invece di 25. Quindi niente ora doppia o mancante dal 25 in poi.
- `meteoClient` (`lib-meteo-regione.js`) e il modulo di `index.html` calcolano oggi/domani con `Europe/Rome` e domani
  come giorno di calendario. Giusto.
- Da provare voi: una chiamata `/api/previsioni?lat=..&lon=..&ore=1&pr=1` e guardare che il 26 abbia le ore 0-23 una volta sola.

## 6. Abruzzo «ieri» del 25

**Probabile ora persa, danno piccolo. Non verificato** (Open-Meteo bloccato da qui).
- `index.html`, ramo orario: chiede Open-Meteo con `timezone=Europe/Rome` e somma le ore `(25T00:00, 26T00:00]`.
- Lo stesso commento di `previsioni.js` dice che in ora italiana Open-Meteo il 25/10 **non ripete le 02**: 24 righe per
  un giorno di 25 ore. Quindi l'Abruzzo «ieri» del 25 somma 24 ore su 25: manca un'ora di pioggia.
- Il 25 nel centro era quasi asciutto (Lazio 3 mm su 209 stazioni, Molise 8 su 28): in pratica niente.
- Riguarda solo il 25 e solo «Ieri». Sui periodi lunghi si usa `precipitation_sum` di Open-Meteo, che non ho potuto
  vedere. È una stima comunque; si ripete l'ultima domenica di ottobre di ogni anno.

## 7. Le modifiche del 21/10 sera

- **Temperature impossibili**: dal 21/10 alle 17 nessun file `meteohub-*` riscritto dal passo dei riepiloghi. L'unico
  commit «temperature impossibili» è del 25 alle 5:15 e tocca solo `toscana/2026-10-25.json`. Tutti i giri di
  `meteohub.yml` dal 23/10 sono riusciti. **A posto.**
- **`timeout-minutes`**: in 500 giri dal 23/10 alle 7 a stamattina, **nessun collector fermato dal tetto**. Il giro più
  lungo per workflow sta sotto il tetto (Liguria 6,0', Lombardia 5,3', MeteoHub 5,7', Toscana 1,2' su 10).
  Fermato una volta solo `anteprime.yml`, il 23/10 alle 12:30 (45,4' contro i 9' soliti): un blocco vero, il tetto ha fatto
  il suo lavoro. Il Ticino, che fallisce da giorni, ci mette 8,6' e una volta **17,3'** (25/10 alle 6): vicino ai 20.
- **I 30 s sulle richieste: cosa non va.** Giro Trentino lanciato da Cloudflare alle **0:45 del 26**
  (run `40246171024`): tre tentativi, tutti «❌ nessuna risposta in 30 s» **dopo 5,4 secondi** (23:45:33 → 23:45:38 UTC).
  - Causa probabile: in Node 22 l'agente HTTPS di base ha un tempo di **5 s** sul socket, e durante la connessione è
    quello che scatta e chiama il nostro gestore. Il `setTimeout(30000)` della richiesta vale solo a connessione
    fatta. In prova locale, con la connessione aperta e la risposta ferma, il tetto scatta giusto a 30 s; la fase di
    connessione da qui non la posso riprodurre.
  - Effetto: il server Meteotrentino quella notte non ha aperto la connessione entro 5 s, tre volte. Il 25 del
    Trentino è arrivato alle 2:32 invece che alle 0:45. Nessun dato perso.
  - Riguarda tutte e sei le richieste toccate il 21/10 (Emilia, Trentino x2, Veneto, Alto Adige, SIR): in connessione il
    tetto vero è 5 s, non 30. Finora è l'unico giro fallito per questo.
  - Si ripara da solo il giorno dopo. Da decidere se allargare (per esempio un `agent` con `timeout: 30000`).
- **Vetrina**: le sette voci nuove hanno `da: 2026-10-25T00:00:00+02:00` (la mezzanotte del 25 era ancora ora legale:
  giusto) e `pioggia2026` è attiva dal 21. Il sorteggio ha 8 voci. **A posto.**

## 8. Le modifiche Piemonte di stamattina

**A posto, con due osservazioni.**
- **Finestra in `fetchRealtimeDay`**: chiede da `G T00:00` a `G+1 T00:00` e tiene `(inizio, fine]` di `finestraGiorno`.
  Nei giorni da 25 e 23 ore la finestra è giusta. Che `Date.parse(m.date)` dia l'istante giusto lo dice il file del 23
  rifatto stamattina: 265 stazioni su 278 con `h=24`. Con un fuso letto male sarebbero 23.
- **Ripiego**: `piene = min(24, ore del giorno)` vale 23 a fine marzo e 24 il 25/10, coerente col tetto di 24 su `h`
  (sia ARPA sia MeteoHub). Quando ARPA torna col giorno intero vince da sola (`prev.h >= s.h`).
  ARPA del tutto irraggiungibile: `arpaGiu`, si va col solo MeteoHub ed esce rosso se non scrive niente. Giusto.
  - Oggi (giorno corrente) non c'è ripiego: se ARPA è giù il file di oggi non si scrive. Va bene, la mappa non lo mostra.
- **`collect-meteohub.js` da solo**: il giro di `meteohub.yml` delle 8:55 ha riscritto 23 file con **millimetri
  identici** (provato su Sicilia 24, Molise 25, Friuli 25: 0 differenze) e senza il campo `h`. Fa quello di prima.
- **File su main**: 23/10 278 stazioni ARPA; 25/10 278 tutte `src: meteohub`, `h=24`, 213 mm. Il 24/10 ha 283
  stazioni: 189 da MeteoHub e **94 ARPA**, di cui 83 con `h=23` e 11 con 18-22 ore.
  - Osservazione 1: per quelle 89 stazioni MeteoHub non aveva più ore di ARPA (a parità vince ARPA). Vuol dire che
    anche MeteoHub non ha l'ultima ora del 24 per quelle stazioni (stessa fonte a monte). Il 24 resta un po' corto lì.
    Da guardare in locale se serve.
  - Osservazione 2: il 24 ha 283 stazioni (dal 17 al 23: 277-282). Le 5 in più rispetto al 23 vengono da MeteoHub
    (Colle Barant, Villafranca Pellice, Santena Banna, Ponte di Nava Tanaro, Argentera). Controllato: nessun id doppio
    e nessuna coppia di stazioni nello stesso punto. Va bene così.

## 9. Ricerca dei posti

**A posto in locale, non provata sul sito** (non raggiungibile da qui). Fatta girare `functions/api/cerca.js` sui file
di `luoghi/`: «viozene» → Viozene (Piemonte, IT); «ginevra» → Ginevra (Canton Ginevra, CH); «nice» → Nizza per prima.
Le pagine `/meteo/<zona>/` chiamano `/api/cerca?name=`. Da provare voi sul sito vero.

## Cose viste per strada

- **Lombardia in ora solare fissa.** Se Socrata è davvero in UTC+1 tutto l'anno (lo dice `index.html`), d'estate il
  giorno della Lombardia va dall'1 all'1 ora legale, un'ora dopo le altre reti. Non è nel `CLAUDE.md`. Da verificare.
- **Ticino vicino al tetto**: un giro fallito di 17,3' su 20. Se OASI si appende a lungo, il tetto fermerà il giro. Va bene, ma lo sapete.
- **Slovenia ogni mattina** viene rilanciata dal guardiano alle 6:00, perché il suo cron (6:25 UTC) d'inverno parte alle
  7:25. Innocuo, ma è un giro in più al giorno.
- I cron di GitHub nella notte 25-26 sono partiti con circa 2 ore di ritardo (Toscana 21:00 UTC alle 23:59, Austria
  23:40 UTC alle 2:43). Senza Cloudflare i giorni chiusi sarebbero arrivati verso le 3.
