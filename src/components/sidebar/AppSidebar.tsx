import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Map } from "lucide-react";
import { SidebarAddPoint } from "./SidebarAddPoint";
import { SidebarDevSection } from "./SidebarDevSection";
import { SidebarFeaturesList } from "./SidebarFeaturesList";
import { SidebarFooterActions } from "./SidebarFooterActions";
import { SidebarPointsList } from "./SidebarPointsList";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between p-2 w-full">
              <div className="flex items-center gap-2 font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                <div className="flex aspect-square size-9 items-center justify-center rounded-md bg-gradient-to-tr from-primary to-lime-500 text-primary-foreground">
                  <Map className="size-6" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">GeoMap</span>
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
        <SidebarAddPoint />
        <SidebarPointsList />
        <SidebarFeaturesList />
        <SidebarDevSection />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4 group-data-[collapsible=icon]:p-2">
        <SidebarFooterActions />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
