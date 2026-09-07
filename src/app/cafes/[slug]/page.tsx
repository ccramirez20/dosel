import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Figure from "@/components/ui/Figure";
import Stratum from "@/components/ui/Stratum";
import { CONTACT } from "@/lib/site";
import { getCafe, getCafes, getMethods, getRegions } from "@/lib/data";

export async function generateStaticParams() {
  return (await getCafes()).map((cafe) => ({ slug: cafe.slug }));
}

export async function generateMetadata({ params }: PageProps<"/cafes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cafe = await getCafe(slug);
  if (!cafe) return {};
  return {
    title: cafe.name,
    description: `${cafe.name}: café de ${cafe.origin.municipio}. ${cafe.profile.description.slice(0, 140)}`,
  };
}

export default async function CafeDetailPage({ params }: PageProps<"/cafes/[slug]">) {
  const { slug } = await params;
  const [cafe, regions, methods] = await Promise.all([
    getCafe(slug),
    getRegions(),
    getMethods(),
  ]);
  if (!cafe) notFound();

  const region = regions.find((r) => r.id === cafe.origin.regionId);
  const recommended = methods.filter((m) => cafe.recommendedMethods.includes(m.id));

  const facts = [
    region && { term: "Departamento", value: region.name },
    { term: "Municipio", value: cafe.origin.municipio },
    cafe.origin.finca && { term: "Finca", value: cafe.origin.finca },
    cafe.origin.altitudeMasl && {
      term: "Altura",
      value: `${cafe.origin.altitudeMasl.toLocaleString("es-CO")} msnm`,
    },
    cafe.variety && { term: "Variedad", value: cafe.variety, taxon: true },
    cafe.process && { term: "Proceso", value: cafe.process },
    cafe.roastLevel && { term: "Tueste", value: cafe.roastLevel },
    cafe.profile.body && { term: "Cuerpo", value: cafe.profile.body },
    cafe.profile.acidity && { term: "Acidez", value: cafe.profile.acidity },
  ].filter(Boolean) as { term: string; value: string; taxon?: boolean }[];

  return (
    <article className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
      <p className="font-sans text-sm">
        <Link
          href="/productos"
          className="text-moss underline underline-offset-4 hover:text-accent"
        >
          Volver a los cafés
        </Link>
      </p>

      <header className="mt-8 border-b border-rule pb-10">
        <h1 className="max-w-[16ch] font-display text-4xl leading-[1.02] tracking-tight text-canopy">
          {cafe.name}
        </h1>
        <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-ink/75">
          {cafe.profile.description}
        </p>
      </header>

      <div className="grid gap-12 pt-12 md:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] md:gap-16">
        <div>
          <Figure
            image={cafe.images[0]}
            sizes="(max-width: 768px) 100vw, 20rem"
            priority
            className="border border-rule"
          />
          <dl className="mt-8 divide-y divide-rule border-y border-rule font-sans text-sm">
            {facts.map((fact) => (
              <div key={fact.term} className="flex gap-4 py-2.5">
                <dt className="w-28 shrink-0 text-moss">{fact.term}</dt>
                <dd className={`text-ink/85 ${fact.taxon ? "taxon" : ""}`}>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <section>
            <Stratum band="En la taza" title="Qué vas a sentir" />
            <dl className="grid gap-6 sm:grid-cols-2">
              <div>
                <dt className="font-sans text-sm text-moss">Qué oler</dt>
                <dd className="mt-2 text-lg leading-relaxed text-ink/85">
                  {cafe.profile.aromas.join(", ")}
                </dd>
              </div>
              <div>
                <dt className="font-sans text-sm text-moss">Qué probar</dt>
                <dd className="mt-2 text-lg leading-relaxed text-ink/85">
                  {cafe.profile.tasting.join(", ")}
                </dd>
              </div>
            </dl>
          </section>

          {cafe.story && (
            <section className="mt-14">
              <Stratum band="Origen" title="De dónde viene" />
              <p className="max-w-[62ch] text-lg leading-relaxed text-ink/80">
                {cafe.story}
              </p>
            </section>
          )}

          {recommended.length > 0 && (
            <section className="mt-14">
              <Stratum band="Preparación" title="Cómo lo preparamos" />
              <ul className="divide-y divide-rule border-y border-rule">
                {recommended.map((method) => (
                  <li key={method.id} className="py-5">
                    <h3 className="font-display text-xl leading-tight text-canopy">
                      {method.name}
                    </h3>
                    <p className="mt-2 max-w-[62ch] leading-relaxed text-ink/75">
                      {method.usedFor}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-sans text-sm">
                <Link
                  href="/experiencias"
                  className="text-moss underline underline-offset-4 hover:text-accent"
                >
                  Ver todos los métodos
                </Link>
              </p>
            </section>
          )}

          <section className="mt-14 border-t border-rule pt-8">
            <p className="max-w-[52ch] leading-relaxed text-ink/75">
              ¿Lo quieres probar o llevar? Pregúntanos por disponibilidad de{" "}
              {cafe.name} — te decimos cómo va la cosecha antes de que vengas.
            </p>
            <a
              href={CONTACT.whatsapp}
              className="mt-5 inline-block bg-accent px-6 py-3 font-sans text-sm text-canopy transition-colors hover:bg-canopy hover:text-cream"
            >
              Preguntar por este café
            </a>
          </section>
        </div>
      </div>
    </article>
  );
}
