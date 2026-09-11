import type { Metadata } from "next";
import Link from "next/link";

import Figure from "@/components/ui/Figure";
import Reveal from "@/components/ui/Reveal";
import Stratum from "@/components/ui/Stratum";

export const metadata: Metadata = {
  title: "Quiénes somos",
  description:
    "Dosel tiene alma de biólogo. El nombre viene de la capa alta del bosque, y esa idea ordena todo lo demás: la carta, los talleres y lo que contamos.",
};

/**
 * Las tres capas del bosque, de arriba abajo, y cada una amarrada a una parte del negocio:
 * el dosel es el lugar, el sotobosque son los cafés, el suelo es la barra y quien atiende.
 * "Emergente" salió del vocabulario del sitio; lo que contaba —los lotes que aparecen una
 * cosecha y no vuelven— vive ahora en sotobosque, que es donde se habla de café.
 */
const LAYERS = [
  {
    band: "30 m, dosel",
    title: "El lugar",
    body: "El dosel es la capa continua de copas donde el bosque recibe gran parte de la luz. Es una de sus zonas más activas y ruidosas: allí están las aves, las bromelias y muchos de sus insectos. También es la capa que da sombra a lo que crece abajo.\n\nNos pareció el nombre correcto para una tienda que quiere ser eso: la capa donde pasan las cosas y desde la que se sostiene el resto.",
    image: {
      src: "/images/quienes-somos/dosel.jpg",
      alt: "Capa continua de copas de árboles vista desde arriba",
      width: 1200,
      height: 800,
    },
  },
  {
    band: "10 m, sotobosque",
    title: "Los cafés",
    body: "El café es un arbusto de sotobosque: evolucionó en ambientes de bosque y puede crecer bien bajo sombra. Un cafetal con árboles encima puede madurar más lentamente, ayudar a conservar la humedad y sostener aves y otros organismos que un monocultivo a pleno sol no suele sostener.\n\nCompramos, cuando podemos, a fincas que lo cultivan así. No siempre se puede, y cuando no, lo decimos.\n\nLa carta rota con la cosecha y, de vez en cuando, aparece un lote pequeño que llega una vez y no vuelve. Cuando pasa, lo anunciamos y dura lo que dure.",
    image: {
      src: "/images/quienes-somos/sotobosque.jpg",
      alt: "Arbustos de café creciendo bajo la sombra de árboles altos",
      width: 1200,
      height: 800,
    },
  },
  {
    band: "0 m, suelo",
    title: "La barra",
    body: "En el suelo del bosque llega muy poca luz y ocurre gran parte del trabajo que mantiene vivo al ecosistema. Es una parte poco visible, pero sostiene todo lo que pasa arriba.\n\nEn la tienda es la barra, el horno y la gente que atiende: moler, pesar, servir y responder preguntas. Sin eso, lo demás es discurso.",
    image: {
      src: "/images/quienes-somos/suelo.jpg",
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
            Un bosque no es una masa verde. Tiene capas, y cada una cumple una función
            distinta.
          </p>
          <p className="mt-8 max-w-[62ch] text-lg leading-relaxed text-ink/75">
            Dosel está organizado como un bosque: por capas. Cada una reúne una parte de
            lo que hacemos, desde el café hasta los talleres y las experiencias. Una
            forma de contar lo que hay detrás de la tienda y, de paso, hablar de cómo
            funciona un ecosistema mientras te tomas algo.
          </p>
        </div>
      </section>

      <section className="border-b border-rule bg-paper/40">
        <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
          <blockquote className="max-w-[56ch] font-display text-2xl italic leading-snug text-canopy md:text-3xl">
            El dosel de un bosque es su &ldquo;techo&rdquo; natural, formado por las copas de los
            árboles. Es una parte del bosque llena de vida, donde conviven y se relacionan
            muchas especies.
          </blockquote>
        </div>
      </section>

      {LAYERS.map((layer, i) => (
        <section
          key={layer.band}
          className={i % 2 === 1 ? "bg-paper/60" : undefined}
        >
          <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
            <div
              // El alternado apuntaba a `[&>figure]`, pero el hijo directo es el <div> que
              // envuelve `Reveal`, así que el selector no casaba con nada y la imagen
              // quedaba siempre a la derecha. Se apunta al último hijo, sea cual sea.
              className={`grid items-center gap-10 md:grid-cols-2 md:gap-16 ${
                i % 2 === 1 ? "md:[&>*:last-child]:order-first" : ""
              }`}
            >
              <div>
                <Stratum band={layer.band} title={layer.title} />
                <div className="max-w-[60ch] space-y-4 text-lg leading-relaxed text-ink/80">
                  {layer.body.split("\n\n").map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
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

      <section className="border-t border-rule">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <p className="max-w-[60ch] font-display text-2xl leading-snug text-canopy md:text-3xl">
            En Dosel Café &amp; Método creemos que el aprendizaje también se construye en los
            pequeños momentos.
          </p>
          <p className="mt-6 max-w-[60ch] text-lg leading-relaxed text-ink/80">
            Todos nuestros productos tienen una historia. Los hacemos a mano, con cuidado
            y con una intención clara: llevar un pedacito de Colombia a cada taza y a
            cada mesa.
          </p>
        </div>
      </section>

      <section className="bg-canopy text-cream">
        <div className="mx-auto max-w-6xl px-5 py-20 md:px-8 md:py-24">
          <p className="max-w-[46ch] font-display text-3xl leading-[1.12]">
            Si algo de esto te dio curiosidad, la carta es el mejor sitio para empezar.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 font-sans text-sm">
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
