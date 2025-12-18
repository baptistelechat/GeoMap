import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOnboardingStore } from "@/store/onboardingStore";
import { motion } from "framer-motion";
import * as L from "leaflet";
import { Bug, HelpCircle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { createRoot, Root } from "react-dom/client";
import { useMap } from "react-leaflet";

export function HelpControl() {
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

        root.render(<HelpMenu />);

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

function HelpMenu() {
  const { resetOnboarding } = useOnboardingStore();

  const handleRestartTutorial = () => {
    resetOnboarding();
  };

  const handleReportBug = () => {
    window.open("https://tally.so/r/9qX7DK", "_blank");
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.7 }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" title="Aide & Support">
            <HelpCircle className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="right"
          sideOffset={10}
          className="z-[9999]"
        >
          <DropdownMenuItem
            onClick={handleRestartTutorial}
            className="cursor-pointer gap-2"
          >
            <RotateCcw className="size-4" />
            Relancer le tutoriel
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleReportBug}
            className="cursor-pointer gap-2"
          >
            <Bug className="size-4" />
            Signaler un bug
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
}
