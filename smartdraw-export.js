//
// SmartDraw Export
//

var SDExportWidthAll = 360;
var SDBatchImageExportStatusText = "";
var SDTheBatchImageExportOKButton = null;
var SDBatchImageExportCancelRequested = false;
var SDTheOKButton = null;
var SDTheNotationImages = [];
var SDTuneOrder = [];
var SDTuneArray = [];
var SmartDrawTuneCurrent = null;
var SmartDrawTitles = null;
var SDExportFormat = "0";
var SDIncipits = [];

// 
// Generate the full text incipits
// 
function SDGenerateFullTextIncipits(){

	var i,j,k;
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

	SDIncipits = [];

	// Add the tunes by name and page number
	for (i=0;i<totalTunes;++i){

		// Get the raw tune ABC
		theTune = getTuneByIndex(SDTuneOrder[i]);

		var theOriginalTune = theTune;

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
		theLines = theTune.split("\n");

		nLines = theLines.length;

		// Find the key
		theKey = "";

		// Find the key
		for (j=0;j<nLines;++j){

			theKey = theLines[j]; 

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

		var theTextIncipits = [];

		// Find the first line of the tune that has measure separators
		for (k=0;k<nLines;++k){

			theTextIncipit = theLines[k];

			// Skip lines that don't have bar lines
			if (theTextIncipit.indexOf("|") == -1){
				continue;
			}

			// Clean out the incipit line of any annotations besides notes and bar lines
			theTextIncipit = cleanIncipitLine(theTextIncipit);

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

			splitAcc = "";

			for(j=0;j<nSplits;++j){

				theSplitIncipit[j] = theSplitIncipit[j].trim();

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

			theTextIncipits.push(theTextIncipit);
		}

		thisTitle = getTuneTitle(theOriginalTune);

		if (theKey != ""){
			thisTitle += " (" + theKey + ")";
		}

		theIncipits.push({title:thisTitle,incipits:theTextIncipits});
	}

	//debugger;

	// Aggregate the final tune incipits
	for (i=0;i<totalTunes;++i){

		var output = "";
		
		// Extra space is for some left padding
		output = "\n"+" "+theIncipits[i].title+" \n\n"

		var thisIncipits = theIncipits[i].incipits;
		
		for (j=0;j<thisIncipits.length;++j){
			output += " "; // For some left padding
			output += thisIncipits[j];
			output += " \n" 
		}
		
		SDIncipits.push(output);

	}

}

// 
// Generate a single tune incipit
// 
function SDGenerateIncipits(){

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
	var i, j, k;

	SDIncipits = [];

	// Add the tunes by name and page number
	for (i=0;i<totalTunes;++i){

		// Get the raw tune ABC
		theTune = getTuneByIndex(SDTuneOrder[i]);

		var theOriginalTune = theTune;

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
		theLines = theTune.split("\n");

		nLines = theLines.length;

		// Find the key
		theKey = "";

		// Find the key
		for (j=0;j<nLines;++j){

			theKey = theLines[j]; 

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

		//debugger;
		//var gotSecondLine = false;

		// Find the first line of the tune that has measure separators
		for (j=0;j<nLines;++j){

			theTextIncipit = theLines[j]; 

			// Score directives can have bar characters, reject them
			if (theTextIncipit.indexOf("%%score")!= -1){
				continue;
			}

			if (theTextIncipit.indexOf("|")!= -1){

				//debugger;
				//console.log("Incipit first line: "+theTextIncipit);

				// Add on the second line line just in case it's a pickup line (KSS case)
				if (j <= (nLines-2)){

					// Find the second line of the tune that has measure separators
					for (k=j+1;k<nLines;++k){

						var theSecondTextIncipit = theLines[k]; 

						if (theSecondTextIncipit.indexOf("|")!= -1){

							//debugger;

							//console.log("Incipit second line: "+theSecondTextIncipit);

							//gotSecondLine = true;

							// Add on the second line line just in case it's a pickup line
							theTextIncipit = theTextIncipit + theSecondTextIncipit;
							
							break;
						}

					}

				}

				break;
			}

		}

		// if (!gotSecondLine){
		// 	debugger;
		// }

		// Clean out the incipit line of any annotations besides notes and bar lines
		theTextIncipit = cleanIncipitLine(theTextIncipit);

		//console.log("Final raw incipit : "+theTextIncipit);

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

			theSplitIncipit[j] = theSplitIncipit[j].trim();

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

		// Collapse double spaces to a single space
		theTextIncipit = theTextIncipit.replaceAll("  "," ");

		//console.log("Final incipit : "+theTextIncipit);

		//console.log("-------------------------");

		// Limit the incipit length
		if (theTextIncipit.length > 40){
			theTextIncipit = theTextIncipit.substring(0,40);
			theTextIncipit = theTextIncipit.trim();
		}
		else{
			theTextIncipit = theTextIncipit.trim();
		}

		thisTitle = getTuneTitle(theOriginalTune);

		if (theKey != ""){
			thisTitle += " (" + theKey + ")";
		}

		// Spaces are for padding
		theTextIncipit = " "+thisTitle+" \n\n "+theTextIncipit+" ";

		SDIncipits.push(theTextIncipit);
	}
	
}

//
// Create a share URL for a tune
//
function SDEncodeABCToolsShareURL(theABC,setName,displayFormat,staffSpacing,addPlayLink) {

    // Clean up the set name

    // Trim any whitespace
    setName = setName.trim();

    // Strip out any naughty HTML tag characters
	setName = setName.replace(/[^a-zA-Z'áÁóÓúÚíÍéÉäÄöÖüÜÀàÈèÌìÒòÙù0-9_\-. ]+/ig, '');

    // Replace any spaces
    setName = setName.replace(/\s/g, '_');

    // Strip the extension
    setName = setName.replace(/\..+$/, '');

    theABC = GetABCFileHeader() + theABC;

    // Encode the ABC into LZW format with URI syntax
    var abcInLZW = LZString.compressToEncodedURIComponent(theABC);

    var url = "https://michaeleskin.com/abctools/abctools.html?lzw=" + abcInLZW + "&format=" + displayFormat + "&ssp=" + staffSpacing+ "&pdf=one&pn=br&fp=yes&name="+setName;

    if (addPlayLink){
      url = url + "&play=1";
    }

    if (url.length > 8100) {

        return("https://michaeleskin.com/abctools/abctools.html");

    }

    return url;

}

//
// Inject soundfont and MIDI info
//
function SDInjectPlaybackHeaders(theTune){

    theTune = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont fatboy");
    theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI program 0");
    theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI bassprog 0");
    theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI chordprog 0");
    theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI bassvol 64");
    theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI chordvol 64");
    
    // Seeing extra linefeeds after the inject
    theTune = theTune.replace("\n\n","");

    return theTune;
}

// Generate array of tunes
// Returns tune name, tune ABC, and share URL for each tune
//
function SDGenerateTuneArray(theABC){

    var theResult = [];

    // Now find all the X: items
    var theTunes = theABC.split(/^X:/gm);

    var nTunes = theTunes.length;

    for (var i=1;i<nTunes;++i){

        var thisTune = "X:"+theTunes[i];

        thisTune = SDInjectPlaybackHeaders(thisTune);

        var thisTuneName = getTuneTitle(thisTune);

        var format = GetRadioValue("notenodertab");

        var thisTuneShareURL = SDEncodeABCToolsShareURL(thisTune,thisTuneName,format,10,true);

        theResult.push({name:thisTuneName,abc:thisTune,ShareURL:thisTuneShareURL});
    }

    return theResult;

 }

//
// Export tune text incipits
//
function SDDoTextIncipitsExport(vson_callback){
	
	SDGenerateIncipits();

	vson_callback(true);

}

//
// Export full tune text incipits
//
function SDDoFullTextIncipitsExport(vson_callback){
	
	SDGenerateFullTextIncipits();

	vson_callback(true);

}


//
// Export full tune images
//
function SDDoBatchImageExport(vson_callback){

	var totalTunesToExport;

	function callback2(theOKButton){

		//console.log("callback2 called");

		nTunes--;

		// Dismiss the player
		SDTheOKButton.click();

		if (!SDBatchImageExportCancelRequested){

			if (nTunes != 0){

				setTimeout(function(){

					currentTune++;

					var newIndex = SDTuneOrder[currentTune]

					var thisTune = getTuneByIndex(newIndex);

					var title = getTuneTitle(thisTune);

					//console.log("Generating SmartDraw image for tune "+ (currentTune+1) + " of "+totalTunesToExport+": "+title);

					SDBatchImageExportStatusText.innerText = "Generating SmartDraw image for tune "+ (currentTune+1) + " of "+totalTunesToExport+": "+title;

					SDExportImageDialog(thisTune,callback,currentTune,null,false);

				}, 100);

			}
			else{

				// We're done, close the status dialog
				SDTheBatchImageExportOKButton.click();

				SDBatchImageExportCancelRequested = false;

				vson_callback(true);
			}
		}
		else{

			vson_callback(false);

		}
	}

	function callback(result,theOKButton){

		//console.log("callback called result = "+result);

		SDDownloadJPG(callback2,theOKButton);

	}

	// Make sure there are tunes to convert
	var nTunes = CountTunes();

	if (nTunes == 0){
		return;
	}

	totalTunesToExport = nTunes;

	var currentTune = 0;

	SDBatchImageExportCancelRequested = false;
	SDTheBatchImageExportOKButton = null;
	SDTheBatchImageExportStatusText = null;
	
	var thePrompt = "Generating SmartDraw image for tune "+ (currentTune+1) + " of "+totalTunesToExport;
	
	// Center the string in the prompt
	thePrompt = makeCenteredPromptString(thePrompt);

	// Put up batch running dialog
	DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 290, scrollWithPage: (AllowDialogsToScroll()), okText:"Cancel" }).then(function(args){
		
		//console.log("Got cancel");
		
		SDBatchImageExportCancelRequested = true;
		
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
			SDTheBatchImageExportOKButton = theOKButton;

			break;

		}
	}

	// Find the status text 

	var theStatusElems = document.getElementsByClassName("modal_flat_content");
	var nStatus = theStatusElems.length;

	SDBatchImageExportStatusText = theStatusElems[nStatus-1];
	SDBatchImageExportStatusText.style.textAlign = "center";

	var newIndex = SDTuneOrder[currentTune];
	var thisTune = getTuneByIndex(newIndex);

	var title = getTuneTitle(thisTune);
	
	//console.log("Generating SmartDraw image for tune "+ (currentTune+1) + " of "+totalTunesToExport+": "+title);

	SDBatchImageExportStatusText.innerText = "Generating SmartDraw image for tune "+ (currentTune+1) + " of "+totalTunesToExport+": "+title;

	// Kick off the conversion cascade
	SDExportImageDialog(thisTune,callback,currentTune,null,false);

	return true;

}

// 
// Export Image Dialog - Used to hold SVG for batch image export
//
// callback and val are used for batch export automation
//

function SDExportImageDialog(theABC,callback,val,metronome_state,isWide){

	//console.log("ExportImageDialog "+val);

	SDTheOKButton = null;
	
	// Cache the tune for the exporter naming
	gPlayerABC = theABC;
	
	var instrument = GetRadioValue("notenodertab");

	var abcOptions = GetABCJSParams(instrument);

	abcOptions.oneSvgPerLine = false;	

	function initRender() {

		// Adapt the top based on the player control size
		var theTop = 40;

		var theHeight = window.innerHeight - 340;

	   	modal_msg = '<div id="playerholder" style="height:'+theHeight+'px;overflow-y:auto;margin-bottom:15px;">';

		modal_msg += '<div id="abcplayer">';			

	   	modal_msg += '<div id="playback-paper"></div>';
	   	modal_msg += '</div>';

	   	modal_msg += '</div>';

		modal_msg += '</p>';

	   	// Scale the player for larger screens
		var windowWidth = window.innerWidth;

		var instrument = GetRadioValue("notenodertab");

		var theWidth;

		if (isDesktopBrowser()){

			theWidth = windowWidth * 0.45;

			if (theWidth < 850){
				theWidth = 850;
			}

		}
		else{

			theWidth = 800;  
			
		}

		DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: theTop, width:theWidth, okText:"Close", scrollWithPage: (isMobileBrowser()) });

		var theOKButtons = document.getElementsByClassName("modal_flat_ok");

		var theOKButton = null;

		for (var i=0;i<theOKButtons.length;++i){

			theOKButton = theOKButtons[i];

			if (theOKButton.innerText == "Close"){

				SDTheOKButton = theOKButton;

				break;

			}
		}
		
		theABC = GetABCFileHeader() + theABC;

		var visualObj = ABCJS.renderAbc("playback-paper", theABC, abcOptions)[0];

		// Post process whistle or note name tab
		postProcessTab([visualObj], "playback-paper",instrument, true);

		// Do the next tune
		if (callback){
			setTimeout(function(){
				callback(val,SDTheOKButton);
			},10);
		}

	}

	initRender();

}

//
// Generate the data URL for the tune image
function SDDownloadJPG(callback,val){

	PreProcessSVGImageForDownload();

	var svg = document.querySelector("#playback-paper svg");

	if (!svg){

		if (callback){
			callback(val);
		}
		else{
			return;
		}
	}

	var canvas = document.createElement("canvas");
	var svgSize = svg.getBoundingClientRect();

	// Make a clone of the SVG
	svg = svg.cloneNode(true);

	var originalSVGWidth = svgSize.width;
	var originalSVGHeight = svgSize.height;

	var outputWidth = SDExportWidthAll;
	var outputHeight = (SDExportWidthAll * originalSVGHeight)/originalSVGWidth;

	canvas.width = outputWidth*2;
	canvas.height = outputHeight*2;

	canvas.style.width = outputWidth*2;
	canvas.style.height = outputHeight*2;

    svg.setAttribute('width', outputWidth+'px');
    svg.setAttribute('height', outputHeight+'px');
	
	var ctx = canvas.getContext( "2d" );

	ctx.fillStyle = "#ffffff"; 
	ctx.fillRect(0, 0, canvas.width, canvas.height); 
	ctx.scale(2, 2);

	var img = document.createElement( "img" );

	var svgData = new XMLSerializer().serializeToString( svg );

	//
	// SmartDraw appears to lose the image if I use SVG
	//

	//SDTheNotationImages.push({data:"data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)) ),width:outputWidth,height:outputHeight});

	//callback(val);

	// Older version that generated JPEG format images

	img.setAttribute( "src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))) );

	img.onload = function() {

		//console.log("Image loaded");

		ctx.drawImage( img, 0, 0 );

		var canvasdata = canvas.toDataURL("image/jpeg",0.9);
		
		SDTheNotationImages.push({data:canvasdata,width:outputWidth,height:outputHeight});

	   	PostProcessSVGImageAfterDownload();

		svg = null;

		callback(val);
	}
}

//
// Create SmartDraw Set List using Drag and Drop
//

function AddSmartDrawSetName(){

	//console.log("AddSmartDrawSetName");

	DayPilot.Modal.prompt("Please enter a new tune set name:", "Set #",{ theme: "modal_flat", top: 200, autoFocus: true, scrollWithPage: (AllowDialogsToScroll()) }).then(function(args) {

		var theSetName = args.result;

		// If the user pressed Cancel, exit
		if (theSetName != null){

			var newItem;

			var oldItem;

			if (SmartDrawTuneCurrent){

				oldItem = SmartDrawTuneCurrent;
		 		newItem = SmartDrawTuneCurrent.cloneNode(true);

		 		if (SmartDrawTuneCurrent){
					SmartDrawTuneCurrent.classList.remove('draggable_tune_selected');
				}

		 	}
		 	else{
		 		const childDivs = document.querySelectorAll('#sortable-tune-list .draggable_tune');
		 		oldItem = childDivs[0];
		 		newItem = oldItem.cloneNode(true);
		 	}

		 	newItem.innerHTML = theSetName;
		 	newItem.setAttribute('data_tune_index',"-1");

		 	document.getElementById('sortable-tune-list').insertBefore(newItem, oldItem);

		 	// Highlight it
		 	SmartDrawTuneCurrent = newItem;

			SmartDrawTuneCurrent.classList.add('draggable_tune_selected');

		}

	});

}

function DeleteSmartDrawSetName(){

	//console.log("DeleteSmartDrawSetName");

	if (SmartDrawTuneCurrent){

		if (SmartDrawTuneCurrent.getAttribute('data_tune_index') == "-1"){

			document.getElementById('sortable-tune-list').removeChild(SmartDrawTuneCurrent);
			SmartDrawTuneCurrent = null;

		}
	}

}

//
// Save the VSON file
//
function saveVSON(fname, theData) {

    if (theData.length == 0) {

        DayPilot.Modal.alert("Nothing to save!", {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    // Strip out any naughty HTML tag characters
	fname = fname.replace(/[^a-zA-Z'áÁóÓúÚíÍéÉäÄöÖüÜÀàÈèÌìÒòÙù0-9_\-. ]+/ig, '');

    if (fname.length == 0) {
        return null;
    }

    fname = fname.replace(/\..+$/, '');
    fname = fname + ".vson";

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

}

function ExportSmartDrawSetList(){

	//console.log("ExportSmartDrawSetList");

	DayPilot.Modal.prompt("Please enter a file name for your exported SmartDraw file:", "SmartDraw_Set_List",{ theme: "modal_flat", top: 200, autoFocus: true, scrollWithPage: (AllowDialogsToScroll()) }).then(function(args) {

		var theSetListFileName = args.result;

		if (theSetListFileName != null){

			DayPilot.Modal.prompt("Please name for your SmartDraw set list:", "My Set List",{ theme: "modal_flat", top: 200, autoFocus: true, scrollWithPage: (AllowDialogsToScroll()) }).then(function(args) {

				// Get the width from the user field
				var val = document.getElementById("smartdraw_export_width").value;

				val = parseInt(val);

				if (!isNaN(val)){
					SDExportWidthAll = val;
				}
				else{
					SDExportWidthAll = 480;
				}

				// Get the export format
				SDExportFormat = document.getElementById("smartdraw_format_select").value;

				// Keep track of exports
				sendGoogleAnalytics("export","SmartDraw_"+SDExportFormat);

				var theSetListName = args.result;

				// If the user pressed Cancel, exit
				if (theSetListName != null){

					//debugger;

					// Clear the JPEG cache
					SDTheNotationImages = [];

					const childDivs = document.querySelectorAll('#sortable-tune-list .draggable_tune');
					
					// Extract and display data_tune_index values
					var SDTuneOrderRaw = Array.from(childDivs).map(div => div.getAttribute('data_tune_index'));

					var nTuneOrder = SDTuneOrderRaw.length;

					SDTuneOrder = [];

					for (var i=0;i<nTuneOrder;++i){
						
						var val = SDTuneOrderRaw[i];

						if (val != "-1"){
							SDTuneOrder.push(parseInt(val));
						}

					}

					//debugger;

					// Generate the injected hyperlink tune array
					SDTuneArray = SDGenerateTuneArray(gTheABC.value);

					switch (SDExportFormat){
						case "0":
						case "3":
							// Generate all the JPG data urls
							SDDoBatchImageExport(callback);
							break;

						case "1":							
						case "4":							
							// Generate the full text incipits versions
							SDDoFullTextIncipitsExport(callback);
							break;

						case "2":							
						case "5":							
							// Generate the first line text incipits versions
							SDDoTextIncipitsExport(callback);
							break;
					}

					//
					// Callback after all async image generation is done
					//
					function callback(res){

						// Export was cancelled
						if (!res){

							return;
						}

						//debugger;

						//console.log("ExportSmartDrawSetList set list filename: "+theSetListFileName+" set list name: "+theSetListName);

						var nDivs = childDivs.length;

						var thisTune = "";

						var myDocument=new VS.Document();

					    var myTitle=myDocument.AddTitle(theSetListName);

					    myTitle.SetTextSize(18);

					    var rootShape=myDocument.GetTheShape();

					    rootShape.SetFillColor("#FFFFFF");
					    rootShape.SetTextColor("#000000");

					    rootShape.SetLabel(theSetListName);

					   	if ((SDExportFormat != "0") && (SDExportFormat != "3")){
					   		rootShape.SetTextFont("Courier");
					   	}

					   	rootShape.SetTextBold(true);

					    var rootConnector=rootShape.AddShapeConnector("Orgchart");
					    rootConnector.SetDirection(VS.Directions.Right);

					    var currentConnector = rootConnector;

					    var tuneIndex = 0;
					    var setMarkerStaged = false;

					    // Vertical format?
					    if ((SDExportFormat == "0") || (SDExportFormat == "1") || (SDExportFormat == "2")){

					 		for (i=0;i<nDivs;++i){

					 			var thisDiv = childDivs[i];

					 			var divName = thisDiv.innerHTML;

					 			var isSetMarker = false;

					 			if (thisDiv.getAttribute('data_tune_index') == "-1"){

					 				//console.log("Set list marker found: "+divName);

					 				isSetMarker = true;
					 			}
								
							    if (isSetMarker){

							    	//console.log("Adding connector");

						            var myShape = rootConnector.AddShape();

						            myShape.SetFillColor("#FFFFFF");
							    	myShape.SetTextColor("#000000");
						           
						            myShape.SetLabel(divName);
						            
					   				if ((SDExportFormat != "0") && (SDExportFormat != "3")){
								   		myShape.SetTextFont("Courier");
								   	}

						           	myShape.SetTextBold(true);

						            setMarkerStaged = true;

							    }
							    else{

							    	//console.log("Adding shape");

							    	// Don't actually make a maker a connector unless it has a shape attached to it
							    	if (setMarkerStaged){
								    	currentConnector=myShape.AddShapeConnector("Orgchart");
								    	currentConnector.SetDirection(VS.Directions.Right);
								    	setMarkerStaged = false;
								    }

						            var myShape = currentConnector.AddShape();

						            myShape.SetFillColor("#FFFFFF");
							    	myShape.SetTextColor("#000000");

							    	// Since there may be set markers, have to keep track of which actually have tunes
							    	var index = SDTuneOrder[tuneIndex];

							    	//console.log("shape image tuneIndex: "+tuneIndex+" index: "+index);

									switch (SDExportFormat){

										// Full JPG 
										case "0":

											// Generate all the JPG data urls
								            myShape.SetImage(SDTheNotationImages[tuneIndex].data);
								            
								            myShape.SetMinWidth(SDTheNotationImages[tuneIndex].width);
								            
								            myShape.SetMinHeight(SDTheNotationImages[tuneIndex].height);

								            myShape.SetHyperlink(SDTuneArray[index].ShareURL);

											break;

										// Full text incipits
										case "1":	

											// Generate the text incipits versions
								            myShape.SetLabel(SDIncipits[tuneIndex]);

								            myShape.SetTextFont("Courier");

								            myShape.SetTextBold(true);

								            myShape.SetTextAlignH("Left");
								            
								            myShape.SetTextGrow(VS.TextGrow.Horizontal);

								            myShape.SetHyperlink(SDTuneArray[index].ShareURL);

											break;


										// Text incipits
										case "2":	

											// Generate the text incipits versions
								            myShape.SetLabel(SDIncipits[tuneIndex]);

								            myShape.SetTextFont("Courier");

								            myShape.SetTextBold(true);

								            myShape.SetTextAlignH("Left");
								            
								            myShape.SetTextGrow(VS.TextGrow.Horizontal);

								            myShape.SetHyperlink(SDTuneArray[index].ShareURL);

											break;

									}


						            tuneIndex++;

							    }
							}
						}
						else{

							//debugger;

							var currentStagedShape = null;

							// Horizontal format
							for (i=0;i<nDivs;++i){

					 			var thisDiv = childDivs[i];

					 			var divName = thisDiv.innerHTML;

					 			var isSetMarker = false;

					 			if (thisDiv.getAttribute('data_tune_index') == "-1"){

					 				//console.log("Set list marker found: "+divName);

					 				isSetMarker = true;
					 			}
								
							    if (isSetMarker){

							    	//console.log("Adding connector");

						            var myShape = rootConnector.AddShape();

						            myShape.SetFillColor("#FFFFFF");
							    	myShape.SetTextColor("#000000");
						           
						            myShape.SetLabel(divName);
						            
					   				if ((SDExportFormat != "0") && (SDExportFormat != "3")){
								   		myShape.SetTextFont("Courier");
								   	}

						           	myShape.SetTextBold(true);

						            setMarkerStaged = true;

						            currentStagedShape = null;

							    }
							    else{

							    	//console.log("Adding shape");

							    	// Don't actually make a maker a connector unless it has a shape attached to it
							    	if (setMarkerStaged){
								    	currentConnector=myShape.AddShapeConnector("Orgchart");
								    	currentConnector.SetDirection(VS.Directions.Right);
								    	setMarkerStaged = false;

								    }

						    		if (currentStagedShape){

								    	currentConnector=currentStagedShape.AddShapeConnector("Orgchart");
								    	currentConnector.SetDirection(VS.Directions.Right);

									}


						            var myShape = currentConnector.AddShape();

						            currentStagedShape = myShape;

						            myShape.SetFillColor("#FFFFFF");
							    	myShape.SetTextColor("#000000");

							    	// Since there may be set markers, have to keep track of which actually have tunes
							    	var index = SDTuneOrder[tuneIndex];

							    	//console.log("shape image tuneIndex: "+tuneIndex+" index: "+index);

									switch (SDExportFormat){

										// Full JPG 
										case "3":

											// Generate all the JPG data urls
								            myShape.SetImage(SDTheNotationImages[tuneIndex].data);
								            
								            myShape.SetMinWidth(SDTheNotationImages[tuneIndex].width);
								            
								            myShape.SetMinHeight(SDTheNotationImages[tuneIndex].height);

								            myShape.SetHyperlink(SDTuneArray[index].ShareURL);

											break;

										// Full text incipits
										case "4":	

											// Generate the text incipits versions
								            myShape.SetLabel(SDIncipits[tuneIndex]);

								            myShape.SetTextFont("Courier");

								            myShape.SetTextBold(true);

								            myShape.SetTextAlignH("Left");
								            
								            myShape.SetTextGrow(VS.TextGrow.Horizontal);

								            myShape.SetHyperlink(SDTuneArray[index].ShareURL);

											break;


										// Text incipits
										case "5":	

											// Generate the text incipits versions
								            myShape.SetLabel(SDIncipits[tuneIndex]);

								            myShape.SetTextFont("Courier");

								            myShape.SetTextBold(true);

								            myShape.SetTextAlignH("Left");
								            
								            myShape.SetTextGrow(VS.TextGrow.Horizontal);

								            myShape.SetHyperlink(SDTuneArray[index].ShareURL);

											break;

									}


						            tuneIndex++;

							    }
							}
						}
						
						var vsJSON = myDocument.toJSON(); 

						// Save the VSON data
						saveVSON(theSetListFileName,vsJSON);

					}
				}

			});
		}
	});

}

function SmartDrawExport(){

	var i,j,k;

	// Initialize 

	var originalOrder = [];
	var newOrder = [];

	// Allow the current global setting to linger
	//SDExportWidthAll = 360;

	SDBatchImageExportStatusText = "";
	SDTheBatchImageExportOKButton = null;
	SDBatchImageExportCancelRequested = false;
	SDTheOKButton = null;
	SDTheNotationImages = [];
	SDTuneOrder = [];
	SDTuneArray = [];
	SmartDrawTuneCurrent = null;
	SmartDrawTitles = null;

	totalTunes = CountTunes();

	SmartDrawTitles = GetTunebookIndexTitles();
	var nTitles = SmartDrawTitles.length;

	if (nTitles == 0){

		var thePrompt = "No tunes to create SmartDraw set list.";
		
		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);
		
		DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

		return;
	}

	var theData = {};

	var theSortableDiv = '<div id="sortable-tune-list" style="overflow:auto;height:475px;margin-top:18px">';

	for (i=0;i<nTitles;++i){

		theSortableDiv += '<div class="draggable_tune" draggable="true" data_tune_index="'+i+'">'+SmartDrawTitles[i]+'</div>';
	}
	
	theSortableDiv += '</div>';

	modal_msg = '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:15px;">SmartDraw Set List Builder&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#smartdraw_export" target="_blank" style="text-decoration:none;position:absolute;left:20px;top:20px">?</a></span></p>';

	modal_msg += '<p style="margin-top:18px;font-size:12pt;">Drag and drop the tune names to change the order of the tunes in the set list.</p>';
	modal_msg += '<p style="margin-top:18px;font-size:12pt;">Add or delete set name markers using the buttons below.</p>';
	modal_msg += theSortableDiv;
	modal_msg += '<p style="text-align:center;margin-top:24px;"><input id="smartdraw_add_set_name" class="advancedcontrols btn btn-injectcontrols-headers" onclick="AddSmartDrawSetName();" type="button" value="Add Set Name" title="Adds a set name element to the list"><input id="smartdraw_delete_set_name" class="advancedcontrols btn btn-injectcontrols-headers" onclick="DeleteSmartDrawSetName();" type="button" value="Delete Set Name" title="Deletes a selected set name element from the list"><input id="smartdraw_export" class="advancedcontrols btn btn-smartdraw-export" onclick="ExportSmartDrawSetList();" type="button" value="Export SmartDraw Set List" title="Exports the set list as a SmartDraw diagram"></p>';
	modal_msg += '<p class="smartdraw_export_all_text">';
	modal_msg += 'Tune export format: <select id="smartdraw_format_select" title="Select the SmartDraw export format and tune shape flow direction">';
	modal_msg += '<option value="0">Notation ↓</option>';
 	modal_msg += '<option value="1">ABC Full Text ↓</option>';
 	modal_msg += '<option value="2">ABC Incipits ↓</option>';
	modal_msg += '<option value="3">Notation →</option>';
 	modal_msg += '<option value="4">ABC Full Text →</option>';
 	modal_msg += '<option value="5">ABC Incipits →</option>';
  	modal_msg += '</select>';
	modal_msg += '&nbsp;&nbsp;&nbsp;Notation width to export: <input id="smartdraw_export_width" type="number" min="0" step="1" max="4096" title="Notation width to export" autocomplete="off"/>';
	modal_msg += '</p>';

	const modal = DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 50, width: 650, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } );

	document.getElementById("smartdraw_export_width").value = SDExportWidthAll;

	document.getElementById("smartdraw_format_select").value = SDExportFormat;

	const sortableList = document.getElementById('sortable-tune-list');

	let dragItem = null;

	// Add drag and drop event listeners

	sortableList.addEventListener('click', function (e) {

		var theTarget = e.target;

		if (theTarget.classList && theTarget.classList.contains('draggable_tune')){
		
			dragItem = theTarget;

			if (SmartDrawTuneCurrent){
				SmartDrawTuneCurrent.classList.remove('draggable_tune_selected');
			}

			SmartDrawTuneCurrent = dragItem;

			dragItem.classList.add('draggable_tune_selected');
		}

	});

	sortableList.addEventListener('dragstart', function (e) {
		
		dragItem = e.target;
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', dragItem.innerHTML);

		if (SmartDrawTuneCurrent){
			SmartDrawTuneCurrent.classList.remove('draggable_tune_selected');
		}

		SmartDrawTuneCurrent = dragItem;

		dragItem.classList.add('draggable_tune_selected');

	});

	sortableList.addEventListener('dragover', function (e) {
		e.preventDefault();
		const target = e.target;
		if (target && target !== dragItem && target.classList.contains('draggable_tune')) {

			const rect = target.getBoundingClientRect();
			
			const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
			
			sortableList.insertBefore(dragItem, next ? target.nextElementSibling : target);

	    	const childDivs = document.querySelectorAll('#sortable-tune-list .draggable_tune');

			// Extract and display data_tune_index values
			newOrder = Array.from(childDivs).map(div => div.getAttribute('data_tune_index'));

		}

	});

	sortableList.addEventListener('dragend', function () {
		dragItem = null;
	});

}
