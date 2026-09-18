/**
 * tune-name-ear-trainer-guided-tour.js
 * Guided tour for the Traditional Irish Tune Name Ear Trainer.
 * Uses the Website Builder guided-tour overlay/card/highlight pattern.
 */
(function(){
"use strict";
var STORAGE_KEY="tuneNameEarTrainerGuidedTourCompleted";
var tourRunning=false,overlay=null,card=null,arrow=null,highlightedElement=null,layoutHandler=null;

function injectStyles(){
  if(document.getElementById("tune-name-ear-trainer-guided-tour-styles"))return;
  var style=document.createElement("style");
  style.id="tune-name-ear-trainer-guided-tour-styles";
  style.textContent=`
  .tune-name-tour-overlay{position:fixed;inset:0;background:rgba(0,0,0,.18);z-index:2500;pointer-events:auto}
  .tune-name-tour-card{position:fixed;z-index:2147483646;width:min(460px,calc(100vw - 24px));max-width:calc(100vw - 24px);max-height:calc(100vh - 24px);overflow-y:auto;overscroll-behavior:contain;background:#f5ffff;border:1px solid #bfcfcf;border-radius:5px;box-shadow:0 10px 26px rgba(0,0,0,.25);padding:24px;box-sizing:border-box;font-family:helvetica,arial,sans-serif;color:#000}
  .tune-name-tour-card h2{margin:0 0 10px;font-size:1.45em;line-height:normal;text-align:left;color:#000!important}
  .tune-name-tour-card p{margin:0 0 10px;color:#000!important;font-size:12pt;line-height:18pt}
  .tune-name-tour-arrow{position:fixed;z-index:2147483645;width:0;height:0;pointer-events:none}
  .tune-name-tour-arrow.down{border-left:10px solid transparent;border-right:10px solid transparent;border-top:12px solid #bfcfcf}
  .tune-name-tour-arrow.down::after{content:"";position:absolute;left:-9px;top:-13px;border-left:9px solid transparent;border-right:9px solid transparent;border-top:11px solid #f5ffff}
  .tune-name-tour-arrow.up{border-left:10px solid transparent;border-right:10px solid transparent;border-bottom:12px solid #bfcfcf}
  .tune-name-tour-arrow.up::after{content:"";position:absolute;left:-9px;top:2px;border-left:9px solid transparent;border-right:9px solid transparent;border-bottom:11px solid #f5ffff}
  .tune-name-tour-footer{margin-top:14px;padding-top:12px;border-top:1px solid #d8e3e3}
  .tune-name-tour-count{text-align:center;font-size:.95em;color:#333;margin-bottom:12px}
  .tune-name-tour-buttons{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
  .tune-name-tour-buttons button{min-width:96px;padding:7px 16px;border:1px solid #aaa;border-radius:6px;background:#e5e5e5;color:#000;font-size:11pt;line-height:1.15;font-family:helvetica,arial,sans-serif;cursor:pointer}
  .tune-name-tour-buttons button:hover,.tune-name-tour-buttons button:focus-visible{background:#d5d5d5;outline:none}
  .tune-name-tour-highlight{position:relative;z-index:2147483644!important;box-shadow:0 0 0 4px rgba(0,90,173,.30),0 0 0 9999px rgba(255,255,255,.06)!important;border-radius:8px}
  @media(max-height:720px){.tune-name-tour-card{padding:18px 20px}.tune-name-tour-card h2{margin-bottom:8px;font-size:1.3em}.tune-name-tour-card p{margin-bottom:8px;font-size:11pt;line-height:16pt}.tune-name-tour-footer{margin-top:10px;padding-top:9px}.tune-name-tour-count{margin-bottom:8px}.tune-name-tour-buttons button{padding:6px 14px}}
  `;
  document.head.appendChild(style);
}
function clearUI(){
  if(layoutHandler){window.removeEventListener("resize",layoutHandler);window.removeEventListener("scroll",layoutHandler,true);layoutHandler=null}
  if(highlightedElement){highlightedElement.classList.remove("tune-name-tour-highlight");highlightedElement=null}
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
    arrow.className="tune-name-tour-arrow "+(placement==="below"?"up":"down");
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
function steps(){
  return [
    {
      title:"Welcome to the Guided Tour",
      body:"<p>This quick tour shows you how to listen to a tune, identify its name, choose how many names are shown, use your own ABC collection, and review missed tunes.</p>"
    },
    {
      title:"1. Choose the Playback Instrument",
      selector:"#instrument",
      body:"<p>Choose the instrument used for tune playback. Your choice is saved in this browser when local storage is available.</p>"
    },
    {
      title:"2. Choose the Number of Tune Names",
      selector:"#choiceCount",
      body:"<p>Choose 2, 4, 6, 8, or 10 possible tune names for each question. The default is 6. Changing this setting during a session requires confirmation and starts a new 10-tune session.</p>"
    },
    {
      title:"3. Choose the Tune Collection",
      selector:"#customCollectionControls",
      body:"<p>When browser local storage is available, you can load your own .abc or .txt file. It must contain at least ten tunes with ten distinct first T: titles. It is validated and saved in this browser. Restore Default Tunes returns to the original collection.</p>"
    },
    {
      title:"4. Listen to the Tune",
      selector:"#tuneAudioControls",
      body:"<p>Use this playback bar to listen to the current tune. The tune-name choices become available after you start playback.</p>"
    },
    {
      title:"5. Choose the Tune Name",
      selector:"#tuneChoices",
      body:"<p>Select the tune name you think matches what you hear. Only tune names are shown.</p>"
    },
    {
      title:"6. Submit Your Answer",
      selector:"#submitBtn",
      body:"<p>Click Submit Answer to check your choice. The correct tune name is then shown.</p>"
    },
    {
      title:"7. Follow Your Progress",
      selector:".progressCard",
      body:"<p>Session Progress shows how many answers you have submitted and your current accuracy.</p>"
    },
    {
      title:"8. Finish and Review",
      selector:"#nextBtn",
      body:"<p>Each regular session contains 10 randomly selected tunes. After the last tune, Show Final Review lists the tune names you missed and lets you practice them again.</p>"
    },
    {
      title:"Tour Complete",
      selector:"#instructionsBtn",
      body:"<p>Full instructions are always available here, including a button to run this tour again.</p>"
    }
  ]
}
function showStep(step,index,total){return new Promise(async function(resolve){
  clearUI();var target=targetFor(step);await ensureVisible(target);
  if(target){target.classList.add("tune-name-tour-highlight");highlightedElement=target}
  overlay=document.createElement("div");overlay.className="tune-name-tour-overlay";document.body.appendChild(overlay);
  card=document.createElement("div");card.className="tune-name-tour-card";var last=index===total-1;
  card.innerHTML="<h2>"+step.title+"</h2>"+step.body+'<div class="tune-name-tour-footer"><div class="tune-name-tour-count">Step '+(index+1)+" of "+total+'</div><div class="tune-name-tour-buttons"><button type="button" data-action="exit">Close Tour</button><button type="button" data-action="'+(last?"done":"next")+'">'+(last?"Done":"Next")+"</button></div></div>";
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
window.StartTuneNameEarTrainerGuidedTour=runTour;
window.StartTuneNameEarTrainerFirstRunTourIfNeeded=runFirstTimeTourIfNeeded;
})();