# Ottavo check — mercoledì 21/10/2026

Repo di produzione al commit `b7895496` (09:0x italiane). Nessun file del sito o di `data/` toccato, nessun workflow
lanciato, nessuna richiesta a MET Norway né alla Function vera (le poche richieste al sito vero le ha bloccate il proxy
con un 403: tutte le prove sono sul repo servito in locale, con Chromium headless, jsdom e finti fetch/Cache API).

**In breve: nessun bug di gravità alta.** Due difetti di gravità media, tutti e due nelle immagini della «mappa nella
scheda in cima», e una dozzina di difetti bassi. Le correzioni del settimo check sono a posto e non hanno rotto niente.

---

## Parte 1 — modifiche del 20/10 dalle 12:00

### 1. MEDIA — In sei regioni l'immagine «pulita» non contiene tutta la regione: su 8 pagine paese il segnaposto sparisce o finisce sotto l'etichetta
- **Dove:** `.github/scripts/genera-anteprime.js:69-88` (`scattaPulita`). L'effetto si vede in `lib-striscia.js:57-83` (`ritaglia`).
- **Cosa succede:** si scatta l'inquadratura del sito da computer, che sta sopra il «tutto visibile». Quindi il riquadro
  della regione scritto nel JSON esce dall'immagine 1600×918.
  - Verificato a mano su `origin/anteprime:lombardia-mappa.json` (z 9, x0 68121, y0 46341): il nord della regione cade
    a **y = −45 px**, il sud a **y = 973** su un'immagine alta 918.
  - Stessa cosa per Umbria (−39/+92), Molise (−134/+107, e anche a destra), Puglia (−92 sopra), Sicilia (−96 sopra) e
    Basilicata (−66/+18); per le immagini dei boschi anche le Marche, al limite.
  - `ritaglia` ferma lo sfondo al bordo dell'immagine, quindi il punto finisce fuori dal riquadro.
- **Chi lo vede:** telefono (360 px) e computer, nella scheda in cima.
  - Segnaposto assente: `funghi/lombardia/santa-margherita-di-staffora-casanova/` (top 133 su un riquadro alto 122) e
    `…-passo-del-giova/`.
  - Segnaposto sotto l'etichetta gialla: varzi-nivione, valverde, romagnese (Lombardia), capodacqua, umito (Marche),
    terranova-di-pollino (Basilicata).
  - Valtiberina (zona piogge e funghi, regione di casa Umbria): la zona resta schiacciata in cima al riquadro.
- **Riprodurre:** aprire `/funghi/lombardia/santa-margherita-di-staffora-casanova/` a 360 px; oppure proiettare `reg`
  di `<k>-mappa.json` con z/x0/y0 dello stesso file.
- **Correzione proposta:**
  1. in `scattaPulita`, prima dello scatto, `mp.fitBounds(b, {padding:[16,16], animate:false})` sul confine (o abbassare
     lo zoom finché `reg` sta dentro), con ~1,5 s di attesa per il ridisegno;
  2. rifare le pioggia (giro normale) e i boschi a mano (`BOSCHI=1`).

### 2. MEDIA — La mappa «di ieri» non controlla la data: un'immagine vecchia esce come ieri
- **Dove:** `lib-striscia.js:86-91` e `:114` (`carica('ieri')`); `genera-anteprime.js:107-109` (`scattaIeri` che
  fallisce torna solo una stringa); `anteprime.yml:89-96` (rimette i vecchi `<k>-ieri.*` dal ramo).
- **Cosa succede:** se lo scatto di ieri fallisce (il «✅» non arriva, oppure GitHub salta il giro, cosa documentata), sul
  ramo resta l'immagine dell'altroieri. La pagina non confronta `j.da` con il `da=` del suo bottone.
- **Chi lo vede:** 23 pagine regione e 114 zone piogge. Sotto «Ieri, 21 ottobre» compare la pioggia di un giorno prima,
  senza nessun avviso. Sulle pagine funghi l'effetto è più lieve (i 20 giorni).
- **Riprodurre:** sul ramo `anteprime` lasciare un `<k>-ieri.json` con `da` = altroieri e aprire `/<k>/`.
- **Correzione proposta:**
  1. in `carica`/`metti`, per il tipo `ieri`, leggere `da` dall'href del vecchio bottone; se è diverso da `g.j.da` non
     mettere l'immagine (il riquadro resta blu: è già il comportamento quando l'immagine manca);
  2. in `scatta` scrivere nel log quando la pulita o l'ieri falliscono.

### 3. BASSA — Indice `/funghi/`: i due riquadri tagliano la regione del primo posto
- **Dove:** `genera-indice-funghi.js:341-342` (`backgroundImage` messo a mano) e `:138` (`background-position:50% 50%`).
- **Cosa succede:** qui non si usa `ritaglia`. La regione non sta al centro dell'immagine, quindi il ritaglio centrato ne
  mostra solo una parte: Liguria 69%, Emilia 71%, Marche 76%, Friuli 80%, Toscana 86%. Oggi, col primo posto Terrinca,
  il riquadro taglia Arezzo e la Valdichiana e mostra mare e Corsica.
  - Manca anche `?v=<generato>`: il browser può tenere l'immagine del giorno prima.
- **Correzione proposta:** leggere `<reg>-mappa.json` e centrare con la formula di `ritaglia` (`tipo:'regione'`), oppure
  chiamare la stessa funzione di `lib-striscia`.

### 4. BASSA — Previsioni guaste: sparisce anche il bottone del radar
- **Dove:** `lib-meteo-regione.js:290`. Il `return` del ramo guasto viene prima della costruzione del bottone (righe 306-318).
- **Cosa succede:** con l'API in 502, la rete giù, `italia.json` mancante o `giorni` con meno di 3 voci, si vede solo il
  messaggio di guasto. Sull'indice `/funghi/` il bottone è l'unica porta al radar, ed è proprio il momento in cui servirebbe.
- **Correzione proposta:** nel ramo guasto costruire comunque il bottone grigio «📡 Dove sta piovendo adesso» quando il
  link del radar esiste.

### 5. BASSA — Indice `/funghi/`: il link di ripiego apre la mappa vuota
- **Dove:** `lib-meteo-regione.js:290`, il link `SITO + '/?r=' + K + '&m=prev'` con `K='italia'`.
- **Cosa succede:** la mappa non conosce la regione `italia`. Il ramo `m=prev` di `index.html` (~riga 16805) aspetta 15 s
  e poi non fa niente: mappa senza regione e senza previsioni.
  - Sulle pagine paese e zona lo stesso link perde il segnaposto (manca `pl`/`pn`).
- **Correzione proposta:** con `OPZ.primi` usare la regione del primo posto (o togliere `r`); dove c'è un posto,
  aggiungere `pl(x)`.
- ⚠️ «aprile sulla mappa» (= «apri le previsioni sulla mappa») **non è un refuso**: è corretto, solo ambiguo col mese.
  Se si vuole, «aprile sulla mappa» → «guardale sulla mappa».

### 6. BASSA — Pagine paese: la regola dei 2 km del comune doppione guarda in un verso solo
- **Dove:** `genera-pagine-localita.js:169`.
- **Cosa succede:** il comune si toglie solo se il suo nome sta DENTRO quello del pluviometro. Il caso inverso, cioè
  pluviometro dal nome corto e comune dal nome lungo a meno di 2 km, resta: circa 14 doppi veri su 16 pagine.
  - toscana/ortignano: «Ortignano Raggiolo» a 0,08 km.
  - piemonte/castellania: «Castellania Coppi» a 0,10 km.
  - trentino/pieve-di-bono: «Pieve di Bono-Prezzo» a 0,27 km.
  - veneto/perarolo: «Perarolo di Cadore» a 0,33 km.
  - Anche san-genesio, tione, cembra, auronzo, monterotondo, scheggia, borgone, brembilla, anzino e civitella.
  - Nel verso già coperto c'è un falso positivo: su lombardia/san-nazzaro-val-cavargna-c5 sparisce «Cavargna» (1,43 km),
    che è un altro comune.
- **Chi lo vede:** tutti, in «Che tempo farà»: due righe quasi uguali una sotto l'altra.
- **Riprodurre:** `data/paesi-localita/toscana.json`, voce `ortignano`.
- **Correzione proposta:** aggiungere `|| (c.d <= 2 && (' ' + normNome(c.n) + ' ').includes(' ' + io + ' '))`.
  Toglierebbe anche «Molini di Triora» da triora (1,05 km): eccezione minore, da accettare o escludere a mano.

### 7. BASSA — Grafico: il buco fra misurati e previsti si disegna al massimo per 3 giorni
- **Dove:** `lib-meteo-regione.js:366`, `Math.min(buco, 3)`.
- **Cosa succede:** con un riepilogo fresco ma l'ultimo giorno misurato vecchio di più di 4 giorni (fonte ferma,
  MeteoHub/Puglia), i giorni in mezzo spariscono senza segno e l'ultima barra misurata sta attaccata a «oggi».
- **Correzione proposta:** togliere il tetto, oppure non agganciare i previsti quando il buco supera 3.

### 8. BASSA — Nomi delle frazioni non protetti nel menu delle caselle
- **Dove:** `lib-meteo-regione.js:220`. `x.fraz` (e `x.sg`) vanno in `innerHTML` senza `esc()`.
- **Cosa succede:** `x.fraz` viene da `admin2`/`admin1` del geocoder Open-Meteo, cioè da GeoNames: un dato esterno.
  - Provato con un geocoder finto: `admin2:'<img src=x onerror=1>'` crea davvero un `<img>` nel menu.
  - Si sfrutta male, perché il testo è tagliato a 18 caratteri e bisogna sporcare GeoNames, ma l'iniezione è reale.
- **Correzione proposta:** `esc(x.fraz)` ed `esc(x.sg)`.

### 9. BASSA — Pagine paese di un pluviometro sospeso: il bottone perde il suo testo
- **Dove:** `lib-striscia.js:95-128` (`metti`), insieme a `genera-pagine-localita.js:749`.
- **Cosa succede:** nel ramo «sospesi» il bottone dice «Vedi i vicini sulla mappa», ma `metti()` lo sostituisce sempre
  con «💧 Guarda la pioggia / ultimi 20 giorni».
  - Esempio: `funghi/liguria/sella-giassina/` dice «i millimetri sono sbagliati» e sopra invita a guardare la pioggia.
- **Correzione proposta:** se il testo del vecchio bottone non è «Vedi sulla mappa», lasciare il bottone com'è.

### 10. BASSA (statistiche) — Cambia il nome dell'evento GA4 del bottone «ieri»
- **Dove:** `lib-striscia.js:107,113`.
- **Cosa succede:** sostituendo `.capo-btns` sparisce l'`onclick` cotto (`apri_mappa` da `pagina-<k>-ieri-box`) e al suo
  posto arriva `…-striscia-ieri`. In GA4 la serie si spezza al 20/10.
- **Correzione proposta:** basta saperlo quando si leggono i dati; oppure tenere il vecchio valore di `da`.

### 11. BASSA — `italia.json` si scarica due volte, senza riserva
- **Dove:** lo script della classifica in `genera-indice-funghi.js` e `meteoClient` (`OPZ.primi`), tutti e due con `no-store`.
- **Cosa succede:** durante la rigenerazione le due copie possono differire, e la tabella del tempo non è più nell'ordine
  della classifica. Con un 429 di raw non c'è il ripiego su `/data/funghi/italia.json`.
- **Correzione proposta:** una promessa sola condivisa (`window._italia`), con ripiego sulla copia del sito.

### 12. BASSA — Immagini pesanti per un riquadro di 146 px
- Ogni pagina funghi scarica due WebP da 1.600 px in cima: i boschi fino a 457 KB (Lombardia), 444 (Trentino), 421
  (Umbria), più 245-299 KB di pioggia. Al telefono sono fino a ~700 KB subito.
- **Correzione proposta:** qualità più bassa per i boschi, o una versione da 800 px per i ritagli della regione intera.

### 13. MINIMA — `aspect-ratio` senza riserva sull'indice
- **Dove:** `genera-indice-funghi.js:138`, `.mk-str.mk-italia a{height:auto;aspect-ratio:1/1.02}`.
- **Cosa succede:** su Safari sotto la 15 l'`<a>` contiene solo uno span assoluto e i riquadri vanno a 0 px.
- **Correzione proposta:** aggiungere un `min-height` (i 122/150 px di base).

---

## Parte 2 — giro su tutto il resto

### 14. BASSA — Mappa: `pl` vuoto vale 0,0 (c'era già prima del settimo check)
- **Dove:** `index.html:10864` (`pinDaLink`). `''.split(',').map(Number)` dà 0, che passa `isFinite`.
- **Cosa succede:**
  - `/?r=toscana&pl=,&pn=Zero` centra la mappa nel Golfo di Guinea;
  - `pl=95,500` viene accettato.
- **Correzione proposta:** scartare le parti vuote e chiedere lat fra 30 e 55, lon fra −10 e 25.

### 15. BASSA — Casella di ricerca della mappa: nomi del geocoder in `innerHTML`
- **Dove:** `index.html:8380-8384` (`locDisegna`). `p.n` e `p.sg` delle frazioni Open-Meteo vanno in pagina senza escape,
  e finiscono anche in «Cercate di recente». È la stessa cosa del punto 8, sulla mappa: `escH` del settimo check non ci è
  arrivato.
- **Correzione proposta:** `escH` sui pezzi prima e dopo il `<b>`, e su `sg`.

### 16. COSMETICO — Chiavi doppie
- **Dove:** `index.html:11514-11515`: `w:s.w,u:s.u,t:s.t` ripetuto due volte nello stesso oggetto. Nessun effetto, esce
  solo con un controllo ES5 rigido.

---

## Da guardare (non confermati)

- **A. CPU della Function previsioni sulle chiamate a gruppi** (`functions/api/previsioni.js:114-115`, `oraLocale` per
  ogni ora di ogni punto).
  - Misurato in node su questa macchina, con 21 risposte MET finte da 35 KB (85 ore): parse più `formatToParts` costa
    **10-15 ms**, di cui ~6-7 ms solo `formatToParts`.
  - `?zonedi=toscana` (21 punti) e `?posti=` (20) a cache fredda stanno quindi intorno al tetto dei 10 ms del piano
    gratuito: l'errore 1102 della Corsica del 7/10 era la stessa famiglia.
  - Non verificato online, per non martellare MET.
  - Rimedio economico: memorizzare `oraLocale` per stringa `t.time` in una `Map` a livello di modulo. Le ore sono le
    stesse per tutti i punti, quindi le chiamate passano da ~1.800 a ~85 e si risparmiano ~6 ms.
- **B. Heatmap a fasce (f1c469b9) su Safari/iOS.** `drawImage` con ritaglio della sorgente.
  - In Chromium la sfumatura pesca anche oltre il ritaglio e le giunture sono continue (misurato).
  - Se WebKit si ferma al bordo del ritaglio, comparirebbero gradini ogni ≤64 px, e righe piatte ad alto zoom.
  - Da provare su iPhone: `/?r=lombardia,puglia,sicilia&da=2026-10-01&a=2026-10-20`, zoom 11-14.
  - Rimedio se serve: allargare la sorgente di una riga sopra e sotto, e ritagliare con `clip` sui bordi veri della fascia.
- **C. `rinnova-pagine.yml` spinge ma non pubblica.** Col sito su Cloudflare le pagine rinnovate (e
  `data/paesi-localita/`, letto dalla Function dai file del sito) vanno online solo col primo deploy di
  `pagine-regione.yml` dopo il rinnovo, cioè entro un giorno. Non è un guasto, ma il commento dei «~15 crediti» nel
  CLAUDE.md non vale più.
- **D. Zone piogge con riepilogo vecchio di oltre 36 ore.** La pagina disegna il grafico dal riepilogo senza guardarne
  l'età; `meteoClient` lo scarta e quindi niente giorni previsti. È coerente con il settimo check, ma il commento («la
  pagina ha già disegnato dai file») per le zone non vale: lì file di ripiego non ce ne sono.
- **E. Abruzzo «ieri» il 25/10.** La chiamata oraria 25→26 dà 24 valori nella prova; come Open-Meteo restituisca davvero
  le ore del cambio d'ora non si è potuto verificare (Open-Meteo bloccato da qui). Da guardare lunedì 26/10.

---

## Controllato e a posto

- **previsioni.js:**
  - convalida di tutti i modi: regex, `q` non numerico, `lat`/`lon` vuoti;
  - chiavi di cache con versione, data, file intero e ordine dei posti;
  - gruppi di 6;
  - un punto in errore lascia la risposta a 200 per 2 minuti e niente cache; tutti in errore danno 502 senza cache.
  - Sottorichieste, contate su mock di Cache API e `env.ASSETS`:

    | caso | sottorichieste |
    |---|---|
    | `zonedi=toscana` a freddo | 24 |
    | 20 posti di oggi a freddo | 26 |
    | caso peggiore, 20 posti su 19 regioni | 41 |
    | capoluoghi, al massimo 14 città | 17 |

  - Tutti gli slug di `paesi-zone` e `paesi-localita` passano le regex.
- **perPosti contro le pagine:**
  - tutte le 908 chiavi possibili passano la regex e trovano la riga `qui` nel file della loro regione;
  - `italia.json` campo [2] è la regione della pagina (Bagnone → `toscana`), non la cartella, quindi link e chiavi sono
    giusti;
  - nelle ultime 40 versioni di `italia.json` falliva solo `liguria/casoni-di-suvero`, prima del sesto check.
- **meteoClient:**
  - ES5 (acorn ecmaVersion 5); 1.317 pagine con la copia identica al sorgente;
  - `OPZ.primi`, `OPZ.ordine='zone-dove'` e `OPZ.grafico=false`;
  - bottone del radar in tutti i casi: link `radar=ora`, pagine «adesso», `OPZ.primi`, estere;
  - «oggi/domani» provati attorno al 25/10 e a mezzanotte in quattro fusi;
  - grafico col riepilogo fresco o vecchio, barra «dato non ancora arrivato», casella delle frazioni con 4xx/5xx;
  - nomi con apostrofo.
- **lib-striscia:**
  - conti EPSG:3857 giusti (rifatti in Python su 1.178 pagine);
  - tetto 1,1;
  - JSON mancante o rotto: riquadro blu senza errori;
  - Slovenia (`slovenia-ieri.json` = 19/10 = riepilogo);
  - zone col giorno della regione di casa;
  - CLS della sostituzione del bottone ~0,01;
  - tutti i file `-mappa`/`-ieri`/boschi esistono.
- **genera-anteprime / anteprime.yml:** permissions, concurrency, ripartenza dal ramo, `cp || true`, cron senza
  scontri; ultimi lanci verdi.
- **index.html:**
  - drawGrid: il Salento ora è coperto con Lombardia+Puglia+Sicilia; nessuna cucitura nuova; fasce fuori schermo
    saltate; nessun errore a 1440 e 375 px;
  - finestra «Novità»: aperta il 27/10 alle 23:50 e chiusa il 28/10 alle 00:10; `?novita=1/0`; `localStorage` che
    lancia; i tre tocchi e la ✕ con GA giusto; layout da 320 a 1440 px;
  - `escH` su `pn`/`n` senza doppio escape;
  - Abruzzo a D-6 (archivio fino al 15, previsione dal 16).
- **genera-mappa-forestale:** rigenerate identiche byte per byte; script ES5 che passano `node --check`; nessun id doppio
  né link morto; `zona=`/`zonedi=` validi; eventi `apri_mappa` senza doppi conteggi.
- **genera-pagine-localita:** `paesi-localita` rigenerato identico, 908 voci con `qui`, al massimo 8 righe.
- **Workflow (pagine-regione, rinnova-pagine, slovenia, guardiano):** concurrency senza `cancel-in-progress`, `rebase
  --abort`, 5 tentativi, `[skip netlify]` solo dove serve.
- **MeteoHub `wp`:** nasce solo in `collectMeteoHub` e si toglie in `writeDay`; `grep '"wp"'` su tutta `data/` dà zero
  file; `lib-venti-falsi.js` è la stessa funzione spostata.
- **Sitemap:** indice con 6 figlie per 1.341 URL; nessun indirizzo inesistente o doppio; nessun `lastmod` nel futuro;
  canonical uguale a `loc`.
- **Giro generale su 1.341 pagine:**
  - zero link interni morti; `_redirects` coerente;
  - title, description e canonical unici e giusti; un solo `h1`; JSON-LD valido;
  - 3.698 script in linea e 2.780 `on*=` passano `node --check`/ES5 (tranne il punto 16);
  - nessun «undefined», «NaN», «null» in pagina;
  - nessuno scroll orizzontale né errore JS a 360, 390 e 1440 px su un campione per famiglia;
  - i numeri cotti della Toscana coincidono con i file del 20/10.
