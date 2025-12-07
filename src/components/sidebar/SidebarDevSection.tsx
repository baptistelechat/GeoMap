import { DevTools } from "@/components/shared/DevTools";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { FlaskConical } from "lucide-react";

export function SidebarDevSection() {
  if (!import.meta.env.DEV) return null;

  return (
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
  );
}
