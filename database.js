//
// IndexedDB related features
//
var gImpulseDB = null;

function initImpulseDB(callback) {

	// Open a database
	let request = indexedDB.open('reverb_impulses_all', 1);

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
		let objectStore = db.createObjectStore("impulses", {
			keyPath: "style",
		});

		if (callback){
			callback(true);
		}
	};

}

// Function to save an impulse response
function saveImpulse_DB(style,impulse) {

	//debugger;
	//console.log("saveImpulse_DB style = "+style+" byteLength = "+impulse.byteLength);

	if (!gImpulseDB){
		console.log("No impulse database available");
		return;
	}

	let transaction = gImpulseDB.transaction(["impulses"],"readwrite");
	let objectStore = transaction.objectStore("impulses");

	// Create an object to hold the impulse
	let newItem = {
		style: style,
		impulse: impulse
	};

	// Add the object to the object store
	let request = objectStore.put(newItem);

	request.onerror = function(event) {
		console.log("Error saving impulse: " + event.target.errorCode);
	};

	request.onsuccess = function(event) {
		//console.log("Impulse saved successfully");
	};
}

// Function to retrieve an impulse response 
function getImpulse_DB(style,callback) {

	//debugger;

	if (!gImpulseDB){
		console.log("No impulse database available");
		callback(null);
		return;
	}

	let transaction = gImpulseDB.transaction(["impulses"]);
	let objectStore = transaction.objectStore("impulses");
	let request = objectStore.get(style);

	request.onerror = function(event) {
		console.log("Error retrieving impulse: " + event.target.errorCode);
		callback(null);
	};

	request.onsuccess = function(event) {
		//debugger;
		let reverb_impulse = event.target.result;
		callback(reverb_impulse);
	};
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

//
// Samples database
//

var gSamplesDB = null;

function initSamplesDB(callback) {

	// Open a database
	let request = indexedDB.open('samples', 1);

	request.onerror = function(event) {
		console.log("initSamplesDB IndexedDB database creation error: " + event.target.errorCode);
		if (callback){
			callback(false);
		}
	};

	request.onsuccess = function(event) {
		
		//console.log("initSamplesDB - onsuccess");

		gSamplesDB = event.target.result;

		if (callback){
			callback(true);
		}

	};

	request.onupgradeneeded = function(event) {

		//console.log("gSamplesDB - onupgradeneeded");

		let db = event.target.result;

		gSamplesDB = db;

		// Create an object store to hold the impulses
		let objectStore = db.createObjectStore("samples", {
			keyPath: "url",
		});

		if (callback){
			callback(true);
		}
	};

}

// Function to save a sample 
function saveSample_DB(url,sample) {

	//debugger;
	//console.log("saveSample_DB url = "+url+" byteLength = "+sample.byteLength);

	if (!gSamplesDB){
		console.log("No sample database available");
		return;
	}

	let transaction = gSamplesDB.transaction(["samples"],"readwrite");
	let objectStore = transaction.objectStore("samples");

	// Create an object to hold the impulse
	let newItem = {
		url: url,
		sample: sample
	};

	// Add the object to the object store
	let request = objectStore.put(newItem);

	request.onerror = function(event) {
		console.log("Error saving sample: " + event.target.errorCode);
	};

	request.onsuccess = function(event) {
		//console.log("Sample saved successfully");
	};
}

// Function to retrieve an impulse response 
function getSample_DB(url,callback) {

	//debugger;

	//console.log("getSample_DB url = "+url);

	if (!gSamplesDB){
		console.log("No sample database available");
		callback(null);
		return;
	}

	let transaction = gSamplesDB.transaction(["samples"]);
	let objectStore = transaction.objectStore("samples");
	let request = objectStore.get(url);

	request.onerror = function(event) {
		console.log("Error retrieving sample: " + event.target.errorCode);
		callback(null);
	};

	request.onsuccess = function(event) {
		//debugger;
		let sample = event.target.result;
		callback(sample);
	};
}

//
// Delete all the databases
//
function delete_all_DB(){

	//debugger;

	// Delete legacy reverb impulses database
	const DBDeleteRequest0 = window.indexedDB.deleteDatabase("reverb_impulses");

	DBDeleteRequest0.onerror = (event) => {
	  console.log("Error deleting reverb_impulses database.");
	};

	DBDeleteRequest0.onsuccess = (event) => {
	  console.log("reverb_impulses database deleted successfully");
	};

	// Close any open databases, then delete them

	if (gImpulseDB){
		
		gImpulseDB.close();

		setTimeout(function(){

			const DBDeleteRequest1 = window.indexedDB.deleteDatabase("reverb_impulses_all");

			DBDeleteRequest1.onerror = (event) => {
			  console.log("Error deleting reverb_impulses_all database.");
			};

			DBDeleteRequest1.onsuccess = (event) => {
			  console.log("reverb_impulses_all database deleted successfully");
			};

		},1000);

	}

	if (gTuneDB){

		gTuneDB.close();

		setTimeout(function(){

			const DBDeleteRequest2 = window.indexedDB.deleteDatabase("tune_search_database");

			DBDeleteRequest2.onerror = (event) => {
			  console.log("Error deleting tune_search_database database.");
			};

			DBDeleteRequest2.onsuccess = (event) => {
			  console.log("tune_search_database database deleted successfully");
			};

		},1000);
	}

	if (gSamplesDB){

		gSamplesDB.close();

		setTimeout(function(){

			const DBDeleteRequest3 = window.indexedDB.deleteDatabase("samples");

			DBDeleteRequest3.onerror = (event) => {
			  console.log("Error deleting samples database.");
			};

			DBDeleteRequest3.onsuccess = (event) => {
			  console.log("samples database deleted successfully");
			};

		},1000);
	}




}

