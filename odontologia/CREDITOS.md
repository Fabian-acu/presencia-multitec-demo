# Créditos y huellas: Consultorio Abril (Demo) v2
Todo alojado en esta carpeta. Cero pedidos a otros dominios en la página. Hecho el 2026-11-23.

## Letras (SIL Open Font License 1.1, sin modificar)
Bajada una sola vez (solo en la construcción): el CSS de `fonts.googleapis.com/css2` (Hanken Grotesk, pesos 300 a 600) dio la dirección del `.woff2` del bloque `latin` en `fonts.gstatic.com`; el `OFL.txt` viene de `raw.githubusercontent.com/google/fonts/main/ofl/hankengrotesk/` (mismo origen que en las otras demos). Hanken Grotesk es la única familia de la página.
| Familia | Archivo | Ejes | Bytes | SHA-256 |
|---|---|---|---|---|
| Hanken Grotesk (The Hanken Grotesk Project Authors) | fuentes/hankengrotesk-latin.woff2 | peso 300 a 600 | 34.704 | e9201eddf1d41d0b62253295d869ce3cf65768f7102b797f02c7f8c876b4a9d5 |
Licencia OFL 1.1 en `fuentes/OFL-hankengrotesk.txt` (4.402 bytes, e02ccb89…; "Copyright 2021 The Hanken Grotesk Project Authors"). Total letras: 34.704 bytes. El bloque latin declara U+0000-00FF (ñ, acentos, ¿ y ¡ incluidos). No se modificó ni se renombró el archivo.

## Íconos (Phosphor Icons, MIT, tag v2.0.8, peso regular)
Origen `github.com/phosphor-icons/core` tag `v2.0.8` (`assets/regular/`); bajados de `raw.githubusercontent.com` del mismo tag. Cada SVG revisado: sin `<script`, `on...=`, `href` ni `<foreignObject`. Sprite local `iconos.svg`.
Phosphor Icons, MIT, Copyright (c) 2020-present Phosphor Icons: se permite usar, copiar, modificar y distribuir con este aviso.
| Ícono | Ruta en el repo | SHA-256 |
|---|---|---|
| whatsapp-logo | assets/regular/whatsapp-logo.svg | 37474af9246a13b9b9fbf36561081d02c876db27682c1ac7ce8c2418c2a20320 |
| map-pin | assets/regular/map-pin.svg | 523f024fa467fc285d95c1db4ed6c32b640513c79780d14310bebf342b6f94fb |
| caret-down | assets/regular/caret-down.svg | 53f0cf2d0b144ac3cb07e353e0cd0853ffb3ed432d741460ce288edfcb0924b1 |
| x | assets/regular/x.svg | 7397b15e1fa66eaf6ff9b59fe91d483cb5c3bcf75b2fe052097ab6f0593b513a |
| check | assets/regular/check.svg | cbb89a8c42f283d4f846eb935e05d88c1be04462f16480e068c0f82b9ce40b12 |
| warning-circle | assets/regular/warning-circle.svg | e48a90760a68659fd3f06dd9187e471aead4877c72e915339071b2c7f7bd714c |
| wifi-slash | assets/regular/wifi-slash.svg | 39ed62ae822a3917ac70239bbaa2144152049783451f4687456aae8f044152fc |
| clock | assets/regular/clock.svg | b8c6c2899d2b9af48a55ba02ba6d7faf89b757915772dd24f5397f7b0d02aa5c |
| arrow-down | assets/regular/arrow-down.svg | cc6416ae83e20660f14b11f5525c6d05ee679c3f26cee41b696cb37aa905d4f5 |
| arrow-right | assets/regular/arrow-right.svg | e45bc4a12592b8723110db42c6deffdf177e4fe7704cf50324963fa0a59b2d74 |
| copy | assets/regular/copy.svg | 5a892fc6a72866e60c67db2088a87653cf44b57b1a5d183b36e950cdc5dd66b3 |
| calendar-blank | assets/regular/calendar-blank.svg | 6268583ae0ea04e93fd24f1e70d47a8e8d79c88fc304af397b95b318980215d6 |
| plus | assets/regular/plus.svg | d688feb9dd2e41c1721d6906a05a2a42e18cd774762fe706d72b2bdfd91cddc4 |
| minus | assets/regular/minus.svg | 5a068d1cfd707fde5ddb0ce0623958123b6a5afba98401318983aeb0fdad6382 |

## Fotos (Pexels License: uso comercial libre, atribución no obligatoria; se acredita igual)
Lista cerrada de IDs (solo `images.pexels.com`, por https). Recortadas y convertidas a WebP con Pillow 12.3.0, sin metadatos. Ninguna foto generada con IA. Sin personas, sin bocas ni dientes, sin radiografías. Autor y título leídos en la página de cada foto el 2026-11-23.
| ID | Autor | Página | Subida | SHA-256 del original |
|---|---|---|---|---|
| 6812453 | Pavel Danilyuk | https://www.pexels.com/photo/a-dental-equipment-in-the-clinic-6812453/ | 2021-02-13 | ed0c2ac1f81ae4628186e478e38a7bc317c7e4ef6fb3b2ff0ac8e0149b2f2c1a |
| 8459996 | Los Muertos Crew | https://www.pexels.com/photo/waiting-room-in-a-hospital-8459996/ | 2021-06-23 | f588b9cc7b356d3d590a37e843ebad98d2f48838e3738bcb68576edb5c54f1cf |
| 6627671 | kaboompics | https://www.pexels.com/photo/close-up-of-sterile-instruments-on-medical-tray-6627671/ | 2021-01-28 | a6e56fc8ae572079a658d083e371789177ec03e7dd56191fa7da4b557cb83566 |
Dónde se usa: la ventana de la portada y la imagen de vista previa (`og.jpg`, recorte 1200x630, sin texto) son 6812453; "El lugar": sala de espera 8459996 e instrumental en una bandeja 6627671.
Pasada 1 (2026-11-23): la foto de la portada pasó de 9062525 (cuenta ". MM Dental .", nombre de una clínica real, ya no se usa) a 6812453, de un autor que no es una clínica.
Pasada 2 (2026-11-23): el original 6812453 se recorta desde el 14% de arriba hacia abajo (luego 3:2) para dejar afuera el aparato de pared con rótulo de la esquina superior izquierda; solo recorte, sin borrar ni retocar nada, y siguen entrando el sillón, el escritorio, el reloj y la ventana. La foto 4269268 (sillón de espaldas, Cedric Fauntleroy) se sacó de la página y de la lista cerrada.
Pie de la demo: los 3 fotógrafos con enlace.

## Mapa
`fotos/mapa-gris.webp`: copia en grises y desenfocada (600x450) de `mapa-cde.webp` del sitio de demos. © colaboradores de OpenStreetMap (ODbL). Es un mapa de ejemplo, sin dirección real.

## Cinta de Multitec
`cinta/` es copia sellada de la cinta maestra de Multitec (misma huella): cinta.css 36a064790aa2…, cinta.js 2f25514a485e…, logo-m.png 84a9d9bed2e9….
