"use client";

import Link from "next/link";

import { useCafeMap } from "@/lib/store/useCafeMap";
import type { Cafe, Region } from "@/types/domain";

/**
 * Ficha de café con forma de etiqueta de herbario: rectangular, filete fino, los datos
 * duros arriba y la nota de cata como pares término/descripción.
 * Al seleccionarla resalta su departamento en el mapa (CLAUDE.md §7).
 */
export default function CafeCard({ cafe, region }: { cafe: Cafe; region?: Region }) {
  const { selectedCafeId, selectCafe } = useCafeMap();
  const active = selectedCafeId === cafe.id;

  return (
    <article
      className={`border transition-colors duration-300 ${
        active ? "border-accent bg-paper" : "border-rule bg-paper/60 hover:border-moss"
      }`}
    >
      <button
        type="button"
        onClick={() => selectCafe(cafe.id, cafe.origin.regionId)}
        aria-pressed={active}
        className="w-full px-5 py-5 text-left md:px-6"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-xl leading-tight text-canopy">{cafe.name}</h3>
          {cafe.origin.altitudeMasl && (
            <span className="shrink-0 font-sans text-xs tabular-nums text-moss">
              {cafe.origin.altitudeMasl.toLocaleString("es-CO")} m
            </span>
          )}
        </div>

        <p className="mt-1 font-sans text-sm text-ink/60">
          {cafe.variety && <span className="taxon">{cafe.variety}</span>}
          {cafe.variety && cafe.process && ", "}
          {cafe.process && <span>proceso {cafe.process.toLowerCase()}</span>}
        </p>

        <p className="mt-4 border-t border-rule/70 pt-4 font-sans text-sm text-ink/80">
          {cafe.origin.municipio}
          {region && `, ${region.name}`}
          {cafe.origin.finca && (
            <span className="block text-ink/55">{cafe.origin.finca}</span>
          )}
        </p>

        <dl className="mt-4 space-y-1.5 font-sans text-sm">
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 text-moss">Qué oler</dt>
            <dd className="text-ink/80">{cafe.profile.aromas.join(", ")}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 text-moss">Qué probar</dt>
            <dd className="text-ink/80">{cafe.profile.tasting.join(", ")}</dd>
          </div>
        </dl>
      </button>

      <p className="border-t border-rule/70 px-5 py-3 md:px-6">
        <Link
          href={`/cafes/${cafe.slug}`}
          className="font-sans text-sm text-moss underline underline-offset-4 hover:text-accent"
        >
          Leer la historia de {cafe.name}
        </Link>
      </p>
    </article>
  );
}
