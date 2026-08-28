/**
 * ukulele_chords.js
 *
 * Beginner ukulele chord diagrams transcribed from the Ukulele Underground
 * Beginner Chord Chart:
 * https://ukuleleunderground.com/wp-content/uploads/2012/09/ukulelechordchart.pdf
 *
 * Standard re-entrant G-C-E-A tuning.
 * Data conventions:
 * - strings is always 4.
 * - frets[] are ordered G, C, E, A (left to right in the source chart).
 * - 0 = open string; positive numbers are absolute fret numbers.
 * - fingers is null because the source chart does not provide finger numbers.
 * - barre uses conventional string numbering: string 1 = A, string 4 = G.
 */

const UKULELE_CHORDS = {
  "C": {
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
  "C7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      0,
      0,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "Cm": {
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
  "Cm7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      3,
      3,
      3
    ],
    "barre": {
      "fret": 3,
      "fromString": 1,
      "toString": 4
    },
    "fingers": null
  },
  "Cmaj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      0,
      0,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "C#": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      1,
      1,
      4
    ],
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 4
    },
    "fingers": null
  },
  "C#7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      1,
      1,
      2
    ],
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 4
    },
    "fingers": null
  },
  "C#m": {
    "strings": 4,
    "baseFret": 4,
    "frets": [
      6,
      4,
      4,
      4
    ],
    "barre": {
      "fret": 4,
      "fromString": 1,
      "toString": 4
    },
    "fingers": null
  },
  "C#m7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      4,
      4,
      4,
      4
    ],
    "barre": {
      "fret": 4,
      "fromString": 1,
      "toString": 4
    },
    "fingers": null
  },
  "C#maj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      1,
      1,
      3
    ],
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 4
    },
    "fingers": null
  },
  "D": {
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
  "D7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      0,
      2,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "Dm": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      2,
      1,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "Dm7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      2,
      1,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "Dmaj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      2,
      2,
      4
    ],
    "barre": {
      "fret": 2,
      "fromString": 2,
      "toString": 4
    },
    "fingers": null
  },
  "Eb": {
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
  "Eb7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      3,
      3,
      4
    ],
    "barre": {
      "fret": 3,
      "fromString": 2,
      "toString": 4
    },
    "fingers": null
  },
  "Ebm": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      3,
      2,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "Ebm7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      3,
      2,
      4
    ],
    "barre": null,
    "fingers": null
  },
  "Ebmaj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      3,
      3,
      5
    ],
    "barre": {
      "fret": 3,
      "fromString": 2,
      "toString": 4
    },
    "fingers": null
  },
  "E": {
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
  "E7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      2,
      0,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "Em": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      4,
      3,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "Em7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      2,
      0,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "Emaj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      3,
      0,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "F": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      0,
      1,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "F7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      3,
      1,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "Fm": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      0,
      1,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "Fm7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      3,
      1,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "Fmaj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      4,
      1,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "F#": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      1,
      2,
      1
    ],
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 4
    },
    "fingers": null
  },
  "F#7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      4,
      2,
      4
    ],
    "barre": null,
    "fingers": null
  },
  "F#m": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      1,
      2,
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
      2,
      4
    ],
    "barre": null,
    "fingers": null
  },
  "F#maj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      5,
      2,
      4
    ],
    "barre": null,
    "fingers": null
  },
  "G": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      2,
      3,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "G7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      2,
      1,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "Gm": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      2,
      3,
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
      2,
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
      2,
      2,
      2
    ],
    "barre": null,
    "fingers": null
  },
  "G#": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      5,
      3,
      4,
      3
    ],
    "barre": {
      "fret": 3,
      "fromString": 1,
      "toString": 4
    },
    "fingers": null
  },
  "G#7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      3,
      2,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "G#m": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      3,
      4,
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
      3,
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
      3,
      3,
      3
    ],
    "barre": null,
    "fingers": null
  },
  "A": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      1,
      0,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "A7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      1,
      0,
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
      0,
      0,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "Am7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      0,
      0,
      0,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "Amaj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      1,
      0,
      0
    ],
    "barre": null,
    "fingers": null
  },
  "Bb": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      2,
      1,
      1
    ],
    "barre": null,
    "fingers": null
  },
  "Bb7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      2,
      1,
      1
    ],
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 4
    },
    "fingers": null
  },
  "Bbm": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      1,
      1,
      1
    ],
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 4
    },
    "fingers": null
  },
  "Bbm7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      1,
      1,
      1,
      1
    ],
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 4
    },
    "fingers": null
  },
  "Bbmaj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      2,
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
      3,
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
      3,
      2,
      2
    ],
    "barre": {
      "fret": 2,
      "fromString": 1,
      "toString": 4
    },
    "fingers": null
  },
  "Bm": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      4,
      2,
      2,
      2
    ],
    "barre": {
      "fret": 2,
      "fromString": 1,
      "toString": 4
    },
    "fingers": null
  },
  "Bm7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      2,
      2,
      2,
      2
    ],
    "barre": {
      "fret": 2,
      "fromString": 1,
      "toString": 4
    },
    "fingers": null
  },
  "Bmaj7": {
    "strings": 4,
    "baseFret": 1,
    "frets": [
      3,
      3,
      2,
      2
    ],
    "barre": {
      "fret": 2,
      "fromString": 1,
      "toString": 4
    },
    "fingers": null
  }
};

const UKULELE_CHORD_ALIASES = {
  "Db": "C#",
  "Db7": "C#7",
  "Dbm": "C#m",
  "Dbm7": "C#m7",
  "Dbmaj7": "C#maj7",
  "D#": "Eb",
  "D#7": "Eb7",
  "D#m": "Ebm",
  "D#m7": "Ebm7",
  "D#maj7": "Ebmaj7",
  "Gb": "F#",
  "Gb7": "F#7",
  "Gbm": "F#m",
  "Gbm7": "F#m7",
  "Gbmaj7": "F#maj7",
  "Ab": "G#",
  "Ab7": "G#7",
  "Abm": "G#m",
  "Abm7": "G#m7",
  "Abmaj7": "G#maj7",
  "A#": "Bb",
  "A#7": "Bb7",
  "A#m": "Bbm",
  "A#m7": "Bbm7",
  "A#maj7": "Bbmaj7"
};

function getUkuleleChordDiagram(chordName) {
  if (Object.prototype.hasOwnProperty.call(UKULELE_CHORDS, chordName)) {
    return UKULELE_CHORDS[chordName];
  }
  const alias = UKULELE_CHORD_ALIASES[chordName];
  return alias ? UKULELE_CHORDS[alias] : null;
}

if (typeof globalThis !== "undefined") {
  globalThis.UKULELE_CHORDS = UKULELE_CHORDS;
  globalThis.UKULELE_CHORD_ALIASES = UKULELE_CHORD_ALIASES;
  globalThis.getUkuleleChordDiagram = getUkuleleChordDiagram;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { UKULELE_CHORDS, UKULELE_CHORD_ALIASES, getUkuleleChordDiagram };
}
