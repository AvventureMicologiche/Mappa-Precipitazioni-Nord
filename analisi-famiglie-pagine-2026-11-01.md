# Analisi delle famiglie di pagine (1 novembre 2026)

Scheda «Mappa pluviometrica 105 bis», in cloud. Il file sta nella radice di `main`; le pagine `.md` non vengono pubblicate sul sito (`pubblica-pages.js` le salta).

> **Correzione:** nella prima versione l'esempio delle stime era «Vico del Gargano, 78,8 mm il 27/10». Era sbagliato: avevo letto la serie al contrario, e quei 78,8 mm sono dell'11/10, una misura vera. L'esempio giusto è Bosco Umbra, qui sotto. Il difetto resta lo stesso.

## Aggiornamento del 1/11/2026: cosa è stato sistemato

Su tua richiesta («la pagina slovenia la togliamo, quando mancano dati come in puglia mettiamo stime e le dichiariamo», «sistema anche carnia e abruzzo»). I dettagli tecnici sono nel `CLAUDE.md`, sezione «Correzioni del 1/11/2026».

1. **Pagina Slovenia tolta.** Le pagine regione delle piogge sono ora 22 e la sitemap ha 1.412 indirizzi. Nessun link rimasto verso `/slovenia/`, che rimanda alla mappa con la Slovenia già scelta. La Slovenia resta sulla mappa.
2. **Stime dichiarate nelle pagine funghi.** Le stime restano nei totali, ma ogni pagina lo dice in cima con un riquadro giallo, con le stesse parole delle pagine piogge: «Dal 26 al 30 ottobre questo pluviometro non ha trasmesso: quei giorni sono stime Open-Meteo, non misure». Vale per paesi, zone (con «2 pluviometri su 14» quando non sono tutti) e regioni funghi. Nell'indice `/funghi/` i posti con giorni stimati hanno l'asterisco. Oggi l'avviso compare in Puglia (26-30/10), in Sardegna (15/10, 5 posti) e in Sicilia (7/10, 8 posti).
3. **Carnia forestale rifatta** sui 7 pluviometri nuovi: bosco dall'80 al 69%, abetaie e peccete dall'1 al 29%, pinete dal 38,5 al 15,4%. È una media calcolata qui, vicina al metodo del banco: al prossimo giro del banco si ricalcola col metodo vero.
4. **Abruzzo forestale:** niente più «pioggia vera»; ora dice che sono stime di modello.

Le pagine cambiate vanno online con la prossima pubblicazione (il giro del mattino `pagine-regione.yml` pubblica tutto `main`).

## Secondo aggiornamento: i punti medi

Su tua richiesta («fai i medi»). I dettagli sono nel `CLAUDE.md`, «Secondo giro dello stesso giorno».

1. **Numeri che non tornavano.** Titolo, descrizione e sottotitolo delle pagine regione usano un numero solo, la rete intera: la Basilicata ora dice 62 e «oltre 60», la Campania 175 e «oltre 170». La mappa forestale dice 12 tipi di bosco, come i dodici colori.
2. **Zone che contavano i pluviometri esclusi:** ora non li contano più, né nelle zone piogge né nelle zone funghi (Riviera di Levante 2, Calvana 13).
3. **Zone con posti sbagliati, corrette:**
   - Valle Sessera: con Bielmonte, Camparient e Valdilana al posto dei posti novaresi;
   - Valtiberina: senza i quattro posti marchigiani;
   - Calvana: senza le dighe bolognesi;
   - Val d'Aveto: con Santo Stefano e Amborzasco.

   Rifatte le loro pagine piogge, funghi, meteo e forestali.
4. **Nomi nei titoli:** Malè, Mondovì, Fiè, Nicolò, Viù e gli altri accenti; quindici nomi tecnici sostituiti (Branzi, Idro, Verceia, Lago di Ca' Zul...). Nessun indirizzo cambiato. «San Michele (CI)» non l'ho toccato: le province sarde sono state rifatte e la sigla giusta va verificata.
5. **Ritratti:** il rinnovo è mensile (il 2 del mese, il primo è domani) e conta solo i mesi finiti.
6. **Verdetto delle pagine paese:** quando mancano giorni il riquadro lo dice.
7. **Mappa forestale collegata:** le regioni funghi, le zone funghi e tutti i 908 paesi linkano la loro carta forestale. Prima ci portava solo la guida.
8. **Date della sitemap:** per mappa, guida, fonti e mappa forestale la data si calcola da sola quando la pagina cambia (`pagine-impronte.json`).
9. **Pagine meteo, in parte:**
   - la Riviera di Levante ha i paesi della costa;
   - tutti i paesi delle zone hanno la quota, così tabella e scheda danno le stesse temperature.

   I quasi doppioni del gruppo C (Candalla e Alpi Apuane, Val Serina e Val Brembana) **aspettano la tua scelta**: toglierli con un rimando alla pagina più grande, oppure lasciarli.
10. **Pagine funghi sottili del sud: non fatto.** Per aggiungere posti da bosco servono le percentuali di bosco che si calcolano sul tuo PC, e per decidere servono i numeri di Search Console.

Prove: nessun link interno rotto, nessun titolo doppio, 7.603 script delle pagine compilati senza errori. Dieci pagine provate nel browser al telefono e al PC, tutte giuste.

## Terzo aggiornamento (1/11/2026 sera): doppioni, punto 10 approfondito, elenco dei piccoli

### Doppioni meteo: fatto
Tolte le pagine meteo di **Candalla** (7 paesi su 9 in comune con le Alpi Apuane) e **Val Serina** (8 su 12 in comune con
la Val Brembana). Rimando 301 in `_redirects` verso la pagina che le contiene. Le pagine zona piogge e zona funghi di
quelle due zone adesso linkano «Previsioni meteo Alpi Apuane →» e «Previsioni meteo Val Brembana →» (`METEO_ASSORBITE`
in `genera-pagine-meteo-zona.js`). Tolte anche dalle pillole «valle per valle» di 20 pagine meteo toscane e lombarde,
delle «adesso», delle regioni piogge e funghi. Pagine meteo di zona: da 51 a 49. Link interni rotti: zero.

### Punto 10 approfondito: perché il sud ha così pochi posti funghi

**La causa.** I posti funghi si scelgono con due regole: quota fra 200 e 1.600 m e **almeno il 37% di bosco entro 3 km
misurato su OpenStreetMap** (lo dicono le pagine stesse, e `funghi-posti.json` porta quel numero). OpenStreetMap al sud
disegna pochissimi boschi. Le nostre tessere vengono invece dalle **carte forestali ufficiali** delle regioni, e sugli
stessi 908 posti danno in media **17 punti di bosco in più**; 762 posti su 908 si scostano di oltre 10 punti.

**La prova.** Ho misurato il bosco entro 3 km sulle nostre tessere (lette dal repo delle tessere): è lo stesso calcolo
della mappa forestale, che ritrovo al decimo (scarto medio 0,1 punti su 101 posti del sud). Poi l'ho fatto su tutti i
pluviometri in fascia di quota con almeno 24 giorni di dato vero sugli ultimi 30, senza quelli esclusi dalla mappa.

| regione | posti oggi | carte forestali >= 37% | >= 50% | nuovi con >= 50% |
|---|---|---|---|---|
| Sicilia | 9 | 83 | 50 | 41 |
| Calabria | 17 | 61 | 41 | 24 |
| Campania | 31 | 71 | 46 | 18 |
| Sardegna | 8 | 21 | 14 | 9 |
| Basilicata | 6 | 20 | 8 | 3 |
| Puglia | 2 | 5 | 3 | 2 |
| Molise (oggi senza pagina) | 0 | 15 | 10 | 10 |
| tutta Italia | 908 | 1.407 | 1.134 | 280 (+10 Molise) |

In Sicilia restavano fuori, per esempio, San Fratello Forestale (1.030 m, 84% di bosco), Gibilmanna (960 m, 64%),
Monte Colla (1.502 m, 91%), Intraleo (1.475 m, 71%): boschi veri dei Nebrodi, delle Madonie e dei Peloritani. In
Sardegna Monte Rasu (79%), Jerzu, Orune, Fonni. In Basilicata Tramutola (60%); San Fele (faggete) e Marsico Nuovo
stanno appena sotto il 50%.

**La Puglia resta sottile comunque**: ha pochi boschi e pochi pluviometri in bosco sopra i 200 m (al massimo 5 con la
regola più larga). Lì la pagina sottile è la verità, non un difetto della scelta.

**Le strade, dalla più utile:**
1. **Aggiungere i posti al sud con le carte forestali, soglia 50%, senza togliere nessun posto di oggi.** Circa 107
   pagine paese nuove (Sicilia 41, Calabria 24, Campania 18, Sardegna 9, Basilicata 3, Puglia 2, Molise 10) e la pagina
   funghi del Molise. Al sud la stagione dei funghi è adesso (novembre e dicembre, in Sardegna e Sicilia anche dopo):
   pagine pubblicate ora vengono lette da Google in stagione. Tutto si fa da qui, senza il banco: bosco e tipi di bosco
   li calcolo come la mappa forestale, la provincia dal comune più vicino, i nomi tecnici («Leni SIAS», «Messina
   SP50Bis», «Novara SS185») vanno sistemati a mano in `nomi-titolo.json` come i 105 di oggi. **Medio-grande.**
2. **La stessa regola per tutta Italia**: 280 posti nuovi più i 10 del Molise (Piemonte 39, Liguria 34, Emilia 34, ...).
   Più coerente, ma raddoppia il lavoro sui nomi e mette online molte pagine a stagione finita al nord. Meglio dopo,
   coi numeri di Search Console. **Grande.**
3. **Non aggiungere niente** e lasciare le regioni sottili come sono. **Zero.**

⚠️ Con le strade 1 e 2 la «pulizia di dicembre» (togliere le pagine paese con zero clic) non deve giudicare le pagine
nuove: avrebbero un mese di vita.

**Legato al punto 10, e piccolo:** la pagina paese scrive «il 41% di bosco entro 3 km» (OpenStreetMap) e, poco sotto,
la carta forestale della stessa zona dice un altro numero (Ligonchio 37% e 87%, Colle d'Oggia 39% e 82%). Conviene
scrivere sempre quello delle carte forestali, che sono la fonte dei colori della mappa (`mappa-forestale-dati.json`
lo ha per tutti i 908 posti). Va fatto insieme alla scelta sulla soglia, perché le pagine dicono anche «almeno il 37%
di bosco su OpenStreetMap».

**Non serve il banco. Serve Search Console** solo per decidere fra la strada 1 e la 2 (quanto rendono oggi le pagine
paese del centro-sud rispetto al nord).

### Elenco dei punti piccoli, con la soluzione

1. **Description delle regioni**: «0,0 mm di media» quando la media è sotto 0,05 (scrivere «meno di 0,1 mm», come la
   pagina), doppio punto quando manca ieri e la settimana è asciutta, Puglia con i 7 giorni che contengono stime (dirlo
   o togliere il numero). `genera-pagine-regione.js:300-314`. Si vede dal giro del mattino.
2. **«zona per zona» nelle «adesso»** di Puglia, Basilicata e Sardegna, che le zone non le hanno: togliere le due
   parole quando la regione non ha zone. `genera-pagine-adesso.js:245`.
3. **«e altre una città»** nella riga viva delle «adesso»: «e un'altra città». `lib/pagina-adesso.js:181-182`, con
   `VERSIONE_JS` alzata (il file è servito a parte).
4. **«il più asciutto Passo Mendola con 370.»** senza «mm», 107 zone funghi: «con 370 mm». `genera-pagine-zona.js:341`.
   La frase sta nel ritratto: o trapianto della sola riga, o si aspetta il rinnovo del 2/12.
5. **Piede delle regioni piogge**: «oppure il riepilogo delle regioni» porta in realtà alle pagine funghi; scrivere «le
   pagine funghi delle regioni» e aggiungere 2-4 link alle regioni vicine. `genera-pagine-regione.js:205`.
6. **Anteprima social**: `og:description` uguale su 1.043 pagine (mettere la description della pagina, che c'è già) e
   `twitter:card` solo sulla mappa (aggiungerla ovunque). L'immagine per regione è un passo in più, facoltativo.
7. **`/previsioni/` con la scritta grande della mappa**: riscrivere anche l'H1 nella Function
   (`functions/previsioni/index.js`). Da fare dopo la testata nuova della scheda 104, che tocca proprio quell'H1.
8. **Due stili di percorso**: la mappa forestale ha un percorso a un solo elemento; usare `briciolaHtml` come le altre
   famiglie («Mappa pluviometrica › Mappa forestale › Toscana»).
9. **Guida**: «la legenda dei dieci gruppi» (sono dodici, `guida/index.html:650`) e nessuna riga sulle pagine meteo.
10. **Riga di stagione sopra l'avviso delle stime**: dice «i millimetri qui sotto sono veri» (`lib-stagione.js:27-29`)
    proprio sopra il riquadro che dice che alcuni giorni sono stime. Togliere «sono veri» quando c'è `.avviso-stime`.
11. **Ripiego delle regioni funghi** (quando il file del giorno è vecchio): non dichiara le stime. Raro. Portarci
    `leggiS` come in `genera-funghi.js`.
12. **«San Michele (CI)»**: la sigla va verificata con le province sarde nuove. Serve la tua conferma sulla sigla.
13. **«il 1 novembre»** (latente, compare solo quando il riepilogo è di altroieri e il giorno è l'1, l'8 o l'11):
    `genera-pagine-zona-piogge.js:210`, usare la regola dell'apostrofo già scritta per l'avviso delle stime (`:469`).
14. **Pagine meteo**: «Iscriviti» con e senza `?sub_confirmation=1`; metterlo dappertutto.

**Non sono errori, ma convengono:** codice comune in file esterni (pagine da circa 113 a 15 KB, **medio-grande**);
verdetto funghi scritto nell'HTML ogni mattina come le zone piogge (**medio**).

---

Sotto, l'analisi com'era stamattina, prima delle correzioni.

## In breve

- **La struttura è sana.** 1.412 pagine HTML, più `/previsioni/` servita da una Function: 1.413 indirizzi, tutti in una sitemap. Nessun link interno rotto, nessun link verso un indirizzo che rimanda, nessuna pagina orfana. Nessun titolo, description o H1 doppio in tutto il sito. Canonical giusto su tutte le pagine.
- **I generatori sono allineati alle pagine.** Rilanciandoli tutti oggi cambiano solo i numeri d'archivio delle pagine funghi (attesi: si rifanno ogni tre mesi), e i conteggi della Slovenia e della «adesso» della Valle d'Aosta.
- **Al telefono e al PC le pagine funzionano.** Su 22 pagine provate (393 e 1366 px): nessun errore JavaScript, niente che esce dallo schermo, nessun «NaN» o «undefined».
- **Il difetto più serio: le pagine funghi contano le stime Open-Meteo come pioggia vera.** In Puglia Bosco Umbra mostra 38,5 mm negli ultimi 7 giorni, di cui 15,5 stimati (dal 26 al 30/10 la rete non ha trasmesso), sotto la scritta «millimetri misurati a terra». Va contro la regola 4 del progetto.
- **Alcune pagine si contraddicono da sole.** La Slovenia dice «oltre 110 pluviometri» e due righe sotto «Media di 109». La Basilicata ha tre numeri diversi di pluviometri (50, oltre 45, 62). La mappa forestale dice «dodici colori» e accanto «11 tipi di bosco». La Carnia forestale descrive ancora i boschi della zona vecchia.
- **La mappa forestale è un'isola.** 138 pagine raggiungibili solo fra loro e dalla guida (2 link). Nessuna pagina funghi, piogge o meteo ci porta.
- **Le pagine sono pesanti per quello che dicono.** Una pagina paese pesa 113 KB, e 98 KB sono JavaScript e CSS identici in tutte le 908 sorelle. Il browser non può tenerli in memoria fra una pagina e l'altra.
- **Il contenuto che risponde al titolo spesso arriva solo col JavaScript.** Le zone piogge e le regioni hanno i numeri scritti nell'HTML; le pagine funghi, «adesso» e meteo no.

## Come ho lavorato

- Ho letto tutte le **1.412 pagine HTML** del repo (`main` al commit `7616d664`, 1/11/2026 mattina) con uno script: titolo, description, H1, canonical, og, dati strutturati, testo, immagini, link, peso.
- Ho costruito il **grafo dei link interni** (chi porta a chi) e l'ho confrontato con le **12 sitemap** e con `_redirects`.
- Ho **rilanciato tutti i generatori** in una copia del repo e confrontato l'uscita con le pagine su disco: così si vede quali pagine sono rimaste indietro rispetto al loro generatore.
- Ho aperto **22 pagine** (almeno una per famiglia) in Chromium senza testa, al telefono (393 x 852) e al PC (1366 x 768): errori, scritte fuori schermo, «NaN», testo rimasto «in attesa». Ho guardato le schermate della prima schermata al telefono.
- Tre letture indipendenti dei generatori (piogge, funghi, meteo con mappa forestale) hanno cercato difetti nel codice. Quelli riportati qui come **confermati** li ho ricontrollati io sul codice o sulle pagine; gli altri sono scritti come **segnalati**.

**Limiti.** Dal cloud il sito vero non si raggiunge (il proxy risponde 403), e nemmeno MET Norway, LibreWXR, le tessere delle cartine e Google Analytics. I dati da `raw.githubusercontent.com` invece arrivano. Nelle prove, quindi, previsioni, radar e cartine risultano «non disponibili», ed è normale. **Non ho i numeri di GA4 e Search Console**: dove servirebbero lo dico nella sezione apposita.

## Tabella riassuntiva

Peso = media dell'HTML, fra parentesi compresso (gzip). Parole = testo dell'HTML servito, prima del JavaScript. Difetti = alti / medi / bassi, contati nella sezione «Difetti».

| Famiglia | Pagine | Generatore | Sitemap | Peso KB | Parole | Difetti A/M/B |
|---|---|---|---|---|---|---|
| Mappa (`/`) e `/previsioni/` | 1 + 1 | `index.html` a mano, `functions/previsioni/index.js` | `sitemap-mappa.xml` | 1.167 (381) | 419 | 0 / 0 / 1 |
| Regioni piogge (`/toscana/`) | 23 | `genera-pagine-regione.js` | `sitemap-mappa.xml` | 105 (32) | 694 | 0 / 1 / 4 |
| «Adesso» (`/toscana/adesso/`) | 21 | `genera-pagine-adesso.js` + `lib/pagina-adesso.js` | `sitemap-mappa.xml` | 53 (15) | 573 | 0 / 0 / 3 |
| Zone piogge (`/zone/<zona>/`) | 114 | `genera-pagine-zona-piogge.js` | `sitemap-zone-piogge.xml` | 92 (28) | 547 | 0 / 2 / 2 |
| Indice funghi (`/funghi/`) | 1 | `genera-indice-funghi.js` | `sitemap-funghi.xml` | 92 (28) | 1.150 | 1 / 0 / 0 |
| Regioni funghi (`/funghi/toscana/`) | 19 | `genera-pagine-funghi.js` | `sitemap-funghi.xml` | 120 (38) | 799 | 1 / 1 / 1 |
| Zone funghi (`/funghi/zone/<zona>/`) | 114 | `genera-pagine-zona.js` | `sitemap-zone.xml` | 108 (33) | 614 | 1 / 1 / 2 |
| Paesi funghi (`/funghi/<reg>/<paese>/`) | 908 | `genera-pagine-localita.js` | `sitemap-localita.xml` | 113 (35) | 604 | 1 / 3 / 2 |
| Meteo di zona (`/meteo/<zona>/`) | 51 | `genera-pagine-meteo-zona.js` | `sitemap-meteo.xml`, `-b`, `-c` | 114 (36) | 468 | 0 / 2 / 2 |
| Meteo di paese (`/meteo/<reg>/<paese>/`) | 20 | `genera-pagine-meteo-paese.js` | `sitemap-meteo-paesi.xml` | 113 (35) | 455 | 0 / 1 / 1 |
| Mappa forestale (indice, 21 regioni, 3 tipi, 113 zone) | 138 | `genera-mappa-forestale.js` | `sitemap-mappa-forestale.xml` | 80 (24) | 650 | 2 / 2 / 1 |
| Guida e fonti | 2 | a mano + `testata-pagine-a-mano.js` | `sitemap-mappa.xml` | 81 e 34 | 6.460 e 2.001 | 0 / 0 / 2 |

In più, `sitemap-paesi-prova.xml` (20 paesi lombardi, prova del 25/10) è fuori dall'indice apposta: quei 20 indirizzi stanno anche in `sitemap-localita.xml`.

## Cose che valgono per tutte le famiglie

1. **Link, sitemap e canonical: tutto a posto.** Zero link interni rotti, zero link verso i 47 indirizzi con rimando di `_redirects`, zero pagine orfane, nessuna pagina fuori sitemap, nessuna voce di sitemap senza pagina. Il rimando `/meteo/` → `/previsioni/` funziona e nessuna pagina punta a `/meteo/`.
2. **SEO di base: pulito.** Nessun titolo, description o H1 doppio. Nessuna description sopra i 160 caratteri. Un solo H1 per pagina. Nessun `noindex`. `lang="it"` dappertutto. Tutti gli `og:image` esistono. **Restano 76 titoli sopra i 60 caratteri** (al massimo 64): 12 regioni piogge, 21 zone piogge, 27 paesi funghi, 8 regioni forestali, 6 meteo, 2 altri. Google li taglia in fondo, quindi conta poco, ma la parte tagliata è spesso «30 giorni» o «ultimi giorni».
3. **Dati strutturati: solo BreadcrumbList** (più WebSite sulla mappa e FAQPage sulla guida). Corrette e uguali al percorso visibile. Due dettagli: l'indice della mappa forestale ha un percorso di un solo elemento (Google ne vuole almeno due) e i percorsi funghi e forestali partono da `/funghi/` e `/mappa-forestale/`, non dalla mappa.
4. **Due stili di percorso visibile.** Piogge, «adesso», meteo e indice funghi usano `p.bric` («Mappa pluviometrica › Toscana › Garfagnana»); funghi e mappa forestale usano `p.nota` («‹ Piogge per funghi › Liguria», senza il nome del posto). Funzionano tutti e due, ma sembrano due siti.
5. **Anteprime social uguali per tutti.** `og:image` è `preview.jpg` su tutte le pagine tranne la mappa forestale (che ha lo scorcio di ogni pagina). `og:description` è **identica** su tutte le 908 pagine paese, sulle 114 zone funghi e sulle 21 «adesso». `twitter:card` c'è solo sulla mappa. Chi condivide una pagina paese su WhatsApp o Facebook vede la stessa anteprima e lo stesso testo per Sassello e per Bormio.
6. **Peso: quasi tutto è codice ripetuto.** In una pagina paese da 112 KB, 99 KB sono JavaScript e CSS in linea, e 98 KB sono identici fra due paesi qualsiasi. Lo stesso nelle zone piogge (76 su 94 KB), nelle meteo (86 su 116) e nelle regioni (82 su 111). Le sole «adesso» tengono il codice in un file a parte (`/lib/pagina-adesso.js?v=8`) e pesano la metà. Tutte le pagine insieme fanno 155 MB (48 compressi). Oltre alla velocità c'è un costo di lavoro: ogni correzione al codice comune obbliga a rigenerare e ripubblicare 1.300 pagine (lo si vede nei messaggi dei commit: «Rigenerate tutte le famiglie: cambia solo la copia di meteoClient»).
7. **Che cosa vede chi non esegue il JavaScript.** Zone piogge e regioni piogge nascono con i numeri di ieri scritti nell'HTML. Le pagine funghi (la risposta a «stanno nascendo?»), le «adesso» (il radar) e le meteo (le previsioni) nascono con «Sto leggendo…»: Google le vede solo dopo il rendering, e i bot che non eseguono il JavaScript non le vedono mai.
8. **Mancano le pagine indice intermedie.** `/zone/`, `/funghi/zone/`, `/mappa-forestale/zone/` e `/meteo/<regione>/` non esistono: chi accorcia l'indirizzo trova la pagina 404 (che `pubblica-pages.js` scrive al momento della pubblicazione, quindi è un 404 vero e non la mappa).

## Famiglia per famiglia

### 1. Mappa (`/`) e `/previsioni/`

- `index.html` pesa 1,17 MB (381 KB compressi). Titolo, description e WebSite in ordine.
- `/previsioni/` riscrive titolo, description, canonical e og con HTMLRewriter (`functions/previsioni/index.js:31-36`) ma **tiene l'H1 della mappa** («Mappa Pluviometrica Italia · Svizzera · Austria · Francia · Slovenia (v11.0)»). Il titolo dice «Previsioni meteo in Italia», la scritta grande parla d'altro.
- La mappa non ha nessun link HTML alla mappa forestale (`/mappa-forestale/` compare solo in un commento, `index.html:15208`).

### 2. Regioni piogge (`/<regione>/`)

- 23 pagine (20 regioni italiane senza l'Abruzzo, più Austria, Svizzera, Slovenia). Rifatte ogni mattina dal giro `pagine-regione.yml` (`SOLO=cotte`), **tranne la Slovenia**, che non è nella lista `COTTE` (`genera-pagine-regione.js:328`).
- Riquadro di ieri, «Che tempo farà», grafico dei 30 giorni, i più bagnati a 7, 20 e 30 giorni, le zone, i tasti della mappa. Percorso visibile e BreadcrumbList uguali. Dati di oggi (riepiloghi generati alle 4:15 UTC, ultimo giorno 31/10). La Puglia mostra giustamente l'avviso giallo dei giorni stimati (26-29/10).
- **Tre forme di titolo**, ed è una prova voluta: «mappa di 368 pluviometri, ieri e 30 giorni», «mappa di 281 pluviometri, 30 giorni», «dove ha piovuto ieri, 31 ottobre» (Lazio, Liguria, Umbria).
- **Confermato: il numero di pluviometri cambia dentro la stessa pagina.** Il titolo prende i pluviometri dei 7 giorni (`genera-pagine-regione.js:476`), che dopo il filtro di copertura sono i meno; il sottotitolo prende il minimo fra ieri e 7 giorni arrotondato («oltre 45», `:913`); il riquadro mostra quelli di ieri. Basilicata: titolo 50, sottotitolo «oltre 45», riquadro 62. Campania: 165, «oltre 160», 175.
- **Confermato: la Slovenia si contraddice.** Titolo e sottotitolo dicono «oltre 110 pluviometri», il riquadro «Media di 109». Il sottotitolo e l'og:title promettono «ieri», ma la Slovenia ieri non ce l'ha mai (ARSO pubblica con 34 ore di ritardo) e il tasto «Ieri» apre un giorno vuoto. È l'unica regione con i numeri solo dal JavaScript.
- **Link:** le regioni ricevono molti link (da 22 a 236), ma **non si linkano fra loro**: nessuna porta alla regione vicina. Il piede dice «oppure il riepilogo delle regioni» e i 19 link vanno alle pagine **funghi** delle regioni (`genera-pagine-regione.js:205`); mancano Molise, Austria, Svizzera e Slovenia.

### 3. «Adesso» (`/<regione>/adesso/`)

- 21 pagine (le 20 regioni più l'Abruzzo). Le più leggere (53 KB) perché il codice sta in `lib/pagina-adesso.js`. Si linkano fra loro e ricevono un link dalla loro regione.
- Nell'HTML servito c'è «Sto guardando il radar…»: il contenuto vivo arriva tutto dal JavaScript, ed è nella natura della pagina.
- **Non si rifanno ogni giorno**: il numero di pluviometri scritto nel testo resta quello del giorno della generazione. La Valle d'Aosta dice «oltre 65», rigenerata oggi direbbe «oltre 60».
- **Confermato:** Puglia, Molise, Basilicata e Sardegna dicono «I millimetri di … pluviometri, zona per zona» (`genera-pagine-adesso.js:245`), ma le loro pagine regione non hanno le zone.
- **Confermato:** con cinque città raggiunte dalla pioggia la riga viva scrive «e altre una città» (`lib/pagina-adesso.js:181-182`, `NUM[1]` vale «una»).

### 4. Zone piogge (`/zone/<zona>/`)

- 114 pagine, rifatte ogni mattina, numeri di ieri e tabella scritti nell'HTML. Sitemap con la data dei numeri. Ben collegate (da 7 a 39 link in entrata), anche con le pagine funghi e meteo della stessa zona.
- **Confermato: contano anche i pluviometri esclusi dalla mappa.** In 13 zone su 114 il sottotitolo dice un numero e la media ne usa uno in meno: Riviera di Levante «3 pluviometri», media su 2 (Sella Giassina esclusa); Monte Pisano 3 contro 2 (Cimone); Calvana 16 contro 14 (Cantagallo e Diga di Pavana). `genera-pagine-zona-piogge.js:228, 329, 381` usano `ids.length` senza togliere le liste `*_ESCLUSE`. E la nota in fondo (`:385`) spiega il trattino come «quel pluviometro in quei giorni non ha pubblicato», mentre lo abbiamo escluso noi perché guasto.
- **Poche stazioni per zona.** 2 zone hanno 2 pluviometri e 46 ne hanno 3. Le zone prendono solo i «posti da bosco» delle pagine funghi, non tutti i pluviometri dell'area: la Val d'Aveto ne usa 2, mentre entro 10 km dal suo centro i file della Liguria ne hanno 8.
- Il grafico dei 30 giorni nasce vuoto (lo disegna il browser), a differenza delle regioni dove è scritto nell'HTML.
- Latente: se l'ultimo giorno non è ieri esce «il 1 novembre» invece di «l'1» (`:196`); le regioni usano già `ilData`.

### 5. Indice funghi (`/funghi/`)

- Una pagina, 1.150 parole, percorso visibile, 168 link (porta a tutte le regioni e zone). Riceve link da quasi tutte le pagine funghi e piogge.
- Eredita il difetto delle stime (vedi Difetti, A1), perché la classifica viene dagli stessi file di `genera-funghi.js`.

### 6. Regioni funghi (`/funghi/<regione>/`)

- 19 pagine. **Il Molise manca apposta**: nessun suo pluviometro arriva al 37% di bosco (`genera-pagine-funghi.js:25-28`), e l'indice lo dice.
- **Pagine sottili al sud.** Posti da bosco per regione: Puglia 2, Basilicata 6, Sardegna 8, Sicilia 9, poi Calabria e Umbria 17, fino alla Toscana con 169. La pagina della Puglia («Funghi in Puglia oggi») si regge su Bosco Umbra e Vico del Gargano, tutti e due sul Gargano.
- Non linkano `/fonti` (sono l'unica famiglia), anche se citano l'ente nel testo.

### 7. Zone funghi (`/funghi/zone/<zona>/`)

- 114 pagine, allineate al generatore. Percorso in `p.nota`, BreadcrumbList a tre livelli.
- **Confermato: zone con posti che non c'entrano** (`.github/scripts/funghi-zone.json`):
  - «Valle Sessera» contiene Armeno, Monte Mesma e Paruzzaro, in provincia di Novara;
  - «Valtiberina» contiene Monte Nerone, Pianello di Cagli e Serravalle di Carda, nelle Marche;
  - «Calvana» contiene le dighe di Suviana e di Pavana, in provincia di Bologna;
  - «Val d'Aveto» ha solo Cabanne e Pratomollo: **Santo Stefano d'Aveto non è nella sua valle**, e la sua pagina rimanda alla Liguria.
  - In tutto 317 posti su 908 non hanno una zona.
- **Confermato:** il ritratto di zona scrive «il più asciutto Piazza al Serchio con 386.» senza «mm» (`genera-pagine-zona.js:341`).

### 8. Paesi funghi (`/funghi/<regione>/<paese>/`)

- 908 pagine, la famiglia più grande. Allineate al generatore tranne il ritratto, che si rifà ogni tre mesi (prossimo giro il 1/12, cron `20 11 1 3,6,9,12 *`).
- **Testo in comune fra sorelle** (misura della lettura funghi): 42-49% di frasi identiche dentro `<main>` fra due paesi della stessa regione, 31% fra regioni diverse. Il testo visibile è circa 3,5 KB su 113.
- **Confermato: nomi brutti nel titolo e nell'H1.**
  - Accenti scritti come apostrofo, che `bello()` (`lib-nomi.js:108`) non corregge: «Male'», «Fie' allo Sciliar», «Viu' Centrale Fucine», «Roccaforte Mondovi'», «Centa San Nicolo'», «Biviere di Cesaro'», «Scurtabo'», «Sero' di Zignago», «Col di Pra'». Ognuno compare anche in una trentina di elenchi di pagine vicine.
  - Nomi tecnici rimasti fuori da `nomi-titolo.json`: «Branzi Caserma Carabinieri», «Verceia Campo sportivo», «Lavena Ponte Tresa via della Boschiva», «Idro Frana», «Grosio Diga Fusino».
  - Provincia abolita: «San Michele (CI)».
- **Confermato: il ritratto è indietro di un mese.** Il «mese più piovoso, fra quelli che abbiamo per intero» è agosto su 573 pagine e settembre su 246; rigenerando oggi, con ottobre finito, 394 pagine direbbero ottobre (Sassello: agosto 49 mm contro ottobre 222 mm). In più `lib-clima.js:136` conta come intero anche il mese in corso appena supera il 90% dei giorni, cioè dal 28 del mese.
- **Confermato: il verdetto conta come zero fino al 40% di giorni senza dato** (`genera-pagine-localita.js:640`) senza dirlo nel riquadro. Secondo la lettura funghi oggi riguarda 35 pagine.
- Segnalato, non ricontrollato: pluviometri spenti con la pagina ancora viva (Bore, ultimo dato il 7/10; Campagrina il 10/10); undici comuni con due pagine (Recoaro Terme, Borca di Cadore, Vodo di Cadore, Torriglia, Longarone...); un telefono con l'orologio indietro di pochi minuti, subito dopo il giro delle 4:15, vede «Non riesco a leggere l'archivio» (`genera-pagine-localita.js:567`, `eta >= 0`).

### 9. Meteo di zona (`/meteo/<zona>/`)

- 51 pagine in tre sitemap (A 11, B 20, C 20), allineate al generatore. Testata, percorso, barra che scorre, «Guarda le nostre mappe», «Previsioni meteo in <regione>». Ben collegate dopo il lavoro del 31/10 (da 5 a 26 link in entrata).
- **Il gruppo C è già online.** `sitemap-meteo-c.xml` è nell'indice e le 20 pagine sono linkate dal 30/10 (commit `c02696fe`), mentre il `CLAUDE.md` dice «si pubblica dopo quella lettura (~3-4/11)». Da tenere presente nella lettura di A e B.
- **Confermato: quasi doppioni nel gruppo C** (paesi in comune in `data/paesi-zone.json`): Candalla e Alpi Apuane 7 su 9; Val Serina e Val Brembana 8 su 12. Segnalato anche Val di Luce e Media Valle del Serchio, 6 su 12.
- **Confermato: «Meteo Riviera di Levante» mostra soprattutto la Fontanabuona**: Neirone, Favale di Malvaro, Cicagna, Moconesi, Uscio, Orero, Tribogna, Lorsica, Avegno, San Colombano Certenoli; della Riviera solo Rapallo e Santa Margherita, niente Chiavari, Lavagna o Sestri Levante.
- **Sospetto forte: due temperature per lo stesso paese.** Nessuno dei paesi di `data/paesi-zone.json` ha la quota (`q`), quindi tabella, mappa e barra chiedono le previsioni senza quota; la scheda ora per ora invece manda la quota cotta (`genera-pagine-meteo-zona.js:669`). Il testo promette «ognuno alla sua quota».
- Segnalati, non ricontrollati uno per uno: se l'API cade la tabella cotta resta coi «…» per sempre; «Il punto di stamattina» resta tale anche alle 22; la data di oggi si calcola una volta sola e dopo mezzanotte sbaglia di un giorno; le fasce di 6 ore escono come «19-1»; nella tendina della ricerca compaiono chiavi grezze come «AO · valledaosta».
- Il tasto «Iscriviti» qui (e su regioni piogge e «adesso») porta al canale senza `?sub_confirmation=1`, mentre su zone piogge, funghi, forestale, guida e fonti ce l'ha.

### 10. Meteo di paese (`/meteo/<regione>/<paese>/`)

- 20 pagine, allineate. L'H1 è solo «Meteo Sassello», mentre le zone hanno «Meteo Casentino: previsioni a 7 giorni».
- Ricevono link soprattutto dalle meteo di zona e dalla loro pagina funghi gemella. `/meteo/liguria/` non esiste (404).
- Segnalato: se il punto del pluviometro non risponde e gli altri sì, la pagina mostra senza dirlo le previsioni del primo paese della tabella (`genera-pagine-meteo-zona.js:394` e `:926`).

### 11. Mappa forestale (`/mappa-forestale/...`)

- 138 pagine: indice, 21 regioni, 3 tipi, 113 zone. Allineate al generatore. Ogni pagina ha il suo `og:image` (lo scorcio). Le licenze delle 21 regioni corrispondono a quelle di `fonti.html`.
- **Confermato: la Carnia descrive la zona vecchia.** `.github/scripts/mappa-forestale-dati.json` è del 25/10, la Carnia è stata rifatta il 30/10. La pagina `mappa-forestale/zone/carnia/` elenca ancora «Tramonti Invaso» (Prealpi pordenonesi) con le sue percentuali di bosco, mentre il blocco «Che tempo farà» della stessa pagina mostra i paesi della Carnia nuova.
- **Confermato: l'Abruzzo dichiara «pioggia vera».** Il modello (`genera-mappa-forestale.js:342`) scrive per tutte le regioni «i pluviometri della regione, con la pioggia vera giorno per giorno»: per l'Abruzzo, che è Open-Meteo, è falso.
- **Confermato: «dodici colori» e «11 tipi di bosco» sulla stessa schermata** dell'indice (`genera-mappa-forestale.js:571-572`, il numero 11 è scritto a mano).
- **Confermato: date della sitemap ferme.** Indice, tipi e zone (117 indirizzi) hanno `lastmod` 2026-10-20 (`genera-sitemap.js:175`, data scritta nel codice), ma le pagine sono cambiate il 26/10 (cerrete) e il 28/10 (testata nuova): lo dice la storia dei file su GitHub.
- **Confermato: isola.** Le 138 pagine ricevono link solo fra loro e dalla guida (2 link). Né la mappa, né le pagine funghi («Che boschi ci sono»), né le zone piogge portano a `/mappa-forestale/<regione>/` o alla zona forestale gemella.
- La Valle Sabbia è esclusa apposta (`genera-mappa-forestale.js:157-160`, «quasi tutta grigia», 63,7% di grigio), ma la Val Cavargna col 52,8% c'è; il commento in cima (`:5`) dice ancora 114 zone.

### 12. Guida e fonti

- **Guida:** 6.460 parole, 20 capitoli, FAQPage e BreadcrumbList, foto con `alt`. Una didascalia dice ancora «la legenda dei dieci gruppi» (oggi sono dodici). Il capitolo «Le pagine del sito» non cita le pagine meteo.
- **Fonti:** canonical `/fonti` senza `.html`, e tutti i 1.391 link interni usano `/fonti`: su Cloudflare Pages è la forma giusta. Niente dati strutturati, niente piede comune. `lastmod` 2026-10-08 (`genera-sitemap.js:79`) mentre la pagina è cambiata il 25/10 (GeoNames, tessere del terreno) e il 28/10 (testata). I crediti del satellite Esri mancano su GitHub, ma sono nei commit locali non ancora spinti.

## Difetti, ordinati per gravità

**Alta** (dicono una cosa falsa a chi legge, su un tema che il progetto tiene serio)

- **A1. Stime contate come pioggia vera nelle pagine funghi.** `genera-funghi.js:100` legge i file con `leggi()` di `lib-giorni.js:40-45`, che non scarta né i file `open-meteo-*` né le stazioni `om:true`; il ripiego nel browser fa lo stesso (`genera-pagine-funghi.js:594`). Il ritratto invece le scarta (`lib-clima.js`). Esempio: Puglia, 26-29/10 tutti `open-meteo-gapfill`; nel file `data/funghi/puglia-giorni.json` Bosco Umbra ha 38,5 mm negli ultimi 7 giorni, di cui 15,5 stimati (il 30/10 da solo vale 15 mm), e la pagina dice «millimetri misurati a terra». Tocca indice, regioni, zone e paesi funghi ogni volta che MeteoHub perde un giorno (dal 1/9 è successo 13 volte, secondo la lettura funghi).
- **A2. Carnia forestale sulla zona vecchia** (`mappa-forestale-dati.json` del 25/10, pagina `mappa-forestale/zone/carnia/`).
- **A3. Abruzzo forestale con «pioggia vera»** (`genera-mappa-forestale.js:342`).

**Media**

- **M1. Numeri che si contraddicono nella stessa pagina:** Slovenia (oltre 110 / 109, «ieri» che non c'è), Basilicata e Campania (tre conteggi diversi, `genera-pagine-regione.js:476` e `:913`), mappa forestale («dodici colori» / «11 tipi», `genera-mappa-forestale.js:572`).
- **M2. Zone piogge che contano i pluviometri esclusi** e spiegano male il trattino (`genera-pagine-zona-piogge.js:228, 329, 381, 385`), 13 zone.
- **M3. Zone funghi con posti sbagliati o mancanti** (Valle Sessera, Valtiberina, Calvana, Val d'Aveto senza Santo Stefano) in `funghi-zone.json`; le stesse zone alimentano zone piogge, meteo e forestali.
- **M4. Nomi nei titoli dei paesi** (accenti come apostrofo, nomi tecnici, provincia CI): `lib-nomi.js:108`, `nomi-titolo.json`.
- **M5. Ritratto dei paesi indietro** (mese più piovoso) e mese in corso contato come intero (`lib-clima.js:136`).
- **M6. Verdetto funghi con fino al 40% di giorni senza dato contati come zero** (`genera-pagine-localita.js:640`).
- **M7. Mappa forestale senza link in entrata** dal resto del sito.
- **M8. Date `lastmod` ferme** su 117 indirizzi forestali e su `/fonti` (`genera-sitemap.js:79, 175`).
- **M9. Meteo: gruppo C con quasi doppioni e Riviera di Levante fuori zona**; sospetto delle due quote per lo stesso paese (`data/paesi-zone.json` senza `q`).
- **M10. Pagine sottili:** regioni funghi Puglia (2 posti), Basilicata (6), Sardegna (8), Sicilia (9); 48 zone piogge e funghi con 2-3 pluviometri.

**Bassa**

- **B1.** Description delle regioni: «0,0 mm di media» quando la media si arrotonda a zero (`genera-pagine-regione.js:310`, la pagina invece scrive «meno di 0,1»); doppio punto quando manca ieri e la settimana è asciutta (`:300-301`); description della Puglia con i 7 giorni che comprendono i giorni stimati.
- **B2.** «zona per zona» nelle «adesso» delle regioni senza zone (`genera-pagine-adesso.js:245`); numero di pluviometri fisso nelle «adesso».
- **B3.** «e altre una città» (`lib/pagina-adesso.js:181-182`).
- **B4.** «con 386.» senza «mm» nelle zone funghi (`genera-pagine-zona.js:341`).
- **B5.** Piede delle regioni piogge che chiama «riepilogo delle regioni» i link alle pagine funghi (`genera-pagine-regione.js:205`); nessun link fra regioni vicine.
- **B6.** `og:description` identica su 1.043 pagine, `og:image` uguale ovunque fuori dalla forestale, `twitter:card` solo sulla mappa.
- **B7.** `/previsioni/` con l'H1 della mappa (`functions/previsioni/index.js`).
- **B8.** Due stili di percorso visibile; percorso della mappa forestale a un elemento.
- **B9.** Guida: «legenda dei dieci gruppi»; nessun cenno alle pagine meteo.
- **B10.** Meteo: difetti minori del codice nel browser (segnalati, vedi famiglia 9); «Iscriviti» con e senza `sub_confirmation`.
- **B11.** Latente: «il 1 novembre» nelle zone piogge (`genera-pagine-zona-piogge.js:196`).

## Dove servirebbero GA4 e Search Console

- **Quale titolo delle regioni funziona meglio** fra le tre forme in prova.
- **Cannibalizzazione «Meteo funghi Casentino» contro «Meteo Casentino».** Dal 31/10 i titoli funghi cominciano con «Meteo funghi»: per le 51 zone e i 20 paesi che hanno anche la pagina meteo, bisogna vedere quale indirizzo Google mostra per «meteo <zona>».
- **Pagine sottili** (funghi Puglia, Basilicata, Sardegna, Sicilia; zone a 2-3 pluviometri): servono impressioni e clic per decidere se allargarle, unirle o lasciarle.
- **Indicizzazione delle 908 pagine paese** (rapporto Pagine, «scansionata, attualmente non indicizzata») e la prova di `sitemap-paesi-prova.xml`.
- **Gruppo C delle meteo**, già online dal 30/10: la sua misura parte da lì, non dal 3-4/11.
- **Mappa forestale:** quante visite arrivano da Google pur senza link interni, per capire quanto vale collegarla.

## Proposte, ordinate per utilità

| # | Proposta | Perché | Costo |
|---|---|---|---|
| 1 | **Togliere le stime dalle pagine funghi**: in `genera-funghi.js` e nel ripiego trattare i file `open-meteo-*` e le stazioni `om:true` come giorni senza dato, come fa già `lib-clima.js`; oppure mostrare l'avviso giallo delle pagine piogge. | È la regola 4 del progetto, e le pagine dicono «misurati a terra». | Piccolo |
| 2 | **Correggere le contraddizioni visibili**: Slovenia fra le pagine cotte e senza «ieri» nel testo fisso; un solo numero di pluviometri per pagina regione (quello dei 30 giorni, con un margine che non balli); «12 tipi» nell'indice forestale; frase dell'Abruzzo forestale; zone piogge senza gli esclusi e con la nota del trattino giusta. Poi rigenerare. | Sono sulla prima schermata e minano la fiducia nei numeri. | Piccolo |
| 3 | **Rifare la Carnia forestale** (`mappa-forestale-dati.json` sul banco) e rigenerare la sua pagina. | Unica zona che descrive un posto diverso da quello del titolo. | Medio |
| 4 | **Sistemare le zone in `funghi-zone.json`**: Val d'Aveto con Santo Stefano d'Aveto e Amborzasco, Valle Sessera senza i posti novaresi, Valtiberina senza quelli marchigiani, Calvana senza le dighe bolognesi; poi rigenerare zone (piogge, funghi, meteo, forestale) e i paesi toccati. | Le zone sono la base di quattro famiglie. | Piccolo-medio |
| 5 | **Collegare la mappa forestale**: nelle regioni funghi e nelle zone funghi un link «Carta forestale della Toscana» e «Boschi della Garfagnana» accanto a «Che boschi ci sono»; un link anche dalla mappa. | 138 pagine oggi raggiungibili quasi solo dalla guida. | Piccolo |
| 6 | **Nomi dei paesi**: accento finale in `bello()` (`Male'` → `Malè`, `Mondovi'` → `Mondovì`), completare `nomi-titolo.json` coi nomi tecnici rimasti, province CI e OG. | Titoli e H1 sono la prima cosa che Google mostra. | Piccolo |
| 7 | **Ritratti dei paesi ogni mese** (cron di `rinnova-pagine.yml` il 2 di ogni mese, ora che pubblicare su Cloudflare Pages è gratis) e mese «intero» solo se è finito. | Il mese più piovoso oggi è sbagliato su circa 400 pagine fino al 1/12. | Piccolo |
| 8 | **Anteprime social per pagina**: `og:description` = la description della pagina; `og:image` dall'anteprima della regione o dallo scorcio; `twitter:card`. | Le pagine funghi girano nei gruppi WhatsApp: oggi sembrano tutte uguali. | Piccolo |
| 9 | **Link fra regioni vicine** nelle pagine regione piogge (la tabella delle regioni confinanti c'è già nella mappa) e piede con le pagine piogge vere oltre a quelle funghi. | Le 23 regioni oggi non si parlano. | Piccolo |
| 10 | **Date `lastmod` vere**: spostare forestale, fonti e previsioni in `pagine-lastmod.json`; meglio ancora calcolarle da sole dall'impronta del guscio (l'HTML senza i numeri cotti), così una data non resta più indietro. | Google si fida delle date solo se sono vere. | Piccolo (a mano) / Medio (automatico) |
| 11 | **Cuocere nell'HTML il verdetto funghi**, ogni mattina come le zone piogge: prima le 114 zone, poi i 908 paesi. | La risposta a «stanno nascendo?» arriverebbe a Google e a chi ha rete lenta senza JavaScript. | Medio |
| 12 | **Codice comune in file esterni con versione** (`/lib/pagina-funghi.js?v=`, `/lib/stile.css?v=`), come già fa la «adesso». | Pagine da circa 113 a circa 15 KB; una correzione al codice tocca un file invece di 1.300 pagine. | Medio-grande |
| 13 | **Zone piogge con tutti i pluviometri dell'area**, non solo i posti da bosco. | 48 zone poggiano su 2-3 strumenti. | Medio |
| 14 | **Pagine funghi sottili del sud**: allargare i posti da bosco (la soglia del 37% di bosco) o decidere coi numeri di Search Console. | Una «Funghi in Puglia» su due pluviometri del Gargano promette troppo. | Medio |
| 15 | **Meteo**: quota in `paesi-zone.json`; differenziare o togliere i quasi doppioni del gruppo C; paesi veri della Riviera di Levante; ripiego sul paese della pagina se il pluviometro non risponde. | Coerenza delle temperature e pagine davvero diverse fra loro. | Piccolo-medio |
| 16 | **`/previsioni/`: riscrivere anche l'H1** nella Function. | Titolo e scritta grande dicano la stessa cosa. | Piccolo |
| 17 | **Un solo stile di percorso visibile** (quello `p.bric` col nome del posto) e percorso forestale che parta dalla mappa. | Coerenza fra famiglie. | Piccolo |
| 18 | **Pagine indice intermedie** (`/zone/`, `/funghi/zone/`, `/meteo/liguria/`) o rimandi alla pagina madre. | Oggi danno 404; utilità bassa. | Piccolo-medio |

## Attrezzi usati (fuori dal repo)

Gli script stavano nella cartella temporanea della sessione cloud e non sono nel repo: `leggi.py` (legge le pagine), `aggrega.py` (titoli, description, doppioni), `link.py` (grafo dei link e sitemap), `pezzi.py` (quali blocchi comuni ha ogni famiglia), `browser.js` e `testo.js` (prove con Playwright a 393 e 1366 px). Se servono si possono rifare in poco tempo dalla descrizione qui sopra.
