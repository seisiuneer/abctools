#pragma once
#include <string>

struct SampleData {
    const char* data;  // nullptr if not found
    int size;
};

class SampleRegistry {
public:
    // Returns raw MP3 bytes for the given instrument and exact sample note.
    // Returns {nullptr, 0} if the combination doesn't exist.
    // Only valid exact sample notes (from InstrumentDef::sampleNotes) will return data.
    static SampleData lookup(const std::string& instrumentId, int sampleNote);
};
