import { StressTestButton } from "@/components/shared/devtools/StressTestButton";
import { TestPointsButton } from "@/components/shared/devtools/TestPointsButton";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Dices, FlaskConical, RotateCcw, Zap } from "lucide-react";
import { ResetButton } from "../shared/devtools/ResetButton";

export function SidebarDevSection() {
  if (!import.meta.env.DEV) return null;

  return (
    <SidebarGroup className="border-t border-sidebar-border">
      <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden mb-2">
        <FlaskConical className="mr-2 size-4 text-primary" />
        Développement
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="group-data-[collapsible=icon]:hidden flex flex-col gap-2 p-2">
          <TestPointsButton className="w-full justify-start gap-2">
            <Dices className="size-4" />
            Test Standard (15)
          </TestPointsButton>
          <StressTestButton className="w-full justify-start gap-2">
            <Zap className="size-4" />
            Stress Test (2000)
          </StressTestButton>
          <ResetButton
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            size="default"
            variant="ghost"
          >
            <RotateCcw className="size-4" />
            Réinitialiser
          </ResetButton>
        </div>
        <div className="hidden group-data-[collapsible=icon]:flex flex-col gap-2 items-center justify-center py-2">
          <TestPointsButton
            variant="ghost"
            size="icon"
            className="size-8 text-amber-500"
            title="Générer 15 points"
          >
            <Dices className="size-5" />
          </TestPointsButton>
          <StressTestButton
            variant="ghost"
            size="icon"
            className="size-8 text-destructive"
            title="Stress Test (2000 points)"
          >
            <Zap className="size-5" />
          </StressTestButton>
          <ResetButton variant="ghost" className="size-8 text-destructive" />
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
