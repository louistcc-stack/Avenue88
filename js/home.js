(function(){
 const opt={cache:'no-cache'};
 function json(url){return fetch(url,opt).then(function(r){if(!r.ok)throw 0;return r.json()})}
 function text(el,value){if(el)el.textContent=value}
 function fmt(n){return Number(n).toLocaleString('en-SG')}
 json('data/stats.json').then(function(d){
  const team=d.team||{};
  const n=typeof team.since_2017==='number'?team.since_2017:team.total;
  const agents=(team.included||[]).length;
  if(agents)text(document.getElementById('stat-agents'),String(agents));
  if(typeof n==='number')text(document.getElementById('stat-tx'),fmt(Math.floor(n/100)*100)+'+');
 }).catch(function(){});
 json('data/google.json').then(function(g){
  const b=document.getElementById('stat-google');
  const label=document.getElementById('stat-google-label');
  const link=document.getElementById('stat-google-link');
  if(b&&typeof g.rating==='number')b.innerHTML=g.rating.toFixed(1)+'<i>★</i>';
  if(label&&typeof g.count==='number')label.textContent='From '+g.count.toLocaleString('en-SG')+' Google reviews';
  if(link&&g.url)link.href=g.url;
 }).catch(function(){});
 json('data/podcasts.json').then(function(d){
  const shows={};
  (d.shows||[]).forEach(function(s){shows[s.id]=s.name});
  const eps=(d.episodes||[]).slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'')});
  const row=document.getElementById('watch-row');
  if(!row)return;
  row.replaceChildren();
  eps.slice(0,12).forEach(function(e){
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
  list.forEach(function(post){
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
})();
