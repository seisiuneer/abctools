//
// solfege.js
//
// ABC Muscial Notation Converter for Solfege
//
// Annotates an ABC format tune with Solfege tablature
//
// Michael Eskin
// https://michaeleskin.com
//
// ABC parsing algorithm by James van Donsel
//
// Released under CC0 - No Rights Reserved
// https://creativecommons.org/share-your-work/public-domain/cc0/
//

var verbose = false;

// Globals
var abcOutput = "";
var gKeySignature = null;
var gTheKey = null;
var gTheMode = "Major";
var gNonMovableSolfege = false;
var gForceNonMovableSolfege = false;

// Suggested filename for save
var gSaveFilename = "";

function log(s) {
    if (verbose)
        console.log(s);
}

//
// Generate the flute tab
//
function generate_tab(abcInput){

    log("Got input:" + abcInput);

    // Find the key signature in the input
    gKeySignature = findKeySignature(abcInput);

    if (gKeySignature == null) {
        return ("ERROR: Unknown or unsupported key signature");
    }

    //console.log("gTheKey: "+gTheKey+" gTheMode: "+gTheMode);

    // Generate an array of note objects. 
    var notes = getAbcNotes(abcInput);

    // Merge the chosen fingerings with the ABC notation
    abcOutput = mergeTablature(abcInput, notes);

    return abcOutput;
}


// Note constructor
var Note = function(index, unNormalizedValue, normalizedValue, glyph) {
    this.index = index; // Index of this note in the original ABC input string

    // These values an ABC string like "G" or "^A'"
    // Unnormalized means it's the literal note string from the ABC source.
    this.unNormalizedValue = unNormalizedValue;

    // Normalized means it's adjusted by the key signature and extra decorations are removed.
    this.normalizedValue = normalizedValue;

    this.glyph = glyph;
};



// Determines the key signature
// abcInput: ABC input string
// returns: key signature map to use, or null on error.
function findKeySignature(abcInput) {

    gTheMode = "Major";

    var myMap = null;

    var keyMatch = abcInput.match(/[kK]: *([A-G])([b#])? *(.*?)$/m);
    if (keyMatch == null || keyMatch.length < 3) {
        return null;
    }

    var keySignatureBase;
    var keyExtra;

    if (keyMatch[2] == undefined) {
        keySignatureBase = keyMatch[1];
    } else {
        keySignatureBase = keyMatch[1] + keyMatch[2];
    }
    keyExtra = keyMatch[3].toLowerCase();

    gTheKey = keySignatureBase;

    // Use an "s" to represent a sharp key signature
    gTheKey = gTheKey.replace("#","s")

    // Assume moveable solfege
    gNonMoveableSolfege = false;

    log("Got base key of '" + keySignatureBase + "' and extra of '" + keyExtra + "'");

    // Determine musical mode
    if (keyExtra == "" ||
        keyExtra.search("maj") != -1 ||
        keyExtra.search("ion") != -1) {
        log("Mode: Ionian (major)");
        gTheMode = "Major";
        myMap = keySignatureMap(keySignatureBase, 0);
    } else if (keyExtra.search("mix") != -1) {
        log("Mode: Mixolydian");
        myMap = keySignatureMap(keySignatureBase, 1);
    } else if (keyExtra.search("dor") != -1) {
        log("Mode: Dorian");
        gTheMode = "Minor";
        myMap = keySignatureMap(keySignatureBase, 2);
    } else if ((keyExtra.search("m") != -1 && keyExtra.search("mix") == -1) ||
        keyExtra.search("min") != -1 ||
        keyExtra.search("aeo") != -1) {
        log("Mode: Aeolian (minor)");
        gTheMode = "Minor";
        myMap = keySignatureMap(keySignatureBase, 3);
    } else if (keyExtra.search("phr") != -1) {
        log("Mode: Phrygian");
        // Force non-moveable
        gNonMovableSolfege = true;
        myMap = keySignatureMap(keySignatureBase, 4);
    } else if (keyExtra.search("loc") != -1) {
        log("Mode: Locrian");
        // Force non-moveable
        gNonMovableSolfege = true;
        myMap = keySignatureMap(keySignatureBase, 5);
    } else if (keyExtra.search("lyd") != -1) {
        log("Mode: Lydian");
        // Force non-moveable
        gNonMovableSolfege = true;
        myMap = keySignatureMap(keySignatureBase, -1);
    } else if (keyExtra.search("exp") != -1) {
        log("(Accidentals to be explicitly specified)");
        // Force non-moveable
        gNonMovableSolfege = true;
        myMap = keySignatureMap("C", 0);
    } else {
        // Unknown
        log("Failed to determine key signature mode");
        myMap = null;
    }

    if (myMap == null) {
        return myMap;
    }

    //Handle explicit accidentals
    var explicitFlats = keyExtra.match(/_./g);
    var explicitSharps = keyExtra.match(/\^./g);

    for (note in explicitFlats) {
        myMap.flats += explicitFlats[note][1].toUpperCase();
    }

    for (note in explicitSharps) {
        myMap.sharps += explicitSharps[note][1].toUpperCase();
    }

    return myMap;

}

// Calculates a key signature map given a tonic and a mode
function keySignatureMap(tonic, modeFlatness) {
    var circleOfFifths = "FCGDAEB";

    var signature = {
        sharps: "",
        flats: ""
    };

    var baseSharpness = circleOfFifths.indexOf(tonic[0]) - 1;

    if (baseSharpness == -2) {
        log("Bad tonic: " + tonic);
        return null;
    }

    if (tonic.slice(1) == "b") {
        baseSharpness -= 7;
    } else if (tonic.slice(1) == "#") {
        baseSharpness += 7;
    }

    var totalSharpness = baseSharpness - modeFlatness;

    if (totalSharpness > 7) {
        log("Too many sharps: " + totalSharpness);
        return null;
    } else if (totalSharpness < -7) {
        log("Too many flats: " + (totalSharpness * -1));
        return null;
    } else if (totalSharpness > 0) {
        signature.sharps = circleOfFifths.slice(0, totalSharpness);
    } else if (totalSharpness < 0) {
        signature.flats = circleOfFifths.slice(totalSharpness);
    }

    signature.accidentalSharps = "";
    signature.accidentalFlats = "";
    signature.accidentalNaturals = "";

    return signature;
}

//
// Merges the tablature with the original string input.
//
function mergeTablature(input, notes) {

    var result = input;
    
    var insertedTotal = 0;

    var theTab;

    for (var i = 0; i < notes.length; ++i) {

        var index = notes[i].index + insertedTotal;

        var glyph = notes[i].glyph;

        theTab = "\"_" + glyph + "\"";


        var tabLen = theTab.length;

        //log("Merge["+i+"] index="+index+" tabLen="+tabLen+" insertedTotal="+insertedTotal);

        result = result.substr(0, index) + theTab + result.substr(index);

        insertedTotal += tabLen;
    }

    return result;
}

// Replaces parts of the given string with '*'
// input: string to replace
// start: index to start sanitizing
// len: length to sanitize
// Returns a new string
function sanitizeString(input, start, len) {
    var s = "";
    for (var i = 0; i < len; ++i) {
        s += "*";
    }

    return input.substr(0, start) + s + input.substr(start + len);

}

//
// For a given note and key, transform the note
//

var scaleMapSharps = {
    "c":  0,
    "^c": 1,
    "d":  2,
    "^d": 3,
    "e":  4,
    "f":  5,
    "^f": 6,
    "g":  7,
    "^g": 8,
    "a":  9,
    "^a": 10,
    "b":  11
};

var scaleMapFlats = {
    "c":  0,
    "_d": 1,
    "d":  2,
    "_e": 3,
    "e":  4,
    "f":  5,
    "_g": 6,
    "g":  7,
    "_a": 8,
    "a":  9,
    "_b": 10,
    "b":  11
};

var inverseScaleMapSharps = {
    "0": "c",
    "1": "^c",
    "2": "d",
    "3": "^d",
    "4": "e",
    "5": "f",
    "6": "^f",
    "7": "g",
    "8": "^g",
    "9": "a",
    "10": "^a",
    "11": "b"
};

var inverseScaleMapFlats = {
    "0": "c",
    "1": "_d",
    "2": "d",
    "3": "_e",
    "4": "e",
    "5": "f",
    "6": "_g",
    "7": "g",
    "8": "_a",
    "9": "a",
    "10": "_b",
    "11": "b"
};

var modeMap = {
    "C": 0,
    "Cs": 1,
    "Db": 1,
    "D": 2,
    "Ds": 3,
    "Eb": 3,
    "E": 4,
    "F": 5,
    "Fs": 6,
    "Gb": 6,
    "G": 7,
    "Gs": 8,
    "Ab": 8,
    "A": 9,
    "As": 10,
    "Bb": 10,
    "B": 11
};

function transformNote(note,gTheKey,gTheMode){
    
    // Normalize note represention

    // Lower case
    note = note.toLowerCase();

    // No octave marks
    note = note.replaceAll(",","");
    note = note.replaceAll("'","");

    var isSharpKey = true;

    if (gKeySignature.flats != ""){
        isSharpKey = false;
    }

    if (gForceNonMovableSolfege){

        gNonMovableSolfege = true;

    }

    // If non-movable Solfege, normalize to C Major
    if (gNonMovableSolfege){
        gTheKey = "C";
        gTheMode = "Major";
    }

    var theOffset = modeMap[gTheKey];

    //console.log("theOffset: "+theOffset);
    
    //console.log("note in: "+note);

    if (isSharpKey){

        var theNoteIndex = scaleMapSharps[note];

        theNoteIndex -= theOffset;

        if (theNoteIndex < 0){
            theNoteIndex += 12;
        }

        theNoteIndex %= 12;

        note = inverseScaleMapSharps[theNoteIndex];

    }
    else{

        var theNoteIndex = scaleMapFlats[note];

        theNoteIndex -= theOffset;

        if (theNoteIndex < 0){
            theNoteIndex += 12;
        }

        theNoteIndex %= 12;

        note = inverseScaleMapFlats[theNoteIndex];

    }
    
    //console.log("note out: "+note);

    return note;

}

//
// From a note name, gets the Solfege string
//
function getNoteGlyph(note){

    var thisGlyph = "";

    note = transformNote(note,gTheKey,gTheMode);

    var glyph_map = {
        "c":   "Do",
        "^c":  "Di",
        "_d":  "Ra",
        "d":   "Re",
        "^d":  "Ri",
        "_e":  "Me",
        "e":   "Mi",
        "f":   "Fa",
        "^f":  "Fi",
        "_g":  "Se",
        "g":   "Sol",
        "^g":  "Si",
        "_a":  "Le",
        "a":   "La",
        "^a":  "Li",
        "_b":  "Te",
        "b":   "Ti"
    };

    thisGlyph = glyph_map[note];

    if (!thisGlyph){
        return "x ";
    }   

    return thisGlyph;

}

// Returns an array of Notes from the ABC string input
function getAbcNotes(input) {

    // Sanitize the input, removing header and footer, but keeping
    // the same offsets for the notes. We'll just replace header
    // and footer sections with '*'.
 
    var sanitizedInput = input;
    var headerRegex = /^\w:.*$/mg;
    var x;
    while (x = headerRegex.exec(input)) {
        sanitizedInput = sanitizeString(sanitizedInput, x.index, x[0].length);
    }

    // Sanitize chord markings
    var searchRegExp = /"[^"]*"/gm

    while (m = searchRegExp.exec(sanitizedInput)) {


        var start = m.index;
        var end = start + m[0].length;

        //console.log(m[0],start,end);

        for (var index=start;index<end;++index){

            sanitizedInput = sanitizedInput.substring(0, index) + '*' + sanitizedInput.substring(index + 1);

        }


    }

    // Sanitize in-abc chords in brackets
    searchRegExp = /\[[^\]|]*\]/g

    while (m = searchRegExp.exec(sanitizedInput)) {


        var start = m.index;
        var end = start + m[0].length;

        //console.log(m[0],start,end);

        for (var index=start;index<end;++index){

            sanitizedInput = sanitizedInput.substring(0, index) + '*' + sanitizedInput.substring(index + 1);

        }

    }  

    // Sanitize multi-line comments
    searchRegExp = /^%%begintext((.|\n)*)%%endtext/gm

    while (m = searchRegExp.exec(sanitizedInput)) {

        //debugger;

        var start = m.index;
        var end = start + m[0].length;

        //console.log(m[0],start,end);

        for (var index=start;index<end;++index){

            sanitizedInput = sanitizedInput.substring(0, index) + '*' + sanitizedInput.substring(index + 1);

        }

    } 
       
    // Sanitize comments
    searchRegExp = /^%.*$/gm

    while (m = searchRegExp.exec(sanitizedInput)) {

        //debugger;

        var start = m.index;
        var end = start + m[0].length;

        //console.log(m[0],start,end);

        for (var index=start;index<end;++index){

            sanitizedInput = sanitizedInput.substring(0, index) + '*' + sanitizedInput.substring(index + 1);

        }

    }

    log("sanitized input:" + sanitizedInput);

    // Find all the notes
    var regex = /([=^_]?[a-gA-G][',]?|\|)/g;
    var notes = [];
    var m;
    while (m = regex.exec(sanitizedInput)) {
        var unNormalizedValue = m[1];
        if (unNormalizedValue == "|") {
            gKeySignature.accidentalFlats = "";
            gKeySignature.accidentalSharps = "";
            gKeySignature.accidentalNaturals = "";
        } else {
            var normalizedValue = normalize(unNormalizedValue);

            log("UnNormalized=" + unNormalizedValue + " normalized=" + normalizedValue);
            
            var theGlyph = getNoteGlyph(normalizedValue);

            notes.push(new Note((m.index), unNormalizedValue, normalizedValue, theGlyph));
        }
    }

    return notes;
}



// Normalizes the given note string, given the key signature.
// This means making sharps or flats explicit, and removing
// extraneous natural signs.
// Returns the normalized note string.
function normalize(value) {

    // Find note base name
    var i = value.search(/[A-G]/i);
    if (i == -1) {
        log("Failed to find basename for value!");
        return value;
    }
    var baseName = value.substr(i, 1).toUpperCase();

    // Does it have a natural?
    if (value.substr(0, 1) == "=") {
        gKeySignature.accidentalFlats = gKeySignature.accidentalFlats.replace(baseName, "");
        gKeySignature.accidentalSharps = gKeySignature.accidentalSharps.replace(baseName, "");
        gKeySignature.accidentalNaturals += baseName;
        return value.substr(1);
    }

    // Does it already have an accidental?
    if (value.substr(0, 1) == "_") {
        gKeySignature.accidentalFlats += baseName;
        gKeySignature.accidentalSharps = gKeySignature.accidentalSharps.replace(baseName, "");
        gKeySignature.accidentalNaturals = gKeySignature.accidentalNaturals.replace(baseName, "");
        return value;
    }

    if (value.substr(0, 1) == "^") {
        gKeySignature.accidentalFlats = gKeySignature.accidentalFlats.replace(baseName, "");
        gKeySignature.accidentalNaturals = gKeySignature.accidentalNaturals.replace(baseName, "");
        gKeySignature.accidentalSharps += baseName;
        return value;
    }

    // Transform to key signature

    if (gKeySignature.accidentalNaturals.search(baseName) != -1) {
        return value;
    }

    if (gKeySignature.sharps.search(baseName) != -1 ||
        gKeySignature.accidentalSharps.search(baseName) != -1) {
        return "^" + value;
    }

    if (gKeySignature.flats.search(baseName) != -1 ||
        gKeySignature.accidentalFlats.search(baseName) != -1) {
        return "_" + value;
    }

    return value;
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

    gForceNonMovableSolfege = document.getElementById('forceNonMovableSolfege').checked;

    var result = "";

    for (var i = 0; i < nTunes; ++i) {

        var thisTune = getTuneByIndex(theABC, i);

        thisTune = generate_tab(thisTune);

        thisTune = InjectOneDirective(thisTune, "%%musicspace " + musicSpace);
        thisTune = InjectOneDirective(thisTune, "%%staffsep " + staffSep);
        thisTune = InjectOneDirective(thisTune, "%%annotationfont " + fontFamily + " " + tabFontSize);
        thisTune = InjectOneDirective(thisTune, "%%infofont " + fontFamily + " " + infoFontSize);
        thisTune = InjectOneDirective(thisTune, "%%subtitlefont " + fontFamily + " " + subtitleFontSize);
        thisTune = InjectOneDirective(thisTune, "%%titlefont " + fontFamily + " " + titleFontSize);

        result += thisTune;

        result += "\n";
    }

    document.getElementById("output").value = result;

    // Give some feedback
    document.getElementById("generateTablature").innerHTML = "Solfege generated!";

    setTimeout(function() {

        document.getElementById("generateTablature").innerHTML = "Generate Solfege";

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
        gSaveFilename = "flute_tab";
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

    var shareName = "Solfege_Test";

    var abcInLZW = LZString.compressToEncodedURIComponent(abcText);

    var ssp = document.getElementById('staff_sep').value;

    var url = "https://michaeleskin.com/abctools/abctools.html?lzw=" + abcInLZW + "&format=noten&ssp=45&pdf=one&pn=br&fp=yes&btfs=10&name=" + shareName;

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
    document.getElementById('staff_sep').value = 60;
    document.getElementById('music_space').value = 10;

    var theValue = "";
    theValue += "X: 1\n";
    theValue += "T: The Kesh\n";
    theValue += "R: Jig\n";
    theValue += "M: 6/8\n";
    theValue += "L: 1/8\n";
    theValue += "K: Gmaj\n";
    theValue += "C: Traditional\n";
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

    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
                document.getElementById("instructions_header").innerHTML = "Show Instructions";
            } else {
                panel.style.display = "block";
                document.getElementById("instructions_header").innerHTML = "Hide Instructions";
           }
        });
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