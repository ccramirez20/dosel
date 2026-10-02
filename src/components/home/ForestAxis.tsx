"use client";

import { useEffect, useRef } from "react";

import { readingAt, STRATA } from "@/lib/strata";

/**
 * El eje de estratos: un fotómetro fijo en el margen derecho. La barra es el degradado de
 * luz del bosque y su índice baja con el scroll, leyendo cuánta luz llega a ese punto. Es la
 * idea del sitio hecha diagrama — el bosque se lee por capas y la página también. Antes era
 * un árbol dibujado, que junto a las fotos reales se veía infantil.
 *
 * La lectura va atada al scroll, no a una transición entre tres estados: el número corre de
 * uno en uno mientras bajas. Encima va suavizada — persigue al scroll con un amortiguado en
 * vez de copiarlo —, porque la rueda del mouse avanza a saltos de ~100 px y sin eso la
 * línea saltaba igual. Con `prefers-reduced-motion` se quita el amortiguado y la lectura
 * sigue al scroll sin inercia.
 *
 * Se escribe directo al DOM por refs en vez de con estado: es un valor por frame de scroll y
 * no tiene sentido re-renderizar React 60 veces por segundo para mover una línea.
 */

const TOP_HEIGHT = STRATA[0].height;

export default function ForestAxis() {
  const root = useRef<HTMLDivElement>(null);
  const index = useRef<HTMLDivElement>(null);
  const readout = useRef<HTMLDivElement>(null);
  const light = useRef<HTMLSpanElement>(null);
  const where = useRef<HTMLSpanElement>(null);
  const height = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let anchors: number[] = [];
    let frame = 0;
    let y = scrollY + innerHeight / 2;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      const target = scrollY + innerHeight / 2;
      // Recorre 18 % de lo que falta por frame: ~250 ms para alcanzar el scroll.
      y = reduce.matches ? target : y + (target - y) * 0.18;
      if (Math.abs(target - y) < 0.5) y = target;
      frame = y === target ? 0 : requestAnimationFrame(update);

      const r = readingAt(y, anchors);
      const top = `${(1 - r.height / TOP_HEIGHT) * 100}%`;
      index.current!.style.top = top;
      readout.current!.style.top = top;
      light.current!.textContent = `${Math.round(r.light)} %`;
      where.current!.textContent = r.name;
      height.current!.textContent = `${Math.round(r.height)} m`;

      // El tono sigue al fondo que queda detrás de la lectura, justo a la izquierda del eje.
      const line = index.current!.getBoundingClientRect();
      const behind = document.elementFromPoint(root.current!.getBoundingClientRect().left - 4, line.top);
      root.current!.dataset.tone = isDark(behind) ? "dark" : "light";
    };

    // Cada estrato puede tener varias secciones (el dosel son dos): su ancla es el centro
    // del bloque que forman. Se recortan al rango que el centro de la ventana puede
    // alcanzar, o el suelo nunca llegaría a 0 m si la última sección es corta.
    const measure = () => {
      const min = innerHeight / 2;
      const max = document.documentElement.scrollHeight - innerHeight / 2;
      anchors = STRATA.map((s) => {
        const boxes = [...document.querySelectorAll(`[data-stratum="${s.id}"]`)].map((el) =>
          el.getBoundingClientRect(),
        );
        const top = Math.min(...boxes.map((b) => b.top)) + scrollY;
        const bottom = Math.max(...boxes.map((b) => b.bottom)) + scrollY;
        return Math.min(max, Math.max(min, (top + bottom) / 2));
      });
      // Tras el recorte dos anclas pueden coincidir; readingAt necesita tramos no vacíos.
      for (let i = 1; i < anchors.length; i++) {
        anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
      }
      update();
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    measure();
    // Las fotos cambian el alto de las secciones al cargar: se re-mide con el body.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    // Cabe en el margen libre a la derecha del contenido, (ancho - 1152) / 2 + 32 px:
    // 104 px a 1280, donde solo va la barra (12 px); 156 px a 1400, donde ya entra la
    // lectura (12 + 10 de gap + 86).
    //
    // El eje va fijo y a menudo queda partido entre una sección crema y una verde dosel: no
    // hay un color de letra que se lea sobre ambas (el helecho se pierde en el crema, el
    // acento en el verde). Por eso cambia de tono según el fondo que tiene detrás. La barra
    // lleva un borde fino más oscuro para que su extremo claro no se funda con el crema.
    <div
      ref={root}
      aria-hidden
      data-tone="light"
      className="group pointer-events-none fixed right-1 top-1/2 z-30 hidden -translate-y-1/2 flex-col min-[1280px]:flex min-[1400px]:right-2 min-[1800px]:right-10"
    >
      <span className="mb-7 hidden whitespace-nowrap font-sans text-xs uppercase tracking-[0.12em] text-moss transition-colors duration-300 group-data-[tone=dark]:text-cream/75 min-[1400px]:block">
        Luz que llega
      </span>

      <div className="flex gap-2.5" style={{ height: "min(320px, 48vh)" }}>
        <div className="relative w-3 shrink-0">
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-cream via-fern via-55% to-understory ring-1 ring-moss/50 group-data-[tone=dark]:ring-cream/40" />
          <div ref={index} className="absolute -inset-x-1.5 top-0 h-0.5 -translate-y-1/2 bg-accent" />
        </div>

        <div className="relative hidden w-[86px] font-sans leading-tight min-[1400px]:block">
          {/* Del tamaño del texto de la página o menos: el número es la lectura, no un título. */}
          <div ref={readout} className="absolute top-0 -translate-y-1/2 tabular-nums">
            <span ref={light} className="block text-base font-medium text-accent transition-colors duration-300 group-data-[tone=dark]:text-cream">
              100 %
            </span>
            <span ref={where} className="block text-xs text-ink/75 transition-colors duration-300 group-data-[tone=dark]:text-cream/80">
              Dosel
            </span>
            <span ref={height} className="block text-xs text-moss transition-colors duration-300 group-data-[tone=dark]:text-cream/75">
              30 m
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Si el primer fondo pintado detrás de `el` es oscuro (luminancia relativa < 0,4). Solo lee
 * `rgb()`/`rgba()`: los fondos con opacidad de Tailwind salen como `oklab(...)` y se saltan,
 * que en esta página son velos sobre un fondo de sección que sí se lee más arriba.
 */
function isDark(el: Element | null): boolean {
  for (; el; el = el.parentElement) {
    const bg = getComputedStyle(el).backgroundColor;
    if (!bg.startsWith("rgb")) continue;
    const [r, g, b, a = 1] = bg.match(/[\d.]+/g)!.map(Number);
    if (a === 0) continue;
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.4;
  }
  return false;
}
