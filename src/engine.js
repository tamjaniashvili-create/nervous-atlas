(function () {
'use strict';
const PACK = window.PACK_URL || 'pack';
const $ = s => document.querySelector(s);
const isPhone = () => innerWidth <= 760;

// ---------------------------------------------------------------- renderer
const stage = $('#stage');
const R = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
R.setPixelRatio(Math.min(devicePixelRatio, 2));
R.outputEncoding = THREE.sRGBEncoding; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 0.9;
stage.appendChild(R.domElement);
const scene = new THREE.Scene();
{ const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
  const gr = g.createRadialGradient(256, 220, 30, 256, 256, 400); gr.addColorStop(0, '#222a34'); gr.addColorStop(1, '#07090c');
  g.fillStyle = gr; g.fillRect(0, 0, 512, 512); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; scene.background = t; }
const cam = new THREE.PerspectiveCamera(30, 1, 0.004, 20);
const ctl = new THREE.OrbitControls(cam, R.domElement);
ctl.enableDamping = true; ctl.dampingFactor = 0.09; ctl.minDistance = 0.05; ctl.maxDistance = 6; ctl.screenSpacePanning = true;
scene.add(new THREE.HemisphereLight(0xf4efe6, 0x2a2622, 0.55));
const key = new THREE.DirectionalLight(0xfff3e2, 1.2); key.position.set(1.5, 2.5, 2.2); scene.add(key);
const fill = new THREE.DirectionalLight(0xcfe0ff, 0.35); fill.position.set(-2, 0.8, 1.2); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffffff, 0.65); rim.position.set(-0.5, 1.5, -2.5); scene.add(rim);
const back = new THREE.DirectionalLight(0xfff0e0, 0.45); back.position.set(0.5, 1.2, -2); scene.add(back);
scene.add(cam); cam.add(new THREE.PointLight(0xffffff, 0.22));

let MICRO = null;
function resize() {
  const w = innerWidth, h = innerHeight; R.setSize(w, h); cam.aspect = w / h; if (MICRO) MICRO.cam.aspect = w / h;
  layout();
}
// keep the model centred in the free area between/above the panels (no overlap at any size)
function layout() {
  const w = innerWidth, h = innerHeight, Lp = document.getElementById('left'), Rp = document.getElementById('right');
  if (!Lp || !Rp) return;
  document.documentElement.style.setProperty('--rh', Math.round(Rp.getBoundingClientRect().height) + 'px');
  const L = Lp.getBoundingClientRect(), Rt = Rp.getBoundingClientRect();
  let ox = 0, oy = 0;
  if (w <= 760) { const lg = document.getElementById('legend').getBoundingClientRect(); const top = Math.max(lg.bottom, 90) + 4, bottom = Math.min(L.top, Rt.top) - 4; oy = Math.round(h / 2 - (top + bottom) / 2); }
  else { const a = L.right + 8, b = Rt.left - 8; ox = Math.round(w / 2 - (a + b) / 2); oy = Rt.height < 120 && L.height < 120 ? 0 : 0; }
  for (const c of [cam, MICRO && MICRO.cam]) { if (!c) continue; if (ox || oy) c.setViewOffset(w, h, ox, oy, w, h); else c.clearViewOffset(); c.updateProjectionMatrix(); }
}
if (window.ResizeObserver) { const ro = new ResizeObserver(() => layout()); addEventListener('DOMContentLoaded', () => {}); setTimeout(() => { ['left', 'right'].forEach(id => { const el = document.getElementById(id); if (el) ro.observe(el); }); }, 0); }
MICRO = window.createMicro(R);
addEventListener('resize', resize); resize();

// ---------------------------------------------------------------- textures & materials
function tex(w, h, f) { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const fibre = tex(64, 512, (x, w, h) => { x.fillStyle = '#808080'; x.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { const y = rnd() * h; x.strokeStyle = `rgba(${rnd() < .5 ? 255 : 0},${rnd() < .5 ? 255 : 0},${rnd() < .5 ? 255 : 0},.18)`; x.lineWidth = 1 + rnd() * 2; x.beginPath(); x.moveTo(0, y); x.bezierCurveTo(w * .3, y + 6, w * .7, y - 6, w, y + 2); x.stroke(); } });
const grain = tex(256, 256, (x, w, h) => { const d = x.createImageData(w, h); for (let i = 0; i < d.data.length; i += 4) { const v = 118 + rnd() * 20; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); });
const lin = hex => new THREE.Color(hex).convertSRGBToLinear();
const BASE = { cortex: 0xd9ad9c, cerebellum: 0xc99684, stem: 0xe6cdb8, deep: 0xb5a79c, ventricle: 0x6fa9c9, cranial: 0xf0dca6, spinal: 0xf0dca6, legs: 0xf0dca6, cord: 0xeedcc2, bone: 0xe9dec8, disc: 0xa9c6d6, muscle: 0x9a5c52, artery: 0x9c5a52 };
const DEEPCOL = [[/thalamus/, 0x7fa7c9], [/caudate/, 0x8fbf8a], [/putamen/, 0xd6a25e], [/pallidus/, 0xc98a4a], [/hippocamp/, 0xc57fb0], [/amygdala/, 0xd9707a], [/internal capsule|corpus callosum|fornix|white matter/, 0xefe7dc], [/hypothalam|mammillary|tuber/, 0xc9b27a]];
const LOBES = [[/precentral|frontal|orbital|straight/, 0x6f95d8, 'შუბლის წილი'], [/postcentral|parietal|supramarginal|angular/, 0xd8b85a, 'თხემის წილი'], [/temporal|fusiform/, 0x69b38a, 'საფეთქლის წილი'], [/occipital/, 0x9b7ed0, 'კეფის წილი'], [/cingulate|parahippocampal/, 0xd07fa2, 'ლიმბური ქერქი'], [/insula|short gyrus/, 0xe08e55, 'კუნძული']];
const COL = { red: 0xe2574c, amber: 0xe9a23b, blue: 0x6b9be0, green: 0x63b57d, teal: 0x5fc2c0, grey: 0x5a5d62, gold: 0xe6c46e };
const cLin = k => lin(COL[k] != null ? COL[k] : k);

function makeMat(g) {
  const bump = { cortex: [grain, .0015], cerebellum: [fibre, .004], cord: [fibre, .002], cranial: [fibre, .0015], spinal: [fibre, .0015], legs: [fibre, .0015], muscle: [fibre, .003] }[g];
  const phys = /cortex|cerebellum|stem|cord|cranial|spinal|legs|muscle|artery/.test(g);
  const o = { color: 0xffffff, vertexColors: true, roughness: g === 'bone' ? .75 : g === 'muscle' ? .55 : .45 };
  if (bump) { o.bumpMap = bump[0]; o.bumpScale = bump[1]; }
  if (phys) { o.clearcoat = g === 'muscle' ? .25 : .35; o.clearcoatRoughness = .45; }
  return phys ? new THREE.MeshPhysicalMaterial(o) : new THREE.MeshStandardMaterial(o);
}
const skinMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
  uniforms: { c: { value: lin(0xd9b99f) }, a: { value: .38 } },
  vertexShader: 'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
  fragmentShader: 'uniform vec3 c;uniform float a;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.-abs(dot(normalize(vN),normalize(vV))),2.2);gl_FragColor=vec4(c,f*a);}' });
function boxUV(geo, s) { const p = geo.attributes.position, n = geo.attributes.normal, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i)); let u, v;
    if (ax >= ay && ax >= az) { u = p.getZ(i); v = p.getY(i); } else if (ay >= az) { u = p.getX(i); v = p.getZ(i); } else { u = p.getX(i); v = p.getY(i); }
    uv[i * 2] = u * s; uv[i * 2 + 1] = v * s; }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); }

// ---------------------------------------------------------------- meshes
const ALL = []; const BYG = {};
function register(mesh, name, g, fma) {
  const geo = mesh.geometry; geo.computeBoundingBox();
  const n = geo.attributes.position.count;
  let base = lin(BASE[g] || 0xcccccc);
  if (g === 'deep') { const h = DEEPCOL.find(([re]) => re.test(name.toLowerCase())); if (h) base = lin(h[1]); }
  const col = new Float32Array(n * 3); for (let i = 0; i < n; i++) { col[i * 3] = base.r; col[i * 3 + 1] = base.g; col[i * 3 + 2] = base.b; }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const c = new THREE.Vector3(); geo.boundingBox.getCenter(c);
  mesh.userData = { name, lname: name.toLowerCase(), g, fma, base, c, dirty: false };
  if (g === 'bone' || g === 'skin') mesh.renderOrder = 5;
  ALL.push(mesh); (BYG[g] = BYG[g] || []).push(mesh); scene.add(mesh);
}
function paint(mesh, color, pred) {
  const ud = mesh.userData, a = mesh.geometry.attributes.color, p = mesh.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    if (pred && !pred(p.getX(i), p.getY(i), p.getZ(i))) continue;
    a.setXYZ(i, color.r, color.g, color.b);
  }
  a.needsUpdate = true; ud.dirty = true;
}
function resetColor(mesh, k = 1) { const b = mesh.userData.base; const a = mesh.geometry.attributes.color;
  for (let i = 0; i < a.count; i++) a.setXYZ(i, b.r * k, b.g * k, b.b * k); a.needsUpdate = true; mesh.userData.dirty = false; }

async function loadPack() {
  const bar = $('#loadBar');
  const man = await (await fetch(PACK + '.json')).json();
  const res = await fetch(PACK + '.wasm'); // raw mesh bytes (served under a binary-safe extension)
  const total = +res.headers.get('content-length') || 5.3e6;
  let buf;
  if (res.body && res.body.getReader) {
    const rd = res.body.getReader(); const parts = []; let got = 0;
    for (;;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); got += value.length; bar.style.width = Math.min(96, got / total * 100) + '%'; }
    buf = new Uint8Array(got); let o = 0; for (const p of parts) { buf.set(p, o); o += p.length; } buf = buf.buffer;
  } else buf = await res.arrayBuffer();
  for (const m of man) {
    const q = new Uint16Array(buf, m.o, m.v * 3), pos = new Float32Array(m.v * 3);
    for (let i = 0; i < m.v; i++) for (let k = 0; k < 3; k++) pos[i * 3 + k] = m.mn[k] + q[i * 3 + k] / 65535 * (m.mx[k] - m.mn[k]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setIndex(new THREE.BufferAttribute(new Uint16Array(buf, m.o + m.v * 6, m.i), 1));
    geo.computeVertexNormals();
    if (m.g !== 'skin') boxUV(geo, m.g === 'cortex' ? 60 : m.g === 'cerebellum' ? 90 : m.g === 'muscle' ? 120 : 220);
    register(new THREE.Mesh(geo, m.g === 'skin' ? skinMat : makeMat(m.g)), m.n, m.g, m.f);
  }
  buildLegs();
  bar.style.width = '100%';
}

// lower-limb + lumbosacral nerves: not modelled in BodyParts3D → schematic tubes on the real skeleton
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const LEGPATHS = {};
function tube(pts, r0, r1) {
  const c = new THREE.CatmullRomCurve3(pts, false, 'centripetal'); const tg = new THREE.TubeGeometry(c, 140, 1, 12, false);
  const p = tg.attributes.position, uv = tg.attributes.uv, d = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { const t = Math.min(uv.getX(i), 1); const pt = c.getPointAt(t); const r = r0 + (r1 - r0) * t; d.set(p.getX(i), p.getY(i), p.getZ(i)).sub(pt).multiplyScalar(r); p.setXYZ(i, pt.x + d.x, pt.y + d.y, pt.z + d.z); }
  tg.computeVertexNormals(); const u = uv.array; for (let i = 0; i < u.length; i += 2) { const a = u[i]; u[i] = u[i + 1]; u[i + 1] = a * 40; }
  return tg;
}
function buildLegs() {
  for (const s of [1, -1]) {
    const L = (x, y, z) => V3(s * x, y, z), side = s > 0 ? 'Left' : 'Right';
    const sci = [L(.018, .965, -.075), L(.04, .925, -.088), L(.068, .875, -.09), L(.088, .8, -.078), L(.092, .68, -.062), L(.088, .56, -.052)];
    const tib = [L(.088, .56, -.052), L(.08, .47, -.048), L(.074, .36, -.045), L(.068, .2, -.04), L(.058, .08, -.03), L(.06, .03, .005), L(.075, .018, .06)];
    const fib = [L(.09, .56, -.052), L(.112, .47, -.042), L(.122, .415, -.02), L(.108, .36, .004), L(.096, .2, .01), L(.088, .07, .02), L(.086, .035, .07)];
    const fem = [L(.022, 1.03, -.035), L(.05, .96, -.01), L(.075, .88, .028), L(.082, .8, .034), L(.068, .66, .015), L(.052, .5, -.012), L(.05, .3, -.012), L(.054, .1, .004)];
    const l5 = [L(.006, 1.0, -.07), L(.02, .99, -.07), L(.03, .96, -.078), L(.04, .925, -.088)];
    const s1 = [L(.006, .975, -.074), L(.016, .955, -.082), L(.03, .935, -.088), L(.04, .925, -.088)];
    for (const [n, pts, r0, r1] of [['sciatic nerve', sci, .0035, .0058], ['tibial nerve', tib, .0042, .0018], ['common fibular nerve', fib, .003, .0014], ['femoral nerve', fem, .0032, .0013], ['lumbosacral root L5', l5, .0018, .0026], ['lumbosacral root S1', s1, .0018, .0024]]) {
      const m = new THREE.Mesh(tube(pts, r0, r1), makeMat('legs')); register(m, `${side} ${n} (schematic)`, 'legs', null);
    }
    LEGPATHS[`leg${side[0]}_S1`] = s1.concat(sci.slice(1), tib.slice(1));
    LEGPATHS[`leg${side[0]}_fib`] = sci.slice(3).concat(fib.slice(1));
  }
}

// ---------------------------------------------------------------- lookup helpers
const re = s => new RegExp(s, 'i');
const find = s => { const r = re(s); return ALL.find(m => r.test(m.userData.lname)); };
function snapTo(mesh, to) { const p = mesh.geometry.attributes.position, v = V3(...to); let best = 1e9, bi = 0;
  for (let i = 0; i < p.count; i += 2) { const d = (p.getX(i) - v.x) ** 2 + (p.getY(i) - v.y) ** 2 + (p.getZ(i) - v.z) ** 2; if (d < best) { best = d; bi = i; } }
  return V3(p.getX(bi), p.getY(bi), p.getZ(bi)); }
function anchor(a) {
  if (Array.isArray(a)) return V3(...a);
  if (a.snap) { const m = find(a.snap); return m ? snapTo(m, a.to) : V3(...a.to); }
  if (a.c) { const m = find(a.c); const v = m ? m.userData.c.clone() : V3(0, 1, 0); v.x += a.dx || 0; v.y += a.dy || 0; v.z += a.dz || 0; return v; }
  if (a.y) { const m = find(a.y); return V3(a.x || 0, m ? m.userData.c.y : 1, a.z || 0); }
  return V3(0, 1, 0);
}
function predicate(w) {
  if (!w) return null;
  if (w.below != null) { const y = typeof w.below === 'number' ? w.below : anchor(w.below).y; return (x, yy) => yy < y; }
  if (w.near) { const c = anchor(w.near), r2 = w.r * w.r; return (x, y, z) => (x - c.x) ** 2 + (y - c.y) ** 2 + (z - c.z) ** 2 < r2; }
  return null;
}
const inG = (m, g) => !g || g.includes(m.userData.g);

// ---------------------------------------------------------------- camera presets & tween
const CAMS = {
  body: [[0, .89, 0], [0.5, 1.2, 3.45]], brainL: [[0, 1.625, -0.012], [0.42, 1.69, 0.13]], brainTop: [[0, 1.63, -0.01], [0.05, 2.05, 0.12]],
  deep: [[0, 1.625, -0.012], [0.26, 1.76, 0.3]], vessels: [[0, 1.6, -0.01], [0.16, 1.44, 0.3]], cranial: [[0, 1.575, 0.0], [0.36, 1.63, 0.3]],
  headFront: [[0, 1.61, 0.0], [0.14, 1.68, 0.36]], faceL: [[0.03, 1.56, 0.0], [0.38, 1.6, 0.16]], tn: [[0.02, 1.59, -0.03], [0.26, 1.575, 0.06]],
  neck: [[0, 1.46, -0.02], [0.3, 1.52, 0.55]], spineBack: [[0, 1.25, -0.06], [-0.4, 1.4, -1.75]], spineLesion: [[0, 1.3, -0.05], [-0.3, 1.36, -0.55]],
  lumbar: [[0.01, 0.97, -0.06], [0.2, 1.05, -0.42]], plexus: [[0.1, 1.38, -0.02], [0.25, 1.45, 0.62]], armL: [[0.22, 1.05, 0.0], [0.5, 1.12, 0.78]],
  handL: [[0.25, 0.9, 0.02], [0.45, 1.04, 0.46]], elbowL: [[0.2, 1.13, -0.03], [0.3, 1.2, -0.42]], humerusL: [[0.19, 1.24, -0.03], [0.42, 1.3, -0.5]],
  legL: [[0.1, 0.42, -0.02], [0.7, 0.55, 0.45]], kneeL: [[0.11, 0.43, -0.03], [0.42, 0.5, 0.2]], legBack: [[0.06, 0.62, -0.06], [0.45, 0.8, -1.35]],
  legs: [[0, 0.5, -0.02], [0.35, 0.65, 1.7]], motor: [[0, 1.2, 0], [0.9, 1.35, 2.2]],
};
let tween = null;
function goCam(k) { const c = CAMS[k] || CAMS.body; const tt = V3(...c[0]), tp = V3(...c[1]);
  const asp = innerWidth / innerHeight; if (asp < 1.2) tp.sub(tt).multiplyScalar(Math.min(3, 1.35 / asp)).add(tt);
  tween = { t: 0, ft: ctl.target.clone(), fp: cam.position.clone(), tt, tp }; }

// ---------------------------------------------------------------- scene state (fx)
const fxRoot = new THREE.Group(); scene.add(fxRoot);
let flows = [], waves = [], spread = null, pulsers = [], motorAnim = null, selected = null;
const glowTex = tex(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
const ringTex = tex(128, 128, (x) => { x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineWidth = 7; x.beginPath(); x.arc(64, 64, 52, 0, Math.PI * 2); x.stroke(); });
function sprite(t, color, size, add = true) { const m = new THREE.SpriteMaterial({ map: t, color: new THREE.Color(color), transparent: true, depthTest: false, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending }); const s = new THREE.Sprite(m); s.scale.setScalar(size); s.renderOrder = 20; return s; }

function clearFx() {
  while (fxRoot.children.length) { const o = fxRoot.children.pop(); o.geometry && o.geometry.dispose(); o.material && o.material.dispose(); }
  flows = []; waves = []; spread = null; pulsers = []; motorAnim = null;
}
function baseState(show, op = {}, dim = false) {
  for (const m of ALL) {
    const ud = m.userData, g = ud.g;
    m.visible = show.includes(g) && !(g === 'deep' && /white matter|septum/.test(ud.lname));
    m.scale.set(1, 1, 1); m.position.set(0, 0, 0);
    if (m.material !== skinMat) {
      const o = op[g] != null ? op[g] : g === 'bone' ? .3 : g === 'artery' ? .9 : g === 'ventricle' ? .85 : 1;
      const mat = m.material; mat.opacity = o; const tr = o < 1; if (mat.transparent !== tr) { mat.transparent = tr; mat.needsUpdate = true; }
      mat.depthWrite = !tr || g === 'ventricle'; mat.emissive.setRGB(0, 0, 0);
      if (ud.dirty || dim || ud.dimmed) resetColor(m, dim && !/bone|skin|muscle/.test(g) ? .5 : 1);
      ud.dimmed = dim; ud.pulse = null;
    }
  }
}
function hl(list) {
  for (const h of list || []) { const r = re(h.m), col = cLin(h.c || 'red'), pr = predicate(h.where);
    for (const m of ALL) if (m.visible !== false && inG(m, h.g) && r.test(m.userData.lname)) { paint(m, col, pr); if (!pr) m.userData.pulse = col; } }
}
function grey(list) {
  const col = cLin('grey');
  for (const h of list || []) { const r = re(h.m), pr = predicate(h.where);
    for (const m of ALL) if (inG(m, h.g) && r.test(m.userData.lname) && !(h.g == null && /bone|skin|cortex|stem|cerebellum|deep|cord/.test(m.userData.g))) paint(m, col, pr); }
}
function scaleAbout(list, dflt) {
  for (const h of list || []) { const r = re(h.m), k = h.k || dflt;
    for (const m of ALL) if (inG(m, h.g) && r.test(m.userData.lname)) { m.scale.setScalar(k); m.position.copy(m.userData.c).multiplyScalar(1 - k); } }
}
function lesion(list) {
  for (const l of list || []) { const p = anchor(l.at), col = COL[l.c || 'red'];
    const core = new THREE.Mesh(new THREE.SphereGeometry(l.r * .45, 20, 14), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .9, depthTest: false }));
    core.position.copy(p); core.renderOrder = 21; fxRoot.add(core);
    const g = sprite(glowTex, col, l.r * 3.2); g.position.copy(p); fxRoot.add(g);
    const ring = sprite(ringTex, col, l.r * 2.4, false); ring.position.copy(p); fxRoot.add(ring); pulsers.push({ s: ring, base: l.r * 2.4 }); }
}
function addFlow(f) {
  const pts = typeof f.path === 'string' ? LEGPATHS[f.path] : f.path.map(anchor);
  if (!pts || pts.length < 2) return;
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal'); const col = COL[f.c || 'amber'];
  const n = 5, dots = [];
  for (let i = 0; i < n; i++) { const s = sprite(glowTex, col, 0.014); fxRoot.add(s); dots.push(s); }
  const len = curve.getLength();
  flows.push({ curve, dots, off: 0, speed: (f.slow ? 0.05 : 0.11) / Math.max(len, .05), block: !!f.block, fade: !!f.fade, col });
  // faint trace
  const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(120));
  const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: .35, depthTest: false })); line.renderOrder = 19; fxRoot.add(line);
}
function addPlaques(kind) {
  const src = kind === 'ms' ? ALL.filter(m => /lateral ventricle/.test(m.userData.lname) || /corpus callosum/.test(m.userData.lname)) :
    kind === 'msCord' ? ALL.filter(m => /spinal cord/.test(m.userData.lname)) : ALL.filter(m => m.userData.g === 'cortex' && /left/.test(m.userData.lname));
  const n = kind === 'cortexL' ? 70 : kind === 'msCord' ? 5 : 16, col = kind === 'cortexL' ? COL.amber : COL.red; seed = 11;
  const geo = new THREE.SphereGeometry(1, 12, 8);
  for (let i = 0; i < n && src.length; i++) {
    const m = src[Math.floor(rnd() * src.length)], p = m.geometry.attributes.position, nn = m.geometry.attributes.normal, k = Math.floor(rnd() * p.count);
    const v = V3(p.getX(k), p.getY(k), p.getZ(k)), nv = V3(nn.getX(k), nn.getY(k), nn.getZ(k));
    const r = kind === 'cortexL' ? .0012 + rnd() * .001 : kind === 'msCord' ? .003 : .0025 + rnd() * .003;
    const s = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: lin(col), emissive: lin(col), emissiveIntensity: .35, roughness: .5, transparent: true, opacity: .92, depthTest: kind !== 'ms' }));
    s.position.copy(v.addScaledVector(nv, kind === 'ms' ? r * .6 : 0)); s.scale.set(r, r * 1.5, r); s.lookAt(s.position.clone().add(nv)); s.renderOrder = 18; fxRoot.add(s);
  }
}
function addWave(w) { const p = anchor(w.at), col = COL[w.c || 'red'];
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .25, depthWrite: false, blending: THREE.AdditiveBlending }));
  m.position.copy(p); m.renderOrder = 17; fxRoot.add(m); waves.push({ m, r: w.r, t: Math.random() }); }

let pathoMicro = false;
function exitPathoMicro() { if (pathoMicro) { MICRO.leave(); pathoMicro = false; ctl.enabled = true; MICRO.ctl.enabled = false; } }
function applyFx(fx, def) {
  clearFx();
  $('#attr').hidden = !!fx.micro;
  if (fx.micro) { pathoMicro = true; ctl.enabled = false; MICRO.ctl.enabled = true; eppT = 0; MICRO.enterPatho(fx.micro); return; }
  exitPathoMicro();
  const show = fx.show || def.show; const op = Object.assign({}, def.op || {}, fx.op || {});
  baseState(show.concat(layerExtra(show)), op, !!fx.dim);
  for (const o of fx.only || []) { const r = re(o.m); for (const m of ALL) if (m.userData.g === o.g && !r.test(m.userData.lname)) m.visible = false; }
  hl(fx.hl); grey(fx.grey); scaleAbout(fx.atrophy, .85); scaleAbout(fx.swell, 1.2); lesion(fx.lesion);
  (fx.flow || []).forEach(addFlow); if (fx.plaques) addPlaques(fx.plaques); if (fx.wave) addWave(fx.wave);
  if (fx.spread) spread = Object.assign({ t0: performance.now(), last: 0 }, fx.spread);
  if (fx.cam) goCam(fx.cam);
  if (selected) markSelected(selected, false), selected = null;
}

// ---------------------------------------------------------------- norm views
const NORM = [
  { id: 'body', ka: 'სრული სხეული', sub: 'ცენტრალური და პერიფერიული სისტემა', cam: 'body', show: ['skin', 'bone', 'cortex', 'cerebellum', 'stem', 'cord', 'cranial', 'spinal', 'legs'],
    txt: 'ცენტრალური ნერვული სისტემა თავის და ზურგის ტვინს მოიცავს; პერიფერიული — 12 წყვილ თავის ტვინის ნერვს, 31 წყვილ ზურგის ტვინის ნერვს, წნულებს და განგლიებს. ზურგის ტვინი ზრდასრულში L1–L2 დონეზე მთავრდება; ქვემოთ ფესვები ცხენის კუდს ქმნის.',
    facts: [['თავის ტვინის ნერვი', '12 წყვილი'], ['ზურგის ტვინის ნერვი', '31 წყვილი (C8 T12 L5 S5 Co1)'], ['ზურგის ტვინის ბოლო', '≈ L1–L2 (conus medullaris)']],
    legend: [['ტვინი', 0xd9ad9c], ['ზურგის ტვინი', 0xeedcc2], ['ნერვები', 0xf0dca6], ['ჩონჩხი', 0xe9dec8]] },
  { id: 'brain', ka: 'თავის ტვინი', sub: 'ხვეულები, ღარები, ნათხემი, ღერო', cam: 'brainL', show: ['cortex', 'cerebellum', 'stem', 'cranial', 'cord'], filter: m => m.userData.g !== 'cranial' || /^(trunk of (left|right) (trigeminal|facial|oculomotor|vagus|accessory|hypoglossal)|(left|right) (optic|trochlear|abducens|vestibulocochlear|glossopharyngeal|olfactory) nerve|optic (chiasm|tract)|(left|right) optic tract)/.test(m.userData.lname),
    txt: 'ქერქის ზედაპირს ხვეულები (gyri) და ღარები (sulci) ქმნის: დაკეცვის გამო ქერქის ≈2/3 ღარებშია დამალული. ცენტრალური ღარი მოტორულ (წინ) და სომატოსენსორულ (უკან) ქერქს ყოფს. დააჭირეთ ნებისმიერ ხვეულს მისი ფუნქციის სანახავად.',
    facts: [['ქერქის სისქე', '≈ 2–4 მმ'], ['ნეირონები (ქერქი)', '≈ 16 მილიარდი'], ['ნათხემი', 'ნეირონების ≈ 80%']],
    legend: [['ქერქი', 0xd9ad9c], ['ნათხემი', 0xc99684], ['ტვინის ღერო', 0xe6cdb8], ['თავის ტვინის ნერვები', 0xf0dca6]] },
  { id: 'lobes', ka: 'წილები და ფუნქციური არეები', sub: 'შუბლის, თხემის, საფეთქლის, კეფის', cam: 'brainL', show: ['cortex', 'cerebellum', 'stem'], lobes: true,
    txt: 'ფერები წილებს აღნიშნავს. შუბლის წილი — მოძრაობა, დაგეგმვა, ქცევა, მეტყველების მოტორიკა; თხემის — სომატოსენსორიკა და სივრცე; საფეთქლის — სმენა, მეხსიერება, მეტყველების გაგება; კეფის — მხედველობა; ლიმბური ქერქი — ემოცია და მეხსიერება.',
    facts: [['ბროკას არე', 'ქვედა შუბლის ხვეული (დომ.)'], ['ვერნიკეს არე', 'ზედა საფეთქლის ხვეულის უკანა ნაწილი'], ['V1', 'კეფის წილი, შპორისებრი ღარი']],
    legend: LOBES.map(l => [l[2], l[1]]).concat([['ნათხემი', 0xc99684]]) },
  { id: 'deep', ka: 'ღრმა სტრუქტურები', sub: 'ბაზალური განგლიები, თალამუსი, პარკუჭები', cam: 'deep', show: ['cortex', 'cerebellum', 'stem', 'deep', 'ventricle'], op: { cortex: .07, cerebellum: .2 }, filter: m => !/white matter|septum/.test(m.userData.lname),
    txt: 'ქერქი გამჭვირვალეა. ბაზალური განგლიები (კუდიანი ბირთვი, ნაჭუჭი, ფერმკრთალი ბირთვი) მოძრაობის ინიციაციას და ამპლიტუდას არეგულირებს; თალამუსი სენსორული ინფორმაციის რელეა ქერქისკენ; ჰიპოკამპი მეხსიერებას აყალიბებს. ცისფრად — ლიქვორით სავსე პარკუჭები.',
    facts: [['სტრიატუმი', 'კუდიანი ბირთვი + ნაჭუჭი'], ['ლენტიკულური ბირთვი', 'ნაჭუჭი + ფერმკრთალი ბირთვი'], ['ლიქვორის მოცულობა', '≈ 150 მლ']],
    legend: [['თალამუსი', 0x7fa7c9], ['კუდიანი ბირთვი', 0x8fbf8a], ['ნაჭუჭი', 0xd6a25e], ['ფერმკრთალი ბირთვი', 0xc98a4a], ['ჰიპოკამპი', 0xc57fb0], ['ნუშისებრი სხეული', 0xd9707a], ['პარკუჭები', 0x6fa9c9]] },
  { id: 'vessels', ka: 'ტვინის არტერიები', sub: 'MCA, ACA, PCA, ვერტებრობაზილარული', cam: 'vessels', show: ['cortex', 'cerebellum', 'stem', 'artery'], op: { cortex: .18, cerebellum: .3 },
    txt: 'წინა ცირკულაცია (შიგნითა საძილე არტერია → წინა და შუა ტვინის არტერიები) და უკანა ცირკულაცია (ხერხემლის → ბაზილარული → უკანა ტვინის არტერიები) ტვინის ფუძეზე უილისის წრით უკავშირდება ერთმანეთს. MCA-ს აუზი ინსულტის ყველაზე ხშირი ლოკალიზაციაა.',
    facts: [['ტვინი სხეულის მასის', '≈ 2%'], ['იღებს გულის წუთმოცულობის', '≈ 15%'], ['ყველაზე ხშირი ინსულტი', 'MCA-ს აუზი']],
    legend: [['არტერიები', 0xc8453c], ['ქერქი (გამჭვირვალე)', 0xd9ad9c]] },
  { id: 'cranial', ka: 'თავის ტვინის ნერვები', sub: 'I–XII წყვილი', cam: 'cranial', show: ['bone', 'stem', 'cerebellum', 'cranial', 'cord'], op: { bone: .16, cerebellum: .6 },
    txt: 'III–XII წყვილი ტვინის ღეროდან გამოდის, I და II ფაქტობრივად ცნს-ის გამონაზარდებია. სამწვერა ნერვი (V) სახის მგრძნობელობას და ღეჭვას უზრუნველყოფს, სახის ნერვი (VII) — მიმიკას, ცთომილი (X) — შინაგანი ორგანოების პარასიმპათიკურ ინერვაციას.',
    facts: [['სენსორული', 'I, II, VIII'], ['მოტორული', 'III, IV, VI, XI, XII'], ['შერეული', 'V, VII, IX, X']],
    legend: [['თავის ტვინის ნერვები', 0xf0dca6], ['ტვინის ღერო', 0xe6cdb8], ['ჩონჩხი', 0xe9dec8]] },
  { id: 'cord', ka: 'ზურგის ტვინი', sub: 'ხერხემლის არხი და ცხენის კუდი', cam: 'spineBack', show: ['bone', 'cortex', 'cerebellum', 'stem', 'cord', 'spinal', 'legs', 'disc'], op: { bone: .22 },
    txt: 'ზურგის ტვინი ხერხემლის არხში გადის და კისრისა და წელის გამსხვილებებს ქმნის (კიდურების ინერვაცია). მალები ტვინზე სწრაფად იზრდება, ამიტომ ქვედა ფესვები ქვემოთ, ცხენის კუდის სახით ეშვება.',
    facts: [['სიგრძე', '≈ 42–45 სმ'], ['კისრის გამსხვილება', 'C5–T1 (მხრის წნული)'], ['წელის გამსხვილება', 'L1–S3 (წელ-გავის წნული)']],
    legend: [['ზურგის ტვინი', 0xeedcc2], ['ნერვები', 0xf0dca6], ['მალთაშუა დისკი', 0xa9c6d6]] },
  { id: 'plexus', ka: 'მხრის წნული და ზედა კიდური', sub: 'ფესვები → ღეროები → კონები → ნერვები', cam: 'plexus', show: ['bone', 'cord', 'spinal', 'muscle'], op: { bone: .22, muscle: .35 }, filter: m => m.userData.g !== 'bone' || !/rib|costal|sternum|skull|mandible|maxilla|hip|sacrum|femur|tibia|fibula|patella|tars|metatars|phalanx of .*toe|calcaneus|talus|navicular|cuboid|cuneiform/.test(m.userData.lname),
    txt: 'მხრის წნული C5–T1 ფესვებიდან იწყება: ფესვები → 3 ღერო → 6 განყოფილება → 3 კონა → ტერმინალური ნერვები. მედიანური, იდაყვის და სხივის ნერვი მტევნის ფუნქციას განსაზღვრავს. მარჯვენა მხარე მარცხენის სარკისებური ასლია (BodyParts3D მხოლოდ მარცხენას შეიცავს).',
    facts: [['მნემონიკა', 'Randy Travis Drinks Cold Beer'], ['უკანა კონა', 'სხივის + იღლიის ნერვი'], ['მედიალური კონა', 'იდაყვის ნერვი']],
    legend: [['ნერვები', 0xf0dca6], ['კუნთები', 0x9a5c52], ['ჩონჩხი', 0xe9dec8]] },
  { id: 'leg', ka: 'ქვედა კიდურის ნერვები', sub: 'საჯდომი, ბარძაყის, წვივის (სქემატური)', cam: 'legs', show: ['bone', 'cord', 'legs', 'muscle', 'disc'], op: { bone: .3, muscle: .3 },
    txt: 'BodyParts3D ქვედა კიდურის ნერვებს არ შეიცავს, ამიტომ ისინი რეალურ ჩონჩხზე სქემატურად არის გავლებული. საჯდომი ნერვი (L4–S3) დუნდულის ქვეშ, ბარძაყის უკანა ზედაპირით ეშვება და მუხლის ზემოთ დიდ და საერთო მცირე წვივის ნერვებად იყოფა.',
    facts: [['საჯდომი ნერვი', 'L4–S3, სხეულის უმსხვილესი ნერვი'], ['ბარძაყის ნერვი', 'L2–L4, მუხლის რეფლექსი'], ['აქილევსის რეფლექსი', 'S1']],
    legend: [['ნერვები (სქემატური)', 0xf0dca6], ['კუნთები', 0x9a5c52], ['ჩონჩხი', 0xe9dec8]] },
  { id: 'motor', ka: 'მოტორული გზა: ქერქიდან კუნთამდე', sub: 'ანიმაცია · კორტიკოსპინური გზა', cam: 'motor', show: ['bone', 'cortex', 'cerebellum', 'stem', 'deep', 'cord', 'spinal', 'muscle'], op: { bone: .12, cortex: .35, cerebellum: .4 }, motor: true,
    txt: 'ზედა მოტორული ნეირონი (მარცხენა წინაცენტრალური ხვეული) → შიგნითა კაფსულა → ტვინის ფეხი → ხიდი → პირამიდები; მოგრძო ტვინში ბოჭკოების ≈ 85–90% მოპირდაპირე მხარეს გადადის → ზურგის ტვინის წინა რქა (ქვედა მოტორული ნეირონი) → მხრის წნული → მედიანური ნერვი → ნერვ-კუნთოვანი სინაფსი (აცეტილქოლინი) → ტენარის კუნთის შეკუმშვა.',
    facts: [['ნეირომედიატორი (NMJ)', 'აცეტილქოლინი, ნიკოტინური რეცეპტორი'], ['გატარების სიჩქარე (Aα)', '≈ 70–120 მ/წმ'], ['ჯვარედინი', 'მოგრძო ტვინი (პირამიდები)']],
    legend: [['იმპულსი', 0xe9a23b], ['კუნთი', 0x9a5c52], ['ნერვები', 0xf0dca6]] },
];
const layers = { skin: false, bone: null, muscle: null, artery: null };
function layerExtra(show) { const ex = []; for (const k in layers) if (layers[k] === true && !show.includes(k)) ex.push(k); return ex; }
function layerHide(g) { return layers[g] === false; }

let mode = 'norm', curView = NORM[0], curNoso = null, curStep = 0;
function showView(v) {
  curView = v; clearFx();
  const show = v.show.filter(g => !layerHide(g)).concat(layerExtra(v.show));
  baseState(show, v.op || {});
  for (const k in layers) if (layers[k] === false) (BYG[k] || []).forEach(m => m.visible = false);
  if (v.filter) for (const m of ALL) if (m.visible && !v.filter(m)) m.visible = false;
  if (v.lobes) for (const m of BYG.cortex) { const h = LOBES.find(([r]) => r.test(m.userData.lname)); if (h) paint(m, lin(h[1])); }
  if (v.motor) startMotor();
  goCam(v.cam); renderLeft(); renderRight(); setLegend(v.legend);
}
function startMotor() {
  addFlow({ path: MOTOR_R, c: 'amber' });
  const musc = ALL.filter(m => /right (abductor pollicis brevis|opponens pollicis)|superficial head of right flexor pollicis/.test(m.userData.lname));
  motorAnim = { musc, t0: performance.now() };
  for (const m of ALL) if (/left (precentral|internal capsule)|^pons|^medulla|peduncle/.test(m.userData.lname)) paint(m, cLin('amber'));
  for (const m of ALL) if (/right median nerve|median nerve to middle finger \(mirrored\)|right (lateral|medial) proper palmar|lateral cord of right|middle trunk of right|superior trunk of right/.test(m.userData.lname)) paint(m, cLin('amber'));
}

// ---------------------------------------------------------------- UI rendering
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function setLegend(items) { $('#legend').innerHTML = (items || []).map(([t, c]) => `<span><i style="background:#${new THREE.Color(c).getHexString()}"></i>${esc(t)}</span>`).join(''); }
const PATHO_LEGEND_MICRO = [['ანტისხეული (IgG)', 0xff4f7a], ['Ca²⁺', 0x4fd6ff], ['ნეირომედიატორი (ACh)', 0xff7a59], ['Na⁺', 0xffcc4d], ['რეცეპტორი', 0x7a8cff]];
const PATHO_LEGEND = [['დაზიანების კერა / დაზიანებული', COL.red], ['ჩართული / რისკის ზონა', COL.amber], ['ფუნქციის დაქვეითება', COL.blue], ['შენარჩუნებული', COL.green], ['დამბლა / ატროფია', 0x8c8f94]];

function renderLeft() {
  const L = $('#leftBody');
  if (mode === 'micro') {
    $('#leftTitle').textContent = 'ნეირონი · უჯრედული დონე';
    L.innerHTML = '<div class="vlist">' + MICRO.steps.map((v, i) => `<button class="vitem" type="button" data-mi="${i}" aria-current="${i === curMicro}"><span class="dot">${i + 1}</span><span><b>${esc(v.t)}</b><small>${esc(v.sub)}</small></span></button>`).join('') + '</div>';
    return;
  }
  if (mode === 'norm') {
    $('#leftTitle').textContent = 'ნორმა · ხედები';
    L.innerHTML = '<div class="vlist">' + NORM.map((v, i) => `<button class="vitem" type="button" data-v="${v.id}" aria-current="${v === curView}"><span class="dot">${i + 1}</span><span><b>${esc(v.ka)}</b><small>${esc(v.sub)}</small></span></button>`).join('') + '</div>' +
      '<div class="layers"><h3>ფენები</h3>' + [['skin', 'კანი'], ['bone', 'ჩონჩხი'], ['muscle', 'კუნთები'], ['artery', 'არტერიები']].map(([k, t]) => `<button class="chip" type="button" data-l="${k}" aria-pressed="${layerOn(k)}">${t}</button>`).join('') + '</div>';
  } else {
    $('#leftTitle').textContent = 'პათოლოგია · ნოზოლოგიები';
    const q = (L.querySelector('#q') || {}).value || '';
    L.innerHTML = `<input class="search" id="q" type="search" placeholder="ძებნა: ინსულტი, G56…" value="${esc(q)}" aria-label="ნოზოლოგიის ძებნა">` + '<div id="nl"></div>';
    renderNosoList(q);
    L.querySelector('#q').addEventListener('input', e => renderNosoList(e.target.value));
  }
}
function renderNosoList(q) {
  q = q.trim().toLowerCase();
  const hit = n => !q || (n.ka + ' ' + n.en + ' ' + n.icd).toLowerCase().includes(q);
  $('#nl').innerHTML = NOSO_GROUPS.map(([g, t]) => { const items = NOSOLOGY.filter(n => n.grp === g && hit(n)); if (!items.length) return '';
    return `<div class="ngrp">${esc(t)}</div>` + items.map(n => `<button class="nitem" type="button" data-n="${n.id}" aria-current="${n === curNoso}"><b>${esc(n.ka)}</b><span class="icd">${esc(n.icd)}</span></button>`).join(''); }).join('') || '<p class="empty">ვერაფერი მოიძებნა.</p>';
}
function layerOn(k) { const v = curView; if (layers[k] != null) return layers[k]; return v.show.includes(k); }

function renderRight() {
  const B = $('#rightBody');
  if (mode === 'micro') {
    const s = MICRO.steps[curMicro], n = MICRO.steps.length, chart = /rest|ap|salt/.test(s.id);
    B.innerHTML = `<div class="card-h"><div class="eyebrow"><span>უჯრედული დონე</span><span>·</span><span>ეტაპი ${curMicro + 1}/${n}</span></div><h1>${esc(s.t)}</h1><div class="en">${esc(s.sub)}</div></div>
      ${chart ? `<div class="sec"><h3 style="display:flex;justify-content:space-between"><span>მემბრანის პოტენციალი</span><span id="vmVal" style="color:#ffa640;font-family:var(--mono);letter-spacing:0;text-transform:none">Vm</span></h3><canvas id="vmChart" style="width:100%;height:120px;display:block"></canvas></div>` : ''}
      <div class="sec"><p>${esc(s.x)}</p><div class="stepnav"><button class="btn" type="button" id="prevM" ${curMicro ? '' : 'disabled'}>← წინა</button><button class="btn primary" type="button" id="nextM">${curMicro < n - 1 ? 'შემდეგი ეტაპი →' : 'თავიდან ↺'}</button></div></div>
      <div class="sec"><h3>მთავარი ფაქტები</h3><dl class="fact">${s.facts.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl></div>
      ${s.pharm.length ? `<div class="sec"><h3>ფარმაკოლოგიური სამიზნე</h3><ul>${s.pharm.map(([d, m]) => `<li><b style="font-weight:600">${esc(d)}</b>: ${esc(m)}</li>`).join('')}</ul></div>` : ''}
      ${s.clin ? `<div class="sec"><h3>კლინიკური კავშირი</h3><p>${esc(s.clin)}</p></div>` : ''}
      ${s.links.length ? `<div class="sec" style="display:flex;flex-wrap:wrap;gap:6px">${s.links.map(([id, t]) => `<button class="chip" type="button" data-link="${id}">${esc(t)} →</button>`).join('')}</div>` : ''}
      <p class="disc">სქემატური ანიმაცია; მასშტაბი პირობითია (ვეზიკულა ≈ 40 ნმ, ნეირონის სხეული ≈ 10–100 მკმ). წყაროები: Kandel, <i>Principles of Neural Science</i>; StatPearls (Physiology, Action Potential; Neuromuscular Junction).</p>`;
    return;
  }
  if (mode === 'norm') {
    const v = curView;
    B.innerHTML = `<div class="card-h"><div class="eyebrow"><span>ნორმა</span><span>·</span><span>ხედი ${NORM.indexOf(v) + 1}/${NORM.length}</span></div><h1>${esc(v.ka)}</h1><div class="en">${esc(v.sub)}</div></div>
      <div class="sec"><p>${esc(v.txt)}</p></div>
      <div class="sec"><h3>მთავარი ფაქტები</h3><dl class="fact">${v.facts.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl></div>
      <div class="sec" id="selBox"><h3>არჩეული სტრუქტურა</h3><p style="color:var(--muted);font-size:12.5px">დააჭირეთ მოდელზე ნებისმიერ სტრუქტურას: ნახავთ ქართულ სახელს, ფუნქციას და FMA კოდს.</p></div>
      <p class="disc">სასწავლო მოდელი. გეომეტრია: BodyParts3D (DBCLS, CC BY 4.0), ზრდასრული მამაკაცის რეფერენსული ანატომია.</p>`;
  } else if (!curNoso) {
    B.innerHTML = `<div class="empty"><b>აირჩიეთ ნოზოლოგია</b>თითოეულ ბარათში: ნოზოლოგია (ICD-10), აღწერა, განვითარების მექანიზმი ეტაპობრივად (მოდელზე ანიმაციით) და კლინიკა.</div>`;
  } else {
    const n = curNoso, s = n.steps[curStep];
    B.innerHTML = `<div class="card-h"><div class="eyebrow"><span class="icd">ICD-10 ${esc(n.icd)}</span><span>${esc(NOSO_GROUPS.find(g => g[0] === n.grp)[1])}</span></div><h1>${esc(n.ka)}</h1><div class="en">${esc(n.en)}</div></div>
      ${isPhone() ? '' : `<div class="sec"><h3>აღწერა</h3><p>${esc(n.desc)}</p></div>`}
      <div class="sec"><h3>განვითარების მექანიზმი</h3>
        <div class="steps" role="tablist">${n.steps.map((st, i) => `<button type="button" role="tab" data-s="${i}" aria-current="${i === curStep}" class="${i < curStep ? 'done' : ''}" title="${esc(st.t)}">${i + 1}</button>`).join('')}</div>
        <div class="stepbox"><h4>${curStep + 1}. ${esc(s.t)}</h4>${s.fx.chart === 'epp' ? `<p class="note" style="margin:0 0 4px">ბოლო ფირფიტის პოტენციალი (EPP) თითოეულ იმპულსზე: მწვანე — კუნთი იკუმშება, წითელი — ზღურბლს ქვემოთ</p><canvas id="eppChart" style="width:100%;height:110px;display:block;margin-bottom:8px"></canvas>` : ''}<p>${esc(s.x)}</p>${s.fx.note ? `<p class="note">${esc(s.fx.note)}</p>` : ''}</div>
        <div class="stepnav"><button class="btn" type="button" id="prevS" ${curStep ? '' : 'disabled'}>← წინა</button><button class="btn primary" type="button" id="nextS">${curStep < n.steps.length - 1 ? 'შემდეგი ეტაპი →' : 'თავიდან ↺'}</button></div>
      </div>
      ${isPhone() ? `<div class="sec"><h3>აღწერა</h3><p>${esc(n.desc)}</p></div>` : ''}
      <div class="sec"><h3>კლინიკა</h3><ul>${n.clin.map(c => `<li>${esc(c)}</li>`).join('')}</ul></div>
      <div class="sec refs"><h3>წყაროები</h3><ul>${n.refs.map(([t, u]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ul></div>
      <div class="sec" id="selBox"></div>
      <p class="disc">სასწავლო მასალა; არ წარმოადგენს კლინიკურ რეკომენდაციას. მექანიზმები შეჯამებულია მიმოხილვითი წყაროებიდან და საჭიროებს ექსპერტის განხილვას.</p>`;
  }
}
function showSelected(m) {
  const box = $('#selBox'); if (!box) return;
  if (!m) { return; }
  const ud = m.userData, k = kaName(ud.name);
  box.innerHTML = `<h3>არჩეული სტრუქტურა</h3><div class="stepbox"><h4>${esc(k.ka)}</h4><p style="color:var(--ink2);font-size:12.5px;margin-bottom:6px">${esc(ud.name.replace(' (mirrored)', ''))}</p>${k.fn ? `<p>${esc(k.fn)}</p>` : ''}
    <dl class="fact" style="margin-top:8px"><dt>ჯგუფი</dt><dd>${esc(GROUP_KA[ud.g] || ud.g)}</dd>${ud.fma ? `<dt>FMA</dt><dd>${esc(ud.fma)}</dd>` : ''}${/mirrored/.test(ud.name) ? '<dt>შენიშვნა</dt><dd>მარცხენა მხარის სარკისებური ასლი</dd>' : ''}${ud.g === 'legs' ? '<dt>შენიშვნა</dt><dd>სქემატური (BodyParts3D-ში არ არის)</dd>' : ''}</dl></div>`;
  if (isPhone()) setCollapsed('#right', false);
}

// ---------------------------------------------------------------- interaction
function setMode(m) {
  if (mode === 'micro' && m !== 'micro') { MICRO.leave(); ctl.enabled = true; }
  if (m !== 'patho') exitPathoMicro();
  mode = m; document.querySelectorAll('.mode button').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === m));
  document.body.dataset.mode = m;
  $('#attr').innerHTML = m === 'micro' ? 'უჯრედული დონე: სქემატური 3D, მასშტაბი პირობითია' : '3D: <a href="https://dbarchive.biosciencedbc.jp/en/bodyparts3d/" target="_blank" rel="noopener">BodyParts3D</a> © DBCLS, CC BY 4.0 · ქვედა კიდურის ნერვები სქემატურია';
  tip.hidden = true; $('#attr').hidden = m === 'micro';
  if (m === 'micro') { ctl.enabled = false; MICRO.ctl.enabled = true; openMicro(curMicro); }
  else if (m === 'norm') showView(curView); else { if (curNoso) openNoso(curNoso, curStep); else { renderLeft(); renderRight(); setLegend(PATHO_LEGEND); clearFx(); baseState(['cortex', 'cerebellum', 'stem', 'cord', 'cranial', 'spinal', 'legs', 'bone', 'skin'], { bone: .15 }); goCam('body'); } }
  try { localStorage.setItem('na-mode', m); } catch (e) {}
}
let curMicro = 0, vmHist = [];
const MICRO_LEGEND = [['Na⁺', 0xffcc4d], ['K⁺', 0xb48cff], ['Ca²⁺', 0x4fd6ff], ['ნეირომედიატორი', 0xff7a59], ['მოქმედების პოტენციალი', 0xffa640]];
function openMicro(i, instant) { curMicro = (i + MICRO.steps.length) % MICRO.steps.length; vmHist = []; MICRO.enter(curMicro, instant); renderLeft(); renderRight(); setLegend(MICRO_LEGEND); if (isPhone()) setCollapsed('#left', true); }
let eppT = 0;
function drawEpp(v) {
  const cv = document.getElementById('eppChart'); if (!cv) return;
  const dpr = Math.min(devicePixelRatio, 2), w = cv.clientWidth, h = cv.clientHeight; if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  const L = 8, B = 20, T = 10, max = 1.5, y = a => T + (1 - a / max) * (h - T - B), bw = (w - L * 2) / v.n;
  g.font = '10px "Noto Sans Georgian",sans-serif';
  v.epp.forEach((a, i) => { g.fillStyle = a >= v.thr ? '#63b57d' : '#e2574c'; g.fillRect(L + i * bw + bw * .2, y(a), bw * .6, y(0) - y(a)); g.fillStyle = '#8a9199'; g.fillText(String(i + 1), L + i * bw + bw * .45, h - 6); });
  g.strokeStyle = '#e6c46e'; g.setLineDash([4, 4]); g.beginPath(); g.moveTo(L, y(v.thr)); g.lineTo(w - L, y(v.thr)); g.stroke(); g.setLineDash([]);
  g.fillStyle = '#e6c46e'; g.fillText('ზღურბლი', w - L - 50, y(v.thr) - 4);
}
function drawVm(v) {
  const cv = document.getElementById('vmChart'); if (!cv) return;
  const dpr = Math.min(devicePixelRatio, 2), w = cv.clientWidth, h = cv.clientHeight; if (cv.width !== w * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  if (v != null) { vmHist.push(v); if (vmHist.length > 240) vmHist.shift(); }
  const L = 34, Rr = 8, Tt = 10, B = 18, y = mv => Tt + (50 - mv) / 140 * (h - Tt - B);
  g.font = '10px "IBM Plex Mono",monospace'; g.fillStyle = '#8a9199'; g.strokeStyle = 'rgba(236,230,218,.12)'; g.lineWidth = 1;
  for (const mv of [40, 0, -55, -70, -90]) { g.beginPath(); g.setLineDash(mv === -55 ? [4, 4] : []); g.moveTo(L, y(mv)); g.lineTo(w - Rr, y(mv)); g.stroke(); g.fillText((mv > 0 ? '+' : '') + mv, 2, y(mv) + 3); }
  g.setLineDash([]); g.fillText('ზღურბლი', L + 4, y(-55) - 4);
  if (vmHist.length > 1) { g.strokeStyle = '#ffa640'; g.lineWidth = 2; g.beginPath(); vmHist.forEach((mv, i) => { const x = L + i / 239 * (w - L - Rr); i ? g.lineTo(x, y(mv)) : g.moveTo(x, y(mv)); }); g.stroke();
    const last = vmHist[vmHist.length - 1]; g.fillStyle = '#ffa640'; g.beginPath(); g.arc(L + (vmHist.length - 1) / 239 * (w - L - Rr), y(last), 3.5, 0, 7); g.fill();
    const o = document.getElementById('vmVal'); if (o) o.textContent = 'Vm ' + (last > 0 ? '+' : '') + Math.round(last) + ' mV'; }
}
function openNoso(n, step = 0) {
  curNoso = n; curStep = step; renderLeft(); renderRight(); setLegend(n.steps[step].fx.micro ? PATHO_LEGEND_MICRO : PATHO_LEGEND);
  applyFx(n.steps[step].fx, n);
  if (isPhone()) setCollapsed('#left', true);
}
function setStep(i) { curStep = (i + curNoso.steps.length) % curNoso.steps.length; renderRight(); applyFx(curNoso.steps[curStep].fx, curNoso); setLegend(curNoso.steps[curStep].fx.micro ? PATHO_LEGEND_MICRO : PATHO_LEGEND); }

document.querySelector('.mode').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setMode(b.dataset.m); });
$('#leftBody').addEventListener('click', e => {
  const v = e.target.closest('[data-v]'); if (v) { showView(NORM.find(x => x.id === v.dataset.v)); if (isPhone()) setCollapsed('#left', true); return; }
  const l = e.target.closest('[data-l]'); if (l) { const k = l.dataset.l; layers[k] = !layerOn(k); showView(curView); return; }
  const n = e.target.closest('[data-n]'); if (n) openNoso(NOSOLOGY.find(x => x.id === n.dataset.n), 0);
  const mi = e.target.closest('[data-mi]'); if (mi) openMicro(+mi.dataset.mi);
});
$('#rightBody').addEventListener('click', e => {
  const s = e.target.closest('[data-s]'); if (s) return setStep(+s.dataset.s);
  if (e.target.id === 'nextS') setStep(curStep + 1);
  if (e.target.id === 'prevS') setStep(curStep - 1);
  if (e.target.id === 'nextM') openMicro(curMicro + 1);
  if (e.target.id === 'prevM') openMicro(curMicro - 1);
  const lk = e.target.closest('[data-link]'); if (lk) { const id = lk.dataset.link, no = NOSOLOGY.find(x => x.id === id), nv = NORM.find(x => x.id === id);
    if (no) { setMode('patho'); openNoso(no, 0); } else if (nv) { setMode('norm'); showView(nv); } }
});
function setCollapsed(sel, on) { const el = $(sel); el.classList.toggle('col', on); const b = el.querySelector('.cbtn'); if (b) { b.textContent = on ? '⌃' : '⌄'; b.setAttribute('aria-expanded', !on); b.setAttribute('aria-label', on ? 'გაშლა' : 'ჩაკეცვა'); } layout(); }
$('#leftC').onclick = () => setCollapsed('#left', !$('#left').classList.contains('col'));
$('#rightC').onclick = () => setCollapsed('#right', !$('#right').classList.contains('col'));
addEventListener('keydown', e => { if (mode === 'micro' && !/INPUT/.test(document.activeElement.tagName)) { if (e.key === 'ArrowRight') openMicro(curMicro + 1); if (e.key === 'ArrowLeft') openMicro(curMicro - 1); } if (mode === 'patho' && curNoso && !/INPUT/.test(document.activeElement.tagName)) { if (e.key === 'ArrowRight') setStep(curStep + 1); if (e.key === 'ArrowLeft') setStep(curStep - 1); } });

const ray = new THREE.Raycaster(), mv = new THREE.Vector2();
function pick(ev) {
  if (mode === 'micro' || pathoMicro) return null;
  const r = R.domElement.getBoundingClientRect(); mv.set((ev.clientX - r.left) / r.width * 2 - 1, -(ev.clientY - r.top) / r.height * 2 + 1);
  ray.setFromCamera(mv, cam);
  const cands = ALL.filter(m => m.visible && m.material !== skinMat && m.material.opacity > .2);
  const hit = ray.intersectObjects(cands, false)[0];
  return hit ? hit.object : null;
}
function markSelected(m, on) { if (!m || m.material === skinMat) return; m.material.emissive.copy(on ? lin(0x6b5a2a) : new THREE.Color(0, 0, 0)); }
let down = null;
R.domElement.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
R.domElement.addEventListener('pointerup', e => {
  if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return;
  const m = pick(e); if (selected) markSelected(selected, false); selected = m; if (m) { markSelected(m, true); showSelected(m); }
});
const tip = $('#tip'); let lastHover = 0;
R.domElement.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || e.buttons) { tip.hidden = true; return; }
  const now = performance.now(); if (now - lastHover < 60) return; lastHover = now;
  const m = pick(e); if (!m) { tip.hidden = true; R.domElement.style.cursor = ''; return; }
  tip.textContent = kaName(m.userData.name).ka; tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; tip.hidden = false; R.domElement.style.cursor = 'pointer';
});
R.domElement.addEventListener('pointerleave', () => tip.hidden = true);

// ---------------------------------------------------------------- loop
const clock = new THREE.Clock(); const tmp = new THREE.Color();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), .05), now = performance.now(), T = now / 1000;
  if (mode === 'micro' || pathoMicro) { const v = MICRO.update(dt); if (typeof v === 'number') drawVm(v); else if (v && v.epp) drawEpp(v); R.render(MICRO.scene, MICRO.cam); return; }
  if (tween) { tween.t = Math.min(1, tween.t + dt / .9); const k = 1 - Math.pow(1 - tween.t, 3);
    ctl.target.lerpVectors(tween.ft, tween.tt, k); cam.position.lerpVectors(tween.fp, tween.tp, k); if (tween.t >= 1) tween = null; }
  ctl.update();
  const pulse = .5 + .5 * Math.sin(T * 3.2);
  for (const m of ALL) if (m.visible && m.userData.pulse && m.material.emissive) m.material.emissive.copy(tmp.copy(m.userData.pulse).multiplyScalar(.12 + .22 * pulse));
  for (const p of pulsers) { const k = 1 + .45 * ((T * 1.2) % 1); p.s.scale.setScalar(p.base * k); p.s.material.opacity = 1 - ((T * 1.2) % 1) * .9; }
  for (const f of flows) {
    f.off = (f.off + dt * f.speed) % 1;
    f.dots.forEach((d, i) => { let t = (f.off + i / f.dots.length) % 1; let a = 1;
      if (f.block) { const tt = t * 1.25; if (tt > 1) { t = 1; a = Math.max(0, 1 - (tt - 1) * 4); } else t = tt; }
      if (f.fade) a *= 1 - t * .85;
      d.position.copy(f.curve.getPointAt(Math.min(t, 1))); d.material.opacity = a; d.scale.setScalar(.004 + .011 * cam.position.distanceTo(d.position)); });
  }
  for (const w of waves) { w.t = (w.t + dt * .45) % 1; w.m.scale.setScalar(.002 + w.r * w.t); w.m.material.opacity = .32 * (1 - w.t); }
  if (spread && now - spread.last > 90) { spread.last = now; const k = Math.min(1, (now - spread.t0) / 1000 / spread.dur); const y = spread.from + (spread.to - spread.from) * k, col = cLin(spread.c);
    for (const m of ALL) if (m.visible && spread.g.includes(m.userData.g)) { resetColor(m, m.userData.dimmed ? .5 : 1); paint(m, m.userData.g === 'muscle' ? cLin('grey') : col, (x, yy) => yy < y); }
    if (k >= 1 && now - spread.t0 > (spread.dur + 2.5) * 1000) spread.t0 = now; }
  if (motorAnim) { const f = flows[0]; const ph = f ? (f.off + .8) % 1 : 0; const c = ph > .93 ? 1 : 0;
    for (const m of motorAnim.musc) { const k = 1 - .1 * c; m.scale.set(k, 1 + .06 * c, k); m.position.copy(m.userData.c).multiply(V3(1 - k, -.06 * c, 1 - k)); m.material.emissive.copy(tmp.set(COL.amber).convertSRGBToLinear().multiplyScalar(.35 * c)); } }
  R.render(scene, cam);
}

// ---------------------------------------------------------------- boot
(async function boot() {
  try { await loadPack(); } catch (e) { $('#loadMsg').textContent = 'მოდელის ჩატვირთვა ვერ მოხერხდა. განაახლეთ გვერდი.'; console.error(e); return; }
  goCam('body'); tween.t = 1; ctl.target.copy(tween.tt); cam.position.copy(tween.tp); tween = null;
  let m0 = 'norm'; try { m0 = localStorage.getItem('na-mode') || 'norm'; } catch (e) {}
  const h = (location.hash || '').slice(1);
  if (h && NOSOLOGY.find(n => n.id === h)) { mode = 'patho'; document.querySelectorAll('.mode button').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === 'patho')); openNoso(NOSOLOGY.find(n => n.id === h)); }
  else if (h && NORM.find(n => n.id === h)) { showView(NORM.find(n => n.id === h)); }
  else if (h === 'neuron' || h === 'micro') setMode('micro');
  else setMode(m0 === 'patho' || m0 === 'micro' ? m0 : 'norm');
  if (isPhone()) { setCollapsed('#left', true); }
  $('#load').classList.add('gone');
  frame();
  window.__atlas = { openMicro, finishMicro: () => MICRO.finish(), finish: () => { if (tween) { ctl.target.copy(tween.tt); cam.position.copy(tween.tp); tween = null; } }, ALL, NOSOLOGY, NORM, openNoso, setStep, showView, setMode, READY: true };
})();
})();
