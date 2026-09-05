"use client";

import CafeCard from "@/components/cafe/CafeCard";
import CafeInfoPanel from "@/components/map/CafeInfoPanel";
import ColombiaMap from "@/components/map/ColombiaMap";
import type { MapDepartment, MapPin } from "@/components/map/ColombiaMap";
import { useCafeMap } from "@/lib/store/useCafeMap";
import type { Cafe, Region } from "@/types/domain";

/**
 * Compone lista + mapa + panel sobre el store compartido. Recibe todo ya proyectado desde
 * el servidor: aquí no se calcula geometría, solo se decide qué se muestra.
 */
export default function CafeOriginExplorer({
  cafes,
  regions,
  departments,
  pins,
  viewBox,
  island,
  methodNames,
}: {
  cafes: Cafe[];
  regions: Region[];
  departments: MapDepartment[];
  pins: MapPin[];
  viewBox: { width: number; height: number };
  island: { transform: string; box: { x: number; y: number; size: number } };
  methodNames: Record<string, string>;
}) {
  const { selectedRegionId, clear } = useCafeMap();
  const visible = selectedRegionId
    ? cafes.filter((c) => c.origin.regionId === selectedRegionId)
    : cafes;
  const regionName = regions.find((r) => r.id === selectedRegionId)?.name;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-12">
      <div className="order-2 lg:order-1">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="font-display text-xl text-canopy">
            {regionName ? `Cafés de ${regionName}` : "Todos los cafés"}
          </h3>
          {selectedRegionId && (
            <button
              type="button"
              onClick={clear}
              className="font-sans text-sm text-moss underline underline-offset-4 hover:text-accent"
            >
              Ver los {cafes.length}
            </button>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {visible.map((cafe) => (
            <CafeCard
              key={cafe.id}
              cafe={cafe}
              region={regions.find((r) => r.id === cafe.origin.regionId)}
            />
          ))}
        </div>
      </div>

      <div className="order-1 lg:order-2">
        <div className="lg:sticky lg:top-24">
          <ColombiaMap
            departments={departments}
            pins={pins}
            viewBox={viewBox}
            island={island}
          />
          <div className="mt-5">
            <CafeInfoPanel cafes={cafes} regions={regions} methodNames={methodNames} />
          </div>
        </div>
      </div>
    </div>
  );
}
