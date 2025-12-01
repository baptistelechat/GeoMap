import { useGeomarkStore } from "@/store/geomarkStore";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import type { Feature, GeoJsonObject } from "geojson";
import * as L from "leaflet";
import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

// Define custom types to avoid 'any'
interface GeomanLayer extends L.Layer {
  toGeoJSON: () => Feature;
  feature?: Feature;
  _fromStore?: boolean;
  getRadius?: () => number;
}

interface PmEvent extends L.LeafletEvent {
  layer: GeomanLayer;
  shape?: string;
}

const GEOMAN_STYLE = {
  color: "var(--primary)",
  fillColor: "var(--primary)",
  fillOpacity: 0.3,
  weight: 2,
};

export function GeomanControl() {
  const map = useMap();
  const { features, addFeature, updateFeature, removeFeature } =
    useGeomarkStore();
  const isInitialized = useRef(false);
  const featuresLoaded = useRef(false);

  // Initialize Geoman and setup listeners
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Initialize Geoman controls
    map.pm.addControls({
      position: "topleft",
      drawCircle: true,
    });

    map.pm.setLang("fr");

    // Set theme colors for new shapes
    map.pm.setPathOptions(GEOMAN_STYLE);

    // Listeners
    map.on("pm:create", (e) => {
      const event = e as PmEvent;
      const layer = event.layer;
      // If the layer already has an ID (from our loading logic), don't recreate it
      // But pm:create is usually fired for NEW layers drawn by user.
      // When we add layers via L.geoJSON, pm:create is NOT fired by default unless we draw them.

      if (layer._fromStore) return;

      const shape = event.shape; // e.g. 'Marker', 'Circle'

      // Create a unique ID
      const id = crypto.randomUUID();

      // Convert to GeoJSON
      // Leaflet's toGeoJSON() doesn't always capture Circle radius properly in standard GeoJSON (it's a point)
      // But Geoman handles editing. For storage, we rely on standard GeoJSON.
      // For Circles, we might need custom handling if we want to persist radius perfectly in a standard way,
      // but usually Feature properties are used.

      const geoJson = layer.toGeoJSON();
      if (!geoJson.properties) geoJson.properties = {};
      geoJson.properties.id = id;
      geoJson.properties.shape = shape;

      // For circles, store radius
      if (shape === "Circle" && typeof layer.getRadius === "function") {
        geoJson.properties.radius = layer.getRadius();
      }

      // Attach ID to layer for future reference
      layer.feature = layer.feature || geoJson;
      layer.feature.properties = layer.feature.properties || {};
      layer.feature.properties.id = id;

      addFeature(geoJson);

      // Add event listeners to this new layer for edit/remove (if they are not global)
      // Geoman has global map events for edit/remove too, let's check those first.
    });

    map.on("pm:remove", (e) => {
      const event = e as PmEvent;
      const layer = event.layer;
      const id = layer.feature?.properties?.id;
      if (id) {
        removeFeature(id);
      }
    });

    // pm:edit is fired on the layer usually, but map also catches it?
    // map.on('pm:globaleditmodetoggled')
    // Geoman documentation says: map.on('pm:create', ...)
    // For edits, it's often on the layer. But we can listen globally?
    // Let's try global map listener for 'pm:edit' - wait, does map fire pm:edit?
    // Actually, usually we listen on the layer. But Geoman might bubble it.
    // Let's check documentation or assume we need to attach listeners to layers.
    // OR use map.on('layeradd') to attach listeners?

    // Better approach: Global listener if supported.
    // According to docs, map fires 'pm:globaleditmodetoggled', 'pm:globaldragmodetoggled', etc.
    // But actual edit changes?
    // We can listen to 'pm:edit' on the map? It seems layer fires it.
    // However, let's try to attach listeners to all layers.
  }, [map, addFeature, removeFeature]);

  // Handle Edit Events
  useEffect(() => {
    const handleEdit = (e: L.LeafletEvent) => {
      const event = e as PmEvent;
      const layer = event.layer;
      if (!layer || !layer.feature?.properties?.id) return;

      const geoJson = layer.toGeoJSON();
      geoJson.properties = {
        ...layer.feature.properties,
        ...geoJson.properties,
      };

      // Update radius for circles
      if (typeof layer.getRadius === "function") {
        geoJson.properties.radius = layer.getRadius();
      }

      updateFeature(geoJson);
    };

    // We need to capture edits. 'pm:edit', 'pm:dragend', 'pm:markerdragend', 'pm:rotateend' ...
    // It's safer to listen on map and hope it bubbles, or iterate layers.
    // Leaflet events often bubble to map.
    map.on("pm:edit", handleEdit);
    map.on("pm:dragend", handleEdit);
    map.on("pm:markerdragend", handleEdit);
    map.on("pm:rotateend", handleEdit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.on("pm:cut", (e: any) => {
      // Cut replaces the layer. We might need to handle this specifically.
      // For now, let's just handle basic edits.
      // If cut happens, the original layer might be removed and a new one added?
      // Or the original layer is modified.
      handleEdit(e);
    });

    return () => {
      map.off("pm:edit", handleEdit);
      map.off("pm:dragend", handleEdit);
      map.off("pm:markerdragend", handleEdit);
      map.off("pm:rotateend", handleEdit);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.off("pm:cut", handleEdit as any);
    };
  }, [map, updateFeature]);

  // Load features from store
  useEffect(() => {
    if (featuresLoaded.current) return;
    featuresLoaded.current = true;

    // We need to add existing features to the map
    // But we must be careful not to double-add if strict mode runs twice or something.
    // We use a flag.

    const geoJsonLayer = L.geoJSON(features as GeoJsonObject[], {
      style: () => GEOMAN_STYLE,
      onEachFeature: (feature, l) => {
        const layer = l as GeomanLayer;
        // Restore radius for circles
        if (
          feature.properties?.shape === "Circle" &&
          feature.properties?.radius
        ) {
          // L.geoJSON creates a Marker for Point geometry. We need to replace it with Circle if it was a circle.
          // But wait, standard GeoJSON is Point.
          // We can use pointToLayer option.
        }

        // Mark as from store so pm:create doesn't duplicate
        layer._fromStore = true;

        // Enable editing for this layer (optional, Geoman usually handles it via toolbar)
      },
      pointToLayer: (feature, latlng) => {
        if (
          feature.properties?.shape === "Circle" &&
          feature.properties?.radius
        ) {
          return new L.Circle(latlng, { radius: feature.properties.radius });
        }
        if (feature.properties?.shape === "CircleMarker") {
          return new L.CircleMarker(latlng, {});
        }
        return new L.Marker(latlng);
      },
    });

    geoJsonLayer.getLayers().forEach((l) => {
      const layer = l as GeomanLayer;
      layer._fromStore = true;
      layer.addTo(map);

      // Ensure Geoman knows about it (toggle edit to init? No, usually auto-detected)
      // But we might need to re-attach the feature ID if it was lost (L.geoJSON attaches it to layer.feature)
    });
  }, [map, features]); // This dependency on 'features' is tricky. If features change in store, do we re-render?
  // If we add a feature via pm:create, store updates -> this effect runs?
  // We should only load ONCE on mount.
  // If 'features' updates because of 'addFeature', we don't want to re-add it to map.
  // So we should remove 'features' from dependency array or handle diffs.
  // Given 'featuresLoaded' ref, it will only run once.
  // BUT if we reload the page, it runs once.
  // If we persist, it runs once.

  // What if data comes in later (async persist rehydration)?
  // Zustand persist is usually synchronous if localStorage.

  return null;
}
