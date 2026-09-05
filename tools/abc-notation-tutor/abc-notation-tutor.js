(function(){
"use strict";

var STORAGE_KEY = "abcNotationTutorStateV2";
var LEGACY_STORAGE_KEY = "abcNotationTutorStateV1";
var WELCOME_KEY = "abcNotationTutorWelcomeSeenV1";
var FATBOY = "https://michaeleskin.com/abctools/soundfonts/fatboy_4/";
var renderTimer = null;
var synthControl = null;
var visualObj = null;
var state = { currentLesson:0, completed:{} };

var lessons = [
{
 title:"Introduction",
 summary:"What ABC notation is, where it came from, and why it is especially useful for traditional music.",
 goals:["what ABC is","a little ABC history","why musicians use it","ABC and Irish traditional music"],
 abc:null,
 notes:`<p><strong>ABC notation</strong> is a text-based way of writing music. Instead of entering notes on a graphical staff, you describe the music with ordinary characters: letters for pitches, numbers and symbols for note lengths, vertical bars for measures, and short fields for information such as the title, meter, tempo, and key. Software can then turn that text into conventional sheet music and play it back.</p><p>ABC was developed by Chris Walshaw in the early 1990s as a compact way to notate and exchange tunes. It became particularly popular among folk and traditional musicians because a tune can be stored, copied, emailed, posted on the web, searched, edited, and shared as plain text while still containing enough musical information to produce useful notation and playback.</p><p>ABC is especially well suited to <strong>traditional Irish music</strong>. Reels, jigs, hornpipes, polkas, slides, airs, and other traditional tunes are often centered on a single melody line with recurring sections and relatively compact forms. ABC can represent those melodies very efficiently, while also handling features such as repeats, first and second endings, ornaments, chord symbols, parts, and different keys and meters. Large collections containing hundreds or even thousands of tunes can remain surprisingly compact and easy to work with.</p><p>ABC is not limited to Irish music or to simple melodies. It can represent many kinds of music and can include lyrics, multiple voices, layout instructions, and playback information. But one of its greatest strengths is that you do not need to learn all of that at once. A small amount of ABC syntax is enough to start entering useful tunes.</p><p>The next <strong>15 lessons</strong> build that syntax progressively. You will begin with the basic structure of an ABC tune, then work through pitches, rhythms, meters, keys, repeats, endings, chords, decorations, text, lyrics, and multiple voices. Each lesson provides an ABC example that you can edit, rendered notation, playback, an interactive walkthrough, and a short quiz.</p><p>When you are ready, click <strong>Next Lesson</strong> to begin Lesson 1: <em>The Structure of an ABC Tune</em>.</p>`,
 tour:[]
},
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
 summary:"Put chord names inside double quotes before notes and let ABC playback generate harmonic accompaniment.",
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
 notes:`<p>Put a chord name in double quotes immediately before the note where the harmony changes, for example <code>"G"G2</code> or <code>"D7"F2</code>.</p><p>Chord symbols appear above the staff at the point where the harmony changes. Common chord names such as major, minor, and seventh chords can be entered directly inside the double quotes.</p><p>Text in double quotes is not always a chord symbol. As shown later in Lesson 14, prefixes such as <code>^</code> and <code>_</code> at the start of the text inside the double quotes identify text annotations placed above or below the notes.</p>`,
 tour:[
  ["#abcEditor","Text in double quotes before a note can be a chord","Find <code>\"G\"</code>, <code>\"C\"</code>, and <code>\"D7\"</code> in the tune body."],
  ["#paper","Chord symbols appear above the staff","The chord names inside double quotes are placed where their musical changes occur. Later, Lesson 14 shows how <code>^</code> and <code>_</code> at the start of text in double quotes create annotations instead of chord symbols."],
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
 title:"Comments,  Text, Text Annotations, Lyrics, and Parts",
 summary:"Learn comments, standalone text, text annotations, lyrics, and part labels in ABC.",
 goals:["% comments","%%text / %%center",'"^Above" / "_Below" annotations',"w: lyrics","P: parts"],
 abc:`X:1
T:Comments,  Text, Text Annotations, Lyrics, and Parts
%
% This is a comment. Comments start with a single percent sign.
%
%%text Here is some left-justified text before the notation
M:4/4
L:1/4
Q:1/4=96
K:C
P:A
"^Above"C D E F | G A G E | F E D C | C D E C |
w: Do re mi fa | sol la sol mi | fa mi re do | sing it once more |
P:B
"_Below"F E D C | D E F G | A G F E | D C C2 |]
w: Now we walk back | up the scale now | down we come a- | gain home _ |
%%center Here is some center-justified text after the notation`,
 notes:`<p>A single percent sign <code>%</code> starts a comment. Comments are useful for notes in the ABC source and are not rendered as part of the notation.</p><p><code>%%text</code> adds a standalone left-justified line of text, while <code>%%center</code> adds a standalone centered line. In this example they appear before and after the notation.</p><p>Text annotations can be attached to a note: <code>"^Above"C</code> places <em>Above</em> above the staff, while <code>"_Below"F</code> places <em>Below</em> below it. The <code>^</code> and <code>_</code> are positioning markers and are not displayed as part of the annotation.</p><p>A <code>w:</code> line attaches lyrics to the preceding music line. Hyphens can split syllables and underscores or other lyric controls can extend alignment.</p><p><code>P:</code> can identify sections or parts of a tune. This example uses <code>P:A</code> and <code>P:B</code>.</p>`,
 tour:[
  ["#abcEditor","Comments","Comments start with a single percent sign <code>%</code>. The comment near the top of this example is kept in the ABC source but is not rendered as part of the notation."],
  ["#abcEditor","Text","The <code>%%text</code> command adds a standalone left-justified line of text. The <code>%%center</code> command adds a standalone centered line. This example uses <code>%%text</code> before the notation and <code>%%center</code> after it."],
  ["#abcEditor","Text Annotations","Text annotations can be attached directly to a note. The <code>^</code> prefix places the annotation above the staff and the <code>_</code> prefix places it below. Here <code>&quot;^Above&quot;C</code> and <code>&quot;_Below&quot;F</code> demonstrate both positions."],
  ["#abcEditor","Lyrics","A <code>w:</code> line attaches lyrics to the preceding music line. The lyric lines in this example align words and syllables beneath the notes."],
  ["#abcEditor","Parts","The <code>P:</code> field labels sections or parts of a tune. This example uses <code>P:A</code> and <code>P:B</code> to identify its two parts."],
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
  ["#openInAbcToolsBtn","Continue in ABC Transcription Tools","You now know the core ABC notation used by most tunes. Use <strong>Open in ABC Transcription Tools</strong> to continue with more advanced editing, playback, practice, sharing, and export features."]
 ]
}
];


var lessonQuizzes = [
 null,
 [
  {
   "q": "Which ABC header field identifies the tune with a reference number?",
   "options": [
    "X:",
    "T:",
    "M:",
    "K:"
   ],
   "answer": 0,
   "explanation": "X: is the tune reference-number field."
  },
  {
   "q": "Which field gives an ABC tune its title?",
   "options": [
    "L:",
    "T:",
    "Q:",
    "C:"
   ],
   "answer": 1,
   "explanation": "T: supplies the tune title."
  },
  {
   "q": "What is the special role of K: in a basic ABC tune header?",
   "options": [
    "It sets tempo only",
    "It identifies the composer",
    "It ends the header and establishes the key",
    "It starts the first measure"
   ],
   "answer": 2,
   "explanation": "K: establishes the key and normally marks the end of the tune header."
  },
  {
   "q": "In a normal ABC tune, where does the music body begin?",
   "options": [
    "Before X:",
    "After K:",
    "After the final bar line",
    "Inside the T: field"
   ],
   "answer": 1,
   "explanation": "The note data normally begins after the K: field."
  }
 ],
 [
  {
   "q": "Compared with uppercase C, what does lowercase c represent?",
   "options": [
    "The same pitch",
    "A pitch one octave higher",
    "A pitch one octave lower",
    "C sharp"
   ],
   "answer": 1,
   "explanation": "Lowercase note letters are one octave higher than their uppercase counterparts."
  },
  {
   "q": "What does a comma after a note letter do?",
   "options": [
    "Raises it by an octave",
    "Lowers it by an octave",
    "Makes it sharp",
    "Halves its duration"
   ],
   "answer": 1,
   "explanation": "A comma lowers the note by one octave; additional commas lower it further."
  },
  {
   "q": "Which ABC notation explicitly writes F sharp?",
   "options": [
    "_F",
    "=F",
    "^F",
    "F'"
   ],
   "answer": 2,
   "explanation": "A caret before a note indicates a sharp, so ^F is F sharp."
  },
  {
   "q": "What normally happens to an accidental at the next bar line?",
   "options": [
    "It continues for the rest of the tune",
    "The key signature applies again",
    "It changes into a natural",
    "It moves to the next pitch"
   ],
   "answer": 1,
   "explanation": "An accidental normally applies through the rest of its measure, then the key signature applies again in the next measure."
  }
 ],
 [
  {
   "q": "With L:1/8, what duration does a plain note letter such as C represent?",
   "options": [
    "A whole note",
    "A quarter note",
    "An eighth note",
    "A sixteenth note"
   ],
   "answer": 2,
   "explanation": "L:1/8 makes the default note length an eighth note."
  },
  {
   "q": "With L:1/8, how long is E2?",
   "options": [
    "One sixteenth note",
    "One eighth note",
    "One quarter note",
    "One half note"
   ],
   "answer": 2,
   "explanation": "The 2 doubles the default eighth-note length, producing a quarter note."
  },
  {
   "q": "What does A/2 do to the default duration of A?",
   "options": [
    "Doubles it",
    "Halves it",
    "Triples it",
    "Adds a rest"
   ],
   "answer": 1,
   "explanation": "/2 divides the default duration by two; A/ is shorthand for the same thing."
  },
  {
   "q": "Which letter represents a rest in ABC?",
   "options": [
    "r",
    "v",
    "z",
    "p"
   ],
   "answer": 2,
   "explanation": "The letter z represents a rest and uses the same length syntax as a note."
  }
 ],
 [
  {
   "q": "With M:4/4 and L:1/8, how many default-length units fill a complete measure?",
   "options": [
    "4",
    "6",
    "8",
    "16"
   ],
   "answer": 2,
   "explanation": "A 4/4 measure contains four quarter notes, which equals eight eighth-note default units."
  },
  {
   "q": "What does a single | normally indicate in the tune body?",
   "options": [
    "A bar line between measures",
    "A repeat start",
    "A slur",
    "A key change"
   ],
   "answer": 0,
   "explanation": "The vertical bar separates measures."
  },
  {
   "q": "Which ABC symbol is a common final bar line?",
   "options": [
    "|]",
    "|:",
    ":|",
    "||:"
   ],
   "answer": 0,
   "explanation": "|] is a common ABC final bar line."
  },
  {
   "q": "Why is it useful to count the durations inside each measure?",
   "options": [
    "To make every note the same pitch",
    "To make the measure agree with the meter",
    "To remove the key signature",
    "To prevent chord symbols"
   ],
   "answer": 1,
   "explanation": "The summed note and rest durations should normally agree with the meter for a complete measure."
  }
 ],
 [
  {
   "q": "What does M: describe?",
   "options": [
    "The meter of each measure",
    "The default note length",
    "The key signature",
    "The tune title"
   ],
   "answer": 0,
   "explanation": "M: sets the meter, which describes how each measure is organized."
  },
  {
   "q": "What does L: set?",
   "options": [
    "The playback instrument",
    "The default note length",
    "The number of measures",
    "The rhythm name"
   ],
   "answer": 1,
   "explanation": "L: sets the duration represented by a plain note letter with no length suffix."
  },
  {
   "q": "With M:6/8 and L:1/8, how many plain eighth-note values fill a complete measure?",
   "options": [
    "3",
    "4",
    "6",
    "8"
   ],
   "answer": 2,
   "explanation": "Six eighth-note values fill one 6/8 measure."
  },
  {
   "q": "In the lesson example, what does Q:3/8=96 use as the tempo beat unit?",
   "options": [
    "One eighth note",
    "Two eighth notes",
    "Three eighth notes",
    "One whole note"
   ],
   "answer": 2,
   "explanation": "3/8 specifies a beat unit made from three eighth notes."
  }
 ],
 [
  {
   "q": "What does K:D establish?",
   "options": [
    "D major",
    "D minor only",
    "A 4/4 meter",
    "A Dorian rhythm"
   ],
   "answer": 0,
   "explanation": "K:D establishes D major unless a mode or minor qualifier says otherwise."
  },
  {
   "q": "In K:D, which notes are sharp by default?",
   "options": [
    "F and C",
    "B and E",
    "G and D",
    "A and E"
   ],
   "answer": 0,
   "explanation": "D major has F sharp and C sharp in its key signature."
  },
  {
   "q": "What does K:Edor mean?",
   "options": [
    "E major",
    "E Dorian",
    "E minor only",
    "E Mixolydian"
   ],
   "answer": 1,
   "explanation": "The dor suffix identifies Dorian mode, so Edor means E Dorian."
  },
  {
   "q": "Why can you normally write plain F and C in K:D?",
   "options": [
    "ABC ignores accidentals in D",
    "The key signature supplies their sharps",
    "F and C become rests",
    "K:D changes them into flats"
   ],
   "answer": 1,
   "explanation": "The D-major key signature makes F and C sharp automatically unless overridden."
  }
 ],
 [
  {
   "q": "Which ABC field specifies tempo?",
   "options": [
    "Q:",
    "R:",
    "C:",
    "P:"
   ],
   "answer": 0,
   "explanation": "Q: is the tempo field."
  },
  {
   "q": "What does R: primarily describe?",
   "options": [
    "The tune's rhythm or type",
    "The composer",
    "The default note length",
    "The number of voices"
   ],
   "answer": 0,
   "explanation": "R: identifies a rhythm or tune type such as Reel, Jig, or Hornpipe."
  },
  {
   "q": "What is C: commonly used for?",
   "options": [
    "Chord names",
    "Composer name",
    "Clef selection",
    "Closing a repeat"
   ],
   "answer": 1,
   "explanation": "C: commonly identifies the composer or source."
  },
  {
   "q": "What may some ABC software do when it sees R:Hornpipe?",
   "options": [
    "Delete the key signature",
    "Automatically apply a swung playback feel",
    "Change every note to a triplet",
    "Disable playback"
   ],
   "answer": 1,
   "explanation": "Some software may interpret R:Hornpipe by applying a swung feel during playback; this behavior is software-dependent."
  }
 ],
 [
  {
   "q": "What does G2-G2 represent?",
   "options": [
    "A slur between different pitches",
    "Two G notes tied into one sustained sound",
    "A repeat",
    "A broken rhythm pair"
   ],
   "answer": 1,
   "explanation": "The hyphen ties the two same-pitch G notes so their durations are sustained together."
  },
  {
   "q": "Which notation creates a slur around several notes?",
   "options": [
    "{CDEF}",
    "(CDEF)",
    "[CDEF]",
    "\"CDEF\""
   ],
   "answer": 1,
   "explanation": "Parentheses around notes create a slur."
  },
  {
   "q": "What is a key difference between a tie and a slur?",
   "options": [
    "A tie joins the durations of same-pitch notes; a slur indicates phrasing and may span different pitches",
    "A slur can only connect rests",
    "A tie always changes pitch",
    "There is no difference"
   ],
   "answer": 0,
   "explanation": "A tie combines same-pitch note durations, while a slur indicates phrasing or articulation and can span different pitches."
  },
  {
   "q": "What can spaces in ABC influence besides readability?",
   "options": [
    "The key signature",
    "Rhythmic grouping and beaming",
    "The tune reference number",
    "The composer field"
   ],
   "answer": 1,
   "explanation": "Spaces can help shape rhythmic grouping and beaming in the rendered notation."
  }
 ],
 [
  {
   "q": "For two equal starting note lengths, what does A>B do?",
   "options": [
    "Makes A shorter and B longer",
    "Makes A longer and B shorter",
    "Makes both notes twice as long",
    "Turns the pair into a triplet"
   ],
   "answer": 1,
   "explanation": "A single > lengthens the first note and shortens the second while preserving the pair's total duration."
  },
  {
   "q": "For two equal starting durations, a single > makes the first note what fraction of its original duration?",
   "options": [
    "1/2",
    "1",
    "3/2",
    "2"
   ],
   "answer": 2,
   "explanation": "With equal starting values, the first becomes 3/2 of its original duration and the second becomes 1/2."
  },
  {
   "q": "What does (3ABC introduce?",
   "options": [
    "A first ending",
    "A triplet",
    "A three-measure repeat",
    "Three chord symbols"
   ],
   "answer": 1,
   "explanation": "(3 starts a triplet grouping on the following notes."
  },
  {
   "q": "What does F<G do?",
   "options": [
    "Makes F longer and G shorter",
    "Makes F shorter and G longer",
    "Makes both notes shorter",
    "Turns F and G into a triplet"
   ],
   "answer": 1,
   "explanation": "< shortens the first note and lengthens the second while preserving the pair's combined duration."
  }
 ],
 [
  {
   "q": "Which symbol starts a repeated section?",
   "options": [
    "|:",
    ":|",
    "|1",
    "|]"
   ],
   "answer": 0,
   "explanation": "|: marks the beginning of a repeated section."
  },
  {
   "q": "Which symbol ends a repeated section?",
   "options": [
    "|:",
    ":|",
    "|2",
    "||"
   ],
   "answer": 1,
   "explanation": ":| closes the repeated section and sends playback back to its start."
  },
  {
   "q": "Why are repeats useful in ABC source?",
   "options": [
    "They avoid duplicating the same music",
    "They automatically transpose the tune",
    "They replace the meter field",
    "They remove bar lines"
   ],
   "answer": 0,
   "explanation": "Repeat syntax encodes the musical form without copying the repeated measures."
  },
  {
   "q": "What should playback normally do with a simple |: ... :| section?",
   "options": [
    "Skip it",
    "Play it twice",
    "Play only its final measure",
    "Mute it"
   ],
   "answer": 1,
   "explanation": "Playback follows the repeat marks, so the repeated section is heard again."
  }
 ],
 [
  {
   "q": "Which symbol begins a first ending?",
   "options": [
    "|1",
    "|2",
    "|:",
    ":|"
   ],
   "answer": 0,
   "explanation": "|1 begins the first ending."
  },
  {
   "q": "Which symbol begins a second ending?",
   "options": [
    "|1",
    "|2",
    "|]",
    "::"
   ],
   "answer": 1,
   "explanation": "|2 begins the second ending."
  },
  {
   "q": "On the second pass through a repeated section with alternate endings, what normally happens?",
   "options": [
    "Ending one is taken again",
    "Ending one is skipped and ending two is taken",
    "Both endings are skipped",
    "The entire tune stops before the endings"
   ],
   "answer": 1,
   "explanation": "After returning through the repeat, the performer or player skips the first ending and takes the second."
  },
  {
   "q": "Can an ABC first or second ending span more than one measure?",
   "options": [
    "No, never",
    "Yes",
    "Only in 6/8",
    "Only when there are lyrics"
   ],
   "answer": 1,
   "explanation": "Alternate endings can span multiple measures."
  }
 ],
 [
  {
   "q": "How is a chord symbol such as G normally attached in ABC?",
   "options": [
    "{G} before a note",
    "\"G\" before the note where the harmony changes",
    "^G after a bar line",
    "P:G in the header"
   ],
   "answer": 1,
   "explanation": "Chord names are placed in double quotes immediately before the note where the harmony changes."
  },
  {
   "q": "Where do chord symbols normally appear in rendered notation?",
   "options": [
    "Below the lyrics",
    "Above the staff near their change point",
    "Inside the key signature",
    "Only in the page title"
   ],
   "answer": 1,
   "explanation": "Chord names inside double quotes are rendered above the staff at the point where the harmony changes."
  },
  {
   "q": "Which of these is a seventh-chord symbol in the lesson example?",
   "options": [
    "\"D7\"",
    "{D7}",
    "!D7!",
    "P:D7"
   ],
   "answer": 0,
   "explanation": "\"D7\" is a D7 chord symbol written inside double quotes."
  },
  {
   "q": "Which ABC syntax correctly places a G chord symbol before a note G2?",
   "options": [
    "{G}G2",
    "\"G\"G2",
    "!G!G2",
    "^GG2"
   ],
   "answer": 1,
   "explanation": "A chord name is enclosed in double quotes immediately before the note, so \"G\"G2 places a G chord symbol at G2."
  }
 ],
 [
  {
   "q": "How are grace notes written in ABC?",
   "options": [
    "Inside braces { }",
    "Inside double quotes",
    "After a Q: field",
    "Between repeat signs"
   ],
   "answer": 0,
   "explanation": "Grace notes are enclosed in braces, as in {A}G."
  },
  {
   "q": "Which syntax writes a named accent decoration?",
   "options": [
    "{accent}",
    "!accent!",
    "\"accent\"",
    "^accent"
   ],
   "answer": 1,
   "explanation": "Named decorations can be written between exclamation marks, such as !accent!."
  },
  {
   "q": "What is ~ commonly used for in ABC?",
   "options": [
    "A tune title",
    "An ornament marker",
    "A final bar line",
    "A bass clef"
   ],
   "answer": 1,
   "explanation": "The tilde is a commonly used ornament marker."
  },
  {
   "q": "Can decoration rendering or playback vary between ABC implementations?",
   "options": [
    "No, every decoration is identical everywhere",
    "Yes",
    "Only for rests",
    "Only for chord symbols"
   ],
   "answer": 1,
   "explanation": "Exact decoration rendering and playback can depend on the supported ABC features and the software implementation."
  }
 ],
 [
  {
   "q": "What does a single % at the beginning of an ABC line indicate?",
   "options": [
    "A comment",
    "A centered text line",
    "A part label",
    "A lyric line"
   ],
   "answer": 0,
   "explanation": "A single percent sign starts a comment. Comments remain in the ABC source but are not rendered as part of the notation."
  },
  {
   "q": "What is the difference between %%text and %%center in this lesson?",
   "options": [
    "%%text adds left-justified standalone text; %%center adds centered standalone text",
    "%%text adds lyrics; %%center adds a part label",
    "%%text places an annotation above a note; %%center places it below",
    "%%text starts a comment; %%center ends a comment"
   ],
   "answer": 0,
   "explanation": "%%text adds a standalone left-justified line of text, while %%center adds a standalone centered line of text."
  },
  {
   "q": "What does \"^Above\"C do?",
   "options": [
    "Makes C sharp",
    "Places the word Above above the staff at C",
    "Moves C up an octave",
    "Creates a chord named ^Above"
   ],
   "answer": 1,
   "explanation": "The ^ prefix at the start of text inside double quotes positions the annotation above the staff; the marker itself is not displayed."
  },
  {
   "q": "What does \"_Below\"F do?",
   "options": [
    "Makes F flat",
    "Places the word Below below the staff at F",
    "Lowers F by an octave",
    "Creates a rest"
   ],
   "answer": 1,
   "explanation": "The _ prefix at the start of text inside double quotes positions the annotation below the staff; the marker itself is not displayed."
  },
  {
   "q": "What does a w: line do?",
   "options": [
    "Attaches lyrics to the preceding music line",
    "Changes the key",
    "Defines a voice",
    "Starts a repeat"
   ],
   "answer": 0,
   "explanation": "A w: line supplies lyrics aligned with the preceding line of music."
  },
  {
   "q": "What does P: commonly identify in this lesson?",
   "options": [
    "A pitch accidental",
    "A part or section",
    "A playback speed",
    "A grace note"
   ],
   "answer": 1,
   "explanation": "P: can identify sections or parts such as P:A and P:B."
  }
 ],
 [
  {
   "q": "What does a V: line in the header do?",
   "options": [
    "Defines a voice and can give it attributes",
    "Starts a repeat",
    "Sets the tune title",
    "Creates a chord"
   ],
   "answer": 0,
   "explanation": "A header V: line defines a voice and can specify attributes such as its name and clef."
  },
  {
   "q": "What does V:1 in the music body do?",
   "options": [
    "Defines the meter",
    "Selects voice 1 for the following notes",
    "Creates a first ending",
    "Sets MIDI volume to 1"
   ],
   "answer": 1,
   "explanation": "A body V: field selects which defined voice receives the following notes."
  },
  {
   "q": "What is the purpose of %%score 1 2 in this lesson?",
   "options": [
    "It creates voices 1 and 2",
    "It arranges already-defined voices in the displayed score",
    "It repeats both voices twice",
    "It changes both voices to bass clef"
   ],
   "answer": 1,
   "explanation": "%%score controls how existing voices are arranged; it does not create them."
  },
  {
   "q": "What does the lesson's playback do with the two voices?",
   "options": [
    "Plays only voice 1",
    "Plays only voice 2",
    "Combines both voices",
    "Alternates voices one measure at a time"
   ],
   "answer": 2,
   "explanation": "The two defined voices are rendered and played together."
  }
 ]
];
lessonQuizzes.forEach(function(quiz,i){ if(lessons[i]) lessons[i].quiz=quiz; });

function loadState(){
  try{
    var raw=localStorage.getItem(STORAGE_KEY);
    if(raw){
      var saved=JSON.parse(raw);
      if(saved && typeof saved === "object"){
        state.currentLesson=Math.max(0,Math.min(lessons.length-1,Number(saved.currentLesson)||0));
        state.completed=saved.completed && typeof saved.completed==="object" ? saved.completed : {};
      }
      return;
    }

    // Migrate progress from the original 15-lesson version. The new
    // Introduction occupies index 0, so every original lesson moves up one index.
    var legacyRaw=localStorage.getItem(LEGACY_STORAGE_KEY);
    if(legacyRaw){
      var legacy=JSON.parse(legacyRaw);
      if(legacy && typeof legacy === "object"){
        state.currentLesson=Math.max(1,Math.min(lessons.length-1,(Number(legacy.currentLesson)||0)+1));
        state.completed={};
        var oldCompleted=legacy.completed && typeof legacy.completed==="object" ? legacy.completed : {};
        Object.keys(oldCompleted).forEach(function(k){
          if(oldCompleted[k]) state.completed[String((Number(k)||0)+1)]=true;
        });
        saveState();
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

function welcomeSeen(){
  try{return localStorage.getItem(WELCOME_KEY)==="1";}catch(e){return false;}
}
function markWelcomeSeen(){
  try{localStorage.setItem(WELCOME_KEY,"1");}catch(e){}
}
function showWelcomeIfNeeded(){
  if(welcomeSeen() || document.getElementById("welcomeOverlay")) return;

  var overlay=document.createElement("div");
  overlay.id="welcomeOverlay";
  overlay.className="welcomeOverlay";
  overlay.setAttribute("role","presentation");

  var dialog=document.createElement("div");
  dialog.className="welcomeDialog";
  dialog.setAttribute("role","dialog");
  dialog.setAttribute("aria-modal","true");
  dialog.setAttribute("aria-labelledby","welcomeTitle");
  dialog.setAttribute("aria-describedby","welcomeText");
  dialog.innerHTML=
    '<h2 id="welcomeTitle">Welcome to the ABC Notation Tutor</h2>'+
    '<div id="welcomeText">'+
      '<p>The tutor begins with a short introduction followed by 15 progressive lessons. Each numbered lesson includes an ABC example, explanatory notes, rendered notation, playback, and a short quiz.</p>'+
      '<p><strong>In each numbered lesson, click the “Start Lesson” button for a guided tour of the material.</strong></p>'+
      '<p>You can also edit the ABC example at any time to see and hear how your changes affect the music.</p>'+
      '<p>When you are ready to explore further, use <strong>Open in ABC Transcription Tools</strong> above the notation to open the current ABC directly in the full editor for more advanced editing, playback, practice, sharing, and export features.</p>'+
      '<p>Your lesson-completion progress is saved in this browser.</p>'+
    '</div>'+
    '<div class="welcomeActions"><button id="welcomeStartBtn" type="button">Start Learning</button></div>';

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  var button=document.getElementById("welcomeStartBtn");
  button.addEventListener("click",function(){
    markWelcomeSeen();
    overlay.remove();
  },{once:true});
  setTimeout(function(){button.focus();},0);
}


var quizOverlay=null;
var quizKeyHandler=null;
var quizReturnFocus=null;

function closeQuiz(){
  if(quizKeyHandler){document.removeEventListener("keydown",quizKeyHandler);quizKeyHandler=null;}
  if(quizOverlay){quizOverlay.remove();quizOverlay=null;}
  if(quizReturnFocus && document.contains(quizReturnFocus)){
    try{quizReturnFocus.focus();}catch(e){}
  }
  quizReturnFocus=null;
}

function startQuiz(){
  var lesson=current();
  var quiz=lesson.quiz||[];
  if(!quiz.length)return;
  stopAudio();
  closeQuiz();
  quizReturnFocus=document.activeElement;

  var index=0,score=0,answered=false;
  quizOverlay=document.createElement("div");
  quizOverlay.className="quizOverlay";
  quizOverlay.setAttribute("role","presentation");
  var dialog=document.createElement("div");
  dialog.className="quizDialog";
  dialog.setAttribute("role","dialog");
  dialog.setAttribute("aria-modal","true");
  dialog.setAttribute("aria-labelledby","quizTitle");
  quizOverlay.appendChild(dialog);
  document.body.appendChild(quizOverlay);

  function renderQuestion(){
    answered=false;
    var item=quiz[index];
    dialog.innerHTML=
      '<div class="quizHeader"><div><div class="quizEyebrow">Lesson '+state.currentLesson+' Quiz</div><h2 id="quizTitle">'+escapeHtml(lesson.title)+'</h2></div>'+ 
      '<button type="button" class="quizClose" aria-label="Close quiz">×</button></div>'+ 
      '<div class="quizProgress">Question '+(index+1)+' of '+quiz.length+'</div>'+ 
      '<div class="quizQuestion">'+escapeHtml(item.q)+'</div>'+ 
      '<fieldset class="quizOptions"><legend class="srOnly">Choose one answer</legend>'+item.options.map(function(option,optIndex){
        return '<label class="quizOption"><input type="radio" name="quizAnswer" value="'+optIndex+'"><span>'+escapeHtml(option)+'</span></label>';
      }).join("")+'</fieldset>'+ 
      '<div id="quizFeedback" class="quizFeedback" aria-live="polite"></div>'+ 
      '<div class="quizActions"><button type="button" class="secondary" data-quiz="close">Close</button><button type="button" data-quiz="check" disabled>Check Answer</button></div>';

    var check=dialog.querySelector('[data-quiz="check"]');
    dialog.querySelectorAll('input[name="quizAnswer"]').forEach(function(input){
      input.addEventListener("change",function(){check.disabled=false;});
    });
    dialog.querySelector('.quizClose').addEventListener("click",closeQuiz);
    dialog.querySelector('[data-quiz="close"]').addEventListener("click",closeQuiz);
    check.addEventListener("click",function(){
      if(answered)return;
      var selected=dialog.querySelector('input[name="quizAnswer"]:checked');
      if(!selected)return;
      answered=true;
      var selectedIndex=Number(selected.value);
      var correct=selectedIndex===item.answer;
      if(correct)score++;
      dialog.querySelectorAll('.quizOption').forEach(function(label,optIndex){
        var input=label.querySelector('input');
        input.disabled=true;
        if(optIndex===item.answer)label.classList.add('correct');
        if(optIndex===selectedIndex && !correct)label.classList.add('incorrect');
      });
      var feedback=dialog.querySelector('#quizFeedback');
      feedback.className='quizFeedback '+(correct?'correct':'incorrect');
      feedback.innerHTML='<strong>'+(correct?'Correct.':'Not quite.')+'</strong> '+escapeHtml(item.explanation);
      check.textContent=index===quiz.length-1?'Finish Quiz':'Next Question';
      check.disabled=false;
      check.onclick=function(){
        if(index===quiz.length-1)renderResult();
        else{index++;renderQuestion();}
      };
      check.focus();
    });
    var first=dialog.querySelector('input[name="quizAnswer"]');
    if(first)setTimeout(function(){first.focus();},0);
  }

  function renderResult(){
    var percent=Math.round((score/quiz.length)*100);
    dialog.innerHTML=
      '<div class="quizHeader"><div><div class="quizEyebrow">Lesson '+state.currentLesson+' Quiz</div><h2 id="quizTitle">Quiz Complete</h2></div>'+ 
      '<button type="button" class="quizClose" aria-label="Close quiz">×</button></div>'+ 
      '<div class="quizResult"><div class="quizScore">'+score+' of '+quiz.length+'</div><p>You answered '+percent+'% correctly.</p><p class="muted">You can retry the quiz as often as you like. Quiz scores are not saved.</p></div>'+ 
      '<div class="quizActions"><button type="button" class="secondary" data-quiz="close">Close</button><button type="button" data-quiz="retry">Retry Quiz</button></div>';
    dialog.querySelector('.quizClose').addEventListener("click",closeQuiz);
    dialog.querySelector('[data-quiz="close"]').addEventListener("click",closeQuiz);
    dialog.querySelector('[data-quiz="retry"]').addEventListener("click",function(){index=0;score=0;renderQuestion();});
    setTimeout(function(){dialog.querySelector('[data-quiz="retry"]').focus();},0);
  }

  quizKeyHandler=function(e){if(e.key==="Escape")closeQuiz();};
  document.addEventListener("keydown",quizKeyHandler);
  renderQuestion();
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
    b.innerHTML='<span class="num'+(i===0?' introNum':'')+'">'+(i===0?'':i)+'</span><span>'+escapeHtml(lesson.title)+'</span><span class="done">'+(done?'✓':'')+"</span>";
    b.title=(done?"Completed: ":"Open: ")+lesson.title;
    b.addEventListener("click",function(){ selectLesson(i); });
    list.appendChild(b);
  });
  var count=Object.keys(state.completed).filter(function(k){return state.completed[k];}).length;
  document.getElementById("progressText").textContent=count+" of 15 lessons completed";
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
  var isIntroduction=state.currentLesson===0;
  document.getElementById("lessonNumber").textContent=isIntroduction?"Introduction":"Lesson "+state.currentLesson+" of 15";
  document.getElementById("lessonTitle").textContent=l.title;
  document.getElementById("lessonSummary").textContent=l.summary;
  document.getElementById("lessonGoals").innerHTML=l.goals.map(function(g){return '<span class="goalChip">'+escapeHtml(g)+'</span>';}).join("");
  document.getElementById("lessonNotes").innerHTML=l.notes;
  document.getElementById("tourBtn").hidden=isIntroduction;
  document.getElementById("quizBtn").hidden=isIntroduction;
  document.getElementById("completeBtn").hidden=isIntroduction;
  document.querySelector(".workGrid").hidden=isIntroduction;
  document.getElementById("prevLessonBtn").disabled=isIntroduction;
  document.getElementById("nextLessonBtn").disabled=state.currentLesson===lessons.length-1;
  if(!isIntroduction){
    document.getElementById("abcEditor").value=sanitizeEditorABC(l.abc);
    document.getElementById("completeBtn").textContent=state.completed[key]?"Mark Uncompleted":"Mark Completed";
    document.getElementById("completeBtn").classList.toggle("secondary",!!state.completed[key]);
  }else{
    stopAudio();
    document.getElementById("abcEditor").value="";
    document.getElementById("paper").innerHTML="";
    document.getElementById("audio").innerHTML="";
    setStatus("",false);
  }
  renderLessonList();
  if(!isIntroduction) renderABC();
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

function bytesToBase64URL(bytes){
  var binary="";
  for(var i=0;i<bytes.length;i++) binary+=String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");
}

function compressABCDeflate(abcText){
  if(typeof pako==="undefined") throw new Error("pako.min.js is not loaded.");
  if(typeof TextEncoder==="undefined") throw new Error("TextEncoder is not available in this browser.");
  var utf8Bytes=new TextEncoder().encode(String(abcText==null?"":abcText));
  var deflatedBytes=pako.deflate(utf8Bytes,{level:6});
  return bytesToBase64URL(deflatedBytes);
}

function generateABCTranscriptionToolsShareLink(abcText){
  var params=new URLSearchParams();
  params.set("def",compressABCDeflate(abcText));
  params.set("format","noten");
  params.set("ssp","10");
  params.set("name","ABC Notation Tutor - "+current().title);
  params.set("editor","1");
  var url="https://michaeleskin.com/abctools/abctools.html?"+params.toString();
  return url.length>8100?null:url;
}

function openInABCTranscriptionTools(){
  try{
    var abc=document.getElementById("abcEditor").value;
    var url=generateABCTranscriptionToolsShareLink(abc);
    if(!url){
      setStatus("The current ABC is too large to open using an ABC Transcription Tools share link.",true);
      return;
    }
    window.open(url,"_blank","noopener");
    setStatus("Current ABC opened in the ABC Transcription Tools editor.",false);
  }catch(err){
    setStatus("Unable to open ABC Transcription Tools: "+(err&&err.message?err.message:String(err)),true);
  }
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
  document.getElementById("quizBtn").addEventListener("click",startQuiz);
  document.getElementById("openInAbcToolsBtn").addEventListener("click",openInABCTranscriptionTools);
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
  document.addEventListener("DOMContentLoaded",function(){initEvents();showLesson();showWelcomeIfNeeded();},{once:true});
}else{initEvents();showLesson();showWelcomeIfNeeded();}
})();