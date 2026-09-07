# Despliegue — Cloudflare Pages

Paso a paso para publicar el sitio. Se hace **una sola vez**; después cada `git push` a `main`
vuelve a publicar solo.

---

## Por qué Cloudflare y no Vercel

El plan gratis de Vercel (Hobby) **prohíbe el uso comercial**, y sus guías de uso justo listan
literalmente «*Advertising the sale of a product or service*» como ejemplo. Un sitio de
cafetería que muestra carta y talleres cae ahí de lleno: no es un caso de frontera. Vercel
exige Pro, 20 USD al mes por usuario.

Cloudflare Pages en su plan gratis **sí permite uso comercial**, con sitios y ancho de banda
ilimitados y 500 despliegues al mes. Como el sitio es 100 % estático, encaja sin cambiar nada
de la arquitectura.

> Cuando llegue la Fase 2 (pagos en línea) hará falta código de servidor para hablar con la
> pasarela. Eso saldrá de Cloudflare Pages Functions o de otro lado, y se decide entonces.

---

## Antes de empezar

Ya está hecho en el repo, no hay que tocarlo:

- `next.config.ts` tiene `output: "export"`, así que `pnpm build` deja el sitio terminado en
  la carpeta `out/`.
- `sitemap.ts` y `robots.ts` están marcados como estáticos.
- `out/` está en `.gitignore`: Cloudflare lo construye, no se sube a mano.

Necesitas: una cuenta de Cloudflare (gratis, con correo) y acceso al repo
`ccramirez20/dosel` en GitHub.

---

## Los pasos

**1. Crear la cuenta.** Entra a `dash.cloudflare.com` y regístrate. No pide tarjeta.

**2. Crear el proyecto.** En el menú lateral: **Workers & Pages** → **Create** → pestaña
**Pages** → **Connect to Git**.

**3. Autorizar GitHub.** Te va a pedir permiso. Puedes darle acceso **solo al repositorio
`dosel`** en vez de a todos — es lo recomendable.

**4. Elegir el repo.** Selecciona `ccramirez20/dosel` y dale **Begin setup**.

**5. La configuración de compilación.** Esta es la parte que importa. Ponlo exactamente así:

| Campo | Valor |
|---|---|
| Project name | `dosel` (define la URL: `dosel.pages.dev`) |
| Production branch | `main` |
| Framework preset | **None** |
| Build command | `pnpm install && pnpm build` |
| Build output directory | `out` |

> **No elijas el preset «Next.js».** Ese preset asume un sitio con servidor y usa otro
> sistema de compilación. Este sitio es un export estático: `None` + `out` es lo correcto.

**6. Variable de entorno.** Abre **Environment variables** y agrega una:

| Nombre | Valor |
|---|---|
| `NODE_VERSION` | `22` |

Sin esto Cloudflare usa una versión vieja de Node y el build falla.

**7. Guardar y desplegar.** Dale **Save and Deploy**. Tarda 2–3 minutos. Al terminar te da la
URL: **`https://dosel.pages.dev`**.

**8. Comprobar** antes de pasarle el link a nadie:

- Que abran las cinco páginas: inicio, quiénes somos, experiencias, productos, y una ficha de
  café.
- Que el mapa de `/productos` responda al hacer clic en un departamento.
- Que una dirección inventada (`/loquesea`) muestre la página de «Esta página no existe».

---

## De ahí en adelante

Cada `git push` a `main` dispara un despliegue nuevo y actualiza `dosel.pages.dev` solo. Cada
rama distinta de `main` genera una URL de vista previa propia, útil para probar cambios sin
tocar lo que ya está publicado.

---

## Cuando compren el dominio

En el proyecto: **Custom domains** → **Set up a custom domain**.

Si el dominio se compra **en Cloudflare**, se configura solo. Si se compra en otro lado
(GoDaddy, Namecheap), hay que apuntar los DNS a Cloudflare — la propia pantalla te dice qué
registros poner.

Después de conectar el dominio real hay que cambiar `SITE_URL` en `src/lib/site.ts`, que hoy
dice `https://dosel.co`. De ahí salen el `sitemap.xml` y el `robots.txt`, así que si no se
cambia, le estarás diciendo a Google la dirección equivocada.

---

## Antes de que esto lo vea el público

Lo del link provisional para revisión no importa, pero para la versión definitiva:

1. **El número de WhatsApp.** Hoy es `wa.me/570000000000` en `src/lib/site.ts`. El formulario
   de reserva arma el mensaje pero no le llega a nadie.
2. **La dirección del local**, hoy «Por confirmar».
3. **Los datos reales de los 6 cafés** y las descripciones de panadería.
4. **Los días y horas reales de los talleres.**
