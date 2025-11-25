import { Button } from "@/components/ui/button";
import { usePointsStore } from "@/store/pointsStore";
import { MapPoint } from "@/types/map";
import { exportToCSV, exportToJSON } from "@/utils/export";
import { Download, ExternalLink, MapPin, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { StreetViewFrame } from "./StreetViewFrame";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

export function Sidebar() {
  const { points, addPoint, removePoint } = usePointsStore();
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

    // Reset form
    setFormData({
      title: "",
      lat: "",
      lng: "",
      notes: "",
      streetViewUrl: "",
    });
  };

  const handleExportCSV = () => {
    exportToCSV(points);
  };

  const handleExportJSON = () => {
    exportToJSON(points);
  };

  return (
    <div className="w-80 bg-white shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MapPin className="text-blue-600" />
            GeoMark
          </h1>
          <Link
            to="/export"
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Page d'export"
          >
            <ExternalLink size={20} />
          </Link>
        </div>
        <p className="text-sm text-gray-600 mt-1">Gérez vos points d'intérêt</p>
      </div>

      {/* Formulaire */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Plus className="text-green-600" />
          Ajouter un point
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              type="text"
              placeholder="Ex: Tour Eiffel"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
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
                onChange={(e) =>
                  setFormData({ ...formData, lat: e.target.value })
                }
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
                onChange={(e) =>
                  setFormData({ ...formData, lng: e.target.value })
                }
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
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
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
          <Button type="submit" className="w-full">
            Ajouter le point
          </Button>
        </form>
      </div>

      {/* Liste des points */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Points ({points.length})
          </h2>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportCSV}
              disabled={points.length === 0}
              title="Exporter en CSV"
            >
              <Download size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleExportJSON}
              disabled={points.length === 0}
              title="Exporter en JSON"
            >
              <Download size={16} />
            </Button>
          </div>
        </div>

        {points.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            Aucun point ajouté
          </p>
        ) : (
          <div className="space-y-3">
            {points.map((point) => (
              <div
                key={point.id}
                className="bg-gray-50 rounded-lg p-3 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-800 text-sm">
                    {point.title}
                  </h3>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removePoint(point.id)}
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>

                {point.streetViewUrl && (
                  <div className="mb-2">
                    <StreetViewFrame
                      url={point.streetViewUrl}
                      title={point.title}
                    />
                  </div>
                )}

                {point.notes && (
                  <p className="text-xs text-gray-600 mb-2">{point.notes}</p>
                )}

                <div className="text-xs text-gray-500">
                  <p>Lat: {point.lat.toFixed(6)}</p>
                  <p>Lng: {point.lng.toFixed(6)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
