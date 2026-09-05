export interface ImageRef {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface Region {
  /** ISO 3166-2:CO, p.ej. "CO-HUI". Debe existir en public/geo/colombia-departments.topo.json */
  id: string;
  name: string;
}

export interface Origin {
  regionId: string;
  municipio: string;
  finca?: string;
  lat: number;
  lng: number;
  altitudeMasl?: number;
}

export interface Cafe {
  id: string;
  slug: string;
  name: string;
  origin: Origin;
  variety?: string;
  process?: string;
  roastLevel?: string;
  profile: {
    description: string;
    aromas: string[];
    tasting: string[];
    body?: string;
    acidity?: string;
  };
  recommendedMethods: string[];
  story?: string;
  images: ImageRef[];
  // --- costura e-commerce (Fase 2), sin uso en v1 ---
  price?: number;
  currency?: "COP";
  sku?: string;
  available?: boolean;
}

export interface Method {
  id: string;
  slug: string;
  name: string;
  origin: string;
  usedFor: string;
  description: string;
  bestFor?: string[];
  images: ImageRef[];
}

export interface Session {
  id: string;
  startsAt: string;
  capacity: number;
  booked: number;
}

export interface Experience {
  id: string;
  slug: string;
  title: string;
  category: "taller" | "metodo" | "otro";
  description: string;
  images: ImageRef[];
  // --- costura reservas (Fase 3), sin uso en v1 ---
  bookable?: boolean;
  price?: number;
  sessions?: Session[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  images: ImageRef[];
  price?: number;
  available?: boolean;
}
