# Mappa Precipitazioni Nord Italia — CLAUDE.md

## Progetto
Mappa interattiva delle precipitazioni del Nord Italia per il canale YouTube "Avventure Micologiche". Mostra dati pluviometrici reali da stazioni ARPA regionali su heatmap Leaflet.

- **Dev:** avventurepluvio.netlify.app
- **Prod:** precipitazioni.avventuremicologiche.it
- **Repo:** github.com/AvventureMicologiche/Mappa-Precipitazioni-Nord
- **Stack:** Leaflet 1.9.4, OpenStreetMap, Netlify (hosting + Functions), GitHub Actions (data collection)

---

## Regole fondamentali

1. **Lo storico precipitazioni deve essere SEMPRE accurato e completo.** Mai accettare dati parziali o sbagliati come "non catastrofici". Ogni problema va risolto completamente.
1b. **Retention: max 365 giorni di storico per regione.** Finestra scorrevole: ogni nuovo giorno raccolto elimina il più vecchio oltre i 365. Ogni collector DEVE avere il blocco "Pulizia retention" a fine main() (uniformato a tutti i collector il 16 luglio 2026 — prima lo avevano solo Piemonte, Emilia, Veneto e Liguria, le altre regioni erano arrivate a 417-420 giorni).
2. **Verifica prima di procedere:** spiega le modifiche proposte e aspetta l'approvazione esplicita prima di toccare qualsiasi file.
3. **La mappa mostra solo "ieri" e periodi passati.** I dati della giornata odierna sono esclusi dalla visualizzazione.
4. **Tutte le regioni usano dati di stazione reali** (ARPA regionali, SIR Toscana, OASI Ticino, Centro Funzionale VdA, ARPA OSMER Friuli). VdA e Friuli sono passate ai dati reali il **26 luglio 2026** (prima erano Open-Meteo). Open-Meteo resta solo come: (a) **backfill storico** dei due piloti — stime per i giorni prima dell'inizio del dato reale, `source: open-meteo-backfill-*`; (b) fallback dei loader se i file mancano.
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
- **ATTENZIONE:** il grafico storico per stazione interroga ancora Socrata per sensore (via `idsensore` nei dati), NON i file — resta l'unica cosa live della Lombardia
- **Sensori morti:** su 325 in anagrafe, ~250 riportano; su 30 giorni 71 non riportano mai (0 online genuinamente a zero → una stazione a ~0 su un mese è morta, non asciutta)

### Piemonte
- **Fonte:** ARPA Piemonte `utility.arpa.piemonte.it/api_realtime`
- **Collect:** `collect-piemonte.js`
- **Formula:** `sum(cum_rain_1h)` per totale giornaliero + merge MAX protezione
- **Merge MAX:** se "aggiorna ieri" riceve <1000 record, salta l'aggiornamento
- **PIEMONTE_STATIONS:** 170 stazioni curate (filtrate da 275) nell'index.html. Ceppo Morelli esclusa (sensore offline). MONTE MALANOTTE (id 106, Cuneo) NON è in lista e non va aggiunta: pluviometro guasto dal 16 luglio 2026 — pioggia fantasma per giorni consecutivi (fino a 136mm/giorno) con Open-Meteo a 0.0, vicini asciutti e sensori temperatura/umidità null. I valori errati restano nei file grezzi `data/piemonte/` (16-20 luglio+) ma non arrivano mai in mappa (filtro applicato prima dell'accumulo). **Ricontrollata il 25 luglio 2026:** tornata online dal 22/7, ma temperatura/umidità ancora al 100% `null` (la firma del guasto persiste) e nessun evento di pioggia per testare il pluviometro → **esclusa in via definitiva, non riaggiungere e non serve più ricontrollarla ai check periodici.**
- **Orari:** 6 run/giorno
- **Dati corretti da:** ~12 giugno 2026
- **Bug noto:** API manutenzione alle 04:00 UTC → run delle 06:00 CEST spesso fallisce
- **ATTENZIONE:** `cum_rain_24h` è una finestra mobile, NON un totale giornaliero. MAI usare `max(cum_rain_24h)` perché trascina pioggia nel giorno dopo. L'API conserva solo ~1 record per stazione per i giorni vecchi, quindi `sum(cum_rain_1h)` funziona solo quando ci sono i record completi (24/giorno).

### Emilia Romagna
- **Fonte:** ARPAE REST `apps.arpae.it/REST/meteo_giornalieri`
- **Collect:** `collect-emilia.js`
- **Formula:** `precipitazione_cumulata_giornaliera` con `dateKeyPlusOne()` — l'API ARPAE ha offset +1 giorno (chiave 20260606 = dati meteo del 5 giugno)
- **Orari:** 6 run/giorno + aggiorna ieri
- **Dati corretti da:** 5 giugno 2026
- **ATTENZIONE:** l'ARPAE copre 12 stazioni fisicamente in territorio toscano (provincia FI/PT/LU/MS), quasi tutte lungo il crinale appenninico. Nomi non sempre corrispondono a SIR/CFR (es. "Passo delle Radici" vs "Passo Radici"). Queste 9 duplicavano stazioni Toscana rimaste bloccate a 0mm ed erano state rimosse da `TOSCANA_STATIONS` (bug #14) prima ancora di scoprire e risolvere il problema alla radice passando a SIR.

### Veneto
- **Fonte:** ARPA Veneto XML
- **Collect:** `collect-veneto.js`
- **Formula:** `max(vals)` su cumulativi giornalieri con reset a mezzanotte
- **Orari:** 6 run/giorno + aggiorna ieri
- **Dati corretti da:** 4 giugno 2026

### Trentino
- **Fonte:** Meteotrentino API
- **Collect:** `collect-trentino-gh.js`
- **Formula:** `PrecTotale` diretto dall'API
- **Orari:** 7 run/giorno + aggiorna ieri (il cron `30 22 UTC`, aggiunto il 22 luglio 2026, mira le 00:30 locali per raccogliere il giorno appena chiuso senza aspettare il primo run del mattino)
- **Dati corretti da:** 6 giugno 2026
- **ATTENZIONE:** `getValoriAggregatiGiornoJson` pubblica l'aggregato di un giorno **solo a giornata conclusa** — durante il giorno i record per la data odierna non esistono proprio (verificato il 22 luglio 2026 alle 15:15: l'API si fermava al 21). Il file di un giorno viene quindi creato dal ramo "aggiorna ieri" del primo run dopo mezzanotte, non durante il giorno stesso. Il collector NON deve ripiegare sul "giorno più recente disponibile" per riempire il file di oggi: era il bug #19.

### Alto Adige
- **Fonte:** Meteo BZ API (solo dati odierni)
- **Collect:** `collect-altoadige-gh.js`
- **Formula:** `sensorValue` (cumulato dalla mezzanotte) con merge MAX
- **Orari:** 7 run/giorno — il run di chiusura è stato anticipato dalle 21:55 alle **21:05 UTC** il 22 luglio 2026 (bug #18): i cron di GitHub slittano di 40-70 minuti e quello serale atterrava sistematicamente dopo mezzanotte CEST
- **Dati corretti da:** 4 giugno 2026
- **ATTENZIONE:** il cumulato dell'API riparte da zero a mezzanotte, ma il reset non è istantaneo. Un run che scivola oltre mezzanotte può leggere ancora i totali di ieri e scriverli nel file di oggi, dove il merge MAX li congela per sempre. Dal 22 luglio 2026 il collector ha una **guardia**: se il file del giorno non esiste ancora e il payload è identico stazione per stazione a quello del giorno precedente (con somma > 0), salta la scrittura. Vedi bug #18.

### Toscana
- **Fonte:** SIR Toscana (Servizio Idrologico Regionale) `sir.toscana.it/monitoraggio/stazioni.php?type=pluvio` — coordinate/quota da CFR Toscana `cfr.toscana.it/monitoraggio/actions.php` (action=PLUVIO, affidabile solo per i metadati)
- **Collect:** `collect-toscana-sir.js` (sostituisce `collect-toscana-gh.js`, dismesso il 12 luglio 2026 — vedi bug #14)
- **Formula:** Δ24h (finestra mobile) da SIR. Merge: vince SEMPRE la lettura più recente dello stesso giorno (mai `max()` tra run diversi — trascinerebbe pioggia del giorno precedente in avanti, stesso bug di Piemonte `cum_rain_24h`), con eccezione: se la lettura più recente è 0 ma la precedente era >0, si preserva la precedente (protezione glitch). **La protezione glitch NON si applica nei 3 run di chiusura serali** (`CLOSING=1` dal workflow, o ora locale ≥22): a fine giornata la finestra Δ24h copre quasi esattamente il giorno di calendario e uno 0 è un dato reale — tenerla attiva congelava la pioggia di ieri trascinata dai run del mattino (bug #17).
- **TOSCANA_STATIONS:** 165 stazioni curate (filtrate da 379) nell'index.html
- **Orari:** 9 run/giorno — i 6 regolari (00:15-20:15 UTC) + 3 run di chiusura ravvicinati (20:40, 21:00, 21:20 UTC = 22:40/23:00/23:20 CEST in estate). Essendo SIR consultabile solo per l'istante attuale (nessuna query storica), un run che scivola dopo mezzanotte per ritardi di GitHub Actions scrive sul giorno SBAGLIATO invece di chiudere quello giusto — successo il 15 luglio 2026: i 2 run di chiusura originari (21:35/21:50 UTC) sono partiti in ritardo di ~55 minuti, finendo entrambi dopo mezzanotte CEST. Anticipati a 20:40-21:20 UTC per lasciare più margine, e portati a 3 tentativi invece di 2 per aumentare le probabilità che almeno uno arrivi in tempo. Nota: come per Alto Adige, l'orario fisso UTC non è consapevole del cambio ora legale/solare — in inverno questi run cadranno un'ora prima in orario locale (21:40/22:00/22:20 CET), stesso compromesso già accettato nel progetto. Il passo "Commit e push" ora riprova fino a 5 volte (10s tra un tentativo e l'altro) anche in caso di conflitto push con altri workflow concorrenti (causa del fallimento del run delle 22:42 UTC del 15 luglio — la raccolta dati era riuscita, solo il push era stato rifiutato).
- **Dati corretti da:** 12 luglio 2026 (switch a SIR)
- **ATTENZIONE:** SIR non ha lat/lon nella tabella pubblica — si usano quelli del base-call CFR (stesso IDStazione tra le due fonti). Se CFR cambia ID o smette di rispondere, il collector si rompe anche se SIR funziona.

### Liguria
- **Fonte:** OMIRL `omirl.regione.liguria.it/Omirl/rest/charts/{shortCode}/Pluvio`
- **Collect:** `collect-liguria.js`
- **Formula:** somma `dataSeries[0]` (incrementi orari) per le ore di ieri (mezzanotte-mezzanotte ora italiana)
- **Orari:** 6 run/giorno
- **Dati corretti da:** 19 giugno 2026
- **ATTENZIONE CRITICA:** l'endpoint `/stations/Pluvio` restituisce solo l'ultimo valore 15-min. NON usarlo per totali giornalieri — cattura solo ~25% della pioggia. Usare SEMPRE `/charts/{shortCode}/Pluvio` che dà 69 ore di serie temporale oraria.
- Il collect fa ~199 chiamate API (una per stazione), processate in batch di 10 con retry.

### Ticino (Svizzera)
- **Fonte:** OASI (Osservatorio Ambientale della Svizzera Italiana) `oasi.ti.ch/web/rest` — API REST pubblica, licenza libera con citazione fonte
- **Collect:** `collect-ticino-gh.js`
- **Formula:** `resolution=d&parameter=Prec` — valore giornaliero GIÀ aggregato dall'API, nessuna formula. L'ultima lettura vince sempre (il dato giornaliero OASI è autoritativo).
- **~50 stazioni** utilizzabili (59 nel dominio meteo, escluse le 8-9 ARPA Lombardia/Piemonte già coperte dai nostri collector — filtro sul campo `owner`)
- **Coordinate:** l'API usa il sistema svizzero LV95 → conversione a WGS84 nel collector (formule approssimate swisstopo, ~1m di precisione)
- **Orari:** 4 run/giorno (00:30, 04:30, 10:30, 16:30 UTC) — ogni run raccoglie IERI + ALTROIERI (consolidamento dei valori marcati "provvisorio"). Il giorno corrente non esiste lato API, e tanto la mappa lo esclude comunque (regola #3).
- **ATTENZIONE — pubblicazione tardiva del giornaliero:** OASI pubblica il totale giornaliero di ieri solo a metà mattina (~07:00-08:30 CEST, a rotazione per stazione; prima la riga esiste ma col valore VUOTO). Scoperto il 18 luglio 2026: al mattino presto la mappa mostrava "nessun dato per ieri" sul Ticino. Fix: se il giornaliero non è ancora pubblicato, il collector somma le letture da 10 minuti (`resolution=h`, disponibili in tempo quasi reale; scarto validato ~3% dal giornaliero ufficiale, accettate solo giornate con ≥120/144 letture) e i run successivi sovrascrivono col valore ufficiale.
- **QUERY STORICHE FUNZIONANTI** (unica fonte del progetto ad averle): qualsiasi giorno passato è interrogabile e i dati sono recuperabili retroattivamente — un run fallito non perde mai dati. Archivio: Airolo dal 2017, Lugano dal 2005 (varia per stazione).
- **Dati corretti da:** 18 marzo 2026 (backfill 120 giorni con dati reali di stazione, script `backfill-ticino.js` una tantum)
- **Confine cantone:** `ticino-confine.geojson` nel repo (da swissBOUNDARIES3D), caricato via `geojsonUrl` (meccanismo dedicato per confini non italiani in `setRegionBorder`)
- **Validazione (16-17 luglio 2026):** allineamento calendario confermato con analisi di lag vs Open-Meteo (corr. 0.73-0.82 stesso giorno, ~0.1 a ±1g); coerenza interna verificata (somma 10-min vs giornaliero: scarto 3%); confronti di confine con Piemonte coerenti col microclima (la sponda ovest del Verbano è genuinamente più piovosa).
- Sviluppato e validato nel repo di test `Mappa-Precipitazioni-Nord-Test` (+ sito avventurepluvio-test.netlify.app), promosso in produzione il 17 luglio 2026.

### Valle d'Aosta
- **Fonte:** Centro Funzionale Regione VdA (`presidi2.regione.vda.it`), dati reali di stazione — **dal 26 luglio 2026, al posto di Open-Meteo**
- **Collect:** `.github/scripts/collect-valledaosta-cf.js` + `valledaosta-cf.yml` (4 run/giorno dal 28 luglio 2026: mattutini ridondanti 02:30/04:30/07:30 UTC + 12:15, come già nel test — con 2 soli cron i ritardi di GitHub Actions arrivavano a 3h38 e il file di ieri restava mancante fino a metà mattina). Il vecchio `collect-valledaosta-gh.js`/`valledaosta.yml` (Open-Meteo) è **disattivato** (cron commentati il 26/7, resta lanciabile a mano)
- **~70 stazioni** (66 Centro Funzionale + 6 Arpa)
- **Dati reali da:** 16 luglio 2026. Prima (17/5→15/7): **backfill Open-Meteo** sulle stesse coordinate (`source: open-meteo-backfill-vda`, script `backfill-openmeteo-pilota.js`). Si legge sempre dai file, nessuno switch runtime; la parte reale cresce di 1 giorno/giorno fino a 365
- **In mappa:** `dataSource: 'cf_valledaosta'`, `loadCFValdostaRegion`, URL dati da `PILOT_DATA_BASE`

### Friuli Venezia Giulia
- **Fonte:** ARPA OSMER (`www.meteo.fvg.it`), dati reali di stazione — **dal 26 luglio 2026, al posto di Open-Meteo** — + 5 stazioni ARPA Veneto di confine (Cadore/Comelico) per l'alta Carnia NW
- **Collect:** `.github/scripts/collect-friuli-osmer.js` + `friuli-osmer.yml` (2 run/giorno). Il vecchio `collect-friuli-gh.js`/`friuli.yml` (Open-Meteo) è **disattivato** (cron commentati il 26/7, resta lanciabile a mano)
- **~41 stazioni OSMER + 5 Veneto.** Dati reali da 18 luglio 2026; prima (19/5→17/7): backfill Open-Meteo (`source: open-meteo-backfill-friuli`). L'anagrafe del backfill è l'**UNIONE di tutti i file reali** (il feed OSMER pubblica un set variabile, 39-41 staz.)
- **Ricetta OSMER:** ore UTC dal CSV di `getStationData.php` (t=H_2) sommate sul giorno solare italiano; `MIN_ORE=20`; merge a copertura-crescente; cookie di consenso `meteofvg_cookie=1` obbligatorio
- **Due protezioni qualità nel loader `loadOSMERFriuliRegion`:** (1) **filtro copertura** — una stazione OSMER è mostrata solo se presente in ≥80% dei giorni REALI del periodo (nasconde le stazioni a serie oraria bucata, es. Forni di Sopra, San Pietro al Natisone, che davano una macchia secca falsa; l'IDW dei vicini copre); (2) **5 stazioni ARPA Veneto** (Sella Ciampigotto, Santo Stefano di Cadore, Costalta, Domegge, Casamazzagno) lette da `data/veneto`, non filtrate, caricate solo se il Veneto non è già selezionato (no doppioni). Fonte → 'ARPA OSMER FVG + ARPA Veneto'. Limite noto: grafico storico vuoto cliccando una delle 5 Veneto
- **In mappa:** `dataSource: 'osmer_fvg'`, URL dati da `PILOT_DATA_BASE`

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

19. **Trentino: il file di oggi era sempre una copia di ieri.** Trovato allo stesso check. L'API `getValoriAggregatiGiornoJson` pubblica l'aggregato di un giorno solo a giornata conclusa, quindi i record per la data odierna non esistono mai durante il giorno; il collector ripiegava sul *"giorno più recente disponibile"* e scriveva quei valori nel file di OGGI. Il file veniva poi corretto dal ramo "aggiorna ieri" del primo run del mattino successivo (03:5x UTC = 05:5x locali). Effetto in mappa: tra mezzanotte e le ~05:50 locali "ieri" mostrava i dati dell'altro ieri — il 21 luglio, per esempio, 417mm di pioggia attribuiti al giorno sbagliato. Lo storico multi-giorno era invece integro, perché ogni file veniva corretto entro il mattino dopo. Fix: rimosso il fallback — se non ci sono record per la data richiesta si salta il salvataggio di oggi e si procede col solo aggiornamento di ieri. Effetto collaterale accettato: nella finestra 00:00-05:50 il Trentino risulta assente da "ieri" invece che sbagliato; per accorciarla è stato aggiunto il cron `30 22 UTC` (00:30 locali). Il file del 22 luglio, copia del 21, è stato cancellato e ricreato dal run successivo.

---

## UI Features
- Spinner di caricamento (overlay CSS, z-index 800)
- YouTube "ISCRIVITI" button nel box canale (nascosto su mobile ≤600px)
- Home icon nell'header
- Pulsanti periodo: Ieri/7gg/10gg/15gg/20gg/30gg
- "Piogge per funghi" (range 16-23 gg fa, dal 24 luglio 2026 — prima 18-25)
- Date personalizzate
- Nota "I dati escludono la giornata odierna"
- IDW_RAD: 0.15 per ≤24h, 0.35 per periodi più lunghi
- CACHE_VER: arpa5v7_
- Eventi Google Analytics (18 luglio 2026): `analisi_regione` con parametro `regione` in loadData (dimensione personalizzata "Regioni" in GA4), `click_home` e `click_youtube` sui link header/canale
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
- **Caricamento robusto ai clic troppo rapidi** (1 agosto 2026, prod e test insieme): un utente che clicca un periodo nei primissimi istanti della prima visita (cache fredda) poteva incagliare il caricamento — 30s di «Calcolo mappa…» e poi «⚠️ Caricamento timeout» (visto dal vivo, mai riprodotto a comando; al secondo tentativo rientrava sempre). Due difese, agganciate al meccanismo di sessione esistente (`loadSessionId`, "l'ultimo clic vince", più `if(isLoading) return` che ignora i clic durante un caricamento):
  - **Riprova automatica sul timeout di sicurezza**: allo scadere dei 30s, se la sessione è ancora quella (= l'utente è rimasto in attesa, non ha cliccato altro), il sito riprova **una volta sola** da solo (`_autoRetryUsed`/`_retryCall` accanto a `loadSessionId`); se fallisce anche la riprova, errore come prima. Il budget si rinnova a ogni caricamento chiesto dall'utente. Provato strozzando `window.fetch` sui file Lombardia: rete che torna dopo 25s → a 30,1s riprova silenziosa, ✅ a 30,7s senza che l'utente veda nulla; rete rotta per sempre → un solo giro di riprova e poi l'errore, nessun avvitamento.
  - **Barriera confini in `renderMulti`** (portata dal test, dove girava dal 29/7 — fix "Toscana scomparsa dalla heatmap"): se il GeoJSON di una regione attiva non è ancora arrivato, si aspetta con `loadAllBorders` e si ridisegna, un solo retry. Prima la prod disegnava col confine vuoto, escludendo la regione dalla heatmap.
  - Provato anche il **cliccatore compulsivo** (16 azioni a caso in 2,6s su periodi e regioni): converge sempre sull'ultimo clic, nessun errore — il comportamento è identico a prima, le due difese non aggiungono stati nuovi.

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

### 2. Allarme fonti via mail — `check-fonti.js` + `alert-fonti.yml` (09:30 UTC)
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
- **Da fare alla migrazione Italia v5.0**: aggiungere le 10 regioni MeteoHub alla lista `REGIONI`. Attenzione, il controllo (b) da solo **non basta** per loro: `check-meteohub-gaps.js` integra le stazioni mancanti dentro il file marcandole `om:true`, quindi il conteggio delle stazioni torna pieno e il giorno sembra sano. Va letto il registro `data/meteohub-gaps.json`, che quei giorni parziali li misura prima della copertura. Checklist completa nel repo di test, `MIGRAZIONE-v5.md`.

---

## Check periodico dati
Ogni ~5 giorni verificare:
1. Confronto stazioni al confine tra regioni confinanti (stessa pioggia?)
2. Nessun valore anomalo (>150mm/giorno)
3. Nessun calo improvviso nel numero di stazioni
4. Workflow tutti verdi
5. Confronto puntuale con fonti ufficiali (cfr.toscana.it, omirl.regione.liguria.it, apps.arpae.it)
6. **Nessun file giornaliero identico a quello del giorno precedente** (confronto stazione per stazione, non solo del totale): è la firma comune dei bug #17, #18 e #19 — pioggia di ieri trascinata sul giorno dopo. Quando salta fuori, confrontare sempre con l'API interrogata in diretta prima di concludere.
