import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// Con `output: "export"` Next exige declarar explícitamente que esta ruta es estática:
// sin esto el build falla al recolectar la página.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", SITE_URL).href,
  };
}
