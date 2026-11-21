/* Apple-style "next section" buttons on the homepage. */
(()=>{
const RM=matchMedia('(prefers-reduced-motion: reduce)');
const secs=()=>[...document.querySelectorAll('body > section, main > section')].filter(s=>!s.hidden&&s.offsetParent!==null&&!s.classList.contains('nums'));
const svg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const headerH=()=>{const n=document.querySelector('.nav');return n?n.getBoundingClientRect().height:0};
const go=el=>{const y=el?el.getBoundingClientRect().top+scrollY-headerH()+1:0;scrollTo({top:Math.max(0,y),behavior:RM.matches?'auto':'smooth'})};
/* At most three arrows per page: the opening section, one mid-page, and back to top.
   A page can choose its two "next" arrows by adding data-nx to those sections. */
function picks(S){
 const ok=S.filter(s=>!s.classList.contains('press'));
 if(!ok.length)return [];
 const last=ok[ok.length-1];
 const marked=ok.filter(s=>s.hasAttribute('data-nx')&&s!==last);
 const two=marked.length?marked.slice(0,2):[ok[0],ok[Math.floor((ok.length-1)/2)]];
 return [...new Set([...two.filter(s=>s!==last),last])];
}
function build(){
 document.querySelectorAll('.nx').forEach(b=>b.remove());
 document.querySelectorAll('.nx-host').forEach(s=>s.classList.remove('nx-host'));
 const S=secs(),P=picks(S),lastSec=P[P.length-1];
 P.forEach(s=>{
  const last=s===lastSec,b=document.createElement('button');b.type='button';b.className='nx'+(last?' up':'');b.innerHTML=svg;
  b.setAttribute('aria-label',last?'Back to top':'Next section');
  b.addEventListener('click',()=>{if(last){go(null);return}const all=secs();go(all[all.indexOf(s)+1])});
  s.classList.add('nx-host');s.appendChild(b)});
}
function dodge(){
 const fl=document.querySelector('.wa-float');
 if(!fl)return;
 const fb=fl.getBoundingClientRect();
 document.querySelectorAll('.nx').forEach(btn=>{
  btn.style.bottom='';
  const b=btn.getBoundingClientRect();
  const overlap=!(b.right<fb.left-1||fb.right<b.left-1||b.bottom<fb.top-1||fb.bottom<b.top-1);
  if(!overlap)return;
  const lift=Math.ceil(b.bottom-fb.top+12);
  const base=parseFloat(getComputedStyle(btn).bottom)||20;
  btn.style.bottom=(base+lift)+'px';
 });
}
const run=()=>{build();dodge();new MutationObserver(m=>{if(m.some(x=>x.attributeName==='hidden')){build();dodge()}}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']});addEventListener('scroll',dodge,{passive:true});addEventListener('resize',dodge)};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',run):run();
})();
