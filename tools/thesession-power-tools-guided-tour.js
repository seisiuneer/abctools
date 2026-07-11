/**
 * thesession-power-tools-guided-tour.js
 * Guided tour for thesession.org Power Tools.
 *
 * MIT License
 * Copyright (c) 2026 Michael Eskin
 */
(function () {
  "use strict";

  var api = null;
  var tourRunning = false;
  var overlay = null;
  var card = null;
  var arrowLayer = null;
  var highlightedElement = null;
  var layoutHandler = null;
  var layoutFrame = 0;

  function isDesktopBrowser() {
    if (!window.matchMedia) return true;
    return window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(max-width: 760px)").matches;
  }

  function updateLauncherVisibility() {
    var button = document.getElementById("session-power-tools-guided-tour-launch-button");
    if (!button) return;
    button.style.display = isDesktopBrowser() ? "block" : "none";
  }

  function injectStyles() {
    if (document.getElementById("session-power-tools-guided-tour-styles")) return;

    var style = document.createElement("style");
    style.id = "session-power-tools-guided-tour-styles";
    style.textContent = `
      .session-power-tools-tour-overlay{
        position:fixed;
        inset:0;
        z-index:2500;
        background:rgba(0,0,0,.34);
        pointer-events:none;
      }
      .session-power-tools-tour-card{
        position:fixed;
        z-index:2147483646;
        max-width:calc(100vw - 24px);
        max-height:calc(100vh - 24px);
        overflow:auto;
        padding:24px;
        color:#17241c;
        background:#fff;
        border:1px solid #b9cabf;
        border-radius:5px;
        box-shadow:0 12px 36px rgba(0,0,0,.30);
        font:16px/1.48 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      }
      .session-power-tools-tour-card h2{
        margin:0 0 14px;
        color:#0d4c2f;
        font-size:24px;
        line-height:1.2;
      }
      .session-power-tools-tour-card p{
        margin:0 0 12px;
      }
      .session-power-tools-tour-card p:last-of-type{
        margin-bottom:0;
      }
      .session-power-tools-tour-footer{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:16px;
        margin-top:20px;
        padding-top:16px;
        border-top:1px solid #d7e1da;
      }
      .session-power-tools-tour-count{
        color:#5d6c63;
        white-space:nowrap;
      }
      .session-power-tools-tour-buttons{
        display:flex;
        justify-content:flex-end;
        gap:10px;
        flex-wrap:wrap;
      }
      .session-power-tools-tour-buttons button{
        min-width:104px;
        padding:9px 15px;
        color:#fff;
        background:#176b43;
        border:1px solid #0d4c2f;
        border-radius:6px;
        font-weight:700;
      }
      .session-power-tools-tour-buttons button:hover{
        background:#0d4c2f;
      }
      .session-power-tools-tour-highlight{
        position:relative !important;
        z-index:2147483644 !important;
        outline:4px solid #ffd54f !important;
        outline-offset:4px !important;
        box-shadow:0 0 0 9999px rgba(0,0,0,.05) !important;
      }
      .session-power-tools-tour-arrow-layer{
        position:fixed;
        inset:0;
        z-index:2147483645;
        width:100vw;
        height:100vh;
        pointer-events:none;
        overflow:visible;
      }
      .session-power-tools-tour-arrow-path{
        fill:none;
        stroke:#d32f2f;
        stroke-width:4;
        stroke-linecap:round;
      }
      @media (max-height:650px){
        .session-power-tools-tour-card{
          padding:18px 20px;
          font-size:15px;
        }
        .session-power-tools-tour-card h2{
          margin-bottom:10px;
          font-size:21px;
        }
        .session-power-tools-tour-footer{
          margin-top:14px;
          padding-top:12px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function clearUI() {
    if (layoutHandler) {
      window.removeEventListener("resize", layoutHandler);
      window.removeEventListener("scroll", layoutHandler, true);
      layoutHandler = null;
    }
    if (layoutFrame) {
      cancelAnimationFrame(layoutFrame);
      layoutFrame = 0;
    }
    if (highlightedElement) {
      highlightedElement.classList.remove("session-power-tools-tour-highlight");
      highlightedElement = null;
    }
    if (arrowLayer) {
      arrowLayer.remove();
      arrowLayer = null;
    }
    if (card) {
      card.remove();
      card = null;
    }
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  }

  function resolveTarget(step) {
    if (typeof step.target === "function") return step.target();
    if (step.selector) return document.querySelector(step.selector);
    return null;
  }

  async function prepareTarget(step) {
    if (typeof step.beforeTarget === "function") await step.beforeTarget();
    if (!step.selector && typeof step.target !== "function") return null;

    var target = resolveTarget(step);
    if (!target) return null;

    try {
      target.scrollIntoView({
        behavior:"auto",
        block:step.scrollBlock || "center",
        inline:"nearest"
      });
    }
    catch (error) {
      target.scrollIntoView();
    }

    await new Promise(function (resolve) {
      requestAnimationFrame(function () {
        requestAnimationFrame(resolve);
      });
    });

    return target;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function visibleRect(element) {
    if (!element) return null;
    var rect = element.getBoundingClientRect();
    var left = clamp(rect.left, 0, window.innerWidth);
    var right = clamp(rect.right, 0, window.innerWidth);
    var top = clamp(rect.top, 0, window.innerHeight);
    var bottom = clamp(rect.bottom, 0, window.innerHeight);
    if (right <= left || bottom <= top) return null;
    return {
      left:left,
      right:right,
      top:top,
      bottom:bottom,
      width:right-left,
      height:bottom-top,
      centerX:left+(right-left)/2,
      centerY:top+(bottom-top)/2
    };
  }

  function choosePlacement(targetRect, width, height) {
    var margin = 12;
    var gap = 18;
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    if (!targetRect) {
      return {
        left:clamp((vw-width)/2, margin, Math.max(margin,vw-width-margin)),
        top:clamp(20, margin, Math.max(margin,vh-height-margin))
      };
    }

    var candidates = [
      { left:targetRect.right+gap, top:targetRect.centerY-height/2 },
      { left:targetRect.left-width-gap, top:targetRect.centerY-height/2 },
      { left:targetRect.centerX-width/2, top:targetRect.bottom+gap },
      { left:targetRect.centerX-width/2, top:targetRect.top-height-gap }
    ];

    function overflow(candidate) {
      return Math.max(0,margin-candidate.left) +
        Math.max(0,candidate.left+width+margin-vw) +
        Math.max(0,margin-candidate.top) +
        Math.max(0,candidate.top+height+margin-vh);
    }

    candidates.sort(function (a,b) { return overflow(a)-overflow(b); });
    var selected = candidates[0];
    return {
      left:clamp(selected.left,margin,Math.max(margin,vw-width-margin)),
      top:clamp(selected.top,margin,Math.max(margin,vh-height-margin))
    };
  }

  function drawArrow(target) {
    if (arrowLayer) {
      arrowLayer.remove();
      arrowLayer = null;
    }
    if (!card || !target) return;

    var targetRect = visibleRect(target);
    if (!targetRect) return;
    var cardRect = card.getBoundingClientRect();
    var cardCenterX = cardRect.left + cardRect.width/2;
    var cardCenterY = cardRect.top + cardRect.height/2;
    var endX = clamp(cardCenterX,targetRect.left+6,targetRect.right-6);
    var endY = clamp(cardCenterY,targetRect.top+6,targetRect.bottom-6);
    var dx = endX-cardCenterX;
    var dy = endY-cardCenterY;
    var startX;
    var startY;

    if (Math.abs(dx) > Math.abs(dy)) {
      startX = dx >= 0 ? cardRect.right : cardRect.left;
      startY = clamp(endY,cardRect.top+18,cardRect.bottom-18);
    }
    else {
      startX = clamp(endX,cardRect.left+18,cardRect.right-18);
      startY = dy >= 0 ? cardRect.bottom : cardRect.top;
    }

    var svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("class","session-power-tools-tour-arrow-layer");
    svg.setAttribute("viewBox","0 0 "+window.innerWidth+" "+window.innerHeight);

    var defs = document.createElementNS("http://www.w3.org/2000/svg","defs");
    var marker = document.createElementNS("http://www.w3.org/2000/svg","marker");
    marker.setAttribute("id","sessionPowerToolsTourArrowHead");
    marker.setAttribute("markerWidth","10");
    marker.setAttribute("markerHeight","10");
    marker.setAttribute("refX","8");
    marker.setAttribute("refY","3");
    marker.setAttribute("orient","auto");
    var head = document.createElementNS("http://www.w3.org/2000/svg","path");
    head.setAttribute("d","M0,0 L0,6 L9,3 z");
    head.setAttribute("fill","#d32f2f");
    marker.appendChild(head);
    defs.appendChild(marker);
    svg.appendChild(defs);

    var path = document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute("class","session-power-tools-tour-arrow-path");
    var controlX = Math.abs(dx) > Math.abs(dy) ? (startX+endX)/2 : startX;
    var controlY = Math.abs(dx) > Math.abs(dy) ? startY : (startY+endY)/2;
    path.setAttribute("d","M "+startX+" "+startY+" Q "+controlX+" "+controlY+", "+endX+" "+endY);
    path.setAttribute("marker-end","url(#sessionPowerToolsTourArrowHead)");
    svg.appendChild(path);
    document.body.appendChild(svg);
    arrowLayer = svg;
  }

  function positionUI(step,target) {
    if (!card) return;
    var width = Math.min(step.width || 500,window.innerWidth-24);
    card.style.width = width+"px";
    var height = Math.min(card.offsetHeight,Math.max(120,window.innerHeight-24));
    var placement = choosePlacement(visibleRect(target),width,height);
    card.style.left = placement.left+"px";
    card.style.top = placement.top+"px";
    drawArrow(target);
  }

  function installLiveLayout(step,target) {
    layoutHandler = function () {
      if (layoutFrame) cancelAnimationFrame(layoutFrame);
      layoutFrame = requestAnimationFrame(function () {
        layoutFrame = 0;
        positionUI(step,target);
      });
    };
    window.addEventListener("resize",layoutHandler);
    window.addEventListener("scroll",layoutHandler,true);
  }

  function showStep(step,index,total) {
    return new Promise(async function (resolve) {
      clearUI();
      var target = await prepareTarget(step);

      overlay = document.createElement("div");
      overlay.className = "session-power-tools-tour-overlay";
      document.body.appendChild(overlay);

      if (target) {
        target.classList.add("session-power-tools-tour-highlight");
        highlightedElement = target;
      }

      card = document.createElement("div");
      card.className = "session-power-tools-tour-card";
      card.innerHTML =
        "<h2>"+step.title+"</h2>" +
        step.body +
        '<div class="session-power-tools-tour-footer">' +
          '<div class="session-power-tools-tour-count">'+(index+1)+" of "+total+"</div>" +
          '<div class="session-power-tools-tour-buttons">' +
            '<button type="button" data-action="close">Close Tour</button>' +
            '<button type="button" data-action="next">'+
              (step.finalActionLabel || (index === total-1 ? "Finish" : "Next"))+
            "</button>" +
          "</div>" +
        "</div>";
      document.body.appendChild(card);

      positionUI(step,target);
      installLiveLayout(step,target);

      card.querySelector('[data-action="close"]').addEventListener("click",function () {
        resolve("close");
      });
      card.querySelector('[data-action="next"]').addEventListener("click",function () {
        resolve(index === total-1 ? "done" : "next");
      });
    });
  }

  function showError(message) {
    clearUI();
    overlay = document.createElement("div");
    overlay.className = "session-power-tools-tour-overlay";
    document.body.appendChild(overlay);

    card = document.createElement("div");
    card.className = "session-power-tools-tour-card";
    card.style.width = Math.min(560,window.innerWidth-24)+"px";
    card.innerHTML =
      "<h2>Guided Tour Stopped</h2>" +
      "<p>"+String(message || "The Guided Tour could not continue.")+"</p>" +
      '<div class="session-power-tools-tour-footer">' +
        '<div></div>' +
        '<div class="session-power-tools-tour-buttons">' +
          '<button type="button" data-action="close">Close</button>' +
        "</div>" +
      "</div>";
    document.body.appendChild(card);
    positionUI({ width:560 },null);
    card.querySelector('[data-action="close"]').addEventListener("click",function () {
      clearUI();
    });
  }

  function steps() {
    return [
      {
        title:"Welcome to the Guided Tour",
        width:560,
        body:'<p>This tour shows how to fetch tune settings from thesession.org, download the results as an ABC file, and open them in the abcjs-eskin Website Builder.</p><p>The tour uses the example tune and member URLs already shown in the tool.</p>',
        afterNext:async function () {
          api.reset();
          api.setTuneExample();
        }
      },
      {
        title:"1. Example Tune URL",
        selector:"#tuneUrl",
        width:500,
        body:'<p>The example tune URL is ready.</p><p>For a tune page, the tool fetches every available setting for that tune.</p><p>You can use <strong>Find Tune…</strong> to search for any tune by name. The tool automatically enters the tune URL for you.</p>'
      },
      {
        title:"2. Fetch the Tune Settings",
        selector:"#btnFetch",
        width:520,
        body:'<p>Click <strong>Next</strong> and the tour will use the normal <strong>Fetch</strong> button to get the tune settings from thesession.org.</p>',
        afterNext:async function () {
          await api.fetchCurrentExample(180000);
        }
      },
      {
        title:"3. Tune Settings Ready",
        selector:"#out",
        width:520,
        body:'<p>All settings for the example tune are now combined in the ABC Tune Settings box.</p><p>The ABC can be edited, copied, downloaded, or opened in another tool.</p>',
        afterNext:async function () {
          api.setMemberExample();
        }
      },
      {
        title:"4. Example Member URL",
        selector:"#tuneUrl",
        width:520,
        body:'<p>The example member URL is now loaded.</p><p><strong>Submitted Tune Settings</strong> is selected, so the next fetch will collect the settings submitted by this member.</p><p>You can use <strong>Find Member…</strong> to search for any thesession.org member by name. The tool automatically enters the member’s URL for you.</p>'
      },
      {
        title:"5. Fetch the Member’s Tune Settings",
        selector:"#btnFetch",
        width:590,
        body:'<p>Click <strong>Next</strong> to fetch the member’s submitted tune settings from thesession.org.</p><p>This may take a little longer than fetching one tune.</p>',
        afterNext:async function () {
          await api.fetchCurrentExample(240000);
        }
      },
      {
        title:"6. Combined ABC Results",
        selector:"#out",
        width:520,
        body:'<p>The submitted tune settings are now combined into one ABC file.</p><p>You can edit the ABC before saving or opening it in another tool.</p>'
      },
      {
        title:"7. Download the ABC File",
        selector:"#btnDownload",
        width:520,
        body:'<p>Click <strong>Next</strong> to open the normal save dialog and download the fetched tune settings as an ABC file.</p><p>The saved ABC file will be in the default Downloads directory for your browser.</p><p>After saving or canceling the dialog, the tour will continue.</p>',
        afterNext:async function () {
          await api.downloadABCFile();
        }
      },
      {
        title:"8. Open the Results in the abcjs-eskin Website Builder",
        selector:"#btnOpenInWebsiteBuilder",
        width:650,
        finalActionLabel:"Open Website Builder",
        body:'<p>Click <strong>Open Website Builder</strong> to send the fetched tunes directly to the abcjs-eskin Website Builder.</p><p>The Website Builder also includes a Guided Tour to help you get started.</p><p>This completes the thesession.org Power Tools tour.</p>',
        afterDone:function () {
          api.launchWebsiteBuilder();
        }
      }
    ];
  }

  async function runTour() {
    if (tourRunning) return;
    if (!isDesktopBrowser()) return;

    api = window.SessionPowerToolsGuidedTourAPI;
    if (!api) return;

    injectStyles();
    tourRunning = true;

    try {
      var tourSteps = steps();
      for (var index=0; index<tourSteps.length; index++) {
        var step = tourSteps[index];
        var action = await showStep(step,index,tourSteps.length);
        clearUI();

        if (action === "next") {
          if (typeof step.afterNext === "function") await step.afterNext();
          continue;
        }

        if (action === "done") {
          if (typeof step.afterDone === "function") step.afterDone();
          return;
        }

        return;
      }
    }
    catch (error) {
      console.error(error);
      showError(error && error.message ? error.message : String(error));
    }
    finally {
      tourRunning = false;
    }
  }

  document.addEventListener("click",function (event) {
    var button = event.target.closest("#session-power-tools-guided-tour-launch-button");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    void runTour();
  });

  window.StartSessionPowerToolsGuidedTour = runTour;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded",function () {
      setTimeout(updateLauncherVisibility,0);
    },{ once:true });
  }
  else {
    setTimeout(updateLauncherVisibility,0);
  }
})();
