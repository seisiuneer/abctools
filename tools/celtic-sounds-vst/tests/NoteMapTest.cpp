#include <catch2/catch_test_macros.hpp>
#include <catch2/catch_approx.hpp>
#include "NoteMap.h"
#include "InstrumentConfig.h"
#include <cmath>

using Catch::Approx;

TEST_CASE("NoteMap: exact match returns rate 1.0", "[NoteMap]") {
    const auto* inst = InstrumentConfig::find("tin_whistle");
    REQUIRE(inst != nullptr);
    auto result = NoteMap::lookup(74, *inst);
    REQUIRE(result.sampleNote == 74);
    REQUIRE(result.rate == Approx(1.0f).epsilon(0.001));
}

TEST_CASE("NoteMap: note between samples snaps to lower on tie", "[NoteMap]") {
    const auto* inst = InstrumentConfig::find("tin_whistle");
    // tin_whistle samples every 2 semitones. Note 75 is equidistant between 74 and 76 → snap to lower (74)
    auto result = NoteMap::lookup(75, *inst);
    REQUIRE(result.sampleNote == 74);
    REQUIRE(result.rate == Approx(std::pow(2.0f, 1.0f / 12.0f)).epsilon(0.001));
}

TEST_CASE("NoteMap: note above range uses highest sample with upward rate", "[NoteMap]") {
    const auto* inst = InstrumentConfig::find("tin_whistle");
    // tin_whistle max sample is 86. Note 100 is above range.
    auto result = NoteMap::lookup(100, *inst);
    REQUIRE(result.sampleNote == 86);
    REQUIRE(result.rate == Approx(std::pow(2.0f, 14.0f / 12.0f)).epsilon(0.001));
}

TEST_CASE("NoteMap: note below range uses lowest sample with downward rate", "[NoteMap]") {
    const auto* inst = InstrumentConfig::find("tin_whistle");
    // tin_whistle min sample is 74. Note 70 is below range.
    auto result = NoteMap::lookup(70, *inst);
    REQUIRE(result.sampleNote == 74);
    REQUIRE(result.rate == Approx(std::pow(2.0f, -4.0f / 12.0f)).epsilon(0.001));
}

TEST_CASE("NoteMap: highland_bagpipe drone 51 maps to sample 69 (A4)", "[NoteMap]") {
    const auto* inst = InstrumentConfig::find("highland_bagpipe");
    // Drone note 51 is below all samples; nearest sample is 69 (lowest available)
    auto result = NoteMap::lookup(51, *inst);
    REQUIRE(result.sampleNote == 69);
    // Rate = 2^((51-69)/12) = 2^(-18/12) = 2^(-1.5)
    REQUIRE(result.rate == Approx(std::pow(2.0f, -18.0f / 12.0f)).epsilon(0.001));
}

TEST_CASE("NoteMap: uilleann_pipes drone 50 maps to sample 50 exactly", "[NoteMap]") {
    const auto* inst = InstrumentConfig::find("uilleann_pipes");
    auto result = NoteMap::lookup(50, *inst);
    REQUIRE(result.sampleNote == 50);
    REQUIRE(result.rate == Approx(1.0f).epsilon(0.001));
}

TEST_CASE("NoteMap: equidistant notes snap to lower sample", "[NoteMap]") {
    const auto* inst = InstrumentConfig::find("irish_flute");
    // irish_flute samples: 62, 64, 66... Note 65 is equidistant between 64 and 66 → lower (64)
    auto r65 = NoteMap::lookup(65, *inst);
    REQUIRE(r65.sampleNote == 64);
    // Note 67 is equidistant between 66 and 68 → lower (66)
    auto r67 = NoteMap::lookup(67, *inst);
    REQUIRE(r67.sampleNote == 66);
}
