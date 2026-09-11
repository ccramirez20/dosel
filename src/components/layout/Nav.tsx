"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";

const LINKS = [
  { href: "/quienes-somos", label: "Quiénes somos" },
  { href: "/experiencias", label: "Experiencias" },
  { href: "/productos", label: "Productos" },
] as const;

export default function Nav() {
  const pathname = usePathname();
  const menu = useRef<HTMLDetailsElement>(null);

  return (
    <header className="sticky top-0 z-40 border-b border-canopy/10 bg-cream/85 backdrop-blur-sm">
      <nav
        aria-label="Principal"
        className="mx-auto flex max-w-6xl items-baseline justify-between gap-6 px-5 py-4 md:px-8"
      >
        <Link href="/" className="flex shrink-0 items-center">
          <span className="relative -my-2 block h-20 aspect-[530/255]">
            <Image
              src="/images/marca/logo-transparente-crop.png"
              alt="Dosel café y método"
              fill
              priority
              className="object-contain"
            />
          </span>
        </Link>

        <ul className="hidden items-baseline gap-7 font-sans text-sm md:flex">
          {LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`border-b pb-0.5 transition-colors ${
                    active
                      ? "border-accent text-canopy"
                      : "border-transparent text-ink/70 hover:border-fern hover:text-canopy"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Disclosure nativo: sin librería de drawer, accesible por teclado de fábrica.
            El onClick solo lo cierra al navegar, porque el layout sobrevive a la ruta. */}
        <details
          ref={menu}
          className="md:hidden"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a") && menu.current) {
              menu.current.open = false;
            }
          }}
        >
          <summary className="cursor-pointer list-none font-sans text-sm text-canopy [&::-webkit-details-marker]:hidden">
            Menú
          </summary>
          <ul className="absolute left-0 right-0 top-full border-b border-canopy/10 bg-cream px-5 py-3 font-sans text-base shadow-sm">
            {LINKS.map((link) => (
              <li key={link.href} className="border-t border-rule/60 first:border-t-0">
                <Link href={link.href} className="block py-3 text-canopy">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </nav>
    </header>
  );
}
