import { ExportDialog } from "@/components/dialogs/ExportDialog";
import { ImportDialog } from "@/components/dialogs/ImportDialog";
import { ButtonGroup } from "@/components/ui/button-group";

export function SidebarFooterActions() {
  return (
    <>
      <div
        id="onboarding-footer-actions"
        className="flex w-full justify-center group-data-[collapsible=icon]:hidden"
      >
        <ButtonGroup className="w-full">
          <ImportDialog variant="outline" mode="text" className="flex-1" />
          <ExportDialog variant="outline" mode="text" className="flex-1" />
        </ButtonGroup>
      </div>
      <div className="hidden group-data-[collapsible=icon]:flex flex-col gap-2 items-center">
        <ImportDialog variant="ghost" mode="icon" className="size-8" />
        <ExportDialog variant="ghost" mode="icon" className="size-8" />
      </div>
    </>
  );
}
