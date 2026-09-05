import { readFileSync } from "node:fs";
import { join } from "node:path";

import { geoMercator, geoPath } from "d3-geo";
import type { GeoProjection } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";

/**
 * Proyección del mapa. Corre SOLO en build (todas las páginas son SSG): el cliente recibe
 * strings `d` y coordenadas ya calculadas, así que d3-geo y el TopoJSON nunca llegan al
 * bundle del navegador.
 */

/** Alto/ancho del lienzo SVG. El SVG escala con `viewBox`, nunca con px fijos. */
export const MAP_VIEWBOX = { width: 620, height: 900 } as const;

/**
 * San Andrés y Providencia está a ~700 km de la costa. Incluirlo en el encuadre encoge el
 * territorio continental a la mitad, así que el ajuste se hace sin él y el archipiélago se
 * dibuja igual, desplazado a la esquina como recuadro (ver ISLAND_INSET).
 */
const MAINLAND_FIT_EXCLUDE = new Set(["CO-SAP"]);
export const ISLAND_REGION_ID = "CO-SAP";

export interface DepartmentShape {
  /** ISO 3166-2:CO */
  id: string;
  name: string;
  /** atributo `d` de un <path> SVG */
  d: string;
  /** punto de anclaje para etiquetas, en coordenadas del viewBox */
  centroid: [number, number];
}

export interface ProjectedPoint {
  x: number;
  y: number;
}

type DeptProps = { name: string; id: string };

let cache: { departments: DepartmentShape[]; projection: GeoProjection } | null = null;

function build() {
  if (cache) return cache;

  const topo = JSON.parse(
    readFileSync(join(process.cwd(), "public", "geo", "colombia-departments.topo.json"), "utf8"),
  ) as Topology<{ col: GeometryCollection<DeptProps> }>;

  const collection = feature(topo, topo.objects.col);
  const features = collection.features;

  const mainland = {
    type: "FeatureCollection" as const,
    features: features.filter((f) => !MAINLAND_FIT_EXCLUDE.has(String(f.id))),
  };

  const padding = 12;
  const projection = geoMercator().fitExtent(
    [
      [padding, padding],
      [MAP_VIEWBOX.width - padding, MAP_VIEWBOX.height - padding],
    ],
    mainland,
  );

  const path = geoPath(projection);

  const departments: DepartmentShape[] = features
    .map((f) => {
      const d = path(f);
      if (!d) return null;
      const [cx, cy] = path.centroid(f);
      return {
        id: String(f.id),
        name: f.properties?.name ?? String(f.id),
        d,
        centroid: [cx, cy] as [number, number],
      };
    })
    .filter((x): x is DepartmentShape => x !== null)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  cache = { departments, projection };
  return cache;
}

export function getDepartments(): DepartmentShape[] {
  return build().departments;
}

/** Proyecta lng/lat del `Origin` a coordenadas del viewBox. Nunca se hardcodean píxeles. */
export function projectPoint(lng: number, lat: number): ProjectedPoint | null {
  const p = build().projection([lng, lat]);
  if (!p || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) return null;
  return { x: p[0], y: p[1] };
}

/**
 * Transform SVG que trae el archipiélago al lienzo como recuadro. Se calcula desde el
 * centroide real proyectado, no con píxeles a ojo: si cambia el viewBox o el TopoJSON,
 * el recuadro se recoloca solo.
 */
export function getIslandInset(): { transform: string; box: { x: number; y: number; size: number } } {
  const island = getDepartments().find((d) => d.id === ISLAND_REGION_ID);
  const scale = 2.6;
  const size = 92;
  const box = { x: 14, y: 14, size };
  const target = { x: box.x + size / 2, y: box.y + size / 2 };
  if (!island) return { transform: "", box };
  const [cx, cy] = island.centroid;
  return {
    transform: `translate(${target.x - scale * cx} ${target.y - scale * cy}) scale(${scale})`,
    box,
  };
}
