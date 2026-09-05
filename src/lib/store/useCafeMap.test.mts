import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import { useCafeMap } from "./useCafeMap.ts";

/**
 * La bidireccionalidad del mapa vive entera en estos setters. Si el toggle se rompe, la
 * UI no falla: simplemente deja de poderse deseleccionar, y eso nadie lo nota en un build.
 */

const state = () => useCafeMap.getState();

beforeEach(() => state().clear());

test("elegir un café resalta también su departamento", () => {
  state().selectCafe("cafe-el-mirador", "CO-HUI");
  assert.equal(state().selectedCafeId, "cafe-el-mirador");
  assert.equal(state().selectedRegionId, "CO-HUI");
});

test("volver a tocar el mismo café lo deselecciona y suelta el departamento", () => {
  state().selectCafe("cafe-el-mirador", "CO-HUI");
  state().selectCafe("cafe-el-mirador", "CO-HUI");
  assert.equal(state().selectedCafeId, null);
  assert.equal(state().selectedRegionId, null);
});

test("tocar otro café cambia la selección en vez de acumularla", () => {
  state().selectCafe("cafe-el-mirador", "CO-HUI");
  state().selectCafe("cafe-aguas-claras", "CO-ANT");
  assert.equal(state().selectedCafeId, "cafe-aguas-claras");
  assert.equal(state().selectedRegionId, "CO-ANT");
});

test("elegir un departamento filtra y suelta el café puntual", () => {
  state().selectCafe("cafe-el-mirador", "CO-HUI");
  state().selectRegion("CO-ANT");
  assert.equal(state().selectedRegionId, "CO-ANT");
  assert.equal(state().selectedCafeId, null, "la ficha abierta no es de ese departamento");
});

test("volver a tocar el mismo departamento quita el filtro", () => {
  state().selectRegion("CO-ANT");
  state().selectRegion("CO-ANT");
  assert.equal(state().selectedRegionId, null);
});

test("clear deja el mapa sin selección", () => {
  state().selectCafe("cafe-el-mirador", "CO-HUI");
  state().clear();
  assert.equal(state().selectedCafeId, null);
  assert.equal(state().selectedRegionId, null);
});
