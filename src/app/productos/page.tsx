import type { Metadata } from "next";
import Image from "next/image";

import CafeOriginExplorer from "@/components/cafe/CafeOriginExplorer";
import Figure from "@/components/ui/Figure";
import Reveal from "@/components/ui/Reveal";
import Stratum from "@/components/ui/Stratum";
import { getProductCategories, getProducts } from "@/lib/data";
import { getMapView } from "@/lib/mapView";

export const metadata: Metadata = {
  title: "Cafés y carta",
  description:
    "Los cafés de Dosel con su origen exacto en el mapa de Colombia: finca, municipio, altura y perfil de taza. Más la carta completa: bebidas, pastelería, dulces y snacks, tortas por encargo y mermeladas Honey Moon.",
};

export default async function ProductosPage() {
  const [view, products, categories] = await Promise.all([
    getMapView(),
    getProducts(),
    getProductCategories(),
  ]);

  const groups = categories
    .map((category) => ({
      category,
      items: products.filter((p) => p.category === category.id),
    }))
    .filter((g) => g.items.length > 0);

  const alturas = view.altitudeRange;
  const rango = alturas
    ? `entre ${alturas.min.toLocaleString("es-CO")} y ${alturas.max.toLocaleString("es-CO")} msnm`
    : "a distintas alturas";
  const departamentos = new Set(view.cafes.map((c) => c.origin.regionId)).size;

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 md:px-8 md:pb-20 md:pt-24">
        <Stratum
          band="10 m, sotobosque"
          title="De dónde viene cada café."
          lead={`El café es un arbusto de sotobosque: crece a la sombra de árboles más altos. Hoy tenemos ${view.cafes.length} orígenes de ${departamentos} departamentos, ${rango}. La altura no es un dato de adorno: entre más alto hace más frío, y con frío el grano madura más lento y acumula más azúcar. Toca un departamento para ver qué hay de ahí, o abre una ficha y el mapa te muestra la finca.`}
        />
        <CafeOriginExplorer
          cafes={view.cafes}
          regions={view.regions}
          departments={view.departments}
          pins={view.pins}
          viewBox={view.viewBox}
          island={view.island}
          methodNames={view.methodNames}
        />
      </section>

      <section className="border-t border-rule bg-paper/50">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <Stratum
            band="0 m, suelo"
            title="Para acompañar"
            lead="El suelo del bosque es la capa que sostiene todo lo demás; en la tienda es el mostrador. Ahí está la carta completa: bebidas, pastelería, dulces y snacks, tortas por encargo y las mermeladas de Honey Moon."
          />

          <div className="space-y-14">
            {groups.map(({ category, items }, gi) => (
              <div key={category.id}>
                <Reveal delay={gi * 0.05}>
                  <div
                    className="relative w-full overflow-hidden"
                    style={{ aspectRatio: `${category.image.width} / ${category.image.height}` }}
                  >
                    {/* La foto ya trae "Dosel café y método" recortado a la derecha;
                        el recorte (categories.json) se elige a mano por foto para
                        que ese texto quede completo y legible. */}
                    <Image
                      src={category.image.src}
                      alt={category.image.alt}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-canopy/60 to-transparent" />
                    <h3 className="absolute bottom-4 left-5 font-display text-2xl text-cream md:text-3xl">
                      {category.label}
                    </h3>
                  </div>
                </Reveal>

                <ul className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
                  {items.map((product, i) => (
                    <Reveal key={product.id} delay={i * 0.06}>
                      <li className="list-none">
                        <Figure
                          image={product.images[0]}
                          sizes="(max-width: 768px) 45vw, 22vw"
                          className="border border-rule"
                        />
                        <h4 className="mt-3 font-display text-lg leading-tight text-canopy">
                          {product.name}
                        </h4>
                        {product.description && (
                          <p className="mt-1 font-sans text-sm leading-relaxed text-ink/65">
                            {product.description}
                          </p>
                        )}
                        {product.price != null && (
                          <p className="mt-1 font-sans text-sm text-moss">
                            ${product.price.toLocaleString("es-CO")}
                          </p>
                        )}
                      </li>
                    </Reveal>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
