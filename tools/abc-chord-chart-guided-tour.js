/**
 * abc-chord-chart-guided-tour.js
 * Guided tour for the ABC Chord Chart Generator.
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

  var EXAMPLE_ABC = "X:1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT:The Banshee\nR:Reel \nL:1/8\nM:4/4\nQ:2/4=90\nK:G\n%swing 0.1\n|: \"G\" G2 GD EDB,D | GFGB d2 Bd | \"C\" eged \"G\" BAGA | \"Am\" BAGE \"D\" EDDE |\n\"G\" G2 GD EDB,D | GFGB d2 Bd | \"C\" eged \"G\" BAGA | \"Am\" BAGE \"D\" ED D2 :|\n|:\"Am\" eaag efge | \"Em\" dBBA B3 d | \"Am\" eBBB gBfB | \"G\" eBBA B3 d |\n\"Am\" eaag efge | \"Em\" dBBA B3 d | \"C\" eged \"G\" BAGA | \"Am\" BAGE \"D\" ED D2 :|\nX:1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT:The Beeswing\nR:Hornpipe\nL:1/8\nM:4/4\nQ:2/4=72\nK:G\n|: (3DEF | \"G\" GdBG \"D\" FcAF | \"G\" DBGD B,GDB, | \"C\" CEAc \"G\" B,DGB |\"Am\" (3ABA (3GFE \"D\" D2 (3DEF | \n\"G\"GdBG \"D\" FcAF | \"G\" DBGD B,GDB, | \"C\"CEAc \"G\"BAGF |\"D\" (3ABA GF \"G\" G2 :|\n|: dc |\"G\" (3BAG dB gdBG | \"D\" (3AGF dA fdAF |\"C\" ECGE cABG | \"Am\" (3ABA (3GFE \"D\" D2 (3DEF |\n\"G\" GdBG \"D\" FcAF | \"G\" DBGD B,GDB, | \"C\"CEAc \"G\" BAGF | \"D\" (3ABA GF \"G\"G2 :|\nX:1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT:Cooley's\nR:Reel \nL:1/8\nM:4/4\nQ:2/4=90\nK:D\n%swing 0.1\n|: \"Em\" EBBA B2 EB | B2 AB dBAG | \"D\" (3FED AD BDAG | FDFA BAGF |\n\"Em\" EBBA B2 EB | B2 AB defg | \"D\"afge dBAF |1 \"Bm\" DEFD \"Em\" E3 D :|2\"Bm\" DEFD \"Em\" E2 gf ||\n|: \"Em\" eBBB eBgf | eBBB gedB | \"D\" A2 FA DAFA |BAFA defg |\n\"Em\" eBBB eBgf | eBBB defg | \"D\" afge dBAF |1 \"Bm\" DEFD \"Em\" E2 gf :|2 \"Bm\" DEFD \"Em\" E4 |]\nX:1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT:Father Kelly's\nR:Reel \nL:1/8\nM:4/4\nQ:2/4=90\nK:G\n%swing 0.1\n|: \"G\" B2 GB AGEG | DGGF G2 AB | \"Am\" cBAB cBAG | \"C\" EAAG \"D\" FDGA |\n\"G\" B2 GB AGEG | DGGF GABc | d2 Bd \"C\" gdBd |1 \"D\" cAFA \"G\" G2 GA :|2 \"D\" cAFA \"G\" G2 Bc ||\n|: \"G\" d2 Bd gdBc | d2 Bd gdBd | \"C\" e2 ce agfe |\"D\" defg agfe |\n\"G\"d2 Bd gdBc | d2 Bd gdBd | \"Am\" cBAc \"G\" BAGB |1 \"D\" AGEF \"G\" G2 Bc :|2 \"D\" AGEF \"G\"G2 GA |]\nX:1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT:The Flowing Tide\nR:Hornpipe \nL:1/8\nM:4/4\n%swing\nQ:2/4=72\nK:G\nD2 |: \"G\" G2 GB dGBd | GBdg bgag | \"C\"(3efg dg \"G\" Bdge |\"C\"dBAG \"D\"edBA |\n\"G\" G2 GB dGBd | GBdg bgag | \"C\" (3efg dg \"G\"Bdge |\"D\" dBAB \"G\" G3 D :|\n|: \"Em\" GFGB AGED | \"G\" gfge dBGB | \"Am\" ceBd \"G\" ABGB |\"C\" (3cBA BG \"D\"AGEG |\n\"G\"DGBd B2 Bd | \"C\" (3cBA BG \"G\" AGEG | \"C\" DGBd \"G\" gdBG |\"D\" DGFA \"G\"G4 :|\nX:1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT:The Kesh\nR:Jig\n%swing 0.1\nL:1/8\nM:6/8\nQ:3/8=110\nK:G\n|: D | \"G\" GAG GAB | \"D\" ABA ABd |\"C\" edd gdd | edB \"D\" dBA |\n\"G\" GAG GAB | \"D\" ABA ABd |\"C\" edd \"G\" gdB | \"D\" ABA \"G\" G2 :|\n|: A |\"G\" BAB dBd |\"C\" ege dBA | \"G\" BAB dBG | \"D\" ABA AGA |\n\"G\" BAB dBd |\"C\" ege dBd | \"G\" gfg \"D\" aga | \"G\" bgf g2 :|\nX:1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT:King of the Fairies \nL:1/8\nM:4/4\nR:Hornpipe\nQ:2/4=72\nK:G\n|: B,2 | \"Em\" E^DEF GFGA | BcBA GFGA | B2 E2 EFGE |\"D\" FGFE \"Bm\" D2 B,2 |\n\"Em\" E^DEF \"D\" GFGA | \"G\"BAGB d3 c | \"Em\" B2 E2 \"D\" GFED | \"Em\" E2 ED E2 :|\n(3B^cd |\"Em\" e2 B2 Bdef | gagf e2 ef |e2 B2 BAB^c | \"D\" ded^c \"Bm\" Bc (3dcB |\n\"Em\" e2 B2 Bdef | gagf efed |Bd (3efg \"D\" fe (3def | \"Em\" e2 ed e2 ef ||\n\"G\"g3 e \"D\" f3 d | \"Em\" edB^c \"D\" d2 de |dBAF \"G\" GAB^c | \"D\" dBAF GFED |\n\"Em\" B,2 E2 EFGA | B2 e2 edef | e2 B2 \"D\" BAGF | \"Em\" E2 ED E2 |]\nX:1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT:The Lady on the Island\nR:Reel \nL:1/8\nM:4/4\nQ:2/4=90\nK:D\n%swing 0.1\n\"Bm\" BAFB AFEF | \"D\" D2 FA BAdB | \"Bm\" BAFB ADFA | \"D\" defd efdB |\n\"Bm\" BAFB AFEF | \"D\" D2 FA BAdB | \"Bm\" BAFB ADFA | \"D\" defd efdB ||\n\"D\" defd \"G\" efge | \"D\" afdf \"A\"edBA | \"D\" defd \"G\" efge | \"D\" afdf \"A\"e2 dB |\n\"D\" defd \"G\" efge | \"D\" afdf \"A\" edBA | \"G\" defg afbf | afeg fedB |]\nX:1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT:The Maid Behind the Bar\nR:Reel \nL:1/8\nM:4/4\nQ:2/4=90\nK:D\n%swing 0.1\n|: \"D\" FAAB AFED | FAAB ABde | \"Bm\" fBBA Bcde | \"G\" f2 af \"A\"edBA |\n\"D\" FAAB AFED | FAAB ABde | \"Bm\" fBBA BcdB | \"A\" AFEF \"D\" D4 :|\n|:\"D\" faab afde | (3fed ad bdaf | \"Em\" efga beef | (3gfe be gfeg |\n\"D\" fgaf bfaf | defd efde | \"Bm\" fBBA BcdB | \"A\" AFEF \"D\" D4 :|\nX:1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT:The Merry Blacksmith\nR:Reel \nL:1/8\nM:4/4\nQ:2/4=90\nK:D\n%swing 0.1\n|: \"D\" d2 dA BAFA | ABdA BAFA | ABde fded | \"G\" Beed \"A\"egfe |\n\"D\" d2 dA BAFA | ABdA BAFA | ABde \"G\"fdec |1 \"A\" dBAF \"D\" D2 A2 :|2 \"A\" dBAF \"D\" D2 fg ||\n|: \"D\" a2 ag f2 fe | d2 dA BAFA | ABde fded |\"G\" Beed \"A\" egfe | \n\"D\"a2 ag f2 fe | d2 dA BAFA | ABde \"G\"fdec |1 \"A\" dBAF \"D\" D2 fg :|2 \"A\" dBAF \"D\" D4 |]\nX:1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT:Morrison's\nR:Jig\nM:6/8\nL:1/8\nQ:3/8=110\n%swing 0.1\nK:Edor\n|:\"Em\"E2 E B2B|EBE \"D\"AFD|\"Em\"E2E B2c|\"D\"dcB AFD|\n\"Em\"E2 E B2B|EBE \"D\"AFD|\"G\"G2G FGA|\"D\"BAG FED:|\n\"Em\"Bee fee|aee \"D\"fed|\"Em\"Bee fef|\"D\"gag fed|\n\"Em\"Bee fee|aee \"D\"fef|\"G\"gfe d2A|\"D\"BAG FED|\n\"Em\"Bee fee|aee \"D\"fed|\"Em\"Bee fef|\"D\"faf def|\n\"G\"g2g gfe|\"D\"def \"G\"g2d|\"D\"edc d2A|BAG FED|]\nX:1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT:My Darling Asleep\nR:Jig\n%swing 0.1\nL:1/8\nM:6/8\nQ: 3/8=110\nK:D\ne |: \"D\" fdd \"A\" cAA | \"G\" BGB \"D\" A2 G | FAA def |\"G\" gfg \"A\" eag | \n\"D\" fdd \"A\" cAA | \"G\" BGB \"D\" A2 G | FAA \"G\" def |1 \"A\" gec \"D\" d2 e :|2 \"A\" gec \"D\" d2 A||\n|: \"D\" FAA BAG |FAA BAG | FAA def | \"G\" gfg \"A\"eag |\n\"D\" fdd \"A\" cAA | \"G\" BGB \"D\" A2 G | FAA \"G\" def |1 \"A\" gec \"D\" d2 A:|2 \"A\" gec \"D\" d3|]\nX: 1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT: Out On The Ocean\nR: Jig\n%swing 0.1\nM: 6/8\nQ:3/8=110\nL: 1/8\nK: Gmaj\n|:\"G\" D2B BAG|BdB A2B|GED G2A|B2B \"C\" AGE|\n\"G\" D2B BAG|BdB A2B|GED G2A|1 \"D\" BGF \"G\" GFE:|2 \"D\" BGF \"G\" GBd||\n\"Em\" e2e edB|ege edB|\"D\" d2d def|gfe dBA|\n\"G\" G2A B2d|\"C\" ege \"D\" dBA|\"G\" GED G2A|1 \"D\" BGF \"G\" GBd:|2 \"D\" BGF \"G\" GFE|]\nX:1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT:The Rose in the Heather\nR:Jig\n%swing 0.1\nL:1/8\nM:6/8\nQ:3/8=110\nK:D\nA |: \"D\" FGF EFE | DFA BAF | ABd \"G\" ede |\"D\" fdB AFE |\n\"D\" FGF EFE | DFA BAF | AdB \"G\" AFE |1 \"A\" FDD \"D\" D2 E :|2 \"A\" FDD \"D\" D2 e ||\n|: \"D\" fdB ABd | faa afd | \"G\" gbg \"D\" fed | \"A\" Bee efg | \n\"D\" fdB ABd | faa afa | \"G\"baf gfe |1 \"A\" fdc \"D\" d2 e :|2 \"A\" fdc \"D\" d3 |]\nX:1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT:Swinging on a Gate\nR:Reel \nL:1/8\nM:4/4\nQ:2/4=90\nK:G\n%swing 0.1\n|: \"G\" gedB G2 AB | \"C\" cABG \"D\" AGEG | \"G\" DGBd g2 g2 | \"Am\" fgag \"D\" fdef |\n\"G\" gedB G2 AB | \"C\"cABG \"G\"AGEG | \"C\"cABG \"G\"AGEG | \"D\" DGGF \"G\" G2 d2 :|\n|:\"G\" gfga bagf | gfed B2 AG | \"C\" EAAB cBAG | EAAB \"D\" cdef |\n\"G\" gfga bagf | gfed B2 AB | \"C\" cABG \"G\"AGEG | \"D\" DGGF \"G\" G4 :|\nX: 1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT: Tobin's Favourite\nR:Jig\n%swing 0.1\nM: 6/8\nL: 1/8\nQ:3/8=110\nK: Dmaj\n|:\"D \" DFA ~d3|\"A\" ecA cde|\"D\" ~f3 \"G\" ~g3|\"A\" ecA GFE|\n\"D \" DFA ~d3|\"A\" ecA cde|\"D\" f3 \"G\" gec| \"A\" edc \"D\" d3:|\n|:\"D\" dfa agf|\"A\" efg efg|\"D\" fef \"G\" ~g3|\"A\" ecA GFE|\n\"D \" DFA ~d3|\"A\" ecA cde|\"D\" f/g/af \"G\" gec| \"A\" edc \"D\" d3:|\nX:1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT:The Torn Jacket\nR:Reel \nL:1/8\nM:4/4\nQ: 2/4=90\nK:D\n%swing 0.1\n|: \"D\" F3 A d2 ed | \"A\" cAAB cdeA | \"D\" FEFA d2 ed | \"A\" cAGE \"D\" ED D2 |\n\"D\" F3 A d2 ed | \"A\"cAAB cdec | \"D\" dcde f2 ed | \"A\"cAGE \"D\" ED D2 :|\n|:\"D\" FAdf a2 af | \"G\" g2 gf gfed | \"A\" cAAB cdef | gfed cAGE |\n\"D\" FAdf a2 af | \"G\" g2 gf gfef | gaba gfed | \"A\" cAGE \"D\" ED D2 :|\nX:1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT:Tripping Up the Stairs\nR:Jig\n%swing 0.1\nL:1/8\nM:6/8\nQ: 3/8=110\nK:D\n|: \"D\" FAA \"G\" GBB | \"D\" FAd fed | \"A\" cBc ABc | \"D\" dfe \"G\" dAG |\n\"D\" FAA \"G\" GBB | \"D\" FAd fed | \"A\" cBc ABc |1 \"D\" dfe d2 A :|2 \"D\" dfe d2 c ||\n|: \"Bm\" dBB fBB | dBd fed | \"A\" cAA eAA | efe edc |\n\"Bm\" dBB fBB | dBd fed | \"A\" cBc ABc |1 \"D\" dfe d2 c :|2 \"D\" dfe d3 |]\nX: 1\nT: Willie Coleman's\nR: jig\nM: 6/8\nL: 1/8\nK: Gmaj\n\"G\" ~B3 AGE|GED GBd|edB dgb|age \"D\" dBA|\n\"G\" BAG AGE|GED GBd|\"C\" edB \"D\" dBA|\"G\" BGG G3:|\n\"G\" ~g3 edB|dgb age|~g3 edB|GBd \"C\" e2d|\n\"G\" gfg edB|dgb age|~d3 gdB|\"D\" AGE \"G\" G3:|\nX: 1\n%%titlefont Palatino 18\n%%subtitlefont Palatino 13\n%%infofont Palatino 13\n%%partsfont Palatino 13\n%%tempofont Palatino 13\n%%textfont Palatino 13\nT: The Wind That Shakes The Barley\nR:Reel\n%swing 0.1\nQ:2/4=90\nM: 4/4\nL: 1/8\nK: Dmaj\n%swing 0.1\n\"D\" A2AB AFED|\"G\" B2BA BcdB|\"D\" A2AB AFED|\"G\" gfed \"A\" BcdB|\n\"D\" A2AB AFED|\"G\" B2BA BcdB|\"D\" A2AB AFED|\"G\" gfed \"A\" Bcde||\n\"D\" f2fd \"G\" g2ge|\"D\" f2fd \"Bm\" Bcde|\"D\" f2fd \"G\" g2fg|\"D\" afed \"A\" Bcde|\n\"D\" f2fd \"G\" g2ge|\"D\" f2fd \"Bm\" Bcde|\"G\" defg afbf|afed \"A\" BcdB||\n";

  function waitMs(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function isDesktopBrowser() {
    var ua = navigator.userAgent || "";
    var mobileUA = /Android|iPhone|iPad|iPod|Mobile|IEMobile|Opera Mini/i.test(ua);
    var finePointer = !window.matchMedia || window.matchMedia("(pointer: fine)").matches;
    var hoverCapable = !window.matchMedia || window.matchMedia("(hover: hover)").matches;
    return !mobileUA && finePointer && hoverCapable;
  }

  function updateLauncherVisibility() {
    var button = document.getElementById("chord-chart-guided-tour-launch-button");
    if (!button) return;
    button.style.display = isDesktopBrowser() ? "block" : "none";
  }

  function injectStyles() {
    if (document.getElementById("chord-chart-guided-tour-styles")) return;

    var style = document.createElement("style");
    style.id = "chord-chart-guided-tour-styles";
    style.textContent = `
      .chord-chart-tour-overlay {
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.18);
        z-index:2500;
        pointer-events:auto;
      }

      .chord-chart-tour-card {
        position:fixed;
        z-index:2147483646;
        width:min(460px,calc(100vw - 24px));
        max-width:calc(100vw - 24px);
        max-height:calc(100vh - 24px);
        overflow-y:auto;
        overscroll-behavior:contain;
        background:#f5ffff;
        border:1px solid #bfcfcf;
        border-radius:5px;
        box-shadow:0 10px 26px rgba(0,0,0,.25);
        padding:24px;
        box-sizing:border-box;
        font-family:Helvetica,Arial,sans-serif;
      }

      .chord-chart-tour-card h2 {
        margin:0 0 10px;
        color:#000;
        font-size:1.45em;
        line-height:normal;
        text-align:left;
      }

      .chord-chart-tour-card p {
        margin:0 0 10px;
        color:#000;
        font-size:12pt;
        line-height:18pt;
      }

      .chord-chart-tour-footer {
        margin-top:14px;
        padding-top:12px;
        border-top:1px solid #d8e3e3;
      }

      .chord-chart-tour-count {
        margin-bottom:12px;
        color:#333;
        font-size:.95em;
        text-align:center;
      }

      .chord-chart-tour-buttons {
        display:flex;
        justify-content:center;
        gap:10px;
        flex-wrap:wrap;
      }

      .chord-chart-tour-buttons button {
        min-width:96px;
        padding:7px 16px;
        color:#000;
        background:#e5e5e5;
        border:1px solid #aaa;
        border-radius:6px;
        font:11pt Helvetica,Arial,sans-serif;
        cursor:pointer;
      }

      .chord-chart-tour-buttons button:hover,
      .chord-chart-tour-buttons button:focus-visible {
        background:#d5d5d5;
        outline:none;
      }

      .chord-chart-tour-highlight {
        position:relative;
        z-index:2147483644 !important;
        box-shadow:0 0 0 4px rgba(0,90,173,.30),0 0 0 9999px rgba(255,255,255,.06) !important;
        border-radius:8px;
      }

      .chord-chart-tour-arrow-layer {
        position:fixed;
        inset:0;
        width:100vw;
        height:100vh;
        z-index:2147483645;
        pointer-events:none;
        overflow:visible;
      }

      .chord-chart-tour-arrow-path {
        stroke:#d32f2f;
        stroke-width:3;
        fill:none;
        stroke-linecap:round;
        stroke-linejoin:round;
        filter:drop-shadow(0 1px 2px rgba(0,0,0,.2));
      }

      @media (max-height:720px) {
        .chord-chart-tour-card {
          padding:18px 20px;
        }

        .chord-chart-tour-card h2 {
          margin-bottom:8px;
          font-size:1.3em;
        }

        .chord-chart-tour-card p {
          margin-bottom:8px;
          font-size:11pt;
          line-height:16pt;
        }

        .chord-chart-tour-footer {
          margin-top:10px;
          padding-top:9px;
        }

        .chord-chart-tour-count {
          margin-bottom:8px;
        }

        .chord-chart-tour-buttons button {
          padding:6px 14px;
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
      highlightedElement.classList.remove("chord-chart-tour-highlight");
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
    var targetX = clamp(cardCenterX,targetRect.left+6,targetRect.right-6);
    var targetY = clamp(cardCenterY,targetRect.top+6,targetRect.bottom-6);
    var dx = targetX-cardCenterX;
    var dy = targetY-cardCenterY;
    var startX;
    var startY;

    if (Math.abs(dx) > Math.abs(dy)) {
      startX = dx >= 0 ? cardRect.right : cardRect.left;
      startY = clamp(targetY,cardRect.top+18,cardRect.bottom-18);
    }
    else {
      startX = clamp(targetX,cardRect.left+18,cardRect.right-18);
      startY = dy >= 0 ? cardRect.bottom : cardRect.top;
    }

    var svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("class","chord-chart-tour-arrow-layer");
    svg.setAttribute("viewBox","0 0 "+window.innerWidth+" "+window.innerHeight);

    var defs = document.createElementNS("http://www.w3.org/2000/svg","defs");
    var marker = document.createElementNS("http://www.w3.org/2000/svg","marker");
    marker.setAttribute("id","chordChartTourArrowHead");
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
    path.setAttribute("class","chord-chart-tour-arrow-path");
    var controlX = Math.abs(dx)>Math.abs(dy) ? (startX+targetX)/2 : startX;
    var controlY = Math.abs(dx)>Math.abs(dy) ? startY : (startY+targetY)/2;
    path.setAttribute("d","M "+startX+" "+startY+" Q "+controlX+" "+controlY+", "+targetX+" "+targetY);
    path.setAttribute("marker-end","url(#chordChartTourArrowHead)");
    svg.appendChild(path);

    document.body.appendChild(svg);
    arrowLayer = svg;
  }

  function positionUI(step,target) {
    if (!card) return;
    var width = Math.min(step.width || 460,window.innerWidth-24);
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
      overlay.className = "chord-chart-tour-overlay";
      document.body.appendChild(overlay);

      if (target) {
        target.classList.add("chord-chart-tour-highlight");
        highlightedElement = target;
      }

      card = document.createElement("div");
      card.className = "chord-chart-tour-card";
      card.innerHTML =
        "<h2>"+step.title+"</h2>" +
        step.body +
        '<div class="chord-chart-tour-footer">' +
          '<div class="chord-chart-tour-count">'+(index+1)+" of "+total+"</div>" +
          '<div class="chord-chart-tour-buttons">' +
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

  function steps() {
    return [
      {
        title:"Welcome to the Chord Chart Generator Guided Tour",
        width:780,
        body:'<p>In a few minutes, you will create chord charts from 20 traditional Irish session tunes, try a different chart font, save the charts as a text file, and send them to the Website Builder.</p><p>The tour starts by restoring the default settings so everyone begins from the same place.</p>',
        afterNext:async function () {
          api.resetAndLoadExample(EXAMPLE_ABC);
          await waitMs(300);
        }
      },
      {
        title:"1. Example Tunes Loaded",
        selector:"#abcIn",
        width:500,
        body:'<p>The settings are back at their defaults, and 20 example tunes are now in the ABC Input area.</p><p>When you open your own ABC file, the tool works the same way: the chord charts appear automatically.</p>'
      },
      {
        title:"2. Chord Charts Generated Automatically",
        selector:"#out",
        width:660,
        body:'<p>The chord charts appeared as soon as the tunes were loaded, so there was no need to click <strong>Generate Charts</strong>.</p><p>Next, you will see how changing a display setting updates the charts right away.</p>'
      },
      {
        title:"3. Try a Different Chord Chart Font",
        selector:"#chartMonoFont",
        width:610,
        body:'<p>Click <strong>Next</strong> to change the chord chart font from <strong>System Mono</strong> to <strong>Courier New (Bold)</strong>.</p><p>Watch the charts update immediately.</p>',
        afterNext:async function () {
          api.setChartFont("courier-bold");
          await waitMs(200);
        }
      },
      {
        title:"4. The New Font Is Applied",
        selector:"#out",
        width:500,
        body:'<p>The tune titles and chord charts now use <strong>Courier New (Bold)</strong>.</p><p>You can try different chart fonts at any time, and the display updates automatically.</p>'
      },
      {
        title:"5. Save or Copy the Chord Chart Text",
        selector:"#saveBtn",
        width:620,
        body:'<p>Click <strong>Next</strong> to open the Save dialog and save all of the chord charts in a text file.</p><p>You can also click <strong>Copy</strong> at any time to copy the chord chart text to the clipboard.</p><p>After you save the file or cancel the dialog, the tour will continue.</p>',
        afterNext:async function () {
          await api.saveChordChartsAsText();
          await waitMs(150);
        }
      },
      {
        title:"6. Print Nicely Formatted Chord Charts",
        selector:"#printBtn",
        width:620,
        body:'<p>You can also print the chord charts in a clean, easy-to-read format by clicking <strong>Print</strong>.</p><p>The tour will not open the print dialog, so just click <strong>Next</strong> to continue.</p>'
      },
      {
        title:"7. Set the Website Title Size",
        selector:"#websiteTitleFontSize",
        width:540,
        body:'<p>The Website Settings determine how the chord charts will look after they are sent to the Website Builder.</p><p>Click <strong>Next</strong> to change the website title font size from <strong>14</strong> to <strong>18</strong>.</p>',
        afterNext:async function () {
          api.setWebsiteTitleFontSize(18);
          await waitMs(150);
        }
      },
      {
        title:"8. Open the Chord Charts in the Website Builder",
        selector:"#generateWebsiteBtn",
        width:690,
        finalActionLabel:"Open Website Builder",
        body:'<p>The website title font size is now set to <strong>18</strong>.</p><p>Click <strong>Open Website Builder</strong> to send the chord charts to the abcjs-eskin Website Builder.</p><p>The Website Builder has its own Guided Tour, which is a good way to learn how to preview, customize, and save the finished website.</p><p>This completes the Chord Chart Generator tour.</p>',
        afterDone:function () {
          api.launchWebsiteBuilder();
        }
      }
    ];
  }

  async function runTour() {
    if (tourRunning) return;
    if (!isDesktopBrowser()) return;

    api = window.ChordChartGuidedTourAPI;
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
    finally {
      clearUI();
      tourRunning = false;
    }
  }

  document.addEventListener("click",function (event) {
    var button = event.target.closest("#chord-chart-guided-tour-launch-button");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    void runTour();
  });

  window.StartChordChartGuidedTour = runTour;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded",function () {
      setTimeout(updateLauncherVisibility,0);
    },{ once:true });
  }
  else {
    setTimeout(updateLauncherVisibility,0);
  }
})();
