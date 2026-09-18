(function(){
  "use strict";
  var VERSION="1.13",FATBOY="https://michaeleskin.com/abctools/soundfonts/fatboy_4/",SESSION_LENGTH=10,CUSTOM_KEY="tuneNameEarTrainerCustomABC",INSTRUMENT_KEY="tuneNameEarTrainerInstrument",CHOICE_COUNT_KEY="tuneNameEarTrainerChoiceCount";
  var PROGRAMS={
    piano:0,flute:73,whistle:78,fiddle:110,mandolin:141,banjo:105,accordion:21,concertina:133,hammeredDulcimer:15
  }
  ;
  var allTunes=[],tuneById={
  }
  ,usingCustom=false,state=null,tuneController=null,prepareSerial=0;
  function $(id){
    return document.getElementById(id)
  }
  function esc(s){
    return String(s).replace(/[&<>"']/g,function(c){
      return {
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
      }
      [c]
    }
    )
  }
  function displayTitle(str){
    str=String(str||"").trim();

    var numberMatch=/^(\d+)\./.exec(str);
    var titleNumber=numberMatch?numberMatch[1]:null;

    var suffixMap={
      ", The":"The",
      ", the":"The",
      ", A":"A",
      ", a":"A",
      ", Da":"Da",
      ", La":"La",
      ", Le":"Le",
      ", Les":"Les",
      ", Ye":"Ye",
      ", An":"An",
      ", an":"an",
      ", Der":"Der",
      ", Die":"Die",
      ", Das":"Das",
      ", Ein":"Ein",
      ", Eine":"Eine"
    };

    var suffixes=Object.keys(suffixMap);

    for(var i=0;i<suffixes.length;i++){
      var suffix=suffixes[i];

      if(str.endsWith(suffix)){
        if(titleNumber){
          str=str.replace(titleNumber+".","").trim()
        }

        var base=str.slice(0,-suffix.length);
        var result=suffixMap[suffix]+" "+base;

        if(titleNumber){
          result=titleNumber+". "+result
        }

        return result
      }
    }

    return str
  }
  function shuffle(a){
    a=a.slice();
    for(var i=a.length-1;
    i>0;
    i--){
      var j=Math.floor(Math.random()*(i+1)),t=a[i];
      a[i]=a[j];
      a[j]=t
    }
    return a
  }
  function idFor(s){
    var h=2166136261;
    s=String(s).trim();
    for(var i=0;
    i<s.length;
    i++){
      h^=s.charCodeAt(i);
      h=Math.imul(h,16777619)
    }
    return "t"+(h>>>0).toString(36)
  }
  function parseTunes(text){
    var chunks=String(text||"").replace(/\r\n?/g,"\n").split(/(?=^\s*X\s*:)/m),out=[];
    chunks.forEach(function(abc,n){
      if(!/^\s*X\s*:/m.test(abc))return;
      var tm=abc.match(/^\s*T\s*:\s*(.*)$/mi);
      if(!tm||!tm[1].trim())return;
      var normalized=abc.trim()+"\n";
      out.push({
        id:idFor(normalized),title:tm[1].trim(),abc:normalized
      }
      )
    }
    );
    return out
  }
  function localStorageAvailable(){
    try{
      var k="__tuneNameEarTrainerStorageTest__";
      localStorage.setItem(k,"1");
      localStorage.removeItem(k);
      return true
    } catch(e){
      return false
    }
  }
  function isIOS(){
    if(/iPad|iPhone|iPod/.test(navigator.platform)){
      return true
    }
    return navigator.maxTouchPoints&&navigator.maxTouchPoints>2&&/MacIntel/.test(navigator.platform)
  }
  var gIsIOS=isIOS();
  var canStoreCustomCollection=localStorageAvailable();
  function loadInstrument(){
    if(!canStoreCustomCollection)return "piano";
    try{
      var v=localStorage.getItem(INSTRUMENT_KEY);
      return PROGRAMS.hasOwnProperty(v)?v:"piano"
    } catch(e){
      return "piano"
    }
  }
  function saveInstrument(v){
    if(!canStoreCustomCollection)return;
    try{
      localStorage.setItem(INSTRUMENT_KEY,v)
    } catch(e){
    }
  }
  function loadChoiceCount(){
    if(!canStoreCustomCollection)return 6;
    try{
      var v=parseInt(localStorage.getItem(CHOICE_COUNT_KEY),10);
      return v===2||v===4||v===6||v===8||v===10?v:6
    } catch(e){
      return 6
    }
  }
  function saveChoiceCount(v){
    if(!canStoreCustomCollection)return;
    try{
      localStorage.setItem(CHOICE_COUNT_KEY,String(v))
    } catch(e){
    }
  }
  function choiceCount(){
    var v=parseInt($("choiceCount").value,10);
    return v===2||v===4||v===6||v===8||v===10?v:6
  }
  function program(){
    return PROGRAMS[$("instrument").value]||0
  }
  function defaultABC(){
    return String(window.TUNE_NAME_EAR_TRAINER_ABC||"")
  }
  function storedABC(){
    if(!canStoreCustomCollection)return "";
    try{
      return localStorage.getItem(CUSTOM_KEY)||""
    } catch(e){
      return ""
    }
  }
  function useDefaultsAfterCustomError(message){
    try{
      localStorage.removeItem(CUSTOM_KEY)
    } catch(e){
    }
    setCollection(defaultABC(),false);
    startNew();
    alertModal("<p>"+esc(message)+"</p><p>The default tune collection will be used.</p>")
  }
  function setCollection(text,custom){
    var parsed=parseTunes(text),distinct={};
    parsed.forEach(function(t){
      distinct[t.title]=1
    });
    if(parsed.length<10||Object.keys(distinct).length<10){
      throw new Error("The collection must contain at least ten ABC tunes with ten distinct first T: titles.");
    }
    allTunes=parsed;
    usingCustom=custom;
    tuneById={
    }
    ;
    allTunes.forEach(function(t){
      tuneById[t.id]=t
    }
    );
    $("libraryStatus").textContent=(custom?"My tunes: ":"Default tunes: ")+allTunes.length+" tunes";
    $("restoreDefaultsBtn").disabled=!custom
  }
  function chooseSession(){
    return shuffle(allTunes).slice(0,Math.min(SESSION_LENGTH,allTunes.length))
  }
  function newState(ids){
    return {
      sessionIds:(ids||chooseSession().map(function(t){
        return t.id
      }
      )),currentIndex:0,answers:{
      }
      ,heard:{
      }
    }
  }
  function tune(){
    return tuneById[state.sessionIds[state.currentIndex]]
  }
  function pause(){
    try{
      if(tuneController&&tuneController.pause)tuneController.pause()
    } catch(e){
    }
  }
  function clearController(){
    pause();
    tuneController=null;
    $("tuneAudioControls").innerHTML="";
    $("hiddenTuneRender").innerHTML=""
  }
  function playbackABC(abc){
    var out=String(abc).trim();
    if(!/^\s*%soundfont\s+/mi.test(out))out="%soundfont fatboy\n"+out;
    out=out.replace(/^\s*%%MIDI\s+(?:bassprog|chordprog|bassvol|chordvol)\b.*$/gmi,"");
    var accompaniment=[     "%%MIDI bassprog 0",     "%%MIDI chordprog 0",     "%%MIDI bassvol 48",     "%%MIDI chordvol 48"   ].join("\n");
    if(/^\s*K\s*:/mi.test(out))out=out.replace(/^(\s*K\s*:)/mi,accompaniment+"\n$1");
    else out=accompaniment+"\n"+out;
    return out+"\n";
  }
  function cursorControl(){
    return {
      onStart:function(){
      }
      ,onFinished:function(){
      }
      ,onEvent:function(){
      }
    }
  }
  async function prepareTune(){
    var serial=++prepareSerial,current=tune();
    clearController();
    $("playbackStatus").hidden=false;
    $("playbackStatus").textContent="Preparing tune audio…";
    try{
      if(!window.ABCJS||!ABCJS.synth)throw new Error("ABCJS audio is unavailable.");
      var rendered=ABCJS.renderAbc("hiddenTuneRender",playbackABC(current.abc),{
        responsive:"resize"
      }
      );
      if(!rendered.length)throw new Error("Tune could not be rendered.");
      var c=new ABCJS.synth.SynthController();
      c.load("#tuneAudioControls",cursorControl(),{
        displayLoop:false,displayRestart:true,displayPlay:true,displayProgress:true,displayWarp:false
      }
      );
      await c.setTune(rendered[0],false,{
        program:program(),chordsOff:false,soundFontUrl:FATBOY
      }
      );
      if(serial!==prepareSerial)return;
      tuneController=c;
      try{
        if(c.toggleLoop)c.toggleLoop()
      } catch(e){
      }
      $("playbackStatus").hidden=true
    } catch(e){
      $("playbackStatus").textContent="Audio preparation failed. Reload the page and try again."
    }
  }
  function choicesFor(current){
    var others=shuffle(allTunes.filter(function(t){
      return t.title!==current.title
    }
    ));
    var names=[current.title];
    var count=choiceCount();
    for(var i=0;
    i<others.length&&names.length<count;
    i++)if(names.indexOf(others[i].title)<0)names.push(others[i].title);
    return shuffle(names)
  }
  function buildChoices(){
    var current=tune(),answer=state.answers[current.id],names=answer?answer.options:choicesFor(current);
    if(!answer&&names.length<choiceCount()){
      $("tuneChoices").innerHTML="<p>This collection does not contain enough distinct tune names for the selected number of choices.</p>";
      return
    }
    $("tuneChoices").innerHTML=names.map(function(name){
      var cls="choiceLabel"+(state.heard[current.id]?"":" preListenDisabled");
      if(answer){
        if(name===current.title)cls+=" correct";
        if(name===answer.choice&&name!==current.title)cls+=" incorrect"
      }
      return '<label class="'+cls+'"><input type="radio" name="tuneName" value="'+esc(name)+'" '+(answer&&answer.choice===name?"checked":"")+' '+(answer||!state.heard[current.id]?"disabled":"")+'><span>'+esc(displayTitle(name))+'</span></label>'
    }
    ).join("");
    $("answerForm").classList.toggle("answered",!!answer);
    $("submitBtn").disabled=!!answer||!state.heard[current.id]||!document.querySelector('input[name="tuneName"]:checked');
    $("feedback").hidden=!answer;
    if(answer){
      $("feedback").className="feedback "+(answer.correct?"correct":"incorrect");
      $("feedback").innerHTML=answer.correct?"<strong>Correct.</strong> The tune is <strong>"+esc(displayTitle(current.title))+"</strong>.":"<strong>Not quite.</strong> The tune was <strong>"+esc(displayTitle(current.title))+"</strong>."
    }
  }
  function updateProgress(){
    var vals=Object.keys(state.answers).map(function(k){
      return state.answers[k]
    }
    ),correct=vals.filter(function(a){
      return a.correct
    }
    ).length;
    $("scoreText").textContent=correct+" / "+vals.length;
    $("accuracyText").textContent=vals.length?Math.round(correct/vals.length*100)+"% correct · "+correct+" / "+vals.length:"No answers yet";
    $("progressBar").style.width=(vals.length/state.sessionIds.length*100)+"%"
  }
  function nav(){
    var answered=!!state.answers[tune().id],first=state.currentIndex===0,last=state.currentIndex===state.sessionIds.length-1;
    $("prevBtn").hidden=first;
    $("nextBtn").hidden=last;
    $("nextBtn").disabled=!answered||last;
    $("finalReviewInlineBtn").hidden=!(last&&answered)
  }
  function render(){
    pause();
    var current=tune();
    $("questionEyebrow").textContent="Tune "+(state.currentIndex+1)+" of "+state.sessionIds.length;
    $("questionTitle").textContent="Which tune do you hear?";
    buildChoices();
    updateProgress();
    nav();
    void prepareTune()
  }
  function startNew(ids){
    pause();
    state=newState(ids);
    render()
  }
  function submit(e){
    e.preventDefault();
    var current=tune(),sel=document.querySelector('input[name="tuneName"]:checked');
    if(!sel||state.answers[current.id])return;
    var options=Array.prototype.map.call(document.querySelectorAll('input[name="tuneName"]'),function(x){
      return x.value
    }
    );
    state.answers[current.id]={
      choice:sel.value,correct:sel.value===current.title,options:options
    }
    ;
    buildChoices();
    updateProgress();
    nav()
  }
  function go(d){
    if(d>0&&!state.answers[tune().id])return;
    var n=state.currentIndex+d;
    if(n<0||n>=state.sessionIds.length)return;
    state.currentIndex=n;
    render()
  }
  async function confirmModal(msg,ok){
    if(window.DayPilot&&DayPilot.Modal&&DayPilot.Modal.confirm){
      var r=await DayPilot.Modal.confirm(msg,{
        okText:ok,cancelText:"Cancel",width:Math.min(520,window.innerWidth-32),top:50
      }
      );
      return !!(r&&r.result)
    }
    return window.confirm(msg)
  }
  function alertModal(html){
    if(window.DayPilot&&DayPilot.Modal&&DayPilot.Modal.alert)return DayPilot.Modal.alert(html,{
      okText:"Close",width:Math.min(720,window.innerWidth-32),top:50
    }
    );
    alert(html.replace(/<[^>]+>/g," "))
  }
  function finalReview(){
    if(!state.sessionIds.every(function(id){
      return !!state.answers[id]
    }
    ))return;
    pause();
    var missed=state.sessionIds.map(function(id){
      return {
        t:tuneById[id],a:state.answers[id]
      }
    }
    ).filter(function(x){
      return !x.a.correct
    }
    ),correct=state.sessionIds.length-missed.length;
    var body='<div class="tuneNameFinalReviewScroll" style="max-height:'+Math.max(200,Math.min(650,window.innerHeight-100))+'px"><h2>End-of-Session Review</h2><p><strong>Final score: '+correct+' / '+state.sessionIds.length+'</strong></p>'+(missed.length?'<p>Tune names you missed:</p>'+missed.map(function(x){
      return '<div class="reviewItem"><strong>'+esc(displayTitle(x.t.title))+'</strong><br>Your answer: '+esc(displayTitle(x.a.choice))+'</div>'
    }
    ).join('')+'<div class="practiceMissedTunesRow"><button id="practiceMissedTunesBtn" type="button">Practice Missed Tunes</button></div>':'<p>Perfect session — no missed tune names to review.</p>')+'</div>';
    var p=alertModal(body);
    setTimeout(function(){
      var b=$("practiceMissedTunesBtn");
      if(b)b.onclick=function(){
        var ids=missed.map(function(x){
          return x.t.id
        }
        );
        if(DayPilot&&DayPilot.Modal&&DayPilot.Modal.close)DayPilot.Modal.close();
        startNew(ids)
      }
    }
    ,0);
    return p
  }
  function instructions(){
    var body = [
      '<div class="tuneNameInstructionsScroll" style="max-height:' +
        Math.max(200, Math.min(620, window.innerHeight - 100)) +
        'px">',

      '<h2 style="text-align:center">Traditional Irish Tune Name Ear Trainer</h2>',

      '<div style="text-align:center;margin:18px 0">',
        '<button id="runGuidedTourFromInstructions" type="button">Run Guided Tour</button>',
      '</div>',

      '<p>This trainer helps you learn to recognize traditional Irish tunes by name.</p>',

      '<h3>Starting a session</h3>',
      '<p>Each regular session contains 10 tunes selected at random from the current tune collection. ',
      'Only the first <strong>T:</strong> title of each ABC tune is used as its name.</p>',

      '<h3>1. Listen</h3>',
      '<p>Use the playback bar to listen to the current tune. ',
      'The tune-name choices become available after playback begins. ',
      'Tunes loop automatically.</p>',

      '<h3>2. Choose and submit</h3>',
      '<p>Select one of the tune names and click <strong>Submit Answer</strong>. ',
      'The trainer marks your selection and shows the correct tune name. ',

      '<h3>3. Continue and review</h3>',
      '<p>Use <strong>Next Tune</strong> to continue. ',
      'After the last tune, choose <strong>Show Final Review</strong> to see the tune names you missed ',
      'and optionally practice only those tunes again.</p>',

      '<h3>Number of tune-name choices</h3>',
      '<p>Choose whether each question shows <strong>2, 4, 6, 8, or 10</strong> possible tune names. ',
      'The default is 6. When browser local storage is available, your choice is saved in this browser. ',
      'Changing this setting during a session requires confirmation and starts a new 10-tune session.</p>',

      '<h3>Your own ABC tunes</h3>',

      canStoreCustomCollection
        ? [
            '<p>Click <strong>Load My ABC Tunes</strong> and choose a <strong>.abc</strong> or ',
            '<strong>.txt</strong> file containing ABC tunes. ',
            'The file must contain at least ten tunes with ten distinct first T: titles. ',
            'The collection is validated before use and saved in this browser. ',
            'If the file is invalid or cannot be saved, you will be alerted and the default tunes will be used.</p>',

            '<p><strong>Restore Default Tunes</strong> removes the saved custom collection after confirmation ',
            'and returns to the original built-in tunes.</p>'
          ].join("")
        : [
            '<p>Loading and storing a custom tune collection is available only when browser local storage is available. ',
            'This browser is currently using the default tune collection.</p>'
          ].join(""),

      '<h3>Instrument</h3>',
      '<p>Choose the playback instrument in the left panel. ',
      'Your choice is saved in this browser when local storage is available.</p>',

      '<h3>Not hearing sound on an iPhone or iPad?</h3>',
      '<p>On iPhone and iPad, <strong>Mute must be turned off in Control Center for the audio to be heard</strong>. This is an iOS audio behavior and is not specific to the ear trainer.</p>',

      '<h3>Traditional Irish Tune Rhythm, Key, and Mode Ear Trainer</h3>',
      '<p>Want to challenge your ear in a different way? Try the <strong>Traditional Irish Tune Rhythm, Key, and Mode Ear Trainer</strong>, where you can practice recognizing the rhythm, key, and mode of traditional Irish tunes just by listening.</p>',

      '<p style="text-align:center">',
        '<a href="https://michaeleskin.com/tools/ear-trainer/ear-trainer.html" ',
        'target="_blank" rel="noopener noreferrer">Traditional Irish Tune Rhythm, Key, and Mode Ear Trainer</a>',
      '</p>',

      '<h3>Tip Jars</h3>',
      '<p>This ear training tool was created by ',
      '<a href="https://michaeleskin.com" target="_blank" rel="noopener noreferrer">Michael Eskin</a>.</p>',

      '<p>If you find it useful, please consider making a contribution via my online tip jars:</p>',

      '<p style="text-align:center">',
        '<a href="https://michaeleskin.com/abctools/tipjars.html" ',
        'target="_blank" rel="noopener noreferrer">Michael Eskin\'s Tip Jars</a>',
      '</p>',

      '</div>'
    ].join("");

    var p = alertModal(body);

    setTimeout(function(){
      var b = $("runGuidedTourFromInstructions");

      if(b){
        b.onclick = function(){
          if(DayPilot && DayPilot.Modal && DayPilot.Modal.close){
            DayPilot.Modal.close();
          }

          if(window.StartTuneNameEarTrainerGuidedTour){
            window.StartTuneNameEarTrainerGuidedTour();
          }
        };
      }
    }, 0);

    return p;
  }

  function loadFile(file){
    if(!canStoreCustomCollection)return;
    var name=String(file&&file.name||"").toLowerCase();
    if(!/\.(abc|txt)$/.test(name)){
      useDefaultsAfterCustomError("Please choose a .abc or .txt file containing ABC tunes.");
      $("abcFileInput").value="";
      return
    }
    var r=new FileReader();
    r.onload=function(){
      try{
        var text=String(r.result||""),parsed=parseTunes(text),distinct={
        }
        ;
        parsed.forEach(function(t){
          distinct[t.title]=1
        }
        );
        if(!parsed.length)throw new Error("The selected file does not contain any valid ABC tunes with an X: field and a first T: title.");
        if(parsed.length<10||Object.keys(distinct).length<10)throw new Error("The selected file must contain at least ten ABC tunes with ten distinct first T: titles so the 10-choice setting can be used.");
        try{
          localStorage.setItem(CUSTOM_KEY,text);
          if(localStorage.getItem(CUSTOM_KEY)!==text)throw new Error("The saved data could not be verified.")
        } catch(storageError){
          throw new Error("The custom tune collection could not be saved in browser local storage.")
        }
        setCollection(text,true);
        startNew()
      } catch(e){
        useDefaultsAfterCustomError(e&&e.message?e.message:"The selected tune file could not be used.")
      } finally{
        $("abcFileInput").value=""
      }
    }
    ;
    r.onerror=function(){
      $("abcFileInput").value="";
      useDefaultsAfterCustomError("The selected tune file could not be read.")
    }
    ;
    r.readAsText(file)
  }
  function init(){
    if(gIsIOS){
      $("abcFileInput").removeAttribute("accept")
    }
    var controls=$("customCollectionControls");
    if(controls)controls.hidden=!canStoreCustomCollection;
    var custom=storedABC();
    try{
      setCollection(custom||defaultABC(),!!custom)
    } catch(e){
      try{
        localStorage.removeItem(CUSTOM_KEY)
      } catch(_){
      }
      setCollection(defaultABC(),false);
      if(custom)setTimeout(function(){
        alertModal("<p>The saved custom tune collection is invalid or could not be loaded.</p><p>The default tune collection will be used.</p>")
      }
      ,0)
    }
    $("instrument").value=loadInstrument();
    $("choiceCount").value=String(loadChoiceCount());
    $("choiceCount").dataset.previousValue=$("choiceCount").value;
    state=newState();
    render();
    if(window.StartTuneNameEarTrainerFirstRunTourIfNeeded)window.StartTuneNameEarTrainerFirstRunTourIfNeeded()
  }
  $("answerForm").addEventListener("change",function(){
    if(!state.answers[tune().id])$("submitBtn").disabled=!document.querySelector('input[name="tuneName"]:checked')
  }
  );
  $("answerForm").addEventListener("submit",submit);
  $("prevBtn").onclick=function(){
    go(-1)
  }
  ;
  $("nextBtn").onclick=function(){
    go(1)
  }
  ;
  $("finalReviewInlineBtn").onclick=finalReview;
  $("newSetBtn").onclick=async function(){
    if(await confirmModal(
      "Start over with 10 new randomly selected tunes? Your current session progress will be cleared.",
      "Start Over"
    )){
      startNew()
    }
  }
  ;
  $("instructionsBtn").onclick=instructions;
  $("instrument").onchange=function(){
    saveInstrument(this.value);
    void prepareTune()
  }
  ;
  $("choiceCount").onchange=async function(){
    var select=this;
    var previous=select.dataset.previousValue||"6";
    var next=String(choiceCount());

    if(next===previous)return;

    if(await confirmModal(
      "Changing the number of tune-name choices will start a new 10-tune session and clear your current session progress. Continue?",
      "Start New Session"
    )){
      saveChoiceCount(next);
      select.dataset.previousValue=next;
      startNew()
    } else {
      select.value=previous
    }
  }
  ;
  $("loadAbcBtn").onclick=function(){
    $("abcFileInput").click()
  }
  ;
  $("abcFileInput").onchange=function(){
    if(this.files&&this.files[0])loadFile(this.files[0])
  }
  ;
  $("restoreDefaultsBtn").onclick=async function(){
    if(!usingCustom)return;
    if(await confirmModal("Restore the original default tune collection? Your saved custom ABC collection will be removed.","Restore Defaults")){
      try{
        localStorage.removeItem(CUSTOM_KEY)
      } catch(e){
      }
      setCollection(defaultABC(),false);
      startNew()
    }
  }
  ;
  $("tuneAudioControls").addEventListener("click",function(e){
    if(e.target.closest&&e.target.closest(".abcjs-midi-start")){
      var current=tune();
      if(!state.heard[current.id]){
        state.heard[current.id]=true;
        setTimeout(buildChoices,0)
      }
    }
  }
  ,true);
  window.addEventListener("beforeunload",pause);
  init();
}
)();
