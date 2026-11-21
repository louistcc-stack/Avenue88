/* Homepage lead form: three short steps, an instant thank-you with next steps,
   an email copy to the client, and a tagged lead email to the team. */
(()=>{
const f=document.getElementById('enquiry');
if(!f||!f.classList.contains('lead-flow'))return;

/* ---- Edit these to match how the team actually works ---- */
const CFG={
 wa:'6580830688',
 inbox:'https://formsubmit.co/ajax/avenue88property@gmail.com',
 replyPromise:'within 1 working hour (9am to 9pm daily)',
 sign:'The Avenue 88 team',
 legal:'AVENUE 88 PROPERTY is an independent team under the umbrella of HUTTONS ASIA PTE LTD (CEA Licence No. L3008899K)'
};
const GOALS={
 buy:{me:'buying a home',label:'Buying a home',about:'buying a home',step:'We put together a shortlist that fits your budget and the areas you like.',tool:['See the market reports','#watch']},
 sell:{me:'selling my home',label:'Selling my property',about:'selling your home',step:'We prepare a pricing report from recent sales near your home, so you know where you stand.',tool:['Check your upgrade budget','#tools']},
 upgrade:{me:'upgrading from my HDB',label:'Upgrading from HDB',about:'upgrading from your HDB',step:'We sketch your numbers: sale price, CPF refund, loan and next-home budget.',tool:['Try the upgrade calculator','hdb-upgrading.html#calculator']},
 launch:{me:'new launches',label:'New condo launches',about:'new launches',step:'We send you the Octa Score for the launches on your list, with our honest view.',tool:['See how the Octa Score works','octa-score.html']},
 rent:{me:'renting',label:'Renting out / renting',about:'renting',step:'We share what similar homes are renting for right now.',tool:['Meet the team','#team']},
 other:{me:'my property plans',label:'Something else',about:'your property plans',step:'We look into your question and come back with a clear answer.',tool:['Meet the team','#team']}
};
const URL_GOAL={buy:'buy',sell:'sell',upgrade:'upgrade',launch:'launch',launches:'launch',rent:'rent'};

const steps=[...f.querySelectorAll('.lf-step')];
const back=f.querySelector('.lf-back'),next=f.querySelector('.lf-next'),send=f.querySelector('.lf-send');
const err=f.querySelector('.lf-err'),nEl=f.querySelector('[data-step-n]'),bar=f.querySelector('.lf-bar i');
let cur=1;

const val=n=>{const el=f.elements[n];return el?String(el.value||'').trim():''};
const goal=()=>val('goal');
function oops(t){err.textContent=t;err.hidden=!t}

function show(n,focus=true){
 cur=n;
 steps.forEach(s=>{const on=+s.dataset.step===n;s.hidden=!on;s.classList.toggle('is-on',on)});
 nEl.textContent=n;bar.style.width=(n/3*100)+'%';
 back.hidden=n===1;next.hidden=n===3;send.hidden=n!==3;
 next.hidden=n===1&&!goal()?true:next.hidden;
 f.querySelectorAll('.lf-ctx').forEach(c=>{c.hidden=!c.dataset.for.split(' ').includes(goal())});
 oops('');
 if(focus){const first=steps[n-1].querySelector('input:not([type=hidden]),select,textarea');first&&first.focus({preventScroll:true})}
}
function check(n){
 if(n===1&&!goal())return 'Choose what we can help you with.';
 if(n===2&&!val('timeline'))return 'Let us know roughly when you are hoping to move.';
 if(n===3){
  if(!val('name'))return 'Please add your name.';
  if(!/^\+?[\d\s-]{8,}$/.test(val('phone')))return 'Please add a valid mobile number.';
  const em=val('email');if(em&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em))return 'That email address does not look right.';
  if(!f.elements.consent.checked)return 'Please tick the consent box so we can contact you.';
 }
 return '';
}
next.addEventListener('click',()=>{const e=check(cur);if(e){oops(e);return}show(cur+1)});
back.addEventListener('click',()=>show(cur-1));
f.addEventListener('input',()=>{if(!err.hidden)oops('')});
f.addEventListener('change',()=>{if(!err.hidden)oops('')});
/* Picking a goal moves straight on */
f.querySelectorAll('input[name=goal]').forEach(r=>r.addEventListener('change',()=>{next.hidden=false;setTimeout(()=>show(2),220)}));
/* Enter on step 1 or 2 means Continue, not Send */
f.addEventListener('keydown',e=>{if(e.key==='Enter'&&cur<3&&e.target.tagName!=='TEXTAREA'){e.preventDefault();next.click()}});

/* Links such as #contact?interest=buy preselect the goal */
function fromUrl(){
 const h=(location.hash||'').split('?')[1]||'';
 const k=(new URLSearchParams(location.search).get('interest')||new URLSearchParams(h).get('interest')||'').toLowerCase();
 const g=URL_GOAL[k];if(!g)return;
 const r=f.querySelector('input[name=goal][value="'+g+'"]');if(r&&!r.checked){r.checked=true;show(2,false)}
}
fromUrl();addEventListener('hashchange',fromUrl);
show(cur,false);

function temperature(t){return t==='Within 3 months'?'HOT':t==='3 to 6 months'?'WARM':'NURTURE'}
function leadId(){const d=new Date(),p=x=>String(x).padStart(2,'0');return 'A88-'+String(d.getFullYear()).slice(2)+p(d.getMonth()+1)+p(d.getDate())+'-'+Math.random().toString(36).slice(2,6).toUpperCase()}

f.addEventListener('submit',e=>{
 e.preventDefault();
 const bad=check(3);if(bad){oops(bad);return}
 if(val('_honey'))return;
 const g=GOALS[goal()]||GOALS.other,name=val('name'),first=name,temp=temperature(val('timeline')),id=leadId();
 const q=new URLSearchParams(location.search);
 const via={WhatsApp:'on WhatsApp',Call:'by phone',Email:'by email'}[val('contactVia')]||'';
 const fields={
  'Lead ID':id,'Priority':temp,'Interested in':g.label,'Timeline':val('timeline'),
  'Property type':val('type'),'Town / estate':val('town'),'Budget':val('budget'),'Message':val('message'),
  'Name':name,'Mobile':val('phone'),'Email':val('email'),'Contact by':val('contactVia'),'Best time':val('bestTime'),
  'Came from':[q.get('utm_source'),q.get('utm_campaign')].filter(Boolean).join(' / ')||(document.referrer?new URL(document.referrer).hostname:'Direct'),
  'Page':location.pathname
 };
 Object.keys(fields).forEach(k=>{if(!fields[k])delete fields[k]});
 const body=Object.assign({
  _subject:'['+temp+'] '+g.label+' · '+(val('town')?val('town')+' · ':'')+val('timeline')+' · '+name,
  _template:'table',_captcha:'false'
 },fields);
 if(val('email')){
  body._replyto=val('email');
  body._autoresponse='Hi '+first+',\n\nThank you for reaching out to Avenue 88. We have received your enquiry about '+g.about+' (reference '+id+').\n\nWhat happens next:\n1. One of our agents will contact you '+via+' '+CFG.replyPromise+'.\n2. '+g.step+'\n3. We set up a short, no-obligation chat at a time that suits you.\n\nNeed us sooner? WhatsApp us on +65 8083 0688.\n\nWarm regards,\n'+CFG.sign+'\n\n'+CFG.legal;
 }
 send.disabled=true;send.textContent='Sending…';
 const done=ok=>{
  const box=f.querySelector('.lf-done');
  f.querySelector('[data-done-name]').textContent=', '+first;
  f.querySelector('[data-done-lede]').textContent=ok
   ?'We have your request about '+g.about+'. Here is what happens next.'
   :'Your details did not reach us just now. Please send them on WhatsApp so nothing is lost.';
  const ol=f.querySelector('[data-done-steps]');ol.replaceChildren();
  [[ 'Now', val('email')?'A copy of your request is on its way to '+val('email')+'.':'Your request is with the team (reference '+id+').'],
   [ CFG.replyPromise.replace(/^within/,'Within').replace(/ \(.*\)$/,''), 'An agent contacts you '+via+'. A real person, not a bot.'],
   [ 'Next', g.step],
   [ 'When you are ready', 'A short, no-obligation chat, at a time that suits you.']
  ].forEach(([t,d])=>{const li=document.createElement('li');const b=document.createElement('b');b.textContent=t;const sp=document.createElement('span');sp.textContent=d;li.append(b,sp);ol.append(li)});
  const wa='Hi Avenue 88, this is '+name+'. I just sent an enquiry ('+id+') about '+g.me+', '+val('timeline').toLowerCase()+'.';
  f.querySelector('[data-done-wa]').href='https://wa.me/'+CFG.wa+'?text='+encodeURIComponent(wa);
  f.querySelector('[data-done-wa]').textContent=ok?'Start on WhatsApp now':'Send on WhatsApp';
  const tool=f.querySelector('[data-done-tool]');tool.textContent=g.tool[0];tool.href=g.tool[1];
  f.querySelector('[data-done-fine]').textContent=ok?'Reference '+id+'. We only use your details for this enquiry, in line with the PDPA.':'';
  f.querySelector('.lf-top').hidden=true;steps.forEach(s=>s.hidden=true);f.querySelector('.lf-nav').hidden=true;oops('');
  box.hidden=false;box.focus({preventScroll:true});
  box.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});
 };
 fetch(CFG.inbox,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(body)})
  .then(r=>{if(!r.ok)throw 0;return r.json().catch(()=>({}))})
  .then(()=>done(true))
  .catch(()=>done(false))
  .finally(()=>{send.disabled=false;send.textContent='Send my enquiry'});
});
})();
