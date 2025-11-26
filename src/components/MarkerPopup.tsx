import { Badge } from "@/components/ui/badge";
import { MapPoint } from "@/types/map";
import { ExternalLink } from "lucide-react";

interface MarkerPopupProps {
  point: MapPoint;
}

export function MarkerPopup({ point }: MarkerPopupProps) {
  return (
    <div className="p-2 min-w-[200px] flex flex-col gap-2">
      <h3 className="font-semibold text-gray-800">{point.title}</h3>
      <div >
        <Badge variant="secondary" className="font-mono text-xs">
          {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
        </Badge>
      </div>
      {point.notes && (
        <p className="m-0 text-sm text-gray-600 break-words">{point.notes}</p>
      )}
      {point.streetViewUrl && (
        <a
          href={point.streetViewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          <ExternalLink size={14} />
          Voir Street View
        </a>
      )}
    </div>
  );
}
