//
// abc2csv.js
//
// Extracts all tags from one or more ABC files to a CSV file
//
// Michael Eskin
// https://michaeleskin.com
//

// Suggested filename for save
var gSaveFilename = "";
var gIncludeShareURLs = true;
var gIncludeFilenames = true;

var LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module&&(module.exports=LZString);

//
// Generate a share link for either all the tunes or just what's passed in
//
function getAbcInLZW(ABCtoEncode) {

    var abcInLZW = LZString.compressToEncodedURIComponent(ABCtoEncode);

    var url = "https://michaeleskin.com/abctools/abctools.html?lzw=" + abcInLZW + "&format=noten&ssp=10&play=1";

    // If just encoding some ABC, return it now
    return url;

}

// Used to hold cached split tunes
var gGetTuneByIndexCache = null;

function clearGetTuneByIndexCache() {

    //console.log("clearGetTuneByIndexCache")

    gGetTuneByIndexCache = null;

}

function getTuneByIndex(theNotes, tuneNumber) {

    if (gGetTuneByIndexCache == null) {

        //console.log("Regerating split tunes cache")

        // Now find all the X: items
        gGetTuneByIndexCache = theNotes.split(/^X:/gm);

    }

    //console.log("getTuneByIndex "+tuneNumber);

    var theTune = "X:" + gGetTuneByIndexCache[tuneNumber + 1];

    const lines = theTune.split('\n');
    let result = [];

    for (let line of lines) {
        if (line.trim() === "") {
            break; // Stop at the first blank line
        }
        result.push(line);
    }

    return result.join('\n');

}


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

function escapeForCSV(str) {

    if (typeof str !== 'string') {
        return str;
    }

    // Escape double quotes by doubling them
    let escapedStr = str.replace(/"/g, '""');

    // If the string contains commas, double quotes, or newlines, wrap it in double quotes
    if (/[",]/.test(escapedStr)) {
        escapedStr = `"${escapedStr}"`;
    }

    return escapedStr;
}


function getMatchingTags(text, tag) {

    const lines = text.split(/\r?\n/); // Split text into lines
    const result = [];

    const regex = new RegExp(`^\\s*${tag}:\\s*(.*)\\s*$`); // Regex to match lines starting with "letter:" and capture the rest

    for (let line of lines) {

        const match = line.match(regex);

        if (match) {
            
            var res = match[1].trim();

            result.push(res); // Add the captured content without leading/trailing whitespace
        }

    }

    return result;

}

//
// Tag extractor
//
function extractTag(theTune, theTag) {

    var result = getMatchingTags(theTune, theTag);

    if (result.length == 0){
        return "";
    }
    else
    if (result.length == 1){

        var res = result[0];

        res = escapeForCSV(res);

        return res;
    }
    else
    if (result.length > 1) {
        
        var resultJoined = result.join(" / ");

        resultJoined = escapeForCSV(resultJoined);

        return resultJoined;
    }
}

//
// Special case for T Tag extractor
//
function extractTTag(theTune) {

    var result = getMatchingTags(theTune, "T");

    if (result.length == 0){
        return "";
    }
    else
    if (result.length == 1){

        var res = result[0];

        res = escapeForCSV(res);

        return res;
    }
    else
    if (result.length > 1) {

        var res = result[0];

        res = escapeForCSV(res);

        return res;
    }
}

//
// Tag extractor
//
function extractTagSpaceDelimiter(theTune, theTag) {

    var result = getMatchingTags(theTune, theTag);

    if (result.length == 0){
        return "";
    }
    else
    if (result.length == 1){

        var res = result[0];

        res = escapeForCSV(res);

        return res;
    }
    else
    if (result.length > 1) {
        
        var resultJoined = result.join(" ");

        resultJoined = escapeForCSV(resultJoined);

        return resultJoined;
    }
}

//
// Special case for T Tag subtitle extractor
//
function extractSubtitlesTags(theTune) {

    var result = getMatchingTags(theTune, "T");

    if (result.length == 0){
        return "";
    }
    else
    if (result.length > 1) {

        result.shift();
        
        var resultJoined = result.join(" / ");

        resultJoined = escapeForCSV(resultJoined);

        return resultJoined;
    }
    else{
        return "";
    }

}

//
// Batch tag extractor
//
function extractTags(theTune,fileName) {

    var XTag = "";
    var TTag = "";
    var SubtitlesTag = "";
    var CTag = "";
    var OTag = "";
    var ATag = "";
    var RTag = "";
    var LTag = "";
    var MTag = "";
    var QTag = "";
    var KTag = "";
    var DTag = "";
    var STag = "";
    var ZTag = "";
    var NTag = "";
    var HTag = "";
    var rTag = "";
    var FTag = "";
    var shareURL = "";

    XTag = extractTag(theTune, "X");
    TTag = extractTTag(theTune);
    SubtitlesTag = extractSubtitlesTags(theTune);
    CTag = extractTag(theTune, "C");
    OTag = extractTagSpaceDelimiter(theTune, "O");
    ATag = extractTagSpaceDelimiter(theTune, "A");
    RTag = extractTag(theTune, "R");
    LTag = extractTag(theTune, "L");
    MTag = extractTag(theTune, "M");
    QTag = extractTag(theTune, "Q");
    KTag = extractTag(theTune, "K");
    DTag = extractTagSpaceDelimiter(theTune, "D");
    STag = extractTagSpaceDelimiter(theTune, "S");
    ZTag = extractTagSpaceDelimiter(theTune, "Z");
    NTag = extractTagSpaceDelimiter(theTune, "N");
    HTag = extractTagSpaceDelimiter(theTune, "H");
    rTag = extractTagSpaceDelimiter(theTune, "r");
    FTag = extractTagSpaceDelimiter(theTune, "F");

    var theResult = "";

    if (gIncludeFilenames){

        theResult = fileName + ",";

    }

    theResult = theResult + XTag + "," + TTag + "," + SubtitlesTag + "," + CTag + "," + OTag + "," + ATag + "," + RTag + "," + LTag + "," + MTag + "," + QTag + "," + KTag + "," + DTag + "," + STag + "," + ZTag + "," + NTag + "," + HTag + ","+ rTag + "," + FTag;

    if (gIncludeShareURLs){

        shareURL = getAbcInLZW(theTune);

        theResult += "," + shareURL;
    }

    theResult += "\n";

    return theResult;

}

//
// Main processor
//
function extractCSV(theABC,fileName) {

    result = "";

    gGetTuneByIndexCache = null;

    var nTunes = countTunes(theABC);

    if (nTunes == 0) {

        DayPilot.Modal.alert("No tunes to process in file:"+fileName+"!", {
            theme: "modal_flat",
            top: 50
        });

        return "";

    }

    fileName = fileName.replaceAll(",","");

    for (var i = 0; i < nTunes; ++i) {

        var thisTune = getTuneByIndex(theABC, i);

        var extractedTags = extractTags(thisTune,fileName);

        result += extractedTags;
    }

    return result;

}

//
// Save the Output to a .csv file
//
function saveCSVOutput(theData) {

    if (theData.length == 0) {

        DayPilot.Modal.alert("Nothing to save!", {
            theme: "modal_flat",
            top: 50
        });

        return;
    }

    if (gSaveFilename == "") {
        gSaveFilename = "abc_to_csv_output.csv";
    }

    var thePlaceholder = gSaveFilename;

    var thePrompt = "Please enter a filename for your output CSV file:";

    DayPilot.Modal.prompt(thePrompt, thePlaceholder, {
        theme: "modal_flat",
        top: 194,
        autoFocus: false,
        okText: "Save"
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
        if ((!fname.endsWith(".csv")) && (!fname.endsWith(".CSV"))) {

            // Give it a good extension
            fname = fname.replace(/\..+$/, '');
            fname = fname + ".csv";

        }

        var a = document.createElement("a");

        document.body.appendChild(a);

        a.style = "display: none";

        var blob = new Blob([theData], {
                type: "text/csv"
            });

        var url = window.URL.createObjectURL(blob);
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

    document.getElementById("selectabcfile").onchange = () => {

        if (fileElement.files.length === 0) {

            DayPilot.Modal.alert("No ABC files selected!", {
                theme: "modal_flat",
                top: 50
            });

            return;
        }

        if (fileElement.files.length == 1){

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

            gSaveFilename += ".csv";

        }
        else{

            gSaveFilename = "multiple_abc_files.csv";

        }

        gIncludeFilenames = document.getElementById("includeFilenames").checked;
        gIncludeShareURLs = document.getElementById("includeShareURLs").checked;

        function readFiles() {

            const input = document.getElementById('selectabcfile');
            const files = input.files;
            const fileContentsArray = [];

            // A function to read each file and process when all are done
            const readFile = (file) => {

                return new Promise((resolve, reject) => {
                
                    const reader = new FileReader();
                
                    reader.onload = () => resolve({
                        filename: file.name,
                        content: reader.result
                    });
                
                    reader.onerror = () => reject(`Error reading ${file.name}`);
                
                    reader.readAsText(file);
                
                });
            };

            // Use Promise.all to wait for all files to be read
            const readAllFiles = async () => {

                try {

                    //debugger;

                    const promises = Array.from(files).map(file => readFile(file));

                    const results = await Promise.all(promises);
    
                    // Reset file selectors
                    let fileElement = document.getElementById('selectabcfile');

                    fileElement.value = "";

                    var csv_result = "";

                    if (gIncludeFilenames){

                        csv_result = "Filename,";

                    }
                    
                    csv_result = csv_result + "X:,T:,Subtitles,C:,O:,A:,R:,L:,M:,Q:,K:,D:,S:,Z:,N:,H:,r:,F:";

                    if (gIncludeShareURLs){

                        csv_result += ",ShareURL";

                    }

                    csv_result += "\n";

                    // Process the ABC
                    var nFiles = results.length;

                    for (var i=0;i<nFiles;++i){

                        csv_result += extractCSV(results[i].content,results[i].filename);

                    }

                    saveCSVOutput(csv_result);


                } catch (error) {

                    DayPilot.Modal.alert("An error occurred during ABC tag extraction!", {
                        theme: "modal_flat",
                        top: 50
                    });

                    return;
                }
            };

            readAllFiles();
        }

        gGetTuneByIndexCache = null;

        readFiles();

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