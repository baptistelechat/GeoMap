import { useGeomarkStore } from "@/store/geomarkStore";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

// Component to handle map actions from store (like flying to a location)
const MapController = () => {
  const map = useMap();
  const { flyToLocation, setFlyToLocation } = useGeomarkStore();

  useEffect(() => {
    if (flyToLocation) {
      map.flyTo(
        [flyToLocation.lat, flyToLocation.lng],
        flyToLocation.zoom || 16,
        {
          animate: true,
          duration: 1.5,
        }
      );
      // Reset state to allow re-triggering the same point if needed
      setFlyToLocation(null);
    }
  }, [flyToLocation, map, setFlyToLocation]);

  return null;
};

export default MapController;
