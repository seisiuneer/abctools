cmake_minimum_required(VERSION 3.22)
project(CelticSounds VERSION 1.0.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Dependencies fetched at configure time — no submodules required
include(FetchContent)

FetchContent_Declare(
    JUCE
    GIT_REPOSITORY https://github.com/juce-framework/JUCE.git
    GIT_TAG        8.0.0
)
FetchContent_MakeAvailable(JUCE)

# Catch2 for unit tests
FetchContent_Declare(
    Catch2
    GIT_REPOSITORY https://github.com/catchorg/Catch2.git
    GIT_TAG v3.4.0
)
FetchContent_MakeAvailable(Catch2)

# Embedded sample data — requires samples/ to be populated first
file(GLOB SAMPLE_FILES "${CMAKE_CURRENT_SOURCE_DIR}/samples/*.mp3")
list(LENGTH SAMPLE_FILES SAMPLE_COUNT)
message(STATUS "Celtic Sounds: found ${SAMPLE_COUNT} sample files")

# juce_add_binary_data requires at least one source file.
# Use a dummy placeholder when samples/ is empty (scaffold / pre-sample stage).
if(SAMPLE_COUNT EQUAL 0)
    set(BINARY_DATA_SOURCES "${CMAKE_CURRENT_SOURCE_DIR}/samples/.gitkeep")
    message(STATUS "Celtic Sounds: no samples found, using placeholder for BinaryData")
else()
    set(BINARY_DATA_SOURCES ${SAMPLE_FILES})
endif()

juce_add_binary_data(CelticSoundsBinaryData
    NAMESPACE BinaryData
    SOURCES ${BINARY_DATA_SOURCES}
)

# Plugin target
juce_add_plugin(CelticSounds
    VERSION 1.0.0
    COMPANY_NAME "CelticSounds"
    PLUGIN_MANUFACTURER_CODE CltS
    PLUGIN_CODE CltS
    FORMATS VST3 Standalone
    PRODUCT_NAME "Celtic Sounds"
    IS_SYNTH TRUE
    NEEDS_MIDI_INPUT TRUE
    NEEDS_MIDI_OUTPUT FALSE
    IS_MIDI_EFFECT FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS FALSE
    COPY_PLUGIN_AFTER_BUILD FALSE
)

target_sources(CelticSounds PRIVATE
    source/PluginProcessor.cpp
    source/PluginEditor.cpp
    source/SamplerEngine.cpp
    source/DroneEngine.cpp
    source/InstrumentConfig.cpp
    source/MidiRouter.cpp
    source/NoteMap.cpp
    source/ExpressionMapper.cpp
    source/SampleRegistry.cpp
)

target_include_directories(CelticSounds PRIVATE source)

target_compile_definitions(CelticSounds
    PRIVATE
        JUCE_WEB_BROWSER=0
        JUCE_USE_CURL=0
        JUCE_VST3_CAN_REPLACE_VST2=0
        JUCE_USE_MP3AUDIOFORMAT=1
)

target_link_libraries(CelticSounds
    PRIVATE
        juce::juce_audio_utils
        juce::juce_audio_formats
        CelticSoundsBinaryData
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_warning_flags
)

# Unit tests (no BinaryData, no JUCE audio)
add_executable(CelticSoundsTests
    tests/InstrumentConfigTest.cpp
    tests/NoteMapTest.cpp
    tests/MidiRouterTest.cpp
    tests/ExpressionMapperTest.cpp
    source/InstrumentConfig.cpp
    source/NoteMap.cpp
    source/MidiRouter.cpp
    source/ExpressionMapper.cpp
)

target_include_directories(CelticSoundsTests PRIVATE source)
target_link_libraries(CelticSoundsTests PRIVATE Catch2::Catch2WithMain)
