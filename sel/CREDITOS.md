# Créditos y huellas: selector "Elegí tu rubro" (v2)
Todo alojado en esta carpeta. Cero pedidos a otros dominios en la página. Hecho el 2026-11-23. Sin cinta de Multitec.

## Letras (SIL Open Font License 1.1, sin modificar)
Bajadas una sola vez (solo en la construcción): el CSS de `fonts.googleapis.com/css2` dio la dirección de cada `.woff2` del bloque `latin` en `fonts.gstatic.com`; los `OFL.txt` vienen de `raw.githubusercontent.com/google/fonts/main/ofl/<familia>/` (mismo origen que en las otras demos). Dos familias: Sofia Sans Extra Condensed para los rubros y Sofia Sans para el resto.
| Familia | Archivo | Ejes | Bytes | SHA-256 |
|---|---|---|---|---|
| Sofia Sans Extra Condensed (The Sofia Sans Project Authors) | fuentes/sofiasansextracondensed-800-latin.woff2 | peso 800 | 15.772 | 9e26fb6773ddf155505d66c4d4c08b3e8b37d86f3178671ebe75913256c2030b |
| Sofia Sans (The Sofia Sans Project Authors) | fuentes/sofiasans-400-600-latin.woff2 | peso 400 a 600 (variable) | 40.372 | 2176b732b7e4e2bf32a38335a1ee0a127efef2478266d3ec2ed806edaf9671a8 |
Licencia OFL 1.1 en `fuentes/OFL-sofiasansextracondensed.txt` y `fuentes/OFL-sofiasans.txt` (4.393 bytes cada una, SHA-256 3e824d50…; "Copyright 2019 The Sofia Sans Project Authors (https://github.com/lettersoup/Sofia-Sans)"). Total letras: 56.144 bytes. El bloque latin declara U+0000-00FF (ñ, acentos, ¿ y ¡ incluidos). No se modificó ni se renombró ningún archivo.

## Íconos (Phosphor Icons, MIT, tag v2.0.8, peso regular)
Origen `github.com/phosphor-icons/core` tag `v2.0.8` (`assets/regular/`). Los dos símbolos de `iconos.svg` se copiaron del sprite ya revisado de la demo de odontología (mismas huellas; sin `<script`, `on...=`, `href` ni `<foreignObject`, comprobado con grep). No se bajó nada nuevo.
Phosphor Icons, MIT, Copyright (c) 2020-present Phosphor Icons: se permite usar, copiar, modificar y distribuir con este aviso.
| Ícono | Ruta en el repo | SHA-256 |
|---|---|---|
| whatsapp-logo | assets/regular/whatsapp-logo.svg | 37474af9246a13b9b9fbf36561081d02c876db27682c1ac7ce8c2418c2a20320 |
| arrow-right | assets/regular/arrow-right.svg | e45bc4a12592b8723110db42c6deffdf177e4fe7704cf50324963fa0a59b2d74 |

## Fotos (Pexels License: uso comercial libre, atribución no obligatoria; se acredita igual)
Una por demo: la foto de hero de cada demo en su versión ya procesada (Pillow las recorta y reduce). Autor, página y huella del original salen de los CREDITOS de cada demo. Para la fila abierta en celulares 3x hay una versión `-b` de 1080 px de ancho, del mismo original procesado (materiales llega a 960 y salón a 840: es el original más grande que hay, no se agranda). Ninguna foto generada con IA. Sin personas, sin marcas legibles, según lo que cada demo ya revisó.
| Demo | ID | Autor | Página | SHA-256 del original | Copia usada | Huellas derivadas (12 primeros) |
|---|---|---|---|---|---|---|
| restaurante | 37126417 | Andres Idda Bianchi | https://www.pexels.com/photo/traditional-argentinian-asado-barbecue-grilling-37126417/ | ab6b9546fcfc7d8c9ba5eb7f38f54053e719ec74c11e4c8e035a5dff2e191567 | `hero-brasa-1080.webp` | -v 4d24f0b1ba4f, -a 8d8166e11046, -b b0f9f987b0e9, -m f8bafe3d3197 |
| panaderia | 30403209 | James Collington | https://www.pexels.com/photo/close-up-of-freshly-baked-croissants-in-bakery-display-30403209/ | 77ce71fd8162b2c804685a9a2776761e6e9ef3a2008800c829d0cbd1128c4e93 | `hero-1080.webp` | -v 6d7b4bef02d0, -a 89a4dfb13db8, -b c394d6bfd31f, -m 3ff5c0189d2e |
| carniceria | 10201880 | Skyler Ewing | https://www.pexels.com/photo/sprinkling-salt-on-raw-meat-10201880/ | 4917b8d60ec14f2890546280706862fc27d0e5344e57ffd884ff1749ae4b0b15 | `hero-1600.webp` | -v a8de6d393a49, -a c4aefb382afb, -b 081c9fec99d8, -m 4f077e935c31 |
| materiales | 17940311 | Steve A Johnson | https://www.pexels.com/photo/close-up-photo-of-a-red-brick-wall-17940311/ | dbfceb8a0cef5522a2d24c980ef0a21284e89db9dda95a2640cc3da3483a858d | `celda-ladrillos-960.webp (celda Ladrillos del bento)` | -v 6e372cd2e0eb, -a 013855fdfa08, -b 83d9ce4f2601, -m 3dba3c42bd9c |
| salon | 40189015 | Omer Unlu | https://www.pexels.com/photo/close-up-of-red-nail-polish-application-40189015/ | 45bfb84d0e0a83c9be04852986243ef0c9b61cb6c086809e669af7071cf9f5c2 | `hero-ventana-840.webp` | -v 1a9b6eea4d31, -a 577cb7934381, -b adb48a576da3, -m ef59f2318291 |
| odontologia | 6812453 | Pavel Danilyuk | https://www.pexels.com/photo/a-dental-equipment-in-the-clinic-6812453/ | ed0c2ac1f81ae4628186e478e38a7bc317c7e4ef6fb3b2ff0ac8e0149b2f2c1a | `ventana-1440.webp` | -v dcebaf78fbf1, -a c9bab385b456, -b 0879b3214384, -m 1634db39e725 |
| taller | 4022543 | Jae Park | https://www.pexels.com/photo/disk-brake-of-wheeled-vehicle-4022543/ | cf77103aad1520a43980fd8b50e4824f300f291aca84322ed47e82256ac59058 | `macro-1400.webp` | -v 45f044cb4edf, -a 198bb9f65d96, -b 47c9f73ea4c6, -m 5543cf71c348 |
Fondo del baño de color de carnicería: `fotos/carnes-fondo.webp` (misma foto 10201880, 1200 px de ancho, SHA-256 bd4304f5c73f0648164214cfce0bdee4b14c609fd85f2c151b1f56d9bfe37872).
Pie de la página (igual a esta lista):
- Restaurante: Andres Idda Bianchi en Pexels (https://www.pexels.com/photo/traditional-argentinian-asado-barbecue-grilling-37126417/)
- Panadería: James Collington en Pexels (https://www.pexels.com/photo/close-up-of-freshly-baked-croissants-in-bakery-display-30403209/)
- Carnicería: Skyler Ewing en Pexels (https://www.pexels.com/photo/sprinkling-salt-on-raw-meat-10201880/)
- Materiales: Steve A Johnson en Pexels (https://www.pexels.com/photo/close-up-photo-of-a-red-brick-wall-17940311/)
- Salón: Omer Unlu en Pexels (https://www.pexels.com/photo/close-up-of-red-nail-polish-application-40189015/)
- Odontología: Pavel Danilyuk en Pexels (https://www.pexels.com/photo/a-dental-equipment-in-the-clinic-6812453/)
- Taller: Jae Park en Pexels (https://www.pexels.com/photo/disk-brake-of-wheeled-vehicle-4022543/)
Salón: la foto es la del hero de la demo (esmalte sobre una uña), con la que la demo abre. Materiales: la celda Ladrillos del bento de la demo (la demo no tiene foto de hero).

## Marca
`logo-m.png`: copia sin cambios del logo de la cinta maestra de Multitec, SHA-256 84a9d9bed2e98122c62aa0b7410f7acf865b0ce2b920cd84b5e4e6ed63e2d922. Sobre una pastilla blanca (el logo trae fondo blanco).
`og.jpg` (1200x630, sin texto: el logo y 7 franjas con los colores firma de las demos), SHA-256 72dbd45ed86ab0f6837a20224ad66f53982e3275b94ddbefbda9bd63d7b44b0a.

## Mapa
No lleva mapa.
