/**
 * Configuración del sitio: dominio y datos del local. Vive en `lib/` y no en un componente
 * porque `lib/booking.ts` y `app/sitemap.ts` la necesitan, y el test de booking corre con
 * `node --experimental-strip-types`, que no parsea JSX.
 */

/** Dominio de producción. Lo usan `metadataBase`, el sitemap y robots.txt. */
export const SITE_URL = "https://dosel.co";

// TODO(marca): número y dirección reales cuando el dueño confirme.
export const CONTACT = {
  whatsapp: "https://wa.me/570000000000",
  instagram: "https://instagram.com/dosel.cafe",
  address: "Por confirmar",
  hours: "Lunes a viernes, 2:00 a 6:00 p. m.",
} as const;
