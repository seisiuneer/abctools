(function() {
"use strict";

  /*
    ABC Transcription Tools - Add Tune Backup Chords

    Integration-only module containing the chord-matching engine, settings
    dialog, The Session database reuse/indexing, progress UI, cancellation,
    and editor update workflow.
  */

  var gDatabase = null;
  var gChordIndex = null;
  var gLastStats = null;
  var gCancelRequested = false;
  var DEFAULT_KEY_MODE_SUBSTITUTION_OPTIONS = {
    Dmajor: true,
    Gmajor: true,
    Cmajor: true,
    Fmajor: true,
    Gmajor_Eminor: false,
    Amajor_Bdorian: false
  };

  var gSettings = {
    scope: "current",
    threshold: 0.75,
    fallbackMatchPercentage: 75,
    keyModeSubstitutionEnabled: true,
    keyModeSubstitutionOptions: Object.assign({}, DEFAULT_KEY_MODE_SUBSTITUTION_OPTIONS)
  };

  var NOTE_RE = /(?:\^\^|__|\^|_|=)?[A-Ga-g][,']*(?:\d+\/\d+|\d+\/|\/\d+|\d+|\/)?/y;

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function(c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
    });
  }

  function getDefaultKeyModeSubstitutionOptions() {
    return Object.assign({}, DEFAULT_KEY_MODE_SUBSTITUTION_OPTIONS);
  }

  function normalizeSavedKeyModeSubstitutionOptions(savedOptions) {
    var normalized = getDefaultKeyModeSubstitutionOptions();

    if (savedOptions && typeof savedOptions === "object") {
      Object.keys(DEFAULT_KEY_MODE_SUBSTITUTION_OPTIONS).forEach(function(key) {
        if (typeof savedOptions[key] === "boolean") {
          normalized[key] = savedOptions[key];
        }
      });
    }

    return normalized;
  }

  function loadToolSettings() {
    try {
      var saved = localStorage.getItem("abcBackupChordSolverSettings");
      if (!saved) return;
      var parsed = JSON.parse(saved);
      if (parsed && (parsed.scope === "current" || parsed.scope === "all")) {
        gSettings.scope = parsed.scope;
      }
      if (parsed && isFinite(parsed.threshold)) {
        gSettings.threshold = Math.max(0.10, Math.min(1.00, Number(parsed.threshold)));
      }
      if (parsed && isFinite(parsed.fallbackMatchPercentage)) {
        gSettings.fallbackMatchPercentage = Math.max(50, Math.min(100, Math.round(Number(parsed.fallbackMatchPercentage) / 5) * 5));
      }
      if (parsed && typeof parsed.keyModeSubstitutionEnabled === "boolean") {
        gSettings.keyModeSubstitutionEnabled = parsed.keyModeSubstitutionEnabled;
      }
      if (parsed && parsed.keyModeSubstitutionOptions) {
        gSettings.keyModeSubstitutionOptions = normalizeSavedKeyModeSubstitutionOptions(parsed.keyModeSubstitutionOptions);
      } else {
        gSettings.keyModeSubstitutionOptions = normalizeSavedKeyModeSubstitutionOptions(gSettings.keyModeSubstitutionOptions);
      }
    } catch (err) {
      console.warn("Could not load ABC Backup Chord Solver settings:", err);
    }
  }

  function saveToolSettings() {
    try {
      localStorage.setItem("abcBackupChordSolverSettings", JSON.stringify(gSettings));
    } catch (err) {
      console.warn("Could not save ABC Backup Chord Solver settings:", err);
    }
  }

  function getCurrentThresholdSetting() {
    var threshold = Number(gSettings.threshold);
    if (!isFinite(threshold)) threshold = 0.75;
    return Math.max(0.10, Math.min(1.00, threshold));
  }

  function getCurrentFallbackMatchPercentageSetting() {
    var percentage = Number(gSettings.fallbackMatchPercentage);
    if (!isFinite(percentage)) percentage = 75;
    percentage = Math.max(50, Math.min(100, Math.round(percentage / 5) * 5));
    return percentage;
  }

  function getCurrentFallbackThresholdScaleSetting() {
    return getCurrentFallbackMatchPercentageSetting() / 100;
  }

  function setProgressModalPercent(percent) {
    percent = Number(percent);
    if (!isFinite(percent)) percent = 0;
    percent = Math.max(0, Math.min(100, Math.round(percent)));

    var bar = document.getElementById("progress_modal_progress");
    var fill = document.getElementById("progress_modal_progress_fill");
    var label = document.getElementById("progress_modal_progress_label");

    if (fill) fill.style.width = percent + "%";
    if (label) label.textContent = percent + "%";
    if (bar) bar.setAttribute("aria-valuenow", String(percent));
  }

  function showProgressModal(message) {
    var overlay = document.getElementById("progress_modal_overlay");
    var status = document.getElementById("progress_modal_status");
    if (!overlay || !status) return;
    setProgressModalPercent(0);
    status.innerHTML = message || "Starting...";
    overlay.style.display = "block";
  }

  function updateProgressModal(message) {
    var status = document.getElementById("progress_modal_status");
    if (status) status.innerHTML = message;
  }

  function hideProgressModal() {
    var overlay = document.getElementById("progress_modal_overlay");
    if (overlay) overlay.style.display = "none";
    setProgressModalPercent(0);
  }

  function throwIfCancelled() {
    if (gCancelRequested) throw new Error("USER_CANCELLED");
  }

  function allowBrowserToUpdate() {
    return new Promise(function(resolve) {
      setTimeout(resolve, 0);
    });
  }

  function formatProgressTuneHeader(progressState, title) {
    return "Tune <b>" + progressState.tuneNumber + "</b> of <b>" + progressState.tuneCount +
      "</b>: <b>" + escapeHTML(title) + "</b><br>";
  }

  function normalizeMeter(m) {
    m = (m || "").trim().replace(/\s+/g, "");

    // ABC shorthand meter aliases:
    //   M:C  is common time, equivalent here to 4/4.
    //   M:C| is cut/common shorthand, but these tunebook reels/hornpipes
    //   are written as eight 1/8-note units per bar, so use the same
    //   matching and chord-placement bucket as 4/4.
    //
    // 2/2 is deliberately normalized into the same bucket as 4/4. This means:
    //   - a 2/2 input tune searches both 2/2 and 4/4 database tunes because
    //     database 2/2 and database 4/4 entries are indexed under the same key;
    //   - a 4/4 input tune can also use compatible 2/2 database material;
    //   - chord placement still lands on the start and midpoint of the measure,
    //     which are beats 1 and 2 in 2/2, and beats 1 and 3 in 4/4.
    //
    // Normalizing these aliases is important because the chord database
    // often stores the same style of tune as 4/4, while source tunebooks
    // commonly write reels and hornpipes as M:C| or 2/2.
    if (/^C$/i.test(m)) return "4/4";
    if (/^C\|$/i.test(m)) return "4/4";
    if (/^2\/2$/i.test(m)) return "4/4";

    return m;
  }

  function normalizeMode(k) {
    k = (k || "").trim();
    k = k.replace(/%.*/, "").trim();
    k = k.replace(/\s+/g, "");
    k = k.replace(/^K:/i, "");
    k = k.replace(/^(HP|Hp|hp)$/, "");
    k = k.replace(/^(none|None)$/i, "");
    k = k.replace(/([A-Ga-g])#/g, function(_, n) { return n.toUpperCase() + "#"; });
    k = k.replace(/([A-Ga-g])b/g, function(_, n) { return n.toUpperCase() + "b"; });
    k = k.replace(/^([a-g])/, function(_, n) { return n.toUpperCase(); });

    var m = k.match(/^([A-G](?:#|b)?)(.*)$/);
    if (!m) return k.toLowerCase();

    var root = m[1];
    var mode = (m[2] || "").toLowerCase();

    mode = mode.replace(/^maj(or)?$/, "major");
    mode = mode.replace(/^min(or)?$/, "minor");
    mode = mode.replace(/^m$/, "minor");
    mode = mode.replace(/^dor(ian)?$/, "dorian");
    mode = mode.replace(/^mix(olydian)?$/, "mixolydian");
    mode = mode.replace(/^aeo(lian)?$/, "aeolian");
    mode = mode.replace(/^ion(ian)?$/, "major");
    mode = mode.replace(/^phr(ygian)?$/, "phrygian");
    mode = mode.replace(/^lyd(ian)?$/, "lydian");
    mode = mode.replace(/^loc(rian)?$/, "locrian");

    if (!mode) mode = "major";
    return root + mode;
  }

  function normalizeTuneType(typeText) {
    typeText = (typeText || "").toLowerCase().trim();
    typeText = typeText.replace(/%.*/, "").trim();
    typeText = typeText.replace(/[^a-z0-9 ]+/g, " ");
    typeText = typeText.replace(/\s+/g, " ").trim();

    // Normalize common spelling and naming variants from ABC R: fields and
    // thesession.org tune-type metadata so rhythm/style buckets are useful
    // without being too fragmented.
    if (!typeText) return "";
    if (/reel/.test(typeText)) return "reel";
    if (/hornpipe/.test(typeText)) return "hornpipe";
    if (/slip\s*jig/.test(typeText)) return "slip jig";
    if (/slide/.test(typeText)) return "slide";
    if (/single\s*jig/.test(typeText)) return "single jig";
    if (/double\s*jig/.test(typeText)) return "jig";
    if (/jig/.test(typeText)) return "jig";
    if (/polka/.test(typeText)) return "polka";
    if (/waltz/.test(typeText)) return "waltz";
    if (/strathspey/.test(typeText)) return "strathspey";
    if (/barndance|barn\s*dance/.test(typeText)) return "barndance";
    if (/mazurka/.test(typeText)) return "mazurka";
    if (/march/.test(typeText)) return "march";
    if (/highland/.test(typeText)) return "highland";

    return typeText;
  }

  function getInputTuneType(header, meter) {
    var rhythm = normalizeTuneType(getHeaderValue(header, "R"));

    // Many 4/4 ABC collections omit R: even when the tune is a reel. Use reel
    // only as a rhythm-priority hint; fallback still searches the full
    // same-meter/key/mode bucket if no good reel match is found.
    if (!rhythm && normalizeMeter(meter) === "4/4") rhythm = "reel";

    return rhythm;
  }

  function getHeaderValue(tune, letter) {
    var re = new RegExp("^" + letter + ":\\s*(.*)$", "im");
    var m = tune.match(re);
    return m ? m[1].trim() : "";
  }

  function splitHeaderBody(tune) {
    var lines = tune.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    var bodyStart = lines.findIndex(function(line) {
      return !/^\s*$/.test(line) && !/^\s*[A-Za-z]:/.test(line) && !/^\s*%%/.test(line) && !/^\s*%/.test(line);
    });
    if (bodyStart < 0) return { header: tune, body: "" };
    return {
      header: lines.slice(0, bodyStart).join("\n"),
      body: lines.slice(bodyStart).join("\n")
    };
  }

  function stripABCGraceNotes(s) {
    // ABC grace notes are enclosed in curly braces, for example {B} or {BAG}.
    // They should not participate in measure matching or measure-duration math.
    return (s || "").replace(/\{[^}]*\}/g, "");
  }

  function removeABCDecorations(s, keepChords) {
    s = s || "";
    if (!keepChords) s = s.replace(/"(?:[^"\\]|\\.)*"/g, "");
    s = s.replace(/%.*$/gm, "");
    s = s.replace(/!.*?!/g, "");
    s = s.replace(/\+.*?\+/g, "");
    s = stripABCGraceNotes(s);
    s = s.replace(/\[[A-Za-z]:[^\]]*\]/g, "");
    // Leave ABC tuplets such as (3 in place here so parseMeasureText() can
    // account for their duration while still ignoring the marker as a note.
    // Roll marks (~) and other decorations are removed for matching/timing.
    s = s.replace(/[.~HLMOPSTuv]/g, "");
    return s;
  }

  function parseDuration(note) {
    var m = note.match(/(\d+\/\d+|\d+\/|\/\d+|\d+|\/)$/);
    if (!m) return 1;
    var d = m[1];
    if (/^\d+$/.test(d)) return parseInt(d, 10);
    if (d === "/") return 0.5;
    if (/^\d+\/$/.test(d)) return parseInt(d, 10) / 2;
    if (/^\/\d+$/.test(d)) return 1 / parseInt(d.slice(1), 10);
    var parts = d.split("/");
    return parseInt(parts[0], 10) / parseInt(parts[1], 10);
  }

  function normalizeNoteToken(note) {
    var m = note.match(/^((?:\^\^|__|\^|_|=)?)([A-Ga-g])([,']*)/);
    if (!m) return "";
    var acc = m[1] || "";
    var letter = m[2].toUpperCase();
    return acc + letter;
  }

  function notePitchClass(note) {
    var n = normalizeNoteToken(note);
    return n.replace(/[,']/g, "").toUpperCase();
  }

  // Return the unique contiguous note groups of the requested size.
  // These sets are calculated once when a measure is parsed and then reused
  // for every database comparison involving that measure.
  function ngrams(arr, n) {
    var set = new Set();
    for (var i = 0; i <= arr.length - n; i++) {
      set.add(arr.slice(i, i + n).join(" "));
    }
    return set;
  }

  function parseMeasureText(text) {
    var stripped = removeABCDecorations(text, false);
    var notes = [];
    var pitchClasses = [];
    var noteStartOffsets = [];
    var duration = 0;
    var tripletNotesRemaining = 0;

    for (var i = 0; i < stripped.length; i++) {
      // Handle the common ABC triplet form, for example (3ABC. With a (3
      // triplet, the following three notes take the time normally occupied by
      // two notes, so each note duration is scaled by 2/3. The (3 marker is
      // ignored for note-sequence matching but preserved in the final output.
      if (stripped[i] === "(" && /[23456789]/.test(stripped[i + 1] || "")) {
        if (stripped[i + 1] === "3") tripletNotesRemaining = 3;
        i++;
        continue;
      }

      NOTE_RE.lastIndex = i;
      var m = NOTE_RE.exec(stripped);
      if (m) {
        var token = m[0];
        var noteDuration = parseDuration(token);
        if (tripletNotesRemaining > 0) {
          noteDuration *= (2 / 3);
          tripletNotesRemaining--;
        }
        noteStartOffsets.push(duration);
        notes.push(normalizeNoteToken(token));
        pitchClasses.push(notePitchClass(token));
        duration += noteDuration;
        i = NOTE_RE.lastIndex - 1;
      }
    }
    return {
      notes: notes,
      pitchClasses: pitchClasses,
      noteStartOffsets: noteStartOffsets,
      duration: duration,
      noteString: notes.join(" "),
      pcString: pitchClasses.join(" "),

      // Precompute these once. Previously they were rebuilt for both measures
      // during every similarity comparison.
      noteBigrams: ngrams(notes, 2),
      noteTrigrams: ngrams(notes, 3)
    };
  }

  function extractChordsWithNoteIndexes(text) {
    var chords = [];
    var noteIndex = 0;
    var i = 0;
    while (i < text.length) {
      var c = text[i];

      if (c === '"') {
        var j = i + 1;
        var chord = "";
        while (j < text.length) {
          if (text[j] === '"' && text[j - 1] !== "\\") break;
          chord += text[j];
          j++;
        }
        if (j < text.length && chord.trim()) {
          chords.push({ chord: chord.trim(), noteIndex: noteIndex });
          i = j + 1;
          continue;
        }
      }

      // Grace notes do not count as real melody notes for chord placement.
      if (c === "{") {
        var graceEnd = text.indexOf("}", i + 1);
        i = (graceEnd >= 0) ? graceEnd + 1 : i + 1;
        continue;
      }

      // Tuplet markers such as (3 are timing markers, not notes.
      if (c === "(" && /[23456789]/.test(text[i + 1] || "")) {
        i += 2;
        continue;
      }

      NOTE_RE.lastIndex = i;
      var m = NOTE_RE.exec(text);
      if (m) {
        noteIndex++;
        i = NOTE_RE.lastIndex;
        continue;
      }
      i++;
    }
    return chords;
  }

  function isAllowedPlainMajorMinorChord(chord) {
    // Allow only plain uppercase-root major/minor triads, for example:
    // D, G, Em, Bbm, F#m.
    // Reject lowercase roots (d, e, am), slash chords (D/F#), power chords (D5),
    // seventh chords (D7, Dmaj7), and any other extensions or modifiers.
    chord = (chord || "").trim();
    return /^[A-G](?:#|b)?m?$/.test(chord);
  }

  function measureHasOnlyAllowedChords(measure) {
    if (!measure.chords || !measure.chords.length) return false;
    return measure.chords.every(function(c) {
      return isAllowedPlainMajorMinorChord(c.chord);
    });
  }

  function splitBodyIntoMeasures(body) {
    var measures = [];
    var prefix = "";
    var content = "";
    var i = 0;
    var barRe = /:\||\|:|\|\]|\[\||\|\||\|/y;

    function hasMusicalContent(s) {
      // Whitespace between barlines should not become its own measure.
      return /[^\s]/.test(s || "");
    }

    while (i < body.length) {
      barRe.lastIndex = i;
      var m = barRe.exec(body);
      if (m) {
        var bar = m[0];

        // If we have only whitespace before this barline, keep that whitespace
        // with the next measure. This is especially important for repeated
        // parts written on a new line, e.g. "||\n|:BAG...".
        if (!hasMusicalContent(content)) {
          prefix += content + bar;
          content = "";
          i = barRe.lastIndex;
          continue;
        }

        if (bar === "|:") {
          // "|:" both closes the previous measure and starts the next repeat
          // section. Keep a normal bar as the suffix of the previous measure,
          // then attach "|:" to the prefix of the following measure so that
          // the following real measure is correctly marked as a repeat start.
          measures.push({ prefix: prefix, content: content, suffix: "|" });
          prefix = "|:";
          content = "";
        } else {
          measures.push({ prefix: prefix, content: content, suffix: bar });
          prefix = "";
          content = "";
        }
        i = barRe.lastIndex;
      } else {
        content += body[i];
        i++;
      }
    }

    if (content.length || prefix.length) {
      measures.push({ prefix: prefix, content: content, suffix: "" });
    }
    return measures;
  }

  function getFullMeasureDuration(meter, unitNoteLength) {
    meter = normalizeMeter(meter);
    var mm = meter.match(/^(\d+)\/(\d+)$/);
    if (!mm) return 0;
    var num = parseInt(mm[1], 10);
    var den = parseInt(mm[2], 10);
    var l = parseUnitLength(unitNoteLength || "");
    if (!l) {
      // ABC default: for meter < 3/4 use 1/16, otherwise 1/8.
      l = (num / den < 0.75) ? (1 / 16) : (1 / 8);
    }
    return (num / den) / l;
  }

  function parseUnitLength(L) {
    L = (L || "").trim();
    var m = L.match(/^(\d+)\/(\d+)$/);
    if (!m) return 0;
    return parseInt(m[1], 10) / parseInt(m[2], 10);
  }

  function getAlternateEndingNumber(measurePart) {
    // ABC first/second endings are commonly written immediately after the
    // preceding barline, for example:
    //   |1 AFE D3 :|
    //   |2 AFE D2e ||
    //   [1 A2 AB :|
    //
    // splitBodyIntoMeasures() keeps the "1" or "2" marker at the start of the
    // measure content, so detect it there. Treat any numeric ending marker as
    // an ending boundary for matching, threshold, and repeated-chord handling.
    var m = String(measurePart || "").match(/^\s*\[?\s*(\d+)\s*/);
    return m ? parseInt(m[1], 10) : 0;
  }

  function buildMeasureObjects(body, meter, unitNoteLength) {
    var raw = splitBodyIntoMeasures(body);
    var full = getFullMeasureDuration(meter, unitNoteLength);
    var firstFullSeen = false;
    var measures = raw.map(function(r, idx) {
      var parsed = parseMeasureText(r.content);
      var hasNotes = parsed.notes.length > 0;
      var isFull = full ? Math.abs(parsed.duration - full) < 0.01 : hasNotes;
      var isInitialPickup = hasNotes && !firstFullSeen && full && parsed.duration < full - 0.01;
      if (isFull && hasNotes) firstFullSeen = true;
      return Object.assign({}, r, parsed, {
        index: idx,
        isFullMeasure: isFull,
        isPartialMeasure: hasNotes && full && parsed.duration < full - 0.01,
        isInitialPickup: isInitialPickup,
        isRepeatStart: /\|:/.test(r.prefix + r.suffix),
        isRepeatEnd: /:\|/.test(r.suffix || ""),
        alternateEndingNumber: getAlternateEndingNumber(r.content),
        isFirstEnding: getAlternateEndingNumber(r.content) === 1,
        isSecondEnding: getAlternateEndingNumber(r.content) === 2,
        isAlternateEnding: getAlternateEndingNumber(r.content) > 0,
        isBoundaryStart: false,
        isBoundaryEnd: false,
        chords: extractChordsWithNoteIndexes(r.content)
      });
    });

    // Add phrase-boundary metadata used when choosing candidate database
    // measures. Starts and endings of tunes/parts often have characteristic
    // chord behavior, so boundary source measures can first be compared
    // against boundary candidate measures before falling back to the general
    // measure pool.
    var musicalIndexes = [];
    measures.forEach(function(m, idx) {
      if (m.notes && m.notes.length) musicalIndexes.push(idx);
    });

    for (var mi = 0; mi < musicalIndexes.length; mi++) {
      var idx = musicalIndexes[mi];
      var m = measures[idx];
      var prev = mi > 0 ? measures[musicalIndexes[mi - 1]] : null;
      var next = mi + 1 < musicalIndexes.length ? measures[musicalIndexes[mi + 1]] : null;

      var startsAfterPickup = !!(prev && prev.isPartialMeasure && !prev.isRepeatEnd);
      var isFirstFullMeasure = m.isFullMeasure && !measures.some(function(other, otherIdx) {
        return otherIdx < idx && other.notes && other.notes.length && other.isFullMeasure;
      });

      m.isBoundaryStart = !!(isFirstFullMeasure || m.isRepeatStart || startsAfterPickup);

      // Treat first/second endings, explicit repeat endings, double/final bars,
      // and the last musical measure of the tune as ending boundaries. Also mark
      // the measure before a new repeat start as an ending boundary when it has
      // real notes. This lets alternate endings use ending-priority candidates,
      // the lower boundary threshold, and ending-specific repeated-chord restore.
      m.isBoundaryEnd = !!(
        m.isAlternateEnding ||
        m.isRepeatEnd ||
        /\|\||\|\]/.test(m.suffix || "") ||
        !next ||
        (next && next.isRepeatStart)
      );
    }

    return measures;
  }

  function stripExistingChords(text) {
    return text.replace(/"(?:[^"\\]|\\.)*"/g, "");
  }

  function normalizeInputMeterHeader(tune) {
    // Normalize ABC shorthand meters in the source tune itself, not only for
    // matching. Tunes using M:C or M:C| are processed and output as M:4/4 so
    // the generated ABC has the same meter spelling used for matching, measure
    // duration, and chord placement.
    return tune.replace(/^M:\s*(C\|?|c\|?)\s*$/gm, "M:4/4");
  }

  function removeBlankLinesFromABCBody(body) {
    // If the input contains a line that only has an ABC chord/text annotation,
    // for example "D mix", stripping existing quoted chord/text strings leaves
    // an empty notation line. Remove blank-only body lines so the solved tune
    // does not end up with an empty line between the K: tag and the notation,
    // or anywhere else in the generated notation body.
    return String(body || "").replace(/^\s*$/gm, "").replace(/\n{2,}/g, "\n").replace(/^\n+|\n+$/g, "");
  }

  function stripExistingChordsFromTune(tune) {
    // Remove any existing ABC chord symbols from the source tune before matching.
    // Header text is left alone; only the notation body is stripped. The database
    // tunes are not stripped because their chord symbols are the source material.
    var hb = splitHeaderBody(tune);
    if (!hb.body) return normalizeInputMeterHeader(tune);
    var strippedBody = removeBlankLinesFromABCBody(stripExistingChords(hb.body));
    return normalizeInputMeterHeader(hb.header + (hb.header && strippedBody ? "\n" : "") + strippedBody);
  }

  function countVoiceTags(tune) {
    var matches = (tune || "").match(/^\s*V:\s*.*$/gmi);
    return matches ? matches.length : 0;
  }

  function hasLyricsTags(tune) {
    // Skip tunes containing either body-aligned lyrics (w:) or
    // full-verse lyrics (W:). Lyrics text can contain note letters that the
    // measure parser would otherwise mistake for melody notes.
    return /^\s*[wW]:/m.test(tune || "");
  }

  function hasMidTuneKeyChange(tune) {
    var hb = splitHeaderBody(tune || "");
    if (!hb.body) return false;

    // A K: field at the start of the tune header is normal. A later K: field
    // on its own line, after the ABC body has started, means the tune changes
    // key/mode mid-tune and should be skipped.
    if (/^\s*K:\s*.*$/gmi.test(hb.body)) return true;

    // Inline key changes can appear anywhere in the notation body, for example
    // [K:G] or [K:Ador]. These also make the tune unsuitable for single-key
    // measure matching.
    return /\[\s*K:\s*[^\]]+\]/i.test(hb.body);
  }

  function getTuneSkipReason(tune) {
    if (countVoiceTags(tune) > 1) {
      return "Skipped by the Chord Solver because the tune has multiple voices";
    }
    if (hasLyricsTags(tune)) {
      return "Skipped by the Chord Solver because the tune has w: or W: lyrics tags";
    }
    if (hasMidTuneKeyChange(tune)) {
      return "Skipped by the Chord Solver because of key/mode changes mid-tune";
    }
    return "";
  }

  function isChordSolverGeneratedNoteLine(line) {
    line = String(line || "").trim();

    return /^N:\s*The Chord Solver matched this tune as .+ instead of .+\.\s*$/.test(line) ||
      /^N:\s*The original K: tag has not been changed\.\s*$/.test(line) ||
      /^N:\s*Skipped by the Chord Solver because .+\s*$/.test(line);
  }

  function removePreviousChordSolverNotes(tune) {
    // Remove only N: fields generated by this feature. This prevents repeated
    // runs from stacking duplicate or stale result notes while preserving every
    // unrelated user-supplied N: field.
    var lines = String(tune || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n");

    var removeIndexes = new Set();

    lines.forEach(function(line, index) {
      if (isChordSolverGeneratedNoteLine(line)) {
        removeIndexes.add(index);
      }
    });

    // Each generated note block is preceded by a comment-only "%" spacer.
    // Remove that spacer only when the next non-removed line is one of the
    // generated N: fields. Do not remove unrelated comments.
    removeIndexes.forEach(function(index) {
      var previousIndex = index - 1;

      while (previousIndex >= 0 &&
             removeIndexes.has(previousIndex)) {
        previousIndex--;
      }

      if (previousIndex >= 0 &&
          /^\s*%\s*$/.test(lines[previousIndex] || "")) {
        removeIndexes.add(previousIndex);
      }
    });

    return lines.filter(function(_, index) {
      return !removeIndexes.has(index);
    }).join("\n");
  }

  function appendSkipNoteToRawTune(tune, reason) {
    // Replace prior solver-generated status notes instead of stacking them.
    tune = removePreviousChordSolverNotes(tune);
    tune = (tune || "").replace(/\s+$/g, "");

    // Some tunebooks place a tune-separator marker such as %%% after the
    // notation. The skip note should belong to the tune itself, so insert it
    // before any trailing separator-only lines rather than after them.
    var trailingSeparator = "";
    var separatorMatch = tune.match(/(?:\n[ \t]*%%%[ \t]*)+$/);
    if (separatorMatch) {
      trailingSeparator = separatorMatch[0];
      tune = tune.slice(0, tune.length - trailingSeparator.length).replace(/\s+$/g, "");
    }

    // Avoid adding the same explanatory N: field again on later runs.
    // Match the complete line while allowing harmless leading/trailing spaces.
    var noteLine = "N: " + reason;
    var hasExistingNote = tune.split(/\r?\n/).some(function(line) {
      return line.trim() === noteLine;
    });

    if (hasExistingNote) {
      return tune + trailingSeparator;
    }

    return tune + "\n% \n" + noteLine + trailingSeparator;
  }

  function appendNoteToTuneEnd(tune, noteText) {
    // Replace prior solver-generated status notes instead of stacking them.
    tune = removePreviousChordSolverNotes(tune);
    tune = (tune || "").replace(/\s+$/g, "");

    var trailingSeparator = "";
    var separatorMatch = tune.match(/(?:\n[ \t]*%%%[ \t]*)+$/);
    if (separatorMatch) {
      trailingSeparator = separatorMatch[0];
      tune = tune.slice(0, tune.length - trailingSeparator.length).replace(/\s+$/g, "");
    }

    return tune + "\n% \nN: " + noteText + "\nN: The original K: tag has not been changed."+ trailingSeparator;
  }

  function formatKeyModeSubstitutionNote(selection) {
    return "The Chord Solver matched this tune as " +
      (selection && selection.alternateMode ? formatShortModeName(selection.alternateMode) : "an alternate key/mode") +
      " instead of " +
      (selection && selection.declaredMode ? formatShortModeName(selection.declaredMode) : "key/mode") +
      ".";
  }

  function getAllowedChordOffsetsForMeter(meter, unitNoteLength) {
    var full = getFullMeasureDuration(meter, unitNoteLength);
    if (!full) return [0];

    switch (normalizeMeter(meter)) {
      case "4/4":
        return [0, full / 2];          // 4/4 beats 1 and 3, and normalized 2/2 beats 1 and 2.
      case "2/4":
        return [0, full / 2];          // Beats 1 and 2.
      case "6/8":
        return [0, full / 2];          // Beats 1 and 4.
      case "9/8":
        return [0, full / 3, full * 2 / 3];  // Beats 1, 4, and 7.
      case "12/8":
        return [0, full / 4, full / 2, full * 3 / 4];  // Beats 1, 4, 7, and 10.
      case "3/4":
        return [0, full / 3, full * 2 / 3];  // Beats 1, 2, and 3.
      default:
        // For meters not explicitly listed above, only allow a chord at the
        // start of the measure. This avoids copying database chord placements
        // onto unexpected beats in less common meters.
        return [0];
    }
  }

  function nearlyEqual(a, b) {
    return Math.abs(a - b) < 0.01;
  }

  function findMatchingAllowedOffset(offset, allowedOffsets) {
    for (var i = 0; i < allowedOffsets.length; i++) {
      if (nearlyEqual(offset, allowedOffsets[i])) return allowedOffsets[i];
    }
    return null;
  }

  function findSourceNoteIndexAtOffset(sourceMeasure, offset) {
    for (var i = 0; i < sourceMeasure.noteStartOffsets.length; i++) {
      if (nearlyEqual(sourceMeasure.noteStartOffsets[i], offset)) return i;
    }
    return null;
  }

  function getCandidateChordOffset(candidateMeasure, chord) {
    if (!chord || chord.noteIndex <= 0) return 0;
    if (chord.noteIndex < candidateMeasure.noteStartOffsets.length) {
      return candidateMeasure.noteStartOffsets[chord.noteIndex];
    }
    // If a source database chord is somehow attached beyond the last note, treat
    // it as unusable for beat-restricted placement.
    return null;
  }

  function mapCandidateChordsToAllowedSourceBeats(sourceMeasure, candidateMeasure, meter, unitNoteLength, forceStartChord) {
    var allowedOffsets = getAllowedChordOffsetsForMeter(meter, unitNoteLength);
    var mapped = [];
    var firstChord = candidateMeasure.chords && candidateMeasure.chords[0] ? candidateMeasure.chords[0].chord : "";

    if (forceStartChord && firstChord) {
      mapped.push({ chord: firstChord, noteIndex: 0, forced: true });
    }

    candidateMeasure.chords.forEach(function(chord) {
      var candidateOffset = getCandidateChordOffset(candidateMeasure, chord);
      if (candidateOffset === null) return;

      var allowedOffset = findMatchingAllowedOffset(candidateOffset, allowedOffsets);
      if (allowedOffset === null) return;

      var sourceNoteIndex = findSourceNoteIndexAtOffset(sourceMeasure, allowedOffset);
      if (sourceNoteIndex === null) return;

      // Avoid duplicating the forced opening chord.
      if (forceStartChord && sourceNoteIndex === 0 && chord.chord === firstChord) return;

      mapped.push({
        chord: chord.chord,
        noteIndex: sourceNoteIndex,
        forced: false
      });
    });

    mapped.sort(function(a, b) {
      if (a.noteIndex !== b.noteIndex) return a.noteIndex - b.noteIndex;
      if (a.forced && !b.forced) return -1;
      if (!a.forced && b.forced) return 1;
      return 0;
    });

    var compact = [];
    mapped.forEach(function(chord) {
      var last = compact[compact.length - 1];
      if (!last || last.noteIndex !== chord.noteIndex || last.chord !== chord.chord || chord.forced) {
        compact.push(chord);
      }
    });

    return compact;
  }

  function getGraceAwareRealNoteInfos(text) {
    var infos = [];
    var noteIndex = 0;
    var i = 0;

    while (i < text.length) {
      var c = text[i];

      if (c === "{") {
        var graceEnd = text.indexOf("}", i + 1);
        i = (graceEnd >= 0) ? graceEnd + 1 : i + 1;
        continue;
      }

      if (c === "(" && /[23456789]/.test(text[i + 1] || "")) {
        i += 2;
        continue;
      }

      NOTE_RE.lastIndex = i;
      var m = NOTE_RE.exec(text);
      if (m) {
        var injectIndex = i;
        var before = text.slice(0, i);

        // If the real note is preceded by ABC grace notes and/or a roll mark,
        // inject the chord before those prefixes so the ornament stays attached
        // to the note, for example:
        //   {BAG}G  -> "G"{BAG}G
        //   ~G      -> "G"~G
        var ornamentPrefixMatch = before.match(/(?:\{[^}]*\}\s*|~\s*)+$/);
        if (ornamentPrefixMatch) injectIndex = i - ornamentPrefixMatch[0].length;

        infos.push({
          noteIndex: noteIndex,
          start: i,
          end: NOTE_RE.lastIndex,
          injectIndex: injectIndex
        });

        noteIndex++;
        i = NOTE_RE.lastIndex;
        continue;
      }

      i++;
    }

    return infos;
  }

  function insertChordsIntoMeasure(sourceText, candidateChords, forceStartChord) {
    if (!candidateChords || !candidateChords.length) return sourceText;

    var chords = candidateChords.slice().sort(function(a, b) { return a.noteIndex - b.noteIndex; });
    var firstChord = chords[0].chord;

    if (forceStartChord && chords[0].noteIndex !== 0) {
      chords.unshift({ chord: firstChord, noteIndex: 0, forced: true });
    }

    // Remove repeated identical chord symbols in the same measure.
    var compact = [];
    var last = null;
    chords.forEach(function(c) {
      if (c.chord !== last || c.forced) compact.push(c);
      last = c.chord;
    });
    chords = compact;

    var text = stripExistingChords(sourceText);
    var noteInfos = getGraceAwareRealNoteInfos(text);

    if (!noteInfos.length) {
      return forceStartChord ? ('"' + firstChord + '"' + text) : text;
    }

    var chordsByNoteIndex = new Map();
    chords.forEach(function(c) {
      if (!chordsByNoteIndex.has(c.noteIndex)) chordsByNoteIndex.set(c.noteIndex, []);
      chordsByNoteIndex.get(c.noteIndex).push(c.chord);
    });

    var out = "";
    var lastPos = 0;
    var insertedAny = false;

    noteInfos.forEach(function(info) {
      var noteChords = chordsByNoteIndex.get(info.noteIndex);
      if (!noteChords || !noteChords.length) return;

      var injectAt = Math.max(info.injectIndex, lastPos);

      // Preserve the source tune's existing spacing exactly. Do not trim
      // spaces before injected chord symbols and do not add any extra spaces;
      // the chord marker is inserted directly at the calculated note position.
      out += text.slice(lastPos, injectAt);
      noteChords.forEach(function(chord) {
        out += '"' + chord + '"';
        insertedAny = true;
      });
      lastPos = injectAt;
    });

    out += text.slice(lastPos);

    if (!insertedAny && forceStartChord) {
      out = '"' + firstChord + '"' + text;
    }
    return out;
  }

  function lcsLength(a, b) {
    var m = a.length, n = b.length;
    if (!m || !n) return 0;
    var prev = new Array(n + 1).fill(0);
    var curr = new Array(n + 1).fill(0);
    for (var i = 1; i <= m; i++) {
      for (var j = 1; j <= n; j++) {
        curr[j] = (a[i - 1] === b[j - 1]) ? prev[j - 1] + 1 : Math.max(prev[j], curr[j - 1]);
      }
      var t = prev; prev = curr; curr = t; curr.fill(0);
    }
    return prev[n];
  }

  function jaccard(a, b) {
    if (!a.size && !b.size) return 0;
    var inter = 0;
    a.forEach(function(x) { if (b.has(x)) inter++; });
    return inter / (a.size + b.size - inter);
  }

  function measureSimilarity(a, b) {
    if (!a.notes.length || !b.notes.length) return 0;

    // notes and pitchClasses are identical under the current normalization
    // rules, so calculate their shared LCS value only once. Keep the original
    // separate 45% and 25% operations to preserve exact floating-point
    // evaluation and candidate tie-breaking from the previous implementation.
    var sequenceLcs =
      lcsLength(a.notes, b.notes) /
      Math.max(a.notes.length, b.notes.length);

    var bi = jaccard(a.noteBigrams, b.noteBigrams);
    var tri = jaccard(a.noteTrigrams, b.noteTrigrams);
    var lenPenalty =
      Math.abs(a.notes.length - b.notes.length) /
      Math.max(a.notes.length, b.notes.length, 1);

    return (
      (sequenceLcs * 0.45) +
      (sequenceLcs * 0.25) +
      (bi * 0.20) +
      (tri * 0.10) -
      (lenPenalty * 0.10)
    );
  }

  function chordRootToPitchClass(root) {
    var pitchClasses = {
      "C": 0, "C#": 1, "Db": 1,
      "D": 2, "D#": 3, "Eb": 3,
      "E": 4,
      "F": 5, "F#": 6, "Gb": 6,
      "G": 7, "G#": 8, "Ab": 8,
      "A": 9, "A#": 10, "Bb": 10,
      "B": 11
    };
    return Object.prototype.hasOwnProperty.call(pitchClasses, root) ? pitchClasses[root] : null;
  }

  function getModeScaleIntervals(modeName) {
    modeName = (modeName || "major").toLowerCase();
    if (modeName === "minor" || modeName === "aeolian") return [0, 2, 3, 5, 7, 8, 10];
    if (modeName === "dorian") return [0, 2, 3, 5, 7, 9, 10];
    if (modeName === "mixolydian") return [0, 2, 4, 5, 7, 9, 10];
    if (modeName === "phrygian") return [0, 1, 3, 5, 7, 8, 10];
    if (modeName === "lydian") return [0, 2, 4, 6, 7, 9, 11];
    if (modeName === "locrian") return [0, 1, 3, 5, 6, 8, 10];
    return [0, 2, 4, 5, 7, 9, 11];
  }

  function getDiatonicTriadQualities(scaleIntervals) {
    return scaleIntervals.map(function(rootInterval, degreeIndex) {
      var third = (scaleIntervals[(degreeIndex + 2) % 7] + (degreeIndex + 2 >= 7 ? 12 : 0)) - rootInterval;
      var fifth = (scaleIntervals[(degreeIndex + 4) % 7] + (degreeIndex + 4 >= 7 ? 12 : 0)) - rootInterval;

      if (third === 4 && fifth === 7) return "major";
      if (third === 3 && fifth === 7) return "minor";
      if (third === 3 && fifth === 6) return "diminished";
      return "other";
    });
  }

  function parsePlainChordRootAndQuality(chord) {
    var m = String(chord || "").trim().match(/^([A-G](?:#|b)?)(m?)$/);
    if (!m) return null;
    return {
      root: m[1],
      pitchClass: chordRootToPitchClass(m[1]),
      quality: m[2] === "m" ? "minor" : "major"
    };
  }

  function getDegreePreferenceWeight(degree, modeName) {
    modeName = (modeName || "major").toLowerCase();

    // These weights are deliberately conservative. They are only used as a
    // tie-breaker between same-score or near-same-score melodic matches, not as
    // a replacement for measure similarity. They prefer common backup-chord
    // choices for the current key/mode, especially the tonic and close tonal
    // anchors, while still allowing less-common diatonic choices when they are
    // the best melodic match.
    if (modeName === "minor" || modeName === "aeolian" || modeName === "dorian") {
      var modalWeights = [12, 4, 7, 8, 7, 5, 9];
      return modalWeights[degree - 1] || 0;
    }

    if (modeName === "mixolydian") {
      var mixolydianWeights = [12, 5, 3, 8, 9, 5, 7];
      return mixolydianWeights[degree - 1] || 0;
    }

    var majorWeights = [12, 6, 2, 8, 9, 5, 3];
    return majorWeights[degree - 1] || 0;
  }

  function getChordCompatibilityScore(chord, normalizedMode) {
    var parsedChord = parsePlainChordRootAndQuality(chord);
    if (!parsedChord || parsedChord.pitchClass === null) return -8;

    var modeParts = splitNormalizedMode(normalizedMode || "");
    var tonicPc = chordRootToPitchClass(modeParts.root || "");
    if (tonicPc === null) return 0;

    var modeName = modeParts.mode || "major";
    var scaleIntervals = getModeScaleIntervals(modeName);
    var chordInterval = (parsedChord.pitchClass - tonicPc + 12) % 12;
    var degreeIndex = scaleIntervals.indexOf(chordInterval);

    if (degreeIndex < 0) {
      // Non-scale chords are not forbidden, but they should lose a tie against
      // a normal in-key backup chord when the melodic match is otherwise equal.
      return -6;
    }

    var degree = degreeIndex + 1;
    var score = getDegreePreferenceWeight(degree, modeName);
    var expectedQualities = getDiatonicTriadQualities(scaleIntervals);
    var expectedQuality = expectedQualities[degreeIndex];

    if (expectedQuality === parsedChord.quality) score += 4;
    else if (expectedQuality === "diminished") score -= 2;
    else score -= 1;

    // Give a small extra nudge to an exact tonic chord so tied matches like
    // G vs. Bm in G major prefer the more expected tonal-center chord.
    if (degree === 1) score += 2;

    return score;
  }

  function getMeasureChordCompatibilityScore(candidateMeasure, normalizedMode) {
    if (!candidateMeasure || !candidateMeasure.chords || !candidateMeasure.chords.length) return 0;

    var total = 0;
    var count = 0;
    var firstScore = null;

    candidateMeasure.chords.forEach(function(chordInfo) {
      var score = getChordCompatibilityScore(chordInfo.chord, normalizedMode);
      if (firstScore === null) firstScore = score;
      total += score;
      count++;
    });

    if (!count) return 0;

    // Average score keeps measures with more chords from automatically winning.
    // A small first-chord weighting helps with the most common case where the
    // competing measures are melodically identical but begin with different
    // backup chords.
    return (total / count) + ((firstScore || 0) * 0.25);
  }

  function tuneKey(meter, mode) {
    return normalizeMeter(meter) + "\t" + normalizeMode(mode);
  }

  function splitNormalizedMode(normalizedMode) {
    normalizedMode = normalizeMode(normalizedMode || "");
    var m = normalizedMode.match(/^([A-G](?:#|b)?)(.*)$/);
    if (!m) return { root: "", mode: normalizedMode };
    return { root: m[1], mode: (m[2] || "major") };
  }

  function formatShortModeName(normalizedMode) {
    var parsed = splitNormalizedMode(normalizedMode || "");
    var mode = (parsed.mode || "").toLowerCase();
    var abbreviations = {
      major: "maj",
      minor: "min",
      dorian: "dor",
      mixolydian: "mix",
      aeolian: "aeo",
      phrygian: "phr",
      lydian: "lyd",
      locrian: "loc"
    };
    return (parsed.root || "") + (abbreviations[mode] || mode.slice(0, 3));
  }

  function tuneKeyFromNormalizedMode(meter, normalizedMode) {
    return normalizeMeter(meter) + "\t" + normalizedMode;
  }

  function getCandidateBucketsForMeterMode(meter, mode) {
    var normalizedMeter = normalizeMeter(meter);
    var normalizedMode = normalizeMode(mode);
    var parsedMode = splitNormalizedMode(normalizedMode);
    var buckets = [{ key: tuneKeyFromNormalizedMode(normalizedMeter, normalizedMode), label: normalizedMode, primary: true }];

    // Minor and Dorian tunes are often close enough that one can provide a
    // better backup-chord source for the other. Search the exact mode first,
    // then also search the same tonic in the related minor/Dorian mode and let
    // the best measure-level score win.
    if (parsedMode.root && parsedMode.mode === "minor") {
      buckets.push({
        key: tuneKeyFromNormalizedMode(normalizedMeter, parsedMode.root + "dorian"),
        label: parsedMode.root + "dorian",
        primary: false
      });
    } else if (parsedMode.root && parsedMode.mode === "dorian") {
      buckets.push({
        key: tuneKeyFromNormalizedMode(normalizedMeter, parsedMode.root + "minor"),
        label: parsedMode.root + "minor",
        primary: false
      });
    }

    return buckets;
  }

  function getCandidatesForMeterMode(meter, mode, rhythmType) {
    rhythmType = normalizeTuneType(rhythmType || "");

    var buckets = getCandidateBucketsForMeterMode(meter, mode);
    var broadCandidates = [];
    var rhythmCandidates = [];
    var seenBroad = new Set();
    var seenRhythm = new Set();
    var usedBuckets = [];

    buckets.forEach(function(bucket) {
      var bucketCandidates = gChordIndex.get(bucket.key) || [];
      if (bucketCandidates.length) {
        var rhythmCount = rhythmType ? bucketCandidates.filter(function(c) { return c.sourceType === rhythmType; }).length : 0;
        usedBuckets.push({
          label: bucket.label,
          shortLabel: formatShortModeName(bucket.label),
          count: bucketCandidates.length,
          rhythmCount: rhythmCount,
          rhythmType: rhythmType,
          primary: bucket.primary
        });
      }

      bucketCandidates.forEach(function(candidate, idx) {
        // Candidate objects from different buckets should normally be distinct,
        // but keep this defensive de-duplication to avoid scanning the exact
        // same setting/measure twice if the database contains aliases.
        var id = (candidate.sourceSettingId || "") + "|" + (candidate.index || idx) + "|" + bucket.key;

        if (!seenBroad.has(id)) {
          seenBroad.add(id);
          broadCandidates.push(candidate);
        }

        if (rhythmType && candidate.sourceType === rhythmType && !seenRhythm.has(id)) {
          seenRhythm.add(id);
          rhythmCandidates.push(candidate);
        }
      });
    });

    return {
      candidates: broadCandidates,
      rhythmCandidates: rhythmCandidates,
      hasRhythmPreference: !!(rhythmType && rhythmCandidates.length),
      rhythmType: rhythmType,
      buckets: usedBuckets
    };
  }

  var COMMON_DECLARED_KEY_MODE_ALTERNATES = {
    "Dmajor": ["Edorian", "Bminor", "Amixolydian"],
    "Gmajor": ["Dmixolydian", "Adorian"],
    "Cmajor": ["Ddorian", "Aminor"],
    "Fmajor": ["Gdorian", "Dminor"]
  };

  function getKeyModeSubstitutionOptions(options) {
    if (options && options.keyModeSubstitutionOptions) {
      return normalizeSavedKeyModeSubstitutionOptions(options.keyModeSubstitutionOptions);
    }

    return normalizeSavedKeyModeSubstitutionOptions(gSettings.keyModeSubstitutionOptions);
  }

  function getCommonDeclaredKeyModeAlternates(normalizedMode, options) {
    normalizedMode = normalizeMode(normalizedMode || "");
    var enabledOptions = getKeyModeSubstitutionOptions(options);
    var alternates = [];

    if (enabledOptions[normalizedMode] !== false && COMMON_DECLARED_KEY_MODE_ALTERNATES[normalizedMode]) {
      alternates = COMMON_DECLARED_KEY_MODE_ALTERNATES[normalizedMode].slice();
    }

    // Advanced substitutions are deliberately separate from the normal
    // same-key-signature substitution groups so they can remain disabled by
    // default and be enabled only for source material that appears to need them.
    if (normalizedMode === "Gmajor" && enabledOptions.Gmajor_Eminor === true) {
      alternates.push("Eminor");
    }

    if (normalizedMode === "Amajor" && enabledOptions.Amajor_Bdorian === true) {
      alternates.push("Bdorian");
    }

    return alternates;
  }

  function getTrialMeasuresForKeyModeSelection(measures) {
    // Use a representative subset so the key/mode sanity check stays fast on
    // large batches. Include starts/endings when possible because those are the
    // measures where a wrong key/mode usually produces the most obvious chord
    // problems.
    var usable = (measures || []).filter(function(m) {
      return m.notes && m.notes.length && !m.isInitialPickup && !(m.isPartialMeasure && !m.isBoundaryEnd);
    });

    var prioritized = [];
    usable.forEach(function(m) {
      if (m.isBoundaryStart || m.isBoundaryEnd) prioritized.push(m);
    });
    usable.forEach(function(m) {
      if (!m.isBoundaryStart && !m.isBoundaryEnd) prioritized.push(m);
    });

    return prioritized.slice(0, 32);
  }

  function getBestTrialScoreForMeasure(sourceMeasure, candidates, normalizedMode) {
    var bestScore = 0;
    var bestCompatibility = -Infinity;

    if (!sourceMeasure || !candidates || !candidates.length) {
      return { score: 0, compatibility: 0 };
    }

    for (var i = 0; i < candidates.length; i++) {
      var c = candidates[i];
      var score = measureSimilarity(sourceMeasure, c);
      var compatibility = getMeasureChordCompatibilityScore(c, normalizedMode);

      if (score > bestScore + 0.01 ||
          (Math.abs(score - bestScore) <= 0.01 && compatibility > bestCompatibility)) {
        bestScore = score;
        bestCompatibility = compatibility;
      }
    }

    return {
      score: bestScore,
      compatibility: isFinite(bestCompatibility) ? bestCompatibility : 0
    };
  }

  function evaluateKeyModeCandidateInfo(measures, candidateInfo, normalizedMode, options) {
    var trialMeasures = getTrialMeasuresForKeyModeSelection(measures);
    var threshold = options && isFinite(options.threshold) ? options.threshold : 0.75;
    var fallbackThreshold = threshold * ((options && options.fallbackThresholdScale) || 0.75);
    var searchCandidates = (candidateInfo && candidateInfo.hasRhythmPreference) ?
      candidateInfo.rhythmCandidates :
      (candidateInfo ? candidateInfo.candidates : []);

    var matched = 0;
    var strongMatched = 0;
    var totalScore = 0;
    var totalCompatibility = 0;

    trialMeasures.forEach(function(m) {
      var trial = getBestTrialScoreForMeasure(m, searchCandidates, normalizedMode);
      if (trial.score >= fallbackThreshold) {
        matched++;
        totalScore += trial.score;
        totalCompatibility += trial.compatibility;
      }
      if (trial.score >= threshold) strongMatched++;
    });

    return {
      sampleCount: trialMeasures.length,
      matched: matched,
      strongMatched: strongMatched,
      averageScore: matched ? totalScore / matched : 0,
      averageCompatibility: matched ? totalCompatibility / matched : 0,
      candidateCount: searchCandidates.length
    };
  }

  function shouldUseAlternateKeyMode(declaredEval, alternateEval) {
    if (!alternateEval || !alternateEval.sampleCount || !alternateEval.candidateCount) return false;

    var sampleCount = alternateEval.sampleCount;
    var minimumUsefulMatches = Math.max(3, Math.ceil(sampleCount * 0.30));
    if (alternateEval.matched < minimumUsefulMatches) return false;

    declaredEval = declaredEval || { matched: 0, strongMatched: 0, averageScore: 0, averageCompatibility: 0 };

    var requiredMatchGain = Math.max(2, Math.ceil(sampleCount * 0.15));
    if (alternateEval.matched >= declaredEval.matched + requiredMatchGain) return true;

    if (alternateEval.strongMatched >= declaredEval.strongMatched + requiredMatchGain) return true;

    if (alternateEval.matched >= declaredEval.matched &&
        alternateEval.averageScore >= declaredEval.averageScore + 0.04 &&
        alternateEval.averageCompatibility >= declaredEval.averageCompatibility - 1) {
      return true;
    }

    if (alternateEval.matched === declaredEval.matched &&
        alternateEval.averageScore >= declaredEval.averageScore + 0.025 &&
        alternateEval.averageCompatibility >= declaredEval.averageCompatibility + 4) {
      return true;
    }

    return false;
  }

  function compareKeyModeEvaluations(a, b) {
    a = a || { matched: 0, strongMatched: 0, averageScore: 0, averageCompatibility: 0, candidateCount: 0 };
    b = b || { matched: 0, strongMatched: 0, averageScore: 0, averageCompatibility: 0, candidateCount: 0 };

    if (a.matched !== b.matched) return a.matched - b.matched;
    if (a.strongMatched !== b.strongMatched) return a.strongMatched - b.strongMatched;
    if (Math.abs(a.averageScore - b.averageScore) > 0.001) return a.averageScore - b.averageScore;
    if (Math.abs(a.averageCompatibility - b.averageCompatibility) > 0.001) return a.averageCompatibility - b.averageCompatibility;
    return a.candidateCount - b.candidateCount;
  }

  function selectCandidateInfoWithKeyModeSubstitution(meter, declaredMode, rhythmType, measures, options) {
    var normalizedDeclaredMode = normalizeMode(declaredMode || "");
    var selected = {
      mode: declaredMode,
      normalizedMode: normalizedDeclaredMode,
      candidateInfo: getCandidatesForMeterMode(meter, declaredMode, rhythmType),
      substituted: false,
      declaredMode: normalizedDeclaredMode,
      alternateMode: "",
      declaredEval: null,
      alternateEval: null,
      testedAlternates: []
    };

    if (!options || !options.keyModeSubstitutionEnabled) return selected;

    var alternates = getCommonDeclaredKeyModeAlternates(normalizedDeclaredMode, options);
    if (!alternates.length || !measures || !measures.length) return selected;

    selected.declaredEval = evaluateKeyModeCandidateInfo(measures, selected.candidateInfo, normalizedDeclaredMode, options || {});

    var bestAlternate = null;

    alternates.forEach(function(alternateMode) {
      var normalizedAlternateMode = normalizeMode(alternateMode);
      var alternateCandidateInfo = getCandidatesForMeterMode(meter, normalizedAlternateMode, rhythmType);
      var alternateEval = evaluateKeyModeCandidateInfo(measures, alternateCandidateInfo, normalizedAlternateMode, options || {});

      selected.testedAlternates.push({
        mode: normalizedAlternateMode,
        eval: alternateEval
      });

      if (shouldUseAlternateKeyMode(selected.declaredEval, alternateEval) &&
          (!bestAlternate || compareKeyModeEvaluations(alternateEval, bestAlternate.eval) > 0)) {
        bestAlternate = {
          mode: normalizedAlternateMode,
          candidateInfo: alternateCandidateInfo,
          eval: alternateEval
        };
      }
    });

    if (bestAlternate) {
      selected.mode = bestAlternate.mode;
      selected.normalizedMode = bestAlternate.mode;
      selected.candidateInfo = bestAlternate.candidateInfo;
      selected.substituted = true;
      selected.alternateMode = bestAlternate.mode;
      selected.alternateEval = bestAlternate.eval;
    }

    return selected;
  }

  function getBoundaryPriorityCandidates(candidates, sourceMeasure, forceStartChord) {
    if (!candidates || !candidates.length) return [];

    // When a source measure is at the start of a tune/part/repeat, first try
    // candidate measures that are also starts. When a source measure is at an
    // ending boundary, first try candidate measures that are also endings.
    // This is only a priority pass; the normal full candidate pool is still
    // searched if no boundary-specific match succeeds.
    if (forceStartChord) {
      return candidates.filter(function(c) { return c.isBoundaryStart; });
    }

    if (sourceMeasure && sourceMeasure.isBoundaryEnd) {
      return candidates.filter(function(c) { return c.isBoundaryEnd; });
    }

    return [];
  }

  function describeCandidateBuckets(candidateInfo) {
    if (!candidateInfo || !candidateInfo.buckets || !candidateInfo.buckets.length) return "";
    return candidateInfo.buckets.map(function(bucket) {
      var label = bucket.shortLabel || formatShortModeName(bucket.label);
      var s = escapeHTML(label) + ": <b>" + bucket.count + "</b>";
      if (candidateInfo.hasRhythmPreference && bucket.rhythmType) {
        s += " (" + escapeHTML(bucket.rhythmType) + ": <b>" + bucket.rhythmCount + "</b>)";
      }
      return s;
    }).join(", ");
  }

  function buildChordIndex(db) {
    var index = new Map();
    var chordedTunes = 0;
    var chordedMeasures = 0;
    var skippedKeyChangeTunes = 0;
    var skippedMultiVoiceTunes = 0;
    var skippedLyricsTunes = 0;

    db.forEach(function(t) {
      if (!t || !t.abc || !/"/.test(t.abc)) return;

      // Apply the same skip rules to database tunes that are applied to input
      // tunes. A database setting with lyrics, key/mode changes, or multiple
      // voices is not a reliable single-key/single-melody source for
      // measure-level chord transfer.
      var dbSkipReason = getTuneSkipReason(t.abc || "");
      if (dbSkipReason) {
        if (/multiple voices/.test(dbSkipReason)) skippedMultiVoiceTunes++;
        else if (/lyrics tags/.test(dbSkipReason)) skippedLyricsTunes++;
        else if (/key\/mode changes/.test(dbSkipReason)) skippedKeyChangeTunes++;
        return;
      }

      var meter = normalizeMeter(t.meter || "");
      var mode = normalizeMode(t.mode || "");
      var rhythmType = normalizeTuneType(t.type || "");
      if (!meter || !mode) return;
      var key = tuneKey(meter, mode);
      var measures = buildMeasureObjects(t.abc, meter, "").filter(function(m) {
        // Entire database measures are rejected unless every chord marker in the
        // measure is a plain uppercase-root major/minor triad. This prevents
        // copying lowercase chords, slash chords, 5 chords, 7 chords, and other
        // extended/modified chord spellings into the source tune.
        return m.notes.length && measureHasOnlyAllowedChords(m);
      }).map(function(m) {
        m.sourceName = t.name || "";
        m.sourceSettingId = t.setting_id || "";
        m.sourceType = rhythmType;
        return m;
      });
      if (!measures.length) return;
      chordedTunes++;
      chordedMeasures += measures.length;
      if (!index.has(key)) index.set(key, []);
      Array.prototype.push.apply(index.get(key), measures);
    });

    gLastStats = {
      chordedTunes: chordedTunes,
      chordedMeasures: chordedMeasures,
      keys: index.size,
      skippedKeyChangeTunes: skippedKeyChangeTunes,
      skippedMultiVoiceTunes: skippedMultiVoiceTunes,
      skippedLyricsTunes: skippedLyricsTunes
    };
    return index;
  }

  async function waitForTuneDatabaseInitialization() {
    while ((typeof gTuneDBInitComplete !== "undefined") && !gTuneDBInitComplete) {
      throwIfCancelled();
      await new Promise(function(resolve) { setTimeout(resolve, 100); });
    }
  }

  function readTheSessionDatabaseFromIndexedDB() {
    return new Promise(function(resolve) {
      if (typeof window.getTuneDatabase_DB !== "function") {
        resolve(null);
        return;
      }

      window.getTuneDatabase_DB(true, function(theTunes) {
        if (theTunes && theTunes.length && Array.isArray(theTunes[0])) {
          resolve(theTunes[0]);
        } else {
          resolve(null);
        }
      });
    });
  }

  async function fetchAndSaveTheSessionDatabase() {
    if (typeof fetchTuneDatabaseJSON !== "function" ||
        typeof TUNE_DB2_URL === "undefined" ||
        typeof TUNE_DB2_DATA_VERSION === "undefined") {
      throw new Error("The ABC Tools tune database loader is not available.");
    }

    var json = await fetchTuneDatabaseJSON(TUNE_DB2_URL, TUNE_DB2_DATA_VERSION);
    if (!Array.isArray(json)) throw new Error("The tune database did not contain a JSON array.");

    if (typeof window.saveTuneDatabase_DB === "function") {
      window.saveTuneDatabase_DB(json, true, {
        dataVersion: TUNE_DB2_DATA_VERSION,
        url: TUNE_DB2_URL,
        savedAt: new Date().toISOString()
      });
    }

    return json;
  }

  async function loadDatabase() {
    if (window.gTheChordMatchingParsedDatabase && window.gTheChordMatchingIndex) {
      gDatabase = window.gTheChordMatchingParsedDatabase;
      gChordIndex = window.gTheChordMatchingIndex;
      gLastStats = window.gTheChordMatchingIndexStats || gLastStats;
      return;
    }

    await waitForTuneDatabaseInitialization();

    if (Array.isArray(window.gTheFolkFriendDatabase)) {
      gDatabase = window.gTheFolkFriendDatabase;
    } else {
      gDatabase = await readTheSessionDatabaseFromIndexedDB();

      if (!gDatabase) {
        gDatabase = await fetchAndSaveTheSessionDatabase();
      }

      // Reuse the same in-memory global used by the Tune Search Engine.
      window.gTheFolkFriendDatabase = gDatabase;
    }

    if (!Array.isArray(gDatabase)) throw new Error("The tune database did not contain a JSON array.");

    gChordIndex = buildChordIndex(gDatabase);

    // Keep both the parsed database and its chord index for later runs in this session.
    window.gTheChordMatchingParsedDatabase = gDatabase;
    window.gTheChordMatchingIndex = gChordIndex;
    window.gTheChordMatchingIndexStats = gLastStats;
  }

  async function findBestMeasureMatchAsync(sourceMeasure, candidates, threshold, progress, normalizedMode) {
    var best = null;
    var bestScore = 0;
    var bestChordCompatibilityScore = -Infinity;
    var lastYield = performance.now();

    // Normal measures keep a tight tie-break window so melody similarity stays
    // dominant. For tune/part/repeat starts, allow a slightly wider near-tie
    // window so the key/mode chord-compatibility check can prefer a stronger
    // opening chord, for example Em over C at the start of the B part of an
    // E Dorian tune when the melody scores are close.
    var tieBreakEpsilon = (sourceMeasure && sourceMeasure.isBoundaryStart) ? 0.025 : 0.01;

    for (var i = 0; i < candidates.length; i++) {
      throwIfCancelled();
      var c = candidates[i];
      var score = measureSimilarity(sourceMeasure, c);
      var chordCompatibilityScore = getMeasureChordCompatibilityScore(c, normalizedMode);

      if (
        !best ||
        score > bestScore + tieBreakEpsilon ||
        (
          Math.abs(score - bestScore) <= tieBreakEpsilon &&
          (bestScore < threshold || score >= threshold) &&
          chordCompatibilityScore > bestChordCompatibilityScore + 0.001
        )
      ) {
        bestScore = score;
        bestChordCompatibilityScore = chordCompatibilityScore;
        best = c;
      }

      var now = performance.now();
      if (now - lastYield > 100) {
        if (progress) progress(i + 1, candidates.length, bestScore);
        await allowBrowserToUpdate();
        lastYield = performance.now();
      }
    }

    if (progress) progress(candidates.length, candidates.length, bestScore);
    if (!best || bestScore < threshold) return null;
    return { measure: best, score: bestScore, chordCompatibilityScore: bestChordCompatibilityScore };
  }

  function getEffectiveMeasureThreshold(baseThreshold, forceBoundaryThreshold, options) {
    baseThreshold = isFinite(baseThreshold) ? baseThreshold : 0.75;

    // Normal measures first try the user's requested threshold. Since the
    // matching pass already finds the best candidate measure, accepting a best
    // match down to this fallback value is equivalent to doing a second pass
    // only when the normal threshold fails, but avoids scanning the candidate
    // bucket twice.
    var generalFallbackThreshold = baseThreshold * (options.fallbackThresholdScale || 0.75);

    // Critical boundaries use the existing more permissive threshold so starts,
    // endings, and repeat/part boundaries have the best chance of getting an
    // explicit marker when any usable match exists.
    if (forceBoundaryThreshold) {
      return Math.min(baseThreshold, options.boundaryThreshold || 0.35);
    }

    return Math.min(baseThreshold, generalFallbackThreshold);
  }

  async function processTuneAsync(tune, options, progressState) {
    // Remove stale solver notes before skip tests, measure parsing, or matching.
    // This also prevents the text in those N: fields from being read as notes.
    var rawTune = removePreviousChordSolverNotes(tune);
    tune = rawTune;
    var skipReason = getTuneSkipReason(rawTune);
    if (skipReason) {
      var rawTitle = getHeaderValue(rawTune, "T") || "Untitled";
      if (progressState) {
        updateProgressModal(
          formatProgressTuneHeader(progressState, rawTitle) +
          "Matching chords...<br>" +
          escapeHTML(skipReason) + "."
        );
        await allowBrowserToUpdate();
      }
      return {
        text: appendSkipNoteToRawTune(rawTune, skipReason),
        stats: { title: rawTitle, matched: 0, total: 0, skippedPickup: 0, fallbackMatched: 0, rhythmFallbackMatched: 0, candidates: 0, rhythmCandidates: 0, candidateBuckets: [], skippedTune: true, skipReason: skipReason }
      };
    }

    tune = stripExistingChordsFromTune(tune);
    var hb = splitHeaderBody(tune);
    var meter = getHeaderValue(hb.header, "M") || "4/4";
    var mode = getHeaderValue(hb.header, "K");
    var unitLength = getHeaderValue(hb.header, "L");
    var title = getHeaderValue(hb.header, "T") || "Untitled";
    var rhythmType = getInputTuneType(hb.header, meter);
    var measures = buildMeasureObjects(hb.body, meter, unitLength);
    var keyModeSelection = selectCandidateInfoWithKeyModeSubstitution(meter, mode, rhythmType, measures, options);
    var selectedModeForMatching = keyModeSelection.normalizedMode || normalizeMode(mode);
    var candidateInfo = keyModeSelection.candidateInfo;
    var broadCandidates = candidateInfo.candidates;
    var rhythmCandidates = candidateInfo.rhythmCandidates;
    var compatibleCandidateCount = candidateInfo.hasRhythmPreference ?
      rhythmCandidates.length :
      broadCandidates.length;
    var candidateBucketSummary = describeCandidateBuckets(candidateInfo);
    if (keyModeSelection.testedAlternates && keyModeSelection.testedAlternates.length) {
      var testedModes = keyModeSelection.testedAlternates.map(function(item) {
        return formatShortModeName(item.mode);
      }).join(", ");

      var substitutionSummary = escapeHTML(formatShortModeName(keyModeSelection.declaredMode)) +
        " → " + escapeHTML(testedModes);

      if (keyModeSelection.substituted) {
        substitutionSummary += "; using " + escapeHTML(formatShortModeName(keyModeSelection.alternateMode));
      }

      candidateBucketSummary = substitutionSummary +
        (candidateBucketSummary ? "; " + candidateBucketSummary : "");
    }

    if (progressState && hb.body.trim() && broadCandidates.length) {
      updateProgressModal(
        formatProgressTuneHeader(progressState, title) +
        "Matching against <b>" + compatibleCandidateCount + "</b> compatible database measures...<br>" +
        "Measures matched so far: <b>" + progressState.totalMatched + "</b>"
      );
      await allowBrowserToUpdate();
    }

    if (!hb.body.trim() || !broadCandidates.length) {
      if (progressState) {
        var noCandidateMeasureCount = measures.filter(function(m) { return m.notes && m.notes.length; }).length;
        progressState.completedMeasures += noCandidateMeasureCount;
        updateProgressModal(
          formatProgressTuneHeader(progressState, title) +
          "Matching chords...<br>" +
          "No compatible same-meter chord candidates were found for this tune."
        );
        setProgressModalPercent(progressState.totalMeasuresToMatch ?
          Math.round((progressState.completedMeasures / progressState.totalMeasuresToMatch) * 100) : 100);
        await allowBrowserToUpdate();
      }
      return { text: tune, stats: { title: title, matched: 0, total: 0, skippedPickup: 0, candidates: broadCandidates.length, rhythmCandidates: rhythmCandidates.length, rhythmFallbackMatched: 0, candidateBuckets: [], keyModeSubstitution: keyModeSelection.substituted ? keyModeSelection : null } };
    }

    var matched = 0;
    var total = 0;
    var skippedPickup = 0;
    var fallbackMatched = 0;
    var rhythmFallbackMatched = 0;
    var lastChord = "";
    var firstChordInserted = false;
    var outParts = [];
    var totalMeasureCount = measures.filter(function(m) { return m.notes.length > 0; }).length;
    var processedMeasureCount = 0;
    var forceNextFullMeasureChord = false;

    for (var mi = 0; mi < measures.length; mi++) {
      throwIfCancelled();
      var m = measures[mi];

      if (!m.notes.length) {
        outParts.push(m.prefix + m.content + m.suffix);
        continue;
      }

      total++;
      processedMeasureCount++;

      if (m.isInitialPickup) {
        skippedPickup++;
        outParts.push(m.prefix + stripExistingChords(m.content) + m.suffix);
        continue;
      }

      // Do not inject chords on short pickup notes that lead into the next full
      // phrase or repeated part. The exception is a partial measure that is an
      // ending boundary, including first/second endings, repeat endings,
      // double/final endings, or the last musical measure. Those measures are
      // allowed to carry an explicit chord marker when a match is found.
      //
      // When such a pickup is skipped, force an explicit chord on the next full
      // measure. This handles common ABC like ":| d|ea...", where the single
      // pickup note belongs to the new part but should not itself be chorded.
      if (m.isPartialMeasure && !m.isBoundaryEnd) {
        skippedPickup++;
        forceNextFullMeasureChord = true;
        outParts.push(m.prefix + stripExistingChords(m.content) + m.suffix);
        continue;
      }

      var forceStartChord = !firstChordInserted || m.isRepeatStart || forceNextFullMeasureChord;
      var forceBoundaryThreshold = forceStartChord || m.isBoundaryEnd;
      var normalThreshold = options.threshold;
      var relaxedThreshold = getEffectiveMeasureThreshold(normalThreshold, forceBoundaryThreshold, options);
      var best = null;

      async function runSearchPass(candidates, threshold, label, isRhythmFallbackPass) {
        if (!candidates || !candidates.length) return null;

        return await findBestMeasureMatchAsync(
          m,
          candidates,
          threshold,
          function(candidateDone, candidateTotal, bestScore) {
            var overallPercent = progressState.totalMeasuresToMatch ?
              Math.round(((progressState.completedMeasures + processedMeasureCount - 1) / progressState.totalMeasuresToMatch) * 100) : 0;
            setProgressModalPercent(overallPercent);

            updateProgressModal(
              formatProgressTuneHeader(progressState, title) +
              "Matching chords...<br>" +
              (candidateBucketSummary ? "Candidate keys/modes: " + candidateBucketSummary + "<br>" : "") +
              "Measure <b>" + processedMeasureCount + "</b> of <b>" + totalMeasureCount + "</b> in this tune<br/>" +
              "Database candidates checked <b>" + candidateDone + "</b> of <b>" + candidateTotal + "</b><br>" +
              "Measure matches so far: <b>" + (progressState.totalMatched + matched) + "</b>; " +
              (isRhythmFallbackPass ?
                ("Rhythm fallbacks: <b>" + ((progressState.totalRhythmFallbackMatched || 0) + rhythmFallbackMatched) + "</b>") :
                ("Fallback matches: <b>" + ((progressState.totalFallbackMatched || 0) + fallbackMatched) + "</b>")) +
              "<br/>Current best score: <b>" + bestScore.toFixed(3) + "</b>"
            );
          },
          selectedModeForMatching
        );
      }

      async function runOriginalThenRelaxed(candidates, baseLabel, isRhythmFallbackPass) {
        var passBest = await runSearchPass(candidates, normalThreshold, baseLabel, isRhythmFallbackPass);
        if (!passBest && relaxedThreshold < normalThreshold) {
          passBest = await runSearchPass(candidates, relaxedThreshold, baseLabel + " loosened threshold", isRhythmFallbackPass);
        }
        return passBest;
      }

      async function runBoundaryAwareSearch(candidates, baseLabel, isRhythmFallbackPass) {
        var boundaryCandidates = getBoundaryPriorityCandidates(candidates, m, forceStartChord);
        if (boundaryCandidates.length && boundaryCandidates.length < candidates.length) {
          var boundaryLabel = baseLabel + (forceStartChord ? " start-boundary priority" : " end-boundary priority");
          var boundaryBest = await runOriginalThenRelaxed(boundaryCandidates, boundaryLabel, isRhythmFallbackPass);
          if (boundaryBest) return boundaryBest;
        }

        return await runOriginalThenRelaxed(candidates, baseLabel, isRhythmFallbackPass);
      }

      var searchCandidates = candidateInfo.hasRhythmPreference ? rhythmCandidates : broadCandidates;
      var searchLabel = candidateInfo.hasRhythmPreference ? (rhythmType + " rhythm-priority") : "same meter/key/mode";

      best = await runBoundaryAwareSearch(searchCandidates, searchLabel, false);

      if (!best && candidateInfo.hasRhythmPreference && broadCandidates.length > rhythmCandidates.length) {
        var fallbackGroups = [];

        // For reels, prefer hornpipes as the first rhythm fallback before
        // trying the rest of the compatible 4/4 meter/key/mode bucket. Reels
        // and hornpipes often share enough phrase shape that hornpipes can be
        // a better fallback than unrelated 4/4 types such as marches or
        // strathspeys.
        if (rhythmType === "reel" && normalizeMeter(meter) === "4/4") {
          var hornpipeCandidates = broadCandidates.filter(function(c) { return c.sourceType === "hornpipe"; });
          if (hornpipeCandidates.length) {
            fallbackGroups.push({
              label: "hornpipe rhythm fallback",
              candidates: hornpipeCandidates
            });
          }

          var otherFourFourCandidates = broadCandidates.filter(function(c) {
            return c.sourceType !== rhythmType && c.sourceType !== "hornpipe";
          });
          if (otherFourFourCandidates.length) {
            fallbackGroups.push({
              label: "other 4/4 rhythm fallback",
              candidates: otherFourFourCandidates
            });
          }
        } else {
          var broadOnlyCandidates = broadCandidates.filter(function(c) { return c.sourceType !== rhythmType; });
          if (broadOnlyCandidates.length) {
            fallbackGroups.push({
              label: "same meter/key/mode fallback",
              candidates: broadOnlyCandidates
            });
          }
        }

        for (var fallbackIndex = 0; !best && fallbackIndex < fallbackGroups.length; fallbackIndex++) {
          var fallbackGroup = fallbackGroups[fallbackIndex];
          best = await runBoundaryAwareSearch(fallbackGroup.candidates, fallbackGroup.label, true);
          if (best) rhythmFallbackMatched++;
        }
      }

      if (!best) {
        forceNextFullMeasureChord = false;
        outParts.push(m.prefix + stripExistingChords(m.content) + m.suffix);
        continue;
      }

      var chords = mapCandidateChordsToAllowedSourceBeats(m, best.measure, meter, unitLength, forceStartChord);
      var originalMappedChords = chords.slice();

      // Chords copied from the database are only allowed on musically appropriate
      // beat locations for the current meter:
      //   4/4: beats 1 and 3
      //   2/2: beats 1 and 2, handled in the normalized 4/4 bucket
      //   2/4: beats 1 and 2
      //   6/8: beats 1 and 4
      //   9/8: beats 1, 4, and 7
      //   12/8: beats 1, 4, 7, and 10
      //   3/4: beats 1, 2, and 3
      // Boundary chords for tune starts and repeat starts are still forced
      // onto the start of the measure when a matching database measure is found.
      // Ending boundaries use the lower boundary threshold, but repeated
      // opening chords can still be suppressed if another chord remains
      // in the measure.

      if (!options.repeatSameChord) {
        var previousEmittedChord = lastChord;
        var filteredChords = [];

        chords.forEach(function(c) {
          // Forced boundary chords must survive repeated-chord suppression,
          // even when they repeat the previous chord from an earlier measure.
          if (c.forced) {
            filteredChords.push(c);
            previousEmittedChord = c.chord;
            return;
          }

          // Suppress any repeated chord that immediately continues from the
          // last emitted chord, whether it appears at the start of a measure,
          // later in the same measure, or across one or more measure lines.
          if (c.chord === previousEmittedChord) return;

          filteredChords.push(c);
          previousEmittedChord = c.chord;
        });

        chords = filteredChords;

        // Ending-boundary measures may need an explicit chord marker when a usable
        // match exists, but do not restore a chord that merely repeats the previous
        // emitted chord for ordinary endings. This avoids redundant endings such as:
        //
        //   "D"AFA dAF|"D"DED D2 :|
        //
        // Alternate endings are different: first/second endings need their own chord
        // markers for correct display and playback, even when the chord repeats the
        // previous ending's chord.
        if (!chords.length && m.isBoundaryEnd && originalMappedChords.length) {
          var restoredEndingChord = originalMappedChords[0].chord;

          if (m.isAlternateEnding || restoredEndingChord !== lastChord) {
            chords = [Object.assign({}, originalMappedChords[0], { forced: true })];
          }
        }
      }

      if (!chords.length) {
        forceNextFullMeasureChord = false;
        outParts.push(m.prefix + stripExistingChords(m.content) + m.suffix);
        continue;
      }

      if (!forceStartChord && best.score < normalThreshold) fallbackMatched++;

      var injected = insertChordsIntoMeasure(m.content, chords, forceStartChord);
      if (chords.length) lastChord = chords[chords.length - 1].chord;
      firstChordInserted = true;
      forceNextFullMeasureChord = false;
      matched++;
      outParts.push(m.prefix + injected + m.suffix);
    }

    if (progressState) {
      progressState.completedMeasures += total;
      progressState.totalMatched += matched;
      progressState.totalSkippedPickup += skippedPickup;
      progressState.totalFallbackMatched = (progressState.totalFallbackMatched || 0) + fallbackMatched;
      progressState.totalRhythmFallbackMatched = (progressState.totalRhythmFallbackMatched || 0) + rhythmFallbackMatched;
    }

    var outBody = removeBlankLinesFromABCBody(outParts.join(""));
    var outTune = hb.header + (hb.header && outBody ? "\n" : "") + outBody;

    if (keyModeSelection.substituted) {
      outTune = appendNoteToTuneEnd(outTune, formatKeyModeSubstitutionNote(keyModeSelection));
    }

    return {
      text: outTune,
      stats: { title: title, matched: matched, total: total, skippedPickup: skippedPickup, fallbackMatched: fallbackMatched, rhythmFallbackMatched: rhythmFallbackMatched, candidates: broadCandidates.length, rhythmCandidates: rhythmCandidates.length, candidateBuckets: candidateInfo.buckets, keyModeSubstitution: keyModeSelection.substituted ? keyModeSelection : null }
    };
  }

  function getAppModalWidth(desktopWidth) {
    var viewportWidth = (window.visualViewport && window.visualViewport.width) ||
      window.innerWidth || document.documentElement.clientWidth || desktopWidth;
    return Math.max(300, Math.min(desktopWidth, Math.floor(viewportWidth - 24)));
  }

  function showAppMessage(message, top) {
    message = makeCenteredPromptString(message);
    if (window.DayPilot && DayPilot.Modal) {
      return DayPilot.Modal.alert(message, {
        theme: "modal_flat",
        width: getAppModalWidth(600),
        top: top || 180,
        scrollWithPage: (typeof window.AllowDialogsToScroll === "function") ? window.AllowDialogsToScroll() : true
      });
    }
    window.alert(String(message).replace(/<[^>]*>/g, ""));
    return Promise.resolve();
  }

  function ensureIntegratedProgressOverlay() {
    if (document.getElementById("progress_modal_overlay")) return;

    var overlay = document.createElement("div");
    overlay.id = "progress_modal_overlay";
    overlay.style.cssText = "display:none;position:fixed;z-index:2147483646;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,.42);";
    overlay.innerHTML = '' +
      '<div style="position:absolute;left:50%;top:150px;transform:translateX(-50%);width:min(620px,calc(100vw - 32px));background:#fff;border-radius:12px;padding:22px 24px;box-shadow:0 8px 30px rgba(0,0,0,.3);font-family:helvetica,arial,sans-serif;">' +
      '<p style="text-align:center;font-size:16pt;margin:12px 0 24px 0;">Adding Tune Backup Chords</p>' +
      '<div id="progress_modal_status" style="font-size:12pt;line-height:18pt;height:198px;min-height:198px;max-height:198px;overflow-y:auto;"></div>' +
      '<div id="progress_modal_progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" style="height:22px;border:1px solid #aaa;border-radius:6px;overflow:hidden;position:relative;margin-top:16px;background:#f2f2f2;">' +
      '<div id="progress_modal_progress_fill" style="height:100%;width:0;background:#9dbaf2;"></div>' +
      '<div id="progress_modal_progress_label" style="position:absolute;left:0;top:0;width:100%;height:100%;line-height:20px;text-align:center;font-size:10pt;">0%</div>' +
      '</div>' +
      '<p style="text-align:center;margin:24px 0 0 0;"><button id="abc_chord_match_cancel" class="btn" type="button">Cancel</button></p>' +
      '</div>';

    document.body.appendChild(overlay);
    document.getElementById("abc_chord_match_cancel").onclick = function() {
      gCancelRequested = true;
      updateProgressModal("Cancelling chord matching...");
      this.disabled = true;
    };
  }

  function splitEditorTuneSegments(abcText) {
    abcText = String(abcText || "").replace(/\r/g, "");
    var starts = [];
    var re = /^X:/gm;
    var match;
    while ((match = re.exec(abcText)) !== null) starts.push(match.index);

    if (!starts.length) return { preamble: abcText, tunes: [] };

    var result = { preamble: abcText.slice(0, starts[0]), tunes: [] };
    for (var i = 0; i < starts.length; i++) {
      var end = (i + 1 < starts.length) ? starts[i + 1] : abcText.length;
      var segment = abcText.slice(starts[i], end);
      var text = segment.replace(/\s+$/g, "");
      result.tunes.push({ text: text, separator: segment.slice(text.length) });
    }
    return result;
  }

  function getSelectedTuneIndexForChordMatching() {
    if (typeof window.findSelectedTuneIndex === "function") {
      var index = Number(window.findSelectedTuneIndex());
      if (isFinite(index) && index >= 0) return index;
    }
    return 0;
  }

  function makeThresholdOptions() {
    var options = [];
    for (var n = 10; n <= 100; n += 5) {
      var value = (n / 100).toFixed(2);
      options.push({ name: value, id: value });
    }
    return options;
  }

  function makeFallbackOptions() {
    var options = [];
    for (var n = 50; n <= 100; n += 5) {
      options.push({ name: n + "%", id: String(n) });
    }
    return options;
  }

  async function processEditorTunes(scope) {
    if (typeof window.getABCEditorText !== "function" || typeof window.setABCEditorText !== "function") {
      throw new Error("The ABC editor is not available.");
    }

    var originalABC = window.getABCEditorText();
    var segmented = splitEditorTuneSegments(originalABC);
    if (!segmented.tunes.length) throw new Error("No ABC tunes were found in the editor.");

    var selectedIndex = getSelectedTuneIndexForChordMatching();
    if (selectedIndex < 0 || selectedIndex >= segmented.tunes.length) selectedIndex = 0;

    var indexes = (scope === "all") ? segmented.tunes.map(function(_, i) { return i; }) : [selectedIndex];
    var threshold = getCurrentThresholdSetting();
    var fallbackThresholdScale = getCurrentFallbackThresholdScaleSetting();

    ensureIntegratedProgressOverlay();
    gCancelRequested = false;
    var cancelButton = document.getElementById("abc_chord_match_cancel");
    if (cancelButton) cancelButton.disabled = false;
    showProgressModal("Loading and indexing The Session tune database...");
    await allowBrowserToUpdate();
    await loadDatabase();

    var prepared = indexes.map(function(index) {
      // Remove stale solver notes before calculating progress totals.
      var tune = removePreviousChordSolverNotes(segmented.tunes[index].text);
      var skipReason = getTuneSkipReason(tune);
      var normalizedTune = skipReason ? tune : stripExistingChordsFromTune(tune);
      var hb = splitHeaderBody(normalizedTune);
      var meter = getHeaderValue(hb.header, "M") || "4/4";
      var unitLength = getHeaderValue(hb.header, "L");
      return {
        index: index,
        tune: normalizedTune,
        title: getHeaderValue(hb.header, "T") || "Untitled",
        measureCount: skipReason ? 0 : buildMeasureObjects(hb.body, meter, unitLength).filter(function(m) { return m.notes.length > 0; }).length
      };
    });

    var totalMeasures = prepared.reduce(function(total, item) { return total + item.measureCount; }, 0);
    var progressState = {
      startedAt: performance.now(),
      tuneCount: prepared.length,
      tuneNumber: 0,
      totalMeasuresToMatch: totalMeasures,
      completedMeasures: 0,
      totalMatched: 0,
      totalSkippedPickup: 0,
      totalFallbackMatched: 0,
      totalRhythmFallbackMatched: 0
    };
    var stats = [];

    for (var i = 0; i < prepared.length; i++) {
      throwIfCancelled();
      progressState.tuneNumber = i + 1;
      setProgressModalPercent(totalMeasures ? Math.round((progressState.completedMeasures / totalMeasures) * 100) : 0);
      updateProgressModal(
        formatProgressTuneHeader(progressState, prepared[i].title) +
        "Finding compatible database measures...<br>" +
        "Measures matched so far: <b>" + progressState.totalMatched + "</b>"
      );
      await allowBrowserToUpdate();

      var result = await processTuneAsync(prepared[i].tune, {
        threshold: threshold,
        fallbackThresholdScale: fallbackThresholdScale,
        boundaryThreshold: 0.35,
        repeatSameChord: false,
        keyModeSubstitutionEnabled: !!gSettings.keyModeSubstitutionEnabled,
        keyModeSubstitutionOptions: Object.assign({}, gSettings.keyModeSubstitutionOptions)
      }, progressState);

      segmented.tunes[prepared[i].index].text = result.text;
      stats.push(result.stats);
      setProgressModalPercent(totalMeasures ? Math.round((progressState.completedMeasures / totalMeasures) * 100) : 100);
      await allowBrowserToUpdate();
    }

    var finalABC = segmented.preamble + segmented.tunes.map(function(item) {
      return item.text + item.separator;
    }).join("");

    window.setABCEditorText(finalABC);
    window.gIsDirty = true;

    // A single-tune operation does not change the tune count or the surrounding
    // tunes, so only redraw the tune that was processed. Processing all tunes
    // still requires a complete redraw. Also avoid leaving gForceFullRender set
    // for the delayed CodeMirror change handler after a targeted redraw.
    var renderAllTunes = (scope === "all");
    window.gForceFullRender = renderAllTunes;

    if (typeof window.RenderAsync === "function") {
      await new Promise(function(resolve) {
        window.RenderAsync(renderAllTunes, renderAllTunes ? null : selectedIndex, function() {
            // Make sure the More Tools dialog visible
            ensureMoreToolsVisible();
            resolve();
          });
      });
    }

    var matched = stats.reduce(function(total, item) { return total + (item.matched || 0); }, 0);
    var examined = stats.reduce(function(total, item) { return total + (item.total || 0); }, 0);
    var skipped = stats.filter(function(item) { return item.skippedTune; }).length;
    var processed = stats.length - skipped;
    var chorded = stats.filter(function(item) {
      return !item.skippedTune && (item.matched || 0) > 0;
    }).length;
    var noMatches = processed - chorded;
    var alternateKeyModeTunes = stats.filter(function(item) {
      return !item.skippedTune && !!item.keyModeSubstitution;
    }).length;

    return {
      tunes: prepared.length,
      processed: processed,
      chorded: chorded,
      noMatches: noMatches,
      matched: matched,
      examined: examined,
      skipped: skipped,
      alternateKeyModeTunes: alternateKeyModeTunes,
      elapsed: performance.now() - progressState.startedAt
    };
  }

  async function runIntegratedChordMatching(scope) {
    try {
      var summary = await processEditorTunes(scope);
      hideProgressModal();

      function tuneWord(count) {
        return count === 1 ? "tune" : "tunes";
      }

      var message = '<p style="text-align:center;font-size:15pt;font-family:helvetica;margin-bottom:20px;">Add Tune Backup Chords Complete</p>' +
        '<p style="font-size:12pt;line-height:19pt;font-family:helvetica;">Successfully processed <b>' + summary.processed + '</b> ' + tuneWord(summary.processed) + '.</p>' +
        '<p style="font-size:12pt;line-height:19pt;font-family:helvetica;">Added chords to <b>' + summary.chorded + '</b> ' + tuneWord(summary.chorded) + '.</p>';

      if (summary.alternateKeyModeTunes) {
        message += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica;">Matched a different key/mode than the tune\'s K: tag for <b>' + summary.alternateKeyModeTunes + '</b> ' + tuneWord(summary.alternateKeyModeTunes) + '.</p>';
      }

      if (summary.noMatches) {
        message += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica;">No compatible measure matches were found for <b>' + summary.noMatches + '</b> ' + tuneWord(summary.noMatches) + '.</p>';
      }

      if (summary.skipped) {
        message += '<p style="font-size:12pt;line-height:19pt;font-family:helvetica;">Skipped <b>' + summary.skipped + '</b> ' + tuneWord(summary.skipped) + ' with multiple voices, lyrics, or mid-tune key changes.</p>';
      }

      await showAppMessage(message, 220);
      
      // Force an idle on the More Tools dialog
      IdleAdvancedControls(true);

    } catch (err) {
      hideProgressModal();
      if (err && err.message === "USER_CANCELLED") {
        await showAppMessage("Add Tune Backup Chords cancelled.", 240);
      } else {
        console.error("Add Tune Backup Chords failed:", err);
        await showAppMessage("<b>Unable to add backup chords.</b><br><br>" + escapeHTML(err && err.message ? err.message : err), 180);
      }
    }
  }

  function openIntegratedDialog() {
    if (typeof window.CountTunes === "function" && window.CountTunes() === 0) {
      showAppMessage("No ABC tunes are available for chord matching.", 240);
      return;
    }

    loadToolSettings();
    gSettings.keyModeSubstitutionOptions = normalizeSavedKeyModeSubstitutionOptions(gSettings.keyModeSubstitutionOptions);

    var data = {
      scope: (gSettings.scope === "all") ? "all" : "current",
      threshold: getCurrentThresholdSetting().toFixed(2),
      fallback: String(getCurrentFallbackMatchPercentageSetting()),
      substitutions: !!gSettings.keyModeSubstitutionEnabled,
      Dmajor: gSettings.keyModeSubstitutionOptions.Dmajor !== false,
      Gmajor: gSettings.keyModeSubstitutionOptions.Gmajor !== false,
      Cmajor: gSettings.keyModeSubstitutionOptions.Cmajor !== false,
      Fmajor: gSettings.keyModeSubstitutionOptions.Fmajor !== false,
      Gmajor_Eminor: gSettings.keyModeSubstitutionOptions.Gmajor_Eminor === true,
      Amajor_Bdorian: gSettings.keyModeSubstitutionOptions.Amajor_Bdorian === true
    };

    var form = [
      { html: '<p class="chord_matcher_dialog_title" style="margin-left:15px;">Add Tune Backup Chords&nbsp;&nbsp;<span style="font-size:24pt;" title="View documentation in new tab"><a href="https://michaeleskin.com/abctools/userguide.html#add_tune_backup_chords" target="_blank" style="text-decoration:none;position:absolute;left:20px;top:20px" class="dialogcornerbutton">?</a></span></p>' },
      { html: '<p class="chord_matcher_dialog_intro">Adds chords by matching each measure against chorded traditional Irish tune settings with a compatible rhythm, meter, key, and mode from The Session.</p>' },
      { name: "Tunes to process:", id: "scope", type: "select", options: [
        { name: "Current tune", id: "current" },
        { name: "All tunes", id: "all" }
      ], cssClass: "configure_chord_matcher_select configure_chord_matcher_scope_select" },
      { name: "Minimum match score:", id: "threshold", type: "select", options: makeThresholdOptions(), cssClass: "configure_chord_matcher_select" },
      { name: "Fallback match percentage:", id: "fallback", type: "select", options: makeFallbackOptions(), cssClass: "configure_chord_matcher_select" },
      { html: '<p class="chord_matcher_dialog_hint">The fallback percentage is applied to the minimum score when no normal match is found.<br/>The recommended defaults are <b>0.75</b> and <b>75%</b>.</p>' },
      { name: "Enable limited key/mode substitution checking", id: "substitutions", type: "checkbox", cssClass: "configure_chord_matcher_checkbox configure_chord_matcher_checkbox_main" },
      { html: '<p class="chord_matcher_dialog_section"><b>Common substitutions to test (when key/mode substitution checking enabled):</b></p>' },
      { name: "D major alternatives", id: "Dmajor", type: "checkbox", cssClass: "configure_chord_matcher_checkbox configure_chord_matcher_checkbox_indented" },
      { name: "G major alternatives", id: "Gmajor", type: "checkbox", cssClass: "configure_chord_matcher_checkbox configure_chord_matcher_checkbox_indented" },
      { name: "C major alternatives", id: "Cmajor", type: "checkbox", cssClass: "configure_chord_matcher_checkbox configure_chord_matcher_checkbox_indented" },
      { name: "F major alternatives", id: "Fmajor", type: "checkbox", cssClass: "configure_chord_matcher_checkbox configure_chord_matcher_checkbox_indented" },
      { html: '<p class="chord_matcher_dialog_section chord_matcher_dialog_advanced"><b>Advanced substitutions:</b> Enable only when source tunes use these K: tags and the common substitutions do not give good results.</p>' },
      { name: "Test G major as E minor", id: "Gmajor_Eminor", type: "checkbox", cssClass: "configure_chord_matcher_checkbox configure_chord_matcher_checkbox_indented" },
      { name: "Test A major as B Dorian", id: "Amajor_Bdorian", type: "checkbox", cssClass: "configure_chord_matcher_checkbox configure_chord_matcher_checkbox_indented" }
    ];

    DayPilot.Modal.form(form, data, {
      theme: "modal_flat_wide",
      top: 85,
      width: getAppModalWidth(680),
      scrollWithPage: (typeof window.AllowDialogsToScroll === "function") ? window.AllowDialogsToScroll() : true,
      okText: "Add Chords",
      cancelText: "Cancel",
      autoFocus: false
    }).then(function(args) {
      if (!args || args.canceled) return;

      var result = args.result || {};
      gSettings.scope = (result.scope === "all") ? "all" : "current";
      gSettings.threshold = Math.max(0.10, Math.min(1.00, Number(result.threshold) || 0.75));
      gSettings.fallbackMatchPercentage = Math.max(50, Math.min(100, Number(result.fallback) || 75));
      gSettings.keyModeSubstitutionEnabled = !!result.substitutions;
      gSettings.keyModeSubstitutionOptions = {
        Dmajor: !!result.Dmajor,
        Gmajor: !!result.Gmajor,
        Cmajor: !!result.Cmajor,
        Fmajor: !!result.Fmajor,
        Gmajor_Eminor: !!result.Gmajor_Eminor,
        Amajor_Bdorian: !!result.Amajor_Bdorian
      };
      saveToolSettings();

      if (typeof window.sendGoogleAnalytics === "function") {
        window.sendGoogleAnalytics("action", "AddTuneBackupChords");
      }

      runIntegratedChordMatching(result.scope === "all" ? "all" : "current");
    });
  }

  window.AddTuneBackupChordsDialog = openIntegratedDialog;
  window.CancelTuneBackupChordMatching = function() { gCancelRequested = true; };
})();
