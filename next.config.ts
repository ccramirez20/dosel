import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Export estático: `next build` deja el sitio terminado en `out/`, que es lo que sirve
   * Cloudflare Pages. Encaja porque el sitio ya no tenía nada de servidor — ni API routes,
   * ni middleware, ni server actions, ni ISR. Si alguna vez hace falta uno de esos (la
   * pasarela de pago de la Fase 2, por ejemplo), esta línea es lo primero que hay que
   * revisar.
   */
  output: "export",

  images: {
    /**
     * El optimizador de imágenes de Next necesita un servidor. Hoy no se nota —todas las
     * imágenes son placeholders `.svg` que `Figure` dibuja a mano y ni siquiera monta
     * `next/image`—, pero en cuanto lleguen las fotos reales el build fallaría sin esto.
     * Cloudflare tiene su propio redimensionado si más adelante hace falta.
     */
    unoptimized: true,
  },
};

export default nextConfig;
