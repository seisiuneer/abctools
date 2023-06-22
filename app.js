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
var gPlaybackHyperlinkProgram = "";


// Global reference to the ABC editor
var gTheABC = document.getElementById("abc");

//
// Tune utility functions
// 

//
// Get the text area character offset to the start of a specific tune by index
//
function findTuneOffsetByIndex(tuneIndex){	
	
	if (tuneIndex == 0){
		return 0;
	}
	
	var theNotes = gTheABC.value;

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

    // And set the focus
    gTheABC.focus();

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

		var output = "";

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

					alert("Unable to tranpose one or more tunes.");
					
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

function TransposeUp() {

	Transpose(1);

}

//
// Tranpose the ABC down one semitone
//

function TransposeDown() {

	Transpose(-1);

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

	ClearNoRender();

	RenderAsync(true,null);

	// And set the focus
    gTheABC.focus();

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

	HideAllControls();


}

//
// PDF conversion shared globals
//

// Rendering offsets based on paper size
var PAGENUMBERTOP = 296;
var PAGENUMBERTOPA4 = 313;
var PAGETOPOFFSET = 32;
var PAGEBOTTOMOFFSET = 32; //FOOFOO was 0
var PAGELEFTOFFSET = 37;
var PAGELEFTOFFSETA4 = 29;
var PAGEHEIGHTLETTER = 792;
var PAGEHEIGHTA4 = 842;
var BETWEENTUNESPACE = 20;

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

// Did they request an tunebook TOC?
var TunebookTOCRequested = false;
var theTunebookTOCTitle = "";

// Did they request a sorted tunebook TOC?
var TunebookSortedTOCRequested = false;
var theTunebookSortedTOCTitle = "";

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

		  const nameA = a.name.toUpperCase(); // ignore upper and lowercase
		  
		  const nameB = b.name.toUpperCase(); // ignore upper and lowercase
		  
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

			if (gPlaybackHyperlinkProgram != ""){

				tuneWithPatch = "%%MIDI program "+gPlaybackHyperlinkProgram+"\n"+tuneWithPatch;

			}

			var theData = encodeURIComponent(tuneWithPatch);

			theLinks[i].url = "https://editor.drawthedots.com?t="+theData;

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
				
			thePatch = thePatch.trim();

			if (thePatch != ""){

				tuneWithPatch = "%%MIDI program "+thePatch+"\n"+tuneWithPatch;

			}

			var theData = encodeURIComponent(tuneWithPatch);

			theLinks[i].url = "https://editor.drawthedots.com?t="+theData;

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

		  const nameA = a.name.toUpperCase(); // ignore upper and lowercase
		  
		  const nameB = b.name.toUpperCase(); // ignore upper and lowercase
		  
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

		  const nameA = a.name.toUpperCase(); // ignore upper and lowercase
		  
		  const nameB = b.name.toUpperCase(); // ignore upper and lowercase
		  
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

		// Need to have the share link available in the urltextbox
		FillUrlBoxWithAbcInLZW();

		// Can we make a QR code from the current share link URL?
		theURL = document.getElementById("urltextbox").value;

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
	gPlaybackHyperlinkProgram = "";

	// Search for a playback link request
	searchRegExp = /^%add_all_playback_links.*$/m

	// Detect playback link annotation
	var addPlaybackHyperlinks = theNotes.match(searchRegExp);

	if ((addPlaybackHyperlinks) && (addPlaybackHyperlinks.length > 0)){

		gAddPlaybackHyperlinks = true;

		var thePatch = addPlaybackHyperlinks[0].replace("%add_all_playback_links","");
		
		gPlaybackHyperlinkProgram = thePatch.trim();
		
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
	// console.log("gPlaybackHyperlinkProgram = "+gPlaybackHyperlinkProgram);

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

	DayPilot.Modal.prompt("Please enter a filename for your PDF file:", placeholder+".pdf",{ theme: "modal_flat", top: 194, autoFocus: false }).then(function(args) {

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
	BETWEENTUNESPACE = 20;

	if (incipitsRequested){

		// Reduce the space between tunes in the PDF for incipits
		BETWEENTUNESPACE = 0;

		// Force an idle on the advanced controls to determine if we need to hide the annotations or text annotations before incipit render
		IdleAdvancedControls(true);

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
					theLabel = 'GCDA'+postfix;
					break;

				case "guitare":
					theLabel = "Guitar"+postfix;
					break;

				case "guitard":
					theLabel = "DADGAD"+postfix;
					break;
			}
		}
	}

	// Shared font format between all tab styles
	var tFont = "Times-Roman 18";
	var pFont = "Times-Roman 13.5";

	var commonFontFormat = 
	{
		titlefont: tFont,
		subtitlefont: pFont,
		infofont: pFont,
		partsfont: pFont,
		tempofont: pFont,
		textfont: pFont,
		composerfont: pFont,
		annotationfont: pFont,
		partsfont: pFont,
		gchordfont: "Verdana 12",
		vocalfont: pFont,
		wordsfont: pFont,
		tabnumberfont: "Arial 12"
	};

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
		instrument = ""; 
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

		var capo = document.getElementById("capo").value;
		localStorage.abcCapo = capo;

		var ssp = document.getElementById("staff-spacing").value;
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
// Recalc URL on PDF settings change
//
function RecalcShareURLPDF(){

	// If available, save all the app settings to local storage
	UpdateLocalStorage();

	// Since this is a Share URL parameter, update URL if required
	if (document.getElementById("urlarea").style.display != "none") {

		FillUrlBoxWithAbcInLZW();

	}

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

	//
	// Keep track of how long it takes to render the notation 
	//

	// Get the current time for possible progress banner display
	//currentTime = Date.now();

	var visualObj = ABCJS.renderAbc(renderDivs, tune, params);

	// How long did it take to render?
	// var deltaTime = Date.now() - currentTime;

	//console.log("deltaTime = "+deltaTime);

	var svgTextArray = [];

	for (var tuneIndex = startTune; tuneIndex < endTune; ++tuneIndex) {

		var renderDivID = "notation" + tuneIndex;

		// Bei Whistle rendert er zunächst erst eine Linie mit Mandolinentabs, also Zahlen.
		// Diese werden hier anschließend ersetzt durch Buchstaben. 
		// Die Elemente, wo die drin sind heißen tspan - die kriegen zusätzlich die Klasse "whistle", die wir über CSS vordefinieren.
		if (instrument == "whistle") {

			// hiermit findet er alle g's, die eine Tabzahl sind. 
			var Tabstriche = document.querySelectorAll('div[id="' + renderDivID + '"] > div > svg > g > g > [class="abcjs-top-line"]');

			for (x = 0; x < Tabstriche.length; x++) {

				// Wenn es nur Note und Tab geht - nur beim Tab die Linien ausblenden.
				if (x % 2 != 0) {

					Tabstriche[x].setAttribute("class", "tabstrich");

					var Geschwisterstriche = getNextSiblings(Tabstriche[x]);

					for (y = 0; y < Geschwisterstriche.length; y++) {
						Geschwisterstriche[y].setAttribute("class", "tabstrich");
					}

				}
			}

			var Tspans = document.querySelectorAll('div[id="' + renderDivID + '"] > div > svg > g > g[data-name="tabNumber"] > text > tspan');

			// Sämtliche Tspan Tags, die zu Tags und nicht Noten gehören, haben jetzt Zahlen auf einem String (D). Diese können jetzt in Whistle Tags umgewandelt werden.
			// Dazu werden die Buchstaben mit dem jeweiligen Unicode Buchstaben des TinWhistleFingering Fonts ersetzt.
			for (x = 0; x < Tspans.length; x++) {
				
				Tspans[x].setAttribute("class", "whistle");

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

			// hiermit findet er alle g's, die eine Tabzahl sind. 
			var Tabstriche = document.querySelectorAll('div[id="' + renderDivID + '"] > div > svg > g > g > [class="abcjs-top-line"]');

			for (x = 0; x < Tabstriche.length; x++) {
				// Wenn es nur Note und Tab geht - nur beim Tab die Linien ausblenden.
				if (x % 2 != 0) {
					Tabstriche[x].setAttribute("class", "tabstrich");

					var Geschwisterstriche = getNextSiblings(Tabstriche[x]);
					for (y = 0; y < Geschwisterstriche.length; y++) {
						Geschwisterstriche[y].setAttribute("class", "tabstrich");
					}
				}
			}

			// Walk the SVGs
			var Svgs = document.querySelectorAll('div[id="' + renderDivID + '"] > div > svg');

			if (Svgs && (Svgs.length > 1)) {

				for (var i = 1; i < Svgs.length; ++i) {

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
						// Sämtliche Tspan Tags, die zu Tags und nicht Noten gehören, haben jetzt Zahlen auf einem String (D). Diese können jetzt in Whistle Tags umgewandelt werden.
						// Dazu werden die Buchstaben mit dem jeweiligen Unicode Buchstaben des TinWhistleFingering Fonts ersetzt.
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

		if (document.getElementById("urlarea").style.display != "none") {
			FillUrlBoxWithAbcInLZW();
		}

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

		// Idle the advanced controls
		IdleAdvancedControls(false);

		// Idle the capo control
		IdleCapoControl();

		// Idle the show tab names control
		IdleShowTabNamesControl();

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

	if ((fileExtension.toLowerCase() == "abc") || (fileExtension.toLowerCase() == "txt")) {
		return true;
	} else {
		alert("You must select a .abc or .txt file for upload");
		return false;
	}
}

//
// Hide the advanced controls
//
function HideAdvancedControls() {

	document.getElementById('toggleadvancedcontrols').value = "Show Advanced";

	document.getElementById('advanced-controls').style.display = "none";

}


//
// Show the advanced controls
//
function ShowAdvancedControls() {

	document.getElementById('toggleadvancedcontrols').value = "Hide Advanced";

	document.getElementById('advanced-controls').style.display = "flex";

	// Idle the controls
	IdleAdvancedControls(false);

}

//
// Idle the advanced controls
//
function IdleAdvancedControls(bForce){

	if ((gShowAllControls && gShowAdvancedControls) || bForce){

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

			// Enable the Toggle Annotations button
			document.getElementById("toggleannotations").classList.remove("advancedcontrolsdisabled");
			document.getElementById("toggleannotations").classList.add("advancedcontrols");	
		}
		else{

			gAllowFilterAnnotations = false;

			// Disable the Toggle Annotations button
			document.getElementById("toggleannotations").classList.remove("advancedcontrols");
			document.getElementById("toggleannotations").classList.add("advancedcontrolsdisabled");				
		}

		if (EnableText){

			gAllowFilterText = true;

			// Enable the Toggle Text button
			document.getElementById("toggletext").classList.remove("advancedcontrolsdisabled");
			document.getElementById("toggletext").classList.add("advancedcontrols");	
		}
		else{

			gAllowFilterText = false;

			// Disable the Toggle Text button
			document.getElementById("toggletext").classList.remove("advancedcontrols");
			document.getElementById("toggletext").classList.add("advancedcontrolsdisabled");				
		}

		if (EnableChords){

			gAllowFilterChords = true;

			// Enable the Toggle Chords button
			document.getElementById("togglechords").classList.remove("advancedcontrolsdisabled");
			document.getElementById("togglechords").classList.add("advancedcontrols");	
		}
		else{

			gAllowFilterChords = false;

			// Disable the Toggle Chords button
			document.getElementById("togglechords").classList.remove("advancedcontrols");
			document.getElementById("togglechords").classList.add("advancedcontrolsdisabled");				
		}

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

	}
}

//
// Toggle the advanced controls
//
function ToggleAdvancedControls() {

	gShowAdvancedControls = !gShowAdvancedControls;

	if (gShowAdvancedControls) {

		ShowAdvancedControls();

	} else {

		HideAdvancedControls();

	}

	// Recalculate the notation top position
	UpdateNotationTopPosition();

	// Force a rescroll for one column view
	if (gIsOneColumn){

		MakeTuneVisible(true);

	}

}

//
// Hide the share controls
//
function HideShareControls() {

	document.getElementById('togglesharecontrols').value = "Show Sharing";

	// Also hide the share url area
	document.getElementById('urlarea').style.display = "none";

}

//
// Show the share controls
//
function ShowShareControls() {

	document.getElementById('togglesharecontrols').value = "Hide Sharing";

	CreateURLfromHTML();

}

//
// Toggle the share controls
//
function ToggleShareControls() {

	gShowShareControls = !gShowShareControls;

	if (gShowShareControls) {

		ShowShareControls();

	} else {

		HideShareControls();

	}

	// Recalculate the notation top position
	UpdateNotationTopPosition();

	// Force a rescroll for one column view
	if (gIsOneColumn){

		MakeTuneVisible(true);
		
	}

}

//
// Handle the spacing control
//
function SetStaffSpacing() {

	var newSpacing = document.getElementById('staff-spacing').value;
	
	newSpacing = parseInt(newSpacing);

	gStaffSpacing = newSpacing + STAFFSPACEOFFSET;


	RenderAsync(true,null);
}

//
// Handle the capo control
//
function SetCapo() {

	gCapo = document.getElementById('capo').value;

	RenderAsync(true,null);
}

//
// Idle the capo control
//
function IdleCapoControl(){

	var format = GetRadioValue("notenodertab");

	var enableCapo = false;

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
			enableCapo = true;
			break;

	}

	if (enableCapo){

		// Enable the capo control
		document.getElementById("capo").disabled = false;

	}
	else{
		// Disable the capo control
		document.getElementById("capo").disabled = true;
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

	// Idle the advanced controls
	IdleAdvancedControls(false);

	// Recalculate the notation top position
	UpdateNotationTopPosition();

}

//
// Toggle annotations
//
function ToggleAnnotations(e) {

	if (!gAllowFilterAnnotations){

		return;

	}


	// Shift-click strips the annotations in the actual ABC and re-renders
	if (e.shiftKey){

		StripAnnotations();
		
		RenderAsync(true,null);

		return;
	}


	gStripAnnotations = !gStripAnnotations;

	RenderAsync(true,null);

}

//
// Toggle text
//
function ToggleTextAnnotations(e) {

	if (!gAllowFilterText){

		return;

	}

	// Shift-click strips the text annotations in the actual ABC and re-renders
	if (e.shiftKey){

		StripTextAnnotations();
		
		RenderAsync(true,null);

		return;
	}
	

	gStripTextAnnotations = !gStripTextAnnotations;

	RenderAsync(true,null);

}

//
// Toggle chords
//
function ToggleChords(e) {

	if (!gAllowFilterChords){

		return;
	
	}

	// Shift-click strips the text annotations in the actual ABC and re-renders
	if (e.shiftKey){

		StripChords();
		
		RenderAsync(true,null);

		return;
	}


	gStripChords = !gStripChords;

	RenderAsync(true,null);

}



//
// Create a template for a new ABC file
//
function NewABC(){

	// Stuff in some default ABC with additional options explained
	var theValue = "X: 1\n";
	theValue += "T: New Tune\n";
	theValue += "R: Reel\n";
	theValue += "M: 4/4\n";
	theValue += "L: 1/8\n";
	theValue += "K: Gmaj\n";
	theValue += "C: Gan Ainm\n";
	theValue += "%%MIDI program 74\n";
	theValue += "%\n";
	theValue += "% Enter the ABC for your tune(s) below:\n";
	theValue += "%\n";
	theValue += "|:d2dA BAFA|ABdA BAFA|ABde fded|Beed egfe:|\n\n";
	theValue += "%\n";
	theValue += "% To choose the sound when played, change the MIDI program # above to:\n";
	theValue += "%\n";
	theValue += "% 74 - Flute, 49 - Fiddle, 23 - Accordion, 25 - Guitar, or 0 - Piano\n";
	theValue += "%\n";
	theValue += "\n";
	theValue += "% Try these custom PDF page annotations by removing the % and the space\n";
	theValue += "%\n";
	theValue += "% Set the PDF quality (1.0 is highest quality, 0.5 is good quality):\n";
	theValue += "%\n";
	theValue += "% %pdfquality 0.75\n";
	theValue += "%\n";
	theValue += "% Before the tunes, add a title page with a title:\n";
	theValue += "%\n";
	theValue += "% %addtitle My Tunebook Title Page Title\n";
	theValue += "%\n";
	theValue += "% Optional subtitle for the title page:\n";
	theValue += "%\n";
	theValue += "% %addsubtitle My Tunebook Title Page Subtitle\n";
	theValue += "%\n";
	theValue += "% Add a title page with a title as a hyperlink:\n";
	theValue += "%\n";
	theValue += "% %urladdtitle http://michaeleskin.com Title as Hyperlink\n";
	theValue += "%\n";
	theValue += "% Optional subtitle for the title page as a hyperlink:\n";
	theValue += "%\n";	
	theValue += "% %urladdsubtitle http://michaeleskin.com Subtitle as Hyperlink\n";
	theValue += "%\n";	
	theValue += "% Before the tunes, add a table of contents with a title:\n";
	theValue += "%\n";
	theValue += "% %addtoc My Tunebook Table of Contents\n";
	theValue += "%\n";
	theValue += "% Before the tunes, add a sorted table of contents with a title:\n";
	theValue += "%\n";
	theValue += "% %addsortedtoc My Tunebook Table of Contents Sorted by Tune Name\n";
	theValue += "%\n";
	theValue += "% Add a << link on each page back to the Table of Contents:\n";
	theValue += "%\n";
	theValue += "% %addlinkbacktotoc\n";
	theValue += "%\n";	
	theValue += "% After the tunes, add an unsorted tunebook index with a title:\n";
	theValue += "%\n";
	theValue += "% %addindex My Tunebook Unsorted Index\n";
	theValue += "%\n";
	theValue += "% After the tunes, add a sorted tunebook index with a title:\n";
	theValue += "%\n";
	theValue += "% %addsortedindex My Tunebook Index Sorted by Tune Name\n";
	theValue += "%\n";
	theValue += "% Add a << link on each page back to the Index:\n";
	theValue += "%\n";
	theValue += "% %addlinkbacktoindex\n";
	theValue += "%\n";	
	theValue += "% Add a PDF page header or footer:\n";
	theValue += "%\n";
	theValue += "% %pageheader My Tune Set: $TUNENAMES\n";
	theValue += "% %pagefooter PDF named: $PDFNAME saved on: $DATEMDY at $TIME\n";
	theValue += "%\n";
	theValue += "% Add a PDF page header or footer as a hyperlink:\n";
	theValue += "%\n";
	theValue += "% %urlpageheader http://michaeleskin.com Page Header as Hyperlink\n";
	theValue += "% %urlpagefooter http://michaeleskin.com Page Footer as Hyperlink\n";
	theValue += "%\n";
	theValue += "% Add a PDF hyperlink from every tune back to thesession.org\n";
	theValue += "%\n";
	theValue += "% %add_all_links_to_thesession\n";
	theValue += "%\n";
	theValue += "% Add a PDF hyperlink from every tune back to Paul Rosen's ABC Quick Editor for playback. Use a flute sound for playback.\n";
	theValue += "%\n";
	theValue += "% %add_all_playback_links 74\n";
	theValue += "%\n";
	theValue += "% Add a PDF hyperlink for this tune:\n";
	theValue += "%\n";	
	theValue += "% %hyperlink http://michaeleskin.com\n";	
	theValue += "%\n";	
	theValue += "% Add a PDF hyperlink for this tune back to thesession.org\n";
	theValue += "%\n";	
	theValue += "% %add_link_to_thesession\n";	
	theValue += "%\n";	
	theValue += "% Add a PDF hyperlink for this tune back to Paul Rosen's ABC Quick Editor for playback. Use a fiddle sound for playback.\n";
	theValue += "%\n";	
	theValue += "% %add_playback_link 49\n";	
	theValue += "%\n";	
	theValue += "% After the tunes, add a sharing QR code on a new page in the PDF:\n";
	theValue += "%\n";
	theValue += "% %qrcode\n";
	theValue += "%\n";

	gTheABC.value = theValue;

	// Refocus back on the ABC
	FocusABC();

	// Reset the displayed name base
	gDisplayedName = "No ABC file selected";

	gABCFromFile = false;
	
	RenderAsync(true,null,function(){

		UpdateNotationTopPosition();

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

function FillUrlBoxWithAbcInLZW() {

	var abcText = gTheABC.value;

	var abcInLZW = LZString.compressToEncodedURIComponent(abcText);

	var format = GetRadioValue("notenodertab");

	var capo = document.getElementById("capo").value;

	var ssp = document.getElementById("staff-spacing").value;

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

	// Add the tune set name
	var theTuneCount = CountTunes();

	var theName = getDescriptiveFileName(theTuneCount,false);

	url += "&name=" + theName;

	var urltextbox = document.getElementById("urltextbox");

	// First disallow all sharing until valid URL validated
	gAllowURLSave = false;
	gAllowQRCodeSave = false;

	if (url.length > 8100) {

		url = "     The URL link would be too long to share. Please try sharing fewer tunes.";

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

		gAllowURLSave = false;


	} else {

		document.getElementById("testurl").classList.remove("urlcontrolsdisabled");
		document.getElementById("testurl").classList.add("urlcontrols");

		document.getElementById("saveurl").classList.remove("urlcontrolsdisabled");
		document.getElementById("saveurl").classList.add("urlcontrols");

		document.getElementById("copyurl").classList.remove("urlcontrolsdisabled");
		document.getElementById("copyurl").classList.add("urlcontrols");

		document.getElementById("shortenurl").classList.remove("urlcontrolsdisabled");
		document.getElementById("shortenurl").classList.add("urlcontrols");

		gAllowURLSave = true;

		// If fits in a QR code, show the QR code button
		var maxURLLength = MAXQRCODEURLLENGTH;
	
		if (url.length < maxURLLength) {

			gAllowQRCodeSave = true;

			document.getElementById("generateqrcode").classList.remove("urlcontrolsdisabled");
			document.getElementById("generateqrcode").classList.add("urlcontrols");

		} else {

			gAllowQRCodeSave = false;

			document.getElementById("generateqrcode").classList.remove("urlcontrols");
			document.getElementById("generateqrcode").classList.add("urlcontrolsdisabled");

		}
	}

	// Hide the QR code
	document.getElementById("qrcode").style.display = "none";

	urltextbox.value = url;

	// Resize URL link holder
	var urlTextRows = url.length / 80 + 1;

	if (urlTextRows > 8){
		urlTextRows = 8;
	}

	urltextbox.rows = urlTextRows;

	// Scroll to the top
	setTimeout(function(){
		urltextbox.scrollTo(0,0);
	},100); 
}

function CreateURLfromHTML() {

	FillUrlBoxWithAbcInLZW();
	urlarea = document.getElementById("urlarea");
	urlarea.style.display = "inline-block";
	urltextbox = document.getElementById("urltextbox");
	urltextbox.focus();
	urltextbox.setSelectionRange(0, 0);

	// Clear the QR code
	clearQRCode();

}

//
// Generate a QR code from the share URL
//

function clearQRCode() {

	if (gTheQRCode) {
		gTheQRCode.clear();
	}

}

function GenerateQRCode() {

	if (!gAllowQRCodeSave){

		return;
	}


	if (gTheQRCode == null) {

		gTheQRCode = new QRCode(document.getElementById("qrcode"), {
			text: document.getElementById("urltextbox").value,
			width: 548,
			height: 548,
			colorDark: "#000000",
			colorLight: "#ffffff",
			border: 16,
    		correctLevel : QRCode.CorrectLevel.M 
		});

	} else {

		gTheQRCode.clear();

		gTheQRCode.makeCode(document.getElementById("urltextbox").value);

	}

	document.getElementById("qrcode").style.display = "inline-block";

	// Find the image
	theQRCodeImage = document.querySelectorAll('div[id="qrcode"] > img');

	if (theQRCodeImage && (theQRCodeImage.length > 0)) {

		// Get all the titles of the tunes in the text area
		var theTitles = GetAllTuneTitles();

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
			case "whistle":
				postfix = "<br/><br/>(Whistle Tab)";
				break;
		}

		theTitles += postfix;

		theQRCodeImage = theQRCodeImage[0];

		var theTuneCount = CountTunes();

		// Derive a suggested name from the ABC
		var theImageName = getDescriptiveFileName(theTuneCount,true);

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
			theOutputHTML +=    '<p style="font-family:times;font-size:15pt;margin-top:24px;margin-bottom:0px;">Scanning the code with the Camera app on any smartphone will load the</p>';
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

	DayPilot.Modal.prompt(thePrompt, thePlaceholder,{ theme: "modal_flat", top: 194, autoFocus: false }).then(function(args) {

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

	DayPilot.Modal.prompt(thePrompt, thePlaceholder,{ theme: "modal_flat", top: 194, autoFocus: false }).then(function(args) {

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
// Inject MIDI program number directive 
//
function InjectOneTuneMIDIProgram(theTune, progNum){

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
				theOutput += "%%MIDI program "+progNum+"\n";
			}

		}
		else
		{
			theOutput += thisLine;

			if (i != (theLines.length-1)){
				theOutput += "\n";
			}

		}
	}
	
	return theOutput;
	
}

//
// Inject a MIDI instrument directive after all the X: headers
//
function InjectMIDIInstrument() {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	DayPilot.Modal.prompt("MIDI instrument program number to inject? (Suggested values: 74 - Flute, 49 - Fiddle, 23 - Accordion, 25 - Guitar, 0 - Piano)", "74",{ theme: "modal_flat", top: 194, autoFocus: false }).then(function(args) {
		
		var progNumStr = args.result;

		if (progNumStr == null){
			return;
		}

		var progNum = parseInt(progNumStr);

		if ((isNaN(progNum)) || (progNum == undefined)){
			return;
		}

		if ((progNum < 0) || (progNum > 255)){
			return;
		}

		var nTunes = CountTunes();

		var theNotes = gTheABC.value;

		// Find the tunes
		var theTunes = theNotes.split(/^X:/gm);

		var output = "";

		for (var i=1;i<=nTunes;++i){

			theTunes[i] = "X:"+theTunes[i];

			output += InjectOneTuneMIDIProgram(theTunes[i],progNum);

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
// Send the ABC to Paul Rosen's drawthedots site for playback
//
function PlayABC(e){

	// Follows same semantics as Copy
	if (gAllowCopy){
    	

    	if (e.shiftKey){
    		InjectMIDIInstrument();
    		return;
    	}

		// Is there a selection?
		var theSelectedABC = getSelectedText("abc");

		// No, try to find the tune
		if (theSelectedABC.length == 0){

			// Try to find the current tune
			theSelectedABC = findSelectedTune();

			if (theSelectedABC == ""){
				// This should never happen
				return;
			}
			
			// Get the notes
			var theNotes = gTheABC.value;

			// Refocus back on the ABC
			gTheABC.focus();

    		// Select the whole tune
			var start = theNotes.indexOf(theSelectedABC);
			var end = start + theSelectedABC.length;

    		gTheABC.selectionStart = start;
    		gTheABC.selectionEnd = end;

		}

		// Copy the abc to the clipboard
		CopyToClipboard(theSelectedABC);

		var theData = encodeURIComponent(theSelectedABC);

		var w = window.open("https://editor.drawthedots.com?t="+theData);

		 // Give some feedback
		document.getElementById("playbutton").value = "Sent!";

		setTimeout(function(){

			document.getElementById("playbutton").value = "Play";

			// Refocus back on the ABC
			gTheABC.focus();

		},750);

	}

}

//
// Copy the ABC to the clipboard
//
// If shift key is pressed, copy the text and open the ABC in editor.drawthedots.com
//
function CopyABC(e){

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
function ShortenURL(){

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

				theName += "txt";

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

	}
	else{

		DoMaximize();

	}

}


//
// Idle the show tab names control
//
function IdleShowTabNamesControl(){

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
			allowShowTabs = true;
			break;

	}

	if (allowShowTabs){

		// Enable the Toggle Tag Names button
		document.getElementById("toggletabnames").classList.remove("toggletabnamesdisabled");
		document.getElementById("toggletabnames").classList.add("toggletabnames");	

		gAllowShowTabNames = true;

	}
	else{

		// Disable the Toggle Tag Names button
		document.getElementById("toggletabnames").classList.remove("toggletabnames");	
		document.getElementById("toggletabnames").classList.add("toggletabnamesdisabled");

		gAllowShowTabNames = false;
	}

}

//
// Toggle the display of tab names
//
function ToggleTabNames(){

	if (!gAllowShowTabNames){

		return;

	}

	if (gShowTabNames){

		gShowTabNames = false;

		document.getElementById('toggletabnames').value = "Show Tab Names";


	}
	else{

		gShowTabNames = true;

		document.getElementById('toggletabnames').value = "Hide Tab Names";

	}

	RenderAsync(true,null);

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
		SetRadioValue("notenodertab", format);
		IdleCapoControl();

		if (format == "whistle"){

			// If first time using the whistle tab, prep the tin whistle font for embedded SVG styles
			PrepareWhistleFont();
			
		}

		gCurrentTab = format;

	}

	// Handler for capo parameter
	if (urlParams.has("capo")) {
		var capo = urlParams.get("capo");
		document.getElementById("capo").value = capo;
		gCapo = parseInt(capo);
	}
	else{
		gCapo = 0;
	}

	// Handler for staffspacing ssp parameter
	if (urlParams.has("ssp")) {
		var ssp = urlParams.get("ssp");
		document.getElementById("staff-spacing").value = ssp;
		gStaffSpacing = STAFFSPACEOFFSET + parseInt(ssp);
	}
	else{
		document.getElementById("staff-spacing").value = STAFFSPACEDEFAULT;
		gStaffSpacing = STAFFSPACEOFFSET + STAFFSPACEDEFAULT;
	}

	// Handler for legacy showtabnames parameter
	if (urlParams.has("showtabnames")) {

		var showtabnames = urlParams.get("showtabnames");

		if (showtabnames == "true"){

			gShowTabNames = true;
			document.getElementById('toggletabnames').value = "Hide Tab Names";

		}
		else{

			gShowTabNames = false;
			document.getElementById('toggletabnames').value = "Show Tab Names";	

		}

		IdleShowTabNamesControl();

	}
	else{

		gShowTabNames = true;

		document.getElementById('toggletabnames').value = "Hide Tab Names";
	}

	// Handler for newer showtabnames stn parameter
	if (urlParams.has("stn")) {

		var showtabnames = urlParams.get("stn");

		if (showtabnames == "true"){

			gShowTabNames = true;
			document.getElementById('toggletabnames').value = "Hide Tab Names";

		}
		else{

			gShowTabNames = false;
			document.getElementById('toggletabnames').value = "Show Tab Names";	

		}

		IdleShowTabNamesControl();

	}
	else{

		gShowTabNames = true;

		document.getElementById('toggletabnames').value = "Hide Tab Names";
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
		RenderAsync(true,null);

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

		theFontHolderSVG[0].innerHTML += "@font-face { font-family: 'TinWhistleFingering'; src: url(data:font/truetype;charset=utf-8;base64,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) format('truetype'); font-weight: normal; font-style: normal; }";
		
		// Only do this the first time
		gWhistleFontPrepared = true;

	}

}

//
// Inject PDF-related headers at the top of the file
//
function InjectPDFHeaders(e){

	if (e.shiftKey){

		// If currently rendering PDF, exit immediately
		if (gRenderingPDF) {
			return;
		}

		var theNotes = gTheABC.value;

		var output = "";
		output += "%\n";
		output += "% Here are all available custom annotations:\n";
		output += "%\n";
		output += "%addtitle Title Page Title\n";
		output += "%addsubtitle Title Page Subtitle\n";
		output += "%urladdtitle http://michaeleskin.com Title Page Title as Hyperlink\n";
		output += "%urladdsubtitle http://michaeleskin.com Title Page Subtitle as Hyperlink\n";
		output += "%addtoc Table of Contents\n";
		output += "%addsortedtoc Table of Contents Sorted by Tune Name\n";
		output += "%addlinkbacktotoc\n";		
		output += "%toctopoffset 30\n";
        output += "%toctitleoffset 35\n";
        output += "%toctitlefontsize 18\n";
        output += "%tocfontsize 13\n";
        output += "%toclinespacing 12\n";
		output += "%addindex Unsorted Index\n"
		output += "%addsortedindex Index Sorted by Tune Name\n"
		output += "%addlinkbacktoindex\n";		
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
		output += "%add_all_playback_links 74\n";
		output += "%pdfname your_pdf_filename\n"
		output += "%qrcode\n";
		output += "\n";
		output += "These directives can be added to each tune:\n";
		output += "%hyperlink http://michaeleskin.com\n";
		output += "%add_link_to_thesession\n";
		output += "%add_playback_link 49\n";
		output += "\n";
		
		output += theNotes;

		// Stuff in the transposed output
		gTheABC.value = output;

		// Set the select point
		gTheABC.selectionStart = 0;
	    gTheABC.selectionEnd = 0;

	    // And set the focus
	    gTheABC.focus();	

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
				searchRegExp = /[^ABCDEFGabcdefg]*/gm
				thisLine = thisLine.replace(searchRegExp,"");

				// Now insert spaces between each character
				theChars = thisLine.split(""); 
				thisLine = theChars.join(" ");

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
function InjectABCNoteNameLyrics() {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	var nTunes = CountTunes();

	var theNotes = gTheABC.value;

	// Find the tunes
	var theTunes = theNotes.split(/^X:/gm);

	var output = "";

	for (var i=1;i<=nTunes;++i){

		theTunes[i] = "X:"+theTunes[i];

		output += InjectOneTuneABCNoteNameLyrics(theTunes[i]);

	}

	// Stuff in the transposed output
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
function DoInjectABCNoteNameLyrics(e){

	if (e.shiftKey){

		e.preventDefault();
		e.stopPropagation();

		InjectABCNoteNameLyrics();
		
		RenderAsync(true,null);


	}
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

	// Update the link if there is any ABC
	if (gAllowCopy){

		FillUrlBoxWithAbcInLZW();

	}

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
				windowHeight -= 500;

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
// Restore the application state from local storage
//
function restoreStateFromLocalStorage(){

	var bIsFirstTime = true;

	// Display mode
	var theTab = localStorage.abcTab;

	if (theTab){

		bIsFirstTime = false;

		SetRadioValue("notenodertab", theTab);

		IdleCapoControl();

		if (theTab == "whistle"){

			// If first time using the whistle tab, prep the tin whistle font for embedded SVG styles
			PrepareWhistleFont();
			
		}

		gCurrentTab = theTab;

	}

	// PDF Tunes/page
	var theTunesPerPage = localStorage.abcTunesPerPage;

	if (theTunesPerPage){

		bIsFirstTime = false;

		document.getElementById("pdfformat").value = theTunesPerPage;

	}

	// Page number
	var thePageNumberLocation = localStorage.abcPageNumberLocation;

	if (thePageNumberLocation){

		bIsFirstTime = false;

		document.getElementById("pagenumbers").value = thePageNumberLocation;

	}

	// Page number on first page
	var thePageNumberOnPageOne = localStorage.abcPageNumberOnPageOne;

	if (thePageNumberOnPageOne){

		bIsFirstTime = false;

		document.getElementById("firstpage").value = thePageNumberOnPageOne;

	}

	// Capo
	var theCapo = localStorage.abcCapo;

	if (theCapo){

		bIsFirstTime = false;

		document.getElementById("capo").value = theCapo;

		gCapo = parseInt(theCapo);

	}

	// Staff spacing
	var theStaffSpacing = localStorage.abcStaffSpacing;

	if (theStaffSpacing){

		bIsFirstTime = false;

		document.getElementById("staff-spacing").value = theStaffSpacing;

		gStaffSpacing = STAFFSPACEOFFSET + parseInt(theStaffSpacing);

	}

	// Top bar
	var theHideTopBar = localStorage.abcHideTopBar;

	if (theHideTopBar){

		bIsFirstTime = false;

		if (theHideTopBar == "true"){

			HideTopBar();

		}
	}

	// Show tab names
	var theShowTabNames = localStorage.abcShowTabNames;

	if (theShowTabNames){

		bIsFirstTime = false;

		if (theShowTabNames == "true"){

			gShowTabNames = true;

			document.getElementById('toggletabnames').value = "Hide Tab Names";

		}
		else{

			gShowTabNames = false;

			document.getElementById('toggletabnames').value = "Show Tab Names";	

		}

		IdleShowTabNamesControl();	

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
	   modal_msg += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica"><strong>Read the <a href="userguide.html" target="_blank">User Guide</a> for complete documentation and demo videos.</strong></p>';
	   modal_msg += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">To begin, type or paste tunes in ABC format into the text area.</p>'; 
	   modal_msg += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">Each ABC tune must begin with an X: tag.</p>'; 
	   modal_msg += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">Notation updates instantly as you make changes.</p>'; 
	   modal_msg += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">Click the zoom-out arrows at the upper-right to view notation fullscreen.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">Click "New ABC" to generate a one-line sample tune with examples of all the available PDF tunebook annotations.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">Click "Open ABC" to open and import an ABC text file from your system.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica"><strong>Once ABC has been entered and notation is displayed:</strong></p>';
	   modal_msg += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">• Click "Save ABC" to save all the ABC text to an ABC text file.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">• Click "Export PDF" to export your tunebook in PDF format.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">• Click "Copy All" to copy all the ABC text to the clipboard.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">• Click "Play" to play the tune currently being edited.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica">• Click "Show Controls" for tablature options, PDF tunebook settings (paper size, tunes-per-page, page numbers), sharing features, etc.</p>';
	   modal_msg += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica"><strong>If you find this tool useful, please consider <a href="donate.html" target="_blank">buying me a beer!</a></strong></p>';

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 50 });

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

	// Startup in blank screen
	
	HideMaximizeButton();
	DoMaximize();

	// Get platform info for later UI adaption

	// Are we on Safari?
	gIsSafari = false;
	if (isSafari()){
		gIsSafari = true;
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
		elem.cols = 74;
		elem.style.fontSize = "13pt";
		elem.style.lineHeight = "15pt";

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
			
	// 		//gForceFullRender = true;

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

			alert("Please select an ABC file");

			return;

		}

		let file = fileElement.files[0];

		// Check the filename extension
		if (ensureABCFile(file.name)) {

			// Clean up the notation while the new file is loading
			gTheABC.value = "";

			Render(true,null);

			// Show the loading status
			var fileSelected = document.getElementById('abc-selected');
			fileSelected.innerText = "Loading: "+file.name;

			// Save the filename
			gDisplayedName = file.name;

			const reader = new FileReader();

			reader.addEventListener('load', (event) => {

				gTheABC.value = event.target.result;

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

						// Recalculate the notation top position
						UpdateNotationTopPosition();

					});

				}, 100);

			});

			reader.readAsText(file);
		}

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
	
	document.getElementById('staff-spacing').value = STAFFSPACEDEFAULT;

	gStaffSpacing = STAFFSPACEOFFSET + STAFFSPACEDEFAULT;

	document.getElementById('capo').value = 0;

	// Clear the text entry area, but don't render
	ClearNoRender();

	// Is local storage available
	if (window.localStorage) {

		gLocalStorageAvailable = true;

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
	// Initially hide the controls
	//
	HideAllControls();

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

