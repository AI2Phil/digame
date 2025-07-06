import React, { useContext, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Monitor, Palette, Type, Eye, Zap } from 'lucide-react';

/**
 * @typedef {Object} ThemeToggleProps
 * @property {'default'|'simple'|'dropdown'} [variant] - Toggle variant style
 * @property {boolean} [showLabel] - Whether to show labels
 */

const ThemeToggle = (/** @type {ThemeToggleProps} */ { variant = 'default', showLabel = true }) => {
  const /** @type {any} */ {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast
  } = useTheme();

  // Local state for reducedMotion since it's not in ThemeContext
  const [reducedMotion, setReducedMotion] = useState(false);

  const themeOptions = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' }
  ];

  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Large' },
    { value: 'extra-large', label: 'Extra Large' }
  ];

  if (variant === 'simple') {
    return (
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="theme-transition p-2 rounded-lg border border-gray-200 dark:border-gray-700 
                   hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5" />
        ) : (
          <Sun className="w-5 h-5" />
        )}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative group">
        <button
          className="theme-transition p-2 rounded-lg border border-gray-200 dark:border-gray-700 
                     hover:bg-gray-100 dark:hover:bg-gray-800 focus-visible flex items-center gap-2"
          aria-label="Theme settings"
          aria-expanded="false"
          aria-haspopup="true"
        >
          <Palette className="w-5 h-5" />
          {showLabel && <span className="text-sm">Theme</span>}
        </button>
        
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg 
                        border border-gray-200 dark:border-gray-700 opacity-0 invisible 
                        group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 
                        group-focus-within:visible transition-all duration-200 z-50">
          <div className="p-4 space-y-4">
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Appearance</label>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={`theme-transition p-2 rounded-md border text-sm flex flex-col items-center gap-1
                               ${theme === value 
                                 ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                                 : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                               } focus-visible`}
                    aria-pressed={theme === value}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Type className="w-4 h-4 inline mr-1" />
                Font Size
              </label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-md 
                           bg-white dark:bg-gray-700 text-sm focus-visible"
              >
                {fontSizeOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Accessibility Options */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">
                <Eye className="w-4 h-4 inline mr-1" />
                Accessibility
              </h4>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">High contrast</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Reduce motion
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant - button group
  return (
    <div className="flex items-center gap-2">
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Theme:
        </span>
      )}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {themeOptions.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`theme-transition px-3 py-2 text-sm flex items-center gap-2 border-r 
                       border-gray-200 dark:border-gray-700 last:border-r-0 focus-visible
                       ${theme === value 
                         ? 'bg-blue-500 text-white' 
                         : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                       }`}
            aria-pressed={theme === value}
            title={`Switch to ${label.toLowerCase()} mode`}
          >
            <Icon className="w-4 h-4" />
            {showLabel && <span>{label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeToggle;