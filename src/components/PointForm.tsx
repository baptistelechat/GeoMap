import { AVAILABLE_ICONS, MarkerIcon } from "@/components/MarkerIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { TAILWIND_COLORS } from "@/lib/tailwindColors";
import { generateId } from "@/lib/utils";
import { useGeomarkStore } from "@/store/geomarkStore";
import { MapPoint } from "@/types/map";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ColorPicker } from "./ColorPicker";

export function PointForm({
  onSuccess,
  point,
}: {
  onSuccess?: () => void;
  point?: MapPoint;
}) {
  const { addPoint, updatePoint, setFlyToLocation, setHighlightedPointId } =
    useGeomarkStore();
  const [isManualCoords, setIsManualCoords] = useState(false);
  const [formData, setFormData] = useState({
    title: point?.title || "",
    lat: point?.lat.toString() || "",
    lng: point?.lng.toString() || "",
    notes: point?.notes || "",
    url: point?.url || "",
    color:
      point?.color ||
      TAILWIND_COLORS.find((c) => c.name === "green")?.shades["500"] ||
      "#22c55e", // Default Green
    icon: point?.icon || AVAILABLE_ICONS[0].name, // Default Pin
  });

  // Update form data if point changes
  useEffect(() => {
    if (point) {
      setFormData({
        title: point.title,
        lat: point.lat.toString(),
        lng: point.lng.toString(),
        notes: point.notes || "",
        url: point.url || "",
        color:
          point?.color ||
          TAILWIND_COLORS.find((c) => c.name === "green")?.shades["500"] ||
          "#22c55e", // Default Green
        icon: point.icon || AVAILABLE_ICONS[0].name,
      });
    }
  }, [point]);

  // Extraction automatique des coordonnées depuis l'URL Google Maps
  useEffect(() => {
    if (!isManualCoords && formData.url) {
      // Patterns courants pour les URLs Google Maps
      // 1. !3dlat!4dlng (coordonnées spécifiques du lieu/marqueur - plus précis pour les lieux)
      const dataMatch = formData.url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);

      // 2. @lat,lng (centre de la vue caméra - courant pour StreetView ou vue générale)
      const atMatch = formData.url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

      if (dataMatch) {
        // Priorité aux données précises du lieu si disponibles
        setFormData((prev) => ({
          ...prev,
          lat: dataMatch[1],
          lng: dataMatch[2],
        }));
      } else if (atMatch) {
        // Fallback sur le centre de la vue
        setFormData((prev) => ({ ...prev, lat: atMatch[1], lng: atMatch[2] }));
      }
    }
  }, [formData.url, isManualCoords]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.lat || !formData.lng) {
      return;
    }

    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return;
    }

    const now = Date.now();
    const newPoint: MapPoint = {
      id: point?.id || generateId(),
      title: formData.title,
      lat,
      lng,
      notes: formData.notes || undefined,
      url: formData.url || undefined,
      color: formData.color,
      icon: formData.icon,
      createdAt: point?.createdAt || now,
      updatedAt: now,
    };

    if (point) {
      updatePoint(newPoint);
      toast.success(`Le point "${newPoint.title}" a été modifié avec succès`);
      // On editing, we want to fly to the point to show the update
      setFlyToLocation({ lat: newPoint.lat, lng: newPoint.lng, zoom: 16 });
      setHighlightedPointId(newPoint.id);
    } else {
      addPoint(newPoint);
      toast.success(`Le point "${newPoint.title}" a été ajouté avec succès`);
      // On creation, we also want to fly to the new point
      setFlyToLocation({ lat: newPoint.lat, lng: newPoint.lng, zoom: 16 });
      setHighlightedPointId(newPoint.id);
    }

    setFormData({
      title: "",
      lat: "",
      lng: "",
      notes: "",
      url: "",
      color: "#22c55e",
      icon: AVAILABLE_ICONS[0].name,
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

      <div className="space-y-3">
        <Label>Apparence</Label>
        <div className="flex flex-col gap-3 p-3 border rounded-lg bg-muted/30">
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <MarkerIcon
                iconName={formData.icon}
                color={formData.color}
                className="w-10 h-10"
              />
            </div>
            <div className="flex-1 space-y-2">
              <ColorPicker
                color={formData.color}
                onChange={(color) => setFormData({ ...formData, color })}
              />
            </div>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {AVAILABLE_ICONS.map((icon) => {
              const Icon = icon.icon;
              return (
                <Button
                  key={icon.name}
                  type="button"
                  variant={formData.icon === icon.name ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-full"
                  onClick={() => setFormData({ ...formData, icon: icon.name })}
                  title={icon.label}
                >
                  <Icon className="size-4" />
                </Button>
              );
            })}
          </div>
        </div>
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
        <Label htmlFor="url">URL Google Maps / Street View</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://www.google.com/maps/..."
          value={formData.url}
          onChange={(e) =>
            setFormData({ ...formData, url: e.target.value })
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
            <Label htmlFor="lat">Latitude</Label>
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
          {point ? "Modifier le point" : "Ajouter le point"}
        </Button>
      </div>
    </form>
  );
}
