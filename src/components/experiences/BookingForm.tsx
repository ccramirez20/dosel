"use client";

import { useId, useMemo, useState, useSyncExternalStore } from "react";

import { buildBookingUrl, formatDateEs, upcomingDates } from "@/lib/booking";
import type { Experience, Schedule } from "@/types/domain";

const FIELD =
  "mt-1 w-full border border-rule bg-background px-3 py-2 font-sans text-sm text-ink";
const LABEL = "block font-sans text-xs text-ink/60";

const subscribeNothing = () => () => {};

/**
 * Reserva sin backend: el taller solo se dicta ciertos días, así que la fecha se escoge de
 * una lista y no de un calendario abierto. Las fechas se calculan al abrir la página —el
 * sitio es estático y en build se quedarían viejas— y el mensaje sale por WhatsApp, donde
 * el dueño confirma el cupo a mano. No se simulan cupos (CLAUDE.md §9).
 */
export default function BookingForm({
  experience,
  schedule,
}: {
  experience: Experience;
  schedule: Schedule;
}) {
  const id = useId();
  const [sent, setSent] = useState(false);

  // `new Date()` en render daría una fecha en build y otra en el cliente: el desajuste de
  // hidratación que ya nos costó una sesión. `useSyncExternalStore` es la forma que React
  // ofrece para eso — el servidor ve "" y el cliente la fecha de hoy—, y a diferencia de un
  // efecto no dispara un segundo render en cascada. La suscripción es vacía porque el valor
  // no cambia mientras la página está abierta.
  const today = useSyncExternalStore(
    subscribeNothing,
    () => new Date().toLocaleDateString("en-CA"),
    () => "",
  );
  const dates = useMemo(
    () => (today ? upcomingDates(schedule, today, 6) : []),
    [today, schedule],
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSent(true);
    window.open(
      buildBookingUrl({
        experienceTitle: experience.title,
        name: String(f.get("name") ?? ""),
        people: Number(f.get("people") ?? 1),
        date: String(f.get("date") ?? ""),
        time: String(f.get("time") ?? schedule.times[0]),
        note: String(f.get("note") ?? ""),
      }),
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 border border-rule bg-paper/60 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={LABEL} htmlFor={`${id}-date`}>
            Próximas fechas
          </label>
          <select id={`${id}-date`} name="date" required className={FIELD}>
            {dates.length === 0 && <option value="">Cargando fechas…</option>}
            {dates.map((date) => (
              <option key={date} value={date}>
                {formatDateEs(date)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL} htmlFor={`${id}-time`}>
            Hora
          </label>
          <select id={`${id}-time`} name="time" defaultValue={schedule.times[0]} className={FIELD}>
            {schedule.times.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor={`${id}-people`}>
            Personas
          </label>
          <input
            id={`${id}-people`}
            name="people"
            type="number"
            min={1}
            max={12}
            defaultValue={2}
            required
            className={FIELD}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={LABEL} htmlFor={`${id}-name`}>
            Tu nombre
          </label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            required
            autoComplete="name"
            className={FIELD}
          />
        </div>
      </div>

      <label className={`${LABEL} mt-3`} htmlFor={`${id}-note`}>
        Algo que debamos saber <span className="text-ink/40">(opcional)</span>
      </label>
      <textarea id={`${id}-note`} name="note" rows={2} className={FIELD} />

      <button
        type="submit"
        disabled={dates.length === 0}
        className="mt-4 bg-accent px-5 py-2.5 font-sans text-sm text-canopy transition-colors hover:bg-canopy hover:text-cream disabled:opacity-50"
      >
        Enviar por WhatsApp
      </button>
      <p role="status" className="mt-3 font-sans text-xs leading-relaxed text-ink/55">
        {sent
          ? "Se abrió WhatsApp con tu reserva escrita. El cupo queda confirmado cuando te respondamos."
          : "Se abre WhatsApp con el mensaje escrito. El cupo queda confirmado cuando te respondamos."}
      </p>
    </form>
  );
}
