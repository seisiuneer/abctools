/**
 * 
 * app.js - All code for the ABC Transcription Tools
 *
 */

var gShowAdvancedControls = false;
var gStripAnnotations = false;
var gStripTextAnnotations = false;
var gStripChords = false;

var STAFFSPACEMIN = 50;
var STAFFSPACEMAX = 100;
var gStaffSpacing = STAFFSPACEMIN;

var gIsIOS = false;
var gIsIPad = false;
var gIsIPhone = false;
var gIsSafari = false;
var gIsAndroid = false;

var gCopySVGs = false;

var gRenderingPDF = false;

var gTheQRCode = null;

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

var theABC = document.getElementById("abc");

function Notenames() {

	verarbeiten = theABC.value;
	neu = escape(verarbeiten);

	Reihe = neu.split("%0D%0A");
	Reihe = neu.split("%0A");

	for (i = 0; i < Reihe.length; ++i) {
		Reihe[i] = unescape(Reihe[i]); /* Macht die Steuerzeichen wieder weg */
		Aktuellereihe = Reihe[i].split(""); /* nochmal bei C. Walshaw crosschecken, ob alle mögl. ausser K: erfasst. */
		if ((Aktuellereihe[0] == "w" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "A" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "B" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "C" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "D" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "E" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "F" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "G" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "H" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "I" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "J" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "L" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "M" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "N" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "O" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "P" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "Q" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "R" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "S" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "T" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "U" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "V" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "W" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "w" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "X" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "Y" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "Z" && Aktuellereihe[1] == ":") || (Aktuellereihe[0] == "K" && Aktuellereihe[1] == ":")) {
			/* Alle ausser Melodieteile werden hier ignoriert. */
		} else {
			var re = /("([^"]+)")/gi; // Suchabfrage zum Entfernen aller Griffe
			grifferaus = Reihe[i].replace(re, ""); // macht alles, was "irgendwas" ist weg - d.h. alle Griffe.

			var re = /("([^!]+)")/gi; // Suchabfrage zum Entfernen aller Griffe
			grifferaus = grifferaus.replace(re, ""); // macht alles, was "irgendwas" ist weg - d.h. alle Griffe.
			grifferaus = grifferaus.replace(/!(.*)!/gi, "");
			grifferaus = grifferaus.replace(/O/gi, "");

			Drin = grifferaus.split("");
			papp = "";
			for (x = 0; x < Drin.length; ++x) {
				moin = Drin[x].search(/[A-Z]|[a-z]/g);
				if (moin != -1) {
					if (Drin[x + 1] != "\"") {
						papp = papp + Drin[x] + " ";
					}
				}
			}
			Reihe[i] = Reihe[i] + "\r\n" + "w:" + papp;

		}
	}

	insfeld = Reihe.join("\n");
	theABC.value = insfeld;
	Render();
}

//
// Tranpose the ABC up one semitone
//

function TransposeUp() {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	var nTunes = CountTunes();
	
	var theNotes = theABC.value;

	// Get the rendering params
	var params = GetABCJSParams();

	var theTunes = theNotes.split(/^X:/gm);

	// Create the render div ID array
	var renderDivs = [];

	for (var i = 0; i < nTunes; ++i) {
		
		renderDivs.push("notation" + i);

	}

	var output = "";

	for (var i=1;i<=nTunes;++i){

		theTunes[i] = "X:"+theTunes[i];

		var visualObj = ABCJS.renderAbc(renderDivs[i-1], theTunes[i], params);

		output += ABCJS.strTranspose(theTunes[i], visualObj, 1);

	}
	
	theABC.value = output;

	Render();
	
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
	
	var theNotes = theABC.value;

	// Get the rendering params
	var params = GetABCJSParams();

	var theTunes = theNotes.split(/^X:/gm);

	// Create the render div ID array
	var renderDivs = [];

	for (var i = 0; i < nTunes; ++i) {
		
		renderDivs.push("notation" + i);

	}

	var output = "";

	for (var i=1;i<=nTunes;++i){

		theTunes[i] = "X:"+theTunes[i];

		var visualObj = ABCJS.renderAbc(renderDivs[i-1], theTunes[i], params);

		output += ABCJS.strTranspose(theTunes[i], visualObj, -1);

	}
	
	theABC.value = output;

	Render();
	
}

function Clear() {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	theABC.value = "";

	var fileSelected = document.getElementById('abc-selected');

	fileSelected.innerText = "No ABC file selected";

	RestoreDefaults();

	HideAllControls();

	Render();

}


// Ab hier: abc, um Noten zu generieren, PDF draus machen, etc.


function Titelholen() {

	// Mit For Schleife Titel für Dateinamen extrahieren und Leerzeichen ersetzen und Apostrophe entfernen.
	verarbeiten = theABC.value;

	neu = escape(verarbeiten);

	Reihe = neu.split("%0D%0A");
	Reihe = neu.split("%0A");

	for (i = 0; i < Reihe.length; ++i) {
		Reihe[i] = unescape(Reihe[i]); /* Macht die Steuerzeichen wieder weg */

		Aktuellereihe = Reihe[i].split(""); /* nochmal bei C. Walshaw crosschecken, ob alle mögl. ausser K: erfasst. */
		if (Aktuellereihe[0] == "T" && Aktuellereihe[1] == ":") {
			titel = Reihe[i].slice(2);
			titel = titel.trim();
			titel = titel.replace(" ", "_");
			titel = titel.replace("'", "");
			//console.log(titel);
			break;
		}
	}

	// Get the current instrument setting
	tabs = GetRadioValue("notenodertab");

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
		case "guitare":
			postfix = "_Guitar_EADGBE";
			break;
		case "guitard":
			postfix = "_Guitar_DADGAD";
			break;
		case "whistle":
			postfix = "_Whistle";
			break;
	}
	
	titel += postfix;
	
	return titel;
}


//
// PDF conversion shared globals
//

var running_height = 30;

var seitenzahl = 1;

var isFirstPage = true;

var tunesProcessed = 0;

var pdf;

//
// Scan the tune and return an array that indicates if a tune as %%newpage under X:
//

function scanTunesForPageBreaks(){

	var pageBreakRequested = [];

	// Count the tunes in the text area
	var theNotes = theABC.value;

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

	return pageBreakRequested;
}



//
// Render a single SVG block to PDF and callback when done
//
function RenderPDFBlock(theBlock, blockIndex, doSinglePage, pageBreakList, callback) {

	var svg = theBlock.querySelector("svg");

	svg.setAttribute("width", qualitaet);

	// scale improves the subsequent PDF quality.
	htmlToImage.toCanvas(theBlock, {
			backgroundColor: "white",
			style: {
				background: "white"
			},
			pixelRatio: 2
		})
		.then(function(canvas) {

			var imgData = canvas.toDataURL("image/jpeg", 1.0);

			var theBlockID = theBlock.id + ".block";

			// Insert a new page for each tune
			if (theBlockID.indexOf("_0.block") != -1) {

				if (!isFirstPage) {

					if (doSinglePage) {

						running_height = 30;

						seitenzahl++; // for the status display.

						pdf.addPage("letter"); //... create a page in letter format, then leave a 30 pt margin at the top and continue.
						document.getElementById("nebennebenstatusanzeigetext").innerHTML = "Saving <font color=\"red\">" + seitenzahl + "</font> pages.";

					} else {

						// 
						// Does this tune have a forced page break?
						//
						if (pageBreakList[tunesProcessed-1]){

							// Yes, force it to a new page

							running_height = 30;

							seitenzahl++; // for the status display.

							pdf.addPage("letter"); //... create a page in letter format, then leave a 30 pt margin at the top and continue.
							document.getElementById("nebennebenstatusanzeigetext").innerHTML = "Saving <font color=\"red\">" + seitenzahl + "</font> pages.";

						}
						else{

							// Otherwise, move it down the current page a bit
							running_height += 20;

						}

					}

				} else {
					isFirstPage = false;
				}

				// Bump the tune processed counter
				tunesProcessed++;

			}

			height = parseInt(canvas.height * 535 / canvas.width);

			// the first two values mean x,y coordinates for the upper left corner. Enlarge to get larger margin.
			// then comes width, then height. The second value can be freely selected - then it leaves more space at the top.

			// hilft vielleicht gegen unscharf...
			pdf.internal.scaleFactor = 1.55;

			if (running_height + height + 30 <= 842 - 30) // i.e. if a block of notes would get in the way with the bottom margin (30 pt), then a new one please...
			{

				pdf.addImage(imgData, 'JPG', 30, running_height, 535, height);

				document.getElementById("nebenstatusanzeigetext").innerHTML = "Staff <font color=\"red\">" + (blockIndex + 1) + "</font> rendered.";

			} else {

				running_height = 30;

				seitenzahl++; // for the status display.

				pdf.addPage("letter"); //... create a page in letter format, then leave a 30 pt margin at the top and continue.

				pdf.addImage(imgData, 'JPG', 30, running_height, 535, height);

				document.getElementById("nebennebenstatusanzeigetext").innerHTML = "Saving <font color=\"red\">" + seitenzahl + "</font> pages.";

			}

			// so that it starts the new one exactly one pt behind the current one.
			running_height = running_height + height + 1;

			// Callback after a short delay
			//setTimeout(function(){

			callback();

			//},150); 

		});

}

//
// Create PDF from HTML...
//
function CreatePDFfromHTML() {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	// Show the PDF status block
	var pdfstatus = document.getElementById("pdf-controls");
	pdfstatus.style.display = "block";

	// Get the page format
	var elem = document.getElementById("pdfformat");

	var doSinglePage = elem.options[elem.selectedIndex].value == "true";

	// If not doing single page, find any tunes that have page break requests
	var pageBreakList = [];

	if (!doSinglePage){
		pageBreakList = scanTunesForPageBreaks();
	}

	// Init the shared globals
	seitenzahl = 1;

	tunesProcessed = 0;

	isFirstPage = true;

	running_height = 30;

	var nBlocksProcessed = 0;

	// overflow must be visible, otherwise it cuts off something in the PDF.
	// document.getElementById("notation").style.overflow = "visible";
	var title = Titelholen();

	qualitaet = 1200;

	document.getElementById("statuspdfname").innerHTML = "Generating <font color=\"red\">" + title + ".pdf </font>";

	setTimeout(function() {

		// Render first copying the SVGs to the shadow DOM
		gCopySVGs = true;

		Render();

		// Set the global PDF rendering flag
		gRenderingPDF = true;

		gCopySVGs = false;

		pdf = new jsPDF('p', 'pt', 'letter');

		var running_height = 30;

		theBlocks = document.querySelectorAll('div[class="block"]');

		var nBlocks = theBlocks.length;

		document.getElementById("statusanzeigetext").innerHTML = "Preparing <font color=\"red\">" + (nBlocksProcessed + 1) + " / " + theBlocks.length + "</font> staves for PDF rendering.";

		// Kick off the rendering loop
		var theBlock = theBlocks[0];

		// Render and stamp one block
		RenderPDFBlock(theBlock, 0, doSinglePage, pageBreakList, callback);

		function callback() {

			nBlocksProcessed++;

			document.getElementById("statusanzeigetext").innerHTML = "Preparing <font color=\"red\">" + (nBlocksProcessed + 1) + " / " + theBlocks.length + "</font> staves for PDF rendering.";

			if (nBlocksProcessed == nBlocks) {

				document.getElementById("statuspdfname").innerHTML = "";

				document.getElementById("statusanzeigetext").innerHTML = "";

				document.getElementById("nebenstatusanzeigetext").innerHTML = "";

				document.getElementById("nebennebenstatusanzeigetext").innerHTML = "";

				// Show the PDF status block
				var pdfstatus = document.getElementById("pdf-controls");
				pdfstatus.style.display = "none";

				pdf.save(title + ".pdf");

				gRenderingPDF = false;

				// Catch up on any UI changes during the PDF rendering
				Render();


			} else {

				theBlock = theBlocks[nBlocksProcessed];

				setTimeout(function() {

					RenderPDFBlock(theBlock, nBlocksProcessed, doSinglePage, pageBreakList, callback);

				}, 100);

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

	var params = {
		responsive: 'resize',
		oneSvgPerLine: 'true',
		selectTypes: false,
		format: {
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
		}
	};

	if (!instrument) {
		params = {
			responsive: 'resize',
			oneSvgPerLine: 'true',
			selectTypes: false,
			format: {
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
			}
		};
		instrument = ""; // damit er unten keinen Error macht...
	} else if (instrument == "mandolin") {
		params = {
			tablature: [{
				instrument: 'violin',
				label: '',
				tuning: ['G,', 'D', 'A', 'e'],
				highestNote: "f'",
				capo: gCapo
			}],
			responsive: 'resize',
			oneSvgPerLine: 'true',
			selectTypes: false,
			format: {
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
			},
		}
	} else if (instrument == "guitare") {
		params = {
			tablature: [{
				instrument: 'guitar',
				label: '',
				tuning: ['E,', 'A,', 'D', 'G', 'B', 'e'],
				highestNote: "f'",
				capo: gCapo
			}],
			responsive: 'resize',
			oneSvgPerLine: 'true',
			selectTypes: false,
			format: {
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
			}
		}
	} else if (instrument == "guitard") {
		params = {
			tablature: [{
				instrument: 'guitar',
				label: '',
				tuning: ['D,', 'A,', 'D', 'G', 'A', 'd'],
				highestNote: "f'",
				capo: gCapo
			}],
			responsive: 'resize',
			oneSvgPerLine: 'true',
			selectTypes: false,
			format: {
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
			}
		}
	} else if (instrument == "notenames") {
		params = {
			tablature: [{
				instrument: 'violin',
				label: '',
				tuning: ['G,'],
				highestNote: "b'"
			}],
			responsive: 'resize',
			oneSvgPerLine: 'true',
			selectTypes: false,
			format: {
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
			}
		}
	} else if (instrument == "whistle") {
		params = {
			tablature: [{
				instrument: 'violin',
				label: '',
				tuning: ['D'],
				highestNote: "c'"
			}],
			responsive: 'resize',
			oneSvgPerLine: 'true',
			selectTypes: false,
			format: {
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
			}
		}
	}

	return params;

}

//
// Center the notation div based on the selected size
//
function PositionNotation(){

	var radiovalue = GetRadioValue("renderwidth");

	document.getElementById("notation-holder").style.width = radiovalue;

	var leftOffset = 0;

	// Set the left offset
	switch (radiovalue){
		case "40%":
		leftOffset = "30%";
		break;
		case "50%":
		leftOffset = "25%";
		break;
		case "75%":
		leftOffset = "12.5%";
		break;
		case "100%":
		leftOffset = "0";
		break;
	}

	document.getElementById("notation-holder").style.marginLeft = leftOffset;
}

function Notenmachen(tune, instrument) {

	var nTunes = CountTunes();

	//console.log("nTunes ="+nTunes);

	// Center the notation div
	PositionNotation();

	// Get the rendering params
	var params = GetABCJSParams(instrument);
	
	// Create the render div ID array
	var renderDivs = [];

	for (var i = 0; i < nTunes; ++i) {
		renderDivs.push("notation" + i);
	}

	var visualObj = ABCJS.renderAbc(renderDivs, tune, params);

	document.getElementById("offscreenrender").innerHTML = ""; // must be, otherwise it somehow generates the abc twice...

	var svgTextArray = [];

	for (var tuneIndex = 0; tuneIndex < nTunes; ++tuneIndex) {

		var renderDivID = "notation" + tuneIndex;


		// Bei Whistle rendert er zunächst erst eine Linie mit Mandolinentabs, also Zahlen.
		// Diese werden hier anschließend ersetzt durch Buchstaben. 
		// Die Elemente, wo die drin sind heißen tspan - die kriegen zusätzlich die Klasse "whistle", die wir über CSS vordefinieren.
		if (instrument == "whistle") {

			// Im Style-Sheet innerhalb des SVGs muss der Tin Whistle Font als base64 String definiert werden, damit er bei der Erstellung des PDFs auch übernommen wird. 

			var Svgs = document.querySelectorAll('div[id="' + renderDivID + '"] > div > svg > style');

			for (x = 0; x < Svgs.length; x++) {
				Svgs[x].innerHTML += "@font-face { font-family: 'TinWhistleFingering'; src: url(data:font/truetype;charset=utf-8;base64,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) format('truetype'); font-weight: normal; font-style: normal; }";
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

			// console.log(Tspans.length);

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

					// console.log(Tspans.length);

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
		// Only copy the SVGs if rendering for PDF
		//
		if (gCopySVGs) {

			Svgs = document.querySelectorAll('div[id="' + renderDivID + '"] > div > svg');
			
			for (x = 0; x < Svgs.length; x++) {
				svgTextArray.push("<div id=\"block_" + tuneIndex + "_" + x + "\" class=\"block\">" + Svgs[x].outerHTML + "</div>");
			}

		}

	}

	//

	// Join all the SVG text and stuff in the offscreen rendering div

	if (gCopySVGs){

		var allSVGText = svgTextArray.join();

		document.getElementById("offscreenrender").innerHTML = allSVGText;

		// Early GC
		svgTextArray = null;

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
	// console.log(radiovalue);
	return radiovalue;
}


function Render() {

	// If currently rendering PDF, exit immediately
	if (gRenderingPDF) {
		return;
	}

	if (theABC.value != "") {

		// Avoid jump scroll on render
		var scrollTop = window.pageYOffset;

		if (document.getElementById("urlarea").style.display != "none") {
			FillUrlBoxWithAbcInLZW();
		}

		// Hide the notation placeholder
		document.getElementById("notation-placeholder").style.display = "none";

		// Show the notation block
		document.getElementById("notation-holder").style.display = "block";

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

		// Idle the advanced controls
		IdleAdvancedControls();

		// Idle the capo control
		IdleCapoControl();

		var radiovalue = GetRadioValue("notenodertab");

		// Generate the rendering divs
		var nTunes = CountTunes();
		GenerateRenderingDivs(nTunes);

		var theNotes = theABC.value;

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

		if (radiovalue == "noten") {

			Notenmachen(theNotes);

		} else // wenn was anderes als "noten" angegeben - Tabs machen. Den Wert aus dem Radiobutton übergeben - muss gleich sein wie instrument in Notenmachen.
		{

			Notenmachen(theNotes, radiovalue);

		}

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

		// Disable the control display toggle
		document.getElementById("toggleallcontrols").classList.remove("toggleallcontrols");
		document.getElementById("toggleallcontrols").classList.add("toggleallcontrolsdisabled");
		gAllowControlToggle = false;

		// Show the notation placeholder
		document.getElementById("notation-placeholder").style.display = "block";

		// Hide the zoom control
		document.getElementById("zoombutton").style.display = "none";


		var fileSelected = document.getElementById('abc-selected');

		fileSelected.innerText = "No ABC file selected";
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

	document.getElementById('advanced-controls').style.display = "none";

	// Recalculate the notation top position
	UpdateNotationTopPosition();

}


//
// Show the advanced controls
//
function ShowAdvancedControls() {

	document.getElementById('advanced-controls').style.display = "flex";

	// Idle the controls
	IdleAdvancedControls();

	// Recalculate the notation top position
	UpdateNotationTopPosition();

}

//
// Idle the advanced controls
//
function IdleAdvancedControls(){

	if (gShowAllControls && gShowAdvancedControls){

		var theNotes = theABC.value;

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
// Hide the share controls
//
function HideShareControls() {

	// Also hide the share url area
	document.getElementById('urlarea').style.display = "none";

	// Recalculate the notation top position
	UpdateNotationTopPosition();


}

//
// Show the share controls
//
function ShowShareControls() {

	CreateURLfromHTML();

	// Recalculate the notation top position
	UpdateNotationTopPosition();


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

}

//
// Handle the spacing control
//
function SetStaffSpacing() {

	gStaffSpacing = document.getElementById('staff-spacing').value;

	Render();
}

//
// Handle the capo control
//
function SetCapo() {

	gCapo = document.getElementById('capo').value;

	Render();
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

	// Reset the annotation strip flags
	gStripAnnotations = false;
	gStripTextAnnotations = false;
	gStripChords = false;
	gCopySVGs = false;

	document.getElementById('staff-spacing').value = STAFFSPACEMIN;

	gStaffSpacing = STAFFSPACEMIN;

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
// Delayed render for paste
//
function DelayedRender() {

	setTimeout(function() {

		RestoreDefaults();

		Render();

	}, 250)

}

//
// Toggle annotations
//
function ToggleAnnotations() {

	gStripAnnotations = !gStripAnnotations;

	Render();

}

//
// Toggle text
//
function ToggleTextAnnotations() {

	gStripTextAnnotations = !gStripTextAnnotations;

	Render();

}

//
// Toggle chords
//
function ToggleChords() {

	gStripChords = !gStripChords;

	Render();

}

//
// Count the tunes in the text area
//
function CountTunes() {

	// Count the tunes in the text area
	var theNotes = theABC.value;

	var theTunes = theNotes.split(/^X:.*$/gm);

	var nTunes = theTunes.length - 1;

	return nTunes;

}

//
// Create a template for a new ABC file
//
function NewABC(){

	theABC.value = "X: 1\nT: My New Tune\nR: Reel\nM: 4/4\nL: 1/8\nK: Gmaj\nC: Gan Ainm\n%%comment\n%%comment Write your tune ABC below\n%%comment\n|:d2dA BAFA|ABdA BAFA|ABde fded|Beed egfe:|";

	Render();

	UpdateNotationTopPosition();

}


// // Re-render on window size change
// window.addEventListener('resize', function() {

// 	if (!(gIsIOS || gIsAndroid)){

// 		Render();

// 		UpdateNotationTopPosition();
// 	}

// });


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

		notationHolder.appendChild(el);

	}

}

//
// Fade out and hide an element
//
function fadeOutAndHide(fadeTarget) {
	var fadeEffect = setInterval(function() {
		if (!fadeTarget.style.opacity) {
			fadeTarget.style.opacity = 1;
		}
		if (fadeTarget.style.opacity > 0) {
			fadeTarget.style.opacity -= 0.1;
		} else {
			clearInterval(fadeEffect);
			fadeTarget.style.display = "none";
		}
	}, 100);
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
// Get all the tune titles
//
function GetAllTuneTitles() {

	theTitles = [];

	// Mit For Schleife Titel für Dateinamen extrahieren und Leerzeichen ersetzen und Apostrophe entfernen.
	verarbeiten = theABC.value;

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

			if (i != nTitles - 1) {
				allTitles += " - ";
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

	var abcText = theABC.value;

	var abcInLZW = LZString.compressToEncodedURIComponent(abcText);

	var format = GetRadioValue("notenodertab");

	var theWidth = GetRadioValue("renderwidth");

	var capo = document.getElementById("capo").value;

	// Strip the percent sign
	theWidth = theWidth.replace("%","");

	var url = getUrlWithoutParams() + "?lzw=" + abcInLZW + "&w=" + theWidth + "&format=" + format;

	// Add a capo parameter for mandolin and guitar
	var postfix = "";

	switch (format){

		case "noten":
		case "notenames":
		case "whistle":
			break;

		case "mandolin":
		case "guitare":
		case "guitard":
			postfix = "&capo=" + capo;
			break;

	}

	url += postfix;

	var urltextbox = document.getElementById("urltextbox");

	if (url.length > 8100) {

		url = "     The URL link would be too long to share. Please try sharing fewer tunes.";

		document.getElementById("generateqrcode").classList.remove("urlcontrols");
		document.getElementById("generateqrcode").classList.add("urlcontrolsdisabled");

		document.getElementById("testurl").classList.remove("urlcontrols");
		document.getElementById("testurl").classList.add("urlcontrolsdisabled");

		document.getElementById("saveurl").classList.remove("urlcontrols");
		document.getElementById("saveurl").classList.add("urlcontrolsdisabled");

		gAllowURLSave = false;


	} else {

		document.getElementById("testurl").classList.remove("urlcontrolsdisabled");
		document.getElementById("testurl").classList.add("urlcontrols");

		document.getElementById("saveurl").classList.remove("urlcontrolsdisabled");
		document.getElementById("saveurl").classList.add("urlcontrols");

		gAllowURLSave = true;

		// If fits in a QR code, show the QR code button
		var maxURLLength = 2300;
	
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
	urltextbox.setSelectionRange(0, urltextbox.value.length);

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

		var w = window.open("");
		w.document.title = "ABC Tools Tune Sharing QR Code";

		setTimeout(function() {

			var theImageHTML = theQRCodeImage.outerHTML.replace("display: block;","");

			w.document.write('<div style="text-align:center;padding:24px;margin-top:36px;">'+ theImageHTML + '<p></p><p style="font-family:helvetica;font-size:14pt;margin-top:32px;">Save or print this QR Code to share:</p><p></p><p style="font-family:helvetica;font-size:14pt">' + theTitles + '</p><p></p><p style="font-family:helvetica;font-size:14pt">Scanning the code will open up the ABC Transcription Tool with the tune set</p></div>');

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
// Save the ABC
//
function SaveABC(){

	if (gAllowSave){

		var theData = theABC.value;

		if (theData.length != 0){
			if ((!gIsAndroid) && (!gIsIOS)){
				saveABCFile("Please enter a filename for your ABC file:","newtune.abc",theData);
			}
			else{
				saveABCFile("Please enter a filename for your ABC file:","newtune.txt",theData);
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
			saveShareURLFile("Please enter a filename for your ShareURL file:","shareurl.txt",theData);
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

	theABC.value = txt;

}

//
// Toggle the control display
//

function ShowAllControls(){

	document.getElementById("notenrechts").style.display = "inline-block";
	//document.getElementById("notation-holder").style.marginTop = "-20px";
	document.getElementById("toggleallcontrols").value = "Hide Controls";

	gShowAllControls = true;

	// Recalculate the notation top position
	UpdateNotationTopPosition();

}

function HideAllControls(){

	document.getElementById("notenrechts").style.display = "none";
	//document.getElementById("notation-holder").style.marginTop = "0px";
	document.getElementById("toggleallcontrols").value = "Show Controls";

	gShowAllControls = false;

	// Recalculate the notation top position
	UpdateNotationTopPosition();

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

	document.getElementById("zoombutton").src = "img/zoomin.png"

	gIsMaximized = true

}

function DoMinimize(){

	document.getElementById("noscroller").style.display = "block";
	document.getElementById("notation-spacer").style.display = "block";
	document.getElementById("zoombutton").src = "img/zoomout.png"

	gIsMaximized = false

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

	if (urlParams.has("base64")) {

		const abcInBase64 = urlParams.get("base64");

		const abcText = b64toutf8(abcInBase64);

		if (abcText.length > 0) {
			SetAbcText(abcText);
			RestoreDefaults();
			doRender = true;
		}
	}

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

	if (urlParams.has("format")) {
		var format = urlParams.get("format");
		SetRadioValue("notenodertab", format);
		IdleCapoControl();
	}

	if (urlParams.has("capo")) {
		var capo = urlParams.get("capo");
		document.getElementById("capo").value = capo;
		gCapo = capo;
	}
	else{
		gCapo = 0;
	}

	// For mobile, default to full width output
	if (!(gIsIOS || gIsAndroid)) {
		if (urlParams.has("w")) {
			var theSize = urlParams.get("w");
			theSize += "%";
			SetRadioValue("renderwidth", theSize);
		}
	} else {
		SetRadioValue("renderwidth", "100%");
	}

	if (doRender) {
		
		// Maximize the notation
		DoMaximize();

		// Set the title
		var fileSelected = document.getElementById("abc-selected");

		fileSelected.innerText = "Shared Tune Set";

		// Hide the controls if coming in from a share link
		document.getElementById("notenrechts").style.display = "none";
		document.getElementById("toggleallcontrols").value = "Show Controls";

		// Recalculate the notation top position
		UpdateNotationTopPosition();

		gShowAllControls = false;

		// Render the tune
		Render();

	}
}

function DoStartup() {

	// Init global state
	gShowAdvancedControls = false;
	gShowShareControls = false;
	gStripAnnotations = false;
	gStripTextAnnotations = false;
	gStripChords = false;
	gCopySVGs = false;
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

	// Warn Safari users
	const uA = navigator.userAgent;
	const vendor = navigator.vendor;

	gIsSafari = false;

	// 
	// Removing Safari banner warning
	//
	if (/Safari/i.test(uA) && /Apple Computer/.test(vendor)) {
		gIsSafari = true;
	}

	gIsIOS = false;
	if (isIOS()) {
		gIsIOS = true;
	}

	gIsIPad = false;
	if (isIPad()) {
		gIsIPad = true;
	}

	gIsIPhone = false;
	if (isIPhone()) {
		gIsIPhone = true;
	}

	// Fade out and hide the safari warning after 5 seconds
	// Disabling this for now
	if (false){  //(gIsSafari && (!gIsIOS)) {

		var safariuser = document.getElementById("safariuser");
		safariuser.style.display = "inline-block";

		setTimeout(

			function() {

				fadeOutAndHide(safariuser);

			}, 4000);
	}

	if (gIsIOS) {

		document.getElementById("selectabcfile").removeAttribute("accept");

	}

	// On iPad make the abc area a bit narrower so it doesn't get cut off
	if (gIsIPad) {

		document.getElementById("abc").cols = 75;

	}

	// On iPhone and Android, move the zoom button over a bit
	if (gIsIPhone || gIsAndroid){

		document.getElementById("zoombutton").style.right = "36px";
	}

	gIsAndroid = false;

	// 
	// Are we on Android?
	//
	if (/Android/i.test(navigator.userAgent)) {
		gIsAndroid = true;
	}

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

			var fileSelected = document.getElementById("abc-selected");

			fileSelected.innerText = file.name;

			const reader = new FileReader();

			reader.addEventListener('load', (event) => {

				theABC.value = event.target.result;

				setTimeout(function() {

					// Reset the annotation strip flags
					RestoreDefaults();

					// Reset the window scroll
					window.scrollTo(
						{
						  top: 0,
						}
					)

					// Render the notation
					Render();

					// Recalculate the notation top position
					UpdateNotationTopPosition();

				}, 100);

			});

			reader.readAsText(file);
		}

	}

	// Set the initial tab to notation
	document.getElementById("b1").checked = true;

	// Set the initial size
	document.getElementById("wb1").checked = true;

	// Reset the paging control
	document.getElementById("pdfformat").value = "true";

	// Hook up the zoom
	document.getElementById("zoombutton").onclick = 
		function() {
			ToggleMaximize();
		};

	// Clear the text entry area
	Clear();

	// Check for and process URL share link
	processShareLink();

	// Recalculate the notation top position
	UpdateNotationTopPosition();

	// Force recalculation of the notation top position on ABC text area resize

	var theABCText = document.getElementById("abc");

	new ResizeObserver(UpdateNotationTopPosition).observe(theABCText);

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

