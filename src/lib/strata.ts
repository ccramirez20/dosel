/**
 * Estratos del bosque que estructuran la home. El sitio se lee de arriba abajo como se lee
 * un bosque: la copa primero, el suelo al final. "Emergente" quedó fuera a propósito — el
 * nombre del café es el dosel y el eje empieza ahí.
 */

export type Tone = "light" | "dark";

export interface StratumMark {
  id: string;
  tone: Tone;
}

export const STRATA = [
  { id: "dosel", name: "Dosel", height: "30 m" },
  { id: "sotobosque", name: "Sotobosque", height: "10 m" },
  { id: "suelo", name: "Suelo", height: "0 m" },
] as const;

/**
 * Cuál de las secciones observadas manda. La banda de detección es angosta (cruza la mitad
 * de la pantalla), así que en un scroll rápido puede no haber ninguna: en ese caso se
 * conserva la anterior en vez de apagar el diagrama.
 */
export function pickActive(
  seen: { id: string; tone: Tone; visible: boolean }[],
  previous: StratumMark,
): StratumMark {
  const active = seen.filter((s) => s.visible).at(-1);
  return active ? { id: active.id, tone: active.tone } : previous;
}
