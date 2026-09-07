import Link from "next/link";

import Stratum from "@/components/ui/Stratum";

const SALIDAS = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Cafés y su origen" },
  { href: "/experiencias", label: "Experiencias y métodos" },
  { href: "/quienes-somos", label: "Quiénes somos" },
] as const;

export default function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
      <Stratum
        band="404"
        title="Esta página no existe."
        lead="Pasa: un enlace viejo, una dirección mal copiada. Lo que sí existe está acá abajo."
      />
      <ul className="flex flex-wrap gap-x-8 gap-y-3 font-sans text-sm">
        {SALIDAS.map((s) => (
          <li key={s.href}>
            <Link
              href={s.href}
              className="border-b border-moss/40 pb-0.5 text-moss transition-colors hover:border-accent hover:text-accent"
            >
              {s.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
