import type { Metadata } from "next";
import Link from "next/link";

import Figure from "@/components/ui/Figure";
import Reveal from "@/components/ui/Reveal";
import Stratum from "@/components/ui/Stratum";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Dosel es un café montado por un biólogo. El nombre viene de la capa alta del bosque, y esa idea ordena todo lo demás: la carta, los talleres y lo que contamos.",
};

/** Las capas del bosque, de arriba abajo. Ordenan la narrativa de la página. */
const LAYERS = [
  {
    band: "45 m, emergente",
    title: "Los árboles que se asoman",
    body: "Por encima del dosel sobresalen unos pocos árboles gigantes. Reciben todo el sol y todo el viento. En un café eso serían los orígenes raros: los lotes pequeños que aparecen una cosecha y no vuelven. Cuando llega uno, lo anunciamos y dura lo que dure.",
    image: {
      src: "/images/quienes-somos/emergente.svg",
      alt: "Copa de un árbol emergente sobresaliendo del bosque",
      width: 1200,
      height: 800,
    },
  },
  {
    band: "30 m, dosel",
    title: "Aquí es donde vivimos",
    body: "El dosel es la capa continua de copas donde el bosque atrapa casi toda la luz. Es la parte más viva y la más ruidosa: allí están las aves, las bromelias y la mayoría de los insectos. También es la capa que le da sombra al café que crece abajo. Nos pareció el nombre correcto para un lugar que quiere ser eso: la capa donde pasan las cosas.",
    image: {
      src: "/images/quienes-somos/dosel.svg",
      alt: "Capa continua de copas de árboles vista desde arriba",
      width: 1200,
      height: 800,
    },
  },
  {
    band: "10 m, sotobosque",
    title: "Donde crece el café",
    body: "El café es un arbusto de sotobosque: evolucionó bajo sombra y ahí es donde mejor se comporta. Un cafetal con árboles encima madura más lento, resiste mejor la sequía y sostiene aves que un monocultivo a pleno sol no sostiene. Compramos, cuando podemos, a fincas que lo hacen así. No siempre se puede, y cuando no, lo decimos.",
    image: {
      src: "/images/quienes-somos/sotobosque.svg",
      alt: "Arbustos de café creciendo bajo la sombra de árboles altos",
      width: 1200,
      height: 800,
    },
  },
  {
    band: "0 m, suelo",
    title: "Lo que queda",
    body: "En el suelo del bosque casi no entra luz y todo se descompone rápido. Es la parte menos vistosa y la que sostiene el resto. En la tienda es la barra, el horno y la gente que atiende. Sin eso lo demás es un discurso.",
    image: {
      src: "/images/quienes-somos/suelo.svg",
      alt: "Suelo del bosque cubierto de hojarasca",
      width: 1200,
      height: 800,
    },
  },
] as const;

export default function QuienesSomosPage() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-16 md:px-8 md:pb-20 md:pt-24">
          <p className="max-w-[26ch] font-display text-4xl leading-[1.05] tracking-tight text-canopy">
            Un bosque no es una masa verde. Tiene pisos, y cada uno hace algo distinto.
          </p>
          <p className="mt-8 max-w-[62ch] text-lg leading-relaxed text-ink/75">
            Dosel lo montó un biólogo, así que la tienda está organizada como se organiza un
            bosque: por capas. Es una manera de contar qué hacemos sin sonar a folleto, y de
            paso una excusa para explicar cómo funciona un ecosistema mientras te tomas algo.
          </p>
        </div>
      </section>

      {LAYERS.map((layer, i) => (
        <section
          key={layer.band}
          className={i % 2 === 1 ? "bg-paper/60" : undefined}
        >
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <div
              className={`grid items-center gap-10 md:grid-cols-2 md:gap-16 ${
                i % 2 === 1 ? "md:[&>figure]:order-2" : ""
              }`}
            >
              <div>
                <Stratum band={layer.band} title={layer.title} />
                <p className="max-w-[60ch] text-lg leading-relaxed text-ink/80">
                  {layer.body}
                </p>
              </div>
              <Reveal>
                <figure>
                  <Figure
                    image={layer.image}
                    sizes="(max-width: 768px) 100vw, 46vw"
                    className="border border-rule"
                  />
                </figure>
              </Reveal>
            </div>
          </div>
        </section>
      ))}

      <section className="bg-canopy text-cream">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
          <p className="max-w-[46ch] font-display text-3xl leading-[1.12]">
            Si algo de esto te dio curiosidad, la carta es el mejor sitio para empezar.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 font-sans text-sm">
            <Link
              href="/productos"
              className="bg-accent px-6 py-3 text-canopy transition-colors hover:bg-cream"
            >
              Ver los cafés
            </Link>
            <Link
              href="/experiencias"
              className="border-b border-cream/40 pb-1 text-cream/85 transition-colors hover:border-accent hover:text-cream"
            >
              Talleres y métodos
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
