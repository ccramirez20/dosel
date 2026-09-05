# CLAUDE.md — Dosel

Contexto de proyecto para Claude Code. Léelo antes de generar o modificar código.

---

## 1. Qué es Dosel

Café con temática de biología y divulgación científica. El nombre viene del **dosel del bosque** (canopy). El dueño es biólogo; la marca cruza café + naturaleza + enseñanza. El sitio debe sentirse moderno, orgánico y vivo, no un template de cafetería.

**Objetivo de esta fase:** front-end funcional de vitrina, listo para incorporar imágenes y contenido a medida que llegan, y arquitectado para evolucionar a e-commerce y reservas.

---

## 2. Stack y decisiones

| Capa | Elección | Razón |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | SEO/metadata para negocio local; SSG por defecto |
| Estilos | Tailwind CSS | Velocidad + tokens de marca centralizados |
| Animación | Framer Motion (paquete `motion`, `motion/react`) | Reveals, transiciones de mapa, microinteracciones |
| Mapa | `d3-geo` + `topojson-client` directo | `react-simple-maps` quedó descartado: su última publicación es de 2022 y sus peer deps topan en React 18, mientras Next 16 trae React 19. Lo que aportaba son ~60 líneas propias |
| Estado UI | Zustand | Store compartido lista de cafés ↔ mapa; reutilizable en carrito futuro |
| Contenido | Archivos locales JSON/MDX en `src/content/` | Sin backend en v1; el dueño no edita todavía |
| Deploy | Vercel | SSG, imágenes optimizadas, previews |

**Sin backend ni base de datos en v1.** Todo se genera estático.

---

## 3. Principios de arquitectura (las dos costuras)

Estas reglas existen para que e-commerce y reservas entren después **sin reescribir**. Respétalas.

1. **Los componentes nunca importan JSON directamente.** Todo dato pasa por `lib/data/` (`getCafes()`, `getExperiences()`, `getMethods()`, `getProducts()`, `getRegions()`). Hoy leen archivos locales; mañana pueden llamar a una API o CMS. La firma no cambia.
2. **Los tipos de dominio ya incluyen campos futuros** (`price`, `currency`, `sku`, `available`, `bookable`, `sessions`, `capacity`) marcados como opcionales. La UI de v1 los ignora, pero el modelo de datos no se migra después.
3. **Frontera client/server explícita.** Las páginas son Server Components que obtienen datos vía `lib/data` en build (SSG). Solo lo interactivo (mapa, animaciones, carrusel) lleva `'use client'`.
4. **Nada de lógica de negocio en componentes.** Cálculos y transformaciones viven en `lib/`.

---

## 4. Estructura de carpetas

```
src/
  app/
    layout.tsx                 # Nav + Footer + fuentes + metadata base
    page.tsx                   # Home
    quienes-somos/page.tsx
    experiencias/page.tsx
    productos/page.tsx
    cafes/[slug]/page.tsx      # (opcional) detalle de café; ver §7
  components/
    layout/                    # Nav, Footer
    home/                      # Hero, secciones de landing
    map/                       # ColombiaMap, MapPin, CafeInfoPanel
    cafe/                      # CafeCard, CafeDetail, MethodBadge
    experiences/               # ExperienceCard, MethodCard
    products/                  # ProductGrid, CoffeeShowcase
    ui/                        # primitivos + wrappers de motion (Reveal, etc.)
  lib/
    data/                      # getCafes, getExperiences, getMethods, ...
    store/                     # useCafeMap (Zustand)
    commerce/                  # STUB vacío, futuro (ver §9)
    utils/
  content/
    cafes/*.json
    experiences/*.json
    methods/*.json
    products/*.json
    regions.json
  types/
    domain.ts                  # ver §6
  styles/
    globals.css
    tokens.css                 # variables de marca (provisionales)
public/
  images/                      # placeholders; se reemplazan al llegar fotos
  geo/
    colombia-departments.topo.json   # ASSET A CONSEGUIR (ver §7)
```

---

## 5. Rutas y contenido de cada página

- **`/` Home.** Hero con identidad Dosel (bosque/dosel), ubicación, qué hacen. Moderno, llamativo, con reveals al hacer scroll. Entradas a las tres secciones.
- **`/quienes-somos`.** Narrativa visual bosque + café + aves. Qué es Dosel y cómo se diferencia. Tono editorial, no corporativo.
- **`/experiencias`.** Talleres (galletas, pintura de esculturas) y **métodos de café**. En métodos: qué es, para qué se usa, de dónde viene, para qué perfil de café va mejor.
- **`/productos`.** Panadería como secundario (grid simple). **Cafés como foco principal**: tarjetas clickeables que despliegan el mapa (ver §7).

---

## 6. Modelo de datos (`src/types/domain.ts`)

```ts
export interface ImageRef {
  src: string;          // /images/... (placeholder por ahora)
  alt: string;
  width?: number;
  height?: number;
}

export interface Region {
  id: string;           // "huila"
  name: string;         // "Huila"  -> departamento resaltable en mapa
}

export interface Origin {
  regionId: string;     // FK a Region -> resalta el departamento
  municipio: string;    // "Pitalito"
  finca?: string;       // "Finca El Mirador"
  lat: number;          // para el pin (proyección)
  lng: number;
  altitudeMasl?: number;
}

export interface Cafe {
  id: string;
  slug: string;
  name: string;
  origin: Origin;
  variety?: string;             // "Pink Bourbon"
  process?: string;             // "Lavado" | "Honey" | "Natural"
  roastLevel?: string;
  profile: {
    description: string;
    aromas: string[];           // "qué oler"
    tasting: string[];          // "qué probar"
    body?: string;
    acidity?: string;
  };
  recommendedMethods: string[]; // ids -> Method
  story?: string;               // de dónde viene
  images: ImageRef[];
  // --- costura e-commerce (futuro) ---
  price?: number;
  currency?: "COP";
  sku?: string;
  available?: boolean;
}

export interface Method {       // método de preparación de café
  id: string;
  slug: string;
  name: string;                 // "V60", "Chemex", "Prensa francesa"
  origin: string;               // de dónde viene
  usedFor: string;              // para qué se usa
  description: string;
  bestFor?: string[];           // perfiles de café que resalta
  images: ImageRef[];
}

export interface Session {
  id: string;
  startsAt: string;             // ISO
  capacity: number;
  booked: number;               // v1: 0 o ausente; v2: viene de DB
}

export interface Experience {
  id: string;
  slug: string;
  title: string;
  category: "taller" | "metodo" | "otro";
  description: string;
  images: ImageRef[];
  // --- costura reservas (futuro) ---
  bookable?: boolean;
  price?: number;
  sessions?: Session[];
}

export interface Product {      // panadería
  id: string;
  name: string;
  description?: string;
  images: ImageRef[];
  price?: number;               // costura e-commerce
  available?: boolean;
}
```

**Estado del contenido:** los ~6 cafés llegan la semana entrante. Crea `content/cafes/*.json` con **1–2 ejemplos placeholder** que cumplan el tipo, para que la UI y el mapa funcionen ya. Igual para métodos y experiencias.

---

## 7. Componente de mapa (contrato)

**Comportamiento bidireccional:**
- Clic en **tarjeta de café** → resalta su departamento en el mapa, muestra su pin y abre panel de info.
- Clic en **departamento** → filtra/lista los cafés de esa región.
- Clic en **pin** → popover con `municipio` + `finca` + resumen del café + link a detalle.

**Implementación:**
- La proyección corre en **build**, en `lib/geo.ts` (Server). `ColombiaMap` es `'use client'` pero solo recibe los `d` de los paths y los pines ya proyectados: d3-geo y el TopoJSON nunca llegan al bundle del navegador.
- Geografías: `public/geo/colombia-departments.topo.json` — **ya está**. geoBoundaries COL ADM1 (32 departamentos + Bogotá D.C.), clave de join `shapeISO` (ISO 3166-2:CO), simplificado a 35 KB. Licencia **ODbL 1.0**: la atribución del footer es obligatoria, no se quita.
- Proyección `geoMercator` ajustada al territorio continental. Los pines se colocan por `lat`/`lng` del `Origin` — no hardcodear píxeles. San Andrés queda a 700 km de la costa, así que se dibuja como recuadro con un transform calculado, no a ojo.
- `pnpm test` verifica los invariantes de esta capa: 33 departamentos dibujables, las claves de `regions.json` existen en el TopoJSON, y todo café del contenido cae dentro del lienzo.
- Estado compartido en `lib/store/useCafeMap.ts` (Zustand): `selectedCafeId`, `selectedRegionId`, setters. Lo consumen tanto la lista de `CafeCard` como el mapa. Esto es lo que habilita la bidireccionalidad.
- Estética: minimalista, colores Dosel, departamento activo resaltado, transición suave (motion) al seleccionar.

---

## 8. Diseño e identidad

**Marca provisional.** El logo, paleta exacta (hex) y tipografías llegan esta semana. Hasta entonces, usa estos tokens placeholder en `styles/tokens.css` y déjalos fáciles de reemplazar:

```css
:root {
  --dosel-canopy:  #1f3d2b;  /* verde dosel profundo */
  --dosel-moss:    #4a6b3c;  /* musgo */
  --dosel-fern:    #7fa06b;  /* helecho claro */
  --dosel-bark:    #5b4230;  /* corteza */
  --dosel-cream:   #f4efe6;  /* fondo */
  --dosel-accent:  #e07a3f;  /* acento cálido tipo ave */
}
```

- **Tipografías (provisional):** una display con carácter (p. ej. Fraunces) + una sans legible (p. ej. Inter/Geist), vía `next/font`. Reemplazables cuando llegue la marca.
- **Imágenes:** llegan el lunes. Configura `next/image` con placeholders de las proporciones correctas; al llegar fotos solo se reemplazan los archivos en `public/images/`.
- **Movimiento y feedback (UX):** reveals al scroll, estados hover en tarjetas de café, transiciones del mapa, microinteracciones con tema café (vapor/pour) con moderación. Skeletons de carga, toasts para acciones futuras. **Respetar `prefers-reduced-motion`.**
- **Accesibilidad:** alt en todas las imágenes, foco visible, contraste AA, navegación por teclado en el mapa.

---

## 9. Roadmap evolutivo

**Fase 1 — Vitrina (ahora).** Todo lo anterior, estático.

**Fase 2 — E-commerce.** Carrito (Zustand `useCart`), checkout, pago. Pasarela a evaluar cuando llegue la fase — opciones para Colombia: **Wompi** (Bancolombia, soporta PSE/Nequi), **Bold**, **Mercado Pago**, **ePayco**. PSE es requisito local. Requiere API routes para crear la transacción; los tipos de `Cafe`/`Product` ya tienen `price`/`sku`/`available`. *(Confirmar pasarela antes de construir; confianza media sobre features específicas, validar docs vigentes.)*

**Fase 3 — Reservas con cupos.** Requiere backend + DB (Supabase/Postgres encaja con Vercel). El riesgo real es **concurrencia**: decrementar cupos sin sobreventa exige transacción con row-lock en un Server Action, no lógica en cliente. El tipo `Session` (`capacity`/`booked`) ya está listo. En v1, el CTA "Reservar" va a WhatsApp/formulario; no simular cupos reales.

**No construir Fase 2 ni 3 hasta que Fase 1 esté completa.** `lib/commerce/` queda como stub vacío hasta entonces.

---

## 10. Convenciones

- Identificadores de código en inglés; contenido visible en español (v1 solo ES; EN queda como seam vía `next-intl` si se pide).
- Componentes en PascalCase, un componente por archivo, colocados por dominio en `components/`.
- `slug` como clave de ruteo de cafés/métodos/experiencias.
- No introducir dependencias nuevas sin justificar el tradeoff.
- Priorizar SSG; usar `'use client'` solo donde haya interacción real.
- Comentar solo lo no obvio (el *por qué*, no el *qué*).

### Tests

Sin frameworks: `node:test` + `node:assert`, archivos `*.test.mts` junto al código que
prueban. `pnpm test` corre en CI y bloquea el merge.

**Qué se prueba:** lógica con ramas o invariantes que un build en verde no atrapa —
la proyección del mapa, los setters del store, los guardias sobre contenido escrito a
mano. **Qué no:** componentes, estilos, y cualquier cosa que `tsc` o el build ya validen.
Un test de más es deuda igual que código de más.

Dos reglas para que sirvan:
1. El archivo de test importa con rutas **relativas** con extensión (`./index.ts`), no con
   el alias `@/`: `node --experimental-strip-types` no resuelve el alias.
2. Un test que nunca falla no prueba nada. Al escribir uno, rompe a propósito la lógica y
   confirma que se pone rojo antes de darlo por bueno.

---

## 11. Comandos

```bash
pnpm dev          # desarrollo
pnpm build        # build de producción (verifica SSG)
pnpm lint
pnpm typecheck
```

---

## 12. Estado actual / pendientes

- [ ] Marca (logo, hex, fuentes) — llega esta semana → reemplazar tokens §8.
- [ ] Imágenes del sitio — llegan el lunes → reemplazar placeholders en `public/images/`.
- [ ] Datos de ~6 cafés — llegan la semana entrante → poblar `content/cafes/`.
- [x] Conseguir TopoJSON de departamentos de Colombia → `public/geo/`. **Hecho** (geoBoundaries, ODbL).
- [ ] Confirmar pasarela de pago (Fase 2) y canal de contacto v1 (asumido: WhatsApp/Instagram).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
