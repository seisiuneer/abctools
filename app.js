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
var HEADERFOOTERFONTSIZE = 11.0;

// Font size for PDF QR code caption
var QRCODECAPTIONPDFFONTSIZE = 11.0;

var gShowShareControls = false;

var gAllowSave = false;

var gAllowURLSave = false;

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

// Global reference to the ABC editor
var gTheABC = document.getElementById("abc");

//
// Tranpose the ABC up one semitone
//

//
// Support function for restoring the selection point after the transpose operation
//
function resetSelectionAfterTranspose(tuneNumber){
	
	// Get the tune
	var theTune = getTuneByIndex(tuneNumber);
	
	// Get the tunes
	var theTunes = gTheABC.value;

	// Find the tune in the tunes
	var theIndex = theTunes.indexOf(theTune);

	// Set the select point
	gTheABC.selectionStart = theIndex;
    gTheABC.selectionEnd = theIndex;

}

function TransposeUp() {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	var nTunes = CountTunes();

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

			var visualObj = ABCJS.renderAbc(renderDivs[i-1], theTunes[i], params);

			output += ABCJS.strTranspose(theTunes[i], visualObj, 1);

		}
	
		// Stuff in the transposed output
		gTheABC.value = output;

		// Reset the selection point to the current tune
		resetSelectionAfterTranspose(gCurrentTune);

		// Force a full render
		RenderAsync(true,null,false);

		setTimeout(function(){

			for (var i = 0; i < nTunes; ++i) {

				// Flash reduction
				var elem = document.getElementById(id);

				elem.style.opacity = 1.0;

			}

		},100);


	},100);
	
}

//
// Tranpose the ABC down one semitone
//

function TransposeDown() {


	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	var nTunes = CountTunes();

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

			var visualObj = ABCJS.renderAbc(renderDivs[i-1], theTunes[i], params);

			output += ABCJS.strTranspose(theTunes[i], visualObj, -1);

		}

		// Stuff in the transposed output
		gTheABC.value = output;

		// Reset the selection point to the current tune
		resetSelectionAfterTranspose(gCurrentTune);

		// Force a full render
		RenderAsync(true,null,false);

		setTimeout(function(){

			for (var i = 0; i < nTunes; ++i) {

				// Flash reduction
				var elem = document.getElementById(id);

				elem.style.opacity = 1.0;

			}

		},100);



	},100);

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

	RenderAsync(true,null,false);

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

// Get the title of the first tune

function Titelholen() {

	verarbeiten = gTheABC.value;

	neu = escape(verarbeiten);

	Reihe = neu.split("%0D%0A");
	Reihe = neu.split("%0A");

	for (i = 0; i < Reihe.length; ++i) {
		Reihe[i] = unescape(Reihe[i]); /* Macht die Steuerzeichen wieder weg */

		Aktuellereihe = Reihe[i].split(""); /* nochmal bei C. Walshaw crosschecken, ob alle mögl. ausser K: erfasst. */
		if (Aktuellereihe[0] == "T" && Aktuellereihe[1] == ":") {

			titel = Reihe[i].slice(2);
			
			titel = titel.trim();

			// Strip out any naughty HTML tag characters
			titel = titel.replace(/[^a-zA-Z0-9_\-. ]+/ig, '');

			// Replace any spaces
			titel = titel.replace(/\s/g, '_');

			// Replace any quotes
			titel = titel.replace(/\'/g, '_');

			break;
		}
	}
	
	return titel;
}


//
// PDF conversion shared globals
//

// Rendering offsets based on paper size
var PAGENUMBERTOP = 296;
var PAGENUMBERTOPA4 = 313;
var PAGETOPOFFSET = 32;
var PAGELEFTOFFSET = 37;
var PAGELEFTOFFSETA4 = 29;
var PAGEHEIGHTLETTER = 792;
var PAGEHEIGHTA4 = 842;
var BETWEENTUNESPACE = 20;

// Keeps track of where we are on the page
var running_height = PAGETOPOFFSET;

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

// Need to cache the time, since you don't want it to change during the render from page to page
var theRenderTime = ""; 

// Don't want to recalc this each time
var theHeaderFooterTuneNames = "";

// Page number vertical offset
var thePageNumberVerticalOffset = 0;

// Did they request a QR code
var QRCodeRequested = false;

// Did they request an index page
var TuneIndexRequested = false;
var theTuneIndexTitle = "";

// Tune page map
var theTunePageMap = [];

// PDF JPG quality (range is 0 to 1)
var PDFJPGQUALITY = 0.8;

// Internal PDF scale factor
var PDFSCALEFACTOR = 1.55;

// The offscreen render div
var theOffscreen = null;

// PDF object to render to
var pdf;

//
// Get the tune index titles
//
function GetTuneIndexTitles(){

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
// Tune index page layout constants
//
var INDEXTOPOFFSET = 330;
var INDEXBOTTOMOFFSET = 330;
var INDEXTITLEOFFSET = 35;
var INDEXLEFTMARGIN = 95;
var INDEXRIGHTMARGIN = 125;
var INDEXTITLESIZE = 18;
var INDEXFONTSIZE = 13;
var INDEXLINESPACING = 15;

//
// Generate and append a tune index to the current PDF
//
function AppendTuneIndex(thePDF,addPageNumbers,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageNumberList,theTitle){

	// Add a new page
	thePDF.addPage(paperStyle); 

	// Set the font size
	thePDF.setFontSize(INDEXTITLESIZE);

	if (theTitle != ""){

		// Add the tune names
		thePDF.text(theTitle, thePDF.internal.pageSize.getWidth()/3.10, INDEXTOPOFFSET, {align:"center"});

	}

	// Get all the tune titles (uses first T: tag found)
	var theTitles = GetTuneIndexTitles();

	var thePaperHeight = pdf.internal.pageSize.getHeight();;
	var thePaperWidth = pdf.internal.pageSize.getWidth()/1.5;

	var pageSizeWithMargins = thePaperHeight - (2 * PAGETOPOFFSET);

	var curTop = INDEXTOPOFFSET + INDEXTITLEOFFSET;

	var i;
	var thePageNumber;

	// Set the font size
	thePDF.setFontSize(INDEXFONTSIZE);

	// Add the tunes by name and page number
	for (i=0;i<totalTunes;++i){

		thePDF.text(theTitles[i], INDEXLEFTMARGIN, curTop, {align:"left"});

		thePageNumber = theTunePageNumberList[i];

		thePDF.text(""+thePageNumber, thePaperWidth-INDEXRIGHTMARGIN, curTop, {align:"left"});

		curTop += INDEXLINESPACING;

		if (i != (totalTunes - 1)){

			if (curTop > pageSizeWithMargins){

				// Bump the page count
				theCurrentPageNumber++;

				// Add the header and footer, suppress the page number
				AddPageHeaderFooter(thePDF,false,theCurrentPageNumber,pageNumberLocation,hideFirstPageNumber,paperStyle);

				// Add a new page
				thePDF.addPage(paperStyle); 

				// Set the font size
				thePDF.setFontSize(INDEXFONTSIZE);

				// Start back at the top
				curTop = INDEXTOPOFFSET + INDEXTITLEOFFSET;

			}
		}
	}

	// We're on a new page
	theCurrentPageNumber++;

	// Add the final page header and footer, suppress the page number
	AddPageHeaderFooter(thePDF,false,theCurrentPageNumber,pageNumberLocation,hideFirstPageNumber,paperStyle,false);	

}


//
// Generate and append a QR code to the current PDF
//
function AppendQRCode(thePDF,paperStyle,callback){
	
	// Need to have the share link available in the urltextbox
	FillUrlBoxWithAbcInLZW();

	// Can we make a QR code from the current share link URL?
	var theURL = document.getElementById("urltextbox").value;

	if (theURL.length > MAXQRCODEURLLENGTH){

		//console.log("Share URL too long for QR Code, early exit...")
		
		// URL too long for QR code... early exit

		callback(false);
		
		return;

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

		gTheQRCode.makeCode(document.getElementById("urltextbox").value);

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
			
			// Set the font size
			thePDF.setFontSize(QRCODECAPTIONPDFFONTSIZE);

			// Different caption offset for letter vs a4
			var captionOffset = 558;

			if (paperStyle == "a4"){
				captionOffset = 575;
			}

			// Add the tune names
			thePDF.text(theHeaderFooterTuneNames, thePDF.internal.pageSize.getWidth()/3.10, captionOffset, {align:"center"});

			// Call back to finalize the PDF
			callback(true);

		}
		else{

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
		title = Titelholen();

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
function ProcessTunesForContinuousLayout(pageBreakList,pageHeight){
	
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

		var theBlockHeight;
		var currentBlock;

		for (j=0;j<nBlocks;++j){

			// Get the node from the HTML collection
			currentBlock = theBlocks.item(j);

			theBlockHeight = currentBlock.offsetHeight / PDFSCALEFACTOR;

			theStaffHeights.push(theBlockHeight);

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
	var pageSizeWithMargins = pageHeight - (2 * PAGETOPOFFSET);

	var spaceAvailable = pageSizeWithMargins;

	var thisTuneHeight;

	var firstTuneOnPage = true;

	for (i=0;i<nTunes;++i){

		// If there is already a forced pagebreak on the tune, we can skip the space calculation
		if (!pageBreakList[i]){

			// The PDF generator adds one extra line per block it renders
			var thisTuneHeight = renderingDivs[i].height + renderingDivs[i].staffHeights.length;

			// Does this tune fit on the page?
			if (thisTuneHeight > spaceAvailable){

				// Put in a page break (not on the first tune)
				if (i != 0){

					pageBreakList[i-1] = true;

				}

				// Reset the page offset
				spaceAvailable = pageSizeWithMargins;

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
					spaceAvailable -= BETWEENTUNESPACE;

					// Try to layout next tune below this one
					firstTuneOnPage = false;

				}
				else{

					// Reset the page offset
					spaceAvailable = pageSizeWithMargins;

					// Place the tune on the page
					spaceAvailable -= thisTuneHeight;

					// With a space below
					spaceAvailable -= BETWEENTUNESPACE;

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
				spaceAvailable -= BETWEENTUNESPACE;

			}

		}

	}

	// First, do no harm... 
	return pageBreakList;

}

//
// Scan the tune and return an array that indicates if a tune as %%newpage under X:
//

function scanTunesForPageBreaks(pdf){

	// Get the paper height at 72 dpi from the PDF generator

	var thePaperHeight = pdf.internal.pageSize.getHeight();

	var pageBreakRequested = [];

	// Count the tunes in the text area
	var theNotes = gTheABC.value;

	var theTunes = theNotes.split(/^X:.*$/gm);

	var nTunes = theTunes.length - 1;

	// Exit out if no tunes
	if (nTunes == 0){
		return pageBreakRequested;
	}

	for (var i=1;i<=nTunes;++i){

		if (theTunes[i].indexOf("%%newpage") != -1){
			pageBreakRequested.push(true);
		}
		else{
			pageBreakRequested.push(false);
		}

	}

	// Measure the tunes and insert any automatic page breaks
	pageBreakRequested = ProcessTunesForContinuousLayout(pageBreakRequested,thePaperHeight);

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
// Parse the ABC and setup the header and footer if they are present
//
function ParseHeaderFooter(theNotes){
	
	// Clear the header and footer strings
	thePageHeader = "";
	thePageFooter = "";

	// Did they request a QR code
	QRCodeRequested = false;

	// Search for a page header
	var searchRegExp = /^%pageheader.*$/m

	// Detect page header annotation
	var allPageHeaders = theNotes.match(searchRegExp);

	if ((allPageHeaders) && (allPageHeaders.length > 0)){
		thePageHeader = allPageHeaders[0].replace("%pageheader ","");
		thePageHeader = allPageHeaders[0].replace("%pageheader","");
	}

	// Search for a page footer
	searchRegExp = /^%pagefooter.*$/m

	// Detect page footer annotation
	var allPageFooters = theNotes.match(searchRegExp);

	if ((allPageFooters) && (allPageFooters.length > 0)){
		thePageFooter = allPageFooters[0].replace("%pagefooter ","");
		thePageFooter = allPageFooters[0].replace("%pagefooter","");
	}

	// Search for a QR code request
	searchRegExp = /^%qrcode.*$/m

	// Detect page footer annotation
	var addQRCode = theNotes.match(searchRegExp);

	if ((addQRCode) && (addQRCode.length > 0)){
		QRCodeRequested = true;
	}

	// Clear the tune index and toc strings
	theTuneIndexTitle = "";

	// Did they request an index
	TuneIndexRequested = false;

	// Search for a tune index request
	searchRegExp = /^%addindex.*$/m

	// Detect tune index annotation
	var addTuneIndex = theNotes.match(searchRegExp);

	if ((addTuneIndex) && (addTuneIndex.length > 0)){
		TuneIndexRequested = true;
		theTuneIndexTitle = addTuneIndex[0].replace("%addindex ","");
		theTuneIndexTitle = addTuneIndex[0].replace("%addindex","");

	}

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
// Calculate and cache the page number position
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

	thePDF.setFontSize(HEADERFOOTERFONTSIZE);

	var hasHeader = false;

	if (thePageHeader && (thePageHeader != "")){

		var thePageHeaderProcessed = ProcessHeaderFooter(thePageHeader,pageNumber,totalTunes);

		// Add the header
		thePDF.text(thePageHeaderProcessed, (thePDF.internal.pageSize.getWidth()/3.10), voff, {align:"center"});

		// Hide page number in center of header
		hasHeader = true;

	}

	var hasFooter = false;

	if (thePageFooter && (thePageFooter != "")){

		var thePageFooterProcessed = ProcessHeaderFooter(thePageFooter,pageNumber,totalTunes);

		// Add the header
		thePDF.text(thePageFooterProcessed, (thePDF.internal.pageSize.getWidth()/3.10), thePageNumberVerticalOffset , {align:"center"});

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
			thePDF.text(str, (thePDF.internal.pageSize.getWidth()/1.5)-25, voff, {align:"center"});
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
			thePDF.text(str, (thePDF.internal.pageSize.getWidth()/1.5)-25, thePageNumberVerticalOffset , {align:"center"});
			break;
		case "tlr":
			if ((pageNumber % 2) == 1){
				// Top left
				thePDF.text(str, 13, voff, {align:"center"});
			}
			else{
				// Top right
				thePDF.text(str, (thePDF.internal.pageSize.getWidth()/1.5)-25, voff , {align:"center"});
			}
			break;
		case "trl":
			if ((pageNumber % 2) == 1){
				// Top right
				thePDF.text(str, (thePDF.internal.pageSize.getWidth()/1.5)-25, voff , {align:"center"});
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
				thePDF.text(str, (thePDF.internal.pageSize.getWidth()/1.5)-25, thePageNumberVerticalOffset , {align:"center"});
			}
			break;
		case "brl":
			if ((pageNumber % 2) == 1){
				// Bottom right
				thePDF.text(str, (thePDF.internal.pageSize.getWidth()/1.5)-25, thePageNumberVerticalOffset , {align:"center"});
			}
			else{
				// Bottom left
				thePDF.text(str, 13, thePageNumberVerticalOffset , {align:"center"});
			}
			break;

	}	
}

//
// Render a single SVG block to PDF and callback when done
//
function RenderPDFBlock(theBlock, blockIndex, doSinglePage, pageBreakList, addPageNumbers, pageNumberLocation, hideFirstPageNumber, paperStyle, callback){

	// Make sure we have a valid block
	if ((theBlock == null) || (theBlock == undefined)){

		return;

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
			pixelRatio: 2 
		})
		.then(function(canvas) {

			// Select left offset based on paper style
			var hoff = PAGELEFTOFFSET;

			if (paperStyle == "a4"){

				hoff = PAGELEFTOFFSETA4;

			}

			var thePageHeight = PAGEHEIGHTLETTER;

			if (paperStyle == "a4"){

				thePageHeight = PAGEHEIGHTA4;

			}

			// Creates a sharper image
			pdf.internal.scaleFactor = PDFSCALEFACTOR;

			var imgData = canvas.toDataURL("image/jpeg", PDFJPGQUALITY); 

			var theBlockID = theBlock.id + ".block";

			// Insert a new page for each tune
			if (theBlockID.indexOf("_0.block") != -1) {

				if (!isFirstPage) {

					if (doSinglePage) {

						if (theCurrentPageNumber != 0){

							// Add page numbers, headers, and footers
							AddPageHeaderFooter(pdf,addPageNumbers,theCurrentPageNumber,pageNumberLocation,hideFirstPageNumber,paperStyle);

						}

						running_height = PAGETOPOFFSET;

						theCurrentPageNumber++; // for the status display.

						pdf.addPage(paperStyle); //... create a page in letter or A4 format, then leave a 30 pt margin at the top and continue.

						document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";

					} else {

						// 
						// Does this tune have a forced page break?
						//
						if (pageBreakList[tunesProcessed-1]){

							// Add page numbers, headers, and footers
							AddPageHeaderFooter(pdf,addPageNumbers,theCurrentPageNumber,pageNumberLocation,hideFirstPageNumber,paperStyle);						

							// Yes, force it to a new page

							running_height = PAGETOPOFFSET;

							theCurrentPageNumber++; // for the status display.

							pdf.addPage(paperStyle); //... create a page in letter or a4 format, then leave a 30 pt margin at the top and continue.

							document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";

						}
						else{

							// Otherwise, move it down the current page a bit
							running_height += BETWEENTUNESPACE;

						}

					}

				} else {

					isFirstPage = false;

					// Get the position for future page numbers
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

			// the first two values mean x,y coordinates for the upper left corner. Enlarge to get larger margin.
			// then comes width, then height. The second value can be freely selected - then it leaves more space at the top.

			if (running_height + height + PAGETOPOFFSET <= thePageHeight - PAGETOPOFFSET) // i.e. if a block of notes would get in the way with the bottom margin (30 pt), then a new one please...
			{

				pdf.addImage(imgData, 'JPG', hoff, running_height, 535, height);


			} else {

				running_height = PAGETOPOFFSET;

				if (theCurrentPageNumber != 0){

					// Add page numbers, headers, and footers
					AddPageHeaderFooter(pdf,addPageNumbers,theCurrentPageNumber,pageNumberLocation,hideFirstPageNumber,paperStyle);

				}

				theCurrentPageNumber++; // for the status display.

				pdf.addPage(paperStyle); //... create a page in letter or a4 format, then leave a 30 pt margin at the top and continue.

				pdf.addImage(imgData, 'JPG', hoff, running_height, 535, height);

				document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";
			}

			// so that it starts the new one exactly one pt behind the current one.
			running_height = running_height + height + 1;

			callback();


		});

}

//
// PDF Exporter
//

// 
// Put up the spinner, then call the ExportPDF function
//
function ExportPDFAsync(){

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	// If disabled, return
	if (!gAllowPDF){
		return;
	}

	// Show the spinner
	document.getElementById("loading-bar-spinner").style.display = "block";

	// Do the PDF export
	ExportPDF(function(){

		// Call back hides the spinner
		document.getElementById("loading-bar-spinner").style.display = "none";

	});

}

//
// Export a PDF document
//
function ExportPDF(theCallback) {

	// Show the PDF status block
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

	if ((thePageOptions == "one_a4") || (thePageOptions == "multi_a4")){

		paperStyle = "a4";

	}

	// Hide page numbers on page 1?
	var hideFirstPageNumber = false;

	elem = document.getElementById("firstpage");

	var firstPageNumbers = elem.options[elem.selectedIndex].value;

	if (firstPageNumbers == "no"){

		hideFirstPageNumber = true;

	}

	// Process headers and footers
	ParseHeaderFooter(gTheABC.value);

	// Clear the render time
	theRenderTime = "";

	// Cache the tune titles
	theHeaderFooterTuneNames = GetAllTuneTitles();

	// Init the shared globals
	theCurrentPageNumber = 1;

	tunesProcessed = 0;

	// Init the page map
	theTunePageMap = [];

	// Count the tunes
	totalTunes = CountTunes();

	isFirstPage = true;

	running_height = PAGETOPOFFSET;

	var nBlocksProcessed = 0;

	var title = getDescriptiveFileName(totalTunes,true);

	qualitaet = 1200; 

	document.getElementById("statuspdfname").innerHTML = "Generating <font color=\"red\">" + title + ".pdf </font>";

	document.getElementById("statustunecount").innerHTML = "Processing notation for PDF generation";

	// Cache the offscreen rendering div
	theOffscreen = document.getElementById("offscreenrender")

	setTimeout(function() {

		Render(true,null,true);
		
		document.getElementById("statustunecount").innerHTML = "Rendering tune <font color=\"red\">1</font>" + " of  <font color=\"red\">"+totalTunes+"</font>"

		// Save the first tune page number
		theTunePageMap[0] = theCurrentPageNumber;

		// Set the global PDF rendering flag
		gRenderingPDF = true;

		pdf = new jsPDF('p', 'pt', paperStyle);

		// If not doing single page, find any tunes that have page break requests
		var pageBreakList = [];

		if (!doSinglePage){

			// Process any automatic or manual page breaks
			pageBreakList = scanTunesForPageBreaks(pdf);

		}

		var theBlocks = document.querySelectorAll('div[class="block"]');

		var nBlocks = theBlocks.length;

		// Kick off the rendering loop
		var theBlock = theBlocks[0];

		// Render and stamp one block
		RenderPDFBlock(theBlock, 0, doSinglePage, pageBreakList, addPageNumbers, pageNumberLocation, hideFirstPageNumber, paperStyle, callback);

		function callback() {

			nBlocksProcessed++;

			if (nBlocksProcessed == nBlocks) {

				// Add final page number, header, and footer
				AddPageHeaderFooter(pdf,addPageNumbers,theCurrentPageNumber,pageNumberLocation,hideFirstPageNumber,paperStyle);	

				// Did they request a tune index?
				if (TuneIndexRequested){
					
					document.getElementById("statustunecount").innerHTML = "Adding Tune Index";
					
					AppendTuneIndex(pdf,addPageNumbers,pageNumberLocation,hideFirstPageNumber,paperStyle,theTunePageMap,theTuneIndexTitle);

					document.getElementById("statustunecount").innerHTML = "Tune Index Added!";
					
					document.getElementById("pagestatustext").innerHTML = "Rendered <font color=\"red\">" + theCurrentPageNumber + "</font> pages";
					
				}

				// Did they request a QR code?
				if (QRCodeRequested){

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

							statusDelay = 3000;
						}

						// Delay for final QR code UI status update
						setTimeout(function(){

							// Suppress page numbers on QR page, add headers, and footers
							AddPageHeaderFooter(pdf,false,theCurrentPageNumber,pageNumberLocation,hideFirstPageNumber,paperStyle);	
						
							// Handle the status display for the new page
							document.getElementById("statustunecount").innerHTML = "";

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

						document.getElementById("statuspdfname").innerHTML = "Saving <font color=\"red\">" + title + ".pdf </font>";

						// Save the status up for a bit before saving
						setTimeout(function(){

							// Start the PDF save
							pdf.save(title + ".pdf");
							
							document.getElementById("statuspdfname").innerHTML = "";

							document.getElementById("statustunecount").innerHTML = "";

							document.getElementById("pagestatustext").innerHTML = "";

							// Show the PDF status block
							var pdfstatus = document.getElementById("pdf-controls");
							pdfstatus.style.display = "none";

							gRenderingPDF = false;

							// Catch up on any UI changes during the PDF rendering
							RenderAsync(true,null,false);

							// All done!
							theCallback();

						},1000);

					},1500);
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

					RenderPDFBlock(theBlock, nBlocksProcessed, doSinglePage, pageBreakList, addPageNumbers, pageNumberLocation, hideFirstPageNumber, paperStyle, callback);

				}

			}

		}

	}, 250);

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
	var commonFontFormat = 
	{
		titlefont: "Times-Roman 18",
		subtitlefont: "Verdana 12",
		infofont: "Verdana 12",
		partsfont: "Verdana 12",
		tempofont: "Verdana 12",
		textfont: "Verdana 12",
		composerfont: "Verdana 12",
		annotationfont: "Verdana 12",
		partsfont: "Verdana 12",
		gchordfont: "Verdana 12",
		vocalfont: "Verdana 12",
		wordsfont: "Verdana 12"
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
		params = {
			tablature: [{
				instrument: 'violin',
				label: theLabel,
				tuning: ['G,'],
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
				tuning: ['D'],
				highestNote: "c'"
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
// Recalc URL on PDF settings change
//
function RecalcShareURLPDF(){

	// Since this is a Share URL parameter, update URL if required
	if (document.getElementById("urlarea").style.display != "none") {

		FillUrlBoxWithAbcInLZW();

	}

}

//
// Main routine for rendering the notation
//
function RenderTheNotes(tune, instrument, renderAll, tuneNumber, copySVGs) {

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

	//
	// Keep track of how long it takes to render the notation 
	//

	// Get the current time for possible progress banner display
	//currentTime = Date.now();

	var visualObj = ABCJS.renderAbc(renderDivs, tune, params);

	// How long did it take to render?
	// var deltaTime = Date.now() - currentTime;

	//console.log("deltaTime = "+deltaTime);

	// Clear the offscreen rendering div
	document.getElementById("offscreenrender").innerHTML = ""; 

	var svgTextArray = [];

	for (var tuneIndex = startTune; tuneIndex < endTune; ++tuneIndex) {

		var renderDivID = "notation" + tuneIndex;

		// Bei Whistle rendert er zunächst erst eine Linie mit Mandolinentabs, also Zahlen.
		// Diese werden hier anschließend ersetzt durch Buchstaben. 
		// Die Elemente, wo die drin sind heißen tspan - die kriegen zusätzlich die Klasse "whistle", die wir über CSS vordefinieren.
		if (instrument == "whistle") {

			// Im Style-Sheet innerhalb des SVGs muss der Tin Whistle Font als base64 String definiert werden, damit er bei der Erstellung des PDFs auch übernommen wird. 

			var Svgs = document.querySelectorAll('div[id="' + renderDivID + '"] > div > svg > style');

			for (x = 0; x < Svgs.length; x++) {
				Svgs[x].innerHTML += "@font-face { font-family: 'TinWhistleFingering'; src: url(data:font/truetype;charset=utf-8;base64,AAEAAAAOAIAAAwBgRkZUTXBCeEYAACXQAAAAHEdERUYASAAGAAAlsAAAACBPUy8yYmFjVAAAAWgAAABWY21hcGbEMvAAAAIAAAABkmN2dCAARAURAAADlAAAAARnYXNw//8AAwAAJagAAAAIZ2x5ZjcPuw8AAAPQAAAfFGhlYWQFzCAtAAAA7AAAADZoaGVhCdYA8gAAASQAAAAkaG10eAuFBggAAAHAAAAAPmxvY2FW+F8kAAADmAAAADhtYXhwAHIA1QAAAUgAAAAgbmFtZccVWP0AACLkAAACGXBvc3RkEEUZAAAlAAAAAKgAAQAAAAEAAC+9UnlfDzz1AAsIAAAAAADSAmq7AAAAANICarsARP8CAmQGuAAAAAgAAgAAAAAAAAABAAAGuP8CALgB6wAAAAACZAABAAAAAAAAAAAAAAAAAAAABAABAAAAGwCkABUAAAAAAAIAAAABAAEAAABAAC4AAAAAAAEB6wH0AAUACAUzBZkAAAEeBTMFmQAAA9cAZgISAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAFBmRWQAQABBAG0Gzf7NALgGuAD+AAAAAQAAAAAAAAHrAEQAAAAAAesAAAHrAHsAewB7AHsAewB7AHsAewB7AHsAewB7AHsAewB7AHsAewB7AHsAewB7AHsAewB7AAAAAAADAAAAAwAAABwAAQAAAAAAjAADAAEAAAAcAAQAcAAAAAwACAACAAQAAABHAE0AZwBt//8AAAAAAEEASQBhAGn//wAAAAAAAAAAAAAAAQAAAAoAFgAeACoAAAAWABgAGQAPABEAEgAUABcAGgAQABMAFQAKAAwADQADAAUABgAIAAsADgAEAAcACQAAAQYAAAEAAAAAAAAAAQIAAAACAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhgZDxESFAAXGhATFQAAAAAAAAAAAAAAAAAAAAAAAAAKDA0DBQYIAAsOBAcJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABEBREAAAAsACwALACSAQQBfAIAAooDJgPOBHwFNgX2BqQHdgf+CH4JBgmYCjIK3guUDFINGg3qDqgPigACAEQAAAJkBVUAAwAHAC6xAQAvPLIHBADtMrEGBdw8sgMCAO0yALEDAC88sgUEAO0ysgcGAfw8sgECAO0yMxEhESUhESFEAiD+JAGY/mgFVfqrRATNAAAABwB7/1QBcQa4AAAADAAYACQAMAA8AEgAABcRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiZ7SzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHrAEnNEdLMDRHSwFXNEdLMDRHSwFXNEdLMDRHSwFXNEZKMDRHSwFXNEZKMDRHSwFWNEdLMDRGSgAACQB7/1QBcQa4AAAADAATABQAIAAsADgARABQAAAXETQ2MzIWFRQGIyImNxQWMzI2NSMRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiZ7SzA0R0swNEcdPCIlOdlLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHrAEnNEdLMDRHSzAlOTwiASc0R0swNEdLAVc0R0swNEdLAVc0RkowNEdLAVc0RkowNEdLAVY0R0swNEZKAAAACQB7/1QBcQa4AAAADAAYABkAJQAxAD0ASQBVAAAXETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJhE0NjMyFhUUBiMiJhE0NjMyFhUUBiMiJhE0NjMyFhUUBiMiJhE0NjMyFhUUBiMiJntLMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSwFXNEdLMDRHSwFXNEZKMDRHSwFXNEZKMDRHSwFWNEdLMDRGSgAACwB7/1QBcQa4AAAADAAYABkAJQAsAC0AOQBFAFEAXQAAFxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1IxE0NjMyFhUUBiMiJhE0NjMyFhUUBiMiJhE0NjMyFhUUBiMiJhE0NjMyFhUUBiMiJntLMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU52UswNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiASc0R0swNEdLAVc0RkowNEdLAVc0RkowNEdLAVY0R0swNEZKAAAACwB7/1QBcQa4AAAADAAYABkAJQAxADIAPgBKAFYAYgAAFxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyIme0swNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSwFXNEZKMDRHSwFXNEZKMDRHSwFWNEdLMDRGSgAADQB7/1QBcQa4AAAADAAYABkAJQAxADIAPgBKAEsAVwBjAG8AABcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiZ7SzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOj0iJTk8IgEnNEZKMDRHSwFXNEZKMDRHSwFWNEdLMDRGSgAADwB7/1QBcQa4AAAADAAYABkAJQAxADIAPgBKAEsAVwBeAF8AawB3AAAXETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NSMRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiZ7SzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOdlLMDRHSzA0R0swNEdLMDRHrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iASc0RkowNEdLAVY0R0swNEZKAAAADwB7/1QBcQa4AAAADAAYABkAJQAxADIAPgBKAEsAVwBjAGQAcAB8AAAXETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJhE0NjMyFhUUBiMiJntLMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0R0swNEdLMDRHrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iJTk8IgEnNEZKMDRHSwFWNEdLMDRGSgAAEQB7/1QBcQa4AAAADAAYABkAJQAxADIAPgBKAEsAVwBjAGQAcAB3AHgAhAAAFxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1IxE0NjMyFhUUBiMiJntLMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU52UswNEdLMDRHrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iASY0R0swNEZKAAAAEQB7/1QBcQa4AAAADAAYABkAJQAxADIAPgBKAEsAVwBjAGQAcAB8AH0AiQAAFxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyIme0swNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iJTk8IgEmNEdLMDRGSgAADwB7/1QBcQa4AAAADAAYABkAJQAxADIAPgBKAEsAVwBjAG8AewB8AAAXETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGB3tLMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0R0swNEdLMDRHSzA0R0swNEcdPCIlOTwiJTkdrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOj0iJTk8IgEnNEZKMDRHSwFXNEZKMDRHSwFWNEdLMDRGSjAlOTwiJTo9IgAAEwB7/1QBcQa4AAAADAAYABkAJQAxADIAPgBKAEsAVwBjAGQAcAB8AH0AiQCVAJYAABcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgd7SzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdrAEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iJTk8IgEmNEdLMDRGSjAlOTwiJTo9IgAACwB7/wIBcQa4AAAADAANABkAJQAxAD0ASQBVAGEAYgAAFzMVIzUjNTM1MxUzFSMRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHe5k9UlI9UutLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEcdPCIlOTwiJTkdrFJSPVJSPQEnNEdLMDRHSwFXNEdLMDRHSwFXNEdLMDRHSwFXNEZKMDRHSwFXNEZKMDRHSwFWNEdLMDRGSjAlOTwiJTo9IgAAAAALAHv/AgFxBrgAAAAMAA0AGQAgACEALQA5AEUAUQBdAAAXMxUjNSM1MzUzFTMVIxE0NjMyFhUUBiMiJjcUFjMyNjUjETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyIme5k9UlI9UutLMDRHSzA0Rx08IiU52UswNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEesUlI9UlI9ASc0R0swNEdLMCU5PCIBJzRHSzA0R0sBVzRHSzA0R0sBVzRGSjA0R0sBVzRGSjA0R0sBVjRHSzA0RkoACwB7/wIBcQa4AAAADAANABkAJQAmADIAPgBKAFYAYgAAFzMVIzUjNTM1MxUzFSMRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyIme5k9UlI9UutLMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHrFJSPVJSPQEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSwFXNEdLMDRHSwFXNEZKMDRHSwFXNEZKMDRHSwFWNEdLMDRGSgAAAAANAHv/AgFxBrgAAAAMAA0AGQAlACYAMgA5ADoARgBSAF4AagAAFzMVIzUjNTM1MxUzFSMRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NSMRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiZ7mT1SUj1S60swNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTnZSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEesUlI9UlI9ASc0R0swNEdLMCU5PCIlOTwiASc0R0swNEdLMCU5PCIBJzRHSzA0R0sBVzRGSjA0R0sBVzRGSjA0R0sBVjRHSzA0RkoADQB7/wIBcQa4AAAADAANABkAJQAmADIAPgA/AEsAVwBjAG8AABczFSM1IzUzNTMVMxUjETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiZ7mT1SUj1S60swNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHrFJSPVJSPQEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSwFXNEZKMDRHSwFXNEZKMDRHSwFWNEdLMDRGSgAAAAAPAHv/AgFxBrgAAAAMAA0AGQAlACYAMgA+AD8ASwBXAFgAZABwAHwAABczFSM1IzUzNTMVMxUjETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyIme5k9UlI9UutLMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0Rx08IiU5PCIlOR1LMDRHSzA0R0swNEdLMDRHSzA0R0swNEesUlI9UlI9ASc0R0swNEdLMCU5PCIlOTwiASc0R0swNEdLMCU5PCIlOTwiASc0R0swNEdLMCU6PSIlOTwiASc0RkowNEdLAVc0RkowNEdLAVY0R0swNEZKAAAAABEAe/8CAXEGuAAAAAwADQAZACUAJgAyAD4APwBLAFcAWABkAGsAbAB4AIQAABczFSM1IzUzNTMVMxUjETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NSMRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiZ7mT1SUj1S60swNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTnZSzA0R0swNEdLMDRHSzA0R6xSUj1SUj0BJzRHSzA0R0swJTk8IiU5PCIBJzRHSzA0R0swJTk8IiU5PCIBJzRHSzA0R0swJTo9IiU5PCIBJzRGSjA0R0swJTo9IgEnNEZKMDRHSwFWNEdLMDRGSgARAHv/AgFxBrgAAAAMAA0AGQAlACYAMgA+AD8ASwBXAFgAZABwAHEAfQCJAAAXMxUjNSM1MzUzFTMVIxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiYRNDYzMhYVFAYjIiZ7mT1SUj1S60swNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHHTwiJTk8IiU5HUswNEdLMDRHSzA0R0swNEesUlI9UlI9ASc0R0swNEdLMCU5PCIlOTwiASc0R0swNEdLMCU5PCIlOTwiASc0R0swNEdLMCU6PSIlOTwiASc0RkowNEdLMCU6PSIlOTwiASc0RkowNEdLAVY0R0swNEZKAAAAABMAe/8CAXEGuAAAAAwADQAZACUAJgAyAD4APwBLAFcAWABkAHAAcQB9AIQAhQCRAAAXMxUjNSM1MzUzFTMVIxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1IxE0NjMyFhUUBiMiJnuZPVJSPVLrSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOdlLMDRHSzA0R6xSUj1SUj0BJzRHSzA0R0swJTk8IiU5PCIBJzRHSzA0R0swJTk8IiU5PCIBJzRHSzA0R0swJTo9IiU5PCIBJzRGSjA0R0swJTo9IiU5PCIBJzRGSjA0R0swJTo9IgEmNEdLMDRGSgATAHv/AgFxBrgAAAAMAA0AGQAlACYAMgA+AD8ASwBXAFgAZABwAHEAfQCJAIoAlgAAFzMVIzUjNTM1MxUzFSMRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJnuZPVJSPVLrSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEesUlI9UlI9ASc0R0swNEdLMCU5PCIlOTwiASc0R0swNEdLMCU5PCIlOTwiASc0R0swNEdLMCU6PSIlOTwiASc0RkowNEdLMCU6PSIlOTwiASc0RkowNEdLMCU6PSIlOTwiASY0R0swNEZKAAAAABEAe/8CAXEGuAAAAAwADQAZACUAJgAyAD4APwBLAFcAWABkAHAAfACIAIkAABczFSM1IzUzNTMVMxUjETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGB3uZPVJSPVLrSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEdLMDRHSzA0R0swNEdLMDRHHTwiJTk8IiU5HaxSUj1SUj0BJzRHSzA0R0swJTk8IiU5PCIBJzRHSzA0R0swJTk8IiU5PCIBJzRHSzA0R0swJTo9IiU5PCIBJzRGSjA0R0sBVzRGSjA0R0sBVjRHSzA0RkowJTk8IiU6PSIAAAAAFQB7/wIBcQa4AAAADAANABkAJQAmADIAPgA/AEsAVwBYAGQAcABxAH0AiQCKAJYAogCjAAAXMxUjNSM1MzUzFTMVIxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGBxE0NjMyFhUUBiMiJjcUFjMyNjU0JiMiBgcRNDYzMhYVFAYjIiY3FBYzMjY1NCYjIgYHETQ2MzIWFRQGIyImNxQWMzI2NTQmIyIGB3uZPVJSPVLrSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdSzA0R0swNEcdPCIlOTwiJTkdrFJSPVJSPQEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOTwiJTk8IgEnNEdLMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iJTk8IgEnNEZKMDRHSzAlOj0iJTk8IgEmNEdLMDRGSjAlOTwiJTo9IgAAAAAAAAwAlgABAAAAAAABABUALAABAAAAAAACAAYAUAABAAAAAAADAC8AtwABAAAAAAAEABMBDwABAAAAAAAFAAsBOwABAAAAAAAGABMBbwADAAEECQABACoAAAADAAEECQACAAwAQgADAAEECQADAF4AVwADAAEECQAEACYA5wADAAEECQAFABYBIwADAAEECQAGACYBRwBUAGkAbgAgAFcAaABpAHMAdABsAGUAIABGAGkAbgBnAGUAcgBpAG4AZwAAVGluIFdoaXN0bGUgRmluZ2VyaW5nAABNAGUAZABpAHUAbQAATWVkaXVtAABGAG8AbgB0AEYAbwByAGcAZQAgADIALgAwACAAOgAgAFQAaQBuAFcAaABpAHMAdABsAGUARgBpAG4AZwBlAHIAaQBuAGcAIAA6ACAAMgA1AC0AOAAtADIAMAAxADUAAEZvbnRGb3JnZSAyLjAgOiBUaW5XaGlzdGxlRmluZ2VyaW5nIDogMjUtOC0yMDE1AABUAGkAbgBXAGgAaQBzAHQAbABlAEYAaQBuAGcAZQByAGkAbgBnAABUaW5XaGlzdGxlRmluZ2VyaW5nAABWAGUAcgBzAGkAbwBuACAAMQAuADAAAFZlcnNpb24gMS4wAABUAGkAbgBXAGgAaQBzAHQAbABlAEYAaQBuAGcAZQByAGkAbgBnAABUaW5XaGlzdGxlRmluZ2VyaW5nAAAAAAACAAAAAAAA/2cAZgAAAAEAAAAAAAAAAAAAAAAAAAAAABsAAAABAAIARwECAEgASQEDAEoBBABEAQUARQBGAQYAJwEHACgAKQEIACoBCQAkAQoAJQAmAQsHZC1zaGFycAdmLXNoYXJwB2ctc2hhcnAHYS1zaGFycAdjLXNoYXJwB0Qtc2hhcnAHRi1zaGFycAdHLXNoYXJwB0Etc2hhcnAHQy1zaGFycAAAAAH//wACAAEAAAAOAAAAGAAAAAAAAgABAAMAGgABAAQAAAACAAAAAAABAAAAAMw9os8AAAAA0gJquwAAAADSAmq7) format('truetype'); font-weight: normal; font-style: normal; }";
			}

			// hiermit findet er alle g's, die eine Tabzahl sind. 
			var Tabstriche = document.querySelectorAll('div[id="' + renderDivID + '"] > div > svg > g > g > path[class="abcjs-top-line"]');

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
					Tspans[x].innerHTML = "d";
				} else if (Tspans[x].innerHTML == "1") {
					Tspans[x].innerHTML = "k";
				} else if (Tspans[x].innerHTML == "2") {
					Tspans[x].innerHTML = "e";
				} else if (Tspans[x].innerHTML == "3") {
					Tspans[x].innerHTML = "f";
				} else if (Tspans[x].innerHTML == "4") {
					Tspans[x].innerHTML = "l";
				} else if (Tspans[x].innerHTML == "5") {
					Tspans[x].innerHTML = "g";
				} else if (Tspans[x].innerHTML == "6") {
					Tspans[x].innerHTML = "m";
				} else if (Tspans[x].innerHTML == "7") {
					Tspans[x].innerHTML = "a";
				} else if (Tspans[x].innerHTML == "8") {
					Tspans[x].innerHTML = "i";
				} else if (Tspans[x].innerHTML == "9") {
					Tspans[x].innerHTML = "b";
				} else if (Tspans[x].innerHTML == "10") {
					Tspans[x].innerHTML = "c";
				} else if (Tspans[x].innerHTML == "11") {
					Tspans[x].innerHTML = "j";
				} else if (Tspans[x].innerHTML == "12") {
					Tspans[x].innerHTML = "D";
				} else if (Tspans[x].innerHTML == "13") {
					Tspans[x].innerHTML = "K";
				} else if (Tspans[x].innerHTML == "14") {
					Tspans[x].innerHTML = "E";
				} else if (Tspans[x].innerHTML == "15") {
					Tspans[x].innerHTML = "F";
				} else if (Tspans[x].innerHTML == "16") {
					Tspans[x].innerHTML = "L";
				} else if (Tspans[x].innerHTML == "17") {
					Tspans[x].innerHTML = "G";
				} else if (Tspans[x].innerHTML == "18") {
					Tspans[x].innerHTML = "M";
				} else if (Tspans[x].innerHTML == "19") {
					Tspans[x].innerHTML = "A";
				} else if (Tspans[x].innerHTML == "20") {
					Tspans[x].innerHTML = "I";
				} else if (Tspans[x].innerHTML == "21") {
					Tspans[x].innerHTML = "B";
				} else if (Tspans[x].innerHTML == "22") {
					Tspans[x].innerHTML = "C";
				} else if (Tspans[x].innerHTML == "23") {
					Tspans[x].innerHTML = "J";
				}
			}
		}

		if (instrument == "notenames") {

			var useSharps = true;

			// hiermit findet er alle g's, die eine Tabzahl sind. 
			var Tabstriche = document.querySelectorAll('div[id="' + renderDivID + '"] > div > svg > g > g > path[class="abcjs-top-line"]');

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

		//
		// Only setup the div labels and classes if rendering for PDF
		//
		if (copySVGs){

			var svgDivs = document.querySelectorAll('div[id="' + renderDivID + '"] > div');

			var nSVGs = svgDivs.length;

			var i;

			var elem;

			for (i=0;i<nSVGs;++i){

				elem = svgDivs.item(i);

				// Add the "block" class
				elem.classList.add("block");

				// Add the incrementing block ID (used to find the start of tunes)
				elem.id = "block_" + tuneIndex + "_" + i;

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
// Allow putting up a spiner before the synchronous Render() function
//
function RenderAsync(renderAll,tuneNumber,copySVGs){

	// Don't allow a re-render during PDF generation
	if (gRenderingPDF){
		return;
	}

	//console.log("RenderAsync renderAll = "+renderAll+" tuneNumber = "+tuneNumber+" copySVGs = "+copySVGs);
	
	// Start with spinner hidden
	document.getElementById("loading-bar-spinner").style.display = "none";

	// Show the spinner
	if (renderAll){

		document.getElementById("loading-bar-spinner").style.display = "block";

		// Render after a short delay
		setTimeout(function(){

			Render(renderAll,tuneNumber,copySVGs);

			document.getElementById("loading-bar-spinner").style.display = "none";

			// Do do the rescroll in the PDF generation case
			if (!copySVGs){

				// Recalc the top tune position and scroll it into view if required
				MakeTuneVisible(true);


			}

		}, 100);
	}
	else{

		// Immediately render just a single tune
		Render(renderAll,tuneNumber,copySVGs);

	}

}

function Render(renderAll,tuneNumber,copySVGs) {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	if (gTheABC.value != "") {

		// Idle the file status display
		var nTunes = CountTunes();
		
		var fileSelected = document.getElementById('abc-selected');

		if (nTunes == 1){

			fileSelected.innerText = gDisplayedName + "  (" + nTunes + " Tune)";

		}
		else{

			fileSelected.innerText = gDisplayedName + "  (" + nTunes + " Tunes)";

		}

		// Avoid jump scroll on render
		var scrollTop = window.pageYOffset;

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
		IdleAdvancedControls();

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

		theNotes = theNotes.replace(searchRegExp, "X:1\n%%musicspace 20\n%%staffsep " + gStaffSpacing);

		// Render the notes
		RenderTheNotes(theNotes,radiovalue,renderAll,tuneNumber,copySVGs);

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

	document.getElementById('toggleadvancedcontrols').value = "Show Advanced Controls";

	document.getElementById('advanced-controls').style.display = "none";

}


//
// Show the advanced controls
//
function ShowAdvancedControls() {

	document.getElementById('toggleadvancedcontrols').value = "Hide Advanced Controls";

	document.getElementById('advanced-controls').style.display = "flex";

	// Idle the controls
	IdleAdvancedControls();

}

//
// Idle the advanced controls
//
function IdleAdvancedControls(){

	if (gShowAllControls && gShowAdvancedControls){

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

	document.getElementById('togglesharecontrols').value = "Show Sharing Controls";

	// Also hide the share url area
	document.getElementById('urlarea').style.display = "none";

}

//
// Show the share controls
//
function ShowShareControls() {

	document.getElementById('togglesharecontrols').value = "Hide Sharing Controls";

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

	RenderAsync(true,null,false);
}

//
// Handle the capo control
//
function SetCapo() {

	gCapo = document.getElementById('capo').value;

	RenderAsync(true,null,false);
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

	document.getElementById('staff-spacing').value = STAFFSPACEDEFAULT;

	gStaffSpacing = STAFFSPACEOFFSET + STAFFSPACEDEFAULT;

	document.getElementById('capo').value = 0;

	gCapo = 0;

	// Reset file selectors
	let fileElement = document.getElementById('selectabcfile');

	fileElement.value = "";

	// Clear the QR code
	clearQRCode();

	// Idle the advanced controls
	IdleAdvancedControls();

	// Recalculate the notation top position
	UpdateNotationTopPosition();

}

//
// Toggle annotations
//
function ToggleAnnotations() {

	gStripAnnotations = !gStripAnnotations;

	RenderAsync(true,null,false);

}

//
// Toggle text
//
function ToggleTextAnnotations() {

	gStripTextAnnotations = !gStripTextAnnotations;

	RenderAsync(true,null,false);

}

//
// Toggle chords
//
function ToggleChords() {

	gStripChords = !gStripChords;

	RenderAsync(true,null,false);

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
// Create a template for a new ABC file
//
function NewABC(){

	// Stuff in some default ABC with additional options explained
	gTheABC.value = "X: 1\nT: New Tune\nR: Reel\nM: 4/4\nL: 1/8\nK: Gmaj\nC: Gan Ainm\n%%MIDI program 74\n%\n% Enter the ABC for your tune(s) below:\n%\n|:d2dA BAFA|ABdA BAFA|ABde fded|Beed egfe:|\n\n%\n% To choose the sound when played, change the MIDI program # above to:\n%\n% 74 - Flute, 49 - Fiddle, 23 - Accordion, 25 - Guitar, or 0 - Piano\n%\n\n% Try these custom PDF page annotations by removing the % and the space\n%\n% Add a PDF page header or footer:\n%\n% %pageheader My Tune Set:  $TUNENAMES\n% %pagefooter PDF named: $PDFNAME saved on: $DATEMDY at $TIME\n%\n% After the tunes, add a tune index with a title:\n%\n% %addindex My Tune Index\n%\n% After the tunes, add a sharing QR code on a new page in the PDF:\n%\n% %qrcode\n%\n";

	// Refocus back on the ABC
	FocusABC();

	// Reset the displayed name base
	gDisplayedName = "No ABC file selected";

	gABCFromFile = false;
	
	RenderAsync(true,null,false);

	UpdateNotationTopPosition();

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

		notationHolder.appendChild(el);

	}

}


//
// Get all the tune titles
//
function GetAllTuneTitles() {

	theTitles = [];

	// Mit For Schleife Titel für Dateinamen extrahieren und Leerzeichen ersetzen und Apostrophe entfernen.
	verarbeiten = gTheABC.value;

	neu = escape(verarbeiten);

	Reihe = neu.split("%0D%0A");
	Reihe = neu.split("%0A");

	for (i = 0; i < Reihe.length; ++i) {
		Reihe[i] = unescape(Reihe[i]); /* Macht die Steuerzeichen wieder weg */

		Aktuellereihe = Reihe[i].split(""); /* nochmal bei C. Walshaw crosschecken, ob alle mögl. ausser K: erfasst. */
		if (Aktuellereihe[0] == "T" && Aktuellereihe[1] == ":") {
			titel = Reihe[i].slice(2);

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

	if (url.length > 8100) {

		url = "     The URL link would be too long to share. Please try sharing fewer tunes.";

		document.getElementById("generateqrcode").classList.remove("urlcontrols");
		document.getElementById("generateqrcode").classList.add("urlcontrolsdisabled");

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

		gAllowURLSave = true;

		// If fits in a QR code, show the QR code button
		var maxURLLength = MAXQRCODEURLLENGTH;
	
		if (url.length < maxURLLength) {

			document.getElementById("generateqrcode").classList.remove("urlcontrolsdisabled");
			document.getElementById("generateqrcode").classList.add("urlcontrols");

		} else {

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
			theOutputHTML +=    '<p style="font-family:helvetica;font-size:14pt;margin-top:18px;margin-bottom:0px;">' + theTitles + '</p>';			
			theOutputHTML +=    '<p style="font-family:helvetica;font-size:16pt;margin-top:32px;margin-bottom:0px;"><strong>Get Your QR Code</strong></p>';
			theOutputHTML +=    '<p style="font-family:helvetica;font-size:16pt;margin-top:32px;margin-bottom:0px;"><a href="'+theImageSource+'" download="'+theImageName+'.png" style="text-decoration:none;color:darkblue">Click here to download&nbsp;' + theImageName +'.png&nbsp;to your system.</a></p>';
			theOutputHTML +=    '<p style="font-family:helvetica;font-size:16pt;margin-top:32px;margin-bottom:0px;"><strong>Use Your QR Code</strong></p>';
			theOutputHTML +=    '<p style="font-family:helvetica;font-size:14pt;margin-top:30px;margin-bottom:0px;">Share QR Codes on social media or email them to friends like any other photo.</p>';
			theOutputHTML +=    '<p style="font-family:helvetica;font-size:14pt;margin-top:24px;margin-bottom:0px;">Scanning the code with the Camera app on any smartphone will load the</p>';
			theOutputHTML +=    '<p style="font-family:helvetica;font-size:14pt;margin-top:6px;margin-bottom:0px;">ABC Transcription Tool with your tune set into the browser on the device.</p>';
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

	var fname = prompt(thePrompt, thePlaceholder);

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

}

//
// Save the ShareURL file
//
function saveShareURLFile(thePrompt, thePlaceholder, theData){

	var fname = prompt(thePrompt, thePlaceholder);

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
// Send the ABC to Paul Rosen's drawthedots site for playback
//
function PlayABC(){

	// Follows same semantics as Copy
	if (gAllowCopy){
    	
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
// Copy the ShareURL to the clipboard
//
function CopyShareURL(){

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

				saveABCFile("Please enter a filename for your ABC file:",theName+".abc",theData);
			}
			else{
				saveABCFile("Please enter a filename for your ABC file:",theName+".txt",theData);
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

	RenderAsync(true,null,false);

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
	}


	// Handler for capo parameter
	if (urlParams.has("capo")) {
		var capo = urlParams.get("capo");
		document.getElementById("capo").value = capo;
		gCapo = capo;
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
		RenderAsync(true,null,false);

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

		RenderAsync(true,null,false);

	}
	else{

		// Otherwise, just render the tune being worked on
		Render(false,gCurrentTune,false);

	}

}

//
// Change the tab display
//
function ChangeTab(){

	var theTab = GetRadioValue("notenodertab");

	// If the tab changes, render all
	if (theTab != gCurrentTab){
		
		RenderAsync(true,null,false);

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

		    	RenderAsync(true,null,true);

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

			Render(true,null,false);

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
					RenderAsync(true,null,false);

					// Recalculate the notation top position
					UpdateNotationTopPosition();


				}, 100);

			});

			reader.readAsText(file);
		}

	}

	// Set the initial tab to notation
	document.getElementById("b1").checked = true;

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

	// Clear the text entry area, but don't render
	ClearNoRender();

	// Check for and process URL share link
	var isFromShare = processShareLink();

	// Not from a share, show the UI
	if (!isFromShare){

		DoMinimize();

		// Show the notation placeholder
		document.getElementById("notation-placeholder").style.display = "block";

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

