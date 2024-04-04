//
// IndexedDB related features
//
var gImpulseDB = null;

function initImpulseDB(callback) {

	// Open a database
	let request = indexedDB.open('reverb_impulses', 1);

	request.onerror = function(event) {
		console.log("Reverb impulse database creation error: " + event.target.errorCode);
		if (callback){
			callback(false);
		}
	};

	request.onsuccess = function(event) {
		
		//console.log("initImpulseDB - onsuccess");

		gImpulseDB = event.target.result;

		if (callback){
			callback(true);
		}

	};

	request.onupgradeneeded = function(event) {

		//console.log("initImpulseDB - onupgradeneeded");

		let db = event.target.result;

		gImpulseDB = db;

		// Create an object store to hold the impulses
		let objectStore = db.createObjectStore("data", {
			keyPath: "id",
			autoIncrement: true
		});

		// Define the structure of the data
		objectStore.createIndex("impulse", "impulse", {
			unique: false
		});

		if (callback){
			callback(true);
		}
	};

}

// Function to save an impulse response
function saveImpulse_DB(impulse) {

	if (!gImpulseDB){
		console.log("No impulse database available");
		return;
	}

	let transaction = gImpulseDB.transaction(["data"],"readwrite");
	let objectStore = transaction.objectStore("data");

	// Make a request to clear all the data out of the object store
	const objectStoreRequest = objectStore.clear();

	// Create an object to hold the impulse
	let newItem = {
		impulse: impulse
	};

	// Add the object to the object store
	let request = objectStore.add(newItem);

	request.onerror = function(event) {
		console.log("Error saving impulse: " + event.target.errorCode);
	};

	request.onsuccess = function(event) {
		//console.log("Impulse saved successfully");
	};
}

// Function to retrieve an impulse response 
function getImpulse_DB(callback) {

	if (!gImpulseDB){
		console.log("No impulse database available");
		return;
	}

	let transaction = gImpulseDB.transaction(["data"]);
	let objectStore = transaction.objectStore("data");
	let request = objectStore.getAll();

	request.onerror = function(event) {
		console.log("Error retrieving impulse: " + event.target.errorCode);
	};

	request.onsuccess = function(event) {
		let reverb_impulses = event.target.result.map(item => item.impulse);
		callback(reverb_impulses);
	};
}

// 
// Load the saved custom reverb impulse
//
function restoreSavedImpulse(){

	//console.log("restoreSavedImpulse");
	
	try {

      	var AudioContext = window.AudioContext || window.webkitAudioContext;

      	if (AudioContext){
      		audioContext = new AudioContext();
      	}
      	else{
      		throw("Can't create the audio context to decode the reverb impulse")
      	} 

		// Retrieve Impulse
		getImpulse_DB(async function(impulses) {

			if (impulses && (impulses.length > 0)){

				var theImpulse = impulses[0];

				//console.log("Retrieved impulse:", theImpulse);

				if (theImpulse.byteLength == 0){
				    throw("Stored reverb impulse has zero length");
				}

				var kernelDecoded = function kernelDecoded(audioBuffer) {

				   	// Lets see if the kernel is already in the cache
				   	var newKernels = [];

					var nKernels = gReverbKernels.length;

					var i;

					// Replace any existing custom kernel
					for (i=0;i<nKernels;++i){

						var thisKernel = gReverbKernels[i]

						if (thisKernel.style != "custom"){

						 	newKernels.push(thisKernel);

						}
					}

					gReverbKernels = newKernels;
				      
				    gReverbKernels.push({style:"custom",kernel:audioBuffer});

				    // Force a reload of the reverb convolution kernels
					gSoundsCacheABCJS = {};

					//console.log("Custom reverb impulse restored from database!");
					

			    };

		    	await audioContext.decodeAudioData(theImpulse, kernelDecoded);

		    }
		    //else{
		    	//console.log("No stored impulse found.")
		    //}
		}); 
	}
	catch (error) {

	 	console.log('Error restoring reverb impulse .wav file:', error);

		return;

	}

}

//
// Test the Impulse Database create, store, and retrieve
//
function testImpulseDB(){

	initImpulseDB();

	// Example usage
	let myImpulse = new ArrayBuffer(10); // Example impulse
	var uint8View = new Uint8Array(myImpulse);
	for (var i = 0; i < uint8View.length; i++) {
		uint8View[i] = i + 1; // Fill it with some data
	}

	setTimeout(function() {

		saveImpulse_DB(myImpulse); // Save impulse

		setTimeout(function() {
			// Retrieve Impulse
			getImpulse_DB(function(impulses) {
				console.log("Retrieved impulses:", impulses);
			});

		}, 1000);

	},3000);

}


