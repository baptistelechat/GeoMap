import { Button } from "@/components/ui/button";
import { usePointsStore } from "@/store/pointsStore";
import { MapPoint } from "@/types/map";
import { Database } from "lucide-react";

export function DevTools() {
  const { addPoint } = usePointsStore();

  const generateTestPoints = () => {
    // Coordonnées de base pour Nantes, Le Mans et Tours
    const centers = {
      nantes: { lat: 47.2184, lng: -1.5536 },
      leMans: { lat: 48.0061, lng: 0.1996 },
      tours: { lat: 47.3941, lng: 0.6848 },
    };

    const points: MapPoint[] = [];

    // Générer 5 points pour Nantes
    for (let i = 0; i < 5; i++) {
      const lat = centers.nantes.lat + (Math.random() - 0.5) * 0.04; // ~2-3km dispersion
      const lng = centers.nantes.lng + (Math.random() - 0.5) * 0.04;

      points.push({
        id: crypto.randomUUID(),
        title: `Nantes Point ${i + 1}`,
        lat,
        lng,
        notes: "Point de test généré automatiquement - Cluster Nantes",
        streetViewUrl: `https://www.google.com/maps/@${lat.toFixed(
          6
        )},${lng.toFixed(6)},3a,75y,90t/data=!3m6!1e1!3m4!1sTEST_ID_${i}!2e0`,
        createdAt: Date.now(),
      });
    }

    // Générer 5 points pour Le Mans
    for (let i = 0; i < 5; i++) {
      const lat = centers.leMans.lat + (Math.random() - 0.5) * 0.04;
      const lng = centers.leMans.lng + (Math.random() - 0.5) * 0.04;

      points.push({
        id: crypto.randomUUID(),
        title: `Le Mans Point ${i + 1}`,
        lat,
        lng,
        notes: "Point de test généré automatiquement - Cluster Le Mans",
        streetViewUrl: `https://www.google.com/maps/@${lat.toFixed(
          6
        )},${lng.toFixed(6)},3a,75y,90t/data=!3m6!1e1!3m4!1sTEST_ID_${
          i + 5
        }!2e0`,
        createdAt: Date.now(),
      });
    }

    // Générer 5 points pour Tours
    for (let i = 0; i < 5; i++) {
      const lat = centers.tours.lat + (Math.random() - 0.5) * 0.04;
      const lng = centers.tours.lng + (Math.random() - 0.5) * 0.04;

      points.push({
        id: crypto.randomUUID(),
        title: `Tours Point ${i + 1}`,
        lat,
        lng,
        notes: "Point de test généré automatiquement - Cluster Tours",
        streetViewUrl: `https://www.google.com/maps/@${lat.toFixed(
          6
        )},${lng.toFixed(6)},3a,75y,90t/data=!3m6!1e1!3m4!1sTEST_ID_${
          i + 10
        }!2e0`,
        createdAt: Date.now(),
      });
    }

    // Ajouter tous les points au store
    points.forEach((point) => addPoint(point));
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full justify-start gap-2"
      onClick={generateTestPoints}
      title="Générer 15 points de test (Nantes, Le Mans & Tours)"
    >
      <Database className="size-4" />
      <span>Générer Données Test</span>
    </Button>
  );
}
