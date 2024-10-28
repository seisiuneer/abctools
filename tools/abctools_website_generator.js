//
// abc_site_generator.js
//
// ABC Tools Player Website Generator
//
// Opens a ABC tune collection file and creates a website that can play each of the tunes
//
// Michael Eskin
// https://michaeleskin.com
//

var verbose = false;

// Suggested filename for save
var gSaveFilename = "";

//
// Create a centered prompt string
//
function makeCenteredPromptString(thePrompt){
    return '<p style="font-size:12pt;line-height:18pt;font-family:helvetica;text-align:center">'+thePrompt+'</p>';
}


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
            // MAE 13 Sep 2024 - Allow spaces in filenames
            //fname = fname.replace(/[ ]+/ig, '_',)
            fname = fname.replace(/[^a-zA-Z0-9_\-. ]+/ig, '');

            return fname+extension;

        }
    }

    // Failed to find a tune title, return a default
    return "output"+extension;
}

//
// Generate a share link for either all the tunes or just what's passed in
//
function FillUrlBoxWithAbcInLZW(ABCtoEncode,bUpdateUI) {

    var abcInLZW = LZString.compressToEncodedURIComponent(ABCtoEncode);

    var url = "https://michaeleskin.com/abctools/abctools.html?lzw=" + abcInLZW + "&format=noten&ssp=10&play=1";

    // If just encoding some ABC, return it now
    return url;

}

function getLinesUpToFirstBlank(text) {
    const lines = text.split('\n');
    let result = [];

    for (let line of lines) {
        if (line.trim() === "") {
            break;  // Stop at the first blank line
        }
        result.push(line);
    }

    return result.join('\n');
}

function getTuneByIndex(theABC,tuneNumber){

    // Now find all the X: items
    var theTunes = theABC.split(/^X:/gm);

    var theTune = "X:"+theTunes[tuneNumber+1];

    theTune = getLinesUpToFirstBlank(theTune);

    return theTune;

}

//
// Export all the tunes Share URL in a JSON file
//
function BatchJSONExport(theABC){

    // Make sure there are tunes to convert

    var theTunes = theABC.split(/^X:.*$/gm);

    var nTunes = theTunes.length - 1;

    if (nTunes == 0){
        return null;
    }

    var theJSON = [];

    for (var i=0;i<nTunes;++i){

        var thisTune = getTuneByIndex(theABC,i);

        var title = GetTuneAudioDownloadName(thisTune,"");

        var theURL = FillUrlBoxWithAbcInLZW(thisTune,false);

        var titleURL = title.replaceAll(" ","_");

        theURL+="&name="+titleURL+"&play=1";

        theJSON.push({Name:title,URL:theURL});

    }

    var theJSONString = "const tunes="+JSON.stringify(theJSON)+";";

    return theJSONString;

}

//
// Generate the website
//
function generateWebsite() {

    var theOutput = "";

    //debugger;
    if (!gTheABC){

        var thePrompt = "No ABC File Loaded!";

        thePrompt = makeCenteredPromptString(thePrompt);

        DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    var theJSON = BatchJSONExport(gTheABC);

    if (!theJSON){

        var thePrompt = "Problem generating tune share links!";

        thePrompt = makeCenteredPromptString(thePrompt);

          DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    // Create the website code

    // Header
    theOutput += "<!DOCTYPE html>\n";
    theOutput +="\n";
    theOutput +='<html lang="en">\n';
    theOutput +="\n";
    theOutput +="<head>\n";
    theOutput +="\n";
    theOutput +='<meta charset="UTF-8">\n';
    theOutput +="\n";
    theOutput +="<title>ABC Transcription Tools Generated Website</title>\n";
    theOutput +="\n";

    // CSS
    theOutput +="<style>\n";
    theOutput +="\n";
    theOutput +="    body {\n";
    theOutput +="        font-family: Arial, sans-serif;\n";
    theOutput +="        background-color: #ffffff;\n";
    theOutput +="        margin: 0px;\n";
    theOutput +="        padding: 0px;\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    .container {\n";
    theOutput +="        max-width: 1024px;\n";
    theOutput +="        margin: 0 auto;\n";
    theOutput +="        text-align: center;\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    h1 {\n";
    theOutput +="        font-size: 28px;\n";
    theOutput +="        margin-top: 20px;\n";
    theOutput +="        margin-bottom: 20px;\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    h2 {\n";
    theOutput +="        font-size: 18px;\n";
    theOutput +="        margin-bottom: 20px;\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    select {\n";
    theOutput +="        -webkit-appearance: none;\n";
    theOutput +="        -moz-appearance: none;\n";
    theOutput +="        appearance: none;\n";
    theOutput +="        background: url(\"data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' fill=\'%238C98F2\'><polygon points=\'0,0 100,0 50,50\'/></svg>\") no-repeat;\n";
    theOutput +="        background-size: 12px;\n";
    theOutput +="        background-position: calc(100% - 10px) center;\n";
    theOutput +="        background-repeat: no-repeat;\n";
    theOutput +="        background-color: #efefef;\n";
    theOutput +="        color:black;\n";
    theOutput +="        font-size: 18px;\n";
    theOutput +="        padding: 5px;\n";
    theOutput +="        margin-bottom: 20px;\n";
    theOutput +="        width: 350px;\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    iframe {\n";
    theOutput +="        border: 1px solid #ccc;\n";
    theOutput +="    }\n";
    theOutput +="</style>\n";
    theOutput +="\n";
    theOutput +="</head>\n";
    theOutput +="\n";

    // HTML
    theOutput +="<body>\n";
    theOutput +="\n";
    theOutput +='    <div class="container">\n';
    theOutput +="        <h1>ABC Transcription Tools Generated Website</h1>\n";
    theOutput +="        <h2>Select a tune from the dropdown to load it into the frame below:</h2>\n";
    theOutput +='        <select id="tuneSelector">\n';
    theOutput +='            <option value="">Click to Select a Tune</option>\n';
    theOutput +="        </select>\n";
    theOutput +='        <iframe id="tuneFrame" src="" title="Embedded ABC Transcription Tools" height="900" width="900"></iframe>\n';
    theOutput +="    </div>\n";
    theOutput +="\n";

    // JavaScript
    theOutput +="    <script>\n";
    theOutput +="\n";
    theOutput += "    "+theJSON;
    theOutput +="\n";
    theOutput +="\n";
    theOutput +="    // Populate the selector with options from JSON\n";
    theOutput +="    document.addEventListener('DOMContentLoaded', () => {\n";
    theOutput +="        const tuneSelector = document.getElementById('tuneSelector');\n";
    theOutput +="        const tuneFrame = document.getElementById('tuneFrame');\n";
    theOutput +="\n";
    theOutput +="       tunes.forEach(tune => {\n";
    theOutput +="            const option = document.createElement('option');\n";
    theOutput +="            option.value = tune.URL;\n";
    theOutput +="            option.textContent = tune.Name;\n";
    theOutput +="            tuneSelector.appendChild(option);\n";
    theOutput +="        });\n";
    theOutput +="\n";
    theOutput +="    // Update iframe src when an option is selected\n";
    theOutput +="    tuneSelector.addEventListener('change', () => {\n";
    theOutput +="        tuneFrame.src = tuneSelector.value;\n";
    theOutput +="        });\n";
    theOutput +="    });\n";    
    theOutput +="\n";
    theOutput +="</script>\n";
    theOutput +="\n";
    theOutput +="</body>\n";
    theOutput +="\n";
    theOutput +="</html>\n";

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
        gSaveFilename = "abctools_website.html";
    }

    var thePlaceholder = gSaveFilename;

    var thePrompt = "Please enter a filename for your output website HTML file:";

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

            if ((!fname.endsWith(".html")) && (!fname.endsWith(".txt")) && (!fname.endsWith(".HTML")) && (!fname.endsWith(".TXT"))) {

                // Give it a good extension
                fname = fname.replace(/\..+$/, '');
                fname = fname + ".html";

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
    document.getElementById("copybutton").innerHTML = "Website code copied to the clipboard!";

    setTimeout(function() {

        document.getElementById("copybutton").innerHTML = "Copy Website code to the clipboard";

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
var gTheABC = null;
//
// Initialization 
//
function DoStartup() {

    document.getElementById('output').value = "";

    // Reset file selectors
    var fileElement = document.getElementById('selectabcfile');

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
        document.getElementById("selectabcfile").removeAttribute("accept");
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
    document.getElementById("selectabcfile").onchange = () => {

        let fileElement = document.getElementById("selectabcfile");

        let file = fileElement.files[0];
       
        const reader = new FileReader();

        reader.addEventListener('load', (event) => {

            var elem = document.getElementById("status");
            elem.innerHTML = "ABC file loaded:&nbsp;&nbsp;"+file.name;

            // Save the ABC
            gTheABC = event.target.result;

            // Reset file selectors
            let fileElement = document.getElementById('selectabcfile');

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