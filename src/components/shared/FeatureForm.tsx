import { getFeatureBounds } from "@/lib/map";
import { useGeomarkStore } from "@/store/geomarkStore";
import type { Feature } from "geojson";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ColorPicker } from "./ColorPicker";

interface FeatureFormProps {
  feature?: Feature;
  isNew?: boolean;
  shapeType?: string;
  onSuccess?: () => void;
}

const DEFAULT_COLOR = "#65a30d"; // lime-600

export function FeatureForm({
  feature,
  isNew = false,
  shapeType,
  onSuccess,
}: FeatureFormProps) {
  const {
    addFeature,
    updateFeature,
    features,
    setFlyToBounds,
    setHighlightedId,
  } = useGeomarkStore();

  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);

  // Determine effective shape type
  const effectiveShapeType = shapeType || feature?.properties?.shape || "Forme";
  const isText = effectiveShapeType === "Text";

  // Use derived existing names from store
  const usedNames = features.map((f) => f.properties?.name).filter(Boolean);

  // Initialize state
  useEffect(() => {
    if (feature) {
      // If editing or confirming a pending feature that already has a name
      if (!isNew || feature.properties?.name) {
        setName(feature.properties?.name || "");
        setColor(feature.properties?.color || DEFAULT_COLOR);
      } else {
        // New feature without name, generate default
        generateDefaultName();
        setColor(feature.properties?.color || DEFAULT_COLOR);
      }
    } else if (isNew && effectiveShapeType) {
      // No feature provided but isNew (should not happen in current flow but good for safety)
      generateDefaultName();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feature, isNew, effectiveShapeType]);

  const generateDefaultName = () => {
    let counter = 1;
    let candidate = `${effectiveShapeType} ${counter}`;

    // Case insensitive check
    while (usedNames.some((n) => n.toLowerCase() === candidate.toLowerCase())) {
      counter++;
      candidate = `${effectiveShapeType} ${counter}`;
    }

    setName(candidate);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (!feature && !isNew) return; // Should not happen

    // Construct the feature with updated properties
    // If isNew, we assume feature (pendingFeature) is passed
    const baseFeature = feature || ({} as Feature);
    const updatedFeature = {
      ...baseFeature,
      properties: {
        ...baseFeature.properties,
        name,
        text: isText ? name : baseFeature.properties?.text,
        // Only update color if not Text
        color: isText ? baseFeature.properties?.color : color,
        updatedAt: Date.now(),
        // Ensure creation date is set if new
        createdAt: isNew
          ? Date.now()
          : baseFeature.properties?.createdAt || Date.now(),
        shape: effectiveShapeType,
      },
    } as Feature;

    if (isNew) {
      addFeature(updatedFeature);
    } else {
      updateFeature(updatedFeature);
      // Fly to the feature only on edit
      const boundsData = getFeatureBounds(updatedFeature);
      if (boundsData) {
        setFlyToBounds(boundsData);
      }
    }

    // Highlight
    if (updatedFeature.properties?.id) {
      setHighlightedId(updatedFeature.properties.id);
    }

    onSuccess?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
      {!isText && (
        <div className="grid gap-2">
          <Label>Couleur</Label>
          <ColorPicker color={color} onChange={setColor} />
        </div>
      )}
      <div className="flex justify-end gap-2 mt-2">
        <Button onClick={handleSave} className="w-full">
          {isNew ? "Créer" : "Sauvegarder"}
        </Button>
      </div>
    </div>
  );
}
