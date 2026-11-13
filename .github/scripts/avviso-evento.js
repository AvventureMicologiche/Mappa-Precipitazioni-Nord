#!/usr/bin/env node
/**
 * avviso-evento.js — la mail quando una pagina regione entra in MODALITA' EVENTO (13/11/2026, scheda 132).
 *
 * PERCHE'. Suo, il 13/11, decidendo la modalita' evento: «per i prossimi eventi lo fa in automatico, ma mi avvisi in
 * modo che una volta pubblicato lo vado a vedere», poi «quando c'è un evento mi mandi mail col link». La pagina cambia
 * da sola (genera-riepiloghi.js decide se c'e' un evento, numeriRegione lo disegna): qui si manda UNA mail per evento,
 * con il link di ogni regione appena entrata e il giorno in cui torna normale.
 *
 * QUANDO. Lo lancia pagine-regione.yml DOPO la pubblicazione, cosi' il link porta gia' alla pagina nuova. Il registro
 * data/eventi-avvisati.json tiene { regione: primo giorno dell'evento }: la stessa tempesta non manda due mail anche se
 * dura piu' giorni o se il giro passa cinque volte; un evento nuovo (primo giorno diverso) si'. Le regioni tornate
 * normali escono dal registro.
 *
 * Scrive evento-mail.eml (stesso formato di check-fonti.js, la manda il workflow con curl) e mail=true/false in
 * GITHUB_OUTPUT. Non legge niente fuori dal repo. Senza GITHUB_OUTPUT stampa la mail e non tocca il registro.
 */
const fs = require('fs');
const path = require('path');
const { REGIONI, COTTE, SITO } = require('./genera-pagine-regione.js');

const RADICE = path.join(__dirname, '..', '..');
const REGISTRO = path.join(RADICE, 'data', 'eventi-avvisati.json');
const MAIL_FILE = path.join(RADICE, 'evento-mail.eml');
const MESI = ['gennaio','febbraio','marzo','aprile','maggio','giugno','luglio','agosto','settembre','ottobre','novembre','dicembre'];
const GIORNI = ['domenica','lunedì','martedì','mercoledì','giovedì','venerdì','sabato'];
const lungo = s => { const p = s.split('-'); return (+p[2]) + ' ' + MESI[+p[1] - 1]; };
const ap = s => [1, 8, 11].includes(+s.split('-')[2]);   // «l'11 novembre», «dall'8», «all'1»
const ilG = s => (ap(s) ? "l'" : 'il ') + lungo(s);
const dalAl = (a, b) => a === b ? ilG(a) : (ap(a) ? "dall'" : 'dal ') + (a.split('-')[1] === b.split('-')[1] ? +a.split('-')[2] : lungo(a)) + (ap(b) ? " all'" : ' al ') + lungo(b);
const dopo = (s, n) => new Date(Date.parse(s + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);
const giornoSett = s => GIORNI[new Date(s + 'T12:00:00Z').getUTCDay()];
const mm = v => { const t = (Math.round(v * 10) / 10).toFixed(1).replace('.', ','); return t.endsWith(',0') ? t.slice(0, -2) : t; };
const oggi = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome' }).format(new Date());

function output(k, v) { if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`); }
function encodeSubject(s) {
  if (/^[\x20-\x7E]*$/.test(s)) return s;
  const c = [...s], parti = [];
  for (let i = 0; i < c.length; i += 15) parti.push(`=?UTF-8?B?${Buffer.from(c.slice(i, i + 15).join(''), 'utf8').toString('base64')}?=`);
  return parti.join('\r\n ');
}
function scriviEml(subject, body) {
  const from = process.env.MAIL_USER || 'alert@example.invalid', to = process.env.MAIL_TO || from;
  const b64 = Buffer.from(body, 'utf8').toString('base64').replace(/(.{76})/g, '$1\r\n');
  fs.writeFileSync(MAIL_FILE, [`From: Mappa Precipitazioni <${from}>`, `To: <${to}>`, `Subject: ${encodeSubject(subject)}`,
    `Date: ${new Date().toUTCString().replace('GMT', '+0000')}`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64', '', b64, ''].join('\r\n'));
}

let registro = {};
try { registro = JSON.parse(fs.readFileSync(REGISTRO, 'utf8')); } catch (e) { registro = {}; }
const accesi = {}, nuovi = [];
for (const r of REGIONI) {
  if (!COTTE.includes(r.k)) continue;   // solo le pagine che il giro riscrive ogni mattina
  let e = null;
  try { e = JSON.parse(fs.readFileSync(path.join(RADICE, 'data', 'riepiloghi', r.k + '.json'), 'utf8')).evento; } catch (x) { e = null; }
  if (!e || !e.dal || !e.fino || oggi > e.fino) continue;
  accesi[r.k] = e.dal;
  if (registro[r.k] !== e.dal) nuovi.push({ r, e });
}
console.log('eventi accesi oggi (' + oggi + '): ' + (Object.keys(accesi).join(', ') || 'nessuno') + '; nuovi: ' + (nuovi.map(x => x.r.k).join(', ') || 'nessuno'));

if (!nuovi.length) {
  output('mail', 'false');
} else {
  const nomi = nuovi.map(x => x.r.nome);
  const subject = '🌧️ Maltempo: ' + (nomi.length === 1 ? 'la pagina ' + nomi[0] + ' è' : 'le pagine ' + nomi.slice(0, -1).join(', ') + ' e ' + nomi[nomi.length - 1] + ' sono') + ' in modalità evento';
  const righe = nuovi.map(({ r, e }) => {
    const t = e.top && e.top[0], mx = e.max24, pu = e.punta, nn = x => x.nb || x.n;
    const torna = dopo(e.fino, 1);
    return [
      `${r.nome.toUpperCase()}, ${dalAl(e.dal, e.al)}`,
      t ? `  Il più bagnato: ${nn(t)}, ${mm(t.mm)} mm${e.giorni.length > 1 ? ' in ' + e.giorni.length + ' giorni' : ''}.` : null,
      mx ? `  In 24 ore: ${mm(mx.mm)} mm a ${nn(mx)}, ${ilG(mx.g)}.` : null,
      pu ? `  In un'ora: ${mm(pu.mm)} mm a ${nn(pu)}, ${ilG(pu.g)}.` : null,
      `  Media di ${e.stazioni} pluviometri: ${mm(e.media)} mm.`,
      `  La pagina: ${SITO}/${r.k}/`,
      `  Torna normale da sola ${giornoSett(torna)} ${lungo(torna)}, se nel frattempo non piove di nuovo forte.`,
    ].filter(Boolean).join('\n');
  });
  const body = [
    'Ciao,',
    '',
    `da stamattina ${nomi.length === 1 ? 'questa pagina regione è' : 'queste pagine regione sono'} in modalità evento: titolo, riquadro in cima e tabella giorno per giorno parlano del maltempo, e c'è il riquadro del radar subito sotto.`,
    '',
    righe.join('\n\n'),
    '',
    'La foto della mappa sui giorni dell\'evento arriva col giro delle anteprime, di solito entro mezz\'ora dalla pubblicazione: fino ad allora resta quella di sempre.',
    '',
    `Soglia: almeno 5 pluviometri della regione oltre i 100 mm in 24 ore. Una mail sola per evento (registro data/eventi-avvisati.json).`,
    '',
    '— Mappa Pluviometrica, avviso automatico (.github/scripts/avviso-evento.js)',
  ].join('\n');
  scriviEml(subject, body);
  output('mail', 'true');
  if (!process.env.GITHUB_OUTPUT) console.log('\n' + subject + '\n\n' + body);
}
// il registro tiene solo gli eventi ancora accesi (in prova a mano, senza GITHUB_OUTPUT, non si tocca)
if (process.env.GITHUB_OUTPUT) fs.writeFileSync(REGISTRO, JSON.stringify(accesi, null, 1) + '\n', 'utf8');
