import { generateId } from "@/lib/utils";
import { useGeomarkStore } from "@/store/geomarkStore";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import { area as turfArea } from "@turf/area";
import { length as turfLength } from "@turf/length";
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

const themeColor = "#65a30d"; // lime-600

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

  // Function to calculate and show measurement on click
  const handleLayerClick = (e: L.LeafletMouseEvent) => {
    const layer = e.target as GeomanLayer;
    const geoJson = layer.toGeoJSON();

    const title = "Mesures";
    let content = "";

    if (geoJson.geometry.type === "LineString") {
      const len = turfLength(geoJson, { units: "meters" });
      const lenKm = turfLength(geoJson, { units: "kilometers" });
      content = `
        <div class="text-sm font-semibold">${title}</div>
        <div>Longueur: ${
          len < 1000 ? `${len.toFixed(2)} m` : `${lenKm.toFixed(2)} km`
        }</div>
      `;
    } else if (
      geoJson.geometry.type === "Polygon" ||
      geoJson.geometry.type === "MultiPolygon"
    ) {
      const a = turfArea(geoJson); // m²
      const aHectare = a / 10000;

      const perim = turfLength(geoJson, { units: "meters" });
      const perimKm = turfLength(geoJson, { units: "kilometers" });

      content = `
        <div class="text-sm font-semibold">${title}</div>
        <div>Surface: ${
          a < 10000 ? `${a.toFixed(2)} m²` : `${aHectare.toFixed(2)} ha`
        }</div>
        <div>Périmètre: ${
          perim < 1000 ? `${perim.toFixed(2)} m` : `${perimKm.toFixed(2)} km`
        }</div>
      `;
    } else if (layer instanceof L.Circle) {
      const radius = layer.getRadius();
      const areaCircle = Math.PI * radius * radius;
      const perimeterCircle = 2 * Math.PI * radius;
      const areaHectare = areaCircle / 10000;

      content = `
        <div class="text-sm font-semibold">${title}</div>
        <div>Rayon: ${radius.toFixed(2)} m</div>
        <div>Surface: ${
          areaCircle < 10000
            ? `${areaCircle.toFixed(2)} m²`
            : `${areaHectare.toFixed(2)} ha`
        }</div>
        <div>Circonférence: ${perimeterCircle.toFixed(2)} m</div>
      `;
    }

    if (content) {
      L.popup().setLatLng(e.latlng).setContent(content).openOn(e.target._map);
    }
  };

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

      // Add event listeners to this new layer for edit
      layer.on("pm:edit", handleEdit);
      layer.on("pm:dragend", handleEdit);
      layer.on("pm:markerdragend", handleEdit);
      layer.on("pm:rotateend", handleEdit);
      layer.on("pm:textchange", handleEdit);
      layer.on("pm:cut", handleEdit);

      // Add click listener for measurement
      layer.on("click", handleLayerClick);
    });

    map.on("pm:remove", (e) => {
      const event = e as PmEvent;
      const layer = event.layer;
      const id = layer.feature?.properties?.id;
      if (id) {
        removeFeature(id);
      }
    });

    return () => {};
  }, [map, addFeature, removeFeature, handleEdit]);

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

      L.geoJSON(feature as GeoJsonObject, {
        style: () => GEOMAN_STYLE,
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
    });
  }, [features, map, handleEdit]);

  return null;
}
