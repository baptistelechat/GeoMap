import { AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface SidebarListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  emptyMessage: ReactNode;
  className?: string;
}

export function SidebarList<T>({
  items,
  renderItem,
  emptyMessage,
  className,
}: SidebarListProps<T>) {
  if (items.length === 0) {
    return <>{emptyMessage}</>;
  }

  return (
    <div className={`w-full px-2 space-y-2 ${className || ""}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map(renderItem)}
      </AnimatePresence>
    </div>
  );
}
