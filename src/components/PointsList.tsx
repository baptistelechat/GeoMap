import { PointDialog } from "@/components/PointDialog";
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
import { AnimatePresence, motion } from "framer-motion";
import { MapPinOff, Pencil, Trash2 } from "lucide-react";
import { DeletePointDialog } from "./DeletePointDialog";
import { MarkerIcon } from "./MarkerIcon";

interface PointsListProps {
  onPointClick?: () => void;
  limit?: number;
  onEditSuccess?: () => void;
}

export function PointsList({
  onPointClick,
  limit,
  onEditSuccess,
}: PointsListProps) {
  const { points, setFlyToLocation, setHighlightedPointId } = useGeomarkStore();
  const isMobile = useIsMobile();

  // Show points sorted by last modification date (newest first)
  const sortedPoints = [...points].sort((a, b) => {
    const timeA = a.updatedAt || a.createdAt || 0;
    const timeB = b.updatedAt || b.createdAt || 0;
    return timeB - timeA;
  });

  const displayPoints = limit ? sortedPoints.slice(0, limit) : sortedPoints;

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
        <AnimatePresence mode="popLayout" initial={false}>
          {displayPoints.map((point) => {
            const ItemContent = (
              <div
                className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm cursor-pointer hover:bg-accent transition-colors"
                onClick={() => {
                  setFlyToLocation({
                    lat: point.lat,
                    lng: point.lng,
                    zoom: 16,
                  });
                  setHighlightedPointId(point.id);
                  onPointClick?.();
                }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <MarkerIcon
                    iconName={point.icon}
                    color={point.color}
                    className="w-8 h-8 shrink-0"
                  />
                  <span className="font-medium truncate text-sm">
                    {point.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
                  </Badge>

                  <div onClick={(e) => e.stopPropagation()}>
                    <PointDialog
                      point={point}
                      onSuccess={onEditSuccess}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          title="Modifier"
                        >
                          <Pencil className="size-4" />
                        </Button>
                      }
                    />
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <DeletePointDialog
                      point={point}
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Supprimer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      }
                    />
                  </div>
                </div>
              </div>
            );

            const content = point.notes ? (
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>{ItemContent}</TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-[300px] break-words"
                >
                  <p className="text-sm line-clamp-6">{point.notes}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              ItemContent
            );

            return (
              <motion.div
                key={point.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                {content}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
