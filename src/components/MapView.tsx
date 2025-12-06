import { MarkerIcon } from "@/components/MarkerIcon";
import { useGeomarkStore } from "@/store/geomarkStore";
import { MapPoint } from "@/types/map";
import "@/vendor/SmoothWheelZoom.js";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToString } from "react-dom/server";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { GeomanControl } from "./GeomanControl";
import { LocateControl } from "./LocateControl";
import MapController from "./MapController";
import { MarkerPopup } from "./MarkerPopup";
import { MiniMapControl } from "./MiniMapControl";

// Fix for legacy plugins that expect L to be global
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).L = L;
}

const createCustomIcon = (point: MapPoint, isHighlighted: boolean) => {
  return L.divIcon({
    html: renderToString(
      <MarkerIcon
        iconName={point.icon}
        color={point.color}
        className={`w-8 h-8 ${isHighlighted ? "animate-bounce" : ""}`}
      />
    ),
    className: "bg-transparent",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export function MapView() {
  const { points, highlightedPointId, setHighlightedPointId } =
    useGeomarkStore();

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
        <MapController />
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
              icon={createCustomIcon(point, point.id === highlightedPointId)}
              eventHandlers={{
                click: () => setHighlightedPointId(point.id),
              }}
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
