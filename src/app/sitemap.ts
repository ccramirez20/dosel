import type { MetadataRoute } from "next";

import { getCafes } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

// Con `output: "export"` Next exige declarar explícitamente que esta ruta es estática:
// sin esto el build falla al recolectar la página.
export const dynamic = "force-static";

const STATIC_ROUTES = ["/", "/quienes-somos", "/experiencias", "/productos"];

// El sitemap exige URLs absolutas: `metadataBase` no las compone aquí, a diferencia del
// resto de la metadata, así que el dominio va a mano.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cafes = await getCafes();
  const routes = [...STATIC_ROUTES, ...cafes.map((cafe) => `/cafes/${cafe.slug}`)];
  return routes.map((route) => ({ url: new URL(route, SITE_URL).href }));
}
