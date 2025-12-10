import { primaryColor } from "@/constants/tailwindThemeColor";
import { useGeomarkStore } from "@/store/geomarkStore";
import { MapPoint } from "@/types/map";
import "@/vendor/SmoothWheelZoom.js";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { memo, useEffect, useRef } from "react";
import { renderToString } from "react-dom/server";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { GeomanControl } from "./control/GeomanControl";
import { LocateControl } from "./control/LocateControl";
import { ZoomControl } from "./control/ZoomControl";
import MapController from "./MapController";
import { MarkerIcon } from "./MarkerIcon";
import { MiniMapControl } from "./MiniMapControl";
import { MarkerPopup } from "./popup/MarkerPopup";
import { VisibilityControl } from "./VisibilityControl";

// Fix for legacy plugins that expect L to be global
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).L = L;
}

const MapEvents = () => {
  const { setHighlightedId } = useGeomarkStore();
  useMapEvents({
    click: (e) => {
      if (e.originalEvent.defaultPrevented) return;
      setHighlightedId(null);
    },
  });
  return null;
};

const iconCache = new Map<string, L.DivIcon>();

const getIcon = (iconName: string, color: string, isHighlighted: boolean) => {
  const key = `${iconName}-${color}-${isHighlighted}`;
  if (iconCache.has(key)) {
    return iconCache.get(key)!;
  }

  const icon = L.divIcon({
    html: renderToString(
      <MarkerIcon
        iconName={iconName}
        color={color}
        className={`w-8 h-8 ${isHighlighted ? "animate-bounce" : ""}`}
      />
    ),
    className: "bg-transparent",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

  iconCache.set(key, icon);
  return icon;
};

const MapMarker = memo(
  ({
    point,
    isHighlighted,
    onClick,
  }: {
    point: MapPoint;
    isHighlighted: boolean;
    onClick: (id: string) => void;
  }) => {
    const icon = getIcon(point.icon, point.color, isHighlighted);
    const markerRef = useRef<L.Marker>(null);

    useEffect(() => {
      if (markerRef.current) {
        // Attach point data to the marker for Geoman to access
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (markerRef.current as any).pointData = point;

        // Disable Geoman dragging for this marker
        if (markerRef.current.pm) {
          markerRef.current.pm.setOptions({ draggable: false });
        }
      }
    }, [point]);

    return (
      <Marker
        ref={markerRef}
        position={[point.lat, point.lng]}
        icon={icon}
        eventHandlers={{
          click: (e) => {
            L.DomEvent.stopPropagation(e.originalEvent);
            onClick(point.id);
          },
        }}
      >
        <Popup maxWidth={500} minWidth={300}>
          <MarkerPopup point={point} />
        </Popup>
      </Marker>
    );
  },
  (prev, next) => {
    return (
      prev.isHighlighted === next.isHighlighted &&
      prev.point.id === next.point.id &&
      prev.point.lat === next.point.lat &&
      prev.point.lng === next.point.lng &&
      prev.point.icon === next.point.icon &&
      prev.point.color === next.point.color &&
      prev.point.title === next.point.title &&
      prev.point.notes === next.point.notes
    );
  }
);

MapMarker.displayName = "MapMarker";

export function MapView() {
  const { points, highlightedId, setHighlightedId, showPoints } =
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
        preferCanvas={true} // Use Canvas renderer for better performance with many markers
        zoomControl={false}
      >
        <MapController />
        <MapEvents />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {showPoints && (
          <MarkerClusterGroup
            chunkedLoading
            polygonOptions={{
              fillColor: primaryColor,
              color: primaryColor,
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
              <MapMarker
                key={point.id}
                point={point}
                isHighlighted={point.id === highlightedId}
                onClick={setHighlightedId}
              />
            ))}
          </MarkerClusterGroup>
        )}
        <MiniMapControl />
        <ZoomControl />
        <GeomanControl />
        <LocateControl />
        <VisibilityControl />
      </MapContainer>
    </div>
  );
}
