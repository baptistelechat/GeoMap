import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TAILWIND_COLORS } from "@/lib/tailwindColors";
import { getContrastingTextColor } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  // Helper to find color name
  const getColorName = (hex: string) => {
    if (!hex) return "Unknown";

    const normalizedHex = hex.toLowerCase();

    if (normalizedHex === "#000000") return "Black";
    if (normalizedHex === "#ffffff") return "White";

    for (const group of TAILWIND_COLORS) {
      for (const [shade, value] of Object.entries(group.shades)) {
        if (value.toLowerCase() === normalizedHex) {
          return `${group.name[0].toUpperCase()}${group.name.slice(
            1
          )} ${shade}`;
        }
      }
    }

    return hex.toUpperCase();
  };

  const colorName = getColorName(color);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between px-3 font-normal"
        >
          <div className="flex items-center gap-2">
            <div
              className="size-5 rounded-sm border border-muted-foreground/20 shadow-sm"
              style={{ backgroundColor: color }}
            />
            <span className="truncate text-muted-foreground">
              {colorName} <span className="opacity-50">({color})</span>
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[350px] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <ScrollArea className="h-[300px] p-4">
          <div className="space-y-4">
            {/* Base Colors (Black & White) */}
            <div className="space-y-1.5">
              <div className="text-xs font-semibold capitalize text-muted-foreground">
                Base
              </div>
              <div className="pl-1 flex gap-2">
                {[
                  { name: "Black", value: "#000000" },
                  { name: "White", value: "#ffffff" },
                ].map((c) => {
                  const isSelected =
                    color.toLowerCase() === c.value.toLowerCase();
                  return (
                    <button
                      key={c.name}
                      className={`
                          group relative size-7 rounded-md border border-input 
                          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1
                          ${
                            isSelected
                              ? "border-foreground/20 z-10 ring-2 ring-offset-1 ring-foreground/20"
                              : "hover:scale-105"
                          }
                        `}
                      style={{ backgroundColor: c.value }}
                      onClick={() => {
                        onChange(c.value);
                        setOpen(false);
                      }}
                      title={`${c.name} (${c.value})`}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check
                            className={`h-4 w-4 drop-shadow-md ${getContrastingTextColor(
                              c.value
                            )}`}
                          />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tailwind Colors */}
            {TAILWIND_COLORS.map((colorGroup) => (
              <div key={colorGroup.name} className="space-y-1.5">
                <div className="text-xs font-semibold capitalize text-muted-foreground">
                  {colorGroup.name}
                </div>
                <div className="pl-1 grid grid-cols-11 gap-1">
                  {Object.entries(colorGroup.shades).map(([shade, value]) => {
                    const isSelected =
                      color.toLowerCase() === value.toLowerCase();

                    return (
                      <button
                        key={`${colorGroup.name}-${shade}`}
                        className={`
                          group relative h-6 w-full rounded-sm border border-transparent 
                          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1
                          ${
                            isSelected
                              ? "border-foreground/20 z-10 ring-2 ring-offset-1 ring-foreground/20"
                              : "hover:scale-110 hover:z-10"
                          }
                        `}
                        style={{ backgroundColor: value }}
                        onClick={() => {
                          onChange(value);
                          setOpen(false);
                        }}
                        title={`${colorGroup.name}-${shade} (${value})`}
                      >
                        {isSelected && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Check
                              className={`h-3 w-3 drop-shadow-md ${getContrastingTextColor(
                                value
                              )}`}
                            />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
