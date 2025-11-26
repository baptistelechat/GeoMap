import { AddPointForm } from "@/components/AddPointForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { useState } from "react";

interface AddPointDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function AddPointDialog({
  trigger,
  open,
  onOpenChange,
  className,
}: AddPointDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const show = isControlled ? open : internalOpen;
  const setShow = isControlled ? onOpenChange : setInternalOpen;

  return (
    <Dialog open={show} onOpenChange={setShow}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          "flex flex-col", // Use flex column layout
          "w-screen h-[100dvh] max-w-none rounded-none border-0 m-0", // Mobile fullscreen with dynamic viewport height
          "top-0 left-0 translate-x-0 translate-y-0", // Mobile positioning
          "sm:border sm:rounded-lg sm:h-auto sm:max-w-lg sm:w-full", // Desktop reset
          "sm:top-[50%] sm:left-[50%] sm:-translate-x-1/2 sm:-translate-y-1/2", // Desktop positioning
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-6 text-primary" />
            Ajouter un point
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-0">
          <AddPointForm onSuccess={() => setShow && setShow(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
