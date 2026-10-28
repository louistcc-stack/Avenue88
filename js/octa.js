// Octa Score example widget. DRAFT framework for Louis to confirm. Example values are fictional.
(function(){
const P=[['Getting Around','How easily you get to work, school and town by train, bus and road.',82],
['Daily Conveniences','Food, groceries, clinics and parks you can reach on foot.',76],
['Family Fit','Schools, childcare and family-friendly facilities nearby.',70],
['Price Check','How the asking price stacks up against similar homes nearby.',68],
['Smart Layout','How much of the space you pay for is actually usable and liveable.',85],
['Home Environment','Facing, noise, views, greenery and the feel of the estate.',80],
['Rental Appeal','How easily the unit would find good tenants if you rent it out.',74],
['Resale Runway','How deep the future buyer pool is and how much competing supply is coming.',79]];
const NS='http://www.w3.org/2000/svg',C=160,R=120;
const pt=(i,r)=>{const a=(-90+45*i)*Math.PI/180;return [C+r*Math.cos(a),C+r*Math.sin(a)]};
const poly=f=>P.map((p,i)=>pt(i,f(p,i)).map(n=>n.toFixed(1)).join(',')).join(' ');
const band=t=>t>=80?'Standout':t>=65?'Strong':t>=50?'Mixed':'Think twice';
function draw(svg,labels){let h='';for(const k of [.25,.5,.75,1])h+=`<polygon points="${poly(()=>R*k)}" class="grid"/>`;
 P.forEach((p,i)=>{const [x,y]=pt(i,R);h+=`<line x1="${C}" y1="${C}" x2="${x}" y2="${y}" class="spoke"/>`;
 if(labels){const [lx,ly]=pt(i,R+22);h+=`<text x="${lx}" y="${ly}" class="lbl" text-anchor="middle" dominant-baseline="middle">${i+1}</text>`}});
 h+=`<polygon points="${poly(p=>R*p[2]/100)}" class="shape"/>`;svg.innerHTML=h}
function update(){const t=Math.round(P.reduce((s,p)=>s+p[2],0)/8);
 document.querySelectorAll('.octa-radar').forEach(s=>draw(s,s.classList.contains('big')));
 document.querySelectorAll('[data-total]').forEach(e=>e.textContent=t);
 document.querySelectorAll('[data-band]').forEach(e=>e.textContent=band(t))}
const list=document.getElementById('pillar-list');
P.forEach((p,i)=>{const li=document.createElement('li');
 li.innerHTML=`<div class="ph"><b>${i+1}. ${p[0]}</b><output>${p[2]}</output></div><p>${p[1]}</p><input type="range" min="0" max="100" value="${p[2]}" aria-label="${p[0]} example score">`;
 const r=li.querySelector('input'),o=li.querySelector('output');r.addEventListener('input',()=>{p[2]=+r.value;o.textContent=r.value;update()});list.appendChild(li)});
update();
})();
