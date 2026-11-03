(function(){
const WA='6580830688';
const VIEWS=['pipeline','grid','list','map'];
const STATUS_ORDER=['Upcoming','Preview','Just Launched','Selling','Sold Out','Recently Launched'];
const PRICE_BANDS=[
 ['','Any price'],
 ['lt','Under $1.5m'],
 ['mid','$1.5m – $2.5m'],
 ['hi','$2.5m and above'],
 ['none','Not listed']
];
let projects=[], view='pipeline', status='', picks=[], map, mapReady, mapFailed, popup, lastFiltered=[], flyId=null;

function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function money(s){const n=parseInt(String(s||'').replace(/[^0-9]/g,''),10);return Number.isFinite(n)&&n>0?n:null}
function fmtDay(s){
 if(!s)return'';
 const d=new Date(s+'T00:00:00');
 if(Number.isNaN(d.getTime()))return'';
 return d.toLocaleDateString('en-SG',{day:'numeric',month:'short',year:'numeric'});
}
function monthKey(p){
 const src=p.launch_date||p.preview_date||'';
 return /^\d{4}-\d{2}/.test(src)?src.slice(0,7):'TBC';
}
function monthLabel(key){
 if(key==='TBC')return'TBC';
 const names=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
 const [y,m]=key.split('-');
 return (names[+m-1]||key)+' '+y;
}
function topYear(p){return /^\d{4}/.test(p.top||'')?p.top.slice(0,4):''}
function statusClass(s){
 return {Upcoming:'st-up',Preview:'st-pre','Just Launched':'st-new',Selling:'st-sell','Sold Out':'st-out','Recently Launched':'st-rec'}[s]||'st-rec';
}
function hasPoint(p){return Number.isFinite(p.lat)&&Number.isFinite(p.lng)}
function waHref(text){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(text)}
function byId(id){return projects.find(p=>p.id===id)}

function readUrl(){
 const q=new URLSearchParams(location.search);
 const v=q.get('view');
 if(VIEWS.includes(v))view=v;
 picks=(q.get('compare')||'').split(',').map(s=>s.trim()).filter(Boolean).slice(0,3);
}
function writeUrl(){
 const u=new URL(location.href);
 if(picks.length)u.searchParams.set('compare',picks.join(','));else u.searchParams.delete('compare');
 if(view!=='pipeline')u.searchParams.set('view',view);else u.searchParams.delete('view');
 history.replaceState(null,'',u);
}

function el(tag,cls,text){
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(text!=null)n.textContent=text;
 return n;
}
function imgOrPh(p,cls){
 if(p.image&&/^(img\/|https:\/\/)/.test(p.image)){
  const img=document.createElement('img');
  img.src=p.image;img.alt=p.name||'';img.loading='lazy';
  if(cls)img.className=cls;
  return img;
 }
 return el('div',cls||'nl-ph',p.name||'');
}
function badge(p){
 if(!p.status)return null;
 const b=el('span','nl-badge '+statusClass(p.status),p.status);
 return b;
}
function compareBtn(p){
 const b=el('button','nl-mini nl-cmp');
 b.type='button';b.dataset.id=p.id;
 const on=picks.includes(p.id);
 b.setAttribute('aria-pressed',on?'true':'false');
 b.textContent=on?'Added':'+ Compare';
 b.disabled=!on&&picks.length>=3;
 b.addEventListener('click',()=>togglePick(p.id));
 return b;
}
function mapBtn(p){
 if(!hasPoint(p))return null;
 const b=el('button','nl-mini nl-mapbtn','View on map');
 b.type='button';
 b.addEventListener('click',()=>showOnMap(p.id));
 return b;
}
function brochure(p){
 const a=el('a','btn btn-navy nl-mini nl-brochure','Brochure');
 a.href='launches.html#contact';
 a.dataset.project=p.name||'';
 return a;
}
function whatsapp(p){
 const a=el('a','btn btn-wa nl-mini','WhatsApp');
 a.href=waHref('Hi Avenue 88! Could you send me the brochure and price list for '+(p.name||'this launch')+'?');
 a.target='_blank';a.rel='noopener';
 return a;
}
function actions(p){
 const box=el('div','nl-actions');
 [compareBtn(p),mapBtn(p),brochure(p),whatsapp(p)].forEach(n=>{if(n)box.append(n)});
 return box;
}
function facts(p){
 const rows=[
  ['Location',[p.district,p.address].filter(Boolean).join(' · ')],
  ['Type',p.type],
  ['Launch',p.launch_date?fmtDay(p.launch_date):'TBC'],
  ['Preview',fmtDay(p.preview_date)],
  ['TOP',topYear(p)],
  ['Price from',p.price_from],
  ['PSF from',p.psf_from]
 ];
 if(p.tenure)rows.push(['Tenure',p.tenure]);
 if(p.total_units)rows.push(['Units',p.total_units]);
 const dl=el('dl','nl-facts');
 rows.filter(r=>r[1]).forEach(([k,v])=>{
  const d=el('div');
  d.append(el('dt',null,k),el('dd',null,v));
  dl.append(d);
 });
 return dl;
}
function card(p){
 const art=el('article','nl-card');
 art.dataset.id=p.id;
 const media=el('div','nl-img');
 media.append(imgOrPh(p));
 const b=badge(p);if(b)media.append(b);
 const body=el('div','nl-body');
 body.append(el('h3',null,p.name||''),el('p','nl-area',p.area||''),facts(p),actions(p));
 art.append(media,body);
 return art;
}
function row(p){
 const art=el('article','nl-row');
 art.dataset.id=p.id;
 const thumb=el('div','nl-img nl-thumb');
 thumb.append(imgOrPh(p));
 const b=badge(p);if(b)thumb.append(b);
 art.append(thumb);
 const mid=el('div');
 mid.append(el('h3',null,p.name||''));
 const bits=[p.area||p.district,p.status,monthLabel(monthKey(p))].filter(Boolean);
 mid.append(el('p',null,bits.join(' · ')));
 const side=el('div','nl-side');
 if(p.price_from)side.append(el('div','nl-price',p.price_from));
 side.append(actions(p));
 art.append(mid,side);
 return art;
}

function filtered(){
 const f=document.getElementById('nl-form');
 const q=(f.q.value||'').trim().toLowerCase();
 const region=f.region.value, district=f.district.value, price=f.price.value, year=f.top.value;
 return projects.filter(p=>{
  if(q&&![p.name,p.address,p.area,p.district].join(' ').toLowerCase().includes(q))return false;
  if(region&&p.region_group!==region)return false;
  if(district&&p.district!==district)return false;
  if(status&&p.status!==status)return false;
  if(year&&topYear(p)!==year)return false;
  const n=money(p.price_from);
  if(price==='none'&&n)return false;
  if(price==='lt'&&!(n&&n<1500000))return false;
  if(price==='mid'&&!(n&&n>=1500000&&n<2500000))return false;
  if(price==='hi'&&!(n&&n>=2500000))return false;
  return true;
 });
}
function nowKey(){
 const d=new Date();
 return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
}
function groupMonths(list){
 const buckets=new Map();
 list.forEach(p=>{
  const k=monthKey(p);
  if(!buckets.has(k))buckets.set(k,[]);
  buckets.get(k).push(p);
 });
 const now=nowKey();
 const forward=[], tbc=[], past=[];
 [...buckets.keys()].sort().forEach(k=>{
  const row=[k,buckets.get(k)];
  if(k==='TBC')tbc.push(row);
  else if(k>=now)forward.push(row);
  else past.push(row);
 });
 return {forward,tbc,past};
}
function monthBlock(key,items){
 const sec=el('section','nl-month');
 sec.append(el('h2',null,monthLabel(key)));
 const grid=el('div','nl-grid');
 items.forEach(p=>grid.append(card(p)));
 sec.append(grid);
 return sec;
}

function render(){
 const out=filtered();
 lastFiltered=out;
 const cnt=document.getElementById('nl-count');
 cnt.textContent=out.length+' of '+projects.length+' launches';
 const host=document.getElementById('nl-results');
 const wrap=document.getElementById('nl-map-wrap');
 document.querySelectorAll('.nl-views button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===view?'true':'false'));
 if(view==='map'){
  host.hidden=true;wrap.hidden=false;
  ensureMap().then(()=>syncMap(out)).catch(()=>{});
 }else{
  wrap.hidden=true;host.hidden=false;
  host.replaceChildren();
  if(!out.length){host.append(el('p','nl-empty','Nothing matches. Clear a filter, or WhatsApp us.'));paintBar();return}
  if(view==='list')out.forEach(p=>host.append(row(p)));
  else if(view==='grid'){
   const grid=el('div','nl-grid');
   out.forEach(p=>grid.append(card(p)));
   host.append(grid);
  }else{
   const groups=groupMonths(out);
   groups.forward.concat(groups.tbc).forEach(([key,items])=>host.append(monthBlock(key,items)));
   if(groups.past.length){
    const box=el('details','nl-earlier');
    box.append(el('summary',null,'Launched earlier'));
    groups.past.forEach(([key,items])=>box.append(monthBlock(key,items)));
    host.append(box);
   }
  }
 }
 paintBar();
}
function setView(next){
 if(!VIEWS.includes(next))return;
 view=next;writeUrl();render();
 if(view==='map')document.getElementById('nl-map-wrap').scrollIntoView({behavior:'smooth',block:'start'});
}

function togglePick(id){
 const i=picks.indexOf(id);
 if(i>=0)picks.splice(i,1);
 else if(picks.length<3)picks.push(id);
 writeUrl();
 document.querySelectorAll('.nl-cmp').forEach(btn=>{
  const on=picks.includes(btn.dataset.id);
  btn.setAttribute('aria-pressed',on?'true':'false');
  btn.textContent=on?'Added':'+ Compare';
  btn.disabled=!on&&picks.length>=3;
 });
 paintBar();
}
function paintBar(){
 const bar=document.getElementById('nl-compare-bar');
 if(!picks.length){bar.hidden=true;document.body.classList.remove('has-compare');return}
 bar.hidden=false;document.body.classList.add('has-compare');
 const names=picks.map(id=>(byId(id)||{}).name).filter(Boolean);
 document.getElementById('nl-compare-names').textContent=names.join(' · ');
 const open=document.getElementById('nl-compare-open');
 open.disabled=picks.length<2;
}
function compareRows(list){
 const rows=[
  ['Price from',p=>p.price_from],
  ['PSF from',p=>p.psf_from],
  ['District',p=>p.area||p.district],
  ['Type',p=>p.type],
  ['Launch',p=>fmtDay(p.launch_date)||'TBC'],
  ['Preview',p=>fmtDay(p.preview_date)],
  ['TOP',p=>topYear(p)]
 ];
 if(list.some(p=>p.tenure))rows.push(['Tenure',p=>p.tenure]);
 if(list.some(p=>p.total_units))rows.push(['Units',p=>p.total_units]);
 return rows;
}
function openCompare(){
 const list=picks.map(byId).filter(Boolean);
 if(list.length<2)return;
 const table=document.getElementById('nl-compare-table');
 table.replaceChildren();
 const head=document.createElement('tr');
 head.append(el('th'));
 list.forEach(p=>head.append(el('th',null,p.name||'')));
 table.append(head);
 compareRows(list).forEach(([label,get])=>{
  const tr=document.createElement('tr');
  tr.append(el('td',null,label));
  list.forEach(p=>tr.append(el('td',null,get(p)||'—')));
  table.append(tr);
 });
 const names=list.map(p=>p.name).filter(Boolean).join(', ');
 document.getElementById('nl-compare-wa').href=waHref('Hi Avenue 88! I would like to compare these launches: '+names+'.');
 document.getElementById('nl-compare').hidden=false;
 document.getElementById('nl-compare-close').focus();
}
function closeCompare(){document.getElementById('nl-compare').hidden=true}

function failMap(){
 mapFailed=true;
 document.getElementById('nl-map').hidden=true;
 const note=document.getElementById('nl-map-fallback');
 note.hidden=false;
 view='list';writeUrl();render();
}
function loadLib(){
 if(window.maplibregl)return Promise.resolve();
 if(mapReady)return mapReady;
 mapReady=new Promise((res,rej)=>{
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
  document.head.append(css);
  const s=document.createElement('script');
  s.src='https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
  s.onload=()=>res();
  s.onerror=()=>rej(new Error('maplibre'));
  document.head.append(s);
 });
 return mapReady;
}
function ensureMap(){
 if(mapFailed)return Promise.reject();
 return loadLib().then(()=>{
  if(map){map.resize();return}
  if(!window.maplibregl||!document.createElement('canvas').getContext('webgl')){failMap();return}
  map=new maplibregl.Map({
   container:'nl-map',
   style:'https://tiles.openfreemap.org/styles/dark',
   center:[103.8198,1.3521],
   zoom:10.8,
   pitch:58,
   bearing:-17,
   maxPitch:70,
   attributionControl:true
  });
  map.addControl(new maplibregl.NavigationControl({visualizePitch:true}),'top-right');
  map.on('load',()=>{
   const layers=map.getStyle().layers||[];
   const symbol=layers.find(l=>l.type==='symbol');
   if(map.getSource('openmaptiles')){
    map.addLayer({
     id:'a88-buildings',type:'fill-extrusion',source:'openmaptiles','source-layer':'building',minzoom:13,
     paint:{
      'fill-extrusion-color':'#243056',
      'fill-extrusion-height':['interpolate',['linear'],['zoom'],13,0,14,['coalesce',['get','render_height'],['get','height'],8]],
      'fill-extrusion-base':['coalesce',['get','render_min_height'],0],
      'fill-extrusion-opacity':0.85
     }
    },symbol&&symbol.id);
   }
   map.addSource('projects',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
   map.addLayer({id:'pins',type:'circle',source:'projects',paint:{
    'circle-radius':['interpolate',['linear'],['zoom'],9,8,12,11,15,15],
    'circle-color':'#D69F1A','circle-stroke-width':2,'circle-stroke-color':'#05081c'
   }});
   map.addLayer({id:'pin-labels',type:'symbol',source:'projects',minzoom:13,layout:{
    'text-field':['get','name'],
    'text-font':['Noto Sans Regular'],
    'text-size':13,
    'text-offset':[0,1.05],
    'text-anchor':'top',
    'text-max-width':12,
    'text-optional':true
   },paint:{
    'text-color':'#ffffff','text-halo-color':'#05081c','text-halo-width':1.5
   }});
   const openPin=e=>{
    const id=e.features&&e.features[0]&&e.features[0].properties.id;
    if(id)openPopup(id);
   };
   map.on('click','pins',openPin);
   map.on('click','pin-labels',openPin);
   ['pins','pin-labels'].forEach(layer=>{
    map.on('mouseenter',layer,()=>{map.getCanvas().style.cursor='pointer'});
    map.on('mouseleave',layer,()=>{map.getCanvas().style.cursor=''});
   });
   syncMap(lastFiltered);
   if(flyId){const id=flyId;flyId=null;openPopup(id)}
  });
 }).catch(()=>{failMap()});
}
function syncMap(list){
 const note=document.getElementById('nl-unmapped');
 const missing=list.filter(p=>!hasPoint(p)).length;
 note.textContent=missing?missing+' in this list '+ (missing===1?'has':'have')+' no map point yet.':'';
 if(!map||!map.getSource('projects'))return;
 map.getSource('projects').setData({
  type:'FeatureCollection',
  features:list.filter(hasPoint).map(p=>({
   type:'Feature',
   geometry:{type:'Point',coordinates:[p.lng,p.lat]},
   properties:{id:p.id,name:p.name||''}
  }))
 });
 map.resize();
}
function openPopup(id){
 const p=byId(id);if(!p||!hasPoint(p))return;
 if(!map||!map.getSource('projects')){flyId=id;return}
 if(popup)popup.remove();
 const root=el('div');
 root.append(el('h3',null,p.name||''));
 const bits=[p.status,p.area||p.district,p.price_from].filter(Boolean);
 root.append(el('p',null,bits.join(' · ')));
 root.append(actions(p));
 popup=new maplibregl.Popup({offset:16,className:'nl-pop',maxWidth:'280px'})
  .setLngLat([p.lng,p.lat]).setDOMContent(root).addTo(map);
 map.flyTo({center:[p.lng,p.lat],zoom:16,pitch:62,bearing:-20,essential:true});
}
function showOnMap(id){
 view='map';writeUrl();render();
 document.getElementById('nl-map-wrap').scrollIntoView({behavior:'smooth',block:'center'});
 ensureMap().then(()=>openPopup(id)).catch(()=>{});
}

function fillSelect(id,values){
 const s=document.getElementById(id);
 [...new Set(values.filter(Boolean))].sort().forEach(v=>{
  const o=document.createElement('option');o.value=v;o.textContent=v;s.append(o);
 });
}
function fillChips(){
 const host=document.getElementById('nl-chips');
 const found=[...new Set(projects.map(p=>p.status).filter(Boolean))];
 found.sort((a,b)=>(STATUS_ORDER.indexOf(a)+1||99)-(STATUS_ORDER.indexOf(b)+1||99));
 host.replaceChildren();
 const all=el('button',null,'All');all.type='button';all.dataset.status='';
 host.append(all);
 found.forEach(s=>{const b=el('button',null,s);b.type='button';b.dataset.status=s;host.append(b)});
 host.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  status=b.dataset.status||'';
  [...host.children].forEach(n=>n.setAttribute('aria-pressed',n===b?'true':'false'));
  render();
 });
 all.click();
}
function prefill(name){
 const f=document.getElementById('enquiry');if(!f)return;
 const t=f.querySelector('[name=topic]');if(t)t.value='New condo launches';
 const m=f.querySelector('[name=message]');if(m)m.value='Please send me the brochure and price list for '+name+'.';
 f.scrollIntoView({behavior:'smooth'});
 const n=f.querySelector('[name=name]');if(n)setTimeout(()=>n.focus({preventScroll:true}),400);
}
document.addEventListener('click',e=>{
 const a=e.target.closest('.nl-brochure');if(!a)return;
 if(document.getElementById('enquiry')&&location.pathname.endsWith('launches.html')){e.preventDefault();prefill(a.dataset.project)}
});

readUrl();
document.querySelectorAll('[data-open-view]').forEach(b=>b.addEventListener('click',e=>{
 e.preventDefault();setView(b.dataset.openView);
}));
document.querySelectorAll('.nl-views button').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
document.getElementById('nl-compare-open').addEventListener('click',openCompare);
document.getElementById('nl-compare-clear').addEventListener('click',()=>{picks=[];writeUrl();render()});
document.getElementById('nl-compare-close').addEventListener('click',closeCompare);
document.getElementById('nl-compare').addEventListener('click',e=>{if(e.target.id==='nl-compare')closeCompare()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCompare()});

fetch('data/launches.json',{cache:'no-cache'}).then(r=>r.json()).then(d=>{
 projects=d.projects||[];
 picks=picks.filter(id=>projects.some(p=>p.id===id));
 const src=document.getElementById('nl-source');
 const when=d.fetched?new Date(d.fetched+'T00:00:00').toLocaleDateString('en-SG',{day:'numeric',month:'short',year:'numeric'}):'';
 src.textContent='Project info sourced from Huttons'+(when?', updated '+when:'')+'. Details are indicative and subject to change. Map points are from OneMap where a match was found.';
 fillSelect('nl-region',projects.map(p=>p.region_group));
 fillSelect('nl-district',projects.map(p=>p.district));
 fillSelect('nl-top',projects.map(topYear));
 const price=document.getElementById('nl-price');
 PRICE_BANDS.forEach(([v,label])=>{const o=document.createElement('option');o.value=v;o.textContent=label;price.append(o)});
 fillChips();
 const f=document.getElementById('nl-form');
 f.addEventListener('input',render);
 f.addEventListener('change',render);
 f.addEventListener('submit',e=>{e.preventDefault();render()});
 document.getElementById('nl-reset').addEventListener('click',()=>{
  f.reset();status='';
  document.querySelectorAll('#nl-chips button').forEach((b,i)=>b.setAttribute('aria-pressed',i===0?'true':'false'));
  render();
 });
 render();
 if(picks.length>=2)openCompare();
 const project=new URLSearchParams(location.search).get('project');
 if(project)setTimeout(()=>prefill(project),300);
}).catch(()=>{document.getElementById('nl-count').textContent='Launches could not load right now. WhatsApp us on 8083 0688.'});
})();
