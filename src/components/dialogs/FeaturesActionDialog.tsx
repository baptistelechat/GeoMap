import { FeatureForm } from "@/components/shared/FeatureForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SHAPE_NAMES } from "@/lib/map";
import { cn } from "@/lib/utils";
import type { Feature } from "geojson";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";

interface FeaturesActionDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  shapeType?: string;
  feature?: Feature;
  isNew?: boolean;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  className?: string;
}

export function FeaturesActionDialog({
  open,
  onOpenChange,
  shapeType,
  feature,
  isNew,
  trigger,
  onSuccess,
  className,
}: FeaturesActionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const show = isControlled ? open : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (isControlled) {
      onOpenChange?.(newOpen);
    } else {
      setInternalOpen(newOpen);
      onOpenChange?.(newOpen);
    }
  };

  // Determine effective shape type for title
  const effectiveShapeType = shapeType || feature?.properties?.shape || "Forme";
  const displayShapeType =
    SHAPE_NAMES[effectiveShapeType] || effectiveShapeType;

  return (
    <Dialog open={show} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          "flex flex-col", // Use flex column layout
          "w-screen h-[100dvh] max-w-none rounded-none border-0 m-0", // Mobile fullscreen with dynamic viewport height
          "top-0 left-0 translate-x-0 translate-y-0", // Mobile positioning
          "sm:border sm:rounded-lg sm:h-auto sm:max-w-lg sm:w-full", // Desktop reset
          "sm:top-[50%] sm:left-[50%] sm:-translate-x-1/2 sm:-translate-y-1/2", // Desktop positioning
          className
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {!isNew && feature ? (
              <>
                <Pencil className="size-5 text-primary" />
                Modifier la forme
              </>
            ) : (
              <>
                <Plus className="size-5 text-primary" />
                Nouvelle forme ({displayShapeType})
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-0">
          <FeatureForm
            feature={feature}
            isNew={isNew !== undefined ? isNew : !feature}
            shapeType={effectiveShapeType}
            onSuccess={() => {
              onSuccess?.();
              handleOpenChange(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
