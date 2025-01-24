//
// harmonica_tab.js
//
// ABC Muscial Notation Converter for 10-Hole Diatonic Harmonica
//
// Annotates an ABC format tune with tablature
//
// Michael Eskin
// https://michaeleskin.com
//
// Mapping algorithm derived from of the Perl-based abc2harp utility:
//
// https://welltemperedstudio.wordpress.com/code/abc2harp/
//
// Released under CC0 - No Rights Reserved
// https://creativecommons.org/share-your-work/public-domain/cc0/
//

var verbose = false;

// Globals
var abcOutput = "";
var keySignature = null;

// Suggested filename for save
var gSaveFilename = "";

function generate_harmonica_tab(tuneABC,harpKey){

    // Notes to numbers

    function getNote(n) {
        // Remove any slashes and following characters
        n = n.replace(/\/.*/, '');
        // Replace sharps and flats
        n = n.replace(/^([A-G])#/, '^$1');
        n = n.replace(/^([A-G])b/, '_$1');

        // C,=1, C=13, c=25, c'=37, etc
        n = n.replace(/C/g, '+13');
        n = n.replace(/D/g, '+15');
        n = n.replace(/E/g, '+17');
        n = n.replace(/F/g, '+18');
        n = n.replace(/G/g, '+20');
        n = n.replace(/A/g, '+22');
        n = n.replace(/B/g, '+24');
        n = n.replace(/c/g, '+25');
        n = n.replace(/d/g, '+27');
        n = n.replace(/e/g, '+29');
        n = n.replace(/f/g, '+30');
        n = n.replace(/g/g, '+32');
        n = n.replace(/a/g, '+34');
        n = n.replace(/b/g, '+36');

        n = n.replace(/\^/g, '+1'); // sharped notes
        n = n.replace(/_/g, '-1');  // flatted notes
        // n = n.replace(/=/g, '');
        n = n.replace(/,/g, '-12'); // one octave below
        n = n.replace(/'/g, '+12'); // one octave above

        try {
            n = eval(n);
        } catch (error) {
            n = 0;
        }

        return n;
    }

    // Get names of note numbers based on C=1, D=3,...,B=11
    function getNoteName(n) {
        let ret;
        while (n > 12) { n = n - 12; }
        switch (n) {
            case 1:
                ret = "C";
                break;
            case 2:
                ret = "C#/Db";
                break;
            case 3:
                ret = "D";
                break;
            case 4:
                ret = "D#/Eb";
                break;
            case 5:
                ret = "E";
                break;
            case 6:
                ret = "F";
                break;
            case 7:
                ret = "F#/Gb";
                break;
            case 8:
                ret = "G";
                break;
            case 9:
                ret = "G#/Ab";
                break;
            case 10:
                ret = "A";
                break;
            case 11:
                ret = "A#/Bb";
                break;
            case 12:
                ret = "B";
                break;
            default:
                ret = "";
        }
        return ret;
    }

    // Get relative major of the minor key
    function min2maj(key) {
        let k;
        // Is this a minor key?
        if (/m/.test(key)) {
            key = key.replace(/m(inor)?/, '');
            k = getNote(key);
            k = k + 3;  // convert to relative major
            if (k > 24) { k = k - 12; }
        } else {
            k = getNote(key);
        }
        return k;
    }

    // Fixes the abc notes by applying the flats and sharps accordingly
    function getTrueNote(note, key) {
        let n;
        let k;

        // First, check if it's a "natural" note. If so, return it
        if (/=/.test(note)) {
            note = note.replace(/=/g, '');
            n = getNote(note);
            return n;
        }

        // Okay, let's look at the key sig
        // Sharps
        n = getNote(note);
        if (/__/.test(note)) { return n; }  // double flats
        if (/\^\^/.test(note)) { return n; }    // double sharps

        k = min2maj(key);
        if (k === 13) { return n; }
        if ([6, 18, 30].includes(n)) { n++; } // F -> F#
        if (k === 20) { return n; }
        if ([1, 13, 25, 37].includes(n)) { n++; } // C -> C#
        if (k === 15) { return n; }
        if ([8, 20, 32].includes(n)) { n++; } // G -> G#
        if (k === 22) { return n; }
        if ([3, 15, 27].includes(n)) { n++; } // D -> D#
        if (k === 17) { return n; }
        if ([10, 22, 34].includes(n)) { n++; } // A -> A#
        if (k === 24) { return n; }
        if ([5, 17, 29].includes(n)) { n++; } // E -> F
        if (k === 19) { return n; }
        if ([12, 24, 36].includes(n)) { n++; } // B -> C
        if (k === 14) { return n; }

        // Flats
        n = getNote(note);
        k = min2maj(key);
        if ([12, 24, 36].includes(n)) { n--; } // B -> Bb
        if (k === 18) { return n; }
        if ([5, 17, 29].includes(n)) { n--; } // E -> Eb
        if (k === 23) { return n; }
        if ([10, 22, 34].includes(n)) { n--; } // A -> Ab
        if (k === 16) { return n; }
        if ([3, 15, 27].includes(n)) { n--; } // D -> Db
        if (k === 21) { return n; }
        if ([8, 20, 32].includes(n)) { n--; } // G -> Gb
        if (k === 14) { return n; }
        if ([1, 13, 25, 37].includes(n)) { n--; } // C -> Cb
        if (k === 19) { return n; }
        if ([6, 18, 30].includes(n)) { n--; } // F -> E
        if (k === 24) { return n; }

        // oops, shouldn't reach this place
        console.log("There was an error recognising the notes. The tab will probably be wrong.");
        return 0;
    }

    let transposeHarp = 0;

    function setHarpKey(harpKey) {
        transposeHarp = getNote(harpKey) - 12;
        if (transposeHarp >= 8 && transposeHarp <= 12) {
            transposeHarp = 13 - transposeHarp;
        } else {
            transposeHarp = 1 - transposeHarp;
        }
    }

    // harptab layout (C harp)
    var tab = [];

    tab[0] = "x"; // unknown

    tab[1] = "1"; // C
    tab[2] = "1'↑"; // C# / Db
    tab[3] = "1↑"; // D
    tab[4] = "1o"; // E# / Eb
    tab[5] = "2"; // E
    tab[6] = "2''↑"; // F
    tab[7] = "2'↑"; // F# / Gb
    tab[8] = "3"; // G
    tab[9] = "3'''↑"; // G# / Ab
    tab[10] = "3''↑"; // A
    tab[11] = "3'↑"; // A# / Bb
    tab[12] = "3↑"; // B

    tab[13] = "4"; // C
    tab[14] = "4'↑"; // C# / Db
    tab[15] = "4↑"; // D
    tab[16] = "4o"; // E# / Eb
    tab[17] = "5"; // E
    tab[18] = "5↑"; // F
    tab[19] = "5o"; // F# / Gb
    tab[20] = "6"; // G
    tab[21] = "6'↑"; // G# / Ab
    tab[22] = "6↑"; // A
    tab[23] = "6o"; // A# / Bb
    tab[24] = "7↑"; // B

    tab[25] = "7"; // C
    tab[26] = "7o↑"; // C# / Db
    tab[27] = "8↑"; // D
    tab[28] = "8'"; // E# / Eb
    tab[29] = "8"; // E
    tab[30] = "9↑"; // F
    tab[31] = "9'"; // F# / Gb
    tab[32] = "9"; // G
    tab[33] = "9o↑"; // G# / Ab
    tab[34] = "10↑"; // A
    tab[35] = "10''"; // A# / Bb
    tab[36] = "10'"; // B

    tab[37] = "10"; // C
    tab[38] = "10o↑'"; // C#

    // Set up defaults
    let keySig = "C";
    let octaveAdjust = 0;
    let verbose = false;
    let lineCount = 0;
    let abcHeaderDone = false;

    // Set the harp key
    setHarpKey(harpKey);

    var theOutput = "";

    var theLines = tuneABC.split("\n");
 
    for (const line of theLines) {

        lineCount++;

        if (/^\w:/.test(line) || /^%/.test(line) || line === "\n") {

            theOutput+=(line + '\n');

            // print the title
            if (match = line.match(/^T:\s*(.*)$/)) {
                if (verbose) { console.log(`Title: ${match[1]}`); }
            }

            // this is an ABC field, comment or command, so just print it
            if (match = line.match(/^K:\s*(.*)$/)) {

                abcHeaderDone = true;

                octaveAdjust = 0;
                keySig = match[1];  // note for future: need to adjust for treble+-8

                if (/treble\+8/.test(keySig)) { octaveAdjust = 12; }
                if (/treble\-8/.test(keySig)) { octaveAdjust = -12; }
                
                keySig = keySig.replace(/\s?(treble[+-]?\d?|bass\d?|alto\d?|none|perc)/, '');
                keySig = keySig.replace(/\s?major/, '');
                keySig = keySig.replace(/\s?maj/, '');
                                
                keySig = keySig.replace(/^([A-G])#/, '^$1');
                keySig = keySig.replace(/^([A-G])b/, '_$1');

                switch (keySig.toLowerCase()){
                    case "ddor":
                    case "ddorian":
                    case "amin":
                    case "aminor":
                        keySig = "C";
                        break;
                    case "edor":
                    case "edorian":
                    case "bmin":
                    case "bminor":
                    case "amix":
                    case "amixolydian":
                        keySig = "D";
                        break;
                    case "ador":
                    case "adorian":
                    case "eminor":
                    case "dmix":
                    case "dmixolydian":
                        keySig = "G";
                        break;
                    case "bdor":
                    case "bdorian":
                        keySig = "A";
                        break;
                }

                if (verbose) { console.log(`Key signature: ${keySig}`); }

                theOutput+=(`%%text ${harpKey} Harp\n`);
                theOutput+=("%%text ↑=Draw, ' = Bend, o = Overbend\n");
                theOutput+=("%%text\n");


             }
        } else {

            if (line == ""){
                break;
            }

            // this should be a musical line
            theOutput+=(line + '\n');

            // make a copy - this will be the harp tab line
            let harpLine = line;

            harpLine = harpLine.replace(/\[\w:.*?\]/g, '');

            // strip to individual notes
            harpLine = harpLine.replace(/%.*?$/, '');   // remove trailing comments
            harpLine = harpLine.replace(/\\/g, '');     // remove continuation lines

            harpLine = harpLine.replace(/"(.*?)"/g, '');    // remove all strings
            harpLine = harpLine.replace(/[<>\.~]/g, '');    // remove - < > . ~
            harpLine = harpLine.replace(/!.*?!/g, '');      // remove !symbols!
            harpLine = harpLine.replace(/{.*?}/g, '');      // remove graces {}
            harpLine = harpLine.replace(/\(([^()]*)\)/g, '$1');     // "de"-slur
            harpLine = harpLine.replace(/\[([\^_=]*?[A-Ga-gzx][\,']*).*?\]/g, '$1');    // "de"-chord
            harpLine = harpLine.replace(/\(\d/g, '');       // "de"-tuplet
            harpLine = harpLine.replace(/[\|\]:]/g, '');    // remove barlines
            harpLine = harpLine.replace(/\[\d/g, '');       // remove numbered repeats

            harpLine = harpLine.replace(/([\^_=]*?[A-Ga-gzx][\,']*)\d?\/?\*?/g, '$1 ');

            harpLine = harpLine.replace(/-\s*[\^_=]*?[A-Ga-gzx][\,']*/g, '*');  // ties will be skipped
            harpLine = harpLine.replace(/-/g, '');  // clean up extra ties

            harpLine = harpLine.replace(/[zx]\d?/g, '');        // remove rests

            // convert to tab
            harpLine = harpLine.replace(/\s+/g, ' ');

            let notes = harpLine.trim().split(' ');

            var outNotes = [];
            
            for (let j = 0; j < notes.length; j++) {
                
                let note = notes[j];

                if (note !== "*") {

                    let abcNote = note;

                    let noteIndex = getTrueNote(abcNote, keySig) + octaveAdjust + transposeHarp;

                    if (verbose){console.log("abcNote: "+abcNote+" noteIndex: "+noteIndex);}
                    
                    if (noteIndex < 0) { noteIndex = 0; }

                    if (noteIndex > 38) { noteIndex = 0; }

                    note = tab[noteIndex];

                    if (note === "x") { console.log(`Line ${lineCount}: Warning: ${abcNote} is not playable on the ${harpKey} harp`); }

                    outNotes.push(note);
                }
            }

            //debugger;

            harpLine = "w: " + outNotes.join(' ').trim();

            harpLine = harpLine.replace(/\s+/g, ' ');       // remove extra spaces

            harpLine = harpLine.trim();

            if (harpLine !== "w:") { theOutput+=(`${harpLine}\n`); }
        }
    }

    return theOutput;
}



//
// Count the tunes in the text area
//
function countTunes(theABC) {

    // Count the tunes in the ABC
    var theNotes = theABC;

    var theTunes = theNotes.split(/^X:.*$/gm);

    var nTunes = theTunes.length - 1;

    return nTunes;

}

//
// Inject font directive number directive 
//
function InjectOneDirective(theTune, theDirective) {

    var theABC = escape(theTune);

    var theLines = theABC.split("%0A");

    var theOutput = "";

    var thisLine = "";

    for (i = 0; i < theLines.length; ++i) {

        thisLine = unescape(theLines[i]);

        var theChars = thisLine.split("");

        // It's a normal ABC : directive, copy it as is
        if (((theChars[0] != "|") && (theChars[0] != "[")) && (theChars[1] == ":")) {

            theOutput += thisLine + "\n";

            // Inject the font directive to save people time
            if (theChars[0] == "X") {

                theOutput += theDirective + "\n";
            }

        } else {
            theOutput += thisLine;

            if (i != (theLines.length - 1)) {
                theOutput += "\n";
            }

        }
    }

    return theOutput;

}

//
// Return the tune ABC at a specific index
//
//
function getTuneByIndex(theABC, tuneNumber) {

    var theNotes = theABC;

    // Now find all the X: items
    var theTunes = theNotes.split(/^X:/gm);

    return ("X:" + theTunes[tuneNumber + 1]);

}

//
// Main processor
//
function generateTablature() {

    var theABC = document.getElementById('input').value;

    var nTunes = countTunes(theABC);

    var fontFamily = document.getElementById('font_family').value
    var titleFontSize = document.getElementById('title_font_size').value;
    var subtitleFontSize = document.getElementById('subtitle_font_size').value;
    var infoFontSize = document.getElementById('info_font_size').value;
    var tabFontSize = document.getElementById('tab_font_size').value;
    var musicSpace = document.getElementById('music_space').value
    var staffSep = document.getElementById('staff_sep').value;
    var harpKey = document.getElementById('harp_key').value;

    var result = "";

    for (var i = 0; i < nTunes; ++i) {

        var thisTune = getTuneByIndex(theABC, i);

        thisTune = generate_harmonica_tab(thisTune,harpKey)

        thisTune = InjectOneDirective(thisTune, "%%musicspace " + musicSpace);
        thisTune = InjectOneDirective(thisTune, "%%staffsep " + staffSep);
        thisTune = InjectOneDirective(thisTune, "%%vocalfont " + fontFamily + " " + tabFontSize);
        thisTune = InjectOneDirective(thisTune, "%%infofont " + fontFamily + " " + infoFontSize);
        thisTune = InjectOneDirective(thisTune, "%%subtitlefont " + fontFamily + " " + subtitleFontSize);
        thisTune = InjectOneDirective(thisTune, "%%titlefont " + fontFamily + " " + titleFontSize);

        result += thisTune;

        result += "\n";
    }

    document.getElementById("output").value = result;

    // Give some feedback
    document.getElementById("generateTablature").innerHTML = "Tablature generated!";

    setTimeout(function() {

        document.getElementById("generateTablature").innerHTML = "Generate Tablature";

    }, 1250);

}

//
// Save the Output to a .abc file
//
function saveOutput() {

    var theData = document.getElementById("output").value;

    if (theData.length == 0) {

        DayPilot.Modal.alert("Nothing to save!", {
            theme: "modal_flat",
            top: 50
        });

        return;
    }

    if (gSaveFilename == ""){
        gSaveFilename = "harmonica_tab";
    }

    var thePlaceholder = gSaveFilename;


    var thePrompt = "Please enter a filename for your output ABC file:";

    DayPilot.Modal.prompt(thePrompt, thePlaceholder, {
        theme: "modal_flat",
        top: 194,
        autoFocus: false
    }).then(function(args) {

        var fname = args.result;

        // If the user pressed Cancel, exit
        if (fname == null) {
            return null;
        }

        // Strip out any naughty HTML tag characters
        fname = fname.replace(/[^a-zA-Z0-9_\-. ]+/ig, '');

        if (fname.length == 0) {
            return null;
        }

        // Give it a good extension
        if ((!gIsAndroid) && (!gIsIOS)) {

            if ((!fname.endsWith(".abc")) && (!fname.endsWith(".txt")) && (!fname.endsWith(".ABC")) && (!fname.endsWith(".TXT"))) {

                // Give it a good extension
                fname = fname.replace(/\..+$/, '');
                fname = fname + ".abc";

            }
        } else {
            // iOS and Android have odd rules about text file saving
            // Give it a good extension
            fname = fname.replace(/\..+$/, '');
            fname = fname + ".txt";

        }

        var a = document.createElement("a");

        document.body.appendChild(a);

        a.style = "display: none";

        var blob = new Blob([theData], {
                type: "text/plain"
            }),

            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fname;
        a.click();

        document.body.removeChild(a);

        setTimeout(function() {
            window.URL.revokeObjectURL(url);
        }, 1000);

    });

}


//
// Copy the output text are to the clipboard 
// 
function copyOutputToClipboard() {

    var textToCopy = document.getElementById('output').value;

    if (textToCopy.length == 0) {

        DayPilot.Modal.alert("Nothing to copy!", {
            theme: "modal_flat",
            top: 50
        });

        return;

    }

    copyToClipboard(textToCopy);

    // Give some feedback
    document.getElementById("copybutton").innerHTML = "Output copied to the clipboard!";

    setTimeout(function() {

        document.getElementById("copybutton").innerHTML = "Copy output to the clipboard";

    }, 1250);
}

//
// Copy to Clipboard Polyfill
//
function copyToClipboard(textToCopy) {

    //
    // Put this in a try/catch just to be safe
    //
    try {

        // navigator clipboard api needs a secure context (https)
        if (navigator.clipboard && window.isSecureContext) {

            // navigator clipboard api method'
            return navigator.clipboard.writeText(textToCopy);

        } else {

            // text area method

            let textArea = document.createElement("textarea");

            textArea.value = textToCopy;

            // make the textarea out of viewport
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";

            document.body.appendChild(textArea);

            textArea.focus();
            textArea.select();

            return new Promise((res, rej) => {
                // here the magic happens
                document.execCommand('copy') ? res() : rej();
                textArea.remove();
            });
        }

    } catch (error) {

        console.log("CopyToClipboard error: " + error);

    }
}

//
// Get the current base URL
//
function getUrlWithoutParams() {

    return "https://michaeleskin.com/abctools/abctools.html";

}

//
// Generate and open an ABC Transcription Tools Share URL for the output
//
function testOutput() {

    // Encode all the tunes or just what's passed in?
    var abcText = document.getElementById('output').value;

    if (abcText.length == 0) {

        DayPilot.Modal.alert("Nothing to test!", {
            theme: "modal_flat",
            top: 50
        });

        return;

    }

    var shareName = "Diatonic_Harmonica_Tablature_Test";

    var abcInLZW = LZString.compressToEncodedURIComponent(abcText);

    var ssp = document.getElementById('staff_sep').value;

    var url = "https://michaeleskin.com/abctools/abctools.html?lzw=" + abcInLZW + "&format=noten&ssp=45&pdf=one&pn=br&fp=yes&btfs=10&name=" + shareName +"&editor=1";

    if (url.length > 8100) {

        DayPilot.Modal.alert("Output too long to test!", {
            theme: "modal_flat",
            top: 50
        });

        return;
    }

    // Open the transcription tools with the share link
    var w = window.open(url);

}

//
// Are we on iOS?
//
function isIOS() {
    if (/iPad|iPhone|iPod/.test(navigator.platform)) {
        return true;
    } else {
        return navigator.maxTouchPoints &&
            navigator.maxTouchPoints > 2 &&
            /MacIntel/.test(navigator.platform);
    }
}

//
// Are we on an iPhone?
//
function isIPhone() {
    if (/iPad|iPhone|iPod/.test(navigator.platform)) {
        return true;
    } else {
        return false;
    }
}

//
// Are we on an iPad?
//
function isIPad() {
    return navigator.maxTouchPoints &&
        navigator.maxTouchPoints > 2 &&
        /MacIntel/.test(navigator.platform);
}

//
// Are we on Android?
//
function isAndroid() {
    if (/Android/i.test(navigator.userAgent)) {
        return true;
    } else {
        return false;
    }
}

//
// Are we on Safari?
//
function isSafari(){

    if (/Safari/i.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
        return true;
    }
    else{
        return false;
    }
}

//
// Are we on Chrome?
//
function isChrome(){

    if (/chrome|chromium|crios/i.test(navigator.userAgent)) {
        return true;
    }
    else{
        return false;
    }
}

//
// Globals
//
var gIsIOS = false;
var gIsAndroid = false;
var gIsSafari = false;
var gIsChrome = false;

//
// Initialization 
//
function DoStartup() {

    document.getElementById('font_family').value = "Palatino";
    document.getElementById('title_font_size').value = 22;
    document.getElementById('subtitle_font_size').value = 18;
    document.getElementById('info_font_size').value = 14;
    document.getElementById('tab_font_size').value = 10;
    document.getElementById('staff_sep').value = 80;
    document.getElementById('music_space').value = 10;
    document.getElementById('harp_key').selectedIndex = 5;

    var theValue = "";
    theValue += "X: 1\n";
    theValue += "T: The Kesh\n";
    theValue += "R: Jig\n";
    theValue += "M: 6/8\n";
    theValue += "L: 1/8\n";
    theValue += "Q: 3/8=120\n";
    theValue += "C: Traditional\n";
    theValue += "K: Gmaj\n";
    theValue += '|:GAG GAB|ABA ABd|edd gdd|edB dBA|\n';
    theValue += 'GAG GAB|ABA ABd|edd gdB|AGF G3:|\n';
    theValue += '|:BAB dBd|ege dBA|BAB dBG|ABA AGA|\n';
    theValue += 'BAB dBd|ege dBd|gfg aga|bgf g3:|\n';

    document.getElementById('input').value = theValue;
    document.getElementById('output').value = "";

    // Reset file selectors
    var fileElement = document.getElementById('selectabcfile');

    fileElement.value = "";

    // Are we on iOS?
    gIsIOS = false;
    if (isIOS()) {
        gIsIOS = true;
    }

    // Are we on Android?
    gIsAndroid = false;

    if (isAndroid()) {
        gIsAndroid = true;
    }

    if (gIsIOS) {
        document.getElementById("selectabcfile").removeAttribute("accept");
    }

    // Are we on Safari?
    gIsSafari = false;
    if (isSafari()){
        gIsSafari = true;
    }

    // Are we on Chrome?
    gIsChrome = false;

    if (!gIsSafari){
        if (isChrome()){
            gIsChrome = true;
        }
    }

    //
    // Setup the file import control
    //
    document.getElementById("selectabcfile").onchange = () => {

        let fileElement = document.getElementById("selectabcfile");

        let file = fileElement.files[0];

        gSaveFilename = file.name;

        // Trim any whitespace
        gSaveFilename = gSaveFilename.trim();

        // Strip out any naughty HTML tag characters
        gSaveFilename = gSaveFilename.replace(/[^a-zA-Z0-9_\-. ]+/ig, '');

        // Replace any spaces
        gSaveFilename = gSaveFilename.replace(/\s/g, '_');

        // Strip the extension
        gSaveFilename = gSaveFilename.replace(/\..+$/, '');
       
        // Clean up the notation while the new file is loading
        document.getElementById('input').value = "";

        const reader = new FileReader();

        reader.addEventListener('load', (event) => {

            document.getElementById('input').value = event.target.result;

            // Reset file selectors
            let fileElement = document.getElementById('selectabcfile');

            fileElement.value = "";


        });

        reader.readAsText(file);

    }

}

//
// Wait for the document to be ready, then fire a function
//

function WaitForReady(fn) {

    if (document.readyState !== 'loading') {
        fn();
        return;
    }

    document.addEventListener('DOMContentLoaded', fn);

}

//
// Wait for the document to be ready, then startup
//

WaitForReady(DoStartup);