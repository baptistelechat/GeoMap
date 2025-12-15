import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Génère un ID unique.
 * Utilise crypto.randomUUID si disponible (contexte sécurisé),
 * sinon utilise un fallback compatible avec tous les navigateurs.
 */
export function generateId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  // Fallback simple et robuste
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Determines the best contrasting text color (black or white) for a given background hex color.
 * Uses the YIQ formula for perception-based contrast.
 */
export function getContrastingTextColor(
  color: string
): "text-black" | "text-white" {
  if (!color) return "text-black";

  // Handle OKLCH (Tailwind v4 default)
  if (color.startsWith("oklch")) {
    const match = color.match(/oklch\(([\d.]+)%?\s/);
    if (match) {
      const lightness = parseFloat(match[1]);
      // Threshold around 0.6-0.7 for OKLCH lightness
      // Higher L means lighter.
      return lightness > 0.65 ? "text-black" : "text-white";
    }
  }

  // Handle Hex
  if (color.startsWith("#") || /^[0-9A-F]{3,6}$/i.test(color)) {
    // Remove hash if present
    const cleanHex = color.replace("#", "");

    // Parse r, g, b
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    // Calculate YIQ
    // (R*299 + G*587 + B*114) / 1000
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;

    // Seuil ajusté à 165 (standard 128) pour préférer le blanc sur des couleurs comme slate-400 ou green-500
    return yiq >= 165 ? "text-black" : "text-white";
  }

  // Default fallback
  return "text-black";
}
