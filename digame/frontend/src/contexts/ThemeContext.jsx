import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [customTheme, setCustomTheme] = useState(null);
  const [animations, setAnimations] = useState(true);
  const [highContrast, setHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('medium');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('digame-theme');
    const savedCustomTheme = localStorage.getItem('digame-custom-theme');
    const savedAnimations = localStorage.getItem('digame-animations');
    const savedHighContrast = localStorage.getItem('digame-high-contrast');
    const savedFontSize = localStorage.getItem('digame-font-size');

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }

    if (savedCustomTheme) {
      setCustomTheme(JSON.parse(savedCustomTheme));
    }

    if (savedAnimations !== null) {
      setAnimations(savedAnimations === 'true');
    }

    if (savedHighContrast !== null) {
      setHighContrast(savedHighContrast === 'true');
    }

    if (savedFontSize) {
      setFontSize(savedFontSize);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark', 'custom');
    
    // Add current theme class
    root.classList.add(theme);
    
    // Apply custom theme variables if available
    if (theme === 'custom' && customTheme) {
      Object.entries(customTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value);
      });
    }
    
    // Apply accessibility settings
    root.classList.toggle('high-contrast', highContrast);
    root.classList.toggle('no-animations', !animations);
    root.setAttribute('data-font-size', fontSize);
    
    // Save to localStorage
    localStorage.setItem('digame-theme', theme);
    localStorage.setItem('digame-animations', animations.toString());
    localStorage.setItem('digame-high-contrast', highContrast.toString());
    localStorage.setItem('digame-font-size', fontSize);
    
    if (customTheme) {
      localStorage.setItem('digame-custom-theme', JSON.stringify(customTheme));
    }
  }, [theme, customTheme, animations, highContrast, fontSize]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('digame-theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setCustomThemeColors = (colors) => {
    const newCustomTheme = {
      name: 'Custom',
      colors: {
        primary: colors.primary || '#3b82f6',
        secondary: colors.secondary || '#64748b',
        accent: colors.accent || '#8b5cf6',
        background: colors.background || '#ffffff',
        surface: colors.surface || '#f8fafc',
        text: colors.text || '#1e293b',
        textSecondary: colors.textSecondary || '#64748b',
        border: colors.border || '#e2e8f0',
        success: colors.success || '#10b981',
        warning: colors.warning || '#f59e0b',
        error: colors.error || '#ef4444',
        info: colors.info || '#3b82f6'
      }
    };
    
    setCustomTheme(newCustomTheme);
    setTheme('custom');
  };

  const resetTheme = () => {
    setCustomTheme(null);
    setTheme('light');
    setAnimations(true);
    setHighContrast(false);
    setFontSize('medium');
    localStorage.removeItem('digame-custom-theme');
  };

  const value = {
    theme,
    setTheme,
    customTheme,
    setCustomThemeColors,
    animations,
    setAnimations,
    highContrast,
    setHighContrast,
    fontSize,
    setFontSize,
    toggleTheme,
    resetTheme,
    isDark: theme === 'dark',
    isCustom: theme === 'custom'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;