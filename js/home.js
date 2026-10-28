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
  const sinceCount=num(team.since_2017);
  const heroBase=sinceCount!==null?sinceCount:total;
  const tx=document.getElementById('hero-tx');
  if(tx&&heroBase!==null)tx.textContent=fmt(Math.floor(heroBase/100)*100)+'+';
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
  const sub=document.getElementById('team-sub');
  const subYear=(team.first||'2017-01').slice(0,4);
  if(sub&&heroBase!==null&&/^\d{4}$/.test(subYear))sub.textContent=fmt(Math.floor(heroBase/100)*100)+'+ transactions on CEA public records since '+subYear+'.';
  const windowNote=document.getElementById('agent-window');
  const winFrom=formatYm(team.last_12_months_from),winTo=formatYm(team.last_12_months_to);
  if(windowNote&&winFrom&&winTo)windowNote.textContent='Transaction counts are from CEA public records. Deals in the last 12 months are '+winFrom+' – '+winTo+'.';
  const trackEl=document.getElementById('agent-track');
  if(trackEl&&d.agents){
   function focusLabel(focus){
    if(!focus||!focus.name)return '';
    return focus.kind==='district'?'District '+focus.name:titleTown(focus.name);
   }
   const cards=[...trackEl.querySelectorAll('.agent-card[data-name]')];
   cards.forEach(function(card){
    const agent=d.agents[card.dataset.name];
    if(!agent)return;
    const since=num(agent.since_2017);
    const recent=num(agent.last_12_months);
    const sinceEl=card.querySelector('[data-field="since"]');
    const recentEl=card.querySelector('[data-field="recent"]');
    if(sinceEl&&since!==null)sinceEl.textContent=fmt(since);
    if(recentEl&&recent!==null)recentEl.textContent=fmt(recent);
    const label=focusLabel(agent.focus);
    if(label&&card.dataset.region==='focus'){
     const region=card.querySelector('[data-field="region"]');
     if(region)region.textContent=label;
    }
    if(label&&card.dataset.third==='focus'){
     const third=card.querySelector('[data-field="third"]');
     if(third){third.textContent=label;third.classList.add('is-text')}
    }
    if(label&&card.dataset.quote==='focus'){
     const quote=card.querySelector('[data-field="quote"]');
     if(quote)quote.textContent='Ask me about '+label+'.';
    }
    const score=since!==null?since:(num(agent.total)||0);
    card.dataset.score=String(score);
   });
   const cta=trackEl.querySelector('.agent-card.is-cta');
   cards.sort(function(a,b){return Number(b.dataset.score||0)-Number(a.dataset.score||0)});
   cards.forEach(function(card){trackEl.insertBefore(card,cta)});
   trackEl.dispatchEvent(new CustomEvent('agents-updated'));
  }
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
(function(){
 const root=document.getElementById('our-team');
 const track=document.getElementById('agent-track');
 if(!root||!track)return;
 const prev=root.querySelector('.agent-prev'),next=root.querySelector('.agent-next'),dots=root.querySelector('.agent-dots'),live=root.querySelector('[aria-live]');
 root.querySelectorAll('.agent-photo').forEach(function(img){
  function hideFallback(){const fb=img.parentElement&&img.parentElement.querySelector('.agent-fallback');if(fb)fb.hidden=true}
  if(img.complete&&img.naturalWidth)hideFallback();
  else img.addEventListener('load',hideFallback);
  img.addEventListener('error',function(){img.remove()});
 });
 function cards(){return [...track.querySelectorAll('.agent-card')]}
 function step(){
  const card=track.querySelector('.agent-card');
  if(!card)return 1;
  const style=getComputedStyle(track);
  const gap=parseFloat(style.columnGap||style.gap)||18;
  return card.getBoundingClientRect().width+gap;
 }
 function index(){
  const n=cards().length;
  if(!n)return 0;
  return Math.max(0,Math.min(n-1,Math.round(track.scrollLeft/step())));
 }
 function go(i){
  const n=cards().length;
  const at=Math.max(0,Math.min(n-1,i));
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  track.scrollTo({left:Math.round(at*step()),behavior:reduce?'auto':'smooth'});
 }
 function mark(){
  const list=cards(),i=index();
  prev.disabled=track.scrollLeft<=2;
  next.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-2;
  [...dots.children].forEach(function(b,n){b.setAttribute('aria-current',n===i?'true':'false')});
  const card=list[i];
  if(live&&card){
   const name=card.dataset.name||'the team';
   live.textContent=name+', card '+(i+1)+' of '+list.length;
  }
 }
 function buildDots(){
  dots.replaceChildren();
  cards().forEach(function(card,i){
   const b=document.createElement('button');
   b.type='button';
   const name=card.dataset.name;
   b.setAttribute('aria-label',name?('Show '+name):'Show how to reach the team');
   b.addEventListener('click',function(){go(i)});
   dots.appendChild(b);
  });
  mark();
 }
 prev.addEventListener('click',function(){go(index()-1)});
 next.addEventListener('click',function(){go(index()+1)});
 track.addEventListener('keydown',function(e){
  if(e.key==='ArrowRight'){e.preventDefault();go(index()+1)}
  else if(e.key==='ArrowLeft'){e.preventDefault();go(index()-1)}
  else if(e.key==='Home'){e.preventDefault();go(0)}
  else if(e.key==='End'){e.preventDefault();go(cards().length-1)}
 });
 track.addEventListener('scroll',function(){requestAnimationFrame(mark)},{passive:true});
 track.addEventListener('agents-updated',buildDots);
 window.addEventListener('resize',mark);
 buildDots();
})();
