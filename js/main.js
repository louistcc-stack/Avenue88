
const A88_NAV=[
 {label:'Team',page:'about.html'},
 {label:'Watch',page:'index.html',hash:'#watch'},
 {label:'Launches',page:'launches.html'},
 {label:'Transactions',page:'transactions.html'},
 {label:'Upgrade',page:'hdb-upgrading.html'},
 {label:'Octa',page:'octa-score.html'},
 {label:'Tools',page:'index.html',hash:'#tools'},
 {label:'Value',page:'valuation.html'}
];
function a88Page(){const file=(location.pathname.split('/').pop()||'index.html');return file||'index.html'}
function a88Href(item){return a88Page()==='index.html'&&item.hash?item.hash:item.page+(item.hash||'')}
function a88Current(item){const here=a88Page();return item.hash?here==='index.html'&&location.hash===item.hash:here===item.page}
function a88Fill(root){
 root.replaceChildren();
 A88_NAV.forEach(item=>{
  const a=document.createElement('a');
  a.href=a88Href(item);
  a.textContent=item.label;
  if(a88Current(item))a.setAttribute('aria-current','page');
  root.append(a);
 });
}
const btn=document.querySelector('.menu-btn'),nav=document.getElementById('nav');
const bar=document.querySelector('header.nav');
if(nav)a88Fill(nav);
document.querySelectorAll('footer').forEach(footer=>{
 if(footer.querySelector('.foot-links'))return;
 const links=document.createElement('nav');
 links.className='foot-links';
 links.setAttribute('aria-label','Pages');
 a88Fill(links);
 const legal=footer.querySelector('.legal');
 footer.insertBefore(links,legal);
});
function paintNav(){if(bar)bar.classList.toggle('scrolled',window.scrollY>8)}
paintNav();
addEventListener('scroll',paintNav,{passive:true});
addEventListener('hashchange',()=>{if(nav)a88Fill(nav);document.querySelectorAll('.foot-links').forEach(a88Fill)});
btn&&btn.addEventListener('click',()=>{const o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',o)});
nav&&nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');btn&&btn.setAttribute('aria-expanded','false')}});
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
