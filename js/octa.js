// Octa Score example widget. PROPERTY pillars. Scores are for fictional Sample Residences only.
(function(){
const P=[
{letter:'P',name:'Proximity',lines:['Proximity'],blurb:'How close the project sits to an MRT, because an easier trip pulls in more tenants and buyers.',score:86},
{letter:'R',name:'Remaining Lease',lines:['Remaining','Lease'],blurb:'How many years are left on the lease, and how new the place still feels.',score:76},
{letter:'O',name:'Owner Upgraders',lines:['Owner','Upgraders'],blurb:'How big the nearby HDB upgrader pool is, which helps the next buyer show up.',score:82},
{letter:'P',name:'Primary Schools',lines:['Primary','Schools'],blurb:'How handy popular primary schools are for families weighing up the home.',score:70},
{letter:'E',name:'Estate Growth',lines:['Estate','Growth'],blurb:'Whether it sits in a URA growth area that still has a longer-term plan ahead.',score:78},
{letter:'R',name:'Release of Land',lines:['Release','of Land'],blurb:'Upcoming government land sales nearby that can give surrounding prices a lift.',score:64},
{letter:'T',name:'Total Units',lines:['Total','Units'],blurb:'How big the project is, which shapes the facilities, resale liquidity and name recognition.',score:90},
{letter:'Y',name:'Yield',lines:['Yield'],blurb:'What kind of rental yield homes in the area are actually throwing off.',score:78}];
const band=t=>t>=80?'Standout':t>=65?'Strong':t>=50?'Mixed':'Think twice';
function geom(big){return big?{C:260,R:118}:{C:160,R:120}}
function pt(i,r,C){const a=(-90+45*i)*Math.PI/180;return [C+r*Math.cos(a),C+r*Math.sin(a)]}
function poly(big,f){const {C,R}=geom(big);return P.map((p,i)=>pt(i,f(p,i,R),C).map(n=>n.toFixed(1)).join(',')).join(' ')}
function labels(big){
 const {C,R}=geom(big);
 let h='';
 P.forEach((p,i)=>{
  const a=(-90+45*i)*Math.PI/180, ux=Math.cos(a), uy=Math.sin(a);
  let x=C+(R+24)*ux, y=C+(R+24)*uy;
  const anchor=Math.abs(ux)<0.4?'middle':(ux>0?'start':'end');
  if(anchor==='start')x+=6;
  if(anchor==='end')x-=6;
  const rows=[p.letter].concat(p.lines), lh=20, block=(rows.length-1)*lh;
  let y0;
  if(uy<-0.4)y0=y-block;
  else if(uy>0.4)y0=y+13;
  else y0=y-block/2;
  rows.forEach((row,ri)=>{
   const cls=ri===0?'lbl-letter':'lbl-name';
   h+=`<text x="${x.toFixed(1)}" y="${(y0+ri*lh).toFixed(1)}" class="${cls}" text-anchor="${anchor}">${row}</text>`;
  });
 });
 return h;
}
function draw(svg){
 const big=svg.classList.contains('big');
 const {C,R}=geom(big);
 let h='';
 for(const k of [.25,.5,.75,1])h+=`<polygon points="${poly(big,()=>R*k)}" class="grid"/>`;
 P.forEach((p,i)=>{const [x,y]=pt(i,R,C);h+=`<line x1="${C}" y1="${C}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" class="spoke"/>`});
 h+=`<polygon points="${poly(big,(p)=>R*p.score/100)}" class="shape"/>`;
 if(big)h+=labels(true);
 svg.innerHTML=h;
 if(big){
  svg.setAttribute('aria-label','Example Octa Score chart for fictional Sample Residences. '+P.map(p=>p.letter+' '+p.name+' '+p.score).join(', '));
  const pad=16;
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  svg.querySelectorAll('text,polygon').forEach(el=>{
   const b=el.getBBox();
   if(!isFinite(b.x)||(b.width===0&&b.height===0))return;
   minX=Math.min(minX,b.x);minY=Math.min(minY,b.y);
   maxX=Math.max(maxX,b.x+b.width);maxY=Math.max(maxY,b.y+b.height);
  });
  svg.setAttribute('viewBox',`${(minX-pad).toFixed(1)} ${(minY-pad).toFixed(1)} ${(maxX-minX+pad*2).toFixed(1)} ${(maxY-minY+pad*2).toFixed(1)}`);
 }
}
function update(){
 const t=Math.round(P.reduce((s,p)=>s+p.score,0)/8);
 document.querySelectorAll('.octa-radar').forEach(draw);
 document.querySelectorAll('[data-total]').forEach(e=>e.textContent=t);
 document.querySelectorAll('[data-band]').forEach(e=>e.textContent=band(t));
}
const list=document.getElementById('pillar-list');
P.forEach(p=>{
 const li=document.createElement('li');
 li.innerHTML=`<div class="ph"><b><span class="pletter" aria-hidden="true">${p.letter}</span> ${p.name}</b><output>${p.score}</output></div><p>${p.blurb}</p><input type="range" min="0" max="100" value="${p.score}" aria-label="${p.name} example score">`;
 const r=li.querySelector('input'),o=li.querySelector('output');
 r.addEventListener('input',()=>{p.score=+r.value;o.textContent=r.value;update()});
 list.appendChild(li);
});
update();
})();
