#include "SamplerEngine.h"
#include <algorithm>
#include <cmath>

SamplerEngine::SamplerEngine() {
    formatManager.registerBasicFormats();  // includes MP3 when JUCE_USE_MP3AUDIOFORMAT=1
}

void SamplerEngine::prepareToPlay(double sr, int /*maxBlock*/) {
    sampleRate = sr;
    juce::ADSR::Parameters defaultParams{0.01f, 0.0f, 1.0f, 0.3f};
    for (auto& v : voices) {
        v.active = false;
        v.adsr.setSampleRate(sr);
        v.adsr.setParameters(defaultParams);
    }
}

void SamplerEngine::loadInstrument(const InstrumentDef& inst) {
    // Decode all samples without holding the lock
    std::map<int, juce::AudioBuffer<float>> newSamples;

    for (int note : inst.sampleNotes) {
        SampleData sd = SampleRegistry::lookup(inst.id, note);
        if (!sd.data) continue;

        auto stream = std::make_unique<juce::MemoryInputStream>(sd.data, (size_t)sd.size, false);
        auto reader = std::unique_ptr<juce::AudioFormatReader>(
            formatManager.createReaderFor(std::move(stream)));
        if (!reader) continue;

        juce::AudioBuffer<float> buf((int)reader->numChannels,
                                      (int)reader->lengthInSamples);
        reader->read(&buf, 0, (int)reader->lengthInSamples, 0, true, true);
        newSamples[note] = std::move(buf);
    }

    // Swap under lock — nanoseconds
    {
        juce::SpinLock::ScopedLockType lock(sampleLock);
        loadedSamples = std::move(newSamples);
        currentInst = &inst;
    }
}

void SamplerEngine::noteOn(int midiNote, float gain, float attackSecs, float releaseSecs) {
    if (!currentInst) return;

    // Do lookup outside the lock (noteOn is audio-thread-only, no concurrent writes here)
    auto mapping = NoteMap::lookup(midiNote, *currentInst);

    juce::SpinLock::ScopedLockType lock(sampleLock);
    auto sampleIt = loadedSamples.find(mapping.sampleNote);
    if (sampleIt == loadedSamples.end()) return;

    Voice* v = findFreeVoice();
    if (!v) v = stealOldestVoice();

    v->midiNote = midiNote;
    v->position = 0.0;
    v->rate = mapping.rate;
    v->gain = gain;
    v->filterState = 0.0f;
    v->active = true;
    v->startTime = ++voiceTimer;
    v->buffer = &sampleIt->second;

    juce::ADSR::Parameters p{attackSecs, 0.0f, 1.0f, releaseSecs};
    v->adsr.setSampleRate(sampleRate);
    v->adsr.setParameters(p);
    v->adsr.noteOn();
}

void SamplerEngine::noteOff(int midiNote) {
    for (auto& v : voices)
        if (v.active && v.midiNote == midiNote)
            v.adsr.noteOff();
}

void SamplerEngine::allNotesOff() {
    juce::SpinLock::ScopedLockType lock(sampleLock);
    for (auto& v : voices)
        v.adsr.noteOff();
}

void SamplerEngine::renderNextBlock(juce::AudioBuffer<float>& outBuf,
                                     int startSample, int numSamples,
                                     float masterGain, float brightness) {
    juce::GenericScopedTryLock<juce::SpinLock> tryLock(sampleLock);
    if (!tryLock.isLocked()) return;  // skip block while loading

    // One-pole lowpass coefficient: brightness=1 → alpha=1 (no filter)
    float cutoffHz = 200.0f + brightness * (18000.0f - 200.0f);
    float rc = 1.0f / (2.0f * 3.14159265f * cutoffHz);
    float dt = 1.0f / (float)sampleRate;
    float alpha = dt / (rc + dt);

    float pitchFactor = std::pow(2.0f, pitchOffsetSemitones / 12.0f);
    int outChannels = outBuf.getNumChannels();

    for (auto& v : voices) {
        if (!v.active || !v.buffer) continue;

        const int srcSamples = v.buffer->getNumSamples();

        for (int i = 0; i < numSamples; ++i) {
            if (v.position >= srcSamples - 1) {
                v.active = false;
                break;
            }

            // Linear interpolation
            int p0 = (int)v.position;
            int p1 = std::min(p0 + 1, srcSamples - 1);
            float frac = (float)(v.position - p0);

            // Use channel 0 (mono or left) as source; duplicate to all output channels
            float sample = v.buffer->getSample(0, p0) * (1.0f - frac)
                         + v.buffer->getSample(0, p1) * frac;

            // Brightness filter
            v.filterState = alpha * sample + (1.0f - alpha) * v.filterState;
            sample = v.filterState;

            // ADSR
            float env = v.adsr.getNextSample();
            if (!v.adsr.isActive()) {
                v.active = false;
                break;
            }

            float out = sample * env * v.gain * masterGain;
            for (int ch = 0; ch < outChannels; ++ch)
                outBuf.addSample(ch, startSample + i, out);

            v.position += v.rate * pitchFactor;
        }
    }
}

void SamplerEngine::setPitchOffset(float semitones) {
    pitchOffsetSemitones = semitones;
}

SamplerEngine::Voice* SamplerEngine::findFreeVoice() {
    for (auto& v : voices)
        if (!v.active) return &v;
    return nullptr;
}

SamplerEngine::Voice* SamplerEngine::stealOldestVoice() {
    Voice* oldest = &voices[0];
    for (auto& v : voices)
        if (v.startTime < oldest->startTime) oldest = &v;
    oldest->active = false;
    return oldest;
}
