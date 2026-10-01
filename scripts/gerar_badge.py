import math
from PIL import Image, ImageDraw

def coracao(cx, cy, tam, passos=400):
    pts = []
    for i in range(passos):
        t = 2 * math.pi * i / passos
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + x * tam / 34, cy - y * tam / 34))
    return pts

def badge(lado, arquivo):
    S = 4  # supersampling, para bordas lisas
    L = lado * S
    img = Image.new('RGBA', (L, L), (0, 0, 0, 0))
    tam = L * 0.78
    pts = coracao(L / 2, L / 2 + tam * 0.04, tam)
    ImageDraw.Draw(img).polygon(pts, fill=(255, 255, 255, 255))
    img.resize((lado, lado), Image.LANCZOS).save(arquivo, optimize=True)

badge(96, 'public/icons/badge-coracao.png')
badge(192, 'public/icons/badge-coracao-192.png')
print('badge gerado')
