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
        '<h2>Zoom Out to Continue the Guided Tour</h2>' +
        '<p>This guided tour works best with the <strong>ABC editor and notation side by side</strong>.</p>' +
        '<p>Your browser is currently showing the stacked layout. Zoom the browser out or resize the window wider until the ABC editor is on the left and the notation is on the right.</p>' +
        '<p><strong>Windows:</strong> Ctrl&nbsp;&minus;&nbsp;&nbsp;&nbsp; <strong>Mac:</strong> &#8984;&nbsp;&minus;</p>' +
        '<p><strong>The tour will continue automatically as soon as the side-by-side layout appears.</strong></p>' +
        '<div class="abc-guided-tour-card-footer">' +
          '<div class="abc-guided-tour-buttons">' +
            '<button type="button" data-action="exit">Close Tour</button>' +
          '</div>' +
        '</div>';

      document.body.appendChild(card);
      gTourCard = card;

      var placement = chooseGuidedTourCardPlacement(null);
      card.style.left = placement.left + "px";
      card.style.top = Math.max(25, Math.round((window.innerHeight - card.offsetHeight) / 2)) + "px";
      card.style.width = placement.width + "px";

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
    var gap = 18;
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

  function drawGuidedTourArrow(cardEl, targetEl) {
    if (!cardEl || !targetEl) return;

    var cardRect = cardEl.getBoundingClientRect();
    var targetRect = targetEl.getBoundingClientRect();
    var startX = cardRect.left + cardRect.width / 2;
    var startY = cardRect.top + cardRect.height / 2;
    var endX = targetRect.left + targetRect.width / 2;
    var endY = targetRect.top + targetRect.height / 2;
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
        title: "Welcome to ABC Transcription Tools",
        cardWidth: 560,
        body: '<p>In a few minutes, you will complete your first ABC tunebook project.</p><p>You will <strong>add three example tunes, make an edit and see the notation update, try a tablature view, transpose a tune up and back down, and export a PDF</strong>.</p><p>The tour uses the real controls, so what you see is exactly how the tool works.</p>'
      },
      {
        title: "1. Add Some Tunes",
        selector: "#newabcfile",
        body: '<p>Most editing sessions start by opening a file or adding tunes. For this tour, we’ll start with <strong>Add</strong>. Click <strong>Next</strong> to open the <strong>Add</strong> dialog.</p><p>The <strong>Add</strong> dialog includes sample tunes, templates, file import, tune search, and other ways to build an ABC collection.</p>',
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
        body: '<p>Add <strong>Alexander’s</strong>, an example hornpipe. You now have a three-tune tunebook.</p><p>After this step, the <strong>Add</strong> dialog will close so you can work with the tunes.</p>',
        afterNext: async function () {
          document.getElementById("addnewhornpipe").click();
          await waitMs(350);
          if (typeof AddABCCallback === "function") AddABCCallback();
          return waitMs(450);
        }
      },
      {
        title: "5. How the ABC Editor Works",
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
        title: "6. Editing Updates the Music",
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
        title: "7. Try Mandolin Tablature",
        target: function () { return document.querySelector('label[for="b3"]'); },
        body: '<p>The buttons below the editor let you choose how the tunes are displayed.</p><p>Let’s try <strong>Mandolin</strong> tablature. The same ABC will now be displayed with GDAE mandolin tablature.</p>',
        afterNext: function () { setTab("b3"); return waitMs(850); }
      },
      {
        title: "8. Try Tin Whistle Fingering",
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
        title: "10. Transpose the First Tune Up",
        selector: "#transposeup",
        body: '<p>The cursor is positioned in the first tune, so the transpose buttons will act on that tune.</p><p><strong>Transpose Up</strong> moves it up one semitone. Watch the ABC key and notes change along with the rendered notation.</p>',
        afterNext: function () {
          selectFirstTune();
          TransposeUp({ shiftKey: false, altKey: false });
          return waitMs(1200);
        }
      },
      {
        title: "11. Transpose the First Tune Back Down",
        cardWidth: 560,
        selector: "#transposedown",
        body: '<p>Now we’ll use <strong>Transpose Down</strong> once. Click <strong>Next</strong> to reverse the previous semitone transposition and restore the tune to its original pitch.</p><p><strong>Transpose Up</strong> and <strong>Transpose Down</strong> are especially useful for quickly finding a better range for an instrument or singer.</p>',
        afterNext: function () {
          selectFirstTune();
          TransposeDown({ shiftKey: false, altKey: false });
          return waitMs(1200);
        }
      },
      {
        title: "12. Export Your First PDF",
        target: function () { return document.getElementById("saveaspdf") || document.getElementById("pdfbuttonicon"); },
        body: '<p>You have now added tunes, edited ABC, switched to a tablature view and back to standard notation, and transposed a tune.</p><p>Let’s turn the three tunes into a printable PDF. Click <strong>Next</strong> to open <strong>Export PDF</strong>.</p>',
        afterNext: function () {
          setGuidedTourPDFExportBaseline();
          PDFExportDialog();
          return waitMs(450);
        }
      },
      {
        title: "13. Choose One Tune per Page",
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
        title: "You’re Ready to Export",
        target: function () { return getTopmostElementByClass("modal_flat_ok"); },
        body: '<p>You just completed the core <strong>ABC Transcription Tools</strong> workflow.</p><p><strong>Add tunes → Edit the ABC → Choose a notation or tablature view → Transpose when needed → Export.</strong></p><p>Click <strong>Export</strong> to generate your first PDF. After the export is complete, the PDF file will be found in the default <strong>Downloads</strong> directory for your browser.</p><p>The guided tour ends here, and the normal PDF export will continue.</p><p>You can click the <strong>?</strong> in the upper-left corner of the tool or any dialog to jump directly to the <strong>User Guide</strong> section for the tool or dialog.</p>'
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
      card.style.top = Math.max(12, Math.min(placement.top, maxCardTop)) + "px";

      drawGuidedTourArrow(card, targetEl);

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
      var sideBySideReady = await waitForGuidedTourSideBySide();
      if (!sideBySideReady) return;

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

        break;
      }
    }
    finally {
      clearGuidedTourUI();
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(updateGuidedTourButtonVisibility, 0);
    }, { once: true });
  }
  else {
    setTimeout(updateGuidedTourButtonVisibility, 0);
  }
})();
