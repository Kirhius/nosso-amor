import math
from PIL import Image, ImageDraw, ImageFilter

def coracao(cx, cy, tam, passos=400):
    pts = []
    for i in range(passos):
        t = 2 * math.pi * i / passos
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + x * tam / 34, cy - y * tam / 34))
    return pts

def icone(lado, proporcao, arquivo):
    S = 4  # supersampling
    L = lado * S
    # fundo em vinho com brilho suave
    fundo = Image.new('RGB', (L, L), (36, 8, 18))
    brilho = Image.new('RGB', (L, L), (36, 8, 18))
    d = ImageDraw.Draw(brilho)
    d.ellipse((L * 0.1, L * -0.2, L * 0.9, L * 0.7), fill=(110, 30, 70))
    brilho = brilho.filter(ImageFilter.GaussianBlur(L * 0.18))
    fundo = Image.blend(fundo, brilho, 0.85)

    tam = L * proporcao
    pts = coracao(L / 2, L / 2 + tam * 0.04, tam)
    mascara = Image.new('L', (L, L), 0)
    ImageDraw.Draw(mascara).polygon(pts, fill=255)

    grad = Image.new('RGB', (L, L))
    gd = ImageDraw.Draw(grad)
    topo, base = (255, 194, 209), (232, 80, 122)
    y0, y1 = int(L / 2 - tam / 2), int(L / 2 + tam / 2)
    for y in range(L):
        k = min(1, max(0, (y - y0) / max(1, (y1 - y0))))
        cor = tuple(int(topo[i] + (base[i] - topo[i]) * k) for i in range(3))
        gd.line([(0, y), (L, y)], fill=cor)

    # brilho externo
    halo = Image.new('L', (L, L), 0)
    ImageDraw.Draw(halo).polygon(pts, fill=150)
    halo = halo.filter(ImageFilter.GaussianBlur(L * 0.035))
    rosa = Image.new('RGB', (L, L), (255, 122, 156))
    fundo = Image.composite(rosa, fundo, halo.point(lambda v: int(v * 0.5)))

    fundo.paste(grad, (0, 0), mascara)
    fundo.resize((lado, lado), Image.LANCZOS).save(arquivo, optimize=True)

icone(192, 0.62, 'public/icons/icon-192.png')
icone(512, 0.62, 'public/icons/icon-512.png')
icone(512, 0.46, 'public/icons/icon-maskable-512.png')
icone(180, 0.6, 'public/icons/apple-touch-icon.png')
print('icones gerados')
