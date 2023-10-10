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
// http://michaeleskin.com
//
// Copyright (c) 2013 James van Donsel
//
// Released under CC0 - No Rights Reserved
// https://creativecommons.org/share-your-work/public-domain/cc0/
//

//
// Put the whole thing in a function for isolation
//
var angloFingeringsGenerator = function (theABC){

    var gAngloVerbose = false;

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
    

    // Initialization of the original button map
    var jeffriesMap = null;
    var wheatstoneMap = null;
    var buttonToNoteMap = null;
    var buttonMapIndex = null;

    //
    // Process the button naming matrix at tab build time
    //
    function processButtonNoteNames(map){

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

        for (var i = 0; i < path.states.length; ++i) {

            var index = notes[i].index + insertedTotal;

            var fingering = path.states[i].button.name;

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
        
        angloLog("sanitized input:" + sanitizedInput);

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

    //
    // Strip all comments and comment-based annotations in the ABC
    //
    function angloStripAllComments(theNotes) {

        // Strip out anything that looks like a comment
        var searchRegExp = /%.*[\r\n]*/gm
        theNotes = theNotes.replace(searchRegExp, "");

        return theNotes;

    }

    // 
    // Strip all the chords in the ABC
    //
    function angloStripChords(theNotes) {

        // Strip out chord markings
        var searchRegExp = /"[^"]*"/gm

        // Strip out chord markings
        theNotes = theNotes.replace(searchRegExp, "");

        // Replace the ABC
        return theNotes;

    }

    // Glyphs for bellows push and draw indications
    var PUSH_NAME = "↓";
    var DRAW_NAME = "↑";

    //
    // Generate Anglo Concertina Tablature
    //
    function generateConcertinaFingerings(theABC) {

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

        for (var i = 0; i < nTunes; ++i) {

            var thisTune = angloGetTuneByIndex(theABC, i);

            // Don't inject section header tune fragments
            if ((thisTune.indexOf("T:*") != -1) || (thisTune.indexOf("T: *") != -1)){
                result += thisTune;
                continue;
            }

            thisTune = angloStripAllComments(thisTune);

            // Strip chords? 
            // Above always strips
            // Below only strips if specified in the settings
            if ((tabLocation == 0) || ((tabLocation == 1) && (stripChords))){
                thisTune = angloStripChords(thisTune);
            }
 
            thisTune = generateAngloFingerings(thisTune);

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

            thisTune = InjectStringBelowTuneHeader(thisTune, "%%staffsep " + staffSep);
            thisTune = InjectStringAboveTuneHeader(thisTune, "%%annotationfont " + fontFamily + " " + tabFontSize);
            thisTune = InjectStringAboveTuneHeader(thisTune, "%%musicspace " + musicSpace);

            result += thisTune;

        }

        return result;

    }

    return generateConcertinaFingerings(theABC);

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
// http://michaeleskin.com
//
// Released under CC0 - No Rights Reserved
// https://creativecommons.org/share-your-work/public-domain/cc0/
//

//
// Put the whole thing in a function for isolation
//
var boxTabGenerator = function (theABC){

    var verbose = false;

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

        for (var i = 0; i < nTunes; ++i) {

            var thisTune = getTuneByIndex(theABC, i);

            // Don't inject section header tune fragments
            if ((thisTune.indexOf("T:*") != -1) || (thisTune.indexOf("T: *") != -1)){
                result += thisTune;
                continue;
            }

            thisTune = stripAllComments(thisTune);

            // Strip chords? 
            // Above always strips
            // Below only strips if specified in the settings
            if ((tabLocation == 0) || ((tabLocation == 1) && (stripChords))){
                thisTune = StripChords(thisTune);
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

            thisTune = InjectStringBelowTuneHeader(thisTune, "%%staffsep " + staffSep);
            thisTune = InjectStringAboveTuneHeader(thisTune, "%%annotationfont " + fontFamily + " " + tabFontSize);
            thisTune = InjectStringAboveTuneHeader(thisTune, "%%musicspace " + musicSpace);

            result += thisTune;

        }

        return result

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
// http://michaeleskin.com
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
    // http://michaeleskin.com
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
    // Main processor
    //
    function generateBambooFluteTab(theABC) {

       // Count the tunes in the ABC
        var theTunes = theABC.split(/^X:.*$/gm);
        var nTunes = theTunes.length - 1;

        var fontFamily = gInjectTab_FontFamily;
        var tabFontSize = gInjectTab_TabFontSize;
        var musicSpace = gInjectTab_MusicSpace;
        var staffSep = gInjectTab_StaffSep;
        var tabLocation = parseInt(gInjectTab_TabLocation);
        var stripChords = gInjectTab_StripChords;

        var result = FindPreTuneHeader(theABC);

        for (var i = 0; i < nTunes; ++i) {

            var thisTune = getTuneByIndex(theABC, i);

            // Don't inject section header tune fragments
            if ((thisTune.indexOf("T:*") != -1) || (thisTune.indexOf("T: *") != -1)){
                result += thisTune;
                continue;
            }

            thisTune = stripAllComments(thisTune);

            // Strip chords? 
            if (stripChords){
                thisTune = StripChords(thisTune);
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

            thisTune = InjectStringBelowTuneHeader(thisTune, "%%staffsep " + staffSep);
  
            // Inject the root key indication
            switch (parseInt(gBambooFluteKey)){

                case 0: // C
                    thisTune = InjectStringBelowTuneHeader(thisTune, "%%text ");
                    thisTune = InjectStringBelowTuneHeader(thisTune, "%%text 1=C");
                break;

                case 1: // D
                    thisTune = InjectStringBelowTuneHeader(thisTune, "%%text ");
                    thisTune = InjectStringBelowTuneHeader(thisTune, "%%text 1=D");
                break;
                
                case 2: // G
                    thisTune = InjectStringBelowTuneHeader(thisTune, "%%text ");
                    thisTune = InjectStringBelowTuneHeader(thisTune, "%%text 1=G");
                break;

                case 3: // A
                    thisTune = InjectStringBelowTuneHeader(thisTune, "%%text ");
                    thisTune = InjectStringBelowTuneHeader(thisTune, "%%text 1=A");
                break;

            }

            thisTune = InjectStringAboveTuneHeader(thisTune, "%%annotationfont " + fontFamily + " " + tabFontSize);

            thisTune = InjectStringAboveTuneHeader(thisTune, "%%musicspace " + musicSpace);

            result += thisTune;

        }

        return result

    }

    return generateBambooFluteTab(theABC);

}

