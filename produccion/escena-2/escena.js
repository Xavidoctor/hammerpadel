// Escena 2 · Entrenamiento: pista nocturna, máquina Hammer al fondo lanzando
// bolas, y cámara que arranca junto a la máquina y vuela hasta el lado del
// jugador. Se renderiza fotograma a fotograma (render.mjs) a un vídeo que
// Scroll Craft controla con el scroll. Sin servicios externos.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { crearMaquina, mulberry } from "./maquina.js";
import { texturaLogo } from "./comun.js";

export const GOLPES = [
  { id: "derecha", x: 2.6, z: 16.2, alto: 3.4 },
  { id: "reves", x: -2.7, z: 16.4, alto: 3.4 },
  { id: "bandeja", x: 1.8, z: 18.6, alto: 4.6 },
  { id: "vibora", x: -1.6, z: 18.8, alto: 4.4 },
  { id: "volea", x: 1.1, z: 12.6, alto: 1.9 },
  { id: "desplazamiento", x: -3.9, z: 13.4, alto: 2.8 },
  { id: "repeticion", x: 2.4, z: 16.0, alto: 3.4 },
];
export const SALIDAS = GOLPES.map((_, i) => 0.03 + i * 0.1); // instante normalizado de cada lanzamiento
const DURACION = 6.5; // segundos de "tiempo real" que representa la escena
const G = 9.81;
const MAQ_Z = 1.3;

export async function montar(canvas, w, h) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  r.setSize(w, h, false);
  r.setPixelRatio(1);
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.toneMapping = THREE.AgXToneMapping;
  r.toneMappingExposure = 1.15;
  r.outputColorSpace = THREE.SRGBColorSpace;

  const sc = new THREE.Scene();
  sc.background = new THREE.Color(0x04060b);
  sc.fog = new THREE.Fog(0x04060b, 26, 60);
  sc.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
  sc.environmentIntensity = 0.18;

  // ---------- pista ----------
  const sueloTex = texturaCesped(THREE);
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(10, 20), new THREE.MeshStandardMaterial({ color: 0x2a62ff, map: sueloTex, roughness: 0.9 }));
  suelo.rotation.x = -Math.PI / 2; suelo.position.set(0, 0, 10); suelo.receiveShadow = true; sc.add(suelo);
  const fuera = new THREE.Mesh(new THREE.PlaneGeometry(40, 50), new THREE.MeshStandardMaterial({ color: 0x0a1430, roughness: 1 }));
  fuera.rotation.x = -Math.PI / 2; fuera.position.set(0, -0.003, 10); fuera.receiveShadow = true; sc.add(fuera);
  const lineaMat = new THREE.MeshStandardMaterial({ color: 0xf2f4f8, roughness: 0.7 });
  const linea = (x1, z1, x2, z2) => {
    const L = Math.hypot(x2 - x1, z2 - z1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 === x2 ? 0.05 : L, x1 === x2 ? L : 0.05), lineaMat);
    m.rotation.x = -Math.PI / 2; m.position.set((x1 + x2) / 2, 0.002, (z1 + z2) / 2); m.receiveShadow = true; sc.add(m);
  };
  linea(-5, 0, 5, 0); linea(-5, 20, 5, 20); linea(-5, 0, -5, 20); linea(5, 0, 5, 20);
  linea(-5, 3.05, 5, 3.05); linea(-5, 16.95, 5, 16.95); linea(0, 3.05, 0, 16.95);

  // red
  const redTex = texturaRed(THREE);
  const red = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.88), new THREE.MeshStandardMaterial({ map: redTex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide, roughness: 0.9 }));
  red.position.set(0, 0.44, 10); red.castShadow = true; sc.add(red);
  const cinta = new THREE.Mesh(new THREE.BoxGeometry(10.05, 0.05, 0.01), lineaMat); cinta.position.set(0, 0.88, 10); sc.add(cinta);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.95, 12), new THREE.MeshStandardMaterial({ color: 0x15171b })); p.position.set(s * 5.05, 0.47, 10); sc.add(p); }

  // cristales y malla
  const cristal = new THREE.MeshPhysicalMaterial({ color: 0x9fb4d8, transparent: true, opacity: 0.08, roughness: 0.05, metalness: 0, envMapIntensity: 2, side: THREE.DoubleSide });
  const perfil = new THREE.MeshStandardMaterial({ color: 0x15181d, roughness: 0.5, metalness: 0.6 });
  const pared = (w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), cristal); m.position.set(x, y, z); m.rotation.y = ry; sc.add(m); };
  pared(10, 3, 0, 1.5, 0, 0); pared(10, 3, 0, 1.5, 20, 0);
  for (const s of [-1, 1]) { pared(4, 3, s * 5, 1.5, 2, Math.PI / 2); pared(4, 3, s * 5, 1.5, 18, Math.PI / 2); }
  const mallaTex = texturaMalla(THREE);
  for (const s of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(12, 4), new THREE.MeshStandardMaterial({ map: mallaTex, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide, color: 0x6b7280 }));
    m.rotation.y = Math.PI / 2; m.position.set(s * 5, 2, 10); sc.add(m);
  }
  for (const z of [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]) for (const s of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.06, 4, 0.06), perfil); p.position.set(s * 5.03, 2, z); sc.add(p);
  }
  for (const x of [-5, -2.5, 2.5, 5]) for (const z of [0, 20]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3, 0.06), perfil); p.position.set(x, 1.5, z); sc.add(p); }

  // focos: 4 postes con proyector, dos proyectan sombra
  sc.add(new THREE.HemisphereLight(0x9fb6ff, 0x0b1020, 0.25));
  const focos = [[-5.7, 4], [5.7, 4], [-5.7, 16], [5.7, 16]];
  focos.forEach(([x, z], i) => {
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 6.2, 10), perfil); poste.position.set(x, 3.1, z); sc.add(poste);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.35), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xeef3ff, emissiveIntensity: 4 }));
    cab.position.set(x * 0.95, 6.2, z); cab.rotation.z = Math.sign(x) * 0.5; sc.add(cab);
    const L = new THREE.SpotLight(0xf3f6ff, 95, 32, 0.95, 0.7, 1.5);
    L.position.set(x * 0.95, 6.2, z); L.target.position.set(-x * 0.15, 0, z + (z < 10 ? 2 : -2));
    sc.add(L, L.target);
    if (i < 2 || i === 3) { L.castShadow = true; L.shadow.mapSize.set(1024, 1024); L.shadow.bias = -0.0004; L.shadow.radius = 4; }
  });

  // ---------- máquina ----------
  const logo = await texturaLogo(THREE, "/public/marca/hammer-logo.svg");
  const maq = crearMaquina(THREE, { logo });
  maq.position.set(0, 0, MAQ_Z);
  sc.add(maq);
  const salida = maq.userData.salida.clone().add(maq.position);

  // ---------- bolas ----------
  const fieltro = new THREE.MeshStandardMaterial({ color: 0xd4f53a, roughness: 0.9, emissive: 0x6a8a00, emissiveIntensity: 0.55 });
  const costura = texturaBola(THREE); fieltro.map = costura;
  const bolas = GOLPES.map((gp, i) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.0335, 24, 16), fieltro);
    b.castShadow = true; b.visible = false; sc.add(b);
    // estela: cinta luminosa que se reconstruye en cada fotograma
    const n = 24;
    const estela = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 0xd8ff3a, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
    estela.frustumCulled = false; sc.add(estela);
    const marca = new THREE.Mesh(new THREE.CircleGeometry(0.16, 32), new THREE.MeshBasicMaterial({ color: 0xd8ff3a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    marca.rotation.x = -Math.PI / 2; marca.position.set(gp.x, 0.004, gp.z); sc.add(marca);
    const vuelo = planificar(salida, gp);
    return { b, estela, n, vuelo, marca, tBote: vuelo.T };
  });

  // ---------- cámara: de la máquina al lado del jugador ----------
  const cam = new THREE.PerspectiveCamera(36, w / h, 0.05, 120);
  const vertical = h > w;
  // 1) primer plano 3/4 de la máquina; 2) rodea por detrás y sube (las bolas
  // salen hacia la pista); 3) vista alta desde detrás de la máquina con todos los botes.
  const Z = MAQ_Z;
  // La cámara rodea la máquina a cierta distancia y no deja de mirarla hasta
  // quedar detrás; solo entonces el punto de mira avanza hacia la pista.
  const ruta = new THREE.CatmullRomCurve3(vertical ? [
    new THREE.Vector3(0.95, 0.55, Z + 1.9), new THREE.Vector3(2.0, 1.0, Z + 0.3),
    new THREE.Vector3(0.8, 1.35, Z - 1.5), new THREE.Vector3(0.5, 1.6, Z - 2.1), new THREE.Vector3(0.22, 1.75, Z - 2.4),
  ] : [
    new THREE.Vector3(1.05, 0.5, Z + 2.1), new THREE.Vector3(1.8, 0.8, Z + 0.35),
    new THREE.Vector3(0.85, 1.1, Z - 1.4), new THREE.Vector3(0.5, 1.25, Z - 1.8), new THREE.Vector3(0.28, 1.4, Z - 2.3),
  ], false, "centripetal");
  const mira = new THREE.CatmullRomCurve3(vertical ? [
    new THREE.Vector3(0, 0.42, Z), new THREE.Vector3(0, 0.42, Z + 0.25),
    new THREE.Vector3(0, 0.4, Z + 1.8), new THREE.Vector3(0, 0.2, 5), new THREE.Vector3(0, 0.0, 6.5),
  ] : [
    new THREE.Vector3(0, 0.42, Z), new THREE.Vector3(0, 0.45, Z + 0.4),
    new THREE.Vector3(0, 0.45, Z + 2.2), new THREE.Vector3(0, 0.15, 6), new THREE.Vector3(0, 0.0, 6.5),
  ], false, "centripetal");
  cam.fov = vertical ? 62 : 46;

  const suave = (t) => t * t * (3 - 2 * t);
  function fotograma(p) {
    const tc = suave(Math.min(1, Math.max(0, p)));
    cam.position.copy(ruta.getPoint(tc));
    cam.lookAt(mira.getPoint(tc));
    cam.aspect = w / h; cam.updateProjectionMatrix();
    bolas.forEach((o, i) => {
      const ts = (p - SALIDAS[i]) * DURACION;
      const tb = ts - o.tBote;
      o.marca.material.opacity = tb < 0 ? 0 : 0.5 * Math.min(1, tb * 6) * (0.55 + 0.45 * Math.exp(-tb * 3));
      o.marca.scale.setScalar(tb < 0 ? 0.01 : 0.6 + 0.4 * Math.min(1, tb * 4));
      if (ts < 0) { o.b.visible = false; o.estela.visible = false; return; }
      const pos = o.vuelo(ts);
      o.b.visible = !!pos; o.estela.visible = !!pos;
      if (!pos) return;
      o.b.position.copy(pos);
      o.b.rotation.x = -ts * 25; o.b.rotation.z = ts * 6;
      const pts = [];
      for (let k = 0; k < o.n; k++) pts.push(o.vuelo(Math.max(0, ts - (o.n - 1 - k) * 0.009)) || pos);
      o.estela.geometry.dispose();
      o.estela.geometry = estelaGeo(THREE, pts, vertical ? 0.012 : 0.0075);
    });
    r.render(sc, cam);
  }
  return { fotograma };
}

// Trayectoria con un bote: sale de la boca, alcanza "alto", bota en (x, z) y sigue.
function planificar(o, { x, z, alto }) {
  const vy = Math.sqrt(2 * G * Math.max(0.3, alto - o.y));
  const T = (vy + Math.sqrt(vy * vy + 2 * G * o.y)) / G;
  const vx = (x - o.x) / T, vz = (z - o.z) / T;
  const vyImp = vy - G * T;
  const vy2 = -vyImp * 0.62, vx2 = vx * 0.78, vz2 = vz * 0.78;
  const f = (t) => {
    if (t < T) return new THREE.Vector3(o.x + vx * t, o.y + vy * t - 0.5 * G * t * t, o.z + vz * t);
    const u = t - T;
    if (u > 1.0) return null;
    return new THREE.Vector3(x + vx2 * u, Math.max(0.0335, vy2 * u - 0.5 * G * u * u), z + vz2 * u);
  };
  f.T = T;
  return f;
}

function lienzo(w, h, f) { const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d"), w, h); return c; }
function texturaCesped(THREE) {
  const rnd = mulberry(3);
  const c = lienzo(1024, 1024, (x, w, h) => {
    x.fillStyle = "#2f5fd6"; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 90000; i++) { const v = 150 + rnd() * 105; x.fillStyle = `rgba(${v * 0.35},${v * 0.55},${v},${0.08 + rnd() * 0.08})`; x.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1 + rnd() * 3); }
  });
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(5, 10); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
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
  const c = lienzo(512, 512, (x, w, h) => {
    x.clearRect(0, 0, w, h); x.strokeStyle = "rgba(200,205,215,0.55)"; x.lineWidth = 1;
    for (let i = -h; i <= w; i += 16) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.stroke(); x.beginPath(); x.moveTo(i + h, 0); x.lineTo(i, h); x.stroke(); }
  });
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(12, 4); return t;
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
