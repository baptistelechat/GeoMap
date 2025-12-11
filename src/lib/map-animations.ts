
export const ANIMATION_DURATION = 300;
export const FADE_IN_CLASS = "item-fade-in";
export const FADE_OUT_CLASS = "item-fade-out";

/**
 * Applies fade-in animation class to an element.
 * @param element The DOM element to animate
 */
export const applyFadeIn = (element: HTMLElement) => {
  element.classList.add(FADE_IN_CLASS);
  // Clean up class after animation ensures no conflict if we want to animate out later
  // although usually not strictly necessary if unmounting resets state
  setTimeout(() => {
    element.classList.remove(FADE_IN_CLASS);
  }, 500); // 500ms matches CSS animation duration
};

/**
 * Applies fade-out animation class to an element.
 * @param element The DOM element to animate
 */
export const applyFadeOut = (element: HTMLElement) => {
  element.classList.add(FADE_OUT_CLASS);
};
