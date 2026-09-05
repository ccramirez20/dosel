# Dosel

Sitio del café Dosel: café de origen colombiano, métodos de preparación y talleres, con
un mapa que ubica cada café en su departamento.

Next.js (App Router) + TypeScript + Tailwind v4. Todo se genera estático; no hay backend.

El contexto completo del proyecto, las decisiones de arquitectura y el roadmap están en
[`CLAUDE.md`](./CLAUDE.md). El registro de sesiones está en [`BITACORA.md`](./BITACORA.md).

## Comandos

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # build de producción (verifica que todo siga siendo SSG)
pnpm lint
pnpm typecheck
pnpm test         # checks de la proyección del mapa
```

## Dónde tocar qué

| Quiero cambiar… | Archivo |
|---|---|
| Colores, tipografía, escala | `src/styles/tokens.css` |
| Los cafés | `src/content/cafes/*.json` (un archivo por café; se detectan solos) |
| Métodos, talleres, panadería | `src/content/{methods,experiences,products}/` |
| Horario, dirección, WhatsApp | `CONTACT` en `src/components/layout/Footer.tsx` |
| Fotos | `public/images/` — ver nota abajo |

**Fotos.** Mientras un `ImageRef.src` apunte a un `.svg`, `Figure` dibuja un marcador con
la proporción final ya reservada. Al poner un `.jpg`/`.webp` real en `public/images/` y
actualizar el `src` en el JSON, pasa solo a `next/image`. No hay que tocar código.

## Datos del mapa

`public/geo/colombia-departments.topo.json` son los 32 departamentos + Bogotá D.C., con
`shapeISO` (ISO 3166-2:CO) como clave. Viene de geoBoundaries, derivado de OpenStreetMap,
bajo licencia **ODbL 1.0**, que **obliga a mantener la atribución** del footer. Detalles en
`public/geo/LICENSE.txt`.

La proyección corre en build (`src/lib/geo.ts`): el navegador solo recibe los `d` de los
paths y las coordenadas de los pines ya calculadas.
