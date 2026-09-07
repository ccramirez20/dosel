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

## `methods/` — 4 fotos, cuadradas (800×800)

`v60`, `chemex`, `aeropress`, `prensa-francesa`. El equipo en uso, no de catálogo.

## `products/` — 7 fotos, cuadradas (800×800)

`galletas`, `pasteles`, `deditos`, `torta-casa`, `torta-naranja`,
`acab-capitan-banano`, `acab-capitana-pina`.

## `quienes-somos/` — 3 fotos, 3:2 (1200×800)

`dosel` (copas vistas desde abajo o desde arriba), `sotobosque` (café creciendo bajo
sombra), `suelo` (hojarasca, o la barra y el horno de la tienda).

---

## `marca/` — logo e identidad

Esto todavía **no lo consume nadie**: el sitio escribe «Dosel» con la tipografía. Deja aquí
lo que llegue y se conecta después.

| archivo sugerido | para qué | formato |
|---|---|---|
| `logo.svg` | Nav y footer | SVG vectorial, una sola tinta si se puede |
| `logo-horizontal.svg` | versión ancha, por si el nav la pide | SVG |
| `isotipo.svg` | solo el símbolo, sin letras | SVG |
| `favicon.png` | pestaña del navegador (reemplaza `src/app/favicon.ico`) | PNG 512×512 |
| `og.jpg` | miniatura al compartir el link en WhatsApp | JPG 1200×630 |

Manda también, si vienen: **los hex de la paleta** y **los nombres de las tipografías**.
Van a `src/styles/tokens.css` y a `src/app/layout.tsx`, y son un cambio de una pasada —
hoy los colores del sitio son provisionales (CLAUDE.md §8).

Aquí sí caben `.svg` de verdad: el logo se inserta como marcado, no pasa por `next/image`.

---

## `originales/` — opcional

Si te mandan los archivos pesados (RAW, PSD, PDF del logo), **no los pongas aquí**: todo lo
que cuelga de `public/` se publica tal cual y se descarga con el sitio. Guárdalos fuera del
repositorio.
