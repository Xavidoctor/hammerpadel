// Modelo 3D del Recogebolas Hammer (procedural, Three.js), hecho a partir de las
// fotos oficiales (imagenes/recogebolas-completo.png y recogebolas-detalle.png):
// cesta de varillas de acero inoxidable en forma de tonel que gira sobre un eje,
// discos negros con el logotipo HAMMER (dos veces, girado 180°) en ambos extremos,
// horquilla de varilla doblada, casquillo y mango de acero con dos empuñaduras
// de espuma negra y tapón metálico.
// Las medidas son aproximadas para la animación: NO son especificaciones.
// Unidades: metros. Grupo: eje de la cesta en X, avance hacia +Z, Y arriba.
// El origen está en el centro del eje (a R del suelo).
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const CESTA = { R: 0.145, L: 0.31, varillas: 34 };

export function crearRecogebolas(THREE, { logo } = {}) {
  const { R, L, varillas } = CESTA;
  const g = new THREE.Group();
  g.name = "recogebolas";

  const acero = new THREE.MeshStandardMaterial({ color: 0xe3e6ea, metalness: 1, roughness: 0.22, envMapIntensity: 1.6 });
  const aceroMate = new THREE.MeshStandardMaterial({ color: 0xc9cdd2, metalness: 1, roughness: 0.38, envMapIntensity: 1.4 });
  const espuma = new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 0.92 });
  const disco = new THREE.MeshStandardMaterial({ color: logo ? 0xffffff : 0x111215, roughness: 0.6, metalness: 0.1, map: logo ?? null });
  const discoCanto = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.5, metalness: 0.3 });

  // ---------- cesta (gira con el eje) ----------
  const cesta = new THREE.Group();
  cesta.name = "cesta";
  g.add(cesta);
  const rHub = 0.052, giro = (Math.PI * 2) / varillas * 1.5; // cada varilla avanza 1,5 pasos de un extremo al otro
  const geos = [];
  for (let i = 0; i < varillas; i++) {
    const a0 = (i / varillas) * Math.PI * 2;
    // perfil (x, radio) de una varilla: sale del disco, abre en punta hacia fuera,
    // recorre el tonel con algo de barriga y vuelve al disco del otro extremo
    const perfil = [
      [-L / 2 + 0.006, rHub * 0.9], [-L / 2 - 0.004, R * 0.55], [-L / 2 + 0.004, R * 1.04],
      [-L / 2 + 0.03, R * 0.985], [-L / 4, R * 0.975], [0, R * 0.98], [L / 4, R * 0.975],
      [L / 2 - 0.03, R * 0.985], [L / 2 - 0.004, R * 1.04], [L / 2 + 0.004, R * 0.55], [L / 2 - 0.006, rHub * 0.9],
    ];
    const pts = perfil.map(([x, r]) => {
      const t = (x + L / 2) / L; // 0..1 a lo largo
      const a = a0 + giro * Math.min(1, Math.max(0, t));
      return new THREE.Vector3(x, Math.cos(a) * r, Math.sin(a) * r);
    });
    const curva = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.35);
    geos.push(new THREE.TubeGeometry(curva, 90, 0.0022, 6, false));
  }
  // aros interiores que sujetan las varillas junto a cada disco
  for (const sx of [-1, 1]) {
    const aro = new THREE.TorusGeometry(rHub * 0.92, 0.003, 6, 48);
    aro.rotateY(Math.PI / 2); aro.translate(sx * (L / 2 - 0.006), 0, 0);
    geos.push(aro);
  }
  const varillaje = new THREE.Mesh(mergeGeometries(geos), acero);
  varillaje.castShadow = true;
  cesta.add(varillaje);

  // discos con logotipo (cara exterior) y canto
  for (const sx of [-1, 1]) {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(rHub, rHub, 0.006, 48), [discoCanto, disco, disco]);
    d.rotation.z = Math.PI / 2; d.position.x = sx * (L / 2 + 0.002);
    d.castShadow = true;
    cesta.add(d);
    // por dentro, piñón metálico (se ve a través de las varillas en la foto de detalle)
    const pi = new THREE.Mesh(new THREE.CylinderGeometry(rHub * 0.62, rHub * 0.62, 0.008, 24), aceroMate);
    pi.rotation.z = Math.PI / 2; pi.position.x = sx * (L / 2 - 0.006);
    cesta.add(pi);
  }

  // ---------- partes fijas: tuercas, horquilla y mango ----------
  const tubo = (pts, r, mat, seg = 64) => {
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.2), seg, r, 12, false), mat);
    m.castShadow = true; g.add(m); return m;
  };
  const E = L / 2 + 0.02; // la horquilla abraza la cesta por fuera de los discos
  for (const sx of [-1, 1]) {
    const tuerca = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.02, 6), acero);
    tuerca.rotation.z = Math.PI / 2; tuerca.position.x = sx * (L / 2 + 0.011); g.add(tuerca);
    const arandela = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.003, 24), aceroMate);
    arandela.rotation.z = Math.PI / 2; arandela.position.x = sx * (L / 2 + 0.0055); g.add(arandela);
  }
  // inclinación del mango: hacia atrás (-Z) y arriba
  const incl = 0.82; // rad sobre la horizontal
  const dir = new THREE.Vector3(0, Math.sin(incl), -Math.cos(incl));
  const C = new THREE.Vector3(0, 0, 0).addScaledVector(dir, 0.3); // casquillo, por encima y detrás de la cesta
  // cada brazo: del casquillo, abre en V hasta el lateral y baja doblado hasta el eje
  for (const sx of [-1, 1]) {
    const codo = new THREE.Vector3(sx * E, 0.13, -0.11);
    tubo([
      C.clone(), C.clone().addScaledVector(dir, -0.035).add(new THREE.Vector3(sx * 0.01, 0, 0)),
      new THREE.Vector3(sx * E * 0.75, 0.17, -0.15), codo,
      new THREE.Vector3(sx * E, 0.03, -0.02), new THREE.Vector3(sx * E, 0, 0), new THREE.Vector3(sx * (L / 2 + 0.006), 0, 0),
    ], 0.0042, acero, 80);
  }
  // mango: casquillo, tubo, empuñadura central, tubo, empuñadura superior y tapón
  const largo = 1.02;
  const seg = (desde, hasta, r, mat, rad = 24) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, hasta - desde, rad), mat);
    m.position.copy(C).addScaledVector(dir, (desde + hasta) / 2);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    m.castShadow = true; g.add(m); return m;
  };
  seg(-0.01, 0.05, 0.0105, aceroMate);           // casquillo
  seg(0.05, largo - 0.01, 0.0085, acero);         // tubo
  seg(0.62, 0.74, 0.0155, espuma);                // empuñadura central
  seg(largo - 0.25, largo - 0.015, 0.0155, espuma); // empuñadura superior
  seg(largo - 0.015, largo + 0.008, 0.0105, aceroMate); // tapón

  g.userData.cesta = cesta;
  g.userData.dirMango = dir;
  return g;
}

// Disco negro con el logotipo HAMMER dos veces, una girada 180° (como la pieza real).
export async function texturaDisco(THREE, url) {
  const svg = await (await fetch(url)).text();
  const img = new Image();
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg.replace('fill="currentColor"', 'fill="#e9ecef"'));
  await img.decode();
  const S = 1024, c = document.createElement("canvas"); c.width = c.height = S;
  const x = c.getContext("2d");
  x.fillStyle = "#121317"; x.fillRect(0, 0, S, S);
  const w = S * 0.46, h = (w * img.height) / img.width;
  for (const a of [0, Math.PI]) {
    x.save(); x.translate(S / 2, S / 2); x.rotate(a - 0.32);
    x.drawImage(img, -w / 2, -S * 0.27 - h / 2, w, h);
    x.restore();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
