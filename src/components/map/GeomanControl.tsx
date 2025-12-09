import { primaryColor } from "@/constants/tailwindThemeColor";
import { SHAPE_NAMES } from "@/lib/map";
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
import { FeaturesActionDialog } from "../dialogs/FeaturesActionDialog";
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

const GEOMAN_STYLE = {
  color: primaryColor,
  fillColor: primaryColor,
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
    updateFeature,
    removeFeature,
    addFeature,
    highlightedId,
    setHighlightedId,
  } = useGeomarkStore();
  const isInitialized = useRef(false);
  const [pointToDelete, setPointToDelete] = useState<MapPoint | null>(null);
  const [featureToDelete, setFeatureToDelete] = useState<Feature | null>(null);

  // Creation state
  const [creationDialogOpen, setCreationDialogOpen] = useState(false);
  const [pendingFeature, setPendingFeature] = useState<Feature | null>(null);
  const [pendingLayer, setPendingLayer] = useState<GeomanLayer | null>(null);
  const [pendingShapeType, setPendingShapeType] = useState<string>("");

  // Keep track of highlightedId in a ref to avoid stale closures in event listeners

  const highlightedIdRef = useRef(highlightedId);
  useEffect(() => {
    highlightedIdRef.current = highlightedId;
  }, [highlightedId]);

  const featuresRef = useRef(features);
  useEffect(() => {
    featuresRef.current = features;
  }, [features]);

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
          geoJson.properties.name = text;
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
        color: primaryColor,
      },
      // Style for the dashed line to the mouse cursor (hintline)
      hintlineStyle: {
        color: primaryColor,
        dashArray: [5, 5],
      },
      // Keep drawing mode enabled after creation
      continueDrawing: true,
    });

    // Listeners
    map.on("pm:create", (e) => {
      const event = e as PmEvent;
      const layer = event.layer;
      // If the layer already has an ID (from our loading logic), don't recreate it
      if (layer._fromStore) return;

      const shape = event.shape || "Marker"; // e.g. 'Marker', 'Circle'

      // Create a unique ID
      const id = generateId();

      const geoJson = layer.toGeoJSON();
      if (!geoJson.properties) geoJson.properties = {};

      const now = Date.now();
      geoJson.properties.id = id;
      geoJson.properties.shape = shape;
      geoJson.properties.createdAt = now;
      geoJson.properties.updatedAt = now;
      geoJson.properties.color = primaryColor;

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

      // Generate Name
      const usedNames = featuresRef.current
        .map((f) => f.properties?.name)
        .filter(Boolean);
      const baseName = SHAPE_NAMES[shape] || shape;
      let counter = 1;
      let name = `${baseName} ${counter}`;

      // Case insensitive check
      while (usedNames.some((n) => n.toLowerCase() === name.toLowerCase())) {
        counter++;
        name = `${baseName} ${counter}`;
      }
      geoJson.properties.name = name;

      // Ensure Text has text property if it was empty
      if (shape === "Text" && !geoJson.properties.text) {
        geoJson.properties.text = name;
        // Also update the layer text if possible
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((layer as any).pm && (layer as any).pm.setText) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (layer as any).pm.setText(name);
        }
      }

      // Attach ID to layer for future reference
      layer.feature = geoJson;
      // We don't mark it as _fromStore yet because it's not in the store.
      // But we need to identify it so we don't double-process it?
      // Actually, if we open dialog, we haven't added it to store.
      // So layer._fromStore should be false or undefined.

      // Store pending data and open dialog
      setPendingFeature(geoJson);
      setPendingLayer(layer);
      setPendingShapeType(shape || "Forme");
      setCreationDialogOpen(true);
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
  }, [map, removeFeature, addFeature, handleEdit, handleLayerClick]);

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
          style: (feature) => {
            const color = feature?.properties?.color || primaryColor;
            return {
              ...GEOMAN_STYLE,
              color,
              fillColor: color,
            };
          },
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

  // Update styles and properties based on store changes and highlighted feature
  useEffect(() => {
    map.eachLayer((l) => {
      const layer = l as GeomanLayer;
      const id = layer.feature?.properties?.id;
      if (!id) return;

      // Get up-to-date feature from store
      const feature = features.find((f) => f.properties?.id === id);
      if (!feature) return;

      // Update layer.feature reference
      if (layer.feature !== feature) {
        layer.feature = feature;
      }

      const isHighlighted = id === highlightedId;
      const color = feature.properties?.color || primaryColor;

      const style = {
        ...GEOMAN_STYLE,
        color,
        fillColor: color,
      };

      const highlightStyle = {
        ...HIGHLIGHT_STYLE,
        color,
        fillColor: color,
      };

      // Handle Style (Path)
      if (layer instanceof L.Path) {
        if (isHighlighted) {
          layer.setStyle(highlightStyle);
        } else {
          layer.setStyle(style);
        }
      }

      // Handle Text Content Update
      const isText = feature.properties?.shape === "Text";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (isText && (layer as any).pm) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pm = (layer as any).pm;
        const text = feature.properties?.text || feature.properties?.name;
        if (text && pm.getText && pm.getText() !== text) {
          pm.setText(text);
        }
      }

      // Handle Class (Animation)
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
  }, [highlightedId, map, features]);

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
      <FeaturesActionDialog
        open={creationDialogOpen}
        onOpenChange={(open) => {
          setCreationDialogOpen(open);
          // If closed without saving (cancelled), remove the pending layer
          if (!open) {
            if (pendingLayer) {
              map.removeLayer(pendingLayer);
            }
            setPendingFeature(null);
            setPendingLayer(null);
          }
        }}
        shapeType={pendingShapeType}
        feature={pendingFeature || undefined}
        isNew={true}
        onSuccess={() => {
          // Saved successfully, clear pending state so onOpenChange doesn't remove the layer
          setPendingFeature(null);
          setPendingLayer(null);
          setCreationDialogOpen(false);
        }}
      />
    </>
  );
}
