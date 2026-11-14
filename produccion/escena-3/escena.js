// Escena 3 · Alquiler: «Elige tu pueblo, te la llevamos a tu pista».
// 1) Vista cenital de un mapa oscuro de la Marina Alta: Pedreguer, Ondara, La Xara
//    y Dénia se encienden una tras otra, unidas por una línea de ruta.
// 2) La cámara baja como un dron sobre Dénia y el mapa se convierte en una pista
//    iluminada.
// 3) Entra rodando la Hammer X MAX y se coloca en la pista.
// Se renderiza fotograma a fotograma (../escena-2/secuencia.mjs con ?escena=3) a un
// vídeo que Scroll Craft controla con el scroll. Sin servicios externos: la costa es
// de Natural Earth (dominio público) y las ubicaciones de los pueblos son aproximadas.
//
// Unidades: metros. La pista ocupa x ∈ [-5, 5], z ∈ [0, 20] y su centro está en Dénia.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { crearMaquina } from "../escena-2/maquina.js";
import { texturaLogo } from "../escena-2/comun.js";
import { texturaCesped, texturaRed } from "../escena-2/escena.js";

// Orden de encendido = orden de la ruta. Coordenadas aproximadas (centro urbano).
export const PUEBLOS = [
  { nombre: "Els Poblets", lon: 0.0221, lat: 38.8578, p: 0.04, lado: "der" },
  { nombre: "El Verger", lon: 0.011, lat: 38.846, p: 0.08, lado: "izq" },
  { nombre: "Ondara", lon: 0.0172, lat: 38.8281, p: 0.12, lado: "izq" },
  { nombre: "Pedreguer", lon: 0.0342, lat: 38.7931, p: 0.16, lado: "der" },
  { nombre: "La Xara", lon: 0.0727, lat: 38.8217, p: 0.2, lado: "abajo" },
  { nombre: "Dénia", lon: 0.1057, lat: 38.8408, p: 0.24, lado: "der" },
];
const ACENTO = 0xd7ff1e;
const DENIA = PUEBLOS[PUEBLOS.length - 1];
const M_LON = Math.cos((DENIA.lat * Math.PI) / 180) * 111320, M_LAT = 110540;
const aXZ = (lon, lat) => [(lon - DENIA.lon) * M_LON, -(lat - DENIA.lat) * M_LAT + 10];

const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const suave = (t) => { t = cl(t); return t * t * (3 - 2 * t); };
const tramo = (p, a, b) => suave((p - a) / (b - a));
const mezcla = (a, b, t) => a + (b - a) * t;

export async function montar(canvas, w, h) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });
  r.setSize(w, h, false); r.setPixelRatio(1);
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.toneMapping = THREE.AgXToneMapping; r.toneMappingExposure = 1.05; r.outputColorSpace = THREE.SRGBColorSpace;
  const vertical = h > w;

  const sc = new THREE.Scene();
  sc.background = new THREE.Color(0x05070c);
  sc.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
  sc.environmentIntensity = 0.16;

  // ================= 1 · MAPA =================
  const datos = await (await fetch("./marina-alta.json")).json();
  const mapa = new THREE.Group(); mapa.position.y = -0.6; sc.add(mapa);
  const fundibles = []; // materiales del mapa que se funden al bajar
  const mb = (o) => { const m = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, depthTest: false, ...o }); fundibles.push([m, m.opacity]); return m; };
  const orden = (o, n) => { o.renderOrder = n; return o; };

  const mar = new THREE.Mesh(new THREE.PlaneGeometry(400000, 400000), mb({ color: 0x060a12 }));
  mar.rotation.x = -Math.PI / 2; mar.position.y = -2; mapa.add(orden(mar, 0));
  // retícula muy tenue cada 2 km
  {
    const pts = [];
    for (let k = -40; k <= 40; k++) { pts.push(k * 2000, 0, -80000, k * 2000, 0, 80000, -80000, 0, k * 2000, 80000, 0, k * 2000); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    const ret = new THREE.LineSegments(g, (() => { const m = new THREE.LineBasicMaterial({ color: 0x16243a, transparent: true, opacity: 0.55, depthWrite: false }); fundibles.push([m, 0.55]); return m; })());
    ret.position.y = -1.5; mapa.add(orden(ret, 1));
  }
  for (const anillo of datos.tierra) {
    const s = new THREE.Shape(anillo.map(([lo, la]) => { const [x, z] = aXZ(lo, la); return new THREE.Vector2(x, -z); }));
    const tierra = new THREE.Mesh(new THREE.ShapeGeometry(s), mb({ color: 0x111a29 }));
    tierra.rotation.x = -Math.PI / 2; mapa.add(orden(tierra, 2));
    // costa: línea luminosa
    const curva = new THREE.CatmullRomCurve3(anillo.map(([lo, la]) => { const [x, z] = aXZ(lo, la); return new THREE.Vector3(x, 1, z); }), true, "centripetal");
    mapa.add(orden(new THREE.Mesh(new THREE.TubeGeometry(curva, 600, 45, 6, true), mb({ color: 0x3f6fae, opacity: 0.9 })), 3));
  }
  for (const c of datos.carreteras) {
    const curva = new THREE.CatmullRomCurve3(c.map(([lo, la]) => { const [x, z] = aXZ(lo, la); return new THREE.Vector3(x, 1, z); }));
    mapa.add(orden(new THREE.Mesh(new THREE.TubeGeometry(curva, 200, 22, 5), mb({ color: 0x24324a, opacity: 0.9 })), 3));
  }
  const etiqueta = (texto, { tam = 64, color = "#f2f4f7", peso = 700 } = {}) => {
    const c = document.createElement("canvas"); const x = c.getContext("2d");
    x.font = `${peso} ${tam}px Arial, sans-serif`; const ancho = Math.ceil(x.measureText(texto).width) + 24;
    c.width = ancho; c.height = Math.ceil(tam * 1.4);
    x.font = `${peso} ${tam}px Arial, sans-serif`; x.fillStyle = color; x.textBaseline = "middle"; x.fillText(texto, 12, c.height / 2);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
    const m = new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, depthTest: false });
    const sp = new THREE.Sprite(m); sp.userData.aspecto = c.width / c.height; sp.renderOrder = 10; return sp;
  };
  const marTxt = etiqueta("Mar Mediterráneo", { tam: 56, color: "#4d6b93", peso: 400 });
  { const [x, z] = aXZ(0.2, 38.9); marTxt.position.set(x, 50, z); marTxt.center.set(0.5, 0.5); mapa.add(marTxt); }

  // ruta que une los pueblos (se dibuja a medida que se encienden)
  const puntos = PUEBLOS.map((q) => { const [x, z] = aXZ(q.lon, q.lat); return new THREE.Vector3(x, 40, z); });
  const ruta = new THREE.CatmullRomCurve3(puntos, false, "centripetal");
  const rutaGeo = new THREE.TubeGeometry(ruta, 300, 75, 8);
  const rutaMat = mb({ color: ACENTO, opacity: 0.95, blending: THREE.AdditiveBlending });
  const rutaM = new THREE.Mesh(rutaGeo, rutaMat); mapa.add(orden(rutaM, 4));
  const rutaTotal = rutaGeo.index.count;
  const disco = new THREE.CircleGeometry(1, 48), halo = halotex(THREE);
  const pueblos = PUEBLOS.map((q, i) => {
    const pos = puntos[i];
    const dm = mb({ color: 0x55606f });
    const d = new THREE.Mesh(disco, dm); d.rotation.x = -Math.PI / 2; d.position.set(pos.x, 60, pos.z); d.scale.setScalar(260); mapa.add(orden(d, 5));
    const hm = new THREE.SpriteMaterial({ map: halo, color: ACENTO, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false });
    const hs = new THREE.Sprite(hm); hs.position.set(pos.x, 80, pos.z); hs.renderOrder = 9; mapa.add(hs);
    const et = etiqueta(q.nombre); et.position.set(pos.x, 100, pos.z); mapa.add(et);
    // cada etiqueta a un lado para que no se pisen
    if (q.lado === "izq") et.center.set(1.08, 0.5); else if (q.lado === "abajo") et.center.set(0.5, 1.25); else et.center.set(-0.08, 0.5);
    return { q, d, dm, hs, hm, et };
  });

  // ================= 2 · PISTA =================
  const pista = new THREE.Group(); sc.add(pista);
  const apareceMat = [];
  const am = (m, op = 1) => { m.transparent = true; apareceMat.push([m, op]); return m; };
  const fuera = new THREE.Mesh(new THREE.CircleGeometry(220, 64), am(new THREE.MeshStandardMaterial({ color: 0x0b0d12, roughness: 0.95 })));
  fuera.rotation.x = -Math.PI / 2; fuera.position.set(0, -0.01, 10); fuera.receiveShadow = true; pista.add(fuera);
  const [cesMap, cesBump] = texturaCesped(THREE);
  const cesMat = am(new THREE.MeshStandardMaterial({ color: 0xffffff, map: cesMap, bumpMap: cesBump, bumpScale: 1.4, roughness: 0.93 }));
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(10, 20), cesMat);
  suelo.rotation.x = -Math.PI / 2; suelo.position.set(0, 0, 10); suelo.receiveShadow = true; pista.add(suelo);
  // líneas: se dibujan primero en amarillo (el «trazo» que sale del mapa) y luego quedan blancas
  const lineaMat = new THREE.MeshBasicMaterial({ color: ACENTO, transparent: true, opacity: 0 });
  const lineas = [];
  const linea = (x1, z1, x2, z2) => {
    const L = Math.hypot(x2 - x1, z2 - z1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 === x2 ? 0.06 : L, x1 === x2 ? L : 0.06), lineaMat);
    m.rotation.x = -Math.PI / 2; m.position.set((x1 + x2) / 2, 0.004, (z1 + z2) / 2); pista.add(m); m.userData.eje = x1 === x2 ? "x" : "y"; lineas.push(m);
  };
  linea(-5, 0, 5, 0); linea(-5, 20, 5, 20); linea(-5, 0, -5, 20); linea(5, 0, 5, 20); // contorno
  linea(-5, 3.05, 5, 3.05); linea(-5, 16.95, 5, 16.95); linea(0, 3.05, 0, 16.95);
  // red
  const red = new THREE.Mesh(new THREE.PlaneGeometry(10, 0.8), am(new THREE.MeshStandardMaterial({ map: texturaRed(THREE), alphaTest: 0.04, side: THREE.DoubleSide, roughness: 0.9 })));
  red.position.set(0, 0.47, 10); pista.add(red);
  const cintaMat = am(new THREE.MeshStandardMaterial({ color: 0xf4f6fa, roughness: 0.75 }));
  const cinta = new THREE.Mesh(new THREE.BoxGeometry(10, 0.05, 0.03), cintaMat); cinta.position.set(0, 0.89, 10); pista.add(cinta);
  // cerramiento que sube desde el suelo
  const muros = new THREE.Group(); pista.add(muros);
  const cristal = new THREE.MeshPhysicalMaterial({ color: 0xa9bbd9, transparent: true, opacity: 0.1, roughness: 0.04, envMapIntensity: 3, side: THREE.DoubleSide, depthWrite: false });
  const perfil = new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: 0.45, metalness: 0.7 });
  const panel = (ancho, alto, x, z, ry) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(ancho - 0.02, alto), cristal); m.position.set(x, alto / 2, z); m.rotation.y = ry; m.renderOrder = 2; muros.add(m);
  };
  for (const z of [0, 20]) for (const x of [-3.75, -1.25, 1.25, 3.75]) panel(2.5, 3, x, z, 0);
  for (const sx of [-1, 1]) for (const [z0, z1, alto] of [[0, 2, 3], [2, 4, 2], [16, 18, 2], [18, 20, 3]]) panel(z1 - z0, alto, sx * 5, (z0 + z1) / 2, Math.PI / 2);
  for (const z of [0, 2, 4, 9, 11, 16, 18, 20]) for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4, 0.08), perfil); p.position.set(sx * 5.04, 2, z); p.castShadow = true; muros.add(p); }
  for (const z of [0, 20]) { const v = new THREE.Mesh(new THREE.BoxGeometry(10.1, 0.06, 0.06), perfil); v.position.set(0, 4, z); muros.add(v); }
  for (const sx of [-1, 1]) { const v = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 20.1), perfil); v.position.set(sx * 5.04, 4, 10); muros.add(v); }

  // focos: 4 postes con LED que se encienden al llegar
  sc.add(new THREE.HemisphereLight(0x9fb6ff, 0x0b1020, 0.22));
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0xf4f7ff, emissiveIntensity: 0 });
  const carcasa = new THREE.MeshStandardMaterial({ color: 0x22252b, roughness: 0.4, metalness: 0.8 });
  const focos = [];
  [[-5.35, 5], [5.35, 5], [-5.35, 15], [5.35, 15]].forEach(([x, z]) => {
    const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 6.6, 12), carcasa); poste.position.set(x, 3.3, z); muros.add(poste);
    const g = new THREE.Group(); g.position.set(x * 0.97, 6.55, z); g.rotation.z = Math.sign(x) * 0.6;
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.8), carcasa));
    const led = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.74), ledMat); led.rotation.x = Math.PI / 2; led.position.y = -0.037; g.add(led);
    muros.add(g);
    const L = new THREE.SpotLight(0xf3f6ff, 0, 34, 1.0, 0.75, 1.5);
    L.position.set(x * 0.97, 6.5, z); L.target.position.set(-x * 0.2, 0, z + (z < 10 ? 1.5 : -1.5));
    L.castShadow = true; L.shadow.mapSize.set(1024, 1024); L.shadow.bias = -0.0004; L.shadow.normalBias = 0.02; L.shadow.radius = 4;
    sc.add(L, L.target); focos.push(L);
  });

  // ================= 3 · MÁQUINA =================
  const logo = await texturaLogo(THREE, "/public/marca/hammer-logo.svg");
  const maq = crearMaquina(THREE, { logo }); sc.add(maq);
  const ruedas = maq.children.filter((o) => o.isGroup && Math.abs(Math.abs(o.position.x) - 0.198) < 0.01);
  const clave = new THREE.SpotLight(0xe8eeff, 0, 8, 0.7, 0.8, 1.5); clave.position.set(2.2, 2.6, 6.2); sc.add(clave, clave.target);
  const DESTINO = new THREE.Vector3(0, 0, 2.6);
  const camino = new THREE.CatmullRomCurve3([new THREE.Vector3(-3.6, 0, 7.2), new THREE.Vector3(-2.2, 0, 5.2), new THREE.Vector3(-0.7, 0, 3.6), DESTINO.clone()], false, "centripetal");
  const largo = camino.getLength();
  const marca = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 64), new THREE.MeshBasicMaterial({ color: ACENTO, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  marca.rotation.x = -Math.PI / 2; marca.position.set(DESTINO.x, 0.01, DESTINO.z); sc.add(marca);
  clave.target.position.copy(DESTINO).setY(0.45);

  // ================= CÁMARA =================
  const cam = new THREE.PerspectiveCamera(vertical ? 58 : 42, w / h, 0.05, 300000);
  const centro = puntos.reduce((a, b) => a.clone().add(b), new THREE.Vector3()).multiplyScalar(1 / puntos.length).setY(0);
  const DIST0 = vertical ? 33000 : 17000;          // vista cenital: los cuatro pueblos y la costa
  const final = vertical
    ? { t: new THREE.Vector3(-2.6, 0.2, 6.2), d: 6.2, e: 0.5, az: 0.9 }
    : { t: new THREE.Vector3(-1.4, 0.45, 3.6), d: 5.2, e: 0.3, az: 1.1 };
  const T_BAJA = 0.3, T_LLEGA = 0.64;
  const poseRaw = (p) => {
    let t, d, e, az;
    if (p < T_BAJA) {
      const s = p / T_BAJA;
      t = centro.clone(); d = DIST0 * mezcla(1, 0.86, s); e = 1.5; az = mezcla(-0.05, 0.05, s);
    } else if (p < T_LLEGA) {
      const s = suave((p - T_BAJA) / (T_LLEGA - T_BAJA));
      d = Math.exp(mezcla(Math.log(DIST0 * 0.86), Math.log(final.d), s));
      // el punto de mira llega a Dénia mientras aún se ve el mapa (antes de bajar de ~2 km)
      const st = suave((Math.log(DIST0 * 0.86) - Math.log(d)) / (Math.log(DIST0 * 0.86) - Math.log(2000)));
      t = centro.clone().lerp(final.t, st);
      e = mezcla(1.5, final.e, Math.pow(s, 1.6)); az = mezcla(0.05, final.az, s);
    } else {
      const s = suave((p - T_LLEGA) / (1 - T_LLEGA));
      if (vertical) {
        // en vertical la cámara sigue a la máquina mientras entra, para que no salga de plano
        const mp = camino.getPointAt(tramo(p, 0.66, 0.9)).add(new THREE.Vector3(0, 0.25, 0));
        t = final.t.clone().lerp(mp, tramo(p, T_LLEGA, 0.72)); d = final.d * mezcla(1, 0.8, s); e = final.e - 0.06 * s; az = final.az - 0.35 * s;
      } else {
        t = final.t.clone().lerp(DESTINO.clone().setY(final.t.y).add(new THREE.Vector3(-0.9, 0, 0.3)), s); d = final.d * mezcla(1, 0.8, s); e = final.e - 0.05 * s; az = final.az - 0.3 * s;
      }
    }
    return { t, d, e, az };
  };

  // trayectoria aún más suave: cada fotograma promedia la pose de sus vecinos (núcleo gaussiano)
  // en espacio de parámetros (punto de mira, log de la distancia, elevación, azimut)
  const poseSuave = (p) => {
    let sw = 0; const acc = { t: new THREE.Vector3(), ld: 0, e: 0, az: 0 };
    for (let k = -12; k <= 12; k++) {
      const q = cl(p + k * 0.004), wgt = Math.exp(-((k / 6) ** 2));
      const r0 = poseRaw(q);
      acc.t.addScaledVector(r0.t, wgt); acc.ld += Math.log(r0.d) * wgt; acc.e += r0.e * wgt; acc.az += r0.az * wgt; sw += wgt;
    }
    const t = acc.t.multiplyScalar(1 / sw), d = Math.exp(acc.ld / sw), e = acc.e / sw, az = acc.az / sw;
    const pos = new THREE.Vector3(Math.sin(az) * Math.cos(e) * d, Math.sin(e) * d, Math.cos(az) * Math.cos(e) * d).add(t);
    return { pos, t, d };
  };

  // ================= POSTPROCESO =================
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: 4 });
  const comp = new EffectComposer(r, rt); comp.setPixelRatio(1); comp.setSize(w, h);
  comp.addPass(new RenderPass(sc, cam));
  comp.addPass(new UnrealBloomPass(new THREE.Vector2(w, h), 0.45, 0.5, 0.85));
  comp.addPass(new OutputPass());

  function fotograma(p) {
    p = cl(p);
    const { pos, t, d } = poseSuave(p);
    cam.position.copy(pos); cam.lookAt(t);
    cam.near = Math.max(0.05, d * 0.002); cam.far = Math.max(400, d * 20); cam.updateProjectionMatrix();

    // mapa: visible arriba, se funde al bajar de ~2,5 km a ~250 m
    const fm = cl((Math.log(d) - Math.log(500)) / (Math.log(3000) - Math.log(500)));
    for (const [m, op] of fundibles) m.opacity = op * fm;
    mapa.visible = fm > 0.001;
    const escalaTxt = d * (vertical ? 0.036 : 0.05);
    marTxt.material.opacity = fm * 0.9; marTxt.scale.set(escalaTxt * 0.8 * marTxt.userData.aspecto, escalaTxt * 0.8, 1);
    rutaMat.opacity = 0.95 * fm * cl((Math.log(d) - Math.log(2500)) / (Math.log(7000) - Math.log(2500)));
    rutaM.geometry.setDrawRange(0, Math.floor(rutaTotal * tramo(p, PUEBLOS[0].p, DENIA.p) / 6) * 6);
    for (const o of pueblos) {
      const on = tramo(p, o.q.p, o.q.p + 0.04);
      o.dm.color.setHex(0x55606f).lerp(new THREE.Color(ACENTO), on);
      o.d.scale.setScalar(d * 0.008 * (1 + 0.25 * on));
      o.hm.opacity = fm * on * (0.55 + 0.45 * Math.exp(-Math.max(0, p - o.q.p) * 18));
      o.hs.scale.setScalar(d * 0.07 * (1 + 1.5 * Math.exp(-Math.max(0, p - o.q.p) * 14)));
      o.et.material.opacity = fm * mezcla(0.35, 1, on);
      o.et.scale.set(escalaTxt * o.et.userData.aspecto, escalaTxt, 1);
    }

    // pista: trazo amarillo → césped → cerramiento → focos
    const ap = tramo(p, 0.48, 0.6);
    for (const [m, op] of apareceMat) m.opacity = op * ap;
    pista.visible = ap > 0.001 || p > 0.4;
    const trazo = tramo(p, 0.36, 0.46);
    lineaMat.opacity = trazo;
    const grosor = Math.max(1, (d * 0.003) / 0.06); // trazo grueso visible desde lejos que se afina al llegar
    for (const m of lineas) m.scale[m.userData.eje] = grosor;
    lineaMat.color.setHex(ACENTO).lerp(new THREE.Color(0xf4f6fa), tramo(p, 0.56, 0.66));
    const sube = tramo(p, 0.52, 0.66);
    muros.scale.y = Math.max(0.001, sube); muros.visible = sube > 0.001;
    const luz = tramo(p, 0.58, 0.7);
    focos.forEach((L) => { L.intensity = 80 * luz; }); ledMat.emissiveIntensity = 6 * luz;
    clave.intensity = 5 * luz;

    // máquina: entra rodando (de espaldas, tirada del asa) y se coloca
    const u = tramo(p, 0.66, 0.9);
    const recorrido = u * largo;
    const pt = camino.getPointAt(u), tg = camino.getTangentAt(Math.min(0.999, u));
    maq.position.copy(pt);
    maq.rotation.y = Math.atan2(-tg.x, -tg.z); // el frente mira al lado contrario de la marcha (la llevan del asa)
    maq.visible = p > 0.6;
    for (const rd of ruedas) rd.rotation.x = -recorrido / 0.082;
    marca.material.opacity = 0.8 * tramo(p, 0.62, 0.7) * (1 - tramo(p, 0.88, 0.96));
    marca.scale.setScalar(1 + 0.08 * Math.sin(p * 90));

    comp.render();
  }
  return { fotograma };
}

function halotex(THREE) {
  const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d");
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.15, "rgba(255,255,255,0.6)"); g.addColorStop(0.4, "rgba(255,255,255,0.15)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c); return t;
}
