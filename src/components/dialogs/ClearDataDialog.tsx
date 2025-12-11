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
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ClearDataDialogProps {
  count: number;
  onClear: () => void;
  label: string; // "points" or "formes"
  mode?: "icon" | "text";
}

export function ClearDataDialog({
  count,
  onClear,
  label,
  mode = "icon",
}: ClearDataDialogProps) {
  const [open, setOpen] = useState(false);

  if (count === 0) return null;

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
          title={`Tout supprimer (${label})`}
        >
          <Trash2 className={cn("size-4", mode === "text" && "mr-2")} />
          {mode === "text" && "Tout supprimer"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="size-6 text-destructive" />
            Tout supprimer ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Cela supprimera définitivement les{" "}
            {count} {label} enregistrés.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onClear();
              toast.success(`${count} ${label} ont été supprimés`);
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
