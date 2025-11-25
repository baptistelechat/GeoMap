import { Button } from "@/components/ui/button";
import { usePointsStore } from "@/store/pointsStore";
import { Trash2 } from "lucide-react";
import { StreetViewFrame } from "./StreetViewFrame";

export function PointsList() {
  const { points, removePoint } = usePointsStore();

  if (points.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Aucun point ajouté
      </div>
    );
  }

  return (
    <div className="space-y-3 p-2">
      {points.map((point) => (
        <div
          key={point.id}
          className="rounded-lg border bg-sidebar-accent/10 p-3 shadow-sm"
        >
          <div className="mb-2 flex items-start justify-between">
            <h3 className="font-medium text-sm text-sidebar-foreground">
              {point.title}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removePoint(point.id)}
              title="Supprimer"
              className="h-6 w-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 size={14} />
            </Button>
          </div>

          {point.streetViewUrl && (
            <div className="mb-2">
              <StreetViewFrame url={point.streetViewUrl} title={point.title} />
            </div>
          )}

          {point.notes && (
            <p className="mb-2 text-xs text-muted-foreground">{point.notes}</p>
          )}

          <div className="text-xs text-muted-foreground/80">
            <p>Lat: {point.lat.toFixed(6)}</p>
            <p>Lng: {point.lng.toFixed(6)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
