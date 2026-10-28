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
