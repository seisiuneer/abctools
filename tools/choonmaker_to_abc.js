//
// choonmaker_to_abc.js
//
// Reel/Jig Choonmaker to ABC Transcoder
//
// Michael Eskin
// https://michaeleskin.com
//
// Released under CC0 - No Rights Reserved
// https://creativecommons.org/share-your-work/public-domain/cc0/
//

var verbose = false;

// Globals
var abcOutput = "";
var keySignature = null;

// Suggested filename for save
var gSaveFilename = "";


//
// Count the tunes in the text area
//
function countTunes(theABC) {

    // Count the tunes in the ABC
    var theNotes = theABC;

    var theTunes = theNotes.split(/^X:.*$/gm);

    var nTunes = theTunes.length - 1;

    return nTunes;

}

//
// Inject font directive number directive 
//
function InjectOneDirective(theTune, theDirective) {

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

function generateABCWithChordsFromJSON(data) {
  const tuneTitle = document.getElementById("tune_title").value;
  const tuneType = data.tuneType?.toLowerCase();
  const isJig = tuneType === "jig";
  const isReel = tuneType === "reel";

  const meter = isJig ? "6/8" : "4/4";
  const notesPerBar = isJig ? 6 : 8;
  const groupDuration = isJig ? 3 : 4;
  const barsPerLine = 4;
  const qtag = isJig ? "3/8=120" : "1/2=120";
  const swing = data.swing / 100;
  const key = document.getElementById("abc-key-signature").value;

  const header = [
    "X:1",
    `T:${tuneTitle}`,
    `M:${meter}`,
    "L:1/8",
    `Q:${qtag}`,
    `K:${key}`,
    "%force_power_chords",
    `%swing ${swing}`
  ];

  // Handle click pattern if present
  if (Array.isArray(data.clickPattern) && data.clickPattern.some((v) => v !== 0)) {
    const zCount = isJig ? 6 : 8;
    const pattern = data.clickPattern.slice(0, zCount);
    const drumLine = pattern.map(v => (v !== 0 ? "d" : "z")).join("");
    const midiNotes = pattern.map(v => v === 1 ? 47 : v === 2 ? 47 : 0).join(" ");
    const accents = pattern.map(v => v === 1 ? 24 : v === 2 ? 64 : 0).join(" ");

    // Strip zeros
    var drumLineFinal = `%%MIDI drum ${drumLine} ${midiNotes} ${accents}`
    drumLineFinal = drumLineFinal.replace(/\b0\b ?/g, '');

    header.push(drumLineFinal);
    header.push("%%MIDI drumon");
  }

  const labelToChord = (label) => {
    if (!label) return null;
    return label.replace(/[0-9]/g, "");
  };

  const labelToABCPitch = (label) => {
    if (!label) return "z";
    const match = label.match(/^([A-Ga-g])(#|b)?(\d)$/);
    if (!match) return "z";
    let [, note, accidental, octave] = match;
    octave = parseInt(octave, 10);

    let abcNote = note.toLowerCase();
    if (octave > 4) abcNote += "'".repeat(octave - 5);
    else if (octave < 4) abcNote = note.toUpperCase() + ",".repeat(3 - octave);
    else abcNote = note;

    if (accidental === "#") abcNote = "^" + abcNote;
    else if (accidental === "b") abcNote = "_" + abcNote;

    return abcNote;
  };

  const compressRests = (restStrs) => {
    const result = [];
    let count = 0;

    for (let i = 0; i <= restStrs.length; i++) {
      if (restStrs[i] === "z") {
        count++;
      } else {
        while (count > 0) {
          if (isJig) {
            if (count >= 3) {
              result.push("z3");
              count -= 3;
            } else if (count === 2) {
              result.push("z2");
              count -= 2;
            } else {
              result.push("z");
              count -= 1;
            }
          } else {
            if (count >= 4) {
              result.push("z4");
              count -= 4;
            } else if (count === 3) {
              result.push("z3");
              count -= 3;
            } else if (count === 2) {
              result.push("z2");
              count -= 2;
            } else {
              result.push("z");
              count -= 1;
            }
          }
        }
        if (restStrs[i]) result.push(restStrs[i]);
      }
    }

    return result;
  };

  const formatBar = (barNotes) => {
    const compressed = compressRests(barNotes);
    let groupStr = "";
    let groupDur = 0;
    for (const n of compressed) {
      const match = n.match(/(\d+)/);
      const dur = match ? parseInt(match[1]) : 1;
      groupStr += n;
      groupDur += dur;
      if (groupDur >= groupDuration) {
        groupStr += " ";
        groupDur = 0;
      }
    }
    return groupStr.trim() + " |";
  };

  const allBars = [];

  for (const section of data.sequenceData) {
    const melodyNotes = section.melody.main;
    const bassNotes = section.bass.main;

    let mainBars = [];
    let altBars = [];

    const buildBars = (melody, bass) => {
      const bars = [];
      let barNotes = [];
      let noteCount = 0;
      let i = 0;

      while (i < melody.length) {
        let melNote = melody[i];
        let bassNote = bass[i];

        let noteDuration = 1;
        let j = i + 1;

        while (j < melody.length && melNote?.tie && melody[j]?.label === melNote.label) {
          noteDuration++;
          melNote = melody[j];
          j++;
        }

        const abcNoteBase = melody[i]?.label ? labelToABCPitch(melody[i].label) : "z";
        const chord = bass[i]?.label ? `"${labelToChord(bass[i].label)}"` : "";

        let remaining = noteDuration;
        while (remaining > 0) {
          const roomInBar = notesPerBar - noteCount;
          const durationThisBar = Math.min(roomInBar, remaining);
          const noteFragment = abcNoteBase + (durationThisBar > 1 ? durationThisBar : "");
          const full = chord + noteFragment + (remaining > durationThisBar ? "-" : "");
          barNotes.push(full);
          noteCount += durationThisBar;
          remaining -= durationThisBar;

          if (noteCount === notesPerBar) {
            bars.push(formatBar(barNotes));
            barNotes = [];
            noteCount = 0;
          }
        }

        i += noteDuration;
      }

      if (barNotes.length > 0) {
        bars.push(formatBar(barNotes));
      }

      return bars;
    };

    mainBars = buildBars(melodyNotes, bassNotes);

    if (section.diffOnRepEnabled && section.diffOnRepBars > 0 && Array.isArray(section.diff)) {
      const diffMelody = section.diff.map(n => n.melody);
      const diffBass = section.diff.map(n => n.bass);

      const firstEndingBars = mainBars.slice(0, -section.diffOnRepBars);
      const firstEnding = mainBars.slice(-section.diffOnRepBars);
      const secondEnding = buildBars(diffMelody, diffBass);

      if (data.repeatParts) {
        if (firstEndingBars.length > 0) {
          firstEndingBars[0] = "|:" + firstEndingBars[0];
        }
        if (secondEnding.length > 0) {
          secondEnding[secondEnding.length - 1] = secondEnding[secondEnding.length - 1].replace(/\|$/, "|]");
        }
      }

      // Line with 1st and 2nd endings inline
      const endingLine = ["[1", ...firstEnding, ":|", "[2", ...secondEnding].join(" ");
      allBars.push(...firstEndingBars, endingLine, "");
    } else {
      if (data.repeatParts && mainBars.length > 0) {
        mainBars[0] = "|:" + mainBars[0];
        mainBars[mainBars.length - 1] = mainBars[mainBars.length - 1].replace(/\|$/, ":|");
      }
      allBars.push(...mainBars);
    }
  }

  if ((!data.repeatParts) && allBars.length) {
    allBars[allBars.length - 1] = allBars[allBars.length - 1].replace(/\|$/, "|]");
  }

  const lines = [];
  for (let i = 0; i < allBars.length; i += barsPerLine) {
    const chunk = allBars.slice(i, i + barsPerLine).filter(Boolean).join(" ");
    if (chunk) lines.push(chunk);
  }

  return [...header, ...lines].join("\n");
}


//
// Main processor
//
function transcodeJSON() {

    var theJSON = document.getElementById('input').value;

    theJSON = JSON.parse(theJSON);

    var result = generateABCWithChordsFromJSON(theJSON);

    document.getElementById("output").value = result;

    // Give some feedback
    document.getElementById("transcodeJSON").innerHTML = "Transcode Reel/Jig Choon Maker JSON Transcoded!";

    setTimeout(function() {

        document.getElementById("transcodeJSON").innerHTML = "Transcode Reel/Jig Choon Maker JSON to ABC";

    }, 1250);

}

//
// Save the Output to a .abc file
//
function saveOutput() {

    var theData = document.getElementById("output").value;

    if (theData.length == 0) {

        DayPilot.Modal.alert("Nothing to save!", {
            theme: "modal_flat",
            top: 50
        });

        return;
    }

    if (gSaveFilename == "") {
        gSaveFilename = "harmonica_tab";
    }

    var thePlaceholder = gSaveFilename;


    var thePrompt = "Please enter a filename for your output ABC file:";

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
            top: 50
        });

        return;

    }

    var shareName = "Choon Maker Test";

    var abcInLZW = LZString.compressToEncodedURIComponent(abcText);

    var url = "https://michaeleskin.com/abctools/abctools.html?lzw=" + abcInLZW + "&format=noten&ssp=45&pdf=one&pn=br&fp=yes&btfs=10&name=" + shareName + "&editor=1";

    if (url.length > 8100) {

        DayPilot.Modal.alert("Output too long to test!", {
            theme: "modal_flat",
            top: 50
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
function DoStartup() {

    var theValue = "";

    document.getElementById('tune_title').value = "Tune Title";
    document.getElementById('input').value = theValue;
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

    //
    // Setup the file import control
    //
    document.getElementById("selectjsonfile").onchange = () => {

        let fileElement = document.getElementById("selectjsonfile");

        let file = fileElement.files[0];

        gSaveFilename = file.name;

        // Trim any whitespace
        gSaveFilename = gSaveFilename.trim();

        // Strip out any naughty HTML tag characters
        gSaveFilename = gSaveFilename.replace(/[^a-zA-Z0-9_\-. ]+/ig, '');

        // Replace any spaces
        gSaveFilename = gSaveFilename.replace(/\s/g, '_');

        // Strip the extension
        gSaveFilename = gSaveFilename.replace(/\..+$/, '');

        // Clean up the notation while the new file is loading
        document.getElementById('input').value = "";

        const reader = new FileReader();

        reader.addEventListener('load', (event) => {

            document.getElementById('input').value = event.target.result;

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