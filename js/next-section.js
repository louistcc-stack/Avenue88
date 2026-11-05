/* Apple-style "next section" buttons on the homepage. */
(()=>{
const RM=matchMedia('(prefers-reduced-motion: reduce)');
const secs=()=>[...document.querySelectorAll('body > section')].filter(s=>!s.hidden&&s.offsetParent!==null&&!s.classList.contains('nums'));
const svg='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const headerH=()=>{const n=document.querySelector('.nav');return n?n.getBoundingClientRect().height:0};
const go=el=>{const y=el?el.getBoundingClientRect().top+scrollY-headerH()+1:0;scrollTo({top:Math.max(0,y),behavior:RM.matches?'auto':'smooth'})};
function build(){
 document.querySelectorAll('.nx').forEach(b=>b.remove());
 const S=secs();
 S.forEach((s,i)=>{const last=i===S.length-1,b=document.createElement('button');b.type='button';b.className='nx'+(last?' up':'');b.innerHTML=svg;
  b.setAttribute('aria-label',last?'Back to top':'Next section');
  b.addEventListener('click',()=>{if(last){go(null);return}const t=secs()[secs().indexOf(s)+1];go(t)});
  s.classList.add('nx-host');s.appendChild(b)});
}
const run=()=>{build();new MutationObserver(m=>{if(m.some(x=>x.attributeName==='hidden'))build()}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden']})};
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',run):run();
})();
