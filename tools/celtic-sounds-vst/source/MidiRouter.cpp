#include "MidiRouter.h"
#include <algorithm>

MidiRouter::NoteType MidiRouter::classify(int midiNote, const InstrumentDef& inst) {
    auto it = std::find(inst.droneNotes.begin(), inst.droneNotes.end(), midiNote);
    return (it != inst.droneNotes.end()) ? MidiRouter::NoteType::Drone : MidiRouter::NoteType::Melody;
}
