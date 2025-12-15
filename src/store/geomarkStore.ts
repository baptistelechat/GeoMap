import { MapPoint } from "@/types/map";
import type { Feature } from "geojson";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GeomarkStore {
  // Points
  points: MapPoint[];
  addPoint: (point: MapPoint) => void;
  updatePoint: (point: MapPoint) => void;
  removePoint: (id: string) => void;
  clearPoints: () => void;

  // Features (Geoman)
  features: Feature[];
  addFeature: (feature: Feature) => void;
  updateFeature: (feature: Feature) => void;
  removeFeature: (id: string) => void;
  setFeatures: (features: Feature[]) => void;
  clearFeatures: () => void;

  // Visibility
  showPoints: boolean;
  setShowPoints: (show: boolean) => void;
  showFeatures: boolean;
  setShowFeatures: (show: boolean) => void;

  // Map Control
  flyToLocation: { lat: number; lng: number; zoom?: number } | null;
  setFlyToLocation: (
    location: { lat: number; lng: number; zoom?: number } | null
  ) => void;
  flyToBounds: {
    bounds: [[number, number], [number, number]];
    options?: { maxZoom?: number; skipHideFeatures?: boolean };
  } | null;
  setFlyToBounds: (
    data: {
      bounds: [[number, number], [number, number]];
      options?: { maxZoom?: number; skipHideFeatures?: boolean };
    } | null
  ) => void;

  // Animation
  highlightedId: string | null;
  setHighlightedId: (id: string | null) => void;

  // Edit Mode
  isEditMode: boolean;
  setIsEditMode: (isEditMode: boolean) => void;

  // Import
  importData: (points: MapPoint[], features: Feature[]) => void;
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
      importData: (newPoints, newFeatures) =>
        set((state) => {
          const newPointIds = new Set(newPoints.map((p) => p.id));
          const newFeatureIds = new Set(
            newFeatures.map((f) => f.properties?.id).filter(Boolean)
          );

          return {
            points: [
              ...state.points.filter((p) => !newPointIds.has(p.id)),
              ...newPoints,
            ],
            features: [
              ...state.features.filter(
                (f) => !newFeatureIds.has(f.properties?.id)
              ),
              ...newFeatures,
            ],
          };
        }),
      updatePoint: (updatedPoint) =>
        set((state) => ({
          points: state.points.map((p) =>
            p.id === updatedPoint.id ? updatedPoint : p
          ),
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

      // Visibility Implementation
      showPoints: true,
      setShowPoints: (show) => set({ showPoints: show }),
      showFeatures: true,
      setShowFeatures: (show) => set({ showFeatures: show }),

      // Map Control Implementation
      flyToLocation: null,
      setFlyToLocation: (location) => set({ flyToLocation: location }),
      flyToBounds: null,
      setFlyToBounds: (data) => set({ flyToBounds: data }),

      // Animation Implementation
      highlightedId: null,
      setHighlightedId: (id) => set({ highlightedId: id }),

      // Edit Mode Implementation
      isEditMode: false,
      setIsEditMode: (isEditMode) => set({ isEditMode }),
    }),
    {
      name: "geomark-storage", // Unified storage key
      partialize: (state) => ({
        points: state.points,
        features: state.features,
        showPoints: state.showPoints,
        showFeatures: state.showFeatures,
        // Exclude flyToLocation and highlightedPointId from persistence
      }),
    }
  )
);
