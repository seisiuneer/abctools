var KEY_MAPS = {
	C: {
		half: [
			{key: "B", label: "A\u266F"},
			{key: "E", label: "C\u266F"},
			{key: "G", label: "D\u266F"},
			{key: "J", label: "F\u266F"},
			{key: "L", label: "G\u266F"},
			{key: "N", label: "A\u266F²"},
			{key: "Q", label: "C\u266F²"},
			{key: "S", label: "D\u266F²"}
		],
		full: [
			{key: "A", label: "A"},
			{key: "C", label: "B"},
			{key: "D", label: "C"},
			{key: "F", label: "D"},
			{key: "H", label: "E"},
			{key: "I", label: "F"},
			{key: "K", label: "G"},
			{key: "M", label: "A²"},
			{key: "O", label: "B²"},
			{key: "P", label: "C²"},
			{key: "R", label: "D²"},
			{key: "T", label: "E²"},
			{key: "U", label: "F²"}
		]
	},
	F: {
		half: [
			{key: "B", label: "D\u266F"},
			{key: "E", label: "F\u266F"},
			{key: "G", label: "G\u266F"},
			{key: "I", label: "A\u266F"},
			{key: "L", label: "C\u266F"},
			{key: "N", label: "D\u266F²"},
			{key: "Q", label: "F\u266F²"},
			{key: "S", label: "G\u266F²"},
			{key: "U", label: "A\u266F²"}
		],
		full: [
			{key: "A", label: "D"},
			{key: "C", label: "E"},
			{key: "D", label: "F"},
			{key: "F", label: "G"},
			{key: "H", label: "A"},
			{key: "J", label: "B"},
			{key: "K", label: "C"},
			{key: "M", label: "D²"},
			{key: "O", label: "E²"},
			{key: "P", label: "F²"},
			{key: "R", label: "G²"},
			{key: "T", label: "A²"}
		]
	},
	G: {
		half: [
			{key: "C", label: "F\u266F"},
			{key: "E", label: "G\u266F"},
			{key: "G", label: "A\u266F"},
			{key: "J", label: "C\u266F"},
			{key: "L", label: "D\u266F"},
			{key: "O", label: "F\u266F²"},
			{key: "Q", label: "G\u266F²"},
			{key: "S", label: "A\u266F²"}
		],
		full: [
			{key: "A", label: "E"},
			{key: "B", label: "F"},
			{key: "D", label: "G"},
			{key: "F", label: "A"},
			{key: "H", label: "B"},
			{key: "I", label: "C"},
			{key: "K", label: "D"},
			{key: "M", label: "E²"},
			{key: "N", label: "F²"},
			{key: "P", label: "G²"},
			{key: "R", label: "A²"},
			{key: "T", label: "B²"},
			{key: "U", label: "C²"}
		]
	}
};

var EXTRA_KEYS = [
	{key: "q",  label: "\u00D72"},
	{key: "r",  label: "Rest"},
	{key: " ",  label: "\u00a0"},
	{key: "-",  label: "\u2013"},
	{key: "|",  label: "|"},
	{key: "X",  label: "\u00D7"},
	{key: "\n", label: "\u21B5"}
];

var HTML_CHARS = {
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	'&': '&amp;'
};

//
// Detect a T:* or T: * section header
//
function isSectionHeader(theTune){

	var searchRegExp = /^T:\s*\*.*$/m

	var sectionHeaderDetected = theTune.match(searchRegExp);

	if ((sectionHeaderDetected) && (sectionHeaderDetected.length > 0)){
		return true;
	}

	return false;

}

//
// Is a tune a multi-voice tune
//
function isMultiVoiceTune(theTune){

	// Split the text into lines
    const lines = theTune.split('\n');
    
    // Create a set to store unique voice identifiers
    const voices = new Set();
    
    // Regular expression to match voice fields
    const voiceRegex = /^V:\s*(\S+)/;
    
    // Iterate over each line
    for (const line of lines) {
        const match = line.match(voiceRegex);
        if (match) {
            // Add the voice identifier to the set
            voices.add(match[1]);
        }
    }
    
    // Check if there are multiple voices
    return voices.size > 1;
}

//
// Copy to Clipboard Polyfill
//
function CopyToClipboard(textToCopy) {

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
    } 
    catch (error){

        console.log("CopyToClipboard error: "+error);

    }
}

//
// Create a centered prompt string
//
function makeCenteredPromptString(thePrompt){
    return '<p style="font-size:12pt;line-height:18pt;font-family:helvetica;text-align:center">'+thePrompt+'</p>';
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
// Set the title text
//
function setTitleText(theTitle){
    var elem = document.getElementById("title_print").textContent = "Title: "+theTitle;
}

//
// Get the title of the first tune
//
function GetFirstTuneTitle(theABC) {

    var theLines = theABC.split("\n");

    var title = "";

    for (var i = 0; i < theLines.length; ++i) {
        
        var currentLine = theLines[i].trim(); // Trim any whitespace from the line

        if (currentLine.startsWith("T:")) {

            title = currentLine.slice(2);
            
            title = title.trim();

            break;
        }
    }
    
    return title;
}

//
// Clear the editor
//
function clearAll(){

    var thePrompt = "Are you sure you want to clear all the tab and start over?";

    // Center the string in the prompt
    thePrompt = makeCenteredPromptString(thePrompt);

    DayPilot.Modal.confirm(thePrompt,{ top:200, theme: "modal_flat", scrollWithPage: false }).then(function(args){

        if (!args.canceled){

            document.execCommand('selectAll', false, null);
            document.execCommand('insertText', false, "");

            var nameEl = document.getElementById("name");

            // Reset the title and status
            nameEl.textContent = "New Tune";
            setTitleText("New Tune");
            document.title = "12 Hole Ocarina Tab Creator";
            gLastFilename = "";
        }

    });
   
}

//
// Checks if some text is probably ABC
//
function textIsABC(text) {

  // Use regular expressions to match lines starting with X: and K:
  const xPattern = /^X:/m;
  const kPattern = /^K:/m;

  // Test for both patterns in the text
  const hasX = xPattern.test(text);
  const hasK = kPattern.test(text);

  // Return true if both are found, false otherwise
  return hasX && hasK;

}

//
// File open intercept alert
//
function fileOpenIntercept(e){

    var elem = document.getElementById("openfile_fs");

    elem.click();

}

//
// Inject Custom Tab below the notes
//
var CustomTabGenerator = function (theABC){

    var verbose = false;

    var abcOutput = "";

    // Globals
    var keySignature = null;

    function log(s) {
        if (verbose)
            console.log(s);
    }

    //
    // Generate the box tab
    //
    function generate_custom_tab(abcInput,customTabKey){

    	var octaveShift = "0"
       
        log("Got input:" + abcInput);

        // Find the key signature in the input
        keySignature = findKeySignature(abcInput);

        if (keySignature == null) {
            return ("ERROR: Unknown or unsupported key signature");
        }

        // Generate an array of note objects. 
        var notes = getAbcNotes(abcInput,customTabKey,octaveShift);

        // Merge the chosen fingerings with the ABC notation
        return mergeTablature(abcInput, notes);

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

        var keyMatch = abcInput.match(/^K: *([A-G])([b#])? *(.*?)$/m);
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

        // Strip any trailing comments
        var searchExp = /%.*/
        keyExtra = keyExtra.replace(searchExp,"");
        keyExtra = keyExtra.trim();

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

	function getLineStartIndices(text) {
	  // Add an index for the start of the text (first line)
	  const indices = [0];
	  
	  // Use regular expression to find all newline characters
	  const regex = /\n/g;
	  let match;
	  
	  // Loop through all matches and push the index after each newline character
	  while ((match = regex.exec(text)) !== null) {
	    indices.push(match.index + 1);
	  }
	  
	  return indices;
	}

	function getLineNumberAtOffset(text, offset) {

	  // Get the array of line start indices
	  const lineStartIndices = getLineStartIndices(text);
	  
	  // Loop through the line start indices to find the correct line number
	  for (let i = 0; i < lineStartIndices.length; i++) {
	    // If the offset is before the start of the next line, return the current line number
	    if (i === lineStartIndices.length - 1 || offset < lineStartIndices[i + 1]) {
	      return i; // Line numbers are 1-based
	    }
	  }
	  
	  // If the offset exceeds the text length, return -1 (invalid offset)
	  return -1;
	}

    function getBarIndices(text) {
        let indices = [];
        let overallIndex = 0;  // Tracks the index relative to the start of the text

        const lines = text.split('\n');  // Split the text into lines

        lines.forEach(line => {
            let lineIndices = [];
            let inPipe = false;  // Track whether we are in a sequence of '|' characters

            for (let i = 0; i < line.length; i++) {
                if (line[i] === '|') {
                    if (!inPipe) {
                        lineIndices.push(overallIndex + i);  // Add the index of the first '|' in a sequence
                        inPipe = true;  // Mark that we're inside a pipe sequence
                    }
                } else {
                    inPipe = false;  // Reset if the character is not '|'
                }
            }

            indices.push(lineIndices);  // Add the indices for this line to the result
            overallIndex += line.length + 1;  // Update the overall index (account for '\n')
        });

        return indices;
    }

    //
    // Merges the tablature with the original string input.
    //
    function mergeTablature(input, notes) {

    	// Calculate the offsets to the line starts

    	var lineStarts = getLineStartIndices(input);

        var result = "";
        
        var insertedTotal = 0;

        var doBarlines = document.getElementById("injectbarlines").checked;

        var theBarLines = getBarIndices(input);
 
        var currentLine = getLineNumberAtOffset(input,notes[0].index);

        var currentLineBars = theBarLines[currentLine];

        var currentLineBarOffset = -1;

        var currentLineBarsIndex = 0;

        if (currentLineBars.length!=0){
            currentLineBarOffset = currentLineBars[currentLineBarsIndex];
        }

        for (var i = 0; i < notes.length; ++i) {

        	var lineNumber = getLineNumberAtOffset(input,notes[i].index);

        	// Split the staves
        	if (lineNumber != currentLine){

                if (doBarlines){
        		  result += "|\n";
                }
                else{
                  result += "\n";
                }
        		
                currentLine = lineNumber;

                currentLineBars = theBarLines[currentLine];
                
                currentLineBarOffset = -1;
                
                if (currentLineBars.length!=0){
                    currentLineBarOffset = currentLineBars[0];
                }
                
                currentLineBarsIndex = 0;

        	}

            if ((currentLineBarOffset != -1) && (notes[i].index > currentLineBarOffset)){

                if (doBarlines){
                    result = result + "|";
                }

                currentLineBarsIndex++;

                if (currentLineBarsIndex < currentLineBars.length){
                    currentLineBarOffset = currentLineBars[currentLineBarsIndex];
                }
                else{
                   currentLineBarOffset = -1; 
                }
            }

            var glyph = notes[i].glyph;

            result = result + glyph;

        }

        if (doBarlines){
            result += "|\n";
        }
        else{
            result += "\n";
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
    // From a note name, gets the note string
    //
    function getNoteGlyph(note,customTabKey,octaveShift){

        // Standard ABC
        var glyph_map = {
            "C,":  0,
            "^C,": 1,
            "_D,": 1,
            "D,":  2,
            "^D,": 3,
            "_E,": 3,
            "E,":  4,
            "^E,": 5,
            "_F,": 4,
            "F,":  5,
            "^F,": 6,
            "_G,": 6,
            "G,":  7,
            "^G,": 8,
            "_A,": 8,
            "A,":  9,
            "^A,": 10,
            "_B,": 10,
            "B,":  11,
            "^B,": 12,
            "_C":  11,
            "C":   12,
            "^C":  13,
            "_D":  13,
            "D":   14,
            "^D":  15,
            "_E":  15,
            "E":   16,
            "^E":  17,
            "_F":  16,
            "F":   17,
            "^F":  18,
            "_G":  18,
            "G":   19,
            "^G":  20,
            "_A":  20,
            "A":   21,
            "^A":  22,
            "_B":  22,
            "B":   23,
            "^B":  24,
            "_c":  23,
            "c":   24,
            "^c":  25,
            "_d":  25,
            "d":   26,
            "^d":  27,
            "_e":  27,
            "e":   28,
            "^e":  29,
            "_f":  28,
            "f":   29,
            "^f":  30,
            "_g":  30,
            "g":   31,
            "^g":  32,
            "_a":  32,
            "a":   33,
            "^a":  34,
            "_b":  34,
            "b":   35,
            "^b":  36,
            "_c'": 35,
            "c'":  36,
            "^c'": 37,
            "_d'": 37,
            "d'":  38,
            "^d'": 39,
            "_e'": 39,
            "e'":  40,
            "^e'": 41,
            "_F'": 40,
            "f'":  41,
            "^f'": 42,
            "_g'": 42,
            "g'":  43,
            "^g'": 44,
            "_a'": 44,
            "a'":  45,
            "^a'": 46,
            "_b'": 46,
            "b'":  47,

            // Naturals
            "=C,":  0,
            "=D,":  2,
            "=E,":  4,
            "=F,":  5,
            "=G,":  7,
            "=A,":  9,
            "=B,":  11,
            "=C":   12,
            "=D":   14,
            "=E":   16,
            "=F":   17,
            "=G":   19,
            "=A":   21,
            "=B":   23,
            "=c":   24,
            "=d":   26,
            "=e":   28,
            "=f":   29,
            "=g":   31,
            "=a":   33,
            "=b":   35,
            "=c'":  36,
            "=d'":  38,
            "=e'":  40,
            "=f'":  41,
            "=g'":  43,
            "=a'":  45,
            "=b'":  47,
            // Don't touch
            "C'":   24,
            "^C'":  25,
            "_D'":  25,
            "D'":   26,
            "^D'":  27,
            "_E'":  27,
            "E'":   28,
            "F'":   29,
            "^F'":  30,
            "_G'":  30,
            "G'":   31,
            "^G'":  32,
            "_A'":  32,
            "A'":   33,
            "^A'":  34,
            "_B'":  34,
            "B'":   35,
            "C''":  36,
            "^C''": 37,
            "_D''": 37,
            "D''":  38,
            "^D''": 39,
            "_E''": 39,
            "E''":  40,
            "F''":  41,
            "^F''": 42,
            "_G''": 42,
            "G''":  43,               
            "A''":  45,               
            "B''":  47,               
            "=C'":  24,
            "=D'":  26,
            "=E'":  28,
            "=F'":  29,
            "=G'":  31,
            "=A'":  33,
            "=B'":  35,
            "=C''": 36,
            "=D''": 38,
            "=E''": 40,
            "=F''": 41,
            "=G''": 43,            
            "=A''": 45,            
            "=B''": 47,            
        };

        var noteIndex = glyph_map[note];

        // Offset for instrument key
        //console.log("key is "+customTabKey);

        var theOffset = 0;

        switch (customTabKey){

        	case "C":
        	break;

        	case "F":
        	theOffset = -5;
        	break;

        	case "G":
        	theOffset = -7;
        	break;

        }

        noteIndex += theOffset;

        // Add any octave shift        
        if (octaveShift == "1"){
            noteIndex += 12;
        }
        else
        if (octaveShift == "-1"){
            noteIndex -= 12;
        }  
        else          
        if (octaveShift == "2"){
            noteIndex += 24;
        }
        else
        if (octaveShift == "-2"){
            noteIndex -= 24;
        }            
 
        if (noteIndex < 0){
            return "x";
        }

        if ((noteIndex!=0) && (!noteIndex)){
            return "x";
        }

        var theTabMap = ["x","x","x","x","x","x","x","x","x","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x","x"];

        var retVal = theTabMap[noteIndex];

        if (!retVal){
            return "x";
        }

        return retVal;

    }

    // Returns an array of Notes from the ABC string input
    function getAbcNotes(input,customTabKey,octaveShift) {

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

        // Sanitize !*! style annotations
        searchRegExp = /![^!\n]*!/gm 

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

        // Sanitize ! 
        sanitizedInput = sanitizedInput.replaceAll("!","*");

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
                
                var theGlyph = getNoteGlyph(normalizedValue,customTabKey,octaveShift);

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
    // Return the tune ABC at a specific index
    //
    //
    function getTuneByIndex(theABC, tuneNumber) {

        var theNotes = theABC;

        // Now find all the X: items
        var theTunes = theNotes.split(/^X:/gm);

        return ("X:" + theTunes[tuneNumber + 1]);

    }

    function stripCustomTab(input) {
      return input.split('\n') // Split input into lines
        .filter(line => !/^%%vskip 15$|^%%text Tab:|^%%annotationfont/.test(line)) // Filter out lines that match the pattern
        .join('\n'); // Join the remaining lines back into a string
    }

    //
    // Main processor
    //
    function generateTablature(theABC) {
 
        var nTunes = countTunes(theABC);

        var result = "";

        var theKey = document.getElementById("key").value;

        for (var i = 0; i < nTunes; ++i) {

            var thisTune = getTuneByIndex(theABC, i);

            // Don't inject section header tune fragments or multi-voice tunes
            if (isSectionHeader(thisTune) || isMultiVoiceTune(thisTune)){
                result += "\n";
                continue;
            }

            thisTune = generate_custom_tab(thisTune,theKey)
 
            result += thisTune;

            result += "\n\n";
        }

        result = result.replaceAll("\n\n\n","\n\n");

        return result;

    }

    return generateTablature(theABC);

}

// Transcode ABC to ocarina representation
function abc_to_text(theTune){
	return CustomTabGenerator(theTune);
}

var last_cursor = null;

function parseParams (search) {
	search = search.replace(/^\?/,'');
	var params = {};
	if (search) {
		search = search.replace(/\+/g,' ').replace(/\//g,'\n').split("&");
		for (var i = 0; i < search.length; ++ i) {
			var pair = search[i].split("=");
			params[decodeURIComponent(pair[0])] = decodeURIComponent(pair.slice(1).join("="));
		}
	}
	return params;
}

function makeParams (params) {
	var buf = [];
	for (var name in params) {
		buf.push(encodeURIComponent(name)+'='+encodeURIComponent(params[name]));
	}
	return buf.sort().join('&').replace(/%20/g,'+').replace(/%0A/gi,'/');
}

function getFontFamily () {
	var font = document.getElementById("font").value;
	return '"Open 12 Hole Ocarina '+font+'", monospace';
}


var TITLE_SCALE = 0.5;

function updateStyle() {
	var size = Number(document.getElementById("font_size").value);
	var unit = document.getElementById("font_size_unit").value;
	var editor = document.getElementById("editor");
	var name = document.getElementById("name");
	name.style.fontSize = (size * TITLE_SCALE)+unit;
	editor.style.fontSize = size+unit;
	editor.style.fontFamily = getFontFamily();
}

function init() {
	var editor = document.getElementById("editor");
	var name = document.getElementById("name");
	updateStyle();

	var params = parseParams(location.search);

	if (params.readonly === 'true') {
		editor.contentEditable = 'false';
		document.body.className = 'readonly';
	}

	if (params.name) {
        var decodedName = decodeURIComponent(params.name)
		name.textContent = decodedName;
		document.title = decodedName + ' - 12 Hole Ocarina Tab Creator';
	}

	if (params.size) {
		var match = /^\s*(\d+(?:\.\d*)?)(\w+)?\s*$/.exec(params.size);
		var size = Number(match[1]);
		var unit = match[2]||'px';
		var fontSize = size+unit;
		document.getElementById("font_size").value = size;
		document.getElementById("font_size_unit").value = unit;
		editor.style.fontSize = size+unit;
		name.style.fontSize = (size * TITLE_SCALE)+unit;
	}

	if (params.font) {
		document.getElementById("font").value = params.font;
	}

	if (params.key) {
		document.getElementById("key").value = params.key;
	}

	editor.style.fontFamily = getFontFamily();

	if (params.tabs) {

		editor.innerHTML = '';

		var decodedTabs = decodeURIComponent(params.tabs);

        var tabs = decodedTabs.split("\n");

		for (var i = 0; i < tabs.length; ++ i) {
			var div  = document.createElement("div");
			var line = tabs[i];
			if (line.length === 0) {
				div.appendChild(document.createElement("br"));
			}
			else {
				div.appendChild(document.createTextNode(line));
			}
			editor.appendChild(div);
		}
	}

	if (window !== parent) {
		var link = document.createElement("a");
		link.className = "embed-link";
		link.target = "_top";
		link.href = shareUrl();

		var img = new Image();
		img.src = "app/ocarina_tabs/icon16.png";
		img.alt = "";
		link.appendChild(img);
		link.appendChild(document.createTextNode(" "+document.title));
		document.body.appendChild(link);
	}

	editor.addEventListener("paste", function (event) {
		event.preventDefault();

		var text = event.clipboardData.getData("text/plain");

        // Does this look like ABC?
        if (textIsABC(text)){

            // If editor is empty, set the name
            var editor = document.getElementById("editor");

            var theEditorText = getPlainText(editor);

            theEditorText = theEditorText.trim();

            if (theEditorText.length == 0){

                var theABCTitle = GetFirstTuneTitle(text);

                if (theABCTitle == ""){
                    theABCTitle = "No Title";
                }

                var nameEl = document.getElementById("name");

                nameEl.textContent = theABCTitle;
                setTitleText(theABCTitle);
                document.title = theABCTitle + ' - 12 Hole Ocarina Tab Creator';
                gLastFilename = theABCTitle;
 
            }

            // Yes, try converting it to ocarina tab before the paste
            text = abc_to_text(text);

        }

		document.execCommand('insertText', false, text);

	}, false);

	editor.addEventListener("drop", function (event) {
		event.preventDefault();

		var text = event.dataTransfer.getData("text/plain");
		document.execCommand('insertText', false, text);
	}, false);

	editor.addEventListener("blur", function (event) {
		last_cursor = getSelectionRange();
	}, true);

	editor.addEventListener("focus", function (event) {
		last_cursor = null;
	}, true);

	updateButtons();

	editor.focus();

	window.addEventListener("click", function (event) {
		var menu  = document.querySelector("#save-as-dropdown .dropdown-menu");
		var arrow = document.querySelector("#save-as-dropdown .dropdown-button-arrow");

		if (event.target !== menu && !menu.contains(event.target) &&
			event.target !== arrow && !arrow.contains(event.target)) {
			menu.style.display = 'none';
		}
	}, false);

    // Allow file opener to work on iOS
    if (isIOS()){
        document.getElementById("openfile_fs").removeAttribute("accept");
    }  

}

function updateButtons () {
	var key = document.getElementById("key").value;
	var full_notes  = document.getElementById("full_notes");
	var other_notes = document.getElementById("other_notes");

	full_notes.innerHTML  = '';
	other_notes.innerHTML = '';

	var key_map = KEY_MAPS[key];
	addButtons(full_notes, key_map.full);
	addButtons(other_notes, key_map.half);
	addButtons(other_notes, EXTRA_KEYS);

	var button = document.createElement("button");
	button.className = "btn";
	button.type = "button";
	button.title = "Toggle Section";
	button.appendChild(document.createTextNode("︵"));
	button.addEventListener("click", toggleSection, false);
	full_notes.appendChild(button);
}

function changeTitle () {

	var nameEl = document.getElementById("name");

    DayPilot.Modal.prompt("Enter the title that will appear above the tablature:", nameEl.textContent,{ theme: "modal_flat", top: 200, autoFocus: true, scrollWithPage: false }).then(function(args) {

        if (!args.canceled){

            var name = args.result;
        	if (name !== null) {
        		nameEl.textContent = name;
                setTitleText(name);
        		document.title = name + ' - 12 Hole Ocarina Tab Creator';
                gLastFilename = name;
        	}
        }

    });
}

function addButtons (parent, keys) {
	for (var i = 0; i < keys.length; ++ i) {
		var key = keys[i];
		var button = document.createElement("button");
		button.className = "btn";
		button.type = "button";
		button.title = key.key;
		button.appendChild(document.createTextNode(key.label));
		button.addEventListener("click", makeInserter(key.key), false);
		parent.appendChild(button);
		parent.appendChild(document.createTextNode(' '));
	}
}

function makeInserter (key) {
	var editor = document.getElementById("editor");

	return function (event) {
		var cursor = last_cursor;
		if (cursor && document.activeElement !== editor) {
			editor.focus();
			setSelectionRange(cursor);
		}

		if (document.activeElement !== editor) {
			editor.focus();
			setCursorToEnd(editor);
		}

		document.execCommand('insertText', false, key);
	};
}

var SECTION_CP = {
	'\u0305': true, // overline
	'\u1DC7': true, // vertical bottom left paren
	'\u1DC6': true, // vertical top left paren
	'\u0311': true  // vertical left paren
};


// Combining Diacritical Marks (0300–036F), since version 1.0, with modifications in subsequent versions down to 4.1
// Combining Diacritical Marks Extended (1AB0–1AFF), version 7.0
// Combining Diacritical Marks Supplement (1DC0–1DFF), versions 4.1 to 5.2
// Combining Diacritical Marks for Symbols (20D0–20FF), since version 1.0, with modifications in subsequent versions down to 5.1
// Combining Half Marks (FE20–FE2F), versions 1.0, with modifications in subsequent versions down to 8.0

function isCombining (cp) {
	return (cp >= 0x0300 && cp <= 0x036F) ||
	       (cp >= 0x1AB0 && cp <= 0x1AFF) ||
	       (cp >= 0x1DC0 && cp <= 0x1DFF) ||
	       (cp >= 0x20D0 && cp <= 0x20FF) ||
	       (cp >= 0xFE20 && cp <= 0xFE2F);
}

function toggleSection () {
	var range = getSelectionRange();

	if (!range) return;

	var text = getPlainText(range.cloneContents());

	var i = 0;
	var in_section = false;
	while (i < text.length && !isCombining(text.charCodeAt(i))) ++ i;
	while (i < text.length && isCombining(text.charCodeAt(i))) {
		if (SECTION_CP[text.charAt(i)] === true) {
			in_section = true;
			break;
		}
		++ i;
	}

	document.execCommand('insertText', false, in_section ? removeSection(text) : addSection(text));
}

function removeSection (text) {
	return text.replace(/[\u0305\u1DC7\u1DC6\u0311]/g,'');
}

function addSection (text) {
	return removeSection(text).replace(/[A-Za-z0-9]+/g, function (slice) {
		if (slice.length === 1) {
			return slice+'\u0311';
		}
		else {
			var first = slice.charAt(0);
			var last  = slice.charAt(slice.length - 1);
			return first+'\u1DC7'+slice.slice(1, slice.length-1).replace(/(.)/g, '$1\u0305')+last+'\u1DC6';
		}
	});
}

function getSelectionRange () {
	var sel = window.getSelection();
	if (sel.getRangeAt && sel.rangeCount) {
		return sel.getRangeAt(0);
	}
	return null;
}

function setSelectionRange (range) {
	if (range) {
		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	}
}

function formValues () {
	var size = Number(document.getElementById("font_size").value);
	var unit = document.getElementById("font_size_unit").value;
	var key  = document.getElementById("key").value;
	var font = document.getElementById("font").value;
	var editor = document.getElementById("editor");
	var name = encodeURIComponent(document.getElementById("name").textContent);

    var theEncodedTabs = encodeURIComponent(getPlainText(editor));

	var values = {
		tabs: theEncodedTabs,
		size: size+unit,
		key:  key,
		font: font
	};
	if (name) {
		values.name = name;
	}
	return values;
}

function shareUrl () {
	return location.href.replace(/[#\?].*/,'').replace(/^http:/,'https:') + '?' + makeParams(formValues());
}

function shareLink () {
    
    CopyToClipboard(shareUrl());

    var thePrompt = makeCenteredPromptString("Share link copied to the clipboard!");

    DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: false });

}

function escapeHtml (s) {
	return s.replace(/[<>"&]/g, function (ch) {
		return HTML_CHARS[ch];
	});
}

function getPlainText (element) {
	var buf = [];
	_getPlainText(element, buf);
	return buf.join("");
}

function _getPlainText (element, buf) {
	for (var el = element.firstChild; el; el = el.nextSibling) {
		if (el.nodeType === 1) {
			if (buf.length > 0 && buf[buf.length - 1] !== "\n") {
				var display = getComputedStyle(el, null).getPropertyValue("display");
				if (display !== "inline" && display !== "inline-block") {
					buf.push("\n");
				}
			}

			if (el.nodeName !== "STYLE" && el.nodeName !== "SCRIPT") {
				if (el.nodeName === "BR") {
					buf.push("\n");
				}
				else {
					_getPlainText(el, buf);
				}
			}
		}
		else if (el.nodeType === 3) {
			buf.push(el.textContent);
		}
	}
}

function saveUrlAs (url, filename) {
	var link = document.createElement("a");

	link.setAttribute("download", filename||"");
	link.href = url;
	link.style.visibility = 'hidden';
	link.style.position = 'absolute';
	link.style.right = '0';
	link.style.bottom = '0';
	document.body.appendChild(link);

	link.click();

	document.body.removeChild(link);
}

function saveCanvasImage (canvas, filename) {

	if (canvas.toBlob) {
		canvas.toBlob(function (blob) {
			var url = URL.createObjectURL(blob);
			saveUrlAs(url, filename);
			setTimeout(function () {
				URL.revokeObjectURL(url);
			}, 1000);
		}, "image/png");
	}
	else {
		var url = canvas.toDataURL("image/png");
		saveUrlAs(url, filename);
        setTimeout(function () {
            URL.revokeObjectURL(url);
        }, 1000);
	}

}

// Keep the last filename
var gLastFilename = "";

function saveAsImage() {

    var thePrompt = "Save PNG image as:";
    var thePlaceHolder = "12_hole_ocarina_tab.png";

    if (gLastFilename != ""){
        
        thePlaceHolder = gLastFilename;

        if ((!thePlaceHolder.endsWith(".png")) && (!thePlaceHolder.endsWith(".PNG"))){

            // Give it a good extension
            thePlaceHolder = thePlaceHolder.replace(/\..+$/, '');
            thePlaceHolder = thePlaceHolder + ".png";

        }
  
    }

    DayPilot.Modal.prompt(thePrompt, thePlaceHolder,{ theme: "modal_flat", top: 200, autoFocus: true, scrollWithPage: false }).then(function(args) {

        if (args.canceled){
            return;
        }

        var fname = args.result;

        // If the user pressed Cancel, exit
        if (fname == null){
          return;
        }

       if ((!fname.endsWith(".png")) && (!fname.endsWith(".PNG"))){

            // Give it a good extension
            fname = fname.replace(/\..+$/, '');
            fname = fname + ".png";

        }

        gLastFilename = fname;

    	var size = Number(document.getElementById("font_size").value);
    	var unit = document.getElementById("font_size_unit").value;
    	var editor = document.getElementById("editor");
    	var lines = getPlainText(editor).split("\n");
    	var canvas = document.createElement("canvas");
    	canvas.width  = Math.max(editor.offsetWidth, editor.scrollWidth||0);
    	canvas.height = Math.max(editor.offsetHeight, editor.scrollHeight||0);

    	var ctx = canvas.getContext("2d");
    	var line_width = 0;
    	var font = size+unit+" "+getFontFamily();
    	ctx.font = font;
    	ctx.textBaseline = "top";

    	for (var i = 0; i < lines.length; ++ i) {
    		var metrics = ctx.measureText(lines[i]);
    		if (metrics.width > line_width) {
    			line_width = metrics.width;
    		}
    	}

    	var measureEl = document.createElement("div");
    	var style = getComputedStyle(editor, null);

    	measureEl.style.font = style.getPropertyValue("font");
    	measureEl.style.lineHeight = style.getPropertyValue("line-height");
    	measureEl.style.whiteSpace = "nowrap";
    	measureEl.style.visibility = "hidden";
    	measureEl.style.position = "absolute";
    	measureEl.style.right = "0";
    	measureEl.style.bottom = "0";
    	measureEl.appendChild(document.createTextNode("A- "));
    	document.body.appendChild(measureEl);
    	var line_height = measureEl.offsetHeight;
    	document.body.removeChild(measureEl);

    	canvas.width  = line_width + 40;
    	canvas.height = line_height * lines.length + 40;

    	ctx = canvas.getContext("2d");
    	ctx.font = font;
    	ctx.textBaseline = "top";

    	ctx.fillStyle = '#FFFFFF';
    	ctx.fillRect(0, 0, canvas.width, canvas.height);

    	ctx.fillStyle = '#000000';

    	var y = 20;
    	for (var i = 0; i < lines.length; ++ i) {
    		var line = lines[i];
    		ctx.fillText(line, 20, y);
    		y += line_height;
    	}
        
        saveCanvasImage(canvas, fname);

    });
}

function saveAsTextFile () {

    var thePrompt = "Save text file as:";
    var thePlaceHolder = "12_hole_ocarina_tab.txt";

    if (gLastFilename != ""){
        
        thePlaceHolder = gLastFilename;

        if ((!thePlaceHolder.endsWith(".txt")) && (!thePlaceHolder.endsWith(".TXT"))){

            // Give it a good extension
            thePlaceHolder = thePlaceHolder.replace(/\..+$/, '');
            thePlaceHolder = thePlaceHolder + ".txt";

        }
    }

    DayPilot.Modal.prompt(thePrompt, thePlaceHolder,{ theme: "modal_flat", top: 200, autoFocus: true, scrollWithPage: false }).then(function(args) {

        if (args.canceled){
            return;
        }

        var fname = args.result;

        // If the user pressed Cancel, exit
        if (fname == null){
          return;
        }

        if ((!fname.endsWith(".txt")) && (!fname.endsWith(".TXT"))){

            // Give it a good extension
            fname = fname.replace(/\..+$/, '');
            fname = fname + ".txt";

        }

        gLastFilename = fname;

    	var editor = document.getElementById("editor");
    	var text = getPlainText(editor);
    	var blob = new Blob([text], {type : 'text/plain;charset=UTF-8'});

    	var url = URL.createObjectURL(blob);
    	saveUrlAs(url, fname);
    	setTimeout(function () {
    		URL.revokeObjectURL(url);
    	}, 1000);

    });
}

function openTextFile (input) {

	var editor = document.getElementById("editor");

	var file = input.files[input.files.length - 1];

	var isABC = /\.abc$/i.test(file.name);

	var reader = new FileReader();
	reader.onload = function () {

		var text = reader.result;

        var name = file.name;

		if (isABC){

            name = name.replace(".abc","");

		}
        else{

            name = name.replace(".txt","");

        }

        // Allow for ABC from .txt files
        if (textIsABC(text)){

            text = abc_to_text(text);

        }

        var nameEl = document.getElementById("name");
        
        nameEl.textContent = name;

        setTitleText(name);

        document.title = name + ' - 12 Hole Ocarina Tab Creator';

        // Use this as the placeholder filename
        gLastFilename = name;
 
		editor.focus();

		document.execCommand('selectAll', false, null);
		document.execCommand('insertText', false, text);
	};

	reader.onerror = function () {

        var thePrompt = makeCenteredPromptString(this.error);

        DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: false });
	}

	reader.readAsText(file);

	// clear input
	var elem = document.getElementById("openfile_fs");
	elem.value = "";

}

function toggleMenu (id) {
	var menu = document.querySelector("#"+id+" .dropdown-menu");
	if (menu.style.display === 'block') {
		menu.style.display = 'none';
	}
	else {
		menu.style.display = 'block';
	}
}

function hideMenu (id) {
	var menu = document.querySelector("#"+id+" .dropdown-menu");
	menu.style.display = 'none';
}

// Derived from: http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
var VOID_NODES = {
	AREA: true,
	BASE: true,
	BR: true,
	COL: true,
	EMBED: true,
	HR: true,
	IMG: true,
	INPUT: true,
	KEYGEN: true,
	LINK: true,
	MENUITEM: true,
	META: true,
	PARAM: true,
	SOURCE: true,
	TRACK: true,
	WBR: true,
	BASEFONT: true,
	BGSOUND: true,
	FRAME: true,
	ISINDEX: true
};

function canContainText (node) {
	return node.nodeType === 1 && VOID_NODES[node.nodeName] !== true;
}

function getLastChildElement (el) {
	var lc = el.lastChild;
	while (lc && lc.nodeType !== 1) {
		if (lc.previousSibling)
			lc = lc.previousSibling;
		else
			break;
	}
	return lc;
}

function setCursorToEnd (element) {
	for (;;) {
		var lc = getLastChildElement(element);

		if (!lc || !canContainText(lc))
			break;

		element = lc;
	}

	var range = document.createRange();
	range.selectNodeContents(element);
	range.collapse(false);

	var selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
}

function undoEdit () {
	document.execCommand("undo", false, null);
}

function redoEdit () {
	document.execCommand("redo", false, null);
}
