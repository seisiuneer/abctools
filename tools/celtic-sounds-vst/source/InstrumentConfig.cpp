#include "InstrumentConfig.h"

static std::vector<int> buildNotes(int lo, int hi, int step) {
    std::vector<int> notes;
    for (int n = lo; n <= hi; n += step)
        notes.push_back(n);
    return notes;
}

const std::vector<InstrumentDef>& InstrumentConfig::instruments() {
    // Ranges reflect what is actually available on the michaeleskin.com server.
    // Notes the server returns HTML for (not recorded) are excluded from sampleNotes.
    static std::vector<InstrumentDef> defs = {
        {"tin_whistle",      "Tin Whistle",      buildNotes(74, 86, 2), {}},   // 7 samples; 88-98 missing
        {"irish_flute",      "Irish Flute",       buildNotes(62, 86, 2), {}},  // 13 samples
        // uilleann_pipes: MIDI 54 (Gb3) missing from server; list skips it
        {"uilleann_pipes",   "Uilleann Pipes",
            {50, 52, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86},
            {50, 51}},                                                          // 18 samples
        {"anglo_concertina", "Anglo Concertina",  buildNotes(48, 84, 2), {}},  // 19 samples
        {"accordion",        "Accordion",         buildNotes(36, 84, 2), {}},  // 25 samples
        {"highland_bagpipe", "Highland Bagpipe",  buildNotes(69, 81, 2), {51}}, // 7 samples; 57-67 missing
        {"smallpipes",       "Smallpipes",        buildNotes(69, 81, 2), {51}}, // 7 samples; 57-67 missing
        {"sackpipa",         "S\xc3\xa4" "ckpipa", buildNotes(62, 76, 2), {51}}, // 8 samples; 78-86 missing
    };
    return defs;
}

const InstrumentDef* InstrumentConfig::find(const std::string& id) {
    for (const auto& def : instruments())
        if (def.id == id) return &def;
    return nullptr;
}
