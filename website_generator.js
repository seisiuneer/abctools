//
// website_generator.js
//
// ABC Tools Player Website Generator
//
// Opens a ABC tune collection file and creates a website that can play each of the tunes
//
// Michael Eskin
// https://michaeleskin.com
//

//
// Export all the tunes Share URL in a JSON file
//
function BatchJSONExportForWebGenerator(theABC){

    // Make sure there are tunes to convert

    var theTunes = theABC.split(/^X:.*$/gm);

    var nTunes = theTunes.length - 1;

    if (nTunes == 0){
        return null;
    }

    var theJSON = [];

    for (var i=0;i<nTunes;++i){

        var thisTune = getTuneByIndex(i);

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

    var theABC = gTheABC.value;

    // Any tunes to reformat?
    if (CountTunes() == 0){

        var thePrompt = "No ABC tunes to export.";

        thePrompt = makeCenteredPromptString(thePrompt);

        DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    var theJSON = BatchJSONExportForWebGenerator(theABC);

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

    var theData = theOutput

    if (theData.length == 0) {

        DayPilot.Modal.alert("Nothing to save!", {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    var thePlaceholder = "abctools_website.html";

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
