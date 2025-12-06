import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGeomarkStore } from "@/store/geomarkStore";
import { exportToCSV, exportToJSON, exportToZIP } from "@/utils/export";
import {
  Archive,
  FileJson,
  FileText,
  Upload,
} from "lucide-react";
import { useState } from "react";

export function ExportDialog() {
  const { points, features } = useGeomarkStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      exportToCSV({ points, features });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      exportToJSON({ points, features });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportZIP = async () => {
    setIsExporting(true);
    try {
      await exportToZIP({ points, features });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Exporter les données"
          disabled={
            (points.length === 0 && features.length === 0) || isExporting
          }
        >
          <Upload size={20} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="size-6 text-primary" />
            Exporter les données
          </DialogTitle>
          <DialogDescription>
            Choisissez le format d'exportation souhaité.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Stats */}
          <div className="bg-primary-foreground rounded-lg p-4">
            <p className="text-primary font-medium">
              {points.length} point{points.length > 1 ? "s" : ""} et{" "}
              {features.length} dessin{features.length > 1 ? "s" : ""} à
              exporter
            </p>
            <p className="text-primary text-sm mt-1">
              Dernière mise à jour : {new Date().toLocaleString("fr-FR")}
            </p>
          </div>

          {/* Options d'export */}
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={
                (points.length === 0 && features.length === 0) || isExporting
              }
              className="w-full h-auto flex items-center justify-between p-4 border-2 border-gray-200 hover:border-primary hover:bg-primary-foreground hover:text-inherit"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-green-600" size={24} />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800">Format CSV</h3>
                  <p className="text-sm text-gray-600">
                    Pour Excel ou Google Sheets
                  </p>
                </div>
              </div>
              <Upload className="text-primary" size={20} />
            </Button>

            <Button
              variant="outline"
              onClick={handleExportJSON}
              disabled={
                (points.length === 0 && features.length === 0) || isExporting
              }
              className="w-full h-auto flex items-center justify-between p-4 border-2 border-gray-200 hover:border-primary hover:bg-primary-foreground hover:text-inherit"
            >
              <div className="flex items-center gap-3">
                <FileJson className="text-primary" size={24} />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800">Format JSON</h3>
                  <p className="text-sm text-gray-600">
                    Pour les développeurs et API
                  </p>
                </div>
              </div>
              <Upload className="text-primary" size={20} />
            </Button>

            <Button
              variant="outline"
              onClick={handleExportZIP}
              disabled={
                (points.length === 0 && features.length === 0) || isExporting
              }
              className="w-full h-auto flex items-center justify-between p-4 border-2 border-gray-200 hover:border-primary hover:bg-primary-foreground hover:text-inherit"
            >
              <div className="flex items-center gap-3">
                <Archive className="text-amber-500" size={24} />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800">Format ZIP</h3>
                  <p className="text-sm text-gray-600">
                    Archive complète (CSV + JSON)
                  </p>
                </div>
              </div>
              <Upload className="text-primary" size={20} />
            </Button>
          </div>

          {/* Aperçu des données */}
          {points.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">
                Aperçu des données
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• ID : {points[0]?.id}</p>
                <p>• Titre : {points[0]?.title}</p>
                <p>
                  • Coordonnées : {points[0]?.lat}, {points[0]?.lng}
                </p>
                <p>• Notes : {points[0]?.notes || "(vide)"}</p>
                {points[0]?.url && (
                  <p className="truncate w-[350px]" title={points[0]?.url}>
                    • URL : {points[0]?.url}
                  </p>
                )}
                <p>• Créé le : {points[0]?.createdAt}</p>
                <p>
                  • Modifié le : {points[0]?.updatedAt || points[0]?.createdAt}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
