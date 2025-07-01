import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import NextJSComprehensiveNavigation from '../navigation/NextJSComprehensiveNavigation';
import { Button } from '../ui/Button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  isDemoMode?: boolean;
  currentUser?: any;
  onLogout?: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  isDemoMode = false,
  currentUser,
  onLogout = () => {}
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile sidebar state

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Comprehensive Navigation - Always visible on desktop, toggleable on mobile */}
      <NextJSComprehensiveNavigation
        isDemoMode={isDemoMode}
        onLogout={onLogout}
        currentUser={currentUser}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        showAllFeatures={true}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
                type="button"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Digame - Complete Platform Access</h1>
              {isDemoMode && (
                <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  Demo Mode
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                All Backend Features Available
              </div>
            </div>
          </div>
        </header>
        
        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;