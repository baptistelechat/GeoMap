import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Indicator } from "@/components/ui/indicator";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import * as L from "leaflet";
import {
  Circle,
  CircleDot,
  Hexagon,
  LucideProps,
  Move,
  RotateCw,
  SplinePointer,
  Square,
  Trash2,
  Type,
  Waypoints,
} from "lucide-react";
import {
  ForwardRefExoticComponent,
  RefAttributes,
  useEffect,
  useState,
} from "react";
import { createRoot, Root } from "react-dom/client";
import { useMap } from "react-leaflet";

interface DrawToolbarProps {
  map: L.Map;
}

interface Tool {
  id: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  title: string;
}

const CREATION_TOOLS: Tool[] = [
  { id: "Line", icon: Waypoints, title: "Dessiner une ligne" },
  { id: "Rectangle", icon: Square, title: "Créer un rectangle" },
  { id: "Polygon", icon: Hexagon, title: "Créer un polygone" },
  { id: "Circle", icon: Circle, title: "Tracer un cercle" },
  { id: "CircleMarker", icon: CircleDot, title: "Placer un Point - Cercle" },
  { id: "Text", icon: Type, title: "Placer un texte" },
];

const EDIT_TOOLS: Tool[] = [
  { id: "edit", icon: SplinePointer, title: "Modifier le tracé" },
  { id: "drag", icon: Move, title: "Déplacer" },
  { id: "rotate", icon: RotateCw, title: "Rotation" },
  { id: "delete", icon: Trash2, title: "Effacer" },
];

export function DrawControl() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const CustomControl = L.Control.extend({
      options: {
        position: "topleft",
      },

      onAdd: function () {
        const container = L.DomUtil.create("div");

        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        const root = createRoot(container);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (container as any)._reactRoot = root;

        root.render(<DrawToolbar map={map} />);

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

function DrawToolbar({ map }: DrawToolbarProps) {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onDrawStart = (e: any) => setActiveTool(e.shape);
    const onDrawEnd = () => setActiveTool(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onGlobalEditModeToggled = (e: any) =>
      setActiveTool(e.enabled ? "edit" : null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onGlobalRemovalModeToggled = (e: any) =>
      setActiveTool(e.enabled ? "delete" : null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onGlobalDragModeToggled = (e: any) =>
      setActiveTool(e.enabled ? "drag" : null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onGlobalRotateModeToggled = (e: any) =>
      setActiveTool(e.enabled ? "rotate" : null);

    map.on("pm:drawstart", onDrawStart);
    map.on("pm:drawend", onDrawEnd);
    map.on("pm:globaleditmodetoggled", onGlobalEditModeToggled);
    map.on("pm:globalremovalmodetoggled", onGlobalRemovalModeToggled);
    map.on("pm:globaldragmodetoggled", onGlobalDragModeToggled);
    map.on("pm:globalrotatemodetoggled", onGlobalRotateModeToggled);

    return () => {
      map.off("pm:drawstart", onDrawStart);
      map.off("pm:drawend", onDrawEnd);
      map.off("pm:globaleditmodetoggled", onGlobalEditModeToggled);
      map.off("pm:globalremovalmodetoggled", onGlobalRemovalModeToggled);
      map.off("pm:globaldragmodetoggled", onGlobalDragModeToggled);
      map.off("pm:globalrotatemodetoggled", onGlobalRotateModeToggled);
    };
  }, [map]);

  const handleToolClick = (toolId: string) => {
    // Helper to safely disable modes
    const safeDisable = () => {
      try {
        if (map.pm.globalDrawModeEnabled()) map.pm.disableDraw();
        if (map.pm.globalEditModeEnabled()) map.pm.disableGlobalEditMode();
        if (map.pm.globalRemovalModeEnabled())
          map.pm.disableGlobalRemovalMode();
        if (map.pm.globalDragModeEnabled()) map.pm.disableGlobalDragMode();
        if (map.pm.globalRotateModeEnabled()) map.pm.disableGlobalRotateMode();
      } catch (e) {
        console.error("Error disabling Geoman modes:", e);
      }
    };

    if (activeTool === toolId) {
      safeDisable();
      return;
    }

    // Reset others
    safeDisable();

    switch (toolId) {
      case "edit":
        map.pm.enableGlobalEditMode();
        break;
      case "delete":
        map.pm.enableGlobalRemovalMode();
        break;
      case "drag":
        map.pm.enableGlobalDragMode();
        break;
      case "rotate":
        map.pm.enableGlobalRotateMode();
        break;
      default:
        map.pm.enableDraw(toolId, {
          snappable: true,
          snapDistance: 20,
          finishOn: null, // Allow finishing by clicking last point (default)
        });
        break;
    }
  };

  const renderButton = (tool: Tool) => {
    const isActive = activeTool === tool.id;
    const Icon = tool.icon;

    return (
      <Button
        key={tool.id}
        variant="outline"
        size="icon"
        className="relative transition-none"
        title={tool.title}
        onClick={() => handleToolClick(tool.id)}
      >
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            />
          )}
        </AnimatePresence>

        <div className="relative z-10">
          <Icon
            className={cn(
              "transition-colors duration-200",
              isActive ? "text-primary" : ""
            )}
          />
        </div>

        <Indicator isVisible={isActive} />
      </Button>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <ButtonGroup orientation="vertical">
        {/* Creation Tools */}
        {CREATION_TOOLS.map(renderButton)}
      </ButtonGroup>

      <ButtonGroup orientation="vertical">
        {/* Edit Tools */}
        {EDIT_TOOLS.map(renderButton)}
      </ButtonGroup>
    </div>
  );
}
