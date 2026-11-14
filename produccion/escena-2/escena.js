// Escena 2 · Entrenamiento: pista nocturna de pádel con la máquina Hammer en
// primer plano lanzando cada tipo de bola a su zona. La cámara arranca detrás de
// la máquina (lado derecho) y la rodea hasta el mismo ángulo del lado opuesto.
// Se renderiza fotograma a fotograma (secuencia.mjs) a un vídeo que Scroll Craft
// controla con el scroll. Sin servicios externos.
//
// Ejes: X a lo ancho (10 m), Z a lo largo (20 m, red en z = 10), Y arriba.
// La máquina está en su fondo de pista (z ≈ 1.3) y lanza hacia +Z. El jugador
// está en la otra mitad mirando a la máquina: su derecha es +X.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { crearMaquina, mulberry } from "./maquina.js";
import { texturaLogo } from "./comun.js";

// Cada golpe: una o varias bolas. "bote" = la bola bota en (x, z) y se golpea
// al subir; "aire" = se golpea sin bote en (x, y, z). "alto" = altura máxima.
export const GOLPES = [
  { id: "derecha", bolas: [{ bote: [2.4, 14.4], alto: 2.1 }] },
  { id: "reves", bolas: [{ bote: [-2.4, 14.4], alto: 2.1 }] },
  { id: "bandeja", bolas: [{ aire: [1.7, 2.5, 15.6], alto: 6.2 }] },          // globo alto, se golpea por encima del hombro
  { id: "vibora", bolas: [{ aire: [-1.5, 2.6, 15.2], alto: 5.4 }] },          // globo algo más tenso
  { id: "volea", bolas: [{ aire: [1.2, 1.05, 12.0], alto: 1.55 }] },          // bola tensa a la red, sin bote
  { id: "desplazamiento", bolas: [{ bote: [3.7, 14.0], alto: 1.9 }, { bote: [-3.7, 14.0], alto: 1.9, dp: 0.045 }] },
  { id: "repeticion", bolas: [{ bote: [2.4, 14.4], alto: 2.1 }, { bote: [2.4, 14.4], alto: 2.1, dp: 0.03 }, { bote: [2.4, 14.4], alto: 2.1, dp: 0.06 }] },
];
export const SALIDAS = GOLPES.map((_, i) => 0.03 + i * 0.1); // instante normalizado de cada golpe
const DURACION = 8; // segundos de "tiempo real" que representa la escena
const G = 9.81;
const MAQ_Z = 1.3;
const R_BOLA = 0.0335;
const T_GOLPE = 0.36; // tras el bote, la bola sube hasta el punto de golpeo

export async function montar(canvas, w, h) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  r.setSize(w, h, false);
  r.setPixelRatio(1);
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.toneMapping = THREE.AgXToneMapping;
  r.toneMappingExposure = 1.05;
  r.outputColorSpace = THREE.SRGBColorSpace;
  const vertical = h > w;

  const sc = new THREE.Scene();
  sc.background = new THREE.Color(0x03050a);
  sc.fog = new THREE.Fog(0x03050a, 24, 55);
  sc.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
  sc.environmentIntensity = 0.16;

  // ---------- suelo: césped artificial azul con arena ----------
  const [cesMap, cesBump] = texturaCesped(THREE);
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(10, 20),
    new THREE.MeshStandardMaterial({ color: 0xffffff, map: cesMap, bumpMap: cesBump, bumpScale: 1.4, roughness: 0.93 }));
  suelo.rotation.x = -Math.PI / 2; suelo.position.set(0, 0, 10); suelo.receiveShadow = true; sc.add(suelo);
  const fuera = new THREE.Mesh(new THREE.PlaneGeometry(60, 70), new THREE.MeshStandardMaterial({ color: 0x0b0d12, roughness: 0.95 }));
  fuera.rotation.x = -Math.PI / 2; fuera.position.set(0, -0.004, 10); fuera.receiveShadow = true; sc.add(fuera);
  // líneas de 5 cm: fondo, servicio (a 6,95 m de la red) y central
  const lineaMat = new THREE.MeshStandardMaterial({ color: 0xf4f6fa, roughness: 0.75 });
  const linea = (x1, z1, x2, z2) => {
    const L = Math.hypot(x2 - x1, z2 - z1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 === x2 ? 0.05 : L, x1 === x2 ? L : 0.05), lineaMat);
    m.rotation.x = -Math.PI / 2; m.position.set((x1 + x2) / 2, 0.003, (z1 + z2) / 2); m.receiveShadow = true; sc.add(m);
  };
  linea(-5, 3.05, 5, 3.05); linea(-5, 16.95, 5, 16.95); linea(0, 3.05, 0, 16.95);
  linea(0, 0, 0, 0.2); linea(0, 19.8, 0, 20);

  // ---------- red: 0,88 m en el centro, 0,92 m en los postes ----------
  const redTex = texturaRed(THREE);
  const red = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.8), new THREE.MeshStandardMaterial({ map: redTex, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide, roughness: 0.9 }));
  red.position.set(0, 0.47, 10); red.castShadow = true; sc.add(red);
  const curvaCinta = new THREE.CatmullRomCurve3(Array.from({ length: 21 }, (_, k) => { const x = -5 + k * 0.5; return new THREE.Vector3(x, 0.88 + 0.04 * (x / 5) ** 2, 10); }));
  const cinta = new THREE.Mesh(new THREE.TubeGeometry(curvaCinta, 80, 0.02, 8), lineaMat);
  cinta.castShadow = true; sc.add(cinta);
  const perfil = new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: 0.45, metalness: 0.7 });
  for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.08), perfil); p.position.set(sx * 5.06, 0.5, 10); p.castShadow = true; sc.add(p); }

  // ---------- cerramiento: cristal templado + malla electrosoldada ----------
  const cristal = new THREE.MeshPhysicalMaterial({ color: 0xa9bbd9, transparent: true, opacity: 0.1, roughness: 0.04, metalness: 0, envMapIntensity: 3, specularIntensity: 1, side: THREE.DoubleSide, depthWrite: false });
  const canto = new THREE.MeshStandardMaterial({ color: 0x7f9bb5, transparent: true, opacity: 0.35, roughness: 0.2 });
  const panel = (ancho, alto, x, z, ry) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(ancho - 0.02, alto), cristal); m.position.set(x, alto / 2, z); m.rotation.y = ry; m.renderOrder = 2; sc.add(m);
    const c = new THREE.Mesh(new THREE.BoxGeometry(ancho - 0.02, 0.012, 0.012), canto); c.position.set(x, alto, z); c.rotation.y = ry; sc.add(c); // canto superior del vidrio
    for (const dy of [0.35, alto - 0.35]) for (const dx of [-1, 1]) { // herrajes
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.03, 10), perfil);
      const off = (ancho / 2 - 0.12) * dx;
      t.position.set(x + (ry ? 0 : off), dy, z + (ry ? off : 0)); t.rotation[ry ? "z" : "x"] = Math.PI / 2; sc.add(t);
    }
  };
  const mallaTex = texturaMalla(THREE);
  const malla = (ancho, alto, x, y0, z, ry) => {
    const t = mallaTex.clone(); t.needsUpdate = true; t.repeat.set(ancho * 1.25, alto * 1.25);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(ancho, alto), new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.2, side: THREE.DoubleSide, color: 0x8b93a1, roughness: 0.5, metalness: 0.6 }));
    m.position.set(x, y0 + alto / 2, z); m.rotation.y = ry; sc.add(m);
  };
  // fondos: 4 paños de cristal de 3 m + malla hasta 4 m
  for (const z of [0, 20]) {
    for (const x of [-3.75, -1.25, 1.25, 3.75]) panel(2.5, 3, x, z, 0);
    malla(10, 1, 0, 3, z, 0);
  }
  // laterales: 2 m de cristal de 3 m, 2 m escalonados de 2 m, malla en el centro (4 m)
  for (const sx of [-1, 1]) for (const [z0, z1, alto] of [[0, 2, 3], [2, 4, 2], [16, 18, 2], [18, 20, 3]]) {
    panel(z1 - z0, alto, sx * 5, (z0 + z1) / 2, Math.PI / 2);
    malla(z1 - z0, 4 - alto, sx * 5, alto, (z0 + z1) / 2, Math.PI / 2);
  }
  for (const sx of [-1, 1]) { malla(5, 4, sx * 5, 0, 6.5, Math.PI / 2); malla(5, 4, sx * 5, 0, 13.5, Math.PI / 2); } // dejando las puertas junto a la red
  for (const z of [0, 2, 4, 9, 11, 16, 18, 20]) for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4, 0.08), perfil); p.position.set(sx * 5.04, 2, z); p.castShadow = true; sc.add(p); }
  // los paños de los fondos van unidos con herrajes, sin postes intermedios (la cámara pasa por detrás)
  for (const sx of [-1, 1]) { const v = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 20.1), perfil); v.position.set(sx * 5.04, 4, 10); sc.add(v); }
  for (const z of [0, 20]) { const v = new THREE.Mesh(new THREE.BoxGeometry(10.1, 0.06, 0.06), perfil); v.position.set(0, 4, z); sc.add(v); }

  // ---------- iluminación: 4 postes laterales con 2 proyectores LED ----------
  sc.add(new THREE.HemisphereLight(0x9fb6ff, 0x0b1020, 0.22));
  const ledMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf4f7ff, emissiveIntensity: 6 });
  const carcasa = new THREE.MeshStandardMaterial({ color: 0x22252b, roughness: 0.4, metalness: 0.8 });
  [[-5.35, 5], [5.35, 5], [-5.35, 15], [5.35, 15]].forEach(([x, z], i) => {
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 6.6, 12), carcasa); poste.position.set(x, 3.3, z); sc.add(poste);
    for (const dz of [-0.35, 0.35]) {
      const g = new THREE.Group(); g.position.set(x * 0.97, 6.55, z + dz); g.rotation.z = Math.sign(x) * 0.6;
      const caja = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.42), carcasa); g.add(caja);
      const led = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.36), ledMat); led.rotation.x = Math.PI / 2; led.position.y = -0.037; g.add(led);
      sc.add(g);
    }
    const L = new THREE.SpotLight(0xf3f6ff, 80, 34, 1.0, 0.75, 1.5);
    L.position.set(x * 0.97, 6.5, z); L.target.position.set(-x * 0.2, 0, z + (z < 10 ? 1.5 : -1.5));
    sc.add(L, L.target);
    L.castShadow = true; L.shadow.mapSize.set(1024, 1024); L.shadow.bias = -0.0004; L.shadow.normalBias = 0.02; L.shadow.radius = 4;
  });

  // ---------- máquina ----------
  const logo = await texturaLogo(THREE, "/public/marca/hammer-logo.svg");
  const maq = crearMaquina(THREE, { logo });
  maq.position.set(0, 0, MAQ_Z);
  sc.add(maq);
  const salida = maq.userData.salida.clone().add(maq.position);

  // ---------- bolas ----------
  const fieltro = new THREE.MeshStandardMaterial({ color: 0xd4f53a, roughness: 0.9, emissive: 0x6a8a00, emissiveIntensity: 0.6, map: texturaBola(THREE) });
  const acento = 0xd8ff3a;
  const lanz = [];
  GOLPES.forEach((gp, i) => gp.bolas.forEach((d) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(R_BOLA, 24, 16), fieltro);
    b.castShadow = true; b.visible = false; sc.add(b);
    const estela = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: acento, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    estela.frustumCulled = false; sc.add(estela);
    const vuelo = planificar(salida, d);
    // marca de bote (solo golpes con bote) y zona de golpeo en el suelo
    const marca = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.15, 40), new THREE.MeshBasicMaterial({ color: acento, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    marca.rotation.x = -Math.PI / 2; marca.position.set(vuelo.bote.x, 0.005, vuelo.bote.z); marca.visible = !!d.bote; sc.add(marca);
    const zona = new THREE.Mesh(new THREE.CircleGeometry(0.42, 48), new THREE.MeshBasicMaterial({ color: acento, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    zona.rotation.x = -Math.PI / 2; zona.position.set(vuelo.golpe.x, 0.004, vuelo.golpe.z); sc.add(zona);
    // destello en el punto de golpeo (anillo orientado a cámara)
    const destello = new THREE.Mesh(new THREE.RingGeometry(0.07, 0.1, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    destello.position.copy(vuelo.golpe); sc.add(destello);
    lanz.push({ b, estela, vuelo, marca, zona, destello, t0: SALIDAS[i] + (d.dp || 0) });
  }));

  // ---------- cámara ----------
  // Arranca detrás de la máquina, a su derecha (la máquina en primer plano abajo a la
  // derecha y la pista al fondo) y la rodea hasta el ángulo simétrico del otro lado.
  const cam = new THREE.PerspectiveCamera(vertical ? 62 : 50, w / h, 0.05, 120);
  const A0 = vertical ? 0.5 : 0.62;            // ángulo inicial respecto al eje de la pista
  const RADIO = vertical ? 1.3 : 2.1;          // distancia horizontal a la máquina
  const suave = (t) => t * t * (3 - 2 * t);

  // ---------- postproceso: brillo suave en focos y estelas ----------
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 4 });
  const comp = new EffectComposer(r, rt);
  comp.setPixelRatio(1); comp.setSize(w, h);
  comp.addPass(new RenderPass(sc, cam));
  comp.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.35, 0.5, 2.5));
  comp.addPass(new OutputPass());

  const tmp = new THREE.Vector3();
  function fotograma(p) {
    const tc = suave(Math.min(1, Math.max(0, p)));
    const a = A0 * (1 - 2 * tc);                       // +A0 -> -A0
    const k = 1 - Math.abs(1 - 2 * tc);                // 0 en los extremos, 1 en el centro
    const rad = RADIO + 0.35 * k;
    cam.position.set(Math.sin(a) * rad, (vertical ? 1.42 : 1.45) + 0.75 * k, MAQ_Z - Math.cos(a) * rad);
    if (vertical) cam.lookAt(-Math.sin(a) * 0.9, 0.25, MAQ_Z + 3.2);
    else cam.lookAt(-Math.sin(a) * 1.4, 0.3, MAQ_Z + 4);
    cam.aspect = w / h; cam.updateProjectionMatrix();

    for (const o of lanz) {
      const ts = (p - o.t0) * DURACION;
      const f = o.vuelo;
      // marca de bote y zona: aparecen y se quedan tenues
      const tb = ts - f.T;
      o.marca.material.opacity = tb < 0 ? 0 : 0.75 * Math.min(1, tb * 8) * (0.35 + 0.65 * Math.exp(-tb * 2.5));
      o.marca.scale.setScalar(tb < 0 ? 0.01 : 0.7 + 0.5 * Math.min(1, tb * 3));
      const tg = ts - f.TG;
      o.zona.material.opacity = ts < 0 ? 0 : Math.min(0.16, ts * 0.12) * (tg > 0 ? 0.5 + 0.5 * Math.exp(-tg * 2) : 1);
      o.destello.material.opacity = tg < 0 ? 0 : 0.9 * Math.exp(-tg * 8);
      o.destello.scale.setScalar(tg < 0 ? 0.01 : 1 + tg * 4);
      o.destello.lookAt(cam.position);
      if (ts < 0 || tg > 0) { o.b.visible = false; o.estela.visible = false; continue; }
      const pos = f(ts);
      o.b.visible = true; o.estela.visible = true;
      o.b.position.copy(pos);
      o.b.rotation.x = -ts * 25; o.b.rotation.z = ts * 6;
      const pts = [];
      for (let j = 0; j < 20; j++) pts.push(f(Math.max(0, ts - (19 - j) * 0.008)));
      o.estela.geometry.dispose();
      o.estela.geometry = estelaGeo(THREE, pts, vertical ? 0.012 : 0.0085);
    }
    comp.render();
  }
  return { fotograma };
}

// Trayectoria desde la boca. Con bote: alcanza "alto", bota en (x, z), sube y se
// golpea T_GOLPE s después. Sin bote: llega al punto de golpeo (x, y, z) bajando.
function planificar(o, d) {
  const alto = Math.max(d.alto, o.y + 0.3);
  const vy = Math.sqrt(2 * G * (alto - o.y));
  let x, z, yF;
  if (d.bote) { [x, z] = d.bote; yF = R_BOLA; } else { [x, , z] = d.aire; yF = d.aire[1]; }
  const T = (vy + Math.sqrt(Math.max(0, vy * vy - 2 * G * (yF - o.y)))) / G;
  const vx = (x - o.x) / T, vz = (z - o.z) / T;
  const vy2 = -(vy - G * T) * 0.6, vx2 = vx * 0.75, vz2 = vz * 0.75;
  const f = (t) => {
    if (t <= T || !d.bote) return new THREE.Vector3(o.x + vx * t, o.y + vy * t - 0.5 * G * t * t, o.z + vz * t);
    const u = t - T;
    return new THREE.Vector3(x + vx2 * u, Math.max(R_BOLA, R_BOLA + vy2 * u - 0.5 * G * u * u), z + vz2 * u);
  };
  f.T = d.bote ? T : Infinity;
  f.TG = d.bote ? T + T_GOLPE : T;
  f.bote = new THREE.Vector3(x, 0, z);
  f.golpe = f(f.TG);
  return f;
}

function lienzo(w, h, f) { const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d"), w, h); return c; }
function texturaCesped(THREE) {
  // fibras azules con brillo variable + granos de arena; el relieve sale de la misma semilla
  const rnd = mulberry(3), rb = mulberry(3);
  const fibras = (x, w, h, color) => {
    for (let i = 0; i < 160000; i++) {
      const px = rnd() * w, py = rnd() * h, l = 2 + rnd() * 4, a = (rnd() - 0.5) * 0.9;
      x.strokeStyle = color(rnd()); x.lineWidth = 1;
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.sin(a) * l, py + Math.cos(a) * l); x.stroke();
    }
  };
  const c = lienzo(1024, 1024, (x, w, h) => {
    x.fillStyle = "#2251c4"; x.fillRect(0, 0, w, h);
    fibras(x, w, h, (v) => `rgba(${40 + v * 40},${85 + v * 60},${200 + v * 55},${0.25 + v * 0.25})`);
    for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(210,200,170,${0.08 + rnd() * 0.12})`; x.fillRect(rnd() * w, rnd() * h, 1.2, 1.2); }
  });
  const b = lienzo(1024, 1024, (x, w, h) => {
    x.fillStyle = "#808080"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 160000; i++) {
      const px = rb() * w, py = rb() * h, l = 2 + rb() * 4, a = (rb() - 0.5) * 0.9, v = rb();
      x.strokeStyle = `rgb(${120 + v * 135},${120 + v * 135},${120 + v * 135})`; x.lineWidth = 1;
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.sin(a) * l, py + Math.cos(a) * l); x.stroke();
    }
  });
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 12); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 16;
  const tb = new THREE.CanvasTexture(b); tb.wrapS = tb.wrapT = THREE.RepeatWrapping; tb.repeat.set(6, 12); tb.anisotropy = 16;
  return [t, tb];
}
function texturaRed(THREE) {
  const c = lienzo(1024, 96, (x, w, h) => {
    x.clearRect(0, 0, w, h); x.strokeStyle = "rgba(20,22,26,0.95)"; x.lineWidth = 1.2;
    for (let i = 0; i <= w; i += 6) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); }
    for (let j = 0; j <= h; j += 6) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); }
  });
  const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t;
}
function texturaMalla(THREE) {
  // malla electrosoldada cuadrada (~5 cm)
  const c = lienzo(512, 512, (x, w, h) => {
    x.clearRect(0, 0, w, h); x.fillStyle = "rgba(225,230,238,1)";
    for (let i = 0; i < w; i += 32) { x.fillRect(i, 0, 3, h); x.fillRect(0, i, w, 3); }
  });
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 16; return t;
}
function texturaBola(THREE) {
  const c = lienzo(256, 128, (x, w, h) => {
    x.fillStyle = "#ffffff"; x.fillRect(0, 0, w, h);
    x.strokeStyle = "rgba(255,255,255,1)"; x.fillStyle = "#e9f0d8"; x.lineWidth = 5; x.beginPath();
    for (let i = 0; i <= w; i++) { const y = h / 2 + Math.sin((i / w) * Math.PI * 4) * h * 0.22; i ? x.lineTo(i, y) : x.moveTo(i, y); }
    x.strokeStyle = "#f4f7ee"; x.stroke();
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function estelaGeo(THREE, pts, r) {
  // cinta cilíndrica que se afina hacia la cola
  const seg = 6, pos = [], idx = [];
  const tmp = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), side = new THREE.Vector3(), nrm = new THREE.Vector3();
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    tmp.subVectors(b, a); if (tmp.lengthSq() < 1e-9) tmp.set(0, 0, 1); tmp.normalize();
    side.crossVectors(tmp, up); if (side.lengthSq() < 1e-6) side.set(1, 0, 0); side.normalize();
    nrm.crossVectors(side, tmp).normalize();
    const rr = r * Math.pow(i / (pts.length - 1), 1.3);
    for (let k = 0; k < seg; k++) {
      const ang = (k / seg) * Math.PI * 2;
      pos.push(pts[i].x + (side.x * Math.cos(ang) + nrm.x * Math.sin(ang)) * rr, pts[i].y + (side.y * Math.cos(ang) + nrm.y * Math.sin(ang)) * rr, pts[i].z + (side.z * Math.cos(ang) + nrm.z * Math.sin(ang)) * rr);
    }
  }
  for (let i = 0; i < pts.length - 1; i++) for (let k = 0; k < seg; k++) {
    const a = i * seg + k, b = i * seg + ((k + 1) % seg), c = a + seg, d = b + seg; idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); return g;
}
