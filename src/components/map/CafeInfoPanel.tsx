"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { useCafeMap } from "@/lib/store/useCafeMap";
import type { Cafe, Region } from "@/types/domain";

export default function CafeInfoPanel({
  cafes,
  regions,
  methodNames,
}: {
  cafes: Cafe[];
  regions: Region[];
  methodNames: Record<string, string>;
}) {
  const { selectedCafeId, selectedRegionId, clear } = useCafeMap();
  const reduced = useReducedMotion();

  const cafe = cafes.find((c) => c.id === selectedCafeId) ?? null;
  const region = regions.find((r) => r.id === (selectedRegionId ?? cafe?.origin.regionId));
  const inRegion = cafes.filter((c) => c.origin.regionId === selectedRegionId);

  const key = cafe?.id ?? selectedRegionId ?? "vacio";
  const motionProps = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.25 },
      };

  return (
    <div
      aria-live="polite"
      className="min-h-[9.5rem] border border-rule bg-paper px-5 py-5 md:px-6"
    >
      <AnimatePresence mode="wait">
        <motion.div key={key} {...motionProps}>
          {cafe ? (
            <>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-xl leading-tight text-canopy">
                  {cafe.name}
                </h3>
                <button
                  type="button"
                  onClick={clear}
                  className="shrink-0 font-sans text-xs text-moss underline underline-offset-4 hover:text-accent"
                >
                  Quitar selección
                </button>
              </div>
              <p className="mt-1 font-sans text-sm text-ink/65">
                {cafe.origin.finca ? `${cafe.origin.finca}, ` : ""}
                {cafe.origin.municipio}
                {region && `, ${region.name}`}
              </p>
              <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-ink/85">
                {cafe.profile.description}
              </p>
              {cafe.recommendedMethods.length > 0 && (
                <p className="mt-4 font-sans text-sm text-ink/70">
                  Va mejor en{" "}
                  {cafe.recommendedMethods
                    .map((id) => methodNames[id] ?? id)
                    .join(" o ")}
                  .
                </p>
              )}
              <p className="mt-4">
                <Link
                  href={`/cafes/${cafe.slug}`}
                  className="font-sans text-sm text-moss underline underline-offset-4 hover:text-accent"
                >
                  Ver la ficha completa
                </Link>
              </p>
            </>
          ) : selectedRegionId && region ? (
            <>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-display text-xl leading-tight text-canopy">
                  {region.name}
                </h3>
                <button
                  type="button"
                  onClick={clear}
                  className="shrink-0 font-sans text-xs text-moss underline underline-offset-4 hover:text-accent"
                >
                  Ver todos
                </button>
              </div>
              <p className="mt-3 max-w-[58ch] font-sans text-sm leading-relaxed text-ink/75">
                {inRegion.length === 1
                  ? `Un café de este departamento: ${inRegion[0].name}. Está en la lista, ábrelo para ver su origen.`
                  : `${inRegion.length} cafés de este departamento. La lista de al lado ya está filtrada.`}
              </p>
            </>
          ) : (
            <p className="max-w-[58ch] font-sans text-sm leading-relaxed text-ink/65">
              Toca un departamento verde para ver qué cafés vienen de ahí, o abre una ficha
              para ubicar su finca en el mapa.
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
