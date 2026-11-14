"""Escena 1: encendido de focos y acercamiento tipo dron (modo suave) a partir de UNA foto.

Uso: python produccion/escena-1/dron.py foto.png carpeta-salida [ancho alto fotogramas]
Genera f0000.png… listos para ffmpeg. Sin IA ni servicios externos: OpenCV + NumPy.

- La foto es la pista ya iluminada. El estado «apagado» se calcula oscureciéndola, y los
  focos se encienden por grupos (fondo → techo → delante) con máscaras suaves que suman 1:
  al final el fotograma es exactamente la foto original.
- La cámara hace un único movimiento continuo, con aceleración y frenada suaves (como un
  dron en modo «smooth»): avanza hacia la máquina, baja un poco y corrige un leve alabeo.
  El remuestreo es subpíxel (warpAffine + Lanczos) para que no haya saltos.
"""
import sys, os, math
import cv2, numpy as np

ENT, SAL = sys.argv[1], sys.argv[2]
W, H = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (1600, 900)
N = int(sys.argv[5]) if len(sys.argv) > 5 else 240
os.makedirs(SAL, exist_ok=True)
lit = cv2.imread(ENT).astype(np.float32) / 255
h, w = lit.shape[:2]
Y, X = np.mgrid[0:h, 0:w].astype(np.float32)
X /= w; Y /= h
vertical = H > W

def g(cx, cy, sx, sy):
    return np.exp(-(((X - cx) / sx) ** 2 + ((Y - cy) / sy) ** 2))

# grupos de luz (coordenadas relativas en la foto 1671×941), en orden de encendido
GRUPOS = [
    {"t": 0.05, "lamparas": [(0.296, 0.300), (0.701, 0.300)], "charcos": [(0.36, 0.62), (0.64, 0.62)]},   # focos del fondo
    {"t": 0.15, "lamparas": [(0.50, 0.138), (0.33, 0.03), (0.38, 0.03), (0.62, 0.03), (0.67, 0.03)], "charcos": [(0.5, 0.55)]},  # techo
    {"t": 0.25, "lamparas": [(0.165, 0.065), (0.826, 0.065)], "charcos": [(0.25, 0.8), (0.75, 0.8), (0.5, 0.9)]},  # focos delanteros
]
pesos = []
for gr in GRUPOS:
    m = np.zeros((h, w), np.float32)
    for (lx, ly) in gr["lamparas"]:
        m += 3.0 * g(lx, ly, 0.05, 0.07) + 0.8 * g(lx, ly + 0.12, 0.08, 0.2)
    for (cx, cy) in gr["charcos"]:
        m += 1.0 * g(cx, cy, 0.22, 0.16)
    pesos.append(m)
amb = np.full((h, w), 0.35, np.float32)
total = sum(pesos) + amb
mascaras = [p / total for p in pesos]
m_amb = amb / total

# apagado: muy oscuro y algo más azul; los LED y la máquina casi negros
oscuro = lit * 0.05 + np.array([0.012, 0.006, 0.002], np.float32)  # BGR

def encendido(u, t0):
    # LED: arranque rápido con un pequeño destello y asentamiento
    x = (u - t0) / 0.05
    if x <= 0: return 0.0
    if x >= 3: return 1.0
    base = min(1.0, x)
    return base + 0.18 * math.exp(-((x - 1.0) ** 2) * 6)

def suave(t):  # smootherstep
    t = min(1.0, max(0.0, t)); return t * t * t * (t * (t * 6 - 15) + 10)

def destello(img, u):
    for gr in GRUPOS:
        x = (u - gr["t"]) / 0.05
        if x <= 0 or x > 4: continue
        a = 0.55 * math.exp(-((x - 1.0) ** 2) * 1.5)
        for (lx, ly) in gr["lamparas"]:
            img += a * g(lx, ly, 0.025, 0.04)[..., None] * np.array([1.0, 0.98, 0.94], np.float32)
    return img

for i in range(N):
    u = i / (N - 1)
    a = [encendido(u, gr["t"]) for gr in GRUPOS]
    a_amb = suave((u - 0.04) / 0.36)
    L = m_amb * a_amb
    for m, ai in zip(mascaras, a): L = L + m * ai
    img = oscuro + (lit - oscuro) * L[..., None]
    img = destello(img, u)
    img = np.clip(img, 0, 1)

    # cámara: un solo movimiento continuo
    s = suave((u - 0.08) / 0.92)  # el dron casi quieto mientras se encienden los focos, luego avanza
    if vertical:
        z = 1.0 + 0.42 * s
        cx = 0.5 + 0.015 * (1 - s)
        cy = 0.5 + 0.12 * s
        roll = 1.2 * (1 - s)
    else:
        z = 1.05 + 0.55 * s
        cx = 0.47 + 0.03 * s
        cy = 0.47 + 0.15 * s
        roll = 1.1 * (1 - s)
    # recorte: alto visible de la foto = h / z (en vertical el ancho se ajusta a 9:16)
    vis_h = h / z
    esc = H / vis_h
    vis_w = W / esc
    # limitar el centro para no salir de la foto
    mx, my = vis_w / 2 / w, vis_h / 2 / h
    cxp = min(max(cx, mx + 0.01), 1 - mx - 0.01) * w
    cyp = min(max(cy, my + 0.01), 1 - my - 0.01) * h
    M = cv2.getRotationMatrix2D((cxp, cyp), roll, esc)
    M[0, 2] += W / 2 - cxp
    M[1, 2] += H / 2 - cyp
    out = cv2.warpAffine((img * 255).astype(np.float32), M, (W, H), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)
    # enfoque suave para compensar el reescalado
    blur = cv2.GaussianBlur(out, (0, 0), 1.0)
    out = np.clip(out * 1.35 - blur * 0.35, 0, 255).astype(np.uint8)
    cv2.imwrite(os.path.join(SAL, f"f{i:04d}.png"), out)
    if i % 40 == 0: print(f"{W}x{H} {i}/{N}", flush=True)
