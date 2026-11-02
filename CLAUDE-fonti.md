# CLAUDE-fonti.md: le fonti dati, regione per regione

Pezzo del `CLAUDE.md` del repo, diviso per argomento il 1/11/2026 (scheda 107, sua scelta). **Prima si legge il
`CLAUDE.md`**: le regole che valgono sempre e l'indice di tutti i file. Qui sotto le sezioni sono quelle di prima,
tali e quali e nello stesso ordine: quando una nota dice «più su», «qui sotto» o «in fondo al CLAUDE.md», la sezione
può stare in un altro file, e il titolo si trova nell'indice del `CLAUDE.md`.

Per arrivare a una sezione: `grep -n "^## \|^### " CLAUDE-fonti.md`, poi si legge da quella riga.
**Le note nuove di questo argomento vanno IN FONDO a questo file**, con una riga nell'indice del `CLAUDE.md`.

Sezioni:

- Architettura dati per regione
  - Lombardia
  - Piemonte
  - Emilia Romagna
  - Veneto
  - Trentino
  - Alto Adige
  - Toscana
  - Liguria
  - Austria (in produzione dal 7 agosto 2026)
  - Francia intera (v7.0, in produzione dal 10 agosto 2026)
  - Svizzera intera (v6.0, in produzione dal 3 agosto 2026)
  - Ticino (Svizzera)
  - Centro-Sud via MeteoHub (Marche, Umbria, Lazio, Molise, Campania, Puglia, Basilicata, Calabria, Sicilia, Sardegna)
  - Abruzzo
  - Valle d'Aosta
  - Friuli Venezia Giulia
  - Slovenia (v8.0, in produzione dal 12 agosto 2026)
- Bug risolti (cronologico)
  - Giugno 2026
  - Luglio 2026
- Coerenza fra reti confinanti (4 agosto 2026)
  - `check-confini.js` — il confronto al confine
  - Le 8 stazioni gemelle ARPAE ∩ OMIRL — la verifica più stringente
- La quota delle stazioni (26 agosto 2026)
  - 1. Piemonte, finestra storica 3/5 → 14/8/2026 — RIPARATA
  - 2. Undici reti che la quota non ce l'hanno proprio — QUOTA DAL TERRENO
  - 3. In mappa: `testoQuota(s)`
  - Stato dopo la riparazione
  - 4. Il «~» e' affidabile, e le stazioni nuove lo prendono da sole (14/10/2026)
  - 5. Dal 25/10/2026 il terreno viene dalle tessere terrarium, non da Open-Meteo
- La direzione del vento: campo `wd` (2 ottobre 2026)
- Togliere Open-Meteo (dal 25/10/2026)

---

## Architettura dati per regione

> ⚠️ **I COLLECTOR STANNO TUTTI IN `.github/scripts/`.** Qui sotto sono citati
> col solo nome del file: il percorso e' sempre quello, ed e' quello che i
> workflow lanciano.
>
> Fino al 24/8/2026 nella RADICE del repo c'erano nove copie degli stessi
> collector, ferme a inizio giugno: `collect-emilia.js` nella radice era
> indietro di 136 righe rispetto a quello vero, `collect-veneto.js` di 509.
> Nessuno le lanciava, ma chiunque avrebbe potuto correggere quella sbagliata
> senza accorgersi di niente. Sono state cancellate (restano nella storia di
> git). Se ti serve leggere un collector, aprilo in `.github/scripts/`.


### Lombardia
- **Fonte:** ARPA Lombardia Socrata API (`dati.lombardia.it`)
- **Collect:** `collect-lombardia.js` (dal 24 luglio 2026) — prima era l'UNICA regione caricata live dal browser
- **Formula:** `sum(valore)` su un giorno raggruppata per sensore = totale mm. Sensori pioggia da anagrafe `nf78-nj6b` (tipologia='Precipitazione'), misure da `647i-nhxk`
- **Orari:** dal 27/10/2026 sveglia Cloudflare alle 4:30 italiane + 2 cron GitHub di riserva (04:40 e 12:40 UTC); erano 6 run/giorno. Ogni giro raccoglie ieri/altroieri
- **Fase 3 dell'alleggerimento (27/10/2026): l'anagrafe e' UNA richiesta** (`fetchAnagrafeTutta`, le cinque tipologie
  insieme, righe in ordine `:id` come prima): 7 richieste a giro invece di 11, file identici. ⚠️ **Due cose provate e
  NON fatte**: ieri e l'altro ieri in una richiesta (le ore di Socrata si raggruppano per giorno e ora, e la marca delle
  00:00 appartiene al giorno prima: una finestra di due giorni la metterebbe nel secchiello sbagliato) e saltare i giri
  dopo le 4:30 (misurato sulla storia di git: ARPA aggiunge dati a ieri fino a sera, il 20/10 163 stazioni e 97 mm)
- **Secondo tentativo a fine giro (30/10/2026).** Il giro delle 4:30 del 30/10 ha preso 429 da Socrata cinque volte
  sulla sola richiesta della direzione: il file del 29/10 era nuovo, `tieniMeteo` non aveva niente da tenere, e il giorno
  e' rimasto senza direzione fino al giro delle 12 (la riserva delle 04:40 UTC e' partita alle 11:00), con la mail di
  `check-campi` alle 11:45. Ora, se la richiesta meteo o quella della direzione cade e nel file scritto quel campo non c'e'
  su nessuna stazione, a fine giro si aspetta un minuto e si rifa' il giorno UNA volta. Se il file ha gia' i valori dei
  giri prima non si richiede niente. Provato in una copia con le risposte vere registrate e i 429 finti: vecchio wd 0,
  nuovo wd 120 (anche con la richiesta meteo caduta: vecchio t/w/u a 0, nuovo tutto); file gia' pieno = nessuna richiesta
  in piu'; Socrata che non risponde mai = file come prima, ~5 minuti in piu' di giro (tetto 20)
- ⚠️ **GLI ORARI DI SOCRATA SONO IN ORA SOLARE FISSA (UTC+1) TUTTO L'ANNO, marca a FINE dei 10 minuti** (misurato il
  26/10/2026 contro MeteoHub dpcn-lombardia: ore di pioggia identiche nel 97% con questa lettura, 5-22% con le altre).
  Fino al 26/10 il collector chiedeva «D 00:00:00 - D 23:59:59» in quegli orari: d'estate il giorno lombardo andava
  dalle 0:50 alle 0:50 (la pioggia fra mezzanotte e le 0:50 finiva sul giorno prima), d'inverno era indietro di 10'.
  Ora `finestraSocrata` = il giorno italiano di `finestraGiorno` portato in ora solare, (inizio, fine]; le ore si
  raggruppano per giorno E ora (`date_extract_d` + `date_extract_hh`: ⚠️ `date_trunc_ymdh` qui NON esiste). Prova sul
  20-21/10: giorni bagnati uguali a MeteoHub 92-93% (prima 1%). **Lo storico fino al 26/10 resta com'e'** (sua decisione).
- **Dati corretti da:** ~1 gennaio 2026 (backfill; il dataset Socrata 647i-nhxk contiene solo l'anno corrente in pieno — il 2025 è vuoto/sparso, min completo = gennaio 2026, ~204 giorni. Cresce a 365 con la retention)
- **Migrazione a file (24 luglio 2026):** prima la Lombardia interrogava Socrata **live** dal browser a ogni caricamento — lenta sui periodi lunghi (~60 richieste per 30 giorni) e dipendente da Socrata in tempo reale. Ora scrive file giornalieri come le altre regioni: il sito legge i file (`loadARPALombardiaRegion` fa `fetch` del raw GitHub e somma), i sensori morti (offline, nessun dato quel giorno) non ci sono, e se Socrata va giù lo storico resta. Fallback a Open-Meteo se i file mancano. Valori identici alla vecchia query live (verificato: 15/7 media 6.63)
- **In mappa ci sono le stazioni VERE (31 luglio 2026).** Fino a oggi la Lombardia era l'unica regione a non mostrare le proprie stazioni: prendeva l'**anagrafe** ARPA (326 pluviometri), la assottigliava due volte con `selectUniform` (326→187→160) e a ognuno di quei punti assegnava il valore della stazione reale **più vicina**. Era il compromesso dell'epoca live — 325 chiamate a Socrata erano insostenibili — ed è sopravvissuto per inerzia alla migrazione a file, dove non serviva più.
  - **Quanto costava**, misurato sul periodo 8-15 luglio: 253 stazioni misuravano, **solo 128 misure arrivavano in mappa**. 125 non si vedevano mai, compreso il **massimo del periodo** (77,2 mm a Oltre il Colle Zambla, mentre il pannello dichiarava 68,6). `selectUniform` tiene al massimo 4 stazioni per ognuna delle 80 caselle in cui divide la regione, quindi decima proprio la montagna, dove la rete è fitta: nelle Orobie sopravvivevano **2 pluviometri su 12** e una sacca da 44 mm risultava asciutta. Per una mappa che serve a trovare dove ha piovuto 16-23 giorni fa era il difetto peggiore possibile — trovato dall'utente guardando un buco di pallini fra Valtellina e Val di Scalve.
  - **Velocità: nessun costo.** A/B in locale a cache calda: 7 giorni 777→793 ms, 30 giorni 983 ms sul test e 923 in produzione. La lentezza che aveva motivato il taglio era Socrata in diretta, non il numero di stazioni. Attenzione a non ripetere l'errore di misura fatto quel giorno: la prima apertura assoluta scarica il confine GeoJSON e i file dei giorni e può sforare il timeout di sicurezza di 30s, quindi **si confronta solo a cache calda**.
  - **Tre sensori esclusi** (`LOMB_ESCLUSE` in `loadARPALombardiaRegion`): hanno coordinate corrotte nell'anagrafe ARPA — `2239` "Ispra prato" (VA) alle coordinate di Gandellino Tezzi (BG), `2206` "Ispra tetto" (VA) sulle colline bergamasche, `2535` "Virgilio Mantova Cerese" (MN) alle coordinate di Dorio (LC). Sono morti da sempre, il filtro serve a non ritrovarseli piantati in mappa se tornassero a riportare. **`Ispra JRC` (32355) è invece corretta e riporta ogni giorno: non toccarla.**
- **Il grafico storico legge i FILE dall'11/8/2026** (`histFromFiles`, come tutte le altre regioni): era l'ultima cosa live su Socrata (`histFromLombardia`, rimossa). La Netlify function `/arpa` resta in uso per l'anagrafe della mappa
- **Temperatura/vento (dall'11/8/2026):** l'anagrafe ha sensori Temperatura (309, °C) e Velocità Vento (155, **m/s → ×3,6**, dichiarato in `unit_dimisura`); il join col pluviometro è via `idstazione`. UNA query Socrata in più per giorno, raggruppata per (sensore, **idoperatore**, ora) → la completezza si misura in ORE COPERTE (≥20) a prescindere dalla granularità (temperatura 10', vento 5'). Backfill `backfill-meteo-lombardia.js` dal 27/6
  - ⚠️ **`idoperatore` NON È UN DETTAGLIO, e qui c'era un bug fino al 29/8/2026.** Socrata pubblica **più righe per la stessa marca temporale sullo stesso sensore**, distinte da quel campo: **1 = media, 3 = massimo (la raffica)**. Il collector non lo nominava e faceva `min/max/avg` su tutte le righe insieme: la velocità del vento usciva **gonfiata del 70-90%** e la raffica finiva nel calderone invece che in `w[1]`. La riga che stava qui, «la raffica non esiste su Socrata», **era sbagliata**: esiste, e il `max` orario che serviva il collector lo calcolava già.
  - **Trovato col tornado di Cremona del 28/8/2026**, cercando perché i pluviometri in città segnassero 0 mm: «Cremona v.Gerre Borghi» aveva media vera 4,3 km/h, ne scrivevamo 7,9, e la **raffica reale era 118,4 km/h**. Il giorno del tornado la mappa diceva «vento 7,9 km/h».
  - ⚠️ **Le altre grandezze non erano toccate, verificato una per una**: Precipitazione ha solo `idoperatore 4`, Temperatura e Umidità solo `1`. **La pioggia non è mai stata doppiata** — è la prima cosa da escludere quando salta fuori un campo del genere.
  - Storico rifatto sui 63 giorni con vento (27/6→28/8): 7.510 stazioni-giorno con la raffica, 309 (4%) restano senza perché la loro serie `idop 3` è bucata. Controllo di coerenza: pioggia e conteggio stazioni **identici in tutti e 63 i file**, e la raffica più alta dello storico (162 km/h a Bione il 17/7) ha i vicini a 120, 87 e 83 km/h con 18-35 mm — è una burrasca vera, non uno sbalzo.
  - ⚠️ **La stessa query è duplicata in `backfill-meteo-lombardia.js`**: le due devono restare uguali.
- **Sensori morti:** su 325 in anagrafe, ~250 riportano; su 30 giorni 71 non riportano mai (0 online genuinamente a zero → una stazione a ~0 su un mese è morta, non asciutta)
- **Il 429 e la strada dal worker (2/11/2026, scheda 109).** Dal 27/10 Socrata risponde 429 ai runner di GitHub in 17
  giri su 22, anche col token (che il 13-14/10 lo aveva quasi azzerato): cade la prima richiesta grossa (la pioggia su
  `647i-nhxk`) subito dopo l'anagrafe, cinque volte in 100 s; in due giorni quattro giorni di pioggia caduti
  (recuperati dai giri dopo, persa solo la correzione serale di ARPA; il 1/11 sera il giro e' uscito con 0 senza
  scrivere niente). Dal PC la stessa richiesta senza token: 200 in 0,9 s. Da Cloudflare (MXP) SENZA token: 429 subito
  sulla richiesta grossa, 200 sull'anagrafe. Quindi: `dati.lombardia.it` aggiunto al worker `omirl-tramite`
  (`/resource/`, versione `ebd807c8`), che per Socrata inoltra anche l'`X-App-Token` del collector (provato: token
  finto = 403 «Invalid app_token»). `getJSON` va diretto; al 429 rifa' subito la richiesta dal worker; se anche li' e'
  429, pause di 45 s e 2 minuti (diretta + worker), tetto di 6 minuti di attese per giro; un giorno caduto per 429
  entra in `daRifare` (un minuto dopo). Riga a fine giro: «Richieste a Socrata: N dirette, N dal worker, N 429».
  `lombardia.yml` passa `TRAMITE_URL`/`TRAMITE_CHIAVE` (= secret `OMIRL_CHIAVE`) a livello di job.

### Piemonte
- **Fonte:** ARPA Piemonte `utility.arpa.piemonte.it/api_realtime`
- **Collect:** `collect-piemonte.js`
- **Formula:** `sum(cum_rain_1h)` per totale giornaliero + merge MAX protezione
- ⚠️ **IL GIORNO ERA SPOSTATO DI UN'ORA, corretto il 26/10/2026.** I record realtime hanno la marca a FINE ora (il
  record delle 00:00 e' la pioggia fra le 23 e mezzanotte del giorno prima), ma `fetchRealtimeDay` chiedeva i record
  dalle 00:00 alle 23:59: il giorno andava dalle 23 del giorno prima alle 23, e la pioggia fra le 23 e mezzanotte
  finiva sul giorno dopo. Trovato con MeteoHub `dpcn-piemonte` (stessi pluviometri, marca a fine ora): ora per ora
  identici a sfasamento 0 (559 ore bagnate su 560), e sommandoli con la vecchia finestra si ritrovavano i nostri file
  del 18-21/10 in 864 casi su 875, con la finestra giusta in 191. Ora si chiede fino alle 00:00 del giorno dopo (l'API
  ragiona in ora locale, estremi compresi) e si tiene (inizio, fine] con `finestraGiorno` di `lib-giorno-italiano.js`
  (giorni da 23 e 25 ore giusti). Lo storico fino al 25/10 resta con la finestra vecchia; c'era da sempre, anche col v1.
  Prove nello scratchpad della scheda 95 (`prova-piemonte\`): sintetica su quattro giorni compresi i due cambi d'ora,
  vera sul 22-24/10 (con MeteoHub 253 su 253 il 22 e il 23, il vecchio 250 su 253 il 23).
- **Il 25/10/2026 viene da MeteoHub** (`src:'meteohub'` su ogni stazione, commit `7680ef0eb2`): ARPA ferma dalle 22
  del 24/10, realtime e archivio. 278 stazioni abbinate agli id ARPA sulla pioggia del 18-24/10. ⚠️ MeteoHub da anonimi
  da' al massimo 3 giorni per richiesta.
- **RIPIEGO AUTOMATICO SU METEOHUB (dal 26/10/2026).** Per D-1..D-3, se ARPA non ha il giorno intero (nessun file, o
  meno di meta' delle stazioni con tutte le ore) il collector prende il giorno da MeteoHub `dpcn-piemonte` con
  `collectDay` di `collect-meteohub.js` (che ora si lascia anche `require`: lanciato da solo fa quello di prima, provato
  identico sul Molise), pioggia, t, w, u, wd e intensita'. Stazioni riconosciute con la tabella fissa
  `.github/scripts/piemonte-meteohub.json` (278 coppie, non la distanza: MeteoHub sposta le coordinate fino a 2 km).
  Per stazione vince chi ha piu' ore, a parita' ARPA: quando ARPA ripubblica il giorno intero torna lei da sola. Se ARPA
  non risponde per niente il giro va avanti col solo MeteoHub ed esce rosso solo se non ha scritto niente da li'.
  ⚠️ Finche' MeteoHub copre, l'allarme fonti NON suona per il Piemonte (i file sono dati veri): il segno e' `src`.
  ⚠️ **IL VENTO MEDIO DI METEOHUB PIEMONTE E' SBAGLIATO SU 42 STAZIONI SU 72** (trovato il 26/10/2026 confrontando
  campo per campo il 18-23/10): e' il valore ARPA diviso per 3,6, rapporto mediano 0,278 (la conversione km/h -> m/s
  fatta due volte a monte). Raffica e direzione invece identiche, e cosi' pioggia, temperatura e umidita'. Nella tabella
  ogni stazione ha `fv`: 3.6 = si moltiplica (42), 1 = giusto (17), 0 o assente = il vento di MeteoHub non si usa (13,
  rapporti 1,1-1,9 senza spiegazione). Corretto: dopo, vento entro 1 km/h da ARPA nel 97% dei confronti (prima 30%).
  I file del 24 e 25/10 sono stati rifatti col codice corretto (cambia solo il vento). Lo stesso errore c'e' anche in
  alcune reti MeteoHub del sud: vedi la scheda Centro-Sud, «vento medio diviso per 3,6».
  Prove nello scratchpad della scheda 95 (`prova-piemonte\`, `piemonte-ripiego.js`, `confronta-rip.js`).
- **Collector v2 IN PRODUZIONE dal 18/8/2026 (commit `71fb27b5`), provato nel test dal 17/8** (`piemonte.yml` aggiunto lì con `permissions: contents: write`; 4 cron riusciti nella notte, mm identici a prod salvo i casi previsti; primo run prod alle 11:30 UTC ok: quota su tutte, vento 65→74). Caso che ha chiuso la questione MAX: **Larecchio 17/8**, il v1 aveva letto 7,8 mm alle 18:17 e il MAX l'ha congelato, poi ARPA ha invalidato le ore dalle 15:00 (sensore in avaria) e il realtime dice 1,0 con h=12 — il v2 segue la fonte e poi l'ufficiale. Cosa fa: ricalcola D-1..D-3 dal realtime con campo `h` = ore valide (merge «vince chi ha più ore» al posto del MAX), passata sulla **banca dati storica ufficiale** `utility.arpa.piemonte.it/meteoidro/dati_giornalieri_meteo/?data_min=G&data_max=G&page_size=1000` (una chiamata per tutte le stazioni, disponibile già per ieri): stazioni assenti dal realtime aggiunte SOLO se ptot>0 (gli zeri ufficiali non sono affidabili senza realtime: Omegna Lago d'Orta ad agosto scrive 0 col sensore fermo), realtime incompleto (h<24, |Δ|>1 mm) sostituito, t/w riempiti dove mancano (**vento ufficiale in m/s ×3,6**), **quota `q` da `stazione_meteorologica`** (join per `codice_stazione` = station_code, 273/273) su tutte. ⚠️ **L'archivio ufficiale conta il giorno in UTC** (giorno G = record locali 03:00 di G → 02:00 di G+1 in ora legale, verificato su Crodo/Druogno/Cursolo): NON si adotta, il progetto usa il giorno solare italiano; le differenze da giorno UTC (pioggia 00-02) si loggano soltanto. `DRY_RUN=1` per provare. Confronto ufficiale↔nostro 1/7-13/8: 97,6% entro 1 mm, somma −0,4%. ⚠️ Emilia↔Piemonte a 30 giorni sbanda (Emilia +5,8 mm, 66%): è **orografia**, verificato il 18/8 — le stazioni «Emilia» di quel confine sono le 8 gemelle dell'alta val Trebbia/Aveto (versante ligure, il 26/7 66-96 mm) e coincidono con OMIRL, il Piemonte (Capanne di Cosola, Piani di Carrega, Cabella) coincide al decimale con l'archivio ufficiale ARPA. A 70 giorni torna +1,1 mm / 51%.
- **Merge MAX:** se "aggiorna ieri" riceve <1000 record, salta l'aggiornamento
- **~~PIEMONTE_STATIONS~~ → `PIEMONTE_ESCLUSE` (17/8/2026, commit `c5fb6a31`).** Fino al 17/8 l'index aveva una WHITELIST di 170 nomi «distribuiti uniformemente» (epoca live) e `loadARPAPiemonteRegion` scartava il resto: misurato il 16/8, **273 raccolte, 163 mostrate, 110 nascoste** (Torino 39, Cuneo 31, VCO 13: Sestriere, Oropa, Boves, Lanzo, Govone, Bauducchi, Pontechianale…), 98 con temperatura e 21 col vento, e 7 nomi della lista non davano più dati (Passo del Moro, Malciaussia, Pradeboni, Ponte di Nava, Lavagnina, Colle San Bernardo, Limone Pancani). Stesso difetto tolto in Lombardia il 31/7. Ora si mostra tutto meno la lista di esclusione, come `LOMB_ESCLUSE`. Piemonte a 30 giorni: **169 → 283 stazioni**, max invariato, tempi identici a cache calda. Il vecchio testo qui sotto resta per la storia di Malanotte:
- **PIEMONTE_STATIONS (storico):** 170 stazioni curate (filtrate da 275) nell'index.html. Ceppo Morelli esclusa (sensore offline). MONTE MALANOTTE (id 106, Cuneo) NON è in lista e non va aggiunta: pluviometro guasto dal 16 luglio 2026 — pioggia fantasma per giorni consecutivi (fino a 136mm/giorno) con Open-Meteo a 0.0, vicini asciutti e sensori temperatura/umidità null. I valori errati restano nei file grezzi `data/piemonte/` (16-20 luglio+) ma non arrivano mai in mappa (filtro applicato prima dell'accumulo). **Ricontrollata il 25 luglio 2026:** tornata online dal 22/7, ma temperatura/umidità ancora al 100% `null` (la firma del guasto persiste) e nessun evento di pioggia per testare il pluviometro → **esclusa in via definitiva, non riaggiungere e non serve più ricontrollarla ai check periodici.**
- **Orari:** 2 cron (23:15 e 13:00 UTC) + la sveglia Cloudflare delle 4:30 italiane (erano 6 cron fino al 24/10/2026: ogni giro ricalcola comunque D-1..D-3, e il file di oggi in mappa non si vede)
- **⚠️ DA GITHUB PASSA DA CLOUDFLARE (dal 24/10/2026)**, come la Liguria: dalla sera del 23/10 ARPA Piemonte non
  risponde ai runner di GitHub («fetch failed» sull'anagrafica), dal PC si' in 0,2 s. Il 23/10 era rimasto con 12 ore
  su 24 e **1 mm** su 278 stazioni (la pioggia era di sera): raccolto dal PC il 24/10 mattina, **311 mm**. Il workflow
  passa `TRAMITE_URL` (lo stesso worker `omirl-tramite` della Liguria, fissato a Milano, che passa anche `/api_realtime/`
  e `/meteoidro/`) e `TRAMITE_CHIAVE` (= secret `OMIRL_CHIAVE`). `scegliStrada`: anagrafica prima diretta (1 tentativo,
  15 s), poi dal worker; `instrada()` gira sul worker anche i `next` dell'archivio ufficiale, che portano l'host diretto.
  `ARPA_DIRETTO=https://10.255.255.1` finge il blocco. Collaudo 24/10 nei tre casi (diretta 12 s, worker 26 s, nessuna
  strada → uscita 1 in 17 s): 21-23/10 identici al PC, 0 mm diversi.
- **Dati corretti da:** ~12 giugno 2026
- **Temperatura/vento (dall'11/8/2026):** gli STESSI record orari della pioggia portano `air_temperature`, `wind` e `gust_of_wind` — zero richieste extra. ⚠️ **wind/gust GIÀ in km/h** (validato contro Open-Meteo su stazioni di pianura: rapporto ~0,9; fosse m/s sarebbe ~3,6) → nessuna conversione. ⚠️ **Niente backfill**: l'API tiene solo ~2 giorni pieni (verificato: 9/8 pieno, 5/8 vuoto) — t/w partono dal 9/8/2026 e crescono un giorno al giorno
- **Bug noto:** API manutenzione alle 04:00 UTC → run delle 06:00 CEST spesso fallisce
- **ATTENZIONE:** `cum_rain_24h` è una finestra mobile, NON un totale giornaliero. MAI usare `max(cum_rain_24h)` perché trascina pioggia nel giorno dopo. L'API conserva solo ~1 record per stazione per i giorni vecchi, quindi `sum(cum_rain_1h)` funziona solo quando ci sono i record completi (24/giorno).

### Emilia Romagna
- **Fonte:** ARPAE REST `apps.arpae.it/REST/meteo_giornalieri`
- **Collect:** `collect-emilia.js`
- **Formula:** `precipitazione_cumulata_giornaliera` con `dateKeyPlusOne()` — l'API ARPAE ha offset +1 giorno (chiave 20260606 = dati meteo del 5 giugno)
- **Orari:** dal 27/10/2026 sveglia Cloudflare alle 4:30, 5:45 e 7:15 italiane + 2 cron GitHub di riserva (08:05 e 12:05 UTC); erano 7 run/giorno. Ogni giro aggiorna anche ieri (misurato il 26-27/10: ARPAE ha già ieri al giro delle 4:30 e aggiunge al massimo 3 stazioni nel primo pomeriggio)
- **Dati corretti da:** 5 giugno 2026
- **`EMILIA_ESCLUSE` (6 agosto 2026):** le **8 stazioni che l'ARPAE ospita in provincia di GENOVA** (5317 S. Stefano d'Aveto, 5565 Alpe Gorreto, 5566 Barbagelata, 5561 Cabanne, 5568 Rovegno, 3080 Torriglia, 3077 Diga del Brugneto, 12307 Loco Carchelli) **non entrano più nel rendering Emilia**: sono le "gemelle", cioè gli stessi pluviometri che OMIRL pubblica in `data/liguria` da 0 a 460 m di distanza. Due motivi: (a) con Emilia e Liguria selezionate insieme venivano disegnate due volte e pesate due volte nell'IDW (461 stazioni invece di 469, verificato); (b) su **Alpe Gorreto il feed ARPAE ha dato 0 invece di "dato assente" per quattro giorni di fila** (29/6→2/7/2026) mentre OMIRL misurava 50,8 · 28,2 · 9,8 · 1,1 mm. Il dato non si perde: quei punti restano in mappa via OMIRL, che per loro è la fonte di casa. Emilia da 271 a 263 stazioni. ⚠️ **Le gemelle restano lo strumento di verifica ai check periodici** — si confrontano i FILE `data/emilia` e `data/liguria`, che sono intatti: l'esclusione è solo nel rendering.
- **Temperatura/vento (dall'11/8/2026):** `t`/`w` dagli aggregati già presenti
  nella stessa chiamata (`temperatura_minima/massima_giornaliera_2m`,
  `velocita_vento_media_...` e `massima_raffica_..._10m`, m/s → ×3,6), zero
  richieste extra. ~200 stazioni con t, ~40 col vento su 315. L'API conserva
  ~15 giorni: backfill solo dal 27/7/2026 (`backfill-meteo-emilia.js`).
- **ATTENZIONE:** l'ARPAE copre 12 stazioni fisicamente in territorio toscano (provincia FI/PT/LU/MS), quasi tutte lungo il crinale appenninico. Nomi non sempre corrispondono a SIR/CFR (es. "Passo delle Radici" vs "Passo Radici"). Queste 9 duplicavano stazioni Toscana rimaste bloccate a 0mm ed erano state rimosse da `TOSCANA_STATIONS` (bug #14) prima ancora di scoprire e risolvere il problema alla radice passando a SIR.

### Veneto
- **Fonte:** ARPA Veneto XML
- **Collect:** `collect-veneto.js`
- **Formula:** `max(vals)` su cumulativi giornalieri con reset a mezzanotte
- **Orari:** dal 27/10/2026 sveglia Cloudflare alle 4:30 italiane + 2 cron GitHub di riserva (04:10 e 12:10 UTC); erano 6 run/giorno. Ogni giro aggiorna anche ieri. ⚠️ La riserva del mattino serve: il file di ieri esiste già (scritto come «oggi» il giorno prima) e il guardiano, che guarda solo se il file c'è, un ieri incompleto non lo vede. **Dal 27/10/2026 (fase 2) ogni XML di stazione si scarica una volta sola** e serve sia a oggi sia a ieri (`recordIeri`): ~190 richieste a giro invece di ~380, file identici (provato in locale vecchio contro nuovo)
- **Dati corretti da:** 4 giugno 2026
- **Temperatura/vento (dall'11/8/2026):** gli STESSI XML di stazione portano sensori `TEMP` (°C, letture ogni 30') e `VVENTO` (**m/s → ×3,6**, nessuna raffica) — zero richieste extra. ⚠️ La regex dei DATI per t/w ammette il segno meno (le temperature possono essere negative; quella della pioggia no). Finestra XML ~2,5 giorni → niente backfill: t/w dal 9/8/2026
- **⚠️ Pioggia falsa tolta a mano (2/11/2026, scheda 109 ter): Castana (Arsiero, VI, id `68`), 29,8 mm il 30/10**, con
  gli 8 vicini entro 15 km a 0 (Brustolè a 3 km) e il resto del Veneto al massimo a 0,4. L'XML di ARPAV il giorno non lo
  aveva più; la stessa rete ripubblicata su MeteoHub (`dpcn-veneto`, letture da 5 minuti) li mette tutti fra le 10:20 e
  le 11:25 italiane, 2-3 mm ogni 5 minuti regolari, con temperatura e umidità di un giorno asciutto: sembra una prova di
  taratura. Tolta dal file del 30/10 (assente, non zero: 185 → 184). Il collector riscrive solo oggi e ieri e
  `check-gaps-nord` stima solo i giorni interi: non torna.
  - **Filtro automatico dei picchi isolati: SCARTATO (sua decisione, 2/11/2026).** La proposta del check 9 del cloud era
    `togliPicchiFalsi` di MeteoHub (lì scatta da 200 mm) con soglia 20 mm e vicini della stessa rete tutti sotto 1 mm
    (2 entro 5 km o 3 entro 15 km), in `writeDay` di Ticino e Veneto. Il cloud l'aveva provato solo su settembre e
    ottobre. Su tutto lo storico reale (18/3-1/11/2026, 2.317 giorni-rete, 13 reti del nord) prende **32 casi, quasi
    tutti temporali d'estate** (Bagolino 6/8 107,6 mm con la rete a 56, Branzi 9/8 67,2 con la rete a 28,6); in Ticino e
    Veneto 5: Biasca, Castana e tre probabili temporali veri (Malga Campobon 28/6, Gallio 29/6, Lonigo 31/7). L'unica
    variante sicura, «e tutto il resto della rete sotto 3 mm», in Ticino e Veneto prende solo Biasca e Castana: per due
    casi in 5-7 mesi, trovati dal check periodico e tolti a mano in due minuti, non vale un pezzo in più (regola 10).
    Al nord quella variante segnala anche Cursolo 7/6 e Monte Malanotte 19/7 (Piemonte; Malanotte anche 18/7 con
    136 mm e i vicini a 0), Mangona 13/9 e Campagrina 10/10 (Toscana): non controllati, da guardare se ricapita.

### Trentino
- **Fonte:** Meteotrentino API
- **Collect:** `collect-trentino-gh.js`
- **Formula:** `PrecTotale` diretto dall'API
- **Orari:** dal 27/10/2026 sveglia Cloudflare alle 0:45 e 4:30 italiane + 2 cron GitHub di riserva (12:20 e 23:30 UTC); erano 7 run/giorno + aggiorna ieri (il cron `30 22 UTC`, aggiunto il 22 luglio 2026, mira le 00:30 locali per raccogliere il giorno appena chiuso senza aspettare il primo run del mattino)
- **Dati corretti da:** 6 giugno 2026
- **Temperatura (dall'11/8/2026):** `Minima`/`Massima` sono aggregati ufficiali GIÀ nella stessa risposta (t su ~104/109 stazioni), zero richieste extra; backfill 6 giorni (`backfill-meteo-trentino.js`, dal 5/8). ⚠️ **Niente vento**: l'API ha solo `vento_max` (raffica) senza la media, e il grafico disegna la media — da riconsiderare se l'API cambiasse
- **Umidità e vento medio (dal 18/8/2026)** da `getLastDataOfMeteoStation`, una chiamata per stazione (copre solo ieri e oggi). **Dal 27/10/2026 (fase 2 dell'alleggerimento) si chiamano solo le stazioni che l'inventario `sensoriStazioniGeoJson` dà con vento o umidità** (50 il 27/10, dentro tutte le 45 viste nei file; se l'inventario non risponde, tutte come prima) **e una volta al giorno** (`lib-meteo-una-volta.js`: primo giro dopo le 3 italiane che trova ieri con u/w su meno di 30 stazioni). Da ~104 chiamate a giro a ~48 al giorno, file identici
- **ATTENZIONE:** `getValoriAggregatiGiornoJson` pubblica l'aggregato di un giorno **solo a giornata conclusa** — durante il giorno i record per la data odierna non esistono proprio (verificato il 22 luglio 2026 alle 15:15: l'API si fermava al 21). Il file di un giorno viene quindi creato dal ramo "aggiorna ieri" del primo run dopo mezzanotte, non durante il giorno stesso. Il collector NON deve ripiegare sul "giorno più recente disponibile" per riempire il file di oggi: era il bug #19.

### Alto Adige
- **Fonte:** Meteo BZ API (solo dati odierni)
- **Collect:** `collect-altoadige-gh.js`
- **Formula:** `sensorValue` (cumulato dalla mezzanotte) con merge MAX
- **Orari:** dal 27/10/2026 le chiusure (23:10 e 23:40 italiane) e il giro delle 4:30, che ricalcola il meteo di ieri a giorno intero, li lancia la sveglia Cloudflare; GitHub tiene 2 cron di riserva (04:25 e 21:05 UTC). Erano 7 run/giorno — il run di chiusura è stato anticipato dalle 21:55 alle **21:05 UTC** il 22 luglio 2026 (bug #18): i cron di GitHub slittano di 40-70 minuti e quello serale atterrava sistematicamente dopo mezzanotte CEST
- **Dati corretti da:** 4 giugno 2026
- **Temperatura/vento (dall'11/8/2026):** valley.json ha solo il valore istantaneo → min/max/media dalle **timeseries a 10 minuti** dell'Open Data provinciale (`daten.buergernetz.bz.it/services/meteo/v1/timeseries`, sensori LT/WG/WG.BOE, timestamp in ORA LOCALE, interrogabili sul passato). **Dal 27/10/2026 si calcola solo ieri, a giorno intero, una volta al giorno** (`lib-meteo-una-volta.js`: primo giro dopo le 3 italiane che trova ieri con t su meno di 40 stazioni, di norma le 4:30 della sveglia): ~228 richieste al giorno invece che a giro. Fino ad allora ogni run ricalcolava ieri+oggi, e «oggi» si riempiva solo dalla sera (ore ≥20). Tutto in un try: un guasto non tocca la pioggia. ⚠️ L'endpoint rifiuta le raffiche di richieste: nel collector c'è un retry con pausa 1,5s (52/57 transitori al collaudo, 57/57 col retry). Backfill `backfill-meteo-altoadige.js` dal 27/6
- **ATTENZIONE:** il cumulato dell'API riparte da zero a mezzanotte, ma il reset non è istantaneo. Un run che scivola oltre mezzanotte può leggere ancora i totali di ieri e scriverli nel file di oggi, dove il merge MAX li congela per sempre. Dal 22 luglio 2026 il collector ha una **guardia**: se il file del giorno non esiste ancora e il payload somiglia troppo a quello del giorno precedente (con somma > 0), salta la scrittura. **Dal 5 agosto 2026 la somiglianza si misura sulle sole stazioni BAGNATE** — pioggia in almeno uno dei due giorni — con soglia 60% e minimo 5 stazioni: contando tutte le stazioni, in una giornata quasi asciutta gli zeri identici per forza nascondono la contaminazione (terza recidiva, 30 luglio). Vedi bug #18.

### Toscana
- **Fonte:** SIR Toscana (Servizio Idrologico Regionale) `sir.toscana.it/monitoraggio/stazioni.php?type=pluvio` — coordinate/quota da CFR Toscana `cfr.toscana.it/monitoraggio/actions.php` (action=PLUVIO, affidabile solo per i metadati)
- **Collect:** `collect-toscana-sir.js` (sostituisce `collect-toscana-gh.js`, dismesso il 12 luglio 2026 — vedi bug #14)
- **Formula:** Δ24h (finestra mobile) da SIR. Merge: vince SEMPRE la lettura più recente dello stesso giorno (mai `max()` tra run diversi — trascinerebbe pioggia del giorno precedente in avanti, stesso bug di Piemonte `cum_rain_24h`), con eccezione: se la lettura più recente è 0 ma la precedente era >0, si preserva la precedente (protezione glitch). **La protezione glitch NON si applica nei 3 run di chiusura serali** (`CLOSING=1` dal workflow, o ora locale ≥22): a fine giornata la finestra Δ24h copre quasi esattamente il giorno di calendario e uno 0 è un dato reale — tenerla attiva congelava la pioggia di ieri trascinata dai run del mattino (bug #17).
- **~~TOSCANA_STATIONS~~ → `TOSCANA_ESCLUSE` (21/8/2026, commit `44a2ef6a`).** Fino al 21/8 l'index aveva una WHITELIST di 165 nomi «distribuiti uniformemente», nata quando il feed CFR era rotto per metà rete (bug #14): il passaggio a SIR del 12/7 ha tolto la ragione, la lista è rimasta. Misurato il 21/8: **379 raccolte, 160 mostrate, 218 nascoste** (LU 47, FI 42, PI 26, MS 21, AR 18, PT 16, SI 15, GR 13, LI 13, PO 7), 129 con temperatura, 116 con umidità e 75 col vento, e 5 nomi della lista non davano più dati (Arezzo, Palazzo del Pero, Bocca d'Arno, Castellina Marittima, Ponte SR439). Stesso difetto tolto in Lombardia il 31/7 e in Piemonte il 17/8. Ora si mostra tutto meno **dodici pluviometri guasti**, esclusi **per ID e non per nome** (in Toscana quattro nomi sono doppi su stazioni diverse: Passo Radici, Villafranca, Pitigliano, Pieve S. Stefano). Toscana a 10 giorni: **160 → 367 stazioni**, vento da 67 a 138, max invariato.
- **La regola con cui sono scelti i dodici.** Il controllo automatico del lunedì (`check-stazioni-ferme.js`) accusa sotto il 15% della mediana dei cinque vicini ed è giusto che sia prudente: gira da solo. Qui la soglia è più severa, **sotto il 40%**, perché la scelta è a mano e perché di stazioni ora ce ne sono tante. Ma si esclude **solo se restano almeno tre pluviometri TOSCANI entro 10 km**. Paganico (20%), Orbetello e Argentario (0,0 mm) restano proprio per questo: entro 10 km non hanno nessuno che le sostituisca, e un dato dubbio è meglio di una macchia bianca.
- **⚠️ NON escludere i doppioni delle reti confinanti.** Ventidue stazioni di Lunigiana e crinale le pubblicano tutt'e due le ARPA (stesse coordinate in `data/toscana` e in `data/liguria` o `data/emilia`). Il 21/8/2026 sono state tolte «tanto ci sono già» e **Massa-Carrara è rimasta con 10 pluviometri su 32**, un buco bianco in cima alla regione: ogni regione carica SOLO la sua fonte, quindi chi guarda la Toscana da sola non vede niente della Liguria. Il doppio pallino compare unicamente con tutt'e due le regioni accese (37 coppie), e due pallini sovrapposti con lo stesso numero valgono meno di una provincia vuota. Se un giorno si vorrà togliere il doppione, va fatto **al momento del disegno guardando le regioni accese**, non nella lista di esclusione.
- **LIGURIA_ESCLUSE:** oltre a VIFRA c'è **PARAN (Parana)**, trovata il 21/8/2026 lavorando alla Toscana: 24,3 mm in 45 giorni, il 31% della mediana dei vicini (Calice al Cornoviglio, a 4,2 km, ne ha fatti 75). SIR pubblica la stessa stazione con lo stesso numero ed è esclusa anche lì (`TOS09001110`): non è un doppione da scegliere, è un pluviometro che non misura più.
- **TOSCANA_STATIONS (storico):** 165 stazioni curate (filtrate da 379) nell'index.html
- **Orari:** **dal 27/10/2026** le quattro chiusure (22:40-23:40 italiane) e il giro delle 4:30, che attacca a ieri vento e temperature complete, li lancia la sveglia Cloudflare; GitHub tiene 4 cron di riserva, le tre chiusure (21:00/21:20/21:40 UTC) e le 04:15. Storia: 9 run/giorno — i 6 regolari (00:15-20:15 UTC) + 3 run di chiusura ravvicinati (20:40, 21:00, 21:20 UTC = 22:40/23:00/23:20 CEST in estate). Essendo SIR consultabile solo per l'istante attuale (nessuna query storica), un run che scivola dopo mezzanotte per ritardi di GitHub Actions scrive sul giorno SBAGLIATO invece di chiudere quello giusto — successo il 15 luglio 2026: i 2 run di chiusura originari (21:35/21:50 UTC) sono partiti in ritardo di ~55 minuti, finendo entrambi dopo mezzanotte CEST. Anticipati a 20:40-21:20 UTC per lasciare più margine, e portati a 3 tentativi invece di 2 per aumentare le probabilità che almeno uno arrivi in tempo. Nota: come per Alto Adige, l'orario fisso UTC non è consapevole del cambio ora legale/solare — in inverno questi run cadranno un'ora prima in orario locale (21:40/22:00/22:20 CET), stesso compromesso già accettato nel progetto. Il passo "Commit e push" ora riprova fino a 5 volte (10s tra un tentativo e l'altro) anche in caso di conflitto push con altri workflow concorrenti (causa del fallimento del run delle 22:42 UTC del 15 luglio — la raccolta dati era riuscita, solo il push era stato rifiutato).
- **Dati corretti da:** 12 luglio 2026 (switch a SIR)
- **VENTO dal 21/8/2026 — e non viene dal SIR.** Il SIR pubblica pluvio, termo,
  igro, idro e nivo, il vento no; ma il **CFR** ha la pagina anemometrica
  (`cfr.toscana.it/monitoraggio/stazioni.php?type=anemo`, 864 record) che pero'
  da' solo l'istante attuale e i massimi di oggi e di ieri: niente serie storica,
  quindi la media giornaliera va costruita da noi. `campiona-vento-toscana.js` +
  `toscana-vento.yml` la leggono **ogni ora** e accumulano i campioni in
  `data/toscana-vento/<giorno>.json`; con almeno 20 letture si calcola
  `w:[media×3,6, raffica]`, dove la **raffica e' quella UFFICIALE** della colonna
  «Raff. Max ieri», scritta nel file del giorno a cui si riferisce. Poi
  `collect-toscana-sir.js`, nel suo passo t/u di ieri, attacca `w` al file di
  `data/toscana`: **un solo scrittore per cartella**, i due workflow non si
  pestano i push.
  - **Prima giornata piena, 20/8/2026**: 144 stazioni campionate, mediana 23
    campioni, **141 con `w`**. Prova di coerenza: la raffica ufficiale sta sempre
    SOPRA il massimo dei nostri campioni (26,7 contro 18,5 m/s il giorno della
    tempesta), che e' il rapporto giusto — campionando ogni ora il picco lo si
    manca, ed e' per questo che la raffica si prende dalla fonte.
  - ⚠️ **Il vento parte dal 20/8, la temperatura dal 10/8**: `METEO_HIST_FROM` e'
    una data per REGIONE e non basta, quindi c'e' `VENTO_HIST_FROM={toscana:…}`.
    Senza, il pannello prometterebbe vento dal 10/8.
  - Collaudato sul repo di test dal 19/8; li' il cron e' stato **spento** alla
    promozione, perche' il sito di test legge la Toscana da produzione.
  - **Dal 27/10/2026 (fase 3 dell'alleggerimento) il vento di ieri da MeteoHub si
    chiede UNA volta al giorno** (`lib-meteo-una-volta.js`, `SOGLIA_VENTO_MH` 100:
    primo giro dopo le 3 italiane che trova ieri col vento su meno di 100 stazioni,
    di norma le 4:30). Prima si chiedeva a ogni giro, chiusure serali comprese:
    3 richieste x fino a 9 giri. Misurato sulla storia di git (20-26/10): dal primo
    giro del mattino il vento di ieri non cambia piu' (una volta su sette una
    stazione in piu' nel pomeriggio, 143 → 144).
- **Temperatura (dall'11/8/2026):** pagina SIR `stazioni.php?type=termo` (una richiesta per run) — min/max di OGGI (progressivi, finalizzati dai run di chiusura) e di IERI (consolidati) su ~251 stazioni. Niente storico (pagina live-only come la pioggia) → t dal 10/8, cresce un giorno al giorno. **Niente vento** (non esiste su SIR; CFR `action=TERMO` risponde vuoto). ⚠️ **Trappola del parsing**: gli array della pagina hanno nomi offuscati e i nomi stazione contengono PARENTESI («Pisa (Fac. Agraria) (GPRS)») — una regex che si ferma alla prima `)` tronca la riga prima dei valori e fa sembrare la pagina VUOTA (errore commesso l'11/8 mattina, la pagina pareva avere 4 stazioni su 256: gli argomenti si estraggono per stringhe quotate, come già fa `parseSirValues`)
- **ATTENZIONE:** SIR non ha lat/lon nella tabella pubblica — si usano quelli del base-call CFR (stesso IDStazione tra le due fonti). Se CFR cambia ID o smette di rispondere, il collector si rompe anche se SIR funziona.
- **⚠️ VALORI CONGELATI DI UNA STAZIONE CHE MUORE (2/11/2026, scheda 109 ter).** Quando un pluviometro smette di
  trasmettere, il Δ24h del SIR resta fermo sull'ultima lettura e il collector lo scrive come pioggia del giorno, anche
  nelle chiusure (il merge tiene pure le stazioni sparite dalla pagina). Tolti a mano col suo sì quattro valori,
  assenti e non zero: **Croce Arcana** (TOS02000372) 16,7 mm il 27 e il 28/7, identici a ogni giro, la pioggia del
  26/7 (vicini 72 mm) ripetuta; **Campagrina** (TOS02000241) 27,6 il 10/10, identico dalle 2 alle 23:40 coi vicini a
  0, e 41,6 il 9/10, fermo fra 43,8 e 41,6 mentre i vicini scendevano da 88 a 6,6; assente dall'11/10. Visti sulla
  storia git dei file, giro per giro. Su 5 stazioni sparite in 113 giorni, 2 col valore congelato.
  - La pagina SIR ha l'ora della lettura (dodicesimo campo, «02/11 07.15»), che `parseSirValues` non legge: con quella
    si scarterebbe una lettura vecchia. **Non fatto (regola 10)**: due casi in quattro mesi, un giorno o due ciascuno,
    e nei 7 e 30 giorni la stazione morta resta fuori da sola per la copertura del 60%.
  - **Mangona** (TOS01000921) 25,6 il 13/9 coi vicini a 0 e l'umidità al 39% **resta**: lo strumento sale davvero
    durante la mattina, dopo giorni di pioggia in cui aveva segnato pochissimo (imbuto intasato che si svuota piano;
    9-13/9 56 mm contro 43 dei vicini). Toglierlo farebbe sbagliare le somme. Dal 14/9 fa il 68% dei vicini, sopra la
    soglia del 40% di `TOSCANA_ESCLUSE`. Nel Piemonte, sullo stesso giro: **Cursolo 7/6** 22,2 mm è falso (ARPA
    l'ha invalidato, archivio ufficiale null fino al 10/6), ma sta prima della frontiera del 12/6 e resta; Monte
    Malanotte è già esclusa dalla mappa.

### Liguria
- **Fonte:** OMIRL `omirl.regione.liguria.it/Omirl/rest/charts/{shortCode}/Pluvio`
- **Collect:** `collect-liguria.js`
- **Formula:** somma `dataSeries[0]` (incrementi orari) per le ore di ieri (mezzanotte-mezzanotte ora italiana)
- **Orari:** 2 cron (23:45 e 13:45 UTC) + la sveglia Cloudflare delle 4:30 italiane (erano 6 cron fino al 23/10/2026)
- **Dati corretti da:** 19 giugno 2026
- **⚠️ DA GITHUB PASSA DA CLOUDFLARE (dal 23/10/2026).** Dalla sera del 22/10 OMIRL non risponde piu' ai runner di
  GitHub (timeout gia' su `/stations/Pluvio`), mentre dal PC risponde in 0,3 s. ⚠️ **OMIRL RISPONDE SOLO DALL'ITALIA**,
  misurato il 23/10 sui centri dati Cloudflare: Roma (FCO) e Milano (MXP) si', Marsiglia (MRS) e Minneapolis (MSP) no,
  connessione appesa. Il primo giro da GitHub col worker e' fallito proprio cosi': chiamato dagli Stati Uniti, il worker
  girava a Minneapolis. Rimedio: `[placement] region = "aws:eu-south-1"` nel wrangler.toml, il worker gira SEMPRE vicino
  a Milano (risposta con `Cf-Placement: remote-MXP`). Scartato un Durable Object con `locationHint: 'weur'`: finiva a
  Marsiglia. Il workflow passa `OMIRL_TRAMITE` (worker `omirl-tramite.avventuremicologiche.workers.dev`, copia in
  `.github/cloudflare/omirl-tramite.js` + `omirl-tramite.wrangler.toml`, sorgente in `claudio\cloudflare-omirl\`, si
  pubblica con `npx wrangler@4 deploy` da li'; `/dove` con la chiave dice da che centro dati esce) e `OMIRL_CHIAVE` (secret su
  GitHub, segreto `CHIAVE` sul worker): il worker gira a OMIRL solo le GET sotto `/Omirl/rest/` con l'intestazione
  `X-Chiave` giusta. **Ogni giro sceglie la strada** (`scegliStrada`): la lista stazioni si chiede prima DIRETTA, e
  solo se non risponde entro 15 s dal worker; il resto del giro va dalla strada vincente e il log dice «Strada: ...».
  Cosi' il giorno che OMIRL sblocca GitHub si torna diretti da soli, e se blocca Cloudflare ma non piu' GitHub il giro
  va lo stesso. Senza le due variabili (dal PC) solo diretto. `OMIRL_DIRETTO=https://10.255.255.1` finge il blocco
  nelle prove. Collaudo 23/10 nei tre casi: diretta (106 s), diretta bloccata → worker (129 s), nessuna strada →
  uscita 1 in 16 s senza salvare; file del 22/10 identico a quello raccolto dal PC (198 stazioni, 0 mm diversi).
  Primo giro vero da GitHub riuscito il 23/10 alle 13:08 (run 39943960414: diretta in timeout, worker, 198 stazioni). Nello stesso giorno, per non ricascarci se il blocco
  era per il carico: giri da 7 a 3 al giorno (la pioggia di ieri dopo il primo giro non cambiava) e 3 richieste alla
  volta invece di 10 (`PARALLELE`): da ~3.800 a ~1.650 richieste al giorno. Se il worker risponde 504, OMIRL non
  risponde nemmeno a Cloudflare: si raccoglie dal PC (`node .github/scripts/collect-liguria.js`, OMIRL tiene ~69 ore).
- **ATTENZIONE CRITICA:** l'endpoint `/stations/Pluvio` restituisce solo l'ultimo valore 15-min. NON usarlo per totali giornalieri — cattura solo ~25% della pioggia. Usare SEMPRE `/charts/{shortCode}/Pluvio` che dà 69 ore di serie temporale oraria.
- Il collect fa ~199 chiamate API (una per stazione), processate a gruppi di `PARALLELE` (3 dal 23/10/2026, prima 10) con retry.
- **Temperatura/vento (dall'11/8/2026):** stessi shortCode, endpoint `/charts/{code}/Termo` (185 stazioni: serie media/min/max ogni 30', **~15 giorni di storia**) e `/charts/{code}/Vento` (57: velocità+raffica, **GIÀ km/h** — validato contro Open-Meteo, rapporto ~0,9). ~240 chiamate in più per run, stessi batch (~350 con l'umidità `/charts/{code}/Igro`). **Dal 27/10/2026 le liste e i grafici Termo/Vento/Igro si scaricano una volta al giorno** (`lib-meteo-una-volta.js`: primo giro dopo le 3 italiane che trova ieri con t su meno di 120 stazioni); agli altri giri solo la pioggia (~200 richieste invece di ~550) e t/w/u/wd restano dal file con `tieniMeteo`. Backfill `backfill-meteo-liguria.js` dal 28/7 (il massimo che i charts conservano; UNA chiamata per stazione copre tutti i giorni)

### Austria (in produzione dal 7 agosto 2026)
- **Fonte:** GeoSphere Austria Data Hub, `dataset.api.hub.geosphere.at`, dataset **`klima-v2-1h`**, parametro `rr`. **Licenza CC BY 4.0** («Fonte: GeoSphere Austria»), voce in `fonti.html`
- **Collect:** `collect-austria-geosphere.js` + `austria.yml` (dal 27/10/2026 sveglia alle 0:45 e 4:30 italiane + 2 cron GitHub di riserva, 23:40 e 13:10 UTC; erano 6 run/giorno). **~269 stazioni**
- **RICETTA:** somma delle ore `rr` sul giorno solare italiano, finestra `(start, end]` su timestamp di **FINE** intervallo, `MIN_ORE=20` — identica a Svizzera e OSMER. ⚠️ Il giornaliero ufficiale `klima-v2-1d` **non si usa**: è la finestra 06-06 UTC (Klimatag 07-07 solare), stessa trappola di `rre150d0`. Validata su due misure indipendenti: somma oraria contro giornaliero ufficiale (sfasamento 7 ore = 6 Klimatag + 1 fine intervallo, **379 giorni bagnati esatti su 380**, scarto medio 0,050 mm) e **correlazione oraria con MeteoSvizzera** su Rohrspitz↔Altenrhein a 5,0 km (r=0,822 a sfasamento 0 contro 0,32 a ±1 ora)
- **Storico: 365 giorni REALI dal primo giorno** (backfill `backfill-austria-geosphere.js`, girato in locale il 5/8, dal 5/8/2025). **Niente stime, niente fase beta** — a differenza del centro-sud, qui non ci sono buchi di ingestione
- **⚠️ DOPPIONI, il filtro senza cui tutto sballa:** GeoSphere pubblica quasi ogni sito **due volte**, `COMBINED` (serie storica unita, id basso) e `INDIVIDUAL` (strumento fisico, id alto), stessi valori. **189 doppioni su 469.** Il collector deduplica per **distanza (<500 m), non per nome** — «St.Jakob» e «St. Jakob» differiscono per uno spazio. A parità si tiene la COMBINED
- **Vantaggi rispetto alle altre fonti:** una sola richiesta copre tutte le stazioni; le query storiche rispondono su qualsiasi data (auto-riparazione D-3..D-30 gratis, D-10 fino al 26/10/2026, un run fallito non perde dati); e **l'anagrafe pubblica la QUOTA**, cosa che Piemonte, OSMER e MeteoHub non fanno → il filtro dislivello di `check-confini.js` funziona sul confine Alto Adige↔Tirolo, il confronto più stringente dopo le gemelle
- **In mappa:** `dataSource:'austria'`, `loadAustriaRegion` (fonte unica, loader semplice come la VdA), anagrafe da file recente (`loadAustriaStations`). **Bordo TRATTEGGIATO** come la Svizzera ed **esclusa dalla vista di apertura**: si spinge a 17,2°E e includerla trascinerebbe l'inquadratura fino all'Ungheria. Prima voce della tendina mobile (l'estero in cima)
- **Confine:** `austria-confine.geojson`, BEV via data.gv.at, 4.661 vertici, 90 KB. ⚠️ **CC BY-SA 2.0 AT**, diversa dai dati di pioggia: il file è una nostra semplificazione, quindi resta BY-SA ed è dichiarato in `fonti.html`
- **Ha ripagato prima di entrare in mappa:** al primo run ha trovato la terza recidiva del bug #18 (Alto Adige 30/7), dando le stazioni di confine a 0 mentre il nostro file dichiarava pioggia. **Prima volta che una rete estera fa da controllo a una nostra regione**
- **Cron di chiusura `40 22 * * *` (00:40 italiane)**: il giorno solare italiano chiude alle 22:00 UTC e l'API è quasi in tempo reale, quindi 40 minuti dopo il totale di ieri è definitivo. Senza, il primo run utile sarebbe quello delle 03:10 UTC che coi ritardi di GitHub diventa ~05:00: tutta la notte senza "ieri" in mappa. ⚠️ **La prima notte (6→7/8) GitHub l'ha semplicemente saltato** e il file di ieri è comparso alle 03:37 italiane: il rimedio è giusto ma il collaudo è ancora da fare
- **Temperatura/vento (dall'11/8/2026):** `parameters=rr,tl,ff,ffx` nella stessa chiamata (zero richieste extra), ogni run ricalcola il giorno intero. Backfill `backfill-meteo-austria.js` dal 2/7
- **Il collector del repo di TEST resta attivo**, come per la Svizzera: il sito di test legge l'Austria dal proprio repo

> ⚠️ **COME SI FA UNA PROMOZIONE, se ne arriva un'altra — NON si copia `index.html` dal test.**
> Alla promozione dell'Austria la prod aveva tre cose che il test non ha (evento
> `analisi_regione` corretto il 4/8, mappatura dello storico svizzero, `EMILIA_ESCLUSE`) e
> una copia in blocco le avrebbe cancellate. Si portano i pezzi uno per uno. Trappole viste
> sul campo, tutte e tre lo stesso giorno:
>
> 💥 **È SUCCESSO DAVVERO il 10/8/2026, ed è costato un difetto in produzione per mezza
> giornata.** La promozione della Francia (commit `3e74625e`) ha copiato `index.html` dal
> test con `sed 's/Nord-Test/Nord/g'` e ha cancellato `EMILIA_ESCLUSE`, aggiunto tre giorni
> prima: le 8 gemelle liguri sono tornate doppie nel rendering Emilia, zero falso di Alpe
> Gorreto compreso. Nessun errore, nessun test rosso — una riga in meno e basta.
> **Rimedio strutturale applicato lo stesso giorno**: `EMILIA_ESCLUSE` è stata messa
> ANCHE nel repo di test, così una copia in blocco non può più cancellarla. La regola resta
> «non si copia in blocco», ma adesso non è più l'unica difesa.
> **Come si verifica una promozione, in dieci secondi**: `git show <commit-prima>:index.html`
> e confrontare il conteggio delle chiavi prod-only (`EMILIA_ESCLUSE`, `HIST_RAW_BY_REGION`,
> `analisi_regione`) con quello del file nuovo. Se un numero scende, la copia ha mangiato
> qualcosa.
> 💥 **E NON ERANO UNA, ERANO TRE — scoperto il 13/8/2026 guardando i dati GA4.**
> La copia in blocco del 10/8 aveva annullato anche le due correzioni GA del 5/8
> (commit `2a1b38a5`), cancellando `getSelectedValues()` da entrambi i repo:
> `analisi_regione`, `share_map` e `share_image` sono tornati a mandare le
> regioni ESPANSE invece della scelta dell'utente. Di `EMILIA_ESCLUSE` ci si
> accorse in mezza giornata perché si vedeva in mappa; **di queste no, per tre
> giorni, perché si vedono solo in GA4**: nel report Regioni la stessa mappa
> compariva sotto due etichette (`piemonte-vda` 10 condivisioni e
> `piemonte,valledaosta` 13, che sono la stessa cosa), e ogni analisi su una
> regione combinata contava DUE eventi invece di uno.
> **La lezione**: dopo una promozione, il conteggio delle chiavi prod-only va
> fatto anche sulle cose che non si vedono a schermo. Un difetto invisibile
> resta in produzione finché qualcuno non apre le statistiche.
> Rimesse il 13/8 in ENTRAMBI i repo, così una prossima copia non può ripetersi.
> - **Estrarre blocchi per numero di riga taglia i commenti a metà** → `SyntaxError: Unexpected token '*'`.
> - **Le dipendenze non si annunciano**: `quandoMappaDisegnata` vuole `baseTiles`, che in prod non esisteva.
> - ⚠️ **Il pezzo dimenticato è la CHIAMATA, non la funzione** (7/8, segnalato dall'utente:
>   «l'Austria non mostra le stazioni finché non schiaccio le date»). `loadAustriaStations`
>   era stata portata, il ramo `dataSource==='austria'` in `addDefaultMarkersForRegion` no:
>   l'Austria cadeva nel caso generale, leggeva `stations: []` e non disegnava nessun
>   pallino finché non si sceglieva un periodo (quello è `loadAustriaRegion`, altro ramo,
>   e funzionava). **Il codice c'era tutto, mancava chi lo invocava** — la firma peggiore,
>   perché una funzione morta non dà nessun errore.
>   **Come si trova in dieci secondi**: contare le occorrenze della chiave regione nei due
>   `index.html` — 25 in prod contro 26 nel test, e la differenza era esattamente quella riga.
>   Da fare alla fine di ogni promozione, prima di dichiararla conclusa.

### Francia intera (v7.0, in produzione dal 10 agosto 2026)

**Tutta la Francia metropolitana nelle 13 régions ufficiali**, sviluppata e collaudata
nel repo di test il 9/8 e promossa il giorno dopo. Fonte: **Météo-France, API Paquet
Observations** (`public-api.meteofrance.fr/public/DPPaquetObs/v2`), Licence Ouverte
2.0 Etalab, attribuzione «Météo-France». Studio fonti in `francia-rapporto-fonti.md`
(cartella claudio).

- **Collect:** `collect-francia-meteofrance.js` + `francia.yml` (dal 27/10/2026 sveglia alle 0:45 e 4:30 italiane + 2 cron GitHub di riserva, 23:55 e 13:25 UTC; erano 4 run/giorno, chiusura
  22:50 UTC). 95 pacchetti dipartimento a giro (~5-6'), **1.818 stazioni in anagrafe,
  ~1.700 con `rr1`**, cartelle `data/francia-<régione>` (13). ⚠️ `id-departement` SENZA
  zero (5, non 05); la **Corsica è `20` unico**. ⚠️ Nel passo commit-e-push del workflow
  il glob va SENZA apici (`git add data/francia-*`): quotato arriva a git letterale.
- ⚠️ **Chiave**: secret `METEOFRANCE_API_KEY` in ENTRAMBI i repo (account dell'utente
  sul portale portail-api.meteofrance.fr, **scade il 9/8/2028** con l'abbonamento).
  401 improvvisi = chiave scaduta: si rigenera dal portale e si aggiornano i secrets.
- **RICETTA:** il RR giornaliero francese è la finestra 06-06 UTC (definizione
  ufficiale) → somma ore `rr1` sul giorno solare italiano, timestamp di FINE
  intervallo, `(start, end]`, MIN_ORE=20 — identica a Svizzera/Austria/OSMER.
  Quadratura contro il RR ufficiale consolidato: **99,6% esatta entro 0,2 mm su
  9.763 giorni bagnati** (2026, 6 dipartimenti alpini). Il pacchetto orario contiene
  **~5 giorni** (la doc dice 24h): auto-riparazione D-1..D-4 gratis a ogni run.
- **Storico: 369 giorni REALI** (1/8/2025→4/8/2026) dai CSV orari `BASE/HOR` di
  meteo.data.gouv.fr — ⚠️ SOLO il mirror S3 OVH (`meteofrance.s3.sbg.io.cloud.ovh.net`):
  `object.files.data.gouv.fr` è fermo a giugno 2026 e il `last_modified` dell'API
  data.gouv mente. Niente stime, niente beta.
- **In mappa:** 13 voci «… (FR)», `dataSource:'francia'` condiviso + `dataDir` per
  cartella, loader/anagrafe parametrizzati per régione, bordo tratteggiato ed
  esclusione dalla vista di apertura **a prefisso** (`rk.indexOf('francia')===0`),
  Corsica↔Sardegna selezionabili insieme. Confini `francia-<x>-confine.geojson`
  (IGN via france-geojson, Licence Ouverte, ~70 m) — ⚠️ il feature DEVE avere
  `properties.reg_name`, il filtro di setRegionBorder cerca quello.
  Residuo noto: **Bretagna 104% di larghezza su telefono** (~7px per lato, dentro
  la banda morta della centratura) — accettato il 9/8.
- **Temperatura/vento (dall'11/8/2026):** dagli stessi pacchetti, `t`/`tn`/`tx` (⚠️ KELVIN → `v>100 ? v-273.15`) e `ff`/`fxi` (m/s ×3,6). Backfill `backfill-meteo-francia.js` dal 27/6, dal mirror S3 OVH (~99% stazioni con t, vento su ~1/4).
- **Allarme fonti:** le 13 cartelle sono in `check-fonti.js` con soglia 4 giorni.

### Svizzera intera (v6.0, in produzione dal 3 agosto 2026)
- In mappa UN SOLO bottone **"Svizzera (CH)"** (regione `svizzera`, ha sostituito "Ticino (CH)"): sotto, DUE fonti unite da `loadSvizzeraRegion` con chiavi prefissate `ti:`/`ch:` — il Ticino resta OASI (cartella `data/ticino`, collector sotto), il resto del paese è **MeteoSwiss OGD** (`data/svizzera`). ~307 stazioni totali; fonte/chip/crediti "OASI Ticino + MeteoSvizzera"
- **Fonte MeteoSwiss:** collezioni STAC `ch.meteoschweiz.ogd-smn` (SwissMetNet) + `ogd-smn-precip` su `data.geo.admin.ch`, CSV per stazione, coordinate già WGS84, licenza **CC BY 4.0** («Fonte: MeteoSvizzera», voce in fonti.html)
- **Collect:** `collect-svizzera-meteoswiss.js` + `svizzera.yml` (dal 27/10/2026 sveglia alle 4:30 e 5:45 italiane + 2 cron GitHub di riserva, 07:40 e 12:40 UTC; erano 5 run/giorno).
  **Dal 27/10/2026 (fase 3) i giri del MATTINO si saltano se ieri e' gia' completo**: ogni giro scarica per ogni
  stazione il file con l'anno intero (~1 MB per le SMN, Lugano 970 KB: oltre 150 MB a giro). Il giro che calcola ieri
  scrive `completo: true` nel file se il file dell'anno arriva gia' alla fine di ieri (senza `_now`) per almeno il 95%
  delle stazioni; prima delle 12 italiane un giro che trova quel segno non scarica niente (0 richieste). Il giro del
  POMERIGGIO (cron 12:40 UTC) rifa' sempre tutto e prende le correzioni di MeteoSvizzera, e il mattino dopo ieri si
  ricalcola come altro ieri: il file finale e' lo stesso di prima. Misurato sulla storia di git (16-26/10): dopo il
  primo giro del mattino ieri cambia su 0-7 stazioni su 270, al massimo 1,1 mm (ZWE 1,1 → 0). Non si salta con
  `DATE_OVERRIDE` ne' con giorni da riparare. **270 stazioni** (filtro inventario `rre150h0` attivo; il canton TI resta escluso — lo copre OASI — TRANNE la whitelist `TI_SMN_DA_OASI`, vedi sotto)
- **Le 9 stazioni SMN del Ticino/Moesano si prendono da qui dall'11/8/2026** (whitelist `TI_SMN_DA_OASI`: MAG Cadenazzo, CEV Cevio, COM Comprovasco, OTL Locarno-Monti, LUG Lugano, PIO Piotta, ROE Robièi, SBE S. Bernardino, SBO Stabio): sono di PROPRIETÀ MeteoSvizzera e le condizioni d'uso OASI vietano di ripubblicarne i grezzi — le pubblicavamo via data/ticino da mesi senza accorgercene (trovato al censimento sensori t/w). Migrazione con `migra-ti-smn-da-oasi-a-ogd.js` (una tantum, 11/8): pioggia OGD su tutto lo storico dentro data/svizzera (valori verificati identici a OASI: SBE 16,4=16,4, Lugano 3,5=3,5, Piotta 8,7=8,7 sul 26/7) e gemelle rimosse da TUTTI i file data/ticino (146 file, 1312 voci). SBE non è più un'esclusione: la vecchia costante `SVIZZERA_ESCLUSE` non esiste più. ⚠️ La whitelist è volutamente CHIUSA: la rete SMN in TI ha anche BIA/CIM/GEN e la rete precip altre 7 stazioni — non aggiungerle senza un check doppioni contro le OASI rimaste
- **RICETTA (validata 3/8 su 639 giorni-stazione, match al centesimo):** i giornalieri MeteoSwiss NON coincidono col giorno solare italiano (`rre150d0` = finestra 06-06 UTC, `rka150d0` = giorno di calendario UTC) → si sommano le ORE `rre150h0` (timestamp = FINE intervallo) sul giorno solare italiano, ricetta OSMER, MIN_ORE=20. `_h_recent` contiene già tutte le ore di ieri al mattino presto; `_h_now` (10 min) integra l'ultima ora
- **Auto-riparazione GRATIS D-3..D-30** (D-10 fino al 26/10/2026), giorni STIMATI compresi: `recent` copre l'anno intero (⚠️ solo l'anno corrente: a inizio gennaio dicembre non c'e'), i giorni mancanti si ricostruiscono senza richieste extra (come OASI, un run fallito non perde dati) → soglia allarme fonti 5 giorni (`SOGLIA_PER_REGIONE`)
- **Storico: 365 giorni di dati REALI dal primo giorno** — backfill una tantum dagli archivi `_h_historical_2020-2029` (script `backfill-svizzera-meteoswiss.js`, girato in locale: ~1 GB di download). Campo `backfill: true` nei file, source sempre `meteoswiss`
- **Confine:** `svizzera-confine.geojson` — Landesgebiet swissBOUNDARIES3D via `api3.geo.admin.ch` (find `bez=Schweiz`, sr=4326), semplificato 52k→5k vertici (~40 m), coi buchi di Campione d'Italia e Büsingen. Vista iniziale INVARIATA (`svizzera` esclusa dal `fitVistaIniziale`); stile = blu delle regioni italiane + bordo TRATTEGGIATO (velo rosso provato in due intensità e tolto il 3/8, decisione utente)
- **Grafico storico a doppia cartella**: tag per-stazione `_src` (`oasi`→`data/ticino`, `ms`→`data/svizzera`, vedi `histRegion` e `HIST_RAW_BY_REGION`)
- **Alias link condivisi:** `?r=ticino` apre la Svizzera (link pre-3/8 in circolazione)
- **Respiro confini:** unico `confPulse` 1,6s per tutti, sincronia esatta via `startTime=0` in `aggiornaConfPulse` (senza, la fase dipende da quando ogni confine riceve la classe; controfase provata e scartata)
- Sviluppato e validato lo stesso 3/8 nel repo di test (pilota), promosso in giornata su decisione utente. Il collector di test resta attivo (il sito di test legge `data/svizzera` dal proprio repo, come per VdA/Friuli)
- **`preview.jpg` rifatta il 3/8** con Italia+Svizzera a 30 giorni (2960 stazioni): scatto headless in finestra **1920×1008** a doppia densità, cioè già nel rapporto 1.91:1 dei social — si scala a 1200×630 senza tagli né fasce. Ricetta completa nel commento sopra `og:image`. `?v=20260803`

### Ticino (Svizzera)
- **Fonte:** OASI (Osservatorio Ambientale della Svizzera Italiana) `oasi.ti.ch/web/rest` — API REST pubblica, licenza libera con citazione fonte. ⚠️ **ECCETTO i dati MeteoSvizzera**: le condizioni d'uso OASI vietano di ripubblicarne i grezzi → dall'11/8/2026 il collector esclude anche `owner === 'MeteoSvizzera'` (9 stazioni, ~39 restanti), che arrivano da MeteoSwiss OGD via `data/svizzera` (vedi scheda Svizzera, whitelist `TI_SMN_DA_OASI`)
- **Collect:** `collect-ticino-gh.js`
- **Formula:** `resolution=d&parameter=Prec` — valore giornaliero GIÀ aggregato dall'API, nessuna formula. L'ultima lettura vince sempre (il dato giornaliero OASI è autoritativo).
- **~50 stazioni** utilizzabili (59 nel dominio meteo, escluse le 8-9 ARPA Lombardia/Piemonte già coperte dai nostri collector — filtro sul campo `owner`)
- **Coordinate:** l'API usa il sistema svizzero LV95 → conversione a WGS84 nel collector (formule approssimate swisstopo, ~1m di precisione)
- **Orari:** dal 27/10/2026 sveglia Cloudflare alle 4:30 italiane + 2 cron GitHub (00:30 e 09:30 UTC), con le richieste a periodi e la strada dal worker omirl-tramite (OASI non risponde più ai server di GitHub); prima 4 run/giorno — ogni run raccoglie IERI + ALTROIERI (consolidamento dei valori marcati "provvisorio"). Il giorno corrente non esiste lato API, e tanto la mappa lo esclude comunque (regola #3).
- **ATTENZIONE — pubblicazione tardiva del giornaliero:** OASI pubblica il totale giornaliero di ieri solo a metà mattina (~07:00-08:30 CEST, a rotazione per stazione; prima la riga esiste ma col valore VUOTO). Scoperto il 18 luglio 2026: al mattino presto la mappa mostrava "nessun dato per ieri" sul Ticino. Fix: se il giornaliero non è ancora pubblicato, il collector somma le letture da 10 minuti (`resolution=h`, disponibili in tempo quasi reale; scarto validato ~3% dal giornaliero ufficiale, accettate solo giornate con ≥120/144 letture) e i run successivi sovrascrivono col valore ufficiale.
- **QUERY STORICHE FUNZIONANTI** (unica fonte del progetto ad averle): qualsiasi giorno passato è interrogabile e i dati sono recuperabili retroattivamente — un run fallito non perde mai dati. Archivio: Airolo dal 2017, Lugano dal 2005 (varia per stazione).
- **Dati corretti da:** 18 marzo 2026 (backfill 120 giorni con dati reali di stazione, script `backfill-ticino.js` una tantum)
- **Confine cantone:** `ticino-confine.geojson` nel repo (da swissBOUNDARIES3D), caricato via `geojsonUrl` (meccanismo dedicato per confini non italiani in `setRegionBorder`)
- **Temperatura/vento (dall'11/8/2026):** parametri OASI `T`/`WS`/`WSgust` a 10 minuti (`resolution=h`), stessa ricetta delle altre reti (ore ≥20, m/s ×3,6). Solo **15 stazioni con T, 7 col vento** (censimento 11/8: le pluvio UCA non hanno altri sensori); se T non dà righe si saltano anche WS/WSgust. Backfill `backfill-meteo-ticino.js` dal 27/6
- **Validazione (16-17 luglio 2026):** allineamento calendario confermato con analisi di lag vs Open-Meteo (corr. 0.73-0.82 stesso giorno, ~0.1 a ±1g); coerenza interna verificata (somma 10-min vs giornaliero: scarto 3%); confronti di confine con Piemonte coerenti col microclima (la sponda ovest del Verbano è genuinamente più piovosa).
- Sviluppato e validato nel repo di test `Mappa-Precipitazioni-Nord-Test` (+ sito avventurepluvio-test.netlify.app), promosso in produzione il 17 luglio 2026.
- **⚠️ Pioggia falsa tolta a mano (2/11/2026, scheda 109 ter): Biasca Val Pontirone (`meteo_u_122`), 84,4 mm il 27/10**,
  unica stazione bagnata del Ticino, vicini tutti a 0 (massimo della Svizzera 0,4). Le letture OASI da 10 minuti: 0 fino
  alle 14:35, **83,9 mm in una lettura sola alle 14:45**, poi gocce da 0,1: manutenzione o secchio svuotato, non pioggia.
  Lo dava anche il giornaliero ufficiale, ancora «provvisorio» al 2/11. Tolta dal file del 27/10 (assente, non zero:
  40 → 39 stazioni). I giri non la rimettono: l'auto-riparazione rifà solo i giorni mancanti, stimati o sotto 30
  stazioni; la rimetterebbe solo un `DATE_OVERRIDE=2026-10-27` lanciato a mano. Il filtro automatico dei picchi isolati
  è stato scartato: vedi la scheda Veneto.

### Centro-Sud via MeteoHub (Marche, Umbria, Lazio, Molise, Campania, Puglia, Basilicata, Calabria, Sicilia, Sardegna)

**Beta PER-REGIONE dal 10/8/2026**: fuori dal beta Marche, Umbria, Campania, Calabria, Sardegna (mai un evento-buco in 30 giorni), Puglia, Basilicata e Molise (un solo evento vecchio, coperto). Restano in validazione **Sicilia e Lazio** (lista `BETA_REGIONS` in index.html, pillola gialla solo per loro). La rete di sicurezza gapfill resta attiva per tutte.
- **Fonte:** MeteoHub / Agenzia ItaliaMeteo (`meteohub.agenziaitaliameteo.it`), reti `dpcn-<regione>` — in larga parte le stesse reti regionali, CC-BY con citazione. Valori validati contro ARPA Lombardia: scarto medie 1-3%, max identici (pilota, luglio 2026)
- **Collect:** `.github/scripts/collect-meteohub.js` + `meteohub.yml` (dal 27/10/2026 sveglia alle 4:30 e 5:45 italiane + 2 cron GitHub di riserva, 11:50 e 17:50 UTC; erano 5 run/giorno: 02:20, 04:20, 07:20, 11:50, 17:50 UTC). Granularità VARIA per rete: il collector sceglie la serie più fitta e la somma, soglia completezza ≥85%. Finestra pubblica API ~10 giorni
- **Fase 3 dell'alleggerimento (27/10/2026): ieri e l'altro ieri in UNA richiesta, il meteo una volta.** Prima ogni giro
  chiedeva ogni prodotto un giorno per volta (11 reti x 2 giorni x 6 prodotti = 132 richieste, quattro giri al giorno).
  Ora `collectDue` fa una richiesta di pioggia per rete sui due giorni e li divide con la finestra di sempre (la serie
  piu' fitta si sceglie giorno per giorno, `serieMigliore`); le cinque del meteo si fanno DOPO, solo per i giorni senza
  `meteo_completo` nel file e con almeno 10 stazioni. `meteo_completo: true` lo scrive il giro che ha avuto tutte e cinque
  le risposte almeno 3 ore dopo la fine del giorno (`ORE_DOPO`); `writeDay` lo conserva ai giri che il meteo non lo
  chiedono, e t/w/u/wd restano dal file con `tieniMeteo`. Di solito il meteo e' il solo ieri: la stessa richiesta di un
  giorno di prima. Al giorno: ~67 richieste al giro delle 4:30, ~12 agli altri (prima ~532).
  **Due difese, il caso peggiore e' il giro di prima:** se la richiesta doppia cade (dopo i 3 tentativi) o per un giorno
  porta meno stazioni della soglia della rete (risposta tagliata senza errore), quel giorno si rifa' da solo
  (`collectDay` con `meteo: false`) e si tiene il piu' ricco. ⚠️ Un giorno sotto soglia per conto suo (Basilicata 26/10,
  50 su 55; Puglia 26/10, una stazione) costa quindi una richiesta in piu' a ogni giro, come prima.
- **La riparazione automatica arriva a 20 giorni con l'account (2/11/2026, scheda 109).** Prima riprovava da 3 a 9
  giorni indietro, la finestra pubblica; col token (`MH_TOKEN`) l'archivio e' aperto e ora arriva a 20
  (`RIPARA_FINO`, anonimo resta 9). Motivo: la Puglia del 26-30/10 (stime Open-Meteo intere 26-29, meta' il 30, oltre
  la frontiera) il 2/11 MeteoHub la stava ricaricando a pezzi: 26/10 132 stazioni ma 13 ore su 24, 27 e 28/10 una
  stazione sola, 29/10 9 ore, 30/10 17 ore. Coi file sotto l'85% di ore le stazioni si scartano e restano le stime;
  col 9 il 26/10 sarebbe uscito dalla finestra il 4/11. Si richiedono solo i giorni con stime o sotto soglia: il 2/11
  fra 10 e 20 giorni fa c'era solo la Sardegna del 15/10. Se il 27-28/10 non tornano, la strada e' il bollettino
  pluviometrico di ottobre della Regione (uscita attesa verso il 5/11, come quello di luglio) con
  `archivio\ripara-puglia-bollettino.js` del banco, come il 27/7.
  Misurato sulla storia di git (18-26/10): dopo il giro delle 4:30 pioggia e meteo di ieri non cambiano piu' (qualche
  stazione arpafvg). Provato in locale vecchio contro nuovo: 32 file su 32 identici, anche con la richiesta doppia fatta
  cadere (Marche) e tagliata a meta' (Sicilia); richieste 138 → 74 al primo giro, 19 al secondo. `collectDay` resta
  com'era per il ripiego del Piemonte. Un effetto in piu': una temperatura tolta da `pulisci-temperature.js` non torna
  piu' al giro dopo, perche' il meteo di quel giorno non si richiede.
- **Gap check:** `.github/scripts/check-meteohub-gaps.js` + `meteohub-gaps.yml` (dal 30/10/2026 sveglia alle 6:15 italiane, dopo i giri MeteoHub delle 4:30 e 5:45; il cron 08:40 UTC resta di riserva: partiva verso le 15:30 UTC, e la stima di un giorno perso arrivava a G+2 di pomeriggio) — rileva buchi totali e parziali (<90% della mediana), registro permanente `data/meteohub-gaps.json`, copertura Open-Meteo dopo la grazia (file interi `source: open-meteo-gapfill`, integrazioni parziali `om:true`). **`GRACE_DAYS = 2`**: il buco del giorno G viene coperto quando si arriva a G+2 (verificato nel codice il 4/8/2026 — la doc diceva ancora 3, scarto che porta a conclusioni sbagliate ai check: un file comparso a G+2 è una STIMA, non un recupero)
- **Misura della frequenza:** `.github/scripts/analizza-buchi-meteohub.js` (da lanciare a mano) — legge il registro e dà eventi per settimana, distanza fra un evento e l'altro e quota di giorni finiti a stime, rete per rete. È il numero su cui si decide l'uscita dal beta, al posto del "mi sembra che peggiori"
- **Dati reali da:** Marche/Umbria 13 luglio 2026 (16-17/7 blackout piattaforma, stimati), le altre 8 dal 19 luglio; prima backfill Open-Meteo (`source: open-meteo-backfill-*`) dal 14-20 maggio
- **Temperatura/vento (dall'11/8/2026):** prodotti `B12101` (temperatura, ⚠️ **KELVIN** → `v>100 ? v-273,15`, come la Francia), `B11002` (vento medio, m/s → ×3,6) e `B11041` (raffica, poche stazioni — null dove manca); tre query in più per (rete, giorno), stazioni agganciate per id lat_lon, serie più fitta per prodotto, ore coperte ≥20. Backfill `backfill-meteo-meteohub.js` (finestra API ~9 giorni, dal 2/8)
  - ⚠️ **VENTO MEDIO DIVISO PER 3,6 SU ALCUNE STAZIONI (trovato il 26/10/2026).** MeteoHub da' il `B11002` diviso per 3,6
    una volta di troppo su una parte delle stazioni (scoperto sul Piemonte confrontando con ARPA: rapporto 0,278 = 1/3,6;
    la raffica e' giusta). Al sud non c'e' un'ARPA accanto: si riconosce con il rapporto media/raffica (diviso 0,054,
    giusto 0,231, tarato sul Piemonte) e, dove la raffica manca, col modello Open-Meteo nello stesso punto (diviso 0,20,
    giusto 0,87). Le due prove concordano, e il rapporto e' lo stesso da agosto a ottobre. Tabella
    `.github/scripts/meteohub-vento.json`, letta da `lib-vento-meteohub.js` in `collect-meteohub.js` e
    `backfill-meteo-meteohub.js`: **12 stazioni ×3,6** (Calabria 8, Campania 1, Molise 1, Umbria 1, Basilicata 1) e **12 col vento NON usato** (fv 0: Cecita, Alife, Nocelle-Arvo, dove anche ×3,6 il rapporto non torna;
    Punta Stilo, Torriello, Campochiaro al confine; senza raffica Cerbara, SP302, Piediluco, Narni Scalo, Perugia Sede,
    Tor Vergata). Le altre restano come sono. Storico corretto in 511 file dal 2/8 (solo `w`/`wd` di quelle stazioni).
    Le stazioni siciliane SIAS hanno il vento basso rispetto al modello perche' misurano a 2 m: NON e' questo errore.
- **In mappa:** `dataSource: 'meteohub'`, fonte 'MeteoHub'; etichette **(beta)** e pillola gialla finché in validazione
- **ATTENZIONE:** i buchi di ingestione MeteoHub sono di piattaforma (16-17/7 tutte le reti; 27/7 Puglia quasi azzerata): la metrica che conta è la FREQUENZA degli eventi (registro), non la % di giorni persi. `meteohub-lombardia` era solo la rete di controllo del pilota e NON esiste in produzione
- **VERIFICA CONTRO IL BOLLETTINO UFFICIALE PUGLIA (6 agosto 2026)** — il bollettino pluviometrico mensile di luglio (uscito il 5/8, `protezionecivile.regione.puglia.it/bollettini-pluviometrici`) dà i valori giornalieri ufficiali stazione per stazione: è la verità a terra per il sud, come ARPA Socrata lo è per la Lombardia. Estrazione con **`pdftotext -table`** (già installato) — un estrattore artigianale sbaglia, perché il PDF ha due mappe ToUnicode in conflitto che producono ENTRAMBE lettere.
  - **Test di sfasamento prima di tutto** (la trappola di `rre150d0`/Klimatag): r = **0,914 a lag 0** contro 0,11 e 0,07 a ±1 giorno su 1.366 confronti. Allineati.
  - **dpcn è FEDELE**: su 12 giorni reali, totale **1.035,2 mm contro 1.038,9 ufficiali (−0,4%)**, rapporto mediano sulle stazioni bagnate **1,00**, picchi identici (26/7: 59,6 vs 59,8; 23/7: 25,8 vs 25,8). ⚠️ **Questo CORREGGE la conclusione tratta dal confronto lombardo** ("dpcn sotto-stima i rovesci del 15-25%"): in Puglia non succede. Quel difetto veniva dalle ~60 stazioni prealpine ARPA assenti da dpcn, non da dpcn come sistema.
  - ⚠️ **Il bollettino NON usa il giorno di calendario**: il 21/22 e il 23/24 la pioggia è attribuita al giorno prima su **22 stazioni dell'area di Bari**, tutte nello stesso verso, con la somma dei due giorni identica (706,2 vs 710,2 mm). È il **giorno pluviometrico 09-09** degli Annali. **Per la mappa vale il nostro dato**: copiare il bollettino su quei giorni peggiorerebbe. Il bollettino si usa per i CONFRONTI su più giorni e per i giorni in cui l'evento non tocca la mezzanotte.
  - **27/7/2026 RIPARATO col dato ufficiale** (`source: bollettino-regione-puglia`, `repaired: true`, campo `riparazione` con la provenienza; 116 stazioni con `src: 'bollettino-puglia'`, 14 restano stime — 13 nomi non accoppiabili + 1 `>>` mancante anche in Regione). **Da 99,8 a 229,9 mm, massimo da 4,6 a 29,2** (Panni): le stime Open-Meteo avevano cancellato un temporale vero sui Monti Dauni. Il 27 è esente dal dubbio della convenzione: Venosa (rete Basilicata, dato reale non perso quel giorno) dà 0,4 = bollettino 0,4, e Melfi/Venosa/Lavello sono a zero sia il 26 sia il 28. Registro `meteohub-gaps.json`: evento → `risolto-bollettino`.
  - **Conseguenza sulla scelta di fondo**: la Regione HA il dato del 27 che MeteoHub non ha → **la perdita è a valle della Regione** (catena DPC→MeteoHub), quindi un collector diretto pugliese avrebbe quel giorno. Il bypass ha senso, e la Puglia resta in beta all'11/8.
  - ⚠️ `isReal()` di `check-meteohub-gaps.js` è un test **per inclusione** (`source.startsWith('meteohub')`): un file riparato con un source diverso NON è considerato reale lì dentro — va bene (il giorno viene semplicemente saltato, `buco` risulta null), ma tenerlo a mente prima di riparare altri giorni. `check-fonti.js` invece è per **esclusione** (`/open-meteo/`) e conta il file riparato come reale, che è il comportamento voluto.

### Abruzzo
- **Fonte:** Open-Meteo, calcolato live dal browser (`dataSource: 'open_meteo'`) — assente dalle reti MeteoHub (404) e senza fonte regionale accessibile, per ora
- Nessuna cartella dati, nessun collector, nessuna sorveglianza (niente che possa "smettere di arrivare"). Fonte dichiarata come stime in mappa
- **PROVA in corso dal 27/10/2026 (togliere Open-Meteo):** `collect-abruzzo.js` + `abruzzo.yml` (2 giri, 04:55 e
  15:55 UTC, ogni giro rifa' ieri e i due giorni prima) scrivono `data/abruzzo/`: stazioni MeteoNetwork dentro la
  regione (CC BY 4.0) e stime del modello ICON-2I (CC BY 4.0) dai file aperti di MeteoHub, anonimi. Come si legge
  ICON senza librerie e' scritto in cima al collector. ⚠️ **La mappa di produzione NON legge questi file**: li
  legge solo la prova (`dataSource:'abruzzo_misto'`, pluviometri di confine + MeteoNetwork + stime), che sta in una
  patch fuori dal repo (banco di lavoro, `abruzzo-prova\`) e si guarda sull'anteprima di ramo `abruzzo`. ⚠️ Fuori
  dalla sorveglianza apposta: `check-campi.js`, `check-doppioni.js` e `check-stazioni-ferme.js` saltano la cartella;
  `check-fonti.js` e il guardiano non la conoscono. ⚠️ I file ICON restano ~8 giorni e MeteoNetwork ~10: un buco
  piu' lungo non si recupera

### Valle d'Aosta
- **Fonte:** Centro Funzionale Regione VdA (`presidi2.regione.vda.it`), dati reali di stazione — **dal 26 luglio 2026, al posto di Open-Meteo**
- **Collect:** `.github/scripts/collect-valledaosta-cf.js` + `valledaosta-cf.yml` (**dal 27/10/2026 sveglia alle 0:45 e 4:30 italiane + 2 cron GitHub di riserva, 23:50 e 12:15 UTC**; prima **5 run/giorno dal 26 agosto 2026**: chiusura del giorno **22:45 UTC = 00:45 italiane**, poi i mattutini ridondanti 02:30/04:30/07:30 UTC + 12:15. ⚠️ **La chiusura è stata aggiunta il 26/8** perché senza di lei il primo run era quello delle 02:30 che, coi ritardi di GitHub, atterrava alle **05:30 italiane**: dalla mezzanotte alle cinque e mezza la Valle d'Aosta non aveva «ieri» in mappa, ed è il difetto che l'utente ha visto quella mattina. Stessa finestra buia già chiusa per Austria (22:40) e Trentino (bug #19). Verificato che la fonte aggrega **in continuo** — alle 05:37 restituiva già il totale giornaliero di quel giorno stesso — quindi 45 minuti dopo la chiusura del giorno solare italiano il totale di ieri è completo. Le 22:40 sono dell'Austria e le 22:50 della Francia: qui si usa 22:45. I mattutini ridondanti restano perché con 2 soli cron i ritardi arrivavano a 3h38 — con 2 soli cron i ritardi di GitHub Actions arrivavano a 3h38 e il file di ieri restava mancante fino a metà mattina). Il vecchio `collect-valledaosta-gh.js`/`valledaosta.yml` (Open-Meteo) è stato **cancellato il 25/8/2026**: era spento dal 26/7 e restava lanciabile a mano, ma dentro aveva due trappole (dato assente scritto come 0, e sopra i 300 mm scriveva 0 invece di scartare). Sta nella cronologia di git
- **~70 stazioni** (66 Centro Funzionale + 6 Arpa)
- **Dati reali da:** 16 luglio 2026. Prima (17/5→15/7): **backfill Open-Meteo** sulle stesse coordinate (`source: open-meteo-backfill-vda`, script `backfill-openmeteo-pilota.js`). Si legge sempre dai file, nessuno switch runtime; la parte reale cresce di 1 giorno/giorno fino a 365
- **Temperatura/vento (dall'11/8/2026):** seconda chiamata `get_allparams_data` per stazione con `aggr:'hh'` → orari di tutti i parametri; prid 1 = Temperatura (°C), prid 10 = Velocità Vento Vett. (**m/s → ×3,6**, validato contro Open-Meteo: Mont-Fleury rapporto 3,81 ≈ 3,6; Donnas più alto del modello ma è la porta del föhn). Nessuna raffica → `w:[media,null]`. Backfill `backfill-meteo-valledaosta.js` dal 27/6 (una chiamata per stazione copre 45 giorni)
- **In mappa:** `dataSource: 'cf_valledaosta'`, `loadCFValdostaRegion`, URL dati da `PILOT_DATA_BASE`

### Friuli Venezia Giulia
- **Fonte:** ARPA OSMER (`www.meteo.fvg.it`), dati reali di stazione — **dal 26 luglio 2026, al posto di Open-Meteo** — + 5 stazioni ARPA Veneto di confine (Cadore/Comelico) per l'alta Carnia NW
- **Collect:** `.github/scripts/collect-friuli-osmer.js` + `friuli-osmer.yml` (dal 27/10/2026 sveglia alle 4:30 e 5:45 italiane + 2 cron GitHub di riserva, 09:35 e 16:35 UTC; erano 7 run/giorno). **Dal 27/10/2026 la finestra di 7 giorni** (8 date UTC per stazione, ~410 richieste) **si fa una volta al giorno**, al primo giro; gli altri fanno ieri e l'altro ieri (~150). «Già fatta oggi» = il file di tre giorni fa, che solo la finestra lunga riscrive, ha `collected` di oggi. `GIORNI_FINESTRA` a mano scavalca la regola. Il vecchio `collect-friuli-gh.js`/`friuli.yml` (Open-Meteo) è stato **cancellato il 25/8/2026**, insieme al gemello valdostano e per gli stessi due difetti (vedi Valle d'Aosta). Sta nella cronologia di git
- **~41 stazioni OSMER + 5 Veneto.** Dati reali da 18 luglio 2026; prima (19/5→17/7): backfill Open-Meteo (`source: open-meteo-backfill-friuli`). L'anagrafe del backfill è l'**UNIONE di tutti i file reali** (il feed OSMER pubblica un set variabile, 39-41 staz.)
- **Ricetta OSMER:** ore UTC dal CSV di `getStationData.php` (t=H_2) sommate sul giorno solare italiano; `MIN_ORE=20`; merge a copertura-crescente; cookie di consenso `meteofvg_cookie=1` obbligatorio
- **Due protezioni qualità nel loader `loadOSMERFriuliRegion`:** (1) **filtro copertura** — una stazione OSMER è mostrata solo se presente in ≥80% dei giorni REALI del periodo (nasconde le stazioni a serie oraria bucata, es. Forni di Sopra, San Pietro al Natisone, che davano una macchia secca falsa; l'IDW dei vicini copre); (2) **5 stazioni ARPA Veneto** (Sella Ciampigotto, Santo Stefano di Cadore, Costalta, Domegge, Casamazzagno) lette da `data/veneto`, non filtrate, caricate solo se il Veneto non è già selezionato (no doppioni). Fonte → 'ARPA OSMER FVG + ARPA Veneto'. **Dal 27/10/2026 SOLO COLORE** (suo: «sembrano un bug a prima vista»): campo `_fuori`, in `render` niente pallino e fuori da stazioni, massimo, media, minimo e classifica del Friuli; restano nell'IDW, dove aiutano l'alta Carnia. Stesso campo per i pluviometri di confine della prova Abruzzo. (Prima: pallino col grafico storico vuoto)
- **Temperatura/vento (dall'11/8/2026):** lo STESSO CSV orario ha le colonne `Temp. °C`, `Vento med km/h` e `Vento max km/h` (**già km/h**, dichiarato nell'intestazione) — zero richieste extra; la mappa oraria in cache è passata a oggetti `{mm,t,vm,vx}`. Backfill dal 27/6 lanciando il collector con `GIORNI_FINESTRA=45` (l'archivio risponde su qualsiasi giorno passato)
- **In mappa:** `dataSource: 'osmer_fvg'`, URL dati da `PILOT_DATA_BASE`

**LA RETE REGIONALE COMPLETA, dal 21 agosto 2026 — da 46 a 150 stazioni.**
L'archivio OSMER che leggevamo espone ~41 pluviometri; la stessa ARPA FVG
pubblica su **MeteoHub la rete `arpafvg` con ~137 stazioni al giorno**. Non sono
un'altra misura: sulle 31 presenti in entrambe le fonti (gemelle entro 500 m) i
valori del 20/8 coincidono **al decimo di millimetro, scarto medio 0,00 mm su 34
coppie**. E' la stessa rete letta da una porta piu' larga, e il confronto e' lo
stesso metodo delle gemelle ARPAE-OMIRL.
- **Impianto**: rete `arpafvg` in `collect-meteohub.js` (entra nei cinque giri
  gia' schedulati di `meteohub.yml`, zero cron nuovi) → `data/meteohub-friuli`;
  `loadOSMERFriuliRegion` unisce le due fonti come fa la Svizzera con OASI +
  MeteoSwiss, con tag per-stazione `_src` (`osmer`/`mh`) usato anche dal grafico
  storico (`histRegion` e la lista cartelle a due voci).
- **Doppioni**: si scartano le MeteoHub che cadono a meno di ~1 km da una OSMER.
  Tolleranza larga apposta: le due fonti arrotondano le coordinate in modo
  diverso, e due pluviometri veri non stanno mai cosi' vicini. **Vince OSMER**,
  che e' la fonte di casa.
- **Copertura**: il filtro all'80% vale per entrambe, ma per le MeteoHub il
  denominatore sono i **giorni CHIESTI**, non quelli restituiti — con i giorni
  restituiti una stazione presente in 8 giorni su 8 disponibili passerebbe anche
  in una finestra di 15, portando in mappa un cumulato di 8 giorni con
  l'etichetta di 15: la macchia secca falsa che il filtro deve impedire.
- ⚠️ **Storico dal 27/7/2026** (`FVG_MH_HIST_FROM`): e' il limite dell'archivio
  MeteoHub per questa rete anche con l'account. Sulle finestre piu' lunghe le 106
  stazioni nuove spariscono e restano le OSMER — coerente con la regola 1, e la
  coda si accorcia da sola un giorno al giorno.
- **NON e' nel registro di `check-meteohub-gaps.js`**, e non e' una
  dimenticanza: li' un buco si copre con stime Open-Meteo, che qui non servono
  perche' le ~41 OSMER coprono comunque il Friuli. Un buco MeteoHub costa
  densita', non una giornata asciutta inventata. In `check-fonti.js` invece c'e'
  (dir `meteohub-friuli`), cosi' se la fonte nuova muore lo si viene a sapere.
- **Misura del guadagno**, 14-20 agosto: **46 → 150 stazioni** e **massimo del
  periodo da 124,6 a 188,3 mm**. Il picco piu' forte della settimana stava su un
  pluviometro che non avevamo.
- ⚠️ Trieste molo F.lli Bandiera e' l'unica stazione fuori dal confine regionale
  (e' su un molo): la lascia fuori il disegno, non serve escluderla a mano.
- **Nessun beta**: a differenza del centro-sud, se MeteoHub salta un giorno qui
  c'e' gia' la rete di sicurezza OSMER.
- **La PAGINA `/friuli/` e' rimasta indietro tre giorni, corretta il 24/8/2026.**
  La mappa univa le due fonti dal 21/8, la pagina regione no: leggeva la sola
  `friuli-osmer` e calcolava media e classifica su **41 pluviometri** mentre il
  testo ne dichiarava «oltre 130». Ora `genera-pagine-regione.js` legge tutt'e
  due le cartelle e porta la stessa **regola delle gemelle** della mappa (unione
  per POSIZIONE, ~1 km, vince la prima cartella dell'elenco): 41 + 141 - 37 =
  **145 stazioni**. Media a 7 giorni da 63 a 77 mm, e il massimo del periodo da
  156,3 (Chievolis) a **224,6 mm (Meduno)**: di nuovo un pluviometro che la
  pagina non aveva. ⚠️ **Se si aggiunge una cartella a una regione, la regola
  vale gia' da sola**: e' generica, e sulla Svizzera (svizzera+ticino) scarta
  zero stazioni perche' le 9 sovrapposte furono sanate l'11/8.

### Slovenia (v8.0, in produzione dal 12 agosto 2026)

> ⚠️ **LA PAGINA `/slovenia/` NON C'E' PIU' (1/11/2026, sua decisione)**: la Slovenia resta sulla mappa, la pagina
> regione no. Vedi «Correzioni del 1/11/2026» in fondo.

**L'header non tiene piu' insieme titolo e badge: si danno il cambio** (12/8).
A riposo il titolo elenca le nazioni coperte, appena parte un'analisi il badge
le sostituisce con stazioni e fonte, e con «↩ Indietro» tornano. Lo fa
`setBadge()`, l'unico punto da cui si scrive il badge.
⚠️ **Perche', e perche' non bastava una media query.** Il badge e' centrato in
posizione assoluta e passa SOPRA il titolo. Misurato: con l'elenco esteso si
sovrapponevano da **910px** di larghezza, e da **1063px** con piu' reti
selezionate (badge «161 stazioni · ARSO Slovenia + ARPA OSMER FVG + ARPA
Veneto» = 306px contro i 153 di una regione sola). Il difetto **esisteva gia'
prima della Slovenia**, a 999px. Nessuna soglia lo chiudeva, perche' il badge
cambia larghezza con la regione scelta e il punto di rottura si sposta mentre
navighi. Alternandoli, la larghezza minima non e' piu' la SOMMA dei due ma il
piu' largo dei due: **da 1063px a ~790px**, e niente da tarare.
Scartate per strada: alzare la soglia a 900/1070 (nasconde l'elenco sui
portatili piccoli), abbassare il badge (restava sovrapposto), le bandierine
(⚠️ **su Windows le emoji 🇮🇹 diventano le lettere «IT»**: Segoe UI Emoji non
ha i glifi delle bandiere — con SVG in linea si vedrebbero, ma si risparmiavano
solo 178px e a 800px toccava ancora).
⚠️ **Trappola di misura, costata due diagnosi sbagliate**: `resetToStart()` esce
subito se `isLoading` e' acceso, ed e' voluto. Col pannello del browser nascosto
Chrome strozza il renderer, il «Calcolo mappa» sfora i 30s del timer di
sicurezza e ogni clic su Indietro sembra ignorato. **Non e' un bug del sito**:
prima di dichiararne uno, aspettare che lo spinner si spenga.

**ARSO** (Agencija Republike Slovenije za okolje), archivio mezz'orario ufficiale
delle stazioni automatiche. Licenza: riuso libero con **citazione obbligatoria
«Vir: ARSO»** (art. 14 della legge sul servizio meteorologico statale, UL RS
60/17) — voce in `fonti.html`. Sviluppata e collaudata nel repo di test il 12/8 e
promossa **lo stesso giorno**: i 365 giorni erano già reali dal primo minuto, non
c'era nessuna fase beta da aspettare.

> ⚠️ **La bocciatura del 5/8 era sbagliata, ma per un motivo istruttivo.** Quel
> giorno si guardò il solo campo `rr_val` del feed live (pioggia degli ultimi 10
> minuti, il bug #11 della Liguria) e si concluse che l'archivio era
> irraggiungibile. Due errori: nello stesso XML ci sono anche `tp_1h/12h/24h`, e
> soprattutto **l'endpoint principale in HTTP risponde vuoto, in HTTPS risponde**.
> Regola generale: prima di dichiarare morta una fonte, provare l'HTTPS.

- **Fonte:** `meteo.arso.gov.si/webmet/archive`. **Anagrafe**
  `locations.xml?...&type=4` → **124 stazioni automatiche con lat/lon e QUOTA**;
  il parametro che sblocca tutto è **`type=4`**, senza il quale risponde
  `points:{}` e sembra un vicolo cieco. **Dati** `data.xml?vars=26,16,17,21,24`
  → pioggia, T min/max, vento medio e raffica in **una sola richiesta**, max **2
  stazioni per chiamata** ma intervalli di giorni illimitati (62 chiamate coprono
  il paese per quanti giorni si vuole).
- ⚠️ Gli **errori 500 di Cocoon sono la documentazione**: dicono in chiaro quale
  parametro manca. È così che si è trovata la combinazione giusta.
- **RICETTA:** somma delle **mezz'ore** del parametro 26, `MIN_MEZZORE=40` su 48.
  Il giornaliero ufficiale (pid 85, «24-urna količina padavin ob 7 h») **non si
  usa**: vale solo per le stazioni manuali ed è la finestra 07-07, la stessa
  trappola del Klimatag austriaco.
- ⚠️ **Le marche temporali sono in CET FISSO (UTC+1), senza ora legale, e
  indicano la FINE della mezz'ora.** Dandole per «ora locale» si sbaglierebbe di
  un'ora tutta l'estate. Misurato con la **correlazione oraria transfrontaliera
  contro l'Austria** su tre coppie (Mežica↔Feistritz 8,1 km; Sotinski
  breg↔Bad Gleichenberg 10,5 km; Logarska Dolina↔Bad Eisenkappel 11,2 km):
  d'estate vince −60 min (r 0,786/0,726/0,547) ma **−90 è a un soffio**, e le due
  letture coerenti sono «CET fisso + fine» e «ora locale + inizio».
  ⚠️ **Il test che scioglie il dubbio è rifare la misura d'INVERNO**, quando
  l'ora legale non c'è: con «ora locale» lo sfasamento sarebbe passato a −30,
  invece **resta −60** (r 0,914 e 0,916). Due stagioni, stessa risposta.
  Conseguenza: il «giorno» d'archivio è il giorno CET e d'estate **non** è quello
  solare italiano → servono sempre **due giornate d'archivio per un giorno
  italiano**, come per l'OSMER Friuli.
- **Validazione del prodotto finito:** correlazione GIORNALIERA con l'Austria
  sulle tre coppie, 29 giorni — **lag 0 = 0,975 / 0,852 / 0,887**, lag ±1 fra
  −0,11 e +0,04. I giorni cadono esattamente dove devono.
- **Storico: 365 giorni REALI dall'11/8/2025**, 114-115 stazioni ogni singolo
  giorno, nessun buco. **Niente stime, niente beta.** In produzione i file sono
  stati **copiati dal repo di test** (dati identici): non si rifà il backfill
  contro ARSO per il gusto di rifarlo.
- ⚠️ **RITARDO DI PUBBLICAZIONE ~34 ORE — il limite vero.** Misurato il 12/8 su
  12 stazioni: D-2 e più vecchi completi (48/48 su tutte), **IERI fermo a 15
  mezz'ore** (07:00 CET), OGGI vuoto, uguale per tutte insieme. Il collector
  **parte da D-2 e non scrive mai un giorno incompleto**: un parziale in mappa
  sembrerebbe una giornata asciutta, che è peggio di un buco.
  **In mappa la Slovenia quindi non ha «Ieri»**: mostra «⚠️ Nessun dato per
  questo periodo» senza rompersi, ed è il comportamento voluto. Per la finestra
  funghi (15-21 giorni fa) e per 7/10/15/20/30 giorni non cambia nulla. Se un
  giorno servisse «Ieri», la strada è il **modello Ticino** (provvisorio dal feed
  live, poi sovrascritto dall'archivio) — ma è la famiglia dei bug #17/#18/#19:
  non appenderlo a un run a orario critico.
- **Collect:** `collect-slovenia-arso.js` + `slovenia.yml`, **2 run/giorno (06:25
  e 14:25 UTC**, slot liberi anche in prod: i più vicini sono 6:35 e 13:25).
  Niente cron di chiusura, a differenza di Austria e Svizzera: col ritardo di 34h
  non c'è nessun momento della notte in cui convenga correre. Ogni run
  ricostruisce D-2..D-9 → **auto-riparazione gratuita** come Svizzera, Austria e
  OASI; dal 26/10/2026 anche i giorni mancanti (o stimati) fino a D-30, allargando
  la finestra delle chiamate solo quando serve (provato dal PC: due giorni a D-12 e
  D-20, 6,5 minuti; un giro normale su GitHub dura ~3,5 minuti, il tetto e' 20). Il collector del repo di **TEST resta acceso**, come per la Svizzera.
- **Backfill:** `backfill-slovenia-arso.js` (una tantum, in locale), che lancia il
  collector vero a blocchi così la ricetta sta in un posto solo.
  ⚠️ **`SOLO_PIOGGIA=1` per lo storico lungo**: chiedendo anche la temperatura la
  serie passa da 30 a 10 minuti e la stessa chiamata costa **12 secondi invece di
  1,4**. Quindi pioggia un anno indietro, **t/w solo sulle ultime settimane**
  (`METEO_HIST_FROM.slovenia = 2026-06-27`).
- **In mappa:** `dataSource:'slovenia'`, `loadSloveniaRegion` (gemello di quello
  austriaco), `loadSloveniaStations` per i pallini di default — ⚠️ **e il ramo in
  `addDefaultMarkersForRegion`, che è esattamente quello dimenticato all'Austria
  il 7/8**. Bordo tratteggiato ed esclusione dalla vista di apertura come gli
  altri esteri. `REGION_ADJ`: slovenia ↔ austria/friuli.
- **Confine:** `slovenia-confine.geojson`, OpenStreetMap via Nominatim,
  Douglas-Peucker 56.648→2.660 vertici (~70 m), 52 KB. ⚠️ **ODbL**, diversa dalla
  licenza dei dati: il nostro file è una semplificazione e resta ODbL, dichiarato
  in `fonti.html` (stesso caso del confine austriaco CC BY-SA).
- **`check-fonti.js`: soglia 4, e il motivo è strutturale.** `mancanti` si conta
  da ieri all'indietro e il file di ieri **non esiste mai**: la Slovenia parte
  sempre da 1 anche quando funziona tutto. Con la soglia 3 delle altre suonerebbe
  dopo appena DUE giorni veri di guasto; con 4 la sensibilità torna quella di
  tutti, tre giorni veri. Verificato in prova: `ultimo dato reale 2026-08-10 (1
  indietro), ieri 114 stazioni su 115` → 🟢, nessun allarme.
- **Header e SEO:** `<title>`, `description`, `og:title` e `og:description` dicono
  «Italia, Svizzera, Austria, Francia e Slovenia»; la home page passa a **5
  nazioni** (il «5000+ stazioni» resta, 5.115 è comunque 5000+).

> ⚠️ **DUE TRAPPOLE NUOVE, valide per sempre e non solo per la Slovenia.**
> - **Il Douglas-Peucker su un anello CHIUSO degenera.** Primo e ultimo punto
>   coincidono, la retta di riferimento è nulla e sopravvivono **due punti**: il
>   confine sparisce. Va spezzato in **due catene aperte**, usando come secondo
>   estremo il punto più lontano dal primo.
> - **Il sito va servito via HTTP anche solo per guardarlo.** Aperto da `file://`
>   Chrome blocca il fetch dei GeoJSON: **tutti** i confini falliscono e la
>   heatmap non compare. Sembra un difetto del codice e non lo è
>   (`python -m http.server` e via).
> - **E una terza, di questa sessione:** `sed -i` in Git Bash su Windows
>   **spoglia i CRLF** dell'intero file. Un `sed -i` su `index.html` produce un
>   diff da 6.675 righe invece che da 3, e il commit diventa illeggibile. Per le
>   patch chirurgiche si usa Python in modalità binaria.

---

## Bug risolti (cronologico)

### Giugno 2026
1. **Bug DST** — `getTimezoneOffset()` = 0 su GitHub Actions (UTC). Fix: `getItalyOffset()` basata su calendario.
2. **Latenza API notturna** — "aggiorna sempre ieri" ad ogni run per Piemonte, Emilia, Veneto, Trentino, Liguria.
3. **Glitch API Toscana/Alto Adige** — merge MAX per proteggere da 0mm errati.
4. **Lombardia formula** — da `max-min` a `sum(valore)` nella query API.
5. **Veneto formula** — da `max-min` a `max()` su cumulativi.
6. **exit(1) crash** — 5 collect crashavano prima di "aggiorna ieri". Fix: skip salvataggio oggi ma continua con ieri.
7. **Trentino getItalyOffset** — funzione mancante, aggiunta.
8. **Emilia offset +1g** — API ARPAE usa chiave giorno+1. Fix: `dateKeyPlusOne()`. Storico corretto (363 file rinominati).
9. **Piemonte cum_rain_24h** — finestra mobile, non totale giornaliero. Fix: `sum(cum_rain_1h)` + merge MAX.
10. **Toscana sum(Valore)** — Valore è cumulativo, non incremento. Fix: `max(Valore)`.
11. **Liguria undersampling** — `/stations/Pluvio` dava solo ultimo 15min. Fix: endpoint `/charts/{code}/Pluvio` con serie temporale oraria.
12. **Toscana 170 stazioni** — filtro `TOSCANA_STATIONS` per evitare 379 stazioni che sforavano in Emilia.
13. **Piemonte 170 stazioni** — filtro `PIEMONTE_STATIONS`, Ceppo Morelli esclusa.

### Luglio 2026
14. **CFR Toscana inaffidabile — switch a SIR.** Check periodico del 12 luglio ha trovato 234/380 stazioni Toscana (61%) ferme a 0mm per tutti i 21 giorni del periodo "corretto" (22 giugno–12 luglio), incluse stazioni con storico di pioggia reale (Marradi max 59.1mm, Firenzuola max 36.8mm). Confermato con fonte esterna indipendente (Open-Meteo reanalysis su coordinate Marradi: pioggia reale multipli giorni nello stesso periodo). Causa isolata confrontando in tempo reale `cfr.toscana.it/actions.php` (Valore=0) contro `sir.toscana.it/monitoraggio/stazioni.php?type=pluvio` (dati corretti) sulla STESSA stazione, STESSO istante: il feed CFR usato dal collector è rotto per la maggioranza delle stazioni, non i sensori. Fix: nuovo collector `collect-toscana-sir.js` che legge i valori (Δ24h) da SIR e le coordinate dal base-call CFR (affidabile solo per i metadati, stesso IDStazione condiviso tra le due fonti). Rimosse anche 5 stazioni duplicate con Emilia-Romagna rimaste morte su CFR (Pracchia, Bibbiana, Lago Paduli, Firenzuola, Marradi) da `TOSCANA_STATIONS`, ora coperte solo dal punto ARPAE Emilia già presente in mappa. Storico Toscana pre-12 luglio 2026 da considerarsi inaffidabile per larga parte delle stazioni. **Backfill completato il 13 luglio 2026:** dato che né CFR né SIR permettono query storiche (ignorano qualsiasi parametro data, restituiscono sempre l'istante attuale) e l'archivio ufficiale (`sir.toscana.it/rilievi-storici`) richiede un login a cui non abbiamo accesso, i 52 giorni rotti (21 maggio – 11 luglio 2026) sono stati ricostruiti con stime Open-Meteo Archive sulle stesse coordinate stazione (script `backfill-toscana-broken-period.js`, una tantum, non nella pipeline). Questi file hanno `source: "open-meteo-backfill-toscana"` per restare distinguibili dai dati di stazione reali — non sono ARPA/SIR reali, sono la miglior stima disponibile per quel buco.
15. **Toscana: aggiunti 2 run di chiusura a mezzanotte.** L'ultimo run regolare (20:15 UTC) lasciava ~1h45 scoperte prima di mezzanotte; essendo Δ24h una finestra mobile leggibile solo "adesso" (nessun recupero storico possibile), pioggia caduta in quella finestra rischiava di non essere mai contata. Aggiunti due cron aggiuntivi a 21:35 e 21:50 UTC (23:35/23:50 CEST in estate) in `toscana.yml`, che si fanno da backup a vicenda oltre ai 3 tentativi già previsti per ogni run.
16. **Toscana: run di chiusura arrivavano dopo mezzanotte.** Check del 16 luglio ha trovato che i 2 run di chiusura del 15 luglio (bug #15) erano partiti con ~55 minuti di ritardo per congestione di GitHub Actions, atterrando entrambi dopo mezzanotte CEST — scrivendo quindi sul giorno SBAGLIATO (16 luglio) invece di chiudere il 15. Il dato del 15 luglio è rimasto comunque valido (scritto dal run regolare delle 20:15 UTC, non catastrofico ma non ottimale), e uno dei due run di chiusura è anche fallito per una race condition sul push Git con un altro workflow concorrente (raccolta dati riuscita, solo il push rifiutato). Fix: run di chiusura anticipati a 20:40/21:00/21:20 UTC (più margine contro i ritardi) e portati da 2 a 3 tentativi; passo "Commit e push" ora riprova fino a 5 volte in caso di conflitto push.
17. **Toscana: pioggia duplicata sul giorno successivo (Δ24h trascinata + protezione glitch-0).** Verificato il 19 luglio al primo test reale della logica Δ24h (pioggia vera del 15 luglio, ~278mm complessivi): il file del 16 luglio aveva 107 stazioni >0 di cui 74 con valori IDENTICI al 15 (Pontremoli 12.8, Rocca Sigillina 10.4…) — pioggia fantasma, il 16 era asciutto (confermato con Open-Meteo orario: a Pontremoli i 24mm sono caduti il 15 sera, 21:00–23:00). Meccanismo: i run del mattino leggono la finestra Δ24h che contiene ancora la pioggia di ieri sera e la scrivono sul file di oggi (previsto, i run successivi correggono al ribasso); ma in giornata asciutta le letture successive sono 0 e la protezione glitch-0 ("se la nuova lettura è 0 e la precedente >0, preserva la precedente") congelava per sempre il valore trascinato. Effetto a catena: il 17 ereditava i residui del 16, il 19 i 4×0.2 del 18. Fix: nei 3 run di chiusura serali la protezione glitch-0 è disattivata (env `CLOSING=1` impostato in `toscana.yml` sui cron 20:40/21:00/21:20 UTC, con fallback ora locale ≥22 nel collector) — lì "ultima lettura vince" vale anche per lo 0, e il file converge al vero totale del giorno. Rischio residuo accettato: un glitch-0 di SIR esattamente all'ultimo run di chiusura cancellerebbe il dato del giorno. Storico riparato a mano (script una tantum, non in pipeline): azzerate sul 16/7 le 75 stazioni con valore identico al 15/7 più 17 con residuo decaduto (valore >0 ma ≤ a quello del 15/7), tutte le 17 del 17/7 e le 4 del 19/7; i file riparati hanno il campo `repaired`. Restano sul 16/7 sedici stazioni 0.2–1.0mm (Casentino/Mugello, 15/7=0: pioviggine plausibilmente genuina).

18. **Alto Adige: pioggia fantasma da cumulato non azzerato.** Trovato al check periodico del 22 luglio 2026: `data/altoadige/2026-07-22.json` era una copia esatta del 21 (58/58 stazioni con valori identici, 85.1mm totali, max 15.1), mentre l'API interrogata in diretta dava 0.0mm su tutte le stazioni — giornata asciutta. Meccanismo: il cron di chiusura `55 21 UTC` (pensato per le 23:55 CEST) parte in ritardo di 40-70 minuti e atterra alle ~00:40 CEST del giorno dopo — non un caso isolato, succedeva tutti i giorni; in quel momento l'API BZ non aveva ancora azzerato il cumulato di mezzanotte, quindi i totali di ieri sono finiti nel file di oggi, e il **merge MAX** li ha congelati (`max(0, 85.1) = 85.1` ad ogni run successivo, il file non si autoripara mai). Stessa famiglia del bug #17. Fix: (a) guardia nel collector — se il file del giorno non esiste ancora e il payload è identico stazione per stazione al giorno precedente con somma > 0, non scrivere; una coincidenza vera su 58 stazioni è impossibile; (b) cron di chiusura anticipato a `05 21 UTC`. Il file del 22 luglio è stato riscritto a mano con i valori reali dell'API (campo `repaired: true`). Testato in sandbox su 4 scenari: reset mancato → salta; giornata asciutta vera (tutti 0) → scrive; una sola stazione diversa da ieri → scrive; giorno già esistente → merge MAX invariato. **Recidiva del 27 luglio 2026** (trovata al check del 28): il cron di chiusura 21:05 UTC del 26/7 è slittato di 60 minuti atterrando alle 00:05 CEST — la guardia non è scattata perché 2 stazioni su 58 si erano già azzerate e la condizione richiedeva identità al 100%. Confermato con Open-Meteo che il 27/7 era asciutto (0.0mm su tutte le stazioni verificate); file riparato azzerando tutte le 58 stazioni (`repaired: true` — nota: il flag sopravvive solo sui giorni chiusi, i run successivi lo perdono riscrivendo il file). Fix: la guardia ora scatta con **≥90% di stazioni identiche** al giorno prima (e somma > 0), non più al 100%; ri-testata sugli stessi 4 scenari più il payload reale della recidiva (56/58 → salta). Copia allineata anche nel repo di test (che non aveva mai ricevuto la guardia; lì il workflow AA non gira, è solo parità di codice).
    **TERZA recidiva, 30 luglio 2026** (trovata il 5 agosto): `data/altoadige/2026-07-30.json` era la **coda cumulata del 29**. La guardia al 90% non è scattata perché **contava tutte le stazioni**, e in una giornata quasi asciutta le decine a zero in entrambi i giorni sono identiche per forza e diluiscono le poche contaminate: identiche 44 su 57 (77%, sotto soglia) ma **26 su 39 fra le BAGNATE** (67%). È lo stesso errore di misura già imparato al check periodico dei giorni ripetuti — si contano le stazioni bagnate, non tutte.
    - **Chi l'ha trovata: il collector Austria appena scritto**, che sullo stesso giorno dava le stazioni di confine a 0 e l'Austria intera a 41 mm su 269 stazioni. Confermato poi da Trentino (6 mm su 105 stazioni), Veneto (14 su 186) e Open-Meteo (0 su tutte e 58 le coordinate altoatesine). **È la prima volta che una rete estera fa da controllo a una nostra regione**: vale come argomento per agganciare l'Austria alla mappa.
    - **Fix: la guardia ora guarda solo le stazioni bagnate** (pioggia in almeno uno dei due giorni), soglia **60%**, minimo 5 stazioni bagnate. Collaudata su **366 giorni di storico**: prende sia il 27 sia il 30 luglio e **non scatta mai** sugli altri giorni, mentre la vecchia dava **18 scatti** su giornate di pioviggine buone, di cui avrebbe bloccato la scrittura.
    - **La faccia nascosta del bug #18, corretta lo stesso giorno**: le 13 stazioni col valore *superiore* a quello del 29 non erano copie ma la **cumulata FINALE del 29**. Il file del 29 si era chiuso alle **23:25 italiane** (campo `collected`) e gli mancava l'ultimo tratto di contatore. Quindi il bug non fa solo comparire pioggia il giorno dopo: **fa anche sparire quella vera del giorno prima**. Le 13 stazioni sono state riportate al cumulato finale (**+24,3 mm**, Selva di Val Gardena 2,8→18,9, Corvara 34,7→37,5), `repaired: true` con la provenienza scritta nel file.
      - **Prova che chiude il cerchio**: dopo la correzione il totale del 29 luglio è **226,6 mm**, esattamente il totale che aveva il file fantasma del 30. Il 30 era il cumulato finale del 29 al millimetro, e ora il 29 è quel cumulato.
      - **Perché alzare era giusto anche senza testimone**: sono letture vere dell'API BZ (se il contatore si fosse azzerato darebbero 0, non valori ≥ quelli del 29) e il merge MAX può solo far sottostimare, mai sovrastimare. Il secondo indizio è geografico: Selva a 2,8 accanto a Corvara a 34,7, a 8 km, era l'anomalia — a 18,9 il campo torna coerente.
      - ⚠️ **Open-Meteo NON è un testimone utilizzabile su questo giorno**: vede 2,3 mm su Selva dove la stazione ne misura 18,9, cioè si perde l'86% dell'evento. Un modello che non ha visto il fatto non può dire a che ora è successo — attenzione a non usarlo per validare orari su convezione isolata.

19. **Trentino: il file di oggi era sempre una copia di ieri.** Trovato allo stesso check. L'API `getValoriAggregatiGiornoJson` pubblica l'aggregato di un giorno solo a giornata conclusa, quindi i record per la data odierna non esistono mai durante il giorno; il collector ripiegava sul *"giorno più recente disponibile"* e scriveva quei valori nel file di OGGI. Il file veniva poi corretto dal ramo "aggiorna ieri" del primo run del mattino successivo (03:5x UTC = 05:5x locali). Effetto in mappa: tra mezzanotte e le ~05:50 locali "ieri" mostrava i dati dell'altro ieri — il 21 luglio, per esempio, 417mm di pioggia attribuiti al giorno sbagliato. Lo storico multi-giorno era invece integro, perché ogni file veniva corretto entro il mattino dopo. Fix: rimosso il fallback — se non ci sono record per la data richiesta si salta il salvataggio di oggi e si procede col solo aggiornamento di ieri. Effetto collaterale accettato: nella finestra 00:00-05:50 il Trentino risulta assente da "ieri" invece che sbagliato; per accorciarla è stato aggiunto il cron `30 22 UTC` (00:30 locali). Il file del 22 luglio, copia del 21, è stato cancellato e ricreato dal run successivo.

21. **Toscana, bug #17 di ritorno: i giri di chiusura atterravano dopo mezzanotte (30/9/2026).** Trovato per caso confrontando i pluviometri con Open-Meteo: in settembre stazioni bagnate con lo STESSO valore il giorno G e G+1 (18/9: 47 stazioni, Empoli 78,5 mm due volte). Causa, letta in `gh run list --workflow toscana.yml`: dal 26/8 lo scheduler di GitHub fa partire i tre cron di chiusura (20:40, 21:00, 21:20 UTC, `CLOSING=1`) con 2-2,5 ore di ritardo, alle 00:30-01:50 italiane. Il collector prendeva «oggi in Italia» → la chiusura (0 inclusi) finiva nel file del giorno NUOVO con la finestra Δ24h piena della pioggia di ieri, e il giorno vero non veniva mai chiuso: l'ultimo giro prima di mezzanotte (~21-22, `collected` 19-20 UTC) tiene la protezione glitch-0 e congela l'ultimo valore. Fino al 25/8 (chiusure alle 22:40-23:45) zero coppie; dopo, 1.240 mm doppi su 150 stazione-giorno in 12 giorni (30/8, 3/9, 11/9, 12/9, 18/9, 19/9, 20/9 i grossi). Nessun altro collector colpito (stesso check su 40 giorni: usano totali di calendario, non finestre mobili). Fix: `closingLate` nel collector — un giro di chiusura che gira prima di mezzogiorno chiude IERI e non scrive sul giorno nuovo; il file riceve `closing_late` con l'orario del giro (la spia); `NOW_OVERRIDE`/`DRY=1` per le prove a orologio finto. Approssimazione accettata: chiudendo alle 00:30-01:50 la finestra Δ24h scivola di quel tanto sul giorno dopo. Storico riparato con `ripara-toscana-doppioni.js` (banco di lavoro, una tantum): azzerate sul G+1 le stazioni ≥1 mm identiche a G, campo `repaired`; i residui decaduti (>0 ma < ieri) NON sono stati toccati, senza un testimone non si distinguono dalla pioggia vera. **La lezione: tutti i controlli guardavano se i dati ARRIVANO, nessuno se sono una COPIA di ieri.** Da oggi `check-doppioni.js` gira ogni giorno dentro `alert-fonti.yml` su tutte le regioni (≥5 stazioni identiche o ≥30 mm doppi in una coppia di giorni → mail).

---

## Coerenza fra reti confinanti (4 agosto 2026)

Una ricetta sbagliata dentro un collector **non si vede dall'interno**: i suoi numeri restano coerenti fra loro. Si vede solo confrontandolo con una rete diversa che misura la stessa pioggia.

### `check-confini.js` — il confronto al confine
`node .github/scripts/check-confini.js <confine>` (`--lista` per i nomi). Variabili: `GIORNI` `MAX_KM` `MAX_DQ` `SOGLIA` **`DATA_ALT`**.

**`DATA_ALT` = radice dati secondaria** (dal 5/8/2026): le fonti ancora in pilota vivono nel repo di test, e senza questa via d'uscita il loro confine non si potrebbe misurare finché non sono promosse — cioè proprio quando la misura serve per decidere se promuoverle.
```
DATA_ALT="…\Mappa-Precipitazioni-Nord-Test\data" node .github/scripts/check-confini.js altoadige-tirolo
```

**Confine `altoadige-tirolo` (Austria, dal 5/8/2026): è l'UNICO in cui entrambi i lati pubblicano la QUOTA**, quindi il filtro dislivello lavora davvero invece di spegnersi da solo — dopo le gemelle è il confronto più stringente che abbiamo. Primo esito su 60 giorni, 16 coppie, 416 confronti: **Austria più alta nel 54%, scarto +0,69 mm, 5 stazioni su e 4 giù → equilibrato**. Vale anche come validazione esterna dei collector Alto Adige e Trentino.

**Il numero che decide è la percentuale "A più alta": vicino al 50% = le reti concordano.** Lo scarto medio in mm no — le code lunghe dei temporali lo spostano anche quando la mediana è perfetta. Il "divario in valore assoluto" è rumore di fondo, non un difetto: due pluviometri a 10 km su un temporale estivo danno numeri lontanissimi.

**Piemonte, Friuli-OSMER e tutte le reti MeteoHub non pubblicano la quota** (`q` = 0). Il filtro dislivello si spegne da solo e lo dichiara a schermo: lasciandolo lavorare teneva solo le stazioni basse dell'altro lato (su Emilia↔Piemonte riduceva le coppie da 19 a 2, tutte di fondovalle) — e in silenzio, che è il modo peggiore di sbagliare.

**Tre correzioni imparate facendolo girare** — senza, lo strumento accusa gli innocenti:
1. **Le stime si annunciano a due livelli.** Per stazione (`om:true`, `src` open-meteo) ma anche per FILE intero (`source: open-meteo-backfill-*`), e quello è il caso insidioso perché le singole stazioni non portano contrassegno. Senza il controllo sul file, Toscana↔Emilia dava 74% "sbilanciato": era il backfill toscano fino all'11 luglio confrontato con l'Emilia reale. Col filtro giusto: **52%**.
2. **Ogni regione entra solo dal giorno in cui è dichiarata affidabile** (tabella `AFFIDABILE_DA`, allineata alle date "Dati corretti da" delle schede qui sopra). La soglia si applica **regione per regione**, non tagliando la finestra intera: sul confine svizzero la sola Valle d'Aosta (dal 16 luglio) avrebbe ridotto 120 giorni a 18, buttando via mesi di dati sani degli altri quattro lati.
3. **La percentuale sui confronti da sola non basta.** Conta i confronti, e i confronti non pesano uguale: una stazione molto piovosa accoppiata con cinque vicini più asciutti produce cinque risultati positivi da sola. Il test vero è il **bilancio per stazione** — se pendono tutte dallo stesso lato è la ricetta, se si dividono è la montagna. Emilia↔Liguria dice 58% sui confronti e 24 contro 20 sulle stazioni: geografia.

**Esiti al 4 agosto 2026 — tutti e cinque i confini in ordine:**

| confine | confronti | scarto medio | A più alta | stazioni |
|---|---|---|---|---|
| Italia↔Svizzera (MeteoSwiss) | 1.652 | −0,82 mm | 44% | — |
| Italia↔Svizzera (OASI-Ticino) | 3.339 | −0,58 mm | 50% | 14 su / 27 giù |
| Emilia↔Piemonte | 321 | +1,35 mm | 48% | 8 su / 5 giù |
| Emilia↔Liguria | 2.646 | +0,87 mm | 58% | 24 su / 20 giù |
| Toscana↔Emilia | 1.134 | +0,08 mm | 52% | 27 su / 27 giù |
| Lombardia↔Trentino | 573 | +0,29 mm | 51% | 6 su / 6 giù |

**Due confini nuovi col pilota sloveno (12 agosto 2026)**, misurati su 60 giorni:

| confine | coppie | confronti | scarto medio | A più alta | stazioni |
|---|---|---|---|---|---|
| Slovenia↔Austria | 15 | 250 | −0,14 mm | 50% | 7 su / 6 giù |
| Slovenia↔Friuli | 67 | 424 | +1,15 mm | 49% | 8 su / 8 giù |

⚠️ **`altoadige-tirolo` non è più l'unico confine con la quota su entrambi i lati**: `slovenia-austria` è il secondo, perché ARSO e GeoSphere la pubblicano tutte e due. Ed è la stessa misura che in fase di studio aveva validato la ricetta slovena (correlazione contro l'Austria), qui però diventa **ripetibile con un comando** invece di essere un'analisi una tantum: due reti indipendenti davvero — ARSO mezz'orario in CET fisso contro GeoSphere orario — che su 250 confronti si discostano di 0,14 mm.

Su `slovenia-friuli` il filtro dislivello **si spegne** (l'OSMER non pubblica la quota) e lo dichiara. I divari più grossi sono tutti orografia dichiarata: Kanin (cima a ~2.200 m) contro i fondovalle di Tarvisio e Cave del Predil, e Breginj contro San Pietro al Natisone — quest'ultima è una delle stazioni a serie oraria bucata che il loader del Friuli già nasconde in mappa col filtro copertura all'80%, ma che nei file grezzi c'è.

Il confine svizzero valida in trasversale la ricetta somma-ore `rre150h0`: se la finestra fosse sfasata, 160 coppie lo avrebbero mostrato. Su Emilia↔Piemonte, il "Emilia più alta nel 100%" annotato a luglio era un artefatto di campione (9 coppie).

### Le 8 stazioni gemelle ARPAE ∩ OMIRL — la verifica più stringente
Otto pluviometri **fisicamente identici** compaiono sia in `data/emilia` (ARPAE) sia in `data/liguria` (OMIRL), a meno di 600 m: S. Stefano d'Aveto, Alpe Gorreto, Barbagelata, Cabanne, Rovegno, Torriglia, Diga del Brugneto (OMIRL: "Brugneto Diga"), Loco Carchelli. Sono stazioni in territorio ligure che ARPAE ospita nel suo feed, come OMIRL ospita quelle toscane della Lunigiana.

Stesso strumento, due nostre pipeline indipendenti: se divergono, **l'errore è certamente nostro**. Al confine il dubbio dell'orografia resta sempre, qui no. **Da rilanciare dopo ogni modifica ai collector Emilia o Liguria.**

**Esito dal 6/6/2026: 85% dei giorni identici, divario medio 1,36 mm, solo il 3% oltre i 10 mm.** Entrambi i collector sono sani.

> ⚠️ **LE GEMELLE NON SONO UN METRO VALIDO PRIMA DEL 19 GIUGNO 2026.** La Liguria è
> dichiarata corretta solo da quella data (scheda Liguria): prima, ARPAE e OMIRL sono
> **due reti inaffidabili che si accusano a vicenda**, e qualunque sbilanciamento fra
> loro non prova niente su nessuna delle due. Il 15 e 16 maggio, per dire, è Open-Meteo
> a dare ragione ad ARPAE contro OMIRL (151 e 42 mm contro 27 e 2). Per giudicare quel
> periodo serve un **terzo indipendente**, non le gemelle. Regola scritta il 5/8/2026
> dopo aver messo l'Emilia sul banco degli imputati due volte per un confronto che non
> poteva reggere.

**Cosa hanno trovato nel passato.** Prima del 6/6 il quadro è opposto: 2% identici, divario 16,04 mm, 51% oltre i 10 mm. Due cose reggono alla verifica del 5/8/2026, una no.

**Regge**: `data/emilia/2026-06-02.json` è **uno zero falso** (315 stazioni a 0, timestamp sintetico `2026-06-04T12:00:00.000Z`). E l'evento **è datato male da ARPAE** — qui il giudice non è OMIRL ma **Open-Meteo, terzo indipendente**, che lo mette il **2/6** (134,5 mm sulle gemelle, coda 54,7 il 3/6) dove lo mette OMIRL (196,6), mentre ARPAE lo mette il 1/6 (362,3). Due fonti indipendenti contro una. È lo strascico del commit `9d739483` del 6/6, "corretto offset +1 giorno su tutti i file storici" (bug #8): ha risolto il bug in corso ma ha lasciato mangiato l'evento a cavallo.

**NON regge** quello che era scritto qui il 4/8, cioè che la quantità fosse «quasi doppia, compatibile con un accumulo di due giorni schiacciato in uno» e che «il danno è circoscritto al 1-4 giugno». Misurato bene: su tutto il periodo **3 maggio → 5 giugno** ARPAE sta a **2,31 volte** OMIRL sulle gemelle (1.694 mm contro 735), con **un solo giorno su quindici** in accordo; e il test di traslazione dà coseno 0,566 a −1 giorno contro 0,546 a 0, cioè **nessuno slittamento sistematico da correggere**. Ma per l'avvertenza qui sopra quel 2,31 **non dimostra che ARPAE sia gonfiato**: non abbiamo un metro per quel periodo.

**DECISIONE UTENTE 5/8/2026: non si ripara nulla.** L'API ARPAE `meteo_giornalieri` offre ~15 giorni di storico (verificato il 4/8: finestra 21/7→4/8), quindi giugno è fuori portata; l'unica strada per dati veri sarebbe l'archivio Dext3r, che è un progetto a sé. E il periodo **rientra nella finestra già dichiarata inaffidabile** ("dati corretti da: 5 giugno 2026" nella scheda Emilia). Non riaprire senza Dext3r.

~~**Aperto, trovato il 5/8**: il 29 e 30 giugno ARPAE è molto più bassa di OMIRL sulle gemelle~~ — **CHIUSO il 6/8/2026: era UNA stazione, non la rete.** Sette gemelle confrontabili dal 19 giugno (48 giorni): Barbagelata, Cabanne, Rovegno, Brugneto e Loco Carchelli **identiche al decimale 48 giorni su 48**, Torriglia 47/48. Tutto lo scarto veniva da **Alpe Gorreto**, dove il feed ARPAE ha restituito **0 invece di "dato assente" per quattro giorni di fila** (29/6, 30/6, 1/7, 2/7) mentre OMIRL misurava 50,8 · 28,2 · 9,8 · 1,1 mm — lo stesso zero falso già visto sull'Emilia del 2 giugno. La stazione **non è morta** (20 giorni di pioggia riportati, ultimo bagnato il 2 agosto): è una finestra di silenzio scritta come zero.
> ⚠️ **La lezione di metodo**: sommare le gemelle e guardare il totale ha fatto sembrare sbilanciata un'intera rete per colpa di una stazione con 90 mm mancanti. **Il totale non è mai la diagnosi** — si guarda il bilancio stazione per stazione, esattamente come per la percentuale sui confronti in `check-confini.js`. Stesso errore, terza volta.
Conseguenza operativa: le 8 gemelle sono state escluse dal rendering Emilia (`EMILIA_ESCLUSE`, vedi scheda Emilia), che toglie insieme lo zero falso e il doppione.

---

## La quota delle stazioni (26 agosto 2026)

Trovato dall'utente: «molti pluviometri Piemonte non hanno l'altitudine».
Misurato su tutti i file di tutte le cartelle, erano **due problemi diversi**.

### 1. Piemonte, finestra storica 3/5 → 14/8/2026 — RIPARATA
104 file su 384 avevano `q: 0` su TUTTE le stazioni: il collector di allora non
scriveva la quota, e solo il **v2 (in produzione dal 15/8)** la prende
dall'anagrafica ufficiale ARPA. Prima del 3/5 il Piemonte erano 56 stazioni e la
quota c'era: la finestra rotta stava in mezzo. Riparata con
`ripara-quote-storiche.js piemonte`, che rimette la quota **dai file che ce
l'hanno gia'**, per codice stazione: 28.434 stazioni-giorno su 28.673 (99,2%).
Le due dismesse rimaste fuori (Malciaussia, Alto Sermenza) hanno preso la quota
del terreno, come le reti qui sotto.

### 2. Undici reti che la quota non ce l'hanno proprio — QUOTA DAL TERRENO
Le 10 reti MeteoHub e OSMER Friuli, **~1.650 stazioni**: l'API dei metadati
MeteoHub espone solo nome e lat/lon (sta scritto in cima a `collect-meteohub.js`)
e OSMER non la pubblica nel tracciato che usiamo.
- `quote-terreno.js` chiede a Open-Meteo Elevation (Copernicus DEM GLO-90)
  l'altezza del terreno nel punto di ogni stazione e scrive
  `data/quote-terreno.json`. Si rilancia quando compaiono stazioni nuove: chiede
  solo quelle che non conosce. ⚠️ **Open-Meteo conta le richieste a PESO**: lotti
  da 100 punti prendono 429: lotti da 50, pausa 2,5 s, attesa 65 s sul rifiuto.
- `ripara-quote-storiche.js terreno` la mette nei file storici, marcando ogni
  stazione con **`qt: 1`**; `collect-meteohub.js` e `collect-friuli-osmer.js` la
  leggono a ogni giro, se no domani tornerebbe `q: 0`.
- ⚠️ **NON e' la quota della stazione, e' l'altezza del terreno**: la quota vera
  la dichiara l'ente, questa la deduciamo dalle coordinate. Il sito la mostra col
  **~ davanti**. **RESTA DA RISOLVERE**: la strada giusta e' l'anagrafica vera di
  quelle reti (la lezione della Toscana: non «l'endpoint che uso ha il dato?» ma
  «l'ente lo pubblica da qualche parte?»).

### 3. In mappa: `testoQuota(s)`
Prima si scriveva sempre `s.q + ' m slm'` e per chi la quota non ce l'ha usciva
**«0 m slm»**: non ammettere di non sapere, ma AFFERMARE il livello del mare su
un pluviometro di montagna. Adesso: **«—»** se ignota (`q: null`), **«~ 1.240 m
slm»** se dal terreno, «1.240 m slm» se la dichiara l'ente.
⚠️ **Zero NON e' ignoto**: Grado, Lignano, Muggia, Trieste molo, Bibione,
Chioggia, Viareggio, Livorno Mareografo, Orbetello, Bosa Marina, Manfredonia,
Lesina, Foce Metauro e Port-La-Nouvelle stanno davvero sul mare, e i loro zeri
non si toccano. ⚠️ Per questo il campo `qt` va copiato in TUTTI i punti in cui i
loader ricostruiscono la stazione (`q:s.q,qt:s.qt,`, 40 posti) e nelle due righe
«la quota arriva anche da un file dopo»: dimenticarlo li' fa sparire il ~ senza
nessun errore.

### Stato dopo la riparazione
1.439.756 stazioni-giorno, **zero senza quota**, 152.549 col contrassegno del
terreno. Gli unici zeri rimasti sono le stazioni sul mare elencate sopra.

### 4. Il «~» e' affidabile, e le stazioni nuove lo prendono da sole (14/10/2026)
- **Misura**: quota del terreno contro quota DICHIARATA su 1.848 stazioni di 9
  reti del nord. Scarto mediano **5 m**, 90% entro 26 m, nessuna oltre 200 m,
  nessuno sbilanciamento. Il «RESTA DA RISOLVERE» qui sopra e' chiuso: l'anagrafica
  vera delle reti del sud non serve cercarla.
- **`lib-quota-terreno.js`**: `completaQuote` (MeteoHub, OSMER) chiede il terreno a
  giro in corso per le stazioni che non sono in `quote-terreno.json`; prima
  restavano «—» per settimane (Capua dal 12/9, Giovinazzo, Deliceto).
  `correggiZeri` (Toscana): uno 0 dichiarato dal SIR con il terreno sopra i 20 m
  diventa la quota del terreno col ~ (Bulera 183 m, Ponte Orgia 184 m, a «0 m slm»
  da maggio). Livorno Mareografo, Viareggio, Bocca di Serchio e Orbetello restano 0.
- ⚠️ **La libreria NON scrive `quote-terreno.json`**: tre workflow diversi sullo
  stesso file si scontrerebbero nel push. Le nuove chiedono a ogni giro; ogni tanto
  si rilancia `quote-terreno.js` a mano (ora fa anche gli zeri toscani).
- ⚠️ Tetto 15 s, al primo errore si spegne per tutto il giro, la pioggia non la
  tocca mai. Prova a mano: `TERRENO_SPENTO=1`.
- Storico: `ripara-quote-storiche.js terreno` e il modo nuovo `zeri`, 193 file,
  solo `q`/`qt`.

### 5. Dal 25/10/2026 il terreno viene dalle tessere terrarium, non da Open-Meteo
Deciso il 25/10 di togliere Open-Meteo da tutto il sito (il piano gratuito vieta i siti con pubblicita' o
abbonamenti): questo e' il primo pezzo. `lib-terrarium.js` legge le **Terrain Tiles di Mapzen** (open data su AWS,
PNG con la quota nei colori, in Europa EU-DEM: attribuzione in `fonti.html`) allo zoom 12; la usano
`lib-quota-terreno.js`, `quote-terreno.js` e `lib-quota-paesi.js`.
- **Misura** su 537 pluviometri del nord con la quota dichiarata: scarto mediano **5 m**, 90% entro 20 m, 2 oltre
  i 100 m; Open-Meteo sugli stessi 5 m / 26 m / 4. I peggiori sono gli stessi per tutte le fonti (Castione della
  Presolana, Valtorta), cioe' coordinate della stazione.
- ⚠️ **TINITALY sarebbe meglio** (3 m / 16 m) ma le nostre tessere sono WebP e Node, senza librerie, il WebP non
  lo legge: i collector girano con node e basta.
- **Le quote gia' scritte restano** (`quote-terreno.json`, `quote-paesi.json` con `f:'om'`, i file storici): sono
  dati del Copernicus DEM. `quote-terreno.js --tutte` e `QUOTE_RIFAI=1` le rifanno da terrarium, se servira'.
- Tolti lo stesso giorno, perche' morti e con Open-Meteo dentro: i sette `populate-history*.js` e `backfill-*.js`
  della radice, `netlify/functions/collect-trentino.js`, `check-mnw-sud.js` con `mnw-check.yml`.
⚠️ ~~Nota a margine: sul Piemonte i pallini di partenza prendono la quota
dall'anagrafica del realtime, che per Acqui Terme dice 156 m mentre la banca
dati ufficiale dice 217. Due numeri ARPA diversi per la stessa stazione.~~
**SBAGLIATO, e chiuso il 30/8/2026.** Non c'erano due anagrafiche in disaccordo:
quei pallini non venivano da nessuna ARPA, erano una lista di PAESI scritta a
mano, e il 156 era la quota del paese di Acqui Terme battuta a mano su un punto
che sta 989 m lontano dalla stazione vera. La funzione citata,
`loadARPAPiemonteStations`, non esisteva nemmeno. Vedi la sezione
«I pallini di partenza e le due voci rimaste aperte» in fondo a questo file.

---

## La direzione del vento: campo `wd` (2 ottobre 2026)

Dal 2/10 i collector salvano anche DA DOVE viene il vento, accanto a
`w:[media,raffica]`. Sul sito non si vede ancora: il disegno scelto e' la
freccia sotto il grafico del vento (A) piu' «da NE» nel riquadro del pallino (C),
mockup in `mockup-direzione-vento\` nel banco di lavoro. Lo storico parte dal 2/10.

**Il campo.** `wd: 45` = gradi di PROVENIENZA, 0-359 (0 tramontana, 45 grecale,
90 levante, 135 scirocco, 180 ostro, 225 libeccio, 270 ponente, 315 maestrale).
`wd: "V"` = variabile. Assente = meno di 20 ore lette o calma piatta.

**La ricetta sta in `lib-direzione.js`**, come l'intensita' in `lib-intensita.js`:
media VETTORIALE pesata sulla velocita' (metodo OMM), ore piene >= 20,
«variabile» se la costanza (lunghezza della somma / somma delle lunghezze) e'
sotto 0,3.
- ⚠️ **Mai la media dei gradi**: 350 e 10 fanno 180, cioe' l'opposto.
- ⚠️ **Le ore di calma contano come ore lette** anche se la rete lascia vuota la
  direzione: ARPA Piemonte scrive `wind: 0, wind_direction: null`, e senza
  questa regola 38 stazioni piemontesi su 80 perdevano la direzione del giorno.

**Chi ce l'ha, misurato il 2/10 sull'API vera** (stazioni con `wd` su quelle col vento):
Austria 260/260 (`dd`), Svizzera 132/132 (`dkl010h0`), Slovenia 51/52 (var 23),
Piemonte 69/70 (`wind_direction` + `settore_prevalente` ufficiale dove manca),
Veneto 113/113 (sensore `DVENTO`), OSMER 24/25, VdA 44/44 (prid 11), Trentino
40/40 (`direction_value`), Emilia 44/45 (settore prevalente ARPAE: mai "V"),
Toscana 141/141 (MeteoHub `B11001`, vedi sotto). Millimetri invariati ovunque.
- **Francia e Liguria** non si potevano provare in locale (chiave Meteo-France;
  OMIRL irraggiungibile dal PC di lavoro): verificate al primo giro lanciato a
  mano il 2/10, Francia 654/654 (`dd`), Liguria 46/46 (serie «Wind Direction»).
- **Aggiunte lo stesso 2/10, con una richiesta in piu'**: Lombardia (sensori
  «Direzione Vento», 155: UNA query in piu' per giorno coi valori GREZZI di
  direzione e velocita' a 10', perche' l'avg orario di Socrata sarebbe la media
  dei gradi; 129 stazioni su 155 coppie il 1/10) e MeteoHub (prodotto `B11001`,
  una query per rete e giorno; Sicilia 83/108, Marche 10/11; 25 stazioni
  siciliane la direzione non la pubblicano). ⚠️ Socrata risponde 429 alle
  raffiche: provando a ripetizione dal PC il limite scatta, nei giri veri no.
- **Fuori**: Ticino OASI (~5 chiamate, ~7 stazioni, rende poco) e Alto Adige
  (~83 chiamate a giro su un server che rifiuta gia' le raffiche).

**⚠️ TOSCANA: IL CAMPIONATORE CFR E' MORTO DAL 26/8, e nessuno se n'era accorto.**
`toscana-vento.yml` gira «ogni ora», ma dal 26/8 lo scheduler di GitHub lo fa
partire 4-8 volte al giorno: nessuna stazione arriva a 20 letture, `w` non si
calcola mai, e TUTTO il vento toscano viene dalla rete di sicurezza MeteoHub
(`ventoMeteoHub` in `collect-toscana-sir.js`). La direzione si prende quindi da
li' (`B11001`, una richiesta in piu' al giorno). Il campionatore salva comunque
la direzione nei campioni, ma da solo non basta. **Spento il 2/10/2026**
(cron commentato in `toscana-vento.yml`, resta lanciabile a mano): i suoi file
in `data/toscana-vento/` restano come archivio, il collector se non li trova
prende tutto da MeteoHub.

---

## Togliere Open-Meteo (dal 25/10/2026)

Il piano gratuito di Open-Meteo vieta i siti con pubblicita' o abbonamenti. Deciso il 25/10 di toglierlo pezzo per
pezzo, cosi' il sito resta libero di scegliere (pubblicita', bollettino, niente). Stato:
- **Quote del terreno**: fatto, terrarium (vedi «La quota delle stazioni», punto 5).
- **Ricerca dei posti**: fatto. `functions/api/cerca.js` risponde come Open-Meteo Geocoding (`results` con name,
  latitude, longitude, country_code, admin1, admin1_id, admin2, population, feature_code, elevation) leggendo
  `luoghi/*.tsv`, che fa `.github/scripts/genera-luoghi.js` dai file per paese di GeoNames (IT, CH, AT, FR, SI) e dai
  loro `alternatenames/<paese>.txt` (banco di lavoro, `geonames\`). Posti abitati e passi, ~189.000; nome in
  ITALIANO se c'e' (Ginevra, Nizza, «Alta Savoia»), ma si trova anche col nome locale («nice», «genève»). File
  spezzati sotto i 200 KB (gruppi in `luoghi/divisi.json`, file `-cima` coi 30 piu' abitati per le ricerche corte).
  Come Open-Meteo: sotto 2 lettere niente, con 2 solo i nomi uguali, da 3 l'inizio del nome. In piu' (28/10/2026):
  «S.» e «S» davanti valgono San, Sant', Santo, Santa, Santi, Sante (`varianti`, la stessa regola di `locVarianti` della
  mappa), cosi' «s. pellegrino in alpe» trova la frazione; senza abbreviazione le risposte sono identiche a prima
  (provato su 60 domande). «s. giovanni» risponde come «san giovanni»: prima i nomi uguali. Le quattro caselle
  (`index.html` CERCA_API, `meteoClient`, `lib/pagina-adesso.js` v5, `genera-pagine-meteo-zona.js`) cambiano solo
  l'indirizzo. ⚠️ In locale la Function tiene i file in memoria: dopo aver rifatto `luoghi/` va riavviato wrangler.
  ⚠️ ~1.400 file in piu' nel sito: col tetto di 19.500 di `pubblica-pages.js` ci stanno ancora tutti i giorni di `data/`.
  Si rifa' un paio di volte l'anno, riscaricando i file da download.geonames.org.
- **La % delle previsioni RESTA di Open-Meteo** (sua decisione): la sola alternativa con la % ora per ora era calcolarla
  dai 50 scenari ECMWF (~500 MB a giro, troppo per GitHub); OpenWeather contraddiceva le icone di MET (confronto su 6
  citta' il 25/10). Il giorno che arriva la pubblicita' si paga il piano Standard (29 €/mese).
- **Da fare**: il riempimento dei buchi (stime), l'Abruzzo dal vivo, il ripiego della Lombardia, e decidere sulle
  stime gia' salvate (2.698 file interi, 2.917 stazioni-giorno), meglio chiedendo a Open-Meteo con una mail.

---

