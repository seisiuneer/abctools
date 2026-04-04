#pragma once
#include <juce_audio_formats/juce_audio_formats.h>
#include <juce_audio_basics/juce_audio_basics.h>
#include <array>
#include <map>
#include <cstdint>
#include "InstrumentConfig.h"
#include "NoteMap.h"
#include "SampleRegistry.h"

class SamplerEngine {
public:
    SamplerEngine();

    void prepareToPlay(double sampleRate, int maxBlockSize);

    // Load all samples for the given instrument. Decodes MP3 data from BinaryData.
    // Must be called on the message thread before playback begins.
    void loadInstrument(const InstrumentDef& inst);

    void noteOn(int midiNote, float gain, float attackSecs, float releaseSecs);
    // Must be called from the audio thread.
    void noteOff(int midiNote);

    // Adds rendered audio into buffer[startSample..startSample+numSamples].
    // Applies master gain and brightness (0.0=dark, 1.0=full).
    void renderNextBlock(juce::AudioBuffer<float>& buffer,
                         int startSample, int numSamples,
                         float masterGain, float brightness);

    void allNotesOff();

    // Called from audio thread before renderNextBlock. Combines master tune + pitch bend.
    void setPitchOffset(float semitones);

private:
    struct Voice {
        int midiNote = -1;
        double position = 0.0;
        float rate = 1.0f;
        float gain = 0.0f;
        float filterState = 0.0f;
        bool active = false;
        uint64_t startTime = 0;
        juce::ADSR adsr;
        const juce::AudioBuffer<float>* buffer = nullptr;
    };

    std::array<Voice, 8> voices;
    std::map<int, juce::AudioBuffer<float>> loadedSamples;  // sampleNote → PCM buffer
    juce::AudioFormatManager formatManager;
    const InstrumentDef* currentInst = nullptr;
    double sampleRate = 44100.0;
    uint64_t voiceTimer = 0;
    juce::SpinLock sampleLock;

    float pitchOffsetSemitones = 0.0f;

    Voice* findFreeVoice();
    Voice* stealOldestVoice();
};
