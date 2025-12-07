import { cn } from "@/lib/utils";
import * as React from "react";

interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        className={cn(
          "inline-flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          // Horizontal
          orientation === "horizontal" && [
            "[&>button:first-child]:rounded-r-none",
            "[&>button:last-child]:rounded-l-none",
            "[&>button:not(:first-child):not(:last-child)]:rounded-none",
            "[&>button:not(:first-child)]:-ml-px",
            "[&>button:hover]:z-10",
            "[&>button:focus-visible]:z-10",
          ],
          // Vertical
          orientation === "vertical" && [
            "[&>button:first-child]:rounded-b-none",
            "[&>button:last-child]:rounded-t-none",
            "[&>button:not(:first-child):not(:last-child)]:rounded-none",
            "[&>button:not(:first-child)]:-mt-px",
            "[&>button:hover]:z-10",
            "[&>button:focus-visible]:z-10",
          ],
          className
        )}
        {...props}
      />
    );
  }
);
ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };
