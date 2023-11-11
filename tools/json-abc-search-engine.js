//
// json-abc-search-engine.js
//
// JSON ABC File Search Engine
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

         DayPilot.Modal.alert("No JSON File Loaded", {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    var tuneNameToSearch = document.getElementById("tuneNameToSearch").value;

    if (tuneNameToSearch == ""){

         DayPilot.Modal.alert("No Tune Name Entered in the Search Field", {
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

    document.getElementById('output').value = "";

    var nTunes = gTheParsedJSON.length;

    var theOutput = "";

    var bFound = false;

    var theTotal = 0;

    for (var i=0;i<nTunes;++i){

        var theInfo = gTheParsedJSON[i].info

        var thisTitle = theInfo["T"];

        thisTitle = thisTitle.toLowerCase();

        if (thisTitle.indexOf(tuneNameToSearch) != -1){

            var theVariations = gTheParsedJSON[i].variations;

            var index = 1;
            var total = Object.entries(theVariations).length;

            for (const [key, thisTuneABC] of Object.entries(theVariations))
            {

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

    var elem = document.getElementById("search_result");
    elem.innerHTML = "Search Results:&nbsp;&nbsp;"+theTotal+ " found";

    document.getElementById('output').value = theOutput;

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

var gTheJSON = null;

var gTheParsedJSON = null;

//
// Initialization 
//
function DoStartup() {

    document.getElementById('output').value = "";

    // Reset file selectors
    var fileElement = document.getElementById('selectjsonfile');

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
        document.getElementById("selectjsonfile").removeAttribute("accept");
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
    document.getElementById("selectjsonfile").onchange = () => {

        let fileElement = document.getElementById("selectjsonfile");

        let file = fileElement.files[0];
       
        const reader = new FileReader();

        reader.addEventListener('load', (event) => {

            var elem = document.getElementById("status");
            elem.innerHTML = "JSON file loaded:&nbsp;&nbsp;"+file.name;

            elem = document.getElementById("search_result");
            elem.innerHTML = "Search Results:";
           
            gTheRawJSON = event.target.result;

            gTheParsedJSON = JSON.parse(gTheRawJSON);

            // Reset file selectors
            let fileElement = document.getElementById('selectjsonfile');

            fileElement.value = "";


        });

        reader.readAsText(file);

    }

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