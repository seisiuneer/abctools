/**
 * 
 * app.js - All code for the ABC Transcription Tools
 *
 * Project repo at: https://github.com/seisiuneer/abctools
 * 
 * 
 * MIT License
 * 
 * Copyright (c) 2023 Michael Eskin
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * 
 **/

var gShowAdvancedControls = false;
var gStripAnnotations = false;
var gStripTextAnnotations = false;
var gStripChords = false;
var gStripTab = false;

var STAFFSPACEMIN = 0;
var STAFFSPACEDEFAULT = 10;
var STAFFSPACEMAX = 200;
var STAFFSPACEOFFSET = 40;
var gStaffSpacing = STAFFSPACEOFFSET + STAFFSPACEDEFAULT;

var gIsIOS = false;
var gIsIPad = false;
var gIsIPhone = false;
var gIsSafari = false;
var gIsChrome = false;
var gIsAndroid = false;

var gRenderingPDF = false;

var gTheQRCode = null;

// Maximum number of characters that can be encoded in a QR Code
var MAXQRCODEURLLENGTH = 2300;

// Maximum length of an all tune titles string before truncation
var ALLTITLESMAXLENGTH = 70;

// Font size for PDF headers and footers
var HEADERFOOTERFONTSIZE = 12.0;

// Font size for PDF QR code caption
var QRCODECAPTIONPDFFONTSIZE = 12.0;

var gShowShareControls = false;

var gAllowSave = false;

var gAllowURLSave = false;
var gAllowQRCodeSave = false

var gShowAllControls = false;

var gAllowControlToggle = false

var gAllowFilterAnnotations = false;
var gAllowFilterText = false;
var gAllowFilterChords = false;
var gAllowFilterTab = false;

var gCapo = 0;

var gIsMaximized = false;

var gABCFromFile = false;

var gAllowCopy = false;

var gAllowPDF = false;

var gDisplayedName = "";

var gShowTabNames = true;
var gAllowShowTabNames = false;

// Has the tin whistle font been loaded?
var gWhistleFontPrepared = false;

// Debounce time for text area change render requests
var DEBOUNCEMS = 280;

// Debounce time for tune autoscroll
var AUTOSCROLLDEBOUNCEMS = 250;

// For tune autoscroll state
var gLastAutoScrolledTune = -1;

// Top bar showing?
var gTopBarShowing = true;

// Current tune being rendered
var gCurrentTune = 0;

// Last tune count
var gTotalTunes = 0;

// Current tab display
var gCurrentTab = "noten";

// Did we just do a paste or other operation to programatically change the text area?
var gForceFullRender = false;

// Is this the first render
var gIsFirstRender = true;

// Are we in single or dual column display mode?
var gIsOneColumn = true;

// For handling clicks in notation when maximized
var	gGotRenderDivClick = false;
var gRenderDivClickOffset = -1;

// For local storage of settings
var gLocalStorageAvailable = false;

// PDF oversampling for PDF rendering
var gPDFQuality = 0.75;

// PDF font
var gPDFFont = "Times";
var gPDFFontStyle = "";

// Include page links on tunebook index pages
var gIncludePageLinks = true;

// Force PDF file name
var gDoForcePDFFilename = false;
var gForcePDFFilename = "";

// Add link back to PDF index or TOC
var gAddTOCLinkback = false;
var gAddIndexLinkback = false;

// Links to add at finalize time
var gTuneHyperlinks = [];
var gAddTheSessionHyperlinks = false;
var gAddPlaybackHyperlinks = false;
var gAddPlaybackHyperlinksIncludePrograms = false;
var gPlaybackHyperlinkMelodyProgram = "";
var gPlaybackHyperlinkBassChordProgram = "";
var gPlaybackHyperlinkSoundFont = "";

// Lock out editing on injected playback PDF links
var gInjectEditDisabled = false;

// If true, never show the zoom button
var gDisableEditFromPlayLink = false;

// Full screen view scaling (percentage)
var gFullScreenScaling = 50;

// Anglo concertina button names
var gAngloButtonNames = [];

// Fonts used for rendering
var gRenderingFonts = {
	titlefont: "Palatino 18",
	subtitlefont: "Palatino 13",
	infofont: "Palatino 13",
	partsfont: "Palatino 13",
	tempofont: "Palatino 13",
	textfont: "Palatino 13",
	composerfont: "Palatino 13",
	annotationfont: "Palatino 13",
	gchordfont: "Verdana 12",
	vocalfont: "Palatino 13",
	wordsfont: "Palatino 13",
	tabnumberfont: "Arial 12",
	historyfont: "Times New Roman 14",
	voicefont: "Times New Roman 13"
}

// Mp3 bitrate
var gMP3Bitrate = 224;

// Soundfont to use
var gDefaultSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/";
var gTheActiveSoundFont = gDefaultSoundFont;

// Allow player to autoscroll
var gAutoscrollPlayer = true;

// Auto-swing hornpipes
var gAutoSwingHornpipes = true;

var gAutoSwingFactor = 0.25;

var gAllSwingHornpipesRequested = false;
var gAllSwingHornpipesSwingFactor = 0.25;
var gAllNoSwingHornpipesRequested = false;

// Use the custom GM sounds for dulcimer, accordion, flute, and whistle
var gUseCustomGMSounds = true;

// Use count for tip jar reminder
var gTipJarCount = 0;

// Save the editor state in a snapshot at exit time
var gSaveLastAutoSnapShot = false;

// Notation incipits columns
var gIncipitsColumns = 1;

// Using Comhaltas naming for notes display
var gUseComhaltasABC = false;

// Zoom banner has been hidden
var gZoomBannerHidden = false;

// Initial text box width
var gInitialTextBoxWidth;
var gInitialTextBoxContainerWidth;
var gInitialTextBoxContainerLeft;
var gForceInitialTextBoxRecalc = false;
var gGotWindowResizeWhileMaximized = false;
var gNotationLeftMarginBeforeMaximize = "auto";

var gTheNotation = document.getElementById("notation-holder");

var gAllowMIDIInput = false;

var gIsFromShare = false;

// Have there been changes since last open?
var gIsDirty = false;

// Global reference to the ABC editor
var gTheABC = document.getElementById("abc");


//
// Tune utility functions
// 

//
// Get the title of a tune from the ABC
// 
function getTuneTitle(theTune){

	var neu = escape(theTune);

	var Reihe = neu.split("%0D%0A");

	Reihe = neu.split("%0A");

	for (var j = 0; j < Reihe.length; ++j) {

		Reihe[j] = unescape(Reihe[j]); 

		var Aktuellereihe = Reihe[j].split(""); 

		if (Aktuellereihe[0] == "T" && Aktuellereihe[1] == ":") {

			titel = Reihe[j].slice(2);

			titel = titel.trim();

			// Just grab the first title foiund
			return titel

		}
	}

	return "Unknown";

}

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
// Get the text area character offset to the start of a specific tune by index
//
function findTuneOffsetByIndex(tuneIndex){	
	
	var theNotes = gTheABC.value;

	if (tuneIndex == 0){

		var searchRegExp = /^X:.*[\r\n]*/m 

		var theIndex = theNotes.search(searchRegExp);

		if (theIndex == -1){
			return 0;
		}
		else{
			return theIndex;
		}
	}


	// Find the tunes
	var theTunes = theNotes.split(/^X:/gm);

	var offset = theTunes[0].length;

	for (var i = 1; i <= tuneIndex; ++i) {

		offset += theTunes[i].length + 2; // For the X:
		
	}

	return offset;
	
}

//
// Get the tune number at a character offset into the ABC
//
function findTuneByOffset(start){

	var theNotes = gTheABC.value;

    // Now find all the X: items
    var theTunes = theNotes.split(/^X:/gm);

    var nTunes = theTunes.length;

    // First chunk is whatever is before the first X:
    var theOffset = 0;

    theOffset = theTunes[0].length;

    for (var i=1;i<nTunes;++i){

    	// Account for the X: stripped in the length
    	theOffset += theTunes[i].length+2;

    	// Is the offset in the last chunk?
    	if (start < theOffset){

    		return i-1;

    	}

    }

    // Off the end 
    return nTunes-2;
 }

//
// Return the tune ABC at a specific index
//
//
function getTuneByIndex(tuneNumber){

	var theNotes = gTheABC.value;

    // Now find all the X: items
    var theTunes = theNotes.split(/^X:/gm);

 	return ("X:"+theTunes[tuneNumber+1]);

}

//
// Get the currently selected text in a textbox
//
function getSelectedText(id)
{
    // Obtain the object reference for the <textarea>
    var txtarea = document.getElementById(id);

    // Obtain the index of the first selected character
    var start = txtarea.selectionStart;

    // Obtain the index of the last selected character
    var finish = txtarea.selectionEnd;

    // Obtain the selected text
    var sel = txtarea.value.substring(start, finish);

    return sel;

}

//
// Find the tune around the selection point
//
function findSelectedTune(){

	var theNotes = gTheABC.value;

    // Obtain the object reference for the <textarea>
    var txtarea = gTheABC;

    // Obtain the index of the first selected character
    var start = txtarea.selectionStart;

    if (start == 0) {

	    // Common case where a set was just loaded and the cursor is at the start, go find the first position after an X:
		start = theNotes.indexOf("X:")+2;

	}

	// Odd case where there isn't an X:, just return nothing to play
	if (start == 0){

		return "";

	}

	// End of ABC play after paste case fix
	var theABCLength = theNotes.length;
	if (start == theABCLength){
		start = theABCLength-1;
	}

    // Now find all the X: items
    var theTunes = theNotes.split(/^X:/gm);

    var nTunes = theTunes.length;

    // First chunk is whatever is before the first X:
    var theOffset = 0;

    theOffset = theTunes[0].length;

    for (var i=1;i<nTunes;++i){

    	// Account for the X: stripped in the length
    	theOffset += theTunes[i].length+2;

    	// Is the offset in the last chunk?
    	if (start < theOffset){

    		var finalTune = "X:"+theTunes[i];

    		// Strip any trailing whitespace
    		finalTune = finalTune.trimEnd();

    		return (finalTune);

    	}

    }

    return "";

}
			
//
// Get the title of the first tune
//
function GetFirstTuneTitle() {

	var title = "";
	
	var theABC = gTheABC.value;

	theABC = escape(theABC);

	var theLines = theABC.split("%0A");

	for (var i = 0; i < theLines.length; ++i) {
		
		theLines[i] = unescape(theLines[i]); 

		var theChars = theLines[i].split(""); 

		if (theChars[0] == "T" && theChars[1] == ":") {

			title = theLines[i].slice(2);
			
			title = title.trim();

			// Strip out any naughty HTML tag characters
			title = title.replace(/[^a-zA-Z0-9_\-. ]+/ig, '');

			// Replace any spaces
			title = title.replace(/\s/g, '_');

			// Replace any quotes
			title = title.replace(/\'/g, '_');

			break;
		}
	}
	
	return title;
}

//
// Count the tunes in the text area
//
function CountTunes() {

	// Count the tunes in the text area
	var theNotes = gTheABC.value;

	var theTunes = theNotes.split(/^X:.*$/gm);

	var nTunes = theTunes.length - 1;

	// Save the global tune count anytime this is called
	gTotalTunes = nTunes;

	return nTunes;

}

//
// Get all the tune titles
//
function GetAllTuneTitles() {

	var theTitles = [];

	// Mit For Schleife Titel für Dateinamen extrahieren und Leerzeichen ersetzen und Apostrophe entfernen.
	var verarbeiten = gTheABC.value;

	var neu = escape(verarbeiten);

	var Reihe = neu.split("%0D%0A");
	Reihe = neu.split("%0A");

	for (i = 0; i < Reihe.length; ++i) {
		Reihe[i] = unescape(Reihe[i]); /* Macht die Steuerzeichen wieder weg */

		var Aktuellereihe = Reihe[i].split(""); /* nochmal bei C. Walshaw crosschecken, ob alle mögl. ausser K: erfasst. */
		if (Aktuellereihe[0] == "T" && Aktuellereihe[1] == ":") {
			var titel = Reihe[i].slice(2);

			titel = titel.trim();

			theTitles.push(titel);

		}
	}

	var nTitles = theTitles.length;

	var allTitles = "";

	if (nTitles > 0) {

		for (i = 0; i < nTitles; ++i) {

			allTitles += theTitles[i];

			// Limit the length of the string to some maximum number of characters
			if (allTitles.length > ALLTITLESMAXLENGTH){

				var nRemaining = (nTitles-i-1);

				if (nRemaining > 0){

					allTitles = allTitles + " + " + nRemaining + " more";

				}
				
				return allTitles;

			}

			if (i != nTitles - 1) {
				allTitles += " / ";
			}
		}
	}


	return allTitles;
}


//
// Tranpose the ABC up one semitone
//

//
// Find the tune range for the current select
//
function getTuneRangeForTranspose(){

	var theNotes = gTheABC.value;

    // Obtain the object reference for the <textarea>
    var txtarea = gTheABC;

    // Obtain the index of the first selected character
    var theStart = txtarea.selectionStart;

    if (theStart == 0) {

	    // Common case where a set was just loaded and the cursor is at the start, go find the first position after an X:
		theStart = theNotes.indexOf("X:")+2;

	}

	var theEnd = txtarea.selectionEnd

    if (theEnd == 0) {

	    // Common case where a set was just loaded and the cursor is at the start, go find the first position after an X:
		theEnd = theNotes.indexOf("X:")+2;

	}

	var startTune = findTuneByOffset(theStart);

    var endTune = findTuneByOffset(theEnd);

    return {start:startTune,end:endTune};

}

//
// Support function for restoring the selection point after the transpose operation
//
function resetSelectionAfterTranspose(start,end){
	
	// Get the first tune index
	var theStartIndex = findTuneOffsetByIndex(start);
	
	// Get the tune
	var theTune = getTuneByIndex(end);
	
	// Find the last tune in the tunes
	var theEndIndex = findTuneOffsetByIndex(end)+(theTune.length-1);

	// Set the select point
	gTheABC.selectionStart = theStartIndex;
    gTheABC.selectionEnd = theEndIndex;

    // Focus after operation
    FocusAfterOperation();

}

//
// General purpose tranposer for the currently selected tunes
//
function Transpose(transposeAmount) {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	// Keep track of actions
	sendGoogleAnalytics("action","Transpose");

	var nTunes = CountTunes();

	var theTuneRange = getTuneRangeForTranspose();

	//console.log("getTuneRangeForTranspose start = "+theTuneRange.start+" end = "+theTuneRange.end);

	document.getElementById("loading-bar-spinner").style.display = "block";

	// Need a timeout to allow the spinner to show before processing the ABC,
	setTimeout(function(){

		var theNotes = gTheABC.value;

		// Get the rendering params
		var params = GetABCJSParams();

		// Find the tunes
		var theTunes = theNotes.split(/^X:/gm);

		// Create the render div ID array
		var renderDivs = [];

		var id;

		for (var i = 0; i < nTunes; ++i) {

			id = "notation" + i;
			
			renderDivs.push(id);

			// Flash reduction
			var elem = document.getElementById(id);

			elem.style.opacity = 0.0;

		}

		var output = FindPreTuneHeader(theNotes);

		for (var i=1;i<=nTunes;++i){

			theTunes[i] = "X:"+theTunes[i];

			var visualObj = null;

			if (((i-1) >= theTuneRange.start) && ((i-1) <= theTuneRange.end)){

				// Wrap this in a try-catch since sometimes the transposer fails catastrophically
				try {

					//console.log("Transposing tune "+i);

					visualObj = ABCJS.renderAbc(renderDivs[i-1], theTunes[i], params);

					output += ABCJS.strTranspose(theTunes[i], visualObj, transposeAmount);
				}
				catch (error){

					var thePrompt = "Unable to tranpose one or more tunes.";
					
					// Center the string in the prompt
					thePrompt = makeCenteredPromptString(thePrompt);

					DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });
					
					output += theTunes[i];

				}
			}
			else{

				output += theTunes[i];
			}

		}
	
		// Stuff in the transposed output
		gTheABC.value = output;

		// Set dirty
		gIsDirty = true;

		// Reset the selection point to the current tune
		resetSelectionAfterTranspose(theTuneRange.start,theTuneRange.end);

		// Force a full render
		RenderAsync(true, null, function(){

			setTimeout(function(){

				for (var i = 0; i < nTunes; ++i) {

					// Flash reduction
					var elem = document.getElementById(id);

					elem.style.opacity = 1.0;

				}

			},100);

		});


	},100);
	
}

//
// Tranpose the ABC up one semitone
//

function TransposeUp(e) {

	var transposeAmount = 1;

	if (e.shiftKey){
		transposeAmount = 2;
	}

	if (e.altKey){
		transposeAmount = 12;
	}

	Transpose(transposeAmount);

}

//
// Tranpose the ABC down one semitone
//

function TransposeDown(e) {

	var transposeAmount = -1;

	if (e.shiftKey){
		transposeAmount = -2;
	}

	if (e.altKey){
		transposeAmount = -12;
	}

	Transpose(transposeAmount);

}

//
// Get the tune index titles
//
function GetAllTuneTags(theTag,totalTunes){

	var i;

	var theTags = [];

	for (i=0;i<totalTunes;++i){

		var thisTune = getTuneByIndex(i);

		var neu = escape(thisTune);

		var Reihe = neu.split("%0D%0A");

		Reihe = neu.split("%0A");

		var bGotTag = false;

		for (var j = 0; j < Reihe.length; ++j) {

			Reihe[j] = unescape(Reihe[j]); 

			var Aktuellereihe = Reihe[j].split(""); 

			if (Aktuellereihe[0] == theTag && Aktuellereihe[1] == ":") {

				var tagValue = Reihe[j].slice(2);

				tagValue = tagValue.trim();

				// Just grab the first tag
				theTags.push(tagValue);

				bGotTag = true;

				break

			}
		}

		// If the tune is missing the tag, push a dummy value
		if (!bGotTag){
			theTags.push(" ");
		}
	}

	return theTags;
}

//
// Sort the tunes in the ABC text area
//
function SortTunesByTag(theTag){

	const meterWeights = [
	    { name:"C|",  weight:1}, 
	    { name:"C",   weight:2}, 
	   	{ name:"2/2", weight:10},
	   	{ name:"3/2", weight:11},
	    { name:"2/4", weight:7}, 
	    { name:"3/4", weight:8}, 
	    { name:"4/4", weight:3}, 
	    { name:"5/4", weight:12}, 
	    { name:"6/4", weight:9}, 
	    { name:"7/4", weight:13}, 
	    { name:"2/8", weight:14}, 
	    { name:"3/8", weight:15}, 
	    { name:"5/8", weight:16},
	    { name:"6/8", weight:4}, 
	    { name:"7/8", weight:17}, 
	    { name:"9/8", weight:5},
	    { name:"10/8", weight:18},
	    { name:"12/8", weight:6}
	];

	// Get all the tunes
	var theNotes = gTheABC.value;

	var theTunes = theNotes.split(/(^X:.*$)/gm);

	var nTunes = (theTunes.length - 1)/2;

	if (nTunes < 2){
		return;
	}

	var thePrefixABC = theTunes[0];

	//console.log("thePrefixABC: "+thePrefixABC);

	var theTags = GetAllTuneTags(theTag,theTunes.length - 1);

	// Special weighted processing for the meter tag
	var nTags = theTags.length;

	if (theTag == "M"){
		
		var workTags = [];

		for (var i=0;i<nTags;++i){

			var thisMeter = theTags[i];

			var theWeight = 19;

			// Lets see if we have a supported meter
			for (var j=0;j<meterWeights.length;++j){

				if (thisMeter == meterWeights[j].name){

					theWeight = meterWeights[j].weight;
					break;

				}
			}

			workTags.push(theWeight);
		}

		// Replace the tags with meter weights
		theTags = workTags;
	}
	
	var i;

	var tunesToProcess = [];
	var nProcessed = 0;
	var thisTitle;

	for (i=0;i<nTunes;++i){

		if (theTunes[(i*2)+1] != undefined){

			thisTag = theTags[nProcessed];

			nProcessed++;

			//console.log("Tune #"+nProcessed+": "+theTunes[(i*2)+1]+theTunes[(i*2)+2]);

			tunesToProcess.push({tag:thisTag,tune:theTunes[(i*2)+1]+theTunes[(i*2)+2]});

		}

	}

	// Sort tunes by name
	tunesToProcess.sort((a, b) => {

	  const tagA = a.tag;
	  
	  const tagB = b.tag; // ignore upper and lowercase
	  
	  if (tagA < tagB) {
	    return -1;
	  }
	  
	  if (tagA > tagB) {
	    return 1;
	  }

	  // names must be equal
	  return 0;

	});

	theNotes = "";
	theNotes += thePrefixABC;

	// Aggregate the results
	for (i=0;i<nProcessed;++i){

		theNotes += tunesToProcess[i].tune;
	}

	// Put them back in the ABC area
	gTheABC.value = theNotes; 

    // Set dirty
	gIsDirty = true;

	// Reset the selection
	gTheABC.selectionStart = 0;
    gTheABC.selectionEnd = 0;


    // Focus after operation
    FocusAfterOperation();

}

//
// DoSortTunesByMeter command
//
function DoSortTunesByMeter() {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	var elem = document.getElementById("sortbutton");
	if (elem){
		// Give some feedback
		elem.value = "Sorting by Meter";
	}

	setTimeout(function(){

		// Sort the tunes
		SortTunesByTag("M");

		// Redraw
		RenderAsync(true,null,function(){

			var elem = document.getElementById("sortbutton");
			if (elem){
				elem.value = "   Sorted!   ";
			}
		
			setTimeout(function(){

				var elem = document.getElementById("sortbutton");
				if (elem){
					elem.value = "Sort by Specific Tag";
				}

			},1000);

		});

	},750);

}


//
// DoSortTunesByKey command
//
function DoSortTunesByKey() {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	// Give some feedback
	var elem = document.getElementById("sortbutton");
	if (elem){
		// Give some feedback
		elem.value = "Sorting by Key";
	}

	setTimeout(function(){

		// Sort the tunes by key
		SortTunesByTag("K");

		// Redraw
		RenderAsync(true,null,function(){

			var elem = document.getElementById("sortbutton");
			if (elem){
				elem.value = "   Sorted!   ";
			}
		
			setTimeout(function(){

				var elem = document.getElementById("sortbutton");
				if (elem){
					elem.value = "Sort by Specific Tag";
				}

			},1000);

		});

	},750);

}

//
// Sort the tunes in the ABC text area
//
function SortTunes(stripAn){

	// Get all the tunes
	var theNotes = gTheABC.value;

	var theTunes = theNotes.split(/(^X:.*$)/gm);

	var nTunes = (theTunes.length - 1)/2;

	if (nTunes < 2){
		return;
	}

	var thePrefixABC = theTunes[0];

	//console.log("thePrefixABC: "+thePrefixABC);

	// Get all the tune titles (uses first T: tag found)
	// Global totalTunes needs to be set for GetTunebookIndexTitles to work
	totalTunes = nTunes;

	var theTitles = GetTunebookIndexTitles();
	
	var i;

	var tunesToProcess = [];
	var nProcessed = 0;
	var thisTitle;

	for (i=0;i<nTunes;++i){

		if (theTunes[(i*2)+1] != undefined){

			thisTitle = theTitles[nProcessed];

			if (thisTitle.indexOf("The ")==0){

				thisTitle = thisTitle.substring(4,thisTitle.length)+", The";

			}

			if (stripAn){

				if (thisTitle.indexOf("An ")==0){

					thisTitle = thisTitle.substring(3,thisTitle.length)+", An";

				}

				if (thisTitle.indexOf("A ")==0){

					thisTitle = thisTitle.substring(2,thisTitle.length)+", A";

				}

			}

			nProcessed++;

			//console.log("Tune #"+nProcessed+": "+theTunes[(i*2)+1]+theTunes[(i*2)+2]);

			tunesToProcess.push({title:thisTitle,tune:theTunes[(i*2)+1]+theTunes[(i*2)+2]});

		}

	}


	// Sort tunes by name
	tunesToProcess.sort((a, b) => {

	  const nameA = a.title.toUpperCase(); // ignore upper and lowercase
	  
	  const nameB = b.title.toUpperCase(); // ignore upper and lowercase
	  
	  if (nameA < nameB) {
	    return -1;
	  }
	  
	  if (nameA > nameB) {
	    return 1;
	  }

	  // names must be equal
	  return 0;

	});

	theNotes = "";
	theNotes += thePrefixABC;

	// Aggregate the results
	for (i=0;i<nProcessed;++i){

		theNotes += tunesToProcess[i].tune;
	}

	// Put them back in the ABC area
	gTheABC.value = theNotes; 

	// Set dirty
	gIsDirty = true;

	// Reset the selection
	gTheABC.selectionStart = 0;
    gTheABC.selectionEnd = 0;

    // Focus after operation
    FocusAfterOperation();

}

//
// DoSortTunesByName command
//
function DoSortTunesByName(stripAn) {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	// Give some feedback
	var elem = document.getElementById("sortbutton");

	if (elem){
		elem.value = "Sorting by Name";
	}

	setTimeout(function(){

		// Sort the tunes
		SortTunes(stripAn);

		// Redraw
		RenderAsync(true,null,function(){

			var elem = document.getElementById("sortbutton");
			if (elem){
				elem.value = "   Sorted!   ";
			}
		
			setTimeout(function(){

				var elem = document.getElementById("sortbutton");
				if (elem){
					elem.value = "Sort by Specific Tag";
				}

			},1000);

		});

	},750);

}

//
// Sort Dialog
//
// Prompts for the sorting key
//
var gLastSortOrder = "0";

function SortDialog(){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","SortDialog");

 	const sorting_options = [
	    { name: "  Sort by Name (T:)", id: "0" },
	    { name: '  Sort by Name (T:) - Ignore "A"and "An"' , id: "1" },
	    { name: "  Sort by Key (K:)", id: "2" },
	    { name: "  Sort by Meter (M:)", id: "3" },
  	];

	// Setup initial values
	const theData = {
	  configure_sort:gLastSortOrder,
	};

	const form = [
	  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:50px;">Sort by Specific Tag&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#sort_dialog" target="_blank" style="text-decoration:none;">💡</a></span></p>'},
	  {html: '<p style="margin-top:36px;margin-bottom:36px;font-size:12pt;line-height:18pt;font-family:helvetica">This will sort the tunes based on the ABC tag you select:</p>'},	  
	  {name: "Tag to sort by:", id: "configure_sort", type:"select", options:sorting_options, cssClass:"configure_sort_settings_select"}, 	  
	  {html: '<p style="font-size:12pt;font-family:helvetica">&nbsp;</p>'},	  
	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 200, width: 500, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){

		// Get the results and store them in the global configuration
		if (!args.canceled){
			
			gLastSortOrder = args.result.configure_sort;

			switch (args.result.configure_sort){

				case "0":
					DoSortTunesByName(false);
					break;
				case "1":
					DoSortTunesByName(true);
					break;
				case "2":
					DoSortTunesByKey();
					break;
				case "3":
					DoSortTunesByMeter();
					break;
				default:
					DoSortTunesByName(false);
					break;
			}
		}
	});
}

//
// UI Clear command
//
function Clear() {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	// Keep track of actions
	sendGoogleAnalytics("action","Clear");

	var thePrompt = "Are you sure you want to erase all the ABC and start over?";

	// Center the string in the prompt
	thePrompt = makeCenteredPromptString(thePrompt);

	DayPilot.Modal.confirm(thePrompt,{ top:200, theme: "modal_flat", scrollWithPage: (AllowDialogsToScroll()) }).then(function(args){

		if (!args.canceled){

			// Start over
			gIsFromShare = false;

			// Clear dirty flag
			gIsDirty = false;

			// If staff spacing had changed due to a share, restore it
			RestoreSavedStaffSpacing();

			ClearNoRender();

			RenderAsync(true,null);

			// And set the focus
		    gTheABC.focus();

		}

	});

}

//
// Clear the ABC area, but don't re-render
//
function ClearNoRender() {

	gTheABC.value = "";

	// Save it for the status update display
	gDisplayedName = "No ABC file selected";

	gABCFromFile = false;

	RestoreDefaults();

}

//
// Restore the staff spacing from browser storage
//
function RestoreSavedStaffSpacing(){

	if (gLocalStorageAvailable){

		var val = localStorage.abcStaffSpacing;

		if (val){
			gStaffSpacing = STAFFSPACEOFFSET + parseInt(val);
		}
	}
}


//
// Save the current ABC to browser storage at exit time
//
function DoSaveLastAutoSnapShot(){

	if (gLocalStorageAvailable){
		
		var theABC = gTheABC.value;

		localStorage.LastAutoSnapShot = theABC;

	}
}

//
// Save the current ABC to browser storage
//
function SaveSnapshot(){

	if (gLocalStorageAvailable){

		// Keep track of actions
		sendGoogleAnalytics("action","SaveSnapshot");

		var theABC = gTheABC.value;

		localStorage.SavedSnapshot = theABC;

		document.getElementById("snapshotbutton").value = "  Saved!  ";
		
		setTimeout(function(){

			document.getElementById("snapshotbutton").value = "Snapshot";

		},1000);
	}
	else{

		// Keep track of actions
		sendGoogleAnalytics("action","SaveSnapshot_Fail");

		var thePrompt = "Snapshot storage not available on this browser.";
		
		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);

		DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

	}
}

//
// Restore current ABC from browser storage
//
// Restores either a user snapshot or an automatically saved snapshot
//

function RestoreSnapshot(bRestoreAutoSnapshot,bIsAddDialogButton){
	
	if (gLocalStorageAvailable){

		// Keep track of actions
		sendGoogleAnalytics("action","RestoreSnapshot");

		var theABC = gTheABC.value;

		var theSnapshot;

		var thePrompt, theErrorPrompt;

		if (bRestoreAutoSnapshot){

			theSnapshot = localStorage.LastAutoSnapShot;

			thePrompt = "Replace the contents of the ABC editor with the Auto-Snapshot?";

			theErrorPrompt = "No saved Auto-Snapshot available to restore.";

		}
		else{

			theSnapshot = localStorage.SavedSnapshot;

			thePrompt = "Replace the contents of the ABC editor with the Snapshot?";

			theErrorPrompt = "No saved Snapshot available to restore.";

		}

		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);

		if ((theSnapshot) && (theSnapshot != "")){

			DayPilot.Modal.confirm(thePrompt,{ top:200, theme: "modal_flat", scrollWithPage: (AllowDialogsToScroll()) }).then(function(args){

				if (!args.canceled){

					if (!bIsAddDialogButton){

						document.getElementById("restorebutton").value = "Restoring";

						setTimeout(function(){

							gTheABC.value = theSnapshot;

							// Not from share
							gIsFromShare = false;

							// If staff spacing had changed due to a share, restore it
							RestoreSavedStaffSpacing();

							// Set dirty flag
							gIsDirty = true;

							// Redraw
							RenderAsync(true,null,function(){

								document.getElementById("restorebutton").value = "Restored";
								
								setTimeout(function(){

									document.getElementById("restorebutton").value = "Restore";

								},1000);

							});

						},750);
					}
					else{

						var elem;

						// The dialog might have been closed, so check that the element is present before idling it

						if (bRestoreAutoSnapshot){
							elem = document.getElementById("dialogrestoreautobutton");
							if (elem){
								elem.value = "Restoring from Auto-Snapshot";
							}
						}
						else{
							elem = document.getElementById("dialogrestorebutton");
							if (elem){
								elem.value = "Restoring from Snapshot";
							}
						}


						setTimeout(function(){

							gTheABC.value = theSnapshot;
							
							// Not from share
							gIsFromShare = false;

							// Set dirty flag
							gIsDirty = true;

							// If staff spacing had changed due to a share, restore it
							RestoreSavedStaffSpacing();

							// Redraw
							RenderAsync(true,null,function(){

								var elem;

								// The dialog might have been closed, so check that the element is present before idling it

								if (bRestoreAutoSnapshot){
									elem = document.getElementById("dialogrestoreautobutton");
									if (elem){
										elem.value = "Restored from Auto-Snapshot";
									}
								}
								else{
									elem = document.getElementById("dialogrestorebutton");
									if (elem){
										elem.value = "Restored from Snapshot";
									}
								}

								setTimeout(function(){

									var elem;

									// The dialog might have been closed, so check that the element is present before idling it

									if (bRestoreAutoSnapshot){
										elem = document.getElementById("dialogrestoreautobutton");

										if (elem){
											elem.value = "Restore from Auto-Snapshot";
										}
									}
									else{
										elem = document.getElementById("dialogrestorebutton");
										if (elem){
											elem.value = "Restore from Snapshot";
										}
									}

								},1000);

							});

						},750);
					}
				}
			});
		}
		else{

			// Keep track of actions
			sendGoogleAnalytics("action","RestoreSnapshot_Fail_1");

			DayPilot.Modal.alert('<p style="text-align:center;font-size:18px;">'+theErrorPrompt+'</p>',{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

		}
		
	}
	else{

		// Keep track of actions
		sendGoogleAnalytics("action","RestoreSnapshot_Fail_2");

		var thePrompt = "Snapshot storage not available on this browser.";
		
		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);

		DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

	}
}

//
// PDF conversion shared globals
//

// Rendering offsets based on paper size
var PAGENUMBERTOP = 296;
var PAGENUMBERTOPA4 = 313;
var PAGETOPOFFSET = 32;
var PAGEBOTTOMOFFSET = 24; // Was 32
var PAGELEFTOFFSET = 37;
var PAGELEFTOFFSETA4 = 29;
var PAGEHEIGHTLETTER = 792;
var PAGEHEIGHTA4 = 842;
var BETWEENTUNESPACE = 20;

var gBetweenTuneSpace = 20;  // Can be overriden with a %pdf_between_tune_space directive
var gGotBetweenTuneSpace = false;

// Keeps track of where we are on the page
var running_height = PAGETOPOFFSET;

// For incipits, which column
var column_number = 0;

// Page count
var theCurrentPageNumber = 1;

// True for the first page rendered
var isFirstPage = true;

// How many tunes processed so far
var tunesProcessed = 0;

// Total number of tunes being processed
var totalTunes = 0;

// Page header and footer
var thePageHeader = "";
var thePageFooter = "";
var thePageHeaderURL = "";
var thePageFooterURL = "";

// Need to cache the time, since you don't want it to change during the render from page to page
var theRenderTime = ""; 

// Don't want to recalc this each time
var theHeaderFooterTuneNames = "";

// Page number vertical offset
var thePageNumberVerticalOffset = 0;

// Did they request a QR code
var gQRCodeRequested = false;
var gQRCodeURLOverride = "";
var gDoForceQRCodeURLOverride = false;

// Did they request a QR code caption override
var gQRCodeCaptionOverride = "";
var gDoForceQRCodeCaptionOverride = false;

// Did they request an tunebook index?
var TunebookIndexRequested = false;
var theTunebookIndexTitle = "";

// Did they request an sorted tunebook index?
var TunebookSortedIndexRequested = false;
var theTunebookSortedIndexTitle = "";

// Did they request an tunebook Index header?
var TunebookIndexHeaderRequested = false;
var theTunebookIndexHeader = "";

// Did they request an tunebook TOC?
var TunebookTOCRequested = false;
var theTunebookTOCTitle = "";

// Did they request a sorted tunebook TOC?
var TunebookSortedTOCRequested = false;
var theTunebookSortedTOCTitle = "";

// Did they request an tunebook TOC header?
var TunebookTOCHeaderRequested = false;
var theTunebookTOCHeader = "";

// Did they request an tunebook title page?
var TunebookTPRequested = false;
var theTunebookTP = "";
var theTunebookTPURL = "";

// Did they request an tunebook title page subtitle?
var TunebookTPSTRequested = false;
var theTunebookTPST = "";
var theTunebookTPSTURL = "";

// Tune page map
var theTunePageMap = [];

// PDF JPG quality (range is 0 to 1)
var PDFJPGQUALITY = 0.8;

// Internal PDF scale factor
var PDFSCALEFACTOR = 1.55;

// The offscreen render div
var theOffscreen = null;

// PDF generation cancel requested
var gPDFCancelRequested = false;

// Which instrument
var gPDFTabselected = "noten";

// PDF object to render to
var pdf;

//
// Get the tune index titles
//
function GetTunebookIndexTitles(){

	var i;

	var theTitles = [];

	for (i=0;i<totalTunes;++i){

		var thisTune = getTuneByIndex(i);

		var neu = escape(thisTune);

		var Reihe = neu.split("%0D%0A");

		Reihe = neu.split("%0A");

		for (var j = 0; j < Reihe.length; ++j) {

			Reihe[j] = unescape(Reihe[j]); /* Macht die Steuerzeichen wieder weg */

			var Aktuellereihe = Reihe[j].split(""); /* nochmal bei C. Walshaw crosschecken, ob alle mögl. ausser K: erfasst. */

			if (Aktuellereihe[0] == "T" && Aktuellereihe[1] == ":") {

				titel = Reihe[j].slice(2);

				titel = titel.trim();

				// Just grab the first title foiund
				theTitles.push(titel);

				break

			}
		}
	}

	return theTitles;
}

//
// Tune title page font sizes
//
var TPTITLESIZE = 24;
var TPSTTITLESIZE = 16;
var TPTOPOFFSET = 435;
var TPSTOFFSET = 24;

//
// Generate and append a tune index to the current PDF
//
function AppendTuneTitlePage(thePDF,paperStyle,theTitle,theSubtitle){

	var a4offset = 0

	if (paperStyle == "a4"){
		a4offset = 20;
	}

	// Add a new page
	thePDF.setPage(1); 

	if (theTitle != ""){

		// Set the font size
		thePDF.setFont(gPDFFont,gPDFFontStyle,"normal");
		thePDF.setFontSize(TPTITLESIZE);

		if (theTunebookTPURL && (theTunebookTPURL != "")){

			var textWidth = thePDF.getTextWidth(theTitle);

			// Add the title as a hyperlink			
			thePDF.textWithLink(theTitle, (thePDF.internal.pageSize.getWidth()/3.10)  - (textWidth/2), TPTOPOFFSET+a4offset , {align:"center", url:theTunebookTPURL});

		}
		else{

			// Add the title
			thePDF.text(theTitle, thePDF.internal.pageSize.getWidth()/3.10, TPTOPOFFSET+a4offset, {align:"center"});

		}

	}

	if (theSubtitle != ""){

		// Set the font size
		thePDF.setFont(gPDFFont,gPDFFontStyle,"normal");
		thePDF.setFontSize(TPSTTITLESIZE);

		if (theTunebookTPSTURL && (theTunebookTPSTURL != "")){

			var textWidth = thePDF.getTextWidth(theSubtitle);

			// Add the title as a hyperlink			
			thePDF.textWithLink(theSubtitle, (thePDF.internal.pageSize.getWidth()/3.10)  - (textWidth/2), TPTOPOFFSET+TPSTOFFSET+a4offset , {align:"center", url:theTunebookTPSTURL});

		}
		else{

			// Add the subtitle
			thePDF.text(theSubtitle, thePDF.internal.pageSize.getWidth()/3.10, TPTOPOFFSET+TPSTOFFSET+a4offset, {align:"center"});

		}

	}

}


//
// Text incipits page layout constants
//
var TEXTINCIPITTOPOFFSET = 330;
var TEXTINCIPITBOTTOMOFFSET = 12;
var TEXTINCIPITLEFTMARGIN = 65;
var TEXTINCIPITRIGHTMARGIN = 190; 
var TEXTINCIPITFONTSIZE = 12;
var TEXTINCIPITLINESPACING = 10;
//
// Generate a set of ABC text incipits
//
function GenerateTextIncipits(thePDF,addPageNumbers,pageNumberLocation,hideFirstPageNumber,paperStyle,tunePageMap,sortTunes){

	// Adjust margins based on paper style
 	TEXTINCIPITLEFTMARGIN = 65;
 	TEXTINCIPITRIGHTMARGIN = 190; 

	var a4offset = 0

	if (paperStyle == "a4"){
 		TEXTINCIPITLEFTMARGIN = 61;
 		TEXTINCIPITRIGHTMARGIN = 186; 
		a4offset = 20;
	}

	var thePaperHeight = thePDF.internal.pageSize.getHeight();;
	var thePaperWidth = thePDF.internal.pageSize.getWidth()/1.55;

	var pageSizeWithMargins = thePaperHeight - (PAGETOPOFFSET + TEXTINCIPITBOTTOMOFFSET);

	var curTop = TEXTINCIPITTOPOFFSET + a4offset;

	// Get all the tune titles (uses first T: tag found)
	var theTitles = GetTunebookIndexTitles();

	var i,j;

	// Set the font size
	thePDF.setFont(gPDFFont,gPDFFontStyle,"normal");
	thePDF.setFontSize(TEXTINCIPITFONTSIZE);

	var theTune;
	var theTextIncipit;
	var theRawSplits;
	var theSplitIncipit;
	var searchRegExp;
	var theLines;
	var nLines;
	var nSplits;
	var splitAcc;
	var thisTitle;
	var searchRegExp;
	var theKey;

	var theIncipits = [];

	// Add the tunes by name and page number
	for (i=0;i<totalTunes;++i){

		// Get the raw tune ABC
		theTune = getTuneByIndex(i);

		// Strip out annotations
		theTune = StripAnnotationsOne(theTune);

		// Strip out atextnnotations
		theTune = StripTextAnnotationsOne(theTune);

		// Strip out chord markings
		theTune = StripChordsOne(theTune);

		// Strip out injected tab
		theTune = StripTabOne(theTune);

		// We also need to strip the meter markings:
		searchRegExp = /^M:.*[\r\n]*/gm

		// Strip out tempo markings
		theTune = theTune.replace(searchRegExp, "");

		// Parse out the first few measures
		theTune = escape(theTune);

		theLines = theTune.split("%0A");

		nLines = theLines.length;

		// Find the key
		theKey = "";

		// Find the first line of the tune that has measure separators
		for (j=0;j<nLines;++j){

			theKey = unescape(theLines[j]); 

			if (theKey.indexOf("K:")!= -1){
				break;
			}

		}

		theKey = theKey.replace("K:","");
		theKey = theKey.trim();

		// Shorten the mode
		theKey = theKey.replace("Major","maj");
		theKey = theKey.replace("Minor","min");
		theKey = theKey.replace("Dorian","dor");
		theKey = theKey.replace("Mixolydian","mix");
		theKey = theKey.replace("major","maj");
		theKey = theKey.replace("minor","min");
		theKey = theKey.replace("dorian","dor");
		theKey = theKey.replace("mixolydian","mix");
		theKey = theKey.replace(" ","");

		// Find the first line of the tune that has measure separators
		for (j=0;j<nLines;++j){

			theTextIncipit = unescape(theLines[j]); 

			if (theTextIncipit.indexOf("|")!= -1){
				break;
			}

		}

		// Strip out repeat marks
		theTextIncipit = theTextIncipit.replace(":","");

		// Strip out brackets
		theTextIncipit = theTextIncipit.replace("[","");

		// Split the incipit
		theRawSplits = theTextIncipit.split("|");

		theSplitIncipit = [];

		nSplits = theRawSplits.length;

		// Strip out any blank splits
		for (j=0;j<nSplits;++j){

			if (theRawSplits[j] != ""){

				theSplitIncipit.push(theRawSplits[j]);

			}

		}

		// Use just the first few measures
		nSplits = theSplitIncipit.length;

		if (nSplits > 3){
			nSplits = 3;
		}

		splitAcc = "";

		for(j=0;j<nSplits;++j){

			splitAcc += theSplitIncipit[j];

			if (j != (nSplits - 1)){
				splitAcc += " | ";
			}
		}

		theTextIncipit = splitAcc;

		// Strip initial bar line
		if (theTextIncipit.indexOf(" | ") == 0){
			theTextIncipit = theTextIncipit.substring(3,theTextIncipit.length);
		}

		thisTitle = theTitles[i];

		// Limit the title length
		if (thisTitle.length > 29){
			thisTitle = thisTitle.substring(0,29);
			thisTitle = thisTitle.trim();
			thisTitle += "...";
		}
		else{
			thisTitle = thisTitle.trim();
		}

		// If sorting incipits, do the The replacement before appending the key
		if (sortTunes){

			if (thisTitle.indexOf("The ")==0){

				thisTitle = thisTitle.substring(4,thisTitle.length)+", The";

			}

		}
			
		if (theKey != ""){
			thisTitle += " (" + theKey + ")";
		}

		theIncipits.push({title:thisTitle,incipit:theTextIncipit});
	}

	// Sorted incipipits requested?
	if (sortTunes){

		// Move "The" to the end
		var thisTitle;

		var tuneInfo = [];
		
		for (i=0;i<totalTunes;++i){

			tuneInfo.push({title:theIncipits[i].title,incipit:theIncipits[i].incipit});

		}



		// sort tunes by name
		tuneInfo.sort((a, b) => {

		  var nameA = a.title.toUpperCase(); // ignore upper and lowercase
		  
		  var nameB = b.title.toUpperCase(); // ignore upper and lowercase
		  		  
		  if (nameA < nameB) {
		    return -1;
		  }
		  
		  if (nameA > nameB) {
		    return 1;
		  }

		  // names must be equal
		  return 0;

		});

		// Copy the results into the normally consumed arrays
		for (i=0;i<totalTunes;++i){

			theIncipits[i].title = tuneInfo[i].title;

			theIncipits[i].incipit = tuneInfo[i].incipit;

		}
	}

	var firstSectionHeader = true;

	for (i=0;i<totalTunes;++i){

		thisTitle = theIncipits[i].title;

		var isSectionHeader = false;

		// Strip section header markers
		if (thisTitle.indexOf("*") == 0){

			thisTitle = thisTitle.replaceAll("*","");
			thisTitle = thisTitle.trim();
			
			isSectionHeader = true;

			if (!firstSectionHeader){

				curTop += TEXTINCIPITLINESPACING;

			}

			firstSectionHeader = false;

		}

		theTextIncipit = theIncipits[i].incipit;

		tunePageMap.push(theCurrentPageNumber);

		if (isSectionHeader){

			var textWidth = thePDF.getTextWidth(thisTitle);

			thePDF.text(thisTitle, (thePDF.internal.pageSize.getWidth()/3.10) - (textWidth/2), curTop, {align:"left"});

		}
		else{

			thePDF.text(thisTitle, TEXTINCIPITLEFTMARGIN, curTop, {align:"left"});

			thePDF.text(theTextIncipit, thePaperWidth-TEXTINCIPITRIGHTMARGIN, curTop, {align:"left"});

		}

		curTop += TEXTINCIPITLINESPACING;

		if (isSectionHeader){

			curTop += TEXTINCIPITLINESPACING;

		}

		if (i != (totalTunes - 1)){

			if (curTop > pageSizeWithMargins){


				// Bump the page count
				theCurrentPageNumber++;

				// Add a new page
				thePDF.addPage(paperStyle); 

				// Set the font size
				thePDF.setFont(gPDFFont,gPDFFontStyle,"normal");
				thePDF.setFontSize(TEXTINCIPITFONTSIZE);

				// Start back at the top
				curTop = TEXTINCIPITTOPOFFSET + a4offset;

			}
		}
	}

	return (tunePageMap);
}


//
// Tune index page layout constants
//
var INDEXTOPOFFSET = 330;
var INDEXBOTTOMOFFSET = 16;
var INDEXTITLEOFFSET = 35;
var INDEXLEFTMARGIN = 90;
var INDEXRIGHTMARGIN = 105;
var INDEXTITLESIZE = 18;
var INDEXFONTSIZE = 13;
var INDEXLINESPACING = 12;

//
// Generate and append a tune index to the current PDF
//
function AppendTunebookIndex(thePDF,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageNumberList,theTitle,sortTunes,isSortedABCIncipits,doPageLinks,pageDelta){

	var a4offset = 0

	if (paperStyle == "a4"){
		a4offset = 20;
	}

	// Add a new page
	thePDF.addPage(paperStyle); 

	// Tunebook index header requested?
	if (TunebookIndexHeaderRequested){

		AddPageTextHeader(thePDF,paperStyle,theTunebookIndexHeader);

	}


	// Set the font size
	thePDF.setFont(gPDFFont,gPDFFontStyle,"normal");
	thePDF.setFontSize(INDEXTITLESIZE);

	if (theTitle != ""){

		// Add the tune names
		thePDF.text(theTitle, thePDF.internal.pageSize.getWidth()/3.10, INDEXTOPOFFSET+a4offset, {align:"center"});

	}

	// Get all the tune titles (uses first T: tag found)
	var theTitles = GetTunebookIndexTitles();

	var thePaperHeight = pdf.internal.pageSize.getHeight();;
	var thePaperWidth = pdf.internal.pageSize.getWidth()/1.55;

	var pageSizeWithMargins = thePaperHeight - (PAGETOPOFFSET + INDEXBOTTOMOFFSET);

	var curTop = INDEXTOPOFFSET + INDEXTITLEOFFSET + a4offset;

	var i;
	var thePageNumber;

	// Set the font size
	thePDF.setFont(gPDFFont,gPDFFontStyle,"normal");
	thePDF.setFontSize(INDEXFONTSIZE);

	// Make a copy of the page map
	var localPageMap = [];

	for (i=0;i<totalTunes;++i){

		localPageMap.push(theTunePageNumberList[i]);

	}

	// Sorted index requested?
	if (sortTunes){

		// Move "The" to the end
		var thisTitle;

		for (i=0;i<totalTunes;++i){

			thisTitle = theTitles[i];

			if (thisTitle.indexOf("The ")==0){

				thisTitle = thisTitle.substring(4,thisTitle.length)+", The";

				theTitles[i] = thisTitle;
			}
		
		}

		var tuneInfo = [];
		
		for (i=0;i<totalTunes;++i){

			tuneInfo.push({name:theTitles[i],pageNumber:localPageMap[i]});

		}

		// sort tunes by name
		tuneInfo.sort((a, b) => {

		  var nameA = a.name.toUpperCase(); // ignore upper and lowercase
		  
		  var nameB = b.name.toUpperCase(); // ignore upper and lowercase
		  
		  if (nameA < nameB) {
		    return -1;
		  }
		  
		  if (nameA > nameB) {
		    return 1;
		  }

		  // names must be equal
		  return 0;

		});

		// Copy the results into the normally consumed arrays
		for (i=0;i<totalTunes;++i){

			theTitles[i]= tuneInfo[i].name;

			if (!isSortedABCIncipits){

				localPageMap[i]= tuneInfo[i].pageNumber;
			}

		}
	
	}

	var firstSectionHeader = true;

	// Add the tunes by name and page number
	for (i=0;i<totalTunes;++i){

		thePageNumber = localPageMap[i];

		var theFinalPageNumber = thePageNumber;

		// Add title page and TOC page count offset to page links
		if (doPageLinks){
			theFinalPageNumber += pageDelta;
		}

		if (theTitles[i].indexOf("*") != 0){

			if (doPageLinks){
				thePDF.textWithLink(theTitles[i], INDEXLEFTMARGIN, curTop, {align:"left",pageNumber:theFinalPageNumber});
			}
			else{
				thePDF.text(theTitles[i], INDEXLEFTMARGIN, curTop, {align:"left"});
			}

			if (doPageLinks){
				thePDF.textWithLink(""+thePageNumber, thePaperWidth-INDEXRIGHTMARGIN, curTop, {align:"left",pageNumber:theFinalPageNumber});
			}
			else{
				thePDF.text(""+thePageNumber, thePaperWidth-INDEXRIGHTMARGIN, curTop, {align:"left"});
			}

			curTop += INDEXLINESPACING;

		}
		else{

			// Add an Index section header
			var theSectionName = theTitles[i];
			
			theSectionName = theSectionName.replaceAll("*","");
			theSectionName = theSectionName.trim();

			var textWidth = thePDF.getTextWidth(theSectionName);

			if (!sortTunes){

				if (!firstSectionHeader){
					curTop += INDEXLINESPACING;
					firstSectionHeader = true;
				}

				if (firstSectionHeader){
					firstSectionHeader = false;
				}

			}

			if (doPageLinks){
				thePDF.textWithLink(theSectionName, (thePDF.internal.pageSize.getWidth()/3.10) - (textWidth/2), curTop, {align:"left",pageNumber:theFinalPageNumber});
			}
			else{
				thePDF.text(theSectionName, (thePDF.internal.pageSize.getWidth()/3.10) - (textWidth/2), curTop, {align:"left"});
			}

			if (!sortTunes){

				curTop += INDEXLINESPACING*2;

			}
			else{

				curTop += INDEXLINESPACING;

			}

		}

		if (i != (totalTunes - 1)){

			if (curTop > pageSizeWithMargins){

				// Bump the page count
				theCurrentPageNumber++;

				// Add a new page
				thePDF.addPage(paperStyle);

				// Index header requested? 
				if (TunebookIndexHeaderRequested){

					AddPageTextHeader(thePDF,paperStyle,theTunebookIndexHeader);

				}

				// Set the font size
				thePDF.setFont(gPDFFont,gPDFFontStyle,"normal");
				thePDF.setFontSize(INDEXFONTSIZE);

				// Start back at the top
				curTop = INDEXTOPOFFSET + INDEXTITLEOFFSET + a4offset;

			}
		}

		// Only remove the top spacing for a first tune section header
		firstSectionHeader = false;

	}


	// We're on a new page
	theCurrentPageNumber++;

}

//
// Post process page headers and footer
//
function PostProcessHeadersAndFooters(thePDF,addPageNumbers,startingPage,nPages,pageNumberLocation,hideFirstPageNumber,paperStyle){

	for (var i=startingPage;i<startingPage+nPages;++i){
		
		// Set the page
		thePDF.setPage(i);

		// Add the header and footer
		AddPageHeaderFooter(thePDF,addPageNumbers,(i-startingPage+1),pageNumberLocation,hideFirstPageNumber,paperStyle);
	}

}

//
// Get all the tune titles
//
var gAcrobatURLLimitExceeded = [];
var ACROBATMAXURLLENGTH = 2076;

function GetAllTuneHyperlinks(theLinks) {

	// Keep track of any tunes that exceed the Acrobat maximum length
	gAcrobatURLLimitExceeded = [];

	var nTunes = CountTunes();

	var theTitles;

	theTitles = GetTunebookIndexTitles();

	// There must be a one-to-one coorespondence of tune count to hyperlink record count
	if (nTunes != theLinks.length){

		return false;

	}

	for (i = 0; i < nTunes; ++i) {

		// See if there is a hyperlink override for this tune
		var thisTune = getTuneByIndex(i);

		// Don't add hyperlinks to section headers
		if (theTitles[i].indexOf("*") == 0){
			continue;
		}

		// Clear the tunebook toc string
		var theHyperlink = "";

		// Add a playback hyperlink?
		if (gAddPlaybackHyperlinks){

			var tuneWithPatch = thisTune;

			//
			// Setting swing globally for all hornpipes?
			//

			// First check if swing disabled
			if (!gAllNoSwingHornpipesRequested){

				if (gAllSwingHornpipesRequested){

					// Inject %swing into all hornpipes
					if (tuneIsHornpipe(tuneWithPatch)){

						// Is there a manual swing disable override?
						if (tuneWithPatch.indexOf("%noswing") == -1){

							// Strip out the X: tag
							var searchRegExp = /^X:.*[\r\n]*/gm 

							tuneWithPatch = tuneWithPatch.replace(searchRegExp, "");

							tuneWithPatch = "X:1\n%swing "+gAllSwingHornpipesSwingFactor+"\n"+tuneWithPatch;

						}

					}

				}

			}
			else{

				// Inject %noswing into all hornpipes
				if (tuneIsHornpipe(tuneWithPatch)){

					// Is there a manual swing override?
					if (tuneWithPatch.indexOf("%swing") == -1){

						// Strip out the X: tag
						var searchRegExp = /^X:.*[\r\n]*/gm 

						tuneWithPatch = tuneWithPatch.replace(searchRegExp, "");

						tuneWithPatch = "X:1\n%noswing\n"+tuneWithPatch;

					}

				}

			}

			// If MIDI programs to be injected, do it now
			if (gAddPlaybackHyperlinksIncludePrograms){
				
				// Strip out the X: tag
				var searchRegExp = /^X:.*[\r\n]*/gm 

				// Strip out X:
				tuneWithPatch = tuneWithPatch.replace(searchRegExp, "");

				tuneWithPatch = "X:1\n%abcjs_soundfont "+gPlaybackHyperlinkSoundFont+"\n"+"%%MIDI program "+gPlaybackHyperlinkMelodyProgram+"\n"+"%%MIDI chordprog "+gPlaybackHyperlinkBassChordProgram+"\n"+tuneWithPatch;

			}


			// Create a share URL for this tune
			var theURL = FillUrlBoxWithAbcInLZW(tuneWithPatch,false);

			// Add the play parameter
			if (gInjectEditDisabled){
				theURL += "&dx=1"
			}

			theURL += "&play=1";

			// Warn if too large for Acrobat Reader
			if (theURL.length > ACROBATMAXURLLENGTH){

				gAcrobatURLLimitExceeded.push({name:theTitles[i],urllength:theURL.length});

			}			

			theLinks[i].url = theURL;

		}
		else
		// Add a thesession.org hyperlink?
		if (gAddTheSessionHyperlinks){

			theLinks[i].url = "https://thesession.org/tunes/search?q="+encodeURIComponent(theTitles[i]);

		}

		// Search for a thesession hyperlink request
		var searchRegExp = /^%add_link_to_thesession.*$/m

		// Detect thesession hyperlink annotation
		var addTheSessionHyperlink = thisTune.match(searchRegExp);

		if ((addTheSessionHyperlink) && (addTheSessionHyperlink.length > 0)){

			theLinks[i].url = "https://thesession.org/tunes/search?q="+encodeURIComponent(theTitles[i]);

		}
		
		// Search for a playback hyperlink request
		searchRegExp = /^%add_playback_link.*$/m

		// Detect playback hyperlink annotation
		var addPlaybackHyperlink = thisTune.match(searchRegExp);

		if ((addPlaybackHyperlink) && (addPlaybackHyperlink.length > 0)){

			var tuneWithPatch = thisTune;

			var thePatch = addPlaybackHyperlink[0].replace("%add_playback_link","");

			var thePatches = thePatch.match(/\b(\w+)\b/g);

			// Initially, use the defaults
			var theMelodyPatch = gTheMelodyProgram;
			var theBassChordPatch = gTheChordProgram;
			var theSoundFont = "fluid";

			if (gDefaultSoundFont.indexOf("Fluid")!=-1){
				theSoundFont = "fluid";
			}else
			if (gDefaultSoundFont.indexOf("Musyng")!=-1){
				theSoundFont = "musyng";
			}else
			if (gDefaultSoundFont.indexOf("FatBoy")!=-1){
				theSoundFont = "fatboy";
			}else
			if (gDefaultSoundFont.indexOf("canvas")!=-1){
				theSoundFont = "canvas";
			}else
			if (gDefaultSoundFont.indexOf("mscore")!=-1){
				theSoundFont = "mscore";
			}

			// If adding complete tunebook patches, they take precedence over the defaults
			if (gAddPlaybackHyperlinks){

				theSoundFont = gPlaybackHyperlinkSoundFont;
				theMelodyPatch = gPlaybackHyperlinkMelodyProgram;
				theBassChordPatch = gPlaybackHyperlinkBassChordProgram;

			}

			var doAddPatches = false;

			if (thePatches && (thePatches.length > 0)){

				if (thePatches.length >= 1){
					theMelodyPatch = thePatches[0];
					theMelodyPatch = theMelodyPatch.trim();
				}

				if (thePatches.length > 1){
					theBassChordPatch = thePatches[1];
					theBassChordPatch = theBassChordPatch.trim();
				}

				if (thePatches.length > 2){
					theSoundFont = thePatches[2];
					theSoundFont = theSoundFont.trim();
				}

				doAddPatches = true;

			}

			if (doAddPatches){

				// Strip out the X: tag
				var searchRegExp = /^X:.*[\r\n]*/gm 

				// Strip out tempo markings
				tuneWithPatch = tuneWithPatch.replace(searchRegExp, "");

				tuneWithPatch = "X:1\n%abcjs_soundfont "+theSoundFont+"\n"+"%%MIDI program "+theMelodyPatch+"\n"+"%%MIDI chordprog "+theBassChordPatch+"\n"+tuneWithPatch;

			}

			// Create a share URL for this tune
			var theURL = FillUrlBoxWithAbcInLZW(tuneWithPatch,false);
			
			// Add the play parameter
			if (gInjectEditDisabled){
				// Mark this as a play-only link
				theURL += "&dx=1"
			}

			// Normal play/edit link
			theURL += "&play=1"	

			// Warn if too large for Acrobat Reader
			if (theURL.length > ACROBATMAXURLLENGTH){

				gAcrobatURLLimitExceeded.push({name:theTitles[i],urllength:theURL.length});

			}			

			theLinks[i].url = theURL;

		}

		// Search for a general purpose hyperlink request
		searchRegExp = /^%hyperlink.*$/m

		// Detect tunebook TOC annotation
		var addTunebookHyperlink = thisTune.match(searchRegExp);

		if ((addTunebookHyperlink) && (addTunebookHyperlink.length > 0)){

			theHyperlink = addTunebookHyperlink[0].replace("%hyperlink","");
			
			theHyperlink = theHyperlink.trim();

			// Warn if too large for Acrobat Reader
			if (theHyperlink.length > ACROBATMAXURLLENGTH){

				gAcrobatURLLimitExceeded.push({name:theTitles[i],urllength:theHyperlink.length});

			}			

			theLinks[i].url = theHyperlink;

		}

	}

	return true;

}

//
// Post process any tune hyperlinks 
//
function PostProcessTuneHyperlinks(pdf,theLinks,paperStyle,startPage){

	// Sanity check the links array
	if (!theLinks){
		return;
	}

	// First scan the ABC for all the tune hyperlinks
	var res = GetAllTuneHyperlinks(theLinks);

	//If there is a page to hyperlink count mismatch,early exit
	if (!res){
		return;
	}
	
	var pageWidth = pdf.internal.pageSize.getWidth();
	var pageHeight = pdf.internal.pageSize.getHeight();

	pdf.setFont("Verdana","","normal");
	pdf.setFontSize(18.0);

	var nLinks = theLinks.length;

	var curPage = -1;

	for (var i=0;i<nLinks;++i){

		var thisLink = theLinks[i];

		if (thisLink.url != ""){
		
			var thisPage = thisLink.page;

			if (thisPage != curPage){

				// Set the page
				pdf.setPage(thisPage+startPage-1);

				curPage = thisPage;

			}

			// Convert the page relative rect to link relative
			
			var r = {left:thisLink.x, top:thisLink.y, width: thisLink.width, height: thisLink.height}

			r = pageRect2LinkRect(pdf,r, paperStyle);
			
			// And the title link
			pdf.link(r.left,r.top,r.width,r.height,{url:thisLink.url})


		}

	}


}

//
// Post process any linkbacks to the TOC or 
//
function PostProcessTOCAndIndexLinks(pdf,startPage,endPage,addTOCLinks,theTOCLinkPage,addIndexLinks,theIndexLinkPage){
	
	// console.log("PostProcessTOCAndIndexLinks");
	// console.log("startPage = "+startPage);
	// console.log("endPage = "+endPage);
	// console.log("addTOCLinks = "+addTOCLinks);
	// console.log("theTOCLinkPage = "+theTOCLinkPage);
	// console.log("addIndexLinks = "+addIndexLinks);
	// console.log("theIndexLinkPage = "+theIndexLinkPage);

	for (var i=startPage;i<=endPage;++i){
		
		// Set the page
		pdf.setPage(i);

		// Set the font
		pdf.setFont("Verdana","","normal");
		pdf.setFontSize(18.0);

		var pageWidth = pdf.internal.pageSize.getWidth();
		var pageHeight = pdf.internal.pageSize.getHeight();

		if (addTOCLinks){
			// Add the TOC link
			pdf.textWithLink("<<", 5, (pageHeight/1.55), {align:"left", pageNumber:theTOCLinkPage});
		}

		if (addIndexLinks){
			// Add the Index link
			var textWidth = pdf.getTextWidth(">>");
			pdf.textWithLink(">>", (pageWidth/1.55)-(textWidth+5), (pageHeight/1.55), {align:"left", pageNumber:theIndexLinkPage});
		}


	}

}

//
// Add a table of contents or index header
//
function AddPageTextHeader(thePDF,paperStyle,theHeaderText){

	// Calc offset for A4 paper
	var voff = PAGENUMBERTOP;

	if (paperStyle == "letter"){
		// Letter offset
		voff = PAGENUMBERTOP;
	}
	else{
		// A4 offset
		voff = PAGENUMBERTOPA4;
	}

	thePDF.setFont(gPDFFont,gPDFFontStyle,"normal");
	thePDF.setFontSize(HEADERFOOTERFONTSIZE);

	// Add the TOC header
	thePDF.text(theHeaderText, (thePDF.internal.pageSize.getWidth()/3.10), voff, {align:"center"});

}

//
// Tune table of contents page layout constants
//

var TOCTOPOFFSET = 330;
var TOCBOTTOMOFFSET = 16;
var TOCTITLEOFFSET = 35;
var TOCLEFTMARGIN = 90;
var TOCRIGHTMARGIN = 105; 
var TOCTITLESIZE = 18;
var TOCFONTSIZE = 13;
var TOCLINESPACING = 12;

//
// Generate and append a tune index to the current PDF
//
function AppendTuneTOC(thePDF,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageNumberList,theTitle,sortTunes,isSortedABCIncipits,doPageLinks,pageDelta,tocStartPage){

	var TOCpage = tocStartPage;

	var a4offset = 0

	if (paperStyle == "a4"){
		a4offset = 20;
	}

	// Add a new page
	thePDF.setPage(TOCpage); 

	if (TunebookTOCHeaderRequested){

		AddPageTextHeader(thePDF,paperStyle,theTunebookTOCHeader);

	}

	// Set the font size
	thePDF.setFont(gPDFFont,gPDFFontStyle,"normal");
	thePDF.setFontSize(TOCTITLESIZE);

	if (theTitle != ""){

		// Add the tune names
		thePDF.text(theTitle, thePDF.internal.pageSize.getWidth()/3.10, TOCTOPOFFSET+a4offset, {align:"center"});

	}

	// Get all the tune titles (uses first T: tag found)
	var theTitles = GetTunebookIndexTitles();

	var thePaperHeight = pdf.internal.pageSize.getHeight();;
	var thePaperWidth = pdf.internal.pageSize.getWidth()/1.55;

	var pageSizeWithMargins = thePaperHeight - (PAGETOPOFFSET + TOCBOTTOMOFFSET);

	var curTop = TOCTOPOFFSET + TOCTITLEOFFSET + a4offset;

	var i;
	var thePageNumber;

	// Set the font size
	thePDF.setFont(gPDFFont,gPDFFontStyle,"normal");
	thePDF.setFontSize(TOCFONTSIZE);

	// Make a copy of the page map
	var localPageMap = [];

	for (i=0;i<totalTunes;++i){

		localPageMap.push(theTunePageNumberList[i]);

	}

	// Sorted TOC requested?
	if (sortTunes){

		// Move "The" to the end
		var thisTitle;

		for (i=0;i<totalTunes;++i){

			thisTitle = theTitles[i];

			if (thisTitle.indexOf("The ")==0){

				thisTitle = thisTitle.substring(4,thisTitle.length)+", The";

				theTitles[i] = thisTitle;
			}

		}


		var tuneInfo = [];
		
		for (i=0;i<totalTunes;++i){

			tuneInfo.push({name:theTitles[i],pageNumber:localPageMap[i]});

		}

		// sort tunes by name
		tuneInfo.sort((a, b) => {

		  var nameA = a.name.toUpperCase(); // ignore upper and lowercase
		  
		  var nameB = b.name.toUpperCase(); // ignore upper and lowercase
		  
		  if (nameA < nameB) {
		    return -1;
		  }
		  
		  if (nameA > nameB) {
		    return 1;
		  }

		  // names must be equal
		  return 0;

		});

		// Copy the results into the normally consumed arrays
		for (i=0;i<totalTunes;++i){

			theTitles[i]= tuneInfo[i].name;

			if (!isSortedABCIncipits){

				localPageMap[i]= tuneInfo[i].pageNumber;

			}

		}
		
	}

	var firstSectionHeader = true;

	// Add the tunes by name and page number
	for (i=0;i<totalTunes;++i){

		thePageNumber = localPageMap[i];

		if (theTitles[i].indexOf("*") != 0){

			if (doPageLinks){

				thePDF.textWithLink(theTitles[i], TOCLEFTMARGIN, curTop, {align:"left",pageNumber:(thePageNumber+pageDelta)});

			}
			else{

				thePDF.text(theTitles[i], TOCLEFTMARGIN, curTop, {align:"left"});

			}

			if (doPageLinks){

				thePDF.textWithLink(""+thePageNumber, thePaperWidth-TOCRIGHTMARGIN, curTop, {align:"left",pageNumber:(thePageNumber+pageDelta)});

			}
			else{

				thePDF.text(""+thePageNumber, thePaperWidth-TOCRIGHTMARGIN, curTop, {align:"left"});

			}

			curTop += TOCLINESPACING;

		}
		else{

			// Add a TOC header
			var theSectionName = theTitles[i];
			theSectionName = theSectionName.replaceAll("*","");
			theSectionName = theSectionName.trim();				

			var textWidth = thePDF.getTextWidth(theSectionName);

			if (!sortTunes){

				if (!firstSectionHeader){
					curTop += TOCLINESPACING;
					firstSectionHeader = true;
				}

				if (firstSectionHeader){
					firstSectionHeader = false;
				}
			}

			if (doPageLinks){
				thePDF.textWithLink(theSectionName, (thePDF.internal.pageSize.getWidth()/3.10) - (textWidth/2), curTop, {align:"left",pageNumber:(thePageNumber+pageDelta)});
			}
			else{
				thePDF.text(theSectionName, (thePDF.internal.pageSize.getWidth()/3.10) - (textWidth/2), curTop, {align:"left"});
			}
			
			if (!sortTunes){
				curTop += TOCLINESPACING*2;
			}
			else{
				curTop += TOCLINESPACING;
			}

		}

		if (i != (totalTunes - 1)){

			if (curTop > pageSizeWithMargins){

				TOCpage++;

				// Add a new page
				thePDF.setPage(TOCpage); 

				if (TunebookTOCHeaderRequested){

					AddPageTextHeader(thePDF,paperStyle,theTunebookTOCHeader);
					
				}

				// Set the font size
				thePDF.setFont(gPDFFont,gPDFFontStyle,"normal");
				thePDF.setFontSize(TOCFONTSIZE);

				// Start back at the top
				curTop = TOCTOPOFFSET + TOCTITLEOFFSET + a4offset;


			}
		}

		// Only remove the top spacing for a first tune section header
		firstSectionHeader = false;
	}
}

//
// Dry run adding a TOC to determine how many pages are required
//
function DryRunAddTuneTOC(thePDF,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageNumberList,theTitle,sortTunes,isSortedABCIncipits){

	var a4offset = 0

	if (paperStyle == "a4"){
		a4offset = 20;
	}
	
	// Add a new page
	thePDF.addPage(paperStyle); 

	// Get all the tune titles (uses first T: tag found)
	var theTitles = GetTunebookIndexTitles();

	var thePaperHeight = pdf.internal.pageSize.getHeight();;
	var thePaperWidth = pdf.internal.pageSize.getWidth()/1.55;

	var pageSizeWithMargins = thePaperHeight - (PAGETOPOFFSET + TOCBOTTOMOFFSET);

	var curTop = TOCTOPOFFSET + TOCTITLEOFFSET + a4offset;

	var i;
	var thePageNumber;

	var tocPageOffset = 1;

	// Make a copy of the page map
	var localPageMap = [];

	for (i=0;i<totalTunes;++i){

		localPageMap.push(theTunePageNumberList[i]);

	}

	// Sorted TOC requested?
	if (sortTunes){

		// Move "The" to the end
		var thisTitle;

		for (i=0;i<totalTunes;++i){

			thisTitle = theTitles[i];

			if (thisTitle.indexOf("The ")==0){

				thisTitle = thisTitle.substring(4,thisTitle.length)+", The";

				theTitles[i] = thisTitle;
			}

		}

		var tuneInfo = [];
		
		for (i=0;i<totalTunes;++i){

			tuneInfo.push({name:theTitles[i],pageNumber:localPageMap[i]});

		}

		// sort tunes by name
		tuneInfo.sort((a, b) => {

		  var nameA = a.name.toUpperCase(); // ignore upper and lowercase
		  
		  var nameB = b.name.toUpperCase(); // ignore upper and lowercase
		  		  
		  if (nameA < nameB) {
		    return -1;
		  }
		  
		  if (nameA > nameB) {
		    return 1;
		  }

		  // names must be equal
		  return 0;

		});

		// Copy the results into the normally consumed arrays
		for (i=0;i<totalTunes;++i){

			theTitles[i]= tuneInfo[i].name;

			if (!isSortedABCIncipits){

				localPageMap[i]= tuneInfo[i].pageNumber;

			}

		}
	
	}

	var firstSectionHeader = true;

	// Add the tunes by name and page number
	for (i=0;i<totalTunes;++i){

		if (theTitles[i].indexOf("*") != 0){

			curTop += TOCLINESPACING;

		}
		else{

			if (!sortTunes){

				if (firstSectionHeader){
					curTop += TOCLINESPACING*2;
				}
				else{
					curTop += TOCLINESPACING*3;
				}

				if (firstSectionHeader){
					firstSectionHeader = false;
				}
			}
			else{
				
				curTop += TOCLINESPACING;
			
			}

		}

		if (i != (totalTunes - 1)){

			if (curTop > pageSizeWithMargins){

				// Bump the page count
				theCurrentPageNumber++;

				// Move the page to the top
				thePDF.movePage(theCurrentPageNumber,tocPageOffset);

				// Start back at the top
				curTop = TOCTOPOFFSET + TOCTITLEOFFSET + a4offset;

				// Add a new page
				thePDF.addPage(paperStyle); 

			}
		}
	}

	// We're on a new page
	theCurrentPageNumber++;

	// Move the page to the top
	thePDF.movePage(theCurrentPageNumber,tocPageOffset);

}

//
// Convert page relative rect to link relative rect
//
function pageRect2LinkRect(pdf, r,thePaperStyle){

	var pdfVoff = 26;

	if (thePaperStyle == "a4"){
		pdfVoff = 27;
	}

	r.left = r.left/1.55;
	
	r.top = ((pdf.internal.pageSize.getHeight()/3.10)+pdfVoff) + (r.top/1.55);

	r.width = r.width / 1.55;

	r.height = r.height / 1.55;

	return r;

}

//
// Convert page relative vertical offset to link relative vertical offset
//

function pageVOffset2LinkVOffset(pdf, v,thePaperStyle){

	var pdfVoff = 26;

	if (thePaperStyle == "a4"){
		pdfVoff = 27;
	}

	return ((pdf.internal.pageSize.getHeight()/3.10)+pdfVoff) + (v/1.55)
}

//
// Convert link relative vertical offset to page relative vertical offset
//
function linkVOffset2PageVOffset(pdf, v,thePaperStyle){

	var pdfVoff = 26;

	if (thePaperStyle == "a4"){
		pdfVoff = 27;
	}

	v = v - ((pdf.internal.pageSize.getHeight()/3.10)+pdfVoff);

	v *= 1.55;

	return v;

}


//
// Generate and append a QR code to the current PDF
//
function AppendQRCode(thePDF,paperStyle,callback){

	var theURL;

	if (!gDoForceQRCodeURLOverride){

		// Can we make a QR code from the current share link URL?
		theURL = FillUrlBoxWithAbcInLZW(null,false);

		if (!gAllowQRCodeSave){

			//console.log("Share URL too long for QR Code, early exit...")
			
			// URL too long for QR code... early exit

			callback(false);
			
			return;

		}
	}
	else{

		// Use the specified URL for the QR code
		theURL = gQRCodeURLOverride;

	}

	// Generate the QR code
	if (gTheQRCode == null) {

		gTheQRCode = new QRCode(document.getElementById("qrcode"), {
			text: theURL,
			width: 548,
			height: 548,
			colorDark: "#000000",
			colorLight: "#ffffff",
			border: 16,
    		correctLevel : QRCode.CorrectLevel.M 
		});

	} else {

		gTheQRCode.clear();

		gTheQRCode.makeCode(theURL);

	}

	//
	// Needs a page render cycle for the QR code image to show up
	//
	setTimeout(function(){

		// Find the QR code image to rasterize
		var theQRCodeImage = document.querySelectorAll('div[id="qrcode"] > img');

		if (theQRCodeImage && theQRCodeImage[0]){

			// Add a new page
			thePDF.addPage(paperStyle); 

			var theHOffset = (thePDF.internal.pageSize.getWidth()/3.10) - 18;

			theQRCodeImage = theQRCodeImage[0];

			var theImageSource = theQRCodeImage.src;

			// Add the QR code
			thePDF.addImage(theImageSource, 'PNG', theHOffset, 150, 256, 256);

			// Full page link example
			//thePDF.link(0, (thePDF.internal.pageSize.getHeight()/3.10)+pdfVoff, (thePDF.internal.pageSize.getWidth()/1.55), (thePDF.internal.pageSize.getHeight()/1.55), {url:theURL});

			// Fix up the page-relative link
			var r = {left:theHOffset, top: 150, width: 256, height: 256};
			
			r = pageRect2LinkRect(thePDF,r,paperStyle);

			thePDF.link(r.left, r.top, r.width, r.height, {url:theURL});

			// Set the font size
			thePDF.setFont(gPDFFont,gPDFFontStyle,"normal");
			thePDF.setFontSize(QRCODECAPTIONPDFFONTSIZE);

			// Different caption offset for letter vs a4
			var captionOffset = 558;

			if (paperStyle == "a4"){
				captionOffset = 575;
			}

			// Frame-of-reference round-trip test

			// captionOffset = linkVOffset2PageVOffset(thePDF,captionOffset,paperStyle);

			// captionOffset = pageVOffset2LinkVOffset(thePDF,captionOffset,paperStyle);

			// See if there is a QR code caption override
			var theQRCodeCaption = theHeaderFooterTuneNames;

			if (gDoForceQRCodeCaptionOverride){
				theQRCodeCaption = gQRCodeCaptionOverride;
			}

			var pageWidth = thePDF.internal.pageSize.getWidth();

			var textWidth = thePDF.getTextWidth(theQRCodeCaption);

			// Add the tune names
			thePDF.textWithLink(theQRCodeCaption, (pageWidth/3.10)-(textWidth/2), captionOffset, {align:"left", url:theURL});
			
			// Clear the QR code
			gTheQRCode.clear();

			// Call back to finalize the PDF
			callback(true);

		}
		else{

			// Clear the QR code
			gTheQRCode.clear();

			// Something went wrong getting the QR code, just callback immediately
			callback(false);

		}

	}, 1000);
}

//
// Get a good filename for the PDF or share name either from the current filename or tunes themselves
//
function getDescriptiveFileName(tuneCount,bIncludeTabInfo){

	var title = "";

	if (gABCFromFile){

		// If this was from a file, use the filename for the PDF
		title = gDisplayedName;

		// Clean up the filename

		// Trim any whitespace
		title = title.trim();

		// Strip out any naughty HTML tag characters
		title = title.replace(/[^a-zA-Z0-9_\-. ]+/ig, '');

		// Replace any spaces
		title = title.replace(/\s/g, '_');

		// Strip the extension
		title = title.replace(/\..+$/, '');

	}
	else{

		// Get the title from the first tune in the ABC
		title = GetFirstTuneTitle();

		// If there is more than one tune, make the name reflect that it is a set
		if (tuneCount > 1){

			title += "_Set";

		}
	}

	// If additional tab info suffix requested, add them
	if (bIncludeTabInfo){

		// Now append any tablature style postfix

		// Get the current instrument setting
		var tabs = GetRadioValue("notenodertab");

		var postfix = "";

		switch (tabs){
			case "noten":
				postfix = "";
				break;
			case "notenames":
				postfix = "_Note_Names";
				break;
			case "mandolin":
				postfix = "_Mandolin";
				break;
			case "gdad":
				postfix = "_GDAD";
				break;
			case "mandola":
				postfix = "_Mandola";
				break;
			case "guitare":
				postfix = "_Guitar";
				break;
			case "guitard":
				postfix = "_DADGAD";
				break;
			case "bass":
				postfix = "_Bass";
				break;
			case "whistle":
				postfix = "_Whistle";
				break;
		}

		title += postfix;

		postfix = "";
		
		// Let's add some capo information to the stringed instrument tab
		switch (tabs){

			case "noten":
			case "notenames":
			case "whistle":
				break;

			case "mandolin":
			case "gdad":
			case "mandola":
			case "guitare":
			case "guitard":
			case "bass":
				if (gCapo > 0){
					postfix = "_Capo_" + gCapo;
				}
				break;
		}

		title += postfix;

	}

	return title;
}

//
// Measure all the tunes for PDF layout
//
function ProcessTunesForContinuousLayout(pageBreakList,pageHeight,doIncipits){

	// Measure the tunes
	var nTunes = pageBreakList.length;

	// Doesn't matter for one tune
	if (nTunes <= 1){
		return pageBreakList;
	}

	var renderingDivs = [];

	var i,j;
	var theElem;
	var theElemHeight;

	for (i=0;i<nTunes;++i){

		// Get each rendering div
		theElem = document.getElementById("notation"+i);

		// Get the height
		theElemHeight = theElem.offsetHeight/PDFSCALEFACTOR;

		// Get each staff height
		var theStaffHeights = [];

		// Get the children of the notation div, one block per staff
		var theBlocks = theElem.children;

		var nBlocks = theBlocks.length;

		var scale_factor = 1.0;

		if (doIncipits){

			if (nBlocks > 2){

				nBlocks = 2;

			}

			if (gIncipitsColumns == 2){

				scale_factor = 2.0;

			}

		}

		var theBlockHeight;
		var currentBlock;

		var accumHeight = 0;

		for (j=0;j<nBlocks;++j){

			// Get the node from the HTML collection
			currentBlock = theBlocks.item(j);

			theBlockHeight = currentBlock.offsetHeight / PDFSCALEFACTOR;

			theBlockHeight /= scale_factor;

			theStaffHeights.push(theBlockHeight);

			accumHeight += theBlockHeight;

		}

		// If doing incipits, the tune block height is only the height of the first two lines
		if (doIncipits){

			theElemHeight = accumHeight;

		}

		var tuneStruct = 
		{	
			theElement:theElem, 
			height:theElemHeight, 
			staffHeights:theStaffHeights
		};

		renderingDivs.push(tuneStruct);

	}

	// 
	// Now layout the page breaks
	//

	// Keep track of the space left on the page with top and bottom margins
	var pageSizeWithMargins = pageHeight - (PAGETOPOFFSET + PAGEBOTTOMOFFSET);

	var spaceAvailable = pageSizeWithMargins + BETWEENTUNESPACE;

	var thisTuneHeight;

	var firstTuneOnPage = true;

	var column_number = 0;

	for (i=0;i<nTunes;++i){

		if (i != 0){

			if (pageBreakList[i-1]){

				// Reset the page offset
				spaceAvailable = pageSizeWithMargins + BETWEENTUNESPACE;

			}
		}

		// The PDF generator adds one extra line per block it renders
		var thisTuneHeight = renderingDivs[i].height + (renderingDivs[i].staffHeights.length / scale_factor);

		// Does this tune fit on the page?
		if (thisTuneHeight > spaceAvailable){

			// Put in a page break (not on the first tune)
			if (i != 0){

				pageBreakList[i-1] = true;

			}

			// Reset the page offset
			spaceAvailable = pageSizeWithMargins + BETWEENTUNESPACE;

			// Is this a tune moved to a new page that takes up more than one page
			if (thisTuneHeight > pageSizeWithMargins){ 

				// Then we have to walk the staffs
				var nStaffs = renderingDivs[i].staffHeights.length;

				var spaceTest;

				var thisStaffHeight;

				// How many staffs fit on this page?
				for (j=0;j<nStaffs;++j){

					// The +1 is an additional offset in the PDF generator
					thisStaffHeight = renderingDivs[i].staffHeights[j] + 1;

					spaceTest = spaceAvailable - thisStaffHeight;

					// Out of room on this page, move to the next page
					if (spaceTest < 0){

						// This staff moves to a new page
						spaceAvailable = pageSizeWithMargins;

					}

					spaceAvailable -= thisStaffHeight;

				}

				// Add the space below for the next tune
				spaceAvailable -= (BETWEENTUNESPACE/scale_factor);

				// Try to layout next tune below this one
				firstTuneOnPage = false;

			}
			else{

				// Reset the page offset
				spaceAvailable = pageSizeWithMargins + BETWEENTUNESPACE;

				// Place the tune on the page
				spaceAvailable -= thisTuneHeight;

				// With a space below
				spaceAvailable -= (BETWEENTUNESPACE/scale_factor);

				// Flag this as the first tune on the page
				firstTuneOnPage = true;

			}

		}
		else{

			// Only add in-between space after the first tune on the page
			if (firstTuneOnPage){

				firstTuneOnPage = false;

			}

			// Take space for the tune
			spaceAvailable -= thisTuneHeight;

			// And the spacer below
			spaceAvailable -= (BETWEENTUNESPACE/scale_factor);

		}

	}


	return pageBreakList;

}

//
// Scan the tune and return an array that indicates if a tune as %%newpage under X:
//

function scanTunesForPageBreaks(pdf,paperStyle,doIncipits){

	// Get the paper height at 72 dpi from the PDF generator
	var thePaperHeight = PAGEHEIGHTLETTER;

	if (paperStyle == "a4"){

		thePaperHeight = PAGEHEIGHTA4;
		
	}

	var pageBreakRequested = [];

	// Count the tunes in the text area
	var theNotes = gTheABC.value;

	var theTunes = theNotes.split(/^X:.*$/gm);

	var nTunes = theTunes.length - 1;

	// Exit out if no tunes
	if (nTunes == 0){
		return pageBreakRequested;
	}

	if (!doIncipits){

		for (var i=1;i<=nTunes;++i){

			// Auto inject page breaks for section headers
			if (i>1){
				if (isSectionHeader(theTunes[i])){
					pageBreakRequested[i-2] = true;
				}
			}

			if (theTunes[i].indexOf("%%newpage") != -1){
				pageBreakRequested.push(true);
			}
			else{
				pageBreakRequested.push(false);
			}

		}
	}
	else{

		// No pagebreaks for incipits
		for (var i=1;i<=nTunes;++i){

			pageBreakRequested.push(false);

		}

	}

	// Measure the tunes and insert any automatic page breaks
	pageBreakRequested = ProcessTunesForContinuousLayout(pageBreakRequested,thePaperHeight,doIncipits);

	return pageBreakRequested;
}

//
// Date formatter for header/footers
//
function formatDate(format) {

    var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;

    if (day.length < 2) 
        day = '0' + day;

    if (format == 0){

      	return [month, day, year].join('-');

    }else{

      	return [year, month, day].join('-');

    }

}

//
// Time formatter for header/footers
//
function formatTime() {

	// If this was called once already during a render, re-use the previous results
	if (theRenderTime != ""){
		return theRenderTime;
	}

    var d = new Date(),
        hour = d.getHours(),
        minute = d.getMinutes();

    var postfix = " AM";

    if (hour == 0){
    	hour = 12;
    }

    if (hour > 12){
    	hour -= 12;
    	postfix = " PM";
    }

    hour = "" + hour;
    minute = "" + minute;

    if (minute.length < 2) 
        minute = '0' + minute;

    var str = [hour, minute].join(':');
    str = str + postfix;

    // Cache the rendering time
    theRenderTime = str;

    return str;

}

//
// Parse the ABC looking for comment-based commands for page header, TOC, index, QR code, incipts, etc.
//
function ParseCommentCommands(theNotes){
	
	// Clear the header and footer strings
	thePageHeader = "";
	thePageFooter = "";

	// Search for a page header
	var searchRegExp = /^%pageheader.*$/m

	// Detect page header annotation
	var allPageHeaders = theNotes.match(searchRegExp);

	if ((allPageHeaders) && (allPageHeaders.length > 0)){
		thePageHeader = allPageHeaders[0].replace("%pageheader","");
		thePageHeader = thePageHeader.trim();
	}

	// Search for a page footer
	searchRegExp = /^%pagefooter.*$/m

	// Detect page footer annotation
	var allPageFooters = theNotes.match(searchRegExp);

	if ((allPageFooters) && (allPageFooters.length > 0)){
		thePageFooter = allPageFooters[0].replace("%pagefooter","");
		thePageFooter = thePageFooter.trim();
	}

	// Did they request a QR code?
	gQRCodeRequested = false;

	gDoForceQRCodeURLOverride = false;

	gQRCodeURLOverride = "";

	// Search for a QR code request
	searchRegExp = /^%qrcode.*$/m

	// Detect QR code annotation
	var addQRCode = theNotes.match(searchRegExp);

	if ((addQRCode) && (addQRCode.length > 0)){
		
		gQRCodeRequested = true;

		gQRCodeURLOverride = addQRCode[0].replace("%qrcode","");

		gQRCodeURLOverride = gQRCodeURLOverride.trim();

		if (gQRCodeURLOverride != ""){

			gDoForceQRCodeURLOverride = true; 

		}
	}

	// Did they request a QR code caption override?
	gDoForceQRCodeCaptionOverride = false;

	gQRCodeCaptionOverride = "";

	// Search for a QR code caption request
	searchRegExp = /^%caption_for_qrcode.*$/m

	// Detect QR code caption annotation
	var addQRCodeCaption = theNotes.match(searchRegExp);

	if ((addQRCodeCaption) && (addQRCodeCaption.length > 0)){
		
		gQRCodeCaptionOverride = addQRCodeCaption[0].replace("%caption_for_qrcode","");

		gQRCodeCaptionOverride = gQRCodeCaptionOverride.trim();

		if (gQRCodeCaptionOverride != ""){

			gDoForceQRCodeCaptionOverride = true; 

		}
	}

	// Clear the tunebook index string
	theTunebookIndexTitle = "";

	// Did they request a tunebook index?
	TunebookIndexRequested = false;

	// Search for a tune index request
	searchRegExp = /^%addindex.*$/m

	// Detect tune index annotation
	var addTunebookIndex = theNotes.match(searchRegExp);

	if ((addTunebookIndex) && (addTunebookIndex.length > 0)){
		TunebookIndexRequested = true;
		theTunebookIndexTitle = addTunebookIndex[0].replace("%addindex","");
		theTunebookIndexTitle = theTunebookIndexTitle.trim();
	}

	// Clear the sorted tunebook index string
	theTunebookSortedIndexTitle = "";

	// Did they request a sorted tunebook index?
	TunebookSortedIndexRequested = false;

	// Search for a sorted tune index request
	searchRegExp = /^%addsortedindex.*$/m

	// Detect sorted tune index annotation
	var addTunebookSortedIndex = theNotes.match(searchRegExp);

	if ((addTunebookSortedIndex) && (addTunebookSortedIndex.length > 0)){
		TunebookSortedIndexRequested = true;
		theTunebookSortedIndexTitle = addTunebookSortedIndex[0].replace("%addsortedindex","");
		theTunebookSortedIndexTitle = theTunebookSortedIndexTitle.trim();
	}


	// Clear the tunebook toc string
	theTunebookTOCTitle = "";

	// Did they request a tunebook TOC?
	TunebookTOCRequested = false;

	// Search for a tunebook TOC request
	searchRegExp = /^%addtoc.*$/m

	// Detect tunebook TOC annotation
	var addTunebookTOC = theNotes.match(searchRegExp);

	if ((addTunebookTOC) && (addTunebookTOC.length > 0)){
		TunebookTOCRequested = true;
		theTunebookTOCTitle = addTunebookTOC[0].replace("%addtoc","");
		theTunebookTOCTitle = theTunebookTOCTitle.trim();
	}

	// Clear the sorted tunebook TOC string
	theTunebookSortedTOCTitle = "";

	// Did they request a sorted tunebook TOC?
	TunebookSortedTOCRequested = false;

	// Search for a sorted tune TOC request
	searchRegExp = /^%addsortedtoc.*$/m

	// Detect sorted tune TOC annotation
	var addTunebookSortedTOC = theNotes.match(searchRegExp);

	if ((addTunebookSortedTOC) && (addTunebookSortedTOC.length > 0)){
		TunebookSortedTOCRequested = true;
		theTunebookSortedTOCTitle = addTunebookSortedTOC[0].replace("%addsortedtoc","");
		theTunebookSortedTOCTitle = theTunebookSortedTOCTitle.trim();
	}

	// Clear the tunebook title page string
	theTunebookTP = "";

	// Did they request a tunebook title page?
	TunebookTPRequested = false;

	// Search for a tunebook title page request
	searchRegExp = /^%addtitle.*$/m

	// Detect tunebook title page annotation
	var addTunebookTP = theNotes.match(searchRegExp);

	if ((addTunebookTP) && (addTunebookTP.length > 0)){
		TunebookTPRequested = true;
		theTunebookTP = addTunebookTP[0].replace("%addtitle","");
		theTunebookTP = theTunebookTP.trim();
	}

	// Clear the tunebook subtitle page string
	theTunebookTPST = "";

	// Did they request a tunebook subtitle page?
	TunebookTPSTRequested = false;

	// Search for a tunebook title page request
	searchRegExp = /^%addsubtitle.*$/m

	// Detect tunebook subtitle page annotation
	var addTunebookTPST = theNotes.match(searchRegExp);

	if ((addTunebookTPST) && (addTunebookTPST.length > 0)){
		TunebookTPSTRequested = true;
		theTunebookTPST = addTunebookTPST[0].replace("%addsubtitle","");
		theTunebookTPST = theTunebookTPST.trim();
	}

	// Set the default tunebook index font size override
	INDEXFONTSIZE = 13;

	// Search for a tunebook index font size override request
	searchRegExp = /^%indexfontsize.*$/m

	// Detect tunebook index font size annotation
	var overrideIndexFontSize = theNotes.match(searchRegExp);

	if ((overrideIndexFontSize) && (overrideIndexFontSize.length > 0)){

		var theFontSize = overrideIndexFontSize[0].replace("%indexfontsize","");

		theFontSize = theFontSize.trim();
		
		var theFontSizeInt = parseInt(theFontSize);
		
		if ((!isNaN(theFontSizeInt)) && (theFontSizeInt > 0)){

			INDEXFONTSIZE = theFontSizeInt;

		}
	}

	// Set the default tunebook index line spacing 
	INDEXLINESPACING = 12;

	// Search for a tunebook index line spacing override request
	searchRegExp = /^%indexlinespacing.*$/m

	// Detect tunebook index line spacing annotation
	var overrideIndexLineSpacing = theNotes.match(searchRegExp);

	if ((overrideIndexLineSpacing) && (overrideIndexLineSpacing.length > 0)){

		var theLineSpacing = overrideIndexLineSpacing[0].replace("%indexlinespacing","");

		theLineSpacing = theLineSpacing.trim();
		
		var theLineSpacingInt = parseInt(theLineSpacing);
		
		if ((!isNaN(theLineSpacingInt)) && (theLineSpacingInt >= 0)){

			INDEXLINESPACING = theLineSpacingInt;

		}
	}

	// Set the default tunebook top offset override
	INDEXTITLESIZE = 18;

	// Search for a tunebook index title font size override request
	searchRegExp = /^%indextitlefontsize.*$/m

	// Detect tunebook index title font size annotation
	var overrideIndexTitleFontSize = theNotes.match(searchRegExp);

	if ((overrideIndexTitleFontSize) && (overrideIndexTitleFontSize.length > 0)){

		var theFontSize = overrideIndexTitleFontSize[0].replace("%indextitlefontsize","");

		theFontSize = theFontSize.trim();
		
		var theFontSizeInt = parseInt(theFontSize);
		
		if ((!isNaN(theFontSizeInt)) && (theFontSizeInt > 0)){

			INDEXTITLESIZE = theFontSizeInt;

		}
	}

	// Set the default tunebook title offset 
	INDEXTITLEOFFSET = 35;

	// Search for a tunebook index title offset override request
	searchRegExp = /^%indextitleoffset.*$/m

	// Detect tunebook index title offset annotation
	var overrideIndexTitleOffset = theNotes.match(searchRegExp);

	if ((overrideIndexTitleOffset) && (overrideIndexTitleOffset.length > 0)){

		var theTitleOffset = overrideIndexTitleOffset[0].replace("%indextitleoffset","");

		theTitleOffset = theTitleOffset.trim();
		
		var theTitleOffsetInt = parseInt(theTitleOffset);
		
		if ((!isNaN(theTitleOffsetInt)) && (theTitleOffsetInt >= 0)){

			INDEXTITLEOFFSET = theTitleOffsetInt;

		}
	}

	// Set the default tunebook index top offset 
	INDEXTOPOFFSET = 330;

	// Search for a tunebook index top offset override request
	searchRegExp = /^%indextopoffset.*$/m

	// Detect tunebook index top offset annotation
	var overrideIndexTopOffset = theNotes.match(searchRegExp);

	if ((overrideIndexTopOffset) && (overrideIndexTopOffset.length > 0)){

		var theTopOffset = overrideIndexTopOffset[0].replace("%indextopoffset","");

		theTopOffset = theTopOffset.trim();
		
		var theTopOffsetInt = parseInt(theTopOffset);
		
		if ((!isNaN(theTopOffsetInt)) && (theTopOffsetInt >= 0)){

			INDEXTOPOFFSET = theTopOffsetInt + 300;

		}
	}

	// Set the default tunebook TOC font size override
	TOCFONTSIZE = 13;

	// Search for a tunebook TOC font size override request
	searchRegExp = /^%tocfontsize.*$/m

	// Detect tunebook TOC font size annotation
	var overrideTOCFontSize = theNotes.match(searchRegExp);

	if ((overrideTOCFontSize) && (overrideTOCFontSize.length > 0)){

		var theFontSize = overrideTOCFontSize[0].replace("%tocfontsize","");

		theFontSize = theFontSize.trim();
		
		var theFontSizeInt = parseInt(theFontSize);
		
		if ((!isNaN(theFontSizeInt)) && (theFontSizeInt > 0)){

			TOCFONTSIZE = theFontSizeInt;

		}
	}

	// Set the default tunebook TOC line spacing 
	TOCLINESPACING = 12;

	// Search for a tunebook TOC line spacing override request
	searchRegExp = /^%toclinespacing.*$/m

	// Detect tunebook TOC line spacing annotation
	var overrideTOCLineSpacing = theNotes.match(searchRegExp);

	if ((overrideTOCLineSpacing) && (overrideTOCLineSpacing.length > 0)){

		var theLineSpacing = overrideTOCLineSpacing[0].replace("%toclinespacing","");

		theLineSpacing = theLineSpacing.trim();
		
		var theLineSpacingInt = parseInt(theLineSpacing);
		
		if ((!isNaN(theLineSpacingInt)) && (theLineSpacingInt >= 0)){

			TOCLINESPACING = theLineSpacingInt;

		}
	}

	// Set the default tunebook top offset override
	TOCTITLESIZE = 18;

	// Search for a tunebook TOC title font size override request
	searchRegExp = /^%toctitlefontsize.*$/m

	// Detect tunebook TOC title font size annotation
	var overrideTOCTitleFontSize = theNotes.match(searchRegExp);

	if ((overrideTOCTitleFontSize) && (overrideTOCTitleFontSize.length > 0)){

		var theFontSize = overrideTOCTitleFontSize[0].replace("%toctitlefontsize","");

		theFontSize = theFontSize.trim();
		
		var theFontSizeInt = parseInt(theFontSize);
		
		if ((!isNaN(theFontSizeInt)) && (theFontSizeInt > 0)){

			TOCTITLESIZE = theFontSizeInt;

		}
	}

	// Set the default tunebook title offset 
	TOCTITLEOFFSET = 35;

	// Search for a tunebook TOC title offset override request
	searchRegExp = /^%toctitleoffset.*$/m

	// Detect tunebook index title offset annotation
	var overrideTOCTitleOffset = theNotes.match(searchRegExp);

	if ((overrideTOCTitleOffset) && (overrideTOCTitleOffset.length > 0)){

		var theTitleOffset = overrideTOCTitleOffset[0].replace("%toctitleoffset","");

		theTitleOffset = theTitleOffset.trim();
		
		var theTitleOffsetInt = parseInt(theTitleOffset);
		
		if ((!isNaN(theTitleOffsetInt)) && (theTitleOffsetInt >= 0)){

			TOCTITLEOFFSET = theTitleOffsetInt;

		}
	}

	// Set the default tunebook TOC top offset 
	TOCTOPOFFSET = 330;

	// Search for a tunebook TOC top offset override request
	searchRegExp = /^%toctopoffset.*$/m

	// Detect tunebook TOC top offset annotation
	var overrideTOCTopOffset = theNotes.match(searchRegExp);

	if ((overrideTOCTopOffset) && (overrideTOCTopOffset.length > 0)){

		var theTopOffset = overrideTOCTopOffset[0].replace("%toctopoffset","");

		theTopOffset = theTopOffset.trim();
		
		var theTopOffsetInt = parseInt(theTopOffset);
		
		if ((!isNaN(theTopOffsetInt)) && (theTopOffsetInt >= 0)){

			TOCTOPOFFSET = theTopOffsetInt + 300;

		}
	}

	// Set the default tunebook PDF quality for 2X oversampling
	gPDFQuality = 0.75;

	// Search for a tunebook PDF quality request
	searchRegExp = /^%pdfquality.*$/m

	// Detect tunebook pdf quality annotation
	var overridePDFQuality = theNotes.match(searchRegExp);

	if ((overridePDFQuality) && (overridePDFQuality.length > 0)){

		var thePDFQuality = overridePDFQuality[0].replace("%pdfquality","");

		thePDFQuality = thePDFQuality.trim();
		
		var thePDFQualityFloat = parseFloat(thePDFQuality);
		
		if ((!isNaN(thePDFQualityFloat)) && (thePDFQualityFloat >= 0)){

			gPDFQuality = thePDFQualityFloat;

		}
	}

	// Include links to pages in the index
	gIncludePageLinks = true;

	// Search for a tunebook index page links request
	searchRegExp = /^%no_toc_or_index_links.*$/m

	// Detect tunebook page links annotation
	var noPageLinks = theNotes.match(searchRegExp);

	if ((noPageLinks) && (noPageLinks.length > 0)){

		gIncludePageLinks = false;

	}

	// Clear the tunebook forced PDF title
	gForcePDFFilename = "";

	// Did they request a tunebook title force
	gDoForcePDFFilename = false;

	// Search for a tunebook force PDF title request
	searchRegExp = /^%pdfname.*$/m

	// Detect force tunebook PDF title
	var forcePDFFilename = theNotes.match(searchRegExp);

	if ((forcePDFFilename) && (forcePDFFilename.length > 0)){

		gDoForcePDFFilename = true;

		gForcePDFFilename = forcePDFFilename[0].replace("%pdfname","");

		gForcePDFFilename = gForcePDFFilename.trim();

		// Must include a name after the directive
		if (gForcePDFFilename == ""){
			gDoForcePDFFilename = false;
		}

	}

	// Clear the URL page header and footers
	thePageHeaderURL = "";
	thePageFooterURL = "";
	
	// Check for URL pageheader annotation
	searchRegExp = /^%urlpageheader.*$/m

	// Detect URL page header annotation
	var urlPageHeader = theNotes.match(searchRegExp);

	if ((urlPageHeader) && (urlPageHeader.length > 0)){

		var theFullPageHeader = urlPageHeader[0].replace("%urlpageheader ","");
		
		theFullPageHeader = theFullPageHeader.trim();
		
		var theSplits = theFullPageHeader.split(" ");
		
		if (theSplits.length > 1){
		
			thePageHeaderURL = theSplits[0];
		
			thePageHeader = theFullPageHeader.replace(thePageHeaderURL,"");
		
			thePageHeader = thePageHeader.trim();
		
		}
	}

	// Check for URL page footer annotation
	searchRegExp = /^%urlpagefooter.*$/m

	// Detect URL page footer annotation
	var urlPageFooter = theNotes.match(searchRegExp);

	if ((urlPageFooter) && (urlPageFooter.length > 0)){

		var theFullPageFooter = urlPageFooter[0].replace("%urlpagefooter ","");
		
		theFullPageFooter = theFullPageFooter.trim();
		
		var theSplits = theFullPageFooter.split(" ");
		
		if (theSplits.length > 1){
		
			thePageFooterURL = theSplits[0];
		
			thePageFooter = theFullPageFooter.replace(thePageFooterURL,"");
		
			thePageFooter = thePageFooter.trim();
		
		}
	}

	// Check my work
	// console.log("thePageHeader = "+thePageHeader);
	// console.log("thePageFooter = "+thePageFooter);
	// console.log("thePageHeaderURL = "+thePageHeaderURL);
	// console.log("thePageFooterURL = "+thePageFooterURL);

	theTunebookTPURL = "";
	theTunebookTPSTURL = "";

	// Check for URL titlepage annotation
	searchRegExp = /^%urladdtitle.*$/m

	// Detect URL title page annotation
	var urlTitlePage = theNotes.match(searchRegExp);

	if ((urlTitlePage) && (urlTitlePage.length > 0)){

		var theFullTitlePage = urlTitlePage[0].replace("%urladdtitle ","");
		
		theTunebookTP = theFullTitlePage.trim();
		
		var theSplits = theFullTitlePage.split(" ");
		
		if (theSplits.length > 1){
		
			theTunebookTPURL = theSplits[0];
		
			theTunebookTP = theFullTitlePage.replace(theTunebookTPURL,"");
		
			theTunebookTP = theTunebookTP.trim();

			TunebookTPRequested = true;

		}
	}

	// Check for URL subtitlepage annotation
	searchRegExp = /^%urladdsubtitle.*$/m

	// Detect URL subtitle page annotation
	var urlSubTitlePage = theNotes.match(searchRegExp);

	if ((urlSubTitlePage) && (urlSubTitlePage.length > 0)){

		var theFullSubTitlePage = urlSubTitlePage[0].replace("%urladdsubtitle ","");
		
		theTunebookTPST = theFullSubTitlePage.trim();
		
		var theSplits = theFullSubTitlePage.split(" ");
		
		if (theSplits.length > 1){
		
			theTunebookTPSTURL = theSplits[0];
		
			theTunebookTPST = theFullSubTitlePage.replace(theTunebookTPSTURL,"");
		
			theTunebookTPST = theTunebookTPST.trim();

			TunebookTPSTRequested = true;

		}
	}

	// Include links to TOC on each page 
	gAddTOCLinkback = false;

	// Search for a TOC linkback 
	searchRegExp = /^%addlinkbacktotoc.*$/m

	// Detect TOC linkback annotation
	var addTOCLinkback = theNotes.match(searchRegExp);

	if ((addTOCLinkback) && (addTOCLinkback.length > 0)){

		gAddTOCLinkback = true;

	}

	// Include links to the index on each page 
	gAddIndexLinkback = false;

	// Search for a TOC linkback request
	searchRegExp = /^%addlinkbacktoindex.*$/m

	// Detect Index linkback annotation
	var addIndexLinkback = theNotes.match(searchRegExp);

	if ((addIndexLinkback) && (addIndexLinkback.length > 0)){

		gAddIndexLinkback = true;

	}

	// Include links to thesession for every tune
	gAddTheSessionHyperlinks = false;

	// Search for a thesession.org linkback request
	searchRegExp = /^%add_all_links_to_thesession.*$/m

	// Detect thesession linkback annotation
	var addSessionLinkback = theNotes.match(searchRegExp);

	if ((addSessionLinkback) && (addSessionLinkback.length > 0)){

		gAddTheSessionHyperlinks = true;

	}

	// Legacy directive
	// Search for a thesession.org linkback request
	searchRegExp = /^%addlinkstothesession.*$/m

	// Detect thesession linkback annotation
	addSessionLinkback = theNotes.match(searchRegExp);

	if ((addSessionLinkback) && (addSessionLinkback.length > 0)){

		gAddTheSessionHyperlinks = true;

	}

	// See if no editing allowed
	gInjectEditDisabled = false;
	
	searchRegExp = /^%no_edit_allowed.*$/m

	// Detect no edit allowed annotatoin
	var no_edit_allowed = theNotes.match(searchRegExp);

	if ((no_edit_allowed) && (no_edit_allowed.length > 0)){

		gInjectEditDisabled = true;

	}

	// See if hornpipe swing global inject requested
	gAllSwingHornpipesRequested = false;
	gAllSwingHornpipesSwingFactor = gAutoSwingFactor;
	
	searchRegExp = /^%swing_all_hornpipes.*$/m

	// Detect swing all hornpipes annotation
	var swing_all_hornpipes = theNotes.match(searchRegExp);

	if ((swing_all_hornpipes) && (swing_all_hornpipes.length > 0)){

		gAllSwingHornpipesRequested = true;

		var theSwingFactor = swing_all_hornpipes[0].replace("%swing_all_hornpipes","");
		
		theSwingFactor = theSwingFactor.trim();

		if (theSwingFactor != ""){

			var theSwingFactorFloat = parseFloat(theSwingFactor);

			if (!isNaN(theSwingFactorFloat)){

				// Range check swing value
				if ((theSwingFactorFloat >= -0.9) && (theSwingFactorFloat <= 0.9)){

					gAllSwingHornpipesSwingFactor = theSwingFactorFloat; 

				}

			}
		}

	}

	// See if hornpipe swing disable global inject requested
	gAllNoSwingHornpipesRequested = false;
	
	searchRegExp = /^%noswing_all_hornpipes.*$/m

	// Detect no swing all hornpipes annotation
	var no_swing_all_hornpipes = theNotes.match(searchRegExp);

	if ((no_swing_all_hornpipes) && (no_swing_all_hornpipes.length > 0)){

		gAllNoSwingHornpipesRequested = true;

	}

	// Include playback links for every tune
	gAddPlaybackHyperlinks = false;

	// Inject the MIDI program in the ABC before creating the link
	gAddPlaybackHyperlinksIncludePrograms = false;

	// Search for a playback link request
	searchRegExp = /^%add_all_playback_links.*$/m

	// Detect playback link annotation
	var addPlaybackHyperlinks = theNotes.match(searchRegExp);

	if ((addPlaybackHyperlinks) && (addPlaybackHyperlinks.length > 0)){

		gAddPlaybackHyperlinks = true;

		var thePatch = addPlaybackHyperlinks[0].replace("%add_all_playback_links","");

		thePatch = thePatch.trim();

		var thePatches = thePatch.match(/\b(\w+)\b/g);

		gPlaybackHyperlinkMelodyProgram = gTheMelodyProgram;
		gPlaybackHyperlinkBassChordProgram = gTheChordProgram;
		gPlaybackHyperlinkSoundFont = "fluid";

		if (gDefaultSoundFont.indexOf("Fluid")!=-1){
			gPlaybackHyperlinkSoundFont = "fluid";
		}else
		if (gDefaultSoundFont.indexOf("Musyng")!=-1){
			gPlaybackHyperlinkSoundFont = "musyng";
		}else
		if (gDefaultSoundFont.indexOf("FatBoy")!=-1){
			gPlaybackHyperlinkSoundFont = "fatboy";
		}else
		if (gDefaultSoundFont.indexOf("canvas")!=-1){
			gPlaybackHyperlinkSoundFont = "canvas";
		}else
		if (gDefaultSoundFont.indexOf("mscore")!=-1){
			gPlaybackHyperlinkSoundFont = "mscore";
		}

		if (thePatches && (thePatches.length > 0)){
			
			// Inject MIDI program info in the tune
			gAddPlaybackHyperlinksIncludePrograms = true;

			if (thePatches.length >= 1){
				gPlaybackHyperlinkMelodyProgram = thePatches[0];
				gPlaybackHyperlinkMelodyProgram = gPlaybackHyperlinkMelodyProgram.trim();
			}

			if (thePatches.length > 1){
				gPlaybackHyperlinkBassChordProgram = thePatches[1];
				gPlaybackHyperlinkBassChordProgram = gPlaybackHyperlinkBassChordProgram.trim();
			}	

			if (thePatches.length > 2){
				gPlaybackHyperlinkSoundFont = thePatches[2];
				gPlaybackHyperlinkSoundFont = gPlaybackHyperlinkSoundFont.trim();
			}	

		}
		else{

			// No programs specified, just add the link, but don't inject the programs
			gAddPlaybackHyperlinksIncludePrograms = false;

		}
	}

	// Clear the tunebook toc headerstring
	theTunebookTOCHeader = "";

	// Did they request a tunebook TOC header?
	TunebookTOCHeaderRequested = false;

	// Search for a tunebook TOC header request
	searchRegExp = /^%tocheader.*$/m

	// Detect tunebook TOC annotation
	var addTunebookTOCHeader = theNotes.match(searchRegExp);

	if ((addTunebookTOCHeader) && (addTunebookTOCHeader.length > 0)){
		TunebookTOCHeaderRequested = true;
		theTunebookTOCHeader = addTunebookTOCHeader[0].replace("%tocheader","");
		theTunebookTOCHeader = theTunebookTOCHeader.trim();
	}

	// Clear the tunebook index headerstring
	theTunebookIndexHeader = "";

	// Did they request a tunebook index header?
	TunebookTOCIndexHeaderRequested = false;

	// Search for a tunebook index header request
	searchRegExp = /^%indexheader.*$/m

	// Detect tunebook TOC annotation
	var addTunebookIndexHeader = theNotes.match(searchRegExp);

	if ((addTunebookIndexHeader) && (addTunebookIndexHeader.length > 0)){
		TunebookIndexHeaderRequested = true;
		theTunebookIndexHeader = addTunebookIndexHeader[0].replace("%indexheader","");
		theTunebookIndexHeader = theTunebookIndexHeader.trim();
	}

	// Search for a between tunes space override
	searchRegExp = /^%pdf_between_tune_space.*$/m

	// Detect tunebook pdf between tune space override
	// Default is 20/72"
	gBetweenTuneSpace = 20;
	gGotBetweenTuneSpace = false;

	var betweenTuneSpace = theNotes.match(searchRegExp);

	if ((betweenTuneSpace) && (betweenTuneSpace.length > 0)){

		var betweenTuneSpace = betweenTuneSpace[0].replace("%pdf_between_tune_space","");

		betweenTuneSpace = betweenTuneSpace.trim();
		
		var betweenTuneSpaceInt = parseInt(betweenTuneSpace);
		
		if ((!isNaN(betweenTuneSpaceInt)) && (betweenTuneSpaceInt >= 0)){

			gBetweenTuneSpace = betweenTuneSpaceInt;

			gGotBetweenTuneSpace = true;

		}
	}

	// Search for a PDF font request
	searchRegExp = /^%pdffont.*$/m

	// Now being set in the PDF dialog
	// gPDFFont = "Times";
	// gPDFFontStyle = "";

	// Detect tunebook TOC annotation
	var pdfFont = theNotes.match(searchRegExp);

	if ((pdfFont) && (pdfFont.length > 0)){

		pdfFont = pdfFont[0].replace("%pdffont","");
		
		pdfFont = pdfFont.trim();
		
		var theFontSplit = pdfFont.split(" ");
		
		if ((theFontSplit) && (theFontSplit.length>1)){

			gPDFFont = theFontSplit[0];
			gPDFFontStyle = theFontSplit[1];

		}
		else{
			
			gPDFFont = pdfFont;
			gPDFFontStyle = "";

		}

		if (gPDFFontStyle.toLowerCase() == "normal"){
			gPDFFontStyle = "";
		}

		// Sanity check font name
		var lcfont = gPDFFont.toLowerCase();

		switch (lcfont){
			case "times":
				// Translate Times style description
				if(gPDFFontStyle.toLowerCase() == "oblique"){
					gPDFFontStyle = "Italic";
				}
				else
				if(gPDFFontStyle.toLowerCase() == "boldoblique"){
					gPDFFontStyle = "BoldItalic";
				}
				break;

			case "helvetica":
			case "courier":
				break;

			default:
				gPDFFont = "Times";
				gPDFFontStyle = "";
				break;
				
		}

		// Sanity check font style
		var lcstyle = gPDFFontStyle.toLowerCase();

		if (lcstyle != ""){
		
			switch (lcstyle){
				case "normal":
				case "bold":
				case "oblique":
				case "boldoblique":
				case "italic":
				case "bolditalic":
					break;

				default:
					gPDFFontStyle = "";
					break;
			}
		}
	}


	// Check my work
	// console.log("theTunebookTP = "+theTunebookTP);
	// console.log("theTunebookTPST = "+theTunebookTPST);
	// console.log("theTunebookTPURL = "+theTunebookTPURL);
	// console.log("theTunebookTPSTURL = "+theTunebookTPSTURL);
	// console.log("gAddTOCLinkback = "+gAddTOCLinkback);
	// console.log("gAddIndexLinkback = "+gAddIndexLinkback);
	// console.log("gAddTheSessionHyperlinks = "+gAddTheSessionHyperlinks);
	// console.log("gAddPlaybackHyperlinks = "+gAddPlaybackHyperlinks);
	// console.log("gPlaybackHyperlinkMelodyProgram = "+gPlaybackHyperlinkMelodyProgram);
	// console.log("gPlaybackHyperlinkBassChordProgram = "+gPlaybackHyperlinkBassChordProgram);
	// console.log("gPDFFont = "+gPDFFont);
	// console.log("gPDFFontStyle = "+gPDFFontStyle);

}

//
// Process a header or footer and replace macros
// 
// Header/footer macros:
//
// $PDFNAME - Same as the saved PDF name
// $PAGENUMBER - Current page number
// $DATEMDY - Current date in M-D-Y format
// $DATEYMD - Current date in Y-M-D format
// $TIME - Current time in HH:MM format
// $TUNECOUNT - Number of tunes in the ABC
// $TUNENAMES - All the tune names in the ABC
// $QRCODE
//
// Examples: 
// %pageheader My Awesome Tune Book - Saved at $TIME - Page: $PAGENUMBER
// %pagefooter My Awesome Tune Book - Saved on $DATEMDY at $TIME - Page: $PAGENUMBER

function ProcessHeaderFooter(str,pageNumber,pageCount){

	var theFileName = getDescriptiveFileName(pageCount,true);

	// If forcing a specific PDF export name, inject it now.
	if (gDoForcePDFFilename){

		var originalFileName = theFileName;
		
		theFileName = gForcePDFFilename;

		// Clean the forced PDF name
		theFileName = theFileName.trim();

		// Just in case they put .pdf in the forced name
		theFileName = theFileName.replace(".pdf","");

		// Make sure we actually have a placeholder after cleaning
		if (theFileName == ""){
			theFileName = originalFileName;
		}

	}

	var workstr = str.replace("$PDFNAME",theFileName+".pdf");

	workstr = workstr.replace("$PAGENUMBER",pageNumber);

	workstr = workstr.replace("$TUNECOUNT",totalTunes);

	workstr = workstr.replace("$TUNENAMES",theHeaderFooterTuneNames);
	
	var dateFormatMDY = formatDate(0);
	var dateFormatYMD = formatDate(1);

	workstr = workstr.replace("$DATEMDY",dateFormatMDY);

	workstr = workstr.replace("$DATEYMD",dateFormatYMD);

	var theTime = formatTime();

	workstr = workstr.replace("$TIME",theTime);

	return workstr;
}

//
// Calculate and cache the page number and footer position
//
function calcPageNumberVerticalOffset(thePDF){

	thePageNumberVerticalOffset = thePDF.internal.pageSize.getHeight()-9;

}

//
// Add optional page numbers and header or footer on the current PDF page
//
function AddPageHeaderFooter(thePDF,doAddPageNumber,pageNumber,pageNumberLocation,hideFirstPageNumber,paperStyle){

	// Calc offset for A4 paper
	var voff = PAGENUMBERTOP;

	if (paperStyle == "letter"){
		// Letter offset
		voff = PAGENUMBERTOP;
	}
	else{
		// A4 offset
		voff = PAGENUMBERTOPA4;
	}

	thePDF.setFont(gPDFFont,gPDFFontStyle,"normal");
	thePDF.setFontSize(HEADERFOOTERFONTSIZE);

	var hasHeader = false;

	if (thePageHeader && (thePageHeader != "")){

		var thePageHeaderProcessed = ProcessHeaderFooter(thePageHeader,pageNumber,totalTunes);

		if (thePageHeaderURL && (thePageHeaderURL != "")){

			var textWidth = thePDF.getTextWidth(thePageHeaderProcessed);

			// Add the header as a hyperlink
			thePDF.textWithLink(thePageHeaderProcessed, (thePDF.internal.pageSize.getWidth()/3.10) - (textWidth/2), voff, {align:"left", url:thePageHeaderURL});

		}
		else{

			// Add the header
			thePDF.text(thePageHeaderProcessed, (thePDF.internal.pageSize.getWidth()/3.10), voff, {align:"center"});

		}

		// Hide page number in center of header
		hasHeader = true;

	}

	var hasFooter = false;

	if (thePageFooter && (thePageFooter != "")){

		var thePageFooterProcessed = ProcessHeaderFooter(thePageFooter,pageNumber,totalTunes);

		if (thePageFooterURL && (thePageFooterURL != "")){

			var textWidth = thePDF.getTextWidth(thePageFooterProcessed);

			// Add the footer as a hyperlink
			thePDF.textWithLink(thePageFooterProcessed, (thePDF.internal.pageSize.getWidth()/3.10)  - (textWidth/2), thePageNumberVerticalOffset , {align:"center", url:thePageFooterURL});

		}
		else{

			// Add the footer
			thePDF.text(thePageFooterProcessed, (thePDF.internal.pageSize.getWidth()/3.10), thePageNumberVerticalOffset , {align:"center"});

		}

		// Hide page number in the center of the footer
		hasFooter = true;

	}

	// Only processing headers and footers
	if (!doAddPageNumber){
		return;
	}

	// Hiding the first page number?
	if (hideFirstPageNumber ){
		if (pageNumber == 1){
			return;
		}
	}

	thePDF.setFont(gPDFFont,gPDFFontStyle,"normal");
	thePDF.setFontSize(HEADERFOOTERFONTSIZE);

	// Add page number
	var str = "" + pageNumber;

	// Division accounts for the PDF internal scaling

	switch (pageNumberLocation){
		case "tl":
			// Top left
			thePDF.text(str, 13, voff, {align:"center"});
			break;
		case "tc":
			// Top center - don't print if there is a header
			if (!hasHeader){
				thePDF.text(str, (thePDF.internal.pageSize.getWidth()/3.10), voff, {align:"center"});
			}
			break;
		case "tr":
			// Top right
			thePDF.text(str, (thePDF.internal.pageSize.getWidth()/1.55)-12, voff, {align:"center"});
			break;
		case "bl":
			// Bottom left
			thePDF.text(str, 13, thePageNumberVerticalOffset , {align:"center"});
			break;
		case "bc":
			// Bottom center - don't print if there is a footer
			if (!hasFooter){
				thePDF.text(str, (thePDF.internal.pageSize.getWidth()/3.10), thePageNumberVerticalOffset , {align:"center"});
			}
			break;
		case "br":
			// Bottom right
			thePDF.text(str, (thePDF.internal.pageSize.getWidth()/1.55)-12, thePageNumberVerticalOffset , {align:"center"});
			break;
		case "tlr":
			if ((pageNumber % 2) == 1){
				// Top left
				thePDF.text(str, 13, voff, {align:"center"});
			}
			else{
				// Top right
				thePDF.text(str, (thePDF.internal.pageSize.getWidth()/1.55)-12, voff , {align:"center"});
			}
			break;
		case "trl":
			if ((pageNumber % 2) == 1){
				// Top right
				thePDF.text(str, (thePDF.internal.pageSize.getWidth()/1.55)-12, voff , {align:"center"});
			}
			else{
				// Top left
				thePDF.text(str, 13, voff, {align:"center"});
			}
			break;
		case "blr":
			if ((pageNumber % 2) == 1){
				// Bottom left
				thePDF.text(str, 13, thePageNumberVerticalOffset , {align:"center"});
			}
			else{
				// Bottom right
				thePDF.text(str, (thePDF.internal.pageSize.getWidth()/1.55)-12, thePageNumberVerticalOffset , {align:"center"});
			}
			break;
		case "brl":
			if ((pageNumber % 2) == 1){
				// Bottom right
				thePDF.text(str, (thePDF.internal.pageSize.getWidth()/1.55)-12, thePageNumberVerticalOffset , {align:"center"});
			}
			else{
				// Bottom left
				thePDF.text(str, 13, thePageNumberVerticalOffset , {align:"center"});
			}
			break;

	}	
}

// 
// Prime the whistle rendering
//
// This is a hack for SVG rendering latency for the Tin Whistle font seen on Safari and mobile Safari
//
function PrimeWhistleRender(theBlocks,callback){
	
	// Need at least a couple of lines, generally the first is the title, the second is the notation
	if (theBlocks.length < 2){

		callback();

		return;

	}

	qualitaet = 1200; 

	//console.log("PrimeWhistleRender 1");

	var theBlock = theBlocks[0];

	// Get the SVG from the block
	var svg = theBlock.querySelector("svg");

	// Copy the SVG to the offscreen
	theOffscreen.innerHTML = "<div>" + svg.outerHTML + "</div>";

	// Find the SVG in the offscreen
	svg = theOffscreen.querySelector("svg");

	// Set the SVG width for high resolution rasterization
	svg.setAttribute("width", qualitaet);

	// scale improves the subsequent PDF quality. was theBlock
	htmlToImage.toCanvas(svg, {
			backgroundColor: "white",
			style: {
				background: "white"
			},
			pixelRatio: (gPDFQuality*2)
		})
		.then(function(canvas){

			//console.log("PrimeWhistleRender 2");

			var theBlock = theBlocks[1];

			// Get the SVG from the block
			var svg = theBlock.querySelector("svg");

			// Copy the SVG to the offscreen
			theOffscreen.innerHTML = "<div>" + svg.outerHTML + "</div>";

			// Find the SVG in the offscreen
			svg = theOffscreen.querySelector("svg");

			// Set the SVG width for high resolution rasterization
			svg.setAttribute("width", qualitaet);

			// scale improves the subsequent PDF quality. was theBlock
			htmlToImage.toCanvas(svg, {
					backgroundColor: "white",
					style: {
						background: "white"
					},
					pixelRatio: (gPDFQuality*2)
				})
				.then(function(canvas){

					//console.log("PrimeWhistleRender 3");

					var theBlock;

					// This allows the demo ABC created by the "New ABC" command to work, only has one line of notation
					if (theBlocks.length < 3){

						// Just re-render the second line
						theBlock = theBlocks[1];

					}
					else{

						theBlock = theBlocks[2];

					}

					// Get the SVG from the block
					var svg = theBlock.querySelector("svg");

					// Copy the SVG to the offscreen
					theOffscreen.innerHTML = "<div>" + svg.outerHTML + "</div>";

					// Find the SVG in the offscreen
					svg = theOffscreen.querySelector("svg");

					// Set the SVG width for high resolution rasterization
					svg.setAttribute("width", qualitaet);

					// scale improves the subsequent PDF quality. was theBlock
					htmlToImage.toCanvas(svg, {
							backgroundColor: "white",
							style: {
								background: "white"
							},
							pixelRatio: (gPDFQuality*2) 
						})
						.then(function(canvas){

							//console.log("PrimeWhistleRender 4");

							// And finally callback to the main render to allow it to proceed
							callback();

						});
				});
		});
}


//
// Render a single SVG block to PDF and callback when done
//
function RenderPDFBlock(theBlock, blockIndex, doSinglePage, pageBreakList, addPageNumbers, pageNumberLocation, hideFirstPageNumber, paperStyle, doIncipits, callback){

	// Make sure we have a valid block
	if ((theBlock == null) || (theBlock == undefined)){

		return;

	}

	var scale_factor = 1;

	if (doIncipits){

		var theBlockID = theBlock.id + ".block";

		// Only process the first two blocks of each tune if doing incipits
		if ((theBlockID.indexOf("_0.block") == -1) && (theBlockID.indexOf("_1.block") == -1)) {

			callback();

			return;
		}

		// Doing two column incipits
		if (gIncipitsColumns == 2){

			scale_factor = 2;

		}

	}

	// Get the SVG from the block
	var svg = theBlock.querySelector("svg");

	// Copy the SVG to the offscreen
	theOffscreen.innerHTML = "<div>" + svg.outerHTML + "</div>";

	// Find the SVG in the offscreen
	svg = theOffscreen.querySelector("svg");

	// Set the SVG width for high resolution rasterization
	svg.setAttribute("width", qualitaet);

	// scale improves the subsequent PDF quality. was theBlock
	htmlToImage.toCanvas(svg, {
			backgroundColor: "white",
			style: {
				background: "white"
			},
			pixelRatio: (gPDFQuality*2) 
		})
		.then(function(canvas) {

			// Select left offset based on paper style
			var hoff = PAGELEFTOFFSET;

			if (paperStyle == "a4"){

				hoff = PAGELEFTOFFSETA4;

			}

			// Calculate the column offsets
			var col0_hoff = hoff;

			var col1_hoff = hoff + (535/2);

			// For second column incipits
			if (column_number == 1){

			 	hoff = col1_hoff;
			
			}

			var thePageHeight = PAGEHEIGHTLETTER;

			if (paperStyle == "a4"){

				thePageHeight = PAGEHEIGHTA4;

			}

			// Creates a sharper image
			pdf.internal.scaleFactor = PDFSCALEFACTOR;

			var imgData = canvas.toDataURL("image/jpeg", PDFJPGQUALITY); 

			var theBlockID = theBlock.id + ".block";

			var isFirstBlock = false;

			// Insert a new page for each tune
			if (theBlockID.indexOf("_0.block") != -1) {

				isFirstBlock = true;

				if (!isFirstPage) {

					if (doSinglePage) {

						running_height = PAGETOPOFFSET;

						theCurrentPageNumber++; // for the status display.

						pdf.addPage(paperStyle); //... create a page in letter or A4 format, then leave a 30 pt margin at the top and continue.

						document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";

					} else {

						// 
						// Does this tune have a forced page break?
						//
						if (pageBreakList[tunesProcessed-1]){

							if (doIncipits){

								// Setup second column if doing notation incipits in two column mode
								if ((gIncipitsColumns==2) && (column_number == 0)){

									// Yes, force it to the second column
									running_height = PAGETOPOFFSET;

									column_number = 1;

									// Place this tune in the second column
									hoff = col1_hoff;

								}
								else{

									// Filled the second column, generate a new page

									// Yes, force it to a new page
									running_height = PAGETOPOFFSET;

									theCurrentPageNumber++; // for the status display.

									pdf.addPage(paperStyle); //... create a page in letter or a4 format, then leave a 30 pt margin at the top and continue.

									document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";

									// Reset column number
									column_number = 0;

									// Reset the offset
									hoff = col0_hoff;

								}

							}
							else{

								// Yes, force it to a new page

								running_height = PAGETOPOFFSET;

								theCurrentPageNumber++; // for the status display.

								pdf.addPage(paperStyle); //... create a page in letter or a4 format, then leave a 30 pt margin at the top and continue.

								document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";
							}

						}
						else{

							// Otherwise, move it down the current page a bit
							running_height += (BETWEENTUNESPACE / scale_factor);

						}

					}

				} else {

					isFirstPage = false;

					// Get the position for future page numbers and footers
					calcPageNumberVerticalOffset(pdf);

				}

				// Save the tune page number
				theTunePageMap[tunesProcessed] = theCurrentPageNumber;

				// Bump the tune processed counter
				tunesProcessed++;

				if (tunesProcessed < totalTunes){

					document.getElementById("statustunecount").innerHTML = "Rendering tune <font color=\"red\">"+(tunesProcessed+1)+"</font>" + " of  <font color=\"red\">"+totalTunes+"</font>"

				}

			}

			height = parseInt(canvas.height * 535 / canvas.width);

			height /= scale_factor;

			// the first two values mean x,y coordinates for the upper left corner. Enlarge to get larger margin.
			// then comes width, then height. The second value can be freely selected - then it leaves more space at the top.

			if (running_height + height <= thePageHeight - PAGEBOTTOMOFFSET) // i.e. if a block of notes would get in the way with the bottom margin (30 pt), then a new one please...
			{

				if (isFirstBlock){

					gTuneHyperlinks.push({page:theCurrentPageNumber,x:hoff,y:running_height,width:(535 / scale_factor),height:height,url:""});

				}

				pdf.addImage(imgData, 'JPG', hoff, running_height, (535 / scale_factor), height);


			} else {

				// Reset the running height
				running_height = PAGETOPOFFSET;

				theCurrentPageNumber++; // for the status display.

				// Set the tune page map and hyperlink for this tune if moved to the top of the next page
				if (isFirstBlock){

					gTuneHyperlinks.push({page:theCurrentPageNumber,x:hoff,y:running_height,width:(535 / scale_factor),height:height,url:""});

					theTunePageMap[tunesProcessed - 1] = theCurrentPageNumber;

				}

				pdf.addPage(paperStyle); //... create a page in letter or a4 format, then leave a 30 pt margin at the top and continue.

				pdf.addImage(imgData, 'JPG', hoff, running_height, (535 / scale_factor), height);

				document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";
			}

			// so that it starts the new one exactly one pt behind the current one.
			running_height = running_height + height + (1 / scale_factor);

			callback(true);


		});

}

//
// Prompt for PDF filename
//
function promptForPDFFilename(placeholder, callback){

	// Process comment-based PDF commands
	ParseCommentCommands(gTheABC.value);

	// If forcing a specific PDF export name, inject it now.
	if (gDoForcePDFFilename){

		var originalPlaceHolder = placeholder;
		
		placeholder = gForcePDFFilename;

		// Clean the forced PDF name
		placeholder = placeholder.trim();

		// Just in case they put .pdf in the forced name
		placeholder = placeholder.replace(".pdf","");

		// Make sure we actually have a placeholder after cleaning
		if (placeholder == ""){
			placeholder = originalPlaceHolder;
		}

	}

	DayPilot.Modal.prompt("Please enter a filename for your PDF file:", placeholder+".pdf",{ theme: "modal_flat", top: 200, autoFocus: false, scrollWithPage: (AllowDialogsToScroll()) }).then(function(args) {

		var fname = args.result;

		// If the user pressed Cancel, exit
		if (fname != null){

			// Strip out any naughty HTML tag characters
			fname = fname.replace(/[^a-zA-Z0-9_\-. ]+/ig, '');

			if (fname.length != 0){
				// Give it a good extension
				if (isDesktopBrowser()){

					if (!fname.endsWith(".pdf")){

						// Give it a good extension
						fname = fname.replace(/\..+$/, '');
						fname = fname + ".pdf";

					}
				}
				else{

					// iOS and Android have odd rules about text file saving
					// Give it a good extension
					fname = fname.replace(/\..+$/, '');
					fname = fname + ".pdf";

				}
			}
			else{

				fname = null;

			}
		}

		callback(fname);

	});
}

//
// Warn if coming in from a bad Acrobat link
//
function ShowAcrobatHyperlinkLengthWarning(){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","ShowAcrobatHyperlinkLengthWarning");

	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica;">Adobe Acrobat Hyperlink Length Warning</p>';
	modal_msg += '<p style="font-size:12pt;line-height:18pt;margin-top:36px;">Adobe Acrobat limits the length of clicked hyperlinks to 2076 characters.</p>';
	modal_msg += '<p style="font-size:12pt;line-height:18pt;">Some very complex tune Share URLs used in tunebooks generated with this tool may exceed this limit.</p>';
	modal_msg += '<p style="font-size:12pt;line-height:18pt;">If you are using Adobe Acrobat as your PDF reader, and you are seeing this message after clicking a complex tune link, try instead simply dragging the PDF of the tunebook to your browser to read it.</p>';
	modal_msg += '<p style="font-size:12pt;line-height:18pt;">The PDF readers built into most modern browsers do not have this hyperlink length limitation and will properly open the tune hyperlink when clicked.</p>'

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 100, width: 700,  scrollWithPage: (AllowDialogsToScroll()) });
}

//
// Put up an alert that there is a decode issue
//
function ShowHyperlinkBadDecodeAlert(){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","ShowHyperlinkBadDecodeAlert");

	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica;">Problem Decoding Tune Share URL</p>';
	modal_msg += '<p style="font-size:12pt;line-height:18pt;margin-top:36px;text-align:center;">An unrecoverable error occured when decoding this tune ShareURL.</p>';

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 100, width: 700,  scrollWithPage: (AllowDialogsToScroll()) });

}

// 
// Warn if there are any play ShareURLs too large for Adobe Acrobat
//
function ShowAcrobatURLSizeWarningDialog(){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","ShowAcrobatURLSizeWarningDialog");

	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica;">Adobe Acrobat Maximum URL Length Warning</p>';
	modal_msg += '<p style="font-size:12pt;line-height:18pt;margin-top:36px;">During PDF export play hyperlink embedding, some very long and complex tunes had play hyperlinks that exceeded the Adobe Acrobat maximum URL length of 2076 characters.</p>';
	modal_msg += '<p style="font-size:12pt;line-height:18pt;">These play links will work with the built-in PDF reader on most web browsers and online PDF readers, many non-Adobe desktop and mobile PDF readers, but will not open correctly if the tune title is clicked when the PDF is viewed using Adobe Acrobat:</p>';

	var nBadTunes = gAcrobatURLLimitExceeded.length;
	for (var i=0;i<nBadTunes;++i){
		modal_msg += '<p style="font-size:12pt;line-height:10pt;">"'+gAcrobatURLLimitExceeded[i].name+'"&nbsp;-&nbsp;URL length: '+gAcrobatURLLimitExceeded[i].urllength+'</p>';
	}
	modal_msg += '<p style="font-size:12pt;line-height:18pt;margin-top:24px">If Adobe Acrobat is your target PDF reader, your best option is to use the per-tune %hyperlink directive in these tunes with a shortened play Share URL manually generated using the Sharing dialog.</p>';

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 75, width: 700,  scrollWithPage: (AllowDialogsToScroll()) }).then(function(){

		// Clear the list of bad URLs
		gAcrobatURLLimitExceeded = [];
			
	});
}

//
// PDF Exporter
//
function ExportPDF(){

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	// If disabled, return
	if (!gAllowPDF){
		return;
	}

	// Keep track of use of PDF exporter
	sendGoogleAnalytics("export","PDF");

	// Get the page format
	var elem = document.getElementById("pdfformat");

	var thePageOptions = elem.options[elem.selectedIndex].value;

	// Are we doing ABC incipits?
	var textIncipitsRequested = ((thePageOptions == "incipits_abc") || (thePageOptions == "incipits_a4_abc") || (thePageOptions == "incipits_abc_sort") || (thePageOptions == "incipits_a4_abc_sort"));
	
	// Count the tunes
	totalTunes = CountTunes();
	
	var title = getDescriptiveFileName(totalTunes,true);

	// No, use the normal PDF export path
	if (textIncipitsRequested){

		title += "_Incipits";

		promptForPDFFilename(title,function(fname){

			if (fname){

				ExportTextIncipitsPDF(fname);
			}
		});

	}
	else{

		// Get the page format
		var elem = document.getElementById("pdfformat");

		var thePageOptions = elem.options[elem.selectedIndex].value;

		var incipitsRequested = ((thePageOptions == "incipits") || (thePageOptions == "incipits_a4"));
		
		if (incipitsRequested){

			// Tack on a suffix to the PDF name
			title += "_Incipits";
		}

		promptForPDFFilename(title,function(fname){

			if (fname){

				ExportNotationPDF(fname);
			}
		});

	}

}

//
// Export the first few bars of each tune in ABC format
//
function ExportTextIncipitsPDF(title){

	// Clear the cancel flag
	gPDFCancelRequested = false;

	// Get the page format
	var elem = document.getElementById("pdfformat");

	var thePageOptions = elem.options[elem.selectedIndex].value;

	// Show the PDF status modal
	var pdfstatus = document.getElementById("pdf-controls");
	pdfstatus.style.display = "block";

	// Page number location
	elem = document.getElementById("pagenumbers");

	var pageNumberLocation = elem.options[elem.selectedIndex].value;

	// Add page numbers?
	var addPageNumbers = (pageNumberLocation != "none");

	// What size paper? Letter or A4?
	var paperStyle = "letter";

	if ((thePageOptions == "incipits_a4_abc") || (thePageOptions == "incipits_a4_abc_sort")) {

		paperStyle = "a4";

	}

	// Requested sorted ABC incipits?
	var TunebookABCSortedIncipitsRequested = false;

	if ((thePageOptions == "incipits_abc_sort") || (thePageOptions == "incipits_a4_abc_sort")) {

		TunebookABCSortedIncipitsRequested = true;

	}

	// Hide page numbers on page 1?
	var hideFirstPageNumber = false;

	elem = document.getElementById("firstpage");

	var firstPageNumbers = elem.options[elem.selectedIndex].value;

	if (firstPageNumbers == "no"){

		hideFirstPageNumber = true;

	}

	// Process comment-based PDF commands
	ParseCommentCommands(gTheABC.value);

	// Clear the render time
	theRenderTime = "";

	// Cache the tune titles
	theHeaderFooterTuneNames = GetAllTuneTitles();

	// Init the shared globals
	theCurrentPageNumber = 1;

	// Count the tunes
	totalTunes = CountTunes();

	isFirstPage = true;

	// Setup function scope shared vars

	document.getElementById("statuspdfname").innerHTML = "Generating <font color=\"blue\">" + title + "</font>";

	document.getElementById("statustunecount").innerHTML = "";

	document.getElementById("pagestatustext").innerHTML = "&nbsp;";

	// Set the global PDF rendering flag
	gRenderingPDF = true;

	pdf = new jsPDF('p', 'pt', paperStyle);	

	// Set the initial PDF display mode
	pdf.setDisplayMode("fullpage","single","UseNone");

	// Creates a sharper image
	pdf.internal.scaleFactor = PDFSCALEFACTOR;

	// Get the position for future page numbers and footers
	calcPageNumberVerticalOffset(pdf);

	setTimeout(function(){

		var theTunePageMap = [];

		theTunePageMap = GenerateTextIncipits(pdf,addPageNumbers,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageMap,TunebookABCSortedIncipitsRequested);

		document.getElementById("statustunecount").innerHTML = "ABC Incipits Added!";
		
		var totalPages = theCurrentPageNumber;

		if (TunebookTPRequested){

			// Add a new page
			pdf.addPage(paperStyle);
			theCurrentPageNumber++;

			pdf.movePage(theCurrentPageNumber,1);

		} 

		var theDelta = theCurrentPageNumber;
		var theTOCStart = 1;
		var theTOCSortedStart = 1;

		if (TunebookTOCRequested){

			DryRunAddTuneTOC(pdf,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageMap,theTunebookSortedTOCTitle, false, TunebookABCSortedIncipitsRequested);

		}

		theTOCSortedStart = theCurrentPageNumber-theDelta;
		theTOCSortedStart++;

		if (TunebookSortedTOCRequested){

			DryRunAddTuneTOC(pdf,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageMap,theTunebookSortedTOCTitle,true,TunebookABCSortedIncipitsRequested);

		}

		// Get the number of pages added by the TOC operations
		theTOCDelta = theCurrentPageNumber - theDelta;

		// Restore the working page number
		theCurrentPageNumber = theDelta;

		// If a title page is present, increment the start pages and tune page offset
		if (TunebookTPRequested){
			theTOCStart++;
			theTOCSortedStart++;
			theTOCDelta++;
		}	

		// Did they request a tune TOC?
		if (TunebookTOCRequested){
			
			document.getElementById("statustunecount").innerHTML = "Adding Table of Contents";
			
			AppendTuneTOC(pdf,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageMap,theTunebookTOCTitle, TunebookABCSortedIncipitsRequested,TunebookABCSortedIncipitsRequested,gIncludePageLinks,theTOCDelta,theTOCStart);

			document.getElementById("statustunecount").innerHTML = "Table of Contents Added!";
			
			document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";
			
		}

		// Did they request a sorted tune TOC?
		if (TunebookSortedTOCRequested){
			
			document.getElementById("statustunecount").innerHTML = "Adding Sorted Table of Contents";
			
			AppendTuneTOC(pdf,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageMap,theTunebookSortedTOCTitle, true, TunebookABCSortedIncipitsRequested,gIncludePageLinks,theTOCDelta,theTOCSortedStart);

			document.getElementById("statustunecount").innerHTML = "Sorted Table of Contents Added!";
			
			document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";
			
		}

		// Did they request a tunebook title page?
		if (TunebookTPRequested){
			
			document.getElementById("statustunecount").innerHTML = "Adding Title Page";
			
			AppendTuneTitlePage(pdf,paperStyle,theTunebookTP,theTunebookTPST);

			document.getElementById("statustunecount").innerHTML = "Title Page Added!";
			
			document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";
			
		}

		// How many pages were added before the tunes?
		theDelta = theCurrentPageNumber - theDelta;

		if (TunebookTPRequested){
			theDelta++;
		}

		if (TunebookTOCRequested || TunebookSortedTOCRequested){
			theDelta = theTOCDelta;
		}

		// Add all the headers and footers at once
		PostProcessHeadersAndFooters(pdf,addPageNumbers,theDelta+1,totalPages,pageNumberLocation,hideFirstPageNumber,paperStyle);

		// Did they request a tunebook index?
		if (TunebookIndexRequested){
			
			document.getElementById("statustunecount").innerHTML = "Adding Tunebook Index";

			AppendTunebookIndex(pdf,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageMap,theTunebookIndexTitle,TunebookABCSortedIncipitsRequested,TunebookABCSortedIncipitsRequested,gIncludePageLinks, theDelta);

			document.getElementById("statustunecount").innerHTML = "Tunebook Index Added!";
			
			document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";
			
		}

		// Did they request a sorted tunebook index?
		if (TunebookSortedIndexRequested){
			
			document.getElementById("statustunecount").innerHTML = "Adding Tunebook Sorted Index";

			AppendTunebookIndex(pdf,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageMap,theTunebookSortedIndexTitle,true,TunebookABCSortedIncipitsRequested,gIncludePageLinks,theDelta);

			document.getElementById("statustunecount").innerHTML = "Tunebook Sorted Index Added!";
			
			document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";
			
		}

		// Add any link back requested to the index or TOC
		var addTOCLinks = false;
		var theTOCLinkPage = 1;
		var addIndexLinks = false;
		var theIndexLinkPage = 1;
		var startPage = theTOCDelta+1;
		var endPage = theTOCDelta + totalPages;

		if (gAddTOCLinkback&& (TunebookTOCRequested || TunebookSortedTOCRequested)){
			addTOCLinks = true;
			if (TunebookTPRequested){
				theTOCLinkPage = 2;
			}
		}

		if (gAddIndexLinkback&& (TunebookIndexRequested || TunebookSortedIndexRequested)){
			addIndexLinks = true;
			theIndexLinkPage = totalPages + theTOCDelta + 1;
		}

		if (addTOCLinks || addIndexLinks){
			PostProcessTOCAndIndexLinks(pdf,startPage,endPage,addTOCLinks,theTOCLinkPage,addIndexLinks,theIndexLinkPage);
		}
		
		// Did they request a QR code?
		if (gQRCodeRequested){

			document.getElementById("statustunecount").innerHTML = "Adding QR Code";

			// This needs the callback because the rasterizer is async
			AppendQRCode(pdf,paperStyle,qrcode_callback);

			function qrcode_callback(status){

				if (!status){

					document.getElementById("statustunecount").innerHTML = "Share URL too long for QR Code, try sharing fewer tunes";

				}
				else{

					theCurrentPageNumber++;

					document.getElementById("statustunecount").innerHTML = "QR Code Added!";
					
					document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";

				}

				// If the QR code generation failed, leave more time for a status update
				var statusDelay = 1000;

				if (!status){

					statusDelay = 4000;
				}

				// Delay for final QR code UI status update
				setTimeout(function(){
				
					// Handle the status display for the new page
					document.getElementById("statustunecount").innerHTML = "&nbsp;";

					// And complete the PDF
					finalize_pdf_export();

				},statusDelay);

				return;

			}
		}	
		else{

			// No QR code requested, just run the callback directly
			finalize_pdf_export();
			
			return;

		}

		//
		// Finalize the PDF document
		//
		function finalize_pdf_export(){				

			document.getElementById("statuspdfname").innerHTML = "<font color=\"darkgreen\">Rendering Complete!</font>";

				setTimeout(function(){

				document.getElementById("statuspdfname").innerHTML = "Saving <font color=\"blue\">" + title + "</font>";

				// Save the status up for a bit before saving
				setTimeout(function(){

					// Start the PDF save
					// On mobile, have to use a different save strategy otherwise the PDF loads in the same tab
					if (isMobileBrowser()){

						var theBlob = pdf.output('blob', { filename: (title) });
					 	
					 	var newBlob = new Blob([theBlob], { type: 'application/octet-stream' });

						var a = document.createElement("a");

				        document.body.appendChild(a);
				        
				        a.style = "display: none";

				        url = window.URL.createObjectURL(newBlob);
				        a.href = url;
				        a.download = (title);
				        a.click();

				        document.body.removeChild(a);

				        setTimeout(function() {
				          window.URL.revokeObjectURL(url);
				        }, 1000);

					}
					else{

						// This works fine on all desktop browsers
					 	pdf.save(title);
				 	}


					document.getElementById("statuspdfname").innerHTML = "&nbsp;";

					document.getElementById("statustunecount").innerHTML = "&nbsp;";

					document.getElementById("pagestatustext").innerHTML = "&nbsp;";

					// Hide the PDF status modal
					var pdfstatus = document.getElementById("pdf-controls");
					pdfstatus.style.display = "none";

					// Clear the PDF rendering global
					gRenderingPDF = false;

				},1500);

			},2000);
		};

	},250);
}


//
// Export a PDF document with notation, either full or first line incipits
//
function ExportNotationPDF(title) {

	// Clear the cancel flag
	gPDFCancelRequested = false;

	// Cache the tab selected for adaptive rendering delay
	gPDFTabselected = GetRadioValue("notenodertab");

	// Show the PDF status modal
	var pdfstatus = document.getElementById("pdf-controls");
	pdfstatus.style.display = "block";

	// Get the page format
	var elem = document.getElementById("pdfformat");

	var thePageOptions = elem.options[elem.selectedIndex].value;

	// Page number location
	elem = document.getElementById("pagenumbers");

	var pageNumberLocation = elem.options[elem.selectedIndex].value;

	var doSinglePage = ((thePageOptions == "one") || (thePageOptions == "one_a4"));

	// Add page numbers?
	var addPageNumbers = (pageNumberLocation != "none");

	// What size paper? Letter or A4?
	var paperStyle = "letter";

	if ((thePageOptions == "one_a4") || (thePageOptions == "multi_a4") || (thePageOptions == "incipits_a4")){

		paperStyle = "a4";

	}

	var incipitsRequested = ((thePageOptions == "incipits") || (thePageOptions == "incipits_a4"));

	// Hide page numbers on page 1?
	var hideFirstPageNumber = false;

	elem = document.getElementById("firstpage");

	var firstPageNumbers = elem.options[elem.selectedIndex].value;

	if (firstPageNumbers == "no"){

		hideFirstPageNumber = true;

	}

	// Process comment-based PDF commands
	ParseCommentCommands(gTheABC.value);

	// Clear the render time
	theRenderTime = "";

	// Cache the tune titles
	theHeaderFooterTuneNames = GetAllTuneTitles();

	// Init the shared globals
	theCurrentPageNumber = 1;

	tunesProcessed = 0;

	// Init two column incipit layout
	column_number = 0;

	// Init the page map
	theTunePageMap = [];

	// Count the tunes
	totalTunes = CountTunes();

	isFirstPage = true;

	// Setup function scope shared vars
	var nBlocksProcessed = 0;

	var pageBreakList = [];

	var theBlocks = null;

	var nBlocks = 0;

	var theBlock = null;

	// If doing incipits, force a render with striped annotations and text
	// If the annotations or text aren't already stripped, render them stripped
	var requirePostRender = false;

	// Track tune hyperlinks
	gTuneHyperlinks = [];

	// Restore the default between-tune layout spacing
	BETWEENTUNESPACE = gBetweenTuneSpace;

	if (incipitsRequested){

		// Unless overridden, reduce the space between tunes for single column note incipits
		if ((gIncipitsColumns == 1) && (!gGotBetweenTuneSpace)){

			BETWEENTUNESPACE = 0;	
		}

		// Force an idle on the advanced controls to determine if we need to hide the annotations or text annotations before incipit render
		IdleAdvancedControls(false);

		// Are we showing tablature?
		IdleAllowShowTabNames();

		// Is annotation suppressed allowed, but not enabled, or is text annotation suppression allowed but not enabled, do a render
		// If tabnames are being shown, hide them
		if ((gAllowFilterAnnotations && (!gStripAnnotations)) || (gAllowFilterText && (!gStripTextAnnotations)) || (gAllowShowTabNames && (gShowTabNames))){

			document.getElementById("statuspdfname").innerHTML = "Generating <font color=\"blue\">" + title + "</font>";

			document.getElementById("statustunecount").innerHTML = "Processing incipits for PDF generation";

			document.getElementById("pagestatustext").innerHTML = "&nbsp;";

			// Need to provide time for the UI to update
			setTimeout(function(){

				var saveStripAnnotations = gStripAnnotations;
				gStripAnnotations = true;

				var saveStripTextAnnotations = gStripTextAnnotations;
				gStripTextAnnotations = true;

				var saveShowTabNames = gShowTabNames;
				if (gAllowShowTabNames){
					gShowTabNames = false;
				}
				
				// Force a full render 
				Render(true,null);

				// Restore the advanced controls flags
				gStripAnnotations = saveStripAnnotations;

				gStripTextAnnotations = saveStripTextAnnotations;

				if (gAllowShowTabNames){
					gShowTabNames = saveShowTabNames;
				}

				// Going to need to clean up later
				requirePostRender = true;

				doPDFStepTwo();

			},100);
		}
		else{

			doPDFStepTwo();
		}

	}
	else{

		doPDFStepTwo();

	}

	function doPDFStepTwo(){

		running_height = PAGETOPOFFSET;

		qualitaet = 1200; 

		document.getElementById("statuspdfname").innerHTML = "Generating <font color=\"blue\">" + title + "</font>";

		document.getElementById("statustunecount").innerHTML = "Processing notation for PDF generation";

		document.getElementById("pagestatustext").innerHTML = "&nbsp;";

		// Cache the offscreen rendering div
		theOffscreen = document.getElementById("offscreenrender");

		// Rather than do a full render, which should not be needed, 
		// just mark the existing divs for later SVG scraping during PDF rasterization
		PrepareSVGDivsForRasterization();
		
		document.getElementById("statustunecount").innerHTML = "Rendering tune <font color=\"red\">1</font>" + " of  <font color=\"red\">"+totalTunes+"</font>"

		// Save the first tune page number
		theTunePageMap[0] = theCurrentPageNumber;

		// Set the global PDF rendering flag
		gRenderingPDF = true;

		pdf = new jsPDF('p', 'pt', paperStyle);

		// Set the initial PDF display mode
		pdf.setDisplayMode("fullpage","single","UseNone");

		// If not doing single page, find any tunes that have page break requests
		pageBreakList = [];

		if (!doSinglePage){

			// Process any automatic or manual page breaks
			pageBreakList = scanTunesForPageBreaks(pdf,paperStyle,incipitsRequested);

		}

		theBlocks = document.querySelectorAll('div[class="block"]');

		nBlocks = theBlocks.length;

		// Kick off the rendering loop
		theBlock = theBlocks[0];

		// If doing whistle, try async priming the HTML renderer
		// This is to work around the issue where on Safari and mobile Safari, we often are missing the first line of whistle tab
		// the first time the notation is rasterized

		if (gPDFTabselected == "whistle") {

			PrimeWhistleRender(theBlocks,Rasterize);

		}
		else{

			Rasterize();

		}
	}

	function Rasterize(){

		setTimeout(function() {

			// Render and stamp one block
			RenderPDFBlock(theBlock, 0, doSinglePage, pageBreakList, addPageNumbers, pageNumberLocation, hideFirstPageNumber, paperStyle, incipitsRequested, callback);

			function callback() {

				//console.log("nBlocksProcessed = "+nBlocksProcessed);

				// Was a cancel requested?
				if (gPDFCancelRequested){

					gRenderingPDF = false;

					// Clean up a bit
					pdf = null;
					theBlocks = null;

					// Did incipit generation require a re-render?
					if (requirePostRender){
						
						document.getElementById("statuspdfname").innerHTML = "<font color=\"red\">Cleaning up incipit generation</font>";
						
						RenderAsync(true,null,function(){

							// Hide the PDF status modal
							var pdfstatus = document.getElementById("pdf-controls");
							pdfstatus.style.display = "none";

							// Clear the offscreen rendering div
							document.getElementById("offscreenrender").innerHTML = ""; 

						});


					}
					else{

						// Hide the PDF status modal
						var pdfstatus = document.getElementById("pdf-controls");
						pdfstatus.style.display = "none";

						// Just clean up the div IDs and classes
						RestoreSVGDivsAfterRasterization();

					}

					// Exit early
					return;

				}

				nBlocksProcessed++;

				if (nBlocksProcessed == nBlocks) {

					var totalPages = theCurrentPageNumber;

					if (TunebookTPRequested){

						// Add a new page
						pdf.addPage(paperStyle);
						theCurrentPageNumber++;

						pdf.movePage(theCurrentPageNumber,1);

					} 


					var theDelta = theCurrentPageNumber;
					var theTOCStart = 1;
					var theTOCSortedStart = 1;

					if (TunebookTOCRequested){

						DryRunAddTuneTOC(pdf,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageMap,theTunebookTOCTitle,false,false);

					}

					theTOCSortedStart = theCurrentPageNumber-theDelta;
					theTOCSortedStart++;

					if (TunebookSortedTOCRequested){

						DryRunAddTuneTOC(pdf,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageMap,theTunebookSortedTOCTitle,true,false);

					}

					// Get the number of pages added by the TOC operations
					theTOCDelta = theCurrentPageNumber - theDelta;

					// Restore the working page number
					theCurrentPageNumber = theDelta;

					// If a title page is present, increment the start pages and tune page offset
					if (TunebookTPRequested){
						theTOCStart++;
						theTOCSortedStart++;
						theTOCDelta++;
					}	

					// Did they request a tune TOC?
					if (TunebookTOCRequested){
						
						document.getElementById("statustunecount").innerHTML = "Adding Table of Contents";
						
						AppendTuneTOC(pdf,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageMap,theTunebookTOCTitle,false,false,gIncludePageLinks,theTOCDelta,theTOCStart);

						document.getElementById("statustunecount").innerHTML = "Table of Contents Added!";
						
						document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";
						
					}

					// Did they request a sorted tune TOC?
					if (TunebookSortedTOCRequested){
						
						document.getElementById("statustunecount").innerHTML = "Adding Sorted Table of Contents";
						
						AppendTuneTOC(pdf,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageMap,theTunebookSortedTOCTitle,true,false,gIncludePageLinks,theTOCDelta,theTOCSortedStart);

						document.getElementById("statustunecount").innerHTML = "Sorted Table of Contents Added!";
						
						document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";

					}

					// Did they request a tunebook title page?
					if (TunebookTPRequested){
						
						document.getElementById("statustunecount").innerHTML = "Adding Title Page";
						
						AppendTuneTitlePage(pdf,paperStyle,theTunebookTP,theTunebookTPST);

						document.getElementById("statustunecount").innerHTML = "Title Page Added!";
						
						document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";
						
					}

					// How many pages were added before the tunes?
					theDelta = theCurrentPageNumber - theDelta;

					if (TunebookTPRequested){
						theDelta++;
					}

					if (TunebookTOCRequested || TunebookSortedTOCRequested){
						theDelta = theTOCDelta;
					}

					// Add all the headers and footers at once
					PostProcessHeadersAndFooters(pdf,addPageNumbers,theDelta+1,totalPages,pageNumberLocation,hideFirstPageNumber,paperStyle);


					// Did they request a tunebook index?
					if (TunebookIndexRequested){
						
						document.getElementById("statustunecount").innerHTML = "Adding Tunebook Index";

						AppendTunebookIndex(pdf,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageMap,theTunebookIndexTitle,false,false,gIncludePageLinks,theDelta);

						document.getElementById("statustunecount").innerHTML = "Tunebook Index Added!";
						
						document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";
						
					}

					// Did they request a sorted tunebook index?
					if (TunebookSortedIndexRequested){
						
						document.getElementById("statustunecount").innerHTML = "Adding Tunebook Sorted Index";

						AppendTunebookIndex(pdf,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageMap,theTunebookSortedIndexTitle,true,false,gIncludePageLinks,theDelta);

						document.getElementById("statustunecount").innerHTML = "Tunebook Sorted Index Added!";
						
						document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";
						
					}

					// Add any link back requested to the index or TOC
					var addTOCLinks = false;
					var theTOCLinkPage = 1;
					var addIndexLinks = false;
					var theIndexLinkPage = 1;
					var startPage = theTOCDelta+1;
					var endPage = theTOCDelta + totalPages;

					if (gAddTOCLinkback&& (TunebookTOCRequested || TunebookSortedTOCRequested)){
						addTOCLinks = true;
						if (TunebookTPRequested){
							theTOCLinkPage = 2;
						}
					}

					if (gAddIndexLinkback&& (TunebookIndexRequested || TunebookSortedIndexRequested)){
						addIndexLinks = true;
						theIndexLinkPage = totalPages + theTOCDelta + 1;
					}

					if (addTOCLinks || addIndexLinks){
						PostProcessTOCAndIndexLinks(pdf,startPage,endPage,addTOCLinks,theTOCLinkPage,addIndexLinks,theIndexLinkPage);
					}

					if (gTuneHyperlinks.length > 0){
						PostProcessTuneHyperlinks(pdf,gTuneHyperlinks,paperStyle,startPage);						
					}

					// Did they request a QR code?
					if (gQRCodeRequested){

						document.getElementById("statustunecount").innerHTML = "Adding QR Code";

						// This needs the callback because the rasterizer is async
						AppendQRCode(pdf,paperStyle,qrcode_callback);

						function qrcode_callback(status){

							if (!status){

								document.getElementById("statustunecount").innerHTML = "Share URL too long for QR Code, try sharing fewer tunes";

							}
							else{

								theCurrentPageNumber++;

								document.getElementById("statustunecount").innerHTML = "QR Code Added!";
								
								document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";

							}

							// If the QR code generation failed, leave more time for a status update
							var statusDelay = 1000;

							if (!status){

								statusDelay = 4000;
							}

							// Delay for final QR code UI status update
							setTimeout(function(){
							
								// Handle the status display for the new page
								document.getElementById("statustunecount").innerHTML = "&nbsp;";

								// And complete the PDF
								finalize_pdf_export();

							},statusDelay);

							return;

						}
					}	
					else{

						// No QR code requested, just run the callback directly
						finalize_pdf_export();
						
						return;

					}

					//
					// Finalize the PDF document
					//
					function finalize_pdf_export(){				

						document.getElementById("statuspdfname").innerHTML = "<font color=\"darkgreen\">Rendering Complete!</font>";

						setTimeout(function(){

								if (title){

									document.getElementById("statuspdfname").innerHTML = "Saving <font color=\"blue\">" + title + "</font>";

								}

								// Save the status up for a bit before saving
								setTimeout(function(){

									// Start the PDF save
									// On mobile, have to use a different save strategy otherwise the PDF loads in the same tab
									if (isMobileBrowser()){

										var theBlob = pdf.output('blob', { filename: (title) });
									 	
									 	var newBlob = new Blob([theBlob], { type: 'application/octet-stream' });

										var a = document.createElement("a");
	        
								        document.body.appendChild(a);
								        
								        a.style = "display: none";

								        url = window.URL.createObjectURL(newBlob);
								        a.href = url;
								        a.download = (title);
								        a.click();

								        document.body.removeChild(a);

								        setTimeout(function() {
								          window.URL.revokeObjectURL(url);
								        }, 1000);

									}
									else{

										// This works fine on all desktop browsers
									 	pdf.save(title);
								 	}


									// Did incipit generation require a re-render?
									if (requirePostRender){

										document.getElementById("statuspdfname").innerHTML = "<font color=\"red\">Cleaning up after incipit generation</font>";

										// Need some time for UI update
										setTimeout(function(){

											gRenderingPDF = false;

											Render(true,null);

											// Clear the offscreen rendering div
											document.getElementById("offscreenrender").innerHTML = ""; 

											finalize_pdf_export_stage_2();

										},100);
										
									}
									else{

										// Catch up on any UI changes during the PDF rendering
										RestoreSVGDivsAfterRasterization();

										finalize_pdf_export_stage_2();

										gRenderingPDF = false;

									}


									function finalize_pdf_export_stage_2(){

										document.getElementById("statuspdfname").innerHTML = "&nbsp;";

										document.getElementById("statustunecount").innerHTML = "&nbsp;";

										document.getElementById("pagestatustext").innerHTML = "&nbsp;";

										// Hide the PDF status modal
										var pdfstatus = document.getElementById("pdf-controls");
										pdfstatus.style.display = "none";

										// Were there any injected URLs that exceeded the Acrobat max?
										if (gAcrobatURLLimitExceeded.length > 0){

											ShowAcrobatURLSizeWarningDialog();

										}

									}

									return;

								},1500);

						},2000);
					}

				} else {

					// Sanity check the block index
					if (nBlocksProcessed > theBlocks.length){

						return;

					}

					// Early release of the last block
					if (nBlocksProcessed > 0){
						
						theBlocks[nBlocksProcessed-1] = null;

					}

					theBlock = theBlocks[nBlocksProcessed];


					// Sanity check the block
					if (theBlock){

						RenderPDFBlock(theBlock, nBlocksProcessed, doSinglePage, pageBreakList, addPageNumbers, pageNumberLocation, hideFirstPageNumber, paperStyle, incipitsRequested, callback);

					}

				}

			}

		}, 250);
	}
}

//
// Cancel a PDF export
//
function CancelPDF(){
	
	gPDFCancelRequested = true;

}

function getNextSiblings(el, filter) {
	var siblings = [];
	while (el = el.nextSibling) {
		if (!filter || filter(el)) siblings.push(el);
	}
	return siblings;
}

function getStyleProp(elem, prop) {
	if (window.getComputedStyle)
		return window.getComputedStyle(elem, null).getPropertyValue(prop);
	else if (elem.currentStyle) return elem.currentStyle[prop]; //IE
}

function GetABCJSParams(instrument){

	var postfix = "";

	var theLabel = "";

	// Let's add some capo information to the stringed instrument tab
	if (instrument){

		if (gShowTabNames){

			if (gCapo > 0){
				postfix = " (Capo " + gCapo + ")";
			}

			switch (instrument){

				case "noten":
					break;

				case "notenames":
					theLabel = " ";
					break;

				case "whistle":
					theLabel = " ";
					break;

				case "mandolin":
					theLabel = 'Mandolin'+postfix;
					break;

				case "gdad":
					theLabel = 'GDAD'+postfix;
					break;

				case "mandola":
					theLabel = 'CGDA'+postfix;
					break;

				case "guitare":
					theLabel = "Guitar"+postfix;
					break;

				case "guitard":
					theLabel = "DADGAD"+postfix;
					break;

				case "bass":
					theLabel = "Bass"+postfix;
					break;

			}
		}
	}

	var commonFontFormat = gRenderingFonts;

	var params;

	// Normally, have abcjs draw tab icon for tablatures
	gDrawTabSymbol = true;

	if (!instrument) {
		params = {
			responsive: 'resize',
			oneSvgPerLine: 'true',
			selectTypes: false,
			format: commonFontFormat
		};
		instrument = ""; 
	} else if (instrument == "noten"){
		params = {
			responsive: 'resize',
			oneSvgPerLine: 'true',
			selectTypes: false,
			format: commonFontFormat
		};
	}
	else if (instrument == "mandolin") {
		params = {
			tablature: [{
				instrument: 'violin',
				label: theLabel,
				tuning: ['G,', 'D', 'A', 'e'],
				highestNote: "f'",
				capo: gCapo
			}],
			responsive: 'resize',
			oneSvgPerLine: 'true',
			selectTypes: false,
			format: commonFontFormat
		}
	} else if (instrument == "gdad") {
		params = {
			tablature: [{
				instrument: 'violin',
				label: theLabel,
				tuning: ['G,', 'D', 'A', 'd'],
				highestNote: "f'",
				capo: gCapo
			}],
			responsive: 'resize',
			oneSvgPerLine: 'true',
			selectTypes: false,
			format: commonFontFormat
		}	
	} else if (instrument == "mandola") {
		params = {
			tablature: [{
				instrument: 'violin',
				label: theLabel,
				tuning: ['C', 'G', 'd', 'a'],
				highestNote: "f'",
				capo: gCapo
			}],
			responsive: 'resize',
			oneSvgPerLine: 'true',
			selectTypes: false,
			format: commonFontFormat
		}		
	} else if (instrument == "guitare") {
		params = {
			tablature: [{
				instrument: 'guitar',
				label: theLabel,
				tuning: ['E,', 'A,', 'D', 'G', 'B', 'e'],
				highestNote: "f'",
				capo: gCapo
			}],
			responsive: 'resize',
			oneSvgPerLine: 'true',
			selectTypes: false,
			format: commonFontFormat
		}
	} else if (instrument == "guitard") {
		params = {
			tablature: [{
				instrument: 'guitar',
				label: theLabel,
				tuning: ['D,', 'A,', 'D', 'G', 'A', 'd'],
				highestNote: "f'",
				capo: gCapo
			}],
			responsive: 'resize',
			oneSvgPerLine: 'true',
			selectTypes: false,
			format: commonFontFormat
		}
	} else if (instrument == "bass") {
		params = {
			tablature: [{
				instrument: 'violin',
				label: theLabel,
				tuning: ['E', 'A', 'd', 'g'],
				highestNote: "f'",
				capo: gCapo
			}],
			responsive: 'resize',
			oneSvgPerLine: 'true',
			selectTypes: false,
			format: commonFontFormat
		}
	} else if (instrument == "notenames") {
		// Suppress the tab icon
		gDrawTabSymbol = false;
		params = {
			tablature: [{
				instrument: 'violin',
				label: theLabel,
				tuning: ['G,,,','G,,','G,'],
				highestNote: "b'"
			}],
			responsive: 'resize',
			oneSvgPerLine: 'true',
			selectTypes: false,
			format: commonFontFormat
		}
	} else if (instrument == "whistle") {
		// Suppress the tab icon
		gDrawTabSymbol = false;
		params = {
			tablature: [{
				instrument: 'violin',
				label: theLabel,
				tuning: ['G,'],
				highestNote: "^a'"
			}],
			responsive: 'resize',
			oneSvgPerLine: 'true',
			selectTypes: false,
			format: commonFontFormat
		}

	}

	return params;

}

//
// Update local storage
//
function UpdateLocalStorage(){

	// 
	// Centralized place to save local browser storage values
	//
	if (gLocalStorageAvailable){

		var format = GetRadioValue("notenodertab");
		localStorage.abcTab = format;

		var capo = gCapo;
		localStorage.abcCapo = capo;

		// Don't reset saved staff spacing if from a share
		// Related to issue where shared tune reset the saved staff spacing

		if (!gIsFromShare){
			var ssp = gStaffSpacing - STAFFSPACEOFFSET;
			localStorage.abcStaffSpacing = ssp;
		}

		var pdfformat = document.getElementById("pdfformat").value;
		localStorage.abcTunesPerPage = pdfformat;

		var pagenumbers = document.getElementById("pagenumbers").value;
		localStorage.abcPageNumberLocation = pagenumbers;

		var firstpage = document.getElementById("firstpage").value;
		localStorage.abcPageNumberOnPageOne = firstpage;

		var topbar = gTopBarShowing;
		if (!topbar){
			localStorage.abcHideTopBar = "true";
		}
		else{
			localStorage.abcHideTopBar = "false";
		}

		var showtabnames = gShowTabNames;
		if (showtabnames){
			localStorage.abcShowTabNames = "true";
		}
		else{
			localStorage.abcShowTabNames = "false";
		}

		// Save the last PDF font and style
		localStorage.PDFFont = gPDFFont;
		localStorage.PDFFontStyle = gPDFFontStyle;
	}

}

//
// Save PDF settings change
//
function SavePDFSettings(){

	// If available, save all the app settings to local storage
	UpdateLocalStorage();

}

//
// Setup the notation divs for PDF rasterization
// Each div is marked with the "block" class and incrementing block ids of the form block_<tuneindex>_<blockindex>
//
function PrepareSVGDivsForRasterization(){

	// Clear the offscreen rendering div
	document.getElementById("offscreenrender").innerHTML = ""; 

	var nTunes = CountTunes();
		
	for (var i = 0; i < nTunes; ++i) {
		
		var renderDivID = "notation" + i;

		var svgDivs = document.querySelectorAll('div[id="' + renderDivID + '"] > div');

		var nSVGs = svgDivs.length;

		var j;

		var elem;

		for (j=0;j<nSVGs;++j){

			elem = svgDivs.item(j);

			// Add the "block" class
			elem.classList.add("block");

			// Add the incrementing block ID (used to find the start of tunes)
			elem.id = "block_" + i + "_" + j;

		}
	}

}

//
// Clean up the SVG div tagging after rasterization
// Each div is marked with the "block" class and incrementing block ids of the form block_<tuneindex>_<blockindex>
//
function RestoreSVGDivsAfterRasterization(){

	// Clear the offscreen rendering div
	document.getElementById("offscreenrender").innerHTML = ""; 

	var nTunes = CountTunes();
		
	for (var i = 0; i < nTunes; ++i) {
		
		var renderDivID = "notation" + i;

		var svgDivs = document.querySelectorAll('div[id="' + renderDivID + '"] > div');

		var nSVGs = svgDivs.length;

		var j;

		var elem;

		for (j=0;j<nSVGs;++j){

			elem = svgDivs.item(j);

			// Remove the class
			elem.removeAttribute("class");

			// Remove the block SVG id
			elem.removeAttribute("id");

		}
	}

}

//
// Main routine for rendering the notation
//
function RenderTheNotes(tune, instrument, renderAll, tuneNumber) {

	// Used for rendering time measurement
	//var currentTime;

	// Get the rendering params
	var params = GetABCJSParams(instrument);

	// Create the render div ID array
	var renderDivs = [];

	var nTunes = 0;
	var startTune = 0;
	var endTune = 0;

	// If rendering all, push all the divs
	if (renderAll){

		nTunes = CountTunes();
		endTune = nTunes;
		
		for (var i = 0; i < nTunes; ++i) {
			renderDivs.push("notation" + i);
		}
	}
	else{

		// Otherwise, just push the single div
		nTunes = 1;
		startTune = tuneNumber;
		endTune = tuneNumber+1;
		
		// Just rendering one tune
		renderDivs.push("notation" + tuneNumber);

	}

	// If there are no tunes to render, exit early
	if (nTunes == 0){
		return;
	}

	var visualObj = ABCJS.renderAbc(renderDivs, tune, params);

	var svgTextArray = [];

	for (var tuneIndex = startTune; tuneIndex < endTune; ++tuneIndex) {

		var renderDivID = "notation" + tuneIndex;

		// If whistle or note name tab, inject replacement values for tab numbers
		postProcessTab(renderDivID, instrument, false);

	}
}

function SetRadioValue(radioName, value) {
	const theRadioElemSelector = "input[name=\"" + radioName + "\"]";
	const radioButtons = document.querySelectorAll(theRadioElemSelector);

	for (const radioButton of radioButtons) {
		if (radioButton.value == value) {
			radioButton.checked = true;
		} else {
			radioButton.checked = false;
		}
	}
}

function GetRadioValue(radioName) {

	const theRadioElemSelector = "input[name=\"" + radioName + "\"]";
	const radioButtons = document.querySelectorAll(theRadioElemSelector);

	let radiovalue;
	for (const radioButton of radioButtons) {
		if (radioButton.checked) {
			radiovalue = radioButton.value;
			break;
		}
	}

	return radiovalue;
}

//
// Strip all annotations in the ABC
//
function StripAnnotations(){

	var theNotes = gTheABC.value;

	theNotes = StripAnnotationsOne(theNotes);

	// Replace the ABC
	gTheABC.value = theNotes;

	// Set dirty
	gIsDirty = true;

}

//
// Strip all annotations in a specific ABC
//
function StripAnnotationsOne(theNotes){

	// Strip out tempo markings
	var searchRegExp = /^Q:.*[\r\n]*/gm 

	// Strip out tempo markings
	theNotes = theNotes.replace(searchRegExp, "");

	// Strip out Z: annotation
	searchRegExp = /^Z:.*[\r\n]*/gm

	// Strip out Z: annotation
	theNotes = theNotes.replace(searchRegExp, "");

	// Strip out R: annotation
	searchRegExp = /^R:.*[\r\n]*/gm

	// Strip out R: annotation
	theNotes = theNotes.replace(searchRegExp, "");

	// Strip out S: annotation
	searchRegExp = /^S:.*[\r\n]*/gm

	// Strip out S: annotation
	theNotes = theNotes.replace(searchRegExp, "");

	// Strip out N: annotation
	searchRegExp = /^N:.*[\r\n]*/gm

	// Strip out N: annotation
	theNotes = theNotes.replace(searchRegExp, "");

	// Strip out D: annotation
	searchRegExp = /^D:.*[\r\n]*/gm

	// Strip out D: annotation
	theNotes = theNotes.replace(searchRegExp, "");

	// Strip out H: annotation
	searchRegExp = /^H:.*[\r\n]*/gm

	// Strip out H: annotation
	theNotes = theNotes.replace(searchRegExp, "");

	// Strip out B: annotation
	searchRegExp = /^B:.*[\r\n]*/gm

	// Strip out B: annotation
	theNotes = theNotes.replace(searchRegExp, "");

	// Strip out C: annotation
	searchRegExp = /^C:.*[\r\n]*/gm

	// Strip out C: annotation
	theNotes = theNotes.replace(searchRegExp, "");

	// Strip out O: annotation
	searchRegExp = /^O:.*[\r\n]*/gm

	// Strip out O: annotation
	theNotes = theNotes.replace(searchRegExp, "");

	return theNotes
}


//
// Strip all the text annotations in the ABC
//
function StripTextAnnotations(){

	var theNotes = gTheABC.value;

	theNotes = StripTextAnnotationsOne(theNotes);

	// Replace the ABC
	gTheABC.value = theNotes;

	// Set dirty
	gIsDirty = true;


}

//
// Strip all the text annotations in the ABC
//
function StripTextAnnotationsOne(theNotes){

	// Strip out text markings
	var searchRegExp = /%%text.*[\r\n]*/gm

	// Strip out text markings
	theNotes = theNotes.replace(searchRegExp, "");

	// Strip out %%center annotation
	searchRegExp = /%%center.*[\r\n]*/gm

	// Strip out %%center annotation
	theNotes = theNotes.replace(searchRegExp, "");

	return theNotes;

}

// 
// Strip all the chords in the ABC
//
function StripChords(){

	var theNotes = gTheABC.value;

	theNotes = StripChordsOne(theNotes);

	// Replace the ABC
	gTheABC.value = theNotes;

	// Set dirty
	gIsDirty = true;

}

// 
// Strip all the chords in the ABC
//
function StripChordsOne(theNotes){

	function match_callback(match){

		// Don't strip tab annotations, only chords
		if ((match.indexOf('"_') == -1) && (match.indexOf('"^') == -1)){

			// Try and avoid stripping long text strings that aren't chords
			if (match.length > 9){
				return match;
			}
			else
			// If there are spaces in the match, also probably not a chord
			if (match.indexOf(" ") != -1){
				return match;
			}
			else{
				return "";
			}
		}
		else{
			return match;
		}
		
	}

	// Strip out chord markings and not text annotations
	var searchRegExp = /"[^"]*"/gm

	theNotes = theNotes.replace(searchRegExp,match_callback);

	// Replace the ABC
	return theNotes;

}


// 
// Are there chords in a match regex?
//
function AreChordsInMatch(theABC,theMatch){

	if (!theMatch){
		return false;
	}
	
	var nMatch = theMatch.length;

	for (var i=0; i<nMatch; ++i){

		var match = theMatch[i];

		// Detect chords
		if ((match.indexOf('"_') == -1) && (match.indexOf('"^') == -1)){

			// Try and avoid stripping long text strings that aren't chords
			if (match.length > 9){
				continue;
			}
			else
			// If there are spaces in the match, also probably not a chord
			if (match.indexOf(" ") != -1){
				continue;
			}
			else{
				return true;
			}
		}
	}

	return false;

}

// 
// Are there tabs in a match regex?
//
function IsTabInMatch(theABC,theMatch){

	if (!theMatch){
		return false;
	}
	
	var nMatch = theMatch.length;

	for (var i=0; i<nMatch; ++i){

		// Detect tab annotation
		if ((theMatch[i].indexOf('"_') == 0) || (theMatch[i].indexOf('"^') == 0)){

			return true;

		}
	}

	return false;

}

// 
// Strip all the tab in the ABC
//
function StripTab(){

	var theNotes = gTheABC.value;

	theNotes = StripTabOne(theNotes);

	// Replace the ABC
	gTheABC.value = theNotes;

	// Set dirty
	gIsDirty = true;

}

// 
// Strip all the tab in the ABC
//
function StripTabOne(theNotes){

	function match_callback(match){

		// Don't strip chords, only tab
		if ((match.indexOf('"_') == 0) || (match.indexOf('"^') == 0)){
			return "";
		}
		else{
			return match;
		}
		
	}

	// Strip out text annotation and not chords
	var searchRegExp = /"[^"]*"/gm

	theNotes = theNotes.replace(searchRegExp,match_callback);

	// Replace the ABC
	return theNotes;

}

// 
// Strip all the ornaments in the ABC
//
function StripOrnamentsOne(theNotes){

	// Strip out all ornaments
	var searchRegExp = /{[^}]*}/gm

	theNotes = theNotes.replace(searchRegExp,"");

	// Replace the ABC
	return theNotes;

}


// 
// Allow putting up a spiner before the synchronous Render() function
//
function RenderAsync(renderAll,tuneNumber,callback){

	// Don't allow a re-render during PDF generation
	if (gRenderingPDF){
		return;
	}

	//console.log("RenderAsync renderAll = "+renderAll+" tuneNumber = "+tuneNumber);
	
	// Start with spinner hidden
	document.getElementById("loading-bar-spinner").style.display = "none";

	// Show the spinner
	if (renderAll){

		document.getElementById("loading-bar-spinner").style.display = "block";

		// Render after a short delay
		setTimeout(function(){

			Render(renderAll,tuneNumber);

			document.getElementById("loading-bar-spinner").style.display = "none";
			
			// Recalc the top tune position and scroll it into view if required
			MakeTuneVisible(true);

			if (callback && (callback != undefined)){
				callback();
			}


		}, 100);
	}
	else{

		// Immediately render just a single tune
		Render(renderAll,tuneNumber);

		if (callback && (callback != undefined)){
			callback();
		}

	}

}

function Render(renderAll,tuneNumber) {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	// Idle the file status display
	var nTunes = CountTunes();

	if ((gTheABC.value != "") && (nTunes > 0)) {

		var fileSelected = document.getElementById('abc-selected');

		if (nTunes == 1){

			fileSelected.innerText = gDisplayedName + "  (" + nTunes + " Tune)";

		}
		else{

			fileSelected.innerText = gDisplayedName + "  (" + nTunes + " Tunes)";

		}

		// Avoid jump scroll on render
		var scrollTop = window.pageYOffset;

		// If available, save all the app settings to local storage
		UpdateLocalStorage();

		// Hide the notation placeholder
		document.getElementById("notation-placeholder").style.display = "none";

		if (isDesktopBrowser()){
			// Show the notation block
			if (gIsMaximized)
				gTheNotation.style.display = "flex";
			else
				gTheNotation.style.display = "inline";
		}
		else{
			// Show the notation block
			if (gIsMaximized)
				gTheNotation.style.display = "flex";
			else
				gTheNotation.style.display = "block";

		}

		// Hide/Show the zoom control
		if (gDisableEditFromPlayLink){
			HideMaximizeButton();
		}
		else{
			ShowMaximizeButton();
		}

		if (gShowAllControls){

			document.getElementById("notenrechts").style.display = "inline-block";

			// Recalculate the notation top position first time the notation is rendered
			if (gIsFirstRender){
				UpdateNotationTopPosition();
				gIsFirstRender = false;
			}

		}
		else{
			document.getElementById("notenrechts").style.display = "none";
		}

		// Enable the save button
		document.getElementById("saveabcfile").classList.remove("saveabcfiledisabled");
		document.getElementById("saveabcfile").classList.add("saveabcfile");
		gAllowSave = true;

		// Enable the control display toggle
		gAllowControlToggle = true;

		// Enable the PDF generation button
		document.getElementById("saveaspdf").classList.remove("saveaspdfdisabled");
		document.getElementById("saveaspdf").classList.add("saveaspdf");
		gAllowPDF = true;

		// Enable the copy button
		document.getElementById("copybutton").classList.remove("copybuttondisabled");
		document.getElementById("copybutton").classList.add("copybutton");

		// Enable the play button
		document.getElementById("playbutton").classList.remove("playbuttondisabled");
		document.getElementById("playbutton").classList.add("playbutton");

		// Enable the trainer button
		document.getElementById("trainerbutton").classList.remove("trainerbuttondisabled");
		document.getElementById("trainerbutton").classList.add("trainerbutton");

		gAllowCopy = true;

		var radiovalue = GetRadioValue("notenodertab");

		var theNotes;

		// Generate the rendering divs
		// Only required if rendering all the tunes, otherwise will re-use an existing div
		if (renderAll){
			GenerateRenderingDivs(nTunes);
			theNotes = gTheABC.value;
		}
		else{

			// Just get the ABC for the current tune
			theNotes = getTuneByIndex(tuneNumber);
		}


		var searchRegExp = "";

		if (gStripAnnotations) {

			// Strip out tempo markings
			searchRegExp = /^Q:.*$/gm

			// Strip out tempo markings
			theNotes = theNotes.replace(searchRegExp, "% comment");

			// Strip out Z: annotation
			searchRegExp = /^Z:.*$/gm

			// Strip out Z: annotation
			theNotes = theNotes.replace(searchRegExp, "% comment");

			// Strip out R: annotation
			searchRegExp = /^R:.*$/gm

			// Strip out R: annotation
			theNotes = theNotes.replace(searchRegExp, "% comment");

			// Strip out S: annotation
			searchRegExp = /^S:.*$/gm

			// Strip out S: annotation
			theNotes = theNotes.replace(searchRegExp, "% comment");

			// Strip out N: annotation
			searchRegExp = /^N:.*$/gm

			// Strip out N: annotation
			theNotes = theNotes.replace(searchRegExp, "% comment");

			// Strip out D: annotation
			searchRegExp = /^D:.*$/gm

			// Strip out D: annotation
			theNotes = theNotes.replace(searchRegExp, "% comment");

			// Strip out H: annotation
			searchRegExp = /^H:.*$/gm

			// Strip out H: annotation
			theNotes = theNotes.replace(searchRegExp, "% comment");

			// Strip out B: annotation
			searchRegExp = /^B:.*$/gm

			// Strip out B: annotation
			theNotes = theNotes.replace(searchRegExp, "% comment");

			// Strip out C: annotation
			searchRegExp = /^C:.*$/gm

			// Strip out C: annotation
			theNotes = theNotes.replace(searchRegExp, "% comment");

			// Strip out O: annotation
			searchRegExp = /^O:.*$/gm

			// Strip out O: annotation
			theNotes = theNotes.replace(searchRegExp, "% comment");

		}

		if (gStripTextAnnotations) {

			// Strip out text markings
			searchRegExp = /%%text.*$/gm

			// Strip out text markings
			theNotes = theNotes.replace(searchRegExp, "% comment");

			// Strip out %%center annotation
			searchRegExp = /%%center.*$/gm

			// Strip out %%center annotation
			theNotes = theNotes.replace(searchRegExp, "% comment");

		}

		if (gStripChords) {

			// Strip out chord markings
			theNotes = StripChordsOne(theNotes)
		}

		if (gStripTab) {

			// Strip out tab markings
			theNotes = StripTabOne(theNotes);
		}

		// Replace standalone %%center directives with %%vskip 12
		searchRegExp = /%%center$/gm;

		theNotes = theNotes.replace(searchRegExp, "%%vskip 12\n%%center");

		// Add some title and staffspace
		//theNotes = theNotes + "\n%%musicspace 20\n";
		// theNotes = theNotes + "%%staffsep "+gStaffSpacing+"\n";

		// Inject %%staffsep 
		searchRegExp = /^X:.*$/gm

		theNotes = theNotes.replace(searchRegExp, "X:1\n%%musicspace 10\n%%staffsep " + gStaffSpacing);

		// Render the notes
		RenderTheNotes(theNotes,radiovalue,renderAll,tuneNumber);

		// Maintain scroll position after render
		window.scrollTo(0, scrollTop);

	} else {

		// Hide all the buttons and notation
		document.getElementById("notenrechts").style.display = "none";
		gTheNotation.style.display = "none";

		// Disable the save button
		document.getElementById("saveabcfile").classList.remove("saveabcfile");
		document.getElementById("saveabcfile").classList.add("saveabcfiledisabled");
		gAllowSave = false;

		// Disable the generate PDF button
		document.getElementById("saveaspdf").classList.remove("saveaspdf");
		document.getElementById("saveaspdf").classList.add("saveaspdfdisabled");
		gAllowPDF = false;

		// Disable the control display toggle
		gAllowControlToggle = false;

		// Disable the copy button
		document.getElementById("copybutton").classList.remove("copybutton");
		document.getElementById("copybutton").classList.add("copybuttondisabled");

		// Disable the play button
		document.getElementById("playbutton").classList.remove("playbutton");
		document.getElementById("playbutton").classList.add("playbuttondisabled");

		// Disable the trainer button
		document.getElementById("trainerbutton").classList.remove("trainerbutton");
		document.getElementById("trainerbutton").classList.add("trainerbuttondisabled");

		gAllowCopy = false;

		// Show the notation placeholder
		document.getElementById("notation-placeholder").style.display = "block";

		// Hide the zoom control
		document.getElementById("zoombutton").style.display = "none";

		// Hide the spinner
		document.getElementById("loading-bar-spinner").style.display = "none";

		var fileSelected = document.getElementById('abc-selected');

		fileSelected.innerText = "No ABC file selected";

		gDisplayedName = "No ABC file selected";

		gABCFromFile = false;

		gIsFirstRender = true;

		// Recalculate the notation top position
		UpdateNotationTopPosition();

	}

}

//
// Check that the user has selected a .abc file to render
//
function ensureABCFile(filename) {

	var fileExtension = "";

	if (filename.lastIndexOf(".") > 0) {
		fileExtension = filename.substring(filename.lastIndexOf(".") + 1, filename.length);
	}

	if ((fileExtension.toLowerCase() == "abc") || (fileExtension.toLowerCase() == "txt") || (fileExtension.toLowerCase() == "xml") || (fileExtension.toLowerCase() == "musicxml") || (fileExtension.toLowerCase() == "mxl")){
		return true;
	} else {
		var thePrompt = "Sorry, only .abc, .txt, .xml, .musicxml, or .mxl files are supported.";
		
		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);

		DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });
		return false;
	}
}

//
// Idle the advanced controls
//
// If bUpdateUI is false, just updates the global filtering options states
// If bUpdateUI is true also idles the UI elements
//
function IdleAdvancedControls(bUpdateUI){

	var theNotes = gTheABC.value;

	var searchRegExp = "";

	var EnableAnnotations = false;
	var EnableText = false;
	var EnableChords = false;

	var gotMatch = false;

	// Detect tempo markings
	searchRegExp = /^Q:.*$/gm

	// Detect tempo markings
	gotMatch = theNotes.search(searchRegExp) != -1;

	if (!gotMatch){

		// Detect Z: annotation
		searchRegExp = /^Z:.*$/gm

		// Detect Z: annotation
		gotMatch = theNotes.search(searchRegExp) != -1;

	}

	if (!gotMatch){

		// Detect R: annotation
		searchRegExp = /^R:.*$/gm

		// Detect R: annotation
		gotMatch = theNotes.search(searchRegExp) != -1;

	}

	if (!gotMatch){

		// Detect S: annotation
		searchRegExp = /^S:.*$/gm

		// Detect S: annotation
		gotMatch = theNotes.search(searchRegExp) != -1;

	}

	if (!gotMatch){

		// Detect N: annotation
		searchRegExp = /^N:.*$/gm

		// Detect N: annotation
		gotMatch = theNotes.search(searchRegExp) != -1;

	}

	if (!gotMatch){

		// Detect D: annotation
		searchRegExp = /^D:.*$/gm

		// Detect D: annotation
		gotMatch = theNotes.search(searchRegExp) != -1;

	}

	if (!gotMatch){

		// Detect H: annotation
		searchRegExp = /^H:.*$/gm

		// Detect H: annotation
		gotMatch = theNotes.search(searchRegExp) != -1;

	}

	if (!gotMatch){

		// Detect B: annotation
		searchRegExp = /^B:.*$/gm

		// Detect B: annotation
		gotMatch = theNotes.search(searchRegExp) != -1;

	}

	if (!gotMatch){

		// Detect C: annotation
		searchRegExp = /^C:.*$/gm

		// Detect C: annotation
		gotMatch = theNotes.search(searchRegExp) != -1;

	}

	if (!gotMatch){

		// Detect O: annotation
		searchRegExp = /^O:.*$/gm

		// Detect O: annotation
		gotMatch = theNotes.search(searchRegExp) != -1;

	}

	EnableAnnotations = gotMatch;

	gotMatch = false;

	// Detect text markings
	searchRegExp = /%%text.*$/gm

	// Detect text markings
	gotMatch = theNotes.search(searchRegExp) != -1;

	if (!gotMatch){

		// Detect %%center annotation
		searchRegExp = /%%center.*$/gm

		// Detect %%center annotation
		gotMatch = theNotes.search(searchRegExp) != -1;

	}

	EnableText = gotMatch;

	gotMatch = false;

	// Detect chord markings
	searchRegExp = /"[^"]*"/gm

	var theMatch = theNotes.match(searchRegExp);

	gotMatch = AreChordsInMatch(theNotes,theMatch);

	EnableChords = gotMatch;

	// Detect tab markings
	searchRegExp = /"[^"]*"/gm

	var theMatch = theNotes.match(searchRegExp);

	// Detect tab markings
	gotMatch = IsTabInMatch(theNotes,theMatch);

	EnableTab = gotMatch;

	// Now set the button styling based on the results
	if (EnableAnnotations){

		gAllowFilterAnnotations = true;

		if (bUpdateUI){

			// Enable the Toggle Annotations button
			document.getElementById("toggleannotations").classList.remove("advancedcontrolsdisabled");
			document.getElementById("toggleannotations").classList.add("advancedcontrols");	

			// Enable the Strip Annotations button
			document.getElementById("stripannotations").classList.remove("advancedcontrolsdisabled");
			document.getElementById("stripannotations").classList.add("advancedcontrols");	

		}
	}
	else{

		gAllowFilterAnnotations = false;

		if (bUpdateUI){

			// Disable the Toggle Annotations button
			document.getElementById("toggleannotations").classList.remove("advancedcontrols");
			document.getElementById("toggleannotations").classList.add("advancedcontrolsdisabled");	

			// Disable the Strip Annotations button
			document.getElementById("stripannotations").classList.remove("advancedcontrols");
			document.getElementById("stripannotations").classList.add("advancedcontrolsdisabled");	

		}			
	}

	if (EnableText){

		gAllowFilterText = true;

		if (bUpdateUI){

			// Enable the Toggle Text button
			document.getElementById("toggletext").classList.remove("advancedcontrolsdisabled");
			document.getElementById("toggletext").classList.add("advancedcontrols");

			// Enable the Strip Text button
			document.getElementById("striptext").classList.remove("advancedcontrolsdisabled");
			document.getElementById("striptext").classList.add("advancedcontrols");

		}	
	}
	else{

		gAllowFilterText = false;
		
		if (bUpdateUI){

			// Disable the Toggle Text button
			document.getElementById("toggletext").classList.remove("advancedcontrols");
			document.getElementById("toggletext").classList.add("advancedcontrolsdisabled");

			// Disable the Strip Text button
			document.getElementById("striptext").classList.remove("advancedcontrols");
			document.getElementById("striptext").classList.add("advancedcontrolsdisabled");
		}				
	}

	if (EnableChords){

		gAllowFilterChords = true;
		
		if (bUpdateUI){

			// Enable the Toggle Chords button
			document.getElementById("togglechords").classList.remove("advancedcontrolsdisabled");
			document.getElementById("togglechords").classList.add("advancedcontrols");

			// Enable the Strip Chords button
			document.getElementById("stripchords").classList.remove("advancedcontrolsdisabled");
			document.getElementById("stripchords").classList.add("advancedcontrols");

		}	
	}
	else{

		gAllowFilterChords = false;

		if (bUpdateUI){

			// Disable the Toggle Chords button
			document.getElementById("togglechords").classList.remove("advancedcontrols");
			document.getElementById("togglechords").classList.add("advancedcontrolsdisabled");

			// Disable the Strip Chords button
			document.getElementById("stripchords").classList.remove("advancedcontrols");
			document.getElementById("stripchords").classList.add("advancedcontrolsdisabled");

		}			
	}

	if (EnableTab){

		gAllowFilterTab = true;
		
		if (bUpdateUI){

			// Enable the Toggle Tab button
			document.getElementById("toggletab").classList.remove("advancedcontrolsdisabled");
			document.getElementById("toggletab").classList.add("advancedcontrols");

			// Enable the Strip Tab button
			document.getElementById("striptab").classList.remove("advancedcontrolsdisabled");
			document.getElementById("striptab").classList.add("advancedcontrols");
		}	
	}
	else{

		gAllowFilterTab = false;

		if (bUpdateUI){

			// Disable the Toggle Tab button
			document.getElementById("toggletab").classList.remove("advancedcontrols");
			document.getElementById("toggletab").classList.add("advancedcontrolsdisabled");

			// Disable the Strip Chords button
			document.getElementById("striptab").classList.remove("advancedcontrols");
			document.getElementById("striptab").classList.add("advancedcontrolsdisabled");

		}			
	}

	if (bUpdateUI){

		// Now idle the button labels based on the global states

		if (gStripAnnotations){

			document.getElementById("toggleannotations").value = "Show Annotations";

		}
		else{

			document.getElementById("toggleannotations").value = "Hide Annotations";

		}

		if (gStripTextAnnotations){

			document.getElementById("toggletext").value = "Show Text";

		}
		else{

			document.getElementById("toggletext").value = "Hide Text";

		}

		if (gStripChords){

			document.getElementById("togglechords").value = "Show Chords";

		}
		else{

			document.getElementById("togglechords").value = "Hide Chords";

		}

		if (gStripTab){

			document.getElementById("toggletab").value = "Show Injected Tab";

		}
		else{

			document.getElementById("toggletab").value = "Hide Injected Tab";

		}

	}

}


//
// Recalculate and update the top position for the music
//
function UpdateNotationTopPosition(){

	// Position the notation block
	var noscroller = document.getElementById("noscroller");

	var noscroller_height = noscroller.offsetHeight; 

	// Position the notation holder under the controls
	var notation_spacer = document.getElementById("notation-spacer");

	notation_spacer.style.height = noscroller_height+"px"; 
}

//
// Set the defaults
//
function RestoreDefaults() {

	// Reset globals
	gStripAnnotations = false;
	gStripTextAnnotations = false;
	gStripChords = false;
	gStripTab = false;
	gTotalTunes = 0;
	gCurrentTune = 0;
	gForceFullRender = false;
	gIsFirstRender = true;

	// Clear the autoscroll state
	gLastAutoScrolledTune = -1;

	// Reset file selectors
	let fileElement = document.getElementById('selectabcfile');

	fileElement.value = "";

	// Clear the QR code
	clearQRCode();

	// Recalculate the notation top position
	UpdateNotationTopPosition();

}

//
// Toggle annotations
//
function ToggleAnnotations(bDoStrip) {

	if (!gAllowFilterAnnotations){

		return;

	}


	// Strips the annotations in the actual ABC and re-renders
	if (bDoStrip){

		StripAnnotations();
		
		RenderAsync(true,null)

		IdleAdvancedControls(true);

		return;
	}

	gStripAnnotations = !gStripAnnotations;

	RenderAsync(true,null)

	IdleAdvancedControls(true);


}

//
// Toggle text
//
function ToggleTextAnnotations(bDoStrip) {

	if (!gAllowFilterText){

		return;

	}

	// Strip the text annotations in the actual ABC and re-renders
	if (bDoStrip){

		StripTextAnnotations();
		
		RenderAsync(true,null);
		
		IdleAdvancedControls(true);

		return;
	}
	
	gStripTextAnnotations = !gStripTextAnnotations;

	RenderAsync(true,null);

	IdleAdvancedControls(true);

}

//
// Toggle chords
//
function ToggleChords(bDoStrip) {

	if (!gAllowFilterChords){

		return;
	
	}

	// Strips the text annotations in the actual ABC and re-renders
	if (bDoStrip){

		StripChords();
		
		RenderAsync(true,null)

		IdleAdvancedControls(true);

		return;
	}


	gStripChords = !gStripChords;

	RenderAsync(true,null)

	IdleAdvancedControls(true);

}

//
// Toggle tab
//
function ToggleTab(bDoStrip) {

	if (!gAllowFilterTab){

		return;
	
	}

	// Strips the text annotations in the actual ABC and re-renders
	if (bDoStrip){

		StripTab();
		
		RenderAsync(true,null)

		IdleAdvancedControls(true);

		return;
	}

	gStripTab = !gStripTab;

	RenderAsync(true,null)

	IdleAdvancedControls(true);

}
//
// Add a new ABC tune template, song template, or PDF tunebook annotation template to the current ABC
//
function idleAddABC(){

	if (gIsIOS){

		document.getElementById("addabcfilebutton").removeAttribute("accept");
	
	}	

	//
	// Setup the file import control
	//
	document.getElementById("addabcfilebutton").onchange = () => {

		let fileElement = document.getElementById("addabcfilebutton");

		// check if user had selected a file
		if (fileElement.files.length === 0) {

			var thePrompt = "Please select an ABC or MusicXML file";
			
			// Center the string in the prompt
			thePrompt = makeCenteredPromptString(thePrompt);

			DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

			return;

		}

		let file = fileElement.files[0];

		// Read the file and append it to the editor
		DoFileRead(file, true);

		// Reset file selectors
		fileElement.value = "";

	}

	// Show the snapshot button if one is available in browser storage
	var elem1 = document.getElementById("dialogrestorebutton");

	elem1.style.display="none";

	var elem2 = document.getElementById("dialogrestoreautobutton");

	elem2.style.display="none";

	if (gLocalStorageAvailable){

		var theSnapshot = localStorage.SavedSnapshot;

		var bTheSnapShotAvailable = ((theSnapshot) && (theSnapshot != ""));

		var theLastAutoSnapShot = localStorage.LastAutoSnapShot;

		var bTheLastAutoSnapShotAvailable = ((theLastAutoSnapShot) && (theLastAutoSnapShot != ""));

		if (bTheSnapShotAvailable){

			elem1.style.display="inline";

		}

		if (bTheLastAutoSnapShotAvailable){

			elem2.style.display="inline";

		}

	}

}

//
// PDF Tunebook builder
//

//
// PDF Tunebook features
//
var gPDFTunebookConfig ={

 	// PDF Quality
	pdfquality: 0.75,

	// Space between tunes
	pdf_between_tune_space: 20,

	// Title
	addtitle: "Tunebook Title",

	// Subtitle
	addsubtitle: "Tunebook Subtitle",

	// TOC Title
	addtoc: "Table of Contents",

	// Index Title
	addindex: "Index",

	// Page Header
	pageheader: "This is the Page Header",

	// Page Footer
	pagefooter: "This is the Page Footer",

	// Add playback links?
	bAdd_add_all_playback_links: true,

	// Inject instruments?
	bInjectInstruments: true,

	// Sound font
	sound_font: "fluid",

	// Melody Instrument
	melody_instrument: 1,

	// Bass/Chord Instrument
	chord_instrument: 1,

	// QR Code?
	bAdd_QRCode: true,

	// Link override
	qrcode_link: "https://michaeleskin.com/abc",

	// Caption
	caption_for_qrcode: "Created using Michael Eskin's ABC Transcription Tools",
}

// Reset the PDF tunebook config to defaults
function resetPDFTunebookConfig(){

	gPDFTunebookConfig ={

	 	// PDF Quality
		pdfquality: 0.75,

		// Space between tunes
		pdf_between_tune_space: 20,

		// Title
		addtitle: "Tunebook Title",

		// Subtitle
		addsubtitle: "Tunebook Subtitle",

		// TOC Title
		addtoc: "Table of Contents",

		// Index Title
		addindex: "Index",

		// Page Header
		pageheader: "This is the Page Header",

		// Page Footer
		pagefooter: "This is the Page Footer",

		// Add playback links?
		bAdd_add_all_playback_links: true,

		// Inject instruments?
		bInjectInstruments: true,

		// Sound font
		sound_font: "fluid",

		// Melody Instrument
		melody_instrument: 1,

		// Bass/Chord Instrument
		chord_instrument: 1,

		// QR Code?
		bAdd_QRCode: true,

		// Link override
		qrcode_link: "https://michaeleskin.com/abc",

		// Caption
		caption_for_qrcode: "Created using Michael Eskin's ABC Transcription Tools",
	}
}

function idlePDFTunebookBuilder(){

	$('[name="addtitle"]').attr('placeholder', 'No Title Page will be included');
	$('[name="addsubtitle"]').attr('placeholder', 'No Title Page subtitle will be included');
	$('[name="addtoc"]').attr('placeholder', 'No Table of Contents will be included');
	$('[name="addindex"]').attr('placeholder', 'No Index will be included');
	$('[name="pageheader"]').attr('placeholder', 'No Page Header will be included');
	$('[name="pagefooter"]').attr('placeholder', 'No Page Footer will be included');
	$('[name="qrcode_link"]').attr('placeholder', 'QR Code will use default Share URL');
	$('[name="caption_for_qrcode"]').attr('placeholder', 'No QR Code caption will be included');

}

function PDFTunebookBuilder(){

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","PDFTunebookBuilder");

	// sound_font was added later, make sure the field is present
	if ((!gPDFTunebookConfig.sound_font) || (gPDFTunebookConfig.sound_font == "")){
		gPDFTunebookConfig.sound_font = "fluid";
	}

	var midi_program_list = [];

  	for (var i=0;i<138;++i){
  		midi_program_list.push({name: "  "+ generalMIDISoundNames[i], id: i });
  	}

    const pdf_quality_list = [
	    { name: "  Draft", id: 0.4 },
	    { name: "  Good", id: 0.5 },
	    { name: "  High", id: 0.75 },
  	];

 	const sound_font_options = [
	    { name: "  Fluid", id: "fluid" },
	    { name: "  Musyng Kite", id: "musyng" },
	    { name: "  FatBoy", id: "fatboy" },
 	    { name: "  Canvas", id: "canvas" },
 	    { name: "  MScore", id: "mscore" },
 	];

  	for (var i=0;i<138;++i){
  		midi_program_list.push({name: "  "+ generalMIDISoundNames[i], id: i });
  	}

	var form = [
	  {html: '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:50px;">Configure PDF Tunebook Features&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#configure_pdf_tunebook_features" target="_blank" style="text-decoration:none;">💡</a></span></p>'},  
	  {html: '<p style="margin-top:12px;margin-bottom:12px;font-size:12pt;line-height:18pt;font-family:helvetica">Clicking "OK" will add PDF tunebook feature annotations to the top of your ABC.</p>'},  
	  {html: '<p style="margin-top:12px;margin-bottom:12px;font-size:12pt;line-height:18pt;font-family:helvetica">Leave any text fields blank for features you don\'t want in your PDF tunebook.</p>'},  
	  {name: "PDF quality:", id: "pdfquality", type:"select", options:pdf_quality_list, cssClass:"configure_pdfquality_select"},
	  {name: "Space between tunes (in 1/72\"):", id: "pdf_between_tune_space", type:"number", cssClass:"configure_setuppdftunebook_form_text"},
	  {name: "Title Page title:", id: "addtitle", type:"text", cssClass:"configure_setuppdftunebook_form_text_wide"},
	  {name: "Title Page subtitle:", id: "addsubtitle", type:"text", cssClass:"configure_setuppdftunebook_form_text_wide"},
	  {name: "Table of Contents title:", id: "addtoc", type:"text", cssClass:"configure_setuppdftunebook_form_text_wide"},
	  {name: "Index title:", id: "addindex", type:"text", cssClass:"configure_setuppdftunebook_form_text_wide"},
	  {name: "Page Header:", id: "pageheader", type:"text", cssClass:"configure_setuppdftunebook_form_text_wide"},
	  {name: "Page Footer:", id: "pagefooter", type:"text", cssClass:"configure_setuppdftunebook_form_text_wide"},
	  {name: "          Add playback links to each tune to allow playing the tune by clicking the tune title", id: "bAdd_add_all_playback_links", type:"checkbox", cssClass:"configure_setuppdftunebook_form_text"},
	  {name: "Soundfont for playback links:", id: "sound_font", type:"select", options:sound_font_options, cssClass:"configure_midi_program_select"},
	  {name: "Melody instrument for playback links:", id: "melody_instrument", type:"select", options:midi_program_list, cssClass:"configure_midi_program_select"},
	  {name: "Bass/Chord instrument for playback links:", id: "chord_instrument", type:"select", options:midi_program_list, cssClass:"configure_midi_program_select"},
	  {name: "          Add a QR Code to the end of the PDF", id: "bAdd_QRCode", type:"checkbox", cssClass:"configure_setuppdftunebook_form_text"},
	  {html: '<p style="margin-top:18px;margin-bottom:12px;font-size:12pt;line-height:18pt;font-family:helvetica">To override the default Share URL QR Code, enter your own URL below:</p>'},  
	  {name: "Custom URL:", id: "qrcode_link", type:"text", cssClass:"configure_setuppdftunebook_form_text_wide"},
	  {name: "QR Code caption:", id: "caption_for_qrcode", type:"text", cssClass:"configure_setuppdftunebook_form_text_wide"},
	];

	setTimeout(function(){

		idlePDFTunebookBuilder();

	}, 150);

	const modal = DayPilot.Modal.form(form, gPDFTunebookConfig, { theme: "modal_flat", top: 20, width: 690, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){
	
		if (!args.canceled){

			//debugger;
			// %pdfquality .75
			// %pdf_between_tune_space 20
			// %addtitle Tunebook Title
			// %addsubtitle Tunebook Subtitle
			// %addtoc Table of Contents
			// %addlinkbacktotoc
			// %addsortedindex Index
			// %addlinkbacktoindex
			// %pageheader This is the Page Header
			// %pagefooter This is the Page Footer
			// %add_all_playback_links 0 0 fatboy
			// %qrcode https://michaeleskin.com
			// %caption_for_qrcode Click or Scan to Visit my Home Page

			var header_to_add = "% Start of PDF Tunebook Features\n";
			header_to_add += "%\n";

			// PDF Quality
			gPDFTunebookConfig.pdfquality = args.result.pdfquality

			header_to_add += "%pdfquality "+gPDFTunebookConfig.pdfquality+"\n";

			// Space between tunes
			gPDFTunebookConfig.pdf_between_tune_space = args.result.pdf_between_tune_space;

			if (gPDFTunebookConfig.pdf_between_tune_space != ""){

				header_to_add += "%pdf_between_tune_space "+gPDFTunebookConfig.pdf_between_tune_space+"\n";

			}

			// Title
			gPDFTunebookConfig.addtitle = args.result.addtitle;

			// Subtitle
			gPDFTunebookConfig.addsubtitle = args.result.addsubtitle;

			if (gPDFTunebookConfig.addtitle != ""){

				header_to_add += "%addtitle "+gPDFTunebookConfig.addtitle+"\n";

				if (gPDFTunebookConfig.addsubtitle != ""){

					header_to_add += "%addsubtitle "+gPDFTunebookConfig.addsubtitle+"\n";

				}

			}

			// TOC Title
			gPDFTunebookConfig.addtoc = args.result.addtoc;

			if (gPDFTunebookConfig.addtoc != ""){

				header_to_add += "%addtoc "+gPDFTunebookConfig.addtoc+"\n";
				header_to_add += "%addlinkbacktotoc\n";

			}

			// Index Title
			gPDFTunebookConfig.addindex = args.result.addindex;

			if (gPDFTunebookConfig.addindex != ""){

				header_to_add += "%addsortedindex "+gPDFTunebookConfig.addindex+"\n";
				header_to_add += "%addlinkbacktoindex\n";

			}

			// Page Header
			gPDFTunebookConfig.pageheader = args.result.pageheader;

			if (gPDFTunebookConfig.pageheader != ""){

				header_to_add += "%pageheader "+gPDFTunebookConfig.pageheader+"\n";

			}

			// Page Footer
			gPDFTunebookConfig.pagefooter = args.result.pagefooter;

			if (gPDFTunebookConfig.pagefooter != ""){

				header_to_add += "%pagefooter "+gPDFTunebookConfig.pagefooter+"\n";
				
			}

			// Add playback links?
			gPDFTunebookConfig.bAdd_add_all_playback_links = args.result.bAdd_add_all_playback_links;

			// Inject instruments?
			gPDFTunebookConfig.bInjectInstruments = args.result.bInjectInstruments;

			// Soundfont
			gPDFTunebookConfig.sound_font = args.result.sound_font;

			// Melody Instrument
			gPDFTunebookConfig.melody_instrument = args.result.melody_instrument;

			// Bass/Chord Instrument
			gPDFTunebookConfig.chord_instrument = args.result.chord_instrument;

			if (gPDFTunebookConfig.bAdd_add_all_playback_links){
				
				var soundFont = gPDFTunebookConfig.sound_font;

				var progNumMelody = gPDFTunebookConfig.melody_instrument;

				var progNumChord = gPDFTunebookConfig.chord_instrument;

				// Special case for muting voices
				if (progNumMelody == 0){

					progNumMelody = "mute";

				}
				else{

					progNumMelody = progNumMelody - 1;

					if ((progNumMelody < 0) || (progNumMelody > 136)){

						progNumMelody = 0;

					}

				}

				// Special case for muting voices
				if (progNumChord == 0){

					progNumChord = "mute";

				}
				else{

					progNumChord = progNumChord - 1;

					if ((progNumChord < 0) || (progNumChord > 136)){

						progNumChord = 0;

					}

				}

				header_to_add += "%add_all_playback_links "+progNumMelody+" "+progNumChord+" "+soundFont+"\n";

			}


			// QR Code?
			gPDFTunebookConfig.bAdd_QRCode = args.result.bAdd_QRCode;

			// Link override
			gPDFTunebookConfig.qrcode_link = args.result.qrcode_link;

			// Caption
			gPDFTunebookConfig.caption_for_qrcode = args.result.caption_for_qrcode;

			if (gPDFTunebookConfig.bAdd_QRCode){

				if (gPDFTunebookConfig.qrcode_link != ""){

					header_to_add += "%qrcode "+gPDFTunebookConfig.qrcode_link+"\n";

				}
				else{

					header_to_add += "%qrcode\n";

				}

				if (gPDFTunebookConfig.caption_for_qrcode != ""){

					header_to_add += "%caption_for_qrcode "+gPDFTunebookConfig.caption_for_qrcode+"\n";

				}
			}

			header_to_add += "%\n";

			header_to_add += "% End of PDF Tunebook Features\n";

			header_to_add += "\n";

			SaveConfigurationSettings();

			// Add the feature annotations to the top of the ABC
			var theNotes = gTheABC.value;

			//debugger;

			// Strip off any existing settings

			var markerString = "% End of PDF Tunebook Features\n\n";

			var startIndex = theNotes.indexOf(markerString);

			if (startIndex != -1){

				startIndex += markerString.length;

				theNotes = theNotes.substring(startIndex); 

			}

			markerString = "% End of PDF Tunebook Features\n";

			startIndex = theNotes.indexOf(markerString);

			if (startIndex != -1){

				startIndex += markerString.length;

				theNotes = theNotes.substring(startIndex); 

			}

			header_to_add += theNotes;

			gTheABC.value = header_to_add;

			// Set dirty
			gIsDirty = true;


		}

	});
}

function AddABC(){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","AddABC");

	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:50px;">Add ABC Tunes, Templates, and PDF Features&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#add_templates_dialog" target="_blank" style="text-decoration:none;">💡</a></span></p>';
	modal_msg += '<div id="add-new-tune-dialog">';
	modal_msg += '<p style="text-align:center;margin-top:28px;font-size:18px;margin-bottom:36px">Add Your Own Tunes from an ABC or MusicXML File</p>';
	modal_msg += '<p style="text-align:center;">';
	modal_msg += '<input type="file" id="addabcfilebutton" accept=".abc,.txt,.ABC,.TXT,.xml,.XML,.musicxml,.mxl,.MXL" hidden/>';
	modal_msg += '<label class="abcuploaddialog btn btn-top" for="addabcfilebutton" title="Adds tunes from an existing ABC or MusicXML file to the end of the ABC">Choose File to Add</label>';
	modal_msg += '<input class="dialogrestorebutton btn btn-restorebutton" id="dialogrestorebutton" onclick="RestoreSnapshot(false,true);" type="button" value="Restore from Snapshot" title="Replaces the contents of the ABC editor with a Snapshot saved in browser storage" style="display:none;">';
	modal_msg += '<input class="dialogrestoreautobutton btn btn-restorebutton" id="dialogrestoreautobutton" onclick="RestoreSnapshot(true,true);" type="button" value="Restore from Auto-Snapshot" title="Replaces the contents of the ABC editor with an Auto-Snapshot saved in browser storage" style="display:none;">';
	modal_msg += '</p>';
	modal_msg += '<p style="text-align:center;margin-top:24px;">';
	modal_msg += '<p style="text-align:center;margin-top:24px;font-size:18px;margin-top:36px;">Add an Example ABC Tune</p>';
	modal_msg += '<p style="text-align:center;margin-top:24px;">';
	modal_msg  += '<input id="addnewreel" class="advancedcontrols btn btn-injectcontrols-headers" onclick="AppendSampleReel();" type="button" value="Add an Example Reel" title="Adds an example reel (Cooley\'s) to the end of the ABC">';
	modal_msg  += '<input id="addnewjig" class="advancedcontrols btn btn-injectcontrols-headers" onclick="AppendSampleJig();" type="button" value="Add an Example Jig" title="Adds an example jig (The Kesh) to the end of the ABC">';
	modal_msg  += '<input id="addnewhornpipe" class="advancedcontrols btn btn-injectcontrols-headers" onclick="AppendSampleHornpipe();" type="button" value="Add an Example Hornpipe" title="Adds an example Hornpipe (Alexander\'s) to the end of the ABC">';
	modal_msg += '</p>';	
	modal_msg += '<p style="text-align:center;margin-top:24px;">';
	modal_msg  += '<input id="addjsbach" class="advancedcontrols btn btn-injectcontrols-headers" style="margin-right:24px;" onclick="AppendJSBach();" type="button" value="Add J.S. Bach Two-Part Invention #1" title="Adds the J.S. Bach 2-Part Invention #1 to the end of the ABC">';
	modal_msg  += '<input id="addjsbach" class="advancedcontrols btn btn-injectcontrols-headers" onclick="AppendJSBach2();" type="button" value="Add J.S. Bach BWV570 Fantasia" title="Adds the J.S. Bach BWV570 Fantasia for Pipe Organ to the end of the ABC">';
	modal_msg += '</p>';
	modal_msg += '<p style="text-align:center;margin-top:32px;font-size:18px;">Add an ABC Template</p>';
	modal_msg += '<p style="text-align:center;margin-top:24px;">';
	modal_msg  += '<input id="addnewsong" class="advancedcontrols btn btn-injectcontrols-headers" onclick="AppendSampleSong();" type="button" value="Add an Example Song" title="Adds an example song to the end of the ABC">';
	modal_msg  += '<input id="addsongtemplate" class="advancedcontrols btn btn-injectcontrols-headers" onclick="AppendSongTemplate();" type="button" value="Add a Song Template" title="Adds a minimal song template to the end of the ABC">';
	modal_msg += '</p>';
	modal_msg += '<p style="text-align:center;margin-top:24px;">';
	modal_msg  += '<input id="addboxfingeringtemplate" class="advancedcontrols btn btn-injectcontrols-headers" style="margin-right:24px;" onclick="AppendBoxFingeringTemplate();" type="button" value="Add Box Fingering Symbols Template" title="Adds a template with symbols for annotating box fingerings and tablature to the top of the ABC">';
	modal_msg  += '<input id="addboxfingeringtemplate" class="advancedcontrols btn btn-injectcontrols-headers" onclick="AddClickTrackTemplate();" type="button" value="Add Two-Bar Click Intro Templates" title="Adds two-bar click intro templates for common styles of tunes to the end of the ABC">';
	modal_msg += '</p>';
	modal_msg += '<p style="text-align:center;margin-top:32px;font-size:18px;">Configure PDF Tunebook Features</p>';
	modal_msg += '<p style="text-align:center;margin-top:24px;"><input id="tunebookbuilder" class="advancedcontrols btn btn-injectcontrols-tunebookbuilder" onclick="PDFTunebookBuilder();" type="button" value="Configure PDF Tunebook Features" title="Easily add features to your PDF tunebook including: Title Page, Table of Contents, Index, Page Headers, Page Footers, playback links, and custom QR Code"></p>';
	modal_msg += '<p style="text-align:center;margin-top:24px;">';
	modal_msg += '</p>';
	modal_msg += '</div>';

	setTimeout(function(){

		idleAddABC();

	}, 150);

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 75, width: 720,  scrollWithPage: (AllowDialogsToScroll()) }).then(function(){

			
	});

}


function AppendSampleReel(){	

	// Keep track of actions
	sendGoogleAnalytics("action","AppendSampleReel");

	// Stuff in some default ABC with additional options explained
	var theValue = ""

	var nTunes = CountTunes();

	if (nTunes > 0){
		theValue += "\n";
	}
	
	theValue += "X: 1\n";
	theValue += "T: Cooley's\n";
	theValue += "C: Traditional\n";
	theValue += "R: Reel\n";
	theValue += "M: 4/4\n";
	theValue += "L: 1/8\n";
	theValue += "Q: 1/2=90\n";
	theValue += "K: Edor\n";
	theValue += '%abcjs_soundfont fluid\n';	
	theValue += "%\n";
	theValue += "% Use an Accordion sound when playing the melody:\n";
	theValue += "%%MIDI program 21\n";
	theValue += "%\n";
	theValue += "% Use an Accordion sound when playing the chords:\n";
	theValue += "%%MIDI chordprog 21\n";
	theValue += "%\n";
	theValue += "% Set a specific amount of swing:\n";
	theValue += '%swing 0.15\n';
	theValue += "%\n";
	theValue += '|:"Em"EBBA B2 EB|"Em"B2 AB dBAG|"D"F/E/D AD BDAD|"D"F/E/D AD BAGF|\n';
	theValue += '"Em"EBBA B2 EB|"Em"B2 AB defg|"D"afge dBAF|1 "D"DEFD "Em"E3D:|2 "D"DEFD "Em"E2gf||\n';
	theValue += '|:"Em"eB (3BBB eBgf|"Em"eBB2 gedB|"D"A/A/A FA DAFA|"D"A/A/A FA defg|\n';
	theValue += '"Em"eB (3BBB eBgf|"Em"eBBB defg|"D"afge dBAF|1 "D"DEFD "Em"E2gf:|2 "D"DEFD "Em"E4|]\n';

	// Do common tune addition processing
	ProcessAddTune(theValue);

}

function AppendSampleJig(){	

	// Keep track of actions
	sendGoogleAnalytics("action","AppendSampleJig");

	// Stuff in some default ABC with additional options explained
	var theValue = ""

	var nTunes = CountTunes();

	if (nTunes > 0){
		theValue += "\n";
	}
	
	theValue += "X: 1\n";
	theValue += "T: The Kesh\n";
	theValue += "C: Traditional\n";
	theValue += "R: Jig\n";
	theValue += "M: 6/8\n";
	theValue += "L: 1/8\n";
	theValue += "Q: 3/8=120\n";
	theValue += "K: Gmaj\n";
	theValue += '%abcjs_soundfont fluid\n';	
	theValue += "%\n";
	theValue += "% Use an Accordion sound when playing the melody:\n";
	theValue += "%%MIDI program 21\n";
	theValue += "%\n";
	theValue += "% Use an Accordion sound when playing the chords:\n";
	theValue += "%%MIDI chordprog 21\n";
	theValue += "%\n";
	theValue += "% Set a specific amount of swing:\n";
	theValue += '%swing 0.25\n';
	theValue += "%\n";
	theValue += '|:"G"GAG GAB|"D"ABA ABd|"G"edd gdd|"C"edB "D"dBA|\n';
	theValue += '"G"GAG GAB|"D"ABA ABd|"G"edd gdB|"D"AGF "G"G3:|\n';
	theValue += '|:"G"BAB dBd|"C"ege "D"dBA|"G"BAB dBG|"D"ABA AGA|\n';
	theValue += '"G"BAB dBd|"C"ege "G"dBd|"C"gfg "D"aga|"G"bgf g3:|\n';

	// Do common tune addition processing
	ProcessAddTune(theValue);

}

function AppendSampleHornpipe(){	

	// Keep track of actions
	sendGoogleAnalytics("action","AppendSampleHornpipe");

	// Stuff in some default ABC with additional options explained
	var theValue = ""

	var nTunes = CountTunes();

	if (nTunes > 0){
		theValue += "\n";
	}
	
	theValue += 'X: 1\n';
	theValue += 'T: Alexander\'s\n';
	theValue += "C: Traditional\n";
	theValue += 'R: Hornpipe\n';
	theValue += 'M: 4/4\n';
	theValue += 'L: 1/8\n';
	theValue += 'Q: 1/2=80\n';
	theValue += 'K: Dmaj\n';
	theValue += '%abcjs_soundfont fluid\n';
	theValue += "%\n";
	theValue += "% Use an Piano sound when playing the melody:\n";
	theValue += '%%MIDI program 0\n';
	theValue += "%\n";
	theValue += "% Use an Piano sound when playing the chords:\n";
	theValue += '%%MIDI chordprog 0\n';
	theValue += "%\n";
	theValue += "% Set a specific amount of swing:\n";
	theValue += '%swing 0.25\n';
	theValue += "%\n";
	theValue += '|:(3gfe|"D"dAFA DFAd|fdcd Adef|"G"g2 ge "D"fdcd|"A"(3efe (3dcB A2 (3gfe|\n';
	theValue += '"D"dAFA DFAd|fdcd Adef|"G"g2 ge "D"fdcd|"A"(3efe dc"D"d2:|\n';
	theValue += '|:AG|"D"FAdA FAdA|"G"GBdB GBdB|"A"Acec Acec|"D"dfaf "A"(3gfe (3dAG|\n';
	theValue += '"D"FAdA FAdA|"G"GBdB GBdB|"A"Acef gecd|(3efe dc"D"d2:|\n';

	// Do common tune addition processing
	ProcessAddTune(theValue);

}
//
// Add a new song template to the ABC
//
function AppendSongTemplate(){	

	// Keep track of actions
	sendGoogleAnalytics("action","AppendSongTemplate");

	// Stuff in some default ABC with additional options explained
	var theValue = ""

	var nTunes = CountTunes();
	
	if (nTunes > 0){
		theValue += "\n";
	}

	theValue += "% Stripped-down self-documenting song in ABC, by Linda Eskin\n";
	theValue += "% Replace the WORDS IN UPPER-CASE with your own information.\n";
	theValue += "% You can remove all these comments with single % signs.\n";
	theValue += "%\n";
	theValue += "X: 1\n"; 
	theValue += "%\n";
	theValue += "% *** THIS HEADER CONVEYS INFORMATION ABOUT THE SONG ***\n";
	theValue += "%\n";
	theValue += "% These text elements appear above the music:\n";
	theValue += "T: TITLE OF THE SONG\n";
	theValue += "T: ALTERNATE TITLE\n";
	theValue += "C: COMPOSER/SONGWRITER\n";
	theValue += "O: ORIGIN/GEOGRAPHIC\n";
	theValue += "%%text GENERAL PURPOSE TEXT\n";
	theValue += "%\n";
	theValue += "% These appear below the music and lyrics:\n";
	theValue += "S: SOURCE OF THE SONG\n";
	theValue += "D: DISCOGRAPHY - CD, LP, ETC.\n";
	theValue += "N: NOTES (TEXT)\n";
	theValue += "Z: TRANSCRIBER, COPYRIGHT, PERMISSIONS\n";
	theValue += "H: HISTORY OF THE SONG\n";
	theValue += "H: This self-documenting ABC song template was created by Linda Eskin.\n";
	theValue += "%\n";
	theValue += "% This appears in your ABC file only, for reference.\n";
	theValue += "F: FILE URL - WHERE TO FIND THIS ONLINE\n";
	theValue += "%\n";
	theValue += "% These appear above the music AND control how it is played:\n";
	theValue += "R: RHYTHM, E.G. JIG, WALTZ\n";
	theValue += "M: 4/4\n";
	theValue += "L: 1/4\n";
	theValue += "Q: 1/4=120\n";
	theValue += "K: C\n";
	theValue += "% The K (key) tag should be the last thing in the header.\n";
	theValue += "%\n";
	theValue += "% *** THE SONG ITSELF STARTS HERE - REPLACE THIS WITH YOUR SONG ***\n";
	theValue += "%\n";
	theValue += "P: PART - VERSE, CHORUS, ETC.\n";
	theValue += '"C"C D2 E|"F"F G3|"Am"A B2 c|"E7"d e3|\n';
	theValue += "w: The words to the act-u-al tune go here\n";
	theValue += "w: You can put more ver-ses here is you like\n";
	theValue += "%\n";
	theValue += '"C"C D2 E|"F"F G3|"Am"A B2 c|"E7"d e3|]\n';
	theValue += "w: This tune is a scale. See how the notes work!\n";
	theValue += "w: This line is for the se-cond verse. Ta-da!\n";
	theValue += "%\n";
	theValue += "% *** YOU CAN PUT MORE LYRICS AFTER THE TUNE, TOO. ***\n";
	theValue += "%\n";
	theValue += "W: Write your extra verses here, verses here, verses here.\n";
	theValue += "W: Write your extra verses here, or the whole song if you like.\n";
	theValue += "W:\n";
	theValue += "W: --- This is where the chorus goes, chorus goes, chorus goes.\n";
	theValue += "W: --- Indent it with dashes if you like, but spaces will not work.\n";
	theValue += "W:\n";
	theValue += "W: Here we have another verse, another verse, another verse.\n";
	theValue += "W: Now we have reached the end - this is the last verse of this song.\n"; 
	theValue += "%\n";
	theValue += "% That should get you started. Go play!\n";


	// Do common tune addition processing
	ProcessAddTune(theValue);

}

//
// Add a new song template to the ABC
//
function AppendSampleSong(){	

	// Keep track of actions
	sendGoogleAnalytics("action","AppendSampleSong");

	// Stuff in some default ABC with additional options explained
	var theValue = ""

	var nTunes = CountTunes();
	
	if (nTunes > 0){
		theValue += "\n";
	}

	theValue += "% A simple, self-documenting song in ABC, by Linda Eskin\n";
	theValue += "%\n";
	theValue += "% ABC is a plain-text format for conveying musical information.\n";
	theValue += "% Use this as an example to learn how ABC is written.\n";
	theValue += "% You can use it as a template to create your own ABC song.\n";
	theValue += "% Examples are in UPPER-CASE so you can see and replace them easily.\n";
	theValue += "%\n";
	theValue += "% Comments (like this one) start with a single percent symbol.\n";
	theValue += "%\n";
	theValue += "X: 1 \n";
	theValue += "% Each tune must start with an X: tag, and a number.\n";
	theValue += "%\n";
	theValue += "% *** THIS IS THE HEADER - INFO ABOUT THE TUNE/SONG ***\n";
	theValue += "%\n";
	theValue += "% These text elements appear above the music:\n";
	theValue += "%\n";
	theValue += "T: TITLE OF THE SONG\n"; 
	theValue += "T: ALTERNATE TITLE\n";
	theValue += "%\n"; 
	theValue += "C: COMPOSER\n"; 
	theValue += '% Songwriter, source, "Traditional", "Child Ballad," etc.\n';
	theValue += "%\n";
	theValue += "O: ORIGIN\n";
	theValue += "% Where is the tune from? Country, culture, ...\n";
	theValue += "%\n";
	theValue += "%%text GENERAL PURPOSE TEXT\n";
	theValue += "% There are many more options that use the double percentage symbols.\n";
	theValue += "% Note that lines starting with %% are *not* comments.\n";
	theValue += "%\n";
	theValue += "% These text elements appear below the music and lyrics:\n";
	theValue += "%\n";
	theValue += "% For S:, D:, H:, N:, and Z: the first line with the tag adds a label.\n";
	theValue += "% Additional lines with the same tag do not.\n";
	theValue += "%\n";
	theValue += "% S:, D:, H:, N:, and Z: lines do not word wrap.\n";
	theValue += "% Add more lines if you have more than will fit across the page.\n";
	theValue += "%\n";
	theValue += "S: SOURCE\n";
	theValue += '% "Learned from Morgan at Folk Festival," "Child Ballad," etc.\n';
	theValue += "%\n";
	theValue += "D: DISCOGRAPHY\n";
	theValue += "% On which CD/LP? Appears at the bottom of the page.\n";
	theValue += "%\n";
	theValue += "N: THESE NOTES APPEAR NEAR THE BOTTOM OF THE PAGE.\n";
	theValue += "%\n";
	theValue += "Z: TRANSCRIBER, COPYRIGHT, PERMISSIONS.\n";
	theValue += "% Transcriber info appears at the bottom, right below the Notes.\n";
	theValue += "%\n";
	theValue += "H: HISTORY OF THE SONG\n";
	theValue += "H: This self-documenting ABC example song was created by Linda Eskin.\n";
	theValue += "% Real-life event? Written for a movie? Appears at the bottom of the page.\n";
	theValue += "%\n";
	theValue += "F: FILE URL\n";
	theValue += "% If you want people to find your file online, put the URL here.\n";
	theValue += "%\n";
	theValue += "% These appear above the music AND control how it is played:\n";
	theValue += "%\n";
	theValue += "R: RHYTHM\n";
	theValue += "% Reel, Waltz, Jig, Hornpipe, etc.\n";
	theValue += "%\n";
	theValue += "M: 4/4\n";
	theValue += "% Meter, such as 3/4, 4/4, 9/8. Appears in the key signature.\n";
	theValue += "%\n";
	theValue += "L: 1/4\n";
	theValue += "% Length of base note unit. Here a 1/4 note = 1.\n";
	theValue += "% Use multiplier numbers to get longer notes: C2, a3, F4\n";
	theValue += "%\n";
	theValue += "Q: 1/4=120\n";
	theValue += "% Tempo. e.g. 120 beats per minute (BPM). (Mnemonic: Q=Quickness.)\n";
	theValue += "%\n";
	theValue += "%%staffsep 80\n";
	theValue += "% Sets the spacing between the staffs. Bigger numbers = more space.\n";
	theValue += "%\n";
	theValue += "K: C\n";
	theValue += "% Key signature - G, D, Edor, Amix, etc.\n";
	theValue += "% The K (key) tag should be the last thing in the header.\n";
	theValue += "%\n";
	theValue += "% *** THE TUNE ITSELF STARTS HERE ***\n";
	theValue += "%\n";
	theValue += "P: PART GOES HERE\n";
	theValue += "% Intro, Verse, Chorus, Refrain, etc.\n";
	theValue += "%\n";
	theValue += "% This is the actual music and words.\n";
	theValue += "% ABC apps *play* the music you write. Don't just make stuff up!\n";
	theValue += "% Follow the ABC standard so your tune and chords play correctly:\n";
	theValue += "% http://abcnotation.com/wiki/abc:standard:v2.1\n";
	theValue += "%\n";
	theValue += '"C"C D2 E|"F"F G3|"Am"A B2 c|"E7"d e3|\n';
	theValue += "w: The words to the act-u-al tune go here\n";
	theValue += "w: You can put more ver-ses here is you like\n";
	theValue += "%\n";
	theValue += '"C"C D2 E|"F"F G3|"Am"A B2 c|"E7"d e3|]\n';
	theValue += "w: This tune is a scale. See how the notes work!\n";
	theValue += "w: This line is for the se-cond verse. Ta-da!\n";
	theValue += "%\n";
	theValue += "% Chord names, in quotes, appear above the black-dots notation.\n";
	theValue += "%\n";
	theValue += "% The other letters are the notes. Lower-case for higher octave.\n";
	theValue += '% The base unit note length ("L", above) is assumed to equal 1.\n';
	theValue += "% For longer notes use a multiplier: G3, e2, C4 etc.\n";
	theValue += "%\n";
	theValue += '% w (lower-case "w") = words, or inline lyrics - the lyrics that appear right in the sheet music, below the black-dots notation.\n';
	theValue += "%\n";
	theValue += "% *** YOU CAN PUT MORE LYRICS AFTER THE TUNE, TOO. ***\n";
	theValue += "%\n";
	theValue += "% W = Words. More lyrics, if you want them.\n";
	theValue += '% Note upper-case "W:" used below:\n';
	theValue += "%\n";
	theValue += "W: Write your extra verses here, verses here, verses here.\n";
	theValue += "W: Write your extra verses here, or the whole song if you like.\n";
	theValue += "W:\n";
	theValue += '% You can leave a "W" line blank, to leave some space.\n';
	theValue += "W: --- This is where the chorus goes, chorus goes, chorus goes.\n";
	theValue += "W: --- Indent it with dashes if you like, but spaces won't work.\n";
	theValue += "W:\n";
	theValue += "W: Here we have another verse, another verse, another verse.\n";
	theValue += "W: Now we have reached the end - this is the last verse of this song.\n";
	theValue += "%\n";
	theValue += "% That should get you started. Go play!\n";

	// Do common tune addition processing
	ProcessAddTune(theValue);

}

//
// Add a box fingering template
//
function AppendBoxFingeringTemplate(){

	// Keep track of actions
	sendGoogleAnalytics("action","AppendBoxFingeringTemplate");

	var theNotes = gTheABC.value;

	var output = "";

	output += '%\n';
	output += "% Danny Flynn's symbols for box fingering transcriptions\n";
	output += '%\n';	
	output += '% Copy and paste these as chord annotations before the notes:\n';
	output += '%\n';
	output += '% Finger 1: "1" "①"\n';
	output += '% Finger 2: "2" "②"\n';
	output += '% Finger 3: "3" "③"\n';
	output += '% Finger 4: "4" "④"\n';
	output += '% Slide down: "➘"\n';
	output += '% Slide up: "➚"\n';
	output += '% Slide straight down: "↓"\n';
	output += '% Cross over/under: "x"\n';
	output += '% Push: "⮐"\n';
	output += '% Draw: "⮑"\n';	
	output += '%\n';
	output += '% Additional symbols for button numbering tablature:\n';
	output += '%\n';
	output += '% "1" "2" "3" "4" "5" "6" "7" "8" "9" "10" "11" "↑" "↓"\n';
	output += '% "①" "②" "③" "④" "⑤" "⑥" "⑦" "⑧" "⑨" "⑩" "⑪"\n';
 	output += '%\n';
 	output += '\n';

	output += theNotes;

	// Stuff in the headers
	gTheABC.value = output;

	// Set dirty flag
	gIsDirty = true;

	// Set the select point
	gTheABC.selectionStart = 0;
    gTheABC.selectionEnd = 0;

    // Focus after operation
    FocusAfterOperation();
	
}

//
// Add a click track template to the top of the ABC
//
function AddClickTrackTemplate(){

	// Keep track of actions
	sendGoogleAnalytics("action","AddClickTrackTemplate");

	var output = "";

	var nTunes = CountTunes();

	if (nTunes > 0){
		output += "\n";
	}

	output += 'X: 1\n';
	output += 'T: Two-Bar Click Intro Templates\n';
	output += 'Q: 1/8\n';
	output += '%\n';
	output += '%%text Copy and paste these templates at the start of the notes for any tune.\n';
	output += '%%text Make sure that any tune first-part repeats, including first-endings, have a starting |:\n';
	output += '%%text For a higher pitched click, change the ^C values in the patterns to =C\n';
	output += '%%text\n';
	output += '%\n';
	output += '%%text Reel two-bar click intro:\n';
	output += '%%text\n';
	output += 'M: 4/4\n';
	output += '%\n';
	output += 'V:1\n';
	output += 'V:2\n';
	output += '%%MIDI program 128\n';
	output += '^Cz3 ^Cz3|^Cz3 ^Cz3|\n';
	output += 'V:1\n';
	output += 'z8|z8|\n';
	output += '%\n';
	output += '%%text\n';
	output += '%%text Jig two-bar click intro:\n';
	output += 'M: 6/8\n';
	output += '%\n';
	output += 'V:1\n';
	output += 'V:2\n';
	output += '%%MIDI program 128\n';
	output += '^Cz2 ^Cz2|^Cz2 ^Cz2|\n';
	output += 'V:1\n';
	output += 'z6|z6|\n';
	output += '%\n';
	output += '%%text\n';
	output += '%%text Slide two-bar click intro:\n';
	output += 'M: 12/8\n';
	output += '%\n';
	output += 'V:1\n';
	output += 'V:2\n';
	output += '%%MIDI program 128\n';
	output += '^Cz2 ^Cz2 ^Cz2 ^Cz2|\n';
	output += 'V:1\n';
	output += 'z12|\n';
	output += '%\n';
	output += '%%text\n';
	output += '%%text Slip Jig two-bar click intro:\n';
	output += 'M: 9/8\n';
	output += '%\n';
	output += 'V:1\n';
	output += 'V:2\n';
	output += '%%MIDI program 128\n';
	output += '^Cz2 ^Cz2 ^Cz2|^Cz2 ^Cz2 ^Cz2|\n';
	output += 'V:1\n';
	output += 'z9|z9|\n';
	output += '%\n';
	output += '%%text\n';
	output += '%%text Polka two-bar click intro:\n';
	output += 'M: 2/4\n';
	output += '%\n';
	output += 'V:1\n';
	output += 'V:2\n';
	output += '%%MIDI program 128\n';
	output += '^Cz ^Cz|^Cz ^Cz|\n';
	output += 'V:1\n';
	output += 'z4|z4|\n';
	output += '%\n';
	output += '%%text\n';
	output += '%%text Waltz two-bar click intro:\n';
	output += 'M: 3/4\n';
	output += '%\n';
	output += 'V:1\n';
	output += 'V:2\n';
	output += '%%MIDI program 128\n';
	output += '^Cz ^Cz ^Cz|^Cz ^Cz ^Cz|\n';
	output += 'V:1\n';
	output += 'z6|z6|\n';
	output += "\n";

	// Do common tune addition processing
	ProcessAddTune(output);

}

//
// Add the J.S. Bach 2-Part Invention #1
//
function AppendJSBach(){

	// Keep track of actions
	sendGoogleAnalytics("action","AppendJSBach");

	// Stuff in some default ABC with additional options explained
	var theValue = ""

	var nTunes = CountTunes();

	if (nTunes > 0){
		theValue += "\n";
	}

	theValue += 'X:1\n';
	theValue += "%\n";
	theValue += "% Example J.S. Bach transcription originally imported from MusicXML\n";
	theValue += "%\n";	
	theValue += '% Click "Play" to play\n';
	theValue += "%\n";
	theValue += 'T:Two-Part Invention #1\n';
	theValue += 'C:J.S. Bach\n';
	theValue += 'L:1/16\n';
	theValue += 'Q:1/4=84\n';
	theValue += 'M:4/4\n';
	theValue += 'K:C\n';
	theValue += '%\n';
	theValue += '% Try changing the abcjs_soundfont value to\n';
	theValue += '% fluid, musyng, fatboy, canvas, or mscore for different harpsichord sounds:\n';
	theValue += '%\n';	
	theValue += '%abcjs_soundfont fluid\n';	
	theValue += '%\n';	
	theValue += '%%staffsep 40\n';
	theValue += '%\n';
	theValue += '% Try changing these to %%MIDI program mute\n';
	theValue += '% to isolate individual voices:\n';
	theValue += '%\n';
	theValue += 'V:1 treble\n';
	theValue += '%%MIDI program 6\n';
	theValue += 'V:2 bass\n';
	theValue += '%%MIDI program 6\n';
	theValue += 'V:1\n';
	theValue += '[Q:84]\n';	
	theValue += 'z CDE FDEC G2c2 B/A/Bc2 | dGAB cABG d2g2 f/e/fg2 |\n'; 
	theValue += 'eagf egfa gfed cedf | edcB AcBd cBAG ^FAGB |\n'; 
	theValue += 'A2D2 c/B/c2d BAG^F EGFA | GBAc Bdce dB/c/dg B/c/BAG |\n';
	theValue += '.G4 z4 z GAB cABG | .^F4 z4 z ABc dBcA |\n';
	theValue += '.B4 z4 z dcB AcBd | .c4 z4 z edc Bd^ce |\n';
	theValue += 'd2^c2d2e2 f2A2B2c2 | d2^F2^G2A2 B2c2 d4 |\n';
	theValue += 'z E^F^G AFGE edce dcBd | ca^gb aefd ^Gfed c/d/cBA |\n';
	theValue += 'Aagf egfa g8- | gefg afge f8 |\n';
	theValue += 'z gfe dfeg f8- | fdef gefd e8- |\n';
	theValue += "ecde fdec defg afge | fgab c'abg [Q:78]c'2g2 [Q:70]e/f/edc|\n";
	theValue += 'c_BAG [Q:62]FAGB [Q:54]A=BcE [Q:46]Dc[Q:28]FB | [EGc]16|]\n'; 
	theValue += 'V:2\n';
	theValue += '[Q:84]\n';	
	theValue += 'z8 z C,D,E, F,D,E,C, | G,2G,,2 z4 z G,A,B, CA,B,G, |\n'; 
	theValue += 'C2B,2C2D2 E2G,2A,2B,2 | C2E,2^F,2G,2 A,2B,2 C4- |\n';
	theValue += 'CD,E,^F, G,E,F,D, G,2B,,2C,2D,2 | E,2^F,2G,2E,2 B,,2>C,2 D,2D,,2 |\n';
	theValue += 'z G,,A,,B,, C,A,,B,,G,, D,2G,2^F,2G,2 | A,D,E,^F, G,E,F,D, A,2D2C2D2 |\n';
	theValue += 'G,GFE DFEG F2E2F2D2 | EAGF EGFA G2F2G2E2 |\n';
	theValue += 'F_BAG FAGB AGFE DFEG | FEDC B,DCE DCB,A, ^G,B,A,C |\n';
	theValue += 'B,2E,2D/C/.D3 CB,A,G, ^F,A,^G,B, | A,CB,D CEDF E2A,2E2E,2 |\n';
	theValue += 'A,2A,,2 z4 z EDC B,D^CE | D8- DA,B,C DB,CA, |\n';
	theValue += 'B,8- B,DCB, A,CB,D | C8- CG,A,_B, CA,B,G, |\n';
	theValue += 'A,2_B,2A,2G,2 F,2D2C2B,2 | A,2F2E2D2 ED,E,F, G,E,F,D, |\n';
	theValue += 'E,2C,2D,2E,2 F,D,E,F, [Q:46]G,2[Q:28]G,,2 | [C,,C,]16 |]\n';

	// Do common tune addition processing
	ProcessAddTune(theValue);

}

//
// Add the J.S. Bach Fantasia BWV570
//
function AppendJSBach2(){

	// Keep track of actions
	sendGoogleAnalytics("action","AppendJSBach2");

	// Stuff in some default ABC with additional options explained
	var theValue = ""

	var nTunes = CountTunes();

	if (nTunes > 0){
		theValue += "\n";
	}

	theValue += 'X:1\n';
	theValue += "%\n";
	theValue += "% Example J.S. Bach transcription originally imported from MusicXML\n";
	theValue += "%\n";	
	theValue += '% Click "Play" to play\n';
	theValue += "%\n";
	theValue += 'T:Fantasia\n';
	theValue += 'T:BWV570\n';
	theValue += 'T:Johann Sebastian Bach (1685-1750)\n';
	theValue += '%%score { 1 | 2 | 3 | 4 }\n';
	theValue += 'L:1/16\n';
	theValue += 'M:4/4\n';
	theValue += 'K:C\n';
	theValue += '%\n';
	theValue += '% Try changing the abcjs_soundfont value to\n';
	theValue += '% fluid, musyng, fatboy, canvas, or mscore for different organ sounds:\n';
	theValue += '%\n';	
	theValue += '%abcjs_soundfont fluid\n';	
	theValue += '%\n';		
	theValue += '%%stretchlast true\n';
	theValue += '%%staffsep 40\n';
	theValue += 'Q:100\n';
	theValue += '%\n';
	theValue += '% Try changing these to %%MIDI program mute\n';
	theValue += '% to isolate individual voices:\n';
	theValue += '%\n';
	theValue += 'V:1 treble\n';
	theValue += '%%MIDI program 19\n';
	theValue += 'V:2 treble\n';
	theValue += '%%MIDI program 19\n';
	theValue += 'V:3 bass\n';
	theValue += '%%MIDI program 19\n';
	theValue += 'V:4 bass\n';
	theValue += '%%MIDI program 19\n';
	theValue += 'V:1\n';
	theValue += 'G4 c6 d2 B4 | e6 f2 d6 e2 | c8- c2e2d2c2 | B2A2 B4 z2 e2g2e2 |\n';
	theValue += 'c2e2G2c2 A2c2d2e2 | f2e2d2c2 B2G2 c4- | c2dcB2cB A8- | A2Bc d6 efB2cd |\n';
	theValue += '^G6 AB A2Bcd2cd | B6 cB A6 B^G | c8- c2dc_B2cA | _B8- B2>G2A2GA |\n';
	theValue += 'F6 EF G2A_B A4- | A2Bc d6 Bcd2ef | e8- e2dc d4- | d2ef e6 fg f4- |\n';
	theValue += 'f2ga g6 ag f4- | f2gf e6 fe d4 | d8d8- | d2cB c6 dc B4 |\n';
	theValue += 'c4 z12 | z4 d8 c4- | c8 B4 _B4 | A4 B4 G8 |\n';
	theValue += 'A4 c4 B8 | c8c8 | f8 e8- | e6e6 d4- |\n';
	theValue += 'd4 d2ef g2agf2gf | e4 g6 ag f4- | f2gfe2fe d8 | g2agf2gf e6 fe |\n';
	theValue += 'd6 ed c6 dc | B4 c4 d4 e4- | e2fe d6 ef e4- | e2fe d6 efg2ab |\n';
	theValue += 'c2Bcd2ef B4 c4- | cdBd cdBd cedf egfa | gGAB c4- cede fdef | B2cd2<c2B c8- |\n';
	theValue += 'c8c8 | c16 |]\n';
	theValue += 'V:2\n';
	theValue += 'G8G8- | G2G2 c6 c2 B4- | B2B2 A6A6- | A4 G4 z8 |\n';
	theValue += 'z16 | z16 | z4 G4 E8 | F8F8- |\n';
	theValue += 'F2ED C4 E8- | E8E8- | E8 D8- | D2E^F G6 E2- E4- |\n';
	theValue += 'E2D^C D4 E6 ^FG | ^F6 EF G8- | G2AB c4 A6 Bc | B6 cd c6 de |\n';
	theValue += 'd6 ef e6 dc | d6 cB c6 BA | B8B8 | G6 FE F6 ED |\n';
	theValue += 'E6 FG A6 Bc | B8- B6 A^G | A8 G8 | F8 E6 FE |\n';
	theValue += 'D6 ED D4 G4 | G4 A6A6 | d8- d2cB c4- | c2dc c6 dc c4- |\n';
	theValue += 'c2BA B6 c4 B2 | c4 d4 c6 dc | B4 c6 BA B4 | c4 B6 cB A4- |\n';
	theValue += 'A2BA G6 AG ^F4 | G8 B4 c4- | c6 BA B6 cd | c6 BA B8 |\n';
	theValue += 'A8 G8- | G8G8- | G8G8- | G6G6 F4 |\n';
	theValue += 'G4 F6 GF EFDF | E16 |]\n';
	theValue += 'V:3\n';
	theValue += 'E8 D8- | D4 C4 D4 G4 | E8 D8- | D8 C8- |\n';
	theValue += 'C8 C8 | D6D6 E2FE | D8 ^C8 | D4 A,2B,C B,8- |\n';
	theValue += 'B,4 A,8 ^G,4- | G,2A,B, C6 B,A, B,4- | B,2A,^G,A,2E,=G, ^F,8 | G,6 A,_B,- B,4 A,4- |\n';
	theValue += 'A,8 _B,4 E,4 | A,8 G,8- | G,6 E,C, ^F,6 D,2 | G,8G,8- |\n';
	theValue += 'G,8G,8- | G,8G,8- | G,2G,A,B,2CD G,2A,B,D,2E,F, | E,4 A,4 D,4 G,4- |\n';
	theValue += 'G,2A,B, C6 DE F4- | F8 E8- | E4 D8 C4- | C4 D6 CB, C4- |\n';
	theValue += 'C2B,C A,4 B,4 E4- | E8 F8- | F4 G6G6 | A8A8 |\n';
	theValue += 'G4 G2F2 E4 D4 | C2DCB,2CB, A,4 D4- | D4 E2C2 G6 FG | E2FED2ED C6 DC |\n';
	theValue += 'B,6 CB, A,2B,2 C4 | D4 E4 G8 | A4 D4 G8- | G8G8 |\n';
	theValue += 'E4 D8 E4- | E2D2E2D2 E2B,2C2D2 | E4- EEDC D8- | D4 F4 E4 C4|\n';
	theValue += 'z2 C_B,A,2G,F, G,6 F,2 | G,16 |]\n';
	theValue += 'V:4\n';
	theValue += 'C,2D,2E,2C,2 G,8- | G,8G,8 | A,6 G,2 ^F,8 | G,6 F,2 E,8- |\n';
	theValue += 'E,8 F,8- | F,4 ^F,4 G,8- | G,8- G,2A,_B,A,2G,A, | F,8 D,8 |\n';
	theValue += 'E,8E,8- | E,8E,8 | A,,8 D,8- | D,8 ^C,8 |\n';
	theValue += 'D,6D,6 ^C,4 | C,8 B,,8 | C,8 ^F,,8 | G,,8G,,8- |\n';
	theValue += 'G,,8G,,8- | G,,8G,,8- | G,,4 z12 | z16 |\n';
	theValue += 'C,6 D,E, F,6 G,A, | D,2E,F,B,,2C,D, ^G,,2E,,2 A,,4- | A,,2A,G,^F,2E,D, G,2D,=F,E,2D,C, | F,2C,E,D,2C,B,, E,8 |\n';
	theValue += 'F,4 ^F,4 G,2G,=F,E,2E,D, | C,2C,B,,A,,2A,,G,, F,,2A,,G,,F,,2F,,E,, | D,,2D,C,B,,2A,,G,, C,6 D,E, | A,,6 B,,C, F,,4 ^F,,2E,,F,, |\n';
	theValue += 'G,,4 z8 x4 | z16 | G,8G,8- | G,8G,8- |\n';
	theValue += 'G,8G,8- | G,2G,F,E,2D,C, B,,2A,,G,,F,,2E,,D,, | F,,4 F,4 G,8- | G,8G,8- |\n';
	theValue += 'G,4 F,6 G,F,E,2D,C, | G,8G,8- | G,8G,8- | G,8 C,2C_B,A,2G,F, |\n';
	theValue += 'E,4 F,4 C,8 | C,16 |]\n';


	// Do common tune addition processing
	ProcessAddTune(theValue);

}

// 
// Common code after template add
//
function ProcessAddTune(theValue){

	// Force scroll into view
	var theOriginalLength = gTheABC.value.length; 

	// Add the tune to the ABC
	gTheABC.value = gTheABC.value+theValue;

	// Set dirty
	gIsDirty = true;

	// Reset the displayed name base
	if (gDisplayedName != "No ABC file selected"){

		if (gDisplayedName.indexOf("+ added tunes") == -1){

			gDisplayedName = gDisplayedName + " + added tunes";

		}
	}

	RenderAsync(true,null,function(){

		UpdateNotationTopPosition();

		// No autoscroll on mobile
		if (isMobileBrowser()){
			return;
		}

		var nTunes = CountTunes();

		var theTune = getTuneByIndex(nTunes-1);

		var tuneOffset = theOriginalLength+(theTune.length / 2);

		if (!gIsMaximized){

			// Scroll the tune ABC into view
		    gTheABC.selectionEnd = gTheABC.selectionStart = tuneOffset;
	    	gTheABC.blur();
	    	gTheABC.focus();

	    }

		// Scroll the tune into view
		MakeTuneVisible(true);
		
	});
}


//
// Click handler for render divs
// Finds the tune by notation div id and then scrolls the ABC into view
//
function RenderDivClickHandler(e){

	if (gRenderingPDF){
		return;
	}

	var thisID = this.id;

	if (thisID && (thisID != "") && (thisID.indexOf("notation")==0)){

		var clickedTune = this.id.replace("notation","");

		if (clickedTune != ""){

			var clickedTuneIndex = parseInt(clickedTune);

			var tuneOffset = findTuneOffsetByIndex(clickedTuneIndex);

			//console.log("Tune index = "+clickedTuneIndex+" offset = "+tuneOffset);

			// Scroll to the middle of the tune
			var theTune = getTuneByIndex(clickedTuneIndex);

			tuneOffset += (theTune.length / 2);

			if (!gIsMaximized){

				// Scroll the tune ABC into view
			    gTheABC.selectionEnd = gTheABC.selectionStart = tuneOffset;
		    	gTheABC.blur();
		    	gTheABC.focus();

		    }
		    else{

		    	// Save the click info for later minimize
		    	gGotRenderDivClick = true;
		    	gRenderDivClickOffset = tuneOffset;

		    }
		}
	}

}

// 
// Generate the rendering divs
//
function GenerateRenderingDivs(nTunes) {

	// Clear the div
	var notationHolder = gTheNotation;
	notationHolder.innerHTML = "";

	for (var i = 0; i < nTunes; ++i) {

		var el = document.createElement('div');

		el.id = "notation" + i;

		// Space the tunes out a bit
		el.classList.add("tunespacer");

		// Force page break between tunes when printing from the browser
		el.classList.add("pagebreak");

		// Only do this on desktop
		if (isDesktopBrowser()){

			// Set up the click handler
			el.onclick = RenderDivClickHandler;

		}

		notationHolder.appendChild(el);

	}

}

//
// Share URL related code provided by Philip McGarvey
//
function getUrlWithoutParams() {

	return window.location.protocol + "//" + window.location.host + window.location.pathname;

}

//
// Generate a share link for either all the tunes or just what's passed in
//
function FillUrlBoxWithAbcInLZW(ABCtoEncode,bUpdateUI) {

	// Encode all the tunes or just what's passed in?
	var abcText = "";

	if (!ABCtoEncode){
		abcText = gTheABC.value;
	}
	else{
		abcText = ABCtoEncode;		
	}

	var abcInLZW = LZString.compressToEncodedURIComponent(abcText);

	var format = GetRadioValue("notenodertab");

	var capo = gCapo;

	var ssp = gStaffSpacing-STAFFSPACEOFFSET;

	var pdfformat = document.getElementById("pdfformat").value;

	var pagenumbers = document.getElementById("pagenumbers").value;

	var firstpage = document.getElementById("firstpage").value;

	var url = getUrlWithoutParams() + "?lzw=" + abcInLZW + "&format=" + format + "&ssp=" + ssp + "&pdf=" + pdfformat + "&pn=" + pagenumbers + "&fp=" + firstpage;

	// Add a capo parameter for mandolin and guitar
	var postfix = "";

	switch (format){

		case "noten":
		case "notenames":
		case "whistle":
			break;

		case "mandolin":
		case "gdad":
		case "mandola":
		case "guitare":
		case "guitard":
		case "bass":

			postfix = "&capo=" + capo;

			// Convey show tab names status
			if (gShowTabNames){

				postfix += "&stn=true";

			}
			else{

				postfix += "&stn=false";
				
			}

			break;
	}

	url += postfix;

	// If just encoding some ABC, return it now
	if (ABCtoEncode){
		return url;
	}

	// Add the tune set name
	var theTuneCount = CountTunes();

	var theName = getDescriptiveFileName(theTuneCount,false);

	url += "&name=" + theName;

	// Hide the QR code
	document.getElementById("qrcode").style.display = "none";

	// First disallow all sharing until valid URL validated
	gAllowURLSave = false;
	gAllowQRCodeSave = false;

	// GoDaddy web servers have a maximum URL length
	if (url.length < 8100) {

		gAllowURLSave = true;

		// If fits in a QR code, show the QR code button
		var maxURLLength = MAXQRCODEURLLENGTH;
		
		if (url.length < maxURLLength) {
			gAllowQRCodeSave = true;
		}

	}

	if (bUpdateUI){

		var urltextbox = document.getElementById("urltextbox");

		if (!gAllowURLSave) {

			url = " *** The URL link would be too long to share. Please try sharing fewer tunes. ***";

			document.getElementById("generateqrcode").classList.remove("urlcontrols");
			document.getElementById("generateqrcode").classList.add("urlcontrolsdisabled");

			document.getElementById("shortenurl").classList.remove("urlcontrols");
			document.getElementById("shortenurl").classList.add("urlcontrolsdisabled");

			document.getElementById("testurl").classList.remove("urlcontrols");
			document.getElementById("testurl").classList.add("urlcontrolsdisabled");

			document.getElementById("copyurl").classList.remove("urlcontrols");
			document.getElementById("copyurl").classList.add("urlcontrolsdisabled");

			document.getElementById("saveurl").classList.remove("urlcontrols");
			document.getElementById("saveurl").classList.add("urlcontrolsdisabled");


		} else {

			document.getElementById("testurl").classList.remove("urlcontrolsdisabled");
			document.getElementById("testurl").classList.add("urlcontrols");

			document.getElementById("saveurl").classList.remove("urlcontrolsdisabled");
			document.getElementById("saveurl").classList.add("urlcontrols");

			document.getElementById("copyurl").classList.remove("urlcontrolsdisabled");
			document.getElementById("copyurl").classList.add("urlcontrols");

			document.getElementById("shortenurl").classList.remove("urlcontrolsdisabled");
			document.getElementById("shortenurl").classList.add("urlcontrols");
		
			if (gAllowQRCodeSave) {

				document.getElementById("generateqrcode").classList.remove("urlcontrolsdisabled");
				document.getElementById("generateqrcode").classList.add("urlcontrols");

			} else {

				document.getElementById("generateqrcode").classList.remove("urlcontrols");
				document.getElementById("generateqrcode").classList.add("urlcontrolsdisabled");

			}
		}

		urltextbox.value = url;

	}

	return url;
}

function CreateURLfromHTML() {

	FillUrlBoxWithAbcInLZW(null,true);

	urltextbox = document.getElementById("urltextbox");
	urltextbox.focus();
	urltextbox.setSelectionRange(0, 0);

	// Clear the QR code
	clearQRCode();

}

//
// Generate a QR code from the share URL
//
// Shift-click allows generic creation of QR codes, as long as the value is not too long to fit 
//

function clearQRCode() {

	if (gTheQRCode) {
		gTheQRCode.clear();
	}

}

function GenerateQRCode(e) {

	// Keep track of dialogs
	sendGoogleAnalytics("sharing","generate_qr_code");

	var isShiftOverride = false;

	var theURL = document.getElementById("urltextbox").value;

	// Shift-click allows generic QR code generation
	if (e.shiftKey){

		var maxURLLength = MAXQRCODEURLLENGTH;
	
		if (theURL.length > maxURLLength) {

			DayPilot.Modal.alert('<p style="text-align:center;font-family:helvetica;font-size:14pt;">Share URL text is too long to generate a QR Code</p>',{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

			return;

		}

		isShiftOverride = true;

	}
	else{

		// Normal QR code generation

		if (!gAllowQRCodeSave){

			return;
		}

	}


	if (gTheQRCode == null) {

		gTheQRCode = new QRCode(document.getElementById("qrcode"), {
			text: theURL,
			width: 548,
			height: 548,
			colorDark: "#000000",
			colorLight: "#ffffff",
			border: 16,
    		correctLevel : QRCode.CorrectLevel.M 
		});

	} else {

		gTheQRCode.clear();

		gTheQRCode.makeCode(theURL);

	}

	document.getElementById("qrcode").style.display = "inline-block";

	// Find the image
	theQRCodeImage = document.querySelectorAll('div[id="qrcode"] > img');

	var theTitles = "Custom QR Code";
	var theImageName = "custom_qr_code";

	if (theQRCodeImage && (theQRCodeImage.length > 0)) {

		if (!isShiftOverride){

			// Get all the titles of the tunes in the text area
			theTitles = GetAllTuneTitles();

			// Get the current instrument setting
			var theTab = GetRadioValue("notenodertab");

			var postfix = "";

			switch (theTab){
				case "noten":
					postfix = "<br/><br/>(Standard Notation)";
					break;
				case "notenames":
					postfix = "<br/><br/>(Note Names Tab)";
					break;
				case "mandolin":
					postfix = "<br/><br/>(Mandolin Tab";
					if (gCapo != 0){
						postfix += " - Capo on "+gCapo;
					}
					postfix += ")";
					break;
				case "gdad":
					postfix = "<br/><br/>(Bouzouki GDAD Tab";
					if (gCapo != 0){
						postfix += " - Capo on "+gCapo;
					}
					postfix += ")";
					break;
				case "mandola":
					postfix = "<br/><br/>(Mandola Tab";
					if (gCapo != 0){
						postfix += " - Capo on "+gCapo;
					}
					postfix += ")";
					break;
				case "guitare":
					postfix = "<br/><br/>(Standard Guitar Tab";
					if (gCapo != 0){
						postfix += " - Capo on "+gCapo;
					}
					postfix += ")";
					break;
				case "guitard":
					postfix = "<br/><br/>(DADGAD Guitar Tab";
					if (gCapo != 0){
						postfix += " - Capo on "+gCapo;
					}
					postfix += ")";
					break;
				case "bass":
					postfix = "<br/><br/>(Bass Tab";
					if (gCapo != 0){
						postfix += " - Capo on "+gCapo;
					}
					postfix += ")";
					break;
				case "whistle":
					postfix = "<br/><br/>(Whistle Tab)";
					break;
			}

			theTitles += postfix;

			var theTuneCount = CountTunes();

			// Derive a suggested name from the ABC
			theImageName = getDescriptiveFileName(theTuneCount,true);

		}
		
		// Get the QR code image
		theQRCodeImage = theQRCodeImage[0];

		var w = window.open("");

		setTimeout(function() {

			var theImageSource = theQRCodeImage.src;

			var theImageHTML = theQRCodeImage.outerHTML.replace("display: block;","");

			var theOutputHTML = '<div style="text-align:center;padding:24px;margin-top:0px;margin-bottom:0px;">';
			theOutputHTML +=    theImageHTML;
			theOutputHTML +=    '<p style="font-family:times;font-size:15pt;margin-top:18px;margin-bottom:0px;">' + theTitles + '</p>';			
			theOutputHTML +=    '<p style="font-family:times;font-size:16pt;margin-top:32px;margin-bottom:0px;"><strong>Get Your QR Code</strong></p>';
			theOutputHTML +=    '<p style="font-family:times;font-size:16pt;margin-top:32px;margin-bottom:0px;"><a href="'+theImageSource+'" download="'+theImageName+'.png" style="text-decoration:none;color:darkblue">Click here to download&nbsp;' + theImageName +'.png&nbsp;to your system.</a></p>';
			theOutputHTML +=    '<p style="font-family:times;font-size:16pt;margin-top:32px;margin-bottom:0px;"><strong>Use Your QR Code</strong></p>';
			theOutputHTML +=    '<p style="font-family:times;font-size:15pt;margin-top:30px;margin-bottom:0px;">Share QR Codes on social media or email them to friends like any other photo.</p>';
			theOutputHTML +=    '<p style="font-family:times;font-size:15pt;margin-top:24px;margin-bottom:0px;">Scanning the code with the Camera app on any iOS or Android phone will load the</p>';
			theOutputHTML +=    '<p style="font-family:times;font-size:15pt;margin-top:6px;margin-bottom:0px;">ABC Transcription Tool with your tune set into the browser on the device.</p>';
			theOutputHTML +=    '</div>';

			w.document.write(theOutputHTML);

			setTimeout(function(){

	        	w.document.title = "ABC Tools Tune Sharing QR Code";

	        }, 100);

		}, 1000);

	}

}

//
// Save the ABC file
//
function saveABCFile(thePrompt, thePlaceholder, theData){

	DayPilot.Modal.prompt(thePrompt, thePlaceholder,{ theme: "modal_flat", top: 200, autoFocus: false, scrollWithPage: (AllowDialogsToScroll()) }).then(function(args) {

		var fname = args.result;

		// If the user pressed Cancel, exit
		if (fname == null){
		  return null;
		}

		// Strip out any naughty HTML tag characters
		fname = fname.replace(/[^a-zA-Z0-9_\-. ]+/ig, '');

		if (fname.length == 0){
		  return null;
		}      

		// Give it a good extension
		if (isDesktopBrowser()){

			if ((!fname.endsWith(".abc")) && (!fname.endsWith(".txt")) && (!fname.endsWith(".ABC")) && (!fname.endsWith(".TXT"))){

				// Give it a good extension
				fname = fname.replace(/\..+$/, '');
				fname = fname + ".abc";

			}
		}
		else{
			// iOS and Android have odd rules about text file saving
			// Give it a good extension
			fname = fname.replace(/\..+$/, '');
			fname = fname + ".txt";

		}

		var a = document.createElement("a");

		document.body.appendChild(a);

		a.style = "display: none";

		var blob = new Blob([theData], {type: "text/plain"}),

		url = window.URL.createObjectURL(blob);
		a.href = url;
		a.download = fname;
		a.click();

		document.body.removeChild(a);

		setTimeout(function() {
		  window.URL.revokeObjectURL(url);
		}, 1000);		

		// Update the displayed name
		gDisplayedName = fname;

		// Mark ABC as from a file
		gABCFromFile = true;

		// Update the displayed filename
		var fileSelected = document.getElementById('abc-selected');
		fileSelected.innerText = fname;

		// Clear the dirty count
		gIsDirty = false;

	});
}

//
// Save a text file
//
function saveTextFile(thePrompt, thePlaceholder, theData){

	DayPilot.Modal.prompt(thePrompt, thePlaceholder,{ theme: "modal_flat", top: 200, autoFocus: false, scrollWithPage: (AllowDialogsToScroll()) }).then(function(args) {

		var fname = args.result;

		// If the user pressed Cancel, exit
		if (fname == null){
		  return null;
		}

		// Strip out any naughty HTML tag characters
		fname = fname.replace(/[^a-zA-Z0-9_\-. ]+/ig, '');

		if (fname.length == 0){
		  return null;
		}      

		// Give it a good extension
		if (isDesktopBrowser()){

			if ((!fname.endsWith(".txt")) && (!fname.endsWith(".TXT"))){

				// Give it a good extension
				fname = fname.replace(/\..+$/, '');
				fname = fname + ".txt";

			}
		}
		else{
			// iOS and Android have odd rules about text file saving
			// Give it a good extension
			fname = fname.replace(/\..+$/, '');
			fname = fname + ".txt";
		}

		var a = document.createElement("a");

		document.body.appendChild(a);

		a.style = "display: none";

		var blob = new Blob([theData], {type: "text/plain"}),

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
// Override MIDI program number directive 
//
function OverrideOneTuneMIDIParams(theTune, melodyProg, chordProg, bassVol, chordVol){

	var theOutput = theTune;

	// Replace melody programs
	var searchRegExp = /^%%MIDI program.*$/gm

	var melodyProgramRequested = theTune.match(searchRegExp);

	if ((melodyProgramRequested) && (melodyProgramRequested.length > 0)){

		for (var i=0;i<melodyProgramRequested.length;++i){

			theOutput = theOutput.replace(melodyProgramRequested[i],"%%MIDI program "+melodyProg);

		}

	}

	// Replace chord programs
	searchRegExp = /^%%MIDI chordprog.*$/gm

	var chordProgramRequested = theTune.match(searchRegExp);

	if ((chordProgramRequested) && (chordProgramRequested.length > 0)){

		for (var i=0;i<chordProgramRequested.length;++i){

			theOutput = theOutput.replace(chordProgramRequested[i],"%%MIDI chordprog "+chordProg);
		}

	}

	// Replace bass volume
	searchRegExp = /^%%MIDI bassvol.*$/gm

	var bassVolumeRequested = theTune.match(searchRegExp);

	if ((bassVolumeRequested) && (bassVolumeRequested.length > 0)){

		for (var i=0;i<bassVolumeRequested.length;++i){

			theOutput = theOutput.replace(bassVolumeRequested[i],"%%MIDI bassvol "+bassVol);
		}

	}

	// Replace chord volume
	searchRegExp = /^%%MIDI chordvol.*$/gm

	var chordVolumeRequested = theTune.match(searchRegExp);

	if ((chordVolumeRequested) && (chordVolumeRequested.length > 0)){

		for (var i=0;i<chordVolumeRequested.length;++i){

			theOutput = theOutput.replace(chordVolumeRequested[i],"%%MIDI chordvol "+chordVol);
		}

	}

	return theOutput;
	
}


//
// Find all text before the first tune 
//
function FindPreTuneHeader(theABC){

	var theResult;

	var searchRegExp = /^X:.*[\r\n]*/m 

	var firstTuneIndex = theABC.search(searchRegExp);

	// No tunes, or first string is a tune so no header
	if ((firstTuneIndex == -1) || (firstTuneIndex == 0)){

		return "";

	}
	else{

		theResult = theABC.substring(0,firstTuneIndex);

	} 

	return theResult;
}



//
// Inject two bar intro click tracks into all the tunes
//
function InjectRepeatsAndClickTrackAll(){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","InjectRepeatsAndClickTrackAll");

	var nTunes = CountTunes();

	if (nTunes == 0){
		return;
	}

	// Setup initial values
	const theData = {
	  configure_repeats:1,
	  configure_inject_click:false
	};

	const form = [
	  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:50px;">Inject Repeats and Two-Bar Click Intros&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#injectrepeatsandtwobarclickintros" target="_blank" style="text-decoration:none;">💡</a></span></p>'},
	  {html: '<p style="margin-top:36px;margin-bottom:36px;font-size:12pt;line-height:18pt;font-family:helvetica">This will inject repeats into each tune in the ABC area by  appending the entire ABC for each tune to itself multiple times.</p>'},	  
	  {html: '<p style="margin-top:36px;margin-bottom:36px;font-size:12pt;line-height:18pt;font-family:helvetica">You may also optionally inject a two-bar click intro before each tune.</p>'},	  
	  {name: "How many times through each tune:", id: "configure_repeats", type:"number", cssClass:"configure_repeats_form_text"}, 
	  {name: "            Inject a two-bar style-appropriate click intro before each tune", id: "configure_inject_click", type:"checkbox", cssClass:"configure_repeats_form_text"},
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:18pt;font-family:helvetica"><strong>To only append a two-bar click intro before each tune:</strong></p>'},	  
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:18pt;font-family:helvetica">1) Set <strong>How many times through each tune:</strong> to 1</p>'},	  
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:18pt;font-family:helvetica">2) Check <strong>Inject a two-bar style-appropriate click intro before each tune</strong>.</p>'},	  
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:18pt;font-family:helvetica">3) Click <strong>OK</strong>.</p>'},	  
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:18pt;font-family:helvetica"><strong>For best results when repeating tunes:<strong></p>'},	  
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:18pt;font-family:helvetica">For clean repeats, your tunes must not have extraneous pickup or trailing notes and must have proper and complete timing.</p>'},	  
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:18pt;font-family:helvetica">If there is a repeat at the end of the first part of a tune, either standalone or in a first ending, there must be a matching |: bar at the start of the tune for the tune repeats to work properly.</p>'},	  
	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 100, width: 760, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){
		
		if (!args.canceled){
		
			var repeatCountStr = args.result.configure_repeats;

			if (repeatCountStr == null){
				return;
			}

			repeatCount = parseInt(repeatCountStr);

			if ((isNaN(repeatCount)) || (repeatCount == undefined)){
				return;
			}

			if (repeatCount < 1){
				return;
			}

			var doClickTrack = args.result.configure_inject_click;

			var theNotes = gTheABC.value;

			var output = FindPreTuneHeader(theNotes);

			for (var i=0;i<nTunes;++i){

				var thisTune = getTuneByIndex(i);

				var rhythmType = getTuneRhythmType(thisTune);

				thisTune = AddDuplicatesForMp3(thisTune, rhythmType, repeatCount, doClickTrack);

				output += thisTune;

				output += "\n\n";

			}

			// Stuff in the output
			gTheABC.value = output;

			// Set dirty
			gIsDirty = true;

			// Force a redraw
			RenderAsync(true,null,function(){

				// Set the select point
				gTheABC.selectionStart = 0;
			    gTheABC.selectionEnd = 0;
				
			    // Focus after operation
			    FocusAfterOperation();

			});
		}
	});
}


//
// Conditionally injects a string above the tune header if it doesn't already exist in the tune
//
function InjectStringAboveTuneHeaderConditional(theTune, theDirective){

	if (theTune.indexOf(theDirective) == -1){

		return InjectStringAboveTuneHeader(theTune, theDirective);

	}
	else{

		return theTune;

	}

}

//
// Inject a string below the X: and above the rest of the header
//
function InjectStringAboveTuneHeader(theTune, theDirective) {

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
// Conditionally injects a string above the tune header if it doesn't already exist in the tune
//
function InjectStringBelowTuneHeaderConditional(theTune, theDirective){

	if (theTune.indexOf(theDirective) == -1){

		return InjectStringBelowTuneHeader(theTune, theDirective);

	}
	else{

		return theTune;
		
	}
}

//
// Inject anything just below the header
//
function InjectStringBelowTuneHeader(theTune,theString){

	// Don't inject section header tune fragments
	if (isSectionHeader(theTune)){
		return theTune;
	}

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
// Inject MIDI staff width 
//
function InjectOneTuneStaffWidth(theTune, staffwidth){

	theOutput = InjectStringBelowTuneHeader(theTune, "%%staffwidth "+staffwidth);
	
	return theOutput;
	
}

//
// Inject MIDI soundfont 
//
function InjectOneTuneSoundfont(theTune, theSoundfont){

	theOutput = InjectStringBelowTuneHeader(theTune, "% Soundfont: "+theSoundfont+"\n"+"%abcjs_soundfont "+theSoundfont);
	
	return theOutput;
	
}


//
// Inject a section header placeholder tune
//

function InjectSectionHeader(){

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","InjectSectionHeader");

	// Setup initial values
	const theData = {
	  configure_sectionheader:"Section Name",
	};

	var form = [
	  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:50px;">Inject PDF Tunebook Section Header&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#pdf_section_headers" target="_blank" style="text-decoration:none;">💡</a></span></p>'},
	  {html: '<p style="margin-top:36px;font-size:12pt;line-height:18pt;font-family:helvetica">This will inject a PDF section header placeholder tune into the ABC.</p>'},  
	  {html: '<p style="font-size:12pt;line-height:18pt;font-family:helvetica">The section header will be displayed on its own line in the PDF Table of Contents and Index.</p>'}, 
	  {html: '<p style="font-size:12pt;line-height:18pt;font-family:helvetica">Clicking on the section header in the PDF Table of Contents or Index will jump to the section.</p>'}, 
	  {html: '<p style="margin-bottom:36px;font-size:12pt;line-height:18pt;font-family:helvetica">The * at the start of the injected tune title marks the tune as a PDF section header.</p>'}, 
	  {name: "Section name to inject", id: "configure_sectionheader", type:"text", cssClass:"configure_sectionheader_form_text"}, 
	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 100, width: 760, scrollWithPage: (AllowDialogsToScroll()), autoFocus: true } ).then(function(args){
		
		if (!args.canceled){

			var sectionHeader = args.result.configure_sectionheader;

			if (sectionHeader == null){
				return;
			}

			var theSelectionStart = gTheABC.selectionStart;

			var leftSide = gTheABC.value.substring(0,theSelectionStart);
			
			var rightSide = gTheABC.value.substring(theSelectionStart);

			gTheABC.value = leftSide + "\nX:1\nT:*" + sectionHeader + "\n" + rightSide;

			// Set dirty
			gIsDirty = true;

			// Force a redraw
			RenderAsync(true,null,function(){

				// Set the select point
				gTheABC.selectionStart = theSelectionStart;
			    gTheABC.selectionEnd = theSelectionStart;

			    // Focus after operation
			    FocusAfterOperation();

			});

		}
	});
}

//
// Inject a string into the top or bottom of the tune header
//

function InjectHeaderString(){

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	var theSelectedTuneIndex = findSelectedTuneIndex();

    const inject_location_list = [
	    { name: "  Top", id: 0 },
	    { name: "  Bottom", id: 1 }
  	];

	// Setup initial values
	const theData = {
	  injectlocation:1,
	  injectstring:"",
	  injectalltunes: false
	};

	var form = [
	  {html: '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:50px;">Inject ABC Header String&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#advanced_controls" target="_blank" style="text-decoration:none;">💡</a></span></p>'},  
	  {html: '<p style="margin-top:24px;margin-bottom:36px;font-size:12pt;line-height:18pt;font-family:helvetica;text-align:center">Clicking "OK" will inject the string into the header of your ABC tune(s).</p>'},  
	  {name: "Header inject location:", id: "injectlocation", type:"select", options:inject_location_list, cssClass:"configure_injectheaderstring_select"},
	  {name: "String to inject:", id: "injectstring", type:"text", cssClass:"configure_injectheaderstring_form_text"},
	  {name: "          Inject all tunes", id: "injectalltunes", type:"checkbox", cssClass:"configure_injectheaderstring_form_text"},
	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 100, width: 650, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){
		
		// Keep track of dialogs
		sendGoogleAnalytics("action","InjectHeaderString");
	
		if (!args.canceled){

			var theLocation = args.result.injectlocation;
			var injectAllTunes = args.result.injectalltunes;
			var stringToInject = args.result.injectstring;

			if (stringToInject != ""){

				// Injecting all tunes?
				if (injectAllTunes){

					var nTunes = CountTunes();

					var theNotes = gTheABC.value;

					// Find the tunes
					var theTunes = theNotes.split(/^X:/gm);

					var output = FindPreTuneHeader(theNotes);

					for (var i=1;i<=nTunes;++i){

						var theTune = "X:"+theTunes[i];

						if (theLocation == 0){

							output += InjectStringAboveTuneHeader(theTune,stringToInject);

						}
						else{

							output += InjectStringBelowTuneHeader(theTune,stringToInject);

						}

					}

					// Stuff in the output
					gTheABC.value = output;
					
					// Set dirty
					gIsDirty = true;

					// Force a redraw
					RenderAsync(true,null,function(){

						// Set the select point
						gTheABC.selectionStart = 0;
					    gTheABC.selectionEnd = 0;

					    // Focus after operation
					    FocusAfterOperation();

					});
				}
				else{

					// Try to find the current tune
					var theSelectedABC = findSelectedTune();

					if (theSelectedABC == ""){
						// This should never happen
						return;
					}

					var theInjectedTune = theSelectedABC;

					if (theLocation == 0){

						theInjectedTune = InjectStringAboveTuneHeader(theInjectedTune,stringToInject);

					}
					else{

						theInjectedTune = InjectStringBelowTuneHeader(theInjectedTune,stringToInject);

					}

					// Seeing extra line breaks after the inject
					theInjectedTune = theInjectedTune.replace("\n\n","");

					// Try and keep the same tune after the redraw for immediate play
					var theSelectionStart = gTheABC.selectionStart;

					// Stuff in the injected ABC
					var theABC = gTheABC.value;
					theABC = theABC.replace(theSelectedABC,theInjectedTune);

					gTheABC.value = theABC;

					// Set dirty
					gIsDirty = true;

					// Force a redraw of the tune
					RenderAsync(false,theSelectedTuneIndex,function(){

						// Set the select point
						gTheABC.selectionStart = theSelectionStart;
					    gTheABC.selectionEnd = theSelectionStart;

					    // Focus after operation
					    FocusAfterOperation();

					});


				}
			}
		}
	});
}


//
// Inject a %%staffwidth directive into one or all tunes
//

var gLastInjectedStaffWidth = 560;

function InjectStaffWidth(){

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","InjectStaffWidth");

	// Setup initial values
	const theData = {
	  configure_staffwidth:gLastInjectedStaffWidth,
	  configure_inject_all:false
	};

	var form = [
	  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:50px;">Inject Staff Width Directive&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#pdf_tunebook_spacing_overrides" target="_blank" style="text-decoration:none;">💡</a></span></p>'},
	  {html: '<p style="margin-top:36px;margin-bottom:36px;font-size:12pt;line-height:18pt;font-family:helvetica">This will inject a %%staffwidth directive into the ABC. </p>'},  
	  {html: '<p style="margin-top:36px;margin-bottom:36px;font-size:12pt;line-height:18pt;font-family:helvetica">Larger numbers make the notation less tall. </p>'},  
	  {name: "%%staffwidth value to inject?", id: "configure_staffwidth", type:"number", cssClass:"configure_staffwidth_form_text"}, 
	  {name: "            Inject all tunes", id: "configure_inject_all", type:"checkbox", cssClass:"configure_staffwidth_form_text"},
	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 100, width: 600, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){
		
		if (!args.canceled){

			var staffwidthstr = args.result.configure_staffwidth;

			if (staffwidthstr == null){
				return;
			}

			var staffwidth = parseInt(staffwidthstr);

			if ((isNaN(staffwidth)) || (staffwidth == undefined)){
				return;
			}

			// Time saver for next use
			gLastInjectedStaffWidth = staffwidth;

			// Injecting all tunes
			if (args.result.configure_inject_all){

				var nTunes = CountTunes();

				var theNotes = gTheABC.value;

				// Find the tunes
				var theTunes = theNotes.split(/^X:/gm);

				var output = FindPreTuneHeader(theNotes);

				for (var i=1;i<=nTunes;++i){

					theTunes[i] = "X:"+theTunes[i];

					output += InjectOneTuneStaffWidth(theTunes[i],staffwidth);

				}

				// Stuff in the output
				gTheABC.value = output;

				// Set dirty
				gIsDirty = true;

				// Force a redraw
				RenderAsync(true,null,function(){

					// Set the select point
					gTheABC.selectionStart = 0;
				    gTheABC.selectionEnd = 0;

				    // Focus after operation
				    FocusAfterOperation();

				});
			}
			else{

				var theSelectionStart = gTheABC.selectionStart;

				var leftSide = gTheABC.value.substring(0,theSelectionStart);
				
				var rightSide = gTheABC.value.substring(theSelectionStart);

				gTheABC.value = leftSide + "%%staffwidth " + staffwidth + "\n" + rightSide;

				// Set dirty
				gIsDirty = true;

				// Force a redraw
				RenderAsync(true,null,function(){

					// Set the select point
					gTheABC.selectionStart = theSelectionStart;
				    gTheABC.selectionEnd = theSelectionStart;

				    // Focus after operation
				    FocusAfterOperation();

				});

			}

		}
	});
}

//
// Inject MIDI program number directive below the tune header
//
function InjectOneTuneMIDIProgram(theTune, progNum, bIsChords){

	var thePatchName;

	var toInject = "";

	if (progNum == "mute"){

		thePatchName = "Mute";

	} 
	else{

		thePatchName = generalMIDISoundNames[progNum+1];

	}

	if (bIsChords){

		toInject = "% Bass/Chord program: "+thePatchName+"\n"+"%%MIDI chordprog " + progNum;
	}
	else{
		toInject = "% Melody program: "+thePatchName+"\n"+"%%MIDI program " + progNum;
	}

	if (bIsChords){

		theOutput = InjectStringBelowTuneHeader(theTune,toInject);

	}
	else{

		theOutput = InjectStringBelowTuneHeader(theTune,toInject);

	}
	
	return theOutput;
	
}

//
// Inject MIDI bass/chord number and optional volume directives below the tune header
//
function InjectOneTuneMIDIBassChordProgramAndVolumes(theTune, progNum, bassVol, chordVol){

	var thePatchName;

	var toInject = "";

	if (progNum == "mute"){

		thePatchName = "Mute";

	} 
	else{

		thePatchName = generalMIDISoundNames[progNum+1];

	}

	toInject = "% Bass/Chords program: "+thePatchName+"\n"+"%%MIDI chordprog " + progNum;

	toInject += "\n%%MIDI bassvol " + bassVol + "\n" + "%%MIDI chordvol " + chordVol;


	theOutput = InjectStringBelowTuneHeader(theTune,toInject);

	
	return theOutput;
	
}

//
// Inject MIDI program number directive above the tune header
//
function InjectOneTuneMIDIProgramAboveTune(theTune, progNum, bIsChords){

	if (bIsChords){

		theOutput = InjectStringAboveTuneHeader(theTune,"%%MIDI chordprog "+progNum);

	}
	else{

		theOutput = InjectStringAboveTuneHeader(theTune,"%%MIDI program "+progNum);

	}
	
	return theOutput;
	
}

//
// Inject MIDI volume directive below the tune header
//
function InjectOneTuneMIDIVolume(theTune, theVolume, bIsChords){


	if (bIsChords){

		theOutput = InjectStringBelowTuneHeader(theTune,"%%MIDI chordvol "+theVolume);

	}
	else{

		theOutput = InjectStringBelowTuneHeader(theTune,"%%MIDI bassvol "+theVolume);

	}
	
	return theOutput;
	
}

//
// Inject MIDI volume directive above the tune header
//
function InjectOneTuneMIDIVolumeAboveTune(theTune, theVolume, bIsChords){


	if (bIsChords){

		theOutput = InjectStringAboveTuneHeader(theTune,"%%MIDI chordvol "+theVolume);

	}
	else{

		theOutput = InjectStringAboveTuneHeader(theTune,"%%MIDI bassvol "+theVolume);

	}
	
	return theOutput;
	
}



//
// Inject MIDI soundfont and instrument related directives
//

const soundfontNames = [
	"Fluid",
	"Musyng Kite",
	"FatBoy",
	"Canvas",
	"MScore"
];

const generalMIDISoundNames = [
  "Mute",
  "Acoustic Grand Piano",
  "Bright Acoustic Piano",
  "Electric Grand Piano",
  "Honky-tonk Piano",
  "Electric Piano 1",
  "Electric Piano 2",
  "Harpsichord",
  "Clavi",
  "Celesta",
  "Glockenspiel",
  "Music Box",
  "Vibraphone",
  "Marimba",
  "Xylophone",
  "Tubular Bells",
  "Dulcimer",
  "Drawbar Organ",
  "Percussive Organ",
  "Rock Organ",
  "Church Organ",
  "Reed Organ",
  "Accordion",
  "Harmonica",
  "Tango Accordion",
  "Acoustic Guitar (nylon)",
  "Acoustic Guitar (steel)",
  "Electric Guitar (jazz)",
  "Electric Guitar (clean)",
  "Electric Guitar (muted)",
  "Overdriven Guitar",
  "Distortion Guitar",
  "Guitar Harmonics",
  "Acoustic Bass",
  "Electric Bass (finger)",
  "Electric Bass (pick)",
  "Fretless Bass",
  "Slap Bass 1",
  "Slap Bass 2",
  "Synth Bass 1",
  "Synth Bass 2",
  "Violin",
  "Viola",
  "Cello",
  "Contrabass",
  "Tremolo Strings",
  "Pizzicato Strings",
  "Orchestral Harp",
  "Timpani",
  "String Ensemble 1",
  "String Ensemble 2",
  "SynthStrings 1",
  "SynthStrings 2",
  "Choir Aahs",
  "Voice Oohs",
  "Synth Voice",
  "Orchestra Hit",
  "Trumpet",
  "Trombone",
  "Tuba",
  "Muted Trumpet",
  "French Horn",
  "Brass Section",
  "SynthBrass 1",
  "SynthBrass 2",
  "Soprano Sax",
  "Alto Sax",
  "Tenor Sax",
  "Baritone Sax",
  "Oboe",
  "English Horn",
  "Bassoon",
  "Clarinet",
  "Piccolo",
  "Flute",
  "Recorder",
  "Pan Flute",
  "Blown Bottle",
  "Shakuhachi",
  "Whistle",
  "Ocarina",
  "Lead 1 (square)",
  "Lead 2 (sawtooth)",
  "Lead 3 (calliope)",
  "Lead 4 (chiff)",
  "Lead 5 (charang)",
  "Lead 6 (voice)",
  "Lead 7 (fifths)",
  "Lead 8 (bass + lead)",
  "Pad 1 (new age)",
  "Pad 2 (warm)",
  "Pad 3 (polysynth)",
  "Pad 4 (choir)",
  "Pad 5 (bowed)",
  "Pad 6 (metallic)",
  "Pad 7 (halo)",
  "Pad 8 (sweep)",
  "FX 1 (rain)",
  "FX 2 (soundtrack)",
  "FX 3 (crystal)",
  "FX 4 (atmosphere)",
  "FX 5 (brightness)",
  "FX 6 (goblins)",
  "FX 7 (echoes)",
  "FX 8 (sci-fi)",
  "Sitar",
  "Banjo",
  "Shamisen",
  "Koto",
  "Kalimba",
  "Bag pipe",
  "Fiddle",
  "Shanai",
  "Tinkle Bell",
  "Agogo",
  "Steel Drums",
  "Woodblock",
  "Taiko Drum",
  "Melodic Tom",
  "Synth Drum",
  "Reverse Cymbal",
  "Guitar Fret Noise",
  "Breath Noise",
  "Seashore",
  "Bird Tweet",
  "Telephone Ring",
  "Helicopter",
  "Applause",
  "Gunshot",
  //
  // Expanded GM sounds, specific to this tool
  //
  "abcjs Percussion",	// 128
  "Uilleann Pipes",    	// 129
  "Smallpipes (D)", 	// 130
  "Smallpipes (A)",  	// 131
  "Säckpipa",    		// 132
  "Concertina",  		// 133
  "Melodica",   		// 134
  "Cajun Accordion",    // 135
  "Silence"				// 136
];

var gLastInjectedSoundfont = null;
var gLastInjectedProgram = 1;
var gLastInjectedChordsProgram = 1;
var gLastInjectedChordVolume = 64;
var gLastInjectedBassVolume = 64;

function InjectAllMIDIParams(){

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","InjectAllMIDIParams");

    var midi_program_list = [];

  	for (var i=0;i<138;++i){
  		midi_program_list.push({name: "  "+ generalMIDISoundNames[i], id: i });
  	}

	// Set the injector initially based on the default chosen in the settings
	if (gLastInjectedSoundfont == null){
		if (gDefaultSoundFont.indexOf("Fluid")!=-1){
			gLastInjectedSoundfont = "0";
		}else
		if (gDefaultSoundFont.indexOf("Musyng")!=-1){
			gLastInjectedSoundfont = "1";
		}else
		if (gDefaultSoundFont.indexOf("FatBoy")!=-1){
			gLastInjectedSoundfont = "2";
		}else
		if (gDefaultSoundFont.indexOf("canvas")!=-1){
			gLastInjectedSoundfont = "3";
		}else
		if (gDefaultSoundFont.indexOf("mscore")!=-1){
			gLastInjectedSoundfont = "4";
		}
	}

    const sound_fonts_list = [
	    { name: "  Fluid", id: "0" },
	    { name: "  Musyng Kite", id: "1" },
	    { name: "  FatBoy", id: "2" },
	    { name: "  Canvas", id: "3" },
	    { name: "  MScore", id: "4" },
  	];

	// Setup initial values
	const theData = {
	  configure_soundfont:gLastInjectedSoundfont,
	  configure_inject_soundfont: false,
	  configure_program:gLastInjectedProgram,
	  configure_inject_melody_program: false,
	  configure_chordprogram:gLastInjectedChordsProgram,
	  configure_bassvolume:gLastInjectedBassVolume,
	  configure_chordvolume:gLastInjectedChordVolume,
	  configure_inject_chord_program: false,
	  configure_inject_all:false
	};

	var form = [
	  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:50px;">Inject MIDI Soundfont, Melody, and Chords&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#selecting_the_instruments_for_playback" target="_blank" style="text-decoration:none;">💡</a></span></p>'},
	  {html: '<p style="margin-top:24px;margin-bottom:24px;font-size:12pt;line-height:18pt;font-family:helvetica">This will inject a %abcjs_soundfont directive into the ABC.</p>'},  
	  {name: "            Inject abcjs Soundfont", id: "configure_inject_soundfont", type:"checkbox", cssClass:"configure_midi_program_form_text"},
	  {name: "%abcjs_soundfont value to inject:", id: "configure_soundfont", type:"select", options:sound_fonts_list, cssClass:"configure_soundfont_select"},
	  {html: '<p style="margin-top:24px;margin-bottom:24px;font-size:12pt;line-height:18pt;font-family:helvetica">This will inject a %%MIDI program directive into the ABC.</p>'},  
	  {name: "            Inject MIDI Melody program", id: "configure_inject_melody_program", type:"checkbox", cssClass:"configure_midi_program_form_text"},
	  {name: "MIDI Melody program to inject:", id: "configure_program", type:"select", options:midi_program_list, cssClass:"configure_midi_program_select"},
	  {html: '<p style="margin-top:24px;margin-bottom:24px;font-size:12pt;line-height:18pt;font-family:helvetica">This will inject a %%MIDI chordprog with bass and chord volume directives into the ABC.</p>'},  
	  {name: "            Inject MIDI Chord program and volumes", id: "configure_inject_chord_program", type:"checkbox", cssClass:"configure_midi_program_form_text"},
  	  {name: "MIDI Chord program to inject:", id: "configure_chordprogram", type:"select", options:midi_program_list, cssClass:"configure_midi_program_select"},
	  {name: "MIDI Bass volume (0-127):", id: "configure_bassvolume", type:"text", cssClass:"configure_midi_program_form_number_input"},
	  {name: "MIDI Chord volume (0-127):", id: "configure_chordvolume", type:"text", cssClass:"configure_midi_program_form_number_input"},
	  {html: '<p style="font-size:14pt;line-height:19pt;font-family:helvetica;margin-bottom:30px;text-align:center;"><a href="https://michaeleskin.com/documents/general_midi_extended_v2.pdf" target="_blank">General MIDI Instrument Program Numbers</a></p>'},
	  {name: "            Inject all tunes", id: "configure_inject_all", type:"checkbox", cssClass:"configure_midi_program_form_text"},
	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 20, width: 760, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){
		
		if (!args.canceled){

			var bDoSoundFont = args.result.configure_inject_soundfont;
			var bDoMelodyProgram = args.result.configure_inject_melody_program;
			var bDoChordProgram = args.result.configure_inject_chord_program

			// Nothing requested
			if (!(bDoSoundFont || bDoMelodyProgram || bDoChordProgram)){
				//console.log("No MIDI injection requested");
				return;
			}

			var theSoundfont = args.result.configure_soundfont;

			gLastInjectedSoundfont = theSoundfont;

			var soundFontToInject = "fluid";

			switch (theSoundfont){
				case "0":
					soundFontToInject = "fluid";
					break;
				case "1":
					soundFontToInject = "musyng";
					break;
				case "2":
					soundFontToInject = "fatboy";
					break;
				case "3":
					soundFontToInject = "canvas";
					break;
				case "4":
					soundFontToInject = "mscore";
					break;
			}

			var progNum = args.result.configure_program;

			// Time saver - Save the last injected program for next use of the dialog
			gLastInjectedProgram = progNum;
		
			// Special case for muting voices
			if (progNum == 0){

				progNum = "mute";

			}
			else{

				progNum = progNum - 1;

				if ((progNum < 0) || (progNum > 136)){
					progNum = 0;
				}

			}

			var progNumChord = args.result.configure_chordprogram;

			// Time saver - Save the last injected values for next time
			gLastInjectedChordsProgram = progNumChord;
			gLastInjectedBassVolume = args.result.configure_bassvolume;
			gLastInjectedChordVolume = args.result.configure_chordvolume;

			if (isNaN(parseInt(gLastInjectedBassVolume))){
				gLastInjectedBassVolume = 0;
			}

			if (gLastInjectedBassVolume < 0){
				gLastInjectedBassVolume = 0;
			}

			if (gLastInjectedBassVolume > 127){
				gLastInjectedBassVolume = 127;
			}

			if (isNaN(parseInt(gLastInjectedChordVolume))){
				gLastInjectedChordVolume = 0;
			}

			if (gLastInjectedChordVolume < 0){
				gLastInjectedChordVolume = 0;
			}

			if (gLastInjectedChordVolume > 127){
				gLastInjectedChordVolume = 127;
			}
		
			// Special case for muting voices
			if (progNumChord == 0){

				progNumChord = "mute";

			}
			else{

				progNumChord = progNumChord - 1;

				if ((progNumChord < 0) || (progNumChord > 136)){
					progNumChord = 0;
				}

			}
			
			// Injecting all tunes
			if (args.result.configure_inject_all){

				if (bDoSoundFont){

					var nTunes = CountTunes();

					var theNotes = gTheABC.value;

					// Find the tunes
					var theTunes = theNotes.split(/^X:/gm);

					var output = FindPreTuneHeader(theNotes);

					for (var i=1;i<=nTunes;++i){

						theTunes[i] = "X:"+theTunes[i];

						output += InjectOneTuneSoundfont(theTunes[i],soundFontToInject);

					}

					// Stuff in the output
					gTheABC.value = output;

					// Set dirty
					gIsDirty = true;


				}

				if (bDoMelodyProgram){

					var nTunes = CountTunes();

					var theNotes = gTheABC.value;

					// Find the tunes
					var theTunes = theNotes.split(/^X:/gm);

					var output = FindPreTuneHeader(theNotes);

					for (var i=1;i<=nTunes;++i){

						theTunes[i] = "X:"+theTunes[i];

						output += InjectOneTuneMIDIProgram(theTunes[i],progNum,false);

					}

					// Stuff in the output
					gTheABC.value = output;

					// Set dirty
					gIsDirty = true;

				}
				
				if (bDoChordProgram){

					var nTunes = CountTunes();

					var theNotes = gTheABC.value;

					// Find the tunes
					var theTunes = theNotes.split(/^X:/gm);

					var output = FindPreTuneHeader(theNotes);

					for (var i=1;i<=nTunes;++i){

						theTunes[i] = "X:"+theTunes[i];

						output += InjectOneTuneMIDIBassChordProgramAndVolumes(theTunes[i], progNumChord, gLastInjectedBassVolume, gLastInjectedChordVolume);
					}

					// Stuff in the output
					gTheABC.value = output;

					// Set dirty
					gIsDirty = true;

				}

				// Set the select point
				gTheABC.selectionStart = 0;
			    gTheABC.selectionEnd = 0;

			    // Focus after operation
			    FocusAfterOperation();

			}
			else{

				var theSelectionStart = gTheABC.selectionStart;

				if (bDoChordProgram){

					var thePatchName;

					if (progNumChord == "mute"){
						thePatchName = "Mute";
					} 
					else{
						thePatchName = generalMIDISoundNames[progNumChord+1];
					}

					var leftSide = gTheABC.value.substring(0,theSelectionStart);
					
					var rightSide = gTheABC.value.substring(theSelectionStart);

					var toInject = "% Bass/Chord instrument: "+thePatchName+"\n"+"%%MIDI chordprog " + progNumChord;

					toInject += "\n%%MIDI bassvol " + gLastInjectedBassVolume + "\n" + "%%MIDI chordvol " + gLastInjectedChordVolume;

					toInject += "\n";

					gTheABC.value = leftSide + toInject + rightSide;

					// Set dirty
					gIsDirty = true;


				}

				if (bDoMelodyProgram){

					// Provide a label
					var thePatchName;

					if (progNum == "mute"){
						thePatchName = "Mute";
					} 
					else{
						thePatchName = generalMIDISoundNames[progNum+1];
					}

					var leftSide = gTheABC.value.substring(0,theSelectionStart);
					
					var rightSide = gTheABC.value.substring(theSelectionStart);
					
					gTheABC.value = leftSide + "% Melody instrument: "+thePatchName+"\n"+ "%%MIDI program " + progNum + "\n" + rightSide;	

					// Set dirty
					gIsDirty = true;

				}

				if (bDoSoundFont){

					var leftSide = gTheABC.value.substring(0,theSelectionStart);
					
					var rightSide = gTheABC.value.substring(theSelectionStart);

					gTheABC.value = leftSide + "% Soundfont: "+soundFontToInject+"\n"+"%abcjs_soundfont " + soundFontToInject + "\n" + rightSide;

					// Set dirty
					gIsDirty = true;

				}

				// Set the select point
				gTheABC.selectionStart = theSelectionStart;
			    gTheABC.selectionEnd = theSelectionStart;

			    // Focus after operation
			    FocusAfterOperation();
				
			}
		}
	});
}


//
// Inject metronome annotation into the current tune
//

const metronome_list = [
    { name:"C|",  pattern:"2/2 cB"}, 
    { name:"C",   pattern:"4/4 cBBB"}, 
   	{ name:"2/2", pattern:"2/2 cB"},
   	{ name:"3/2", pattern:"3/2 cBB"},
    { name:"2/4", pattern:"2/4 cB"}, 
    { name:"3/4", pattern:"3/4 cBB"}, 
    { name:"4/4", pattern:"4/4 cBBB"}, 
    { name:"5/4", pattern:"5/4 cBBBB"}, 
    { name:"6/4", pattern:"6/4 cBBBBB"}, 
    { name:"7/4", pattern:"7/4 cBBBBBB"}, 
    { name:"2/8", pattern:"2/8 cx"}, 
    { name:"3/8", pattern:"3/8 cxx"}, 
    { name:"5/8", pattern:"5/8 cxxcx"},
    { name:"6/8", pattern:"6/8 cxxcxx"}, 
    { name:"7/8", pattern:"7/8 cxcxcxx"}, 
    { name:"9/8", pattern:"9/8 cxxcxxcxx"},
    { name:"10/8", pattern:"10/8 cxxcxxcxcx"},
    { name:"12/8", pattern:"12/8 cxxcxxcxxcxx"}
];

//
// Inject metronome ABC into a single tune
//
function inject_one_metronome(tuneABC, showWarnings){

	var i;

	// Strip out non-tablature chord markings that don't cross line boundaries
	var searchRegExp = /(?:"[_^][^"\n]*)"/gm

	var theMatches = tuneABC.match(searchRegExp);

	var nMatches = 0;

	if (theMatches){

		nMatches = theMatches.length;

	}

	var theStrippedABC = tuneABC;

	// Are there any tablature chords?
	if (nMatches > 0){

		// Yes, replace them with placeholders
		for (i=0;i<nMatches;++i){

			theStrippedABC = theStrippedABC.replace(theMatches[i],"xyzyzx_"+i)

		}

		// Strip out chords that don't cross line boundaries
		searchRegExp = /"[^"\n]*"/gm
	
		theStrippedABC = theStrippedABC.replace(searchRegExp, "");

		for (var i=0;i<nMatches;++i){

			theStrippedABC = theStrippedABC.replace("xyzyzx_"+i,theMatches[i])

		}

	}
	else{


		// No tablature chords, just replace them all 
		// Strip out chords that don't cross line boundaries
		searchRegExp = /"[^"\n]*"/gm

		theStrippedABC = tuneABC.replace(searchRegExp, "");

	}
	
	// Strip out %%MIDI chordprog markings
	searchRegExp = /^%%MIDI chordprog.*$/gm

	// Detect chordprogs annotation
	var chordprogs = theStrippedABC.match(searchRegExp);

	// If any found strip them
	if ((chordprogs) && (chordprogs.length > 0)){

		for (i=0;i<chordprogs.length;++i){
			theStrippedABC = theStrippedABC.replace(chordprogs[i]+"\n","");
		}
	}

	// Strip out %%MIDI chordvol markings
	searchRegExp = /^%%MIDI chordvol.*$/gm

	// Detect chordprogs annotation
	chordprogs = theStrippedABC.match(searchRegExp);

	// If any found strip them
	if ((chordprogs) && (chordprogs.length > 0)){

		for (i=0;i<chordprogs.length;++i){
			theStrippedABC = theStrippedABC.replace(chordprogs[i]+"\n","");
		}
	}

	// Strip out %%MIDI bassvol markings
	searchRegExp = /^%%MIDI bassvol.*$/gm

	// Detect chordprogs annotation
	chordprogs = theStrippedABC.match(searchRegExp);

	// If any found strip them
	if ((chordprogs) && (chordprogs.length > 0)){

		for (var i=0;i<chordprogs.length;++i){
			theStrippedABC = theStrippedABC.replace(chordprogs[i]+"\n","");
		}
	}
	
    var theLines = theStrippedABC.split("\n");

    var thisLine = "";

    var bFoundLine;

    var theMeter = "";

    for (i = 0; i < theLines.length; ++i) {

        thisLine = theLines[i];

		// Find the meter
		searchRegExp = /^M:.*[\r\n]*/m

		var thisMeter = thisLine.match(searchRegExp);

		if ((thisMeter) && (thisMeter.length > 0)){

			if (theMeter == ""){

				theMeter = thisMeter[0].replace("M:","");
				theMeter = theMeter.trim();

			}
		}
        

		// Search for the first line with a bar indicatin
		var theBarLocation = thisLine.indexOf("|");
		
		if (theBarLocation != -1){

			// Make sure it's not a M: C| line or a %%score line, since both can have | bars
			if ((thisLine.indexOf("M:") == -1) && (thisLine.indexOf("%%score") == -1)){

				bFoundLine = true;

				break;
			}

		}

	}

	if (!bFoundLine){

		// Didn't find any bars, exit early
		return null;

	}

	thisLine = thisLine.trim();

	// Find the first barline position
	var theBarOffset = 0;

	var theBarLocation = thisLine.indexOf("|:");

	if (theBarLocation == 0){

		theBarOffset = 2;
	
	}
	else { 

		theBarLocation = thisLine.indexOf("[|");

		if (theBarLocation == 0){

			theBarOffset = 2;
		
		}
		else { 

			theBarLocation = thisLine.indexOf("||");

			if (theBarLocation == 0){

				theBarOffset = 2;
			
			}
			else{

				theBarLocation = thisLine.indexOf("[:");

				if (theBarLocation == 0){

					theBarOffset = 2;
				
				}
				else {

					// Does the line start with a [*:*] style declaration?
					searchRegExp = /\[.:.*\]/

					var theTagMatch = thisLine.match(searchRegExp);

					if (theTagMatch && (thisLine.indexOf(theTagMatch[0]) == 0)){

						// Search for a double bar pattern after the initial tag

						var lineWithoutTag = thisLine.replace(theTagMatch,"");

						lineWithoutTag = lineWithoutTag.trim();

						var theBarLocation1 = lineWithoutTag.indexOf("|:");
						var theBarLocation2 = lineWithoutTag.indexOf("||");
						var theBarLocation3 = lineWithoutTag.indexOf("[:");

						if ((theBarLocation1 == 0) || (theBarLocation2 == 0) || (theBarLocation3 == 0)){

							theBarLocation1 = thisLine.indexOf("|:");
							theBarLocation2 = thisLine.indexOf("||");
							theBarLocation3 = thisLine.indexOf("[:");

							if (theBarLocation1 != -1){
								theBarOffset = theBarLocation1 + 2;
							}
							if (theBarLocation2 != -1){
								theBarOffset = theBarLocation2 + 2;
							}
							if (theBarLocation3 != -1){
								theBarOffset = theBarLocation3 + 2;
							}
						
						}
						else{

							// Find the barline on this line
							theBarLocation = lineWithoutTag.indexOf("|");

							if (theBarLocation == 0){
								
								theBarOffset = thisLine.indexOf("|") + 1;

							}
							else{

								theBarOffset = theTagMatch[0].length;

							}
							
						}

					}
					else{				

						theBarLocation = thisLine.indexOf("|");

						if (theBarLocation == 0){

							theBarOffset = 1;
						
						}
					}
				}
			}
		}
	}

	// Do we have a meter?
	if (theMeter == ""){

		if (showWarnings){
			// Nope, exit
			var thePrompt = "No meter found in the ABC.";
			
			// Center the string in the prompt
			thePrompt = makeCenteredPromptString(thePrompt);

			DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });
		}

		return null;

	}

	var theMetronomePattern = "";

	// Lets see if we have a supported meter
	for (i=0;i<metronome_list.length;++i){
		if (theMeter == metronome_list[i].name){
			theMetronomePattern = "%\n% Metronome sound and volumes\n%\n%%MIDI chordprog 115\n%%MIDI bassvol 64\n%%MIDI chordvol 64\n%\n% Metronome rhythm pattern\n% c = High Click, B = Low Click, x = Silence\n%\n%abcjs_boomchick "+metronome_list[i].pattern+'\n%\n% To disable the metronome, delete the "E" chord that starts it:\n%';
			break;
		}
	}

	// Meter not supported
	if (theMetronomePattern == ""){

		if (showWarnings){

			var thePrompt = "No metronome pattern available for meter: "+theMeter;
			
			// Center the string in the prompt
			thePrompt = makeCenteredPromptString(thePrompt);

			// Nope, exit
			DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });
		}

		return null;

	}

	var lineWithChord = "";

	if (theBarOffset != 0){

		var leftSide = thisLine.substring(0,theBarOffset);
		
		var rightSide = thisLine.substring(theBarOffset);

		lineWithChord = leftSide + '"E"' + rightSide;

	}
	else{

		lineWithChord = '"E"' + thisLine;
	}
	
	// Is there a V: tag in the tune?
	var firstVTag = theStrippedABC.indexOf("V:")

	var injectedLine;

	if (firstVTag != -1){

		// Now inject the metronome pattern into the whole tune just before the first V: tag

		var leftSide = theStrippedABC.substring(0,firstVTag);
		
		var rightSide = theStrippedABC.substring(firstVTag);

		theStrippedABC = leftSide + theMetronomePattern + "\n" + rightSide;

		// And inject the chord into the first line of notation
		injectedLine = lineWithChord;

		theStrippedABC = theStrippedABC.replace(thisLine,injectedLine);

	}
	else{

		injectedLine = theMetronomePattern + '\n' + lineWithChord;
		theStrippedABC = theStrippedABC.replace(thisLine,injectedLine);

	}

	// Seeing extra line breaks after the inject
	theStrippedABC = theStrippedABC.replace("\n\n","");

	return theStrippedABC;

}

function InjectMetronome(){

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","InjectMetronome");

	var theSelectedTuneIndex = findSelectedTuneIndex();

	// Setup initial values
	const theData = {
	  configure_inject_all:false
	};

	var form = [
	  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:50px;">Inject Metronome&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#adding_a_metronome" target="_blank" style="text-decoration:none;">💡</a></span></p>'},
	  {html: '<p style="margin-top:36px;margin-bottom:36px;font-size:12pt;line-height:18pt;font-family:helvetica">This adds a meter-adaptive metronome into the ABC using %MIDI chordprog and %abcjs_boomchick directives.</p>'},  
	  {html: '<p style="margin-top:36px;margin-bottom:36px;font-size:12pt;line-height:18pt;font-family:helvetica"><strong>Note:&nbsp;&nbsp;This will strip any existing chords, MIDI chord programs, and MIDI bass/chord volumes from the ABC.</strong></p>'},  
	  {name: "            Inject metronome into all tunes", id: "configure_inject_all", type:"checkbox", cssClass:"configure_metronome_form_text"},
	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 200, width: 760, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){
		
		if (!args.canceled){

			if (args.result.configure_inject_all){

				var nTunes = CountTunes();

				var isOneTune = (nTunes == 1);

				var output = "";

				for (var i=0;i<nTunes;++i){

					var thisTune = getTuneByIndex(i);

					var injectedTune = inject_one_metronome(thisTune,isOneTune);

					// Wasn't able to inject this tune, just keep the original
					if (!injectedTune){
						output += thisTune;
					}
					else{
						output += injectedTune;
						output += "\n\n";
					}

				}

				// Stuff in the output
				gTheABC.value = output;

				// Set dirty
				gIsDirty = true;

				RenderAsync(true,null,function(){

					// Set the select point
					gTheABC.selectionStart = 0;
				    gTheABC.selectionEnd = 0;

				    // Focus after operation
				    FocusAfterOperation();

				});

			}
			else{

				// Try to find the current tune
				var theSelectedABC = findSelectedTune();

				if (theSelectedABC == ""){
					// This should never happen
					return;
				}

				var theStrippedABC = inject_one_metronome(theSelectedABC,true);

				if (!theStrippedABC){
					return;
				}

				// Try and keep the same tune after the redraw for immediate play
				var theSelectionStart = gTheABC.selectionStart;

				// Stuff in the injected ABC
				var theABC = gTheABC.value;
				theABC = theABC.replace(theSelectedABC,theStrippedABC);

				gTheABC.value = theABC;

				// Set dirty
				gIsDirty = true;

				// Force a redraw of the tune
				RenderAsync(false,theSelectedTuneIndex,function(){

					// Set the select point
					gTheABC.selectionStart = theSelectionStart;
				    gTheABC.selectionEnd = theSelectionStart;

				    // Focus after operation
				    FocusAfterOperation();

				});

			}
			
		}
	});
}

//
// Play the ABC
//
function PlayABC(){

	if (gAllowCopy){

		// Play back locally

		// Try to find the current tune
		var theSelectedABC = findSelectedTune();

		if (theSelectedABC == ""){
			// This should never happen
			return;
		}

		// Pre-process the ABC to inject any requested programs or volumes
		theSelectedABC = PreProcessPlayABC(theSelectedABC);

		// Play back locally in-tool	
		PlayABCDialog(theSelectedABC,null,null,null);

	}
}

//
// Copy the ABC to the clipboard
//
// If shift key is pressed, copy the text and open the ABC in editor.drawthedots.com
//
function CopyABC(){

	if (gAllowCopy){

		var theData = gTheABC.value;
		
		// Copy the abc to the clipboard
		CopyToClipboard(theData);

  		// Give some feedback
  		document.getElementById("copybutton").value = "Copied!";

  		setTimeout(function(){

  			document.getElementById("copybutton").value = "Copy All";

  		},750);

  	}
}

//
// Copy the ShareURL to the clipboard and then launch TinyURL
//
function ShortenURLFallback(){

	if (!gAllowURLSave){
		return;
	}

	var theURL = document.getElementById("urltextbox");

	var theData = theURL.value;
	
	// Copy the abc to the clipboard
	CopyToClipboard(theData);

	// Give some feedback
	document.getElementById("shortenurl").value = "Share URL Copied!";

	setTimeout(function(){

		document.getElementById("shortenurl").value = "Launching TinyURL";

		setTimeout(function(){

			var w = window.open("https://tinyurl.com");

			document.getElementById("shortenurl").value = "Shorten URL";
			
		},1000);

	},2000);

}

//
// Try calling the TinyURL API directly first
//
// If it fails, fall back to the old manual assist system
//

function ShortenURL(){

	if (!gAllowURLSave){
		return;
	}

	// Keep track of URL shortening
	sendGoogleAnalytics("sharing","shorten_share_url");

	var theURL = document.getElementById("urltextbox");

	var theData = theURL.value;

	let body = {

	  url: theData
	
	}

	fetch(`https://api.tinyurl.com/create`, {
	    method: `POST`,
	    headers: {
	      accept: `application/json`,
	      authorization: gTinyURLAPIKey,
	      'content-type': `application/json`,
	    },
	    body: JSON.stringify(body)
	  })
	  .then(response => {

	  	// If it fails, go back to the old way
	    if (response.status != 200){

	    	ShortenURLFallback();

	    	return;

	    };

	    return response.json()

	  })
	  .then(data => {

	  	// Copy the shortened
		CopyToClipboard(data.data.tiny_url);

		var modal_msg  = '<p style="text-align:center;font-size:16pt;font-family:helvetica">Shortened URL Copied to the Clipboard</p>';
	   	modal_msg += '<p style="text-align:center;font-size:14pt;line-height:19pt;font-family:helvetica">Short URL:</p>';
	   	modal_msg += '<p style="text-align:center;font-size:14pt;line-height:19pt;font-family:helvetica"><a href="'+data.data.tiny_url+'" target="_blank">'+data.data.tiny_url+'</a></p>';

		DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

	  })
	  .catch(
	  	error => {

	  		ShortenURLFallback();

	    	return;

	  });
}

//
// Copy the ShareURL to the clipboard
//
function CopyShareURL(){

	if (!gAllowURLSave){
		return;
	}

	// Keep track of URL copy
	sendGoogleAnalytics("sharing","copy_share_url");

	var theURL = document.getElementById("urltextbox");

	var theData = theURL.value;
	
	// Copy the abc to the clipboard
	CopyToClipboard(theData);

	// Give some feedback
	document.getElementById("copyurl").value = "Share URL Copied!";

	setTimeout(function(){

		document.getElementById("copyurl").value = "Copy Share URL";
		
	},750);

}


//
// Save the ABC
//
function SaveABC(){

	if (gAllowSave){

		// Keep track exports
		sendGoogleAnalytics("export","SaveABC");

		var theData = gTheABC.value;

		if (theData.length != 0){

			var theTuneCount = CountTunes();

			// Derive a suggested name from the ABC
			var theName = getDescriptiveFileName(theTuneCount,false);

			if (isDesktopBrowser()){

				theName += ".abc";

				saveABCFile("Please enter a filename for your ABC file:",theName,theData);
			}
			else{

				theName += ".txt";

				saveABCFile("Please enter a filename for your ABC file:",theName,theData);
			}

		}
	}
}

//
// Save the ShareURL
//
function SaveShareURL(){

	if (gAllowURLSave){

		// Keep track of URL save
		sendGoogleAnalytics("sharing","save_share_url");

		var theData = urltextbox.value;

		if (theData.length != 0){

			var theTuneCount = CountTunes();

			// Derive a suggested name from the ABC
			var theName = getDescriptiveFileName(theTuneCount,false);

			saveTextFile("Please enter a filename for your Share URL file:",theName+"_Share_URL.txt",theData);
		}
	}
}

//
// Test the share URL
// 
function TestShareURL(){

	if (!gAllowURLSave){
		return;
	}

	// Keep track of URL test
	sendGoogleAnalytics("sharing","test_share_url");

	var theURL = document.getElementById("urltextbox").value;

	var w = window.open(theURL);

}

//
// Set the ABC text and re-render
//
function SetAbcText(txt) {

	gTheABC.value = txt;

}

//
// Toggle the control display
//

function ShowAllControls(){

	document.getElementById("notenrechts").style.display = "inline-block";

	gShowAllControls = true;

	// Recalculate the notation top position
	UpdateNotationTopPosition();

	// Force a rescroll for one column view
	if (gIsOneColumn){

		MakeTuneVisible(true);
		
	}

}

function HideAllControls(){

	document.getElementById("notenrechts").style.display = "none";

	gShowAllControls = false;

	// Recalculate the notation top position
	UpdateNotationTopPosition();

	// Force a rescroll for one column view
	if (gIsOneColumn){

		MakeTuneVisible(true);
		
	}

}

//
// Handle the minimize/maximize button
//

function ShowMaximizeButton(){

	document.getElementById("zoombutton").style.display = "block";

}

function HideMaximizeButton(){

	document.getElementById("zoombutton").style.display = "none";

}

function DoMaximize(){

	document.getElementById("noscroller").style.display = "none";
	document.getElementById("notation-spacer").style.display = "none";
	gTheNotation.style.display = "flex";
	gTheNotation.style.float = "none";

	document.getElementById("zoombutton").src = "img/zoomin.png"

	gIsMaximized = true;

	// Fix the display margins
	HandleWindowResize();

	if (isDesktopBrowser()){

		// Defer any notation clicks
		gGotRenderDivClick = false;
		gRenderDivClickOffset = -1;

		//debugger;

		// Reset the notation margin
		gNotationLeftMarginBeforeMaximize = gTheNotation.style.marginLeft;

		gTheNotation.style.marginLeft = "auto";

	}

}

function DoMinimize(){

	document.getElementById("noscroller").style.display = "block";
	document.getElementById("notation-spacer").style.display = "block";

	document.getElementById("zoombutton").src = "img/zoomout.png"

	if (isDesktopBrowser()){
		gTheNotation.style.display = "inline";
		gTheNotation.style.float = "left";
		gTheNotation.style.marginLeft = gNotationLeftMarginBeforeMaximize;

	}

	gIsMaximized = false;

	// Fix the display margins
	HandleWindowResize();

	// Handle any deferred notation clicks
	if (isDesktopBrowser()){

		// First time we minimize from a full screen share link or after a window resize while maximized, we need to grab the text box location params
		// Since they are not valid before the UI has been displayed
		if (gForceInitialTextBoxRecalc){

			// Grab the text box positions and offsets
			// Setup text box symmetrical resize 
			gInitialTextBoxWidth = gTheABC.offsetWidth;

			var elem = document.getElementById("notenlinks");
			gInitialTextBoxContainerWidth = elem.offsetWidth;

			elem = document.getElementById("noscroller");
			gInitialTextBoxContainerLeft = elem.offsetLeft;

			ResizeTextBox();

			gForceInitialTextBoxRecalc = false;


		}

		// If we minimize from a window resize while maximized, we need to reset the text box location params
		if (gGotWindowResizeWhileMaximized){

			gTheABC.style.width = gInitialTextBoxWidth+"px";

			gTheABC.style.marginLeft = "0px";

			var elem = document.getElementById("notenlinks");
			gInitialTextBoxContainerWidth = elem.offsetWidth;

			elem = document.getElementById("noscroller");
			gInitialTextBoxContainerLeft = elem.offsetLeft;

			gTheNotation.style.marginLeft = "auto";

			gGotWindowResizeWhileMaximized = false;

		}

		if (gGotRenderDivClick){

			if (gRenderDivClickOffset != -1){

				// Scroll the tune ABC into view
			    gTheABC.selectionEnd = gTheABC.selectionStart = gRenderDivClickOffset;
		    	gTheABC.blur();
		    	gTheABC.focus();

		    }

	    	gGotRenderDivClick = false;
	    	gRenderDivClickOffset = -1;

		}
	}

}

function ToggleMaximize(){

	if (gIsMaximized){

		DoMinimize();

		if (isDesktopBrowser()){

			gTheNotation.style.width = "855px";

		}
		else{

			gTheNotation.style.width = "820px";

		}

	}
	else{

		DoMaximize();

		if (isDesktopBrowser()){

			// Scale the full screen up a bit if it makes sense
			var windowWidth = window.innerWidth;

			if (((windowWidth * gFullScreenScaling)/100.0) > 850){

				gTheNotation.style.width = gFullScreenScaling+"%";

			}
		}
		else{

			// Scale the full screen up a bit if it makes sense
			var windowWidth = window.innerWidth;

			if (((windowWidth * gFullScreenScaling)/100.0) > 820){

				gTheNotation.style.width = gFullScreenScaling+"%";

			}

		}
	}

}

//
// Idle the show tab names allow state
//
function IdleAllowShowTabNames(){

	var format = GetRadioValue("notenodertab");

	var allowShowTabs = false;

	switch (format){

		case "noten":
		case "notenames":
		case "whistle":
			break;

		case "mandolin":
		case "gdad":
		case "mandola":
		case "guitare":
		case "guitard":
		case "bass":
			allowShowTabs = true;
			break;

	}

	if (allowShowTabs){

		gAllowShowTabNames = true;

	}
	else{

		gAllowShowTabNames = false;
	}

}


// 
// Utility function for convertering UTF-8 to Base64
//
function utf8tob64(str) {
	var retval;

	try {
		retval = btoa(escape(str));
	} catch (error) {
		retval = "";
	}
	return retval;
};

// 
// Utility function for convertering Base64 to UTF-8
//
function b64toutf8(str) {

	var retval;

	try {
		retval = unescape(atob(str));
	} catch (error) {
		retval = "";
	}
	return retval;
};

// 
// Check for a share link and process it
//
function processShareLink() {

	var doRender = false;

	// If edit disabled, hide the zoom arrows
	gDisableEditFromPlayLink = false;

	const urlParams = new URLSearchParams(window.location.search);

	// Process URL params

	// Handler for lzw ABC data parameter
	if (urlParams.has("lzw")) {

		var originalAbcInLZW = urlParams.get("lzw");

		abcInLZW = LZString.decompressFromEncodedURIComponent(originalAbcInLZW);

		const abcText = abcInLZW;

		if (abcText.length > 0) {
			SetAbcText(abcText);
			RestoreDefaults();
			doRender = true;
			gIsDirty = true;
		}
		else{
			// If it's a long LZW, most likely an Acrobat truncation issue
			if (originalAbcInLZW.length > 2000){
				// Bad decode, possibly from a truncated Adobe Acrobat link
				ShowAcrobatHyperlinkLengthWarning();
			}
			else{
				// Bad decode
				ShowHyperlinkBadDecodeAlert();

			}
		}
	}

	// Handler for format parameter
	if (urlParams.has("format")) {

		var format = urlParams.get("format");

		// No longer supporting bc or cd tablature, reset to notes
		if ((format == "bc") || (format == "cd")){

			format = "noten";
			
		}

		SetRadioValue("notenodertab", format);

		if (format == "whistle"){

			// If first time using the whistle tab, prep the tin whistle font for embedded SVG styles
			PrepareWhistleFont();
			
		}

		gCurrentTab = format;

	}

	// Handler for capo parameter
	if (urlParams.has("capo")) {
		var capo = urlParams.get("capo");
		gCapo = parseInt(capo);
	}

	// Handler for staffspacing ssp parameter
	if (urlParams.has("ssp")) {
		var ssp = urlParams.get("ssp");
		gStaffSpacing = STAFFSPACEOFFSET + parseInt(ssp);
	}
	else{
		gStaffSpacing = STAFFSPACEOFFSET + STAFFSPACEDEFAULT;
	}

	// Handler for newer showtabnames stn parameter
	if (urlParams.has("stn")) {

		var showtabnames = urlParams.get("stn");

		if (showtabnames == "true"){

			gShowTabNames = true;

		}
		else{

			gShowTabNames = false;

		}

	}

	// Handler for pdf format pdf parameter
	if (urlParams.has("pdf")) {
		var thePDF = urlParams.get("pdf");
		document.getElementById("pdfformat").value = thePDF;
	}
	else{
		// Default is one tune per page
		document.getElementById("pdfformat").value = "one";
	}

	// Handler for page number pn parameter
	if (urlParams.has("pn")) {
		var thePN = urlParams.get("pn");
		document.getElementById("pagenumbers").value = thePN;
	}
	else{
		// Default is bottom center
		document.getElementById("pagenumbers").value = "none";
	}

	// Handler for first page fp parameter
	if (urlParams.has("fp")) {
		var theFP = urlParams.get("fp");
		document.getElementById("firstpage").value = theFP;
	}
	else{
		// Default is to put page numbers on page 1
		document.getElementById("firstpage").value = "yes";
	}

	// Is editing disabled?
	var disableEdit = false;

	// Disable editing?
	if (urlParams.has("dx")) {
		var theNoEdit = urlParams.get("dx");
		if (theNoEdit == "1"){
			disableEdit = true;;
		}
	}

	// Open for playback
	var doPlay = false;
	if (urlParams.has("play")) {
		var thePlay = urlParams.get("play");
		if (thePlay == "1"){
			doPlay = true;
		}
	}

	// If edit disabled, hide the zoom arrows
	if (disableEdit){
		gDisableEditFromPlayLink = true;
	}

	if (doRender) {

		// Set the title
		var theName = "";
		
		if (urlParams.has("name")) {

			theName = urlParams.get("name");

		}
		else{

			var theTuneCount = CountTunes();

			// Derive the name from the ABC
			theName = getDescriptiveFileName(theTuneCount,false);
			
		}

		// We can use this name for PDF naming and sharing name param
		gABCFromFile = true;

		// Save the displayed name
		gDisplayedName = theName;

		// Hide the controls if coming in from a share link
		document.getElementById("notenrechts").style.display = "none";

		// Recalculate the notation top position
		UpdateNotationTopPosition();

		gShowAllControls = false;

		// Set the inital focus back to the ABC
		FocusABC();

		// Render the tune
		RenderAsync(true,null,function(){

			// Playback requested?
			if (doPlay){

				// Keep track of share play presentation
				sendGoogleAnalytics("show_player","from_share")

				// Pre-process the ABC to inject any requested programs or volumes
				var theProcessedABC = PreProcessPlayABC(gTheABC.value);

				// Play back locally in-tool	
				PlayABCDialog(theProcessedABC, null, null, null);

			}

		});

		if (isDesktopBrowser()){

			// Scale the full screen up a bit if it makes sense
			var windowWidth = window.innerWidth;

			if (((windowWidth * gFullScreenScaling)/100.0) > 850){

				gTheNotation.style.width = gFullScreenScaling+"%";

			}
		}
		else{

			// Scale the full screen up a bit if it makes sense
			var windowWidth = window.innerWidth;

			if (((windowWidth * gFullScreenScaling)/100.0) > 820){

				gTheNotation.style.width = gFullScreenScaling+"%";

			}

		}

		return true;

	}

	return false;
}

// 
// Handle changes to the text box size
//
function TextBoxResizeHandler(){

	// Resize the notation spacer
	UpdateNotationTopPosition();

	// Force a rescroll for one column view
	if (gIsOneColumn){

		MakeTuneVisible(true);

	}

}

//
// Returns the tune index for the current start of selection
//

//
// Find the tune index around the selection point
//
function findSelectedTuneIndex(){

	var theNotes = gTheABC.value;

	// Now find all the X: items
    var theTunes = theNotes.split(/^X:/gm);

    var nTunes = CountTunes();

    // Never autoscroll the single tune case
    if (nTunes < 2){

    	//console.log("No autoscroll on single tunes");
    	
    	return 0;

    }

    // Obtain the index of the first selected character
    var start = gTheABC.selectionStart;

    if (start == 0) {

	    // Common case where a set was just loaded and the cursor is at the start, go find the first position after an X:
		start = theNotes.indexOf("X:")+2;

	}

	// Odd case where there isn't an X:, no tunes
	if (start == 0){

		return -1;

	}

    // First chunk is whatever is before the first X:
    var theOffset = 0;

    theOffset = theTunes[0].length;

    for (var i=1;i<=nTunes;++i){

    	// Account for the X: stripped in the length
    	theOffset += theTunes[i].length+2;

    	// Is the offset in the last chunk?
    	if (start < theOffset){

    		return (i-1);

    	}

    }

    // Didn't find a tune, no autoscroll
    return -1;

}

//
// Scrolls the tune into view if it not visible
//
// Called on every click into the work area, with some debounce
//
// Set forceUpdate true to force a scroll even if the same tune is still visible
// This is for global render cases, like a tablature style change
//

function MakeTuneVisible(forceUpdate){

	// Follows same enable semantics as copy

	if (gAllowCopy){

		var tuneIndex = findSelectedTuneIndex();

		// console.log("------------------------------------");
		// console.log("------------------------------------");

		// console.log("MakeTuneVisible tuneIndex = "+tuneIndex+" forceUpdate = "+forceUpdate+" gCurrentTune before = "+gCurrentTune);

		// Save the current tune index
		gCurrentTune = tuneIndex;

		// Only do the rest on desktop, except in the force case after a global change

		if (!forceUpdate){
			if (isMobileBrowser()){
				return;
			}
		}

		//console.log("Selected tune index = " + tuneIndex);

		if (tuneIndex != -1){

			// Find the location of the corresponding rendering div
			var theDivID = "notation"+tuneIndex;

			var theTuneDiv = document.getElementById(theDivID);

			var theTuneTop = theTuneDiv.offsetTop;
			var theTuneHeight = theTuneDiv.offsetHeight;

			var theNotationSpacer = document.getElementById("notation-spacer");
			var theNotationSpacerHeight = theNotationSpacer.offsetHeight;

			// No noscroller to be taken into account if in dual column mode
			if (!gIsOneColumn){
				//console.log("two colume case");
				theNotationSpacerHeight = 0;
			}
			else{
				//console.log("one column case");
				theTuneTop += theNotationSpacerHeight;
			}

			var theWindowHeight = window.innerHeight;

			var theWindowScrollY = window.scrollY;

			var theVisibleHeight = theWindowHeight - theNotationSpacerHeight;

			// Find the position of the tune relative to the bottom of the UI
			// 18 appears to be a margin offset
			var theTuneOffsetFromSpacer = ((theTuneTop - theWindowScrollY) - theNotationSpacerHeight);

			// console.log("------------------------------------");

			// console.log("tune top= "+theTuneTop+ " tune height= "+theTuneHeight+" notation spacer height = "+theNotationSpacerHeight);
			// console.log("window height = "+theWindowHeight+" window scrolly= "+theWindowScrollY);
			// console.log("theVisibleHeight= "+theVisibleHeight);
			// console.log("theTuneOffsetFromSpacer = "+theTuneOffsetFromSpacer);
			// console.log("------------------------------------");

			// Is the top of the tune visible?

			var tuneTopVisible = (theTuneOffsetFromSpacer >= 0) && (theTuneOffsetFromSpacer < theVisibleHeight);

			//console.log("tuneTopVisible = "+tuneTopVisible);

			var tuneBottomOffset = theTuneOffsetFromSpacer + theTuneHeight;

			//console.log("tuneBottomOffset = "+tuneBottomOffset)

			var tuneBottomVisible = (tuneBottomOffset > 0) && (tuneBottomOffset < theVisibleHeight);

			// console.log("tuneBottomVisible = "+tuneBottomVisible);

			var tuneOverflowsVisible = (theTuneOffsetFromSpacer < 0) && ((theTuneOffsetFromSpacer + theTuneHeight) > theVisibleHeight);

			// console.log("tuneOverflowsVisible = "+tuneOverflowsVisible);

			// console.log("------------------------------------");

			// Handle case where the tune changed since an autoscroll, force a rescroll
			if ((tuneIndex != gLastAutoScrolledTune) || forceUpdate){

				// console.log("Trigger autoscroll case #1 - selected a different tune or forceUpdate = "+forceUpdate);

				var newScrollPos = theTuneTop-theNotationSpacerHeight;

				window.scrollTo(0,newScrollPos);

				gLastAutoScrolledTune = tuneIndex;

			}
			else{

				if (!(tuneTopVisible || tuneBottomVisible || tuneOverflowsVisible)){

					// console.log("Trigger autoscroll case #2, tune completely invisible whether current or newly selected tune");

					var newScrollPos = theTuneTop-theNotationSpacerHeight;

					window.scrollTo(0,newScrollPos);

					// Save this as the last autoscrolled tune
					gLastAutoScrolledTune = tuneIndex;

				}
			}
		}

	}
}

//
// Text change handler
//

//
// General purpose repeated event debouncer
// Used here to avoid flooding the renderer with requests
//
function debounce(callback, wait) {
  let timeout;
  return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(function () { callback.apply(this, args); }, wait);
  };
}

function OnABCTextChange(){

	// If the total number of tunes has changed, render all the tunes
	// Otherwise, just render the tune being worked on

	var oldTuneCount = gTotalTunes;

	var newTuneCount = CountTunes();

	var renderAllTunes = (oldTuneCount != newTuneCount);

	// Tune count changed, need to render all tunes
	if (renderAllTunes){

		RenderAsync(true,null);

	}
	else{

		// Otherwise, just render the tune being worked on
		Render(false,gCurrentTune);

	}

}

//
// Prepare the whistle font 
//
function PrepareWhistleFont(){

	if (!gWhistleFontPrepared){

		var theFontHolderSVG = document.querySelectorAll('div[id="fontholder"] > svg > style');

		//
		// Interesting hack/fix on 9 Mar 2023
		// Apparently it is sufficient to just have the font embedded in the first SVG notation div and it will work for all the rest
		// and works for the PDF generation.
		//

		theFontHolderSVG[0].innerHTML += "@font-face { font-family: 'TinWhistleFingering'; src: url(data:font/truetype;charset=utf-8;base64,AAEAAAAOAIAAAwBgRkZUTXBCeEYAACXQAAAAHEdERUYASAAGAAAlsAAAACBPUy8yYmFjVAAAAWgAAABWY21hcGbEMvAAAAIAAAABkmN2dCAARAURAAADlAAAAARnYXNw//8AAwAAJagAAAAIZ2x5ZjcPuw8AAAPQAAAfFGhlYWQFzCAtAAAA7AAAADZoaGVhCdYA8gAAASQAAAAkaG10eAuFBggAAAHAAAAAPmxvY2FW+F8kAAADmAAAADhtYXhwAHIA1QAAAUgAAAAgbmFtZccVWP0AACLkAAACGXBvc3RkEEUZAAAlAAAAAKgAAQAAAAEAAC+9UnlfDzz1AAsIAAAAAADSAmq7AAAAANICarsARP8CAmQGuAAAAAgAAgAAAAAAAAABAAAGuP8CALgB6wAAAAACZAABAAAAAAAAAAAAAAAAAAAABAABAAAAGwCkABUAAAAAAAIAAAABAAEAAABAAC4AAAAAAAEB6wH0AAUACAUzBZkAAAEeBTMFmQAAA9cAZgISAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAFBmRWQAQABBAG0Gzf7NALgGuAD+AAAAAQAAAAAAAAHrAEQAAAAAAesAAAHrAHsAewB7AHsAewB7AHsAewB7AHsAewB7AHsAewB7AHsAewB7AHsAewB7AHsAewB7AAAAAAADAAAAAwAAABwAAQAAAAAAjAADAAEAAAAcAAQAcAAAAAwACAACAAQAAABHAE0AZwBt//8AAAAAAEEASQBhAGn//wAAAAAAAAAAAAAAAQAAAAoAFgAeACoAAAAWABgAGQAPABEAEgAUABcAGgAQABMAFQAKAAwADQADAAUABgAIAAsADgAEAAcACQAAAQYAAAEAAAAAAAAAAQIAAAACAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhgZDxESFAAXGhATFQAAAAAAAAAAAAAAAAAAAAAAAAAKDA0DBQYIAAsOBAcJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEBREAAAAsACwALACSAQQBfAIAAooDJgPOBHwFNgX2BqQHdgf+CH4JBgmYCjIK3guUDFINGg3qDqgPigACAEQAAAJkBVUAAwAHAC6xAQAvPLIHBADtMrEGBdw8sgMCAO0yALEDAC88sgUEAO0ysgcGAfw8sgECAO0yMxEhESUhESFEAiD+JAGY/mgFVfqrRATNAAAABwB7/1QBcQa4AAAADAAYACQAMAA8AEgAABcRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiZ7SzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHrAEnNEdLMDRHSwFXNEdLMDRHSwFXNEdLMDRHSwFXNEZKMDRHSwFXNEZKMDRHSwFWNEdLMDRGSgAACQB7/1QBcQa4AAAADAATABQAIAAsADgARABQAAAXETQ2MzIWFRQGIyImNxQWMzI2NSMRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiZ7SzA0R0swNEcdPCIlOdlLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHrAEnNEdLMDRHSzAlOTwiASc0R0swNEdLAVc0R0swNEdLAVc0RkowNEdLAVc0RkowNEdLAVY0R0swNEZKAAAACQB7/1QBcQa4AAAADAAYABkAJQAxAD0ASQBVAAAXETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJhE0NjMyFhUUBiMiJhE0NjMyFhUUBiMiJhE0NjMyFhUUBiMiJhE0NjMyFhUUBiMiJntLMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSwFXNEdLMDRHSwFXNEZKMDRHSwFXNEZKMDRHSwFWNEdLMDRGSgAACwB7/1QBcQa4AAAADAAYABkAJQAsAC0AOQBFAFEAXQAAFxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1IxE0NjMyFhUUBiMiJhE0NjMyFhUUBiMiJhE0NjMyFhUUBiMiJhE0NjMyFhUUBiMiJntLMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU52UswNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiASc0R0swNEdLAVc0RkowNEdLAVc0RkowNEdLAVY0R0swNEZKAAAACwB7/1QBcQa4AAAADAAYABkAJQAxADIAPgBKAFYAYgAAFxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyIme0swNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSwFXNEZKMDRHSwFXNEZKMDRHSwFWNEdLMDRGSgAADQB7/1QBcQa4AAAADAAYABkAJQAxADIAPgBKAEsAVwBjAG8AABcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiZ7SzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOj0iJTk8IgEnNEZKMDRHSwFXNEZKMDRHSwFWNEdLMDRGSgAADwB7/1QBcQa4AAAADAAYABkAJQAxADIAPgBKAEsAVwBeAF8AawB3AAAXETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NSMRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiZ7SzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOdlLMDRHSzA0R0swNEdLMDRHrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iASc0RkowNEdLAVY0R0swNEZKAAAADwB7/1QBcQa4AAAADAAYABkAJQAxADIAPgBKAEsAVwBjAGQAcAB8AAAXETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJhE0NjMyFhUUBiMiJntLMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0R0swNEdLMDRHrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iJTk8IgEnNEZKMDRHSwFWNEdLMDRGSgAAEQB7/1QBcQa4AAAADAAYABkAJQAxADIAPgBKAEsAVwBjAGQAcAB3AHgAhAAAFxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1IxE0NjMyFhUUBiMiJntLMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU52UswNEdLMDRHrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iASY0R0swNEZKAAAAEQB7/1QBcQa4AAAADAAYABkAJQAxADIAPgBKAEsAVwBjAGQAcAB8AH0AiQAAFxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyIme0swNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iJTk8IgEmNEdLMDRGSgAADwB7/1QBcQa4AAAADAAYABkAJQAxADIAPgBKAEsAVwBjAG8AewB8AAAXETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGB3tLMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0R0swNEdLMDRHSzA0R0swNEcdPCIlOTwiJTkdrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOj0iJTk8IgEnNEZKMDRHSwFXNEZKMDRHSwFWNEdLMDRGSjAlOTwiJTo9IgAAEwB7/1QBcQa4AAAADAAYABkAJQAxADIAPgBKAEsAVwBjAGQAcAB8AH0AiQCVAJYAABcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgd7SzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iJTk8IgEmNEdLMDRGSjAlOTwiJTo9IgAACwB7/wIBcQa4AAAADAANABkAJQAxAD0ASQBVAGEAYgAAFzMVIzUjNTM1MxUzFSMRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHe5k9UlI9UutLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEcdPCIlOTwiJTkdrFJSPVJSPQEnNEdLMDRHSwFXNEdLMDRHSwFXNEdLMDRHSwFXNEZKMDRHSwFXNEZKMDRHSwFWNEdLMDRGSjAlOTwiJTo9IgAAAAALAHv/AgFxBrgAAAAMAA0AGQAgACEALQA5AEUAUQBdAAAXMxUjNSM1MzUzFTMVIxE0NjMyFhUUBiMiJjcUFjMyNjUjETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyIme5k9UlI9UutLMDRHSzA0Rx08IiU52UswNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEesUlI9UlI9ASc0R0swNEdLMCU5PCIBJzRHSzA0R0sBVzRHSzA0R0sBVzRGSjA0R0sBVzRGSjA0R0sBVjRHSzA0RkoACwB7/wIBcQa4AAAADAANABkAJQAmADIAPgBKAFYAYgAAFzMVIzUjNTM1MxUzFSMRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyIme5k9UlI9UutLMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHrFJSPVJSPQEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSwFXNEdLMDRHSwFXNEZKMDRHSwFXNEZKMDRHSwFWNEdLMDRGSgAAAAANAHv/AgFxBrgAAAAMAA0AGQAlACYAMgA5ADoARgBSAF4AagAAFzMVIzUjNTM1MxUzFSMRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NSMRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiZ7mT1SUj1S60swNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTnZSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEesUlI9UlI9ASc0R0swNEdLMCU5PCIlOTwiASc0R0swNEdLMCU5PCIBJzRHSzA0R0sBVzRGSjA0R0sBVzRGSjA0R0sBVjRHSzA0RkoADQB7/wIBcQa4AAAADAANABkAJQAmADIAPgA/AEsAVwBjAG8AABczFSM1IzUzNTMVMxUjETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiZ7mT1SUj1S60swNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHrFJSPVJSPQEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSwFXNEZKMDRHSwFXNEZKMDRHSwFWNEdLMDRGSgAAAAAPAHv/AgFxBrgAAAAMAA0AGQAlACYAMgA+AD8ASwBXAFgAZABwAHwAABczFSM1IzUzNTMVMxUjETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyIme5k9UlI9UutLMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0R0swNEdLMDRHSzA0R0swNEesUlI9UlI9ASc0R0swNEdLMCU5PCIlOTwiASc0R0swNEdLMCU5PCIlOTwiASc0R0swNEdLMCU6PSIlOTwiASc0RkowNEdLAVc0RkowNEdLAVY0R0swNEZKAAAAABEAe/8CAXEGuAAAAAwADQAZACUAJgAyAD4APwBLAFcAWABkAGsAbAB4AIQAABczFSM1IzUzNTMVMxUjETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NSMRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiZ7mT1SUj1S60swNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTnZSzA0R0swNEdLMDRHSzA0R6xSUj1SUj0BJzRHSzA0R0swJTk8IiU5PCIBJzRHSzA0R0swJTk8IiU5PCIBJzRHSzA0R0swJTo9IiU5PCIBJzRGSjA0R0swJTo9IgEnNEZKMDRHSwFWNEdLMDRGSgARAHv/AgFxBrgAAAAMAA0AGQAlACYAMgA+AD8ASwBXAFgAZABwAHEAfQCJAAAXMxUjNSM1MzUzFTMVIxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiZ7mT1SUj1S60swNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHSzA0R0swNEesUlI9UlI9ASc0R0swNEdLMCU5PCIlOTwiASc0R0swNEdLMCU5PCIlOTwiASc0R0swNEdLMCU6PSIlOTwiASc0RkowNEdLMCU6PSIlOTwiASc0RkowNEdLAVY0R0swNEZKAAAAABMAe/8CAXEGuAAAAAwADQAZACUAJgAyAD4APwBLAFcAWABkAHAAcQB9AIQAhQCRAAAXMxUjNSM1MzUzFTMVIxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1IxE0NjMyFhUUBiMiJnuZPVJSPVLrSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOdlLMDRHSzA0R6xSUj1SUj0BJzRHSzA0R0swJTk8IiU5PCIBJzRHSzA0R0swJTk8IiU5PCIBJzRHSzA0R0swJTo9IiU5PCIBJzRGSjA0R0swJTo9IiU5PCIBJzRGSjA0R0swJTo9IgEmNEdLMDRGSgATAHv/AgFxBrgAAAAMAA0AGQAlACYAMgA+AD8ASwBXAFgAZABwAHEAfQCJAIoAlgAAFzMVIzUjNTM1MxUzFSMRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJnuZPVJSPVLrSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEesUlI9UlI9ASc0R0swNEdLMCU5PCIlOTwiASc0R0swNEdLMCU5PCIlOTwiASc0R0swNEdLMCU6PSIlOTwiASc0RkowNEdLMCU6PSIlOTwiASc0RkowNEdLMCU6PSIlOTwiASY0R0swNEZKAAAAABEAe/8CAXEGuAAAAAwADQAZACUAJgAyAD4APwBLAFcAWABkAHAAfACIAIkAABczFSM1IzUzNTMVMxUjETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGB3uZPVJSPVLrSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHHTwiJTk8IiU5HaxSUj1SUj0BJzRHSzA0R0swJTk8IiU5PCIBJzRHSzA0R0swJTk8IiU5PCIBJzRHSzA0R0swJTo9IiU5PCIBJzRGSjA0R0sBVzRGSjA0R0sBVjRHSzA0RkowJTk8IiU6PSIAAAAAFQB7/wIBcQa4AAAADAANABkAJQAmADIAPgA/AEsAVwBYAGQAcABxAH0AiQCKAJYAogCjAAAXMxUjNSM1MzUzFTMVIxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGB3uZPVJSPVLrSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdrFJSPVJSPQEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iJTk8IgEmNEdLMDRGSjAlOTwiJTo9IgAAAAAAAAwAlgABAAAAAAABABUALAABAAAAAAACAAYAUAABAAAAAAADAC8AtwABAAAAAAAEABMBDwABAAAAAAAFAAsBOwABAAAAAAAGABMBbwADAAEECQABACoAAAADAAEECQACAAwAQgADAAEECQADAF4AVwADAAEECQAEACYA5wADAAEECQAFABYBIwADAAEECQAGACYBRwBUAGkAbgAgAFcAaABpAHMAdABsAGUAIABGAGkAbgBnAGUAcgBpAG4AZwAAVGluIFdoaXN0bGUgRmluZ2VyaW5nAABNAGUAZABpAHUAbQAATWVkaXVtAABGAG8AbgB0AEYAbwByAGcAZQAgADIALgAwACAAOgAgAFQAaQBuAFcAaABpAHMAdABsAGUARgBpAG4AZwBlAHIAaQBuAGcAIAA6ACAAMgA1AC0AOAAtADIAMAAxADUAAEZvbnRGb3JnZSAyLjAgOiBUaW5XaGlzdGxlRmluZ2VyaW5nIDogMjUtOC0yMDE1AABUAGkAbgBXAGgAaQBzAHQAbABlAEYAaQBuAGcAZQByAGkAbgBnAABUaW5XaGlzdGxlRmluZ2VyaW5nAABWAGUAcgBzAGkAbwBuACAAMQAuADAAAFZlcnNpb24gMS4wAABUAGkAbgBXAGgAaQBzAHQAbABlAEYAaQBuAGcAZQByAGkAbgBnAABUaW5XaGlzdGxlRmluZ2VyaW5nAAAAAAACAAAAAAAA/2cAZgAAAAEAAAAAAAAAAAAAAAAAAAAAABsAAAABAAIARwECAEgASQEDAEoBBABEAQUARQBGAQYAJwEHACgAKQEIACoBCQAkAQoAJQAmAQsHZC1zaGFycAdmLXNoYXJwB2ctc2hhcnAHYS1zaGFycAdjLXNoYXJwB0Qtc2hhcnAHRi1zaGFycAdHLXNoYXJwB0Etc2hhcnAHQy1zaGFycAAAAAH//wACAAEAAAAOAAAAGAAAAAAAAgABAAMAGgABAAQAAAACAAAAAAABAAAAAMw9os8AAAAA0gJquwAAAADSAmq7) format('truetype'); font-weight: normal; font-style: normal; }";
		
		// Only do this the first time
		gWhistleFontPrepared = true;

	}

}

//
// Inject all PDF-related headers at the top of the file
//
function InjectPDFHeaders(){

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	var theNotes = gTheABC.value;

	var output = "";
	output += "%\n";
	output += "% Here are all the available PDF tunebook annotations:\n";
	output += "%\n";
	output += "%pdfquality .75\n";
	output += "%pdf_between_tune_space 20\n";
	output += "%pdfname your_pdf_filename\n"
	output += "%pdffont fontname style\n"		
	output += "%addtitle Title Page Title\n";
	output += "%addsubtitle Title Page Subtitle\n";
	output += "%urladdtitle https://michaeleskin.com Title Page Title as Hyperlink\n";
	output += "%urladdsubtitle https://michaeleskin.com Title Page Subtitle as Hyperlink\n";
	output += "%addtoc Table of Contents\n";
	output += "%addsortedtoc Table of Contents Sorted by Tune Name\n";
	output += "%addlinkbacktotoc\n";	
	output += "%tocheader Page Header Text for Table of Contents Pages\n";		
	output += "%toctopoffset 30\n";
    output += "%toctitleoffset 35\n";
    output += "%toctitlefontsize 18\n";
    output += "%tocfontsize 13\n";
    output += "%toclinespacing 12\n";
	output += "%addindex Unsorted Index\n"
	output += "%addsortedindex Index Sorted by Tune Name\n"
	output += "%addlinkbacktoindex\n";		
	output += "%indexheader Page Header Text for Index Pages\n";		
    output += "%indextopoffset 30\n";
    output += "%indextitleoffset 35\n";
    output += "%indextitlefontsize 18\n";
    output += "%indexfontsize 13\n";
    output += "%indexlinespacing 12\n";
	output += "%no_toc_or_index_links\n"
	output += "%pageheader Page Header\n"
	output += "%pagefooter Page Footer\n"
	output += "%urlpageheader https://michaeleskin.com Page Header as Hyperlink\n";
	output += "%urlpagefooter https://michaeleskin.com Page Footer as Hyperlink\n";
	output += "%add_all_links_to_thesession\n";
	output += "%add_all_playback_links 0 0 fluid\n";
	output += "%swing_all_hornpipes 0.25\n";	
	output += "%noswing_all_hornpipes\n";	
	output += "%no_edit_allowed\n";
	output += "%qrcode\n";
	output += "%qrcode https://michaeleskin.com\n";
	output += "%caption_for_qrcode Caption for the QR code\n";
	output += "%\n";
	output += "% These directives can be added to each tune:\n";
	output += "%hyperlink https://michaeleskin.com\n";
	output += "%add_link_to_thesession\n";
	output += "%add_playback_link 0 0 fluid\n";
	output += "%swing 0.25 0\n";
	output += "%noswing\n";
	output += "%grace_duration_ms 30\n";

	output += "\n";
	
	output += theNotes;

	// Stuff in the final output
	gTheABC.value = output;

	// Set dirty
	gIsDirty = true;

	// Set the select point
	gTheABC.selectionStart = 0;
    gTheABC.selectionEnd = 0;

    // Focus after operation
    FocusAfterOperation();


}

//
// Do Ceoltas Transform
//
function DoCeoltasTransform(doInverse){

	// Keep track of tablature injection use
	if (doInverse){
		sendGoogleAnalytics("inject_tablature","DoCeoltasTransform_Inverse");
	}
	else{
		sendGoogleAnalytics("inject_tablature","DoCeoltasTransform");
	}

	gTheABC.value = ceoltasABCTransformer(gTheABC.value,doInverse);

	// Set dirty
	gIsDirty = true;

	RenderAsync(true,null);

	// Idle the dialog
	IdleAdvancedControls(true);

	// Idle the show tab names control
	IdleAllowShowTabNames();

}

//
// Ceoltas transform dialog
//
function DoCeoltasTransformDialog(){

	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica;">Ceoltas ABC Transform</p>';

	modal_msg  += '<p style="text-align:center;"><input id="ceoltasdialog" class="advancedcontrols btn btn-injectcontrols" onclick="DoCeoltasTransform(false)" type="button" value="Standard ABC to Comhaltas ABC" title="Transforms the standard ABC format to Comhaltas format.">';
	modal_msg  += '<input id="ceoltasdialoginverse" class="advancedcontrols btn btn-injectcontrols" onclick="DoCeoltasTransform(true)" type="button" value="Comhaltas ABC to Standard ABC" title="Transforms the Comhaltas format to standard ABC format."></p>';

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 200, width: 650,  scrollWithPage: (AllowDialogsToScroll()) });

}

//
// Do B/C Box Tab Injection
//
function DoInjectTablature_BC(){

	// Keep track of tablature injection use
	sendGoogleAnalytics("inject_tablature","DoInjectTablature_BC");

	SetRadioValue("notenodertab","noten");

	gCurrentTab = "noten";

	gInjectTab_BoxStyle = "0";

	gTheABC.value = boxTabGenerator(gTheABC.value);

	// Set dirty
	gIsDirty = true;

	// Show the tab after an inject
	gStripTab = false;
	
	RenderAsync(true,null);

	// Idle the dialog
	IdleAdvancedControls(true);

	// Idle the show tab names control
	IdleAllowShowTabNames();


}

//
// Do ABC C#/D Box Tab Injection
//
function DoInjectTablature_CsD(){

	// Keep track of tablature injection use
	sendGoogleAnalytics("inject_tablature","DoInjectTablature_CsD");

	SetRadioValue("notenodertab","noten");

	gCurrentTab = "noten";

	gInjectTab_BoxStyle = "1";

	gTheABC.value = boxTabGenerator(gTheABC.value);

	// Set dirty
	gIsDirty = true;

	// Show the tab after an inject
	gStripTab = false;
	
	RenderAsync(true,null);

	// Idle the dialog
	IdleAdvancedControls(true);

	// Idle the show tab names control
	IdleAllowShowTabNames();


}

//
// Do Anglo Concertina Tab Injection
//
function DoInjectTablature_Anglo(){

	// Keep track of tablature injection use
	sendGoogleAnalytics("inject_tablature","DoInjectTablature_Anglo");

	SetRadioValue("notenodertab","noten");

	gCurrentTab = "noten";

	angloFingeringsGenerator(gTheABC.value,callback);

	function callback(injectedABC, wasError, errorReport){
		
		if (!wasError){
			
			gTheABC.value = injectedABC;

			// Set dirty
			gIsDirty = true;

			// Show the tab after an inject
			gStripTab = false;
			
			RenderAsync(true,null);

			// Idle the dialog
			IdleAdvancedControls(true);

			// Idle the show tab names control
			IdleAllowShowTabNames();

		}
		else{

            DayPilot.Modal.alert(errorReport,{ theme: "modal_flat", top: 100, scrollWithPage: true }).then(function(){

	   			gTheABC.value = injectedABC;

				// Set dirty
				gIsDirty = true;

				// Show the tab after an inject
				gStripTab = false;
				
				RenderAsync(true,null);

				// Idle the dialog
				IdleAdvancedControls(true);

				// Idle the show tab names control
				IdleAllowShowTabNames();
         	
            });
		}
	}
}

//
// Do Bamboo Flute Tab Injection
//
// Prompt first for the key
//
function DoInjectTablature_Bamboo_Flute(){

	// Keep track of tablature injection use
	sendGoogleAnalytics("inject_tablature","DoInjectTablature_Bamboo_Flute");

 	const bamboo_flute_keys = [
	    { name: "  C", id: "0" },
	    { name: "  D", id: "1" },
	    { name: "  G", id: "2" },
	    { name: "  A", id: "3" },
  	];

	// Setup initial values
	const theData = {
	  configure_bamboo_flute_key:gBambooFluteKey,
	};

	const form = [
	  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:50px;">Inject Bamboo Flute Tablature&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://en.m.wikipedia.org/wiki/Numbered_musical_notation" target="_blank" style="text-decoration:none;">💡</a></span></p>'},
	  {html: '<p style="margin-top:36px;margin-bottom:36px;font-size:12pt;line-height:18pt;font-family:helvetica">This will inject numeric notation tablature for a bamboo flute in the key selected below into all of the tunes in the ABC text area:</p>'},	  
	  {name: "Bamboo flute key:", id: "configure_bamboo_flute_key", type:"select", options:bamboo_flute_keys, cssClass:"configure_box_settings_select"}, 
	  {html: '<p style="margin-top:24px;font-size:12pt;line-height:18pt;font-family:helvetica">&nbsp;</p>'},	  

	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 200, width: 500, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){

		// Get the results and store them in the global configuration
		if (!args.canceled){

			gBambooFluteKey = args.result.configure_bamboo_flute_key; 

			// Save the settings, in case they were initialized
			SaveConfigurationSettings();

			SetRadioValue("notenodertab","noten");

			gCurrentTab = "noten";

			gTheABC.value = bambooFluteTabGenerator(gTheABC.value);

			// Set dirty
			gIsDirty = true;

			// Show the tab after an inject
			gStripTab = false;
			
			RenderAsync(true,null);

			// Idle the dialog
			IdleAdvancedControls(true);

			// Idle the show tab names control
			IdleAllowShowTabNames();

		}

	});

}

//
// Do Fiddle Fingerings Tab Injection
//
function DoInjectTablature_Fiddle_Fingerings(){

	// Keep track of tablature injection use
	sendGoogleAnalytics("inject_tablature","DoInjectTablature_Fiddle_Fingerings");

	SetRadioValue("notenodertab","noten");

	gCurrentTab = "noten";

	gTheABC.value = fiddleFingeringsGenerator(gTheABC.value);

	// Set dirty
	gIsDirty = true;

	// Show the tab after an inject
	gStripTab = false;
	
	RenderAsync(true,null);

	// Idle the dialog
	IdleAdvancedControls(true);

	// Idle the show tab names control
	IdleAllowShowTabNames();

}

// 
// Warn if there were any tunes excluded
//
function ShowMDTabWarningDialog(){

    // Keep track of dialogs
    sendGoogleAnalytics("dialog","ShowMDTabWarningDialog");

    var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica;">Some Tunes Did Not Have Complete DAD Solutions</p>';

    modal_msg += '<p style="font-size:12pt;line-height:18pt;margin-top:36px;">During the tablature generation the following tunes did not have complete DAD 6-1/2 fret solutions and as requested were excluded from the result:</p>';

    var nBadTunes = gExcludedFromMDSolution.length;

	modal_msg += '<p style="font-size:12pt;line-height:18pt;">'

    for (var i=0;i<nBadTunes-1;++i){
        modal_msg += gExcludedFromMDSolution[i]+', ';
    }

    modal_msg += gExcludedFromMDSolution[nBadTunes-1];
	modal_msg += '</p>'

    DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 75, width: 700,  scrollWithPage: (AllowDialogsToScroll()) }).then(function(){

    	gExcludedFromMDSolution = [];
            
    });
}

//
// Do Mountain Dulcimer Tab Injection
//
var gExcludedFromMDSolution = [];

function DoInjectTablature_MD(){

	// Keep track of tablature injection use
	sendGoogleAnalytics("inject_tablature","DoInjectTablature_MD");

 	const mountain_dulcimer_styles = [
	    { name: "  Along High-D String", id: "0" },
	    { name: "  Cross-String", id: "1" },
  	];

	// Setup initial values
	const theData = {
	  configure_dulcimer_style:gMDulcimerStyle,
	  strip_bad_tunes:gMDulcimerStripBadTunes
	};

	const form = [
	  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:50px;">Inject Mountain Dulcimer Tablature&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#injecting_tablature" target="_blank" style="text-decoration:none;">💡</a></span></p>'},
	  {html: '<p style="margin-top:36px;margin-bottom:36px;font-size:12pt;line-height:18pt;font-family:helvetica">This will inject tablature for a DAD-tuned Mountain Dulcimer in the style selected below into all of the tunes in the ABC text area:</p>'},	  
	  {name: "Style:", id: "configure_dulcimer_style", type:"select", options:mountain_dulcimer_styles, cssClass:"configure_md_settings_select"}, 
	  {name: "          Strip tunes from the result that have no complete DAD 6-1/2 fret solution", id: "strip_bad_tunes", type:"checkbox", cssClass:"configure_md_settings_form_text"},
	  {html: '<p style="margin-top:24px;font-size:12pt;line-height:18pt;font-family:helvetica">&nbsp;</p>'},	  

	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 200, width: 600, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){

		// Get the results and store them in the global configuration
		if (!args.canceled){

			gMDulcimerStyle = args.result.configure_dulcimer_style; 

			gMDulcimerStripBadTunes = args.result.strip_bad_tunes;

			// Save the settings, in case they were initialized
			SaveConfigurationSettings();

			SetRadioValue("notenodertab","noten");

			gCurrentTab = "noten";

			// Clear the excluded list
			gExcludedFromMDSolution = [];

			gTheABC.value = MDTablatureGenerator(gTheABC.value);

			// Set dirty
			gIsDirty = true;

			// Show the tab after an inject
			gStripTab = false;
			
			// Render the tunes
			RenderAsync(true,null,function(){

				if (gExcludedFromMDSolution.length > 0){

					ShowMDTabWarningDialog();

				}

				// Idle the dialog
				IdleAdvancedControls(true);

				// Idle the show tab names control
				IdleAllowShowTabNames();

			});
		}
	});
}

//
// Change the tab display
//
function ChangeTab(){

	var theTab = GetRadioValue("notenodertab");

	// If first time using the whistle tab, prep the tin whistle font for embedded SVG styles
	if (theTab == "whistle"){

		PrepareWhistleFont();

	}

	// If the tab changes, render all
	if (theTab != gCurrentTab){

		// Keep track of tab use
		sendGoogleAnalytics("ChangeTab",theTab);

		RenderAsync(true,null);

	}

	gCurrentTab = theTab;

}

//
// Focus after operation handler
// On iOS and Android, does a blur to avoid extra on-screen keyboard popups
//
function FocusAfterOperation(){

	if(isDesktopBrowser()){

		// And reset the focus
	    gTheABC.focus();	

	}
	else{

	    // And clear the focus
	    gTheABC.blur();

	}

}

//
// Reset the focus back to the ABC and set an initial selection
//
function FocusABC(){

	// Refocus back on the ABC
	gTheABC.focus();

	// Set the selection to the start of the tune
	gTheABC.selectionStart = 0;
	gTheABC.selectionEnd = 0;

	// Scroll it to the top
	gTheABC.scrollTo(0,0);
}

//
// Fade out and hide an element
//
function fadeOutAndHide(fadeTarget,callback) {
	var fadeEffect = setInterval(function() {
		if (!fadeTarget.style.opacity) {
			fadeTarget.style.opacity = 1;
		}
		if (fadeTarget.style.opacity > 0) {
			fadeTarget.style.opacity -= 0.1;
		} else {
			clearInterval(fadeEffect);
			fadeTarget.style.display = "none";
			callback();
		}
	}, 100);
}




// 
// Download the current tune as a .WAV file
//

var gMIDIbuffer = null;
var gPlayerABC = null;
var gPlayerABCMetronome = null;
var gTheOKButton = null;
var gTheMuteHandle = null;
var gPlayMetronome = false;
var gIsFirstTimeUsingMetronome = false;

//
// Return the .WAV or .MP3 filename
//
function GetTuneAudioDownloadName(tuneABC,extension){

	var neu = escape(tuneABC);

	var Reihe = neu.split("%0D%0A");

	Reihe = neu.split("%0A");

	for (var j = 0; j < Reihe.length; ++j) {

		Reihe[j] = unescape(Reihe[j]); /* Macht die Steuerzeichen wieder weg */

		var Aktuellereihe = Reihe[j].split(""); /* nochmal bei C. Walshaw crosschecken, ob alle mögl. ausser K: erfasst. */

		if (Aktuellereihe[0] == "T" && Aktuellereihe[1] == ":") {

			var fname = Reihe[j].slice(2);

			fname = fname.trim();

			// Strip out any naughty HTML tag characters
			fname = fname.replace(/[ ]+/ig, '_',)
			fname = fname.replace(/[^a-zA-Z0-9_\-.]+/ig, '');

			return fname+extension;

		}
	}

	// Failed to find a tune title, return a default
	return "output"+extension;

}


//
// Is this a Jig with no specified timing?
//
function isJigWithNoTiming(tuneABC,millisecondsPerMeasure){

	var neu = escape(tuneABC);

	var Reihe = neu.split("%0D%0A");

	Reihe = neu.split("%0A");

	var bHasTempo = false;
	var bIsJig = false;
	var bIsSlipJig = false;
	var bIsSlide = false;

	var theMSPerMeasure  = millisecondsPerMeasure;

	for (var j = 0; j < Reihe.length; ++j) {

		Reihe[j] = unescape(Reihe[j]); /* Macht die Steuerzeichen wieder weg */

		var Aktuellereihe = Reihe[j].split(""); /* nochmal bei C. Walshaw crosschecken, ob alle mögl. ausser K: erfasst. */

		if (Aktuellereihe[0] == "Q" && Aktuellereihe[1] == ":") {

			bHasTempo = true;

		}

		if (Aktuellereihe[0] == "M" && Aktuellereihe[1] == ":") {

			// Is this a jig variant (meter ends with /8)?

			var theMeter = Reihe[j].replace("M:","");
			theMeter = theMeter.trim();

			if ((theMeter.indexOf("12/8") != -1)){
				bIsSlide = true;
				theMSPerMeasure = 2000;
			}

			if ((theMeter.indexOf("6/8") != -1)){
				bIsJig = true;
				theMSPerMeasure = 1000;
			}

			if ((theMeter.indexOf("9/8") != -1)){
				bIsSlipJig = true;
				theMSPerMeasure = 1500;
			}

		}
	}

	if ((bIsJig || bIsSlipJig || bIsSlide) && (!bHasTempo)){

		//console.log("Tempo replacement case, returning "+theMSPerMeasure);

		return theMSPerMeasure;

	}
	else{

		return millisecondsPerMeasure;

	}
}

//
// Generate and download the .wav file for the current tune
//
function DownloadWave(){

	// Keep track of export
	sendGoogleAnalytics("export","DownloadWave");

	// Fix timing bug for jig-like tunes with no tempo specified
	gMIDIbuffer.millisecondsPerMeasure  = isJigWithNoTiming(gPlayerABC,gMIDIbuffer.millisecondsPerMeasure);

	// Adjust the sample fade time if required
	var theFade = computeFade(gPlayerABC);

	gMIDIbuffer.fadeLength = theFade;

	gMIDIbuffer.prime().then((function(t) {
		
		var wavData = gMIDIbuffer.download();

		var link = document.createElement("a");
		
		document.body.appendChild(link);
		
		link.setAttribute("style", "display: none;");
		
		link.href = wavData;
		
		link.download = GetTuneAudioDownloadName(gPlayerABC,".wav");
		
		link.click();
		
		window.URL.revokeObjectURL(wavData);
		
		document.body.removeChild(link);
		
		}
    )).catch((function(e) {

        //console.warn("Problem exporting .wav:", e)
    	// Nope, exit
		var thePrompt = "A problem occured when exporting the .wav file.";
		
		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);

		DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

    }));

}

//
// Batch .MP3 Export
//

var gBatchMP3ExportCancelRequested = false;
var gTheBatchMP3ExportOKButton = null;
var gTheBatchMP3ExportStatusText = null;

//
// Extract the title from a single tune ABC
function getTuneTitle(thisTune){
	
	var neu = escape(thisTune);

	var Reihe = neu.split("%0D%0A");

	Reihe = neu.split("%0A");

	var title = "";

	for (var j = 0; j < Reihe.length; ++j) {

		Reihe[j] = unescape(Reihe[j]); /* Macht die Steuerzeichen wieder weg */

		var Aktuellereihe = Reihe[j].split(""); /* nochmal bei C. Walshaw crosschecken, ob alle mögl. ausser K: erfasst. */

		if (Aktuellereihe[0] == "T" && Aktuellereihe[1] == ":") {

			title = Reihe[j].slice(2);

			title = title.trim();

			return title;

		}
	}

	return title;
}

//
// Batch .MP3 Export
//

var gBatchMP3ExportCancelRequested = false;
var gTheBatchMP3ExportOKButton = null;
var gTheBatchMP3ExportStatusText = null;

//
// Extract the title from a single tune ABC
function getTuneTitle(thisTune){
	
	var neu = escape(thisTune);

	var Reihe = neu.split("%0D%0A");

	Reihe = neu.split("%0A");

	var title = "";

	for (var j = 0; j < Reihe.length; ++j) {

		Reihe[j] = unescape(Reihe[j]); /* Macht die Steuerzeichen wieder weg */

		var Aktuellereihe = Reihe[j].split(""); /* nochmal bei C. Walshaw crosschecken, ob alle mögl. ausser K: erfasst. */

		if (Aktuellereihe[0] == "T" && Aktuellereihe[1] == ":") {

			title = Reihe[j].slice(2);

			title = title.trim();

			return title;

		}
	}

	return title;
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
// Append additional copies of the tune notes for long MP3 generation
//
function AddDuplicatesForMp3(theTune, rhythmType, count, doClickTrack){

	// Nothing to do?
	if ((count == 1) && (!doClickTrack)){
		return theTune;
	}

	theTune = theTune.trim();

	// Find the notes below the header
	var theNotes = removeABCTuneHeaders(theTune);

	theNotes = theNotes.trim();

	var theLines = theNotes.split("\n");

	var lineCount = theLines.length;

	// Should never happen...
	if (lineCount == 0){
		return theTune;
	}

	var startLine = 0;
	var bFoundMIDI = (theLines[0].indexOf("%") != -1);

	// Are there any % directives at the top of the ABC, if yes skip them
	if (bFoundMIDI){
		
		// Strip the % directive from the notes
		theNotes = theNotes.replace(theLines[startLine]+"\n","");

		startLine = 1;

		for (var i=1;i<lineCount;++i){
			
			if (theLines[i].indexOf("%") == -1){
				break;
			}

			// Strip the % directive from the notes
			theNotes = theNotes.replace(theLines[startLine]+"\n","");

			startLine++;

		}
	}

	var firstLine = theLines[startLine]; 

	// Find the offset into the tune of the first line of notes in the trimmed version
	var theNotesIndex = theTune.indexOf(firstLine);

	theTune = theTune.substring(0,theNotesIndex);

	if (doClickTrack){

		switch (rhythmType){
			case "reel":
				theTune+="V:1\nV:2\n%%MIDI program 128\n^Cz3 ^Cz3|^Cz3 ^Cz3|\nV:1\nz8|z8|\n";
				break;
			case "jig":
				theTune+="V:1\nV:2\n%%MIDI program 128\n^Cz2 ^Cz2|^Cz2 ^Cz2|\nV:1\nz6|z6|\n";
				break;
			case "slide":
				theTune+="V:1\nV:2\n%%MIDI program 128\n^Cz2 ^Cz2 ^Cz2 ^Cz2|\nV:1\nz12|\n";
				break;
			case "slipjig":
				theTune+="V:1\nV:2\n%%MIDI program 128\n^Cz2 ^Cz2 ^Cz2|^Cz2 ^Cz2 ^Cz2|\nV:1\nz9|z9|\n";
				break;
			case "polka":
				theTune+="V:1\nV:2\n%%MIDI program 128\n^Cz ^Cz|^Cz ^Cz|\nV:1\nz4|z4|\n";
				break;
			case "waltz":
				theTune+="V:1\nV:2\n%%MIDI program 128\n^Cz ^Cz ^Cz|^Cz ^Cz ^Cz|\nV:1\nz6|z6|\n";
				break;
			default:
				theTune+="V:1\nV:2\n%%MIDI program 128\n^Cz3 ^Cz3|^Cz3 ^Cz3|\nV:1\nz8|z8|\n";
				break;			
		}
	}

	theTune += theNotes;

	for (var i=0;i<count-1;++i){
		theTune += "\n";
		theTune += theNotes;
	}

	return theTune;
}

//
// Is this a Jig variant
//
function getTuneRhythmType(tuneABC){

	var neu = escape(tuneABC);

	var Reihe = neu.split("%0D%0A");

	Reihe = neu.split("%0A");

	var bIsJig = false;
	var bIsSlipJig = false;
	var bIsSlide = false;
	var bIsPolka = false;
	var bIsReel = false;
	var bIsWaltz = false;
	var bIsOddJig = false;

	for (var j = 0; j < Reihe.length; ++j) {

		Reihe[j] = unescape(Reihe[j]); /* Macht die Steuerzeichen wieder weg */

		var Aktuellereihe = Reihe[j].split(""); /* nochmal bei C. Walshaw crosschecken, ob alle mögl. ausser K: erfasst. */

		if (Aktuellereihe[0] == "M" && Aktuellereihe[1] == ":") {

			// Is this a jig variant (meter ends with /8)?

			var theMeter = Reihe[j].replace("M:","");
			theMeter = theMeter.trim();

			if ((theMeter.indexOf("3/8") != -1)){
				bIsOddJig = true;
			}

			if ((theMeter.indexOf("6/8") != -1)){
				bIsJig = true;
			}

			if ((theMeter.indexOf("9/8") != -1)){
				bIsSlipJig = true;
			}

			if ((theMeter.indexOf("12/8") != -1)){
				bIsSlide = true;
			}

			if ((theMeter.indexOf("2/4") != -1)){
				bIsPolka = true;
			}

			if ((theMeter.indexOf("4/4") != -1)){
				bIsReel = true;
			}

			if ((theMeter.indexOf("3/4") != -1)){
				bIsWaltz = true;
			}

			if ((theMeter.indexOf("C") != -1)){
				bIsReel = true;
			}

		}
	}

	if (bIsJig || bIsSlide){

		//console.log("Is a jig!");
		return "jig";

	}
	if (bIsSlipJig){

		//console.log("Is a slip jig!");
		return "slipjig";

	}
	if (bIsOddJig){

		//console.log("Is an odd jig!");
		return "oddjig";

	}
	if (bIsPolka){

		//console.log("Is a polka!");
		return "polka";

	}
	if (bIsReel){

		//console.log("Is a reel!");
		return "reel";

	}
	if (bIsWaltz){

		//console.log("Is a waltz!");
		return "waltz";

	}

	// Default to reel
	return "reel";


}

//
// Batch MP3 export of all the tunes in the ABC area
//
function BatchMP3Export(){

	// Apparently doesn't work on mobile
	if (isMobileBrowser()){

		var thePrompt = "Batch export to .MP3 not supported on iOS or Android at this time.";
		
		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);

		DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 400, scrollWithPage: (AllowDialogsToScroll()), okText:"Ok" });
	
		return;

	}

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","BatchMP3Export");

	// Setup initial values
	const theData = {
	  configure_repeats:1,
	  configure_inject_click:false
	};

	const form = [
	  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:50px;">Export All Tunes as MP3&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#export_all_tunes_as_mp3" target="_blank" style="text-decoration:none;">💡</a></span></p>'},
	  {html: '<p style="margin-top:36px;margin-bottom:36px;font-size:12pt;line-height:18pt;font-family:helvetica">This will export all the tunes in the ABC area as .MP3 files with one or more repeats.</p>'},	  
	  {name: "How many times to repeat each tune in the MP3:", id: "configure_repeats", type:"number", cssClass:"configure_repeats_form_text"}, 
	  {name: "            Inject a two-bar style-appropriate click intro before each tune", id: "configure_inject_click", type:"checkbox", cssClass:"configure_repeats_form_text"},
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:18pt;font-family:helvetica"><strong>For best results with repeated tunes:</strong></p>'},	  
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:18pt;font-family:helvetica">For clean repeats, your tunes must not have extraneous pickup or trailing notes and must have proper and complete timing.</p>'},	  
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:18pt;font-family:helvetica">If there is a repeat at the end of the first part of a tune, either standalone or in a first ending, there must be a matching |: bar at the start of the tune for the tune repeats to work properly.</p>'},	  
	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 200, width: 760, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){
		
		if (!args.canceled){
		
			var repeatCountStr = args.result.configure_repeats;

			if (repeatCountStr == null){
				return;
			}

			repeatCount = parseInt(repeatCountStr);

			if ((isNaN(repeatCount)) || (repeatCount == undefined)){
				return;
			}

			if (repeatCount < 1){
				return;
			}

			var doClickTrack = args.result.configure_inject_click;

			DoBatchMP3Export(repeatCount,doClickTrack);
		}

	});
}

function DoBatchMP3Export(repeatCount,doClickTrack){

	var totalTunesToExport;

	function callback2(theOKButton){

		//console.log("callback2 called");

		nTunes--;

		// Dismiss the player
		theOKButton.click();

		if (!gBatchMP3ExportCancelRequested){

			if (nTunes != 0){

				setTimeout(function(){

					currentTune++;

					var thisTune = getTuneByIndex(currentTune);

					var rhythmType = getTuneRhythmType(thisTune);

					thisTune = AddDuplicatesForMp3(thisTune, rhythmType, repeatCount, doClickTrack);

					thisTune = PreProcessPlayABC(thisTune);

					var title = getTuneTitle(thisTune);

					gTheBatchMP3ExportStatusText.innerText = "Exporting .MP3 for tune "+ (currentTune+1) + " of "+totalTunesToExport+": "+title;

					PlayABCDialog(thisTune,callback,currentTune,null);

				}, 1000);

			}
			else{

				// We're done, close the status dialog
				gTheBatchMP3ExportOKButton.click();

				gBatchMP3ExportCancelRequested = false;
			}
		}
	}

	function callback(result,theOKButton){

		//console.log("callback called result = "+result);

		DownloadMP3(callback2,theOKButton);

	}

	// Make sure there are tunes to covert
	var nTunes = CountTunes();

	if (nTunes == 0){
		return;
	}

	totalTunesToExport = nTunes;

	var currentTune = 0;

	gBatchMP3ExportCancelRequested = false;
	gTheBatchMP3ExportOKButton = null;
	gTheBatchMP3ExportStatusText = null;

	var thePrompt = "Exporting .MP3 for tune "+ (currentTune+1) + " of "+totalTunesToExport;
	
	// Center the string in the prompt
	thePrompt = makeCenteredPromptString(thePrompt);

	// Put up batch running dialog
	DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 400, scrollWithPage: (AllowDialogsToScroll()), okText:"Cancel" }).then(function(args){
		
		//console.log("Got cancel");
		
		gBatchMP3ExportCancelRequested = true;
		
	});	

	var modals = document.getElementsByClassName("modal_flat_main");

	var nmodals = modals.length;

	modals[nmodals-1].style.zIndex = 100001;

	// Find the OK button

	var theOKButtons = document.getElementsByClassName("modal_flat_ok");

	// Find the button that says "Cancel" to use to close the dialog when the cascade is complete
	var theOKButton = null;

	for (var i=0;i<theOKButtons.length;++i){

		theOKButton = theOKButtons[i];

		if (theOKButton.innerText == "Cancel"){

			//console.log("Found conversion cancel button");
			gTheBatchMP3ExportOKButton = theOKButton;

			break;

		}
	}

	// Find the status text 

	var theStatusElems = document.getElementsByClassName("modal_flat_content");
	var nStatus = theStatusElems.length;

	gTheBatchMP3ExportStatusText = theStatusElems[nStatus-1];
	gTheBatchMP3ExportStatusText.style.textAlign = "center";

	var thisTune = getTuneByIndex(currentTune);

	var rhythmType = getTuneRhythmType(thisTune);

	thisTune = AddDuplicatesForMp3(thisTune, rhythmType, repeatCount, doClickTrack);
	
	thisTune = PreProcessPlayABC(thisTune);

	var title = getTuneTitle(thisTune);
	
	gTheBatchMP3ExportStatusText.innerText = "Exporting .MP3 for tune "+ (currentTune+1) + " of "+totalTunesToExport+": "+title;

	// Kick off the conversion cascade
	PlayABCDialog(thisTune,callback,currentTune,null);

	return true;

}

//
// Generate and download the .mp3 file for the current tune
//
var gInDownloadMP3 = false;

function DownloadMP3(callback,val){

	// Avoid re-entry
	if (gInDownloadMP3){
		return false;
	}

	// Keep track of export
	sendGoogleAnalytics("export","DownloadMP3");

	gInDownloadMP3 = true;

	function convertToMp3(wav){

	    var arrayBuffer = wav;
	    var buffer = new Uint8Array(arrayBuffer);
	  
	    var data = parseWav(buffer);
	    var dataSize = data.samples.length;
	    var nSamples = dataSize / 4;

	    // Create the MP3 encoder
	    var theSampleRate = data.sampleRate;
		var mp3encoder = new lamejs.Mp3Encoder(2, theSampleRate, gMP3Bitrate);
		var mp3Data = [];

		var data16 = new Int16Array(data.samples.buffer);

		//
		// Test zeroing out the first 10ms of data
		// to eliminate mp3 encoding pop
		//
		for (let i = 0; i < 882; i++) {
			data16[i] = 0;
		}

		// Calculate the length of the resulting arrays (even and odd)
		const evenLength = Math.ceil(dataSize / 2);
		const oddLength = dataSize - evenLength;

		// Create new Int16Arrays for even and odd values
		var evenArray = new Int16Array(evenLength);
		var oddArray = new Int16Array(oddLength);

		// Split the original array into even and odd arrays
		for (let i = 0; i < (nSamples*2); i++) {
		  if (i % 2 === 0) {
		    evenArray[i / 2] = data16[i];
		  } else {
		    oddArray[(i - 1) / 2] = data16[i];
		  }
		}

		var sampleBlockSize = 1152; //can be anything but make it a multiple of 576 to make encoders life easier

		for (var i = 0; i < nSamples; i += sampleBlockSize) {
		  var leftChunk = evenArray.subarray(i, i + sampleBlockSize);
		  var rightChunk = oddArray.subarray(i, i + sampleBlockSize);
		  var mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
		  if (mp3buf.length > 0) {
		    mp3Data.push(mp3buf);
		  }
		}
		var mp3buf = mp3encoder.flush();   //finish writing mp3

		if (mp3buf.length > 0) {
		    mp3Data.push(mp3buf);
		}

	    return mp3Data;

	};

	function parseWav(wav) {
	  function readInt(i, bytes) {
	    var ret = 0,
	        shft = 0;

	    while (bytes) {
	      ret += wav[i] << shft;
	      shft += 8;
	      i++;
	      bytes--;
	    }
	    return ret;
	  }

	  //if (readInt(20, 2) != 1) throw 'Invalid compression code, not PCM';
	  //if (readInt(22, 2) != 1) throw 'Invalid number of channels, not 1';
	  return {
	    sampleRate: readInt(24, 4),
	    bitsPerSample: readInt(34, 2),
	    samples: wav.subarray(44)
	  };
	}

	// Fix timing bug for jig-like tunes with no tempo specified
	gMIDIbuffer.millisecondsPerMeasure  = isJigWithNoTiming(gPlayerABC,gMIDIbuffer.millisecondsPerMeasure);

	// Adjust the sample fade time if required
	var theFade = computeFade(gPlayerABC);

	gMIDIbuffer.fadeLength = theFade;

	gMIDIbuffer.prime().then(function(t) {

		if (!callback){
			document.getElementById("abcplayer_mp3button").value = "Encoding .MP3";
		}
		document.getElementById("loading-bar-spinner").style.display = "block";

		// Give the UI a chance to update
		setTimeout(async function(){
	
			var wavDataURL = gMIDIbuffer.download();

			var wavData = await fetch(wavDataURL).then(r => r.blob());

			var fileReader = new FileReader();

			fileReader.onload = function(event) {

				var buffer = event.target.result;

				var mp3Data = convertToMp3(buffer);

				var blob = new Blob(mp3Data, {type: 'audio/mp3'});

				var url = window.URL.createObjectURL(blob);

				var link = document.createElement("a");
				
				document.body.appendChild(link);
				
				link.setAttribute("style", "display: none;");
				
				link.href = url;
				
				link.download = GetTuneAudioDownloadName(gPlayerABC,".mp3");
				
				link.click();
				
				window.URL.revokeObjectURL(url);
				
				document.body.removeChild(link);

				if (!callback){
					document.getElementById("abcplayer_mp3button").value = "Save as .MP3";
				}

				document.getElementById("loading-bar-spinner").style.display = "none";
				gInDownloadMP3 = false;

				if (callback){
					callback(val);
				}

			};

			fileReader.readAsArrayBuffer(wavData);

		},100);
	}	
    ).catch((function(e) {

		var thePrompt = "A problem occured when exporting the .mp3 file.";
		
		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);

		DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

		if (!callback){
			document.getElementById("abcplayer_mp3button").value = "Save as .MP3";
		}

		document.getElementById("loading-bar-spinner").style.display = "none";
		gInDownloadMP3 = false;


    }));

}

//
// Generate and download the MIDI file for the current tune
//
function DownloadMIDI(){

	// Keep track of export
	sendGoogleAnalytics("export","DownloadMIDI");

	var midiData = ABCJS.synth.getMidiFile(gPlayerABC, { midiOutputType: "link" });

	var thisMIDI = midiData[0];

	thisMIDI = thisMIDI.replace('<a download','<a id="downloadmidilink" download');
    
	var link = document.createElement("div");

	link.innerHTML = thisMIDI;

	link.setAttribute("style", "display: none;");

	document.body.appendChild(link);

	var theMIDILink = document.getElementById("downloadmidilink");
	
	theMIDILink.click();
		
	document.body.removeChild(link);
		

}

//
// Export the tune in .WAV, .MP3, or MIDI formats
//
function ExportAudioMIDI(){

	var modal_msg  = '<p style="text-align:center;font-size:14pt;font-family:helvetica">Save .WAV, .MP3, or MIDI File of Your Tune</p>';
	modal_msg  += '<p style="text-align:center;font-size:20pt;font-family:helvetica;margin-top:42px;">';
	modal_msg += '<input id="abcplayer_wavbutton" class="abcplayer_wavbutton btn btn-wavedownload" onclick="DownloadWave();" type="button" value="Save as .WAV File" title="Saves the audio for the current tune as a .WAV file">'
	modal_msg += '<input id="abcplayer_mp3button" class="abcplayer_mp3button btn btn-mp3download" onclick="DownloadMP3();" type="button" value="Save as .MP3 File" title="Saves the audio for the current tune as a .MP3 file">'
	modal_msg += '<input id="abcplayer_midibutton" class="abcplayer_midibutton btn btn-mididownload" onclick="DownloadMIDI();" type="button" value="Save as MIDI File" title="Saves the current tune as a MIDI file">'
	modal_msg  += '</p>';

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) })

}


//
// Compute the fade to use for the samples
// My custom samples have shorter fade times for best sound
//
function computeFade(tuneABC){

	//debugger;

	var theFade = 200;

	// Check for a custom sound font first

	// var searchRegExp = /^%abcjs_soundfont canvas.*$/m

	// var isCustomSoundFont = tuneABC.match(searchRegExp);
	
	// if ((isCustomSoundFont) && (isCustomSoundFont.length > 0)){
	// 	theFade = 100;
	// }

	// searchRegExp = /^%abcjs_soundfont mscore.*$/m

	// isCustomSoundFont = tuneABC.match(searchRegExp);
	
	// if ((isCustomSoundFont) && (isCustomSoundFont.length > 0)){
	// 	theFade = 100;
	// }

	var searchRegExp = /^%%MIDI program.*[\r\n]*/gm

	var melodyProgramRequested = tuneABC.match(searchRegExp);

	if ((melodyProgramRequested) && (melodyProgramRequested.length > 0)){

		var thePatchString = melodyProgramRequested[melodyProgramRequested.length-1].replace("%%MIDI program","");
			
		thePatchString = thePatchString.trim();

		var thePatchElements = thePatchString.split(" ");

		if (thePatchElements && (thePatchElements.length > 0)){

			var thisPatch = thePatchElements[0];

			// Only override the default fade for GM instruments if using our own
			if (gUseCustomGMSounds){

				// Is this one of ours?
				switch(thisPatch){
					case "15":   // Dulcimer
						theFade = 4000;
						break;
					case "21":   // Accordion
					case "73":   // Flute
					case "78":   // Whistle
					case "129":  // Uilleann pipes
					case "130":  // Smallpipes D
					case "131":  // Smallpipes A
					case "132":  // Sackpipa
					case "133":  // Concertina
					case "134":  // Melodica
					case "135":  // Cajun Accordion
					case "136":  // Silence
					case "mute": // Silence
						theFade = 100;
						break;
					default:
						break;
				}
			}
			else{
				// Only check for patches above 128
				// Is this one of ours?
				switch(thisPatch){
					case "129":  // Uilleann pipes
					case "130":  // Smallpipes D
					case "131":  // Smallpipes A
					case "132":  // Sackpipa
					case "133":  // Concertina
					case "134":  // Melodica
					case "135":  // Cajun Accordion
					case "136":  // Silence
					case "mute": // Silence
						theFade = 100;
						break;
					default:
						break;
				}

			}
		}
	}

	// Now look for a chordprog
	searchRegExp = /^%%MIDI chordprog.*[\r\n]*/gm

	var chordProgramRequested = tuneABC.match(searchRegExp);

	if ((chordProgramRequested) && (chordProgramRequested.length > 0)){

		var thePatchString = chordProgramRequested[chordProgramRequested.length-1].replace("%%MIDI chordprog","");
			
		thePatchString = thePatchString.trim();

		var thePatchElements = thePatchString.split(" ");

		if (thePatchElements && (thePatchElements.length > 0)){

			var thisPatch = thePatchElements[0];

			// Special case for dulcimer on bass/chords

			// Only override if using our own samples for GM sounds
			if (gUseCustomGMSounds){
				switch(thisPatch){
					case "15":   // Dulcimer
						theFade = 4000;
						break;
					default:
						break;
				}
			}
		}
	}

	//console.log("theFade = "+theFade);

	return theFade;
}

//
// Post-process whistle and notename tab
//
function postProcessTab(renderDivID, instrument, bIsPlayback){


	if (instrument == "whistle") {

		var Tabstriche;

		if (bIsPlayback){
			Tabstriche = document.querySelectorAll('div[id="' + renderDivID + '"] > svg > g > g > [class="abcjs-top-line"]');
		}
		else{
			Tabstriche = document.querySelectorAll('div[id="' + renderDivID + '"] > div > svg > g > g > [class="abcjs-top-line"]');
		}

		for (x = 0; x < Tabstriche.length; x++) {

			if (x % 2 != 0) {

				Tabstriche[x].setAttribute("class", "tabstrich");

				var Geschwisterstriche = getNextSiblings(Tabstriche[x]);

				for (y = 0; y < Geschwisterstriche.length; y++) {
					Geschwisterstriche[y].setAttribute("class", "tabstrich");
				}

			}
		}

		var Tspans;
		if (bIsPlayback){
			Tspans = document.querySelectorAll('div[id="' + renderDivID + '"] > svg > g > g[data-name="tabNumber"] > text > tspan');
		}
		else{
			Tspans = document.querySelectorAll('div[id="' + renderDivID + '"] > div > svg > g > g[data-name="tabNumber"] > text > tspan');
		}

		for (x = 0; x < Tspans.length; x++) {
			
			Tspans[x].setAttribute("class", "whistle");

			// This fixes the + cutoff issue below the second octave notes
			Tspans[x].setAttribute("dy","-7");

			if (Tspans[x].innerHTML == "0") {
				Tspans[x].innerHTML = "g";
			} else if (Tspans[x].innerHTML == "1") {
				Tspans[x].innerHTML = "m";
			} else if (Tspans[x].innerHTML == "2") {
				Tspans[x].innerHTML = "a";
			} else if (Tspans[x].innerHTML == "3") {
				Tspans[x].innerHTML = "i";
			} else if (Tspans[x].innerHTML == "4") {
				Tspans[x].innerHTML = "b";
			} else if (Tspans[x].innerHTML == "5") {
				Tspans[x].innerHTML = "c";
			} else if (Tspans[x].innerHTML == "6") {
				Tspans[x].innerHTML = "j";
			} else if (Tspans[x].innerHTML == "7") {
				Tspans[x].innerHTML = "d";
			} else if (Tspans[x].innerHTML == "8") {
				Tspans[x].innerHTML = "k";
			} else if (Tspans[x].innerHTML == "9") {
				Tspans[x].innerHTML = "e";
			} else if (Tspans[x].innerHTML == "10") {
				Tspans[x].innerHTML = "f";
			} else if (Tspans[x].innerHTML == "11") {
				Tspans[x].innerHTML = "l";
			} else if (Tspans[x].innerHTML == "12") {
				Tspans[x].innerHTML = "g";
			} else if (Tspans[x].innerHTML == "13") {
				Tspans[x].innerHTML = "m";
			} else if (Tspans[x].innerHTML == "14") {
				Tspans[x].innerHTML = "a";
			} else if (Tspans[x].innerHTML == "15") {
				Tspans[x].innerHTML = "i";
			} else if (Tspans[x].innerHTML == "16") {
				Tspans[x].innerHTML = "b";
			} else if (Tspans[x].innerHTML == "17") {
				Tspans[x].innerHTML = "c";
			} else if (Tspans[x].innerHTML == "18") {
				Tspans[x].innerHTML = "j";
			} else if (Tspans[x].innerHTML == "19") {
				Tspans[x].innerHTML = "D";
			} else if (Tspans[x].innerHTML == "20") {
				Tspans[x].innerHTML = "K";
			} else if (Tspans[x].innerHTML == "21") {
				Tspans[x].innerHTML = "E";
			} else if (Tspans[x].innerHTML == "22") {
				Tspans[x].innerHTML = "F";
			} else if (Tspans[x].innerHTML == "23") {
				Tspans[x].innerHTML = "L";
			} else if (Tspans[x].innerHTML == "24") {
				Tspans[x].innerHTML = "G";
			} else if (Tspans[x].innerHTML == "25") {
				Tspans[x].innerHTML = "M";
			} else if (Tspans[x].innerHTML == "26") {
				Tspans[x].innerHTML = "A";
			} else if (Tspans[x].innerHTML == "27") {
				Tspans[x].innerHTML = "I";
			} else if (Tspans[x].innerHTML == "28") {
				Tspans[x].innerHTML = "B";
			} else if (Tspans[x].innerHTML == "29") {
				Tspans[x].innerHTML = "C";
			} else if (Tspans[x].innerHTML == "30") {
				Tspans[x].innerHTML = "J";
			} else if (Tspans[x].innerHTML == "31") {
				Tspans[x].innerHTML = "D";
			} else if (Tspans[x].innerHTML == "32") {
				Tspans[x].innerHTML = "K";
			} else if (Tspans[x].innerHTML == "33") {
				Tspans[x].innerHTML = "E";
			} else if (Tspans[x].innerHTML == "34") {
				Tspans[x].innerHTML = "F";
			} else if (Tspans[x].innerHTML == "35") {
				Tspans[x].innerHTML = "L";
			} else if (Tspans[x].innerHTML == "36") {
				Tspans[x].innerHTML = "G";
			} else if (Tspans[x].innerHTML == "37") {
				Tspans[x].innerHTML = "M";
			} else if (Tspans[x].innerHTML == "38") {
				Tspans[x].innerHTML = "A";
			}
		}
	}

	if (instrument == "notenames") {

		var useSharps = true;

		var Tabstriche;
		if (bIsPlayback){
			Tabstriche = document.querySelectorAll('div[id="' + renderDivID + '"] > svg > g > g > [class="abcjs-top-line"]');
		}
		else{
			Tabstriche = document.querySelectorAll('div[id="' + renderDivID + '"] > div > svg > g > g > [class="abcjs-top-line"]');

		}

		for (x = 0; x < Tabstriche.length; x++) {

			if (x % 2 != 0) {
			
				Tabstriche[x].setAttribute("class", "tabstrich");

				var Geschwisterstriche = getNextSiblings(Tabstriche[x]);
			
				for (y = 0; y < Geschwisterstriche.length; y++) {
					Geschwisterstriche[y].setAttribute("class", "tabstrich");
				}
			}
		}

		// Walk the SVGs

		var SVGs;

		if (bIsPlayback){
			Svgs = document.querySelectorAll('div[id="' + renderDivID + '"] > svg');
		}
		else{
			Svgs = document.querySelectorAll('div[id="' + renderDivID + '"] > div > svg');			
		}

		var nSVGsRequired = 1;

		if (bIsPlayback){
			nSVGsRequired = 0;
		}

		if ((Svgs) && (Svgs.length > nSVGsRequired)) {

			for (var i = nSVGsRequired; i < Svgs.length; ++i) {

				useSharps = true;

				var theSVG = Svgs[i];

				// Find the key signature group
				var keySignatures = theSVG.querySelectorAll('g[data-name="staff-extra key-signature"]');

				// Look for the flat glyph in the key signature group
				if (keySignatures && (keySignatures.length >= 1)) {

					var inner = keySignatures[0].innerHTML;

					if (inner.indexOf("accidentals.flat") != -1) {

						useSharps = false;

					}
				}

				var Tspans = theSVG.querySelectorAll('g[data-name="tabNumber"] > text > tspan');

				if (!gUseComhaltasABC){

					if (useSharps) {
						for (x = 0; x < Tspans.length; x++) {
							if (Tspans[x].innerHTML == "0") {
								Tspans[x].innerHTML = "G,";
							} else if (Tspans[x].innerHTML == "1") {
								Tspans[x].innerHTML = "G♯,";
							} else if (Tspans[x].innerHTML == "2") {
								Tspans[x].innerHTML = "A,";
							} else if (Tspans[x].innerHTML == "3") {
								Tspans[x].innerHTML = "A♯,";
							} else if (Tspans[x].innerHTML == "4") {
								Tspans[x].innerHTML = "B,";
							} else if (Tspans[x].innerHTML == "5") {
								Tspans[x].innerHTML = "C";
							} else if (Tspans[x].innerHTML == "6") {
								Tspans[x].innerHTML = "C♯";
							} else if (Tspans[x].innerHTML == "7") {
								Tspans[x].innerHTML = "D";
							} else if (Tspans[x].innerHTML == "8") {
								Tspans[x].innerHTML = "D♯";
							} else if (Tspans[x].innerHTML == "9") {
								Tspans[x].innerHTML = "E";
							} else if (Tspans[x].innerHTML == "10") {
								Tspans[x].innerHTML = "F";
							} else if (Tspans[x].innerHTML == "11") {
								Tspans[x].innerHTML = "F♯";
							} else if (Tspans[x].innerHTML == "12") {
								Tspans[x].innerHTML = "G";
							} else if (Tspans[x].innerHTML == "13") {
								Tspans[x].innerHTML = "G♯";
							} else if (Tspans[x].innerHTML == "14") {
								Tspans[x].innerHTML = "A";
							} else if (Tspans[x].innerHTML == "15") {
								Tspans[x].innerHTML = "A♯";
							} else if (Tspans[x].innerHTML == "16") {
								Tspans[x].innerHTML = "B";
							} else if (Tspans[x].innerHTML == "17") {
								Tspans[x].innerHTML = "c";
							} else if (Tspans[x].innerHTML == "18") {
								Tspans[x].innerHTML = "c♯";
							} else if (Tspans[x].innerHTML == "19") {
								Tspans[x].innerHTML = "d";
							} else if (Tspans[x].innerHTML == "20") {
								Tspans[x].innerHTML = "d♯";
							} else if (Tspans[x].innerHTML == "21") {
								Tspans[x].innerHTML = "e";
							} else if (Tspans[x].innerHTML == "22") {
								Tspans[x].innerHTML = "f";
							} else if (Tspans[x].innerHTML == "23") {
								Tspans[x].innerHTML = "f♯";
							} else if (Tspans[x].innerHTML == "24") {
								Tspans[x].innerHTML = "g";
							} else if (Tspans[x].innerHTML == "25") {
								Tspans[x].innerHTML = "g♯";
							} else if (Tspans[x].innerHTML == "26") {
								Tspans[x].innerHTML = "a";
							} else if (Tspans[x].innerHTML == "27") {
								Tspans[x].innerHTML = "a♯";
							} else if (Tspans[x].innerHTML == "28") {
								Tspans[x].innerHTML = "b";
							} else if (Tspans[x].innerHTML == "29") {
								Tspans[x].innerHTML = "c'";
							} else if (Tspans[x].innerHTML == "30") {
								Tspans[x].innerHTML = "c♯'";
							} else if (Tspans[x].innerHTML == "31") {
								Tspans[x].innerHTML = "d'";
							} else if (Tspans[x].innerHTML == "32") {
								Tspans[x].innerHTML = "d♯'";
							} else if (Tspans[x].innerHTML == "33") {
								Tspans[x].innerHTML = "e'";
							} else if (Tspans[x].innerHTML == "34") {
								Tspans[x].innerHTML = "f'";
							} else if (Tspans[x].innerHTML == "35") {
								Tspans[x].innerHTML = "f♯'";
							} else if (Tspans[x].innerHTML == "36") {
								Tspans[x].innerHTML = "g'";
							} else if (Tspans[x].innerHTML == "37") {
								Tspans[x].innerHTML = "g♯'";
							} else if (Tspans[x].innerHTML == "38") {
								Tspans[x].innerHTML = "a'";
							} else if (Tspans[x].innerHTML == "39") {
								Tspans[x].innerHTML = "a♯'";
							} else if (Tspans[x].innerHTML == "40") {
								Tspans[x].innerHTML = "b'";
							} else {
								Tspans[x].innerHTML = "?";
							}
						}
					} else {
						for (x = 0; x < Tspans.length; x++) {
							if (Tspans[x].innerHTML == "0") {
								Tspans[x].innerHTML = "G,";
							} else if (Tspans[x].innerHTML == "1") {
								Tspans[x].innerHTML = "A♭,";
							} else if (Tspans[x].innerHTML == "2") {
								Tspans[x].innerHTML = "A,";
							} else if (Tspans[x].innerHTML == "3") {
								Tspans[x].innerHTML = "B♭,";
							} else if (Tspans[x].innerHTML == "4") {
								Tspans[x].innerHTML = "B,";
							} else if (Tspans[x].innerHTML == "5") {
								Tspans[x].innerHTML = "C";
							} else if (Tspans[x].innerHTML == "6") {
								Tspans[x].innerHTML = "D♭";
							} else if (Tspans[x].innerHTML == "7") {
								Tspans[x].innerHTML = "D";
							} else if (Tspans[x].innerHTML == "8") {
								Tspans[x].innerHTML = "E♭";
							} else if (Tspans[x].innerHTML == "9") {
								Tspans[x].innerHTML = "E";
							} else if (Tspans[x].innerHTML == "10") {
								Tspans[x].innerHTML = "F";
							} else if (Tspans[x].innerHTML == "11") {
								Tspans[x].innerHTML = "G♭";
							} else if (Tspans[x].innerHTML == "12") {
								Tspans[x].innerHTML = "G";
							} else if (Tspans[x].innerHTML == "13") {
								Tspans[x].innerHTML = "A♭";
							} else if (Tspans[x].innerHTML == "14") {
								Tspans[x].innerHTML = "A";
							} else if (Tspans[x].innerHTML == "15") {
								Tspans[x].innerHTML = "B♭";
							} else if (Tspans[x].innerHTML == "16") {
								Tspans[x].innerHTML = "B";
							} else if (Tspans[x].innerHTML == "17") {
								Tspans[x].innerHTML = "c";
							} else if (Tspans[x].innerHTML == "18") {
								Tspans[x].innerHTML = "d♭";
							} else if (Tspans[x].innerHTML == "19") {
								Tspans[x].innerHTML = "d";
							} else if (Tspans[x].innerHTML == "20") {
								Tspans[x].innerHTML = "e♭";
							} else if (Tspans[x].innerHTML == "21") {
								Tspans[x].innerHTML = "e";
							} else if (Tspans[x].innerHTML == "22") {
								Tspans[x].innerHTML = "f";
							} else if (Tspans[x].innerHTML == "23") {
								Tspans[x].innerHTML = "g♭";
							} else if (Tspans[x].innerHTML == "24") {
								Tspans[x].innerHTML = "g";
							} else if (Tspans[x].innerHTML == "25") {
								Tspans[x].innerHTML = "a♭";
							} else if (Tspans[x].innerHTML == "26") {
								Tspans[x].innerHTML = "a";
							} else if (Tspans[x].innerHTML == "27") {
								Tspans[x].innerHTML = "b♭";
							} else if (Tspans[x].innerHTML == "28") {
								Tspans[x].innerHTML = "b";
							} else if (Tspans[x].innerHTML == "29") {
								Tspans[x].innerHTML = "c'";
							} else if (Tspans[x].innerHTML == "30") {
								Tspans[x].innerHTML = "d♭'";
							} else if (Tspans[x].innerHTML == "31") {
								Tspans[x].innerHTML = "d'";
							} else if (Tspans[x].innerHTML == "32") {
								Tspans[x].innerHTML = "e♭'";
							} else if (Tspans[x].innerHTML == "33") {
								Tspans[x].innerHTML = "e'";
							} else if (Tspans[x].innerHTML == "34") {
								Tspans[x].innerHTML = "f'";
							} else if (Tspans[x].innerHTML == "35") {
								Tspans[x].innerHTML = "g♭'";
							} else if (Tspans[x].innerHTML == "36") {
								Tspans[x].innerHTML = "g'";
							} else if (Tspans[x].innerHTML == "37") {
								Tspans[x].innerHTML = "a♭'";
							} else if (Tspans[x].innerHTML == "38") {
								Tspans[x].innerHTML = "a'";
							} else if (Tspans[x].innerHTML == "39") {
								Tspans[x].innerHTML = "b♭'";
							} else if (Tspans[x].innerHTML == "40") {
								Tspans[x].innerHTML = "b'";
							} else {
								Tspans[x].innerHTML = "?";
							}
						}
					}	
				}
				else{
					if (useSharps) {
						for (x = 0; x < Tspans.length; x++) {
							if (Tspans[x].innerHTML == "0") {
								Tspans[x].innerHTML = "G,";
							} else if (Tspans[x].innerHTML == "1") {
								Tspans[x].innerHTML = "G♯,";
							} else if (Tspans[x].innerHTML == "2") {
								Tspans[x].innerHTML = "A,";
							} else if (Tspans[x].innerHTML == "3") {
								Tspans[x].innerHTML = "A♯,";
							} else if (Tspans[x].innerHTML == "4") {
								Tspans[x].innerHTML = "B,";
							} else if (Tspans[x].innerHTML == "5") {
								Tspans[x].innerHTML = "C,";
							} else if (Tspans[x].innerHTML == "6") {
								Tspans[x].innerHTML = "C♯,";
							} else if (Tspans[x].innerHTML == "7") {
								Tspans[x].innerHTML = "D";
							} else if (Tspans[x].innerHTML == "8") {
								Tspans[x].innerHTML = "D♯";
							} else if (Tspans[x].innerHTML == "9") {
								Tspans[x].innerHTML = "E";
							} else if (Tspans[x].innerHTML == "10") {
								Tspans[x].innerHTML = "F";
							} else if (Tspans[x].innerHTML == "11") {
								Tspans[x].innerHTML = "F♯";
							} else if (Tspans[x].innerHTML == "12") {
								Tspans[x].innerHTML = "G";
							} else if (Tspans[x].innerHTML == "13") {
								Tspans[x].innerHTML = "G♯";
							} else if (Tspans[x].innerHTML == "14") {
								Tspans[x].innerHTML = "A";
							} else if (Tspans[x].innerHTML == "15") {
								Tspans[x].innerHTML = "A♯";
							} else if (Tspans[x].innerHTML == "16") {
								Tspans[x].innerHTML = "B";
							} else if (Tspans[x].innerHTML == "17") {
								Tspans[x].innerHTML = "C";
							} else if (Tspans[x].innerHTML == "18") {
								Tspans[x].innerHTML = "C♯";
							} else if (Tspans[x].innerHTML == "19") {
								Tspans[x].innerHTML = "D'";
							} else if (Tspans[x].innerHTML == "20") {
								Tspans[x].innerHTML = "D♯'";
							} else if (Tspans[x].innerHTML == "21") {
								Tspans[x].innerHTML = "E'";
							} else if (Tspans[x].innerHTML == "22") {
								Tspans[x].innerHTML = "F'";
							} else if (Tspans[x].innerHTML == "23") {
								Tspans[x].innerHTML = "F♯'";
							} else if (Tspans[x].innerHTML == "24") {
								Tspans[x].innerHTML = "G'";
							} else if (Tspans[x].innerHTML == "25") {
								Tspans[x].innerHTML = "G♯'";
							} else if (Tspans[x].innerHTML == "26") {
								Tspans[x].innerHTML = "A'";
							} else if (Tspans[x].innerHTML == "27") {
								Tspans[x].innerHTML = "A♯'";
							} else if (Tspans[x].innerHTML == "28") {
								Tspans[x].innerHTML = "B'";
							} else if (Tspans[x].innerHTML == "29") {
								Tspans[x].innerHTML = "C'";
							} else if (Tspans[x].innerHTML == "30") {
								Tspans[x].innerHTML = "C♯'";
							} else if (Tspans[x].innerHTML == "31") {
								Tspans[x].innerHTML = "D''";
							} else if (Tspans[x].innerHTML == "32") {
								Tspans[x].innerHTML = "D♯''";
							} else if (Tspans[x].innerHTML == "33") {
								Tspans[x].innerHTML = "E''";
							} else if (Tspans[x].innerHTML == "34") {
								Tspans[x].innerHTML = "F''";
							} else if (Tspans[x].innerHTML == "35") {
								Tspans[x].innerHTML = "F♯''";
							} else if (Tspans[x].innerHTML == "36") {
								Tspans[x].innerHTML = "G''";
							} else if (Tspans[x].innerHTML == "37") {
								Tspans[x].innerHTML = "G♯''";
							} else if (Tspans[x].innerHTML == "38") {
								Tspans[x].innerHTML = "A''";
							} else if (Tspans[x].innerHTML == "39") {
								Tspans[x].innerHTML = "A♯''";
							} else if (Tspans[x].innerHTML == "40") {
								Tspans[x].innerHTML = "B''";
							} else {
								Tspans[x].innerHTML = "?";
							}
						}
					} else {
						for (x = 0; x < Tspans.length; x++) {
							if (Tspans[x].innerHTML == "0") {
								Tspans[x].innerHTML = "G,";
							} else if (Tspans[x].innerHTML == "1") {
								Tspans[x].innerHTML = "A♭,";
							} else if (Tspans[x].innerHTML == "2") {
								Tspans[x].innerHTML = "A,";
							} else if (Tspans[x].innerHTML == "3") {
								Tspans[x].innerHTML = "B♭,";
							} else if (Tspans[x].innerHTML == "4") {
								Tspans[x].innerHTML = "B,";
							} else if (Tspans[x].innerHTML == "5") {
								Tspans[x].innerHTML = "C,";
							} else if (Tspans[x].innerHTML == "6") {
								Tspans[x].innerHTML = "D♭";
							} else if (Tspans[x].innerHTML == "7") {
								Tspans[x].innerHTML = "D";
							} else if (Tspans[x].innerHTML == "8") {
								Tspans[x].innerHTML = "E♭";
							} else if (Tspans[x].innerHTML == "9") {
								Tspans[x].innerHTML = "E";
							} else if (Tspans[x].innerHTML == "10") {
								Tspans[x].innerHTML = "F";
							} else if (Tspans[x].innerHTML == "11") {
								Tspans[x].innerHTML = "G♭";
							} else if (Tspans[x].innerHTML == "12") {
								Tspans[x].innerHTML = "G";
							} else if (Tspans[x].innerHTML == "13") {
								Tspans[x].innerHTML = "A♭";
							} else if (Tspans[x].innerHTML == "14") {
								Tspans[x].innerHTML = "A";
							} else if (Tspans[x].innerHTML == "15") {
								Tspans[x].innerHTML = "B♭";
							} else if (Tspans[x].innerHTML == "16") {
								Tspans[x].innerHTML = "B";
							} else if (Tspans[x].innerHTML == "17") {
								Tspans[x].innerHTML = "C";
							} else if (Tspans[x].innerHTML == "18") {
								Tspans[x].innerHTML = "D♭'";
							} else if (Tspans[x].innerHTML == "19") {
								Tspans[x].innerHTML = "D'";
							} else if (Tspans[x].innerHTML == "20") {
								Tspans[x].innerHTML = "E♭'";
							} else if (Tspans[x].innerHTML == "21") {
								Tspans[x].innerHTML = "E'";
							} else if (Tspans[x].innerHTML == "22") {
								Tspans[x].innerHTML = "F'";
							} else if (Tspans[x].innerHTML == "23") {
								Tspans[x].innerHTML = "G♭'";
							} else if (Tspans[x].innerHTML == "24") {
								Tspans[x].innerHTML = "G'";
							} else if (Tspans[x].innerHTML == "25") {
								Tspans[x].innerHTML = "A♭'";
							} else if (Tspans[x].innerHTML == "26") {
								Tspans[x].innerHTML = "A'";
							} else if (Tspans[x].innerHTML == "27") {
								Tspans[x].innerHTML = "B♭'";
							} else if (Tspans[x].innerHTML == "28") {
								Tspans[x].innerHTML = "B'";
							} else if (Tspans[x].innerHTML == "29") {
								Tspans[x].innerHTML = "C'";
							} else if (Tspans[x].innerHTML == "30") {
								Tspans[x].innerHTML = "D♭''";
							} else if (Tspans[x].innerHTML == "31") {
								Tspans[x].innerHTML = "D''";
							} else if (Tspans[x].innerHTML == "32") {
								Tspans[x].innerHTML = "E♭''";
							} else if (Tspans[x].innerHTML == "33") {
								Tspans[x].innerHTML = "E''";
							} else if (Tspans[x].innerHTML == "34") {
								Tspans[x].innerHTML = "F''";
							} else if (Tspans[x].innerHTML == "35") {
								Tspans[x].innerHTML = "G♭''";
							} else if (Tspans[x].innerHTML == "36") {
								Tspans[x].innerHTML = "G''";
							} else if (Tspans[x].innerHTML == "37") {
								Tspans[x].innerHTML = "A♭''";
							} else if (Tspans[x].innerHTML == "38") {
								Tspans[x].innerHTML = "A''";
							} else if (Tspans[x].innerHTML == "39") {
								Tspans[x].innerHTML = "B♭''";
							} else if (Tspans[x].innerHTML == "40") {
								Tspans[x].innerHTML = "B''";
							} else {
								Tspans[x].innerHTML = "?";
							}
						}
					}						
				}
			}
		}
	}
}


//
// First time using the metronome dialog
//
function FirstTimeUsingMetronomeDialog(callback){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","FirstTimeUsingMetronomeDialog");

    var modal_msg  = '<p style="text-align:center;font-size:20pt;font-family:helvetica">About the Metronome in the Player</p>';
 	   modal_msg += '<p style="font-size:14pt;line-height:20pt;font-family:helvetica;margin-top:36px;">Since this is your first time using the metronome feature, there are some things you should be aware of:</p>';
	   modal_msg += '<p style="font-size:14pt;line-height:20pt;font-family:helvetica;margin-top:36px;">Behind-the-scenes the metronome in the player the ABC chord system to do its job.</p>';
	   modal_msg += '<p style="font-size:14pt;line-height:20pt;font-family:helvetica;margin-top:36px;">When using the metronome, any chords in your tune will be temporarily hidden.</p>';
	   modal_msg += '<p style="font-size:14pt;line-height:20pt;font-family:helvetica;margin-top:36px;">The "E" chord you will see at the start of the tune is used to start the metronome playback.</p>';
	   modal_msg += '<p style="font-size:14pt;line-height:20pt;font-family:helvetica;margin-top:36px;">Don\'t worry, the original chords in your ABC are safe!</p>';

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 150, scrollWithPage: (AllowDialogsToScroll()) }).then(function(){callback();});

}

//
// Toggle the metronome version of the tune;
//
function ToggleMetronome(){

	// One time dialog when user first uses the metronome feature
	if (gLocalStorageAvailable){

		if (gIsFirstTimeUsingMetronome){

			gIsFirstTimeUsingMetronome = false;

			localStorage.IsFirstTimeUsingMetronome = false;

			FirstTimeUsingMetronomeDialog(callback);

		}
		else{

			callback();

		}
	}
	else{

		gIsFirstTimeUsingMetronome = false;

		callback();

	}

	function callback(){

		gPlayMetronome = !gPlayMetronome;

		gTheOKButton.click();

		setTimeout(function() {

			if (gPlayMetronome){

				if (!gPlayerABCMetronome){

					gPlayerABCMetronome = inject_one_metronome(gPlayerABC, false);

					// Injection failed due to unsupported meter
					if (!gPlayerABCMetronome){

						gPlayMetronome = false; 

					    var modal_msg  = '<p style="text-align:center;font-size:20pt;font-family:helvetica">Metronome Not Available for this Meter</p>';
					 	   modal_msg += '<p style="font-size:14pt;line-height:20pt;font-family:helvetica;">No metronome pattern is available for the meter of this tune.</p>';
					 	   modal_msg += '<p style="font-size:14pt;line-height:20pt;font-family:helvetica;">Only the original version can be played.</p>';

						DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) }).then(
							function(){
								PlayABCDialog(gPlayerABC,null,null,false);
							});

						return;

					}

				}

				// Launch the player with the metronome injected tune
				PlayABCDialog(gPlayerABCMetronome,null,null,true);

			}
			else{

				// Launch the original tune
				PlayABCDialog(gPlayerABC,null,null,false);

			}

		},250);		
	}

}

//
// Shared player cursor control
//
var gPlayerContainerRect = null;
var gPlayerHolder = null;

function CursorControl() {

	var self = this;

	self.onReady = function() {
	};

	self.onStart = function() {
		var svg = document.querySelector("#playback-paper svg");
		var cursor = document.createElementNS("http://www.w3.org/2000/svg", "line");
		cursor.setAttribute("class", "abcjs-cursor");
		cursor.setAttributeNS(null, 'x1', 0);
		cursor.setAttributeNS(null, 'y1', 0);
		cursor.setAttributeNS(null, 'x2', 0);
		cursor.setAttributeNS(null, 'y2', 0);
		svg.appendChild(cursor);

	};

	self.beatSubdivisions = 2;

	self.onBeat = function(beatNumber, totalBeats, totalTime) {
	};

	self.onEvent = function(ev) {

		if (ev.measureStart && ev.left === null)
			return; // this was the second part of a tie across a measure line. Just ignore it.

		var lastSelection = document.querySelectorAll("#playback-paper svg .highlight");
		for (var k = 0; k < lastSelection.length; k++)
			lastSelection[k].classList.remove("highlight");

		for (var i = 0; i < ev.elements.length; i++ ) {
			var note = ev.elements[i];
			for (var j = 0; j < note.length; j++) {
				note[j].classList.add("highlight");
			}
		}

		var cursor = document.querySelector("#playback-paper svg .abcjs-cursor");

		if (cursor) {

			cursor.setAttribute("x1", ev.left - 2);
			cursor.setAttribute("x2", ev.left - 2);
			cursor.setAttribute("y1", ev.top);
			cursor.setAttribute("y2", ev.top + ev.height);

			// Don't try to autoscroll cursors larger than
			if (gAutoscrollPlayer){

				// Get the SVG element's position relative to the container
				const svgRect = cursor.getBoundingClientRect();

				//
				// Original bottom scroll code, didn't have any slop
				//
				// // Check if the SVG element is above or below the container's visible area
				// if (svgRect.top < gPlayerContainerRect.top) {

				// 	// Scroll up to make the SVG element visible at the top
				// 	gPlayerHolder.scrollTop += svgRect.top - gPlayerContainerRect.top;

				// } else if (svgRect.bottom > gPlayerContainerRect.bottom) {

				// 	// Scroll down to make the SVG element visible at the bottom
				// 	//gPlayerHolder.scrollTop += svgRect.bottom - gPlayerContainerRect.bottom + 16;

				// }

				var containerHeight = gPlayerContainerRect.bottom-gPlayerContainerRect.top;

				// Keep several lines visible under the currently playing line
				var theScrollTarget = 3*(containerHeight)/4;

				// Check if the SVG element is above or below the container's visible area
				if (svgRect.top < gPlayerContainerRect.top) {

					// Scroll up to make the SVG element visible at the top
					gPlayerHolder.scrollTop += svgRect.top - gPlayerContainerRect.top;

				} else if (svgRect.bottom > theScrollTarget) {

					var cursorHeight = svgRect.bottom - svgRect.top;

					// This prevents very tall scores from jumping up and down on each cursor event
					if (cursorHeight <= theScrollTarget){

						// Scroll down to make the SVG element visible at the bottom with additional space underneath
						gPlayerHolder.scrollTop += svgRect.bottom - theScrollTarget;
					}
					else{

						//console.log("override case");

						// Scroll up to make the SVG element visible at the top
						gPlayerHolder.scrollTop += svgRect.top - gPlayerContainerRect.top;

					}
				}
			}

		}
	};

	self.onFinished = function() {
		var els = document.querySelectorAll("svg .highlight");
		for (var i = 0; i < els.length; i++ ) {
			els[i].classList.remove("highlight");
		}
		var cursor = document.querySelector("#playback-paper svg .abcjs-cursor");
		if (cursor) {
			cursor.setAttribute("x1", 0);
			cursor.setAttribute("x2", 0);
			cursor.setAttribute("y1", 0);
			cursor.setAttribute("y2", 0);
		}
	};

}

// 
// Tune Play Dialog
//
// callback and val are used for batch export automation
//

function PlayABCDialog(theABC,callback,val,metronome_state){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","PlayABCDialog");

	gMIDIbuffer = null;
	gTheOKButton = null;
	gPlayMetronome = false;

	// We came in because of a metronome state change, don't init the tune cache
	if (metronome_state){

		gPlayMetronome = metronome_state;

	}
	else{

		gPlayerABC = theABC;

		gPlayMetronome = false;

		gPlayerABCMetronome = null;

	}

	var soundFontRequested = ScanTuneForSoundFont(theABC);

	if (soundFontRequested){

		var theOriginalSoundFont = gTheActiveSoundFont;

		switch (soundFontRequested){
			case "fluid":
				gTheActiveSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/";
				break;
			case "musyng":
				gTheActiveSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/MusyngKite/";
				break;
			case "fatboy":
				gTheActiveSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/FatBoy/";
				break;
			case "canvas":
				gTheActiveSoundFont = "https://michaeleskin.com/abctools/soundfonts/canvas/";
				break;
			case "mscore":
				gTheActiveSoundFont = "https://michaeleskin.com/abctools/soundfonts/mscore/";
				break;
		}

		// New soundfont requested, clear the cache
		if (gTheActiveSoundFont != theOriginalSoundFont){
			
			// Clear the soundfont cache
			gSoundsCacheABCJS = {};

		}

	}
	else{

		// No sound font requested, lets see if the current font is the user default
		if (gTheActiveSoundFont != gDefaultSoundFont){

			gTheActiveSoundFont = gDefaultSoundFont;

			// Clear the soundfont cache
			gSoundsCacheABCJS = {};

		}
	}

	// Setup any custom boom-chick rhythm patterns found
	var boomChickOK = ScanTuneForBoomChick(theABC);

	// Incorrectly formatted %abcjs_boomchick detected, put up an alert
	if (boomChickOK != ""){

		DayPilot.Modal.alert('<p style="font-family:helvetica;font-size:14pt;"><strong>There is an issue with your custom rhythm directive:</strong></p><p style="font-family:helvetica;font-size:14pt;"><strong>'+boomChickOK+'</strong></p><p style="font-family:helvetica;font-size:14pt;">Format should be:</p><p style="font-family:helvetica;font-size:14pt;">%abcjs_boomchick meter rhythm_pattern_string partial_measure</p><p style="font-family:helvetica;font-size:14pt;">Valid rhythm_pattern_string characters are:</p><p style="font-family:helvetica;font-size:14pt;">B - Boom, b - Alternate Boom, c - Chick, and x - Silence.</p><p style="font-family:helvetica;font-size:14pt;">Examples:</p><p style="font-family:helvetica;font-size:14pt;">%abcjs_boomchick 7/8 Bccbxbx 3</p><p style="font-family:helvetica;font-size:14pt;">%abcjs_boomchick 10/8 Bccbccbxbx 5</p><p style="font-family:helvetica;font-size:14pt;">The number of characters in the pattern_string must match the meter numerator.</p><p style="font-family:helvetica;font-size:14pt;">partial_measure sets how many beats must be present in a partial measure in the ABC to use the custom pattern.</p><p style="font-family:helvetica;font-size:14pt;">partial_measure is optional and defaults to half of the meter numerator rounded down to the next lowest integer (min is 1).</p>',{ theme: "modal_flat", top: 50, scrollWithPage: (AllowDialogsToScroll()) });

		return;
	}

	// Setup any swing found
	ScanTuneForSwingInjection(theABC);
	
	var instrument = GetRadioValue("notenodertab");

	var abcOptions = GetABCJSParams(instrument);

	abcOptions.oneSvgPerLine = false;

	// Clear the tab label if present to compress vertical space
	if (instrument != "noten" ){

		// Sanity check the options first
		if (abcOptions.tablature && (abcOptions.tablature.length > 0)){
			abcOptions.tablature[0].label = "";
		}
	}
	

	function setTune(userAction) {

		synthControl.disable(true);

		var visualObj = ABCJS.renderAbc("playback-paper", theABC, abcOptions)[0];

		// Post process whistle or note name tab
		postProcessTab("playback-paper",instrument,true);

		var midiBuffer = new ABCJS.synth.CreateSynth();

		gMIDIbuffer = midiBuffer;

		midiBuffer.init({
			visualObj: visualObj
		}).then(function (response) {
			console.log(response);
			if (synthControl) {

				var fadeLength = computeFade(theABC);

				synthControl.setTune(visualObj, userAction, {fadeLength:fadeLength}).then(function (response) {
					
					console.log("Audio successfully loaded.");

					if (callback){
						callback(val,gTheOKButton);
					}

					// Are we using the trainer touch controls
					if (gTrainerTouchControls){

						//debugger;

						var elems1 = document.getElementsByClassName("abcjs-midi-clock");
						var elems2 = document.getElementsByClassName("abcjs-midi-current-tempo-wrapper");

						if (elems1 && elems2 && (elems1.length > 0) && (elems2.length > 0)){

							gSynthControl = synthControl;
							
							var elem = elems1[0];
							elem.onclick = DecrementTempo;
							elem = elems2[0];
							elem.onclick = IncrementTempo;

						}
					
					}
					
				}).catch(function (error) {
					
					console.log("Problem loading audio for this tune");

				});
			}
		}).catch(function (error) {

			console.log("Problem loading audio for this tune");

		});
	}

	function StopPlay(){

		gSynthControl = null;
	
		if (synthControl){
				
			synthControl.destroy();

			synthControl = null;


		}
	}

	var cursorControl = new CursorControl();

	var synthControl;

	function initPlay() {

		// Clear the looper callback
		gLoopCallback = null;
		gStartPlayCallback = null;

		// Clear the player in pause flag
		gPlayerInPause = false;

		// Adapt the top based on the player control size
		var theTop = 50;

		var theHeight = window.innerHeight - 340;

	   	modal_msg = '<div id="playerholder" style="height:'+theHeight+'px;overflow-y:auto;margin-bottom:15px;">';

		if (gLargePlayerControls){
			modal_msg += '<div id="abcplayer" class="abcjs-large">';
		}
		else{
			modal_msg += '<div id="abcplayer">';			
		}

	   	modal_msg += '<div id="playback-paper"></div>';
	   	modal_msg += '</div>';

	   	modal_msg += '</div>';

	   	// Add the player controls
		if (gLargePlayerControls){
	   		modal_msg += '<div id="playback-audio" class="abcjs-large"></div>';
		}
		else{
	   		modal_msg += '<div id="playback-audio"></div>';
		}

	   	// Add the download buttons
		modal_msg += '<p style="text-align:center;margin:0px;margin-top:22px">'
		modal_msg += '<input id="abcplayer_exportbutton" class="abcplayer_exportbutton btn btn-exportaudiomidi" onclick="ExportAudioMIDI();" type="button" value="Save Audio or MIDI" title="Brings up a dialog where you can export the tune in .WAV, .MP3, or MIDI formats">'
		modal_msg += '<input id="abcplayer_trainer" class="btn btn-looper abcplayer_trainer" onclick="TuneTrainerLaunchFromPlayer()" type="button" value="Start Tune Trainer" title="Opens the Tune Trainer for practicing tunes with increasing tempos">';
		modal_msg += '<input id="abcplayer_metronomebutton" class="abcplayer_metronome button btn btn-metronome" onclick="ToggleMetronome();" type="button" value="Enable Metronome" title="Enables/disables the metronome">'
		modal_msg += '<a id="abcplayer_help" href="https://michaeleskin.com/abctools/userguide.html#playing_your_tunes" target="_blank" style="text-decoration:none;" title="Learn more about the Player">💡</a>';
		modal_msg += '</p>';

	   	// Scale the player for larger screens
		var windowWidth = window.innerWidth;

		var instrument = GetRadioValue("notenodertab");

		var theWidth = windowWidth * 0.45;

		if (isDesktopBrowser()){

			if (theWidth < 850){
				theWidth = 850;
			}

		}
		else{

			theWidth = 800;  
			
		}

		DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: theTop, width:theWidth, okText:"Close", scrollWithPage: (isMobileBrowser()) });

		// Idle the metronome button
		if ((metronome_state) && (metronome_state == true)){

			var elem = document.getElementById("abcplayer_metronomebutton");

			elem.value = "Disable Metronome";

		}

		var theOKButtons = document.getElementsByClassName("modal_flat_ok");

		// Find the button that says "Close" and hook its click handler to make sure music stops on close
		// Need to search through the modals since there may be a first time share dialog also present
		// the first time someone plays a linked PDF tune

		var theOKButton = null;

		for (var i=0;i<theOKButtons.length;++i){

			theOKButton = theOKButtons[i];

			if (theOKButton.innerText == "Close"){

				gTheOKButton = theOKButton;

				var originalOnClick = theOKButton.onclick;

				theOKButton.onclick = function(){

					originalOnClick(); 
					StopPlay(); 

				    // Focus after operation
				    FocusAfterOperation();

					// If on iOS and the muting controller installed, dispose it now
					if (gIsIOS){

						if (gTheMuteHandle){
						 	gTheMuteHandle.dispose();
  							gTheMuteHandle = null;
  						}
					}

				};

				break;

			}
		}

		if (ABCJS.synth.supportsAudio()) {
			
			synthControl = new ABCJS.synth.SynthController();

			synthControl.load("#playback-audio", cursorControl, {displayLoop: true, displayRestart: true, displayPlay: true, displayProgress: true, displayWarp: true});


		} else {

			document.querySelector("#playback-audio").innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>";

		}

		setTune(false);

		// Cache autoscroll values early
		gPlayerHolder = document.getElementById("playerholder");
		gPlayerContainerRect = gPlayerHolder.getBoundingClientRect();

	}

	// Try to deal with tab deactivation muting
	if (gIsIOS){

		var context = ABCJS.synth.activeAudioContext();

		// Decide on some parameters
		let allowBackgroundPlayback = false; // default false, recommended false
		let forceIOSBehavior = false; // default false, recommended false

		gTheMuteHandle = null;
		
		// Pass it to unmute if the context exists... ie WebAudio is supported
		if (context)
		{
		  // If you need to be able to disable unmute at a later time, you can use the returned handle's dispose() method
		  // if you don't need to do that (most folks won't) then you can simply ignore the return value
		  gTheMuteHandle = unmute(context, allowBackgroundPlayback, forceIOSBehavior);
		  
		}
	}

	initPlay();

}

//
// Based on the global injection configuration, pre-process the %%MIDI directives in the ABC
function PreProcessPlayABC(theTune){

	// Override any ABC play values?

	// Always override programs and volumes?

	if (gOverridePlayMIDIParams){

		theTune = OverrideOneTuneMIDIParams(theTune, gTheMelodyProgram, gTheChordProgram, gTheBassVolume, gTheChordVolume);
	}

	// Inject programs?
	if (gAlwaysInjectPrograms){

		// Check first for any existing program messages before replacing
		var searchRegExp = /^%%MIDI chordprog.*$/m

		var chordProgramRequested = theTune.match(searchRegExp);

		if (!((chordProgramRequested) && (chordProgramRequested.length > 0))){

			theTune = InjectOneTuneMIDIProgramAboveTune(theTune, gTheChordProgram, true);

		}

		searchRegExp = /^%%MIDI program.*$/m

		var melodyProgramRequested = theTune.match(searchRegExp);

		if (!((melodyProgramRequested) && (melodyProgramRequested.length > 0))){

			theTune = InjectOneTuneMIDIProgramAboveTune(theTune, gTheMelodyProgram, false);

		}
	}


	// Inject volumes?
	if (gAlwaysInjectVolumes){

		// Check first for any existing volume messages before replacing
		var searchRegExp = /^%%MIDI bassvol.*$/m

		var bassVolumeRequested = theTune.match(searchRegExp);

		if (!((bassVolumeRequested) && (bassVolumeRequested.length > 0))){

			theTune = InjectOneTuneMIDIVolumeAboveTune(theTune, gTheBassVolume, false);

		}

		var searchRegExp = /^%%MIDI chordvol.*$/m

		var chordVolumeRequested = theTune.match(searchRegExp);

		if (!((chordVolumeRequested) && (chordVolumeRequested.length > 0))){

			theTune = InjectOneTuneMIDIVolumeAboveTune(theTune, gTheChordVolume, true);

		}

	}

	return(theTune);

}

//
// Is a tune a hornpipe?
//
function tuneIsHornpipe(theTune){

	// First look for a Hornpipe rhythm request
	var searchRegExp = /^R:Hornpipe.*$/gm

	// Detect Hornpipe annotation
	var testHornpipe = theTune.match(searchRegExp);

	if ((testHornpipe) && (testHornpipe.length > 0)){

		return true;

	}

	searchRegExp = /^R: Hornpipe.*$/gm

	// Detect Hornpipe annotation
	testHornpipe = theTune.match(searchRegExp);

	if ((testHornpipe) && (testHornpipe.length > 0)){

		return true;

	}

	searchRegExp = /^R:hornpipe.*$/gm

	// Detect Hornpipe annotation
	testHornpipe = theTune.match(searchRegExp);

	if ((testHornpipe) && (testHornpipe.length > 0)){

		return true;

	}

	searchRegExp = /^R: hornpipe.*$/gm

	// Detect Hornpipe annotation
	testHornpipe = theTune.match(searchRegExp);

	if ((testHornpipe) && (testHornpipe.length > 0)){

		return true;

	}

	return false;
}

//
// Scan tune for swing annotation
//
function ScanTuneForSwingInjection(theTune){

	//debugger;

	// Default is no swing
	gAddSwing = false;

	// Default is typical hornpipe swing factor
	gSwingFactor = gAutoSwingFactor;

	// Zero out the swing offset
	gSwingOffset = 0;

	var searchRegExp;
	var doAddSwing;

	// Check if autoswing enabled
	if (gAutoSwingHornpipes){

		gAddSwing = tuneIsHornpipe(theTune);

	}

	// Next search for an addswing override
	searchRegExp = /^%swing.*$/gm

	// Detect addswing annotation
	doAddSwing = theTune.match(searchRegExp);

	if ((doAddSwing) && (doAddSwing.length > 0)){

		gAddSwing = true;

		var theParamString = doAddSwing[0].replace("%swing","");

		theParamString = theParamString.trim();

		var theParams = theParamString.split(" ");

		if (theParams.length >= 1){

			var theSwingValueFound = theParams[0];

			var swingValue = parseFloat(theSwingValueFound);

			if (!isNaN(swingValue)){

				gSwingFactor = swingValue;

			}
		}

		if (theParams.length > 1){

			var theSwingOffsetValueFound = theParams[1];
			
			var swingOffsetValue = parseInt(theSwingOffsetValueFound);

			if (!isNaN(swingOffsetValue)){

				gSwingOffset = swingOffsetValue;

			}
		}
	}

	// Have they disabled swing?

	searchRegExp = /^%noswing.*$/gm

	// Detect noswing annotation
	doAddSwing = theTune.match(searchRegExp);

	if ((doAddSwing) && (doAddSwing.length > 0)){

		gAddSwing = false;

	}

	// Next search for an grace_duration_ms override
	searchRegExp = /^%grace_duration_ms.*$/gm

	// Detect grace_duration_ms annotation
	var doGraceDuration = theTune.match(searchRegExp);

	// Default is 45 ms
	gGraceDuration = 0.045;

	if ((doGraceDuration) && (doGraceDuration.length > 0)){

		var theParamString = doGraceDuration[0].replace("%grace_duration_ms","");

		theParamString = theParamString.trim();

		var theParams = theParamString.split(" ");

		if (theParams.length >= 1){

			var theDurationValueFound = theParams[0];

			var durationValue = parseInt(theDurationValueFound);

			if (!isNaN(durationValue)){

				if ((durationValue >= 0) && (durationValue <= 150)){
					gGraceDuration = durationValue/1000;
				}

			}
		}
	}

	// Is there a Q: tempo tag?
	gGraceMissingTempo = true;

	// Next search for an tempo tag
	searchRegExp = /^Q:.*$/gm

	// Detect tempo tag
	var hasTempo = theTune.match(searchRegExp);

	if ((hasTempo) && (hasTempo.length > 0)){
		gGraceMissingTempo = false;
	}

	// Is this a jig-type rhythm?
	gGraceTuneType = getTuneRhythmType(theTune);

}


//
// Scan tune for custom rhythm pattern request
//
// Returns "" if there are no issues with the custom rhythm patterns found
// Returns the bad %abcjs_boomchick directive if there is an issue
//
function ScanTuneForBoomChick(theTune){

	// Reset the custom rhythm patterns global
	gRhythmPatternOverrides = {};

	// Search for a boomchick request
	var searchRegExp = /^%abcjs_boomchick.*$/gm

	// Detect boomchick annotation
	var boomchick = theTune.match(searchRegExp);

	if ((boomchick) && (boomchick.length > 0)){

		for (var i=0; i<boomchick.length; ++i){

			var theOriginalBoomChick = boomchick[i];

			var theBoomChick = theOriginalBoomChick;

			var boomChickFound = theBoomChick.replace("%abcjs_boomchick","");
			
			boomChickFound = boomChickFound.trim();

			//console.log("abcjs_boomchick found: "+boomChickFound);

			// Split the directive
			var theSplits = boomChickFound.split(" ");

			if ((theSplits.length == 2 || theSplits.length == 3)){
				
				var theMeter = theSplits[0];

				var theBoomChick = theSplits[1];

				var theMeterSplits = theMeter.split("/");

				if (theMeterSplits.length != 2){
					//console.log("ScanTuneForBoomChick: Bad meter")
					return theOriginalBoomChick;
				}

				// Sanity check the meter
				var theNum = theMeterSplits[0];

				if (isNaN(parseInt(theNum))){
					//console.log("ScanTuneForBoomChick: Bad numerator")
					return theOriginalBoomChick;
				}

				theNum = parseInt(theNum);

				var theDenom = theMeterSplits[1];

				if (isNaN(parseInt(theDenom))){
					//console.log("ScanTuneForBoomChick: Bad denominator")
					return theOriginalBoomChick;
				}

				theDenom = parseInt(theDenom);

				var theThreshold;

				// If threshold specified, use it
				if (theSplits.length == 3){

					theThreshold = theSplits[2];

					// Sanity check the threshold
					if (isNaN(parseInt(theThreshold))){
						//console.log("ScanTuneForBoomChick: Bad threshold")
						return theOriginalBoomChick;
					}

					theThreshold = parseInt(theThreshold);

					// Sanity check the threshold again
					if ((theThreshold < 1) || (theThreshold > theNum)){
						//console.log("ScanTuneForBoomChick: Threshold negative or larger than pattern length")
						return theOriginalBoomChick;
					}

				}
				else{

					// Otherwise default to half of the pattern length
					theThreshold = theNum / 2;
					
					theThreshold = Math.floor(theThreshold);

					if (theThreshold == 0){
						theThreshold = 1;
					}
					
					//console.log("Computed theThreshold for theNum "+theNum+" is "+theThreshold);

				}

				// Split the boom chick pattern
				var theBoomChickSplits = theBoomChick.split("");

				var nPatternElements = theBoomChickSplits.length;

				// Sanity check the pattern
				if (nPatternElements != theNum){
					//console.log("ScanTuneForBoomChick: Mismatch of meter and beat string length")
					return theOriginalBoomChick;
				}

				// Map the boom-chicks
				var thePattern = [];

				for (var j=0;j<nPatternElements;++j){

					var thisSplit = theBoomChickSplits[j];

					switch (thisSplit){
						case "B":
							thePattern.push("boom");
							break;
						case "b":
							thePattern.push("boom2");
							break;
						case "c":
							thePattern.push("chick");
							break;
						case "x":
							thePattern.push("");
							break;
						default:
							//console.log("got bad pattern")
							return theOriginalBoomChick;
							break;
					}

				}

				// Store the final pattern for abcjs
				// Only add if not already present
				if (!gRhythmPatternOverrides[theMeter]){
					
					// console.log("Adding pattern for theMeter = "+theMeter);
					// console.log("theThreshold = "+theThreshold);
					// console.log("thePattern = "+JSON.stringify(thePattern));

					gRhythmPatternOverrides[theMeter] = {pattern:thePattern,threshold:theThreshold};

				}
			}
			else{

				// console.log("Missing parameters in %abcjs_boomchick");
				return theOriginalBoomChick

			}
		}
	}

	return "";
}

//
// Scan tune for soundfont request
//
function ScanTuneForSoundFont(theTune){

	var soundFontFound = null;

	// Search for a soundfont request
	var searchRegExp = /^%abcjs_soundfont.*$/gm

	// Detect soundfont annotation
	var soundfont = theTune.match(searchRegExp);

	if ((soundfont) && (soundfont.length > 0)){

		soundFontFound = soundfont[soundfont.length-1].replace("%abcjs_soundfont","");
		
		soundFontFound = soundFontFound.trim();

		soundFontFound = soundFontFound.toLowerCase();

	}

	return soundFontFound;
}

//
// Swing Explorer
//
function SwingExplorer(){

	if (gAllowCopy){

		// Play back locally

		// Try to find the current tune
		var theSelectedABC = findSelectedTune();

		if (theSelectedABC == ""){
			// This should never happen
			return;
		}

		// Pre-process the ABC to inject any requested programs or volumes
		var theProcessedABC = PreProcessPlayABC(theSelectedABC);

		// Play back locally in-tool	
		SwingExplorerDialog(theSelectedABC,theProcessedABC,false);

	}
}

//
// Reload the player with a new swing offset
//
function SwingExplorerRegenerate(){

	var bDoReload = false;

	// Grab the swing factor
	var theSwingFactor = document.getElementById("swing_explorer_factor").value;

	theSwingFactor = parseFloat(theSwingFactor);

	if (!isNaN(theSwingFactor) && ((theSwingFactor >= -0.9) && (theSwingFactor <= 0.9))){

		gSwingFactor = theSwingFactor;

		bDoReload = true;
	}

	// Grab the swing offset
	var theSwingOffset = document.getElementById("swing_explorer_offset").value;

	theSwingOffset = parseInt(theSwingOffset);

	if ((!isNaN(theSwingOffset)) && (theSwingOffset >= 0)){

		gSwingOffset = theSwingOffset;

		bDoReload = true;

	}

	if (bDoReload){

		gTheOKButton.click();

		setTimeout(function() {

			// Launch the player with the swing injected tune
			SwingExplorerDialog(gPlayerABCSwingExplorerOriginal,gPlayerABCSwingExplorerProcessed,true);

		},250);

	}
}


//
// Scan tune for swing annotation for the swing explorer
//
function ScanTuneForSwingExplorer(theTune){

	//debugger;

	// Default is swing while running the swing explorer
	gAddSwing = true;

	// Default is typical hornpipe swing factor
	gSwingFactor = 0.0;

	// Zero out the swing offset
	gSwingOffset = 0;

	// Check if autoswing enabled
	if (gAutoSwingHornpipes){

		if (tuneIsHornpipe(theTune)){

			// Default is typical hornpipe swing factor
			gSwingFactor = gAutoSwingFactor;

		}
	
	}

	var searchRegExp;
	var doAddSwing;

	// Next search for an addswing override
	searchRegExp = /^%swing.*$/gm

	// Detect addswing annotation
	doAddSwing = theTune.match(searchRegExp);

	if ((doAddSwing) && (doAddSwing.length > 0)){

		var theParamString = doAddSwing[0].replace("%swing","");

		theParamString = theParamString.trim();

		var theParams = theParamString.split(" ");

		if (theParams.length >= 1){

			var theSwingValueFound = theParams[0];

			var swingValue = parseFloat(theSwingValueFound);

			if (!isNaN(swingValue)){

				gSwingFactor = swingValue;

			}
		}

		if (theParams.length > 1){

			var theSwingOffsetValueFound = theParams[1];
			
			var swingOffsetValue = parseInt(theSwingOffsetValueFound);

			if (!isNaN(swingOffsetValue)){

				gSwingOffset = swingOffsetValue;

			}
		}
	}

}

//
// Inject the tune with the Swing Explorer values
//

function SwingExplorerInject(){

	var bDoInjectSwingFactor = false;

	var theSwingFactor = document.getElementById("swing_explorer_factor").value;

	theSwingFactor = parseFloat(theSwingFactor);

	if (!isNaN(theSwingFactor) && ((theSwingFactor >= -0.9) && (theSwingFactor <= 0.9))){

		bDoInjectSwingFactor = true;
	}

	var bDoInjectSwingOffset = false;

	if (bDoInjectSwingFactor){

		// Grab the swing offset
		var theSwingOffset = document.getElementById("swing_explorer_offset").value;

		theSwingOffset = parseInt(theSwingOffset);

		if ((!isNaN(theSwingOffset)) && (theSwingOffset >= 0)){

			bDoInjectSwingOffset = true;

		}

		var theInjectString = "%swing "+theSwingFactor;

		if (bDoInjectSwingOffset){

			theInjectString += " "+theSwingOffset;

		}

		//
		// Strip any existing %swing out of the current tune
		//

		var searchRegExp = /^%swing.*[\r\n]*/gm 

		var tuneWithNoSwing = gPlayerABCSwingExplorerOriginal.replaceAll(searchRegExp, "");

		var tuneWithSwing = InjectStringBelowTuneHeader(tuneWithNoSwing,theInjectString);

		// Seeing extra line breaks after the inject
		tuneWithSwing = tuneWithSwing.replace("\n\n","");

		// Try and keep the same tune after the redraw for immediate play
		var theSelectionStart = gTheABC.selectionStart;

		// Stuff in the injected ABC
		var theABC = gTheABC.value;

		theABC = theABC.replace(gPlayerABCSwingExplorerOriginal,tuneWithSwing);
		
		gTheABC.value = theABC;

		// Set dirty
		gIsDirty = true;

		// For future injects
		gPlayerABCSwingExplorerOriginal = tuneWithSwing;

		// Set the select point
		gTheABC.selectionStart = theSelectionStart;
	    gTheABC.selectionEnd = theSelectionStart;

	    // Focus after operation
	    FocusAfterOperation();

	}

}

// 
// Swing Explorer Dialog
//

var gSwingExplorerFactor = 0;
var gSwingExplorerOffset = 0;
var gPlayerABCSwingExplorerOriginal = null;
var gPlayerABCSwingExplorerProcessed = null;

function SwingExplorerDialog(theOriginalABC, theProcessedABC, swing_explorer_state){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","SwingExplorerDialog");

	gMIDIbuffer = null;
	gTheOKButton = null;

	// We came in because of a swing change, don't init the tune cache
	if (!swing_explorer_state){

		gPlayerABCSwingExplorerOriginal = theOriginalABC;
		gPlayerABCSwingExplorerProcessed = theProcessedABC;

	}

	var soundFontRequested = ScanTuneForSoundFont(theProcessedABC);

	if (soundFontRequested){

		var theOriginalSoundFont = gTheActiveSoundFont;

		switch (soundFontRequested){
			case "fluid":
				gTheActiveSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/";
				break;
			case "musyng":
				gTheActiveSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/MusyngKite/";
				break;
			case "fatboy":
				gTheActiveSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/FatBoy/";
				break;
			case "canvas":
				gTheActiveSoundFont = "https://michaeleskin.com/abctools/soundfonts/canvas/";
				break;
			case "mscore":
				gTheActiveSoundFont = "https://michaeleskin.com/abctools/soundfonts/mscore/";
				break;
		}

		// New soundfont requested, clear the cache
		if (gTheActiveSoundFont != theOriginalSoundFont){
			
			// Clear the soundfont cache
			gSoundsCacheABCJS = {};

		}

	}
	else{

		// No sound font requested, lets see if the current font is the user default
		if (gTheActiveSoundFont != gDefaultSoundFont){

			gTheActiveSoundFont = gDefaultSoundFont;

			// Clear the soundfont cache
			gSoundsCacheABCJS = {};

		}
	}

	// Setup any custom boom-chick rhythm patterns found
	var boomChickOK = ScanTuneForBoomChick(theProcessedABC);

	// Incorrectly formatted %abcjs_boomchick detected, put up an alert
	if (boomChickOK != ""){

		DayPilot.Modal.alert('<p style="font-family:helvetica;font-size:14pt;"><strong>There is an issue with your custom rhythm directive:</strong></p><p style="font-family:helvetica;font-size:14pt;"><strong>'+boomChickOK+'</strong></p><p style="font-family:helvetica;font-size:14pt;">Format should be:</p><p style="font-family:helvetica;font-size:14pt;">%abcjs_boomchick meter rhythm_pattern_string partial_measure</p><p style="font-family:helvetica;font-size:14pt;">Valid rhythm_pattern_string characters are:</p><p style="font-family:helvetica;font-size:14pt;">B - Boom, b - Alternate Boom, c - Chick, and x - Silence.</p><p style="font-family:helvetica;font-size:14pt;">Examples:</p><p style="font-family:helvetica;font-size:14pt;">%abcjs_boomchick 7/8 Bccbxbx 3</p><p style="font-family:helvetica;font-size:14pt;">%abcjs_boomchick 10/8 Bccbccbxbx 5</p><p style="font-family:helvetica;font-size:14pt;">The number of characters in the pattern_string must match the meter numerator.</p><p style="font-family:helvetica;font-size:14pt;">partial_measure sets how many beats must be present in a partial measure in the ABC to use the custom pattern.</p><p style="font-family:helvetica;font-size:14pt;">partial_measure is optional and defaults to half of the meter numerator rounded down to the next lowest integer (min is 1).</p>',{ theme: "modal_flat", top: 50, scrollWithPage: (AllowDialogsToScroll()) });

		return;
	}

	// Setup any swing found (Only done the first time)
	if (!swing_explorer_state){

		ScanTuneForSwingExplorer(theProcessedABC);

	}
	
	var instrument = GetRadioValue("notenodertab");

	var abcOptions = GetABCJSParams(instrument);

	abcOptions.oneSvgPerLine = false;

	// Clear the tab label if present to compress vertical space
	if (instrument != "noten" ){

		// Sanity check the options first
		if (abcOptions.tablature && (abcOptions.tablature.length > 0)){
			abcOptions.tablature[0].label = "";
		}
	}
	

	function setTune(userAction) {

		synthControl.disable(true);

		var visualObj = ABCJS.renderAbc("playback-paper", theProcessedABC, abcOptions)[0];

		// Post process whistle or note name tab
		postProcessTab("playback-paper",instrument,true);

		var midiBuffer = new ABCJS.synth.CreateSynth();

		gMIDIbuffer = midiBuffer;

		midiBuffer.init({
			visualObj: visualObj
		}).then(function (response) {
			console.log(response);
			if (synthControl) {

				var fadeLength = computeFade(theProcessedABC);

				synthControl.setTune(visualObj, userAction, {fadeLength:fadeLength}).then(function (response) {
					
					console.log("Audio successfully loaded.");

					// Are we using the trainer touch controls
					if (gTrainerTouchControls){

						//debugger;

						var elems1 = document.getElementsByClassName("abcjs-midi-clock");
						var elems2 = document.getElementsByClassName("abcjs-midi-current-tempo-wrapper");

						if (elems1 && elems2 && (elems1.length > 0) && (elems2.length > 0)){
							
							gSynthControl = synthControl;

							var elem = elems1[0];
							elem.onclick = DecrementTempo;
							elem = elems2[0];
							elem.onclick = IncrementTempo;

						}
					
					}


				}).catch(function (error) {
					
					console.log("Problem loading audio for this tune");

				});
			}
		}).catch(function (error) {

			console.log("Problem loading audio for this tune");

		});
	}

	function StopPlay(){

		gSynthControl = null;

		if (synthControl){
				
			synthControl.destroy();

			synthControl = null;
		}
	}

	var cursorControl = new CursorControl();

	var synthControl;

	function initPlay() {

		// Clear the looper callback
		gLoopCallback = null;
		gStartPlayCallback = null;

		// Clear the player in pause flag
		gPlayerInPause = false;

		// Adapt the top based on the player control size
		var theTop = 50;

		var theHeight = window.innerHeight - 400;

	   	modal_msg = '<div id="playerholder" style="height:'+theHeight+'px;overflow-y:auto;margin-bottom:15px;">';

		if (gLargePlayerControls){
			modal_msg += '<div id="abcplayer" class="abcjs-large">';
		}
		else{
			modal_msg += '<div id="abcplayer">';			
		}

	   	modal_msg += '<div id="playback-paper"></div>';
	   	modal_msg += '</div>';

	   	modal_msg += '</div>';

	   	// Add the player controls
		if (gLargePlayerControls){
	   		modal_msg += '<div id="playback-audio" class="abcjs-large"></div>';
		}
		else{
	   		modal_msg += '<div id="playback-audio"></div>';
		}

	   	// Add the swing explorer controls
		if (isMobileBrowser()){

			modal_msg += '<p class="configure_swingexplorer_text_mobile" style="text-align:center;margin:0px;margin-top:22px">';

			modal_msg += 'Swing factor: <input style="width:80px;" id="swing_explorer_factor" type="number" min="-0.9" step="0.05" max=".9" title="Swing factor, range is -0.9 to 0.9" autocomplete="off"/>';
			modal_msg += 'Swing offset (1/8 notes): <input style="width:50px;margin-right:0px;" id="swing_explorer_offset" type="number" min="0" step="1" max="12" title="Swing offset in 1/8 notes" autocomplete="off"/>';
			modal_msg += '</p>';

			modal_msg += '<p class="configure_swingexplorer_text_mobile" style="text-align:center;margin:0px;margin-top:22px">';
			modal_msg += '<input id="swingexplorertest" class="swingexplorertest button btn btn-swingexplorertest" onclick="SwingExplorerRegenerate();" type="button" value="Reload Tune with Changed Swing Settings" title="Reloads the tune into the player with the entered swing factor and offset">';
			modal_msg += '<input id="swingexplorerinject" class="swingexplorerinject button btn btn-swingexplorerinject" onclick="SwingExplorerInject();" type="button" style="margin-right:0px;" value="Inject Swing into the ABC" title="Injects the current swing factor and offset into the tune ABC">';
			modal_msg += '</p>';
			modal_msg += '<a id="swingexplorerhelp" href="https://michaeleskin.com/abctools/userguide.html#swing_explorer" target="_blank" style="text-decoration:none;" title="Learn more about the Swing Explorer">💡</a>';
		}
		else{

			modal_msg += '<p class="configure_swingexplorer_text" style="text-align:center;margin:0px;margin-top:22px">';

			modal_msg += 'Swing factor (range is -0.9 to 0.9): <input style="width:90px;" id="swing_explorer_factor" type="number" min="-0.9" step="0.05" max=".9" title="Swing factor, range is -0.9 to 0.9" autocomplete="off"/>';
			modal_msg += 'Swing offset (1/8 notes): <input style="width:60px;margin-right:0px;" id="swing_explorer_offset" type="number" min="0" step="1" max="12" title="Swing offset in 1/8 notes" autocomplete="off"/>';
			modal_msg += '</p>';
			modal_msg += '<p class="configure_swingexplorer_text" style="text-align:center;margin:0px;margin-top:22px">';
			modal_msg += '<input id="swingexplorertest" class="swingexplorertest button btn btn-swingexplorertest" onclick="SwingExplorerRegenerate();" type="button" value="Reload Tune with Changed Swing Settings" title="Reloads the tune into the player with the entered swing factor and offset">';
			modal_msg += '<input id="swingexplorerinject" class="swingexplorerinject button btn btn-swingexplorerinject" onclick="SwingExplorerInject();" type="button" style="margin-right:0px;" value="Inject Swing into the ABC" title="Injects the current swing factor and offset into the tune ABC">';
			modal_msg += '</p>';
			modal_msg += '<a id="swingexplorerhelp" href="https://michaeleskin.com/abctools/userguide.html#swing_explorer" target="_blank" style="text-decoration:none;" title="Learn more about the Swing Explorer">💡</a>';

		}

	   	// Scale the player for larger screens
		var windowWidth = window.innerWidth;

		var instrument = GetRadioValue("notenodertab");

		var theWidth = windowWidth * 0.45;

		if (isDesktopBrowser()){

			if (theWidth < 850){
				theWidth = 850;
			}

		}
		else{

			theWidth = 800;  
			
		}

		DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: theTop, width:theWidth, okText:"Close", scrollWithPage: (isMobileBrowser()) });

		// Set the initial swing factor and offset
		document.getElementById("swing_explorer_factor").value = gSwingFactor;
		document.getElementById("swing_explorer_offset").value = gSwingOffset;

		var theOKButtons = document.getElementsByClassName("modal_flat_ok");

		// Find the button that says "Close" and hook its click handler to make sure music stops on close
		// Need to search through the modals since there may be a first time share dialog also present
		// the first time someone plays a linked PDF tune

		var theOKButton = null;

		for (var i=0;i<theOKButtons.length;++i){

			theOKButton = theOKButtons[i];

			if (theOKButton.innerText == "Close"){

				gTheOKButton = theOKButton;

				var originalOnClick = theOKButton.onclick;

				theOKButton.onclick = function(){

					originalOnClick(); 
					StopPlay(); 

				    // Focus after operation
				    FocusAfterOperation();

					// If on iOS and the muting controller installed, dispose it now
					if (gIsIOS){

						if (gTheMuteHandle){
						 	gTheMuteHandle.dispose();
  							gTheMuteHandle = null;
  						}
					}

				};

				break;

			}
		}

		if (ABCJS.synth.supportsAudio()) {
			
			synthControl = new ABCJS.synth.SynthController();

			synthControl.load("#playback-audio", cursorControl, {displayLoop: true, displayRestart: true, displayPlay: true, displayProgress: true, displayWarp: true});


		} else {

			document.querySelector("#playback-audio").innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>";

		}

		setTune(false);

		// Cache autoscroll values early
		gPlayerHolder = document.getElementById("playerholder");
		gPlayerContainerRect = gPlayerHolder.getBoundingClientRect();
	}

	// Try to deal with tab deactivation muting
	if (gIsIOS){

		var context = ABCJS.synth.activeAudioContext();

		// Decide on some parameters
		let allowBackgroundPlayback = false; // default false, recommended false
		let forceIOSBehavior = false; // default false, recommended false

		gTheMuteHandle = null;
		
		// Pass it to unmute if the context exists... ie WebAudio is supported
		if (context)
		{
		  // If you need to be able to disable unmute at a later time, you can use the returned handle's dispose() method
		  // if you don't need to do that (most folks won't) then you can simply ignore the return value
		  gTheMuteHandle = unmute(context, allowBackgroundPlayback, forceIOSBehavior);
		  
		}
	}

	initPlay();

}

//
// MIDI Instrument Explorer
// 
// This allows the user to easily test playing a tune with different soundfonts and MIDI instruments
//

var gInstrumentExplorerMelodyInstruments = null;
var gInstrumentExplorerChordInstruments = null;
var gInstrumentExplorerSoundfonts = null;

function InstrumentExplorer(){

	if (gAllowCopy){

		// Try to find the current tune
		var theSelectedABC = findSelectedTune();

		if (theSelectedABC == ""){
			// This should never happen
			return;
		}

		// Clear out the tune processing caches
		gPlayerABCInstrumentExplorerOriginal = null;
		gPlayerABCInstrumentExplorerProcessed = null;
		gPlayerABCInstrumentExplorerInjected = null;

		// Generate the instrument menus
		if (!gInstrumentExplorerSoundfonts){

			gInstrumentExplorerSoundfonts = InstrumentExplorerBuildDropdown("instrument_explorer_soundfont",soundfontNames);

			// Make the soundfont dropdown narrower using inline CSS
			gInstrumentExplorerSoundfonts = gInstrumentExplorerSoundfonts.replace('<select ','<select style="width:130px;" ');

		}

		if (!gInstrumentExplorerMelodyInstruments){

			gInstrumentExplorerMelodyInstruments = InstrumentExplorerBuildDropdown("instrument_explorer_melody_program",generalMIDISoundNames);

		}

		if (!gInstrumentExplorerChordInstruments){

			gInstrumentExplorerChordInstruments = InstrumentExplorerBuildDropdown("instrument_explorer_chord_program",generalMIDISoundNames);

		}

		// Fix issue with initial swing not happening
		ScanTuneForSwingExplorer(theSelectedABC);

		// Scan the original tune for any existing directives for initialization of the UI
		ScanTuneForInstrumentExplorer(theSelectedABC);

		// Pre-process the ABC to strip out all MIDI directives
		var theProcessedABC = PreProcessTuneInstrumentExplorer(theSelectedABC);

		// Play back locally in-tool	
		InstrumentExplorerDialog(theSelectedABC,theProcessedABC,false);

	}
}

//
// Instrument Explorer Dropdown builder
//

function InstrumentExplorerBuildDropdown(dropdown_name,dropdown_options){

	var theDropdown = '<select id="'+dropdown_name+'" name="'+dropdown_name+'">\n';

	var nOptions = dropdown_options.length;

	for (var i=0;i<nOptions;++i){

		theDropdown += '<option value="'+i+'"> '+dropdown_options[i]+'</option>'; 

	}
	
	theDropdown += '</select>'; 

	return theDropdown;


}

//
// Strip out any existing MIDI directives in the tune
//
function PreProcessTuneInstrumentExplorer(theTune){

	var searchRegExp = /^%abcjs_soundfont.*[\r\n]*/gm

	theTune = theTune.replaceAll(searchRegExp,"");

	searchRegExp = /^%%MIDI program.*[\r\n]*/gm

	theTune = theTune.replaceAll(searchRegExp,"");

	searchRegExp = /^%%MIDI chordprog.*[\r\n]*/gm

	theTune = theTune.replaceAll(searchRegExp,"");

	searchRegExp = /^%%MIDI bassvol.*[\r\n]*/gm

	theTune = theTune.replaceAll(searchRegExp,"");

	searchRegExp = /^%%MIDI chordvol.*[\r\n]*/gm

	theTune = theTune.replaceAll(searchRegExp,"");

	return theTune;

}

//
// Reload the player with new instruments and volumes
//
function InstrumentExplorerRegenerate(){

	// Grab the sound font
	gInstrumentExplorerSoundfont = document.getElementById("instrument_explorer_soundfont").value;

	// Grab the melody instrument
	gInstrumentExplorerMelodyInstrument = document.getElementById("instrument_explorer_melody_program").value;

	// Grab the chord instrument
	gInstrumentExplorerChordInstrument = document.getElementById("instrument_explorer_chord_program").value;

	// Grab the bass volume
	var theBassVolume = document.getElementById("instrument_explorer_bass_volume").value;

	theBassVolume = parseInt(theBassVolume);
	if (!isNaN(theBassVolume)){
		gInstrumentExplorerBassVolume = theBassVolume;
	}

	// Grab the chord volume
	var theChordVolume = document.getElementById("instrument_explorer_chord_volume").value;

	theChordVolume = parseInt(theChordVolume);
	if (!isNaN(theChordVolume)){
		gInstrumentExplorerChordVolume = theChordVolume;
	}

	gTheOKButton.click();

	setTimeout(function() {

		// Launch the player with the instruments injected tune
		InstrumentExplorerDialog(gPlayerABCInstrumentExplorerOriginal,gPlayerABCInstrumentExplorerProcessed,true);

	},250);
}


//
// Scan tune for MIDI soundfont, programs and volumes to use as starting defaults for the Instrument Explorer
//
function ScanTuneForInstrumentExplorer(theTune){

	// Start with the setting defaults

	switch (gDefaultSoundFont){
		case "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/":
			gInstrumentExplorerSoundfont = "0";
			break;
		case "https://paulrosen.github.io/midi-js-soundfonts/MusyngKite/":
			gInstrumentExplorerSoundfont = "1";
			break;
		case "https://paulrosen.github.io/midi-js-soundfonts/FatBoy/":
			gInstrumentExplorerSoundfont = "2";
			break;
		case "https://michaeleskin.com/abctools/soundfonts/canvas/":
			gInstrumentExplorerSoundfont = "3";
			break;
		case "https://michaeleskin.com/abctools/soundfonts/mscore/":
			gInstrumentExplorerSoundfont = "4";
			break;
		default:
			gInstrumentExplorerSoundfont = "0";
			break;		
	}

	if (gTheMelodyProgram == "136"){
		gInstrumentExplorerMelodyInstrument = 0;
	}
	else{
		gInstrumentExplorerMelodyInstrument = parseInt(gTheMelodyProgram)+1;
	}

	gInstrumentExplorerMelodyInstrument = ""+gInstrumentExplorerMelodyInstrument;

	if (gTheChordProgram == "136"){
		gInstrumentExplorerChordInstrument = 0;
	}
	else{
		gInstrumentExplorerChordInstrument = parseInt(gTheChordProgram)+1;
	}

	gInstrumentExplorerChordInstrument = ""+gInstrumentExplorerChordInstrument;

	gInstrumentExplorerBassVolume = gTheBassVolume;
	gInstrumentExplorerChordVolume = gTheChordVolume;

	var searchRegExp;

	var theMatch;

	searchRegExp = /^%abcjs_soundfont.*$/gm

	theMatch = theTune.match(searchRegExp);

	if ((theMatch) && (theMatch.length > 0)){

		var theParamString = theMatch[theMatch.length-1].replace("%abcjs_soundfont","");

		theParamString = theParamString.trim();

		if (theParamString != ""){

			switch (theParamString){
				case "fluid":
					gInstrumentExplorerSoundfont = "0";
					break;
				case "musyng":
					gInstrumentExplorerSoundfont = "1";
					break;
				case "fatboy":
					gInstrumentExplorerSoundfont = "2";
					break;
				case "canvas":
					gInstrumentExplorerSoundfont = "3";
					break;
				case "mscore":
					gInstrumentExplorerSoundfont = "4";
					break;
			}
		}
	}

	searchRegExp = /^%%MIDI program.*$/gm

	theMatch = theTune.match(searchRegExp);

	if ((theMatch) && (theMatch.length > 0)){

		var theParamString = theMatch[0].replace("%%MIDI program","");

		theParamString = theParamString.trim();

		if (theParamString != ""){

			if (theParamString.toLowerCase()  == "mute"){

				gInstrumentExplorerMelodyInstrument = "0";
			
			}
			else{

				var theValue = parseInt(theParamString);

				if (!isNaN(theValue)){

					gInstrumentExplorerMelodyInstrument = ""+(theValue+1);

				}
			}
		}
	}

	searchRegExp = /^%%MIDI chordprog.*$/gm

	theMatch = theTune.match(searchRegExp);

	if ((theMatch) && (theMatch.length > 0)){

		var theParamString = theMatch[0].replace("%%MIDI chordprog","");

		theParamString = theParamString.trim();
		
		if (theParamString != ""){

			if (theParamString.toLowerCase() == "mute"){

				gInstrumentExplorerChordInstrument = "0";
			
			}
			else{

				var theValue = parseInt(theParamString);

				if (!isNaN(theValue)){

					gInstrumentExplorerChordInstrument = ""+(theValue+1);

				}
			}
		}
	}

	searchRegExp = /^%%MIDI bassvol.*$/gm

	theMatch = theTune.match(searchRegExp);

	if ((theMatch) && (theMatch.length > 0)){

		var theParamString = theMatch[0].replace("%%MIDI bassvol","");

		theParamString = theParamString.trim();
		
		if (theParamString != ""){

			var theValue = parseInt(theParamString);

			if (!isNaN(theValue)){

				gInstrumentExplorerBassVolume = theValue;

			}
		}
	}

	searchRegExp = /^%%MIDI chordvol.*$/gm

	theMatch = theTune.match(searchRegExp);

	if ((theMatch) && (theMatch.length > 0)){

		var theParamString = theMatch[0].replace("%%MIDI chordvol","");

		theParamString = theParamString.trim();
		
		if (theParamString != ""){

			var theValue = parseInt(theParamString);

			if (!isNaN(theValue)){

				gInstrumentExplorerChordVolume = theValue;

			}
		}
	}
}

//
// Inject the tune with the Instrument Explorer values
//
function InstrumentExplorerInject(){

	// Grab the sound font
	gInstrumentExplorerSoundfont = document.getElementById("instrument_explorer_soundfont").value;

	// Grab the melody instrument
	gInstrumentExplorerMelodyInstrument = document.getElementById("instrument_explorer_melody_program").value;

	// Grab the chord instrument
	gInstrumentExplorerChordInstrument = document.getElementById("instrument_explorer_chord_program").value;

	// Grab the bass volume
	var theBassVolume = document.getElementById("instrument_explorer_bass_volume").value;

	theBassVolume = parseInt(theBassVolume);
	if (!isNaN(theBassVolume)){
		gInstrumentExplorerBassVolume = theBassVolume;
	}

	// Grab the chord volume
	var theChordVolume = document.getElementById("instrument_explorer_chord_volume").value;

	theChordVolume = parseInt(theChordVolume);
	if (!isNaN(theChordVolume)){
		gInstrumentExplorerChordVolume = theChordVolume;
	}

	gPlayerABCInstrumentExplorerInjected = InstrumentExplorerDialogInjectThisTune(gPlayerABCInstrumentExplorerProcessed);

	// Try and keep the same tune after the redraw for immediate play
	var theSelectionStart = gTheABC.selectionStart;

	// Stuff in the injected ABC
	var theABC = gTheABC.value;

	theABC = theABC.replace(gPlayerABCInstrumentExplorerOriginal,gPlayerABCInstrumentExplorerInjected);
	
	gTheABC.value = theABC;

	// Set dirty
	gIsDirty = true;

	// For future injects
	gPlayerABCInstrumentExplorerOriginal = gPlayerABCInstrumentExplorerInjected;

	// Set the select point
	gTheABC.selectionStart = theSelectionStart;
    gTheABC.selectionEnd = theSelectionStart;

    // Focus after operation
    FocusAfterOperation();

}

//
// Inject the MIDI parameters into this tune
//
function InstrumentExplorerDialogInjectThisTune(theTune){

	// Inject soundfont
	switch (gInstrumentExplorerSoundfont){
		case "0":
			theTune = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont fluid");
			break;
		case "1":
			theTune = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont musyng");
			break;
		case "2":
			theTune = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont fatboy");
			break;
		case "3":
			theTune = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont canvas");
			break;
		case "4":
			theTune = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont mscore");
			break;
		default:
			theTune = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont fluid");
			break;
	}

	// Inject melody instrument
	// Offset by one to deal with mute instrument at offset zero
	if (gInstrumentExplorerMelodyInstrument == "0"){
		theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI program mute");
	}
	else{
		var theProgram = parseInt(gInstrumentExplorerMelodyInstrument)-1;
		theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI program "+theProgram);
	}

	// Inject chord instrument
	// Offset by one to deal with mute instrument at offset zero
	if (gInstrumentExplorerChordInstrument == "0"){
		theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI chordprog mute");
	}
	else{
		var theProgram = parseInt(gInstrumentExplorerChordInstrument)-1;
		theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI chordprog "+theProgram);
	}

	// Inject bass volume
	theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI bassvol "+gInstrumentExplorerBassVolume);

	// Inject chord volume
	theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI chordvol "+gInstrumentExplorerChordVolume);
	
	// Seeing extra linefeeds after the inject
	theTune = theTune.replace("\n\n","");

	return(theTune);

}

// 
// Instrument Explorer Dialog
//

var gInstrumentExplorerSoundfont = "0";
var gInstrumentExplorerMelodyInstrument = "0";
var gInstrumentExplorerChordInstrument = "0";
var gInstrumentExplorerBassVolume = 0;
var gInstrumentExplorerChordVolume = 0;
var gPlayerABCInstrumentExplorerOriginal = null;
var gPlayerABCInstrumentExplorerProcessed = null;
var gPlayerABCInstrumentExplorerInjected = null;

function InstrumentExplorerDialog(theOriginalABC, theProcessedABC, instrument_explorer_state){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","InstrumentExplorerDialog");

	gMIDIbuffer = null;
	gTheOKButton = null;

	// We came in because of an instrument change, don't init the tune cache
	if (!instrument_explorer_state){

		gPlayerABCInstrumentExplorerOriginal = theOriginalABC;

		gPlayerABCInstrumentExplorerProcessed = theProcessedABC;

	}

	theProcessedABC = InstrumentExplorerDialogInjectThisTune(gPlayerABCInstrumentExplorerProcessed);

	gPlayerABCInstrumentExplorerInjected = theProcessedABC;

	var soundFontRequested = ScanTuneForSoundFont(theProcessedABC);

	if (soundFontRequested){

		var theOriginalSoundFont = gTheActiveSoundFont;

		switch (soundFontRequested){
			case "fluid":
				gTheActiveSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/";
				break;
			case "musyng":
				gTheActiveSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/MusyngKite/";
				break;
			case "fatboy":
				gTheActiveSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/FatBoy/";
				break;
			case "canvas":
				gTheActiveSoundFont = "https://michaeleskin.com/abctools/soundfonts/canvas/";
				break;
			case "mscore":
				gTheActiveSoundFont = "https://michaeleskin.com/abctools/soundfonts/mscore/";
				break;
		}

		// New soundfont requested, clear the cache
		if (gTheActiveSoundFont != theOriginalSoundFont){
			
			// Clear the soundfont cache
			gSoundsCacheABCJS = {};

		}

	}
	else{

		// No sound font requested, lets see if the current font is the user default
		if (gTheActiveSoundFont != gDefaultSoundFont){

			gTheActiveSoundFont = gDefaultSoundFont;

			// Clear the soundfont cache
			gSoundsCacheABCJS = {};

		}
	}

	// Setup any custom boom-chick rhythm patterns found
	var boomChickOK = ScanTuneForBoomChick(theProcessedABC);

	// Incorrectly formatted %abcjs_boomchick detected, put up an alert
	if (boomChickOK != ""){

		DayPilot.Modal.alert('<p style="font-family:helvetica;font-size:14pt;"><strong>There is an issue with your custom rhythm directive:</strong></p><p style="font-family:helvetica;font-size:14pt;"><strong>'+boomChickOK+'</strong></p><p style="font-family:helvetica;font-size:14pt;">Format should be:</p><p style="font-family:helvetica;font-size:14pt;">%abcjs_boomchick meter rhythm_pattern_string partial_measure</p><p style="font-family:helvetica;font-size:14pt;">Valid rhythm_pattern_string characters are:</p><p style="font-family:helvetica;font-size:14pt;">B - Boom, b - Alternate Boom, c - Chick, and x - Silence.</p><p style="font-family:helvetica;font-size:14pt;">Examples:</p><p style="font-family:helvetica;font-size:14pt;">%abcjs_boomchick 7/8 Bccbxbx 3</p><p style="font-family:helvetica;font-size:14pt;">%abcjs_boomchick 10/8 Bccbccbxbx 5</p><p style="font-family:helvetica;font-size:14pt;">The number of characters in the pattern_string must match the meter numerator.</p><p style="font-family:helvetica;font-size:14pt;">partial_measure sets how many beats must be present in a partial measure in the ABC to use the custom pattern.</p><p style="font-family:helvetica;font-size:14pt;">partial_measure is optional and defaults to half of the meter numerator rounded down to the next lowest integer (min is 1).</p>',{ theme: "modal_flat", top: 50, scrollWithPage: (AllowDialogsToScroll()) });

		return;
	}
	
	var instrument = GetRadioValue("notenodertab");

	var abcOptions = GetABCJSParams(instrument);

	abcOptions.oneSvgPerLine = false;

	// Clear the tab label if present to compress vertical space
	if (instrument != "noten" ){

		// Sanity check the options first
		if (abcOptions.tablature && (abcOptions.tablature.length > 0)){
			abcOptions.tablature[0].label = "";
		}
	}

	function setTune(userAction) {

		synthControl.disable(true);

		var visualObj = ABCJS.renderAbc("playback-paper", theProcessedABC, abcOptions)[0];

		// Post process whistle or note name tab
		postProcessTab("playback-paper",instrument,true);

		var midiBuffer = new ABCJS.synth.CreateSynth();

		gMIDIbuffer = midiBuffer;

		midiBuffer.init({
			visualObj: visualObj
		}).then(function (response) {
			console.log(response);
			if (synthControl) {

				var fadeLength = computeFade(theProcessedABC);

				synthControl.setTune(visualObj, userAction, {fadeLength:fadeLength}).then(function (response) {
					
					console.log("Audio successfully loaded.");

					// Are we using the trainer touch controls
					if (gTrainerTouchControls){

						//debugger;

						var elems1 = document.getElementsByClassName("abcjs-midi-clock");
						var elems2 = document.getElementsByClassName("abcjs-midi-current-tempo-wrapper");

						if (elems1 && elems2 && (elems1.length > 0) && (elems2.length > 0)){
							
							gSynthControl = synthControl;

							var elem = elems1[0];
							elem.onclick = DecrementTempo;
							elem = elems2[0];
							elem.onclick = IncrementTempo;

						}
					
					}


				}).catch(function (error) {
					
					console.log("Problem loading audio for this tune");

				});
			}
		}).catch(function (error) {

			console.log("Problem loading audio for this tune");

		});
	}

	function StopPlay(){

		gSynthControl = null;

		if (synthControl){
				
			synthControl.destroy();

			synthControl = null;
		}
	}

	var cursorControl = new CursorControl();

	var synthControl;

	function initPlay() {

		// Clear the looper callback
		gLoopCallback = null;
		gStartPlayCallback = null;

		// Clear the player in pause flag
		gPlayerInPause = false;

		// Adapt the top based on the player control size
		var theTop = 50;

		var theHeight = window.innerHeight - 465; 

	   	modal_msg = '<div id="playerholder" style="height:'+theHeight+'px;overflow-y:auto;margin-bottom:15px;">';

		if (gLargePlayerControls){
			modal_msg += '<div id="abcplayer" class="abcjs-large">';
		}
		else{
			modal_msg += '<div id="abcplayer">';			
		}

	   	modal_msg += '<div id="playback-paper"></div>';
	   	modal_msg += '</div>';

	   	modal_msg += '</div>';

	   	// Add the player controls
		if (gLargePlayerControls){
	   		modal_msg += '<div id="playback-audio" class="abcjs-large"></div>';
		}
		else{
	   		modal_msg += '<div id="playback-audio"></div>';
		}

	   	// Add the MIDI Instrument Explorer controls
		if (isMobileBrowser()){

			modal_msg += '<div class="configure_instrumentexplorer_text_mobile" style="text-align:center;margin:0px;margin-top:36px">';
			modal_msg += '<p class="configure_instrumentexplorer_text_mobile">';
			modal_msg += "Sound font:"+gInstrumentExplorerSoundfonts+"&nbsp;&nbsp;Melody:"+gInstrumentExplorerMelodyInstruments+"&nbsp;&nbsp;Bass/Chord:"+ gInstrumentExplorerChordInstruments;
			modal_msg += '</p>';
			modal_msg += '<p class="configure_instrumentexplorer_text_mobile">';
			modal_msg += 'Bass Volume (0-127):&nbsp;<input style="width:90px;" id="instrument_explorer_bass_volume" type="number" min="0" step="1" max="127" title="Bass volume, range is 0-127"  autocomplete="off"/>';
			modal_msg += '&nbsp;&nbsp;Chord Volume (0-127):&nbsp;<input style="width:90px;" id="instrument_explorer_chord_volume" type="number" min="0" step="1" max="127" title="Chord volume, range is 0-127" autocomplete="off"/>';
			modal_msg += '</p>';
			modal_msg += '<p class="configure_instrumentexplorer_text_mobile">';
			modal_msg += '<input id="instrumentexplorertest" class="instrumentexplorertest button btn btn-instrumentexplorertest" onclick="InstrumentExplorerRegenerate();" type="button" value="Reload Tune with Changed Instruments" title="Reloads the tune into the player with the selected MIDI soundfont, melody instrument, bass/chord instrument, and bass/chord volumes">';
			modal_msg += '<input id="instrumentexplorerinject" class="instrumentexplorerinject button btn btn-instrumentexplorerinject" onclick="InstrumentExplorerInject();" style="margin-right:0px;" type="button" value="Inject Instruments and Volumes into the ABC" title="Injects the current soundfont, melody instrument, bass/chord instrument, and bass/chord volumes into the tune ABC">';
			modal_msg += '</p>';
			modal_msg += '</div>';

			modal_msg += '<a id="instrumentexplorerhelp" href="https://michaeleskin.com/abctools/userguide.html#midi_instrument_explorer" target="_blank" style="text-decoration:none;" title="Learn more about the MIDI Instrument Explorer">💡</a>';
		}
		else{
			modal_msg += '<div class="configure_instrumentexplorer_text" style="text-align:center;margin:0px;margin-top:36px">';
			modal_msg += '<p class="configure_instrumentexplorer_text">';
			modal_msg += "Sound font:"+gInstrumentExplorerSoundfonts+"&nbsp;&nbsp;&nbsp;Melody:"+gInstrumentExplorerMelodyInstruments+"&nbsp;&nbsp;&nbsp;Bass/Chord:"+ gInstrumentExplorerChordInstruments;
			modal_msg += '</p>';
			modal_msg += '<p class="configure_instrumentexplorer_text">';
			modal_msg += 'Bass Volume (0-127):&nbsp;&nbsp;<input style="width:90px;" id="instrument_explorer_bass_volume" type="number" min="0" step="1" max="127" title="Bass volume, range is 0-127"  autocomplete="off"/>';
			modal_msg += 'Chord Volume (0-127):&nbsp;&nbsp;<input style="width:90px;" id="instrument_explorer_chord_volume" type="number" min="0" step="1" max="127" title="Chord volume, range is 0-127" autocomplete="off"/>';
			modal_msg += '</p>';
			modal_msg += '<p class="configure_instrumentexplorer_text">';
			modal_msg += '<input id="instrumentexplorertest" class="instrumentexplorertest button btn btn-instrumentexplorertest" onclick="InstrumentExplorerRegenerate();" type="button" value="Reload Tune with Changed Instruments and Volumes" title="Reloads the tune into the player with the selected MIDI soundfont, melody instrument, bass/chord instrument, and bass/chord volumes">';
			modal_msg += '<input id="instrumentexplorerinject" class="instrumentexplorerinject button btn btn-instrumentexplorerinject" onclick="InstrumentExplorerInject();" style="margin-right:0px;" type="button" value="Inject Instruments and Volumes into the ABC" title="Injects the current soundfont, melody instrument, bass/chord instrument, and bass/chord volumes into the tune ABC">';
			modal_msg += '</p>';
			modal_msg += '</div>';

			modal_msg += '<a id="instrumentexplorerhelp" href="https://michaeleskin.com/abctools/userguide.html#midi_instrument_explorer" target="_blank" style="text-decoration:none;" title="Learn more about the MIDI Instrument Explorer">💡</a>';			
		}

	   	// Scale the player for larger screens
		var windowWidth = window.innerWidth;

		var instrument = GetRadioValue("notenodertab");

		var theWidth = windowWidth * 0.45;

		if (isDesktopBrowser()){

			if (theWidth < 850){
				theWidth = 850;
			}

		}
		else{

			theWidth = 800;  
			
		}

		DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: theTop, width:theWidth, okText:"Close", scrollWithPage: (isMobileBrowser()) });

		// Set the initial values
		document.getElementById("instrument_explorer_soundfont").value = gInstrumentExplorerSoundfont;
		document.getElementById("instrument_explorer_melody_program").value = gInstrumentExplorerMelodyInstrument;
		document.getElementById("instrument_explorer_chord_program").value = gInstrumentExplorerChordInstrument;
		document.getElementById("instrument_explorer_bass_volume").value = gInstrumentExplorerBassVolume;
		document.getElementById("instrument_explorer_chord_volume").value = gInstrumentExplorerChordVolume;

		var theOKButtons = document.getElementsByClassName("modal_flat_ok");

		// Find the button that says "Close" and hook its click handler to make sure music stops on close
		// Need to search through the modals since there may be a first time share dialog also present
		// the first time someone plays a linked PDF tune

		var theOKButton = null;

		for (var i=0;i<theOKButtons.length;++i){

			theOKButton = theOKButtons[i];

			if (theOKButton.innerText == "Close"){

				gTheOKButton = theOKButton;

				var originalOnClick = theOKButton.onclick;

				theOKButton.onclick = function(){

					originalOnClick(); 
					StopPlay(); 

				    // Focus after operation
				    FocusAfterOperation();

					// If on iOS and the muting controller installed, dispose it now
					if (gIsIOS){

						if (gTheMuteHandle){
						 	gTheMuteHandle.dispose();
  							gTheMuteHandle = null;
  						}
					}

				};

				break;

			}
		}

		if (ABCJS.synth.supportsAudio()) {
			
			synthControl = new ABCJS.synth.SynthController();

			synthControl.load("#playback-audio", cursorControl, {displayLoop: true, displayRestart: true, displayPlay: true, displayProgress: true, displayWarp: true});


		} else {

			document.querySelector("#playback-audio").innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>";

		}

		setTune(false);

		// Cache autoscroll values early
		gPlayerHolder = document.getElementById("playerholder");
		gPlayerContainerRect = gPlayerHolder.getBoundingClientRect();
	}

	// Try to deal with tab deactivation muting
	if (gIsIOS){

		var context = ABCJS.synth.activeAudioContext();

		// Decide on some parameters
		let allowBackgroundPlayback = false; // default false, recommended false
		let forceIOSBehavior = false; // default false, recommended false

		gTheMuteHandle = null;
		
		// Pass it to unmute if the context exists... ie WebAudio is supported
		if (context)
		{
		  // If you need to be able to disable unmute at a later time, you can use the returned handle's dispose() method
		  // if you don't need to do that (most folks won't) then you can simply ignore the return value
		  gTheMuteHandle = unmute(context, allowBackgroundPlayback, forceIOSBehavior);
		  
		}
	}

	initPlay();

}


//
// Grace Duration Explorer
//
function GraceExplorer(){

	if (gAllowCopy){

		// Play back locally

		// Try to find the current tune
		var theSelectedABC = findSelectedTune();

		if (theSelectedABC == ""){
			// This should never happen
			return;
		}

		// Fix issue with initial swing not happening
		ScanTuneForSwingExplorer(theSelectedABC);

		// Pre-process the ABC to inject any requested programs or volumes
		var theProcessedABC = PreProcessPlayABC(theSelectedABC);

		// Play back locally in-tool	
		GraceExplorerDialog(theSelectedABC,theProcessedABC,false);

	}
}

//
// Reload the player with a new grace duration
//
function GraceExplorerRegenerate(){

	var bDoReload = false;

	// Grab the grace duration
	var theGraceDuration = document.getElementById("grace_explorer_duration").value;

	theGraceDuration = parseFloat(theGraceDuration);

	if (!isNaN(theGraceDuration) && ((theGraceDuration >= 0) && (theGraceDuration <= 150))){

		gGraceDuration = theGraceDuration/1000;

		bDoReload = true;
	}

	if (bDoReload){

		gTheOKButton.click();

		setTimeout(function() {

			// Launch the player with the grace injected tune
			GraceExplorerDialog(gPlayerABCGraceExplorerOriginal,gPlayerABCGraceExplorerProcessed,true);

		},250);

	}
}


//
// Scan tune for swing annotation for the swing explorer
//
function ScanTuneForGraceExplorer(theTune){

	//debugger;

	gGraceDuration = 0.045;

	var searchRegExp;
	var doGraceDuration;

	// Next search for an grace_duration_ms override
	searchRegExp = /^%grace_duration_ms.*$/gm

	// Detect grace_duration_ms annotation
	doGraceDuration = theTune.match(searchRegExp);

	if ((doGraceDuration) && (doGraceDuration.length > 0)){

		var theParamString = doGraceDuration[0].replace("%grace_duration_ms","");

		theParamString = theParamString.trim();

		var theParams = theParamString.split(" ");

		if (theParams.length >= 1){

			var theGraceDurationFound = theParams[0];

			var graceValue = parseFloat(theGraceDurationFound);

			if (!isNaN(graceValue)){

				if ((graceValue >= 0) && (graceValue <= 150)){

					gGraceDuration = graceValue/1000;
				
				}
			}
		}
	}

}

//
// Inject the tune with the Swing Explorer values
//

function GraceExplorerInject(){

	var bDoInjectGraceDuration = false;

	// Grab the swing factor
	var theGraceDuration = document.getElementById("grace_explorer_duration").value;

	theGraceDuration = parseFloat(theGraceDuration);

	if (!isNaN(theGraceDuration) && ((theGraceDuration >= 0) && (theGraceDuration <= 150))){

		bDoInjectGraceDuration = true;
	}

	if (bDoInjectGraceDuration){

		var theInjectString = "%grace_duration_ms "+theGraceDuration;

		//
		// Strip any existing %grace_duration_ms out of the current tune
		//

		var searchRegExp = /^%grace_duration_ms.*[\r\n]*/gm 

		var tuneWithNoGrace = gPlayerABCGraceExplorerOriginal.replaceAll(searchRegExp, "");

		var tuneWithGrace = InjectStringBelowTuneHeader(tuneWithNoGrace,theInjectString);

		// Seeing extra line breaks after the inject
		tuneWithGrace = tuneWithGrace.replace("\n\n","");

		// Try and keep the same tune after the redraw for immediate play
		var theSelectionStart = gTheABC.selectionStart;

		// Stuff in the injected ABC
		var theABC = gTheABC.value;

		theABC = theABC.replace(gPlayerABCGraceExplorerOriginal,tuneWithGrace);
		
		gTheABC.value = theABC;

		// Set dirty
		gIsDirty = true;

		// For future injects
		gPlayerABCGraceExplorerOriginal = tuneWithGrace;

		// Set the select point
		gTheABC.selectionStart = theSelectionStart;
	    gTheABC.selectionEnd = theSelectionStart;

	    // Focus after operation
	    FocusAfterOperation();

	}

}

// 
// Grace Explorer Dialog
//

var gPlayerABCGraceExplorerOriginal = null;
var gPlayerABCGraceExplorerProcessed = null;

function GraceExplorerDialog(theOriginalABC, theProcessedABC, grace_explorer_state){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","GraceExplorerDialog");

	gMIDIbuffer = null;
	gTheOKButton = null;

	// We came in because of a grace duration change, don't init the tune cache
	if (!grace_explorer_state){

		gPlayerABCGraceExplorerOriginal = theOriginalABC;
		gPlayerABCGraceExplorerProcessed = theProcessedABC;

	}

	var soundFontRequested = ScanTuneForSoundFont(theProcessedABC);

	if (soundFontRequested){

		var theOriginalSoundFont = gTheActiveSoundFont;

		switch (soundFontRequested){
			case "fluid":
				gTheActiveSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/";
				break;
			case "musyng":
				gTheActiveSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/MusyngKite/";
				break;
			case "fatboy":
				gTheActiveSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/FatBoy/";
				break;
			case "canvas":
				gTheActiveSoundFont = "https://michaeleskin.com/abctools/soundfonts/canvas/";
				break;
			case "mscore":
				gTheActiveSoundFont = "https://michaeleskin.com/abctools/soundfonts/mscore/";
				break;
		}

		// New soundfont requested, clear the cache
		if (gTheActiveSoundFont != theOriginalSoundFont){
			
			// Clear the soundfont cache
			gSoundsCacheABCJS = {};

		}

	}
	else{

		// No sound font requested, lets see if the current font is the user default
		if (gTheActiveSoundFont != gDefaultSoundFont){

			gTheActiveSoundFont = gDefaultSoundFont;

			// Clear the soundfont cache
			gSoundsCacheABCJS = {};

		}
	}

	// Setup any custom boom-chick rhythm patterns found
	var boomChickOK = ScanTuneForBoomChick(theProcessedABC);

	// Incorrectly formatted %abcjs_boomchick detected, put up an alert
	if (boomChickOK != ""){

		DayPilot.Modal.alert('<p style="font-family:helvetica;font-size:14pt;"><strong>There is an issue with your custom rhythm directive:</strong></p><p style="font-family:helvetica;font-size:14pt;"><strong>'+boomChickOK+'</strong></p><p style="font-family:helvetica;font-size:14pt;">Format should be:</p><p style="font-family:helvetica;font-size:14pt;">%abcjs_boomchick meter rhythm_pattern_string partial_measure</p><p style="font-family:helvetica;font-size:14pt;">Valid rhythm_pattern_string characters are:</p><p style="font-family:helvetica;font-size:14pt;">B - Boom, b - Alternate Boom, c - Chick, and x - Silence.</p><p style="font-family:helvetica;font-size:14pt;">Examples:</p><p style="font-family:helvetica;font-size:14pt;">%abcjs_boomchick 7/8 Bccbxbx 3</p><p style="font-family:helvetica;font-size:14pt;">%abcjs_boomchick 10/8 Bccbccbxbx 5</p><p style="font-family:helvetica;font-size:14pt;">The number of characters in the pattern_string must match the meter numerator.</p><p style="font-family:helvetica;font-size:14pt;">partial_measure sets how many beats must be present in a partial measure in the ABC to use the custom pattern.</p><p style="font-family:helvetica;font-size:14pt;">partial_measure is optional and defaults to half of the meter numerator rounded down to the next lowest integer (min is 1).</p>',{ theme: "modal_flat", top: 50, scrollWithPage: (AllowDialogsToScroll()) });

		return;
	}

	// Setup any swing found (Only done the first time)
	if (!grace_explorer_state){

		ScanTuneForGraceExplorer(theProcessedABC);

	}
	
	var instrument = GetRadioValue("notenodertab");

	var abcOptions = GetABCJSParams(instrument);

	abcOptions.oneSvgPerLine = false;

	// Clear the tab label if present to compress vertical space
	if (instrument != "noten" ){

		// Sanity check the options first
		if (abcOptions.tablature && (abcOptions.tablature.length > 0)){
			abcOptions.tablature[0].label = "";
		}
	}
	

	function setTune(userAction) {

		synthControl.disable(true);

		var visualObj = ABCJS.renderAbc("playback-paper", theProcessedABC, abcOptions)[0];

		// Post process whistle or note name tab
		postProcessTab("playback-paper",instrument,true);

		var midiBuffer = new ABCJS.synth.CreateSynth();

		gMIDIbuffer = midiBuffer;

		midiBuffer.init({
			visualObj: visualObj
		}).then(function (response) {
			console.log(response);
			if (synthControl) {

				var fadeLength = computeFade(theProcessedABC);

				synthControl.setTune(visualObj, userAction, {fadeLength:fadeLength}).then(function (response) {
					
					console.log("Audio successfully loaded.");

					// Are we using the trainer touch controls
					if (gTrainerTouchControls){

						//debugger;

						var elems1 = document.getElementsByClassName("abcjs-midi-clock");
						var elems2 = document.getElementsByClassName("abcjs-midi-current-tempo-wrapper");

						if (elems1 && elems2 && (elems1.length > 0) && (elems2.length > 0)){
							
							gSynthControl = synthControl;

							var elem = elems1[0];
							elem.onclick = DecrementTempo;
							elem = elems2[0];
							elem.onclick = IncrementTempo;

						}
					
					}


				}).catch(function (error) {
					
					console.log("Problem loading audio for this tune");

				});
			}
		}).catch(function (error) {

			console.log("Problem loading audio for this tune");

		});
	}

	function StopPlay(){

		gSynthControl = null;

		if (synthControl){
				
			synthControl.destroy();

			synthControl = null;
		}
	}

	var cursorControl = new CursorControl();

	var synthControl;

	function initPlay() {

		// Clear the looper callback
		gLoopCallback = null;
		gStartPlayCallback = null;
		
		// Clear the player in pause flag
		gPlayerInPause = false;

		// Adapt the top based on the player control size
		var theTop = 50;

		var theHeight = window.innerHeight - 400;

	   	modal_msg = '<div id="playerholder" style="height:'+theHeight+'px;overflow-y:auto;margin-bottom:15px;">';

		if (gLargePlayerControls){
			modal_msg += '<div id="abcplayer" class="abcjs-large">';
		}
		else{
			modal_msg += '<div id="abcplayer">';			
		}

	   	modal_msg += '<div id="playback-paper"></div>';
	   	modal_msg += '</div>';

	   	modal_msg += '</div>';

	   	// Add the player controls
		if (gLargePlayerControls){
	   		modal_msg += '<div id="playback-audio" class="abcjs-large"></div>';
		}
		else{
	   		modal_msg += '<div id="playback-audio"></div>';
		}

	   	// Add the grace explorer controls
		modal_msg += '<p class="configure_graceexplorer_text" style="text-align:center;margin:0px;margin-top:22px">';

		modal_msg += 'Grace duration in milliseconds (range is 1-150): <input style="width:90px;" id="grace_explorer_duration" type="number" min="0" step="1" max="150" title="Grace duration in milliseconds, range is 1 to 150, 0 disables the custom grace duration feature and uses original abcjs default behavior" autocomplete="off"/>';
		modal_msg += '</p>';
		modal_msg += '<p class="configure_graceexplorer_text" style="text-align:center;margin:0px;margin-top:22px">';
		modal_msg += '<input id="graceexplorertest" class="graceexplorertest button btn btn-graceexplorertest" onclick="GraceExplorerRegenerate();" type="button" value="Reload Tune with Changed Grace Duration" title="Reloads the tune into the player with the entered grace duration">';
		modal_msg += '<input id="graceexplorerinject" class="graceexplorerinject button btn btn-graceexplorerinject" onclick="GraceExplorerInject();" type="button" style="margin-right:0px;" value="Inject Grace Duration into the ABC" title="Injects the current grace duration into the tune ABC">';
		modal_msg += '</p>';
		modal_msg += '<a id="graceexplorerhelp" href="https://michaeleskin.com/abctools/userguide.html#grace_duration_explorer" target="_blank" style="text-decoration:none;" title="Learn more about the Grace Duration Explorer">💡</a>';

	   	// Scale the player for larger screens
		var windowWidth = window.innerWidth;

		var instrument = GetRadioValue("notenodertab");

		var theWidth = windowWidth * 0.45;

		if (isDesktopBrowser()){

			if (theWidth < 850){
				theWidth = 850;
			}

		}
		else{

			theWidth = 800;  
			
		}

		DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: theTop, width:theWidth, okText:"Close", scrollWithPage: (isMobileBrowser()) });

		// Set the initial grace duration
		document.getElementById("grace_explorer_duration").value = gGraceDuration/.001;

		var theOKButtons = document.getElementsByClassName("modal_flat_ok");

		// Find the button that says "Close" and hook its click handler to make sure music stops on close
		// Need to search through the modals since there may be a first time share dialog also present
		// the first time someone plays a linked PDF tune

		var theOKButton = null;

		for (var i=0;i<theOKButtons.length;++i){

			theOKButton = theOKButtons[i];

			if (theOKButton.innerText == "Close"){

				gTheOKButton = theOKButton;

				var originalOnClick = theOKButton.onclick;

				theOKButton.onclick = function(){

					originalOnClick(); 
					StopPlay(); 

				    // Focus after operation
				    FocusAfterOperation();

					// If on iOS and the muting controller installed, dispose it now
					if (gIsIOS){

						if (gTheMuteHandle){
						 	gTheMuteHandle.dispose();
  							gTheMuteHandle = null;
  						}
					}

				};

				break;

			}
		}

		if (ABCJS.synth.supportsAudio()) {
			
			synthControl = new ABCJS.synth.SynthController();

			synthControl.load("#playback-audio", cursorControl, {displayLoop: true, displayRestart: true, displayPlay: true, displayProgress: true, displayWarp: true});


		} else {

			document.querySelector("#playback-audio").innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>";

		}

		setTune(false);

		// Cache autoscroll values early
		gPlayerHolder = document.getElementById("playerholder");
		gPlayerContainerRect = gPlayerHolder.getBoundingClientRect();
	}

	// Try to deal with tab deactivation muting
	if (gIsIOS){

		var context = ABCJS.synth.activeAudioContext();

		// Decide on some parameters
		let allowBackgroundPlayback = false; // default false, recommended false
		let forceIOSBehavior = false; // default false, recommended false

		gTheMuteHandle = null;
		
		// Pass it to unmute if the context exists... ie WebAudio is supported
		if (context)
		{
		  // If you need to be able to disable unmute at a later time, you can use the returned handle's dispose() method
		  // if you don't need to do that (most folks won't) then you can simply ignore the return value
		  gTheMuteHandle = unmute(context, allowBackgroundPlayback, forceIOSBehavior);
		  
		}
	}

	initPlay();

}

//
// Tune trainer - Loops tunes with increasing speed
//

//
// Launched from the player, close the player, launch the trainer
function TuneTrainerLaunchFromPlayer(){

	// Click the OK button in the player
	gTheOKButton.click();

	setTimeout(function() {

		// Launch the trainer
		TuneTrainer();

	},250);
}

function TuneTrainer(){

	if (gAllowCopy){

		// Play back locally

		// Try to find the current tune
		var theSelectedABC = findSelectedTune();

		if (theSelectedABC == ""){
			// This should never happen
			return;
		}

		// Clear the metronome version
		gPlayerABCMetronome = null;

		// Fix issue with initial swing not happening
		ScanTuneForSwingExplorer(theSelectedABC);

		// Pre-process the ABC to inject any requested programs or volumes
		var theProcessedABC = PreProcessPlayABC(theSelectedABC);

		// Play back locally in-tool	
		TuneTrainerDialog(theSelectedABC,theProcessedABC,false);

	}
}


//
// Reset the looper 
//
function TuneTrainerReset(){

	//console.log("TuneTrainerReset");

	var bDoReload = false;

	// Set the initial loop parameters
	var looperSpeedStart = document.getElementById("looper_start_percent").value;
	var looperSpeedEnd = document.getElementById("looper_end_percent").value;
	var looperSpeedIncrement = document.getElementById("looper_increment").value;
	var looperCount = document.getElementById("looper_count").value;

	looperSpeedStart = parseFloat(looperSpeedStart);
	looperSpeedEnd = parseFloat(looperSpeedEnd);
	looperSpeedIncrement = parseFloat(looperSpeedIncrement);
	looperCount = parseFloat(looperCount);

	if ((!isNaN(looperSpeedStart)) && (!isNaN(looperSpeedEnd)) && (!isNaN(looperSpeedIncrement)) && (!isNaN(looperCount)) ){

		if ((looperSpeedStart <= looperSpeedEnd) && (looperSpeedStart >= 0) && (looperSpeedEnd <= 400) && (looperSpeedIncrement >= 0) && (looperCount > 0)){

			gLooperSpeedStart = looperSpeedStart;
			gLooperSpeedEnd = looperSpeedEnd;
			gLooperSpeedIncrement = looperSpeedIncrement;
			gLooperCount = looperCount;
			gLooperCurrent = gLooperSpeedStart;
			gLooperLoopCount = gLooperCount;

			bDoReload = true;

		}
	}

	if (bDoReload){

		// Clear the looper callback
		gLoopCallback = null;
		gStartPlayCallback = null;

		// Clear the player in pause flag
		gPlayerInPause = false;

		// Clear the metronome flags
		gPlayMetronome = false;
		gLooperMetronomeState = false;
		gPlayerABCMetronome = null;

		gTheOKButton.click();

		setTimeout(function() {

			// Launch the player with the new values
			TuneTrainerDialog(gPlayerLooperOriginal,gPlayerLooperProcessed,true);

		},250);

	}
	else{

		// User entered odd values
		var thePrompt = '<p style="font-family:helvetica;font-size:14pt;text-align:center"><strong>Invalid Tune Trainer Values Entered</strong></p><p style="font-family:helvetica;font-size:14pt;margin-top:36px;">All values must be numbers.</p><p style="font-family:helvetica;font-size:14pt;">Starting tempo must be less than the ending tempo.</p><p style="font-family:helvetica;font-size:14pt;">Tempo increment must be greater than zero.</p><p style="font-family:helvetica;font-size:14pt;">Loop count must be greater than zero.</p><p style="font-family:helvetica;font-size:14pt;">Please fix and try again.</p>'

		DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

	}
}

//
// Toggle the metronome version of the tune;
//
function ToggleTuneTrainerMetronome(){

	// One time dialog when user first uses the metronome feature
	if (gLocalStorageAvailable){

		if (gIsFirstTimeUsingMetronome){

			gIsFirstTimeUsingMetronome = false;

			localStorage.IsFirstTimeUsingMetronome = false;

			FirstTimeUsingMetronomeDialog(callback);

		}
		else{

			callback();

		}
	}
	else{

		gIsFirstTimeUsingMetronome = false;

		callback();

	}

	function callback(){

		gPlayMetronome = !gPlayMetronome;

		gTheOKButton.click();

		setTimeout(function() {

			if (gPlayMetronome){

				if (!gPlayerABCMetronome){

					gPlayerABCMetronome = inject_one_metronome(gPlayerLooperProcessed, false);

					// Injection failed due to unsupported meter
					if (!gPlayerABCMetronome){

 	                    gLooperMetronomeState = false;
 	                    gPlayMetronome = false;

					    var modal_msg  = '<p style="text-align:center;font-size:20pt;font-family:helvetica">Metronome Not Available for this Meter</p>';
					 	   modal_msg += '<p style="font-size:14pt;line-height:20pt;font-family:helvetica;">No metronome pattern is available for the meter of this tune.</p>';
					 	   modal_msg += '<p style="font-size:14pt;line-height:20pt;font-family:helvetica;">Only the original version can be played.</p>';

						DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) }).then(
							function(){
								TuneTrainerDialog(gPlayerLooperOriginal,gPlayerLooperProcessed,true);
							});

						return;

					}

				}
	            
	            gLooperMetronomeState = true;

				TuneTrainerDialog(gPlayerLooperOriginal,gPlayerABCMetronome,true);

			}
			else{

	            gLooperMetronomeState = false;

	            gPlayerABCMetronome = null;

				// Launch the original tune
				TuneTrainerDialog(gPlayerLooperOriginal,gPlayerLooperProcessed,true);

			}

		},250);		
	}

}


// 
// Tune trainer Dialog
//

// Starting defaults
var gLooperSpeedStart = 50;
var gLooperSpeedEnd = 100;
var gLooperSpeedIncrement = 10;
var gLooperCount = 1;
var gLooperCurrent = gLooperSpeedStart;
var gLooperLoopCount = gLooperCount;
var gPlayerLooperOriginal = null;
var gPlayerLooperProcessed = null;
var gLooperMetronomeState = false;
var gTouchIncrementFive = false;

function TuneTrainerDialog(theOriginalABC, theProcessedABC, looperState){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","TuneTrainer");

	var totalLoops = 0;
	var loopCount = 0;

	gMIDIbuffer = null;
	gTheOKButton = null;

	// We came in because of a looper param change, don't init the tune cache
	if (!looperState){

		gPlayerLooperOriginal = theOriginalABC;
		gPlayerLooperProcessed = theProcessedABC;

		// Clear metronome state
		gPlayMetronome = false;
		gLooperMetronomeState = false;
		gPlayerABCMetronome = null;

	}

	gLooperCurrent = gLooperSpeedStart;
	gLooperLoopCount = gLooperCount;

	// Save the settings in browser local storage for next time
	if (gLocalStorageAvailable){
		localStorage.LooperSpeedStart = gLooperSpeedStart;
		localStorage.LooperSpeedEnd = gLooperSpeedEnd;
		localStorage.LooperSpeedIncrement = gLooperSpeedIncrement;
		localStorage.LooperCount = gLooperCount;
	}

	var soundFontRequested = ScanTuneForSoundFont(theProcessedABC);

	if (soundFontRequested){

		var theOriginalSoundFont = gTheActiveSoundFont;

		switch (soundFontRequested){
			case "fluid":
				gTheActiveSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/";
				break;
			case "musyng":
				gTheActiveSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/MusyngKite/";
				break;
			case "fatboy":
				gTheActiveSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/FatBoy/";
				break;
			case "canvas":
				gTheActiveSoundFont = "https://michaeleskin.com/abctools/soundfonts/canvas/";
				break;
			case "mscore":
				gTheActiveSoundFont = "https://michaeleskin.com/abctools/soundfonts/mscore/";
				break;
		}

		// New soundfont requested, clear the cache
		if (gTheActiveSoundFont != theOriginalSoundFont){
			
			// Clear the soundfont cache
			gSoundsCacheABCJS = {};

		}

	}
	else{

		// No sound font requested, lets see if the current font is the user default
		if (gTheActiveSoundFont != gDefaultSoundFont){

			gTheActiveSoundFont = gDefaultSoundFont;

			// Clear the soundfont cache
			gSoundsCacheABCJS = {};

		}
	}

	// Setup any custom boom-chick rhythm patterns found
	var boomChickOK = ScanTuneForBoomChick(theProcessedABC);

	// Incorrectly formatted %abcjs_boomchick detected, put up an alert
	if (boomChickOK != ""){

		DayPilot.Modal.alert('<p style="font-family:helvetica;font-size:14pt;"><strong>There is an issue with your custom rhythm directive:</strong></p><p style="font-family:helvetica;font-size:14pt;"><strong>'+boomChickOK+'</strong></p><p style="font-family:helvetica;font-size:14pt;">Format should be:</p><p style="font-family:helvetica;font-size:14pt;">%abcjs_boomchick meter rhythm_pattern_string partial_measure</p><p style="font-family:helvetica;font-size:14pt;">Valid rhythm_pattern_string characters are:</p><p style="font-family:helvetica;font-size:14pt;">B - Boom, b - Alternate Boom, c - Chick, and x - Silence.</p><p style="font-family:helvetica;font-size:14pt;">Examples:</p><p style="font-family:helvetica;font-size:14pt;">%abcjs_boomchick 7/8 Bccbxbx 3</p><p style="font-family:helvetica;font-size:14pt;">%abcjs_boomchick 10/8 Bccbccbxbx 5</p><p style="font-family:helvetica;font-size:14pt;">The number of characters in the pattern_string must match the meter numerator.</p><p style="font-family:helvetica;font-size:14pt;">partial_measure sets how many beats must be present in a partial measure in the ABC to use the custom pattern.</p><p style="font-family:helvetica;font-size:14pt;">partial_measure is optional and defaults to half of the meter numerator rounded down to the next lowest integer (min is 1).</p>',{ theme: "modal_flat", top: 50, scrollWithPage: (AllowDialogsToScroll()) });

		return;
	}
	
	var instrument = GetRadioValue("notenodertab");

	var abcOptions = GetABCJSParams(instrument);

	abcOptions.oneSvgPerLine = false;

	// Clear the tab label if present to compress vertical space
	if (instrument != "noten" ){

		// Sanity check the options first
		if (abcOptions.tablature && (abcOptions.tablature.length > 0)){
			abcOptions.tablature[0].label = "";
		}
	}
	
	function setTune(userAction) {

		synthControl.disable(true);

		var visualObj = ABCJS.renderAbc("playback-paper", theProcessedABC, abcOptions)[0];

		// Post process whistle or note name tab
		postProcessTab("playback-paper",instrument,true);

		var midiBuffer = new ABCJS.synth.CreateSynth();

		gMIDIbuffer = midiBuffer;

		midiBuffer.init({
			visualObj: visualObj
		}).then(function (response) {
			console.log(response);
			if (synthControl) {

				var fadeLength = computeFade(theProcessedABC);

				synthControl.setTune(visualObj, userAction, {fadeLength:fadeLength}).then(function (response) {
					
					console.log("Audio successfully loaded.");

					//console.log("Tune is loaded, setting initial warp and loop callback");

					// Stuff in the initial warp
					synthControl.forceWarp(gLooperCurrent);

					synthControl.isLooping = true;

					// Setup the callbacks
					gLoopCallback = LoopCallback;
					gStartPlayCallback = StartCallback;

					// Are we using the trainer touch controls
					if (gTrainerTouchControls){

						//debugger;

						var elems1 = document.getElementsByClassName("abcjs-midi-clock");
						var elems2 = document.getElementsByClassName("abcjs-midi-current-tempo-wrapper");

						if (elems1 && elems2 && (elems1.length > 0) && (elems2.length > 0)){

							gSynthControl = synthControl;
							
							var elem = elems1[0];
							elem.onclick = DecrementTempo;
							elem = elems2[0];
							elem.onclick = IncrementTempo;

						}
					
					}

				}).catch(function (error) {
					
					console.log("Problem loading audio for this tune");

				});
			}
		}).catch(function (error) {

			console.log("Problem loading audio for this tune");

		});
	}

	function StopPlay(){

		gSynthControl = null;

		if (synthControl){
				
			synthControl.destroy();

			synthControl = null;
		}
	}

	//
	// Update the status bar
	//
	function UpdateProgressBar(){

		//debugger;

		if (loopCount > totalLoops){

			return;
		
		}

		if ((gLooperSpeedStart == gLooperSpeedEnd) || (gLooperSpeedIncrement == 0)){

			var elem = document.getElementById("looperstatusbaroverlay");
			elem.style.display = "block";

			elem = document.getElementById("looperstatusbar");
			elem.style.display = "block";

			elem.style.width = "212px";
		
			return;		

		}

		setTimeout(function(){

			var progressWidth = 212;

			var elem = document.getElementById("looperstatusbaroverlay");
			elem.style.display = "block";

			elem = document.getElementById("looperstatusbar");
			elem.style.display = "block";

			if (gLooperSpeedStart != gLooperSpeedEnd);
			{
				progressWidth = 212 * (loopCount/totalLoops);
			}

			elem.style.width = progressWidth+"px";

		},10);

	}

	//
	// Calc the total number of times to get to the full speed
	//
	function CalcTotalLoops(){

		if ((gLooperSpeedStart == gLooperSpeedEnd) || (gLooperSpeedIncrement == 0)){

			return 1;
		
		}

		var count = 0;

		var looperSpeedStart = gLooperSpeedStart;
		var looperSpeedEnd = gLooperSpeedEnd;
		var looperSpeedIncrement = gLooperSpeedIncrement;
		var looperCount = gLooperCount;

		var start = looperSpeedStart;

		while (start < looperSpeedEnd){
			count += looperCount;
			start += looperSpeedIncrement;
		}

		//console.log("count = "+count);

		return count;
	}

	// Callback at end of each loop
	function LoopCallback(){

		//console.log("LoopCallback");

		//console.log("gPlayerInPause "+gPlayerInPause);

		if (!gPlayerInPause){

			if ((!isNaN(gLooperSpeedEnd)) && (!isNaN(gLooperSpeedIncrement)) && (!isNaN(gLooperCount))){

				loopCount++;

				var isAtEnd = false;

				if (gLooperCurrent == gLooperSpeedEnd){
					isAtEnd = true;
				}

				// If incrementing, also possible to just spin at the start tempo
				if (gLooperSpeedIncrement != 0){

					gLooperLoopCount--;

					if (gLooperLoopCount == 0){

						gLooperLoopCount = gLooperCount;

						if (gLooperCurrent != gLooperSpeedEnd){

							gLooperCurrent = gLooperCurrent + gLooperSpeedIncrement;

							if (gLooperCurrent >= gLooperSpeedEnd){
								gLooperCurrent = gLooperSpeedEnd;
								isAtEnd = true;
							}

							synthControl.pause();
						
							synthControl.forceWarp(gLooperCurrent);

						}
						else{
							isAtEnd = true;
						}

					}
					
					var elem = document.getElementById("looperstatus");

					if (!isAtEnd){
						if ((gLooperSpeedStart != gLooperSpeedEnd) && (gLooperSpeedIncrement != 0)){
							elem.innerHTML = "Tempo:&nbsp;"+gLooperCurrent+"%&nbsp;&nbsp;-&nbsp;&nbsp;Loop "+((gLooperCount - gLooperLoopCount)+1)+" of "+gLooperCount;
						}
						else{
							elem.innerHTML = "Tempo:&nbsp;"+gLooperCurrent+"%";
						}
					}
					else{
						elem.innerHTML = "Tempo:&nbsp;"+gLooperCurrent+"%";

					}

					// Update the progress bar
					UpdateProgressBar();
				}
			}
			else{
				
				gPlayerInPause = false;

			}
		}
		else{

			gPlayerInPause = false;

		}
	}

	// Called when the user first clicks play
	function StartCallback(){

		var elem = document.getElementById("looperstatus");

		if ((gLooperSpeedStart != gLooperSpeedEnd) && (gLooperSpeedIncrement != 0)){
			elem.innerHTML = "Tempo:&nbsp;"+gLooperCurrent+"%&nbsp;&nbsp;-&nbsp;&nbsp;Loop 1 of "+gLooperCount;		
		}
		else{
			var elem = document.getElementById("looperstatus");
			elem.innerHTML = "Tempo:&nbsp;"+gLooperCurrent+"%";
		}

		// Update the progress bar
		UpdateProgressBar();

	}

	// 
	// Large control increment/decrement control
	//
	function IncrementDecrementControlValue(event){

		//debugger;

		//console.log("IncrementDecrementControlValue this ="+this);

		//console.log("Control text = "+this.innerHTML);

		var theText = this.innerHTML;

		var theControl = null;
		var theControlIndex = 0;

		if (theText.indexOf("Starting") == 0){
			//console.log("Start control");
			theControl = document.getElementById("looper_start_percent");
			theControlIndex = 0;
		}
		else
		if (theText.indexOf("Ending") == 0){
			//console.log("End control");
			theControl = document.getElementById("looper_end_percent");
			theControlIndex = 1;
		}
		else
		if (theText.indexOf("Tempo") == 0){
			//console.log("Increment control");
			theControl = document.getElementById("looper_increment");
			theControlIndex = 2;
		}
		else
		if (theText.indexOf("Increment") == 0){
			//console.log("Count control");
			theControl = document.getElementById("looper_count");
			theControlIndex = 3;
		}

		const elemRect = this.getBoundingClientRect();

		var eventX = event.clientX;

		var isDecrement = true;
		var delta = 1;

		if ((eventX - elemRect.left) > (elemRect.width/2)){
			
			isDecrement = false;

			if (theControlIndex != 3){

				if (gTouchIncrementFive){
					delta = 5;
				}
			}

		}
		else{

			if (theControlIndex != 3){
				
				if (gTouchIncrementFive){
					delta = 5;
				}

			}

		}

		//console.log("isDecrement = "+isDecrement);

		var theValue = theControl.value;

		switch (theControlIndex){

			// Start
			// End
			case 0:
			case 1:
				theValue = parseFloat(theValue);
				if (isDecrement){
					theValue = theValue - delta;
					if (theValue < 1){
						theValue = 1;
					}
				}
				else{
					theValue = theValue + delta;
					if (theValue > 400){
						theValue = 400
					}
				}
				break;

			// Increment
			case 2:
				theValue = parseFloat(theValue);
				if (isDecrement){
					theValue = theValue - delta;
					if (theValue < 0){
						theValue = 0;
					}
				}
				else{
					theValue = theValue + delta;
					if (theValue > 400){
						theValue = 400
					}
				}
				break;


			// Count
			case 3:
				theValue = parseInt(theValue);
				if (isDecrement){
					theValue = theValue - delta;
					if (theValue < 1){
						theValue = 1;
					}
				}
				else{
					theValue = theValue + delta;
					if (theValue > 100){
						theValue = 100
					}
				}
				break;
		}

		theControl.value = theValue;
	}

	//
	// Touching the % next to the value entry toggles the touch entry decrement/increment value between 1 and 5
	function ToggleTouchValueIncrement(){

		gTouchIncrementFive = !gTouchIncrementFive;

	}

	var cursorControl = new CursorControl();

	var synthControl;

	function initPlay() {

		// Clear the looper callback
		gLoopCallback = null;
		gStartPlayCallback = null;

		// Clear the player in pause flag
		gPlayerInPause = false;

		// Adapt the top based on the player control size
		var theTop = 50;

		var theHeight = window.innerHeight - 450;

	   	modal_msg = '<div id="playerholder" style="height:'+theHeight+'px;overflow-y:auto;margin-bottom:15px;">';

		if (gLargePlayerControls){
			modal_msg += '<div id="abcplayer" class="abcjs-large">';
		}
		else{
			modal_msg += '<div id="abcplayer">';			
		}

	   	modal_msg += '<div id="playback-paper"></div>';
	   	modal_msg += '</div>';

	   	modal_msg += '</div>';

	   	// Add the player controls
		if (gLargePlayerControls){
	   		modal_msg += '<div id="playback-audio" class="abcjs-large"></div>';
		}
		else{
	   		modal_msg += '<div id="playback-audio"></div>';
		}

	   	// Add the tune trainer controls

		modal_msg += '<p class="configure_looper_text" style="text-align:center;margin:0px;margin-top:20px">';
		modal_msg += '<span id="looper_text_1">Starting tempo:</span> <input style="width:75px;margin-right:4px;" id="looper_start_percent" type="number" min="1" step="1" max="400" title="Tune tempo start percentage" autocomplete="off"/><span id="looper_percent_span_1">%&nbsp;&nbsp;&nbsp;&nbsp;</span>';
		modal_msg += '<span id="looper_text_2">Ending tempo:</span> <input style="width:75px;margin-right:4px;" id="looper_end_percent" type="number" min="1" step="1" max="400" title="Tune tempo end percentage" autocomplete="off"/><span id="looper_percent_span_2">%&nbsp;&nbsp;&nbsp;&nbsp;</span>';
		modal_msg += '<span id="looper_text_3">Tempo increment:</span> <input style="width:75px;margin-right:4px;" id="looper_increment" type="number" min="0" step="1" max="400" title="Tempo increment percentage" autocomplete="off"/><span id="looper_percent_span_3">%</span>';
		modal_msg += '</p>';
		modal_msg += '<p class="configure_looper_text" style="text-align:center;margin:0px;margin-top:20px">';
		modal_msg += '<span id="looper_text_4">Increment tempo after how many loops:</span> <input style="width:75px;" id="looper_count" type="number" min="1" step="1" max="100" title="Increment tempo after this many times through the tune" autocomplete="off"/>';
		modal_msg += '</p>';
		modal_msg += '<p class="configure_looper_text" style="text-align:center;margin:0px;margin-top:20px">';
		modal_msg += '<input id="looperreset" class="looperreset button btn btn-looperreset" onclick="TuneTrainerReset();" type="button" value="Apply Tune Trainer Settings and Reload the Player" title="Applies the entered tune trainer settings and reloads the player">';
		modal_msg += '<input id="looper_metronomebutton" class="looper_metronome button btn btn-metronome" onclick="ToggleTuneTrainerMetronome();" type="button" value="Enable Metronome" title="Enables/disables the metronome">'
		modal_msg += '</p>';
		modal_msg += '<a id="looperhelp" href="https://michaeleskin.com/abctools/userguide.html#tune_trainer" target="_blank" style="text-decoration:none;" title="Learn more about the Tune Trainer">💡</a>';
		modal_msg += '<p id="looperstatus"></p>';
		modal_msg += '<div id="looperstatusbar"></div>';
		modal_msg += '<div id="looperstatusbaroverlay"></div>';

	   	// Scale the player for larger screens
		var windowWidth = window.innerWidth;

		var instrument = GetRadioValue("notenodertab");

		var theWidth = windowWidth * 0.45;

		if (isDesktopBrowser()){

			if (theWidth < 850){
				theWidth = 850;
			}

		}
		else{

			theWidth = 800;  
			
		}

		DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: theTop, width:theWidth, okText:"Close", scrollWithPage: (isMobileBrowser()) });

		// Set the initial loop parameters
		document.getElementById("looper_start_percent").value = gLooperSpeedStart;
		document.getElementById("looper_end_percent").value = gLooperSpeedEnd;
		document.getElementById("looper_increment").value = gLooperSpeedIncrement;
		document.getElementById("looper_count").value = gLooperCount;

		// Are we using the trainer touch controls
		if (gTrainerTouchControls){

			document.getElementById("looper_text_1").onclick = IncrementDecrementControlValue;
			document.getElementById("looper_text_2").onclick = IncrementDecrementControlValue;
			document.getElementById("looper_text_3").onclick = IncrementDecrementControlValue;
			document.getElementById("looper_text_4").onclick = IncrementDecrementControlValue;

			document.getElementById("looper_percent_span_1").onclick = ToggleTouchValueIncrement;
			document.getElementById("looper_percent_span_2").onclick = ToggleTouchValueIncrement;
			document.getElementById("looper_percent_span_3").onclick = ToggleTouchValueIncrement;
		
		}

		// Calc the total loops
		totalLoops = CalcTotalLoops();

		// Idle the metronome button
		if (gLooperMetronomeState){

			var elem = document.getElementById("looper_metronomebutton");

			elem.value = "Disable Metronome";

		}
		else{

			var elem = document.getElementById("looper_metronomebutton");

			elem.value = "Enable Metronome";

		}

		var theOKButtons = document.getElementsByClassName("modal_flat_ok");

		// Find the button that says "Close" and hook its click handler to make sure music stops on close
		// Need to search through the modals since there may be a first time share dialog also present
		// the first time someone plays a linked PDF tune

		var theOKButton = null;

		for (var i=0;i<theOKButtons.length;++i){

			theOKButton = theOKButtons[i];

			if (theOKButton.innerText == "Close"){

				gTheOKButton = theOKButton;

				var originalOnClick = theOKButton.onclick;

				theOKButton.onclick = function(){

					originalOnClick(); 
					StopPlay(); 

				    // Focus after operation
				    FocusAfterOperation();

					// If on iOS and the muting controller installed, dispose it now
					if (gIsIOS){

						if (gTheMuteHandle){
						 	gTheMuteHandle.dispose();
  							gTheMuteHandle = null;
  						}
					}

				};

				break;

			}
		}

		if (ABCJS.synth.supportsAudio()) {
			
			synthControl = new ABCJS.synth.SynthController();

			synthControl.load("#playback-audio", cursorControl, {displayLoop: false, displayRestart: true, displayPlay: true, displayProgress: true, displayWarp: true});
			
		} else {

			document.querySelector("#playback-audio").innerHTML = "<div class='audio-error'>Audio is not supported in this browser.</div>";

		}

		setTune(false);

		// Cache autoscroll values early
		gPlayerHolder = document.getElementById("playerholder");
		gPlayerContainerRect = gPlayerHolder.getBoundingClientRect();

	}

	// Try to deal with tab deactivation muting
	if (gIsIOS){

		var context = ABCJS.synth.activeAudioContext();

		// Decide on some parameters
		let allowBackgroundPlayback = false; // default false, recommended false
		let forceIOSBehavior = false; // default false, recommended false

		gTheMuteHandle = null;
		
		// Pass it to unmute if the context exists... ie WebAudio is supported
		if (context)
		{
		  // If you need to be able to disable unmute at a later time, you can use the returned handle's dispose() method
		  // if you don't need to do that (most folks won't) then you can simply ignore the return value
		  gTheMuteHandle = unmute(context, allowBackgroundPlayback, forceIOSBehavior);
		  
		}
	}

	initPlay();

}

// Used by the IncrementTempo and DecrementTempo functions
var gSynthControl = null;

//
// Decrement the tempo
//
function DecrementTempo(){

	//console.log("DecrementTempo");

	var elems = document.getElementsByClassName("abcjs-midi-tempo");

	if (elems && (elems.length>0)){

		var elem = elems[0];
		
		var theTempo = elem.value;

		theTempo = parseInt(theTempo);

		if (!isNaN(theTempo)){
			
			if (theTempo > 5){
				theTempo -= 5;
				elem.value = theTempo;

				gSynthControl.pause();
				gSynthControl.forceWarp(theTempo);

			}
		}
	}
}

//
// Increment the tempo
//
function IncrementTempo(){

	//console.log("IncrementTempo");
	
	var elems = document.getElementsByClassName("abcjs-midi-tempo");

	if (elems && (elems.length>0)){

		var elem = elems[0];
		
		var theTempo = elem.value;

		theTempo = parseInt(theTempo);

		if (!isNaN(theTempo)){

			theTempo += 5;

			elem.value = theTempo;
			
			gSynthControl.pause();
			gSynthControl.forceWarp(theTempo);
		}
	}
}

//
// Save/load global configuration to/from local browser storage
//

// Global settings state
var gAlwaysInjectPrograms = true;
var gTheMelodyProgram = 0;
var gTheChordProgram = 0;
var gAlwaysInjectVolumes = true;
var gTheBassVolume = 64;
var gTheChordVolume = 64;
var gOverridePlayMIDIParams = false;
var gInjectTab_StripChords = true;

// Box and concertina tab global state
var gInjectTab_FontFamily = "Palatino";
var gInjectTab_TabFontSize = 11;
var gInjectTab_StaffSep = 80;
var gInjectTab_MusicSpace = 10;
var gInjectTab_TabLocation = 0;
var gInjectTab_ConcertinaStyle = 0;
var gInjectTab_ConcertinaFingering = 0;
var gInjectTab_GaryCoover = false;

// Box and Concertina Push and draw tablature glyphs
var gInjectTab_PushGlyph = "↓";
var gInjectTab_DrawGlyph = "↑";
var gInjectTab_UseBarForDraw = false;

// Large player controls
var gLargePlayerControls = false;

// Trainer label touch increment/decrement controls
var gTrainerTouchControls = false;

// Bamboo flute key
var gBambooFluteKey = 1; // Default to D

// Mountain Dulcimer style
var gMDulcimerStyle = 0; // Default to high string
var gMDulcimerStripBadTunes = false; // Don't strip bad tunes on MD injection

// Get the initial configuration settings from local browser storage, if present
function GetInitialConfigurationSettings(){

	var val = localStorage.AlwaysInjectPrograms;
	if (val){
		gAlwaysInjectPrograms = (val == "true");
	}
	else{
		gAlwaysInjectPrograms = true;
	}

	val = localStorage.TheMelodyProgram;
	if (val){
		gTheMelodyProgram = val;
	}
	else{
		gTheMelodyProgram = 0;
	}

	val = localStorage.TheChordProgram;
	if (val){
		gTheChordProgram = val;
	}
	else{
		gTheChordProgram = 0;
	}

	val = localStorage.AlwaysInjectVolumes;
	if (val){
		gAlwaysInjectVolumes = (val == "true");
	}
	else{
		gAlwaysInjectVolumes = true;
	}

	val = localStorage.TheBassVolume;
	if (val){
		gTheBassVolume = val;
	}
	else{
		gTheBassVolume = 64;
	}

	val = localStorage.TheChordVolume;
	if (val){
		gTheChordVolume = val;
	}
	else{
		gTheChordVolume = 64;
	}

	val = localStorage.OverridePlayMIDIParams;
	if (val){
		gOverridePlayMIDIParams = (val == "true");
	}
	else{
		gOverridePlayMIDIParams = false;
	}

	// Box and concertina tab global state

	val = localStorage.InjectTab_FontFamily;
	if (val){
		gInjectTab_FontFamily = val;
	}
	else{
		gInjectTab_FontFamily = "Palatino";
	}

	val = localStorage.InjectTab_TabFontSize;
	if (val){
		gInjectTab_TabFontSize = val;
	}
	else{
		gInjectTab_TabFontSize = 10;
	}

	val = localStorage.InjectTab_StaffSep;
	if (val){
		gInjectTab_StaffSep = val;
	}
	else{
		gInjectTab_StaffSep = 80;
	}

	val = localStorage.InjectTab_MusicSpace;
	if (val){
		gInjectTab_MusicSpace = val;
	}
	else{
		gInjectTab_MusicSpace = 10;
	}

	val = localStorage.InjectTab_TabLocation;
	if (val){
		gInjectTab_TabLocation = val;
	}
	else{
		gInjectTab_TabLocation = 0;
	}

	val = localStorage.InjectTab_ConcertinaStyle;
	if (val){
		gInjectTab_ConcertinaStyle = val;
	}
	else{
		gInjectTab_ConcertinaStyle = 0;
	}

	val = localStorage.InjectTab_ConcertinaFingering;
	if (val){
		gInjectTab_ConcertinaFingering = val;
	}
	else{
		gInjectTab_ConcertinaFingering = 1;
	}

	val = localStorage.InjectTab_GaryCoover;
	if (val){
		gInjectTab_GaryCoover = (val == "true");
	}
	else{
		gInjectTab_GaryCoover = false;
	}

	val = localStorage.InjectTab_StripChords;
	if (val){
		gInjectTab_StripChords = (val == "true");
	}
	else{
		gInjectTab_StripChords = true;
	}

	// Push and draw glyphs
	val = localStorage.InjectTab_PushGlyph;
	if (val){
		gInjectTab_PushGlyph = val;
	}
	else{
		gInjectTab_PushGlyph = "↓";
	}

	val = localStorage.InjectTab_DrawGlyph;
	if (val){
		gInjectTab_DrawGlyph = val;
	}
	else{
		gInjectTab_DrawGlyph = "↑";
	}

	val = localStorage.InjectTab_UseBarForDraw;
	if (val){
		gInjectTab_UseBarForDraw = (val == "true");
	}
	else{
		gInjectTab_UseBarForDraw = false;
	}

	// Default to 50% full screen scaling
	val = localStorage.FullScreenScaling;
	if (val){
		gFullScreenScaling = val;
	}
	else{
		gFullScreenScaling = 50;
	}

    var theButtonNames = localStorage.angloButtonNames;

    if (theButtonNames){
        gAngloButtonNames = JSON.parse(theButtonNames);
    }
    else{
    	resetAngloButtonNames();
    }

    var theMusicXMLImportSettings = localStorage.musicXMLImportOptionsV4;

    if (theMusicXMLImportSettings){
        gMusicXMLImportOptions = JSON.parse(theMusicXMLImportSettings);
    }
    else{
    	resetMusicXMLImportOptions();
    }

	val = localStorage.LargePlayerControls;

	if (val){
		gLargePlayerControls = (val == "true");
	}
	else{

		if ((gIsIPhone) || (gIsAndroid)){

			gLargePlayerControls = true;

		}
		else{

			gLargePlayerControls = false;
		}
	}

	val = localStorage.TrainerTouchControls;

	if (val){
		gTrainerTouchControls = (val == "true");
	}
	else{

		if ((gIsIPhone) || (gIsAndroid)){

			gTrainerTouchControls = true;

		}
		else{

			gTrainerTouchControls = false;
		}
	}

	// Bamboo flute
	val = localStorage.BambooFluteKey;
	if (val){
		gBambooFluteKey = val;
	}
	else{
		gBambooFluteKey = 1;
	}

	// Mountain dulcimer
	val = localStorage.MDulcimerStyle;
	if (val){
		gMDulcimerStyle = val;
	}
	else{
		gMDulcimerStyle = 0;
	}

	val = localStorage.MDulcimerStripBadTunes;
	if (val){
		gMDulcimerStripBadTunes = (val == "true");
	}
	else{
		gMDulcimerStripBadTunes = false;
	}

	// ABC rendering fonts
    var theRenderingFonts = localStorage.RenderingFonts;

    if (theRenderingFonts){
        gRenderingFonts = JSON.parse(theRenderingFonts);
    }
    else{
    	resetABCRenderingFonts();
    }

	// Show tab names
	var theShowTabNames = localStorage.abcShowTabNames;

	if (theShowTabNames){

		if (theShowTabNames == "true"){

			gShowTabNames = true;

		}
		else{

			gShowTabNames = false;

		}

	}
	else{

		gShowTabNames = true;
	}

	// Capo
	val = localStorage.abcCapo;
	if (val){
		gCapo = val;
	}
	else{
		gCapo = 0;
	}

	// MP3 bitrate
	val = localStorage.MP3Bitrate;
	if (val){
		gMP3Bitrate = val;
	}
	else{
		gMP3Bitrate = 224;
	}

	// Sound font
	val = localStorage.theSoundFont;
	if (val){
		gDefaultSoundFont = val;
		gTheActiveSoundFont = val;
	}
	else{
		gDefaultSoundFont = "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/";
		gTheActiveSoundFont = gDefaultSoundFont;
	}

	val = localStorage.AutoscrollPlayer;
	if (val){
		gAutoscrollPlayer = (val == "true");
	}
	else{
		gAutoscrollPlayer = true;
	}

	val = localStorage.AutoSwingHornpipes;
	if (val){
		gAutoSwingHornpipes = (val == "true");
	}
	else{
		gAutoSwingHornpipes = true;
	}

	val = localStorage.AutoSwingFactor;
	if (val){
		var testVal = parseFloat(val);
		if (!isNaN(testVal)){
			gAutoSwingFactor = testVal;
		}
	}
	else{
		gAutoSwingFactor = 0.25;
	}


	val = localStorage.UseCustomGMSounds;
	if (val){
		gUseCustomGMSounds = (val == "true");
	}
	else{
		gUseCustomGMSounds = true;
	}

	val = localStorage.TipJarCount;
	if (val){
		gTipJarCount = val;
	}
	else{
		gTipJarCount = 0;
	}

	val = localStorage.IsFirstTimeUsingMetronome;
	if (val){
		gIsFirstTimeUsingMetronome = (val == "true");
	}
	else{
		gIsFirstTimeUsingMetronome = true;
	}

	// Setup initial saved ABC snapshot
	val = localStorage.SavedSnapshot;
	if (!val){
		localStorage.SavedSnapshot = "";
	}

	// Setup initial saved exit snapshot
	val = localStorage.SaveLastAutoSnapShot;
	if (val){
		gSaveLastAutoSnapShot = (val == "true");
	}
	else{
		gSaveLastAutoSnapShot = false;
	}

	val = localStorage.LastAutoSnapShot;
	if (!val){
		localStorage.LastAutoSnapShot = "";
	}

	val = localStorage.PDFFont;
	if (val){
		gPDFFont = val;
	}

	val = localStorage.PDFFontStyle;
	if (val){
		gPDFFontStyle = val;
	}

	val = localStorage.UseComhaltasABC;
	if (val){
		gUseComhaltasABC = (val == "true");
	}

	val = localStorage.AllowMIDIInput;
	if (val){
		gAllowMIDIInput = (val == "true");
	}

	// PDF Features
    var PDFTunebookConfig = localStorage.PDFTunebookConfig;

    if (PDFTunebookConfig){
        gPDFTunebookConfig = JSON.parse(PDFTunebookConfig);
    }
    else{
    	resetPDFTunebookConfig();
    }

    // Tune Trainer settings
    val = localStorage.LooperSpeedStart;
	if (val){
		gLooperSpeedStart = parseFloat(val);
		if (isNaN(gLooperSpeedStart)){
			gLooperSpeedStart = 50;
		}
	}
	else{
		gLooperSpeedStart = 50;
	}

    val = localStorage.LooperSpeedEnd;
	if (val){
		gLooperSpeedEnd = parseFloat(val);
		if (isNaN(gLooperSpeedEnd)){
			gLooperSpeedEnd = 100;
		}
	}
	else{
		gLooperSpeedEnd = 100;
	}

	val = localStorage.LooperSpeedIncrement;
	if (val){
		gLooperSpeedIncrement = parseFloat(val);
		if (isNaN(gLooperSpeedIncrement)){
			gLooperSpeedIncrement = 10;
		}
	}
	else{
		gLooperSpeedIncrement = 10;
	}

	val = localStorage.LooperCount;
	if (val){
		gLooperCount = parseInt(val);
		if (isNaN(gLooperCount)){
			gLooperCount = 1;
		}
	}
	else{
		gLooperCount = 1;
	}

	val = localStorage.abcStaffSpacing;
	if (val){
		gStaffSpacing = STAFFSPACEOFFSET + parseInt(val);
	}
	else{

		// Staff spacing in local storage not initialized, set it here
		// Related to issue where shared tune reset the saved staff spacing
		gStaffSpacing = STAFFSPACEOFFSET + STAFFSPACEDEFAULT;

		var ssp = gStaffSpacing - STAFFSPACEOFFSET;
		localStorage.abcStaffSpacing = ssp;

	}

	// Save the settings, in case they were initialized
	SaveConfigurationSettings();

}

// Save the configuration settings in local browser storage
function SaveConfigurationSettings(){

	// 
	// Centralized place to save local browser storage values
	//
	if (gLocalStorageAvailable){

		localStorage.AlwaysInjectPrograms = gAlwaysInjectPrograms;
		localStorage.TheMelodyProgram = gTheMelodyProgram;
		localStorage.TheChordProgram = gTheChordProgram;
		localStorage.AlwaysInjectVolumes = gAlwaysInjectVolumes;
		localStorage.TheBassVolume = gTheBassVolume;
		localStorage.TheChordVolume = gTheChordVolume;
		localStorage.OverridePlayMIDIParams = gOverridePlayMIDIParams;
		localStorage.InjectTab_StripChords = gInjectTab_StripChords;

		// Box and Concertina tab injection parameters
		localStorage.InjectTab_FontFamily = gInjectTab_FontFamily;
		localStorage.InjectTab_TabFontSize = gInjectTab_TabFontSize;
		localStorage.InjectTab_StaffSep = gInjectTab_StaffSep;
		localStorage.InjectTab_MusicSpace = gInjectTab_MusicSpace;
		localStorage.InjectTab_TabLocation = gInjectTab_TabLocation;
		localStorage.InjectTab_ConcertinaStyle = gInjectTab_ConcertinaStyle;
		localStorage.InjectTab_ConcertinaFingering = gInjectTab_ConcertinaFingering;
		localStorage.InjectTab_GaryCoover = gInjectTab_GaryCoover;

		// Accordion and concertina tab bellows direction glyphs
		localStorage.InjectTab_PushGlyph = gInjectTab_PushGlyph;
		localStorage.InjectTab_DrawGlyph = gInjectTab_DrawGlyph;
		localStorage.InjectTab_UseBarForDraw = gInjectTab_UseBarForDraw;

		// Fullscreen scaling
		localStorage.FullScreenScaling = gFullScreenScaling;

		// Anglo button naming matrix
		localStorage.angloButtonNames = JSON.stringify(gAngloButtonNames);

		// MusicXML import options
		localStorage.musicXMLImportOptionsV4 = JSON.stringify(gMusicXMLImportOptions);

		// Large player control player options
		localStorage.LargePlayerControls = gLargePlayerControls;

		// Trainer touch control options
		localStorage.TrainerTouchControls = gTrainerTouchControls;

		// Save the bamboo flute key
		localStorage.BambooFluteKey =  gBambooFluteKey;

		// Save the mountain dulcimer style and bad tune strip option
		localStorage.MDulcimerStyle =  gMDulcimerStyle;
		localStorage.MDulcimerStripBadTunes = gMDulcimerStripBadTunes

		// Save the ABC rendering fonts
		localStorage.RenderingFonts = JSON.stringify(gRenderingFonts);

		// Save the show tab names state
		var showtabnames = gShowTabNames;
		if (showtabnames){
			localStorage.abcShowTabNames = "true";
		}
		else{
			localStorage.abcShowTabNames = "false";
		}

		// Save the capo state
		localStorage.abcCapo = gCapo;

		// Save the MP3 bitrate
		localStorage.MP3Bitrate = gMP3Bitrate;

		// Save the soundfont preference
		localStorage.theSoundFont = gDefaultSoundFont;

		// Save the player autoscroll preference
		localStorage.AutoscrollPlayer = gAutoscrollPlayer;

		// Save the hornpipe auto-swing setting
		localStorage.AutoSwingHornpipes = gAutoSwingHornpipes

		// Save the auto-swing swing factor
		localStorage.AutoSwingFactor = gAutoSwingFactor

		// Save the custom GM sounds setting
		localStorage.UseCustomGMSounds = gUseCustomGMSounds;

		// Save the tip jar count 
		localStorage.TipJarCount = gTipJarCount;

		// Save the first time using the metronome status
		localStorage.IsFirstTimeUsingMetronome = gIsFirstTimeUsingMetronome;

		// Save the save editor state flag
		localStorage.SaveLastAutoSnapShot = gSaveLastAutoSnapShot;

		// Save the last PDF font and style
		localStorage.PDFFont = gPDFFont;
		localStorage.PDFFontStyle = gPDFFontStyle;

		// Save the Comhaltas display mode
		localStorage.UseComhaltasABC = gUseComhaltasABC;

		// Save the allow MIDI input state
		localStorage.AllowMIDIInput = gAllowMIDIInput;

		// Save the PDF features 
		localStorage.PDFTunebookConfig = JSON.stringify(gPDFTunebookConfig);

		// Save the Tune Trainer settings
		localStorage.LooperSpeedStart = gLooperSpeedStart;
		localStorage.LooperSpeedEnd = gLooperSpeedEnd;
		localStorage.LooperSpeedIncrement = gLooperSpeedIncrement;
		localStorage.LooperCount = gLooperCount;

	}
}


//
// Configure the MusicXML import
//
var gMusicXMLImportOptions = {};

function resetMusicXMLImportOptions(){

	gMusicXMLImportOptions = {
		b:3,
		n:0,
		c:0,
		v:0,
		d:4,
		x:1,
		noped:0,
		p:'',
		v1:0,
		stm:0,
		s:0,
		t:0,
		u:0,
		v:0,
		v1:0,
		mnum:-1,
		m:1,
		addq:1,
		q:100,
		addstavenum:1
	};
}

function setMusicXMLOptions () {

    gMusicXMLImportOptions.u = $('#musicxml_unfld').prop ('checked') ? 1 : 0;
    gMusicXMLImportOptions.b = parseInt ($('#musicxml_bpl').val () || 3);
    gMusicXMLImportOptions.n = parseInt ($('#musicxml_cpl').val () || 0);
    gMusicXMLImportOptions.c = parseInt ($('#musicxml_crf').val () || 0);
    gMusicXMLImportOptions.d = parseInt ($('#musicxml_den').val () || 4);
    gMusicXMLImportOptions.m = parseInt ($('#musicxml_midi').val () || 0);
    gMusicXMLImportOptions.x = $('#musicxml_nlb').prop ('checked') ? 1 : 0;
    gMusicXMLImportOptions.noped = $('#musicxml_noped').prop ('checked') ? 1 : 0;
    gMusicXMLImportOptions.v1 = $('#musicxml_v1').prop ('checked') ? 1 : 0;
    gMusicXMLImportOptions.stm = $('#musicxml_stems').prop ('checked') ? 1 : 0;
    gMusicXMLImportOptions.mnum = parseInt ($('#musicxml_mnum').val () || -1);
    gMusicXMLImportOptions.addq = $('#musicxml_addq').prop ('checked') ? 1 : 0;
    gMusicXMLImportOptions.q = parseInt ($('#musicxml_q').val () || 100);;
    gMusicXMLImportOptions.addstavenum = $('#musicxml_addstavenum').prop ('checked') ? 1 : 0;

 }

function idleXMLImport(){

	$('#musicxml_unfld').prop('checked',(gMusicXMLImportOptions.u == 1));
	$('#musicxml_bpl').val(gMusicXMLImportOptions.b);
	$('#musicxml_cpl').val(gMusicXMLImportOptions.n);
	$('#musicxml_crf').val(gMusicXMLImportOptions.c);
	$('#musicxml_den').val(gMusicXMLImportOptions.d);
	$('#musicxml_midi').val(gMusicXMLImportOptions.m);
	$('#musicxml_nlb').prop('checked',(gMusicXMLImportOptions.x == 1));
	$('#musicxml_noped').prop('checked',(gMusicXMLImportOptions.noped == 1));
	$('#musicxml_v1').prop('checked',(gMusicXMLImportOptions.v1 == 1));
	$('#musicxml_stems').prop('checked',(gMusicXMLImportOptions.stm == 1));
	$('#musicxml_mnum').val(gMusicXMLImportOptions.mnum);
	$('#musicxml_addq').prop('checked',(gMusicXMLImportOptions.addq == 1));
	$('#musicxml_q').val(gMusicXMLImportOptions.q);
	$('#musicxml_addstavenum').prop('checked',(gMusicXMLImportOptions.addstavenum == 1));

};

//
// Reset the MusicXML Import settings
//
function defaultMusicXMLSettings(){

	// Keep track of actions
	sendGoogleAnalytics("action","defaultMusicXMLSettings");

	var thePrompt = "Are you sure you want to reset the MusicXML import options to their default values?";

	// Center the string in the prompt
	thePrompt = makeCenteredPromptString(thePrompt);

	DayPilot.Modal.confirm(thePrompt,{ top:180, theme: "modal_flat", scrollWithPage: (AllowDialogsToScroll()) }).then(function(args){

		if (!args.canceled){

		    resetMusicXMLImportOptions();

		    idleXMLImport();

		}

	});
}

function ConfigureMusicXMLImport(){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","ConfigureMusicXMLImport");

	const theData = {};

	// Copy the original options object for later possible restore
	var originalMusicXMLImportOptions = JSON.parse(JSON.stringify(gMusicXMLImportOptions));

	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:50px;"">Configure MusicXML Import&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#musicxml" target="_blank" style="text-decoration:none;">💡</a></p>';

    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Bars-per-line:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" style="width:60px;" id="musicxml_bpl" type="text" pattern="\d+" title="Default: 3"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Characters-per-line:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" style="width:60px;" id="musicxml_cpl" type="text" pattern="\d+" title="Default: 0 - ignore"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Measure numbers:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" style="width:60px;" id="musicxml_mnum" type="text" pattern="\d+" title="-1: No measure numbers, 1..n: Number every n-th measure, 0: Number every system"/></div>\n';
   	modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Include measure numbers at end of staves:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" id="musicxml_addstavenum" type="checkbox"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Unfold repeats:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" id="musicxml_unfld" type="checkbox"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Credit text filter (level 0-6):&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" style="width:60px;" id="musicxml_crf" type="text" pattern="[0123456]" title="0 (Default), 1, 2, 3, 4, 5, 6"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Denominator unit length for L: tags:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" style="width:60px;" id="musicxml_den" type="text" pattern="\d\d?" title="0 (Automatic), 1, 2, 4, 8, 16, or 32"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">%%MIDI options:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" style="width:60px;" id="musicxml_midi" type="text" pattern="[012]" title="0: No MIDI, 1: Only program, 2: All MIDI"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">No score line breaks:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" id="musicxml_nlb" type="checkbox"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">No pedal directions:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" id="musicxml_noped" type="checkbox"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">All directions to first voice:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" id="musicxml_v1" type="checkbox"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Translate stem directions:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" id="musicxml_stems" type="checkbox"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Inject Q: tag if not present:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" id="musicxml_addq" type="checkbox"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Q: tag value to inject:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" style="width:60px;" id="musicxml_q" type="text" pattern="\d+" title="Default: 100"/></div>\n';
	modal_msg += '<p style="text-align:center;margin-top:22px;"><input id="default_musicxml_settings" class="btn btn-clearbutton default_musicxml_settings" onclick="defaultMusicXMLSettings()" type="button" value="Reset to Default" title="Reset the MusicXML import settings to their default values"></p>\n';

	const form = [
	  {html: modal_msg}
	];


	setTimeout(function(){

		idleXMLImport();

	}, 150);


	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 50, width: 500, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){
		
		// Get the results and store them in the global configuration
		if (!args.canceled){

		    // Save the MusicXML settings
		    if (gLocalStorageAvailable){

		        localStorage.musicXMLImportOptionsV4 = JSON.stringify(gMusicXMLImportOptions);

		    }
		}
		else{

			// Restore the original options
			gMusicXMLImportOptions = originalMusicXMLImportOptions;

		}

	});

}

//
// Initialize the Anglo Concertina button naming matrix
//
function resetAngloButtonNames(){

    gAngloButtonNames = [

        // Top row, LH
        "L1a",
        "L2a",
        "L3a",
        "L4a",
        "L5a",

        // Top row, RH
        "R1a",
        "R2a",
        "R3a",
        "R4a",
        "R5a",

        // Middle row, LH
        "L1",
        "L2",
        "L3",
        "L4",
        "L5",

        // Middle row, RH
        "R1",
        "R2",
        "R3",
        "R4",
        "R5",

        // Bottom row, LH
        "L6",
        "L7",
        "L8",
        "L9",
        "L10",

        // Bottom row, RH
        "R6",
        "R7",
        "R8",
        "R9",
        "R10"
    ];

}

//
//
// Reset the button naming matrix to the default with confirmation
//
function defaultAngloButtonNames(){

	// Keep track of actions
	sendGoogleAnalytics("action","defaultAngloButtonNames");

	var thePrompt = "Are you sure you want to reset the Anglo Concertina button names to their default values?";

	// Center the string in the prompt
	thePrompt = makeCenteredPromptString(thePrompt);

	DayPilot.Modal.confirm(thePrompt ,{ top:180, theme: "modal_flat", scrollWithPage: (AllowDialogsToScroll()) }).then(function(args){

		if (!args.canceled){

			var i;

		    resetAngloButtonNames();

		    for (i=0;i<10;++i){
		        var id = "r1c"+(i+1);
		        document.getElementById(id).value = gAngloButtonNames[i];
		    }
		    
		    for (i=0;i<10;++i){
		        var id = "r2c"+(i+1);
		        document.getElementById(id).value = gAngloButtonNames[i+10];
		    }

		    for (i=0;i<10;++i){
		        var id = "r3c"+(i+1);
		        document.getElementById(id).value = gAngloButtonNames[i+20];
		    }
		    
		}

	});
}

//
// Init the button naming matrix
//
function initAngloButtonNames(){

    var i;

    for (i=0;i<10;++i){
        var id = "r1c"+(i+1);
        document.getElementById(id).value = gAngloButtonNames[i];
    }
    
    for (i=0;i<10;++i){
        var id = "r2c"+(i+1);
        document.getElementById(id).value = gAngloButtonNames[i+10];
    }

    for (i=0;i<10;++i){
        var id = "r3c"+(i+1);
        document.getElementById(id).value = gAngloButtonNames[i+20];
    }

}

//
// Change handler for Anglo fingerings input fields
//
function angloFingeringsChangeHandler(){

	// Walk the current map and inject the requested note names
    var i;

    for (i=0;i<10;++i){
        var id = "r1c"+(i+1);
        gAngloButtonNames[i] = document.getElementById(id).value;
    }
    
    for (i=0;i<10;++i){
        var id = "r2c"+(i+1);
        gAngloButtonNames[i+10] = document.getElementById(id).value;
    }

    for (i=0;i<10;++i){
        var id = "r3c"+(i+1);
        gAngloButtonNames[i+20] = document.getElementById(id).value;
    }

    // Sanity check the button names
    for (i=0;i<30;++i){

        if (gAngloButtonNames[i] == ""){
            gAngloButtonNames[i] = " ";
        }

    }

}

//
// Configure the Anglo concertina button names
//
function ConfigureAngloFingerings(){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","ConfigureAngloFingerings");

	const theData = {};

	// Save off the original fingerings
	var gAngloButtonNamesOriginal = gAngloButtonNames.slice();

	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:50px;">Configure Anglo Concertina Tablature Button Names&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#injecting_box_or_anglo_concertina_tablature" target="_blank" style="text-decoration:none;">💡</a></span></p>';
	modal_msg += '<div id="anglo-button-names-dialog">';
	modal_msg += '<table style="margin-bottom:24px;text-align:center;">\n';
	modal_msg += '<tr>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r1c1" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r1c2" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r1c3" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r1c4" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r1c5" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r1c6" style="margin-left:36px" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r1c7" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r1c8" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r1c9" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r1c10" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '</tr>\n';
	modal_msg += '<tr>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r2c1" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r2c2" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r2c3" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r2c4" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r2c5" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r2c6" style="margin-left:36px" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r2c7" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r2c8" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r2c9" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r2c10" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '</tr>\n';
	modal_msg += '<tr>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r3c1" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r3c2" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r3c3" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r3c4" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r3c5" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r3c6" style="margin-left:36px" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r3c7" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r3c8" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r3c9" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '<td><input class="anglobuttonnames" type="text" id="r3c10" onchange="angloFingeringsChangeHandler()"></td>\n';
	modal_msg += '</tr>\n';
	modal_msg += '</table>\n';
	modal_msg += '</div>\n';
	modal_msg += '<p style="text-align:center;margin-top:22px;"><input id="default_anglo_fingerings" class="btn btn-clearbutton default_anglo_fingerings" onclick="defaultAngloButtonNames()" type="button" value="Reset to Default" title="Reset the Anglo Concertina button names to their default values"></p>\n';

	const form = [
	  {html: modal_msg}
	];


	setTimeout(function(){

		initAngloButtonNames();

	}, 150);


	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 160, width: 800, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){
		
		// Get the results and store them in the global configuration
		if (!args.canceled){

		    // Save the custom button naming map
		    if (gLocalStorageAvailable){

		        localStorage.angloButtonNames = JSON.stringify(gAngloButtonNames);

		    }

		}
		else{

			// Cancelled, reset the original values
			gAngloButtonNames = gAngloButtonNamesOriginal;
		}

	});

}


//
// Tablature settings dialog
//
function ConfigureTablatureSettings(){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","ConfigureTablatureSettings");

    const box_styles = [
	    { name: "  B/C", id: "0" },
	    { name: "  C#/D", id: "1" },
  	];

  	const concertina_fingerings = [
	    { name: "  On-Row", id: "0" },
	    { name: "  Cross-Row", id: "1" },
  	];

  	const concertina_styles = [
	    { name: "  Jeffries", id: "0" },
	    { name: "  Wheatstone", id: "1" },
  	];

    const tab_locations = [
	    { name: "  Above", id: "0" },
	    { name: "  Below", id: "1" },
  	];

	// Setup initial values
	const theData = {
	  configure_font_family: gInjectTab_FontFamily,
	  configure_tab_font_size: gInjectTab_TabFontSize,
	  configure_staffsep: gInjectTab_StaffSep,
	  configure_musicspace: gInjectTab_MusicSpace,
	  configure_tab_location:parseInt(gInjectTab_TabLocation),
	  configure_concertina_style:parseInt(gInjectTab_ConcertinaStyle),
	  configure_concertina_fingering:parseInt(gInjectTab_ConcertinaFingering),
	  configure_strip_chords:gInjectTab_StripChords,
	  configure_pushglyph:gInjectTab_PushGlyph,
	  configure_drawglyph:gInjectTab_DrawGlyph,
	  configure_use_bar_for_draw:gInjectTab_UseBarForDraw,
	  configure_gary_coover:gInjectTab_GaryCoover,
	};

	const form = [
	  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:50px;">Tablature Injection Settings&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#injecting_tablature" target="_blank" style="text-decoration:none;">💡</a></span></p>'},
	  {html: '<p style="margin-top:18px;font-size:12pt;line-height:14pt;font-family:helvetica"><strong>Tablature Font Settings:</strong></p>'},	  
	  {name: "Font family (Recommended: Palatino):", id: "configure_font_family", type:"text", cssClass:"configure_tab_settings_form_text_wide"},
	  {name: "Tablature font size (Recommended: 10):", id: "configure_tab_font_size", type:"text", cssClass:"configure_tab_settings_form_text"},
	  {name: "%%staffsep value (Recommended: 80):", id: "configure_staffsep", type:"text", cssClass:"configure_tab_settings_form_text"},
	  {name: "%%musicspace value (Recommended: 10):", id: "configure_musicspace", type:"text", cssClass:"configure_tab_settings_form_text"},
	  {name: "Character(s) for Push indication (Clearing this field will reset to ↓ ):", id: "configure_pushglyph", type:"text", cssClass:"configure_tab_settings_form_text"},
	  {name: "Character(s) for Draw indication (Clearing this field will reset to ↑ ):", id: "configure_drawglyph", type:"text", cssClass:"configure_tab_settings_form_text"},
	  {name: "    Use a bar over button name to indicate Draw (overrides Push and Draw characters)", id: "configure_use_bar_for_draw", type:"checkbox", cssClass:"configure_tab_settings_form_text"},
	  {name: "Tab location relative to notation:", id: "configure_tab_location", type:"select", options:tab_locations, cssClass:"configure_tab_settings_select"},
	  {name: "    Strip all chords and tab before injecting tab (Tab below only. Tab above always strips.)", id: "configure_strip_chords", type:"checkbox", cssClass:"configure_tab_settings_form_text"},
	  {html: '<p style="margin-top:20px;font-size:12pt;line-height:12pt;font-family:helvetica"><strong>Anglo Concertina Tablature Settings:</strong></p>'},	  
	  {name: "Concertina style:", id: "configure_concertina_style", type:"select", options:concertina_styles, cssClass:"configure_tab_settings_select"}, 
	  {name: "Preferred fingerings:", id: "configure_concertina_fingering", type:"select", options:concertina_fingerings, cssClass:"configure_tab_settings_select"},
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:12pt;font-family:helvetica">On-Row: Favors D5 and E5 on right-side C-row.</p>'},	  
	  {html: '<p style="margin-top:12px;font-size:12pt;line-height:12pt;font-family:helvetica">Cross-Row: Favors D5 and E5 on the left-side G-row.</p>'},	  
	  {html: '<p style="margin-top:12px;font-size:12pt;line-height:12pt;font-family:helvetica">Favors C5 on the left-side G-row draw, B4 on the right-side C-row draw.</p>'},	  
	  {name: "    Gary Coover style tab (single notes only, overrides button name and direction settings)", id: "configure_gary_coover", type:"checkbox", cssClass:"configure_tab_settings_form_text"},
	  {html: '<p style="text-align:center;margin-top:22px;"><input id="configure_anglo_fingerings" class="btn btn-subdialog configure_anglo_fingerings" onclick="ConfigureAngloFingerings()" type="button" value="Configure Anglo Concertina Tablature Button Names" title="Configure the Anglo Concertina tablature button names"></p>'},
	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 25, width: 720, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){

		// Get the results and store them in the global configuration
		if (!args.canceled){

			gInjectTab_FontFamily = args.result.configure_font_family;
			gInjectTab_TabFontSize = args.result.configure_tab_font_size;
			gInjectTab_StaffSep = args.result.configure_staffsep;
			gInjectTab_MusicSpace = args.result.configure_musicspace;
			gInjectTab_TabLocation = args.result.configure_tab_location;
			gInjectTab_ConcertinaStyle = args.result.configure_concertina_style;
			gInjectTab_ConcertinaFingering = args.result.configure_concertina_fingering;
			gInjectTab_StripChords = args.result.configure_strip_chords;
			gInjectTab_GaryCoover = args.result.configure_gary_coover


			// Do some sanity checking on the push and draw glyphs
			gInjectTab_PushGlyph = args.result.configure_pushglyph;

			if (gInjectTab_PushGlyph == ""){
				gInjectTab_PushGlyph = "↓";
			}

			gInjectTab_DrawGlyph = args.result.configure_drawglyph;

			if (gInjectTab_DrawGlyph == ""){
				gInjectTab_DrawGlyph = "↑";
			}
			
			gInjectTab_UseBarForDraw =  args.result.configure_use_bar_for_draw;

			// Save the settings, in case they were initialized
			SaveConfigurationSettings();

		}

	});

}


//
// Font settings dialog
//

// Holds fonts during the duration of the dialog, global settings not changed unless accepted
var gDialogRenderingFonts;

function idleOpenFonts(){

	if (gIsIOS){

		document.getElementById("load_rendering_fonts_fs").removeAttribute("accept");
	
	}	

	//
	// Setup the file import control
	//
	document.getElementById("load_rendering_fonts_fs").onchange = () => {

		let fileElement = document.getElementById("load_rendering_fonts_fs");

		// check if user had selected a file
		if (fileElement.files.length === 0) {

			var thePrompt = "Please select a font settings file";

			// Center the string in the prompt
			thePrompt = makeCenteredPromptString(thePrompt);

			DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

			return;

		}

		let file = fileElement.files[0];

		// Read the file and append it to the editor
		loadFontSettings(file);

		// Reset file selectors
		fileElement.value = "";

	}

}

//
// Load the font settings from a dialog
//
function loadFontSettings(file){

	// Keep track of actions
	sendGoogleAnalytics("action","loadFontSettings");

	const reader = new FileReader();

	reader.addEventListener('load', (event) => {

		var theText = event.target.result;

		var theParsedFonts = JSON.parse(theText);

		// Sanity check a couple of fields
		if ((!theParsedFonts.titlefont) || (!theParsedFonts.voicefont)){

			var thePrompt = "This is not a valid font settings file.";

			// Center the string in the prompt
			thePrompt = makeCenteredPromptString(thePrompt);

			DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

			return;

		}

		gDialogRenderingFonts = theParsedFonts;

		// Idle the fonts dialog display showing the new values
		idleFontsDialog();

	});

	reader.readAsText(file);
}


//
// Load the font settings from a dialog
//
function saveFontSettings(){

	// Keep track of actions
	sendGoogleAnalytics("action","saveFontSettings");

	// Default fonts used for rendering
	var theRenderingFonts = {
		titlefont: $('[name="configure_titlefont"]').val(),
		subtitlefont: $('[name="configure_subtitlefont"]').val(),
		infofont: $('[name="configure_infofont"]').val(),
		partsfont: $('[name="configure_partsfont"]').val(),
		tempofont: $('[name="configure_tempofont"]').val(),
		textfont: $('[name="configure_textfont"]').val(),
		composerfont: $('[name="configure_composerfont"]').val(),
		annotationfont: $('[name="configure_annotationfont"]').val(),
		gchordfont: $('[name="configure_gchordfont"]').val(),
		vocalfont: $('[name="configure_vocalfont"]').val(),
		wordsfont: $('[name="configure_wordsfont"]').val(),
		tabnumberfont: $('[name="configure_tabnumberfont"]').val(),
		historyfont: $('[name="configure_historyfont"]').val(),
		voicefont: $('[name="configure_voicefont"]').val()

	}

	var theRenderingFontsJSON = JSON.stringify(theRenderingFonts);

	saveTextFile("Please enter a filename for your font settings:", "abc_tool_fonts.txt", theRenderingFontsJSON);
	
}


//
// Idle the rendering fonts dialog
// 
function idleFontsDialog(){

	$('[name="configure_titlefont"]').val(gDialogRenderingFonts.titlefont);
	$('[name="configure_subtitlefont"]').val(gDialogRenderingFonts.subtitlefont);
	$('[name="configure_infofont"]').val(gDialogRenderingFonts.infofont);
	$('[name="configure_partsfont"]').val(gDialogRenderingFonts.partsfont);
	$('[name="configure_tempofont"]').val(gDialogRenderingFonts.tempofont);
	$('[name="configure_textfont"]').val(gDialogRenderingFonts.textfont);
	$('[name="configure_composerfont"]').val(gDialogRenderingFonts.composerfont);
	$('[name="configure_annotationfont"]').val(gDialogRenderingFonts.annotationfont);
	$('[name="configure_gchordfont"]').val(gDialogRenderingFonts.gchordfont);
	$('[name="configure_vocalfont"]').val(gDialogRenderingFonts.vocalfont);
	$('[name="configure_wordsfont"]').val(gDialogRenderingFonts.wordsfont);
	$('[name="configure_tabnumberfont"]').val(gDialogRenderingFonts.tabnumberfont);
	$('[name="configure_historyfont"]').val(gDialogRenderingFonts.historyfont);
	$('[name="configure_voicefont"]').val(gDialogRenderingFonts.voicefont);
}

//
// Reset the rendering fonts
//

function resetABCRenderingFonts(){

	// Default fonts used for rendering
	gDialogRenderingFonts = {
		titlefont: "Palatino 18",
		subtitlefont: "Palatino 13",
		infofont: "Palatino 13",
		partsfont: "Palatino 13",
		tempofont: "Palatino 13",
		textfont: "Palatino 13",
		composerfont: "Palatino 13",
		annotationfont: "Palatino 13",
		gchordfont: "Verdana 12",
		vocalfont: "Palatino 13",
		wordsfont: "Palatino 13",
		tabnumberfont: "Arial 12",
		historyfont: "Times New Roman 14",
		voicefont: "Times New Roman 13"

	}
}

//
// Reset the ABC rendering font settings
//
function defaultFontSettings(){

	// Keep track of actions
	sendGoogleAnalytics("action","defaultFontSettings");

	var thePrompt = "Are you sure you want to reset the ABC rendering fonts to their default values?";

	// Center the string in the prompt
	thePrompt = makeCenteredPromptString(thePrompt);

	DayPilot.Modal.confirm(thePrompt,{ top:180, theme: "modal_flat", scrollWithPage: (AllowDialogsToScroll()) }).then(function(args){

		if (!args.canceled){

		    resetABCRenderingFonts();

			// Save the settings, in case they were initialized
			SaveConfigurationSettings();

		    idleFontsDialog();

		}

	});
}

function ConfigureFonts(){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","ConfigureFonts");

	// titlefont: "Palatino 18",
	// subtitlefont: "Palatino 13",
	// infofont: "Palatino 13",
	// partsfont: "Palatino 13",
	// tempofont: "Palatino 13",
	// textfont: "Palatino 13",
	// composerfont: "Palatino 13",
	// annotationfont: "Palatino 13",
	// partsfont: "Palatino 13",
	// gchordfont: "Verdana 12",
	// vocalfont: "Palatino 13",
	// wordsfont: "Palatino 13",
	// tabnumberfont: "Arial 12"
	// historyfont: "Times New Roman 14"
	// voicefont: "Times New Roman 13"

	// Setup initial values
	const theData = {
	  configure_titlefont: gRenderingFonts.titlefont,
	  configure_subtitlefont: gRenderingFonts.subtitlefont,
	  configure_infofont: gRenderingFonts.infofont,
	  configure_partsfont: gRenderingFonts.partsfont,
	  configure_tempofont:gRenderingFonts.tempofont,
	  configure_textfont:gRenderingFonts.textfont,
	  configure_composerfont:gRenderingFonts.composerfont,
	  configure_annotationfont:gRenderingFonts.annotationfont,
	  configure_gchordfont:gRenderingFonts.gchordfont,
	  configure_vocalfont:gRenderingFonts.vocalfont,
	  configure_wordsfont:gRenderingFonts.wordsfont,
	  configure_tabnumberfont:gRenderingFonts.tabnumberfont,
	  configure_historyfont:gRenderingFonts.historyfont,
	  configure_voicefont:gRenderingFonts.voicefont,
	};

	const form = [
	  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:50px;">Configure ABC Rendering Fonts&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#configure_fonts" target="_blank" style="text-decoration:none;">💡</a></span></p>'},
	  {name: "Title font (Default: Palatino 18):", id: "configure_titlefont", type:"text", cssClass:"configure_font_settings_form_text_wide"},
	  {name: "Subtitle font (Default: Palatino 13):", id: "configure_subtitlefont", type:"text", cssClass:"configure_font_settings_form_text_wide"},
	  {name: "Info font (Default: Palatino 13):", id: "configure_infofont", type:"text", cssClass:"configure_font_settings_form_text_wide"},
	  {name: "Composer font (Default: Palatino 13):", id: "configure_composerfont", type:"text", cssClass:"configure_font_settings_form_text_wide"},
	  {name: "Tempo font (Default: Palatino 13):", id: "configure_tempofont", type:"text", cssClass:"configure_font_settings_form_text_wide"},
	  {name: "Guitar chord font (Default: Verdana 12):", id: "configure_gchordfont", type:"text", cssClass:"configure_font_settings_form_text_wide"},
	  {name: "Tab number font (Default: Arial 12):", id: "configure_tabnumberfont", type:"text", cssClass:"configure_font_settings_form_text_wide"},
	  {name: "History font (Default: Times New Roman 14):", id: "configure_historyfont", type:"text", cssClass:"configure_font_settings_form_text_wide"},
	  {name: "Text font (Default: Palatino 13):", id: "configure_textfont", type:"text", cssClass:"configure_font_settings_form_text_wide"},
	  {name: "Annotation font (Default: Palatino 13):", id: "configure_annotationfont", type:"text", cssClass:"configure_font_settings_form_text_wide"},
	  {name: "Voice font (Default: Times New Roman 13):", id: "configure_voicefont", type:"text", cssClass:"configure_font_settings_form_text_wide"},
	  {name: "Parts font (Default: Palatino 13):", id: "configure_partsfont", type:"text", cssClass:"configure_font_settings_form_text_wide"},
	  {name: "Vocal font (Default: Palatino 13):", id: "configure_vocalfont", type:"text", cssClass:"configure_font_settings_form_text_wide"},
	  {name: "Words font (Default: Palatino 13):", id: "configure_wordsfont", type:"text", cssClass:"configure_font_settings_form_text_wide"},
	  {html: '<p style="text-align:center;margin-top:22px;"><input id="save_rendering_fonts" class="btn btn-top save_rendering_fonts" onclick="saveFontSettings()" type="button" value="Save to File" title="Saves the ABC rendering font settings to a file"><input type="file" id="load_rendering_fonts_fs" accept=".txt,.TXT" hidden/><label class="btn btn-top load_rendering_fonts" for="load_rendering_fonts_fs" id="load_rendering_fonts" title="Loads the ABC rendering font settings from a file">Load from File</label><input id="default_rendering_fonts" class="btn btn-clearbutton default_rendering_fonts" onclick="defaultFontSettings()" type="button" value="Reset to Default" title="Reset the ABC rendering fonts to their default values"></p>'}
	];
	
	setTimeout(function(){

		idleOpenFonts();

	}, 150);

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 30, width: 600, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){

		// Get the results and store them in the global configuration
		if (!args.canceled){

			gRenderingFonts.titlefont = args.result.configure_titlefont;
			gRenderingFonts.subtitlefont = args.result.configure_subtitlefont;
			gRenderingFonts.infofont = args.result.configure_infofont;
			gRenderingFonts.partsfont = args.result.configure_partsfont;
			gRenderingFonts.tempofont = args.result.configure_tempofont;
			gRenderingFonts.textfont = args.result.configure_textfont;
			gRenderingFonts.composerfont = args.result.configure_composerfont;
			gRenderingFonts.annotationfont = args.result.configure_annotationfont;
			gRenderingFonts.gchordfont = args.result.configure_gchordfont;
			gRenderingFonts.vocalfont = args.result.configure_vocalfont;
			gRenderingFonts.wordsfont = args.result.configure_wordsfont;
			gRenderingFonts.tabnumberfont = args.result.configure_tabnumberfont;
			gRenderingFonts.historyfont = args.result.configure_historyfont;
			gRenderingFonts.voicefont = args.result.configure_voicefont;

			// Save the settings, in case they were initialized
			SaveConfigurationSettings();

			RenderAsync(true,null);


		}

	});

}


//
// Sharing controls dialog
//

// Add the autoplay string to the URL
function AddAutoPlay(){

	var theURL = urltextbox.value;

	// Check if a play directive already present
	if (theURL.indexOf("&play=1") == -1){
		theURL += "&play=1";
	}

	urltextbox.value = theURL;

	// Give some feedback
	document.getElementById("addautoplay").value = "Auto-Play Added!";

	setTimeout(function(){

		document.getElementById("addautoplay").value = "Add Auto-Play";

	},1500);

}

// Add the disable editing param to the URL
function AddDisableEditing(){

	var theURL = urltextbox.value;

	// Check if a disable editor directive already present
	if (theURL.indexOf("&dx=1") == -1){
		theURL += "&dx=1";
	}

	urltextbox.value = theURL;

	// Give some feedback
	document.getElementById("adddisableediting").value = "Disable Editing Added!";

	setTimeout(function(){

		document.getElementById("adddisableediting").value = "Add Disable Editing";

	},1500);

}


function SharingControlsDialog(){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","SharingControlsDialog");

	// Moving the advanced controls to their own dialog
	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:50px;">ABC Transcription Tools Sharing Controls&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#sharing_controls" target="_blank" style="text-decoration:none;">💡</a></span></p>';
	modal_msg += '<div id="sharing-controls-dialog">';
	modal_msg += '<p style="margin-top:28px;">';
	modal_msg += '<input id="testurl" class="urlcontrols btn btn-urlcontrols" onclick="TestShareURL()" type="button" value="Test Share URL" title="Opens the Share URL in a new tab">';
	modal_msg += '<input id="copyurl" class="urlcontrols btn btn-urlcontrols" onclick="CopyShareURL()" type="button" value="Copy Share URL" title="Copies the Share URL to the clipboard">';
	modal_msg += '<input id="saveurl" class="urlcontrols btn btn-urlcontrols" onclick="SaveShareURL()" type="button" value="Save Share URL" title="Saves the Share URL to a file">';
	modal_msg += '<input id="shortenurl" class="urlcontrols btn btn-urlcontrols" onclick="ShortenURL()" type="button" value="Shorten URL" title="Shortens the Share URL and copies it to the clipboard">';
	modal_msg += '<input id="generateqrcode" class="urlcontrolslast btn btn-urlcontrols" onclick="GenerateQRCode(event)" type="button" value="Generate QR Code" title="Generates a QR Code for the Share URL.&nbsp;&nbsp;Even if this button is greyed-out, Shift-click attempts to generate a QR code from the text in the Share URL box.">';
	modal_msg += '</p>';
	modal_msg += '<p style="margin-top:24px;">';
	modal_msg += '<textarea id="urltextbox" rows="10" cols="80" spellcheck="false" autocorrect="off" autocapitalize="off" placeholder="URL for sharing will appear here" >';
	modal_msg += '</textarea>';
	modal_msg += '</p>';
	modal_msg += '<p id="shareurlcaption">Share URL</p>';
	modal_msg += '<p style="text-align:center;margin-top:36px;"><input id="addautoplay" class="urlcontrols btn btn-urlcontrols" onclick="AddAutoPlay()" type="button" value="Add Auto-Play" title="Adds &play=1 to the ShareURL.&nbsp;&nbsp;Tune will open in the player."><input id="adddisableediting" class="urlcontrolslast btn btn-urlcontrols" onclick="AddDisableEditing()" type="button" value="Add Disable Editing" title="Adds &dx=1 to the ShareURL.&nbsp;&nbsp;Entering the editor from the fullscreen tune view will be disabled."></p>';

	modal_msg += '</div>';

	setTimeout(function(){

		CreateURLfromHTML();

	}, 200);


	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 100, width: 800, scrollWithPage: (AllowDialogsToScroll())}).then(function(){

	});

}

//
// PDF Export dialog
//

//
// Add a new ABC tune template, song template, or PDF tunebook annotation template to the current ABC
//
function idlePDFExportDialog(){

	function showHideIncipitsLayout(val){

		if (val != "incipits"){

			var elem = document.getElementsByName("configure_incipitscolumns");
			
			if (elem && (elem.length!=0)){
				elem[0].disabled = true;
				elem[0].style.opacity = 0.4;

			}

		}
		else{

			var elem = document.getElementsByName("configure_incipitscolumns");
			
			if (elem && (elem.length!=0)){
				elem[0].disabled = false;
				elem[0].style.opacity = 1.0;
			}

		}
	}

	// Idle the incipits column selector
	var elem = document.getElementsByName("configure_tunelayout");

	if (elem && (elem.length!=0)){

		// Initial idle of incipits layout selector
		var val = elem[0].value;

		showHideIncipitsLayout(val)

		// Idle the incipits layout selector
		elem[0].onchange = function(){

			// Initial idle of incipits layout selector
			var val = this.value;

			showHideIncipitsLayout(val);

		}

	}
}

function PDFExportDialog(){

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","PDFExportDialog");


    const papersize_list = [
	    { name: "  Letter", id: "letter" },
	    { name: "  A4", id: "a4" },
  	];

    const tunelayout_list = [
	    { name: "  One Tune per Page", id: "one" },
	    { name: "  Multiple Tunes per Page", id: "multi" },
	    { name: "  Notes Incipits", id: "incipits" },
	    { name: "  ABC Text Incipits", id: "incipits_abc" },
	    { name: "  ABC Text Incipits Sorted", id: "incipits_abc_sort" },
  	];

  	const incipits_columns_list = [
	    { name: "  One Column", id: 1 },
	    { name: "  Two Columns", id: 2 },
  	];

  	const pagenumber_list = [
	    { name: "  None", id: "none" },
	    { name: "  Top Left", id: "tl" },
	    { name: "  Top Center", id: "tc" },
	    { name: "  Top Right", id: "tr" },
	    { name: "  Bottom Left", id: "bl" },
	    { name: "  Bottom Center", id: "bc" },
	    { name: "  Bottom Right", id: "br" },
	    { name: "  Alternating Top Left/Right", id: "tlr" },
	    { name: "  Alternating Top Right/Left", id: "trl" },
	    { name: "  Alternating Bottom Left/Right", id: "blr" },
	    { name: "  Alternating Bottom Right/Left", id: "brl" },
	];

  	const fontname_list = [
	    { name: "  Times", id: "Times" },
	    { name: "  Helvetica", id: "Helvetica" },
	    { name: "  Courier", id: "Courier" },
	];

  	const fontstyle_list = [
	    { name: "  Normal", id: "Normal" },
	    { name: "  Bold", id: "Bold" },
	    { name: "  Oblique", id: "Oblique" },
	    { name: "  Bold Oblique", id: "BoldOblique" },
	];

	var thePaperSize = "letter";

	var theTuneLayout = document.getElementById("pdfformat").value;
	
	if (theTuneLayout.indexOf("a4") != -1){
		thePaperSize = "a4"
		theTuneLayout = theTuneLayout.replace("_a4","");
	}

	var pagenumbers = document.getElementById("pagenumbers").value;

	var firstpage = document.getElementById("firstpage").value;

	var theFirstPage = (firstpage == "yes");

	// Sanity check the PDF font and style
	var dialog_PDFFont = gPDFFont;
	var pdffontlc = dialog_PDFFont.toLowerCase();

	if ((pdffontlc != "times") && (pdffontlc != "helvetica") && (pdffontlc != "courier")){
		dialog_PDFFont = "Times";
	}

	var dialog_PDFFontStyle = gPDFFontStyle;

	if (dialog_PDFFontStyle == ""){
		dialog_PDFFontStyle = "Normal";
	}
	else{

		var pdffontstylelc = dialog_PDFFontStyle.toLowerCase();

		// Times italic to oblique mapping
		if (dialog_PDFFont == "Times"){

			if (pdffontstylelc == "italic"){
				dialog_PDFFontStyle = "Oblique";
			}

			if (pdffontstylelc == "bolditalic"){
				dialog_PDFFontStyle = "BoldOblique";
			}
		}

		// One last check just in case someone put a bad value in a %pdffont directive

		pdffontstylelc = dialog_PDFFontStyle.toLowerCase();

		if ((pdffontstylelc != "normal") && (pdffontstylelc != "bold") && (pdffontstylelc != "oblique") && (pdffontstylelc != "boldoblique")){
			dialog_PDFFontStyle = "Normal";
		}

	}

	// Setup initial values
	const theData = {
	  configure_papersize:thePaperSize,
	  configure_tunelayout:theTuneLayout,
	  configure_incipitscolumns: gIncipitsColumns,
	  configure_pagenumber:pagenumbers,
	  configure_pagenumberonfirstpage:theFirstPage,
	  configure_fontname:dialog_PDFFont,
	  configure_fontstyle:dialog_PDFFontStyle,
	};

	var form = [
	  {html: '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:50px;">Export PDF Tunebook&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#export_pdf_tunebook" target="_blank" style="text-decoration:none;">💡</a></span></p>'}, 
	  {html:'<p style="text-align:center;margin-top:24px;"><input id="tunebookbuilder" class="advancedcontrols btn btn-injectcontrols-tunebookbuilder" onclick="PDFTunebookBuilder();" type="button" value="Configure PDF Tunebook Features" title="Easily add features to your PDF tunebook including: Title Page, Table of Contents, Index, Page Headers, Page Footers, playback links, and custom QR Code"></p>'},
	  {name: "Paper Size:", id: "configure_papersize", type:"select", options:papersize_list, cssClass:"configure_pdf_papersize_select"},
	  {name: "Tune Layout:", id: "configure_tunelayout", type:"select", options:tunelayout_list, cssClass:"configure_pdf_tunelayout_select"},
	  {name: "Notes Incipits Columns:", id: "configure_incipitscolumns", type:"select", options:incipits_columns_list, cssClass:"configure_pdf_incipitscolumns_select"},
	  {name: "Page Number Location:", id: "configure_pagenumber", type:"select", options:pagenumber_list, cssClass:"configure_pdf_pagenumber_select"},
	  {name: "            Page Number on First Page", id: "configure_pagenumberonfirstpage", type:"checkbox", cssClass:"configure_pdf_settings_form_text"},
	  {html: '<p style="margin-top:36px;font-size:12pt;line-height:18px;font-family:helvetica;">Font for Title Page, Table of Contents, Index, Page Headers/Footers, Page Numbers, Text Incipits:</strong></p>'},  
	  {name: "Font:", id: "configure_fontname", type:"select", options:fontname_list, cssClass:"configure_pdf_fontname_select"},
	  {name: "Font Style:", id: "configure_fontstyle", type:"select", options:fontstyle_list, cssClass:"configure_pdf_fontstyle_select"},
	  {html: '<p style="font-size:3pt;">&nbsp;</p>'}	
	];

	setTimeout(function(){

		idlePDFExportDialog();

	}, 150);

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 100, width: 760, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){
	
		if (!args.canceled){

			gIncipitsColumns = args.result.configure_incipitscolumns;

			var thePaperSize = args.result.configure_papersize;

			var theTuneLayout = args.result.configure_tunelayout;

			if (thePaperSize == "a4"){

				// Map the dialog values to the renderer expectation
				if (theTuneLayout == "incipits_abc"){
					theTuneLayout = "incipits_a4_abc";
				}
				else
				if (theTuneLayout == "incipits_abc_sort"){
					theTuneLayout = "incipits_a4_abc_sort";
				}
				else{
					theTuneLayout += "_a4";
				}

			}

			document.getElementById("pdfformat").value = theTuneLayout;

			var thePageNumber = args.result.configure_pagenumber;
			document.getElementById("pagenumbers").value = thePageNumber;

			var thePageNumberOnFirstPage = args.result.configure_pagenumberonfirstpage;
			if (thePageNumberOnFirstPage){
				document.getElementById("firstpage").value = "yes";
			}
			else{
				document.getElementById("firstpage").value = "no";
			}

			var theFontName = args.result.configure_fontname;
			gPDFFont = theFontName;

			var theFontStyle = args.result.configure_fontstyle;

			// Remap Normal style to empty for Helvetica and Courier
			if (theFontStyle == "Normal"){

				theFontStyle = "";

			}
			else{

				// Remap Time Oblique style names
				switch (theFontName){
					
					case "Times":
						// Translate Times style description
						if(theFontStyle.toLowerCase() == "oblique"){
							theFontStyle = "Italic";
						}
						else
						if(theFontStyle.toLowerCase() == "boldoblique"){
							theFontStyle = "BoldItalic";
						}
						break;

					case "Helvetica":
					case "Courier":
						break;
						
				}
			
			}

			gPDFFontStyle = theFontStyle;

			SavePDFSettings();

			ExportPDF();				
		}

	});
}

//
// Advanced controls dialog
//
function AdvancedControlsDialog(){

	// Keep track of advanced controls dialog
	sendGoogleAnalytics("dialog","AdvancedControlsDialog");

	// Set global flag that we're in the advanced controls dialog
	gInAdvancedSettingsDialog = true;

	// Moving the advanced controls to their own dialog
	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:50px;">ABC Transcription Tools Advanced Controls&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#advanced_controls" target="_blank" style="text-decoration:none;">💡</a></span></p>';
	modal_msg += '<div id="advanced-controls-dialog">';
	
	modal_msg  += '<p style="text-align:center;font-size:14pt;font-family:helvetica;margin-top:22px;">Show/Hide ABC Features</p>'
	modal_msg  += '<p style="text-align:center;">'
	modal_msg  += '<input id="toggleannotations" class="advancedcontrolsdisabled btn btn-advancedcontrols" onclick="ToggleAnnotations(false)" type="button" value="Hide Annotations" title="Hides/Shows common annotations in the ABC notation">';
	modal_msg  += 	'<input id="toggletext" class="advancedcontrolsdisabled btn btn-advancedcontrols" onclick="ToggleTextAnnotations(false)" type="button" value="Hide Text" title="Hides/Shows any text in the ABC notation">';
	modal_msg  += 	'<input id="togglechords" class="advancedcontrolsdisabled btn btn-advancedcontrols" onclick="ToggleChords(false)" type="button" value="Hide Chords" title="Hides/Shows any chords in the ABC notation">';
	modal_msg  += 	'<input id="toggletab" class="advancedcontrolsdisabled btn btn-advancedcontrols" onclick="ToggleTab(false)" type="button" value="Hide Injected Tab" title="Hides/Shows any injected tablature">';
	modal_msg  += '</p>';
	
	modal_msg += '<p style="text-align:center;font-size:14pt;font-family:helvetica;margin-top:22px;">Strip ABC Features</p>'
	modal_msg  += '<p style="text-align:center;">';
	modal_msg  += '<input id="stripannotations" class="advancedcontrolsdisabled btn btn-injectcontrols" onclick="ToggleAnnotations(true)" type="button" value="Strip Annotations" title="Strips common annotations from the ABC">';
	modal_msg  += 	'<input id="striptext" class="advancedcontrolsdisabled btn btn-injectcontrols" onclick="ToggleTextAnnotations(true)" type="button" value="Strip Text" title="Strips all text from the ABC">';
	modal_msg  += 	'<input id="stripchords" class="advancedcontrolsdisabled btn btn-injectcontrols" onclick="ToggleChords(true)" type="button" value="Strip Chords" title="Strips all chords from the ABC">';
	modal_msg  += 	'<input id="striptab" class="advancedcontrolsdisabled btn btn-injectcontrols" onclick="ToggleTab(true)" type="button" value="Strip Injected Tab" title="Strips all injected tablature">';
	modal_msg  += '</p>';
	modal_msg += '<p style="text-align:center;font-size:14pt;font-family:helvetica;margin-top:22px;">ABC Injection Features</p>'
	modal_msg  += '<p style="text-align:center;">'
	modal_msg  += '<input id="injectallheaders" class="advancedcontrols btn btn-injectcontrols-headers" onclick="InjectPDFHeaders()" type="button" value="Inject All Available PDF Tunebook Annotations" title="Injects all available tool-specific PDF tunebook annotations for title page, table of contents, index generation, etc. at the top of the ABC">';	
	modal_msg  += '<input id="injectsectionheader" class="advancedcontrols btn btn-injectcontrols-headers" onclick="InjectSectionHeader()" type="button" value="Inject PDF Section Header" title="Injects a PDF section header placeholder tune at the cursor insertion point">';
	modal_msg  += '</p>';
	modal_msg  += '<p style="text-align:center;margin-top:22px;">';
	modal_msg  += '<input id="injectallmidiparams" class="advancedcontrols btn btn-injectcontrols-headers" onclick="InjectAllMIDIParams()" type="button" value="Inject MIDI Soundfont, Melody, Chord, and Volumes" title="Injects MIDI Soundfont, Melody program, Chord program and volume annotation into one or all tunes">';
	modal_msg  += '<input id="injectmetronome" class="advancedcontrols btn btn-injectcontrols-headers" onclick="InjectMetronome()" type="button" value="Inject Metronome" title="Injects ABC for a metronome into one or all tunes">';
	modal_msg  += '</p>';
	modal_msg  += '<p style="text-align:center;margin-top:22px;">';
	modal_msg  += '<input id="injectheaderstring" class="advancedcontrols btn btn-injectcontrols-headers" onclick="InjectHeaderString()" type="button" value="Inject ABC Header String" title="Injects a string into the top or bottom of the ABC header for one or all tunes">';	
	modal_msg  += '<input id="injectstaffwidth" class="advancedcontrols btn btn-injectcontrols-headers" onclick="InjectStaffWidth()" type="button" value="Inject %%staffwidth" title="Injects a %%staffwidth annotation into one or all tunes">';
	modal_msg  += '<input id="injectclicktrackall" class="advancedcontrols btn btn-injectcontrols-headers" onclick="InjectRepeatsAndClickTrackAll()" type="button" value="Inject Repeats and Click Intros" title="Injects repeated copies of tunes and optional style-adaptive two-bar click intros into every tune">';	
	modal_msg  += '</p>';
	modal_msg  += '<p style="text-align:center;margin-top:22px;">'
	modal_msg  += '<input id="injectbctab" class="advancedcontrols btn btn-injectcontrols" onclick="DoInjectTablature_BC()" type="button" value="Inject B/C Box Tab" title="Injects B/C box tablature into the ABC">';
	modal_msg  += '<input id="injectcdtab" class="advancedcontrols btn btn-injectcontrols" onclick="DoInjectTablature_CsD()" type="button" value="Inject C#/D Box Tab" title="Injects C#/D box tablature into the ABC">';
	modal_msg  += '<input id="injectanglotab" class="advancedcontrols btn btn-injectcontrols" onclick="DoInjectTablature_Anglo()" type="button" value="Inject Anglo Concertina Tab" title="Injects Anglo Concertina tablature into the ABC">';
	modal_msg  += '</p>';
	modal_msg  += '<p style="text-align:center;margin-top:22px;">'
	modal_msg  += '<input id="injectfiddlefingerings" class="advancedcontrols btn btn-injectcontrols" onclick="DoInjectTablature_Fiddle_Fingerings()" type="button" value="Inject Fiddle Fingerings" title="Injects Fiddle fingerings tablature into the ABC">';
	modal_msg  += '<input id="injectmd" class="advancedcontrols btn btn-injectcontrols" onclick="DoInjectTablature_MD()" type="button" value="Inject DAD Dulcimer Tab" title="Injects DAD-tuned Mountain Dulcimer tablature into the ABC">';
	modal_msg  += '<input id="injectbambooflute" class="advancedcontrols btn btn-injectcontrols" onclick="DoInjectTablature_Bamboo_Flute()" type="button" value="Inject Bamboo Flute Tab" title="Injects Bamboo flute tablature into the ABC">';
	modal_msg  += '</p>';
	modal_msg  += '<p style="text-align:center;margin-top:22px;"><input id="configure_box_advanced" class="btn btn-subdialog configure_box_advanced " onclick="ConfigureTablatureSettings()" type="button" value="Configure Tablature Injection Settings" title="Configure the tablature injection settings"></p>';	
	modal_msg  += '<p style="text-align:center;margin-top:22px;"><input id="configure_instrument_explorer" class="configure_instrument_explorer button btn btn-instrumentexplorer" onclick="InstrumentExplorer();" type="button" value="MIDI Instrument Explorer" title="Brings up a tune player where you can experiment playing the current tune with different MIDI soundfonts and melody/chord instruments"><input id="configure_swing_explorer" class="btn btn-swingexplorer configure_swing_explorer " onclick="SwingExplorer()" type="button" value="Swing Explorer" title="Brings up a tune player where you can experiment with different swing factor and offset settings"><input id="configure_grace_explorer" class="btn btn-graceexplorer configure_grace_explorer " onclick="GraceExplorer()" type="button" value="Grace Duration Explorer" title="Brings up a tune player where you can experiment with different grace note duration settings"></p>';
	modal_msg  += '<p style="text-align:center;margin-top:22px;"><input id="configure_batch_mp3_export" class="btn btn-batchmp3export configure_batch_mp3_export " onclick="BatchMP3Export()" type="button" value="Export all Tunes as MP3" title="Exports all the tunes in the ABC text area as .mp3 files"><input class="sortbutton btn btn-sortbutton" id="sortbutton" onclick="SortDialog()" type="button" value="Sort by Specific Tag" title="Brings up the Sort by Specific Tag dialog"><input id="ceoltastransform" class="advancedcontrols btn btn-injectcontrols" onclick="DoCeoltasTransformDialog()" type="button" value="Comhaltas ABC Transform" title="Transforms the ABC to/from Comhaltas format."></p>';
	modal_msg += '</div>';

	setTimeout(function(){

		// Do an initial idle on the controls
		IdleAdvancedControls(true);

		// Idle the show tab names control
		IdleAllowShowTabNames();

	}, 200);


	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 20, width: 700,  scrollWithPage: (AllowDialogsToScroll()) }).then(function(){
					
		// Clear advanced controls dialog flag
		gInAdvancedControlsDialog = false;

		});


}

//
// Configuration settings dialog
//
function ConfigureToolSettings(e) {

	// Shift click goes directly to the Box and Anglo concertina settings dialog
	if (e.shiftKey){

		ConfigureTablatureSettings();
		
		return;
	}
	
	// Alt click goes directly to the MusicXML import configuration dialog
	if (e.altKey){

		ConfigureMusicXMLImport();
		
		return;
	}

	// Keep track of advanced controls dialog
	sendGoogleAnalytics("dialog","ConfigureToolSettings");

    var midi_program_list = [];

  	for (var i=0;i<138;++i){
  		midi_program_list.push({name: "  "+ generalMIDISoundNames[i], id: i });
  	}

	var bAlwaysInjectPrograms = gAlwaysInjectPrograms;

	var theMelodyProgram = gTheMelodyProgram;

	var selectedMelodyProgram;
	if (theMelodyProgram == "mute"){
		selectedMelodyProgram = 0;
	}
	else{
		selectedMelodyProgram = parseInt(theMelodyProgram)+1;
	}

	var theChordProgram = gTheChordProgram;

	var selectedChordProgram;
	if (theChordProgram == "mute"){
		selectedChordProgram = 0;
	}
	else{
		selectedChordProgram = parseInt(theChordProgram)+1;
	}

	var bAlwaysInjectVolumes = gAlwaysInjectVolumes;

	var theBassVolume = gTheBassVolume;
	var theChordVolume = gTheChordVolume;

	var bOverridePlayMIDIParams = gOverridePlayMIDIParams;

	var theFullScreenScaling = gFullScreenScaling;

	var theOldStaffSpacing = gStaffSpacing - STAFFSPACEOFFSET;

	var theOldShowTabNames = gShowTabNames;

	var theOldCapo = gCapo;

	var theOldSoundFont = gDefaultSoundFont;

	var theOldUseCustomGMSounds = gUseCustomGMSounds;

	var theOldSaveLastAutoSnapShot = gSaveLastAutoSnapShot;

	var theOldComhaltas = gUseComhaltasABC;

	var theOldAllowMIDIInput = gAllowMIDIInput;

	// Setup initial values
	const theData = {
	  configure_inject_programs: bAlwaysInjectPrograms,
	  configure_melody_program: selectedMelodyProgram,
	  configure_chord_program: selectedChordProgram,
	  configure_inject_volumes: bAlwaysInjectVolumes,
	  configure_bass_volume: theBassVolume,
	  configure_chord_volume: theChordVolume,
	  configure_override_play_midi_params: bOverridePlayMIDIParams,
	  configure_fullscreen_scaling: theFullScreenScaling,
	  configure_staff_spacing: theOldStaffSpacing,
	  configure_large_player_controls: gLargePlayerControls,
	  configure_trainer_touch_controls: gTrainerTouchControls,
	  configure_show_tab_names: gShowTabNames,
	  configure_capo: gCapo,
	  configure_mp3_bitrate: gMP3Bitrate,
	  configure_soundfont: gDefaultSoundFont,
	  configure_autoscrollplayer: gAutoscrollPlayer,
	  configure_use_custom_gm_sounds: gUseCustomGMSounds,
	  configure_save_exit_snapshot: gSaveLastAutoSnapShot,
	  configure_comhaltas: gUseComhaltasABC,	  
	  configure_allow_midi_input: gAllowMIDIInput,	  
	  configure_auto_swing_hornpipes: gAutoSwingHornpipes,	  
	  configure_auto_swing_factor: gAutoSwingFactor,	  
	};

 	const sound_font_options = [
	    { name: "  Fluid", id: "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/" },
	    { name: "  Musyng Kite", id: "https://paulrosen.github.io/midi-js-soundfonts/MusyngKite/" },
	    { name: "  FatBoy", id: "https://paulrosen.github.io/midi-js-soundfonts/FatBoy/" },
 	    { name: "  Canvas", id: "https://michaeleskin.com/abctools/soundfonts/canvas/" },
 	    { name: "  MScore", id: "https://michaeleskin.com/abctools/soundfonts/mscore/" },
 	];

  	// Disallowing auto snapshots on mobile

	var form = [
	  {html: '<p style="text-align:center;font-size:16pt;font-family:helvetica;margin-left:50px;">ABC Transcription Tools Settings&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#settings_dialog" target="_blank" style="text-decoration:none;">💡</a></span></p>'}
	];

	if (isDesktopBrowser()){
		form.push(
	  		{name: "   Save an Auto-Snapshot on browser tab close or reload (Restore it from the Add dialog)", id: "configure_save_exit_snapshot", type:"checkbox", cssClass:"configure_settings_form_text_checkbox"}
	  );
	}

	const form2 = [
	  {name: "Full screen tune display scaling (percentage):", id: "configure_fullscreen_scaling", type:"number", cssClass:"configure_settings_form_text"},
	  {name: "Staff spacing (default is 10):", id: "configure_staff_spacing", type:"number", cssClass:"configure_settings_form_text"},
	  {name: "    Show stringed instrument names on tablature (never shown in the Player)", id: "configure_show_tab_names", type:"checkbox", cssClass:"configure_settings_form_text_checkbox"},
	  {name: "Stringed instrument capo fret postion:", id: "configure_capo", type:"number", cssClass:"configure_settings_form_text"},
	  {name: "Default abcjs soundfont:", id: "configure_soundfont", type:"select", options:sound_font_options, cssClass:"configure_settings_select"}, 
	  {name: "    Use AppCordions custom sounds for Dulcimer, Accordion, Flute, and Whistle", id: "configure_use_custom_gm_sounds", type:"checkbox", cssClass:"configure_settings_form_text_checkbox"},
	  {name: "            Use Default Melody and Bass/Chord programs when playing tunes", id: "configure_inject_programs", type:"checkbox", cssClass:"configure_settings_form_text_checkbox"},
	  {name: "Default Melody MIDI program:", id: "configure_melody_program", type:"select", options:midi_program_list, cssClass:"configure_midi_program_form_select"},
	  {name: "Default Bass/Chords MIDI program:", id: "configure_chord_program", type:"select", options:midi_program_list, cssClass:"configure_midi_program_form_select"},
	  {name: "            Use Default Bass/Chord volumes when playing tunes", id: "configure_inject_volumes", type:"checkbox", cssClass:"configure_settings_form_text_checkbox"},
	  {name: "Default Bass MIDI volume (0-127):", id: "configure_bass_volume", type:"number", cssClass:"configure_settings_form_text"},
	  {name: "Default Chords MIDI volume (0-127):", id: "configure_chord_volume", type:"number", cssClass:"configure_settings_form_text"},
	  {name: "            Override all MIDI programs and volumes in the ABC when playing tunes", id: "configure_override_play_midi_params", type:"checkbox", cssClass:"configure_settings_form_text_checkbox"},
	  {name: "            Automatically swing Hornpipes when playing (enabled if R:Hornpipe is found in the tune)", id: "configure_auto_swing_hornpipes", type:"checkbox", cssClass:"configure_settings_form_text_checkbox"},
	  {name: "Auto-swing scale factor (range is -0.9 to 0.9, default for Hornpipes is 0.25):", id: "configure_auto_swing_factor", type:"number", cssClass:"configure_settings_form_text"},
	  {name: "            Autoscroll player when playing", id: "configure_autoscrollplayer", type:"checkbox", cssClass:"configure_settings_form_text_checkbox"},
	  {name: "MP3 audio export bitrate (kbit/sec):", id: "configure_mp3_bitrate", type:"number", cssClass:"configure_settings_form_text"},
	  {name: "    Player uses large controls (easier to touch on phone/tablet)", id: "configure_large_player_controls", type:"checkbox", cssClass:"configure_settings_form_text_checkbox"},
	  {name: "    Player/Tune Trainer uses label L/R side click to decrement/increment values (for touch devices)", id: "configure_trainer_touch_controls", type:"checkbox", cssClass:"configure_settings_form_text_checkbox"},
	  {name: "    Note name tablature uses Comhaltas style ABC (D' E' F' instead of d e f for octave notes)", id: "configure_comhaltas", type:"checkbox", cssClass:"configure_settings_form_text_checkbox"},
	];

	form = form.concat(form2);

	if (browserSupportsMIDI()){
		form.push({name: "    Allow MIDI input for ABC text entry", id: "configure_allow_midi_input", type:"checkbox", cssClass:"configure_settings_form_text_checkbox"});
	};

	form.push({html: '<p style="text-align:center;"><input id="configure_fonts" class="btn btn-subdialog configure_fonts" onclick="ConfigureFonts()" type="button" value="Configure ABC Fonts" title="Configure the fonts used for rendering the ABC"><input id="configure_box" class="btn btn-subdialog configure_box" onclick="ConfigureTablatureSettings()" type="button" value="Configure Tablature Injection Settings" title="Configure the tablature injection settings"><input id="configure_musicxml_import" class="btn btn-subdialog configure_musicxml_import" onclick="ConfigureMusicXMLImport()" type="button" value="Configure MusicXML Import" title="Configure MusicXML import parameters"></p>'});	  

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 10, width: 780, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){

		// Get the results and store them in the global configuration
		if (!args.canceled){

			gAlwaysInjectPrograms = args.result.configure_inject_programs;

			gUseComhaltasABC = args.result.configure_comhaltas;

			gTheMelodyProgram = args.result.configure_melody_program;
			gTheChordProgram = args.result.configure_chord_program;

			gAlwaysInjectVolumes = args.result.configure_inject_volumes;
			gTheBassVolume = args.result.configure_bass_volume;
			gTheChordVolume = args.result.configure_chord_volume;

			gOverridePlayMIDIParams = args.result.configure_override_play_midi_params;

			gLargePlayerControls = args.result.configure_large_player_controls;

			gTrainerTouchControls = args.result.configure_trainer_touch_controls;

			gShowTabNames = args.result.configure_show_tab_names;
			
			if (isDesktopBrowser()){

				gSaveLastAutoSnapShot = args.result.configure_save_exit_snapshot;

				// Clear any existing auto snapshot if not requested
				if (!gSaveLastAutoSnapShot){

					if (gLocalStorageAvailable){

						localStorage.LastAutoSnapShot = "";

					}

					// Was on before, now is off
					if (theOldSaveLastAutoSnapShot != gSaveLastAutoSnapShot){

						RemoveTabCloseListener();

					}

				}
				else
				{
					// Was off, now is on
					if (theOldSaveLastAutoSnapShot != gSaveLastAutoSnapShot){

						AddTabCloseListener();

					}
				}

			}
			else{
			
				gSaveLastAutoSnapShot = false;
			
			}

			// Allow MIDI input if enabled
			if (browserSupportsMIDI()){

				gAllowMIDIInput = args.result.configure_allow_midi_input;

				// If they've allowed MIDI input, and not currently using it
				if (theOldAllowMIDIInput != gAllowMIDIInput){

					if (gAllowMIDIInput){

						sendGoogleAnalytics("action","enable_MIDI");

						initMIDI();
					}

				}
			}


			// Validate the staff spacing value
			var testStaffSpacing = args.result.configure_staff_spacing;

			testStaffSpacing = parseInt(testStaffSpacing);

			if (!((isNaN(testStaffSpacing)) || (testStaffSpacing == undefined))){

				// Limit is the negative staffsep offset
				if (testStaffSpacing < (-1*STAFFSPACEOFFSET)){
					testStaffSpacing = (-1*STAFFSPACEOFFSET);
				}
			}
			else{
				testStaffSpacing = gStaffSpacing;
			}

			if (gTheMelodyProgram == 0){
				gTheMelodyProgram = "mute";
			}
			else{
				gTheMelodyProgram--;
			}

			if (gTheMelodyProgram != "mute"){

				// Sanity check the values
				if (isNaN(parseInt(gTheMelodyProgram))){
					gTheMelodyProgram = 0;
				}

				if (gTheMelodyProgram < 0){
					gTheMelodyProgram = 0;
				}

				if (gTheMelodyProgram > 136){
					gTheMelodyProgram = 136;
				}
			}

			if (gTheChordProgram == 0){
				gTheChordProgram = "mute";
			}
			else{
				gTheChordProgram--;
			}

			if (gTheChordProgram != "mute"){

				if (isNaN(parseInt(gTheChordProgram))){
					gTheChordProgram = 0;
				}

				if (gTheChordProgram < 0){
					gTheChordProgram = 0;
				}

				if (gTheChordProgram > 136){
					gTheChordProgram = 136;
				}
			}


			if (isNaN(parseInt(gTheBassVolume))){
				gTheBassVolume = 0;
			}

			if (gTheBassVolume < 0){
				gTheBassVolume = 0;
			}

			if (gTheBassVolume > 127){
				gTheBassVolume = 127;
			}

			if (isNaN(parseInt(gTheChordVolume))){
				gTheChordVolume = 0;
			}

			if (gTheChordVolume < 0){
				gTheChordVolume = 0;
			}

			if (gTheChordVolume > 127){
				gTheChordVolume = 127;
			}

			if (gUseCustomGMSounds){

				if ((gAlwaysInjectPrograms || gOverridePlayMIDIParams) && ((gTheMelodyProgram == "15") || (gTheChordProgram == "15"))){

					// Special release time case case for Dulcimer
				   	var modal_msg  = '<p style="text-align:center;font-size:16pt;font-family:helvetica">Special Note on the Dulcimer (15) Instrument</p>';
				   	   	modal_msg  += '<p style="font-size:12pt;line-height:18pt;font-family:helvetica">Selecting the Dulcimer (15) program for either the melody or chords automatically sets all note release times to 4 seconds to allow the notes to ring.</p>';
				   	   	modal_msg  += '<p style="font-size:12pt;line-height:18pt;font-family:helvetica">This can be useful for tunes using solo melody instruments with long release times like Orchestral Harp (46) or Koto (107).</p>';
				       	modal_msg  += '<p style="font-size:12pt;line-height:18pt;font-family:helvetica">For those instruments played solo, set the melody instrument program as desired and the chord instrument program to Dulcimer (15).</p>';
				   	   	modal_msg  += '<p style="font-size:12pt;line-height:18pt;font-family:helvetica">In this case, you may not want to include any chords in the ABC, as they will be played using the Dulcimer (15) instrument.</p>';

				       	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 100, width: 600, scrollWithPage: (AllowDialogsToScroll()) }).then(function(){

						    // Focus after operation
						    FocusAfterOperation();
			       		
				       	});
				}
			}

			// Sanity check the full screen scaling setting
			gFullScreenScaling = args.result.configure_fullscreen_scaling;

			gFullScreenScaling = gFullScreenScaling.replace("%","");
			
			if (isNaN(parseInt(gFullScreenScaling))){
				gFullScreenScaling = 50;
			}

			if (gFullScreenScaling < 25){
				gFullScreenScaling = 25;

			}

			if (gFullScreenScaling > 100){
				gFullScreenScaling = 100;
			}

			// Sanity check the new capo value
			var testCapo = args.result.configure_capo;

			if (!isNaN(parseInt(testCapo))){

				var theCapo = parseInt(testCapo);
				if ((theCapo >= 0) && (theCapo <= 12)){

					gCapo = parseInt(testCapo);

				}
			}

			var testMP3Bitrate = parseInt(args.result.configure_mp3_bitrate);
			
			if (!isNaN(testMP3Bitrate)){

				gMP3Bitrate = testMP3Bitrate;

				if (gMP3Bitrate < 96){
					gMP3Bitrate = 96;
				}

				if (gMP3Bitrate > 384){
					gMP3Bitrate = 384;
				}
			}

			gDefaultSoundFont = args.result.configure_soundfont;

			if (theOldSoundFont != gDefaultSoundFont ){

				// Reset the current soundfont to the selected font
				gTheActiveSoundFont = gDefaultSoundFont

				// Reset the abcjs sounds cache
				gSoundsCacheABCJS = {};

			}

			gAutoscrollPlayer = args.result.configure_autoscrollplayer;

			gAutoSwingHornpipes = args.result.configure_auto_swing_hornpipes;

			// Sanity check the autoswing factor value
			var testSwing = args.result.configure_auto_swing_factor;

			if (!isNaN(parseFloat(testSwing))){

				var theSwing = parseFloat(testSwing);

				if ((theSwing >= -0.9) && (theSwing <= 0.9)){

					gAutoSwingFactor = theSwing;

				}
			}

			gUseCustomGMSounds = args.result.configure_use_custom_gm_sounds;

			// If changing the custom GM sounds setting, clear the abcjs sample cache
			if (gUseCustomGMSounds != theOldUseCustomGMSounds){

				// Reset the abcjs sounds cache
				gSoundsCacheABCJS = {};				
			}

			IdleAllowShowTabNames();

			if (testStaffSpacing != theOldStaffSpacing){

				gStaffSpacing = testStaffSpacing + STAFFSPACEOFFSET;

			}

			// Force change of saved staff spacing if user modifies it in the dialog
			// Related to avoiding resetting of saved staff spacing if changed by a shared file
			if (gLocalStorageAvailable){

				localStorage.abcStaffSpacing = testStaffSpacing;

			}

			// Update local storage
			SaveConfigurationSettings();

			var radiovalue = GetRadioValue("notenodertab");

			// Do we need to re-render?
			if ((testStaffSpacing != theOldStaffSpacing) || (theOldShowTabNames != gShowTabNames) || (gAllowShowTabNames && (gCapo != theOldCapo)) || ((radiovalue == "notenames") && (gUseComhaltasABC != theOldComhaltas))){
				
				RenderAsync(true, null, function(){

				    // Focus after operation
				    FocusAfterOperation();

				});
			}


		}
		else{

		    // Focus after operation
		    FocusAfterOperation();

		}

	});

}

// 
// Is a file XML data
//
function isXML(theText){

   	var xs = theText.slice (0, 100);   // only look at the beginning of the file

    if (xs.indexOf ('<?xml') != -1) { 
    	return true; 
    }

    return false;
}

//
// Inject a Q tag into the ABC
//
function InjectQTag(theTune,theTempo){

	var theLines = theTune.split("\n");

	var nLines = theLines.length;

	// Does the tune already have a Q: tag at the start of a line?
	for (var j=0;j<nLines;++j){

		if (theLines[j].trim().indexOf("Q:") == 0){

			// Yes, nothing to inject
			return theTune;

		}

	}

	// No Q: tag found, find the M: tag, and inject there

	// Find the Meter
	var theMeterLine = "";

	var bFoundMeter = false;

	// Find the first line of the tune that has measure separators
	for (var j=0;j<nLines;++j){

		theMeterLine = theLines[j];

		if (theMeterLine.trim().indexOf("M:") == 0){

			bFoundMeter = true;

			// Put it after the M: tag line if not at the end of the ABC
			if (j<(nLines-1)){

				theMeterLine = theLines[j+1];

			}
			break;
		}

	}

	if (bFoundMeter){

		var meterIndex = theTune.indexOf(theMeterLine);

		var leftSide = theTune.substring(0,meterIndex);
		var rightSide = theTune.substring(meterIndex);

		theTune = leftSide + "Q:" + theTempo + "\n" + rightSide;

	}
	else{

		// Just in case there is no M: tag. Almost certainly never will happen.
		// In this case, put it behind the K: tag
		// If no K: tag, just punt

		// Find the Key
		var theKeyLine = "";

		var bFoundKey = false;

		// Find the first line of the tune that has measure separators
		for (var j=0;j<nLines;++j){

			theKeyLine = theLines[j];

			if (theKeyLine.trim().indexOf("K:") == 0){

				bFoundKey = true;
				break;
			}

		}

		if (bFoundKey){

			var keyIndex = theTune.indexOf(theKeyLine);

			var leftSide = theTune.substring(0,keyIndex);
			var rightSide = theTune.substring(keyIndex);

			theTune = leftSide + "Q:" + theTempo + "\n" + rightSide;

		}

	}

	return theTune;

}


//
// Import MusicXML format
//
function importMusicXML(theXML){

	// Keep track of actions
	sendGoogleAnalytics("action","DoFileRead_XML");
 
    var xmldata = $.parseXML (theXML);    // abc_code is a (unicode) string with one abc tune.

    // var options = { u:0, b:4, n:0,  // unfold repeats (1), bars per line, chars per line
    //                 c:0, v:0, d:0,  // credit text filter level (0-6), no volta on higher voice numbers (1), denominator unit length (L:)
    //                 m:0, x:0, t:0,  // no midi, minimal midi, all midi output (0,1,2), no line breaks (1), perc, tab staff -> voicemap (1)
    //                 v1:0, noped:0,  // all directions to first voice of staff (1), no pedal directions (1)
    //                 stm:0,          // translate stem elements (stem direction)
    //                 p:'', s:0,   // page format: scale (1.0), width, left- and right margin in cm, shift note heads in tablature (1)
    //                 addstavenum:1 };  // Add stave numbers at the end of the staves

    var result = vertaal (xmldata, gMusicXMLImportOptions);

    var abcText = result [0];               // the translation (string)

    // Strip out extra clef indications
    abcText = abcText.replaceAll("[K:treble]","");
    abcText = abcText.replaceAll("[K:alto]","");
    abcText = abcText.replaceAll("[K:alto1]","");
    abcText = abcText.replaceAll("[K:alto2]","");
    abcText = abcText.replaceAll("[K:tenor]","");
    abcText = abcText.replaceAll("[K:bass]","");
    abcText = abcText.replaceAll("[K:bass3]","");

    // Inject Q: tag?
    if (gMusicXMLImportOptions.addq == 1){

    	var theTempoToInject = gMusicXMLImportOptions.q;

    	abcText = InjectQTag(abcText,theTempoToInject);

    }

    return abcText;

}

//
// Common file read routine for Open and Drop
//
function DoFileRead(file,doAppend){

	// Check the filename extension
	if (ensureABCFile(file.name)) {

		var isMXL = (file.name.toLowerCase().indexOf(".mxl") != -1);

		// Clean up the notation while the new file is loading
		if (!doAppend){

			gTheABC.value = "";

			Render(true,null);
		}

		// Show the loading status
		var fileSelected = document.getElementById('abc-selected');
		fileSelected.innerText = "Loading: "+file.name;

		// Save the filename
		gDisplayedName = file.name;

		// If this is a .mxl file, need to unzip first
		if (isMXL){

			var zip = new JSZip();
			
			zip.loadAsync(file)
			.then(function(zip) {

				// Read the META-INF metadata
				var fname = "META-INF/container.xml";

				zip.files[fname].async("string")
                .then(function (theXML) {
                	
                	// Need to parse the container.xml to find the root file
                	var xmldata = $.parseXML(theXML); 

                	var rootfile = xmldata.getElementsByTagName('rootfile')[0];

                	// Get the main MusicXML file name in the zipfile
                	var fname = rootfile.getAttribute("full-path");

					zip.files[fname].async("string")
	                .then(function (theText) {

						// Check for MusicXML format
						if (isXML(theText)){

							theText = importMusicXML(theText);

						}
						else{
							// Center the string in the prompt
							var thePrompt = "This is not a valid MXL file.";
							thePrompt = makeCenteredPromptString(thePrompt);

							DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

			     			return;

						}

						// Handle appending for drag and drop
						if (doAppend){

							var nTunes = CountTunes();
							
							if (nTunes > 0){

								// Do we need to add a new line before the next tune?
								var theLength = gTheABC.value.length;

								if (gTheABC.value.substring(theLength-1) != "\n"){
									gTheABC.value += "\n";
								}

								gTheABC.value += "\n";
							}
							
							gTheABC.value += theText;

							gIsDirty = true;

							CleanSmartQuotes();

						}
						else{

							gTheABC.value = theText;
							
							CleanSmartQuotes();

						}

						// Refocus back on the ABC
						FocusABC();

						setTimeout(function() {

							// Reset the defaults
							RestoreDefaults();

							// Reset the window scroll
							window.scrollTo(
								{
								  top: 0,
								}
							)

							// Mark that this ABC was from a file
							gABCFromFile = true;

							// Only reset the spacing if not appending to a share
							if (!doAppend){

								// Not from share
								gIsFromShare = false;

								// If staff spacing had changed due to a share, restore it
								RestoreSavedStaffSpacing();

								// Clear the dirty flag
								gIsDirty = false;

							}

							// Render the notation
							RenderAsync(true,null,function(){

								if (isDesktopBrowser()){

									// Scroll the last appended tune into view
									if (doAppend){

										var nTunes = CountTunes();

										var theTune = getTuneByIndex(nTunes-1);

										var tuneOffset = gTheABC.value.length-(theTune.length / 2);

										if (!gIsMaximized){

											// Scroll the tune ABC into view
										    gTheABC.selectionEnd = gTheABC.selectionStart = tuneOffset;
									    	gTheABC.blur();
									    	gTheABC.focus();

									    }

										// Scroll the tune into view
										MakeTuneVisible(true);						
									}
								}

								// Recalculate the notation top position
								UpdateNotationTopPosition();

							});

						}, 100);

	                });                

					return;

                }, function() {

					var thePrompt = "This is not a valid MXL file.";
					thePrompt = makeCenteredPromptString(thePrompt);

					DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

					return;

			    });

			    return;

		    }, function() {

				var thePrompt = "This is not a valid MXL file.";
				thePrompt = makeCenteredPromptString(thePrompt);

				DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

				return;

		    });

			return;
		}

		const reader = new FileReader();

		reader.addEventListener('load', (event) => {

			var theText = event.target.result;

			// Check for MusicXML format
			if (isXML(theText)){
				theText = importMusicXML(theText);
			}
			else{

				// Keep track of actions
				sendGoogleAnalytics("action","DoFileRead_ABC");

			}

			// Handle appending for  drag and drop
			if (doAppend){

				var nTunes = CountTunes();
				
				if (nTunes > 0){
					
					// Do we need to add a new line before the next tune?
					var theLength = gTheABC.value.length;

					if (gTheABC.value.substring(theLength-1) != "\n"){

						gTheABC.value += "\n";
					}

					gTheABC.value += "\n";
				}
				
				gTheABC.value += theText;

				gIsDirty = true;

				CleanSmartQuotes();

			}
			else{

				gTheABC.value = theText;

				CleanSmartQuotes();

			}

			// Refocus back on the ABC
			FocusABC();

			setTimeout(function() {

				// Reset the defaults
				RestoreDefaults();

				// Reset the window scroll
				window.scrollTo(
					{
					  top: 0,
					}
				)

				// Mark that this ABC was from a file
				gABCFromFile = true;

				// Don't restore saved staff spacing if appending to a share
				if (!doAppend){

					// Not from share
					gIsFromShare = false;

					// If staff spacing had changed due to a share, restore it
					RestoreSavedStaffSpacing();

					// Clear dirty flag
					gIsDirty = false;

				}

				// Render the notation
				RenderAsync(true,null,function(){

					if (isDesktopBrowser()){
						
						// Scroll the last appended tune into view
						if (doAppend){

							var nTunes = CountTunes();

							var theTune = getTuneByIndex(nTunes-1);

							var tuneOffset = gTheABC.value.length-(theTune.length / 2);

							if (!gIsMaximized){

								// Scroll the tune ABC into view
							    gTheABC.selectionEnd = gTheABC.selectionStart = tuneOffset;
						    	gTheABC.blur();
						    	gTheABC.focus();

						    }

							// Scroll the tune into view
							MakeTuneVisible(true);						
						}
					}

					// Recalculate the notation top position
					UpdateNotationTopPosition();

				});

			}, 100);

		});

		reader.readAsText(file);
	}
}

//
// Toggle the top bar
//
//

function ShowTopBar(){

	var elem = document.getElementById("topbar");

	elem.style.display = "block";
	elem.style.opacity = 1.0;

	gTopBarShowing = true;

	// Move the title down a bit
	var elem = document.getElementById("abc-selected");
	elem.style.marginTop = "15px";
	elem.style.marginBottom = "1px";
		
	elem = document.getElementById("toggletopbar");

	elem.value="▲";

	// Also shows the controls if allowed
	if(gAllowControlToggle){
		ShowAllControls();
	}


}

function HideTopBar(){

	var elem = document.getElementById("topbar");

	elem.style.display = "none";

	gTopBarShowing = false;

	// Move the title up a bit
	var elem = document.getElementById("abc-selected");

	if (gIsIPhone || gIsAndroid){
		elem.style.marginTop = "18px";
		elem.style.marginBottom = "38px";
	}
	else{
		elem.style.marginTop = "4px";
	}

	elem = document.getElementById("toggletopbar");

	elem.value="▼";

	// Also hides the controls
	if(gAllowControlToggle){
		HideAllControls();
	}

}

function ToggleTopBar(){

	if (gTopBarShowing){

		HideTopBar();

	}
	else{

		ShowTopBar();
		
	}

	// Resize the notation spacer
	UpdateNotationTopPosition();

	// Force a rescroll for one column view
	if (gIsOneColumn){

		MakeTuneVisible(true);

	}
	
	// If available, save all the app settings to local storage
	UpdateLocalStorage();

}




//
// Is this the first run?
// 
// Check for local storage use
//
function isFirstRun(){

	// Display mode
	var theTab = localStorage.abcTab;

	if (theTab){

		return false;

	}

	// PDF Tunes/page
	var theTunesPerPage = localStorage.abcTunesPerPage;

	if (theTunesPerPage){

		return false;

	}

	// Page number
	var thePageNumberLocation = localStorage.abcPageNumberLocation;

	if (thePageNumberLocation){

		return false;

	}

	// Page number on first page
	var thePageNumberOnPageOne = localStorage.abcPageNumberOnPageOne;

	if (thePageNumberOnPageOne){

		return false;

	}

	// Staff spacing
	var theStaffSpacing = localStorage.abcStaffSpacing;

	if (theStaffSpacing){

		return false;

	}

	// Top bar
	var theHideTopBar = localStorage.abcHideTopBar;

	if (theHideTopBar){

		return false;
	}


	return true;
}

// 
// Restore the application state from local storage
//
function restoreStateFromLocalStorage(){

	var bIsFirstTime = isFirstRun();

	// Display mode
	var theTab = localStorage.abcTab;

	if (theTab){

		SetRadioValue("notenodertab", theTab);

		if (theTab == "whistle"){

			// If first time using the whistle tab, prep the tin whistle font for embedded SVG styles
			PrepareWhistleFont();
			
		}

		gCurrentTab = theTab;

	}

	// PDF Tunes/page
	var theTunesPerPage = localStorage.abcTunesPerPage;

	if (theTunesPerPage){

		document.getElementById("pdfformat").value = theTunesPerPage;

	}

	// Page number
	var thePageNumberLocation = localStorage.abcPageNumberLocation;

	if (thePageNumberLocation){

		document.getElementById("pagenumbers").value = thePageNumberLocation;

	}

	// Page number on first page
	var thePageNumberOnPageOne = localStorage.abcPageNumberOnPageOne;

	if (thePageNumberOnPageOne){

		document.getElementById("firstpage").value = thePageNumberOnPageOne;

	}

	// Capo
	var theCapo = localStorage.abcCapo;

	if (theCapo){

		gCapo = parseInt(theCapo);

	}

	// Staff spacing
	var theStaffSpacing = localStorage.abcStaffSpacing;

	if (theStaffSpacing){

		gStaffSpacing = STAFFSPACEOFFSET + parseInt(theStaffSpacing);

	}

	// Top bar
	var theHideTopBar = localStorage.abcHideTopBar;

	if (theHideTopBar){

		if (theHideTopBar == "true"){

			HideTopBar();

		}
	}

	// If first time, show a welcome message
	if (bIsFirstTime){

		UpdateLocalStorage();

		showWelcomeScreen();

	}

}

//
// Show the first run welcome screen
//
function showWelcomeScreen(){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","showWelcomeScreen");

    var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica">Welcome to My ABC Transcription Tools!</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica"><strong>Read the <a href="userguide.html" target="_blank" title="ABC Transcription Tools User Guide">User Guide</a> for instructions and demo videos.</strong></p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">To begin, type or paste tunes in ABC format into the text area.</p>'; 
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">Each ABC tune <strong>must</strong> begin with an X: tag.</p>'; 
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">Notation updates instantly as you make changes.</p>'; 
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">Click <strong>Open</strong> to open an ABC or MusicXML file from your system.</p>';
	   if (isDesktopBrowser()){
	   		modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">You may also drag-and-drop a single ABC or MusicXML file on the editor area to add it.</p>';
	   }
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">Click <strong>Add</strong> to add a new ABC tune or tune template.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">Click <strong>Settings</strong> to set common tools settings and select the default instrument sounds and volumes to use when playing tunes.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica"><strong>Once ABC has been entered and notation is displayed:</strong></p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">• Click the <strong>Zoom-Out</strong> arrows at the upper-right to view notation fullscreen.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">• Click <strong>Save</strong> to save all the ABC text to an ABC text file.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">• Click <strong>Export PDF</strong> to export your tunebook in PDF format.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">• Click <strong>Copy All</strong> to copy all the ABC text to the clipboard.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">• Click <strong>Play</strong> to play the tune currently being edited.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">If you find this tool useful, here are my <strong><a href="tipjars.html" target="_blank" title="Buy Michael a beer!">Virtual Tip Jars</a>.</strong></p>';

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 50, scrollWithPage: (AllowDialogsToScroll()) });

}

//
// Show the first run zoom screen
//
function showZoomInstructionsScreen(){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","showZoomInstructionsScreen");

   	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica">Welcome to My ABC Transcription Tools!</p>';
   	   modal_msg  += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">Since this is your first time using the tool, here is some useful information:</p>';
   	   modal_msg  += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">In this view, you may scroll through the tune notation.</p>';
       modal_msg  += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">If you would like to edit or create a PDF tunebook from the notation:</p>';
  	   modal_msg  += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">Click the <strong>Zoom-In</strong> arrows at the upper-right to open the ABC editor.</p>';
   	   modal_msg  += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">In the ABC editor, click the <strong>Zoom-Out</strong> arrows to view notation fullscreen.</p>';
   	   modal_msg  += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">All controls in the ABC editor have helpful tooltips.</p>';
	   modal_msg  += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">Read the <a href="userguide.html" target="_blank" title="ABC Transcription Tools User Guide">User Guide</a> for instructions and demo videos.</p>';

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 50, scrollWithPage: (AllowDialogsToScroll()) });

}

//
// Show the tip jar reminder
//
function TipJarReminderDialog(){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","TipJarReminderDialog");

    var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica">Thank You!</p>';
 	   modal_msg += '<p style="font-size:14pt;line-height:18pt;font-family:helvetica;text-align:center;">I hope my ABC Transcription Tools have been useful to you!</p>';
	   modal_msg += '<p style="font-size:14pt;line-height:18pt;font-family:helvetica;text-align:center;margin-top:36px;">If so, please consider dropping something in one of my </p>';
	   modal_msg += '<p style="font-size:14pt;line-height:18pt;font-family:helvetica;text-align:center;"><strong><a href="tipjars.html" target="_blank" title="My Virtual Tip Jars">Virtual Tip Jars</a>.</strong></p>';
	   modal_msg += '<p style="font-size:14pt;line-height:18pt;font-family:helvetica;text-align:center;margin-top:36px;">Don\'t worry, I won\'t bug you again.</p>';
	   modal_msg += '<p style="font-size:14pt;line-height:18pt;font-family:helvetica;text-align:center;margin-top:36px;">Cheers and thanks!</p>';
	   modal_msg += '<div style="text-align:center"><img style="width:150px;" src="img/michael.jpg"/></div>';
	   modal_msg += '<p style="font-size:14pt;line-height:18pt;font-family:helvetica;text-align:center;">Michael Eskin</p>';


	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 100, scrollWithPage: (AllowDialogsToScroll()) });

}

//
// Drag/drop handler
//
function DoDrop(e){

    e.stopPropagation ();
    e.preventDefault ();

    // Mark as dirty
    gIsDirty = true;

    var drop_files = e.dataTransfer.files;

	let file = drop_files[0];

	DoFileRead(file,true);
}

//
// Hide the Zoom out suggestion banner, save that it was hidden manually
//
function HideZoomBanner(){

	// Hide the banner
	document.getElementById("zoombanner").style.display = "none";

	// Won't show the banner again this session
	gZoomBannerHidden = true;

	// Update the top position of the notation since the banner shifts the UI up
	UpdateNotationTopPosition();

}

//
// Set the margins on window resize
//
function HandleWindowResize(){

	// Only executed on responsive desktop browsers

	if (isDesktopBrowser()){

		if (!gIsMaximized){

			var windowWidth = window.innerWidth;

			// Offset required to avoid left side stack
			if (windowWidth < 1798){

				// One column display

				var marginLeft = (windowWidth - 850)/2;

				var elem = document.getElementById("app-container");
				
				elem.style.marginLeft = marginLeft+"px";

				// Reset the number of rows in the ABC editor
				gTheABC.rows = 12;

				gIsOneColumn = true;

				// If they haven't dismissed the zoom suggestion banner before, show it now
				if (!gZoomBannerHidden){
					document.getElementById("zoombanner").style.display = "block";
				}

				elem = document.getElementById("notation-placeholder-text");
				elem.style.marginTop = "64px";


			}
			else{
				
				// Two column display

				var elem = document.getElementById("app-container");

				var marginLeft = (windowWidth - 1700)/2;
				
				elem.style.marginLeft = marginLeft+"px";

				// We should have more room, resize the editor
				var windowHeight = window.innerHeight;

				// Leave some room for tools
				windowHeight -= 540;

				// About 30 pixels/line
				var nRows = windowHeight/30;

				// Set a minimum
				if (nRows < 12){
					nRows = 12;
				}

				// Resize the text box
				gTheABC.rows = nRows;

				gIsOneColumn = false;

				// Hide the zoom suggestion banne
				document.getElementById("zoombanner").style.display = "none";

				elem = document.getElementById("notation-placeholder-text");
				elem.style.marginTop = "136px";


			}

		}
		else{

			var elem = document.getElementById("app-container");
			
			elem.style.marginLeft = "0px";

		}
	}
}

//
// MIDI data to note mapper
//
function getMIDI_note_name(note){

 // var MIDI_note_map_full = {
 //        "36":"C,,",
 //        "37":"^C,,",
 //        "38":"D,,",
 //        "39":"^D,,",
 //        "40":"E,,",
 //        "41":"F,,",
 //        "42":"^F,,",
 //        "43":"G,,",
 //        "44":"^G,,",
 //        "45":"A,,",
 //        "46":"^A,,",
 //        "47":"B,,",        
 //        "48":"C,",
 //        "49":"^C,",
 //        "50":"D,",
 //        "51":"^D,",
 //        "52":"E,",
 //        "53":"F,",
 //        "54":"^F,",
 //        "55":"G,",
 //        "56":"^G,",
 //        "57":"A,",
 //        "58":"^A,",
 //        "59":"B,",
 //        "60": "C",
 //        "61":"^C",
 //        "62":"D",
 //        "63":"^D",
 //        "64":"E",
 //        "65":"F",
 //        "66":"^F",
 //        "67":"G",
 //        "68":"^G",
 //        "69":"A",
 //        "70":"^A",
 //        "71":"B",
 //        "72":"c",
 //        "73":"^c",
 //        "74":"d",
 //        "75":"^d",
 //        "76":"e",
 //        "77":"f",
 //        "78":"^f",
 //        "79":"g",
 //        "80":"^g",
 //        "81":"a",
 //        "82":"^a",
 //        "83":"b",
 //        "84":"c'",
 //        "85":"^c'",
 //        "86":"d'",
 //        "87":"^d'",
 //        "88":"e'",
 //        "89":"f'",
 //        "90":"^f'",
 //        "91":"g'",
 //        "92":"^g'",
 //        "93":"a'",
 //        "94":"^a'",
 //        "95":"b'",
 //        "96":"c''"
 //    };

	var MIDI_note_map = {
		// Special common ABC macros for WARBL and other controllers
        "36":" ", 	// C,,
        "37":"BACKSPACE", // ^C,,
        "38":"|",   // D,,
        "39":"/", 	// ^D,,
        "40":"2", 	// E,,
        "41":"3", 	// F,,
        "42":"4", 	// ^F,,
        "43":"(3", 	// G,,
        "44":"|:", 	// ^G,,
        "45":":|", 	// A,,
        "46":"||", 	// ^A,,
        "47":"|]",	// B,,
        "48":"C,",
        "49":"C,",
        "50":"D,",
        "51":"D,",
        "52":"E,",
        "53":"F,",
        "54":"F,",
        "55":"G,",
        "56":"G,",
        "57":"A,",
        "58":"A,",
        "59":"B,",
        "60":"C",
        "61":"C",
        "62":"D",
        "63":"D",
        "64":"E",
        "65":"F",
        "66":"F",
        "67":"G",
        "68":"G",
        "69":"A",
        "70":"A",
        "71":"B",
        "72":"c",
        "73":"c",
        "74":"d",
        "75":"d",
        "76":"e",
        "77":"f",
        "78":"f",
        "79":"g",
        "80":"g",
        "81":"a",
        "82":"a",
        "83":"b",
        "84":"c'",
        "85":"c'",
        "86":"d'",
        "87":"d'",
        "88":"e'",
        "89":"f'",
        "90":"f'",
        "91":"g'",
        "92":"g'",
        "93":"a'",
        "94":"a'",
        "95":"b'",
        "96":"c''"
    };

	var result = MIDI_note_map[""+note];

	return result;
}

//
// MIDI input handler
//
var gMIDIAccess = null;

function MIDI_NoteOn(data){
	
	//console.log("MIDI_NoteOn data:"+data);

	var theNoteName = getMIDI_note_name(data);

	if (theNoteName){

		//console.log("getMIDI_note_name: "+theNoteName);

		var theSelectionStart = gTheABC.selectionStart;
		
		var theSelectionEnd = gTheABC.selectionEnd;

		if (theNoteName != "BACKSPACE"){

			// console.log("theSelectionStart before: "+theSelectionStart);
			// console.log("theSelectionEnd before: "+theSelectionEnd);

			var leftSide = gTheABC.value.substring(0,theSelectionStart);
			
			var rightSide = gTheABC.value.substring(theSelectionEnd);

			gTheABC.value = leftSide + theNoteName + rightSide;
			
			// Set dirty
			gIsDirty = true;

			gTheABC.selectionStart = theSelectionStart + theNoteName.length;

			gTheABC.selectionEnd = gTheABC.selectionStart;

			OnABCTextChange();

			// theSelectionStart = gTheABC.selectionStart;
			// theSelectionEnd = gTheABC.selectionEnd;

			// console.log("theSelectionStart after: "+theSelectionStart);
			// console.log("theSelectionEnd after: "+theSelectionEnd);
		}
		else{

			// Delete the last character
			if (theSelectionStart != 0){

				var leftSide = gTheABC.value.substring(0,theSelectionStart-1);
			
				var rightSide = gTheABC.value.substring(theSelectionEnd);

				gTheABC.value = leftSide + rightSide;

				// Set dirty
				gIsDirty = true;

				gTheABC.selectionStart = theSelectionStart - 1;

				gTheABC.selectionEnd = gTheABC.selectionStart;

				OnABCTextChange();
			
			}
		}

	}

}

function MIDI_Receive(event) {
	
	//console.log("MIDI_Receive");

	if (!gAllowMIDIInput){
		return;
	}
		
	var data0 = event.data[0];
	var data1 = event.data[1];
	var data2 = event.data[2];
	
	// console.log("MIDI_Receive");
	// console.log("MIDI_Receive target = "+event.target.name);
	// console.log("MIDI_Receive: "+data0+" "+data1+" "+data2);

	// Mask off the lower nibble (MIDI channel, which we don't care about yet)
	switch (data0 & 0xf0) {

		case 0x90:

			if (data2 != 0){

				MIDI_NoteOn(data1);

			}

			break;
	}

}

function midiOnStateChange(event) {
	
	console.log("midiOnStateChange");

	var inputs = gMIDIAccess.inputs.values();

	for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
		
		//console.log("Adding MIDI input...");

		input.value.onmidimessage = MIDI_Receive;

	}
}

//
// Callback when first requesting WebMIDI support
//
function onMIDIInit(midi) {

	//debugger;

	console.log("onMIDIInit");

	// Save off the MIDI access object
	gMIDIAccess = midi;
	
	// Walk the inputs
	var inputs = gMIDIAccess.inputs.values();

	for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
		
		//console.log("Adding MIDI input...");

		input.value.onmidimessage = MIDI_Receive;

	}

	midi.onstatechange = midiOnStateChange;

}

//
// Callback if MIDI start fails
//
function onMIDIReject(err) {

	//console.log("onMIDIReject");

	sendGoogleAnalytics("action","onMIDIReject");

	var thePrompt = "The MIDI input system failed to start. MIDI input will be disabled.";
	thePrompt = makeCenteredPromptString(thePrompt);

	DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

	// Reset the saved state so the message doesn't come up again on launch
	if (localStorage){

		gAllowMIDIInput = false;
		localStorage.AllowMIDIInput = false;

	}

}

// 
// Does the browser support MIDI access?
//
function browserSupportsMIDI(){
	if (navigator.requestMIDIAccess){
		return true;
	}
	else{
		return false;
	}
}

function initMIDI(){

	if (browserSupportsMIDI()){

		// Don't do this more than once per session
		if (gMIDIAccess == null){

			//console.log("initMIDI");

			// If available in the browser, request MIDI access with sysex support
			if (navigator.requestMIDIAccess)

				navigator.requestMIDIAccess({
					sysex: false
				}).then(onMIDIInit, onMIDIReject);

			else{

				var thePrompt = "This browser does not support MIDI input.";
				thePrompt = makeCenteredPromptString(thePrompt);

				DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

				// Reset the saved state so the message doesn't come up again on launch
				if (localStorage){

					gAllowMIDIInput = false;
					localStorage.AllowMIDIInput = false;

				}

			}
		}

	}

}

//
// Text Area resize observer
// 
// Try to restrict the recalc rate to something reasonable
//
var RESIZETEXTBOX_DEBOUNCEMS = 20;

var gLastResizeTextboxTime = 0;

function ResizeTextBox(){

	if (gIsMaximized){
		return;
	}

	var theTime = Date.now();

	var deltaTime = theTime - gLastResizeTextboxTime;

	if (deltaTime > RESIZETEXTBOX_DEBOUNCEMS) {

		gLastResizeTextboxTime = theTime;
		
		//console.log("ResizeTextBox");

		// console.log("Initial width = "+gInitialTextBoxWidth);
		// console.log("Initial container width = "+gInitialTextBoxContainerWidth);
		// console.log("Initial container left = "+gInitialTextBoxContainerLeft);

		var currentWidth = gTheABC.offsetWidth;

		// console.log("current width = "+gTheABC.offsetWidth);
		// console.log("containerWidth = "+gInitialTextBoxContainerWidth);

		var theOffset = (gInitialTextBoxContainerWidth - gInitialTextBoxWidth)/2;

		// console.log("theOffset = "+theOffset);

		if (currentWidth > gInitialTextBoxContainerWidth){

			// console.log("Setting the marginLeft for stretch");

			var theDelta = ((currentWidth - gInitialTextBoxWidth)/2)-theOffset;

			if (theDelta <= gInitialTextBoxContainerLeft){

				gTheABC.style.marginLeft = -theDelta+"px";

				if (!gIsOneColumn){

					//debugger;

					var theAppContainer = document.getElementById("app-container");

					var theAppContainerMargin = theAppContainer.style.marginLeft;

					if (theAppContainerMargin){

						theAppContainerMargin = theAppContainer.style.marginLeft.replace("px","");

						theAppContainerMarginFloat = parseFloat(theAppContainerMargin);

						if (!isNaN(theAppContainerMarginFloat)){

							// There is some edge delta factor
							theAppContainerMarginFloat -= 48;

							if (theDelta < theAppContainerMarginFloat){

								// Slide the notation to the right but don't allow wrapping
								gTheNotation.style.marginLeft = theDelta+"px";

							}
						}

					}

				}

			}

		}
		else{

			// console.log("Setting the marginLeft to 0px");

			gTheABC.style.marginLeft = "0px";

			// Reset the notation left margin
			gTheNotation.style.marginLeft = theDelta+"px";

		}
	}
}

//
// Allow tall dialogs to scroll on mobile and short screens
//
function AllowDialogsToScroll(){
	
	if (isMobileBrowser()){

		return true;

	}

    // Try to make the app more usable at short window heights
    var windowHeight = window.innerHeight;

    if (windowHeight < 950){

    	return true;

    }
	
	return false;

}

//
// Clean "smart quotes" from the ABC
//
function CleanSmartQuotes(){

	var val = gTheABC.value;

	// Double quotes
	val = val.replaceAll('“','"');
	val = val.replaceAll('”','"');

	// Single quotes
	val = val.replaceAll('‘',"'");
	val = val.replaceAll('’',"'");

	gTheABC.value = val;

}

//
// Fix the iOS 17 URL encoded paste issue
//
function FixIOS17(){

	// Restrict to iOS 17

	var UA = navigator.userAgent;
	
	//alert("navigator.userAgent: "+UA);

	// Checking both Safari as well as Chrome/Firefox user agent strings
	if ((UA.indexOf("Version/17") != -1) || (UA.indexOf("OS 17") != -1) || (UA.indexOf("FxiOS") != -1)){

		//alert("Doing iOS 17 fix");

		var val = gTheABC.value;

		try{
			
			val = decodeURI(val);

			try{

				val = decodeURI(val);

			}
			catch(err){

				//console.log("FixIOS17 catch 2");

			}
		}
		catch(err){

			//console.log("FixIOS17 catch 1");

		}

		val = val.replaceAll("%3A",":")		
		val = val.replaceAll("x:","X:");

		gTheABC.value = val;
		
	}

}

//
// Add tab close listener
//
function theTabCloseListener(e){

	DoSaveLastAutoSnapShot();

	return;

}

function AddTabCloseListener(){

	if (isDesktopBrowser()){

		//console.log("Adding tab close listener")

	    window.addEventListener('beforeunload',theTabCloseListener);

	}
}


//
// File open intercept alert
//
function fileOpenIntercept(e){

	var elem = document.getElementById("selectabcfile");

	if (gIsDirty){

		var thePrompt = '<p style="font-size:18pt;line-height:20pt;text-align:center;">You Have Unsaved Changes</p><p style="font-size:13pt;line-height:16pt;text-align:center;margin-top:30px;">Click "OK" to abandon your work and open a new file.<br/><br/>Click "Cancel" to go back.</p>';

		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);

		DayPilot.Modal.confirm(thePrompt,{ top:200, theme: "modal_flat", scrollWithPage: (AllowDialogsToScroll()) }).then(function(args){

			if (!args.canceled){

				// Click the file open input element
				setTimeout(function(){

					elem.click();

				},100);

			}
		});
	}
	else{

		elem.click();

	}
}

//
// Remove tab close listener
//
function RemoveTabCloseListener(){

	if (isDesktopBrowser()){

		//console.log("Removing tab close listener")

	    window.removeEventListener('beforeunload',theTabCloseListener);
	}
}

//
// Returns true if on desktop, not mobile
//
function isDesktopBrowser(){

	return (!(gIsIOS || gIsAndroid));

}

//
// Returns true if on mobile, not desktop
//
function isMobileBrowser(){

	return (gIsIOS || gIsAndroid);

}

//
// Create a centered prompt string
//
function makeCenteredPromptString(thePrompt){
	return '<p style="font-size:12pt;line-height:18pt;font-family:helvetica;text-align:center">'+thePrompt+'</p>';
}

//
// Send a Google analytics event
//
function sendGoogleAnalytics(theCategory,theAction,theLabel){

	if (typeof gtag !== "undefined"){

		if ((gtag) && (gtag instanceof Function)){

			if (!theLabel){
				theLabel = "none";
			}

			//console.log("Sending gtag abctools event_category: "+theCategory+" event_action: "+theAction+" event_label: "+theLabel);

			gtag('event', 'abc_'+theCategory+"_"+theAction, { event_category: theCategory, event_action: theAction, event_label: theLabel});

		}
	}

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
	} 
	else{
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
function isAndroid(){
	if (/Android/i.test(navigator.userAgent)) {
		return true;
	}
	else{
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

function DoStartup() {

	// Init global state
	gShowAdvancedControls = false;
	gShowShareControls = false;
	gStripAnnotations = false;
	gStripTextAnnotations = false;
	gStripChords = false;
	gStripTab = false;
	gRenderingPDF = false;
	gAllowSave = false;
	gAllowURLSave = false;
	gShowAllControls = false;
	gAllowControlToggle = false
	gAllowFilterAnnotations = false;
	gAllowFilterText = false;
	gAllowFilterChords = false;
	gAllowFilterTab = false;
	gIsMaximized = false;
	gCapo = 0;
	gABCFromFile = false;
	gAllowCopy = false;
	gAllowPDF = false;
	gShowTabNames = true;
	gAllowShowTabNames = false;
	gLastAutoScrolledTune = -1;
	gTopBarShowing = true;
	gCurrentTune = 0;
	gTotalTunes = 0;
	gCurrentTab = "noten";
	gForceFullRender = false;
	gIsOneColumn = true;
	gLocalStorageAvailable = false;
	gPDFQuality = 0.75;
	gIncludePageLinks = true;
	gDoForcePDFFilename = false;
	gForcePDFFilename = "";
	gFullScreenScaling = 50;
	gIsDirty = false;

	// Startup in blank screen
	
	HideMaximizeButton();
	DoMaximize();

	// Get platform info for later UI adaption

	// Are we on Safari?
	gIsSafari = false;
	if (isSafari()){

		gIsSafari = true;

		// Keep track of browser
		sendGoogleAnalytics("browser","Safari");

	}

	// Are we on Chrome?
	gIsChrome = false;

	if (!gIsSafari){
		if (isChrome()){

			gIsChrome = true;

			// Keep track of browser
			sendGoogleAnalytics("browser","Chrome");
		}
	}

	// Are we on iOS?
	gIsIOS = false;
	if (isIOS()) {

		gIsIOS = true;

		// Keep track of platform
		sendGoogleAnalytics("platform","iOS");
	}
	
	// Are we on an iPad?
	gIsIPad = false;
	if (isIPad()) {

		gIsIPad = true;

		// Keep track of platform
		sendGoogleAnalytics("platform","iPad");
	}

	// Are we on an iPhone?
	gIsIPhone = false;
	if (isIPhone()) {

		gIsIPhone = true;

		// Keep track of platform
		sendGoogleAnalytics("platform","iPhone");
	}

	// Are we on Android?
	gIsAndroid = false;

	if (isAndroid()){

		gIsAndroid = true;

		// Keep track of platform
		sendGoogleAnalytics("platform","Android");
	}

	if (gIsIOS){
		document.getElementById("selectabcfile").removeAttribute("accept");
	}	

	//
	// iOS and Android styling adaptation
	//
	// Single column stacked blocks
	//
	if (isMobileBrowser()) {

		// Fix the title font
		var elem = document.getElementById("toolpagetitle");
		elem.size = 4;
		elem.style.fontFamily = "Helvetica";

		// Add little extra room at the top
		elem = document.getElementById("notenlinks");
		elem.style.paddingTop = "20px";
		
		elem = gTheABC;

		if ((gIsIPhone) || (gIsAndroid)){

			if (gIsIPhone){
				elem.cols = 60;
			}
			else{
				elem.cols = 58;				
			}

			elem.style.fontSize = "16pt";
			elem.style.lineHeight = "18pt";

			// Reset the viewport to avoid scaling
			var viewport = document.querySelector("meta[name=viewport]");
			viewport.setAttribute("content","width=860,maximum-scale=1.0,user-scalable=0");
			
		}
		else{

			// iPad
			elem.cols = 73;
			elem.style.fontSize = "13pt";
			elem.style.lineHeight = "15pt";


		}

		// Resize the app-container
		elem = document.getElementById("app-container");
		elem.style.width = "860px";
		elem.style.display = "block";
		elem.style.marginLeft = "0px";

		// Resize the notation placeholder
		elem = document.getElementById("notation-placeholder");
		elem.style.width = "860px";
		elem.style.display = "none";

		// Resize the UI div
		elem = document.getElementById("noscroller");
		elem.style.width = "860px";
		elem.style.display = "none"; // Hidden at startup

		// Resize the notation div
		elem = gTheNotation;
		elem.style.width = "820px";
		elem.style.display = "block";
		elem.style.marginLeft = "20px";
		elem.style.marginRight = "0px";
		elem.style.overflow = "hidden";

		// Resize the notation spacer
		elem = document.getElementById("notation-spacer");
		elem.style.width = "860px";
		elem.style.display = "block";
		elem.style.marginRight = "0px";

		// Resize the UI overlay
		elem = document.getElementById("uioverlay");
		elem.style.width = "860px";
		elem.style.display = "block";

		// Move the spinner
		elem = document.getElementById("loading-bar-spinner");
		elem.style.top = "36px"
		elem.style.left = "36px";	
		elem.style.marginLeft = "-16px";	
		elem.style.marginTop = "-16px";	

		elem = document.getElementById("spinner-icon");
		elem.style.width = "32px"
		elem.style.height = "32px";	

	}

	// On iPhone and Android, move the zoom button over a bit
	if (gIsIPhone || gIsAndroid){

		document.getElementById("zoombutton").style.right = "36px";
	}

	// On iPad, resize the zoom button
	if (gIsIPad){

		document.getElementById("zoombutton").style.width = "36px";
		document.getElementById("zoombutton").style.height = "36px";
		document.getElementById("zoombutton").style.top = "8px";
		document.getElementById("zoombutton").style.right = "8px"

	}

	//
	// Hook up the text area text change callback with debounce
	// 
	// If a paste was detected, force a full render because the tunes may have changed while
	// the tune count has not
	//
	document.getElementById('abc').oninput = 
		debounce( () => {

			// Set dirty
			gIsDirty = true;
		
			if (!gForceFullRender){

		    	OnABCTextChange();

		    }
		    else{

		    	RenderAsync(true,null);

		    }

		    gForceFullRender = false;

		}, DEBOUNCEMS);


	//
	// Clean "smart quotes" on paste
	//
	document.getElementById('abc').onpaste = 

		function(){

			setTimeout(function(){

				CleanSmartQuotes();

				// Set dirty
				gIsDirty = true;

				if (gIsIOS){

					// iOS 17 messed up copy and paste 
					// appears to be double URL encoded
					FixIOS17();

				}

			},0);
		};

	//
	// Hook up the text area text change callback with debounce
	// Doesn't work well on iOS or Android, so disabling it there 
	//

	document.getElementById('abc').onclick = 
		debounce( () => {

		    MakeTuneVisible(false);

		}, AUTOSCROLLDEBOUNCEMS);

	//
	// Setup the file import control
	//
	document.getElementById("selectabcfile").onchange = () => {

		let fileElement = document.getElementById("selectabcfile");

		// check if user had selected a file
		if (fileElement.files.length === 0) {

			var thePrompt = "Please select an ABC or MusicXML file";

			// Center the string in the prompt
			thePrompt = makeCenteredPromptString(thePrompt);

			DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

			return;

		}

		let file = fileElement.files[0];

		// Read the file
		DoFileRead(file, false);

	}


	// Set the initial tab to notation
	//document.getElementById("b1").checked = true;
	SetRadioValue("notenodertab", "noten");

	// Reset the paging control
	document.getElementById("pdfformat").value = "one";

	// Reset the page number control
	document.getElementById("pagenumbers").value = "none";

	// Reset the first page page number control
	document.getElementById("firstpage").value = "yes";

	// Hook up the zoom button
	document.getElementById("zoombutton").onclick = 
		function() {
			ToggleMaximize();
		};
	
	gStaffSpacing = STAFFSPACEOFFSET + STAFFSPACEDEFAULT;

	// Clear the text entry area, but don't render
	ClearNoRender();

	// Init the Anglo Concertina button naming matrix
	resetAngloButtonNames();

	// Init the MusicXML import options
	resetMusicXMLImportOptions();

	// Is local storage available
	if (window.localStorage) {

		gLocalStorageAvailable = true;

		// Load the initial configuration settings from local storage
		GetInitialConfigurationSettings();

	}

	//
    // If enabled install the tab close listener to save the last editor state
    //
    // Only allowed on desktop systems
    //
	if (isDesktopBrowser()){

		// Keep track of platform
		sendGoogleAnalytics("platform","Desktop");

	    if (gSaveLastAutoSnapShot){

	    	AddTabCloseListener();
	    
	    }
	    
	}

	// Save if we need to force a text box recalc after minimize
	gForceInitialTextBoxRecalc = false;

	// Check for and process URL share link
	var isFromShare = processShareLink();

	// Save global is from share
	gIsFromShare = isFromShare;

	gForceInitialTextBoxRecalc = isFromShare;

	// Not from a share, show the UI
	if (!isFromShare){

		DoMinimize();

		// Show the notation placeholder
		document.getElementById("notation-placeholder").style.display = "block";

		// Update the application state from local storage if available
		restoreStateFromLocalStorage();

		// Keep track of raw editor runs
		sendGoogleAnalytics("start","no_share");

	}
	else{

		// First time using the tool?
		if (isFirstRun()){

			// Show zoom instructions screen
			showZoomInstructionsScreen();

		}

		// Save the state in the share link to local storage
		UpdateLocalStorage();

		// Keep track of raw editor runs
		sendGoogleAnalytics("start","from_share");

	}

	// Recalculate the notation top position
	UpdateNotationTopPosition();

	// Force recalculation of the notation top position on ABC text area resize

	new ResizeObserver(TextBoxResizeHandler).observe(gTheABC);

	if (isDesktopBrowser()){

		// Setup text box symmetrical resize 
		gInitialTextBoxWidth = gTheABC.offsetWidth;

		var elem = document.getElementById("notenlinks");
		gInitialTextBoxContainerWidth = elem.offsetWidth;

		elem = document.getElementById("noscroller");
		gInitialTextBoxContainerLeft = elem.offsetLeft;

		// console.log("ResizeObserver setup:");
		// console.log("Initial width = "+gInitialTextBoxWidth);
		// console.log("Initial container width = "+gInitialTextBoxContainerWidth);
		// console.log("Initial container left = "+gInitialTextBoxContainerLeft);

		new ResizeObserver(ResizeTextBox).observe(gTheABC);

		// Hook window resize events
		window.onresize = function(){

			HandleWindowResize();

			if (!gIsMaximized){

				// Reset text box symmetrical resize 
				gTheABC.style.marginLeft = 0+"px";
				gTheABC.style.width = gInitialTextBoxWidth+"px";

				var elem = document.getElementById("notenlinks");
				gInitialTextBoxContainerWidth = elem.offsetWidth;

				elem = document.getElementById("noscroller");
				gInitialTextBoxContainerLeft = elem.offsetLeft;

				gTheNotation.style.marginLeft = "auto";

				// console.log("On window resize:");
				// console.log("Initial container width = "+gInitialTextBoxContainerWidth);
				// console.log("Initial container left = "+gInitialTextBoxContainerLeft);

				ResizeTextBox();

				gGotWindowResizeWhileMaximized = false;

			}
			else{

				gGotWindowResizeWhileMaximized = true;

			}
		
		}

	}

	// And call it once for the initial setup
	HandleWindowResize();

	// 
	// Initially show the controls as soon as some ABC is entered
	//
	ShowAllControls();


	if (!isFromShare){
		document.getElementById("notenrechts").style.display = "none";
		gAllowControlToggle = false;
	}

	//
	// Add drag-and-drop handlers on desktop browsers 
	//
	if (isDesktopBrowser()){

    	$.event.props.push ("dataTransfer");      // make jQuery copy the dataTransfer attribute

		$('#abc').on ('drop', function(e){
			
			// Remove the drag drop highlighting
			$(this).toggleClass('indrag', false);

			DoDrop(e);
		});
		
		$('#abc').on ('dragover', function (e) {    // this handler makes the element accept drops and generate drop-events
	        e.stopPropagation ();
	        e.preventDefault ();                    // the preventDefault is obligatory for drag/drop!
	        e.dataTransfer.dropEffect = 'copy';     // Explicitly show this is a copy.
	    });

	    $('#abc').on ('dragenter dragleave', function () {
	        $(this).toggleClass ('indrag');
	    });

	}
	else{
		
		// Use the original placeholder on iOS and Android
		gTheABC.placeholder = "Enter the ABC for your tunes here";

		if (gIsAndroid || gIsIPhone){

			// Defaulting to large player controls
			gLargePlayerControls = true;


		}

		// Hide the desktop zoom message
		document.getElementById("desktop_use_message").style.display = "none";

	}

	// Don't count share URL consumption as a tip jar event
	if (!isFromShare){

		gTipJarCount++;

		if (gLocalStorageAvailable){
			localStorage.TipJarCount = gTipJarCount;
		}

	}

	// Occasional reminder
	if (gTipJarCount == 25){

		TipJarReminderDialog();

	}

	// Setup MIDI inputs
	if (gAllowMIDIInput){

		initMIDI();
	}

	// And set the focus
    gTheABC.focus();

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



