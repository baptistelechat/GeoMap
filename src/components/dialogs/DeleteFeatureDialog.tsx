import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useGeomarkStore } from "@/store/geomarkStore";
import { Feature } from "geojson";
import { Trash2 } from "lucide-react";
import { ReactNode, useState } from "react";
import { toast } from "sonner";

interface DeleteFeatureDialogProps {
  feature: Feature;
  trigger: ReactNode;
  onDelete?: () => void;
}

export function DeleteFeatureDialog({
  feature,
  trigger,
  onDelete,
}: DeleteFeatureDialogProps) {
  const { removeFeature } = useGeomarkStore();
  const [open, setOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const id = feature.properties?.id;
    if (id) {
      removeFeature(id);
      toast.success("La forme a été supprimée");
      onDelete?.();
      setOpen(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="size-6 text-destructive" />
            Êtes-vous sûr ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Cela supprimera définitivement cette
            forme de votre carte.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
            Annuler
          </AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete}>
            Supprimer
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
