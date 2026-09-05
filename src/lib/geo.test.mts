import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import assert from "node:assert/strict";
import { test } from "node:test";

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

test("cada café del contenido tiene un pin dentro del mapa", () => {
  const dir = join(process.cwd(), "src", "content", "cafes");
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  assert.ok(files.length > 0, "debe haber al menos un café");
  for (const f of files) {
    const cafe = JSON.parse(readFileSync(join(dir, f), "utf8"));
    const p = projectPoint(cafe.origin.lng, cafe.origin.lat);
    assert.ok(p, `${cafe.slug}: lat/lng no proyectables`);
    assert.ok(inViewBox(p), `${cafe.slug}: el pin cae fuera del lienzo`);
  }
});
