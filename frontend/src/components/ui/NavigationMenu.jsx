import React, { useState, createContext, useContext, useRef, useEffect } from 'react';

// Navigation Menu Context
const NavigationMenuContext = createContext();

// Main Navigation Menu component
export const NavigationMenu = ({ 
  children, 
  className = '',
  orientation = 'horizontal',
  trigger = 'hover' // hover, click, focus
}) => {
  const [activeItem, setActiveItem] = useState(null);
  const [openItems, setOpenItems] = useState(new Set());

  const contextValue = {
    activeItem,
    setActiveItem,
    openItems,
    setOpenItems,
    orientation,
    trigger
  };

  const orientationClasses = {
    horizontal: 'flex flex-row',
    vertical: 'flex flex-col'
  };

  return (
    <NavigationMenuContext.Provider value={contextValue}>
      <nav className={`navigation-menu ${orientationClasses[orientation]} ${className}`}>
        {children}
      </nav>
    </NavigationMenuContext.Provider>
  );
};

// Navigation Menu List
export const NavigationMenuList = ({ children, className = '' }) => {
  const context = useContext(NavigationMenuContext);
  if (!context) {
    throw new Error('NavigationMenuList must be used within NavigationMenu');
  }

  const { orientation } = context;
  
  const orientationClasses = {
    horizontal: 'flex flex-row space-x-1',
    vertical: 'flex flex-col space-y-1'
  };

  return (
    <ul className={`${orientationClasses[orientation]} ${className}`}>
      {children}
    </ul>
  );
};

// Navigation Menu Item
export const NavigationMenuItem = ({ 
  children, 
  value,
  className = '',
  disabled = false
}) => {
  const context = useContext(NavigationMenuContext);
  if (!context) {
    throw new Error('NavigationMenuItem must be used within NavigationMenu');
  }

  const { activeItem, setActiveItem, openItems, setOpenItems, trigger } = context;
  const [isOpen, setIsOpen] = useState(false);
  const itemRef = useRef(null);
  const timeoutRef = useRef(null);

  const isActive = activeItem === value;
  const hasSubmenu = React.Children.toArray(children).some(
    child => child.type === NavigationMenuContent
  );

  const handleMouseEnter = () => {
    if (trigger === 'hover' && hasSubmenu && !disabled) {
      clearTimeout(timeoutRef.current);
      setIsOpen(true);
      setOpenItems(prev => new Set([...prev, value]));
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover' && hasSubmenu) {
      timeoutRef.current = setTimeout(() => {
        setIsOpen(false);
        setOpenItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(value);
          return newSet;
        });
      }, 150);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    
    setActiveItem(value);
    
    if (trigger === 'click' && hasSubmenu) {
      const newIsOpen = !isOpen;
      setIsOpen(newIsOpen);
      
      if (newIsOpen) {
        setOpenItems(prev => new Set([...prev, value]));
      } else {
        setOpenItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(value);
          return newSet;
        });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <li
      ref={itemRef}
      className={`navigation-menu-item relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`
          navigation-menu-trigger cursor-pointer select-none
          ${isActive ? 'active' : ''}
          ${disabled ? 'disabled opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="menuitem"
        aria-expanded={hasSubmenu ? isOpen : undefined}
        aria-haspopup={hasSubmenu ? 'menu' : undefined}
      >
        {React.Children.map(children, child => 
          child.type !== NavigationMenuContent ? child : null
        )}
      </div>
      
      {hasSubmenu && (
        <div className={`navigation-menu-content ${isOpen ? 'open' : 'closed'}`}>
          {React.Children.map(children, child => 
            child.type === NavigationMenuContent ? child : null
          )}
        </div>
      )}
    </li>
  );
};

// Navigation Menu Trigger
export const NavigationMenuTrigger = ({ 
  children, 
  className = '',
  icon,
  badge
}) => {
  return (
    <div className={`
      flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
      text-gray-700 hover:text-gray-900 hover:bg-gray-100
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      transition-colors duration-200
      ${className}
    `}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {badge && (
        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {badge}
        </span>
      )}
    </div>
  );
};

// Navigation Menu Content (Submenu)
export const NavigationMenuContent = ({ 
  children, 
  className = '',
  position = 'bottom' // bottom, top, left, right
}) => {
  const positionClasses = {
    bottom: 'top-full left-0 mt-1',
    top: 'bottom-full left-0 mb-1',
    left: 'right-full top-0 mr-1',
    right: 'left-full top-0 ml-1'
  };

  return (
    <div className={`
      absolute z-50 min-w-48 bg-white rounded-md shadow-lg border border-gray-200
      ${positionClasses[position]}
      ${className}
    `}>
      <div className="py-1">
        {children}
      </div>
    </div>
  );
};

// Navigation Menu Link
export const NavigationMenuLink = ({ 
  children, 
  href,
  onClick,
  className = '',
  icon,
  description,
  disabled = false
}) => {
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const content = (
    <div className={`
      flex items-start space-x-3 px-4 py-3 text-sm
      ${disabled 
        ? 'text-gray-400 cursor-not-allowed' 
        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 cursor-pointer'
      }
      transition-colors duration-200
      ${className}
    `}>
      {icon && (
        <div className="flex-shrink-0 mt-0.5">
          {typeof icon === 'string' ? <span>{icon}</span> : icon}
        </div>
      )}
      <div className="flex-1">
        <div className="font-medium">{children}</div>
        {description && (
          <div className="text-xs text-gray-500 mt-1">{description}</div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a 
        href={href} 
        onClick={handleClick}
        className="block"
        tabIndex={disabled ? -1 : 0}
      >
        {content}
      </a>
    );
  }

  return (
    <div 
      onClick={handleClick}
      className="block"
      tabIndex={disabled ? -1 : 0}
      role="menuitem"
    >
      {content}
    </div>
  );
};

// Navigation Menu Separator
export const NavigationMenuSeparator = ({ className = '' }) => {
  return <div className={`border-t border-gray-200 my-1 ${className}`} />;
};

// Mega Menu component for complex layouts
export const MegaMenu = ({ 
  children, 
  columns = 1,
  className = '' 
}) => {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  return (
    <div className={`
      grid ${gridClasses[columns]} gap-6 p-6 w-96
      ${className}
    `}>
      {children}
    </div>
  );
};

// Mega Menu Section
export const MegaMenuSection = ({ 
  title, 
  children, 
  className = '' 
}) => {
  return (
    <div className={className}>
      {title && (
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          {title}
        </h3>
      )}
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
};

// Breadcrumb Navigation
export const Breadcrumb = ({ 
  children, 
  separator = '/',
  className = '' 
}) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {React.Children.map(children, (child, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <span className="mx-2 text-gray-400 select-none">
                {separator}
              </span>
            )}
            {child}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Breadcrumb Item
export const BreadcrumbItem = ({ 
  children, 
  href,
  current = false,
  className = '' 
}) => {
  const baseClasses = `
    text-sm transition-colors duration-200
    ${current 
      ? 'text-gray-900 font-medium cursor-default' 
      : 'text-gray-500 hover:text-gray-700 cursor-pointer'
    }
    ${className}
  `;

  if (href && !current) {
    return (
      <a href={href} className={baseClasses}>
        {children}
      </a>
    );
  }

  return (
    <span className={baseClasses} aria-current={current ? 'page' : undefined}>
      {children}
    </span>
  );
};

export default NavigationMenu;