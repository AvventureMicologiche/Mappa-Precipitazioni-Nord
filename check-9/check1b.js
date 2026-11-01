const fs=require('fs'),path=require('path');const REPO=process.argv[2];
const info=JSON.parse(fs.readFileSync('pageinfo.json'));
const files=new Set();(function w(d,r){for(const e of fs.readdirSync(d,{withFileTypes:true})){const x=r?r+'/'+e.name:e.name;if(e.isDirectory()){if(!r&&['.git','.github','node_modules','functions'].includes(e.name))continue;if(x==='data'||x==='tessere-boschi')continue;w(path.join(d,e.name),x)}else files.add(x)}})(REPO,'');
const redirs=fs.readFileSync(path.join(REPO,'_redirects'),'utf8').split(/\r?\n/).filter(l=>l.trim()&&l[0]!=='#').map(l=>l.trim().split(/\s+/)[0]);
const ok=p=>{p=decodeURIComponent(p);if(p==='/'||p.startsWith('/data/')||p.startsWith('/tessere-boschi/')||p.startsWith('/api/')||p.startsWith('/previsioni'))return true;const r=p.slice(1);if(p.endsWith('/'))return files.has(r+'index.html');return files.has(r)||files.has(r+'.html')||files.has(r+'/index.html')};
const bad={},viaR={},ogMiss=[],ogUrlDiv=[],ldBad={};
for(const f in info){const h=fs.readFileSync(path.join(REPO,f),'utf8');
 for(const m of h.matchAll(/https:\/\/precipitazioni\.avventuremicologiche\.it(\/[A-Za-z0-9_\-\/.%]*)/g)){let p=m[1];if(/\.(js|css|png|jpg|webp|svg|json|txt|xml|ico|geojson)$/.test(p)&&!ok(p)){bad[p]=(bad[p]||[]);bad[p].push(f);continue}
  if(redirs.includes(p)){(viaR[p]=viaR[p]||[]).push(f);continue}
  if(!ok(p)){(bad[p]=bad[p]||[]).push(f)}}
 if(!/property="og:image"/.test(h))ogMiss.push(f);
 const ou=h.match(/property="og:url"\s+content="([^"]*)"/);if(ou&&info[f].canon&&ou[1]!==info[f].canon)ogUrlDiv.push(f+' '+ou[1]+' vs '+info[f].canon);
 for(const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{JSON.parse(m[1])}catch(e){(ldBad[f]=ldBad[f]||[]).push(e.message.slice(0,80))}}
}
const sum=o=>Object.entries(o).map(([k,v])=>k+' x'+v.length+' es. '+[...new Set(v)].slice(0,3).join(', '));
console.log('URL assoluti rotti:',Object.keys(bad).length);console.log(sum(bad).slice(0,40).join('\n'));
console.log('verso rediretti:',Object.keys(viaR).length);console.log(sum(viaR).slice(0,20).join('\n'));
console.log('senza og:image',ogMiss.length,ogMiss.slice(0,5));console.log('og:url diverso',ogUrlDiv.length,ogUrlDiv.slice(0,5));console.log('ld+json rotto',Object.keys(ldBad).length,JSON.stringify(Object.entries(ldBad).slice(0,3)));
