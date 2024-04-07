//
// IndexedDB related features
//
var gImpulseDB = null;

function initImpulseDB(callback) {

	// Open a database
	let request = indexedDB.open('reverb_impulses', 1);

	request.onerror = function(event) {
		console.log("initImpulseDB IndexedDB database creation error: " + event.target.errorCode);
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
		callback(null);
		return;
	}

	let transaction = gImpulseDB.transaction(["data"]);
	let objectStore = transaction.objectStore("data");
	let request = objectStore.getAll();

	request.onerror = function(event) {
		console.log("Error retrieving impulse: " + event.target.errorCode);
		callback(null);
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

//
// Init the tune search database
//

var gTuneDB = null;

function initTuneDB(callback) {

	// Open a database
	let request = indexedDB.open('tune_search_database', 1);

	request.onerror = function(event) {
		console.log("initTuneDB IndexedDB database creation error: " + event.target.errorCode);
		if (callback){
			callback(false);
		}
	};

	request.onsuccess = function(event) {
		
		//console.log("initTuneDB - onsuccess");

		gTuneDB = event.target.result;

		if (callback){
			callback(true);
		}

	};

	request.onupgradeneeded = function(event) {

		//console.log("initTuneDB - onupgradeneeded");

		let db = event.target.result;

		gTuneDB = db;

		// Create an object store to hold the tunedatabase1
		let objectStore1 = db.createObjectStore("tunedb1", {
			keyPath: "id",
			autoIncrement: true
		});

		// Define the structure of the data
		objectStore1.createIndex("tunes", "tunes", {
			unique: false
		});

		// Create an object store to hold the tunedatabase2
		let objectStore2 = db.createObjectStore("tunedb2", {
			keyPath: "id",
			autoIncrement: true
		});

		// Define the structure of the data
		objectStore2.createIndex("tunes", "tunes", {
			unique: false
		});


		if (callback){
			callback(true);
		}
	};

}
// Function to save an impulse response
function saveTuneDatabase_DB(tunes,isFolkFriend) {

	if (!gTuneDB){
		console.log("No tune database available");
		return;
	}

	if (isFolkFriend){

		let transaction = gTuneDB.transaction(["tunedb2"],"readwrite");
		let objectStore = transaction.objectStore("tunedb2");

		// Make a request to clear all the data out of the object store
		const objectStoreRequest = objectStore.clear();

		// Create an object to hold the impulse
		let newItem = {
			tunes: tunes
		};

		// Add the object to the object store
		let request = objectStore.add(newItem);

		request.onerror = function(event) {
			console.log("Error saving FolkFriend database: " + event.target.errorCode);
		};

		request.onsuccess = function(event) {
			//console.log("FolkFriend database saved successfully");
		};
	}
	else{

		let transaction = gTuneDB.transaction(["tunedb1"],"readwrite");
		let objectStore = transaction.objectStore("tunedb1");

		// Make a request to clear all the data out of the object store
		const objectStoreRequest = objectStore.clear();

		// Create an object to hold the impulse
		let newItem = {
			tunes: tunes
		};

		// Add the object to the object store
		let request = objectStore.add(newItem);

		request.onerror = function(event) {
			console.log("Error saving Heneghan database: " + event.target.errorCode);
		};

		request.onsuccess = function(event) {
			//console.log("Heneghan database saved successfully");
		};


	}
}

// Function to retrieve a tune database response 
function getTuneDatabase_DB(isFolkFriend,callback) {

	if (!gTuneDB){
		console.log("No IndexedDB tune database available");
		callback(null);
		return;
	}

	if (isFolkFriend){
		
		let transaction = gTuneDB.transaction(["tunedb2"]);
		let objectStore = transaction.objectStore("tunedb2");
		let request = objectStore.getAll();

		request.onerror = function(event) {
			console.log("Error retrieving FolkFriend database: " + event.target.errorCode);
			callback(null);
		};

		request.onsuccess = function(event) {
			//console.log("FolkFriend database read success");			
			let theTunes = event.target.result.map(item => item.tunes);
			callback(theTunes);
		};
	}
	else{

		let transaction = gTuneDB.transaction(["tunedb1"]);
		let objectStore = transaction.objectStore("tunedb1");
		let request = objectStore.getAll();

		request.onerror = function(event) {
			console.log("Error retrieving Heneghan database: " + event.target.errorCode);
			callback(null);
		};

		request.onsuccess = function(event) {
			//console.log("Heneghan database read success");			
			let theTunes = event.target.result.map(item => item.tunes);
			callback(theTunes);
		};

	}
}

