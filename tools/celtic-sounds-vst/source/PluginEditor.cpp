#include "PluginEditor.h"
#include "InstrumentConfig.h"

static constexpr int WIDTH  = 720;
static constexpr int HEIGHT = 500;
static constexpr juce::uint32 BG_COLOUR    = 0xff1a1a2e;
static constexpr juce::uint32 PANEL_COLOUR = 0xff16213e;
static constexpr juce::uint32 ACCENT       = 0xff4a9eff;

CelticSoundsEditor::CelticSoundsEditor(CelticSoundsProcessor& p)
    : AudioProcessorEditor(&p), processorRef(p)
{
    setSize(WIDTH, HEIGHT);
    setResizable(false, false);

    // Dark LookAndFeel
    getLookAndFeel().setColour(juce::ResizableWindow::backgroundColourId,
                                juce::Colour(BG_COLOUR));
    getLookAndFeel().setColour(juce::TextButton::buttonColourId,
                                juce::Colour(PANEL_COLOUR));
    getLookAndFeel().setColour(juce::TextButton::buttonOnColourId,
                                juce::Colour(ACCENT));
    getLookAndFeel().setColour(juce::Slider::thumbColourId,
                                juce::Colour(ACCENT));
    getLookAndFeel().setColour(juce::ComboBox::backgroundColourId,
                                juce::Colour(PANEL_COLOUR));

    // Instrument tabs
    const auto& insts = InstrumentConfig::instruments();
    for (size_t i = 0; i < 8; ++i) {
        instrButtons[i].setButtonText(insts[i].label);
        instrButtons[i].setClickingTogglesState(false);
        instrButtons[i].setRadioGroupId(1);
        instrButtons[i].setToggleable(false);
        instrButtons[i].onClick = [this, i] { selectInstrument(static_cast<int>(i)); };
        addAndMakeVisible(instrButtons[i]);
    }

    // Volume
    volumeSlider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    volumeSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 60, 18);
    volumeLabel.setText("Volume", juce::dontSendNotification);
    volumeLabel.setJustificationType(juce::Justification::centred);
    addAndMakeVisible(volumeSlider);
    addAndMakeVisible(volumeLabel);

    // Brightness
    brightnessSlider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    brightnessSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 60, 18);
    brightnessLabel.setText("Brightness", juce::dontSendNotification);
    brightnessLabel.setJustificationType(juce::Justification::centred);
    addAndMakeVisible(brightnessSlider);
    addAndMakeVisible(brightnessLabel);

    // Attack
    attackSlider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    attackSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 60, 18);
    attackLabel.setText("Attack", juce::dontSendNotification);
    attackLabel.setJustificationType(juce::Justification::centred);
    addAndMakeVisible(attackSlider);
    addAndMakeVisible(attackLabel);

    // Release
    releaseSlider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    releaseSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 60, 18);
    releaseLabel.setText("Release", juce::dontSendNotification);
    releaseLabel.setJustificationType(juce::Justification::centred);
    addAndMakeVisible(releaseSlider);
    addAndMakeVisible(releaseLabel);

    // Expression dropdown
    expressionBox.addItemList({"Breath (CC2)","Volume (CC7)","Expression (CC11)",
                                "Brightness (CC74)","Channel Pressure","Velocity","Fixed"}, 1);
    expressionLabel.setText("Expression Source", juce::dontSendNotification);
    expressionLabel.setJustificationType(juce::Justification::centred);
    addAndMakeVisible(expressionBox);
    addAndMakeVisible(expressionLabel);

    // Master Tune
    masterTuneSlider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    masterTuneSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 60, 18);
    masterTuneLabel.setText("Master Tune", juce::dontSendNotification);
    masterTuneLabel.setJustificationType(juce::Justification::centred);
    addAndMakeVisible(masterTuneSlider);
    addAndMakeVisible(masterTuneLabel);

    // Transpose
    transposeSlider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    transposeSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 60, 18);
    transposeLabel.setText("Transpose", juce::dontSendNotification);
    transposeLabel.setJustificationType(juce::Justification::centred);
    addAndMakeVisible(transposeSlider);
    addAndMakeVisible(transposeLabel);

    // PB Range
    pbRangeSlider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    pbRangeSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 60, 18);
    pbRangeLabel.setText("PB Range", juce::dontSendNotification);
    pbRangeLabel.setJustificationType(juce::Justification::centred);
    addAndMakeVisible(pbRangeSlider);
    addAndMakeVisible(pbRangeLabel);

    // PB Up Scale
    pbUpSlider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    pbUpSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 60, 18);
    pbUpLabel.setText("PB Up", juce::dontSendNotification);
    pbUpLabel.setJustificationType(juce::Justification::centred);
    addAndMakeVisible(pbUpSlider);
    addAndMakeVisible(pbUpLabel);

    // PB Down Scale
    pbDownSlider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    pbDownSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 60, 18);
    pbDownLabel.setText("PB Down", juce::dontSendNotification);
    pbDownLabel.setJustificationType(juce::Justification::centred);
    addAndMakeVisible(pbDownSlider);
    addAndMakeVisible(pbDownLabel);

    // APVTS attachments
    volumeAttach     = std::make_unique<SliderAttachment>(processorRef.apvts, "volume",     volumeSlider);
    brightnessAttach = std::make_unique<SliderAttachment>(processorRef.apvts, "brightness", brightnessSlider);
    attackAttach     = std::make_unique<SliderAttachment>(processorRef.apvts, "attack",     attackSlider);
    releaseAttach    = std::make_unique<SliderAttachment>(processorRef.apvts, "release",    releaseSlider);
    expressionAttach = std::make_unique<ComboAttachment>(processorRef.apvts, "expression", expressionBox);
    masterTuneAttach = std::make_unique<SliderAttachment>(processorRef.apvts, "master_tune", masterTuneSlider);
    transposeAttach  = std::make_unique<SliderAttachment>(processorRef.apvts, "transpose",   transposeSlider);
    pbRangeAttach    = std::make_unique<SliderAttachment>(processorRef.apvts, "pitch_bend_range", pbRangeSlider);
    pbUpAttach       = std::make_unique<SliderAttachment>(processorRef.apvts, "pb_up_scale", pbUpSlider);
    pbDownAttach     = std::make_unique<SliderAttachment>(processorRef.apvts, "pb_down_scale", pbDownSlider);

    // Drone volume
    droneVolumeSlider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    droneVolumeSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 18);
    droneVolumeLabel.setText("Drone Vol", juce::dontSendNotification);
    droneVolumeLabel.setJustificationType(juce::Justification::centred);
    addChildComponent(droneVolumeSlider);   // hidden until instrument has drones
    addChildComponent(droneVolumeLabel);
    droneVolumeAttach = std::make_unique<SliderAttachment>(processorRef.apvts, "drone_volume", droneVolumeSlider);

    // Highlight current instrument and build drone toggles
    selectInstrument(processorRef.getCurrentInstrumentIndex());

    // Poll for instrument changes (e.g. session restore)
    startTimerHz(10);
}

CelticSoundsEditor::~CelticSoundsEditor() {
    stopTimer();
}

void CelticSoundsEditor::timerCallback() {
    int processorIdx = processorRef.getCurrentInstrumentIndex();
    // Sync once the processor has caught up to our pending request
    if (pendingInstrIndex >= 0 && processorIdx == pendingInstrIndex)
        pendingInstrIndex = -1;
    // Only act on external changes (state restore), not on our own pending changes
    if (pendingInstrIndex < 0 && processorIdx != currentInstrIndex)
        selectInstrument(processorIdx);
}

void CelticSoundsEditor::selectInstrument(int index) {
    pendingInstrIndex = index;
    processorRef.setInstrument(index);
    currentInstrIndex = index;
    for (size_t i = 0; i < 8; ++i)
        instrButtons[i].setToggleState(static_cast<int>(i) == index, juce::dontSendNotification);
    buildDroneToggles();

    bool hasDrones = !droneToggles.empty();
    droneVolumeSlider.setVisible(hasDrones);
    droneVolumeLabel.setVisible(hasDrones);

    // Layout drone toggles on the left, drone volume knob on the right
    int droneX = 10;
    for (auto& toggle : droneToggles) {
        toggle->setBounds(droneX, 60, 90, 28);
        droneX += 100;
    }
    if (hasDrones) {
        droneVolumeLabel.setBounds(WIDTH - 80, 52, 70, 16);
        droneVolumeSlider.setBounds(WIDTH - 80, 68, 70, 70);
    }
}

void CelticSoundsEditor::buildDroneToggles() {
    droneToggles.clear();

    const auto& insts = InstrumentConfig::instruments();
    if (currentInstrIndex < 0 || currentInstrIndex >= (int)insts.size()) return;
    const auto& inst = insts[static_cast<size_t>(currentInstrIndex)];

    static const std::array<const char*, 12> NOTE_NAMES =
        {"C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"};

    for (int droneNote : inst.droneNotes) {
        int octave = droneNote / 12 - 1;
        juce::String label = juce::String(NOTE_NAMES[static_cast<size_t>(droneNote % 12)]) + juce::String(octave);
        auto btn = std::make_unique<juce::ToggleButton>(label);
        btn->setToggleState(false, juce::dontSendNotification);
        auto* rawBtn = btn.get();
        rawBtn->onClick = [this, rawBtn, droneNote] {
            bool accepted = processorRef.toggleDroneFromUI(droneNote);
            if (!accepted)
                rawBtn->setToggleState(!rawBtn->getToggleState(), juce::dontSendNotification);
        };
        addAndMakeVisible(*btn);
        droneToggles.push_back(std::move(btn));
    }
}

void CelticSoundsEditor::paint(juce::Graphics& g) {
    g.fillAll(juce::Colour(BG_COLOUR));

    // Instrument tab row background
    g.setColour(juce::Colour(PANEL_COLOUR));
    g.fillRect(0, 0, WIDTH, 50);

    // Knobs area background
    g.setColour(juce::Colour(PANEL_COLOUR).withAlpha(0.5f));
    g.fillRect(0, 200, WIDTH, HEIGHT - 200);
}

void CelticSoundsEditor::resized() {
    // Instrument tab row
    int tabWidth = WIDTH / 8;
    for (size_t i = 0; i < 8; ++i)
        instrButtons[i].setBounds(static_cast<int>(i) * tabWidth, 2, tabWidth - 2, 46);

    // Drone toggles row
    int droneY = 60;
    int droneX = 10;
    for (auto& toggle : droneToggles) {
        toggle->setBounds(droneX, droneY, 90, 28);
        droneX += 100;
    }

    // Knob row: Volume, Brightness, Attack, Release at bottom
    int knobY = 210;
    int knobW = 90;
    int knobH = 90;
    int spacing = (WIDTH - 4 * knobW - 120) / 5;  // 120 for expression box

    int x = spacing;
    volumeLabel.setBounds(x, knobY - 20, knobW, 18);
    volumeSlider.setBounds(x, knobY, knobW, knobH);
    x += knobW + spacing;

    brightnessLabel.setBounds(x, knobY - 20, knobW, 18);
    brightnessSlider.setBounds(x, knobY, knobW, knobH);
    x += knobW + spacing;

    attackLabel.setBounds(x, knobY - 20, knobW, 18);
    attackSlider.setBounds(x, knobY, knobW, knobH);
    x += knobW + spacing;

    releaseLabel.setBounds(x, knobY - 20, knobW, 18);
    releaseSlider.setBounds(x, knobY, knobW, knobH);
    x += knobW + spacing;

    // Expression dropdown to the right of knobs
    expressionLabel.setBounds(x, knobY - 20, 120, 18);
    expressionBox.setBounds(x, knobY + 30, 120, 28);

    // Pitch controls row
    int pitchY = knobY + knobH + 40;  // below first knob row
    int pitchSpacing = (WIDTH - 5 * knobW) / 6;
    int px = pitchSpacing;

    masterTuneLabel.setBounds(px, pitchY - 20, knobW, 18);
    masterTuneSlider.setBounds(px, pitchY, knobW, knobH);
    px += knobW + pitchSpacing;

    transposeLabel.setBounds(px, pitchY - 20, knobW, 18);
    transposeSlider.setBounds(px, pitchY, knobW, knobH);
    px += knobW + pitchSpacing;

    pbRangeLabel.setBounds(px, pitchY - 20, knobW, 18);
    pbRangeSlider.setBounds(px, pitchY, knobW, knobH);
    px += knobW + pitchSpacing;

    pbUpLabel.setBounds(px, pitchY - 20, knobW, 18);
    pbUpSlider.setBounds(px, pitchY, knobW, knobH);
    px += knobW + pitchSpacing;

    pbDownLabel.setBounds(px, pitchY - 20, knobW, 18);
    pbDownSlider.setBounds(px, pitchY, knobW, knobH);
}
