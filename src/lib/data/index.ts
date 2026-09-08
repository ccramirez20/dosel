import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import type {
  Cafe,
  Experience,
  Method,
  Product,
  ProductCategory,
  Region,
} from "../../types/domain.ts";
import categoriesJson from "../../content/products/categories.json" with { type: "json" };
import experiencesJson from "../../content/experiences/experiences.json" with { type: "json" };
import methodsJson from "../../content/methods/methods.json" with { type: "json" };
import productsJson from "../../content/products/products.json" with { type: "json" };
import regionsJson from "../../content/regions.json" with { type: "json" };

/**
 * Única frontera con el origen de datos (CLAUDE.md §3.1). Hoy: archivos locales leídos en
 * build. Mañana: API o CMS. Las firmas de abajo no cambian cuando eso pase, por eso todas
 * son async aunque hoy resuelvan de inmediato.
 */

const CAFES_DIR = join(process.cwd(), "src", "content", "cafes");

export async function getRegions(): Promise<Region[]> {
  return regionsJson as Region[];
}

/**
 * Guardia sobre contenido escrito a mano. Está separada de `getCafes` para poder probar el
 * camino de error sin ensuciar `src/content/` con un archivo malo.
 *
 * Falla en build, no en runtime: un regionId equivocado dejaría el café sin pin, y eso se
 * ve como "el mapa está roto" tres semanas después, no como un error.
 */
export function assertKnownRegions(cafes: Cafe[], regionIds: Set<string>): void {
  for (const cafe of cafes) {
    if (!regionIds.has(cafe.origin.regionId)) {
      throw new Error(
        `Café "${cafe.slug}": regionId "${cafe.origin.regionId}" no existe en regions.json`,
      );
    }
  }
}

export async function getCafes(): Promise<Cafe[]> {
  // readdir en vez de un índice: el dueño agrega un .json y aparece, sin tocar código.
  const cafes = readdirSync(CAFES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(CAFES_DIR, f), "utf8")) as Cafe)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  assertKnownRegions(cafes, new Set((await getRegions()).map((r) => r.id)));
  return cafes;
}

export async function getCafe(slug: string): Promise<Cafe | undefined> {
  return (await getCafes()).find((c) => c.slug === slug);
}

export async function getMethods(): Promise<Method[]> {
  return methodsJson as Method[];
}

export async function getMethod(slug: string): Promise<Method | undefined> {
  return (await getMethods()).find((m) => m.slug === slug);
}

export async function getExperiences(): Promise<Experience[]> {
  return experiencesJson as Experience[];
}

export async function getProducts(): Promise<Product[]> {
  return productsJson as Product[];
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  return categoriesJson as ProductCategory[];
}
