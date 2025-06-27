import React, { useState, createContext, useContext } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

// Types
interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
  variant: 'default' | 'pills' | 'underline' | 'enclosed';
}

interface TabsProps {
  children: React.ReactNode;
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'pills' | 'underline' | 'enclosed';
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface TabsTriggerProps {
  children: React.ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
}

interface TabsContentProps {
  children: React.ReactNode;
  value: string;
  className?: string;
}

interface AnimatedTabsProps extends Omit<TabsProps, 'variant' | 'orientation'> {}

interface TabBadgeProps {
  children: React.ReactNode;
  count?: number;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

interface ScrollableTabsProps extends TabsProps {}

interface UseTabsReturn {
  activeTab: string;
  setActiveTab: (value: string) => void;
  goToTab: (value: string) => void;
  goToNext: (tabs: string[]) => void;
  goToPrevious: (tabs: string[]) => void;
}

// Tabs Context
const TabsContext = createContext<TabsContextType | undefined>(undefined);

// CVA Variants
const tabsListVariants = cva(
  "flex",
  {
    variants: {
      variant: {
        default: "border-b border-gray-200 dark:border-gray-700",
        pills: "bg-gray-100 dark:bg-gray-800 p-1 rounded-lg",
        underline: "border-b border-gray-200 dark:border-gray-700",
        enclosed: "border-b border-gray-200 dark:border-gray-700"
      },
      orientation: {
        horizontal: "flex-row",
        vertical: "flex-col border-r border-gray-200 dark:border-gray-700 min-w-48"
      },
      size: {
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      orientation: "horizontal",
      size: "md"
    }
  }
);

const tabsTriggerVariants = cva(
  "px-4 py-2 font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "",
        pills: "rounded-md",
        underline: "",
        enclosed: "border border-b-0 rounded-t-lg -mb-px"
      },
      orientation: {
        horizontal: "flex-shrink-0",
        vertical: "w-full text-left border-r-2 -mr-px"
      },
      active: {
        true: "",
        false: ""
      }
    },
    compoundVariants: [
      // Default variant states
      {
        variant: "default",
        active: true,
        class: "border-b-2 -mb-px border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
      },
      {
        variant: "default",
        active: false,
        class: "border-b-2 -mb-px border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
      },
      // Pills variant states
      {
        variant: "pills",
        active: true,
        class: "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm"
      },
      {
        variant: "pills",
        active: false,
        class: "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-white/50 dark:hover:bg-gray-700/50"
      },
      // Underline variant states
      {
        variant: "underline",
        active: true,
        class: "border-b-2 -mb-px border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
      },
      {
        variant: "underline",
        active: false,
        class: "border-b-2 -mb-px border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      },
      // Enclosed variant states
      {
        variant: "enclosed",
        active: true,
        class: "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
      },
      {
        variant: "enclosed",
        active: false,
        class: "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      },
      // Vertical orientation states
      {
        orientation: "vertical",
        active: true,
        class: "border-blue-600 text-blue-600 bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:bg-blue-950/50"
      },
      {
        orientation: "vertical",
        active: false,
        class: "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
      }
    ],
    defaultVariants: {
      variant: "default",
      orientation: "horizontal",
      active: false
    }
  }
);

// Main Tabs component
export const Tabs: React.FC<TabsProps> = ({ 
  children, 
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
  variant = 'default',
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue || value || '');

  const handleTabChange = (newValue: string) => {
    if (value === undefined) {
      setActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  const currentValue = value !== undefined ? value : activeTab;

  const contextValue: TabsContextType = {
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
      <div className={cn(orientationClasses[orientation], className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

// Tabs List component
export const TabsList: React.FC<TabsListProps> = ({ 
  children, 
  className = '',
  size = 'md'
}) => {
  const context = useContext(TabsContext);
  
  if (!context) {
    throw new Error('TabsList must be used within Tabs');
  }

  const { orientation, variant } = context;

  return (
    <div className={cn(
      tabsListVariants({ variant, orientation, size }),
      className
    )}>
      {children}
    </div>
  );
};

// Tab Trigger component
export const TabsTrigger: React.FC<TabsTriggerProps> = ({ 
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

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      className={cn(
        tabsTriggerVariants({ 
          variant: orientation === 'vertical' ? 'default' : variant, 
          orientation, 
          active: isActive 
        }),
        className
      )}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

// Tab Content component
export const TabsContent: React.FC<TabsContentProps> = ({ 
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
      className={cn(
        'animate-fade-in',
        orientationClasses[orientation],
        className
      )}
    >
      {children}
    </div>
  );
};

// Animated Tabs with smooth transitions
export const AnimatedTabs: React.FC<AnimatedTabsProps> = ({ 
  children, 
  defaultValue,
  value,
  onValueChange,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultValue || value || '');
  const [previousTab, setPreviousTab] = useState<string | null>(null);

  const handleTabChange = (newValue: string) => {
    setPreviousTab(activeTab);
    if (value === undefined) {
      setActiveTab(newValue);
    }
    onValueChange?.(newValue);
  };

  const currentValue = value !== undefined ? value : activeTab;

  return (
    <div className={cn('animated-tabs', className)}>
      <Tabs value={currentValue} onValueChange={handleTabChange}>
        {children}
      </Tabs>
    </div>
  );
};

// Tab Badge component for notifications
export const TabBadge: React.FC<TabBadgeProps> = ({ 
  children, 
  count,
  variant = 'default',
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-gray-500 dark:bg-gray-600',
    primary: 'bg-blue-500 dark:bg-blue-600',
    success: 'bg-green-500 dark:bg-green-600',
    warning: 'bg-yellow-500 dark:bg-yellow-600',
    danger: 'bg-red-500 dark:bg-red-600'
  };

  if (!count && count !== 0) return <>{children}</>;

  return (
    <div className="relative inline-flex items-center">
      {children}
      <span className={cn(
        'absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 rounded-full',
        variantClasses[variant],
        className
      )}>
        {count > 99 ? '99+' : count}
      </span>
    </div>
  );
};

// Scrollable Tabs for many tabs
export const ScrollableTabs: React.FC<ScrollableTabsProps> = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <Tabs className={cn('scrollable-tabs', className)} {...props}>
      <div className="overflow-x-auto scrollbar-hide">
        {children}
      </div>
    </Tabs>
  );
};

// Hook for programmatic tab control
export const useTabs = (defaultValue?: string): UseTabsReturn => {
  const [activeTab, setActiveTab] = useState(defaultValue || '');

  const goToTab = (value: string) => setActiveTab(value);
  
  const goToNext = (tabs: string[]) => {
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex]);
  };
  
  const goToPrevious = (tabs: string[]) => {
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
