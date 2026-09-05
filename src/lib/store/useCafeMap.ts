import { create } from "zustand";

/**
 * Estado compartido entre la lista de cafés y el mapa. Vive aquí y no en un componente
 * padre porque la selección viaja en los dos sentidos (CLAUDE.md §7): tarjeta → mapa y
 * departamento → lista. El store no conoce el contenido; recibe el regionId ya resuelto.
 */
interface CafeMapState {
  selectedCafeId: string | null;
  selectedRegionId: string | null;
  /** Clic en una tarjeta de café: resalta también su departamento. */
  selectCafe: (cafeId: string | null, regionId?: string | null) => void;
  /** Clic en un departamento: filtra la lista y suelta el café puntual. */
  selectRegion: (regionId: string | null) => void;
  clear: () => void;
}

export const useCafeMap = create<CafeMapState>((set) => ({
  selectedCafeId: null,
  selectedRegionId: null,
  selectCafe: (cafeId, regionId = null) =>
    set((s) =>
      s.selectedCafeId === cafeId
        ? { selectedCafeId: null, selectedRegionId: null }
        : { selectedCafeId: cafeId, selectedRegionId: regionId },
    ),
  selectRegion: (regionId) =>
    set((s) => ({
      selectedRegionId: s.selectedRegionId === regionId ? null : regionId,
      selectedCafeId: null,
    })),
  clear: () => set({ selectedCafeId: null, selectedRegionId: null }),
}));
