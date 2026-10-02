/**
 * Estratos del bosque que estructuran la home. El sitio se lee de arriba abajo como se lee
 * un bosque: la copa primero, el suelo al final. "Emergente" quedó fuera a propósito — el
 * nombre del café es el dosel y el eje empieza ahí.
 *
 * `height` en metros. `light` es el % de la luz que recibe el dosel que llega a cada capa,
 * con datos de bosque tropical húmedo maduro en La Selva (Costa Rica), el sitio de referencia
 * clásico para esto:
 *
 * - Suelo, 2 %: la transmitancia difusa media sube de 2 % a 1 m a 10 % a 9 m, con media de
 *   1,8 % en bosque maduro (Montgomery & Chazdon 2001, Ecology 82: 2707–2718). En el
 *   sotobosque bajo llega 1–2 % de la PAR diaria de un claro (Chazdon & Fetcher 1984,
 *   Journal of Ecology 72: 553–564).
 * - Sotobosque, 10 %: el 10 % a 9 m del mismo perfil de Montgomery & Chazdon.
 * - Dosel, 100 %: la copa recibe la luz plena; es la referencia de los otros dos.
 *
 * Son medias de un sitio: en un claro o bajo dosel ralo el sotobosque recibe mucho más.
 */

export const STRATA = [
  { id: "dosel", name: "Dosel", height: 30, light: 100 },
  { id: "sotobosque", name: "Sotobosque", height: 10, light: 10 },
  { id: "suelo", name: "Suelo", height: 0, light: 2 },
] as const;

export type Reading = { id: string; name: string; height: number; light: number };

/**
 * Lectura continua del fotómetro en el punto `y` de la página. `anchors[i]` es la `y` donde
 * la lectura vale exactamente la del estrato i (crecientes). Entre dos anclas la altura se
 * interpola en línea recta y la luz en escala logarítmica: la luz cae exponencialmente al
 * atravesar el follaje (Beer–Lambert), así que en lineal el número se desplomaría al
 * principio del tramo y luego se quedaría quieto.
 */
export function readingAt(y: number, anchors: number[]): Reading {
  const last = STRATA.length - 1;
  if (y <= anchors[0]) return { ...STRATA[0] };
  if (y >= anchors[last]) return { ...STRATA[last] };

  const i = anchors.findIndex((a, k) => y >= a && y < anchors[k + 1]);
  const t = (y - anchors[i]) / (anchors[i + 1] - anchors[i]);
  const [a, b] = [STRATA[i], STRATA[i + 1]];
  // El estrato que manda es el ancla más cercana: cambia a mitad del tramo.
  const near = t < 0.5 ? a : b;
  return {
    id: near.id,
    name: near.name,
    height: a.height + (b.height - a.height) * t,
    light: Math.exp(Math.log(a.light) + (Math.log(b.light) - Math.log(a.light)) * t),
  };
}
