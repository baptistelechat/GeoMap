import { useState } from 'react';
import { Menu, X, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MobileHeaderProps {
  onToggleSidebar: () => void;
}

export function MobileHeader({ onToggleSidebar }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPin className="text-blue-600" size={24} />
          <h1 className="text-lg font-bold text-gray-800">GeoMark</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            to="/export"
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Page d'export"
          >
            <ExternalLink size={20} />
          </Link>
          <button
            onClick={onToggleSidebar}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}