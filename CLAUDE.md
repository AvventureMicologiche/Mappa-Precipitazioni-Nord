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
2. **Verifica prima di procedere:** spiega le modifiche proposte e aspetta l'approvazione esplicita prima di toccare qualsiasi file.
3. **La mappa mostra solo "ieri" e periodi passati.** I dati della giornata odierna sono esclusi dalla visualizzazione.
4. **Open-Meteo si usa SOLO per Valle d'Aosta e Friuli.** Tutte le altre regioni usano dati ARPA reali.
5. **Direzione geografica:** per spostare il centro mappa visivamente verso il basso, la latitudine deve AUMENTARE, non diminuire.

---

## Architettura dati per regione

### Lombardia
- **Fonte:** ARPA Lombardia Socrata API (live dal frontend, no collect script)
- **Formula:** `sum(valore)` nella query API
- **File su GitHub:** NO (dati caricati live dal browser)
- **Stato:** ✅ sempre corretto

### Piemonte
- **Fonte:** ARPA Piemonte `utility.arpa.piemonte.it/api_realtime`
- **Collect:** `collect-piemonte.js`
- **Formula:** `sum(cum_rain_1h)` per totale giornaliero + merge MAX protezione
- **Merge MAX:** se "aggiorna ieri" riceve <1000 record, salta l'aggiornamento
- **PIEMONTE_STATIONS:** 170 stazioni curate (filtrate da 275) nell'index.html. Ceppo Morelli esclusa (sensore offline).
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
- **Orari:** 6 run/giorno + aggiorna ieri
- **Dati corretti da:** 6 giugno 2026

### Alto Adige
- **Fonte:** Meteo BZ API (solo dati odierni)
- **Collect:** `collect-altoadige-gh.js`
- **Formula:** `sensorValue` con merge MAX
- **Orari:** 7 run/giorno (ultimo alle 23:55 CEST)
- **Dati corretti da:** 4 giugno 2026

### Toscana
- **Fonte:** SIR Toscana (Servizio Idrologico Regionale) `sir.toscana.it/monitoraggio/stazioni.php?type=pluvio` — coordinate/quota da CFR Toscana `cfr.toscana.it/monitoraggio/actions.php` (action=PLUVIO, affidabile solo per i metadati)
- **Collect:** `collect-toscana-sir.js` (sostituisce `collect-toscana-gh.js`, dismesso il 12 luglio 2026 — vedi bug #14)
- **Formula:** Δ24h (finestra mobile) da SIR. Merge: vince SEMPRE la lettura più recente dello stesso giorno (mai `max()` tra run diversi — trascinerebbe pioggia del giorno precedente in avanti, stesso bug di Piemonte `cum_rain_24h`), con eccezione: se la lettura più recente è 0 ma la precedente era >0, si preserva la precedente (protezione glitch).
- **TOSCANA_STATIONS:** 165 stazioni curate (filtrate da 379) nell'index.html
- **Orari:** 8 run/giorno — i 6 regolari (00:15-20:15 UTC) + 2 run di chiusura a ridosso di mezzanotte (21:35 e 21:50 UTC = 23:35 e 23:50 CEST in estate). I due run di chiusura sono la protezione: essendo SIR consultabile solo per l'istante attuale (nessuna query storica), se il run delle 23:50 fallisce del tutto (3 tentativi falliti) quello delle 23:35 ha già scritto un valore quasi definitivo che resta buono; se invece il run delle 23:35 fallisce, quello delle 23:50 lo recupera 15 minuti dopo. Nota: come per Alto Adige, l'orario fisso UTC non è consapevole del cambio ora legale/solare — in inverno i due run di chiusura cadranno alle 22:35/22:50 CET invece che alle 23:35/23:50, stesso compromesso già accettato nel progetto.
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

### Valle d'Aosta
- **Fonte:** Open-Meteo `precipitation_sum`
- **Collect:** `collect-valledaosta-gh.js`
- **~45 stazioni**
- **Dati corretti da:** 4 giugno 2026

### Friuli Venezia Giulia
- **Fonte:** Open-Meteo `precipitation_sum`
- **Collect:** `collect-friuli-gh.js`
- **~30 stazioni**
- **Dati corretti da:** 4 giugno 2026

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

---

## UI Features
- Spinner di caricamento (overlay CSS, z-index 800)
- YouTube "ISCRIVITI" button nel box canale (nascosto su mobile ≤600px)
- Home icon nell'header
- Pulsanti periodo: Ieri/7gg/10gg/15gg/20gg/30gg
- "Piogge per funghi" (range 18-25 gg fa)
- Date personalizzate
- Nota "I dati escludono la giornata odierna"
- IDW_RAD: 0.15 per ≤24h, 0.35 per periodi più lunghi
- CACHE_VER: arpa5v7_

---

## Promozione a non-BETA
**Target: 11 agosto 2026** (30 giorni dati corretti per tutte le regioni — aggiornato dopo lo switch Toscana a SIR del 12 luglio 2026, che ora è il vincolo più recente).

---

## Check periodico dati
Ogni ~5 giorni verificare:
1. Confronto stazioni al confine tra regioni confinanti (stessa pioggia?)
2. Nessun valore anomalo (>150mm/giorno)
3. Nessun calo improvviso nel numero di stazioni
4. Workflow tutti verdi
5. Confronto puntuale con fonti ufficiali (cfr.toscana.it, omirl.regione.liguria.it, apps.arpae.it)
