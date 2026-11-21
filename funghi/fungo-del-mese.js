/* Il fungo del mese (21/11/2026, scheda 141). Una o più specie per mese.
   Una sezione uguale in TUTTE le pagine funghi (zona, paese, /funghi/): la specie del mese, una descrizione riassunta
   da Wikipedia e i video del canale su quella specie, più un richiamo in cima alla pagina che porta giù alla sezione.
   I video NON sono legati ai posti: chi legge in Sardegna vede gli stessi video di chi legge in Piemonte, anche se da
   lui quel fungo non c'è (scelta sua). Mai video diversi per zona: farebbero capire dove raccoglie.
   ⚠️ Nella descrizione NIENTE zone vocate (suo, 21/11/2026), anche se Wikipedia le elenca.
   Il mese è quello di CHI LEGGE: un mese senza voce qui sotto = niente sezione e niente richiamo. Per aggiungere un
   mese basta una voce qui, alzare ?v= in .github/scripts/lib-fungo-mese.js e rifare le pagine.
   Il testo arriva col JavaScript apposta: lo stesso testo scritto in 1.100 pagine sarebbe un doppione per Google.
   Copertine: quelle di YouTube (i.ytimg.com), nessuna chiamata alle fonti dei dati.
   Per vedere un altro mese: ?fungomese=11 */
(function () {
  // Ogni mese: una o più specie. Con due specie il titolo va al plurale («I funghi del mese»), ognuna ha il suo
  // sottotitolo, copertina e descrizione; i video stanno tutti insieme sotto (scelta sua, 21/11/2026: dicembre col
  // tartufo bianco e il nero pregiato, due video per uno).
  // ⚠️ descrizioni dalla voce di Wikipedia, coi termini della micologia (peridio, gleba, ipogeo…): lui vuole un testo
  // scientifico, non parole a orecchio. Niente misure e niente zone vocate (suo, 21/11/2026)
  var BIANCO = { nome: 'tartufo bianco', lat: 'Tuber magnatum', aut: 'Pico', foto: 'chKmM1sLzhs',
      testo: '<p>Fungo ipogeo e micorrizico, della famiglia delle Tuberaceae. Il corpo fruttifero si '
        + 'sviluppa interrato, da pochi centimetri fino a oltre un metro di profondità, in simbiosi con latifoglie '
        + 'quali pioppo, tiglio, querce (cerro, rovere, roverella), salice, nocciolo e carpino. Predilige terreni '
        + 'argillosi e marnoso-calcarei, spesso lungo i corsi d’acqua; matura da fine estate all’inverno.</p>'
        + '<p>Il peridio è liscio, di colore giallo ocra o giallo-oliva, talvolta grigio-verdastro. La gleba è bianca e '
        + 'marmorizzata; con la maturazione si macchia di rossastro. L’odore è intenso e caratteristico. '
        + 'Le spore sono ovoidali e reticolate, gialle in massa.</p>'
        + '<p>Commestibile, è tra i funghi più pregiati; si consuma crudo, affettato sottilmente. La ricerca si fa '
        + 'con il cane, nei periodi fissati dai calendari regionali.</p>' };
  var NERO = { nome: 'tartufo nero pregiato', lat: 'Tuber melanosporum', aut: 'Vittad.', foto: 'VsFqrrwGcpw',
      testo: '<p>Fungo ipogeo e micorrizico, della famiglia delle Tuberaceae. Vive in simbiosi soprattutto con '
        + 'roverella e leccio, ma anche con carpino nero e nocciolo; predilige terreni sedimentari ben drenati, '
        + 'brecciosi e molto calcarei. Inizia a svilupparsi a settembre e matura in pieno inverno, da dicembre '
        + 'all’inizio di marzo.</p>'
        + '<p>Il peridio è nero, talvolta con sfumature ferruginose, coperto di verruche piramidali con l’apice '
        + 'depresso. La gleba è nero-bruna con riflessi violacei o '
        + 'rossicci, attraversata da venature biancastre fitte e sottili. Le spore sono nere in massa e spinulate.</p>'
        + '<p>Commestibile, ritenuto di qualità ottima. La ricerca si fa con il cane, nei periodi fissati dai '
        + 'calendari regionali.</p>' };
  function con(o, x) { var r = {}, k; for (k in o) r[k] = o[k]; for (k in x) r[k] = x[k]; return r; }
  var MESI = {
    11: { quando: 'novembre', specie: [BIANCO], cerca: 'tartufo bianco',
      video: [
        ['Amc9fHriz9g', 'Tartufo bianco 2026, aggiornamento di novembre'],
        ['bq8tyRNS6JI', 'Tartufo bianco 2026, aggiornamento di fine ottobre'],
        ['m84Y1jb-r80', 'Tartufo bianco 2026: la pioggia copre l’odore?'],
        ['mN2aw83PHwE', 'Apertura tartufo bianco 2026: illusione e realtà']
      ] },
    // dicembre (suo, 21/11/2026): PRIMA il nero pregiato, POI il bianco, in testi, descrizioni e video; nero = i due link suoi; bianco = i due video sul bianco con più visualizzazioni
    // (al 21/11: 97.045 e 19.119). La copertina del bianco qui è un'altra, per non ripetere un video della fila sotto.
    // ⚠️ copertine: MAI una con scritto un altro mese («Tartufi a gennaio» a dicembre: suo «che cazzo la metti?»).
    // Il nero a dicembre: fotogramma a 3/4 dello short «fa troppo freddo» (i tartufi sul telo), ritagliato al centro
    // con `fondo` (scelta sua, versione B, 21/11/2026)
    12: { quando: 'dicembre', specie: [con(NERO, { foto: 'VsFqrrwGcpw', fondo: 'url(https://i.ytimg.com/vi/VsFqrrwGcpw/maxres3.jpg) 50% 72%/316% auto' }), con(BIANCO, { foto: 'Amc9fHriz9g' })], cerca: 'tartufo',
      video: [
        ['B8LSnSkYLfA', 'Tartufo nero a Milano: è possibile?'],
        ['VsFqrrwGcpw', 'Tartufo nero pregiato 2026: fa troppo freddo'],
        ['chKmM1sLzhs', 'Tartufo bianco 2026, 2 giorni a caccia con Archie'],
        ['mN2aw83PHwE', 'Apertura tartufo bianco 2026: illusione e realtà']
      ] }
  };
  var q = /[?&]fungomese=(\d+)/.exec(location.search);
  var f = MESI[q ? +q[1] : new Date().getMonth() + 1]; if (!f) return;
  var giu = document.getElementById('fungo-mese'), su = document.getElementById('fungo-mese-su');
  if (!giu) return;
  var piu = f.specie.length > 1;
  var maiu = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); };
  var elenca = function (a) { return a.length > 1 ? a.slice(0, -1).join(', ') + ' e ' + a[a.length - 1] : a[0]; };
  var yt = function (id, q) { return 'https://i.ytimg.com/vi/' + id + '/' + (q || 'mqdefault') + '.jpg'; };
  var clic = function (p) { return 'onclick="try{gtag(\'event\',\'click_youtube\',{pulsante:\'' + p + '\'})}catch(e){}"'; };
  var css = '.fdm-inv{font-size:16px;margin-top:10px;line-height:1.5}.fdm-inv a{color:#fff;font-weight:700;text-decoration:underline}'
    + '.fdm-su{margin:12px 0 4px;font-size:16px;line-height:1.5}.fdm-su a{color:var(--blu,#1b3f6e);font-weight:700}'
    + '.fdm-et{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;background:var(--verde,#2e7d32);color:#fff;border-radius:4px;padding:2px 7px;margin-right:8px;vertical-align:2px}'
    + '.fdm{margin-top:36px;scroll-margin-top:12px}'
    // il titolo: GRANDE, sul carattere della pagina, con una fascia di colore sotto (lui, 21/11/2026: «è un titolo,
    // scrivilo grande»; il serif NO, «quel carattere lo odio»). Verde come l etichetta «Fungo del mese» (lui: «non blu come i bottoni, fai verde»)
    + '.fdm-testa{text-align:center;margin:0 0 20px;padding:10px 16px 12px;border-radius:12px;background:linear-gradient(#43a047,#2e7d32 55%,#256b29);box-shadow:0 5px 0 #1b5e20,0 8px 14px rgba(0,0,0,.25);color:#fff}'
    + '.fdm-mese{font-size:14px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#d7efd8}'
    + '.fdm h2{font-size:40px;font-weight:900;line-height:1;margin:4px 0 0;color:#fff;text-transform:uppercase;white-space:nowrap;letter-spacing:.01em;text-shadow:0 1px 0 #1b5e20,0 2px 0 #1b5e20,0 3px 0 #174f1b,0 4px 0 #134517,0 6px 8px rgba(0,0,0,.35)}'
    + '.fdm-prem{font-size:18px;line-height:1.5;margin:0 0 14px}'
    + '.fdm-desc{overflow:hidden}'
    + '.fdm-foto{float:left;width:300px;aspect-ratio:16/9;height:auto;object-fit:cover;border-radius:10px;margin:4px 18px 10px 0;display:block}'
    + '.fdm-desc p{margin:0 0 10px;font-size:16px;line-height:1.6}'
    + '.fdm h3{color:var(--blu-scuro,#123252);font-size:18px;margin:18px 0 10px}'
    + '.fdm h3.fdm-sp{font-size:22px;margin:22px 0 10px;padding-bottom:6px;border-bottom:2px solid var(--bordo,#d0d8e8)}.fdm h3.fdm-sp i{font-weight:400;color:#555;font-size:17px}'
    + '.fdm-vid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}'
    + '.fdm-vid a{display:block;text-decoration:none;color:#222}'
    + '.fdm-pre{position:relative;aspect-ratio:16/9;border-radius:8px;overflow:hidden;background:#ddd}'
    + '.fdm-pre img{width:100%;height:100%;object-fit:cover;display:block}'
    + '.fdm-pre:after{content:"";position:absolute;left:50%;top:50%;width:46px;height:32px;margin:-16px 0 0 -23px;border-radius:9px;background:rgba(220,0,0,.88)}'
    + '.fdm-pre:before{content:"";position:absolute;left:50%;top:50%;margin:-7px 0 0 -4px;border-left:13px solid #fff;border-top:7px solid transparent;border-bottom:7px solid transparent;z-index:1}'
    + '.fdm-vid span{display:block;font-size:14px;line-height:1.35;margin-top:6px;font-weight:600}'
    + '.fdm-tutti{display:inline-block;margin-top:14px;font-size:15px;font-weight:700;color:var(--blu,#1b3f6e)}'
    + '.fdm-fonte{font-size:13px;color:#777;margin-top:10px}.fdm-fonte a{color:#777}'
    + '@media(max-width:600px){.fdm-foto{float:none;width:100%;margin:0 0 12px}}'
    + '@media(max-width:483px){.fdm-mese{font-size:12px}.fdm-prem{font-size:17px}'
    + '.fdm-vid{grid-template-columns:1fr 1fr;gap:10px}.fdm-vid span{font-size:13px}}';
  // il richiamo: d'inverno dentro il riquadro della pausa, prima di «Da marzo…» (suo, 21/11/2026); in stagione una riga
  // sotto la riga di stagione
  var inv = document.documentElement.classList.contains('funghi-inverno') && document.getElementById('fungo-mese-inv');
  var giuLink = elenca(f.specie.map(function (s) { return 'il <a href="#fungo-del-mese">' + s.nome + ' (<i>' + s.lat + '</i>)</a>'; }));
  var frase = piu ? 'I funghi del mese sono ' : 'Il fungo del mese è ';
  if (inv) inv.innerHTML = '<div class="fdm-inv">' + frase + giuLink + '.</div>';
  // in stagione: etichetta verde «Fungo del mese» + link (versione D scelta da lui il 21/11/2026, niente 🍄)
  else if (su) su.innerHTML = '<div class="fdm-su"><span class="fdm-et">' + (piu ? 'Funghi del mese' : 'Fungo del mese') + '</span>' + giuLink.replace(/^il /, '') + '</div>';
  var v = f.video.map(function (x) {
    return '<a href="https://youtu.be/' + x[0] + '" target="_blank" rel="noopener" ' + clic('fungo-mese') + '><div class="fdm-pre">'
      + '<img src="' + yt(x[0]) + '" alt="" loading="lazy" width="320" height="180"></div><span>' + x[1] + '</span></a>';
  }).join('');
  var nomi = elenca(f.specie.map(function (s) { return 'il <b>' + s.nome + '</b> (<i>' + s.lat + '</i> ' + s.aut + ')'; }));
  var schede = f.specie.map(function (s) {
    return (piu ? '<h3 class="fdm-sp">' + maiu(s.nome) + ' <i>' + s.lat + '</i></h3>' : '')
      + '<div class="fdm-desc"><a href="https://youtu.be/' + s.foto + '" target="_blank" rel="noopener" ' + clic('fungo-mese-copertina') + '>'
      + (s.fondo
        // un fotogramma di uno short (verticale, con le bande nere dentro l'immagine): si ritaglia il centro come sfondo
        ? '<span class="fdm-foto" role="img" aria-label="' + maiu(s.nome) + '" style="background:#333 ' + s.fondo + '"></span></a>'
        : '<img class="fdm-foto" src="' + yt(s.foto, s.fotoQ || 'hqdefault') + '" alt="' + maiu(s.nome) + '" width="480" height="270" loading="lazy"></a>')
      + s.testo + '</div>';
  }).join('');
  var sul = elenca(f.specie.map(function (s) { return s.nome; })).replace(' e ', ' e sul ');
  giu.innerHTML = '<style>' + css + '</style>'
    + '<section class="fdm" id="fungo-del-mese"><div class="fdm-testa"><div class="fdm-mese">' + f.quando + '</div><h2>'
    + (piu ? 'I funghi del mese' : 'Il fungo del mese') + '</h2></div>'
    + '<p class="fdm-prem">Sul territorio italiano ' + (piu ? 'i funghi di ' + f.quando + ' sono ' : 'il fungo di ' + f.quando + ' è ') + nomi + '.</p>'
    + schede
    + '<h3>I miei video sul ' + sul + '</h3><div class="fdm-vid">' + v + '</div>'
    + '<a class="fdm-tutti" href="https://www.youtube.com/@avventuremicologiche/search?query=' + encodeURIComponent(f.cerca)
    + '" target="_blank" rel="noopener" ' + clic('fungo-mese') + '>Tutti i video sul ' + (piu ? 'tartufo' : f.specie[0].nome) + ' →</a></section>';
  // ⚠️ niente riga «Descrizione riassunta da Wikipedia» sotto la sezione: tolta su sua richiesta (21/11/2026)
  // il titolo MAIUSCOLO che riempie tutta la fascia (lui: «scrivi maiuscolo, riempi gli spazi»): si misura e si
  // allarga il carattere finché la scritta occupa la larghezza della fascia, a ogni cambio di larghezza
  var h = giu.querySelector('.fdm h2');
  function riempi() {
    if (!h) return;
    var w = (h.parentNode.clientWidth - 32) * 0.55; if (w <= 0) return;   // «un po' meno», poi «più piccola tutta la fascia», «ancora più piccolo e fallo 3d»: 55%, fascia in rilievo come i bottoni
    h.style.fontSize = '100px';
    h.style.fontSize = Math.max(22, Math.min(110, Math.floor(100 * w / h.scrollWidth))) + 'px';
  }
  riempi(); addEventListener('resize', riempi);
})();
