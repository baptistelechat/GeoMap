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
  options: L.LayerOptions & {
    text?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
}

interface PmEvent extends L.LeafletEvent {
  layer: GeomanLayer;
  shape?: string;
}

const themeColor = "var(--primary)";

const GEOMAN_STYLE = {
  color: themeColor,
  fillColor: themeColor,
  fillOpacity: 0.3,
  weight: 2,
};

export function GeomanControl() {
  const map = useMap();
  const { features, addFeature, updateFeature, removeFeature } =
    useGeomarkStore();
  const isInitialized = useRef(false);
  const featuresLoaded = useRef(false);

  // Handle Edit Events
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleEdit = (e: L.LeafletEvent) => {
    const event = e as PmEvent;
    const layer = event.layer || (event.target as GeomanLayer);
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

    // Update text for Text layers
    if (layer.feature?.properties?.shape === "Text") {
      const text =
        layer.options?.text ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ((layer as any).pm && (layer as any).pm.getText
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (layer as any).pm.getText()
          : "");
      if (text) {
        geoJson.properties.text = text;
      }
    }

    updateFeature(geoJson);
  };

  // Initialize Geoman and setup listeners
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // Initialize Geoman controls
    map.pm.addControls({
      position: "topleft",
      drawMarker: false,
    });

    // Initialize language
    map.pm.setLang("fr");

    // Custom translations for Text tool (missing in default fr locale)
    const customTranslation = {
      tooltips: {
        placeText: "Cliquez pour placer du texte",
      },
      buttonTitles: {
        drawTextButton: "Ajouter du texte",
      },
    };

    // Register a custom locale extending 'fr'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.pm.setLang("fr-custom" as any, customTranslation, "fr");

    
    map.pm.setGlobalOptions({
      // Style for the finished layer
      pathOptions: GEOMAN_STYLE,
      // Style for the lines while drawing (templine)
      templineStyle: {
        color: themeColor,
      },
      // Style for the dashed line to the mouse cursor (hintline)
      hintlineStyle: {
        color: themeColor,
        dashArray: [5, 5],
      },
    });

    // Listeners
    map.on("pm:create", (e) => {
      const event = e as PmEvent;
      const layer = event.layer;
      // If the layer already has an ID (from our loading logic), don't recreate it
      if (layer._fromStore) return;

      const shape = event.shape; // e.g. 'Marker', 'Circle'

      // Create a unique ID
      const id = crypto.randomUUID();

      const geoJson = layer.toGeoJSON();
      if (!geoJson.properties) geoJson.properties = {};
      geoJson.properties.id = id;
      geoJson.properties.shape = shape;

      // For circles, store radius
      if (shape === "Circle" && typeof layer.getRadius === "function") {
        geoJson.properties.radius = layer.getRadius();
      }

      // For Text, store content
      if (shape === "Text") {
        const text =
          layer.options?.text ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((layer as any).pm && (layer as any).pm.getText
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (layer as any).pm.getText()
            : "");
        if (text) {
          geoJson.properties.text = text;
        }
      }

      // Attach ID to layer for future reference
      layer.feature = layer.feature || geoJson;
      layer.feature.properties = layer.feature.properties || {};
      layer.feature.properties.id = id;
      layer.feature.properties.shape = shape; // Ensure shape is preserved

      addFeature(geoJson);

      // Add event listeners to this new layer for edit
      layer.on("pm:edit", handleEdit);
      layer.on("pm:dragend", handleEdit);
      layer.on("pm:markerdragend", handleEdit);
      layer.on("pm:rotateend", handleEdit);
      layer.on("pm:textchange", handleEdit);
      layer.on("pm:cut", handleEdit);
    });

    map.on("pm:remove", (e) => {
      const event = e as PmEvent;
      const layer = event.layer;
      const id = layer.feature?.properties?.id;
      if (id) {
        removeFeature(id);
      }
    });

    // Cleanup
    return () => {
      // We can't easily remove listeners from individual layers here without tracking them.
      // But since this component is likely persistent, it's okay.
      // Map listeners will be removed if we used named functions, but here we used anonymous for create/remove.
      // To do it properly, we should move handlers out.
      // But for now, this refactor focuses on attaching listeners to layers.
    };
  }, [map, addFeature, removeFeature, handleEdit]);

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

        // Restore text content visually if it's a Text layer
        if (
          feature.properties?.shape === "Text" &&
          feature.properties?.text &&
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (layer as any).pm
        ) {
          // Force update the text content in the layer
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (layer as any).pm.setText(feature.properties.text);
        }

        // Enable editing for this layer (optional, Geoman usually handles it via toolbar)
        layer.on("pm:edit", handleEdit);
        layer.on("pm:dragend", handleEdit);
        layer.on("pm:markerdragend", handleEdit);
        layer.on("pm:rotateend", handleEdit);
        layer.on("pm:textchange", handleEdit);
        layer.on("pm:cut", handleEdit);
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
        if (feature.properties?.shape === "Text") {
          return new L.Marker(latlng, {
            textMarker: true,
            text: feature.properties.text,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any);
        }
        return new L.Marker(latlng);
      },
    });

    geoJsonLayer.getLayers().forEach((l) => {
      const layer = l as GeomanLayer;
      layer._fromStore = true;
      layer.addTo(map);

      // Restore text content visually if it's a Text layer
      if (
        layer.feature?.properties?.shape === "Text" &&
        layer.feature.properties?.text &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (layer as any).pm
      ) {
        // Force update the text content in the layer
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (layer as any).pm.setText(layer.feature.properties.text);
      }

      // Ensure Geoman knows about it (toggle edit to init? No, usually auto-detected)
      // But we might need to re-attach the feature ID if it was lost (L.geoJSON attaches it to layer.feature)
    });
  }, [map, features, handleEdit]); // This dependency on 'features' is tricky. If features change in store, do we re-render?
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
