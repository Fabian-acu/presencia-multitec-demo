"""Arma fotos/mapa-cde.webp: 3x2 teselas de OpenStreetMap (zoom 15) del centro de Ciudad del Este.
Datos del mapa: colaboradores de OpenStreetMap (ODbL). Se baja una sola vez (uso liviano, con identificacion)."""
import math, os, io, urllib.request
from PIL import Image
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAT, LON, Z = -25.5097, -54.6111, 15
n = 2 ** Z
fx = (LON + 180) / 360 * n
fy = (1 - math.asinh(math.tan(math.radians(LAT))) / math.pi) / 2 * n
x0, y0 = int(fx) - 1, int(fy)   # 3 columnas (x0..x0+2) y 2 filas (y0..y0+1)
print("tile", int(fx), int(fy), "frac", fx - int(fx), fy - int(fy))
lienzo = Image.new("RGB", (768, 512))
for dx in range(3):
    for dy in range(2):
        u = "https://tile.openstreetmap.org/%d/%d/%d.png" % (Z, x0 + dx, y0 + dy)
        r = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "presencia-multitec-demo/1.0 (demo estatica)"}), timeout=30)
        lienzo.paste(Image.open(io.BytesIO(r.read())).convert("RGB"), (dx * 256, dy * 256))
# punto central del mapa = (fx - x0)*256, (fy - y0)*256
px, py = (fx - x0) * 256, (fy - y0) * 256
print("centro px", px, py)
w, h = 600, 450
left = max(0, min(768 - w, int(px - w / 2))); top = max(0, min(512 - h, int(py - h / 2)))
rec = lienzo.crop((left, top, left + w, top + h))
print("pin en %", (px - left) / w * 100, (py - top) / h * 100)
rec.save(os.path.join(RAIZ, "fotos", "mapa-cde.webp"), "WEBP", quality=70)
print(os.path.getsize(os.path.join(RAIZ, "fotos", "mapa-cde.webp")))
