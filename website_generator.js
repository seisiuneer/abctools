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
// Load Website settings
//
function LoadWebsiteSettings(){

    if (gLocalStorageAvailable){

        //debugger;

        var val = localStorage.WebsiteSoundFont;

        if (val){
            gWebsiteSoundFont = val;
        }
        else{
            gWebsiteSoundFont = "fluid";
        }

        val = localStorage.WebsiteInjectInstruments;
        if (val){
            gWebsiteInjectInstruments = (val == "true");
        }
        else{
            gWebsiteInjectInstruments = true;
        }

        val = localStorage.WebsiteBassInstrument;
        if (val){
            gWebsiteBassInstrument = val;
        }
        else{
            gWebsiteBassInstrument = 1;
        }

        val = localStorage.WebsiteBassInstrumentInject;
        if (val){
            gWebsiteBassInstrumentInject = val;
        }
        else{
            gWebsiteBassInstrumentInject = 1;
        }

        val = localStorage.WebsiteChordInstrument;
        if (val){
            gWebsiteChordInstrument = val;
        }
        else{
            gWebsiteChordInstrument = 1;
        }

        val = localStorage.WebsiteChordInstrumentInject;
        if (val){
            gWebsiteChordInstrumentInject = val;
        }
        else{
            gWebsiteChordInstrumentInject = 1;
        }

        val = localStorage.WebsiteBassVolume;
        if (val){
            gWebsiteBassVolume = val;
        }
        else{
            gWebsiteBassVolume = 64;
        }

        val = localStorage.WebsiteChordVolume;
        if (val){
            gWebsiteChordVolume = val;
        }
        else{
            gWebsiteChordVolume = 64;
        }

        val = localStorage.WebsiteMelodyInstrument;
        if (val){
            gWebsiteMelodyInstrument = val;
        }
        else{
            gWebsiteMelodyInstrument = 1;
        }

        val = localStorage.WebsiteMelodyInstrumentInject;
        if (val){
            gWebsiteMelodyInstrumentInject = val;
        }
        else{
            gWebsiteMelodyInstrumentInject = 1;
        }

        val = localStorage.WebsiteTitle;
        if (val || (val == "")){
            gWebsiteTitle = val;
        }
        else{
            gWebsiteTitle = "ABC Transcription Tools Generated Website";
        }

        val = localStorage.WebsiteSubtitle;
        if (val || (val == "")){
            gWebsiteSubtitle = val;
        }
        else{
            gWebsiteSubtitle = "Select a tune from the dropdown to load it into the frame below:";
        }

        val = localStorage.WebsiteFooter1;
        if (val || (val == "")){
            gWebsiteFooter1 = val;
        }
        else{
            gWebsiteFooter1 = "";
        }

        val = localStorage.WebsiteFooter2;
        if (val || (val == "")){
            gWebsiteFooter2 = val;
        }
        else{
            gWebsiteFooter2 = "";
        }

        val = localStorage.WebsiteWidth;
        if (val){
            gWebsiteWidth = val;
        }
        else{
            gWebsiteWidth = 900;
        }

        val = localStorage.WebsiteHeight;
        if (val){
            gWebsiteHeight = val;
        }
        else{
            gWebsiteHeight = 900;
        }

        val = localStorage.WebsiteColor;
        if (val){
            gWebsiteColor = val;
        }
        else{
            gWebsiteColor = "#FFFFFF";
        }

        val = localStorage.WebsiteTextColor;
        if (val){
            gWebsiteTextColor = val;
        }
        else{
            gWebsiteTextColor = "#000000";
        }

        val = localStorage.WebsiteHyperlinkColor;
        if (val){
            gWebsiteHyperlinkColor = val;
        }
        else{
            gWebsiteHyperlinkColor = "#000000";
        }

        val = localStorage.WebsiteResponsive;
        if (val){
            gWebsiteResponsive = (val == "true");
        }
        else{
            gWebsiteResponsive = true;
        }

        val = localStorage.WebsiteFilename;
        if (val){
            gWebsiteFilename = val;
        }
        else{
            gWebsiteFilename = "";
        }

        val = localStorage.WebsiteOpenInPlayer;
        if (val){
            gWebsiteOpenInPlayer = (val == "true");
        }
        else{
            gWebsiteOpenInPlayer = true;
        }

        val = localStorage.WebsiteDisableEdit;
        if (val){
            gWebsiteDisableEdit = (val == "true");
        }
        else{
            gWebsiteDisableEdit = false;
        }

        // Stuff the updated config
        gWebsiteConfig ={

            // Title
            website_title: gWebsiteTitle,

            // Subtitle
            website_subtitle: gWebsiteSubtitle,

            // Footer1
            website_footer1: gWebsiteFooter1,

            // Footer2
            website_footer2: gWebsiteFooter2,

            // Inject instruments?
            bInjectInstruments: gWebsiteInjectInstruments,

            // Sound font
            sound_font: gWebsiteSoundFont,

            // Melody Instrument
            melody_instrument: gWebsiteMelodyInstrument,

            // Bass Instrument
            bass_instrument: gWebsiteBassInstrument,

            // Bass Volume
            bass_volume: gWebsiteBassVolume,

            // Chord Instrument
            chord_instrument: gWebsiteChordInstrument,

            // Chord Volume
            chord_volume: gWebsiteChordVolume,

            // Website frame width
            website_width: gWebsiteWidth,

            // Website frame height
            website_height: gWebsiteHeight,

            // Background color
            website_color: gWebsiteColor,

            // Text color
            website_textcolor: gWebsiteTextColor,

            // Hyperlink color
            website_hyperlinkcolor: gWebsiteHyperlinkColor,

            // Responsive
            bResponsive: gWebsiteResponsive,

            // Open in player
            bOpenInPlayer: gWebsiteOpenInPlayer,

            // Disable editor
            bDisableEdit: gWebsiteDisableEdit

        }
    }
}

//
// Save Website settings
//
function SaveWebsiteSettings(){

    if (gLocalStorageAvailable){

        //debugger;

        localStorage.WebsiteSoundFont = gWebsiteSoundFont;
        localStorage.WebsiteInjectInstruments = gWebsiteInjectInstruments;
        localStorage.WebsiteBassInstrument = gWebsiteBassInstrument;
        localStorage.WebsiteBassInstrumentInject = gWebsiteBassInstrumentInject;
        localStorage.WebsiteChordInstrument = gWebsiteChordInstrument;
        localStorage.WebsiteChordInstrumentInject = gWebsiteChordInstrumentInject;
        localStorage.WebsiteBassVolume = gWebsiteBassVolume;
        localStorage.WebsiteChordVolume = gWebsiteChordVolume;
        localStorage.WebsiteMelodyInstrument = gWebsiteMelodyInstrument;
        localStorage.WebsiteMelodyInstrumentInject = gWebsiteMelodyInstrumentInject;
        localStorage.WebsiteTitle = gWebsiteTitle;
        localStorage.WebsiteSubtitle = gWebsiteSubtitle;
        localStorage.WebsiteFooter1 = gWebsiteFooter1;
        localStorage.WebsiteFooter2 = gWebsiteFooter2;
        localStorage.WebsiteWidth = gWebsiteWidth;
        localStorage.WebsiteHeight = gWebsiteHeight;
        localStorage.WebsiteColor = gWebsiteColor;
        localStorage.WebsiteTextColor = gWebsiteTextColor;
        localStorage.WebsiteHyperlinkColor = gWebsiteHyperlinkColor;
        localStorage.WebsiteResponsive = gWebsiteResponsive;
        localStorage.WebsiteOpenInPlayer = gWebsiteOpenInPlayer;
        localStorage.WebsiteDisableEdit = gWebsiteDisableEdit;

    }
}

//
// Inject the MIDI parameters into this tune
//
function WebsiteInjectInstruments(theTune){

    // Inject soundfont
    switch (gWebsiteSoundFont){

        case "fluid":
            theTune = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont fluid");
            break;
        case "musyng":
            theTune = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont musyng");
            break;
        case "fatboy":
            theTune = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont fatboy");
            break;
        case "canvas":
            theTune = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont canvas");
            break;
        case "mscore":
            theTune = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont mscore");
            break;
        case "arachno":
            theTune = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont arachno");
            break;
        case "fluidhq":
            theTune = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont fluidhq");
            break;
        default:
            theTune = InjectStringBelowTuneHeader(theTune, "%abcjs_soundfont fluid");
            break;
    }

    // Inject instrument
    // Offset by one to deal with mute instrument at offset zero
    theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI program "+gWebsiteMelodyInstrumentInject);
 
    theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI bassprog "+gWebsiteBassInstrumentInject);
    
    theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI chordprog "+gWebsiteChordInstrumentInject);
   
    // Inject bass volume
    theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI bassvol "+gWebsiteBassVolume);

    // Inject chord volume
    theTune = InjectStringBelowTuneHeader(theTune, "%%MIDI chordvol "+gWebsiteChordVolume);
    
    // Seeing extra linefeeds after the inject
    theTune = theTune.replace("\n\n","");

    return(theTune);

}

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

        if (gWebsiteInjectInstruments){

            thisTune = WebsiteInjectInstruments(thisTune);
        }

        var title = GetTuneAudioDownloadName(thisTune,"");

        var theURL = FillUrlBoxWithAbcInLZW(thisTune,false);

        var titleURL = title.replaceAll(" ","_");

        theURL+="&name="+titleURL;

        if (gWebsiteOpenInPlayer){
            theURL+="&play=1";
        }

        if (gWebsiteDisableEdit){
            theURL+="&dx=1";
        }

        theJSON.push({Name:title,URL:theURL});

    }

    var theJSONString = "const tunes="+JSON.stringify(theJSON)+";";

    return theJSONString;

}

//
// Generate the website
//
function generateAndSaveWebsite() {

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

    // Keep track of actions
    sendGoogleAnalytics("action","generateWebsite");

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

    if (gWebsiteResponsive){
        theOutput +='<meta name="viewport" content="width=860" />\n'; 
    }

    theOutput +="\n";
    theOutput +="<title>"+gWebsiteTitle+"</title>\n";
    theOutput +="\n";

    // CSS
    theOutput +="<style>\n";
    theOutput +="\n";
    theOutput +="    body {\n";
    theOutput +="        font-family: Arial, sans-serif;\n";
    if ((gWebsiteColor.indexOf("gradient") == -1) && (gWebsiteColor.indexOf("url(") == -1)){
        theOutput +="        background-color: "+gWebsiteColor+";\n";
    }
    else{
        theOutput +="        background-image: "+gWebsiteColor+";\n";        
    }
    theOutput +="        margin: 0px;\n";
    theOutput +="        padding: 0px;\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    .container {\n";
    theOutput +="        margin: 0 auto;\n";
    theOutput +="        text-align: center;\n";
    theOutput +="        overflow-x: hidden;\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    h1 {\n";
    theOutput +="        font-size: 28px;\n";
    theOutput +="        margin-top: 16px;\n";
    theOutput +="        margin-bottom: 0px;\n";
    theOutput +="        color: "+gWebsiteTextColor+";\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    h2 {\n";
    theOutput +="        font-size: 18px;\n";
    theOutput +="        margin-top: 14px;\n";
    theOutput +="        margin-bottom: 0px;\n";
    theOutput +="        color: "+gWebsiteTextColor+";\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    p {\n";
    theOutput +="        color: "+gWebsiteTextColor+";\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    a {\n";
    theOutput +="        color: "+gWebsiteHyperlinkColor+";\n";
    theOutput +="    }\n";
    theOutput +="    a:link {\n";
    theOutput +="        color: "+gWebsiteHyperlinkColor+";\n";
    theOutput +="    }\n";
    theOutput +="    a:visited {\n";
    theOutput +="        color: "+gWebsiteHyperlinkColor+";\n";
    theOutput +="    }\n";    
    theOutput +="    a:hover {\n";
    theOutput +="        color: "+gWebsiteHyperlinkColor+";\n";
    theOutput +="    }\n";    
    theOutput +="    a:active {\n";
    theOutput +="        color: "+gWebsiteHyperlinkColor+";\n";
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
    theOutput +="        margin-top: 12px;\n";
    theOutput +="        margin-bottom: 16px;\n";
    theOutput +="        width: 350px;\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    iframe {\n";
    theOutput +="        border: 1px solid #ccc;\n";
    theOutput +="        background-color: #ffffff;\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    #footer1{\n";
    theOutput +="        margin-top:12px;\n";
    theOutput +="        margin-bottom:12px;\n";
    theOutput +="        color:"+gWebsiteTextColor+";\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    #footer2{\n";
    theOutput +="        margin-top:12px;\n";
    theOutput +="        margin-bottom:0px;\n";
    theOutput +="        color:"+gWebsiteTextColor+";\n";
    theOutput +="    }\n";
    theOutput +="</style>\n";
    theOutput +="\n";
    theOutput +="</head>\n";
    theOutput +="\n";

    // HTML
    theOutput +="<body>\n";
    theOutput +="\n";
    theOutput +='    <div class="container">\n';
    var gotTitle = false;
    if (gWebsiteTitle && (gWebsiteTitle != "")){
        theOutput +="        <h1 id=\"title\">"+gWebsiteTitle+"</h1>\n";
        gotTitle = true;
    }
    var gotSubTitle = false;
    if (gWebsiteSubtitle && (gWebsiteSubtitle != "")){
        theOutput +="        <h2 id=\"subtitle\">"+gWebsiteSubtitle+"</h2>\n";
        gotSubTitle = true;
    }
    if (gotTitle || gotSubTitle){
    	theOutput +='        <select id="tuneSelector">\n';
    }
    else{
    	theOutput +='        <select id="tuneSelector" style="margin-top:18px;">\n';
    }
    theOutput +='            <option value="">Click to Select a Tune</option>\n';
    theOutput +="        </select>\n";
    theOutput +="        <br/>\n";
    if (!gWebsiteResponsive){
        theOutput +='        <iframe id="tuneFrame" src="" width="'+gWebsiteWidth+'" height="'+gWebsiteHeight+'"></iframe>\n';
    }
    else{
        theOutput +='        <iframe id="tuneFrame" src=""></iframe>\n';        
    }

    var gotFooter = false;
    if (gWebsiteFooter1 && (gWebsiteFooter1 != "")){
        theOutput +='        <p id="footer1">'+gWebsiteFooter1+'</p>\n';
        gotFooter = true;
    }
    if (gWebsiteFooter2 && (gWebsiteFooter2 != "")){

    	if (gotFooter){
        	theOutput +='        <p id="footer2">'+gWebsiteFooter2+'</p>\n';
        }
        else{
        	theOutput +='        <p id="footer2" style="margin-bottom:14px;">'+gWebsiteFooter2+'</p>\n';        	
        }
    }

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
    theOutput +="        if (tunes.length > 1){\n";
    theOutput +="           tunes.forEach(tune => {\n";
    theOutput +="               const option = document.createElement('option');\n";
    theOutput +="               option.value = tune.URL;\n";
    theOutput +="               option.textContent = tune.Name;\n";
    theOutput +="               tuneSelector.appendChild(option);\n";
    theOutput +="           });\n";
    theOutput +="\n";
    theOutput +="           // Update iframe src when an option is selected\n";
    theOutput +="           tuneSelector.addEventListener('change', () => {\n";
    theOutput +="           tuneFrame.src = tuneSelector.value;\n";
    theOutput +="           });\n";
    theOutput +="       }\n";
    theOutput +="       else{\n";
    theOutput +="           tuneSelector.style.display=\"none\";\n";
    theOutput +="           setTimeout(function(){\n"; 
    theOutput +="               tuneFrame.src = tunes[0].URL;\n";
    theOutput +="           },250);\n";
    theOutput +="       }\n";
    theOutput +=" \n";

    if (gWebsiteResponsive){
        theOutput +="       function getElementsTotalHeight() {\n";
        theOutput +="\n";
        theOutput +="           const ids = ['title', 'subtitle', 'tuneSelector', 'footer1', 'footer2'];\n";
        theOutput +="           let totalHeight = 0;\n";
        theOutput +="\n";
        theOutput +="           ids.forEach(id => {\n";
        theOutput +="               const element = document.getElementById(id);\n";
        theOutput +="               if (element && (element.textContent.trim() !== \"\")) {\n";
        theOutput +="                   //debugger;\n";

        theOutput +="                   const elementHeight = element.offsetHeight;\n";
        theOutput +="                   const computedStyle = window.getComputedStyle(element);\n";
        theOutput +="\n";
        theOutput +="                   // Include margins\n";
        theOutput +="                   const marginTop = parseFloat(computedStyle.marginTop);\n";
        theOutput +="                   const marginBottom = parseFloat(computedStyle.marginBottom);\n";
        theOutput +="                   totalHeight += elementHeight + marginTop + marginBottom + 1;\n";
        theOutput +="               }\n";
        theOutput +="           });\n";
        if ((!gotTitle) || (!gotSubTitle)){
        	theOutput +="           return totalHeight+5;\n";
        }
        else{
        	theOutput +="           return totalHeight+3;\n";
        }
        theOutput +="       }\n";
        theOutput +="\n";
        theOutput +="       function resizeIframe() {\n";
        theOutput +="           const iframe = document.getElementById('tuneFrame');\n";
        theOutput +="           iframe.style.width = (window.innerWidth-3) + 'px';\n";
        theOutput +="           var otherElementsHeight = getElementsTotalHeight();\n";
        theOutput +="           iframe.style.height = (window.innerHeight-otherElementsHeight) + 'px';\n";
        theOutput +="       }\n";
        theOutput +="\n";
        theOutput +="       // Resize the iframe on window resize\n";
        theOutput +="       window.addEventListener('resize', resizeIframe);\n";
        theOutput +="\n";
        theOutput +="       // Initial call to ensure it fits when the page loads\n";
        theOutput +="       resizeIframe();\n";
        theOutput +="\n";
    }

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

    var thePlaceholder = gWebsiteFilename;
    if (thePlaceholder == ""){
        thePlaceholder = "abctools_website.html";
    }

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
 
        if (!fname.endsWith(".html")) {

            // Give it a good extension
            fname = fname.replace(/\..+$/, '');
            fname = fname + ".html";

        }

        gWebsiteFilename = fname;

        if (gLocalStorageAvailable){
            localStorage.WebsiteFilename = gWebsiteFilename;
        }

        var a = document.createElement("a");

        document.body.appendChild(a);

        a.style = "display: none";

        var blob = new Blob([theData], {
                    type: "text/html"
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

var gWebsiteSoundFont = "fluid";
var gWebsiteInjectInstruments = true;
var gWebsiteBassInstrument = 1;
var gWebsiteBassInstrumentInject = 1;
var gWebsiteChordInstrument = 1;
var gWebsiteChordInstrumentInject = 1;
var gWebsiteBassVolume = 64;
var gWebsiteChordVolume = 64;
var gWebsiteMelodyInstrument = 1;
var gWebsiteMelodyInstrumentInject = 1;
var gWebsiteTitle = "ABC Transcription Tools Generated Website";
var gWebsiteSubtitle = "Select a tune from the dropdown to load it into the frame below:";
var gWebsiteFooter1 = "";
var gWebsiteFooter2 = "";
var gWebsiteWidth = 900;
var gWebsiteHeight = 900;
var gWebsiteColor = "#FFFFFF";
var gWebsiteTextColor = "#000000";
var gWebsiteHyperlinkColor = "#000000";
var gWebsiteResponsive = true;
var gWebsiteFilename = "";
var gWebsiteOpenInPlayer = true;
var gWebsiteDisableEdit = false;

var gWebsiteConfig ={

    // Title
    website_title: gWebsiteTitle,

    // Subtitle
    website_subtitle: gWebsiteSubtitle,

    // Footer1
    website_footer1: gWebsiteFooter1,

    // Footer2
    website_footer2: gWebsiteFooter2,

    // Inject instruments?
    bInjectInstruments: gWebsiteInjectInstruments,

    // Sound font
    sound_font: gWebsiteSoundFont,

    // Melody Instrument
    melody_instrument: gWebsiteMelodyInstrument,

    // Bass Instrument
    bass_instrument: gWebsiteBassInstrument,

    // Bass Volume
    bass_volume: gWebsiteBassVolume,

    // Chord Instrument
    chord_instrument: gWebsiteChordInstrument,

    // Chord Volume
    chord_volume: gWebsiteChordVolume,

    // Website frame width
    website_width: gWebsiteWidth,

    // Website frame height
    website_height: gWebsiteHeight,

    // Background color
    website_color: gWebsiteColor,

    // Text color
    website_textcolor: gWebsiteTextColor,

    // Hyperlink color
    website_hyperlinkcolor: gWebsiteHyperlinkColor,

    // Responsive
    bResponsive: gWebsiteResponsive,

    // Open in player
    bOpenInPlayer: gWebsiteOpenInPlayer,

    // Disable editor
    bDisableEdit: gWebsiteDisableEdit

}

function generateWebsite(){

    // If disabled, return
    if (!gAllowWebExport){
        return;
    }

    // Restore saved settings
    LoadWebsiteSettings();

    var midi_program_list = [];

    for (var i=0;i<=MIDI_PATCH_COUNT;++i){
        midi_program_list.push({name: "  "+ generalMIDISoundNames[i], id: i });
    }

    const sound_font_options = [
        { name: "  Fluid", id: "fluid" },
        { name: "  Musyng Kite", id: "musyng" },
        { name: "  FatBoy", id: "fatboy" },
        { name: "  Canvas", id: "canvas" },
        { name: "  MScore", id: "mscore" },
        { name: "  Arachno", id: "arachno" },
        { name: "  FluidHQ", id: "fluidhq"}
    ];

    for (var i=0;i<=MIDI_PATCH_COUNT;++i){
        midi_program_list.push({name: "  "+ generalMIDISoundNames[i], id: i });
    }

    var form = [
      {html: '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:15px;margin-bottom:18px">Export Tunebook Website&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#generate_website" target="_blank" style="text-decoration:none;position:absolute;left:20px;top:20px" class="dialogcornerbutton">?</a></span></p>'},  
      {html: '<p style="margin-top:10px;margin-bottom:18px;font-size:12pt;line-height:14pt;font-family:helvetica">Clicking "OK" will export a tunebook player website with the settings you enter below:</p>'},  
      {name: "Website title:", id: "website_title", type:"text", cssClass:"configure_website_form_text_wide"},
      {name: "Website subtitle:", id: "website_subtitle", type:"text", cssClass:"configure_website_form_text_wide2"},
      {name: "Website footer #1:", id: "website_footer1", type:"text", cssClass:"configure_website_form_text_wide2"},
      {name: "Website footer #2:", id: "website_footer2", type:"text", cssClass:"configure_website_form_text_wide2"},
      {name: "        Responsive player size (ignores width and height below)", id: "bResponsive", type:"checkbox", cssClass:"configure_website_form_text4"},
      {name: "Website player width (pixels):", id: "website_width", type:"number", cssClass:"configure_website_form_text3"},
      {name: "Website player height (pixels):", id: "website_height", type:"number", cssClass:"configure_website_form_text2"},
      {html: '<p style="margin-top:10px;margin-bottom:18px;font-size:12pt;line-height:14pt;font-family:helvetica">Background can be an HTML color, HTML gradient, or url(\'path_to_image\') image:</p>'},  
      {name: "Website background:", id: "website_color", type:"text",cssClass:"configure_website_form_text_wide5"},      
      {name: "Text color (HTML color):", id: "website_textcolor", type:"text",cssClass:"configure_website_form_text2"},      
      {name: "Hyperlink color (HTML color):", id: "website_hyperlinkcolor", type:"text",cssClass:"configure_website_form_text2"},      
      {name: "          Disable access to editor ", id: "bDisableEdit", type:"checkbox", cssClass:"configure_website_form_text2"},
      {name: "          Tunes open in player ", id: "bOpenInPlayer", type:"checkbox", cssClass:"configure_website_form_text2"},
      {name: "          Add instruments and volume overrides to each tune ", id: "bInjectInstruments", type:"checkbox", cssClass:"configure_website_form_text2"},
      {name: "Soundfont:", id: "sound_font", type:"select", options:sound_font_options, cssClass:"configure_setuppdftunebook_midi_program_select"},
      {name: "Melody instrument:", id: "melody_instrument", type:"select", options:midi_program_list, cssClass:"configure_setuppdftunebook_midi_program_select"},
      {name: "Bass instrument:", id: "bass_instrument", type:"select", options:midi_program_list, cssClass:"configure_setuppdftunebook_midi_program_select"},
      {name: "Bass volume (0-127):", id: "bass_volume", type:"number", cssClass:"configure_website_form_text"},
      {name: "Chord instrument:", id: "chord_instrument", type:"select", options:midi_program_list, cssClass:"configure_setuppdftunebook_midi_program_select"},
      {name: "Chord volume (0-127):", id: "chord_volume", type:"number", cssClass:"configure_website_form_text"},
    ];

    const modal = DayPilot.Modal.form(form, gWebsiteConfig, { theme: "modal_flat", top: 10, width: 730, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){
    
        if (!args.canceled){

            // Title
            gWebsiteTitle = args.result.website_title;
            gWebsiteConfig.website_title = gWebsiteTitle;

            // Subtitle
            gWebsiteSubtitle = args.result.website_subtitle;
            gWebsiteConfig.website_subtitle = gWebsiteSubtitle;

            // Footer 1
            gWebsiteFooter1 = args.result.website_footer1;
            gWebsiteConfig.website_footer1 = gWebsiteFooter1;

            // Footer 2
            gWebsiteFooter2 = args.result.website_footer2;
            gWebsiteConfig.website_footer2 = gWebsiteFooter2;

            // Responsive
            gWebsiteResponsive = args.result.bResponsive;
            gWebsiteConfig.bResponsive = gWebsiteResponsive;

            // Disable edit
            gWebsiteDisableEdit = args.result.bDisableEdit
            gWebsiteConfig.bDisableEdit = gWebsiteDisableEdit;

            // Open in player
            gWebsiteOpenInPlayer = args.result.bOpenInPlayer;
            gWebsiteConfig.bOpenInPlayer = gWebsiteOpenInPlayer;

            // Width
            gWebsiteWidth = args.result.website_width;
            gWebsiteConfig.website_width = gWebsiteWidth;

            // Height
            gWebsiteHeight = args.result.website_height;
            gWebsiteConfig.website_height = gWebsiteHeight;

            // Background color
            gWebsiteColor = args.result.website_color;
            gWebsiteConfig.website_color = gWebsiteColor;

            // Text color
            gWebsiteTextColor = args.result.website_textcolor;
            gWebsiteConfig.website_textcolor = gWebsiteTextColor;

            // Hyperlink color
            gWebsiteHyperlinkColor = args.result.website_hyperlinkcolor;
            gWebsiteConfig.website_hyperlinkcolor = gWebsiteHyperlinkColor;

            // Add instruments?
            gWebsiteInjectInstruments = args.result.bInjectInstruments;
            gWebsiteConfig.bInjectInstruments = gWebsiteInjectInstruments;

            // Soundfont
            gWebsiteSoundFont = args.result.sound_font;
            gWebsiteConfig.sound_font = gWebsiteSoundFont;

            // Melody Instrument
            gWebsiteMelodyInstrument = args.result.melody_instrument;
            gWebsiteConfig.melody_instrument = gWebsiteMelodyInstrument;

            // Bass Instrument
            gWebsiteBassInstrument = args.result.bass_instrument;
            gWebsiteConfig.bass_instrument = gWebsiteBassInstrument;

            // Bass volume
            gWebsiteBassVolume = args.result.bass_volume;
            gWebsiteConfig.bass_volume = gWebsiteBassVolume;

            // Chord Instrument
            gWebsiteChordInstrument = args.result.chord_instrument;
            gWebsiteConfig.chord_instrument = gWebsiteChordInstrument;

            // Chord volume
            gWebsiteChordVolume = args.result.chord_volume;
            gWebsiteConfig.chord_volume = gWebsiteChordVolume;

            if (gWebsiteInjectInstruments){
                
                // Special case for muting voices
                if (gWebsiteMelodyInstrument == 0){

                    gWebsiteMelodyInstrumentInject = "mute";

                }
                else{

                    gWebsiteMelodyInstrumentInject = gWebsiteMelodyInstrument - 1;

                    if ((gWebsiteMelodyInstrumentInject < 0) || (gWebsiteMelodyInstrumentInject > MIDI_PATCH_COUNT)){

                        gWebsiteMelodyInstrumentInject = 0;

                    }
                }

                // Special case for muting voices
                if (gWebsiteBassInstrument == 0){

                    gWebsiteBassInstrumentInject = "mute";

                }
                else{

                    gWebsiteBassInstrumentInject = gWebsiteBassInstrument - 1;

                    if ((gWebsiteBassInstrumentInject < 0) || (gWebsiteBassInstrumentInject > MIDI_PATCH_COUNT)){

                        gWebsiteBassInstrumentInject = 0;

                    }

                }

                // Special case for muting voices
                if (gWebsiteChordInstrument == 0){

                    gWebsiteChordInstrumentInject = "mute";

                }
                else{

                    gWebsiteChordInstrumentInject = gWebsiteChordInstrument - 1;

                    if ((gWebsiteChordInstrumentInject < 0) || (gWebsiteChordInstrumentInject > MIDI_PATCH_COUNT)){

                        gWebsiteChordInstrumentInject = 0;

                    }

                }

            }

            // Restore saved settings
            SaveWebsiteSettings();

            generateAndSaveWebsite();

        }

    });
}
