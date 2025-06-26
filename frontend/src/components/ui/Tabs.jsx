import React, { useState, createContext, useContext } from 'react';

// Tabs Context
const TabsContext = createContext();

// Main Tabs component
export const Tabs = ({ 
  children, 
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
  variant = 'default',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue || value);

  const handleTabChange = (newValue) => {
    if (value === undefined) {
      setActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  const currentValue = value !== undefined ? value : activeTab;

  const contextValue = {
    activeTab: currentValue,
    setActiveTab: handleTabChange,
    orientation,
    variant
  };

  const orientationClasses = {
    horizontal: 'flex flex-col',
    vertical: 'flex flex-row'
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={`${orientationClasses[orientation]} ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// Tabs List component
export const TabsList = ({ 
  children, 
  className = '',
  size = 'md'
}) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsList must be used within Tabs');
  }

  const { orientation, variant } = context;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const variantClasses = {
    default: 'border-b border-gray-200',
    pills: 'bg-gray-100 p-1 rounded-lg',
    underline: 'border-b border-gray-200',
    enclosed: 'border-b border-gray-200'
  };

  const orientationClasses = {
    horizontal: 'flex flex-row',
    vertical: 'flex flex-col border-r border-gray-200 min-w-48'
  };

  return (
    <div className={`
      ${orientationClasses[orientation]}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Tab Trigger component
export const TabsTrigger = ({ 
  children, 
  value,
  disabled = false,
  className = ''
}) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs');
  }

  const { activeTab, setActiveTab, orientation, variant } = context;
  const isActive = activeTab === value;

  const handleClick = () => {
    if (!disabled) {
      setActiveTab(value);
    }
  };

  const baseClasses = `
    px-4 py-2 font-medium transition-all duration-200 cursor-pointer
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  const variantClasses = {
    default: `
      border-b-2 -mb-px
      ${isActive 
        ? 'border-blue-600 text-blue-600' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }
    `,
    pills: `
      rounded-md
      ${isActive 
        ? 'bg-white text-gray-900 shadow-sm' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
      }
    `,
    underline: `
      border-b-2 -mb-px
      ${isActive 
        ? 'border-blue-600 text-blue-600' 
        : 'border-transparent text-gray-500 hover:text-gray-700'
      }
    `,
    enclosed: `
      border border-b-0 rounded-t-lg -mb-px
      ${isActive 
        ? 'border-gray-200 bg-white text-gray-900' 
        : 'border-transparent text-gray-500 hover:text-gray-700'
      }
    `
  };

  const orientationClasses = {
    horizontal: 'flex-shrink-0',
    vertical: `
      w-full text-left border-r-2 -mr-px
      ${isActive 
        ? 'border-blue-600 text-blue-600 bg-blue-50' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
      }
    `
  };

  const finalClasses = orientation === 'vertical' 
    ? `${baseClasses} ${orientationClasses[orientation]} ${className}`
    : `${baseClasses} ${variantClasses[variant]} ${orientationClasses[orientation]} ${className}`;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      className={finalClasses}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

// Tab Content component
export const TabsContent = ({ 
  children, 
  value,
  className = ''
}) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsContent must be used within Tabs');
  }

  const { activeTab, orientation } = context;
  const isActive = activeTab === value;

  if (!isActive) return null;

  const orientationClasses = {
    horizontal: 'mt-4',
    vertical: 'ml-4 flex-1'
  };

  return (
    <div 
      role="tabpanel"
      className={`
        animate-fade-in
        ${orientationClasses[orientation]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Animated Tabs with smooth transitions
export const AnimatedTabs = ({ 
  children, 
  defaultValue,
  value,
  onValueChange,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue || value);
  const [previousTab, setPreviousTab] = useState(null);

  const handleTabChange = (newValue) => {
    setPreviousTab(activeTab);
    if (value === undefined) {
      setActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  const currentValue = value !== undefined ? value : activeTab;

  return (
    <div className={`animated-tabs ${className}`}>
      <Tabs value={currentValue} onValueChange={handleTabChange}>
        {children}
      </Tabs>
    </div>
  );
};

// Tab Badge component for notifications
export const TabBadge = ({ 
  children, 
  count,
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-gray-500',
    primary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  };

  if (!count && count !== 0) return children;

  return (
    <div className="relative inline-flex items-center">
      {children}
      <span className={`
        absolute -top-2 -right-2 inline-flex items-center justify-center
        px-2 py-1 text-xs font-bold leading-none text-white
        transform translate-x-1/2 -translate-y-1/2 rounded-full
        ${variantClasses[variant]}
        ${className}
      `}>
        {count > 99 ? '99+' : count}
      </span>
    </div>
  );
};

// Scrollable Tabs for many tabs
export const ScrollableTabs = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <Tabs className={`scrollable-tabs ${className}`} {...props}>
      <div className="overflow-x-auto scrollbar-hide">
        {children}
      </div>
    </Tabs>
  );
};

// Hook for programmatic tab control
export const useTabs = (defaultValue) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const goToTab = (value) => setActiveTab(value);
  const goToNext = (tabs) => {
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex]);
  };
  const goToPrevious = (tabs) => {
    const currentIndex = tabs.indexOf(activeTab);
    const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    setActiveTab(tabs[prevIndex]);
  };

  return {
    activeTab,
    setActiveTab,
    goToTab,
    goToNext,
    goToPrevious
  };
};

export default Tabs;