import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { primaryColor } from "@/constants/tailwindThemeColor";
import { useGeomarkStore } from "@/store/geomarkStore";
import { motion } from "framer-motion";
import * as L from "leaflet";
import { Layers, MapPin, Shapes } from "lucide-react";
import { useEffect } from "react";
import { createRoot, Root } from "react-dom/client";
import { useMap } from "react-leaflet";
import { Indicator } from "../ui/indicator";

export function VisibilityControl() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const CustomControl = L.Control.extend({
      options: {
        position: "topleft",
      },

      onAdd: function () {
        const container = L.DomUtil.create("div");

        // Prevent map clicks/scrolls through the control
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        const root = createRoot(container);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (container as any)._reactRoot = root;

        root.render(<VisibilityMenu />);

        return container;
      },

      onRemove: function () {
        const container = this.getContainer();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (container && (container as any)._reactRoot) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const root = (container as any)._reactRoot as Root;
          setTimeout(() => {
            root.unmount();
          }, 0);
        }
      },
    });

    const control = new CustomControl();
    map.addControl(control);

    return () => {
      map.removeControl(control);
    };
  }, [map]);

  return null;
}

function VisibilityMenu() {
  const { showPoints, setShowPoints, showFeatures, setShowFeatures } =
    useGeomarkStore();

  const hasHiddenLayers = !showPoints || !showFeatures;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" title="Gérer l'affichage">
          <motion.div
            animate={{ color: hasHiddenLayers ? primaryColor : "" }}
            transition={{ duration: 0.3 }}
          >
            <Layers className="size-4" />
          </motion.div>
          <Indicator isVisible={hasHiddenLayers} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="right"
        sideOffset={10}
        className="z-[9999]"
      >
        <DropdownMenuLabel>Calques</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={showPoints}
          onCheckedChange={setShowPoints}
          className="flex gap-2 justify-between"
        >
          Points
          <MapPin className="size-4 text-primary" />
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showFeatures}
          onCheckedChange={setShowFeatures}
          className="flex gap-2 justify-between"
        >
          Formes
          <Shapes className="size-4 text-primary" />
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
