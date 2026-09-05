/**
 * Follaje del hero: tres capas de hojas a distinta profundidad, cada una con su propia
 * deriva. Es CSS puro y Server Component — no llega un solo byte de JS al navegador por
 * esta animación, y `prefers-reduced-motion` la congela desde globals.css.
 */

const LEAF =
  "M0 0C-14 10-20 28-16 52 2 46 14 30 17 12 11 20 6 30 2 44 2 28 1 12 0 0Z";

const LAYERS = [
  { id: "canopy-far", scale: 0.9, opacity: 0.16, duration: "68s", tint: "#7fa06b" },
  { id: "canopy-mid", scale: 1.4, opacity: 0.13, duration: "47s", tint: "#4a6b3c" },
  { id: "canopy-near", scale: 2.3, opacity: 0.2, duration: "34s", tint: "#16291d" },
] as const;

export default function CanopyBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* luz que se cuela entre las hojas */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 85% at 72% -10%, rgba(224,160,90,0.30), rgba(224,160,90,0) 58%)",
        }}
      />

      {LAYERS.map((layer, i) => (
        <svg
          key={layer.id}
          className="absolute -inset-[12%] h-[124%] w-[124%]"
          style={{
            opacity: layer.opacity,
            animation: `canopy-drift ${layer.duration} ease-in-out ${i * -6}s infinite alternate`,
          }}
        >
          <defs>
            <pattern
              id={layer.id}
              width={120 * layer.scale}
              height={120 * layer.scale}
              patternUnits="userSpaceOnUse"
              patternTransform={`rotate(${18 + i * 27}) scale(${layer.scale})`}
            >
              <path d={LEAF} fill={layer.tint} transform="translate(30 26)" />
              <path d={LEAF} fill={layer.tint} transform="translate(86 74) rotate(142)" />
              <path d={LEAF} fill={layer.tint} transform="translate(18 96) rotate(71)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${layer.id})`} />
        </svg>
      ))}

      {/* la sombra del sotobosque, para que el texto se lea siempre */}
      <div className="absolute inset-0 bg-gradient-to-b from-canopy/45 via-canopy/25 to-understory" />
    </div>
  );
}
