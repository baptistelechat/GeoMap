import { PointForm } from "@/components/shared/PointForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { MapPoint } from "@/types/map";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { ImportDialog } from "./ImportDialog";

interface PointActionDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  point?: MapPoint;
  onSuccess?: () => void;
}

export function PointActionDialog({
  trigger,
  open,
  onOpenChange,
  className,
  point,
  onSuccess,
}: PointActionDialogProps) {
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
          "z-[10005]", // Ensure dialog is above onboarding overlay
          className
        )}
      >
        <DialogHeader>
          <div className="flex items-center justify-between mr-8">
            <DialogTitle className="flex items-center gap-2">
              {point ? (
                <>
                  <Pencil className="size-6 text-primary" />
                  Modifier le point
                </>
              ) : (
                <>
                  <Plus className="size-6 text-primary" />
                  Ajouter un point
                </>
              )}
            </DialogTitle>
            {!point && (
              <ImportDialog
                mode="text"
                onSuccess={() => handleOpenChange(false)}
              />
            )}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-0">
          <PointForm
            onSuccess={() => {
              handleOpenChange(false);
              onSuccess?.();
            }}
            point={point}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
