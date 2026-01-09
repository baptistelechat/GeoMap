import { useSidebar } from "@/components/ui/sidebar";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import Joyride, { CallBackProps, EVENTS, STATUS } from "react-joyride";
import { getOnboardingSteps } from "./onboarding-steps";

export function Onboarding() {
  const {
    run,
    stepIndex,
    onboardingCompleted,
    lastAction,
    startOnboarding,
    completeOnboarding,
    setStepIndex,
  } = useOnboardingStore();

  const { state: sidebarState, isMobile } = useSidebar();
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

  const steps = useMemo(
    () => getOnboardingSteps(sidebarState, isMobile),
    [sidebarState, isMobile]
  );

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      completeOnboarding();
    } else if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      // Gestion de la navigation (précédent / suivant)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const actionType = (data as any).action;
      
      if (actionType === 'prev') {
        setStepIndex(index - 1);
      } else if (!steps[index]?.data?.expectedAction) {
        // Avancer seulement si on n'attend pas une action spécifique
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
  }, [lastAction, run, stepIndex, mounted, steps, setStepIndex]);

  if (!mounted) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress={false}
      showSkipButton
      hideCloseButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#65a30d", // primary / lime-600
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
