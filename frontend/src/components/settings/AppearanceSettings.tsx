/**
 * Appearance Settings Component
 * 
 * User interface customization and appearance preferences
 */

import React, { useState, useEffect } from 'react';
import { Palette, Monitor, Sun, Moon, Smartphone, Save, Eye, Layout, Type, Zap } from 'lucide-react';

interface AppearanceSettingsProps {
  onMessage: (message: { type: 'success' | 'error' | 'info'; text: string }) => void;
  onLoading: (loading: boolean) => void;
}

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  color_scheme: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
  font_size: 'small' | 'medium' | 'large' | 'extra-large';
  font_family: 'system' | 'serif' | 'mono';
  layout_density: 'compact' | 'comfortable' | 'spacious';
  sidebar_position: 'left' | 'right';
  show_animations: boolean;
  reduce_motion: boolean;
  high_contrast: boolean;
  custom_css: string;
  dashboard_layout: {
    show_welcome_banner: boolean;
    default_view: 'grid' | 'list' | 'cards';
    items_per_page: number;
    show_quick_actions: boolean;
  };
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ onMessage, onLoading }) => {
  const [settings, setSettings] = useState<AppearanceSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const colorSchemes = [
    { value: 'blue', name: 'Blue', color: 'bg-blue-500' },
    { value: 'green', name: 'Green', color: 'bg-green-500' },
    { value: 'purple', name: 'Purple', color: 'bg-purple-500' },
    { value: 'orange', name: 'Orange', color: 'bg-orange-500' },
    { value: 'red', name: 'Red', color: 'bg-red-500' },
    { value: 'indigo', name: 'Indigo', color: 'bg-indigo-500' },
  ];

  const fontFamilies = [
    { value: 'system', name: 'System Default', preview: 'The quick brown fox jumps over the lazy dog' },
    { value: 'serif', name: 'Serif', preview: 'The quick brown fox jumps over the lazy dog' },
    { value: 'mono', name: 'Monospace', preview: 'The quick brown fox jumps over the lazy dog' },
  ];

  useEffect(() => {
    loadAppearanceSettings();
  }, []);

  const loadAppearanceSettings = async () => {
    try {
      onLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/appearance-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        applyThemePreview(data);
      } else {
        throw new Error('Failed to load appearance settings');
      }
    } catch (error) {
      onMessage({ type: 'error', text: 'Failed to load appearance settings' });
      // Set default settings if loading fails
      setSettings({
        theme: 'system',
        color_scheme: 'blue',
        font_size: 'medium',
        font_family: 'system',
        layout_density: 'comfortable',
        sidebar_position: 'left',
        show_animations: true,
        reduce_motion: false,
        high_contrast: false,
        custom_css: '',
        dashboard_layout: {
          show_welcome_banner: true,
          default_view: 'grid',
          items_per_page: 12,
          show_quick_actions: true,
        }
      });
    } finally {
      onLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/appearance-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        onMessage({ type: 'success', text: 'Appearance settings updated successfully' });
        applyThemePreview(settings);
      } else {
        throw new Error('Failed to save appearance settings');
      }
    } catch (error) {
      onMessage({ type: 'error', text: 'Failed to save appearance settings' });
    } finally {
      setSaving(false);
    }
  };

  const applyThemePreview = (newSettings: AppearanceSettings) => {
    if (!previewMode) return;

    const root = document.documentElement;
    
    // Apply theme
    if (newSettings.theme === 'dark') {
      root.classList.add('dark');
    } else if (newSettings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply color scheme
    root.setAttribute('data-color-scheme', newSettings.color_scheme);
    
    // Apply font size
    root.setAttribute('data-font-size', newSettings.font_size);
    
    // Apply font family
    root.setAttribute('data-font-family', newSettings.font_family);
    
    // Apply layout density
    root.setAttribute('data-layout-density', newSettings.layout_density);
  };

  const resetToDefaults = () => {
    if (!settings) return;
    
    const defaultSettings: AppearanceSettings = {
      theme: 'system',
      color_scheme: 'blue',
      font_size: 'medium',
      font_family: 'system',
      layout_density: 'comfortable',
      sidebar_position: 'left',
      show_animations: true,
      reduce_motion: false,
      high_contrast: false,
      custom_css: '',
      dashboard_layout: {
        show_welcome_banner: true,
        default_view: 'grid',
        items_per_page: 12,
        show_quick_actions: true,
      }
    };
    
    setSettings(defaultSettings);
    if (previewMode) {
      applyThemePreview(defaultSettings);
    }
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading appearance settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
          <p className="text-sm text-gray-600">Customize the look and feel of your interface</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setPreviewMode(!previewMode);
              if (!previewMode) {
                applyThemePreview(settings);
              }
            }}
            className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
              previewMode 
                ? 'border-blue-600 text-blue-600 bg-blue-50' 
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Exit Preview' : 'Preview'}
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Palette className="w-5 h-5 text-gray-400" />
          <h4 className="text-md font-medium text-gray-900">Theme</h4>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => {
              const newSettings = { ...settings, theme: 'light' as const };
              setSettings(newSettings);
              if (previewMode) applyThemePreview(newSettings);
            }}
            className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 ${
              settings.theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Sun className="w-6 h-6 text-yellow-500" />
            <span className="text-sm font-medium">Light</span>
          </button>
          <button
            onClick={() => {
              const newSettings = { ...settings, theme: 'dark' as const };
              setSettings(newSettings);
              if (previewMode) applyThemePreview(newSettings);
            }}
            className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 ${
              settings.theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Moon className="w-6 h-6 text-gray-600" />
            <span className="text-sm font-medium">Dark</span>
          </button>
          <button
            onClick={() => {
              const newSettings = { ...settings, theme: 'system' as const };
              setSettings(newSettings);
              if (previewMode) applyThemePreview(newSettings);
            }}
            className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 ${
              settings.theme === 'system' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Monitor className="w-6 h-6 text-gray-600" />
            <span className="text-sm font-medium">System</span>
          </button>
        </div>
      </div>

      {/* Color Scheme */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Color Scheme</h4>
        <div className="grid grid-cols-6 gap-3">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.value}
              onClick={() => {
                const newSettings = { ...settings, color_scheme: scheme.value as any };
                setSettings(newSettings);
                if (previewMode) applyThemePreview(newSettings);
              }}
              className={`p-3 border-2 rounded-lg flex flex-col items-center space-y-2 ${
                settings.color_scheme === scheme.value ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-6 h-6 rounded-full ${scheme.color}`}></div>
              <span className="text-xs font-medium">{scheme.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Type className="w-5 h-5 text-gray-400" />
          <h4 className="text-md font-medium text-gray-900">Typography</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
            <select
              value={settings.font_size}
              onChange={(e) => {
                const newSettings = { ...settings, font_size: e.target.value as any };
                setSettings(newSettings);
                if (previewMode) applyThemePreview(newSettings);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
            <select
              value={settings.font_family}
              onChange={(e) => {
                const newSettings = { ...settings, font_family: e.target.value as any };
                setSettings(newSettings);
                if (previewMode) applyThemePreview(newSettings);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {fontFamilies.map((font) => (
                <option key={font.value} value={font.value}>{font.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <p className={`text-${settings.font_size} ${
            settings.font_family === 'serif' ? 'font-serif' : 
            settings.font_family === 'mono' ? 'font-mono' : 'font-sans'
          }`}>
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </div>

      {/* Layout */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Layout className="w-5 h-5 text-gray-400" />
          <h4 className="text-md font-medium text-gray-900">Layout</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Layout Density</label>
            <select
              value={settings.layout_density}
              onChange={(e) => {
                const newSettings = { ...settings, layout_density: e.target.value as any };
                setSettings(newSettings);
                if (previewMode) applyThemePreview(newSettings);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sidebar Position</label>
            <select
              value={settings.sidebar_position}
              onChange={(e) => setSettings({ ...settings, sidebar_position: e.target.value as any })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accessibility */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Accessibility</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Reduce Motion</p>
              <p className="text-xs text-gray-500">Minimize animations and transitions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reduce_motion}
                onChange={(e) => setSettings({ ...settings, reduce_motion: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">High Contrast</p>
              <p className="text-xs text-gray-500">Increase contrast for better visibility</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.high_contrast}
                onChange={(e) => setSettings({ ...settings, high_contrast: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Dashboard Layout */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">Dashboard Layout</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default View</label>
            <select
              value={settings.dashboard_layout.default_view}
              onChange={(e) => setSettings({
                ...settings,
                dashboard_layout: { ...settings.dashboard_layout, default_view: e.target.value as any }
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="grid">Grid</option>
              <option value="list">List</option>
              <option value="cards">Cards</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Items per Page</label>
            <select
              value={settings.dashboard_layout.items_per_page}
              onChange={(e) => setSettings({
                ...settings,
                dashboard_layout: { ...settings.dashboard_layout, items_per_page: parseInt(e.target.value) }
              })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="6">6</option>
              <option value="12">12</option>
              <option value="24">24</option>
              <option value="48">48</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Show Welcome Banner</p>
              <p className="text-xs text-gray-500">Display welcome message on dashboard</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dashboard_layout.show_welcome_banner}
                onChange={(e) => setSettings({
                  ...settings,
                  dashboard_layout: { ...settings.dashboard_layout, show_welcome_banner: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Reset to Defaults */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-md font-medium text-gray-900">Reset Settings</h4>
            <p className="text-sm text-gray-600">Restore all appearance settings to their default values</p>
          </div>
          <button
            onClick={resetToDefaults}
            className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
          >
            <Zap className="w-4 h-4 mr-2" />
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;