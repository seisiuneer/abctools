#pragma once
#include <juce_audio_processors/juce_audio_processors.h>
#include "SamplerEngine.h"
#include "DroneEngine.h"
#include "MidiRouter.h"
#include "ExpressionMapper.h"
#include "InstrumentConfig.h"

class CelticSoundsProcessor : public juce::AudioProcessor {
public:
    CelticSoundsProcessor();
    ~CelticSoundsProcessor() override;

    void prepareToPlay(double sampleRate, int samplesPerBlock) override;
    void releaseResources() override;
    void processBlock(juce::AudioBuffer<float>&, juce::MidiBuffer&) override;

    juce::AudioProcessorEditor* createEditor() override;
    bool hasEditor() const override { return true; }

    const juce::String getName() const override { return "Celtic Sounds"; }
    bool acceptsMidi() const override { return true; }
    bool producesMidi() const override { return false; }
    bool isMidiEffect() const override { return false; }
    double getTailLengthSeconds() const override { return 2.0; }

    int getNumPrograms() override { return 1; }
    int getCurrentProgram() override { return 0; }
    void setCurrentProgram(int) override {}
    const juce::String getProgramName(int) override { return {}; }
    void changeProgramName(int, const juce::String&) override {}

    void getStateInformation(juce::MemoryBlock& destData) override;
    void setStateInformation(const void* data, int sizeInBytes) override;

    // Called from editor when user selects an instrument tab
    void setInstrument(int index);
    int getCurrentInstrumentIndex() const { return currentInstrumentIndex.load(); }
    // Returns false if the toggle was ignored (e.g., currently loading).
    bool toggleDroneFromUI(int midiNote);

    juce::AudioProcessorValueTreeState apvts;

    static juce::AudioProcessorValueTreeState::ParameterLayout createParameterLayout();

private:
    void loadInstrumentAsync(int index);

    SamplerEngine samplerEngine;
    DroneEngine droneEngine;
    const InstrumentDef* currentInst = nullptr;
    std::atomic<int> currentInstrumentIndex{0};
    std::atomic<bool> loading{false};
    float currentPitchBendSemitones = 0.0f;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(CelticSoundsProcessor)
};
