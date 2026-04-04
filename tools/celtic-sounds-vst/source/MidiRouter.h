#pragma once
#include "InstrumentConfig.h"

class MidiRouter {
public:
    enum class NoteType { Melody, Drone };

    // Returns Drone if midiNote is in inst.droneNotes, Melody otherwise.
    static NoteType classify(int midiNote, const InstrumentDef& inst);
};
