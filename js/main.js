
const A88_NAV=[
 {label:'About',page:'about.html',also:['transactions.html']},
 {label:'Buy & Sell',page:'hdb-upgrading.html'},
 {label:'New Launches',page:'launches.html'},
 {label:'Tools',children:[
  {label:'Get Valuation',page:'valuation.html',note:'Can I upgrade? Budget calculator'},
  {label:'Octa Report',page:'octa-score.html',note:'Eight checks on a launch, one score'}
 ]},
 {label:'News',page:'news.html'}
];
/* The footer lists every page flat, plus the socials link the header no longer carries */
const A88_FOOT=[
 {label:'About',page:'about.html',also:['transactions.html']},
 {label:'Buy & Sell',page:'hdb-upgrading.html'},
 {label:'New Launches',page:'launches.html'},
 {label:'Get Valuation',page:'valuation.html'},
 {label:'Octa Report',page:'octa-score.html'},
 {label:'News',page:'news.html'},
 {label:'Our Socials',page:'index.html',hash:'#watch'}
];
function a88Page(){const file=(location.pathname.split('/').pop()||'index.html');return file||'index.html'}
function a88Href(item){return a88Page()==='index.html'&&item.hash?item.hash:item.page+(item.hash||'')}
function a88Current(item){const here=a88Page();if(item.children)return item.children.some(a88Current);if(item.also&&item.also.indexOf(here)!==-1)return true;return item.hash?here==='index.html'&&location.hash===item.hash:here===item.page}
function a88Link(item){
 const a=document.createElement('a');
 a.href=a88Href(item);
 a.textContent=item.label;
 if(a88Current(item))a.setAttribute('aria-current','page');
 return a;
}
let a88DropN=0;
function a88Fill(root,list){
 root.replaceChildren();
 (list||A88_NAV).forEach(item=>{
  if(!item.children){root.append(a88Link(item));return}
  const wrap=document.createElement('div');wrap.className='nav-drop';
  const id='nav-drop-'+(++a88DropN);
  const b=document.createElement('button');b.type='button';b.className='nav-drop-btn';
  b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls',id);
  b.innerHTML='<span></span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  b.firstChild.textContent=item.label;
  if(a88Current(item))b.classList.add('current');
  const menu=document.createElement('div');menu.className='nav-drop-menu';menu.id=id;
  item.children.forEach(c=>{const a=a88Link(c);if(c.note){const sm=document.createElement('small');sm.textContent=c.note;a.append(sm)}menu.append(a)});
  b.addEventListener('click',e=>{e.stopPropagation();const o=!wrap.classList.contains('open');wrap.classList.toggle('open',o);b.setAttribute('aria-expanded',String(o))});
  wrap.addEventListener('keydown',e=>{if(e.key==='Escape'){wrap.classList.remove('open');b.setAttribute('aria-expanded','false');b.focus()}});
  wrap.append(b,menu);root.append(wrap);
 });
}
document.addEventListener('click',e=>{document.querySelectorAll('.nav-drop.open').forEach(w=>{if(!w.contains(e.target)){w.classList.remove('open');w.querySelector('.nav-drop-btn').setAttribute('aria-expanded','false')}})});
const btn=document.querySelector('.menu-btn'),nav=document.getElementById('nav');
const bar=document.querySelector('header.nav');
if(nav)a88Fill(nav);
document.querySelectorAll('footer').forEach(footer=>{
 if(footer.querySelector('.foot-links'))return;
 const links=document.createElement('nav');
 links.className='foot-links';
 links.setAttribute('aria-label','Pages');
 a88Fill(links,A88_FOOT);
 const legal=footer.querySelector('.legal');
 footer.insertBefore(links,legal);
});
function paintNav(){if(bar)bar.classList.toggle('scrolled',window.scrollY>8)}
paintNav();
addEventListener('scroll',paintNav,{passive:true});
addEventListener('hashchange',()=>{if(nav)a88Fill(nav);document.querySelectorAll('.foot-links').forEach(l=>a88Fill(l,A88_FOOT))});
btn&&btn.addEventListener('click',()=>{const o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',o)});
nav&&nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');btn&&btn.setAttribute('aria-expanded','false')}});
if(!document.getElementById('contact')){
 const foot=document.querySelector('footer');
 if(foot){
  const sec=document.createElement('section');
  sec.className='section soft';
  sec.id='contact';
  sec.innerHTML='<div class="wrap contact"><div><span class="eyebrow">Contact us</span><h2>Let\'s talk property.</h2><p class="lead">Buying, selling, renting or upgrading? Drop us a message and we\'ll get back to you soon. Prefer to chat now? WhatsApp or call us.</p><p><a class="btn btn-wa" href="https://wa.me/6580830688" target="_blank" rel="noopener">WhatsApp us</a></p></div><form class="enquiry a88-lead" novalidate><input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off"><h3>Send us an enquiry</h3><div class="field"><label>Name</label><input name="name" autocomplete="name" required placeholder="Your name"></div><div class="field-row"><div class="field"><label>Phone</label><input name="phone" type="tel" autocomplete="tel" required placeholder="+65"></div><div class="field"><label>Email</label><input name="email" type="email" autocomplete="email" placeholder="you@email.com"></div></div><div class="field"><label>I\'m interested in</label><select name="topic"><option>Buying a home</option><option>Selling my property</option><option>Renting out / renting</option><option>Upgrading from HDB</option><option>New condo launches</option><option>Something else</option></select></div><div class="field"><label>Message</label><textarea name="message" rows="4" placeholder="Tell us a little about what you\'re looking for"></textarea></div><label class="consent"><input type="checkbox" name="consent" required> <span>I agree to Avenue 88 Property contacting me about my enquiry, and to my details being used for that purpose in line with the PDPA.</span></label><button class="btn btn-navy" type="submit">Enquire now</button><p class="form-note" hidden aria-live="polite"></p></form></div>';
  foot.parentNode.insertBefore(sec,foot);
 }
}
const A88_INTEREST={buy:'Buying a home',sell:'Selling my property',rent:'Renting out / renting',upgrade:'Upgrading from HDB',launch:'New condo launches',launches:'New condo launches'};
function a88InterestKey(){
 const q=new URLSearchParams(location.search).get('interest');
 if(q)return q.toLowerCase();
 const hash=(location.hash||'').replace(/^#/,'');
 const cut=hash.indexOf('?');
 if(cut===-1)return (document.body.dataset.interest||'').toLowerCase();
 return (new URLSearchParams(hash.slice(cut+1)).get('interest')||'').toLowerCase();
}
function a88ScrollContact(){
 const id=(location.hash||'').replace(/^#/,'').split('?')[0];
 if(id!=='contact')return;
 const el=document.getElementById('contact');
 if(!el)return;
 const go=()=>{
  const nav=document.querySelector('header.nav');
  const y=Math.max(0,el.getBoundingClientRect().top+window.scrollY-((nav&&nav.offsetHeight)||0)-12);
  const root=document.documentElement;
  const prev=root.style.scrollBehavior;
  root.style.scrollBehavior='auto';
  window.scrollTo(0,y);
  root.style.scrollBehavior=prev;
 };
 go();
 setTimeout(go,0);
}
function a88ApplyInterest(){
 const label=A88_INTEREST[a88InterestKey()];
 if(label)document.querySelectorAll('select[name="topic"]').forEach(sel=>{
  const opt=[...sel.options].find(o=>o.value===label||o.textContent.trim()===label);
  if(opt)sel.value=opt.value;
 });
 a88ScrollContact();
}
a88ApplyInterest();
addEventListener('hashchange',a88ApplyInterest);
addEventListener('load',a88ApplyInterest);
const A88_WA='6580830688',A88_MAIL='https://formsubmit.co/ajax/avenue88property@gmail.com';
const A88_LABELS={goal:'Goal',name:'Name',phone:'Mobile',email:'Email',hdbType:'HDB type',town:'Town',timeline:'Timeline',address:'Property address',unit:'Unit no.',type:'Property type',topic:'Interested in',message:'Message',project:'Project / address',intent:'Buying, selling or upgrading',calc:'Calculator snapshot'};
document.querySelectorAll('form.a88-lead').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();
 const d=new FormData(f),note=f.querySelector('.form-note');const say=(t,c)=>{note.hidden=false;note.textContent=t;note.style.color=c};
 const name=(d.get('name')||'').trim(),phone=(d.get('phone')||'').trim();
 if(!name||!/^[+\d][\d\s-]{6,}$/.test(phone)){say('Please add your name and a valid mobile number.','#b42318');return}
 if(!d.get('consent')){say('Please tick the consent box so we can contact you.','#b42318');return}
 if(d.get('_honey'))return;
 const fields={};for(const k in A88_LABELS){const v=(d.get(k)||'').toString().trim();if(v)fields[A88_LABELS[k]]=k==='goal'?(v==='sell'?"What's my home worth?":'Planning an HDB upgrade'):v}
 fields['Form']=f.dataset.form||(f.id==='valuation'?'Hero lead form':'Enquiry form');fields['Page']=location.pathname;
 const msg='Hi Avenue 88!\n'+Object.entries(fields).map(([k,v])=>k+': '+v).join('\n');
 window.open('https://wa.me/'+A88_WA+'?text='+encodeURIComponent(msg),'_blank');
 const body=Object.assign({_subject:f.dataset.subject||'New Avenue 88 website lead',_template:'table',_captcha:'false',_honey:''},fields);
 say('Sending...','#555');
 fetch(A88_MAIL,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(body)})
  .then(r=>{if(!r.ok)throw 0;say("Thanks, "+name+"! We've got your details and will be in touch soon.",'#168a45');f.reset()})
  .catch(()=>say("Thanks, "+name+"! WhatsApp should have opened with your details. If not, call us on 8083 0688.",'#168a45'));
}));
(function(){
 if(document.querySelector('.wa-float'))return;
 const a=document.createElement('a');
 a.className='wa-float';
 a.href='https://wa.me/'+A88_WA;
 a.target='_blank';
 a.rel='noopener';
 a.setAttribute('aria-label','WhatsApp us');
 a.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg><span>WhatsApp us</span>';
 document.body.append(a);
 const place=()=>{
  const nums=document.querySelector('.nums');
  if(!nums){document.body.classList.remove('wa-raised');return}
  const r=nums.getBoundingClientRect();
  document.body.classList.toggle('wa-raised',r.top<innerHeight&&r.bottom>innerHeight-8);
 };
 place();
 addEventListener('scroll',place,{passive:true});
 addEventListener('resize',place);
})();
