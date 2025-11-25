import { MapPoint } from '@/types/map';
import { ExternalLink } from 'lucide-react';

interface MarkerPopupProps {
  point: MapPoint;
}

export function MarkerPopup({ point }: MarkerPopupProps) {
  return (
    <div className="p-2 min-w-[200px]">
      <h3 className="font-semibold text-gray-800 mb-2">{point.title}</h3>
      {point.notes && (
        <p className="text-sm text-gray-600 mb-2">{point.notes}</p>
      )}
      <div className="text-xs text-gray-500 mb-2">
        <p>Lat: {point.lat.toFixed(6)}</p>
        <p>Lng: {point.lng.toFixed(6)}</p>
      </div>
      {point.streetViewUrl && (
        <a
          href={point.streetViewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ExternalLink size={14} />
          Voir Street View
        </a>
      )}
    </div>
  );
}