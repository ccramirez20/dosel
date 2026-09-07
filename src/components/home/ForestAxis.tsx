"use client";

import { useEffect, useState } from "react";

import { pickActive, STRATA, type StratumMark, type Tone } from "@/lib/strata";

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

const INITIAL: StratumMark = { id: "dosel", tone: "dark" };

export default function ForestAxis() {
  const [active, setActive] = useState<StratumMark>(INITIAL);

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
              tone: (el.dataset.tone as Tone) ?? "light",
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

  const dark = active.tone === "dark";

  return (
    // El diagrama vive en el margen libre, que es (ancho - 1152) / 2: 64 px a 1280, 144 a
    // 1440, 384 a 1920. Por eso se oculta antes de 1440 —ahí pisaría la rejilla de tarjetas—
    // y crece por tramos en vez de tener un solo tamaño que sobra o falta según la pantalla.
    <div
      aria-label="Estratos del bosque"
      className="pointer-events-none fixed right-2 top-1/2 z-30 hidden -translate-y-1/2 origin-right scale-[0.62] min-[1440px]:block min-[1560px]:scale-[0.85] min-[1800px]:scale-125 min-[1800px]:right-10"
    >
      <div className="relative h-[248px] w-[214px]">
        <Tree active={active.id} dark={dark} />

        {/* Cada etiqueta se ancla a la altura de su capa en el dibujo, no a un reparto
            uniforme: si "Sotobosque" no queda junto a los arbustos, el diagrama no explica
            nada. Los porcentajes salen de las coordenadas del SVG (168 px de alto). */}
        <ul className="absolute inset-y-0 left-[124px] w-[90px] font-sans text-[11px] leading-none">
          {STRATA.map((s) => {
            const on = s.id === active.id;
            return (
              <li
                key={s.id}
                aria-current={on ? "true" : undefined}
                className="absolute -translate-y-1/2"
                style={{ top: LABEL_TOP[s.id] }}
              >
                <span
                  className={`block transition-colors duration-500 ${
                    on ? "text-accent" : dark ? "text-cream/45" : "text-ink/40"
                  }`}
                >
                  {s.name}
                </span>
                <span
                  className={`mt-1 block tabular-nums transition-colors duration-500 ${
                    on ? (dark ? "text-cream/55" : "text-ink/45") : "text-transparent"
                  }`}
                >
                  {s.height}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
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
 */
function Tree({ active, dark }: { active: string; dark: boolean }) {
  const base = dark ? "#f4efe6" : "#1f3d2b";
  const paint = (id: string) => {
    const on = active === id;
    return {
      className: "transition-all duration-500",
      style: { opacity: on ? 1 : dark ? 0.3 : 0.26 },
      color: on ? "#e07a3f" : base,
    };
  };

  const canopy = paint("dosel");
  const understory = paint("sotobosque");
  const floor = paint("suelo");

  return (
    <svg
      aria-hidden
      viewBox="0 0 84 168"
      className="absolute inset-y-0 left-0 h-full w-[124px]"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* tronco y ramas: no pertenecen a ningún estrato, así que nunca se apagan */}
      <g stroke={base} strokeOpacity={dark ? 0.5 : 0.4} fill="none">
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
      <g {...canopy}>
        <Foliage x={CANOPY_CENTER[0]} y={CANOPY_CENTER[1]} scale={1} />
        {BRANCHES.map(({ tip, scale }) => (
          <Foliage key={`${tip[0]}-${tip[1]}`} x={tip[0]} y={tip[1]} scale={scale} opacity={0.8} />
        ))}
      </g>

      {/* sotobosque — la misma silueta a ras de suelo, con sus tallos */}
      <g {...understory}>
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
      <g {...floor}>
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
