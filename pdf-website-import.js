//
// PDF and Website Tune Importers
//

function extractLZWParameter(url) {
   // Use a regular expression to find the part starting with &lzw= followed by any characters until the next &
    const match = url.match(/lzw=([^&]*)/);

    // If a match is found, return the part after &lzw=
    return match ? match[0] : null;
}


//
// Extract tunes from an previously exported PDF
// 
function extractPDFTunes(file){

    sendGoogleAnalytics("dialog","extractPDFTunes");

    // Read the file as an ArrayBuffer
    const reader = new FileReader();

    reader.readAsArrayBuffer(file);

    reader.onload = async function() {

        const {
            PDFDocument,
            PDFName,
            PDFDict
        } = PDFLib;

        const pdfBytes = reader.result;

        // Load the PDF with pdf-lib
        const pdfDoc = await PDFDocument.load(pdfBytes);

        const links = [];

        // Loop through all pages in the PDF
        const totalPages = pdfDoc.getPageCount();

        for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {

            const page = pdfDoc.getPage(pageIndex);
            
            const annotations = page.node.Annots();

            if (annotations) {

                annotations.array.forEach((annot) => {

                    if (annot.dict){

                        const annotationDict = annot.dict.get(PDFName.of('A'));

                        if (annotationDict) {

                            const uri = annotationDict.lookup(PDFName.of('URI'));

                            if (uri) {

                                var theLink = uri.toString();
                                
                                // Some PDF files have odd delimiters and splits in the links

                                theLink = theLink.replaceAll("\\","");
                                theLink = theLink.replaceAll("\r","");
                                theLink = theLink.replaceAll("\r","");

                                // Remove the wrapping parenthesis
                                theLink = theLink.slice(1, -1);

                                links.push(theLink);
                            }
                        }
                    }

                });
            }
        }

        var nFound = 0;

        var outVal = "";

        if (links.length > 0) {

            links.forEach(link => {

                // Look for lzw params but exclude any with dx=1
                if ((link.indexOf("lzw=") != -1) && (link.indexOf("dx=1") == -1)){

                    var originalAbcInLZW = extractLZWParameter(link);

                    originalAbcInLZW = originalAbcInLZW.replace("lzw=","");
                
                    var abcInLZW = LZString.decompressFromEncodedURIComponent(originalAbcInLZW);

                    // Sometimes the LZW decompress fails if the link is too long for the PDF or some other issue
                    if (abcInLZW){

                        nFound++;

                        outVal += `${abcInLZW}\n\n`;

                    }

                }

            });
        }

        if (nFound == 0){

            outVal = '%\n% No tunes found in the PDF.\n%\n';

        }
        else{

            if (nFound == 1){
                outVal = "%\n% "+nFound+" tune found in "+file.name+"\n%\n\n"+outVal;
            }
            else{
                outVal = "%\n% "+nFound+" tunes found in "+file.name+"\n%\n\n"+outVal; 
            }

        }

        // Strip extra linefeeds
        outVal = outVal.replaceAll("\n\n\n","\n\n");

        // Clear the work area and reset to defaults
        ClearNoRender();

        // Add them to the work area
        gTheABC.value = outVal;

        setTimeout(function(){

            // And render 
            RenderAsync(true,null);

            // Mark work area dirty
            gIsDirty = true;

            // Reset file selectors
            let fileElement = document.getElementById('import_pdf_fs');

            fileElement.value = "";
            
        },gSpinnerDelay)

    };

    reader.onerror = function() {

		var thePrompt = "Problem reading PDF file";

		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);

		DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

        hideTheSpinner();

    };
}

//
// Extract tunes from an previously exported website
// 
function extractWebsiteTunes(file){

    sendGoogleAnalytics("dialog","extractWebsiteTunes");

    // Read the file as text
    const reader = new FileReader();

    reader.readAsText(file);

    reader.onload = async function() {

        const rawText = reader.result;

        var lines = rawText.split("\n");

        var nLines = lines.length;

        var tunesLine;
        var bFoundTunes = false;
        var tunes = [];

        for (var i=0;i<nLines;++i){
            tunesLine = lines[i].trim();
            if (tunesLine.indexOf("const tunes=")!=-1){
                bFoundTunes = true;
                break;
            }
        }

        var links = [];

        if (bFoundTunes){

            // Isolate the JSON string
            tunesLine = tunesLine.replace("const tunes=","");

            tunesLine = tunesLine.replace("];","]");

            try {
                tunes = JSON.parse(tunesLine);
            }
            catch(error){
                DayPilot.Modal.alert("Unable to extract website tunes!", {
                    theme: "modal_flat",
                    top: 150
                });

                hideTheSpinner();
            }

        }

        // Display the extracted links
        const output = document.getElementById('output');

        var nFound = 0;

        var outVal = "";

        if (tunes.length > 0) {

            tunes.forEach(tune => {

                var link = tune.URL;

                // Look for lzw params but exclude any with dx=1
                if ((link.indexOf("lzw=") != -1) && (link.indexOf("dx=1") == -1)){

                    var originalAbcInLZW = extractLZWParameter(link);

                    originalAbcInLZW = originalAbcInLZW.replace("lzw=","");
                
                    var abcInLZW = LZString.decompressFromEncodedURIComponent(originalAbcInLZW);

                    // Sometimes the LZW decompress fails if the link is too long for the PDF or some other issue
                    if (abcInLZW){

                        nFound++;

                        outVal += `${abcInLZW}\n\n`;

                    }

                }

            });
        }

        if (nFound == 0){

            outVal = '%\n% No tunes found in the website.\n%\n';

        }
        else{

            if (nFound == 1){
                outVal = "%\n% "+nFound+" tune found in "+file.name+"\n%\n\n"+outVal;
            }
            else{
                outVal = "%\n% "+nFound+" tunes found in "+file.name+"\n%\n\n"+outVal; 
            }

        }

        // Strip extra linefeeds
        outVal = outVal.replaceAll("\n\n\n","\n\n");

        // Clear the work area and reset to defaults
        ClearNoRender();

        // Add them to the work area
        gTheABC.value = outVal;

        setTimeout(function(){

            // And render 
            RenderAsync(true,null);

            // Mark work area dirty
            gIsDirty = true;

            // Reset file selectors
            let fileElement = document.getElementById('import_website_fs');

            fileElement.value = "";

        },gSpinnerDelay)

    };

    reader.onerror = function() {

		var thePrompt = "Problem reading website .html file";

		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);

		DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 150, scrollWithPage: (AllowDialogsToScroll()) });

        hideTheSpinner();

    };
}

// Helper function to correctly parse a CSV row, handling quoted fields with commas
function parseCSVShareURLRow(row) {

    const result = [];
    let inQuotes = false;
    let value = '';

    for (let i = 0; i < row.length; i++) {
        const char = row[i];

        if (char === '"') {
            // Toggle the inQuotes flag if we encounter a double quote
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            // If we encounter a comma outside of quotes, finalize the current value
            result.push(value.trim());
            value = '';
        } else {
            // Otherwise, add the character to the current value
            value += char;
        }
    }

    // Add the last value to the result
    result.push(value.trim());

    // Ensure all columns are returned, including empty ones
    return result;
}


function parseCSVShareURLs(csvText) {

    // Split the input text into rows
    const rows = csvText.trim().split('\n');
    
    // Extract the header row and split it into column names (handle commas inside quotes)
    var headers = parseCSVShareURLRow(rows[0]);

    // Find the index of the 'ShareURL' column
    var shareURLIndex = headers.indexOf('ShareURL');

    var sliceIndex = 1;

    // If 'ShareURL' column doesn't exist in the first row, try the second row
    if (shareURLIndex === -1) {

        if (rows.length > 1){
            headers = parseCSVShareURLRow(rows[1])
            shareURLIndex = headers.indexOf('ShareURL');
        }
        else{
            return [];
        }

        // If the ShareURL column still not found, return empty
        if (shareURLIndex === -1){
            return [];
        }

        sliceIndex = 2;
    }

    // Iterate through each row (skipping the header) and collect the 'ShareURL' values
    const shareURLs = rows.slice(sliceIndex).map(row => {

        const columns = parseCSVShareURLRow(row);
        
        return columns[shareURLIndex];

    });

    return shareURLs;
}

//
// Extract tunes from an previously exported CSV file
// 
function extractCSVTunes(file){

    //console.log("extractCSVTunes");
    sendGoogleAnalytics("dialog","extractCSVTunes");

    // Read the file as text
    const reader = new FileReader();

    reader.readAsText(file);

    reader.onload = async function() {

        var bFoundTunes = false;

        const rawText = reader.result;

        var links = parseCSVShareURLs(rawText);

        if (links && (links.length > 0)){
            bFoundTunes = true;
        }

        var nFound = 0;

        var outVal = "";

        if (links.length > 0) {

            links.forEach(link => {

                // Look for lzw params but exclude any with dx=1
                if ((link.indexOf("lzw=") != -1) && (link.indexOf("dx=1") == -1)){

                    var originalAbcInLZW = extractLZWParameter(link);

                    originalAbcInLZW = originalAbcInLZW.replace("lzw=","");
                
                    var abcInLZW = LZString.decompressFromEncodedURIComponent(originalAbcInLZW);

                    // Sometimes the LZW decompress fails if the link is too long for the PDF or some other issue
                    if (abcInLZW){

                        nFound++;

                        outVal += `${abcInLZW}\n\n`;

                    }

                }

            });
        }

        if (nFound == 0){

            outVal = '%\n% No tunes found in the CSV.\n%\n';

        }
        else{

            if (nFound == 1){
                outVal = "%\n% "+nFound+" tune found in "+file.name+"\n%\n\n"+outVal;
            }
            else{
                outVal = "%\n% "+nFound+" tunes found in "+file.name+"\n%\n\n"+outVal; 
            }

        }

        // Strip extra linefeeds
        outVal = outVal.replaceAll("\n\n\n","\n\n");

        // Clear the work area and reset to defaults
        ClearNoRender();

        // Add them to the work area
        gTheABC.value = outVal;

        setTimeout(function(){

            // And render 
            RenderAsync(true,null);

            // Mark work area dirty
            gIsDirty = true;

            // Reset file selectors
            let fileElement = document.getElementById('import_csv_fs');

            fileElement.value = "";
            
        },gSpinnerDelay)
    };

    reader.onerror = function() {

        var thePrompt = "Problem reading CSV file";

        // Center the string in the prompt
        thePrompt = makeCenteredPromptString(thePrompt);

        DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 150, scrollWithPage: (AllowDialogsToScroll()) });

        hideTheSpinner();

    };

}

//
// Handlers for the import PDF or website file controls
//
function idleImportPDFOrWebsite(){

	//
	// Setup the PDF import control
	//
	document.getElementById("import_pdf_fs").onchange = () => {

		let fileElement = document.getElementById("import_pdf_fs");

		// check if user had selected a file
		if (fileElement.files.length === 0) {

			var thePrompt = "Please select a previously exported PDF file";

			// Center the string in the prompt
			thePrompt = makeCenteredPromptString(thePrompt);

			DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 150, scrollWithPage: (AllowDialogsToScroll()) });

			return;

		}

		let file = fileElement.files[0];

		if (file){

            showTheSpinner();

            setTimeout(function(){
    			// Extract the tunes from the PDF file
			    extractPDFTunes(file);
            },100);
		}

		// Reset file selectors
		fileElement.value = "";

	}

	//
	// Setup the website import control
	//
	document.getElementById("import_website_fs").onchange = () => {

		let fileElement = document.getElementById("import_website_fs");

		// check if user had selected a file
		if (fileElement.files.length === 0) {

			var thePrompt = "Please select a previously exported website";

			// Center the string in the prompt
			thePrompt = makeCenteredPromptString(thePrompt);

			DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 150, scrollWithPage: (AllowDialogsToScroll()) });

			return;

		}

		let file = fileElement.files[0];

		if (file){

            showTheSpinner();

            setTimeout(function(){
                // Extract the tunes from the website
                extractWebsiteTunes(file);
            },100);
		}

		// Reset file selectors
		fileElement.value = "";

	}


    //
    // Setup the CSV import control
    //
    document.getElementById("import_csv_fs").onchange = () => {

        let fileElement = document.getElementById("import_csv_fs");

        // check if user had selected a file
        if (fileElement.files.length === 0) {

            var thePrompt = "Please select a previously exported CSV file";

            // Center the string in the prompt
            thePrompt = makeCenteredPromptString(thePrompt);

            DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 150, scrollWithPage: (AllowDialogsToScroll()) });

            return;

        }

        let file = fileElement.files[0];

        if (file){
            
            showTheSpinner();

            setTimeout(function(){
                // Extract the tunes from the CSV file
                extractCSVTunes(file);
            },100);
        }

        // Reset file selectors
        fileElement.value = "";

    }
}

//
// Import tunes from a PDF file
//
function importPDFClickHandler(){

	var elem = document.getElementById("import_pdf_fs");

	if (gIsDirty){

		var thePrompt = '<p style="font-size:18pt;line-height:20pt;text-align:center;">You Have Unsaved Changes</p><p style="font-size:13pt;line-height:16pt;text-align:center;margin-top:30px;">Click "OK" to abandon your work and open a new file.<br/><br/>Click "Cancel" to go back.</p>';

		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);

		DayPilot.Modal.confirm(thePrompt,{ top:150, theme: "modal_flat", scrollWithPage: (AllowDialogsToScroll()) }).then(function(args){

			if (!args.canceled){

				// Click the file open input element
				setTimeout(function(){

					elem.click();

				},100);

			}
		});
	}
	else{

		elem.click();

	}

}

//
// Import tunes from a website
//
function importWebsiteClickHandler(){

	var elem = document.getElementById("import_website_fs");

	if (gIsDirty){

		var thePrompt = '<p style="font-size:18pt;line-height:20pt;text-align:center;">You Have Unsaved Changes</p><p style="font-size:13pt;line-height:16pt;text-align:center;margin-top:30px;">Click "OK" to abandon your work and open a new file.<br/><br/>Click "Cancel" to go back.</p>';

		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);

		DayPilot.Modal.confirm(thePrompt,{ top:150, theme: "modal_flat", scrollWithPage: (AllowDialogsToScroll()) }).then(function(args){

			if (!args.canceled){

				// Click the file open input element
				setTimeout(function(){

					elem.click();

				},100);

			}
		});
	}
	else{

		elem.click();

	}

}

//
// Import tunes from a CSV
//
function importCSVClickHandler(){

    var elem = document.getElementById("import_csv_fs");

    if (gIsDirty){

        var thePrompt = '<p style="font-size:18pt;line-height:20pt;text-align:center;">You Have Unsaved Changes</p><p style="font-size:13pt;line-height:16pt;text-align:center;margin-top:30px;">Click "OK" to abandon your work and open a new file.<br/><br/>Click "Cancel" to go back.</p>';

        // Center the string in the prompt
        thePrompt = makeCenteredPromptString(thePrompt);

        DayPilot.Modal.confirm(thePrompt,{ top:150, theme: "modal_flat", scrollWithPage: (AllowDialogsToScroll()) }).then(function(args){

            if (!args.canceled){

                // Click the file open input element
                setTimeout(function(){

                    elem.click();

                },100);

            }
        });
    }
    else{

        elem.click();

    }

}

//
// Edit the custom tab settings
//
function ImportPDF_CSV_Website(){

	// Save off the original setting
	var gCustomTabOriginal = JSON.parse(JSON.stringify(gCustomTab));

	var modal_msg  = '<p style="text-align:center;font-size:16pt;font-family:helvetica;margin-left:15px;margin-bottom:32px">Import Tunes from an Exported PDF, Website, or CSV&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#hamburger_extracting_pdf_website" target="_blank" style="text-decoration:none;position:absolute;left:20px;top:20px" class="dialogcornerbutton">?</a></span></p>';

	modal_msg += '<p style="margin-top:36px;margin-bottom:24px;font-size:12pt;line-height:18pt;font-family:helvetica">Click the buttons below to import all the tunes from a tunebook .PDF file with play links, a tunebook .html website, or a CSV file with play links previously exported using this tool or the ABC Tags to CSV Extractor tool.</p>';	
    
    modal_msg += '<p style="margin-top:24px;margin-bottom:24px;font-size:12pt;line-height:18pt;font-family:helvetica">Tunes will not be extracted from PDF tunebooks created with the <strong>%no_edit_allowed</strong> annotation in the PDF features header.</p>';

    modal_msg += '<p style="margin-top:24px;margin-bottom:48px;font-size:12pt;line-height:18pt;font-family:helvetica">Tunes will not be extracted from tunebook websites created with the <strong>Disable access to editor</strong> option selected.</p>';  

	modal_msg += '<p style="text-align:center;margin-top:22px;"><input type="file" id="import_pdf_fs" accept=".pdf,.PDF" hidden/><input type="file" id="import_website_fs" accept=".html,.HTML" hidden/><input id="import_pdf" class="btn btn-subdialog import_pdf" onclick="importPDFClickHandler()" type="button" value="Import Tunes from a PDF File" title="Import tunes from a previously exported ABC Transcription Tools PDF file with Play links"><input id="import_website" class="btn btn-subdialog import_website" onclick="importWebsiteClickHandler()" type="button" value="Import Tunes from a Website" title="Import tunes from a previously exported ABC Transcription Tools website"></p>\n';
    modal_msg += '<p style="text-align:center;margin-top:22px;"><input type="file" id="import_csv_fs" accept=".csv,.CSV" hidden/><input id="import_csv" class="btn btn-subdialog import_csv" onclick="importCSVClickHandler()" type="button" value="Import Tunes from a CSV File" title="Import tunes from a previously exported ABC Transcription Tools CSV file with Play links"></p>\n';

	modal_msg += '<p style="font-size:12pt;line-height:12pt;font-family:helvetica">&nbsp;</p>';	
	
	setTimeout(function(){

		idleImportPDFOrWebsite();

	}, 150);

	const modal = DayPilot.Modal.alert(modal_msg, { theme: "modal_flat", top: 100, width: 600, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } );

}