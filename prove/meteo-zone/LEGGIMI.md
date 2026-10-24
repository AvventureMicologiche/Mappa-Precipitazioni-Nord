# Pagine «Previsioni meteo <zona>»: il campione e cosa farne (24/10/2026)

Questa cartella sta in `prove/`, che `pubblica-pages.js` NON pubblica mai. È il campione approvato dall'utente
il 24/10/2026 sera, fatto e collaudato in locale nella scheda «Mappa pluviometrica 92». Serve alla sessione che
deve trasformarlo in pagine vere, sul ramo `meteo-zone`.

## Cosa c'è qui

- `costruisci.js` — il costruttore del campione. Legge `zone/val-brembana/index.html` (stile e testata),
  `data/paesi-zone.json`, `.github/scripts/funghi-posti.json`, chiede le quote dei paesi a Open-Meteo Elevation
  e scrive `val-brembana/index.html`. ⚠️ Ha i percorsi del PC dell'utente (`D:/video youtube/...`): va riscritto
  come generatore del repo, non copiato.
- `val-brembana/index.html` — la pagina campione già costruita: è il RIFERIMENTO per l'aspetto e il comportamento.
- `campione-telefono.png`, `campione-computer.png`, `var-F-pioggia.png` — come deve apparire.
- `prova-tocchi.js`, `prova-fasce.js`, `conta-sovrapposte.js`, `scatta.js`, `scatta-varianti.js` — le prove
  puppeteer usate in locale (puntano a `http://localhost:8897/val-brembana/`).

## Il lavoro da fare (deciso dall'utente il 24/10)

1. Un generatore vero `.github/scripts/genera-pagine-meteo-zona.js`, sullo stile degli altri generatori
   (`genera-pagine-zona-piogge.js` è il parente più stretto), che scrive **`/meteo/<slug>/index.html`**.
2. Le **11 pagine del test**: le 10 zone più viste in GA4 negli ultimi 28 giorni più il campione:
   `garfagnana`, `lunigiana`, `casentino`, `valsassina`, `valdarno`, `mugello`, `nebrodi`, `val-bormida`,
   `colline-metallifere-grossetane`, `val-d-aveto`, `val-brembana`. Un elenco nel generatore, NON tutte le 114.
3. Una sitemap a parte, **`sitemap-meteo.xml`**, aggiunta all'indice `sitemap.xml` (vedi `genera-sitemap.js` e
   `pagine-lastmod.json`): serve a misurare in Search Console solo queste pagine.
4. Nelle pagine zona piogge (`/zone/<slug>/`) e zona funghi (`/funghi/zone/<slug>/`) di QUESTE 11 zone, un link
   «Previsioni meteo <Zona> →» nel blocco «Che tempo farà», verso `/meteo/<slug>/`. Serve a dire a Google quale
   delle tre pagine è quella delle previsioni. Solo un link: il resto delle pagine non si tocca.

## Le decisioni dell'utente da rispettare (tutte prese guardando il campione)

- **Titolo** «Previsioni meteo <Zona>: che tempo farà nei prossimi 7 giorni, paese per paese»; H1 «Previsioni meteo
  <Zona>». Le tre famiglie devono rispondere a tre domande diverse: piogge «Dove ha piovuto in…», funghi «Funghi
  in… oggi», questa «Previsioni meteo…».
- **Casella «Cerca il tuo paese, anche una frazione»** in alto: elenco `/data/elenco-paesi.txt` + frazioni dal
  geocoder Open-Meteo. Scegliere un posto apre la **scheda del posto QUI**, non la mappa (la mappa resta un bottone
  nella scheda).
- **La scheda del posto si apre SEMPRE su OGGI**, con le ore (`/api/previsioni?lat=&lon=&q=`), anche se la pagina
  è su un altro giorno. Fila dei 7 giorni in cima alla scheda, sei bottoni verso la mappa (previsioni, pioggia
  caduta, radar, temperature, boschi, satellite).
- **Ore e fasce riempiono la riga**: griglia che si allarga; le fasce di 6 ore hanno il nome (notte, mattina,
  pomeriggio, sera). Niente spazi vuoti (sua richiesta esplicita).
- **«Il punto di stamattina»**: testo scritto dai dati (ieri, 7 giorni, prossimi 7 giorni, notte più fredda, giorno
  più caldo). Niente redattore, niente testi copiati.
- **I 7 giorni della valle si toccano**: mappa, titolo della mappa e colonna della tabella passano a quel giorno.
- **Mappa della valle**: OpenStreetMap + il **RILIEVO del sito** (tessere TINITALY/INGV su jsDelivr, stessa
  ricetta della mappa boschi: pane z-index 190 sotto le tessere in `mix-blend-mode:multiply`; credito «rilievo:
  TINITALY 1.1, INGV (CC BY 4.0)»). Qui si può perché sotto non c'è la heatmap della pioggia. Niente satellite.
- **Etichette: variante F** (scelta il 24/10): pillola bianca su una riga con **icona del cielo SEMPRE** (l'utente
  si è arrabbiato quando era sparita), minima blu e massima arancio SEMPRE, **«💧0,8»** solo se piove (bollino blu
  pieno da 1 mm), poi il nome. Niente interruttore pioggia/temperature. Puntino sul paese, **lineetta** quando
  l'etichetta si sposta, etichette che **non escono dalla mappa** e **non si sovrappongono** (26 posti, piazzate
  dall'alto in basso, se nessun posto è libero quello che copre meno), sopra i puntini verdi dei pluviometri.
  `conta-sovrapposte.js` deve dare zero con la F.
- **Paese per paese**: tabella dal più basso al più alto (quota del terreno, «~»), ogni riga apre la scheda.
- **Grafico** 30 giorni misurati (riepilogo di zona) + 7 previsti tratteggiati; ogni barra si tocca e dice il
  numero.
- Le pagine stanno in fondo con «Come funziona»: previsioni ECMWF via MET Norway (CC BY 4.0), pioggia misurata
  dall'ente della zona. Rimandi a zona piogge, zona funghi, mappa, previsioni sulla mappa; bottone radar verso
  `/<regione>/adesso/`.

## Regole del progetto da non dimenticare (CLAUDE.md del repo)

- Il codice che gira nel BROWSER è **solo ES5**: niente frecce, `let`, `const`, backtick (vedi la sezione «Zone
  piogge e zone funghi anche meteo»). Il campione usa `String.prototype.padStart`: va bene, ma niente di più nuovo.
- Nel repo le richieste vanno al **sito stesso** (`/api/previsioni`, `/data/...`), non al dominio assoluto: il
  campione puntava a produzione solo perché girava in locale fuori dal repo. Riepilogo di zona: come fa la pagina
  zona piogge (`data/riepiloghi/zone/<slug>.json`).
- Quote dei paesi: niente chiamate a Open-Meteo dal browser; si cuociono nel generatore (o si legge
  `data/quote-terreno.json` / `lib-quota-terreno.js`), come fanno gli altri.
- **Niente push su `main`, niente pubblicazione.** Si lavora e si committa solo sul ramo `meteo-zone`. L'utente
  controlla in locale e poi decide «sincronizzo?» e «pubblico?». Le prove si fanno in locale
  (`python -m http.server` dentro il repo), mai sul sito di test.
- Si parla in italiano, si dà del tu, niente trattini lunghi nei testi delle pagine.

## Quando la sessione ha finito

Lasciare nel ramo un resoconto breve (`prove/meteo-zone/RESOCONTO.md`): cosa ha generato, come si prova in locale,
cosa non è riuscita a fare o a provare, e gli scatti telefono/computer di almeno 2 pagine.
