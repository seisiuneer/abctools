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

// First render detect for show controls notation area reposition
var gIsFirstRender = true;

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

// Are we in single or dual column display mode?
var gIsOneColumn = true;

// For handling clicks in notation when maximized
var	gGotRenderDivClick = false;
var gRenderDivClickOffset = -1;

// For local storage of settings
var gLocalStorageAvailable = false;

// PDF oversampling for PDF rendering
var gPDFQuality = 0.75;

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
var gPlaybackHyperlinkMelodyProgram = "";
var gPlaybackHyperlinkBassChordProgram = "";

// Append incrementing X values to tune names 
var gAppendXValuesToTuneNames = false;

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

// Use the custom GM sounds for dulcimer, accordion, flute, and whistle
var gUseCustomGMSounds = true;

// Global reference to the ABC editor
var gTheABC = document.getElementById("abc");

//
// Tune utility functions
// 

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

    for (i=1;i<nTunes;++i){

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

    for (i=1;i<nTunes;++i){

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

	for (i = 0; i < theLines.length; ++i) {
		
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

    // Fixes odd button event behavior after transpose on iOS
    if (gIsIOS || gIsAndroid){
    	gTheABC.blur()
    }
    else{
    	// And set the focus
    	gTheABC.focus();
    }

}

//
// General purpose tranposer for the currently selected tunes
//
function Transpose(transposeAmount) {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

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

					DayPilot.Modal.alert("Unable to tranpose one or more tunes.",{ theme: "modal_flat", top: 50, scrollWithPage: (gIsIOS || gIsAndroid) });
					
					output += theTunes[i];

				}
			}
			else{

				output += theTunes[i];
			}

		}
	
		// Stuff in the transposed output
		gTheABC.value = output;

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

	//console.log("Tunes processed: "+nProcessed);

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

	// Reset the selection
	gTheABC.selectionStart = 0;
    gTheABC.selectionEnd = 0;

    // And set the focus
    gTheABC.focus();

}

//
// UI SortABC command
//
function SortABC(e) {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	var stripAn = false;

	if (e.shiftKey){
		stripAn = true;
	}


	// Give some feedback
	document.getElementById("sortbutton").value = "  Sorting  ";

	setTimeout(function(){

		// Sort the tunes
		SortTunes(stripAn);

		document.getElementById("sortbutton").value = "Rendering";

		// Redraw
		RenderAsync(true,null,function(){

			document.getElementById("sortbutton").value = "  Sorted!  ";
		
			setTimeout(function(){

				document.getElementById("sortbutton").value = "Sort ABC";

			},1500);

		});

	},750);

}

//
// UI Clear command
//
function Clear() {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	DayPilot.Modal.confirm("Are you sure you want to erase all the ABC and start over?",{ top:100, theme: "modal_flat", scrollWithPage: (gIsIOS || gIsAndroid) }).then(function(args){

		if (!args.canceled){

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
// PDF conversion shared globals
//

// Rendering offsets based on paper size
var PAGENUMBERTOP = 296;
var PAGENUMBERTOPA4 = 313;
var PAGETOPOFFSET = 32;
var PAGEBOTTOMOFFSET = 32; 
var PAGELEFTOFFSET = 37;
var PAGELEFTOFFSETA4 = 29;
var PAGEHEIGHTLETTER = 792;
var PAGEHEIGHTA4 = 842;
var BETWEENTUNESPACE = 20;
var gBetweenTuneSpace = 20;  // Can be overriden with a %pdf_between_tune_space directive

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

		for (j = 0; j < Reihe.length; ++j) {

			Reihe[j] = unescape(Reihe[j]); /* Macht die Steuerzeichen wieder weg */

			var Aktuellereihe = Reihe[j].split(""); /* nochmal bei C. Walshaw crosschecken, ob alle mögl. ausser K: erfasst. */

			if (Aktuellereihe[0] == "T" && Aktuellereihe[1] == ":") {

				titel = Reihe[j].slice(2);

				titel = titel.trim();

				if (gAppendXValuesToTuneNames){
					titel = (i+1) +" - "+titel;
				}

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
		thePDF.setFont("Times","","normal");
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
		thePDF.setFont("Times","","normal");
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
	thePDF.setFont("Times","","normal");
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
		  
		  // Sort criteria is different for appended X tune numbers
		  if (gAppendXValuesToTuneNames){

		  	 nameA = nameA.substring(nameA.indexOf("-")+2);
		  	 nameB = nameB.substring(nameB.indexOf("-")+2);

		  }
		  
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

	for (i=0;i<totalTunes;++i){

		thisTitle = theIncipits[i].title;

		theTextIncipit = theIncipits[i].incipit;

		tunePageMap.push(theCurrentPageNumber);

		thePDF.text(thisTitle, TEXTINCIPITLEFTMARGIN, curTop, {align:"left"});

		thePDF.text(theTextIncipit, thePaperWidth-TEXTINCIPITRIGHTMARGIN, curTop, {align:"left"});

		curTop += TEXTINCIPITLINESPACING;

		if (i != (totalTunes - 1)){

			if (curTop > pageSizeWithMargins){


				// Bump the page count
				theCurrentPageNumber++;

				// Add a new page
				thePDF.addPage(paperStyle); 

				// Set the font size
				thePDF.setFont("Times","","normal");
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
	thePDF.setFont("Times","","normal");
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
	thePDF.setFont("Times","","normal");
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

		  // Sort criteria is different for appended X tune numbers
		  if (gAppendXValuesToTuneNames){

		  	 nameA = nameA.substring(nameA.indexOf("-")+2);
		  	 nameB = nameB.substring(nameB.indexOf("-")+2);

		  }
		  
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

	// Add the tunes by name and page number
	for (i=0;i<totalTunes;++i){

		thePageNumber = localPageMap[i];

		var theFinalPageNumber = thePageNumber;

		// Add title page and TOC page count offset to page links
		if (doPageLinks){
			theFinalPageNumber += pageDelta;
		}

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
				thePDF.setFont("Times","","normal");
				thePDF.setFontSize(INDEXFONTSIZE);

				// Start back at the top
				curTop = INDEXTOPOFFSET + INDEXTITLEOFFSET + a4offset;

			}
		}
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
function GetAllTuneHyperlinks(theLinks) {

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

		// Clear the tunebook toc string
		var theHyperlink = "";

		// Add a playback hyperlink?
		if (gAddPlaybackHyperlinks){

			var tuneWithPatch = thisTune;
				
			// Strip out the X: tag
			var searchRegExp = /^X:.*[\r\n]*/gm 

			// Strip out tempo markings
			tuneWithPatch = tuneWithPatch.replace(searchRegExp, "");

			tuneWithPatch = "X:1\n%%MIDI program "+gPlaybackHyperlinkMelodyProgram+"\n"+"%%MIDI chordprog "+gPlaybackHyperlinkBassChordProgram+"\n"+tuneWithPatch;

			// Create a share URL for this tune
			var theURL = FillUrlBoxWithAbcInLZW(tuneWithPatch,false);

			// Add the play parameter
			theURL += "&play=1"

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

			// If adding complete tunebook patches, they take precedence over the defaults
			if (gAddPlaybackHyperlinks){

				theMelodyPatch = gPlaybackHyperlinkMelodyProgram;
				theBassChordPatch = gPlaybackHyperlinkBassChordProgram;

			}

			if (thePatches && (thePatches.length > 0)){

				if (thePatches.length >= 1){
					theMelodyPatch = thePatches[0];
					theMelodyPatch = theMelodyPatch.trim();
				}

				if (thePatches.length > 1){
					theBassChordPatch = thePatches[1];
					theBassChordPatch = theBassChordPatch.trim();
				}


			}
				
			// Strip out the X: tag
			var searchRegExp = /^X:.*[\r\n]*/gm 

			// Strip out tempo markings
			tuneWithPatch = tuneWithPatch.replace(searchRegExp, "");

			tuneWithPatch = "X:1\n%%MIDI program "+theMelodyPatch+"\n"+"%%MIDI chordprog "+theBassChordPatch+"\n"+tuneWithPatch;

			// Create a share URL for this tune
			var theURL = FillUrlBoxWithAbcInLZW(tuneWithPatch,false);

			// Add the play parameter
			theURL += "&play=1"

			theLinks[i].url = theURL;

		}

		// Search for a general purpose hyperlink request
		searchRegExp = /^%hyperlink.*$/m

		// Detect tunebook TOC annotation
		var addTunebookHyperlink = thisTune.match(searchRegExp);

		if ((addTunebookHyperlink) && (addTunebookHyperlink.length > 0)){

			theHyperlink = addTunebookHyperlink[0].replace("%hyperlink","");
			
			theHyperlink = theHyperlink.trim();

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

	thePDF.setFont("Times","","normal");
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
	thePDF.setFont("Times","","normal");
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
	thePDF.setFont("Times","","normal");
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

		  // Sort criteria is different for appended X tune numbers
		  if (gAppendXValuesToTuneNames){

		  	 nameA = nameA.substring(nameA.indexOf("-")+2);
		  	 nameB = nameB.substring(nameB.indexOf("-")+2);

		  }
		  
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

	// Add the tunes by name and page number
	for (i=0;i<totalTunes;++i){

		thePageNumber = localPageMap[i];

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

		if (i != (totalTunes - 1)){

			if (curTop > pageSizeWithMargins){

				TOCpage++;

				// Add a new page
				thePDF.setPage(TOCpage); 

				if (TunebookTOCHeaderRequested){

					AddPageTextHeader(thePDF,paperStyle,theTunebookTOCHeader);
					
				}

				// Set the font size
				thePDF.setFont("Times","","normal");
				thePDF.setFontSize(TOCFONTSIZE);

				// Start back at the top
				curTop = TOCTOPOFFSET + TOCTITLEOFFSET + a4offset;


			}
		}
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
		  
		  // Sort criteria is different for appended X tune numbers
		  if (gAppendXValuesToTuneNames){

		  	 nameA = nameA.substring(nameA.indexOf("-")+2);
		  	 nameB = nameB.substring(nameB.indexOf("-")+2);

		  }
		  
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

	// Add the tunes by name and page number
	for (i=0;i<totalTunes;++i){

		curTop += TOCLINESPACING;

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
			thePDF.setFont("Times","","normal");
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
			scale_factor = 2.0;
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
	var pageSizeWithMargins = pageHeight  - (PAGETOPOFFSET + PAGEBOTTOMOFFSET);

	var spaceAvailable = pageSizeWithMargins;

	var thisTuneHeight;

	var firstTuneOnPage = true;

	var column_number = 0;

	for (i=0;i<nTunes;++i){

		// If there is already a forced pagebreak on the tune, we can skip the space calculation
		if (!pageBreakList[i]){

			// The PDF generator adds one extra line per block it renders
			var thisTuneHeight = renderingDivs[i].height + (renderingDivs[i].staffHeights.length / scale_factor);

			// Does this tune fit on the page?
			if (thisTuneHeight > spaceAvailable){

				if (!doIncipits){

					// Put in a page break (not on the first tune)
					if (i != 0){

						pageBreakList[i-1] = true;

					}

				}
				else{
						
					// Put in a page break (not on the first tune)
					if (i != 0){

						pageBreakList[i-1] = true;

					}

				}

				// Reset the page offset
				spaceAvailable = pageSizeWithMargins;

				// Is this a tune moved to a new page that takes up more than one page
				if (thisTuneHeight  > pageSizeWithMargins){ 

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
					spaceAvailable = pageSizeWithMargins;

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

	}

	// First, do no harm... 
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

	// Include playback links for every tune
	gAddPlaybackHyperlinks = false;

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

		if (thePatches && (thePatches.length > 0)){

			if (thePatches.length >= 1){
				gPlaybackHyperlinkMelodyProgram = thePatches[0];
				gPlaybackHyperlinkMelodyProgram = gPlaybackHyperlinkMelodyProgram.trim();
			}

			if (thePatches.length > 1){
				gPlaybackHyperlinkBassChordProgram = thePatches[1];
				gPlaybackHyperlinkBassChordProgram = gPlaybackHyperlinkBassChordProgram.trim();
			}	

		}
	}

	// Should we append the X: tag values to the tune names when generating PDF tunebook
	gAppendXValuesToTuneNames = false;
	
	searchRegExp = /^%append_x_values_to_names.*$/m

	// Detect x values annotation
	var addXValues = theNotes.match(searchRegExp);

	if ((addXValues) && (addXValues.length > 0)){

		gAppendXValuesToTuneNames = true;

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
	var betweenTuneSpace = theNotes.match(searchRegExp);

	if ((betweenTuneSpace) && (betweenTuneSpace.length > 0)){

		var betweenTuneSpace = betweenTuneSpace[0].replace("%pdf_between_tune_space","");

		betweenTuneSpace = betweenTuneSpace.trim();
		
		var betweenTuneSpaceInt = parseInt(betweenTuneSpace);
		
		if ((!isNaN(betweenTuneSpaceInt)) && (betweenTuneSpaceInt >= 0)){

			gBetweenTuneSpace = betweenTuneSpaceInt;

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
	// console.log("gAppendXValuesToTuneNames = "+gAppendXValuesToTuneNames);

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

	thePDF.setFont("Times","","normal");
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

	thePDF.setFont("Times","","normal");
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

		scale_factor = 2;

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

								if (column_number == 0){

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

	DayPilot.Modal.prompt("Please enter a filename for your PDF file:", placeholder+".pdf",{ theme: "modal_flat", top: 194, autoFocus: false, scrollWithPage: (gIsIOS || gIsAndroid) }).then(function(args) {

		var fname = args.result;

		// If the user pressed Cancel, exit
		if (fname != null){

			// Strip out any naughty HTML tag characters
			fname = fname.replace(/[^a-zA-Z0-9_\-. ]+/ig, '');

			if (fname.length != 0){
				// Give it a good extension
				if ((!gIsAndroid) && (!gIsIOS)){

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
			else{

				// Clean any globals set during the annotation scan
				gAppendXValuesToTuneNames = false;

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

	document.getElementById("statuspdfname").innerHTML = "Generating <font color=\"red\">" + title + "</font>";

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

			document.getElementById("statuspdfname").innerHTML = "<font color=\"red\">Rendering Complete!</font>";

				setTimeout(function(){

				document.getElementById("statuspdfname").innerHTML = "Saving <font color=\"red\">" + title + "</font>";

				// Save the status up for a bit before saving
				setTimeout(function(){

					// Start the PDF save
					// On mobile, have to use a different save strategy otherwise the PDF loads in the same tab
					if (gIsAndroid || gIsIOS){

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

					// Clean up any global state from the annotation parse
					gAppendXValuesToTuneNames = false;

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

		// Reduce the space between tunes in the PDF for incipits
		BETWEENTUNESPACE = 0;

		// Force an idle on the advanced controls to determine if we need to hide the annotations or text annotations before incipit render
		IdleAdvancedControls(false);

		// Are we showing tablature?
		IdleAllowShowTabNames();

		// Is annotation suppressed allowed, but not enabled, or is text annotation suppression allowed but not enabled, do a render
		// If tabnames are being shown, hide them
		if ((gAllowFilterAnnotations && (!gStripAnnotations)) || (gAllowFilterText && (!gStripTextAnnotations)) || (gAllowShowTabNames && (gShowTabNames))){

			document.getElementById("statuspdfname").innerHTML = "Generating <font color=\"red\">" + title + "</font>";

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
	else
	// Auto-inserting X: numbers on titles for non-incipit render?
	if (gAppendXValuesToTuneNames){

		document.getElementById("statuspdfname").innerHTML = "Generating <font color=\"red\">" + title + "</font>";

		document.getElementById("statustunecount").innerHTML = "Processing tune numbering for PDF generation";

		document.getElementById("pagestatustext").innerHTML = "&nbsp;";

		setTimeout(function(){

			var theNotes = gTheABC.value;

			theNotes = processXTuneNameValues(theNotes);

			var radiovalue = GetRadioValue("notenodertab");

			// Render the notes
			RenderTheNotes(theNotes,radiovalue,true,0);

			// Going to need to clean up later
			requirePostRender = true;

			doPDFStepTwo();

		},100);

	}
	else{

		doPDFStepTwo();

	}

	function doPDFStepTwo(){

		running_height = PAGETOPOFFSET;

		qualitaet = 1200; 

		document.getElementById("statuspdfname").innerHTML = "Generating <font color=\"red\">" + title + "</font>";

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
						
						gAppendXValuesToTuneNames = false;

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

						document.getElementById("statuspdfname").innerHTML = "<font color=\"red\">Rendering Complete!</font>";

						setTimeout(function(){



								if (title){

									document.getElementById("statuspdfname").innerHTML = "Saving <font color=\"red\">" + title + "</font>";

								}

								// Save the status up for a bit before saving
								setTimeout(function(){

									// Start the PDF save
									// On mobile, have to use a different save strategy otherwise the PDF loads in the same tab
									if (gIsAndroid || gIsIOS){

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

											// Clean up any global state from the annotation parse
											gAppendXValuesToTuneNames = false;


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
		commonFontFormat.tabnumberfont = "Arial 12";
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

		var ssp = gStaffSpacing - STAFFSPACEOFFSET;
		localStorage.abcStaffSpacing = ssp;

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

}

// 
// Strip all the chords in the ABC
//
function StripChordsOne(theNotes){

	// Strip out chord markings
	var searchRegExp = /"[^"]*"/gm

	// Strip out chord markings
	theNotes = theNotes.replace(searchRegExp, "");

	// Replace the ABC
	return theNotes;

}

//
// Append an incrementing value to the tune names 
//
function processXTuneNameValues(theNotes){

	var outTunes = "";

	var theTunes = theNotes.split(/^X:.*$/gm);

	var nTunes = theTunes.length - 1;

    // Now find all the X: items
    var theTunes = theNotes.split(/^X:/gm);

    var processedTune = "";
    var thisTune = "";

    for (var i=0;i<nTunes;++i){

    	thisTune = theTunes[i+1]

		thisTune = thisTune.replace("T:","T:"+(i+1)+". ");

    	processedTune = "X:"+thisTune;
    	
    	outTunes = outTunes + processedTune;

    }

    return outTunes;
	
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

		if (!(gIsIOS || gIsAndroid)){
			// Show the notation block
			if (gIsMaximized)
				document.getElementById("notation-holder").style.display = "flex";
			else
				document.getElementById("notation-holder").style.display = "inline";
		}
		else{
			// Show the notation block
			if (gIsMaximized)
				document.getElementById("notation-holder").style.display = "flex";
			else
				document.getElementById("notation-holder").style.display = "block";

		}

		// Show the zoom control
		document.getElementById("zoombutton").style.display = "block";

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
		document.getElementById("toggleallcontrols").classList.remove("toggleallcontrolsdisabled");
		document.getElementById("toggleallcontrols").classList.add("toggleallcontrols");
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
			searchRegExp = /"[^"]*"/gm

			// Strip out chord markings
			theNotes = theNotes.replace(searchRegExp, "");
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

		// Auto-inserting X: numbers on titles?
		if (gAppendXValuesToTuneNames){

			theNotes = processXTuneNameValues(theNotes);

		}

		// Render the notes
		RenderTheNotes(theNotes,radiovalue,renderAll,tuneNumber);

		// Maintain scroll position after render
		window.scrollTo(0, scrollTop);

	} else {

		// Hide all the buttons and notation
		document.getElementById("notenrechts").style.display = "none";
		document.getElementById("notation-holder").style.display = "none";

		// Disable the save button
		document.getElementById("saveabcfile").classList.remove("saveabcfile");
		document.getElementById("saveabcfile").classList.add("saveabcfiledisabled");
		gAllowSave = false;

		// Disable the generate PDF button
		document.getElementById("saveaspdf").classList.remove("saveaspdf");
		document.getElementById("saveaspdf").classList.add("saveaspdfdisabled");
		gAllowPDF = false;

		// Disable the control display toggle
		document.getElementById("toggleallcontrols").classList.remove("toggleallcontrols");
		document.getElementById("toggleallcontrols").classList.add("toggleallcontrolsdisabled");
		gAllowControlToggle = false;

		// Disable the copy button
		document.getElementById("copybutton").classList.remove("copybutton");
		document.getElementById("copybutton").classList.add("copybuttondisabled");

		// Disable the play button
		document.getElementById("playbutton").classList.remove("playbutton");
		document.getElementById("playbutton").classList.add("playbuttondisabled");

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
		DayPilot.Modal.alert("Sorry, only .abc, .txt, .xml, .musicxml, or .mxl files are supported.",{ theme: "modal_flat", top: 50, scrollWithPage: (gIsIOS || gIsAndroid) });
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

	// Detect chord markings
	gotMatch = theNotes.search(searchRegExp) != -1;

	EnableChords = gotMatch;

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

			document.getElementById("togglechords").value = "Show Chords + Injected Tab";

		}
		else{

			document.getElementById("togglechords").value = "Hide Chords + Injected Tab";

		}

	}

}


//
// Handle the spacing control
//
function SetStaffSpacing(newSpacing) {
	
	gStaffSpacing = newSpacing + STAFFSPACEOFFSET;

	RenderAsync(true, null, function(){;

	});

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
	gTotalTunes = 0;
	gCurrentTune = 0;
	gForceFullRender = false;

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

			DayPilot.Modal.alert("Please select an ABC or MusicXML file",{ theme: "modal_flat", top: 50, scrollWithPage: (gIsIOS || gIsAndroid) });

			return;

		}

		let file = fileElement.files[0];

		// Read the file and append it to the editor
		DoFileRead(file, true);

		// Reset file selectors
		fileElement.value = "";

	}

}

function AddABC(){

	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:50px;">Add ABC Tunes&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="http://michaeleskin.com/abctools/userguide.html#add_templates_dialog" target="_blank" style="text-decoration:none;">💡</a></span></p>';
	modal_msg += '<div id="add-new-tune-dialog">';
	modal_msg += '<p style="text-align:center;margin-top:28px;font-size:18px;">Add Your Own Tunes from an ABC or MusicXML File</p>';
	modal_msg += '<p style="text-align:center;margin-top:36px;">';
	modal_msg += '<input type="file" id="addabcfilebutton" accept=".abc,.txt,.ABC,.TXT,.xml,.XML,.musicxml,.mxl,.MXL" hidden/>';
	modal_msg += '<label class="abcupload btn btn-top" for="addabcfilebutton" title="Adds tunes from an existing ABC or MusicXML file to the end of the ABC">Choose File to Add</label>';
	modal_msg += '</p>';
	modal_msg += '<p style="text-align:center;margin-top:24px;font-size:18px;margin-top:40px;">Add an Example ABC Tune</p>';
	modal_msg += '<p style="text-align:center;margin-top:24px;">';
	modal_msg  += '<input id="addnewreel" class="advancedcontrols btn btn-injectcontrols-headers" onclick="AppendSampleReel();" type="button" value="Add an Example Reel" title="Adds an example reel (Cooley\'s) to the end of the ABC">';
	modal_msg  += '<input id="addnewjig" class="advancedcontrols btn btn-injectcontrols-headers" onclick="AppendSampleJig();" type="button" value="Add an Example Jig" title="Adds an example jig (The Kesh) to the end of the ABC">';
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
	modal_msg += '<p style="text-align:center;margin-top:24px;">';
	modal_msg  += '<input id="addtunebookheaders" class="advancedcontrols btn btn-injectcontrols-headers" onclick="InjectPDFHeaders(false);" type="button" value="Add PDF Tunebook Annotations" title="Adds common useful PDF tunebook annotations to the top of the ABC">';
	modal_msg += '</p>';
	modal_msg += '<p style="text-align:center;margin-top:24px;">';
	modal_msg += '</p>';

	modal_msg += '</div>';

	setTimeout(function(){

		idleAddABC();

	}, 150);

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 100, width: 700,  scrollWithPage: (gIsIOS || gIsAndroid) }).then(function(){

			
	});

}


function AppendSampleReel(){	

	// Stuff in some default ABC with additional options explained
	var theValue = ""

	var nTunes = CountTunes();

	if (nTunes > 0){
		theValue += "\n";
	}
	
	theValue += "X: 1\n";
	theValue += "T: Cooley's\n";
	theValue += "R: Reel\n";
	theValue += "M: 4/4\n";
	theValue += "L: 1/8\n";
	theValue += "K: Edor\n";
	theValue += "C: Traditional\n";
	theValue += '%abcjs_soundfont fluid\n';	
	theValue += "%\n";
	theValue += "% Use an Accordion sound when playing the melody:\n";
	theValue += "%%MIDI program 21\n";
	theValue += "%\n";
	theValue += "% Use an Accordion sound when playing the chords:\n";
	theValue += "%%MIDI chordprog 21\n";
	theValue += "%\n";
	theValue += "% ABC for the tune, both melody and chords:\n";
	theValue += "%\n";
	theValue += '|:"Em"EBBA B2 EB|"Em"B2 AB dBAG|"D"F/E/D AD BDAD|"D"F/E/D AD BAGF|\n';
	theValue += '"Em"EBBA B2 EB|"Em"B2 AB defg|"D"afge dBAF|1 "D"DEFD "Em"E3D:|2 "D"DEFD "Em"E2gf||\n';
	theValue += '|:"Em"eB (3BBB eBgf|"Em"eBB2 gedB|"D"A/A/A FA DAFA|"D"A/A/A FA defg|\n';
	theValue += '"Em"eB (3BBB eBgf|"Em"eBBB defg|"D"afge dBAF|1 "D"DEFD "Em"E2gf:|2 "D"DEFD "Em"E4|]\n';

	// Do common tune addition processing
	ProcessAddTune(theValue);

}

function AppendSampleJig(){	

	// Stuff in some default ABC with additional options explained
	var theValue = ""

	var nTunes = CountTunes();

	if (nTunes > 0){
		theValue += "\n";
	}
	
	theValue += "X: 1\n";
	theValue += "T: The Kesh\n";
	theValue += "R: Jig\n";
	theValue += "M: 6/8\n";
	theValue += "L: 1/8\n";
	theValue += "K: Gmaj\n";
	theValue += "C: Traditional\n";
	theValue += '%abcjs_soundfont fluid\n';	
	theValue += "%\n";
	theValue += "% Use an Accordion sound when playing the melody:\n";
	theValue += "%%MIDI program 21\n";
	theValue += "%\n";
	theValue += "% Use an Accordion sound when playing the chords:\n";
	theValue += "%%MIDI chordprog 21\n";
	theValue += "%\n";
	theValue += "% ABC for the tune, both melody and chords:\n";
	theValue += "%\n";
	theValue += '|:"G"GAG GAB|"D"ABA ABd|"G"edd gdd|"C"edB "D"dBA|\n';
	theValue += '"G"GAG GAB|"D"ABA ABd|"G"edd gdB|"D"AGF "G"G3:|\n';
	theValue += '|:"G"BAB dBd|"C"ege "D"dBA|"G"BAB dBG|"D"ABA AGA|\n';
	theValue += '"G"BAB dBd|"C"ege "G"dBd|"C"gfg "D"aga|"G"bgf g3:|\n';

	// Do common tune addition processing
	ProcessAddTune(theValue);

}

//
// Add a new song template to the ABC
//
function AppendSongTemplate(){	

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

	// Set the select point
	gTheABC.selectionStart = 0;
    gTheABC.selectionEnd = 0;

    // And set the focus
    gTheABC.focus();	

}

//
// Add a click track template to the top of the ABC
//
function AddClickTrackTemplate(){

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
	theValue += '% fluid, musyng, or fatboy for different harpsichord sounds:\n';
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
	theValue += '% fluid, musyng, or fatboy for different organ sounds:\n';
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

	// Reset the displayed name base
	if (gDisplayedName != "No ABC file selected"){

		if (gDisplayedName.indexOf("+ added tunes") == -1){

			gDisplayedName = gDisplayedName + " + added tunes";

		}
	}

	RenderAsync(true,null,function(){

		UpdateNotationTopPosition();

		// No autoscroll on mobile
		if (gIsIOS || gIsAndroid){
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
	var notationHolder = document.getElementById("notation-holder");
	notationHolder.innerHTML = "";

	for (var i = 0; i < nTunes; ++i) {

		var el = document.createElement('div');

		el.id = "notation" + i;

		// Space the tunes out a bit
		el.classList.add("tunespacer");

		// Force page break between tunes when printing from the browser
		el.classList.add("pagebreak");

		// Only do this on desktop
		if (!(gIsIOS || gIsAndroid)){

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

	// Pass along the top bar status
	if (!gTopBarShowing){
		url+="&hide=1";
	}

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

	var isShiftOverride = false;

	var theURL = document.getElementById("urltextbox").value;

	// Shift-click allows generic QR code generation
	if (e.shiftKey){

		var maxURLLength = MAXQRCODEURLLENGTH;
	
		if (theURL.length > maxURLLength) {

			DayPilot.Modal.alert('<p style="text-align:center;font-family:helvetica;font-size:14pt;">Share URL text is too long to generate a QR Code</p>',{ theme: "modal_flat", top: 50, scrollWithPage: (gIsIOS || gIsAndroid) });

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

	DayPilot.Modal.prompt(thePrompt, thePlaceholder,{ theme: "modal_flat", top: 194, autoFocus: false, scrollWithPage: (gIsIOS || gIsAndroid) }).then(function(args) {

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
		if ((!gIsAndroid) && (!gIsIOS)){

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

	});
}

//
// Save the ShareURL file
//
function saveShareURLFile(thePrompt, thePlaceholder, theData){

	DayPilot.Modal.prompt(thePrompt, thePlaceholder,{ theme: "modal_flat", top: 194, autoFocus: false, scrollWithPage: (gIsIOS || gIsAndroid) }).then(function(args) {

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
		if ((!gIsAndroid) && (!gIsIOS)){

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
	  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:50px;">Inject Repeats and Two-Bar Click Intros&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="http://michaeleskin.com/abctools/userguide.html#injectrepeatsandtwobarclickintros" target="_blank" style="text-decoration:none;">💡</a></span></p>'},
	  {html: '<p style="margin-top:36px;margin-bottom:36px;font-size:12pt;line-height:14pt;font-family:helvetica">This will inject repeats into each tune in the ABC area by  appending the entire ABC for each tune to itself multiple times.</p>'},	  
	  {html: '<p style="margin-top:36px;margin-bottom:36px;font-size:12pt;line-height:14pt;font-family:helvetica">You may also optionally inject a two-bar click intro before each tune.</p>'},	  
	  {name: "How many times through each tune:", id: "configure_repeats", type:"number", cssClass:"configure_repeats_form_text"}, 
	  {name: "            Inject a two-bar style-appropriate click intro before each tune", id: "configure_inject_click", type:"checkbox", cssClass:"configure_repeats_form_text"},
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:14pt;font-family:helvetica"><strong>To only append a two-bar click intro before each tune:</strong></p>'},	  
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:14pt;font-family:helvetica">1) Set <strong>How many times through each tune:</strong> to 1</p>'},	  
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:14pt;font-family:helvetica">2) Check <strong>Inject a two-bar style-appropriate click intro before each tune</strong>.</p>'},	  
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:14pt;font-family:helvetica">3) Click <strong>OK</strong>.</p>'},	  
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:14pt;font-family:helvetica"><strong>For best results when repeating tunes:<strong></p>'},	  
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:14pt;font-family:helvetica">For clean repeats, your tunes must not have extraneous pickup or trailing notes and must have proper and complete timing.</p>'},	  
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:14pt;font-family:helvetica">If there is a repeat at the end of the first part of a tune, either standalone or in a first ending, there must be a matching |: bar at the start of the tune for the tune repeats to work properly.</p>'},	  
	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 100, width: 760, scrollWithPage: (gIsIOS || gIsAndroid) } ).then(function(args){
		
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

			// Stuff in the transposed output
			gTheABC.value = output;

			// Force a redraw
			RenderAsync(true,null,function(){

				// Set the select point
				gTheABC.selectionStart = 0;
			    gTheABC.selectionEnd = 0;

			    // And set the focus
			    gTheABC.focus();
			});
		}
	});
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
// Inject anything just below the header
//
function InjectStringBelowTuneHeader(theTune,theString){

	theTune = theTune.trim();

	// Find the notes below the header
	var theNotes = removeABCTuneHeaders(theTune);

	theNotes = theNotes.trim();

	var theLines = theNotes.split("\n");

	var firstLine = theLines[0]; 

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

	theOutput = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont "+theSoundfont);
	
	return theOutput;
	
}

//
// Inject a %%staffwidth directive after all the X: headers
//
function InjectStaffWidth() {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	DayPilot.Modal.prompt("%%staffwidth value to inject? (Larger values make the tunes less tall)", 560, { theme: "modal_flat", top: 194, autoFocus: false, scrollWithPage: (gIsIOS || gIsAndroid) }).then(function(args) {
		
		var staffwidthstr = args.result;

		if (staffwidthstr == null){
			return;
		}

		var staffwidth = parseInt(staffwidthstr);

		if ((isNaN(staffwidth)) || (staffwidth == undefined)){
			return;
		}

		var nTunes = CountTunes();

		var theNotes = gTheABC.value;

		// Find the tunes
		var theTunes = theNotes.split(/^X:/gm);

		var output = FindPreTuneHeader(theNotes);

		for (var i=1;i<=nTunes;++i){

			theTunes[i] = "X:"+theTunes[i];

			output += InjectOneTuneStaffWidth(theTunes[i],staffwidth);

		}

		// Stuff in the transposed output
		gTheABC.value = output;

		// Force a redraw
		RenderAsync(true,null,function(){

			// Set the select point
			gTheABC.selectionStart = 0;
		    gTheABC.selectionEnd = 0;

		    // And set the focus
		    gTheABC.focus();
		});

	});

}

//
// Inject a %abcjs_soundfont directive after all the X: headers
//
function InjectSoundfont() {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	DayPilot.Modal.prompt("%abcjs_sound value to inject? Options are: fluid, musyng, or fatboy", "fluid", { theme: "modal_flat", top: 194, autoFocus: false, scrollWithPage: (gIsIOS || gIsAndroid) }).then(function(args) {
		
		var theSoundfont = args.result;

		if (theSoundfont == null){
			return;
		}

		if ((theSoundfont != "fluid") && (theSoundfont != "musyng") && (theSoundfont != "fatboy") ){
			return;
		}

		var nTunes = CountTunes();

		var theNotes = gTheABC.value;

		// Find the tunes
		var theTunes = theNotes.split(/^X:/gm);

		var output = FindPreTuneHeader(theNotes);

		for (var i=1;i<=nTunes;++i){

			theTunes[i] = "X:"+theTunes[i];

			output += InjectOneTuneSoundfont(theTunes[i],theSoundfont);

		}

		// Stuff in the transposed output
		gTheABC.value = output;

	});

}
//
// Inject MIDI program number directive below the tune header
//
function InjectOneTuneMIDIProgram(theTune, progNum, bIsChords){

	if (bIsChords){

		theOutput = InjectStringBelowTuneHeader(theTune,"%%MIDI chordprog "+progNum);

	}
	else{

		theOutput = InjectStringBelowTuneHeader(theTune,"%%MIDI program "+progNum);

	}
	
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
// Inject a MIDI instrument directive after all the X: headers
//
function InjectMIDIInstrument(bIsChords) {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	var theProgramToInject = " melody";
	var theDefaultProgram = "21";

	if (bIsChords){
		theProgramToInject = " chords"
		theDefaultProgram = "34";
	}

	var thePrompt = '<p style="font-size:14pt;line-height:19pt;font-family:helvetica"><strong>MIDI instrument program number to inject for the'+theProgramToInject+'?</strong></p><p style="font-size:14pt;font-family:helvetica">Suggested values:</p><p style="font-size:14pt;line-height:19pt;font-family:helvetica">Piano: 0,&nbsp;&nbsp;Harpsichord: 6,&nbsp;&nbsp;Hammered Dulcimer: 15,&nbsp;&nbsp;Accordion: 21,&nbsp;&nbsp;Fingered Bass: 33,&nbsp;&nbsp;Harp: 46,&nbsp;&nbsp;Flute: 73,&nbsp;&nbsp;Whistle: 78,&nbsp;&nbsp;Fiddle: 110,&nbsp;&nbsp;Silence: mute</p><p style="font-size:14pt;line-height:19pt;font-family:helvetica;margin-bottom:30px"><strong>Shortcut:</strong> Entering a negative value will inject the same value for both the melody and chord instrument program numbers.</p><p style="font-size:14pt;line-height:19pt;font-family:helvetica;margin-bottom:30px;text-align:center;"><a href="http://michaeleskin.com/documents/general_midi_extended_v2.pdf" target="_blank">General MIDI Instrument Program Numbers</a></p>';

	if (bIsChords){
		thePrompt = '<p style="font-size:14pt;line-height:19pt;font-family:helvetica"><strong>MIDI instrument program number to inject for the'+theProgramToInject+'?</strong></p><p style="font-size:14pt;font-family:helvetica">Suggested values:</p><p style="font-size:14pt;line-height:19pt;font-family:helvetica">Piano: 0,&nbsp;&nbsp;Electric Piano: 5,&nbsp;&nbsp;Organ: 19,&nbsp;&nbsp;Accordion: 21,&nbsp;&nbsp;Guitar: 25,&nbsp;&nbsp;Bass: 34,&nbsp;&nbsp;Synth Bass: 38,&nbsp;&nbsp;Silence: mute</p><p style="font-size:14pt;line-height:19pt;font-family:helvetica;margin-bottom:30px"><strong>Shortcut:</strong> Entering a negative value will inject the same value for both the melody and chord instrument program numbers.</p><p style="font-size:14pt;line-height:19pt;font-family:helvetica;margin-bottom:30px;text-align:center;"><a href="http://michaeleskin.com/documents/general_midi_extended_v2.pdf" target="_blank">General MIDI Instrument Program Numbers</a></p>';
	}

	DayPilot.Modal.prompt(thePrompt, theDefaultProgram, { theme: "modal_flat", top: 194, autoFocus: false, scrollWithPage: (gIsIOS || gIsAndroid) }).then(function(args) {
		
		var progNumStr = args.result;

		if (progNumStr == null){
			return;
		}

		var bDoBoth = false;

		// Special case for muting voices
		if (progNumStr.toLowerCase() == "mute"){

			progNum = "mute";

		}
		else{

			var progNum = parseInt(progNumStr);

			if ((isNaN(progNum)) || (progNum == undefined)){
				return;
			}


			if (progNum < 0){
				bDoBoth = true;
				progNum = -progNum;
			}

			if ((progNum < 0) || (progNum > 136)){
				return;
			}

		}

		var nTunes = CountTunes();

		if (!bDoBoth){

			var theNotes = gTheABC.value;

			// Find the tunes
			var theTunes = theNotes.split(/^X:/gm);

			var output = FindPreTuneHeader(theNotes);

			for (var i=1;i<=nTunes;++i){

				theTunes[i] = "X:"+theTunes[i];

				output += InjectOneTuneMIDIProgram(theTunes[i],progNum,bIsChords);

			}

		}
		else{

			var theNotes = gTheABC.value;

			// Inject the melody program
			var theTunes = theNotes.split(/^X:/gm);

			var output = FindPreTuneHeader(theNotes);

			for (var i=1;i<=nTunes;++i){

				theTunes[i] = "X:"+theTunes[i];

				output += InjectOneTuneMIDIProgram(theTunes[i],progNum,true);

			}	

			// Inject the chords
			theTunes = output.split(/^X:/gm);

			var output = FindPreTuneHeader(theNotes);

			for (var i=1;i<=nTunes;++i){

				theTunes[i] = "X:"+theTunes[i];

				output += InjectOneTuneMIDIProgram(theTunes[i],progNum,false);

			}	
					
		}

		// Stuff in the transposed output
		gTheABC.value = output;

		// Set the select point
		gTheABC.selectionStart = 0;
	    gTheABC.selectionEnd = 0;

	    // And set the focus
	    gTheABC.focus();

	});

}

//
// Play the ABC
//
function PlayABC(e){

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
		PlayABCDialog(theSelectedABC);

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

		DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 50, scrollWithPage: (gIsIOS || gIsAndroid) });

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

		var theData = gTheABC.value;

		if (theData.length != 0){

			var theTuneCount = CountTunes();

			// Derive a suggested name from the ABC
			var theName = getDescriptiveFileName(theTuneCount,false);

			if ((!gIsAndroid) && (!gIsIOS)){

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

		var theData = urltextbox.value;

		if (theData.length != 0){

			var theTuneCount = CountTunes();

			// Derive a suggested name from the ABC
			var theName = getDescriptiveFileName(theTuneCount,false);

			saveShareURLFile("Please enter a filename for your Share URL file:",theName+"_Share_URL.txt",theData);
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
	document.getElementById("toggleallcontrols").value = "Hide Controls";

	gShowAllControls = true;

}

function HideAllControls(){

	document.getElementById("notenrechts").style.display = "none";
	document.getElementById("toggleallcontrols").value = "Show Controls";

	gShowAllControls = false;

}

function ToggleAllControls(){

	// Check if OK to toggle the controls
	if (!gAllowControlToggle){
		return;
	}

	if (gShowAllControls){
		HideAllControls();
	}
	else{
		ShowAllControls();
	}

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
	document.getElementById("notation-holder").style.display = "flex";
	document.getElementById("notation-holder").style.float = "none";

	document.getElementById("zoombutton").src = "img/zoomin.png"

	gIsMaximized = true;

	// Fix the display margins
	HandleWindowResize();

	if (!(gIsIOS || gIsAndroid)){

		// Defer any notation clicks
		gGotRenderDivClick = false;
		gRenderDivClickOffset = -1;

	}


}

function DoMinimize(){

	document.getElementById("noscroller").style.display = "block";
	document.getElementById("notation-spacer").style.display = "block";

	document.getElementById("zoombutton").src = "img/zoomout.png"

	if (!(gIsIOS || gIsAndroid)){
		document.getElementById("notation-holder").style.display = "inline";
		document.getElementById("notation-holder").style.float = "left";
	}

	gIsMaximized = false;

	// Fix the display margins
	HandleWindowResize();

	// Handle any deferred notation clicks
	if (!(gIsIOS || gIsAndroid)){
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

		if (!(gIsAndroid || gIsIOS)){

			document.getElementById("notation-holder").style.width = "855px";

		}
		else{

			document.getElementById("notation-holder").style.width = "820px";

		}

	}
	else{

		DoMaximize();

		if (!(gIsAndroid || gIsIOS)){

			// Scale the full screen up a bit if it makes sense
			var windowWidth = window.innerWidth;

			if (((windowWidth * gFullScreenScaling)/100.0) > 850){

				document.getElementById("notation-holder").style.width = gFullScreenScaling+"%";

			}
		}
		else{

			// Scale the full screen up a bit if it makes sense
			var windowWidth = window.innerWidth;

			if (((windowWidth * gFullScreenScaling)/100.0) > 820){

				document.getElementById("notation-holder").style.width = gFullScreenScaling+"%";

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

	const urlParams = new URLSearchParams(window.location.search);

	// Process URL params

	// Handler for legacy base64 parameters
	if (urlParams.has("base64")) {

		const abcInBase64 = urlParams.get("base64");

		const abcText = b64toutf8(abcInBase64);

		if (abcText.length > 0) {
			SetAbcText(abcText);
			RestoreDefaults();
			doRender = true;
		}
	}

	// Handler for lzw ABC data parameter
	if (urlParams.has("lzw")) {

		var abcInLZW = urlParams.get("lzw");

		abcInLZW = LZString.decompressFromEncodedURIComponent(abcInLZW);

		const abcText = abcInLZW;

		if (abcText.length > 0) {
			SetAbcText(abcText);
			RestoreDefaults();
			doRender = true;
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

	// Hide the top bar?
	if (urlParams.has("hide")) {
		var theHide = urlParams.get("hide");
		if (theHide == "1"){
			HideTopBar();
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
		document.getElementById("toggleallcontrols").value = "Show Controls";

		// Recalculate the notation top position
		UpdateNotationTopPosition();

		gShowAllControls = false;

		// Set the inital focus back to the ABC
		FocusABC();

		// Render the tune
		RenderAsync(true,null,function(){

			// Playback requested?
			if (doPlay){

				// Pre-process the ABC to inject any requested programs or volumes
				var theProcessedABC = PreProcessPlayABC(gTheABC.value);

				// Play back locally in-tool	
				PlayABCDialog(theProcessedABC);

			}

		});

		if (!(gIsAndroid || gIsIOS)){

			// Scale the full screen up a bit if it makes sense
			var windowWidth = window.innerWidth;

			if (((windowWidth * gFullScreenScaling)/100.0) > 850){

				document.getElementById("notation-holder").style.width = gFullScreenScaling+"%";

			}
		}
		else{

			// Scale the full screen up a bit if it makes sense
			var windowWidth = window.innerWidth;

			if (((windowWidth * gFullScreenScaling)/100.0) > 820){

				document.getElementById("notation-holder").style.width = gFullScreenScaling+"%";

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

    for (i=1;i<=nTunes;++i){

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
			if (gIsIOS || gIsAndroid){
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
// Inject PDF-related headers at the top of the file
//
function InjectPDFHeaders(bDoAll){

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	if (bDoAll){

		var theNotes = gTheABC.value;

		var output = "";
		output += "%\n";
		output += "% Here are all available custom annotations:\n";
		output += "%\n";
		output += "%pdfquality .75\n";
		output += "%pdf_between_tune_space 20\n";
		output += "%pdfname your_pdf_filename\n"
		output += "%addtitle Title Page Title\n";
		output += "%addsubtitle Title Page Subtitle\n";
		output += "%urladdtitle http://michaeleskin.com Title Page Title as Hyperlink\n";
		output += "%urladdsubtitle http://michaeleskin.com Title Page Subtitle as Hyperlink\n";
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
		output += "%urlpageheader http://michaeleskin.com Page Header as Hyperlink\n";
		output += "%urlpagefooter http://michaeleskin.com Page Footer as Hyperlink\n";
		output += "%add_all_links_to_thesession\n";
		output += "%add_all_playback_links 0 0\n";
		output += "%qrcode\n";
		output += "%qrcode http://michaeleskin.com\n";
		output += "%caption_for_qrcode Caption for the QR code\n";
		output += "%\n";
		output += "% These directives can be added to each tune:\n";
		output += "%hyperlink http://michaeleskin.com\n";
		output += "%add_link_to_thesession\n";
		output += "%add_playback_link 0 0\n";
		output += "\n";
		
		output += theNotes;

		// Stuff in the transposed output
		gTheABC.value = output;

		// Set the select point
		gTheABC.selectionStart = 0;
	    gTheABC.selectionEnd = 0;

	    // And set the focus
	    gTheABC.focus();	

	    return

	}
	else{

		// If currently rendering PDF, exit immediately
		if (gRenderingPDF) {
			return;
		}

		var theNotes = gTheABC.value;

		var output = "";
		output += "%\n";
		output += "% Here is a useful template of annotations for a PDF tunebook:\n";
		output += "%\n";
		output += "%pdfquality .75\n";
		output += "%pdf_between_tune_space 20\n";
		output += "%addtitle Tunebook Title\n";
        output += "%addsubtitle Tunebook Subtitle\n";
        output += "%addtoc Table of Contents\n";
        output += "%addlinkbacktotoc\n";
        output += "%addsortedindex Index\n";
        output += "%addlinkbacktoindex\n";
        output += "%pageheader This is the Page Header\n";
        output += "%pagefooter This is the Page Footer\n";
        output += "%add_all_playback_links 0 0\n";
        output += "%qrcode http://michaeleskin.com\n";
		output += "%caption_for_qrcode Click or Scan to Visit my Home Page\n";
		output += "\n";
		
		output += theNotes;

		// Stuff in the headers
		gTheABC.value = output;

		// Set the select point
		gTheABC.selectionStart = 0;
	    gTheABC.selectionEnd = 0;

	    // And set the focus
	    gTheABC.focus();	

	    return;

	}
}

//
// Inject note name lyrics into one tune
//
function InjectOneTuneABCNoteNameLyrics(theTune){

	var theABC = escape(theTune);

	var theLines = theABC.split("%0A");

	var theOutput = "";

	var thisLine = "";

	for (i = 0; i < theLines.length; ++i) {
		
		thisLine = unescape(theLines[i]); 

		var theChars = thisLine.split(""); 

		// It's a normal ABC : directive, copy it as is
		if (((theChars[0] != "|") && (theChars[0] != "[")) && (theChars[1] == ":")) {

			theOutput += thisLine+"\n";

			// Inject the font directive to save people time
			if (theChars[0] == "X"){
				theOutput += "%%vocalfont Times-Roman 13.5\n";
			}

		}
		else
		// It's a comment or an ABC directive, copy it as-is
		if (theChars[0] == "%") {
			theOutput += thisLine+"\n";
		}
		else{

			thisLine = thisLine.trim();

			if (thisLine != ""){

				theOutput += thisLine+"\n";

				// Strip out chord markings
				var searchRegExp = /"[^"]*"/gm

				// Strip out chord markings
				thisLine = thisLine.replace(searchRegExp, "");

				// Strip out ornaments
				var searchRegExp = /{[^{]*}/gm

				// Strip out ornaments
				thisLine = thisLine.replace(searchRegExp, "");

				// Now strip anything that isn't ABC note names
				searchRegExp = /[^ABCDEFGabcdefg|]*/gm
				thisLine = thisLine.replace(searchRegExp,"");

				// Now insert spaces between each character
				theChars = thisLine.split(""); 
				thisLine = theChars.join(" ");

				// Fix of any | | pairs
				searchRegExp = /\| \|/gm
				thisLine = thisLine.replace(searchRegExp,"|");

				theOutput += "w: "+thisLine+"\n";

			}
			else{

				theOutput += thisLine;

			}
		}
	}
	
	theOutput += "\n";

	return theOutput;
	
}

//
// Inject note name lyrics in the selected tunes
//
function InjectABCNoteNameLyrics(){

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	var nTunes = CountTunes();

	var theNotes = gTheABC.value;

	// Find the tunes
	var theTunes = theNotes.split(/^X:/gm);

	var output = FindPreTuneHeader(theNotes);

	for (var i=1;i<=nTunes;++i){

		theTunes[i] = "X:"+theTunes[i];

		output += InjectOneTuneABCNoteNameLyrics(theTunes[i]);

	}

	// Stuff in the modified output
	gTheABC.value = output;

	// Force a full render
	RenderAsync(true, null);

	// Set the select point
	gTheABC.selectionStart = 0;
    gTheABC.selectionEnd = 0;

    // And set the focus
    gTheABC.focus();


}

//
// Do ABC Notename Lyric inject
//
function DoInjectABCNoteNameLyrics(){

	InjectABCNoteNameLyrics();
	
	RenderAsync(true,null);

	IdleAdvancedControls(true);

	// Idle the show tab names control
	IdleAllowShowTabNames();

}

//
// Do B/C Box Tab Injection
//
function DoInjectTablature_BC(){

	SetRadioValue("notenodertab","noten");

	gCurrentTab = "noten";

	gInjectTab_BoxStyle = "0";

	gTheABC.value = boxTabGenerator(gTheABC.value);

	// Show the chords after an inject
	gStripChords = false;
	
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

	SetRadioValue("notenodertab","noten");

	gCurrentTab = "noten";

	gInjectTab_BoxStyle = "1";

	gTheABC.value = boxTabGenerator(gTheABC.value);

	// Show the chords after an inject
	gStripChords = false;	
	
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

	SetRadioValue("notenodertab","noten");

	gCurrentTab = "noten";

	gTheABC.value = angloFingeringsGenerator(gTheABC.value);

	// Show the chords after an inject
	gStripChords = false;
	
	RenderAsync(true,null);

	// Idle the dialog
	IdleAdvancedControls(true);

	// Idle the show tab names control
	IdleAllowShowTabNames();

}

//
// Do Bamboo Flute Tab Injection
//
// Prompt first for the key
//
function DoInjectTablature_Bamboo_Flute(){

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
	  {html: '<p style="margin-top:36px;margin-bottom:36px;font-size:12pt;line-height:14pt;font-family:helvetica">This will inject numeric notation tablature for a bamboo flute in the key selected below into all of the tunes in the ABC text area:</p>'},	  
	  {name: "Bamboo flute key:", id: "configure_bamboo_flute_key", type:"select", options:bamboo_flute_keys, cssClass:"configure_box_settings_select"}, 
	  {html: '<p style="margin-top:24px;font-size:12pt;line-height:14pt;font-family:helvetica">&nbsp;</p>'},	  

	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 200, width: 500, scrollWithPage: (gIsIOS || gIsAndroid) } ).then(function(args){

		// Get the results and store them in the global configuration
		if (!args.canceled){

			gBambooFluteKey = args.result.configure_bamboo_flute_key; 

			// Save the settings, in case they were initialized
			SaveConfigurationSettings();

			SetRadioValue("notenodertab","noten");

			gCurrentTab = "noten";

			gTheABC.value = bambooFluteTabGenerator(gTheABC.value);

			// Show the chords after an inject
			gStripChords = false;
			
			RenderAsync(true,null);

			// Idle the dialog
			IdleAdvancedControls(true);

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
		
		RenderAsync(true,null);

	}

	gCurrentTab = theTab;

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
// Set the margins on window resize
//
function HandleWindowResize(){

	// Only executed on responsive desktop browsers

	if (!(gIsIOS || gIsAndroid)){

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

			}
		}
		else{

			var elem = document.getElementById("app-container");
			
			elem.style.marginLeft = "0px";

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

   var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica">Welcome to My ABC Transcription Tools!</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica"><strong>Read the <a href="userguide.html" target="_blank" title="ABC Transcription Tools User Guide">User Guide</a> for instructions and demo videos.</strong></p>';
	   if (!(gIsIOS || gIsAndroid)){
		   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">Zoom your browser out using Ctrl - on Windows, ⌘ - on Mac until you have the ABC editor on the left, and the notation area on the right.</p>';
	   }
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">To begin, type or paste tunes in ABC format into the text area.</p>'; 
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">Each ABC tune <strong>must</strong> begin with an X: tag.</p>'; 
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">Notation updates instantly as you make changes.</p>'; 
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">Click <strong>Open</strong> to open an ABC or MusicXML file from your system.</p>';
	   if (!(gIsIOS || gIsAndroid)){
	   		modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">You may also drag-and-drop a single ABC or MusicXML file on the editor area to add it.</p>';
	   }
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">Click <strong>Add</strong> to add a new ABC tune template.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">Click <strong>Settings</strong> to set common tools settings and select the default instrument sounds and volumes to use when playing tunes.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica"><strong>Once ABC has been entered and notation is displayed:</strong></p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">• Click the <strong>Zoom-Out</strong> arrows at the upper-right to view notation fullscreen.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">• Click <strong>Save</strong> to save all the ABC text to an ABC text file.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">• Click <strong>Export PDF</strong> to export your tunebook in PDF format.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">• Click <strong>Copy All</strong> to copy all the ABC text to the clipboard.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">• Click <strong>Play</strong> to play the tune currently being edited.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:15pt;font-family:helvetica">If you find this tool useful, please <strong><a href="donate.html" target="_blank" title="Michael likes beer!">Buy Michael a Beer!</a></strong></p>';

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 50, scrollWithPage: (gIsIOS || gIsAndroid) });

}

//
// Show the first run zoom screen
//
function showZoomInstructionsScreen(){

   	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica">Welcome to My ABC Transcription Tools!</p>';
   	   modal_msg  += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">Since this is your first time using the tool, here is some useful information:</p>';
   	   modal_msg  += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">In this view, you may scroll through the tune notation.</p>';
       modal_msg  += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">If you would like to edit or create a PDF tunebook from the notation:</p>';
  	   modal_msg  += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">Click the <strong>Zoom-In</strong> arrows at the upper-right to open the ABC editor.</p>';
   	   modal_msg  += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">In the ABC editor, click the <strong>Zoom-Out</strong> arrows to view notation fullscreen.</p>';
   	   modal_msg  += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">All controls in the ABC editor have helpful tooltips.</p>';
	   modal_msg  += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">Read the <a href="userguide.html" target="_blank" title="ABC Transcription Tools User Guide">User Guide</a> for instructions and demo videos.</p>';

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 50, scrollWithPage: (gIsIOS || gIsAndroid) });

}

// 
// Download the current tune as a .WAV file
//

var gMIDIbuffer = null;
var gPlayerABC = null;
var gTheOKButton = null;
var gTheMuteHandle = null;

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
		DayPilot.Modal.alert("A problem occured when exporting the .wav file.",{ theme: "modal_flat", top: 50, scrollWithPage: (gIsIOS || gIsAndroid) });

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

	for (var j = 0; j < Reihe.length; ++j) {

		Reihe[j] = unescape(Reihe[j]); /* Macht die Steuerzeichen wieder weg */

		var Aktuellereihe = Reihe[j].split(""); /* nochmal bei C. Walshaw crosschecken, ob alle mögl. ausser K: erfasst. */

		if (Aktuellereihe[0] == "M" && Aktuellereihe[1] == ":") {

			// Is this a jig variant (meter ends with /8)?

			var theMeter = Reihe[j].replace("M:","");
			theMeter = theMeter.trim();

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

	// Apparently broken
	if ((gIsIOS) || (gIsAndroid)){

		DayPilot.Modal.alert("Batch export to .MP3 not supported on iOS or Android at this time.",{ theme: "modal_flat", top: 400, scrollWithPage: (gIsIOS || gIsAndroid), okText:"Ok" });
	
		return;

	}

	// Setup initial values
	const theData = {
	  configure_repeats:1,
	  configure_inject_click:false
	};

	const form = [
	  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:50px;">Export All Tunes as MP3&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="http://michaeleskin.com/abctools/userguide.html#export_all_tunes_as_mp3" target="_blank" style="text-decoration:none;">💡</a></span></p>'},
	  {html: '<p style="margin-top:36px;margin-bottom:36px;font-size:12pt;line-height:14pt;font-family:helvetica">This will export all the tunes in the ABC area as .MP3 files with one or more repeats.</p>'},	  
	  {name: "How many times to repeat each tune in the MP3:", id: "configure_repeats", type:"number", cssClass:"configure_repeats_form_text"}, 
	  {name: "            Inject a two-bar style-appropriate click intro before each tune", id: "configure_inject_click", type:"checkbox", cssClass:"configure_repeats_form_text"},
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:14pt;font-family:helvetica"><strong>For best results with repeated tunes:</strong></p>'},	  
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:14pt;font-family:helvetica">For clean repeats, your tunes must not have extraneous pickup or trailing notes and must have proper and complete timing.</p>'},	  
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:14pt;font-family:helvetica">If there is a repeat at the end of the first part of a tune, either standalone or in a first ending, there must be a matching |: bar at the start of the tune for the tune repeats to work properly.</p>'},	  
	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 200, width: 760, scrollWithPage: (gIsIOS || gIsAndroid) } ).then(function(args){
		
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

					PlayABCDialog(thisTune,callback,currentTune);

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

	// Put up batch running dialog
	DayPilot.Modal.alert("Exporting .MP3 for tune "+ (currentTune+1) + " of "+totalTunesToExport,{ theme: "modal_flat", top: 400, scrollWithPage: (gIsIOS || gIsAndroid), okText:"Cancel" }).then(function(args){
		
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

	for (i=0;i<theOKButtons.length;++i){

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
	PlayABCDialog(thisTune,callback,currentTune);

	return true;

}

//
// Generate and download the .mp3 file for the current tune
//
var gInDownloadMP3 = false;

function DownloadMP3(callback,val){

	// // Apparently broken on iOS and Android
	// if (gIsAndroid){
	// 	DayPilot.Modal.alert("Export to .MP3 not supported on Android at this time.",{ theme: "modal_flat", top: 400, scrollWithPage: false, okText:"Ok" });
	// 	return;
	// }

	// Avoid re-entry
	if (gInDownloadMP3){
		return false;
	}
	
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

		document.getElementById("abcplayer_mp3button").value = "Encoding .MP3";
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

				document.getElementById("abcplayer_mp3button").value = "Download .MP3";
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

		DayPilot.Modal.alert("A problem occured when exporting the .mp3 file.",{ theme: "modal_flat", top: 50, scrollWithPage: (gIsIOS || gIsAndroid) });

		document.getElementById("abcplayer_mp3button").value = "Download .MP3";
		document.getElementById("loading-bar-spinner").style.display = "none";
		gInDownloadMP3 = false;


    }));

}

//
// Generate and download the MIDI file for the current tune
//
function DownloadMIDI(){
	
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
// Compute the fade to use for the samples
// My custom samples have shorter fade times for best sound
//
function computeFade(tuneABC){

	var theFade = 200;

	var searchRegExp = /^%%MIDI program.*$/m

	var melodyProgramRequested = tuneABC.match(searchRegExp);

	if ((melodyProgramRequested) && (melodyProgramRequested.length > 0)){

		var thePatchString = melodyProgramRequested[0].replace("%%MIDI program","");
			
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
	searchRegExp = /^%%MIDI chordprog.*$/m

	var chordProgramRequested = tuneABC.match(searchRegExp);

	if ((chordProgramRequested) && (chordProgramRequested.length > 0)){

		var thePatchString = chordProgramRequested[0].replace("%%MIDI chordprog","");
			
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
		}
	}
}

// 
// Tune Play Dialog
//
// callback and val are used for batch export automation
//

function PlayABCDialog(theABC,callback,val){

	gMIDIbuffer = null;
	gPlayerABC = theABC;
	gTheOKButton = null;

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

	// Autoscroll-related cached values
	var playerHolder;
	var containerRect;
	
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

					// Check if the SVG element is above or below the container's visible area
					if (svgRect.top < containerRect.top) {

						// Scroll up to make the SVG element visible at the top
						playerHolder.scrollTop += svgRect.top - containerRect.top;

					} else if (svgRect.bottom > containerRect.bottom) {

						// Scroll down to make the SVG element visible at the bottom
						playerHolder.scrollTop += svgRect.bottom - containerRect.bottom + 16;

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
					
				}).catch(function (error) {
					
					console.log("Problem loading audio for this tune");

				});
			}
		}).catch(function (error) {

			console.log("Problem loading audio for this tune");

		});
	}

	function StopPlay(){

		if (synthControl){
				
			synthControl.destroy();

			synthControl = null;
		}
	}

	var cursorControl = new CursorControl();

	var synthControl;

	function initPlay() {

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
		modal_msg += '<p style="text-align:center;margin:0px;margin-top:18px">'
		modal_msg += '<input id="abcplayer_wavbutton" class="abcplayer_wavbutton btn btn-wavedownload" onclick="DownloadWave();" type="button" value="Download .WAV" title="Downloads the audio for the current tune as a .WAV file">'
		modal_msg += '<input id="abcplayer_mp3button" class="abcplayer_mp3button btn btn-mp3download" onclick="DownloadMP3();" type="button" value="Download .MP3" title="Downloads the audio for the current tune as a .MP3 file">'
		modal_msg += '<input id="abcplayer_midibutton" class="abcplayer_midibutton btn btn-mididownload" onclick="DownloadMIDI();" type="button" value="Download MIDI" title="Downloads the current tune as a MIDI file">'
		modal_msg += '</p>';

	   	// Scale the player for larger screens
		var windowWidth = window.innerWidth;

		var instrument = GetRadioValue("notenodertab");

		var theWidth = windowWidth * 0.45;

		if ((!gIsAndroid) && (!gIsIOS)){

			if (theWidth < 850){
				theWidth = 850;
			}

		}
		else{

			theWidth = 800;  // FOOFOO was 820
			
		}

		DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: theTop, width:theWidth, okText:"Close", scrollWithPage: (gIsIOS || gIsAndroid) });

		var theOKButtons = document.getElementsByClassName("modal_flat_ok");

		// Find the button that says "Close" and hook its click handler to make sure music stops on close
		// Need to search through the modals since there may be a first time share dialog also present
		// the first time someone plays a linked PDF tune

		var theOKButton = null;

		for (i=0;i<theOKButtons.length;++i){

			theOKButton = theOKButtons[i];

			if (theOKButton.innerText == "Close"){

				gTheOKButton = theOKButton;

				var originalOnClick = theOKButton.onclick;

				theOKButton.onclick = function(){

					originalOnClick(); 
					StopPlay(); 
					gTheABC.focus();

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
		playerHolder = document.getElementById("playerholder");
		containerRect = playerHolder.getBoundingClientRect();
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
// Scan tune for soundfont request
//
function ScanTuneForSoundFont(theTune){

	var soundFontFound = null;

	// Search for a soundfont request
	var searchRegExp = /^%abcjs_soundfont.*$/m

	// Detect tunebook TOC annotation
	var soundfont = theTune.match(searchRegExp);

	if ((soundfont) && (soundfont.length > 0)){

		soundFontFound = soundfont[0].replace("%abcjs_soundfont","");
		
		soundFontFound = soundFontFound.trim();

		soundFontFound = soundFontFound.toLowerCase();

	}

	return soundFontFound;
}

//
// Save/load global configuration to/from local browser storage
//

// Global settings state
var gAlwaysInjectPrograms = true;
var gTheMelodyProgram = 0;
var gTheChordProgram = 0;
var gAlwaysInjectVolumes = true;
var gTheBassVolume = 48;
var gTheChordVolume = 48;
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

// Box and Concertina Push and draw tablature glyphs
var gInjectTab_PushGlyph = "↓";
var gInjectTab_DrawGlyph = "↑";
var gInjectTab_UseBarForDraw = false;

// Large player controls
var gLargePlayerControls = false;

// Bamboo flute key
var gBambooFluteKey = 1; // Default to D

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
		gTheBassVolume = 48;
	}

	val = localStorage.TheChordVolume;
	if (val){
		gTheChordVolume = val;
	}
	else{
		gTheChordVolume = 48;
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

    var theMusicXMLImportSettings = localStorage.musicXMLImportOptions;

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

	// Bamboo flute
	val = localStorage.BambooFluteKey;
	if (val){
		gBambooFluteKey = val;
	}
	else{
		gBambooFluteKey = 1;
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

	val = localStorage.UseCustomGMSounds;
	if (val){
		gUseCustomGMSounds = (val == "true");
	}
	else{
		gUseCustomGMSounds = true;
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

		// Accordion and concertina tab bellows direction glyphs
		localStorage.InjectTab_PushGlyph = gInjectTab_PushGlyph;
		localStorage.InjectTab_DrawGlyph = gInjectTab_DrawGlyph;
		localStorage.InjectTab_UseBarForDraw = gInjectTab_UseBarForDraw;

		// Fullscreen scaling
		localStorage.FullScreenScaling = gFullScreenScaling;

		// Anglo button naming matrix
		localStorage.angloButtonNames = JSON.stringify(gAngloButtonNames);

		// MusicXML import options
		localStorage.musicXMLImportOptions = JSON.stringify(gMusicXMLImportOptions);

		// Large player control player options
		localStorage.LargePlayerControls = gLargePlayerControls;

		// Save the bamboo flute key
		localStorage.BambooFluteKey =  gBambooFluteKey;

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

		// Save the custom GM sounds setting
		localStorage.UseCustomGMSounds = gUseCustomGMSounds;

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
		d:0,
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
		m:1
	};
}

function setMusicXMLOptions () {

    gMusicXMLImportOptions.u = $('#musicxml_unfld').prop ('checked') ? 1 : 0;
    gMusicXMLImportOptions.b = parseInt ($('#musicxml_bpl').val () || 3);
    gMusicXMLImportOptions.n = parseInt ($('#musicxml_cpl').val () || 0);
    gMusicXMLImportOptions.c = parseInt ($('#musicxml_crf').val () || 0);
    gMusicXMLImportOptions.d = parseInt ($('#musicxml_den').val () || 0);
    gMusicXMLImportOptions.m = parseInt ($('#musicxml_midi').val () || 0);
    gMusicXMLImportOptions.x = $('#musicxml_nlb').prop ('checked') ? 1 : 0;
    gMusicXMLImportOptions.noped = $('#musicxml_noped').prop ('checked') ? 1 : 0;
    gMusicXMLImportOptions.v1 = $('#musicxml_v1').prop ('checked') ? 1 : 0;
    gMusicXMLImportOptions.stm = $('#musicxml_stems').prop ('checked') ? 1 : 0;
    gMusicXMLImportOptions.mnum = parseInt ($('#musicxml_mnum').val () || -1);

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

};

//
// Reset the MusicXML Import settings
//
function defaultMusicXMLSettings(){

	DayPilot.Modal.confirm("Are you sure you want to reset the MusicXML import options to their default values?",{ top:180, theme: "modal_flat", scrollWithPage: (gIsIOS || gIsAndroid) }).then(function(args){

		if (!args.canceled){

		    resetMusicXMLImportOptions();

		    idleXMLImport();

		}

	});
}

function ConfigureMusicXMLImport(){

	const theData = {};

	// Copy the original options object for later possible restore
	var originalMusicXMLImportOptions = JSON.parse(JSON.stringify(gMusicXMLImportOptions));

	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:50px;"">Configure MusicXML Import&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="http://michaeleskin.com/abctools/userguide.html#musicxml" target="_blank" style="text-decoration:none;">💡</a></p>';

    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Bars-per-line:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" style="width:60px;" id="musicxml_bpl" type="text" pattern="\d+" title="Default: 3"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Characters-per-line:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" style="width:60px;" id="musicxml_cpl" type="text" pattern="\d+" title="Default: 0 - ignore"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Measure numbers:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" style="width:60px;" id="musicxml_mnum" type="text" pattern="\d+" title="-1: No measure numbers, 1..n: Number every n-th measure, 0: Number every system"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Unfold repeats:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" id="musicxml_unfld" type="checkbox"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Credit text filter (level 0-6):&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" style="width:60px;" id="musicxml_crf" type="text" pattern="[0123456]" title="0 (Default), 1, 2, 3, 4, 5, 6"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Denominator unit length for L: tags:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" style="width:60px;" id="musicxml_den" type="text" pattern="\d\d?" title="0 (Automatic), 1, 2, 4, 8, 16, or 32"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">%%MIDI options:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" style="width:60px;" id="musicxml_midi" type="text" pattern="[012]" title="0: No MIDI, 1: Only program, 2: All MIDI"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">No score line breaks:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" id="musicxml_nlb" type="checkbox"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">No pedal directions:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" id="musicxml_noped" type="checkbox"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">All directions to first voice:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" id="musicxml_v1" type="checkbox"/></div>\n';
    modal_msg += '<div style="margin-bottom:12px;"><label style="font-size:12pt;font-family:helvetica;">Translate stem directions:&nbsp;&nbsp;</label><input onchange="setMusicXMLOptions()" id="musicxml_stems" type="checkbox"/></div>\n';

	modal_msg += '<p style="text-align:center;margin-top:22px;"><input id="default_musicxml_settings" class="btn btn-clearbutton default_musicxml_settings" onclick="defaultMusicXMLSettings()" type="button" value="Reset to Default" title="Reset the MusicXML import settings to their default values"></p>\n';

	const form = [
	  {html: modal_msg}
	];


	setTimeout(function(){

		idleXMLImport();

	}, 150);


	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 50, width: 500, scrollWithPage: (gIsIOS || gIsAndroid) } ).then(function(args){
		
		// Get the results and store them in the global configuration
		if (!args.canceled){

		    // Save the custom button naming map
		    if (gLocalStorageAvailable){

		        localStorage.musicXMLImportOptions = JSON.stringify(gMusicXMLImportOptions);

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
// Reset the button naming matrix to the default with confirmation
//
function defaultAngloButtonNames(){

	DayPilot.Modal.confirm("Are you sure you want to reset the Anglo Concertina button names to their default values?",{ top:180, theme: "modal_flat", scrollWithPage: (gIsIOS || gIsAndroid) }).then(function(args){

		if (!args.canceled){

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

	const theData = {};

	// Save off the original fingerings
	var gAngloButtonNamesOriginal = gAngloButtonNames.slice();

	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:50px;">Configure Anglo Concertina Tablature Button Names&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="http://michaeleskin.com/abctools/userguide.html#injecting_box_or_anglo_concertina_tablature" target="_blank" style="text-decoration:none;">💡</a></span></p>';
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


	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 160, width: 800, scrollWithPage: (gIsIOS || gIsAndroid) } ).then(function(args){
		
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
	};

	const form = [
	  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:50px;">Tablature Injection Settings&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="http://michaeleskin.com/abctools/userguide.html#injecting_box_or_anglo_concertina_tablature" target="_blank" style="text-decoration:none;">💡</a></span></p>'},
	  {html: '<p style="margin-top:18px;font-size:12pt;line-height:14pt;font-family:helvetica"><strong>Tablature Font Settings:</strong></p>'},	  
	  {name: "Font family (Recommended: Palatino):", id: "configure_font_family", type:"text", cssClass:"configure_box_settings_form_text_wide"},
	  {name: "Tablature font size (Recommended: 10):", id: "configure_tab_font_size", type:"text", cssClass:"configure_box_settings_form_text"},
	  {name: "%%staffsep value (Recommended: 80):", id: "configure_staffsep", type:"text", cssClass:"configure_box_settings_form_text"},
	  {name: "%%musicspace value (Recommended: 10):", id: "configure_musicspace", type:"text", cssClass:"configure_box_settings_form_text"},
	  {name: "Character(s) for Push indication (Clearing this field will reset to ↓ ):", id: "configure_pushglyph", type:"text", cssClass:"configure_box_settings_form_text"},
	  {name: "Character(s) for Draw indication (Clearing this field will reset to ↑ ):", id: "configure_drawglyph", type:"text", cssClass:"configure_box_settings_form_text"},
	  {name: "    Use a bar over button name to indicate Draw (overrides Push and Draw characters)", id: "configure_use_bar_for_draw", type:"checkbox", cssClass:"configure_box_settings_form_text"},
	  {name: "Tab location relative to notation:", id: "configure_tab_location", type:"select", options:tab_locations, cssClass:"configure_box_settings_select"},
	  {name: "    Strip all chords and tab before injecting tab (Tab below only. Tab above always strips.)", id: "configure_strip_chords", type:"checkbox", cssClass:"configure_box_settings_form_text"},
	  {html: '<p style="margin-top:20px;font-size:12pt;line-height:12pt;font-family:helvetica"><strong>Anglo Concertina Tablature Settings:</strong></p>'},	  
	  {name: "Concertina style:", id: "configure_concertina_style", type:"select", options:concertina_styles, cssClass:"configure_box_settings_select"}, 
	  {name: "Preferred fingerings:", id: "configure_concertina_fingering", type:"select", options:concertina_fingerings, cssClass:"configure_box_settings_select"},
	  {html: '<p style="margin-top:16px;font-size:12pt;line-height:12pt;font-family:helvetica">On-Row: Favors D5 and E5 on right-side C-row.</p>'},	  
	  {html: '<p style="margin-top:12px;font-size:12pt;line-height:12pt;font-family:helvetica">Cross-Row: Favors D5 and E5 on the left-side G-row.</p>'},	  
	  {html: '<p style="margin-top:12px;font-size:12pt;line-height:12pt;font-family:helvetica">Favors C5 on the left-side G-row draw, B4 on the right-side C-row draw.</p>'},	  
	  {html: '<p style="text-align:center;margin-top:22px;"><input id="configure_anglo_fingerings" class="btn btn-subdialog configure_anglo_fingerings" onclick="ConfigureAngloFingerings()" type="button" value="Configure Anglo Concertina Tablature Button Names" title="Configure the Anglo Concertina tablature button names"></p>'},
	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 13, width: 720, scrollWithPage: (gIsIOS || gIsAndroid) } ).then(function(args){

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


//
// Idle the rendering fonts dialog
// 
function idleFontsDialog(){

	$('[name="configure_titlefont"]').val(gRenderingFonts.titlefont);
	$('[name="configure_subtitlefont"]').val(gRenderingFonts.subtitlefont);
	$('[name="configure_infofont"]').val(gRenderingFonts.infofont);
	$('[name="configure_partsfont"]').val(gRenderingFonts.partsfont);
	$('[name="configure_tempofont"]').val(gRenderingFonts.tempofont);
	$('[name="configure_textfont"]').val(gRenderingFonts.textfont);
	$('[name="configure_composerfont"]').val(gRenderingFonts.composerfont);
	$('[name="configure_annotationfont"]').val(gRenderingFonts.annotationfont);
	$('[name="configure_gchordfont"]').val(gRenderingFonts.gchordfont);
	$('[name="configure_vocalfont"]').val(gRenderingFonts.vocalfont);
	$('[name="configure_wordsfont"]').val(gRenderingFonts.wordsfont);
	$('[name="configure_tabnumberfont"]').val(gRenderingFonts.tabnumberfont);
	$('[name="configure_historyfont"]').val(gRenderingFonts.historyfont);
	$('[name="configure_voicefont"]').val(gRenderingFonts.voicefont);
}

//
// Reset the rendering fonts
//

function resetABCRenderingFonts(){

	// Default fonts used for rendering
	gRenderingFonts = {
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

	DayPilot.Modal.confirm("Are you sure you want to reset the ABC rendering fonts to their default values?",{ top:180, theme: "modal_flat", scrollWithPage: (gIsIOS || gIsAndroid) }).then(function(args){

		if (!args.canceled){

		    resetABCRenderingFonts();

		    idleFontsDialog();

		}

	});
}


function ConfigureFonts(){

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
	  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:50px;">Configure ABC Rendering Fonts&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="http://michaeleskin.com/abctools/userguide.html#configure_fonts" target="_blank" style="text-decoration:none;">💡</a></span></p>'},
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
	  {html: '<p style="text-align:center;margin-top:22px;"><input id="default_rendering_fonts" class="btn btn-clearbutton default_rendering_fonts" onclick="defaultFontSettings()" type="button" value="Reset to Default" title="Reset the ABC rendering fonts to their default values"></p>'}
	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 10, width: 600, scrollWithPage: (gIsIOS || gIsAndroid) } ).then(function(args){

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

			Render(true,null);

			// Save the settings, in case they were initialized
			SaveConfigurationSettings();

		}

	});

}


//
// Sharing controls dialog
//

// Add the autoplay string to the URL
function AddAutoPlay(){

	var theURL = urltextbox.value;

	// Check if already present
	if (theURL.indexOf("&play=1") == -1){
		theURL += "&play=1";
	}

	urltextbox.value = theURL;

}

function SharingControlsDialog(){

	// Moving the advanced controls to their own dialog
	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:50px;">ABC Transcription Tools Sharing Controls&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="http://michaeleskin.com/abctools/userguide.html#sharing_controls" target="_blank" style="text-decoration:none;">💡</a></span></p>';
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
	modal_msg += '<p style="text-align:center;margin-top:36px;"><input id="addautoplay" class="urlcontrolslast btn btn-urlcontrols" onclick="AddAutoPlay()" type="button" value="Add Auto-Play" title="Adds &play=1 to the ShareURL"></p>';


	modal_msg += '</div>';

	setTimeout(function(){

		CreateURLfromHTML();

	}, 200);


	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 20, width: 800, scrollWithPage: (gIsIOS || gIsAndroid)}).then(function(){

	});

}

//
// PDF Export dialog
//

function IdlePDFExportDialog(){

	var pdfformat = document.getElementById("pdfformat").value;
	document.getElementById("pdfformat_dialog").value = pdfformat

	var pagenumbers = document.getElementById("pagenumbers").value;
	document.getElementById("pagenumbers_dialog").value = pagenumbers;

	var firstpage = document.getElementById("firstpage").value;
	document.getElementById("firstpage_dialog").value = firstpage;

}

function SyncPDFExportDialog(){

	// Syncs up the hidden old-style controls with the dialog controls

	var pdfformat = document.getElementById("pdfformat_dialog").value;
	document.getElementById("pdfformat").value = pdfformat

	var pagenumbers = document.getElementById("pagenumbers_dialog").value;
	document.getElementById("pagenumbers").value = pagenumbers;

	var firstpage = document.getElementById("firstpage_dialog").value;
	document.getElementById("firstpage").value = firstpage;

	SavePDFSettings();

}

function PDFExportDialog(){

	var theData = {};

	// Moving the PDF export controls to their own dialog
	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:50px;">Export PDF Settings&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="http://michaeleskin.com/abctools/userguide.html#pdf_tunebook_settings" target="_blank" style="text-decoration:none;">💡</a></span></p>';
	modal_msg += '<div id="pdf-export-dialog">';
	modal_msg += '<div id="pdf-settings_dialog" class="toggle-buttons">';
	modal_msg += '<tspan id="pdfformatlabel_dialog">PDF Tunes/Page:</tspan>';
	modal_msg += '<select id="pdfformat_dialog" name="pdfformat" onchange="SyncPDFExportDialog()" title="Sets the PDF tunebook page output format">';
	modal_msg += '<option value = "one" title="One tune-per-page.&nbsp;&nbsp;Paper size is Letter">&nbsp;One&nbsp;-&nbsp;Letter</option>';
	modal_msg += '<option value = "multi" title="Multiple tunes-per-page.&nbsp;&nbsp;Paper size is Letter">&nbsp;Multiple&nbsp;-&nbsp;Letter</option>';
	modal_msg += '<option value = "incipits" title="Tune notation incipits.&nbsp;&nbsp;Paper size is Letter">&nbsp;Notes Incipits&nbsp;-&nbsp;Letter</option>';
	modal_msg += '<option value = "incipits_abc" title="ABC text incipits.&nbsp;&nbsp;Paper size is Letter">&nbsp;ABC Incipits&nbsp;-&nbsp;Letter</option>';
	modal_msg += '<option value = "incipits_abc_sort" title="ABC text incipits, sorted by title.&nbsp;&nbsp;Paper size is Letter">&nbsp;ABC Incipits Sorted&nbsp;-&nbsp;Letter</option>';
	modal_msg += '<option value = "one_a4" title="One tune-per-page.&nbsp;&nbsp;Paper size is A4">&nbsp;One&nbsp;-&nbsp;A4</option>';
	modal_msg += '<option value = "multi_a4" title="Multiple tunes-per-page.&nbsp;&nbsp;Paper size is A4">&nbsp;Multiple&nbsp;-&nbsp;A4</option>';
	modal_msg += '<option value = "incipits_a4" title="Tune notation incipits.&nbsp;&nbsp;Paper size is A4">&nbsp;Notes Incipits&nbsp;-&nbsp;A4</option>';
	modal_msg += '<option value = "incipits_a4_abc" title="ABC text incipits.&nbsp;&nbsp;Paper size is A4">&nbsp;ABC Incipits&nbsp;-&nbsp;A4</option>';
	modal_msg += '<option value = "incipits_a4_abc_sort" title="ABC text incipits sorted by title.&nbsp;&nbsp;Paper size is A4">&nbsp;ABC Incipits Sorted&nbsp;-&nbsp;A4</option>';
	modal_msg += '</select>';
	modal_msg += '<tspan id="pagenumberslabel_dialog">Page #:</tspan>';
	modal_msg += '<select id="pagenumbers_dialog" name="pagenumbers" onchange="SyncPDFExportDialog()" title="Sets the PDF tunebook page number position">';
	modal_msg += '<option value = "none">&nbsp;None</option>';
	modal_msg += '<option value = "tl">&nbsp;Top Left</option>';
	modal_msg += '<option value = "tc">&nbsp;Top Center</option>';
	modal_msg += '<option value = "tr">&nbsp;Top Right</option>';
	modal_msg += '<option value = "bl">&nbsp;Bottom Left</option>';
	modal_msg += '<option value = "bc">&nbsp;Bottom Center</option>';
	modal_msg += '<option value = "br">&nbsp;Bottom Right</option>';
	modal_msg += '<option value = "tlr">&nbsp;Top Left/Right</option>';
	modal_msg += '<option value = "trl">&nbsp;Top Right/Left</option>';
	modal_msg += '<option value = "blr">&nbsp;Bottom Left/Right</option>';
	modal_msg += '<option value = "brl">&nbsp;Bottom Right/Left</option>';
	modal_msg += '</select>';
	modal_msg += '<tspan id="firstpagelabel_dialog"># on Page 1:</tspan>';
	modal_msg += '<select id="firstpage_dialog" name="firstpage" onchange="SyncPDFExportDialog()" title="Sets whether page numbers should appear on the first page of the PDF tunebook">';
	modal_msg += '<option value = "yes">&nbsp;Yes</option>';
	modal_msg += '<option value = "no">&nbsp;No</option>';
	modal_msg += '</select>';
	modal_msg += '</div>';
	modal_msg += '</div>';

	var form = [{html:modal_msg}];

	setTimeout(function(){

		// Do an initial idle on the controls
		IdlePDFExportDialog();

	}, 200);


	DayPilot.Modal.form(form,theData,{ theme: "modal_flat", top: 170, width: 800,  scrollWithPage: (gIsIOS || gIsAndroid) }).then(function(args){
		
		if (!args.canceled){

			ExportPDF();

		}
					
	});

}


//
// Advanced controls dialog
//
function AdvancedControlsDialog(){

	// Set global flag that we're in the advanced controls dialog
	gInAdvancedSettingsDialog = true;

	// Moving the advanced controls to their own dialog
	var modal_msg  = '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:50px;">ABC Transcription Tools Advanced Controls&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="http://michaeleskin.com/abctools/userguide.html#advanced_controls" target="_blank" style="text-decoration:none;">💡</a></span></p>';
	modal_msg += '<div id="advanced-controls-dialog">';
	
	modal_msg  += '<p style="text-align:center;font-size:14pt;font-family:helvetica;margin-top:22px;">Show/Hide ABC Features</p>'
	modal_msg  += '<p style="text-align:center;">'
	modal_msg  += '<input id="toggleannotations" class="advancedcontrolsdisabled btn btn-advancedcontrols" onclick="ToggleAnnotations(false)" type="button" value="Hide Annotations" title="Hides/Shows common annotations in the ABC notation">';
	modal_msg  += 	'<input id="toggletext" class="advancedcontrolsdisabled btn btn-advancedcontrols" onclick="ToggleTextAnnotations(false)" type="button" value="Hide Text" title="Hides/Shows any text in the ABC notation.">';
	modal_msg  += 	'<input id="togglechords" class="advancedcontrolsdisabled btn btn-advancedcontrols" onclick="ToggleChords(false)" type="button" value="Hide Chords + Injected Tab" title="Hides/Shows any chords in the ABC notation.&nbsp;&nbsp;Also hides any Box or Anglo Concertina tablature.">';
	modal_msg  += '</p>';
	
	modal_msg += '<p style="text-align:center;font-size:14pt;font-family:helvetica;margin-top:22px;">Strip ABC Features</p>'
	modal_msg  += '<p style="text-align:center;">';
	modal_msg  += '<input id="stripannotations" class="advancedcontrolsdisabled btn btn-injectcontrols" onclick="ToggleAnnotations(true)" type="button" value="Strip Annotations" title="Strips common annotations from the ABC">';
	modal_msg  += 	'<input id="striptext" class="advancedcontrolsdisabled btn btn-injectcontrols" onclick="ToggleTextAnnotations(true)" type="button" value="Strip Text" title="Strips all text from the ABC">';
	modal_msg  += 	'<input id="stripchords" class="advancedcontrolsdisabled btn btn-injectcontrols" onclick="ToggleChords(true)" type="button" value="Strip Chords + Injected Tab" title="Strips all chords from the ABC.&nbsp;&nbsp;Also strips any Box or Anglo Concertina tablature.">';
	modal_msg  += '</p>';
	modal_msg += '<p style="text-align:center;font-size:14pt;font-family:helvetica;margin-top:22px;">ABC Injection Features</p>'
	modal_msg  += '<p style="text-align:center;">'
	modal_msg  += '<input id="injectallheaders" class="advancedcontrols btn btn-injectcontrols-headers" onclick="InjectPDFHeaders(true)" type="button" value="Inject All PDF Annotations" title="Injects all available tool-specific PDF tunebook annotations for title page, table of contents, index generation, etc. at the top of the ABC">';	
	modal_msg  += '<input id="injectheadertemplate" class="advancedcontrols btn btn-injectcontrols-headers" onclick="InjectPDFHeaders(false)" type="button" value="Inject PDF Tunebook Annotations Template" title="Injects a template of common useful PDF tunebook annotations at the top of the ABC">';
	modal_msg  += '<p style="text-align:center;margin-top:22px;">';
	modal_msg  += '<input id="injectmelody" class="advancedcontrols btn btn-injectcontrols-headers" onclick="InjectMIDIInstrument(false);" type="button" value="Inject MIDI Melody" title="Injects %%MIDI program melody annotation into all tunes in the ABC">';	
	modal_msg  += '<input id="injectchords" class="advancedcontrols btn btn-injectcontrols-headers" onclick="InjectMIDIInstrument(true);" type="button" value="Inject MIDI Bass/Chord" title="Injects %%MIDI chordprog bass/chord annotation into all tunes in the ABC">';
	modal_msg  += '<input id="injectstaffwidth" class="advancedcontrols btn btn-injectcontrols-headers" onclick="InjectStaffWidth()" type="button" value="Inject %%staffwidth" title="Injects a %%staffwidth annotation at the top of every tune">';
	modal_msg  += '</p>';
	modal_msg  += '<p style="text-align:center;margin-top:22px;">';
	modal_msg  += '<input id="injectsoundfont" class="advancedcontrols btn btn-injectcontrols-headers" onclick="InjectSoundfont()" type="button" value="Inject %abcjs_soundfont" title="Injects a %abcjs_soundfont annotation at the top of every tune">';
		modal_msg  += '<input id="injectclicktrackall" class="advancedcontrols btn btn-injectcontrols-headers" onclick="InjectRepeatsAndClickTrackAll()" type="button" value="Inject Repeats and Two-Bar Click Intros" title="Injects repeated copies of tunes and optional style-adaptive two-bar click intros into every tune">';	
	modal_msg  += '</p>';
	modal_msg  += '<p style="text-align:center;margin-top:22px;">'
	modal_msg  += '<input id="injectnotenames" class="advancedcontrols btn btn-injectcontrols" onclick="DoInjectABCNoteNameLyrics()" type="button" value="Inject Note Name Lyrics" title="Injects note names as lyrics in the ABC">';
	modal_msg  += '<input id="injectbctab" class="advancedcontrols btn btn-injectcontrols" onclick="DoInjectTablature_BC()" type="button" value="Inject B/C Box Tab" title="Injects B/C box tablature into the ABC">';
	modal_msg  += '<input id="injectcdtab" class="advancedcontrols btn btn-injectcontrols" onclick="DoInjectTablature_CsD()" type="button" value="Inject C#/D Box Tab" title="Injects C#/D box tablature into the ABC">';
	modal_msg  += '</p>';
	modal_msg  += '<p style="text-align:center;margin-top:22px;">'
	modal_msg  += '<input id="injectanglotab" class="advancedcontrols btn btn-injectcontrols" onclick="DoInjectTablature_Anglo()" type="button" value="Inject Anglo Concertina Tab" title="Injects Anglo Concertina tablature into the ABC">';
	modal_msg  += '<input id="injectbambooflute" class="advancedcontrols btn btn-injectcontrols" onclick="DoInjectTablature_Bamboo_Flute()" type="button" value="Inject Bamboo Flute Tab" title="Injects Bamboo flute tablature into the ABC">';
	modal_msg  += '</p>';
	modal_msg  += '<p style="text-align:center;margin-top:22px;"><input id="configure_box_advanced" class="btn btn-subdialog configure_box_advanced " onclick="ConfigureTablatureSettings()" type="button" value="Configure Tablature Injection Settings" title="Configure the tablature injection settings"></p>';	
	modal_msg  += '<p style="text-align:center;margin-top:22px;"><input id="configure_batch_mp3_export" class="btn btn-batchmp3export configure_batch_mp3_export " onclick="BatchMP3Export()" type="button" value="Export all Tunes as MP3" title="Exports all the tunes in the ABC text area as .mp3 files"></p>';	
	modal_msg += '</div>';

	setTimeout(function(){

		// Do an initial idle on the controls
		IdleAdvancedControls(true);

		// Idle the show tab names control
		IdleAllowShowTabNames();

	}, 200);


	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 20, width: 700,  scrollWithPage: (gIsIOS || gIsAndroid) }).then(function(){
					
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

	var bAlwaysInjectPrograms = gAlwaysInjectPrograms;

	var theMelodyProgram = gTheMelodyProgram;
	var theChordProgram = gTheChordProgram;

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

	// Setup initial values
	const theData = {
	  configure_inject_programs: bAlwaysInjectPrograms,
	  configure_melody_program: theMelodyProgram,
	  configure_chord_program: theChordProgram,
	  configure_inject_volumes: bAlwaysInjectVolumes,
	  configure_bass_volume: theBassVolume,
	  configure_chord_volume: theChordVolume,
	  configure_override_play_midi_params: bOverridePlayMIDIParams,
	  configure_fullscreen_scaling: theFullScreenScaling,
	  configure_staff_spacing: theOldStaffSpacing,
	  configure_large_player_controls: gLargePlayerControls,
	  configure_show_tab_names: gShowTabNames,
	  configure_capo: gCapo,
	  configure_mp3_bitrate: gMP3Bitrate,
	  configure_soundfont: gDefaultSoundFont,
	  configure_autoscrollplayer: gAutoscrollPlayer,
	  configure_use_custom_gm_sounds: gUseCustomGMSounds,	  
	};

 	const sound_font_options = [
	    { name: "  Fluid", id: "https://paulrosen.github.io/midi-js-soundfonts/FluidR3_GM/" },
	    { name: "  Musyng Kite", id: "https://paulrosen.github.io/midi-js-soundfonts/MusyngKite/" },
	    { name: "  FatBoy", id: "https://paulrosen.github.io/midi-js-soundfonts/FatBoy/" },
  	];

	const form = [
	  {html: '<p style="text-align:center;font-size:16pt;font-family:helvetica;margin-left:50px;">ABC Transcription Tools Settings&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="http://michaeleskin.com/abctools/userguide.html#settings_dialog" target="_blank" style="text-decoration:none;">💡</a></span></p>'},
	  {name: "Full screen tune display scaling (percentage):", id: "configure_fullscreen_scaling", type:"number", cssClass:"configure_settings_form_text"},
	  {name: "Staff spacing (default is 10):", id: "configure_staff_spacing", type:"number", cssClass:"configure_settings_form_text"},
	  {html: '<p style="font-size:4pt;font-family:helvetica">&nbsp;</p>'},	  
	  {name: "    Show stringed instrument names on tablature (never shown in the Player)", id: "configure_show_tab_names", type:"checkbox", cssClass:"configure_box_settings_form_text"},
	  {name: "Stringed instrument capo fret postion:", id: "configure_capo", type:"number", cssClass:"configure_settings_form_text"},
	  {name: "            Use Default Melody and Bass/Chord programs when playing tunes", id: "configure_inject_programs", type:"checkbox", cssClass:"configure_settings_form_text"},
	  {name: "Default Melody MIDI program (0-136 or mute):", id: "configure_melody_program", type:"number", cssClass:"configure_settings_form_text"},
	  {name: "Default Bass/Chords MIDI program (0-136 or mute):", id: "configure_chord_program", type:"number", cssClass:"configure_settings_form_text"},
	  {name: "            Use Default Bass/Chord volumes when playing tunes", id: "configure_inject_volumes", type:"checkbox", cssClass:"configure_settings_form_text"},
	  {name: "Default Bass MIDI volume (0-127):", id: "configure_bass_volume", type:"number", cssClass:"configure_settings_form_text"},
	  {name: "Default Chords MIDI volume (0-127):", id: "configure_chord_volume", type:"number", cssClass:"configure_settings_form_text"},
	  {name: "            Override all MIDI programs and volumes in the ABC when playing tunes", id: "configure_override_play_midi_params", type:"checkbox", cssClass:"configure_settings_form_text"},
	  {name: "            Autoscroll player when playing", id: "configure_autoscrollplayer", type:"checkbox", cssClass:"configure_settings_form_text"},
	  {name: "Default abcjs soundfont:", id: "configure_soundfont", type:"select", options:sound_font_options, cssClass:"configure_settings_select"}, 
	  {name: "    Use AppCordions custom sounds for Dulcimer, Accordion, Flute, and Whistle", id: "configure_use_custom_gm_sounds", type:"checkbox", cssClass:"configure_settings_form_text"},
	  {name: "MP3 audio export bitrate (kbit/sec):", id: "configure_mp3_bitrate", type:"number", cssClass:"configure_settings_form_text"},
	  {name: "    Player uses large controls (easier to touch on mobile and tablet)", id: "configure_large_player_controls", type:"checkbox", cssClass:"configure_settings_form_text"},
	  {html: '<p style="text-align:center;"><input id="configure_fonts" class="btn btn-subdialog configure_fonts" onclick="ConfigureFonts()" type="button" value="Configure ABC Fonts" title="Configure the fonts used for rendering the ABC"><input id="configure_box" class="btn btn-subdialog configure_box" onclick="ConfigureTablatureSettings()" type="button" value="Configure Tablature Injection Settings" title="Configure the tablature injection settings"><input id="configure_musicxml_import" class="btn btn-subdialog configure_musicxml_import" onclick="ConfigureMusicXMLImport()" type="button" value="Configure MusicXML Import" title="Configure MusicXML import parameters"></p>'},	  
	];

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 10, width: 780, scrollWithPage: (gIsIOS || gIsAndroid) } ).then(function(args){

		// Get the results and store them in the global configuration
		if (!args.canceled){

			gAlwaysInjectPrograms = args.result.configure_inject_programs;
			gTheMelodyProgram = args.result.configure_melody_program;
			gTheChordProgram = args.result.configure_chord_program;

			gAlwaysInjectVolumes = args.result.configure_inject_volumes;
			gTheBassVolume = args.result.configure_bass_volume;
			gTheChordVolume = args.result.configure_chord_volume;

			gOverridePlayMIDIParams = args.result.configure_override_play_midi_params;

			gLargePlayerControls = args.result.configure_large_player_controls;

			gShowTabNames = args.result.configure_show_tab_names;

			// Validate the staff spacing value
			var testStaffSpacing = args.result.configure_staff_spacing;

			testStaffSpacing = parseInt(testStaffSpacing);

			if (!((isNaN(testStaffSpacing)) || (testStaffSpacing == undefined))){

				// Limit is the negative staffsep offset
				if (testStaffSpacing < (-1*STAFFSPACEOFFSET)){
					testStaffSpacing = (-1*STAFFSPACEOFFSET);
				}

				if (testStaffSpacing != theOldStaffSpacing){

					SetStaffSpacing(testStaffSpacing);

				}
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

				       	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 50, width: 600, scrollWithPage: (gIsIOS || gIsAndroid) }).then(function(){

						   	// Focus back on the ABC after the dialog is dismissed
							gTheABC.focus();
			       		
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

			gUseCustomGMSounds = args.result.configure_use_custom_gm_sounds;

			// If changing the custom GM sounds setting, clear the abcjs sample cache
			if (gUseCustomGMSounds != theOldUseCustomGMSounds){

				// Reset the abcjs sounds cache
				gSoundsCacheABCJS = {};				
			}

			IdleAllowShowTabNames();

			// Update local storage
			SaveConfigurationSettings();

			// Do we need to re-render
			if ((theOldShowTabNames != gShowTabNames) || (gAllowShowTabNames && (gCapo != theOldCapo))){
				
				RenderAsync(true, null, function(){

					// Focus back on the ABC after the dialog is dismissed
					gTheABC.focus();

				});

			}
			

		}
		else{

			// Focus back on the ABC after the dialog is dismissed
			gTheABC.focus();

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
// Import MusicXML format
//
function importMusicXML(theXML){
 
    var xmldata = $.parseXML (theXML);    // abc_code is a (unicode) string with one abc tune.

    // var options = { u:0, b:4, n:0,  // unfold repeats (1), bars per line, chars per line
    //                 c:0, v:0, d:0,  // credit text filter level (0-6), no volta on higher voice numbers (1), denominator unit length (L:)
    //                 m:0, x:0, t:0,  // no midi, minimal midi, all midi output (0,1,2), no line breaks (1), perc, tab staff -> voicemap (1)
    //                 v1:0, noped:0,  // all directions to first voice of staff (1), no pedal directions (1)
    //                 stm:0,          // translate stem elements (stem direction)
    //                 p:'', s:0 };   // page format: scale (1.0), width, left- and right margin in cm, shift note heads in tablature (1)

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

							DayPilot.Modal.alert("This is not a valid MXL file.",{ theme: "modal_flat", top: 50, scrollWithPage: (gIsIOS || gIsAndroid) });

			     			return;

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

						}
						else{

							gTheABC.value = theText;

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

							// Render the notation
							RenderAsync(true,null,function(){

								if (!(gIsIOS || gIsAndroid)){

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

					DayPilot.Modal.alert("This is not a valid MXL file.",{ theme: "modal_flat", top: 50, scrollWithPage: (gIsIOS || gIsAndroid) });

					return;

			    });

			    return;

		    }, function() {

				DayPilot.Modal.alert("This is not a valid MXL file.",{ theme: "modal_flat", top: 50, scrollWithPage: (gIsIOS || gIsAndroid) });

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

			}
			else{

				gTheABC.value = theText;

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

				// Render the notation
				RenderAsync(true,null,function(){

					if (!(gIsIOS || gIsAndroid)){
						
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
// Drag/drop handler
//
function DoDrop(e){

    e.stopPropagation ();
    e.preventDefault ();

    var drop_files = e.dataTransfer.files;

	let file = drop_files[0];

	DoFileRead(file,true);
}


function DoStartup() {

	// Init global state
	gShowAdvancedControls = false;
	gShowShareControls = false;
	gStripAnnotations = false;
	gStripTextAnnotations = false;
	gStripChords = false;
	gRenderingPDF = false;
	gAllowSave = false;
	gAllowURLSave = false;
	gShowAllControls = false;
	gAllowControlToggle = false
	gAllowFilterAnnotations = false;
	gAllowFilterText = false;
	gAllowFilterChords = false;
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

	// Startup in blank screen
	
	HideMaximizeButton();
	DoMaximize();

	// Get platform info for later UI adaption

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

	// Are we on iOS?
	gIsIOS = false;
	if (isIOS()) {
		gIsIOS = true;
	}
	
	// Are we on an iPad?
	gIsIPad = false;
	if (isIPad()) {
		gIsIPad = true;
	}

	// Are we on an iPhone?
	gIsIPhone = false;
	if (isIPhone()) {
		gIsIPhone = true;
	}

	// Are we on Android?
	gIsAndroid = false;

	if (isAndroid()){
		gIsAndroid = true;
	}

	if (gIsIOS){
		document.getElementById("selectabcfile").removeAttribute("accept");
	}	

	//
	// iOS and Android styling adaptation
	//
	// Single column stacked blocks
	//
	if (gIsIOS || gIsAndroid) {

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
		elem = document.getElementById("notation-holder");
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
			
			if (!gForceFullRender){

		    	OnABCTextChange();

		    }
		    else{

		    	RenderAsync(true,null);

		    }

		    gForceFullRender = false;

		}, DEBOUNCEMS);


	//
	// Hook up the text area text paste callback to re-render
	// Required because a paste might end up with the same number of tunes and
	// the text change logic only re-renders if the number of tunes has changed
	// because of a text entry event
	//
	// document.getElementById('abc').onpaste = 
	// 	function(){
			
	// 		// Refocus back on the ABC
	// 		setTimeout(function(){
	// 			gTheABC.focus();
	// 			gTheABC.selectionStart = gTheABC.selectionStart-1;
	//     		gTheABC.selectionEnd = gTheABC.selectionStart;

	// 		},250);

	// 	};

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

			DayPilot.Modal.alert("Please select an ABC or MusicXML file",{ theme: "modal_flat", top: 50, scrollWithPage: (gIsIOS || gIsAndroid) });

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

	// Check for and process URL share link
	var isFromShare = processShareLink();

	// Not from a share, show the UI
	if (!isFromShare){

		DoMinimize();

		// Show the notation placeholder
		document.getElementById("notation-placeholder").style.display = "block";

		// Update the application state from local storage if available
		restoreStateFromLocalStorage();

	}
	else{

		// First time using the tool?
		if (isFirstRun()){

			// Show zoom instructions screen
			showZoomInstructionsScreen();

		}

		// Save the state in the share link to local storage
		UpdateLocalStorage();

	}

	// Recalculate the notation top position
	UpdateNotationTopPosition();

	// Force recalculation of the notation top position on ABC text area resize

	new ResizeObserver(TextBoxResizeHandler).observe(gTheABC);

	if (!(gIsIOS || gIsAndroid)){

		// Hook window resize events
		window.onresize = function(){

			HandleWindowResize();
		
		}

	}

	// And call it once for the initial setup
	HandleWindowResize();

	// 
	// Initially show the controls as soon as some ABC is entered
	//
	ShowAllControls();


	if (!isFromShare){
		document.getElementById("toggleallcontrols").classList.add("toggleallcontrolsdisabled");
		document.getElementById("notenrechts").style.display = "none";
		gAllowControlToggle = false;
	}

	//
	// Add drag-and-drop handlers on desktop browsers 
	//
	if (!(gIsIOS || gIsAndroid)){

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



