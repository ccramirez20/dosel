import Image from "next/image";

import type { ImageRef } from "@/types/domain";

const PLACEHOLDER_TINTS = [
  ["#2a4a34", "#7fa06b"],
  ["#3d5a3a", "#c9b48a"],
  ["#5b4230", "#a98b62"],
  ["#22402c", "#e0a06b"],
] as const;

/** Hash estable para que cada hueco tenga siempre el mismo tono entre renders y builds. */
function tintFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PLACEHOLDER_TINTS[h % PLACEHOLDER_TINTS.length];
}

/**
 * Hueco de imagen con la proporción final ya reservada, para que al llegar las fotos no
 * se mueva el layout. Mientras `src` apunte a un .svg se dibuja el marcador; cuando el
 * dueño ponga un .jpg/.webp en public/images/ pasa solo a next/image, sin tocar código
 * ni habilitar `dangerouslyAllowSVG`.
 */
export default function Figure({
  image,
  className = "",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: {
  image: ImageRef;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const ratio = (image.width ?? 4) / (image.height ?? 3);
  const isPlaceholder = image.src.endsWith(".svg");

  if (!isPlaceholder) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: ratio }}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  const [from, to] = tintFor(image.alt);
  return (
    <div
      role="img"
      aria-label={image.alt}
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: ratio, background: `linear-gradient(145deg, ${from}, ${to})` }}
    >
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full opacity-20"
      >
        <path
          d="M50 8C28 26 18 52 22 92 44 84 62 62 66 34 58 46 52 58 46 74 46 50 48 28 50 8Z"
          fill="none"
          stroke="#fbf8f2"
          strokeWidth="1.1"
        />
        <path d="M50 8v84" stroke="#fbf8f2" strokeWidth="0.7" fill="none" />
      </svg>
    </div>
  );
}
