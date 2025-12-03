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

export const AVAILABLE_COLORS = [
  { name: "Rouge", value: "#ef4444", class: "bg-red-500" },
  { name: "Orange", value: "#f97316", class: "bg-orange-500" },
  { name: "Ambre", value: "#f59e0b", class: "bg-amber-500" },
  { name: "Vert", value: "#22c55e", class: "bg-green-500" },
  { name: "Émeraude", value: "#10b981", class: "bg-emerald-500" },
  { name: "Bleu", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Indigo", value: "#6366f1", class: "bg-indigo-500" },
  { name: "Violet", value: "#8b5cf6", class: "bg-violet-500" },
  { name: "Rose", value: "#ec4899", class: "bg-pink-500" },
  { name: "Gris", value: "#64748b", class: "bg-slate-500" },
] as const;

interface MarkerIconProps {
  iconName?: string;
  color?: string;
  className?: string;
}

export function MarkerIcon({
  iconName = "pin",
  color = "#3b82f6",
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
      <IconComponent className="w-4 h-4 text-white" />
    </div>
  );
}
