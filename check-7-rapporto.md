# Settimo check — resoconto (20/10/2026)

Giro **solo in lettura** sulle modifiche dal 19/10/2026 13:34 (e986bcef) al 20/10/2026 09:20 (f92cb364),
più un giro veloce sul resto. Nessun file di codice o di dati toccato, nessun workflow lanciato, nessuna
richiesta a MET Norway: la Function `previsioni.js` l'ho fatta girare in locale con MET e la cache simulati,
e le pagine le ho aperte in Chromium headless con i dati del checkout e l'API simulata. Il sito di
produzione da questo ambiente non era raggiungibile (proxy), quindi nessuna prova sul sito vero.

Ogni punto va verificato prima di correggere: per ognuno c'è il modo di riprodurlo.

---

## Bug

### 1. MEDIA — Il giro del mattino non committa 5 sitemap su 7: al primo disallineamento si blocca, e lo fa da rosso ripubblicando 7-10 volte al giorno
- **File:** `.github/workflows/pagine-regione.yml`, riga 91 (`git add -- '*/index.html' sitemap.xml sitemap-mappa.xml`).
- **Cosa succede:** `SOLO=cotte node genera-pagine-regione.js` chiama `scriviSitemap` (`genera-pagine-regione.js` r. 911), che riscrive
  **sette** file: `sitemap.xml`, `-mappa`, `-funghi`, `-localita`, `-zone`, `-zone-piogge`, `-mappa-forestale`. Il commit ne aggiunge due.
  Se uno degli altri cinque esce diverso da quello committato, resta una modifica non aggiunta e
  `git pull --rebase` rifiuta di partire («You have unstaged changes») in tutti e 5 i tentativi: giro rosso.
  Siccome dal quinto check si **pubblica prima di committare**, il commit non arriva mai, a ogni giro dei
  riepiloghi le pagine risultano di nuovo «cambiate» e si ripubblica su Pages ogni volta, e le anteprime non
  partono più da qui.
- **Quando scatta:** basta una cartella di pagine spinta a mano senza rigenerare le sitemap, o una data cambiata a
  mano in `pagine-lastmod.json` / `FORESTALE_LASTMOD`. **Oggi non è scattato**: rigenerati in una copia, i sette file
  escono identici a quelli nel repo.
- **Riprodurre:** in una copia del repo cambiare a mano una data in `.github/scripts/pagine-lastmod.json`, lanciare
  `SOLO=cotte node .github/scripts/genera-pagine-regione.js`, poi i comandi del passo «Commit e push»: il
  `git pull --rebase` fallisce 5 volte.
- **Correzione proposta:** `git add -- '*/index.html' 'sitemap*.xml'`. Facoltativo, prima del ciclo:
  `git diff --quiet || { git status --short; echo "file modificati non aggiunti"; exit 1; }`, così il guasto si dichiara.
- (Trovato dalla revisione dei workflow, verificato da me sul file.)

### 2. MEDIA-BASSA — Il rinnovo trimestrale non salva `data/paesi-localita/` (nato col commit f92cb364)
- **File:** `.github/workflows/rinnova-pagine.yml` riga 45 (`git add …`) e `.github/scripts/rinnova-pagine.js` riga 60 (`cambiate()`).
- **Cosa succede:** da f92cb364 `genera-pagine-localita.js` riscrive a ogni giro anche `data/paesi-localita/<regione>.json`
  (i paesi di «Che tempo farà» delle 908 pagine paese, letti da `/api/previsioni?paese=`). Né il `git add` né il
  `git status` di `cambiate()` lo guardano (né guardano `sitemap-mappa-forestale.xml`). Due esiti:
  - se cambia insieme alle pagine: modifica non aggiunta → `git pull --rebase` fallisce 5 volte → **il rinnovo
    trimestrale intero non viene salvato** (stesso meccanismo del punto 1);
  - se cambia da solo: «Niente da committare» e la modifica si perde senza avviso.
- **Per chi:** una pagina paese nuova (posto aggiunto a `funghi-posti.json`) uscirebbe con la pagina ma senza la sua
  voce nel file: l'API risponde 404 «area sconosciuta» e la pagina scrive «Le previsioni dei paesi non rispondono».
- **Quanto è probabile:** il file dipende solo da `funghi-posti.json` ed `elenco-paesi.txt`, che si toccano a mano; rigenerato
  oggi in una copia esce identico (0 differenze). Latente, ma è proprio il genere di cosa che si scopre a dicembre.
- **Correzione proposta:** aggiungere `data/paesi-localita/` e `'sitemap*.xml'` al `git add` del workflow, e
  `'data/paesi-localita'` alla lista di `git status` in `cambiate()` (con un `paesiLocalita` accanto a `paesiZone`).

### 3. MEDIA (preesistente, non dei commit del 19-20/10) — Un link costruito apposta esegue codice sulla mappa (`pn`)
- **File:** `index.html`, modulo previsioni: r. 16942 (`'<span class="nm">'+pp.n+…` nel segnaposto), r. 16991 e 16994
  (`det.innerHTML=…+c.n+…`), r. 17032 (`…+punto.n+…`). Il nome arriva da `pn` (r. 10843, `_pn=qq.get('pn')`).
- **Cosa succede:** il nome del posto finisce in `innerHTML` senza essere neutralizzato. Chi apre un link
  `?…&m=prev&pn=<img onerror=…>` esegue lo script di chi l'ha scritto, sul dominio di produzione, telefono e computer.
  I nomi veri con apostrofi e accenti (Sant'Anna di Stazzema, Città di Castello, Forlì) vanno bene.
- **Riprodurre:** servire il repo in locale e aprire
  `/?r=toscana&m=prev&pl=43.5,11&pn=%3Cimg%20src%3Dx%20onerror%3D%22window.__xss%3D1%22%3E` → dopo qualche secondo
  `window.__xss === 1`. Con l'`index.html` di e986bcef^ succede lo stesso: il difetto c'era già.
- **Correzione proposta:** una `esc()` nel modulo previsioni (come in `lib/pagina-adesso.js` r. 132) su `pp.n`, `c.n`,
  `punto.n` in tutti gli `innerHTML`/`html:`; in più, come rete, togliere `<>"&` da `_pn` in `pinDaLink`.
  Le pagine statiche usano `esc()` già giusto (`lib-meteo-regione.js` r. 136): il problema è solo nella mappa.
- (Trovato dalla revisione della mappa; verificato da me che le righe concatenano il nome crudo.)

### 4. BASSA — Abruzzo «Nessun dato» sui periodi lunghi che finiscono esattamente 6 giorni fa (quinto check, 39da799f)
- **File:** `index.html`, `loadOpenMeteoRegion`, r. 6171 (`dopoCutoff`) e ramo misto r. 6180-6182.
- **Cosa succede:** periodo che parte più di 90 giorni fa e finisce a D-6. `nowDate` (fine del giorno, 23:59) supera
  `cutoff` (adesso − 6 giorni) e si entra nel ramo misto, dove la chiamata forecast ha
  `start_date = cutoff+1 > end_date = D-6`. Open-Meteo risponde errore, il lotto finisce nel `catch` e tutte le stazioni
  restano fuori: «⚠️ Nessun dato per questo periodo». Vale anche per il ripiego Open-Meteo della Lombardia.
- **Riprodurre** (oggi 20/10): `?r=abruzzo&da=2026-06-01&a=2026-10-14` → chiamate `archive 06-01..10-14` e
  `forecast 10-15..10-14`; con `a=2026-10-15` va. (Il codice d'errore di Open-Meteo non l'abbiamo potuto vedere, l'API
  era bloccata: la chiamata con inizio dopo la fine è comunque certa dal codice.)
- **Correzione proposta:** nel ramo misto aggiungere la seconda URL solo se `dopoCutoff <= endDate`; oppure scegliere il
  ramo «solo archivio» con `endDate <= fmtD(cutoff)` invece di `nowDate <= cutoff`.

### 5. BASSA — Il grafico delle pagine regione e zona piogge torna al riepilogo VECCHIO quando la pagina era ripiegata sui file
- **File:** `.github/scripts/lib-meteo-regione.js` r. 337 (`riepilogo = fetch(BASE + RIEP)…`) e r. 343-349 (`aspetta()` →
  `grafico(x[1], F)`); copiato in tutte le 23 pagine regione e 114 zone piogge.
- **Cosa succede:** la pagina regione, se il riepilogo ha più di 36 ore (`fresco()`, `genera-pagine-regione.js` r. 760),
  disegna il grafico calcolandolo dai file del giorno (il ripiego del 24/8). Poi `meteoClient`, che il riepilogo lo
  legge **senza** controllo di freschezza, trova `#grafico .gg` senza `.mk-fut` e lo ridisegna col riepilogo vecchio:
  le barre fresche spariscono, e fra l'ultimo giorno vecchio e «oggi» mancano dei giorni senza che si veda.
  Secondo difetto minore: `aspetta()` smette dopo 20 s, e il ripiego dai file (20-40 richieste) su rete lenta può
  arrivare dopo: allora i giorni previsti non compaiono.
- **Quando:** solo con il giro dei riepiloghi fermo da più di 36 ore. Raro.
- **Riprodurre:** in locale servire un `data/riepiloghi/toscana.json` con `generato` di 3 giorni fa e aprire `/toscana/`:
  il grafico calcolato dai file viene sostituito dalla serie del file vecchio.
- **Correzione proposta:** in `meteoClient` usare il riepilogo per il grafico solo se fresco (stesso test: `generato` entro
  36 ore); altrimenti non ridisegnare le barre e accodare solo i giorni previsti al grafico già disegnato. Allungare
  l'attesa o agganciarla all'evento di fine disegno invece che a 20 s.

### 6. BASSA — Nel grafico «ultimi 30 + prossimi 7» manca un giorno fra misurati e previsti, ogni notte e sempre in Slovenia
- **File:** `lib-meteo-regione.js`, `grafico()` r. 313 (`ultimo = j.serieDa || …`) e r. 324-329 (i previsti partono da OGGI).
- **Cosa succede:** le barre misurate finiscono a `serieDa`, i previsti cominciano da oggi. Fra mezzanotte e il primo giro
  dei riepiloghi del mattino (~07:10 italiane) il riepilogo finisce ad altroieri (`ultimoCompleto` salta ieri nel giro
  notturno), quindi «ieri» manca e la linea tratteggiata «oggi» è attaccata ad altroieri. In Slovenia (34 ore di
  ritardo) succede sempre. Nessuna etichetta lo dice.
- **Riprodurre:** pagina `/slovenia/` a qualunque ora: ultima barra misurata = D-2, prima prevista = oggi.
- **Correzione proposta:** se `serieDa` < ieri, inserire le barre vuote dei giorni mancanti (titolo «nessun dato») fra le
  due serie, così il buco si vede e l'asse resta continuo.

### 7. BASSA — Pagine paese: nella tabella «Che tempo farà» il pluviometro e lo stesso paese compaiono due volte
- **File:** `.github/scripts/genera-pagine-localita.js` r. 165 (`normNome(c.n) !== io`).
- **Cosa succede:** il comune si toglie solo se il nome normalizzato è **identico** al nome del pluviometro. Con i nomi
  delle reti («Ferriere Pluvio», «San Nazzaro Val Cavargna C5», «Albareto Parma», «Mongiana P.», «Piscina Acquasanta
  Terme», «Branzi Caserma Carabinieri») il comune omonimo resta. **76 pagine** hanno un comune a meno di 800 m dal
  pluviometro, e in una quarantina è chiaramente lo stesso posto (San Nazzaro Val Cavargna a 60 m, Acquasanta Terme a
  80 m, Ferriere e Albareto a 220 m). Il comune non ha la quota e MET usa il suo terreno, quindi le due righe danno
  quasi la stessa previsione: una riga sprecata su 8.
- **Riprodurre:** `data/paesi-localita/lombardia.json`, voce `san-nazzaro-val-cavargna-c5`: prima riga il pluviometro,
  poi «San Nazzaro Val Cavargna» a 0,06 km.
- **Correzione proposta:** togliere anche il comune entro ~1 km dal pluviometro il cui nome sia contenuto (a parole
  intere) nel nome del pluviometro; oppure semplicemente scartare i comuni entro 500 m. Da decidere: «Sambuci ↔
  Saracinesco 0,54 km» è un comune diverso.

### 8. BASSA — La casella resta su «Cerco anche tra le frazioni…» se il geocoder non risponde
- **File:** `lib-meteo-regione.js` r. 209-217 (`mostra`) e r. 185-198 (`frazioni`).
- **Cosa succede:** senza comuni corrispondenti la tendina scrive «Cerco anche tra le frazioni…»; se poi la chiamata a
  `geocoding-api.open-meteo.com` fallisce (rete, CORS, 5xx) il `.catch(function(){})` non riscrive niente e la scritta
  resta per sempre. Se risponde con un errore JSON (429: `{error:…}`) `frazioni` non guarda `r.ok`, trova
  `results` vuoto e scrive «Nessun posto con questo nome», che è falso.
- **Riprodurre:** pagina paese in locale con il geocoder bloccato, scrivere «zzzz» nella casella.
- **Correzione proposta:** in `frazioni` lanciare un errore se `!r.ok`; nel `catch` di `mostra`, se `righe` è vuoto e il
  giro è ancora quello (`mio === giro`), scrivere «Le frazioni non rispondono: prova con il nome del comune».

### 9. BASSA — `slovenia.yml` e `guardiano.yml` senza `concurrency`
- **File:** `.github/workflows/slovenia.yml` (nessun blocco prima di `jobs:` r. 40), `.github/workflows/guardiano.yml` (idem, r. 40).
- **Cosa succede:** Slovenia è l'unico collector senza file d'attesa: il guardiano lo può rilanciare mentre gira il giro
  delle 08:25/16:25 italiane partito in ritardo; i due riscrivono gli stessi file D-2..D-9 con `collected` diverso e il
  secondo trova un conflitto vero al rebase (5 tentativi, rosso). Il guardiano (tre cron + sei lanci da Cloudflare, ogni mezz'ora fra
  le 06:00 e le 08:30) può accavallarsi con se stesso: doppi rilanci e conflitto su `data/guardiano.json`.
- **Correzione proposta:** `concurrency: { group: slovenia, cancel-in-progress: false }` e lo stesso con `group: guardiano`.

### 10. BASSA — MeteoHub: se fallisce solo la query delle raffiche, il vento medio (e la direzione) del giorno si buttano
- **File:** `.github/scripts/collect-meteohub.js` r. 251 (`const vento = ventoRaw && raffica ? ventoRaw : {}`).
- **Cosa succede:** è voluto (scrivere `[media, null]` cancellerebbe la raffica già salvata), ma al **primo** salvataggio
  del giorno non c'è niente da proteggere: il file esce senza `w`/`wd` finché un giro successivo non riesce. Si ripara da sé.
- **Correzione proposta:** se `raffica` è null scrivere `w: [media, null]` solo per le stazioni che nel file del giorno
  non hanno già `w` (decidendo dopo `tieniMeteo`).

### 11. BASSA — `backfill-meteo-meteohub.js` non ha `togliVentiFalsi`
- **File:** `.github/scripts/backfill-meteo-meteohub.js` r. 153 (`if (m.w) s.w = m.w;`).
- **Cosa succede:** il backfill a mano ha il tetto dei 40 m/s ma non il filtro dei venti falsi del collector: può rimettere
  un vento falso sotto il tetto, che resta finché il collector non ripassa su quel giorno (solo dentro la sua finestra).
- **Correzione proposta:** applicare la stessa `togliVentiFalsi` prima di scrivere, o portarla in una libreria comune.

---

## Da guardare (dubbi non confermati o scelte da decidere)

- **Piemonte sopra 300 mm vince l'ufficiale anche con 24 ore di realtime** (`collect-piemonte.js` r. 315). L'archivio
  ufficiale conta il giorno **UTC**, che il CLAUDE.md dice di non adottare: proprio nei giorni estremi la pioggia fra
  le 00 e le 02 italiane di G+1 può finire due volte (in G dall'ufficiale e in G+1 dal realtime) e quella delle prime
  ore di G si perde. Scelta del quinto check (bug 4) ed è rara (un solo giorno sopra 200 mm nello storico), ma
  contraddice la regola scritta.
- **Id non unici fra cartelle sommati come un pluviometro solo** (`lib-clima.js` `clima()`, `genera-funghi.js`
  `perGiorno`). Da quando si leggono anche le cartelle delle reti «ospiti» (quinto check, bug 17) la Lombardia somma
  anche `data/emilia`: gli id `11` (Bormio Ponte sul Frodolfo / Panocchia) e `14741` (Rho Scalo Fiorenza / Ponticelli)
  esistono in tutte e due. Oggi innocuo, nessuno dei due è un posto funghi; se un giorno lo fosse avrebbe la somma di
  due pluviometri. Rimedio: prendere dalle cartelle ospiti solo gli id dei posti ospiti, o chiavi `cartella:id`.
- **Conflitti veri sul contenuto non si risolvono riprovando**: il `git rebase --abort` del sesto check sistema le gare
  sul push, non due giri che scrivono gli stessi file. A rischio `meteohub.yml` (rilanciato dal guardiano alle 10:50)
  con `meteohub-gaps.yml` (10:40), il passo «temperature impossibili» di `riepiloghi.yml` (`git add -u data/` sugli ultimi
  11 giorni di tutte le reti) e `gaps-nord.yml`. Chi spinge per secondo perde il giro.
- **`alert-fonti.yml` r. 243:** se l'invio della mail fallisce, «Commit del registro» non parte (vale `success()`): il registro
  non si salva e il giorno dopo l'allarme riparte come nuovo.
- **Nessun `timeout-minutes` sui collector** (6 ore di default); Emilia e Trentino non hanno timeout sulle richieste.
  Con la file d'attesa, un giro appeso ferma quel collector: per la Toscana vorrebbe dire perdere le chiusure serali.
- **Le chiusure Toscana lanciate da Cloudflare non impostano `CLOSING`** (non sono cron e il workflow non ha l'input):
  se una resta in coda oltre mezzanotte non viene trattata come chiusura tardiva. Raro.
- **Sette collector senza `permissions:`** (Alto Adige, Emilia, Liguria, Piemonte, Toscana, Trentino, Veneto): vanno con
  l'impostazione del repo. `anteprime.yml` r. 50 è l'unico checkout senza `ref: main` (scrive su un altro ramo, effetto minimo).
- **Commenti di `rinnova-pagine.yml`/`.js` superati:** dicono «si pubblica a mano», ma `pagine-regione.yml` pubblica
  tutto main ogni mattina: le pagine del rinnovo vanno online da sole il mattino dopo. Solo documentazione.
- **Date senza anno nell'etichetta del periodo:** ora che i link condivisi non hanno il tetto dei 365 giorni,
  `?r=austria&da=2025-09-01&a=2025-09-30` mostra «01 set → 30 set», che a ottobre 2026 sembra settembre 2026.
- **Abruzzo «Ieri» il 25/10** (cambio d'ora): se Open-Meteo usa un solo `utc_offset` per tutta la risposta la finestra
  01:00→00:00 scivola di un'ora. Non verificabile da qui (API bloccata). Al massimo un'ora di pioggia sul giorno accanto.
- **`loadOpenMeteo` (index.html r. ~4995) è codice morto** che scrive ancora 0 mm quando manca la risposta: se qualcuno
  la riusasse tornerebbe la giornata asciutta inventata.
- **`check-meteohub-gaps.js`:** se Open-Meteo risponde solo per alcune stazioni l'evento diventa `coperto-openmeteo` e
  le mancanti non si ritentano più.
- **«Il pluviometro (385 m) e i paesi intorno»:** la quota esce senza punto delle migliaia («1399 m») e senza «~» quando
  viene dal terreno (reti MeteoHub/OSMER), mentre la mappa il «~» lo mette. Se la riga del pluviometro va in errore e le
  altre no, la frase sopra la tabella annuncia un pluviometro che non c'è.
- **Testata sul telefono:** aperta la lente e scritto qualcosa, la testata resta in modalità ricerca (logo e YouTube
  nascosti) finché non si svuota la casella; non c'è un tasto per chiuderla. Scelta di progetto, da valutare.
- **Margine delle sottorichieste:** la Toscana ha 14 capoluoghi → 45 sottorichieste a cache fredda (14×3 + 3), contando
  match/put della cache come fanno i commenti. Sotto 50, ma il commento «al massimo 12» non è più vero; un quindicesimo
  capoluogo toscano porterebbe a 48, un diciassettesimo a 54.
- **Copie di `meteoClient` non riallineate:** 71 zone piogge, 71 zone funghi e le pagine regione hanno ancora la versione di
  `lib-meteo-regione.js` di prima di f92cb364 (manca solo «al pluviometro», che lì non serve). Innocuo; si riallineano al
  prossimo giro dei generatori, quelle regione già al prossimo giro del mattino.

---

## Trovato a posto

- `functions/api/previsioni.js`, provata in locale su 16 casi: `?paese=liguria/sassello` 200 (8 punti, 27 sottorichieste a
  cache fredda, 1 a cache calda); `?zona=garfagnana` 200 (12 punti, 39); `?capoluoghi=toscana` 200 (14 punti, 45);
  `paese=Liguria/…`, `paese=liguria/`, `paese=foo/bar`, `zona=../x` → 404 senza cache; `zona=` e `capoluoghi=` vuoti → 400;
  `q=abc` e `q=` → la quota vale come assente; MET giù → 502 `no-store` con l'elenco degli errori. Il percorso del file
  si costruisce solo con lettere (niente salti di cartella). CORS, `Vary: Origin`, max-age 600 al browser: giusti.
- Chiave di cache col nome intero del file: zona, paese e capoluoghi con lo stesso nome non si pestano più.
- Le 908 pagine paese chiedono all'API il proprio `<regione>/<slug>`, tutte presenti nel file della regione e tutte
  accettate dalle regex della Function; le 114 zone funghi e le 114 zone piogge chiedono il proprio slug, tutti in
  `paesi-zone.json` e validi per la regex.
- `data/paesi-localita/*.json`: 908 voci, ognuna con il pluviometro in testa (`qui:1`, quota dove > 0), nessun nome
  ripetuto dentro una lista, nessun carattere strano nei nomi; 328 comuni di altre regioni portano la LORO regione `r`.
  Le liste corte sono solo le 6 già note (Tarvisio e dintorni, Argentario).
- Generatori idempotenti: rigenerati in una copia `genera-pagine-localita.js` (0 differenze, `paesi-localita` compreso),
  `genera-pagine-funghi.js`, `genera-pagine-zona.js`, `genera-pagine-zona-piogge.js` (`paesi-zone.json` identico),
  `genera-pagine-regione.js`, `genera-mappa-forestale.js`: differiscono solo le copie vecchie di `meteoClient` (sopra).
- `meteoClient` è ES5: tutti i 4.759 script in linea delle 1.341 pagine passano il parser in modalità ES5 (le sole
  eccezioni sono il blocco `application/json` delle pagine «adesso» e una chiave doppia nell'`index.html`, lecita).
- Pagine aperte in Chromium (390 e 1280 px): regione Toscana, Svizzera, zona piogge e zona funghi Garfagnana, paese
  Sassello. Nessun errore JavaScript, nessuno sbordo orizzontale, testata alta 53-54 px, tabella dei paesi con
  «al pluviometro» in testa, giorni previsti nel grafico solo dove devono (regione e zona piogge sì, funghi no),
  cerca in testata con le sei porte e link `pl`/`pn` codificati giusti.
- «oggi/domani» al cambio d'ora: provati con l'orologio del browser fissato al 24/10 23:55, 25/10 00:30 e 02:30, 25/10
  23:30 e 28/3/2027 23:30: intestazioni sempre «oggi, domani, giorno dopo» giusti.
- Media dei giorni previsti per data: giusta; il filtro dei giorni passati (`daOggi`) toglie ieri dalle risposte in cache.
- Quiz tartufi: `QUIZ_REGIONI`/`QUIZ_SLUG`/`QUIZ_ETICHETTA` coerenti; link presenti in pagine regione, funghi regione, zone
  e paesi delle otto regioni e in nessun'altra; Emilia va a `emilia-romagna/`; ogni pagina col link ha anche il CSS
  `.quiz-btn`. Nessun altro posto del sito elenca a mano le regioni del quiz (indice funghi, guida, mappa e mappa
  forestale non hanno il bottone, per scelta).
- Ente dei posti ospiti (sesto check, bug 3): Bagnone dice «ARPA Liguria (OMIRL)»; pagine funghi regione, zone e paesi
  usano `retiDei`/`regioneDati`. I cinque rimandi 301 dei posti spostati puntano a pagine esistenti e le vecchie non ci
  sono più; nessun link interno ai vecchi indirizzi.
- Sitemap: 1.347 `<loc>`, tutte su pagine esistenti e nessuna su un indirizzo rimandato. Link interni statici: 39.304 in
  tutte le pagine, **zero morti**.
- Pubblicazione Pages: 1.821 file non-giorno + 12.646 file-giorno, sotto il tetto di 19.500 (margine ~5.000 file, cioè
  ~110 giorni prima che la riserva cominci a tagliare i giorni più vecchi, come previsto da `pubblica-pages.js`);
  nessun file sopra i 5 MB.
- `data/`: 12.855 JSON, tutti leggibili, nessun file-giorno vuoto; gli id doppi dentro un file ci sono solo nei vecchi
  backfill Open-Meteo (`om_*`, fino a maggio 2026).
- Workflow (revisione dedicata): YAML valido in tutti e 26; la condizione del Retry 2 è giusta e identica nei 17
  collector; `ref: main` non rompe `date_override` né i rilanci; `git rebase --abort … || true` non fa uscire lo script;
  nessun `$?` letto dopo una pipe; glob di `git add` giusti; gruppi di `concurrency` tutti distinti; permessi
  `actions: write` dove si lancia; ordine pubblica → commit → anteprime corretto; cron dell'ora solare tutti dopo la
  mezzanotte italiana; `[skip netlify]` ovunque tranne `rinnova-pagine.yml`. Ultimi 100 giri (19/10 18:26 → 20/10
  09:47): tutti verdi tranne Alto Adige del 19/10 23:10, il conflitto di push già corretto dal sesto check.
- Collector (revisione dedicata): tutti i file si compilano; `lib-tieni-meteo.js` riempie solo i campi vuoti e mai `mm`/`i`;
  MeteoHub con una query per prodotto, nomi riparati (zero file con i nomi vecchi), `qt` presente su tutte le 88.579
  stazioni stimate, valore Open-Meteo assente non più 0 mm; Piemonte, tetto orario dei 150 mm e `provinciaPulita`;
  Toscana `isClosing` e chiusure tardive; Francia `rr1` negativo; Liguria `senzaZeriIsolati`; `genera-funghi.js`
  con i giorni «di casa»; `genera-riepiloghi.js`.
- `check-doppioni.js` / `oreDiverse`: provato in sola lettura sui dati veri. Toglie il falso allarme francia-bfc del
  17→18/10, non spegne nessuno degli allarmi veri dei giorni controllati (18/10, 19/10, 10/10, 1/10, 20/9), e un giorno
  copiato a mano viene ancora preso (89 stazioni identiche). Vale solo dove tutti e due i giorni hanno `i`.
- Mappa (revisione dedicata, 34 aperture fra computer e telefono senza errori): date chieste tenute a parte dalle date
  tagliate; `INIZIO_STORICO` coincide col primo file delle 40 cartelle; `TICINO_HIST_FROM`; link senza tetto fisso;
  `isoPiu()`; Abruzzo ora per ora (24 valori, «Nessun dato» se manca la risposta); `qt` indipendente dall'ordine;
  esclusioni Avigliana e Cagnano attive nel loader e nei pallini; tutti i parametri usati dalle pagine statiche
  (`r` con abruzzo/altoadige/molise/chiavi francesi, `g=7`, `g=1&tq=1`, `m=prev` con `pl`/`pn`/`pz`) riconosciuti.
  `boschi=1`, `sat=1`, `radar=ora` controllati solo fino a regione e segnaposto (tessere e radar bloccati qui).
