import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { MapPoint } from '@/types/map';

export function exportToCSV(points: MapPoint[]): void {
  const csv = Papa.unparse(points.map(point => ({
    Titre: point.title,
    Latitude: point.lat,
    Longitude: point.lng,
    Notes: point.notes || '',
    'Street View URL': point.streetViewUrl || '',
    'Date de création': new Date(point.createdAt).toLocaleString('fr-FR')
  })));
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `geomark-points-${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportToJSON(points: MapPoint[]): void {
  const json = JSON.stringify(points, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  saveAs(blob, `geomark-points-${new Date().toISOString().split('T')[0]}.json`);
}