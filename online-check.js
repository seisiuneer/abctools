// Check if online

function setOnlineTitle(){
	
	if (!gMIDIMute){

		//console.log("online-check.js - gSamplesOnLine = "+gSamplesOnline);
		var elem = document.getElementById("toolpagetitle");

		if (!gIsQuickEditor){
			if (gSamplesOnline){
				if (elem){
					elem.innerHTML = "ABC Transcription Tools";
				}
			}
			else{
				if (elem){
					elem.innerHTML = "ABC Transcription Tools (Offline Mode)";
				}		
			}
		}
		else{
			if (gSamplesOnline){
				if (elem){
					elem.innerHTML = "ABC Transcription Tools Quick Editor";
				}
			}
			else{
				if (elem){
					elem.innerHTML = "ABC Transcription Tools Quick Editor (Offline Mode)";
				}		
			}
		}
	}

}

function doOnlineCheck(){
	
	gSamplesOnline = navigator.onLine;

	setOnlineTitle();

	// Reset the abcjs sounds cache
	gSoundsCacheABCJS = {};

}

