"use client";

import { motion, useReducedMotion } from "motion/react";

import { useCafeMap } from "@/lib/store/useCafeMap";

export interface MapDepartment {
  id: string;
  name: string;
  d: string;
  /** cuántos cafés del catálogo vienen de aquí; 0 = decorativo, no interactivo */
  cafeCount: number;
  /** el archipiélago se dibuja aparte, dentro del recuadro */
  isIsland: boolean;
}

export interface MapPin {
  cafeId: string;
  cafeName: string;
  regionId: string;
  municipio: string;
  x: number;
  y: number;
}

export default function ColombiaMap({
  departments,
  pins,
  viewBox,
  island,
}: {
  departments: MapDepartment[];
  pins: MapPin[];
  viewBox: { width: number; height: number };
  island: { transform: string; box: { x: number; y: number; size: number } };
}) {
  const { selectedCafeId, selectedRegionId, selectCafe, selectRegion } = useCafeMap();
  const reduced = useReducedMotion();

  const activeRegion =
    selectedRegionId ?? pins.find((p) => p.cafeId === selectedCafeId)?.regionId ?? null;

  const mainland = departments.filter((d) => !d.isIsland);
  const islands = departments.filter((d) => d.isIsland);

  const shapeClass = (active: boolean, hasCafes: boolean) =>
    [
      "transition-[fill,stroke] duration-300",
      active
        ? "fill-canopy stroke-canopy"
        : hasCafes
          ? "fill-fern/55 stroke-moss/70 hover:fill-fern/85"
          : "fill-fern/15 stroke-moss/25",
      hasCafes ? "cursor-pointer" : "",
    ].join(" ");

  return (
    <svg
      viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
      className="h-auto w-full"
      role="group"
      aria-label="Mapa de Colombia por departamentos. Los departamentos con café se pueden seleccionar."
    >
      <g>
        {mainland.map((dept) => {
          const active = activeRegion === dept.id;
          const hasCafes = dept.cafeCount > 0;
          const shape = (
            <path
              d={dept.d}
              className={shapeClass(active, hasCafes)}
              strokeWidth={0.7}
              vectorEffect="non-scaling-stroke"
            />
          );

          // Solo los departamentos con café entran al orden de tabulación: 33 paradas de
          // teclado para llegar a dos que hacen algo sería peor accesibilidad, no mejor.
          if (!hasCafes) {
            return (
              <g key={dept.id} aria-hidden className="pointer-events-none">
                {shape}
              </g>
            );
          }

          return (
            <g
              key={dept.id}
              role="button"
              tabIndex={0}
              aria-pressed={active}
              aria-label={`${dept.name}: ${dept.cafeCount} ${
                dept.cafeCount === 1 ? "café" : "cafés"
              }`}
              onClick={() => selectRegion(dept.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectRegion(dept.id);
                }
              }}
            >
              {shape}
            </g>
          );
        })}
      </g>

      {/* El archipiélago está a ~700 km de la costa: va como recuadro, no en su sitio real. */}
      <g transform={island.transform} className="pointer-events-none" aria-hidden>
        {islands.map((d) => (
          <path
            key={d.id}
            d={d.d}
            className="fill-fern/40 stroke-moss/40"
            strokeWidth={0.7}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
      <rect
        x={island.box.x}
        y={island.box.y}
        width={island.box.size}
        height={island.box.size}
        className="fill-none stroke-rule"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        aria-hidden
      />
      <text
        x={island.box.x}
        y={island.box.y + island.box.size + 13}
        className="fill-moss"
        fontSize={9}
        fontFamily="var(--font-archivo)"
        aria-hidden
      >
        San Andrés
      </text>

      <g>
        {pins.map((pin) => {
          const active = selectedCafeId === pin.cafeId;
          const dimmed = selectedRegionId !== null && selectedRegionId !== pin.regionId;
          return (
            <motion.g
              key={pin.cafeId}
              role="button"
              tabIndex={0}
              aria-label={`${pin.cafeName}, ${pin.municipio}`}
              aria-pressed={active}
              className="cursor-pointer"
              style={{
                transformBox: "view-box",
                transformOrigin: `${pin.x}px ${pin.y}px`,
              }}
              animate={{ opacity: dimmed ? 0.3 : 1, scale: active && !reduced ? 1.35 : 1 }}
              transition={{ duration: 0.28 }}
              onClick={() => selectCafe(pin.cafeId, pin.regionId)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectCafe(pin.cafeId, pin.regionId);
                }
              }}
            >
              <circle cx={pin.x} cy={pin.y} r={9} className="fill-accent/25" />
              <circle
                cx={pin.x}
                cy={pin.y}
                r={4}
                className="fill-accent stroke-cream"
                strokeWidth={1.5}
              />
            </motion.g>
          );
        })}
      </g>
    </svg>
  );
}
