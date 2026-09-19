/**
 * ear-trainer-guided-tour.js
 * Guided tour for the Traditional Irish Tune Rhythm, Key, and Mode Ear Trainer.
 * Uses the Website Builder guided-tour overlay/card/highlight pattern.
 */
(function(){
"use strict";
var STORAGE_KEY="earTrainerGuidedTourCompleted";
var tourRunning=false,overlay=null,card=null,arrow=null,highlightedElement=null,layoutHandler=null;

function injectStyles(){
  if(document.getElementById("ear-trainer-guided-tour-styles"))return;
  var style=document.createElement("style");
  style.id="ear-trainer-guided-tour-styles";
  style.textContent=`
  .ear-trainer-tour-overlay{position:fixed;inset:0;background:rgba(0,0,0,.18);z-index:2500;pointer-events:auto}
  .ear-trainer-tour-card{position:fixed;z-index:2147483646;width:min(460px,calc(100vw - 24px));max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow-y:auto;overscroll-behavior:contain;background:#f5ffff;border:1px solid #bfcfcf;border-radius:5px;box-shadow:0 10px 26px rgba(0,0,0,.25);padding:24px;box-sizing:border-box;font-family:helvetica,arial,sans-serif;color:#000}
  .ear-trainer-tour-card h2{margin:0 0 10px;font-size:1.45em;line-height:normal;text-align:left;color:#000!important}
  .ear-trainer-tour-card p{margin:0 0 10px;color:#000!important;font-size:12pt;line-height:18pt}
  .ear-trainer-tour-arrow{position:fixed;z-index:2147483645;width:0;height:0;pointer-events:none}
  .ear-trainer-tour-arrow.down{border-left:10px solid transparent;border-right:10px solid transparent;border-top:12px solid #bfcfcf}
  .ear-trainer-tour-arrow.down::after{content:"";position:absolute;left:-9px;top:-13px;border-left:9px solid transparent;border-right:9px solid transparent;border-top:11px solid #f5ffff}
  .ear-trainer-tour-arrow.up{border-left:10px solid transparent;border-right:10px solid transparent;border-bottom:12px solid #bfcfcf}
  .ear-trainer-tour-arrow.up::after{content:"";position:absolute;left:-9px;top:2px;border-left:9px solid transparent;border-right:9px solid transparent;border-bottom:11px solid #f5ffff}
  .ear-trainer-tour-footer{margin-top:14px;padding-top:12px;border-top:1px solid #d8e3e3}
  .ear-trainer-tour-count{text-align:center;font-size:.95em;color:#333;margin-bottom:12px}
  .ear-trainer-tour-buttons{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
  .ear-trainer-tour-buttons button{min-width:96px;padding:7px 16px;border:1px solid #aaa;border-radius:6px;background:#e5e5e5;color:#000;font-size:11pt;font-family:helvetica,arial,sans-serif;cursor:pointer}
  .ear-trainer-tour-buttons button:hover,.ear-trainer-tour-buttons button:focus-visible{background:#d5d5d5;outline:none}
  .ear-trainer-tour-highlight{position:relative;z-index:2147483644!important;box-shadow:0 0 0 4px rgba(0,90,173,.30),0 0 0 9999px rgba(255,255,255,.06)!important;border-radius:8px}
  @media(max-height:720px){.ear-trainer-tour-card{padding:18px 20px}.ear-trainer-tour-card h2{margin-bottom:8px;font-size:1.3em}.ear-trainer-tour-card p{margin-bottom:8px;font-size:11pt;line-height:16pt}.ear-trainer-tour-footer{margin-top:10px;padding-top:9px}.ear-trainer-tour-count{margin-bottom:8px}.ear-trainer-tour-buttons button{padding:6px 14px}}
  `;
  document.head.appendChild(style);
}
function clearUI(){
  if(layoutHandler){window.removeEventListener("resize",layoutHandler);window.removeEventListener("scroll",layoutHandler,true);layoutHandler=null}
  if(highlightedElement){highlightedElement.classList.remove("ear-trainer-tour-highlight");highlightedElement=null}
  if(arrow){arrow.remove();arrow=null} if(card){card.remove();card=null} if(overlay){overlay.remove();overlay=null}
}
function targetFor(step){return step.selector?document.querySelector(step.selector):null}
function positionCard(target){
  if(!card)return;
  var gap=24,margin=12,cw=card.offsetWidth,ch=Math.min(card.offsetHeight,window.innerHeight-margin*2);
  var left=Math.max(margin,(window.innerWidth-cw)/2),top=Math.max(margin,(window.innerHeight-ch)/3),placement="center";
  if(target){
    var r=target.getBoundingClientRect(),below=window.innerHeight-r.bottom,above=r.top;
    if(below>=ch+gap){top=r.bottom+gap;placement="below"}
    else if(above>=ch+gap){top=r.top-ch-gap;placement="above"}
    else top=Math.max(margin,Math.min(window.innerHeight-ch-margin,(window.innerHeight-ch)/2));
    left=Math.max(margin,Math.min(window.innerWidth-cw-margin,r.left+(r.width-cw)/2));
  }
  card.style.left=Math.round(left)+"px";card.style.top=Math.round(top)+"px";

  if(arrow){arrow.remove();arrow=null}
  if(target&&placement!=="center"){
    var tr=target.getBoundingClientRect();
    arrow=document.createElement("div");
    arrow.className="ear-trainer-tour-arrow "+(placement==="below"?"up":"down");
    document.body.appendChild(arrow);
    var targetCenter=tr.left+tr.width/2;
    var arrowX=Math.max(14,Math.min(window.innerWidth-14,targetCenter));
    arrow.style.left=Math.round(arrowX-10)+"px";
    if(placement==="below"){
      arrow.style.top=Math.round(top-12)+"px";
    }else{
      arrow.style.top=Math.round(top+card.offsetHeight)+"px";
    }
  }
}
function ensureVisible(target){
  if(!target)return Promise.resolve();
  var r=target.getBoundingClientRect();
  if(r.top<12||r.bottom>window.innerHeight-12){target.scrollIntoView({behavior:"smooth",block:"center",inline:"nearest"});return new Promise(function(resolve){setTimeout(resolve,300)})}
  return Promise.resolve();
}
function steps(){return[
 {title:"Welcome to the Guided Tour",body:"<p>This quick tour shows you how to choose an exercise and instrument, listen to a tune, answer the questions, and review your progress.</p>"},
 {title:"1. Choose an Answer Style",selector:"#answerStyle",body:"<p>Choose what you want to identify by ear: rhythm, key, mode, or a combination of them. Your choice is saved in this browser.</p>"},
 {title:"2. Choose the Playback Instrument",selector:"#instrument",body:"<p>Choose the instrument used for tune, root-note, and scale playback. Your choice is saved in this browser.</p>"},
 {title:"3. Choose the Number of Questions",selector:"#questionCount",body:"<p>Choose 10 questions (the default), 25 questions, or Unlimited. Your choice is saved in this browser. Unlimited mode keeps giving you random tunes, never repeats the same tune twice in a row, and has no progress bar or final review; Session Progress shows running Correct and Incorrect totals instead.</p>"},
 {title:"4. Listen to the Tune",selector:"#tuneAudioControls",body:"<p>Use this playback bar to listen to the current tune. Tunes loop automatically. The answer choices become available after you start playback.</p>"},
 {title:"5. Choose Your Answer",selector:"#answerChoiceLayout",body:"<p>Select your answer for each question shown here. The questions depend on the Answer Style you selected.</p>"},
 {title:"6. Submit and Review",selector:"#submitBtn",body:"<p>Click <strong>Submit Answer</strong> to check your response. The trainer shows the correct answer and identifies the tune. For key and/or mode exercises, you can also listen to root notes and scales to reinforce or compare your answers.</p>"},
 {title:"7. Follow Your Progress",selector:".progressCard",body:"<p>Session Progress shows how many tunes you have answered and your current accuracy during the session.</p>"},
 {title:"8. Move Through the Session",selector:"#nextBtn",body:"<p>For 10- and 25-question sessions, use <strong>Next Tune</strong> and <strong>Previous Tune</strong> to move through the session. After the final tune, <strong>Show Final Review</strong> displays your session results and lets you practice any tunes you missed. In Unlimited mode, <strong>Next Tune</strong> continues with another random tune and there is no Final Review.</p>"},
 {title:"Tour Complete",selector:"#instructionsBtn",body:"<p>You’re ready to begin. Full instructions are always available from <strong>Instructions</strong>. To take this tour again, click <strong>Run Guided Tour</strong> at the top of the Instructions.</p>"}
]}
function showStep(step,index,total){return new Promise(async function(resolve){
  clearUI();var target=targetFor(step);await ensureVisible(target);
  if(target){target.classList.add("ear-trainer-tour-highlight");highlightedElement=target}
  overlay=document.createElement("div");overlay.className="ear-trainer-tour-overlay";document.body.appendChild(overlay);
  card=document.createElement("div");card.className="ear-trainer-tour-card";var last=index===total-1;
  card.innerHTML="<h2>"+step.title+"</h2>"+step.body+'<div class="ear-trainer-tour-footer"><div class="ear-trainer-tour-count">Step '+(index+1)+" of "+total+'</div><div class="ear-trainer-tour-buttons"><button type="button" data-action="exit">Close Tour</button><button type="button" data-action="'+(last?"done":"next")+'">'+(last?"Done":"Next")+"</button></div></div>";
  document.body.appendChild(card);positionCard(target);
  layoutHandler=function(){positionCard(target)};window.addEventListener("resize",layoutHandler);window.addEventListener("scroll",layoutHandler,true);
  Array.prototype.forEach.call(card.querySelectorAll("button[data-action]"),function(button){button.addEventListener("click",function(){var action=button.getAttribute("data-action");clearUI();resolve(action)})});
  overlay.addEventListener("click",function(){clearUI();resolve("exit")},{once:true});
})}
function storageAvailable(){
  try{
    var testKey=STORAGE_KEY+"StorageTest";
    localStorage.setItem(testKey,"1");
    localStorage.removeItem(testKey);
    return true;
  }catch(e){return false}
}
function markSeen(){try{localStorage.setItem(STORAGE_KEY,"1")}catch(e){}}
function hasSeen(){try{return localStorage.getItem(STORAGE_KEY)==="1"}catch(e){return false}}
async function runTour(){
  if(tourRunning)return;injectStyles();tourRunning=true;markSeen();
  try{var list=steps();for(var i=0;i<list.length;i++){var action=await showStep(list[i],i,list.length);if(action!=="next")break}}
  finally{clearUI();tourRunning=false}
}
function runFirstTimeTourIfNeeded(){if(!storageAvailable()||hasSeen())return;setTimeout(function(){if(storageAvailable()&&!hasSeen())void runTour()},500)}
window.StartEarTrainerGuidedTour=runTour;
window.StartEarTrainerFirstRunTourIfNeeded=runFirstTimeTourIfNeeded;
})();