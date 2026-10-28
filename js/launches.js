(function(){
const WA='6580830688';
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function group(t){t=(t||'').toLowerCase();if(t.includes('executive'))return'Executive Condo';if(t.includes('landed'))return'Landed';if(t.includes('mixed')||t.includes('commer')||t.includes('condo-mixed'))return'Mixed development';return'Condo / apartment'}
function fmtDate(s){if(!s)return'';const d=new Date(s+'T00:00:00');return d.toLocaleDateString('en-SG',{month:'short',year:'numeric'})}
const badge={'Upcoming':'up','Just Launched':'new','Recently Launched':'rec'};
function card(p){
 const msg='Hi Avenue 88! Could you send me the brochure and price list for '+p.name+'?';
 const facts=[['Location',[p.district,p.address].filter(Boolean).join(' · ')],['Type',p.type],['Tenure',p.tenure],['Units',p.total_units],
  [p.status==='Upcoming'?'Launch':'Launched',p.launch_date?fmtDate(p.launch_date):(p.status==='Upcoming'?'TBC':'')],['Preview',fmtDate(p.preview_date)],['Expected TOP',p.top?p.top.slice(0,4):''],
  ['Price from',p.price_from],['PSF from',p.psf_from]].filter(f=>f[1]);
 const img=p.image?`<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" width="720" height="480">`:`<div class="nl-ph"><span>${esc(p.name)}</span></div>`;
 return `<article class="nl-card"><div class="nl-img">${img}<span class="nl-badge ${badge[p.status]}">${esc(p.status)}</span></div>
<div class="nl-body"><h3>${esc(p.name)}</h3><p class="nl-area">${esc(p.area)}</p><p class="nl-blurb">${esc(p.blurb)}</p>
<dl class="nl-facts">${facts.map(f=>`<div><dt>${esc(f[0])}</dt><dd>${esc(f[1])}</dd></div>`).join('')}</dl>
<div class="nl-actions"><a class="btn btn-navy nl-brochure" href="launches.html#contact" data-project="${esc(p.name)}">Get the brochure &amp; price list</a>
<a class="btn btn-wa" href="https://wa.me/${WA}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">WhatsApp us</a></div></div></article>`}
function prefill(name){const f=document.getElementById('enquiry');if(!f)return false;const t=f.querySelector('[name=topic]');if(t)t.value='New condo launches';
 const m=f.querySelector('[name=message]');if(m)m.value='Please send me the brochure and price list for '+name+'.';f.scrollIntoView({behavior:'smooth'});const n=f.querySelector('[name=name]');n&&setTimeout(()=>n.focus({preventScroll:true}),400);return true}
document.addEventListener('click',e=>{const a=e.target.closest('.nl-brochure');if(!a)return;
 if(document.getElementById('enquiry')&&location.pathname.endsWith('launches.html')){e.preventDefault();prefill(a.dataset.project)}
 else{a.href='launches.html?project='+encodeURIComponent(a.dataset.project)+'#contact'}});
fetch('data/launches.json').then(r=>r.json()).then(d=>{
 const P=d.projects;
 const teaser=document.getElementById('nl-teaser');
 if(teaser){const pick=P.filter(p=>p.status==='Just Launched').concat(P.filter(p=>p.status==='Upcoming')).slice(0,4);teaser.innerHTML=pick.map(card).join('');}
 const res=document.getElementById('nl-results');if(!res)return;
 const src=document.getElementById('nl-source');src.textContent='Project info sourced from Huttons, updated '+new Date(d.fetched+'T00:00:00').toLocaleDateString('en-SG',{day:'numeric',month:'short',year:'numeric'})+'. Details are indicative and subject to change.';
 const opts=(id,vals)=>{const s=document.getElementById(id);[...new Set(vals.filter(Boolean))].sort().forEach(v=>{const o=document.createElement('option');o.textContent=v;s.appendChild(o)});if(s.options.length<2)s.closest('.field').hidden=true};
 opts('nl-region',P.map(p=>p.district));opts('nl-type',P.map(p=>group(p.type)));opts('nl-tenure',P.map(p=>p.tenure));opts('nl-top',P.map(p=>p.top.slice(0,4)));
 const f=document.getElementById('nl-form'),cnt=document.getElementById('nl-count');
 function run(){const q=f.q.value.trim().toLowerCase(),r=f.region.value,s=f.status.value,t=f.type.value,te=f.tenure.value,y=f.top.value;
  const out=P.filter(p=>(!q||[p.name,p.address,p.area,p.district].join(' ').toLowerCase().includes(q))&&(!r||p.district===r)&&(!s||p.status===s)&&(!t||group(p.type)===t)&&(!te||p.tenure===te)&&(!y||p.top.startsWith(y)));
  cnt.textContent=out.length+' of '+P.length+' launches';res.innerHTML=out.length?out.map(card).join(''):'<p class="nl-empty">Nothing matches yet. Try clearing a filter, or WhatsApp us and we\'ll check for you.</p>'}
 f.addEventListener('input',run);f.addEventListener('change',run);f.addEventListener('submit',e=>{e.preventDefault();run()});
 document.getElementById('nl-reset').addEventListener('click',()=>{f.reset();run()});run();
 const qp=new URLSearchParams(location.search).get('project');if(qp)setTimeout(()=>prefill(qp),300);
}).catch(()=>{const c=document.getElementById('nl-count');if(c)c.textContent='Launches could not load right now. WhatsApp us on 8083 0688.'});
})();
