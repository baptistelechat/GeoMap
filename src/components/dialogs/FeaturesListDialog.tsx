import { FeaturesList } from "@/components/shared/FeaturesList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useGeomarkStore } from "@/store/geomarkStore";
import { exportToCSV, exportToJSON, exportToZIP } from "@/utils/export";
import { Archive, FileJson, FileText, Shapes } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { ClearDataDialog } from "./ClearDataDialog";

interface FeaturesListDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: Dispatch<SetStateAction<boolean>>;
  className?: string;
}

export function FeaturesListDialog({
  trigger,
  open,
  onOpenChange,
  className,
}: FeaturesListDialogProps) {
  const { features, clearFeatures } = useGeomarkStore();
  const isMobile = useIsMobile();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          "flex flex-col overflow-hidden",
          "w-screen h-[100dvh] max-w-none rounded-none border-0 m-0",
          "top-0 left-0 translate-x-0 translate-y-0",
          "sm:border sm:rounded-lg sm:h-[80vh] sm:max-w-lg sm:w-full",
          "sm:top-[50%] sm:left-[50%] sm:-translate-x-1/2 sm:-translate-y-1/2",
          className
        )}
      >
        <DialogHeader>
          <div className="flex items-center justify-between mr-8">
            <DialogTitle className="flex items-center gap-2">
              <Shapes className="size-6 text-primary" />
              {isMobile ? "Formes" : "Liste des formes"} ({features.length})
            </DialogTitle>
            <ClearDataDialog
              count={features.length}
              onClear={clearFeatures}
              label="formes"
              mode="text"
            />
          </div>
        </DialogHeader>

        <div className="flex gap-2 mb-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToCSV()}
            disabled={features.length === 0}
            className="flex-1"
          >
            <FileText className="mr-2 size-4 text-green-600" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToJSON()}
            disabled={features.length === 0}
            className="flex-1"
          >
            <FileJson className="mr-2 size-4 text-primary" />
            JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToZIP()}
            disabled={features.length === 0}
            className="flex-1"
          >
            <Archive className="mr-2 size-4 text-amber-500" />
            ZIP
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <FeaturesList onItemClick={() => onOpenChange?.(false)} />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t mt-auto">
          <Button variant="outline" onClick={() => onOpenChange?.(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
