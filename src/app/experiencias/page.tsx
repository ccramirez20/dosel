import type { Metadata } from "next";

import BookingForm from "@/components/experiences/BookingForm";
import { CONTACT } from "@/lib/site";
import Figure from "@/components/ui/Figure";
import Reveal from "@/components/ui/Reveal";
import Stratum from "@/components/ui/Stratum";
import { getExperiences, getMethods } from "@/lib/data";

export const metadata: Metadata = {
  title: "Experiencias y métodos",
  description:
    "Talleres de galletas, pintura de esculturas y catas guiadas. Y los métodos de preparación explicados: de dónde vienen, para qué sirven y con qué café van mejor.",
};

export default async function ExperienciasPage() {
  const [experiences, methods] = await Promise.all([getExperiences(), getMethods()]);

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24">
        <Stratum
          band="Talleres"
          title="Cosas que se hacen con las manos."
          lead="Los talleres son en grupos pequeños y no hace falta saber nada de antes. Llenas el formulario, se abre WhatsApp con tu reserva escrita, y el cupo queda confirmado cuando te respondamos."
        />

        <ul className="grid gap-10 md:grid-cols-3">
          {experiences.map((exp, i) => (
            <Reveal key={exp.id} delay={i * 0.08}>
              <li className="list-none">
                <Figure
                  image={exp.images[0]}
                  sizes="(max-width: 768px) 100vw, 30vw"
                  className="border border-rule"
                />
                <h3 className="mt-5 font-display text-2xl leading-tight text-canopy">
                  {exp.title}
                </h3>
                <p className="mt-3 max-w-[44ch] leading-relaxed text-ink/75">
                  {exp.description}
                </p>
                {exp.bookable && exp.schedule ? (
                  <details className="mt-4">
                    <summary className="cursor-pointer list-none border-b border-moss/40 pb-0.5 font-sans text-sm text-moss transition-colors hover:border-accent hover:text-accent [&::-webkit-details-marker]:hidden">
                      Reservar
                    </summary>
                    <BookingForm experience={exp} schedule={exp.schedule} />
                  </details>
                ) : (
                  <a
                    href={CONTACT.whatsapp}
                    className="mt-4 inline-block border-b border-moss/40 pb-0.5 font-sans text-sm text-moss transition-colors hover:border-accent hover:text-accent"
                  >
                    Preguntar por cupos
                  </a>
                )}
              </li>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="border-t border-rule bg-paper/50">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
          <Stratum
            band="Mostrador"
            title="Los métodos, sin misterio."
            lead="Un método no es un capricho: cada uno extrae cosas distintas del mismo grano. Esto es lo que hace cada uno y cuándo lo escogemos."
          />

          <ul className="divide-y divide-rule border-y border-rule">
            {methods.map((method) => (
              <li key={method.id} className="grid gap-6 py-9 md:grid-cols-[14rem_1fr] md:gap-12">
                <div>
                  <h3 className="font-display text-2xl leading-tight text-canopy">
                    {method.name}
                  </h3>
                  <p className="mt-2 max-w-[30ch] font-sans text-sm leading-relaxed text-ink/60">
                    {method.origin}
                  </p>
                </div>
                <div className="max-w-[62ch]">
                  <p className="font-sans text-sm leading-relaxed text-moss">
                    {method.usedFor}
                  </p>
                  <p className="mt-3 leading-relaxed text-ink/85">{method.description}</p>
                  {method.bestFor && method.bestFor.length > 0 && (
                    <dl className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-sans text-sm">
                      <dt className="text-moss">Resalta</dt>
                      <dd className="text-ink/70">{method.bestFor.join(", ")}</dd>
                    </dl>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
