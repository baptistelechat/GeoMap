import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { toast } from 'sonner';
import { MapPoint } from '@/types/map';

export function exportToCSV(points: MapPoint[]): void {
  const csv = Papa.unparse(points.map(point => ({
    Titre: point.title,
    Latitude: point.lat,
    Longitude: point.lng,
    Notes: point.notes || '',
    'URL': point.url || '',
    'Date de création': new Date(point.createdAt).toLocaleString('fr-FR'),
    'Date de modification': point.updatedAt ? new Date(point.updatedAt).toLocaleString('fr-FR') : new Date(point.createdAt).toLocaleString('fr-FR')
  })));
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `geomark-points-${new Date().toISOString().split('T')[0]}.csv`);
  toast.success(`${points.length} points exportés en CSV`);
}

export function exportToJSON(points: MapPoint[]): void {
  const json = JSON.stringify(points, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  saveAs(blob, `geomark-points-${new Date().toISOString().split('T')[0]}.json`);
  toast.success(`${points.length} points exportés en JSON`);
}