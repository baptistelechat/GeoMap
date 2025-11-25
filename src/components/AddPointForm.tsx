import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePointsStore } from "@/store/pointsStore";
import { MapPoint } from "@/types/map";
import { useState } from "react";

export function AddPointForm({ onSuccess }: { onSuccess?: () => void }) {
  const { addPoint } = usePointsStore();
  const [formData, setFormData] = useState({
    title: "",
    lat: "",
    lng: "",
    notes: "",
    streetViewUrl: "",
  });

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

    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full gap-3 p-2">
      <div className="space-y-1">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          type="text"
          placeholder="Ex: Tour Eiffel"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            type="number"
            step="any"
            placeholder="Ex: 48.8584"
            value={formData.lat}
            onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            type="number"
            step="any"
            placeholder="Ex: 2.2945"
            value={formData.lng}
            onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Ex: Superbe vue depuis le Trocadéro..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="h-20 resize-none"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="streetViewUrl">URL Street View</Label>
        <Input
          id="streetViewUrl"
          type="url"
          placeholder="Ex: https://www.google.com/maps/..."
          value={formData.streetViewUrl}
          onChange={(e) =>
            setFormData({ ...formData, streetViewUrl: e.target.value })
          }
        />
      </div>
      <div className="mt-auto pt-4">
        <Button type="submit" className="w-full">
          Ajouter le point
        </Button>
      </div>
    </form>
  );
}
