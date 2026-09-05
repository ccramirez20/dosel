import Link from "next/link";

import CanopyBackdrop from "./CanopyBackdrop";

/** Estratos reales de un bosque húmedo tropical, de la copa al suelo. */
const STRATA = [
  { name: "Emergente", height: "45 m" },
  { name: "Dosel", height: "30 m" },
  { name: "Sotobosque", height: "10 m" },
  { name: "Suelo", height: "0 m" },
] as const;

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-canopy text-cream">
      <CanopyBackdrop />

      <div className="relative mx-auto flex min-h-[86svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
        <div className="lg:flex lg:items-end lg:justify-between lg:gap-16">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl leading-[0.94] tracking-[-0.02em]">
              El café bueno crece a la sombra.
            </h1>
            <p className="mt-8 max-w-[54ch] text-lg leading-relaxed text-cream/80">
              Dosel es un café con coordenadas. Cada grano viene de una finca, una altura y
              un bosque concretos, y aquí te decimos cuáles. Lo atiende un biólogo, así que
              las preguntas son bienvenidas.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 font-sans text-sm">
              <Link
                href="/productos"
                className="bg-accent px-6 py-3 text-canopy transition-colors hover:bg-cream"
              >
                Ver los cafés y su origen
              </Link>
              <Link
                href="/quienes-somos"
                className="border-b border-cream/40 pb-1 text-cream/85 transition-colors hover:border-accent hover:text-cream"
              >
                Qué es Dosel
              </Link>
            </div>
          </div>

          {/* El eje de estratos: la estructura del bosque que da nombre al lugar. */}
          <ul
            className="mt-16 hidden shrink-0 border-l border-cream/20 pl-5 font-sans text-xs lg:block"
            aria-label="Estratos del bosque"
          >
            {STRATA.map((s) => (
              <li key={s.name} className="flex items-baseline gap-4 py-2.5">
                <span className="w-12 tabular-nums text-cream/45">{s.height}</span>
                <span className={s.name === "Dosel" ? "text-accent" : "text-cream/70"}>
                  {s.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
