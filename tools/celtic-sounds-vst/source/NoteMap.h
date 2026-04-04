#pragma once
#include "InstrumentConfig.h"

class NoteMap {
public:
    struct Result {
        int sampleNote;
        float rate;  // playback rate = 2^((midiNote - sampleNote) / 12)
    };

    // Returns the nearest sample note and playback rate for the given MIDI note.
    // On equidistant samples, snaps to the lower note.
    // Works for any MIDI note, including those outside the sample range.
    static Result lookup(int midiNote, const InstrumentDef& inst);
};
