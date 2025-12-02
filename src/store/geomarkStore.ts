import { MapPoint } from "@/types/map";
import type { Feature } from "geojson";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GeomarkStore {
  // Points
  points: MapPoint[];
  addPoint: (point: MapPoint) => void;
  removePoint: (id: string) => void;
  clearPoints: () => void;

  // Features (Geoman)
  features: Feature[];
  addFeature: (feature: Feature) => void;
  updateFeature: (feature: Feature) => void;
  removeFeature: (id: string) => void;
  setFeatures: (features: Feature[]) => void;
  clearFeatures: () => void;

  // Map Control
  flyToLocation: { lat: number; lng: number; zoom?: number } | null;
  setFlyToLocation: (location: { lat: number; lng: number; zoom?: number } | null) => void;
}

export const useGeomarkStore = create<GeomarkStore>()(
  persist(
    (set) => ({
      // Points Implementation
      points: [],
      addPoint: (point) =>
        set((state) => ({
          points: [...state.points, point],
        })),
      removePoint: (id) =>
        set((state) => ({
          points: state.points.filter((point) => point.id !== id),
        })),
      clearPoints: () => set({ points: [] }),

      // Features Implementation
      features: [],
      addFeature: (feature) =>
        set((state) => ({
          features: [...state.features, feature],
        })),
      updateFeature: (updatedFeature) =>
        set((state) => ({
          features: state.features.map((f) => {
            const fId = f.properties?.id;
            const uId = updatedFeature.properties?.id;
            if (fId && uId && fId === uId) {
              return updatedFeature;
            }
            return f;
          }),
        })),
      removeFeature: (id) =>
        set((state) => ({
          features: state.features.filter((f) => f.properties?.id !== id),
        })),
      setFeatures: (features) => set({ features }),
      clearFeatures: () => set({ features: [] }),

      // Map Control Implementation
      flyToLocation: null,
      setFlyToLocation: (location) => set({ flyToLocation: location }),
    }),
    {
      name: "geomark-storage", // Unified storage key
      partialize: (state) => ({
        points: state.points,
        features: state.features,
        // Exclude flyToLocation from persistence
      }),
    }
  )
);
