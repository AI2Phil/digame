import React, { useState, createContext, useContext } from 'react';

// Sidebar Context
const SidebarContext = createContext();

// Main Sidebar component
export const Sidebar = ({ 
  children, 
  className = '',
  collapsed = false,
  onCollapsedChange,
  position = 'left', // left, right
  width = 'w-64',
  collapsedWidth = 'w-16',
  overlay = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggle = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  };

  const contextValue = {
    isCollapsed,
    setIsCollapsed,
    handleToggle,
    position
  };

  const positionClasses = {
    left: 'left-0',
    right: 'right-0'
  };

  const currentWidth = isCollapsed ? collapsedWidth : width;

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className={`
        sidebar fixed top-0 ${positionClasses[position]} h-full z-40
        bg-white border-r border-gray-200 shadow-sm
        transition-all duration-300 ease-in-out
        ${currentWidth}
        ${className}
      `}>
        {overlay && !isCollapsed && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={handleToggle}
          />
        )}
        <div className="flex flex-col h-full">
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

// Sidebar Header
export const SidebarHeader = ({ 
  children, 
  className = '',
  showToggle = true
}) => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('SidebarHeader must be used within Sidebar');
  }

  const { isCollapsed, handleToggle } = context;

  return (
    <div className={`
      sidebar-header flex items-center justify-between p-4 border-b border-gray-200
      ${className}
    `}>
      <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
        {children}
      </div>
      {showToggle && (
        <button
          onClick={handleToggle}
          className={`
            p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100
            transition-colors duration-200
            ${isCollapsed ? 'hidden' : 'block'}
          `}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      )}
    </div>
  );
};

// Sidebar Content
export const SidebarContent = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`sidebar-content flex-1 overflow-y-auto py-4 ${className}`}>
      {children}
    </div>
  );
};

// Sidebar Footer
export const SidebarFooter = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`sidebar-footer p-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

// Sidebar Navigation
export const SidebarNav = ({ 
  children, 
  className = '' 
}) => {
  return (
    <nav className={`sidebar-nav space-y-1 px-3 ${className}`}>
      {children}
    </nav>
  );
};

// Sidebar Group
export const SidebarGroup = ({ 
  title, 
  children, 
  className = '',
  collapsible = false,
  defaultOpen = true
}) => {
  const context = useContext(SidebarContext);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  if (!context) {
    throw new Error('SidebarGroup must be used within Sidebar');
  }

  const { isCollapsed } = context;

  const handleToggle = () => {
    if (collapsible) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`sidebar-group ${className}`}>
      {title && !isCollapsed && (
        <div 
          className={`
            flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider
            ${collapsible ? 'cursor-pointer hover:text-gray-700' : ''}
          `}
          onClick={handleToggle}
        >
          <span>{title}</span>
          {collapsible && (
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </div>
      )}
      {(!collapsible || isOpen) && (
        <div className="space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

// Sidebar Item
export const SidebarItem = ({ 
  children, 
  icon,
  badge,
  active = false,
  disabled = false,
  onClick,
  href,
  className = ''
}) => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('SidebarItem must be used within Sidebar');
  }

  const { isCollapsed } = context;

  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const itemClasses = `
    flex items-center px-3 py-2 text-sm font-medium rounded-md
    transition-colors duration-200 group
    ${active 
      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
      : disabled
        ? 'text-gray-400 cursor-not-allowed'
        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
    }
    ${className}
  `;

  const content = (
    <>
      {icon && (
        <div className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
          {typeof icon === 'string' ? <span className="text-lg">{icon}</span> : icon}
        </div>
      )}
      {!isCollapsed && (
        <div className="flex-1 flex items-center justify-between">
          <span className="truncate">{children}</span>
          {badge && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {badge}
            </span>
          )}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <a 
        href={href} 
        className={itemClasses}
        onClick={handleClick}
        title={isCollapsed ? children : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button 
      className={`${itemClasses} w-full text-left`}
      onClick={handleClick}
      disabled={disabled}
      title={isCollapsed ? children : undefined}
    >
      {content}
    </button>
  );
};

// Sidebar Submenu
export const SidebarSubmenu = ({ 
  title, 
  icon,
  children, 
  className = '',
  defaultOpen = false
}) => {
  const context = useContext(SidebarContext);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  if (!context) {
    throw new Error('SidebarSubmenu must be used within Sidebar');
  }

  const { isCollapsed } = context;

  const handleToggle = () => {
    if (!isCollapsed) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`sidebar-submenu ${className}`}>
      <button
        className={`
          flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700
          hover:text-gray-900 hover:bg-gray-100 rounded-md
          transition-colors duration-200
          ${isCollapsed ? 'justify-center' : 'justify-between'}
        `}
        onClick={handleToggle}
        title={isCollapsed ? title : undefined}
      >
        <div className={`flex items-center ${isCollapsed ? '' : 'space-x-3'}`}>
          {icon && (
            <div className="flex-shrink-0">
              {typeof icon === 'string' ? <span className="text-lg">{icon}</span> : icon}
            </div>
          )}
          {!isCollapsed && <span>{title}</span>}
        </div>
        {!isCollapsed && (
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>
      
      {!isCollapsed && isOpen && (
        <div className="ml-6 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

// Sidebar User Profile
export const SidebarUser = ({ 
  name,
  email,
  avatar,
  status,
  className = '',
  onClick
}) => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('SidebarUser must be used within Sidebar');
  }

  const { isCollapsed } = context;

  return (
    <div 
      className={`
        flex items-center p-3 rounded-md cursor-pointer
        hover:bg-gray-100 transition-colors duration-200
        ${className}
      `}
      onClick={onClick}
    >
      <div className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`}>
        {avatar ? (
          <img 
            src={avatar} 
            alt={name} 
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
        )}
        {status && (
          <div className={`
            absolute w-3 h-3 rounded-full border-2 border-white
            ${status === 'online' ? 'bg-green-400' : 
              status === 'away' ? 'bg-yellow-400' : 
              status === 'busy' ? 'bg-red-400' : 'bg-gray-400'}
            ${isCollapsed ? 'bottom-0 right-0' : 'bottom-0 right-0 transform translate-x-1'}
          `} />
        )}
      </div>
      
      {!isCollapsed && (
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {name}
          </p>
          {email && (
            <p className="text-xs text-gray-500 truncate">
              {email}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Sidebar Toggle Button (for external use)
export const SidebarToggle = ({ 
  className = '',
  children 
}) => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('SidebarToggle must be used within Sidebar');
  }

  const { handleToggle, isCollapsed } = context;

  return (
    <button
      onClick={handleToggle}
      className={`
        p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100
        transition-colors duration-200
        ${className}
      `}
      aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {children || (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  );
};

export default Sidebar;