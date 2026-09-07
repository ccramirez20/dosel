import type { MapDepartment, MapPin } from "@/components/map/ColombiaMap";
import { getCafes, getMethods, getRegions } from "@/lib/data";
import type { Cafe } from "@/types/domain";
import { ISLAND_REGION_ID, MAP_VIEWBOX, getDepartments, getIslandInset, projectPoint } from "@/lib/geo";

/**
 * Franja de altitud del catálogo. Se deriva del contenido en vez de escribirse a mano: la
 * banda que había antes decía "1 600 – 2 000 m" con cafés a 1620 y 1750, y cada café nuevo
 * la volvía más falsa. Devuelve null si ningún café declara altura.
 */
export function altitudeRange(cafes: Cafe[]): { min: number; max: number } | null {
  const alturas = cafes
    .map((c) => c.origin.altitudeMasl)
    .filter((a): a is number => typeof a === "number");
  if (alturas.length === 0) return null;
  return { min: Math.min(...alturas), max: Math.max(...alturas) };
}

/**
 * Arma el modelo de vista del mapa en build. Todo lo que cruza al cliente aquí es
 * serializable y ya está en coordenadas del viewBox.
 */
export async function getMapView() {
  const [cafes, regions, methods] = await Promise.all([
    getCafes(),
    getRegions(),
    getMethods(),
  ]);

  const cafeCountByRegion = cafes.reduce<Record<string, number>>((acc, c) => {
    acc[c.origin.regionId] = (acc[c.origin.regionId] ?? 0) + 1;
    return acc;
  }, {});

  const departments: MapDepartment[] = getDepartments().map((d) => ({
    id: d.id,
    name: d.name,
    d: d.d,
    cafeCount: cafeCountByRegion[d.id] ?? 0,
    isIsland: d.id === ISLAND_REGION_ID,
  }));

  const pins: MapPin[] = cafes.flatMap((cafe) => {
    const p = projectPoint(cafe.origin.lng, cafe.origin.lat);
    if (!p) return [];
    return [
      {
        cafeId: cafe.id,
        cafeName: cafe.name,
        regionId: cafe.origin.regionId,
        municipio: cafe.origin.municipio,
        x: p.x,
        y: p.y,
      },
    ];
  });

  const methodNames = Object.fromEntries(methods.map((m) => [m.id, m.name]));

  return {
    cafes,
    regions,
    departments,
    pins,
    methodNames,
    altitudeRange: altitudeRange(cafes),
    viewBox: { width: MAP_VIEWBOX.width, height: MAP_VIEWBOX.height },
    island: getIslandInset(),
  };
}
