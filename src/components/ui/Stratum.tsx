import type { ReactNode } from "react";

/**
 * Encabezado de sección con banda de estrato. Un bosque se lee por capas —emergente,
 * dosel, sotobosque, suelo— y el café también se mide por altura, así que la banda lleva
 * información real (la franja altitudinal del contenido), no es un adorno numérico.
 */
export default function Stratum({
  band,
  title,
  lead,
  children,
  tone = "light",
}: {
  /** franja altitudinal o capa del bosque, p.ej. "1 600 – 2 000 m" */
  band: string;
  title: string;
  lead?: string;
  children?: ReactNode;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <header className="mb-10">
      <div
        className={`flex items-baseline gap-4 border-b pb-2 ${
          dark ? "border-cream/25" : "border-rule"
        }`}
      >
        <span
          className={`shrink-0 font-sans text-xs tabular-nums ${
            dark ? "text-cream/55" : "text-moss"
          }`}
        >
          {band}
        </span>
        <span className={`h-px flex-1 ${dark ? "bg-cream/15" : "bg-rule"}`} aria-hidden />
      </div>
      <h2
        className={`mt-5 max-w-3xl font-display text-3xl leading-[1.1] tracking-tight ${
          dark ? "text-cream" : "text-canopy"
        }`}
      >
        {title}
      </h2>
      {lead && (
        <div
          className={`mt-4 max-w-[62ch] space-y-3 text-lg leading-relaxed ${
            dark ? "text-cream/75" : "text-ink/75"
          }`}
        >
          {lead.split("\n\n").map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      )}
      {children}
    </header>
  );
}
