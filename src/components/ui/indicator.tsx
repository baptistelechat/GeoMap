import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface IndicatorProps {
  isVisible: boolean;
  className?: string;
}

export function Indicator({ isVisible, className }: IndicatorProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn("absolute top-1 right-1 flex size-2 z-20", className)}
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
        </motion.span>
      )}
    </AnimatePresence>
  );
}
