#pragma once
#include <juce_audio_processors/juce_audio_processors.h>
#include <array>
#include "PluginProcessor.h"

class CelticSoundsEditor : public juce::AudioProcessorEditor,
                            private juce::Timer {
public:
    explicit CelticSoundsEditor(CelticSoundsProcessor&);
    ~CelticSoundsEditor() override;

    void paint(juce::Graphics&) override;
    void resized() override;

private:
    void timerCallback() override;
    void buildDroneToggles();
    void selectInstrument(int index);

    CelticSoundsProcessor& processorRef;

    // Instrument selector row
    std::array<juce::TextButton, 8> instrButtons;

    // Drone toggles (max 2 per instrument) + drone volume knob
    std::vector<std::unique_ptr<juce::ToggleButton>> droneToggles;
    juce::Slider droneVolumeSlider;
    juce::Label  droneVolumeLabel;

    // Parameter sliders
    juce::Slider volumeSlider, brightnessSlider, attackSlider, releaseSlider;
    juce::Label  volumeLabel,  brightnessLabel,  attackLabel,  releaseLabel;

    // Pitch control sliders
    juce::Slider masterTuneSlider, transposeSlider, pbRangeSlider, pbUpSlider, pbDownSlider;
    juce::Label  masterTuneLabel, transposeLabel, pbRangeLabel, pbUpLabel, pbDownLabel;

    // Expression selector
    juce::ComboBox expressionBox;
    juce::Label expressionLabel;

    // APVTS attachments
    using SliderAttachment = juce::AudioProcessorValueTreeState::SliderAttachment;
    using ComboAttachment  = juce::AudioProcessorValueTreeState::ComboBoxAttachment;
    std::unique_ptr<SliderAttachment> volumeAttach, brightnessAttach,
                                      attackAttach,  releaseAttach;
    std::unique_ptr<ComboAttachment>  expressionAttach;
    std::unique_ptr<SliderAttachment> masterTuneAttach, transposeAttach, pbRangeAttach,
                                       pbUpAttach, pbDownAttach;
    std::unique_ptr<SliderAttachment> droneVolumeAttach;

    int currentInstrIndex = -1;  // tracks last-rendered instrument for drone rebuild
    int pendingInstrIndex = -1;  // index we've requested but load hasn't completed

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(CelticSoundsEditor)
};
