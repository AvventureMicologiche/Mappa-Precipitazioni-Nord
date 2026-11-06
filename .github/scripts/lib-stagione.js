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
   «pausa» invernale della pagina, da decidere con lui. Marzo resta com'era. */
const SUD = ['campania', 'puglia', 'basilicata', 'calabria', 'sicilia', 'sardegna'];
const FREDDO_FINO = 20;

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
function rigaStagione(reg, conFreddo) {
  const a = !reg ? 'italia' : SUD.includes(reg) ? 'sud' : 'nord';
  const S = conFreddo ? TESTI.nottiSotto : '';
  const nov = a === 'sud' ? TESTI.pienaSud : a === 'nord' ? TESTI.margineFreddo + S : TESTI.italiaNov;
  const dic = a === 'sud' ? TESTI.margineFreddo : a === 'nord' ? TESTI.fuoriNord : TESTI.italiaDic;
  const dicS = a === 'sud' ? S : '';
  const inv = a === 'sud' ? TESTI.fuoriSud : a === 'nord' ? TESTI.fuoriNord : TESTI.fuori;
  return '<div id="stagione"></div>\n<script>(function(){'
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
  window.freddoFunghi = function (sT, oggi, nota) {
    var FINO = 20;
    var adesso = new Date(), mese = adesso.getMonth() + 1;
    if (!(mese === 11 || (mese === 12 && adesso.getDate() <= FINO)) || !sT || !oggi) return;
    var MESI = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
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
    var mt = document.getElementById('meteo'), vd = document.getElementById('verdetto');
    if (mt && vd && mt.innerHTML && vd.nextSibling !== mt) vd.parentNode.insertBefore(mt, vd.nextSibling);
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
`;

module.exports = { rigaStagione, TESTI, SUD, FREDDO_FINO, JS_FREDDO, STILE_FREDDO };
