import type { MetadataRoute } from "next";

import { EN_BORRADOR, SITE_URL } from "@/lib/site";

// Con `output: "export"` Next exige declarar explícitamente que esta ruta es estática:
// sin esto el build falla al recolectar la página.
export const dynamic = "force-static";

/**
 * Mientras el sitio esté en su dominio provisional queda cerrado a los buscadores. No hay
 * nada que tocar acá el día del lanzamiento: `EN_BORRADOR` se deriva de `SITE_URL`, así que
 * cambiar el dominio en `lib/site.ts` abre esto solo.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: EN_BORRADOR
      ? { userAgent: "*", disallow: "/" }
      : { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", SITE_URL).href,
  };
}
