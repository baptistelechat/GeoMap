import { FeaturesListDialog } from "@/components/dialogs/FeaturesListDialog";
import { PointActionDialog } from "@/components/dialogs/PointActionDialog";
import { PointsListDialog } from "@/components/dialogs/PointsListDialog";
import { MapView } from "@/components/map/MapView";
import { SearchAddress } from "@/components/map/SearchAddress";
import { StressTestButton } from "@/components/shared/devtools/StressTestButton";
import { TestPointsButton } from "@/components/shared/devtools/TestPointsButton";
import { AppSidebar } from "@/components/sidebar/AppSidebar";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Dices, MapPin, Plus, Shapes, Zap } from "lucide-react";

export default function MainMap() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative">
        <div
          className={cn(
            "absolute top-4 z-50 transition-all duration-300",
            // Mobile (default): Décalé à droite pour éviter Geoman
            "right-4 w-[calc(100%-80px)] max-w-[300px]",
            // Desktop (md+): Centré
            "md:right-auto md:left-1/2 md:-translate-x-1/2 md:w-[90%] md:max-w-sm"
          )}
        >
          <SearchAddress />
        </div>
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
                <MapPin className="size-6" />
              </Button>
            }
          />
          <FeaturesListDialog
            trigger={
              <Button
                className="rounded-full shadow-lg size-12"
                variant="secondary"
                size="icon"
                title="Liste des formes"
              >
                <Shapes className="size-6" />
              </Button>
            }
          />
          {import.meta.env.DEV && (
            <>
              <TestPointsButton
                className="rounded-full shadow-lg size-12"
                variant="outline"
                size="icon"
                title="Générer 15 points"
              >
                <Dices className="size-6 text-amber-500" />
              </TestPointsButton>
              <StressTestButton
                className="rounded-full shadow-lg size-12"
                variant="outline"
                size="icon"
                title="Stress Test (2000 points)"
              >
                <Zap className="size-6 text-destructive" />
              </StressTestButton>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
