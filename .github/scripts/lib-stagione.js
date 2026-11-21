/**
 * LA RIGA DI STAGIONE, in un posto solo (13/9/2026).
 *
 * PERCHE' ESISTE. I titoli delle pagine funghi di regione e di zona dicono
 * «Dove andare a funghi in Toscana oggi»: e' la ricerca in cui vogliamo
 * entrare, e il titolo sta fermo tutto l'anno. A gennaio pero' quella frase,
 * da sola, promette una cosa che non c'e'. Questa riga e' la TUTELA: la scrive
 * il browser guardando il SUO mese, quindi e' giusta ogni giorno dell'anno
 * senza rigenerare niente e senza deploy.
 *
 * ⚠️ Sta SUBITO SOTTO IL TITOLO. Prima era sulle sole pagine di regione, dopo
 * il riquadro del patto («A cosa serve» dal 22/9/2026), cioe' a mezza pagina: chi arrivava da
 * Google con «dove andare a funghi oggi» a gennaio leggeva prima tre riquadri.
 *
 * ⚠️ UN SOLO TESTO per regioni e zone: due copie della stessa frase divergono.
 * Il calendario e' quello di sempre: dicembre-febbraio fuori stagione,
 * novembre e marzo ai margini.
 *
 * ⚠️ Il testo esce dentro un <script> come stringa JSON: niente apostrofi dritti
 * da gestire a mano (quello tipografico si usa lo stesso, per l'occhio). Il
 * 2/9/2026 un apostrofo nudo in un template literal aveva rotto tutta la pagina.
 */

/* ⚠️ IL FREDDO CONTA QUANTO LA PIOGGIA (6/11/2026, scheda 125, suo «in questo periodo le piogge sono sempre meno
   importanti delle temperature» e poi «ok modifica tutto con A»). Da novembre la riga non e' piu' una sola per tutta
   Italia: al Nord e al Centro novembre e' ai margini e dicembre fuori stagione, al Sud e sulle isole novembre e' piena
   stagione e dicembre ai margini. Le pagine di paese e di zona hanno anche la riga del freddo nel riquadro della
   pioggia (JS_FREDDO qui sotto), e la loro riga di stagione lo dice: «le notti degli ultimi giorni sono qui sotto».
   Il freddo si mostra fino al FREDDO_FINO dicembre (suo: «fino a fine dicembre o poco prima»): DOPO va messa una
   «pausa» invernale della pagina, da decidere con lui. Marzo resta com'era.
   ⚠️ DAL 20/11/2026 (scheda 139, suo «anticipiamo dal 1 dicembre… vale anche per le pagine», poi «tutto dal 1/12»,
   Sud compreso) FREDDO_FINO e' 0: il freddo si vede solo a novembre, dal 1 dicembre c'e' la pausa (INVERNO qui sotto). */
const SUD = ['campania', 'puglia', 'basilicata', 'calabria', 'sicilia', 'sardegna'];
/* ⚠️ DAL 21/11/2026 (scheda 141, suo «spostiamo 1 il nord e al 10 il sud») FREDDO_FINO e' 9: al Sud la pausa parte
   il 10 dicembre (INIZIO_SUD) e fino al 9 il freddo resta. Al Nord non si vede lo stesso: freddoAttivo dice no quando
   c'e' gia' la classe funghi-inverno, che al Nord arriva il 1 dicembre. */
const FREDDO_FINO = 9;

/* ⚠️ LA PAUSA D'INVERNO (20/11/2026, scheda 139). Sue scelte: «stagionale come le pagine… dal 1 dicembre», «tutto
   dal 1/12» (anche il Sud), e sul mockup `claudio\mockup-pausa-funghi-139\` «la A col formato del messaggio della B
   ma senza i bottoni», con le tabelle sugli ultimi 20 giorni e il grafico senza la fascia dei 13-20.
   Dal 1 dicembre a fine febbraio, col giorno di CHI LEGGE (niente da rigenerare il 1/12 ne' il 1/3):
   - in cima il messaggio «❄️ Stagione ferma fino a marzo» (schedaInverno) al posto della riga di stagione;
   - il riquadro della pioggia resta, senza giudizio: «Pioggia degli ultimi 20 giorni», niente pallino ne' scala;
   - sparisce quello che vale solo per la finestra dei 13-20 giorni: la pioggia che conta con le sue otto barre, «Com'e'
     caduta», il tasto «Range crescita funghi», la fascia e la sua legenda nel grafico (classe .solo-stagione);
   - le classifiche (vicini, posti piu' bagnati, zone, /funghi/) passano sugli ultimi 20 giorni (campi `venti` e
     `primi20` scritti da genera-funghi.js).
   La classe `funghi-inverno` su <html> la mette lo script di rigaStagione, subito sotto il titolo: tutto quello che
   viene dopo nasce gia' giusto. Il tasto della mappa segue lo stesso calendario (index.html, classe funghi-fermo).
   Per guardarla in un altro mese: ?inverno=1 (e ?inverno=0 per la pagina di stagione).
   ⚠️ IL SUD DAL 10 DICEMBRE (21/11/2026, scheda 141, suo «spostiamo 1 il nord e al 10 il sud»): le regioni di SUD e
   le pagine senza regione (parlano anche del Sud) entrano in pausa il 10 dicembre, le altre il 1. Fine per tutti il
   1 marzo. Il tasto della mappa, uno solo per tutta Italia, sparisce il 10 (index.html, funghi-fermo). */
const INIZIO_SUD = 10;
const INVERNO_SI = g => 'var q=/[?&]inverno=([01])/.exec(location.search),d=new Date(),m=d.getMonth()+1;'
  + 'if(q?q[1]==="1":((m===12&&d.getDate()>=' + g + ')||m<=2))document.documentElement.classList.add("funghi-inverno");';
const STILE_INVERNO = `<style>
html:not(.funghi-inverno) .solo-inverno{display:none !important}
html.funghi-inverno .solo-stagione,html.funghi-inverno #stagione{display:none !important}
html.funghi-inverno .gg .b i{background:var(--blu)}
.pausa-inv{background:#0f2d4d;color:#fff;border-radius:12px;padding:18px 18px 16px;margin:14px 0 8px}
.pausa-inv .si{font-size:25px;font-weight:800;line-height:1.2}
.pausa-inv .fiocco{font-size:26px;margin-right:8px;vertical-align:-2px}
.pausa-inv .dett{font-size:16px;opacity:.9;margin-top:8px;line-height:1.5}
.pausa-inv .torna{margin-top:12px;padding:9px 11px;border-radius:8px;background:rgba(255,255,255,.08);font-size:15px;line-height:1.45}
.verdetto .si.neutro{font-size:22px;font-weight:700;opacity:.9}
</style>`;
const SCHEDA_INVERNO = '<div class="pausa-inv solo-inverno">'
  // ⚠️ testo suo (21/11/2026, scheda 141): «chiusa la stagione dei funghi epigei», «resta aperta la stagione dei
  // tartufi secondo i calendari regionali». Si danno i dati, NON come usarli: niente frasi su cosa vuol dire la pioggia
  // per i tartufi (vedi la nota «niente pagine tartufi»: per loro la finestra dei 13-20 giorni non vale)
  + '<div class="si"><span class="fiocco">❄️</span>Chiusa la stagione dei funghi epigei</div>'
  + '<div class="dett">Resta aperta la stagione dei tartufi, secondo i calendari regionali. '
  + 'Qui sotto la pioggia vera dei pluviometri e il meteo restano aggiornati ogni giorno.</div>'
  + '<div class="torna">Da marzo la pagina riparte con la stagione dei <b>marzuoli e delle morchelle</b>.</div></div>';

const TESTI = {
  // ⚠️ niente «i millimetri sono veri» (1/11/2026): la riga sta sopra l'avviso delle stime, quando un pluviometro non ha
  // trasmesso, e le due frasi si contraddicevano
  fuori: '<b>Siamo fuori stagione.</b> Da dicembre a febbraio i funghi sono pochi quasi '
    + 'ovunque, e la finestra dei 13-20 giorni conta poco: per usarla davvero aspetta le '
    + 'piogge di fine estate.',
  margine: '<b>Siamo ai margini della stagione.</b> A quest’epoca la buttata dipende molto '
    + 'dalla quota e dal freddo: i millimetri qui sotto valgono meno che in autunno pieno.',
  // dal 6/11/2026 (scheda 125), i testi della tabella del mockup `claudio\mockup-funghi-freddo-125\`
  margineFreddo: '<b>Siamo ai margini della stagione: adesso conta il freddo quanto la pioggia.</b> Con le notti '
    + 'sotto zero i funghi si fermano, in collina e vicino al mare la stagione dura di più.',
  nottiSotto: ' Le notti degli ultimi giorni sono qui sotto.',
  pienaSud: '<b>Siamo in piena stagione.</b> Qui novembre è uno dei mesi migliori: conta la pioggia, ma guarda '
    + 'anche le notti, in montagna può già gelare.',
  fuoriNord: '<b>Siamo fuori stagione.</b> Da dicembre a febbraio al Nord e al Centro i funghi sono pochi: conta più '
    + 'il freddo della pioggia, e resistono solo dove le notti restano sopra zero, in basso e vicino al mare.',
  fuoriSud: '<b>Siamo fuori stagione.</b> Fino a marzo i funghi sono pochi, tranne dove le notti restano miti, '
    + 'vicino al mare.',
  // la pagina /funghi/ di tutta Italia: non sa di che regione e' chi legge
  italiaNov: '<b>Al Nord e al Centro siamo ai margini della stagione, al Sud e sulle isole in piena stagione.</b> '
    + 'Adesso conta il freddo quanto la pioggia: con le notti sotto zero i funghi si fermano.',
  italiaDic: '<b>Al Nord e al Centro siamo fuori stagione, al Sud e sulle isole ai margini.</b> Contano le notti: i '
    + 'funghi resistono dove restano sopra zero, in basso e vicino al mare.',
};

/* reg: la regione della pagina (senza: tutta Italia). conFreddo: la pagina ha la riga del freddo (paese e zona), e
   allora finche' la riga c'e' la frase rimanda li'. Il mese e il giorno sono quelli di CHI LEGGE: giusta ogni giorno
   senza rigenerare niente. */
/* ⚠️ LA FRASE DELLE NOTTI ESCE NASCOSTA (18/11/2026, check-139): la riga del freddo c'e' solo se il pluviometro ha il
   termometro (almeno 5 minime su 10 giorni, freddoFunghi). In 145 pagine di paese su 844 del Nord e del Centro non c'era,
   e la frase rimandava a una riga che non esiste. Ora sta in #stag-notti nascosto, e la mostra freddoFunghi quando mette
   la riga. */
function rigaStagione(reg, conFreddo) {
  const a = !reg ? 'italia' : SUD.includes(reg) ? 'sud' : 'nord';
  const S = conFreddo ? '<span id="stag-notti" style="display:none">' + TESTI.nottiSotto + '</span>' : '';
  const nov = a === 'sud' ? TESTI.pienaSud : a === 'nord' ? TESTI.margineFreddo + S : TESTI.italiaNov;
  const dic = a === 'sud' ? TESTI.margineFreddo : a === 'nord' ? TESTI.fuoriNord : TESTI.italiaDic;
  const dicS = a === 'sud' ? S : '';
  const inv = a === 'sud' ? TESTI.fuoriSud : a === 'nord' ? TESTI.fuoriNord : TESTI.fuori;
  // la pausa d'inverno PRIMA della riga: lo script mette la classe, poi stile e messaggio (vedi INVERNO qui sopra)
  return '<script>(function(){try{' + INVERNO_SI(a === 'nord' ? 1 : INIZIO_SUD) + '}catch(e){}})();</script>\n' + STILE_INVERNO + '\n' + SCHEDA_INVERNO + '\n'
    + '<div id="stagione"></div>\n<script>(function(){'
    + 'var d=new Date(),m=d.getMonth()+1,t=null;'
    + 'if(m===11)t=' + JSON.stringify(nov) + ';'
    + 'else if(m===12)t=' + JSON.stringify(dic) + (dicS ? '+(d.getDate()<=' + FREDDO_FINO + '?' + JSON.stringify(dicS) + ':"")' : '') + ';'
    + 'else if(m===1||m===2)t=' + JSON.stringify(inv) + ';'
    + 'else if(m===3)t=' + JSON.stringify(TESTI.margine) + ';'
    + 'if(t){var s=document.getElementById("stagione");s.innerHTML=t;s.style.display="block";}'
    + '})();</script>';
}

/* LA RIGA DEL FREDDO (6/11/2026, scheda 125, variante «A» scelta da lui sul mockup). Dal 1 novembre al FREDDO_FINO
   dicembre, nelle pagine funghi di PAESE e di ZONA: dentro il riquadro della pioggia, fra il dettaglio e la scala,
   «4 notti di gelo in 10 giorni» (o «Nessuna gelata in 10 giorni») con la notte piu' fredda e la data; e il blocco
   della temperatura sale subito sotto il riquadro. Sono DATI MISURATI, le minime che la pagina ha gia': nessun voto,
   nessuna previsione (impronta etica). Fuori da quei giorni non fa niente e la pagina resta com'era.
   ⚠️ JavaScript semplice (ES5): esce dentro le pagine col toString(), come JS_COMUNE. */
function freddo() {
  var FINO = 20;
  /* il periodo del freddo, uno solo per tutti i pezzi (anche la colonna della tabella delle regioni): dal 1 novembre al
     FINO dicembre, col giorno di CHI LEGGE (suo, 6/11/2026: «lo facciamo solo per 1/11-20/12»; d'inverno la stagione
     ferma, da marzo il contrario, da decidere). Dal 20/11/2026 FINO e' 0: solo novembre. Con ?inverno=1 (la pausa forzata
     per guardarla) il freddo non c'e', come a dicembre. */
  window.freddoAttivo = function () { var a = new Date(), m = a.getMonth() + 1;
    if (document.documentElement.classList.contains('funghi-inverno')) return false;
    return m === 11 || (m === 12 && a.getDate() <= FINO); };
  /* LE PROSSIME NOTTI (6/11/2026, scheda 125): dalla previsione che la pagina ha gia' scaricato per «Che tempo farà»
     (lib-meteo-regione.js la lascia in window._prevPagina e manda l'evento «previsioni-pagina»): nessuna chiamata in
     piu'. Nel paese il punto del pluviometro (qui:1), nella zona la minima fra i suoi paesi, notte per notte. giorni[0]
     e' oggi: le tre notti dopo, col nome del giorno della mattina. */
  function prossime(j, zona) {
    var c = (j && j.capoluoghi) || [];
    var pts = zona ? c : c.filter(function (x) { return x.qui; });
    if (!pts.length) pts = c.slice(0, 1);
    if (!pts.length) return '';
    var GS = ['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];
    var notti = [];
    for (var i = 1; i <= 3; i++) {
      var mn = null, gg = null;
      for (var k = 0; k < pts.length; k++) {
        var d = pts[k].giorni && pts[k].giorni[i];
        if (d && d.mn != null && (mn == null || d.mn < mn)) { mn = d.mn; gg = d.g; }
      }
      if (mn != null) notti.push({ mn: mn, g: gg });
    }
    if (notti.length < 2) return '';
    var mins = notti.map(function (x) { return x.mn; });
    var lo = Math.min.apply(null, mins), hi = Math.max.apply(null, mins);
    var f = function (n) { return String(Math.round(n)).replace('-', '−') + '°'; };
    var gel = notti.filter(function (x) { return x.mn <= 0; });
    var nomi = gel.map(function (x) { var q = String(x.g).split('-'); return GS[new Date(+q[0], +q[1] - 1, +q[2]).getDay()]; });
    var elenco = nomi.length === 1 ? nomi[0] : nomi.slice(0, -1).join(', ') + ' e ' + nomi[nomi.length - 1];
    return '<div class="dett prox">Prossime notti' + (zona ? ' nei paesi della zona' : '') + ': ' + (gel.length
      ? '<b class="g">gelo previsto ' + elenco + '</b>, fino a <b>' + f(lo) + '</b>.'
      : 'minime fra <b>' + f(lo) + '</b> e <b>' + f(hi) + '</b>, nessuna gelata prevista.') + '</div>';
  }
  window.freddoFunghi = function (sT, oggi, nota, zona) {
    if (!window.freddoAttivo() || !sT || !oggi) return;
    var MESI =['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
    var gelo = 0, piu = null, quando = 0, conDato = 0;
    for (var i = 1; i <= 10; i++) {
      var g = sT[i - 1];
      if (!g || g[0] == null) continue;
      conDato++;
      if (g[0] <= 0) gelo++;
      if (piu == null || g[0] < piu) { piu = g[0]; quando = i; }
    }
    if (conDato < 5) return;   /* troppi giorni senza termometro: meglio niente che una riga zoppa */
    var p = String(oggi).split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]);
    d.setDate(d.getDate() - quando);
    var gn = d.getDate(), il = (gn === 1 || gn === 8 || gn === 11) ? 'l’' : 'il ';
    var gradi = (Math.round(piu * 10 + 1e-9) / 10).toFixed(1).replace('.', ',').replace('-', '−');
    var titolo = gelo ? (gelo === 1 ? '1 notte di gelo' : gelo + ' notti di gelo') : 'Nessuna gelata';
    var riga = '<div class="freddo"><div class="ft"><span class="pallino" style="background:' + (gelo ? '#8fd0ff' : '#cfd8e3')
      + '"></span>' + titolo + ' in 10 giorni</div><div class="dett fd">La notte più fredda' + (nota ? ', ' + nota : '')
      + ': <b>' + gradi + '°</b> ' + il + gn + ' ' + MESI[d.getMonth()] + '.</div></div>';
    var v = document.querySelector('#verdetto .verdetto');
    if (v && !v.querySelector('.freddo')) {
      var dove = v.querySelector('.scala') || v.querySelector('.capo-btns');
      if (dove) dove.insertAdjacentHTML('beforebegin', riga); else v.insertAdjacentHTML('beforeend', riga);
    }
    /* la frase «le notti degli ultimi giorni sono qui sotto» della riga di stagione: solo adesso che la riga c'e' */
    var sn = document.getElementById('stag-notti');
    if (sn && v && v.querySelector('.freddo')) sn.style.display = '';
    var mt = document.getElementById('meteo'), vd = document.getElementById('verdetto');
    if (mt && vd && mt.innerHTML && vd.nextSibling !== mt) vd.parentNode.insertBefore(mt, vd.nextSibling);
    /* le prossime notti: subito se la previsione e' gia' arrivata, se no quando arriva */
    var metti = function (j) {
      var fr = document.querySelector('#verdetto .freddo');
      if (!fr || fr.querySelector('.prox')) return;
      var h = prossime(j, zona);
      if (h) fr.insertAdjacentHTML('beforeend', h);
    };
    if (window._prevPagina) metti(window._prevPagina);
    else document.addEventListener('previsioni-pagina', function (e) { metti(e.detail); });
  };
}
const JS_FREDDO = freddo.toString().replace(/^function freddo\(\)\s*\{/, '').replace(/\}\s*$/, '')
  .replace('var FINO = 20;', 'var FINO = ' + FREDDO_FINO + ';');   // un numero solo, FREDDO_FINO qui sopra

/* lo stile della riga del freddo e della linea dello zero nel grafico delle temperature: va in STILE_NUOVO
   (lib-pagina-funghi.js), che le pagine di paese prendono dalla pagina della regione */
const STILE_FREDDO = `
.verdetto .freddo{border-top:1px solid rgba(255,255,255,.18);margin-top:14px;padding-top:12px;}
.verdetto .freddo .ft{font-size:20px;font-weight:800;line-height:1.25;}
.verdetto .freddo .ft .pallino{width:12px;height:12px;margin-right:8px;vertical-align:1px;}
.verdetto .freddo .fd{margin-top:4px;}
.tt .zero{stroke:#3a6ea8;stroke-width:1.2;stroke-dasharray:3 3;vector-effect:non-scaling-stroke;opacity:.8;}
.tt-y span.z{font-weight:800;color:#3a6ea8;}
.gg-leg i.zero{background:none;border-top:2px dashed #3a6ea8;height:0;width:14px;vertical-align:3px;border-radius:0;}
.verdetto .freddo .prox{margin-top:8px;padding:8px 10px;border-radius:8px;background:rgba(255,255,255,.08);}
.verdetto .freddo .prox b.g{color:#8fd0ff;}
td.fr{text-align:right;white-space:nowrap;font-weight:700;color:#33415a;}
td.fr.gelo{color:#1f6fd1;}
td.fr small{display:block;font-weight:400;font-size:12px;color:#6b7a8d;line-height:1.2;}
.fr-m{display:none;}
@media(max-width:640px){th.fr,td.fr{display:none;} .fr-m{display:block;color:#42506a;} .fr-m.gelo{color:#1f6fd1;font-weight:600;}}
`;

module.exports = { rigaStagione, TESTI, SUD, FREDDO_FINO, INIZIO_SUD, JS_FREDDO, STILE_FREDDO };
