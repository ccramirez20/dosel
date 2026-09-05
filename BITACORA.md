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

6. **`pnpm typecheck` corre `next typegen` antes de `tsc`.** `PageProps` y `LayoutProps`
   son globales que Next escribe en `.next/types`, que está gitignoreado. Sin el typegen,
   el script pasa en local (por un build viejo) y falla en CI con el árbol limpio. Fue
   exactamente lo que pasó en el primer run.

7. **Los reveals y el panel del mapa se animan con CSS, no con Motion.** El camino de SSR
   de Motion (y el de `AnimatePresence`/`PopChild`) no emite los estilos que el cliente sí
   aplica, y React reportaba desajuste de hidratación en cada carga. Ahora el reveal usa
   `animation-timeline: view()` y el panel se anima al remontar por `key`. Motion se queda
   solo donde la animación nace de una interacción y monta en cliente: los pines del mapa.
   Si alguien vuelve a meter `initial` en un componente que se renderiza en servidor, el
   desajuste vuelve.

8. **eslint 10 y TypeScript 7 quedan frenados en `dependabot.yml`.** Se probaron los dos:
   `eslint-config-next@16` todavía trae `eslint-plugin-react` y `typescript-eslint`
   incompatibles, y `pnpm lint` revienta con cualquiera de los dos. El ignore lleva escrita
   la condición para quitarlo. `@types/node@26` sí entró.

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
| CI en GitHub Actions (`main`) | verde |
| Revisión visual en Chrome (375 / 768 / 1440) | verde |
| Consola del navegador | sin errores |

### Seguridad en GitHub (tier gratuito, repo público)

- Dependabot alerts — activado
- Dependabot security updates — activado
- Secret scanning + push protection — activado
- CodeQL default setup (`javascript-typescript`, `actions`, escaneo semanal) — configurado
  y con su primer análisis en verde

Alertas abiertas al cerrar la sesión: **0 de Dependabot, 0 de code scanning, 0 de secret
scanning.** Los 4 PRs que Dependabot abrió al activarse se cerraron solos al aterrizar los
cambios equivalentes en `main`.

`security_and_analysis[secret_scanning_non_provider_patterns]` y `validity_checks`
quedaron en `disabled`: la API acepta el PATCH pero no los activa en este plan.

### Revisión visual

Hecha en Chrome a 1440, 768 y 375 px. Se encontraron y arreglaron tres cosas:

1. Desajuste de hidratación en `Reveal` (Motion en SSR) → reveal en CSS.
2. Desajuste de hidratación en `CafeInfoPanel` (`AnimatePresence`) → animación por `key`.
3. A 768 px el mapa ocupaba todo el ancho y medía ~1100 px de alto, empujando la lista
   fuera de la pantalla → tope de ancho hasta el breakpoint de dos columnas.

Comprobado además: menú móvil abre y cierra, bidireccionalidad del mapa en ambos sentidos,
las 5 vistas apilan bien en móvil, consola sin errores.

*Nota para la próxima sesión:* `resize_window` no baja de ~500 px en Chrome/Windows. Para
ver anchos de móvil de verdad sirve un HTML con iframes del ancho deseado servido desde
`public/`; las media queries evalúan contra el viewport del iframe.

### Qué quedó abierto

- Marca real (logo, hex, tipografías) → `src/styles/tokens.css`.
- Fotos → `public/images/`; al cambiar el `src` en los JSON de `.svg` a `.jpg`, `Figure`
  pasa sola a `next/image`.
- Datos de los ~6 cafés → `src/content/cafes/`.
- Confirmar canal de contacto y dirección → `CONTACT` en `src/components/layout/Footer.tsx`
  (hoy son placeholders visibles).
- Deploy a Vercel (se decidió dejarlo para más adelante).
