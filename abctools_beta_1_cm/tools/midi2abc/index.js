import tone2abc from "./midi2abc.js";

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    document.documentElement.setAttribute("data-bs-theme", "light");
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
}

function toggleABCPanel() {
  document.getElementById("abcRow").classList.toggle("d-none");
  document.getElementById("abcColumn").classList.toggle("d-none");
  document.getElementById("abc").parentNode.parentNode.classList.toggle("row");
  const textarea = document.getElementById("abc");
}

function dropFileEvent(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  const dt = new DataTransfer();
  dt.items.add(file);
  const input = document.getElementById("inputFile");
  input.files = dt.files;
  convertFromBlob(file);
  // Reset file selectors
  let fileElement = document.getElementById('inputFile');

  fileElement.value = "";
}

function convertFileEvent(event) {
  convertFromBlob(event.target.files[0]);

  // Reset file selectors
  let fileElement = document.getElementById('inputFile');

  fileElement.value = "";
}

function convertUrlEvent(event) {
  convertFromUrl(event.target.value);
}

async function convertFromUrlParams() {
  const query = new URLSearchParams(location.search);
  ns = await core.urlToNoteSequence(query.get("url"));
  nsCache = core.sequences.clone(ns);
  setToolbar();
  convert(ns, query);
}

async function convertFromBlob(file, query) {
  ns = await core.blobToNoteSequence(file);
  nsCache = core.sequences.clone(ns);
  setToolbar();
  convert(ns, query);
}

async function convertFromUrl(midiUrl, query) {
  ns = await core.urlToNoteSequence(midiUrl);
  nsCache = core.sequences.clone(ns);
  setToolbar();
  convert(ns, query);
}

function setMIDIInfo(query) {
  if (query instanceof URLSearchParams) {
    const title = query.get("title");
    const composer = query.get("composer");
    const maintainer = query.get("maintainer");
    const web = query.get("web");
    const license = query.get("license");
    document.getElementById("midiTitle").textContent = title;
    document.getElementById("composer").textContent = composer;
    if (web) {
      const a = document.createElement("a");
      a.href = web;
      a.textContent = maintainer;
      document.getElementById("maintainer").replaceChildren(a);
    } else {
      document.getElementById("maintainer").textContent = maintainer;
    }
    try {
      new URL(license);
    } catch {
      document.getElementById("license").textContent = license;
    }
  } else {
    document.getElementById("midiTitle").textContent = "";
    document.getElementById("composer").textContent = "";
    document.getElementById("maintainer").textContent = "";
    document.getElementById("license").textContent = "";
  }
}

function convert(ns, query) {
  // const options = {};
  // if (title) options.title = query.get("title");
  // if (composer) options.composer = query.get("composer");
  // const abcString = tone2abc(ns, options);
  setMIDIInfo(query);
  const abcString = tone2abc(ns);
  const textarea = document.getElementById("abc");
  textarea.value = abcString;
  initScore(abcString);
}


function initScore(abcString) {
  const score = document.getElementById("score");
  const player = document.getElementById("player");
  const visualOptions = { responsive: "resize" };
  const visualObj = ABCJS.renderAbc("score", abcString, visualOptions);
}

function initABCEditor() {
  const editorOptions = {
    paper_id: "score",
    //warnings_id: "abcWarning",
    abcjsParams: { responsive: "resize" },
    // TODO: cursor does not works
    // synth: {
    //   el: "#player",
    //   cursorControl: cursorControl,
    //   options: controlOptions,
    // }
  };
  const textarea = document.getElementById("abc");
  textarea.value = "";
  textarea.setAttribute("autocorrect", "off");
  new ABCJS.Editor("abc", editorOptions);
}

function getCheckboxString(name, label) {
  return `
<div class="form-check form-check-inline">
  <label class="form-check-label">
    <input class="form-check-input" name="${name}" value="${label}" type="checkbox" checked>
    ${label}
  </label>
</div>`;
}

function setInstrumentsCheckbox() {
  const set = new Set();
  ns.notes.forEach((note) => {
    set.add(note.instrument);
  });
  const map = new Map();
  let str = "";
  set.forEach((instrumentId) => {
    str += getCheckboxString("instrument", instrumentId);
    map.set(instrumentId, true);
  });
  const doc = new DOMParser().parseFromString(str, "text/html");
  const node = document.getElementById("filterInstruments");
  node.replaceChildren(...doc.body.childNodes);
  [...node.querySelectorAll("input")].forEach((input) => {
    input.addEventListener("change", (event) => {
      const instrumentId = parseInt(input.value);
      if (event.currentTarget.checked) {
        map.set(instrumentId, true);
      } else {
        map.set(instrumentId, false);
      }
      ns = core.sequences.clone(nsCache);
      ns.notes = ns.notes.filter((note) => map.get(note.instrument));
      convert(ns);
    });
  });
}

function setProgramsCheckbox() {
  const set = new Set();
  ns.notes.forEach((note) => {
    set.add(note.program);
  });
  const map = new Map();
  let str = "";
  set.forEach((programId) => {
    str += getCheckboxString("program", programId);
    map.set(programId, true);
  });
  const doc = new DOMParser().parseFromString(str, "text/html");
  const node = document.getElementById("filterPrograms");
  node.replaceChildren(...doc.body.childNodes);
  [...node.querySelectorAll("input")].forEach((input) => {
    input.addEventListener("change", (event) => {
      const programId = parseInt(input.value);
      if (event.currentTarget.checked) {
        map.set(programId, true);
      } else {
        map.set(programId, false);
      }
      ns = core.sequences.clone(nsCache);
      ns.notes = ns.notes.filter((note) => map.get(note.program));
      convert(ns);
    });
  });
}

function setToolbar() {
  setProgramsCheckbox();
  setInstrumentsCheckbox();
}

loadConfig();
initABCEditor();
let ns;
let nsCache;

document.getElementById("toggleABCPanel").onclick = toggleABCPanel;
document.ondragover = (e) => {
  e.preventDefault();
};
document.ondrop = dropFileEvent;
document.getElementById("inputFile").onchange = convertFileEvent;
