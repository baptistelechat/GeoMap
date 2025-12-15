import { getFeatureIcon } from "@/lib/map-icons";
import { getContrastColorStyles } from "@/lib/tailwindColors";
import { cn } from "@/lib/utils";
import React from "react";

interface FeatureIconDisplayProps {
  shape?: string;
  color?: string;
  className?: string;
  iconClassName?: string;
}

export function FeatureIconDisplay({
  shape,
  color,
  className,
  iconClassName,
}: FeatureIconDisplayProps) {
  const ShapeIcon = getFeatureIcon(shape);
  const colorStyles = getContrastColorStyles(color);

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full shrink-0",
        "bg-[var(--bg-color)]",
        "dark:bg-[var(--dark-bg-color)]",
        className
      )}
      style={
        {
          "--bg-color": colorStyles.backgroundColor,
          "--icon-color": colorStyles.iconColor,
          "--dark-bg-color": colorStyles.darkBackgroundColor,
          "--dark-icon-color": colorStyles.darkIconColor,
        } as React.CSSProperties
      }
    >
      <ShapeIcon
        className={cn(
          "size-4",
          "text-[var(--icon-color)] dark:text-[var(--dark-icon-color)]",
          iconClassName
        )}
      />
    </div>
  );
}
