/* ABC Player PDF Export — shared implementation for main notation and All… sheets.
 * Repeat/ending-safe capture + printable custom-font preflight: 2026-10-22.
 * Install this file beside the players, pdf-lib-min.js, and html2image.js.
 * No shared preferences are included in tune/lesson URLs.
 */
(function(global){
'use strict';
function initNotation(config) {

  'use strict';
  const mode = config.mode || 'isolated';
  const hasTunes = () => !!config.hasTunes();
  const button = document.getElementById('exportPdfBtn');
  const dialog = document.getElementById('playerPdfModal');
  const sizeSelect = document.getElementById('playerPdfSize');
  const orientationSelect = document.getElementById('playerPdfOrientation');
  // Optional main-notation PDF option. Older players without this control are unchanged.
  const clickTitleHeader = document.getElementById('playerPdfClickTitleHeader');
  const statusModal = document.getElementById('playerPdfStatusModal');
  const statusText = document.getElementById('playerPdfStatusText');
  if (!button || !dialog || !sizeSelect || !orientationSelect || !statusModal || !statusText) return;

  // These preferences are deliberately independent of tune, share and lesson URLs.
  const storageKey = 'player-pdf-export:v1:' + config.playerId;
  const supportedSizes = new Set(['letter', 'a4']);
  const supportedOrientations = new Set(['portrait', 'landscape']);
  const restorePreferences = () => {
    try {
      const p = JSON.parse(localStorage.getItem(storageKey) || '{}');
      if (supportedSizes.has(p.size)) sizeSelect.value = p.size;
      if (supportedOrientations.has(p.orientation)) orientationSelect.value = p.orientation;
      if (clickTitleHeader && typeof p.clickTitleHeader === 'boolean')
        clickTitleHeader.checked = p.clickTitleHeader;
    } catch (_) { /* Local storage may be unavailable. */ }
  };
  const savePreferences = () => {
    try {
      const prefs = {size: sizeSelect.value, orientation: orientationSelect.value};
      if (clickTitleHeader) prefs.clickTitleHeader = clickTitleHeader.checked;
      localStorage.setItem(storageKey, JSON.stringify(prefs));
    } catch (_) { /* PDF export remains available with storage disabled. */ }
  };
  restorePreferences();
  sizeSelect.addEventListener('change', savePreferences);
  orientationSelect.addEventListener('change', savePreferences);
  if (clickTitleHeader) clickTitleHeader.addEventListener('change', savePreferences);

  const openDialog = () => {
    if (!document.querySelector('#notation svg') || !hasTunes()) {
      window.alert('Load a tune to export its notation.');
      return;
    }
    dialog.classList.add('open');
    document.getElementById('playerPdfCancel').focus();
  };
  const closeDialog = () => dialog.classList.remove('open');
  // This blocking dialog remains visible until the generated file has been saved,
  // including during font readiness, system capture and PDF serialization.
  const setStatus = message => { statusText.textContent = message; };
  const showStatus = () => {
    setStatus('Preparing notation…');
    statusModal.classList.add('open');
    statusModal.focus();
  };
  const hideStatus = () => statusModal.classList.remove('open');
  const allowStatusPaint = () => new Promise(resolve =>
    requestAnimationFrame(() => setTimeout(resolve, 0)));

  button.addEventListener('click', openDialog);
  document.getElementById('playerPdfCancel').addEventListener('click', closeDialog);
  dialog.addEventListener('click', e => { if (e.target === dialog) closeDialog(); });
  dialog.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); closeDialog(); }
  });

  // getBBox returns SVG drawing units and includes text, notation and tablature.
  const drawingBox = node => {
    try {
      const b = node.getBBox();
      if ([b.x,b.y,b.width,b.height].every(Number.isFinite) && b.width > 0 && b.height > 0)
        return {top: b.y, bottom: b.y + b.height};
    } catch (_) {}
    return null;
  };
  function findSystemBands(svg) {
    const byLine = new Map();
    for (const el of svg.querySelectorAll('[class*="abcjs-l"]')) {
      const match = (el.getAttribute('class') || '').match(/(?:^|\s)abcjs-l(\d+)(?=\s|$)/);
      if (!match || !el.getBBox || el.closest('.abcjs-cursor')) continue;
      const b = drawingBox(el);
      if (!b) continue;
      const n = Number(match[1]);
      if (!byLine.has(n)) byLine.set(n, {...b});
      else {
        const group = byLine.get(n);
        group.top = Math.min(group.top, b.top);
        group.bottom = Math.max(group.bottom, b.bottom);
      }
    }
    const bands = [...byLine.entries()].map(([line, b]) => ({line, ...b}))
      .sort((a,b) => a.top - b.top);
    if (!bands.length) throw new Error('No abcjs staff systems were found in the notation.');

    // Older Fretboard/Ocarina layouts used a crop-based fallback for tab layers.
    if (mode === 'legacy-crop') {
      for (const layer of svg.querySelectorAll('.mdTabAdded')) {
        const b=drawingBox(layer);if(!b)continue;
        let target=bands[0];
        for(const band of bands){if(band.top<=b.top)target=band;else break;}
        target.top=Math.min(target.top,b.top);target.bottom=Math.max(target.bottom,b.bottom);
      }
    }
    if (mode === 'dulcimer') {
      for (const layer of svg.querySelectorAll('.mdTabAdded')) {
        const b = drawingBox(layer);
        if (!b) continue;
        const m = (layer.getAttribute('aria-label')||'').match(/^Dulcimer tablature line (\d+)$/);
        const target = m ? bands.find(e => e.line === Number(m[1])-1) : null;
        if (target) { target.top = Math.min(target.top, b.top); target.bottom = Math.max(target.bottom, b.bottom); }
      }
    }
    return bands;
  }

  function svgSlices(svg) {
    const view = svg.viewBox && svg.viewBox.baseVal;
    const x = view && view.width > 0 ? view.x : 0;
    const y = view && view.height > 0 ? view.y : 0;
    const width = view && view.width > 0 ? view.width : (svg.getBBox().width || 800);
    const bands = findSystemBands(svg);
    if (mode === 'legacy-crop') {
      const blocks = [];
      for (const band of bands) {
        if (blocks.length && blocks[blocks.length-1].bottom + 4 >= band.top) {
          blocks[blocks.length-1].bottom = Math.max(blocks[blocks.length-1].bottom, band.bottom);
        } else blocks.push({top:band.top,bottom:band.bottom});
      }
      const contentBottom = Math.max(y+(view?.height||0), blocks[blocks.length-1].bottom+12);
      const boundaries = [Math.min(y,blocks[0].top-12)];
      for (let i=0;i<blocks.length-1;i++) boundaries.push((blocks[i].bottom+blocks[i+1].top)/2);
      boundaries.push(contentBottom);
      return {x,width,slices:boundaries.slice(0,-1).map((start,i)=>({start,height:boundaries[i+1]-start}))
        .filter(slice => slice.height > 0)};
    }
    const padTop = mode === 'dulcimer' ? 10 : 9, padBottom = mode === 'dulcimer' ? 10 : 9;
    return {x, width, slices:bands.map((band, index) => {
      // The first system includes the tune title, meter and other metadata.
      const start = index === 0 ? Math.min(y, band.top-padTop) : band.top-padTop;
      return {line:band.line, start, height:band.bottom+padBottom-start};
    }).filter(slice => slice.height > 0)};
  }

  // The complete score is drawn in a single SVG. Crop-only pagination can
  // neither preserve both overlapping systems nor split them cleanly. Remove
  // elements belonging to other lines *from the cloned SVG* before capturing
  // each system. The original notation and playback markup are untouched.
  function isolatePdfSystem(clone, line) {
    for (const el of clone.querySelectorAll('[class*="abcjs-l"]')) {
      const match = (el.getAttribute('class') || '')
        .match(/(?:^|\s)abcjs-l(\d+)(?=\s|$)/);
      if (match && Number(match[1]) !== line) el.remove();
    }
    if (mode === 'dulcimer') {
      for (const layer of clone.querySelectorAll('.mdTabAdded')) {
        const match = (layer.getAttribute('aria-label')||'').match(/^Dulcimer tablature line (\d+)$/);
        if (match && Number(match[1])-1 !== line) layer.remove();
      }
    }
  }

  // Locate the visible first tune title in the same SVG coordinate space as
  // the per-system raster captures. Handles titles inside transformed groups.
  function pdfTitleBounds(svg) {
    const title=svg.querySelector('text.abcjs-title, .abcjs-title');
    if (!title || !title.getBBox) return null;
    try {
      const b=title.getBBox();
      if (!(b.width>0 && b.height>0)) return null;
      const from=title.getScreenCTM(), to=svg.getScreenCTM();
      if (!from || !to || !global.DOMPoint) return {x:b.x,y:b.y,width:b.width,height:b.height};
      const inv=to.inverse();
      const pts=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]]
        .map(([x,y])=>new global.DOMPoint(x,y).matrixTransform(from).matrixTransform(inv));
      const minX=Math.min(...pts.map(p=>p.x)),maxX=Math.max(...pts.map(p=>p.x));
      const minY=Math.min(...pts.map(p=>p.y)),maxY=Math.max(...pts.map(p=>p.y));
      return [minX,minY,maxX,maxY].every(Number.isFinite)
        ? {x:minX,y:minY,width:maxX-minX,height:maxY-minY} : null;
    } catch (_) {return null;}
  }

  // pdf-lib doesn't expose a page link-rectangle convenience method. Use a
  // standard invisible URI annotation, keeping the rendered title unchanged.
  function addPdfTitleLink(pdf,page,url,rect){
    const [left,bottom,right,top]=rect;
    if (!(right>left && top>bottom)) return;
    const annotation=pdf.context.register(pdf.context.obj({
      Type:'Annot',Subtype:'Link',Rect:[left,bottom,right,top],Border:[0,0,0],
      A:{S:'URI',URI:PDFLib.PDFString.of(url)}
    }));
    page.node.addAnnot(annotation);
  }

  async function runPdfExport() {
    const notation = document.getElementById('notation');
    const svg = notation && notation.querySelector('svg');
    if (!svg || !hasTunes()) throw new Error('No rendered notation is available.');
    if (!window.PDFLib || !window.htmlToImage?.toPng)
      throw new Error('PDF libraries not found. Put pdf-lib-min.js and html2image.js beside this player HTML file.');
    // Safari (especially iOS) can still miss custom fingering glyphs in the
    // first SVG-to-canvas capture, even after document.fonts.ready resolves.
    // Load the glyph face explicitly; the first exported system is also
    // rasterized once as a throwaway preflight before any PDF image is used.
    const glyphNodes = svg.querySelectorAll('.whistle, .whistle_small, .ocarina, .ocarina_small');
    const hasCustomGlyphs = !!config.glyphFont && glyphNodes.length > 0;
    if (hasCustomGlyphs && document.fonts?.load) {
      const glyphText = Array.from(glyphNodes)
        .map(node => node.textContent || '').join('').slice(0, 160) || '\uE000';
      await document.fonts.load('32px "' + config.glyphFont + '"', glyphText);
    }
    if (document.fonts?.ready) await document.fonts.ready;

    // This optional callback is supplied only by players that want ABCTT
    // playback links on the main notation PDF title. No effect on All… sheets.
    const titleURL=typeof config.getTitleURL==='function'?config.getTitleURL():'';
    const titleBox=titleURL?pdfTitleBounds(svg):null;
    const {x,width,slices} = svgSlices(svg);
    const dim = sizeSelect.value === 'a4' ? [595.28,841.89] : [612,792];
    if (orientationSelect.value === 'landscape') dim.reverse();
    const [pageWidth,pageHeight] = dim;
    const margin = 36;
    const interSystemGap = config.systemGap === undefined ? 8 : config.systemGap; // PDF points
    const availableWidth = pageWidth - 2*margin;
    const availableHeight = pageHeight - 2*margin;
    const nominalScale = availableWidth / width;
    const renderWidth = Math.max(1, Math.round(width));

    const pdf = await PDFLib.PDFDocument.create();
    pdf.setCreator('ABC Player PDF Export');
    const nameMatch = String(document.getElementById('abcText')?.value || '').match(/^T:\s*(.*?)\s*$/m);
    const tuneTitle = nameMatch?.[1]?.trim() || 'Notation';
    pdf.setTitle(tuneTitle);
    let page = null, usedHeight = 0;
    const newPage = () => { page = pdf.addPage(dim); usedHeight = 0; };
    newPage();
    let titleLinkAdded = false;

    // Work from the original fully-rendered score, but capture only one
    // complete system at a time. This also avoids huge full-tune canvases.
    for (const [index, slice] of slices.entries()) {
      setStatus(`Rendering system ${index + 1} of ${slices.length}…`);
      await allowStatusPaint();
      // For a single over-height system, scale THAT complete system to a page.
      const scale = Math.min(nominalScale, availableHeight/slice.height);
      const drawHeight = slice.height * scale;
      if (usedHeight > 0 && usedHeight + interSystemGap + drawHeight > availableHeight + 0.01) newPage();
      if (usedHeight > 0) usedHeight += interSystemGap;

      const renderHeight = Math.max(1, Math.ceil(renderWidth*slice.height/width));
      const clone = svg.cloneNode(true);
      if (mode !== 'legacy-crop') isolatePdfSystem(clone, slice.line);
      clone.querySelectorAll('.abcjs-cursor').forEach(n => n.remove());
      clone.querySelectorAll('.abcjs-note_selected').forEach(n => n.classList.remove('abcjs-note_selected'));
      clone.setAttribute('viewBox', `${x} ${slice.start} ${width} ${slice.height}`);
      clone.setAttribute('width', String(renderWidth));
      clone.setAttribute('height', String(renderHeight));
      clone.setAttribute('preserveAspectRatio', 'none');
      clone.style.cssText = `display:block!important;width:${renderWidth}px!important;height:${renderHeight}px!important;max-width:none!important;max-height:none!important;overflow:hidden!important;background:white!important;`;
      const sandbox = document.createElement('div');
      sandbox.className = 'notation playerPdfSandbox';
      sandbox.style.cssText = `position:fixed;left:-100000px;top:0;width:${renderWidth}px;height:${renderHeight}px;pointer-events:none;overflow:hidden;background:white;padding:0!important;box-sizing:content-box!important;min-height:0!important;`;
      sandbox.appendChild(clone);
      document.body.appendChild(sandbox);
      let png;
      try {
        const captureOptions = {
          backgroundColor:'#ffffff',pixelRatio:2,cacheBust:false,
          width:renderWidth,height:renderHeight,skipAutoScale:true
        };
        if (index === 0 && hasCustomGlyphs) {
          // Match ABCTT's custom-font rasterization preflight: discard the
          // first raster so the actual PDF always uses a warmed-up glyph font.
          setStatus('Preparing fingering font…');
          await allowStatusPaint();
          await htmlToImage.toPng(clone, captureOptions);
          setStatus(`Rendering system ${index + 1} of ${slices.length}…`);
          await allowStatusPaint();
        }
        png = await htmlToImage.toPng(clone, captureOptions);
      } finally { sandbox.remove(); }
      const embedded = await pdf.embedPng(png);
      const imageLeft=(pageWidth - width*scale)/2;
      const imageBottom=pageHeight-margin-usedHeight-drawHeight;
      page.drawImage(embedded, {
        x:imageLeft,
        y:imageBottom,
        width:width*scale,height:drawHeight
      });
      // The title appears in the first system. Convert its SVG-unit bounds
      // to this slice's drawn PDF points after fitting and pagination.
      if (index===0 && titleURL && titleBox) {
        const left=Math.max(x,titleBox.x);
        const right=Math.min(x+width,titleBox.x+titleBox.width);
        const top=Math.max(slice.start,titleBox.y);
        const bottom=Math.min(slice.start+slice.height,titleBox.y+titleBox.height);
        if (right>left && bottom>top) {
          addPdfTitleLink(pdf,page,titleURL,[
            imageLeft+(left-x)*scale-2,
            imageBottom+(slice.start+slice.height-bottom)*scale-2,
            imageLeft+(right-x)*scale+2,
            imageBottom+(slice.start+slice.height-top)*scale+2
          ]);
          titleLinkAdded = true;
        }
      }
      usedHeight += drawHeight;
    }
    // The hint lives in the original 36pt top margin of page one, so
    // title/music coordinates and system pagination remain exactly unchanged.
    // Only draw it when a playable title link was actually attached.
    if (titleLinkAdded && clickTitleHeader?.checked) {
      const hint = 'Click the title to play';
      const font = await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
      const fontSize = 11;
      pdf.getPages()[0].drawText(hint, {
        x: (pageWidth - font.widthOfTextAtSize(hint, fontSize)) / 2,
        y: pageHeight - 24,
        size: fontSize,
        font,
        color: PDFLib.rgb(0.32, 0.32, 0.32)
      });
    }

    // Page numbers are useful only when a tune spans more than one page.
    // Keep them outside the reserved 36pt music margin, 16pt from the edge.
    if (pdf.getPageCount() > 1) {
      setStatus('Adding page numbers…');
      const font = await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
      const fontSize = 11;
      const pages = pdf.getPages();
      pages.forEach((item, index) => {
        const number = String(index + 1);
        item.drawText(number, {
          x: (pageWidth - font.widthOfTextAtSize(number, fontSize)) / 2,
          y: 16,
          size: fontSize,
          font,
          color: PDFLib.rgb(0.32, 0.32, 0.32)
        });
      });
    }
    setStatus('Preparing PDF file…');
    await allowStatusPaint();
    const bytes = await pdf.save();
    const blob = new Blob([bytes], {type:'application/pdf'});
    const safeName = tuneTitle.replace(/[\/:*?"<>|\x00-\x1f]/g,'_').slice(0,100).trim() || 'Notation';
    return {blob, filename:safeName + '.pdf'};
  }

  // Browsers require a fresh user gesture to open the iOS share sheet.
  // Do not call navigator.share() after the asynchronous PDF rasterization;
  // instead keep the status modal open with a Save PDF button for that tap.
  const isIOS = /iPad|iPhone|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const saveFileButton = document.getElementById('playerPdfSaveFile');
  const closeReadyButton = document.getElementById('playerPdfCloseReady');
  const statusDialog = statusModal.querySelector('.playerPdfStatusDialog');
  const statusTitle = document.getElementById('playerPdfStatusTitle');
  let pendingPdf = null;

  function downloadPdf({blob, filename}) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  function finishReady() {
    pendingPdf = null;
    statusDialog.classList.remove('ready');
    hideStatus();
    button.textContent = 'Export PDF';
    button.disabled = !hasTunes();
    if (!button.disabled) button.focus();
  }

  // Called directly from a tap, preserving transient user activation for
  // the native Files/AirDrop/Print sharing options in iOS Safari.
  saveFileButton.addEventListener('click', async () => {
    if (!pendingPdf) return;
    const pdfFile = pendingPdf;
    if (typeof navigator.share === 'function' && typeof File === 'function') {
      try {
        const file = new File([pdfFile.blob], pdfFile.filename, {type:'application/pdf'});
        if (!navigator.canShare || navigator.canShare({files:[file]})) {
          // On iOS, sharing a title along with a File can create a second
          // plain-text attachment in Save to Files. Share only the PDF.
          await navigator.share({files:[file]});
          finishReady();
          return;
        }
      } catch (err) {
        // Canceling the native share sheet leaves the PDF available to retry.
        if (err?.name === 'AbortError') return;
        console.warn('Native PDF sharing unavailable; downloading instead:', err);
      }
    }
    downloadPdf(pdfFile);
    finishReady();
  });
  closeReadyButton.addEventListener('click', finishReady);

  document.getElementById('playerPdfGo').addEventListener('click', async () => {
    if (button.disabled) return;
    savePreferences();
    closeDialog();
    button.disabled = true;
    button.textContent = 'Exporting…';
    statusDialog.classList.remove('ready');
    statusTitle.textContent = 'Generating PDF';
    showStatus();
    let errorMessage = null;
    try {
      await allowStatusPaint();
      const result = await runPdfExport();
      if (isIOS) {
        pendingPdf = result;
        const canShareFile = typeof navigator.share === 'function' &&
          typeof File === 'function' &&
          (!navigator.canShare || navigator.canShare({
            files:[new File([result.blob], result.filename, {type:'application/pdf'})]
          }));
        saveFileButton.textContent = canShareFile ? 'Save PDF' : 'Download PDF';
        statusTitle.textContent = 'PDF Ready';
        setStatus(canShareFile
          ? 'Tap Save PDF to open the iOS share sheet, then choose Save to Files or another destination.'
          : 'Tap Download PDF to save the generated file.');
        statusDialog.classList.add('ready');
        saveFileButton.focus();
      } else {
        downloadPdf(result);
      }
    } catch (err) {
      console.error('PDF export failed:', err);
      errorMessage = 'Unable to export PDF: ' + (err?.message || String(err));
    } finally {
      if (!pendingPdf) {
        hideStatus();
        button.textContent = 'Export PDF';
        button.disabled = !hasTunes();
        if (!button.disabled) button.focus();
      }
    }
    if (errorMessage) window.alert(errorMessage);
  });
}

function attachSheet(sheetWindow, config) {
  const win = sheetWindow, doc = win && win.document;
  if (!doc || doc.getElementById('abcSharedSheetPdfBtn')) return;
  const kinds = config.kind === 'svg' ? 'svg' : 'rows';
  const settingKey = 'player-pdf-export:v1:' + config.playerId;
  const style = doc.createElement('style');
  style.textContent = `
  #abcSharedSheetPdfToolbar{position:sticky;top:0;z-index:8000;background:#f3f8f4;border:1px solid #adc4b3;border-radius:9px;
    padding:9px;margin:0 0 14px;display:flex;justify-content:center;gap:12px;align-items:center;box-sizing:border-box}
  #abcSharedSheetPdfToolbar button,.abcSharedPdfActions button{border:1px solid #9dbaf2;background:#e8f1ff;border-radius:7px;padding:8px 16px;font:600 15px Arial,sans-serif;color:#17241c;cursor:pointer}
  #abcSharedSheetPdfToolbar button:hover,.abcSharedPdfActions button:hover{background:#d6e6ff}
  #abcSharedPdfOverlay{display:none;position:fixed;inset:0;z-index:90000;background:rgba(0,0,0,.52);align-items:center;justify-content:center}
  #abcSharedPdfOverlay.open{display:flex}
  #abcSharedPdfBox{position:absolute;top:33.333%;left:50%;transform:translate(-50%,-50%);width:min(400px,calc(100vw - 40px));box-sizing:border-box;
    background:white;border-radius:12px;padding:22px;color:#17241c;box-shadow:0 18px 55px #0004;font:15px Arial,sans-serif}
  #abcSharedPdfBox h2{text-align:center;font-size:20px;margin:0 0 15px}
  #abcSharedPdfBox label{display:block;font-weight:600;margin:13px 0 4px}
  #abcSharedPdfBox select{display:block;box-sizing:border-box;width:100%;font:16px Arial,sans-serif;color:#17241c;min-height:40px;
    -webkit-appearance:none;appearance:none;border:1px solid #adc4b3;border-radius:7px;padding:8px 36px 8px 12px;
    background:#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='9'%3E%3Cpath d='M1 1.5 7 7.5 13 1.5' fill='none' stroke='%230d4c2f' stroke-width='2'/%3E%3C/svg%3E") no-repeat right 12px center}
  #abcSharedPdfBox select:focus-visible{outline:2px solid #176b43;outline-offset:2px}
  .abcSharedPdfActions{display:flex;justify-content:center;gap:12px;margin-top:20px}
  #abcSharedPdfMessage{text-align:center;line-height:1.5}
  #abcSharedPdfProgress.ready .abcSharedPdfSpinner{display:none}
  .abcSharedPdfSpinner{width:32px;height:32px;border-radius:50%;border:4px solid #d9e7de;border-top-color:#176b43;animation:abcSharedSpin .8s linear infinite;margin:0 auto 15px}
  @keyframes abcSharedSpin{to{transform:rotate(360deg)}}
  @media print{#abcSharedSheetPdfToolbar,#abcSharedPdfOverlay{display:none!important}}
  `;
  doc.head.appendChild(style);
  const bar=doc.createElement('div');bar.id='abcSharedSheetPdfToolbar';
  bar.innerHTML='<button id="abcSharedSheetPdfBtn" type="button">Export PDF</button>';
  const main = doc.querySelector('main') || doc.body;
  // Put controls outside the SVG content and exclude them from all exported images.
  if (main === doc.body) doc.body.insertBefore(bar,doc.body.firstChild);
  else main.insertBefore(bar,main.firstChild);
  const overlay=doc.createElement('div');overlay.id='abcSharedPdfOverlay';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
  overlay.innerHTML=`<div id="abcSharedPdfBox"><h2 id="abcSharedPdfHeading">Export Sheet PDF</h2>
    <div id="abcSharedPdfOptions"><label for="abcSharedPdfSize">Paper Size</label>
      <select id="abcSharedPdfSize"><option value="letter">Letter</option><option value="a4">A4</option></select>
      <label for="abcSharedPdfOrientation">Orientation</label>
      <select id="abcSharedPdfOrientation"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div>
    <div id="abcSharedPdfProgress" hidden><div class="abcSharedPdfSpinner"></div><p id="abcSharedPdfMessage" role="status" aria-live="polite">Preparing…</p></div>
    <div class="abcSharedPdfActions"><button id="abcSharedPdfConfirm">Export PDF</button><button id="abcSharedPdfCancel">Cancel</button></div></div>`;
  doc.body.appendChild(overlay);
  const $=id=>doc.getElementById(id);
  const size=$('abcSharedPdfSize'), orient=$('abcSharedPdfOrientation');
  try { const p=JSON.parse(win.localStorage.getItem(settingKey)||'{}');
    if (['a4','letter'].includes(p.size))size.value=p.size;
    if (['landscape','portrait'].includes(p.orientation))orient.value=p.orientation;
  }catch(_){}
  // Preserve the main notation dialog's optional title-hint preference.
  const persist=()=>{try{const previous=JSON.parse(win.localStorage.getItem(settingKey)||'{}')||{};
     win.localStorage.setItem(settingKey,JSON.stringify({...previous,size:size.value,orientation:orient.value}))}catch(_){}};
  size.addEventListener('change',persist);orient.addEventListener('change',persist);
  const reset=()=>{ overlay.classList.remove('open');$('abcSharedPdfOptions').hidden=false;$('abcSharedPdfProgress').hidden=true;$('abcSharedPdfProgress').classList.remove('ready');
    $('abcSharedPdfConfirm').hidden=false;$('abcSharedPdfCancel').textContent='Cancel';$('abcSharedPdfCancel').disabled=false;$('abcSharedSheetPdfBtn').disabled=false;
    $('abcSharedPdfHeading').textContent='Export Sheet PDF';};
  $('abcSharedSheetPdfBtn').onclick=()=>overlay.classList.add('open');
  $('abcSharedPdfCancel').onclick=reset;
  overlay.addEventListener('click',ev=>{if(ev.target===overlay&&!$('abcSharedPdfOptions').hidden)reset();});
  let pending=null;
  const ios = /iPad|iPhone|iPod/i.test(win.navigator.userAgent)||
    (win.navigator.platform==='MacIntel' && win.navigator.maxTouchPoints>1);
  const download=data=>{const u=win.URL.createObjectURL(data.blob),a=doc.createElement('a');a.href=u;a.download=data.filename;
    doc.body.appendChild(a);a.click();a.remove();win.setTimeout(()=>win.URL.revokeObjectURL(u),30000)};
  function complete(data){
    if (!ios){download(data);reset();return;}
    pending=data;
    $('abcSharedPdfHeading').textContent='PDF Ready';$('abcSharedPdfProgress').classList.add('ready');
    $('abcSharedPdfMessage').textContent='Tap Save PDF to open the iOS share sheet.';
    $('abcSharedPdfConfirm').hidden=false;$('abcSharedPdfConfirm').textContent='Save PDF';
    $('abcSharedPdfCancel').textContent='Close';$('abcSharedPdfCancel').disabled=false;
  }
  $('abcSharedPdfConfirm').addEventListener('click',async()=>{
    if(pending){
      const current=pending;
      if(typeof win.navigator.share==='function'&&typeof win.File==='function'){
        try{
          const file=new win.File([current.blob],current.filename,{type:'application/pdf'});
          if(!win.navigator.canShare||win.navigator.canShare({files:[file]})){
            await win.navigator.share({files:[file]});pending=null;reset();return;
          }
        }catch(err){if(err?.name==='AbortError')return;console.warn('PDF share failed, falling back:',err)}
      }
      download(current);pending=null;reset();return;
    }
    persist();
    $('abcSharedPdfOptions').hidden=true;$('abcSharedPdfProgress').hidden=false;
    $('abcSharedPdfConfirm').hidden=true;$('abcSharedPdfCancel').textContent='Close';$('abcSharedPdfCancel').disabled=true;
    $('abcSharedPdfHeading').textContent='Generating PDF';
    $('abcSharedSheetPdfBtn').disabled=true;
    const report=text=>$('abcSharedPdfMessage').textContent=text;
    try {
      await new Promise(resolve=>win.requestAnimationFrame(()=>win.setTimeout(resolve,0)));
      const data=await exportSheet(win,{kind:kinds,size:size.value,orientation:orient.value,title:doc.title,report,main,glyphFont:config.glyphFont||null});
      complete(data);
    }catch(err){console.error('Sheet PDF export failed:',err);reset();win.alert('Unable to export PDF: '+(err?.message||String(err)))}
  });
}

// One pagination and finalization engine is shared by HTML rows and SVG systems.
async function exportSheet(win, config) {
  if (!win.PDFLib || !win.htmlToImage?.toPng) {
    // All views are same-origin windows generated by their owning player.
    // The parent libraries are available through the opener if not loaded here.
    if (!global.PDFLib || !global.htmlToImage?.toPng) throw Error('Required PDF libraries are unavailable.');
  }
  const pdfLib=win.PDFLib || global.PDFLib;
  const raster=win.htmlToImage || global.htmlToImage;
  const doc=win.document;
  if (doc.fonts?.ready) await doc.fonts.ready;
  const dim=config.size==='a4'?[595.28,841.89]:[612,792];
  if(config.orientation==='landscape')dim.reverse();
  const [PW,PH]=dim, margin=36, availWidth=PW-2*margin, availHeight=PH-2*margin;
  const pdf=await pdfLib.PDFDocument.create();pdf.setCreator('ABC Player PDF Export');pdf.setTitle(config.title||'Sheet');
  let page=pdf.addPage(dim),used=0;
  const newPage=()=>{page=pdf.addPage(dim);used=0};
  // Printable All Techniques / All Fingerings rows can contain canvas-derived
  // <img> data URLs. In particular, WebKit can omit images on the first
  // html-to-image foreignObject rasterization even if they are already in the DOM.
  // Wait for every image to decode before capture, then warm up each image-
  // bearing row with one discarded rasterization (as for custom SVG glyphs).
  // This is deliberately limited to HTML sheet rows: plain text and SVG sheets
  // do not incur the extra rendering cost.
  const readyImages=new WeakSet();
  // Some All Fingerings sheets use a custom font (not an <img>) for each
  // fingering. On iOS, waiting for fonts.ready is not sufficient: the first
  // html-to-image foreignObject rendering can still use the fallback font.
  // Explicitly load the sheet window's font with every glyph the tune uses,
  // rasterize a tiny sample once, and also discard the first image-bearing or
  // custom-glyph row raster. All work is done in the printable sheet window;
  // the notation-pane exporter and all other sheet types are unchanged.
  const glyphFont=String(config.glyphFont||'').trim();
  const glyphSelector=glyphFont?'.staffrow .whistle, .staffrow .whistle_small':'';
  const glyphNodes=glyphSelector?[...doc.querySelectorAll(glyphSelector)]:[];
  const glyphText=[...new Set(glyphNodes.flatMap(el=>Array.from(el.textContent||'')))].join('');
  if (glyphText) {
    config.report('Preparing fingering font…');
    if (doc.fonts?.load) {
      const loaded=await doc.fonts.load('32pt "'+glyphFont.replace(/["\\]/g,'')+'"',glyphText);
      if (!loaded.length) throw new Error('The '+glyphFont+' font is unavailable in the printable sheet.');
      await doc.fonts.ready;
    }
    // Force WebKit to initialize the font in an image context before the
    // first complete printable row is rendered. No font file is reloaded.
    const sample=doc.createElement('div');
    sample.style.cssText='position:fixed;left:-10000px;top:0;display:block;'+
      'background:white;width:120px;height:75px;overflow:hidden;pointer-events:none;';
    const sampleText=doc.createElement('span');
    sampleText.style.cssText='font-family:"'+glyphFont.replace(/["\\]/g,'')+'";'+
      'font-size:36pt;line-height:1.1;font-weight:normal;font-style:normal;';
    sampleText.textContent=glyphText.slice(0,16);
    sample.appendChild(sampleText);
    doc.body.appendChild(sample);
    try {
      await new Promise(resolve=>win.requestAnimationFrame(()=>win.setTimeout(resolve,0)));
      await raster.toPng(sample,{backgroundColor:'#ffffff',width:120,height:75,
        pixelRatio:2,cacheBust:false,skipAutoScale:true});
    } finally { sample.remove(); }
  }
  async function ensureImagesDecoded(node, label) {
    const images=[...(node.querySelectorAll?.('img')||[])].filter(img=>!!(img.currentSrc||img.src));
    if (!images.length) return false;
    config.report('Preparing symbols in '+label+'…');
    await Promise.all(images.map(async img=>{
      if (readyImages.has(img)) return;
      if (typeof img.decode === 'function') {
        try { await img.decode(); }
        catch (err) {
          // Safari may reject decode() for a previously decoded image.
          if (!img.complete || !img.naturalWidth) throw new Error('Unable to load an image in '+label+'.');
        }
      } else if (!img.complete) {
        await new Promise((resolve,reject)=>{
          img.addEventListener('load',resolve,{once:true});
          img.addEventListener('error',()=>reject(new Error('Unable to load an image in '+label+'.')),{once:true});
        });
      }
      if (!img.naturalWidth || !img.naturalHeight) throw new Error('An image is missing from '+label+'.');
      readyImages.add(img);
    }));
    return true;
  }
  const emit=async (node,{width,height,gap=8,label,preflightImages=false,preflightGlyphs=false})=>{
    if (!node||!(width>0)||!(height>0))return;
    const scale=Math.min(availWidth/width,availHeight/height),drawH=height*scale;
    if(used>0 && used+gap+drawH>availHeight+.01)newPage();
    else if(used>0)used+=gap;
    const captureOptions={backgroundColor:'#ffffff',pixelRatio:2,cacheBust:false,
      width:Math.ceil(width),height:Math.ceil(height),skipAutoScale:true};
    const hasImages=preflightImages && await ensureImagesDecoded(node,label);
    if (hasImages || preflightGlyphs) {
      // The first foreignObject-to-canvas conversion may drop either images
      // or embedded-font glyphs on iOS. Never use that raster in the PDF.
      config.report('Preflighting '+label+'…');
      await raster.toPng(node,captureOptions);
    }
    config.report('Rendering '+label+'…');
    await new Promise(resolve=>win.requestAnimationFrame(()=>win.setTimeout(resolve,0)));
    const png=await raster.toPng(node,captureOptions);
    const embedded=await pdf.embedPng(png);
    page.drawImage(embedded,{x:(PW-width*scale)/2,y:PH-margin-used-drawH,width:width*scale,height:drawH});
    used+=drawH;
  };
  // HTML sheet repeat dots are CSS ::before/::after pseudo-elements, which
  // WebKit can drop during foreignObject rasterization. Likewise the first-
  // and second-ending brackets begin slightly ABOVE each .staffrow and were
  // being clipped by the row-only image bounds. Prepare a PDF-only clone:
  // materialize the repeat dots as actual elements and reserve a narrow top
  // bleed for ending brackets. Never mutate the printable sheet itself.
  function prepareSheetRow(row, rowWidth, rowHeight) {
    const topBleed=8, bottomBleed=2;
    const holder=doc.createElement('div');
    holder.style.cssText='position:absolute;left:0;top:0;z-index:-1;pointer-events:none;'+
      'background:white;box-sizing:content-box;overflow:visible;'+
      `width:${rowWidth}px;height:${rowHeight+topBleed+bottomBleed}px;`;
    const clone=row.cloneNode(true);
    clone.style.cssText += `;display:block;width:${rowWidth}px;max-width:none;`+
      `height:${rowHeight}px;margin:0;position:absolute;top:${topBleed}px;left:0;`;
    for (const bar of clone.querySelectorAll('.bar.repeatStart, .bar.repeatEnd, .bar.repeatBoth')) {
      const start=bar.classList.contains('repeatStart')||bar.classList.contains('repeatBoth');
      const end=bar.classList.contains('repeatEnd')||bar.classList.contains('repeatBoth');
      // Removing these classes suppresses fragile pseudo-elements in the
      // capture, while the double-stroke barline is restored inline.
      bar.classList.remove('repeatStart','repeatEnd','repeatBoth');
      bar.style.borderLeft='3px double #111';
      for (const side of [start&&'left',end&&'right'].filter(Boolean)) {
        const offset=side==='left'?6:8;
        for (let index=0;index<2;index++) {
          const dot=doc.createElement('span');
          dot.setAttribute('aria-hidden','true');
          dot.style.cssText='position:absolute;display:block;pointer-events:none;'+
            'width:5px;height:5px;background:#111;border-radius:50%;'+
            `${side}:${offset}px;top:calc(50% - 10px + ${index*13}px);`;
          bar.appendChild(dot);
        }
      }
    }
    holder.appendChild(clone);
    doc.body.appendChild(holder);
    return {node:holder,width:rowWidth,height:rowHeight+topBleed+bottomBleed,
      dispose:()=>holder.remove()};
  }
  if (config.kind==='rows') {
    const rows=[...doc.querySelectorAll('.staffrow')];
    if(!rows.length)throw Error('No printable rows were found in the sheet.');
    const body=doc.body,priorZoom=body.style.zoom, priorPadding=body.style.padding, priorWidth=body.style.width, priorPreview=body.style.getPropertyValue('--preview-zoom');
    body.style.zoom='1';body.style.setProperty('--preview-zoom','1');body.style.padding='0';
    body.style.width='1100px';
    try{
      // Preserve title/instrument labels as separate, keep-together blocks.
      const headers=[...body.querySelectorAll('h1, .instrumentDescription')].filter(el=>!el.closest('#abcSharedPdfOverlay'));
      for(const header of headers){
        const rect=header.getBoundingClientRect();
        if(rect.width&&rect.height)await emit(header,{width:rect.width,height:rect.height,gap:5,label:'heading'});
      }
      for(let i=0;i<rows.length;i++){
        const r=rows[i],rect=r.getBoundingClientRect();
        const capture=prepareSheetRow(r,r.offsetWidth||rect.width,r.offsetHeight||rect.height);
        try {
          await emit(capture.node,{width:capture.width,height:capture.height,
            gap:8,label:`row ${i+1} of ${rows.length}`,preflightImages:true,
            preflightGlyphs:!!glyphText && !!r.querySelector('.whistle, .whistle_small')});
        } finally { capture.dispose(); }
      }
    }finally{body.style.zoom=priorZoom;body.style.setProperty('--preview-zoom',priorPreview);body.style.padding=priorPadding;body.style.width=priorWidth;}
  } else {
    const svg=config.main.querySelector('svg');
    if(!svg)throw Error('No printable SVG found in the sheet.');
    const bbox=el=>{try{const b=el.getBBox();return Number.isFinite(b.y)&&b.height>0?{top:b.y,bottom:b.y+b.height}:null}catch(_){return null}};
    const lines=new Map();
    for(const el of svg.querySelectorAll('[class*="abcjs-l"]')){
      const m=(el.getAttribute('class')||'').match(/(?:^|\s)abcjs-l(\d+)(?=\s|$)/);
      if(!m)continue;const b=bbox(el);if(!b)continue;
      const line=Number(m[1]),old=lines.get(line);
      lines.set(line,old?{top:Math.min(old.top,b.top),bottom:Math.max(old.bottom,b.bottom)}:b);
    }
    const view=svg.viewBox?.baseVal, x=view?.x||0,y=view?.y||0;
    const width=view?.width||parseFloat(svg.getAttribute('width'))||1200;
    const bands=[...lines.entries()].map(([line,b])=>({line,...b})).sort((a,b)=>a.top-b.top);
    if(!bands.length){const b=bbox(svg);if(!b)throw Error('No PDF tablature systems were found.');bands.push({line:null,...b});}
    for(let i=0;i<bands.length;i++){
      const band=bands[i],start=i===0?Math.min(y,band.top-10):band.top-10,height=band.bottom+10-start;
      const clone=svg.cloneNode(true);
      if(band.line!==null){for(const el of clone.querySelectorAll('[class*="abcjs-l"]')){
        const m=(el.getAttribute('class')||'').match(/(?:^|\s)abcjs-l(\d+)(?=\s|$)/);
        if(m&&Number(m[1])!==band.line)el.remove();
      }}
      clone.querySelectorAll('.abcjs-cursor').forEach(n=>n.remove());
      clone.setAttribute('viewBox',`${x} ${start} ${width} ${height}`);
      clone.setAttribute('preserveAspectRatio','none');
      const rw=Math.ceil(width),rh=Math.ceil(height);
      clone.setAttribute('width',String(rw));clone.setAttribute('height',String(rh));
      clone.style.cssText=`display:block;width:${rw}px;height:${rh}px;max-width:none;max-height:none;background:white`;
      const holder=doc.createElement('div');holder.style.cssText=`position:fixed;left:-100000px;top:0;width:${rw}px;height:${rh}px;overflow:hidden;background:white`;
      holder.appendChild(clone);doc.body.appendChild(holder);
      try{await emit(clone,{width:rw,height:rh,label:`system ${i+1} of ${bands.length}`});}finally{holder.remove()}
    }
  }
  if(pdf.getPageCount()>1){
    config.report('Adding page numbers…');
    const font=await pdf.embedFont(pdfLib.StandardFonts.Helvetica);
    for(const [index,p] of pdf.getPages().entries()){
      const number=String(index+1),size=11;
      p.drawText(number,{x:(PW-font.widthOfTextAtSize(number,size))/2,y:16,size,font,
        color:pdfLib.rgb(.32,.32,.32)});
    }
  }
  config.report('Saving PDF…');
  const bytes=await pdf.save();
  const safeName=String(config.title||'Sheet').replace(/\s+[—–-]\s+(?:All |Fingerings|Techniques).*/i,'')
    .replace(/[\/:*?"<>|\x00-\x1f]/g,'_').slice(0,100).trim()||'Sheet';
  return {blob:new win.Blob([bytes],{type:'application/pdf'}),filename:safeName+'.pdf'};
}

global.ABCPlayerPDF={initNotation,attachSheet,exportSheet};
})(window);
