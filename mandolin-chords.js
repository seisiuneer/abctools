/**
 * mandolin-chords.js
 *
 * Lowest-neck-position mandolin chord diagrams for standard G-D-A-E tuning,
 * low string to high string: G, D, A, e'
 *
 * Data conventions:
 * - strings is always 4.
 * - frets[] are ordered low G, D, A, high E.
 * - fingers is currently null for every built-in mandolin chord.
 *   A null fingers value means no finger numbers are drawn.
 * - 0 = open string, "x" = muted string.
 * - Shapes strongly prefer sounding both outer strings whenever those courses
 *   can play valid chord tones in a practical low-neck voicing.
 * - Among those, shapes favor minimal muting, low fret positions, compact
 *   spans, open strings, and complete chord-tone coverage.
 */

const MANDOLIN_CHORDS = {
  "C": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      2,
      3,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "Cm": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      1,
      3,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "C7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      2,
      3,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "Cm7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      1,
      3,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "Cmaj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      4,
      2,
      3,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "Csus4": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      3,
      3,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "C#": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      3,
      4,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "C#m": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      2,
      4,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "C#7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      4,
      3,
      4,
      4
    ],
    "barre": null,
    "fingers": null
  },
  "C#m7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      4,
      2,
      4,
      4
    ],
    "barre": null,
    "fingers": null
  },
  "C#maj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      5,
      3,
      4,
      4
    ],
    "barre": null,
    "fingers": null
  },
  "C#sus4": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      4,
      4,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "D": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      0,
      0,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "Dm": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      0,
      0,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "D7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      0,
      3,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "Dm7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      0,
      3,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "Dmaj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      0,
      4,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "Dsus4": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      0,
      0,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "D#": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      1,
      1,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "D#m": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      1,
      1,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "D#7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      1,
      4,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "D#m7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      1,
      4,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "D#maj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      1,
      5,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "D#sus4": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      1,
      1,
      4
    ],
    "barre": null,
    "fingers": null
  },
  "E": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      2,
      2,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "Em": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      2,
      2,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "E7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      0,
      2,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "E7_alt": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      4,
      2,
      5,
      4
    ],
    "barre": null,
    "fingers": null
  },
  "Em7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      0,
      2,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "Em7_alt": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      4,
      5,
      5,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "Emaj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      1,
      2,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "Esus4": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      2,
      2,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "F": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      3,
      3,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "Fm": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      3,
      3,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "F7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      1,
      3,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "Fm7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      1,
      3,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "Fmaj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      3,
      3,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "Fsus4": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      3,
      3,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "F#": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      4,
      4,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "F#m": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      4,
      4,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "F#7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      4,
      4,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "F#m7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      4,
      4,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "F#maj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      3,
      4,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "F#sus4": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      4,
      4,
      4,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "G": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      0,
      2,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "G_alt": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      4,
      0,
      2,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "Gm": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      0,
      1,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "G7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      0,
      2,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "Gm7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      0,
      1,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "Gmaj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      0,
      2,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "Gmaj7_alt": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      4,
      4,
      5,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "Gsus4": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      0,
      3,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "G#": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      1,
      3,
      4
    ],
    "barre": null,
    "fingers": null
  },
  "G#m": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      1,
      2,
      4
    ],
    "barre": null,
    "fingers": null
  },
  "G#7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      1,
      3,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "G#m7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      1,
      2,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "G#maj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      1,
      3,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "G#sus4": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      1,
      4,
      4
    ],
    "barre": null,
    "fingers": null
  },
  "A": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      2,
      4,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "Am": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      2,
      3,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "A7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      2,
      4,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "Am7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      2,
      3,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "Amaj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      2,
      4,
      4
    ],
    "barre": null,
    "fingers": null
  },
  "Asus4": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      0,
      0,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "A#": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      0,
      1,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "A#m": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      3,
      4,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "A#7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      0,
      1,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "A#m7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      3,
      4,
      4
    ],
    "barre": null,
    "fingers": null
  },
  "A#maj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      0,
      1,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "A#sus4": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      1,
      1,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "B": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      4,
      1,
      2,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "Bm": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      4,
      0,
      2,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "B7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      1,
      2,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "Bm7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      0,
      2,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "Bmaj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      1,
      2,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "Bsus4": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      4,
      4,
      2,
      0
    ],
    "barre": null,
    "fingers": null
  }
};

const MANDOLIN_CHORD_ALIASES = {
  "Db": "C#",
  "Dbm": "C#m",
  "Db7": "C#7",
  "Dbm7": "C#m7",
  "Dbmaj7": "C#maj7",
  "Dbsus4": "C#sus4",
  "Eb": "D#",
  "Ebm": "D#m",
  "Eb7": "D#7",
  "Ebm7": "D#m7",
  "Ebmaj7": "D#maj7",
  "Ebsus4": "D#sus4",
  "Gb": "F#",
  "Gbm": "F#m",
  "Gb7": "F#7",
  "Gbm7": "F#m7",
  "Gbmaj7": "F#maj7",
  "Gbsus4": "F#sus4",
  "Ab": "G#",
  "Abm": "G#m",
  "Ab7": "G#7",
  "Abm7": "G#m7",
  "Abmaj7": "G#maj7",
  "Absus4": "G#sus4",
  "Bb": "A#",
  "Bbm": "A#m",
  "Bb7": "A#7",
  "Bbm7": "A#m7",
  "Bbmaj7": "A#maj7",
  "Bbsus4": "A#sus4"
};

function getMandolinChordDiagram(chordName) {
  if (Object.prototype.hasOwnProperty.call(MANDOLIN_CHORDS, chordName)) {
    return MANDOLIN_CHORDS[chordName];
  }

  const alias = MANDOLIN_CHORD_ALIASES[chordName];
  return alias ? MANDOLIN_CHORDS[alias] : null;
}

if (typeof globalThis !== "undefined") {
  globalThis.MANDOLIN_CHORDS = MANDOLIN_CHORDS;
  globalThis.MANDOLIN_CHORD_ALIASES = MANDOLIN_CHORD_ALIASES;
  globalThis.getMandolinChordDiagram = getMandolinChordDiagram;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    MANDOLIN_CHORDS,
    MANDOLIN_CHORD_ALIASES,
    getMandolinChordDiagram
  };
}
