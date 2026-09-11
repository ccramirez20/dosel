/**
 * Configuración del sitio: dominio y datos del local. Vive en `lib/` y no en un componente
 * porque `lib/booking.ts` y `app/sitemap.ts` la necesitan, y el test de booking corre con
 * `node --experimental-strip-types`, que no parsea JSX.
 */

/**
 * El dominio provisional, sin registrar. Antes acá decía `dosel.co`, que resultó estar
 * registrado y activo por otra empresa ("Dosel Studio"): el sitemap en producción terminaba
 * listando diez URLs bajo un dominio ajeno.
 */
const DOMINIO_PROVISIONAL = "https://doselcafeymetodo.com";

/**
 * Dominio de producción. Lo usan `metadataBase`, el sitemap y robots.txt.
 *
 * ESTA ES LA ÚNICA LÍNEA QUE HAY QUE CAMBIAR EL DÍA QUE COMPREN EL DOMINIO. El sitio se
 * abre solo a los buscadores en cuanto deje de ser el provisional — ver `EN_BORRADOR`.
 */
export const SITE_URL = DOMINIO_PROVISIONAL;

/**
 * Un sitio que todavía vive en su dominio provisional es un borrador, y un borrador no se
 * indexa: hoy tiene textos de relleno, cafés inventados y un WhatsApp falso, y si Google lo
 * mete en su índice después le compite al sitio real por el mismo nombre.
 *
 * Se deriva de `SITE_URL` a propósito, en vez de ser un interruptor aparte: dos cosas que
 * hay que acordarse de cambiar el mismo día son dos oportunidades de olvidar una. Así solo
 * hay una, y `robots.txt` se abre solo detrás.
 */
export const esBorrador = (url: string) => url === DOMINIO_PROVISIONAL;
export const EN_BORRADOR = esBorrador(SITE_URL);

// TODO(marca): número y dirección reales cuando el dueño confirme.
export const CONTACT = {
  whatsapp: "https://wa.me/573202250098",
  instagram: "https://instagram.com/dosel_cafe71C",
  address: "Cra. 71c #98-78 Casa 71C - Local 1, Bogotá",
  hours: "Lunes a jueves, 2:00 a 7:00 p. m.",
} as const;
