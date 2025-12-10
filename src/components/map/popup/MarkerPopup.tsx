import { DeletePointDialog } from "@/components/dialogs/DeletePointDialog";
import { PointActionDialog } from "@/components/dialogs/PointActionDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPoint } from "@/types/map";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { ScrollArea } from "../../ui/scroll-area";
import { MarkerIcon } from "../MarkerIcon";

interface MarkerPopupProps {
  point: MapPoint;
}

export function MarkerPopup({ point }: MarkerPopupProps) {
  return (
    <div className="p-2 w-[300px] flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <MarkerIcon
          iconName={point.icon}
          color={point.color}
          className="size-8 shrink-0"
        />
        <h3 className="font-semibold text-gray-800 leading-tight">
          {point.title}
        </h3>
      </div>
      <div>
        <Badge variant="secondary" className="font-mono text-xs">
          {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
        </Badge>
      </div>
      {point.notes && (
        <ScrollArea className="h-[75px] w-full">
          <p className="m-0 text-sm text-gray-600 break-words whitespace-pre-wrap">
            {point.notes}
          </p>
        </ScrollArea>
      )}
      <div className="flex items-center justify-between pt-2 mt-1 border-t gap-2">
        {point.url ? (
          <a
            href={point.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <ExternalLink size={14} />
            Voir sur Maps
          </a>
        ) : (
          <div /> /* Spacer if no link */
        )}

        <div className="flex items-center gap-1">
          <PointActionDialog
            point={point}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-primary hover:bg-primary/10"
                title="Modifier"
              >
                <Pencil className="size-3.5" />
              </Button>
            }
          />
          <DeletePointDialog
            point={point}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Supprimer"
              >
                <Trash2 className="size-3.5" />
              </Button>
            }
          />
        </div>
      </div>
    </div>
  );
}
