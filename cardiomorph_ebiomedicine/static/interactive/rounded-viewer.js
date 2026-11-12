/* Rounded-chamber viewer. Saved 2D measurements; illustrative depth only. */
(() => {
  'use strict';
  const root = document.getElementById('explore');
  if (!root) return;
  const $ = id => document.getElementById(id);
  const S = window.CardioSample, G = window.CardioGeometry, SG = window.SampleGeometry;
  const NS = 'http://www.w3.org/2000/svg';
  const palette = { LA: '#ff8293', RA: '#7eacff', LV: '#b29af7', RV: '#f5c477' };
  const names = { LA: 'Left atrium', RA: 'Right atrium', LV: 'Left ventricle', RV: 'Right ventricle' };
  const offsets = { LA: -.24, RA: -.1, LV: 0, RV: .24 };
  const chambers = S.structures.filter(s => s.landmarks).map(s => ({ ...s, color: palette[s.id] }));
  const byId = new Map(chambers.map(s => [s.id, s]));
  const features = new Map(S.features.map(f => [f.id, f]));
  const points = new Map(chambers.flatMap(s => s.landmarks.map(p => [p.id, { ...p, chamber: s.id }])));
  const center = S.structures.find(s => s.id === 'heart').centroid;
  const heartContour = S.structures.find(s => s.id === 'heart').contour;
  const visible = new Set(chambers.map(s => s.id));
  const templates = new Map();
  const canvas = $('cm-canvas'), ctx = canvas.getContext('2d'), image = new Image();
  let selectedFeature = 'left', selectedPoint = null, selectedChamber = null;
  let fullImage = false, solo = false, yaw = -.55, pitch = .28, drag = null;
  let cachedMeshes = [], meshKey = '', hitFaces = [], hitBins = new Map(), pendingFrame = 0;
  const label = value => value.charAt(0).toUpperCase() + value.slice(1);
  const svg = (tag, attrs = {}) => {
    const node = document.createElementNS(NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    return node;
  };
  const path = polygon => polygon.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ') + ' Z';
  const depthChambers = () => chambers.filter(s => visible.has(s.id) && (!solo || s.id === selectedChamber));
  const world = (p, z = 0) => [(p[0] - center[0]) / 120, (center[1] - p[1]) / 120, z];
  const radius = s => Math.sqrt(s.pixel_area / Math.PI) * .92 * Number($('cm-fullness').value) / 80 / 120;
  const rgb = hex => hex.slice(1).match(/../g).map(value => parseInt(value, 16));

  for (const s of chambers) {
    const filter = svg('filter', { id: `cm-tint-${s.id}`, 'color-interpolation-filters': 'sRGB' });
    filter.append(svg('feFlood', { 'flood-color': s.color }), svg('feComposite', { in2: 'SourceAlpha', operator: 'in' }));
    $('cm-mask-filters').append(filter);
    const button = document.createElement('button');
    button.className = 'cm-chamber'; button.dataset.cmChamber = s.id;
    button.setAttribute('aria-pressed', 'true');
    button.setAttribute('aria-label', `Show ${names[s.id].toLowerCase()}`);
    button.title = `${names[s.id]} · ${s.pixel_area.toLocaleString()} px²`;
    const dot = document.createElement('span'); dot.className = 'cm-dot'; dot.style.background = s.color;
    button.append(dot, document.createTextNode(names[s.id]));
    button.addEventListener('click', () => {
      if (visible.has(s.id)) visible.delete(s.id); else visible.add(s.id);
      if (solo && !visible.has(selectedChamber)) solo = false;
      render();
    });
    $('cm-chambers').append(button);
  }
  for (const f of S.features) {
    const button = document.createElement('button');
    button.dataset.cmFeature = f.id; button.textContent = label(f.id);
    button.addEventListener('click', () => {
      selectedFeature = f.id; selectedPoint = null; selectedChamber = null; solo = false;
      $('cm-feature').checked = true; $('cm-readout').textContent = `${label(f.id)} feature`;
      render();
    });
    $('cm-features').append(button);
  }

  function selectChamber(id) {
    selectedChamber = id; selectedPoint = null; visible.add(id);
    $('cm-readout').textContent = names[id]; render();
  }
  function selectPoint(id, focus = false) {
    const point = points.get(id);
    selectedPoint = id; selectedChamber = point.chamber; visible.add(point.chamber);
    $('cm-points').checked = true;
    $('cm-readout').textContent = `${id} · x ${point.position[0]} · y ${point.position[1]}`;
    render();
    if (focus) requestAnimationFrame(() => root.querySelector(`[data-cm-point="${id}"]`)?.focus());
  }

  function renderXray() {
    const masks = [], outlines = [], markers = [], feature = features.get(selectedFeature);
    const opacity = Number($('cm-opacity').value) / 100;
    const showFeature = $('cm-feature').checked, showPoints = $('cm-points').checked;
    for (const s of chambers.filter(s => visible.has(s.id))) {
      if ($('cm-masks').checked) {
        masks.push(svg('image', { href: `static/interactive/sample/${s.mask}`, width: 512, height: 512,
          filter: `url(#cm-tint-${s.id})`, opacity: selectedChamber && selectedChamber !== s.id ? opacity * .5 : opacity,
          'pointer-events': 'none' }));
        const outline = svg('path', { d: path(s.contour), fill: 'transparent', stroke: s.color,
          'stroke-width': selectedChamber === s.id ? 1.3 : .55, opacity: .85, role: 'button', tabindex: 0,
          'aria-label': `Select ${names[s.id].toLowerCase()}` });
        outline.addEventListener('click', () => selectChamber(s.id));
        outline.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectChamber(s.id); }
        });
        outlines.push(outline);
      }
      if (showPoints) for (const point of s.landmarks) {
        const [x, y] = point.position, active = point.id === selectedPoint;
        const highlighted = showFeature && feature.landmarks.includes(point.id);
        const group = svg('g', { class: 'cm-source-point', role: 'button', tabindex: 0,
          'data-cm-point': point.id, 'aria-pressed': active,
          'aria-label': `${point.id}, ${point.extremum}, x ${x}, y ${y}` });
        const title = svg('title'); title.textContent = `${point.id} · ${point.extremum} · (${x}, ${y})`;
        group.append(title, svg('circle', { cx: x, cy: y, r: active ? 3.3 : highlighted ? 2.5 : 1.8,
          fill: active ? '#ffe08c' : highlighted ? '#d5eaff' : s.color, stroke: '#20212d', 'stroke-width': .65 }));
        if ($('cm-labels').checked || active) {
          const number = Number(point.id.slice(-1));
          const [dx, dy] = { 1: [3, -7], 2: [3, 10], 3: [-23, -3], 4: [5, 4] }[number];
          group.append(svg('rect', { x: x + dx - 2, y: y + dy - 7, width: 18, height: 10, rx: 1.5, fill: '#252632', opacity: .88 }));
          const text = svg('text', { x: x + dx, y: y + dy, class: 'cm-point-label' }); text.textContent = point.id; group.append(text);
        }
        group.addEventListener('click', () => selectPoint(point.id));
        group.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectPoint(point.id, true); }
        });
        markers.push(group);
      }
    }
    if ($('cm-heart-outline').checked) outlines.unshift(svg('path', { d: path(heartContour), fill: 'none', stroke: '#e5e6ee',
      'stroke-width': .75, 'stroke-dasharray': '3 2', opacity: .7, 'pointer-events': 'none' }));
    $('cm-mask-layers').replaceChildren(...masks); $('cm-outline-layer').replaceChildren(...outlines);
    $('cm-point-layer').replaceChildren(...markers);
    $('cm-feature-layer').replaceChildren(...(showFeature ? [svg('path', { d: path(feature.polygon), fill: '#75baff',
      'fill-opacity': .24, stroke: '#b5dcff', 'stroke-width': 1.2, 'stroke-linejoin': 'round', 'pointer-events': 'none' })] : []));
    $('cm-xray').setAttribute('viewBox', fullImage ? '0 0 512 512' : '150 220 300 265');
    $('cm-full-image').setAttribute('aria-pressed', String(fullImage));
    $('cm-full-image').textContent = fullImage ? 'Heart detail' : 'Full X-ray';
    $('cm-labels').disabled = !showPoints;
  }

  function renderInspector() {
    const feature = features.get(selectedFeature);
    $('cm-area').textContent = feature.area.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    $('cm-perimeter').textContent = feature.perimeter.toFixed(2);
    root.querySelectorAll('[data-cm-feature]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.cmFeature === selectedFeature)));
    root.querySelectorAll('[data-cm-chamber]').forEach(button => button.setAttribute('aria-pressed', String(visible.has(button.dataset.cmChamber))));
    $('cm-landmarks').replaceChildren(...feature.landmarks.map(id => {
      const button = document.createElement('button'), point = points.get(id);
      button.textContent = id; button.title = `x ${point.position[0]}, y ${point.position[1]} · ${point.extremum}`;
      button.setAttribute('aria-pressed', String(selectedPoint === id)); button.addEventListener('click', () => selectPoint(id));
      return button;
    }));
    $('cm-coordinate').textContent = selectedPoint ? (() => {
      const p = points.get(selectedPoint); return `${selectedPoint} · x ${p.position[0]} · y ${p.position[1]}`;
    })() : feature.landmarks.join(' → ');
    $('cm-solo').setAttribute('aria-pressed', String(solo)); $('cm-solo').textContent = solo ? 'Show all' : 'Solo';
    $('cm-opacity-value').value = $('cm-opacity').value + '%';
    $('cm-fullness-value').value = $('cm-fullness').value + '%';
    $('cm-zoom-value').value = $('cm-zoom').value + '%';
  }

  function template(s) {
    if (!templates.has(s.id)) {
      const mesh = SG.roundedChamber(s.contour, s.centroid);
      mesh.featureRegions = mesh.faces.map(face => {
        const p = face.reduce((sum, i) => [sum[0] + mesh.vertices[i][0] / 3, sum[1] + mesh.vertices[i][1] / 3], [0, 0]);
        return S.features.filter(f => SG.contains(p, f.polygon)).map(f => f.id);
      });
      templates.set(s.id, mesh);
    }
    return templates.get(s.id);
  }
  function meshes() {
    const active = depthChambers(), key = active.map(s => s.id).join() + ':' + $('cm-fullness').value;
    if (key === meshKey) return cachedMeshes;
    meshKey = key;
    cachedMeshes = active.map(s => {
      const t = template(s), r = radius(s), vertices = t.vertices.map(p => world(p, (p[2] + offsets[s.id]) * r));
      return { ...s, vertices, faces: t.faces, normals: SG.vertexNormals(vertices, t.faces, t.ring.length), featureRegions: t.featureRegions };
    });
    return cachedMeshes;
  }
  function landmarkPosition(point) {
    const s = byId.get(point.chamber), h = template(s).surfaceAt(...point.position) ?? 0;
    return world(point.position, (h + offsets[s.id]) * radius(s) + .007);
  }
  function frontPosition(p) {
    let z = null, chamber = null;
    for (const s of depthChambers()) {
      const h = template(s).surfaceAt(...p);
      if (h !== null) { const candidate = (h + offsets[s.id]) * radius(s); if (z === null || candidate > z) { z = candidate; chamber = s.id; } }
    }
    return z === null ? null : { position: world(p, z + .007), chamber };
  }

  function textureTriangle(source, target) {
    const [s0, s1, s2] = source, [p0, p1, p2] = target;
    const u1 = s1[0] - s0[0], v1 = s1[1] - s0[1], u2 = s2[0] - s0[0], v2 = s2[1] - s0[1], det = u1 * v2 - u2 * v1;
    if (Math.abs(det) < 1e-9) return;
    const x1 = p1[0] - p0[0], y1 = p1[1] - p0[1], x2 = p2[0] - p0[0], y2 = p2[1] - p0[1];
    const a = (x1 * v2 - x2 * v1) / det, c = (x2 * u1 - x1 * u2) / det;
    const b = (y1 * v2 - y2 * v1) / det, d = (y2 * u1 - y1 * u2) / det;
    ctx.save(); ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.closePath(); ctx.clip();
    ctx.transform(a, b, c, d, p0[0] - a * s0[0] - c * s0[1], p0[1] - b * s0[0] - d * s0[1]);
    ctx.globalAlpha = .25; ctx.drawImage(image, 0, 0, 512, 512); ctx.restore();
  }
  function screenDepth(x, y) {
    let depth = -Infinity;
    for (const face of hitBins.get(Math.floor(x / 24) + ':' + Math.floor(y / 24)) || []) {
      const [a, b, c] = face.points, den = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
      if (Math.abs(den) < 1e-9) continue;
      const u = ((b[1] - c[1]) * (x - c[0]) + (c[0] - b[0]) * (y - c[1])) / den;
      const v = ((c[1] - a[1]) * (x - c[0]) + (a[0] - c[0]) * (y - c[1])) / den, w = 1 - u - v;
      if (u < 0 || v < 0 || w < 0) continue;
      const weights = [u / (8 - a[2]), v / (8 - b[2]), w / (8 - c[2])];
      depth = Math.max(depth, (weights[0] * a[2] + weights[1] * b[2] + weights[2] * c[2]) / (weights[0] + weights[1] + weights[2]));
    }
    return depth;
  }

  function renderModel() {
    if (!ctx) { $('cm-readout').textContent = '3D requires Canvas support.'; return; }
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
    const scale = Math.min(width / 3, height / 3) * Number($('cm-zoom').value) / 100;
    const project = p => { const r = G.rotate(p, yaw, pitch), k = 8 / (8 - r[2]); return [width / 2 + r[0] * scale * k, height * .52 - r[1] * scale * k, r[2]]; };
    if ($('cm-xray-plane').checked && image.complete && image.naturalWidth) {
      for (let y = 0; y < 512; y += 64) for (let x = 0; x < 512; x += 64) {
        const a = [x, y], b = [x + 64, y], c = [x, y + 64], d = [x + 64, y + 64];
        textureTriangle([a, b, c], [a, b, c].map(p => project(world(p, -.9)))); textureTriangle([b, d, c], [b, d, c].map(p => project(world(p, -.9))));
      }
    }
    const faces = [], light = G.normalize([-.3, .6, 1.5]), halfway = G.normalize([-.15, .35, 1.7]);
    for (const mesh of meshes()) {
      const projected = mesh.vertices.map(project), normals = mesh.normals.map(n => G.rotate(n, yaw, pitch));
      const brightness = normals.map(n => .32 + .68 * Math.max(0, G.dot(n, light)) + .20 * Math.pow(Math.max(0, G.dot(n, halfway)), 28));
      const base = rgb(mesh.color), emphasis = !selectedChamber || selectedChamber === mesh.id ? 1 : .72;
      for (let i = 0; i < mesh.faces.length; i++) {
        const face = mesh.faces[i], [a, b, c] = face.map(index => mesh.vertices[index]), normal = G.cross(G.sub(b, a), G.sub(c, a));
        if (Math.hypot(...normal) < 1e-9 || G.rotate(G.normalize(normal), yaw, pitch)[2] < -.05) continue;
        const color = $('cm-feature').checked && mesh.featureRegions[i].includes(selectedFeature) ? base.map((v, k) => v * .5 + [104, 182, 255][k] * .5) : base;
        const projectedFace = face.map(index => projected[index]);
        faces.push({ id: mesh.id, points: projectedFace, depth: projectedFace.reduce((sum, p) => sum + p[2], 0) / 3, rgb: color, levels: face.map(index => brightness[index] * emphasis) });
      }
    }
    faces.sort((a, b) => a.depth - b.depth);
    const wireframe = $('cm-wireframe').checked;
    for (const face of faces) {
      const [a, b, c] = face.points, [i0, i1, i2] = face.levels;
      const colorAt = value => `rgb(${face.rgb.map(v => Math.max(0, Math.min(255, Math.round(v * value)))).join(',')})`;
      let fill = colorAt((i0 + i1 + i2) / 3);
      const x1 = b[0] - a[0], y1 = b[1] - a[1], x2 = c[0] - a[0], y2 = c[1] - a[1], det = x1 * y2 - x2 * y1;
      if (Math.abs(det) > 1e-5) {
        const gx = ((i1 - i0) * y2 - (i2 - i0) * y1) / det, gy = ((i2 - i0) * x1 - (i1 - i0) * x2) / det, length = gx * gx + gy * gy;
        const lo = Math.min(i0, i1, i2), hi = Math.max(i0, i1, i2);
        if (length > 1e-12 && hi - lo > 1e-5) {
          const start = (lo - i0) / length, end = (hi - i0) / length;
          const gradient = ctx.createLinearGradient(a[0] + gx * start, a[1] + gy * start, a[0] + gx * end, a[1] + gy * end);
          gradient.addColorStop(0, colorAt(lo)); gradient.addColorStop(1, colorAt(hi)); fill = gradient;
        }
      }
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath();
      ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = wireframe ? '#ececfa50' : fill; ctx.lineWidth = wireframe ? .35 : .55; ctx.stroke();
    }
    hitFaces = faces;
    hitBins = new Map();
    for (const face of faces) {
      const minX = Math.floor(Math.min(...face.points.map(p => p[0])) / 24), maxX = Math.floor(Math.max(...face.points.map(p => p[0])) / 24);
      const minY = Math.floor(Math.min(...face.points.map(p => p[1])) / 24), maxY = Math.floor(Math.max(...face.points.map(p => p[1])) / 24);
      for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) { const key = x + ':' + y; if (!hitBins.has(key)) hitBins.set(key, []); hitBins.get(key).push(face); }
    }
    const feature = features.get(selectedFeature);
    if ($('cm-feature').checked) {
      ctx.beginPath(); let pen = false, lastOwner = null, last = null;
      for (let i = 0; i < feature.polygon.length; i++) {
        const a = feature.polygon[i], b = feature.polygon[(i + 1) % feature.polygon.length], steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2);
        for (let j = 0; j <= steps; j++) {
          const p = [a[0] + (b[0] - a[0]) * j / steps, a[1] + (b[1] - a[1]) * j / steps], surface = frontPosition(p);
          if (!surface) { pen = false; last = null; continue; }
          const q = project(surface.position);
          if (screenDepth(q[0], q[1]) > q[2] + .025) { pen = false; last = null; continue; }
          if (lastOwner !== surface.chamber || (last && Math.hypot(q[0] - last[0], q[1] - last[1]) > 12)) pen = false;
          if (pen) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); pen = true; last = q; lastOwner = surface.chamber;
        }
      }
      ctx.strokeStyle = '#c5e3ff'; ctx.lineWidth = 1.4; ctx.stroke();
      if ($('cm-graph').checked) {
        const active = new Set(depthChambers().map(s => s.id)); ctx.beginPath();
        feature.landmarks.forEach((id, i) => {
          const a = points.get(id), b = points.get(feature.landmarks[(i + 1) % feature.landmarks.length]);
          if (!active.has(a.chamber) || !active.has(b.chamber)) return;
          const p = project(landmarkPosition(a)), q = project(landmarkPosition(b)); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]);
        });
        ctx.setLineDash([4, 3]); ctx.strokeStyle = '#a5d3ff'; ctx.lineWidth = 1.1; ctx.stroke(); ctx.setLineDash([]);
      }
    }
    if ($('cm-points').checked) for (const s of depthChambers()) for (const point of s.landmarks) {
      const p = project(landmarkPosition({ ...point, chamber: s.id }));
      const active = point.id === selectedPoint, highlighted = $('cm-feature').checked && feature.landmarks.includes(point.id), occluded = screenDepth(p[0], p[1]) > p[2] + .025;
      ctx.beginPath(); ctx.arc(p[0], p[1], active ? 3.8 : highlighted ? 2.7 : 1.7, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#ffe08c' : highlighted ? '#d5eaff' : s.color; if (!occluded) ctx.fill();
      ctx.strokeStyle = occluded ? s.color : '#262633'; ctx.lineWidth = occluded ? 1.1 : .7; ctx.stroke();
      if (($('cm-labels').checked && highlighted) || active) {
        ctx.font = '9px -apple-system, Segoe UI, sans-serif'; ctx.lineWidth = 2.5; ctx.strokeStyle = '#202027';
        ctx.strokeText(point.id, p[0] + 5, p[1] - 5); ctx.fillStyle = '#f5f5f7'; ctx.fillText(point.id, p[0] + 5, p[1] - 5);
      }
    }
    if (!faces.length) { ctx.fillStyle = '#aaaab5'; ctx.font = '12px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Choose a chamber to explore.', width / 2, height / 2); ctx.textAlign = 'start'; }
  }

  function render() { renderXray(); renderInspector(); renderModel(); }
  function queueModel() { if (!pendingFrame) pendingFrame = requestAnimationFrame(() => { pendingFrame = 0; renderModel(); }); }
  function clearCamera() { root.querySelectorAll('[data-cm-camera]').forEach(button => button.setAttribute('aria-pressed', 'false')); }
  function reset() {
    visible.clear(); chambers.forEach(s => visible.add(s.id)); selectedFeature = 'left'; selectedPoint = null; selectedChamber = null; fullImage = false; solo = false; yaw = -.55; pitch = .28;
    for (const [id, checked] of [['cm-masks', true], ['cm-points', true], ['cm-labels', false], ['cm-feature', true], ['cm-heart-outline', false], ['cm-xray-plane', false], ['cm-wireframe', false], ['cm-graph', false]]) $(id).checked = checked;
    $('cm-opacity').value = 35; $('cm-fullness').value = 80; $('cm-zoom').value = 115; $('cm-adjust').open = false;
    $('cm-readout').textContent = 'Select a chamber or point.';
    root.querySelectorAll('[data-cm-camera]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.cmCamera === 'oblique'))); render();
  }
  for (const id of ['cm-masks', 'cm-points', 'cm-labels', 'cm-feature', 'cm-heart-outline', 'cm-opacity']) $(id).addEventListener('input', render);
  for (const id of ['cm-fullness', 'cm-zoom', 'cm-xray-plane', 'cm-wireframe', 'cm-graph']) $(id).addEventListener('input', () => { renderInspector(); renderModel(); });
  $('cm-full-image').addEventListener('click', () => { fullImage = !fullImage; renderXray(); });
  $('cm-solo').addEventListener('click', () => { if (!selectedChamber) selectedChamber = 'LV'; visible.add(selectedChamber); solo = !solo; $('cm-readout').textContent = names[selectedChamber] + (solo ? ' · Solo' : ''); render(); });
  $('cm-reset').addEventListener('click', reset);
  root.querySelectorAll('[data-cm-camera]').forEach(button => button.addEventListener('click', () => {
    const mode = button.dataset.cmCamera; yaw = { front: 0, oblique: -.55, side: Math.PI / 2 }[mode]; pitch = mode === 'oblique' ? .28 : 0;
    clearCamera(); button.setAttribute('aria-pressed', 'true'); renderModel();
  }));
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw, pitch, moved: false }; canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y; if (Math.hypot(dx, dy) > 4) drag.moved = true;
    yaw = drag.yaw + dx * .009; pitch = Math.max(-1.3, Math.min(1.3, drag.pitch + dy * .007)); clearCamera(); queueModel();
  });
  canvas.addEventListener('pointerup', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const moved = drag.moved; drag = null; if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (!moved) {
      const rect = canvas.getBoundingClientRect(), x = event.clientX - rect.left, y = event.clientY - rect.top;
      const face = [...hitFaces].reverse().find(f => {
        const [a, b, c] = f.points, sign = (p, q) => (x - q[0]) * (p[1] - q[1]) - (p[0] - q[0]) * (y - q[1]);
        const values = [sign(a, b), sign(b, c), sign(c, a)]; return !(values.some(v => v < 0) && values.some(v => v > 0));
      });
      if (face) selectChamber(face.id);
    }
  });
  canvas.addEventListener('pointercancel', () => { drag = null; }); canvas.addEventListener('lostpointercapture', () => { drag = null; });
  canvas.addEventListener('wheel', event => { event.preventDefault(); $('cm-zoom').value = Math.max(65, Math.min(175, Number($('cm-zoom').value) - Math.sign(event.deltaY) * 5)); renderInspector(); queueModel(); }, { passive: false });
  canvas.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '0'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') yaw -= .13; if (event.key === 'ArrowRight') yaw += .13;
    if (event.key === 'ArrowUp') pitch = Math.max(-1.3, pitch - .12); if (event.key === 'ArrowDown') pitch = Math.min(1.3, pitch + .12);
    if (event.key === '+' || event.key === '=') $('cm-zoom').value = Math.min(175, Number($('cm-zoom').value) + 5);
    if (event.key === '-') $('cm-zoom').value = Math.max(65, Number($('cm-zoom').value) - 5);
    if (event.key === '0') { yaw = -.55; pitch = .28; $('cm-zoom').value = 115; }
    clearCamera(); renderInspector(); renderModel();
  });
  $('cm-export').addEventListener('click', () => {
    const rows = ['sample,feature,landmarks,area_px2,closed_perimeter_px'];
    for (const feature of S.features) rows.push([S.id, feature.id, feature.landmarks.join('|'), feature.area, feature.perimeter].join(','));
    const url = URL.createObjectURL(new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8' })), link = document.createElement('a');
    link.href = url; link.download = 'cardiomorph-h0001-2d-features.csv'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.addEventListener('pointerdown', event => { if ($('cm-adjust').open && !$('cm-adjust').contains(event.target)) $('cm-adjust').open = false; });
  $('cm-adjust').addEventListener('keydown', event => { if (event.key === 'Escape') { $('cm-adjust').open = false; $('cm-adjust').querySelector('summary').focus(); } });
  image.onload = renderModel; image.onerror = () => { $('cm-readout').textContent = 'The optional X-ray plane could not load.'; }; image.src = 'static/interactive/sample/' + S.image;
  if (typeof ResizeObserver === 'function') new ResizeObserver(queueModel).observe(canvas.parentElement);
  window.addEventListener('resize', queueModel); render();
})();
