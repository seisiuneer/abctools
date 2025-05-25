//
// chrome_webfonts.js
//
// Get all Chrome webfonts for use in ABC font directives
//
// Michael Eskin
// https://michaeleskin.com
//
// Released under CC0 - No Rights Reserved
// https://creativecommons.org/share-your-work/public-domain/cc0/
//


// Globals

// Suggested filename for save
var gSaveFilename = "";

//
// Main processor
//

//
// Create a centered prompt string
//
function makeCenteredPromptString(thePrompt){
    return '<p style="font-size:12pt;line-height:18pt;font-family:helvetica;text-align:center">'+thePrompt+'</p>';
}

//
// Save the Output to a file
//
function saveOutput() {

    var theData = document.getElementById("output").value;

    if (theData.length == 0) {

        var thePrompt = makeCenteredPromptString("No font names to save!");

        DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 100
        });

        return;
    }

    if (gSaveFilename == ""){
        gSaveFilename = "chrome_webfonts.txt";
    }

    var thePlaceholder = gSaveFilename;

    var thePrompt = "Please enter a filename for the font name list file:";

    DayPilot.Modal.prompt(thePrompt, thePlaceholder, {
        theme: "modal_flat",
        top: 194,
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

            if ((!fname.endsWith(".txt")) && (!fname.endsWith(".TXT"))) {

                // Give it a good extension
                fname = fname.replace(/\..+$/, '');
                fname = fname + ".txt";

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

        var thePrompt = makeCenteredPromptString("No font names to copy!");

        DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 100
        });

        return;

    }

    copyToClipboard(textToCopy);

    // Give some feedback
    document.getElementById("copybutton").innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Font name list copied!&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

    setTimeout(function() {

        document.getElementById("copybutton").innerHTML = "Copy font name list to the clipboard";

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
        
        var thePrompt = makeCenteredPromptString("CopyToClipboard error: "+error);

        DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 100
        });

    }
}

//
// Get the list of fonts available to the browser
// 
async function doFontQuery(){

    try {
      const availableFonts = await window.queryLocalFonts();

      var result = "";

      var nFonts = 0;
      
      for (const fontData of availableFonts) {
        result += fontData.postscriptName +"\n";
        nFonts++;
      }
      
      var elem = document.getElementById("output");
      
      output.value = result;

      elem = document.getElementById("fontnamelist");
      elem.innerHTML="List of Font Names: ("+nFonts+" found)";

    } catch (err) {

        var thePrompt = makeCenteredPromptString("Error reading the list of web fonts: "+err);

        DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 50
        });

        return;

    }
}

async function queryFonts(){

    await doFontQuery();
    
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

//
// Initialization 
//
async function DoStartup() {

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

    if (!gIsChrome){
       var thePrompt = makeCenteredPromptString("This utility only works on Chrome.");
        DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 100
        });
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