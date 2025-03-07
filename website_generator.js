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

        val = localStorage.WebsiteTabSelector;
        if (val){
            gWebsiteTabSelector = (val == "true");
        }
        else{
            gWebsiteTabSelector = true;
        }

        val = localStorage.WebsiteAddHelp;
        if (val){
            gWebsiteAddHelp = (val == "true");
        }
        else{
            gWebsiteAddHelp = false;
        }

        val = localStorage.WebsiteHelpURL;
        if (val){
            gWebsiteHelpURL = val;
        }
        else{
            gWebsiteHelpURL = "";
        }

        val = localStorage.WebsiteAddFullscreen;
        if (val){
            gWebsiteAddFullscreen = (val == "true");
        }
        else{
            gWebsiteAddFullscreen = true;
        }

        val = localStorage.WebsiteImageWidth;
        if (val){
            gWebsiteImageWidth = val;
        }
        else{
            gWebsiteImageWidth = "800";
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

            // Background color
            website_color: gWebsiteColor,

            // Text color
            website_textcolor: gWebsiteTextColor,

            // Hyperlink color
            website_hyperlinkcolor: gWebsiteHyperlinkColor,

            // Open in player
            bOpenInPlayer: gWebsiteOpenInPlayer,

            // Disable editor
            bDisableEdit: gWebsiteDisableEdit,

            // Add tab selector
            bTabSelector: gWebsiteTabSelector,

            // Add help
            bAddHelp: gWebsiteAddHelp,

            // Website help url
            website_helpurl: gWebsiteHelpURL,

            // Add fullscreen
            bAddFullscreen: gWebsiteAddFullscreen,

            // Add image width
            image_width: gWebsiteImageWidth

        }
    }
}

//
// Generate a 7 character random postfix for the browser local storage names
//
function generatePostfix() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    var index;
    for (let i = 0; i < 7; i++) {
        index = Math.floor(Math.random() * characters.length);
        result += characters.charAt(index);
    }
    return result;
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
        localStorage.WebsiteColor = gWebsiteColor;
        localStorage.WebsiteTextColor = gWebsiteTextColor;
        localStorage.WebsiteHyperlinkColor = gWebsiteHyperlinkColor;
        localStorage.WebsiteOpenInPlayer = gWebsiteOpenInPlayer;
        localStorage.WebsiteDisableEdit = gWebsiteDisableEdit;
        localStorage.WebsiteTabSelector = gWebsiteTabSelector;
        localStorage.WebsiteAddHelp = gWebsiteAddHelp;
        localStorage.WebsiteHelpURL = gWebsiteHelpURL;
        localStorage.WebsiteAddFullscreen = gWebsiteAddFullscreen;
        localStorage.WebsiteImageWidth = gWebsiteImageWidth;
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

    // Inject play link request for tune PDF export
    theTune = InjectStringBelowTuneHeader(theTune, "%add_all_playback_links");
    
    // Seeing extra linefeeds after the inject
    theTune = theTune.replace("\n\n","");

    return(theTune);

}

//
// Return the .WAV or .MP3 filename
//
function GetWebsiteTuneName(tuneABC){

    var lines = tuneABC.split("\n"); // Split the string by new line

    for (var j = 0; j < lines.length; ++j) {

        var currentLine = lines[j].trim(); // Trim any whitespace from the line

        // Check if the line starts with "T:"
        if (currentLine.startsWith("T:")) {

            var fname = currentLine.slice(2);

            fname = fname.trim();

            return fname;

        }
    }

    // Failed to find a tune title, return a default
    return "Tune";

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

    clearGetTuneByIndexCache();

    for (var i=0;i<nTunes;++i){

        var thisTune = getTuneByIndex(i);

        if (gWebsiteInjectInstruments){

            thisTune = WebsiteInjectInstruments(thisTune);
        }

        var title = GetWebsiteTuneName(thisTune);

        // If section header, strip the *
        if (title.startsWith('*')) {
            title = title.substring(1);
        }

        thisTune = GetABCFileHeader() + thisTune;

        var theURL = FillUrlBoxWithAbcInLZW(thisTune,false);

        var titleURL = title.replaceAll("&","");
        titleURL = titleURL.replaceAll(" ","_");
        titleURL = titleURL.replaceAll("#","^");

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
// Export all the tunes displayed name, filename, and Share URL in a JSON file
//
function BatchJSONExportForWebGalleryGenerator(theABC){

    // Make sure there are tunes to convert

    var theTunes = theABC.split(/^X:.*$/gm);

    var nTunes = theTunes.length - 1;

    if (nTunes == 0){
        return null;
    }

    var theJSON = [];

    clearGetTuneByIndexCache();

    for (var i=0;i<nTunes;++i){

        var thisTune = getTuneByIndex(i);

        if (gWebsiteInjectInstruments){

            thisTune = WebsiteInjectInstruments(thisTune);
        }

        var title = GetWebsiteTuneName(thisTune);

        // If section header, strip the *
        if (title.startsWith('*')) {
            title = title.substring(1);
        }

        var fileName = GetTuneAudioDownloadName(thisTune,".svg")

        thisTune = GetABCFileHeader() + thisTune;

        var theURL = FillUrlBoxWithAbcInLZW(thisTune,false);

        var titleURL = title.replaceAll("&","");
        titleURL = titleURL.replaceAll(" ","_");
        titleURL = titleURL.replaceAll("#","^");

        theURL+="&name="+titleURL;

        if (gWebsiteOpenInPlayer){
            theURL+="&play=1";
        }

        if (gWebsiteDisableEdit){
            theURL+="&dx=1";
        }

        theJSON.push({Name:title,Filename:fileName,URL:theURL});

    }

    var theJSONString = "const tunes="+JSON.stringify(theJSON)+";";

    return theJSONString;

}

//
// Get the melody instrument name
//
function getInstrumentNameForWebSelector(index){

    if (index == "mute"){
        return "Mute";
    }

    index = parseInt(index)
    if (isNaN(index)){
        index = 0;
    }
    
    var instrumentName = website_export_midi_program_list[index+1].name.trim();
    
    if (instrumentName.indexOf("Piano") != -1){
        return "Piano";
    }
    if (instrumentName.indexOf("Guitar") != -1){
        return "Guitar";
    }
    if (instrumentName.indexOf("Recorder") != -1){
        return "Recorder";
    }
    if (instrumentName.indexOf("Bass") != -1){
        return "Bass";
    }
    if (instrumentName.indexOf("Organ") != -1){
        return "Organ";
    }
    if (instrumentName.indexOf("String") != -1){
        return "Strings";
    }
    if (instrumentName.indexOf("Harp") != -1){
        return "Harp";
    }
    if (instrumentName.indexOf("Lead") != -1){
        return "Lead";
    }
    if (instrumentName.indexOf("Pad") != -1){
        return "Pad";
    }
    if (instrumentName.indexOf("FX") != -1){
        return "FX";
    }
    if (instrumentName.indexOf("Accordion") != -1){
        return "Accordion";
    }
    if (instrumentName.indexOf("Bouzouki") != -1){
        return "Bouzouki";
    }
    if (instrumentName.indexOf("Smallpipes") != -1){
        return "Smallpipes";
    }
    if (instrumentName.indexOf("Uilleann") != -1){
        return "Uilleann";
    }
    if (instrumentName.indexOf("Bells") != -1){
        return "Bells";
    }
    if (instrumentName.indexOf("Drum") != -1){
        return "Drums";
    }
    if (instrumentName.indexOf("Sax") != -1){
        return "Sax";
    }
    if (instrumentName.indexOf("Trumpet") != -1){
        return "Trumpet";
    }
    if (instrumentName.indexOf("Brass") != -1){
        return "Brass";
    }
    if (instrumentName.indexOf("Hit") != -1){
        return "Hit";
    }

    return instrumentName;
}

//
// Generate a fully featured website
//
function generateAndSaveWebsiteFull() {

    var theOutput = "";

    var theABC = gTheABC.value;

    // For local storage naming
    var postFix = generatePostfix();

    //console.log("postFix: "+postFix);

    // Any tunes to reformat?
    if (CountTunes() == 0){

        clearGetTuneByIndexCache();

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

        clearGetTuneByIndexCache();

        var thePrompt = "Problem generating tune share links!";

        thePrompt = makeCenteredPromptString(thePrompt);

          DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    // Keep track of actions
    sendGoogleAnalytics("action","SaveWebsiteFull");

    // Create the website code

    // Header
    theOutput += "<!DOCTYPE html>\n";
    theOutput +="\n";
    theOutput +='<html lang="en">\n';
    theOutput +="\n";
    theOutput +="<head>\n";
    theOutput +="\n";
    theOutput +='<meta charset="UTF-8">\n';

    theOutput +='<meta name="viewport" content="width=860" />\n'; 
    theOutput +='<meta property="og:image" content="https://michaeleskin.com/abctools/img/abc-icon.png" />\n';
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
        // Center the image and fill the page
        if (gWebsiteColor.indexOf("url(") != -1){
            theOutput +="        background: center "+gWebsiteColor+";\n";   
            theOutput +="        background-size: cover;\n";   
        }
        else{
            // Just inject the gradient
            theOutput +="        background-image: "+gWebsiteColor+";\n";   
        }
    }
    theOutput +="        margin: 0px;\n";
    theOutput +="        padding: 0px;\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    .container {\n";
    theOutput +="        margin: 0px auto;\n";
    theOutput +="        text-align: center;\n";
    theOutput +="        overflow-x: hidden;\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    h1 {\n";
    theOutput +="        font-size: 24px;\n";
    theOutput +="        margin-top: 16px;\n";
    theOutput +="        margin-bottom: 0px;\n";
    theOutput +="        color: "+gWebsiteTextColor+";\n";
    theOutput +="    }\n";
    theOutput +="\n";

    if (gWebsiteTitle && (gWebsiteTitle != "")) {   
        theOutput +="    h2 {\n";
        theOutput +="        font-size: 16px;\n";
        theOutput +="        margin-top: 8px;\n";
        theOutput +="        margin-bottom: 0px;\n";
        theOutput +="        color: "+gWebsiteTextColor+";\n";
        theOutput +="    }\n";
    }else{
        theOutput +="    h2 {\n";
        theOutput +="        font-size: 16px;\n";
        theOutput +="        margin-top: 14px;\n";
        theOutput +="        margin-bottom: 0px;\n";
        theOutput +="        color: "+gWebsiteTextColor+";\n";
        theOutput +="    }\n";       
    }
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
    if (gWebsiteAddFullscreen){
        theOutput +="    #fullscreenbutton {\n";
        theOutput +="        position: fixed;\n";
        theOutput +="        top: 16px;   /* Distance from the top of the page */\n";
        theOutput +="        right: 16px; /* Distance from the right of the page */\n";
        theOutput +="        padding: 10px 20px;\n";
        theOutput +="        background-color: #007BFF;\n";
        theOutput +="        color: white;\n";
        theOutput +="        border: none;\n";
        theOutput +="        border-radius: 5px;\n";
        theOutput +="        cursor: pointer;\n";
        theOutput +="        font-size: 14px;\n";
        theOutput +="        z-index: 1000; /* Ensures it stays above other content */\n";
        theOutput +="    }\n";
        theOutput +="\n";
        theOutput +="    #fullscreenbutton:hover {\n";
        theOutput +="        background-color: #0056b3;\n";
        theOutput +="    }\n";
        theOutput +="\n";
    }
    theOutput +="    select {\n";
    theOutput +="        -webkit-appearance: none;\n";
    theOutput +="        -moz-appearance: none;\n";
    theOutput +="        appearance: none;\n";
    theOutput +="        background: url(\"data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' fill=\'%238C98F2\'><polygon points=\'0,0 100,0 50,50\'/></svg>\") no-repeat;\n";
    theOutput +="        background-size: 12px;\n";
    theOutput +="        background-position: calc(100% - 10px) center;\n";
    theOutput +="        background-repeat: no-repeat;\n";
    theOutput +="        background-color: #efefef;\n";
    theOutput +="        color: black;\n";
    theOutput +="        font-size: 17px;\n";
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
    theOutput +="        margin-top: 12px;\n";
    theOutput +="        margin-bottom: 12px;\n";
    theOutput +="        color: "+gWebsiteTextColor+";\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    #footer2{\n";
    theOutput +="        margin-top: 12px;\n";
    theOutput +="        margin-bottom: 0px;\n";
    theOutput +="        color: "+gWebsiteTextColor+";\n";
    theOutput +="    }\n";
    theOutput +="\n";

    if (gWebsiteAddHelp){
        // There is a title or subtitle present
        if ((gWebsiteTitle && (gWebsiteTitle != "")) || (gWebsiteSubtitle && (gWebsiteSubtitle != ""))){
            theOutput +="    #website_help{\n";
            theOutput +="        font-size: 28pt;\n";
            theOutput +="        position: absolute;\n";
            theOutput +="        left: 16px;\n";
            theOutput +="        top: 12px;\n";
            theOutput +="        color: "+gWebsiteHyperlinkColor+";\n";
            theOutput +="    }\n";
            theOutput +="\n";
        }
        else{
            theOutput +="    #website_help{\n";
            theOutput +="        font-size: 28pt;\n";
            theOutput +="        position: absolute;\n";
            theOutput +="        left: 16px;\n";
            theOutput +="        top: 10px;\n";
            theOutput +="        color: "+gWebsiteHyperlinkColor+";\n";
            theOutput +="    }\n";
            theOutput +="\n";
        }
    }

    theOutput +="    #previous_tune, #next_tune{\n";
    theOutput +="        padding: 10px 15px;\n";
    theOutput +="        background-color: #dddddd;\n";
    theOutput +="        color: black;\n";
    theOutput +="        border: none;\n";
    theOutput +="        border-radius: 5px;\n";
    theOutput +="        cursor: pointer;\n";
    theOutput +="        font-size: 14px;\n";
    theOutput +="        z-index: 1000; /* Ensures it stays above other content */\n";
    theOutput +="        margin-top: 12px;\n";
    theOutput +="        margin-bottom: 16px;\n";
    theOutput +="        transform:translate(0px, -1px);\n";
    theOutput +="    }\n";
    theOutput +="\n";

    theOutput +="    #previous_tune{\n";
    theOutput +="        margin-right:10px;\n";
    theOutput +="    }\n";
    theOutput +="\n";

    theOutput +="    #next_tune{\n";
    theOutput +="        margin-left:10px;\n";
    theOutput +="    }\n";
    theOutput +="\n";

    theOutput +="    #next_tune:hover {\n";
    theOutput +="        background-color: palegreen;\n";
    theOutput +="    }\n";
    theOutput +="\n";

    theOutput +="    #previous_tune:hover {\n";
    theOutput +="        background-color: palegreen;\n";
    theOutput +="    }\n";
    theOutput +="\n";

    theOutput +="</style>\n";
    theOutput +="\n";
    theOutput +="</head>\n";
    theOutput +="\n";

    // HTML
    theOutput +="<body>\n";
    theOutput +="\n";
    theOutput +='    <div class="container">\n';
    if (gWebsiteAddHelp){
        theOutput +='        <a id="website_help" href="'+gWebsiteHelpURL+'" target="_blank" style="text-decoration:none;" title="Information about using this tunebook" class="cornerbutton">?</a>\n';
    }

    if (gWebsiteAddFullscreen){
        theOutput +='        <button id="fullscreenbutton">Full Screen</button>\n';
    }

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

    theOutput +='        <button id="previous_tune" title="Previous tune">←</button>\n';

    if (gotTitle || gotSubTitle){
        if (gWebsiteTabSelector){
    	   theOutput +='        <select id="tuneSelector" style="margin-right:10px;">\n';
        }
        else{
           theOutput +='        <select id="tuneSelector">\n';            
        }
    }
    else{
        if (gWebsiteTabSelector){
    	   theOutput +='        <select id="tuneSelector" style="margin-top:18px;margin-right:10px;">\n';
        }
        else{
           theOutput +='        <select id="tuneSelector" style="margin-top:18px;">\n';            
        }
    }
    theOutput +='            <option value="">Click to Select a Tune</option>\n';
    theOutput +="        </select>\n";


    if (gWebsiteTabSelector){
        if (gotTitle || gotSubTitle){
            theOutput +='        <select id="displayOptions" style="width:250px;">\n';
        }
        else{
            theOutput +='        <select id="displayOptions" style="width:250px;margin-top:18px;">\n';
        }
        theOutput +='           <option value="-1">Choose an Instrument</option>\n';

        var instrumentName = getInstrumentNameForWebSelector(gWebsiteMelodyInstrumentInject);

        theOutput +='           <option value="0">'+instrumentName+' - Notation</option>\n';
        theOutput +='           <option value="1">'+instrumentName+' - Note Names</option>\n';
        theOutput +='           <option value="2">Mandolin</option>\n';
        theOutput +='           <option value="3">Tenor Banjo</option>\n';
        theOutput +='           <option value="4">GDAD Bouzouki</option>\n';
        theOutput +='           <option value="5">Standard Guitar</option>\n';
        theOutput +='           <option value="6">DADGAD</option>\n';
        theOutput +='           <option value="7">Tin Whistle</option>\n';
        theOutput +='           <option value="8">Irish Flute</option>\n';
        theOutput +='           <option value="9">Accordion</option>\n';
        theOutput +='           <option value="10">Concertina</option>\n';
        theOutput +='           <option value="11">Hammered Dulcimer</option>\n';
        theOutput +='        </select>\n'
    }

    theOutput +='        <button id="next_tune" title="Next tune">→</button>\n';

    theOutput +="        <br/>\n";
    theOutput +='        <iframe id="tuneFrame" src=""></iframe>\n';        

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
    theOutput +="    // Set this to false to disable state persistence\n";
    theOutput +="    var gAllowStatePersistence = true;\n";
    theOutput +="\n";
    theOutput +="    // Set this to false to hide previous and next tune buttons\n";
    theOutput +="    var gAllowPreviousNextButtons = true;\n";
    theOutput +="\n";     
    if (gWebsiteTabSelector){
        // Add LZW library
        theOutput +='    var LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module&&(module.exports=LZString);\n';

        theOutput +="\n";
        theOutput +="    // Set this to false to disable changing instruments when switching tablature\n";
        theOutput +="    var gAllowInstrumentChanges = true;\n";
        theOutput +="\n";       
        theOutput +="    var isBanjo = false;\n";
        theOutput +="    var isFlute = false;\n";
        theOutput +="    var isAccordion = false;\n";
        theOutput +="    var isConcertina = false;\n";
        theOutput +="    var isDulcimer = false;\n";
        theOutput +="\n";
    }

    if (gWebsiteAddFullscreen){
        theOutput +='    var lastURL = "";\n';
        theOutput +="\n";
    }

    theOutput +="    // Populate the selector with options from JSON\n";
    theOutput +="    document.addEventListener('DOMContentLoaded', () => {\n";
    
    theOutput +="\n";

    if (gWebsiteAddFullscreen){
        theOutput +="        document.getElementById('fullscreenbutton').addEventListener('click', function() {\n";
        theOutput +='            if (lastURL != ""){\n';
        theOutput +="             window.open(lastURL, '_blank');\n";
        theOutput +="            }\n";
        theOutput +="        });\n";
        theOutput +="\n";
    }

    if (((!gotTitle) && gotSubTitle) || ((!gotSubTitle) && gotTitle)){

        if (gWebsiteAddFullscreen){
            theOutput +="        document.getElementById('fullscreenbutton').style.top = '8px';\n";
            theOutput +="        document.getElementById('fullscreenbutton').style.right = '8px';\n";
            theOutput +="\n";
        }

        if (gWebsiteAddHelp){
            theOutput +="        document.getElementById('website_help').style.top = '4px';\n";
            theOutput +="        document.getElementById('website_help').style.left = '12px';\n";
            theOutput +="\n";
        }
        
    }

    theOutput +="        const tuneSelector = document.getElementById('tuneSelector');\n";
    theOutput +="\n";
    theOutput +="        const tuneFrame = document.getElementById('tuneFrame');\n";
    theOutput +="\n";
    theOutput +="        if (tunes.length > 1){\n";
    theOutput +="\n";
    theOutput +="           tunes.forEach(tune => {\n";
    theOutput +="               const option = document.createElement('option');\n";
    theOutput +="               option.value = tune.URL;\n";
    theOutput +="               option.textContent = tune.Name;\n";
    theOutput +="               tuneSelector.appendChild(option);\n";
    theOutput +="           });\n";
    theOutput +="\n";
    theOutput +="           // Update iframe src when an option is selected\n";
    theOutput +="           tuneSelector.addEventListener('change', () => {\n";
    theOutput +="\n";
    theOutput +="               var theURL = tuneSelector.value;\n";
    theOutput +="\n";
    theOutput +='               if (theURL == "")return;\n';
    if (gWebsiteTabSelector){
        theOutput +="\n";
        theOutput +="               theURL = theURL.replace(/&format=([^&]+)/g,\"&format=\"+tabStyle);\n";   
        theOutput +="\n";
        theOutput +="               if (gAllowInstrumentChanges){\n";   
        theOutput +="                  theURL = injectInstrument(theURL);\n";
        theOutput +="               }\n"; 
    }
    theOutput +="\n";
    theOutput +="               tuneFrame.src = theURL;\n";
    if (gWebsiteAddFullscreen){
        theOutput +="               lastURL = theURL;\n";
    }
    theOutput +="\n";
    theOutput +="               // Save last tune\n";
    theOutput +="               if (gAllowStatePersistence){\n";
    theOutput +="\n";
    theOutput +="                   if (window.localStorage){\n";
    theOutput +="\n";
    theOutput +="                       localStorage.lastTuneName_"+postFix+" = tuneSelector.options[tuneSelector.selectedIndex].text;\n";
    if (gWebsiteTabSelector){
        theOutput +="\n";
        theOutput +="                       var theLastTuneTab = document.getElementById('displayOptions').value;\n";
        theOutput +="                       localStorage.lastTab_"+postFix+" = theLastTuneTab;\n";
        theOutput +="\n";
    }
    theOutput +="                   }\n";
    theOutput +="\n";


    theOutput +="               }\n";
    theOutput +="\n";   
    theOutput +="           });\n";
    theOutput +="\n";   
    theOutput +="          if (gAllowPreviousNextButtons){\n";
    theOutput +="\n";
    theOutput +="               document.getElementById('next_tune').addEventListener('click', nextTune);\n";
    theOutput +="\n";
    theOutput +="               document.getElementById('previous_tune').addEventListener('click', previousTune);\n";
    theOutput +="\n";
    theOutput +="               function nextTune(){ \n";     
    theOutput +="                   var tuneIndex = tuneSelector.selectedIndex;\n";
    theOutput +="                   tuneIndex++;\n";
    theOutput +="                   if (tuneIndex > tunes.length){\n";
    theOutput +="                    tuneIndex = tunes.length;\n";
    theOutput +="                   }\n";
    theOutput +="                   tuneSelector.selectedIndex = tuneIndex;\n";
    theOutput +="                   tuneSelector.dispatchEvent(new Event('change'));\n";
    theOutput +="               }\n";
    theOutput +="\n";
    theOutput +="               function previousTune(){\n";
    theOutput +="                   var tuneIndex = tuneSelector.selectedIndex;\n";
    theOutput +="                   tuneIndex--;\n";
    theOutput +="                   if (tuneIndex < 0){\n";
    theOutput +="                       tuneIndex = 0;\n";
    theOutput +="                   }\n";
    theOutput +="                   tuneSelector.selectedIndex = tuneIndex;\n";
    theOutput +="                   tuneSelector.dispatchEvent(new Event('change'));\n";
    theOutput +="               }\n";
    theOutput +="          }\n"
    theOutput +="          else{\n"
    theOutput +="               document.getElementById('next_tune').style.display=\"none\";\n";
    theOutput +="               document.getElementById('previous_tune').style.display=\"none\";\n";
    theOutput +="          }\n"
    theOutput +="\n";    
    theOutput +="        }\n";
    theOutput +="        else{\n";
    theOutput +="\n";
    theOutput +="           tuneSelector.style.display=\"none\";\n";
    theOutput +="\n";
    theOutput +="           document.getElementById('next_tune').style.display=\"none\";\n";
    theOutput +="           document.getElementById('previous_tune').style.display=\"none\";\n";
    theOutput +="\n";
    theOutput +="           setTimeout(function(){\n"; 
    theOutput +="\n";
    theOutput +="             var theURL = tunes[0].URL;\n"
    theOutput +="\n";
    theOutput +='             if (theURL == "")return;\n';

    if (gWebsiteTabSelector){
        theOutput +="\n";
        theOutput +="             theURL = theURL.replace(/&format=([^&]+)/g,\"&format=\"+tabStyle);\n";    
        theOutput +="\n";
        theOutput +="             if (gAllowInstrumentChanges){\n";   
        theOutput +="                 theURL = injectInstrument(theURL);\n";
        theOutput +="             }\n"; 
    }

    theOutput +="\n";
    theOutput +="             tuneFrame.src = theURL;\n";

    if (gWebsiteAddFullscreen){
        theOutput +="             lastURL = theURL;\n";
    }

    theOutput +="\n";

    theOutput +="           },250);\n";        

    theOutput +="        }\n";
    theOutput +="\n";

    if (gWebsiteTabSelector){

        theOutput +="        var tabStyle = \"noten\";\n";

        theOutput +="\n";

        theOutput +="        //\n";
        theOutput +="        // Decompress the tune LZW, replace the instrument and volumes\n";
        theOutput +="        //\n";
        theOutput +="\n";
        theOutput +="        function extractLZWParameter(url) {\n";
        theOutput +="           // Use a regular expression to find the part starting with &lzw= followed by any characters until the next &\n";
        theOutput +="            const match = url.match(/lzw=([^&]*)/);\n";
        theOutput +="\n";
        theOutput +="            // If a match is found, return the part after &lzw=\n";
        theOutput +="            return match ? match[0] : null;\n";
        theOutput +="        }\n";
        theOutput +="\n";
        theOutput +="        function injectInstrument(theURL){\n";
        theOutput +="\n";
        theOutput +="            var originalAbcInLZW = extractLZWParameter(theURL);\n";
        theOutput +="\n";
        theOutput +='            originalAbcInLZW = originalAbcInLZW.replace("lzw=","");\n';
        theOutput +="\n";
        theOutput +="            var abcInLZW = LZString.decompressFromEncodedURIComponent(originalAbcInLZW);\n";
        theOutput +="\n";
        theOutput +="            switch (tabStyle){\n";
        theOutput +='                case "mandolin":\n';
        theOutput +='                    if (isBanjo){\n';
        theOutput +='                        abcInLZW = abcInLZW.replace("%%MIDI program '+gWebsiteMelodyInstrumentInject+'","%%MIDI program 105");\n';
        theOutput +="                    }\n";
        theOutput +="                    else{\n";
        theOutput +='                        abcInLZW = abcInLZW.replace("%%MIDI program '+gWebsiteMelodyInstrumentInject+'","%%MIDI program 141");\n';                       
        theOutput +="                    }\n";
        theOutput +="                    break;\n";
        theOutput +='                case "gdad":\n';
        theOutput +='                    abcInLZW = abcInLZW.replace("%%MIDI program '+gWebsiteMelodyInstrumentInject+'","%%MIDI program 140");\n';
        theOutput +="                    break;\n";
        theOutput +='                case "guitare":\n';
        theOutput +='                case "guitard":\n';
        theOutput +='                    abcInLZW = abcInLZW.replace("%%MIDI program '+gWebsiteMelodyInstrumentInject+'","%%MIDI program 24\\n%%MIDI transpose -12");\n';
        theOutput +="                    break;\n";
        theOutput +='                case "whistle":\n';
        theOutput +="                    if (isFlute){\n";
        theOutput +='                        abcInLZW = abcInLZW.replace("%%MIDI program '+gWebsiteMelodyInstrumentInject+'","%%MIDI program 73");\n';
        theOutput +="                    }\n";
        theOutput +="                    else{\n";
        theOutput +='                        abcInLZW = abcInLZW.replace("%%MIDI program '+gWebsiteMelodyInstrumentInject+'","%%MIDI program 78");\n';
        theOutput +="                    }\n";
        theOutput +='                    abcInLZW = abcInLZW.replace("%%MIDI bassvol '+gWebsiteBassVolume+'","%%MIDI bassvol 64");\n';
        theOutput +='                    abcInLZW = abcInLZW.replace("%%MIDI chordvol '+gWebsiteChordVolume+'","%%MIDI chordvol 64");\n';
        theOutput +="                    break;\n";
        theOutput +='                case "noten":\n';
        theOutput +="                    if (isAccordion){\n";
        theOutput +='                        abcInLZW = abcInLZW.replace("%%MIDI program '+gWebsiteMelodyInstrumentInject+'","%%MIDI program 21");\n';
        theOutput +="                    }\n";
        theOutput +="                    else\n";
        theOutput +="                    if (isConcertina){\n";
        theOutput +='                        abcInLZW = abcInLZW.replace("%%MIDI program '+gWebsiteMelodyInstrumentInject+'","%%MIDI program 133");\n';
        theOutput +="                    }\n";
        theOutput +="                    else\n";
        theOutput +="                    if (isDulcimer){\n";
        theOutput +='                        abcInLZW = abcInLZW.replace("%%MIDI program '+gWebsiteMelodyInstrumentInject+'","%%MIDI program 15");\n';
        theOutput +="                    }\n";
        theOutput +="                    else{\n";
        theOutput +="                        return theURL;\n";
        theOutput +="                    }\n";
        theOutput +="                    break;\n";
        theOutput +="            }\n";
        theOutput +="\n";
        theOutput +='            var newLZWparam = "lzw="+LZString.compressToEncodedURIComponent(abcInLZW);\n';
        theOutput +="\n";
        theOutput +='            originalAbcInLZW = "lzw="+originalAbcInLZW;\n';
        theOutput +="\n";
        theOutput +="            theURL = theURL.replace(originalAbcInLZW,newLZWparam);\n";
        theOutput +="\n";
        theOutput +="            return theURL;\n";
        theOutput +="        }\n";
        theOutput +="\n";

        // Update iframe src when an option is selected
        theOutput +="        const displayOptions = document.getElementById('displayOptions');\n";
        theOutput +="\n";
        theOutput +="          displayOptions.addEventListener('change', () => {\n";
        theOutput +="\n";

        theOutput +="             var origTabStyle = tabStyle;\n";
        theOutput +="\n";

        theOutput +="             if (displayOptions.value == \"-1\"){\n";
        theOutput +="                 return;\n";
        theOutput +="             }\n";
        theOutput +="\n";
        theOutput +="             isBanjo = false;\n";
        theOutput +="             isFlute = false;\n";
        theOutput +="             isAccordion = false;\n";
        theOutput +="             isConcertina = false;\n";
        theOutput +="             isDulcimer = false;\n";
        theOutput +="\n";
        theOutput +="             switch (displayOptions.value){\n";
        theOutput +="                 case \"0\": // Standard notation\n";
        theOutput +="                     tabStyle = \"noten\";\n";
        theOutput +="                     break;\n";
        theOutput +="                 case \"1\": // Note names\n";
        theOutput +="                     tabStyle = \"notenames\";\n";
        theOutput +="                     break;\n";
        theOutput +="                 case \"2\": // Mandolin\n";
        theOutput +="                     tabStyle = \"mandolin\";\n";
        theOutput +="                     break;\n";
        theOutput +="                 case \"3\": // Tenor banjo\n";
        theOutput +="                     isBanjo = true;\n";
        theOutput +="                     tabStyle = \"mandolin\";\n";
        theOutput +="                     break;\n";
        theOutput +="                 case \"4\": // GDAD\n";
        theOutput +="                     tabStyle = \"gdad\";\n";
        theOutput +="                     break;\n";
        theOutput +="                 case \"5\": // Guitar\n";
        theOutput +="                     tabStyle = \"guitare\";\n";
        theOutput +="                     break;\n";
        theOutput +="                 case \"6\": // DADGAD\n";
        theOutput +="                     tabStyle = \"guitard\";\n";
        theOutput +="                     break;\n";
        theOutput +="                 case \"7\": // Whistle\n";
        theOutput +="                     tabStyle = \"whistle\";\n";
        theOutput +="                     break;\n";
        theOutput +="                 case \"8\": // Irish flute\n";
        theOutput +="                     isFlute = true;\n";
        theOutput +="                     tabStyle = \"whistle\";\n";
        theOutput +="                     break;\n";
        theOutput +="                 case \"9\": // Accordion\n";
        theOutput +="                     isAccordion = true;\n";
        theOutput +="                     tabStyle = \"noten\";\n";
        theOutput +="                     break;\n";
        theOutput +="                 case \"10\": // Concertina\n";
        theOutput +="                     isConcertina = true;\n";
        theOutput +="                     tabStyle = \"noten\";\n";
        theOutput +="                     break;\n";
        theOutput +="                 case \"11\": // Hammered dulcimer\n";
        theOutput +="                     isDulcimer = true;\n";
        theOutput +="                     tabStyle = \"noten\";\n";
        theOutput +="                     break;\n";
        theOutput +="                 default:\n";
        theOutput +="                     tabStyle = \"noten\";\n";
        theOutput +="                     break;\n";
        theOutput +="             }\n";
        theOutput +="\n";
        theOutput +="             var theURL;\n";
        theOutput +="\n";
        theOutput +="             if (tunes.length > 1){\n";
        theOutput +="                theURL = tuneSelector.value;\n";
        theOutput +="             }\n";
        theOutput +="             else {\n";
        theOutput +="                theURL = tunes[0].URL;\n";
        theOutput +="             }\n";
        theOutput +="\n";
        theOutput +='             if (theURL == "")return;\n';
        theOutput +="\n";
        theOutput +="             theURL = theURL.replace(/&format=([^&]+)/g,\"&format=\"+tabStyle);\n";
        theOutput +="\n";
        theOutput +="             if (gAllowInstrumentChanges){\n";   
        theOutput +="                 theURL = injectInstrument(theURL);\n";
        theOutput +="             }\n"; 
        theOutput +="\n";
        theOutput +="             tuneFrame.src = theURL;\n";
        if (gWebsiteAddFullscreen){
            theOutput +="             lastURL = theURL;\n";
        }

        theOutput +="\n";
        theOutput +="             // Save last tune\n";
        theOutput +="             if (gAllowStatePersistence){\n";
        theOutput +="\n";
        theOutput +="                 if (window.localStorage){\n";
        theOutput +="\n";
        theOutput +="                     if (tunes.length > 1){\n";
        theOutput +="                         localStorage.lastTuneName_"+postFix+" = tuneSelector.options[tuneSelector.selectedIndex].text;\n";
        theOutput +="                     }\n";
        theOutput +="\n";
        theOutput +="                     var theLastTuneTab = document.getElementById('displayOptions').value;\n";
        theOutput +="                     localStorage.lastTab_"+postFix+" = theLastTuneTab;\n";
        theOutput +="                 }\n";
        theOutput +="\n";   
        theOutput +="             }\n";

        theOutput +="\n";

        theOutput +="        });\n";
        theOutput +="\n";
    }

    theOutput +="       function getElementsTotalHeight() {\n";
    theOutput +="\n";
    theOutput +="           var ids;\n";
    theOutput +="\n";
    theOutput +="           if (tunes.length > 1){\n";
    theOutput +="               if (gAllowPreviousNextButtons){\n";
    theOutput +="                   ids = ['title', 'subtitle', 'previous_tune', 'footer1', 'footer2'];\n";
    theOutput +="               }\n";
    theOutput +="               else{\n";
    theOutput +="                   ids = ['title', 'subtitle', 'tuneSelector', 'footer1', 'footer2'];\n";
    theOutput +="               }\n";
    theOutput +="           }\n";
    theOutput +="           else{\n";
    theOutput +="               ids = ['title', 'subtitle', 'displayOptions', 'footer1', 'footer2'];\n";
    theOutput +="           }\n";
    theOutput +="\n";
    theOutput +="           let totalHeight = 0;\n";
    theOutput +="\n";
    theOutput +="           ids.forEach(id => {\n";
    theOutput +="\n";
    theOutput +="               const element = document.getElementById(id);\n";
    theOutput +="\n";
    theOutput +="               if (element && (element.textContent.trim() !== \"\")) {\n";
    theOutput +="                   const elementHeight = element.offsetHeight;\n";
    theOutput +="                   const computedStyle = window.getComputedStyle(element);\n";
    theOutput +="\n";
    theOutput +="                   // Include margins\n";
    theOutput +="                   const marginTop = parseFloat(computedStyle.marginTop);\n";
    theOutput +="                   const marginBottom = parseFloat(computedStyle.marginBottom);\n";
    theOutput +="                   totalHeight += elementHeight + marginTop + marginBottom + 1;\n";
    theOutput +="               }\n";
    theOutput +="           });\n";
    theOutput +="\n";
    theOutput +="           if ((tunes.length == 1) && (!document.getElementById('displayOptions'))){\n";
    theOutput +="               totalHeight += 24;\n";
    theOutput +="           }\n";

    if ((!gotTitle) && (!gotSubTitle)){
        theOutput +="           return totalHeight+12;\n";
    }
    else{
    	theOutput +="           return totalHeight+10;\n";
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
    theOutput +="       function setSelectedTuneByName(optionText) {\n";
    theOutput +="           var gotMatch = false;\n";
    theOutput +="           for (let i = 0; i < tuneSelector.options.length; i++) {\n";
    theOutput +="               if (tuneSelector.options[i].text === optionText) {\n";
    theOutput +="                   tuneSelector.selectedIndex = i;\n";
    theOutput +="                   gotMatch = true;\n";
    theOutput +="                   break;\n";
    theOutput +="               }\n";
    theOutput +="           }\n";
    theOutput +="           if (gotMatch){\n";
    theOutput +="               tuneSelector.dispatchEvent(new Event('change'));\n";
    theOutput +="           }\n";
    theOutput +="       }\n";
    theOutput +="\n";
    theOutput +="       // Resize the iframe on window resize\n";
    theOutput +="       window.addEventListener('resize', resizeIframe);\n";
    theOutput +="\n";
    theOutput +="       // Initial call to ensure it fits when the page loads\n";
    theOutput +="       resizeIframe();\n";
    theOutput +="\n";
    theOutput +="       // Restore state\n";
    theOutput +="       if (gAllowStatePersistence){\n";
    theOutput +="\n";
    theOutput +="          if (window.localStorage){\n";
    theOutput +="\n";
    theOutput +="              setTimeout(function(){\n";
    if (gWebsiteTabSelector){
        theOutput +="\n";
        theOutput +="                var theLastTuneTab = localStorage.lastTab_"+postFix+";\n";
        theOutput +='                if (theLastTuneTab && (theLastTuneTab != "")){\n';
        theOutput +="                    var elem = document.getElementById('displayOptions');\n";
        theOutput +="                    elem.value = theLastTuneTab;\n";
        theOutput +="                    elem.dispatchEvent(new Event('change'));\n";
        theOutput +="                }\n";
    }
    theOutput +="\n";
    theOutput +="                if (tunes.length > 1){\n";
    theOutput +="\n";
    theOutput +="                   var theLastTuneName = localStorage.lastTuneName_"+postFix+";\n";
    theOutput +='                   if (theLastTuneName && (theLastTuneName != "")){\n';
    theOutput +="                       setSelectedTuneByName(theLastTuneName);\n";
    theOutput +="                   }\n";
    theOutput +="\n";
    theOutput +="                }\n";

    theOutput +="\n";
    theOutput +="             },250);\n";
    theOutput +="          }\n";
    theOutput +="       }\n";


    theOutput +="    });\n";    
    theOutput +="\n";
    theOutput +="</script>\n";
    theOutput +="\n";
    theOutput +="</body>\n";
    theOutput +="\n";
    theOutput +="</html>\n";

    var theData = theOutput

    if (theData.length == 0) {

        clearGetTuneByIndexCache();

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

        clearGetTuneByIndexCache();

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

//
// Generate a simplified website
//
function generateAndSaveWebsiteSimple() {

    var theOutput = "";

    var theABC = gTheABC.value;

    // For local storage naming
    var postFix = generatePostfix();

    //console.log("postFix: "+postFix);

    // Any tunes to reformat?
    if (CountTunes() == 0){

        clearGetTuneByIndexCache();

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

        clearGetTuneByIndexCache();

        var thePrompt = "Problem generating tune share links!";

        thePrompt = makeCenteredPromptString(thePrompt);

          DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    // Keep track of actions
    sendGoogleAnalytics("action","SaveWebsiteSimple");

    // Create the website code

    // Header
    theOutput += "<!DOCTYPE html>\n";
    theOutput +="\n";
    theOutput +='<html lang="en">\n';
    theOutput +="\n";
    theOutput +="<head>\n";
    theOutput +="\n";
    theOutput +='<meta charset="UTF-8">\n';

    theOutput +='<meta name="viewport" content="width=860" />\n'; 
    theOutput +='<meta property="og:image" content="https://michaeleskin.com/abctools/img/abc-icon.png" />\n';
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
        // Center the image and fill the page
        if (gWebsiteColor.indexOf("url(") != -1){
            theOutput +="        background: center "+gWebsiteColor+";\n";   
            theOutput +="        background-size: cover;\n";   
        }
        else{
            // Just inject the gradient
            theOutput +="        background-image: "+gWebsiteColor+";\n";   
        }
    }
    theOutput +="        margin: 0px;\n";
    theOutput +="        padding: 0px;\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    .container {\n";
    theOutput +="        margin: 0px auto;\n";
    theOutput +="        text-align: center;\n";
    theOutput +="        overflow-x: hidden;\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    h1 {\n";
    theOutput +="        font-size: 24px;\n";
    theOutput +="        margin-top: 24px;\n";
    theOutput +="        margin-bottom: 0px;\n";
    theOutput +="        color: "+gWebsiteTextColor+";\n";
    theOutput +="    }\n";
    theOutput +="\n";

    if (gWebsiteTitle && (gWebsiteTitle != "")) {   
        theOutput +="    h2 {\n";
        theOutput +="        font-size: 18px;\n";
        theOutput +="        margin-top: 18px;\n";
        theOutput +="        margin-bottom: 24px;\n";
        theOutput +="        color: "+gWebsiteTextColor+";\n";
        theOutput +="    }\n";
    }else{
        theOutput +="    h2 {\n";
        theOutput +="        font-size: 18px;\n";
        theOutput +="        margin-top: 24px;\n";
        theOutput +="        margin-bottom: 24px;\n";
        theOutput +="        color: "+gWebsiteTextColor+";\n";
        theOutput +="    }\n";       
    }
    theOutput +="\n";

    theOutput +="    p {\n";
    theOutput +="        color: "+gWebsiteTextColor+";\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    a {\n";
    theOutput +="        color: "+gWebsiteHyperlinkColor+";\n";
    theOutput +="        font-size: 18px;\n";
    theOutput +="        text-decoration: none;\n";
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

    theOutput +="    #footer1{\n";
    theOutput +="        font-size: 18px;\n";
    theOutput +="        margin-top: 16px;\n";
    theOutput +="        margin-bottom: 16px;\n";
    theOutput +="        color: "+gWebsiteTextColor+";\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    #footer2{\n";
    theOutput +="        font-size: 18px;\n";
    theOutput +="        margin-top: 16px;\n";
    theOutput +="        margin-bottom: 16px;\n";
    theOutput +="        color: "+gWebsiteTextColor+";\n";
    theOutput +="    }\n";
    theOutput +="\n";

    if (gWebsiteAddHelp){
        // There is a title or subtitle present
        if ((gWebsiteTitle && (gWebsiteTitle != "")) || (gWebsiteSubtitle && (gWebsiteSubtitle != ""))){
            theOutput +="    #website_help{\n";
            theOutput +="        font-size: 28pt;\n";
            theOutput +="        position: absolute;\n";
            theOutput +="        left: 16px;\n";
            theOutput +="        top: 12px;\n";
            theOutput +="        color: "+gWebsiteHyperlinkColor+";\n";
            theOutput +="    }\n";
            theOutput +="\n";
        }
        else{
            theOutput +="    #website_help{\n";
            theOutput +="        font-size: 28pt;\n";
            theOutput +="        position: absolute;\n";
            theOutput +="        left: 16px;\n";
            theOutput +="        top: 10px;\n";
            theOutput +="        color: "+gWebsiteHyperlinkColor+";\n";
            theOutput +="    }\n";
            theOutput +="\n";
        }
    }

    theOutput +="    ul{\n";
    theOutput +="        list-style-type:none;\n";
    theOutput +="        padding:0px;\n";
    theOutput +="        text-align:center;\n";
    theOutput +="    }\n";
    theOutput +="    \n";

    theOutput +="    li{\n";
    theOutput +="        margin-bottom: 16px;\n";
    theOutput +="    }\n";
    theOutput +="\n";

    theOutput +="</style>\n";
    theOutput +="\n";
    theOutput +="</head>\n";
    theOutput +="\n";

    // HTML
    theOutput +="<body>\n";
    theOutput +="\n";
    theOutput +='    <div class="container">\n';
    if (gWebsiteAddHelp){
        theOutput +='        <a id="website_help" href="'+gWebsiteHelpURL+'" target="_blank" style="text-decoration:none;" title="Information about using this tunebook" class="cornerbutton">?</a>\n';
    }
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
        theOutput +='        <hr style="margin-top:24px;margin-bottom:24px;width:500px;color:white;">\n';
    }

    theOutput +='        <div id="tuneShareLinkHolder"></div>\n';  

    var doHR = false;
    if ((gWebsiteFooter1 && (gWebsiteFooter1 != "")) || (gWebsiteFooter2 && (gWebsiteFooter2 != ""))){
        doHR = true;
    }

    if (doHR){
        theOutput +='        <hr style="margin-top:24px;margin-bottom:24px;width:500px;color:white;">\n';
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
            theOutput +='        <p id="footer2">'+gWebsiteFooter2+'</p>\n';            
        }
    }

    if (doHR){
        theOutput +='        <hr style="margin-top:24px;margin-bottom:24px;width:500px;color:white;">\n';
    }

    theOutput +="    </div>\n";
    theOutput +="\n";

    // JavaScript
    theOutput +="    <script>\n";
    theOutput +="\n";
    theOutput += "    "+theJSON;
    theOutput +="\n";
    theOutput +="\n";
    theOutput +="    // Populate the tunes div with options from JSON\n";
    theOutput +="    document.addEventListener('DOMContentLoaded', () => {\n";
    theOutput +="\n";
    
    theOutput +="        // Select the div where the links will be inserted\n"
    theOutput +="        const holder = document.getElementById('tuneShareLinkHolder');\n"
    theOutput +="\n";

    theOutput +="        // Create an unordered list element\n"
    theOutput +="        const ul = document.createElement('ul');\n"
    theOutput +="\n";

    theOutput +="        // Loop through the tunes array and create list items with hyperlinks\n"
    theOutput +="        tunes.forEach(tune => {\n"
    theOutput +="          const li = document.createElement('li');\n"
    theOutput +="          const link = document.createElement('a');\n"
    theOutput +="\n";

    theOutput +="          // Set the text and URL of the link\n"
    theOutput +="          link.textContent = tune.Name;\n"
    theOutput +="          link.href = tune.URL;\n"
    theOutput +="          link.target = '_blank';  // Opens the link in a new tab\n"
    theOutput +="          link.title = 'Click to play \"'+tune.Name+'\"';\n"
    theOutput +="\n";

    theOutput +="          // Append the link to the list item, and the list item to the ul\n"
    theOutput +="          li.appendChild(link);\n"
    theOutput +="          ul.appendChild(li);\n"
    theOutput +="        });\n"
    theOutput +="\n";

    // Append the list to the div
    theOutput +="        holder.appendChild(ul);\n";
    theOutput +="\n";

    theOutput +="    });\n";    
    theOutput +="\n";
    theOutput +="</script>\n";
    theOutput +="\n";
    theOutput +="</body>\n";
    theOutput +="\n";
    theOutput +="</html>\n";

    var theData = theOutput

    if (theData.length == 0) {

        clearGetTuneByIndexCache();

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

        clearGetTuneByIndexCache();

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


//
// Generate an image gallery website
//
function generateAndSaveWebsiteImageGallery() {

    var theOutput = "";

    var theABC = gTheABC.value;

    // For local storage naming
    var postFix = generatePostfix();

    //console.log("postFix: "+postFix);

    var number_of_tunes = CountTunes();

    // Any tunes to reformat?
    if (number_of_tunes == 0){

        clearGetTuneByIndexCache();

        var thePrompt = "No ABC tunes to export.";

        thePrompt = makeCenteredPromptString(thePrompt);

        DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    var theJSON = BatchJSONExportForWebGalleryGenerator(theABC);

    if (!theJSON){

        clearGetTuneByIndexCache();

        var thePrompt = "Problem generating tune share links!";

        thePrompt = makeCenteredPromptString(thePrompt);

          DayPilot.Modal.alert(thePrompt, {
            theme: "modal_flat",
            top: 200
        });

        return;
    }

    // Keep track of actions
    sendGoogleAnalytics("action","SaveWebsiteImageGallery");

    // Create the website code

    // Header
    theOutput += "<!DOCTYPE html>\n";
    theOutput +="\n";
    theOutput +='<html lang="en">\n';
    theOutput +="\n";
    theOutput +="<head>\n";
    theOutput +="\n";
    theOutput +='<meta charset="UTF-8">\n';

    theOutput +='<meta name="viewport" content="width=860" />\n'; 
    theOutput +='<meta property="og:image" content="https://michaeleskin.com/abctools/img/abc-icon.png" />\n';
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
        // Center the image and fill the page
        if (gWebsiteColor.indexOf("url(") != -1){
            theOutput +="        background: center "+gWebsiteColor+";\n";   
            theOutput +="        background-size: cover;\n";   
        }
        else{
            // Just inject the gradient
            theOutput +="        background-image: "+gWebsiteColor+";\n";   
        }
    }
    theOutput +="        margin: 0px;\n";
    theOutput +="        padding: 0px;\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    .container {\n";
    theOutput +="        margin: 0px auto;\n";
    theOutput +="        text-align: center;\n";
    theOutput +="        overflow-x: hidden;\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    h1 {\n";
    theOutput +="        font-size: 24px;\n";
    theOutput +="        margin-top: 24px;\n";
    theOutput +="        margin-bottom: 0px;\n";
    theOutput +="        color: "+gWebsiteTextColor+";\n";
    theOutput +="    }\n";
    theOutput +="\n";

    if (gWebsiteTitle && (gWebsiteTitle != "")) {   
        theOutput +="    h2 {\n";
        theOutput +="        font-size: 18px;\n";
        theOutput +="        margin-top: 18px;\n";
        theOutput +="        margin-bottom: 24px;\n";
        theOutput +="        color: "+gWebsiteTextColor+";\n";
        theOutput +="    }\n";
    }else{
        theOutput +="    h2 {\n";
        theOutput +="        font-size: 18px;\n";
        theOutput +="        margin-top: 24px;\n";
        theOutput +="        margin-bottom: 24px;\n";
        theOutput +="        color: "+gWebsiteTextColor+";\n";
        theOutput +="    }\n";       
    }
    theOutput +="\n";

    theOutput +="    p {\n";
    theOutput +="        color: "+gWebsiteTextColor+";\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    a {\n";
    theOutput +="        color: "+gWebsiteHyperlinkColor+";\n";
    theOutput +="        font-size: 18px;\n";
    theOutput +="        text-decoration: none;\n";
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

    theOutput +="    #footer1{\n";
    theOutput +="        font-size: 18px;\n";
    theOutput +="        margin-top: 16px;\n";
    theOutput +="        margin-bottom: 16px;\n";
    theOutput +="        color: "+gWebsiteTextColor+";\n";
    theOutput +="    }\n";
    theOutput +="\n";
    theOutput +="    #footer2{\n";
    theOutput +="        font-size: 18px;\n";
    theOutput +="        margin-top: 16px;\n";
    theOutput +="        margin-bottom: 16px;\n";
    theOutput +="        color: "+gWebsiteTextColor+";\n";
    theOutput +="    }\n";
    theOutput +="\n";

    theOutput +="    .image-container {\n";
    theOutput +="      margin: 20px 0;\n";
    theOutput +="      text-align: center;\n";
    theOutput +="    }\n";
    theOutput +="\n";

    var tuneImageWidth = gWebsiteImageWidth;

    if (!gWebsiteImageWidthIsPercentage){

        tuneImageWidth = parseInt(tuneImageWidth);

        if (isNaN(tuneImageWidth)){
            tuneImageWidth = 800;
        }
    }

    if (gWebsiteImageWidthIsPercentage || (tuneImageWidth >= 800)){
        theOutput +="    .image-container img {\n";
        theOutput +="      max-width: 100%;\n";
        theOutput +="      height: auto;\n";
        theOutput +="      cursor: pointer;\n";
        theOutput +="      border-left: 18px solid white;\n";
        theOutput +="      border-right: 18px solid white;\n";
        theOutput +="      border-bottom: 32px solid white;\n";
        theOutput +="      background: white;\n";
        theOutput +="    }\n";
        theOutput +="\n";
    }
    else{
        theOutput +="    .image-container img {\n";
        theOutput +="      max-width: 100%;\n";
        theOutput +="      height: auto;\n";
        theOutput +="      cursor: pointer;\n";
        theOutput +="      border-left: 12px solid white;\n";
        theOutput +="      border-right: 12px solid white;\n";
        theOutput +="      border-bottom: 26px solid white;\n";
        theOutput +="      background: white;\n";
        theOutput +="    }\n";
        theOutput +="\n";
    }

    if (gWebsiteAddHelp){
        // There is a title or subtitle present
        if ((gWebsiteTitle && (gWebsiteTitle != "")) || (gWebsiteSubtitle && (gWebsiteSubtitle != ""))){
            theOutput +="    #website_help{\n";
            theOutput +="        font-size: 28pt;\n";
            theOutput +="        position: absolute;\n";
            theOutput +="        left: 16px;\n";
            theOutput +="        top: 12px;\n";
            theOutput +="        color: "+gWebsiteHyperlinkColor+";\n";
            theOutput +="    }\n";
            theOutput +="\n";
        }
        else{
            theOutput +="    #website_help{\n";
            theOutput +="        font-size: 28pt;\n";
            theOutput +="        position: absolute;\n";
            theOutput +="        left: 16px;\n";
            theOutput +="        top: 10px;\n";
            theOutput +="        color: "+gWebsiteHyperlinkColor+";\n";
            theOutput +="    }\n";
            theOutput +="\n";
        }
    }

    theOutput +="</style>\n";
    theOutput +="\n";
    theOutput +="</head>\n";
    theOutput +="\n";

    // HTML
    theOutput +="<body>\n";
    theOutput +="\n";
    theOutput +='    <div class="container">\n';
    if (gWebsiteAddHelp){
        theOutput +='        <a id="website_help" href="'+gWebsiteHelpURL+'" target="_blank" style="text-decoration:none;" title="Information about using this tunebook" class="cornerbutton">?</a>\n';
    }
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
        theOutput +='        <hr style="margin-top:24px;margin-bottom:24px;width:500px;color:white;">\n';
    }

    theOutput +='        <div id="image_gallery"></div>\n';  

    var doHR = false;
    if ((gWebsiteFooter1 && (gWebsiteFooter1 != "")) || (gWebsiteFooter2 && (gWebsiteFooter2 != ""))){
        doHR = true;
    }

    if (doHR){
        theOutput +='        <hr style="margin-top:24px;margin-bottom:24px;width:500px;color:white;">\n';
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
            theOutput +='        <p id="footer2">'+gWebsiteFooter2+'</p>\n';            
        }
    }

    if (doHR){
        theOutput +='        <hr style="margin-top:24px;margin-bottom:24px;width:500px;color:white;">\n';
    }

    theOutput +="    </div>\n";
    theOutput +="\n";

    // JavaScript
    theOutput +="    <script>\n";
    theOutput +="\n";
    theOutput += "    "+theJSON;
    theOutput +="\n";
    theOutput +="\n";
    theOutput +="    // Populate the tunes div with images from JSON\n";
    theOutput +="    document.addEventListener('DOMContentLoaded', () => {\n";
    theOutput +="\n";  
    theOutput +="        // Select the div where the images will be inserted\n"
    theOutput +="        gallery = document.getElementById('image_gallery');\n"
    theOutput +="\n";
    theOutput +="        // Loop through the array and create img elements\n"
    theOutput +="        tunes.forEach(item => {\n"
    theOutput +="\n";
    theOutput +="          // Create a div to hold each image\n"
    theOutput +="          const div = document.createElement('div');\n"
    theOutput +="          div.classList.add('image-container');\n"
    theOutput +="\n";
    theOutput +="          // Create an img element\n"
    theOutput +="          const img = document.createElement('img');\n"
    theOutput +="          img.src = item.Filename;\n"
    theOutput +="          img.alt = item.Name;\n"
    theOutput +="          img.title = 'Click to play \"'+item.Name+'\"';\n"
    
    // On large tunebooks, make the image load lazy
    if (number_of_tunes > 25){
        theOutput +="          img.setAttribute('loading', 'lazy');\n"
    }

    theOutput +="          img.setAttribute('width', '"+gWebsiteImageWidth+"');\n"
    theOutput +="\n";
    theOutput +="          // Add click event to open the link\n"
    theOutput +="          img.addEventListener('click', () => {\n"
    theOutput +="            window.open(item.URL, '_blank');\n"
    theOutput +="          });\n"
    theOutput +="\n";
    theOutput +="          // Append the img to the div\n"
    theOutput +="          div.appendChild(img);\n"
    theOutput +="\n";
    theOutput +="          // Append the div to the gallery\n"
    theOutput +="          gallery.appendChild(div);\n"
    theOutput +="\n";
    theOutput +="        });\n"
    theOutput +="\n";
    theOutput +="    });\n";    
    theOutput +="\n";
    theOutput +="</script>\n";
    theOutput +="\n";
    theOutput +="</body>\n";
    theOutput +="\n";
    theOutput +="</html>\n";

    var theData = theOutput

    if (theData.length == 0) {

        clearGetTuneByIndexCache();

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

        clearGetTuneByIndexCache();

        var fname = args.result;

        // If the user pressed Cancel, exit
        if (fname == null) {
            return null;
        }

        DoBatchImageExport("SVG",function(cancelRequested){

            if (!cancelRequested){

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
            }

        });

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
var gWebsiteColor = "#FFFFFF";
var gWebsiteTextColor = "#000000";
var gWebsiteHyperlinkColor = "#000000";
var gWebsiteFilename = "";
var gWebsiteOpenInPlayer = true;
var gWebsiteDisableEdit = false;
var gWebsiteTabSelector = true;
var gWebsiteAddHelp = false;
var gWebsiteHelpURL = "";
var gWebsiteAddFullscreen = true;
var gWebsiteImageWidth = 800;
var gWebsiteImageWidthIsPercentage = false;

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

    // Background color
    website_color: gWebsiteColor,

    // Text color
    website_textcolor: gWebsiteTextColor,

    // Hyperlink color
    website_hyperlinkcolor: gWebsiteHyperlinkColor,

    // Open in player
    bOpenInPlayer: gWebsiteOpenInPlayer,

    // Disable editor
    bDisableEdit: gWebsiteDisableEdit,

    // Add tab selector
    bTabSelector: gWebsiteTabSelector,

    // Add help
    bAddHelp: gWebsiteAddHelp,

    // Website help url
    website_helpurl: gWebsiteHelpURL,

    // Add fullscreen
    bAddFullscreen: gWebsiteAddFullscreen,

    // Image width
    image_width: gWebsiteImageWidth

}

var website_export_midi_program_list = null;

//
// Generate a website with instrument selection, tab options
//
function generateWebsiteFull(){

    // If disabled, return
    if (!gAllowWebExport){
        return;
    }

    // Restore saved settings
    LoadWebsiteSettings();

    if (!website_export_midi_program_list){

        //console.log("Generating website export MIDI program list");

        website_export_midi_program_list=[];
        
        for (var i=0;i<=MIDI_PATCH_COUNT;++i){
            website_export_midi_program_list.push({name: "  "+ generalMIDISoundNames[i], id: i });
        }
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

    var form = [
      {html: '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:15px;margin-bottom:18px">Export Full-Featured Tunebook Website&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#generate_website" target="_blank" style="text-decoration:none;position:absolute;left:20px;top:20px" class="dialogcornerbutton">?</a></span></p>'},  
      {html: '<p style="margin-top:10px;margin-bottom:18px;font-size:12pt;line-height:14pt;font-family:helvetica">Clicking "Export" will export a tunebook player website with the settings you enter below:</p>'},  
      {name: "Website title:", id: "website_title", type:"text", cssClass:"configure_website_form_text_wide"},
      {name: "Website subtitle:", id: "website_subtitle", type:"text", cssClass:"configure_website_form_text_wide2"},
      {name: "Website footer #1:", id: "website_footer1", type:"text", cssClass:"configure_website_form_text_wide2"},
      {name: "Website footer #2:", id: "website_footer2", type:"text", cssClass:"configure_website_form_text_wide2"},
      {html: '<p style="margin-top:28px;margin-bottom:18px;font-size:12pt;line-height:14pt;font-family:helvetica">Background can be an HTML color, HTML gradient, or url(\'path_to_image\') image:</p>'},  
      {name: "Website background:", id: "website_color", type:"text",cssClass:"configure_website_form_text_wide5"},      
      {name: "Text color (HTML color):", id: "website_textcolor", type:"text",cssClass:"configure_website_form_text2"},      
      {name: "Hyperlink color (HTML color, also used for help icon):", id: "website_hyperlinkcolor", type:"text",cssClass:"configure_website_form_text2"},      
      {name: "          Add tablature/instrument selector dropdown ", id: "bTabSelector", type:"checkbox", cssClass:"configure_website_form_text2"},
      {name: "          Disable access to editor ", id: "bDisableEdit", type:"checkbox", cssClass:"configure_website_form_text2"},
      {name: "          Add a ? help icon at top-left corner ", id: "bAddHelp", type:"checkbox", cssClass:"configure_website_form_text6"},
      {name: "Tunebook help URL:", id: "website_helpurl", type:"text",cssClass:"configure_website_form_text_wide5"},      
      {name: "          Add a \"Full Screen\" button at top-right corner that opens the current tune in a new tab", id: "bAddFullscreen", type:"checkbox", cssClass:"configure_website_form_text2"},
      {name: "          Tunes open in the Player ", id: "bOpenInPlayer", type:"checkbox", cssClass:"configure_website_form_text2"},
      {name: "          Add instruments and volume overrides to each tune ", id: "bInjectInstruments", type:"checkbox", cssClass:"configure_website_form_text2"},
      {name: "Soundfont:", id: "sound_font", type:"select", options:sound_font_options, cssClass:"configure_setuppdftunebook_midi_program_select"},
      {name: "Melody instrument:", id: "melody_instrument", type:"select", options:website_export_midi_program_list, cssClass:"configure_setuppdftunebook_midi_program_select"},
      {name: "Bass instrument:", id: "bass_instrument", type:"select", options:website_export_midi_program_list, cssClass:"configure_setuppdftunebook_midi_program_select"},
      {name: "Bass volume (0-127):", id: "bass_volume", type:"number", cssClass:"configure_website_form_text"},
      {name: "Chord instrument:", id: "chord_instrument", type:"select", options:website_export_midi_program_list, cssClass:"configure_setuppdftunebook_midi_program_select"},
      {name: "Chord volume (0-127):", id: "chord_volume", type:"number", cssClass:"configure_website_form_text"},
    ];

    const modal = DayPilot.Modal.form(form, gWebsiteConfig, { theme: "modal_flat", top: 10, width: 760, scrollWithPage: (AllowDialogsToScroll()), okText: "Export", autoFocus: false } ).then(function(args){
    
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

            // Disable edit
            gWebsiteDisableEdit = args.result.bDisableEdit
            gWebsiteConfig.bDisableEdit = gWebsiteDisableEdit;

            // Add tab selector
            gWebsiteTabSelector = args.result.bTabSelector
            gWebsiteConfig.bTabSelector = gWebsiteTabSelector;

            // Open in player
            gWebsiteOpenInPlayer = args.result.bOpenInPlayer;
            gWebsiteConfig.bOpenInPlayer = gWebsiteOpenInPlayer;

            // Background color
            gWebsiteColor = args.result.website_color;
            gWebsiteConfig.website_color = gWebsiteColor;

            // Text color
            gWebsiteTextColor = args.result.website_textcolor;
            gWebsiteConfig.website_textcolor = gWebsiteTextColor;

            // Hyperlink color
            gWebsiteHyperlinkColor = args.result.website_hyperlinkcolor;
            gWebsiteConfig.website_hyperlinkcolor = gWebsiteHyperlinkColor;

            // Add help?
            gWebsiteAddHelp = args.result.bAddHelp;
            gWebsiteConfig.bAddHelp = gWebsiteAddHelp;

            // Help URL
            gWebsiteHelpURL = args.result.website_helpurl;
            gWebsiteConfig.website_helpurl = gWebsiteHelpURL;

            // Add fullscreen?
            gWebsiteAddFullscreen = args.result.bAddFullscreen;
            gWebsiteConfig.bAddFullscreen = gWebsiteAddFullscreen;

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

            generateAndSaveWebsiteFull();

        }

    });
}

//
// Generate a simple website with a list of tunes an dlinks
//
function generateWebsiteSimple(){

    // If disabled, return
    if (!gAllowWebExport){
        return;
    }

    // Restore saved settings
    LoadWebsiteSettings();

    if (!website_export_midi_program_list){

        //console.log("Generating website export MIDI program list");

        website_export_midi_program_list=[];
        
        for (var i=0;i<=MIDI_PATCH_COUNT;++i){
            website_export_midi_program_list.push({name: "  "+ generalMIDISoundNames[i], id: i });
        }
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
    var form = [
      {html: '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:15px;margin-bottom:18px">Export Basic Tune List Website&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#generate_website" target="_blank" style="text-decoration:none;position:absolute;left:20px;top:20px" class="dialogcornerbutton">?</a></span></p>'},  
      {html: '<p style="margin-top:10px;margin-bottom:18px;font-size:12pt;line-height:14pt;font-family:helvetica">Clicking "Export" will export a tune list hyperlink website with the settings you enter below:</p>'},  
      {name: "Website title:", id: "website_title", type:"text", cssClass:"configure_website_form_text_wide_simple"},
      {name: "Website subtitle:", id: "website_subtitle", type:"text", cssClass:"configure_website_form_text_wide2_simple"},
      {name: "Website footer #1:", id: "website_footer1", type:"text", cssClass:"configure_website_form_text_wide2_simple"},
      {name: "Website footer #2:", id: "website_footer2", type:"text", cssClass:"configure_website_form_text_wide2_simple"},
      {html: '<p style="margin-top:20px;margin-bottom:18px;font-size:12pt;line-height:14pt;font-family:helvetica">Background can be an HTML color, HTML gradient, or url(\'path_to_image\') image:</p>'},  
      {name: "Website background:", id: "website_color", type:"text",cssClass:"configure_website_form_text_wide5_simple"},      
      {name: "Text color (HTML color):", id: "website_textcolor", type:"text",cssClass:"configure_website_form_text2_simple"},      
      {name: "Hyperlink color (HTML color, also used for help icon):", id: "website_hyperlinkcolor", type:"text",cssClass:"configure_website_form_text2_simple"},      
      {name: "          Add a ? help icon at top-left corner ", id: "bAddHelp", type:"checkbox", cssClass:"configure_website_form_text2_simple"},
      {name: "Tunebook help URL:", id: "website_helpurl", type:"text",cssClass:"configure_website_form_text_wide5_simple"},      
      {name: "          Disable access to editor ", id: "bDisableEdit", type:"checkbox", cssClass:"configure_website_form_text2_simple"},
      {name: "          Tunes open in the Player ", id: "bOpenInPlayer", type:"checkbox", cssClass:"configure_website_form_text2_simple"},
      {name: "          Add instruments and volume overrides to each tune ", id: "bInjectInstruments", type:"checkbox", cssClass:"configure_website_form_text2_simple"},
      {name: "Soundfont:", id: "sound_font", type:"select", options:sound_font_options, cssClass:"configure_setuppdftunebook_midi_program_select"},
      {name: "Melody instrument:", id: "melody_instrument", type:"select", options:website_export_midi_program_list, cssClass:"configure_setuppdftunebook_midi_program_select"},
      {name: "Bass instrument:", id: "bass_instrument", type:"select", options:website_export_midi_program_list, cssClass:"configure_setuppdftunebook_midi_program_select"},
      {name: "Bass volume (0-127):", id: "bass_volume", type:"number", cssClass:"configure_website_form_text"},
      {name: "Chord instrument:", id: "chord_instrument", type:"select", options:website_export_midi_program_list, cssClass:"configure_setuppdftunebook_midi_program_select"},
      {name: "Chord volume (0-127):", id: "chord_volume", type:"number", cssClass:"configure_website_form_text"},
    ];

    const modal = DayPilot.Modal.form(form, gWebsiteConfig, { theme: "modal_flat", top: 10, width: 760, scrollWithPage: (AllowDialogsToScroll()), okText: "Export", autoFocus: false } ).then(function(args){
    
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

            // Background color
            gWebsiteColor = args.result.website_color;
            gWebsiteConfig.website_color = gWebsiteColor;

            // Text color
            gWebsiteTextColor = args.result.website_textcolor;
            gWebsiteConfig.website_textcolor = gWebsiteTextColor;

            // Hyperlink color
            gWebsiteHyperlinkColor = args.result.website_hyperlinkcolor;
            gWebsiteConfig.website_hyperlinkcolor = gWebsiteHyperlinkColor;

            // Add help?
            gWebsiteAddHelp = args.result.bAddHelp;
            gWebsiteConfig.bAddHelp = gWebsiteAddHelp;

            // Help URL
            gWebsiteHelpURL = args.result.website_helpurl;
            gWebsiteConfig.website_helpurl = gWebsiteHelpURL;

            // Open in player
            gWebsiteOpenInPlayer = args.result.bOpenInPlayer;
            gWebsiteConfig.bOpenInPlayer = gWebsiteOpenInPlayer;

            // Disable edit
            gWebsiteDisableEdit = args.result.bDisableEdit
            gWebsiteConfig.bDisableEdit = gWebsiteDisableEdit;

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

            generateAndSaveWebsiteSimple();

        }

    });
}

//
// Generate a simple website with images and links
//
function generateWebsiteImageGallery(){

    // If disabled, return
    if (!gAllowWebExport){
        return;
    }

    // Restore saved settings
    LoadWebsiteSettings();

    if (!website_export_midi_program_list){

        //console.log("Generating website export MIDI program list");

        website_export_midi_program_list=[];
        
        for (var i=0;i<=MIDI_PATCH_COUNT;++i){
            website_export_midi_program_list.push({name: "  "+ generalMIDISoundNames[i], id: i });
        }
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

    var form = [
      {html: '<p style="text-align:center;font-size:18pt;font-family:helvetica;margin-left:15px;margin-bottom:18px">Export Tune Image Gallery Website&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#generate_website" target="_blank" style="text-decoration:none;position:absolute;left:20px;top:20px" class="dialogcornerbutton">?</a></span></p>'},  
      {html: '<p style="margin-top:10px;margin-bottom:18px;font-size:12pt;line-height:14pt;font-family:helvetica">Clicking "Export" will export a tune image vertical gallery website with the settings you enter below:</p>'},  
      {name: "Website title:", id: "website_title", type:"text", cssClass:"configure_website_form_text_wide_gallery"},
      {name: "Website subtitle:", id: "website_subtitle", type:"text", cssClass:"configure_website_form_text_wide2_gallery"},
      {name: "Website footer #1:", id: "website_footer1", type:"text", cssClass:"configure_website_form_text_wide2_gallery"},
      {name: "Website footer #2:", id: "website_footer2", type:"text", cssClass:"configure_website_form_text_wide2_gallery"},
      {html: '<p style="margin-top:20px;margin-bottom:18px;font-size:12pt;line-height:14pt;font-family:helvetica">Background can be an HTML color, HTML gradient, or url(\'path_to_image\') image:</p>'},  
      {name: "Website background:", id: "website_color", type:"text",cssClass:"configure_website_form_text_wide5_gallery"},      
      {name: "Text color (HTML color):", id: "website_textcolor", type:"text",cssClass:"configure_website_form_text2_gallery"},      
      {name: "Hyperlink color (HTML color, also used for help icon):", id: "website_hyperlinkcolor", type:"text",cssClass:"configure_website_form_text2_gallery"},
      {name: "Tune image width (number for fixed width, number with % for responsive):", id: "image_width", type:"number", cssClass:"configure_website_form_text2_gallery"},
      {name: "          Add a ? help icon at top-left corner ", id: "bAddHelp", type:"checkbox", cssClass:"configure_website_form_text2_gallery"},
      {name: "Tunebook help URL:", id: "website_helpurl", type:"text",cssClass:"configure_website_form_text_wide5_gallery"},      
      {name: "          Disable access to editor ", id: "bDisableEdit", type:"checkbox", cssClass:"configure_website_form_text2_gallery"},
      {name: "          Tunes open in the Player ", id: "bOpenInPlayer", type:"checkbox", cssClass:"configure_website_form_text2_gallery"},
      {name: "          Add instruments and volume overrides to each tune ", id: "bInjectInstruments", type:"checkbox", cssClass:"configure_website_form_text2_gallery"},
      {name: "Soundfont:", id: "sound_font", type:"select", options:sound_font_options, cssClass:"configure_setuppdftunebook_midi_program_select"},
      {name: "Melody instrument:", id: "melody_instrument", type:"select", options:website_export_midi_program_list, cssClass:"configure_setuppdftunebook_midi_program_select"},
      {name: "Bass instrument:", id: "bass_instrument", type:"select", options:website_export_midi_program_list, cssClass:"configure_setuppdftunebook_midi_program_select"},
      {name: "Bass volume (0-127):", id: "bass_volume", type:"number", cssClass:"configure_website_form_text"},
      {name: "Chord instrument:", id: "chord_instrument", type:"select", options:website_export_midi_program_list, cssClass:"configure_setuppdftunebook_midi_program_select"},
      {name: "Chord volume (0-127):", id: "chord_volume", type:"number", cssClass:"configure_website_form_text"},
    ];

    const modal = DayPilot.Modal.form(form, gWebsiteConfig, { theme: "modal_flat", top: 10, width: 760, scrollWithPage: (AllowDialogsToScroll()), okText: "Export", autoFocus: false } ).then(function(args){
    
        if (!args.canceled){

            clearGetTuneByIndexCache();

            gWebsiteImageWidth = args.result.image_width
            gWebsiteConfig.image_width = gWebsiteImageWidth;

            if (gWebsiteImageWidth.indexOf("%") != -1){
                gWebsiteImageWidthIsPercentage = true;
            }
            else{
                gWebsiteImageWidthIsPercentage = false;
            }

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

            // Background color
            gWebsiteColor = args.result.website_color;
            gWebsiteConfig.website_color = gWebsiteColor;

            // Text color
            gWebsiteTextColor = args.result.website_textcolor;
            gWebsiteConfig.website_textcolor = gWebsiteTextColor;

            // Hyperlink color
            gWebsiteHyperlinkColor = args.result.website_hyperlinkcolor;
            gWebsiteConfig.website_hyperlinkcolor = gWebsiteHyperlinkColor;

            // Add help?
            gWebsiteAddHelp = args.result.bAddHelp;
            gWebsiteConfig.bAddHelp = gWebsiteAddHelp;

            // Help URL
            gWebsiteHelpURL = args.result.website_helpurl;
            gWebsiteConfig.website_helpurl = gWebsiteHelpURL;

            // Open in player
            gWebsiteOpenInPlayer = args.result.bOpenInPlayer;
            gWebsiteConfig.bOpenInPlayer = gWebsiteOpenInPlayer;

            // Disable edit
            gWebsiteDisableEdit = args.result.bDisableEdit
            gWebsiteConfig.bDisableEdit = gWebsiteDisableEdit;

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

            generateAndSaveWebsiteImageGallery();

        }

    });
}


//
// Generate website
//
function generateWebsite(){

    if (!gAllowWebExport){
        return;
    }

    var format = GetRadioValue("notenodertab");

    var modal_msg  = '<p style="text-align:center;margin-bottom:36px;font-size:18pt;font-family:helvetica;margin-left:15px;">Export Website&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#generate_website" target="_blank" style="text-decoration:none;position:absolute;left:20px;top:20px" class="dialogcornerbutton">?</a></span></p>';
    
    modal_msg  += '<p style="font-size:18px;line-height:28px;">Click <strong>Export Basic Tune List Website</strong> to export a technically simple website with a list of all tunes in the ABC vertically down the center of the page. Playback instruments may be optionally specified.</p>';
    modal_msg  += '<p style="font-size:18px;line-height:28px;">Clicking a tune name in the list will open the tune in a new browser tab.</p>';

    if (((format != "whistle") && (format != "recorder")) && (isPureDesktopBrowser())){
        modal_msg  += '<p style="font-size:18px;line-height:28px;">Click <strong>Export Tune Image Gallery Website</strong> to export a website with tune notation images of all the tunes in the ABC vertically down the center of the page. Playback instruments may be optionally specified.</p>';
        modal_msg  += '<p style="font-size:18px;line-height:28px;">Clicking a tune image will open the tune in a new browser tab.</p>';
    }

    modal_msg  += '<p style="font-size:18px;line-height:28px;">Click <strong>Export Full-Featured Tunebook Website</strong> to export a website with a dropdown list of tune names and optional tablature styles. Playback instruments may be optionally specified. The website remembers the user\'s last selected tune and tablature setting.</p>';
    modal_msg  += '<p style="font-size:18px;line-height:28px;margin-bottom:36px;">Clicking a tune name in the tune list dropdown opens it in a frame on the same browser tab.</p>';

    modal_msg  += '<p style="text-align:center;"><input id="websitesimple" class="advancedcontrols btn btn-websiteexport" onclick="generateWebsiteSimple()" type="button" value="Export Basic Tune List Website" title="Generates a website that has a list of tunes that open in a new browser tab when clicked.">';
    
    if (((format != "whistle") && (format != "recorder")) && (isPureDesktopBrowser())){
        modal_msg  += '<input id="websiteimages" class="advancedcontrols btn btn-websiteexport" onclick="generateWebsiteImageGallery()" type="button" value="Export Tune Image Gallery Website" title="Generates a website that has the images of the tunes that open for playback in a new browser tab when clicked."></p><p style="text-align:center;margin-top:32px;">';
    }

    modal_msg  += '<input id="websitefull" class="advancedcontrols btn btn-websiteexport" onclick="generateWebsiteFull()" type="button" value="Export Full-Featured Tunebook Website" title="Generates a website that has dropdowns for the tunes and optional display tablature selection.&nbsp;&nbsp;When a tune is selected from the dropdown, the tune opens in an iframe on the page."></p>';
    
    modal_msg  += '<p style="font-size:4px;">&nbsp;</p>';

    DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 50, width: 650, scrollWithPage: (AllowDialogsToScroll()) });

}

