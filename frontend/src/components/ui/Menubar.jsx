import React, { useState, useRef, useEffect, createContext, useContext } from 'react';

// Menubar Context
const MenubarContext = createContext();

// Main Menubar component
export const Menubar = ({ 
  children, 
  className = '',
  variant = 'default' // default, minimal, compact
}) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [openMenus, setOpenMenus] = useState(new Set());

  const contextValue = {
    activeMenu,
    setActiveMenu,
    openMenus,
    setOpenMenus,
    variant
  };

  const variantClasses = {
    default: 'bg-white border-b border-gray-200 shadow-sm',
    minimal: 'bg-transparent',
    compact: 'bg-gray-50 border-b border-gray-200'
  };

  return (
    <MenubarContext.Provider value={contextValue}>
      <div className={`
        menubar flex items-center px-4 py-2
        ${variantClasses[variant]}
        ${className}
      `}>
        {children}
      </div>
    </MenubarContext.Provider>
  );
};

// Menubar Menu
export const MenubarMenu = ({ 
  children, 
  value,
  className = ''
}) => {
  const context = useContext(MenubarContext);
  if (!context) {
    throw new Error('MenubarMenu must be used within Menubar');
  }

  const { activeMenu, setActiveMenu, openMenus, setOpenMenus } = context;
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const isActive = activeMenu === value;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setOpenMenus(prev => {
          const newSet = new Set(prev);
          newSet.delete(value);
          return newSet;
        });
        if (isActive) {
          setActiveMenu(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isActive, setActiveMenu, setOpenMenus, value]);

  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    setActiveMenu(newIsOpen ? value : null);
    
    if (newIsOpen) {
      setOpenMenus(prev => new Set([...prev, value]));
    } else {
      setOpenMenus(prev => {
        const newSet = new Set(prev);
        newSet.delete(value);
        return newSet;
      });
    }
  };

  return (
    <div ref={menuRef} className={`menubar-menu relative ${className}`}>
      <div onClick={handleToggle}>
        {React.Children.map(children, child => 
          child.type === MenubarTrigger ? child : null
        )}
      </div>
      
      {isOpen && (
        <div className="menubar-content">
          {React.Children.map(children, child => 
            child.type === MenubarContent ? child : null
          )}
        </div>
      )}
    </div>
  );
};

// Menubar Trigger
export const MenubarTrigger = ({ 
  children, 
  className = '',
  disabled = false
}) => {
  const context = useContext(MenubarContext);
  if (!context) {
    throw new Error('MenubarTrigger must be used within MenubarMenu');
  }

  const { variant } = context;

  const variantClasses = {
    default: 'px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100',
    minimal: 'px-2 py-1 text-sm font-medium text-gray-600 hover:text-gray-900',
    compact: 'px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  };

  return (
    <button
      className={`
        menubar-trigger rounded-md transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${variantClasses[variant]}
        ${className}
      `}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Menubar Content
export const MenubarContent = ({ 
  children, 
  className = '',
  align = 'start', // start, center, end
  sideOffset = 4
}) => {
  const alignClasses = {
    start: 'left-0',
    center: 'left-1/2 transform -translate-x-1/2',
    end: 'right-0'
  };

  return (
    <div 
      className={`
        absolute z-50 min-w-48 bg-white rounded-md shadow-lg border border-gray-200
        ${alignClasses[align]}
        ${className}
      `}
      style={{ top: `calc(100% + ${sideOffset}px)` }}
    >
      <div className="py-1">
        {children}
      </div>
    </div>
  );
};

// Menubar Item
export const MenubarItem = ({ 
  children, 
  onClick,
  disabled = false,
  className = '',
  icon,
  shortcut,
  variant = 'default' // default, destructive
}) => {
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const variantClasses = {
    default: 'text-gray-700 hover:text-gray-900 hover:bg-gray-100',
    destructive: 'text-red-600 hover:text-red-700 hover:bg-red-50'
  };

  return (
    <button
      className={`
        w-full flex items-center justify-between px-3 py-2 text-sm text-left
        transition-colors duration-200
        ${disabled 
          ? 'text-gray-400 cursor-not-allowed' 
          : variantClasses[variant]
        }
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
    >
      <div className="flex items-center space-x-2">
        {icon && (
          <span className="flex-shrink-0">
            {typeof icon === 'string' ? <span>{icon}</span> : icon}
          </span>
        )}
        <span>{children}</span>
      </div>
      
      {shortcut && (
        <span className="text-xs text-gray-400 font-mono">
          {shortcut}
        </span>
      )}
    </button>
  );
};

// Menubar Separator
export const MenubarSeparator = ({ className = '' }) => {
  return <div className={`border-t border-gray-200 my-1 ${className}`} />;
};

// Menubar Label
export const MenubarLabel = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </div>
  );
};

// Menubar Submenu
export const MenubarSubmenu = ({ 
  children, 
  trigger,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const submenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (submenuRef.current && !submenuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  return (
    <div 
      ref={submenuRef}
      className={`menubar-submenu relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {trigger}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute left-full top-0 ml-1 min-w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

// Menubar Checkbox Item
export const MenubarCheckboxItem = ({ 
  children, 
  checked = false,
  onCheckedChange,
  disabled = false,
  className = ''
}) => {
  const handleClick = () => {
    if (!disabled) {
      onCheckedChange?.(!checked);
    }
  };

  return (
    <button
      className={`
        w-full flex items-center space-x-2 px-3 py-2 text-sm text-left
        transition-colors duration-200
        ${disabled 
          ? 'text-gray-400 cursor-not-allowed' 
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
        }
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
    >
      <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
        {checked && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <span>{children}</span>
    </button>
  );
};

// Menubar Radio Group
export const MenubarRadioGroup = ({ 
  children, 
  value,
  onValueChange,
  className = ''
}) => {
  return (
    <div className={`menubar-radio-group ${className}`}>
      {React.Children.map(children, child => 
        React.cloneElement(child, {
          checked: child.props.value === value,
          onCheckedChange: () => onValueChange?.(child.props.value)
        })
      )}
    </div>
  );
};

// Menubar Radio Item
export const MenubarRadioItem = ({ 
  children, 
  value,
  checked = false,
  onCheckedChange,
  disabled = false,
  className = ''
}) => {
  const handleClick = () => {
    if (!disabled) {
      onCheckedChange?.(value);
    }
  };

  return (
    <button
      className={`
        w-full flex items-center space-x-2 px-3 py-2 text-sm text-left
        transition-colors duration-200
        ${disabled 
          ? 'text-gray-400 cursor-not-allowed' 
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
        }
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
    >
      <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
        <div className={`w-2 h-2 rounded-full ${checked ? 'bg-blue-600' : 'bg-transparent'}`} />
      </div>
      <span>{children}</span>
    </button>
  );
};

export default Menubar;