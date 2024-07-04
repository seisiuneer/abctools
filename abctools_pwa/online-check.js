// Check if online
function doOnlineCheck(){
	gSamplesOnline = navigator.onLine;
	//console.log("online-check.js - gSamplesOnLine = "+gSamplesOnline);
	var elem = document.getElementById("toolpagetitle");
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

