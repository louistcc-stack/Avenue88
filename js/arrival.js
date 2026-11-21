/* The Arrival: greeting, opening doors, lobby film, parallax and scroll depth. */
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
 setTimeout(play,350);
 setTimeout(()=>{root.classList.remove('arriving');arrival.remove()},2000);
}
if(root.classList.contains('arriving')&&arrival){
 const t=setTimeout(finish,2300);
 const skip=()=>{clearTimeout(t);finish()};
 arrival.addEventListener('click',skip);
 addEventListener('keydown',skip,{once:true});
}else if(arrival){arrival.remove()}

/* Lobby film: waits for the doors, respects reduced motion, can be paused */
const video=document.getElementById('lobby-video');
const playBtn=document.getElementById('lobby-play');
const setBtn=paused=>{if(!playBtn)return;playBtn.setAttribute('aria-pressed',String(paused));playBtn.querySelector('.lbl').textContent=paused?'Play video':'Pause video'};
let userPaused=RM;
function play(){if(!video||userPaused)return;const p=video.play();if(p&&p.catch)p.catch(()=>setBtn(true))}
if(video){
 if(RM||root.classList.contains('arriving')){video.removeAttribute('autoplay');video.pause();video.currentTime=0}
 setBtn(RM);
 playBtn&&playBtn.addEventListener('click',()=>{
  if(video.paused){userPaused=false;setBtn(false);play()}else{userPaused=true;video.pause();setBtn(true)}
 });
 document.addEventListener('visibilitychange',()=>{document.hidden?video.pause():play()});
 if(!root.classList.contains('arriving'))play();
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
