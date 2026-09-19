(function(){
"use strict";

var VERSION="2.39";
var FATBOY="https://michaeleskin.com/abctools/soundfonts/fatboy_4/";
var ANSWER_STYLE_STORAGE_KEY="keyModeEarTrainerAnswerStyle";
var INSTRUMENT_STORAGE_KEY="keyModeEarTrainerInstrument";
var QUESTION_COUNT_STORAGE_KEY="keyModeEarTrainerQuestionCount";
var INSTRUMENT_PROGRAMS={piano:0,flute:73,whistle:78,fiddle:110,mandolin:141,banjo:105,accordion:21,concertina:133,hammeredDulcimer:15};
var ANSWER_STYLES=["rhythmSeparate","rhythmCombined","rhythmKey","rhythmMode","rhythmOnly","separate","combined","keyOnly","modeOnly"];
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
    out.push({id:stableTuneId(normalizedAbc),title:tm&&tm[1].trim()?tm[1].trim():("Tune "+(n+1)),style:rm&&rm[1].trim()?rm[1].trim():"",abc:normalizedAbc,tonic:key.tonic,mode:key.mode,rhythm:rm&&rm[1].trim()?rm[1].trim():""});
  });
  return out;
}
function modeCountText(tunes){return MODE_ORDER.map(function(m){var n=tunes.filter(function(t){return t.mode===m;}).length;return n?MODE_INFO[m].shortLabel+": "+n:null;}).filter(Boolean).join(" · ");}
function answerName(a){return a.tonic+" "+MODE_INFO[a.mode].shortLabel;}
function styleIncludesRhythm(style){return /^rhythm/.test(String(style||""));}
function styleUsesKey(style){return ["rhythmSeparate","rhythmCombined","rhythmKey","separate","combined","keyOnly"].indexOf(style)>=0;}
function styleUsesMode(style){return ["rhythmSeparate","rhythmCombined","rhythmMode","separate","combined","modeOnly"].indexOf(style)>=0;}
function styleUsesTonalMode(style){return styleUsesKey(style)||styleUsesMode(style);}
function styleUsesCombinedTonalMode(style){return style==="combined"||style==="rhythmCombined";}
function styleUsesSeparateTonalMode(style){return styleUsesTonalMode(style)&&!styleUsesCombinedTonalMode(style);}
function uniqueRhythms(){var a=[];allTunes.forEach(function(t){if(t.rhythm&&a.indexOf(t.rhythm)<0)a.push(t.rhythm);});var order={"Reel":0,"Jig":1,"Hornpipe":2,"Slip Jig":3,"Slide":4,"Polka":5,"Barndance":6};return a.sort(function(x,y){return (order[x]===undefined?99:order[x])-(order[y]===undefined?99:order[y])||x.localeCompare(y);});}
function loadPreferredAnswerStyle(){
  try{var v=localStorage.getItem(ANSWER_STYLE_STORAGE_KEY);return ANSWER_STYLES.indexOf(v)>=0?v:"rhythmSeparate";}catch(e){return "rhythmSeparate";}
}
function savePreferredAnswerStyle(style){
  try{localStorage.setItem(ANSWER_STYLE_STORAGE_KEY,style);}catch(e){}
}
function loadPreferredInstrument(){
  try{var v=localStorage.getItem(INSTRUMENT_STORAGE_KEY);return Object.prototype.hasOwnProperty.call(INSTRUMENT_PROGRAMS,v)?v:"piano";}catch(e){return "piano";}
}
function savePreferredInstrument(instrument){
  try{localStorage.setItem(INSTRUMENT_STORAGE_KEY,instrument);}catch(e){}
}
function loadQuestionCount(){
  try{var v=localStorage.getItem(QUESTION_COUNT_STORAGE_KEY);return v==="25"||v==="unlimited"?v:"10";}catch(e){return "10";}
}
function saveQuestionCount(v){try{localStorage.setItem(QUESTION_COUNT_STORAGE_KEY,String(v));}catch(e){}}
function questionCount(){var el=$("questionCount"),v=el?el.value:loadQuestionCount();return v==="25"||v==="unlimited"?v:"10";}
function unlimitedMode(){return questionCount()==="unlimited";}
function finiteQuestionCount(){return questionCount()==="25"?25:10;}
function randomTuneIdExcept(previousId){
  if(!allTunes.length)return null;if(allTunes.length<2)return allTunes[0].id;
  var t;do{t=allTunes[Math.floor(Math.random()*allTunes.length)];}while(t.id===previousId);return t.id;
}
function currentProgram(){
  var v=$("instrument")?$("instrument").value:loadPreferredInstrument();
  return Object.prototype.hasOwnProperty.call(INSTRUMENT_PROGRAMS,v)?INSTRUMENT_PROGRAMS[v]:0;
}
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
  // Console logging intentionally disabled for release builds.
}
function logError(label,error){
  // Console logging intentionally disabled for release builds.
}

function defaultState(){
  var unlimited=unlimitedMode();
  return {version:5,sessionIds:unlimited?[randomTuneIdExcept(null)]:chooseSessionTunes(finiteQuestionCount()).map(function(t){return t.id;}),currentIndex:0,answers:{},heard:{},answerStyle:loadPreferredAnswerStyle(),correctTotal:0,incorrectTotal:0,questionNumber:1};
}
function chooseSessionTunes(requestedCount){
  var target=Math.min(requestedCount||10,allTunes.length);if(target<=0)return [];
  var selected=[],selectedIds={};
  function addTune(tune){if(!tune||selectedIds[tune.id]||selected.length>=target)return false;selected.push(tune);selectedIds[tune.id]=true;return true;}
  shuffle(uniqueRhythms()).forEach(function(rhythm){addTune(shuffle(allTunes.filter(function(t){return t.rhythm===rhythm&&!selectedIds[t.id];}))[0]);});
  shuffle(MODE_ORDER.filter(function(mode){return allTunes.some(function(t){return t.mode===mode;});})).forEach(function(mode){
    if(selected.some(function(t){return t.mode===mode;}))return;
    addTune(shuffle(allTunes.filter(function(t){return t.mode===mode&&!selectedIds[t.id];}))[0]);
  });
  shuffle(allTunes).forEach(function(t){addTune(t);});return shuffle(selected);
}
function loadState(){
  $("questionCount").value=loadQuestionCount();$("questionCount").dataset.previousValue=$("questionCount").value;
  state=defaultState();$("answerStyle").value=state.answerStyle;$("instrument").value=loadPreferredInstrument();
  log("Created fresh session",{tunes:state.sessionIds.length,answerStyle:state.answerStyle,questionCount:questionCount()});
}
function startNewSet(){
  pauseAllControllers();state=defaultState();state.answerStyle=$("answerStyle").value;savePreferredAnswerStyle(state.answerStyle);
  log("Started new session",{ids:state.sessionIds,questionCount:questionCount()});renderQuestion();
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
  // The trainer's Instrument selector controls playback, overriding any tune-level program.
  out=out.replace(/^\s*%%MIDI\s+program\s+\d+.*$/gmi,"");
  directives.push("%%MIDI program "+currentProgram());
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
  log(label+": renderAbc begin",{abcChars:abc.length,hasSoundfont:/^\s*%soundfont\s+fatboy/im.test(abc),midiProgram:currentProgram()});
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
  await controller.setTune(rendered[0],false,options.synthOptions||{program:currentProgram(),chordsOff:false});
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
      var controller=await prepareController(tuneAbcForPlayback(tune.abc),"hiddenTuneRender","tuneAudioControls","Tune "+(state.currentIndex+1),{playerOptions:{displayLoop:false,displayRestart:true,displayPlay:true,displayProgress:true,displayWarp:false},synthOptions:{program:currentProgram(),chordsOff:true}});
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
  var style=state.answerStyle;
  var hasRhythm=styleIncludesRhythm(style),usesKey=styleUsesKey(style),usesMode=styleUsesMode(style),usesTM=usesKey||usesMode,combined=styleUsesCombinedTonalMode(style);
  $("rhythmAnswers").hidden=!hasRhythm; $("rhythmAnswers").style.display=hasRhythm?"":"none";
  $("separateAnswers").hidden=!(usesTM&&!combined); $("separateAnswers").style.display=(usesTM&&!combined)?"":"none";
  $("combinedAnswers").hidden=!(usesTM&&combined); $("combinedAnswers").style.display=(usesTM&&combined)?"":"none";
  var tonalFieldsets=$("separateAnswers").querySelectorAll("fieldset");
  if(tonalFieldsets.length>=2){tonalFieldsets[0].hidden=!usesKey;tonalFieldsets[0].style.display=usesKey?"":"none";tonalFieldsets[1].hidden=!usesMode;tonalFieldsets[1].style.display=usesMode?"":"none";}
  $("separateAnswers").style.gridTemplateColumns=(usesKey&&usesMode)?"1fr 1fr":"1fr";
  $("answerChoiceLayout").classList.toggle("withRhythm",hasRhythm&&usesTM);
  $("answerChoiceLayout").classList.toggle("rhythmOnly",style==="rhythmOnly");
  $("rhythmLegend").textContent=usesTM?"1. Which rhythm do you hear?":"Which rhythm do you hear?";
  var offset=hasRhythm?1:0,legends=$("separateAnswers").querySelectorAll("legend"),q=1+offset;
  var visibleQuestionCount=(hasRhythm?1:0)+(usesKey?1:0)+(usesMode?1:0);
  if(legends.length>=2){
    if(usesKey)legends[0].textContent=(visibleQuestionCount>1?(q++)+". ":"")+"Which key do you hear?";
    if(usesMode)legends[1].textContent=(visibleQuestionCount>1?(q++)+". ":"")+"Which mode do you hear?";
  }
  $("combinedLegend").textContent=hasRhythm?"2. Which key and mode do you hear?":"Which key and mode do you hear?";
  $("rhythmChoices").innerHTML=""; $("tonicChoices").innerHTML=""; $("modeChoices").innerHTML=""; $("combinedChoices").innerHTML="";
  if(hasRhythm)uniqueRhythms().forEach(function(r){makeRadio($("rhythmChoices"),"rhythm",r,r);});
  if(usesTM&&!combined){
    if(usesKey)uniqueTonics().forEach(function(t){makeRadio($("tonicChoices"),"tonic",t,t);});
    if(usesMode)MODE_ORDER.filter(function(m){return allTunes.some(function(t){return t.mode===m;});}).forEach(function(m){makeRadio($("modeChoices"),"mode",m,MODE_INFO[m].label);});
  }else if(usesTM){
    var c=[]; allTunes.forEach(function(t){var key=t.tonic+"|"+t.mode;if(!c.some(function(x){return x.key===key;}))c.push({key:key,tonic:t.tonic,mode:t.mode});});
    var correct=tune.tonic+"|"+tune.mode,sel=shuffle(c.filter(function(x){return x.key!==correct;})).slice(0,7);sel.push({key:correct,tonic:tune.tonic,mode:tune.mode});
    shuffle(sel).forEach(function(x){makeRadio($("combinedChoices"),"combined",x.key,x.tonic+" "+MODE_INFO[x.mode].shortLabel);});
  }
  restoreAnswerUI();
}
function readAnswer(){
  var style=state.answerStyle,choice={};
  if(styleIncludesRhythm(style)){var r=document.querySelector('input[name="rhythm"]:checked');if(!r)return null;choice.rhythm=r.value;}
  if(styleUsesCombinedTonalMode(style)){var c=document.querySelector('input[name="combined"]:checked');if(!c)return null;var p=c.value.split("|");choice.tonic=p[0];choice.mode=p[1];}
  else{
    if(styleUsesKey(style)){var t=document.querySelector('input[name="tonic"]:checked');if(!t)return null;choice.tonic=t.value;}
    if(styleUsesMode(style)){var m=document.querySelector('input[name="mode"]:checked');if(!m)return null;choice.mode=m.value;}
  }
  return choice;
}
function validateAnswerReady(){
  var saved=state.answers[currentTune().id];if(saved){$("submitBtn").disabled=true;return;}var style=state.answerStyle,ready=true;
  if(styleIncludesRhythm(style))ready=ready&&!!document.querySelector('input[name="rhythm"]:checked');
  if(styleUsesCombinedTonalMode(style))ready=ready&&!!document.querySelector('input[name="combined"]:checked');
  else{if(styleUsesKey(style))ready=ready&&!!document.querySelector('input[name="tonic"]:checked');if(styleUsesMode(style))ready=ready&&!!document.querySelector('input[name="mode"]:checked');}
  $("submitBtn").disabled=!ready;
}
function markChoices(choice){
  var tune=currentTune(),style=state.answerStyle;
  if(styleIncludesRhythm(style))document.querySelectorAll('#rhythmChoices .choiceLabel').forEach(function(l){if(l.dataset.value===tune.rhythm)l.classList.add("correct");else if(l.dataset.value===choice.rhythm)l.classList.add("incorrect");});
  if(styleUsesCombinedTonalMode(style)){var corr=tune.tonic+"|"+tune.mode,chosen=choice.tonic+"|"+choice.mode;document.querySelectorAll('#combinedChoices .choiceLabel').forEach(function(l){if(l.dataset.value===corr)l.classList.add("correct");else if(l.dataset.value===chosen)l.classList.add("incorrect");});}
  else{
    if(styleUsesKey(style))document.querySelectorAll('#tonicChoices .choiceLabel').forEach(function(l){if(l.dataset.value===tune.tonic)l.classList.add("correct");else if(l.dataset.value===choice.tonic)l.classList.add("incorrect");});
    if(styleUsesMode(style))document.querySelectorAll('#modeChoices .choiceLabel').forEach(function(l){if(l.dataset.value===tune.mode)l.classList.add("correct");else if(l.dataset.value===choice.mode)l.classList.add("incorrect");});
  }
}
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
  if(styleIncludesRhythm(state.answerStyle)&&saved.choice.rhythm){
    var r=document.querySelector('input[name="rhythm"][value="'+CSS.escape(saved.choice.rhythm)+'"]');if(r)r.checked=true;
  }
  if(styleUsesCombinedTonalMode(state.answerStyle)&&saved.choice.tonic&&saved.choice.mode){var c=document.querySelector('input[name="combined"][value="'+CSS.escape(saved.choice.tonic+"|"+saved.choice.mode)+'"]');if(c)c.checked=true;}
  else{
    if(styleUsesKey(state.answerStyle)&&saved.choice.tonic){var t=document.querySelector('input[name="tonic"][value="'+CSS.escape(saved.choice.tonic)+'"]');if(t)t.checked=true;}
    if(styleUsesMode(state.answerStyle)&&saved.choice.mode){var m=document.querySelector('input[name="mode"][value="'+CSS.escape(saved.choice.mode)+'"]');if(m)m.checked=true;}
  }
  markChoices(saved.choice);setInputsDisabled(true);$("submitBtn").disabled=true;showFeedback(saved,false);
}
function submitAnswer(ev){
  ev.preventDefault();
  var tune=currentTune();if(!tune||state.answers[tune.id])return;
  var choice=readAnswer();if(!choice)return;
  var assessed={rhythm:styleIncludesRhythm(state.answerStyle),tonic:styleUsesKey(state.answerStyle),mode:styleUsesMode(state.answerStyle)};
  var rhythmCorrect=!assessed.rhythm||choice.rhythm===tune.rhythm;
  var tonicCorrect=!assessed.tonic||choice.tonic===tune.tonic;
  var modeCorrect=!assessed.mode||choice.mode===tune.mode;
  var correct=rhythmCorrect&&tonicCorrect&&modeCorrect;
  var saved={choice:choice,assessed:assessed,rhythmCorrect:rhythmCorrect,tonicCorrect:tonicCorrect,modeCorrect:modeCorrect,correct:correct};
  state.answers[tune.id]=saved;
  if(unlimitedMode()){if(saved.correct)state.correctTotal++;else state.incorrectTotal++;}
  $("answerForm").classList.add("answered");markChoices(choice);setInputsDisabled(true);$("submitBtn").disabled=true;showFeedback(saved,true);updateProgress();updateNavigationButtons();
}
function completeAnswerForPlayback(choice,tune){return {tonic:choice.tonic||tune.tonic,mode:choice.mode||tune.mode};}
function showFeedback(saved,prepareScales){
  var tune=currentTune(),assessed=saved.assessed||{rhythm:saved.choice.rhythm!==undefined,tonic:saved.choice.tonic!==undefined,mode:saved.choice.mode!==undefined};
  var rhythmCorrect=!assessed.rhythm||saved.choice.rhythm===tune.rhythm,tonicCorrect=!assessed.tonic||saved.choice.tonic===tune.tonic,modeCorrect=!assessed.mode||saved.choice.mode===tune.mode;
  $("feedback").hidden=false;$("feedback").className="feedback "+(saved.correct?"correct":"incorrect");
  var correctAnswer={tonic:tune.tonic,mode:tune.mode},chordText=commonChordNames(correctAnswer),tonalWrong=(assessed.tonic&&!tonicCorrect)||(assessed.mode&&!modeCorrect);
  function tonalResultParts(prefix,choice){var a=[];if(assessed.tonic)a.push('<strong>Key:</strong> '+escapeHtml(choice.tonic));if(assessed.mode)a.push('<strong>Mode:</strong> '+escapeHtml(MODE_INFO[choice.mode].shortLabel));return (prefix?'<strong>'+prefix+'</strong> ':'')+a.join(' &nbsp;&nbsp; ');}
  if(saved.correct){var parts=[];if(assessed.rhythm)parts.push('<strong>Rhythm:</strong> '+escapeHtml(tune.rhythm));if(assessed.tonic||assessed.mode)parts.push(tonalResultParts('Correct:',correctAnswer));$("feedback").innerHTML=parts.join(' &nbsp;&nbsp; ')+'<br><strong>Tune:</strong> '+escapeHtml(tune.title)+(tune.style?' &nbsp;&nbsp; <strong>Style:</strong> '+escapeHtml(tune.style):'');}
  else{var parts=[];if(assessed.rhythm&&!rhythmCorrect)parts.push('You chose <strong>'+escapeHtml(saved.choice.rhythm)+'</strong> for the rhythm. The correct rhythm is <strong>'+escapeHtml(tune.rhythm)+'</strong>.');if(assessed.tonic&&!tonicCorrect)parts.push('You chose <strong>'+escapeHtml(saved.choice.tonic)+'</strong> for the key. The correct key is <strong>'+escapeHtml(tune.tonic)+'</strong>.');if(assessed.mode&&!modeCorrect)parts.push('You chose <strong>'+escapeHtml(MODE_INFO[saved.choice.mode].shortLabel)+'</strong> for the mode. The correct mode is <strong>'+escapeHtml(MODE_INFO[tune.mode].shortLabel)+'</strong>.');$("feedback").innerHTML='<strong>Not quite.</strong> '+parts.join('<br>')+'<br><strong>Tune:</strong> '+escapeHtml(tune.title)+(tune.style?' &nbsp;&nbsp; <strong>Style:</strong> '+escapeHtml(tune.style):'');}
  if(!assessed.tonic&&!assessed.mode){$("differencePanel").hidden=true;if(prepareScales)clearScaleControllers();return;}
  $("differencePanel").hidden=false;
  if(!tonalWrong){$("differencePanel").classList.add("correctScaleOnly");$("differencePanel").querySelector("h3").textContent="Hear the scale";$("differenceText").textContent="Reinforce the key and mode by listening to the root note or scale.";$("correctScaleLabel").innerHTML='<span class="correctScaleStatus"><strong class="correctKeyMode">Correct: '+escapeHtml(answerName(correctAnswer))+'</strong>'+(chordText?'<span class="commonChords"><strong>Common chords:</strong> '+escapeHtml(chordText)+'</span>':'')+'</span>';resetScaleButtons();resetRootButtons();$("correctScaleBtn").textContent="Play Scale";$("correctRootBtn").textContent="Root Note";$("chosenScaleBtn").disabled=true;$("chosenRootBtn").disabled=true;$("correctScaleBtn").disabled=false;$("correctRootBtn").disabled=false;}
  else{var chosen=completeAnswerForPlayback(saved.choice,tune);$("differencePanel").classList.remove("correctScaleOnly");$("differencePanel").querySelector("h3").textContent="Hear the difference";$("differenceText").textContent="Compare your selected answer with the correct key and scale.";$("chosenScaleLabel").textContent="Your answer: "+answerName(chosen);$("correctScaleLabel").innerHTML='<span class="correctScaleStatus"><strong class="correctKeyMode">Correct: '+escapeHtml(answerName(correctAnswer))+'</strong>'+(chordText?'<span class="commonChords"><strong>Common chords:</strong> '+escapeHtml(chordText)+'</span>':'')+'</span>';resetScaleButtons();resetRootButtons();$("chosenScaleBtn").disabled=false;$("chosenRootBtn").disabled=false;$("correctScaleBtn").disabled=false;$("correctRootBtn").disabled=false;}
  if(prepareScales)clearScaleControllers();
}

function makeScaleAbc(a){
  var notesByTonic={C:"C D E F G A B c",D:"D E F G A B c d",E:"E F G A B c d e",F:"F G A B c d e f",G:"G A B c d e f g",A:"A B c d e f g a",B:"B c d e f g a b","C#":"^C ^D ^E ^F ^G ^A ^B ^c","F#":"^F ^G ^A B ^c ^d ^e ^f",Bb:"_B C D _E F G A _B"};
  var simple=notesByTonic[a.tonic]||"C D E F G A B c";
  return "X:1\n%%MIDI program "+currentProgram()+"\nT:Scale\nM:4/4\nL:1/4\nQ:1/4=96\nK:"+a.tonic+MODE_INFO[a.mode].abcSuffix+"\n"+simple+" | "+simple.split(" ").reverse().join(" ")+" |]\n";
}
function makeRootAbc(a){
  var rootByTonic={C:"C4",D:"D4",E:"E4",F:"F4",G:"G4",A:"A4",B:"B4","C#":"^C4","F#":"^F4",Bb:"_B4"};
  var root=rootByTonic[a.tonic]||"C4";
  return "X:1\n%%MIDI program "+currentProgram()+"\nT:Root Note\nM:4/4\nL:1/4\nQ:1/4=60\nK:"+a.tonic+MODE_INFO[a.mode].abcSuffix+"\n"+root+" |]\n";
}
async function playRoot(which){
  var saved=state.answers[currentTune().id];if(!saved)return;
  var isChosen=which==="chosen";
  if(saved.correct&&isChosen)return;
  var answer=isChosen?completeAnswerForPlayback(saved.choice,currentTune()):{tonic:currentTune().tonic,mode:currentTune().mode};
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
        {synthOptions:{program:currentProgram(),chordsOff:true}}
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
  var answer=isChosen?completeAnswerForPlayback(saved.choice,currentTune()):{tonic:currentTune().tonic,mode:currentTune().mode};
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


function startMissedTunePractice(ids){
  var practiceIds=(ids||[]).filter(function(id){return !!tuneById[id];});
  if(!practiceIds.length)return;
  pauseAllControllers();
  state={
    version:4,
    sessionIds:practiceIds.slice(),
    currentIndex:0,
    answers:{},
    heard:{},
    answerStyle:$("answerStyle").value
  };
  savePreferredAnswerStyle(state.answerStyle);
  log("Started missed-tune practice",{ids:state.sessionIds});
  renderQuestion();
}

function showFinalReview(){
  if(unlimitedMode())return;
  var complete=state.sessionIds.length>0&&state.sessionIds.every(function(id){return !!state.answers[id];});
  if(!complete)return;
  pauseAllControllers();
  var rows=state.sessionIds.map(function(id){return {tune:tuneById[id],answer:state.answers[id]};}).filter(function(x){return x.tune&&x.answer;});
  var missed=rows.filter(function(x){return !x.answer.correct;});
  var correct=rows.length-missed.length;
  var rhythmMisses={},tonicMisses={},modeMisses={},hasRhythmStats=false,hasTonalStats=false;
  rows.forEach(function(x){
    var a=x.answer,assessed=a.assessed||{rhythm:a.choice.rhythm!==undefined,tonic:a.choice.tonic!==undefined,mode:a.choice.mode!==undefined};
    if(assessed.rhythm){hasRhythmStats=true;if(a.choice.rhythm!==x.tune.rhythm)rhythmMisses[x.tune.rhythm]=(rhythmMisses[x.tune.rhythm]||0)+1;}
    if(assessed.tonic){hasTonalStats=true;if(a.choice.tonic!==x.tune.tonic)tonicMisses[x.tune.tonic]=(tonicMisses[x.tune.tonic]||0)+1;}
    if(assessed.mode){hasTonalStats=true;if(a.choice.mode!==x.tune.mode)modeMisses[x.tune.mode]=(modeMisses[x.tune.mode]||0)+1;}
  });
  function mostMissedText(counts,labelFn){
    var entries=Object.keys(counts).map(function(key){return {key:key,count:counts[key]};});
    if(!entries.length)return "None";
    var max=Math.max.apply(null,entries.map(function(x){return x.count;}));
    return entries.filter(function(x){return x.count===max;}).sort(function(a,b){return a.key.localeCompare(b.key);}).map(function(x){return escapeHtml(labelFn(x.key))+" ("+x.count+")";}).join(", ");
  }
  var summary=[];
  if(hasRhythmStats)summary.push('<strong>Most missed rhythm:</strong> '+mostMissedText(rhythmMisses,function(x){return x;}));
  if(hasTonalStats){
    if(rows.some(function(x){return x.answer.assessed&&x.answer.assessed.tonic;}))summary.push('<strong>Most missed key:</strong> '+mostMissedText(tonicMisses,function(x){return x;}));
    if(rows.some(function(x){return x.answer.assessed&&x.answer.assessed.mode;}))summary.push('<strong>Most missed mode:</strong> '+mostMissedText(modeMisses,function(x){return MODE_INFO[x]?MODE_INFO[x].shortLabel:x;}));
  }
  if(!window.DayPilot||!DayPilot.Modal||typeof DayPilot.Modal.alert!=="function"){return;}
  var availableHeight=Math.max(0,Math.min(660,window.innerHeight-100));
  var body=[
    '<div class="keyModeFinalReviewScroll" style="max-height:'+availableHeight+'px">',
      '<h2>End-of-Session Review</h2>',
      '<p><strong>Final score: '+correct+' / '+rows.length+'</strong></p>',
      '<div class="reviewItem">'+summary.join("<br>")+'</div>',
      missed.length?'<p style="margin-top:12px">Review of missed tunes:</p>'+missed.map(function(x){
        var a=x.answer,assessed=a.assessed||{rhythm:a.choice.rhythm!==undefined,tonic:a.choice.tonic!==undefined,mode:a.choice.mode!==undefined};
        var lines=['<div class="reviewItem missedReviewItem"><strong>'+escapeHtml(x.tune.title)+'</strong>'+(x.tune.style?' <span class="muted">('+escapeHtml(x.tune.style)+')</span>':'')];
        if(assessed.rhythm)lines.push('<br>Your rhythm answer: '+escapeHtml(a.choice.rhythm)+'<br>Correct rhythm: <strong>'+escapeHtml(x.tune.rhythm)+'</strong>');
        if(assessed.tonic)lines.push('<br>Your key answer: '+escapeHtml(a.choice.tonic)+'<br>Correct key: <strong>'+escapeHtml(x.tune.tonic)+'</strong>');if(assessed.mode)lines.push('<br>Your mode answer: '+escapeHtml(MODE_INFO[a.choice.mode].shortLabel)+'<br>Correct mode: <strong>'+escapeHtml(MODE_INFO[x.tune.mode].shortLabel)+'</strong>');
        lines.push('</div>');return lines.join("");
      }).join(""):'<p style="margin-top:12px">Perfect session — no missed tunes to review.</p>',
      missed.length?'<div class="practiceMissedTunesRow"><button id="practiceMissedTunesBtn" type="button">Practice Missed Tunes</button></div>':'',
    '</div>'
  ].join("");
  var pageX=window.scrollX||window.pageXOffset||0,pageY=window.scrollY||window.pageYOffset||0;
  function restorePageScroll(){window.scrollTo(pageX,pageY);}
  var modalPromise=DayPilot.Modal.alert(body,{okText:"Close",width:Math.min(720,Math.max(300,window.innerWidth-32)),top:50});
  var practiceBtn=document.getElementById("practiceMissedTunesBtn");
  if(practiceBtn){
    practiceBtn.addEventListener("click",function(){
      var ids=missed.map(function(x){return x.tune.id;});
      if(window.DayPilot&&DayPilot.Modal&&typeof DayPilot.Modal.close==="function")DayPilot.Modal.close("practice");
      startMissedTunePractice(ids);
    });
  }
  restorePageScroll();requestAnimationFrame(function(){restorePageScroll();requestAnimationFrame(restorePageScroll);});
  if(modalPromise&&typeof modalPromise.then==="function")modalPromise.then(restorePageScroll);
}

function updateProgress(){
  var track=$("progressBar").parentElement,scoreBox=$("scoreBox");track.hidden=unlimitedMode();if(scoreBox)scoreBox.hidden=unlimitedMode();
  if(unlimitedMode()){$("accuracyText").textContent="Correct "+state.correctTotal+" · Incorrect "+state.incorrectTotal;return;}
  var answers=Object.keys(state.answers).map(function(id){return {id:id,data:state.answers[id],tune:tuneById[id]};}).filter(function(x){return x.tune;});
  var correct=answers.filter(function(x){return x.data.correct;}).length;
  $("scoreText").textContent=correct+" / "+answers.length;$("accuracyText").textContent=answers.length?(Math.round(correct/answers.length*100)+"% correct · "+correct+" / "+answers.length):"No answers yet";
  $("progressBar").style.width=(answers.length/state.sessionIds.length*100)+"%";
}
function updateNavigationButtons(){
  var tune=currentTune(),answered=!!(tune&&state.answers[tune.id]);
  if(unlimitedMode()){$("prevBtn").hidden=true;$("prevBtn").disabled=true;$("nextBtn").hidden=false;$("nextBtn").disabled=!answered;$("finalReviewInlineBtn").hidden=true;return;}
  var isFirst=state.currentIndex===0,isLast=state.currentIndex===state.sessionIds.length-1;
  $("prevBtn").hidden=isFirst;$("prevBtn").disabled=isFirst;$("nextBtn").hidden=isLast;$("nextBtn").disabled=!answered||isLast;$("finalReviewInlineBtn").hidden=!(isLast&&answered);
}
function renderQuestion(){
  pauseAllControllers();clearTuneController();clearScaleControllers();var tune=currentTune();if(!tune)return;
  $("questionEyebrow").textContent=unlimitedMode()?"Question "+state.questionNumber:"Tune "+(state.currentIndex+1)+" of "+state.sessionIds.length;
  var qParts=[];if(styleIncludesRhythm(state.answerStyle))qParts.push("rhythm");if(styleUsesKey(state.answerStyle))qParts.push("key");if(styleUsesMode(state.answerStyle))qParts.push("mode");
  $("questionTitle").textContent="Which "+(qParts.length===1?qParts[0]:qParts.slice(0,-1).join(", ")+" and "+qParts[qParts.length-1])+" do you hear?";
  $("listenHeading").textContent="Click the play button below to listen to the tune";$("listenSubheading").textContent="";
  buildAnswerChoices();updateProgress();updateNavigationButtons();void prepareCurrentTune(false);
}
function go(delta){
  if(delta>0){var tune=currentTune();if(!tune||!state.answers[tune.id])return;}
  if(unlimitedMode()&&delta>0){var previousId=currentTune().id;state.sessionIds=[randomTuneIdExcept(previousId)];state.currentIndex=0;state.answers={};state.heard={};state.questionNumber++;renderQuestion();return;}
  var n=state.currentIndex+delta;if(n<0||n>=state.sessionIds.length)return;state.currentIndex=n;log(delta<0?"Previous Tune clicked":"Next Tune clicked",{question:n+1,tuneId:state.sessionIds[n]});renderQuestion();
}

async function dayPilotConfirm(message,okText){
  if(!window.DayPilot||!DayPilot.Modal||typeof DayPilot.Modal.confirm!=="function"){
    return false;
  }
  var result=await DayPilot.Modal.confirm(message,{okText:okText||"OK",cancelText:"Cancel",width:Math.min(520,Math.max(300,window.innerWidth-32)),top:50});
  return !!(result&&result.result);
}

function showInstructions(){
  if(!window.DayPilot||!DayPilot.Modal||typeof DayPilot.Modal.alert!=="function"){
    
    return;
  }

  var availableHeight=Math.max(0,Math.min(620,window.innerHeight-100));
  var html=[
    '<div class="keyModeInstructionsScroll" style="max-height:'+availableHeight+'px">',
      '<h2 style="text-align:center;">Traditional Irish Tune Rhythm, Key, and Mode Ear Trainer</h2>',
      '<div style="text-align:center;margin:18px 0;"><button id="runGuidedTourFromInstructions" type="button">Run Guided Tour</button></div>',
      '<p>This trainer helps you practice recognizing the rhythm style, key, and mode of traditional Irish tunes by ear.</p>',

      '<h3>Choose Your Answer Style</h3>',
      '<p>The <strong>Answer Style</strong> control offers nine exercise formats: <strong>Rhythm + Key + Mode</strong>, <strong>Rhythm + Key/Mode</strong>, <strong>Rhythm + Key</strong>, <strong>Rhythm + Mode</strong>, <strong>Rhythm Only</strong>, <strong>Key + Mode</strong>, <strong>Key/Mode</strong>, <strong>Key Only</strong>, and <strong>Mode Only</strong>.</p>',
      '<p>Your Answer Style choice is saved in your browser and restored the next time you use the tool.</p>',
      '<p>You can change Answer Style freely before answering a tune. In a 10- or 25-question session, changing Answer Style after answering has begun asks for confirmation, clears your answers and progress, and restarts the same tunes from the first question. In Unlimited mode, changing Answer Style after answering a tune asks for confirmation, clears the running Correct and Incorrect totals, and restarts with the current tune.</p>',

      '<h3>Choose Your Instrument</h3>',
      '<p>Use the <strong>Instrument</strong> selector to choose the sound used for all playback. Choices are Piano, Flute, Whistle, Fiddle, Mandolin, Tenor Banjo, Accordion, Concertina, and Hammered Dulcimer. Piano is the default.</p>',
      '<p>Your instrument choice is saved in your browser and restored the next time you use the tool.</p>',

      '<h3>Choose the Number of Questions</h3>',
      '<p>Choose <strong>10</strong> questions (the default), <strong>25</strong> questions, or <strong>Unlimited</strong>. Your choice is saved in your browser.</p>',
      '<p>For 10- and 25-question sessions, tunes are randomly selected from the full '+allTunes.length+'-tune collection. <strong>Unlimited</strong> keeps giving you random tunes and never repeats the same tune twice in a row. Unlimited mode has no progress bar and no Final Review; Session Progress shows running Correct and Incorrect totals instead.</p>',
      '<p>A fresh session is created whenever the tool is loaded, when you change the number of questions, or when you choose <strong>Start Over with New Tunes</strong>.</p>',

      '<h3>1. Listen to the tune</h3>',
      '<p>Click the play button on the bar to start the tune playing. The answer choices remain disabled until you start playback for that tune. Tunes loop automatically so you can concentrate on the rhythm, key, and overall modal sound.</p>',

      '<h3>2. Choose your answer</h3>',
      '<p>Choose the requested rhythm, key, and/or mode, then choose <strong>Submit Answer</strong>. Rhythm choices are drawn from the tune styles in the collection. The available modes are <strong>Major</strong>, <strong>Dorian</strong>, and <strong>Mixolydian</strong>.</p>',
      '<ul>',
        '<li><strong>Major</strong> — the familiar major sound.</li>',
        '<li><strong>Dorian</strong> — a minor-centered sound with a characteristic raised sixth.</li>',
        '<li><strong>Mixolydian</strong> — a major-centered sound with a lowered seventh.</li>',
      '</ul>',
      '<h3>3. Review the result</h3>',
      '<p>After submitting, the trainer shows the correct answer for every item being tested, along with the tune name and tune style. When key and/or mode are included, common accompaniment chords are shown in the correct-scale comparison section immediately after the <strong>Correct:</strong> key/mode indication.</p>',

      '<h3>Hear the scale</h3>',
      '<p>After a correct answer, use <strong>Root Note</strong> to hear the sustained key, or <strong>Play Scale</strong> to reinforce the key and mode you identified. Playback always starts from the beginning; starting one playback stops and resets any other playback to the beginning.</p>',

      '<h3>Hear the difference</h3>',
      '<p>When a key or mode answer is incorrect, use the <strong>Root Note</strong> buttons to compare the keys, and <strong>Play Selected Scale</strong> and <strong>Play Correct Scale</strong> to compare the two scale tonalities directly. A wrong rhythm answer simply shows the correct rhythm.</p>',

      '<h3>End-of-session review</h3>',
      '<p>After you answer the last tune in a 10- or 25-question session, the <strong>Show Final Review</strong> button appears in the navigation area where <strong>Next Tune</strong> appears on earlier tunes. Click it when you are ready to see your final score and a review of each missed tune.</p>',
      '<p>If you missed any tunes, choose <strong>Practice Missed Tunes</strong> at the bottom of the Final Review to start a new practice session containing only those tunes. The practice session uses your current Answer Style and Instrument, and your answers and progress start fresh.</p>',
      '<p><strong>Unlimited</strong> mode continues with random tunes and has no Final Review.</p>',

      '<h3>Why no Minor tunes?</h3>',
      '<p>It is often fairly ambiguous whether a traditional Irish tune is Dorian or Minor (Aeolian), and in my session playing experience true Minor tunes are far less common than Dorian mode tunes. Including Minor as a separate choice would therefore be more confusing than useful for this ear trainer.</p>',
      '<p>A collection of easily identifiable true Minor (Aeolian) tunes could be added to the trainer in the future as an advanced option.</p>',

      '<h3>Not hearing sound on an iPhone or iPad?</h3>',
      '<p>On iPhone and iPad, <strong>Mute must be turned off in Control Center for the audio to be heard</strong>. This is an iOS audio behavior and is not specific to the ear trainer.</p>',

      '<h3>Traditional Irish Tune Name Ear Trainer</h3>',
      '<p>Want to challenge your ear in a different way? Try the <strong>Traditional Irish Tune Name Ear Trainer</strong>, where you can practice recognizing the name of traditional Irish tunes just by listening.</p>',

      '<p style="text-align:center">',
        '<a href="https://michaeleskin.com/tools/tune-name-ear-trainer/tune-name-ear-trainer.html" ',
        'target="_blank" rel="noopener noreferrer">Traditional Irish Tune Name Ear Trainer</a>',
      '</p>',

      '<h3>Tip Jars</h3>',
      '<p>This ear training tool was created by <a href="https://michaeleskin.com" target="_blank" rel="noopener noreferrer">Michael Eskin</a>.</p>',
      '<p>If you find it useful, please consider making a contribution via my online tip jars:</p>',
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
  if(typeof window.StartEarTrainerFirstRunTourIfNeeded==="function"){
    window.StartEarTrainerFirstRunTourIfNeeded();
  }
}

$("newSetBtn").addEventListener("click",async function(){
  var message=unlimitedMode()?"Start over with a new random tune? Your current totals will be cleared.":"Start over with "+finiteQuestionCount()+" new tunes? Your answers and progress for the current session will be cleared.";
  var ok=await dayPilotConfirm(message,"Start Over");
  if(ok)startNewSet();
});
$("instructionsBtn").addEventListener("click",showInstructions);
document.addEventListener("click",function(event){
  var button=event.target&&event.target.closest?event.target.closest("#runGuidedTourFromInstructions"):null;
  if(!button)return;
  event.preventDefault();
  if(window.DayPilot&&DayPilot.Modal&&typeof DayPilot.Modal.close==="function")DayPilot.Modal.close("guided-tour");
  setTimeout(function(){
    if(typeof window.StartEarTrainerGuidedTour==="function")window.StartEarTrainerGuidedTour();
  },120);
});
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
$("answerStyle").addEventListener("change",async function(){
  var oldStyle=state.answerStyle,newStyle=this.value;
  var hasAnswers=Object.keys(state.answers||{}).length>0;
  if(hasAnswers){
    var styleMessage=unlimitedMode()?"Changing Answer Style will clear your current answer and running totals and restart Unlimited mode with the current tune. Continue?":"Changing Answer Style will clear your answers and progress and restart this session from the first tune. The same tunes will be used.";
    var ok=await dayPilotConfirm(styleMessage,"Change Style");
    if(!ok){this.value=oldStyle;return;}
    pauseAllControllers();
    state.answerStyle=newStyle;
    state.currentIndex=0;
    state.answers={};
    state.heard={};
    state.correctTotal=0;state.incorrectTotal=0;state.questionNumber=1;
    savePreferredAnswerStyle(newStyle);
    renderQuestion();
    return;
  }
  state.answerStyle=newStyle;
  savePreferredAnswerStyle(newStyle);
  buildAnswerChoices();
});
$("questionCount").addEventListener("change",async function(){
  var select=this,previous=select.dataset.previousValue||"10",next=questionCount();if(next===previous)return;
  var ok=await dayPilotConfirm("Changing the number of questions will start a new session and clear your current session progress. Continue?","Start New Session");
  if(ok){saveQuestionCount(next);select.dataset.previousValue=next;startNewSet();}else select.value=previous;
});
$("instrument").addEventListener("change",async function(){
  savePreferredInstrument(this.value);
  pauseAllControllers();
  clearScaleControllers();
  await prepareCurrentTune(true);
  log("Playback instrument changed",{instrument:this.value,program:currentProgram()});
});
window.addEventListener("beforeunload",function(){pauseAllControllers();});

initialize();
})();
