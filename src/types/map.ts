export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  notes?: string;
  streetViewUrl?: string;
  createdAt: number;
}