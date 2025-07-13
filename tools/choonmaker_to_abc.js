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

  const labelToChord = (label) => {
    if (!label) return null;
    return label.replace(/[0-9]/g, "");
  };

  const labelToABCPitch = (label) => {
    if (!label) return "z"; // Rest
    const match = label.match(/^([A-Ga-g])(#|b)?(\d)$/);
    if (!match) return "z"; // Rest

    let [, note, accidental, octave] = match;
    octave = parseInt(octave, 10);

    let abcNote = note.toLowerCase();
    if (octave > 4) {
      abcNote += "'".repeat(octave - 5);
    } else if (octave < 4) {
      abcNote = note.toUpperCase() + ",".repeat(3 - octave);
    } else {
      abcNote = note;
    }

    if (accidental === "#") abcNote = "^" + abcNote;
    else if (accidental === "b") abcNote = "_" + abcNote;

    return abcNote;
  };

  // Updated combineRests based on jig/reel rules for grouping rests
  const combineRests = (notes) => {
    const combined = [];
    let restCount = 0;

    const flushRests = () => {
      if (restCount === 0) return;

      if (isJig) {
        // Jig: group rests in 3s max
        while (restCount > 0) {
          if (restCount >= 3) {
            combined.push("z3");
            restCount -= 3;
          } else if (restCount === 2) {
            combined.push("z2");
            restCount -= 2;
          } else if (restCount === 1) {
            combined.push("z");
            restCount -= 1;
          }
        }
      } else if (isReel) {
        // Reel: group rests in 4s max
        while (restCount > 0) {
          if (restCount >= 4) {
            combined.push("z4");
            restCount -= 4;
          } else if (restCount === 3) {
            combined.push("z3");
            restCount -= 3;
          } else if (restCount === 2) {
            combined.push("z2");
            restCount -= 2;
          } else if (restCount === 1) {
            combined.push("z");
            restCount -= 1;
          }
        }
      } else {
        // Default fallback: no grouping
        for (let i = 0; i < restCount; i++) {
          combined.push("z");
        }
        restCount = 0;
      }
    };

    for (const n of notes) {
      if (/^z(\d*)$/.test(n)) {
        const durMatch = n.match(/^z(\d*)$/);
        const dur = durMatch && durMatch[1] ? parseInt(durMatch[1]) : 1;
        restCount += dur;
      } else {
        flushRests();
        combined.push(n);
      }
    }
    flushRests();

    return combined;
  };

  const processBars = (melodyNotes, bassNotes, startIndex = 0, endIndex = melodyNotes.length) => {
    const bars = [];
    let barNotes = [];
    let noteCount = 0;
    let i = startIndex;

    while (i < endIndex) {
      let melNote = melodyNotes[i];
      let bassNote = bassNotes[i];

      let noteDuration = 1;
      let j = i + 1;

      while (
        j < endIndex &&
        melNote?.tie &&
        melodyNotes[j]?.label === melNote.label
      ) {
        noteDuration++;
        melNote = melodyNotes[j];
        j++;
      }

      let crossesBarline = false;
      if (
        Math.floor((noteCount + noteDuration - 1) / notesPerBar) >
        Math.floor(noteCount / notesPerBar)
      ) {
        crossesBarline = true;
      }

      const abcNoteBase =
        melodyNotes[i] && melodyNotes[i].label
          ? labelToABCPitch(melodyNotes[i].label)
          : "z";
      const chord =
        bassNotes[i] && bassNotes[i].label && abcNoteBase !== "z"
          ? `"${labelToChord(bassNotes[i].label)}"`
          : "";

      if (crossesBarline) {
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
            // Combine rests first
            const combinedBarNotes = combineRests(barNotes);
            bars.push(groupAndFlush(combinedBarNotes));
            barNotes = [];
            noteCount = 0;
          }
        }
      } else {
        const fullNote = chord + abcNoteBase + (noteDuration > 1 ? noteDuration : "");
        barNotes.push(fullNote);
        noteCount += noteDuration;

        if (noteCount === notesPerBar) {
          // Combine rests first
          const combinedBarNotes = combineRests(barNotes);
          bars.push(groupAndFlush(combinedBarNotes));
          barNotes = [];
          noteCount = 0;
        }
      }

      i += noteDuration;
    }

    if (barNotes.length > 0) {
      const combinedBarNotes = combineRests(barNotes);
      bars.push(groupAndFlush(combinedBarNotes));
    }

    return bars;
  };

  const groupAndFlush = (barNotes) => {
    let groupStr = "";
    let groupDur = 0;
    for (const n of barNotes) {
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
    const useDiffs = section.diffOnRepEnabled;
    const diffBars = section.diffOnRepBars || 0;

    const melodyMain = section.melody.main;
    const bassMain = section.bass.main;
    const melodyDiff = section.melody.diff || [];
    const bassDiff = section.bass.diff || [];

    const mainBars = processBars(melodyMain, bassMain);
    const splitPoint = mainBars.length - diffBars;

    if (data.repeatParts && useDiffs && diffBars > 0 && melodyDiff.length > 0) {
      const common = mainBars.slice(0, splitPoint);
      const firstEnding = mainBars.slice(splitPoint);
      const secondEnding = processBars(melodyDiff, bassDiff);

      if (common.length > 0) common[0] = "|:" + common[0];

      if (firstEnding.length > 0) firstEnding[0] = "[1 " + firstEnding[0];
      if (firstEnding.length > 0) {
        firstEnding[firstEnding.length - 1] =
          firstEnding[firstEnding.length - 1].replace(/\|$/, ":|");
      }

      if (secondEnding.length > 0) {
        secondEnding[0] = "[2 " + secondEnding[0];
        const lastIdx = secondEnding.length - 1;
        if (section === data.sequenceData[data.sequenceData.length - 1]) {
          secondEnding[lastIdx] = secondEnding[lastIdx].replace(/\|$/, "|]");
        } else {
          secondEnding[lastIdx] = secondEnding[lastIdx].replace(/\|$/, "||");
        }
      }

      const combinedLastLine = [firstEnding.pop(), secondEnding.shift()].join(" ");
      allBars.push(...common, ...firstEnding, combinedLastLine, ...secondEnding);
    } else {
      if (data.repeatParts && mainBars.length > 0) {
        mainBars[0] = "|:" + mainBars[0];
        mainBars[mainBars.length - 1] = mainBars[mainBars.length - 1].replace(/\|$/, ":|");
      }

      if (
        section === data.sequenceData[data.sequenceData.length - 1] &&
        !useDiffs &&
        mainBars.length > 0
      ) {
        const lastIdx = mainBars.length - 1;
        mainBars[lastIdx] = mainBars[lastIdx].replace(/\|$/, "|]");
      }

      allBars.push(...mainBars);
    }
  }

  const lines = [];
  for (let i = 0; i < allBars.length; i += barsPerLine) {
    lines.push(allBars.slice(i, i + barsPerLine).join(" "));
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