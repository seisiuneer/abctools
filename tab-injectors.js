//
// app-anglo-fingerings.js
//
// ABC Muscial Notation Converter for Anglo Concertina
//
// This version for integration into the ABC Transcription Tools
//
// Annotates an ABC format tune with semi-optimal fingerings
// for the Anglo Concertina.
//
// This code is a fork of the original Anglo Concertina fingering utility at:
//
// https://jvandonsel.github.io/fingering/fingering.html
//
// Updated and extended 19 July 2023 by: 
//
// Michael Eskin
// https://michaeleskin.com
//
// Copyright (c) 2013 James van Donsel
//
// Released under CC0 - No Rights Reserved
// https://creativecommons.org/share-your-work/public-domain/cc0/
//

//
// Put the whole thing in a function for isolation
//
var angloFingeringsGenerator = function (theABC, callback){

    var gAngloVerbose = false;

    var abcOutput = "";


    // Button constructor
    var Button = function(name, notes, cost, finger) {
        this.name = name;
        this.notes = notes;
        this.cost = cost;
        this.finger = finger;
    };

    // Button maps
    // Lower cost means button is preferred
    // Notes are [PUSH, DRAW].
    var PUSH_INDEX = 0;
    var DRAW_INDEX = 1;

    var baseMapOriginal = {

        // Top row, LH
        "L1a": new Button("L1a", ["E,", "F,"], 10, "l4"),
        "L2a": new Button("L2a", ["A,", "_B,"], 10, "l4"),
        "L3a": new Button("L3a", ["^C", "_E"], 10, "l3"),
        "L4a": new Button("L4a", ["A", "G"], 10, "l2"),
        "L5a": new Button("L5a", ["^G", "_B"], 10, "l1"),

        // Middle row, LH
        "L1": new Button("L1", ["C,", "G,"], 1, "l4"),
        "L2": new Button("L2", ["G,", "B,"], 1, "l4"),
        "L3": new Button("L3", ["C", "D"], 1, "l3"),
        "L4": new Button("L4", ["E", "F"], 1, "l2"),
        "L5": new Button("L5", ["G", "A"], 1, "l1"),

        // Bottom row, LH
        "L6": new Button("L6", ["B,", "A,"], 1, "l4"),
        "L7": new Button("L7", ["D", "^F"], 2, "l4"),
        "L8": new Button("L8", ["G", "A"], 2, "l3"),
        "L9": new Button("L9", ["B", "c"], 2, "l2"),
        "L10": new Button("L10", ["d", "e"], 2, "l1"),

        // Middle row, RH
        "R1": new Button("R1", ["c", "B"], 1, "r1"),
        "R2": new Button("R2", ["e", "d"], 1, "r2"),
        "R3": new Button("R3", ["g", "f"], 2, "r3"),
        "R4": new Button("R4", ["c'", "a"], 2, "r4"),
        "R5": new Button("R5", ["e'", "b"], 2, "r4"),

        // Bottom row, RH
        "R6": new Button("R6", ["g", "^f"], 1, "r1"),
        "R7": new Button("R7", ["b", "a"], 1, "r2"),
        "R8": new Button("R8", ["d'", "c'"], 1, "r3"),
        "R9": new Button("R9", ["g'", "e'"], 1, "r4"),
        "R10": new Button("R10", ["b'", "^f'"], 1, "r4")

    };

    //
    // Cross-row map for Wheatstone
    //
    // Original values commented out
    //
    // Prefers:
    // Press d' on the left G row
    // Draw e' on the left G row
    //
    //

    var baseMapCrossRowWheatstone = {

        // Top row, LH
        "L1a": new Button("L1a", ["E,", "F,"], 10, "l4"),
        "L2a": new Button("L2a", ["A,", "_B,"], 10, "l4"),
        "L3a": new Button("L3a", ["^C", "_E"], 10, "l3"),
        "L4a": new Button("L4a", ["A", "G"], 10, "l2"),
        "L5a": new Button("L5a", ["^G", "_B"], 10, "l1"),

        // Middle row, LH
        "L1": new Button("L1", ["C,", "G,"], 1, "l4"),
        "L2": new Button("L2", ["G,", "B,"], 1, "l4"),
        "L3": new Button("L3", ["C", "D"], 1, "l3"),
        "L4": new Button("L4", ["E", "F"], 1, "l2"),
        "L5": new Button("L5", ["G", "A"], 1, "l1"),

        // Bottom row, LH
        "L6": new Button("L6", ["B,", "A,"], 1, "l4"),
        "L7": new Button("L7", ["D", "^F"], 2, "l4"),
        "L8": new Button("L8", ["G", "A"], 2, "l3"),
        "L9": new Button("L9", ["B", "c"], 2, "l2"),
        "L10": new Button("L10", ["d", "e"], 1, "l1"),

        // Middle row, RH
        "R1": new Button("R1", ["c", "B"], 1, "r1"),
         "R2": new Button("R2", ["e", "d"], 2, "r2"),
        "R3": new Button("R3", ["g", "f"], 2, "r3"),
        "R4": new Button("R4", ["c'", "a"], 2, "r4"),
        "R5": new Button("R5", ["e'", "b"], 2, "r4"),

        // Bottom row, RH
        "R6": new Button("R6", ["g", "^f"], 1, "r1"),
        "R7": new Button("R7", ["b", "a"], 1, "r2"),
        "R8": new Button("R8", ["d'", "c'"], 1, "r3"),
        "R9": new Button("R9", ["g'", "e'"], 1, "r4"),
        "R10": new Button("R10", ["b'", "^f'"], 1, "r4")

    };

    //
    // My preferred fingering map for Cross-Row playing
    //
    // Prefers:
    // Draw B on right C row
    // Draw c' on the left G row
    // Press d' on the left G row
    // Draw e' on the left G row
    //

    var baseMapCrossRow = {

        // Top row, LH
        "L1a": new Button("L1a", ["E,", "F,"], 10, "l4"),
        "L2a": new Button("L2a", ["A,", "_B,"], 10, "l4"), 
        "L3a": new Button("L3a", ["^C", "_E"], 10, "l3"),
        "L4a": new Button("L4a", ["A", "G"], 10, "l2"),
        "L5a": new Button("L5a", ["^G", "_B"], 10, "l1"),

        // Middle row, LH
        "L1": new Button("L1", ["C,", "G,"], 1, "l4"),
        "L2": new Button("L2", ["G,", "B,"], 1, "l4"),
        "L3": new Button("L3", ["C", "D"], 1, "l3"),
        "L4": new Button("L4", ["E", "F"], 1, "l2"),
        "L5": new Button("L5", ["G", "A"], 1, "l1"),

        // Bottom row, LH
        "L6": new Button("L6", ["B,", "A,"], 1, "l4"), 
        "L7": new Button("L7", ["D", "^F"], 2, "l4"),
        "L8": new Button("L8", ["G", "A"], 2, "l3"),
        "L9": new Button("L9", ["B", "z"], 2, "l2"),
        "L9a": new Button("L9", ["z", "c"], 1, "l2"),
        "L10": new Button("L10", ["d", "e"], 1, "l1"),

        // Middle row, RH
        "R1": new Button("R1", ["c", "x"], 2, "r1"),
        "R1x": new Button("R1",["x", "B"], 1, "r1"),
        "R2": new Button("R2", ["e", "d"], 2, "r2"),
        "R3": new Button("R3", ["g", "f"], 2, "r3"),
        "R4": new Button("R4", ["c'", "a"], 2, "r4"),
        "R5": new Button("R5", ["e'", "b"], 2, "r4"),

        // Bottom row, RH
        "R6": new Button("R6", ["g", "^f"], 1, "r1"),
        "R7": new Button("R7", ["b", "a"], 1, "r2"),
        "R8": new Button("R8", ["d'", "c'"], 1, "r3"),
        "R9": new Button("R9", ["g'", "e'"], 1, "r4"),
        "R10": new Button("R10", ["b'", "^f'"], 1, "r4")

    };

    var jeffriesRxMapOriginal = {
        // Top row, RH
        "R1a": new Button("R1a", ["^d", "^c"], 1, "r1"),
        "R2a": new Button("R2a", ["^c", "^d"], 10, "r2"),
        "R3a": new Button("R3a", ["^g", "g"], 10, "r3"),
        "R4a": new Button("R4a", ["^c'", "_b"], 10, "r4"),
        "R5a": new Button("R5a", ["a", "d'"], 10, "r4")
    };

    // Prefers a R2a press C#
    var jeffriesRxMapAlt = {
        // Top row, RH
        "R1a": new Button("R1a", ["^d", "^c"], 10, "r1"),
        "R2a": new Button("R2a", ["^c", "^d"], 1, "r2"),
        "R3a": new Button("R3a", ["^g", "g"], 10, "r3"),
        "R4a": new Button("R4a", ["^c'", "_b"], 10, "r4"),
        "R5a": new Button("R5a", ["a", "d'"], 10, "r4")
    };

    var wheatstoneRxMapOriginal = {
        // Top row, RH
        "R1a": new Button("R1a", ["^c", "^d"], 10, "r1"),
        "R2a": new Button("R2a", ["a", "g"], 10, "r2"),
        "R3a": new Button("R3a", ["^g", "_b"], 10, "r3"),
        "R4a": new Button("R4a", ["^c'", "_e'"], 10, "r4"),
        "R5a": new Button("R5a", ["a", "f'"], 10, "r4"),
    };
    

    var gAngloButtonNames_GaryCoover = [

        // Top row, LH
        "1a",
        "2a",
        "3a",
        "4a",
        "5a",

        // Top row, RH
        "1a",
        "2a",
        "3a",
        "4a",
        "5a",

        // Middle row, LH
        "1",
        "2",
        "3",
        "4",
        "5",

        // Middle row, RH
        "1",
        "2",
        "3",
        "4",
        "5",

        // Bottom row, LH
        "6",
        "7",
        "8",
        "9",
        "10",

        // Bottom row, RH
        "6",
        "7",
        "8",
        "9",
        "10"
    ];

    // Initialization of the original button map
    var jeffriesMap = null;
    var wheatstoneMap = null;
    var buttonToNoteMap = null;
    var buttonMapIndex = null;

    //
    // Process the button naming matrix at tab build time
    //
    function processButtonNoteNames(map){

        var originalButtonNames = gAngloButtonNames;

        if (gInjectTab_GaryCoover){
            gAngloButtonNames = gAngloButtonNames_GaryCoover;
        }

        // Top row
        map["L1a"].name = gAngloButtonNames[0];
        map["L2a"].name = gAngloButtonNames[1];
        map["L3a"].name = gAngloButtonNames[2];
        map["L4a"].name = gAngloButtonNames[3];
        map["L5a"].name = gAngloButtonNames[4];
        map["R1a"].name = gAngloButtonNames[5];
        map["R2a"].name = gAngloButtonNames[6];
        map["R3a"].name = gAngloButtonNames[7];
        map["R4a"].name = gAngloButtonNames[8];
        map["R5a"].name = gAngloButtonNames[9];

        // Middle row
        map["L1"].name = gAngloButtonNames[10];
        map["L2"].name = gAngloButtonNames[11];
        map["L3"].name = gAngloButtonNames[12];
        map["L4"].name = gAngloButtonNames[13];
        map["L5"].name = gAngloButtonNames[14];
        map["R1"].name = gAngloButtonNames[15];

        // Special case
        if (map["R1x"]){
            map["R1x"].name = gAngloButtonNames[15];
        }

        map["R2"].name = gAngloButtonNames[16];
        map["R3"].name = gAngloButtonNames[17];
        map["R4"].name = gAngloButtonNames[18];
        map["R5"].name = gAngloButtonNames[19];

        // Bottom row
        map["L6"].name = gAngloButtonNames[20];
        map["L7"].name = gAngloButtonNames[21];
        map["L8"].name = gAngloButtonNames[22];
        map["L9"].name = gAngloButtonNames[23];

         // Special case
        if (map["L9a"]){
            map["L9a"].name = gAngloButtonNames[23];
        }
       
        map["L10"].name = gAngloButtonNames[24];
        map["R6"].name = gAngloButtonNames[25];
        map["R7"].name = gAngloButtonNames[26];
        map["R8"].name = gAngloButtonNames[27];
        map["R9"].name = gAngloButtonNames[28];
        map["R10"].name = gAngloButtonNames[29];

        // Restore the original map
        if (gInjectTab_GaryCoover){
            gAngloButtonNames = originalButtonNames;
        }

        return map;
    }

    // 
    // Called at solution generation time
    //
    function setButtonToNoteMap() {

        var baseMapIndex = parseInt(gInjectTab_ConcertinaFingering);

        jeffriesMap = [];
        wheatstoneMap = [];

        switch (baseMapIndex) {

            // Original
            case 0:

                for (var x in jeffriesRxMapAlt) {
                    jeffriesMap[x] = jeffriesRxMapAlt[x];
                }

                for (var x in wheatstoneRxMapOriginal) {
                    wheatstoneMap[x] = wheatstoneRxMapOriginal[x];
                }

                for (var x in baseMapOriginal) {
                    jeffriesMap[x] = baseMapOriginal[x];
                    wheatstoneMap[x] = baseMapOriginal[x];
                }

                break;

            // Cross-row
            case 1:

                for (var x in jeffriesRxMapAlt) {
                    jeffriesMap[x] = jeffriesRxMapAlt[x];
                }

                for (var x in wheatstoneRxMapOriginal) {
                    wheatstoneMap[x] = wheatstoneRxMapOriginal[x];
                }

                for (var x in baseMapCrossRow) {
                    jeffriesMap[x] = baseMapCrossRow[x];
                }

                for (var x in baseMapCrossRow) {
                      wheatstoneMap[x] = baseMapCrossRow[x];
                }

                break;
        }

        if (parseInt(gInjectTab_ConcertinaStyle) == 0){

            buttonToNoteMap = jeffriesMap;

        }
        else{

            buttonToNoteMap = wheatstoneMap;

        }

        // Inject custom button names
        buttonToNoteMap = processButtonNoteNames(buttonToNoteMap);

    }


    // Globals
    var keySignature = null;
    var bestCost;
    var bestPathFromState = null;
    var stateCount = 0;

    function angloLog(s) {
        if (gAngloVerbose)
            console.log(s);
    }

    function generateAngloFingerings(abcInput) {

        angloLog("Got input:" + abcInput);

        // Make sure the button note map is up to date
        setButtonToNoteMap();

        // Find the key signature in the input
        keySignature = findKeySignature(abcInput);

        if (keySignature == null) {
            return ("ERROR: Unknown or unsupported key signature");
        }

        // Generate an array of note objects. Each
        var notes = getAbcNotes(abcInput);

        // Generate the inverse mapping
        var noteToButtonMap = generateNoteToButtonMap(buttonToNoteMap);

        // Sort the inverse mapping table with the least costly buttons first.
        // This speeds up tree pruning later
        sortButtonMap(noteToButtonMap);

        // Generate a state tree
        var stateTree = generateStateTree(notes, noteToButtonMap);

        var path = chooseFingerings(stateTree);

        if (path == null) {
            angloLog("No fingerings generated!");
            return abcOutput;
        }

        // Merge the chosen fingerings with the ABC notation
        abcOutput = mergeFingerings(abcInput, path, notes);

        return abcOutput;

    }


    // Path constructor.
    //
    // buttons: list of States
    // cost: integer cost of total set of buttons, lower is better
    var Path = function(states, cost) {
        this.states = states;
        this.cost = cost;
    };

    // Note constructor
    var Note = function(index, unNormalizedValue, normalizedValue) {
        this.index = index; // Index of this note in the original ABC input string

        // These values an ABC string like "G" or "^A'"
        // Unnormalized means it's the literal note string from the ABC source.
        this.unNormalizedValue = unNormalizedValue;

        // Normalized means it's adjusted by the key signature and extra decorations are removed.
        this.normalizedValue = normalizedValue;
    };

    // State constructor
    var State = function(note, button, direction) {
        this.note = note;
        this.button = button;
        this.direction = direction;
        this.nextStates = [];
        this.id = stateCount++;

        // This toString() function is needed to make sure this object is unique
        // in a hash map. JS can only use strings as keys in hashes (objects).
        this.toString = function() {
            var s = "[" + this.id + "] Note:";
            if (this.note) {
                s += this.note.normalizedValue;
            } else {
                s += "none";
            }

            s += " Button:" + this.button.name;
            return s;
        };
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

        angloLog("Got base key of '" + keySignatureBase + "' and extra of '" + keyExtra + "'");
        
        // Determine musical mode
        if (keyExtra == "" ||
            keyExtra.search("maj") != -1 ||
            keyExtra.search("ion") != -1) {
            angloLog("Mode: Ionian (major)");
            myMap = keySignatureMap(keySignatureBase, 0);
        } else if (keyExtra.search("mix") != -1) {
            angloLog("Mode: Mixolydian");
            myMap = keySignatureMap(keySignatureBase, 1);
        } else if (keyExtra.search("dor") != -1) {
            angloLog("Mode: Dorian");
            myMap = keySignatureMap(keySignatureBase, 2);
        } else if ((keyExtra.search("m") != -1 && keyExtra.search("mix") == -1) ||
            keyExtra.search("min") != -1 ||
            keyExtra.search("aeo") != -1) {
            angloLog("Mode: Aeolian (minor)");
            myMap = keySignatureMap(keySignatureBase, 3);
        } else if (keyExtra.search("phr") != -1) {
            angloLog("Mode: Phrygian");
            myMap = keySignatureMap(keySignatureBase, 4);
        } else if (keyExtra.search("loc") != -1) {
            angloLog("Mode: Locrian");
            myMap = keySignatureMap(keySignatureBase, 5);
        } else if (keyExtra.search("lyd") != -1) {
            angloLog("Mode: Lydian");
            myMap = keySignatureMap(keySignatureBase, -1);
        } else if (keyExtra.search("exp") != -1) {
            angloLog("(Accidentals to be explicitly specified)");
            myMap = keySignatureMap("C", 0);
        } else {
            // Unknown
            angloLog("Failed to determine key signature mode");
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
            angloLog("Bad tonic: " + tonic);
            return null;
        }

        if (tonic.slice(1) == "b") {
            baseSharpness -= 7;
        } else if (tonic.slice(1) == "#") {
            baseSharpness += 7;
        }

        var totalSharpness = baseSharpness - modeFlatness;

        if (totalSharpness > 7) {
            angloLog("Too many sharps: " + totalSharpness);
            return null;
        } else if (totalSharpness < -7) {
            angloLog("Too many flats: " + (totalSharpness * -1));
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

    // Merges an array of Button objects with an array of Notes
    // with the original string input.
    // Returns a merged string.
    function mergeFingerings(input, path, notes) {

        // Drop the first state of the path - it's a dummy root state
        path.states.shift();

        if (path.states.length != notes.length) {
            return "ERROR: Internal error. Length mismatch";
        }

        var result = input;
        var insertedTotal = 0;

        var location = parseInt(gInjectTab_TabLocation);

        // Button name is in path.states[i].button.finger first character

        for (var i = 0; i < path.states.length; ++i) {

            var index = notes[i].index + insertedTotal;

            var fingering = path.states[i].button.name;

            if (gInjectTab_GaryCoover){

                var finger = path.states[i].button.finger;

                var isLeftSide = (finger.indexOf("l") == 0);

                // Left side is below the staff
                if (isLeftSide){

                    if (path.states[i].direction == PUSH_NAME){

                        // Add double quotes to fingering, to be rendered below the note
                        fingering = "\"_" + " " + ";" + fingering + "\"";

                    }
                    else{

                        var len = fingering.length;
                        var theBar = "";

                        for (var j=0;j<len;++j){
                            theBar += "_";
                        }

                        var origFingering = fingering;
                        fingering = "\"_" + theBar + ";";
                        fingering = fingering + origFingering + "\"";                       
                    }

                }
                else{

                    if (path.states[i].direction == PUSH_NAME){

                        // Add double quotes to fingering, to be rendered above the note
                        fingering = "\"^" + fingering + "\"";

                    }
                    else{

                        var len = fingering.length;
                        var theBar = "";

                        for (var j=0;j<len;++j){
                            theBar += "_";
                        }

                        var origFingering = fingering;
                        fingering = "\"^" + theBar + ";";
                        fingering = fingering + origFingering + "\"";
                       
                    }
                }
            }
            else{

                if (gInjectTab_UseBarForDraw){

                   switch (location){

                        // Above
                        case 0:

                            if (path.states[i].direction == PUSH_NAME){

                                // Add double quotes to fingering, to be rendered above the note
                                fingering = "\"^" + fingering + "\"";

                            }
                            else{

                                var len = fingering.length;
                                var theBar = "";

                                for (var j=0;j<len;++j){
                                    theBar += "_";
                                }

                                var origFingering = fingering;
                                fingering = "\"^" + theBar + ";";
                                fingering = fingering + origFingering + "\"";
                               
                            }

                            break;

                        // Below
                        case 1:

                           if (path.states[i].direction == PUSH_NAME){

                                // Add double quotes to fingering, to be rendered below the note
                                fingering = "\"_" + " " + ";" + fingering + "\"";

                            }
                            else{

                                var len = fingering.length;
                                var theBar = "";

                                for (var j=0;j<len;++j){
                                    theBar += "_";
                                }

                                var origFingering = fingering;
                                fingering = "\"_" + theBar + ";";
                                fingering = fingering + origFingering + "\"";
                               
                            }
     
                            break;

                    }
                }
                else{

                    switch (location){

                        // Above
                        case 0:

                            // Add double quotes to fingering, to be rendered above the note
                            fingering = "\"^" + fingering + ";";

                            // Optionally append bellows direction, to be rendered below the button number.
                            fingering = fingering + path.states[i].direction + "\"";

                            break;

                        // Below
                        case 1:

                            // Add double quotes to fingering, to be rendered below the note
                            fingering = "\"_" + fingering + ";";

                            // Optionally append bellows direction, to be rendered below the button number.
                            fingering = fingering + path.states[i].direction + "\"";

                            break;

                    }
                }
            }


            var fingLen = fingering.length;
            //angloLog("Merge["+i+"] index="+index+" fingLen="+fingLen+" insertedTotal="+insertedTotal);

            result = result.substr(0, index) + fingering + result.substr(index);

            insertedTotal += fingLen;
        }

        return result;
    }

    // Determines the bellows direction (PUSH/DRAW) given
    // a button and note.
    function findBellowsDirection(note, button) {

        if (note.normalizedValue == button.notes[PUSH_INDEX]) {

            return PUSH_NAME;

        } else if (note.normalizedValue == button.notes[DRAW_INDEX]) {

            return DRAW_NAME;

        } else {

            var respelled = respellNormalized(note.normalizedValue);

            if (respelled == button.notes[PUSH_INDEX]) {

                return PUSH_NAME;

            } else if (respelled == button.notes[DRAW_INDEX]) {

                return DRAW_NAME;

            } else {

                return " "; // Better than saying "null"

            }
        }
    }


    // Determines if these two buttons would be a hop if 
    // played back-to-back
    function isHop(button1, button2) {

        // Check for finger hops (i.e. same finger, different button)
        return (button1.finger == button2.finger &&
            button1.name != button2.name);
    }


    // Generate a state tree from the notes.
    // Each note will generate several possible states, each representing
    // a possible button.  All states corresponding to a note will be
    // cross-connected to all states in the next note.
    // Returns an initial (dummy) State, with next states corresponding to
    // the first note of the tune.
    function generateStateTree(notes, noteToButtonMap) {

        var firstNoteStates = null;
        var lastNoteStates = null;

        for (var i = 0; i < notes.length; ++i) {
            var note = notes[i];

            var normalizedValue = note.normalizedValue;
            var buttons = noteToButtonMap[normalizedValue];

            if (buttons == null || buttons.length < 1) {
                angloLog("Failed to find button for note " + normalizedValue);
                angloLog("Attempting respell...");
                var otherName = respell(normalizedValue);
                angloLog("Respelled as " + otherName);
                buttons = noteToButtonMap[otherName];
                if (buttons == null || buttons.length < 1) {
                    angloLog("Respelling as " + otherName + " failed to find a button.");
                    abcOutput = "ERROR:Failed to find button for note '" + normalizedValue + "'";
                    return null;
                }
            }

            var states = [];
            // Create a state per button
            buttons.forEach(function(button) {

                states.push(new State(note, button, findBellowsDirection(note, button)));

            });

            // Remember the start of the tree - that's what we will return
            if (firstNoteStates == null) {
                firstNoteStates = states;
            }
            // Cross-connect the last set of states to these new states 
            if (lastNoteStates != null) {
                lastNoteStates.forEach(function(lastState) {
                    lastState.nextStates = states;
                });
            }
            lastNoteStates = states;
        }

        // Create a dummy state as our tree root
        var rootState = new State(null, new Button("root", [], 0, "none"));
        rootState.nextStates = firstNoteStates;
        return rootState;

    } // end generateStateTree



    // Chooses fingerings.
    // returns: a Path object with the best button choices
    // 
    // This is the guts of this program.  Uses various
    // heuristics to choose semi-optimal fingerings
    // for the given note sequence. 
    //
    // Recursively chooses the best fingering from
    // all possible fingerings.
    function chooseFingerings(stateTree) {

        bestCost = 100000000;

        bestPathFromState = {};

        return chooseFingeringsRecursive(stateTree);
    }

    // Choose best fingerings for current state.
    // Returns a Path
    function chooseFingeringsRecursive(state) {

        if (state.nextStates.length == 0) {
            // Done with notes. Bubble back up.
            angloLog("Last state, note=" + state.note.normalizedValue + " button=" + state.button.name + ". Popping up the stack");
            return new Path([state], state.button.cost);
        }

        var note = state.note;
        var unNormalizedValue = null;
        var normalizedValue = null;
        if (note != null) {
            unNormalizedValue = note.unNormalizedValue;
            normalizedValue = note.normalizedValue;
        }

        angloLog("Choosing: current note=" + normalizedValue + " button=" + state.button.name);

        if (bestPathFromState[state]) {
            angloLog("Already visited state note=" + state.note.normalizedValue + " button=" + state.button.name);
            return bestPathFromState[state];
        }

        var bestPath = new Path([], 10000000);

        // Consider all the possible next states
        for (var i = 0; i < state.nextStates.length; ++i) {

            var nextState = state.nextStates[i];

            angloLog("Trying next [" + i + "/" + state.nextStates.length + "] note=" + nextState.note.normalizedValue + " button=" + nextState.button.name);

            // Recurse! Find the fingering for the rest of the tune.
            var path = chooseFingeringsRecursive(nextState);
            if (path == null) {
                angloLog("Could not get fingerings");
                return null;
            }

            var myCost = state.button.cost;
            var HOP_COST = 100;

            if (path.states.length != 0) {
                var nextButton = path.states[0].button;
                var nextFinger = path.states[0].button.finger;

                // Check for finger hops (i.e. same finger, different button)
                if (isHop(state.button, nextButton)) {
                    // Penalize finger hops (i.e. same finger, different button)
                    angloLog("Penalizing finger hop for note " + normalizedValue);
                    myCost += HOP_COST;
                }
            }


            angloLog("path had cost of " + path.cost + " my cost=" + myCost);
            if (path.cost + myCost < bestPath.cost) {
                // Best choice so far.
                // Prepend this State to the list
                var newStateList = path.states.slice(0); // clone array
                newStateList.unshift(state);
                bestPath = new Path(newStateList, path.cost + myCost);
                angloLog("New best path for note[" + normalizedValue + "], cost=" + bestPath.cost);
            }

        } // end for nextState

        // Memoize
        bestPathFromState[state] = bestPath;

        angloLog("Done choosing: current note=" + normalizedValue + " button=" + state.button.name + " best cost=" + bestPath.cost);


        return bestPath;

    } // end chooseFingeringsRecursive

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

        angloLog("orginal input:\n" + input);

        angloLog("sanitized input:\n" + sanitizedInput);

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
                angloLog("UnNormalized=" + unNormalizedValue + " normalized=" + normalizedValue);
                notes.push(new Note((m.index), unNormalizedValue, normalizedValue));
            }
        }

        return notes;
    }

    function respell(note) {

        var ret = note;

        // enharmonic respellings

        var respellings = {
            //    "_A": "^G",
            //"^A": "_B",
            "_B": "^A",
            //    "B": "_C",
            "^B": "C",
            "_C": "B",
            //    "C": "^B",
            //    "^C": "_D",
            "_D": "^C",
            "^D": "_E",
            "_E": "^D",
            //    "E": "_F",
            "^E": "F",
            "_F": "E",
            //    "F": "^E",
            //    "^F": "_G",
            "_G": "^F",
            "^G": "_A"
        };

        for (var x in respellings) {
            ret = ret.replace(x, respellings[x]);
            ret = ret.replace(x.toLowerCase(), respellings[x].toLowerCase());
        }

        return ret;
    }

    function respellNormalized(note) {

        var ret = note;

        // enharmonic respellings

        var respellings = {
            //    "_A": "^G",
            "^A": "_B",
            //"_B": "^A",
            //    "B": "_C",
            //"^B": "C",
            //"_C": "B",
            //    "C": "^B",
            //    "^C": "_D",
            //"_D": "^C",
            "^D": "_E",
            //"_E": "^D", 
            //    "E": "_F",
            //"^E": "F",
            //"_F": "E",
            //    "F": "^E",
            //    "^F": "_G",
            //"_G": "^F",
            "^G": "_A"
        };

        for (var x in respellings) {
            ret = ret.replace(x, respellings[x]);
            ret = ret.replace(x.toLowerCase(), respellings[x].toLowerCase());
        }

        return ret;
    }

    // Normalizes the given note string, given the key signature.
    // This means making sharps or flats explicit, and removing
    // extraneous natural signs.
    // Returns the normalized note string.
    function normalize(value) {

        // Find note base name
        var i = value.search(/[A-G]/i);
        if (i == -1) {
            angloLog("Failed to find basename for value!");
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

    // Sorts the button entries in the given note->button map, with
    // the lowest cost buttons first
    function sortButtonMap(noteToButtonMap) {

        for (var note in noteToButtonMap) {
            var buttons = noteToButtonMap[note];

            buttons.sort(function(a, b) {
                return a.cost - b.cost;
            });
        }

    }


    // Given a button->note map, generates
    // the corresponding note->button map.
    // Keys of this map are filtered through "respell".
    // The values of this map are buttons.
    // Returns the note->button map
    function generateNoteToButtonMap(buttonToNoteMap) {

        var noteMap = {};

        for (var buttonName in buttonToNoteMap) {

            var notes = buttonToNoteMap[buttonName].notes;

            if (notes == null) {
                angloLog("Failed to find entry for button " + b);
                continue;
            }

            notes.forEach(

                function(v) {

                    if (noteMap[v] == null) {

                        // Create a new button list for this note.
                        noteMap[v] = [buttonToNoteMap[buttonName]];

                    } else {

                        // Insert this button into an existing button list for this note.
                        noteMap[v].push(buttonToNoteMap[buttonName]);

                    }

                    v = respell(v);

                    if (noteMap[v] == null) {

                        // Create a new button list for this note.
                        noteMap[v] = [buttonToNoteMap[buttonName]];

                    } else {

                        // Insert this button into an existing button list for this note.
                        noteMap[v].push(buttonToNoteMap[buttonName]);

                    }

                });

        }

        return noteMap;
    }

    //
    // Count the tunes in the text area
    //
    function angloCountTunes(theABC) {

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
    function angloGetTuneByIndex(theABC, tuneNumber) {

        var theNotes = theABC;

        // Now find all the X: items
        var theTunes = theNotes.split(/^X:/gm);

        return ("X:" + theTunes[tuneNumber + 1]);

    }

    // Glyphs for bellows push and draw indications
    var PUSH_NAME = "↓";
    var DRAW_NAME = "↑";

    //
    // Generate Anglo Concertina Tablature
    //
    function generateConcertinaFingerings(theABC,callback) {

        // Count the tunes in the ABC
        var theTunes = theABC.split(/^X:.*$/gm);
        var nTunes = theTunes.length - 1;

        var fontFamily = gInjectTab_FontFamily;
        var tabFontSize = gInjectTab_TabFontSize;
        var musicSpace = gInjectTab_MusicSpace;
        var staffSep = gInjectTab_StaffSep;
        var tabLocation = parseInt(gInjectTab_TabLocation);
        var stripChords = gInjectTab_StripChords;

        // Stuff the push and draw glyphs
        PUSH_NAME = gInjectTab_PushGlyph;
        DRAW_NAME = gInjectTab_DrawGlyph;

        var result = FindPreTuneHeader(theABC);

        var gotError = false;

        var badTunes = [];

        var location = parseInt(gInjectTab_TabLocation);

        for (var i = 0; i < nTunes; ++i) {

            var thisTune = angloGetTuneByIndex(theABC, i);

            var originalTune = thisTune;

            // Don't inject section header tune fragments or multi-voice tunes
            if (isSectionHeader(thisTune) || isMultiVoiceTune(thisTune)){
                result += thisTune;
                continue;
            }

            // Strip any existing tab
            thisTune = StripTabOne(thisTune);

            // Strip chords? 
            // Above always strips
            // Below only strips if specified in the settings
            if (gInjectTab_GaryCoover || (tabLocation == 0) || ((tabLocation == 1) && (stripChords))){

                thisTune = StripChordsOne(thisTune);
            }
 
            try{

                thisTune = generateAngloFingerings(thisTune);

            }
            catch(err){

                result += originalTune;

                var thisTitle = getTuneTitle(originalTune);

                badTunes.push(thisTitle);

                gotError = true;

                continue;

            }

            thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%staffsep " + staffSep);
            thisTune = InjectStringAboveTuneHeaderConditional(thisTune, "%%annotationfont " + fontFamily + " " + tabFontSize);

            if ((location == 0) || gInjectTab_GaryCoover){
                thisTune = InjectStringAboveTuneHeaderConditional(thisTune, "%%musicspace " + musicSpace);
            }

            result += thisTune;

        }

        if (gotError){

            var thePrompt = '<p style="text-align:center;font-size:18px;margin-bottom:18px">No Anglo Concertina tablature generated for one or more tunes:</p>';

            for (var j=0;j<badTunes.length;++j){
                thePrompt += '<p style="text-align:center;font-size:18px;">'+badTunes[j]+'</p>';
            }

            thePrompt += '<p style="text-align:center;font-size:18px;line-height:24px;margin-top:18px">Some notes may be outside the range or not available on the selected style of Anglo concertina.</p>';

            callback(result,true,thePrompt);
            

         }
        else{

            callback(result,false,"");

        }

    }

    return generateConcertinaFingerings(theABC,callback);

}


//
// app-box-tab-generator.js
//
// ABC Muscial Notation Converter for Traditional Irish Button Accordion
//
//
// This version for integration into the ABC Transcription Tools
//
// Annotates an ABC format tune with tablature
// for the B/C and C#/D button accordions
//
// ABC parsing algorithm by James van Donsel
//
// Michael Eskin
// https://michaeleskin.com
//
// Released under CC0 - No Rights Reserved
// https://creativecommons.org/share-your-work/public-domain/cc0/
//

//
// Put the whole thing in a function for isolation
//
var boxTabGenerator = function (theABC){

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
    function generate_tab(abcInput){

        log("Got input:" + abcInput);

        // B/C or C#/D?
        var style = parseInt(gInjectTab_BoxStyle);

        // Find the key signature in the input
        keySignature = findKeySignature(abcInput);

        if (keySignature == null) {
            return ("ERROR: Unknown or unsupported key signature");
        }

        // Generate an array of note objects. Each
        var notes = getAbcNotes(abcInput,style);

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

    //
    // Merges the tablature with the original string input.
    //
    function mergeTablature(input, notes) {

        var result = input;
        
        var insertedTotal = 0;

        var location = parseInt(gInjectTab_TabLocation);

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

            // Using push/pull tab style
            //debugger;
            if (gInjectTab_BoxTabStyle == 1){

                switch (buttonNumber){
                    case "①":
                        buttonNumber = "1'";
                        break;
                    case "②":
                        buttonNumber = "2'";
                        break;
                    case "③":
                        buttonNumber = "3'";
                        break;
                    case "④":
                        buttonNumber = "4'";
                        break;
                    case "⑤":
                        buttonNumber = "5'";
                        break;
                    case "⑥":
                        buttonNumber = "6'";
                        break;
                    case "⑦":
                        buttonNumber = "7'";
                        break;
                    case "⑧":
                        buttonNumber = "8'";
                        break;
                    case "⑨":
                        buttonNumber = "9'";
                        break;
                    case "⑩":
                        buttonNumber = "10'";
                        break;
                    case "⑪":
                        buttonNumber = "11'";
                        break;
                }

                if (direction == PUSH_NAME){

                    theTab = "\"_" + buttonNumber + ";-; \"";

                }
                else{
                    
                    theTab = "\"_ ;-;" + buttonNumber + "\"";
                   
                }

            }
            else
            // Default tab style
            if (gInjectTab_UseBarForDraw){

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
                            theTab = "\"_" + " " + ";" + buttonNumber + "\"";

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

            // B/C
            case 0:

                var glyph_map = {
                    "^D,": "①"+PUSH_NAME,
                    "_E,": "①"+PUSH_NAME,
                    "E,":  "1"+PUSH_NAME,
                    "F,":  "x ",
                    "^F,": "②"+PUSH_NAME,
                    "_G,": "②"+PUSH_NAME,
                    "G,":  "2"+PUSH_NAME,
                    "^G,": "①"+DRAW_NAME,
                    "_A,": "①"+DRAW_NAME,
                    "A,":  "1"+DRAW_NAME,
                    "^A,": "②"+DRAW_NAME,
                    "_B,": "②"+DRAW_NAME,
                    "B,":  "2"+DRAW_NAME,
                    "C":   "3"+PUSH_NAME,
                    "^C":  "③"+DRAW_NAME,
                    "_D":  "③"+DRAW_NAME,
                    "D":   "3"+DRAW_NAME,
                    "^D":  "④"+PUSH_NAME,
                    "_E":  "④"+PUSH_NAME,
                    "E":   "4"+PUSH_NAME,
                    "F":   "4"+DRAW_NAME,
                    "^F":  "⑤"+PUSH_NAME,
                    "_G":  "⑤"+PUSH_NAME,
                    "G":   "5"+PUSH_NAME,
                    "^G":  "⑤"+DRAW_NAME,
                    "_A":  "⑤"+DRAW_NAME,
                    "A":   "5"+DRAW_NAME,
                    "^A":  "⑥"+DRAW_NAME,
                    "_B":  "⑥"+DRAW_NAME,
                    "B":   "6"+DRAW_NAME,
                    "c":   "6"+PUSH_NAME,
                    "^c":  "⑦"+DRAW_NAME,
                    "_d":  "⑦"+DRAW_NAME,
                    "d":   "7"+DRAW_NAME,
                    "^d":  "⑦"+PUSH_NAME,
                    "_e":  "⑦"+PUSH_NAME,
                    "e":   "7"+PUSH_NAME,
                    "f":   "8"+DRAW_NAME,
                    "^f":  "⑧"+PUSH_NAME,
                    "_g":  "⑧"+PUSH_NAME,
                    "g":   "8"+PUSH_NAME,
                    "^g":  "⑨"+DRAW_NAME,
                    "_a":  "⑨"+DRAW_NAME,
                    "a":   "9"+DRAW_NAME,
                    "^a":  "⑩"+DRAW_NAME,
                    "_b":  "⑩"+DRAW_NAME,
                    "b":   "10"+DRAW_NAME,
                    "c'":  "9"+PUSH_NAME,
                    "^c'": "⑪"+DRAW_NAME,
                    "_d'": "⑪"+DRAW_NAME,
                    "d'":  "x ",
                    "^d'": "⑩"+PUSH_NAME,
                    "_e'": "⑩"+PUSH_NAME,
                    "e'":  "10"+PUSH_NAME,
                    "^f'": "⑪"+PUSH_NAME,
                    "_g'": "⑪"+PUSH_NAME
                };

                var thisGlyph = glyph_map[note];

                if (!thisGlyph){
                    return "x ";
                }

            break;

            // C#/D
            case 1:
                
                var glyph_map = {
                    "F,":  "①"+PUSH_NAME,
                    "^F,": "1"+PUSH_NAME,
                    "_G,": "1"+PUSH_NAME,
                    "G,":  "x ",
                    "^G,": "②"+PUSH_NAME,
                    "_A,": "②"+PUSH_NAME,
                    "A,":  "2"+PUSH_NAME,
                    "^A,": "①"+DRAW_NAME,
                    "_B,": "①"+DRAW_NAME,
                    "B,":  "1"+DRAW_NAME,
                    "C":   "②"+DRAW_NAME,
                    "^C":  "2"+DRAW_NAME,
                    "_D":  "2"+DRAW_NAME,
                    "D":   "3"+PUSH_NAME,
                    "^D":  "③"+DRAW_NAME,
                    "_E":  "③"+DRAW_NAME,
                    "E":   "3"+DRAW_NAME,
                    "F":   "④"+PUSH_NAME,
                    "^F":  "4"+PUSH_NAME,
                    "_G":  "4"+PUSH_NAME,
                    "G":   "4"+DRAW_NAME,
                    "^G":  "⑤"+PUSH_NAME,
                    "_A":  "⑤"+PUSH_NAME,
                    "A":   "5"+PUSH_NAME,
                    "^A":  "⑤"+DRAW_NAME,
                    "_B":  "⑤"+DRAW_NAME,
                    "B":   "5"+DRAW_NAME,
                    "c":   "⑥"+DRAW_NAME,
                    "^c":  "6"+DRAW_NAME,
                    "_d":  "6"+DRAW_NAME,
                    "d":   "6"+PUSH_NAME,
                    "^d":  "⑦"+DRAW_NAME,
                    "_e":  "⑦"+DRAW_NAME,
                    "e":   "7"+DRAW_NAME,
                    "f":   "⑦"+PUSH_NAME,
                    "^f":  "7"+PUSH_NAME,
                    "_g":  "7"+PUSH_NAME,
                    "g":   "8"+DRAW_NAME,
                    "^g":  "⑧"+PUSH_NAME,
                    "_a":  "⑧"+PUSH_NAME,
                    "a":   "8"+PUSH_NAME,
                    "^a":  "⑨"+DRAW_NAME,
                    "_b":  "⑨"+DRAW_NAME,
                    "b":   "9"+DRAW_NAME,
                    "c'":  "⑩"+DRAW_NAME,
                    "^c'": "10"+DRAW_NAME,
                    "_d'": "10"+DRAW_NAME,
                    "d'":   "9"+PUSH_NAME,
                    "^d'":  "⑪"+DRAW_NAME,
                    "_e'":  "⑪"+DRAW_NAME,
                    "e'":   "x ",
                    "f'":   "⑩"+PUSH_NAME,
                    "^f'":  "10"+PUSH_NAME,
                    "_g'":  "10"+PUSH_NAME,
                    "g'":   "x ",
                    "^g'":  "⑪"+PUSH_NAME,
                    "_a'":  "⑪"+PUSH_NAME
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
    // Return the tune ABC at a specific index
    //
    //
    function getTuneByIndex(theABC, tuneNumber) {

        var theNotes = theABC;

        // Now find all the X: items
        var theTunes = theNotes.split(/^X:/gm);

        return ("X:" + theTunes[tuneNumber + 1]);

    }


    // Glyph(s) to use for the bellows push or draw indication
    var PUSH_NAME = "↓";
    var DRAW_NAME = "↑";

    //
    // Main processor
    //
    function generateBoxTab(theABC) {

        // Count the tunes in the ABC
        var theTunes = theABC.split(/^X:.*$/gm);
        var nTunes = theTunes.length - 1;

        var fontFamily = gInjectTab_FontFamily;
        var tabFontSize = gInjectTab_TabFontSize;
        var musicSpace = gInjectTab_MusicSpace;
        var staffSep = gInjectTab_StaffSep;
        var tabLocation = parseInt(gInjectTab_TabLocation);
        var stripChords = gInjectTab_StripChords;

        // Stuff the push and draw glyphs
        PUSH_NAME = gInjectTab_PushGlyph;
        DRAW_NAME = gInjectTab_DrawGlyph;

        var result = FindPreTuneHeader(theABC);

        var location = parseInt(gInjectTab_TabLocation);
        
        for (var i = 0; i < nTunes; ++i) {

            var thisTune = getTuneByIndex(theABC, i);

            // Don't inject section header tune fragments or multi-voice tunes
            if (isSectionHeader(thisTune) || isMultiVoiceTune(thisTune)){
                result += thisTune;
                continue;
            }

            // Strip existing tab
            thisTune = StripTabOne(thisTune);

            // Strip chords? 
            // Above always strips
            // Below only strips if specified in the settings
            if ((tabLocation == 0) || ((tabLocation == 1) && (stripChords))){
                thisTune = StripChordsOne(thisTune);
            }

            thisTune = generate_tab(thisTune);

            thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%staffsep " + staffSep);
            thisTune = InjectStringAboveTuneHeaderConditional(thisTune, "%%annotationfont " + fontFamily + " " + tabFontSize);

            if (location == 0){
                thisTune = InjectStringAboveTuneHeaderConditional(thisTune, "%%musicspace " + musicSpace);
            }

            result += thisTune;

        }

        return result;

    }

    return generateBoxTab(theABC);

 
}

//
// app-bamboo-flute-generator.js
//
// ABC Muscial Notation Converter for Traditional Chinese bamboo flutes
//
// This version for integration into the ABC Transcription Tools
//
// Annotates an ABC format tune with tablature
// for traditional Chinese bamboo flutes
//
// ABC parsing algorithm by James van Donsel
//
// Michael Eskin
// https://michaeleskin.com
//
// Released under CC0 - No Rights Reserved
// https://creativecommons.org/share-your-work/public-domain/cc0/
//

//
// Put the whole thing in a function for isolation
//
var bambooFluteTabGenerator = function (theABC){

    //
    // chinese-flute.js
    //
    // ABC Muscial Notation Converter for Chinese flute
    //
    // Annotates an ABC format tune with tablature
    // Chinese flute
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

    function log(s) {
        if (verbose)
            console.log(s);
    }

    //
    // Generate the flute tab
    //
    function generate_tab(abcInput){

        log("Got input:" + abcInput);

        // Root key?
        var root_scale = parseInt(gBambooFluteKey);

        // Find the key signature in the input
        keySignature = findKeySignature(abcInput);

        if (keySignature == null) {
            return ("ERROR: Unknown or unsupported key signature");
        }

        // Generate an array of note objects. 
        var notes = getAbcNotes(abcInput,root_scale);

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

            var glyphLen = glyph.length;

            var tone_number = glyph.substr(0,glyphLen-1);

            var octave = glyph.substr(glyphLen-1,glyphLen-1);

            // Special handling for lower octave

            if (octave != "-"){

                theTab = "\"_" + octave + ";" + tone_number + "\"";

            }
            else{

                theTab = "\"_" + " ;" + tone_number + ";" + "•" + "\"";

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
    function getNoteGlyph(note, root_scale){

        var thisGlyph = "";

        switch (root_scale){
            
            case 0: // Key of C

                var glyph_map = {
                    "G,":  "5-",
                    "^G,": "#5-",
                    "_A,": "#5-",
                    "A,":  "6-",
                    "^A,": "#6-",
                    "_B,": "#6-",
                    "B,":  "7-",
                    "C":   "1 ",
                    "^C":  "#1 ",
                    "_D":  "#1 ",
                    "D":   "2 ",
                    "^D":  "#2 ",
                    "_E":  "#2 ",
                    "E":   "3 ",
                    "F":   "4 ",
                    "^F":  "#4 ",
                    "_G":  "#4 ",
                    "G":   "5 ",
                    "^G":  "#5 ",
                    "_A":  "#5 ",
                    "A":   "6 ",
                    "^A":  "#6 ",
                    "_B":  "#6 ",
                    "B":   "7 ",
                    "c":   "1•",
                    "^c":  "#1•",
                    "_d":  "#1•",
                    "d":   "2•",
                    "^d":  "#2•",
                    "_e":  "#2•",
                    "e":   "3•",
                    "f":   "4•",
                    "^f":  "#4•",
                    "_g":  "#4•",
                    "g":   "5•",
                    "^g":  "#5•",
                    "_a":  "#5•",
                    "a":   "6•",
                    "^a":  "#6•",
                    "_b":  "#6•",
                    "b":   "7•",
                };

                thisGlyph = glyph_map[note];

                if (!thisGlyph){
                    return "x ";
                }

                break;

            case 1: // Key of D

               var glyph_map = {
                    "G,":  "4-",
                    "^G,": "#4-",
                    "_A,": "#4-",
                    "A,":  "5-",
                    "^A,": "#5-",
                    "_B,": "#5-",
                    "B,":  "6-",
                    "C":   "#6-",
                    "^C":  "7-",
                    "_D":  "7-",
                    "D":   "1 ",
                    "^D":  "#1 ",
                    "_E":  "#1 ",
                    "E":   "2 ",
                    "F":   "#2 ",
                    "^F":  "3 ",
                    "_G":  "3 ",
                    "G":   "4 ",
                    "^G":  "#4 ",
                    "_A":  "#4 ",
                    "A":   "5 ",
                    "^A":  "#5 ",
                    "_B":  "#5 ",
                    "B":   "6 ",
                    "c":   "#6 ",
                    "^c":  "7 ",
                    "_d":  "7 ",
                    "d":   "1•",
                    "^d":  "#1•",
                    "_e":  "#1•",
                    "e":   "2•",
                    "f":   "#2•",
                    "^f":  "3•",
                    "_g":  "3•",
                    "g":   "4•",
                    "^g":  "#4•",
                    "_a":  "#4•",
                    "a":   "5•",
                    "^a":  "#5•",
                    "_b":  "#5•",
                    "b":   "6•",
                    "c'":  "#6•",
                    "^c'": "7•",
                  };

                thisGlyph = glyph_map[note];

                if (!thisGlyph){
                    return "x ";
                }

                break;

            case 2: // Key of G

                var glyph_map = {
                    "G,":  "1-",
                    "^G,": "#1-",
                    "_A,": "#1-",
                    "A,":  "2-",
                    "^A,": "#2-",
                    "_B,": "#2-",
                    "B,":  "3-",
                    "C":   "4-",
                    "^C": "#4-",
                    "_D": "#4-",
                    "D":   "5-",
                    "^D": "#5-",
                    "_E": "#5-",
                    "E":   "6-",
                    "F":   "#6-",
                    "^F":  "7-",
                    "G":   "1 ",
                    "^G":  "#1 ",
                    "_A":  "#1 ",
                    "A":   "2 ",
                    "^A":  "#2 ",
                    "_B":  "#2 ",
                    "B":   "3 ",
                    "c":   "4 ",
                    "^c":  "#4 ",
                    "_d":  "#4 ",
                    "d":   "5 ",
                    "^d":  "#5 ",
                    "_e":  "#5 ",
                    "e":   "6 ",
                    "f":   "#6 ",
                    "^f":  "7 ",
                    "_g":  "7 ",
                    "g":   "1•",
                    "^g":  "#1•",
                    "_a":  "#1•",
                    "a":   "2•",
                    "^a":  "#2•",
                    "_b":  "#2•",
                    "b":   "3•",
                    "c'":  "4•",
                    "^c'": "#4•",
                    "_d'": "#4•",
                    "d'":  "5•",
                    "^d'": "#5•",
                    "_e'": "#5•",
                    "e'":  "6•",
                    "f'":  "6#•",
                    "^f'": "7•",
                    "_g'": "7•"
                };

                thisGlyph = glyph_map[note];

                if (!thisGlyph){
                    return "x ";
                }

                break;

           case 3: // Key of A

                var glyph_map = {
                    "A,":  "1-",
                    "^A,": "#1-",
                    "_B,": "#1-",
                    "B,":  "2-",
                    "C":   "#2-",
                    "^C":  "3-",
                    "_D":  "3-",
                    "D":   "4-",
                    "^D":  "#4-",
                    "_E":  "#4-",
                    "E":   "5-",
                    "F":   "#5-",
                    "^F":  "6-",
                    "_G":  "6-",
                    "G":   "6#-",
                    "^G":  "7-",
                    "_A":  "7-",
                    "A":   "1 ",
                    "^A":  "#1 ",
                    "_B":  "#1 ",
                    "B":   "2 ",
                    "c":   "#2 ",
                    "^c":  "3 ",
                    "_d":  "3 ",
                    "d":   "4 ",
                    "^d":  "#4 ",
                    "_e":  "#4 ",
                    "e":   "5 ",
                    "f":   "#5 ",
                    "^f":  "6 ",
                    "_g":  "6 ",
                    "g":   "6# ",
                    "^g":  "7 ",
                    "_a":  "7 ",
                    "a":   "1•",
                    "^a":  "#1•",
                    "_b":  "#1•",
                    "b":   "2•",
                    "c'":   "#2•",
                    "^c'":  "3•",
                    "_d'":  "3•",
                    "d'":   "4•",
                    "^d'":  "#4•",
                    "_e'":  "#4•",
                    "e'":   "5•",
                    "f'":   "#5•",
                    "^f'":  "6•",
                    "_g'":  "6•",
                    "g'":   "6#•",
                    "^g'":  "7•",
                    "_a'":  "7•",
                };

                thisGlyph = glyph_map[note];

                if (!thisGlyph){
                    return "x ";
                }

                break;

        }

        return thisGlyph;

    }

    // Returns an array of Notes from the ABC string input
    function getAbcNotes(input,root_scale) {

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
                
                var theGlyph = getNoteGlyph(normalizedValue,root_scale);

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


    //
    // Main processor
    //
    function generateBambooFluteTab(theABC) {

       // Count the tunes in the ABC
        var theTunes = theABC.split(/^X:.*$/gm);
        var nTunes = theTunes.length - 1;

        var fontFamily = gInjectTab_FontFamily;
        var tabFontSize = gInjectTab_TabFontSize;
        var staffSep = gInjectTab_StaffSep;
        var tabLocation = parseInt(gInjectTab_TabLocation);
        var stripChords = gInjectTab_StripChords;

        var result = FindPreTuneHeader(theABC);

        for (var i = 0; i < nTunes; ++i) {

            var thisTune = getTuneByIndex(theABC, i);

            // Don't inject section header tune fragments or multi-voice tunes
            if (isSectionHeader(thisTune) || isMultiVoiceTune(thisTune)){
                result += thisTune;
                continue;
            }

            // Strip any existing tab
            thisTune = StripTabOne(thisTune);

            // Strip chords? 
            if (stripChords){
                thisTune = StripChordsOne(thisTune);
            }

            thisTune = generate_tab(thisTune);

            thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%staffsep " + staffSep);
  
            // Inject the root key indication
            switch (parseInt(gBambooFluteKey)){

                case 0: // C
                    thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%text 1=C");
                    thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%text ");
                break;

                case 1: // D
                    thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%text 1=D");
                    thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%text ");
                break;
                
                case 2: // G
                    thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%text 1=G");
                    thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%text ");
                break;

                case 3: // A
                    thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%text 1=A");
                    thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%text ");
                break;

            }

            thisTune = InjectStringAboveTuneHeaderConditional(thisTune, "%%annotationfont " + fontFamily + " " + tabFontSize);

            result += thisTune;

        }

        return result

    }

    return generateBambooFluteTab(theABC);

}


//
// cce-transform.js
//
// ABC Muscial Notation Converter
//
// Converts thesession.org format ABCs into Comhaltas preferred format
//
// Michael Eskin
// https://michaeleskin.com
//
//
// Put the whole thing in a function for isolation
//
var ceoltasABCTransformer = function (theABC,doInverse,isForPDF){

    var verbose = false;

    // Globals
    var abcOutput = "";
    var keySignature = null;

    function log(s) {
        if (verbose)
            console.log(s);
    }

    //
    // Generate the box tab
    //
    function transformABC(abcInput,doInverse,isForPDF){

        log("Got input:" + abcInput);

        // Find the key signature in the input
        keySignature = findKeySignature(abcInput);

        if (keySignature == null) {
            return ("ERROR: Unknown or unsupported key signature");
        }

        // Generate an array of note objects. Each
        var notes = getAbcNotes(abcInput,doInverse,isForPDF);

        // Merge the tranformed note names into the ABC notation
        abcOutput = mergeTransformedNotes(abcInput, notes);

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

    //
    // Merges the transformed note names with the original string input.
    //
    function mergeTransformedNotes(input, notes) {

        //debugger;

        var result = input;
        
        var insertedTotal = 0;

        var index, glyph, glyphlen, unNormalizedValue, unNormalizedLen, delta;

        for (var i = 0; i < notes.length; ++i) {

            index = notes[i].index + insertedTotal;

            glyph = notes[i].glyph;

            unNormalizedValue = notes[i].unNormalizedValue;

            glyphLen = glyph.length;

            unNormalizedLen = unNormalizedValue.length;

            result = result.substr(0, index) + glyph + result.substr(index+unNormalizedLen);

            delta = glyphLen-unNormalizedLen;

            insertedTotal += delta;
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
    // From a note name, gets the transformed string
    //
    function getNoteGlyph(note,doInverse,isForPDF){

        if (isForPDF){
            var glyph_map = {
                "D,": "D,",
                "^D,": "D#,",
                "_E,": "Eb,",
                "E,":  "E,",
                "^E,": "E#,",
                "_F,": "Fb,",
                "F,":  "F,",
                "^F,": "F#,",
                "_G,": "Gb,",
                "G,":  "G,",
                "^G,": "G#,",
                "_A,": "Ab,",
                "A,":  "A,",
                "^A,": "A#,",
                "_B,": "Bb,",
                "B,":  "B,",
                "^B,": "B#,",
                "_C":  "Cb,",
                "C":   "C,",
                "^C":  "C,#",
                "_D":  "Db",
                "D":   "D",
                "^D":  "D#",
                "_E":  "Eb",
                "E":   "E",
                "^E":  "E#",
                "_F":  "Fb",
                "F":   "F",
                "^F":  "F#",
                "_G":  "Gb",
                "G":   "G",
                "^G":  "G#",
                "_A":  "Ab",
                "A":   "A",
                "^A":  "A#",
                "_B":  "Bb",
                "B":   "B",
                "^B":  "B#",
                "_c":  "Cb",
                "c":   "C",
                "^c":  "C#",
                "_d":  "Db'",
                "d":   "D'",
                "^d":  "D#'",
                "_e":  "Eb'",
                "e":   "E'",
                "^e":  "E#'",
                "_f":  "Fb'",
                "f":   "F'",
                "^f":  "F#'",
                "_g":  "Gb'",
                "g":   "G'",
                "^g":  "G#'",
                "_a":  "Ab'",
                "a":   "A'",
                "^a":  "A#'",
                "_b":  "Bb'",
                "b":   "B'",
                "^b":  "B#'",
                "_c'":  "Cb'",
                "c'":  "C'",
                "^c'": "C#'",
                "_d'": "Db''",
                "d'":  "D''",
                "^d'": "D#''",
                "_e'": "Eb''",
                "e'":  "E''",
                "^e'": "E#''",
                "_f'":  "Fb''",
                "f'":  "F''",
                "^f'": "F#''",
                "_g'": "Gb''",
                "g'": "G''",
                // Naturals
                "=D,": "D,",
                "=E,":  "E,",
                "=F,":  "F,",
                "=G,":  "G,",
                "=A,":  "A,",
                "=B,":  "B,",
                "=C":   "C,",
                "=D":   "D",
                "=E":   "E",
                "=F":   "F",
                "=G":   "G",
                "=A":   "A",
                "=B":   "B",
                "=c":   "C",
                "=d":   "D'",
                "=e":   "E'",
                "=f":   "F'",
                "=g":   "G'",
                "=a":   "A'",
                "=b":   "B'",
                "=c'":  "C'",
                "=d'":  "D''",
                "=e'":  "E''",
                "=f'":  "F''",
                "=g'":  "G''",
                // Don't touch
                "C'":   "C",
                "^C'":  "C#",
                "_D'":  "Db'",
                "D'":   "D'",
                "^D'":  "D#'",
                "_E'":  "Eb'",
                "E'":   "E'",
                "F'":   "F'",
                "^F'":  "F#'",
                "_G'":  "Gb'",
                "G'":   "G'",
                "^G'":  "G#'",
                "_A'":  "Ab'",
                "A'":   "A'",
                "^A'":  "A#'",
                "_B'":  "Bb'",
                "B'":   "B'",
                "C''":  "C'",
                "^C''": "C#'",
                "_D''": "Db''",
                "D''":  "D''",
                "^D''": "D#''",
                "_E''": "Eb''",
                "E''":  "E''",
                "F''":  "F''",
                "^F''": "F#''",
                "_G''": "Gb''",
                "G''":  "G''",               
                "=C'":  "C",
                "=D'":  "D'",
                "=E'":  "E'",
                "=F'":  "F'",
                "=G'":  "G'",
                "=A'":  "A'",
                "=B'":  "B'",
                "=C''": "C'",
                "=D''": "D''",
                "=E''": "E''",
                "=F''": "F''",
                "=G''": "G''",           
            };

            var thisGlyph = glyph_map[note];

            if (!thisGlyph){
                return "x ";
            }

            return thisGlyph;
        }
        else
        if (!doInverse){

            var glyph_map = {
                "D,": "D,",
                "^D,": "^D,",
                "_E,": "_E,",
                "E,":  "E,",
                "^E,": "^E,",
                "_F,": "_F,",
                "F,":  "F,",
                "^F,": "^F,",
                "_G,": "_G,",
                "G,":  "G,",
                "^G,": "^G,",
                "_A,": "_A,",
                "A,":  "A,",
                "^A,": "^A,",
                "_B,": "_B,",
                "B,":  "B,",
                "^B,": "^B,",
                "_C": "_C",
                "C":   "C",
                "^C":  "^C",
                "_D":  "_D",
                "D":   "D",
                "^D":  "^D",
                "_E":  "_E",
                "E":   "E",
                "^E":  "^E",
                "_F":  "_F",
                "F":   "F",
                "^F":  "^F",
                "_G":  "_G",
                "G":   "G",
                "^G":  "^G",
                "_A":  "_A",
                "A":   "A",
                "^A":  "^A",
                "_B":  "_B",
                "B":   "B",
                "^B": "^B",
                "_c": "_C'",
                "c":   "C'",
                "^c":  "^C'",
                "_d":  "_D'",
                "d":   "D'",
                "^d":  "^D'",
                "_e":  "_E'",
                "e":   "E'",
                "^e": "^E'",
                "_f": "_F'",
                "f":   "F'",
                "^f":  "^F'",
                "_g":  "_G'",
                "g":   "G'",
                "^g":  "^G'",
                "_a":  "_A'",
                "a":   "A'",
                "^a":  "^A'",
                "_b":  "_B'",
                "b":   "B'",
                "^b":  "^B'",
                "_c'": "_C''",
                "c'":  "C''",
                "^c'": "^C''",
                "_d'": "_D''",
                "d'":  "D''",
                "^d'": "^D''",
                "_e'": "_E''",
                "e'":  "E''",
                "^e'": "^E''",
                "_f'": "_F''",
                "f'":  "F''",
                "^f'": "^F''",
                "_g'": "_G''",
                "g'": "G''",
                // Naturals
                "=D,": "=D,",
                "=E,":  "=E,",
                "=F,":  "=F,",
                "=G,":  "=G,",
                "=A,":  "=A,",
                "=B,":  "=B,",
                "=C":   "=C,",
                "=D":   "=D",
                "=E":   "=E",
                "=F":   "=F",
                "=G":   "=G",
                "=A":   "=A",
                "=B":   "=B",
                "=c":   "=C",
                "=d":   "=D'",
                "=e":   "=E'",
                "=f":   "=F'",
                "=g":   "=G'",
                "=a":   "=A'",
                "=b":   "=B'",
                "=c'":  "=C''",
                "=d'":  "=D''",
                "=e'":  "=E''",
                "=f'":  "=F''",
                "=g'":  "=G''",
                // Don't touch
                "C'":   "C'",
                "^C'":  "^C'",
                "_D'":  "_D'",
                "D'":   "D'",
                "^D'":  "^D'",
                "_E'":  "_E'",
                "E'":   "E'",
                "F'":   "F'",
                "^F'":  "^F'",
                "_G'":  "_G'",
                "G'":   "G'",
                "^G'":  "^G'",
                "_A'":  "_A'",
                "A'":   "A'",
                "^A'":  "^A'",
                "_B'":  "_B'",
                "B'":   "B'",
                "C''":  "C''",
                "^C''": "^C''",
                "_D''": "_D''",
                "D''":  "D''",
                "^D''": "^D''",
                "_E''": "_E''",
                "E''":  "E''",
                "F''":  "F''",
                "^F''": "^F''",
                "_G''": "_G''",
                "G''":  "G''",               
                "=C'":  "=C'",
                "=D'":  "=D'",
                "=E'":  "=E'",
                "=F'":  "=F'",
                "=G'":  "=G'",
                "=A'":  "=A'",
                "=B'":  "=B'",
                "=C''": "=C''",
                "=D''": "=D''",
                "=E''": "=E''",
                "=F''": "=F''",
                "=G''": "=G''",            
            };

            var thisGlyph = glyph_map[note];

            if (!thisGlyph){
                return "x ";
            }

            return thisGlyph;
        }
        else{
             var glyph_map = {
                "D,": "D,",
                "^D,": "^D,",
                "E,":  "E,",
                "F,":  "F,",
                "^F,": "^F,",
                "_G,": "_G,",
                "G,":  "G,",
                "^G,": "^G,",
                "_A,": "_A,",
                "A,":  "A,",
                "^A,": "^A,",
                "_B,": "_B,",
                "B,":  "B,",
                "^B,":  "^B,",
                "_C":  "_C",
                "C":   "C",
                "^C":  "^C",
                "_D":  "_D",
                "D":   "D",
                "^D":  "^D",
                "_E":  "_E",
                "E":   "E",
                "^E":  "^E",
                "_F":  "_F",
                "F":   "F",
                "^F":  "^F",
                "_G":  "_G",
                "G":   "G",
                "^G":  "^G",
                "_A":  "_A",
                "A":   "A",
                "^A":  "^A",
                "_B":  "_B",
                "B":   "B",
                "^B":  "^B",
                "_C":  "_c",
                "C'":   "c",
                "^C'":  "^c",
                "_D'":  "_d",
                "D'":   "d",
                "^D'":  "^d",
                "_E'":  "_e",
                "E'":   "e",
                "^E'":  "^e",
                "_F'":  "_f",
                "F'":   "f",
                "^F'":  "^f",
                "_G'":  "_g",
                "G'":   "g",
                "^G'":  "^g",
                "_A'":  "_a",
                "A'":   "a",
                "^A'":  "^a",
                "_B'":  "_b",
                "B'":   "b",
                "^B'":  "^b",
                "_C''":  "_c'",
                "C''":  "c'",
                "^C''": "^c'",
                "_D''": "_d'",
                "D''":  "d'",
                "^D''": "^d'",
                "_E''": "_e'",
                "E''":  "e'",
                "^E'":  "^e'",
                "_F'":  "_f'",
                "F''":  "f'",
                "^F''": "^f'",
                "_G''": "_g'",
                "G''": "g'",
                // Naturals
                "=D,":  "=D,",
                "=E,":  "=E,",
                "=F,":  "=F,",
                "=G,":  "=G,",
                "=A,":  "=A,",
                "=B,":  "=B,",
                "=C":   "=C",
                "=D":   "=D",
                "=E":   "=E",
                "=F":   "=F",
                "=G":   "=G",
                "=A":   "=A",
                "=B":   "=B",
                "=C'":  "=c",
                "=D'":   "=d",
                "=E'":   "=e",
                "=F'":   "=f",
                "=G'":   "=g",
                "=A'":   "=a",
                "=B'":   "=b",
                "=C''":  "=c'",
                "=D''":  "=d'",
                "=E''":  "=e'",
                "=F''":  "=f'",
                "=G''":  "=g'",
                // Don't touch
                "c":   "c",
                "^c":  "^c",
                "_d":  "_d",
                "d":   "d",
                "^d":  "^d",
                "_e":  "_e",
                "e":   "e",
                "f":   "f",
                "^f":  "^f",
                "_g":  "_g",
                "g":   "g",
                "^g":  "^g",
                "_a":  "_a",
                "a":   "a",
                "^a":  "^a",
                "_b":  "_b",
                "b":   "b",
                "c'":  "c'",
                "^c'": "^c'",
                "_d'": "_d'",
                "d'":  "d'",
                "^d'": "^d'",
                "_e'": "_e'",
                "e'":  "e'",
                "f'":  "f'",
                "^f'": "^f'",
                "_g'": "_g'",
                "g'":  "g'",
                "=c":  "=c",
                "=d":  "=d",
                "=e":  "=e",
                "=f":  "=f",
                "=g":  "=g",
                "=a":  "=a",
                "=b":  "=b",
                "=c'": "=c'",
                "=d'": "=d'",
                "=e'": "=e'",
                "=f'": "=f'",
                "=g'": "=g'",


            };

            var thisGlyph = glyph_map[note];

            if (!thisGlyph){
                return "x ";
            }

            return thisGlyph;           
        }
    }

    // Returns an array of Notes from the ABC string input
    function getAbcNotes(input,doInverse,isForPDF) {

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
                
                var theGlyph = getNoteGlyph(unNormalizedValue,doInverse,isForPDF);

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

    //
    // Main processor
    //
    function generateTablature(theABC,doInverse) {

        var nTunes = countTunes(theABC);

        var result = FindPreTuneHeader(theABC);

        for (var i = 0; i < nTunes; ++i) {

            var thisTune = getTuneByIndex(theABC, i);

            // Don't inject section header tune fragments or multi-voice tunes
            if (isSectionHeader(thisTune) || isMultiVoiceTune(thisTune)){
                result += thisTune;
                continue;
            }


            thisTune = transformABC(thisTune,doInverse,isForPDF);

            result += thisTune;

        }

        return result;
    }


    return generateTablature(theABC,doInverse);

}

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
// Put the whole thing in a function for isolation
//
var fiddleFingeringsGenerator = function (theABC,stringNameStyle){

    var verbose = false;

    var abcOutput = "";

    // Globals
    var keySignature = null;

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

    //
    // Merges the tablature with the original string input.
    //
    function mergeTablature(input, notes) {

        var result = input;
        
        var insertedTotal = 0;

        var location = parseInt(gInjectTab_TabLocation);

        for (var i = 0; i < notes.length; ++i) {

            var index = notes[i].index + insertedTotal;

            var glyph = notes[i].glyph;

            var glyphLen = glyph.length;

            switch (location){

                // Above
                case 0:
                    // Add double quotes to tab, to be rendered above the note
                    var theTab = "\"^" + glyph + "\"";

                    break;

                // Below
                case 1:

                    // Add double quotes to tab, to be rendered above the note
                    var theTab = "\"_" + glyph + "\"";

                    break;

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
    // From a note name, gets the fingering
    //
    function getNoteGlyph(note){

        var glyph_map = {
            "G,":  "0",
            "^G,": "1",
            "_A,": "1",
            "A,":  "1",
            "^A,": "2",
            "_B,": "2",
            "B,":  "2",
            "C":   "3",
            "^C":  "3",
            "_D":  "3",
            "D":   "0",
            "^D":  "1",
            "_E":  "1",
            "E":   "1",
            "F":   "2",
            "^F":  "2",
            "_G":  "2",
            "G":   "3",
            "^G":  "3",
            "_A":  "3",
            "A":   "0",
            "^A":  "1",
            "_B":  "1",
            "B":   "1",
            "c":   "2",
            "^c":  "2",
            "_d":  "2",
            "d":   "3",
            "^d":  "3",
            "_e":  "3",
            "e":   "0",
            "f":   "1",
            "^f":  "1",
            "_g":  "1",
            "g":   "2",
            "^g":  "2",
            "_a":  "2",
            "a":   "3",
            "^a":  "3",
            "_b":  "3",
            "b":   "4",
            "c'":  "4",
            "^c'": "4",
            "_d'": "4",
            "d'":  "4",
        };

        var thisGlyph = glyph_map[note];

        if (!thisGlyph){
            return "x ";
        }

        return thisGlyph;
        
    }

    //
    // From a note name, gets the string name and fingering
    //
    function getNoteGlyphWithStringName(note){

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


    //
    // From a note name, gets the string name and fingering
    //
    function getNoteGlyphWithStringName2(note){

        var glyph_map = {
            "G,":  "G;0",
            "^G,": "G;1",
            "_A,": "G;1",
            "A,":  "G;1",
            "^A,": "G;2",
            "_B,": "G;2",
            "B,":  "G;2",
            "C":   "G;3",
            "^C":  "G;3",
            "_D":  "G;3",
            "D":   "D;0",
            "^D":  "D;1",
            "_E":  "D;1",
            "E":   "D;1",
            "F":   "D;2",
            "^F":  "D;2",
            "_G":  "D;2",
            "G":   "D;3",
            "^G":  "D;3",
            "_A":  "D;3",
            "A":   "A;0",
            "^A":  "A;1",
            "_B":  "A;1",
            "B":   "A;1",
            "c":   "A;2",
            "^c":  "A;2",
            "_d":  "A;2",
            "d":   "A;3",
            "^d":  "A;3",
            "_e":  "A;3",
            "e":   "E;0",
            "f":   "E;1",
            "^f":  "E;1",
            "_g":  "E;1",
            "g":   "E;2",
            "^g":  "E;2",
            "_a":  "E;2",
            "a":   "E;3",
            "^a":  "E;3",
            "_b":  "E;3",
            "b":   "E;4",
            "c'":  "E;4",
            "^c'": "E;4",
            "_d'": "E;4",
            "d'":  "E;4",
        };

        var thisGlyph = glyph_map[note];

        if (!thisGlyph){
            return "x ";
        }

        return thisGlyph;
        
    }

    //
    // From a note name, gets the string name and fingering
    //
    function getNoteGlyphWithStringName3(note){

        var glyph_map = {
            "G,":  "0;G",
            "^G,": "1;G",
            "_A,": "1;G",
            "A,":  "1;G",
            "^A,": "2;G",
            "_B,": "2;G",
            "B,":  "2;G",
            "C":   "3;G",
            "^C":  "3;G",
            "_D":  "3;G",
            "D":   "0;D",
            "^D":  "1;D",
            "_E":  "1;D",
            "E":   "1;D",
            "F":   "2;D",
            "^F":  "2;D",
            "_G":  "2;D",
            "G":   "3;D",
            "^G":  "3;D",
            "_A":  "3;D",
            "A":   "0;A",
            "^A":  "1;A",
            "_B":  "1;A",
            "B":   "1;A",
            "c":   "2;A",
            "^c":  "2;A",
            "_d":  "2;A",
            "d":   "3;A",
            "^d":  "3;A",
            "_e":  "3;A",
            "e":   "0;E",
            "f":   "1;E",
            "^f":  "1;E",
            "_g":  "1;E",
            "g":   "2;E",
            "^g":  "2;E",
            "_a":  "2;E",
            "a":   "3;E",
            "^a":  "3;E",
            "_b":  "3;E",
            "b":   "4;E",
            "c'":  "4;E",
            "^c'": "4;E",
            "_d'": "4;E",
            "d'":  "4;E",
        };

        var thisGlyph = glyph_map[note];

        if (!thisGlyph){
            return "x ";
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
                
                var theGlyph;

                switch (stringNameStyle){
                    case 0:
                        theGlyph = getNoteGlyph(normalizedValue);
                        break
                    case 1:
                        theGlyph = getNoteGlyphWithStringName(normalizedValue);
                        break
                    case 2:
                        theGlyph = getNoteGlyphWithStringName2(normalizedValue);
                        break
                    case 3:
                        theGlyph = getNoteGlyphWithStringName3(normalizedValue);
                        break
                    default:
                        theGlyph = getNoteGlyph(normalizedValue);
                        break

                }

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

    //
    // Main processor
    //
    function generateFiddleFingeringTab(theABC) {

        // Count the tunes in the ABC
        var theTunes = theABC.split(/^X:.*$/gm);
        var nTunes = theTunes.length - 1;
        var musicSpace = gInjectTab_MusicSpace;
        var fontFamily = gInjectTab_FontFamily;
        var tabFontSize = gInjectTab_TabFontSize;
        var staffSep = gInjectTab_StaffSep;
        var tabLocation = parseInt(gInjectTab_TabLocation);
        var stripChords = gInjectTab_StripChords;

        var result = FindPreTuneHeader(theABC);
        
        var location = parseInt(gInjectTab_TabLocation);

        for (var i = 0; i < nTunes; ++i) {

            var thisTune = getTuneByIndex(theABC, i);

            // Don't inject section header tune fragments or multi-voice tunes
            if (isSectionHeader(thisTune) || isMultiVoiceTune(thisTune)){
                result += thisTune;
                continue;
            }

            // Strip any existing tab
            thisTune = StripTabOne(thisTune);

            // Strip chords? 
            // Above always strips
            // Below only strips if specified in the settings
            if ((tabLocation == 0) || ((tabLocation == 1) && (stripChords))){
                thisTune = StripChordsOne(thisTune);
            }

            thisTune = generate_tab(thisTune);

            thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%staffsep " + staffSep);
            thisTune = InjectStringAboveTuneHeaderConditional(thisTune, "%%annotationfont " + fontFamily + " " + tabFontSize);

            if (location == 0){
                thisTune = InjectStringAboveTuneHeaderConditional(thisTune, "%%musicspace " + musicSpace);
            }

            result += thisTune;

        }

       return result;

    }

    return generateFiddleFingeringTab(theABC);

}


//
// md-tab-generator.js
//
// ABC Muscial Notation Converter for Mountain Dulcimer
//
// Annotates an ABC format tune with tablature
// for DAD tuned mountain dulcimer
//
// Michael Eskin
// https://michaeleskin.com
//
// ABC parsing algorithm by James van Donsel
//
// Released under CC0 - No Rights Reserved
// https://creativecommons.org/share-your-work/public-domain/cc0/
//
// Put the whole thing in a function for isolation
//
var MDTablatureGenerator = function (theABC){

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
    //
    function generate_tab(abcInput){

        log("Got input:" + abcInput);

        // style - For future expansion
        var style = parseInt(gMDulcimerStyle);

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

            // Add double quotes to tab, to be rendered below the note
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
    // From a note name, gets the button string
    //
    function getNoteGlyph(note,style){

        switch (style){

            case 0:
                var glyph_map_linear_dad = {
                    "D,":  " ; ;0",
                    "E,":  " ; ;1",
                    "^F,": " ; ;2",
                    "_G,": " ; ;2",
                    "G,":  " ; ;3",
                    "^G,": " ;6+; ",
                    "_A,": " ;6+; ",
                    "A,":  " ; ;4",
                    "B,":  " ; ;5",
                    "C":   " ; ;6",
                    "^C":  " ; ;6+",
                    "_D":  " ; ;6+",
                    "D":   " ; ;0",
                    "E":   " ; ;1",
                    "^F":  " ; ;2",
                    "_G":  " ; ;2",
                    "G":   " ; ;3",
                    "^G":  " ;6+; ",
                    "_A":  " ;6+; ",
                    "A":   " ; ;4",
                    "B":   " ; ;5",
                    "c":   " ; ;6",
                    "^c":  " ; ;6+",
                    "_d":  " ; ;6+",
                    "d":   " ; ;7",
                    "e":   " ; ;8",
                    "^f":  " ; ;9",
                    "_g":  " ; ;9",
                    "g":   " ; ;10",
                    "^g":  " ;6+; ",
                    "_a":  " ;6+; ",
                    "a":   " ; ;11",
                    "b":   " ; ;12",
                    "c'":  " ; ;6",
                    "^c'": " ; ;6+",
                    "_d'": " ; ;6+",
                    "d'":  " ; ;7",
                    "e'":  " ; ;8",
                    "^f'": " ; ;9",
                    "_g'": " ; ;9",
                    "g'":  " ; ;10"
                };

                var thisGlyph = glyph_map_linear_dad[note];

                if (!thisGlyph){
                    return "x;x;x";
                }

                if (gMDulcimerUseDashForOpenString){
                    thisGlyph = thisGlyph.replaceAll(" ","-");
                }
             
                return thisGlyph;

                break;

            case 1:
               var glyph_map_cross_string_dad = {
                    "D,":  "0; ; ",
                    "E,":  "1; ; ",
                    "^F,": "2; ; ",
                    "_G,": "2; ; ",
                    "G,":  "3; ; ",
                    "^G,": " ;6+; ",
                    "_A,": " ;6+; ",
                    "A,":  " ;0; ",
                    "B,":  " ;1; ",
                    "C":   "6; ; ",
                    "^C":  " ;2; ",
                    "_D":  " ;2; ",
                    "D":   "0; ; ",
                    "E":   "1; ; ",
                    "^F":  "2; ; ",
                    "_G":  "2; ; ",
                    "G":   "3; ; ",
                    "^G":  " ;6+; ",
                    "_A":  " ;6+; ",
                    "A":   " ;0; ",
                    "B":   " ;1; ",
                    "c":   "6; ; ",
                    "^c":  " ;2; ",
                    "_d":  " ;2; ",
                    "d":   " ; ;0",
                    "e":   " ; ;1",
                    "^f":  " ; ;2",
                    "_g":  " ; ;2",
                    "g":   " ; ;3",
                    "^g":  " ;6+; ",
                    "_a":  " ;6+; ",
                    "a":   " ; ;4",
                    "b":   " ; ;5",
                    "c'":  " ; ;6",
                    "^c'": " ; ;6+",
                    "_d'": " ; ;6+",
                    "d'":  " ; ;7",
                    "e'":  " ; ;8",
                    "^f'": " ; ;9",
                    "_g'": " ; ;9",
                    "g'":  " ; ;10"
                };

                var thisGlyph = glyph_map_cross_string_dad[note];

                if (gMDulcimerUseDashForOpenString){
                    thisGlyph = thisGlyph.replaceAll(" ","-");
                }

                if (!thisGlyph){
                    return "x;x;x";
                }
             
                return thisGlyph;
                break;

            case 2:
                var glyph_map_linear_dgd = {
                    "D,":  " ; ;0",
                    "E,":  " ; ;1",
                    "F,":  " ;6; ",
                    "^F,": " ; ;2",
                    "_G,": " ; ;2",
                    "G,":  " ; ;3",
                    "A,":  " ; ;4",
                    "B,":  " ; ;5",
                    "C":   " ;3; ",
                    "^C":  " ; ;6+",
                    "_D":  " ; ;6+",
                    "D":   " ; ;0",
                    "E":   " ; ;1",
                    "F":   " ;6; ",
                    "^F":  " ; ;2",
                    "_G":  " ; ;2",
                    "G":   " ; ;3",
                    "A":   " ; ;4",
                    "B":   " ; ;5",
                    "c":   " ; ;6",
                    "^c":  " ; ;6+",
                    "_d":  " ; ;6+",
                    "d":   " ; ;7",
                    "e":   " ; ;8",
                    "f":   " ;6; ",
                    "^f":  " ; ;9",
                    "_g":  " ; ;9",
                    "g":   " ; ;10",
                    "a":   " ; ;11",
                    "b":   " ; ;12",
                    "c'":  " ; ;6",
                    "^c'": " ; ;6+",
                    "_d'": " ; ;6+",
                    "d'":  " ; ;7",
                    "e'":  " ; ;8",
                    "f'":  " ;6; ",
                    "^f'": " ; ;9",
                    "_g'": " ; ;9",
                    "g'":  " ; ;10"
               };

                var thisGlyph = glyph_map_linear_dgd[note];

                if (!thisGlyph){
                    return "x;x;x";
                }

                if (gMDulcimerUseDashForOpenString){
                    thisGlyph = thisGlyph.replaceAll(" ","-");
                }
             
                return thisGlyph;

                break;

            case 3:
               var glyph_map_cross_string_dgd = {
                    "D,":  "0; ; ",
                    "E,":  "1; ; ",
                    "F,":  " ;6; ",
                    "^F,": "2; ; ",
                    "_G,": "2; ; ",
                    "G,":  " ;0; ",
                    "A,":  " ;1; ",
                    "B,":  " ;2; ",
                    "C":   " ;3; ",
                    "^C":  "6+; ; ",
                    "_D":  "6+; ; ",
                    "D":   "0; ; ",
                    "E":   "1; ; ",
                    "F":   " ;6; ",
                    "^F":  "2; ; ",
                    "_G":  "2; ; ",
                    "G":   " ;0; ",
                    "A":   " ;1; ",
                    "B":   " ;2; ",
                    "c":   " ;3; ",
                    "^c":  "6+; ; ",
                    "_d":  "6+; ; ",
                    "d":   " ; ;0",
                    "e":   " ; ;1",
                    "f":   " ;6; ",
                    "^f":  " ; ;2",
                    "_g":  " ; ;2",
                    "g":   " ; ;3",
                    "a":   " ; ;4",
                    "b":   " ; ;5",
                    "c'":  " ; ;6",
                    "^c'": " ; ;6+",
                    "_d'": " ; ;6+",
                    "d'":  " ; ;7",
                    "e'":  " ; ;8",
                    "f'":  " ;6; ",
                    "^f'": " ; ;9",
                    "_g'": " ; ;9",
                    "g'":  " ; ;10"
                };

                var thisGlyph = glyph_map_cross_string_dgd[note];

                if (!thisGlyph){
                    return "x;x;x";
                }

                if (gMDulcimerUseDashForOpenString){
                    thisGlyph = thisGlyph.replaceAll(" ","-");
                }
             
                return thisGlyph;
                break; 

            case 4:

                var glyph_map_linear_daa = {
                    "G,":  "3; ; ",
                    "^G,": " ; ;6+",
                    "_A,": " ; ;6+",
                    "A,":  " ; ;0",
                    "B,":  " ; ;1",
                    "C":   "6; ; ",
                    "^C":  " ; ;2",
                    "_D":  " ; ;2",
                    "D":   "0; ; ",
                    "E":   "1; ; ",
                    "^F":  "2; ; ",
                    "_G":  "2; ; ",
                    "G":   "3 ; ;",
                    "^G":  " ; ;6+",
                    "_A":  " ; ;6+",
                    "A":   " ; ;0",
                    "B":   " ; ;1",
                    "c":   "6; ; ",
                    "^c":  " ; ;2",
                    "_d":  " ; ;2",
                    "d":   " ; ;3",
                    "e":   " ; ;4",
                    "^f":  " ; ;5",
                    "_g":  " ; ;5",
                    "g":   " ; ;6",
                    "^g":  " ; ;6+",
                    "_a":  " ; ;6+",
                    "a":   " ; ;7",
                    "b":   " ; ;8",
                    "c'":  "6; ; ",
                    "^c'": " ; ;9",
                    "_d'": " ; ;9",
                    "d'":  " ; ;10",
                    "e'":  " ; ;11",
                    "^f'": " ; ;12",
                    "_g'": " ; ;12",
                 };

                var thisGlyph = glyph_map_linear_daa[note];

                if (!thisGlyph){
                    return "x;x;x";
                }

                if (gMDulcimerUseDashForOpenString){
                    thisGlyph = thisGlyph.replaceAll(" ","-");
                }
             
                return thisGlyph;

                break;

            case 5:

                // Blank tab
                var thisGlyph = " ; ; ";

                if (gMDulcimerUseDashForOpenString){
                    thisGlyph = "-;-;-";
                }
             
                return thisGlyph;

                break;
        }

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
    // Get the notes for a tune without the header
    //
    function removeABCTuneHeaders(abcTune) {

      // Use a regular expression to match and remove header lines
      const headerPattern = /^(X:|T:|M:|K:|L:|Q:|W:|Z:|R:|C:|A:|O:|P:|N:|G:|H:|B:|D:|F:|S:|I:|:[A-Za-z]:)[^\r\n]*\r?\n?/gm;
      const tuneWithoutHeaders = abcTune.replace(headerPattern, '');
      
      return tuneWithoutHeaders;
    }


    //
    // Inject anything just below the header
    //
    function InjectStringBelowTuneHeader(theTune,theString){

        var theOriginalTune = theTune;

        theTune = theTune.trim();

        // Find the notes below the header
        var theNotes = removeABCTuneHeaders(theTune);

        theNotes = theNotes.trim();

        var theLines = theNotes.split("\n");

        // Find the first line that doesn't start with a comment
        var nLines = theLines.length;

        var firstLine;
        var bGotNotes = false;

        for (var i=0;i<nLines;++i){

            firstLine = theLines[i];

            if (firstLine.indexOf("%") != 0){
                bGotNotes = true;
                var theFirstLineIndex = theNotes.indexOf(firstLine);
                theNotes = theNotes.substring(theFirstLineIndex);
                break;
            } 
        }

        // Didn't find anything below the header, exit early
        if (!bGotNotes){

            return(theOriginalTune);

        }

        // Find the offset into the tune of the first line of notes in the trimmed version
        var theNotesIndex = theTune.indexOf(firstLine);

        theTune = theTune.substring(0,theNotesIndex);
        theTune += theString;
        theTune += "\n"+theNotes+"\n\n";

        return theTune;
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
    function generateMDtab(theABC) {

        // Count the tunes in the ABC
        var theTunes = theABC.split(/^X:.*$/gm);
        var nTunes = theTunes.length - 1;

        var fontFamily = gInjectTab_FontFamily;
        var tabFontSize = gInjectTab_TabFontSize;
        var staffSep = gInjectTab_StaffSep;
        var tabLocation = parseInt(gInjectTab_TabLocation);
        var stripChords = gInjectTab_StripChords;

        var result = FindPreTuneHeader(theABC);

        gExcludedFromMDSolution = [];

        for (var i = 0; i < nTunes; ++i) {

            var thisTune = getTuneByIndex(theABC, i);

            // Don't inject section header tune fragments or multi-voice tunes
            if (isSectionHeader(thisTune) || isMultiVoiceTune(thisTune)){
                result += thisTune;
                continue;
            }

            // Strip any existing ornaments
            thisTune = StripOrnamentsOne(thisTune);

            // Strip any existing tab
            thisTune = StripTabOne(thisTune);

            // Strip chords? 
            // Above always strips
            // Below only strips if specified in the settings
            if (stripChords){
                thisTune = StripChordsOne(thisTune);
            }

            thisTune = generate_tab(thisTune);

            // Default directives to inject into every tune
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

            thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%staffsep " + staffSep);
            thisTune = InjectStringAboveTuneHeaderConditional(thisTune, "%%annotationfont " + fontFamily + " " + tabFontSize);

            // Stripping out tunes that don't have complete tab solutions?
            if (gMDulcimerStripBadTunes){
                
                if (thisTune.indexOf('"_x;x;x"') != -1){
                    
                    // Get the tune name
                    var theTitle = getTuneTitle(thisTune);

                    gExcludedFromMDSolution.push(theTitle);

                    thisTune = "";
                }
            }

            result += thisTune;

        }

        return result;

    }

    return generateMDtab(theABC);

}

//
// shapenote.js
//
// ABC Muscial Notation Converter for Shape Note Shapes
//
// Annotates an ABC format tune with Shape Note Shapes
//
// Michael Eskin
// https://michaeleskin.com
//
// ABC parsing algorithm by James van Donsel
//
// Released under CC0 - No Rights Reserved
// https://creativecommons.org/share-your-work/public-domain/cc0/
//
var shapeNoteGenerator = function (theABC){

    var verbose = false;

    // Globals
    var abcOutput = "";
    var gKeySignature = null;
    var gTheKey = null;
    var gTheMode = "Major";

    function log(s) {
        if (verbose)
            console.log(s);
    }

    //
    // Generate the shape note tab
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

        // Strip any trailing comments
        var searchExp = /%.*/
        keyExtra = keyExtra.replace(searchExp,"");
        keyExtra = keyExtra.trim();

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
            gTheMode = "Major";
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
            gTheMode = "Major";
            myMap = keySignatureMap(keySignatureBase, 4);
        } else if (keyExtra.search("loc") != -1) {
            log("Mode: Locrian");
            // Force non-moveable
            gTheMode = "Major";
            myMap = keySignatureMap(keySignatureBase, 5);
        } else if (keyExtra.search("lyd") != -1) {
            log("Mode: Lydian");
            // Force non-moveable
            gTheMode = "Major";
            myMap = keySignatureMap(keySignatureBase, -1);
        } else if (keyExtra.search("exp") != -1) {
            log("(Accidentals to be explicitly specified)");
            // Force non-moveable
            gTheMode = "Major";
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

        //console.log("gTheMode = "+gTheMode);

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

            theTab = glyph;
            
            var theNote = notes[i].normalizedValue;

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

    var scaleMapNaturals = {
        "^b":  0,
        "=c":  0,
        "_d":  1,
        "=d":  2,
        "_f":  4,
        "=e":  4,
        "^e":  5,
        "=f":  5,
        "_g":  6,
        "=g":  7,
        "_a":  8,
        "=a":  9,
        "_b":  10,
        "=b":  11,
        "_c":  11
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

    var inverseScaleMapNaturals = {
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
        //debugger;

        // Lower case
        note = note.toLowerCase();

        // No octave marks
        note = note.replaceAll(",","");
        note = note.replaceAll("'","");

        var isSharpKey = true;

        if (gKeySignature.flats != ""){
            isSharpKey = false;
        }

        // Note names and fixed Do are always at C, doesn't do 6 La alteration, but recognizes key signatures for flat/sharps
        if ((gShapeNoteStyle == 6) || (gShapeNoteStyle == 7) || (gShapeNoteStyle == 8)){
            gTheKey = "C";
            gTheMode = "Major";
        }

        var theOffset = modeMap[gTheKey];

        //console.log("theOffset: "+theOffset);
        
        //console.log("note in: "+note);

        if (isSharpKey){

            var theNoteIndex = scaleMapSharps[note];

            //console.log("doing sharps - theNoteIndex after scaleMapSharps = "+ theNoteIndex);

            var flipAccidental = false;
            var isNaturals = false;
            if (theNoteIndex === undefined){

                theNoteIndex = scaleMapFlats[note];
                
                if ((theNoteIndex !== undefined)){

                    flipAccidental = true;

                    //console.log("doing sharps - theNoteIndex after scaleMapFlats = "+ theNoteIndex);

                }
                else{

                    //console.log("doing sharps - not sharp or flat: "+note);

                    theNoteIndex = scaleMapNaturals[note];

                    isNaturals = true;
                    
                    //console.log("doing sharps - theNoteIndex after scaleMapNaturals = "+ theNoteIndex);
                }

            }


            // Note names, fixed Do, or movable do with no La don't do La minor modification
            if ((gShapeNoteStyle != 6) && (gShapeNoteStyle != 7) && (gShapeNoteStyle != 8)){
                if (gTheMode == "Minor"){
                    theNoteIndex -= 3;
                    if (theNoteIndex < 0){
                        theNoteIndex += 12;
                    }
                }
            }

            theNoteIndex -= theOffset;

            if (theNoteIndex < 0){
                theNoteIndex += 12;
            }

            theNoteIndex %= 12;

            if (flipAccidental){

                note = inverseScaleMapFlats[theNoteIndex];

            }
            else 
            if (isNaturals){

                note = inverseScaleMapNaturals[theNoteIndex];
            
            } 
            else{

                note = inverseScaleMapSharps[theNoteIndex];

            }

        }
        else{

            var theNoteIndex = scaleMapFlats[note];

            //console.log("doing flats - theNoteIndex after scaleMapFlats = "+ theNoteIndex);

            var flipAccidental = false;
            var isNaturals = false;
            if ((theNoteIndex === undefined)){

                theNoteIndex = scaleMapSharps[note];
                
                if (theNoteIndex !== undefined){

                    flipAccidental = true;

                    //console.log("doing flats - theNoteIndex after scaleMapSharps = "+ theNoteIndex);

                }
                else{

                    //console.log("doing flats - not sharp or flat: "+note);

                    theNoteIndex = scaleMapNaturals[note];

                    isNaturals = true;
                    
                    //console.log("doing flats - theNoteIndex after scaleMapNaturals = "+ theNoteIndex);
                }

            }

            // Note names, fixed Do, or movable do with no La don't do La minor modification
            if ((gShapeNoteStyle != 6) && (gShapeNoteStyle != 7) && (gShapeNoteStyle != 8)){
                if (gTheMode == "Minor"){
                    theNoteIndex -= 3;
                    if (theNoteIndex < 0){
                        theNoteIndex += 12;
                    }
                 }
            }

            theNoteIndex -= theOffset;

            if (theNoteIndex < 0){
                theNoteIndex += 12;
            }

            theNoteIndex %= 12;

            if (flipAccidental){

                note = inverseScaleMapSharps[theNoteIndex];

            }
            else 
            if (isNaturals){

                note = inverseScaleMapNaturals[theNoteIndex];
            
            }  
            else{

                note = inverseScaleMapFlats[theNoteIndex];

            }

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

        var glyph_map;

        switch (gShapeNoteStyle){

            case 0: // Four shape
                glyph_map = {
                    "^b":  "!style=sn_fa!",
                    "c":   "!style=sn_fa!",
                    "^c":  "!style=sn_fa!",
                    "_d":  "!style=sn_so!",
                    "d":   "!style=sn_so!",
                    "^d":  "!style=sn_so!",
                    "_e":  "!style=sn_la!",
                    "e":   "!style=sn_la!",
                    "_f":  "!style=sn_la!",
                    "^e":  "!style=sn_fa!",
                    "f":   "!style=sn_fa!",
                    "^f":  "!style=sn_fa!",
                    "_g":  "!style=sn_so!",
                    "g":   "!style=sn_so!",
                    "^g":  "!style=sn_so!",
                    "_a":  "!style=sn_la!",
                    "a":   "!style=sn_la!",
                    "^a":  "!style=sn_la!",
                    "_b":  "!style=sn_mi!",
                    "b":   "!style=sn_mi!",
                    "_c":  "!style=sn_mi!"
                };
                break;

            case 1: // Four shape with note names
                glyph_map = {
                    '^b':  '"_fa"!style=sn_fa!',
                    'c':   '"_fa"!style=sn_fa!',
                    '^c':  '"_fa"!style=sn_fa!',
                    '_d':  '"_sol"!style=sn_so!',
                    'd':   '"_sol"!style=sn_so!',
                    '^d':  '"_sol"!style=sn_so!',
                    '_e':  '"_la"!style=sn_la!',
                    'e':   '"_la"!style=sn_la!',
                    '_f':  '"_la"!style=sn_la!',
                    '^e':  '"_fa"!style=sn_fa!',
                    'f':   '"_fa"!style=sn_fa!',
                    '^f':  '"_fa"!style=sn_fa!',
                    '_g':  '"_sol"!style=sn_so!',
                    'g':   '"_sol"!style=sn_so!',
                    '^g':  '"_sol"!style=sn_so!',
                    '_a':  '"_la"!style=sn_la!',
                    'a':   '"_la"!style=sn_la!',
                    '^a':  '"_la"!style=sn_la!',
                    '_b':  '"_mi"!style=sn_mi!',
                    'b':   '"_mi"!style=sn_mi!',
                    '_c':  '"_mi"!style=sn_mi!'
                };
                break;

            case 2: // Four shape note names only
                glyph_map = {
                    '^b':  '"_fa"',
                    'c':   '"_fa"',
                    '^c':  '"_fa"',
                    '_d':  '"_sol"',
                    'd':   '"_sol"',
                    '^d':  '"_sol"',
                    '_e':  '"_la"',
                    'e':   '"_la"',
                    '_f':  '"_la"',
                    '^e':   '"_fa"',
                    'f':   '"_fa"',
                    '^f':  '"_fa"',
                    '_g':  '"_sol"',
                    'g':   '"_sol"',
                    '^g':  '"_sol"',
                    '_a':  '"_la"',
                    'a':   '"_la"',
                    '^a':  '"_la"',
                    '_b':  '"_mi"',
                    'b':   '"_mi"',
                    '_c':   '"_mi"'
                };
                break;

            case 3: // Seven shape
                glyph_map = {
                    '^b':  '!style=sn_do!',
                    'c':   '!style=sn_do!',
                    '^c':  '!style=sn_do!',
                    '_d':  '!style=sn_re!',
                    'd':   '!style=sn_re!',
                    '^d':  '!style=sn_re!',
                    '_e':  '!style=sn_mi!',
                    'e':   '!style=sn_mi!',
                    '_f':  '!style=sn_mi!',
                    '^e':  '!style=sn_fa!',
                    'f':   '!style=sn_fa!',
                    '^f':  '!style=sn_fa!',
                    '_g':  '!style=sn_so!',
                    'g':   '!style=sn_so!',
                    '^g':  '!style=sn_so!',
                    '_a':  '!style=sn_la!',
                    'a':   '!style=sn_la!',
                    '^a':  '!style=sn_la!',
                    '_b':  '!style=sn_ti!',
                    'b':   '!style=sn_ti!',
                    '_c':  '!style=sn_ti!'
                };
                break;

             case 4: // Seven shape with note names
               glyph_map = {
                    '^b':  '"_do"!style=sn_do!',
                    'c':   '"_do"!style=sn_do!',
                    '^c':  '"_do"!style=sn_do!',
                    '_d':  '"_re"!style=sn_re!',
                    'd':   '"_re"!style=sn_re!',
                    '^d':  '"_re"!style=sn_re!',
                    '_e':  '"_mi"!style=sn_mi!',
                    'e':   '"_mi"!style=sn_mi!',
                    '_f':  '"_mi"!style=sn_mi!',
                    '^e':   '"_fa"!style=sn_fa!',
                    'f':   '"_fa"!style=sn_fa!',
                    '^f':  '"_fa"!style=sn_fa!',
                    '_g':  '"_sol"!style=sn_so!',
                    'g':   '"_sol"!style=sn_so!',
                    '^g':  '"_sol"!style=sn_so!',
                    '_a':  '"_la"!style=sn_la!',
                    'a':   '"_la"!style=sn_la!',
                    '^a':  '"_la"!style=sn_la!',
                    '_b':  '"_ti"!style=sn_ti!',
                    'b':   '"_ti"!style=sn_ti!',
                    '_c':  '"_ti"!style=sn_ti!'
                };
                break;

            case 5: // Seven shape only note names
               glyph_map = {
                    '^b':  '"_do"',
                    'c':   '"_do"',
                    '^c':  '"_do"',
                    '_d':  '"_re"',
                    'd':   '"_re"',
                    '^d':  '"_re"',
                    '_e':  '"_mi"',
                    'e':   '"_mi"',
                    '_f':  '"_mi"',
                    '^e':   '"_fa"',
                    'f':   '"_fa"',
                    '^f':  '"_fa"',
                    '_g':  '"_sol"',
                    'g':   '"_sol"',
                    '^g':  '"_sol"',
                    '_a':  '"_la"',
                    'a':   '"_la"',
                    '^a':  '"_la"',
                    '_b':  '"_ti"',
                    'b':   '"_ti"',
                    '_c':  '"_ti"'
                };
                break;

           case 6: // Pitch names
                var glyph_map = {
                    "^b":   '"_C"',
                    "c":   '"_C"',
                    "^c":  '"_C#"',
                    "_d":  '"_D♭"',
                    "d":   '"_D"',
                    "^d":  '"_D#"',
                    "_e":  '"_E♭"',
                    "e":   '"_E"',
                    "_f":  '"_E"',
                    "^e":   '"_F"',
                    "f":   '"_F"',
                    "^f":  '"_F#"',
                    "_g":  '"_G♭"',
                    "g":   '"_G"',
                    "^g":  '"_G#"',
                    "_a":  '"_A♭"',
                    "a":   '"_A"',
                    "^a":  '"_A#"',
                    "_b":  '"_B♭"',
                    "b":   '"_B"',
                    "_c":  '"_B"'
                };
                break;

            case 7: // Fixed solfege at Do no chromatics
                var glyph_map = {
                    "^b":  '"_do"',
                    "c":   '"_do"',
                    "^c":  '"_do"',
                    "_d":  '"_re"',
                    "d":   '"_re"',
                    "^d":  '"_re"',
                    "_e":  '"_mi"',
                    "e":   '"_mi"',
                    "_f":  '"_mi"',
                    "^e":  '"_fa"',
                    "f":   '"_fa"',
                    "^f":  '"_fa"',
                    "_g":  '"_sol"',
                    "g":   '"_sol"',
                    "^g":  '"_sol"',
                    "_a":  '"_la"',
                    "a":   '"_la"',
                    "^a":  '"_la"',
                    "_b":  '"_ti"',
                    "b":   '"_ti"',
                    "_c":  '"_ti"'
                };
                break;

            case 8: // Fixed solfege at Do with chromatics
            case 9: // Movable solfege
            case 10: // Movable solfege with la minor
                var glyph_map = {
                    "^b":   '"_do"',
                    "c":   '"_do"',
                    "^c":  '"_di"',
                    "_d":  '"_ra"',
                    "d":   '"_re"',
                    "^d":  '"_ri"',
                    "_e":  '"_me"',
                    "e":   '"_mi"',
                    "_f":  '"_mi"',
                    "^e":   '"_fa"',
                    "f":   '"_fa"',
                    "^f":  '"_fi"',
                    "_g":  '"_se"',
                    "g":   '"_sol"',
                    "^g":  '"_si"',
                    "_a":  '"_le"',
                    "a":   '"_la"',
                    "^a":  '"_li"',
                    "_b":  '"_te"',
                    "b":   '"_ti"',
                    "_c":  '"_ti"'
                };
                break;
 

        }

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
    function generateTablature(theABC) {

        var fontFamily = gInjectTab_FontFamily;
        var tabFontSize = gInjectTab_TabFontSize;
        var staffSep = gInjectTab_StaffSep;

        // Clear all the params
        gKeySignature = null;
        gTheKey = null;
        gTheMode = "Major";
 
        var nTunes = countTunes(theABC);

        var result = FindPreTuneHeader(theABC);

        for (var i = 0; i < nTunes; ++i) {

            var thisTune = getTuneByIndex(theABC, i);

            // Don't inject section header tune fragments
            if (isSectionHeader(thisTune)){
                result += "\n";
                result += thisTune;
                result += "\n";
                continue;
            }

            thisTune = generate_tab(thisTune);
            
            thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%staffsep " + staffSep);

            // If injecting note names, add the annotation font directive
            switch (gShapeNoteStyle){
                case 1:
                case 2:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                    thisTune = InjectStringAboveTuneHeaderConditional(thisTune, "%%annotationfont " + fontFamily + " " + tabFontSize);
                    break;
                default:
                    break;
            }

            result += thisTune;

            result += "\n";
        }

        result = result.replaceAll("\n\n","\n");

        return result;

    }

    return generateTablature(theABC);

}

//
// Inject ABC note names below the notation
//
var injectABCNoteNames = function (theABC){

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

            var glyphLen = glyph.length;

            theTab = "\"_" +glyph+'"';

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
    // From a note name, gets the note string
    //
    function getNoteGlyph(note){

        if (gShapeNoteStyle == 11){
            // Standard ABC
            var glyph_map = {
                "D,": "D,",
                "^D,": "D#,",
                "_E,": "E♭,",
                "E,":  "E,",
                "^E,": "E#,",
                "_F,":  "F♭,",
                "F,":  "F,",
                "^F,": "F#,",
                "_G,": "G♭,",
                "G,":  "G,",
                "^G,": "G#,",
                "_A,": "A♭,",
                "A,":  "A,",
                "^A,": "A#,",
                "_B,": "B♭,",
                "B,":  "B,",
                "^B,": "B#,",
                "_C":  "C♭",
                "C":   "C",
                "^C":  "C#",
                "_D":  "D♭",
                "D":   "D",
                "^D":  "D#",
                "_E":  "E♭",
                "E":   "E",
                "^E":  "E#",
                "_F":  "F♭",
                "F":   "F",
                "^F":  "F#",
                "_G":  "G♭",
                "G":   "G",
                "^G":  "G#",
                "_A":  "A♭",
                "A":   "A",
                "^A":  "A#",
                "_B":  "B♭",
                "B":   "B",
                "^B":  "B#",
                "_c":  "c♭",
                "c":   "c",
                "^c":  "c#",
                "_d":  "d♭",
                "d":   "d",
                "^d":  "d#",
                "_e":  "e♭",
                "e":   "e",
                "^e": "e#",
                "_f": "f♭",
                "f":   "f",
                "^f":  "f#",
                "_g":  "g♭",
                "g":   "g",
                "^g":  "g#",
                "_a":  "a♭",
                "a":   "a",
                "^a":  "a#",
                "_b":  "b♭",
                "b":   "b",
                "^b":  "b#",
                "_c'": "c♭'",
                "c'":  "c'",
                "^c'": "c#'",
                "_d'": "d♭'",
                "d'":  "d'",
                "^d'": "d#'",
                "_e'": "e♭'",
                "e'":  "e'",
                "^e'": "e#'",
                "_F'":  "F♭'",
                "f'":  "f'",
                "^f'": "f#'",
                "_g'": "g♭'",
                "g'": "g'",
                // Naturals
                "=D,": "D,",
                "=E,":  "E,",
                "=F,":  "F,",
                "=G,":  "G,",
                "=A,":  "A,",
                "=B,":  "B,",
                "=C":   "C,",
                "=D":   "D",
                "=E":   "E",
                "=F":   "F",
                "=G":   "G",
                "=A":   "A",
                "=B":   "B",
                "=c":   "c",
                "=d":   "d",
                "=e":   "e",
                "=f":   "f",
                "=g":   "g",
                "=a":   "a",
                "=b":   "b",
                "=c'":  "c'",
                "=d'":  "d'",
                "=e'":  "e'",
                "=f'":  "f'",
                "=g'":  "g'",
                // Don't touch
                "C'":   "c",
                "^C'":  "c#",
                "_D'":  "d♭",
                "D'":   "d",
                "^D'":  "d#",
                "_E'":  "e♭",
                "E'":   "e",
                "F'":   "f",
                "^F'":  "f#",
                "_G'":  "g♭",
                "G'":   "g",
                "^G'":  "g#",
                "_A'":  "a♭",
                "A'":   "a",
                "^A'":  "a#",
                "_B'":  "b♭",
                "B'":   "b",
                "C''":  "c'",
                "^C''": "c#'",
                "_D''": "d♭'",
                "D''":  "d'",
                "^D''": "d#'",
                "_E''": "e♭'",
                "E''":  "e'",
                "F''":  "f'",
                "^F''": "f#'",
                "_G''": "g♭'",
                "G''":  "g'",               
                "=C'":  "c",
                "=D'":  "d",
                "=E'":  "e",
                "=F'":  "f",
                "=G'":  "g",
                "=A'":  "a",
                "=B'":  "b",
                "=C''": "c'",
                "=D''": "d'",
                "=E''": "e'",
                "=F''": "f'",
                "=G''": "g'",            
            };

            var retVal = glyph_map[note];

            if (!retVal){
                retVal = "x ";
            }

            return retVal;
        }
        else{
            // For Comhaltas transform
            var glyph_map = {
                "D,": "D,",
                "^D,": "D#,",
                "_E,": "E♭,",
                "E,":  "E,",
                "^E,": "E#,",
                "_F,": "F♭,",
                "F,":  "F,",
                "^F,": "F#,",
                "_G,": "G♭,",
                "G,":  "G,",
                "^G,": "G#,",
                "_A,": "A♭,",
                "A,":  "A,",
                "^A,": "A#,",
                "_B,": "B♭,",
                "B,":  "B,",
                "^B,": "B#,",
                "_C":  "C♭,",
                "C":   "C,",
                "^C":  "C,#",
                "_D":  "D♭",
                "D":   "D",
                "^D":  "D#",
                "_E":  "E♭",
                "E":   "E",
                "^E":  "E#",
                "_F":  "F♭",
                "F":   "F",
                "^F":  "F#",
                "_G":  "G♭",
                "G":   "G",
                "^G":  "G#",
                "_A":  "A♭",
                "A":   "A",
                "^A":  "A#",
                "_B":  "B♭",
                "B":   "B",
                "^B":  "B#",
                "_c":  "C♭",
                "c":   "C",
                "^c":  "C#",
                "_d":  "D♭'",
                "d":   "D'",
                "^d":  "D#'",
                "_e":  "E♭'",
                "e":   "E'",
                "^e":  "E#'",
                "_f":  "F♭'",
                "f":   "F'",
                "^f":  "F#'",
                "_g":  "G♭'",
                "g":   "G'",
                "^g":  "G#'",
                "_a":  "A♭'",
                "a":   "A'",
                "^a":  "A#'",
                "_b":  "B♭'",
                "b":   "B'",
                "^b":  "B#'",
                "_c'":  "C♭'",
                "c'":  "C'",
                "^c'": "C#'",
                "_d'": "D♭''",
                "d'":  "D''",
                "^d'": "D#''",
                "_e'": "E♭''",
                "e'":  "E''",
                "^e'": "E#''",
                "_f'":  "F♭''",
                "f'":  "F''",
                "^f'": "F#''",
                "_g'": "G♭''",
                "g'": "G''",
                // Naturals
                "=D,": "D,",
                "=E,":  "E,",
                "=F,":  "F,",
                "=G,":  "G,",
                "=A,":  "A,",
                "=B,":  "B,",
                "=C":   "C,",
                "=D":   "D",
                "=E":   "E",
                "=F":   "F",
                "=G":   "G",
                "=A":   "A",
                "=B":   "B",
                "=c":   "C",
                "=d":   "D'",
                "=e":   "E'",
                "=f":   "F'",
                "=g":   "G'",
                "=a":   "A'",
                "=b":   "B'",
                "=c'":  "C'",
                "=d'":  "D''",
                "=e'":  "E''",
                "=f'":  "F''",
                "=g'":  "G''",
                // Don't touch
                "C'":   "C",
                "^C'":  "C#",
                "_D'":  "D♭'",
                "D'":   "D'",
                "^D'":  "D#'",
                "_E'":  "E♭'",
                "E'":   "E'",
                "F'":   "F'",
                "^F'":  "F#'",
                "_G'":  "G♭'",
                "G'":   "G'",
                "^G'":  "G#'",
                "_A'":  "A♭'",
                "A'":   "A'",
                "^A'":  "A#'",
                "_B'":  "B♭'",
                "B'":   "B'",
                "C''":  "C'",
                "^C''": "C#'",
                "_D''": "D♭''",
                "D''":  "D''",
                "^D''": "D#''",
                "_E''": "E♭''",
                "E''":  "E''",
                "F''":  "F''",
                "^F''": "F#''",
                "_G''": "G♭''",
                "G''":  "G''",               
                "=C'":  "C",
                "=D'":  "D'",
                "=E'":  "E'",
                "=F'":  "F'",
                "=G'":  "G'",
                "=A'":  "A'",
                "=B'":  "B'",
                "=C''": "C'",
                "=D''": "D''",
                "=E''": "E''",
                "=F''": "F''",
                "=G''": "G''",            
            };

            var retVal = glyph_map[note];

            if (!retVal){
                retVal = "x ";
            }

            return retVal;
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
    function generateTablature(theABC) {

        var fontFamily = gInjectTab_FontFamily;
        var tabFontSize = gInjectTab_TabFontSize;
        var staffSep = gInjectTab_StaffSep;
 
        var nTunes = countTunes(theABC);

        var result = FindPreTuneHeader(theABC);

        for (var i = 0; i < nTunes; ++i) {

            var thisTune = getTuneByIndex(theABC, i);

            // Don't inject section header tune fragments
            if (isSectionHeader(thisTune)){
                result += "\n";
                result += thisTune;
                result += "\n";
                continue;
            }

            thisTune = generate_tab(thisTune);
            
            thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%staffsep " + staffSep);
 
            // If injecting note names, add the annotation font directive
            thisTune = InjectStringAboveTuneHeaderConditional(thisTune, "%%annotationfont " + fontFamily + " " + tabFontSize);

            result += thisTune;

            result += "\n";
        }

        result = result.replaceAll("\n\n","\n");

        return result;

    }

    return generateTablature(theABC);

 
}

//
// Inject Diatonic Harmonica Tab below the notes
//
var HarmonicaTabGenerator = function (theABC){

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
    function generate_harmonica_tab(abcInput,harpKey,octaveShift,blowPlus){
       
        // harptab layout (C harp)
        var theTabMap = [];

        switch (gHarmonicaTuning){
            
            // Standard Richter
            case "0":
                theTabMap[0] = "1"; // C
                theTabMap[1] = "-1'"; // C# / Db
                theTabMap[2] = "-1"; // D
                theTabMap[3] = "1o"; // D# / Eb
                theTabMap[4] = "2"; // E
                theTabMap[5] = "-2''"; // F
                theTabMap[6] = "-2'"; // F# / Gb
                theTabMap[7] = "3"; // G
                theTabMap[8] = "-3'''"; // G# / Ab
                theTabMap[9] = "-3''"; // A
                theTabMap[10] = "-3'"; // A# / Bb
                theTabMap[11] = "-3"; // B

                theTabMap[12] = "4"; // C
                theTabMap[13] = "-4'"; // C# / Db
                theTabMap[14] = "-4"; // D
                theTabMap[15] = "4o"; // E# / Eb
                theTabMap[16] = "5"; // E
                theTabMap[17] = "-5"; // F
                theTabMap[18] = "5o"; // F# / Gb
                theTabMap[19] = "6"; // G
                theTabMap[20] = "-6'"; // G# / Ab
                theTabMap[21] = "-6"; // A
                theTabMap[22] = "6o"; // A# / Bb
                theTabMap[23] = "-7"; // B

                theTabMap[24] = "7"; // C
                theTabMap[25] = "-7o"; // C# / Db
                theTabMap[26] = "-8"; // D
                theTabMap[27] = "8'"; // D# / Eb
                theTabMap[28] = "8"; // E
                theTabMap[29] = "-9"; // F
                theTabMap[30] = "9'"; // F# / Gb
                theTabMap[31] = "9"; // G
                theTabMap[32] = "-9o"; // G# / Ab
                theTabMap[33] = "-10"; // A
                theTabMap[34] = "10''"; // A# / Bb
                theTabMap[35] = "10'"; // B

                theTabMap[36] = "10"; // C
                theTabMap[37] = "-10o'"; // C#
                theTabMap[38] = "x"; // D
                theTabMap[39] = "x"; // D# / Eb
                theTabMap[40] = "x"; // E
                theTabMap[41] = "x"; // F
                theTabMap[42] = "x"; // F# / Gb
                theTabMap[43] = "x"; // G
                theTabMap[44] = "x"; // G# / Ab
                theTabMap[45] = "x"; // A
                theTabMap[46] = "x"; // A# / Bb
                theTabMap[47] = "x"; // B
 
                break;

            // Paddy Richter
            case "1":
                theTabMap[0] = "1"; // C
                theTabMap[1] = "-1'"; // C# / Db
                theTabMap[2] = "-1"; // D
                theTabMap[3] = "1o"; // D# / Eb
                theTabMap[4] = "2"; // E
                theTabMap[5] = "-2''"; // F
                theTabMap[6] = "-2'"; // F# / Gb
                theTabMap[7] = "-2"; // G
                theTabMap[8] = "-3'''"; // G# / Ab
                theTabMap[9] = "3"; // A
                theTabMap[10] = "-3'"; // A# / Bb
                theTabMap[11] = "-3"; // B

                theTabMap[12] = "4"; // C
                theTabMap[13] = "-4'"; // C# / Db
                theTabMap[14] = "-4"; // D
                theTabMap[15] = "4o"; // E# / Eb
                theTabMap[16] = "5"; // E
                theTabMap[17] = "-5"; // F
                theTabMap[18] = "5o"; // F# / Gb
                theTabMap[19] = "6"; // G
                theTabMap[20] = "-6'"; // G# / Ab
                theTabMap[21] = "-6"; // A
                theTabMap[22] = "6o"; // A# / Bb
                theTabMap[23] = "-7"; // B

                theTabMap[24] = "7"; // C
                theTabMap[25] = "-7o"; // C# / Db
                theTabMap[26] = "-8"; // D
                theTabMap[27] = "8'"; // D# / Eb
                theTabMap[28] = "8"; // E
                theTabMap[29] = "-9"; // F
                theTabMap[30] = "9'"; // F# / Gb
                theTabMap[31] = "9"; // G
                theTabMap[32] = "-9o"; // G# / Ab
                theTabMap[33] = "-10"; // A
                theTabMap[34] = "10''"; // A# / Bb
                theTabMap[35] = "10'"; // B

                theTabMap[36] = "10"; // C
                theTabMap[37] = "-10o'"; // C#
                theTabMap[38] = "x"; // D
                theTabMap[39] = "x"; // D# / Eb
                theTabMap[40] = "x"; // E
                theTabMap[41] = "x"; // F
                theTabMap[42] = "x"; // F# / Gb
                theTabMap[43] = "x"; // G
                theTabMap[44] = "x"; // G# / Ab
                theTabMap[45] = "x"; // A
                theTabMap[46] = "x"; // A# / Bb
                theTabMap[47] = "x"; // B

                break;   

            // Easy Thirds
            case "2":
                theTabMap[0] = "1"; // C
                theTabMap[1] = "-1'"; // C# / Db
                theTabMap[2] = "-1"; // D
                theTabMap[3] = "1o"; // D# / Eb
                theTabMap[4] = "2"; // E
                theTabMap[5] = "-2"; // F
                theTabMap[6] = "2o"; // F# / Gb 
                theTabMap[7] = "3"; // G
                theTabMap[8] = "-3'"; // G# / Ab
                theTabMap[9] = "-3"; // A
                theTabMap[10] = "3o"; // A# / Bb
                theTabMap[11] = "x"; // B 

                theTabMap[12] = "4"; // C
                theTabMap[13] = "-4'"; // C# / Db
                theTabMap[14] = "-4"; // D
                theTabMap[15] = "4o"; // D# / Eb
                theTabMap[16] = "5"; // E
                theTabMap[17] = "-5"; // F
                theTabMap[18] = "5o"; // F# / Gb
                theTabMap[19] = "6"; // G
                theTabMap[20] = "-6'"; // G# / Ab
                theTabMap[21] = "-6"; // A
                theTabMap[22] = "6o"; // A# / Bb
                theTabMap[23] = "-7"; // B

                theTabMap[24] = "7"; // C
                theTabMap[25] = "-7o"; // C# / Db
                theTabMap[26] = "-8"; // D
                theTabMap[27] = "8'"; // E# / Eb
                theTabMap[28] = "8"; // E
                theTabMap[29] = "-9"; // F
                theTabMap[30] = "9'"; // F# / Gb
                theTabMap[31] = "9"; // G
                theTabMap[32] = "-9o"; // G# / Ab
                theTabMap[33] = "-10"; // A
                theTabMap[34] = "10''"; // A# / Bb
                theTabMap[35] = "10'"; // B

                theTabMap[36] = "10"; // C
                theTabMap[37] = "-10o'"; // C#
                theTabMap[38] = "x"; // D
                theTabMap[39] = "x"; // D# / Eb
                theTabMap[40] = "x"; // E
                theTabMap[41] = "x"; // F
                theTabMap[42] = "x"; // F# / Gb
                theTabMap[43] = "x"; // G
                theTabMap[44] = "x"; // G# / Ab
                theTabMap[45] = "x"; // A
                theTabMap[46] = "x"; // A# / Bb
                theTabMap[47] = "x"; // B
                break;   

            // Melody Maker
            case "3":
                theTabMap[0] = "1"; // C
                theTabMap[1] = "-1'"; // C# / Db
                theTabMap[2] = "-1"; // D
                theTabMap[3] = "1o"; // D# / Eb
                theTabMap[4] = "2"; // E
                theTabMap[5] = "-2''"; // F
                theTabMap[6] = "-2'"; // F# / Gb
                theTabMap[7] = "-2"; // G
                theTabMap[8] = "2o"; // G# / Ab
                theTabMap[9] = "3"; // A
                theTabMap[10] = "-3'"; // A# / Bb
                theTabMap[11] = "-3"; // B

                theTabMap[12] = "4"; // C
                theTabMap[13] = "-4'"; // C# / Db
                theTabMap[14] = "-4"; // D
                theTabMap[15] = "4o"; // E# / Eb
                theTabMap[16] = "5"; // E
                theTabMap[17] = "-5'"; // F
                theTabMap[18] = "-5"; // F# / Gb
                theTabMap[19] = "6"; // G
                theTabMap[20] = "-6'"; // G# / Ab
                theTabMap[21] = "-6"; // A
                theTabMap[22] = "6o"; // A# / Bb
                theTabMap[23] = "-7"; // B

                theTabMap[24] = "7"; // C
                theTabMap[25] = "-7o"; // C# / Db
                theTabMap[26] = "-8"; // D
                theTabMap[27] = "8'"; // D# / Eb
                theTabMap[28] = "8"; // E
                theTabMap[29] = "-8o"; // F
                theTabMap[30] = "-9"; // F# / Gb
                theTabMap[31] = "9"; // G
                theTabMap[32] = "-9o"; // G# / Ab
                theTabMap[33] = "-10"; // A
                theTabMap[34] = "10''"; // A# / Bb
                theTabMap[35] = "10'"; // B

                theTabMap[36] = "10"; // C
                theTabMap[37] = "-10o'"; // C#
                theTabMap[38] = "x"; // D
                theTabMap[39] = "x"; // D# / Eb
                theTabMap[40] = "x"; // E
                theTabMap[41] = "x"; // F
                theTabMap[42] = "x"; // F# / Gb
                theTabMap[43] = "x"; // G
                theTabMap[44] = "x"; // G# / Ab
                theTabMap[45] = "x"; // A
                theTabMap[46] = "x"; // A# / Bb
                theTabMap[47] = "x"; // B
 
                break;    

            // Country
            case "4":
                theTabMap[0] = "1"; // C
                theTabMap[1] = "-1'"; // C# / Db
                theTabMap[2] = "-1"; // D
                theTabMap[3] = "1o"; // D# / Eb
                theTabMap[4] = "2"; // E
                theTabMap[5] = "-2''"; // F
                theTabMap[6] = "-2'"; // F# / Gb
                theTabMap[7] = "-2"; // G
                theTabMap[8] = "-3'''"; // G# / Ab
                theTabMap[9] = "-3''"; // A
                theTabMap[10] = "-3'"; // A# / Bb
                theTabMap[11] = "-3"; // B

                theTabMap[12] = "4"; // C
                theTabMap[13] = "-4'"; // C# / Db
                theTabMap[14] = "-4"; // D
                theTabMap[15] = "4o"; // E# / Eb
                theTabMap[16] = "5"; // E
                theTabMap[17] = "-5'"; // F
                theTabMap[18] = "-5"; // F# / Gb
                theTabMap[19] = "6"; // G
                theTabMap[20] = "-6'"; // G# / Ab
                theTabMap[21] = "-6"; // A
                theTabMap[22] = "6o"; // A# / Bb
                theTabMap[23] = "-7"; // B

                theTabMap[24] = "7"; // C
                theTabMap[25] = "-7o"; // C# / Db
                theTabMap[26] = "-8"; // D
                theTabMap[27] = "8'"; // D# / Eb
                theTabMap[28] = "8"; // E
                theTabMap[29] = "-9"; // F
                theTabMap[30] = "9'"; // F# / Gb
                theTabMap[31] = "9"; // G
                theTabMap[32] = "-9o"; // G# / Ab
                theTabMap[33] = "-10"; // A
                theTabMap[34] = "10''"; // A# / Bb
                theTabMap[35] = "10'"; // B

                theTabMap[36] = "10"; // C
                theTabMap[37] = "-10o'"; // C#
                theTabMap[38] = "x"; // D
                theTabMap[39] = "x"; // D# / Eb
                theTabMap[40] = "x"; // E
                theTabMap[41] = "x"; // F
                theTabMap[42] = "x"; // F# / Gb
                theTabMap[43] = "x"; // G
                theTabMap[44] = "x"; // G# / Ab
                theTabMap[45] = "x"; // A
                theTabMap[46] = "x"; // A# / Bb
                theTabMap[47] = "x"; // B
 
                break;

            // Natural Minor
            case "5":
                theTabMap[0] = "1"; // C
                theTabMap[1] = "-1'"; // C# / Db
                theTabMap[2] = "-1"; // D
                theTabMap[3] = "2"; // D# / Eb
                theTabMap[4] = "-2'''"; // E
                theTabMap[5] = "-2''"; // F
                theTabMap[6] = "-2'"; // F# / Gb
                theTabMap[7] = "-2"; // G
                theTabMap[8] = "-3''"; // G# / Ab
                theTabMap[9] = "-3'"; // A
                theTabMap[10] = "-3"; // A# / Bb
                theTabMap[11] = "3o"; // B

                theTabMap[12] = "4"; // C
                theTabMap[13] = "-4'"; // C# / Db
                theTabMap[14] = "-4"; // D
                theTabMap[15] = "5"; // E# / Eb
                theTabMap[16] = "-5'"; // E
                theTabMap[17] = "-5"; // F
                theTabMap[18] = "5o"; // F# / Gb
                theTabMap[19] = "6"; // G
                theTabMap[20] = "-6'"; // G# / Ab
                theTabMap[21] = "-6"; // A
                theTabMap[22] = "-7"; // A# / Bb
                theTabMap[23] = "7'"; // B

                theTabMap[24] = "7"; // C
                theTabMap[25] = "-7o"; // C# / Db
                theTabMap[26] = "-8"; // D
                theTabMap[27] = "8"; // D# / Eb
                theTabMap[28] = "-8o"; // E
                theTabMap[29] = "-9"; // F
                theTabMap[30] = "9'"; // F# / Gb
                theTabMap[31] = "9"; // G
                theTabMap[32] = "-9o"; // G# / Ab
                theTabMap[33] = "-10"; // A
                theTabMap[34] = "10''"; // A# / Bb
                theTabMap[35] = "10'"; // B

                theTabMap[36] = "10"; // C
                theTabMap[37] = "-10o'"; // C#
                theTabMap[38] = "x"; // D
                theTabMap[39] = "x"; // D# / Eb
                theTabMap[40] = "x"; // E
                theTabMap[41] = "x"; // F
                theTabMap[42] = "x"; // F# / Gb
                theTabMap[43] = "x"; // G
                theTabMap[44] = "x"; // G# / Ab
                theTabMap[45] = "x"; // A
                theTabMap[46] = "x"; // A# / Bb
                theTabMap[47] = "x"; // B
 
                break;

            // Custom
            case "6": 
                theTabMap = gHarmonicaCustom.noteMap;
                break; 

            // Standard Richter
            default:
                theTabMap[0] = "1"; // C
                theTabMap[1] = "-1'"; // C# / Db
                theTabMap[2] = "-1"; // D
                theTabMap[3] = "1o"; // D# / Eb
                theTabMap[4] = "2"; // E
                theTabMap[5] = "-2''"; // F
                theTabMap[6] = "-2'"; // F# / Gb
                theTabMap[7] = "3"; // G
                theTabMap[8] = "-3'''"; // G# / Ab
                theTabMap[9] = "-3''"; // A
                theTabMap[10] = "-3'"; // A# / Bb
                theTabMap[11] = "-3"; // B

                theTabMap[12] = "4"; // C
                theTabMap[13] = "-4'"; // C# / Db
                theTabMap[14] = "-4"; // D
                theTabMap[15] = "4o"; // E# / Eb
                theTabMap[16] = "5"; // E
                theTabMap[17] = "-5"; // F
                theTabMap[18] = "5o"; // F# / Gb
                theTabMap[19] = "6"; // G
                theTabMap[20] = "-6'"; // G# / Ab
                theTabMap[21] = "-6"; // A
                theTabMap[22] = "6o"; // A# / Bb
                theTabMap[23] = "-7"; // B

                theTabMap[24] = "7"; // C
                theTabMap[25] = "-7o"; // C# / Db
                theTabMap[26] = "-8"; // D
                theTabMap[27] = "8'"; // D# / Eb
                theTabMap[28] = "8"; // E
                theTabMap[29] = "-9"; // F
                theTabMap[30] = "9'"; // F# / Gb
                theTabMap[31] = "9"; // G
                theTabMap[32] = "-9o"; // G# / Ab
                theTabMap[33] = "-10"; // A
                theTabMap[34] = "10''"; // A# / Bb
                theTabMap[35] = "10'"; // B

                theTabMap[36] = "10"; // C
                theTabMap[37] = "-10o'"; // C#
                theTabMap[38] = "x"; // D
                theTabMap[39] = "x"; // D# / Eb
                theTabMap[40] = "x"; // E
                theTabMap[41] = "x"; // F
                theTabMap[42] = "x"; // F# / Gb
                theTabMap[43] = "x"; // G
                theTabMap[44] = "x"; // G# / Ab
                theTabMap[45] = "x"; // A
                theTabMap[46] = "x"; // A# / Bb
                theTabMap[47] = "x"; // B
 
                break;
        }    

        log("Got input:" + abcInput);

        // Find the key signature in the input
        keySignature = findKeySignature(abcInput);

        if (keySignature == null) {
            return ("ERROR: Unknown or unsupported key signature");
        }

        // Generate an array of note objects. 
        var notes = getAbcNotes(abcInput,harpKey,octaveShift,blowPlus,theTabMap);

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

            var glyphLen = glyph.length;

            theTab = "\"_" +glyph+'"';

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
    // From a note name, gets the note string
    //
    function getNoteGlyph(note,harpKey,octaveShift,blowPlus,theTabMap){

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

        var theOffset = 0;

        switch (harpKey){
            case "G":
                theOffset = 5;
                break
            case "G#":
                theOffset = 4;
                break
            case "A":
                theOffset = 3;
                break
            case "Bb":
                theOffset = 2;
                break
            case "B":
                theOffset = 1;
                break
            case "C":
                theOffset = 0;
                break
            case "C#":
                theOffset = -1;
                break
            case "D":
                theOffset = -2;
                break
            case "Eb":
                theOffset = -3;
                break
            case "E":
                theOffset = -4;
                break
            case "F":
                theOffset = -5;
                break
            case "F#":
                theOffset = -6;
                break
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
 
        if (noteIndex < 0){
            return "x";
        }

        if ((noteIndex!=0) && (!noteIndex)){
            return "x";
        }

        var retVal = theTabMap[noteIndex];

        if (retVal != "x"){

            if (!retVal){
                return "x";
            }
            else{
                // Stacked hole directions?
                if (gHarmonicaStacking){
                    if (retVal.indexOf("-") != -1){
                        retVal = retVal.replace("-","");
                        retVal += ";-";
                    }
                    else
                    if (blowPlus){
                        retVal = retVal+=";+";
                    }
                }
                else{
                    if (blowPlus){
                        if (retVal.indexOf("-") == -1){
                            retVal = "+"+retVal;
                        }
                    }

                }
            }
        }

        return retVal;

    }

    // Returns an array of Notes from the ABC string input
    function getAbcNotes(input,harpKey,octaveShift,blowPlus,tab) {

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
                
                var theGlyph = getNoteGlyph(normalizedValue,harpKey,octaveShift,blowPlus,tab);

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

    function stripHarmonicaTab(input) {
      return input.split('\n') // Split input into lines
        .filter(line => !/^%%vskip 15$|^%%annotationfont|^%%text\s\w{1,2}\sHarp/.test(line)) // Filter out lines that match the pattern
        .join('\n'); // Join the remaining lines back into a string
    }

    //
    // Main processor
    //
    function generateTablature(theABC) {

        //debugger;

        var fontFamily = gInjectTab_FontFamily;
        var tabFontSize = gInjectTab_TabFontSize;
        var staffSep = gInjectTab_StaffSep;
 
        var nTunes = countTunes(theABC);

        var result = FindPreTuneHeader(theABC);

        for (var i = 0; i < nTunes; ++i) {

            var thisTune = getTuneByIndex(theABC, i);

            // Don't inject section header tune fragments
            if (isSectionHeader(thisTune)){
                result += "\n";
                result += thisTune;
                result += "\n";
                continue;
            }

            // console.log("Before");
            // console.log(thisTune);

            thisTune = stripHarmonicaTab(thisTune);

            // Strip any existing tab
            thisTune = StripTabOne(thisTune);

            // console.log("After");
            // console.log(thisTune);

            thisTune = generate_harmonica_tab(thisTune,gHarmonicaKey,gHarmonicaOctave,gHarmonicaPlusSign)
            
            thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%staffsep " + staffSep);
 
            thisTune = InjectStringAboveTuneHeaderConditional(thisTune, "%%annotationfont " + fontFamily + " " + tabFontSize);

            var harpInfo = "%%text "+gHarmonicaKey+" Harp";

            if (gHarmonicaOctave == 0){
                harpInfo="%%text "+gHarmonicaKey+" Harp";
            }
            else
            if (gHarmonicaOctave == "-1"){
                harpInfo="%%text "+gHarmonicaKey+" Harp / -1 Octave";
            }
            else
            if (gHarmonicaOctave == "1"){
                harpInfo="%%text "+gHarmonicaKey+" Harp / +1 Octave";
            }

            switch (gHarmonicaTuning){
                case "0":
                    harpInfo += " (Standard Richter)\n"
                    break;
                case "1":
                    harpInfo += " (Paddy Richter)\n"
                    break;
                case "2":
                    harpInfo += " (Easy Thirds)\n"
                    break;
                case "3":
                    harpInfo += " (Melody Maker)\n"
                    break;
                case "4":
                    harpInfo += " (Country - Major 7th)\n"
                    break;
                case "5":
                    harpInfo += " (Natural Minor)\n"
                    break;
                case "6":
                    harpInfo += " ("+gHarmonicaCustom.name+")\n"
                    break;
                default:
                    break;
            }

            thisTune = InjectStringBelowTuneHeaderConditional(thisTune, harpInfo);

            thisTune = InjectStringBelowTuneHeaderConditional(thisTune, "%%vskip 15");

            result += thisTune;

            result += "\n";
        }

        result = result.replaceAll("\n\n","\n");

        return result;

    }

    return generateTablature(theABC);

}