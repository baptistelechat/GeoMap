import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { ColorPicker } from "../shared/ColorPicker";

interface FeaturesActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shapeType: string;
  existingNames: string[];
  onConfirm: (name: string, color: string) => void;
}

const DEFAULT_COLOR = "#65a30d"; // lime-600

export function FeaturesActionDialog({
  open,
  onOpenChange,
  shapeType,
  existingNames,
  onConfirm,
}: FeaturesActionDialogProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);

  // Generate default name when dialog opens
  useEffect(() => {
    if (open && shapeType) {
      let counter = 1;
      let candidate = `${shapeType} ${counter}`;

      // Case insensitive check
      while (
        existingNames.some((n) => n.toLowerCase() === candidate.toLowerCase())
      ) {
        counter++;
        candidate = `${shapeType} ${counter}`;
      }

      setName(candidate);
      setColor(DEFAULT_COLOR);
    }
  }, [open, shapeType, existingNames]);

  const handleSave = () => {
    if (!name.trim()) return;
    onConfirm(name, color);
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Nouvelle forme</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label>Couleur</Label>
            <ColorPicker color={color} onChange={setColor} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Créer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
