const screens=[...document.querySelectorAll('.screen')];
const navButtons=[...document.querySelectorAll('.nav [data-go]')];
const STORAGE_KEY='cht_aspiration_neonatologie_web_v2';
const chapters=[
  {name:'Comprendre',start:0,end:4},
  {name:'Décider',start:5,end:7},
  {name:'Préparer',start:8,end:10},
  {name:'DRP',start:11,end:13},
  {name:'ANP / AOP',start:14,end:17},
  {name:'Sécuriser',start:18,end:22}
];
let state={screen:0,visited:[0],answers:{},final:{},finalScore:null};
let toastTimer=null;
let vitalsTimer=null;

function chapterFor(i){return chapters.find(c=>i>=c.start&&i<=c.end)||chapters[0];}
function currentScreenLabel(i){
  const screen=screens[i];
  const eye=screen?.querySelector('.eyebrow')?.textContent?.trim();
  const title=screen?.querySelector('h1')?.innerText?.replace(/\s+/g,' ')?.trim();
  return [eye,title].filter(Boolean).join(' · ');
}
function loadState(){
  TRACKING.init();
  try{
    const raw=localStorage.getItem(STORAGE_KEY)||'';
    if(raw)state={...state,...JSON.parse(raw)};
  }catch(e){}
  state.screen=Math.max(0,Math.min(screens.length-1,Number(state.screen)||0));
  if(!Array.isArray(state.visited)||!state.visited.length)state.visited=[0];
}
function saveState(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){}
  TRACKING.set('location',state.screen);
  TRACKING.commit();
}
function showToast(message){
  const toast=document.getElementById('toast');
  if(!toast)return;
  toast.textContent=message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>toast.classList.remove('show'),3300);
}
function closeNav(){
  document.body.classList.remove('nav-open');
  const t=document.getElementById('menuToggle');
  if(t)t.setAttribute('aria-expanded','false');
}
function openNav(){
  document.body.classList.add('nav-open');
  const t=document.getElementById('menuToggle');
  if(t)t.setAttribute('aria-expanded','true');
}
function updateNav(i){
  const maxVisited=Math.max(...state.visited);
  const unlockedStarts=chapters.filter(c=>c.start<=maxVisited).map(c=>c.start);
  const currentChapter=chapterFor(i);
  const candidates=navButtons.filter(b=>Number(b.dataset.go)<=i && chapterFor(Number(b.dataset.go)).name===currentChapter.name);
  const active=candidates[candidates.length-1]||navButtons.find(b=>Number(b.dataset.go)===currentChapter.start);
  navButtons.forEach(b=>{
    const target=Number(b.dataset.go);
    const ch=chapterFor(target);
    const unlocked=unlockedStarts.includes(ch.start);
    b.disabled=!unlocked;
    b.classList.toggle('active',b===active);
    if(b===active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');
  });
}
function showScreen(i){
  i=Math.max(0,Math.min(screens.length-1,i));
  if(i!==18)clearInterval(vitalsTimer);
  state.screen=i;
  if(!state.visited.includes(i))state.visited.push(i);
  screens.forEach((s,j)=>s.classList.toggle('active',j===i));
  updateNav(i);
  const prev=document.getElementById('prev');
  const next=document.getElementById('next');
  if(prev)prev.disabled=i===0;
  if(next)next.textContent=i===screens.length-1?'Terminer':'Suivant';
  const ch=chapterFor(i);
  document.getElementById('chapterLabel').textContent=ch.name;
  document.getElementById('progressCount').textContent=`${i+1} / ${screens.length}`;
  document.getElementById('pos').textContent=`${i+1} / ${screens.length}`;
  document.getElementById('footerHint').textContent=currentScreenLabel(i);
  document.getElementById('bar').style.width=`${((i+1)/screens.length)*100}%`;
  const stage=document.querySelector('.stage');
  if(stage)stage.scrollTop=0;
  window.scrollTo({top:0,behavior:'auto'});
  closeNav();
  saveState();
}
function setFeedback(fb,ok,goodText,badText){
  if(!fb)return;
  fb.className='feedback show '+(ok?'good':'warn');
  fb.textContent=ok?goodText:badText;
  fb.setAttribute('role','status');
}
function choose(el,key,val,correct,feedback){
  const siblings=el.parentElement.querySelectorAll('.choice');
  siblings.forEach(x=>x.classList.remove('selected','good','bad'));
  const ok=val===correct;
  el.classList.add('selected',ok?'good':'bad');
  state.answers[key]=val;
  const fb=document.getElementById(feedback);
  setFeedback(fb,ok,fb?.dataset.good||'Décision correcte.',fb?.dataset.bad||'Revoyez ce point du protocole.');
  TRACKING.interaction(key,'choice',val,ok?'correct':'wrong');
  saveState();
}
function validateChecks(id,required,key){
  const box=document.getElementById(id);
  const checked=[...box.querySelectorAll('input:checked')].map(x=>x.value);
  const ok=required.every(x=>checked.includes(x))&&checked.every(x=>required.includes(x));
  setFeedback(box.querySelector('.feedback'),ok,'Oui. Vous avez retenu tous les éléments attendus.','Revoyez votre sélection : un élément attendu manque ou un distracteur a été retenu.');
  state.answers[key]=checked;
  TRACKING.interaction(key,'choice',checked.join(','),ok?'correct':'wrong');
  saveState();
}
function validateOrder(){
  const sels=[...document.querySelectorAll('#orderDRP select')];
  const ok=sels.every((s,i)=>Number(s.value)===i+1);
  setFeedback(document.querySelector('#orderDRP .feedback'),ok,'Ordre correct. La DRP se termine par l’observation de la réponse et la décision de s’arrêter ou de poursuivre le raisonnement.','Pas encore. Appuyez-vous sur la logique : évaluer → préparer → installer → réaliser → observer → décider.');
  state.answers.drp_order=sels.map(s=>s.value);
  TRACKING.interaction('drp_order','sequencing',state.answers.drp_order.join(','),ok?'correct':'wrong');
  saveState();
}
function gaugeChanged(v){document.getElementById('gaugeVal').textContent=v+' mbar';}
function validateGauge(){
  const v=Number(document.getElementById('gauge').value);
  const pop=document.getElementById('pop').value;
  const ok=(pop==='prema'&&v>=80&&v<=105)||(pop==='term'&&v>=105&&v<=130);
  setFeedback(document.getElementById('gaugeFb'),ok,'Réglage compris dans la plage indiquée par le protocole.',`Ce réglage n’est pas dans la plage indiquée pour cette population. Prématuré : 80–105 mbar ; nouveau-né à terme : 105–130 mbar ; limite absolue : ≤ 150 mbar.`);
  state.answers.gauge={pop,v};
  TRACKING.interaction('pressure_setting','numeric',String(v),ok?'correct':'wrong');
  saveState();
}
const vitalSequence=[
  {fc:132,spo:94},{fc:127,spo:93},{fc:121,spo:92},{fc:114,spo:90},
  {fc:107,spo:88},{fc:101,spo:86},{fc:98,spo:84},{fc:95,spo:82}
];
let vitalIndex=0;
function paintVitals(){
  const v=vitalSequence[vitalIndex];
  document.getElementById('fc').textContent=v.fc;
  document.getElementById('spo').textContent=v.spo;
}
function startVitals(){
  clearInterval(vitalsTimer);vitalIndex=0;paintVitals();
  const fb=document.getElementById('vitalFb');fb.className='feedback';fb.textContent='';
  vitalsTimer=setInterval(()=>{
    if(vitalIndex<vitalSequence.length-1){vitalIndex++;paintVitals();}
    const v=vitalSequence[vitalIndex];
    if(vitalIndex===vitalSequence.length-1){
      clearInterval(vitalsTimer);
      setFeedback(fb,false,'','Le geste aurait dû être interrompu dès FC < 100 bpm ou SpO₂ < 85 %.');
      TRACKING.interaction('safety_stop','performance','late','wrong');
    }
  },950);
}
function stopVitals(){
  clearInterval(vitalsTimer);
  const fcNow=Number(document.getElementById('fc').textContent);
  const spNow=Number(document.getElementById('spo').textContent);
  const ok=fcNow<100||spNow<85;
  setFeedback(document.getElementById('vitalFb'),ok,'Bonne réaction : le protocole demande d’interrompre immédiatement le geste à l’un de ces seuils.','Vous avez arrêté avant le seuil. Relancez la simulation et surveillez FC et SpO₂.');
  TRACKING.interaction('safety_stop','performance',`${fcNow}/${spNow}`,ok?'correct':'wrong');
  state.answers.safety={fc:fcNow,spo:spNow,ok};saveState();
}
const finalQs=[
 {q:'1. Que faut-il faire avant toute décision ?',a:['Réaliser une ANP','Évaluer l’encombrement','Réaliser une AOP'],c:1},
 {q:'2. Quel est le geste de première intention ?',a:['DRP','ANP','AOP'],c:0},
 {q:'3. Après une DRP efficace, que faites-vous ?',a:['ANP par précaution','AOP','J’arrête le soin'],c:2},
 {q:'4. La DRP est insuffisante et la SpO₂ est à 87 % avec signes de lutte. Quel geste peut être envisagé ?',a:['ANP','AOP systématique','Aucun'],c:0},
 {q:'5. Pour un prématuré < 37 SA, quelle plage de pression est indiquée ?',a:['50–70 mbar','80–105 mbar','105–130 mbar'],c:1},
 {q:'6. Pendant l’ANP, l’aspiration est activée…',a:['Pendant l’introduction','Uniquement au retrait','En continu'],c:1},
 {q:'7. La FC passe à 98 bpm pendant le geste. Que faites-vous ?',a:['Je poursuis','J’interromps immédiatement','J’attends la SpO₂'],c:1},
 {q:'8. Après le geste, que faut-il faire ?',a:['Évaluer tolérance/douleur et tracer le soin','Aucune action si l’enfant est calme','Réaliser systématiquement une gazométrie'],c:0}
];
function renderFinal(){
  const host=document.getElementById('finalCase');if(!host)return;host.innerHTML='';
  finalQs.forEach((x,i)=>{
    const d=document.createElement('div');d.className='caseStep'+(i===0?' active':'');d.dataset.i=i;
    d.innerHTML=`<div class="case-progress">Décision ${i+1} sur ${finalQs.length}</div><h3>${x.q}</h3><div class="choices">${x.a.map((a,j)=>`<button class="choice" onclick="finalAnswer(${i},${j},this)"><span class="choice-key">${String.fromCharCode(65+j)}</span><span class="choice-text">${a}</span></button>`).join('')}</div><div class="feedback"></div>`;
    host.appendChild(d);
  });
}
function finalAnswer(i,j,el){
  const x=finalQs[i];const step=document.querySelector(`.caseStep[data-i="${i}"]`);if(!step)return;
  step.querySelectorAll('.choice').forEach(b=>b.disabled=true);
  const ok=j===x.c;el.classList.add(ok?'good':'bad');
  setFeedback(step.querySelector('.feedback'),ok,'Décision correcte.','Cette décision n’est pas conforme au protocole. La correction sera reprise dans la synthèse.');
  state.final[i]=j;TRACKING.interaction('final_'+(i+1),'choice',String(j),ok?'correct':'wrong');saveState();
  setTimeout(()=>{step.classList.remove('active');const next=document.querySelector(`.caseStep[data-i="${i+1}"]`);if(next)next.classList.add('active');else finishFinal();},520);
}
function finishFinal(){
  const correct=finalQs.reduce((n,x,i)=>n+(state.final[i]===x.c?1:0),0);
  const score=Math.round(correct/finalQs.length*100);state.finalScore=score;
  const host=document.getElementById('finalCase');
  host.innerHTML=`<div class="info result-panel"><div class="summaryScore">${score} %</div><p><strong>${correct} décision(s) conforme(s) sur ${finalQs.length}.</strong></p><p>Cette situation finale vérifie le raisonnement professionnel. Le protocole source ne fixe pas de seuil de réussite.</p><button class="cta" onclick="showScreen(${screens.length-1})">Voir la synthèse</button></div>`;
  saveState();
}
function restoreUI(){
  document.querySelectorAll('button.choice[onclick^="choose"]').forEach(btn=>{
    const raw=btn.getAttribute('onclick')||'';
    const m=raw.match(/choose\(this,'([^']+)','([^']+)','([^']+)'/);if(!m)return;
    const [,key,val,correct]=m;
    if(state.answers[key]===val)btn.classList.add('selected',val===correct?'good':'bad');
  });
  const checkMaps={observation:'observeChecks',material:'materialChecks',beforecare:'beforeChecks',aftercare:'afterChecks'};
  Object.entries(checkMaps).forEach(([key,id])=>{
    const vals=state.answers[key];if(!Array.isArray(vals))return;
    document.querySelectorAll(`#${id} input[type="checkbox"]`).forEach(x=>x.checked=vals.includes(x.value));
  });
  if(state.answers.gauge){
    const {pop,v}=state.answers.gauge;
    const p=document.getElementById('pop'),g=document.getElementById('gauge');
    if(p)p.value=pop;if(g){g.value=v;gaugeChanged(v);}
  }
  if(Array.isArray(state.answers.drp_order)){
    document.querySelectorAll('#orderDRP select').forEach((s,i)=>s.value=state.answers.drp_order[i]||'');
  }
  if(state.finalScore!==null){
    finishFinal();
  }else{
    const answered=Object.keys(state.final).map(Number).filter(i=>Number.isInteger(i)).sort((a,b)=>a-b);
    if(answered.length){
      document.querySelectorAll('.caseStep').forEach(x=>x.classList.remove('active'));
      answered.forEach(i=>{
        const step=document.querySelector(`.caseStep[data-i="${i}"]`);
        const answer=state.final[i];
        if(!step||answer===undefined)return;
        const buttons=[...step.querySelectorAll('.choice')];
        buttons.forEach(b=>b.disabled=true);
        const selected=buttons[answer];
        if(selected)selected.classList.add(answer===finalQs[i].c?'good':'bad');
        setFeedback(step.querySelector('.feedback'),answer===finalQs[i].c,'Décision correcte.','Cette décision n’est pas conforme au protocole. La correction sera reprise dans la synthèse.');
      });
      const nextIndex=Math.min(answered.length,finalQs.length-1);
      document.querySelector(`.caseStep[data-i="${nextIndex}"]`)?.classList.add('active');
    }
  }
}
function fullscreen(){
  if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.();
}
function updateFullscreenLabel(){
  const btn=document.getElementById('fullscreenBtn');if(!btn)return;
  const active=!!document.fullscreenElement;
  btn.textContent=active?'Quitter le plein écran':'Plein écran';
  btn.setAttribute('aria-label',active?'Quitter le plein écran':'Entrer en plein écran');
}
function finishCourse(){
  showToast('Parcours terminé. Votre progression reste enregistrée sur cet appareil.');
  state.completed=true;saveState();
}

document.getElementById('prev').onclick=()=>showScreen(state.screen-1);
document.getElementById('next').onclick=()=>state.screen===screens.length-1?finishCourse():showScreen(state.screen+1);
navButtons.forEach(b=>b.onclick=()=>showScreen(Number(b.dataset.go)));
document.getElementById('menuToggle')?.addEventListener('click',()=>document.body.classList.contains('nav-open')?closeNav():openNav());
document.getElementById('navClose')?.addEventListener('click',closeNav);
document.getElementById('navOverlay')?.addEventListener('click',closeNav);
document.addEventListener('fullscreenchange',updateFullscreenLabel);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeNav();});
window.addEventListener('beforeunload',()=>TRACKING.finish());

loadState();
renderFinal();
restoreUI();
showScreen(state.screen);
updateFullscreenLabel();
