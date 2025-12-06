export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  notes?: string;
  streetViewUrl?: string;
  color?: string;
  icon?: string;
  createdAt: number;
  updatedAt: number;
}
