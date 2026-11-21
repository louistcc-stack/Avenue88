/* Homepage extras: key figures count up, live upgrade calculator, Octa demo reveal. */
(()=>{
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const seen=(el,fn,threshold=.35)=>{
 if(!el)return;
 if(!('IntersectionObserver' in window)){fn();return}
 const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();fn()}},{threshold});
 io.observe(el);
};

/* 1. Key figures run up from zero when they come into view */
function countUp(b){
 const node=[...b.childNodes].find(n=>n.nodeType===3&&/\d/.test(n.nodeValue));
 if(!node)return;
 const m=node.nodeValue.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
 if(!m)return;
 const [,pre,num,post]=m;
 const target=parseFloat(num.replace(/,/g,'')),dec=(num.split('.')[1]||'').length,dur=1800,t0=performance.now();
 const fmt=v=>pre+v.toLocaleString('en-SG',{minimumFractionDigits:dec,maximumFractionDigits:dec})+post;
 (function tick(t){
  const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,4);
  node.nodeValue=fmt(target*e);
  if(p<1)requestAnimationFrame(tick);
  else node.nodeValue=b.a88Final||fmt(target); /* data that arrived mid-count wins */
 })(t0);
}
const nums=document.querySelector('.nums');
if(nums&&!RM){
 const bs=[...nums.querySelectorAll('b')];
 seen(nums,()=>bs.forEach(countUp));
}

/* 2. Live "Can I upgrade?" figure */
const form=document.getElementById('mini-calc');
if(form){
 const out=document.getElementById('mini-fig'),box=form.querySelector('.mini-out'),go=document.getElementById('mini-go');
 const val=n=>{const v=parseInt(String(n.value).replace(/[^\d]/g,''),10);return isFinite(v)?v:0};
 const money=v=>(v<0?'−':'')+'S$ '+Math.abs(Math.round(v)).toLocaleString('en-SG');
 form.addEventListener('input',e=>{
  const inp=e.target;
  if(inp.tagName==='INPUT'){
   const digits=inp.value.replace(/[^\d]/g,'').slice(0,9);
   inp.value=digits?Number(digits).toLocaleString('en-SG'):'';
  }
  const sale=val(form.sale),loan=val(form.loan),cash=val(form.savings);
  const live=sale>0;
  box.classList.toggle('live',live);
  out.textContent=live?money(sale-loan+cash):'S$ —';
  const q=new URLSearchParams();
  if(sale)q.set('sale',sale);if(loan)q.set('loan',loan);if(cash)q.set('savings',cash);
  go.href='hdb-upgrading.html'+(q.toString()?'?'+q:'')+'#calculator';
 });
 form.addEventListener('submit',e=>e.preventDefault());
}

/* 3. Octa demo shape grows in when seen */
const demo=document.querySelector('.octa-demo');
if(demo)RM?demo.classList.add('in'):seen(demo,()=>demo.classList.add('in'),.5);
})();
