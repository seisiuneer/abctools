function fixIllegalDuration(chord, nextChord, unitTime, keyLength, duration) {
  const error = keyLength.error;
  if (error != 0) {
    let abcString = "";
    if (keyLength.numerator / keyLength.denominator > 1) {
      const base = 60;
      const startTime = chord[0].startTime;
      const endTime = chord[0].endTime;
      const newDuration = base * keyLength.numerator / keyLength.denominator /
        unitTime;
      const t = chord[0].startTime + newDuration;
      chord.forEach((note) => {
        note.startTime = t;
      });
      const abc2 = chordToString(chord, nextChord, unitTime);
      chord.forEach((note) => {
        note.startTime = startTime;
        note.endTime = t;
      });
      if (abc2 == "") {
        chord.forEach((note) => note.tie = false);
      } else {
        chord.forEach((note) => note.tie = true);
      }
      const abc1 = chordToString(chord, null, unitTime);
      chord.forEach((note) => {
        note.endTime = endTime;
      });
      duration = round(duration, 1e6);
      console.log(
        `illegal duration is rounded: ${duration}, ${error}, ${abcString}`,
      );
      return abc1 + abc2;
    } else if (nextChord) {
      const diff = error / unitTime;
      if (chord[0].endTime == nextChord[0].startTime) {
        nextChord.forEach((n) => n.startTime -= diff);
      }
      chord.forEach((n) => n.endTime -= diff);
      abcString += chordToString(chord, nextChord, unitTime);
      duration = round(duration, 1e6);
      console.log(
        `illegal duration is rounded: ${duration}, ${error}, ${abcString}`,
      );
      return abcString;
    }
  }
}

function getTupletString(len1, keyLength) {
  if (tupletCount == 0 && keyLength.factor != 0) {
    tupletNum = keyLength.denominator;
    tupletCount += 1;
    return len1;
  } else if (tupletCount < tupletNum) {
    tupletCount += 1;
    if (tupletCount == tupletNum) {
      tupletCount = 0;
      tupletNum = 0;
    }
    return "";
  } else {
    return "";
  }
}

function noteToString(chord, nextChord, unitTime) {
  const note = chord[0];
  const keyString = noteToKeyString(note);
  const duration = (note.endTime - note.startTime) * unitTime;
  const keyLength = approximateKeyLength(duration);
  if (keyLength.numerator == 0) return "";
  const abc = fixIllegalDuration(
    chord,
    nextChord,
    unitTime,
    keyLength,
    duration,
  );
  if (abc) return abc;
  const [len1, len2] = calcKeyLength(keyLength);
  const tie = (note.tie) ? "-" : "";
  const tupletString = getTupletString(len1, keyLength);
  return tupletString + keyString + len2 + tie;
}

function chordToString(chord, nextChord, unitTime) {
  if (chord.length == 1 && !chord[0].splitted) {
    return noteToString(chord, nextChord, unitTime);
  } else {
    const str = chord.map((note) => {
      const tie = (note.tie) ? "-" : "";
      return noteToKeyString(note) + tie;
    }).join("");
    const n = chord[0];
    const duration = (n.endTime - n.startTime) * unitTime;
    const keyLength = approximateKeyLength(duration);
    if (keyLength.numerator == 0) return "";
    const abc = fixIllegalDuration(
      chord,
      nextChord,
      unitTime,
      keyLength,
      duration,
    );
    if (abc) return abc;
    const [len1, len2] = calcKeyLength(keyLength);
    const tupletString = getTupletString(len1, keyLength);
    return tupletString + `[${str}]` + len2;
  }
}

function noteToKeyString(note) {
  const pitch = note.pitch;
  const doremi = [
    "C",
    "^C",
    "D",
    "^D",
    "E",
    "F",
    "^F",
    "G",
    "^G",
    "A",
    "^A",
    "B",
  ];
  const baseline = pitch - 60;
  const key = baseline % 12;
  const height = Math.floor(baseline / 12);
  if (height >= 1) {
    const count = height - 1;
    let keyString = doremi.at(key).toLowerCase();
    for (let i = 0; i < count; i++) {
      keyString += "'";
    }
    return keyString;
  } else {
    const count = -height;
    let keyString = doremi.at(key);
    for (let i = 0; i < count; i++) {
      keyString += ",";
    }
    return keyString;
  }
}

function cleanupTimeSignatures(timeSignatures) {
  const map = new Map();
  timeSignatures.forEach((timeSignature) => {
    map.set(timeSignature.time, timeSignature);
  });
  const result = [];
  for (const [_time, timeSignature] of map) {
    result.push(timeSignature);
  }
  return result;
}

function cleanupTempos(tempos, totalTime) {
  const map = new Map();
  tempos.forEach((tempo) => {
    map.set(tempo.time, tempo.qpm);
  });
  const result = [];
  for (const [time, qpm] of map) {
    const tempo = { time: time, qpm: qpm, timeTo: totalTime };
    result.push(tempo);
  }
  if (result.length != 1) {
    result.slice(0, -1).forEach((tempo, i) => {
      tempo.timeTo = result[i + 1].time;
    });
    result.at(-1).timeTo = totalTime;
  }
  return result;
}

function splitTempos(notes, tempos, totalTime) {
  const result = [];
  const cleanedTempos = cleanupTempos(tempos, totalTime);
  if (cleanedTempos.length == 1) {
    return [[notes, cleanedTempos[0]]];
  }
  cleanedTempos.forEach((tempo, i) => {
    const tFrom = tempo.time;
    const tTo = tempo.timeTo;
    const filtered = notes
      .filter((n) => n.startTime < tTo)
      .filter((n) => tFrom <= n.startTime);
    result.push([filtered, cleanedTempos[i]]);
  });
  return result;
}

function splitInstruments(notes) {
  let instrument = 0;
  let pos = 0;
  const result = [];
  notes.forEach((n, i) => {
    if (n.instrument != instrument) {
      result.push(notes.slice(pos, i));
      instrument += 1;
      pos = i;
    }
  });
  result.push(notes.slice(pos));
  return result;
}

class KeyLength {
  constructor(numerator, denominator, factor, error) {
    this.numerator = numerator;
    this.denominator = denominator;
    this.factor = factor;
    this.error = error;
  }
}

function calcKeyLength(keyLength) {
  const n = keyLength.numerator;
  const d = keyLength.denominator;
  const f = keyLength.factor;
  if (n == 0) return [null, null];
  if (d == 1) {
    if (n == 1) return ["", ""];
    return ["", `${n}`];
  }
  if (f == 0) {
    if (n == 1) return ["", `/${d}`];
    return ["", `${n}/${d}`];
  }
  if (f > 0) {
    if (f == 1) return [`(${d}:${n}`, ""];
    return [`(${d}:${n}`, `/${f}`];
  } else {
    return [`(${d}:${n}`, `${-f}`];
  }
}

function approximateKeyLength(duration) {
  const base = 60;
  duration = Math.round(duration * 1e6) / 1e6;
  if (duration == base) return new KeyLength(1, 1, 0, 0);
  if (duration <= 0) {
    console.error(`duration is negative: ${duration}`);
    return new KeyLength(0, 0, 0, duration);
  }
  if (duration * 8 < base) {
    // abc.js does not support duration less than z/8.
    console.log(`duration (less than z/8) is ignored: ${duration}`);
    return new KeyLength(0, 0, 0, duration);
  }
  let n = 2;
  if (duration > base) {
    // normal note
    while (duration / n > base) n *= 2;
    if (duration / n == base) return new KeyLength(n, 1, 0, 0);
    // dotted note
    n /= 2;
    let nearestDiff = duration / n - base;
    let nearestNumerator = n;
    let nearestDenominator = 1;
    for (let p = 2; p <= 16; p *= 2) {
      const q = 2 * p - 1;
      const k = n * q / p;
      const diff = round(duration / k, 1e6) - base;
      if (diff == 0) {
        if (k == Math.round(k)) {
          return new KeyLength(k, 1, 0, 0);
        } else {
          return new KeyLength(n * q, p, 0, 0);
        }
      } else if (0 < diff && diff < nearestDiff) {
        nearestDiff = diff;
        nearestNumerator = n * q;
        nearestDenominator = p;
      }
    }
    // tuplet
    // - prime numbers only (consider speed)
    // - max denominator is 9 (limitation of abc.js)
    n *= 2;
    for (; n >= 1; n /= 2) {
      for (const i of [3, 5, 7]) {
        for (let j = 1; j <= i - 1; j++) {
          if (duration / n * i / j == base) {
            return new KeyLength(j, i, -n, 0);
          }
        }
      }
    }
    const diff = duration - base * nearestNumerator / nearestDenominator;
    return new KeyLength(nearestNumerator, nearestDenominator, 0, diff);
  } else {
    // normal note
    while (duration * n < base) n *= 2;
    if (duration * n == base) return new KeyLength(1, n, 0, 0);
    // dotted note
    let nearestDiff = duration * n - base;
    let nearestNumerator = 1;
    let nearestDenominator = n;
    for (let p = 2; p <= 16; p *= 2) {
      const q = 2 * p - 1;
      const k = q / (n * p);
      const diff = Math.abs(round(duration / k, 1e6) - base);
      if (diff == 0) {
        if (k == Math.round(k)) {
          return new KeyLength(k, 1, 0, 0);
        } else {
          return new KeyLength(q, n * p, 0, 0);
        }
      } else if (diff < nearestDiff) {
        nearestDiff = diff;
        nearestNumerator = q;
        nearestDenominator = n * p;
      }
    }
    // tuplet
    // - prime numbers only (consider speed)
    // - max denominator is 9 (limitation of abc.js)
    for (; n >= 1; n /= 2) {
      for (const i of [3, 5, 7]) {
        for (let j = 1; j <= i - 1; j++) {
          if (duration * n * i / j == base) {
            return new KeyLength(j, i, n, 0);
          }
        }
      }
    }
    const diff = duration - base * nearestNumerator / nearestDenominator;
    return new KeyLength(nearestNumerator, nearestDenominator, 0, diff);
  }
}

function splitRestDurtion(duration) {
  const base = 60;
  duration = Math.round(duration * 1e6) / 1e6;
  if (duration <= base) return [duration];
  const result = [];
  while (duration > 60) {
    let n = 2;
    while (duration / n > base) n *= 2;
    if (duration / n == base) {
      result.push(duration);
      return result;
    } else {
      const rest = n * 30;
      result.push(rest);
      duration -= rest;
    }
  }
  result.push(duration);
  return result;
}

function durationToRestString(startTime, endTime, unitTime) {
  if (startTime < endTime) {
    const duration = (endTime - startTime) * unitTime;
    let abc = "";
    splitRestDurtion(duration).forEach((d) => {
      const keyLength = approximateKeyLength(d);
      const [len1, len2] = calcKeyLength(keyLength);
      if (len2 == null) return "";
      const tupletString = getTupletString(len1, keyLength);
      abc += tupletString + "z" + len2;
    });
    return abc;
  } else {
    return "";
  }
}

function guessClef(ins) {
  const total = ins.reduce((sum, n) => {
    return sum + n.pitch;
  }, 0);
  const pitch = total / ins.length;
  if (pitch > 64) {
    return "G2";
  } else {
    return "F4";
  }
}

function cleanupTime(ns) {
  let min = Infinity;
  ns.notes.forEach((n) => {
    const startTime = n.startTime;
    if (startTime < min) min = startTime;
  });
  if (min != 0) {
    ns.notes.forEach((n) => {
      n.startTime -= min;
      n.endTime -= min;
    });
    ns.tempos.forEach((tempo) => {
      if (0 < tempo.time) tempo.time -= min;
    });
    ns.totalTime -= min;
  }
  return ns;
}

function round(x, epsilon) {
  return Math.round(x * epsilon) / epsilon;
}

function chordToTieString(chord, nextChord, unitTime, sectionLength, tempo) {
  let abcString = "";
  const endTime = chord[0].endTime;
  chord.forEach((note) => note.endTime = sectionEnd);
  if (round(sectionEnd, 1e13) == round(endTime, 1e13)) {
    chord.forEach((note) => note.tie = false);
    abcString += chordToString(chord, nextChord, unitTime);
    abcString += "|";
    if (section % 4 == 0) abcString += "\n";
    section += 1;
    sectionEnd = tempo.time + section * sectionLength;
    return abcString;
  } else {
    chord.forEach((note) => note.tie = true);
    abcString += chordToString(chord, nextChord, unitTime);
    abcString += "|";
    const count = Math.floor((endTime - chord[0].startTime) / sectionLength);
    if (section % 4 == 0) abcString += "\n";
    for (let i = 1; i < count; i++) {
      const nextSection = section + 1;
      const nextSectionEnd = tempo.time + nextSection * sectionLength;
      chord.forEach((note) => {
        note.startTime = sectionEnd;
        note.endTime = nextSectionEnd;
      });
      if (round(nextSectionEnd, 1e13) == round(endTime, 1e13)) {
        chord.forEach((note) => note.tie = false);
        abcString += chordToString(chord, nextChord, unitTime);
        abcString += "|";
        if (nextSection % 4 == 0) abcString += "\n";
        section = nextSection;
        sectionEnd = nextSectionEnd;
        return abcString;
      } else {
        chord.forEach((note) => note.tie = true);
        abcString += chordToString(chord, nextChord, unitTime);
        abcString += "|";
        if (nextSection % 4 == 0) abcString += "\n";
        section = nextSection;
        sectionEnd = nextSectionEnd;
      }
    }
    chord.forEach((note) => {
      note.startTime = sectionEnd;
      note.endTime = endTime;
      note.tie = false;
    });
    abcString += chordToString(chord, nextChord, unitTime);
    section += 1;
    sectionEnd = tempo.time + section * sectionLength;
    return abcString;
  }
}

function durationToRestStrings(
  startTime,
  endTime,
  tempo,
  unitTime,
  sectionLength,
) {
  let abcString = "";
  if (round(sectionEnd, 1e13) <= round(endTime, 1e13)) {
    let prevSectionEnd = sectionEnd;
    if (round(startTime, 1e13) < round(sectionEnd, 1e13)) {
      abcString += durationToRestString(startTime, sectionEnd, unitTime);
      abcString += "|";
      if (section % 4 == 0) abcString += "\n";
      section += 1;
      sectionEnd = tempo.time + section * sectionLength;
      const count = Math.floor((endTime - prevSectionEnd) / sectionLength);
      for (let i = 0; i < count; i++) {
        abcString += durationToRestString(prevSectionEnd, sectionEnd, unitTime);
        abcString += "|";
        if (section % 4 == 0) abcString += "\n";
        section += 1;
        prevSectionEnd = sectionEnd;
        sectionEnd = tempo.time + section * sectionLength;
      }
      abcString += durationToRestString(prevSectionEnd, endTime, unitTime);
    } else {
      if (round(sectionEnd, 1e13) == round(startTime, 1e13)) {
        abcString += "|";
        if (section % 4 == 0) abcString += "\n";
        section += 1;
        sectionEnd = tempo.time + section * sectionLength;
      }
      if (round(endTime, 1e13) < round(sectionEnd, 1e13)) {
        abcString += durationToRestString(startTime, endTime, unitTime);
      } else {
        abcString += durationToRestString(startTime, sectionEnd, unitTime);
        abcString += "|";
        if (section % 4 == 0) abcString += "\n";
        section += 1;
        prevSectionEnd = sectionEnd;
        sectionEnd = section * sectionLength;
        const count = Math.floor((endTime - prevSectionEnd) / sectionLength);
        for (let i = 0; i < count; i++) {
          abcString += durationToRestString(
            prevSectionEnd,
            sectionEnd,
            unitTime,
          );
          abcString += "|";
          if (section % 4 == 0) abcString += "\n";
          section += 1;
          prevSectionEnd = sectionEnd;
          sectionEnd = tempo.time + section * sectionLength;
        }
        abcString += durationToRestString(prevSectionEnd, endTime, unitTime);
      }
    }
  } else if (round(startTime, 1e13) < round(endTime, 1e13)) {
    abcString += durationToRestString(startTime, endTime, unitTime);
  }
  return abcString;
}

function cloneNote(note) {
  return {
    instrument: note.instrument,
    program: note.program,
    startTime: note.startTime,
    endTime: note.endTime,
    pitch: note.pitch,
    velocity: note.pitch,
    isDrum: note.isDrum,
    // tie
    // splitted
  };
}

function getTargetPosition(ns, i) {
  const endTime = ns[i].endTime;
  i += 1;
  while (ns[i] && ns[i].startTime < endTime) {
    i += 1;
  }
  return i;
}

function getNotationBreaks(ns) {
  const set = new Set();
  ns.forEach((n) => {
    set.add(n.startTime);
    set.add(n.endTime);
  });
  const arr = [...set];
  arr.sort((a, b) => {
    if (a > b) return 1;
    if (a < b) return -1;
    return 0;
  });
  return arr.slice(1);
}

function getChord(ns) {
  let i = 0;
  const result = [];
  while (ns[i]) {
    const j = getTargetPosition(ns, i);
    const target = ns.slice(i, j);
    const notationBreaks = getNotationBreaks(target);
    if (notationBreaks.length == 1) {
      result.push(target);
      i = j;
    } else {
      const endTime = ns[i].endTime;
      const targetBreaks = notationBreaks.filter((t) => t <= endTime);
      const chords = splitChord(target, targetBreaks);
      result.push(...chords);
      const nextTarget = target
        .filter((n) => endTime < n.endTime)
        .map((n) => {
          const newNote = cloneNote(n);
          newNote.startTime = endTime;
          newNote.splitted = true;
          return newNote;
        });
      ns = ns.slice(j);
      ns.unshift(...nextTarget);
      i = 0;
    }
  }
  return result;
}

function splitChord(chord, endTimes) {
  const result = [];
  endTimes.forEach((endTime, i) => {
    if (i == 0) {
      const newChord = [];
      const startTime = chord[0].startTime;
      chord.forEach((n) => {
        if (n.startTime == startTime) {
          const newNote = cloneNote(n);
          newNote.endTime = endTime;
          newNote.splitted = true;
          if (endTime < n.endTime) {
            newNote.tie = true;
          }
          newChord.push(newNote);
        }
      });
      result.push(newChord);
    } else {
      const startTime = endTimes[i - 1];
      const newChord = [];
      chord.forEach((n) => {
        if (n.startTime <= startTime && endTime <= n.endTime) {
          const newNote = cloneNote(n);
          newNote.startTime = startTime;
          newNote.endTime = endTime;
          newNote.splitted = true;
          if (endTime < n.endTime) {
            newNote.tie = true;
          }
          newChord.push(newNote);
        }
      });
      result.push(newChord);
    }
  });
  result.forEach((chord) => {
    chord.sort((a, b) => {
      if (a.tie == b.tie) return 0;
      if (a.tie) return -1;
      return 1;
    });
  });
  return result;
}

function segmentToString(ns, ins, instrumentId, tempo) {
  if (ins.length == 0) return "";
  const timeSignatures = cleanupTimeSignatures(ns.timeSignatures);
  let timeSignature = timeSignatures.shift();
  const beat = timeSignature.numerator / timeSignature.denominator;
  const unitLength = (beat < 0.75) ? 2 : 4;
  const unitTime = tempo.qpm * unitLength;
  const sectionLength = 240 / tempo.qpm * beat;
  let abcString = setInstrumentHeader(
    ins,
    instrumentId,
    unitLength,
    timeSignature,
  );
  section = 1;
  sectionEnd = tempo.time + section * sectionLength;
  timeSignature = timeSignatures.shift();

  const chords = getChord(ins);
  chords.forEach((chord, i) => {
    // TODO: irregular meter
    // start point shifts with long notes
    // if (timeSignature && chord[0].startTime >= timeSignature.time) {
    //   abcString += `\\\nM:${timeSignature.numerator}/${timeSignature.denominator}\n`;
    //   beat = timeSignature.numerator / timeSignature.denominator;
    //   sectionLength = 240 / tempo.qpm * beat;
    //   timeSignature = timeSignatures.shift();
    // }
    const nextChord = chords[i + 1];
    if (i == 0 && chord[0].startTime != tempo.time) {
      abcString += durationToRestStrings(
        tempo.time,
        chord[0].startTime,
        tempo,
        unitTime,
        sectionLength,
      );
    }
    if (round(sectionEnd, 1e13) < round(chord[0].endTime, 1e13)) {
      abcString += chordToTieString(
        chord,
        nextChord,
        unitTime,
        sectionLength,
        tempo,
      );
    } else {
      abcString += chordToString(chord, nextChord, unitTime);
    }
    if (nextChord) {
      abcString += durationToRestStrings(
        chord[0].endTime,
        nextChord[0].startTime,
        tempo,
        unitTime,
        sectionLength,
      );
    } else {
      abcString += durationToRestStrings(
        chord[0].endTime,
        tempo.timeTo,
        tempo,
        unitTime,
        sectionLength,
      );
      if (!abcString.endsWith("\n")) {
        abcString += "\n";
      }
    }
  });
  return abcString;
}

function setInstrumentHeader(ins, instrumentId, unitLength, timeSignature) {
  const numerator = timeSignature.numerator;
  const denominator = timeSignature.denominator;
  return `L:1/${4 * unitLength}
M:${numerator}/${denominator}
K:C clef=${guessClef(ins)}
V:${instrumentId + 1}
%%MIDI program ${ins[0].program}
`;
}

let tupletNum = 0;
let tupletCount = 0;
let section;
let sectionEnd;
export default function tone2abc(ns, options) {
  console.log(ns, ns.tempos.length);
  let abcString = "X:1\n";
  if (options) {
    if (options.title) abcString += `T:${options.title}\n`;
    if (options.composer) abcString += `C:${options.composer}\n`;
  }
  cleanupTime(ns);
  splitTempos(ns.notes, ns.tempos, ns.totalTime).forEach(([tns, tempo]) => {
    abcString += `Q:1/4=${Math.round(tempo.qpm)}\n`;
    splitInstruments(tns).forEach((ins, instrumentId) => {
      section = 0;
      abcString += segmentToString(ns, ins, instrumentId, tempo);
    });
  });
  return abcString;
}
