import { DeletePointDialog } from "@/components/dialogs/DeletePointDialog";
import { PointActionDialog } from "@/components/dialogs/PointActionDialog";
import { MarkerIcon } from "@/components/map/MarkerIcon";
import { SidebarList } from "@/components/shared/SidebarList";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGeomarkStore } from "@/store/geomarkStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { MapPoint } from "@/types/map";
import { motion, useInView } from "framer-motion";
import { MapPinOff, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Spinner } from "../ui/spinner";

interface PointsListProps {
  onPointClick?: () => void;
  limit?: number;
  onEditSuccess?: () => void;
}

interface PointItemProps {
  point: MapPoint;
  onPointClick?: () => void;
  onEditSuccess?: () => void;
}

const PointItem = ({ point, onPointClick, onEditSuccess }: PointItemProps) => {
  const { setFlyToLocation, setHighlightedId } = useGeomarkStore();
  const { run } = useOnboardingStore();

  return (
    <div className="px-2 py-1">
      <div
        className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm cursor-pointer hover:bg-accent transition-colors h-full"
        onClick={() => {
          setFlyToLocation({
            lat: point.lat,
            lng: point.lng,
            zoom: 16,
          });
          setHighlightedId(point.id);
          onPointClick?.();
        }}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <MarkerIcon
            iconName={point.icon}
            color={point.color}
            className="w-8 h-8 shrink-0"
          />
          <div className="flex flex-col overflow-hidden">
            <span className="font-medium truncate text-sm">{point.title}</span>
            <span className="text-xs text-muted-foreground truncate">
              {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div onClick={(e) => e.stopPropagation()} className="flex gap-1">
            <PointActionDialog
              point={point}
              onSuccess={onEditSuccess}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                  disabled={run}
                  title={run ? "Désactivé pendant le tutoriel" : "Modifier"}
                >
                  <Pencil className="size-4" />
                </Button>
              }
            />
            <DeletePointDialog
              point={point}
              trigger={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  disabled={run}
                  title={run ? "Désactivé pendant le tutoriel" : "Supprimer"}
                >
                  <Trash2 className="size-4" />
                </Button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export function PointsList({
  onPointClick,
  limit,
  onEditSuccess,
}: PointsListProps) {
  const { points } = useGeomarkStore();
  const isMobile = useIsMobile();

  // Show points sorted by last modification date (newest first)
  const sortedPoints = useMemo(() => {
    return [...points].sort((a, b) => {
      const timeA = a.updatedAt || a.createdAt || 0;
      const timeB = b.updatedAt || b.createdAt || 0;
      return timeB - timeA;
    });
  }, [points]);

  const [displayedCount, setDisplayedCount] = useState(limit || 20);
  const loadMoreRef = useRef(null);
  const isInView = useInView(loadMoreRef);

  useEffect(() => {
    if (isInView && !limit && displayedCount < sortedPoints.length) {
      const timeout = setTimeout(() => {
        setDisplayedCount((prev) => Math.min(prev + 20, sortedPoints.length));
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isInView, limit, displayedCount, sortedPoints.length]);

  const displayPoints = limit
    ? sortedPoints.slice(0, limit)
    : sortedPoints.slice(0, displayedCount);

  const emptyMessage = (
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

  if (displayPoints.length === 0) {
    return emptyMessage;
  }

  return (
    <div className="w-full">
      <SidebarList
        items={displayPoints}
        emptyMessage={emptyMessage}
        renderItem={(point) => (
          <motion.div
            key={point.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <PointItem
              point={point}
              onPointClick={onPointClick}
              onEditSuccess={onEditSuccess}
            />
          </motion.div>
        )}
      />
      {!limit && displayedCount < sortedPoints.length && (
        <div
          ref={loadMoreRef}
          className="w-full py-4 flex justify-center text-sm text-muted-foreground items-center gap-2"
        >
          <Spinner />
          Chargement...
        </div>
      )}
    </div>
  );
}
