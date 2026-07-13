/**
 * guided-tour.js - First time use guided tour for the ABC Transcription Tools
 *
 * MIT License
 * Copyright (c) 2026 Michael Eskin
 */

(function () {
  "use strict";

  var gTourOverlay = null;
  var gTourCard = null;
  var gTourArrowLayer = null;
  var gTourHighlightedEl = null;
  var gTourRunning = false;
  var gTourVirtualTarget = null;
  var gTourUseLongerArrows = false;

  function injectGuidedTourStyles() {
    if (document.getElementById("abc-guided-tour-styles")) return;

    var style = document.createElement("style");
    style.id = "abc-guided-tour-styles";
    style.textContent = `
      .abc-guided-tour-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.18);
        z-index: 2500;
        pointer-events: auto;
      }

      .abc-guided-tour-card {
        position: fixed;
        z-index: 2147483646;
        width: min(460px, calc(100vw - 24px));
        max-width: calc(100vw - 24px);
        background: #f5ffff;
        border: 1px solid #bfcfcf;
        border-radius: 5px;
        box-shadow: 0 10px 26px rgba(0,0,0,.25);
        padding: 24px;
        box-sizing: border-box;
        font-family: helvetica, arial, sans-serif;
      }

      .abc-guided-tour-card h2 {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 1.45em;
        text-align: left;
        color: #000 !important;
      }

      .abc-guided-tour-card p {
        margin: 0 0 10px 0;
        color: #000 !important;
        font-size: 12pt;
        line-height: 18pt;
      }

      .abc-guided-tour-card-footer {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px solid #d8e3e3;
      }

      .abc-guided-tour-step-count {
        text-align: center;
        font-size: 0.95em;
        color: #333;
        margin-bottom: 12px;
      }

      .abc-guided-tour-buttons {
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .abc-guided-tour-buttons button {
        min-width: 96px;
        padding: 7px 16px;
        border: 1px solid #aaa;
        border-radius: 6px;
        background: #e5e5e5;
        color: #000;
        font-size: 11pt;
        cursor: pointer;
      }

      .abc-guided-tour-buttons button:hover {
        background: #d5d5d5;
      }

      .abc-guided-tour-arrow-layer {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        z-index: 2147483645;
        pointer-events: none;
        overflow: visible;
      }

      .abc-guided-tour-arrow-path {
        stroke: #d32f2f;
        stroke-width: 3;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
        filter: drop-shadow(0 1px 2px rgba(0,0,0,.2));
      }


      .abc-guided-tour-tour-list { display:grid; grid-template-columns:1fr; gap:10px; margin-top:16px; }
      .abc-guided-tour-tour-list button { padding:10px 14px; text-align:left; border:1px solid #aaa; border-radius:6px; background:#e5e5e5; color:#000; font-size:12pt; cursor:pointer; }
      .abc-guided-tour-tour-list button:hover { background:#d5d5d5; }
      .abc-guided-tour-selector { width:min(615px, calc(100vw - 24px)); }
      .abc-guided-tour-selector p { font-size:13pt; line-height:19pt; }

      .abc-guided-tour-target-highlight {
        position: relative;
        z-index: 2147483644 !important;
        box-shadow: 0 0 0 4px rgba(0, 90, 173, 0.30), 0 0 0 9999px rgba(255,255,255,0.06) !important;
        border-radius: 8px;
        transition: box-shadow 160ms ease;
      }
    `;
    document.head.appendChild(style);
  }

  function waitMs(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function clearGuidedTourUI() {
    if (gTourVirtualTarget) {
      gTourVirtualTarget.remove();
      gTourVirtualTarget = null;
    }
    if (gTourHighlightedEl) {
      gTourHighlightedEl.classList.remove("abc-guided-tour-target-highlight");
      gTourHighlightedEl = null;
    }
    if (gTourArrowLayer) {
      gTourArrowLayer.remove();
      gTourArrowLayer = null;
    }
    if (gTourCard) {
      gTourCard.remove();
      gTourCard = null;
    }
    if (gTourOverlay) {
      gTourOverlay.remove();
      gTourOverlay = null;
    }
  }


  function isGuidedTourSideBySide() {
    return (typeof gIsOneColumn !== "undefined") && !gIsOneColumn;
  }

  function waitForGuidedTourSideBySide() {
    if (isGuidedTourSideBySide()) return Promise.resolve(true);

    return new Promise(function (resolve) {
      clearGuidedTourUI();

      var overlay = document.createElement("div");
      overlay.className = "abc-guided-tour-overlay";
      document.body.appendChild(overlay);
      gTourOverlay = overlay;

      var card = document.createElement("div");
      card.className = "abc-guided-tour-card";
      card.innerHTML =
        '<h2>Zoom Out to Run the Guided Tours</h2>' +
        '<p>These guided tours only work with the <strong>ABC editor and notation side by side</strong>.</p>' +
        '<p>Your browser is currently showing the stacked layout. Zoom the browser out or resize the window wider until the ABC editor is on the left and the notation is on the right.</p>' +
        '<p><strong>Windows:</strong> Ctrl&nbsp;&minus;&nbsp;&nbsp;&nbsp; <strong>Mac:</strong> &#8984;&nbsp;&minus;</p>' +
        '<p><strong>The Guided Tours selector will open automatically as soon as the side-by-side layout appears.</strong></p>' +
        '<div class="abc-guided-tour-card-footer">' +
          '<div class="abc-guided-tour-buttons">' +
            '<button type="button" data-action="exit">Close Tour</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(card);
      gTourCard = card;

      var zoomCardWidth = Math.min(760, window.innerWidth - 24);
      card.style.width = zoomCardWidth + "px";
      card.style.left = Math.max(12, Math.round((window.innerWidth - zoomCardWidth) / 2)) + "px";
      card.style.top = "150px";

      var finished = false;
      var timer = null;

      function finish(result) {
        if (finished) return;
        finished = true;
        if (timer) clearInterval(timer);
        window.removeEventListener("resize", checkLayout);
        clearGuidedTourUI();
        resolve(result);
      }

      function checkLayout() {
        // Allow ABC Tools' resize handler to update gIsOneColumn first.
        setTimeout(function () {
          if (isGuidedTourSideBySide()) finish(true);
        }, 0);
      }

      var closeButton = card.querySelector('button[data-action="exit"]');
      if (closeButton) {
        closeButton.addEventListener("click", function () { finish(false); });
      }

      overlay.addEventListener("click", function () { finish(false); }, { once: true });
      window.addEventListener("resize", checkLayout);
      timer = setInterval(checkLayout, 200);
      checkLayout();
    });
  }

  function getTopmostElementByClass(className) {
    var elems = document.getElementsByClassName(className);
    if (!elems || !elems.length) return null;
    return elems[elems.length - 1];
  }

  function resolveTarget(step) {
    if (!step) return null;
    if (typeof step.target === "function") return step.target();
    if (step.selector) return document.querySelector(step.selector);
    return null;
  }

  function getEditorTarget() {
    if (window.gEnableSyntax && window.gTheCM && typeof window.gTheCM.getWrapperElement === "function") {
      return window.gTheCM.getWrapperElement();
    }
    return document.getElementById("abc");
  }


  function scrollABCEditorToTop() {
    if (window.gEnableSyntax && window.gTheCM) {
      if (typeof window.gTheCM.scrollTo === "function") window.gTheCM.scrollTo(null, 0);
      if (typeof window.gTheCM.setCursor === "function") window.gTheCM.setCursor({ line: 0, ch: 0 });
      return;
    }

    var abc = document.getElementById("abc");
    if (abc) abc.scrollTop = 0;
  }

  function getABCEditorTopTarget() {
    if (window.gEnableSyntax && window.gTheCM && typeof window.gTheCM.getWrapperElement === "function") {
      var wrapper = window.gTheCM.getWrapperElement();
      var firstLine = wrapper ? wrapper.querySelector(".CodeMirror-line") : null;
      return firstLine || wrapper;
    }

    var abc = document.getElementById("abc");
    if (!abc) return null;

    var rect = abc.getBoundingClientRect();
    var cs = window.getComputedStyle(abc);
    var lineHeight = parseFloat(cs.lineHeight);
    if (!isFinite(lineHeight)) lineHeight = parseFloat(cs.fontSize) * 1.2;
    var paddingTop = parseFloat(cs.paddingTop) || 0;
    var paddingLeft = parseFloat(cs.paddingLeft) || 0;

    var marker = document.createElement("div");
    marker.setAttribute("aria-hidden", "true");
    marker.style.position = "fixed";
    marker.style.left = Math.round(rect.left + paddingLeft) + "px";
    marker.style.top = Math.round(rect.top + paddingTop) + "px";
    marker.style.width = Math.min(240, Math.max(140, rect.width - paddingLeft - 8)) + "px";
    marker.style.height = Math.max(18, Math.round(lineHeight * 2)) + "px";
    marker.style.pointerEvents = "none";
    marker.style.zIndex = "2147483643";
    document.body.appendChild(marker);
    gTourVirtualTarget = marker;
    return marker;
  }

  function getCooleysABCEditorTarget() {
    var titleText = "T: Cooley's";

    if (window.gEnableSyntax && window.gTheCM && typeof window.gTheCM.getWrapperElement === "function") {
      var wrapper = window.gTheCM.getWrapperElement();
      var lines = wrapper ? wrapper.querySelectorAll(".CodeMirror-line") : [];
      for (var i = 0; i < lines.length; i++) {
        if ((lines[i].textContent || "").trim() === titleText) return lines[i];
      }
      return wrapper;
    }

    var abc = document.getElementById("abc");
    if (!abc) return null;

    var text = typeof getABCEditorText === "function" ? getABCEditorText() : abc.value || "";
    var editorLines = text.replace(/\r/g, "").split("\n");
    var lineIndex = -1;
    for (var j = 0; j < editorLines.length; j++) {
      if (editorLines[j].trim() === titleText) {
        lineIndex = j;
        break;
      }
    }
    if (lineIndex < 0) return abc;

    var rect = abc.getBoundingClientRect();
    var cs = window.getComputedStyle(abc);
    var lineHeight = parseFloat(cs.lineHeight);
    if (!isFinite(lineHeight)) lineHeight = parseFloat(cs.fontSize) * 1.2;
    var paddingTop = parseFloat(cs.paddingTop) || 0;
    var paddingLeft = parseFloat(cs.paddingLeft) || 0;

    var marker = document.createElement("div");
    marker.setAttribute("aria-hidden", "true");
    marker.style.position = "fixed";
    marker.style.left = Math.round(rect.left + paddingLeft) + "px";
    marker.style.top = Math.round(rect.top + paddingTop + lineIndex * lineHeight - abc.scrollTop) + "px";
    marker.style.width = Math.min(190, Math.max(110, rect.width - paddingLeft - 8)) + "px";
    marker.style.height = Math.max(14, Math.round(lineHeight)) + "px";
    marker.style.pointerEvents = "none";
    marker.style.zIndex = "2147483643";
    document.body.appendChild(marker);
    gTourVirtualTarget = marker;
    return marker;
  }

  function selectFirstTune() {
    var text = typeof getABCEditorText === "function" ? getABCEditorText() : "";
    var start = text.indexOf("X:");
    if (start < 0) return;
    start += 2;

    if (window.gEnableSyntax && window.gTheCM) {
      window.gTheCM.selectionStart = start;
      window.gTheCM.selectionEnd = start;
    }
    else {
      var abc = document.getElementById("abc");
      if (abc) {
        abc.selectionStart = start;
        abc.selectionEnd = start;
      }
    }
  }

  async function scrollGuidedTourTarget(step) {
    if (typeof step.beforeResolveTarget === "function") {
      await step.beforeResolveTarget();
    }

    var el = resolveTarget(step);
    if (!el) return null;

    if (typeof step.beforeTargetScroll === "function") {
      await step.beforeTargetScroll(el);
    }

    if (step.skipTargetScroll) return el;

    try {
      el.scrollIntoView({ behavior: "smooth", block: step.scrollBlock || "center", inline: "nearest" });
      await waitMs(240);
    }
    catch (err) {
      el.scrollIntoView();
      await waitMs(80);
    }

    return el;
  }

  function chooseGuidedTourCardPlacement(targetEl, preferredWidth) {
    var gap = gTourUseLongerArrows ? 60 : 18;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var cardWidth = Math.min(preferredWidth || 460, vw - 24);
    var cardHeightEstimate = 300;

    if (!targetEl) {
      return {
        left: Math.max(12, Math.min(vw - cardWidth - 12, vw * .5 - cardWidth / 2)),
        top: 25,
        width: cardWidth
      };
    }

    var rect = targetEl.getBoundingClientRect();
    var leftSpace = rect.left;
    var rightSpace = vw - rect.right;
    var bottomSpace = vh - rect.bottom;
    var left;
    var top;

    if (rightSpace >= cardWidth + gap) {
      left = Math.min(vw - cardWidth - 12, rect.right + gap);
      top = Math.min(Math.max(12, rect.top), vh - cardHeightEstimate - 12);
    }
    else if (leftSpace >= cardWidth + gap) {
      left = Math.max(12, rect.left - cardWidth - gap);
      top = Math.min(Math.max(12, rect.top), vh - cardHeightEstimate - 12);
    }
    else if (bottomSpace >= cardHeightEstimate + gap) {
      left = Math.min(Math.max(12, rect.left), vw - cardWidth - 12);
      top = Math.min(vh - cardHeightEstimate - 12, rect.bottom + gap);
    }
    else {
      left = Math.min(Math.max(12, rect.left), vw - cardWidth - 12);
      top = Math.max(12, rect.top - cardHeightEstimate - gap);
    }

    top = Math.min(top, vh - cardHeightEstimate - 40);
    return { left: left, top: top, width: cardWidth };
  }

  function drawGuidedTourArrow(cardEl, targetEl, step) {
    if (!cardEl || !targetEl) return;

    var cardRect = cardEl.getBoundingClientRect();
    var targetRect = targetEl.getBoundingClientRect();
    var startX = cardRect.left + cardRect.width / 2;
    var startY = cardRect.top + cardRect.height / 2;
    var endX = targetRect.left + targetRect.width / 2 +
      (step && typeof step.arrowTargetOffsetX === "number" ? step.arrowTargetOffsetX : 0);
    var endY = targetRect.top + targetRect.height / 2 +
      (step && typeof step.arrowTargetOffsetY === "number" ? step.arrowTargetOffsetY : 0);
    var midX = (startX + endX) / 2;
    var path = "M " + startX + " " + startY + " Q " + midX + " " + startY + ", " + endX + " " + endY;

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "abc-guided-tour-arrow-layer");
    svg.setAttribute("viewBox", "0 0 " + window.innerWidth + " " + window.innerHeight);
    svg.setAttribute("preserveAspectRatio", "none");

    var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    var marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", "abcGuidedTourArrowHead");
    marker.setAttribute("markerWidth", "10");
    marker.setAttribute("markerHeight", "10");
    marker.setAttribute("refX", "8");
    marker.setAttribute("refY", "3");
    marker.setAttribute("orient", "auto");

    var arrowHead = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrowHead.setAttribute("d", "M0,0 L0,6 L9,3 z");
    arrowHead.setAttribute("fill", "#d32f2f");
    marker.appendChild(arrowHead);
    defs.appendChild(marker);
    svg.appendChild(defs);

    var arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
    arrow.setAttribute("class", "abc-guided-tour-arrow-path");
    arrow.setAttribute("d", path);
    arrow.setAttribute("marker-end", "url(#abcGuidedTourArrowHead)");
    svg.appendChild(arrow);

    document.body.appendChild(svg);
    gTourArrowLayer = svg;
  }

  function setTab(tabId) {
    var radio = document.getElementById(tabId);
    if (!radio) return;
    radio.checked = true;
    if (typeof ChangeTab === "function") ChangeTab();
  }

  function getEditedCooleysNotationTarget() {
    var holder = document.getElementById("notation-holder");
    if (!holder) return null;

    var candidates = holder.querySelectorAll("text, tspan, div, span");
    for (var i = 0; i < candidates.length; i++) {
      var text = (candidates[i].textContent || "").trim();
      if (text === "Cooley's - My First Edit") return candidates[i];
    }

    return holder;
  }

  function editFirstTuneTitle() {
    if (typeof getABCEditorText !== "function" || typeof setABCEditorText !== "function") return;

    var text = getABCEditorText();
    var updated = text.replace(/^T:\s*Cooley's\s*$/m, "T: Cooley's - My First Edit");
    if (updated === text) return;

    setABCEditorText(updated);
    window.gIsDirty = true;
    window.gForceFullRender = true;
    selectFirstTune();

    if (typeof RenderAsync === "function") RenderAsync(true, null);
  }


  function setGuidedTourPDFExportBaseline() {
    if (typeof setPageNumbers === "function") setPageNumbers("bc");

    window.gPDFPaperSize = "letter";
    window.gPDFOrientation = "portrait";

    if (typeof applyPDFPageFitScalingPreset === "function") {
      applyPDFPageFitScalingPreset("standard");
    }
    else {
      window.gPDFPageFitScalingPreset = "standard";
    }
  }

  function getGuidedTourSteps() {
    return [
      {
        title: "Welcome to the ABC Transcription Tools",
        cardWidth: 560,
        body: '<p>In a few minutes, you will build your first ABC tunebook.</p><p>You will add three example tunes, make an edit and see the notation update, try Mandolin tablature and Tin Whistle fingering views, transpose a tune up and back down a semitone, and export a PDF.</p>'
      },
      {
        title: "1. Add Three Example Tunes",
        cardWidth: 560,
        selector: "#newabcfile",
        body: '<p>Most editing sessions start by opening a file or adding tunes. For this tour, we’ll start with <strong>Add</strong>. Click <strong>Next</strong> to open the <strong>Add</strong> dialog.</p><p>The <strong>Add</strong> dialog includes sample tunes, templates, file import, tune search, and other ways to build an ABC tunebook.</p>',
        afterNext: function () { AddABC(); return waitMs(350); }
      },
      {
        title: "2. Add \"Cooley’s\"",
        selector: "#addnewreel",
        body: '<p>Let’s start building a tunebook. First add <strong>Cooley’s</strong>, an example reel.</p><p>Click <strong>Next</strong> and the tour will add <strong>Cooley’s</strong> for you using the same control you would normally click yourself.</p>',
        afterNext: function () { document.getElementById("addnewreel").click(); setTab("b1"); selectFirstTune(); return waitMs(350); }
      },
      {
        title: "3. Add \"The Kesh\"",
        selector: "#addnewjig",
        body: '<p>Now add <strong>The Kesh</strong>, an example jig.</p><p><strong>ABC Transcription Tools</strong> can work with multiple tunes at once and render all of them as notation.</p>',
        afterNext: function () { document.getElementById("addnewjig").click(); return waitMs(350); }
      },
      {
        title: "4. Add \"Alexander’s\"",
        selector: "#addnewhornpipe",
        body: '<p>Add <strong>Alexander’s</strong>, an example hornpipe. You now have a three-tune tunebook.</p>',
        afterNext: async function () {
          document.getElementById("addnewhornpipe").click();
          await waitMs(350);
          if (typeof AddABCCallback === "function") AddABCCallback();
          return waitMs(450);
        }
      },
      {
        title: "5. Edit the ABC",
        cardWidth: 560,
        target: getCooleysABCEditorTarget,
        skipTargetScroll: true,
        beforeResolveTarget: async function () {
          scrollABCEditorToTop();
          var editor = getEditorTarget();
          if (!editor) return;
          try {
            editor.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
            await waitMs(240);
          }
          catch (err) {
            editor.scrollIntoView();
            await waitMs(80);
          }
        },
        body: '<p>The text on the left is <strong>ABC notation</strong>. The music notation on the right is rendered from this text.</p><p>A simple first edit is changing a tune title. The tour will change <strong>Cooley’s</strong> to <strong>Cooley’s - My First Edit</strong>. Watch the rendered title update.</p>',
        afterNext: function () { editFirstTuneTitle(); return waitMs(850); }
      },
      {
        title: "6. ABC Changes Immediately Update the Notation",
        cardWidth: 630,
        target: getEditedCooleysNotationTarget,
        skipTargetScroll: true,
        beforeTargetScroll: async function () {
          var holder = document.getElementById("notation-holder");
          if (!holder) return;

          holder.scrollTop = 0;

          try {
            holder.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
            await waitMs(240);
          }
          catch (err) {
            holder.scrollIntoView();
            await waitMs(80);
          }
        },
        body: '<p>The notation has automatically updated from your edited ABC. This is the basic workflow: <strong>Edit the ABC and immediately see the musical result</strong>.</p><p>You can edit notes, titles, chords, rhythms, key signatures, and formatting commands in the same way.</p>'
      },
      {
        title: "7. Show Mandolin Tablature",
        target: function () { return document.querySelector('label[for="b3"]'); },
        body: '<p>The buttons below the editor let you choose how the tunes are displayed.</p><p>Let’s try <strong>Mandolin</strong> tablature. The same ABC will now be displayed with GDAE mandolin tablature.</p>',
        afterNext: function () { setTab("b3"); return waitMs(850); }
      },
      {
        title: "8. Show Tin Whistle Fingering",
        target: function () { return document.querySelector('label[for="b9"]'); },
        body: '<p>Now try <strong>Whistle</strong>. Instrument-specific views are just another way to display the tune; you do not need to change the ABC.</p><p>This is useful for quickly creating instrument-specific notation from the same ABC.</p>',
        afterNext: function () { setTab("b9"); return waitMs(900); }
      },
      {
        title: "9. Return to Standard Notation",
        target: function () { return document.querySelector('label[for="b1"]'); },
        body: '<p>Return to <strong>Notation</strong> before trying transposition.</p><p>Changing the display mode does not change the underlying ABC.</p>',
        afterNext: function () { setTab("b1"); selectFirstTune(); return waitMs(850); }
      },
      {
        title: "10. Transpose \"Cooley's\" Up One Semitone",
        cardWidth: 560,
        selector: "#transposeup",
        body: '<p>The cursor is positioned in <strong>Cooley\'s</strong>, so the transpose buttons will act on that one tune.</p><p><strong>Transpose Up</strong> shifts it up one semitone. Watch the ABC key and notes change along with the rendered notation.</p>',
        afterNext: function () {
          selectFirstTune();
          TransposeUp({ shiftKey: false, altKey: false });
          return waitMs(1200);
        }
      },
      {
        title: "11. Transpose \"Cooley's\" Back Down",
        cardWidth: 560,
        selector: "#transposedown",
        body: '<p>Now we’ll use <strong>Transpose Down</strong> once. Click <strong>Next</strong> to reverse the previous +1 semitone transposition and restore <strong>Cooley\'s</strong> to its original pitch.</p><p><strong>Transpose Up</strong> and <strong>Transpose Down</strong> are especially useful for quickly finding a better range for an instrument or singer.</p>',
        afterNext: function () {
          selectFirstTune();
          TransposeDown({ shiftKey: false, altKey: false });
          return waitMs(1200);
        }
      },
      {
        title: "12. Export Your First PDF",
        cardWidth: 560,
        target: function () { return document.getElementById("saveaspdf") || document.getElementById("pdfbuttonicon"); },
        body: '<p>You have now added tunes, edited ABC, switched to a tablature view and back to standard notation, and transposed a tune.</p><p>Let’s turn the three tunes into a printable PDF.</p><p>Click <strong>Next</strong> to open <strong>Export PDF</strong>.</p>',
        afterNext: function () {
          setGuidedTourPDFExportBaseline();
          PDFExportDialog();
          return waitMs(450);
        }
      },
      {
        title: "13. Choose One Tune per Page",
        cardWidth: 560,
        target: function () {
          return document.getElementById("configure_tunelayout") || document.getElementsByName("configure_tunelayout")[0] || null;
        },
        body: '<p>PDF export has many layout choices, but <strong>One Tune per Page</strong> is a good place to start.</p><p>The tour will select that layout for you. You can explore the other PDF settings later.</p>',
        afterNext: function () {
          var select = document.getElementById("configure_tunelayout") || document.getElementsByName("configure_tunelayout")[0];
          if (select) {
            select.value = "one";
            select.dispatchEvent(new Event("change", { bubbles: true }));
          }
          return waitMs(200);
        }
      },
      {
        title: "14. You’re Ready to Export the PDF",
        cardWidth: 560,
        target: function () { return getTopmostElementByClass("modal_flat_ok"); },
        body: '<p>Click <strong>Done</strong> to generate and export your first PDF.</p><p>After the export is complete, the PDF file will be found in the default <strong>Downloads</strong> directory for your browser.</p>',
        afterDone: function () { closeTopDialog(); }
      }
    ];
  }

  function showGuidedTourStepCard(step, index, total) {
    return new Promise(async function (resolve) {
      clearGuidedTourUI();

      var targetEl = await scrollGuidedTourTarget(step);
      if (targetEl) {
        targetEl.classList.add("abc-guided-tour-target-highlight");
        gTourHighlightedEl = targetEl;
      }

      var overlay = document.createElement("div");
      overlay.className = "abc-guided-tour-overlay";
      document.body.appendChild(overlay);
      gTourOverlay = overlay;

      var card = document.createElement("div");
      card.className = "abc-guided-tour-card";
      var isLast = index === total - 1;
      card.innerHTML =
        "<h2>" + step.title + "</h2>" +
        step.body +
        '<div class="abc-guided-tour-card-footer">' +
          '<div class="abc-guided-tour-step-count">Step ' + (index + 1) + " of " + total + "</div>" +
          '<div class="abc-guided-tour-buttons">' +
            '<button type="button" data-action="exit">Close Tour</button>' +
            '<button type="button" data-action="' + (isLast ? "done" : "next") + '">' + (isLast ? "Done" : "Next") + "</button>" +
          "</div>" +
        "</div>";

      document.body.appendChild(card);
      gTourCard = card;

      var placement = chooseGuidedTourCardPlacement(targetEl, step.cardWidth);
      card.style.left = placement.left + "px";
      card.style.width = placement.width + "px";

      var maxCardTop = Math.max(12, window.innerHeight - card.offsetHeight - 12);
      var requestedTop;

      if (targetEl && typeof step.cardTargetGap === "number") {
        var targetRect = targetEl.getBoundingClientRect();
        var gap = step.cardTargetGap;
        var aboveTop = targetRect.top - gap - card.offsetHeight;
        var belowTop = targetRect.bottom + gap;
        var canFitAbove = aboveTop >= 12;
        var canFitBelow = belowTop <= maxCardTop;

        if (canFitAbove) requestedTop = aboveTop;
        else if (canFitBelow) requestedTop = belowTop;
        else {
          var aboveRoom = targetRect.top - 12;
          var belowRoom = window.innerHeight - targetRect.bottom - 12;
          requestedTop = aboveRoom >= belowRoom
            ? Math.max(12, targetRect.top - gap - card.offsetHeight)
            : Math.min(maxCardTop, targetRect.bottom + gap);
        }
      }
      else {
        requestedTop = (typeof step.cardTop === "number") ? step.cardTop : placement.top;
      }

      card.style.top = Math.max(12, Math.min(requestedTop, maxCardTop)) + "px";

      drawGuidedTourArrow(card, targetEl, step);

      Array.prototype.forEach.call(card.querySelectorAll("button[data-action]"), function (btn) {
        btn.addEventListener("click", function () {
          var action = btn.getAttribute("data-action") || "exit";
          clearGuidedTourUI();
          resolve(action);
        });
      });

      overlay.addEventListener("click", function () {
        clearGuidedTourUI();
        resolve("exit");
      }, { once: true });
    });
  }

  async function runABCFirstUseGuidedTour() {
    if (gTourRunning) return;
    if (typeof isPureDesktopBrowser === "function" && !isPureDesktopBrowser()) return;

    injectGuidedTourStyles();
    gTourRunning = true;

    try {
      var steps = getGuidedTourSteps();
      var index = 0;

      while (index >= 0 && index < steps.length) {
        var step = steps[index];
        var action = await showGuidedTourStepCard(step, index, steps.length);

        if (action === "next") {
          if (typeof step.afterNext === "function") {
            await step.afterNext();
          }
          index++;
          continue;
        }

        if (action === "done" && typeof step.afterDone === "function") {
          await step.afterDone();
        }

        break;
      }
    }
    finally {
      clearGuidedTourUI();
      gTourRunning = false;
    }
  }



  function setControlValue(idOrName, value, eventName) {
    var el = document.getElementById(idOrName) || document.querySelector('[name="' + idOrName + '"]');
    if (!el) return null;
    if (el.type === "checkbox") el.checked = !!value;
    else el.value = value;
    el.dispatchEvent(new Event(eventName || "change", { bubbles: true }));
    return el;
  }

  function clickIfPresent(selector) {
    var el = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (el) el.click();
    return el;
  }

  function waitForElement(selector, timeoutMs) {
    var timeout = typeof timeoutMs === "number" ? timeoutMs : 2500;
    var started = Date.now();
    return new Promise(function (resolve) {
      function check() {
        var el = document.querySelector(selector);
        if (el || Date.now() - started >= timeout) {
          resolve(el || null);
          return;
        }
        setTimeout(check, 50);
      }
      check();
    });
  }

  function stripGuidedTourSampleChords() {
    if (typeof getABCEditorText !== "function" || typeof setABCEditorText !== "function") return;

    var source = getABCEditorText();
    var lines = source.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
    var insideTuneBody = false;

    for (var i = 0; i < lines.length; i++) {
      if (/^\s*X\s*:/.test(lines[i])) {
        insideTuneBody = false;
        continue;
      }

      if (/^\s*K\s*:/.test(lines[i])) {
        insideTuneBody = true;
        continue;
      }

      if (insideTuneBody) {
        lines[i] = lines[i].replace(/"(?:[^"\\]|\\.)*"/g, "");
      }
    }

    var updated = lines.join("\n");
    if (updated === source) return;

    setABCEditorText(updated);
    window.gIsDirty = true;
    window.gForceFullRender = true;

    if (typeof RenderAsync === "function") RenderAsync(true, null);
  }

  function setGuidedTourCheckbox(id, checked) {
    var el = document.getElementById(id) || document.querySelector('[name="' + id + '"]');
    if (!el) return null;
    el.checked = !!checked;
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return el;
  }

  function configureGuidedTourBackupChordSettings() {
    setControlValue("scope", "all");
    setControlValue("threshold", "0.75");
    setControlValue("fallback", "75");

    setGuidedTourCheckbox("substitutions", true);
    setGuidedTourCheckbox("Dmajor", true);
    setGuidedTourCheckbox("Gmajor", true);
    setGuidedTourCheckbox("Cmajor", true);
    setGuidedTourCheckbox("Fmajor", true);
    setGuidedTourCheckbox("Gmajor_Eminor", false);
    setGuidedTourCheckbox("Amajor_Bdorian", false);
  }

  function isGuidedTourElementVisible(el) {
    if (!el) return false;
    var style = window.getComputedStyle(el);
    var rect = el.getBoundingClientRect();
    return style.display !== "none" &&
      style.visibility !== "hidden" &&
      rect.width > 0 &&
      rect.height > 0;
  }

  function findVisibleButtonByLabel(label) {
    var candidates = document.querySelectorAll('input[type="button"], input[type="submit"], button');

    for (var i = candidates.length - 1; i >= 0; i--) {
      var el = candidates[i];
      var displayedLabel = el.tagName === "INPUT"
        ? (el.value || "").trim()
        : (el.textContent || "").trim();

      if (displayedLabel === label && isGuidedTourElementVisible(el)) {
        return el;
      }
    }

    return null;
  }

  function findVisibleElementContainingText(textToFind) {
    var candidates = document.querySelectorAll("div, p, span");
    for (var i = candidates.length - 1; i >= 0; i--) {
      var el = candidates[i];
      var text = (el.textContent || "").trim();
      if (text.indexOf(textToFind) < 0) continue;

      var style = window.getComputedStyle(el);
      var rect = el.getBoundingClientRect();
      if (style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0) {
        return el;
      }
    }
    return null;
  }

  async function waitForVisibleText(textToFind, timeoutMs) {
    var timeout = typeof timeoutMs === "number" ? timeoutMs : 120000;
    var started = Date.now();

    while (Date.now() - started < timeout) {
      var el = findVisibleElementContainingText(textToFind);
      if (el) return el;
      await waitMs(100);
    }

    return null;
  }

  async function runGuidedTourBackupChordMatching() {
    var addChordsButton = findVisibleButtonByLabel("Add Chords");
    if (!addChordsButton) return;

    addChordsButton.click();

    var completion = await waitForVisibleText("Add Tune Backup Chords Complete", 180000);
    if (!completion) {
      completion = await waitForVisibleText("Tune Backup Chords Added", 5000);
    }

    if (completion) {
      await waitMs(250);

      var completionOK = findVisibleButtonByLabel("OK");
      if (completionOK) completionOK.click();

      await waitMs(600);
    }
  }

  function stripGuidedTourSamplePlaybackAnnotations() {
    if (typeof getABCEditorText !== "function" || typeof setABCEditorText !== "function") return;

    var text = getABCEditorText();
    var blockPattern = /(?:^|\n)[ \t]*%[ \t]*\r?\n[ \t]*% Use the FatBoy soundfont:[ \t]*\r?\n[ \t]*%soundfont fatboy[ \t]*\r?\n[ \t]*%[ \t]*\r?\n[ \t]*% Use an Acoustic Grand Piano sound for the Melody, Bass, and Chords:[ \t]*\r?\n[ \t]*%%MIDI program 0[ \t]*\r?\n[ \t]*%%MIDI bassprog 0[ \t]*\r?\n[ \t]*%%MIDI chordprog 0[ \t]*\r?\n[ \t]*%[ \t]*\r?\n[ \t]*% Set the Bass and Chord volumes \(0-127\):[ \t]*\r?\n[ \t]*%%MIDI bassvol 64[ \t]*\r?\n[ \t]*%%MIDI chordvol 64[ \t]*(?=\r?\n|$)/g;

    var updated = text.replace(blockPattern, "");

    if (updated === text) return;

    setABCEditorText(updated);
    window.gIsDirty = true;
    window.gForceFullRender = true;

    if (typeof RenderAsync === "function") RenderAsync(true, null);
  }

  async function addGuidedTourTunes(addThree, stripSamplePlaybackAnnotations, stripSampleChords) {
    AddABC();
    await waitMs(350);
    clickIfPresent("#addnewreel");
    await waitMs(350);
    if (addThree) {
      clickIfPresent("#addnewjig");
      await waitMs(350);
      clickIfPresent("#addnewhornpipe");
      await waitMs(350);
    }
    if (typeof AddABCCallback === "function") AddABCCallback();

    if (stripSamplePlaybackAnnotations) {
      stripGuidedTourSamplePlaybackAnnotations();
      await waitMs(350);
    }

    if (stripSampleChords) {
      stripGuidedTourSampleChords();
      await waitMs(500);
    }

    setTab("b1");
    selectFirstTune();
    await waitMs(500);
  }

  function getPlayerPlayButton() {
    return document.querySelector("button.abcjs-midi-start");
  }

  function getPlayerTempoControl() {
    return document.querySelector(".abcjs-midi-tempo") || document.querySelector(".abcjs-midi-current-tempo-wrapper");
  }

  function closeTopDialog() {
    var buttons = document.getElementsByClassName("modal_flat_ok");
    if (buttons && buttons.length) buttons[buttons.length - 1].click();
  }

  function clearPDFTunebookTextFields() {
    ["addtitle","addsubtitle","addtoc","addindex","pageheader","pagefooter","qrcode_link","caption_for_qrcode"].forEach(function (id) {
      setControlValue(id, "", "input");
    });

    var qrCodeCheckbox = document.getElementById("bAdd_QRCode") ||
      document.querySelector('[name="bAdd_QRCode"]');
    if (qrCodeCheckbox) qrCodeCheckbox.checked = false;
  }

  function setPDFPlaybackInstrumentValues() {
    setControlValue("sound_font", "fatboy");
    setControlValue("melody_instrument", "1");
    setControlValue("bass_instrument", "1");
    setControlValue("chord_instrument", "1");
    setControlValue("bass_volume", "64", "input");
    setControlValue("chord_volume", "64", "input");
  }

  function getAdditionalGuidedTourSteps(tourId) {
    if (tourId === "playing") return [
      { title:"Playing Your Tunes", cardTargetGap:150, cardWidth:560, body:'<p>This tour demonstrates the built-in tune player using <strong>Cooley’s</strong>, <strong>The Kesh</strong>, and <strong>Alexander’s</strong>.</p>', afterNext:function(){ return addGuidedTourTunes(true); } },
      { title:"Open the Player", cardTargetGap:150, cardWidth:560, selector:"#playbutton", body:'<p>Click <strong>Next</strong> to open <strong>Cooley’s</strong> in the Player.</p>', afterNext:function(){ clickIfPresent("#playbutton"); return waitMs(1200); } },
      { title:"Play and Stop Cooley’s", cardTargetGap:75, cardWidth:560, target:getPlayerPlayButton, body:'<p>Click the <strong>Play</strong> button to start playing <strong>Cooley’s</strong>. Click it again to stop playback.</p><p>Click the <strong>Tempo Percentage</strong> control on the right side of the control bar to change the tempo.</p><p>When the tune is stopped, click <strong>Next</strong>.</p>' },
      { title:"Go to The Kesh", cardTargetGap:150, cardWidth:560, target:function(){ return document.getElementById("abcplayer_nextbutton"); }, body:'<p>You can move through the tunebook using the previous- and next-tune buttons.</p><p>Click <strong>Next</strong> and the tour will use the <strong>next tune</strong> button to go to <strong>The Kesh</strong>.</p>', afterNext:function(){ clickIfPresent("#abcplayer_nextbutton"); return waitMs(500); } },
      { title:"Go to Alexander’s", cardTargetGap:150, cardWidth:560, target:function(){ return document.getElementById("abcplayer_nextbutton"); }, body:'<p>Click <strong>Done</strong> and the tour will use the <strong>next tune</strong> button again to go to <strong>Alexander’s</strong> and finish the tour.</p>', afterDone:function(){ clickIfPresent("#abcplayer_nextbutton"); } }
    ];

    if (tourId === "mp3") return [
      { title:"Export an MP3 Audio File", cardTargetGap:150, cardWidth:560, body:'<p>This tour demonstrates how to export a tune as an MP3 audio file with reverb.</p><p>Click <strong>Next</strong> to add <strong>Cooley’s</strong> to the editor.</p>', afterNext:function(){ return addGuidedTourTunes(false); } },
      { title:"Open the Player", cardTargetGap:150, cardWidth:560, selector:"#playbutton", body:'<p>Click <strong>Next</strong> to open <strong>Cooley’s</strong> in the <strong>Player</strong>.</p>', afterNext:function(){ clickIfPresent("#playbutton"); return waitMs(1200); } },
      { title:"Open Audio Export", cardTargetGap:150, cardWidth:560, target:function(){return document.getElementById("abcplayer_exportbutton");}, beforeResolveTarget:function(){return waitForElement("#abcplayer_exportbutton",2500);}, body:'<p>Click <strong>Next</strong> to open <strong>Export Audio, Image, or PDF</strong>.</p>', afterNext:function(){ clickIfPresent("#abcplayer_exportbutton"); return waitMs(500); } },
      { title:"Export MP3 File with Reverb", cardTargetGap:150, cardWidth:600, target:function(){return document.getElementById("abcplayer_mp3reverbbutton");}, beforeResolveTarget:function(){return waitForElement("#abcplayer_mp3reverbbutton",2500);}, body:'<p>The tune audio will be encoded as an <strong>MP3 file with reverb</strong> and saved in the browser’s default <strong>Downloads</strong> directory.</p><p>Click <strong>Done</strong> to start creating and saving the MP3 file.</p>', afterDone:function(){ clickIfPresent("#abcplayer_mp3reverbbutton"); } }
    ];

    if (tourId === "trainer") return [
      { title:"Practice Tunes with the Tune Trainer", cardTargetGap:150, cardWidth:560, body:'<p>This tour demonstrates progressive-speed practice in the <strong>Tune Trainer</strong> using <strong>Cooley’s</strong>.</p>', afterNext:function(){ return addGuidedTourTunes(false); } },
      { title:"Open Tune Trainer", cardTargetGap:150, cardWidth:560, selector:"#tunetrainerbutton", body:'<p>Click <strong>Next</strong> to open the <strong>Tune Trainer</strong>.</p>', afterNext:function(){ clickIfPresent("#tunetrainerbutton"); return waitMs(1200); } },
      { title:"Configure Tune Trainer Speed Settings", cardTargetGap:150, cardWidth:560, target:function(){return document.getElementById("looper_start_percent");}, body:'<p>The tour will set the starting tempo to <strong>50%</strong>, ending tempo to <strong>100%</strong>, tempo increment to <strong>10%</strong>, increment after <strong>1</strong> time through the tune, and disable the countdown.</p>', afterNext:function(){ setControlValue("looper_start_percent","50","input"); setControlValue("looper_end_percent","100","input"); setControlValue("looper_increment","10","input"); setControlValue("looper_count","1","input"); setControlValue("looper_docountdown",false); return waitMs(300); } },
      { title:"Apply Settings and Reload", cardTargetGap:150, cardWidth:560, target:function(){return document.getElementById("looperreset");}, body:'<p>Changed <strong>Tune Trainer</strong> settings must be applied before playback.</p><p>Click <strong>Next</strong> and the tour will press <strong>Apply Changes and Reload</strong> for you.</p>', afterNext:function(){ clickIfPresent("#looperreset"); return waitMs(1200); } },
      { title:"Run a Training Session", cardTargetGap:150, cardWidth:620, target:getPlayerPlayButton, beforeResolveTarget:function(){ return waitForElement("button.abcjs-midi-start",2500); }, body:'<p>Click the <strong>Play</strong> button to start a looping tune training session.</p><p>Each time through the tune, playback speeds up by 10% until it reaches 100%.</p><p>Stop playback when you are ready, then click <strong>Next</strong> to learn about phrase-by-phrase practice.</p>' },
      { title:"Practice with the Phrase Builder", cardTargetGap:150, cardWidth:650, target:function(){return document.getElementById("trainer_phrase_builder");}, beforeResolveTarget:function(){return waitForElement("#trainer_phrase_builder",2500);}, body:'<p>The <strong>Phrase Builder</strong> can break a tune into short phrases for <strong>call-and-response</strong> practice.</p><p>Each phrase is followed by the same number of measures of rests, giving you time to play the phrase back yourself.</p><p>Click <strong>Next</strong> to open the <strong>Phrase Builder</strong>.</p>', afterNext:function(){ clickIfPresent("#trainer_phrase_builder"); return waitMs(700); } },
      { title:"Set the Phrase Length and Rest Padding", cardTop:80, cardWidth:650, target:function(){return document.getElementById("phraseLength") || document.querySelector('[name="phraseLength"]');}, beforeResolveTarget:function(){return waitForElement("#phraseLength, [name='phraseLength']",2500);}, body:'<p>The tour will set the phrase length to <strong>2 measures</strong> and the additional full-measure rest padding to <strong>0</strong>.</p><p>This creates two-measure phrases followed by two measures of rests.</p><p>Click <strong>Next</strong> to apply these settings.</p>', afterNext:function(){ setControlValue("phraseLength","2","input"); setControlValue("phrasePadding","0","input"); return waitMs(300); } },
      { title:"Build the Phrase-by-Phrase Tune", cardTop:80, cardWidth:620, target:function(){return findVisibleButtonByLabel("Build");}, body:'<p>Click <strong>Next</strong> and the tour will press <strong>Build</strong>.</p><p>The Phrase Builder will close and the Tune Trainer will reload with Cooley’s broken into two-measure phrases followed by two measures of rests.</p>', afterNext:function(){ var buildButton=findVisibleButtonByLabel("Build"); if(buildButton) buildButton.click(); return waitMs(1200); } },
      { title:"Enable the Metronome", cardTargetGap:150, cardWidth:650, target:function(){return document.getElementById("looper_metronomebutton");}, beforeResolveTarget:function(){return waitForElement("#looper_metronomebutton",3500);}, shouldSkip:async function(){ var button=await waitForElement("#looper_metronomebutton",3500); return !button || button.value !== "Enable Metronome"; }, body:'<p>Phrase-by-phrase call-and-response practice works best with the <strong>metronome</strong> enabled so you can keep steady time during both the played phrases and the rests.</p><p>Click <strong>Next</strong> and the tour will enable the metronome for you.</p>', afterNext:function(){ var button=document.getElementById("looper_metronomebutton"); if(button && button.value === "Enable Metronome") button.click(); return waitMs(350); } },
      { title:"Practice the Tune Phrase by Phrase", cardTargetGap:150, cardWidth:650, target:getPlayerPlayButton, beforeResolveTarget:function(){return waitForElement("button.abcjs-midi-start",3500);}, body:'<p>The tune is now arranged for call-and-response practice: listen to each two-measure phrase, then play it back during the following two measures of rests.</p><p>With the metronome keeping steady time, click the <strong>Play</strong> button to practice the phrases using the same increasing tempo settings as before.</p><p>Click <strong>Done</strong> when you are ready to end the tour.</p>' }
    ];

    if (tourId === "backupchords") return [
      {
        title:"Automatically Add Chords to Tunes",
        cardWidth:620,
        body:'<p>This tour will add <strong>Cooley’s</strong>, <strong>The Kesh</strong>, and <strong>Alexander’s</strong> to the editor without chords.</p><p>It will then use <strong>Add Tune Backup Chords</strong> to add style- and key/mode-appropriate chords automatically.</p>',
        afterNext:function(){ return addGuidedTourTunes(true, false, true); }
      },
      {
        title:"Open More Tools",
        cardWidth:560,
        selector:"#toggleadvancedcontrols",
        body:'<p>The automatic backup chord feature is available in the <strong>More Tools</strong> dialog.</p><p>Click <strong>Next</strong> to open <strong>More Tools</strong>.</p>',
        afterNext:function(){ clickIfPresent("#toggleadvancedcontrols"); return waitMs(700); }
      },
      {
        title:"Switch to the ABC Features Tab",
        cardWidth:560,
        target:function(){ return document.querySelector('[data-tab="adv-tab-injection"]'); },
        body:'<p>The tour will switch to the <strong>ABC Features</strong> tab, which contains tools that modify or enhance the ABC.</p>',
        afterNext:function(){
          if (typeof AdvancedControls_SelectTab === "function") {
            AdvancedControls_SelectTab("adv-tab-injection");
          }
          return waitMs(350);
        }
      },
      {
        title:"Open Add Tune Backup Chords",
        cardWidth:620,
        selector:"#addtunebackupchords",
        body:'<p><strong>Add Tune Backup Chords</strong> compares each measure against already-chorded traditional Irish tune settings from The Session and copies chords from the closest compatible matches.</p><p>Click <strong>Next</strong> to open the settings dialog.</p>',
        afterNext:function(){ clickIfPresent("#addtunebackupchords"); return waitMs(650); }
      },
      {
        title:"Configure the Chord Matching Settings",
        cardTop:80,
        cardWidth:700,
        target:function(){ return document.getElementById("scope") || document.querySelector('[name="scope"]'); },
        beforeResolveTarget:function(){ return waitForElement("#scope, [name='scope']", 3000); },
        body:'<p>The tour will process <strong>All tunes</strong> using the default settings of a minimum match score of <strong>0.75</strong> and fallback match percentage of <strong>75%</strong>.</p><p>Limited key/mode substitution checking and the D, G, C, and F major alternatives will be enabled. The G major as E minor and A major as B Dorian advanced substitutions will be disabled.</p><p>Click <strong>Next</strong> to apply these settings.</p>',
        afterNext:function(){ configureGuidedTourBackupChordSettings(); return waitMs(350); }
      },
      {
        title:"Add Chords",
        cardTop:80,
        cardWidth:650,
        target:function(){ return findVisibleButtonByLabel("Add Chords"); },
        body:'<p>The settings are ready. Click <strong>Next</strong> and the tour will press <strong>Add Chords</strong> to add style- and key/mode-appropriate backup chords to all three tunes.</p><p>Chord matching may take a little while while the tune measures are compared against the database.</p>',
        afterNext:function(){ return runGuidedTourBackupChordMatching(); }
      },
      {
        title:"Close More Tools",
        cardWidth:560,
        target:function(){ return findVisibleButtonByLabel("OK"); },
        body:'<p>The <strong>Add Tune Backup Chords Complete</strong> message has been acknowledged and the chords have been added.</p><p>Click <strong>Next</strong> to close the <strong>More Tools</strong> dialog.</p>',
        afterNext:function(){ var okButton=findVisibleButtonByLabel("OK"); if(okButton) okButton.click(); return waitMs(500); }
      },
      {
        title:"Chords Added to the Tunes",
        cardWidth:650,
        target:getCooleysABCEditorTarget,
        skipTargetScroll:true,
        beforeResolveTarget:async function(){
          scrollABCEditorToTop();
          var editor=getEditorTarget();
          if(editor){
            try{
              editor.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"});
              await waitMs(240);
            }
            catch(err){
              editor.scrollIntoView();
              await waitMs(80);
            }
          }
        },
        body:'<p>Backup chords have now been added directly to the ABC for all three tunes.</p><p>Because they are standard ABC chord annotations, you can review, edit, remove, or save them just like any other part of the tune.</p>'
      }
    ];

    if (tourId === "pdf") return [
      { title:"Export a PDF with Tunebook Features", cardWidth:560, body:'<p>This tour creates a three-tune PDF tunebook with a title page, hyperlinked Table of Contents and Index, page header, and clickable playback links.</p>' },
      { title:"Add Three Example Tunes",cardWidth:530, body:'<p>The Export PDF tour will add <strong>Cooley’s</strong>, <strong>The Kesh</strong>, and <strong>Alexander’s</strong> to the ABC editor.</p><p>Click <strong>Next</strong> to add the three example tunes.</p>', afterNext:function(){ return addGuidedTourTunes(true, true); } },
      { title:"Open Export PDF", selector:"#saveaspdf", body:'<p>Click <strong>Next</strong> to open the <strong>Export PDF Tunebook</strong> dialog.</p>', afterNext:function(){ PDFExportDialog(); return waitMs(650); } },
      { title:"Open Inject All PDF Tunebook Features", cardWidth:530, selector:"#tunebookbuilder", body:'<p>Click <strong>Next</strong> to open <strong>Inject All PDF Tunebook Features</strong>.</p>', afterNext:function(){ clickIfPresent("#tunebookbuilder"); return waitMs(650); } },
      { title:"Start with All PDF Features Disabled", target:function(){return document.querySelector('[name="addtitle"]');}, body:'<p>The tour will clear all text fields so the PDF tunebook features can be built from scratch.</p><p>If a text field for a feature is empty, that feature won\'t be added to the exported PDF file.</p>', afterNext:function(){ clearPDFTunebookTextFields(); return waitMs(250); } },
      { title:"Set the Tunebook Title", target:function(){return document.querySelector('[name="addtitle"]');}, body:'<p>Set the tunebook title to <strong>My First PDF Tunebook</strong>.</p>', afterNext:function(){ setControlValue("addtitle","My First PDF Tunebook","input"); return waitMs(200); } },
      { title:"Set the Table of Contents Title", target:function(){return document.querySelector('[name="addtoc"]');}, body:'<p>Set the table of contents title to <strong>Table of Contents</strong>.</p>', afterNext:function(){ setControlValue("addtoc","Table of Contents","input"); return waitMs(200); } },
      { title:"Set the Index Title", target:function(){return document.querySelector('[name="addindex"]');}, body:'<p>Set the index title to <strong>Index</strong>.</p>', afterNext:function(){ setControlValue("addindex","Index","input"); return waitMs(200); } },
      { title:"Set the Page Header Text", target:function(){return document.querySelector('[name="pageheader"]');}, body:'<p>Set the page header text to <strong>This is the Page Header</strong>.</p>', afterNext:function(){ setControlValue("pageheader","This is the Page Header","input"); return waitMs(200); } },
      { title:"Enable the Add Playback Links Checkbox", cardTop:150, cardWidth:600, beforeResolveTarget:function(){ var checkbox=document.getElementById("bAdd_add_all_playback_links") || document.querySelector('[name="bAdd_add_all_playback_links"]'); if(checkbox) checkbox.checked=true; }, body:'<p>This option is now enabled, making each tune title in the PDF a playback link. Clicking a title in the finished PDF will open and play that tune.</p><p>Click <strong>Next</strong> to continue.</p>' },
      { title:"Set Melody and Backup Instruments and Volumes", cardTop:150, cardWidth:630, body:'<p>The tour will set the soundfont to <strong>FatBoy</strong>, the Melody, Bass, and Chord instruments to <strong>Acoustic Grand Piano</strong>, and both Bass and Chord volumes to <strong>64</strong>.</p><p>In the exported PDF, you can click the title of any tune to play the tune using the instruments set in this dialog.</p><p>Click <strong>Next</strong> to apply these playback settings.</p>', afterNext:function(){ setPDFPlaybackInstrumentValues(); return waitMs(300); } },
      { title:"Inject the PDF Tunebook Features", target:function(){return getTopmostElementByClass("modal_flat_ok");}, body:'<p>Click <strong>Next</strong> to inject these PDF tunebook feature annotations at the top of the ABC.</p>', afterNext:function(){ closeTopDialog(); return waitMs(900); } },
      { title:"PDF Tunebook Feature Annotations Added to the ABC", cardWidth:650, arrowTargetOffsetX:-110, target:getABCEditorTopTarget, skipTargetScroll:true, beforeResolveTarget:async function(){ scrollABCEditorToTop(); var editor=getEditorTarget(); if(editor){ try{ editor.scrollIntoView({behavior:"smooth",block:"start",inline:"nearest"}); await waitMs(240); } catch(err){ editor.scrollIntoView(); await waitMs(80); } } }, body:'<p>The PDF tunebook annotations have been added at the <strong>top of the ABC</strong>.</p><p>They are ordinary ABC directives, so you can edit them manually later if you want to change the tunebook title, table of contents, page header, playback settings, or other PDF features.</p>' },
      { title:"Choose PDF Output Settings", target:function(){return document.querySelector('[name="configure_papersize"]');}, body:'<p>The tour will set the output to <strong>Letter</strong>, <strong>Portrait</strong>, <strong>One Tune Per Page</strong>, with page numbers at the <strong>Bottom Center</strong>.</p>', afterNext:function(){ setControlValue("configure_papersize","letter"); setControlValue("configure_orientation","portrait"); setControlValue("configure_tunelayout","one"); setControlValue("configure_pagenumber","bc"); return waitMs(300); } },
      { title:"Export the PDF", target:function(){return getTopmostElementByClass("modal_flat_ok");}, body:'<p>After export completes, the PDF will be found in the browser’s default <strong>Downloads</strong> directory.</p><p>Remember to save the ABC as well so the injected PDF annotations are available for later use.</p><p>Click <strong>Done</strong> to generate and save the PDF.</p>', afterDone:function(){ closeTopDialog(); } }
    ];

    if (tourId === "website") return [
      { title:"Export a Tunebook Website", cardWidth:560, body:'<p>This tour sends the three example tunes to the <strong>abcjs-eskin Website Builder</strong> where you can fully configure and export the website.</p>' },
      { title:"Add Three Example Tunes", cardWidth:530, body:'<p>The Export Website tour will add <strong>Cooley’s</strong>, <strong>The Kesh</strong>, and <strong>Alexander’s</strong> to the ABC editor.</p><p>Click <strong>Next</strong> to add the three example tunes.</p>', afterNext:function(){ return addGuidedTourTunes(true, true); } },
      { title:"Open Export Website", selector:"#saveaswebsite", body:'<p>Click <strong>Next</strong> to open Website Export.</p>', afterNext:function(){ clickIfPresent("#saveaswebsite"); return waitMs(700); } },
      { title:"Open abcjs-eskin Website Builder", target:function(){return document.getElementById("external_abcjs_eskin_website") || document.querySelector('[title*="Website Builder"]');}, body:'<p>Using this ABC, you can configure, preview, and export a complete, mobile-ready, printable website in a variety of musical genre-specific visual themes, with considerable control over tune navigation and playback instruments.</p><p>Be sure to try its guided tour for an introduction to its major features.</p><p>Click <strong>Done</strong> to open the <strong>abcjs-eskin Website Builder</strong>.</p>', afterDone:function(){ clickIfPresent(document.getElementById("external_abcjs_eskin_website") || document.querySelector('[title*="Website Builder"]')); } }
    ];

    if (tourId === "share") return [
      { title:"Sharing Tunes with a Share Link", cardWidth:620, body:'<p><strong>Share Links</strong> are a great way to share one or more tunes in an email or social media post.</p><p>Opening a share link can display the tune or tunes in a <strong>full-screen</strong> view, open them in the <strong>Editor</strong>, or open them in the <strong>Player</strong>.</p><p>For this tour, we’ll create a share link that opens in the <strong>Player</strong>.</p>' },
      { title:"Create a Share Link",cardWidth:530, body:'<p>This tour will create a share link for <strong>Cooley’s</strong>, <strong>The Kesh</strong>, and <strong>Alexander’s</strong> that opens in the <strong>Player</strong>.</p><p>Click <strong>Next</strong> to add the three example tunes.</p>', afterNext:function(){ return addGuidedTourTunes(true); } },
      { title:"Open Sharing", selector:"#togglesharecontrols", body:'<p>Click <strong>Next</strong> to open the Sharing Controls dialog. The generated share URL will appear there.</p>', afterNext:function(){ clickIfPresent("#togglesharecontrols"); return waitMs(700); } },
      { title:"Make the Share Link Open in the Player", cardWidth:530, selector:"#addautoplay", body:'<p>Clicking <strong>Add Auto-Play</strong> makes the share link open directly in the Player.</p>', afterNext:function(){ clickIfPresent("#addautoplay"); return waitMs(300); } },
      { title:"Copy Share URL to the Clipboard", selector:"#copyurl", body:'<p>Click <strong>Next</strong> to copy the share link to the clipboard.</p>', afterNext:function(){ clickIfPresent("#copyurl"); return waitMs(300); } },
      { title:"Test Share URL in a New Tab", selector:"#testurl", body:'<p>The share link is now on the clipboard and can be pasted into an email, message, or social media post.</p><p>Clicking <strong>Test Share URL</strong> opens the share link in a new browser tab so you can see exactly what recipients will see.</p><p>Click <strong>Done</strong> to test the share URL and finish the tour.</p>', afterDone:function(){ clickIfPresent("#testurl"); } }
    ];

    return [];
  }

  async function runAdditionalGuidedTour(tourId) {
    if (gTourRunning) return;
    if (typeof isPureDesktopBrowser === "function" && !isPureDesktopBrowser()) return;
    injectGuidedTourStyles();
    gTourUseLongerArrows = true;
    gTourRunning = true;
    try {
      var steps = getAdditionalGuidedTourSteps(tourId);
      for (var index=0; index<steps.length; index++) {
        var step=steps[index];

        if (typeof step.shouldSkip === "function") {
          if (typeof step._guidedTourSkip === "undefined") {
            step._guidedTourSkip = !!(await step.shouldSkip());
          }

          if (step._guidedTourSkip) {
            continue;
          }
        }

        // Use the original fixed step positions and total so the numbering
        // never changes after a conditional step is evaluated.
        var action=await showGuidedTourStepCard(step,index,steps.length);
        if (action === "next") {
          if (typeof step.afterNext === "function") await step.afterNext();
          continue;
        }
        if (action === "done" && typeof step.afterDone === "function") await step.afterDone();
        break;
      }
    } finally {
      clearGuidedTourUI();
      gTourUseLongerArrows = false;
      gTourRunning=false;
    }
  }

  async function showGuidedTourSelector() {
    if (gTourRunning) return;
    if (typeof isPureDesktopBrowser === "function" && !isPureDesktopBrowser()) return;

    injectGuidedTourStyles();
    gTourRunning = true;

    try {
      var sideBySideReady = await waitForGuidedTourSideBySide();
      if (!sideBySideReady) return;

      clearGuidedTourUI();

      var overlay = document.createElement("div");
      overlay.className = "abc-guided-tour-overlay";
      document.body.appendChild(overlay);
      gTourOverlay = overlay;

      var card = document.createElement("div");
      card.className = "abc-guided-tour-card abc-guided-tour-selector";
      card.innerHTML = '<h2>Guided Tours</h2><p>These step-by-step guided tours walk you through the most commonly used features and workflows in the <strong>ABC Transcription Tools</strong>:</p>' +
        '<div class="abc-guided-tour-tour-list">' +
        '<button data-tour="first">Build Your First ABC Tunebook</button>' +
        '<button data-tour="playing">Playing Your Tunes</button>' +
        '<button data-tour="mp3">Export an MP3 Audio File</button>' +
        '<button data-tour="trainer">Practice Tunes with the Tune Trainer</button>' +
        '<button data-tour="backupchords">Automatically Add Chords to Tunes</button>' +
        '<button data-tour="pdf">Export a PDF with Title Page, Table of Contents, Index, and Play Links</button>' +
        '<button data-tour="website">Export a Tunebook Website</button>' +
        '<button data-tour="share">Creating a Share Link for Email or Social Media Posts</button>' +
        '</div><div class="abc-guided-tour-card-footer"><div class="abc-guided-tour-buttons"><button type="button" data-action="cancel">Cancel</button></div></div>';

      document.body.appendChild(card);
      gTourCard = card;
      card.style.left = Math.max(12, Math.round((window.innerWidth - card.offsetWidth) / 2)) + "px";
      card.style.top = "100px";

      Array.prototype.forEach.call(card.querySelectorAll("button[data-tour]"), function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-tour");
          clearGuidedTourUI();

          sendGoogleAnalytics("dialog", "GuidedTour_"+id);

          if (id === "first") runABCFirstUseGuidedTour();
          else runAdditionalGuidedTour(id);
        });
      });

      card.querySelector('[data-action="cancel"]').addEventListener("click", clearGuidedTourUI);
      overlay.addEventListener("click", clearGuidedTourUI, { once: true });
    }
    finally {
      gTourRunning = false;
    }
  }

  function updateGuidedTourButtonVisibility() {
    var button = document.getElementById("guidedtourbutton");
    if (!button) return;
    if (typeof isPureDesktopBrowser === "function" && !isPureDesktopBrowser()) {
      button.style.display = "none";
    }
  }

  window.StartABCFirstUseGuidedTour = runABCFirstUseGuidedTour;
  window.ShowABCGuidedTourSelector = showGuidedTourSelector;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(updateGuidedTourButtonVisibility, 0);
    }, { once: true });
  }
  else {
    setTimeout(updateGuidedTourButtonVisibility, 0);
  }
})();
