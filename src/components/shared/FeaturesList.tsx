import { DeleteFeatureDialog } from "@/components/dialogs/DeleteFeatureDialog";
import { FeaturesActionDialog } from "@/components/dialogs/FeaturesActionDialog";
import { SidebarList } from "@/components/shared/SidebarList";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { getFeatureBounds, SHAPE_NAMES } from "@/lib/map";
import { getContrastColorStyles } from "@/lib/tailwindColors";
import { cn } from "@/lib/utils";
import { useGeomarkStore } from "@/store/geomarkStore";
import { motion, useInView } from "framer-motion";
import {
  Circle,
  CircleDot,
  Map,
  MapPin,
  MapPinOff,
  Pencil,
  Pentagon,
  RectangleHorizontal,
  Route,
  Trash2,
  Type,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface FeaturesListProps {
  limit?: number;
  onItemClick?: () => void;
  onEditSuccess?: () => void;
}

const getFeatureIcon = (shapeType: string | undefined) => {
  switch (shapeType) {
    case "Marker":
      return MapPin;
    case "Circle":
      return Circle;
    case "Polygon":
      return Pentagon;
    case "Rectangle":
      return RectangleHorizontal;
    case "Line":
      return Route;
    case "Text":
      return Type;
    case "CircleMarker":
      return CircleDot;
    default:
      return Map;
  }
};

export function FeaturesList({
  limit,
  onItemClick,
  onEditSuccess,
}: FeaturesListProps) {
  const { features, setFlyToBounds, setHighlightedId } = useGeomarkStore();

  // Sort features by last modification (if property exists) or creation
  const sortedFeatures = useMemo(() => {
    return [...features].sort((a, b) => {
      const getTime = (val: string | number | undefined) => {
        if (!val) return 0;
        return typeof val === "string" ? new Date(val).getTime() : val;
      };

      const timeA = getTime(a.properties?.updatedAt || a.properties?.createdAt);
      const timeB = getTime(b.properties?.updatedAt || b.properties?.createdAt);
      return timeB - timeA;
    });
  }, [features]);

  const [displayedCount, setDisplayedCount] = useState(limit || 20);
  const loadMoreRef = useRef(null);
  const isInView = useInView(loadMoreRef);

  useEffect(() => {
    if (isInView && !limit && displayedCount < sortedFeatures.length) {
      const timeout = setTimeout(() => {
        setDisplayedCount((prev) => Math.min(prev + 20, sortedFeatures.length));
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isInView, limit, displayedCount, sortedFeatures.length]);

  const displayFeatures = limit
    ? sortedFeatures.slice(0, limit)
    : sortedFeatures.slice(0, displayedCount);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFeatureClick = (feature: any) => {
    const boundsData = getFeatureBounds(feature);
    if (boundsData) {
      setFlyToBounds(boundsData);
    }

    if (feature.properties?.id) {
      setHighlightedId(feature.properties.id);
    }

    onItemClick?.();
  };

  const emptyMessage = (
    <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg mx-2">
      <MapPinOff className="size-10 mb-3 opacity-50" />
      <h3 className="font-semibold text-lg mb-1">Aucune forme</h3>
      <p className="text-sm max-w-[200px]">
        Utilisez les outils de dessin sur la carte pour créer des formes.
      </p>
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      <SidebarList
        items={displayFeatures}
        emptyMessage={emptyMessage}
        renderItem={(feature) => {
          const ShapeIcon = getFeatureIcon(feature.properties?.shape);
          const colorStyles = getContrastColorStyles(feature.properties?.color);

          return (
            <motion.div
              key={feature.properties?.id || Math.random()}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm cursor-pointer hover:bg-accent transition-colors"
              onClick={() => handleFeatureClick(feature)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className={cn(
                    "flex items-center justify-center size-8 rounded-full shrink-0",
                    "bg-[var(--bg-color)] text-[var(--icon-color)]",
                    "dark:bg-[var(--dark-bg-color)] dark:text-[var(--dark-icon-color)]"
                  )}
                  style={
                    {
                      "--bg-color": colorStyles.backgroundColor,
                      "--icon-color": colorStyles.iconColor,
                      "--dark-bg-color": colorStyles.darkBackgroundColor,
                      "--dark-icon-color": colorStyles.darkIconColor,
                    } as React.CSSProperties
                  }
                >
                  <ShapeIcon className="size-4" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium truncate text-sm">
                    {feature.properties?.name || "Forme sans nom"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {SHAPE_NAMES[feature.properties?.shape as string] ||
                      feature.geometry.type}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div onClick={(e) => e.stopPropagation()}>
                  <FeaturesActionDialog
                    feature={feature}
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
                  <DeleteFeatureDialog
                    feature={feature}
                    trigger={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="Supprimer"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    }
                  />
                </div>
              </div>
            </motion.div>
          );
        }}
      />
      {!limit && displayedCount < sortedFeatures.length && (
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
