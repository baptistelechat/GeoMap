import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useGeomarkStore } from "@/store/geomarkStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { RotateCcw } from "lucide-react";

export function ResetButton({
  className,
  variant = "outline",
  size = "icon",
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { clearPoints, clearFeatures } = useGeomarkStore();
  const { resetOnboarding } = useOnboardingStore();

  const handleReset = () => {
    clearPoints();
    clearFeatures();
    resetOnboarding();
    window.location.reload(); // Pour être sûr de tout nettoyer proprement
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className={className}
          variant={variant}
          size={size}
          title="Réinitialiser l'application"
          {...props}
        >
          {children || <RotateCcw className="size-6 text-destructive" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Réinitialiser l'application ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action supprimera tous les points et toutes les formes créés.
            L'application sera rechargée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleReset}
            className="bg-destructive hover:bg-destructive/90"
          >
            Réinitialiser
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
