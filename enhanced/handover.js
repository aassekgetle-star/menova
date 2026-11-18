/* MENOVA member-approved handover and real-data wellness trends.
   Runs locally in the member's authenticated browser. No external AI service is used. */
(function(){
 const $=id=>document.getElementById(id);
 let assessments=[],diaryEntries=[],handovers=[],previewSnapshot=null;
 const periodStart=period=>{const d=new Date();if(period==='week')d.setDate(d.getDate()-6);else if(period==='month')d.setDate(1);else d.setMonth(0,1);d.setHours(0,0,0,0);return d};
 async function loadHandoverData(){
  if(!window.session)return;
  const uid=window.session.user.id;
  const q=await Promise.all([
   window.sb.from('health_assessments').select('*').eq('member_user_id',uid).order('created_at',{ascending:false}).limit(100),
   window.sb.from('diary_entries').select('*').eq('member_user_id',uid).order('created_at',{ascending:false}).limit(200),
   window.sb.from('health_handovers').select('id,clinician_user_id,consent_id,shared_snapshot,status,created_at').eq('member_user_id',uid).order('created_at',{ascending:false}).limit(100),
   window.sb.from('clinician_profiles').select('user_id,display_name,specialty,verification_status').in('verification_status',['verified','self_reported']).order('display_name')
  ]);
  const bad=q.find(x=>x.error);if(bad){$('hoStatus').textContent='Could not load handover records: '+bad.error.message;return}
  assessments=q[0].data||[];diaryEntries=q[1].data||[];handovers=q[2].data||[];
  window.handoverClinicians=q[3].data||[];
  $('hoClinician').innerHTML='<option value="">Select a clinician</option>'+window.handoverClinicians.map(c=>'<option value="'+c.user_id+'">'+window.esc(c.display_name)+' · '+window.esc(c.specialty||'Clinician')+' · '+(c.verification_status==='verified'?'Verified':'Self-reported prototype')+'</option>').join('');
  renderHandovers();
 }
 function selectedSnapshot(){
  const s={};
  if($('hoAssessment').checked)s.assessments=assessments;
  if($('hoDiary').checked)s.diary_entries=diaryEntries;
  if($('hoLifestyle').checked)s.lifestyle_checkins=window.habits||[];
  if($('hoTests').checked)s.test_results={biomarker_records:window.biomarkers||[],lab_results:window.labs||[]};
  if($('hoInsights').checked)s.wellness_overview={checkin_count:(window.habits||[]).length,diary_count:diaryEntries.length,biomarker_count:(window.biomarkers||[]).length,lab_count:(window.labs||[]).length};
  return s;
 }
 function preview(){
  previewSnapshot=selectedSnapshot();
  if(!Object.keys(previewSnapshot).length){$('hoPreviewBox').textContent='Select at least one category.';$('hoApprove').disabled=true;return}
  $('hoPreviewBox').innerHTML='<b>Preview of the exact snapshot to be shared</b>'+Object.entries(previewSnapshot).map(([k,v])=>'<div class="item"><b>'+window.esc(k.replaceAll('_',' '))+'</b><p>'+window.esc(Array.isArray(v)?v.length+' records':JSON.stringify(v).slice(0,500))+'</p></div>').join('')+'<p>'+window.esc($('hoMessage').value)+'</p><p class="small muted">Uploaded report files are not directly attached in this release. Test values and report metadata are included; secure clinician file access requires a separate scoped storage implementation.</p>';
  $('hoApprove').disabled=false;
 }
 async function approve(){
  const clinician=$('hoClinician').value;
  if(!clinician||!previewSnapshot||!Object.keys(previewSnapshot).length){$('hoStatus').textContent='Choose a clinician and preview selected information first.';return}
  if(!confirm('Share only the previewed information with this clinician?'))return;
  const selected={sections:Object.keys(previewSnapshot),clinician_user_id:clinician};
  const {data:consent,error:ce}=await window.sb.from('sharing_consents').insert({member_user_id:window.session.user.id,purpose:'Member-approved MENOVA health handover',selected_sections:selected,approved_snapshot:previewSnapshot}).select().single();
  if(ce){$('hoStatus').textContent='Consent could not be saved: '+ce.message;return}
  const snapshot={...previewSnapshot,member_message:$('hoMessage').value,approved_at:consent.approved_at};
  const {data:row,error}=await window.sb.from('health_handovers').insert({member_user_id:window.session.user.id,clinician_user_id:clinician,consent_id:consent.id,shared_snapshot:snapshot,status:'approved_for_sharing',is_simulated:true}).select().single();
  if(error){await window.sb.from('sharing_consents').update({revoked_at:new Date().toISOString()}).eq('id',consent.id);$('hoStatus').textContent='Handover failed; consent was closed: '+error.message;return}
  handovers.unshift(row);renderHandovers();$('hoStatus').textContent='Approved snapshot shared with the selected clinician.';
 }
 async function revoke(consentId,handoverId){
  if(!confirm('Revoke future access? Information already viewed, copied or downloaded cannot be recalled.'))return;
  const {error}=await window.sb.from('sharing_consents').update({revoked_at:new Date().toISOString()}).eq('id',consentId).eq('member_user_id',window.session.user.id);
  if(error){$('hoStatus').textContent='Revocation failed: '+error.message;return}
  await window.sb.from('health_handovers').update({status:'revoked'}).eq('id',handoverId).eq('member_user_id',window.session.user.id);
  $('hoStatus').textContent='Access revoked.';await loadHandoverData();
 }
 function renderHandovers(){
  $('hoMemberList').innerHTML=handovers.map(h=>'<div class="item"><b>'+window.esc(new Date(h.created_at).toLocaleString())+' · '+window.esc(h.status)+'</b><p>Clinician: '+window.esc((window.handoverClinicians||[]).find(c=>c.user_id===h.clinician_user_id)?.display_name||'Assigned clinician')+'</p>'+(h.status!=='revoked'?'<button data-ho-revoke="'+h.consent_id+'" data-ho-id="'+h.id+'">Revoke access</button>':'')+'</div>').join('')||'<p class="muted">No handovers recorded.</p>';
  document.querySelectorAll('[data-ho-revoke]').forEach(b=>b.onclick=()=>revoke(b.dataset.hoRevoke,b.dataset.hoId));
 }
 function renderCharts(){
  const host=$('wellnessCharts');if(!host||!window.habits)return;
  const period=$('trendPeriod')?.value||'month',start=periodStart(period),rows=window.habits.filter(x=>new Date(x.checkin_date+'T00:00:00')>=start);
  const metrics=[['sleep_hours','Sleep hours',24],['stress_level','Stress (0–10)',10],['activity_minutes','Activity minutes',1440]];
  let html='<p class="small muted">'+rows.length+' recorded lifestyle check-ins in this period. No missing values are fabricated.</p>';
  metrics.forEach(([key,label,max])=>{
   const vals=rows.filter(r=>r[key]!==null&&r[key]!==undefined&&Number.isFinite(Number(r[key])));
   html+='<div class="item"><b>'+label+'</b>';
   if(!vals.length)html+='<p class="muted">No values recorded for this period.</p>';
   else html+='<div class="chart-bars">'+vals.map(r=>'<div class="chart-col"><div class="chart-bar" style="height:'+Math.max(2,Math.min(100,Number(r[key])/max*100))+'%"></div><span>'+window.esc(r.checkin_date.slice(5))+'</span><b>'+window.esc(r[key])+'</b></div>').join('')+'</div>';
   html+='</div>';
  });
  const diary=diaryEntries.filter(x=>new Date(x.created_at)>=start).length;
  const testCount=(window.biomarkers||[]).filter(x=>new Date(x.collection_date+'T00:00:00')>=start).length+(window.labs||[]).filter(x=>new Date(x.test_date+'T00:00:00')>=start).length;
  html+='<div class="grid"><div class="item"><b>Journal entries</b><p>'+diary+'</p></div><div class="item"><b>Test results</b><p>'+testCount+'</p></div><div class="item"><b>Check-ins</b><p>'+rows.length+'</p></div></div>';
  host.innerHTML=html;
 }
 window.getMemberTrendContext=function(){
  const period=$('trendPeriod')?.value||'month',start=periodStart(period),h=(window.habits||[]).filter(x=>new Date(x.checkin_date+'T00:00:00')>=start),d=diaryEntries.filter(x=>new Date(x.created_at)>=start),b=(window.biomarkers||[]).filter(x=>new Date(x.collection_date+'T00:00:00')>=start),l=(window.labs||[]).filter(x=>new Date(x.test_date+'T00:00:00')>=start);
  const avg=k=>{const a=h.map(x=>Number(x[k])).filter(Number.isFinite);return a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):'not recorded'};
  const diaryThemes=d.flatMap(x=>Array.isArray(x.topic_tags)?x.topic_tags:[]).slice(0,20);
  return 'Member-authorised period context ('+period+'): '+h.length+' lifestyle check-ins; average sleep '+avg('sleep_hours')+' hours; average stress '+avg('stress_level')+'/10; average activity '+avg('activity_minutes')+' minutes. Sleep quality values: '+h.map(x=>x.sleep_quality).filter(Boolean).join(', ')+'; nutrition patterns: '+h.map(x=>x.nutrition_pattern).filter(Boolean).join(', ')+'; heat exposure: '+h.map(x=>x.heat_exposure).filter(Boolean).join(', ')+'; smoking records: '+h.map(x=>x.smoking_status).filter(Boolean).join(', ')+'; alcohol records: '+h.map(x=>x.alcohol_frequency).filter(Boolean).join(', ')+'; medication changes recorded: '+h.filter(x=>x.medication_changes).length+'. '+d.length+' diary entries; diary topic tags: '+diaryThemes.join(', ')+'. '+b.length+' biomarker results and '+l.length+' lab parameters. Do not infer diagnosis, causation, fertility, or abnormality. Do not interpret numeric results; preserve lab reference intervals and ask the member to discuss them with a clinician.';
 };
 window.loadHandoverRecords=loadHandoverData;
 $('hoPreview').addEventListener('click',preview);$('hoApprove').addEventListener('click',approve);
 $('trendPeriod').addEventListener('change',renderCharts);
 window.addEventListener('load',()=>setTimeout(loadHandoverData,800));
 window.addEventListener('menova-records-loaded',()=>{renderCharts();loadHandoverData()});
 const originalTab=window.tab;window.tab=function(id){originalTab(id);if(id==='handover')loadHandoverData();if(id==='insights')renderCharts()};
 setTimeout(renderCharts,1200);
})();
