//
// smartdraw_abc_test.js
//
// SmartDraw VisualScript Experiments with ABC Transription Tools integration
//
// Opens a JSON ABC tune collection file, allows for searching for a particular tune name, and then saves it or launches it into the ABC Transcription Tools
//
// Michael Eskin
// https://michaeleskin.com
//

var verbose = false;

// Globals
var abcOutput = "";

// Suggested filename for save
var gSaveFilename = "";

function log(s) {
    if (verbose)
        console.log(s);
}

//
// Search the parsed JSON for the tune name
//
function searchJSON() {

    //debugger;

    if (!gTheParsedJSON){
        
        var prompt = makeCenteredPromptString("No JSON Tune Database Loaded")

        DayPilot.Modal.alert(prompt, {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    var tuneNameToSearch = document.getElementById("tuneTextToSearch").value;

    if (tuneNameToSearch == ""){

        var prompt = makeCenteredPromptString("No Tune Name Entered in the Search Field")
 
        DayPilot.Modal.alert(prompt, {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    // Use the search term as the save filename basis
    gSaveFilename = tuneNameToSearch;
    gSaveFilename = gSaveFilename.replace(/[^a-zA-Z0-9_\-. ]+/ig, '');
    gSaveFilename = gSaveFilename.replaceAll(" ","_");

    if (gSaveFilename.length == 0) {
        gSaveFilename = "tunes_found_in_json"
    }

    var originalTuneNameToSearch = tuneNameToSearch;

    tuneNameToSearch = tuneNameToSearch.toLowerCase();

    tuneNameToSearch = tuneNameToSearch.replace("'","");
    tuneNameToSearch = tuneNameToSearch.replace('"',"");

    document.getElementById('output').value = "";

    var returnOnlyWithChords = document.getElementById('chords_only').checked;

    var nTunes = gTheParsedJSON.length;

    var theOutput = "";

    var bFound = false;

    var theTotal = 0;

    for (var i=0;i<nTunes;++i){

        var theInfo = gTheParsedJSON[i].info

        var thisTitle = theInfo["T"];

        thisTitle = thisTitle.toLowerCase();

        thisTitle = thisTitle.replace("'","");
        thisTitle = thisTitle.replace('"',"");

        if (thisTitle.indexOf(tuneNameToSearch) != -1){

            var theVariations = gTheParsedJSON[i].variations;

            var index = 1;
            var total = Object.entries(theVariations).length;

            for (const [key, thisTuneABC] of Object.entries(theVariations))
            {

                // Are we only returning tunes with chords?
                if (returnOnlyWithChords){

                    var searchRegExp = /"[^"]*"/gm

                    var chordsPresent = thisTuneABC.match(searchRegExp);

                    if ((chordsPresent) && (chordsPresent.length > 0)){

                        for (const [key2, value2] of Object.entries(theInfo)) {

                            theOutput += key2+": "+value2+"\n";
                        }

                        // If multiple variations, label them
                        if (total > 1){
                            theOutput+="% Variation "+index+"\n";
                        }

                        theOutput += thisTuneABC+"\n\n";

                        index++;

                        theTotal++;

                        bFound = true;

                    }

                }
                else{

                    for (const [key2, value2] of Object.entries(theInfo)) {

                        theOutput += key2+": "+value2+"\n";
                    }

                    // If multiple variations, label them
                    if (total > 1){
                        theOutput+="% Variation "+index+" of "+total+"\n";
                    }

                    theOutput += thisTuneABC+"\n\n";

                    index++;

                    theTotal++;

                    bFound = true;
               }

 
            }
        }
    }

    var elem = document.getElementById("search_result");
    elem.innerHTML = "Search Results:&nbsp;&nbsp;"+theTotal+ " found";

    document.getElementById('output').value = theOutput;

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
// Inject soundfont and MIDI info
//
function injectPlaybackHeaders(theTune){

    theTune = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont fatboy");
    theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI program 0");
    theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI chordprog 0");
    theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI bassvol 64");
    theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI chordvol 64");
    
    // Seeing extra linefeeds after the inject
    theTune = theTune.replace("\n\n","");

    return theTune;
}

//
// Create a share URL for a tune
//
function encodeABCToolsShareURL(theABC,setName,displayFormat,staffSpacing,addPlayLink) {

    // Clean up the set name

    // Trim any whitespace
    setName = setName.trim();

    // Strip out any naughty HTML tag characters
    setName = setName.replace(/[^a-zA-Z0-9_\-. ]+/ig, '');

    // Replace any spaces
    setName = setName.replace(/\s/g, '_');

    // Strip the extension
    setName = setName.replace(/\..+$/, '');

    // Encode the ABC into LZW format with URI syntax
    var abcInLZW = LZString.compressToEncodedURIComponent(theABC);

    var url = "https://michaeleskin.com/abctools/abctools.html?lzw=" + abcInLZW + "&format=" + displayFormat + "&ssp=" + staffSpacing+ "&pdf=one&pn=br&fp=yes&name="+setName;

    if (addPlayLink){
      url = url + "&play=1";
    }

    if (url.length > 8100) {

        return("ABC too long to encode");

    }

    return url;

}


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
// Generate array of tunes
// Returns tune name, tune ABC, and share URL for each tune
//
function generateTuneArray(theABC){

    var theResult = [];

    // Now find all the X: items
    var theTunes = theABC.split(/^X:/gm);

    var nTunes = theTunes.length;

    for (var i=1;i<nTunes;++i){

        var thisTune = "X:"+theTunes[i];

        thisTune = injectPlaybackHeaders(thisTune);

        var thisTuneName = getTuneTitle(thisTune);

        var thisTuneShareURL = encodeABCToolsShareURL(thisTune,thisTuneName,"noten",10,true);

        theResult.push({name:thisTuneName,abc:thisTune,ShareURL:thisTuneShareURL});
    }

    return theResult;

  }

//
// Generate VSON from the results
//
function generateVSONFlat() {
    
    document.getElementById("vson").value = "";

    var theData = document.getElementById("output").value;

    if (theData.length == 0) {

        DayPilot.Modal.alert("Nothing to encode to VSON!", {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    var theTuneArray = generateTuneArray(theData);

    if (theTuneArray.length == 0) {

        DayPilot.Modal.alert("No tunes found in the output!", {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    //debugger;

    var myDocument=new VS.Document();

    var myTitle=myDocument.AddTitle("Tunes found with "+ document.getElementById("tuneTextToSearch").value);

    myTitle.SetTextSize(18);

    var rootShape=myDocument.GetTheShape();

    rootShape.Hide();
    
    var myContainer=rootShape.AddShapeContainer(VS.ShapeContainerArrangement.Row);

    myContainer.SetWrap(7);

    var nTunes = theTuneArray.length;

    for (var i=0;i<nTunes;++i){

        var myShape = myContainer.AddShape();

        myShape.SetFillColor("#FFFFFF");
       
        myShape.SetLabel(theTuneArray[i].name);

        myShape.SetHyperlink(theTuneArray[i].ShareURL);
        
    }

    var vsJSON = myDocument.toJSON(); 
        
    document.getElementById('vson').value = vsJSON;

}

//
// Process the search results hierarchy
//
function postProcessTuneArray(theTuneArray){

    var result = [];
    var nameBins = [];

    // Get all the tunes by name
    var nTunes = theTuneArray.length;

    for (var i=0; i<nTunes; ++i){

        var theName = theTuneArray[i].name;

        var nBins = nameBins.length;

        var foundBin = false;

        for (var j=0;j<nBins;++j){
            if (nameBins[j].name == theName){
                foundBin = true;
                break;
            }
        }

        if (!foundBin){
            nameBins.push({name:theName,tunes:[theTuneArray[i]]})
        }
        else{
            nameBins[j].tunes.push(theTuneArray[i]);
        }

    }

    return nameBins;

}


//
// Generate VSON from the results
//
function generateVSONHierarchy() {

    document.getElementById("vson").value = "";

    var theData = document.getElementById("output").value;

    if (theData.length == 0) {

        DayPilot.Modal.alert("Nothing to encode to VSON!", {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    var theTuneArray = generateTuneArray(theData);

    if (theTuneArray.length == 0) {

        DayPilot.Modal.alert("No tunes found in the output!", {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    var theBins = postProcessTuneArray(theTuneArray);

    var nBins = theBins.length;

    // Make sure the total number of shapes doesn't exceed the max VSON limit of approximately 500

    var nShapes = 1;

    for (var i=0;i<nBins;++i){

        var thisBin = theBins[i];

        var nBinTunes = thisBin.tunes.length;

        if (nBinTunes == 1){

            nShapes++;
        }
        else{

            nShapes+=nBinTunes + 1;

        }
    }

    if (nShapes > 500){

        DayPilot.Modal.alert("Too many shapes for VSON export. Requires "+nShapes+" shapes. Maximum is 500.", {
            theme: "modal_flat",
            top: 200
        });

        return;
       
    }

    var searchTerm = document.getElementById("tuneTextToSearch").value;

    var myDocument=new VS.Document();

    var myTitle=myDocument.AddTitle("Tune Search Results");

    myTitle.SetTextSize(18);

    var rootShape=myDocument.GetTheShape();

    rootShape.SetFillColor("#FFFFFF");
    rootShape.SetLabel("Searched for:\n\n"+searchTerm);

    var myConnector=rootShape.AddShapeConnector("Orgchart");

    for (var i=0;i<nBins;++i){

        var thisBin = theBins[i];

        var nBinTunes = thisBin.tunes.length;

        if (nBinTunes == 1){

            var myShape = myConnector.AddShape();

            myShape.SetFillColor("#FFFFFF");
           
            myShape.SetLabel(thisBin.tunes[0].name);

            myShape.SetHyperlink(thisBin.tunes[0].ShareURL);

        }
        else{

            var myShape = myConnector.AddShape();

            myShape.SetFillColor("#FFFFFF");
           
            myShape.SetLabel(thisBin.tunes[0].name);

            var myVariations = myShape.AddShapeConnector("Orgchart");

            for (var j=0;j<nBinTunes;++j){

                var myVariation = myVariations.AddShape();

                myVariation.SetFillColor("#FFFFFF");
               
                myVariation.SetLabel("Variation #"+(j+1));

                myVariation.SetHyperlink(thisBin.tunes[j].ShareURL);

            }
           
        }
    }

    var vsJSON = myDocument.toJSON(); 
        
    document.getElementById('vson').value = vsJSON;

}

//
// Save the Output to a .abc file
//
function saveOutput() {

    var theData = document.getElementById("output").value;

    if (theData.length == 0) {

        DayPilot.Modal.alert("Nothing to save!", {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    if (gSaveFilename == ""){
        gSaveFilename = "tunes_found_in_json";
    }

    var thePlaceholder = gSaveFilename;

    var thePrompt = "Please enter a filename for your output ABC file:";

    DayPilot.Modal.prompt(thePrompt, thePlaceholder, {
        theme: "modal_flat",
        top: 200,
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
// Save the VSON 
//
function saveVSON() {

    var theData = document.getElementById("vson").value;

    if (theData.length == 0) {

        DayPilot.Modal.alert("Nothing to save!", {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    if (gSaveFilename == ""){
        gSaveFilename = "abc_vson_test";
    }

    var thePlaceholder = gSaveFilename;

    var thePrompt = "Please enter a filename for your output VSON file:";

    DayPilot.Modal.prompt(thePrompt, thePlaceholder, {
        theme: "modal_flat",
        top: 200,
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

    });

}

//
// Copy the output text to the clipboard 
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
// Copy the VSON to the clipboard 
// 
function copyVSONToClipboard() {

    var textToCopy = document.getElementById('vson').value;

    if (textToCopy.length == 0) {

        DayPilot.Modal.alert("Nothing to copy!", {
            theme: "modal_flat",
            top: 50
        });

        return;

    }

    copyToClipboard(textToCopy);

    // Give some feedback
    document.getElementById("copyvsonbutton").innerHTML = "VSON copied to the clipboard!";

    setTimeout(function() {

        document.getElementById("copyvsonbutton").innerHTML = "Copy VSON to the clipboard";

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

    return "https://michaeleskin.com/abctools/abctools.html";

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
            top: 200
        });

        return;

    }

    var shareName = "JSON_Search_Results";

    var abcInLZW = LZString.compressToEncodedURIComponent(abcText);

    var url = "https://michaeleskin.com/abctools/abctools.html?lzw=" + abcInLZW + "&format=guitare&ssp=10&pdf=one&pn=br&fp=yes&btfs=10&name=" + shareName;

    if (url.length > 8100) {

        DayPilot.Modal.alert('<p style="font-size:14pt;line-height:32px">Search results too long to transfer directly!<br/><br/>Either:</br></br>Click "Copy Output to the clipboard" and Paste into the ABC Transcription Tools<br/><br/>Click "Save Output to a file" and open the file from the ABC Transcription Tools</p>', {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    // Open the transcription tools with the share link
    var w = window.open(url);

}

//
// Create a centered prompt string
//
function makeCenteredPromptString(thePrompt){
    return '<p style="font-size:14pt;line-height:24pt;font-family:helvetica;text-align:center">'+thePrompt+'</p>';
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

var gTheParsedJSON;

//
// Initialization 
//
function DoStartup() {

    document.getElementById('output').value = "";
    document.getElementById('vson').value = "";

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

    if (gIsIOS) {
        // Fix the title font
        var elem = document.getElementById("pagetitle");
        elem.size = 5;
        elem.style.fontFamily = "Helvetica";
    }

    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
                document.getElementById("instructions_header").innerHTML = "Show Instructions";
            } else {
                panel.style.display = "block";
                document.getElementById("instructions_header").innerHTML = "Hide Instructions";
           }
        });
    }

    // Tune database is static
    gTheParsedJSON = theTuneDatabase;
    
    document.getElementById("status").innerHTML="&nbsp;&nbsp;&nbsp;Ready to search";

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