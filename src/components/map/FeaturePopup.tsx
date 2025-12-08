import { DeleteFeatureDialog } from "@/components/dialogs/DeleteFeatureDialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { area as turfArea } from "@turf/area";
import { length as turfLength } from "@turf/length";
import { Feature } from "geojson";
import { Move, RotateCw, Scissors, SplinePointer, Trash2 } from "lucide-react";

interface FeaturePopupProps {
  feature: Feature;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layer?: any; // Using any for Geoman extended layer
}

export function FeaturePopup({ feature, layer }: FeaturePopupProps) {
  let title = "Mesures";
  let content: React.ReactNode = null;

  // Determine title and content based on shape type
  if (feature.geometry.type === "LineString") {
    const len = turfLength(feature, { units: "meters" });
    const lenKm = turfLength(feature, { units: "kilometers" });
    content = (
      <>
        <div>
          Longueur:{" "}
          {len < 1000 ? `${len.toFixed(2)} m` : `${lenKm.toFixed(2)} km`}
        </div>
      </>
    );
  } else if (
    feature.geometry.type === "Polygon" ||
    feature.geometry.type === "MultiPolygon"
  ) {
    const a = turfArea(feature); // m²
    const aHectare = a / 10000;

    const perim = turfLength(feature, { units: "meters" });
    const perimKm = turfLength(feature, { units: "kilometers" });

    content = (
      <>
        <div>
          Surface:{" "}
          {a < 10000 ? `${a.toFixed(2)} m²` : `${aHectare.toFixed(2)} ha`}
        </div>
        <div>
          Périmètre:{" "}
          {perim < 1000 ? `${perim.toFixed(2)} m` : `${perimKm.toFixed(2)} km`}
        </div>
      </>
    );
  } else if (feature.properties?.shape === "Circle") {
    const radius = feature.properties.radius || 0;
    const areaCircle = Math.PI * radius * radius;
    const perimeterCircle = 2 * Math.PI * radius;
    const perimeterCircleKm = perimeterCircle / 1000;
    const areaHectare = areaCircle / 10000;

    content = (
      <>
        <div>Rayon: {radius.toFixed(2)} m</div>
        <div>
          Surface:{" "}
          {areaCircle < 10000
            ? `${areaCircle.toFixed(2)} m²`
            : `${areaHectare.toFixed(2)} ha`}
        </div>
        <div>
          Circonférence:{" "}
          {perimeterCircle < 1000
            ? `${perimeterCircle.toFixed(2)} m`
            : `${perimeterCircleKm.toFixed(2)} km`}
        </div>
      </>
    );
  } else if (feature.properties?.shape === "CircleMarker") {
    title = "Point";
    content = null;
  } else if (feature.properties?.shape === "Text") {
    title = "Texte";
    content = (
      <div className="italic text-gray-600">
        {feature.properties.text || "Sans texte"}
      </div>
    );
  } else {
    // Fallback for other shapes
    title = "Forme";
  }

  const handleAction = (action: string) => {
    if (!layer || !layer.pm) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = (layer as any)._map;
    if (!map || !map.pm) return;

    // Close popup to allow interaction
    layer.closePopup();

    switch (action) {
      case "edit":
        map.pm.enableGlobalEditMode();
        break;
      case "drag":
        map.pm.enableGlobalDragMode();
        break;
      case "rotate":
        map.pm.enableGlobalRotateMode();
        break;
      case "cut":
        map.pm.enableGlobalCutMode({
          allowSelfIntersection: false,
        });
        break;
    }
  };

  return (
    <div className="p-2 min-w-fit flex flex-col gap-2">
      <div className="text-sm font-semibold">{title}</div>

      {content && (
        <div className="whitespace-nowrap flex flex-col gap-1 text-sm">
          {content}
        </div>
      )}

      {content && <Separator />}

      <div className="flex items-center justify-end gap-1 leaflet-pm-toolbar">
        {/* Edit Action */}
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          title="Éditer"
          onClick={() => handleAction("edit")}
        >
          <SplinePointer className="size-4" />
        </Button>

        {/* Drag Action */}
        <Button
          variant="ghost"
          size="icon"
          className="size-7 text-muted-foreground"
          title="Déplacer"
          onClick={() => handleAction("drag")}
        >
          <Move className="size-4" />
        </Button>

        {/* Cut Action (only for relevant shapes) */}
        {(feature.geometry.type === "Polygon" ||
          feature.geometry.type === "MultiPolygon") && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            title="Découper"
            onClick={() => handleAction("cut")}
          >
            <Scissors className="size-4" />
          </Button>
        )}

        {/* Delete Action */}
        <DeleteFeatureDialog
          feature={feature}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Supprimer"
            >
              <Trash2 className="size-4" />
            </Button>
          }
        />

        {/* Rotate Action (only for relevant shapes) */}
        {feature.geometry.type !== "Point" && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            title="Rotation"
            onClick={() => handleAction("rotate")}
          >
            <RotateCw className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
