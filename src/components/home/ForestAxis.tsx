"use client";

import { useEffect, useState } from "react";

import { pickActive, STRATA } from "@/lib/strata";

/**
 * El eje de estratos: un árbol de perfil, fijo en el margen derecho, cuya capa iluminada
 * sigue a la sección que estás leyendo. Es la idea del sitio hecha diagrama — el bosque se
 * lee por capas y la página también.
 *
 * Por qué IntersectionObserver y no `animation-timeline` como en `Reveal`: aquí el elemento
 * animado (el árbol, que está fijo) no es el que entra en viewport, así que haría falta
 * `timeline-scope`, que hoy solo existe en Chromium. Este efecto no es un adorno progresivo:
 * si no corre en Firefox y Safari, no hay diagrama.
 */

export default function ForestAxis() {
  const [active, setActive] = useState<string>(STRATA[0].id);

  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>("[data-stratum]")];
    if (sections.length === 0) return;

    const visible = new Map<HTMLElement, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visible.set(entry.target as HTMLElement, entry.isIntersecting);
        }
        setActive((previous) =>
          pickActive(
            sections.map((el) => ({
              id: el.dataset.stratum!,
              visible: visible.get(el) ?? false,
            })),
            previous,
          ),
        );
      },
      // Banda angosta a la mitad de la pantalla: manda la sección que cruza el centro.
      { rootMargin: "-45% 0px -50% 0px" },
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    // El tamaño lo lleva la CAJA, no un `transform: scale()`. Con scale crecía todo por
    // igual, texto incluido: a 1920 las etiquetas salían a 21 px y en la banda angosta a
    // 7 px. Ahora el SVG se estira con su viewBox y las etiquetas conservan su tamaño.
    //
    // El ancho del árbol se dimensiona contra el margen libre a la derecha del contenido:
    //
    //     disponible = (ancho - 1152) / 2 + 32 - right - respiro
    //                   \_ max-w-6xl _/    \_ px-8, vacío
    //
    // menos la columna de etiquetas cuando se muestra. Cada tramo se dimensiona para el
    // ancho MÁS ANGOSTO de su banda:
    //
    //   1280 – 1400   árbol 100 px, sin etiquetas    96 px libres + 4 de right → 104
    //   1400 – 1560   árbol 140 px, sin etiquetas   156 px libres, se usan 148
    //   1560 – 1800   árbol 180 px, sin etiquetas   236 px libres, se usan 188
    //   1800 – 1920   árbol 180 px + etiquetas      356 px libres, se usan 316
    //   1920 +        árbol 198 px + etiquetas      416 px libres, se usan 334
    //
    // Las etiquetas son lo caro: 86 px de columna más el gap, casi tanto como el árbol
    // entero en la banda angosta. Se quedan solo donde sobra sitio para las dos cosas, y
    // por debajo el árbol se lleva todo el hueco. Perder los nombres no cuesta información:
    // siguen apareciendo en la banda de cada sección («10 m, sotobosque»).
    //
    // En 1280 el árbol se mete 8 px en el `px-8` de la sección. Es padding, no texto: el
    // glifo más a la derecha queda a 24 px. Abajo de 1280 ya no queda margen ni para eso.
    // El corte estaba en 1560 y dejaba fuera 1920×1080 con el escalado de Windows al 125 %
    // (1536 px CSS) y al 150 % (1280 px), que es media flota de portátiles.
    <div
      aria-label="Estratos del bosque"
      className="pointer-events-none fixed right-1 top-1/2 z-30 hidden -translate-y-1/2 items-center gap-2.5 [--tree-w:100px] min-[1280px]:flex min-[1400px]:right-2 min-[1400px]:[--tree-w:140px] min-[1560px]:[--tree-w:180px] min-[1800px]:right-10 min-[1920px]:[--tree-w:198px]"
    >
      {/* El viewBox es 84×168, o sea 1:2, así que el alto sale del ancho. El tope en `vh`
          es para la ventana ancha pero baja —un portátil de 1600×900, o cualquiera con la
          consola abierta—: sin él, el árbol de la banda de 1560 mediría 360 px de alto en
          una ventana de 560 y se comería la pantalla. 24vh de ancho = 48vh de alto, que es
          la proporción que ya tenía a 1920 y no estorba. */}
      <div
        className="relative aspect-[1/2] shrink-0"
        style={{ width: "min(var(--tree-w), 24vh)" }}
      >
        <Tree active={active} />
      </div>

      {/* Cada etiqueta se ancla a la altura de su capa en el dibujo, no a un reparto
          uniforme: si "Sotobosque" no queda junto a los arbustos, el diagrama no explica
          nada. Los porcentajes salen de las coordenadas del SVG. */}
      <ul className="relative hidden w-[86px] self-stretch font-sans text-sm leading-none min-[1800px]:block">
        {STRATA.map((s) => {
          const on = s.id === active;
          return (
            <li
              key={s.id}
              aria-current={on ? "true" : undefined}
              className="absolute -translate-y-1/2"
              style={{ top: LABEL_TOP[s.id] }}
            >
              <span
                className={`block transition-colors duration-500 ${
                  on ? "text-accent" : "text-fern"
                }`}
              >
                {s.name}
              </span>
              <span
                className={`mt-1 block tabular-nums transition-colors duration-500 ${
                  on ? "text-fern" : "text-transparent"
                }`}
              >
                {s.height}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Altura de cada etiqueta, en % del alto del dibujo, sobre el centro de su capa. */
const LABEL_TOP: Record<string, string> = {
  dosel: "17%",
  sotobosque: "66%",
  suelo: "84%",
};

/**
 * La silueta que le da identidad al dibujo. Se define una sola vez y se instancia a tres
 * tamaños —copa, copetes de rama, arbustos— para que todo el árbol hable una sola forma.
 * Antes la copa era esto, las ramas eran elipses y los arbustos otros blobs: tres
 * vocabularios en un dibujo de 84×168, y por eso no parecían del mismo árbol.
 */
const CANOPY =
  "M42 6c9 0 15 5 17 11 8 1 13 7 12 14 3 6-1 13-8 15-4 5-11 7-17 5-7 3-15 1-19-4-8 0-13-7-11-14-3-7 2-14 10-15C28 11 34 6 42 6Z";

/** Centro de la caja de CANOPY (x 11–71, y 6–53), para poder escalarla desde su centro. */
const CANOPY_CENTER = [41, 29] as const;

/** La silueta centrada en (x, y) al tamaño que se pida. */
function Foliage({
  x,
  y,
  scale,
  opacity,
}: {
  x: number;
  y: number;
  scale: number;
  opacity?: number;
}) {
  const [cx, cy] = CANOPY_CENTER;
  return (
    <path
      d={CANOPY}
      fill="currentColor"
      opacity={opacity}
      transform={`translate(${x} ${y}) scale(${scale}) translate(${-cx} ${-cy})`}
    />
  );
}

/**
 * Copetes en la punta de cada rama. Las puntas viven entre y 60 y 95: por debajo de la copa
 * (que llega a y 53) y por encima de los arbustos (que empiezan en y 100), para que las tres
 * bandas se lean separadas aunque compartan forma.
 */
const BRANCHES = [
  { from: [42, 80], tip: [20, 65], scale: 0.4 },
  { from: [42, 88], tip: [64, 70], scale: 0.36 },
  { from: [42, 102], tip: [27, 88], scale: 0.3 },
] as const;

/** Arbustos del sotobosque: la misma silueta, más pequeña, con su tallo hasta el suelo. */
const SHRUBS = [
  { x: 18, y: 112, scale: 0.36, stemFrom: 121 },
  { x: 65, y: 116, scale: 0.3, stemFrom: 124 },
  { x: 38, y: 122, scale: 0.22, stemFrom: 128 },
] as const;

/**
 * Un árbol de perfil en tres grupos, uno por estrato. El tronco y las ramas los cruzan y
 * nunca se apagan: son lo que le da estructura. La hojarasca del suelo sí se queda como
 * elipses planas — es hojarasca, no follaje, y ahí la diferencia de forma dice algo.
 *
 * Una sola paleta —helecho apagado, acento encendido— y no una por tono de sección. El
 * dibujo mide el doble de su ancho y va fijo a media pantalla, así que en cada transición
 * pasa varios cientos de píxeles de scroll partido entre el fondo crema y el verde dosel:
 * pintado del color de la sección activa, la mitad que caía sobre el otro fondo se borraba.
 * Helecho y acento son los dos tonos de la marca que se leen sobre ambos, así que el árbol
 * ya no depende de lo que tenga detrás. Bajarlo o moverlo no era salida: el tono cambia
 * cuando el borde entre secciones cruza el centro de la ventana, y ahí el dibujo siempre
 * queda partido.
 */
function Tree({ active }: { active: string }) {
  const paint = (id: string) =>
    `transition-colors duration-500 ${active === id ? "text-accent" : "text-fern"}`;

  return (
    <svg
      aria-hidden
      viewBox="0 0 84 168"
      className="absolute inset-0 h-full w-full text-fern"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* tronco y ramas: no pertenecen a ningún estrato, así que nunca se apagan */}
      <g stroke="currentColor" strokeOpacity={0.85} fill="none">
        <path d="M42 132V34" strokeWidth="2.6" />
        {BRANCHES.map(({ from, tip }) => (
          <path
            key={`${tip[0]}-${tip[1]}`}
            d={`M${from[0]} ${from[1]} ${tip[0]} ${tip[1]}`}
            strokeWidth="1.4"
          />
        ))}
      </g>

      {/* dosel — la copa y los copetes de rama, que son follaje del mismo árbol */}
      <g className={paint("dosel")}>
        <Foliage x={CANOPY_CENTER[0]} y={CANOPY_CENTER[1]} scale={1} />
        {BRANCHES.map(({ tip, scale }) => (
          <Foliage key={`${tip[0]}-${tip[1]}`} x={tip[0]} y={tip[1]} scale={scale} opacity={0.8} />
        ))}
      </g>

      {/* sotobosque — la misma silueta a ras de suelo, con sus tallos */}
      <g className={paint("sotobosque")}>
        <g stroke="currentColor" strokeWidth="1.2" fill="none">
          {SHRUBS.map(({ x, stemFrom }) => (
            <path key={x} d={`M${x} 132V${stemFrom}`} />
          ))}
        </g>
        {SHRUBS.map(({ x, y, scale }) => (
          <Foliage key={x} x={x} y={y} scale={scale} opacity={0.85} />
        ))}
      </g>

      {/* suelo — línea de hojarasca y las raíces que se abren debajo */}
      <g className={paint("suelo")}>
        <path d="M6 132h72" stroke="currentColor" strokeWidth="2" />
        <g stroke="currentColor" strokeWidth="1.2" fill="none">
          <path d="M42 132c-3 7-9 10-18 12M42 132c3 8 10 11 19 12M42 132v14" />
        </g>
        <g fill="currentColor" opacity="0.75">
          <ellipse cx="16" cy="129" rx="5" ry="1.6" />
          <ellipse cx="60" cy="129" rx="6" ry="1.6" />
          <ellipse cx="34" cy="129" rx="4" ry="1.4" />
        </g>
      </g>
    </svg>
  );
}
