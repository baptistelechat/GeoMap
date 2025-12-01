import { useGeomarkStore } from "@/store/geomarkStore";
import "@/vendor/SmoothWheelZoom.js";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { GeomanControl } from "./GeomanControl";
import { LocateControl } from "./LocateControl";
import { MarkerPopup } from "./MarkerPopup";
import { MiniMapControl } from "./MiniMapControl";

// Fix for legacy plugins that expect L to be global
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).L = L;
}

const customIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTQwYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTBjMCA3LTkgMTMtOSAxM3MtOS02LTktMTNhOSA5IDAgMCAxIDE4IDB6Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIvPjwvc3ZnPg==",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

export function MapView() {
  const { points } = useGeomarkStore();

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={[46.603354, 1.888334]}
        zoom={6}
        className="h-full w-full"
        scrollWheelZoom={false} // Disable default scroll wheel zoom
        smoothWheelZoom={true} // Enable smooth scroll wheel zoom
        smoothSensitivity={1} // Adjust sensitivity if needed
      >
        <GeomanControl />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup
          chunkedLoading
          polygonOptions={{
            fillColor: "var(--primary)",
            color: "var(--primary)",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.3,
          }}
          iconCreateFunction={(cluster) => {
            const count = cluster.getChildCount();
            // Simple custom icon for cluster
            return new L.DivIcon({
              html: `<div class="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full font-bold border-2 border-white shadow-lg">${count}</div>`,
              className: "custom-marker-cluster",
              iconSize: new L.Point(40, 40),
            });
          }}
        >
          {points.map((point) => (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={customIcon}
            >
              <Popup>
                <MarkerPopup point={point} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
        <MiniMapControl />
        <LocateControl />
      </MapContainer>
    </div>
  );
}
