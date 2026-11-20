/* MENOVA: record search, Save as PDF, and fresher messaging. Loaded after handover.js. */
(function(){
 const $=id=>document.getElementById(id);
 function addSearch(sectionId,anchorSel,itemSels,label){
  const sec=$(sectionId),anchor=document.querySelector(anchorSel);
  if(!sec||!anchor||sec.querySelector('.menova-search'))return;
  const box=document.createElement('input');box.type='search';box.className='menova-search';box.placeholder=label;box.setAttribute('aria-label',label);
  anchor.parentNode.insertBefore(box,anchor);
  const apply=()=>{const q=box.value.trim().toLowerCase();document.querySelectorAll(itemSels).forEach(el=>{el.style.display=!q||el.textContent.toLowerCase().includes(q)?'':'none'})};
  box.addEventListener('input',apply);window.addEventListener('menova-records-loaded',apply);
 }
 const table=(title,head,rows)=>'<h2>'+title+'</h2>'+(rows.length?'<table><thead><tr>'+head.map(h=>'<th>'+h+'</th>').join('')+'</tr></thead><tbody>'+rows.map(r=>'<tr>'+r.map(c=>'<td>'+esc(c??'')+'</td>').join('')+'</tr>').join('')+'</tbody></table>':'<p>No records.</p>');
 function printRecords(){
  const w=window.open('','_blank');if(!w){alert('Allow pop-ups to save as PDF.');return}
  const html='<!doctype html><html><head><meta charset="utf-8"><title>MENOVA health records</title><style>body{font:14px/1.5 Arial,sans-serif;margin:30px;color:#222}h1{font-size:22px}h2{font-size:16px;margin-top:24px}table{width:100%;border-collapse:collapse;font-size:12px}th,td{border:1px solid #ccc;padding:5px;text-align:left;vertical-align:top}th{background:#f1eef7}</style></head><body><h1>MENOVA · My health records</h1><p>Generated '+esc(new Date().toLocaleString())+'</p>'
  +table('Lifestyle check-ins',['Date','Sleep (h)','Quality','Stress','Activity (min)','Notes'],habits.map(h=>[h.checkin_date,h.sleep_hours,h.sleep_quality,h.stress_level,h.activity_minutes,h.notes]))
  +table('Biomarker records',['Date','Test','Biomarker','Result','Unit','Lab interval','Laboratory'],biomarkers.map(b=>[b.collection_date,b.test_name,b.biomarker,b.result_value,b.unit,b.lab_reference_interval,b.laboratory_name]))
  +table('Other lab results',['Date','Test','Parameter','Result','Unit','Reference','Facility'],labs.map(l=>[l.test_date,l.test_name,l.parameter,l.result_value,l.unit,l.reference_interval,l.facility]))
  +table('Clinician-submitted results',['Date','Test','Parameter','Result','Unit','Reference','Facility'],clinicianLabs.map(l=>[l.test_date,l.test_name,l.parameter,l.result_value,l.unit,l.reference_interval,l.facility]))
  +'<p style="margin-top:24px;color:#777">Records as entered. Not a diagnosis or clinical interpretation.</p></body></html>';
  w.document.write(html);w.document.close();w.focus();setTimeout(()=>w.print(),400);
 }
 function init(){
  if($('timeline')&&!$('menovaPdfBtn')){const b=document.createElement('button');b.type='button';b.id='menovaPdfBtn';b.textContent='Save my records as PDF';b.onclick=printRecords;$('timeline').parentNode.insertBefore(b,$('timeline'))}
  addSearch('home','#timeline','#timeline .item','Search my records');
  addSearch('habits','#habitList','#habitList .item','Search check-ins');
  addSearch('biomarkers','#bioList','#bioList .item,#labList .item','Search test results');
 }
 function addPdfButtons(){
  document.querySelectorAll('[data-ho-download],[data-download-inbox],[data-download-doctor-handover]').forEach(b=>{
   if(b.nextElementSibling&&b.nextElementSibling.classList.contains('menova-pdf'))return;
   const p=document.createElement('button');p.type='button';p.className='menova-pdf';p.textContent='Save as PDF';
   p.onclick=()=>{window.__menovaPdf=true;b.click();window.__menovaPdf=false};b.after(p);
  });
 }
 new MutationObserver(addPdfButtons).observe(document.body,{childList:true,subtree:true});
 const t=window.tab;window.tab=function(id){t(id);if(id==='messages'&&!isVerifiedClinician)load()};
 const dt=window.doctorTab;if(dt)window.doctorTab=function(id){dt(id);if(id==='doctorCommsPanel')loadClinicianDashboard()};
 setInterval(()=>{
  if(document.hidden)return;
  const m=$('messages');
  if(m&&!m.classList.contains('hidden')){if($('messageConsult').value)loadMessages();if($('clinicianMessageConsult').value)loadClinicianMessages()}
  const c=$('doctorCommsPanel');
  if(c&&!c.classList.contains('hidden')&&$('doctorMessageConsult').value)loadDoctorMessages();
 },10000);
 init();window.addEventListener('menova-records-loaded',init);addPdfButtons();
})();

/* Per-patient doctor spaces and the available-doctors list for members. */
(function(){
 const $=id=>document.getElementById(id);
 const st=document.createElement('style');st.textContent='.menova-patient{display:block;width:100%;text-align:left;margin:8px 0}#menovaBanner{margin:10px 0}';document.head.appendChild(st);
 let patients=[],active=null,cache={h:[],c:[]};
 const cur=()=>patients.find(p=>p.id===active)||null;
 function build(){
  const m=new Map(),get=id=>{if(!m.has(id))m.set(id,{id,handovers:[],consults:[],name:null,first:''});return m.get(id)};
  cache.h.forEach(x=>{const p=get(x.member_user_id);p.handovers.push(x);p.name=p.name||(x.shared_snapshot&&x.shared_snapshot.member_name)||null});
  cache.c.forEach(x=>get(x.member_user_id).consults.push(x));
  patients=[...m.values()].map(p=>{p.first=[...p.handovers,...p.consults].map(x=>x.created_at).sort()[0]||'';return p}).sort((a,b)=>a.first.localeCompare(b.first));
  patients.forEach((p,i)=>p.label=p.name||('Patient '+(i+1)));
 }
 function banner(){
  let b=$('menovaBanner');
  if(!b){b=document.createElement('div');b.id='menovaBanner';b.className='notice';const t=document.querySelector('#clinicianDashboard .doctor-tabs');t.parentNode.insertBefore(b,t)}
  const p=cur();
  b.innerHTML=p?'Working in the space of <b>'+esc(p.label)+'</b> · <button type="button" id="menovaChange">Change patient</button>':'No patient selected. Choose a patient under Shared records.';
  const c=$('menovaChange');if(c)c.onclick=()=>{active=null;renderAll()};
 }
 function consultCard(x){
  return '<article class="item"><b>'+esc(x.requested_specialty)+'</b><p>'+esc(x.member_message||'No message supplied')+'</p><p class="small muted">'+esc(x.preferred_contact_method)+' · '+esc(x.status)+' · '+esc(new Date(x.created_at).toLocaleString())+'</p>'
  +(x.status==='submitted'?'<button type="button" data-doctor-consult="accepted" data-id="'+esc(x.id)+'">Accept</button> <button type="button" data-doctor-consult="declined" data-id="'+esc(x.id)+'">Decline</button>':'')
  +(x.status==='accepted'?'<button type="button" data-doctor-consult="scheduled" data-id="'+esc(x.id)+'">Mark scheduled</button>':'')+'</article>';
 }
 async function renderAll(){
  banner();
  const p=cur(),host=$('doctorHandovers'),none='<option value="">Select a patient first</option>';
  if(!p){
   host.innerHTML='<h3>Your patients ('+patients.length+')</h3>'+(patients.length?patients.map(q=>{
    const last=[...q.handovers,...q.consults].map(x=>x.created_at).sort().pop(),wait=q.consults.filter(x=>x.status==='submitted').length;
    return '<button type="button" class="menova-patient" data-patient="'+esc(q.id)+'"><b>'+esc(q.label)+'</b><span class="small muted"> · '+q.handovers.length+' handover(s) · '+q.consults.length+' consultation(s)'+(wait?' · '+wait+' awaiting your reply':'')+' · last activity '+esc(new Date(last).toLocaleDateString())+'</span></button>';
   }).join(''):'<p>No patient has shared a handover or requested a consultation yet.</p>');
   host.querySelectorAll('[data-patient]').forEach(b=>b.onclick=()=>{active=b.dataset.patient;renderAll();window.scrollTo(0,0)});
   $('doctorLabHandover').innerHTML=none;$('doctorMessageConsult').innerHTML=none;$('doctorMessageList').textContent='Select a patient first.';
   $('doctorConsultations').innerHTML='<p>Select a patient to see their consultation requests.</p>';
   return;
  }
  host.innerHTML='<button type="button" id="menovaBack">← All patients</button><h3>'+esc(p.label)+'</h3><p class="small muted">Only this patient’s shared records, results and consultations appear here.</p>'
  +(p.handovers.map((x,i)=>{const s=x.shared_snapshot||{};return '<article class="item"><b>Handover '+(p.handovers.length-i)+'</b><p class="small muted">Received '+esc(new Date(x.created_at).toLocaleString())+' · '+esc(x.status)+'</p><p>'+esc(s.member_message||'No accompanying message')+'</p><button type="button" data-download-doctor-handover="'+esc(x.id)+'">Download readable report</button><details><summary>View member-approved information (read only)</summary>'+handoverSectionsHtml(s)+'</details><div id="doctorAddedLabs_'+esc(x.id)+'" class="item">Loading clinician-added results…</div></article>'}).join('')||'<p>This patient has not shared a handover. Their consultation requests and messages are available.</p>');
  $('menovaBack').onclick=()=>{active=null;renderAll()};
  host.querySelectorAll('[data-download-doctor-handover]').forEach(b=>b.onclick=()=>{const it=p.handovers.find(x=>x.id===b.dataset.downloadDoctorHandover);if(it&&window.menovaDownloadHandover)window.menovaDownloadHandover(it.shared_snapshot,it.created_at)});
  $('doctorLabHandover').innerHTML='<option value="">Choose this patient’s handover</option>'+p.handovers.map((x,i)=>'<option value="'+esc(x.id)+'" data-member="'+esc(x.member_user_id)+'"'+(i===0?' selected':'')+'>'+esc(p.label)+' · '+esc(new Date(x.created_at).toLocaleDateString())+'</option>').join('');
  $('doctorConsultations').innerHTML=p.consults.map(consultCard).join('')||'<p>No consultation requests from this patient.</p>';
  $('doctorConsultations').querySelectorAll('[data-doctor-consult]').forEach(b=>b.onclick=async()=>{const {error}=await sb.from('consultation_requests').update({status:b.dataset.doctorConsult}).eq('id',b.dataset.id).eq('clinician_user_id',session.user.id);if(error)return msg('doctorMessageStatus','Could not update request: '+error.message,true);await window.loadClinicianDashboard();msg('doctorMessageStatus','Consultation status updated.')});
  $('doctorMessageConsult').innerHTML='<option value="">Choose an accepted consultation</option>'+p.consults.filter(x=>['accepted','scheduled'].includes(x.status)).map(x=>'<option value="'+esc(x.id)+'">'+esc(x.requested_specialty)+' · '+esc(x.status)+'</option>').join('');
  $('doctorMessageList').textContent='Choose an accepted consultation.';
  for(const x of p.handovers){
   const q=await sb.from('clinician_lab_records').select('*').eq('handover_id',x.id).eq('clinician_user_id',session.user.id).order('test_date',{ascending:false}),h=$('doctorAddedLabs_'+x.id);if(!h)continue;
   if(q.error){h.textContent='Could not load clinician-added results: '+q.error.message;continue}
   h.innerHTML='<b>Laboratory results attached to this handover</b>'+((q.data||[]).map(v=>'<p>'+esc(v.test_date)+' · '+esc(v.test_name)+' · '+esc(v.parameter)+': '+esc(v.result_value||'PDF report attached')+' '+esc(v.unit||'')+' · reference '+esc(v.reference_interval||'not recorded')+' · '+esc(v.facility||'')+'</p>'+(v.report_storage_path?'<button type="button" data-doctor-report="'+esc(v.report_storage_path)+'">Open uploaded PDF</button>':'')).join('')||'<p class="muted">No additional clinician-entered results.</p>');
   h.querySelectorAll('[data-doctor-report]').forEach(b=>b.onclick=async()=>{const {data,error}=await sb.storage.from('menova-private-reports').createSignedUrl(b.dataset.doctorReport,60);if(error)return msg('doctorLabStatus','Could not open PDF: '+error.message,true);window.open(data.signedUrl,'_blank','noopener,noreferrer')});
  }
 }
 window.loadClinicianDashboard=async function(){
  const uid=session.user.id;
  const [h,c]=await Promise.all([
   sb.from('health_handovers').select('id,member_user_id,shared_snapshot,status,created_at').eq('clinician_user_id',uid).in('status',['approved_for_sharing','viewed']).order('created_at',{ascending:false}),
   sb.from('consultation_requests').select('*').eq('clinician_user_id',uid).order('created_at',{ascending:false})]);
  if(h.error){$('doctorHandovers').textContent='Unable to load approved handovers: '+h.error.message;return}
  if(c.error)$('doctorConsultations').textContent='Unable to load consultation requests: '+c.error.message;
  cache.h=h.data||[];cache.c=c.error?[]:(c.data||[]);window.doctorConsultations=cache.c;
  build();if(active&&!cur())active=null;
  await renderAll();
 };
 function doctors(){
  const form=$('consultClinician');if(!form||typeof clinicians==='undefined')return;
  let box=$('availableDoctors');
  if(!box){box=document.createElement('div');box.id='availableDoctors';const g=form.closest('.grid');g.parentNode.insertBefore(box,g)}
  box.innerHTML='<h4>Available doctors ('+clinicians.length+')</h4>'+(clinicians.length?clinicians.map(c=>'<div class="item"><b>'+esc(c.display_name)+'</b> · '+esc(c.specialty||'Clinician')+' <span class="small muted">'+(c.verification_status==='verified'?'Verified':'Self-reported prototype')+'</span><br><button type="button" data-pick-doctor="'+esc(c.user_id)+'">Request consultation</button></div>').join(''):'<p class="muted">No doctors are available yet. A doctor needs to create a Doctor account first.</p>');
  box.querySelectorAll('[data-pick-doctor]').forEach(b=>b.onclick=()=>{form.value=b.dataset.pickDoctor;form.scrollIntoView({behavior:'smooth',block:'center'});$('cmessage').focus()});
 }
 window.addEventListener('menova-records-loaded',doctors);doctors();
})();
