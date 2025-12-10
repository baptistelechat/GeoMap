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
import { AnimatePresence, motion } from "framer-motion";
import * as L from "leaflet";
import { Layers, MapPin, Shapes } from "lucide-react";
import { useEffect } from "react";
import { createRoot, Root } from "react-dom/client";
import { useMap } from "react-leaflet";

export function VisibilityControl() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const CustomControl = L.Control.extend({
      options: {
        position: "topleft",
      },

      onAdd: function () {
        const container = L.DomUtil.create(
          "div",
          "leaflet-bar leaflet-control"
        );

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
        <Button
          variant="ghost"
          size="icon"
          className="h-[30px] w-[30px] rounded-none bg-white hover:bg-gray-50 p-0 relative"
          title="Gérer l'affichage"
        >
          <motion.div
            animate={{ color: hasHiddenLayers ? primaryColor : "#000000" }}
            transition={{ duration: 0.3 }}
          >
            <Layers className="size-4" />
          </motion.div>
          <AnimatePresence>
            {hasHiddenLayers && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute top-1 right-1 flex size-2"
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="right"
        sideOffset={10}
        className="z-[1001]"
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
