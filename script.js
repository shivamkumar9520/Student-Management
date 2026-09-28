const KEY='sms-students-v1';
const SEED=[
 {id:1,name:'Aarav Sharma',roll:'IT2301',course:'B.Tech IT',email:'aarav@example.com',marks:88,att:92,fee:60000,paid:60000},
 {id:2,name:'Priya Verma',roll:'IT2302',course:'B.Tech IT',email:'priya@example.com',marks:76,att:81,fee:60000,paid:60000},
 {id:3,name:'Rohit Singh',roll:'CS2310',course:'B.Tech CSE',email:'rohit@example.com',marks:64,att:68,fee:60000,paid:30000},
 {id:4,name:'Neha Gupta',roll:'DP2205',course:'Diploma IT',email:'neha@example.com',marks:91,att:96,fee:60000,paid:60000},
 {id:5,name:'Kabir Khan',roll:'BC2118',course:'BCA',email:'kabir@example.com',marks:47,att:59,fee:60000,paid:30000},
 {id:6,name:'Sneha Yadav',roll:'MC2401',course:'MCA',email:'sneha@example.com',marks:82,att:88,fee:60000,paid:60000}
];
const $=id=>document.getElementById(id);
let students=load(),sortKey='name',sortDir=1,editId=null;

function load(){try{const r=localStorage.getItem(KEY);if(r){const a=JSON.parse(r);if(Array.isArray(a))return fix(a)}}catch(e){}return fix(SEED.slice())}
function fix(a){const n={};return a.map(s=>{s={phone:'',year:2023,fee:60000,paid:0,log:{},photo:'',...s};if(!s.sno){n[s.year]=(n[s.year]||0)+1;s.sno='SN'+s.year+String(n[s.year]).padStart(3,'0')}return s})}
function nextSno(y){let i=1,x;do{x='SN'+y+String(i++).padStart(3,'0')}while(students.some(s=>s.sno===x));return x}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(students))}catch(e){}}
const grade=m=>m>=85?'A':m>=70?'B':m>=55?'C':m>=40?'D':'F';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(t){const el=$('toast');el.textContent=t;el.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('on'),1800)}

const COLS=[['name','Student'],['course','Course'],['marks','Marks'],['grade','Grade'],['att','Attendance'],['','Fees'],['','Actions']];
function renderHead(){
  $('head').innerHTML=COLS.map(([k,l])=>k?`<th data-k="${k}" tabindex="0" ${sortKey===k?`aria-sort="${sortDir>0?'ascending':'descending'}" data-arrow="${sortDir>0?'▲':'▼'}"`:''}>${l}</th>`:`<th>${l}</th>`).join('');
}
function filtered(){
  const q=$('q').value.trim().toLowerCase(),c=$('course').value;
  let list=students.filter(s=>(!c||s.course===c)&&(!q||[s.name,s.roll,s.email,s.sno,s.phone].some(v=>v.toLowerCase().includes(q))));
  list.sort((a,b)=>{const va=sortKey==='grade'?b.marks:a[sortKey],vb=sortKey==='grade'?a.marks:b[sortKey];
    return (typeof va==='number'?va-vb:String(va).localeCompare(String(vb)))*sortDir});
  return list;
}
function renderStats(){
  const n=students.length,avg=k=>n?Math.round(students.reduce((t,s)=>t+(k==='att'?att(s):s[k]),0)/n):0;
  const top=students.slice().sort((a,b)=>b.marks-a.marks)[0];
  const risk=students.filter(s=>att(s)<75).length,due=students.reduce((t,s)=>t+Math.max(0,s.fee-s.paid),0);
  $('stats').innerHTML=`<div class="stat hi"><b>${n}</b><span>Total students</span></div>
  <div class="stat"><b>${avg('marks')}%</b><span>Average marks</span></div>
  <div class="stat"><b>${avg('att')}%</b><span>Average attendance</span></div>
  <div class="stat"><b>₹${due.toLocaleString('en-IN')}</b><span>Fees pending</span></div>
  <div class="stat"><b>${risk}</b><span>Below 75% attendance${top?` · Top: ${esc(top.name.split(' ')[0])}`:''}</span></div>`;
}
function render(){
  renderHead();renderStats();
  const list=filtered();
  $('body').innerHTML=list.map(s=>`<tr>
   <td><div class="name">${esc(s.name)}</div><div class="sub">${esc(s.sno)} · Roll ${esc(s.roll)}</div></td>
   <td>${esc(s.course)}</td><td>${s.marks}</td>
   <td><span class="grade ${grade(s.marks)}">${grade(s.marks)}</span></td>
   <td><div class="att"><i><u class="${att(s)<75?'low':''}" style="width:${att(s)}%"></u></i>${att(s)}%</div></td>
   <td>${feeCell(s)}</td>
   <td><button class="btn sm" data-id="${s.id}">ID card</button> <button class="btn sm" data-edit="${s.id}">Edit</button> <button class="btn sm danger" data-del="${s.id}">Delete</button></td></tr>`).join('');
  $('empty').hidden=list.length>0;
  $('count').textContent=`Showing ${list.length} of ${students.length} students`;
}
function fillCourses(){
  const cs=[...new Set(students.map(s=>s.course))].sort(),cur=$('course').value;
  $('course').innerHTML='<option value="">All courses</option>'+cs.map(c=>`<option ${c===cur?'selected':''}>${esc(c)}</option>`).join('');
}
function openForm(s){
  editId=s?s.id:null;$('dlgTitle').textContent=s?'Edit student':'Add student';$('err').textContent='';
  $('f-name').value=s?s.name:'';$('f-roll').value=s?s.roll:'';$('f-course').value=s?s.course:'B.Tech IT';
  $('f-email').value=s?s.email:'';$('f-phone').value=s?s.phone:'';$('f-fee').value=s?s.fee:60000;$('f-paid').value=s?s.paid:0;$('f-photo').value='';$('f-year').value=s?s.year:2023;$('f-marks').value=s?s.marks:'';$('f-att').value=s?s.att:'';
  $('dlg').showModal();$('f-name').focus();
}
$('form').addEventListener('submit',async e=>{
  e.preventDefault();
  const d={name:$('f-name').value.trim(),roll:$('f-roll').value.trim(),course:$('f-course').value,email:$('f-email').value.trim(),marks:Number($('f-marks').value),att:Number($('f-att').value),phone:$('f-phone').value.trim(),year:Number($('f-year').value),fee:Number($('f-fee').value)||0,paid:Number($('f-paid').value)||0};
  let m='';
  if(!d.name||!d.roll)m='Name and roll number are required.';
  else if(!/^\S+@\S+\.\S+$/.test(d.email))m='Enter a valid email address.';
  else if($('f-marks').value===''||d.marks<0||d.marks>100)m='Marks must be between 0 and 100.';
  else if($('f-att').value===''||d.att<0||d.att>100)m='Attendance must be between 0 and 100.';
  else if(d.paid>d.fee)m='Paid amount cannot exceed total fee.';
  else if(d.phone&&!/^\d{10}$/.test(d.phone))m='Phone must be 10 digits.';
  else if(!(d.year>=2015&&d.year<=2035))m='Enter a valid joining year.';
  else if(students.some(s=>s.roll.toLowerCase()===d.roll.toLowerCase()&&s.id!==editId))m='This roll number already exists.';
  if(m){$('err').textContent=m;return}
  const pf=$('f-photo').files[0];if(pf)d.photo=await readPhoto(pf);
  if(editId){students=students.map(s=>s.id===editId?{...s,...d}:s);toast('Student updated')}
  else{students.push({id:Date.now(),sno:nextSno(d.year),...d});toast('Student added')}
  persist();fillCourses();render();$('dlg').close();
});
$('cancel').onclick=()=>$('dlg').close();
$('add').onclick=()=>openForm();
$('body').addEventListener('click',e=>{
  const ed=e.target.closest('[data-edit]'),dl=e.target.closest('[data-del]');
  const ic=e.target.closest('[data-id]');if(ic)showCard(students.find(s=>s.id==ic.dataset.id));
  if(ed)openForm(students.find(s=>s.id==ed.dataset.edit));
  if(dl){const s=students.find(x=>x.id==dl.dataset.del);
    if(s&&confirm('Delete '+s.name+'? This cannot be undone.')){students=students.filter(x=>x.id!==s.id);persist();fillCourses();render();toast('Student deleted')}}
});
function sortBy(th){const k=th&&th.dataset.k;if(!k)return;sortDir=sortKey===k?-sortDir:1;sortKey=k;render()}
$('head').addEventListener('click',e=>sortBy(e.target.closest('th')));
$('head').addEventListener('keydown',e=>{if(e.key==='Enter')sortBy(e.target.closest('th'))});
$('q').addEventListener('input',render);$('course').addEventListener('change',render);
$('export').onclick=()=>{
  const rows=[['Student No','Name','Roll','Course','Email','Phone','Marks','Grade','Attendance']].concat(filtered().map(s=>[s.sno,s.name,s.roll,s.course,s.email,s.phone,s.marks,grade(s.marks),att(s)]));
  const csv=rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='students.csv';a.click();
};
$('theme').onclick=()=>{
  const r=document.documentElement,dark=matchMedia('(prefers-color-scheme:dark)').matches;
  const cur=r.dataset.theme||(dark?'dark':'light');r.dataset.theme=cur==='dark'?'light':'dark';
};
function bars(t){let x=0,o='';for(const c of t+t){const v=c.charCodeAt(0),w=v%3+1;o+=`<rect x="${x}" width="${w}" height="30"/>`;x+=w+1+(v>>2)%2}return `<svg viewBox="0 0 ${x} 30" preserveAspectRatio="none" width="100%" height="34" fill="currentColor" aria-hidden="true">${o}</svg>`}
function showCard(s){
  if(!s)return;
  const ini=s.name.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
  const till=s.year+(/Diploma|BCA/.test(s.course)?3:s.course==='MCA'?2:4);
  $('card').innerHTML=`<div class="top">Student Identity Card<small>Student Management System</small></div>
  <div class="mid"><div class="av">${s.photo?`<img alt="" src="${s.photo}">`:esc(ini)}</div><div><div class="nm">${esc(s.name)}</div>
  <dl><dt>Student No</dt><dd>${esc(s.sno)}</dd><dt>Roll No</dt><dd>${esc(s.roll)}</dd><dt>Course</dt><dd>${esc(s.course)}</dd><dt>Phone</dt><dd>${esc(s.phone||'-')}</dd></dl></div></div>
  <div class="code" id="qr"></div>
  <div class="bot"><span>Batch ${s.year}</span><span>Valid till ${till}</span></div>`;
  const q=$('qr');if(window.QRCode){q.style.cssText='display:flex;justify-content:center;background:#fff;padding:8px;border-radius:8px';new QRCode(q,{text:'SMS|'+s.sno+'|'+s.name+'|'+s.roll,width:84,height:84})}else q.innerHTML=bars(s.sno);
  $('idDlg').showModal();
}
$('idClose').onclick=()=>$('idDlg').close();
$('idPrint').onclick=()=>window.print();
function att(s){const k=Object.keys(s.log||{});return k.length?Math.round(k.filter(d=>s.log[d]).length/k.length*100):s.att}
function feeCell(s){const d=s.fee-s.paid;return d>0?`<span class="fee due">Due ₹${d.toLocaleString('en-IN')}</span>`:'<span class="fee ok">Paid</span>'}
function readPhoto(f){return new Promise(res=>{const r=new FileReader();r.onload=()=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=120;c.height=150;const x=c.getContext('2d'),k=Math.max(120/i.width,150/i.height),w=i.width*k,h=i.height*k;x.drawImage(i,(120-w)/2,(150-h)/2,w,h);res(c.toDataURL('image/jpeg',.75))};i.onerror=()=>res('');i.src=r.result};r.onerror=()=>res('');r.readAsDataURL(f)})}
let adraft={};
function drawAtt(){$('alist').innerHTML=students.map(s=>{const v=adraft[s.id];return `<div class="arow"><span>${esc(s.name)} <small style="color:var(--mute)">${esc(s.sno)}</small></span><span class="seg"><button type="button" data-a="${s.id}:1" class="${v?'on':''}">Present</button><button type="button" data-a="${s.id}:0" class="${v===false?'on a':''}">Absent</button></span></div>`}).join('')}
function loadAtt(){const d=$('adate').value;adraft={};students.forEach(s=>{adraft[s.id]=(s.log&&d in s.log)?!!s.log[d]:true});drawAtt()}
$('attBtn').onclick=()=>{$('adate').value=new Date().toISOString().slice(0,10);loadAtt();$('attDlg').showModal()};
$('adate').onchange=loadAtt;
$('alist').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const [id,v]=b.dataset.a.split(':');adraft[id]=v==='1';drawAtt()});
$('asave').onclick=()=>{const d=$('adate').value;if(!d)return;students=students.map(s=>({...s,log:{...s.log,[d]:!!adraft[s.id]}}));persist();render();$('attDlg').close();toast('Attendance saved for '+d)};
$('aclose').onclick=()=>$('attDlg').close();
function authed(){try{return sessionStorage.getItem('sms-auth')==='1'}catch(e){return window.__a===1}}
function gate(){const a=authed();$('login').hidden=a;document.querySelector('.wrap').hidden=!a}
let otp='',memHash='',ruser='',memUsers=null;
async function sha(t){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function getUsers(){let u=memUsers;if(!u){try{u=JSON.parse(localStorage.getItem('sms-users')||'null')}catch(e){}}
  if(!u||typeof u!=='object')u={};
  if(!u.admin){let old='';try{old=localStorage.getItem('sms-pw')||''}catch(e){}u.admin=old||memHash||await sha('admin123')}
  return u}
function saveUsers(u){memUsers=u;try{localStorage.setItem('sms-users',JSON.stringify(u))}catch(e){}}
$('lf').addEventListener('submit',async e=>{e.preventDefault();const us=await getUsers(),un=$('lu').value.trim().toLowerCase();if(us[un]&&us[un]===await sha($('lp').value)){try{sessionStorage.setItem('sms-auth','1')}catch(x){window.__a=1}$('lp').value='';$('lerr').textContent='';gate()}else $('lerr').textContent='Incorrect username or password.'});
$('forgot').onclick=()=>{$('lf').hidden=true;$('rf').hidden=false;$('rstep2').hidden=true;$('rbtn').textContent='Send reset code';$('rerr').textContent='';$('rmsg').textContent='Enter your username to get a reset code.';$('ru').value=$('lu').value;otp=''};
$('rback').onclick=()=>{$('rf').hidden=true;$('lf').hidden=false};
$('rf').addEventListener('submit',async e=>{e.preventDefault();const er=$('rerr');
  if(!otp){const us=await getUsers();ruser=$('ru').value.trim().toLowerCase();if(!us[ruser]){er.textContent='No account with this username.';return}
    otp=String(Math.floor(100000+Math.random()*900000));$('rstep2').hidden=false;$('rbtn').textContent='Reset password';er.textContent='';
    $('rmsg').textContent='Demo mode: no email is sent. Your reset code is '+otp+'.';return}
  if($('rc').value.trim()!==otp){er.textContent='The code is incorrect.';return}
  if($('rn').value.length<6){er.textContent='Password must be at least 6 characters.';return}
  const us2=await getUsers();us2[ruser]=await sha($('rn').value);saveUsers(us2);
  otp='';$('rc').value='';$('rn').value='';$('rf').hidden=true;$('lf').hidden=false;$('lp').value='';$('lerr').textContent='';toast('Password updated. Sign in with your new password.')});
$('toReg').onclick=()=>{$('lf').hidden=true;$('gf').hidden=false;$('gerr').textContent=''};
$('gback').onclick=()=>{$('gf').hidden=true;$('lf').hidden=false};
$('gf').addEventListener('submit',async e=>{e.preventDefault();const er=$('gerr'),u=$('gu').value.trim().toLowerCase(),p=$('gp').value;
  if(!/^[a-z0-9_]{3,20}$/.test(u)){er.textContent='Username must be 3-20 letters, numbers or underscores.';return}
  if(p.length<6){er.textContent='Password must be at least 6 characters.';return}
  if(p!==$('gc').value){er.textContent='Passwords do not match.';return}
  const us=await getUsers();if(us[u]){er.textContent='This username is already taken.';return}
  us[u]=await sha(p);saveUsers(us);
  ['gu','gp','gc'].forEach(i=>$(i).value='');$('gf').hidden=true;$('lf').hidden=false;$('lu').value=u;$('lp').value='';$('lerr').textContent='';toast('Account created. Sign in to continue.')});
$('logout').onclick=()=>{try{sessionStorage.removeItem('sms-auth')}catch(x){}window.__a=0;gate()};
fillCourses();render();gate();
