/* უჯრედული დონე: ნეირონი → მოქმედების პოტენციალი → სინაფსი → ნერვ-კუნთოვანი სინაფსი → სარკომერი.
   სქემატური 3D (მასშტაბი პირობითია). ფაქტები: StatPearls / Kandel, Principles of Neural Science. */
const MICRO_STEPS = [
  { id: 'neuron', t: 'ნეირონი და გლია', sub: 'დენდრიტი → სხეული → აქსონი → ტერმინალი',
    x: 'ნეირონი სიგნალს იღებს დენდრიტებით, აჯამებს სხეულსა და აქსონის ბორცვზე და აქსონით გადასცემს შემდეგ უჯრედს. მიელინს ცნს-ში ოლიგოდენდროციტები ქმნიან (ერთი უჯრედი რამდენიმე აქსონის სეგმენტს ფარავს), პერიფერიაში კი შვანის უჯრედები. ასტროციტები არეგულირებენ იონურ გარემოს, უკუშთანთქავენ გლუტამატს და მონაწილეობენ ჰემატოენცეფალური ბარიერის შექმნაში.',
    facts: [['ნეირონები (ადამიანის ტვინი)', '≈ 86 მილიარდი'], ['სინაფსები', 'ასობით ტრილიონი'], ['მიელინი ცნს / პნს', 'ოლიგოდენდროციტი / შვანის უჯრედი']],
    pharm: [], links: [] },
  { id: 'rest', t: 'მოსვენების პოტენციალი', sub: '≈ −70 mV · Na⁺/K⁺-ATPase',
    x: 'მოსვენებულ მდგომარეობაში მემბრანის შიგნითა მხარე უარყოფითად არის დამუხტული (≈ −70 mV). ამას ძირითადად K⁺-ის გაჟონვის არხები ქმნის. Na⁺/K⁺-ATPase ერთი ATP-ის ხარჯზე 3 Na⁺-ს გარეთ გადაიტანს და 2 K⁺-ს შიგნით, და ასე ინარჩუნებს კონცენტრაციულ გრადიენტებს: K⁺ შიგნით ≈ 140 mM, Na⁺ გარეთ ≈ 145 mM.',
    facts: [['Vm (მოსვენება)', '≈ −70 mV'], ['K⁺ შიგნით / გარეთ', '≈ 140 / 4 mM'], ['Na⁺ შიგნით / გარეთ', '≈ 12 / 145 mM']],
    pharm: [['დიგოქსინი (Digoxin)', 'Na⁺/K⁺-ATPase-ის ინჰიბიცია (კარდიომიოციტში ↑ Ca²⁺ → დადებითი ინოტროპია)']],
    clin: 'ჰიპერკალიემია ამცირებს K⁺-ის გრადიენტს: მემბრანა ნაწილობრივ დეპოლარიზდება, Na⁺ არხები ინაქტივირდება, რაც არითმიის რისკს ქმნის.', links: [] },
  { id: 'ap', t: 'მოქმედების პოტენციალი', sub: 'Na⁺ შემოდის → K⁺ გადის',
    x: 'როცა აქსონის ბორცვზე ზღურბლი (≈ −55 mV) მიიღწევა, ძაბვადამოკიდებული Na⁺ არხები იხსნება. Na⁺ შემოდის და მემბრანა სწრაფად დეპოლარიზდება +30…+40 mV-მდე. შემდეგ Na⁺ არხები ინაქტივირდება, ძაბვადამოკიდებული K⁺ არხებით K⁺ გადის და ვითარდება რეპოლარიზაცია, მოკლე ჰიპერპოლარიზაციით. პოტენციალი „ყველაფერი ან არაფერი" პრინციპით აღიძვრება. რეფრაქტერული პერიოდის გამო იმპულსი მხოლოდ ერთი მიმართულებით ვრცელდება.',
    facts: [['ზღურბლი', '≈ −55 mV'], ['პიკი', '≈ +30…+40 mV'], ['ხანგრძლივობა', '≈ 1–2 ms']],
    pharm: [['ლიდოკაინი (Lidocaine), ბუპივაკაინი (Bupivacaine)', 'ძაბვადამოკიდებული Na⁺ არხების ბლოკადა: ადგილობრივი ანესთეზია (ლიდოკაინი IB კლასის ანტიარითმიული საშუალებაცაა)'], ['ფენიტოინი (Phenytoin), კარბამაზეპინი (Carbamazepine)', 'Na⁺ არხების ინაქტივირებული მდგომარეობის სტაბილიზაცია: ანტიეპილეფსიური ეფექტი'], ['ტეტროდოტოქსინი (TTX)', 'Na⁺ არხის ბლოკი (ფუგუს ტოქსინი)']],
    links: [] },
  { id: 'salt', t: 'სალტატორული გატარება', sub: 'იმპულსი რანვიეს კვანძებზე „ხტება"',
    x: 'მიელინი იზოლატორია, ამიტომ მოქმედების პოტენციალი მხოლოდ რანვიეს კვანძებში აღიძვრება, სადაც Na⁺ არხები კონცენტრირებულია. იმპულსი კვანძიდან კვანძზე „ხტება". ასე გატარება მრავალჯერ ჩქარდება და იონური ტუმბოები ნაკლებ ენერგიას ხარჯავენ.',
    facts: [['Aα (მიელინიანი)', '≈ 70–120 მ/წმ'], ['C (არამიელინიანი)', '≈ 0.5–2 მ/წმ'], ['კვანძებს შორის', '≈ 0.2–2 მმ']],
    pharm: [['დალფამპრიდინი (Dalfampridine, 4-AP)', 'K⁺ არხების ბლოკადა: აუმჯობესებს გატარებას დემიელინიზებულ აქსონში (გაფანტული სკლეროზი, სიარული)']],
    clin: 'დემიელინიზაციისას იმპულსი ნელდება ან ბლოკირდება: ცნს-ში გაფანტული სკლეროზისას, პნს-ში გიენ-ბარეს სინდრომისას.', links: [['ms', 'გაფანტული სკლეროზი'], ['gbs', 'გიენ-ბარეს სინდრომი']] },
  { id: 'ca', t: 'Ca²⁺ შემოსვლა ტერმინალში', sub: 'ძაბვადამოკიდებული Ca²⁺ არხები (P/Q, N)',
    x: 'როცა მოქმედების პოტენციალი პრესინაფსურ ტერმინალს აღწევს, აქტიურ ზონასთან ძაბვადამოკიდებული Ca²⁺ არხები (P/Q და N ტიპი) იხსნება. Ca²⁺ შემოდის: გარეთ მისი კონცენტრაცია ≈ 2 mM-ია, ციტოზოლში ≈ 100 nM, ანუ გრადიენტი დაახლოებით 10 000-ჯერადია. ლოკალური Ca²⁺-ის ზრდა ეგზოციტოზის პირდაპირი სიგნალია.',
    facts: [['Ca²⁺ გარეთ', '≈ 2 mM'], ['Ca²⁺ ციტოზოლში', '≈ 0.1 µM'], ['სინაფსური დაყოვნება', '≈ 0.5 ms']],
    pharm: [['ზიკონოტიდი (Ziconotide)', 'N-ტიპის Ca²⁺ არხის ბლოკადა: ინტრათეკალური ანალგეზია'], ['გაბაპენტინი (Gabapentin), პრეგაბალინი (Pregabalin)', 'Ca²⁺ არხის α2δ ქვეერთეული: ნეიროპათიური ტკივილი']],
    clin: 'ლამბერტ-იტონის მიასთენიური სინდრომი: ანტისხეულები P/Q-ტიპის Ca²⁺ არხების წინააღმდეგ (ხშირად პარანეოპლაზიური, წვრილუჯრედოვანი ფილტვის კიბოსთან). ACh-ის გამოყოფა მცირდება, ძალა კი ხანმოკლე დატვირთვის შემდეგ მატულობს.', links: [] },
  { id: 'exo', t: 'ეგზოციტოზი (SNARE)', sub: 'ვეზიკულა → სინაფსური ნაპრალი',
    x: 'Ca²⁺ სინაპტოტაგმინს უკავშირდება. SNARE კომპლექსი (სინაპტობრევინი/VAMP ვეზიკულაზე, სინტაქსინი და SNAP-25 პლაზმურ მემბრანაზე) ვეზიკულას მემბრანასთან ერწყმის. ნეირომედიატორი სინაფსურ ნაპრალში (≈ 20–40 ნმ) გამოიყოფა. ერთი ვეზიკულა მედიატორის ერთ „კვანტს" შეიცავს.',
    facts: [['ნაპრალის სიგანე', '≈ 20–40 ნმ'], ['ვეზიკულის დიამეტრი', '≈ 40 ნმ'], ['Ca²⁺-ის სენსორი', 'სინაპტოტაგმინი']],
    pharm: [['ბოტულინის ტოქსინი (Botulinum toxin)', 'SNARE ცილების პროტეოლიზი (A ტიპი SNAP-25-ს ჭრის) → ACh-ის გამოყოფის ბლოკი → დუნე დამბლა; თერაპიულად: დისტონია, სპასტიკურობა, შაკიკი'], ['ტეტანუსის ტოქსინი', 'VAMP-ს ჭრის ინჰიბიციურ ინტერნეირონებში → სპასტიკური დამბლა']],
    clin: 'ბოტულიზმი: დაღმავალი დუნე დამბლა, რომელიც კრანიული ნერვებიდან (დიპლოპია, დისფაგია) იწყება.', links: [] },
  { id: 'rec', t: 'რეცეპტორი → პოსტსინაფსური პოტენციალი', sub: 'EPSP / IPSP · სიგნალის შეწყვეტა',
    x: 'მედიატორი ნაპრალს დიფუზიით კვეთს და პოსტსინაფსურ რეცეპტორებს უკავშირდება. იონოტროპული რეცეპტორი (AMPA, nAChR) თავად არის არხი: Na⁺ შემოდის და ჩნდება აღმგზნები პოტენციალი (EPSP). GABA-A რეცეპტორით Cl⁻ შემოდის და ჩნდება შემაკავებელი პოტენციალი (IPSP). მეტაბოტროპული (G-ცილით დაკავშირებული) რეცეპტორის ეფექტი ნელი და მოდულაციურია. სიგნალი წყდება უკუშთანთქმით (SERT, NET, DAT, გლუტამატის ტრანსპორტერები), ფერმენტული დაშლით (AChE, MAO, COMT) და დიფუზიით.',
    facts: [['აღმგზნები მედიატორი', 'გლუტამატი'], ['შემაკავებელი', 'GABA, გლიცინი'], ['სუმაცია', 'სივრცითი და დროითი']],
    pharm: [['ფლუოქსეტინი (Fluoxetine), სერტრალინი (Sertraline)', 'SERT-ის ბლოკადა (SSRI) → ↑ სეროტონინი ნაპრალში'], ['დიაზეპამი (Diazepam) და სხვა ბენზოდიაზეპინები', 'GABA-A რეცეპტორის დადებითი ალოსტერული მოდულაცია → ↑ Cl⁻-ის შემოსვლა'], ['MAO ინჰიბიტორები', 'მონოამინების დაშლის ბლოკი'], ['კოკაინი', 'DAT/NET/SERT-ის ბლოკადა']],
    links: [] },
  { id: 'nmj', t: 'ნერვ-კუნთოვანი სინაფსი → შეკუმშვა', sub: 'ACh → nAChR → Ca²⁺ → აქტინი/მიოზინი',
    x: 'მოტორული ნეირონის ტერმინალი აცეტილქოლინს გამოყოფს. ACh ბოლო ფირფიტის ნიკოტინურ რეცეპტორებს (Nm) უკავშირდება და წარმოიქმნება ბოლო ფირფიტის პოტენციალი, შემდეგ კი კუნთის მოქმედების პოტენციალი. ის T-მილაკებში ვრცელდება (DHP რეცეპტორი), სარკოპლაზმური ბადის რიანოდინის რეცეპტორი (RyR1) კი Ca²⁺-ს გამოყოფს. Ca²⁺ ტროპონინ C-ს უკავშირდება, ტროპომიოზინი იწევს და მიოზინის თავები აქტინთან ჯვარედინ ხიდებს ქმნის. სარკომერი მოკლდება, Z-დისკები ერთმანეთს უახლოვდება. ACh-ს აცეტილქოლინესთერაზა მილიწამებში შლის.',
    facts: [['მედიატორი', 'აცეტილქოლინი'], ['რეცეპტორი', 'ნიკოტინური (Nm)'], ['Ca²⁺-ის წყარო', 'სარკოპლაზმური ბადე (RyR1)']],
    pharm: [['როკურონიუმი (Rocuronium)', 'არადეპოლარიზებელი მიორელაქსანტი: nAChR-ის კონკურენტული ანტაგონისტი'], ['სუქცინილქოლინი (Succinylcholine)', 'დეპოლარიზებელი მიორელაქსანტი: მდგრადი დეპოლარიზაცია → ფასციკულაცია → დამბლა'], ['ნეოსტიგმინი (Neostigmine), პირიდოსტიგმინი (Pyridostigmine)', 'AChE-ის ინჰიბიცია: მიასთენიის მკურნალობა, არადეპოლარიზებელი ბლოკის რევერსია'], ['სუგამადექსი (Sugammadex)', 'როკურონიუმის/ვეკურონიუმის ინკაფსულაცია'], ['დანტროლენი (Dantrolene)', 'RyR1-ის ბლოკადა: ავთვისებიანი ჰიპერთერმია']],
    clin: 'მიასთენია გრავისი: ანტისხეულები AChR-ის (იშვიათად MuSK-ის) წინააღმდეგ. სისუსტე დატვირთვით ძლიერდება, ხშირად პტოზითა და დიპლოპიით იწყება.', links: [['motor', 'მაკრო დონე: მოტორული გზა']] },
];

window.createMicro = function (R) {
  const scene = new THREE.Scene();
  { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d');
    const gr = g.createRadialGradient(256, 230, 20, 256, 256, 400); gr.addColorStop(0, '#2a1d38'); gr.addColorStop(.55, '#120d1c'); gr.addColorStop(1, '#05040a');
    g.fillStyle = gr; g.fillRect(0, 0, 512, 512); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; scene.background = t; }
  scene.fog = new THREE.FogExp2(0x0b0812, 0.012);
  const cam = new THREE.PerspectiveCamera(40, 1, 0.05, 500);
  const ctl = new THREE.OrbitControls(cam, R.domElement); ctl.enableDamping = true; ctl.dampingFactor = .09; ctl.enabled = false; ctl.screenSpacePanning = true;
  scene.add(new THREE.HemisphereLight(0xd9c8ff, 0x1a1020, .55));
  const k1 = new THREE.DirectionalLight(0xffd9b0, 1.0); k1.position.set(20, 30, 25); scene.add(k1);
  const k2 = new THREE.DirectionalLight(0x9db8ff, .5); k2.position.set(-25, 10, -10); scene.add(k2);
  scene.add(cam); cam.add(new THREE.PointLight(0xffffff, .35, 60));

  const lin = h => new THREE.Color(h).convertSRGBToLinear();
  const C = { mem: 0x8a6aa6, memDark: 0x5a4470, myelin: 0xeadfca, glow: 0xffa640, na: 0xffcc4d, k: 0xb48cff, ca: 0x4fd6ff, nt: 0xff7a59, ach: 0xff7a59, rec: 0x7a8cff, recOn: 0x9ef0ff, chNa: 0xf2a33a, chK: 0x9b74e8, pump: 0xd9d4e8, muscle: 0xb0473d, actin: 0x7fd1b9, myosin: 0xe9b86a, mito: 0xd47a3c, astro: 0x6fb7c9, oligo: 0xe0c48c };
  const mat = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: lin(c), roughness: .55, metalness: 0 }, o));
  const glowMat = c => new THREE.MeshBasicMaterial({ color: lin(c), transparent: true, opacity: .9 });
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const spr = (c, s, op = 1) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: c, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending })); m.scale.setScalar(s); return m; };
  function tubeAlong(pts, r0, r1, m, seg = 40) {
    const c = new THREE.CatmullRomCurve3(pts); const g = new THREE.TubeGeometry(c, seg, 1, 10, false);
    const p = g.attributes.position, uv = g.attributes.uv, d = V(0, 0, 0);
    for (let i = 0; i < p.count; i++) { const t = Math.min(uv.getX(i), 1), pt = c.getPointAt(t), r = r0 + (r1 - r0) * t; d.set(p.getX(i), p.getY(i), p.getZ(i)).sub(pt).multiplyScalar(r); p.setXYZ(i, pt.x + d.x, pt.y + d.y, pt.z + d.z); }
    g.computeVertexNormals(); return new THREE.Mesh(g, m);
  }
  function capsule(r, len) { // r128 has no CapsuleGeometry: lathe a stadium profile
    const pts = []; for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + i / 8 * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * r, -len / 2 + Math.sin(a) * r)); }
    for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI / 2; pts.push(new THREE.Vector2(Math.cos(a) * r, len / 2 + Math.sin(a) * r)); }
    pts[0].x = 0.001; pts[pts.length - 1].x = 0.001; return new THREE.LatheGeometry(pts, 20); }
  function blob(r, amp, m, det = 4) { const g = new THREE.IcosahedronGeometry(r, det); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const v = V(p.getX(i), p.getY(i), p.getZ(i)); const n = Math.sin(v.x * 2.1) * Math.cos(v.y * 1.7) * Math.sin(v.z * 2.3); v.multiplyScalar(1 + amp * n); p.setXYZ(i, v.x, v.y, v.z); }
    g.computeVertexNormals(); return new THREE.Mesh(g, m); }

  // ------------------------------------------------------------- 1. neuron (origin)
  const N = new THREE.Group(); scene.add(N);
  const memM = mat(C.mem, { emissive: lin(0x2a1838), roughness: .5 });
  N.add(blob(1.25, .08, memM));
  const dendrite = (dir, len, r, depth) => {
    const p0 = dir.clone().multiplyScalar(1.0), pts = [p0];
    let p = p0.clone(), d = dir.clone();
    for (let i = 0; i < 3; i++) { d.add(V(rnd() - .5, rnd() - .5, rnd() - .5).multiplyScalar(.5)).normalize(); p = p.clone().addScaledVector(d, len / 3); pts.push(p); }
    N.add(tubeAlong(pts, r, r * .35, memM, 24));
    if (depth > 0) for (let b = 0; b < 2; b++) { const nd = d.clone().add(V(rnd() - .5, rnd() - .5, rnd() - .5)).normalize(); const sub = (o) => { const pp = [p.clone()]; let q = p.clone(), dd = nd.clone(); for (let i = 0; i < 3; i++) { dd.add(V(rnd() - .5, rnd() - .5, rnd() - .5).multiplyScalar(.6)).normalize(); q = q.clone().addScaledVector(dd, len * .45 / 3); pp.push(q); } N.add(tubeAlong(pp, r * .35, r * .1, memM, 16)); }; sub(); }
  };
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const dir = V(-0.6 - rnd() * .5, Math.cos(a), Math.sin(a)).normalize(); dendrite(dir, 4.5 + rnd() * 2.5, .32, 1); }
  // axon + hillock + myelin + nodes
  const AX0 = 1.15, AX1 = 26; const axM = mat(0x9c78bd, { emissive: lin(0x2d1840) });
  N.add(tubeAlong([V(AX0 - .3, 0, 0), V(2.4, 0, 0)], .5, .16, axM, 10));
  N.add(tubeAlong([V(2.3, 0, 0), V(14, .15, 0), V(AX1, 0, 0)], .15, .15, axM, 60));
  const NODES = []; const myM = mat(C.myelin, { transparent: true, opacity: .78, roughness: .35, emissive: lin(0x3a3226) });
  for (let x = 2.8; x + 2 < AX1 - .5; x += 2.38) { const s = new THREE.Mesh(capsule(.42, 1.55), myM); s.rotation.z = Math.PI / 2; s.position.set(x + 1, 0, 0); N.add(s); NODES.push(x + 2.19); }
  NODES.unshift(2.4);
  // terminal arbor
  const BOUTONS = [];
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + .4; const end = V(AX1 + 2.2, Math.cos(a) * 1.4, Math.sin(a) * 1.4); N.add(tubeAlong([V(AX1, 0, 0), V(AX1 + 1, Math.cos(a) * .6, Math.sin(a) * .6), end], .12, .08, axM, 12)); const b = new THREE.Mesh(new THREE.SphereGeometry(.3, 16, 12), memM); b.position.copy(end); N.add(b); BOUTONS.push(end); }
  // glia
  const astro = new THREE.Group(); astro.position.set(-4, 4.2, -2.5); N.add(astro);
  const aM = mat(C.astro, { emissive: lin(0x0e2a30) }); astro.add(blob(.55, .12, aM, 3));
  for (let i = 0; i < 12; i++) { const d = V(rnd() - .5, rnd() - .5, rnd() - .5).normalize(); astro.add(tubeAlong([d.clone().multiplyScalar(.4), d.clone().multiplyScalar(1.4).add(V(rnd() - .5, rnd() - .5, rnd() - .5).multiplyScalar(.4)), d.clone().multiplyScalar(2.6 + rnd())], .12, .03, aM, 10)); }
  const oligo = new THREE.Group(); oligo.position.set(9.5, 3.2, .4); N.add(oligo);
  const oM = mat(C.oligo, { emissive: lin(0x2a2210) }); oligo.add(blob(.45, .1, oM, 3));
  for (const x of [5.2, 9.9, 14.6]) oligo.add(tubeAlong([V(0, 0, 0), V((x - 9.5) * .5, -1.2, .3), V(x - 9.5, -2.8, 0)], .09, .05, oM, 12));
  // background network (ghost neurons)
  const ghost = mat(0x6a5288, { transparent: true, opacity: .16, emissive: lin(0x1b1028), depthWrite: false });
  for (let k = 0; k < 7; k++) { const g = new THREE.Group(); g.position.set(-14 + rnd() * 44, (rnd() - .5) * 26, -14 - rnd() * 16); g.add(blob(.9, .1, ghost, 2));
    for (let i = 0; i < 6; i++) { const d = V(rnd() - .5, rnd() - .5, rnd() - .5).normalize(); g.add(tubeAlong([V(0, 0, 0), d.clone().multiplyScalar(3).add(V(rnd(), rnd(), rnd())), d.clone().multiplyScalar(7)], .18, .05, ghost, 10)); } N.add(g); }
  const apGlow = spr(lin(C.glow), 1.6); apGlow.visible = false; N.add(apGlow);
  const nodeFlash = NODES.map(x => { const s = spr(lin(C.glow), .9, 0); s.position.set(x, 0, 0); N.add(s); return s; });

  // ------------------------------------------------------------- 2–3. membrane patch (0,-40,0)
  const MB = new THREE.Group(); MB.position.set(0, -40, 0); scene.add(MB);
  const W = 16, D = 9;
  { const headG = new THREE.SphereGeometry(.2, 8, 6); const hM = mat(0xcfa0c8, { emissive: lin(0x2a1428) });
    const cnt = Math.floor(W / .48) * Math.floor(D / .48); const ih = new THREE.InstancedMesh(headG, hM, cnt * 2); let n = 0; const m4 = new THREE.Matrix4();
    for (let x = -W / 2; x < W / 2 - .2; x += .48) for (let z = -D / 2; z < D / 2 - .2; z += .48) { if (Math.abs(x + 6.5) < .9 && Math.abs(z) < .9) continue; let skip = false; for (const cx of [-3, 0, 2.6, -1.4, 5]) if (Math.abs(x - cx) < .55 && Math.abs(z) < .55) skip = true; if (skip) continue; m4.makeTranslation(x, .55, z); ih.setMatrixAt(n++, m4); m4.makeTranslation(x, -.55, z); ih.setMatrixAt(n++, m4); }
    ih.count = n; MB.add(ih);
    const core = new THREE.Mesh(new THREE.BoxGeometry(W, .9, D), mat(0xe8c97a, { transparent: true, opacity: .28, depthWrite: false })); MB.add(core); }
  const channel = (x, col) => { const g = new THREE.Group(); g.position.set(x, 0, 0); const m = mat(col, { emissive: lin(col).multiplyScalar(.15) });
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2; const c = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, 1.9, 10), m); c.position.set(Math.cos(a) * .3, 0, Math.sin(a) * .3); g.add(c); }
    MB.add(g); return { g, m, col, x }; };
  const NA_CH = [channel(-3, C.chNa), channel(0, C.chNa)], K_CH = [channel(2.6, C.chK), channel(-1.4, C.chK)], LEAK = channel(5, C.chK);
  const pump = new THREE.Mesh(capsule(.75, 1.2), mat(C.pump, { emissive: lin(0x222030) })); pump.position.set(-6.5, 0, 0); MB.add(pump);
  const IONS = [];
  const ion = (type, inside) => { const s = spr(lin(type === 'na' ? C.na : C.k), .5); const p = V((rnd() - .5) * (W - 1), inside ? -1.3 - rnd() * 3 : 1.3 + rnd() * 3, (rnd() - .5) * (D - 1)); s.position.copy(p); MB.add(s); const o = { s, type, home: p.clone(), inside, path: null, t0: 0 }; IONS.push(o); return o; };
  for (let i = 0; i < 46; i++) ion('na', false); for (let i = 0; i < 8; i++) ion('na', true);
  for (let i = 0; i < 40; i++) ion('k', true); for (let i = 0; i < 6; i++) ion('k', false);
  const lblOut = V(0, -40 + 4.6, 0), lblIn = V(0, -40 - 4.6, 0);

  // ------------------------------------------------------------- 5–7. synapse (60,0,0)
  const SY = new THREE.Group(); SY.position.set(60, 0, 0); scene.add(SY);
  const preM = mat(0x8e6cc0, { transparent: true, opacity: .42, side: THREE.DoubleSide, emissive: lin(0x23123a), depthWrite: false });
  const prof = [V(.75, 10, 0), V(.8, 7.5, 0), V(1.6, 6, 0), V(2.9, 4.4, 0), V(3.2, 2.8, 0), V(2.8, 1.3, 0), V(1.8, .75, 0), V(0.01, .7, 0)].map(v => new THREE.Vector2(v.x, v.y));
  const pre = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), preM); SY.add(pre);
  const postProf = [V(0.01, -.1, 0), V(2, -.1, 0), V(3.1, -.6, 0), V(3.0, -2.2, 0), V(1.6, -3.6, 0), V(.9, -5, 0), V(.9, -9, 0)].map(v => new THREE.Vector2(v.x, v.y));
  const postM = mat(0x6c78c8, { transparent: true, opacity: .5, side: THREE.DoubleSide, emissive: lin(0x121a3a), depthWrite: false });
  SY.add(new THREE.Mesh(new THREE.LatheGeometry(postProf, 48), postM));
  const PSD = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, .12, 40), mat(0x34306a, { emissive: lin(0x15123a) })); PSD.position.y = -.17; SY.add(PSD);
  for (const [x, y, z, r] of [[-1.2, 4.6, .4, .3], [1.3, 3.9, -.8, .28]]) { const m = new THREE.Mesh(capsule(r, 1.3), mat(C.mito, { emissive: lin(0x3a1808) })); m.position.set(x, y, z); m.rotation.z = 1.1; SY.add(m); }
  const vesM = mat(0xffb3c8, { transparent: true, opacity: .55, emissive: lin(0x5a2034), roughness: .3 });
  const VES = [];
  for (let i = 0; i < 30; i++) { const a = rnd() * Math.PI * 2, r = rnd() * 2.1; const v = new THREE.Mesh(new THREE.SphereGeometry(.3, 16, 12), vesM); v.position.set(Math.cos(a) * r, 2.0 + rnd() * 3, Math.sin(a) * r); const core = spr(lin(C.nt), .45, .8); v.add(core); SY.add(v); VES.push({ m: v, home: v.position.clone(), docked: false }); }
  const DOCK = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const v = new THREE.Mesh(new THREE.SphereGeometry(.3, 16, 12), vesM.clone()); const p = V(Math.cos(a) * 1.0, 1.08, Math.sin(a) * 1.0); v.position.copy(p); v.add(spr(lin(C.nt), .45, .8)); SY.add(v); DOCK.push({ m: v, home: p }); }
  const CA_CH = []; for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + .2; const c = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .55, 10), mat(C.ca, { emissive: lin(C.ca).multiplyScalar(.1) })); c.position.set(Math.cos(a) * 1.9, .85, Math.sin(a) * 1.9); c.rotation.z = Math.cos(a) * .4; c.rotation.x = -Math.sin(a) * .4; SY.add(c); CA_CH.push(c); }
  const RECS = []; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + rnd() * .3, r = .5 + rnd() * 1.4; const c = new THREE.Mesh(new THREE.CylinderGeometry(.17, .2, .55, 10), mat(C.rec, { emissive: lin(0x101a50) })); c.position.set(Math.cos(a) * r, .1, Math.sin(a) * r); SY.add(c); RECS.push(c); }
  const TRANS = []; for (const a of [.9, 2.6, 4.3]) { const c = new THREE.Mesh(new THREE.BoxGeometry(.4, .5, .4), mat(0x63c48a, { emissive: lin(0x0e3020) })); c.position.set(Math.cos(a) * 2.75, 1.25, Math.sin(a) * 2.75); SY.add(c); TRANS.push(c); }
  const CA = []; for (let i = 0; i < 26; i++) { const s = spr(lin(C.ca), .35); const a = rnd() * Math.PI * 2; const p = V(Math.cos(a) * (3.4 + rnd() * 2), -.1 + rnd() * 2.2, Math.sin(a) * (3.4 + rnd() * 2)); s.position.copy(p); SY.add(s); CA.push({ s, home: p, ch: CA_CH[i % CA_CH.length] }); }
  const NT = []; for (let i = 0; i < 60; i++) { const s = spr(lin(C.nt), .3); s.visible = false; SY.add(s); NT.push({ s, d: DOCK[i % 6], rec: RECS[i % 12], tr: TRANS[i % 3], j: V(rnd() - .5, rnd() - .5, rnd() - .5) }); }
  const NAIN = []; for (let i = 0; i < 24; i++) { const s = spr(lin(C.na), .3); s.visible = false; SY.add(s); NAIN.push({ s, rec: RECS[i % 12], o: rnd() }); }
  const synAP = spr(lin(C.glow), 1.6); synAP.visible = false; SY.add(synAP);
  const epsp = spr(lin(0x9ef0ff), 1.8); epsp.visible = false; SY.add(epsp);

  // ------------------------------------------------------------- 8. NMJ + sarcomere (120,0,0)
  const NM = new THREE.Group(); NM.position.set(120, 0, 0); scene.add(NM);
  const stripe = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 16; const x = c.getContext('2d'); for (let i = 0; i < 256; i++) { const v = Math.sin(i / 256 * Math.PI * 2 * 16) > 0 ? 200 : 120; x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(i, 0, 1, 16); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); return t; })();
  const fiberM = mat(C.muscle, { map: stripe, emissive: lin(0x2a0806), roughness: .6 });
  const fiber = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 24, 48, 1, false), fiberM); fiber.rotation.z = Math.PI / 2; fiber.position.y = -3.4; NM.add(fiber);
  const fiberWave = new THREE.Mesh(new THREE.CylinderGeometry(3.28, 3.28, 1.2, 48, 1, true), new THREE.MeshBasicMaterial({ color: lin(C.glow), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); fiberWave.rotation.z = Math.PI / 2; fiberWave.position.y = -3.4; NM.add(fiberWave);
  const fiberWave2 = fiberWave.clone(); fiberWave2.material = fiberWave.material.clone(); NM.add(fiberWave2);
  NM.add(tubeAlong([V(-2, 9, 0), V(-1, 4.5, 0), V(0, 1.2, 0)], .22, .2, axM, 20));
  for (let y = 8.2; y > 2.8; y -= 1.9) { const s = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, 1.5, 16), myM); s.position.set(-1.6 + (8.2 - y) * .22, y, 0); s.rotation.z = .2; NM.add(s); }
  const NMB = []; for (const [x, z] of [[-1.3, .4], [0, -.2], [1.3, .3], [.4, 1.1], [-.6, -1.1]]) { NM.add(tubeAlong([V(0, 1.2, 0), V(x * .6, .6, z * .6), V(x, .1, z)], .12, .1, axM, 8)); const b = new THREE.Mesh(new THREE.SphereGeometry(.42, 16, 12), memM); b.scale.set(1, .55, 1); b.position.set(x, .05, z); NM.add(b); NMB.push(b.position.clone()); }
  const ACH = []; for (let i = 0; i < 30; i++) { const s = spr(lin(C.ach), .3); s.visible = false; NM.add(s); ACH.push({ s, b: NMB[i % NMB.length], j: V(rnd() - .5, 0, rnd() - .5) }); }
  const nmjAP = spr(lin(C.glow), 1.5); nmjAP.visible = false; NM.add(nmjAP);
  // sarcomere inset
  const SR = new THREE.Group(); SR.position.set(0, -13.5, 0); NM.add(SR);
  const zM = mat(0xd9d4e8, { emissive: lin(0x202030) }); const ZL = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, .14, 32), zM), ZR = ZL.clone(); ZL.rotation.z = ZR.rotation.z = Math.PI / 2; SR.add(ZL, ZR);
  const aM2 = mat(C.actin, { emissive: lin(0x0d2a22) }), mM = mat(C.myosin, { emissive: lin(0x2a1c06) });
  const hex = [[0, 0], [1, 0], [-1, 0], [.5, .87], [-.5, .87], [.5, -.87], [-.5, -.87]];
  const ACT_L = [], ACT_R = [];
  for (const [a, b] of hex) { const y = a * 1.05, z = b * 1.05;
    const my = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, 4.6, 10), mM); my.rotation.z = Math.PI / 2; my.position.set(0, y, z); SR.add(my);
    for (let k = -2; k <= 2; k++) { if (k === 0) continue; const h = new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6), mM); h.position.set(k * .9, y + .18, z); SR.add(h); const h2 = h.clone(); h2.position.y = y - .18; SR.add(h2); }
    for (const [dy, dz] of [[.5, .3], [-.5, -.3]]) { const al = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 3.2, 6), aM2); al.rotation.z = Math.PI / 2; al.position.set(0, y + dy * .55, z + dz * .55); SR.add(al); ACT_L.push(al); const ar = al.clone(); SR.add(ar); ACT_R.push(ar); } }
  const SRCA = []; for (let i = 0; i < 30; i++) { const s = spr(lin(C.ca), .25); s.position.set((rnd() - .5) * 8, (rnd() - .5) * 3.6, (rnd() - .5) * 3.6); s.visible = false; SR.add(s); SRCA.push(s); }

  // ------------------------------------------------------------- labels
  const labelLayer = document.createElement('div'); labelLayer.id = 'mlabels'; labelLayer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2'; document.body.appendChild(labelLayer);
  const LBL = {
    neuron: [['დენდრიტები', V(-5.5, 3.6, 2)], ['სხეული (სომა)', V(0, -1.9, 0)], ['აქსონის ბორცვი', V(2, -.9, 0)], ['მიელინი', V(7.4, -.9, 0)], ['რანვიეს კვანძი', V(12.3, .9, 0)], ['აქსონის ტერმინალი', V(28.5, -2, 0)], ['ასტროციტი', V(-4, 6, -2.5)], ['ოლიგოდენდროციტი', V(9.5, 4.4, .4)]],
    rest: [['უჯრედგარე სივრცე (+)', lblOut], ['ციტოპლაზმა (−)', lblIn], ['Na⁺/K⁺-ATPase', V(-6.5, -38.2, 0)], ['K⁺ გაჟონვის არხი', V(5, -38.5, 0)], ['Na⁺ არხები (დახურული)', V(-1.5, -38.5, 0)]],
    ap: [['უჯრედგარე სივრცე', lblOut], ['ციტოპლაზმა', lblIn], ['ძაბვადამოკიდ. Na⁺ არხი', V(-3, -38.4, 0)], ['ძაბვადამოკიდ. K⁺ არხი', V(2.6, -38.4, 0)]],
    salt: [['რანვიეს კვანძი', V(7.15, .9, 0)], ['მიელინის სეგმენტი', V(9.5, -.9, 0)], ['მოქმედების პოტენციალი', V(14, 1.6, 0)]],
    ca: [['პრესინაფსური ტერმინალი', V(63.6, 6, 0)], ['Ca²⁺ არხები', V(62.2, .9, 0)], ['Ca²⁺', V(65, 1.6, 0)], ['სინაფსური ვეზიკულები', V(57.5, 3.4, 0)], ['მიტოქონდრია', V(58.6, 5, .4)]],
    exo: [['SNARE / აქტიური ზონა', V(60, .95, 1.4)], ['სინაფსური ნაპრალი', V(63.6, .35, 0)], ['ნეირომედიატორი', V(61, .3, 1.6)]],
    rec: [['პოსტსინაფსური რეცეპტორები', V(62.6, -.3, 1.2)], ['Na⁺ შემოსვლა → EPSP', V(61, -3, 0)], ['უკუშთანთქმის ტრანსპორტერი', V(63.4, 1.9, 1.2)], ['დენდრიტული „ეკალი"', V(60, -6.5, 0)]],
    nmj: [['მოტორული აქსონი', V(118.5, 6.5, 0)], ['ბოლო ფირფიტა (nAChR)', V(121.6, .6, 1)], ['კუნთის ბოჭკო', V(128, -3.4, 3.2)], ['სარკომერი: Z-დისკი', V(116.6, -11.6, 0)], ['აქტინი', V(121.5, -13.1, 1.1)], ['მიოზინი', V(120, -14.9, 0)]],
  };
  const lblEls = [];
  function setLabels(list) { labelLayer.innerHTML = ''; lblEls.length = 0;
    for (const [t, p] of list || []) { const d = document.createElement('div'); d.textContent = t; d.style.cssText = 'position:absolute;transform:translate(-50%,-50%);font:500 11.5px "Noto Sans Georgian",system-ui,sans-serif;color:#ece6da;background:rgba(10,8,16,.62);border:1px solid rgba(236,230,218,.18);border-radius:6px;padding:2px 7px;white-space:nowrap'; labelLayer.appendChild(d); lblEls.push([d, p]); } }
  const tmpV = V(0, 0, 0);
  function placeLabels() { const w = innerWidth, h = innerHeight;
    for (const [d, p] of lblEls) { tmpV.copy(p).project(cam); const vis = tmpV.z < 1 && Math.abs(tmpV.x) < 1.05 && Math.abs(tmpV.y) < 1.05; d.style.display = vis ? '' : 'none'; if (vis) { d.style.left = (tmpV.x * .5 + .5) * w + 'px'; d.style.top = (-tmpV.y * .5 + .5) * h + 'px'; } } }

  // ------------------------------------------------------------- camera presets
  const CAMS = { neuron: [[10, 0, 0], [6, 12, 58]], rest: [[0, -40, 0], [0, -34, 21]], ap: [[0, -40, 0], [4, -34.5, 19]], salt: [[12.5, 0, 0], [12.5, 4, 17]],
    ca: [[60, 2.8, 0], [60, 4.6, 14]], exo: [[60, 1.4, 0], [61, 3.2, 13.5]], rec: [[60, -1, 0], [62, 1.2, 15]], nmj: [[120, -6, 0], [134, 0, 30]] };
  let tween = null;
  function go(k) { const c = CAMS[k]; const tt = V(...c[0]), tp = V(...c[1]); const asp = innerWidth / innerHeight; if (asp < 1.2) tp.sub(tt).multiplyScalar(Math.min(2.4, 1.3 / asp)).add(tt); tween = { t: 0, ft: ctl.target.clone(), fp: cam.position.clone(), tt, tp }; }
  function snap(k) { go(k); ctl.target.copy(tween.tt); cam.position.copy(tween.tp); tween = null; }

  // ------------------------------------------------------------- membrane-potential trace (ms → mV)
  const sm = (a, b, t) => { t = Math.min(1, Math.max(0, t)); t = t * t * (3 - 2 * t); return a + (b - a) * t; };
  function Vm(t) { // one action potential, t in ms over a 6 ms window
    if (t < 1) return -70; if (t < 1.5) return sm(-70, -55, (t - 1) / .5); if (t < 2.0) return sm(-55, 35, (t - 1.5) / .5);
    if (t < 3.1) return sm(35, -80, (t - 2.0) / 1.1); if (t < 5) return sm(-80, -70, (t - 3.1) / 1.9); return -70; }

  // ------------------------------------------------------------- per-step animation
  let step = 0, T = 0;
  const lerpV = (a, b, t) => a.clone().lerp(b, Math.min(1, Math.max(0, t)));
  function resetDynamic() {
    apGlow.visible = false; nodeFlash.forEach(s => s.material.opacity = 0);
    for (const o of IONS) { o.s.position.copy(o.home); o.path = null; o.s.visible = true; }
    for (const c of [...NA_CH, ...K_CH]) c.m.emissive.copy(lin(c.col).multiplyScalar(.15));
    synAP.visible = epsp.visible = false; NT.forEach(n => n.s.visible = false); NAIN.forEach(n => n.s.visible = false);
    DOCK.forEach(d => { d.m.position.copy(d.home); d.m.scale.setScalar(1); d.m.visible = true; }); CA.forEach(c => c.s.position.copy(c.home));
    CA_CH.forEach(c => c.material.emissive.copy(lin(C.ca).multiplyScalar(.1))); RECS.forEach(r => r.material.emissive.copy(lin(0x101a50)));
    ACH.forEach(a => a.s.visible = false); nmjAP.visible = false; fiberWave.material.opacity = fiberWave2.material.opacity = 0; SRCA.forEach(s => s.visible = false);
  }
  const jitter = (o, k) => { o.s.position.x = o.home.x + Math.sin(T * 1.3 + o.home.z * 3) * k; o.s.position.y = o.home.y + Math.cos(T * 1.1 + o.home.x * 2) * k; };
  const ANIM = {
    neuron(t) { // a single AP running soma → terminal every 4 s
      const p = (t % 4) / 2.6; apGlow.visible = p <= 1; if (p <= 1) apGlow.position.set(sm(1, AX1 + 2, p), 0, 0); apGlow.scale.setScalar(1.4 + .3 * Math.sin(t * 20));
      return null; },
    rest(t) { // pump cycle: 3 Na⁺ out, 2 K⁺ in; K⁺ leaks out slowly
      const cyc = (t % 3) / 3; const nas = IONS.filter(o => o.type === 'na' && o.inside).slice(0, 3), ks = IONS.filter(o => o.type === 'k' && !o.inside).slice(0, 2);
      nas.forEach((o, i) => { const k = (cyc * 3 - i * .15); o.s.position.copy(k < .5 ? lerpV(o.home, V(-6.5, -1.2, 0), k * 2) : lerpV(V(-6.5, -1.2, 0), V(-6.5 + (i - 1), 2.2 + i * .4, (i - 1) * .7), (k - .5) * 2)); });
      ks.forEach((o, i) => { const k = (cyc * 3 - .4 - i * .15); o.s.position.copy(k < .5 ? lerpV(o.home, V(-6.5, 1.2, 0), k * 2) : lerpV(V(-6.5, 1.2, 0), V(-6.5 + i, -2.4, i * .6), (k - .5) * 2)); });
      pump.scale.set(1, 1 + .06 * Math.sin(t * 6), 1);
      const lk = IONS.filter(o => o.type === 'k' && o.inside)[0]; const lc = (t % 4) / 4; lk.s.position.copy(lc < .5 ? lerpV(lk.home, V(5, -1, 0), lc * 2) : lerpV(V(5, -1, 0), V(5.6, 2.6, .4), (lc - .5) * 2));
      IONS.forEach(o => { if (!nas.includes(o) && !ks.includes(o) && o !== lk) jitter(o, .12); });
      return -70 + Math.sin(t * 3) * .4; },
    ap(t) { const P = 5, tt = t % P, ms = tt / P * 6; const v = Vm(ms);
      const naOpen = ms > 1.4 && ms < 2.2, kOpen = ms > 2.0 && ms < 3.6;
      NA_CH.forEach(c => c.m.emissive.copy(lin(c.col).multiplyScalar(naOpen ? .9 : .12))); K_CH.forEach(c => c.m.emissive.copy(lin(c.col).multiplyScalar(kOpen ? .9 : .12)));
      const naOut = IONS.filter(o => o.type === 'na' && !o.inside), kIn = IONS.filter(o => o.type === 'k' && o.inside);
      naOut.slice(0, 14).forEach((o, i) => { const ch = NA_CH[i % 2]; const k = (ms - 1.45 - (i % 7) * .05) / .6; const mid = V(ch.x, 0, 0), end = V(ch.x + (i % 5 - 2) * .6, -2.2 - (i % 3) * .6, (i % 4 - 1.5) * .7); o.s.position.copy(k <= 0 ? o.home : k < .5 ? lerpV(o.home, mid, k * 2) : lerpV(mid, end, (k - .5) * 2)); });
      kIn.slice(0, 12).forEach((o, i) => { const ch = K_CH[i % 2]; const k = (ms - 2.1 - (i % 6) * .08) / .8; const mid = V(ch.x, 0, 0), end = V(ch.x + (i % 5 - 2) * .6, 2.3 + (i % 3) * .6, (i % 4 - 1.5) * .7); o.s.position.copy(k <= 0 ? o.home : k < .5 ? lerpV(o.home, mid, k * 2) : lerpV(mid, end, (k - .5) * 2)); });
      IONS.forEach((o, i) => { if (!naOut.slice(0, 14).includes(o) && !kIn.slice(0, 12).includes(o)) jitter(o, .1); });
      return v; },
    salt(t) { const per = .22, n = NODES.length, cyc = (t % (n * per + 1.2)) / per; const idx = Math.floor(cyc);
      nodeFlash.forEach((s, i) => { const d = cyc - i; s.material.opacity = d >= 0 && d < 1.6 ? Math.max(0, 1 - d / 1.6) : 0; s.scale.setScalar(1.1); });
      apGlow.visible = idx < n; if (idx < n) { apGlow.position.set(NODES[idx], 0, 0); apGlow.scale.setScalar(1.2); }
      return Vm(((t % 1.6) / 1.6) * 6); },
    ca(t) { const P = 3.2, k = (t % P) / P; synAP.visible = k < .45; synAP.position.set(0, sm(10, 1.6, k / .45), 0);
      const open = k > .4 && k < .85; CA_CH.forEach(c => c.material.emissive.copy(lin(C.ca).multiplyScalar(open ? 1 : .1)));
      CA.forEach((c, i) => { const q = (k - .42 - (i % 5) * .03) / .3; const tgt = c.ch.position.clone().multiplyScalar(.45).setY(1.3 + (i % 3) * .2); c.s.position.copy(q <= 0 ? c.home : q < .5 ? lerpV(c.home, c.ch.position, q * 2) : lerpV(c.ch.position, tgt, (q - .5) * 2)); });
      return null; },
    exo(t) { const P = 4, k = (t % P) / P;
      CA.forEach(c => c.s.position.copy(c.ch.position.clone().multiplyScalar(.45).setY(1.35)));
      DOCK.forEach((d, i) => { const q = (k - .1 - i * .02) / .25; d.m.position.copy(lerpV(d.home, d.home.clone().setY(.78), q)); d.m.scale.setScalar(q > 1 ? Math.max(0, 1 - (q - 1) * 3) : 1); });
      NT.forEach((n, i) => { const q = (k - .38 - (i % 10) * .006) / .45; n.s.visible = q > 0; if (q > 0) { const p0 = n.d.home.clone().setY(.68); const spread = n.j.clone().multiplyScalar(3.2 * Math.min(1, q)); n.s.position.set(p0.x + spread.x, sm(.68, .32, q), p0.z + spread.z); n.s.material.opacity = 1 - Math.max(0, q - .8) * 4; } });
      return null; },
    rec(t) { const P = 5, k = (t % P) / P;
      NT.forEach((n, i) => { const p0 = n.d.home.clone().setY(.4).add(n.j.clone().multiplyScalar(1.2)); const q1 = (k - (i % 10) * .01) / .3, q2 = (k - .55 - (i % 10) * .01) / .3;
        n.s.visible = true; n.s.material.opacity = 1;
        if (q2 > 0) n.s.position.copy(lerpV(n.rec.position.clone().setY(.42), n.tr.position, q2)); else n.s.position.copy(lerpV(p0, n.rec.position.clone().setY(.42), q1)); if (q2 > 1) n.s.visible = false; });
      const bound = k > .28 && k < .6; RECS.forEach(r => r.material.emissive.copy(lin(bound ? C.recOn : 0x101a50).multiplyScalar(bound ? .8 : 1)));
      NAIN.forEach(n => { const q = ((k - .3) / .3 + n.o * .4); n.s.visible = q > 0 && q < 1; if (n.s.visible) n.s.position.copy(lerpV(n.rec.position.clone().setY(.9), n.rec.position.clone().setY(-1.6), q)); });
      epsp.visible = k > .45 && k < .9; if (epsp.visible) epsp.position.set(0, sm(-1, -8.5, (k - .45) / .45), 0);
      return null; },
    nmj(t) { const P = 5, k = (t % P) / P;
      nmjAP.visible = k < .22; nmjAP.position.copy(lerpV(V(-2, 9, 0), V(0, 1, 0), k / .22));
      ACH.forEach((a, i) => { const q = (k - .2 - (i % 6) * .01) / .14; a.s.visible = q > 0 && q < 1.4; if (a.s.visible) a.s.position.copy(a.b.clone().add(a.j.clone().multiplyScalar(.6)).setY(sm(.05, -.35, q))); });
      const w = (k - .32) / .3; fiberWave.material.opacity = fiberWave2.material.opacity = w > 0 && w < 1 ? .8 * (1 - w) : 0; fiberWave.position.x = sm(0, 11, w); fiberWave2.position.x = -sm(0, 11, w);
      const c = k > .5 && k < .85 ? sm(0, 1, (k - .5) / .12) * sm(1, 0, (k - .73) / .12) : 0;
      SRCA.forEach(s => s.visible = c > .05);
      const zx = 3.7 - .9 * c; ZL.position.x = -zx; ZR.position.x = zx;
      ACT_L.forEach(a => a.position.x = -zx + 1.6); ACT_R.forEach(a => a.position.x = zx - 1.6);
      fiber.scale.set(1 + .03 * c, 1 - .02 * c, 1 + .03 * c);
      return null; },
  };

  // ------------------------------------------------------------- public API
  let active = false;
  return {
    scene, cam, ctl, steps: MICRO_STEPS,
    enter(i, instant) { active = true; step = i; T = 0; resetDynamic(); const id = MICRO_STEPS[i].id; if (instant) snap(id); else go(id); setLabels(LBL[id]); labelLayer.style.display = ''; },
    leave() { active = false; labelLayer.style.display = 'none'; ctl.enabled = false; },
    finish() { if (tween) { ctl.target.copy(tween.tt); cam.position.copy(tween.tp); tween = null; } },
    update(dt) { if (!active) return null; T += dt;
      if (tween) { tween.t = Math.min(1, tween.t + dt / 1.1); const k = 1 - Math.pow(1 - tween.t, 3); ctl.target.lerpVectors(tween.ft, tween.tt, k); cam.position.lerpVectors(tween.fp, tween.tp, k); if (tween.t >= 1) tween = null; }
      ctl.update(); const v = ANIM[MICRO_STEPS[step].id](T); placeLabels(); return v; },
    Vm,
  };
};
