/* Il fungo del mese (21/11/2026, scheda 141).
   Una scheda uguale in TUTTE le pagine funghi (zona, paese, /funghi/): la specie del mese, due righe e i video del
   canale su quella specie. I video NON sono legati ai posti: chi legge in Sardegna vede gli stessi video di chi legge
   in Piemonte, anche se da lui quel fungo non c'è (scelta sua). Mai video diversi per zona: farebbero capire dove
   raccoglie.
   Il mese è quello di CHI LEGGE: un mese senza voce qui sotto = niente scheda. Per aggiungere un mese basta una voce
   qui e ripubblicare: le 1.100 pagine non si rifanno (hanno solo il segnaposto #fungo-mese e questo file).
   Il testo arriva col JavaScript apposta: lo stesso testo scritto in 1.100 pagine sarebbe un doppione per Google.
   Copertine: quelle di YouTube (i.ytimg.com, 320x180), nessuna chiamata alle fonti dei dati.
   Per vedere un altro mese: ?fungomese=11 */
(function () {
  var MESI = {
    11: {
      quando: 'novembre', nome: 'Tartufo bianco', lat: 'Tuber magnatum Pico', foto: 'chKmM1sLzhs',
      testo: '<p>È il più profumato dei tartufi e il più pregiato. Cresce sottoterra, legato alle radici di querce, '
        + 'pioppi, salici e tigli, in terreni freschi e soffici, spesso nei fondovalle vicino a fossi e torrenti. '
        + 'La scorza è liscia, color ocra chiaro; dentro è nocciola chiaro con venature bianche sottili.</p>'
        + '<p>Si cerca solo col cane. Si raccoglie in autunno e in inverno, nei periodi fissati dai calendari regionali.</p>',
      video: [
        ['Amc9fHriz9g', 'Tartufo bianco 2026, aggiornamento di novembre'],
        ['bq8tyRNS6JI', 'Tartufo bianco 2026, aggiornamento di fine ottobre'],
        ['m84Y1jb-r80', 'Tartufo bianco 2026: la pioggia copre l\'odore?'],
        ['mN2aw83PHwE', 'Apertura tartufo bianco 2026: illusione e realtà']
      ],
      tutti: 'tartufo bianco'
    }
  };
  var el = document.getElementById('fungo-mese'); if (!el) return;
  var q = /[?&]fungomese=(\d+)/.exec(location.search);
  var f = MESI[q ? +q[1] : new Date().getMonth() + 1]; if (!f) return;
  var yt = function (id) { return 'https://i.ytimg.com/vi/' + id + '/mqdefault.jpg'; };
  var clic = 'onclick="try{gtag(\'event\',\'click_youtube\',{pulsante:\'fungo-mese\'})}catch(e){}"';
  var css = '.fdm{margin:28px 0 8px;border:1px solid var(--bordo,#d0d8e8);border-radius:12px;overflow:hidden;background:#fff}'
    + '.fdm-testa{display:flex;gap:16px;align-items:center;padding:14px 18px;background:var(--grigio,#f0f4fb);border-bottom:1px solid var(--bordo,#d0d8e8)}'
    + '.fdm-foto{flex:0 0 176px;width:176px;height:99px;border-radius:8px;object-fit:cover;display:block}'
    + '.fdm-et{font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--verde,#2e7d32)}'
    + '.fdm h2{margin:2px 0 0;font-size:24px;line-height:1.2}'
    + '.fdm-lat{font-size:15px;color:#555;font-style:italic}'
    + '.fdm-corpo{padding:14px 18px 18px}'
    + '.fdm-corpo p{margin:0 0 10px;font-size:16px;line-height:1.55}'
    + '.fdm-vt{font-weight:700;color:var(--blu-scuro,#123252);margin:14px 0 10px;font-size:17px}'
    + '.fdm-vid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}'
    + '.fdm-vid a{display:block;text-decoration:none;color:#222}'
    + '.fdm-pre{position:relative;aspect-ratio:16/9;border-radius:8px;overflow:hidden;background:#ddd}'
    + '.fdm-pre img{width:100%;height:100%;object-fit:cover;display:block}'
    + '.fdm-pre:after{content:"";position:absolute;left:50%;top:50%;width:46px;height:32px;margin:-16px 0 0 -23px;border-radius:9px;background:rgba(220,0,0,.88)}'
    + '.fdm-pre:before{content:"";position:absolute;left:50%;top:50%;margin:-7px 0 0 -4px;border-left:13px solid #fff;border-top:7px solid transparent;border-bottom:7px solid transparent;z-index:1}'
    + '.fdm-vid span{display:block;font-size:14px;line-height:1.35;margin-top:6px;font-weight:600}'
    + '.fdm-tutti{display:inline-block;margin-top:14px;font-size:15px;font-weight:700;color:var(--blu,#1b3f6e)}'
    + '@media(max-width:483px){.fdm-testa{padding:12px 14px;gap:12px}.fdm-foto{flex-basis:120px;width:120px;height:68px}.fdm h2{font-size:20px}'
    + '.fdm-corpo{padding:12px 14px 16px}.fdm-vid{grid-template-columns:1fr 1fr;gap:10px}.fdm-vid span{font-size:13px}}';
  var v = f.video.map(function (x) {
    return '<a href="https://youtu.be/' + x[0] + '" target="_blank" rel="noopener" ' + clic + '><div class="fdm-pre">'
      + '<img src="' + yt(x[0]) + '" alt="" loading="lazy" width="320" height="180"></div><span>' + x[1] + '</span></a>';
  }).join('');
  el.innerHTML = '<style>' + css + '</style><section class="fdm"><div class="fdm-testa">'
    + '<img class="fdm-foto" src="' + yt(f.foto) + '" alt="' + f.nome + '" width="320" height="180">'
    + '<div><div class="fdm-et">Il fungo di ' + f.quando + '</div><h2>' + f.nome + '</h2><div class="fdm-lat">' + f.lat + '</div></div></div>'
    + '<div class="fdm-corpo">' + f.testo + '<div class="fdm-vt">I miei video sul ' + f.nome.toLowerCase() + '</div>'
    + '<div class="fdm-vid">' + v + '</div>'
    + '<a class="fdm-tutti" href="https://www.youtube.com/@avventuremicologiche/search?query=' + encodeURIComponent(f.tutti)
    + '" target="_blank" rel="noopener" ' + clic + '>Tutti i video sul ' + f.nome.toLowerCase() + ' →</a></div></section>';
})();
