import Link from "next/link";

import ForestAxis from "@/components/home/ForestAxis";
import Hero from "@/components/home/Hero";
import Reveal from "@/components/ui/Reveal";
import Stratum from "@/components/ui/Stratum";
import { CONTACT } from "@/lib/site";
import { getCafes, getRegions } from "@/lib/data";

const SECTIONS = [
  {
    href: "/productos",
    title: "Cafés de origen",
    body: "Orígenes que rotan con la cosecha. Cada uno con su finca, su altura y su departamento en el mapa.",
    cta: "Ver los cafés",
  },
  {
    href: "/experiencias",
    title: "Talleres y métodos",
    body: "Galletas, pintura de esculturas y catas guiadas. También hablamos de por qué el mismo grano puede saber tan distinto en V60 y en prensa.",
    cta: "Ver experiencias",
  },
  {
    href: "/quienes-somos",
    title: "Bosque y café",
    body: "El dosel es la parte del bosque donde las copas de los árboles se encuentran con la luz. Abajo queda la sombra, un lugar donde también puede crecer el café. De ahí viene el nombre.",
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
      <ForestAxis />

      <div data-stratum="dosel">
        <Hero />
      </div>

      <section
        data-stratum="dosel"
        className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28"
      >
        <Stratum
          band="30 m, dosel"
          title="Un café que también cuenta la historia de dónde viene."
          lead="Café de origen que podemos rastrear hasta la finca, métodos de preparación y talleres para gente curiosa. Queremos que conozcas lo que hay detrás de cada taza."
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

      <section data-stratum="sotobosque" className="bg-canopy text-cream">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-28">
          <Stratum
            tone="dark"
            band="10 m, sotobosque"
            title="Cada taza tiene una dirección exacta."
            lead="No decimos «café colombiano» y ya. Decimos el municipio, la finca y los metros sobre el nivel del mar. A mayor altura, las temperaturas suelen ser más bajas y el café puede madurar más lentamente, lo que influye en el desarrollo de sus azúcares y sabores. Por eso la altura aparece en cada ficha."
          />

          {/* Los <div> dentro del <dl> son la forma válida de agrupar cada par
              nombre-valor cuando la lista se maqueta en rejilla. */}
          <dl className="mt-2 flex flex-wrap items-start gap-x-14 gap-y-10 font-sans text-sm">
            <div>
              <dt className="text-cream/50">Orígenes en carta</dt>
              <dd className="mt-1 font-display text-4xl tabular-nums leading-none">
                {cafes.length}
              </dd>
            </div>
            <div>
              <dt className="text-cream/50">Departamentos</dt>
              <dd className="mt-2 max-w-[28ch] leading-relaxed text-cream/85">
                {origins.join(", ")}
              </dd>
            </div>
          </dl>

          <Link
            href="/productos"
            className="mt-12 inline-block bg-accent px-6 py-3 font-sans text-sm text-canopy transition-colors hover:bg-cream"
          >
            Abrir el mapa de orígenes
          </Link>
        </div>
      </section>

      <section
        data-stratum="suelo"
        className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24"
      >
        <Stratum band="0 m, suelo" title="Dónde estamos" />
        <div className="grid gap-8 font-sans text-base leading-relaxed text-ink/80 md:grid-cols-2">
          <p>
            {CONTACT.hours}
            <span className="mt-1 block text-ink/55">{CONTACT.address}</span>
          </p>
          <p>
            Los talleres se reservan desde la sección de{" "}
            <Link
              href="/experiencias"
              className="text-moss underline underline-offset-4 hover:text-accent"
            >
              Experiencias
            </Link>
            . Para cualquier otra cosa, escríbenos por{" "}
            <a
              href={CONTACT.whatsapp}
              className="text-moss underline underline-offset-4 hover:text-accent"
            >
              WhatsApp
            </a>
            . Respondemos en horario de tienda.
          </p>
        </div>
      </section>
    </>
  );
}
