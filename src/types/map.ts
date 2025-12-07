export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  notes?: string;
  url?: string;
  color?: string;
  icon?: string;
  createdAt: number;
  updatedAt: number;
}
