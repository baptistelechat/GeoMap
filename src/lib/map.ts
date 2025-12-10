import type { Feature } from "geojson";
import * as L from "leaflet";

// Map Geoman shapes to French names
export const SHAPE_NAMES: Record<string, string> = {
  Marker: "Point",
  Circle: "Cercle",
  Polygon: "Polygone",
  Rectangle: "Rectangle",
  Line: "Ligne",
  Text: "Texte",
  CircleMarker: "Point - Cercle",
};

export interface FlyToBoundsResult {
  bounds: [[number, number], [number, number]];
  options?: { maxZoom?: number };
}

export function getFeatureBounds(feature: Feature): FlyToBoundsResult | null {
  // Calculate center of the feature to zoom to it
  let layer: L.Layer | null = null;
  let maxZoom: number | undefined;
  let bounds: L.LatLngBounds | undefined;

  // Handle Circles specially to get correct bounds based on radius
  if (feature.properties?.shape === "Circle" && feature.properties?.radius) {
    const latlng = L.GeoJSON.coordsToLatLng(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (feature.geometry as any).coordinates
    );
    const radius = feature.properties.radius;

    // Manual bounds calculation to avoid adding layer to map (which causes "layerPointToLatLng" error)
    const earthRadius = 6378137;
    const latRadius = (radius / earthRadius) * (180 / Math.PI);
    const lngRadius = latRadius / Math.cos((latlng.lat * Math.PI) / 180);

    const south = latlng.lat - latRadius;
    const north = latlng.lat + latRadius;
    const west = latlng.lng - lngRadius;
    const east = latlng.lng + lngRadius;

    bounds = L.latLngBounds([
      [south, west],
      [north, east],
    ]);
  } else if (
    feature.properties?.shape === "Text" ||
    feature.properties?.shape === "CircleMarker"
  ) {
    // Text and CircleMarker behave like a point, limit zoom to avoid being too close
    layer = L.geoJSON(feature);
    maxZoom = 16;
  } else {
    layer = L.geoJSON(feature);
  }

  if (!bounds && layer) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bounds = (layer as any).getBounds();
  }

  if (bounds && bounds.isValid()) {
    return {
      bounds: [
        [bounds.getSouth(), bounds.getWest()],
        [bounds.getNorth(), bounds.getEast()],
      ],
      options: { maxZoom },
    };
  }

  return null;
}
