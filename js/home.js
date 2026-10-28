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
fetch('data/transactions.json',{cache:'no-cache'}).then(r=>r.json()).then(d=>{
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
 fetch('data/stats.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
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
 fetch('data/google.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(g){
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
(function(){
 const grid=document.getElementById('podcast-grid');
 if(!grid)return;
 const PODCAST_FALLBACK = {"shows":[{"id":"takeaway","name":"Takeaway with Avenue 88","playlist":"PLaptE4pMNjjjzHJsFYTlHRhFCVHI_QMnJ"},{"id":"realtalk","name":"The Real Talk","playlist":"PLaptE4pMNjjhWlZ83ZJvsoJhajMvITqGi"}],"episodes":[{"id":"9ub5Bucq_Ss","title":"How Much Income Do You Really Need to upgrade to a condo comfortably in Singapore?","date":"2026-07-05","show":"takeaway","thumbnail":"https://i2.ytimg.com/vi/9ub5Bucq_Ss/hqdefault.jpg"},{"id":"C0gpst6NTuw","title":"Is This Singapore’s Most Exciting New Condo? | Tengah Garden Residences","date":"2026-04-26","show":"takeaway","thumbnail":"https://i4.ytimg.com/vi/C0gpst6NTuw/hqdefault.jpg"},{"id":"SkMaU-uosjA","title":"Part 2: What to Expect for HDB Market in 2026 - BTO, MOP Locations & Buyer Opportunities","date":"2026-04-04","show":"realtalk","thumbnail":"https://i4.ytimg.com/vi/SkMaU-uosjA/hqdefault.jpg"},{"id":"PkDzCAD2YXg","title":"HDB Resale Market 2025: Price Trends, Transaction Volume & Buyer Insights","date":"2026-03-30","show":"realtalk","thumbnail":"https://i1.ytimg.com/vi/PkDzCAD2YXg/hqdefault.jpg"},{"id":"gJk1az47XDQ","title":"Missed the Launch? These Post-Launch Units Are Still Worth Buying","date":"2026-01-25","show":"takeaway","thumbnail":"https://i4.ytimg.com/vi/gJk1az47XDQ/hqdefault.jpg"},{"id":"RlZ6w5EQVRY","title":"Narra Residences Full Review: Is This Nature-Inspired Home Worth a Cheque?","date":"2026-01-11","show":"takeaway","thumbnail":"https://i3.ytimg.com/vi/RlZ6w5EQVRY/hqdefault.jpg"},{"id":"2ysHN0oQfeo","title":"Takeaway with Avenue 88 | 2025 New Launch Property Market Recap (CCR • RCR • OCR)","date":"2026-01-04","show":"takeaway","thumbnail":"https://i3.ytimg.com/vi/2ysHN0oQfeo/hqdefault.jpg"},{"id":"4bGgzTIRzho","title":"Inside Coastal Cabana Part 2","date":"2025-12-28","show":"takeaway","thumbnail":"https://i1.ytimg.com/vi/4bGgzTIRzho/hqdefault.jpg"},{"id":"iD99T_RUI48","title":"Coastal Cabana Insights | Layout, Location & Price Guide - New EC Launch","date":"2025-12-08","show":"takeaway","thumbnail":"https://i2.ytimg.com/vi/iD99T_RUI48/hqdefault.jpg"},{"id":"vFV_Rwp-LnQ","title":"Does The Sen Make Sense? | Full Project Breakdown & Price Analysis","date":"2025-12-02","show":"takeaway","thumbnail":"https://i3.ytimg.com/vi/vFV_Rwp-LnQ/hqdefault.jpg"},{"id":"ZTDhIW44Tlc","title":"What’s Next for One North and Dover? URA Master Plan","date":"2025-10-05","show":"realtalk","thumbnail":"https://i3.ytimg.com/vi/ZTDhIW44Tlc/hqdefault.jpg"},{"id":"44o1SBRdNSU","title":"What’s Next for Turf City? Interesting facts on URA Master Plan 2025","date":"2025-09-28","show":"realtalk","thumbnail":"https://i1.ytimg.com/vi/44o1SBRdNSU/hqdefault.jpg"},{"id":"Z2Oifjz0-cM","title":"Springleaf Residences vs Canberra Crescent: Which One Wins?","date":"2025-08-04","show":"takeaway","thumbnail":"https://i3.ytimg.com/vi/Z2Oifjz0-cM/hqdefault.jpg"},{"id":"WJ33jk_4HD0","title":"Income Blueprint to your property wealth","date":"2025-07-20","show":"takeaway","thumbnail":"https://i4.ytimg.com/vi/WJ33jk_4HD0/hqdefault.jpg"},{"id":"9XAX0SttVD4","title":"Bloomsbury Residences: Worth the Hype? (FULL Review + Secret MRT News!)","date":"2025-06-29","show":"takeaway","thumbnail":"https://i2.ytimg.com/vi/9XAX0SttVD4/hqdefault.jpg"},{"id":"8w1rArVs1uY","title":"Confused by new HDB BTO flat types? WATCH THIS First! Prime, Plus & Standard","date":"2025-06-15","show":"takeaway","thumbnail":"https://i1.ytimg.com/vi/8w1rArVs1uY/hqdefault.jpg"},{"id":"gB4s3bZce_M","title":"$1.74M Profit From a District 19 Executive Condo?! | The Hidden Power of Hundred Palms | Part 2","date":"2025-06-01","show":"takeaway","thumbnail":"https://i4.ytimg.com/vi/gB4s3bZce_M/hqdefault.jpg"},{"id":"czZ_1gd30y8","title":"This Executive Condo Made $1.74M Profit?! Why District 19 ECs Are Crushing It | Part 1","date":"2025-05-18","show":"takeaway","thumbnail":"https://i4.ytimg.com/vi/czZ_1gd30y8/hqdefault.jpg"},{"id":"8EyIwz0Lln8","title":"Part 1: Buying Your First HDB at 35? Pros & Cons for Singles in Singapore!","date":"2025-03-30","show":"takeaway","thumbnail":"https://i1.ytimg.com/vi/8EyIwz0Lln8/hqdefault.jpg"},{"id":"hti-ZsyunzY","title":"Lentor Central Residences – Worth Investing? Full Project Review & Price Analysis | Avenue 88","date":"2025-02-16","show":"realtalk","thumbnail":"https://i1.ytimg.com/vi/hti-ZsyunzY/hqdefault.jpg"},{"id":"9R3cL83xbPs","title":"Renovating Brand New vs Resale Homes: Key Differences & Hidden Costs Explained | Avenue 88 Podcast","date":"2025-02-09","show":"realtalk","thumbnail":"https://i2.ytimg.com/vi/9R3cL83xbPs/hqdefault.jpg"},{"id":"82M44X21_9Q","title":"2025 New EC Launches in Singapore: Aurelle & Plantation Close – What You Need to Know!","date":"2025-01-26","show":"realtalk","thumbnail":"https://i1.ytimg.com/vi/82M44X21_9Q/hqdefault.jpg"},{"id":"f2U2hGH8y3s","title":"HDB SERS in Singapore - Will my HDB go \"Enbloc\"? The Real Talk Podcast","date":"2024-11-24","show":"realtalk","thumbnail":"https://i3.ytimg.com/vi/f2U2hGH8y3s/hqdefault.jpg"},{"id":"yGmQ1BcOKzk","title":"Part 2: Exciting New EC Launches: Key Info for Buyers !","date":"2024-11-06","show":"realtalk","thumbnail":"https://i2.ytimg.com/vi/yGmQ1BcOKzk/hqdefault.jpg"},{"id":"RFciWurFRgA","title":"Part 3: Why Executive Condos Offer Serious Value: High Growth Potential & Price Advantage !","date":"2024-11-06","show":"realtalk","thumbnail":"https://i3.ytimg.com/vi/RFciWurFRgA/hqdefault.jpg"},{"id":"bqRoR6mKCwM","title":"Part 1: Unlocking Your Dream Executive Condominium: Must-Know Criteria for Smart Buyers!","date":"2024-11-05","show":"realtalk","thumbnail":"https://i3.ytimg.com/vi/bqRoR6mKCwM/hqdefault.jpg"},{"id":"WR55JxaGci4","title":"Things that you don't know about EC - The Real Talk Podcast","date":"2024-11-03","show":"realtalk","thumbnail":"https://i4.ytimg.com/vi/WR55JxaGci4/hqdefault.jpg"},{"id":"SEivPGRAbxA","title":"Is $2m HDB the New Norm? The backstory of the $1.7m Dawson 5rm HDB","date":"2024-09-21","show":"realtalk","thumbnail":"https://i4.ytimg.com/vi/SEivPGRAbxA/hqdefault.jpg"},{"id":"gboNeFwUErA","title":"Extraordinary Events in Sg Properties (HDB & Pte). Singapore True Events.  Our first hand experience","date":"2024-08-31","show":"realtalk","thumbnail":"https://i4.ytimg.com/vi/gboNeFwUErA/hqdefault.jpg"},{"id":"yKEmONODsaE","title":"$2m HDB? And there are 2 of them? Is Jumbo flat real? A 10rm flat HDB? Let's find out.","date":"2024-07-22","show":"realtalk","thumbnail":"https://i2.ytimg.com/vi/yKEmONODsaE/hqdefault.jpg"}]};
 const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 const chips=[...document.querySelectorAll('#watch .pchips button')];
 let episodes=[],filter='all';
 function formatDate(iso){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||'');
  if(!m)return '';
  return Number(m[3])+' '+MONTHS[Number(m[2])-1]+' '+m[1];
 }
 function safeId(id){return /^[A-Za-z0-9_-]{6,20}$/.test(id||'')?id:''}
 function thumb(url,id){
  if(/^https:\/\/i\d?\.ytimg\.com\/vi\/[A-Za-z0-9_-]+\//.test(url||''))return url;
  return 'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';
 }
 function card(ep){
  const id=safeId(ep.id);
  const article=document.createElement('article');
  article.className='pod';
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='pod-hit';
  btn.setAttribute('aria-label','Play '+(ep.title||'episode'));
  const face=document.createElement('span');
  face.className='yt-th';
  if(id)face.style.backgroundImage='url("'+thumb(ep.thumbnail,id)+'")';
  const play=document.createElement('span');
  play.className='yt-play';
  play.setAttribute('aria-hidden','true');
  face.append(play);
  btn.append(face);
  btn.addEventListener('click',function(){
   if(!id||btn.querySelector('iframe'))return;
   const frame=document.createElement('iframe');
   frame.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1';
   frame.title=ep.title||'Podcast episode';
   frame.allow='autoplay; encrypted-media; picture-in-picture';
   frame.allowFullscreen=true;
   btn.replaceWith(frame);
  });
  const show=document.createElement('p');
  show.className='pod-show';
  show.textContent=ep.showName||'';
  const title=document.createElement('p');
  title.className='pod-title';
  title.textContent=ep.title||'';
  const date=document.createElement('p');
  date.className='pod-date';
  date.textContent=formatDate(ep.date);
  article.append(btn,show,title,date);
  return article;
 }
 function render(){
  const names={};
  (episodes.shows||[]).forEach(function(s){names[s.id]=s.name});
  const rows=episodes.list.filter(function(e){return filter==='all'||e.show===filter}).slice(0,6);
  grid.replaceChildren();
  if(!rows.length){
   const p=document.createElement('p');
   p.className='pod-empty';
   p.textContent='No episodes in this list yet.';
   grid.append(p);
   return;
  }
  rows.forEach(function(ep){grid.append(card(Object.assign({showName:names[ep.show]||''},ep)))});
 }
 chips.forEach(function(btn){
  btn.addEventListener('click',function(){
   filter=btn.dataset.show||'all';
   chips.forEach(function(b){
    const on=b===btn;
    b.classList.toggle('on',on);
    b.setAttribute('aria-pressed',on?'true':'false');
   });
   render();
  });
 });
 function usePodcasts(d){
  episodes={shows:(d&&d.shows)||PODCAST_FALLBACK.shows,list:((d&&d.episodes)||[]).slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'')||(b.id||'').localeCompare(a.id||'')})};
  if(!episodes.list.length)episodes.list=PODCAST_FALLBACK.episodes.slice();
  render();
 }
 fetch('data/podcasts.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(usePodcasts).catch(function(){usePodcasts(PODCAST_FALLBACK)});
 const ig=document.getElementById('instagram-grid');
 const igFollow=document.getElementById('ig-follow');
 let igScriptStarted=false;
 function igPermalink(url){
  try{
   const u=new URL(url);
   if(u.protocol!=='https:')return '';
   if(u.hostname!=='www.instagram.com'&&u.hostname!=='instagram.com')return '';
   return u.href;
  }catch(e){return ''}
 }
 function loadInstagramEmbeds(){
  if(window.instgrm&&window.instgrm.Embeds){window.instgrm.Embeds.process();return}
  if(igScriptStarted)return;
  igScriptStarted=true;
  const s=document.createElement('script');
  s.async=true;
  s.src='https://www.instagram.com/embed.js';
  s.onload=function(){if(window.instgrm&&window.instgrm.Embeds)window.instgrm.Embeds.process()};
  document.body.appendChild(s);
 }
 function watchInstagram(){
  const section=document.getElementById('watch');
  if(!section||!('IntersectionObserver' in window)){loadInstagramEmbeds();return}
  const io=new IntersectionObserver(function(entries){
   if(!entries.some(function(e){return e.isIntersecting}))return;
   loadInstagramEmbeds();
   io.disconnect();
  },{rootMargin:'240px'});
  io.observe(section);
 }
 function instagramPromo(){
  const a=document.createElement('a');
  a.className='ig-promo';
  a.href='https://www.instagram.com/avenue88property/';
  a.target='_blank';
  a.rel='noopener';
  const kicker=document.createElement('span');
  kicker.className='ig-kicker';
  kicker.textContent='Instagram';
  const strong=document.createElement('strong');
  strong.textContent='Latest on Instagram';
  const handle=document.createElement('span');
  handle.className='ig-handle';
  handle.textContent='@avenue88property';
  const cta=document.createElement('span');
  cta.className='ig-cta';
  cta.textContent='Follow @avenue88property';
  a.append(kicker,strong,handle,cta);
  return a;
 }
 function instagramPost(post){
  const href=igPermalink(post.url);
  if(!href)return null;
  const quote=document.createElement('blockquote');
  quote.className='instagram-media';
  quote.setAttribute('data-instgrm-permalink',href);
  quote.setAttribute('data-instgrm-version','14');
  const link=document.createElement('a');
  link.href=href;
  link.target='_blank';
  link.rel='noopener';
  link.textContent=(post.caption||'').trim()||'View this post on Instagram';
  quote.append(link);
  return quote;
 }
 function renderInstagram(list){
  if(!ig)return;
  ig.replaceChildren();
  const rows=(list||[]).map(instagramPost).filter(Boolean);
  if(!rows.length){
   ig.append(instagramPromo());
   if(igFollow)igFollow.hidden=true;
   return;
  }
  rows.forEach(function(node){ig.append(node)});
  if(igFollow)igFollow.hidden=false;
  watchInstagram();
 }
 fetch('data/instagram.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
  renderInstagram(Array.isArray(d)?d:(d&&d.posts)||[]);
 }).catch(function(){renderInstagram([])});
})();
