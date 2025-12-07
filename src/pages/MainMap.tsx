import { PointActionDialog } from "@/components/dialogs/PointActionDialog";
import { PointsListDialog } from "@/components/dialogs/PointsListDialog";
import { MapView } from "@/components/map/MapView";
import { DevTools } from "@/components/shared/DevTools";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { FlaskConical, List, Plus } from "lucide-react";

export default function MainMap() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative">
        <div className="flex-1 h-screen">
          <MapView />
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 md:hidden">
          <PointActionDialog
            trigger={
              <Button
                className="rounded-full shadow-lg size-12"
                size="icon"
                title="Ajouter un point"
              >
                <Plus className="size-6" />
              </Button>
            }
          />
          <PointsListDialog
            trigger={
              <Button
                className="rounded-full shadow-lg size-12"
                variant="secondary"
                size="icon"
                title="Liste des points"
              >
                <List className="size-6" />
              </Button>
            }
          />
          {import.meta.env.DEV && (
            <DevTools
              className="rounded-full shadow-lg size-12"
              variant="outline"
              size="icon"
              title="Générer des points"
            >
              <FlaskConical className="size-6" />
            </DevTools>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
