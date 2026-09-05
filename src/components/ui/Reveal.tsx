import type { ReactNode } from "react";

/**
 * Aparición al entrar en viewport, con `animation-timeline: view()`.
 *
 * Es CSS puro y Server Component a propósito: la versión con Motion producía un
 * desajuste de hidratación (el servidor no emitía los estilos de `initial` y el cliente
 * sí). Además el contenido tiene que verse sin JS, y así se ve.
 *
 * Navegador sin soporte de scroll timelines: el `@supports` de globals.css no aplica nada
 * y el contenido simplemente aparece visible. `prefers-reduced-motion` lo desactiva igual.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  /** escalona la entrada, en segundos; se traduce a un desfase del rango de scroll */
  delay?: number;
  className?: string;
}) {
  return (
    <div
      className={`reveal ${className ?? ""}`}
      style={delay ? ({ "--reveal-delay": `${delay * 40}%` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
