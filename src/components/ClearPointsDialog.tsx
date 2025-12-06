import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGeomarkStore } from "@/store/geomarkStore";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ClearPointsDialogProps {
  mode?: "icon" | "text";
}

export function ClearPointsDialog({ mode = "icon" }: ClearPointsDialogProps) {
  const { points, clearPoints } = useGeomarkStore();
  const [open, setOpen] = useState(false);

  if (points.length === 0) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size={mode === "icon" ? "icon" : "sm"}
          className={cn(
            "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            mode === "icon" ? "size-8" : ""
          )}
          title="Tout supprimer"
        >
          <Trash2 className={cn("size-4", mode === "text" && "mr-2")} />
          {mode === "text" && "Tout supprimer"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tout supprimer ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Cela supprimera définitivement les {points.length} points enregistrés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              const count = points.length;
              clearPoints();
              toast.success(`${count} points ont été supprimés`);
              setOpen(false);
            }}
            className="bg-destructive hover:bg-destructive/90"
          >
            Tout supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
