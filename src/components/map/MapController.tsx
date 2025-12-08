import { useSidebar } from "@/components/ui/sidebar";
import { useGeomarkStore } from "@/store/geomarkStore";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

const SIDEBAR_WIDTH = 384; // 24rem from sidebar.tsx

// Component to handle map actions from store (like flying to a location)
const MapController = () => {
  const map = useMap();
  const { flyToLocation, setFlyToLocation, flyToBounds, setFlyToBounds } =
    useGeomarkStore();
  const { state, isMobile } = useSidebar();

  // Handle map resize when sidebar toggles
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300); // Wait for transition
    return () => clearTimeout(timer);
  }, [state, map]);

  useEffect(() => {
    if (flyToBounds) {
      let paddingLeft = 0;

      // Adjust for sidebar if expanded and not mobile
      if (!isMobile && state === "expanded") {
        const containerWidth = map.getContainer().clientWidth;
        const windowWidth = window.innerWidth;

        // Only apply offset if map hasn't resized to fit (meaning it's full width)
        if (containerWidth > windowWidth - 100) {
          paddingLeft = SIDEBAR_WIDTH;
        }
      }

      map.flyToBounds(flyToBounds.bounds, {
        paddingTopLeft: [paddingLeft, 0],
        animate: true,
        duration: 1.5,
        maxZoom: flyToBounds.options?.maxZoom,
      });
      setFlyToBounds(null);
    }
  }, [flyToBounds, map, setFlyToBounds, state, isMobile]);

  useEffect(() => {
    if (flyToLocation) {
      const zoom = flyToLocation.zoom || 16;
      let targetLat = flyToLocation.lat;
      let targetLng = flyToLocation.lng;

      // Adjust for sidebar if expanded and not mobile
      // If the map is full width (overlay/underlay), we need to offset the center
      // so the point appears in the visible area (right of the sidebar).
      if (!isMobile && state === "expanded") {
        const containerWidth = map.getContainer().clientWidth;
        const windowWidth = window.innerWidth;

        // Only apply offset if map hasn't resized to fit (meaning it's full width)
        // We use a threshold to account for scrollbars etc.
        if (containerWidth > windowWidth - 100) {
          const offset = SIDEBAR_WIDTH / 2;
          const targetPoint = map.project([targetLat, targetLng], zoom);
          // Shift center LEFT (subtract x) to move point RIGHT
          const newTargetPoint = targetPoint.subtract([offset, 0]);
          const newTargetLatLng = map.unproject(newTargetPoint, zoom);

          targetLat = newTargetLatLng.lat;
          targetLng = newTargetLatLng.lng;
        }
      }

      map.flyTo([targetLat, targetLng], zoom, {
        animate: true,
        duration: 1.5,
      });
      // Reset state to allow re-triggering the same point if needed
      setFlyToLocation(null);
    }
  }, [flyToLocation, map, setFlyToLocation, state, isMobile]);

  return null;
};

export default MapController;
