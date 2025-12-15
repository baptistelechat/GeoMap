import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for legacy plugins that expect L to be global (like leaflet-geoman)
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).L = L;
}
