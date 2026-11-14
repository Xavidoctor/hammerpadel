// Utilidades compartidas por el visor y el render de la escena 2.
export async function texturaLogo(THREE, url, color = "#c9ccd1") {
  const svg = await (await fetch(url)).text();
  const coloreado = svg.replace('fill="currentColor"', `fill="${color}"`);
  const img = new Image();
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(coloreado);
  await img.decode();
  const W = 1400, H = Math.round(W * img.height / img.width) + 160;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const x = c.getContext("2d");
  x.drawImage(img, 0, 0, W, W * img.height / img.width);
  x.fillStyle = color; x.font = "500 110px Arial, sans-serif"; x.textAlign = "center";
  x.letterSpacing = "30px";
  x.fillText("PADEL", W / 2, H - 25);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

// Fieltro de pelota de pádel: amarillo verdoso con pelusa (relieve + sheen) y la
// costura blanca curva clásica, calculada sobre la esfera.
let _fieltro = null;
export function materialPelota(THREE) {
  if (_fieltro) return _fieltro;
  const W = 512, H = 256;
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const b = document.createElement("canvas"); b.width = W; b.height = H;
  const x = c.getContext("2d"), xb = b.getContext("2d");
  const img = x.createImageData(W, H), ib = xb.createImageData(W, H);
  // costura: curva de pelota de tenis sobre la esfera unidad
  const seam = [];
  for (let i = 0; i < 400; i++) {
    const t = (i / 400) * Math.PI * 2, a = 0.75, k = 0.25;
    const v = [a * Math.cos(t) + k * Math.cos(3 * t), a * Math.sin(t) - k * Math.sin(3 * t), 2 * Math.sqrt(a * k) * Math.sin(2 * t)];
    const n = Math.hypot(...v); seam.push(v.map((q) => q / n));
  }
  let s = 1;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let j = 0; j < H; j++) {
    const lat = (0.5 - j / H) * Math.PI;
    for (let i = 0; i < W; i++) {
      const lon = (i / W) * Math.PI * 2;
      const p = [Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)];
      let d = 9;
      for (const q of seam) { const dd = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2; if (dd < d) d = dd; }
      d = Math.sqrt(d);
      const costura = Math.max(0, Math.min(1, (0.045 - d) / 0.012));
      const ruido = rnd();
      const o = (j * W + i) * 4;
      const r = 178 + ruido * 34, g = 212 + ruido * 26, bl = 18 + ruido * 26;
      img.data[o] = r + (245 - r) * costura; img.data[o + 1] = g + (245 - g) * costura; img.data[o + 2] = bl + (238 - bl) * costura; img.data[o + 3] = 255;
      const h = 150 + ruido * 105 - costura * 90;
      ib.data[o] = ib.data[o + 1] = ib.data[o + 2] = h; ib.data[o + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0); xb.putImageData(ib, 0, 0);
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
  const bump = new THREE.CanvasTexture(b);
  _fieltro = new THREE.MeshPhysicalMaterial({
    map, bumpMap: bump, bumpScale: 0.6, roughness: 0.95,
    sheen: 0.6, sheenColor: new THREE.Color(0xd4f03c), sheenRoughness: 0.6,
    emissive: 0x2a3500, emissiveIntensity: 0.25,
  });
  return _fieltro;
}
