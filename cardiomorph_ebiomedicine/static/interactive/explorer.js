/* Buildless, browser-local prototype. No image uploads or inference. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  function selectTab(tab) {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      $(item.getAttribute('aria-controls')).hidden = !selected;
    });
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', (event) => {
      let next;
      if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
      if (event.key === 'ArrowLeft') next = tabs[(index + tabs.length - 1) % tabs.length];
      if (event.key === 'Home') next = tabs[0];
      if (event.key === 'End') next = tabs[tabs.length - 1];
      if (next) { event.preventDefault(); selectTab(next); next.focus(); }
    });
  });

  const figures = {
    cohorts: {file:'Figure1.svg',number:'1',label:'Study population',title:'Four cohorts, with different roles in the study.',description:'The published cohort diagram describes selection for atlas construction and the mortality analysis. Explore the inclusion and exclusion criteria in the original artwork.',alt:'Published cohort selection diagram for CardioMorph',guides:[['Full figure',1,.5,.5],['Left side',1.8,.28,.5],['Right side',1.8,.72,.5]]},
    atlas: {file:'Figure3.svg',number:'3',label:'Atlas construction',title:'From a chest X-ray to an atlas of cardiac morphology.',description:'Follow the existing overview from an X-ray example through segmentation, atlas comparison, and morphology features. The figure is shown as published; individual segmentation layers are not available here.',alt:'Published overview of CardioMorph atlas construction and feature extraction',guides:[['Full figure',1,.5,.5],['Left side',2,.23,.5],['Right side',2,.77,.5]]},
    comparisons: {file:'Figure5.svg',number:'5',label:'Disease comparisons',title:'TB has a distinct pattern of cardiac shape differences.',description:'Compare the published difference maps and displacement fields across TB and other thoracic conditions. The arrows describe group-level displacement, rather than motion of an individual heart.',alt:'Published difference atlas and displacement vector fields comparing TB with other thoracic conditions',guides:[['Full figure',1,.5,.5],['Upper panels',1.8,.5,.25],['Lower panels',1.8,.5,.75]]},
    outcomes: {file:'Figure6.svg',number:'6',label:'Mortality associations',title:'Explore the reported associations with all-cause mortality.',description:'Inspect the published forest plots and Kaplan–Meier curves from the TB Portals analysis. These group-level results are not an individual risk calculator.',alt:'Published forest plots and Kaplan–Meier curves for all-cause mortality',guides:[['Full figure',1,.5,.5],['Left side',1.8,.28,.5],['Right side',1.8,.72,.5]]}
  };
  const viewport = $('figure-viewport');
  const figureImage = $('figure-image');
  let zoom = 1, panX = 0, panY = 0, currentFigure = 'comparisons', drag = null;
  function renderFigure() {
    figureImage.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    $('figure-zoom-value').value = `${Math.round(zoom * 100)}%`;
    $('figure-minus').disabled = zoom <= 1;
    $('figure-plus').disabled = zoom >= 4;
  }
  function clearGuideSelection() { document.querySelectorAll('#figure-guides button').forEach(b => b.setAttribute('aria-pressed','false')); }
  function changeZoom(value) {
    clearGuideSelection();
    const next = Math.max(1, Math.min(4, value));
    const ratio = next / zoom;
    panX *= ratio; panY *= ratio; zoom = next;
    if (zoom === 1) { panX = 0; panY = 0; }
    renderFigure();
  }
  function fitFigure() {
    zoom = 1; panX = 0; panY = 0; renderFigure();
    document.querySelectorAll('#figure-guides button').forEach((button,index) => button.setAttribute('aria-pressed',String(index === 0)));
  }
  function selectFigure(key) {
    currentFigure = key;
    const figure = figures[key];
    figureImage.src = `figures/${figure.file}`; figureImage.alt = figure.alt;
    $('figure-original').href = `figures/${figure.file}`;
    $('figure-label').textContent = figure.label;
    $('figure-number').textContent = `FIGURE ${figure.number}`;
    $('figure-title').textContent = figure.title;
    $('figure-description').textContent = figure.description;
    document.querySelectorAll('[data-figure]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.figure === key)));
    $('figure-guides').replaceChildren(...figure.guides.map(([label,scale,cx,cy],index) => {
      const button = document.createElement('button');
      button.textContent = label; button.setAttribute('aria-pressed',String(index === 0));
      button.addEventListener('click',() => {
        const ratio = figureImage.naturalWidth / figureImage.naturalHeight;
        const availableWidth = figureImage.clientWidth;
        const availableHeight = figureImage.clientHeight;
        const imageWidth = Math.min(availableWidth, availableHeight * ratio);
        const imageHeight = Math.min(availableHeight, availableWidth / ratio);
        zoom = scale; panX = (.5 - cx) * imageWidth * scale; panY = (.5 - cy) * imageHeight * scale;
        clearGuideSelection(); button.setAttribute('aria-pressed','true'); renderFigure();
      });
      return button;
    }));
    fitFigure();
  }
  document.querySelectorAll('[data-figure]').forEach(button => button.addEventListener('click',() => selectFigure(button.dataset.figure)));
  $('figure-minus').addEventListener('click',() => changeZoom(zoom - .25));
  $('figure-plus').addEventListener('click',() => changeZoom(zoom + .25));
  $('figure-reset').addEventListener('click',fitFigure);
  viewport.addEventListener('pointerdown',event => {
    if (zoom === 1 || event.button !== 0) return;
    drag = {id:event.pointerId,x:event.clientX,y:event.clientY,panX,panY};
    viewport.setPointerCapture(event.pointerId); viewport.classList.add('dragging');
  });
  viewport.addEventListener('pointermove',event => {
    if (!drag || drag.id !== event.pointerId) return;
    const maxX = viewport.clientWidth * (zoom - 1) / 2;
    const maxY = viewport.clientHeight * (zoom - 1) / 2;
    panX = Math.max(-maxX,Math.min(maxX,drag.panX + event.clientX - drag.x));
    panY = Math.max(-maxY,Math.min(maxY,drag.panY + event.clientY - drag.y));
    clearGuideSelection(); renderFigure();
  });
  function finishDrag() { drag = null; viewport.classList.remove('dragging'); }
  viewport.addEventListener('pointerup',finishDrag);
  viewport.addEventListener('pointercancel',finishDrag);
  viewport.addEventListener('lostpointercapture',finishDrag);
  viewport.addEventListener('keydown',event => {
    if (['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) event.preventDefault();
    if (event.key === '+' || event.key === '=') changeZoom(zoom + .25);
    if (event.key === '-') changeZoom(zoom - .25);
    if (event.key === '0') fitFigure();
    if (event.key.startsWith('Arrow') && zoom > 1) {
      const limitX = viewport.clientWidth * (zoom - 1) / 2;
      const limitY = viewport.clientHeight * (zoom - 1) / 2;
      panX = Math.max(-limitX,Math.min(limitX,panX + (event.key === 'ArrowLeft' ? 35 : event.key === 'ArrowRight' ? -35 : 0)));
      panY = Math.max(-limitY,Math.min(limitY,panY + (event.key === 'ArrowUp' ? 35 : event.key === 'ArrowDown' ? -35 : 0)));
      clearGuideSelection(); renderFigure();
    }
  });
  figureImage.addEventListener('error',() => { $('figure-description').textContent = 'This figure could not be loaded. Use Open original to check its source file.'; });
  window.addEventListener('resize',fitFigure);
  selectFigure(currentFigure);

  const regionNotes = {
    heart:['The cardiac silhouette','A chest X-ray shows a two-dimensional projection of the heart. CardioMorph studies differences in this projected morphology across groups.'],
    lateral:['The lateral borders','The study describes lateral cardiac shape differences in TB. This manually drawn outline only demonstrates how a region could be highlighted; it does not reproduce the study’s statistical map.'],
    landmarks:['Reference points','Landmarks can connect a visual outline to interpretable border and area features. These three points are illustrative and are not the measured landmarks used in the study.']
  };
  function selectRegion(key) {
    $('region-title').textContent = regionNotes[key][0];
    $('region-description').textContent = regionNotes[key][1];
    document.querySelectorAll('[data-region]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.region === key)));
    if (key === 'landmarks') $('show-landmarks').checked = true;
    if (key !== 'landmarks') $('show-heart').checked = true;
    renderOverlay();
  }
  function renderOverlay() {
    const layers = [['show-heart','heart-layer'],['show-lungs','lung-layer'],['show-landmarks','landmark-layer']];
    layers.forEach(([control,layer]) => {
      const visible = $(control).checked;
      // SVG does not implement HTML's hidden property consistently across browsers.
      $(layer).style.display = visible ? '' : 'none';
      $(layer).removeAttribute('hidden');
    });
    const opacity = Number($('overlay-opacity').value);
    const reveal = Number($('original-reveal').value);
    const contrast = Number($('scan-contrast').value);
    $('scan-svg').style.setProperty('--overlay-opacity', opacity / 100);
    $('opacity-value').value = `${opacity}%`;
    $('reveal-value').value = `${reveal}%`;
    $('contrast-value').value = `${contrast}%`;
    const x = 279 * reveal / 100;
    $('reveal-clip').setAttribute('x',String(x));
    $('reveal-clip').setAttribute('width',String(279 - x));
    $('wipe-line').setAttribute('x1',String(x)); $('wipe-line').setAttribute('x2',String(x));
    $('wipe-line').setAttribute('visibility',reveal > 0 && reveal < 100 ? 'visible' : 'hidden');
    $('scan-image').style.filter = `contrast(${contrast}%)`;
    const count = layers.filter(([control]) => $(control).checked).length;
    $('layer-count').textContent = `${count} ${count === 1 ? 'layer' : 'layers'} enabled${reveal === 100 || opacity === 0 ? ' · overlays hidden' : ''}`;
  }
  ['show-heart','show-lungs','show-landmarks','overlay-opacity','original-reveal','scan-contrast'].forEach(id => $(id).addEventListener('input',renderOverlay));
  document.querySelectorAll('[data-region]').forEach(button => button.addEventListener('click',() => selectRegion(button.dataset.region)));
  $('heart-outline').addEventListener('click',() => selectRegion('heart'));
  $('heart-outline').addEventListener('keydown',event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectRegion('heart'); }
  });
  $('overlay-reset').addEventListener('click',() => {
    $('show-heart').checked = true; $('show-lungs').checked = false; $('show-landmarks').checked = true;
    $('overlay-opacity').value = '45'; $('original-reveal').value = '0'; $('scan-contrast').value = '100';
    selectRegion('heart');
  });
  renderOverlay();
})();
