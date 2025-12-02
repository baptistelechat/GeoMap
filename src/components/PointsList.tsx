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
import { useIsMobile } from "@/hooks/use-mobile";
import { useGeomarkStore } from "@/store/geomarkStore";
import { MapPinOff, Trash2 } from "lucide-react";

interface PointsListProps {
  onPointClick?: () => void;
}

export function PointsList({ onPointClick }: PointsListProps) {
  const { points, removePoint, setFlyToLocation } = useGeomarkStore();
  const isMobile = useIsMobile();

  if (points.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg mx-2">
        <MapPinOff className="size-10 mb-3 opacity-50" />
        <h3 className="font-semibold text-lg mb-1">Aucun point</h3>
        <p className="text-sm max-w-[200px]">
          {isMobile
            ? 'Commencez par cliquer sur le bouton "+" pour ajouter votre premier point.'
            : "Remplissez le formulaire pour ajouter votre premier point."}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full px-2 space-y-2">
        {points.map((point) => {
          const ItemContent = (
            <div
              className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm cursor-pointer hover:bg-accent transition-colors"
              onClick={() => {
                setFlyToLocation({ lat: point.lat, lng: point.lng, zoom: 16 });
                onPointClick?.();
              }}
            >
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
