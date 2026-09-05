# Bitácora

Registro de sesiones de trabajo. El contexto y las reglas del proyecto están en
[`CLAUDE.md`](./CLAUDE.md); aquí solo va qué se hizo, qué se decidió y qué quedó abierto.

---

## Sesión 1 — 5 de septiembre de 2026

**Objetivo:** levantar la Fase 1 completa (vitrina estática), publicarla en GitHub y dejar
la seguridad gratuita activa.

### Qué quedó hecho

- **Scaffold.** Next.js 16.3.4 (App Router, Turbopack) + React 19.2 + TypeScript 5.9 +
  Tailwind v4.3. Todo se prerenderiza: las 4 páginas son estáticas y las fichas de café
  salen por `generateStaticParams`.
- **Modelo de dominio** (`src/types/domain.ts`) tal cual el §6 del CLAUDE.md, con los
  campos de e-commerce (`price`, `sku`, `available`) y reservas (`bookable`, `sessions`)
  ya presentes como opcionales.
- **Capa de datos** (`src/lib/data/`). Ningún componente importa JSON. Los cafés se leen
  con `readdir`, así que agregar un archivo a `src/content/cafes/` basta para que aparezca
  en el sitio y en el mapa.
- **Mapa bidireccional.** Clic en ficha → resalta departamento y agranda su pin. Clic en
  departamento → filtra la lista y actualiza el panel. Estado en Zustand
  (`useCafeMap`). Navegación por teclado y `aria-pressed` en departamentos y pines.
- **Páginas.** `/`, `/quienes-somos`, `/experiencias`, `/productos`, `/cafes/[slug]`.
- **Contenido placeholder** que cumple los tipos: 2 cafés, 4 métodos, 3 experiencias,
  4 productos de panadería, 33 regiones.
- **Repo público** en `ccramirez20/dosel`, con CI y seguridad (abajo).

### Decisiones que conviene no deshacer

1. **Fuera `react-simple-maps`.** Última publicación 2022, peer deps topadas en React 18,
   y Next 16 trae React 19; además arrastra `prop-types` y d3 v2. Se reemplazó por
   `d3-geo` + `topojson-client` directo. Efecto secundario bueno: la proyección corre en
   build, así que el navegador recibe solo los `d` de los paths y las coordenadas de los
   pines. Cero d3 en el bundle del cliente. (CLAUDE.md §2 y §7 ya están actualizados.)

2. **El mapa viene de geoBoundaries bajo ODbL 1.0.** La licencia **obliga** a mantener la
   atribución que está en el footer. No es adorno: si se quita, hay que cambiar antes la
   fuente de datos. Detalle en `public/geo/LICENSE.txt`.
   La clave de join es `shapeISO` (`CO-HUI`, `CO-ANT`…), no el nombre, para no depender de
   tildes ni de variantes de escritura.

3. **San Andrés se dibuja como recuadro.** Está a ~700 km de la costa; incluirlo en el
   encuadre encogía el territorio continental a la mitad. El transform del recuadro se
   calcula desde el centroide real (`getIslandInset`), no con píxeles a ojo.

4. **Solo los departamentos con café son enfocables por teclado.** 33 paradas de tabulación
   para llegar a las dos que hacen algo sería peor accesibilidad, no mejor.

5. **`pnpm audit` no es gate de CI.** Rompería el build por vulnerabilidades transitivas
   sin arreglo disponible; Dependabot ya cubre ese caso sin bloquear.

### Diseño

Dirección visual: el sitio se organiza por **estratos del bosque** (emergente, dosel,
sotobosque, suelo), que es una estructura real y además se conecta con la altura del café
(`altitudeMasl`). El hero es oscuro —estás debajo del dosel mirando hacia arriba— y el
cuerpo del sitio es claro. Tipografías provisionales: Newsreader (display y texto) +
Archivo (interfaz).

Una sola animación no provocada: la deriva del follaje del hero, en CSS puro, en un Server
Component. Lo demás responde a acciones. Todo se congela con `prefers-reduced-motion`.

### Verificación

| Check | Estado |
|---|---|
| `pnpm lint` | verde |
| `pnpm typecheck` | verde |
| `pnpm test` (4 checks de proyección) | verde |
| `pnpm build` | verde, 100% estático |
| Las 6 rutas responden 200 | verde |
| Revisión visual en navegador | **pendiente** (ver abajo) |

### Seguridad en GitHub (tier gratuito, repo público)

- Dependabot alerts — activado
- Dependabot security updates — activado
- Secret scanning + push protection — activado
- CodeQL default setup (`javascript-typescript`, `actions`) — configurado

`security_and_analysis[secret_scanning_non_provider_patterns]` y `validity_checks`
quedaron en `disabled`: la API acepta el PATCH pero no los activa en este plan.

### Qué quedó abierto

- **Revisión visual en navegador.** La extensión de Chrome no estaba conectada durante la
  sesión, así que la comprobación a 375 / 768 / 1440 px no se hizo. El sitio compila,
  responde 200 en todas las rutas y el layout es responsive por construcción, pero eso no
  sustituye mirarlo. **Primera tarea de la sesión 2.**
- Marca real (logo, hex, tipografías) → `src/styles/tokens.css`.
- Fotos → `public/images/`; al cambiar el `src` en los JSON de `.svg` a `.jpg`, `Figure`
  pasa sola a `next/image`.
- Datos de los ~6 cafés → `src/content/cafes/`.
- Confirmar canal de contacto y dirección → `CONTACT` en `src/components/layout/Footer.tsx`
  (hoy son placeholders visibles).
- Deploy a Vercel (se decidió dejarlo para más adelante).
