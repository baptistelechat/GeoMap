import { Button } from "@/components/ui/button";
import { usePointsStore } from "@/store/pointsStore";
import { exportToCSV, exportToJSON } from "@/utils/export";
import { ArrowLeft, Download, FileJson, FileText } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Export() {
  const { points } = usePointsStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      exportToCSV(points);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      exportToJSON(points);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={20} />
              Retour
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              Exporter les données
            </h1>
          </div>

          {/* Stats */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-blue-800 font-medium">
              {points.length} point{points.length !== 1 ? "s" : ""} à exporter
            </p>
            <p className="text-blue-600 text-sm mt-1">
              Dernière mise à jour : {new Date().toLocaleString("fr-FR")}
            </p>
          </div>

          {/* Options d'export */}
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              disabled={points.length === 0 || isExporting}
              className="w-full h-auto flex items-center justify-between p-4 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-inherit"
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
              <Download className="text-gray-400" size={20} />
            </Button>

            <Button
              variant="outline"
              onClick={handleExportJSON}
              disabled={points.length === 0 || isExporting}
              className="w-full h-auto flex items-center justify-between p-4 border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-inherit"
            >
              <div className="flex items-center gap-3">
                <FileJson className="text-blue-600" size={24} />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800">Format JSON</h3>
                  <p className="text-sm text-gray-600">
                    Pour les développeurs et API
                  </p>
                </div>
              </div>
              <Download className="text-gray-400" size={20} />
            </Button>
          </div>

          {/* Aperçu des données */}
          {points.length > 0 && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">
                Aperçu des données
              </h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• ID : Identifiant unique</p>
                <p>• Titre : {points[0]?.title}</p>
                <p>• Coordonnées : Latitude, Longitude</p>
                <p>• Notes : Description du point</p>
                {points[0]?.streetViewUrl && (
                  <p>• Street View : URL de visualisation</p>
                )}
                <p>• Date de création : Format français</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
