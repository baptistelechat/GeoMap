import { LocateControl as Locate } from "leaflet.locatecontrol";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function LocateControl() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const locateControl = new Locate({
      position: "topleft",
      flyTo: true,
      strings: {
        title: "Me localiser",
        popup: "Vous êtes ici",
      },
      locateOptions: {
        enableHighAccuracy: true,
        maxZoom: 16,
      },
      // Style options to match the app theme
      circleStyle: {
        color: "var(--primary)",
        fillColor: "var(--primary)",
        fillOpacity: 0.2,
        weight: 2,
      },
      markerStyle: {
        color: "var(--primary)",
        fillColor: "var(--primary)",
      },
    });

    locateControl.addTo(map);

    return () => {
      locateControl.remove();
    };
  }, [map]);

  return null;
}
