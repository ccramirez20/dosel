import Image from "next/image";
import Link from "next/link";

import CanopyBackdrop from "./CanopyBackdrop";

/**
 * Comparación temporal de fondo, para decidir hoy entre el follaje CSS actual
 * y una de las dos fotos de selva que llegaron. Cuando el usuario elija, esto
 * se borra y queda solo la opción ganadora — no es un flag permanente.
 */
const HERO_BACKGROUND: "css" | "opaco" | "natural" = "opaco";

function PhotoBackdrop({ src }: { src: string }) {
  return (
    <div aria-hidden className="absolute inset-0">
      <Image src={src} alt="" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-canopy/45 via-canopy/25 to-understory" />
    </div>
  );
}

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-canopy text-cream">
      {HERO_BACKGROUND === "css" && <CanopyBackdrop />}
      {HERO_BACKGROUND === "opaco" && <PhotoBackdrop src="/images/home/canopy-opaco.jpg" />}
      {HERO_BACKGROUND === "natural" && <PhotoBackdrop src="/images/home/canopy-natural.jpg" />}

      <div className="relative mx-auto flex min-h-[86svh] max-w-6xl flex-col justify-end px-5 pb-16 pt-28 md:px-8 md:pb-24 md:pt-36">
        <div className="max-w-3xl">
          <h1 className="font-display text-5xl leading-[0.94] tracking-[-0.02em]">
            Hay cafés que crecen mejor a la sombra.
          </h1>
          <p className="mt-8 max-w-[54ch] text-lg leading-relaxed text-cream/80">
            Dosel es un café con coordenadas. Cada grano viene de un lugar concreto: una
            finca, una región, una altura y una historia. Aquí te contamos cuál es la de
            cada café.
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
      </div>
    </section>
  );
}
