/* WhatsApp links for every page. Messages always start "Hi Avenue 88,". */
(function(){
 const cfg=window.A88_CONFIG||{WA:'6580830688'};
 const PAGES={
  'index.html':{ref:'home',segment:'home',msg:"Hi Avenue 88, I'd like to chat about my property plans"},
  'about.html':{ref:'about',segment:'about',msg:"Hi Avenue 88, I'd like to chat with the team"},
  'sell.html':{ref:'sell',segment:'sell',msg:"Hi Avenue 88, I'd like to talk about selling my home"},
  'valuation.html':{ref:'valuation',segment:'valuation',msg:"Hi Avenue 88, I'd like an indicative range for my home"},
  'hdb-upgrading.html':{ref:'hdb-upgrading',segment:'hdb-upgrade',msg:"Hi Avenue 88, I'm an HDB owner thinking of upgrading"},
  'hdb-upgrader.html':{ref:'hdb-upgrader',segment:'hdb-upgrade',msg:"Hi Avenue 88, I'm an HDB owner thinking of upgrading"},
  'hdb-valuation.html':{ref:'hdb-valuation',segment:'hdb-valuation',msg:"Hi Avenue 88, I'd like an indicative valuation of my HDB"},
  'condo-valuation.html':{ref:'condo-valuation',segment:'condo-valuation',msg:"Hi Avenue 88, I'd like an indicative valuation of my condo"},
  'free-consultation.html':{ref:'free-consultation',segment:'consult',msg:"Hi Avenue 88, I'd like a free consultation"},
  'launches.html':{ref:'launches',segment:'launches',msg:"Hi Avenue 88, I'd like to ask about a new launch"},
  'octa-score.html':{ref:'octa-score',segment:'octa',msg:"Hi Avenue 88, I'd like an Octa Score for a launch"},
  'news.html':{ref:'news',segment:'news',msg:"Hi Avenue 88, I'd like to chat about my property plans"}
 };
 function file(){const f=location.pathname.split('/').pop();return f||'index.html'}
 const page=PAGES[file()]||{ref:(file().replace(/\.html$/,'')||'home'),segment:'site',msg:"Hi Avenue 88, I'd like to chat about my property plans"};
 if(!document.body.dataset.ref)document.body.dataset.ref=page.ref;
 if(!document.body.dataset.segment)document.body.dataset.segment=page.segment;
 window.A88_PAGE=page;
 function utmSource(){
  const live=(new URLSearchParams(location.search).get('utm_source')||'').trim();
  if(live)return live;
  try{
   const saved=JSON.parse(sessionStorage.getItem('a88_utm')||'{}');
   return (saved.utm_source||'').trim();
  }catch(e){return ''}
 }
 function clean(msg){return String(msg||'').replace(/\s*\(ref:[^)]*\)/g,'').replace(/\s*\(utm:[^)]*\)/g,'').trim()}
 function normalise(msg){
  let text=clean(msg);
  if(!text)return page.msg;
  if(/^hi avenue 88\b/i.test(text)){
   return text.replace(/^hi avenue 88\b[!.,]?\s*/i,"Hi Avenue 88, ");
  }
  const who=text.match(/speak with ([A-Za-z]+) from Avenue 88/i);
  if(who)return "Hi Avenue 88, I'd like to speak with "+who[1];
  if(/^hi[,!]/i.test(text))return "Hi Avenue 88, "+text.replace(/^hi[,!]?\s*/i,'');
  return "Hi Avenue 88, "+text.replace(/[.]+$/,'');
 }
 window.A88_WA_TEXT=function(message,ref){
  let text=normalise(message);
  if(!/^Hi Avenue 88,/.test(text))text="Hi Avenue 88, "+text;
  const r=ref||document.body.dataset.ref||page.ref;
  if(r)text+=' (ref: '+r+')';
  const src=utmSource();
  if(src)text+=' (utm: '+src+')';
  return text;
 };
 window.A88_WA_URL=function(message,ref){
  return 'https://wa.me/'+(cfg.WA||'6580830688')+'?text='+encodeURIComponent(window.A88_WA_TEXT(message,ref));
 };
 function paintLink(a){
  if(a.closest('footer .fl'))return;
  let base=a.dataset.wa||'';
  if(!base){
   try{base=new URL(a.getAttribute('href'),location.href).searchParams.get('text')||''}catch(e){base=''}
  }
  const ref=a.dataset.ref||document.body.dataset.ref||page.ref;
  a.dataset.ref=ref;
  a.href=window.A88_WA_URL(base||page.msg,ref);
  if(!a.getAttribute('target'))a.target='_blank';
  a.rel='noopener';
 }
 function waButton(label,slot){
  const a=document.createElement('a');
  a.className='btn btn-wa';
  a.dataset.waSlot=slot;
  a.href=window.A88_WA_URL(page.msg,page.ref);
  a.target='_blank';
  a.rel='noopener';
  a.textContent=label;
  return a;
 }
 function firstBlock(){
  return document.querySelector('.hero, .page-hero, .hdb-hero, .octa-hero, .vhero, .offer-hero')||document.querySelector('main section, body > section');
 }
 function ensureSlots(){
  const first=firstBlock();
  const contact=document.getElementById('contact');
  if(first){
   const top=first.querySelector('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
   if(top)top.dataset.waSlot=top.dataset.waSlot||'top';
   else{
    const row=first.querySelector('.cta, .btn-row')||first.querySelector('.hc, .wrap')||first;
    row.appendChild(waButton('WhatsApp us','top'));
   }
  }
  const mid=[].find.call(document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"]'),function(a){
   if(a.classList.contains('wa-float')||a.closest('footer')||a.closest('header'))return false;
   if(first&&first.contains(a))return false;
   if(contact&&contact.contains(a))return false;
   return true;
  });
  if(mid)mid.dataset.waSlot=mid.dataset.waSlot||'mid';
  else{
   const band=document.createElement('section');
   band.className='section wa-slot';
   band.innerHTML='<div class="wrap wa-band"><p>Prefer to talk it through now?</p></div>';
   band.querySelector('.wa-band').appendChild(waButton('Chat with us','mid'));
   if(contact&&contact.parentNode)contact.parentNode.insertBefore(band,contact);
   else{
    const foot=document.querySelector('footer');
    (foot&&foot.parentNode?foot.parentNode:document.body).insertBefore(band,foot);
   }
  }
  let bottom=contact&&contact.querySelector('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
  if(bottom)bottom.dataset.waSlot=bottom.dataset.waSlot||'bottom';
  else if(contact){
   const hold=contact.querySelector('.wrap > div, .wrap')||contact;
   const p=document.createElement('p');
   p.appendChild(waButton('WhatsApp us','bottom'));
   hold.appendChild(p);
  }else{
   const foot=document.querySelector('footer');
   const band=document.createElement('section');
   band.className='section wa-slot';
   band.innerHTML='<div class="wrap wa-band"><p>Message us on WhatsApp.</p></div>';
   band.querySelector('.wa-band').appendChild(waButton('WhatsApp us','bottom'));
   if(foot&&foot.parentNode)foot.parentNode.insertBefore(band,foot);
  }
 }
 const float=document.querySelector('.wa-float');
 if(float){
  const span=float.querySelector('span');
  if(span)span.textContent='Chat with us';
  float.setAttribute('aria-label','Chat with us');
 }
 ensureSlots();
 document.querySelectorAll('a[href*="wa.me"], a[href*="api.whatsapp.com"]').forEach(paintLink);
 document.querySelectorAll('.js-book').forEach(function(a){
  const url=((cfg.BOOKING_URL)||'').trim();
  if(!url){a.hidden=true;return}
  a.hidden=false;
  a.href=url;
  a.target='_blank';
  a.rel='noopener';
 });
})();
