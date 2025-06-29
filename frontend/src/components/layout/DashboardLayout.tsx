import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from '../navigation/Sidebar';
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
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to open on desktop

  const toggleSidebar = () => {
    console.log('Hamburger menu clicked! Current state:', sidebarOpen);
    alert('Hamburger menu clicked! Current state: ' + sidebarOpen);
    setSidebarOpen(!sidebarOpen);
    console.log('New state will be:', !sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Always visible on desktop */}
      {sidebarOpen && (
        <Sidebar
          isDemoMode={isDemoMode}
          onLogout={onLogout}
          currentUser={currentUser}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-md"
                style={{ border: '2px solid red' }}
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Digame Dashboard</h1>
              {isDemoMode && (
                <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  Demo Mode
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">
                Welcome, {currentUser?.name || 'User'}
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