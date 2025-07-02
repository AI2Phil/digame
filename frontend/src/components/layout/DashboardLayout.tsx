import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import ComprehensiveNavigation from '../navigation/ComprehensiveNavigation';
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

  // Transform AuthContext user to match ComprehensiveNavigation expected format
  const adaptedUser = currentUser ? {
    name: currentUser.name || currentUser.fullName || currentUser.firstName || currentUser.username,
    role: currentUser.role,
    is_platform_owner: currentUser.isPlatformOwner, // Convert camelCase to snake_case
    subscription_tier: currentUser.subscriptionTier, // Convert camelCase to snake_case
    tenant_id: currentUser.tenant_id || 1, // Provide default if missing
    tenant_name: currentUser.tenant_name || 'Default Tenant', // Provide default if missing
    permissions: currentUser.permissions || []
  } : null;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Comprehensive Navigation - Always visible on desktop, toggleable on mobile */}
      <ComprehensiveNavigation
        isDemoMode={isDemoMode}
        onLogout={onLogout}
        currentUser={adaptedUser}
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