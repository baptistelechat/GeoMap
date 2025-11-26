import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MapPoint } from '@/types/map';

interface PointsStore {
  points: MapPoint[];
  addPoint: (point: MapPoint) => void;
  removePoint: (id: string) => void;
  clearPoints: () => void;
}

export const usePointsStore = create<PointsStore>()(
  persist(
    (set) => ({
      points: [],
      addPoint: (point) => set((state) => ({ 
        points: [...state.points, point] 
      })),
      removePoint: (id) => set((state) => ({ 
        points: state.points.filter(point => point.id !== id) 
      })),
      clearPoints: () => set({ points: [] }),
    }),
    {
      name: 'geomark-points',
    }
  )
);