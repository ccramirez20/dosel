import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import type { Cafe, Experience, Method, Product, Region } from "@/types/domain";
import experiencesJson from "@/content/experiences/experiences.json";
import methodsJson from "@/content/methods/methods.json";
import productsJson from "@/content/products/products.json";
import regionsJson from "@/content/regions.json";

/**
 * Única frontera con el origen de datos (CLAUDE.md §3.1). Hoy: archivos locales leídos en
 * build. Mañana: API o CMS. Las firmas de abajo no cambian cuando eso pase, por eso todas
 * son async aunque hoy resuelvan de inmediato.
 */

const CAFES_DIR = join(process.cwd(), "src", "content", "cafes");

export async function getRegions(): Promise<Region[]> {
  return regionsJson as Region[];
}

export async function getCafes(): Promise<Cafe[]> {
  // readdir en vez de un índice: el dueño agrega un .json y aparece, sin tocar código.
  const cafes = readdirSync(CAFES_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(CAFES_DIR, f), "utf8")) as Cafe)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  const regionIds = new Set((await getRegions()).map((r) => r.id));
  for (const cafe of cafes) {
    // Falla en build, no en runtime: un regionId malo dejaría el café sin pin en el mapa.
    if (!regionIds.has(cafe.origin.regionId)) {
      throw new Error(
        `Café "${cafe.slug}": regionId "${cafe.origin.regionId}" no existe en regions.json`,
      );
    }
  }
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
