(function(){
"use strict";

var VERSION="1.77";
var FATBOY="https://michaeleskin.com/abctools/soundfonts/fatboy_4/";
var SESSION_LENGTH=10;
var MODE_INFO={
  major:{label:"Major",shortLabel:"Major",abcSuffix:""},
  dorian:{label:"Dorian",shortLabel:"Dorian",abcSuffix:"dor"},
  mixolydian:{label:"Mixolydian",shortLabel:"Mixolydian",abcSuffix:"mix"}
};
var MODE_ORDER=["major","dorian","mixolydian"];
var allTunes=[];
var tuneById={};
var state=null;
var tuneController=null;
var tunePreparePromise=null;
var chosenScaleController=null;
var correctScaleController=null;
var chosenRootController=null;
var correctRootController=null;
var activeScale=null;
var activeRoot=null;
var prepareSerial=0;

function $(id){return document.getElementById(id);}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
function stableTuneId(abc){
  // Deterministic FNV-1a style hash of the complete tune text. Unlike the old
  // positional IDs, this survives filtering, reordering, and collection expansion.
  var text=String(abc||"").replace(/\r\n?/g,"\n").trim();
  var h=2166136261;
  for(var i=0;i<text.length;i++){
    h^=text.charCodeAt(i);
    h=Math.imul(h,16777619);
  }
  return "t"+(h>>>0).toString(36);
}
function normalizeTonic(s){
  var m=String(s||"").trim().match(/^([A-Ga-g])([#b]?)/);
  if(!m)return "";
  var accidental=m[2]==="#"?"#":(m[2]?"b":"");
  return m[1].toUpperCase()+accidental;
}
function parseKey(k){
  k=String(k||"").trim();
  var tonic=normalizeTonic(k);
  if(!tonic)return null;

  // ABC permits both compact and spaced mode names, with arbitrary case:
  // Edor / E Dor / E Dorian, DMaj / D Major, Dmix / D Mixolydian.
  // Minor spellings are recognized only so they can be rejected cleanly; this trainer supports Major, Dorian, and Mixolydian.
  var rest=k.slice(tonic.length).trim();
  if(!rest)return {tonic:tonic,mode:"major"};

  var modeMatch=rest.match(/^(major|maj|ionian|ion|minor|min|aeolian|aeo|dorian|dor|mixolydian|mix|m)(?=\s|$|[^A-Za-z])/i);
  if(modeMatch){
    var token=modeMatch[1].toLowerCase();
    if(token==="major"||token==="maj"||token==="ionian"||token==="ion")return {tonic:tonic,mode:"major"};
    if(token==="minor"||token==="min"||token==="aeolian"||token==="aeo"||token==="m")return null;
    if(token==="dorian"||token==="dor")return {tonic:tonic,mode:"dorian"};
    if(token==="mixolydian"||token==="mix")return {tonic:tonic,mode:"mixolydian"};
  }

  // A bare key followed immediately by normal ABC K: parameters is still major.
  if(/^(clef|middle|transpose|octave|stafflines|staffscale|style|map|score|voices?)\s*=/i.test(rest))return {tonic:tonic,mode:"major"};
  return null;
}
function parseTunes(text){
  var chunks=String(text||"").replace(/\r\n?/g,"\n").split(/(?=^X\s*:)/m).filter(function(x){return /^X\s*:/m.test(x);});
  var out=[];
  chunks.forEach(function(abc,n){
    var km=abc.match(/^K\s*:\s*(.+)$/mi); if(!km)return;
    var key=parseKey(km[1]); if(!key)return;
    var tm=abc.match(/^T\s*:\s*(.*)$/mi);
    var rm=abc.match(/^R\s*:\s*(.*)$/mi);
    var normalizedAbc=abc.trim()+"\n";
    out.push({id:stableTuneId(normalizedAbc),title:tm&&tm[1].trim()?tm[1].trim():("Tune "+(n+1)),style:rm&&rm[1].trim()?rm[1].trim():"",abc:normalizedAbc,tonic:key.tonic,mode:key.mode});
  });
  return out;
}
function modeCountText(tunes){return MODE_ORDER.map(function(m){var n=tunes.filter(function(t){return t.mode===m;}).length;return n?MODE_INFO[m].shortLabel+": "+n:null;}).filter(Boolean).join(" · ");}
function answerName(a){return a.tonic+" "+MODE_INFO[a.mode].shortLabel;}
function commonChordNames(a){
  var scaleIntervals={
    major:[0,2,4,5,7,9,11],
    dorian:[0,2,3,5,7,9,10],
    mixolydian:[0,2,4,5,7,9,10]
  };
  var patterns={
    major:[{degree:1,quality:"Major"},{degree:4,quality:"Major"},{degree:5,quality:"Major"}],
    dorian:[{degree:1,quality:"Minor"},{degree:7,quality:"Major"},{degree:5,quality:"Minor"}],
    mixolydian:[{degree:1,quality:"Major"},{degree:7,quality:"Major"},{degree:5,quality:"Major"}]
  };
  var naturalPc={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  var letters=["C","D","E","F","G","A","B"];
  var tonicMatch=String(a.tonic||"").match(/^([A-G])([#b]?)/);
  if(!tonicMatch||!scaleIntervals[a.mode]||!patterns[a.mode])return "";
  var tonicLetter=tonicMatch[1];
  var tonicAcc=tonicMatch[2]==="#"?1:(tonicMatch[2]==="b"?-1:0);
  var tonicPc=(naturalPc[tonicLetter]+tonicAcc+12)%12;
  var tonicLetterIndex=letters.indexOf(tonicLetter);
  function degreeRoot(degree){
    var letter=letters[(tonicLetterIndex+degree-1)%7];
    var targetPc=(tonicPc+scaleIntervals[a.mode][degree-1])%12;
    var diff=(targetPc-naturalPc[letter]+12)%12;
    if(diff>6)diff-=12;
    var accidental=diff===-2?"bb":diff===-1?"b":diff===1?"#":diff===2?"##":"";
    return letter+accidental;
  }
  return patterns[a.mode].map(function(chord){var name=degreeRoot(chord.degree)+" "+chord.quality;return chord.occasional?"(occasionally "+name+")":name;}).join(", ");
}
function currentTune(){return state&&state.sessionIds.length?tuneById[state.sessionIds[state.currentIndex]]:null;}
function elapsed(start){return Math.round(performance.now()-start)+" ms";}

function log(message,data){
  var stamp=new Date().toLocaleTimeString();
  var line="["+stamp+"] "+message;
  if(data!==undefined){
    try{line+=" "+(typeof data==="string"?data:JSON.stringify(data));}catch(e){line+=" "+String(data);}
  }
  try{console.log("[KeyModeTrainer]",message,data===undefined?"":data);}catch(e){}
}
function logError(label,error){
  var msg=error&&error.stack?error.stack:(error&&error.message?error.message:String(error));
  log(label+" ERROR: "+msg);
}
function defaultState(){return {version:3,sessionIds:chooseSessionTunes().map(function(t){return t.id;}),currentIndex:0,answers:{},heard:{},answerStyle:"separate"};}
function chooseSessionTunes(){
  // Pick 10 unique tunes uniformly at random from the entire collection.
  // No balancing by mode is applied.
  return shuffle(allTunes).slice(0,Math.min(SESSION_LENGTH,allTunes.length));
}
function loadState(){
  // Every page load starts a completely fresh in-memory 10-tune session.
  // Nothing is read from or written to localStorage.
  state=defaultState();
  $("answerStyle").value=state.answerStyle;
  log("Created fresh session",{tunes:state.sessionIds.length});
}

function startNewSet(){
  pauseAllControllers();
  state=defaultState();
  state.answerStyle=$("answerStyle").value;
  log("Started completely new 10-tune set",{ids:state.sessionIds});
  renderQuestion();
}

function configureAbcjs(){
  if(!window.ABCJS||!ABCJS.eskinConfig){log("ABCJS.eskinConfig unavailable");return;}
  var cfg=ABCJS.eskinConfig;
  var available={
    setIrishRolls:typeof cfg.setIrishRolls==="function",
    setCustomGMSounds:typeof cfg.setCustomGMSounds==="function",
    setPlayerDefaults:typeof cfg.setPlayerDefaults==="function",
    setSoundFontUrl:typeof cfg.setSoundFontUrl==="function",
    setReverb:typeof cfg.setReverb==="function"
  };
  log("eskinConfig API",available);
  if(available.setIrishRolls){cfg.setIrishRolls(true);log("eskinConfig.setIrishRolls(true)");}
  if(available.setCustomGMSounds){cfg.setCustomGMSounds(true);log("eskinConfig.setCustomGMSounds(true)");}
  if(available.setPlayerDefaults){cfg.setPlayerDefaults(100,false);log("eskinConfig.setPlayerDefaults(100, false)");}
  if(available.setSoundFontUrl){cfg.setSoundFontUrl(FATBOY);log("eskinConfig.setSoundFontUrl",FATBOY);}
  if(available.setReverb){cfg.setReverb({enabled:false});log("eskinConfig reverb disabled");}
}
function safePause(controller,label){
  if(controller&&typeof controller.pause==="function"){
    try{controller.pause();log((label||"controller")+" paused");}catch(e){logError((label||"controller")+" pause",e);}
  }
}
function safeDestroy(controller,label){
  if(!controller)return;
  safePause(controller,label);
  if(typeof controller.destroy==="function"){
    try{controller.destroy();log((label||"controller")+" destroyed");}catch(e){logError((label||"controller")+" destroy",e);}
  }
}
function safeRewind(controller,label){
  if(!controller)return false;
  if(typeof controller.restart==="function"){
    try{controller.restart();log((label||"controller")+" rewound");return true;}catch(e){logError((label||"controller")+" rewind",e);}
  }
  return false;
}

function resetScaleButtons(){
  activeScale=null;
  if($("chosenScaleBtn"))$("chosenScaleBtn").textContent="Play Selected Scale";
  if($("correctScaleBtn")){
    var tune=currentTune();
    var saved=tune&&state&&state.answers?state.answers[tune.id]:null;
    $("correctScaleBtn").textContent=saved&&saved.correct?"Play Scale":"Play Correct Scale";
  }
}
function resetRootButtons(){
  activeRoot=null;
  if($("chosenRootBtn"))$("chosenRootBtn").textContent="Root Note";
  if($("correctRootBtn"))$("correctRootBtn").textContent="Root Note";
}
function setScalePlaying(which){
  activeScale=which;
  $("chosenScaleBtn").textContent=which==="chosen"?"Stop Playing Scale":"Play Selected Scale";
  var tune=currentTune();
  var saved=tune&&state&&state.answers?state.answers[tune.id]:null;
  $("correctScaleBtn").textContent=which==="correct"?"Stop Playing Scale":(saved&&saved.correct?"Play Scale":"Play Correct Scale");
}
function setRootPlaying(which){
  activeRoot=which;
  $("chosenRootBtn").textContent=which==="chosen"?"Stop Root Note":"Root Note";
  $("correctRootBtn").textContent=which==="correct"?"Stop Root Note":"Root Note";
}
function stopComparisonControllers(){
  safeDestroy(chosenScaleController,"chosen scale");safeDestroy(correctScaleController,"correct scale");
  safeDestroy(chosenRootController,"chosen root");safeDestroy(correctRootController,"correct root");
  chosenScaleController=correctScaleController=chosenRootController=correctRootController=null;
  resetScaleButtons();resetRootButtons();
}
async function resetTuneForComparisonPlayback(){
  // Rebuild instead of pause+restart. abcjs SynthController can require an extra
  // Play click after programmatic pause; a fresh controller is unambiguously
  // stopped at time zero and its native Play button works on the first click.
  await prepareCurrentTune(true);
}
function pauseAllControllers(){
  safePause(tuneController,"tune");
  stopComparisonControllers();
}
function clearTuneController(){safeDestroy(tuneController,"tune");tuneController=null;tunePreparePromise=null;$("hiddenTuneRender").innerHTML="";$("tuneAudioControls").innerHTML="";}
function clearScaleControllers(){
  safeDestroy(chosenScaleController,"chosen scale");safeDestroy(correctScaleController,"correct scale");
  safeDestroy(chosenRootController,"chosen root");safeDestroy(correctRootController,"correct root");
  chosenScaleController=correctScaleController=chosenRootController=correctRootController=null;
  resetScaleButtons();resetRootButtons();
  $("hiddenScaleRenderChosen").innerHTML="";$("hiddenScaleAudioChosen").innerHTML="";
  $("hiddenScaleRenderCorrect").innerHTML="";$("hiddenScaleAudioCorrect").innerHTML="";
  $("hiddenRootRenderChosen").innerHTML="";$("hiddenRootAudioChosen").innerHTML="";
  $("hiddenRootRenderCorrect").innerHTML="";$("hiddenRootAudioCorrect").innerHTML="";
}
function tuneAbcForPlayback(abc){
  // Keep the original tune intact for rendering/audio. The notation is rendered
  // off-screen, so title/chord text does not need to be stripped. This avoids
  // changing the visual tune structure that abcjs uses to build playback timing.
  var out=String(abc||"").trim();
  var directives=[];
  if(!/^\s*%soundfont\s+/mi.test(out))directives.push("%soundfont fatboy");
  if(!/^\s*%%MIDI\s+program\s+/mi.test(out))directives.push("%%MIDI program 0");
  if(directives.length){
    if(/^\s*X\s*:.*$/mi.test(out))out=out.replace(/^(\s*X\s*:.*)$/mi,"$1\n"+directives.join("\n"));
    else out=directives.join("\n")+"\n"+out;
  }
  return out+"\n";
}

function createHiddenCursorControl(label){
  return {
    _loggedFirstEvent:false,
    onStart:function(){log(label+": cursor onStart");},
    onEvent:function(ev){
      if(!ev)return;
      if(!this._loggedFirstEvent){this._loggedFirstEvent=true;log(label+": cursor first event",{left:ev.left,top:ev.top,width:ev.width,height:ev.height});}
    },
    onFinished:function(){
      log(label+": cursor onFinished");
      this._loggedFirstEvent=false;
      if(label==="Chosen scale"&&activeScale==="chosen")resetScaleButtons();
      else if(label==="Correct scale"&&activeScale==="correct")resetScaleButtons();
      else if(label==="Chosen root"&&activeRoot==="chosen")resetRootButtons();
      else if(label==="Correct root"&&activeRoot==="correct")resetRootButtons();
    }
  };
}
function objectSummary(obj){
  if(!obj)return {type:String(obj)};
  var keys=[];try{keys=Object.keys(obj).slice(0,60);}catch(e){}
  var summary={constructor:obj&&obj.constructor&&obj.constructor.name||"",keys:keys};
  ["isLoaded","isStarted","isRunning","isPlaying","paused","loaded"].forEach(function(k){if(k in obj)summary[k]=obj[k];});
  return summary;
}
function renderedSummary(v){
  if(!v)return {present:false};
  var out={present:true,keys:Object.keys(v).slice(0,50)};
  if(Array.isArray(v.lines))out.lines=v.lines.length;
  if(v.metaText)out.metaTextKeys=Object.keys(v.metaText);
  try{if(typeof v.getTotalTime==="function")out.totalTime=v.getTotalTime();}catch(e){out.totalTimeError=String(e);}
  try{if(typeof v.getBeatsPerMeasure==="function")out.beatsPerMeasure=v.getBeatsPerMeasure();}catch(e){}
  return out;
}

async function prepareController(abc,renderId,audioId,label,options){
  options=options||{};
  var started=performance.now();
  if(!window.ABCJS)throw new Error("ABCJS is not defined. Check abcjs-eskin-portable-min.js.");
  if(typeof ABCJS.renderAbc!=="function")throw new Error("ABCJS.renderAbc is unavailable.");
  if(!ABCJS.synth||typeof ABCJS.synth.SynthController!=="function")throw new Error("ABCJS.synth.SynthController is unavailable.");
  configureAbcjs();
  $(renderId).innerHTML="";$(audioId).innerHTML="";
  log(label+": renderAbc begin",{abcChars:abc.length,hasSoundfont:/^\s*%soundfont\s+fatboy/im.test(abc),hasMidiProgram:/^\s*%%MIDI\s+program\s+0/im.test(abc)});
  var rendered=ABCJS.renderAbc(renderId,abc,{responsive:"resize"});
  log(label+": renderAbc complete",{count:rendered&&rendered.length||0,elapsed:elapsed(started)});
  if(!rendered||!rendered.length)throw new Error("renderAbc returned no tune.");
  log(label+": rendered tune summary",renderedSummary(rendered[0]));
  var controller=new ABCJS.synth.SynthController();
  log(label+": SynthController created");
  controller.load("#"+audioId,createHiddenCursorControl(label),options.playerOptions||{displayLoop:false,displayRestart:false,displayPlay:true,displayProgress:false,displayWarp:false});
  log(label+": controller.load complete");
  var tuneStart=performance.now();
  log(label+": setTune begin");
  await controller.setTune(rendered[0],false,options.synthOptions||{program:0,chordsOff:false});
  log(label+": setTune resolved",{elapsed:elapsed(tuneStart),total:elapsed(started)});
  log(label+": controller after setTune",objectSummary(controller));
  return controller;
}
async function prepareCurrentTune(force){
  var tune=currentTune(); if(!tune)return null;
  var serial=++prepareSerial;
  if(force)clearTuneController();
  else if(tuneController)return tuneController;
  else if(tunePreparePromise)return tunePreparePromise;
  $("tuneAudioControls").innerHTML="";
  $("playbackStatus").className="status";$("playbackStatus").textContent="Preparing tune audio…";
  var expectedId=tune.id;
  tunePreparePromise=(async function(){
    try{
      var controller=await prepareController(tuneAbcForPlayback(tune.abc),"hiddenTuneRender","tuneAudioControls","Tune "+(state.currentIndex+1),{playerOptions:{displayLoop:false,displayRestart:true,displayPlay:true,displayProgress:true,displayWarp:false},synthOptions:{program:0,chordsOff:true}});
      if(serial!==prepareSerial||!currentTune()||currentTune().id!==expectedId){safeDestroy(controller,"stale tune");return null;}
      tuneController=controller;
      // Start each tune with looping enabled without synthesizing a DOM click.
      // Using the SynthController API avoids accidentally triggering player loading state.
      if(typeof controller.toggleLoop==="function") controller.toggleLoop();
      $("playbackStatus").textContent="";
      $("listenSubheading").textContent="";
      return controller;
    }catch(e){
      logError("prepareCurrentTune",e);
      $("playbackStatus").className="status error";
      $("playbackStatus").textContent="Audio preparation failed: "+(e&&e.message?e.message:String(e));
      $("listenSubheading").textContent="Audio preparation failed. Reload the page and try again.";
      return null;
    }finally{tunePreparePromise=null;}
  })();
  return tunePreparePromise;
}


function uniqueTonics(){var a=[];allTunes.forEach(function(t){if(a.indexOf(t.tonic)<0)a.push(t.tonic);});var o={C:0,"C#":1,Db:1,D:2,"D#":3,Eb:3,E:4,F:5,"F#":6,Gb:6,G:7,"G#":8,Ab:8,A:9,"A#":10,Bb:10,B:11};return a.sort(function(x,y){return (o[x]===undefined?99:o[x])-(o[y]===undefined?99:o[y])||x.localeCompare(y);});}
function makeRadio(container,name,value,label){var l=document.createElement("label");l.className="choiceLabel";l.dataset.value=value;var i=document.createElement("input");i.type="radio";i.name=name;i.value=value;var s=document.createElement("span");s.textContent=label;l.appendChild(i);l.appendChild(s);container.appendChild(l);i.addEventListener("change",validateAnswerReady);}
function buildAnswerChoices(){
  var tune=currentTune(); if(!tune)return;
  $("answerForm").classList.remove("answered");
  var sep=state.answerStyle==="separate";$("separateAnswers").hidden=!sep;$("combinedAnswers").hidden=sep;$("separateAnswers").style.display=sep?"":"none";$("combinedAnswers").style.display=sep?"none":"";$("tonicChoices").innerHTML="";$("modeChoices").innerHTML="";$("combinedChoices").innerHTML="";
  if(sep){
    uniqueTonics().forEach(function(t){makeRadio($("tonicChoices"),"tonic",t,t);});
    MODE_ORDER.filter(function(m){return allTunes.some(function(t){return t.mode===m;});}).forEach(function(m){makeRadio($("modeChoices"),"mode",m,MODE_INFO[m].label);});
  }else{
    var c=[]; allTunes.forEach(function(t){var key=t.tonic+"|"+t.mode;if(!c.some(function(x){return x.key===key;}))c.push({key:key,tonic:t.tonic,mode:t.mode});});
    var correct=tune.tonic+"|"+tune.mode,sel=shuffle(c.filter(function(x){return x.key!==correct;})).slice(0,7);sel.push({key:correct,tonic:tune.tonic,mode:tune.mode});
    shuffle(sel).forEach(function(x){makeRadio($("combinedChoices"),"combined",x.key,x.tonic+" "+MODE_INFO[x.mode].shortLabel);});
  }
  restoreAnswerUI();
}
function readAnswer(){
  if(state.answerStyle==="separate"){
    var t=document.querySelector('input[name="tonic"]:checked'),m=document.querySelector('input[name="mode"]:checked');return t&&m?{tonic:t.value,mode:m.value}:null;
  }
  var c=document.querySelector('input[name="combined"]:checked');if(!c)return null;var p=c.value.split("|");return {tonic:p[0],mode:p[1]};
}
function validateAnswerReady(){var saved=state.answers[currentTune().id];if(saved){$("submitBtn").disabled=true;return;}if(state.answerStyle==="separate")$("submitBtn").disabled=!(document.querySelector('input[name="tonic"]:checked')&&document.querySelector('input[name="mode"]:checked'));else $("submitBtn").disabled=!document.querySelector('input[name="combined"]:checked');}
function markChoices(choice){var tune=currentTune();if(state.answerStyle==="separate"){document.querySelectorAll('#tonicChoices .choiceLabel').forEach(function(l){if(l.dataset.value===tune.tonic)l.classList.add("correct");else if(l.dataset.value===choice.tonic)l.classList.add("incorrect");});document.querySelectorAll('#modeChoices .choiceLabel').forEach(function(l){if(l.dataset.value===tune.mode)l.classList.add("correct");else if(l.dataset.value===choice.mode)l.classList.add("incorrect");});}else{var corr=tune.tonic+"|"+tune.mode,chosen=choice.tonic+"|"+choice.mode;document.querySelectorAll('#combinedChoices .choiceLabel').forEach(function(l){if(l.dataset.value===corr)l.classList.add("correct");else if(l.dataset.value===chosen)l.classList.add("incorrect");});}}
function setInputsDisabled(disabled){document.querySelectorAll('#answerForm input').forEach(function(i){i.disabled=disabled;});}
function setPreListenChoiceLock(locked){
  document.querySelectorAll('#answerForm .choiceLabel').forEach(function(label){
    label.classList.toggle("preListenDisabled",!!locked);
  });
}
function hasListenedToCurrentTune(){
  var tune=currentTune();
  return !!(tune&&state.heard&&state.heard[tune.id]);
}
function unlockCurrentAnswers(){
  var tune=currentTune();
  if(!tune||state.answers[tune.id])return;
  if(!state.heard)state.heard={};
  state.heard[tune.id]=true;
  $("answerForm").classList.remove("awaitingListen");
  setPreListenChoiceLock(false);
  setInputsDisabled(false);
  validateAnswerReady();
}
function isTunePlayControl(target){
  var el=target&&target.nodeType===1?target:target&&target.parentElement;
  if(!el)return false;
  if(el.closest&&el.closest(".abcjs-midi-start"))return true;
  var control=el.closest&&el.closest('button,[role="button"]');
  if(!control)return false;
  var label=(control.getAttribute("aria-label")||control.getAttribute("title")||control.textContent||"").trim();
  return /^play\b/i.test(label);
}
function restoreAnswerUI(){
  var tune=currentTune(),saved=state.answers[tune.id];
  $("feedback").hidden=true;$("differencePanel").hidden=true;clearScaleControllers();
  if(!saved){
    var heard=hasListenedToCurrentTune();
    $("answerForm").classList.toggle("awaitingListen",!heard);
    setPreListenChoiceLock(!heard);
    setInputsDisabled(!heard);
    $("submitBtn").disabled=true;
    return;
  }
  $("answerForm").classList.remove("awaitingListen");
  setPreListenChoiceLock(false);
  $("answerForm").classList.add("answered");
  if(state.answerStyle==="separate"){
    var t=document.querySelector('input[name="tonic"][value="'+CSS.escape(saved.choice.tonic)+'"]');var m=document.querySelector('input[name="mode"][value="'+CSS.escape(saved.choice.mode)+'"]');if(t)t.checked=true;if(m)m.checked=true;
  }else{
    var c=document.querySelector('input[name="combined"][value="'+CSS.escape(saved.choice.tonic+"|"+saved.choice.mode)+'"]');if(c)c.checked=true;
  }
  markChoices(saved.choice);setInputsDisabled(true);$("submitBtn").disabled=true;showFeedback(saved,false);
}
function submitAnswer(ev){
  ev.preventDefault();var tune=currentTune();if(!tune||state.answers[tune.id])return;var choice=readAnswer();if(!choice)return;
  var correct=choice.tonic===tune.tonic&&choice.mode===tune.mode;
  var saved={choice:choice,correct:correct};state.answers[tune.id]=saved;$("answerForm").classList.add("answered");markChoices(choice);setInputsDisabled(true);$("submitBtn").disabled=true;showFeedback(saved,true);updateProgress();updateNavigationButtons();
}
function showFeedback(saved,prepareScales){
  var tune=currentTune();$("feedback").hidden=false;$("feedback").className="feedback "+(saved.correct?"correct":"incorrect");
  var correctAnswer={tonic:tune.tonic,mode:tune.mode};
  var chordText=commonChordNames(correctAnswer);
  var commonChordsHtml=chordText?' &nbsp;&nbsp; <strong>Common chords:</strong> '+escapeHtml(chordText):'';
  if(saved.correct){
    $("feedback").innerHTML='<strong>Correct: '+escapeHtml(answerName(correctAnswer))+'</strong>'+commonChordsHtml+'<br><strong>Tune:</strong> '+escapeHtml(tune.title)+(tune.style?' &nbsp;&nbsp; <strong>Style:</strong> '+escapeHtml(tune.style):'');
    $("differencePanel").hidden=false;
    $("differencePanel").classList.add("correctScaleOnly");
    $("differencePanel").querySelector("h3").textContent="Hear the scale";
    $("differenceText").textContent="Reinforce the correct answer by listening to its scale.";
    $("correctScaleLabel").textContent="Correct: "+answerName(correctAnswer);
    resetScaleButtons();
    $("correctScaleBtn").textContent="Play Scale";
    $("correctRootBtn").textContent="Root Note";
    $("chosenScaleBtn").disabled=true;
    $("chosenRootBtn").disabled=true;
    $("correctScaleBtn").disabled=false;
    $("correctRootBtn").disabled=false;
    if(prepareScales)clearScaleControllers();
  }else{
    $("feedback").innerHTML='<strong>Not quite.</strong> You chose '+escapeHtml(answerName(saved.choice))+'. The correct answer is <strong>'+escapeHtml(answerName(correctAnswer))+'</strong>.'+commonChordsHtml+'<br><strong>Tune:</strong> '+escapeHtml(tune.title)+(tune.style?' &nbsp;&nbsp; <strong>Style:</strong> '+escapeHtml(tune.style):'');
    $("differencePanel").hidden=false;
    $("differencePanel").classList.remove("correctScaleOnly");
    $("differencePanel").querySelector("h3").textContent="Hear the difference";
    $("differenceText").textContent="Compare the scale you selected with the correct scale.";$("chosenScaleLabel").textContent="Your answer: "+answerName(saved.choice);$("correctScaleLabel").textContent="Correct: "+answerName({tonic:tune.tonic,mode:tune.mode});
    resetScaleButtons();resetRootButtons();
    $("chosenScaleBtn").disabled=false;$("chosenRootBtn").disabled=false;
    $("correctScaleBtn").disabled=false;$("correctRootBtn").disabled=false;
    if(prepareScales)clearScaleControllers();
  }
}

function makeScaleAbc(a){
  var notesByTonic={C:"C D E F G A B c",D:"D E F G A B c d",E:"E F G A B c d e",F:"F G A B c d e f",G:"G A B c d e f g",A:"A B c d e f g a",B:"B c d e f g a b","C#":"^C ^D ^E ^F ^G ^A ^B ^c","F#":"^F ^G ^A B ^c ^d ^e ^f",Bb:"_B C D _E F G A _B"};
  var simple=notesByTonic[a.tonic]||"C D E F G A B c";
  return "X:1\nT:Scale\nM:4/4\nL:1/4\nQ:1/4=96\nK:"+a.tonic+MODE_INFO[a.mode].abcSuffix+"\n"+simple+" | "+simple.split(" ").reverse().join(" ")+" |]\n";
}
function makeRootAbc(a){
  var rootByTonic={C:"C4",D:"D4",E:"E4",F:"F4",G:"G4",A:"A4",B:"B4","C#":"^C4","F#":"^F4",Bb:"_B4"};
  var root=rootByTonic[a.tonic]||"C4";
  return "X:1\nT:Root Note\nM:4/4\nL:1/4\nQ:1/4=60\nK:"+a.tonic+MODE_INFO[a.mode].abcSuffix+"\n"+root+" |]\n";
}
async function playRoot(which){
  var saved=state.answers[currentTune().id];if(!saved)return;
  var isChosen=which==="chosen";
  if(saved.correct&&isChosen)return;
  var answer=isChosen?saved.choice:{tonic:currentTune().tonic,mode:currentTune().mode};
  var controller=isChosen?chosenRootController:correctRootController;

  if(activeRoot===which){
    safeDestroy(controller,isChosen?"chosen root":"correct root");
    if(isChosen)chosenRootController=null;else correctRootController=null;
    resetRootButtons();
    return;
  }

  try{
    stopComparisonControllers();
    await resetTuneForComparisonPlayback();
    controller=isChosen?chosenRootController:correctRootController;
    if(!controller){
      controller=await prepareController(
        makeRootAbc(answer),
        isChosen?"hiddenRootRenderChosen":"hiddenRootRenderCorrect",
        isChosen?"hiddenRootAudioChosen":"hiddenRootAudioCorrect",
        isChosen?"Chosen root":"Correct root",
        {synthOptions:{program:0,chordsOff:true}}
      );
      if(isChosen)chosenRootController=controller;else correctRootController=controller;
    }
    setRootPlaying(which);
    log((isChosen?"Chosen":"Correct")+" root play begin");
    await Promise.resolve(controller.play());
    log((isChosen?"Chosen":"Correct")+" root play started");
  }catch(e){
    resetRootButtons();
    logError("playRoot",e);
    $("differenceText").textContent="Root-note playback error: "+(e&&e.message?e.message:String(e));
  }
}

async function playScale(which){
  var saved=state.answers[currentTune().id];if(!saved)return;
  var isChosen=which==="chosen";
  if(saved.correct&&isChosen)return;
  var answer=isChosen?saved.choice:{tonic:currentTune().tonic,mode:currentTune().mode};
  var controller=isChosen?chosenScaleController:correctScaleController;

  // Clicking the currently playing scale button stops and rewinds it.
  // Discard the controller so the next click is guaranteed to start at time zero.
  if(activeScale===which){
    safeDestroy(controller,isChosen?"chosen scale":"correct scale");
    if(isChosen)chosenScaleController=null;else correctScaleController=null;
    resetScaleButtons();
    return;
  }

  try{
    // Reset the tune to a genuinely stopped, time-zero controller before starting
    // comparison playback. This keeps the native tune Play button one-click ready.
    stopComparisonControllers();
    await resetTuneForComparisonPlayback();

    controller=isChosen?chosenScaleController:correctScaleController;
    if(!controller){
      controller=await prepareController(
        makeScaleAbc(answer),
        isChosen?"hiddenScaleRenderChosen":"hiddenScaleRenderCorrect",
        isChosen?"hiddenScaleAudioChosen":"hiddenScaleAudioCorrect",
        isChosen?"Chosen scale":"Correct scale"
      );
      if(isChosen)chosenScaleController=controller;else correctScaleController=controller;
    }

    setScalePlaying(which);
    log((isChosen?"Chosen":"Correct")+" scale play begin");
    await Promise.resolve(controller.play());
    log((isChosen?"Chosen":"Correct")+" scale play started");
  }catch(e){
    resetScaleButtons();
    logError("playScale",e);
    $("differenceText").textContent="Scale playback error: "+(e&&e.message?e.message:String(e));
  }
}

function showFinalReview(){
  var complete=state.sessionIds.length>0&&state.sessionIds.every(function(id){return !!state.answers[id];});
  if(!complete)return;

  var rows=state.sessionIds.map(function(id){
    return {tune:tuneById[id],answer:state.answers[id]};
  }).filter(function(x){return x.tune&&x.answer;});

  var missed=rows.filter(function(x){return !x.answer.correct;});
  var correct=rows.length-missed.length;

  // Count tonal-center and mode errors separately. A tune only contributes to
  // a tonal-center statistic when the tonal center was wrong, and only contributes
  // to a mode statistic when the mode was wrong.
  var tonicMisses={};
  var modeMisses={};
  rows.forEach(function(x){
    if(x.answer.choice.tonic!==x.tune.tonic){
      tonicMisses[x.tune.tonic]=(tonicMisses[x.tune.tonic]||0)+1;
    }
    if(x.answer.choice.mode!==x.tune.mode){
      modeMisses[x.tune.mode]=(modeMisses[x.tune.mode]||0)+1;
    }
  });

  function mostMissedText(counts,labelFn){
    var entries=Object.keys(counts).map(function(key){return {key:key,count:counts[key]};});
    if(!entries.length)return "None";
    var max=Math.max.apply(null,entries.map(function(x){return x.count;}));
    return entries
      .filter(function(x){return x.count===max;})
      .sort(function(a,b){return a.key.localeCompare(b.key);})
      .map(function(x){return escapeHtml(labelFn(x.key))+" ("+x.count+")";})
      .join(", ");
  }

  var tonicSummary=mostMissedText(tonicMisses,function(x){return x;});
  var modeSummary=mostMissedText(modeMisses,function(x){return MODE_INFO[x]?MODE_INFO[x].shortLabel:x;});

  if(!window.DayPilot||!DayPilot.Modal||typeof DayPilot.Modal.alert!=="function"){
    alert("Session complete. Final score: "+correct+" / "+rows.length);
    return;
  }

  var availableHeight=Math.max(0,Math.min(660,window.innerHeight-100));
  var body=[
    '<div class="keyModeFinalReviewScroll" style="max-height:'+availableHeight+'px">',
      '<h2>End-of-Session Review</h2>',
      '<p><strong>Final score: '+correct+' / '+rows.length+'</strong></p>',
      '<div class="reviewItem"><strong>Most missed tonal center'+(tonicSummary.indexOf(",")>=0?"s":"")+':</strong> '+tonicSummary+
      '<br><strong>Most missed mode'+(modeSummary.indexOf(",")>=0?"s":"")+':</strong> '+modeSummary+'</div>',
      missed.length
        ? '<p style="margin-top:12px">Review of missed tunes:</p>'+missed.map(function(x){
            return '<div class="reviewItem"><strong>'+escapeHtml(x.tune.title)+'</strong>'+(x.tune.style?' <span class="muted">('+escapeHtml(x.tune.style)+')</span>':'')+
              '<br>Your answer: '+escapeHtml(answerName(x.answer.choice))+
              '<br>Correct answer: <strong>'+escapeHtml(answerName({tonic:x.tune.tonic,mode:x.tune.mode}))+'</strong>'+
              '<br><strong>Common chords:</strong> '+escapeHtml(commonChordNames({tonic:x.tune.tonic,mode:x.tune.mode}))+'</div>';
          }).join("")
        : '<p style="margin-top:12px">Perfect session — no missed tunes to review.</p>',
    '</div>'
  ].join("");

  // Preserve the background document position while DayPilot moves focus.
  var pageX=window.scrollX||window.pageXOffset||0;
  var pageY=window.scrollY||window.pageYOffset||0;
  function restorePageScroll(){window.scrollTo(pageX,pageY);}

  var modalPromise=DayPilot.Modal.alert(body,{
    okText:"Close",
    width:Math.min(720,Math.max(300,window.innerWidth-32)),
    top:50
  });

  restorePageScroll();
  requestAnimationFrame(function(){
    restorePageScroll();
    requestAnimationFrame(restorePageScroll);
  });

  if(modalPromise&&typeof modalPromise.then==="function"){
    modalPromise.then(restorePageScroll);
  }
}

function updateProgress(){
  var answers=Object.keys(state.answers).map(function(id){return {id:id,data:state.answers[id],tune:tuneById[id]};}).filter(function(x){return x.tune;});
  var correct=answers.filter(function(x){return x.data.correct;}).length;
  $("scoreText").textContent=correct+" / "+answers.length;
  $("accuracyText").textContent=answers.length?(Math.round(correct/answers.length*100)+"% correct · "+correct+" / "+answers.length):"No answers yet";
  $("progressBar").style.width=(answers.length/state.sessionIds.length*100)+"%";
  var bits=[];MODE_ORDER.forEach(function(m){var rs=answers.filter(function(x){return x.tune.mode===m;});if(rs.length){bits.push(MODE_INFO[m].shortLabel+": "+rs.filter(function(x){return x.data.correct;}).length+"/"+rs.length);}});$("breakdown").textContent=bits.length?bits.join(" · "):"Your results will appear here";
}
function updateNavigationButtons(){
  var tune=currentTune();
  var answered=!!(tune&&state.answers[tune.id]);
  var isFirst=state.currentIndex===0;
  var isLast=state.currentIndex===state.sessionIds.length-1;

  // Hide Previous Tune on question 1.
  $("prevBtn").hidden=isFirst;
  $("prevBtn").disabled=isFirst;

  // Hide Next Tune on question 10.
  $("nextBtn").hidden=isLast;
  $("nextBtn").disabled=!answered||isLast;

  // After question 10 is answered, put Final Review in the normal Next Tune position.
  $("finalReviewInlineBtn").hidden=!(isLast&&answered);
}
function renderQuestion(){
  pauseAllControllers();clearTuneController();clearScaleControllers();
  var tune=currentTune();if(!tune)return;
  $("questionEyebrow").textContent="Tune "+(state.currentIndex+1)+" of "+state.sessionIds.length;
  $("questionTitle").textContent="What tonal center and mode do you hear?";
  $("listenHeading").textContent="Click the play button below to listen to the tune";$("listenSubheading").textContent="";
  buildAnswerChoices();updateProgress();updateNavigationButtons();
  void prepareCurrentTune(false);
}
function go(delta){
  if(delta>0){
    var tune=currentTune();
    if(!tune||!state.answers[tune.id])return;
  }
  var n=state.currentIndex+delta;
  if(n<0||n>=state.sessionIds.length)return;
  state.currentIndex=n;
  log(delta<0?"Previous Tune clicked":"Next Tune clicked",{question:n+1,tuneId:state.sessionIds[n]});
  renderQuestion();
}


function showInstructions(){
  if(!window.DayPilot||!DayPilot.Modal||typeof DayPilot.Modal.alert!=="function"){
    alert("The instructions dialog is unavailable because DayPilot.Modal has not been loaded.");
    return;
  }

  var availableHeight=Math.max(0,Math.min(620,window.innerHeight-100));
  var html=[
    '<div class="keyModeInstructionsScroll" style="max-height:'+availableHeight+'px">',
      '<h2>Traditional Irish Tune Key and Mode Ear Trainer</h2>',
      '<p>This trainer helps you practice recognizing the tonal center and mode of traditional Irish tunes by ear.</p>',

      '<h3>Starting a session</h3>',
      '<p>Each session contains 10 tunes randomly selected from the full '+allTunes.length+'-tune collection. A fresh set is created whenever the tool is loaded or when you choose <strong>Start Over with New Tunes</strong>.</p>',

      '<h3>1. Listen to the tune</h3>',
      '<p>Click the play button on the bar to start the tune playing. The answer choices remain disabled until you start playback for that tune. Tunes loop automatically so you can concentrate on the tonal center and overall modal sound.</p>',

      '<h3>2. Choose your answer</h3>',
      '<p>Select the tonal center and mode you hear, then choose <strong>Submit Answer</strong>. The available modes are <strong>Major</strong>, <strong>Dorian</strong>, and <strong>Mixolydian</strong>.</p>',
      '<ul>',
        '<li><strong>Major</strong> — the familiar major sound.</li>',
        '<li><strong>Dorian</strong> — a minor-centered sound with a characteristic raised sixth.</li>',
        '<li><strong>Mixolydian</strong> — a major-centered sound with a lowered seventh.</li>',
      '</ul>',
      '<p>The <strong>Answer style</strong> control lets you answer with separate tonal-center and mode choices or with combined key/mode choices.</p>',

      '<h3>3. Review the result</h3>',
      '<p>After submitting, the trainer shows the correct key and mode, common accompaniment chords for that mode, the tune name, and the tune style.</p>',

      '<h3>Hear the scale</h3>',
      '<p>After a correct answer, use <strong>Root Note</strong> to hear the sustained tonal center, or <strong>Play Scale</strong> to reinforce the tonal center and mode you identified. Playback always starts from the beginning; starting one playback stops and resets any other playback to the beginning.</p>',

      '<h3>Hear the difference</h3>',
      '<p>When an answer is incorrect, use the <strong>Root Note</strong> buttons to compare the tonal centers, and <strong>Play Selected Scale</strong> and <strong>Play Correct Scale</strong> to compare the two scale tonalities directly.</p>',

      '<h3>End-of-session review</h3>',
      '<p>After you answer tune 10, the <strong>Show Final Review</strong> button appears in the navigation area where <strong>Next Tune</strong> appears on earlier tunes. Click it when you are ready to see your final score, the tonal centers and modes you missed most often, and a review of each missed tune showing your answer, the correct answer, and common chords.</p>',

      '<h3>Tip Jars</h3>',
      '<p>This ear training tool was created by <a href="https://michaeleskin.com" target="_blank" rel="noopener noreferrer">Michael Eskin</a>.<br>If you find it useful, please consider making a contribution via my online tip jars:</p>',
      '<p style="text-align:center"><a href="https://michaeleskin.com/abctools/tipjars.html" target="_blank" rel="noopener noreferrer">Michael Eskin\'s Tip Jars</a></p>',
    '</div>'
  ].join("");

  DayPilot.Modal.alert(html,{
    okText:"Close",
    width:Math.min(700,Math.max(300,window.innerWidth-32)),
    top:50
  });
}

function initialize(){
  window.addEventListener("error",function(event){log("window.error: "+(event.message||"unknown error")+(event.filename?(" @ "+event.filename+":"+event.lineno):""));});
  window.addEventListener("unhandledrejection",function(event){logError("unhandledrejection",event.reason||"unknown rejection");});
  log("Trainer initialization begin",{href:location.href,protocol:location.protocol});
  var text=window.KEY_MODE_EAR_TRAINER_ABC;
  if(typeof text!=="string"||!text.trim()){log("examples.js data missing");return;}
  allTunes=parseTunes(text);tuneById={};allTunes.forEach(function(t){tuneById[t.id]=t;});
  if(!allTunes.length){log("No usable tunes parsed");return;}
  log("Tune collection parsed",{count:allTunes.length,modes:modeCountText(allTunes)});
  $("newSetBtn").disabled=false;
  loadState();
  renderQuestion();
}

$("newSetBtn").addEventListener("click",startNewSet);
$("instructionsBtn").addEventListener("click",showInstructions);
$("finalReviewInlineBtn").addEventListener("click",showFinalReview);
$("answerForm").addEventListener("submit",submitAnswer);
$("prevBtn").addEventListener("click",function(){go(-1);});
$("nextBtn").addEventListener("click",function(){go(1);});
$("chosenRootBtn").addEventListener("click",function(){void playRoot("chosen");});
$("chosenScaleBtn").addEventListener("click",function(){void playScale("chosen");});
$("correctRootBtn").addEventListener("click",function(){void playRoot("correct");});
$("correctScaleBtn").addEventListener("click",function(){void playScale("correct");});
$("tuneAudioControls").addEventListener("click",function(ev){
  if(isTunePlayControl(ev.target)){
    // Run before abcjs' own Play handler. This makes the same click that stops
    // comparison audio also start the tune; no second click is required.
    stopComparisonControllers();
    unlockCurrentAnswers();
  }
},true);
$("answerStyle").addEventListener("change",function(){state.answerStyle=this.value;buildAnswerChoices();});
window.addEventListener("beforeunload",function(){pauseAllControllers();});

initialize();
})();
