(function(){
"use strict";

var STORAGE_KEY = "abcNotationTutorStateV1";
var FATBOY = "https://michaeleskin.com/abctools/soundfonts/fatboy_4/";
var renderTimer = null;
var synthControl = null;
var visualObj = null;
var state = { currentLesson:0, completed:{} };

var lessons = [
{
 title:"The Structure of an ABC Tune",
 summary:"Learn the small set of header fields that turn plain text into a complete ABC tune.",
 goals:["X: reference number","T: title","M: meter","L: default note length","K: key"],
 abc:`X:1
T:My First ABC Tune
M:4/4
L:1/4
Q:1/4=100
K:C
C D E F | G A B c | c B A G | F E D C |]`,
 notes:`<p>An ABC tune normally begins with header fields, followed by the music. <code>X:</code> identifies the tune, <code>T:</code> gives it a title, and <code>K:</code> marks the end of the header and establishes the key.</p><p>The music after <code>K:</code> is written as note names and bar lines. ABC is compact because many musical defaults are declared once in the header.</p>`,
 tour:[
  ["#lessonHeaderCard","A tune has a header and a body","The header describes the tune. The notes after <code>K:</code> are the tune body."],
  ["#abcEditor","Start with the header fields","Find <code>X:</code>, <code>T:</code>, <code>M:</code>, <code>L:</code>, <code>Q:</code>, and <code>K:</code>. Change the title after <code>T:</code> and watch the notation update."],
  ["#paper","Plain text becomes notation","abcjs renders the ABC text into conventional staff notation."],
  ["#audio","And it can become sound","Use the player to hear the same ABC. This tutor forces piano for playback."]
 ]
},
{
 title:"Pitches, Octaves, and Accidentals",
 summary:"Learn how letter case, commas, apostrophes, sharps, flats, and naturals describe pitch.",
 goals:["A–G notes","octaves","^ sharp","_ flat","= natural"],
 abc:`X:1
T:Pitches and Octaves
M:4/4
L:1/4
Q:1/4=90
K:C
C D E F | G A B c | c d e f | g a b c' |
C, D, E, F, | G, A, B, C | ^F _B =B c | ^C _E =E G |]`,
 notes:`<p>Uppercase <code>C D E F G A B</code> are the lower written octave; lowercase <code>c d e f g a b</code> are one octave higher. Add commas to lower a note by octaves and apostrophes to raise it.</p><p>Use <code>^</code> for a sharp, <code>_</code> for a flat, and <code>=</code> for an explicit natural. An accidental normally carries through the rest of that measure for the same pitch, then the key signature applies again in the next measure.</p>`,
 tour:[
  ["#abcEditor","Letter case changes octave","Compare uppercase <code>C</code> with lowercase <code>c</code>. Then compare <code>c</code> with <code>c'</code>."],
  ["#paper","See the octave changes","The first three measures climb through several octaves."],
  ["#abcEditor","Accidentals go before notes","The second line demonstrates <code>^F</code>, <code>_B</code>, <code>=B</code>, and other explicit accidentals. Once introduced, an accidental normally remains in effect for that pitch through the rest of the measure."],
  ["#audio","Hear the pitch spelling","Play the example and listen to the octave jumps and accidentals."]
 ]
},
{
 title:"Note Lengths and Rests",
 summary:"Use numbers and fractions to make notes longer or shorter, and use z for a rest.",
 goals:["2 and 3 multipliers","/2 shorthand","fractions","z rests"],
 abc:`X:1
T:Lengths and Rests
M:4/4
L:1/8
Q:1/4=90
K:C
C D E2 F4 | G4 z4 | A/2 B/2 c d e2 f3 | g3 a b2 z2 |]`,
 notes:`<p><code>L:1/8</code> says a note letter with no length number after it is an eighth note. A number multiplies that default: <code>E2</code> is twice as long and <code>G4</code> is four times as long.</p><p>A slash divides the duration. <code>A/2</code> can also be written <code>A/</code>. The letter <code>z</code> means a rest and takes the same length syntax as a note.</p>`,
 tour:[
  ["#abcEditor","L: establishes the unit","Here <code>L:1/8</code> makes a note letter with no length number after it an eighth note."],
  ["#abcEditor","Numbers multiply duration","Look for <code>E2</code>, <code>G4</code>, and <code>g3</code>."],
  ["#abcEditor","Fractions shorten duration","The pair <code>A/2 B/2</code> uses half of the default note length for each note."],
  ["#paper","Rests occupy time too","The <code>z4</code> and <code>z2</code> entries render as rests of different lengths."]
 ]
},
{
 title:"Bars, Measures, and Complete Timing",
 summary:"Use bar lines to organize music and make the durations inside each measure agree with the meter.",
 goals:["| bar line","|] final bar","measure duration","timing errors"],
 abc:`X:1
T:Four Complete Measures
M:4/4
L:1/8
Q:1/4=96
K:G
G2 A2 B2 c2 | d4 B4 | A2 B2 c2 A2 | G8 |]`,
 notes:`<p>The vertical bar <code>|</code> ends a measure. With <code>M:4/4</code> and <code>L:1/8</code>, a full measure contains eight default-length units.</p><p><code>|]</code> is a common final bar line. ABC can often render incomplete measures, but learning to count the durations inside each bar makes later features much easier.</p>`,
 tour:[
  ["#abcEditor","Bar lines divide measures","Each <code>|</code> separates one measure from the next."],
  ["#abcEditor","Count duration units","In measure one, four notes marked <code>2</code> total eight eighth-note units."],
  ["#paper","Different spellings can fill the same bar","The second measure uses two half-note-length values while the fourth uses one whole-measure note."]
 ]
},
{
 title:"Meters and Default Note Length",
 summary:"See how M: and L: work together, including common simple and compound meters.",
 goals:["M:4/4","M:3/4","M:6/8","L: interaction"],
 abc:`X:1
T:A Jig in Six Eight
M:6/8
L:1/8
Q:3/8=96
K:D
d2 e fed | A2 d d2 e | fed e2 d | cBc A2 A |]`,
 notes:`<p><code>M:</code> sets the meter, which tells you how each measure is organized. Common examples are <code>M:4/4</code>, <code>M:3/4</code>, and <code>M:6/8</code>. <code>L:</code> sets the duration represented by a plain note symbol. In short: <code>M:</code> describes the measure, while <code>L:</code> sets the default length of a note letter with no length number after it.</p><p>In 6/8 with <code>L:1/8</code>, six eighth notes fill each measure in this example. Every bar here is complete, so you can compare the meter directly with the note-length totals.</p>`,
 tour:[
  ["#abcEditor","M:6/8 establishes compound meter","The meter is six eighth notes per full measure."],
  ["#abcEditor","L:1/8 keeps the ABC compact","Note letters with no length number after them already mean eighth notes, so most notes need no length suffix."],
  ["#paper","The notation groups the pulse","Notice how each complete 6/8 measure is visually grouped into two main beats."],
  ["#audio","Tempo can use the dotted-beat grouping","Here <code>Q:3/8=96</code> defines the tempo in groups of three eighth notes."]
 ]
},
{
 title:"Keys and Key Signatures",
 summary:"Use K: to choose the tonal center and let the key signature handle most accidentals automatically.",
 goals:["K:C","K:G","K:D","major/minor/modal names"],
 abc:`X:1
T:Key of D Major
M:4/4
L:1/8
Q:1/4=92
K:D
D2 EF G2 A2 | B2 cd e2 f2 | g2 fe d2 cB | A2 GF E2 D2 |]`,
 notes:`<p><code>K:</code> sets the key signature. In <code>K:D</code>, F and C are sharp by default, so you write <code>F</code> and <code>C</code> rather than adding a sharp every time.</p><p>ABC also accepts common minor and modal key spellings such as <code>K:Am</code>, <code>K:Edor</code>, and <code>K:Amix</code>. Here <code>Edor</code> means E Dorian and <code>Amix</code> means A Mixolydian: the letters after the tonic identify the mode.</p>`,
 tour:[
  ["#abcEditor","The key belongs at the end of the header","The <code>K:D</code> field both sets D major and tells the parser the music body follows."],
  ["#paper","The key signature supplies accidentals","The staff shows two sharps even though the ABC notes use plain F and C letters."],
  ["#abcEditor","Key names can include a mode","Spellings such as <code>K:Edor</code> and <code>K:Amix</code> mean E Dorian and A Mixolydian. The text after the tonic identifies the mode."],
  ["#audio","Playback follows the key signature","The sounding pitches reflect the active key unless you explicitly override an accidental."]
 ]
},
{
 title:"Tempo, Rhythm, and Descriptive Fields",
 summary:"Add Q:, R:, C:, and other descriptive fields without changing the basic note-entry model.",
 goals:["Q: tempo","R: rhythm","C: composer","metadata"],
 abc:`X:1
T:Metadata Example
C:Traditional
R:Reel
M:4/4
L:1/8
Q:1/4=108
K:G
G2 BG dGBG | A2 cA eAcA | G2 BG d2 Bd | cAFA G4 |]`,
 notes:`<p><code>Q:</code> specifies tempo. <code>R:</code> describes the rhythm or tune type, such as <code>R:Reel</code>, <code>R:Jig</code>, or <code>R:Hornpipe</code>, and <code>C:</code> identifies the composer or source. These fields can be displayed in notation and can also help software organize tunes.</p><p>Some ABC software also uses the contents of <code>R:</code> when interpreting playback. For example, a program may automatically apply a swung feel when <code>R:Hornpipe</code> is present. This behavior is software-dependent; the <code>R:</code> field itself primarily identifies the tune's rhythm or type.</p><p>A tune can also contain more than one <code>T:</code> field. Additional title fields are often used for alternate titles. There are many other ABC information fields, but the same general pattern applies: a letter, a colon, then the field value.</p>`,
 tour:[
  ["#abcEditor","Add descriptive metadata","This example identifies a title, composer/source, and rhythm before the musical settings. ABC can also use additional <code>T:</code> fields for alternate titles."],
  ["#abcEditor","R: identifies the rhythm or tune type","Values such as <code>R:Reel</code>, <code>R:Jig</code>, and <code>R:Hornpipe</code> describe the kind of tune."],
  ["#paper","Metadata can appear in the score","The title and selected information fields are rendered along with the notation."],
  ["#abcEditor","Q: controls playback speed","Change <code>Q:1/4=108</code> to <code>Q:1/4=72</code>."],
  ["#audio","Some software also interprets R: during playback","Playback behavior is software-dependent. For example, some programs may automatically swing a tune identified with <code>R:Hornpipe</code>."]
 ]
},
{
 title:"Ties, Slurs, and Beaming",
 summary:"Connect durations with ties, group phrases with slurs, and understand how spacing affects beaming.",
 goals:["- tie","( ) slur","spacing and beams"],
 abc:`X:1
T:Ties and Slurs
M:4/4
L:1/8
Q:1/4=88
K:C
(CD EF) G2-G2 | G4 (AB cd) | e2 d2 c2 B2 | A4 G4 |]`,
 notes:`<p>A hyphen after a note ties it to the next note of the same pitch: <code>G2-G2</code>. A tie combines their durations into one sustained sound. Parentheses around a group, such as <code>(CD EF)</code>, create a slur. Unlike a tie, a slur can connect different pitches and indicates phrasing or articulation rather than combining note durations.</p><p>Spaces in ABC can influence rhythmic grouping and beaming. They are useful for making the source easier to read as well as shaping notation.</p>`,
 tour:[
  ["#abcEditor","A hyphen creates a tie","Find <code>G2-G2</code>. Both G notes sound as one sustained event across their written division."],
  ["#paper","Ties and slurs have different jobs","A tie connects notes of the same pitch and combines their duration. A slur can span different pitches and indicates phrasing or articulation."],
  ["#abcEditor","Parentheses create slurs","The groups <code>(CD EF)</code> and <code>(AB cd)</code> are phrased with slurs."],
  ["#paper","Spacing helps communicate rhythm","Compare the visual grouping with the spaces in the ABC source."]
 ]
},
{
 title:"Broken Rhythm and Tuplets",
 summary:"Write common uneven rhythmic patterns compactly with > and <, and create tuplets with parenthesized counts.",
 goals:["> and <","(3 triplets","compact rhythm"],
 abc:`X:1
T:Broken Rhythm and Triplets
M:4/4
L:1/8
Q:1/4=92
K:D
A>B AF D2 FA | (3ABA (3GFE D4 | F<G AB d2 cd | (3efg (3fed A4 |]`,
 notes:`<p><code>A&gt;B</code> lengthens the first note and shortens the second; <code>A&lt;B</code> does the reverse. With two equal starting durations, a single <code>&gt;</code> makes the first note 3/2 of its original length and the second 1/2, while preserving their combined duration. Repeated symbols such as <code>&gt;&gt;</code> make the contrast stronger.</p><p><code>(3ABC</code> introduces a triplet. ABC also supports other tuplet counts, but triplets are the most common starting point.</p>`,
 tour:[
  ["#abcEditor","Broken rhythm uses angle brackets","The first measure begins <code>A&gt;B</code>, which makes A longer and B shorter while keeping the pair's total duration unchanged. With equal starting values, the first becomes 3/2 as long and the second 1/2 as long."],
  ["#paper","See the unequal durations","The notation shows the dotted/shortened rhythmic effect without spelling out explicit fractions."],
  ["#abcEditor","(3 starts a triplet","Each <code>(3</code> applies a triplet grouping to the following notes."],
  ["#audio","Hear both rhythm devices","Playback makes the contrast between broken rhythm and evenly spaced triplets clear."]
 ]
},
{
 title:"Repeats",
 summary:"Use |: and :| to repeat a section without duplicating the notes in the ABC source.",
 goals:["|: start repeat",":| end repeat","repeat playback"],
 abc:`X:1
T:Simple Repeats
M:4/4
L:1/8
Q:1/4=96
K:G
|: G2 AB B2 AG | E2 EF G4 | A2 AB c2 BA | G2 GE D4 :|]`,
 notes:`<p><code>|:</code> starts a repeated section and <code>:|</code> ends it. The notation displays repeat dots, and playback follows the repeat structure.</p><p>Repeats are one of ABC's biggest space savers: you encode the musical structure rather than copying the same measures twice. The next lesson builds on this same repeat syntax by adding first and second endings.</p>`,
 tour:[
  ["#abcEditor","Start the repeated section with |:","The repeat begins immediately after the key header."],
  ["#abcEditor","Close it with :|","The final bar sends the performer or player back to the repeat start."],
  ["#paper","Repeat symbols render conventionally","The staff shows the same repeat marks used in printed music."],
  ["#audio","Playback understands repeats","The player follows the repeat structure, so the section is heard twice. Lesson 11 builds on the same syntax with alternate endings."]
 ]
},
{
 title:"First and Second Endings",
 summary:"Combine repeats with alternate endings using |1 and |2.",
 goals:["|1 first ending","|2 second ending","repeat structure"],
 abc:`X:1
T:First and Second Endings
M:4/4
L:1/8
Q:1/4=96
K:D
|: D2 FA A2 d2 | c2 BA F4 | G2 BG E2 GE | A2 FD E4 |
|1 D2 FA D4 | A2 GF E4 :|2 D2 FA d4 | c2 A2 D4 |]`,
 notes:`<p>This lesson builds directly on the repeat syntax from Lesson 10. <code>|1</code> begins the first ending. After the repeat returns, <code>|2</code> begins the second ending. This is much cleaner than duplicating the entire repeated passage.</p><p>Endings can span more than one measure; the simple example here keeps each ending short so the syntax is easy to see.</p>`,
 tour:[
  ["#abcEditor","This builds on Lesson 10 repeats","The music begins with the same <code>|:</code> repeat syntax from the previous lesson and continues to the alternate-ending point."],
  ["#abcEditor","|1 introduces ending one","The first pass takes the music under the first ending and reaches <code>:|</code>."],
  ["#abcEditor","|2 introduces ending two","After repeating, playback skips ending one and takes ending two instead."],
  ["#paper","The brackets show the form visually","The rendered notation labels the alternate endings above the staff."]
 ]
},
{
 title:"Chord Symbols and Accompaniment",
 summary:"Put quoted chord names before notes and let ABC playback generate harmonic accompaniment.",
 goals:['"G" chord symbols',"major/minor/7th chords","chord placement"],
 abc:`X:1
T:Chord Symbols
M:4/4
L:1/8
Q:1/4=96
K:G
%%MIDI program 0
%%MIDI bassprog 0
%%MIDI chordprog 0
"G" G2 BG d2 BG | "C" E2 GE c2 GE | "G" D2 GB B2 AG | "D7" F2 AF "G" G4 |]`,
 notes:`<p>Put a chord name in double quotes immediately before the note where the harmony changes, for example <code>"G"G2</code> or <code>"D7"F2</code>.</p><p>Chord symbols appear above the staff at the point where the harmony changes. Common chord names such as major, minor, and seventh chords can be entered directly inside the quotes.</p><p>Quoted text is not always a chord symbol. As shown later in Lesson 14, prefixes such as <code>^</code> and <code>_</code> inside the quotes identify text annotations placed above or below the notes.</p>`,
 tour:[
  ["#abcEditor","Quoted text before a note can be a chord","Find <code>\"G\"</code>, <code>\"C\"</code>, and <code>\"D7\"</code> in the tune body."],
  ["#paper","Chord symbols appear above the staff","The quoted harmony names are placed where their musical changes occur. Later, Lesson 14 shows how <code>^</code> and <code>_</code> inside quoted text create annotations instead of chord symbols."],
  ["#audio","Hear the melody","Use Play to hear the notated melody while following the chord symbols above the staff."]
 ]
},
{
 title:"Grace Notes and Decorations",
 summary:"Add grace notes in braces and common decorations around notes.",
 goals:["{ } grace notes","!accent!","!fermata!","~ ornament"],
 abc:`X:1
T:Grace Notes and Decorations
M:4/4
L:1/8
Q:1/4=84
K:G
{A}G2 BG !accent!d2 BG | A2 {Bc}d2 G4 | ~G2 AB !fermata!B4 | A2 GF G4 |]`,
 notes:`<p>Grace notes are enclosed in braces, such as <code>{A}G</code> or <code>{Bc}d</code>. Decorations can be written with names between exclamation marks, for example <code>!accent!</code> and <code>!fermata!</code>.</p><p>The tilde <code>~</code> is a commonly used ornament marker. Exact decoration rendering and playback can depend on the selected ABC feature and abcjs behavior.</p>`,
 tour:[
  ["#abcEditor","Grace notes live in braces","The notes inside <code>{A}</code> and <code>{Bc}</code> decorate the main note that follows."],
  ["#paper","Grace notes are drawn smaller","The renderer distinguishes them visually from the principal melody notes."],
  ["#abcEditor","Named decorations use !...!","Try moving <code>!accent!</code> or changing the decorated note."],
  ["#audio","Some decorations affect playback","Hear how the playback interprets the grace notes and supported ornaments."]
 ]
},
{
 title:"Lyrics, Text, and Parts",
 summary:"Add lyrics with w:, label sections with P:, and place text annotations above or below the staff.",
 goals:["w: lyrics","P: parts",'"^Above" text','"_Below" text'],
 abc:`X:1
T:Words and Parts
M:4/4
L:1/4
Q:1/4=96
K:C
P:A
"^Above"C D E F | G A G E | F E D C | C D E C |
w: Do re mi fa | sol la sol mi | fa mi re do | sing it once more |
P:B
"_Below"F E D C | D E F G | A G F E | D C C2 |]
w: Now we walk back | up the scale now | down we come a- | gain home _ |`,
 notes:`<p>A <code>w:</code> line attaches words to the preceding music line. Hyphens can split syllables and underscores or other lyric controls can extend alignment.</p><p>Text annotations can also be attached to a note: <code>"^Above"C</code> places <em>Above</em> above the staff, while <code>"_Below"F</code> places <em>Below</em> below it. The <code>^</code> and <code>_</code> are positioning markers and are not displayed as part of the annotation. <code>P:</code> can identify sections or parts of a tune.</p>`,
 tour:[
  ["#abcEditor","w: attaches lyrics to the previous music line","The first lyric line follows the first line of notes and aligns its words under those notes."],
  ["#paper","Lyrics are positioned under the staff","The score displays the words without changing the note pitches."],
  ["#abcEditor","Text annotations can go above or below","In quoted text, the <code>^</code> prefix puts the annotation above the notes and the <code>_</code> prefix puts it below the notes. Here <code>&quot;^Above&quot;C</code> places <em>Above</em> over C, while <code>&quot;_Below&quot;F</code> places <em>Below</em> under F."],
  ["#paper","See the annotations in the score","Compare <em>Above</em> over the first line of notes with <em>Below</em> under the second line."],
  ["#abcEditor","P: labels formal sections","The example uses <code>P:A</code> and <code>P:B</code> to identify two parts."],
 ]
},
{
 title:"Multiple Voices with V: Tags",
 summary:"Build a true multi-voice score by defining voices and switching between them with V: fields.",
 goals:["V: definitions","voice names","clefs","polyphonic playback"],
 abc:`X:1
T:Two-Voice ABC
M:4/4
L:1/8
Q:1/4=88
K:C
%%score 1 2
V:1 name="Melody" clef=treble
%%MIDI program 0
V:2 name="Bass" clef=bass
%%MIDI program 0
V:1 
C2 E2 G2 c2 | B2 G2 E2 C2 | F2 A2 c2 A2 | G8 |]
V:2
C,4 G,4 | C,4 G,4 | F,4 C4 | C,8 |]`,
 notes:`<p><code>V:</code> identifies voices. A <code>V:</code> line in the header can define a voice with attributes such as its display name or clef. A <code>V:</code> field in the music body then selects which defined voice the following notes belong to.</p><p>The <code>%%score</code> directive controls how those already-defined voices are arranged in the displayed score; it does not create the voices. This example arranges a treble melody and bass line and plays both using a piano sound.</p>`,
 tour:[
  ["#abcEditor","Define each voice in the header","The <code>V:1</code> and <code>V:2</code> lines name the voices and give them treble and bass clefs."],
  ["#abcEditor","Arrange defined voices with %%score","The score directive controls how the defined voices are arranged in the displayed score; it does not create the voices."],
  ["#abcEditor","Header V: defines; body V: selects","The header <code>V:</code> lines define the voices and their attributes. In the music body, <code>V:1</code> or <code>V:2</code> selects which voice receives the notes that follow."],
  ["#paper","Both voices render together","The notation now contains two coordinated staves instead of one melody staff."],
  ["#audio","Both voices play at once","Playback combines the voices. This is the foundation for more elaborate ensemble and keyboard ABC."]
 ]
}
];

function loadState(){
  try{
    var raw=localStorage.getItem(STORAGE_KEY);
    if(raw){
      var saved=JSON.parse(raw);
      if(saved && typeof saved === "object"){
        state.currentLesson=Math.max(0,Math.min(lessons.length-1,Number(saved.currentLesson)||0));
        state.completed=saved.completed && typeof saved.completed==="object" ? saved.completed : {};
      }
    }
  }catch(e){}
}
function saveState(){
  try{
    localStorage.setItem(STORAGE_KEY,JSON.stringify({
      currentLesson:state.currentLesson,
      completed:state.completed
    }));
  }catch(e){}
}
function lessonKey(i){ return String(i); }
function current(){ return lessons[state.currentLesson]; }
function setStatus(text,isError){
  var el=document.getElementById("status");
  el.textContent=text||"";
  el.classList.toggle("error",!!isError);
}
function renderLessonList(){
  var list=document.getElementById("lessonList");
  list.innerHTML="";
  lessons.forEach(function(lesson,i){
    var b=document.createElement("button");
    b.type="button";
    b.className="lessonItem"+(i===state.currentLesson?" active":"");
    b.dataset.lesson=String(i);
    var done=!!state.completed[lessonKey(i)];
    b.innerHTML='<span class="num">'+(i+1)+'</span><span>'+escapeHtml(lesson.title)+'</span><span class="done">'+(done?"✓":"")+"</span>";
    b.title=(done?"Completed: ":"Open: ")+lesson.title;
    b.addEventListener("click",function(){ selectLesson(i); });
    list.appendChild(b);
  });
  var count=Object.keys(state.completed).filter(function(k){return state.completed[k];}).length;
  document.getElementById("progressText").textContent=count+" of "+lessons.length+" lessons completed";
}
function selectLesson(i){
  stopAudio();
  state.currentLesson=Math.max(0,Math.min(lessons.length-1,i));
  saveState();
  showLesson();
}

function sanitizeEditorABC(abc){
  return String(abc == null ? "" : abc)
    .replace(/^[ \t]*%%stretchlast[ \t]+true[ \t]*(?:\r?\n|$)/gmi,"");
}


function addRenderStretchLast(abc){
  var value=String(abc == null ? "" : abc);
  if(/^[ \t]*%%stretchlast[ \t]+true[ \t]*$/mi.test(value)) return value;

  var lines=value.split(/\r?\n/);
  var kIndex=-1;
  for(var i=0;i<lines.length;i++){
    if(/^[ \t]*K:/.test(lines[i])){
      kIndex=i;
      break;
    }
  }

  if(kIndex>=0) lines.splice(kIndex+1,0,"%%stretchlast true");
  else lines.unshift("%%stretchlast true");

  return lines.join("\n");
}

function showLesson(){
  var l=current(), key=lessonKey(state.currentLesson);
  document.getElementById("lessonNumber").textContent="Lesson "+(state.currentLesson+1)+" of "+lessons.length;
  document.getElementById("lessonTitle").textContent=l.title;
  document.getElementById("lessonSummary").textContent=l.summary;
  document.getElementById("lessonGoals").innerHTML=l.goals.map(function(g){return '<span class="goalChip">'+escapeHtml(g)+'</span>';}).join("");
  document.getElementById("lessonNotes").innerHTML=l.notes;
  document.getElementById("abcEditor").value=sanitizeEditorABC(l.abc);
  document.getElementById("completeBtn").textContent=state.completed[key]?"Mark Uncompleted":"Mark Completed";
  document.getElementById("completeBtn").classList.toggle("secondary",!!state.completed[key]);
  document.getElementById("prevLessonBtn").disabled=state.currentLesson===0;
  document.getElementById("nextLessonBtn").disabled=state.currentLesson===lessons.length-1;
  renderLessonList();
  renderABC();
  window.scrollTo({top:0,behavior:"smooth"});
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c];});
}
function destroySynth(){
  if(synthControl){
    try{synthControl.destroy();}catch(e){}
    synthControl=null;
  }
  document.getElementById("audio").innerHTML="";
}
function stopAudio(){ destroySynth(); }
function buildCursorControl(){
  return {
    onEvent:function(ev){
      document.querySelectorAll("#paper .abcjs-note.tutor-playing").forEach(function(el){el.classList.remove("tutor-playing");});
      if(!ev || !ev.elements) return;
      ev.elements.forEach(function(group){
        group.forEach(function(el){ if(el && el.classList) el.classList.add("tutor-playing"); });
      });
    },
    onFinished:function(){
      document.querySelectorAll("#paper .tutor-playing").forEach(function(el){el.classList.remove("tutor-playing");});
    }
  };
}
function renderABC(){
  clearTimeout(renderTimer);
  renderTimer=setTimeout(function(){
    var abc=document.getElementById("abcEditor").value;
    var renderABCText=addRenderStretchLast(abc);
    destroySynth();
    document.getElementById("paper").innerHTML="";
    try{
      if(!window.ABCJS || !ABCJS.renderAbc) throw new Error("The portable abcjs library did not load.");
      if(ABCJS.eskinConfig && ABCJS.eskinConfig.setSoundFontUrl){
        ABCJS.eskinConfig.setSoundFontUrl(FATBOY);
        if(ABCJS.eskinConfig.setReverb) ABCJS.eskinConfig.setReverb({enabled:false});
      }
      var result=ABCJS.renderAbc("paper",renderABCText,{},{responsive:"resize",add_classes:true},{});
      if(!result || !result.length) throw new Error("No tune could be rendered.");
      visualObj=result[0];
      synthControl=new ABCJS.synth.SynthController(renderABCText);
      synthControl.load("#audio",buildCursorControl(),{
        displayLoop:false,displayRestart:true,displayPlay:true,displayProgress:true,displayWarp:false
      });
      synthControl.setTune(visualObj,false,{program:0,bassprog:0,chordprog:0});
      setStatus("",false);
    }catch(err){
      visualObj=null;
      setStatus("Render error: "+(err && err.message ? err.message : String(err)),true);
    }
  },120);
}
function initEvents(){
  document.getElementById("abcEditor").addEventListener("input",renderABC);
  document.getElementById("restoreExampleBtn").addEventListener("click",function(){
    stopAudio();
    document.getElementById("abcEditor").value=sanitizeEditorABC(current().abc);
    renderABC();
  });
  document.getElementById("completeBtn").addEventListener("click",function(){
    var key=lessonKey(state.currentLesson);
    state.completed[key]=!state.completed[key];
    if(!state.completed[key]) delete state.completed[key];
    saveState();
    document.getElementById("completeBtn").textContent=state.completed[key]?"Mark Uncompleted":"Mark Completed";
    document.getElementById("completeBtn").classList.toggle("secondary",!!state.completed[key]);
    renderLessonList();
  });
  document.getElementById("resetProgressBtn").addEventListener("click",async function(){
    if(!window.DayPilot || !DayPilot.Modal || !DayPilot.Modal.confirm){
      setStatus("DayPilot.Modal is not available.",true);
      return;
    }
    var result=await DayPilot.Modal.confirm("Mark all 15 lessons as uncompleted?");
    if(result.canceled) return;
    state.completed={};
    saveState();
    document.getElementById("completeBtn").textContent="Mark Completed";
    document.getElementById("completeBtn").classList.remove("secondary");
    renderLessonList();
  });
  document.getElementById("prevLessonBtn").addEventListener("click",function(){ if(state.currentLesson>0) selectLesson(state.currentLesson-1);});
  document.getElementById("nextLessonBtn").addEventListener("click",function(){ if(state.currentLesson<lessons.length-1) selectLesson(state.currentLesson+1);});
  document.getElementById("tourBtn").addEventListener("click",function(){
    if(window.ABCNotationTutorTour) window.ABCNotationTutorTour.start(state.currentLesson);
  });
}
window.ABCNotationTutorAPI={
  lessons:lessons,
  getCurrentLessonIndex:function(){return state.currentLesson;},
  selectLesson:function(i){selectLesson(i);},
  markCurrentCompleted:function(value){
    var key=lessonKey(state.currentLesson);
    if(value===false) delete state.completed[key]; else state.completed[key]=true;
    saveState();
    document.getElementById("completeBtn").textContent=state.completed[key]?"Mark Uncompleted":"Mark Completed";
    document.getElementById("completeBtn").classList.toggle("secondary",!!state.completed[key]);
    renderLessonList();
  },
  render:function(){renderABC();}
};

loadState();
if(document.readyState==="loading"){
  document.addEventListener("DOMContentLoaded",function(){initEvents();showLesson();},{once:true});
}else{initEvents();showLesson();}
})();