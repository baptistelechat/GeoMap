import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { usePointsStore } from "@/store/pointsStore";
import { MapPoint } from "@/types/map";
import { useEffect, useState } from "react";

export function AddPointForm({ onSuccess }: { onSuccess?: () => void }) {
  const { addPoint } = usePointsStore();
  const [isManualCoords, setIsManualCoords] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    lat: "",
    lng: "",
    notes: "",
    streetViewUrl: "",
  });

  // Extraction automatique des coordonnées depuis l'URL Google Maps
  useEffect(() => {
    if (!isManualCoords && formData.streetViewUrl) {
      // Patterns courants pour les URLs Google Maps
      // 1. @lat,lng
      // 2. !3dlat!4dlng (pour les embeds ou certaines URLs)
      const atMatch = formData.streetViewUrl.match(
        /@(-?\d+\.\d+),(-?\d+\.\d+)/
      );
      const dataMatch = formData.streetViewUrl.match(
        /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/
      );

      if (atMatch) {
        setFormData((prev) => ({ ...prev, lat: atMatch[1], lng: atMatch[2] }));
      } else if (dataMatch) {
        setFormData((prev) => ({
          ...prev,
          lat: dataMatch[1],
          lng: dataMatch[2],
        }));
      }
    }
  }, [formData.streetViewUrl, isManualCoords]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.lat || !formData.lng) {
      return;
    }

    const newPoint: MapPoint = {
      id: crypto.randomUUID(),
      title: formData.title,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      notes: formData.notes || undefined,
      streetViewUrl: formData.streetViewUrl || undefined,
      createdAt: Date.now(),
    };

    addPoint(newPoint);

    setFormData({
      title: "",
      lat: "",
      lng: "",
      notes: "",
      streetViewUrl: "",
    });
    setIsManualCoords(false);

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full gap-4 px-2">
      <div className="space-y-2">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          type="text"
          placeholder="Tour Eiffel"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Superbe vue depuis le Trocadéro..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="h-20 resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="streetViewUrl">URL Street View</Label>
        <Input
          id="streetViewUrl"
          type="url"
          placeholder="https://www.google.com/maps/..."
          value={formData.streetViewUrl}
          onChange={(e) =>
            setFormData({ ...formData, streetViewUrl: e.target.value })
          }
        />
        <p className="text-xs text-muted-foreground">
          Collez une URL Google Maps pour remplir automatiquement les
          coordonnées.
        </p>
      </div>

      <div className="space-y-4 pt-2 border-t">
        <div className="flex items-center justify-between">
          <Label htmlFor="manual-mode" className="cursor-pointer">
            Coordonnées manuelles
          </Label>
          <Switch
            id="manual-mode"
            checked={isManualCoords}
            onCheckedChange={setIsManualCoords}
          />
        </div>

        <div
          className={`grid grid-cols-2 gap-2 transition-opacity ${
            !isManualCoords ? "opacity-50" : ""
          }`}
        >
          <div className="space-y-2">
            <Label htmlFor="lat">
              Latitude
            </Label>
            <Input
              id="lat"
              type="number"
              step="any"
              placeholder="48.8584"
              value={formData.lat}
              onChange={(e) =>
                setFormData({ ...formData, lat: e.target.value })
              }
              required
              disabled={!isManualCoords}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lng">Longitude</Label>
            <Input
              id="lng"
              type="number"
              step="any"
              placeholder="2.2945"
              value={formData.lng}
              onChange={(e) =>
                setFormData({ ...formData, lng: e.target.value })
              }
              required
              disabled={!isManualCoords}
            />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4">
        <Button type="submit" className="w-full">
          Ajouter le point
        </Button>
      </div>
    </form>
  );
}
