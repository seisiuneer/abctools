#include "PluginProcessor.h"
#include "PluginEditor.h"
#include <algorithm>
#include <cmath>

juce::AudioProcessorValueTreeState::ParameterLayout
CelticSoundsProcessor::createParameterLayout() {
    juce::AudioProcessorValueTreeState::ParameterLayout layout;

    layout.add(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID{"volume", 1}, "Volume",
        juce::NormalisableRange<float>(0.0f, 1.0f), 0.8f));
    layout.add(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID{"brightness", 1}, "Brightness",
        juce::NormalisableRange<float>(0.0f, 1.0f), 1.0f));
    layout.add(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID{"attack", 1}, "Attack",
        juce::NormalisableRange<float>(0.001f, 2.0f, 0.0f, 0.5f), 0.01f));
    layout.add(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID{"release", 1}, "Release",
        juce::NormalisableRange<float>(0.001f, 5.0f, 0.0f, 0.5f), 0.3f));
    layout.add(std::make_unique<juce::AudioParameterChoice>(
        juce::ParameterID{"expression", 1}, "Expression Source",
        juce::StringArray{"Breath (CC2)","Volume (CC7)","Expression (CC11)",
                          "Brightness (CC74)","Channel Pressure","Velocity","Fixed"},
        5));  // default: Velocity

    layout.add(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID{"master_tune", 1}, "Master Tune",
        juce::NormalisableRange<float>(-50.0f, 50.0f), 0.0f));
    layout.add(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID{"transpose", 1}, "Transpose",
        juce::NormalisableRange<float>(-12.0f, 12.0f, 1.0f), 0.0f));
    layout.add(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID{"pitch_bend_range", 1}, "Pitch Bend Range",
        juce::NormalisableRange<float>(0.0f, 12.0f, 1.0f), 2.0f));
    layout.add(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID{"pb_up_scale", 1}, "PB Up Scale",
        juce::NormalisableRange<float>(0.0f, 1.0f), 1.0f));
    layout.add(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID{"pb_down_scale", 1}, "PB Down Scale",
        juce::NormalisableRange<float>(0.0f, 1.0f), 1.0f));
    layout.add(std::make_unique<juce::AudioParameterFloat>(
        juce::ParameterID{"drone_volume", 1}, "Drone Volume",
        juce::NormalisableRange<float>(0.0f, 1.0f), 1.0f));

    return layout;
}

CelticSoundsProcessor::CelticSoundsProcessor()
    : AudioProcessor(BusesProperties()
        .withOutput("Output", juce::AudioChannelSet::stereo(), true)),
      apvts(*this, nullptr, "STATE", createParameterLayout())
{
    // Load default instrument on message thread after construction
    juce::MessageManager::callAsync([this] { loadInstrumentAsync(0); });
}

CelticSoundsProcessor::~CelticSoundsProcessor() = default;

void CelticSoundsProcessor::prepareToPlay(double sr, int blockSize) {
    samplerEngine.prepareToPlay(sr, blockSize);
    droneEngine.prepareToPlay(sr, blockSize);
}

void CelticSoundsProcessor::releaseResources() {}

void CelticSoundsProcessor::processBlock(juce::AudioBuffer<float>& buffer,
                                          juce::MidiBuffer& midiMessages) {
    juce::ScopedNoDenormals noDenormals;
    buffer.clear();

    if (loading.load() || !currentInst) return;

    float volume     = apvts.getRawParameterValue("volume")->load();
    float brightness = apvts.getRawParameterValue("brightness")->load();
    float attack     = apvts.getRawParameterValue("attack")->load();
    float release    = apvts.getRawParameterValue("release")->load();
    int   exprIdx    = (int)apvts.getRawParameterValue("expression")->load();
    auto  exprSrc    = static_cast<ExpressionSource>(exprIdx);

    float masterTune  = apvts.getRawParameterValue("master_tune")->load();
    int   transpose   = (int)std::round(apvts.getRawParameterValue("transpose")->load());
    float pbRange     = apvts.getRawParameterValue("pitch_bend_range")->load();
    float pbUpScale   = apvts.getRawParameterValue("pb_up_scale")->load();
    float pbDownScale = apvts.getRawParameterValue("pb_down_scale")->load();

    for (const auto metadata : midiMessages) {
        const auto msg = metadata.getMessage();

        if (msg.isNoteOn()) {
            int note = std::clamp(msg.getNoteNumber() + transpose, 0, 127);
            float gain = ExpressionMapper::toGain(msg.getVelocity(), exprSrc);
            auto type = MidiRouter::classify(note, *currentInst);
            if (type == MidiRouter::NoteType::Drone)
                droneEngine.noteOn(note);
            else
                samplerEngine.noteOn(note, gain, attack, release);
        } else if (msg.isNoteOff()) {
            int note = std::clamp(msg.getNoteNumber() + transpose, 0, 127);
            auto type = MidiRouter::classify(note, *currentInst);
            if (type == MidiRouter::NoteType::Melody)
                samplerEngine.noteOff(note);
            // Drone note-off is intentionally ignored
        } else if (msg.isAllNotesOff() || msg.isAllSoundOff()) {
            samplerEngine.allNotesOff();
            droneEngine.allNotesOff();
        } else if (msg.isPitchWheel()) {
            int rawBend = msg.getPitchWheelValue();  // 0-16383, center=8192
            float normalizedBend = (rawBend - 8192) / 8191.0f;
            currentPitchBendSemitones = normalizedBend * pbRange
                * (normalizedBend > 0.0f ? pbUpScale : pbDownScale);
        }
    }

    float pitchOffsetSemitones = masterTune / 100.0f + currentPitchBendSemitones;
    samplerEngine.setPitchOffset(pitchOffsetSemitones);
    droneEngine.setPitchOffset(pitchOffsetSemitones);

    float droneVolume = apvts.getRawParameterValue("drone_volume")->load();

    int numSamples = buffer.getNumSamples();
    samplerEngine.renderNextBlock(buffer, 0, numSamples, volume, brightness);
    droneEngine.renderNextBlock(buffer, 0, numSamples, volume * droneVolume);
}

void CelticSoundsProcessor::setInstrument(int index) {
    if (index == currentInstrumentIndex.load()) return;
    juce::MessageManager::callAsync([this, index] { loadInstrumentAsync(index); });
}

void CelticSoundsProcessor::loadInstrumentAsync(int index) {
    loading.store(true);
    samplerEngine.allNotesOff();
    droneEngine.allNotesOff();

    const auto& insts = InstrumentConfig::instruments();
    if (index < 0 || index >= (int)insts.size()) { loading.store(false); return; }

    currentInstrumentIndex.store(index);  // update index and pointer together
    currentInst = &insts[static_cast<size_t>(index)];
    samplerEngine.loadInstrument(*currentInst);
    droneEngine.loadInstrument(*currentInst);
    loading.store(false);
}

bool CelticSoundsProcessor::toggleDroneFromUI(int midiNote) {
    if (loading.load()) return false;
    droneEngine.noteOn(midiNote);
    return true;
}

juce::AudioProcessorEditor* CelticSoundsProcessor::createEditor() {
    return new CelticSoundsEditor(*this);
}

void CelticSoundsProcessor::getStateInformation(juce::MemoryBlock& destData) {
    auto state = apvts.copyState();
    state.setProperty("instrumentIndex", currentInstrumentIndex.load(), nullptr);
    std::unique_ptr<juce::XmlElement> xml(state.createXml());
    copyXmlToBinary(*xml, destData);
}

void CelticSoundsProcessor::setStateInformation(const void* data, int sizeInBytes) {
    std::unique_ptr<juce::XmlElement> xml(getXmlFromBinary(data, sizeInBytes));
    if (!xml) return;
    auto state = juce::ValueTree::fromXml(*xml);
    apvts.replaceState(state);
    int idx = state.getProperty("instrumentIndex", 0);
    juce::MessageManager::callAsync([this, idx] { loadInstrumentAsync(idx); });
}

juce::AudioProcessor* JUCE_CALLTYPE createPluginFilter() {
    return new CelticSoundsProcessor();
}
