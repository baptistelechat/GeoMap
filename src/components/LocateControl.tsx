import * as L from "leaflet";
import { Loader2, Locate } from "lucide-react";
import { useEffect, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import { Circle, Marker, Popup, useMap } from "react-leaflet";

// Custom icon for user location (Primary color dot with white border)
const locationIcon = new L.DivIcon({
  html: `
    <div class="relative flex items-center justify-center w-full h-full">
      <div class="absolute w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg animate-pulse"></div>
      <div class="absolute w-4 h-4 bg-primary rounded-full opacity-20 animate-ping"></div>
    </div>
  `,
  className: "custom-user-location-marker",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export function LocateControl() {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  // Configuration: Disable large circle by default as requested
  const SHOW_ACCURACY_CIRCLE = false;

  useEffect(() => {
    if (!map) return;

    // Create a custom Leaflet Control
    const CustomControl = L.Control.extend({
      options: {
        position: "topleft",
      },

      onAdd: function () {
        const container = L.DomUtil.create(
          "div",
          "leaflet-bar leaflet-control flex flex-col"
        );

        // Prevent map clicks/scrolls through the control
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        // Use React to render the button inside the Leaflet control container
        const root = createRoot(container);

        // For simplicity and robustness, we'll render a component that triggers the parent's logic
        root.render(
          <LocateButton
            onClick={() => {
              renderButton(container, true);
              map.locate({
                setView: false,
                enableHighAccuracy: true,
                maxZoom: 18,
              });
            }}
            isLoading={false}
          />
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (container as any)._reactRoot = root;

        return container;
      },

      onRemove: function () {
        const container = this.getContainer();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (container && (container as any)._reactRoot) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const root = (container as any)._reactRoot as Root;
          // Defer unmount to avoid React warning about synchronous unmount during render
          setTimeout(() => {
            root.unmount();
          }, 0);
        }
      },
    });

    const control = new CustomControl();
    map.addControl(control);

    // Event handlers
    const onLocationFound = (e: L.LocationEvent) => {
      setPosition(e.latlng);
      setAccuracy(e.accuracy);
      map.flyTo(e.latlng, 16);
      renderButton(control.getContainer(), false);
    };

    const onLocationError = async (e: L.ErrorEvent) => {
      console.warn("GPS failed, attempting IP fallback...", e.message);

      try {
        // Fallback : Géolocalisation IP (fonctionne en HTTP)
        // Note: ip-api.com est gratuit pour usage non-commercial (45 req/min)
        const res = await fetch("http://ip-api.com/json/");
        const data = await res.json();

        if (data.status === "success") {
          const latlng = new L.LatLng(data.lat, data.lon);

          setPosition(latlng);
          setAccuracy(5000); // Précision arbitraire "ville"

          map.flyTo(latlng, 13);

          // Feedback utilisateur
          alert(
            "⚠️ Localisation GPS impossible (connexion non sécurisée).\n\n" +
              "Une position approximative basée sur votre adresse IP a été utilisée."
          );
        } else {
          throw new Error("IP Geolocation failed");
        }
      } catch (err) {
        console.error("Fallback failed:", err);
        alert(
          "Impossible de vous localiser.\n\n" +
            "Le GPS nécessite HTTPS et la localisation IP a échoué."
        );
      } finally {
        renderButton(control.getContainer(), false);
      }
    };

    // Helper to re-render button
    const renderButton = (
      container: HTMLElement | undefined,
      loading: boolean
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!container || !(container as any)._reactRoot) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((container as any)._reactRoot as Root).render(
        <LocateButton
          onClick={() => {
            renderButton(container, true);
            map.locate({
              setView: false,
              enableHighAccuracy: true,
              maxZoom: 18,
            });
          }}
          isLoading={loading}
        />
      );
    };

    map.on("locationfound", onLocationFound);
    map.on("locationerror", onLocationError);

    return () => {
      map.removeControl(control);
      map.off("locationfound", onLocationFound);
      map.off("locationerror", onLocationError);
    };
  }, [map]);

  return (
    <>
      {position && (
        <>
          <Marker position={position} icon={locationIcon}>
            <Popup>Vous êtes ici</Popup>
          </Marker>
          {SHOW_ACCURACY_CIRCLE && accuracy && (
            <Circle
              center={position}
              radius={accuracy}
              pathOptions={{
                color: "var(--primary)",
                fillColor: "var(--primary)",
                fillOpacity: 0.1,
                weight: 1,
                opacity: 0.5,
              }}
            />
          )}
        </>
      )}
    </>
  );
}

// Isolated Button Component
function LocateButton({
  onClick,
  isLoading,
}: {
  onClick: () => void;
  isLoading: boolean;
}) {
  return (
    <a
      className="leaflet-control-locate flex items-center justify-center bg-white hover:bg-gray-50 text-black cursor-pointer"
      href="#"
      title="Me localiser"
      role="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      style={{
        width: "30px",
        height: "30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: "none",
      }}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
      ) : (
        <Locate className="h-4 w-4 text-black" />
      )}
    </a>
  );
}
