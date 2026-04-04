#include "DroneEngine.h"
#include <cmath>

DroneEngine::DroneEngine() {
    formatManager.registerBasicFormats();
}

void DroneEngine::prepareToPlay(double sr, int) {
    sampleRate = sr;
}

void DroneEngine::loadInstrument(const InstrumentDef& inst) {
    voices.clear();

    for (int droneNote : inst.droneNotes) {
        auto mapping = NoteMap::lookup(droneNote, inst);
        SampleData sd = SampleRegistry::lookup(inst.id, mapping.sampleNote);
        if (!sd.data) continue;

        auto stream = std::make_unique<juce::MemoryInputStream>(sd.data, (size_t)sd.size, false);
        auto reader = std::unique_ptr<juce::AudioFormatReader>(
            formatManager.createReaderFor(std::move(stream)));
        if (!reader) continue;

        DroneVoice voice;
        voice.midiNote = droneNote;
        voice.rate = mapping.rate;
        voice.active = false;
        voice.position = 0.0;
        voice.buffer.setSize((int)reader->numChannels, (int)reader->lengthInSamples);
        reader->read(&voice.buffer, 0, (int)reader->lengthInSamples, 0, true, true);
        voices[droneNote] = std::move(voice);
    }
}

void DroneEngine::noteOn(int midiNote) {
    auto it = voices.find(midiNote);
    if (it == voices.end()) return;
    it->second.active = !it->second.active;
    if (it->second.active)
        it->second.position = 0.0;  // restart from beginning on toggle-on
}

void DroneEngine::setPitchOffset(float semitones) {
    pitchOffsetSemitones = semitones;
}

void DroneEngine::allNotesOff() {
    for (auto& [note, voice] : voices)
        voice.active = false;
}

void DroneEngine::renderNextBlock(juce::AudioBuffer<float>& outBuf,
                                   int startSample, int numSamples,
                                   float masterGain) {
    float pitchFactor = std::pow(2.0f, pitchOffsetSemitones / 12.0f);
    int outChannels = outBuf.getNumChannels();

    for (auto& [note, v] : voices) {
        if (!v.active) continue;

        int srcSamples = v.buffer.getNumSamples();
        if (srcSamples == 0) continue;

        for (int i = 0; i < numSamples; ++i) {
            // Linear interpolation with loop wrap
            double wrappedPos = std::fmod(v.position, (double)srcSamples);
            int p0 = (int)wrappedPos;
            int p1 = (p0 + 1) % srcSamples;
            float frac = (float)(wrappedPos - p0);

            float sample = v.buffer.getSample(0, p0) * (1.0f - frac)
                         + v.buffer.getSample(0, p1) * frac;

            float out = sample * masterGain;
            for (int ch = 0; ch < outChannels; ++ch)
                outBuf.addSample(ch, startSample + i, out);

            v.position += v.rate * pitchFactor;
            if (v.position >= srcSamples)
                v.position = std::fmod(v.position, (double)srcSamples);
        }
    }
}
