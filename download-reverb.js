//
// Common routines for downloading audio with reverb
//

//
// Add silence at the end of an audio buffer
//
function addSilenceAtEnd(originalBuffer, context, nSec) {

    // Get the original buffer's length
    const originalLength = originalBuffer.length;
    
    // Calculate the new length (original length + nSec seconds)
    const newLength = originalLength + context.sampleRate * nSec; 
    
    // Create a new AudioBuffer with the new length
    const newBuffer = context.createBuffer(originalBuffer.numberOfChannels, newLength, context.sampleRate);
    
    // Copy data from the original buffer to the new buffer
    for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
        const originalChannelData = originalBuffer.getChannelData(channel);
        const newChannelData = newBuffer.getChannelData(channel);
        
        // Copy original data
        newChannelData.set(originalChannelData);
        
        // Fill the remaining part with silence
        for (let i = originalLength; i < newLength; i++) {
            newChannelData[i] = 0; // Set to silence (zero)
        }
    }
    
    return newBuffer;
}

//
// Convert an AudioBuffer to a Blob using WAVE representation
//
function bufferToWaveOffline(audioBuffer) {

	var numOfChan = audioBuffer.numberOfChannels;
	var length = audioBuffer.length * numOfChan * 2 + 44;
	var buffer = new ArrayBuffer(length);
	var view = new DataView(buffer);
	var channels = [];
	var i;
	var sample;
	var offset = 0;
	var pos = 0;

	// write WAVE header
	setUint32(0x46464952); // "RIFF"
	setUint32(length - 8); // file length - 8
	setUint32(0x45564157); // "WAVE"

	setUint32(0x20746d66); // "fmt " chunk
	setUint32(16); // length = 16
	setUint16(1); // PCM (uncompressed)
	setUint16(numOfChan);
	setUint32(audioBuffer.sampleRate);
	setUint32(audioBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
	setUint16(numOfChan * 2); // block-align
	setUint16(16); // 16-bit (hardcoded in this demo)

	setUint32(0x61746164); // "data" - chunk
	setUint32(length - pos - 4); // chunk length

	// write interleaved data
	for (i = 0; i < numOfChan; i++) {
		channels.push(audioBuffer.getChannelData(i));
	}
	while (pos < length) {
		for (i = 0; i < channels.length; i++) {
			// interleave channels
			sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
			sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
			view.setInt16(pos, sample, true); // write 16-bit sample
			pos += 2;
		}
		offset++; // next source sample
	}

	// create Blob
	return new Blob([buffer], {
		type: "audio/wav"
	});

	function setUint16(data) {
		view.setUint16(pos, data, true);
		pos += 2;
	}

	function setUint32(data) {
		view.setUint32(pos, data, true);
		pos += 4;
	}
}

//
// Get a DataURL for the audio buffer converted to .WAV file
//
function getWaveDownloadBuffer(buffer) {

	return window.URL.createObjectURL(bufferToWaveOffline(buffer));

};

//
// Function to add current tune reverb to an audio buffer
//
function addReverbOffline(audioBuffer, callback) {

	var offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
	var source = offlineContext.createBufferSource();
	source.buffer = audioBuffer;

	// Create reverb node
	var convolver = offlineContext.createConvolver();

	// You can load an impulse response to create different types of reverbs
	// Lets see if the kernel is already in the cache
	var nKernels = gReverbKernels.length;

	var i;

	var theKernel = null;

	for (i = 0; i < nKernels; ++i) {

		if (gReverbKernels[i].style == gReverbStyle) {

			//console.log("Impulse for "+gReverbStyle+" Found in cache");

			theKernel = gReverbKernels[i].kernel;

			break;

		}

	}

	if (!theKernel) {
		//console.log("Reverb kernel not found!");
		callback(null);
		return;
	}

	convolver.buffer = theKernel;

	// Using reverb
	//debugger;
	var wet = offlineContext.createGain();
	var dry = offlineContext.createGain();
	var mixer = offlineContext.createGain();

	source.connect(dry);
	source.connect(convolver);

	convolver.connect(wet);

	dry.gain.value = gReverbDry;
	wet.gain.value = gReverbWet;

	dry.connect(mixer);
	wet.connect(mixer);

	mixer.gain.value = 1.0;
	mixer.connect(offlineContext.destination);

	source.start(0);

	offlineContext.startRendering().then(function(renderedBuffer) {
		callback(renderedBuffer);
	}).catch(function(err) {
		console.error('Rendering failed:', err);
	});
}

//
// Download the current tune audio in .WAV format including any reverb
//
function DownloadWaveWithReverb() {

	// Keep track of export
	sendGoogleAnalytics("export","DownloadWaveWithReverb");

	//console.log("DownloadWaveWithReverb");

	// If no reverb, just download the wav file
	if (!gEnableReverb) {
		DownloadWave();
		return;
	}

	// console.log("gReverbDry = " + gReverbDry);
	// console.log("gReverbWet = " + gReverbWet);
	// console.log("gReverbStyle = " + gReverbStyle);

	var elem = document.getElementById("abcplayer_wavreverbbutton");

	if (elem){
		elem.value = "Saving WAV File With Reverb";
	}

	document.getElementById("loading-bar-spinner").style.display = "block";

	setTimeout(function(){

		var originalMS;

		// Create an audio context
		var audioContext = new window.AudioContext();

		// Fix timing bug for jig-like tunes with no tempo specified
		gMIDIbuffer.millisecondsPerMeasure = isJigWithNoTiming(gPlayerABC, gMIDIbuffer.millisecondsPerMeasure);

		originalMS = gMIDIbuffer.millisecondsPerMeasure;
		
		// Adjust for the player tempo percentage
		if (gSynthControl && gSynthControl.warp){
			gMIDIbuffer.millisecondsPerMeasure *= (100 / gSynthControl.warp);
		}

		// Adjust the sample fade time if required
		var theFade = computeFade(gPlayerABC);

		gMIDIbuffer.fadeLength = theFade;

		gMIDIbuffer.prime().then((async function(t) {

			var wavDataURL = gMIDIbuffer.download();

			var wavData = await fetch(wavDataURL).then(r => r.blob());

			// Restore original timing
			gMIDIbuffer.millisecondsPerMeasure = originalMS;

			var fileReader = new FileReader();

			fileReader.onload = function(event) {

				var buffer = event.target.result;

				audioContext.decodeAudioData(buffer, function(buffer) {

					// Add additional silence at the end for reverb tails
					var silenceSecs = 5;

					// Custom reverb styles can have really long tails
					if (gReverbStyle == "custom"){
						silenceSecs = 7;
					}

					var bufferWithSilence = addSilenceAtEnd(buffer, audioContext, silenceSecs);

					addReverbOffline(bufferWithSilence, function(outputBuffer) {

						// Adding reverb failed, just download the raw WAV file with no reverb
						if (!outputBuffer) {

							var elem = document.getElementById("abcplayer_wavreverbbutton");

							if (elem){
								elem.value = "Save WAV File With Reverb";
							}

							document.getElementById("loading-bar-spinner").style.display = "none";

							DownloadWave();

							return;
						}

						//debugger;

						var theDownloadBuffer = getWaveDownloadBuffer(outputBuffer);

						var link = document.createElement("a");

						document.body.appendChild(link);

						link.setAttribute("style", "display: none;");

						link.href = theDownloadBuffer;

						link.download = GetTuneAudioDownloadName(gPlayerABC, ".wav");

						link.click();

						window.URL.revokeObjectURL(wavData);

						document.body.removeChild(link);

						var elem = document.getElementById("abcplayer_wavreverbbutton");

						if (elem){
							elem.value = "Save WAV File With Reverb";
						}

						document.getElementById("loading-bar-spinner").style.display = "none";


					});
				}, function(err) {
					console.error('Failed to decode audio file:', err);
					
					var elem = document.getElementById("abcplayer_wavreverbbutton");

					if (elem){
						elem.value = "Save WAV File With Reverb";
					}

					document.getElementById("loading-bar-spinner").style.display = "none";

				});

			}

			fileReader.readAsArrayBuffer(wavData);


		})).catch((function(e) {

			//console.warn("Problem exporting .wav:", e)
			// Nope, exit

			var elem = document.getElementById("abcplayer_wavreverbbutton");

			if (elem){
				elem.value = "Save WAV File With Reverb";
			}

			document.getElementById("loading-bar-spinner").style.display = "none";

			var thePrompt = "A problem occured when exporting the .wav file.";

			// Center the string in the prompt
			thePrompt = makeCenteredPromptString(thePrompt);

			DayPilot.Modal.alert(thePrompt, {
				theme: "modal_flat",
				top: 200,
				scrollWithPage: (AllowDialogsToScroll())
			});

		}));
		
	},100);
}

//
// Download the current tune audio in .MP3 format including any reverb
//
function DownloadMP3WithReverb(callback,val){

	//console.log("DownloadMP3WithReverb");

	// Keep track of export
	sendGoogleAnalytics("export","DownloadMP3WithReverb");

	// If no reverb, just download the mp3 file
	if (!gEnableReverb) {
		DownloadMP3(callback,val);
		return;
	}

	// Avoid re-entry
	if (gInDownloadMP3){
		return false;
	}

	gInDownloadMP3 = true;

	function convertToMp3(wav){

	    var arrayBuffer = wav;
	    var buffer = new Uint8Array(arrayBuffer);
	  
	    var data = parseWav(buffer);
	    var dataSize = data.samples.length;
	    var nSamples = dataSize / 4;

	    // Create the MP3 encoder
	    var theSampleRate = data.sampleRate;
		var mp3encoder = new lamejs.Mp3Encoder(2, theSampleRate, gMP3Bitrate);
		var mp3Data = [];

		var data16 = new Int16Array(data.samples.buffer);

		//
		// Test zeroing out the first 10ms of data
		// to eliminate mp3 encoding pop
		//
		for (let i = 0; i < 882; i++) {
			data16[i] = 0;
		}

		// Calculate the length of the resulting arrays (even and odd)
		const evenLength = Math.ceil(dataSize / 2);
		const oddLength = dataSize - evenLength;

		// Create new Int16Arrays for even and odd values
		var evenArray = new Int16Array(evenLength);
		var oddArray = new Int16Array(oddLength);

		// Split the original array into even and odd arrays
		for (let i = 0; i < (nSamples*2); i++) {
		  if (i % 2 === 0) {
		    evenArray[i / 2] = data16[i];
		  } else {
		    oddArray[(i - 1) / 2] = data16[i];
		  }
		}

		var sampleBlockSize = 1152; //can be anything but make it a multiple of 576 to make encoders life easier

		for (var i = 0; i < nSamples; i += sampleBlockSize) {
		  var leftChunk = evenArray.subarray(i, i + sampleBlockSize);
		  var rightChunk = oddArray.subarray(i, i + sampleBlockSize);
		  var mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
		  if (mp3buf.length > 0) {
		    mp3Data.push(mp3buf);
		  }
		}
		var mp3buf = mp3encoder.flush();   //finish writing mp3

		if (mp3buf.length > 0) {
		    mp3Data.push(mp3buf);
		}

	    return mp3Data;

	};

	function parseWav(wav) {
	  function readInt(i, bytes) {
	    var ret = 0,
	        shft = 0;

	    while (bytes) {
	      ret += wav[i] << shft;
	      shft += 8;
	      i++;
	      bytes--;
	    }
	    return ret;
	  }

	  //if (readInt(20, 2) != 1) throw 'Invalid compression code, not PCM';
	  //if (readInt(22, 2) != 1) throw 'Invalid number of channels, not 1';
	  return {
	    sampleRate: readInt(24, 4),
	    bitsPerSample: readInt(34, 2),
	    samples: wav.subarray(44)
	  };
	}

	if (!callback){

		var elem = document.getElementById("abcplayer_mp3reverbbutton");

		if (elem){
			elem.value = "Saving MP3 File With Reverb";
		}
	}

	document.getElementById("loading-bar-spinner").style.display = "block";

	setTimeout(function(){

		var originalMS;

		// Create an audio context
		var audioContext = new window.AudioContext();

		// Fix timing bug for jig-like tunes with no tempo specified
		gMIDIbuffer.millisecondsPerMeasure  = isJigWithNoTiming(gPlayerABC,gMIDIbuffer.millisecondsPerMeasure);

		originalMS = gMIDIbuffer.millisecondsPerMeasure;

		// Adjust for the player tempo percentage
		if (gSynthControl && gSynthControl.warp){
			gMIDIbuffer.millisecondsPerMeasure *= (100 / gSynthControl.warp);
		}

		// Adjust the sample fade time if required
		var theFade = computeFade(gPlayerABC);

		gMIDIbuffer.fadeLength = theFade;

		gMIDIbuffer.prime().then(async function(t) {
		
			var wavDataURL = gMIDIbuffer.download();

			var wavData = await fetch(wavDataURL).then(r => r.blob());

			// Restore original timing
			gMIDIbuffer.millisecondsPerMeasure = originalMS;

			var fileReader = new FileReader();

			fileReader.onload = function(event) {

				var buffer = event.target.result;

				audioContext.decodeAudioData(buffer, function(buffer) {

					// Add additional silence at the end for reverb tails
					var silenceSecs = 5;

					// Custom reverb styles can have really long tails
					if (gReverbStyle == "custom"){
						silenceSecs = 7;
					}

					var bufferWithSilence = addSilenceAtEnd(buffer, audioContext, silenceSecs);

					addReverbOffline(bufferWithSilence, async function(outputBuffer) {

						// Adding reverb failed, just download the raw WAV file with no reverb
						if (!outputBuffer) {

							if (!callback){

								var elem = document.getElementById("abcplayer_mp3reverbbutton");

								if (elem){
									elem.value = "Save as MP3 File With Reverb";
								}
							}

							document.getElementById("loading-bar-spinner").style.display = "none";

							gInDownloadMP3 = false;

							DownloadMP3(callback,val);

							return;
						}

						//debugger;

						var theDownloadBuffer = bufferToWaveOffline(outputBuffer);

						var fileReader2 = new FileReader();

						fileReader2.onload = function(event) {

							//debugger;

							var buffer = event.target.result;

							var mp3Data = convertToMp3(buffer);

							var blob = new Blob(mp3Data, {type: 'audio/mp3'});

							var url = window.URL.createObjectURL(blob);

							var link = document.createElement("a");
							
							document.body.appendChild(link);
							
							link.setAttribute("style", "display: none;");
							
							link.href = url;
							
							link.download = GetTuneAudioDownloadName(gPlayerABC,".mp3");
							
							link.click();
							
							window.URL.revokeObjectURL(url);
							
							document.body.removeChild(link);
							
							if (!callback){

								var elem = document.getElementById("abcplayer_mp3reverbbutton");

								if (elem){
									elem.value = "Save as MP3 File With Reverb";
								}
							}

							document.getElementById("loading-bar-spinner").style.display = "none";

							gInDownloadMP3 = false;

							if (callback){
								callback(val);
							}

						}

						fileReader2.readAsArrayBuffer(theDownloadBuffer);

					});
				}, function(err) {
					console.error('Failed to decode audio file:', err);
					
					if (!callback){
						var elem = document.getElementById("abcplayer_mp3reverbbutton");

						if (elem){
							elem.value = "Save as MP3 File With Reverb";
						}
					}	

					document.getElementById("loading-bar-spinner").style.display = "none";

					gInDownloadMP3 = false;

				});

			}

			fileReader.readAsArrayBuffer(wavData);

		}	
	    ).catch((function(e) {

			var thePrompt = "A problem occured when exporting the .mp3 file.";
			
			// Center the string in the prompt
			thePrompt = makeCenteredPromptString(thePrompt);

			DayPilot.Modal.alert(thePrompt,{ theme: "modal_flat", top: 200, scrollWithPage: (AllowDialogsToScroll()) });

			if (!callback){

				var elem = document.getElementById("abcplayer_mp3reverbbutton");

				if (elem){
					elem.value = "Save as MP3 File With Reverb";
				}
			}

			document.getElementById("loading-bar-spinner").style.display = "none";

			gInDownloadMP3 = false;


	    }));

	},100);

}
