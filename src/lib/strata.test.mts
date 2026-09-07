import assert from "node:assert/strict";
import { test } from "node:test";

import { pickActive, STRATA } from "./strata.ts";

const PREV = "dosel";

test("pickActive toma la sección visible", () => {
  const active = pickActive(
    [
      { id: "dosel", visible: false },
      { id: "sotobosque", visible: true },
      { id: "suelo", visible: false },
    ],
    PREV,
  );
  assert.equal(active, "sotobosque");
});

test("pickActive conserva la anterior cuando ninguna cruza la banda", () => {
  const seen = STRATA.map((s) => ({ id: s.id, visible: false }));
  assert.equal(pickActive(seen, PREV), PREV);
  assert.equal(pickActive([], PREV), PREV);
});

test("con dos secciones visibles gana la de más abajo", () => {
  // Al bajar, la que entra por el fondo debe mandar sobre la que aún no sale por arriba.
  const active = pickActive(
    [
      { id: "dosel", visible: true },
      { id: "sotobosque", visible: true },
    ],
    PREV,
  );
  assert.equal(active, "sotobosque");
});

test("STRATA va de la copa al suelo y no incluye emergente", () => {
  assert.deepEqual(
    STRATA.map((s) => s.id),
    ["dosel", "sotobosque", "suelo"],
  );
});
