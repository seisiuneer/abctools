#!/usr/bin/env python3
"""Copy samples from the sibling celtic-sounds/samples/ directory into
celtic-sounds-vst/samples/ with instrument-prefixed flat filenames to
avoid BinaryData name collisions.

Source:  ../celtic-sounds/samples/<instrument>/<note>.mp3
Dest:    ./samples/<instrument>_<note>.mp3

Note: Ranges reflect what is actually available on the michaeleskin.com server.
Some notes were not recorded and the server returns an HTML page for them:
  - tin_whistle: E6-D7 not available (server returns HTML for MIDI 88-98)
  - uilleann_pipes: Gb3 not available (server returns HTML for MIDI 54)
  - highland_bagpipe/smallpipes: A3-G4 not available (only A4-A5 recorded)
  - sackpipa: Gb5-D6 not available (only D4-E5 recorded)
"""
import shutil
from pathlib import Path

NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']


def midi_to_note(midi: int) -> str:
    octave = midi // 12 - 1
    return NOTE_NAMES[midi % 12] + str(octave)


def is_valid_mp3(path: Path) -> bool:
    """Return True if the file starts with a valid MP3 magic header (not HTML)."""
    try:
        with open(path, 'rb') as fh:
            magic = fh.read(3)
        return magic in (b'ID3', b'\xff\xfb', b'\xff\xf3', b'\xff\xf2',
                         b'\xff\xe0', b'\xff\xe3', b'\xff\xfa', b'\xff\xf2')
    except OSError:
        return False


def build_notes(lo: int, hi: int, step: int) -> list:
    return list(range(lo, hi + 1, step))


# Ranges reflect notes that are actually available as valid MP3s on the server.
# Each entry: (inst_id, source_dir, note_list)
INSTRUMENTS = [
    ('tin_whistle',      'tin_whistle',      build_notes(74, 86, 2)),    # 7 samples
    ('irish_flute',      'irish_flute',      build_notes(62, 86, 2)),    # 13 samples
    # uilleann_pipes: MIDI 54 (Gb3) missing from server; explicit list skips it
    ('uilleann_pipes',   'uilleann_pipes',   [50, 52, 56, 58, 60, 62, 64, 66, 68,
                                              70, 72, 74, 76, 78, 80, 82, 84, 86]),  # 18 samples
    ('anglo_concertina', 'anglo_concertina', build_notes(48, 84, 2)),    # 19 samples
    ('accordion',        'accordion',        build_notes(36, 84, 2)),    # 25 samples
    ('highland_bagpipe', 'highland_bagpipe', build_notes(69, 81, 2)),    # 7 samples
    ('smallpipes',       'smallpipes',       build_notes(69, 81, 2)),    # 7 samples
    ('sackpipa',         'sackpipa',         build_notes(62, 76, 2)),    # 8 samples
]


def main() -> None:
    script_dir = Path(__file__).parent
    src_root = script_dir.parent.parent / 'celtic-sounds' / 'samples'
    dst_dir = script_dir.parent / 'samples'
    dst_dir.mkdir(exist_ok=True)

    total = 0
    for inst_id, source_dir, note_list in INSTRUMENTS:
        src_dir = src_root / source_dir
        count = 0
        for midi in note_list:
            note = midi_to_note(midi)
            src = src_dir / f'{note}.mp3'
            dst = dst_dir / f'{inst_id}_{note}.mp3'
            if not src.exists():
                print(f'  MISSING: {src}')
                continue
            if not is_valid_mp3(src):
                print(f'  INVALID (not MP3): {src}')
                continue
            shutil.copy2(src, dst)
            count += 1
        print(f'  {inst_id}: {count} samples')
        total += count
    print(f'Done. {total} files copied to {dst_dir}')


if __name__ == '__main__':
    main()
