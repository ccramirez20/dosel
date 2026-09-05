import Link from "next/link";

import Hero from "@/components/home/Hero";
import Reveal from "@/components/ui/Reveal";
import Stratum from "@/components/ui/Stratum";
import { CONTACT } from "@/components/layout/Footer";
import { getCafes, getRegions } from "@/lib/data";

const SECTIONS = [
  {
    href: "/productos",
    title: "Cafés de origen",
    body: "Orígenes que rotan con la cosecha. Cada uno con su finca, su altura y su departamento marcado en el mapa.",
    cta: "Ver los cafés",
  },
  {
    href: "/experiencias",
    title: "Talleres y métodos",
    body: "Galletas, pintura de esculturas y catas guiadas. Y una explicación honesta de por qué el mismo grano sabe distinto en V60 que en prensa.",
    cta: "Ver experiencias",
  },
  {
    href: "/quienes-somos",
    title: "Bosque y café",
    body: "El dosel es la capa donde el bosque atrapa la luz. También es donde crece el café que vale la pena. De ahí el nombre.",
    cta: "Conocer Dosel",
  },
] as const;

export default async function Home() {
  const [cafes, regions] = await Promise.all([getCafes(), getRegions()]);
  const origins = [...new Set(cafes.map((c) => c.origin.regionId))]
    .map((id) => regions.find((r) => r.id === id)?.name)
    .filter(Boolean);

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
        <Stratum
          band="30 m, dosel"
          title="Un café que también explica de dónde viene el café."
          lead="Servimos tres cosas: café de origen que podemos rastrear hasta la finca, panadería hecha el mismo día, y talleres para gente con curiosidad. Nada de eso es decorativo."
        />

        <div className="grid gap-px bg-rule md:grid-cols-3">
          {SECTIONS.map((s, i) => (
            <Reveal key={s.href} delay={i * 0.08} className="bg-background">
              <Link href={s.href} className="group block h-full px-0 py-8 md:px-6">
                <h3 className="font-display text-2xl leading-tight text-canopy">
                  {s.title}
                </h3>
                <p className="mt-4 max-w-[42ch] leading-relaxed text-ink/75">{s.body}</p>
                <span className="mt-5 inline-block border-b border-moss/40 pb-0.5 font-sans text-sm text-moss transition-colors group-hover:border-accent group-hover:text-accent">
                  {s.cta}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-canopy text-cream">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <Stratum
            tone="dark"
            band="1 600 – 2 000 m"
            title="Cada taza tiene una dirección exacta."
            lead="No decimos «café colombiano» y ya. Decimos el municipio, la finca y los metros sobre el nivel del mar, porque a esa altura pasa algo concreto: el grano madura más lento y acumula más azúcar."
          />

          <div className="mt-2 grid gap-10 md:grid-cols-[auto_1fr] md:gap-16">
            <dl className="font-sans text-sm">
              <dt className="text-cream/50">Orígenes en carta</dt>
              <dd className="mt-1 font-display text-4xl tabular-nums leading-none">
                {cafes.length}
              </dd>
              <dt className="mt-8 text-cream/50">Departamentos</dt>
              <dd className="mt-2 max-w-[24ch] leading-relaxed text-cream/85">
                {origins.join(", ")}
              </dd>
            </dl>

            <div className="self-end">
              <Link
                href="/productos"
                className="inline-block bg-accent px-6 py-3 font-sans text-sm text-canopy transition-colors hover:bg-cream"
              >
                Abrir el mapa de orígenes
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
        <Stratum band="0 m, suelo" title="Dónde estamos" />
        <div className="grid gap-8 font-sans text-base leading-relaxed text-ink/80 md:grid-cols-2">
          <p>
            {CONTACT.hours}
            <span className="mt-1 block text-ink/55">{CONTACT.address}</span>
          </p>
          <p>
            Para reservar un taller o preguntar por un origen, escríbenos por{" "}
            <a
              href={CONTACT.whatsapp}
              className="text-moss underline underline-offset-4 hover:text-accent"
            >
              WhatsApp
            </a>
            . Contestamos en horario de tienda.
          </p>
        </div>
      </section>
    </>
  );
}
