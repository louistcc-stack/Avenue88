(function(){
 const opt={cache:'no-cache'};
 function json(url){return fetch(url,opt).then(function(r){if(!r.ok)throw 0;return r.json()})}
 function text(el,value){if(el)el.textContent=value}
 function fmt(n){return Number(n).toLocaleString('en-SG')}
 let statsLeft=2;
 function armStats(){if(--statsLeft===0)countStats()}
 json('data/stats.json').then(function(d){
  const team=d.team||{};
  const n=typeof team.since_2017==='number'?team.since_2017:team.total;
  const el=document.getElementById('stat-tx');
  if(el&&typeof n==='number'){
   const rounded=Math.floor(n/100)*100;
   el.dataset.count=String(rounded);
   text(el,fmt(rounded)+'+');
  }
 }).catch(function(){}).then(armStats);
 json('data/google.json').then(function(g){
  const b=document.getElementById('stat-google');
  const label=document.getElementById('stat-google-label');
  const link=document.getElementById('stat-google-link');
  if(b&&typeof g.rating==='number'){
   b.dataset.count=String(g.rating);
   b.dataset.decimals='1';
   b.dataset.star='1';
   b.innerHTML=g.rating.toFixed(1)+'<i>★</i>';
  }
  if(label)label.textContent='Positive reviews from our clients';
  if(link&&g.url)link.href=g.url;
 }).catch(function(){}).then(armStats);
 function countStats(){
  const band=document.querySelector('.nums');
  if(!band)return;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finals=new Map();
  band.querySelectorAll('[data-count]').forEach(function(el){finals.set(el,el.innerHTML)});
  function play(){
   finals.forEach(function(finalHTML,el){
    if(reduce){el.innerHTML=finalHTML;return}
    const target=parseFloat(el.dataset.count);
    const prefix=el.dataset.prefix||'';
    const suffix=el.dataset.suffix||'';
    const decimals=parseInt(el.dataset.decimals||'0',10)||0;
    const star=el.dataset.star==='1';
    const start=performance.now();
    function frame(now){
     const t=Math.min(1,(now-start)/1500);
     const e=1-Math.pow(1-t,3);
     const val=target*e;
     const num=decimals?val.toFixed(decimals):Math.round(val).toLocaleString('en-SG');
     el.innerHTML=prefix+num+suffix+(star?'<i>★</i>':'');
     if(t<1)requestAnimationFrame(frame);
     else el.innerHTML=finalHTML;
    }
    if(!isFinite(target)){el.innerHTML=finalHTML;return}
    requestAnimationFrame(frame);
   });
  }
  if(reduce){play();return}
  const io=new IntersectionObserver(function(entries){
   if(!entries.some(function(e){return e.isIntersecting}))return;
   io.disconnect();
   play();
  },{threshold:.4});
  io.observe(band);
 }
 json('data/podcasts.json').then(function(d){
  const shows={};
  (d.shows||[]).forEach(function(s){shows[s.id]=s.name});
  const eps=(d.episodes||[]).slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'')});
  const row=document.getElementById('watch-row');
  if(!row)return;
  row.replaceChildren();
  eps.slice(0,6).forEach(function(e){
   if(!/^[A-Za-z0-9_-]{6,20}$/.test(e.id||''))return;
   const a=document.createElement('a');
   a.className='ep';
   a.href='https://www.youtube.com/watch?v='+e.id;
   a.target='_blank';
   a.rel='noopener';
   const th=document.createElement('div');
   th.className='th';
   const img=document.createElement('img');
   img.loading='lazy';
   img.alt='';
   img.src=e.thumbnail||('https://i.ytimg.com/vi/'+e.id+'/hqdefault.jpg');
   const play=document.createElement('span');
   play.className='play';
   play.textContent='▶';
   th.append(img,play);
   const small=document.createElement('small');
   small.textContent=shows[e.show]||'';
   const h4=document.createElement('h4');
   h4.textContent=e.title||'';
   a.append(th,small,h4);
   row.append(a);
  });
 }).catch(function(){});
 function igShort(url){const m=String(url||'').match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);return m?m[1]:''}
 function igHref(url){try{const u=new URL(url);if(u.protocol==='https:'&&(u.hostname==='www.instagram.com'||u.hostname==='instagram.com'))return u.href}catch(e){}return ''}
 function igMark(type){
  if(type==='reel')return '<span class="ig-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 7.5v9l8-4.5-8-4.5z"/></svg></span>';
  if(type==='carousel')return '<span class="ig-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="7" y="7" width="12" height="12" rx="1.5"/><path d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H16"/></svg></span>';
  return '';
 }
 let igScript;
 function loadEmbed(){
  if(window.instgrm){window.instgrm.Embeds.process();return}
  if(igScript)return;
  igScript=document.createElement('script');
  igScript.src='https://www.instagram.com/embed.js';
  igScript.async=true;
  document.body.append(igScript);
 }
 function igEmbed(post,href){
  const wrap=document.createElement('div');
  wrap.className='ig-embed';
  const quote=document.createElement('blockquote');
  quote.className='instagram-media';
  quote.dataset.instgrmPermalink=href;
  quote.dataset.instgrmVersion='14';
  const link=document.createElement('a');
  link.href=href;
  link.textContent=(post.caption||'').trim()||'View on Instagram';
  quote.append(link);
  wrap.append(quote);
  return wrap;
 }
 json('data/instagram.json').then(function(d){
  const list=Array.isArray(d)?d:(d&&d.posts)||[];
  const sec=document.getElementById('instagram');
  const row=document.getElementById('ig-row');
  if(!sec||!row||!list.length)return;
  row.replaceChildren();
  let embeds=0;
  list.slice(0,9).forEach(function(post){
   const href=igHref(post.url);
   const code=igShort(href);
   if(!href||!code)return;
   const local='assets/instagram/'+code+'.jpg';
   if(post.image===local){
    const a=document.createElement('a');
    a.className='igc';
    a.href=href;
    a.target='_blank';
    a.rel='noopener';
    const img=document.createElement('img');
    img.alt='';
    img.src=local;
    img.addEventListener('error',function(){
     const embed=igEmbed(post,href);
     a.replaceWith(embed);
     embeds++;
     loadEmbed();
    });
    a.append(img);
    a.insertAdjacentHTML('beforeend', igMark(post.type)+'<span class="ig-cap"><small>'+(post.type||'Instagram')+'</small><h4></h4></span>');
    a.querySelector('h4').textContent=(post.caption||'').trim()||'View on Instagram';
    row.append(a);
   }else{
    row.append(igEmbed(post,href));
    embeds++;
   }
  });
  if(row.children.length)sec.hidden=false;
  if(embeds)loadEmbed();
 }).catch(function(){});
 function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
 const trackHost=document.getElementById('track-row');
 if(trackHost&&Array.isArray(window.A88_TRACK)){
  trackHost.innerHTML=window.A88_TRACK.map(function(card){
   const photo=card.photo?'<img src="'+esc(card.photo)+'" alt="">':'<div class="tr-ph" aria-hidden="true"></div>';
   const sample=card.sample?'<span class="tr-sample">Sample, photo coming</span>':'';
   return '<article class="tr-card">'
    +'<div class="tr-photo">'+photo+sample+'<div class="tr-shade"></div>'
    +'<div class="tr-top"><p class="tr-sold">Sold</p><p class="tr-badge">'+esc(card.soldLine)+'</p></div>'
    +'<div class="tr-copy">'
    +'<h3>'+esc(card.project)+'</h3><p class="tr-place">'+esc(card.place)+'</p>'+(card.extra?'<p class="tr-extra">'+esc(card.extra)+'</p>':'')
    +'<div class="tr-agent"><img src="'+esc(card.headshot)+'" alt=""><span><b>'+esc(card.agent)+'</b></span></div>'
    +'</div></div></article>';
  }).join('');
 }
 const revTrack=document.getElementById('rev-track');
 json('data/reviews.json').then(function(d){
  const list=(d&&d.reviews)||[];
  if(!revTrack)return;
  if(!list.length){
   revTrack.innerHTML='<article class="rev-card"><p>We only show reviews already on file. Read them on Google.</p><a href="https://www.google.com/maps/place/Avenue+88/@1.3497916,103.8492158,17z" target="_blank" rel="noopener">Open our Google reviews</a></article>';
   return;
  }
  const stars=function(n){return '★★★★★'.slice(0,Math.max(0,Math.min(5,n||5)))}
  revTrack.innerHTML=list.map(function(r){
   const paras=String(r.text||'').split(/\n\n/).map(function(p){return '<p>'+esc(p).replace(/\n/g,'<br>')+'</p>'}).join('');
   const who=r.name||r.who||'';
   return '<article class="rev-card"><header><b>'+esc(who)+'</b><span class="rev-stars" aria-label="'+stars(r.stars).length+' stars">'+stars(r.stars)+'</span><span class="rev-google">Google</span><time>'+esc(r.when||'')+'</time></header><div class="rev-text">'+paras+'</div><button type="button" class="rev-more" hidden>Read more</button>'+(r.agent?'<span class="rev-agent">Agent: '+esc(r.agent)+'</span>':'')+'</article>';
  }).join('');
  revTrack.querySelectorAll('.rev-card').forEach(function(card){
   const body=card.querySelector('.rev-text');
   const more=card.querySelector('.rev-more');
   if(!body||!more)return;
   if(body.scrollHeight>body.clientHeight+2){
    more.hidden=false;
    more.addEventListener('click',function(){
     const open=card.classList.toggle('is-open');
     more.textContent=open?'Show less':'Read more';
    });
   }
  });
  const prev=document.getElementById('rev-prev'),next=document.getElementById('rev-next');
  function step(dir){revTrack.scrollBy({left:dir*(revTrack.clientWidth*0.86),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
  if(prev)prev.addEventListener('click',function(){step(-1)});
  if(next)next.addEventListener('click',function(){step(1)});
 }).catch(function(){});
})();
