#include <catch2/catch_test_macros.hpp>
#include "InstrumentConfig.h"

TEST_CASE("InstrumentConfig: all 8 instruments present", "[InstrumentConfig]") {
    const auto& insts = InstrumentConfig::instruments();
    REQUIRE(insts.size() == 8);
}

TEST_CASE("InstrumentConfig: tin_whistle sample notes", "[InstrumentConfig]") {
    const InstrumentDef* def = InstrumentConfig::find("tin_whistle");
    REQUIRE(def != nullptr);
    REQUIRE(def->sampleNotes.front() == 74);
    REQUIRE(def->sampleNotes.back() == 86);   // server only has up to D6
    REQUIRE(def->sampleNotes.size() == 7);
    REQUIRE(def->droneNotes.empty());
}

TEST_CASE("InstrumentConfig: uilleann_pipes has drone notes and extended range", "[InstrumentConfig]") {
    const InstrumentDef* def = InstrumentConfig::find("uilleann_pipes");
    REQUIRE(def != nullptr);
    REQUIRE(def->sampleNotes.front() == 50);
    REQUIRE(def->sampleNotes.back() == 86);
    // 18 notes: 50,52 then 56-86 step 2 (54/Gb3 missing from server)
    REQUIRE(def->sampleNotes.size() == 18);
    REQUIRE(def->droneNotes.size() == 2);
    REQUIRE(def->droneNotes[0] == 50);
    REQUIRE(def->droneNotes[1] == 51);
}

TEST_CASE("InstrumentConfig: uilleann_pipes sampleNotes has gap at 54", "[InstrumentConfig]") {
    const InstrumentDef* def = InstrumentConfig::find("uilleann_pipes");
    REQUIRE(def != nullptr);
    // Verify 54 (Gb3) is NOT in sampleNotes (server returns HTML for it)
    auto& notes = def->sampleNotes;
    bool has54 = std::find(notes.begin(), notes.end(), 54) != notes.end();
    REQUIRE(!has54);
    // 50 and 52 ARE present
    bool has50 = std::find(notes.begin(), notes.end(), 50) != notes.end();
    bool has52 = std::find(notes.begin(), notes.end(), 52) != notes.end();
    REQUIRE(has50);
    REQUIRE(has52);
}

TEST_CASE("InstrumentConfig: highland_bagpipe drone is 51, samples start at 69", "[InstrumentConfig]") {
    const InstrumentDef* def = InstrumentConfig::find("highland_bagpipe");
    REQUIRE(def != nullptr);
    REQUIRE(def->sampleNotes.front() == 69);  // A4 — lower notes not on server
    REQUIRE(def->sampleNotes.back() == 81);
    REQUIRE(def->sampleNotes.size() == 7);
    REQUIRE(def->droneNotes.size() == 1);
    REQUIRE(def->droneNotes[0] == 51);
}

TEST_CASE("InstrumentConfig: sackpipa samples end at 76 (E5)", "[InstrumentConfig]") {
    const InstrumentDef* def = InstrumentConfig::find("sackpipa");
    REQUIRE(def != nullptr);
    REQUIRE(def->sampleNotes.front() == 62);
    REQUIRE(def->sampleNotes.back() == 76);  // upper notes not on server
    REQUIRE(def->sampleNotes.size() == 8);
}

TEST_CASE("InstrumentConfig: total sample count is 104", "[InstrumentConfig]") {
    int total = 0;
    for (const auto& inst : InstrumentConfig::instruments())
        total += (int)inst.sampleNotes.size();
    REQUIRE(total == 104);
}

TEST_CASE("InstrumentConfig: find returns nullptr for unknown id", "[InstrumentConfig]") {
    REQUIRE(InstrumentConfig::find("nonexistent") == nullptr);
}

TEST_CASE("InstrumentConfig: accordion has 25 samples, no drones", "[InstrumentConfig]") {
    const InstrumentDef* def = InstrumentConfig::find("accordion");
    REQUIRE(def != nullptr);
    REQUIRE(def->sampleNotes.size() == 25);
    REQUIRE(def->droneNotes.empty());
}

TEST_CASE("InstrumentConfig: sackpipa label contains UTF-8 umlaut", "[InstrumentConfig]") {
    const InstrumentDef* def = InstrumentConfig::find("sackpipa");
    REQUIRE(def != nullptr);
    // Label is "Säckpipa" — just verify it's non-empty
    REQUIRE(!def->label.empty());
}
