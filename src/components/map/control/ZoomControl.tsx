import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import * as L from "leaflet";
import { Minus, Plus } from "lucide-react";
import { useEffect } from "react";
import { createRoot, Root } from "react-dom/client";
import { useMap } from "react-leaflet";

export function ZoomControl() {
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

        root.render(<ZoomButtons map={map} />);

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

function ZoomButtons({ map }: { map: L.Map }) {
  return (
    <ButtonGroup orientation="vertical">
      <Button
        variant="outline"
        size="icon"
        onClick={() => map.zoomIn()}
        title="Zoom avant"
      >
        <Plus />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => map.zoomOut()}
        title="Zoom arrière"
      >
        <Minus />
      </Button>
    </ButtonGroup>
  );
}
