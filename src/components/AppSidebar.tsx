import { AddPointDialog } from "@/components/AddPointDialog";
import { AddPointForm } from "@/components/AddPointForm";
import { ExportDialog } from "@/components/ExportDialog";
import { PointsList } from "@/components/PointsList";
import { PointsListDialog } from "@/components/PointsListDialog";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePointsStore } from "@/store/pointsStore";
import { List, MapPin, Plus } from "lucide-react";
import { useState } from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { points } = usePointsStore();
  const [addPointDialogOpen, setAddPointDialogOpen] = useState(false);
  const [listPointsDialogOpen, setListPointsDialogOpen] = useState(false);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between p-2 w-full">
              <div className="flex items-center gap-2 font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <MapPin className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">GeoMark</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">
                    Gérez vos points
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
                <SidebarTrigger />
              </div>

              <div className="hidden group-data-[collapsible=icon]:flex w-full justify-center">
                <SidebarTrigger />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        {/* Section Ajouter un point */}
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            <Plus className="mr-2 size-4 text-primary" />
            Ajouter un point
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {/* Formulaire visible en mode étendu */}
            <div className="group-data-[collapsible=icon]:hidden">
              <AddPointForm />
            </div>

            {/* Bouton Dialog visible uniquement en mode réduit */}
            <div className="hidden group-data-[collapsible=icon]:flex justify-center py-2">
              <AddPointDialog
                open={addPointDialogOpen}
                onOpenChange={setAddPointDialogOpen}
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

        <SidebarSeparator />

        {/* Section Liste des points */}
        <SidebarGroup className="flex-1">
          <div className="flex items-center justify-between px-2 py-1 group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>
              <List className="mr-2 size-4 text-primary" />
              Points ({points.length})
            </SidebarGroupLabel>
            <ExportDialog />
          </div>

          <SidebarGroupContent>
            {/* Liste visible en mode étendu */}
            <div className="group-data-[collapsible=icon]:hidden">
              <PointsList />
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
                    <List className="size-5" />
                  </Button>
                }
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
