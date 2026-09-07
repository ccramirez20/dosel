/**
 * Configuración del sitio: dominio y datos del local. Vive en `lib/` y no en un componente
 * porque `lib/booking.ts` y `app/sitemap.ts` la necesitan, y el test de booking corre con
 * `node --experimental-strip-types`, que no parsea JSX.
 */

/**
 * Dominio de producción. Lo usan `metadataBase`, el sitemap y robots.txt.
 *
 * PROVISIONAL. Antes decía `dosel.co`, que resultó estar registrado y activo por otra
 * empresa ("Dosel Studio"): el sitemap terminaba listando diez URLs bajo un dominio ajeno.
 * Este de ahora está sin registrar, así que no interfiere con nadie. Cámbialo por el
 * dominio real el día que lo compren — y ese mismo día quita el `Disallow` de robots.ts.
 */
export const SITE_URL = "https://doselcafeymetodo.com";

// TODO(marca): número y dirección reales cuando el dueño confirme.
export const CONTACT = {
  whatsapp: "https://wa.me/570000000000",
  instagram: "https://instagram.com/dosel.cafe",
  address: "Por confirmar",
  hours: "Lunes a viernes, 2:00 a 6:00 p. m.",
} as const;
