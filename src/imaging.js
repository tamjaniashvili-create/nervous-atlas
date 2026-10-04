/* კვლევები: CT / MRI / PET-CT ჭრილები, აგებული BodyParts3D-ის 3D მოდელიდან.
   ჭრილი = ორთოგრაფიული კამერა + clipping plane; თითოეული ქსოვილის ჯგუფისთვის ზედაპირების გადაკვეთის
   ლუწ-კენტობა (parity) სხივის გასწვრივ → შიგნით/გარეთ ნიღაბი. ნიღბები → ქსოვილის ეტიკეტი → მოდალობის
   ინტენსივობა (IMG_BASE, IMG_CASES-ის კომპონენტები) → ხმაური, ნაწილობრივი მოცულობა, PET-ის შერწყმა. */
window.createImaging = function (D) {
  const { R, scene, ALL, fxRoot, anchor, esc } = D;
  const N = 320, SIZE0 = 0.21, HC0 = new THREE.Vector3(0, 1.632, -0.012);
  let SIZE = SIZE0, HC = HC0.clone();
  const RANGE = { ax: [1.55, 1.725], cor: [-0.112, 0.085], sag: [-0.075, 0.075] };
  R.localClippingEnabled = true;
  const RT = new THREE.WebGLRenderTarget(N, N, { depthBuffer: false });
  const buf = new Uint8Array(N * N * 4);
  const ocam = new THREE.OrthographicCamera(-SIZE0 / 2, SIZE0 / 2, SIZE0 / 2, -SIZE0 / 2, 0.0001, 3);
  const plane = new THREE.Plane();
  // each surface crossing beyond the plane adds 1/255 → odd count = inside (independent of winding)
  const mat = new THREE.ShaderMaterial({ side: THREE.DoubleSide, clipping: true, clippingPlanes: [plane], depthTest: false, depthWrite: false, transparent: true,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
    vertexShader: '#include <clipping_planes_pars_vertex>\nvoid main(){\n#include <begin_vertex>\n#include <project_vertex>\n#include <clipping_planes_vertex>\n}',
    fragmentShader: '#include <clipping_planes_pars_fragment>\nvoid main(){\n#include <clipping_planes_fragment>\ngl_FragColor=vec4(1.0/255.0,0.0,0.0,0.0);\n}' });

  const G = m => m.userData.g, L = m => m.userData.lname;
  const GM_DEEP = /caudate|putamen|pallidus|thalamus|hippocamp|amygdala|parahippocampal|hypothalamus|geniculate|colliculus/;
  const WM_DEEP = /white matter|corpus callosum|internal capsule|fornix|commissure/;
  const LAYERS = [
    ['skin', m => G(m) === 'skin'],
    ['bone', m => G(m) === 'bone'],
    ['ctx', m => G(m) === 'cortex'],
    ['cb', m => G(m) === 'cerebellum'],
    ['wm', m => (G(m) === 'deep' && WM_DEEP.test(L(m))) || G(m) === 'stem'],
    ['dgm', m => G(m) === 'deep' && GM_DEEP.test(L(m))],
    ['vent', m => G(m) === 'ventricle' || /cerebral aqueduct/.test(L(m))],
  ];
  // tissue labels
  const T = { air: 0, soft: 1, bone: 2, csf: 3, gm: 4, wm: 5, dgm: 6, cb: 7, edema: 8 };
  const MODS = ['ct', 'ctb', 'ctc', 't1', 't1c', 't2', 'flair', 'dwi', 'adc', 'fdg', 'fet', 'dota'];
  const BASEV = [ // ct ctb ctc t1 t1c t2 flair dwi adc fdg fet dota
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [.48, .34, .52, .55, .58, .45, .4, .15, .35, .12, .12, .04],
    [1, .95, 1, .1, .12, .06, .06, .03, .05, .03, .02, .02],
    [.12, .3, .14, .08, .1, .95, .06, .05, .95, 0, 0, 0],
    [.55, .33, .57, .45, .47, .58, .52, .45, .42, .78, .18, .01],
    [.43, .32, .45, .66, .67, .36, .4, .4, .38, .28, .13, .01],
    [.53, .33, .55, .5, .52, .48, .48, .43, .4, .85, .18, .01],
    [.52, .33, .55, .52, .54, .52, .48, .43, .41, .62, .16, .01],
    [.3, .31, .31, .38, .39, .85, .88, .38, .65, .18, .12, .02],
  ];
  const noise = new Float32Array(N * N); { let s = 12345; for (let i = 0; i < N * N; i++) { let a = 0; for (let k = 0; k < 4; k++) { s = (s * 16807) % 2147483647; a += s / 2147483647; } noise[i] = a - 2; } }

  function frame(pl, s) {
    ocam.left = ocam.bottom = -SIZE / 2; ocam.right = ocam.top = SIZE / 2;
    const c = HC.clone(), r = new THREE.Vector3(), u = new THREE.Vector3();
    if (pl === 'ax') { c.y = s; r.set(1, 0, 0); u.set(0, 0, 1); ocam.position.set(c.x, s - 1, c.z); plane.set(new THREE.Vector3(0, 1, 0), -s); }
    else if (pl === 'cor') { c.z = s; r.set(1, 0, 0); u.set(0, 1, 0); ocam.position.set(c.x, c.y, s + 1); plane.set(new THREE.Vector3(0, 0, -1), s); }
    else { c.x = s; r.set(0, 0, -1); u.set(0, 1, 0); ocam.position.set(s + 1, c.y, c.z); plane.set(new THREE.Vector3(-1, 0, 0), s); }
    ocam.up.copy(u); ocam.lookAt(c); ocam.updateMatrixWorld(); ocam.updateProjectionMatrix();
    return { c, r, u };
  }
  // pixel (i, j) with j counted from the top → world point
  const world = (F, i, j, out) => out.copy(F.c).addScaledVector(F.r, ((i + .5) / N - .5) * SIZE).addScaledVector(F.u, (.5 - (j + .5) / N) * SIZE);

  function masks(pl, s) {
    const F = frame(pl, s), vis = ALL.map(m => m.visible), fxv = fxRoot.visible, bg = scene.background, cc = R.getClearColor(new THREE.Color()), ca = R.getClearAlpha();
    fxRoot.visible = false; scene.background = null; scene.overrideMaterial = mat;
    const out = {};
    R.setRenderTarget(RT); R.setClearColor(0x000000, 0);
    for (const [k, f] of LAYERS) {
      ALL.forEach(m => { m.visible = f(m); });
      R.clear(); R.render(scene, ocam); R.readRenderTargetPixels(RT, 0, 0, N, N, buf);
      const a = new Uint8Array(N * N);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) a[(N - 1 - y) * N + x] = buf[(y * N + x) * 4] & 1; // flip to top-down rows
      out[k] = a;
    }
    R.setRenderTarget(null); R.setClearColor(cc, ca);
    ALL.forEach((m, i) => { m.visible = vis[i]; }); fxRoot.visible = fxv; scene.background = bg; scene.overrideMaterial = null;
    return { F, M: out };
  }
  function labels(M) {
    const lab = new Uint8Array(N * N), ext = new Uint8Array(N * N), st = [];
    // extracranial = non-bone pixels reachable from the image border
    for (let i = 0; i < N; i++) for (const p of [i, (N - 1) * N + i, i * N, i * N + N - 1]) if (!M.bone[p] && !ext[p]) { ext[p] = 1; st.push(p); }
    while (st.length) { const p = st.pop(), x = p % N, y = (p / N) | 0;
      for (const q of [x > 0 ? p - 1 : -1, x < N - 1 ? p + 1 : -1, y > 0 ? p - N : -1, y < N - 1 ? p + N : -1]) if (q >= 0 && !ext[q] && !M.bone[q]) { ext[q] = 1; st.push(q); } }
    for (let p = 0; p < N * N; p++) {
      let t = M.skin[p] ? T.soft : T.air;
      if (!ext[p]) t = T.csf;
      if (M.bone[p]) t = T.bone;
      if (M.ctx[p]) t = T.gm;
      if (M.cb[p]) t = T.cb;
      if (M.wm[p]) t = T.wm;
      if (M.dgm[p]) t = T.dgm;
      if (M.vent[p]) t = T.csf;
      lab[p] = t;
    }
    return lab;
  }

  // ---- lesion components: {at, r:[x,y,z] | number, n (thin axis, for dural tail), t, irr, k:'edema'|..., v:[12 values]}
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  function prepComps(cs) { return (cs || []).map(c => { const at = anchor(c.at); const r = Array.isArray(c.r) ? c.r : [c.r, c.r, c.r];
    let n = null; if (c.n) n = (c.n === 'skull' ? at.clone().sub(HC) : new THREE.Vector3(...c.n)).normalize();
    return Object.assign({}, c, { P: at, R: r, Nn: n }); }); }
  function inside(c, p) {
    const d = tmp.copy(p).sub(c.P);
    let q;
    if (c.Nn) { const dn = d.dot(c.Nn); tmp2.copy(d).addScaledVector(c.Nn, -dn); q = (dn / c.t) ** 2 + tmp2.lengthSq() / (c.R[0] ** 2); }
    else q = (d.x / c.R[0]) ** 2 + (d.y / c.R[1]) ** 2 + (d.z / c.R[2]) ** 2;
    if (q > 2.2) return false;
    const L = d.length() || 1e-9, irr = c.irr || 0;
    const w = 1 + irr * Math.sin(d.x / L * 5.3 + 1.1) * Math.sin(d.y / L * 4.1 + .4) * Math.sin(d.z / L * 6.2 + 2.3) + irr * .5 * Math.sin(d.x / L * 11 + d.z / L * 9);
    return q < w * w;
  }
  function intensities(lab, F, comps, mod) {
    const mi = MODS.indexOf(mod), I = new Float32Array(N * N), cl = new Int16Array(N * N).fill(-1), p = new THREE.Vector3();
    for (let i = 0; i < N * N; i++) I[i] = BASEV[lab[i]][mi];
    if (comps.length) {
      // bounding test per component in the slice to skip work
      const live = comps.filter(c => { const r = Math.max(...c.R) * 1.6; const d = Math.abs(tmp.copy(c.P).sub(F.c).dot(tmp2.copy(F.r).cross(F.u))); return d < r; });
      if (live.length) for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const k = j * N + i, t = lab[k];
        world(F, i, j, p);
        for (let ci = 0; ci < live.length; ci++) { const c = live[ci];
          if (c.k === 'edema' && t !== T.wm && t !== T.dgm) continue;
          if (t === T.bone && !c.bone) continue;
          if ((t === T.soft || t === T.air) && !c.soft) continue;
          if (inside(c, p)) { cl[k] = ci; I[k] = c.k === 'edema' ? BASEV[T.edema][mi] : c.v[mi]; } }
      }
    }
    return I;
  }
  function blur(a, r, pass) {
    const b = new Float32Array(N * N);
    for (let it = 0; it < pass; it++) {
      for (let y = 0; y < N; y++) { let s = 0; for (let x = -r; x <= r; x++) s += a[y * N + Math.min(N - 1, Math.max(0, x))];
        for (let x = 0; x < N; x++) { b[y * N + x] = s / (2 * r + 1); s += a[y * N + Math.min(N - 1, x + r + 1)] - a[y * N + Math.max(0, x - r)]; } }
      for (let x = 0; x < N; x++) { let s = 0; for (let y = -r; y <= r; y++) s += b[Math.min(N - 1, Math.max(0, y)) * N + x];
        for (let y = 0; y < N; y++) { a[y * N + x] = s / (2 * r + 1); s += b[Math.min(N - 1, y + r + 1) * N + x] - b[Math.max(0, y - r) * N + x]; } }
    }
    return a;
  }
  const HOT = t => { t = Math.max(0, Math.min(1, t)); return [Math.min(1, t * 2.4) * 255, Math.max(0, Math.min(1, t * 2.4 - .9)) * 255, Math.max(0, t * 3 - 2.1) * 255]; };
  const PET = { fdg: 1, fet: 1, dota: 1 };
  function image(lab, F, comps, mod) {
    const img = new ImageData(N, N), d = img.data;
    if (PET[mod]) {
      const ctI = blur(intensities(lab, F, comps, 'ct'), 1, 1), U = blur(intensities(lab, F, comps, mod), 3, 3);
      const mx = mod === 'fdg' ? .9 : mod === 'fet' ? .75 : .8;
      for (let i = 0; i < N * N; i++) { const g = (.12 + ctI[i] * .55) * 255, u = U[i] / mx, h = HOT(u), a = Math.min(1, u * 1.6);
        d[i * 4] = g + (h[0] - g) * a; d[i * 4 + 1] = g + (h[1] - g) * a; d[i * 4 + 2] = g + (h[2] - g) * a; d[i * 4 + 3] = 255; }
    } else {
      const I = blur(intensities(lab, F, comps, mod), 1, 1), sg = /^ct/.test(mod) ? .018 : mod === 'dwi' || mod === 'adc' ? .035 : .022;
      for (let i = 0; i < N * N; i++) { let v = I[i]; if (v > .02 || mod !== 'ctb') v += noise[i] * sg * (lab[i] === T.air ? .4 : 1); v = Math.max(0, Math.min(1, v)) * 255; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255; }
    }
    return img;
  }

  // ---------------------------------------------------------------- viewer state & UI
  const CASES = window.IMG_CASES, MODINFO = window.IMG_MODS;
  let on = false, cur = CASES[0], mod = 't1c', pl = 'ax', s = 1.645, cache = null, dirty = true, ann = true, loc = null;
  const wrap = document.getElementById('imgWrap'), cv = document.getElementById('imgCv'), g = cv.getContext('2d'), off = document.createElement('canvas'); off.width = off.height = N;
  const og = off.getContext('2d');
  const sl = document.getElementById('imgSlice');
  function setCase(c) { cur = c; SIZE = c.fov || SIZE0; HC = c.ctr ? new THREE.Vector3(...c.ctr) : HC0.clone(); pl = c.plane || 'ax'; mod = c.mod || 't1c'; s = c.slice != null ? c.slice : pl === 'ax' ? lesY() : pl === 'cor' ? lesC().z : lesC().x; s = Math.min(RANGE[pl][1], Math.max(RANGE[pl][0], s)); cache = null; loc = null; dirty = true; syncBar(); }
  function syncBar() {
    const [a, b] = RANGE[pl]; sl.min = 0; sl.max = Math.round((b - a) / .002); sl.value = Math.round((s - a) / .002);
    wrap.querySelectorAll('[data-pl]').forEach(x => x.setAttribute('aria-pressed', x.dataset.pl === pl));
    const an = wrap.querySelector('#imgAnn'); if (an) an.setAttribute('aria-pressed', ann);
  }
  sl.addEventListener('input', () => { s = RANGE[pl][0] + sl.value * .002; cache = null; dirty = true; });
  wrap.addEventListener('click', e => { const b = e.target.closest('[data-pl]'); if (b) { pl = b.dataset.pl; s = pl === 'ax' ? (cur.slice && cur.plane === 'ax' ? cur.slice : lesY()) : pl === 'cor' ? lesC().z : lesC().x; s = Math.min(RANGE[pl][1], Math.max(RANGE[pl][0], s)); cache = null; loc = null; dirty = true; syncBar(); }
    if (e.target.id === 'imgAnn') { ann = !ann; dirty = true; syncBar(); } });
  cv.addEventListener('wheel', e => { if (!on) return; e.preventDefault(); step(e.deltaY > 0 ? -1 : 1); }, { passive: false });
  addEventListener('keydown', e => { if (!on || /INPUT/.test(document.activeElement.tagName) && document.activeElement !== sl) return; if (e.key === 'ArrowUp') { step(1); e.preventDefault(); } if (e.key === 'ArrowDown') { step(-1); e.preventDefault(); } });
  function step(k) { const [a, b] = RANGE[pl]; s = Math.min(b, Math.max(a, s + k * .002)); cache = null; dirty = true; syncBar(); }
  const lesC = () => { const c = (cur.comps || []).find(x => x.main); return c ? anchor(c.at) : HC.clone().setY(1.645); };
  const lesY = () => lesC().y;

  function render() {
    if (!cache) { const r = masks(pl, s); cache = { F: r.F, lab: labels(r.M), comps: prepComps((cur.comps || []).concat(cur.noPit ? [] : [PIT])) }; }
    og.putImageData(image(cache.lab, cache.F, cache.comps, mod), 0, 0);
    if (!loc) loc = locator();
    draw();
  }
  const PIT = { soft: true, at: [0, 1.602, 0.002], r: [.0055, .003, .0045], v: [.52, .33, .62, .47, .85, .55, .52, .45, .42, .35, .2, .55] };
  function locator() { // scout view: midline sagittal (or axial for sagittal slices), T1
    const lp = pl === 'sag' ? 'ax' : 'sag', ls = lp === 'sag' ? 0 : 1.64, sv = [SIZE, HC]; SIZE = SIZE0; HC = HC0.clone(); const r = masks(lp, ls), lab = labels(r.M); SIZE = sv[0]; HC = sv[1];
    const c = document.createElement('canvas'); c.width = c.height = N; c.getContext('2d').putImageData(image(lab, r.F, [], 't1'), 0, 0); return { c, lp };
  }
  function draw() {
    const W = cv.width, H = cv.height, dpr = cv._dpr || 1; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(off, 0, 0, W, H);
    g.setTransform(dpr, 0, 0, dpr, 0, 0); const w = W / dpr, h = H / dpr;
    const PL = { ax: ['A', 'P', 'R', 'L', 'აქსიალური'], cor: ['S', 'I', 'R', 'L', 'კორონარული'], sag: ['S', 'I', 'A', 'P', 'საგიტალური'] }[pl];
    g.font = '600 13px "IBM Plex Mono",monospace'; g.fillStyle = '#e6c46e'; g.textAlign = 'center';
    g.fillText(PL[0], w / 2, 18); g.fillText(PL[1], w / 2, h - 8); g.textAlign = 'left'; g.fillText(PL[2], 8, h / 2); g.textAlign = 'right'; g.fillText(PL[3], w - 8, h / 2);
    g.textAlign = 'left'; g.font = '500 12px "IBM Plex Mono",monospace'; g.fillStyle = '#ece6da';
    g.fillText(MODINFO[mod].short, 10, 20); g.fillStyle = '#8a9199'; g.font = '11px "Noto Sans Georgian",sans-serif';
    const [a, b] = RANGE[pl]; g.fillText(`${PL[4]} · ${Math.round((s - a) / .002) + 1}/${Math.round((b - a) / .002) + 1}`, 10, 36);
    // localizer inset
    if (loc && w > 300) { const z = Math.round(Math.min(110, w * .22)), x0 = w - z - 8, y0 = 8; g.globalAlpha = .9; g.drawImage(loc.c, x0, y0, z, z); g.globalAlpha = 1; g.strokeStyle = 'rgba(236,230,218,.35)'; g.strokeRect(x0 + .5, y0 + .5, z, z);
      g.strokeStyle = '#e6c46e'; g.lineWidth = 1.5; g.beginPath();
      if (loc.lp === 'sag') { if (pl === 'ax') { const t = (.5 - (s - HC0.y) / SIZE0) * z; g.moveTo(x0, y0 + t); g.lineTo(x0 + z, y0 + t); } else { const t = (.5 - (s - HC0.z) / SIZE0) * z; g.moveTo(x0 + t, y0); g.lineTo(x0 + t, y0 + z); } }
      else { const t = (.5 + (s - HC0.x) / SIZE0) * z; g.moveTo(x0 + t, y0); g.lineTo(x0 + t, y0 + z); }
      if (SIZE < SIZE0) { const k = z / SIZE0, F = cache && cache.F; if (F) { const cx = (F.c.dot(loc.lp === 'sag' ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(1, 0, 0)) - (loc.lp === 'sag' ? -HC0.z : HC0.x)) * k + z / 2, cy = (loc.lp === 'sag' ? (HC0.y - F.c.y) : (HC0.z - F.c.z)) * k + z / 2; g.stroke(); g.strokeStyle = 'rgba(107,155,224,.9)'; g.beginPath(); g.rect(x0 + cx - SIZE * k / 2, y0 + cy - SIZE * k / 2, SIZE * k, SIZE * k); } }
      g.stroke(); g.lineWidth = 1; }
    // PET colour bar
    if (PET[mod]) { const x0 = w - 22, y0 = h * .3, bh = h * .4; for (let i = 0; i < bh; i++) { const c = HOT(1 - i / bh); g.fillStyle = `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`; g.fillRect(x0, y0 + i, 10, 1.2); }
      g.fillStyle = '#8a9199'; g.font = '10px "IBM Plex Mono",monospace'; g.textAlign = 'right'; g.fillText('SUV', x0 + 10, y0 - 6); g.textAlign = 'left'; }
    // annotation arrow to the main lesion
    if (ann && cache) { for (const c of cache.comps) { if (!c.main) continue; const F = cache.F, d = tmp.copy(c.P).sub(F.c), n = tmp2.copy(F.r).cross(F.u), dist = Math.abs(d.dot(n)); if (dist > Math.max(...c.R) * .9) continue;
      const px = (d.dot(F.r) / SIZE + .5) * w, py = (.5 - d.dot(F.u) / SIZE) * h, rr = Math.max(...c.R) / SIZE * w + 8, ang = -Math.PI / 4 + (px > w / 2 ? -Math.PI / 2 : 0);
      const ex = px + Math.cos(ang) * rr, ey = py + Math.sin(ang) * rr, sx = px + Math.cos(ang) * (rr + 34), sy = py + Math.sin(ang) * (rr + 34);
      g.strokeStyle = '#e6c46e'; g.fillStyle = '#e6c46e'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx, sy); g.lineTo(ex, ey); g.stroke();
      const hA = Math.atan2(ey - sy, ex - sx); g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - 9 * Math.cos(hA - .4), ey - 9 * Math.sin(hA - .4)); g.lineTo(ex - 9 * Math.cos(hA + .4), ey - 9 * Math.sin(hA + .4)); g.fill(); g.lineWidth = 1;
      if (c.label) { g.font = '600 12px "Noto Sans Georgian",sans-serif'; g.textAlign = sx > px ? 'left' : 'right'; g.fillText(c.label, sx + (sx > px ? 4 : -4), sy - 4); g.textAlign = 'left'; } } }
  }
  function layout(rect) {
    if (!rect) return; const bar = 44, sz = Math.max(160, Math.floor(Math.min(rect.w, rect.h - bar)));
    Object.assign(wrap.style, { left: Math.round(rect.x + (rect.w - sz) / 2) + 'px', top: Math.round(rect.y + Math.max(0, (rect.h - bar - sz) / 2)) + 'px', width: sz + 'px' });
    const dpr = Math.min(devicePixelRatio, 2); cv.style.width = cv.style.height = sz + 'px'; if (cv.width !== sz * dpr) { cv.width = cv.height = sz * dpr; cv._dpr = dpr; } dirty = true;
  }

  // ---------------------------------------------------------------- panels
  function renderLeft(Lb) {
    document.getElementById('leftTitle').textContent = 'კვლევები · შემთხვევები';
    let grp = '';
    Lb.innerHTML = '<div class="vlist">' + CASES.map((c, i) => { const h = c.grp !== grp ? `<div class="ngrp">${esc(grp = c.grp)}</div>` : '';
      return h + `<button class="vitem" type="button" data-img="${c.id}" aria-current="${c === cur}"><span class="dot">${i + 1}</span><span><b>${esc(c.ka)}</b><small>${esc(c.sub)}</small></span></button>`; }).join('') + '</div>';
  }
  const MGROUPS = [['CT', ['ct', 'ctb', 'ctc']], ['MRI', ['t1', 't1c', 't2', 'flair', 'dwi', 'adc']], ['PET-CT', ['fdg', 'fet', 'dota']]];
  function renderRight(B) {
    const c = cur, mi = MODINFO[mod], fk = mod === 'adc' ? 'dwi' : mod === 'ctb' && !c.find.ctb ? 'ct' : mod;
    B.innerHTML = `<div class="card-h"><div class="eyebrow"><span>კვლევები</span>${c.who ? `<span>·</span><span class="icd">${esc(c.who)}</span>` : ''}</div><h1>${esc(c.ka)}</h1><div class="en">${esc(c.en)}</div></div>
      <div class="sec"><h3>კვლევა</h3>${MGROUPS.map(([gname, ms]) => `<div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-bottom:6px"><span style="font:500 10.5px var(--mono);color:var(--muted);width:46px">${gname}</span>${ms.map(m => `<button type="button" class="chip" data-mod="${m}" aria-pressed="${m === mod}">${esc(MODINFO[m].chip)}</button>`).join('')}</div>`).join('')}</div>
      <div class="sec"><div class="stepbox"><h4>${esc(mi.name)}</h4><p>${esc(c.find[fk] || '')}</p></div></div>
      <div class="sec"><h3>მთავარი ნიშნები</h3><ul>${c.key.map(k => `<li>${esc(k)}</li>`).join('')}</ul>${c.sim ? `<div style="margin-top:8px"><button class="chip" type="button" data-imgsim="${c.sim}">ოპერაციის სიმულაცია →</button></div>` : ''}</div>
      <div class="sec"><details><summary style="cursor:pointer;color:var(--muted);font:600 11px var(--sans);letter-spacing:.9px;text-transform:uppercase">მეთოდი · ${esc(mi.chip)}</summary><p style="margin-top:8px">${esc(mi.how)}</p>${mi.safe ? `<p><b style="font-weight:600">ფარმაკოლოგია და უსაფრთხოება:</b> ${esc(mi.safe)}</p>` : ''}</details></div>
      <div class="sec refs"><h3>წყაროები</h3><ul>${(c.refs || []).concat(mi.refs || []).map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ul></div>
      <p class="disc">სინთეზური, სასწავლო გამოსახულება: ანატომია აგებულია BodyParts3D-ის 3D მოდელის ჭრილიდან, ქსოვილების სიგნალი და დაზიანებები მოდელირებულია ტიპური ნიშნების მიხედვით. ეს არ არის პაციენტის რეალური კვლევა.</p>`;
  }
  function onLeft(e) { if (!on) return; const b = e.target.closest('[data-img]'); if (b) { setCase(CASES.find(x => x.id === b.dataset.img)); renderLeft(document.getElementById('leftBody')); renderRight(document.getElementById('rightBody')); D.onCase && D.onCase(); } }
  function onRight(e) { if (!on) return; const b = e.target.closest('[data-mod]'); if (b) { mod = b.dataset.mod; dirty = true; renderRight(document.getElementById('rightBody')); return; }
    const sb = e.target.closest('[data-imgsim]'); if (sb) D.openSim(sb.dataset.imgsim); }
  document.getElementById('leftBody').addEventListener('click', onLeft);
  document.getElementById('rightBody').addEventListener('click', onRight);
  setCase(cur);
  return {
    enter(id) { on = true; wrap.hidden = false; if (id) { const c = CASES.find(x => x.id === id); if (c && c !== cur) setCase(c); } dirty = true; },
    leave() { on = false; wrap.hidden = true; },
    tick() { if (on && dirty) { dirty = false; render(); } },
    layout, renderLeft, renderRight,
    state: () => ({ id: cur.id, mod, pl, s }), setMod(m) { mod = m; dirty = true; renderRight(document.getElementById('rightBody')); }, setCaseId(id) { setCase(CASES.find(x => x.id === id)); renderLeft(document.getElementById('leftBody')); renderRight(document.getElementById('rightBody')); },
  };
};
