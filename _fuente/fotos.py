"""Lista de fotos de la demo (Pexels, licencia Pexels: uso comercial libre) y preparador de imagenes.
Uso (desde publicar/):  python -I _fuente/fotos.py
Baja cada foto del CDN de Pexels, la recorta a su proporcion y guarda WebP en varios tamanos en fotos/<rubro>/.
Las fotos ya estan en el repo: solo hace falta correr esto para sumar o cambiar fotos."""
import os, urllib.request
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# id: (autor, slug de la pagina en pexels.com/photo/<slug>/)
FOTOS = {
 # restaurante
 34636425: ("Novkov Visuals", "crispy-schnitzel-with-fresh-salad-on-plate-34636425"),
 18275671: ("Gonzalo Ruiz", "meat-and-lemons-18275671"),
 12308027: ("fadhil wy_", "cooked-food-on-white-ceramic-plate-12308027"),
 31917730: ("Raul Corrado", "traditional-argentine-asado-grilled-steak-31917730"),
 13689919: ("Daniel Torobekov", "close-up-shot-of-delicious-empanadas-on-wooden-chopping-board-13689919"),
 31637793: ("Gu Ko", "close-up-of-spaghetti-with-tomato-sauce-on-plate-31637793"),
 8743888: ("Farhad Ibrahimzade", "a-yellow-soup-decorated-with-leaves-in-a-bowl-beside-a-bowl-of-croutons-8743888"),
 9292084: ("Diego Moreno", "meat-on-the-grill-9292084"),
 37126417: ("Andres Idda Bianchi", "traditional-argentinian-asado-barbecue-grilling-37126417"),
 # panaderia
 35993723: ("wal_ 172619", "rustic-bread-display-on-wooden-shelves-35993723"),
 8633662: ("Lauren Heaton", "brown-breads-on-wooden-table-8633662"),
 37778433: ("Giovanna Kamimura", "delicious-brazilian-pao-de-queijo-in-basket-37778433"),
 7543099: ("Daniel Dan", "close-up-photo-of-freshly-baked-breads-7543099"),
 8470233: ("Rumeysa Demir", "slices-of-cakes-on-plates-8470233"),
 14520462: ("Kevin Nesh", "breads-in-bakery-14520462"),
 31139336: ("Magda Ehlers", "artistic-latte-with-heart-latte-art-on-wooden-table-31139336"),
 10481790: ("Chris F", "brown-breads-in-the-oven-10481790"),
 7405059: ("Furkan Tumer", "a-variety-of-breads-and-pastries-on-a-glass-display-counter-7405059"),
 # carnes
 10201880: ("Skyler Ewing", "sprinkling-salt-on-raw-meat-10201880"),
 15814251: ("helia ghaharian", "raw-t-bone-steak-on-ice-cubes-15814251"),
 34003516: ("Nadin Sh", "top-view-of-raw-steak-cuts-on-plates-34003516"),
 15378091: ("Eduardo Krajan", "meat-peppers-and-garlic-15378091"),
 28881687: ("Domenico Scaglione", "fresh-raw-sausages-with-rosemary-on-dark-background-28881687"),
 28881690: ("Domenico Scaglione", "rolled-raw-beef-on-dark-slate-surface-28881690"),
 4661802: ("Marina Utrabo", "sliced-meat-on-wooden-tray-4661802"),
 28881685: ("Domenico Scaglione", "assorted-cuts-of-raw-meat-on-dark-background-28881685"),
 # materiales
 38561974: ("David Antonio Cruz Naira", "worker-handling-bricks-on-construction-site-38561974"),
 37528609: ("SHOX ART", "concrete-blocks-on-wooden-pallet-at-construction-site-37528609"),
 17940311: ("Steve A Johnson", "close-up-photo-of-a-red-brick-wall-17940311"),
 39998305: ("Vikesh zen", "close-up-of-cement-being-mixed-with-shovel-39998305"),
 40264854: ("Burak Akmanoglu", "assorted-tools-on-a-wooden-workbench-40264854"),
 8985610: ("Artem Podrez", "tools-in-a-box-in-black-and-white-8985610"),
 30738887: ("Ali Salman Rizvi", "close-up-of-assorted-screwdriver-bits-30738887"),
 28867253: ("John Triwinata", "assorted-metal-bolts-in-storage-bins-28867253"),
 38575500: ("Joaquin Reyes Ramos", "assortment-of-hardware-fasteners-in-storage-bins-38575500"),
 6790036: ("Tima Miroshnichenko", "close-up-shot-of-carpentry-tools-6790036"),
 # ropa y regalos
 3965545: ("Ksenia Chernaya", "clothes-hanged-on-clothes-rack-3965545"),
 38194952: ("Daniel Mauricio Bertoli", "trendy-red-top-and-denim-jeans-on-display-38194952"),
 45982: ("Dom J", "gray-and-black-striped-crew-neck-top-45982"),
 15667095: ("solod_sha", "wool-sweater-and-jeans-15667095"),
 3998648: ("Hana Brannigan", "flat-lay-of-clothes-3998648"),
 7445133: ("Katrin Bolovtsova", "folded-clothes-on-brown-wooden-table-7445133"),
 9594426: ("Ron Lach", "fashion-clothing-paper-box-9594426"),
 35741388: ("himanshu lanjekar", "colorful-dresses-on-display-in-boutique-35741388"),
 5418892: ("Arina Krasnikova", "beige-trench-coat-hanging-on-clothes-rack-5418892"),
 8386654: ("Ron Lach", "pink-and-white-long-sleeve-shirt-hanging-on-gold-and-white-clothing-rack-8386654"),
}

# salida: (carpeta, nombre, id, proporcion (ancho, alto), anchos, calidad, foco (x, y) de 0 a 1)
SALIDAS = [
 ("restaurante", "portada", 34636425, (4, 3), (480, 720, 960, 1600), 70, (.6, .5)),
 ("restaurante", "milanesa-limon", 18275671, (4, 3), (480, 800), 74, (.5, .5)),
 ("restaurante", "milanesa-papas", 12308027, (4, 3), (480, 800), 74, (.5, .5)),
 ("restaurante", "pasta", 31637793, (4, 3), (480, 800), 74, (.5, .5)),
 ("restaurante", "sopa", 8743888, (4, 3), (480, 800), 74, (.5, .5)),
 ("restaurante", "empanadas", 13689919, (4, 3), (480, 800), 74, (.5, .5)),
 ("restaurante", "parrillada", 9292084, (4, 3), (480, 800), 74, (.5, .6)),
 ("restaurante", "asado-de-tira", 31917730, (4, 3), (480, 800), 74, (.5, .5)),
 ("restaurante", "costillar", 37126417, (4, 5), (480, 800), 74, (.5, .5)),
 ("panaderia", "portada", 35993723, (4, 3), (480, 720, 960, 1600), 70, (.5, .5)),
 ("panaderia", "pan-casero", 8633662, (4, 3), (480, 800), 74, (.5, .5)),
 ("panaderia", "pan-de-queso", 37778433, (4, 3), (480, 800), 74, (.5, .5)),
 ("panaderia", "pancitos", 7543099, (4, 3), (480, 800), 74, (.5, .5)),
 ("panaderia", "tortas", 8470233, (4, 3), (480, 800), 74, (.5, .45)),
 ("panaderia", "panes-semillas", 14520462, (4, 3), (480, 800), 74, (.4, .5)),
 ("panaderia", "cafe", 31139336, (4, 3), (480, 800), 74, (.45, .4)),
 ("panaderia", "horno", 10481790, (4, 3), (480, 800), 74, (.5, .5)),
 ("panaderia", "vitrina", 7405059, (4, 3), (480, 800), 74, (.5, .5)),
 ("carnes", "portada", 10201880, (4, 3), (480, 720, 960, 1600), 70, (.55, .5)),
 ("carnes", "t-bone", 15814251, (4, 3), (480, 800), 74, (.5, .5)),
 ("carnes", "bife-ancho", 34003516, (4, 3), (480, 800), 74, (.5, .7)),
 ("carnes", "tomahawk", 15378091, (4, 3), (480, 800), 74, (.5, .5)),
 ("carnes", "chorizo", 28881687, (4, 3), (480, 800), 74, (.5, .6)),
 ("carnes", "arrollado", 28881690, (4, 3), (480, 800), 74, (.5, .7)),
 ("carnes", "medallones", 4661802, (4, 3), (480, 800), 74, (.5, .5)),
 ("carnes", "cortes", 28881685, (4, 3), (480, 800), 74, (.5, .6)),
 ("materiales", "portada", 37528609, (4, 3), (480, 720, 960, 1600), 70, (.5, .5)),
 ("materiales", "ladrillo-hueco", 38561974, (1, 1), (360, 640), 74, (.5, .5)),
 ("materiales", "bloques", 37528609, (1, 1), (360, 640), 74, (.45, .5)),
 ("materiales", "ladrillos", 17940311, (1, 1), (360, 640), 74, (.5, .5)),
 ("materiales", "cemento", 39998305, (1, 1), (360, 640), 74, (.5, .5)),
 ("materiales", "martillos", 40264854, (1, 1), (360, 640), 74, (.5, .5)),
 ("materiales", "llaves", 8985610, (1, 1), (360, 640), 74, (.5, .5)),
 ("materiales", "puntas", 30738887, (1, 1), (360, 640), 74, (.5, .5)),
 ("materiales", "bulones", 28867253, (1, 1), (360, 640), 74, (.5, .4)),
 ("materiales", "tuercas", 38575500, (1, 1), (360, 640), 74, (.5, .5)),
 ("materiales", "brocas", 6790036, (1, 1), (360, 640), 74, (.4, .5)),
 ("ropa", "portada", 3965545, (4, 3), (480, 720, 960, 1600), 70, (.5, .55)),
 ("ropa", "top-y-jean", 38194952, (4, 5), (360, 640), 74, (.5, .5)),
 ("ropa", "pulover-tejido", 45982, (4, 5), (360, 640), 74, (.5, .5)),
 ("ropa", "pulover-y-jean", 15667095, (4, 5), (360, 640), 74, (.5, .5)),
 ("ropa", "looks-de-jean", 3998648, (4, 5), (360, 640), 74, (.5, .5)),
 ("ropa", "lino", 7445133, (4, 5), (360, 640), 74, (.4, .5)),
 ("ropa", "regalo-en-caja", 9594426, (4, 5), (360, 640), 74, (.5, .5)),
 ("ropa", "vestidos", 35741388, (4, 5), (360, 640), 74, (.5, .5)),
 ("ropa", "abrigos", 5418892, (4, 5), (360, 640), 74, (.5, .5)),
 ("ropa", "perchero", 8386654, (4, 3), (480, 800), 74, (.5, .45)),
 # portada "elegi tu rubro" (4:5)
 ("selector", "restaurante", 31917730, (4, 5), (360, 640), 72, (.5, .5)),
 ("selector", "panaderia", 8633662, (4, 5), (360, 640), 72, (.45, .5)),
 ("selector", "carnes", 15814251, (4, 5), (360, 640), 72, (.5, .5)),
 ("selector", "materiales", 40264854, (4, 5), (360, 640), 72, (.5, .5)),
 ("selector", "ropa", 35741388, (4, 5), (360, 640), 72, (.5, .5)),
]


def bajar(i):
    cache = os.path.join(RAIZ, "_fuente", "_cache")
    os.makedirs(cache, exist_ok=True)
    p = os.path.join(cache, "%d.jpg" % i)
    if not os.path.exists(p):
        u = "https://images.pexels.com/photos/%d/pexels-photo-%d.jpeg?auto=compress&cs=tinysrgb&w=1800" % (i, i)
        r = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0"}), timeout=60)
        open(p, "wb").write(r.read())
    return Image.open(p).convert("RGB")


def recortar(im, prop, foco):
    w, h = im.size
    pw, ph = prop
    if w * ph > h * pw:  # mas ancha que la proporcion: se recorta a los lados
        nw = int(h * pw / ph)
        x = int((w - nw) * foco[0])
        return im.crop((x, 0, x + nw, h))
    nh = int(w * ph / pw)
    y = int((h - nh) * foco[1])
    return im.crop((0, y, w, y + nh))


def main():
    mapa = {}
    for carpeta, nombre, i, prop, anchos, cal, foco in SALIDAS:
        im = recortar(bajar(i), prop, foco)
        os.makedirs(os.path.join(RAIZ, "fotos", carpeta), exist_ok=True)
        for a in anchos:
            if a > im.size[0]:
                continue
            h = round(a * prop[1] / prop[0])
            out = im.resize((a, h), Image.LANCZOS)
            f = os.path.join(RAIZ, "fotos", carpeta, "%s-%d.webp" % (nombre, a))
            out.save(f, "WEBP", quality=cal, method=6)
            mapa.setdefault((carpeta, nombre), []).append((a, h, os.path.getsize(f)))
    for k, v in mapa.items():
        print(k, v)
    # imagenes para compartir (1200x630, JPG liviano)
    for carpeta, nombre, i, prop, anchos, cal, foco in SALIDAS:
        if nombre == "portada":
            im = bajar(i)
            w, h = im.size
            nh = int(w * 630 / 1200)
            y = int((h - nh) * .5) if nh < h else 0
            og = im.crop((0, y, w, y + min(nh, h))).resize((1200, 630), Image.LANCZOS)
            og.save(os.path.join(RAIZ, "fotos", carpeta, "og.jpg"), "JPEG", quality=78, optimize=True, progressive=True)
    # collage de la portada selectora
    tiras = [31917730, 8633662, 15814251, 40264854, 35741388]
    col = Image.new("RGB", (1200, 630))
    for k, i in enumerate(tiras):
        t = recortar(bajar(i), (240, 630), (.5, .5)).resize((240, 630), Image.LANCZOS)
        col.paste(t, (k * 240, 0))
    os.makedirs(os.path.join(RAIZ, "fotos", "selector"), exist_ok=True)
    col.save(os.path.join(RAIZ, "fotos", "selector", "og.jpg"), "JPEG", quality=78, optimize=True, progressive=True)


if __name__ == "__main__":
    main()
