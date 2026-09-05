import type { Metadata } from "next";

import CafeOriginExplorer from "@/components/cafe/CafeOriginExplorer";
import Figure from "@/components/ui/Figure";
import Reveal from "@/components/ui/Reveal";
import Stratum from "@/components/ui/Stratum";
import { getProducts } from "@/lib/data";
import { getMapView } from "@/lib/mapView";

export const metadata: Metadata = {
  title: "Cafés y panadería",
  description:
    "Los cafés de Dosel con su origen exacto en el mapa de Colombia: finca, municipio, altura y perfil de taza. Más la panadería del día.",
};

export default async function ProductosPage() {
  const [view, products] = await Promise.all([getMapView(), getProducts()]);

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 md:px-8 md:pb-20 md:pt-24">
        <Stratum
          band="1 600 – 2 000 m"
          title="De dónde viene cada café."
          lead="Toca un departamento para ver qué tenemos de ahí, o abre una ficha y el mapa te muestra la finca. Los datos de altura y proceso son los que nos da el productor."
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
            band="0 m, mostrador"
            title="Panadería del día"
            lead="Se hornea en la mañana y se acaba cuando se acaba. No hay vitrina de ayer."
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
