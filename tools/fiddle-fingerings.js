//
// fiddle-fingerings.js
//
// ABC Muscial Notation Converter for Fiddle Fingerings
//
// Annotates an ABC format tune with tablature
// for fiddle fingerings
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
var keySignature = null;

// Suggested filename for save
var gSaveFilename = "";

function log(s) {
    if (verbose)
        console.log(s);
}

//
// Generate the fiddle fingering  tab
//
function generate_tab(abcInput){

    log("Got input:" + abcInput);

    // Find the key signature in the input
    keySignature = findKeySignature(abcInput);

    if (keySignature == null) {
        return ("ERROR: Unknown or unsupported key signature");
    }

    // Generate an array of note objects. Each
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


    log("Got base key of '" + keySignatureBase + "' and extra of '" + keyExtra + "'");

    // Determine musical mode
    if (keyExtra == "" ||
        keyExtra.search("maj") != -1 ||
        keyExtra.search("ion") != -1) {
        log("Mode: Ionian (major)");
        myMap = keySignatureMap(keySignatureBase, 0);
    } else if (keyExtra.search("mix") != -1) {
        log("Mode: Mixolydian");
        myMap = keySignatureMap(keySignatureBase, 1);
    } else if (keyExtra.search("dor") != -1) {
        log("Mode: Dorian");
        myMap = keySignatureMap(keySignatureBase, 2);
    } else if ((keyExtra.search("m") != -1 && keyExtra.search("mix") == -1) ||
        keyExtra.search("min") != -1 ||
        keyExtra.search("aeo") != -1) {
        log("Mode: Aeolian (minor)");
        myMap = keySignatureMap(keySignatureBase, 3);
    } else if (keyExtra.search("phr") != -1) {
        log("Mode: Phrygian");
        myMap = keySignatureMap(keySignatureBase, 4);
    } else if (keyExtra.search("loc") != -1) {
        log("Mode: Locrian");
        myMap = keySignatureMap(keySignatureBase, 5);
    } else if (keyExtra.search("lyd") != -1) {
        log("Mode: Lydian");
        myMap = keySignatureMap(keySignatureBase, -1);
    } else if (keyExtra.search("exp") != -1) {
        log("(Accidentals to be explicitly specified)");
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

    var location = document.getElementById('tab_location').selectedIndex;

    var includeStringName = document.getElementById('includeStringName').checked;

    for (var i = 0; i < notes.length; ++i) {

        var index = notes[i].index + insertedTotal;

        var glyph = notes[i].glyph;

        var glyphLen = glyph.length;

        var finger = glyph[glyphLen-1];

        var stringName = glyph.substr(0,glyphLen-1);

        if (includeStringName){

            switch (location){

                // Above
                case 0:
                    // Add double quotes to tab, to be rendered above the note
                    var theTab = "\"^" + stringName + "\"";

                    theTab = theTab + "\"^" + finger + "\"";

                    break;

                // Below
                case 1:

                    // Add double quotes to tab, to be rendered above the note
                    var theTab = "\"_" + stringName + "\"";

                    theTab = theTab + "\"_" + finger + "\"";

                    break;

            }
        }
        else{

             switch (location){

                // Above
                case 0:
                    // Add double quotes to tab, to be rendered above the note
                    var theTab = "\"^" + finger + "\"";

                    break;

                // Below
                case 1:

                    // Add double quotes to tab, to be rendered above the note
                    var theTab = "\"_" + finger + "\"";

                    break;

            }
           
        }

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
// From a note name, gets the button string
//
function getNoteGlyph(note){

    var numbersInCircles = document.getElementById('numbersInCircles').checked;

    if (numbersInCircles){

        var glyph_map = {
            "G,":  "G⓪",
            "^G,": "G①",
            "_A,": "G①",
            "A,":  "G①",
            "^A,": "G②",
            "_B,": "G②",
            "B,":  "G②",
            "C":   "G③",
            "^C":  "G③",
            "_D":  "G③",
            "D":   "D⓪",
            "^D":  "D①",
            "_E":  "D①",
            "E":   "D①",
            "F":   "D②",
            "^F":  "D②",
            "_G":  "D②",
            "G":   "D③",
            "^G":  "D③",
            "_A":  "D③",
            "A":   "A⓪",
            "^A":  "A①",
            "_B":  "A①",
            "B":   "A①",
            "c":   "A②",
            "^c":  "A②",
            "_d":  "A②",
            "d":   "A③",
            "^d":  "A③",
            "_e":  "A③",
            "e":   "E⓪",
            "f":   "E①",
            "^f":  "E①",
            "_g":  "E①",
            "g":   "E②",
            "^g":  "E②",
            "_a":  "E②",
            "a":   "E③",
            "^a":  "E③",
            "_b":  "E③",
            "b":   "E④",
            "c'":  "E④",
            "^c'": "E④",
            "_d'": "E④",
            "d'":  "E④",
        };

        var thisGlyph = glyph_map[note];

        if (!thisGlyph){
            return "x ";
        }

        return thisGlyph;
    }
    else{
        
        var glyph_map = {
            "G,":  "G0",
            "^G,": "G1",
            "_A,": "G1",
            "A,":  "G1",
            "^A,": "G2",
            "_B,": "G2",
            "B,":  "G2",
            "C":   "G3",
            "^C":  "G3",
            "_D":  "G3",
            "D":   "D0",
            "^D":  "D1",
            "_E":  "D1",
            "E":   "D1",
            "F":   "D2",
            "^F":  "D2",
            "_G":  "D2",
            "G":   "D3",
            "^G":  "D3",
            "_A":  "D3",
            "A":   "A0",
            "^A":  "A1",
            "_B":  "A1",
            "B":   "A1",
            "c":   "A2",
            "^c":  "A2",
            "_d":  "A2",
            "d":   "A3",
            "^d":  "A3",
            "_e":  "A3",
            "e":   "E0",
            "f":   "E1",
            "^f":  "E1",
            "_g":  "E1",
            "g":   "E2",
            "^g":  "E2",
            "_a":  "E2",
            "a":   "E3",
            "^a":  "E3",
            "_b":  "E3",
            "b":   "E4",
            "c'":  "E4",
            "^c'": "E4",
            "_d'": "E4",
            "d'":  "E4",
        };

        var thisGlyph = glyph_map[note];

        if (!thisGlyph){
            return "x ";
        }

        return thisGlyph;
    }
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
            keySignature.accidentalFlats = "";
            keySignature.accidentalSharps = "";
            keySignature.accidentalNaturals = "";
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
        keySignature.accidentalFlats = keySignature.accidentalFlats.replace(baseName, "");
        keySignature.accidentalSharps = keySignature.accidentalSharps.replace(baseName, "");
        keySignature.accidentalNaturals += baseName;
        return value.substr(1);
    }

    // Does it already have an accidental?
    if (value.substr(0, 1) == "_") {
        keySignature.accidentalFlats += baseName;
        keySignature.accidentalSharps = keySignature.accidentalSharps.replace(baseName, "");
        keySignature.accidentalNaturals = keySignature.accidentalNaturals.replace(baseName, "");
        return value;
    }

    if (value.substr(0, 1) == "^") {
        keySignature.accidentalFlats = keySignature.accidentalFlats.replace(baseName, "");
        keySignature.accidentalNaturals = keySignature.accidentalNaturals.replace(baseName, "");
        keySignature.accidentalSharps += baseName;
        return value;
    }

    // Transform to key signature

    if (keySignature.accidentalNaturals.search(baseName) != -1) {
        return value;
    }

    if (keySignature.sharps.search(baseName) != -1 ||
        keySignature.accidentalSharps.search(baseName) != -1) {
        return "^" + value;
    }

    if (keySignature.flats.search(baseName) != -1 ||
        keySignature.accidentalFlats.search(baseName) != -1) {
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
// Strip all the chords in the ABC
//
function StripChords(theNotes) {

    // Strip out chord markings
    var searchRegExp = /"[^"]*"/gm

    // Strip out chord markings
    theNotes = theNotes.replace(searchRegExp, "");

    // Replace the ABC
    return theNotes;

}

//
// Main processor
//
function generateTablature() {

    var theABC = document.getElementById('input').value;

    var nTunes = countTunes(theABC);

    var injectVolumes = document.getElementById('injectVolumes').checked;

    var fontFamily = document.getElementById('font_family').value
    var titleFontSize = document.getElementById('title_font_size').value;
    var subtitleFontSize = document.getElementById('subtitle_font_size').value;
    var infoFontSize = document.getElementById('info_font_size').value;
    var tabFontSize = document.getElementById('tab_font_size').value;
    var musicSpace = document.getElementById('music_space').value
    var staffSep = document.getElementById('staff_sep').value;

    var result = "";

    for (var i = 0; i < nTunes; ++i) {

        var thisTune = getTuneByIndex(theABC, i);

        thisTune = StripChords(thisTune);

        thisTune = generate_tab(thisTune);

        // Default directives to inject into every tune
        //%%MIDI chordprog 133
        //%%MIDI chordvol 32
        //%%MIDI bassvol 32
        //%%titlefont Palatino 22
        //%%subtitlefont Palantino 18
        //%%infofont Palatino 14
        //%%staffsep 80
        //%%musicspace 10

        // %%MIDI program and %MIDI chordprog are injected by the ABC Tool at PDF export time using the
        // %add_all_playback_links <melody program> <bass/chord program>
        // annotation

        // Inject directives
        // Reels: Palatino 9
        // Jigs: Palatino 11

        thisTune = InjectOneDirective(thisTune, "%%musicspace " + musicSpace);
        thisTune = InjectOneDirective(thisTune, "%%staffsep " + staffSep);
        thisTune = InjectOneDirective(thisTune, "%%annotationfont " + fontFamily + " " + tabFontSize);
        thisTune = InjectOneDirective(thisTune, "%%infofont " + fontFamily + " " + infoFontSize);
        thisTune = InjectOneDirective(thisTune, "%%subtitlefont " + fontFamily + " " + subtitleFontSize);
        thisTune = InjectOneDirective(thisTune, "%%titlefont " + fontFamily + " " + titleFontSize);

        // Safety measure if you want to mute any bass/chords on playback
        if (injectVolumes) {
            thisTune = InjectOneDirective(thisTune, "%%MIDI bassvol 0");
            thisTune = InjectOneDirective(thisTune, "%%MIDI chordvol 0");
        }

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
        gSaveFilename = "fiddle_fingerings";
    }

    var thePlaceholder = gSaveFilename;

    thePlaceholder += "_Fiddle.abc";

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

    var shareName = "Fiddle_Fingerings_Test";

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
// Globals
//
var gIsIOS = false;
var gIsAndroid = false;

//
// Initialization 
//
function DoStartup() {

    document.getElementById('font_family').value = "Palatino";
    document.getElementById('title_font_size').value = 22;
    document.getElementById('subtitle_font_size').value = 18;
    document.getElementById('info_font_size').value = 14;
    document.getElementById('tab_font_size').value = 11;
    document.getElementById('staff_sep').value = 80;
    document.getElementById('music_space').value = 10;
    document.getElementById('tab_location').selectedIndex = 1;
    document.getElementById('includeStringName').checked = false;
    document.getElementById('numbersInCircles').checked = false;

    var sampleTune = "";
    sampleTune += "X: 1\n";
    sampleTune += "T: The Kesh\n";
    sampleTune += "R: jig\n";
    sampleTune += "M: 6/8\n";
    sampleTune += "L: 1/8\n";
    sampleTune += "K: Gmaj\n";
    sampleTune += "|:GAG GAB|ABA ABd|edd gdd|edB dBA|\n";
    sampleTune += "GAG GAB|ABA ABd|edd gdd|BAF G3:|\n";
    sampleTune += "|:BAB dBd|ege dBA|BAB dBG|ABA AGA|\n";
    sampleTune += "BAB dbd|ege dBd|gfg aga|bgg g3:|\n";

    document.getElementById('input').value = sampleTune;

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

    // Configure the initial button map
    //initButtonMap();

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
