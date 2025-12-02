import { ClearPointsDialog } from "@/components/ClearPointsDialog";
import { PointsList } from "@/components/PointsList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useGeomarkStore } from "@/store/geomarkStore";
import { exportToCSV, exportToJSON } from "@/utils/export";
import { Download, List } from "lucide-react";
import { useState } from "react";

interface PointsListDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function PointsListDialog({
  trigger,
  open,
  onOpenChange,
  className,
}: PointsListDialogProps) {
  const { points } = useGeomarkStore();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const show = isControlled ? open : internalOpen;
  const setShow = isControlled ? onOpenChange : setInternalOpen;

  const handleExportCSV = () => {
    exportToCSV(points);
  };

  const handleExportJSON = () => {
    exportToJSON(points);
  };

  return (
    <Dialog open={show} onOpenChange={setShow}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          "flex flex-col overflow-hidden", // Flex container for header/content/footer
          "w-screen h-[100dvh] max-w-none rounded-none border-0 m-0", // Mobile fullscreen with dynamic viewport height
          "top-0 left-0 translate-x-0 translate-y-0", // Mobile positioning
          "sm:border sm:rounded-lg sm:h-[80vh] sm:max-w-lg sm:w-full", // Desktop reset (limited height)
          "sm:top-[50%] sm:left-[50%] sm:-translate-x-1/2 sm:-translate-y-1/2", // Desktop positioning
          className
        )}
      >
        <DialogHeader>
          <div className="flex items-center justify-between mr-8">
            <DialogTitle className="flex items-center gap-2">
              <List className="size-6 text-primary" />
              Liste des points ({points.length})
            </DialogTitle>
            <ClearPointsDialog mode="text" />
          </div>
        </DialogHeader>

        <div className="flex gap-2 mb-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={points.length === 0}
            className="flex-1"
          >
            <Download className="mr-2 size-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJSON}
            disabled={points.length === 0}
            className="flex-1"
          >
            <Download className="mr-2 size-4" />
            JSON
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <PointsList onPointClick={() => setShow(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
