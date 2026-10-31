# Controllo SEO delle pagine, 31/10/2026

Controllo dei FILE di main al commit `bfac3db1` (31/10 mattina). Nessun file del sito
toccato: tutto sta in questa cartella. Search Console non l'ho vista: i numeri delle
ricerche sono quelli scritti nel compito e in `CLAUDE.md`.

**Cosa ho letto:** 1.412 pagine HTML (tutte), le 11 sitemap, `robots.txt`, `_redirects`,
i generatori in `.github/scripts/`. `/previsioni/` non e' un file: e' `index.html`
riscritto da `functions/previsioni/index.js`, l'ho guardata dal codice. `/meteo/` non
esiste ed e' giusto: e' un 301 a `/previsioni/` (scelta del 28/10).

**Il web:** 3bmeteo.com non e' raggiungibile da questa sessione (rete chiusa), quindi il
punto 11 del compito (titoli dei concorrenti) non c'e'. Per farlo va aperto il dominio
nelle impostazioni di rete della sessione.

**Come si rifa':** dalla radice del repo
`python3 controlli/seo-31-10/analizza.py`, poi da dentro la cartella `python3 simili.py`
e `python3 extra.py`. Il primo scrive `dati.json` (9 MB, non committato: si rigenera in
7 secondi).

---

## Le proposte, in ordine

Ognuna dice famiglia, quante pagine, prima e dopo, e dove si cambia. Ho tenuto fuori le
cose che `CLAUDE.md` dice gia' scelte e misurate (le elenco in fondo).

### ALTA

**1. Le 71 pagine meteo sono un vicolo cieco, e ricevono 2-3 link a testa.**
- Famiglie: meteo-zona (51), meteo-paese (20).
- Cosa c'e': ogni pagina meteo linka solo `/`, `/fonti`, `/guida/` e `/previsioni/`
  (piu' le mappe con parametri). Nessun link ad altre pagine meteo, nessuno alla sua zona
  piogge, alla zona funghi, alla pagina «adesso» della regione. In entrata: le zone meteo
  hanno 3 link (zona piogge, zona funghi, «adesso»), i paesi meteo 2 (pagina funghi del
  paese, «adesso»). Esempio: `/meteo/toscana/badia-prataglia/` non linka
  `/meteo/casentino/` e viceversa, anche se Badia Prataglia sta nel Casentino.
- Il genitore nelle briciole e' `/previsioni/`, che nell'HTML non linka nessuna pagina
  meteo (la mappa linka solo le 19 regioni funghi, guida e fonti).
- Proposta, solo link e parole, il blocco esiste gia':
  - in fondo a meteo-zona e meteo-paese mettere `linkMeteoRegione(reg, ga)` di
    `genera-pagine-meteo-zona.js` (lo usano gia' le pagine «adesso»): «Previsioni meteo
    valle per valle» + «paese per paese» della stessa regione;
  - nel paese meteo, nelle briciole e nel testo, la sua valle quando c'e':
    prima «Mappa pluviometrica › Previsioni meteo › Badia Prataglia», dopo
    «Mappa pluviometrica › Previsioni meteo › Casentino › Badia Prataglia»;
  - lo stesso blocco `linkMeteoRegione` nelle 23 pagine regione (`/toscana/`,
    `genera-pagine-regione.js`) e nelle 19 regioni funghi (`genera-pagine-funghi.js`),
    accanto a «Che tempo farà in <regione>». Oggi 42 di queste pagine non hanno nessun
    link a una pagina meteo (`problemi.csv`, «nessun-link-a-pagine-meteo»).
- Effetto stimato: le zone meteo passano da 3 a ~20-30 link in entrata, i paesi da 2 a
  ~20, e da pagine forti (le regioni hanno 22-88 link in entrata).
- Nota: il 28/10 si e' deciso di togliere dalle pagine meteo i rimandi a zona piogge e
  zona funghi («troppo simili»). Questa proposta non li rimette: aggiunge solo pagine
  della stessa famiglia meteo.

**2. Le zone meteo non nominano i loro paesi nell'HTML.**
- Famiglia: meteo-zona, 51 pagine su 51 (`problemi.csv`, «paesi-solo-da-javascript»).
- `/meteo/casentino/` dice «in 12 paesi della valle», ma Bibbiena, Poppi, Pratovecchio
  Stia, Chiusi della Verna... arrivano solo dopo il JavaScript (da `/api/previsioni`).
  Nell'HTML ci sono zero nomi su 12. Chi cerca «meteo poppi» o «meteo casentino bibbiena»
  non trova niente nel testo. I nomi sono gia' in `data/paesi-zone.json` quando la pagina
  si genera.
- Testo statico della pagina: 336 parole di mediana, di cui il 78% uguale in tutte e 51
  (la quota piu' alta del sito dopo le «adesso»). I nomi dei paesi sono proprio il testo
  che manca.
- Proposta (`genera-pagine-meteo-zona.js`, sottotitolo e tabella):
  - prima: «Che tempo farà nel Casentino nei prossimi 7 giorni: pioggia, minime e massime
    in 12 paesi della valle, ognuno alla sua quota, e quanta pioggia è già caduta...»
  - dopo: «Che tempo farà nel Casentino nei prossimi 7 giorni a Bibbiena, Poppi,
    Pratovecchio Stia, Chiusi della Verna e negli altri 8 paesi della valle, ognuno alla
    sua quota, e quanta pioggia è già caduta...»
  - la tabella «Paese per paese» con le righe cotte (nome e quota, numeri riempiti dal
    browser), come fanno gia' le zone piogge con i pluviometri.
- Nei 20 paesi meteo i nomi dei paesi intorno stanno solo nella description: metterli
  anche nel sottotitolo (`genera-pagine-meteo-paese.js`).

**3. Titoli e descrizioni delle zone meteo troppo lunghi.**
- meteo-zona 51: title 78-102 caratteri, stima 700-905 px (Google taglia a ~580 px).
  Description 206-243 caratteri. meteo-paese 20: description 233-291.
- La sessione locale li sta gia' accorciando. Proposta concreta, se serve:
  - zona, prima: «Previsioni meteo Casentino: che tempo farà nei prossimi 7 giorni, paese
    per paese» (83). Dopo: «Meteo Casentino: previsioni a 7 giorni, paese per paese»
    (55). Comincia con la ricerca vera, «meteo casentino», e ha la stessa forma dei
    paesi meteo.
  - description zona, dopo (151): «Previsioni meteo Casentino a 7 giorni, ora per ora:
    Bibbiena, Poppi, Pratovecchio Stia e altri 9 paesi, ognuno alla sua quota. E la
    pioggia già caduta.»
  - description paese: tenere i primi 155 caratteri, togliere la coda sull'ente.
- Dove: `TITOLO` e `DESCR` in `genera-pagine-meteo-zona.js` (righe ~972-973) e
  `genera-pagine-meteo-paese.js` (righe ~65-66).

**4. Le zone piogge non hanno i millimetri nell'HTML.**
- Famiglia: zona-piogge, 114 pagine. Rispondono a «dove ha piovuto ieri in <zona>», ma
  nell'HTML c'e' «Sto leggendo i pluviometri…» e la tabella e' «– – –»: i numeri li mette
  il browser. Le regioni piogge invece li hanno cotti dal 12/10 (giro del mattino,
  `SOLO=cotte`), e il commento del generatore dice che e' quello che Google legge.
- `data/riepiloghi/zone/<zona>.json` esiste gia' ogni mattina.
- Proposta: nella frase sotto l'H1, «Ieri, 30 ottobre: 0,8 mm di media, il massimo 2,4 mm a
  Badia Prataglia. Negli ultimi 7 giorni 6,4 mm.» e i valori nella tabella, scritti dal
  generatore; nella description il dato di ieri come nelle regioni.
- Costo onesto: vuol dire riscrivere 114 pagine nel giro del mattino (pubblicare su
  Cloudflare e' gratis). Si puo' partire dalle zone delle regioni gia' «cotte»
  (`COTTE` in `genera-pagine-regione.js`), con la stessa regola.

### MEDIA

**5. 108 paesi funghi hanno nel titolo il nome tecnico del pluviometro.**
- Famiglia: paese-funghi (`problemi.csv`, «nome-pluviometro-nel-title»). Esempi:
  - «Funghi a Rio Rudan INADEF DX briglia oggi: stanno nascendo?»
  - «Funghi a Dossena ST1 oggi», «Funghi a Bagolino SP669 oggi», «Funghi ad Agerola
    METEO oggi», «Funghi a Ferriere Pluvio oggi», «Funghi a Pioraco 2 oggi»,
    «Funghi a Canneto 9 oggi», «Funghi a T. Atella - P.te SS381 oggi».
  - Veneto e Trentino mettono il comune fra parentesi in fondo: «Funghi a Staro (Valli
    del Pasubio) oggi». La gente cerca «funghi valli del pasubio», e il comune finisce
    oltre il 30° carattere.
- Proposta: una tabella di nomi per il titolo, come `nomi` di `METEO_PAESI`
  («Mottarone - Baita Cai» → «Mottarone»). Titolo, H1 e og:title la usano; il nome del
  pluviometro resta nel testo e nella tabella. Esempi del dopo:
  - «Funghi a Dossena oggi: stanno nascendo?»
  - «Funghi a Valli del Pasubio (Staro) oggi: stanno nascendo?»
  - «Funghi a Ferriere oggi: stanno nascendo?»
- Insieme, 9 preposizioni sbagliate: «Funghi a Val Clarea», «a Val Ugovizza», «a Valle
  del Rio» → «in Val Clarea», «in Valle del Rio». Si sistemano in `aPosto()`.
- Dove: `genera-pagine-localita.js`, `TITOLO` (riga ~259) e `DOVE = aPosto(nomePosto)`.

**6. Il rischio di pestarsi i piedi fra «meteo funghi» e «meteo».**
- Le 1.041 pagine funghi (908 paesi, 114 zone, 19 regioni) cominciano la description con
  «Meteo funghi <posto>», e la sessione locale porta lo stesso in testa ai titoli. Per i 20
  paesi e le 51 zone che hanno anche la pagina meteo, «Meteo funghi Sassello oggi» e
  «Meteo Sassello: previsioni...» hanno le stesse prime parole.
- Non e' un errore ancora: dico di guardarci in Search Console dopo il cambio. Per la
  ricerca «meteo sassello» la pagina che deve uscire e' `/meteo/liguria/sassello/`; se
  esce la pagina funghi, nei soli 71 posti doppi si tiene il titolo funghi senza «meteo»
  («Funghi a Sassello oggi: stanno nascendo?»), che e' la forma di oggi.
- Stesso discorso, piu' piccolo, per due nomi che sono sia paese sia zona funghi:
  «Funghi all'Alpe di Poti oggi» (paese) e «Funghi sull'Alpe di Poti oggi» (zona), e
  «Funghi a Val Clarea» / «Funghi in Val Clarea». Due titoli quasi uguali, due indirizzi.

**7. Le pagine «adesso»: «radar» arriva dopo 40 caratteri.**
- 21 pagine. Prima: «Dove sta piovendo adesso in Toscana: radar pioggia in diretta» (60).
  La ricerca «radar meteo toscana» sta in posizione 9-21 senza clic.
- Dopo (la sessione locale va gia' in questa direzione): «Radar meteo Toscana: dove sta
  piovendo adesso» (45). H1 uguale. In 6 regioni il titolo e' gia' stato accorciato a
  «radar in diretta» per stare nei 62 caratteri: con la forma nuova non serve.
- Testo da modello: 84% di mediana, il piu' alto del sito. Le parti uniche sono l'elenco
  delle citta' e delle valli. Va bene cosi', ma non aggiungerei altro testo uguale.
- Dove: `genera-pagine-adesso.js`.

**8. Regioni piogge, «adesso» e indice funghi senza briciole.**
- 45 pagine senza nessun JSON-LD (23 regioni, 21 «adesso», `/funghi/`) e senza
  briciole visibili. Tutte le altre famiglie hanno il `BreadcrumbList`, e corretto.
- Proposta: «Mappa pluviometrica › Toscana» sulle regioni, «Mappa pluviometrica ›
  Toscana › Radar adesso» sulle «adesso», «Mappa pluviometrica › Piogge per funghi» sul
  `/funghi/`. Le zone piogge linkano gia' `/toscana/` come genitore.
- Dove: `genera-pagine-regione.js`, `genera-pagine-adesso.js`, `genera-indice-funghi.js`.

### BASSA

**9. `lastmod` indietro.** Il 31/10 sono cambiati i gusci di 114 zone piogge (avviso delle
stime), 19 regioni funghi (descrizione «Meteo funghi») e 21 «adesso», ma
`pagine-lastmod.json` dice ancora 28/10 e 30/10. E `/` e' fermo al `2026-08-14`
scritto a mano in `genera-sitemap.js`, mentre `index.html` cambia spesso (il 31/10 il
blocco `WebSite`). Si sposta la data a mano quando si tocca un modello, come dice gia' il
file.

**10. Le zone meteo C sono gia' online.** `CLAUDE.md` dice che il gruppo C (20 zone) «si
pubblica dopo la lettura» dei numeri di A e B (~3-4/11). Ma `sitemap-meteo-c.xml` e'
gia' nell'indice, le 20 pagine ci sono e le «adesso» le linkano (es. `/meteo/carnia/`).
Se era voluto, va bene; se no, la misura di A e B ora si mescola con C.

**11. Anteprima social uguale per 1.250 pagine.** Tutte le famiglie tranne la mappa
forestale usano `preview.jpg` (la pioggia d'Italia), anche le meteo. Mancano anche
`og:site_name`, `twitter:card` e `og:image:width/height` fuori dalla home. Non pesa sul
posizionamento, solo sull'anteprima condivisa.

**12. Piccole cose di parole.**
- `/emilia/`: titolo 64 caratteri, ~587 px, tagliato di poco.
- `/friuli/`: titolo «Pluviometria Friuli», H1 «Friuli» ma le «adesso» dicono «Friuli
  Venezia Giulia»: come la gente cerca e' tutt'e due, va bene, ma conviene scegliere.
- Home: l'H1 finisce con «(v11.0)». Il numero di versione nell'intestazione principale
  non serve a chi cerca (la sessione locale cambia gia' la home).
- 15 paesi funghi perdono «stanno nascendo?» perche' il nome e' lungo: e' la regola dei
  62 caratteri, giusto cosi'.
- Valle Sabbia e' l'unica zona senza la pagina della mappa forestale (113 su 114).

**13. Peso.** Nelle meteo e nelle «adesso» `leaflet.js` (145 KB) e' caricato senza `defer`
a meta' del body: tutto il testo sotto aspetta il file. Le pagine sono 80-115 KB, di cui
30-68 KB di script in linea. Niente di grave per Google; `defer` non cambia niente di
cio' che si legge.

---

## I risultati per famiglia

Numeri da `pagine.csv` (mediane). «Da modello» = quota delle frasi di 6 parole che
compaiono in almeno meta' delle pagine della famiglia, numeri esclusi (`simili.py`).

| famiglia | pagine | title car | desc car | parole | da modello | link in entrata | profondita' |
|---|---|---|---|---|---|---|---|
| mappa `/` | 1 | 65 | 153 | 368 (165 al telefono) | — | 1.411 | 0 |
| regione | 23 | 62 | 135 | 659 | 66% | 57 (min 22) | 2 |
| adesso | 21 | 60 | 145 | 535 | 84% | 21 | ≤4 |
| funghi indice | 1 | 57 | 147 | 1.027 | — | 1.094 | 1 |
| funghi regione | 19 | 46 | 148 | 685 | 65% | 88 (min 51) | 1 |
| paese funghi | 908 | 44 | 150 | 593 | 70% | 8 (min 1) | 2 |
| zona funghi | 114 | 45 | 128 | 580 | 66% | 17 (min 8) | 2 |
| zona piogge | 114 | 58 | 136 | 430 | 60% | 16 (min 7) | ≤3 |
| meteo zona | 51 | 83 | 219 | 336 | 78% | 3 | ≤3 |
| meteo paese | 20 | 51 | 252 | 328 | 73% | 2 | ≤3 |
| forestale indice | 1 | 64 | 156 | 1.137 | — | 138 | 2 |
| forestale regione | 21 | 58 | 118 | 711 | 60% | 27 | ≤3 |
| forestale tipo | 3 | 59 | 153 | 1.180 | 45% | 108 | 2 |
| forestale zona | 113 | 48 | 103 | 604 | 54% | 10 (min 2) | ≤4 |
| guida, fonti | 2 | — | — | ~4.000 | — | ~1.400 | 1 |

**Mappa `/`.** Testo statico poco (368 parole, 165 al telefono): e' un'applicazione, va
bene. Linka nell'HTML solo `/funghi/`, le 19 regioni funghi, guida e fonti: le 23 regioni
piogge stanno a 2 clic. E' una scelta misurata e scritta (commento in `index.html`, 8/9),
quindi non la propongo come errore. Ricordo solo che «pluviometria toscana» e' la
ricerca piu' grande e la sua pagina non riceve link dalla pagina piu' forte.

**Regioni piogge.** Titoli coerenti con le scelte del 12/10 (20 «mappa di N pluviometri»,
3 di confronto con «dove ha piovuto ieri»: Lazio, Liguria, Umbria). H1 allineato al titolo
(scelta del 26/10). Numeri cotti nelle regioni `COTTE`. Manca il link alle pagine meteo
(proposta 1) e le briciole (proposta 8).

**Adesso.** Linkate dalla loro regione (20 su 21: l'Abruzzo la pagina regione non ce l'ha) e fra loro; linkano gia' le pagine meteo
della regione (`linkMeteoRegione`). Unico punto: «radar» in coda al titolo (proposta 7).

**Funghi.** Nessun titolo o descrizione doppio su 1.042 pagine. Ogni paese e' linkato
dalla sua regione funghi (908/908), 585 anche da una zona funghi e da una zona piogge; 25
paesi hanno solo 1-2 link (Rocca di Papa, Argentario, Monte Perone, Podestagno...): sono
quelli che non sono «vicino» di nessuno e non stanno in una zona. Il problema vero e' il
nome del pluviometro nel titolo (proposta 5).

**Zone piogge.** Titoli giusti per la domanda («Dove ha piovuto nel Casentino: ieri e negli
ultimi giorni»; 7 accorciati per lunghezza). Tabella dei pluviometri con link cotti. Manca
il numero di ieri nell'HTML (proposta 4).

**Meteo.** E' la famiglia con piu' lavoro: titoli e descrizioni troppo lunghi, testo
statico corto e quasi tutto uguale, nomi dei paesi solo dal JavaScript, nessun link in
uscita verso altre pagine e 2-3 in entrata (proposte 1, 2, 3). Briciole e canonical a
posto.

**Mappa forestale.** La famiglia piu' in ordine: anteprima dedicata (`scorcio.jpg`
1200x750) su tutte e 138, testo meno ripetuto (54-60%), briciole giuste. Le zone hanno da
2 a 10 link in entrata (5 zone del sud con 2: Nebrodi, Sila Greca, Serre Calabresi, Monte di
Mezzo, Valle del Fitalia). La sessione locale cambia i titoli in «Carta forestale».

**Stesso luogo, famiglie diverse.** 131 nomi hanno piu' pagine (`doppioni.csv`, righe
«stesso-luogo»). I titoli rispondono a domande diverse e cominciano con parole diverse:
«Dove ha piovuto», «Funghi ... oggi», «Previsioni meteo», «Mappa forestale». Oggi non si
rubano la ricerca; l'unico rischio e' quello della proposta 6.

---

## Cosa e' gia' a posto

- **Canonical:** 1.412 su 1.412 assoluti, https, con la barra finale, puntano a se
  stessi (`/fonti` senza barra, giusto: Pages rimanda il `.html`). `og:url` uguale.
- **Nessun `noindex`**, `lang="it"` dappertutto, `robots.txt` pulito con la sitemap.
- **Sitemap:** ogni pagina e' in una sitemap, nessun indirizzo della sitemap senza file,
  `/previsioni/` dichiarata e servita dalla Function. `sitemap-paesi-prova.xml` fuori
  dall'indice, come voluto.
- **Nessun title o description doppio esatto** su 1.412 pagine.
- **Un solo H1** su ogni pagina, sempre allineato al titolo.
- **JSON-LD:** tutto leggibile, nessun errore; `BreadcrumbList` con posizioni giuste e
  indirizzi esistenti; `WebSite` sulla home col nome del sito.
- **Zero link interni rotti.** I rimandi di `_redirects` (paesi doppi) sono rispettati
  anche nei link.
- **Profondita':** nessuna pagina oltre 4 clic dalla home, nessuna orfana.
- **Immagini:** tutte con `alt`; mancano larghezza e altezza solo all'avatar di Archie
  nella home (3 volte) e a un'icona `data:`.
- **Parole cercate in testa:** «Funghi <posto> oggi», «Dove ha piovuto <zona>»,
  «Pluviometria <regione>» stanno nei primi 30 caratteri. Restano indietro solo «radar»
  nelle «adesso» e il titolo lungo delle zone meteo.
- **Niente cose superate:** nessuna meta keywords. La FAQ in JSON-LD c'e' solo nella guida
  (`FAQPage`): non da' piu' risultati arricchiti a un sito come questo, ma non fa danno.

## I file

- `pagine.csv`: una riga per pagina (url, famiglia, title e lunghezza in caratteri e
  pixel stimati, description, h1, parole statiche e al telefono, link in entrata,
  profondita', sitemap, lastmod, canonical, peso).
- `doppioni.csv`: doppioni esatti (nessuno) e i 131 luoghi con piu' famiglie.
- `link-interni.csv`: link in entrata per pagina, da quali famiglie, ancore piu' usate.
- `problemi.csv`: un problema per riga (508 righe), il tipo nella terza colonna.
- `analizza.py`, `simili.py`, `extra.py`: gli script.
- `simili.json`: la quota di testo da modello per famiglia.

Limiti: la stima dei pixel e' una tabella di larghezze Arial 20 px, buona entro ±5%. Il
testo «nascosto al telefono» lo stimo dalle regole `display:none` semplici dentro
`@media (max-width)`: le regole composte non le vedo, quindi la colonna «parole al
telefono» puo' contare qualche parola di troppo. La data dell'ultima modifica dei file
non si legge dalla storia di git (la copia della sessione parte dal 31/10): ho usato i
commit del giorno.
