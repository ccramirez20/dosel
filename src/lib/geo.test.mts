import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import { test } from "node:test";

import { geoContains } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";

import { MAP_VIEWBOX, getDepartments, projectPoint } from "./geo.ts";

const read = (...p: string[]) => JSON.parse(readFileSync(join(process.cwd(), ...p), "utf8"));

const inViewBox = ({ x, y }: { x: number; y: number }) =>
  x >= 0 && x <= MAP_VIEWBOX.width && y >= 0 && y <= MAP_VIEWBOX.height;

test("todos los departamentos tienen id, nombre y path dibujable", () => {
  const depts = getDepartments();
  assert.equal(depts.length, 33, "Colombia tiene 32 departamentos + Bogotá D.C.");
  for (const d of depts) {
    assert.match(d.id, /^CO-[A-Z]{2,3}$/, `id inesperado: ${d.id}`);
    assert.ok(d.name.length > 0, `${d.id} sin nombre`);
    assert.ok(d.d.startsWith("M"), `${d.id} sin path SVG`);
  }
});

test("regions.json y el TopoJSON comparten las mismas claves", () => {
  const drawn = new Set(getDepartments().map((d) => d.id));
  for (const r of read("src", "content", "regions.json") as { id: string }[]) {
    assert.ok(drawn.has(r.id), `region ${r.id} no existe en el TopoJSON`);
  }
});

test("la proyección conserva el orden norte-sur y cae dentro del viewBox", () => {
  const santaMarta = projectPoint(-74.199, 11.241)!; // costa norte
  const pitalito = projectPoint(-76.051, 1.854)!; // sur del Huila
  assert.ok(santaMarta && pitalito, "coordenadas conocidas deben proyectar");
  assert.ok(inViewBox(santaMarta) && inViewBox(pitalito), "deben caer dentro del lienzo");
  // en SVG la y crece hacia abajo, así que el punto más al sur debe tener mayor y
  assert.ok(pitalito.y > santaMarta.y, "el sur debe quedar por debajo del norte");
});

const contentCafes = () => {
  const dir = join(process.cwd(), "src", "content", "cafes");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  assert.ok(files.length > 0, "debe haber al menos un café");
  return files.map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")));
};

test("cada café del contenido tiene un pin dentro del mapa", () => {
  for (const cafe of contentCafes()) {
    const p = projectPoint(cafe.origin.lng, cafe.origin.lat);
    assert.ok(p, `${cafe.slug}: lat/lng no proyectables`);
    assert.ok(inViewBox(p), `${cafe.slug}: el pin cae fuera del lienzo`);
  }
});

/**
 * El guardia de verdad sobre las coordenadas. Que un pin caiga "dentro del lienzo" no dice
 * nada: un café del Huila con coordenadas de Nariño pasa esa prueba y produce un mapa
 * silenciosamente falso, con el departamento resaltado en un sitio y el pin en otro. Las
 * lat/lng se escriben a mano en los JSON, así que es justo el tipo de contenido que hay que
 * vigilar. Se compara contra el TopoJSON directamente y no contra `geo.ts` para no darle la
 * razón al mismo código que se está probando.
 */
test("el pin de cada café cae dentro del polígono de su departamento", () => {
  const topo = read("public", "geo", "colombia-departments.topo.json") as Topology<{
    col: GeometryCollection<{ name: string; id: string }>;
  }>;
  const collection = feature(topo, topo.objects.col);

  // La clave de join es el `id` de la geometría, no `shapeISO` (que es como lo llama el
  // CLAUDE.md §7: la documentación quedó del archivo original de geoBoundaries).
  const byId = new Map(collection.features.map((f) => [String(f.id), f]));

  for (const cafe of contentCafes()) {
    const shape = byId.get(cafe.origin.regionId);
    assert.ok(shape, `${cafe.slug}: regionId ${cafe.origin.regionId} no está en el TopoJSON`);
    assert.ok(
      geoContains(shape, [cafe.origin.lng, cafe.origin.lat]),
      `${cafe.slug}: ${cafe.origin.municipio} (${cafe.origin.lat}, ${cafe.origin.lng}) no cae en ${cafe.origin.regionId}`,
    );
  }
});
