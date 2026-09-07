import type { Metadata } from "next";

import CafeOriginExplorer from "@/components/cafe/CafeOriginExplorer";
import Figure from "@/components/ui/Figure";
import Reveal from "@/components/ui/Reveal";
import Stratum from "@/components/ui/Stratum";
import { getProducts } from "@/lib/data";
import { getMapView } from "@/lib/mapView";

export const metadata: Metadata = {
  title: "Cafés y carta",
  description:
    "Los cafés de Dosel con su origen exacto en el mapa de Colombia: finca, municipio, altura y perfil de taza. Más la panadería y los snacks de fruta deshidratada de ACAB.",
};

export default async function ProductosPage() {
  const [view, products] = await Promise.all([getMapView(), getProducts()]);

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
            lead="El suelo del bosque es la capa que sostiene todo lo demás; en la tienda es el mostrador. Ahí está la panadería y ACAB, nuestros snacks de fruta deshidratada."
          />
          <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={i * 0.06}>
                <li className="list-none">
                  <Figure
                    image={product.images[0]}
                    sizes="(max-width: 768px) 45vw, 22vw"
                    className="border border-rule"
                  />
                  <h3 className="mt-3 font-display text-lg leading-tight text-canopy">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="mt-1 font-sans text-sm leading-relaxed text-ink/65">
                      {product.description}
                    </p>
                  )}
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
