# Mappa Pluviometrica Italia — CLAUDE.md

## Progetto
Mappa interattiva delle precipitazioni di TUTTA ITALIA, SVIZZERA E AUSTRIA (Austria dal 7 agosto 2026; Svizzera dal 3/8, v6.0; v5.0 tutta Italia dall'1/8, prima solo Nord) per il canale YouTube "Avventure Micologiche". Mostra dati pluviometrici reali di stazione su heatmap Leaflet.
**Header e titoli, dal 6-7/8/2026**: su desktop `Mappa Pluviometrica Italia · Svizzera · Austria`; **sotto i 600px resta solo "Mappa Pluviometrica"** (`.hdr-paesi` nascosto) perché col titolo intero l'header traboccava spingendo "Iscriviti" fuori schermo — 9px a 360 di larghezza già col solo "+ Svizzera", 62px aggiungendo l'Austria. `<title>` e `og:title` restano per esteso ("Italia, Svizzera e Austria"): servono a chi condivide, non allo schermo.

- **Dev:** avventurepluvio.netlify.app
- **Prod:** precipitazioni.avventuremicologiche.it
- **Repo:** github.com/AvventureMicologiche/Mappa-Precipitazioni-Nord
- **Stack:** Leaflet 1.9.4, OpenStreetMap, Netlify (hosting + Functions), GitHub Actions (data collection)

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

## Regole fondamentali

1. **Lo storico precipitazioni deve essere SEMPRE accurato e completo.** Mai accettare dati parziali o sbagliati come "non catastrofici". Ogni problema va risolto completamente.
1b. **Retention: max 730 giorni (2 anni) di storico per regione — allungata da 365 il 7 agosto 2026.** Finestra scorrevole: ogni nuovo giorno raccolto elimina il più vecchio oltre i 730. Ogni collector DEVE avere il blocco "Pulizia retention" a fine main() (uniformato a tutti i collector il 16 luglio 2026 — prima lo avevano solo Piemonte, Emilia, Veneto e Liguria, le altre regioni erano arrivate a 417-420 giorni).
   - **Perché è stata allungata proprio quel giorno**: Austria e Svizzera avevano **esattamente 365 file, dal 7/8/2025 al 6/8/2026**, cioè erano appoggiate al muro — da lì in poi ogni giorno nuovo avrebbe cancellato un giorno di dato REALE, ricostruito con backfill una tantum (per la Svizzera ~1 GB di CSV). Le altre regioni non rischiavano nulla, loro sì.
   - **Non recupera il passato**: i giorni già cancellati sono persi, si smette solo di cancellare. Attenzione a non leggere "2 anni di archivio" come "2 anni di dati veri": al 7/8/2026 l'anno più vecchio è per il 73-93% **stime** Open-Meteo (backfill), tranne Svizzera, Austria, Lombardia e Ticino che sono reali. I due anni tutti reali arrivano a metà 2028.
   - **Costo**: `data/` passa da ~60 MB a ~120 MB in un anno. **Nessun deploy Netlify** (`data/` e `.github/` sono nella regola ignore) e nessun rallentamento del sito: il periodo massimo selezionabile resta bloccato a 12 mesi nelle date personalizzate. Nota: la retention non ha mai ridotto il peso di `.git`, perché i file cancellati restano nella storia — serve a tenere leggera la cartella di lavoro.
   - **Cambiate 16 costanti in prod e 12 nel test** (`MAX_DAYS`/`RETENTION`), più `RETENTION_DAYS` in `check-gaps-nord.js` (che però nel run giornaliero non entra mai in gioco: `SCAN_DAYS` è 15, quel limite serve solo alla scansione profonda a mano). **NON toccati i backfill**, dove `365` è il parametro di quante giornate scaricare, non la retention.
2. **Verifica prima di procedere:** spiega le modifiche proposte e aspetta l'approvazione esplicita prima di toccare qualsiasi file.
3. **La mappa mostra solo "ieri" e periodi passati.** I dati della giornata odierna sono esclusi dalla visualizzazione.
4. **Le regioni usano dati di stazione reali** (ARPA regionali, SIR Toscana, OASI Ticino, Centro Funzionale VdA, ARPA OSMER Friuli; **centro-sud: MeteoHub**, rete dpcn — stazioni reali via piattaforma unica). Eccezione dichiarata: **Abruzzo = Open-Meteo live** (assente da MeteoHub, nessun collector). Open-Meteo resta solo come: (a) **backfill storico** — stime per i giorni prima dell'inizio del dato reale, `source: open-meteo-backfill-*`; (b) **gapfill** dei buchi (gaps-nord e meteohub-gaps, `source: open-meteo-gapfill` o stazioni `om:true`); (c) fallback dei loader se i file mancano.
5. **Direzione geografica:** per spostare il centro mappa visivamente verso il basso, la latitudine deve AUMENTARE, non diminuire.

---

## Architettura dati per regione

### Lombardia
- **Fonte:** ARPA Lombardia Socrata API (`dati.lombardia.it`)
- **Collect:** `collect-lombardia.js` (dal 24 luglio 2026) — prima era l'UNICA regione caricata live dal browser
- **Formula:** `sum(valore)` su un giorno raggruppata per sensore = totale mm. Sensori pioggia da anagrafe `nf78-nj6b` (tipologia='Precipitazione'), misure da `647i-nhxk`
- **Orari:** 6 run/giorno + ieri/altroieri
- **Dati corretti da:** ~1 gennaio 2026 (backfill; il dataset Socrata 647i-nhxk contiene solo l'anno corrente in pieno — il 2025 è vuoto/sparso, min completo = gennaio 2026, ~204 giorni. Cresce a 365 con la retention)
- **Migrazione a file (24 luglio 2026):** prima la Lombardia interrogava Socrata **live** dal browser a ogni caricamento — lenta sui periodi lunghi (~60 richieste per 30 giorni) e dipendente da Socrata in tempo reale. Ora scrive file giornalieri come le altre regioni: il sito legge i file (`loadARPALombardiaRegion` fa `fetch` del raw GitHub e somma), i sensori morti (offline, nessun dato quel giorno) non ci sono, e se Socrata va giù lo storico resta. Fallback a Open-Meteo se i file mancano. Valori identici alla vecchia query live (verificato: 15/7 media 6.63)
- **In mappa ci sono le stazioni VERE (31 luglio 2026).** Fino a oggi la Lombardia era l'unica regione a non mostrare le proprie stazioni: prendeva l'**anagrafe** ARPA (326 pluviometri), la assottigliava due volte con `selectUniform` (326→187→160) e a ognuno di quei punti assegnava il valore della stazione reale **più vicina**. Era il compromesso dell'epoca live — 325 chiamate a Socrata erano insostenibili — ed è sopravvissuto per inerzia alla migrazione a file, dove non serviva più.
  - **Quanto costava**, misurato sul periodo 8-15 luglio: 253 stazioni misuravano, **solo 128 misure arrivavano in mappa**. 125 non si vedevano mai, compreso il **massimo del periodo** (77,2 mm a Oltre il Colle Zambla, mentre il pannello dichiarava 68,6). `selectUniform` tiene al massimo 4 stazioni per ognuna delle 80 caselle in cui divide la regione, quindi decima proprio la montagna, dove la rete è fitta: nelle Orobie sopravvivevano **2 pluviometri su 12** e una sacca da 44 mm risultava asciutta. Per una mappa che serve a trovare dove ha piovuto 16-23 giorni fa era il difetto peggiore possibile — trovato dall'utente guardando un buco di pallini fra Valtellina e Val di Scalve.
  - **Velocità: nessun costo.** A/B in locale a cache calda: 7 giorni 777→793 ms, 30 giorni 983 ms sul test e 923 in produzione. La lentezza che aveva motivato il taglio era Socrata in diretta, non il numero di stazioni. Attenzione a non ripetere l'errore di misura fatto quel giorno: la prima apertura assoluta scarica il confine GeoJSON e i file dei giorni e può sforare il timeout di sicurezza di 30s, quindi **si confronta solo a cache calda**.
  - **Tre sensori esclusi** (`LOMB_ESCLUSE` in `loadARPALombardiaRegion`): hanno coordinate corrotte nell'anagrafe ARPA — `2239` "Ispra prato" (VA) alle coordinate di Gandellino Tezzi (BG), `2206` "Ispra tetto" (VA) sulle colline bergamasche, `2535` "Virgilio Mantova Cerese" (MN) alle coordinate di Dorio (LC). Sono morti da sempre, il filtro serve a non ritrovarseli piantati in mappa se tornassero a riportare. **`Ispra JRC` (32355) è invece corretta e riporta ogni giorno: non toccarla.**
- **Il grafico storico legge i FILE dall'11/8/2026** (`histFromFiles`, come tutte le altre regioni): era l'ultima cosa live su Socrata (`histFromLombardia`, rimossa). La Netlify function `/arpa` resta in uso per l'anagrafe della mappa
- **Temperatura/vento (dall'11/8/2026):** l'anagrafe ha sensori Temperatura (309, °C) e Velocità Vento (155, **m/s → ×3,6**, dichiarato in `unit_dimisura`); il join col pluviometro è via `idstazione`. UNA query Socrata in più per giorno, raggruppata per (sensore, ora) → la completezza si misura in ORE COPERTE (≥20) a prescindere dalla granularità (temperatura 10', vento 5'). **La raffica non esiste su Socrata** → `w:[media,null]`. Backfill `backfill-meteo-lombardia.js` dal 28/6
- **Sensori morti:** su 325 in anagrafe, ~250 riportano; su 30 giorni 71 non riportano mai (0 online genuinamente a zero → una stazione a ~0 su un mese è morta, non asciutta)

### Piemonte
- **Fonte:** ARPA Piemonte `utility.arpa.piemonte.it/api_realtime`
- **Collect:** `collect-piemonte.js`
- **Formula:** `sum(cum_rain_1h)` per totale giornaliero + merge MAX protezione
- **Merge MAX:** se "aggiorna ieri" riceve <1000 record, salta l'aggiornamento
- **PIEMONTE_STATIONS:** 170 stazioni curate (filtrate da 275) nell'index.html. Ceppo Morelli esclusa (sensore offline). MONTE MALANOTTE (id 106, Cuneo) NON è in lista e non va aggiunta: pluviometro guasto dal 16 luglio 2026 — pioggia fantasma per giorni consecutivi (fino a 136mm/giorno) con Open-Meteo a 0.0, vicini asciutti e sensori temperatura/umidità null. I valori errati restano nei file grezzi `data/piemonte/` (16-20 luglio+) ma non arrivano mai in mappa (filtro applicato prima dell'accumulo). **Ricontrollata il 25 luglio 2026:** tornata online dal 22/7, ma temperatura/umidità ancora al 100% `null` (la firma del guasto persiste) e nessun evento di pioggia per testare il pluviometro → **esclusa in via definitiva, non riaggiungere e non serve più ricontrollarla ai check periodici.**
- **Orari:** 6 run/giorno
- **Dati corretti da:** ~12 giugno 2026
- **Temperatura/vento (dall'11/8/2026):** gli STESSI record orari della pioggia portano `air_temperature`, `wind` e `gust_of_wind` — zero richieste extra. ⚠️ **wind/gust GIÀ in km/h** (validato contro Open-Meteo su stazioni di pianura: rapporto ~0,9; fosse m/s sarebbe ~3,6) → nessuna conversione. ⚠️ **Niente backfill**: l'API tiene solo ~2 giorni pieni (verificato: 9/8 pieno, 5/8 vuoto) — t/w partono dal 9/8/2026 e crescono un giorno al giorno
- **Bug noto:** API manutenzione alle 04:00 UTC → run delle 06:00 CEST spesso fallisce
- **ATTENZIONE:** `cum_rain_24h` è una finestra mobile, NON un totale giornaliero. MAI usare `max(cum_rain_24h)` perché trascina pioggia nel giorno dopo. L'API conserva solo ~1 record per stazione per i giorni vecchi, quindi `sum(cum_rain_1h)` funziona solo quando ci sono i record completi (24/giorno).

### Emilia Romagna
- **Fonte:** ARPAE REST `apps.arpae.it/REST/meteo_giornalieri`
- **Collect:** `collect-emilia.js`
- **Formula:** `precipitazione_cumulata_giornaliera` con `dateKeyPlusOne()` — l'API ARPAE ha offset +1 giorno (chiave 20260606 = dati meteo del 5 giugno)
- **Orari:** 6 run/giorno + aggiorna ieri
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
- **Orari:** 6 run/giorno + aggiorna ieri
- **Dati corretti da:** 4 giugno 2026
- **Temperatura/vento (dall'11/8/2026):** gli STESSI XML di stazione portano sensori `TEMP` (°C, letture ogni 30') e `VVENTO` (**m/s → ×3,6**, nessuna raffica) — zero richieste extra. ⚠️ La regex dei DATI per t/w ammette il segno meno (le temperature possono essere negative; quella della pioggia no). Finestra XML ~2,5 giorni → niente backfill: t/w dal 9/8/2026

### Trentino
- **Fonte:** Meteotrentino API
- **Collect:** `collect-trentino-gh.js`
- **Formula:** `PrecTotale` diretto dall'API
- **Orari:** 7 run/giorno + aggiorna ieri (il cron `30 22 UTC`, aggiunto il 22 luglio 2026, mira le 00:30 locali per raccogliere il giorno appena chiuso senza aspettare il primo run del mattino)
- **Dati corretti da:** 6 giugno 2026
- **Temperatura (dall'11/8/2026):** `Minima`/`Massima` sono aggregati ufficiali GIÀ nella stessa risposta (t su ~104/109 stazioni), zero richieste extra; backfill 6 giorni (`backfill-meteo-trentino.js`, dal 5/8). ⚠️ **Niente vento**: l'API ha solo `vento_max` (raffica) senza la media, e il grafico disegna la media — da riconsiderare se l'API cambiasse
- **ATTENZIONE:** `getValoriAggregatiGiornoJson` pubblica l'aggregato di un giorno **solo a giornata conclusa** — durante il giorno i record per la data odierna non esistono proprio (verificato il 22 luglio 2026 alle 15:15: l'API si fermava al 21). Il file di un giorno viene quindi creato dal ramo "aggiorna ieri" del primo run dopo mezzanotte, non durante il giorno stesso. Il collector NON deve ripiegare sul "giorno più recente disponibile" per riempire il file di oggi: era il bug #19.

### Alto Adige
- **Fonte:** Meteo BZ API (solo dati odierni)
- **Collect:** `collect-altoadige-gh.js`
- **Formula:** `sensorValue` (cumulato dalla mezzanotte) con merge MAX
- **Orari:** 7 run/giorno — il run di chiusura è stato anticipato dalle 21:55 alle **21:05 UTC** il 22 luglio 2026 (bug #18): i cron di GitHub slittano di 40-70 minuti e quello serale atterrava sistematicamente dopo mezzanotte CEST
- **Dati corretti da:** 4 giugno 2026
- **Temperatura/vento (dall'11/8/2026):** valley.json ha solo il valore istantaneo → min/max/media dalle **timeseries a 10 minuti** dell'Open Data provinciale (`daten.buergernetz.bz.it/services/meteo/v1/timeseries`, sensori LT/WG/WG.BOE, timestamp in ORA LOCALE, interrogabili sul passato). Ogni run ricalcola ieri+oggi (~171 richieste extra, tutte in un try: un guasto non tocca la pioggia); «oggi» si riempie solo dalla sera (ore ≥20). ⚠️ L'endpoint rifiuta le raffiche di richieste: nel collector c'è un retry con pausa 1,5s (52/57 transitori al collaudo, 57/57 col retry). Backfill `backfill-meteo-altoadige.js` dal 27/6
- **ATTENZIONE:** il cumulato dell'API riparte da zero a mezzanotte, ma il reset non è istantaneo. Un run che scivola oltre mezzanotte può leggere ancora i totali di ieri e scriverli nel file di oggi, dove il merge MAX li congela per sempre. Dal 22 luglio 2026 il collector ha una **guardia**: se il file del giorno non esiste ancora e il payload somiglia troppo a quello del giorno precedente (con somma > 0), salta la scrittura. **Dal 5 agosto 2026 la somiglianza si misura sulle sole stazioni BAGNATE** — pioggia in almeno uno dei due giorni — con soglia 60% e minimo 5 stazioni: contando tutte le stazioni, in una giornata quasi asciutta gli zeri identici per forza nascondono la contaminazione (terza recidiva, 30 luglio). Vedi bug #18.

### Toscana
- **Fonte:** SIR Toscana (Servizio Idrologico Regionale) `sir.toscana.it/monitoraggio/stazioni.php?type=pluvio` — coordinate/quota da CFR Toscana `cfr.toscana.it/monitoraggio/actions.php` (action=PLUVIO, affidabile solo per i metadati)
- **Collect:** `collect-toscana-sir.js` (sostituisce `collect-toscana-gh.js`, dismesso il 12 luglio 2026 — vedi bug #14)
- **Formula:** Δ24h (finestra mobile) da SIR. Merge: vince SEMPRE la lettura più recente dello stesso giorno (mai `max()` tra run diversi — trascinerebbe pioggia del giorno precedente in avanti, stesso bug di Piemonte `cum_rain_24h`), con eccezione: se la lettura più recente è 0 ma la precedente era >0, si preserva la precedente (protezione glitch). **La protezione glitch NON si applica nei 3 run di chiusura serali** (`CLOSING=1` dal workflow, o ora locale ≥22): a fine giornata la finestra Δ24h copre quasi esattamente il giorno di calendario e uno 0 è un dato reale — tenerla attiva congelava la pioggia di ieri trascinata dai run del mattino (bug #17).
- **TOSCANA_STATIONS:** 165 stazioni curate (filtrate da 379) nell'index.html
- **Orari:** 9 run/giorno — i 6 regolari (00:15-20:15 UTC) + 3 run di chiusura ravvicinati (20:40, 21:00, 21:20 UTC = 22:40/23:00/23:20 CEST in estate). Essendo SIR consultabile solo per l'istante attuale (nessuna query storica), un run che scivola dopo mezzanotte per ritardi di GitHub Actions scrive sul giorno SBAGLIATO invece di chiudere quello giusto — successo il 15 luglio 2026: i 2 run di chiusura originari (21:35/21:50 UTC) sono partiti in ritardo di ~55 minuti, finendo entrambi dopo mezzanotte CEST. Anticipati a 20:40-21:20 UTC per lasciare più margine, e portati a 3 tentativi invece di 2 per aumentare le probabilità che almeno uno arrivi in tempo. Nota: come per Alto Adige, l'orario fisso UTC non è consapevole del cambio ora legale/solare — in inverno questi run cadranno un'ora prima in orario locale (21:40/22:00/22:20 CET), stesso compromesso già accettato nel progetto. Il passo "Commit e push" ora riprova fino a 5 volte (10s tra un tentativo e l'altro) anche in caso di conflitto push con altri workflow concorrenti (causa del fallimento del run delle 22:42 UTC del 15 luglio — la raccolta dati era riuscita, solo il push era stato rifiutato).
- **Dati corretti da:** 12 luglio 2026 (switch a SIR)
- **Temperatura (dall'11/8/2026):** pagina SIR `stazioni.php?type=termo` (una richiesta per run) — min/max di OGGI (progressivi, finalizzati dai run di chiusura) e di IERI (consolidati) su ~251 stazioni. Niente storico (pagina live-only come la pioggia) → t dal 10/8, cresce un giorno al giorno. **Niente vento** (non esiste su SIR; CFR `action=TERMO` risponde vuoto). ⚠️ **Trappola del parsing**: gli array della pagina hanno nomi offuscati e i nomi stazione contengono PARENTESI («Pisa (Fac. Agraria) (GPRS)») — una regex che si ferma alla prima `)` tronca la riga prima dei valori e fa sembrare la pagina VUOTA (errore commesso l'11/8 mattina, la pagina pareva avere 4 stazioni su 256: gli argomenti si estraggono per stringhe quotate, come già fa `parseSirValues`)
- **ATTENZIONE:** SIR non ha lat/lon nella tabella pubblica — si usano quelli del base-call CFR (stesso IDStazione tra le due fonti). Se CFR cambia ID o smette di rispondere, il collector si rompe anche se SIR funziona.

### Liguria
- **Fonte:** OMIRL `omirl.regione.liguria.it/Omirl/rest/charts/{shortCode}/Pluvio`
- **Collect:** `collect-liguria.js`
- **Formula:** somma `dataSeries[0]` (incrementi orari) per le ore di ieri (mezzanotte-mezzanotte ora italiana)
- **Orari:** 6 run/giorno
- **Dati corretti da:** 19 giugno 2026
- **ATTENZIONE CRITICA:** l'endpoint `/stations/Pluvio` restituisce solo l'ultimo valore 15-min. NON usarlo per totali giornalieri — cattura solo ~25% della pioggia. Usare SEMPRE `/charts/{shortCode}/Pluvio` che dà 69 ore di serie temporale oraria.
- Il collect fa ~199 chiamate API (una per stazione), processate in batch di 10 con retry.
- **Temperatura/vento (dall'11/8/2026):** stessi shortCode, endpoint `/charts/{code}/Termo` (185 stazioni: serie media/min/max ogni 30', **~15 giorni di storia**) e `/charts/{code}/Vento` (57: velocità+raffica, **GIÀ km/h** — validato contro Open-Meteo, rapporto ~0,9). ~240 chiamate in più per run, stessi batch. Backfill `backfill-meteo-liguria.js` dal 28/7 (il massimo che i charts conservano; UNA chiamata per stazione copre tutti i giorni)

### Austria (in produzione dal 7 agosto 2026)
- **Fonte:** GeoSphere Austria Data Hub, `dataset.api.hub.geosphere.at`, dataset **`klima-v2-1h`**, parametro `rr`. **Licenza CC BY 4.0** («Fonte: GeoSphere Austria»), voce in `fonti.html`
- **Collect:** `collect-austria-geosphere.js` + `austria.yml` (6 run/giorno). **~269 stazioni**
- **RICETTA:** somma delle ore `rr` sul giorno solare italiano, finestra `(start, end]` su timestamp di **FINE** intervallo, `MIN_ORE=20` — identica a Svizzera e OSMER. ⚠️ Il giornaliero ufficiale `klima-v2-1d` **non si usa**: è la finestra 06-06 UTC (Klimatag 07-07 solare), stessa trappola di `rre150d0`. Validata su due misure indipendenti: somma oraria contro giornaliero ufficiale (sfasamento 7 ore = 6 Klimatag + 1 fine intervallo, **379 giorni bagnati esatti su 380**, scarto medio 0,050 mm) e **correlazione oraria con MeteoSvizzera** su Rohrspitz↔Altenrhein a 5,0 km (r=0,822 a sfasamento 0 contro 0,32 a ±1 ora)
- **Storico: 365 giorni REALI dal primo giorno** (backfill `backfill-austria-geosphere.js`, girato in locale il 5/8, dal 5/8/2025). **Niente stime, niente fase beta** — a differenza del centro-sud, qui non ci sono buchi di ingestione
- **⚠️ DOPPIONI, il filtro senza cui tutto sballa:** GeoSphere pubblica quasi ogni sito **due volte**, `COMBINED` (serie storica unita, id basso) e `INDIVIDUAL` (strumento fisico, id alto), stessi valori. **189 doppioni su 469.** Il collector deduplica per **distanza (<500 m), non per nome** — «St.Jakob» e «St. Jakob» differiscono per uno spazio. A parità si tiene la COMBINED
- **Vantaggi rispetto alle altre fonti:** una sola richiesta copre tutte le stazioni; le query storiche rispondono su qualsiasi data (auto-riparazione D-3..D-10 gratis, un run fallito non perde dati); e **l'anagrafe pubblica la QUOTA**, cosa che Piemonte, OSMER e MeteoHub non fanno → il filtro dislivello di `check-confini.js` funziona sul confine Alto Adige↔Tirolo, il confronto più stringente dopo le gemelle
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

- **Collect:** `collect-francia-meteofrance.js` + `francia.yml` (4 run/giorno, chiusura
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
- **Collect:** `collect-svizzera-meteoswiss.js` + `svizzera.yml` (5 run/giorno). **270 stazioni** (filtro inventario `rre150h0` attivo; il canton TI resta escluso — lo copre OASI — TRANNE la whitelist `TI_SMN_DA_OASI`, vedi sotto)
- **Le 9 stazioni SMN del Ticino/Moesano si prendono da qui dall'11/8/2026** (whitelist `TI_SMN_DA_OASI`: MAG Cadenazzo, CEV Cevio, COM Comprovasco, OTL Locarno-Monti, LUG Lugano, PIO Piotta, ROE Robièi, SBE S. Bernardino, SBO Stabio): sono di PROPRIETÀ MeteoSvizzera e le condizioni d'uso OASI vietano di ripubblicarne i grezzi — le pubblicavamo via data/ticino da mesi senza accorgercene (trovato al censimento sensori t/w). Migrazione con `migra-ti-smn-da-oasi-a-ogd.js` (una tantum, 11/8): pioggia OGD su tutto lo storico dentro data/svizzera (valori verificati identici a OASI: SBE 16,4=16,4, Lugano 3,5=3,5, Piotta 8,7=8,7 sul 26/7) e gemelle rimosse da TUTTI i file data/ticino (146 file, 1312 voci). SBE non è più un'esclusione: la vecchia costante `SVIZZERA_ESCLUSE` non esiste più. ⚠️ La whitelist è volutamente CHIUSA: la rete SMN in TI ha anche BIA/CIM/GEN e la rete precip altre 7 stazioni — non aggiungerle senza un check doppioni contro le OASI rimaste
- **RICETTA (validata 3/8 su 639 giorni-stazione, match al centesimo):** i giornalieri MeteoSwiss NON coincidono col giorno solare italiano (`rre150d0` = finestra 06-06 UTC, `rka150d0` = giorno di calendario UTC) → si sommano le ORE `rre150h0` (timestamp = FINE intervallo) sul giorno solare italiano, ricetta OSMER, MIN_ORE=20. `_h_recent` contiene già tutte le ore di ieri al mattino presto; `_h_now` (10 min) integra l'ultima ora
- **Auto-riparazione GRATIS D-3..D-10**: `recent` copre l'anno intero, i giorni mancanti si ricostruiscono senza richieste extra (come OASI, un run fallito non perde dati) → soglia allarme fonti 5 giorni (`SOGLIA_PER_REGIONE`)
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
- **Orari:** 4 run/giorno (00:30, 04:30, 10:30, 16:30 UTC) — ogni run raccoglie IERI + ALTROIERI (consolidamento dei valori marcati "provvisorio"). Il giorno corrente non esiste lato API, e tanto la mappa lo esclude comunque (regola #3).
- **ATTENZIONE — pubblicazione tardiva del giornaliero:** OASI pubblica il totale giornaliero di ieri solo a metà mattina (~07:00-08:30 CEST, a rotazione per stazione; prima la riga esiste ma col valore VUOTO). Scoperto il 18 luglio 2026: al mattino presto la mappa mostrava "nessun dato per ieri" sul Ticino. Fix: se il giornaliero non è ancora pubblicato, il collector somma le letture da 10 minuti (`resolution=h`, disponibili in tempo quasi reale; scarto validato ~3% dal giornaliero ufficiale, accettate solo giornate con ≥120/144 letture) e i run successivi sovrascrivono col valore ufficiale.
- **QUERY STORICHE FUNZIONANTI** (unica fonte del progetto ad averle): qualsiasi giorno passato è interrogabile e i dati sono recuperabili retroattivamente — un run fallito non perde mai dati. Archivio: Airolo dal 2017, Lugano dal 2005 (varia per stazione).
- **Dati corretti da:** 18 marzo 2026 (backfill 120 giorni con dati reali di stazione, script `backfill-ticino.js` una tantum)
- **Confine cantone:** `ticino-confine.geojson` nel repo (da swissBOUNDARIES3D), caricato via `geojsonUrl` (meccanismo dedicato per confini non italiani in `setRegionBorder`)
- **Temperatura/vento (dall'11/8/2026):** parametri OASI `T`/`WS`/`WSgust` a 10 minuti (`resolution=h`), stessa ricetta delle altre reti (ore ≥20, m/s ×3,6). Solo **15 stazioni con T, 7 col vento** (censimento 11/8: le pluvio UCA non hanno altri sensori); se T non dà righe si saltano anche WS/WSgust. Backfill `backfill-meteo-ticino.js` dal 27/6
- **Validazione (16-17 luglio 2026):** allineamento calendario confermato con analisi di lag vs Open-Meteo (corr. 0.73-0.82 stesso giorno, ~0.1 a ±1g); coerenza interna verificata (somma 10-min vs giornaliero: scarto 3%); confronti di confine con Piemonte coerenti col microclima (la sponda ovest del Verbano è genuinamente più piovosa).
- Sviluppato e validato nel repo di test `Mappa-Precipitazioni-Nord-Test` (+ sito avventurepluvio-test.netlify.app), promosso in produzione il 17 luglio 2026.

### Centro-Sud via MeteoHub (Marche, Umbria, Lazio, Molise, Campania, Puglia, Basilicata, Calabria, Sicilia, Sardegna)

**Beta PER-REGIONE dal 10/8/2026**: fuori dal beta Marche, Umbria, Campania, Calabria, Sardegna (mai un evento-buco in 30 giorni), Puglia, Basilicata e Molise (un solo evento vecchio, coperto). Restano in validazione **Sicilia e Lazio** (lista `BETA_REGIONS` in index.html, pillola gialla solo per loro). La rete di sicurezza gapfill resta attiva per tutte.
- **Fonte:** MeteoHub / Agenzia ItaliaMeteo (`meteohub.agenziaitaliameteo.it`), reti `dpcn-<regione>` — in larga parte le stesse reti regionali, CC-BY con citazione. Valori validati contro ARPA Lombardia: scarto medie 1-3%, max identici (pilota, luglio 2026)
- **Collect:** `.github/scripts/collect-meteohub.js` + `meteohub.yml` (5 run/giorno: 02:20, 04:20, 07:20, 11:50, 17:50 UTC). Granularità VARIA per rete: il collector sceglie la serie più fitta e la somma, soglia completezza ≥85%. Finestra pubblica API ~10 giorni
- **Gap check:** `.github/scripts/check-meteohub-gaps.js` + `meteohub-gaps.yml` (08:40 UTC) — rileva buchi totali e parziali (<90% della mediana), registro permanente `data/meteohub-gaps.json`, copertura Open-Meteo dopo la grazia (file interi `source: open-meteo-gapfill`, integrazioni parziali `om:true`). **`GRACE_DAYS = 2`**: il buco del giorno G viene coperto quando si arriva a G+2 (verificato nel codice il 4/8/2026 — la doc diceva ancora 3, scarto che porta a conclusioni sbagliate ai check: un file comparso a G+2 è una STIMA, non un recupero)
- **Misura della frequenza:** `.github/scripts/analizza-buchi-meteohub.js` (da lanciare a mano) — legge il registro e dà eventi per settimana, distanza fra un evento e l'altro e quota di giorni finiti a stime, rete per rete. È il numero su cui si decide l'uscita dal beta, al posto del "mi sembra che peggiori"
- **Dati reali da:** Marche/Umbria 13 luglio 2026 (16-17/7 blackout piattaforma, stimati), le altre 8 dal 19 luglio; prima backfill Open-Meteo (`source: open-meteo-backfill-*`) dal 14-20 maggio
- **Temperatura/vento (dall'11/8/2026):** prodotti `B12101` (temperatura, ⚠️ **KELVIN** → `v>100 ? v-273,15`, come la Francia), `B11002` (vento medio, m/s → ×3,6) e `B11041` (raffica, poche stazioni — null dove manca); tre query in più per (rete, giorno), stazioni agganciate per id lat_lon, serie più fitta per prodotto, ore coperte ≥20. Backfill `backfill-meteo-meteohub.js` (finestra API ~9 giorni, dal 2/8)
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

### Valle d'Aosta
- **Fonte:** Centro Funzionale Regione VdA (`presidi2.regione.vda.it`), dati reali di stazione — **dal 26 luglio 2026, al posto di Open-Meteo**
- **Collect:** `.github/scripts/collect-valledaosta-cf.js` + `valledaosta-cf.yml` (4 run/giorno dal 28 luglio 2026: mattutini ridondanti 02:30/04:30/07:30 UTC + 12:15, come già nel test — con 2 soli cron i ritardi di GitHub Actions arrivavano a 3h38 e il file di ieri restava mancante fino a metà mattina). Il vecchio `collect-valledaosta-gh.js`/`valledaosta.yml` (Open-Meteo) è **disattivato** (cron commentati il 26/7, resta lanciabile a mano)
- **~70 stazioni** (66 Centro Funzionale + 6 Arpa)
- **Dati reali da:** 16 luglio 2026. Prima (17/5→15/7): **backfill Open-Meteo** sulle stesse coordinate (`source: open-meteo-backfill-vda`, script `backfill-openmeteo-pilota.js`). Si legge sempre dai file, nessuno switch runtime; la parte reale cresce di 1 giorno/giorno fino a 365
- **Temperatura/vento (dall'11/8/2026):** seconda chiamata `get_allparams_data` per stazione con `aggr:'hh'` → orari di tutti i parametri; prid 1 = Temperatura (°C), prid 10 = Velocità Vento Vett. (**m/s → ×3,6**, validato contro Open-Meteo: Mont-Fleury rapporto 3,81 ≈ 3,6; Donnas più alto del modello ma è la porta del föhn). Nessuna raffica → `w:[media,null]`. Backfill `backfill-meteo-valledaosta.js` dal 27/6 (una chiamata per stazione copre 45 giorni)
- **In mappa:** `dataSource: 'cf_valledaosta'`, `loadCFValdostaRegion`, URL dati da `PILOT_DATA_BASE`

### Friuli Venezia Giulia
- **Fonte:** ARPA OSMER (`www.meteo.fvg.it`), dati reali di stazione — **dal 26 luglio 2026, al posto di Open-Meteo** — + 5 stazioni ARPA Veneto di confine (Cadore/Comelico) per l'alta Carnia NW
- **Collect:** `.github/scripts/collect-friuli-osmer.js` + `friuli-osmer.yml` (2 run/giorno). Il vecchio `collect-friuli-gh.js`/`friuli.yml` (Open-Meteo) è **disattivato** (cron commentati il 26/7, resta lanciabile a mano)
- **~41 stazioni OSMER + 5 Veneto.** Dati reali da 18 luglio 2026; prima (19/5→17/7): backfill Open-Meteo (`source: open-meteo-backfill-friuli`). L'anagrafe del backfill è l'**UNIONE di tutti i file reali** (il feed OSMER pubblica un set variabile, 39-41 staz.)
- **Ricetta OSMER:** ore UTC dal CSV di `getStationData.php` (t=H_2) sommate sul giorno solare italiano; `MIN_ORE=20`; merge a copertura-crescente; cookie di consenso `meteofvg_cookie=1` obbligatorio
- **Due protezioni qualità nel loader `loadOSMERFriuliRegion`:** (1) **filtro copertura** — una stazione OSMER è mostrata solo se presente in ≥80% dei giorni REALI del periodo (nasconde le stazioni a serie oraria bucata, es. Forni di Sopra, San Pietro al Natisone, che davano una macchia secca falsa; l'IDW dei vicini copre); (2) **5 stazioni ARPA Veneto** (Sella Ciampigotto, Santo Stefano di Cadore, Costalta, Domegge, Casamazzagno) lette da `data/veneto`, non filtrate, caricate solo se il Veneto non è già selezionato (no doppioni). Fonte → 'ARPA OSMER FVG + ARPA Veneto'. Limite noto: grafico storico vuoto cliccando una delle 5 Veneto
- **Temperatura/vento (dall'11/8/2026):** lo STESSO CSV orario ha le colonne `Temp. °C`, `Vento med km/h` e `Vento max km/h` (**già km/h**, dichiarato nell'intestazione) — zero richieste extra; la mappa oraria in cache è passata a oggetti `{mm,t,vm,vx}`. Backfill dal 27/6 lanciando il collector con `GIORNI_FINESTRA=45` (l'archivio risponde su qualsiasi giorno passato)
- **In mappa:** `dataSource: 'osmer_fvg'`, URL dati da `PILOT_DATA_BASE`

### Slovenia (v8.0, in produzione dal 12 agosto 2026)

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
  OASI. Il collector del repo di **TEST resta acceso**, come per la Svizzera.
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

---

## UI Features
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
- "Piogge per funghi" (range **15-21 gg fa** dal 7 agosto 2026; 16-23 dal 24 luglio, prima ancora 18-25)
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

## Promozione a non-BETA
**Completata il 18 luglio 2026**: header da "(BETA V3.0)" a "(v4.0)", su decisione dell'utente, anticipando il target originale dell'11 agosto 2026 (30 giorni di dati corretti per tutte le regioni; il vincolo più recente era lo switch Toscana a SIR del 12 luglio 2026).

---

## Sorveglianza automatica (31 luglio 2026)
Due pezzi complementari, nati lo stesso giorno e da leggere insieme: il primo **ripara**, il secondo **avvisa**. Il secondo esiste proprio perché il primo, riparando, nasconde il guasto.

### 1. Rete di sicurezza sui buchi — `check-gaps-nord.js` + `gaps-nord.yml` (09:10 UTC)
Trova i giorni **interamente mancanti** nelle 11 regioni attive e, passata la grazia, li copre con stime Open-Meteo sulle coordinate delle stazioni vere (`source: open-meteo-gapfill`). Serve perché il sito somma i giorni che trova e scrive "✅ 30 giorni" con un totale più basso del vero, senza dirlo: fra una stima dichiarata e un buco silenzioso che falsa i totali, la stima è meglio.
- **Grazia 3 giorni** (8 per il Ticino, l'unica fonte con query storiche funzionanti: il suo collector si auto-ripara fino a D-7). Misurata su 45 giorni di cronologia git: il file di un giorno arriva entro D+1 in tutte le regioni, mai oltre; e a D-3 nessun collector sta più scrivendo su quel giorno, quindi una stima non può finire dentro un merge MAX.
- Rileva **solo** i giorni interi, non quelli "corti": nel Nord il numero di stazioni oscilla da sé e una soglia sulle stazioni darebbe falsi allarmi a raffica.
- Tetto di 5 coperture per run, riprova sul 429. Registro `data/gaps-nord.json`.
- Uso a mano per buchi vecchi: `SCAN_DAYS=400 node check-gaps-nord.js`. Al primo giro (31/7) ha tappato i 5 buchi storici del Nord su ~4.000 giorni-regione.

### 2. Allarme fonti via mail — `check-fonti.js` + `alert-fonti.yml` (09:43 UTC)
Manda una mail quando una fonte si rompe. **Due guasti sorvegliati, stessa soglia di giorni:**

**(a) Nessun dato** — nessun file con dati reali per 3 giorni consecutivi (5 per il Ticino).
- **Guarda solo i file reali, ignora quelli `open-meteo-*`.** È il punto centrale: senza questa esclusione, dal terzo giorno il gapfill fa comparire il file e una regione morta sembrerebbe viva per sempre. Piemonte e Veneto non scrivono il campo `source`, quindi il test è **per esclusione** (è una stima solo se il source dice open-meteo), mai per inclusione. Un file con zero stazioni conta come giorno mancante.
- Tre è anche il giorno in cui il gapfill inizia a coprire: la mail arriva esattamente quando il buco smetterebbe di vedersi.

**(b) Dati parziali** (dal 31/7/2026) — meno del **50%** delle stazioni per lo stesso numero di giorni consecutivi.
- Serve perché una fonte che consegna il 6% delle stazioni è rotta quanto una spenta, ma il file c'è e il controllo (a) la vedrebbe sana. In mappa è peggio di un buco: il totale sembra plausibile e le zone scoperte risultano asciutte anche se ci ha piovuto.
- **Il 50% non può dare falsi allarmi**, misurato su 731 giorni-regione: il calo più profondo mai registrato è **97,8%** (sei stazioni su 272 in Piemonte, sette su 323 in Emilia), nessun giorno sotto il 90%. Fra il rumore vero e la soglia c'è un abisso. Lo script di misura è usa e getta, il numero è qui.
- Servono 3 giorni e non 1 perché un run parzialmente fallito capita (la Liguria fa 199 chiamate, una per stazione) e il run dopo lo ripara da sé.
- **Il riferimento è il massimo fra tre numeri**: mediana a 14 giorni, mediana a 45, e valore congelato nel registro all'apertura dell'allarme. Non è pignoleria: con la sola mediana a 14 giorni, 20 giorni di Liguria a 20 stazioni su 199 **non suonavano affatto** — la finestra si era riempita di giorni degradati e il guasto era diventato la normalità. Trovato provando sul serio (accorciando davvero i file), non ragionando.

**Comune ai due:**
- Il guasto più grave vince: una regione spenta è segnalata come assente, non come "a stazioni ridotte". Se la natura del guasto cambia, riparte un allarme nuovo.
- Una sola mail per run con dentro tutto: allarmi nuovi, promemoria ogni 3 giorni sui guasti aperti, rientri, e il lunedì il riepilogo delle 11 regioni. Registro `data/alert-fonti.json`, che si aggiorna ogni giorno e fa da cruscotto: per ogni regione dice l'ultimo dato **reale**, le stazioni di ieri e la loro normalità.
- **Invio con `curl` verso `smtps://smtp.gmail.com:465`, non con un'action di terzi**, così la password per le app di Gmail non esce dal runner. Lo script scrive il messaggio completo (intestazioni comprese, oggetto in encoded-word base64 per emoji e accenti) in `alert-mail.eml`, che è in `.gitignore`. Secret: `MAIL_USER`, `MAIL_PASS`, `MAIL_TO`. Se mancano, il workflow **fallisce apposta** — meglio la notifica di errore di GitHub che un allarme che tace credendo di funzionare.
- Prove a mano, nessuna tocca il registro: `TEST_MAIL=1` (mail di prova), `SIMULA=liguria:4` (ferma da 4 giorni), `SIMULA=liguria:4:staz` (stazioni ridotte da 4 giorni). Disponibili anche come input del workflow.
**(c) Eventi-buco MeteoHub** (dal 1/8/2026, con la migrazione v5.0) — le 10 regioni MeteoHub sono nella lista `REGIONI` (21 totali sorvegliate), ma per loro il controllo (b) da solo **non basta**: `check-meteohub-gaps.js` integra le stazioni mancanti dentro il file marcandole `om:true`, quindi il conteggio torna pieno e il giorno sembra sano (il 27/7 la Puglia aveva 0 stazioni buone su 128: guardata dopo, non si vedeva più). `check-fonti.js` legge quindi il registro `data/meteohub-gaps.json`, che i giorni rotti li misura PRIMA della copertura: **3 giorni consecutivi con eventi (mancante o parziale) che finiscono a ieri** (tolleranza 1 giorno per il lag di rilevamento) fanno partire la mail, tipo di guasto `eventi`. Prova a mano: `SIMULA=puglia:4:eventi` (per le reti MeteoHub vale anche il nome corto: `puglia` = `meteohub-puglia`). Collaudato il 1/8/2026: `simula puglia:4` → "Puglia ferma da 4 giorni", `puglia:4:eventi` → "Puglia con buchi MeteoHub da 4 giorni" coi dettagli dal registro.

---

## Check periodico dati
Ogni ~5 giorni verificare:
1. Confronto stazioni al confine tra regioni confinanti (stessa pioggia?) — **automatizzato dal 4 agosto 2026: `node .github/scripts/check-confini.js <confine>`**, `--lista` per i nomi (svizzera, emilia-piemonte, emilia-liguria, toscana-emilia, lombardia-trentino). Vedi la sezione dedicata più sotto.
2. Nessun valore anomalo (>150mm/giorno)
3. Nessun calo improvviso nel numero di stazioni
4. Workflow tutti verdi
5. Confronto puntuale con fonti ufficiali (cfr.toscana.it, omirl.regione.liguria.it, apps.arpae.it)
6. **Nessun file giornaliero identico a quello del giorno precedente** (confronto stazione per stazione, non solo del totale): è la firma comune dei bug #17, #18 e #19 — pioggia di ieri trascinata sul giorno dopo. Quando salta fuori, confrontare sempre con l'API interrogata in diretta prima di concludere.
   - **Come NON farlo** (provato il 4/8/2026): contando tutte le stazioni identiche escono oltre cento "casi" su 24 cartelle, tutti falsi. In una giornata quasi asciutta il 97% delle stazioni è 0 in entrambi i giorni, quindi "identiche" per forza — il controllo misura il bel tempo, non un guasto.
   - **Come farlo**: confrontare **solo le stazioni bagnate** (almeno una delle due giornate sopra zero), su giornate con almeno ~20 mm complessivi, escludendo il giorno in corso (durante il giorno Toscana e Alto Adige contengono per costruzione la coda di ieri, ed è regolare: la mappa esclude oggi comunque, regola #3). Con questi paletti il 4/8 il risultato era pulito su 25 giorni e tutte le cartelle.

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
