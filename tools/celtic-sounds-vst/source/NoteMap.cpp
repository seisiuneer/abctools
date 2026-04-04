#include "NoteMap.h"
#include <cmath>
#include <cassert>

NoteMap::Result NoteMap::lookup(int midiNote, const InstrumentDef& inst) {
    assert(!inst.sampleNotes.empty());

    // Find nearest sample note; tie-break to lower note (strict less-than update)
    int bestNote = inst.sampleNotes.front();
    int bestDist = std::abs(midiNote - bestNote);

    for (int note : inst.sampleNotes) {
        int dist = std::abs(midiNote - note);
        if (dist < bestDist) {
            bestDist = dist;
            bestNote = note;
        }
    }

    float rate = std::pow(2.0f, static_cast<float>(midiNote - bestNote) / 12.0f);
    return {bestNote, rate};
}
