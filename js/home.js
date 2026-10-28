(function(){
 const root=document.getElementById('testimonials');if(!root)return;
 const chips=[...root.querySelectorAll('.t-chip')],cards=[...root.querySelectorAll('.t-card')],note=root.querySelector('.t-pg');
 function apply(id){
  chips.forEach(c=>{const on=c.dataset.filter===id;c.classList.toggle('on',on);c.setAttribute('aria-pressed',on?'true':'false')});
  cards.forEach(card=>{const agents=(card.dataset.agents||'').split(/\s+/);card.classList.toggle('is-out',id!=='all'&&!agents.includes(id))});
  if(note)note.hidden=id!=='all'&&id!=='louis';
 }
 chips.forEach(c=>c.addEventListener('click',()=>apply(c.dataset.filter)));
})();
fetch('data/transactions.json').then(r=>r.json()).then(d=>{
 const el=document.getElementById('resultStrip');if(!el)return;
 const name=a=>a.split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' ');
 el.innerHTML=d.transactions.slice(0,6).map(t=>`<article class="rcard"><span class="rtype">${t.property_type} &middot; ${t.transaction_type}</span><h3>${t.project}</h3><p>${t.district} &middot; ${t.month}</p><p class="rprice">${t.price?('S$'+t.price.toLocaleString()):'Price: to confirm'}</p><small>Handled by ${name(t.agent)} &middot; Example data</small></article>`).join('');
 const c={};d.transactions.forEach(t=>c[t.agent]=(c[t.agent]||0)+1);
 document.querySelectorAll('.member').forEach(m=>{const id=(m.getAttribute('href')||'').split('#')[1];const p=document.createElement('p');p.className='mstat';p.textContent=(c[id]||0)+' listed deals (example data)';m.querySelector('.info')&&m.querySelector('.info').appendChild(p)});
}).catch(()=>{});
(function(){
 const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 const PROP_ORDER=['CONDOMINIUM_APARTMENTS','HDB','LANDED','EXECUTIVE_CONDOMINIUM','STRATA_LANDED'];
 const PROP_LABEL={CONDOMINIUM_APARTMENTS:'Condo',HDB:'HDB',LANDED:'Landed',EXECUTIVE_CONDOMINIUM:'Executive condo',STRATA_LANDED:'Strata landed'};
 const TOWNS=['BUKIT MERAH','QUEENSTOWN','KALLANG/WHAMPOA','TOA PAYOH'];
 const DISTS=['15','18','09'];
 function fmt(n){return Number(n).toLocaleString('en-SG')}
 function formatUpdated(iso){
  const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(iso||'');
  if(!m)return '';
  return Number(m[3])+' '+MONTHS[Number(m[2])-1]+' '+m[1];
 }
 function formatYm(ym){
  const m=/^(\d{4})-(\d{2})$/.exec(ym||'');
  if(!m)return '';
  return MONTHS[Number(m[2])-1]+' '+m[1];
 }
 function titleTown(s){
  return String(s).toLowerCase().replace(/(^|[\s/])([a-z])/g,function(_,a,b){return a+b.toUpperCase()});
 }
 function num(v){return typeof v==='number'?v:null}
 function fillList(ul,rows){
  if(!ul||!rows.length)return;
  ul.replaceChildren();
  rows.forEach(function(row){
   const li=document.createElement('li');
   const b=document.createElement('b');
   b.textContent=row.value;
   if(row.valueFirst){li.append(b,document.createTextNode(' '+row.label))}
   else{li.append(document.createTextNode(row.label+' '),b)}
   if(row.sub){const small=document.createElement('small');small.textContent=row.sub;li.append(small)}
   ul.append(li);
  });
 }
 fetch('data/stats.json').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
  const team=d.team||{};
  const included=team.included||[];
  const agents=document.getElementById('hero-agents');
  if(agents&&included.length)agents.textContent=String(included.length);
  const total=num(team.total);
  const tx=document.getElementById('hero-tx');
  if(tx&&total!==null)tx.textContent=fmt(Math.floor(total/100)*100)+'+';
  const since=document.getElementById('hero-since');
  const year=(team.first||'').slice(0,4);
  if(since&&/^\d{4}$/.test(year))since.textContent=year;
  const updated=formatUpdated(d.last_updated);
  const note=document.getElementById('stats-note');
  if(note&&updated)note.textContent='Team stats from CEA public records, updated '+updated+'.';
  const trackNote=document.getElementById('track-note');
  if(trackNote&&updated){
   const caveat=team.note?(' '+team.note):'';
   trackNote.textContent='Team stats from CEA public records, updated '+updated+'.'+caveat;
  }
  const totalEl=document.getElementById('track-total');
  if(totalEl&&total!==null)totalEl.textContent=fmt(total);
  const range=document.getElementById('track-range');
  const from=formatYm(team.first),to=formatYm(team.last);
  if(range&&from&&to)range.textContent=from+' – '+to;
  const types=team.by_property_type||{};
  const propRows=[];
  PROP_ORDER.forEach(function(key){
   const n=num(types[key]);
   if(n===null)return;
   propRows.push({label:PROP_LABEL[key]||key,value:fmt(n),valueFirst:true});
  });
  Object.keys(types).forEach(function(key){
   if(PROP_ORDER.indexOf(key)!==-1)return;
   const n=num(types[key]);
   if(n===null)return;
   propRows.push({label:titleTown(key.replace(/_/g,' ')),value:fmt(n),valueFirst:true});
  });
  fillList(document.getElementById('track-property'),propRows);
  const deals=team.by_transaction_type||{};
  const resale=num(deals.RESALE),newsale=num(deals['NEW SALE']),whole=num(deals['WHOLE RENTAL']),room=num(deals['ROOM RENTAL']);
  const dealRows=[];
  function bits(pairs){return pairs.filter(function(p){return p[1]!==null}).map(function(p){return fmt(p[1])+' '+p[0]}).join(', ')}
  if(resale!==null||newsale!==null){
   const sale=(resale||0)+(newsale||0);
   dealRows.push({label:'Sale',value:fmt(sale),valueFirst:true,sub:bits([['resale',resale],['new sale',newsale]])});
  }
  if(whole!==null||room!==null){
   const rental=(whole||0)+(room||0);
   dealRows.push({label:'Rental',value:fmt(rental),valueFirst:true,sub:bits([['whole rental',whole],['room rental',room]])});
  }
  fillList(document.getElementById('track-deals'),dealRows);
  const towns=team.top_towns||{},dists=team.top_districts||{};
  const areas=[];
  TOWNS.forEach(function(t){const n=num(towns[t]);if(n!==null)areas.push({label:titleTown(t),value:fmt(n)})});
  DISTS.forEach(function(code){const n=num(dists[code]);if(n!==null)areas.push({label:'District '+code,value:fmt(n)})});
  if(!areas.length){
   Object.keys(towns).forEach(function(t){const n=num(towns[t]);if(n!==null)areas.push({label:titleTown(t),value:fmt(n)})});
   Object.keys(dists).slice(0,3).forEach(function(code){const n=num(dists[code]);if(n!==null)areas.push({label:'District '+code,value:fmt(n)})});
  }
  fillList(document.getElementById('track-areas'),areas);
 }).catch(function(){});
 fetch('data/google.json').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(g){
  const link=document.getElementById('hero-google');
  const rating=document.getElementById('hero-google-rating');
  const count=document.getElementById('hero-google-count');
  if(link&&typeof g.url==='string'&&g.url)link.href=g.url;
  if(rating&&typeof g.rating==='number')rating.textContent=g.rating.toFixed(1)+'★';
  if(count&&typeof g.count==='number')count.textContent=fmt(g.count);
  const checked=formatUpdated(g.checked)||g.checked;
  if(link&&checked)link.title='Google rating checked '+checked;
 }).catch(function(){});
})();
