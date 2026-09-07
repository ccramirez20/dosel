import type { Schedule } from "../types/domain.ts";
import { CONTACT } from "./site.ts";

/**
 * Reserva de talleres en v1: sin backend y sin cupos. El formulario ofrece las próximas
 * fechas del taller, arma un mensaje y lo entrega por WhatsApp, que es donde el dueño
 * confirma a mano (CLAUDE.md §9).
 *
 * Todo el cálculo de fechas va en UTC. La trampa es `new Date("2026-09-12")`: parsear la
 * cadena la trata como un instante UTC, así que en Bogotá cae el día anterior y un sábado
 * se lee como viernes. Trabajando con `Date.UTC` de punta a punta el resultado es el mismo
 * en cualquier máquina — importa porque CI corre en UTC y el dueño no.
 */

const DAY_MS = 86_400_000;

/** "YYYY-MM-DD" → Date en UTC, o null si la cadena no es una fecha real. */
function parse(isoDate: string): Date | null {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  // "2026-02-31" rueda a marzo en vez de fallar; se rechaza comparando de vuelta.
  return date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? date : null;
}

const iso = (date: Date) => date.toISOString().slice(0, 10);

/** La n-ésima ocurrencia de `weekday` en un mes, p. ej. el primer viernes. */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date {
  const first = new Date(Date.UTC(year, month, 1));
  const offset = (weekday - first.getUTCDay() + 7) % 7;
  return new Date(Date.UTC(year, month, 1 + offset + (nth - 1) * 7));
}

/**
 * Las próximas `count` fechas del taller a partir de `fromIso` (inclusive). Se calcula al
 * abrir la página, no en build: así no envejece entre despliegues.
 */
export function upcomingDates(schedule: Schedule, fromIso: string, count = 6): string[] {
  const from = parse(fromIso);
  if (!from || count <= 0) return [];

  if (schedule.every === "week") {
    const offset = (schedule.weekday - from.getUTCDay() + 7) % 7;
    const first = from.getTime() + offset * DAY_MS;
    return Array.from({ length: count }, (_, i) => iso(new Date(first + i * 7 * DAY_MS)));
  }

  const nth = schedule.nth ?? 1;
  const dates: string[] = [];
  // Se arranca en el mes de `from` porque la fecha de este mes puede no haber pasado aún.
  for (let i = 0; dates.length < count; i++) {
    const candidate = nthWeekdayOfMonth(
      from.getUTCFullYear(),
      from.getUTCMonth() + i,
      schedule.weekday,
      nth,
    );
    if (candidate >= from) dates.push(iso(candidate));
  }
  return dates;
}

/** "2026-09-16" → "miércoles 16 de septiembre". Intl nativo, sin librería de fechas. */
export function formatDateEs(isoDate: string): string {
  const date = parse(isoDate);
  if (!date) return isoDate;
  return new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
}

export interface BookingInput {
  experienceTitle: string;
  name: string;
  people: number;
  /** "YYYY-MM-DD" */
  date: string;
  time: string;
  note?: string;
}

export function buildBookingUrl({
  experienceTitle,
  name,
  people,
  date,
  time,
  note,
}: BookingInput): string {
  const lines = [
    `Hola, quiero reservar: ${experienceTitle}.`,
    `Nombre: ${name}`,
    `Personas: ${people}`,
    `Fecha: ${formatDateEs(date)} a las ${time}`,
  ];
  if (note?.trim()) lines.push(`Nota: ${note.trim()}`);

  // encodeURIComponent y no URLSearchParams: este codifica el espacio como "+", y wa.me lo
  // muestra literal en el mensaje.
  return `${CONTACT.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}
