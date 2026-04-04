#pragma once
#include <string>
#include <vector>

struct InstrumentDef {
    std::string id;
    std::string label;
    std::vector<int> sampleNotes;  // all MIDI notes for which a sample exists
    std::vector<int> droneNotes;   // notes that toggle as drones (may be outside sampleNotes)
};

class InstrumentConfig {
public:
    static const std::vector<InstrumentDef>& instruments();
    static const InstrumentDef* find(const std::string& id);
};
