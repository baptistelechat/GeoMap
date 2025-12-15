import * as L from "leaflet";
import "leaflet-minimap";

export interface MiniMapOptions {
  position?: L.ControlPosition;
  width?: number;
  height?: number;
  collapsedWidth?: number;
  collapsedHeight?: number;
  zoomLevelOffset?: number;
  zoomLevelFixed?: number;
  centerFixed?: L.LatLngExpression;
  zoomAnimation?: boolean;
  toggleDisplay?: boolean;
  autoToggleDisplay?: boolean;
  minimized?: boolean;
  aimingRectOptions?: L.PathOptions;
  shadowRectOptions?: L.PathOptions;
  strings?: {
    hideText?: string;
    showText?: string;
  };
}

declare module "leaflet" {
  namespace Control {
    class MiniMap extends Control {
      constructor(layer: L.Layer, options?: MiniMapOptions);
    }
  }
}
