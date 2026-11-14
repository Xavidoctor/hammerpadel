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
