import { generateId } from "@/lib/utils";
import { useGeomarkStore } from "@/store/geomarkStore";
import { MapPoint } from "@/types/map";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import type { Feature, GeoJsonObject } from "geojson";
import * as L from "leaflet";
import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { useMap } from "react-leaflet";
import { DeleteFeatureDialog } from "../dialogs/DeleteFeatureDialog";
import { DeletePointDialog } from "../dialogs/DeletePointDialog";
import { FeaturePopup } from "./FeaturePopup";

// Define custom types to avoid 'any'
interface GeomanLayer extends L.Layer {
  toGeoJSON: () => Feature;
  feature?: Feature;
  _fromStore?: boolean;
  getRadius?: () => number;
  getElement?: () => HTMLElement | undefined;
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

const themeColor = "#65a30d"; // lime-600

const GEOMAN_STYLE = {
  color: themeColor,
  fillColor: themeColor,
  fillOpacity: 0.3,
  weight: 2,
  dashArray: undefined,
};

const HIGHLIGHT_STYLE = {
  ...GEOMAN_STYLE,
  dashArray: "10, 10",
};

export function GeomanControl() {
  const map = useMap();
  const {
    features,
    addFeature,
    updateFeature,
    removeFeature,
    highlightedId,
    setHighlightedId,
  } = useGeomarkStore();
  const isInitialized = useRef(false);
  const [pointToDelete, setPointToDelete] = useState<MapPoint | null>(null);
  const [featureToDelete, setFeatureToDelete] = useState<Feature | null>(null);

  // Keep track of highlightedId in a ref to avoid stale closures in event listeners
  const highlightedIdRef = useRef(highlightedId);
  useEffect(() => {
    highlightedIdRef.current = highlightedId;
  }, [highlightedId]);

  // Function to calculate and show measurement on click
  const handleLayerClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(e.originalEvent);
      // Also prevent default to be safe against some browser behaviors
      L.DomEvent.preventDefault(e.originalEvent);

      const layer = e.target as GeomanLayer;
      const geoJson = layer.toGeoJSON();
      const id = layer.feature?.properties?.id;

      if (id) {
        setHighlightedId(id);
      }

      // Update properties for popup (e.g. radius for Circles)
      if (layer instanceof L.Circle) {
        if (!geoJson.properties) geoJson.properties = {};
        geoJson.properties.radius = layer.getRadius();
        geoJson.properties.shape = "Circle";
      }

      // Use a React component for the popup content
      const container = document.createElement("div");
      const root = createRoot(container);
      root.render(<FeaturePopup feature={geoJson} layer={layer} />);

      const popup = L.popup({ maxWidth: 500, minWidth: 200 })
        .setLatLng(e.latlng)
        .setContent(container)
        .openOn(e.target._map);

      // Clean up React root when popup is closed
      popup.on("remove", () => {
        setTimeout(() => root.unmount(), 0);
      });
    },
    [setHighlightedId]
  );

  // Handle Edit Events

  const handleEdit = useCallback(
    (e: L.LeafletEvent) => {
      const event = e as PmEvent;
      const layer = event.layer || (event.target as GeomanLayer);
      if (!layer || !layer.feature?.properties?.id) return;

      const geoJson = layer.toGeoJSON();
      geoJson.properties = {
        ...layer.feature.properties,
        ...geoJson.properties,
        updatedAt: Date.now(),
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
    },
    [updateFeature]
  );

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
      const id = generateId();

      const geoJson = layer.toGeoJSON();
      if (!geoJson.properties) geoJson.properties = {};

      const now = Date.now();
      geoJson.properties.id = id;
      geoJson.properties.shape = shape;
      geoJson.properties.createdAt = now;
      geoJson.properties.updatedAt = now;

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
      layer.feature.properties.shape = shape;
      layer.feature.properties.createdAt = now;
      layer.feature.properties.updatedAt = now;

      addFeature(geoJson);

      // Remove the layer created by Geoman, so it can be recreated by the store sync with correct options (renderer)
      map.removeLayer(layer);
    });

    map.on("pm:remove", (e) => {
      const event = e as PmEvent;
      const layer = event.layer;

      // Intercept removal if global removal mode is active
      if (map.pm.globalRemovalModeEnabled()) {
        // Cancel removal by re-adding the layer
        layer.addTo(map);

        // Check if it is a Point (Marker)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pointData = (layer as any).pointData as MapPoint;
        if (pointData) {
          setPointToDelete(pointData);
          return;
        }

        // Check if it is a Feature
        const id = layer.feature?.properties?.id;
        if (id) {
          // Ensure feature has all properties
          setFeatureToDelete(layer.feature!);
          return;
        }
      }

      const id = layer.feature?.properties?.id;
      if (id) {
        removeFeature(id);
      }
    });

    return () => {};
  }, [map, addFeature, removeFeature, handleEdit, handleLayerClick]);

  // Sync features from store to map
  useEffect(() => {
    const storeIds = new Set(
      features.map((f) => f.properties?.id).filter(Boolean)
    );

    // Remove layers that are no longer in store
    map.eachLayer((layer) => {
      const l = layer as GeomanLayer;
      const id = l.feature?.properties?.id;
      if (id && !storeIds.has(id)) {
        map.removeLayer(layer);
      }
    });

    // Add layers from store that are not on map
    features.forEach((feature) => {
      const id = feature.properties?.id;
      if (!id) return;

      let exists = false;
      map.eachLayer((layer) => {
        if ((layer as GeomanLayer).feature?.properties?.id === id) {
          exists = true;
        }
      });

      if (exists) return;

      // Force SVG renderer to allow CSS animations on elements
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const svgRenderer = L.svg() as any;

      L.geoJSON(
        feature as GeoJsonObject,
        {
          style: () => GEOMAN_STYLE,
          renderer: svgRenderer,
          onEachFeature: (f, l) => {
            const layer = l as GeomanLayer;
            layer._fromStore = true;
            layer.addTo(map);

            if (
              f.properties?.shape === "Text" &&
              f.properties?.text &&
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (layer as any).pm
            ) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (layer as any).pm.setText(f.properties.text);
            }

            layer.on("pm:edit", handleEdit);
            layer.on("pm:dragend", handleEdit);
            layer.on("pm:markerdragend", handleEdit);
            layer.on("pm:rotateend", handleEdit);
            layer.on("pm:textchange", handleEdit);
            layer.on("pm:cut", handleEdit);
            layer.on("click", handleLayerClick);
          },
          pointToLayer: (feature, latlng) => {
            if (
              feature.properties?.shape === "Circle" &&
              feature.properties?.radius
            ) {
              return new L.Circle(latlng, {
                radius: feature.properties.radius,
                renderer: svgRenderer,
              });
            }
            if (feature.properties?.shape === "CircleMarker") {
              return new L.CircleMarker(latlng, { renderer: svgRenderer });
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
        } as L.GeoJSONOptions & { renderer: unknown }
      );
    });
  }, [features, map, handleEdit, handleLayerClick]);

  // Update styles based on highlighted feature
  useEffect(() => {
    map.eachLayer((l) => {
      const layer = l as GeomanLayer;
      const id = layer.feature?.properties?.id;
      if (!id) return;

      const isHighlighted = id === highlightedId;

      // Handle Style (Path)
      if (layer instanceof L.Path) {
        if (isHighlighted) {
          layer.setStyle(HIGHLIGHT_STYLE);
        } else {
          layer.setStyle(GEOMAN_STYLE);
        }
      }

      // Handle Class (Animation)
      const isText = layer.feature?.properties?.shape === "Text";
      const el = layer.getElement ? layer.getElement() : undefined;
      if (el) {
        // Reset classes
        el.classList.remove("geomark-bounce");
        el.classList.remove("geomark-pulse");

        if (isHighlighted) {
          if (isText) {
            el.classList.add("geomark-bounce");
          } else {
            el.classList.add("geomark-pulse");
          }
        }
      }
    });
  }, [highlightedId, map]);

  return (
    <>
      {pointToDelete && (
        <DeletePointDialog
          point={pointToDelete}
          trigger={<span className="hidden" />}
          open={!!pointToDelete}
          onOpenChange={(open) => !open && setPointToDelete(null)}
        />
      )}
      {featureToDelete && (
        <DeleteFeatureDialog
          feature={featureToDelete}
          trigger={<span className="hidden" />}
          open={!!featureToDelete}
          onOpenChange={(open) => !open && setFeatureToDelete(null)}
        />
      )}
    </>
  );
}
