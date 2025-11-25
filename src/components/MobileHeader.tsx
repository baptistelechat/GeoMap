import { Button } from "@/components/ui/button";
import { ExternalLink, MapPin, Menu } from "lucide-react";
import { Link } from "react-router-dom";

interface MobileHeaderProps {
  onToggleSidebar: () => void;
}

export function MobileHeader({ onToggleSidebar }: MobileHeaderProps) {
  return (
    <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPin className="text-blue-600" size={24} />
          <h1 className="text-lg font-bold text-gray-800">GeoMark</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <Link to="/export" title="Page d'export">
              <ExternalLink size={20} />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
          >
            <Menu size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
