import { ClearPointsDialog } from "@/components/ClearPointsDialog";
import { DevTools } from "@/components/DevTools";
import { ExportDialog } from "@/components/ExportDialog";
import { ImportDialog } from "@/components/ImportDialog";
import { PointDialog } from "@/components/PointDialog";
import { PointForm } from "@/components/PointForm";
import { PointsList } from "@/components/PointsList";
import { PointsListDialog } from "@/components/PointsListDialog";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useGeomarkStore } from "@/store/geomarkStore";
import { FlaskConical, List, MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { ButtonGroup } from "./ui/button-group";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { points } = useGeomarkStore();
  const [pointDialogOpen, setPointDialogOpen] = useState(false);
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

              <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                <SidebarTrigger />
              </div>

              <div className="hidden group-data-[collapsible=icon]:flex w-full justify-center">
                <SidebarTrigger />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="overflow-x-hidden pb-8">
        {/* Section Ajouter un point */}
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 py-1 group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden mb-2 p-0">
              <Plus className="mr-2 size-4 text-primary" />
              Ajouter un point
            </SidebarGroupLabel>
            <ImportDialog
            />
          </div>
          <SidebarGroupContent>
            {/* Formulaire visible en mode étendu */}
            <div className="group-data-[collapsible=icon]:hidden">
              <PointForm />
            </div>

            {/* Bouton Dialog visible uniquement en mode réduit */}
            <div className="hidden group-data-[collapsible=icon]:flex justify-center py-2">
              <PointDialog
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

        {/* Section Liste des points */}
        <SidebarGroup className="border-t border-sidebar-border flex-1 group-data-[collapsible=icon]:flex-none">
          <div className="flex items-center justify-between px-2 py-1 group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden mb-2">
              <List className="mr-2 size-4 text-primary" />
              Points ({points.length})
            </SidebarGroupLabel>
            <div className="flex items-center gap-1">
              <ClearPointsDialog />
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
                    <List className="size-5" />
                  </Button>
                }
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Section Développement - Uniquement en DEV */}
        {import.meta.env.DEV && (
          <SidebarGroup className="border-t border-sidebar-border">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden mb-2">
              <FlaskConical className="mr-2 size-4 text-primary" />
              Développement
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="group-data-[collapsible=icon]:hidden">
                <DevTools />
              </div>
              <div className="hidden group-data-[collapsible=icon]:flex justify-center py-2">
                <DevTools
                  variant="ghost"
                  size="icon"
                  className="size-8 text-primary"
                  title="Générer des points"
                >
                  <FlaskConical className="size-5" />
                </DevTools>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4 group-data-[collapsible=icon]:p-2">
        <div className="flex w-full justify-center group-data-[collapsible=icon]:hidden">
          <ButtonGroup className="w-full">
            <ImportDialog variant="outline" mode="text" className="flex-1" />
            <ExportDialog variant="outline" mode="text" className="flex-1" />
          </ButtonGroup>
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex flex-col gap-2 items-center">
          <ImportDialog variant="ghost" mode="icon" className="size-8" />
          <ExportDialog variant="ghost" mode="icon" className="size-8" />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
