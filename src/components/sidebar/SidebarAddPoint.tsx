import { ImportDialog } from "@/components/dialogs/ImportDialog";
import { PointActionDialog } from "@/components/dialogs/PointActionDialog";
import { PointForm } from "@/components/shared/PointForm";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Plus } from "lucide-react";
import { useState } from "react";

export function SidebarAddPoint() {
  const [pointDialogOpen, setPointDialogOpen] = useState(false);

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between px-2 py-1 group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden mb-2 p-0">
          <Plus className="mr-2 size-4 text-primary" />
          Ajouter un point
        </SidebarGroupLabel>
        <ImportDialog />
      </div>
      <SidebarGroupContent>
        {/* Formulaire visible en mode étendu */}
        <div className="group-data-[collapsible=icon]:hidden">
          <PointForm />
        </div>

        {/* Bouton Dialog visible uniquement en mode réduit */}
        <div className="hidden group-data-[collapsible=icon]:flex justify-center py-2">
          <PointActionDialog
            open={pointDialogOpen}
            onOpenChange={setPointDialogOpen}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-primary"
                title="Ajouter un point"
              >
                <Plus className="size-5" />
              </Button>
            }
          />
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
