import {
  Circle,
  CircleDot,
  Hexagon,
  Map,
  MapPin,
  Move,
  RotateCw,
  SplinePointer,
  Square,
  Trash2,
  Type,
  Waypoints,
} from "lucide-react";

export const SHAPE_ICONS = {
  Marker: MapPin,
  Circle: Circle,
  Polygon: Hexagon,
  Rectangle: Square,
  Line: Waypoints,
  Text: Type,
  CircleMarker: CircleDot,
} as const;

export const EDIT_ICONS = {
  edit: SplinePointer,
  drag: Move,
  rotate: RotateCw,
  delete: Trash2,
} as const;

export const getFeatureIcon = (shapeType: string | undefined) => {
  if (!shapeType) return Map;
  return SHAPE_ICONS[shapeType as keyof typeof SHAPE_ICONS] || Map;
};
