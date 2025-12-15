import { ClearDataDialog } from "@/components/dialogs/ClearDataDialog";
import { ExportDialog } from "@/components/dialogs/ExportDialog";
import { PointsListDialog } from "@/components/dialogs/PointsListDialog";
import { PointsList } from "@/components/shared/PointsList";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useGeomarkStore } from "@/store/geomarkStore";
import { MapPin } from "lucide-react";
import { useState } from "react";

export function SidebarPointsList() {
  const { points, clearPoints } = useGeomarkStore();
  const [listPointsDialogOpen, setListPointsDialogOpen] = useState(false);

  return (
    <SidebarGroup className="border-t border-sidebar-border flex-1 group-data-[collapsible=icon]:flex-none">
      <div className="flex items-center justify-between px-2 py-1 group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden mb-2">
          <MapPin className="mr-2 size-4 text-primary" />
          Points ({points.length})
        </SidebarGroupLabel>
        <div className="flex items-center gap-1">
          <ClearDataDialog
            count={points.length}
            onClear={clearPoints}
            label="points"
          />
          <ExportDialog />
        </div>
      </div>

      <SidebarGroupContent>
        {/* Liste visible en mode étendu */}
        <div className="group-data-[collapsible=icon]:hidden">
          <PointsList limit={5} />
          {points.length > 5 && (
            <Button
              variant="link"
              className="w-full mt-2 text-muted-foreground"
              onClick={() => setListPointsDialogOpen(true)}
            >
              Voir plus
            </Button>
          )}
        </div>

        {/* Bouton Dialog visible uniquement en mode réduit */}
        <div className="hidden group-data-[collapsible=icon]:flex justify-center py-2">
          <PointsListDialog
            open={listPointsDialogOpen}
            onOpenChange={setListPointsDialogOpen}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-primary"
                title="Voir la liste des points"
              >
                <MapPin className="size-5" />
              </Button>
            }
          />
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
