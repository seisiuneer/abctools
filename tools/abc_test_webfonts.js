//
// abc_test_webfonts.js
//
// Tests all webfonts for use in ABC font directives
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
var gSaveFilename2 = "";

//
// Main processor
//

//
// Create a centered prompt string
//
function makeCenteredPromptString(thePrompt) {
    return '<p style="font-size:12pt;line-height:18pt;font-family:helvetica;text-align:center">' + thePrompt + '</p>';
}

//
// Save the Output to a file
//
function saveOutput(elName) {

    var theData = document.getElementById(elName).value;

    if (theData.length == 0) {

        var thePrompt = makeCenteredPromptString("No font family names to save!");

        DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 100
        });

        return;
    }

    var thePlaceholder = "";
    var thePrompt = "";

    if (elName == "output") {
        if (gSaveFilename == "") {
            gSaveFilename = "full_and_postscript_fonts.txt";
        }
        thePlaceholder = gSaveFilename;
        thePrompt = "Please enter a filename for the Full and Postscript font family names file:";
    } else {
        if (gSaveFilename2 == "") {
            gSaveFilename2 = "abc_compatible_fonts.txt";
        }
        thePlaceholder = gSaveFilename2;
        thePrompt = "Please enter a filename for the ABC-compatible font family names file:";
    }


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

        if (elName == "output") {
            gSaveFilename = fname;
        }
        else{
           gSaveFilename2 = fname; 
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
function copyOutputToClipboard(elName, buttonName) {

    var textToCopy = document.getElementById(elName).value;

    if (textToCopy.length == 0) {

        var thePrompt = makeCenteredPromptString("No font family names to copy!");

        DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 100
        });

        return;

    }

    copyToClipboard(textToCopy);

    // Give some feedback
    if (buttonName == "copybutton") {
        document.getElementById(buttonName).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Full and Postscript Font family name list copied!&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    } else {
        document.getElementById(buttonName).innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ABC-compatible font family name list copied!&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
    }

    setTimeout(function() {

        if (buttonName == "copybutton") {

            document.getElementById(buttonName).innerHTML = "Copy Full and Postscript font family names to the clipboard";
        } else {
            document.getElementById(buttonName).innerHTML = "Copy ABC-compatible font family names to the clipboard";
        }

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

        var thePrompt = makeCenteredPromptString("CopyToClipboard error: " + error);

        DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 100
        });

    }
}

// ----------  CANVAS PROBE  ----------
function isFontAvailable(fontName) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    context.font = '72px monospace';
    const baseline = context.measureText('abcdefghijklmnopqrstuvwxyz0123456789').width;

    context.font = `72px '${fontName}', monospace`;
    return context.measureText('abcdefghijklmnopqrstuvwxyz0123456789').width !== baseline;
}

// ----------  PARSE BOTH FULL + ABC NAMES  ----------
function extractFontNames(rawText) {
    const lines = rawText.split(/\r?\n/);
    const fontSet = new Set();

    for (let i = 0; i < lines.length; i++) {
        const fullMatch = lines[i].match(/^      Full name\s*:\s*(.+)$/i);
        if (fullMatch) {
            fontSet.add(fullMatch[1].trim());
        }

        const abcMatch = lines[i].match(/^Postscript name\s*:\s*(.+)$/i);
        if (abcMatch) {
            fontSet.add(abcMatch[1].trim());
        }
    }

    return [...fontSet]; // Convert Set to Array
}

// Check fonts compatible with this browser
async function doCompatibleFontQuery() {

    const outputEl = document.getElementById('output2');

    let result = '';
    let nFonts = 0;

    const rawList = document.getElementById('output').value || '';
    const fontNames = extractFontNames(rawList);

    if (fontNames.length === 0) {

        var thePrompt = makeCenteredPromptString("No fonts to test.");

        DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 100
        });

        return;

    } else {

        for (const name of fontNames) {
            if (isFontAvailable(name)) {
                result += `${name}\n`;
                nFonts++;
            }
        }
        if (nFonts === 0) {

            var thePrompt = makeCenteredPromptString("None of the webfonts are compatible with this browser.");

            DayPilot.Modal.alert(thePrompt, {
                theme: "modal_flat",
                top: 100
            });

            return;

        }

        elem = document.getElementById("fontnamelist2");
        elem.innerHTML = "ABC-Compatible Font Family Names:&nbsp;&nbsp;(" + nFonts + " found)";

    }

    // -- 3. Update UI  --
    if (outputEl) outputEl.value = result;
}

//
// Get the list of fonts available to the browser
// 
async function doFontQuery() {

    var elem = document.getElementById("output");

    elem.value = "";

    elem = document.getElementById("output2");

    elem.value = "";

    try {
        const availableFonts = await window.queryLocalFonts();

        var result = "";

        var nFonts = 0;

        for (const fontData of availableFonts) {
            result += "      Full name: " + fontData.fullName + "\n";
            result += "Postscript name: " + fontData.postscriptName + "\n\n";
            nFonts++;
        }

        var elem = document.getElementById("output");

        output.value = result;

        elem = document.getElementById("fontnamelist");
        elem.innerHTML = "All Full and Postscript Font Family Name Pairs:&nbsp;&nbsp;(" + nFonts + " pairs)";

        await doCompatibleFontQuery();

    } catch (err) {

        var thePrompt = makeCenteredPromptString("Error reading the list of web fonts: " + err);

        DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 50
        });

        return;

    }
}

async function queryFonts() {

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
function isSafari() {

    if (/Safari/i.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor)) {
        return true;
    } else {
        return false;
    }
}

//
// Are we on Chrome?
//
function isChrome() {

    if (/chrome|chromium|crios/i.test(navigator.userAgent)) {
        return true;
    } else {
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

    // Reset file selectors
    var fileElement = document.getElementById('selectfontfile');

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

    // Are we on Safari?
    gIsSafari = false;
    if (isSafari()) {
        gIsSafari = true;
    }

    // Are we on Chrome?
    gIsChrome = false;

    if (!gIsSafari) {
        if (isChrome()) {
            gIsChrome = true;
        }
    }

    // If not on Chrome, hide the query button
    if (!gIsChrome) {
        var elem=document.getElementById("queryfonts");
        elem.style.display = "none";
    }

    if (gIsIOS) {
        fileElement.removeAttribute("accept");
    }

    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }

    //
    // Setup the file import control
    //
    fileElement.onchange = () => {

        let fileElement = document.getElementById("selectfontfile");

        let file = fileElement.files[0];

        var fname = file.name;

        // Trim any whitespace
        fname = fname.trim();

        // Strip out any naughty HTML tag characters
        fname = fname.replace(/[^a-zA-Z0-9_\-. ]+/ig, '');

        // Replace any spaces
        fname = fname.replace(/\s/g, '_');

        // Strip the extension
        fname = fname.replace(/\..+$/, '');

        document.getElementById('output').value = "";
        document.getElementById('output2').value = "";

        const reader = new FileReader();

        reader.addEventListener('load', async (event) => {

            var theFontList = event.target.result;

            document.getElementById('output').value = theFontList;

            const lines = theFontList.split('\n').filter(line => line.trim() !== '');
            var nFonts = lines.length / 2;

            var elem = document.getElementById("fontnamelist");
            elem.innerHTML = "All Full and Postscript Font Family Name Pairs:&nbsp;&nbsp;(" + nFonts + " pairs)";

            // Reset file selectors
            let fileElement = document.getElementById('selectfontfile');

            fileElement.value = "";

            doCompatibleFontQuery();

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