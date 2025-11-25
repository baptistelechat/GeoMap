import { useState } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { MapView } from '@/components/MapView'
import { MobileHeader } from '@/components/MobileHeader'

export default function MainMap() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row">
      {/* Header mobile */}
      <MobileHeader onToggleSidebar={toggleSidebar} />
      
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-80 bg-white shadow-lg h-full">
        <Sidebar />
      </div>
      
      {/* Sidebar - Mobile (overlay) */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-80 bg-white h-full shadow-xl">
            <Sidebar />
          </div>
          <div 
            className="flex-1 bg-black bg-opacity-50" 
            onClick={toggleSidebar}
          />
        </div>
      )}
      
      {/* Carte */}
      <div className="flex-1 h-[calc(100vh-60px)] lg:h-full">
        <MapView />
      </div>
    </div>
  );
}
