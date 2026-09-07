import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// Con `output: "export"` Next exige declarar explícitamente que esta ruta es estática:
// sin esto el build falla al recolectar la página.
export const dynamic = "force-static";

/**
 * Mientras el sitio viva en `dosel.pages.dev` está cerrado a los buscadores. Es un borrador:
 * textos de relleno, cafés inventados, fincas que no existen y un WhatsApp falso. Si Google
 * lo indexa, esa versión queda en su índice y después le compite al sitio real por el mismo
 * nombre — y sacar algo del índice cuesta mucho más que no meterlo.
 *
 * PARA ABRIRLO EL DÍA DEL LANZAMIENTO: cambia `disallow` por `allow` aquí abajo, y `SITE_URL`
 * en `src/lib/site.ts` por el dominio real. Las dos cosas van juntas, el mismo día.
 */
const EN_BORRADOR = true;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: EN_BORRADOR
      ? { userAgent: "*", disallow: "/" }
      : { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", SITE_URL).href,
  };
}
