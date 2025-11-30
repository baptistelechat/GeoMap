import * as L from "leaflet";
import "leaflet-minimap";
import "leaflet-minimap/dist/Control.MiniMap.min.css";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function MiniMapControl() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Créer une couche de tuiles spécifique pour la minimap
    const miniMapLayer = new L.TileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        minZoom: 0,
        maxZoom: 13,
        attribution: "", // Pas besoin de dupliquer l'attribution
      }
    );

    const miniMap = new L.Control.MiniMap(miniMapLayer, {
      toggleDisplay: true,
      minimized: false,
      position: "bottomright",
      width: 150,
      height: 150,
      zoomLevelOffset: -5,
      aimingRectOptions: {
        color: "var(--primary)", // Utilise la couleur primaire de l'application
        weight: 2,
        interactive: false,
      },
      shadowRectOptions: {
        color: "var(--muted-foreground)",
        weight: 1,
        interactive: false,
        opacity: 0,
        fillOpacity: 0,
      },
      strings: {
        hideText: "Masquer la mini-carte",
        showText: "Afficher la mini-carte",
      },
    });

    miniMap.addTo(map);

    return () => {
      miniMap.remove();
    };
  }, [map]);

  return null;
}
