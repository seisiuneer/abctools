# Celtic Sounds VST3

A self-contained VST3 / Standalone instrument plugin that brings eight Celtic instruments into any DAW. All samples are embedded directly in the plugin binary — no separate installation required, though you will need to pull down the source files to build. It is intended to let you play around with the WARBL in Ableton. A note, this plugin does not let you build custom instruments like the web version.

This is a work built on the base functionality created by Michael Eskin and his work with acbtools (https://github.com/seisiuneer) and specifically his WARBL Celtic Sounds Plug-in.

**Instruments:** Tin Whistle · Irish Flute · Uilleann Pipes · Anglo Concertina · Accordion · Highland Bagpipe · Smallpipes · Säckpipa

Built with [JUCE](https://juce.com/) 8.

---

## Features

- **8-voice polyphonic sampler** with ADSR envelope, per-note pitch shifting via linear interpolation, and a one-pole brightness filter
- **Drone engine** for instruments with drone notes (Uilleann Pipes, Highland Bagpipe, Smallpipes, Säckpipa) — toggle drones independently via MIDI or the GUI, with separate drone volume control
- **Pitch controls** — Master Tune (±50 cents), Transpose (±12 semitones), Pitch Bend Range, and asymmetric Pitch Bend Up/Down Scale
- **Expression mapping** — route Breath (CC2), Volume (CC7), Expression (CC11), Brightness (CC74), Channel Pressure, Velocity, or Fixed gain to note volume
- **Session save/restore** — selected instrument and all parameters persist via APVTS state
- **104 embedded MP3 samples** covering each instrument's recorded range (chromatic-adjacent intervals)

---

## Controls

| Control | Description |
|---|---|
| Volume | Master output level |
| Brightness | One-pole lowpass cutoff (0 = dark, 1 = full) |
| Attack | ADSR attack time (0.001–2.0 s) |
| Release | ADSR release time (0.001–5.0 s) |
| Expression Source | Maps a MIDI source to note gain |
| Master Tune | Fine tune ±50 cents |
| Transpose | Shift ±12 semitones |
| PB Range | Pitch bend range in semitones (0–12) |
| PB Up / PB Down | Scale pitch bend response up and down independently |
| Drone Vol | Drone engine volume (visible on drone-capable instruments only) |

---

## Building

### Requirements

- CMake 3.22+
- Ninja (`brew install cmake ninja` on macOS, or via your package manager on Linux)
- A C++17 compiler (AppleClang on macOS, MSVC on Windows)
- Python 3 (for sample preparation)
- Git

### Steps

```bash
# Clone with submodules (JUCE is a submodule)
git clone --recurse-submodules https://github.com/oltyan/celtic-sounds-vst.git
cd celtic-sounds-vst
```

Populate the `samples/` directory. Samples are not included in the repository — see **Attribution** below for their source. Once you have the source samples (mirroring the celtic-sounds Max for Live project layout), run:

```bash
python scripts/prepare_samples.py
```

This copies and validates the 104 available MP3s into `samples/` with instrument-prefixed filenames.

Configure and build:

```bash
cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Release
cmake --build build --target CelticSounds_VST3
cmake --build build --target CelticSounds_Standalone
```

On Windows, run these from a Visual Studio x64 Developer Command Prompt.

**macOS (Apple Silicon):** To build a universal binary that works on both Intel and Apple Silicon Macs, add the architectures flag when configuring:

```bash
cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Release -DCMAKE_OSX_ARCHITECTURES="arm64;x86_64"
```

Without this flag, the plugin will only be built for your host architecture and may not load in DAWs running natively on Apple Silicon.

The VST3 bundle is output to `build/CelticSounds_artefacts/Release/VST3/Celtic Sounds.vst3`.

### Tests

Pure-logic classes (InstrumentConfig, NoteMap, MidiRouter, ExpressionMapper) are covered by Catch2 unit tests:

```bash
cmake --build build --target CelticSoundsTests
./build/CelticSoundsTests
# All tests passed (101 assertions in 30 test cases)
```

---

## Attribution

### Samples

All instrument samples used by this plugin are the derived from the work of **Michael Eskin** and are sourced from his **Celtic Sounds** web application:

> **Celtic Sounds** — https://michaeleskin.com/celtic-sounds/celtic-sounds.html

The samples cover eight traditional Irish and Scottish instruments recorded at chromatic-adjacent intervals across each instrument's playable range.

This VST3 plugin is an independent adaptation of Michael Eskin's original web-based tool. All audio content remains the work and property of their respective right holders.

---

## Known Issues

- **Uilleann Pipes drone click on loop** — A click artifact occurs at the drone loop point. This is inherent to the source sample, not a plugin bug.
- **Not tested with a WARBL** — Development and testing used a standard MIDI keyboard. Behavior with a WARBL wind controller is untested.
- **No built-in reverb** — Reverb is not included in the plugin. Add a reverb device in your DAW after the instrument track.

---

## Related

- [celtic-sounds](https://github.com/oltyan/celtic-sounds) — the Max 9 / Max for Live version of this instrument - this is abandoned as I did not have all the required licenses to build a full MAX for Live plugin. I have not tested this version in Ableton.
