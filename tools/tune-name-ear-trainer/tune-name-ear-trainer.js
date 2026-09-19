(function(){
  "use strict";
  var VERSION="1.22",FATBOY="https://michaeleskin.com/abctools/soundfonts/fatboy_4/",CUSTOM_KEY="tuneNameEarTrainerCustomABC",INSTRUMENT_KEY="tuneNameEarTrainerInstrument",CHOICE_COUNT_KEY="tuneNameEarTrainerChoiceCount",QUESTION_COUNT_KEY="tuneNameEarTrainerQuestionCount",AUTOPLAY_KEY="tuneNameEarTrainerAutoPlayNext";
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
      return v===0||v===2||v===4||v===6||v===8||v===10?v:6
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
    return v===0||v===2||v===4||v===6||v===8||v===10?v:6
  }
  function loadQuestionCount(){
    if(!canStoreCustomCollection)return "10";
    try{
      var v=localStorage.getItem(QUESTION_COUNT_KEY);
      return v==="25"||v==="unlimited"?v:"10"
    } catch(e){
      return "10"
    }
  }
  function saveQuestionCount(v){
    if(!canStoreCustomCollection)return;
    try{
      localStorage.setItem(QUESTION_COUNT_KEY,String(v))
    } catch(e){}
  }
  function loadAutoPlayNext(){
    if(!canStoreCustomCollection)return false;
    try{
      return localStorage.getItem(AUTOPLAY_KEY)==="enabled"
    } catch(e){
      return false
    }
  }
  function saveAutoPlayNext(enabled){
    if(!canStoreCustomCollection)return;
    try{
      localStorage.setItem(AUTOPLAY_KEY,enabled?"enabled":"disabled")
    } catch(e){}
  }
  function autoPlayNextEnabled(){
    return $("autoPlayNext").value==="enabled"
  }
  function questionCount(){
    var v=$("questionCount").value;
    return v==="25"||v==="unlimited"?v:"10"
  }
  function unlimitedMode(){
    return questionCount()==="unlimited"
  }
  function finiteQuestionCount(){
    return questionCount()==="25"?25:10
  }
  function revealMode(){
    return choiceCount()===0
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
      throw new Error("The collection must contain at least 10 ABC tunes, each with a first T: title, and at least 10 distinct tune names.");
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
  function chooseSession(count){
    var out=[];
    while(out.length<count){
      var batch=shuffle(allTunes);
      for(var i=0;i<batch.length&&out.length<count;i++){
        if(out.length&&out[out.length-1].id===batch[i].id)continue;
        out.push(batch[i])
      }
    }
    return out
  }
  function randomTuneIdExcept(previousId){
    if(allTunes.length<2)return allTunes[0].id;
    var t;
    do{t=allTunes[Math.floor(Math.random()*allTunes.length)]}while(t.id===previousId);
    return t.id
  }
  function newState(ids){
    var unlimited=unlimitedMode();
    return {
      sessionIds:(ids||(unlimited?[randomTuneIdExcept(null)]:chooseSession(finiteQuestionCount()).map(function(t){return t.id}))),
      currentIndex:0,answers:{},heard:{},correctTotal:0,incorrectTotal:0,revealedTotal:0,questionNumber:1
    }
  }
  function tune(){
    return tuneById[state.sessionIds[state.currentIndex]]
  }
  function answerKey(){return String(state.currentIndex)}
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
  function cursorControl(onFinished){
    return {
      onStart:function(){
      }
      ,onFinished:function(){
        if(typeof onFinished==="function")onFinished()
      }
      ,onEvent:function(){
      }
    }
  }
  async function prepareTune(autoPlay){
    var serial=++prepareSerial,current=tune();
    clearController();
    $("playbackStatus").hidden=true;
    $("playbackStatus").textContent="";
    try{
      if(!window.ABCJS||!ABCJS.synth)throw new Error("ABCJS audio is unavailable.");
      var rendered=ABCJS.renderAbc("hiddenTuneRender",playbackABC(current.abc),{
        responsive:"resize"
      }
      );
      if(!rendered.length)throw new Error("Tune could not be rendered.");
      var c=new ABCJS.synth.SynthController();
      var restartingLoop=false;
      c.load("#tuneAudioControls",cursorControl(function(){
        if(restartingLoop||serial!==prepareSerial||tuneController!==c)return;
        restartingLoop=true;
        try{
          if(c.restart)c.restart();
          var p=c.play?c.play():null;
          if(p&&typeof p.then==="function"){
            p.then(function(){restartingLoop=false}).catch(function(){restartingLoop=false})
          } else {
            restartingLoop=false
          }
        } catch(e){
          restartingLoop=false
        }
      }),{
        displayLoop:false,displayRestart:true,displayPlay:true,displayProgress:true,displayWarp:false
      }
      );
      await c.setTune(rendered[0],!!autoPlay,{
        program:program(),chordsOff:false,soundFontUrl:FATBOY
      }
      );
      if(serial!==prepareSerial)return;
      tuneController=c;
      $("playbackStatus").hidden=true;
      if(autoPlay&&serial===prepareSerial){
        state.heard[answerKey()]=true;
        buildChoices();
        try{
          if(c.play)c.play()
        } catch(e){
        }
      }
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
    var current=tune(),answer=state.answers[answerKey()],isReveal=revealMode();

    $("answerFieldset").hidden=isReveal;
    $("submitBtn").textContent=isReveal?"Reveal Answer":"Submit Answer";
    $("answerForm").classList.toggle("answered",!!answer);

    if(isReveal){
      $("tuneChoices").innerHTML="";
      $("submitBtn").disabled=!!answer||!state.heard[answerKey()];
      $("feedback").hidden=!answer;
      if(answer){
        $("feedback").className="feedback reveal";
        $("feedback").innerHTML="The tune is <strong>"+esc(displayTitle(current.title))+"</strong>."
      }
      return
    }

    var names=answer?answer.options:choicesFor(current);
    if(!answer&&names.length<choiceCount()){
      $("tuneChoices").innerHTML="<p>This collection does not contain enough distinct tune names for the selected number of choices.</p>";
      return
    }
    $("tuneChoices").innerHTML=names.map(function(name){
      var cls="choiceLabel"+(state.heard[answerKey()]?"":" preListenDisabled");
      if(answer){
        if(name===current.title)cls+=" correct";
        if(name===answer.choice&&name!==current.title)cls+=" incorrect"
      }
      return '<label class="'+cls+'"><input type="radio" name="tuneName" value="'+esc(name)+'" '+(answer&&answer.choice===name?"checked":"")+' '+(answer||!state.heard[answerKey()]?"disabled":"")+'><span>'+esc(displayTitle(name))+'</span></label>'
    }
    ).join("");
    $("submitBtn").disabled=!!answer||!state.heard[answerKey()]||!document.querySelector('input[name="tuneName"]:checked');
    $("feedback").hidden=!answer;
    if(answer){
      $("feedback").className="feedback "+(answer.correct?"correct":"incorrect");
      $("feedback").innerHTML=answer.correct?"<strong>Correct.</strong> The tune is <strong>"+esc(displayTitle(current.title))+"</strong>.":"<strong>Not quite.</strong> The tune was <strong>"+esc(displayTitle(current.title))+"</strong>."
    }
  }
  function updateProgress(){
    var vals=Object.keys(state.answers).map(function(k){return state.answers[k]});
    var track=$("progressBar").parentElement;
    track.hidden=unlimitedMode();
    var scoreBox=document.querySelector(".scoreBox");
    if(scoreBox)scoreBox.hidden=unlimitedMode();

    if(unlimitedMode()){
      if(revealMode()){
        $("scoreText").textContent="Revealed: "+state.revealedTotal;
        $("accuracyText").textContent=state.revealedTotal+" revealed"
      } else {
        $("scoreText").textContent="Correct: "+state.correctTotal+" · Incorrect: "+state.incorrectTotal;
        $("accuracyText").textContent="Correct "+state.correctTotal+" · Incorrect "+state.incorrectTotal
      }
      return
    }

    if(revealMode()){
      $("scoreText").textContent=vals.length+" / "+state.sessionIds.length;
      $("accuracyText").textContent=vals.length?vals.length+" of "+state.sessionIds.length+" revealed":"No answers revealed yet";
      $("progressBar").style.width=(vals.length/state.sessionIds.length*100)+"%";
      return
    }
    var correct=vals.filter(function(a){return a.correct}).length;
    $("scoreText").textContent=correct+" / "+vals.length;
    $("accuracyText").textContent=vals.length?Math.round(correct/vals.length*100)+"% correct · "+correct+" / "+vals.length:"No answers yet";
    $("progressBar").style.width=(vals.length/state.sessionIds.length*100)+"%"
  }
  function nav(){
    var answered=!!state.answers[answerKey()];
    if(unlimitedMode()){
      $("prevBtn").hidden=true;
      $("nextBtn").hidden=false;
      $("nextBtn").disabled=!answered;
      $("finalReviewInlineBtn").hidden=true;
      return
    }
    var first=state.currentIndex===0,last=state.currentIndex===state.sessionIds.length-1;
    $("prevBtn").hidden=first;
    $("nextBtn").hidden=last;
    $("nextBtn").disabled=!answered||last;
    $("finalReviewInlineBtn").hidden=!(last&&answered)
  }
  function render(autoPlay){
    pause();
    var current=tune();
    $("questionEyebrow").textContent=unlimitedMode()?"Question "+state.questionNumber:"Tune "+(state.currentIndex+1)+" of "+state.sessionIds.length;
    $("questionTitle").textContent="Which tune do you hear?";
    buildChoices();updateProgress();nav();void prepareTune(!!autoPlay)
  }
  function startNew(ids){
    pause();
    state=newState(ids);
    render()
  }
  function submit(e){
    e.preventDefault();
    var current=tune();
    if(state.answers[answerKey()]||!state.heard[answerKey()])return;

    if(revealMode()){
      state.answers[answerKey()]={revealed:true,correct:null,choice:"",options:[]};
      if(unlimitedMode())state.revealedTotal++;
      buildChoices();
      updateProgress();
      nav();
      return
    }

    var sel=document.querySelector('input[name="tuneName"]:checked');
    if(!sel)return;
    var options=Array.prototype.map.call(document.querySelectorAll('input[name="tuneName"]'),function(x){
      return x.value
    }
    );
    state.answers[answerKey()]={choice:sel.value,correct:sel.value===current.title,options:options};
    if(unlimitedMode()){
      if(sel.value===current.title)state.correctTotal++;else state.incorrectTotal++
    }
    buildChoices();
    updateProgress();
    nav()
  }
  function go(d){
    if(d>0&&!state.answers[answerKey()])return;
    if(unlimitedMode()&&d>0){
      var previousId=tune().id;
      state.sessionIds=[randomTuneIdExcept(previousId)];
      state.currentIndex=0;
      state.answers={};state.heard={};state.questionNumber++;
      render(autoPlayNextEnabled());return
    }
    var n=state.currentIndex+d;
    if(n<0||n>=state.sessionIds.length)return;
    state.currentIndex=n;render(d>0&&autoPlayNextEnabled())
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
    if(unlimitedMode())return;
    if(state.sessionIds.some(function(id,index){return !state.answers[String(index)]}))return;
    pause();
    if(revealMode()){
      var revealBody='<div class="tuneNameFinalReviewScroll" style="max-height:'+Math.max(200,Math.min(650,window.innerHeight-100))+'px"><h2>End-of-Session Review</h2><p>You completed all '+state.sessionIds.length+' tunes in <strong>Reveal Answer</strong> mode. No score is kept in this mode.</p><p>Tune names:</p>'+state.sessionIds.map(function(id){return '<div class="reviewItem revealReviewItem"><strong>'+esc(displayTitle(tuneById[id].title))+'</strong></div>'}).join('')+'</div>';
      return alertModal(revealBody)
    }
    var missed=state.sessionIds.map(function(id,index){return {t:tuneById[id],a:state.answers[String(index)]}}).filter(function(x){return !x.a.correct}),correct=state.sessionIds.length-missed.length;
    var body='<div class="tuneNameFinalReviewScroll" style="max-height:'+Math.max(200,Math.min(650,window.innerHeight-100))+'px"><h2>End-of-Session Review</h2><p><strong>Final score: '+correct+' / '+state.sessionIds.length+'</strong></p>'+(missed.length?'<p>Tune names you missed:</p>'+missed.map(function(x){return '<div class="reviewItem"><strong>'+esc(displayTitle(x.t.title))+'</strong><br>Your answer: '+esc(displayTitle(x.a.choice))+'</div>'}).join('')+'<div class="practiceMissedTunesRow"><button id="practiceMissedTunesBtn" type="button">Practice Missed Tunes</button></div>':'<p>Perfect session — no missed tune names to review.</p>')+'</div>';
    var p=alertModal(body);
    setTimeout(function(){var b=$("practiceMissedTunesBtn");if(b)b.onclick=function(){var ids=missed.map(function(x){return x.t.id});if(DayPilot&&DayPilot.Modal&&DayPilot.Modal.close)DayPilot.Modal.close();startNew(ids)}},0);
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
      '<p>First choose the playback instrument. Then choose how you want to identify the tunes: select <strong>Reveal Answer — No Choices</strong> to guess without tune-name hints, ',
      'or choose <strong>2, 4, 6, 8, or 10</strong> tune-name choices for each question. ',
      'Then choose <strong>10</strong>, <strong>25</strong>, or <strong>Unlimited</strong> questions, and choose whether ',
      '<strong>Auto-play on Next Tune</strong> is enabled or disabled. ',
      'Tunes are selected at random from the current tune collection.</p>',

      '<h3>1. Listen</h3>',
      '<p>Use the playback bar to listen to the current tune. ',
      'In a multiple-choice mode, the tune-name choices become available after playback begins. ',
      'Tunes loop automatically.</p>',

      '<h3>2. Choose and submit, or reveal the answer</h3>',
      '<p>With 2, 4, 6, 8, or 10 choices, select one of the tune names and click <strong>Submit Answer</strong>. ',
      'The trainer marks your selection and shows the correct tune name. ',
      'In <strong>Reveal Answer</strong> mode, no tune-name choices are shown. Try to identify the tune without any hints, ',
      'then click <strong>Reveal Answer</strong> to see its name. There is no right-or-wrong scoring in this mode.</p>',

      '<h3>3. Continue and review</h3>',
      '<p>Use <strong>Next Tune</strong> to continue. ',
      'After the last tune in a 10- or 25-question session, choose <strong>Show Final Review</strong>. In a multiple-choice mode, the review shows ',
      'the tune names you missed and lets you practice them again. In Reveal Answer mode, it lists the tune names ',
      'you worked through without assigning a score.</p>',

      '<h3>Instrument</h3>',
      '<p>Choose the playback instrument in the left panel. ',
      'Your choice is saved in this browser when possible.</p>',

      '<h3>Answer Mode / Tune Name Choices</h3>',
      '<p>The first option, <strong>Reveal Answer — No Choices</strong>, gives you no tune-name hints and keeps no score. ',
      'Or choose <strong>2, 4, 6, 8, or 10</strong> possible tune name choices for each question. ',
      'The default is 6. ',
      'Changing this setting during a session requires confirmation and starts a new session.</p>',

      '<h3>Number of Questions</h3>',
      '<p>Choose <strong>10</strong> questions (the default), <strong>25</strong> questions, or <strong>Unlimited</strong>. ',
      'Unlimited mode continues with random tunes, never repeats the same tune twice in a row, and has no progress bar or final review.</p>',

      '<h3>Auto-play on Next Tune</h3>',
      '<p>This setting is disabled by default. When enabled, clicking <strong>Next Tune</strong> automatically starts playback after the next tune is loaded. ',
      'Playback loops automatically. Your setting is saved in this browser when possible.</p>',

      '<h3>Using your own ABC tunes</h3>',

      canStoreCustomCollection
        ? [
            '<p>Click <strong>Load My ABC Tunes</strong> and choose a <strong>.abc</strong> or ',
            '<strong>.txt</strong> file containing ABC tunes. ',
            'The file must contain at least 10 tunes, each with a first T: title, and at least 10 distinct tune names. ',
            'The collection is validated before use and saved in this browser. ',
            'If the file is invalid or cannot be saved, you will be alerted and the default tunes will be used.</p>',

            '<p><strong>Restore Default Tunes</strong> removes the saved custom collection after confirmation ',
            'and returns to the original built-in tunes.</p>'
          ].join("")
        : [
            '<p>Loading and saving a custom tune collection is not available in this browser. ',
            'This browser is currently using the default tune collection.</p>'
          ].join(""),

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
        if(parsed.length<10||Object.keys(distinct).length<10)throw new Error("The selected file must contain at least 10 ABC tunes, each with a first T: title, and at least 10 distinct tune names so the 10-choice setting can be used.");
        try{
          localStorage.setItem(CUSTOM_KEY,text);
          if(localStorage.getItem(CUSTOM_KEY)!==text)throw new Error("The saved data could not be verified.")
        } catch(storageError){
          throw new Error("The custom tune collection could not be saved in this browser.")
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
    $("autoPlayNext").value=loadAutoPlayNext()?"enabled":"disabled";
    $("questionCount").value=loadQuestionCount();
    $("questionCount").dataset.previousValue=$("questionCount").value;
    state=newState();
    render();
    if(window.StartTuneNameEarTrainerFirstRunTourIfNeeded)window.StartTuneNameEarTrainerFirstRunTourIfNeeded()
  }
  $("answerForm").addEventListener("change",function(){
    if(!state.answers[answerKey()])$("submitBtn").disabled=!document.querySelector('input[name="tuneName"]:checked')
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
      unlimitedMode()?"Start over with a new random tune? Your current totals will be cleared.":"Start over with a new "+finiteQuestionCount()+"-question session? Your current session progress will be cleared.",
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
      "Changing the answer mode or number of tune-name choices will start a new session and clear your current session progress. Continue?",
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
  $("autoPlayNext").onchange=function(){
    saveAutoPlayNext(this.value==="enabled")
  };
  $("questionCount").onchange=async function(){
    var select=this,previous=select.dataset.previousValue||"10",next=questionCount();
    if(next===previous)return;
    if(await confirmModal("Changing the number of questions will start a new session and clear your current session progress. Continue?","Start New Session")){
      saveQuestionCount(next);select.dataset.previousValue=next;startNew()
    } else select.value=previous
  };
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
      if(!state.heard[answerKey()]){
        state.heard[answerKey()]=true;
        setTimeout(buildChoices,0)
      }
    }
  }
  ,true);
  window.addEventListener("beforeunload",pause);
  init();
}
)();
