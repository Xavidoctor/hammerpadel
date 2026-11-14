// Modelo 3D de la máquina Hammer Padel (procedural, Three.js).
// Medidas de referencia del fabricante: 76,4 cm alto, 53 cm fondo, 37,3 cm ancho.
// Unidades: metros. Eje Y arriba, la boca de lanzamiento mira a +Z.
// Sin marcas de terceros: solo el logotipo Hammer.
import { DecalGeometry } from "three/addons/geometries/DecalGeometry.js";
import { materialPelota } from "./comun.js";

export function crearMaquina(THREE, { logo } = {}) {
  const g = new THREE.Group();
  g.name = "maquina";

  const plastico = new THREE.MeshPhysicalMaterial({
    color: 0x222429, roughness: 0.55, metalness: 0.0, clearcoat: 0.35, clearcoatRoughness: 0.45, envMapIntensity: 2.2,
  });
  plastico.onBeforeCompile = (s) => { // grano fino de plástico texturizado
    s.fragmentShader = s.fragmentShader.replace(
      "#include <roughnessmap_fragment>",
      `#include <roughnessmap_fragment>
       float gr = fract(sin(dot(floor(vViewPosition.xy*900.0), vec2(12.9898,78.233)))*43758.5453);
       roughnessFactor = clamp(roughnessFactor + (gr-0.5)*0.12, 0.0, 1.0);`);
  };
  const plasticoOscuro = new THREE.MeshStandardMaterial({ color: 0x0c0d0f, roughness: 0.8 });
  const goma = new THREE.MeshStandardMaterial({ color: 0x0a0a0b, roughness: 0.95 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.35, metalness: 0.9 });
  const negroMate = new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 1 });

  // ---------- loft de secciones redondeadas (superelipse) ----------
  const N = 64;
  function seccion({ y, w, d, cz = 0, n = 5, ytop = null }) {
    const pts = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const c = Math.cos(a), s = Math.sin(a);
      const x = Math.sign(c) * Math.pow(Math.abs(c), 2 / n) * (w / 2);
      const z = Math.sign(s) * Math.pow(Math.abs(s), 2 / n) * (d / 2) + cz;
      const yy = ytop ? ytop(z) : y;
      pts.push(new THREE.Vector3(x, yy, z));
    }
    return pts;
  }
  function loft(secs, { tapaAbajo = true, tapaArriba = false } = {}) {
    const pos = [];
    const idx = [];
    secs.forEach((s) => s.forEach((p) => pos.push(p.x, p.y, p.z)));
    for (let j = 0; j < secs.length - 1; j++)
      for (let i = 0; i < N; i++) {
        const a = j * N + i, b = j * N + ((i + 1) % N), c = (j + 1) * N + i, d = (j + 1) * N + ((i + 1) % N);
        idx.push(a, c, b, b, c, d);
      }
    const tapa = (k, arriba) => {
      const s = secs[k];
      const cx = s.reduce((t, p) => t + p.x, 0) / N, cy = s.reduce((t, p) => t + p.y, 0) / N, cz = s.reduce((t, p) => t + p.z, 0) / N;
      const ci = pos.length / 3; pos.push(cx, cy, cz);
      for (let i = 0; i < N; i++) {
        const a = k * N + i, b = k * N + ((i + 1) % N);
        if (arriba) idx.push(ci, a, b); else idx.push(ci, b, a);
      }
    };
    if (tapaAbajo) tapa(0, false);
    if (tapaArriba) tapa(secs.length - 1, true);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  }

  // ---------- base (cuerpo inferior) ----------
  const base = [
    { y: 0.065, w: 0.352, d: 0.47, cz: 0.0, n: 6 },
    { y: 0.12, w: 0.356, d: 0.47, cz: 0.0, n: 6 },
    { y: 0.22, w: 0.352, d: 0.45, cz: -0.01, n: 5.5 },
    { y: 0.31, w: 0.336, d: 0.39, cz: -0.04, n: 5 },
    { y: 0.375, w: 0.31, d: 0.33, cz: -0.07, n: 4.5 },
    { y: 0.405, w: 0.292, d: 0.305, cz: -0.08, n: 4.5 },
  ].map(seccion);
  const mBase = new THREE.Mesh(loft(base), plastico);
  g.add(mBase);

  // cintura
  const cintura = new THREE.Mesh(loft([
    { y: 0.402, w: 0.28, d: 0.292, cz: -0.08, n: 4.5 },
    { y: 0.445, w: 0.28, d: 0.292, cz: -0.08, n: 4.5 },
  ].map(seccion), { tapaArriba: true }), plasticoOscuro);
  g.add(cintura);

  // ---------- tolva (abierta arriba, borde inclinado: más alta detrás) ----------
  const borde = (z) => 0.72 + (-z + 0.24) / 0.53 * 0.044; // 0.72 delante -> 0.764 detrás
  const tolvaExt = [
    { y: 0.44, w: 0.29, d: 0.305, cz: -0.08, n: 4.5 },
    { y: 0.5, w: 0.322, d: 0.37, cz: -0.065, n: 5 },
    { y: 0.58, w: 0.355, d: 0.46, cz: -0.045, n: 5.5 },
    { y: 0.66, w: 0.37, d: 0.515, cz: -0.035, n: 6 },
    { y: 0, w: 0.373, d: 0.53, cz: -0.032, n: 6, ytop: borde },
  ].map(seccion);
  const tolvaInt = [
    { y: 0, w: 0.349, d: 0.506, cz: -0.032, n: 6, ytop: (z) => borde(z) - 0.002 },
    { y: 0.56, w: 0.30, d: 0.40, cz: -0.05, n: 5 },
  ].map(seccion);
  const mTolva = new THREE.Mesh(loft(tolvaExt), plastico);
  g.add(mTolva);
  const geoInt = loft(tolvaInt, { tapaAbajo: false, tapaArriba: true });
  const mInt = new THREE.Mesh(geoInt, new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.85, side: THREE.BackSide }));
  g.add(mInt);
  // labio del borde
  const lab = [];
  const ext = tolvaExt[tolvaExt.length - 1], int = tolvaInt[0];
  const geoLab = new THREE.BufferGeometry();
  ext.forEach((p) => lab.push(p.x, p.y, p.z)); int.forEach((p) => lab.push(p.x, p.y, p.z));
  const il = [];
  for (let i = 0; i < N; i++) { const a = i, b = (i + 1) % N, c = N + i, d = N + ((i + 1) % N); il.push(a, b, c, b, d, c); }
  geoLab.setAttribute("position", new THREE.Float32BufferAttribute(lab, 3)); geoLab.setIndex(il); geoLab.computeVertexNormals();
  g.add(new THREE.Mesh(geoLab, plastico));

  // borde enrollado grueso de la tolva (como la pieza real)
  {
    const pts = tolvaExt[tolvaExt.length - 1].map((p, i) => { const q = tolvaInt[0][i]; return new THREE.Vector3((p.x + q.x) / 2, p.y + 0.004, (p.z + q.z) / 2); });
    const curva = new THREE.CatmullRomCurve3(pts, true);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curva, 160, 0.011, 10, true), plastico));
  }

  // bolas en la tolva: capas empaquetadas sin solaparse; la de arriba forma un montón
  // suave como en las fotos oficiales
  const fieltro = materialPelota(THREE);
  const RB = 0.0335, bolaGeo = new THREE.SphereGeometry(RB, 24, 16);
  const rnd = mulberry(7);
  const dentro = (x, z, w, d, cz) => Math.pow(Math.abs(x) / (w / 2), 6) + Math.pow(Math.abs(z - cz) / (d / 2), 6) <= 1;
  const capas = [
    { dy: -0.026, w: 0.349 - 2 * RB, d: 0.506 - 2 * RB, off: 0 },
    { dy: 0.028, w: 0.24, d: 0.36, off: 0.5 },
    { dy: 0.078, w: 0.13, d: 0.2, off: 0 },
  ];
  const sx = 2 * RB * 1.02, sz = sx * 0.866;
  capas.forEach((c, ci) => {
    for (let iz = -8; iz <= 8; iz++) for (let ix = -6; ix <= 6; ix++) {
      const x = (ix + ((iz & 1) ? 0.5 : 0) + c.off) * sx, z = -0.032 + (iz + c.off) * sz;
      if (!dentro(x, z, c.w, c.d, -0.032)) continue;
      if (ci > 0 && rnd() < 0.15) continue;
      const b = new THREE.Mesh(bolaGeo, fieltro);
      b.position.set(x + (rnd() - 0.5) * 0.004, borde(z) + c.dy + (rnd() - 0.5) * 0.006, z + (rnd() - 0.5) * 0.004);
      b.rotation.set(rnd() * 6, rnd() * 6, rnd() * 6); g.add(b);
    }
  });

  // ventanas frontales de la tolva (3), sobre la boca, con bolas a la vista (como la máquina real)
  for (let k = 0; k < 3; k++) {
    const y = 0.66 - k * 0.046;
    const zf = 0.212 - k * 0.011; // la cara frontal se retrae hacia abajo
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.105 - k * 0.006, 0.026, 0.05), negroMate);
    r.position.set(0.035, y, zf); r.rotation.x = 0.3; g.add(r);
    for (const dx of [-0.028, 0.028]) {
      const bv = new THREE.Mesh(new THREE.SphereGeometry(0.03, 14, 10), fieltro);
      bv.position.set(0.035 + dx, y - 0.006, zf - 0.04); g.add(bv);
    }
  }

  // ---------- boca de lanzamiento (frontal de la base) ----------
  const bw = 0.2, bh = 0.25, br = 0.06;
  const forma = new THREE.Shape();
  rrect(forma, -bw / 2 - 0.016, -bh / 2 - 0.016, bw + 0.032, bh + 0.032, br + 0.016);
  const hueco = new THREE.Path(); rrect(hueco, -bw / 2, -bh / 2, bw, bh, br);
  forma.holes.push(hueco);
  const marco = new THREE.Mesh(new THREE.ExtrudeGeometry(forma, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 3 }), plastico);
  const boca = new THREE.Group();
  boca.add(marco);
  // interior: fondo negro con sombra hacia los bordes (el marco sobresale y da sensación de hueco)
  const fondo = new THREE.Mesh(new THREE.ShapeGeometry((() => { const f = new THREE.Shape(); rrect(f, -bw / 2, -bh / 2, bw, bh, br); return f; })()),
    new THREE.MeshBasicMaterial({ color: 0x020203 }));
  fondo.position.z = 0.004; boca.add(fondo);
  // ruedas lanzadoras visibles dentro
  for (const s of [-1, 1]) {
    const rl = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.035, 40), new THREE.MeshStandardMaterial({ color: 0x1c1d20, roughness: 0.7 }));
    rl.rotation.z = Math.PI / 2; rl.scale.set(1, 1, 0.35); rl.position.set(s * 0.05, -0.02, 0.012); boca.add(rl);
  }
  boca.position.set(0, 0.215, 0.197);
  boca.rotation.x = -0.4;
  boca.name = "boca";
  g.add(boca);
  // punto de salida de la bola (en coordenadas de la máquina)
  g.userData.salida = new THREE.Vector3(0, 0.215, 0.25);

  // ---------- ruedas traseras ----------
  for (const s of [-1, 1]) {
    const rueda = new THREE.Group();
    const neum = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.082, 0.045, 48), goma);
    neum.rotation.z = Math.PI / 2; rueda.add(neum);
    for (let k = 0; k < 18; k++) { // tacos
      const t = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.005, 0.012), goma);
      const a = (k / 18) * Math.PI * 2; t.position.set(0, Math.cos(a) * 0.083, Math.sin(a) * 0.083); t.rotation.x = -a; rueda.add(t);
    }
    const llanta = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.047, 32), new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.6 }));
    llanta.rotation.z = Math.PI / 2; rueda.add(llanta);
    for (let k = 0; k < 6; k++) {
      const radio = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.05, 0.008), plasticoOscuro);
      radio.position.x = s * 0.025; radio.rotation.x = (k / 6) * Math.PI * 2; radio.position.y = 0; rueda.add(radio);
    }
    const tornillo = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 12), metal);
    tornillo.rotation.z = Math.PI / 2; rueda.add(tornillo);
    rueda.position.set(s * 0.198, 0.082, -0.19);
    g.add(rueda);
  }
  // patas delanteras
  for (const s of [-1, 1]) {
    const pata = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.024, 0.05, 20), goma);
    pata.position.set(s * 0.13, 0.025, 0.18); g.add(pata);
    const vas = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.03, 8), metal);
    vas.position.set(s * 0.13, 0.06, 0.18); g.add(vas);
  }
  // remaches visibles en el faldón
  for (const [x, z] of [[-0.17, 0.2], [0.17, 0.2], [0, 0.236]]) {
    const r = new THREE.Mesh(new THREE.SphereGeometry(0.004, 8, 6), metal); r.position.set(x, 0.075, z); g.add(r);
  }

  // ---------- asa trasera (tubo redondeado en U, sobresale poco del borde) ----------
  const asaMat = new THREE.MeshStandardMaterial({ color: 0x111214, roughness: 0.45 });
  const asaCurva = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.085, 0.42, -0.262), new THREE.Vector3(-0.085, 0.76, -0.262), new THREE.Vector3(-0.07, 0.805, -0.262),
    new THREE.Vector3(0.07, 0.805, -0.262), new THREE.Vector3(0.085, 0.76, -0.262), new THREE.Vector3(0.085, 0.42, -0.262),
  ], false, "centripetal");
  g.add(new THREE.Mesh(new THREE.TubeGeometry(asaCurva, 80, 0.012, 12, false), asaMat));
  const abr = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.04, 0.03), asaMat); abr.position.set(0, 0.44, -0.25); g.add(abr);

  // ---------- logotipo Hammer en los dos laterales de la tolva ----------
  // Calcomanía proyectada sobre la superficie curva (DecalGeometry), como un vinilo.
  if (logo) {
    const mat = new THREE.MeshStandardMaterial({ map: logo, transparent: true, roughness: 0.5, metalness: 0.15, polygonOffset: true, polygonOffsetFactor: -4, depthWrite: false });
    const ancho = 0.3, alto = ancho * logo.image.height / logo.image.width;
    mTolva.updateMatrixWorld(true);
    for (const s of [-1, 1]) {
      const ori = new THREE.Euler(0, s * Math.PI / 2, 0, "YXZ");
      const geo = new DecalGeometry(mTolva, new THREE.Vector3(s * 0.18, 0.6, -0.035), ori, new THREE.Vector3(ancho, alto, 0.12));
      g.add(new THREE.Mesh(geo, mat));
    }
  }

  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}

function rrect(s, x, y, w, h, r) {
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
}
export function mulberry(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
