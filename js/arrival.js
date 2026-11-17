/* The Arrival: greeting, opening doors, lobby slideshow, parallax and scroll depth. */
(()=>{
const root=document.documentElement;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const lobby=document.getElementById('lobby');
const arrival=document.getElementById('arrival');
if(!lobby)return;

/* Time-of-day greeting, in the visitor's own clock */
const h=new Date().getHours();
const greet=h<5?'Good evening':h<12?'Good morning':h<18?'Good afternoon':'Good evening';
document.querySelectorAll('[data-greet]').forEach(el=>el.textContent=greet);

/* Keep the gold frame clear of the fixed header */
const nav=document.querySelector('.nav');
const setNavH=()=>nav&&lobby.style.setProperty('--navh',nav.getBoundingClientRect().height+'px');
setNavH();addEventListener('resize',setNavH);

/* Opening doors, once per browser session */
function finish(){
 if(!root.classList.contains('arriving'))return;
 try{sessionStorage.setItem('a88-arrived','1')}catch(e){}
 arrival.classList.add('open');
 setTimeout(()=>{root.classList.remove('arriving');arrival.remove()},2000);
}
if(root.classList.contains('arriving')&&arrival){
 const t=setTimeout(finish,2300);
 const skip=()=>{clearTimeout(t);finish()};
 arrival.addEventListener('click',skip);
 addEventListener('keydown',skip,{once:true});
}else if(arrival){arrival.remove()}

/* Lobby slideshow: slow crossfade between the team photos */
const imgs=[...lobby.querySelectorAll('.lobby-img')];
const dots=[...lobby.querySelectorAll('.lobby-dots i')];
let i=0;
if(!RM&&imgs.length>1){
 setInterval(()=>{
  if(document.hidden)return;
  const prev=imgs[i];i=(i+1)%imgs.length;const next=imgs[i];
  next.style.animation='none';void next.offsetWidth;next.style.animation='';
  next.classList.add('is-on');prev.classList.remove('is-on');
  dots.forEach((d,k)=>d.classList.toggle('on',k===i));
 },8000);
}

if(RM)return;
/* Gentle parallax: the room shifts as the pointer moves */
const stage=lobby.querySelector('.lobby-stage');
let tx=0,ty=0,cx=0,cy=0,raf=0;
lobby.addEventListener('pointermove',e=>{
 if(e.pointerType!=='mouse')return;
 const r=lobby.getBoundingClientRect();
 tx=((e.clientX-r.left)/r.width-.5)*-18;
 ty=((e.clientY-r.top)/r.height-.5)*-12;
 if(!raf)raf=requestAnimationFrame(loop);
});
function loop(){
 cx+=(tx-cx)*.06;cy+=(ty-cy)*.06;
 stage.style.setProperty('--px',cx.toFixed(2)+'px');stage.style.setProperty('--py',cy.toFixed(2)+'px');
 raf=Math.abs(tx-cx)+Math.abs(ty-cy)>.05?requestAnimationFrame(loop):0;
}

/* Scroll depth: you walk past the desk and into the house */
const copy=lobby.querySelector('.lobby-copy'),desk=lobby.querySelector('.concierge');
const wide=matchMedia('(min-width:901px)');
desk.addEventListener('animationend',()=>{desk.style.animation='none';desk.style.opacity='1';desk.style.transform='none';onScroll()},{once:true});
function onScroll(){
 const p=Math.min(1,Math.max(0,scrollY/lobby.offsetHeight));
 stage.style.setProperty('--zoom',(1+p*.12).toFixed(3));
 if(!wide.matches){copy.style.transform=desk.style.transform='';copy.style.opacity='';return}
 copy.style.transform=`translateY(${-p*90}px)`;copy.style.opacity=String(1-p*1.6);
 desk.style.transform=`translateY(${-p*50}px)`;desk.style.opacity=String(1-p*1.8);
}
addEventListener('scroll',()=>requestAnimationFrame(onScroll),{passive:true});
})();
