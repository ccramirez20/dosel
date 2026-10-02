import assert from "node:assert/strict";
import { test } from "node:test";

import { readingAt, STRATA } from "./strata.ts";

const ANCHORS = [100, 300, 400];

test("en cada ancla la lectura es exactamente la del estrato", () => {
  STRATA.forEach((s, i) => {
    const r = readingAt(ANCHORS[i], ANCHORS);
    assert.equal(r.id, s.id);
    assert.equal(r.height, s.height);
    assert.ok(Math.abs(r.light - s.light) < 1e-9);
  });
});

test("fuera de las anclas se queda en el extremo", () => {
  assert.equal(readingAt(0, ANCHORS).light, 100);
  assert.equal(readingAt(9999, ANCHORS).height, 0);
});

test("la luz cae en escala logarítmica, no lineal", () => {
  // A mitad del tramo dosel–sotobosque: media geométrica de 100 y 10, no la aritmética.
  const r = readingAt(200, ANCHORS);
  assert.ok(Math.abs(r.light - Math.sqrt(1000)) < 1e-9);
  assert.equal(r.height, 20);
});

test("el estrato activo cambia a mitad del tramo", () => {
  assert.equal(readingAt(199, ANCHORS).id, "dosel");
  assert.equal(readingAt(201, ANCHORS).id, "sotobosque");
});

test("STRATA va de la copa al suelo y no incluye emergente", () => {
  assert.deepEqual(
    STRATA.map((s) => s.id),
    ["dosel", "sotobosque", "suelo"],
  );
});
