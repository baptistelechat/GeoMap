import { usePointsStore } from "@/store/pointsStore";
import { DivIcon, Icon, Point } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MarkerPopup } from "./MarkerPopup";
import { MiniMapControl } from "./MiniMapControl";

const customIcon = new Icon({
  iconUrl:
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTQwYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjEgMTBjMCA3LTkgMTMtOSAxM3MtOS02LTktMTNhOSA5IDAgMCAxIDE4IDB6Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMCIgcj0iMyIvPjwvc3ZnPg==",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

export function MapView() {
  const { points } = usePointsStore();

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={[46.603354, 1.888334]}
        zoom={6}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={(cluster) => {
            const count = cluster.getChildCount();
            // Simple custom icon for cluster
            return new DivIcon({
              html: `<div class="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full font-bold border-2 border-white shadow-lg">${count}</div>`,
              className: "custom-marker-cluster",
              iconSize: new Point(40, 40),
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
      </MapContainer>
    </div>
  );
}
