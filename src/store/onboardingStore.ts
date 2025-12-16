import { create } from "zustand";
import { persist } from "zustand/middleware";

interface OnboardingStore {
  run: boolean;
  stepIndex: number;
  onboardingCompleted: boolean;
  
  startOnboarding: () => void;
  stopOnboarding: () => void;
  completeOnboarding: () => void;
  setStepIndex: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetOnboarding: () => void;
  lastAction: string | null;
  notifyAction: (action: string) => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      run: false,
      stepIndex: 0,
      onboardingCompleted: false,
      lastAction: null,

      startOnboarding: () => set((state) => ({ 
        run: !state.onboardingCompleted, 
        stepIndex: 0,
        lastAction: null
      })),
      
      stopOnboarding: () => set({ run: false }),
      
      completeOnboarding: () => set({ 
        run: false, 
        onboardingCompleted: true 
      }),
      
      setStepIndex: (index) => set({ stepIndex: index, lastAction: null }),
      
      nextStep: () => set((state) => ({ 
        stepIndex: state.stepIndex + 1,
        lastAction: null
      })),
      
      prevStep: () => set((state) => ({ 
        stepIndex: Math.max(0, state.stepIndex - 1),
        lastAction: null
      })),
      
      resetOnboarding: () => set({ 
        run: true, 
        stepIndex: 0, 
        onboardingCompleted: false,
        lastAction: null
      }),

      notifyAction: (action) => set({ lastAction: action }),
    }),
    {
      name: "onboarding-storage",
      partialize: (state) => ({
        onboardingCompleted: state.onboardingCompleted,
      }),
    }
  )
);
