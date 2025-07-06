import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Settings,
  TestTube,
  BarChart3,
  Shield,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  description: string;
}

const PlatformOwnerLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuItem[] = [
    {
      id: 'console',
      label: 'Console',
      icon: <BarChart3 className="w-5 h-5" />,
      path: '/platform-owner/console',
      description: 'Platform overview and metrics'
    },
    {
      id: 'settings',
      label: 'Platform Settings',
      icon: <Settings className="w-5 h-5" />,
      path: '/platform-owner/settings',
      description: 'Configure platform settings'
    },
    {
      id: 'test-zone',
      label: 'Test Zone',
      icon: <TestTube className="w-5 h-5" />,
      path: '/platform-owner/test-zone',
      description: 'API testing and validation'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <Users className="w-5 h-5" />,
      path: '/platform-owner/users',
      description: 'Manage platform users'
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="w-5 h-5" />,
      path: '/platform-owner/security',
      description: 'Security settings and monitoring'
    },
    {
      id: 'monitoring',
      label: 'System Monitoring',
      icon: <Activity className="w-5 h-5" />,
      path: '/platform-owner/monitoring',
      description: 'System health and performance'
    }
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleMenuClick = (item: MenuItem) => {
    navigate(item.path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Platform Owner</h1>
                <p className="text-sm text-gray-500">Management Console</p>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="p-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item)}
              className={`w-full flex items-center p-3 rounded-lg transition-colors mb-1 ${
                isActiveRoute(item.path)
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              title={sidebarCollapsed ? item.label : ''}
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              {!sidebarCollapsed && (
                <div className="ml-3 text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {menuItems.find(item => isActiveRoute(item.path))?.label || 'Platform Owner'}
              </h2>
              <p className="text-sm text-gray-500">
                {menuItems.find(item => isActiveRoute(item.path))?.description || 'Platform management and administration'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">System Healthy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default PlatformOwnerLayout;