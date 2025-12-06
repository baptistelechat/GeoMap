import FileUpload from "@/components/kokonutui/file-upload";
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
import { parseCSV, parseJSON } from "@/utils/import";
import { Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ImportDialogProps {
  trigger?: React.ReactNode;
}

export function ImportDialog({ trigger }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const { importData } = useGeomarkStore();

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

      importData(result.points, result.features);
      toast.success(
        `Import terminé : ${result.points.length} points et ${result.features.length} dessins ajoutés`
      );
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'import"
      );
    }
  };

  return (
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
            onUploadSuccess={handleUploadSuccess}
            acceptedFileTypes={[".json", ".csv"]}
            maxFileSize={10 * 1024 * 1024} // 10MB
            uploadDelay={1000}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
