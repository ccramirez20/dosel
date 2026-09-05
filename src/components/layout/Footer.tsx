import Link from "next/link";

// TODO(marca): reemplazar por los datos reales cuando el dueño confirme canal y dirección.
export const CONTACT = {
  whatsapp: "https://wa.me/570000000000",
  instagram: "https://instagram.com/dosel.cafe",
  address: "Por confirmar",
  hours: "Martes a domingo, 8:00 a 19:00",
} as const;

export default function Footer() {
  return (
    <footer className="border-t border-canopy/15 bg-canopy text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3 md:px-8">
        <div>
          <p className="font-display text-2xl leading-tight">Dosel</p>
          <p className="mt-3 max-w-xs font-sans text-sm leading-relaxed text-cream/70">
            Un café que también es una excusa para hablar de bosques, aves y de dónde
            viene lo que estás tomando.
          </p>
        </div>

        <div className="font-sans text-sm leading-relaxed text-cream/80">
          <p>{CONTACT.hours}</p>
          <p className="mt-1 text-cream/60">{CONTACT.address}</p>
          <p className="mt-4 flex gap-5">
            <a className="underline underline-offset-4 hover:text-accent" href={CONTACT.whatsapp}>
              WhatsApp
            </a>
            <a className="underline underline-offset-4 hover:text-accent" href={CONTACT.instagram}>
              Instagram
            </a>
          </p>
        </div>

        <nav aria-label="Pie de página" className="font-sans text-sm">
          <ul className="space-y-2 text-cream/80">
            <li>
              <Link className="hover:text-accent" href="/quienes-somos">
                Quiénes somos
              </Link>
            </li>
            <li>
              <Link className="hover:text-accent" href="/experiencias">
                Experiencias
              </Link>
            </li>
            <li>
              <Link className="hover:text-accent" href="/productos">
                Productos y cafés
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-cream/10">
        <p className="mx-auto max-w-6xl px-5 py-5 font-sans text-xs leading-relaxed text-cream/45 md:px-8">
          © {new Date().getFullYear()} Dosel. Mapa de departamentos:{" "}
          <a
            className="underline underline-offset-2 hover:text-cream/70"
            href="https://www.geoboundaries.org/"
            rel="noreferrer"
          >
            geoBoundaries
          </a>{" "}
          , con datos de{" "}
          <a
            className="underline underline-offset-2 hover:text-cream/70"
            href="https://www.openstreetmap.org/copyright"
            rel="noreferrer"
          >
            OpenStreetMap
          </a>
          , licencia{" "}
          <a
            className="underline underline-offset-2 hover:text-cream/70"
            href="https://opendatacommons.org/licenses/odbl/1-0/"
            rel="noreferrer"
          >
            ODbL 1.0
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
