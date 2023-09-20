//
// Mel-tab-generator.js
// ABC Muscial Notation Converter for Traditional Irish Button Accordion
// ABC Muscial Notation Converter for Chromatic 21 Key Melodeon
// Annotates an ABC format tune with tablature
// for the B/C and C#/D button accordions //
// for the D/G  and G/C 3 or 4 button start Melodeons
// Michael Eskin
// http://michaeleskin.com
//David Jacobs modded for Atab and Btab from 20/09/23
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
// Generate the box tab
// Generate the melodeon tab
function generate_tab(abcInput){

    log("Got input:" + abcInput);
//D/G 3 Start or D/G 4 Start or G/C 3 Start or G/C 4 Start
  // Atab uses numbers 1-10 circled and 1-11 , Btab uses odd 1-11 even 2-10
    var style = document.getElementById('layout').selectedIndex;

    // Find the key signature in the input
    keySignature = findKeySignature(abcInput);

    if (keySignature == null) {
        return ("ERROR: Unknown or unsupported key signature");
    }

    // Generate an array of note objects. Each
    var notes = getAbcNotes(abcInput,style);

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
    var useBarForDraw = document.getElementById('useBarForDraw').checked

    var theTab;

    for (var i = 0; i < notes.length; ++i) {

        var index = notes[i].index + insertedTotal;

        var glyph = notes[i].glyph;

        var glyphLen = glyph.length;

        var buttonNumber = glyph.substr(0,1);

        var direction = glyph.substr(1,glyphLen-1);

        if (glyph.indexOf("10") == 0){
            buttonNumber = glyph.substr(0,2);
            direction = glyph.substr(2,glyphLen-1);
        }

        if (useBarForDraw){

            switch (location){

                // Above
                case 0:

                    if (direction == PUSH_NAME){

                        // Add double quotes to fingering, to be rendered above the note
                        theTab = "\"^" + buttonNumber + "\"";

                    }
                    else{

                        var len = buttonNumber.length;
                        var theBar = "";
                        for (var j=0;j<len;++j){
                            theBar += "_";
                        }
                        
                        // Chrome and Safari have wide numbers in circles
                        if (gIsChrome || gIsSafari){

                            switch (buttonNumber){
                                case "①":
                                case "②":
                                case "③":
                                case "④":
                                case "⑤":
                                case "⑥":
                                case "⑦":
                                case "⑧":
                                case "⑨":
                                case "⑩":
                                case "⑪":
                                    theBar+= "_";
                                    break;
                            }
                        }

                        theTab = "\"^" + theBar + ";";
                        theTab = theTab + buttonNumber + "\"";
                       
                    }

                    break;

                // Below
                case 1:

                    if (direction == PUSH_NAME){

                        // Add double quotes to fingering, to be rendered below the note
                        theTab = "\"_" + " " + ";" +  buttonNumber + "\"";

                    }
                    else{

                        var len = buttonNumber.length;
                        var theBar = "";
                        for (var j=0;j<len;++j){
                            theBar += "_";
                        }
                       
                        // Chrome and Safari have wide numbers in circles
                        if (gIsChrome || gIsSafari){

                            switch (buttonNumber){
                                case "①":
                                case "②":
                                case "③":
                                case "④":
                                case "⑤":
                                case "⑥":
                                case "⑦":
                                case "⑧":
                                case "⑨":
                                case "⑩":
                                case "⑪":
                                    theBar+= "_";
                                    break;
                            }
                        }
                        
                        theTab = "\"_" + theBar + ";";
                        theTab = theTab + buttonNumber + "\"";
                       
                    }

                    break;
                    
                    case 2:

                    if (direction == PUSH_NAME){

                        // Add double quotes to fingering, to be rendered below the note
                        theTab = "\"_" + " " + ";" +  buttonNumber + "\"";

                    }
                    else{

                        var len = buttonNumber.length;
                        var theBar = "";
                        for (var j=0;j<len;++j){
                            theBar += "_";
                        }
                       
                        // Chrome and Safari have wide numbers in circles
                        if (gIsChrome || gIsSafari){

                            switch (buttonNumber){
                                case "①":
                                case "②":
                                case "③":
                                case "④":
                                case "⑤":
                                case "⑥":
                                case "⑦":
                                case "⑧":
                                case "⑨":
                                case "⑩":
                                case "⑪":
                                    theBar+= "_";
                                    break;
                            }
                        }
                        
                        theTab = "\"_" + theBar + ";";
                        theTab = theTab + buttonNumber + "\"";
                       
                    }

                    break;
                    
                   
                    
                    
              
                        
                        // Chrome and Safari have wide numbers in circles
                        if (gIsChrome || gIsSafari){

                            switch (buttonNumber){
                                case "①":
                                case "②":
                                case "③":
                                case "④":
                                case "⑤":
                                case "⑥":
                                case "⑦":
                                case "⑧":
                                case "⑨":
                                case "⑩":
                                case "⑪":
                                    theBar+= "_";
                                    break;
                            }
                        }

                        theTab = "\"^" + theBar + ";";
                        theTab = theTab + buttonNumber + "\"";
                       
                    }

                    break;

                // Below
                case 4:

                    if (direction == PUSH_NAME){

                        // Add double quotes to fingering, to be rendered below the note
                        theTab = "\"_" + " " + ";" +  buttonNumber + "\"";

                    }
                    else{

                        var len = buttonNumber.length;
                        var theBar = "";
                        for (var j=0;j<len;++j){
                            theBar += "_";
                        }
                       
                        // Chrome and Safari have wide numbers in circles
                        if (gIsChrome || gIsSafari){

                            switch (buttonNumber){
                                case "①":
                                case "②":
                                case "③":
                                case "④":
                                case "⑤":
                                case "⑥":
                                case "⑦":
                                case "⑧":
                                case "⑨":
                                case "⑩":
                                case "⑪":
                                    theBar+= "_";
                                    break;
                            }
                        }
                        
                        theTab = "\"_" + theBar + ";";
                        theTab = theTab + buttonNumber + "\"";
                       
                    }

                    break;
                    
                    case 5:

                    if (direction == PUSH_NAME){

                        // Add double quotes to fingering, to be rendered below the note
                        theTab = "\"_" + " " + ";" +  buttonNumber + "\"";

                    }
                    else{

                        var len = buttonNumber.length;
                        var theBar = "";
                        for (var j=0;j<len;++j){
                            theBar += "_";
                        }
                       
                        // Chrome and Safari have wide numbers in circles
                        if (gIsChrome || gIsSafari){

                            switch (buttonNumber){
                                case "①":
                                case "②":
                                case "③":
                                case "④":
                                case "⑤":
                                case "⑥":
                                case "⑦":
                                case "⑧":
                                case "⑨":
                                case "⑩":
                                case "⑪":
                                    theBar+= "_";
                                    break;
                            }
                        }
                        
                        theTab = "\"_" + theBar + ";";
                        theTab = theTab + buttonNumber + "\"";
                       
                    }

                    break;
                      }
                
                      case 3:

                    if (direction == PUSH_NAME){

                        // Add double quotes to fingering, to be rendered above the note
                        theTab = "\"^" + buttonNumber + "\"";

                    }
                    else{

                        var len = buttonNumber.length;
                        var theBar = "";
                        for (var j=0;j<len;++j){
                            theBar += "_";
                        }
                    
                   
                    
                    
                }
        }
        else{

            switch (location){

                // Above
                case 0:
                    // Add double quotes to tab, to be rendered above the note
                    theTab = "\"^" + buttonNumber + ";";

                    theTab = theTab + direction + "\"";

                    break;

                // Below
                case 1:

                    // Add double quotes to tab, to be rendered below the note
                    theTab = "\"_" + buttonNumber + ";";

                    theTab = theTab + direction + "\"";

                    break;
                    
                    case 2:

                    // Add double quotes to tab, to be rendered below the note
                    theTab = "\"_" + buttonNumber + ";";

                    theTab = theTab + direction + "\"";

                    
                    

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
function getNoteGlyph(note,style){

    switch (style){

        
        case 0:

            var glyph_map = {
            //DG3
                  
                "^G,": "①"+PUSH_NAME,
                "_A,": "①"+PUSH_NAME,
                "F,":  "1"+PUSH_NAME,
                "A,": "②"+PUSH_NAME,
                "D,":  "2"+PUSH_NAME,
                "_B,": "①"+DRAW_NAME,
                "^A,": "①"+DRAW_NAME,
                "_E,":  "1"+DRAW_NAME,
                "^D,":  "1"+DRAW_NAME,
                "^C,": "②"+DRAW_NAME,
                "_D,": "②"+DRAW_NAME,
                "^F,":  "2"+DRAW_NAME,
                "_G,":  "2"+DRAW_NAME,
                "G":   "3"+PUSH_NAME,
                "E":  "③"+DRAW_NAME,
                "A":   "3"+DRAW_NAME,
                "^F":  "④"+PUSH_NAME,
                "_G":  "④"+PUSH_NAME,
                "B":   "4"+PUSH_NAME,
                "C":   "4"+DRAW_NAME,
                "A":  "⑤"+PUSH_NAME,
                "B":   "5"+PUSH_NAME,
                "B":  "⑤"+DRAW_NAME,
                "E":   "5"+DRAW_NAME,
                "^C":  "⑥"+DRAW_NAME,
                "_D":  "⑥"+DRAW_NAME,
                "E":   "6"+DRAW_NAME,
                "G":   "6"+PUSH_NAME,
                "e":  "⑦"+DRAW_NAME,
                "a":   "7"+DRAW_NAME,
                "^f":  "⑦"+PUSH_NAME,
                "_g":  "⑦"+PUSH_NAME,
                "b":   "7"+PUSH_NAME,
                "c":   "8"+DRAW_NAME,
                "a":  "⑧"+PUSH_NAME,
                "d":   "8"+PUSH_NAME,
                "b":  "⑨"+DRAW_NAME,
                "e":   "9"+DRAW_NAME,
                "^c":  "⑩"+DRAW_NAME,
                "_d":  "⑩"+DRAW_NAME,
                "^f":   "10"+DRAW_NAME,
                "_g":   "10"+DRAW_NAME,
                "g'":  "9"+PUSH_NAME,
                "e'": "⑪"+DRAW_NAME,
                "b'": "⑩"+PUSH_NAME,
                "^f'":  "10"+PUSH_NAME,
                "_g'":  "10"+PUSH_NAME,
                "a'": "⑪"+PUSH_NAME
            
              
            };

            var thisGlyph = glyph_map[note];

            if (!thisGlyph){
                return "x ";
            }

        break;


        // GC3
        case 1:
            
            var glyph_map = {
              //DG4
                 "^G,": "①"+PUSH_NAME,
                "_A,": "①"+PUSH_NAME,
                "F,":  "1"+PUSH_NAME,
                "^F,": "②"+PUSH_NAME,
                "_G,": "②"+PUSH_NAME,
                "D,":  "2"+PUSH_NAME,
                "_B,": "①"+DRAW_NAME,
                "^A,": "①"+DRAW_NAME,
                "_E,":  "1"+DRAW_NAME,
                "^D,":  "1"+DRAW_NAME,
                "A,": "②"+DRAW_NAME,
                "B,":  "2"+DRAW_NAME,
                "D":   "3"+PUSH_NAME,
                "^C":  "③"+DRAW_NAME,
                "_D":  "③"+DRAW_NAME,
                "^F":   "3"+DRAW_NAME,
                "_G":   "3"+DRAW_NAME,
                "D":  "④"+PUSH_NAME,
                "G":   "4"+PUSH_NAME,
                "A":   "4"+DRAW_NAME,
                "^F":  "⑤"+PUSH_NAME,
                "_G":  "⑤"+PUSH_NAME,
                "B":   "5"+PUSH_NAME,
                "G":  "⑤"+DRAW_NAME,
                "C":   "5"+DRAW_NAME,
                "B":  "⑥"+DRAW_NAME,
                "E":   "6"+DRAW_NAME,
                "d":   "6"+PUSH_NAME,
                "^c":  "⑦"+DRAW_NAME,
                "_d":  "⑦"+DRAW_NAME,
                "^f":   "7"+DRAW_NAME,
                "_g":   "7"+DRAW_NAME,
                "d":  "⑦"+PUSH_NAME,
                "g":   "7"+PUSH_NAME,
                "a":   "8"+DRAW_NAME,
                "^f":  "⑧"+PUSH_NAME,
                "_g":  "⑧"+PUSH_NAME,
                "b":   "8"+PUSH_NAME,
                "g":  "⑨"+DRAW_NAME,
                "c":   "9"+DRAW_NAME,
                "b":  "⑩"+DRAW_NAME,
                "e":   "10"+DRAW_NAME,
                "d'":  "9"+PUSH_NAME,
                "^c'": "⑪"+DRAW_NAME,
                "_d'": "⑪"+DRAW_NAME,
                "d'": "⑩"+PUSH_NAME,
                "g'":  "10"+PUSH_NAME,
                "^f'": "⑪"+PUSH_NAME,
                "_g'": "⑪"+PUSH_NAME
            
            
            };

            var thisGlyph = glyph_map[note];

            if (!thisGlyph){
                return "x ";
            }

        break;
        
        case 2:
       
         var glyph_map = {
         
         //GC3
               "^C,": "①"+PUSH_NAME,
                "_D,": "①"+PUSH_NAME,
                "^A,":  "1"+PUSH_NAME,
                 "_B,":  "1"+PUSH_NAME,
                "D,": "②"+PUSH_NAME,
                "G,":  "2"+PUSH_NAME,
                "^D,": "①"+DRAW_NAME,
                "_E,": "①"+DRAW_NAME,
                "^G,":  "1"+DRAW_NAME,
                 "_A,":  "1"+DRAW_NAME,
                "^F,": "②"+DRAW_NAME,
                "_G,": "②"+DRAW_NAME,
                "B,":  "2"+DRAW_NAME,
                "C":   "3"+PUSH_NAME,
                "G":  "③"+DRAW_NAME,
                "D":   "3"+DRAW_NAME,
                "B":  "④"+PUSH_NAME,
                "E":   "4"+PUSH_NAME,
                "F":   "4"+DRAW_NAME,
                "D":  "⑤"+PUSH_NAME,
                "G":   "5"+PUSH_NAME,
                "E":  "⑤"+DRAW_NAME,
                "A":   "5"+DRAW_NAME,
                "^F":  "⑥"+DRAW_NAME,
                "_G":  "⑥"+DRAW_NAME,
                "B" :   "6"+DRAW_NAME,
                "c":   "6"+PUSH_NAME,
                "a":  "⑦"+DRAW_NAME,
                "d":   "7"+DRAW_NAME,
                "b":  "⑦"+PUSH_NAME,
                "e":   "7"+PUSH_NAME,
                "f":   "8"+DRAW_NAME,
                "D":  "⑧"+PUSH_NAME,
                "g":   "8"+PUSH_NAME,
                "e":  "⑨"+DRAW_NAME,
                "a":   "9"+DRAW_NAME,
                "^f":  "⑩"+DRAW_NAME,
                "_g":  "⑩"+DRAW_NAME,
                "b":   "10"+DRAW_NAME,
                "c'":  "9"+PUSH_NAME,
                "a'": "⑪"+DRAW_NAME,
                "b'": "⑩"+PUSH_NAME,
                "e'":  "10"+PUSH_NAME,
                "d'": "⑪"+PUSH_NAME,
    
            };

            var thisGlyph = glyph_map[note];

            if (!thisGlyph){
                return "x ";
                
            }
            
             case 3:
            //DG3 Btab
             var glyph_map = {
                "^G,": "1"+PUSH_NAME,
                "_A,": "1"+PUSH_NAME,
                "F,":  "2"+PUSH_NAME,
                "A,": "2"+PUSH_NAME,
                "D,":  "4"+PUSH_NAME,
                "_B,": "1"+DRAW_NAME,
                "^A,": "1"+DRAW_NAME,
                "_E,":  "2"+DRAW_NAME,
                "^D,":  "2"+DRAW_NAME,
                "^C,": "3"+DRAW_NAME,
                "_D,": "3"+DRAW_NAME,
                "^F,":  "4"+DRAW_NAME,
                "_G,":  "4"+DRAW_NAME,
                "G":   "6"+PUSH_NAME,
                "E":  "5"+DRAW_NAME,
                "A":   "6"+DRAW_NAME,
                "^F":  "7"+PUSH_NAME,
                "_G":  "7"+PUSH_NAME,
                "B":   "8"+PUSH_NAME,
                "C":   "8"+DRAW_NAME,
                "A":  "9"+PUSH_NAME,
                "B":   "10"+PUSH_NAME,
                "B":  "9"+DRAW_NAME,
                "E":   "10"+DRAW_NAME,
                "^C":  "11"+DRAW_NAME,
                "_D":  "11"+DRAW_NAME,
                "E":   "10"+DRAW_NAME,
                "G":   "12"+PUSH_NAME,
                "e":  "13"+DRAW_NAME,
                "a":   "14"+DRAW_NAME,
                "^f":  "13"+PUSH_NAME,
                "_g":  "13"+PUSH_NAME,
                "b":   "14"+PUSH_NAME,
                "c":   "8"+DRAW_NAME,
                "a":  "15"+PUSH_NAME,
                "d":   "16"+PUSH_NAME,
                "b":  "17"+DRAW_NAME,
                "e":   "18"+DRAW_NAME,
                "^c":  "19"+DRAW_NAME,
                "_d":  "19"+DRAW_NAME,
                "^f":   "20"+DRAW_NAME,
                "_g":   "20"+DRAW_NAME,
                "g'":  "9"+PUSH_NAME,
                "e'": "21"+DRAW_NAME,
                "b'": "19"+PUSH_NAME,
                "^f'":  "20"+PUSH_NAME,
                "_g'":  "20"+PUSH_NAME,
                "a'": "21"+PUSH_NAME
               
                 };

            var thisGlyph = glyph_map[note];

            if (!thisGlyph){
                return "x ";
            }

                
                
                case 4:
              //DG4 Btab
               var glyph_map = {
                 "^G,": "1"+PUSH_NAME,
                "_A,": "1"+PUSH_NAME,
                "F,":  "2"+PUSH_NAME,
                "^F,": "3"+PUSH_NAME,
                "_G,": "3"+PUSH_NAME,
                "D,":  "4"+PUSH_NAME,
                "_B,": "1"+DRAW_NAME,
                "^A,": "1"+DRAW_NAME,
                "_E,":  "2"+DRAW_NAME,
                "^D,":  "2"+DRAW_NAME,
                "A,": "3"+DRAW_NAME,
                "B,":  "4"+DRAW_NAME,
                "D":   "6"+PUSH_NAME,
                "^C":  "5"+DRAW_NAME,
                "_D":  "5"+DRAW_NAME,
                "^F":   "6"+DRAW_NAME,
                "_G":   "6"+DRAW_NAME,
                "D":  "7"+PUSH_NAME,
                "G":   "8"+PUSH_NAME,
                "A":   "8"+DRAW_NAME,
                "^F":  "9"+PUSH_NAME,
                "_G":  "9"+PUSH_NAME,
                "B":   "10"+PUSH_NAME,
                "G":  "9"+DRAW_NAME,
                "C":   "10"+DRAW_NAME,
                "B":  "11"+DRAW_NAME,
                "E":   "12"+DRAW_NAME,
                "d":   "12"+PUSH_NAME,
                "^c":  "13"+DRAW_NAME,
                "_d":  "13"+DRAW_NAME,
                "^f":   "14"+DRAW_NAME,
                "_g":   "14"+DRAW_NAME,
                "d":  "13"+PUSH_NAME,
                "g":   "14"+PUSH_NAME,
                "a":   "16"+DRAW_NAME,
                "^f":  "15"+PUSH_NAME,
                "_g":  "15"+PUSH_NAME,
                "b":   "16"+PUSH_NAME,
                "g":  "17"+DRAW_NAME,
                "c":   "18"+DRAW_NAME,
                "b":  "19"+DRAW_NAME,
                "e":   "20"+DRAW_NAME,
                "d'":  "18"+PUSH_NAME,
                "^c'": "21"+DRAW_NAME,
                "_d'": "21"+DRAW_NAME,
                "d'": "19"+PUSH_NAME,
                "g'":  "20"+PUSH_NAME,
                "^f'": "21"+PUSH_NAME,
                "_g'": "21"+PUSH_NAME
                
                  };

            var thisGlyph = glyph_map[note];

            if (!thisGlyph){
                return "x ";
            }

                
                 
                case 5:
				//GC3 Btab
				 var glyph_map = {
               "^C,": "1"+PUSH_NAME,
                "_D,": "1"+PUSH_NAME,
                "^A,":  "2"+PUSH_NAME,
                "_B,":  "2"+PUSH_NAME,
                "D,": "3"+PUSH_NAME,
                "G,":  "4"+PUSH_NAME,
                "^D,": "1"+DRAW_NAME,
                "_E,": "1"+DRAW_NAME,
                "^G,":  "2"+DRAW_NAME,
                "_A,":  "2"+DRAW_NAME,
                "^F,": "3"+DRAW_NAME,
                "_G,": "3"+DRAW_NAME,
                "B,":  "4"+DRAW_NAME,
                "C":   "6"+PUSH_NAME,
                "G":  "5"+DRAW_NAME,
                "D":   "6"+DRAW_NAME,
                "B":  "7"+PUSH_NAME,
                "E":   "8"+PUSH_NAME,
                "F":   "8"+DRAW_NAME,
                "D":  "9"+PUSH_NAME,
                "G":   "10"+PUSH_NAME,
                "E":  "9"+DRAW_NAME,
                "A":   "10"+DRAW_NAME,
                "^F":  "11"+DRAW_NAME,
                "_G":  "11"+DRAW_NAME,
                "B" :   "12"+DRAW_NAME,
                "c":   "12"+PUSH_NAME,
                "a":  "13"+DRAW_NAME,
                "d":   "14"+DRAW_NAME,
                "b":  "13"+PUSH_NAME,
                "e":   "14"+PUSH_NAME,
                "f":   "16"+DRAW_NAME,
                "D":  "15"+PUSH_NAME,
                "g":   "16"+PUSH_NAME,
                "e":  "17"+DRAW_NAME,
                "a":   "18"+DRAW_NAME,
                "^f":  "19"+DRAW_NAME,
                "_g":  "19"+DRAW_NAME,
                "b":   "20"+DRAW_NAME,
                "c'":  "18"+PUSH_NAME,
                "a'": "21"+DRAW_NAME,
                "b'": "19"+PUSH_NAME,
                "e'":  "20"+PUSH_NAME,
                "d'": "21"+PUSH_NAME,
                
                  };

            var thisGlyph = glyph_map[note];

            if (!thisGlyph){
                return "x ";
            }

        break;
        
        
    }

    return thisGlyph;

}

// Returns an array of Notes from the ABC string input
function getAbcNotes(input,style) {

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
            
            var theGlyph = getNoteGlyph(normalizedValue,style);

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
// Strip all comments and comment-based annotations in the ABC
//
function stripAllComments(theNotes) {

    // Strip out anything that looks like a comment
    var searchRegExp = /%.*[\r\n]*/gm
    theNotes = theNotes.replace(searchRegExp, "");

    return theNotes;

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
// Idle the tab location control
//
function idleTabLocation() {

    // Idle the strip chords control visiblity based on the tab location
    var tabLocation = document.getElementById('tab_location').selectedIndex;

    if (tabLocation == 1){

        document.getElementById('stripChordsHolder').style.display = "block";

    }
    else{

        document.getElementById('stripChordsHolder').style.display = "none";

    }
}

// Glyph(s) to use for the bellows push or draw indication
var PUSH_NAME = "↓";
var DRAW_NAME = "↑";

//
// Main processor
//
function generateTablature() {

    // Get the preferred glyphs for push and raw
    PUSH_NAME = document.getElementById('push_glyph').value;
    DRAW_NAME = document.getElementById('draw_glyph').value;

    var theABC = document.getElementById('input').value;

    var nTunes = countTunes(theABC);

    var injectVolumes = document.getElementById('injectVolumes').checked;
    var stripChords = document.getElementById('stripChords').checked;

    var fontFamily = document.getElementById('font_family').value
    var titleFontSize = document.getElementById('title_font_size').value;
    var subtitleFontSize = document.getElementById('subtitle_font_size').value;
    var infoFontSize = document.getElementById('info_font_size').value;
    var tabFontSize = document.getElementById('tab_font_size').value;
    var musicSpace = document.getElementById('music_space').value
    var staffSep = document.getElementById('staff_sep').value;
    var tabLocation = document.getElementById('tab_location').selectedIndex;

    var result = "";

    for (var i = 0; i < nTunes; ++i) {

        var thisTune = getTuneByIndex(theABC, i);

        thisTune = stripAllComments(thisTune);

        if ((tabLocation == 0) || ((tabLocation == 1) && (stripChords))){
            thisTune = StripChords(thisTune);
        }

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
        gSaveFilename = "box_tab";
    }

    var thePlaceholder = gSaveFilename;

    // B/C or C#/D?
    var style = document.getElementById('layout').selectedIndex;

    switch (style){

        // B/C
        case 0:
            thePlaceholder += "_BC.abc";
            break;

        // C#D
        case 1:
           thePlaceholder += "_CsD.abc";
            break;
    }


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

    return "http://michaeleskin.com/abctools/abctools.html";

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

    var shareName = "Irish_Box_BC_Tablature_Test";

    var index = document.getElementById('layout').selectedIndex;
    var options = document.getElementById('layout').options;
    var val = options[index].value;

    if (val == "CD") {

        shareName = "Irish_Box_CD_Tablature_Test";

    }

    var abcInLZW = LZString.compressToEncodedURIComponent(abcText);

    var ssp = document.getElementById('staff_sep').value;

    var url = "http://michaeleskin.com/abctools/abctools.html?lzw=" + abcInLZW + "&format=noten&ssp=45&pdf=one&pn=br&fp=yes&btfs=10&name=" + shareName;

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
    document.getElementById('tab_font_size').value = 11;
    document.getElementById('staff_sep').value = 80;
    document.getElementById('music_space').value = 10;
    document.getElementById('layout').selectedIndex = 0;
    document.getElementById('tab_location').selectedIndex = 0;
    document.getElementById('push_glyph').value = "↓";
    document.getElementById('draw_glyph').value = "↑";
    document.getElementById('useBarForDraw').checked = false;

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
