import { ClearDataDialog } from "@/components/dialogs/ClearDataDialog";
import { ExportDialog } from "@/components/dialogs/ExportDialog";
import { FeaturesListDialog } from "@/components/dialogs/FeaturesListDialog";
import { FeaturesList } from "@/components/shared/FeaturesList";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useGeomarkStore } from "@/store/geomarkStore";
import { Shapes } from "lucide-react";
import { useState } from "react";

export function SidebarFeaturesList() {
  const { features, clearFeatures } = useGeomarkStore();
  const [listFeaturesDialogOpen, setListFeaturesDialogOpen] = useState(false);

  return (
    <SidebarGroup
      id="onboarding-features-list"
      className="border-t border-sidebar-border flex-1 group-data-[collapsible=icon]:flex-none"
    >
      <div className="flex items-center justify-between px-2 py-1 group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden mb-2">
          <Shapes className="mr-2 size-4 text-primary" />
          Formes ({features.length})
        </SidebarGroupLabel>
        <div className="flex items-center gap-1">
          <ClearDataDialog
            count={features.length}
            onClear={clearFeatures}
            label="formes"
          />
          <ExportDialog />
        </div>
      </div>

      <SidebarGroupContent>
        {/* Liste visible en mode étendu */}
        <div className="group-data-[collapsible=icon]:hidden">
          <FeaturesList limit={5} />
          {features.length > 5 && (
            <Button
              variant="link"
              className="w-full mt-2 text-muted-foreground"
              onClick={() => setListFeaturesDialogOpen(true)}
            >
              Voir plus
            </Button>
          )}
        </div>

        {/* Bouton Dialog visible uniquement en mode réduit */}
        <div className="hidden group-data-[collapsible=icon]:flex justify-center py-2">
          <FeaturesListDialog
            open={listFeaturesDialogOpen}
            onOpenChange={setListFeaturesDialogOpen}
            trigger={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-primary"
                title="Voir la liste des formes"
              >
                <Shapes className="size-5" />
              </Button>
            }
          />
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
