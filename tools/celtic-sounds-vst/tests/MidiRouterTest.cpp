#include <catch2/catch_test_macros.hpp>
#include "MidiRouter.h"
#include "InstrumentConfig.h"

TEST_CASE("MidiRouter: melody note classified correctly for tin_whistle", "[MidiRouter]") {
    const auto* inst = InstrumentConfig::find("tin_whistle");
    REQUIRE(inst != nullptr);
    REQUIRE(MidiRouter::classify(80, *inst) == MidiRouter::NoteType::Melody);
}

TEST_CASE("MidiRouter: tin_whistle has no drones", "[MidiRouter]") {
    const auto* inst = InstrumentConfig::find("tin_whistle");
    REQUIRE(inst != nullptr);
    REQUIRE(MidiRouter::classify(74, *inst) == MidiRouter::NoteType::Melody);
    REQUIRE(MidiRouter::classify(86, *inst) == MidiRouter::NoteType::Melody);
}

TEST_CASE("MidiRouter: uilleann_pipes drone notes 50 and 51 classified as Drone", "[MidiRouter]") {
    const auto* inst = InstrumentConfig::find("uilleann_pipes");
    REQUIRE(inst != nullptr);
    REQUIRE(MidiRouter::classify(50, *inst) == MidiRouter::NoteType::Drone);
    REQUIRE(MidiRouter::classify(51, *inst) == MidiRouter::NoteType::Drone);
}

TEST_CASE("MidiRouter: uilleann_pipes non-drone note classified as Melody", "[MidiRouter]") {
    const auto* inst = InstrumentConfig::find("uilleann_pipes");
    REQUIRE(inst != nullptr);
    REQUIRE(MidiRouter::classify(62, *inst) == MidiRouter::NoteType::Melody);
    REQUIRE(MidiRouter::classify(86, *inst) == MidiRouter::NoteType::Melody);
}

TEST_CASE("MidiRouter: highland_bagpipe drone 51 is Drone", "[MidiRouter]") {
    const auto* inst = InstrumentConfig::find("highland_bagpipe");
    REQUIRE(inst != nullptr);
    REQUIRE(MidiRouter::classify(51, *inst) == MidiRouter::NoteType::Drone);
    REQUIRE(MidiRouter::classify(69, *inst) == MidiRouter::NoteType::Melody);
}

TEST_CASE("MidiRouter: sackpipa drone 51 is Drone", "[MidiRouter]") {
    const auto* inst = InstrumentConfig::find("sackpipa");
    REQUIRE(inst != nullptr);
    REQUIRE(MidiRouter::classify(51, *inst) == MidiRouter::NoteType::Drone);
    REQUIRE(MidiRouter::classify(62, *inst) == MidiRouter::NoteType::Melody);
}
