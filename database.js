//
// IndexedDB related features
//

/**
 * Persistent storage for custom instrument zips by slot (NO File usage).
 * Each record: { slot, name, zipBytes }  // zipBytes is an ArrayBuffer
 */
const CustomInstrumentsDB = (function () {
  const DB_NAME = "ABCToolsCustomInstruments2";
  const DB_VERSION = 2; // bump since schema changed
  const STORE = "instruments";

  function openDB() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) {
        console.warn("IndexedDB not available; custom instruments won't persist.");
        resolve(null);
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (db.objectStoreNames.contains(STORE)) {
          // existing store ok
        } else {
          db.createObjectStore(STORE, { keyPath: "slot" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function withStore(mode, fn) {
    const db = await openDB();
    if (!db) return null;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      try {
        fn(store);
      } catch (err) {
        reject(err);
        return;
      }
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  }

  async function init() {
    await withStore("readwrite", (store) => {
      const key = -1;
      try { store.put({ slot: key, meta: "init" }); } catch {}
      try { store.delete(key); } catch {}
    }).catch((e) => console.warn("CustomInstrumentsDB.init failed:", e));
  }

  // Save descriptors (Array<ZipDescriptor|null> length 8)
  async function saveSlots(descsBySlot) {
    if (!descsBySlot) return;

    // Build records outside the transaction
    const records = [];
    for (let slot = 0; slot < 8; slot++) {
      const d = descsBySlot[slot];
      if (isZipDescriptor(d)) {
        records.push({
          slot,
          name: d.name,
          zipBytes: d.zipBytes  // ArrayBuffer persisted directly
        });
      }
    }

    await withStore("readwrite", (store) => {
      try {
        store.clear();
        for (const rec of records) {
          store.put(rec);
        }
      } catch (err) {
        console.warn("saveSlots inner error:", err);
        throw err;
      }
    }).catch((e) => {
      console.warn("saveSlots failed:", e);
    });
  }

  // Load mapping -> Array<ZipDescriptor|null> length 8
  async function loadSlots() {
    const out = Array(8).fill(null);
    await withStore("readonly", (store) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const rows = req.result || [];
        for (const r of rows) {
          try {
            if (r.slot >= 0 && r.slot < 8 && r.zipBytes) {
              out[r.slot] = { name: r.name || "instrument.zip", zipBytes: r.zipBytes };
            }
          } catch (err) {
            console.warn("Failed to reconstruct descriptor from DB row:", err);
          }
        }
      };
    }).catch((e) => console.warn("loadSlots failed:", e));
    return out;
  }

  async function clearAll() {
    await withStore("readwrite", (store) => store.clear())
      .catch((e) => console.warn("clearAll failed:", e));
  }

  // --- NEW: expose DB name
  function name() {
    return DB_NAME;
  }

  // --- NEW: delete this DB (robust)
  async function _deleteDatabase(dbName, timeoutMs = 5000) {
    return new Promise((resolve) => {
      let finished = false;

      if (typeof dbName !== "string" || !dbName) {
        return resolve({ ok: false, name: dbName, reason: "invalid_name" });
      }

      const timer = setTimeout(() => {
        if (!finished) {
          finished = true;
          console.warn(`indexedDB.deleteDatabase("${dbName}") timed out after ${timeoutMs}ms`);
          resolve({ ok: false, name: dbName, reason: "timeout" });
        }
      }, timeoutMs);

      let req;
      try {
        req = window.indexedDB.deleteDatabase(dbName);
      } catch (e) {
        clearTimeout(timer);
        return resolve({ ok: false, name: dbName, reason: `exception: ${e && e.message}` });
      }

      req.addEventListener("success", () => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        console.log(`${dbName} database deleted (or did not exist).`);
        resolve({ ok: true, name: dbName });
      });

      req.addEventListener("error", (ev) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        const err = (ev && ev.target && ev.target.error) ? ev.target.error.message : "unknown_error";
        console.error(`Error deleting ${dbName} database:`, err);
        resolve({ ok: false, name: dbName, reason: err });
      });

      req.addEventListener("blocked", () => {
        console.warn(`Delete for "${dbName}" is blocked. Close other tabs or reload.`);
      });
    });
  }

  async function del() {
    // No open handle stored here, so just request deletion
    return _deleteDatabase(DB_NAME);
  }

  return { init, saveSlots, loadSlots, clearAll, name, delete: del };

})();

var gImpulseDB = null;

function initImpulseDB(callback) {

	//console.log("initImpulseDB");

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

// True after initTuneDB() has finished opening IndexedDB and has completed
// its automatic tunedb2 freshness check/update attempt.
var gTuneDBInitComplete = false;

// True while initTuneDB() is actively opening/updating the tune database.
var gTuneDBInitInProgress = false;

//
// Tune search database update markers
//
// Increment TUNE_DB2_DATA_VERSION whenever tunedb2 must be forced refreshed
// for existing users. Users with no tunedb2 record, old records without
// metadata, or mismatched metadata will automatically fetch and replace tunedb2.
//
const TUNE_DB1_URL = "https://michaeleskin.com/abctools/abctunes_gavin_heneghan_10nov2023.json";
const TUNE_DB1_DATA_VERSION = "2023-11-10-gavin-heneghan";

const TUNE_DB2_URL = "https://michaeleskin.com/abctools/abctunes_thesession_28may2026.json";
const TUNE_DB2_DATA_VERSION = "2026-05-28-thesession-flat-json-v1";

function addCacheBusterToURL(url, dataVersion) {

	var separator = (url.indexOf("?") == -1) ? "?" : "&";

	return url + separator + "v=" + encodeURIComponent(dataVersion) + "&t=" + Date.now();
}

function fetchTuneDatabaseJSON(url, dataVersion) {

	var fetchURL = addCacheBusterToURL(url, dataVersion);

	// Use the existing retry helper when available.
	// Fall back to fetch() so this file remains safe if loaded/tested alone.
	if (typeof fetchWithRetry === "function") {
		return fetchWithRetry(fetchURL, gTuneDatabaseRetryTimeMS, gTuneDatabaseRetryCount)
			.then(function(response) {
				if (!response.ok) {
					throw new Error("HTTP error " + response.status);
				}
				return response.json();
			});
	}

	return fetch(fetchURL, { cache: "no-store" })
		.then(function(response) {
			if (!response.ok) {
				throw new Error("HTTP error " + response.status);
			}
			return response.json();
		});
}

function initTuneDB(callback) {

	//console.log("initTuneDB");

	gTuneDBInitInProgress = true;
	gTuneDBInitComplete = false;

	if (!("indexedDB" in window)) {
		console.log("IndexedDB not available");

		gTuneDBInitInProgress = false;
		gTuneDBInitComplete = true;

		if (callback) {
			callback(false);
		}

		return;
	}

	// Open a database
	let request = indexedDB.open('tune_search_database', 1);

	request.onerror = function(event) {

		console.log("initTuneDB IndexedDB database creation error: " + event.target.errorCode);

		gTuneDBInitInProgress = false;
		gTuneDBInitComplete = true;

		if (callback) {
			callback(false);
		}
	};

	request.onsuccess = function(event) {
		
		//console.log("initTuneDB - onsuccess");

		gTuneDB = event.target.result;

		// Automatically refresh tunedb2 when the current saved copy is missing,
		// was saved by the previous schema, or has old metadata.
		ensureTuneDB2IsCurrent(function() {

			gTuneDBInitInProgress = false;
			gTuneDBInitComplete = true;

			if (callback) {
				callback(true);
			}
		});
	};

	request.onupgradeneeded = function(event) {

		//console.log("initTuneDB - onupgradeneeded");

		let db = event.target.result;

		gTuneDB = db;

		// Create an object store to hold tunedatabase1
		if (!db.objectStoreNames.contains("tunedb1")) {

			let objectStore1 = db.createObjectStore("tunedb1", {
				keyPath: "id",
				autoIncrement: true
			});

			// Define the structure of the data
			objectStore1.createIndex("tunes", "tunes", {
				unique: false
			});
		}

		// Create an object store to hold tunedatabase2
		if (!db.objectStoreNames.contains("tunedb2")) {

			let objectStore2 = db.createObjectStore("tunedb2", {
				keyPath: "id",
				autoIncrement: true
			});

			// Define the structure of the data
			objectStore2.createIndex("tunes", "tunes", {
				unique: false
			});
		}

		// Do not call callback here.
		// onsuccess fires after the upgrade transaction completes.
	};
}

//
// Save a tune database
//
function saveTuneDatabase_DB(tunes, isTheSession, metadata, callback) {

	if (!gTuneDB){
		console.log("No tune database available");
		if (callback) {
			callback(false);
		}
		return;
	}

	let storeName = isTheSession ? "tunedb2" : "tunedb1";
	let databaseName = isTheSession ? "TheSession" : "Heneghan";

	let transaction = gTuneDB.transaction([storeName], "readwrite");
	let objectStore = transaction.objectStore(storeName);

	transaction.oncomplete = function() {
		//console.log(databaseName + " database saved successfully");
		if (callback) {
			callback(true);
		}
	};

	transaction.onerror = function(event) {
		console.log("Error saving " + databaseName + " database: " + transaction.error);
		if (callback) {
			callback(false);
		}
	};

	transaction.onabort = function(event) {
		console.log("Save " + databaseName + " database transaction aborted: " + transaction.error);
		if (callback) {
			callback(false);
		}
	};

	// Clear old database contents first.
	objectStore.clear();

	// Store one record containing both the tunes and metadata.
	let newItem = {
		tunes: tunes,
		metadata: metadata || {}
	};

	objectStore.add(newItem);
}

//
// Retrieve a tune database response
//
function getTuneDatabase_DB(isTheSession, callback) {

	if (!gTuneDB){
		console.log("No IndexedDB tune database available");
		callback(null);
		return;
	}

	let storeName = isTheSession ? "tunedb2" : "tunedb1";
	let databaseName = isTheSession ? "thesession" : "Heneghan";

	let transaction = gTuneDB.transaction([storeName], "readonly");
	let objectStore = transaction.objectStore(storeName);
	let request = objectStore.getAll();

	request.onerror = function(event) {
		console.log("Error retrieving " + databaseName + " database: " + event.target.errorCode);
		callback(null);
	};

	request.onsuccess = function(event) {

		// Preserve existing behavior:
		// callback receives an array of stored .tunes payloads.
		// For this one-record store, that is normally [tunes].
		let rows = event.target.result || [];
		let theTunes = rows.map(function(item) {
			return item.tunes;
		});

		callback(theTunes);
	};
}

//
// Retrieve tune database metadata
//
function getTuneDatabaseMetadata_DB(isTheSession, callback) {

	if (!gTuneDB){
		console.log("No IndexedDB tune database available");
		callback(null);
		return;
	}

	let storeName = isTheSession ? "tunedb2" : "tunedb1";

	let transaction = gTuneDB.transaction([storeName], "readonly");
	let objectStore = transaction.objectStore(storeName);
	let request = objectStore.getAll();

	request.onerror = function(event) {
		console.log("Error retrieving tune database metadata: " + event.target.errorCode);
		callback(null);
	};

	request.onsuccess = function(event) {

		let rows = event.target.result || [];

		if (!rows.length) {
			callback(null);
			return;
		}

		// Old saved databases will not have metadata.
		// Returning null intentionally forces a refresh.
		callback(rows[0].metadata || null);
	};
}

//
// Check whether tunedb2 exists and has the current data version
//
function isTuneDB2Current(callback) {

	getTuneDatabaseMetadata_DB(true, function(metadata) {

		if (!metadata) {
			callback(false);
			return;
		}

		if (metadata.dataVersion !== TUNE_DB2_DATA_VERSION) {
			callback(false);
			return;
		}

		callback(true);
	});
}

//
// Ensure tunedb2 contains the current thesession.org tune database
//
function ensureTuneDB2IsCurrent(callback) {

	isTuneDB2Current(function(isCurrent) {

		if (isCurrent) {
			//console.log("tunedb2 is current");
			if (callback) {
				callback(false);
			}
			return;
		}

		// If the user is offline, leave the existing cached database alone.
		// It may be old, but it is still better than deleting it.
		if (!navigator.onLine) {
			console.log("tunedb2 is missing or stale, but browser is offline. Keeping existing cached database.");
			if (callback) {
				callback(false);
			}
			return;
		}

		console.log("tunedb2 is missing or stale. Fetching current database...");

		fetchTuneDatabaseJSON(TUNE_DB2_URL, TUNE_DB2_DATA_VERSION)
			.then(function(json) {

				saveTuneDatabase_DB(json, true, {
					dataVersion: TUNE_DB2_DATA_VERSION,
					url: TUNE_DB2_URL,
					savedAt: new Date().toISOString()
				}, function(savedOK) {

					if (savedOK) {
						console.log("tunedb2 successfully updated to " + TUNE_DB2_DATA_VERSION);
					} else {
						console.log("tunedb2 update fetch succeeded, but IndexedDB save failed.");
					}

					if (callback) {
						callback(savedOK);
					}
				});
			})
			.catch(function(error) {

				console.log("Unable to update tunedb2:", error);

				if (callback) {
					callback(false);
				}
			});
	});
}

//
// Samples database
//

var gSamplesDB = null;

function initSamplesDB(callback) {

	//console.log("initSamplesDB");

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
// Robust IndexedDB deletion (Firefox/Chrome/Safari)
//

/**
 * Safely closes an IDBDatabase handle and nulls your global.
 */
function safeCloseDB(refName) {
  try {
    if (window[refName] && typeof window[refName].close === "function") {
      window[refName].close();
    }
  } catch (e) {
    console.warn(`safeCloseDB(${refName}) close error:`, e);
  } finally {
    // Null the global so no further ops use a stale handle
    try { window[refName] = null; } catch(_) {}
  }
}

/**
 * Small delay helper (avoids Safari/WebKit races after close()).
 */
function wait(ms) {
  return new Promise(res => setTimeout(res, ms));
}

/**
 * Delete an IndexedDB database by name with robust event handling.
 * Resolves to { ok: boolean, name: string, reason?: string }
 */
function deleteDB(name, timeoutMs = 5000) {
  return new Promise((resolve) => {
    let finished = false;

    // Some older Safari versions throw if name is not a string
    if (typeof name !== "string" || !name) {
      return resolve({ ok: false, name, reason: "invalid_name" });
    }

    let timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        console.warn(`deleteDatabase("${name}") timed out after ${timeoutMs}ms`);
        resolve({ ok: false, name, reason: "timeout" });
      }
    }, timeoutMs);

    let req;
    try {
      req = window.indexedDB.deleteDatabase(name);
    } catch (e) {
      clearTimeout(timer);
      return resolve({ ok: false, name, reason: `exception: ${e && e.message}` });
    }

    req.addEventListener("success", () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      // Note: success can fire even if db didn't exist; that's fine.
      console.log(`${name} database deleted (or did not exist).`);
      resolve({ ok: true, name });
    });

    req.addEventListener("error", (ev) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      const err = (ev && ev.target && ev.target.error) ? ev.target.error.message : "unknown_error";
      console.error(`Error deleting ${name} database:`, err);
      resolve({ ok: false, name, reason: err });
    });

    req.addEventListener("blocked", () => {
      // Another tab or a still-open connection is blocking. We can't force-close other tabs.
      // Surfacing this helps diagnose Safari/Firefox “blocked” situations.
      console.warn(`Delete for "${name}" is blocked. Close other tabs or reload.`);
      // Don't resolve here; final outcome will still arrive via success/error/timeout.
    });
  });
}

/**
 * Delete all your app databases, with safe close + staggered deletes to
 * minimize 'blocked' in Firefox/Safari.
 *
 * Returns a summary object with per-DB results.
 */
async function delete_all_DB() {
  // 1) Close any known open handles first (do this synchronously)
  safeCloseDB("gImpulseDB");
  safeCloseDB("gTuneDB");
  safeCloseDB("gSamplesDB");

  // 2) Give the UA a moment to actually tear down connections.
  //    Safari/WebKit particularly benefits from a small wait.
  await wait(250);

  // 3) Delete databases. Stagger deletes slightly to reduce contention.
  const results = {};

  // Legacy impulses
  results.reverb_impulses = await deleteDB("reverb_impulses");

  // Small stagger can help Safari avoid "blocked"
  await wait(150);
  results.reverb_impulses_all = await deleteDB("reverb_impulses_all");

  await wait(150);
  results.tune_search_database = await deleteDB("tune_search_database");

  await wait(150);
  results.samples = await deleteDB("samples");

  if (USE_CUSTOM_INSTRUMENT_DB){
	  await wait(150);
	  results[CustomInstrumentsDB.name()] = await CustomInstrumentsDB.delete();
  }

  // Optional: if you support IDBFactory.databases(), you could verify deletion.
  // Not supported in all Safari versions, so skip by default.

  // 4) Log a concise summary
  const summary = Object.values(results).map(r => {
    const status = r.ok ? "OK" : `FAIL (${r.reason || "unknown"})`;
    return `${r.name}: ${status}`;
  }).join(" | ");

  console.log("IndexedDB deletion summary:", summary);

  return results;
}

