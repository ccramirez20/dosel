# Dónde va cada imagen

Aquí dentro van las fotos y el material de marca que mande el café. **Los nombres de
archivo no son libres**: el contenido del sitio ya apunta a estas rutas exactas. Si el
archivo se llama distinto, la imagen no aparece.

## Cómo funciona el reemplazo

Los JSON de `src/content/` apuntan hoy a un `.svg` que no existe. Mientras la ruta termine
en `.svg`, `Figure` dibuja el marcador de color con la proporción ya reservada. En cuanto
pongas la foto aquí y cambies **solo la extensión** en el JSON (`.svg` → `.jpg`), pasa sola
a `next/image`, con lazy loading y responsive. No hay que tocar código.

```
"src": "/images/cafes/el-mirador.svg"    ← hoy, marcador
"src": "/images/cafes/el-mirador.jpg"    ← al llegar la foto
```

Si la foto que llega tiene otra proporción, cambia también `width` y `height` en el mismo
JSON: son los que reservan el espacio y evitan que el layout salte al cargar.

**Formato:** `.jpg` para fotos, `.webp` si el original lo permite. Nada de `.svg` real —
`next/image` no los sirve sin `dangerouslyAllowSVG`, que está apagado a propósito.
**Peso:** apuntar a menos de 300 KB por foto; el sitio es estático y se sirve entero.
**Alt:** cada imagen ya trae su texto alternativo en el JSON. Si la foto no coincide con lo
que describe, corrige el `alt` — es lo que lee un lector de pantalla y lo que indexa Google.

---

## `cafes/` — 6 fotos, 4:3 (1200×900)

Una por origen. Cerezas, cafetal, secado, paisaje de la finca: lo que haya.

| archivo | qué es |
|---|---|
| `el-mirador` | Finca El Mirador, Pitalito, Huila |
| `aguas-claras` | Finca Aguas Claras, Salgar, Antioquia |
| `alto-de-la-niebla` | Garzón, Huila |
| `la-esperanza` | La Unión, Nariño |
| `pena-blanca` | Inzá, Cauca |
| `rio-frio` | Sierra Nevada de Santa Marta, Magdalena |

## `experiences/` — 3 fotos, 4:3 (1200×900)

`galletas`, `esculturas`, `cata`. Del taller en curso, con manos y mesa; mejor gente
trabajando que producto quieto.

## `methods/` — 5 fotos, cuadradas (800×800)

`v60`, `chemex`, `sifon-japones`, `ninja-luxe`, `prensa-francesa`. El equipo en uso, no de
catálogo.

## `products/` — fotos individuales por ítem, cuadradas (800×800)

`galletas`, `pasteles`, `deditos`, `torta-casa`, `torta-naranja`, `acab-capitan-banano`,
`acab-capitana-pina`, `alfajores`, `chipa`, `pancakes`, `waffle-pan-de-bono`,
`arroz-con-leche`, `tostadas-francesas`, `espresso`, `tinto`, `capuchino`, `cafe-latte`,
`aromatica`, `ice-latte`, `jugo-natural`, `soda-italiana`, `torta-por-encargo`,
`honeymoon-mermeladas` — ver los nombres exactos en `src/content/products/products.json`.

`products/menu/` ya tiene fotos reales (no son placeholder): son los 5 banners de
categoría que se ven en `/productos` (bebidas, pastelería y panadería, dulces y snacks,
tortas por encargo, mermeladas Honey Moon). No hace falta nada ahí por ahora.

## `quienes-somos/` — 3 fotos, 3:2 (1200×800)

`dosel` (copas vistas desde abajo o desde arriba), `sotobosque` (café creciendo bajo
sombra), `suelo` (hojarasca, o la barra y el horno de la tienda).

---

## `marca/` — logo e identidad

El logo **ya está conectado** en Nav y footer (`logo-transparente-crop.png`): es el JPEG
que llegó con fondo blanco, al que le quité el fondo a mano (no es transparencia real de
diseño, es un recorte por color) y le corté el margen sobrante. Sirve para salir del paso,
pero es JPEG comprimido, no vectorial — se ve algo blando de cerca. La tipografía oficial
(Poppins) también ya está puesta en todo el sitio.

Lo que sigue faltando:

| archivo sugerido | para qué | formato |
|---|---|---|
| `logo.svg` o `logo.png` a mayor resolución | reemplazar `logo-transparente-crop.png` con algo nítido | SVG vectorial o PNG grande con transparencia real |
| `isotipo.svg` | solo el símbolo, sin letras | SVG |
| `favicon.png` | pestaña del navegador (reemplaza `src/app/favicon.ico`) | PNG 512×512 |
| `og.jpg` | miniatura al compartir el link en WhatsApp | JPG 1200×630, fondo sólido (no transparente) |

Manda también, si vienen: **los hex de la paleta**. Van a `src/styles/tokens.css` — hoy
los colores del sitio siguen siendo provisionales (CLAUDE.md §8); la tipografía ya no.

Aquí sí caben `.svg` de verdad: el logo se inserta como marcado, no pasa por `next/image`.

---

## `originales/` — opcional

Si te mandan los archivos pesados (RAW, PSD, PDF del logo), **no los pongas aquí**: todo lo
que cuelga de `public/` se publica tal cual y se descarga con el sitio. Guárdalos fuera del
repositorio.
