//
// manage_database.js
//
// IndexedDB instrument sample database management
//

//
// Clear all the databases
//
function DeleteAllDatabases(callback){

	var thePrompt = "This will clear all the instrument notes, reverb settings, and tune search collections databases.<br/><br/>Are you sure?";

	// Center the string in the prompt
	thePrompt = makeCenteredPromptString(thePrompt);

	DayPilot.Modal.confirm(thePrompt,{ top:262, theme: "modal_flat", scrollWithPage: (AllowDialogsToScroll()) }).then(function(args){
		if (!args.canceled){

			// Wipe all the databases
			delete_all_DB();

			//console.log("Deleting the databases");
			callback(true);

		}
		else{

			//console.log("Cancelled database delete");

			callback(false);

		}
	});
}

//
// Reset all tool settings to the defaults
//
function resetAllSettingsToDefault(callback){

	// No point asking if they don't have localstorage available
	if (!gLocalStorageAvailable){

		callback(false);

		return;
	}

	var thePrompt = "This will reset the tool settings to the original defaults.<br/><br/>Are you sure?";

	// Center the string in the prompt
	thePrompt = makeCenteredPromptString(thePrompt);

	DayPilot.Modal.confirm(thePrompt,{ top:262, theme: "modal_flat", scrollWithPage: (AllowDialogsToScroll()) }).then(function(args){
		if (!args.canceled){

			//console.log("Resetting the settings");

			localStorage.clear();
			
			callback(true);

		}
		else{
			
			//console.log("Cancelled settings reset");

			callback(false);
		}

	});
}

//
// Reset the settings and/or clear the databases
//
function ResetSettingsDialog(){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","ResetSettings");

	// Setup initial values
	const theData = {
	  resetsettings: false,
	  deletedatabases: false
	};

	var form;

	if (navigator.onLine){

		form = [
		  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:15px;">Reset All Tool Settings and Databases&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools_pwa/userguide.html#advanced_resetsettings" target="_blank" style="text-decoration:none;position:absolute;left:20px;top:20px" class="dialogcornerbutton">?</a></span></p>'},
		  {html: '<p style="margin-top:24px;margin-bottom:12px;font-size:12pt;line-height:18pt;font-family:helvetica">Checking <strong>Reset all settings to default</strong> will restore the tool settings to the original first-run state.</p>'},
		  {html: '<p style="margin-top:24px;margin-bottom:12px;font-size:12pt;line-height:18pt;font-family:helvetica">Checking <strong>Clear all databases</strong> will clear and delete the instrument notes, reverb settings, and tune search collections databases. New databases will be created after the tool is restarted.'},
		  {html: '<p style="margin-top:24px;margin-bottom:8px;font-size:12pt;line-height:18pt;font-family:helvetica">If you enable either of these options, the tool will be restarted after the operation is complete.</p>'},
		  {name: "          Reset all tool settings to default", id: "resetsettings", type:"checkbox", cssClass:"configure_resetsettings_text"},
		  {name: "          Clear all databases", id: "deletedatabases", type:"checkbox", cssClass:"configure_resetsettings_text"},
		  {html: '<p style="margin-top:24px;margin-bottom:8px;font-size:12pt;line-height:18pt;font-family:helvetica">&nbsp;</p>'},
		];
	}
	else{

		form = [

		  {html: '<p style="text-align:center;margin-bottom:20px;font-size:16pt;font-family:helvetica;margin-left:15px;">Reset All Tool Settings&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools_pwa/userguide.html#advanced_resetsettings" target="_blank" style="text-decoration:none;position:absolute;left:20px;top:20px" class="dialogcornerbutton">?</a></span></p>'},
		  {html: '<p style="margin-top:24px;margin-bottom:12px;font-size:12pt;line-height:18pt;font-family:helvetica">Checking <strong>Reset all settings to default</strong> will restore the tool settings to the original first-run state.</p>'},
		  {html: '<p style="margin-top:24px;margin-bottom:8px;font-size:12pt;line-height:18pt;font-family:helvetica">If you enable this option, the tool will be restarted after the operatation is complete.</p>'},
		  {html: '<p style="margin-top:24px;margin-bottom:8px;font-size:12pt;line-height:18pt;font-family:helvetica">When online, you also have the option to clear and delete the instrument notes, reverb settings, and tune search collections databases.</p>'},
		  {name: "          Reset all tool settings to default", id: "resetsettings", type:"checkbox", cssClass:"configure_resetsettings_text"},
		  {html: '<p style="margin-top:24px;margin-bottom:8px;font-size:12pt;line-height:18pt;font-family:helvetica">&nbsp;</p>'},
		];

	}

	const modal = DayPilot.Modal.form(form, theData, { theme: "modal_flat", top: 100, width: 600, scrollWithPage: (AllowDialogsToScroll()), autoFocus: false } ).then(function(args){

		// Get the results and store them in the global configuration
		if (!args.canceled){

			var doSettingsRestart = false;
			var doDatabaseClear = false;

			if (args.result.resetsettings){

				// Clear the setttings
				//console.log("reset settings requested");

				resetAllSettingsToDefault(callback);

			}
			else{

				callback(false);

			}

			function callback(restartRequested){

				doSettingsRestart = restartRequested;

				if (args.result.deletedatabases){

					// Clear the setttings
					//console.log("delete databases requested");

					doRestart = true;

					DeleteAllDatabases(callback2);
				}
				else{

					callback2(false);

				}

			}

			function callback2(restartRequested){

				doDatabaseClear = restartRequested;

				if (doSettingsRestart || doDatabaseClear){

					setTimeout(function(){

						var thePrompt = "All changes applied. Click OK to reload the tool.";
						
						// Center the string in the prompt
						thePrompt = makeCenteredPromptString(thePrompt);

						DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 320, scrollWithPage: (AllowDialogsToScroll()) }).then(function(){

							//console.log("reload would happen")

							window.location.reload();

						});

					},1000);
				}
			}
		}
	});
}

//
// Manage databases dialog
//
function ManageDatabasesDialog(){

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","ManageDatabasesDialog");

	var modal_msg  = '<p style="text-align:center;margin-bottom:36px;font-size:16pt;font-family:helvetica;margin-left:15px;">Manage Databases&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools_pwa/userguide.html#manage_databases" target="_blank" style="text-decoration:none;position:absolute;left:20px;top:20px" class="dialogcornerbutton">?</a></span></p>';

	// Only make the database management features available when online
	if (navigator.onLine){

		modal_msg += '<p style="text-align:center;"><input id="managesamples" class="btn btn-managesamples managesamples" onclick="ManageSamplesDialog(true)" type="button" value="Instrument Notes Database" title="Opens a dialog where you can view the instruments and notes in the instrument database and load/delete complete sets of notes for instruments">';
		
		modal_msg += '<input id="managereverb" class="btn btn-managereverb managereverb" onclick="ManageReverbDialog()" type="button" value="Reverb Settings Database" title="Opens a dialog where you can load the reverb settings for offline use">';
		
		modal_msg += '<input id="managesearch" class="btn btn-managesearch managesearch" onclick="ManageSearchCollectionsDialog()" type="button" value="Search Engine Libraries Database" title="Opens a dialog where you can load the search engine libraries for offline use"></p>';
	}
	else{
		modal_msg += '<p style="text-align:center;"><input id="managesamples" style="margin-right:0px" class="btn btn-managesamples managesamples" onclick="ManageSamplesDialog(false)" type="button" value="View Instrument Notes Database" title="Opens a dialog where you can view the instruments and notes in the instrument database while offline">';
	}

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 200, width: 770,  scrollWithPage: (AllowDialogsToScroll()) });

}

//
//
// Manage instrument samples dialog
//
var gInSampleRetrieval = false;
var gInDownloadAll = false;
var gSamplesOKButton = null;

function idleManageSamplesDialog(showActionButtons){

    const storeName = "samples";

	var gLoadAllNotesSet = null;

    // All the notes

	// Get all the items in the database and populate the 
	fetchAndDisplayItems(showActionButtons);

	function downloadAllNotes(){

		// Disallow during other download operations
        if (gInSampleRetrieval){
    		return;
    	}

		var cancelRequested = false;

		function gotCancelRequested(){
			//debugger;
			//console.log("gotCancelRequested");

			cancelRequested = true;

			if (gInDownloadAll){
				document.getElementById("managedownloadall").value = "Cancel requested, waiting for current instrument download to finish...";
			}

		}

		//console.log("downloadAllNotes");

		if (gLoadAllNotesSet && gLoadAllNotesSet.length > 0){

			// Find the OK button

			var theOKButtons = document.getElementsByClassName("modal_flat_buttons");

			// Find the button that says "OK" to use to close the dialog and hide it during the operation	

			gSamplesOKButton = null;

			if (theOKButtons && (theOKButtons.length > 0)){		
				gSamplesOKButton = theOKButtons[theOKButtons.length-1];
			}

			if (gSamplesOKButton){
				gSamplesOKButton.style.display = "none";
			}

			gInDownloadAll = true;

			var nInstruments = gLoadAllNotesSet.length;
			var thisInstrumentIndex = 0;
			var isDone = false;

			// Show the spinner
			document.getElementById("loading-bar-spinner").style.display = "block";

			document.getElementById("noteLoadProgress").style.display = "block";

			var thisName = gLoadAllNotesSet[thisInstrumentIndex];
			thisName = thisName.replace("https://michaeleskin.com/abctools/soundfonts/","");
       		thisName = thisName.replace("https://paulrosen.github.io/midi-js-soundfonts/","");
       		thisName = friendlyInstrumentName(thisName);

			// Get the next one!
			document.getElementById("managedownloadall").value = "Loading All Notes for Instrument "+(thisInstrumentIndex+1)+" of "+nInstruments + ": "+thisName+" - (Click to Cancel)";
			document.getElementById("managedownloadall").onclick = gotCancelRequested;

			function loadCallback(){

				thisInstrumentIndex++;

				//console.log("loadCallback thisInstrumentIndex: "+thisInstrumentIndex);

				if ((thisInstrumentIndex == nInstruments) || cancelRequested){

					//console.log("Done!")

					document.getElementById("loading-bar-spinner").style.display = "none";
					document.getElementById("noteLoadProgress").style.display = "none";

					var thePrompt = "All notes for all instruments successfully saved!";

					// Stopped because of a cancel request?
					if (cancelRequested){
						thePrompt = "Load All Notes Operation Cancelled";
					}
				
					// Center the string in the prompt
					thePrompt = makeCenteredPromptString(thePrompt);
					
					DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 275, scrollWithPage: (AllowDialogsToScroll()) });

					// Refresh the sample list
					fetchAndDisplayItems(showActionButtons);

					document.getElementById("managedownloadall").value = "Load All Notes for All Instruments";

					gInSampleRetrieval = false;

					gInDownloadAll = false;

					if (gSamplesOKButton){
						gSamplesOKButton.style.display = "block";
					}

				}
				else{

					//debugger;

					//console.log("downloadAllNotes getting index "+thisInstrumentIndex);

					var thisName = gLoadAllNotesSet[thisInstrumentIndex];
					thisName = thisName.replace("https://michaeleskin.com/abctools/soundfonts/","");
	           		thisName = thisName.replace("https://paulrosen.github.io/midi-js-soundfonts/","");
	           		thisName = friendlyInstrumentName(thisName);

					// Get the next one!
					document.getElementById("managedownloadall").value = "Loading All Notes for Instrument "+(thisInstrumentIndex+1)+" of "+nInstruments + ": "+thisName+" - (Click to Cancel)";

					loadItem(gLoadAllNotesSet[thisInstrumentIndex],loadCallback);

				}
			}

			// Kick off the cascade
			loadItem(gLoadAllNotesSet[thisInstrumentIndex],loadCallback);
		}

	}

	function stripLastItem(url) {
	  // Create a new URL object
	  let parsedUrl = new URL(url);
	  
	  // Split the pathname into parts
	  let parts = parsedUrl.pathname.split('/');
	  
	  // Remove the last part if it's not empty
	  if (parts.length > 1 && parts[parts.length - 1] !== '') {
	    parts.pop();
	  }
	  
	  // Join the parts back together
	  parsedUrl.pathname = parts.join('/');
	  
	  // Return the modified URL as a string
	  return parsedUrl.toString();
	}

    function removeDuplicates(arr) {
	  return [...new Set(arr)];
	}

	function countDuplicates(arr) {

	  // Create a frequency map
	  let frequencyMap = {};

	  // Count the occurrences of each element
	  arr.forEach(item => {
	    if (frequencyMap[item]) {
	      frequencyMap[item]++;
	    } else {
	      frequencyMap[item] = 1;
	    }
	  });

	  // Extract counts of duplicate elements
	  let duplicatesCount = [];
	  for (let item in frequencyMap) {
	      duplicatesCount.push(frequencyMap[item]);
	  }

	  return duplicatesCount;

	}

	function fetchUrlsSequentially(instrumentName,urls,callback) {

		document.getElementById("loading-bar-spinner").style.display = "block";

		// Initialize index to keep track of current URL being fetched
		let index = 0;

		function fetchNext() {

			var elem = document.getElementById("noteLoadBar")
    		elem.style.width = Math.floor((index/urls.length)*100) + "%";

			if (index < urls.length) {

				let url = urls[index];

				fetch(url)
					.then(response => {
						if (!response.ok) {
							throw new Error(`HTTP error! Status: ${response.status}`);
						}
						return response.arrayBuffer();
					})
					.then(theBuffer => {

						//console.log(`Fetched URL: ${url}`, theBuffer);

		                // Save the sample in the database
		                saveSample_DB(url,theBuffer);

						index++;

						fetchNext(); 	// Call fetchNext recursively to fetch the next URL

					})
					.catch(error => {

						//console.error('Error fetching URL:', url, error);
						index++; 		// Move to the next URL even if there's an error

						fetchNext(); 	// Continue to fetch the next URL

					});
			} else {

				//console.log('All URLs fetched');

				// Using for sequenced loads, call back now
				if (callback){
					gInSampleRetrieval = false;
					callback();
					return;
				}

				// Hide the spinner
				document.getElementById("loading-bar-spinner").style.display = "none";

				// Hide the progress bar
				document.getElementById("noteLoadProgress").style.display = "none";

				// Show the OK button
				if (gSamplesOKButton){
					gSamplesOKButton.style.display = "block";
				}

				var thePrompt = "All notes for "+friendlyInstrumentName(instrumentName)+" successfully saved!";
			
				// Center the string in the prompt
				thePrompt = makeCenteredPromptString(thePrompt);
				
				DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 275, scrollWithPage: (AllowDialogsToScroll()) });

				// Refresh the sample list
				fetchAndDisplayItems(showActionButtons);

				gInSampleRetrieval = false;
			}
		}

		// Kick off the requst cascade
		fetchNext();

	}

	function replaceAndCapitalize(str) {
	    // Replace all underscores with spaces
	    let result = str.replace(/_/g, ' ');

	    // Split the string into words
	    let words = result.split(' ');

	    // Capitalize each word if it is not a number
	    words = words.map(word => {
	        return isNaN(word) ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word;
	    });

	    // Join the words back into a single string
	    return words.join(' ');
	}

	function capitalizeString(str) {
	    if (!str) return str; // Return if the string is empty
	    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	}

	// Get a friendly name from the path based name
	function friendlyInstrumentName(theName){
	
		var theSoundFont = "Custom: ";

		var theNameLC = theName.toLowerCase();

		if (theNameLC.indexOf("fluidhq") != -1){
			theSoundFont = "FluidHQ: ";
		}	
		else
		if (theNameLC.indexOf("fluid") != -1){
			theSoundFont = "Fluid: ";
		}
		else
		if (theNameLC.indexOf("fatboy") != -1){
			theSoundFont = "FatBoy: ";
		}
		else
		if (theNameLC.indexOf("musyng") != -1){
			theSoundFont = "Musyng: ";
		}
		else
		if (theNameLC.indexOf("canvas") != -1){
			theSoundFont = "Canvas: ";
		}
		else
		if (theNameLC.indexOf("mscore") != -1){
			theSoundFont = "MScore: ";
		}
		else
		if (theNameLC.indexOf("arachno") != -1){
			theSoundFont = "Arachno: ";
		}

		const parts = theName.split('/');

		var theName = parts[parts.length - 1];

		// Strip off format suffix
		theName = theName.replace("-mp3","");
		theName = theName.replace("-ogg","");

    	return theSoundFont + replaceAndCapitalize(theName);
	}

    function fetchAndDisplayItems(showActionButtons) {

    	gLoadAllNotesSet = null;

        const transaction = gSamplesDB.transaction([storeName], "readonly");
        const objectStore = transaction.objectStore(storeName);

        let cursorRequest = objectStore.openCursor();

        var items = [];

	    cursorRequest.onsuccess = function(event) {

	    	// Check for dialog closed before update response
	    	const tableBody = document.querySelector("#notes-table tbody");
	    	if (!tableBody){
	    		//console.log("fetchAndDisplayItems: Got early out");
	    		return;
	    	}

			let cursor = event.target.result;
	        
	        if (cursor) {
	            //console.log(cursor.value);
	            items.push(cursor.value)
	            cursor.continue();

	        } else {

	            //console.log('No more entries!');
	            //debugger;
	            const tableBody = document.querySelector("#notes-table tbody");
	            tableBody.innerHTML = ''; // Clear previous content

	            // Sort them
	            items.sort((a, b) => {
				  let domainA = a.url;
				  let domainB = b.url;

				  if (domainA < domainB) return -1;
				  if (domainA > domainB) return 1;
				  return 0;}

				 );

	            var basePathArray = [];

	            items.forEach((item) => {

	            	var thePath = stripLastItem(item.url);

	            	basePathArray.push(thePath);
	            });

	            //debugger;

	            var duplicatesCount = countDuplicates(basePathArray);

	            var basePathSet = removeDuplicates(basePathArray);

	            // Save the complete set of notes for load all
	            gLoadAllNotesSet = basePathSet;

	            // Put the the total in the table header
	            if (basePathSet && basePathSet.length > 0){
	            	document.getElementById("notes_table_name").textContent = "Name ("+basePathSet.length+")";
	            }

	           	basePathSet.forEach((item,index) => {

	           		//console.log("item: "+item+" index: "+index+" duplicates: "+duplicatesCount[index])

	           		// Remove soundfont base path
	           		var originalPath = item;
	           		item = item.replace("https://michaeleskin.com/abctools/soundfonts/","");
	           		item = item.replace("https://paulrosen.github.io/midi-js-soundfonts/","");
	           		item = friendlyInstrumentName(item);

	                const row = document.createElement('tr');
	                const nameCell = document.createElement('td');
	                nameCell.style.padding = "7px";
	                nameCell.style.height = "45px";
	                nameCell.textContent = item;
	                row.appendChild(nameCell);

	                const countCell = document.createElement('td');
	                countCell.style.padding = "7px";
	                countCell.style.textAlign = "center";
	                countCell.textContent = duplicatesCount[index];
	                row.appendChild(countCell);

	                // Only show action buttons if online
	                if (showActionButtons){

		                const actionsCell = document.createElement('td');
		                actionsCell.style.padding = "7px";
		                actionsCell.style.textAlign = "center";

		                // Load button
		                const loadButton = document.createElement('input');
		                loadButton.style.width = "100px";
		                loadButton.style.height = "36px";
		                loadButton.style.marginRight = "24px";
		                loadButton.style.textAlign = "center";
		                loadButton.style.cursor = "pointer";
		                loadButton.classList.add('btn','btn-managesamples','managenotes');
		                loadButton.type = 'button'
		                loadButton.value = 'Load All';
		                loadButton.onclick = (event) => {

		                	// Disable when downloading all notes
		                	if (gInDownloadAll){
		                		return;
		                	}

		                	if (gInSampleRetrieval){
		                		return;
		                	}

		                 	event.target.value = "Loading";
		                	loadItem(originalPath,null);
		                }
		                actionsCell.appendChild(loadButton);

		                // Delete button
		                const deleteButton = document.createElement('input');
		                deleteButton.style.width = "100px";
		                deleteButton.style.height = "36px";
		                deleteButton.style.textAlign = "center";
		                deleteButton.style.cursor = "pointer";
		                deleteButton.classList.add('btn','btn-deletesamples','managenotes');
		                deleteButton.type = 'button'
		                deleteButton.value = 'Delete';
		                deleteButton.onclick = (event) => {

		                	// Disable when downloading all notes
		                	if (gInDownloadAll){
		                		return;
		                	}

		                	if (gInSampleRetrieval){
		                		return;
		                	}

		                	var thisInstrument = originalPath   		
		                	thisInstrument = thisInstrument.replace("https://michaeleskin.com/abctools/soundfonts/","");
		   					thisInstrument = thisInstrument.replace("https://paulrosen.github.io/midi-js-soundfonts/","");

		   					thisInstrument = friendlyInstrumentName(thisInstrument);

		                	var thePrompt = "Are you sure you want to delete "+thisInstrument+"?";

							// Center the string in the prompt
							thePrompt = makeCenteredPromptString(thePrompt);

							DayPilot.Modal.confirm(thePrompt,{ top:275, theme: "modal_flat", scrollWithPage: (AllowDialogsToScroll()) }).then(function(args){

								if (!args.canceled){

		                			event.target.value = "Deleting";
		                			deleteItem(originalPath);

								}

							});

		                }

		                actionsCell.appendChild(deleteButton);

		                row.appendChild(actionsCell);

		                // Add the download all button
		                if (showActionButtons){
							document.getElementById("managedownloadall").onclick = downloadAllNotes;
						}

		            }

	                tableBody.appendChild(row);

	            });

	        };
	    }
  
    }

    function loadItem(item,callback) {

    	// Avoid re-entrancy
    	if (gInSampleRetrieval){
    		//console.log("loadItem got reentered");
    		return;
    	}

    	gInSampleRetrieval = true;

    	var i, j;
    	//console.log("Loading: "+item);

    	var noteNames = [
    	"C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];

    	var noteNamesLen = noteNames.length;

    	// Build list of all note names to attempt to fetch from C0 to C8
    	var allNotes = [];
    	for (i=0;i<8;++i){
    		for (j=0;j<noteNamesLen;++j){
    			allNotes.push(noteNames[j]+i);
    		}
    	}
    	
    	// Add the top C8 note
    	allNotes.push("C8");

    	noteNamesLen = allNotes.length;

    	var isMP3 = (item.indexOf("-mp3") != -1);

    	var theURLs = [];

    	for (i=0;i<noteNamesLen;++i){

    		var thisURL = item+"/"+allNotes[i];
    		
    		if (isMP3){
    			thisURL = thisURL + ".mp3";
    		}
    		else{
    			thisURL = thisURL + ".ogg";
    		}

    		theURLs.push(thisURL);
    		
     	}

     	// Displayed name on status
   		item = item.replace("https://michaeleskin.com/abctools/soundfonts/","");
   		item = item.replace("https://paulrosen.github.io/midi-js-soundfonts/","");

   		if (!callback){

	   		//debugger;
			var theOKButtons = document.getElementsByClassName("modal_flat_buttons");

			// Find the button that says "OK" to use to close the dialog and hide it during the operation	

			gSamplesOKButton = null;

			if (theOKButtons && (theOKButtons.length > 0)){		
				gSamplesOKButton = theOKButtons[theOKButtons.length-1];
			}

			if (gSamplesOKButton){
				gSamplesOKButton.style.display = "none";
			}

			// This is being called from the multi-loader, bump the progress bar
			document.getElementById("noteLoadProgress").style.display = "block";

		}

     	// Get each one and save it to the database
		fetchUrlsSequentially(item,theURLs,callback);

    }

	function deleteItem(item) {

		//console.log("Deleting: " + item);

   		// Avoid re-entrancy
    	if (gInSampleRetrieval){
    		//console.log("deleteItem got reentered");
    		return;
    	}

    	gInSampleRetrieval = true;

		document.getElementById("loading-bar-spinner").style.display = "block";

		// Start a transaction to read/write from the database
		let transaction = gSamplesDB.transaction(["samples"], "readwrite")
		let objectStore = transaction.objectStore("samples");

		// Define the URL value you want to delete
		let urlToDelete = item;

		//console.log("urlToDelete = "+urlToDelete);

		// Create a cursor to iterate through all items in the object store
		let request = objectStore.openCursor();

		request.onsuccess = function(event) {

			let cursor = event.target.result;

			if (cursor) {

				// Check if the current item's 'url' field matches the value to delete
				if (cursor.value.url.indexOf(urlToDelete) != -1) {

					//console.log("deleting " + cursor.value.url);

					// Delete the item from the object store
					objectStore.delete(cursor.primaryKey);

				}

				// Move to the next item in the cursor
				cursor.continue();

			} else {

				document.getElementById("loading-bar-spinner").style.display = "none";

				// Displayed name on status
		   		var instrumentName = item.replace("https://michaeleskin.com/abctools/soundfonts/","");
		   		instrumentName = instrumentName.replace("https://paulrosen.github.io/midi-js-soundfonts/","");

				//console.log('All matching items deleted');

				var thePrompt = "All notes for "+friendlyInstrumentName(instrumentName)+" successfully deleted!";
			
				// Center the string in the prompt
				thePrompt = makeCenteredPromptString(thePrompt);
				
				DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 275, scrollWithPage: (AllowDialogsToScroll()) });

				// Refresh the sample list
				fetchAndDisplayItems(showActionButtons);

				gInSampleRetrieval = false;

				// Clear the abcjs cache to force repopulate on next use
				gSoundsCacheABCJS = {};

			}
		};
	}
}

function ManageSamplesDialog(showActionButtons){

	var modal_msg;

	if (!gSamplesDB){

		var thePrompt = "No instrument notes database available!";
	
		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);
		
		DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 275, scrollWithPage: (AllowDialogsToScroll()) });

		return;
	}

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","ManageSamplesDialog");

	if (showActionButtons){
		modal_msg  = '<p style="text-align:center;margin-bottom:24px;font-size:16pt;font-family:helvetica;margin-left:15px;">Manage Instrument Notes Database&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools_pwa/userguide.html#manage_databases" target="_blank" style="text-decoration:none;position:absolute;left:20px;top:20px" class="dialogcornerbutton">?</a></span></p>';
	}
	else{
		modal_msg  = '<p style="text-align:center;margin-bottom:24px;font-size:16pt;font-family:helvetica;margin-left:15px;">Manage Instrument Notes Database (Offline Mode)&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools_pwa/userguide.html#manage_databases" target="_blank" style="text-decoration:none;position:absolute;left:20px;top:20px" class="dialogcornerbutton">?</a></span></p>';
	}
	
	modal_msg += '<p style="margin-top:18px;margin-bottom:12px;font-size:12pt;line-height:18pt;font-family:helvetica">The table below shows all the instrument notes you have played in the past that are stored in the instrument notes database along with the number of notes saved.</p>';

	var maxHeight = 560;

	if (showActionButtons){

		maxHeight = 430;

		modal_msg += '<p style="margin-top:18px;margin-bottom:12px;font-size:12pt;line-height:18pt;font-family:helvetica">Click "Load All" to load and save the full set of notes for an instrument to the instrument notes database to make all notes for that instrument available offline.</p>';

		modal_msg += '<p style="margin-top:18px;margin-bottom:12px;font-size:12pt;line-height:18pt;font-family:helvetica">Click "Delete" to delete all notes for an instrument from the instrument notes database.</p>';

		modal_msg += '<p style="margin-top:18px;margin-bottom:12px;font-size:12pt;line-height:18pt;font-family:helvetica">Click "Load All Notes for All Instruments" to load and save the full set of notes for all the instruments to the notes database to make all notes for all the instruments available offline.</p>';

		modal_msg += '<div style="margin-top:24px;height:'+maxHeight+'px;overflow:auto">'	

		modal_msg +='<table id="notes-table" border="1" style="width: 100%;"><thead><tr><th id="notes_table_name" style="padding:7px;">Name</th><th style="padding:7px;">Notes</th><th style="padding:7px;">Actions</th></tr></thead><tbody><!-- Items will be inserted here --></tbody></table></div>';
		
		modal_msg +='<p style="margin-top:36px;text-align:center;"><input id="managedownloadall" class="btn btn-managesearch managesearch barber-pole-button" type="button" value="Load All Notes for All Instruments" title="Loads all the notes for all the instruments into the database"></p>';

		// Progress bar
		modal_msg +='<div id="noteLoadProgress"><div id="noteLoadBar"></div></div>';

	}
	else{
		
		modal_msg += '<p style="margin-top:18px;margin-bottom:12px;font-size:12pt;line-height:18pt;font-family:helvetica">When online, you may also load the full set of notes for one or all the instruments or delete an instrument from the database.</p>';

		modal_msg += '<div style="margin-top:24px;height:'+maxHeight+'px;overflow:auto">'	

		modal_msg +='<table id="notes-table" border="1" style="width: 100%;"><thead><tr><th style="padding:7px;">Name</th><th style="padding:7px;">Notes</th></tr></thead><tbody><!-- Items will be inserted here --></tbody></table></div>';

	}

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 10, width: 760,  scrollWithPage: (AllowDialogsToScroll()) });

	setTimeout(function(){
		idleManageSamplesDialog(showActionButtons);
	}, 100);

}

//
//
// Manage reverb dialog
//
//
var gInReverbRetrieval = false;
function SaveReverbSetting(style){

    // Avoid re-entrancy
	if (gInReverbRetrieval){
		//console.log("SaveReverbSetting got reentered");
		return;
	}

	gInReverbRetrieval = true;
	
	document.getElementById("loading-bar-spinner").style.display = "block";

	var theReverbURL = "https://michaeleskin.com/abctools/soundfonts/reverb_kernels/";

	var promptName = "";
	var styleName = ""

	switch (style){
	  case 0:
	    promptName = "Room";
	    styleName = "room3";
	    theReverbURL += "room3.wav";
	    break;
	  case 1:
	    promptName = "Room 1";
	    styleName = "room1";
	    theReverbURL += "room1.wav";
	    break;
	  case 2:
	    promptName = "Room 2";
	    styleName = "room2";
	    theReverbURL += "room2.wav";
	    break;
	  case 3:
	    promptName = "Room 3";
	    styleName = "room3";
	    theReverbURL += "room3.wav";
	    break;
	  case 4:
	    promptName = "Chamber";
	    styleName = "chamber2";
	    theReverbURL += "chamber2.wav";
	    break;
	  case 5:
	    promptName = "Chamber 1";
	    styleName = "chamber1";
	    theReverbURL += "chamber1.wav";
	    break;
	  case 6:
	    promptName = "Chamber 2";
	    styleName = "chamber2";
	    theReverbURL += "chamber2.wav";
	    break;
	  case 7:
	    promptName = "Chamber 3";
	    styleName = "chamber3";
	    theReverbURL += "chamber3.wav";
	    break;
	  case 8:
	    promptName = "Hall";
	    styleName = "hall2";
	    theReverbURL += "hall2.wav";
	    break;
	  case 9:
	    promptName = "Hall 1";
	    styleName = "hall1";
	    theReverbURL += "hall1.wav";
	    break;
	  case 10:
	    promptName = "Hall 2";
	    styleName = "hall2";
	    theReverbURL += "hall2.wav";
	    break;
	  case 11:
	    promptName = "Hall 3";
	    styleName = "hall3";
	    theReverbURL += "hall3.wav";
	    break;
	  case 12:
	    promptName = "Church";
	    styleName = "church1";
	    theReverbURL += "church1.wav";
	    break;
	  case 13:
	    promptName = "Church 1";
	    styleName = "church1";
	    theReverbURL += "church1.wav";
	    break;
	  default:
	    // Default to chamber2
	    promptName = "Chamber 2";
	    styleName = "chamber2";
	    theReverbURL += "chamber2.wav";
	    break;       
	}

	fetch(theReverbURL)
	.then(response => {

	    try{

	      if (!response.ok){

			document.getElementById("loading-bar-spinner").style.display = "none";

			var thePrompt = "Unable to save "+promptName+" reverb setting.";
			
			// Center the string in the prompt
			thePrompt = makeCenteredPromptString(thePrompt);
			
			DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 275, scrollWithPage: (AllowDialogsToScroll()) });

	      	gInReverbRetrieval = false;

			return;
	      }

	      response.arrayBuffer().then(theBuffer => {

	        // Save the impulse in the database
	        //console.log("Saving impulse for "+promptName+" in the database ");

	        saveImpulse_DB(styleName,theBuffer);

			document.getElementById("loading-bar-spinner").style.display = "none";

			var thePrompt = promptName+" reverb setting successfully saved!";
			
			// Center the string in the prompt
			thePrompt = makeCenteredPromptString(thePrompt);
			
			DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 275, scrollWithPage: (AllowDialogsToScroll()) });

			gInReverbRetrieval = false;


	      });

	    }
	    catch(error){

			document.getElementById("loading-bar-spinner").style.display = "none";

			var thePrompt = "Unable to save "+promptName+" reverb setting.";
			
			// Center the string in the prompt
			thePrompt = makeCenteredPromptString(thePrompt);
			
			DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 275, scrollWithPage: (AllowDialogsToScroll()) });

			gInReverbRetrieval = false;

	    }
	    
	})
	.catch(error => {

		document.getElementById("loading-bar-spinner").style.display = "none";

		var thePrompt = "Unable to save "+promptName+" reverb setting.";
		
		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);
		
		DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 275, scrollWithPage: (AllowDialogsToScroll()) });

		gInReverbRetrieval = false;

	});
}


function ManageReverbDialog(){

	if (!gImpulseDB){

		var thePrompt = "No reverb setting database available!";
	
		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);
		
		DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 275, scrollWithPage: (AllowDialogsToScroll()) });

		return;
	}

	// Keep track of dialogs
	sendGoogleAnalytics("dialog","ManageReverbDialog");

	var modal_msg  = '<p style="text-align:center;margin-bottom:36px;font-size:16pt;font-family:helvetica;margin-left:15px;">Manage Reverb Settings Database&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools_pwa/userguide.html#manage_databases" target="_blank" style="text-decoration:none;position:absolute;left:20px;top:20px" class="dialogcornerbutton">?</a></span></p>';

	modal_msg+='<p style="margin-top:24px;margin-bottom:12px;font-size:12pt;line-height:18pt;font-family:helvetica;text-align:center">Save any reverb setting for offline use by clicking the buttons below:</p>',
	modal_msg+='<p style="margin-top:24px;text-align:center">';
	modal_msg+='<input id="managereverb" class="btn btn-managereverb managereverb" onclick="SaveReverbSetting(0)" type="button" value="Room" title="Load and save Room reverb">'
	modal_msg+='<input id="managereverb" class="btn btn-managereverb managereverb" onclick="SaveReverbSetting(1)" type="button" value="Room 1" title="Load and save Room 1 reverb">'
	modal_msg+='<input id="managereverb" class="btn btn-managereverb managereverb" onclick="SaveReverbSetting(2)" type="button" value="Room 2" title="Load and save Room 2 reverb">'
	modal_msg+='<input id="managereverb" style="margin-right:0px" class="btn btn-managereverb managereverb" onclick="SaveReverbSetting(3)" type="button" value="Room 3" title="Load and save Room 3 reverb"></p>'
	modal_msg+='<p style="margin-top:24px;text-align:center">';
	modal_msg+='<input id="managereverb" class="btn btn-managereverb managereverb" onclick="SaveReverbSetting(4)" type="button" value="Chamber" title="Load and save Chamber reverb">'
	modal_msg+='<input id="managereverb" class="btn btn-managereverb managereverb" onclick="SaveReverbSetting(5)" type="button" value="Chamber 1" title="Load and save Chamber 1 reverb">'
	modal_msg+='<input id="managereverb" class="btn btn-managereverb managereverb" onclick="SaveReverbSetting(6)" type="button" value="Chamber 2" title="Load and save Chamber 2 reverb">'
	modal_msg+='<input id="managereverb" style="margin-right:0px" class="btn btn-managereverb managereverb" onclick="SaveReverbSetting(7)" type="button" value="Chamber 3" title="Load and save Chamber 3 reverb">'
	modal_msg+='<p style="margin-top:24px;text-align:center">';
	modal_msg+='<input id="managereverb" class="btn btn-managereverb managereverb" onclick="SaveReverbSetting(8)" type="button" value="Hall" title="Load and save Hall reverb">'
	modal_msg+='<input id="managereverb" class="btn btn-managereverb managereverb" onclick="SaveReverbSetting(9)" type="button" value="Hall 1" title="Load and save Hall 1 reverb">'
	modal_msg+='<input id="managereverb" class="btn btn-managereverb managereverb" onclick="SaveReverbSetting(10)" type="button" value="Hall 2" title="Load and save Hall 2 reverb">'
	modal_msg+='<input id="managereverb" style="margin-right:0px" class="btn btn-managereverb managereverb" onclick="SaveReverbSetting(11)" type="button" value="Hall 3" title="Load and save Hall 3 reverb">'
	modal_msg+='<p style="margin-top:24px;text-align:center">';
	modal_msg+='<input id="managereverb" class="btn btn-managereverb managereverb" onclick="SaveReverbSetting(12)" type="button" value="Church" title="Load and save Church reverb">'
	modal_msg+='<input id="managereverb" style="margin-right:0px" class="btn btn-managereverb managereverb" onclick="SaveReverbSetting(13)" type="button" value="Church 1" title="Load and save Church 1 reverb">'
	modal_msg+='</p>';

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 75, width: 700,  scrollWithPage: (AllowDialogsToScroll()) });

}

//
//
// Manage search dialog
//
var gInSearchEngineRetrieval = false;

function LoadSearchCollection(index){

    // Avoid re-entrancy
	if (gInSearchEngineRetrieval){
		//console.log("LoadSearchCollection got reentered");
		return;
	}

	gInSearchEngineRetrieval = true;
	
	document.getElementById("loading-bar-spinner").style.display = "block";

	var url = "https://michaeleskin.com/abctools_pwa/abctunes_gavin_heneghan_10nov2023.json";

	if (index == 1){
		url = "https://michaeleskin.com/abctools_pwa/folkfriend-non-user-data_22dec2023.json";
	}

    fetchWithRetry(url,gTuneDatabaseRetryTimeMS,gTuneDatabaseRetryCount)
    .then((response) => response.json())
    .then((json) => {

        // Persist the database for later reads
        saveTuneDatabase_DB(json, (index==1));

		document.getElementById("loading-bar-spinner").style.display = "none";

		gInSearchEngineRetrieval = false;

        var thePrompt = "Gavin Heneghan tune search library successfully saved!";

		if (index == 1){
			thePrompt = "FolkFriend tune search library successfully saved!";
		}
		
		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);
		
		DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 275, scrollWithPage: (AllowDialogsToScroll()) });

    })
    .catch(function(error) {

		document.getElementById("loading-bar-spinner").style.display = "none";

		gInSearchEngineRetrieval = false;

		var thePrompt = "Unable to load tune collection.";
		
		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);
		
		DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 275, scrollWithPage: (AllowDialogsToScroll()) });

    }); 

}

function ManageSearchCollectionsDialog(){

	if (!gTuneDB){

		var thePrompt = "No tune search collections database available!";
	
		// Center the string in the prompt
		thePrompt = makeCenteredPromptString(thePrompt);
		
		DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 275, scrollWithPage: (AllowDialogsToScroll()) });

		return;
	}
	
	// Keep track of dialogs
	sendGoogleAnalytics("dialog","ManageSearchCollectionsDialog");

	var modal_msg  = '<p style="text-align:center;margin-bottom:36px;font-size:16pt;font-family:helvetica;margin-left:15px;">Manage Search Engine Libraries&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools_pwa/userguide.html#manage_databases" target="_blank" style="text-decoration:none;position:absolute;left:20px;top:20px" class="dialogcornerbutton">?</a></span></p>';

	modal_msg+='<p style="margin-top:24px;margin-bottom:12px;font-size:12pt;line-height:18pt;font-family:helvetica;text-align:center">Save a tune search library for offline use by clicking the buttons below:</p>',
	modal_msg+='<p style="margin-top:24px;text-align:center">';
	modal_msg+='<input id="managereverb" class="btn btn-managereverb managereverb" onclick="LoadSearchCollection(0)" type="button" value="Gavin Heneghan (20,000+ Tunes)" title="Load and save the Gavin Heneghan tune search collection">'
	modal_msg+='<input id="managereverb" class="btn btn-managereverb managereverb" onclick="LoadSearchCollection(1)" type="button" value="FolkFriend (45,000+ Tunes)" title="Load and save the FolkFriend tune search collection">'

	modal_msg+='</p>';

	DayPilot.Modal.alert(modal_msg,{ theme: "modal_flat", top: 175, width: 700,  scrollWithPage: (AllowDialogsToScroll()) });

}


