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
| `pnpm test` (14 checks) | verde |
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

### Tests (ampliado al cierre)

Al revisar la cobertura quedó claro que había un solo archivo, sobre la proyección del
mapa. Se agregaron los dos puntos con lógica real que faltaban:

- `useCafeMap` — la semántica de toggle de la bidireccionalidad. Si se rompe, la UI no
  falla: simplemente deja de poderse deseleccionar, y eso no lo ve ningún build.
- `assertKnownRegions` — el guardia de `regionId`. Se extrajo de `getCafes` para poder
  probar el camino de error sin meter un JSON malo en `src/content/`.

14 checks en total. Se verificaron por mutación: rompiendo el toggle a propósito, el test
se pone rojo. La convención quedó escrita en el §10 del CLAUDE.md.

`src/lib/data/index.ts` pasó a imports relativos: `node --experimental-strip-types` no
resuelve el alias `@/`.

### Qué quedó abierto

- Marca real (logo, hex, tipografías) → `src/styles/tokens.css`.
- Fotos → `public/images/`; al cambiar el `src` en los JSON de `.svg` a `.jpg`, `Figure`
  pasa sola a `next/image`.
- Datos de los ~6 cafés → `src/content/cafes/`.
- Confirmar canal de contacto y dirección → `CONTACT` en `src/components/layout/Footer.tsx`
  (hoy son placeholders visibles).
- Deploy a Vercel (se decidió dejarlo para más adelante).

---

## Sesión 2 — 7 de septiembre de 2026

**Objetivo:** dejar el canal de reservas funcionando, convertir el eje de estratos en un
diagrama que siga el scroll, y cerrar los huecos del esqueleto.

### Qué quedó hecho

- **Reserva de talleres sin backend.** Formulario inline en `/experiencias` (uno por taller,
  dentro de un `<details>` nativo) que abre WhatsApp con el mensaje ya escrito. La fecha no
  es un calendario abierto: cada taller declara cuándo se dicta y el formulario ofrece sus
  próximas seis fechas. `Experience.bookable` pasó a `true` en los tres. La lógica pura vive
  en `src/lib/booking.ts`.
- **Eje de estratos → `ForestAxis`.** Un árbol de perfil en SVG, fijo en el margen derecho,
  cuya capa iluminada sigue a la sección en pantalla. La home quedó marcada con
  `data-stratum` / `data-tone` en las cuatro secciones.
- **"Emergente" fuera de la home.** El eje arranca en el dosel, que es el nombre del café.
  `/quienes-somos` conserva su sección de emergente por decisión del dueño.
- **Marca:** el bajante pasó a **"café y método"** (nav, footer, metadata, OG).
- **Horario real:** lunes a viernes, 2:00 a 6:00 p. m. Las franjas del formulario salen de
  ahí (`SLOTS`), no de una lista suelta.
- **Cierre de esqueleto:** `not-found.tsx`, `sitemap.ts`, `robots.ts`, y el CTA que le
  faltaba a `/cafes/[slug]`, que hasta ahora terminaba sin ninguna acción.

### Decisiones que conviene no deshacer

9. **`CONTACT` salió del Footer a `src/lib/site.ts`,** junto con `SITE_URL`. No es cosmético:
   `lib/booking.ts` necesita el número y su test corre con `node --experimental-strip-types`,
   que no parsea JSX. Importar desde un `.tsx` lo habría roto. De paso, `SITE_URL` dejó de
   estar duplicado entre el layout y el sitemap.

10. **`ForestAxis` usa `IntersectionObserver`, no `animation-timeline`.** El resto del sitio
    anima con CSS scroll-driven (`Reveal`), pero aquí el elemento animado —el árbol, que está
    fijo— no es el que entra en viewport, así que haría falta `timeline-scope`, que hoy solo
    existe en Chromium. `Reveal` puede degradar a "aparece y ya"; este efecto no: si no corre
    en Firefox y Safari, no hay diagrama. La decisión pura se extrajo a `pickActive` para
    poder probarla sin DOM.

11. **El `min` del campo de fecha se pone por ref, no como prop.** `new Date()` en render da
    una fecha en build y otra en el cliente: el desajuste de hidratación de la decisión #7 otra
    vez. Los refs no corren en servidor. Es solo comodidad; quien escriba una fecha pasada a
    mano igual la frena `handleSubmit`. (La primera versión usaba `useState` + `useEffect` y
    `react-hooks/set-state-in-effect` la rechazó, con razón.)

12. **Las fechas del taller son una regla, no una lista.** `Experience.schedule` dice
    `{weekday, every: "week" | "month", nth?, times}` y `upcomingDates()` calcula las
    próximas al **abrir la página**, no en build. Una lista de fechas escritas a mano en el
    JSON envejecería entre despliegues —el sitio es estático y se reconstruye cuando alguien
    despliega, no cuando pasa el tiempo— y obligaría al dueño a teclear 52 filas al año.
    No se usó `Session[]` para esto a propósito: `Session` exige `capacity` y `booked`, y
    llenarlos sería simular cupos, que es justo lo que el §9 del CLAUDE.md prohíbe en v1.

13. **Todo el cálculo de fechas va en UTC.** La trampa es `new Date("2026-09-12")`: parsear
    la cadena la trata como un instante UTC, así que en Bogotá cae el día anterior y un
    sábado se lee como viernes. Con `Date.UTC` + `getUTC*` de punta a punta el resultado es
    el mismo en cualquier máquina — importa porque CI corre en UTC y el dueño no. Se verificó
    corriendo la suite bajo UTC, América/Bogotá y Pacific/Kiritimati.

14. **El eje se dimensiona contra el margen libre, que es `(ancho − 1152) / 2`.** Da 64 px a
    1280, 144 a 1440 y 384 a 1920. Por eso el diagrama se oculta antes de 1440 —a 1280 pisaba
    la rejilla de tarjetas, medido, no supuesto— y crece por tramos: 133 px, 182 px y 268 px.
    Si alguien cambia el `max-w-6xl` de la home, hay que rehacer esta cuenta.

15. **Se quitó `alternates: { canonical: "/" }` del layout raíz.** Aplicaba a *todas* las
    rutas: le decía a Google que `/experiencias`, `/productos` y cada ficha de café son
    duplicados de la home. Con el sitemap nuevo eso las habría sacado del índice. Sin la
    etiqueta, cada URL es su propia canónica, que es lo correcto en un sitio estático sin
    parámetros. Ojo: `canonical: "./"` **no** lo arregla — los docs de Next 16 lo resuelven
    contra `metadataBase`, no contra la ruta.

### Verificación

| Check | Estado |
|---|---|
| `pnpm lint` | verde |
| `pnpm typecheck` | verde |
| `pnpm test` (23 checks) | verde |
| `pnpm build` | verde, 100% estático (9 rutas) |
| Tests nuevos verificados por mutación | verde |
| `isOpenDay` determinista en UTC / Bogotá / Kiritimati | verde |
| HTML servido: `data-stratum` en las 4 secciones, 3 formularios con ids únicos | verde |
| `/sitemap.xml` con URLs absolutas, `/robots.txt`, 404 propio | verde |
| Revisión visual en Chrome | verde |
| Consola, en carga limpia de `/` y `/experiencias` | sin errores ni desajustes de hidratación |

Comprobado en el navegador: el árbol resalta dosel → sotobosque → suelo al bajar y recolorea
en ambos sentidos al cruzar la banda oscura; el formulario abre WhatsApp con el mensaje
correcto (`Fecha: miércoles, 23 de septiembre a las 16:00`, tildes y `&` intactos); las tres
programaciones producen las fechas esperadas.

**Cómo se midió el solape del eje.** `resize_window` no cambia el viewport en Chrome/Windows
—devolvía 1920 sin importar lo que se pidiera—, así que las capturas "a 1440" de la primera
mitad de la sesión eran todas a 1920 y no probaban nada. Sirve el truco de la sesión 1: un
HTML con iframes del ancho deseado servido desde `public/`, porque las media queries evalúan
contra el viewport del iframe. Y en vez de mirar la captura escalada, se midieron las cajas
con `getBoundingClientRect()` desde dentro del iframe. Vale la pena repetirlo así: el primer
selector que se escribió agarraba el enlace del footer en vez de la tarjeta, y los números
salieron plausibles pero falsos.

### Qué quedó abierto

Igual que en la sesión 1, más un pendiente que ahora **bloquea una función, no solo la
estética**:

- **El número de WhatsApp sigue siendo `wa.me/570000000000`.** El formulario de reserva no
  sirve hasta que se cambie — una línea en `src/lib/site.ts`.
- Marca real (logo, hex, tipografías) → `src/styles/tokens.css`.
- Fotos → `public/images/` sigue vacío; los 14 `images[].src` apuntan a `.svg` inexistentes y
  `Figure` los dibuja como placeholder.
- Datos de los ~6 cafés → hay 2.
- Dirección del local (hoy "Por confirmar").
- **Día y frecuencia reales de cada taller** → `schedule` en
  `src/content/experiences/experiences.json`. Hoy son supuestos: galletas los miércoles,
  esculturas el primer viernes del mes, cata los viernes. La regla no sabe de festivos: con
  la programación actual ofrece el viernes 1 de enero.
- `opengraph-image`: depende del logo.
- Deploy a Vercel.

No se construyeron a propósito: `/metodos/[slug]` (los métodos ya salen completos en
`/experiencias` y `getMethod()` es código muerto), `/experiencias/[slug]`, y cualquier cosa
de Fase 2 o 3.

---

## Sesión 3 — 7 de septiembre de 2026

**Objetivo:** aplicar la ronda de feedback del dueño sobre la versión revisada. Ciclo de
contenido y coherencia, no de funcionalidad.

### Qué quedó hecho

- **La analogía del bosque se sostiene sola.** Regla nueva: una página usa bandas de estrato
  solo si usa **más de una, en orden**. Home (3), quiénes somos (3), productos (2). En
  `/experiencias` la banda `10 m, sotobosque` estaba sola y pasó a etiqueta plana
  («Talleres»), en la línea del «Mostrador» que esa misma página ya usaba.
- **`/quienes-somos` bajó de 4 capas a 3**, cada una amarrada a una parte del negocio: dosel =
  el lugar, sotobosque = los cafés, suelo = la barra. «Emergente» salió del vocabulario del
  sitio; lo que contaba —los lotes que aparecen una cosecha y no vuelven— vive ahora en
  sotobosque. La intro pasó a «Dosel tiene alma de biólogo».
- **Ramas con follaje** en el diagrama del árbol. Eran cuatro palos colgando de una bola.
- **Catálogo a 6 cafés**, de 1 350 a 2 050 msnm y en 5 departamentos, con dos en Huila.
- **Panadería → «Para acompañar»**: 8 productos, panadería y los snacks ACAB en un solo bloque.
- Textos: fuera «panadería hecha el mismo día», fuera «el café que vale la pena», y la altura
  ahora dice en qué dirección opera.

### Decisiones que conviene no deshacer

16. **La banda de altitud de `/productos` se deriva del contenido.** Estaba escrita a mano
    (`1 600 – 2 000 m`) con cafés a 1620 y 1750: el «2 000» ya no correspondía a nada, y cada
    café nuevo la volvía más falsa. Ahora `altitudeRange()` en `lib/mapView.ts` la calcula, y
    el `lead` dice cuántos orígenes, de cuántos departamentos y entre qué alturas. Un dato
    visible que se escribe a mano es un dato que se pudre.

17. **`msnm` en los dos sitios donde se muestra la altura.** Había dos formatos distintos y
    ninguno era ese: `1.620 m` en la tarjeta y `1.620 m s. n. m.` en la ficha. El número
    siempre por `toLocaleString("es-CO")`.

18. **Un test verifica que cada pin caiga dentro del polígono de su departamento.** El que
    había solo comprobaba que cayera dentro del lienzo, y eso no atrapa un café del Huila con
    coordenadas de Nariño: el mapa quedaría resaltando un sitio y pinchando otro. Se resolvió
    con `geoContains` de `d3-geo` contra el TopoJSON directamente, no contra `geo.ts`, para no
    darle la razón al mismo código que se prueba. **De paso apareció que la clave de join no
    es `shapeISO`** —como dice el §7 del CLAUDE.md y la decisión #2 de la sesión 1— sino el
    `id` de la geometría. La documentación venía del archivo original de geoBoundaries.

19. **A `lg` (1 024 px) la lista de cafés se queda en una columna.** Se midió con seis
    tarjetas antes de tocarla: la columna de la lista mide ~400 px, y dos columnas ahí dejarían
    cada tarjeta en ~190 px. La lista larga contra el mapa `sticky` es el comportamiento
    buscado, no un defecto. Se verificó en vez de cambiarlo a ciegas.

### Un defecto viejo que apareció de paso

El alternado de imagen de `/quienes-somos` **nunca funcionó**. La clase era
`md:[&>figure]:order-2`, pero el hijo directo del grid es el `<div>` que envuelve `Reveal`, no
el `<figure>`: el selector no casaba con nada y la imagen quedaba siempre a la derecha. Ahora
apunta al último hijo. Medido antes y después: 985 / 409 / 985 px.

### Verificación

| Check | Estado |
|---|---|
| `pnpm lint`, `typecheck`, `build` | verde, 100% estático, 6 fichas de café |
| `pnpm test` (31 checks) | verde |
| Guardia de departamentos, por mutación | verde (regionId cambiado y un dígito de latitud) |
| Pines: 6, separación mínima 27 unidades (el halo mide 9) | sin solapes |
| «2 cafés de este departamento» al tocar Huila | verde — era código muerto hasta hoy |
| Botones de quiénes somos alineados | verde, mismo centro vertical (2469 px) |
| Consola en las 4 rutas | sin errores ni desajustes de hidratación |
| `prefers-reduced-motion` | verde, **sin querer**: la máquina lo tiene activo, así que toda la revisión se hizo con reduced motion y el resaltado del árbol funcionó igual, sin transición |

### Qué quedó abierto

Sin cambios respecto a la sesión 2, y sigue todo del lado del dueño:

- **El número de WhatsApp sigue siendo `wa.me/570000000000`**; el formulario de reserva no
  sirve hasta cambiarlo (`src/lib/site.ts`).
- Día y frecuencia reales de cada taller (`schedule` en `experiences.json`); los de hoy son
  supuestos y la regla no sabe de festivos.
- **Los 4 cafés nuevos son placeholder**: nombres, fincas, perfiles e historias son inventados.
  Las coordenadas sí son de municipios cafeteros reales y el test las valida contra el
  departamento, pero las fincas no existen.
- Marca, fotos (`public/images/` sigue vacío), dirección del local, deploy a Vercel.

---

## Sesión 4 — 7 de septiembre de 2026

**Objetivo:** darle identidad gráfica al diagrama del árbol y reemplazar los productos
inventados por la carta real.

### Qué quedó hecho

- **Una sola silueta a tres escalas.** La forma de la copa se extrajo a la constante `CANOPY`
  y se instancia con un `transform` en tres tamaños: copa, copetes de rama y arbustos del
  sotobosque. Antes había tres construcciones distintas en un dibujo de 84×168 —copa
  festoneada, elipses en las ramas, blobs en los arbustos— y por eso «no parecían del mismo
  árbol».
- **Carta real:** 7 productos. Panadería (galletas, torta de la casa, torta de naranja,
  pasteles, deditos de queso) y los dos de ACAB con nombre y descripción del dueño: **Capitana
  Piña** y **Capitán Banano**. Fuera el mix de frutas, el mango, y los cuatro de panadería
  inventados.

### Decisiones que conviene no deshacer

20. **La silueta se instancia con `transform`, no con `<defs>` + `<use>`.** Un `<path>` con el
    mismo `d` hace lo mismo sin meter un `id` global al documento, que es lo que obliga a
    `useId` en cuanto el componente se monte más de una vez.

21. **La hojarasca del suelo se queda como elipses planas.** Es hojarasca, no follaje: ahí la
    diferencia de forma dice algo. La unificación es para lo que sí es follaje del árbol.

22. **Se quitaron los «claros de luz» de la copa.** Eran dos elipses claras dentro de la
    silueta. A tamaño real no se leían como claros sino como rayones, y dos marcas a alturas
    parecidas dentro de una forma redonda vuelven a leerse como una cara — el mismo problema
    de la sesión 2. La silueta sola ya es la identidad.

23. **Tres copetes de rama, no cuatro.** La primera versión con cuatro, de tamaños 0.32 a 0.22,
    dejaba el árbol grumoso: se leía como bolitas colgadas del tronco. Con tres más grandes
    (0.40 / 0.36 / 0.30) leen como sub-copas.

### Un error que cometí y conviene no repetir

Escribí las descripciones de panadería con el prefijo literal `PLACEHOLDER:` **visible en la
página**. Lo pedido era texto en el tono del sitio, marcado como placeholder en el documento de
revisión, no en pantalla. Corregido en el momento; queda anotado porque el sitio está a punto
de compartirse con un revisor externo.

**Qué es placeholder hoy, para el documento de revisión:** las 5 descripciones de panadería,
los 4 cafés nuevos (nombres, fincas, perfiles e historias; las coordenadas sí son reales y
están validadas contra el departamento), y los `schedule` de los 3 talleres. Las dos
descripciones de ACAB **no** lo son: las dio el dueño textuales.

### Verificación

| Check | Estado |
|---|---|
| `pnpm lint`, `typecheck`, `test` (31), `build` | verde, 100% estático |
| `getBBox()` del SVG dentro del viewBox | verde: contenido x 6–78, y 6–146 en 84×168, nada recortado |
| Las 3 capas activan y recolorean | verde, medido: acento sobre claro, `cream` sobre la banda oscura, `canopy` sobre clara |
| `/productos` con 7 tarjetas | verde, 4 + 3 |
| Consola | sin errores |

No se agregaron tests: el árbol es geometría (la juzga el ojo, e hizo falta una iteración) y
los productos son contenido sin ramas de lógica.

### Despliegue: se cambia Vercel por Cloudflare Pages

El dueño preguntó si el plan gratis de Vercel permite más de un despliegue. Sí —**200 proyectos
y 100 despliegues diarios**— pero eso no es el problema:

**Vercel Hobby prohíbe el uso comercial**, y las guías de uso justo listan literalmente
«*Advertising the sale of a product or service*» como ejemplo. Un sitio de cafetería que muestra
carta y talleres cae ahí de lleno; no es un caso de frontera. Vercel exige Pro, 20 USD/mes.

Se decidió **Cloudflare Pages gratis**: permite uso comercial, sitios y ancho de banda
ilimitados, 500 despliegues al mes. El sitio ya es 100 % estático, así que encaja sin cambiar
arquitectura. Lo que faltará cuando se haga:

- `output: "export"` en `next.config.ts`, hoy vacío.
- `images: { unoptimized: true }` cuando lleguen las fotos, o el redimensionado de Cloudflare.
- Actualizar el §2 del CLAUDE.md, que dice «Deploy: Vercel».
- No hay API routes, middleware ni server actions que lo bloqueen; `sitemap.ts`, `robots.ts` y
  `generateStaticParams` funcionan con export.

Ojo para la Fase 2: la pasarela de pago necesitará endpoints de servidor, y con export estático
eso sale de Cloudflare Pages Functions o de otro lado. Se decide cuando llegue esa fase.

### Documento de revisión de textos

Queda acordado y pendiente para después del check final: un **`.csv`** con las columnas
**Página · Sección · Texto actual · Texto revisado · Notas**, que abre con doble clic en Excel o
Google Sheets. En esta máquina no hay `python-docx` ni `openpyxl`, así que un `.docx` de verdad
exigiría instalar una dependencia; el CSV no exige nada y se lee de vuelta igual de fácil.

### Cierre de la sesión

El trabajo de las sesiones 2, 3 y 4 se subió en un solo commit (`a0f5754`). Van juntas porque
los cambios se pisan entre sí —`ForestAxis` nace, se rediseña y se vuelve a rediseñar— y
separarlas después habría sido reconstruir estados intermedios que nunca existieron.

| Check | Estado |
|---|---|
| `pnpm lint`, `typecheck`, `test` (31), `build` (15 páginas) | verde |
| `pnpm audit` | «No known vulnerabilities found» |
| CI en GitHub Actions (`main`) | verde |
| CodeQL | verde |
| Alertas abiertas: Dependabot / code scanning / secret scanning | **0 / 0 / 0** |
| Las 7 rutas responden en local, y `/no-existe` da 404 | verde |
| Restos temporales y secretos en el árbol | ninguno |

### Qué sigue, en orden

1. Último feedback del dueño sobre esta versión.
2. Despliegue a **Cloudflare Pages** (ver arriba: `output: "export"` y §2 del CLAUDE.md).
3. Exportar el `.csv` de revisión de textos y pasarlo al cliente junto con el link provisional.
4. Con la respuesta del cliente + logo, colores e imágenes: montar la V1 definitiva.
5. Comprar el dominio con el cliente y apuntar el sitio.

### Qué quedó abierto

Sin cambios: número real de WhatsApp (`src/lib/site.ts`), días y frecuencia de los talleres,
datos reales de los 4 cafés, marca, fotos (`public/images/` sigue vacío) y dirección del local.
