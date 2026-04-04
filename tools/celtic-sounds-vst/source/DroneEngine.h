#pragma once
#include <juce_audio_formats/juce_audio_formats.h>
#include <juce_audio_basics/juce_audio_basics.h>
#include <map>
#include "InstrumentConfig.h"
#include "NoteMap.h"
#include "SampleRegistry.h"

class DroneEngine {
public:
    DroneEngine();

    void prepareToPlay(double sr, int maxBlockSize);

    // Loads and decodes samples for all drone notes in the instrument.
    // Called on message thread before playback.
    void loadInstrument(const InstrumentDef& inst);

    // Toggles drone on/off. Ignored if midiNote is not a drone note for this instrument.
    // Called from audio thread.
    void noteOn(int midiNote);

    // Adds looping drone audio into buffer. Called from audio thread.
    void renderNextBlock(juce::AudioBuffer<float>& buffer,
                         int startSample, int numSamples,
                         float masterGain);

    // Silences all active drones immediately. Called from audio thread.
    void allNotesOff();

    void setPitchOffset(float semitones);

private:
    struct DroneVoice {
        int midiNote = -1;
        float rate = 1.0f;
        double position = 0.0;
        bool active = false;
        juce::AudioBuffer<float> buffer;
    };

    float pitchOffsetSemitones = 0.0f;

    std::map<int, DroneVoice> voices;  // keyed by drone MIDI note
    juce::AudioFormatManager formatManager;
    double sampleRate = 44100.0;
};
