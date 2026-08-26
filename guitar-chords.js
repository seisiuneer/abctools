/**
 * Guitar chord diagram data converted from:
 * https://abcplus.sourceforge.net/guitarchords.fmt
 *
 * Source: guitarchords.fmt v1.3 (May 14, 2018)
 * Original code by Jean-Francois Moine; extended/documented by Guido Gonzato.
 * Source file license: GNU GPL 2.
 *
 * Data conventions:
 * - strings is the number of strings in the chord grid (3 through 6 supported).
 * - frets[] are ordered low E, A, D, G, B, high e.
 * - built-in guitar chord fingerings are intentionally not supplied;
 *   fingers is null for every built-in chord.
 * - frets values are absolute fret numbers; 0 = open, "x" = muted.
 * - Per the source convention, an otherwise unmarked string is treated as open.
 * - baseFret is the first fret shown in the source diagram.
 * - barre uses the source guitar string numbering: 1 = high e, 6 = low E.
 * - Enharmonic flat-name entries are aliases of the source sharp-name shapes.
 */

const GUITAR_CHORDS = {
  "C": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      "x",
      3,
      2,
      0,
      1,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "Cm": {
    "strings": 6,
    "baseFret": 3,
    "frets": [
      "x",
      3,
      5,
      5,
      4,
      3
    ],
    "fingers": null,
    "barre": {
      "fret": 3,
      "fromString": 1,
      "toString": 5,
      "finger": 1
    }
  },
  "C7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      "x",
      3,
      2,
      3,
      1,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "Cm7": {
    "strings": 6,
    "baseFret": 3,
    "frets": [
      "x",
      3,
      5,
      3,
      4,
      3
    ],
    "fingers": null,
    "barre": {
      "fret": 3,
      "fromString": 1,
      "toString": 5,
      "finger": 1
    }
  },
  "Cmaj7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      "x",
      3,
      2,
      0,
      0,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "Csus4": {
    "strings": 6,
    "baseFret": 3,
    "frets": [
      "x",
      3,
      3,
      5,
      6,
      3
    ],
    "fingers": null,
    "barre": {
      "fret": 3,
      "fromString": 1,
      "toString": 5,
      "finger": 1
    }
  },
  "C#": {
    "strings": 6,
    "baseFret": 4,
    "frets": [
      4,
      4,
      6,
      6,
      6,
      4
    ],
    "fingers": null,
    "barre": {
      "fret": 4,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "C#m": {
    "strings": 6,
    "baseFret": 4,
    "frets": [
      4,
      4,
      6,
      6,
      5,
      4
    ],
    "fingers": null,
    "barre": {
      "fret": 4,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "C#7": {
    "strings": 6,
    "baseFret": 4,
    "frets": [
      0,
      4,
      5,
      4,
      5,
      4
    ],
    "fingers": null,
    "barre": {
      "fret": 4,
      "fromString": 1,
      "toString": 5,
      "finger": 1
    }
  },
  "C#m7": {
    "strings": 6,
    "baseFret": 4,
    "frets": [
      0,
      4,
      4,
      4,
      5,
      4
    ],
    "fingers": null,
    "barre": {
      "fret": 4,
      "fromString": 1,
      "toString": 5,
      "finger": 1
    }
  },
  "C#maj7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      "x",
      4,
      3,
      1,
      1,
      1
    ],
    "fingers": null,
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 3,
      "finger": 1
    }
  },
  "C#sus4": {
    "strings": 6,
    "baseFret": 4,
    "frets": [
      0,
      4,
      4,
      6,
      7,
      4
    ],
    "fingers": null,
    "barre": {
      "fret": 4,
      "fromString": 1,
      "toString": 5,
      "finger": 1
    }
  },
  "D": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      "x",
      0,
      0,
      2,
      3,
      2
    ],
    "fingers": null,
    "barre": null
  },
  "Dm": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      "x",
      0,
      0,
      2,
      3,
      1
    ],
    "fingers": null,
    "barre": null
  },
  "D7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      "x",
      0,
      0,
      2,
      1,
      2
    ],
    "fingers": null,
    "barre": null
  },
  "Dm7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      "x",
      "x",
      0,
      2,
      0,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "Dmaj7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      "x",
      "x",
      0,
      2,
      2,
      2
    ],
    "fingers": null,
    "barre": null
  },
  "Dsus4": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      "x",
      "x",
      0,
      2,
      3,
      3
    ],
    "fingers": null,
    "barre": null
  },
  "D#": {
    "strings": 6,
    "baseFret": 3,
    "frets": [
      "x",
      6,
      5,
      3,
      4,
      3
    ],
    "fingers": null,
    "barre": {
      "fret": 3,
      "fromString": 1,
      "toString": 3,
      "finger": 1
    }
  },
  "D#m": {
    "strings": 6,
    "baseFret": 6,
    "frets": [
      "x",
      6,
      8,
      8,
      7,
      6
    ],
    "fingers": null,
    "barre": {
      "fret": 6,
      "fromString": 1,
      "toString": 5,
      "finger": 1
    }
  },
  "D#7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      "x",
      "x",
      1,
      3,
      2,
      4
    ],
    "fingers": null,
    "barre": null
  },
  "D#m7": {
    "strings": 6,
    "baseFret": 6,
    "frets": [
      "x",
      6,
      8,
      6,
      7,
      6
    ],
    "fingers": null,
    "barre": {
      "fret": 6,
      "fromString": 1,
      "toString": 5,
      "finger": 1
    }
  },
  "D#maj7": {
    "strings": 6,
    "baseFret": 3,
    "frets": [
      "x",
      6,
      5,
      3,
      3,
      3
    ],
    "fingers": null,
    "barre": {
      "fret": 3,
      "fromString": 1,
      "toString": 3,
      "finger": 1
    }
  },
  "D#sus4": {
    "strings": 6,
    "baseFret": 6,
    "frets": [
      "x",
      6,
      6,
      8,
      9,
      6
    ],
    "fingers": null,
    "barre": {
      "fret": 6,
      "fromString": 1,
      "toString": 5,
      "finger": 1
    }
  },
  "E": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      0,
      2,
      2,
      1,
      0,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "Em": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      0,
      2,
      2,
      0,
      0,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "E7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      0,
      2,
      0,
      1,
      0,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "E7_alt": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      0,
      2,
      2,
      1,
      3,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "Em7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      0,
      2,
      0,
      0,
      0,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "Em7_alt": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      0,
      2,
      2,
      0,
      3,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "Emaj7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      0,
      2,
      1,
      1,
      0,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "Esus4": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      0,
      0,
      2,
      2,
      0,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "F": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      1,
      3,
      3,
      2,
      1,
      1
    ],
    "fingers": null,
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "Fm": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      1,
      3,
      3,
      1,
      1,
      1
    ],
    "fingers": null,
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "F7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      1,
      3,
      1,
      2,
      1,
      1
    ],
    "fingers": null,
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "Fm7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      1,
      3,
      1,
      1,
      1,
      1
    ],
    "fingers": null,
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "Fmaj7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      1,
      3,
      2,
      2,
      1,
      1
    ],
    "fingers": null,
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "Fsus4": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      1,
      1,
      3,
      3,
      1,
      1
    ],
    "fingers": null,
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "F#": {
    "strings": 6,
    "baseFret": 2,
    "frets": [
      2,
      4,
      4,
      3,
      2,
      2
    ],
    "fingers": null,
    "barre": {
      "fret": 2,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "F#m": {
    "strings": 6,
    "baseFret": 2,
    "frets": [
      2,
      4,
      4,
      2,
      2,
      2
    ],
    "fingers": null,
    "barre": {
      "fret": 2,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "F#7": {
    "strings": 6,
    "baseFret": 2,
    "frets": [
      2,
      4,
      2,
      3,
      2,
      2
    ],
    "fingers": null,
    "barre": {
      "fret": 2,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "F#m7": {
    "strings": 6,
    "baseFret": 2,
    "frets": [
      2,
      4,
      2,
      2,
      2,
      2
    ],
    "fingers": null,
    "barre": {
      "fret": 2,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "F#maj7": {
    "strings": 6,
    "baseFret": 2,
    "frets": [
      2,
      4,
      3,
      3,
      2,
      2
    ],
    "fingers": null,
    "barre": {
      "fret": 2,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "F#sus4": {
    "strings": 6,
    "baseFret": 2,
    "frets": [
      2,
      2,
      4,
      4,
      2,
      2
    ],
    "fingers": null,
    "barre": {
      "fret": 2,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "G": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      3,
      2,
      0,
      0,
      0,
      3
    ],
    "fingers": null,
    "barre": null
  },
  "G_alt": {
    "strings": 6,
    "baseFret": 3,
    "frets": [
      3,
      5,
      5,
      4,
      3,
      3
    ],
    "fingers": null,
    "barre": {
      "fret": 3,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "Gm": {
    "strings": 6,
    "baseFret": 3,
    "frets": [
      3,
      5,
      5,
      3,
      3,
      3
    ],
    "fingers": null,
    "barre": {
      "fret": 3,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "G7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      3,
      2,
      0,
      0,
      0,
      1
    ],
    "fingers": null,
    "barre": null
  },
  "Gm7": {
    "strings": 6,
    "baseFret": 3,
    "frets": [
      3,
      5,
      3,
      3,
      3,
      3
    ],
    "fingers": null,
    "barre": {
      "fret": 3,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "Gmaj7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      3,
      2,
      0,
      0,
      0,
      2
    ],
    "fingers": null,
    "barre": null
  },
  "Gmaj7_alt": {
    "strings": 6,
    "baseFret": 3,
    "frets": [
      3,
      5,
      4,
      4,
      3,
      3
    ],
    "fingers": null,
    "barre": {
      "fret": 3,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "Gsus4": {
    "strings": 6,
    "baseFret": 3,
    "frets": [
      3,
      3,
      5,
      5,
      3,
      3
    ],
    "fingers": null,
    "barre": {
      "fret": 3,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "G#": {
    "strings": 6,
    "baseFret": 4,
    "frets": [
      4,
      6,
      6,
      5,
      4,
      4
    ],
    "fingers": null,
    "barre": {
      "fret": 4,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "G#m": {
    "strings": 6,
    "baseFret": 4,
    "frets": [
      4,
      6,
      6,
      4,
      4,
      4
    ],
    "fingers": null,
    "barre": {
      "fret": 4,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "G#7": {
    "strings": 6,
    "baseFret": 4,
    "frets": [
      4,
      6,
      4,
      5,
      4,
      4
    ],
    "fingers": null,
    "barre": {
      "fret": 4,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "G#m7": {
    "strings": 6,
    "baseFret": 4,
    "frets": [
      4,
      6,
      4,
      4,
      4,
      4
    ],
    "fingers": null,
    "barre": {
      "fret": 4,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "G#maj7": {
    "strings": 6,
    "baseFret": 4,
    "frets": [
      4,
      6,
      5,
      5,
      4,
      4
    ],
    "fingers": null,
    "barre": {
      "fret": 4,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "G#sus4": {
    "strings": 6,
    "baseFret": 4,
    "frets": [
      4,
      4,
      6,
      6,
      4,
      4
    ],
    "fingers": null,
    "barre": {
      "fret": 4,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "A": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      0,
      0,
      2,
      2,
      2,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "Am": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      0,
      0,
      2,
      2,
      1,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "A7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      0,
      0,
      2,
      0,
      2,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "Am7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      0,
      0,
      2,
      0,
      1,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "Amaj7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      "x",
      0,
      2,
      1,
      2,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "Asus4": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      "x",
      0,
      0,
      2,
      3,
      0
    ],
    "fingers": null,
    "barre": null
  },
  "A#": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      1,
      1,
      2,
      2,
      2,
      1
    ],
    "fingers": null,
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "A#m": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      1,
      1,
      2,
      2,
      1,
      1
    ],
    "fingers": null,
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "A#7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      1,
      1,
      2,
      1,
      2,
      1
    ],
    "fingers": null,
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "A#m7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      1,
      1,
      2,
      1,
      1,
      1
    ],
    "fingers": null,
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "A#maj7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      "x",
      1,
      2,
      1,
      2,
      1
    ],
    "fingers": null,
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "A#sus4": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      "x",
      1,
      1,
      2,
      3,
      1
    ],
    "fingers": null,
    "barre": {
      "fret": 1,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "B": {
    "strings": 6,
    "baseFret": 2,
    "frets": [
      2,
      2,
      4,
      4,
      4,
      2
    ],
    "fingers": null,
    "barre": {
      "fret": 2,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "Bm": {
    "strings": 6,
    "baseFret": 2,
    "frets": [
      2,
      2,
      4,
      4,
      3,
      2
    ],
    "fingers": null,
    "barre": {
      "fret": 2,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "B7": {
    "strings": 6,
    "baseFret": 1,
    "frets": [
      "x",
      2,
      1,
      2,
      0,
      2
    ],
    "fingers": null,
    "barre": null
  },
  "Bm7": {
    "strings": 6,
    "baseFret": 2,
    "frets": [
      "x",
      2,
      4,
      2,
      3,
      2
    ],
    "fingers": null,
    "barre": {
      "fret": 2,
      "fromString": 1,
      "toString": 5,
      "finger": 1
    }
  },
  "Bmaj7": {
    "strings": 6,
    "baseFret": 2,
    "frets": [
      "x",
      2,
      4,
      3,
      4,
      2
    ],
    "fingers": null,
    "barre": {
      "fret": 2,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  },
  "Bsus4": {
    "strings": 6,
    "baseFret": 2,
    "frets": [
      "x",
      2,
      2,
      3,
      4,
      2
    ],
    "fingers": null,
    "barre": {
      "fret": 2,
      "fromString": 1,
      "toString": 6,
      "finger": 1
    }
  }
};

// Enharmonic names present in the source decoration definitions.
const GUITAR_CHORD_ALIASES = {
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

// Resolve both primary chord names and source-defined enharmonic aliases.
function getGuitarChordDiagram(chordName) {
  if (Object.prototype.hasOwnProperty.call(GUITAR_CHORDS, chordName)) {
    return GUITAR_CHORDS[chordName];
  }

  const alias = GUITAR_CHORD_ALIASES[chordName];
  return alias ? GUITAR_CHORDS[alias] : null;
}

// Browser/global use.
if (typeof globalThis !== "undefined") {
  globalThis.GUITAR_CHORDS = GUITAR_CHORDS;
  globalThis.GUITAR_CHORD_ALIASES = GUITAR_CHORD_ALIASES;
  globalThis.getGuitarChordDiagram = getGuitarChordDiagram;
}

// CommonJS use.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    GUITAR_CHORDS,
    GUITAR_CHORD_ALIASES,
    getGuitarChordDiagram
  };
}
