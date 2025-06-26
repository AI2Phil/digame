import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Settings } from 'lucide-react';
import { ThemeContext } from '../../contexts/ThemeContext';
import ThemeToggle from '../ui/ThemeToggle';
import Button from '../ui/Button';

const Navigation = ({ isAuthenticated, isDemoMode, onLogout, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { theme } = useContext(ThemeContext);

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', auth: true },
    { name: 'Analytics', href: '/analytics/web', auth: true },
    { name: 'AI Tools', href: '/ai-tools', auth: true },
    { name: 'Teams', href: '/teams', auth: true },
    { name: 'Integrations', href: '/integrations', auth: true },
    { name: 'Reports', href: '/reports', auth: true },
    { name: 'Features', href: '/features', auth: false },
    { name: 'Pricing', href: '/pricing', auth: false },
    { name: 'How It Works', href: '/how-it-works', auth: false }
  ];

  const filteredItems = navigationItems.filter(item => 
    isAuthenticated || isDemoMode ? item.auth : !item.auth
  );

  const isActive = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 theme-transition sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/" 
                className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Digame
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {filteredItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'border-blue-500 text-gray-900 dark:text-gray-100'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <div className="hidden sm:block">
              <ThemeToggle variant="simple" showLabel={false} />
            </div>

            {/* User menu or auth buttons */}
            {isAuthenticated || isDemoMode ? (
              <div className="relative">
                <button
                  onClick={handleUserMenuToggle}
                  className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>

                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700 animate-fade-in">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                      <div className="font-medium">{user?.name || 'User'}</div>
                      <div className="text-gray-500 dark:text-gray-400">{user?.email}</div>
                      {isDemoMode && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Demo Mode</div>
                      )}
                    </div>
                    
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 mt-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={handleMobileMenuToggle}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden animate-slide-in-down">
          <div className="pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            {filteredItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={closeMobileMenu}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile theme toggle */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                <ThemeToggle variant="simple" showLabel={false} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;