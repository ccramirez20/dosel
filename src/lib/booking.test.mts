import assert from "node:assert/strict";
import { test } from "node:test";

import { buildBookingUrl, formatDateEs, upcomingDates } from "./booking.ts";

// 2026-09-09 es miércoles. 11 viernes, 12 sábado, 14 lunes.
const WED = "2026-09-09";

test("upcomingDates semanal arranca en la próxima ocurrencia y salta de 7 en 7", () => {
  // viernes (5), pedido desde un miércoles
  assert.deepEqual(upcomingDates({ weekday: 5, every: "week", times: [] }, WED, 3), [
    "2026-09-11",
    "2026-09-18",
    "2026-09-25",
  ]);
});

test("upcomingDates semanal incluye hoy si hoy es el día", () => {
  const [first] = upcomingDates({ weekday: 3, every: "week", times: [] }, WED, 1);
  assert.equal(first, WED, "un miércoles pedido desde miércoles debe ofrecer hoy");
});

test("upcomingDates semanal salta a la semana siguiente si el día ya pasó", () => {
  // Pedido un viernes, para un taller de los lunes: el lunes de esta semana ya pasó.
  const dates = upcomingDates({ weekday: 1, every: "week", times: [] }, "2026-09-11", 2);
  assert.deepEqual(dates, ["2026-09-14", "2026-09-21"]);
  assert.ok(
    dates.every((d) => d >= "2026-09-11"),
    "no debe ofrecer una fecha pasada",
  );
});

test("upcomingDates semanal cruza el fin de mes y el fin de año", () => {
  assert.deepEqual(upcomingDates({ weekday: 4, every: "week", times: [] }, "2026-12-28", 3), [
    "2026-12-31",
    "2027-01-07",
    "2027-01-14",
  ]);
});

test("upcomingDates mensual da la n-ésima ocurrencia de cada mes", () => {
  // primer viernes
  assert.deepEqual(upcomingDates({ weekday: 5, every: "month", nth: 1, times: [] }, WED, 3), [
    "2026-10-02",
    "2026-11-06",
    "2026-12-04",
  ]);
});

test("upcomingDates mensual salta el mes en curso si la fecha ya pasó", () => {
  // El primer viernes de septiembre de 2026 es el 4; pidiendo desde el 9 ya pasó.
  const dates = upcomingDates({ weekday: 5, every: "month", nth: 1, times: [] }, WED, 2);
  assert.equal(dates[0], "2026-10-02");
  assert.ok(!dates.includes("2026-09-04"), "no debe ofrecer una fecha pasada");
});

test("upcomingDates mensual con nth: 3 cuenta desde el primero del mes", () => {
  // Tercer martes de octubre de 2026: 6, 13, 20.
  const [first] = upcomingDates(
    { weekday: 2, every: "month", nth: 3, times: [] },
    "2026-10-01",
    1,
  );
  assert.equal(first, "2026-10-20");
});

test("upcomingDates rechaza fechas mal formadas o imposibles", () => {
  const weekly = { weekday: 1, every: "week" as const, times: [] };
  assert.deepEqual(upcomingDates(weekly, "no-es-fecha", 3), []);
  assert.deepEqual(upcomingDates(weekly, "2026-02-31", 3), []);
  assert.deepEqual(upcomingDates(weekly, WED, 0), []);
});

test("formatDateEs escribe la fecha en español y no se corre de día", () => {
  assert.equal(formatDateEs("2026-09-11"), "viernes, 11 de septiembre");
  assert.equal(formatDateEs("2026-01-01"), "jueves, 1 de enero");
});

test("buildBookingUrl arma una URL de wa.me con el mensaje legible", () => {
  const url = new URL(
    buildBookingUrl({
      experienceTitle: "Pintura de esculturas",
      name: "Ana Ramírez",
      people: 3,
      date: "2026-09-11",
      time: "15:00",
      note: "Somos dos niños & un adulto",
    }),
  );

  assert.equal(url.hostname, "wa.me");
  const text = url.searchParams.get("text") ?? "";
  assert.match(text, /Pintura de esculturas/);
  assert.match(text, /Ana Ramírez/);
  assert.match(text, /Personas: 3/);
  assert.match(text, /viernes, 11 de septiembre a las 15:00/);
  assert.match(text, /dos niños & un adulto/);
  assert.equal(text.split("\n").length, 5);
});

test("buildBookingUrl omite la nota vacía", () => {
  const base = {
    experienceTitle: "Taller de galletas",
    name: "Ana",
    people: 1,
    date: "2026-09-14",
    time: "15:00",
  };
  const sin = new URL(buildBookingUrl(base)).searchParams.get("text") ?? "";
  const blanca = new URL(buildBookingUrl({ ...base, note: "   " })).searchParams.get("text") ?? "";

  assert.doesNotMatch(sin, /Nota:/);
  assert.equal(blanca, sin);
});

test("buildBookingUrl codifica el espacio como %20, no como +", () => {
  const raw = buildBookingUrl({
    experienceTitle: "Cata guiada",
    name: "Ana",
    people: 1,
    date: "2026-09-14",
    time: "16:00",
  });
  assert.match(raw, /%20/);
  assert.doesNotMatch(raw, /\+/);
});
