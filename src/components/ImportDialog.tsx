import FileUpload from "@/components/kokonutui/file-upload";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useGeomarkStore } from "@/store/geomarkStore";
import { MapPoint } from "@/types/map";
import { exportToCSV, exportToJSON, exportToZIP } from "@/utils/export";
import { parseCSV, parseJSON } from "@/utils/import";
import { Feature } from "geojson";
import { Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ImportDialogProps {
  trigger?: React.ReactNode;
}

interface ImportResult {
  points: MapPoint[];
  features: Feature[];
}

export function ImportDialog({ trigger }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [showReplaceWarning, setShowReplaceWarning] = useState(false);
  const [pendingImport, setPendingImport] = useState<ImportResult | null>(null);
  const [backupFormat, setBackupFormat] = useState<
    "csv" | "json" | "zip" | "none"
  >("none");

  const { importData, points, features, clearPoints, clearFeatures } =
    useGeomarkStore();

  const handleUploadSuccess = async (file: File) => {
    try {
      let result;
      if (file.name.toLowerCase().endsWith(".json")) {
        result = await parseJSON(file);
      } else if (file.name.toLowerCase().endsWith(".csv")) {
        result = await parseCSV(file);
      } else {
        throw new Error("Format de fichier non supporté");
      }

      if (result.points.length === 0 && result.features.length === 0) {
        toast.warning("Aucune donnée trouvée dans le fichier");
        return;
      }

      // Check for conflicts (if there is existing data)
      if (points.length > 0 || features.length > 0) {
        setPendingImport(result);
        setShowConflictDialog(true);
      } else {
        // No existing data, direct import
        importData(result.points, result.features);
        toast.success(
          `Import terminé : ${result.points.length} points et ${result.features.length} dessins ajoutés`
        );
        setOpen(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'import"
      );
    }
  };

  const handleMerge = () => {
    if (!pendingImport) return;

    const existingPointIds = new Set(points.map((p) => p.id));
    const existingFeatureIds = new Set(
      features.map((f) => f.properties?.id).filter(Boolean)
    );

    const newPointsCount = pendingImport.points.filter(
      (p) => !existingPointIds.has(p.id)
    ).length;
    const newFeaturesCount = pendingImport.features.filter(
      (f) => !existingFeatureIds.has(f.properties?.id)
    ).length;

    importData(pendingImport.points, pendingImport.features);

    toast.success(
      `Fusion terminée : ${newPointsCount} nouveaux points et ${newFeaturesCount} nouvelles formes ajoutés`
    );
    setPendingImport(null);
    setShowConflictDialog(false);
    setOpen(false);
  };

  const handleReplaceRequest = () => {
    setShowConflictDialog(false);
    setShowReplaceWarning(true);
    setBackupFormat("none"); // Reset backup selection
  };

  const handleReplaceConfirm = async () => {
    if (!pendingImport) return;

    // Backup logic
    if (backupFormat !== "none") {
      const currentData = { points, features };
      try {
        if (backupFormat === "json") {
          exportToJSON(currentData);
        } else if (backupFormat === "csv") {
          exportToCSV(currentData);
        } else if (backupFormat === "zip") {
          await exportToZIP(currentData);
        }
      } catch (error) {
        console.error("Backup failed", error);
        toast.error(
          "La sauvegarde a échoué. L'import a été annulé pour protéger vos données."
        );
        return;
      }
    }

    // Clear existing data
    clearPoints();
    clearFeatures();

    // Import new data
    importData(pendingImport.points, pendingImport.features);

    toast.success(
      `Remplacement terminé : ${pendingImport.points.length} points et ${pendingImport.features.length} dessins ajoutés`
    );

    setPendingImport(null);
    setShowReplaceWarning(false);
    setOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="icon" title="Importer des données">
              <Upload size={20} />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="size-6 text-primary" />
              Importer des données
            </DialogTitle>
            <DialogDescription>
              Glissez-déposez un fichier JSON ou CSV pour importer des points et
              des dessins.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <FileUpload
              className="w-full max-w-full"
              onUploadSuccess={handleUploadSuccess}
              acceptedFileTypes={[".json", ".csv"]}
              maxFileSize={10 * 1024 * 1024} // 10MB
              uploadDelay={1000}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Conflict Resolution Dialog */}
      <AlertDialog
        open={showConflictDialog}
        onOpenChange={setShowConflictDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Données existantes détectées</AlertDialogTitle>
            <AlertDialogDescription>
              Des points ou des formes existent déjà sur la carte.
              Souhaitez-vous fusionner les nouvelles données avec les existantes
              ou tout remplacer ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel onClick={() => setPendingImport(null)}>
              Annuler
            </AlertDialogCancel>
            <Button variant="outline" onClick={handleMerge}>
              Fusionner (Ajouter)
            </Button>
            <Button variant="destructive" onClick={handleReplaceRequest}>
              Remplacer tout
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Replacement Warning Dialog */}
      <AlertDialog
        open={showReplaceWarning}
        onOpenChange={setShowReplaceWarning}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Attention : Perte de données irréversible
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de remplacer toutes les données existantes.
              Cette action est irréversible et toutes les données non
              sauvegardées seront perdues.
              <br />
              <br />
              Voulez-vous effectuer une sauvegarde avant de continuer ?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Label className="mb-2 block text-sm font-medium">
              Format de sauvegarde (optionnel)
            </Label>
            <RadioGroup
              value={backupFormat}
              onValueChange={(value) =>
                setBackupFormat(value as "csv" | "json" | "zip" | "none")
              }
              className="gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="backup-none" />
                <Label htmlFor="backup-none">Ne pas sauvegarder</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="backup-json" />
                <Label htmlFor="backup-json">Sauvegarder en JSON</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="backup-csv" />
                <Label htmlFor="backup-csv">Sauvegarder en CSV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="zip" id="backup-zip" />
                <Label htmlFor="backup-zip">Sauvegarder en ZIP (Complet)</Label>
              </div>
            </RadioGroup>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingImport(null)}>
              Annuler
            </AlertDialogCancel>
            <Button variant="destructive" onClick={handleReplaceConfirm}>
              {backupFormat !== "none"
                ? "Sauvegarder et Remplacer"
                : "Remplacer sans sauvegarde"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
