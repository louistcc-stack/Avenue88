/* Tracking. A script loads only when its ID in site-config.js is set. */
(function(){
 const cfg=window.A88_CONFIG||{};
 const KEY='a88_utm';
 function persist(){
  const q=new URLSearchParams(location.search);
  const next={};
  let any=false;
  ['utm_source','utm_medium','utm_campaign'].forEach(function(k){
   const v=(q.get(k)||'').trim();
   if(v){next[k]=v;any=true}
  });
  if(!any)return;
  try{sessionStorage.setItem(KEY,JSON.stringify(next))}catch(e){}
 }
 function read(){
  try{return JSON.parse(sessionStorage.getItem(KEY)||'{}')||{}}catch(e){return{}}
 }
 persist();
 window.A88_UTM=read;
 function eid(){return 'a88-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)}
 function loadGtag(){
  if(!cfg.GA4_ID&&!cfg.GADS_ID)return;
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
  const s=document.createElement('script');
  s.async=true;
  s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(cfg.GA4_ID||cfg.GADS_ID);
  document.head.appendChild(s);
  window.gtag('js',new Date());
  if(cfg.GA4_ID)window.gtag('config',cfg.GA4_ID);
  if(cfg.GADS_ID)window.gtag('config',cfg.GADS_ID);
 }
 function loadPixel(){
  if(!cfg.META_PIXEL_ID)return;
  if(window.fbq)return;
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init',cfg.META_PIXEL_ID);
  window.fbq('track','PageView');
 }
 loadGtag();
 loadPixel();
 const ADS={whatsapp_click:'whatsapp',call_click:'call',form_submit:'form',book_click:'book'};
 const META={whatsapp_click:'Contact',call_click:'Contact',form_submit:'Lead',book_click:'Schedule'};
 window.A88_TRACK_EVENT=function(name,extra){
  const u=read();
  const params={
   page:(location.pathname.split('/').pop()||'index.html')||'index.html',
   segment:document.body.dataset.segment||'',
   ref:(extra&&extra.ref)||document.body.dataset.ref||'',
   utm_source:u.utm_source||'',
   utm_medium:u.utm_medium||'',
   utm_campaign:u.utm_campaign||''
  };
  if(extra)Object.keys(extra).forEach(function(k){if(extra[k]!=null&&extra[k]!=='')params[k]=extra[k]});
  const id=eid();
  if(cfg.GA4_ID&&window.gtag)window.gtag('event',name,Object.assign({event_id:id},params));
  if(cfg.META_PIXEL_ID&&window.fbq&&META[name])window.fbq('track',META[name],params,{eventID:id});
  const label=cfg.GADS_LABELS&&cfg.GADS_LABELS[ADS[name]];
  if(cfg.GADS_ID&&label&&window.gtag)window.gtag('event','conversion',Object.assign({send_to:cfg.GADS_ID+'/'+label,event_id:id},params));
  return id;
 };
 document.addEventListener('click',function(e){
  const a=e.target.closest('a');
  if(!a)return;
  const href=a.getAttribute('href')||'';
  const ref=a.dataset.ref||document.body.dataset.ref||'';
  const segment=document.body.dataset.segment||'';
  if(/wa\.me|api\.whatsapp\.com/.test(href))window.A88_TRACK_EVENT('whatsapp_click',{ref:ref,segment:segment});
  else if(/^tel:/.test(href))window.A88_TRACK_EVENT('call_click',{ref:ref,segment:segment});
  else if(a.classList.contains('js-book')&&!a.hidden)window.A88_TRACK_EVENT('book_click',{ref:ref,segment:segment});
 });
})();
