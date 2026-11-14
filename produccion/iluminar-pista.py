"""Escena 1: calcula las capas de luz de la pista a partir de la foto apagada.

Uso: python produccion/iluminar-pista.py pista-oscura.png [carpeta-salida]
Genera luz0..2.png (una por pareja de focos, de fondo a primer plano) y
final.png (vista previa de la suma). Después se convierten a WebP en
public/medios/pista/luz-N.webp. Sin servicios externos ni modelos de IA:
solo OpenCV y NumPy.
"""
import cv2, numpy as np, sys, os
ENTRADA = sys.argv[1] if len(sys.argv) > 1 else 'pista-oscura.png'
SALIDA = sys.argv[2] if len(sys.argv) > 2 else '.'
os.makedirs(SALIDA, exist_ok=True)
d=cv2.imread(ENTRADA).astype(np.float32)/255
h,w=d.shape[:2]
Y,X=np.mgrid[0:h,0:w].astype(np.float32); X/=w; Y/=h
pairs=[[(38.3,45.7),(61.7,45.7)],[(29.1,28.8),(70.8,28.8)],[(18.3,6.5),(81.7,6.5)]]  # lejos -> cerca
def gauss(cx,cy,sx,sy): return np.exp(-(((X-cx)/sx)**2+((Y-cy)/sy)**2))
cool=np.array([1.0,0.97,0.92],np.float32)  # BGR: blanco algo frío
layers=[]
for n,pair in enumerate(pairs):
    k=[0.8,1.1,1.4][n]
    G=np.zeros((h,w),np.float32)
    for (lx,ly) in pair:
        lx/=100; ly/=100
        # pool de luz en la pista bajo/delante del foco
        G+=1.25*gauss(lx+(0.5-lx)*0.45, ly+0.30+0.08*n, 0.20*k, 0.16*k)
        # lavado del cristal/pared lateral bajo el foco
        G+=0.9*gauss(lx, ly+0.15, 0.06*k, 0.18*k)
        # resplandor alrededor de la lámpara
        G+=1.2*gauss(lx, ly, 0.035*k, 0.05*k)
    G+=0.2*(n+1)/3  # relleno ambiente
    L=d*G[...,None]*cool
    # emisión de la cabeza del foco (núcleo + bloom)
    E=np.zeros((h,w),np.float32)
    for (lx,ly) in pair:
        lx/=100; ly/=100
        E+=1.0*gauss(lx,ly,0.012*k,0.016*k)+0.35*gauss(lx,ly,0.04*k,0.055*k)
    L+=E[...,None]*np.array([1.0,0.98,0.95],np.float32)
    layers.append(np.clip(L,0,1))
out=d.copy()
for L in layers: out=1-(1-out)*(1-L)   # screen, como en CSS
cv2.imwrite(os.path.join(SALIDA,'final.png'),(np.clip(out,0,1)*255).astype(np.uint8))
for i,L in enumerate(layers): cv2.imwrite(os.path.join(SALIDA,f'luz{i}.png'),(L*255).astype(np.uint8))
print('brillo medio: apagada', round(float(d.mean()),3), 'encendida', round(float(out.mean()),3))
