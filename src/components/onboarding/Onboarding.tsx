import { useSidebar } from "@/components/ui/sidebar";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import Joyride, { CallBackProps, EVENTS, STATUS, Step } from "react-joyride";

export function Onboarding() {
  const {
    run,
    stepIndex,
    onboardingCompleted,
    lastAction,
    startOnboarding,
    stopOnboarding,
    completeOnboarding,
    setStepIndex,
  } = useOnboardingStore();

  const { state: sidebarState } = useSidebar();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lancer l'onboarding si jamais terminé
  useEffect(() => {
    if (mounted && !onboardingCompleted && !run) {
      // Petit délai pour laisser l'interface se charger
      const timer = setTimeout(() => {
        startOnboarding();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [mounted, onboardingCompleted, run, startOnboarding]);

  const steps: Step[] = useMemo(
    () => [
      {
        target: "body",
        content: (
          <div className="space-y-2">
            <h3 className="font-bold text-lg">Bienvenue sur GeoMapy ! 👋</h3>
            <p>
              Laissez-nous vous guider à travers les fonctionnalités principales
              de l'application pour une prise en main rapide et efficace.
            </p>
          </div>
        ),
        placement: "center",
        disableBeacon: true,
      },
      {
        target: "#onboarding-search-address",
        content: (
          <div className="space-y-2">
            <h3 className="font-bold">Recherche d'adresse</h3>
            <p>
              Commencez par rechercher une adresse, une ville ou un lieu pour
              centrer la carte.
            </p>
          </div>
        ),
        placement: "bottom",
      },
      {
        target: "#onboarding-sidebar-trigger",
        content: (
          <div className="space-y-2">
            <h3 className="font-bold">Navigation</h3>
            <p>
              Cliquez sur ce bouton pour replier ou déplier le panneau latéral.
            </p>
          </div>
        ),
        placement: "right",
        disableOverlayClose: true,
        spotlightClicks: true,
        styles: {
          buttonNext: {
            display: "none",
          },
        },
        data: { expectedAction: "TOGGLE_SIDEBAR" },
      },
      ...(sidebarState === "collapsed"
        ? [
            {
              target: "#onboarding-add-point",
              content: (
                <div className="space-y-2">
                  <h3 className="font-bold">Ajouter un point</h3>
                  <p>
                    Cliquez sur le bouton "+" pour ouvrir le formulaire d'ajout
                    de point.
                  </p>
                </div>
              ),
              placement: "right" as const,
              disableOverlayClose: true,
              spotlightClicks: true,
              styles: {
                buttonNext: {
                  display: "none",
                },
              },
              data: { expectedAction: "OPEN_ADD_POINT" },
            },
          ]
        : []),
      {
        target: sidebarState === "collapsed" ? "body" : "#onboarding-add-point",
        content: (
          <div className="space-y-2">
            <h3 className="font-bold">Remplissez le formulaire</h3>
            <p>
              Saisissez les informations de votre point et validez pour le
              créer.
            </p>
          </div>
        ),
        placement: sidebarState === "collapsed" ? "center" : "right",
        disableOverlayClose: true,
        styles: {
          buttonNext: {
            display: "none",
          },
        },
        data: { expectedAction: "POINT_ADDED" },
      },
      {
        target: "#onboarding-points-list",
        content: (
          <div className="space-y-2">
            <h3 className="font-bold">Vos points</h3>
            <p>
              Retrouvez ici la liste de tous vos points. Vous pouvez les
              modifier, les supprimer ou zoomer dessus.
            </p>
          </div>
        ),
        placement: "right",
      },
      {
        target: "#onboarding-features-list",
        content: (
          <div className="space-y-2">
            <h3 className="font-bold">Vos formes</h3>
            <p>
              Gérez ici les formes géométriques (lignes, polygones) que vous
              avez dessinées sur la carte.
            </p>
          </div>
        ),
        placement: "right",
      },
      {
        target: "#onboarding-footer-actions",
        content: (
          <div className="space-y-2">
            <h3 className="font-bold">Import / Export</h3>
            <p>
              Sauvegardez votre travail en exportant vos données (JSON/CSV) ou
              importez des données existantes.
            </p>
          </div>
        ),
        placement: "top",
      },
      {
        target: "body",
        content: (
          <div className="space-y-2">
            <h3 className="font-bold text-lg">C'est parti ! 🚀</h3>
            <p>
              Vous êtes maintenant prêt à utiliser GeoMapy. Bonne cartographie !
            </p>
          </div>
        ),
        placement: "center",
      },
    ],
    [sidebarState]
  );

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      completeOnboarding();
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Passer à l'étape suivante (automatique via joyride state interne normalement,
      // mais on synchronise notre store)
      // Only advance if it wasn't an automated advance via lastAction effect to avoid double jump
      // Actually Joyride controls the index if we pass it.
      if (!steps[index]?.data?.expectedAction) {
        setStepIndex(index + 1);
      }
    }
  };

  // Gestion des actions attendues
  useEffect(() => {
    if (!run || !mounted) return;

    const currentStep = steps[stepIndex];
    if (
      currentStep?.data?.expectedAction &&
      lastAction === currentStep.data.expectedAction
    ) {
      setStepIndex(stepIndex + 1);
    }
  }, [lastAction, run, stepIndex, mounted]); // steps is constant

  if (!mounted) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      hideCloseButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#000", // Will be overridden
          backgroundColor: theme === "dark" ? "#18181b" : "#ffffff",
          textColor: theme === "dark" ? "#f4f4f5" : "#09090b",
          arrowColor: theme === "dark" ? "#18181b" : "#ffffff",
        },
        buttonNext: {
          backgroundColor: theme === "dark" ? "#fafafa" : "#18181b",
          color: theme === "dark" ? "#18181b" : "#fafafa",
          borderRadius: "var(--radius)",
          fontSize: "14px",
          fontWeight: 500,
          padding: "8px 16px",
        },
        buttonBack: {
          color: theme === "dark" ? "#a1a1aa" : "#71717a",
          fontSize: "14px",
          marginRight: 10,
        },
        buttonSkip: {
          color: theme === "dark" ? "#a1a1aa" : "#71717a",
          fontSize: "14px",
        },
        tooltip: {
          borderRadius: "8px",
          padding: "20px",
          boxShadow:
            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        spotlight: {
          borderRadius: "8px",
        },
      }}
      locale={{
        back: "Précédent",
        close: "Fermer",
        last: "Terminer",
        next: "Suivant",
        open: "Ouvrir",
        skip: "Passer",
      }}
    />
  );
}
