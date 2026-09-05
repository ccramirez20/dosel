import assert from "node:assert/strict";
import { test } from "node:test";

import type { Cafe } from "../../types/domain.ts";
import { assertKnownRegions, getCafe, getCafes, getRegions } from "./index.ts";

const cafeWith = (regionId: string): Cafe =>
  ({ slug: "prueba", origin: { regionId } }) as Cafe;

test("un regionId desconocido revienta el build, con el slug en el mensaje", () => {
  assert.throws(
    () => assertKnownRegions([cafeWith("CO-XXX")], new Set(["CO-HUI"])),
    /prueba.*CO-XXX/,
    "el error debe decir qué café y qué id, o no sirve para arreglarlo",
  );
});

test("un regionId conocido pasa sin ruido", () => {
  assert.doesNotThrow(() => assertKnownRegions([cafeWith("CO-HUI")], new Set(["CO-HUI"])));
});

test("getCafes valida el contenido real y lo devuelve ordenado", async () => {
  const cafes = await getCafes();
  assert.ok(cafes.length > 0, "debe haber al menos un café en src/content/cafes");

  const names = cafes.map((c) => c.name);
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, "es")));

  const ids = new Set((await getRegions()).map((r) => r.id));
  for (const cafe of cafes) {
    assert.ok(ids.has(cafe.origin.regionId), `${cafe.slug} apunta a una región inexistente`);
  }
});

test("getCafe encuentra por slug y devuelve undefined si no existe", async () => {
  const [first] = await getCafes();
  assert.equal((await getCafe(first.slug))?.id, first.id);
  assert.equal(await getCafe("no-existe"), undefined);
});
