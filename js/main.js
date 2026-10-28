
const btn=document.querySelector('.menu-btn'),nav=document.getElementById('nav');
btn&&btn.addEventListener('click',()=>{const o=nav.classList.toggle('open');btn.setAttribute('aria-expanded',o)});
nav&&nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');btn.setAttribute('aria-expanded',false)}));
const A88_WA='6580830688',A88_MAIL='https://formsubmit.co/ajax/avenue88property@gmail.com';
const A88_LABELS={goal:'Goal',name:'Name',phone:'Mobile',email:'Email',hdbType:'HDB type',town:'Town',timeline:'Timeline',address:'Property address',type:'Property type',topic:'Interested in',message:'Message',project:'Project / address',intent:'Buying, selling or upgrading',calc:'Calculator snapshot'};
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
