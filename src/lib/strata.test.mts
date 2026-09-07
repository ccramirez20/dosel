import assert from "node:assert/strict";
import { test } from "node:test";

import { pickActive, STRATA } from "./strata.ts";

const PREV = { id: "dosel", tone: "dark" } as const;

test("pickActive toma la sección visible y su tono", () => {
  const active = pickActive(
    [
      { id: "dosel", tone: "light", visible: false },
      { id: "sotobosque", tone: "dark", visible: true },
      { id: "suelo", tone: "light", visible: false },
    ],
    PREV,
  );
  assert.deepEqual(active, { id: "sotobosque", tone: "dark" });
});

test("pickActive conserva la anterior cuando ninguna cruza la banda", () => {
  const seen = STRATA.map((s) => ({ id: s.id, tone: "light" as const, visible: false }));
  assert.deepEqual(pickActive(seen, PREV), PREV);
  assert.deepEqual(pickActive([], PREV), PREV);
});

test("con dos secciones visibles gana la de más abajo", () => {
  // Al bajar, la que entra por el fondo debe mandar sobre la que aún no sale por arriba.
  const active = pickActive(
    [
      { id: "dosel", tone: "light", visible: true },
      { id: "sotobosque", tone: "dark", visible: true },
    ],
    PREV,
  );
  assert.equal(active.id, "sotobosque");
});

test("STRATA va de la copa al suelo y no incluye emergente", () => {
  assert.deepEqual(
    STRATA.map((s) => s.id),
    ["dosel", "sotobosque", "suelo"],
  );
});
