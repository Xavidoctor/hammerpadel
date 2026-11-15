// Escena 4 · Recogebolas: el Recogebolas Hammer rueda sobre el césped azul de una
// pista en penumbra y va recogiendo las pelotas que hay en el suelo; cada pelota
// entra por debajo de las varillas y se queda dentro de la cesta, que se va llenando.
// Se renderiza fotograma a fotograma (../escena-2/secuencia.mjs con ESCENA=escena-4)
// a un vídeo que Scroll Craft controla con el scroll. Sin servicios externos.
//
// Ejes: Y arriba. El recogebolas avanza por un camino en el plano XZ.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { materialPelota } from "../escena-2/comun.js";
import { texturaCesped } from "../escena-2/escena.js";
import { mulberry } from "../escena-2/maquina.js";
import { crearRecogebolas, texturaDisco, CESTA } from "./recogebolas.js";

const R_BOLA = 0.0335;
const ALTURA_EJE = CESTA.R * 1.03; // la cesta apoya en las puntas de las varillas
const suave = (t) => t * t * (3 - 2 * t);
const sat = (t) => Math.min(1, Math.max(0, t));

// Camino del recogebolas (XZ) y tramo de avance dentro de la escena.
const CAMINO = [[2.75, -1.6], [2.3, -1.3], [1.6, -0.55], [0.75, -0.6], [0.05, -0.15], [-0.4, 0.45], [-0.6, 0.95]];
const P_INICIO = 0.02, P_FIN = 0.84; // instante (0..1) en que arranca y se para
const N_BOLAS = 26;

export async function montar(canvas, w, h) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  r.setSize(w, h, false);
  r.setPixelRatio(1);
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.toneMapping = THREE.AgXToneMapping;
  r.toneMappingExposure = 1.0;
  r.outputColorSpace = THREE.SRGBColorSpace;
  const vertical = h > w;

  const FONDO = 0x05070d;
  const sc = new THREE.Scene();
  sc.background = new THREE.Color(FONDO);
  sc.fog = new THREE.Fog(FONDO, 2.8, 6.2);
  sc.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
  sc.environmentIntensity = 0.22;

  // ---------- suelo: césped artificial azul con una línea de pista ----------
  const [cesMap, cesBump] = texturaCesped(THREE);
  cesMap.repeat.set(14, 14); cesBump.repeat.set(14, 14);
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(14, 14),
    new THREE.MeshStandardMaterial({ color: 0x7d88a8, map: cesMap, bumpMap: cesBump, bumpScale: 1.2, roughness: 0.94 }));
  suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true; sc.add(suelo);
  const linea = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.05), new THREE.MeshStandardMaterial({ color: 0xe9edf5, roughness: 0.8 }));
  linea.rotation.x = -Math.PI / 2; linea.rotation.z = 0.5; linea.position.set(0.2, 0.002, -1.35); linea.receiveShadow = true; sc.add(linea);

  // ---------- luz: foco cenital frío + recorte + relleno muy bajo ----------
  sc.add(new THREE.HemisphereLight(0x8fa8ff, 0x060912, 0.12));
  const foco = new THREE.SpotLight(0xf2f5ff, 34, 14, 0.5, 0.9, 1.6);
  foco.position.set(0.6, 5.2, 1.6); foco.target.position.set(0.3, 0, -0.3);
  foco.castShadow = true; foco.shadow.mapSize.set(2048, 2048); foco.shadow.bias = -0.0003; foco.shadow.normalBias = 0.01; foco.shadow.radius = 3;
  sc.add(foco, foco.target);
  const recorte = new THREE.SpotLight(0xb9ccff, 26, 9, 0.7, 0.9, 1.6);
  recorte.position.set(-1.8, 1.6, -3.2); recorte.target.position.set(0.3, 0.1, -0.2);
  sc.add(recorte, recorte.target);
  const acentoLuz = new THREE.PointLight(0xd8ff3a, 0.6, 2.5, 2); // leve rebote amarillo de las pelotas
  sc.add(acentoLuz);

  // ---------- recogebolas ----------
  const logo = await texturaDisco(THREE, "/public/marca/hammer-logo.svg");
  const rb = crearRecogebolas(THREE, { logo });
  const cesta = rb.userData.cesta;
  sc.add(rb);
  const interior = new THREE.Group(); // marco del eje que no gira: aquí viven las pelotas recogidas
  rb.add(interior);

  const camino = new THREE.CatmullRomCurve3(CAMINO.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, "centripetal");
  const LARGO = camino.getLength();
  const pose = (s) => { // posición y orientación del recogebolas a s metros del inicio
    const u = sat(s / LARGO);
    const p = camino.getPointAt(u);
    const t = camino.getTangentAt(u);
    return { p, yaw: Math.atan2(t.x, t.z) };
  };
  const recorrido = (p) => { // metros avanzados en el instante p (arranque y frenada suaves)
    const t = sat((p - P_INICIO) / (P_FIN - P_INICIO));
    const e = t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
    return (0.15 * t + 0.85 * (t * 0.35 + e * 0.65)) * LARGO;
  };
  const colocar = (s) => {
    const { p, yaw } = pose(s);
    rb.position.set(p.x, ALTURA_EJE, p.z);
    rb.rotation.set(0, yaw, 0);
    cesta.rotation.x = s / ALTURA_EJE; // rueda sin deslizar
    rb.updateMatrixWorld(true);
  };

  // ---------- pelotas en el suelo, sobre el recorrido (todas acaban dentro) ----------
  const fieltro = materialPelota(THREE).clone();
  fieltro.color.setRGB(1, 1, 0.62); // algo más saturada: con la luz fría el fieltro se iba a crema
  const rnd = mulberry(11);
  const huecos = huecosCesta();
  const bolas = [];
  const ocupadas = [];
  let intento = 0;
  while (bolas.length < N_BOLAS && intento++ < 5000) {
    const s = 0.35 + rnd() * (LARGO - 0.55);
    const lado = (rnd() - 0.5) * (CESTA.L - 2 * R_BOLA - 0.03);
    const { p, yaw } = pose(s);
    const x = p.x + Math.cos(yaw) * lado, z = p.z - Math.sin(yaw) * lado;
    if (ocupadas.some(([ox, oz]) => Math.hypot(ox - x, oz - z) < 2 * R_BOLA + 0.025)) continue;
    ocupadas.push([x, z]);
    const m = new THREE.Mesh(new THREE.SphereGeometry(R_BOLA, 32, 24), fieltro);
    m.castShadow = true; m.receiveShadow = true;
    const giro = new THREE.Euler(rnd() * 6, rnd() * 6, rnd() * 6);
    m.rotation.copy(giro);
    m.position.set(x, R_BOLA, z);
    sc.add(m);
    bolas.push({ m, s, lado, suelo: new THREE.Vector3(x, R_BOLA, z), giro });
  }
  // la primera pelota que entra ocupa el hueco más bajo
  bolas.sort((a, b) => a.s - b.s);
  bolas.forEach((b, i) => { b.hueco = huecos[i]; });
  // ---------- cámara ----------
  const cam = new THREE.PerspectiveCamera(vertical ? 46 : 32, w / h, 0.05, 40);
  const objetivo = new THREE.Vector3();
  const ENTRA = 0.12, VIAJE = 0.22; // la pelota empieza a entrar ENTRA m antes del eje y tarda VIAJE m
  const tmp = new THREE.Vector3();

  function fotograma(p) {
    const s = recorrido(p);
    // pose en el instante en que cada pelota empieza a entrar (para enlazar suelo → cesta sin saltos)
    for (const b of bolas) {
      const u = sat((s - (b.s - ENTRA)) / VIAJE);
      if (u <= 0) { b.m.parent !== sc && sc.add(b.m); b.m.position.copy(b.suelo); b.m.rotation.copy(b.giro); continue; }
      if (!b.local0) { colocar(Math.max(0, b.s - ENTRA)); b.local0 = interior.worldToLocal(b.suelo.clone()); }
      if (b.m.parent !== interior) interior.add(b.m);
      // entra por abajo, empujada por las varillas, sube y cae a su hueco
      const e = suave(u);
      const a = b.local0, c = b.hueco;
      const ctrl = new THREE.Vector3((a.x + c.x) / 2, -ALTURA_EJE + R_BOLA + 0.07, 0.02);
      const q = 1 - e;
      tmp.set(0, 0, 0).addScaledVector(a, q * q).addScaledVector(ctrl, 2 * q * e).addScaledVector(c, e * e);
      b.m.position.copy(tmp);
      b.m.rotation.set(b.giro.x + s / R_BOLA * 0.35 * (u < 1 ? u : 1), b.giro.y, b.giro.z + s * 1.5);
    }
    colocar(s);
    // con la cesta en marcha la carga se arrastra un poco hacia delante
    const v = recorrido(Math.min(1, p + 0.01)) - s;
    interior.rotation.x = Math.min(0.3, v * 6);

    // cámara: plano picado 3/4 que acompaña al recogebolas y al final se acerca a la cesta llena
    // en móvil (9:16) el camino se ve en profundidad: el recogebolas viene hacia la cámara
    const fin = suave(sat((p - 0.8) / 0.2));
    const { p: pr } = pose(s);
    objetivo.set(pr.x, 0.12, pr.z).lerp(new THREE.Vector3(0.95, 0.1, -0.55), (vertical ? 0.2 : 0.3) * (1 - fin));
    const dist = (vertical ? 2.6 : 2.75) - fin * (vertical ? 0.95 : 1.05);
    const ang = vertical ? -0.62 + 0.32 * p : -0.05 + 0.25 * p;
    const alt = (vertical ? 1.75 : 1.45) - fin * (vertical ? 0.75 : 0.6);
    cam.position.set(objetivo.x + Math.sin(ang) * dist, alt, objetivo.z + Math.cos(ang) * dist);
    cam.lookAt(objetivo);
    // el texto va a la izquierda en escritorio y arriba en móvil: la acción se desplaza al lado libre
    if (vertical) cam.setViewOffset(w, h, 0, -h * 0.13, w, h);
    else cam.setViewOffset(w, h, -w * 0.21, 0, w, h);
    acentoLuz.position.set(pr.x, 0.4, pr.z + 0.2);
    r.render(sc, cam);
  }
  return { fotograma };
}

// Huecos para las pelotas dentro de la cesta (marco del eje, Y arriba, Z adelante),
// de abajo arriba sin solaparse, como se apilan por gravedad.
export function huecosCesta() {
  const rIn = CESTA.R * 0.965 - 0.004 - R_BOLA, xMax = CESTA.L / 2 - 0.012 - R_BOLA;
  const cand = [];
  const rnd = mulberry(5);
  for (let i = 0; i < 9000; i++) {
    const x = (rnd() * 2 - 1) * xMax, y = (rnd() * 2 - 1) * rIn, z = (rnd() * 2 - 1) * rIn;
    if (Math.hypot(y, z) <= rIn) cand.push(new THREE.Vector3(x, y, z));
  }
  cand.sort((a, b) => (a.y + Math.abs(a.z) * 0.15) - (b.y + Math.abs(b.z) * 0.15));
  const ok = [];
  for (const c of cand) {
    if (ok.every((o) => o.distanceTo(c) >= 2 * R_BOLA * 1.01)) ok.push(c);
    if (ok.length >= 40) break;
  }
  return ok;
}
