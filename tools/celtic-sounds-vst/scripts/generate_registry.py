#!/usr/bin/env python3
"""Generate source/SampleRegistry.cpp — the sole file that references BinaryData:: symbols.

Run this whenever the instrument table changes.
"""
from pathlib import Path

NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']

def midi_to_note(midi: int) -> str:
    octave = midi // 12 - 1
    return NOTE_NAMES[midi % 12] + str(octave)

def to_binary_symbol(instrument_id: str, midi: int) -> str:
    """Returns the BinaryData variable name for an instrument+note pair."""
    note = midi_to_note(midi)
    filename = f"{instrument_id}_{note}.mp3"
    # JUCE replaces non-alphanumeric chars with '_'
    symbol = ''.join(c if c.isalnum() else '_' for c in filename)
    return symbol

# Mirrors the actual valid server samples (same ranges as prepare_samples.py and InstrumentConfig)
# Format: (inst_id, note_list)
INSTRUMENTS = [
    ('tin_whistle',      list(range(74, 87, 2))),           # 7 notes
    ('irish_flute',      list(range(62, 87, 2))),           # 13 notes
    ('uilleann_pipes',   [50, 52, 56, 58, 60, 62, 64, 66,  # 18 notes (54 missing)
                          68, 70, 72, 74, 76, 78, 80, 82, 84, 86]),
    ('anglo_concertina', list(range(48, 85, 2))),           # 19 notes
    ('accordion',        list(range(36, 85, 2))),           # 25 notes
    ('highland_bagpipe', list(range(69, 82, 2))),           # 7 notes
    ('smallpipes',       list(range(69, 82, 2))),           # 7 notes
    ('sackpipa',         list(range(62, 77, 2))),           # 8 notes
]

def generate() -> str:
    lines = [
        '// GENERATED FILE — do not edit by hand.',
        '// Re-generate with: python scripts/generate_registry.py',
        '//',
        '#include "SampleRegistry.h"',
        '#include <BinaryData.h>',
        '#include <unordered_map>',
        '#include <string>',
        '',
        'namespace {',
        '',
        'struct Entry { const char* data; int size; };',
        '',
        'std::unordered_map<std::string, Entry> buildTable() {',
        '    std::unordered_map<std::string, Entry> t;',
    ]

    for inst_id, note_list in INSTRUMENTS:
        for midi in note_list:
            sym = to_binary_symbol(inst_id, midi)
            key = f'{inst_id}_{midi}'
            lines.append(
                f'    t["{key}"] = {{BinaryData::{sym}, BinaryData::{sym}Size}};'
            )

    lines += [
        '    return t;',
        '}',
        '',
        'const std::unordered_map<std::string, Entry>& table() {',
        '    static auto t = buildTable();',
        '    return t;',
        '}',
        '',
        '} // namespace',
        '',
        'SampleData SampleRegistry::lookup(const std::string& instrumentId, int sampleNote) {',
        '    std::string key = instrumentId + "_" + std::to_string(sampleNote);',
        '    auto it = table().find(key);',
        '    if (it == table().end()) return {nullptr, 0};',
        '    return {it->second.data, it->second.size};',
        '}',
        '',
    ]
    return '\n'.join(lines)


if __name__ == '__main__':
    out = Path(__file__).parent.parent / 'source' / 'SampleRegistry.cpp'
    out.write_text(generate(), encoding='utf-8')
    print(f'Written: {out}')
