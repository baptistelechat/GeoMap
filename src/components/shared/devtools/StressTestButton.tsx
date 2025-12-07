import { AVAILABLE_ICONS } from "@/components/map/MarkerIcon";
import { Button } from "@/components/ui/button";
import { generateId } from "@/lib/utils";
import { useGeomarkStore } from "@/store/geomarkStore";
import { MapPoint } from "@/types/map";
import { toast } from "sonner";

export function StressTestButton({
  className,
  variant = "outline",
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { importData } = useGeomarkStore();

  const generateStressPoints = () => {
    const pointsCount = 2000;
    const points: MapPoint[] = [];
    
    // Bounding box France Métropolitaine (approx)
    const bounds = {
      minLat: 41.3,
      maxLat: 51.1,
      minLng: -5.1,
      maxLng: 9.6,
    };

    const startTime = performance.now();

    for (let i = 0; i < pointsCount; i++) {
      const lat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);
      const lng = bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng);

      points.push({
        id: generateId(),
        title: `Stress Point ${i + 1}`,
        lat,
        lng,
        notes: "Point de stress test généré aléatoirement",
        url: "",
        color: "#ef4444", // Red-500 for stress points
        icon: AVAILABLE_ICONS[0].name, // Pin
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Use importData for batch update to avoid performance issues
    importData(points, []);
    
    const duration = (performance.now() - startTime).toFixed(0);
    toast.success(`${pointsCount} points générés en ${duration}ms`);
  };

  return (
    <Button
      variant={variant}
      className={className ?? "w-full justify-start gap-2 p-6"}
      onClick={generateStressPoints}
      title="Générer 2000 points aléatoires en France (Stress Test)"
      {...props}
    >
      {children}
    </Button>
  );
}
