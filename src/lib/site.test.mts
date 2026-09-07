import assert from "node:assert/strict";
import { test } from "node:test";

import { EN_BORRADOR, SITE_URL, esBorrador } from "./site.ts";

/**
 * El guardia del lanzamiento. La regla del sitio es que mientras viva en su dominio
 * provisional no se indexa; el día que se compre el real, `robots.txt` se abre solo. Si
 * alguien rompe ese acoplamiento, el borrador se puede publicar en Google sin que nadie
 * se entere hasta que ya esté indexado.
 */

test("con el dominio provisional el sitio está en borrador", () => {
  assert.equal(esBorrador("https://doselcafeymetodo.com"), true);
});

test("con un dominio real el sitio deja de estar en borrador", () => {
  for (const real of ["https://dosel.com.co", "https://doselcafe.co", "https://dosel.co"]) {
    assert.equal(esBorrador(real), false, `${real} no debería contar como borrador`);
  }
});

test("EN_BORRADOR va siempre atado a SITE_URL, no suelto", () => {
  assert.equal(EN_BORRADOR, esBorrador(SITE_URL));
});

test("SITE_URL es una URL absoluta y sin barra final", () => {
  // El sitemap compone rutas con `new URL(ruta, SITE_URL)`: una barra de más produce
  // URLs con doble barra y una relativa revienta el build.
  const url = new URL(SITE_URL);
  assert.match(url.protocol, /^https?:$/);
  assert.equal(SITE_URL.endsWith("/"), false);
});
