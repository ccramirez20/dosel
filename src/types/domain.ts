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

/**
 * Cuándo se dicta un taller. Es una regla, no una lista de fechas: el sitio es estático y
 * una lista se queda vieja entre despliegues, mientras que la regla sigue produciendo las
 * próximas fechas sola. No lleva cupos a propósito — eso es `Session`, y es Fase 3.
 */
export interface Schedule {
  /** Día de la semana. 0 = domingo … 6 = sábado. */
  weekday: number;
  /** "week": cada semana. "month": una vez al mes. */
  every: "week" | "month";
  /** Con `every: "month"`, cuál ocurrencia de ese día. 1 = el primero del mes. */
  nth?: number;
  /** Horas de inicio que se ofrecen ese día, en "HH:MM". */
  times: string[];
}

export interface Experience {
  id: string;
  slug: string;
  title: string;
  category: "taller" | "metodo" | "otro";
  description: string;
  images: ImageRef[];
  /** Sin `schedule` no hay formulario: la tarjeta cae al enlace de WhatsApp. */
  bookable?: boolean;
  schedule?: Schedule;
  // --- costura reservas (Fase 3), sin uso en v1 ---
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
  /** Agrupa el ítem en el menú de /productos. Debe existir en categories.json. */
  category?: string;
}

export interface ProductCategory {
  id: string;
  label: string;
  image: ImageRef;
}
