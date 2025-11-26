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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePointsStore } from "@/store/pointsStore";
import { Trash2 } from "lucide-react";

export function PointsList() {
  const { points, removePoint } = usePointsStore();

  if (points.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Aucun point ajouté
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full px-2 space-y-2">
        {points.map((point) => {
          const ItemContent = (
            <div className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
              <span className="font-medium truncate mr-2 text-sm">
                {point.title}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="font-mono text-xs">
                  {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                </Badge>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Supprimer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Cela supprimera
                        définitivement le point "{point.title}" de votre liste.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                        Annuler
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.stopPropagation();
                          removePoint(point.id);
                        }}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          );

          if (point.notes) {
            return (
              <Tooltip key={point.id} delayDuration={300}>
                <TooltipTrigger asChild>{ItemContent}</TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-[300px] break-words"
                >
                  <p className="text-sm line-clamp-6">{point.notes}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={point.id}>{ItemContent}</div>;
        })}
      </div>
    </TooltipProvider>
  );
}
