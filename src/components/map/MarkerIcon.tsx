import { primaryColor } from "@/constants/tailwindThemeColor";
import { getContrastingTextColor } from "@/lib/utils";
import {
  Building,
  Camera,
  Coffee,
  Flag,
  Heart,
  Home,
  MapPin,
  ShoppingCart,
  Star,
  Utensils,
} from "lucide-react";

export const AVAILABLE_ICONS = [
  { name: "pin", icon: MapPin, label: "Pin" },
  { name: "home", icon: Home, label: "Maison" },
  { name: "building", icon: Building, label: "Bâtiment" },
  { name: "flag", icon: Flag, label: "Drapeau" },
  { name: "star", icon: Star, label: "Favori" },
  { name: "heart", icon: Heart, label: "Cœur" },
  { name: "camera", icon: Camera, label: "Photo" },
  { name: "utensils", icon: Utensils, label: "Restaurant" },
  { name: "coffee", icon: Coffee, label: "Café" },
  { name: "cart", icon: ShoppingCart, label: "Commerce" },
] as const;

interface MarkerIconProps {
  iconName?: string;
  color?: string;
  className?: string;
}

export function MarkerIcon({
  iconName = "pin",
  color = primaryColor,
  className = "",
}: MarkerIconProps) {
  const iconEntry =
    AVAILABLE_ICONS.find((i) => i.name === iconName) || AVAILABLE_ICONS[0];
  const IconComponent = iconEntry.icon;

  return (
    <div
      className={`relative flex items-center justify-center w-8 h-8 rounded-full shadow-md border-2 border-white ${className}`}
      style={{ backgroundColor: color }}
    >
      <IconComponent className={`w-4 h-4 ${getContrastingTextColor(color)}`} />
    </div>
  );
}
