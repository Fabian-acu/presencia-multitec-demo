"""Arma las paginas HTML de las demos (una por rubro) y la portada "Elegi tu rubro".
Uso (desde publicar/):  python -I _fuente/generar.py
Todo el contenido queda escrito en el HTML (titulo, OG, portada, secciones): no depende de JavaScript para verse."""
import os, sys, re, html, json, urllib.parse

AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from fotos import FOTOS, SALIDAS  # noqa: E402

RAIZ = os.path.dirname(AQUI)
BASE = "https://fabian-acu.github.io/presencia-multitec-demo/"
WA_NUM = "595981601211"
WA_PATH = open(os.path.join(AQUI, "wa_path.txt")).read().strip()
E = html.escape


LETRAS = {  # familias que usa cada pagina: solo se declaran (y se bajan) esas
    "restaurante": ("Bricolage Grotesque", "Figtree"), "selector": ("Bricolage Grotesque", "Figtree"), "salon": ("Bricolage Grotesque", "Figtree"),
    "odontologia": ("Figtree",), "panaderia": ("Young Serif", "Work Sans"), "carnes": ("Anton", "Archivo"),
    "materiales": ("Barlow Semi Condensed", "Barlow"), "taller": ("Barlow Semi Condensed", "Barlow"), "ropa": ("Outfit",),
}


def css_en_linea(prefijo_fuentes, tema):
    """pro.css va dentro del HTML (menos pedidos, portada mas rapida). Las rutas de letras se ajustan a la pagina y solo van las de su rubro."""
    c = open(os.path.join(RAIZ, "css", "pro.css"), encoding="utf-8").read()
    c = re.sub(r"/\*.*?\*/", "", c, flags=re.S)
    c = "\n".join(l for l in c.split("\n") if not l.startswith("@font-face") or any('"%s"' % f in l for f in LETRAS[tema]))
    c = re.sub(r"\s+", " ", c)
    c = re.sub(r" ?([{};,>]) ?", lambda m: m.group(1), c).replace(": ", ":")
    return "<style>" + c.replace("../fonts/", prefijo_fuentes) + "</style>"


def wa(rubro_txt):
    msg = "Hola, vi la demo de Presencia Multitec de %s y quiero una para mi negocio" % rubro_txt
    return "https://wa.me/%s?text=%s" % (WA_NUM, urllib.parse.quote(msg))


def ico():
    return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="%s"/></svg>' % WA_PATH


# ---------- fotos ----------
def info(carpeta, nombre):
    for c, n, i, prop, anchos, cal, foco in SALIDAS:
        if c == carpeta and n == nombre:
            ok = [a for a in anchos if os.path.exists(os.path.join(RAIZ, "fotos", c, "%s-%d.webp" % (n, a)))]
            return i, prop, ok
    raise KeyError((carpeta, nombre))


def img(P, carpeta, nombre, alt, sizes, eager=False, alta=None):
    i, prop, ok = info(carpeta, nombre)
    srcset = ", ".join("%sfotos/%s/%s-%d.webp %dw" % (P, carpeta, nombre, a, a) for a in ok)
    a = ok[min(1, len(ok) - 1)]
    h = round(a * prop[1] / prop[0])
    extra = (' fetchpriority="high"' if eager else ' decoding="async"') if (eager or alta) else ' loading="lazy" decoding="async"'
    return '<img src="%sfotos/%s/%s-%d.webp" srcset="%s" sizes="%s" width="%d" height="%d" alt="%s"%s>' % (
        P, carpeta, nombre, a, srcset, sizes, a, h, E(alt), extra)


def creditos(carpeta, nombres=None):
    ids = []
    for c, n, i, *_ in SALIDAS:
        if c == carpeta and (nombres is None or n in nombres) and i not in ids:
            ids.append(i)
    partes = ['<a href="https://www.pexels.com/photo/%s/" rel="noopener" target="_blank">%s<span class="solo-lector"> (se abre en otra pestaña)</span></a>' % (FOTOS[i][1], E(FOTOS[i][0])) for i in ids]
    return "Fotos de Pexels (licencia Pexels, uso libre): " + ", ".join(partes) + "."


# ---------- piezas comunes ----------
def estrellas(n=5):
    return '<span class="estrellas" aria-hidden="true">' + "★" * n + "</span>"


def opiniones(nombre_lugar, promedio, cantidad, lista):
    rs = ""
    for nom, ini, txt in lista:
        rs += ('<li class="resena"><div class="resena-cab"><span class="resena-ini" aria-hidden="true">%s</span>%s (ejemplo)</div>'
               '<div role="img" aria-label="5 de 5 estrellas">%s</div><p>%s</p></li>') % (ini, E(nom), estrellas(), E(txt))
    return ('<section class="sec sec-alt" aria-labelledby="h-op"><div class="ancho"><h2 class="sec-titulo" id="h-op">Opiniones de ejemplo</h2>'
            '<p class="sec-sub">Así se vería la calificación de tu negocio en Google Maps. Los nombres, el promedio y la cantidad son inventados.</p>'
            '<div class="calif"><div><div class="calif-res"><span class="calif-num">%s</span><div><div role="img" aria-label="%s de 5 estrellas">%s</div>'
            '<div class="calif-cant">%s opiniones (ejemplo)</div></div></div></div><ul class="resenas">%s</ul></div></div></section>') % (
        promedio, promedio, estrellas(), cantidad, rs)


def horarios_html(filas):
    out = ""
    for dias, dows, abre, cierra in filas:
        if abre:
            out += '<li data-dias="%s" data-abre="%s" data-cierra="%s"><span>%s</span><span class="hora">%s a %s</span></li>' % (",".join(map(str, dows)), abre, cierra, E(dias), abre, cierra)
        else:
            out += '<li data-dias="%s"><span>%s</span><span class="hora">Cerrado</span></li>' % (",".join(map(str, dows)), E(dias))
    return out


OSM = "https://www.openstreetmap.org/export/embed.html?bbox=-54.6171%2C-25.5137%2C-54.6051%2C-25.5057&layer=mapnik&marker=-25.5097%2C-54.6111"


def ubicacion(P, filas, cierre_wa_txt):
    return ('<section class="sec" id="ubicacion" aria-labelledby="h-hor"><div class="ancho dos">'
            '<div><h2 class="sec-titulo" id="h-hor">Horarios</h2><ul class="horarios">%s</ul></div>'
            '<div class="lugar"><h2 class="sec-titulo">Dónde estamos</h2><p class="dir">Ciudad del Este (dirección de ejemplo)</p>'
            '<div class="mapa-fachada" data-src="%s"><img src="%sfotos/mapa-cde.webp" width="600" height="450" loading="lazy" decoding="async" alt="Mapa del centro de Ciudad del Este">'
            '<span class="mapa-pin" style="top:39.7%%" aria-hidden="true"></span><span class="mapa-leyenda">Ubicación de ejemplo</span>'
            '<button class="btn btn-chico mapa-boton" type="button" id="ver-mapa">Ver mapa</button></div>'
            '<p class="mapa-attr">Mapa: © <a href="https://www.openstreetmap.org/copyright" rel="noopener" target="_blank">colaboradores de OpenStreetMap<span class="solo-lector"> (se abre en otra pestaña)</span></a></p>'
            '</div></div></section>') % (horarios_html(filas), OSM, P)


def acciones(r, wa_url):
    boton_wa = '<a class="btn btn-grande%s" id="wa-portada" href="%s" rel="noopener">%s<span>%s</span></a>' % (" btn-borde" if r.get("carta_primero") else "", wa_url, ico(), E(r.get("wa_label", "Escribinos por WhatsApp")))
    if r.get("carta_primero"):
        return '<a class="btn btn-grande" href="#carta">Ver la carta y pedir</a>' + boton_wa
    return boton_wa + r.get("sec_link", "")


def pagina(r):
    slug = r["slug"]
    P = "../"
    url = BASE + slug + "/"
    og = BASE + "fotos/%s/og.jpg" % slug
    i, prop, ok = info(slug, "portada")
    srcset = ", ".join("%sfotos/%s/portada-%d.webp %dw" % (P, slug, a, a) for a in ok)
    wa_url = wa(r["wa_rubro"])
    nombre_demo = r["nombre"] + " (Demo)"
    titulo = "%s | %s" % (nombre_demo, r["titulo_corto"])
    fp = r["fuente_h"]
    return """<!doctype html>
<html lang="es-PY" data-tema="%(tema)s" data-base="../">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>%(titulo)s</title>
<meta name="description" content="%(desc)s">
<meta name="theme-color" content="%(tc)s">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_PY">
<meta property="og:site_name" content="Presencia Multitec (Demo)">
<meta property="og:title" content="%(titulo)s">
<meta property="og:description" content="%(desc)s">
<meta property="og:url" content="%(url)s">
<meta property="og:image" content="%(og)s">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="%(heroalt)s">
<meta name="twitter:card" content="summary_large_image">
<link rel="preload" as="font" type="font/woff2" href="../fonts/%(fp)s" crossorigin>
<link rel="preload" as="image" imagesrcset="%(srcset)s" imagesizes="(min-width: 900px) 520px, 100vw" fetchpriority="high">
%(iconos)s
%(css)s
</head>
<body>
<a class="saltar" href="#contenido">Saltar al contenido</a>
<div class="demo-franja" role="note">Ejemplo: este negocio no existe. <a href="../">Ver otros rubros</a></div>
<header class="cab"><div class="ancho cab-in">
<a class="marca" href="#contenido">%(nombre_demo)s</a>
<div class="cab-der"><span class="estado" id="estado" aria-live="polite"></span>
<a class="btn btn-chico cab-wa" href="%(wa)s" rel="noopener">%(ico)s<span>%(wal)s</span></a></div>
</div></header>
<main id="contenido">
<section class="portada ancho" aria-labelledby="h-portada">
<div class="portada-foto">%(hero)s</div>
<div class="portada-txt">
<p class="rubro">%(rubro)s</p>
<h1 id="h-portada">%(h1)s</h1>
<p class="sub">%(sub)s</p>
<div class="acciones%(acc_cls)s">%(acc)s</div>
<p class="nota-demo">En esta demo, el botón te comunica con Multitec.</p>
</div>
</section>
%(cuerpo)s
%(ubic)s
<section class="cierre"><div class="ancho"><h2 class="cierre-titulo">%(cierre)s</h2>
<a class="btn btn-grande" id="wa-cierre" href="%(wa)s" rel="noopener">%(ico)s<span>%(wal)s</span></a>
<p class="nota-demo" style="color:inherit;opacity:.8">En esta demo, el botón te comunica con Multitec.</p></div></section>
</main>
<footer class="pie"><div class="ancho">
<p>© 2026 %(nombre_demo)s. Negocio de ejemplo.</p>
<p>%(creditos)s</p>
<p>Letras: %(letras)s (licencia SIL OFL 1.1), alojadas en este sitio.</p>
<p>Web hecha con Presencia Multitec</p>
<div class="enlaces"><a href="../privacidad.html">Privacidad</a><a href="../">Ver otros rubros</a></div>
</div></footer>
<div class="barra-wa"><a class="btn btn-grande" href="%(wa)s" rel="noopener">%(ico)s<span>%(wal)s</span></a><small>En esta demo, el botón te comunica con Multitec.</small></div>
%(extra)s
<script src="../js/pro.js" defer></script>
%(chatjs)s</body>
</html>
""" % dict(
        tema=slug, titulo=E(titulo), desc=E(r["desc"]), tc=r["theme_color"], url=url, og=og, heroalt=E(r["hero_alt"]), fp=fp, srcset=srcset,
        nombre_demo=E(nombre_demo), wa=wa_url, wal=E(r.get("wa_label", "Escribinos por WhatsApp")), acc_cls=" acciones-par" if r.get("carta_primero") else "", ico=ico(), hero=img(P, slug, "portada", r["hero_alt"], "(min-width: 900px) 520px, 100vw", eager=True),
        rubro=E(r["rubro"]), h1=E(r["h1"]), sub=E(r["sub"]), acc=acciones(r, wa_url), cuerpo=r["cuerpo"],
        ubic=ubicacion(P, r["horarios"], ""), css=css_en_linea("../fonts/", slug), iconos=iconos("../"), chatjs=CHAT_JS % "../" if r.get("chat_js") else "", cierre=E(r["cierre"]), creditos=creditos(slug), letras=E(r["letras"]), extra=r.get("extra", ""))


HOJA = ('<dialog id="hoja" aria-labelledby="hoja-t"><h2 id="hoja-t" style="font-size:1.25rem">Así le llega a tu WhatsApp</h2>'
        '<p class="hoja-msg" id="hoja-msg"></p><div class="acciones"><a class="btn" href="%s" rel="noopener">Quiero una web así</a>'
        '<button class="btn btn-borde" type="button" data-cerrar>Cerrar</button></div></dialog>')


def tarjeta(P, carpeta, foto, alt, nombre, desc, pie_html, cat="", texto=""):
    return ('<li class="tarjeta" data-rv%s%s><div class="tarjeta-foto">%s</div><div class="tarjeta-txt"><h3>%s</h3><p>%s</p>%s</div></li>') % (
        ' data-cat="%s"' % cat if cat else "", ' data-texto="%s"' % E(texto) if texto else "",
        img(P, carpeta, foto, alt, "(min-width: 900px) 360px, (min-width: 640px) 45vw, 100vw"), E(nombre), E(desc), pie_html)


def fila(P, carpeta, foto, alt, nombre, desc, pie_html, cat):
    return ('<li class="fila" data-rv data-cat="%s"><div class="fila-foto">%s</div><div class="fila-txt"><h3>%s</h3><p>%s</p>%s</div></li>') % (
        cat, img(P, carpeta, foto, alt, "104px"), E(nombre), E(desc), pie_html)


def boton_consulta(texto_msg, etiqueta="Consultar"):
    return '<button class="btn btn-chico" type="button" data-consulta="%s">%s</button>' % (E(texto_msg), E(etiqueta))


# ---------- favicon ----------
def iconos(P):
    return ('<link rel="icon" type="image/png" sizes="32x32" href="%sfotos/marca/favicon-32.png">\n'
            '<link rel="icon" type="image/png" sizes="48x48" href="%sfotos/marca/favicon-48.png">\n'
            '<link rel="apple-touch-icon" href="%sfotos/marca/apple-touch-180.png">') % (P, P, P)


# ---------- chat de ejemplo (textos en _fuente/chats.json) ----------
CHAT_JS = '<script src="%sjs/chat.js?v=20261122" defer></script>\n'
TOPE_GLOBO = 140      # caracteres por globo (3 lineas a 343 px)
TOPE_MENSAJES = 6     # globos de cliente y asistente por chat
RAYAS = (chr(0x2014), chr(0x2013))   # raya larga y raya corta
EMOJI = re.compile("[" + chr(0x1F300) + "-" + chr(0x1FAFF) + chr(0x2600) + "-" + chr(0x27BF) + chr(0x2B50) + chr(0x2B55) + "]")
NOTA_BOTON = {"portada": "Este botón te comunica con Multitec.", "rubro": "En esta demo, el botón te comunica con Multitec."}


def cargar_chats():
    datos = json.load(open(os.path.join(AQUI, "chats.json"), encoding="utf-8"))
    return {k: v for k, v in datos.items() if not k.startswith("_")}


def validar_chat(slug, c, nombre):
    """Corta la regeneracion (sin escribir nada) si un chat rompe las reglas de Valentina, Ramiro y Emilia."""
    def falla(m):
        sys.exit("chats.json [%s]: %s" % (slug, m))
    if not c.get("rotulo"):
        falla("falta 'rotulo' (ej.: \"Asistente de {negocio}\")")
    msgs = c.get("mensajes") or []
    if not msgs:
        falla("sin mensajes")
    if len([m for m in msgs if m.get("de") in ("c", "a")]) > TOPE_MENSAJES:
        falla("mas de %d mensajes" % TOPE_MENSAJES)
    emojis = 0
    for campo in ("rotulo", "titulo", "bajada", "boton", "wa_texto"):
        if any(r in c.get(campo, "") for r in RAYAS):
            falla("raya larga en '%s'" % campo)
    for i, m in enumerate(msgs, 1):
        de = m.get("de")
        if de not in ("c", "a", "sep", "chips"):
            falla("mensaje %d: 'de' tiene que ser c, a, sep o chips" % i)
        if de == "chips":
            continue
        t = m.get("texto", "")
        if not t:
            falla("mensaje %d sin texto" % i)
        if de in ("c", "a") and len(t.replace("{negocio}", nombre)) > TOPE_GLOBO:
            falla("mensaje %d pasa de %d caracteres (%d)" % (i, TOPE_GLOBO, len(t.replace("{negocio}", nombre))))
        for campo in ("texto", "cartel", "chip"):
            v = m.get(campo, "")
            if any(r in v for r in RAYAS):
                falla("mensaje %d: raya larga en '%s'" % (i, campo))
            emojis += len(EMOJI.findall(v))
    if emojis > 1:
        falla("%d emojis (maximo 1 por chat)" % emojis)


CHATS = cargar_chats()
for _s, _c in CHATS.items():
    validar_chat(_s, _c, "N" * 30)   # peor caso de largo del nombre; antes de escribir nada


def hueco(texto, nombre):
    """Escapa primero; despues {negocio} y [campo cargado por el negocio]."""
    t = E(texto).replace("{negocio}", E(nombre))
    return re.sub(r"\[([^\]]+)\]", lambda m: '<span class="g-hueco">' + chr(0x2039) + m.group(1) + chr(0x203a) + '</span>', t)


def chat_html(slug, P, nombre, chips=()):
    c = CHATS[slug]
    validar_chat(slug, c, nombre)
    for k in ("titulo", "bajada", "boton", "wa_texto"):
        if not c.get(k):
            sys.exit("chats.json [%s]: falta '%s'" % (slug, k))
    if len(c["bajada"].split()) > 20:
        sys.exit("chats.json [%s]: la bajada pasa de 20 palabras" % slug)
    items = ""
    for m in c["mensajes"]:
        de = m["de"]
        if de == "sep":
            items += '<li class="g g-sep"><div class="g-cont"><p class="g-meta">%s</p></div></li>' % E(m["texto"])
        elif de == "chips":
            if not chips:
                sys.exit("chats.json [%s]: 'chips' sin rubros publicados" % slug)
            items += '<li class="g g-chips"><div class="g-cont">%s</div></li>' % "".join(
                '<a class="chat-chip" href="%s">%s</a>' % (E(h), E(n)) for h, n in chips)
        else:
            cartel = '<p class="g-meta">%s</p>' % E(m["cartel"]) if m.get("cartel") else ""
            chip = '<p class="g-meta g-chip">%s</p>' % E(m["chip"]) if m.get("chip") else ""
            items += '<li class="g g-%s"><div class="g-cont">%s<p class="g-txt">%s</p>%s</div></li>' % (de, cartel, hueco(m["texto"], nombre), chip)
    if c.get("avatar"):
        av = '<span class="chat-av" aria-hidden="true"><img src="%s%s" width="40" height="40" alt=""></span>' % (P, E(c["avatar"]))
    else:
        av = '<span class="chat-av" aria-hidden="true">%s</span>' % E(c.get("inicial", nombre[:1]))
    wa_chat = "https://wa.me/%s?text=%s" % (WA_NUM, urllib.parse.quote(c["wa_texto"]))
    nota = NOTA_BOTON["portada" if slug == "portada" else "rubro"]
    return ('<section class="sec sec-chat" id="chat" aria-labelledby="h-chat"><div class="ancho chat-sec">'
            '<div class="chat-intro"><h2 class="sec-titulo" id="h-chat">%s</h2><p class="sec-sub">%s</p></div>'
            '<div class="chat-col"><figure class="chat" data-chat aria-label="Conversación de ejemplo">'
            '<figcaption class="chat-cab">%s<span class="chat-quien"><strong>%s</strong><small>Conversación de ejemplo · se arma para tu negocio</small></span></figcaption>'
            '<ol class="chat-lista">%s</ol></figure></div>'
            '<div class="chat-cta"><a class="btn btn-grande btn-wa" id="wa-chat" href="%s" rel="noopener">%s<span>%s</span></a>'
            '<p class="nota-demo">%s</p></div></div></section>') % (
        E(c["titulo"]), E(c["bajada"]), av, hueco(c["rotulo"], nombre), items, wa_chat, ico(), E(c["boton"]), nota)



P = "../"
paginas = []

# ================= RESTAURANTE =================
NOM_REST = "Comedor Tape Porã"
rest_items = [
    ("milanesa-limon", "Milanesa con limón", "Milanesa de carne dorada, con limón y ensalada.", 38000, "platos", "Milanesa dorada con limón sobre tabla de madera"),
    ("milanesa-papas", "Milanesa con papas fritas", "Con papas fritas caseras, el plato de todos los días.", 42000, "platos", "Milanesa con papas fritas en plato blanco"),
    ("pasta", "Pasta con tomate", "Fideos con salsa de tomate, bien servidos.", 36000, "platos", "Plato de fideos con salsa de tomate"),
    ("sopa", "Sopa del día", "Sopa caliente de la casa, con crutones.", 22000, "platos", "Sopa cremosa con crutones en un bol"),
    ("asado-de-tira", "Asado de tira", "Costillas a la parrilla, con pan.", 65000, "parrilla", "Costillas asadas sobre tabla con pan"),
    ("parrillada", "Parrillada para dos", "Cortes variados a la parrilla, para compartir.", 120000, "parrilla", "Cortes de carne y limones sobre la parrilla"),
    ("empanadas", "Empanadas (media docena)", "Horneadas, con salsa verde.", 30000, "compartir", "Empanadas horneadas sobre tabla de madera"),
]
cards = ""
for f, n, d, pr, cat, alt in rest_items:
    gs = "{:,}".format(pr).replace(",", ".")
    pie = ('<div class="tarjeta-pie"><span class="precio">Gs. %s</span>'
           '<button class="btn btn-chico" type="button" data-pedido data-id="%s" data-nombre="%s" data-precio="%d" aria-label="Agregar %s al pedido">Agregar</button></div>') % (gs, f, E(n), pr, E(n))
    cards += fila(P, "restaurante", f, alt, n, d, pie, cat)
cuerpo = ('<section class="sec" id="carta" aria-labelledby="h-carta"><div class="ancho">'
          '<h2 class="sec-titulo" id="h-carta">La carta de hoy</h2>'
          '<p class="sec-sub">Precios de ejemplo en guaraníes (demo). Armá un pedido de prueba: no se hace ningún pedido real.</p>'
          '<div class="chips chips-fijos" role="group" aria-label="Categorías de la carta">'
          '<button class="chip" type="button" data-chip="todo" aria-pressed="true">Todo</button>'
          '<button class="chip" type="button" data-chip="platos" aria-pressed="false">Platos</button>'
          '<button class="chip" type="button" data-chip="parrilla" aria-pressed="false">Parrilla</button>'
          '<button class="chip" type="button" data-chip="compartir" aria-pressed="false">Para compartir</button></div>'
          '<ul class="filas" data-filtrable>%s</ul></div></section>') % cards
cuerpo += chat_html("restaurante", P, NOM_REST)
cuerpo += ('<section class="sec sec-alt" aria-labelledby="h-par"><div class="ancho banda"><div class="banda-foto">%s</div>'
           '<div class="banda-txt"><h2 class="sec-titulo" id="h-par">Desde la parrilla</h2>'
           '<p>El fuego se prende de martes a domingo. Para el fin de semana, preguntá por la parrillada para compartir.</p>'
           '<a class="btn" href="#carta">Ver la carta</a></div></div></section>') % img(P, "restaurante", "costillar", "Costillares asados sobre brasas", "(min-width: 900px) 520px, 100vw")
cuerpo += opiniones("", "4,6", "128", [
    ("Marcos A.", "M", "La milanesa llegó caliente y abundante. Volvemos el domingo."),
    ("Lorena G.", "L", "Atención rápida y buena parrilla. Fuimos con los chicos y la pasamos bien."),
    ("Sergio P.", "S", "Buen almuerzo del día, bien servido. El local está siempre limpio."),
])
paginas.append(dict(
    slug="restaurante", nombre=NOM_REST, chat_js=True, rubro="Restaurante", titulo_corto="Ejemplo de web para restaurante",
    desc="Demo de página web para un restaurante: carta con fotos, pedido de prueba, horarios y WhatsApp. Es un ejemplo de Presencia Multitec.",
    h1="Almuerzo casero, listo a las 11:30.", sub="Milanesas, pastas y parrilla. Mirá la carta y armá tu pedido.",
    hero_alt="Milanesa dorada con ensalada fresca en plato blanco", wa_rubro="restaurante", theme_color="#ffffff",
    fuente_h="bricolage-700.woff2", letras="Bricolage Grotesque y Figtree", cuerpo=cuerpo,
    carta_primero=True, cierre="¿Reservamos tu mesa?", extra="",
    horarios=[("Martes a domingo", [2, 3, 4, 5, 6, 0], "11:30", "23:00"), ("Lunes", [1], None, None)]))

# ================= PANADERIA Y CAFE =================
pan_items = [
    ("pan-casero", "Pan casero", "Corteza crocante y miga abierta.", "Pan casero de corteza dorada sobre mesa de madera"),
    ("pan-de-queso", "Chipa", "Se hornea a media mañana, sale calentita.", "Chipas calientes en una canasta de mimbre"),
    ("pancitos", "Pancitos", "Livianos, para el desayuno y la merienda.", "Pancitos recién horneados"),
    ("tortas", "Tortas por encargo", "Pedí tu torta con anticipación, por WhatsApp.", "Porciones de torta en una vitrina de vidrio"),
    ("panes-semillas", "Panes de semillas", "Con semillas por encima, de la vitrina.", "Panes largos con semillas en un estante"),
    ("cafe", "Café con leche", "Para tomar acá o llevar.", "Taza de café con leche sobre un plato blanco"),
]
cards = ""
for f, n, d, alt in pan_items:
    pie = '<div class="tarjeta-pie"><span class="precio">Precio: consultá</span>%s</div>' % boton_consulta("quiero consultar por %s" % n)
    cards += tarjeta(P, "panaderia", f, alt, n, d, pie)
cuerpo = ('<section class="sec" aria-labelledby="h-hor-pan"><div class="ancho banda"><div><h2 class="sec-titulo" id="h-hor-pan">Horneadas del día</h2>'
          '<p class="sec-sub">Horarios de ejemplo en que sale el pan de la casa.</p></div>'
          '<ul class="horneadas"><li><span>Pan casero</span><b>06:30</b></li><li><span>Chipa</span><b>10:00</b></li><li><span>Pancitos</span><b>16:00</b></li></ul></div></section>')
cuerpo += ('<section class="sec sec-alt" id="vitrina" aria-labelledby="h-vit"><div class="ancho"><h2 class="sec-titulo" id="h-vit">La vitrina</h2>'
           '<p class="sec-sub">Pan, tortas y café, todos los días. Los precios los confirmamos por WhatsApp.</p><ul class="tarjetas tarjetas-2">%s</ul></div></section>') % cards
cuerpo += chat_html("panaderia", P, "Panadería Horno Viejo")
cuerpo += ('<section class="sec" aria-labelledby="h-enc"><div class="ancho banda"><div class="duo"><div class="banda-foto">%s</div><div class="banda-foto">%s</div></div>'
           '<div class="banda-txt"><h2 class="sec-titulo" id="h-enc">Encargá tu torta</h2><p>Contanos para cuándo la necesitás y cuántas personas son. Te respondemos por WhatsApp.</p>'
           '<a class="btn" data-oculta-barra href="%s" rel="noopener">%s<span>Encargar por WhatsApp</span></a></div></div></section>') % (
    img(P, "panaderia", "horno", "Panes dorados dentro del horno", "(min-width: 900px) 260px, 50vw"),
    img(P, "panaderia", "vitrina", "Vitrina con panes y masas dulces", "(min-width: 900px) 260px, 50vw"), wa("panadería"), ico())
cuerpo += opiniones("", "4,7", "96", [
    ("Carmen R.", "C", "El pan sale calentito a la mañana. La torta que encargué llegó justo a tiempo."),
    ("Diego F.", "D", "Buena chipa y buen café. Se llena a la tarde, conviene ir temprano."),
    ("Patricia M.", "P", "Siempre me atienden con una sonrisa. Lo recomiendo."),
])
paginas.append(dict(
    slug="panaderia", nombre="Panadería Horno Viejo", chat_js=True, rubro="Panadería y café", titulo_corto="Ejemplo de web para panadería y café",
    desc="Demo de página web para una panadería y café: horneadas del día, vitrina, tortas por encargo y WhatsApp. Es un ejemplo de Presencia Multitec.",
    h1="Pan caliente desde las 6:30, de lunes a sábado.", sub="Pan casero, chipa y café. Encargá tu torta por WhatsApp.",
    hero_alt="Panes rústicos en estantes de madera", wa_rubro="panadería", theme_color="#ffffff",
    fuente_h="youngserif-400.woff2", letras="Young Serif y Work Sans", cuerpo=cuerpo,
    sec_link='<a class="enlace" href="#vitrina">Ver la vitrina</a>', cierre="¿Te guardamos el pan de hoy?", extra=HOJA % wa("panadería"),
    horarios=[("Lunes a sábado", [1, 2, 3, 4, 5, 6], "06:30", "19:30"), ("Domingo", [0], "07:00", "12:00")]))

# ================= CARNES =================
carne_items = [
    ("t-bone", "T-bone", "Bife con hueso, para la parrilla.", "T-bone crudo sobre hielo con ají y pimienta"),
    ("bife-ancho", "Bife ancho", "Para parrilla o plancha.", "Dos bifes anchos crudos sobre platos de cerámica"),
    ("tomahawk", "Tomahawk", "Corte grande con hueso, para compartir.", "Tomahawk crudo con hierbas y especias"),
    ("chorizo", "Chorizo fresco", "Para la parrilla, se vende por kilo.", "Chorizos frescos con una rama de romero"),
    ("arrollado", "Arrollado de carne", "Atado y listo para el horno.", "Arrollado de carne cruda sobre pizarra"),
    ("medallones", "Medallones", "Cortes redondos, para plancha o sartén.", "Medallones de carne cruda sobre tabla de madera"),
]
cards = ""
for f, n, d, alt in carne_items:
    pie = '<div class="tarjeta-pie"><span class="precio">Precio por kg: consultá</span>%s</div>' % boton_consulta("quiero consultar por %s" % n)
    cards += tarjeta(P, "carnes", f, alt, n, d, pie)
cuerpo = ('<section class="sec" id="cortes" aria-labelledby="h-cortes"><div class="ancho"><h2 class="sec-titulo" id="h-cortes">Los cortes de la casa</h2>'
          '<p class="sec-sub">Fotos de ejemplo. El precio por kilo lo confirmamos por WhatsApp.</p><ul class="tarjetas">%s</ul></div></section>') % cards
cuerpo += chat_html("carnes", P, "Cortes del Este")
cuerpo += ('<section class="sec sec-alt" aria-labelledby="h-ped"><div class="ancho banda"><div class="banda-foto">%s</div>'
           '<div class="banda-txt"><h2 class="sec-titulo" id="h-ped">Consultá por tu asado del finde</h2>'
           '<ol class="pasos"><li><strong>Contanos cuántos son</strong> y qué cortes querés.</li><li><strong>Te confirmamos</strong> disponibilidad y precio por kilo.</li><li><strong>Coordinamos</strong> cómo lo retirás.</li></ol>'
           '<a class="btn" data-oculta-barra href="%s" rel="noopener">%s<span>Consultar por WhatsApp</span></a></div></div></section>') % (
    img(P, "carnes", "cortes", "Cortes de carne cruda sobre fondo oscuro", "(min-width: 900px) 520px, 100vw"), wa("carnicería"), ico())
paginas.append(dict(
    slug="carnes", nombre="Cortes del Este", chat_js=True, rubro="Carnicería boutique", titulo_corto="Ejemplo de web para carnicería",
    desc="Demo de página web para una carnicería: cortes con foto, consulta de precio por kilo y WhatsApp. Es un ejemplo de Presencia Multitec.",
    h1="Cortes para tu asado, listos para llevar.", sub="Elegí el corte y consultá el precio por kilo por WhatsApp.",
    hero_alt="Corte de carne cruda con sal gruesa y romero sobre fondo oscuro", wa_rubro="carnicería", theme_color="#141414",
    fuente_h="anton-400.woff2", letras="Anton y Archivo", cuerpo=cuerpo,
    sec_link='<a class="enlace" href="#cortes">Ver los cortes</a>', cierre="¿Qué asado armamos este finde?", extra=HOJA % wa("carnicería"),
    horarios=[("Lunes a sábado", [1, 2, 3, 4, 5, 6], "07:00", "19:00"), ("Domingo", [0], "07:00", "12:00")]))

# ================= MATERIALES =================
mat_items = [
    ("ladrillo-hueco", "Ladrillo hueco", "albañilería", "Albañilería", "ladrillo bloque pared construccion obra", "Mano con guante apoyando un ladrillo hueco"),
    ("bloques", "Bloques de hormigón", "albañilería", "Albañilería", "bloque hormigon cemento pared obra", "Bloques de hormigón sobre un pallet de madera"),
    ("ladrillos", "Ladrillos comunes", "albañilería", "Albañilería", "ladrillo rojo pared construccion", "Ladrillos rojos apilados"),
    ("cemento", "Cemento y mezcla", "albañilería", "Albañilería", "cemento mezcla mortero arena obra", "Mezcla de cemento con una pala"),
    ("martillos", "Martillos", "herramientas", "Herramientas", "martillo mazo herramienta guantes", "Martillos y guantes sobre un banco de madera"),
    ("llaves", "Juego de llaves y dados", "herramientas", "Herramientas", "llave dado herramienta mecanica juego", "Juego de llaves y dados en su maletín"),
    ("puntas", "Puntas de destornillador", "herramientas", "Herramientas", "punta destornillador atornillador herramienta", "Puntas de destornillador en un estuche"),
    ("bulones", "Bulones", "ferretería", "Ferretería", "bulon tornillo ferreteria fijacion", "Bulones de metal en cajones"),
    ("tuercas", "Tuercas y arandelas", "ferretería", "Ferretería", "tuerca arandela ferreteria fijacion", "Tuercas y arandelas en bandejas"),
    ("brocas", "Brocas", "ferretería", "Ferretería", "broca taladro mecha ferreteria", "Brocas ordenadas en una caja de madera"),
]
fichas = ""
for f, n, cat, catn, sin, alt in mat_items:
    fichas += ('<li class="ficha" data-rv data-cat="%s" data-texto="%s"><div class="ficha-foto">%s</div><div class="ficha-txt"><div><h3>%s</h3><p class="contador" style="margin:0">%s</p></div>%s</div></li>') % (
        cat, E((n + " " + catn + " " + sin).lower()), img(P, "materiales", f, alt, "(min-width: 900px) 260px, (min-width: 640px) 30vw, 50vw"), E(n), catn,
        '<button class="btn btn-chico" type="button" data-consulta="%s">Pedir precio</button>' % E("quiero pedir precio de %s" % n))
cuerpo = ('<section class="sec" id="catalogo" aria-labelledby="h-cat"><div class="ancho"><h2 class="sec-titulo" id="h-cat">Catálogo</h2>'
          '<p class="sec-sub">Buscá por nombre o elegí una categoría y pedí el precio por WhatsApp.</p>'
          '<div class="buscador"><label for="buscar">Buscar un producto</label><input id="buscar" type="search" placeholder="Ej.: ladrillo, martillo, tuercas" autocomplete="off"></div>'
          '<div class="chips" role="group" aria-label="Categorías">'
          '<button class="chip" type="button" data-chip="todo" aria-pressed="true">Todo</button>'
          '<button class="chip" type="button" data-chip="albañilería" aria-pressed="false">Albañilería</button>'
          '<button class="chip" type="button" data-chip="herramientas" aria-pressed="false">Herramientas</button>'
          '<button class="chip" type="button" data-chip="ferretería" aria-pressed="false">Ferretería</button></div>'
          '<p class="contador" id="contador" aria-live="polite">10 productos</p>'
          '<ul class="fichas" data-filtrable>%s</ul>'
          '<div class="vacio" id="sin-resultados" hidden><p><strong>No lo encontramos.</strong> Mandanos la lista por WhatsApp y te respondemos.</p>'
          '<a class="btn" href="%s" rel="noopener">%s<span>Mandanos tu lista por WhatsApp</span></a></div></div></section>') % (fichas, wa("materiales"), ico())
cuerpo += chat_html("materiales", P, "Materiales Monday")
paginas.append(dict(
    slug="materiales", nombre="Materiales Monday", chat_js=True, rubro="Materiales y ferretería", titulo_corto="Ejemplo de web para materiales de construcción",
    desc="Demo de página web para un corralón y ferretería: catálogo con buscador, pedido de precio por WhatsApp y horarios. Es un ejemplo de Presencia Multitec.",
    h1="Pedí tu presupuesto por WhatsApp.", sub="Buscá en el catálogo y consultá el precio de lo que necesitás para tu obra.",
    hero_alt="Bloques de hormigón apilados sobre un pallet de madera", wa_rubro="materiales de construcción", theme_color="#f4f4f5",
    fuente_h="barlowsc-700.woff2", letras="Barlow y Barlow Semi Condensed", cuerpo=cuerpo,
    sec_link='<a class="enlace" href="#catalogo">Ver el catálogo</a>', cierre="¿Qué necesitás para tu obra?", extra=HOJA % wa("materiales de construcción"),
    horarios=[("Lunes a viernes", [1, 2, 3, 4, 5], "07:00", "17:30"), ("Sábado", [6], "07:00", "12:00"), ("Domingo", [0], None, None)]))

# ================= ROPA Y REGALOS =================
ropa_items = [
    ("top-y-jean", "Top rojo y jean", "Para combinar", "Top rojo y pantalón jean sobre una mesa", True),
    ("pulover-tejido", "Pulóver tejido", "Tejido a rayas", "Pulóver tejido de rayas azules y grises", False),
    ("pulover-y-jean", "Pulóver de lana y jean", "Abrigo liviano", "Pulóver de lana crema sobre un jean", False),
    ("looks-de-jean", "Looks de jean", "Remeras y pantalones", "Prendas de jean y remeras dobladas sobre madera", False),
    ("lino", "Lino para regalar", "Atado con hilo", "Prendas de lino dobladas y atadas con hilo", False),
    ("regalo-en-caja", "Regalo en caja", "Listo para entregar", "Prenda blanca dentro de una caja de cartón", False),
    ("vestidos", "Vestidos de verano", "Colores vivos", "Vestidos de colores en un perchero dorado", False),
    ("abrigos", "Abrigos livianos", "Para entretiempo", "Abrigos claros en un perchero", False),
]
prendas = ""
for f, n, d, alt, _nuevo in ropa_items:
    prendas += ('<li class="prenda" data-rv><div class="prenda-foto">%s</div><h3>%s</h3><p>%s. %s</p>%s</li>') % (
        img(P, "ropa", f, alt, "(min-width: 900px) 260px, (min-width: 640px) 30vw, 50vw"), E(n), E(d),
        "Colores: consultá." if f in ("lino", "regalo-en-caja") else "Talles: consultá.",
        boton_consulta("quiero consultar disponibilidad de %s" % n, "Consultar"))
cuerpo = ('<section class="sec" id="vidriera" aria-labelledby="h-vid"><div class="ancho"><h2 class="sec-titulo" id="h-vid">La vidriera</h2>'
          '<p class="sec-sub">Prendas de ejemplo. Consultá talle, color y disponibilidad por WhatsApp.</p><ul class="vidriera">%s</ul></div></section>') % prendas
cuerpo += chat_html("ropa", P, "Casa Jazmín")
cuerpo += ('<section class="sec sec-alt" aria-labelledby="h-vis"><div class="ancho banda"><div class="banda-foto">%s</div>'
           '<div class="banda-txt"><h2 class="sec-titulo" id="h-vis">Pasá a probártelo</h2><p>Consultá talles por WhatsApp.</p>'
           '<a class="btn" data-oculta-barra href="%s" rel="noopener">%s<span>Escribinos por WhatsApp</span></a></div></div></section>') % (
    img(P, "ropa", "perchero", "Perchero con prendas de colores suaves", "(min-width: 900px) 520px, 100vw"), wa("tienda de ropa"), ico())
paginas.append(dict(
    slug="ropa", nombre="Casa Jazmín", chat_js=True, rubro="Ropa y regalos", titulo_corto="Ejemplo de web para tienda de ropa y regalos",
    desc="Demo de página web para una tienda de ropa y regalos: vidriera con fotos, consulta de talles y WhatsApp. Es un ejemplo de Presencia Multitec.",
    h1="Mirá la vidriera, consultá tu talle.", sub="Prendas de ejemplo. Consultá disponibilidad por WhatsApp.",
    hero_alt="Local de ropa con prendas colgadas y plantas", wa_rubro="tienda de ropa", theme_color="#ffffff",
    fuente_h="outfit-600.woff2", letras="Outfit", cuerpo=cuerpo,
    sec_link='<a class="enlace" href="#vidriera">Ver la vidriera</a>', cierre="¿Qué talle buscás?", extra=HOJA % wa("tienda de ropa"),
    horarios=[("Lunes a sábado", [1, 2, 3, 4, 5, 6], "09:00", "19:00"), ("Domingo", [0], None, None)]))

# ================= RUBROS NUEVOS (tanda 4): salon, odontologia, taller =================
# Textos: estructura y tono de las demos existentes, sin precios, sin opiniones, sin cifras ni claims.
def fila_servicio(nombre, desc, cat=""):
    return ('<li class="servicio"%s><div><h3>%s</h3><p>%s</p></div>%s</li>') % (
        ' data-cat="%s"' % cat if cat else "", E(nombre), E(desc), boton_consulta("quiero pedir turno para %s" % nombre.lower(), "Pedir turno"))


def banda_pasos(carpeta, foto, alt, titulo, pasos, boton, wa_url):
    lis = "".join("<li><strong>%s</strong>%s</li>" % (E(a), E(b)) for a, b in pasos)
    return ('<section class="sec sec-alt" aria-labelledby="h-pasos"><div class="ancho banda"><div class="banda-foto">%s</div>'
            '<div class="banda-txt"><h2 class="sec-titulo" id="h-pasos">%s</h2><ol class="pasos">%s</ol>'
            '<a class="btn" data-oculta-barra href="%s" rel="noopener">%s<span>%s</span></a></div></div></section>') % (
        img(P, carpeta, foto, alt, "(min-width: 900px) 520px, 100vw"), E(titulo), lis, wa_url, ico(), E(boton))


# ---- SALON DE BELLEZA (peluqueria + unas) ----
NOM_SALON = "Estudio Cobalto"
salon_items = [
    ("peluqueria", "Corte", "Corte de pelo para mujer, hombre y chicos."),
    ("peluqueria", "Color", "Cambio de color y retoque de raíz."),
    ("peluqueria", "Peinado", "Peinado para el día a día o para una ocasión."),
    ("peluqueria", "Lavado y brushing", "Lavado y secado con brushing."),
    ("unas", "Manicura", "Cuidado y esmaltado de manos."),
    ("unas", "Pedicura", "Cuidado y esmaltado de pies."),
    ("unas", "Esmaltado", "Esmaltado de manos o pies, en el color que elijas."),
    ("unas", "Uñas decoradas", "Diseños para elegir."),
]
filas_salon = "".join(fila_servicio(n, d, c) for c, n, d in salon_items)
galeria = ""
for f, alt in [
    ("unas-rojo", "Manicura aplicando esmalte rojo en las uñas de una clienta"),
    ("corte-lateral", "Peluquero cortando con peine y tijera el pelo corto de un cliente"),
    ("unas-esmalte", "Manicura con guantes aplicando esmalte sobre las uñas de una clienta"),
    ("alisado", "Estilista alisando con plancha el pelo largo de una clienta"),
    ("corte-tijera", "Tijera cortando el pelo mojado de un cliente"),
]:
    galeria += "<li>%s</li>" % img(P, "salon", f, alt, "(min-width: 900px) 360px, (min-width: 640px) 30vw, 50vw")
cuerpo = ('<section class="sec" id="servicios" aria-labelledby="h-serv"><div class="ancho"><h2 class="sec-titulo" id="h-serv">Nuestros servicios</h2>'
          '<p class="sec-sub">Elegí el servicio y pedí tu turno por WhatsApp. El precio lo confirmamos por ahí.</p>'
          '<div class="chips chips-fijos" role="group" aria-label="Tipo de servicio">'
          '<button class="chip" type="button" data-chip="todo" aria-pressed="true">Todo</button>'
          '<button class="chip" type="button" data-chip="peluqueria" aria-pressed="false">Peluquería</button>'
          '<button class="chip" type="button" data-chip="unas" aria-pressed="false">Uñas</button></div>'
          '<ul class="servicios" data-filtrable>%s</ul></div></section>') % filas_salon
cuerpo += ('<section class="sec sec-alt" aria-labelledby="h-gal"><div class="ancho"><h2 class="sec-titulo" id="h-gal">Algunos trabajos</h2>'
           '<p class="sec-sub">Fotos de ejemplo. Acá se mostrarían los trabajos del salón.</p><ul class="galeria">%s</ul></div></section>') % galeria
cuerpo += chat_html("salon", P, NOM_SALON)
paginas.append(dict(
    slug="salon", nombre=NOM_SALON, chat_js=True, rubro="Salón de belleza", titulo_corto="Ejemplo de web para salón de belleza",
    desc="Demo de página web para un salón de belleza (peluquería y uñas): servicios, fotos de ejemplo, turnos por WhatsApp y horarios. Es un ejemplo de Presencia Multitec.",
    h1="Corte, color y uñas, con turno por WhatsApp.", sub="Elegí el servicio y pedí tu turno. El salón te confirma por el chat.",
    hero_alt="Peluquera cortando un mechón de pelo oscuro con tijera y peine", wa_rubro="salón de belleza", theme_color="#ffffff",
    fuente_h="bricolage-700.woff2", letras="Bricolage Grotesque y Figtree", cuerpo=cuerpo,
    sec_link='<a class="enlace" href="#servicios">Ver los servicios</a>', wa_label="Pedir turno por WhatsApp",
    cierre="¿Qué día te queda bien?", extra=HOJA % wa("salón de belleza"),
    horarios=[("Martes a sábado", [2, 3, 4, 5, 6], "09:00", "19:00"), ("Domingo y lunes", [0, 1], None, None)]))

# ---- ODONTOLOGIA ----
NOM_ODONTO = "Consultorio Dental Arandú"
odonto_items = [
    ("Primera consulta", "Para conocer al profesional y contar qué necesitás."),
    ("Control y revisión", "Revisión general de rutina."),
    ("Limpieza", "Limpieza dental de rutina."),
    ("Ortodoncia", "Consulta de ortodoncia con el profesional."),
    ("Otra consulta", "Contanos qué necesitás y el consultorio te responde."),
]
cuerpo = ('<section class="sec" id="consultas" aria-labelledby="h-cons"><div class="ancho"><h2 class="sec-titulo" id="h-cons">Consultas y turnos</h2>'
          '<p class="sec-sub">Elegí el motivo y pedí tu turno por WhatsApp. Lo que corresponda a cada caso lo ve el profesional en la consulta.</p>'
          '<ul class="servicios servicios-uno">%s</ul></div></section>') % "".join(fila_servicio(n, d) for n, d in odonto_items)
cuerpo += banda_pasos("odontologia", "consulta", "Consultorio odontológico con sillón, lámpara y escritorio", "Cómo pedir tu turno",
                      [("Elegí el motivo ", "de la consulta."), ("Escribinos por WhatsApp ", "y te tomamos los datos."), ("El consultorio te confirma ", "el turno.")],
                      "Pedir turno por WhatsApp", wa("odontología"))
cuerpo += chat_html("odontologia", P, NOM_ODONTO)
paginas.append(dict(
    slug="odontologia", nombre=NOM_ODONTO, chat_js=True, rubro="Odontología", titulo_corto="Ejemplo de web para consultorio odontológico",
    desc="Demo de página web para un consultorio odontológico: motivos de consulta, turnos por WhatsApp y horarios. Es un ejemplo de Presencia Multitec.",
    h1="Tu consulta, con turno por WhatsApp.", sub="Control, limpieza y más. Elegí el motivo y escribinos.",
    hero_alt="Instrumental y equipo de un consultorio odontológico", wa_rubro="odontología", theme_color="#ffffff",
    fuente_h="figtree-600.woff2", letras="Figtree", cuerpo=cuerpo,
    sec_link='<a class="enlace" href="#consultas">Ver los motivos de consulta</a>', wa_label="Pedir turno por WhatsApp",
    cierre="¿Para qué día querés tu turno?", extra=HOJA % wa("odontología"),
    horarios=[("Lunes a viernes", [1, 2, 3, 4, 5], "08:00", "17:00"), ("Sábado", [6], "08:00", "12:00"), ("Domingo", [0], None, None)]))

# ---- TALLER ----
NOM_TALLER = "Taller Los Tres Ejes"
taller_items = [
    ("Frenos", "Revisión del sistema de frenos."),
    ("Aceite y filtros", "Cambio de aceite y de filtros."),
    ("Suspensión", "Revisión de la suspensión."),
    ("Batería", "Revisión de la batería y de la carga."),
    ("Neumáticos", "Revisión del estado y de la presión de los neumáticos."),
    ("Revisión general", "Revisión general del auto."),
]
cuerpo = ('<section class="sec" id="revisamos" aria-labelledby="h-rev"><div class="ancho"><h2 class="sec-titulo" id="h-rev">Qué revisamos</h2>'
          '<p class="sec-sub">Elegí el servicio y pedí tu turno por WhatsApp. El diagnóstico lo da el taller cuando ve el auto.</p>'
          '<ul class="servicios">%s</ul></div></section>') % "".join(fila_servicio(n, d) for n, d in taller_items)
cuerpo += banda_pasos("taller", "frenos", "Mano con una herramienta sobre el disco y la pinza de freno de un auto", "Cómo pedir tu turno",
                      [("Contanos qué le pasa ", "al auto."), ("Te tomamos los datos ", "por WhatsApp."), ("El taller te confirma ", "el turno.")],
                      "Pedir turno por WhatsApp", wa("taller mecánico"))
cuerpo += chat_html("taller", P, NOM_TALLER)
paginas.append(dict(
    slug="taller", nombre=NOM_TALLER, chat_js=True, rubro="Taller mecánico", titulo_corto="Ejemplo de web para taller mecánico",
    desc="Demo de página web para un taller mecánico: servicios, turnos de revisión por WhatsApp y horarios. Es un ejemplo de Presencia Multitec.",
    h1="Tu auto, con turno por WhatsApp.", sub="Frenos, aceite, suspensión y más. Contanos qué necesita y pedí tu turno.",
    hero_alt="Mecánico revisando los frenos de un auto levantado en el taller", wa_rubro="taller mecánico", theme_color="#17181a",
    fuente_h="barlowsc-700.woff2", letras="Barlow y Barlow Semi Condensed", cuerpo=cuerpo,
    sec_link='<a class="enlace" href="#revisamos">Ver qué revisamos</a>', wa_label="Pedir turno por WhatsApp",
    cierre="¿Cuándo traés el auto?", extra=HOJA % wa("taller mecánico"),
    horarios=[("Lunes a viernes", [1, 2, 3, 4, 5], "07:30", "17:30"), ("Sábado", [6], "07:30", "12:00"), ("Domingo", [0], None, None)]))

# Demos y portada que ya son del rediseno v2 (se copiaron a mano desde v2/<slug>/ y v2/selector/): el generador NO las vuelve a escribir.
# Las 8 demos son v2 (ropa incluida). La raiz (selector) tambien es v2: ver RAIZ_REEMPLAZADA.
REEMPLAZADAS = {"restaurante", "panaderia", "carnes", "materiales", "salon", "taller", "odontologia", "ropa"}
RAIZ_REEMPLAZADA = True

for r in paginas:
    if r["slug"] in REEMPLAZADAS:
        print("salteada (v2)", r["slug"])
        continue
    d = os.path.join(RAIZ, r["slug"])
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w", encoding="utf-8", newline="\n").write(pagina(r))
    print("ok", r["slug"])

# ================= PORTADA "ELEGI TU RUBRO" =================
# Solo rubros publicados (con foto real y licencia). Orden: alterna oscuras y claras. Linea de cada tarjeta: que muestra la demo (no es promesa del negocio)
SEL = [("restaurante", "Restaurante", "Carta y pedido de prueba"), ("panaderia", "Panadería y café", "Horneadas y encargos"),
       ("carnes", "Carnicería", "Cortes y consultas"), ("salon", "Salón de belleza", "Turnos y fotos de ejemplo"),
       ("ropa", "Ropa y regalos", "Vidriera y talles"), ("taller", "Taller mecánico", "Servicios y turnos"),
       ("materiales", "Materiales y ferretería", "Catálogo y presupuesto"), ("odontologia", "Odontología", "Motivos y turnos")]
COLS = {8: " rubros-4", 6: " rubros-3", 9: " rubros-3", 12: " rubros-4"}.get(len(SEL), "")
tarj = ""
for k, (slug, nom, linea) in enumerate(SEL):
    tarj += '<li><a class="rubro-card" href="%s/"><div class="tarjeta-foto">%s</div><span class="rc-nom">%s</span><small>%s</small></a></li>' % (
        slug, img("", "selector", slug, "Ejemplo de la web de %s" % nom.lower(), "(min-width: 900px) 260px, (min-width: 640px) 22vw, 50vw", eager=(k == 0), alta=(k < 4)), E(nom), E(linea))
ids = []
for c, n, i, *_ in SALIDAS:
    if c == "selector" and i not in ids:
        ids.append(i)
cred = ", ".join('<a href="https://www.pexels.com/photo/%s/" rel="noopener" target="_blank">%s<span class="solo-lector"> (se abre en otra pestaña)</span></a>' % (FOTOS[i][1], E(FOTOS[i][0])) for i in ids)
wa_gen = "https://wa.me/%s?text=%s" % (WA_NUM, urllib.parse.quote("Hola, vi las demos de Presencia Multitec y mi rubro no está. Quiero una web para mi negocio"))
titulo = "Presencia Multitec: así se vería la web de tu negocio"
desc = "Elegí tu rubro y mirá una demo de cómo se vería la web de tu negocio desde el celular. Ejemplos de Presencia Multitec."
indice = """<!doctype html>
<html lang="es-PY" data-tema="selector">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>%(t)s</title>
<meta name="description" content="%(d)s">
<meta name="theme-color" content="#ffffff">
<meta property="og:type" content="website">
<meta property="og:locale" content="es_PY">
<meta property="og:site_name" content="Presencia Multitec (Demo)">
<meta property="og:title" content="%(t)s">
<meta property="og:description" content="%(d)s">
<meta property="og:url" content="%(b)s">
<meta property="og:image" content="%(b)sfotos/selector/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="%(ogalt)s">
<meta name="twitter:card" content="summary_large_image">
<script>
/* Links viejos: ?tema=comida va al restaurante y ?tema=comercio a la tienda. Cualquier otro valor muestra esta portada. */
(function () {
  var t = new URLSearchParams(location.search).get("tema");
  var m = { comida: "restaurante/", comercio: "ropa/" };
  if (m[t]) { location.replace(m[t]); }
})();
</script>
<link rel="preload" as="font" type="font/woff2" href="fonts/bricolage-700.woff2" crossorigin>
%(iconos)s
%(css)s
</head>
<body>
<a class="saltar" href="#contenido">Saltar al contenido</a>
<div class="demo-franja" role="note">Ejemplo: los negocios de estas páginas no existen.</div>
<main id="contenido">
<div class="ancho sel-cab">
<p class="rubro">Presencia Multitec (Demo)</p>
<h1>Así se vería la web de tu negocio</h1>
<p class="sub">Elegí tu rubro y mirala como la vería un cliente desde el celular.</p>
<a class="enlace" href="#chat">Ver cómo te atiende el agente</a>
</div>
<section class="ancho" aria-label="Rubros"><ul class="rubros%(cols)s">%(tarj)s</ul></section>
%(chat)s
<section class="sec"><div class="ancho banda"><div class="banda-txt"><h2 class="sec-titulo">¿Tu rubro no está?</h2>
<p>Escribinos y armamos una demo para tu negocio.</p>
<a class="btn btn-grande" href="%(wa)s" rel="noopener">%(ico)s<span>Escribinos por WhatsApp</span></a>
<p class="nota-demo">Este botón te comunica con Multitec.</p></div></div></section>
</main>
<footer class="pie"><div class="ancho">
<p>Fotos de Pexels (licencia Pexels, uso libre): %(cred)s.</p>
<p>Letras: Bricolage Grotesque y Figtree (licencia SIL OFL 1.1), alojadas en este sitio.</p>
<div class="enlaces"><a href="privacidad.html">Privacidad</a></div>
</div></footer>
%(chatjs)s</body>
</html>
""" % dict(css=css_en_linea("fonts/", "selector"), iconos=iconos(""), chat=chat_html("portada", "", "Multitec", [(sl + "/", nm) for sl, nm, _l in SEL]), chatjs=CHAT_JS % "", t=E(titulo), d=E(desc), b=BASE, tarj=tarj, cols=COLS, ogalt=E("Fotos de %d rubros: %s" % (len(SEL), ", ".join(nm.lower() for _s, nm, _l in SEL))), wa=wa_gen, ico=ico(), cred=cred)
if RAIZ_REEMPLAZADA:
    print("raiz salteada (v2: index.html y sel/ son del selector nuevo)")
else:
    open(os.path.join(RAIZ, "index.html"), "w", encoding="utf-8", newline="\n").write(indice)
    print("ok index")
