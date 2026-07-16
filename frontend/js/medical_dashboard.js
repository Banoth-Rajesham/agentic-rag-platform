/* ═══════════════════════════════════════════════════════════════
   Agent DNA — Medical Diagnostic 3D Engine  (COMPLETE REWRITE)
   Blue-translucent anatomy-atlas style · Three.js r128 safe
═══════════════════════════════════════════════════════════════ */
'use strict';

// ── Engine globals ────────────────────────────────────────────
let scene, camera, renderer, controls, composer;
let perspCamera, orthoCamera;
let isPerspective = true;
let bodyRoot = null;
let organMap  = {};     // name → Mesh
let skinParts = [];     // semi-transparent skin meshes
let activeCase   = null;
let pulseT       = 0;
let autoRotate   = true;

// ── Z-Anatomy Active Selection & Control variables ────────────
let raycaster, mouse;
let selectedObject = null;
let originalEmissive = 0x000000;
let originalEmissiveInt = 0;
let localViewActive = false;
let savedVisibility = new Map();
let clickStartX = 0, clickStartY = 0;

// ── Visual palette ────────────────────────────────────────────
const SKIN_COLOR   = 0x1a55cc;   // blue (match reference exactly)
const SKIN_EMISSIVE= 0x0a1a55;
const SKIN_OPACITY = 0.30;       // very transparent — organs show clearly

const ORG = {
  brain:   { c:0xeebbd0, e:0x220511 },
  heart:   { c:0xcc2233, e:0x550010 },
  lungL:   { c:0xf0a0b8, e:0x220511 },
  lungR:   { c:0xf0a0b8, e:0x220511 },
  trachea: { c:0xddd0b0, e:0x111005 },
  liver:   { c:0x8b2a1e, e:0x220805 },
  stomach: { c:0xe0b070, e:0x331a05 },
  kidneyL: { c:0x992211, e:0x220805 },
  kidneyR: { c:0x992211, e:0x220805 },
  intestineS:{ c:0xf0b0a0, e:0x221005 },
  intestineL:{ c:0xe0a090, e:0x221005 },
  bladder: { c:0xc8e0f0, e:0x102030 },
  spine:   { c:0xd4c89a, e:0x110e05 },
};

// ── Clinical cases DB ─────────────────────────────────────────
const CASES = {
  heart: {
    title:    'ECG Analysis — Cardiac Arrhythmia & Mild Cardiomegaly',
    subtitle: '3-D anatomical synthesis · RAG-extracted medical & natural cure timelines',
    organs:   ['heart'],
    severity: 'red',
    diagnoses:['Sinus Tachycardia', 'Left Ventricular Hypertrophy', 'Elevated BP 142/90 mmHg'],
    remedies:[
      {day:'Day 1–3',   title:'Mineral Replenishment',    desc:'Magnesium Glycinate 400 mg/day stabilises cardiac electrical membranes. Sodium < 1500 mg/day.', tags:['Magnesium','Low Sodium']},
      {day:'Day 4–10',  title:'Vasodilation Foods',       desc:'120 ml organic beetroot juice + 1 clove raw garlic daily. Boosts nitric oxide, expands arteries.', tags:['Beetroot','Garlic','Nitric Oxide']},
      {day:'Day 11–21', title:'Hawthorn Berry Infusion',  desc:'Tea twice daily. Flavonoids improve cardiac efficiency and lower resting HR significantly.', tags:['Hawthorn Berry','Flavonoids']},
      {day:'Day 22–30', title:'Aerobic Rehabilitation',   desc:'20-min Zone-2 walks daily. Re-evaluate resting HR and blood pressure.', tags:['Zone-2 Cardio','Follow-up']},
    ],
    medicines:[
      {name:'Metoprolol Succinate 50 mg', detail:'Once daily. Beta-blocker: slows HR, reduces myocardial workload. SE: dizziness, fatigue.', type:'rx'},
      {name:'Coenzyme Q10 100 mg',        detail:'Twice daily with meals. Boosts mitochondrial energy in heart muscle.', type:'supp'},
    ],
    recovery:[
      {day:'Day 1',  title:'HR Stabilisation',      desc:'Serum levels bring resting HR below 85 bpm.'},
      {day:'Day 7',  title:'BP Reduction Begins',   desc:'Systolic moves towards target 130 mmHg.'},
      {day:'Day 14', title:'Myocardial Workload ↓', desc:'Stamina returns; cardiac fatigue recedes substantially.'},
    ],
  },
  liver: {
    title:    'Hepatic Panel — Non-Alcoholic Fatty Liver (NAFLD) Stage 1',
    subtitle: '3-D anatomical synthesis · RAG-extracted hepatic recovery timelines',
    organs:   ['liver'],
    severity: 'orange',
    diagnoses:['Elevated ALT/AST Enzymes', 'Mild Hepatomegaly', 'Hyperlipidemia (LDL & TG)'],
    remedies:[
      {day:'Day 1–7',   title:'Detox & Glucose Stabilisation', desc:'Morning warm lemon + apple cider vinegar. Remove refined sugars, fructose, trans fats.', tags:['Lemon Water','Zero Sugar']},
      {day:'Day 8–15',  title:'Milk Thistle Extract',           desc:'Silymarin 200 mg twice daily. Stabilises liver cell membranes and boosts protein synthesis.', tags:['Milk Thistle','Silymarin']},
      {day:'Day 16–25', title:'Anti-inflammatory Foods',        desc:'Cruciferous veg + turmeric tea daily. Curcumin reduces hepatic inflammation.', tags:['Turmeric','Broccoli','Kale']},
      {day:'Day 26–45', title:'Lipid Profile Balancing',        desc:'Wild salmon + walnuts daily for Omega-3. Re-run enzyme panel.', tags:['Omega-3','Lipid Panel']},
    ],
    medicines:[
      {name:'Ursodeoxycholic Acid 250 mg (UDCA)', detail:'Twice daily. Promotes bile flow, protects hepatocytes. SE: mild diarrhoea.', type:'rx'},
      {name:'Vitamin E 400 IU',                    detail:'Daily. Antioxidant; reduces NAFLD inflammation in clinical trials.', type:'supp'},
    ],
    recovery:[
      {day:'Day 7',  title:'Enzyme Response',       desc:'Active detox cuts blood AST/ALT spillover.'},
      {day:'Day 30', title:'Hepatic Fat Reduction', desc:'Intrahepatic fat dissolves; right-side discomfort recedes.'},
      {day:'Day 45', title:'Function Restored',     desc:'Normal AST/ALT; reduced circulating cholesterol confirmed.'},
    ],
  },
  kidneys: {
    title:    'Renal Function — Micro-Lithiasis & Elevated BUN',
    subtitle: '3-D anatomical synthesis · RAG-extracted renal recovery timelines',
    organs:   ['kidneyL','kidneyR'],
    severity: 'red',
    diagnoses:['Renal Micro-Lithiasis (Micro Stones)', 'Elevated BUN', 'Dehydration Markers'],
    remedies:[
      {day:'Day 1–3',  title:'Hyper-Hydration + Citric Acid', desc:'3.5 L filtered water + juice of 2 lemons daily. Citric acid binds calcium and dissolves stones.', tags:['Citric Acid','3.5 L Water']},
      {day:'Day 4–7',  title:'Diuretic Herbal Infusions',     desc:'Dandelion Root or Nettle tea 3×/day. Natural diuretic flushes metabolic debris safely.', tags:['Dandelion Root','Nettle']},
      {day:'Day 8–14', title:'Electrolyte & Diet Adjustment', desc:'Low-oxalate diet; reduce animal protein to ease renal load and normalise BUN.', tags:['Low Oxalate','Low Protein']},
    ],
    medicines:[
      {name:'Tamsulosin 0.4 mg (Alpha-Blocker)', detail:'Once daily. Relaxes ureteral smooth muscle for easier stone clearance. SE: headache.', type:'rx'},
      {name:'Potassium Citrate 15 mEq',           detail:'Twice daily. Alkalinises urine; inhibits calcium/uric-acid crystallisation.', type:'supp'},
    ],
    recovery:[
      {day:'Day 2',  title:'Ureteral Relaxation',  desc:'Tamsulosin markedly reduces lower-back and urinary discomfort.'},
      {day:'Day 5',  title:'Stone Clearance',      desc:'Micro-crystals pass safely through the bladder.'},
      {day:'Day 10', title:'Metric Normalisation', desc:'BUN and serum creatinine return to physiological baseline.'},
    ],
  },
};

// ─────────────────────────────────────────────────────────────
//  3-D ENGINE
// ─────────────────────────────────────────────────────────────

function initEngine() {
  requestAnimationFrame(() => {
    const el = document.getElementById('viewportContainer');
    if (!el) return;

    const W = el.offsetWidth  || 600;
    const H = el.offsetHeight || 500;

    // ── Scene ─────────────────────────────────────────────────
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x303030);
    // No fog — matches Z-Anatomy's clean, flat background

    // ── Camera ────────────────────────────────────────────────
    const aspect = W / H;
    perspCamera = new THREE.PerspectiveCamera(38, aspect, 0.005, 100);
    perspCamera.position.set(0, 1.3, 3.2);

    const frustumSize = 2.0;
    orthoCamera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.005,
      100
    );
    orthoCamera.position.set(0, 1.3, 3.2);

    camera = perspCamera;

    // ── Raycasting & Pointer ──────────────────────────────────
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // ── Renderer ──────────────────────────────────────────────
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(W, H, false); // false = don't set CSS size — CSS handles that via width/height:100%
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.outputEncoding    = THREE.sRGBEncoding;
    renderer.toneMapping       = THREE.NoToneMapping;

    const old = el.querySelector('canvas');
    if (old) old.remove();
    el.appendChild(renderer.domElement);

    // ── Controls ──────────────────────────────────────────────
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping    = true;
    controls.dampingFactor    = 0.06;  // Very smooth deceleration
    controls.zoomSpeed        = 1.2;   // Responsive but not snappy
    controls.rotateSpeed      = 0.7;   // Slightly slower rotation for precision
    controls.panSpeed         = 0.8;
    controls.screenSpacePanning = true; // Pan stays aligned with camera plane
    controls.minDistance      = 0.05;  // Let user zoom right into bone detail
    controls.maxDistance      = 18;
    controls.maxPolarAngle    = Math.PI * 0.90;
    controls.target.set(0, 1.35, 0);
    controls.update();
    controls.addEventListener('start', () => { autoRotate = false; });

    // ── Bloom ─────────────────────────────────────────────────
    if (window.EffectComposer && window.RenderPass && window.UnrealBloomPass) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.65, 0.4, 0.80);
      composer.addPass(bloom);
    }

    buildLights();
    buildGrid();
    buildBody();
    startLoop();
    window.addEventListener('resize', onResize);
  });
}

// ── Lighting — bright studio lighting for opaque models ────────
function buildLights() {
  // Z-Anatomy style: bright, neutral studio lighting. No blue glow.
  // Matches bone_solid #b2b2b2 — neutral gray-white illumination
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));

  // Hemisphere light (sky = white, ground = dark gray)
  const hemi = new THREE.HemisphereLight(0xffffff, 0x2a2a2a, 0.8);
  scene.add(hemi);

  // Key light — warm from front-top
  const key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(2, 5, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096); // 4x shadow resolution for high clarity close-ups
  key.shadow.bias = -0.0005;
  key.shadow.radius = 4;
  scene.add(key);

  // Fill light — cool from left
  const fill = new THREE.DirectionalLight(0xe0e8ff, 0.4);
  fill.position.set(-4, 2, -2);
  scene.add(fill);
}

// ── Grid ──────────────────────────────────────────────────────
function buildGrid() {
  const g = new THREE.GridHelper(18, 32, 0x112244, 0x0a1628);
  g.position.y = -0.02;
  scene.add(g);
}

// ── Material helpers ──────────────────────────────────────────
function skinMat() {
  return new THREE.MeshPhysicalMaterial({
    color:             SKIN_COLOR,
    emissive:          SKIN_EMISSIVE,
    emissiveIntensity: 0.3,
    roughness:         0.35,
    metalness:         0.0,
    transparent:       true,
    opacity:           SKIN_OPACITY,
    side:              THREE.FrontSide,
    depthWrite:        false,
  });
}

function orgMat(name) {
  const col = ORG[name] || { c:0xffffff, e:0x111111 };
  return new THREE.MeshStandardMaterial({
    color:             col.c,
    emissive:          col.e,
    emissiveIntensity: 0.8,
    roughness:         0.4,
    metalness:         0.05,
  });
}

// ── Build the full body ───────────────────────────────────────
function buildProceduralBody() {
  bodyRoot = new THREE.Group();
  scene.add(bodyRoot);

  function S(geo, x,y,z, rx=0,ry=0,rz=0, sx=1,sy=1,sz=1) {
    const m = new THREE.Mesh(geo, skinMat());
    m.position.set(x,y,z);
    m.rotation.set(rx,ry,rz);
    m.scale.set(sx,sy,sz);
    m.castShadow = true;
    bodyRoot.add(m);
    skinParts.push(m);
    return m;
  }

  function O(name, geo, x,y,z, rx=0,ry=0,rz=0, sx=1,sy=1,sz=1) {
    const m = new THREE.Mesh(geo, orgMat(name));
    m.position.set(x,y,z);
    m.rotation.set(rx,ry,rz);
    m.scale.set(sx,sy,sz);
    m.castShadow = true;
    bodyRoot.add(m);
    organMap[name] = m;
    return m;
  }

  // Kidney pill shape (r128 safe — no CapsuleGeometry)
  function kidGeo() {
    const pts = [];
    for (let i=0;i<=14;i++){
      const t=i/14, r=Math.sin(t*Math.PI)*0.048+0.008;
      pts.push(new THREE.Vector2(r, t*0.18-0.09));
    }
    return new THREE.LatheGeometry(pts, 14);
  }

  // ═══════════════ SKIN SHELL (blue translucent) ════════════

  // ── HEAD with facial features ─────────────────────────────
  // Main skull
  S(new THREE.SphereGeometry(0.265, 32, 32), 0, 2.86, 0, 0,0,0, 1,1.08,0.96);

  // Forehead ridge (slightly protruding oval)
  S(new THREE.SphereGeometry(0.12, 16, 16),  0, 2.98, 0.12, 0,0,0, 1.8,0.6,0.5);

  // Cheekbones (left / right)
  S(new THREE.SphereGeometry(0.09, 12, 12), -0.18, 2.80, 0.16, 0,0,0, 1.0,0.6,0.5);
  S(new THREE.SphereGeometry(0.09, 12, 12),  0.18, 2.80, 0.16, 0,0,0, 1.0,0.6,0.5);

  // Nose bridge + tip
  S(new THREE.SphereGeometry(0.04, 10, 10),  0, 2.84, 0.24, 0,0,0, 0.8,1.5,0.9);
  S(new THREE.SphereGeometry(0.042,10, 10),  0, 2.77, 0.27, 0,0,0, 1.2,0.8,1.0);

  // Jaw / chin
  S(new THREE.SphereGeometry(0.16, 16, 16),  0, 2.63, 0.08, 0,0,0, 1.3,0.7,0.85);

  // Ears
  S(new THREE.SphereGeometry(0.065, 12,12), -0.27, 2.82, 0, 0,0,0, 0.5,0.8,0.35);
  S(new THREE.SphereGeometry(0.065, 12,12),  0.27, 2.82, 0, 0,0,0, 0.5,0.8,0.35);

  // ── NECK ──────────────────────────────────────────────────
  S(new THREE.CylinderGeometry(0.09,0.10,0.22,20), 0, 2.52, 0);

  // ── THORAX ────────────────────────────────────────────────
  S(new THREE.CylinderGeometry(0.32,0.27,0.72,32), 0, 2.05, 0, 0,0,0, 1,1,0.68);

  // Pectoral mounds (L/R)
  S(new THREE.SphereGeometry(0.13,16,16), -0.14, 2.07, 0.20, 0,0,0, 1.1,0.7,0.7);
  S(new THREE.SphereGeometry(0.13,16,16),  0.14, 2.07, 0.20, 0,0,0, 1.1,0.7,0.7);

  // ── ABDOMEN ───────────────────────────────────────────────
  S(new THREE.CylinderGeometry(0.27,0.30,0.62,32), 0, 1.44, 0, 0,0,0, 1,1,0.68);

  // ── PELVIS ────────────────────────────────────────────────
  S(new THREE.CylinderGeometry(0.32,0.29,0.28,32), 0, 1.05, 0, 0,0,0, 1,1,0.76);

  // ── ARMS ──────────────────────────────────────────────────
  const ax = 0.44;
  // Left
  S(new THREE.SphereGeometry(0.115,16,16),          -ax,    2.27, 0);
  S(new THREE.CylinderGeometry(0.07,0.063,0.55,14), -ax-0.14, 1.94, 0, 0,0, 0.24);
  S(new THREE.CylinderGeometry(0.056,0.05,0.50,14), -ax-0.26, 1.48, 0, 0,0, 0.18);
  // Hand + fingers (simplified)
  S(new THREE.BoxGeometry(0.10,0.04,0.14),           -ax-0.35, 1.21, 0);
  // Right
  S(new THREE.SphereGeometry(0.115,16,16),            ax,    2.27, 0);
  S(new THREE.CylinderGeometry(0.07,0.063,0.55,14),  ax+0.14, 1.94, 0, 0,0,-0.24);
  S(new THREE.CylinderGeometry(0.056,0.05,0.50,14),  ax+0.26, 1.48, 0, 0,0,-0.18);
  S(new THREE.BoxGeometry(0.10,0.04,0.14),             ax+0.35, 1.21, 0);

  // ── LEGS ──────────────────────────────────────────────────
  // Left
  S(new THREE.CylinderGeometry(0.125,0.105,0.74,20), -0.14, 0.68, 0);
  S(new THREE.CylinderGeometry(0.085,0.074,0.70,20), -0.14,-0.03, 0, 0,0,0.035);
  S(new THREE.BoxGeometry(0.11,0.07,0.24),            -0.14,-0.40, 0.05);
  // Right
  S(new THREE.CylinderGeometry(0.125,0.105,0.74,20),  0.14, 0.68, 0);
  S(new THREE.CylinderGeometry(0.085,0.074,0.70,20),  0.14,-0.03, 0, 0,0,-0.035);
  S(new THREE.BoxGeometry(0.11,0.07,0.24),              0.14,-0.40, 0.05);

  // ═══════════════ INTERNAL ORGANS ══════════════════════════

  // Brain (visible through skull)
  const bG = new THREE.SphereGeometry(0.195, 32, 32);
  O('brain', bG, 0, 2.86, 0.02, 0,0,0, 1,0.88,1.08);

  // Trachea
  const trG = new THREE.CylinderGeometry(0.025, 0.025, 0.38, 12);
  O('trachea', trG, 0, 2.34, 0.05);

  // Heart
  const hG = new THREE.SphereGeometry(0.105, 24, 24);
  O('heart', hG, -0.06, 2.07, 0.12, 0,0,0, 0.88,1.18,0.82);

  // Lungs
  const llG = new THREE.CylinderGeometry(0.09, 0.10, 0.46, 22);
  O('lungL', llG, -0.16, 2.04, 0.06, 0.07, 0,  0.07, 1,1,0.85);
  const lrG = new THREE.CylinderGeometry(0.09, 0.10, 0.46, 22);
  O('lungR', lrG,  0.16, 2.04, 0.06, 0.07, 0, -0.07, 1,1,0.85);

  // Liver (large, right upper abdomen)
  const livG = new THREE.SphereGeometry(0.175, 22, 22);
  O('liver', livG, 0.12, 1.58, 0.06, 0,0,-0.18, 1.55, 0.65, 0.80);

  // Stomach
  const stG = new THREE.SphereGeometry(0.105, 18, 18);
  O('stomach', stG, -0.12, 1.55, 0.07, 0,0,0.22, 1.2,0.85,0.88);

  // Small intestine — coiled torus rings
  {
    const sm = orgMat('intestineS');
    for (let ring=0; ring<5; ring++){
      const r  = 0.11 - ring*0.012;
      const yy = 1.26 - ring*0.04;
      const geo = new THREE.TorusGeometry(r, 0.022, 8, 28);
      const m   = new THREE.Mesh(geo, sm.clone());
      m.position.set(0, yy, 0.04);
      m.rotation.x = Math.PI/2 + ring*0.05;
      bodyRoot.add(m);
    }
    // Vertical segment
    const vG = new THREE.CylinderGeometry(0.022, 0.022, 0.18, 8);
    const vm  = new THREE.Mesh(vG, sm.clone());
    vm.position.set(0.11, 1.22, 0.04);
    bodyRoot.add(vm);
  }

  // Large intestine — surrounding frame
  {
    const lm = orgMat('intestineL');
    const lPositions = [
      {x: 0.18, y: 1.37, z:0.02, rx:0, ry:0, rz:0},        // ascending (right)
      {x: 0,    y: 1.48, z:0.02, rx:0, ry:0, rz:Math.PI/2}, // transverse top
      {x:-0.18, y: 1.37, z:0.02, rx:0, ry:0, rz:0},        // descending (left)
      {x: 0,    y: 1.14, z:0.02, rx:0, ry:0, rz:Math.PI/2}, // pelvic bottom
    ];
    lPositions.forEach(p=>{
      const geo = new THREE.CylinderGeometry(0.028, 0.028, 0.22, 10);
      const m   = new THREE.Mesh(geo, lm.clone());
      m.position.set(p.x, p.y, p.z);
      m.rotation.set(p.rx, p.ry, p.rz);
      bodyRoot.add(m);
    });
  }

  // Kidneys (lathe pill shape, r128 safe)
  O('kidneyL', kidGeo(), -0.13, 1.43, -0.10, 0.18, 0.08,  0.08);
  O('kidneyR', kidGeo(),  0.13, 1.43, -0.10, 0.18,-0.08, -0.08);

  // Bladder (lower pelvis)
  const blG = new THREE.SphereGeometry(0.07, 16, 16);
  O('bladder', blG, 0, 1.02, 0.06, 0,0,0, 1.2,1.0,0.9);

  // Spine — 14 vertebral discs
  {
    const spM = orgMat('spine');
    for (let i=0;i<14;i++){
      const d = new THREE.Mesh(
        new THREE.CylinderGeometry(0.026, 0.026, 0.068, 10),
        spM.clone()
      );
      d.position.set(0, 2.40 - i*0.090, -0.07);
      bodyRoot.add(d);
    }
  }
}

const LAYER_REGISTRY = {
  'skeletal':             'models/skeleton.glb',
  'muscular_insertions':  'models/Muscular insertions.glb',
  'joints':               'models/joints.glb',
  'muscular':             'models/Muscular system.glb',
  'cardiovascular':       'models/Cardiovascular system.glb',
  'lymphoid':             'models/Lymphoid organs.glb',
  'nervous':              'models/Nervous system & Sense organs.glb',
  'visceral':             'models/Visceral systems.glb',
  'regions':              'models/Regions of human body (Skin).glb'
};
const loadedLayers = {}; // stores layer groups

function mapNodeToLayer(nodeName) {
  const name = nodeName.toLowerCase();
  if (name.includes("skeletal") || name.includes("skeleton") || name.includes("1:")) return "skeletal";
  if (name.includes("muscular insertions") || name.includes("insertion") || name.includes("2:")) return "muscular_insertions";
  if (name.includes("joint") || name.includes("3:")) return "joints";
  if (name.includes("muscular system") || name.includes("muscular") || name.includes("4:")) return "muscular";
  if (name.includes("cardiovascular") || name.includes("5:")) return "cardiovascular";
  if (name.includes("lymphoid") || name.includes("lymph") || name.includes("6:")) return "lymphoid";
  if (name.includes("nervous") || name.includes("7:")) return "nervous";
  if (name.includes("visceral") || name.includes("8:")) return "visceral";
  if (name.includes("region") || name.includes("skin") || name.includes("9:")) return "regions";
  return null;
}

function getIconForNode(name) {
  const n = name.toLowerCase();
  if (n.includes("skeletal") || n.includes("skeleton") || n.includes("1:")) return "fa-bone";
  if (n.includes("muscular insertions") || n.includes("insertion") || n.includes("2:")) return "fa-link";
  if (n.includes("joint") || n.includes("3:")) return "fa-compress";
  if (n.includes("muscular system") || n.includes("muscular") || n.includes("4:")) return "fa-dumbbell";
  if (n.includes("cardiovascular") || n.includes("5:")) return "fa-heart-pulse";
  if (n.includes("lymphoid") || n.includes("lymph") || n.includes("6:")) return "fa-shield-virus";
  if (n.includes("nervous") || n.includes("7:")) return "fa-brain";
  if (n.includes("visceral") || n.includes("8:")) return "fa-lungs";
  if (n.includes("region") || n.includes("skin") || n.includes("9:")) return "fa-person";
  return "fa-folder";
}

function buildDynamicOutliner(modelScene) {
  const container = document.querySelector('.outliner-list');
  if (!container) return;
  container.innerHTML = '';

  const children = [...modelScene.children].sort((a, b) => 
    a.name.localeCompare(b.name, undefined, {numeric: true, sensitivity: 'base'})
  );

  children.forEach(child => {
    const html = renderNodeTree(child, 0);
    if (html) container.appendChild(html);
  });
}

function renderNodeTree(node, depth) {
  if (node.isMesh || !node.name) return null;

  const itemWrapper = document.createElement('div');
  itemWrapper.className = 'outliner-item-wrapper';

  const row = document.createElement('div');
  row.className = 'outliner-item';
  row.style.paddingLeft = `${16 + depth * 12}px`;
  row.dataset.nodeId = node.uuid;

  const childGroups = node.children.filter(c => !c.isMesh && c.name);
  const hasChildren = childGroups.length > 0;

  row.innerHTML = `
    <i class="fa-solid fa-chevron-right chevron" style="visibility: ${hasChildren ? 'visible' : 'hidden'}; margin-right: 8px; font-size: 0.6rem; color: #666; transition: transform 0.2s;"></i>
    <i class="fa-solid ${getIconForNode(node.name)} icon" style="margin-right: 10px; color: var(--accent); width: 14px; text-align: center;"></i>
    <span class="label" style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${node.name}</span>
    <i class="fa-regular ${node.visible ? 'fa-eye' : 'fa-eye-slash'} vis-toggle" style="color: #888; font-size: 0.85rem; cursor: pointer;"></i>
  `;

  const toggle = row.querySelector('.vis-toggle');
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    node.visible = !node.visible;
    row.classList.toggle('hidden', !node.visible);
    toggle.classList.toggle('fa-eye', node.visible);
    toggle.classList.toggle('fa-eye-slash', !node.visible);
  });

  itemWrapper.appendChild(row);

  const subContainer = document.createElement('div');
  if (hasChildren) {
    subContainer.className = 'outliner-sub-list';
    subContainer.style.display = 'none';
  }

  row.addEventListener('click', (e) => {
    if (e.target.classList.contains('vis-toggle')) return;
    
    // Select node in 3D scene
    selectObject(node);
    autoRotate = false;

    if (hasChildren) {
      const isExpanded = subContainer.style.display !== 'none';
      subContainer.style.display = isExpanded ? 'none' : 'block';
      
      const chevron = row.querySelector('.chevron');
      if (chevron) {
        chevron.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(90deg)';
      }
    }
  });

  if (hasChildren) {
    childGroups.forEach(child => {
      const childHtml = renderNodeTree(child, depth + 1);
      if (childHtml) subContainer.appendChild(childHtml);
    });
    itemWrapper.appendChild(subContainer);
  }

  return itemWrapper;
}

function applyJSMaterial(child) {
  child.castShadow = true;
  child.receiveShadow = true;
  const name = child.name.toLowerCase();

  // 1. Create a fresh standard material for absolute control
  const mat = new THREE.MeshStandardMaterial({
    color: 0xaaaaaa, // default fallback
    roughness: 0.7,
    metalness: 0.1
  });
  child.material = mat;

  // 2. Assign base colors by structural name
  if (name.includes("bone") || name.includes("skeleton")) {
    mat.color.set("#dfd5b8"); // Warm bone beige
  } else if (name.includes("muscle") || name.includes("insertion")) {
    mat.color.set("#cc2936");
  } else if (name.includes("heart")) {
    mat.color.set("#d62828");
  } else if (name.includes("brain") || name.includes("cereb")) {
    mat.color.set("#f4b6c2");
  } else if (name.includes("liver")) {
    mat.color.set("#8B4513");
  } else if (name.includes("kidney")) {
    mat.color.set("#7E57C2");
  } else if (name.includes("lung")) {
    mat.color.set("#C77DFF");
  } else if (name.includes("vein")) {
    mat.color.set("#2855d6");
  } else if (name.includes("artery")) {
    mat.color.set("#d62828");
  } else if (name.includes("nerve")) {
    mat.color.set("#f4d03f");
  } else if (name.includes("joint") || name.includes("cartilage")) {
    mat.color.set("#9db09e"); // Sage green cartilage/joints
  } else if (name.includes("lymph") || name.includes("spleen") || name.includes("thymus")) {
    mat.color.set("#2ec4b6");
  } else if (name.includes("skin") || name.includes("body") || name.includes("region")) {
    child.material = skinMat(); // Our translucent blue skin
    skinParts.push(child);
  }

  // 3. Register organ in organMap for AI glowing & diagnosis
  const orgName = Object.keys(ORG).find(k => name.includes(k.toLowerCase()));
  if (orgName) {
    organMap[orgName] = child;
  }
}

function loadIndividualLayers(loader) {
  let modelsFound = 0;
  const promises = [];

  Object.entries(LAYER_REGISTRY).forEach(([layerId, url]) => {
    const p = new Promise((resolve) => {
      loader.load(
        url,
        (gltf) => {
          const group = gltf.scene;
          group.scale.set(1.5, 1.5, 1.5);
          
          group.traverse((child) => {
            if (child.isMesh) {
              applyJSMaterial(child);
            }
          });
          
          loadedLayers[layerId] = group;
          bodyRoot.add(group);
          modelsFound++;
          resolve(true);
        },
        undefined,
        (error) => {
          resolve(false);
        }
      );
    });
    promises.push(p);
  });

  Promise.all(promises).then(() => {
    if (modelsFound === 0) {
      console.warn("No high-res models found. Using procedural fallback.");
      buildProceduralBody();
      showMissingModelWarning();
    } else {
      console.log(`Successfully loaded ${modelsFound} layer(s).`);
      const warn = document.getElementById('missingModelWarning');
      if (warn) warn.remove();
    }
  });
}

function buildBody() {
  bodyRoot = new THREE.Group();
  scene.add(bodyRoot);

  if (!window.THREE || !THREE.GLTFLoader) {
    buildProceduralBody();
    return;
  }

  const loader = new THREE.GLTFLoader();

  // Try loading the full model first
  loader.load(
    'models/human.glb',
    (gltf) => {
      console.log("Successfully loaded full model human.glb. Mapping internal collections...");
      const modelScene = gltf.scene;
      modelScene.scale.set(1.5, 1.5, 1.5);

      modelScene.traverse((child) => {
        // Map collection groups/objects to Outliner layers
        const layerId = mapNodeToLayer(child.name);
        if (layerId && !loadedLayers[layerId]) {
          loadedLayers[layerId] = child;
          console.log(`Mapped node "${child.name}" to layer "${layerId}"`);
        }

        if (child.isMesh) {
          applyJSMaterial(child);
        }
      });

      bodyRoot.add(modelScene);
      
      // Build dynamic outliner tree matching Blender's hierarchy
      buildDynamicOutliner(modelScene);

      const warn = document.getElementById('missingModelWarning');
      if (warn) warn.remove();
    },
    undefined,
    (error) => {
      console.warn("Full human.glb not found. Trying individual layers...", error);
      loadIndividualLayers(loader);
    }
  );
}

function showMissingModelWarning() {
  const container = document.getElementById('viewportContainer');
  if (!container) return;
  const warning = document.createElement('div');
  warning.id = 'missingModelWarning';
  warning.innerHTML = `
    <div style="position:absolute; top:20px; right:20px; background:rgba(255,50,50,0.15); border:1px solid rgba(255,50,50,0.4); padding:10px 16px; border-radius:8px; backdrop-filter:blur(10px); z-index:100; max-width: 250px;">
      <h4 style="color:#ff6666; font-size:0.8rem; margin:0 0 6px 0; display:flex; align-items:center; gap:6px;"><i class="fa-solid fa-triangle-exclamation"></i> Placeholder 3D Model</h4>
      <p style="color:#ffaaaa; font-size:0.7rem; margin:0; line-height:1.4;">To achieve photorealistic visuals, place your exported <b>.glb</b> files (e.g., <code>skeleton.glb</code>, <code>muscular_insertions.glb</code>) in the <code>frontend/models/</code> directory.</p>
    </div>
  `;
  container.appendChild(warning);
}

// ── Resize ────────────────────────────────────────────────────
function onResize() {
  const el = document.getElementById('viewportContainer');
  if (!el || !camera || !renderer) return;
  const W = el.offsetWidth  || 600;
  const H = el.offsetHeight || 500;
  const aspect = W / H;

  // Update perspective camera
  perspCamera.aspect = aspect;
  perspCamera.updateProjectionMatrix();

  // Update ortho camera keeping same frustum size
  const fs = orthoCamera.top - orthoCamera.bottom; // existing frustum height
  orthoCamera.left   = fs * aspect / -2;
  orthoCamera.right  = fs * aspect / 2;
  orthoCamera.updateProjectionMatrix();

  // Resize renderer to canvas layout size, let pixel ratio handle sharpness
  renderer.setSize(W, H, false);
  renderer.setPixelRatio(window.devicePixelRatio);
  if (composer) composer.setSize(W, H);
}

// ── Render loop ───────────────────────────────────────────────
function startLoop() {
  (function loop() {
    requestAnimationFrame(loop);
    controls.update();
    if (autoRotate && bodyRoot) bodyRoot.rotation.y += 0.0014;

    // Pulse highlighted organs
    if (activeCase) {
      pulseT += 0.045;
      const p   = 1 + Math.sin(pulseT)*0.28;
      const isR = activeCase.severity === 'red';
      const hc  = isR ? 0xff2222 : 0xff9500;
      const he  = isR ? 0x660000 : 0x442000;
      const hi  = 2.5 + Math.sin(pulseT)*1.8;

      activeCase.organs.forEach(name => {
        const m = organMap[name];
        if (!m||!m.material) return;
        m.material.color.setHex(hc);
        m.material.emissive.setHex(he);
        m.material.emissiveIntensity = hi;
        m.scale.setScalar(p*0.12+0.88);
      });
    }

    if (composer) composer.render();
    else renderer.render(scene, camera);
  })();
}

// ── Reset organ colours ───────────────────────────────────────
function resetOrgans() {
  pulseT = 0;
  Object.entries(organMap).forEach(([name, mesh]) => {
    const col = ORG[name];
    if (!col||!mesh.material) return;
    mesh.material.color.setHex(col.c);
    mesh.material.emissive.setHex(col.e);
    mesh.material.emissiveIntensity = 0.8;
    mesh.scale.setScalar(1);
  });
}

// ─────────────────────────────────────────────────────────────
//  UI RENDERING
// ─────────────────────────────────────────────────────────────

function renderCase(key) {
  const d = CASES[key];
  if (!d) return;
  activeCase = d;
  resetOrgans();
  autoRotate = true;

  document.querySelectorAll('.case-pill').forEach(el =>
    el.classList.toggle('active', el.dataset.case === key)
  );

  const t  = document.getElementById('diagnosticsTitle');
  const st = document.getElementById('diagnosticsSubtitle');
  if (t)  t.textContent  = d.title;
  if (st) st.textContent = d.subtitle;

  const ov = document.getElementById('organOverlay');
  if (ov) {
    ov.innerHTML = d.diagnoses.map(txt =>
      `<div class="badge"><span class="badge-dot ${d.severity}"></span>${txt}</div>`
    ).join('');
  }

  const nl = document.getElementById('naturalTimeline');
  if (nl) {
    nl.innerHTML = '<div class="timeline-stepper">' +
      d.remedies.map((r,i) => `
        <div class="t-step ${i===0?'active':''}">
          <div class="t-day">${r.day}</div>
          <div class="t-title">${r.title}</div>
          <div class="t-desc">${r.desc}</div>
          <div class="t-tags">${r.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        </div>`).join('') + '</div>';
  }

  const ml = document.getElementById('medicineList');
  if (ml) {
    ml.innerHTML = d.medicines.map(m => `
      <div class="rx-card">
        <div class="rx-card-head">
          <div class="rx-icon ${m.type==='rx'?'rx':'sup'}">
            <i class="fa-solid ${m.type==='rx'?'fa-pills':'fa-seedling'}"></i>
          </div>
          <div class="rx-name">${m.name}</div>
        </div>
        <div class="rx-detail">${m.detail}</div>
      </div>`).join('');
  }

  const rt = document.getElementById('medicalTimeline');
  if (rt) {
    rt.innerHTML = d.recovery.map((r,i) => `
      <div class="t-step ${i===0?'active':''}">
        <div class="t-day">${r.day}</div>
        <div class="t-title">${r.title}</div>
        <div class="t-desc">${r.desc}</div>
      </div>`).join('');
  }
}

// ─────────────────────────────────────────────────────────────
//  Z-ANATOMY INTERACTION ENGINE (HIGHLIGHT, SHORTCUTS, LOCAL VIEW)
// ─────────────────────────────────────────────────────────────

function selectObject(obj) {
  if (selectedObject) {
    // Restore previous object material emissive color and scale
    selectedObject.traverse(node => {
      if (node.isMesh && node.material) {
        node.material.emissive.setHex(node.userData.originalEmissive || 0x000000);
        node.material.emissiveIntensity = node.userData.originalEmissiveInt || 0.8;
        node.scale.setScalar(node.userData.originalScale || 1.0);
      }
    });
  }

  selectedObject = obj;
  const overlay = document.getElementById('selectionOverlay');
  const nameSpan = document.getElementById('selectedPartName');

  if (selectedObject) {
    // Traverse selected node to apply highlight to all child meshes
    selectedObject.traverse(node => {
      if (node.isMesh && node.material) {
        if (node.userData.originalEmissive === undefined) {
          node.userData.originalEmissive = node.material.emissive.getHex();
          node.userData.originalEmissiveInt = node.material.emissiveIntensity;
        }
        
        // Make it glow bright selection orange (#ed5700)
        node.material.emissive.setHex(0xed5700);
        node.material.emissiveIntensity = 2.5;

        // Store original scale if not already stored
        if (node.userData.originalScale === undefined) {
          node.userData.originalScale = node.scale.x;
        }
        node.scale.setScalar(node.userData.originalScale * 1.03);
      }
    });

    // Update active label overlay
    if (overlay && nameSpan) {
      // Format name nicely (strip suffix if any)
      const cleanName = selectedObject.name.replace(/\.(t|j|g|st)$/, '').replace(/_/g, ' ');
      nameSpan.textContent = cleanName;
      overlay.style.display = 'block';
    }
    
    // Highlight in the Outliner UI
    document.querySelectorAll('.outliner-item').forEach(row => {
      row.classList.toggle('active', row.dataset.nodeId === selectedObject.uuid);
    });
  } else {
    if (overlay) overlay.style.display = 'none';
    
    // De-activate in the Outliner UI
    document.querySelectorAll('.outliner-item').forEach(row => {
      row.classList.remove('active');
    });
  }
}

function syncOutlinerUI() {
  // Sync fallback layers
  document.querySelectorAll('.outliner-item[data-layer]').forEach(item => {
    const layerId = item.dataset.layer;
    if (layerId) {
      const group = loadedLayers[layerId];
      if (group) {
        const visible = group.visible;
        item.classList.toggle('hidden', !visible);
        const toggle = item.querySelector('.vis-toggle');
        if (toggle) {
          toggle.classList.toggle('fa-eye', visible);
          toggle.classList.toggle('fa-eye-slash', !visible);
        }
      }
    }
  });

  // Sync dynamic hierarchical nodes
  document.querySelectorAll('.outliner-item[data-node-id]').forEach(row => {
    const nodeId = row.dataset.nodeId;
    let foundNode = null;
    bodyRoot.traverse(node => {
      if (node.uuid === nodeId) foundNode = node;
    });
    if (foundNode) {
      const visible = foundNode.visible;
      row.classList.toggle('hidden', !visible);
      const toggle = row.querySelector('.vis-toggle');
      if (toggle) {
        toggle.classList.toggle('fa-eye', visible);
        toggle.classList.toggle('fa-eye-slash', !visible);
      }
    }
  });
}

function hideSelected() {
  if (selectedObject) {
    selectedObject.visible = false;
    selectObject(null);
    syncOutlinerUI();
  }
}

function hideUnselected() {
  if (!selectedObject) return;
  bodyRoot.traverse((node) => {
    if (node.isMesh) {
      let current = node;
      let isParentOrSelf = false;
      while (current) {
        if (current === selectedObject) {
          isParentOrSelf = true;
          break;
        }
        current = current.parent;
      }
      if (!isParentOrSelf) {
        node.visible = false;
      }
    }
  });
  // Also turn off top level layer groups if they don't contain the selection
  Object.entries(loadedLayers).forEach(([layerId, group]) => {
    let containsSelection = false;
    group.traverse(child => {
      if (child === selectedObject) containsSelection = true;
    });
    if (!containsSelection) {
      group.visible = false;
    }
  });
  syncOutlinerUI();
}

function showAllHidden() {
  bodyRoot.traverse((node) => {
    if (node.isMesh) {
      node.visible = true;
    }
  });
  Object.values(loadedLayers).forEach(group => {
    group.visible = true;
  });
  syncOutlinerUI();
}

function toggleLocalView() {
  if (!selectedObject) return;
  localViewActive = !localViewActive;

  if (localViewActive) {
    // Isolate selected object hierarchy
    bodyRoot.traverse((node) => {
      if (node.isMesh) {
        savedVisibility.set(node.uuid, node.visible);
        let current = node;
        let isParentOrSelf = false;
        while (current) {
          if (current === selectedObject) {
            isParentOrSelf = true;
            break;
          }
          current = current.parent;
        }
        if (!isParentOrSelf) {
          node.visible = false;
        }
      }
    });
    focusCameraOn(selectedObject);
  } else {
    // Restore original visibility
    bodyRoot.traverse((node) => {
      if (node.isMesh && savedVisibility.has(node.uuid)) {
        node.visible = savedVisibility.get(node.uuid);
      }
    });
    savedVisibility.clear();
    
    // Smoothly animate back to full body view
    const homePos = new THREE.Vector3(0, 1.3, 3.2);
    const homeTarget = new THREE.Vector3(0, 1.35, 0);
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const start = performance.now();
    const DURATION = 500;

    function animateZoomOut(now) {
      const t = Math.min((now - start) / DURATION, 1);
      const e = t * t * (3 - 2 * t);
      camera.position.lerpVectors(startPos, homePos, e);
      controls.target.lerpVectors(startTarget, homeTarget, e);
      controls.update();
      if (t < 1) requestAnimationFrame(animateZoomOut);
    }
    requestAnimationFrame(animateZoomOut);
  }
  syncOutlinerUI();
}

function focusCameraOn(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  box.getCenter(center);
  const size = new THREE.Vector3();
  box.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = perspCamera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
  cameraZ = Math.max(cameraZ * 1.6, 0.12); // give margin; never closer than 0.12

  const newPos = center.clone().add(new THREE.Vector3(0, 0, cameraZ));
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();

  let t = 0;
  const DURATION = 600; // ms
  const start = performance.now();

  function animateFocus(now) {
    const elapsed = now - start;
    t = Math.min(elapsed / DURATION, 1);
    // Smooth step easing (S-curve)
    const e = t * t * (3 - 2 * t);
    camera.position.lerpVectors(startPos, newPos, e);
    controls.target.lerpVectors(startTarget, center, e);
    controls.update();
    if (t < 1) requestAnimationFrame(animateFocus);
  }
  requestAnimationFrame(animateFocus);
}

function snapCameraTo(xDir, yDir, zDir) {
  autoRotate = false;
  const target = controls.target.clone();
  const dist = camera.position.distanceTo(target);
  const newPos = target.clone().add(new THREE.Vector3(xDir, yDir, zDir).normalize().multiplyScalar(dist));

  const startPos = camera.position.clone();
  const DURATION = 450;
  const start = performance.now();

  function animateSnap(now) {
    const t = Math.min((now - start) / DURATION, 1);
    const e = t * t * (3 - 2 * t); // smooth step
    camera.position.lerpVectors(startPos, newPos, e);
    controls.update();
    if (t < 1) requestAnimationFrame(animateSnap);
  }
  requestAnimationFrame(animateSnap);
}

function toggleCameraProjection() {
  isPerspective = !isPerspective;
  const currentPos = camera.position.clone();
  const currentTarget = controls.target.clone();
  const currentRotation = camera.rotation.clone();

  if (isPerspective) {
    camera = perspCamera;
  } else {
    const el = document.getElementById('viewportContainer');
    const W = el.offsetWidth || 600, H = el.offsetHeight || 500;
    const aspect = W / H;
    const frustumSize = camera.position.distanceTo(controls.target) * 0.8;

    orthoCamera.left = frustumSize * aspect / -2;
    orthoCamera.right = frustumSize * aspect / 2;
    orthoCamera.top = frustumSize / 2;
    orthoCamera.bottom = frustumSize / -2;
    orthoCamera.updateProjectionMatrix();
    camera = orthoCamera;
  }

  camera.position.copy(currentPos);
  camera.rotation.copy(currentRotation);
  controls.object = camera;
  controls.update();

  if (composer && composer.passes[0]) {
    composer.passes[0].camera = camera;
  }
}

// ─────────────────────────────────────────────────────────────
//  EVENTS
// ─────────────────────────────────────────────────────────────

function setupEvents() {
  document.querySelectorAll('.case-pill').forEach(btn =>
    btn.addEventListener('click', () => renderCase(btn.dataset.case))
  );

  // ── Raycasting & Mesh Selection ─────────────────────────────
  const el = document.getElementById('viewportContainer');
  if (el) {
    el.addEventListener('pointerdown', (e) => {
      clickStartX = e.clientX;
      clickStartY = e.clientY;
    });

    el.addEventListener('pointerup', (e) => {
      const dist = Math.sqrt((e.clientX - clickStartX)**2 + (e.clientY - clickStartY)**2);
      // Ensure we aren't raycasting on camera orbits (drag distance threshold)
      if (dist < 4) {
        const rect = el.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const meshes = [];
        bodyRoot.traverse(node => {
          if (node.isMesh && node.visible) meshes.push(node);
        });

        const intersects = raycaster.intersectObjects(meshes, true);
        if (intersects.length > 0) {
          selectObject(intersects[0].object);
          autoRotate = false; // stop auto-rotating on selection
        } else {
          selectObject(null); // Clicked background: clear selection
        }
      }
    });
  }

  // ── Keyboard Shortcuts (Z-Anatomy & Blender Standard) ───────
  window.addEventListener('keydown', (e) => {
    // Ignore hotkeys when typing in forms / input bars
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = e.key.toLowerCase();

    // H key actions
    if (key === 'h') {
      if (e.shiftKey) {
        hideUnselected();
      } else {
        hideSelected();
      }
    }
    // Alt + H to unhide all
    if (e.altKey && key === 'h') {
      showAllHidden();
    }

    // Local view toggle / slash key
    if (key === '/') {
      e.preventDefault();
      toggleLocalView();
    }

    // Snapping views (1, 3, 7, 9)
    if (key === '1') snapCameraTo(0, 0, 1.0);     // Front
    if (key === '3') snapCameraTo(1.0, 0, 0);     // Right
    if (key === '7') snapCameraTo(0, 1.0, 0.001); // Top (with tiny Z offset to avoid Orbit lock)
    if (key === '9') snapCameraTo(0, 0, -1.0);    // Back

    // Camera projection toggle
    if (key === '5') toggleCameraProjection();
  });

  // ── Collapsible Keyboard Shortcuts Legend ───────────────────
  const legendToggle = document.getElementById('legendToggle');
  const legendContent = document.getElementById('legendContent');
  if (legendToggle && legendContent) {
    legendToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = legendContent.style.display === 'none';
      legendContent.style.display = isHidden ? 'flex' : 'none';
      legendToggle.className = isHidden ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
    });
  }

  // ── Outliner Visibility Toggles ─────────────────────────────
  document.querySelectorAll('.outliner-item').forEach(item => {
    // When clicking the eye icon
    const toggle = item.querySelector('.vis-toggle');
    const layerId = item.dataset.layer;
    
    toggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      const group = loadedLayers[layerId];
      if (group) {
        group.visible = !group.visible;
        // Update UI
        item.classList.toggle('hidden', !group.visible);
        toggle.classList.toggle('fa-eye', group.visible);
        toggle.classList.toggle('fa-eye-slash', !group.visible);
      } else {
        console.log(`Layer ${layerId} is not loaded from file yet.`);
      }
    });

    // When clicking the row (expand/collapse animation demo)
    item.addEventListener('click', () => {
      item.classList.toggle('active');
    });
  });
  document.getElementById('btnReset')?.addEventListener('click', () => {
    const homePos    = new THREE.Vector3(0, 1.3, 3.2);
    const homeTarget = new THREE.Vector3(0, 1.35, 0);
    const startPos   = camera.position.clone();
    const startTarget = controls.target.clone();
    const DURATION   = 500;
    const start      = performance.now();

    function animateReset(now) {
      const t = Math.min((now - start) / DURATION, 1);
      const e = t * t * (3 - 2 * t);
      camera.position.lerpVectors(startPos, homePos, e);
      controls.target.lerpVectors(startTarget, homeTarget, e);
      controls.update();
      if (t < 1) requestAnimationFrame(animateReset);
      else { autoRotate = true; }
    }
    requestAnimationFrame(animateReset);
    selectObject(null);
  });

  const modal    = document.getElementById('uploadModal');
  const openBtn  = document.getElementById('uploadReportBtn');
  const closeBtn = document.getElementById('closeModal');
  const dropzone = document.getElementById('dropzone');
  const fileInput= document.getElementById('fileInput');
  const loader   = document.getElementById('modalLoader');

  openBtn?.addEventListener('click',  () => modal?.classList.add('open'));
  closeBtn?.addEventListener('click', () => modal?.classList.remove('open'));
  modal?.addEventListener('click', e => { if(e.target===modal) modal.classList.remove('open'); });

  dropzone?.addEventListener('click',    () => fileInput?.click());
  dropzone?.addEventListener('dragover', e  => { e.preventDefault(); dropzone.classList.add('hover'); });
  dropzone?.addEventListener('dragleave',()  => dropzone.classList.remove('hover'));
  dropzone?.addEventListener('drop', e => {
    e.preventDefault(); dropzone.classList.remove('hover');
    if(e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  });
  fileInput?.addEventListener('change', () => { if(fileInput.files[0]) processFile(fileInput.files[0]); });
  document.getElementById('analyzeBtn')?.addEventListener('click', () => {
    if(fileInput?.files[0]) processFile(fileInput.files[0]);
  });

  function processFile(file) {
    loader?.classList.add('show');
    setTimeout(() => {
      loader?.classList.remove('show');
      modal?.classList.remove('open');
      const n = file.name.toLowerCase();
      if      (n.includes('liver')||n.includes('fatty')||n.includes('ast')) renderCase('liver');
      else if (n.includes('kidney')||n.includes('stone')||n.includes('bun')) renderCase('kidneys');
      else renderCase('heart');
    }, 2200);
  }

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('agentdna_session');
    localStorage.removeItem('agentdna_token');
    window.location.href = 'login.html';
  });
}

// ─────────────────────────────────────────────────────────────
//  BOOT
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const s = JSON.parse(localStorage.getItem('agentdna_session')||'null');
  if (!s) console.warn('[AgentDNA] No session — will redirect in production.');
  initEngine();
  setupEvents();
  renderCase('heart');
});
