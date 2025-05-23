import React from 'react';

// Main Breadcrumb component
export const Breadcrumb = ({ 
  children, 
  separator = '/',
  className = '',
  maxItems = null,
  showRoot = true
}) => {
  const items = React.Children.toArray(children);
  
  // Handle max items with ellipsis
  let displayItems = items;
  if (maxItems && items.length > maxItems) {
    const firstItem = showRoot ? [items[0]] : [];
    const lastItems = items.slice(-(maxItems - 1));
    displayItems = [
      ...firstItem,
      <BreadcrumbEllipsis key="ellipsis" />,
      ...lastItems
    ];
  }

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {displayItems.map((child, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <BreadcrumbSeparator separator={separator} />
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
  disabled = false,
  icon,
  className = '',
  onClick
}) => {
  const handleClick = (e) => {
    if (disabled || current) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const baseClasses = `
    flex items-center space-x-1 text-sm transition-colors duration-200
    ${current 
      ? 'text-gray-900 font-medium cursor-default' 
      : disabled
        ? 'text-gray-400 cursor-not-allowed'
        : 'text-gray-500 hover:text-gray-700 cursor-pointer'
    }
    ${className}
  `;

  const content = (
    <>
      {icon && (
        <span className="flex-shrink-0">
          {typeof icon === 'string' ? <span>{icon}</span> : icon}
        </span>
      )}
      <span className="truncate">{children}</span>
    </>
  );

  if (href && !current && !disabled) {
    return (
      <a 
        href={href} 
        className={baseClasses}
        onClick={handleClick}
        aria-current={current ? 'page' : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <span 
      className={baseClasses} 
      aria-current={current ? 'page' : undefined}
      onClick={handleClick}
    >
      {content}
    </span>
  );
};

// Breadcrumb Link (alias for BreadcrumbItem with href)
export const BreadcrumbLink = ({ children, ...props }) => {
  return <BreadcrumbItem {...props}>{children}</BreadcrumbItem>;
};

// Breadcrumb Page (current page item)
export const BreadcrumbPage = ({ children, className = '', ...props }) => {
  return (
    <BreadcrumbItem 
      current={true} 
      className={`font-medium text-gray-900 ${className}`}
      {...props}
    >
      {children}
    </BreadcrumbItem>
  );
};

// Breadcrumb Separator
export const BreadcrumbSeparator = ({ 
  separator = '/',
  className = '' 
}) => {
  const isIcon = typeof separator !== 'string';
  
  return (
    <span className={`mx-2 text-gray-400 select-none ${className}`}>
      {isIcon ? separator : (
        <span aria-hidden="true">{separator}</span>
      )}
    </span>
  );
};

// Breadcrumb Ellipsis
export const BreadcrumbEllipsis = ({ 
  className = '',
  onClick 
}) => {
  return (
    <span 
      className={`
        mx-2 text-gray-400 select-none
        ${onClick ? 'cursor-pointer hover:text-gray-600' : ''}
        ${className}
      `}
      onClick={onClick}
      aria-label="Show more items"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
    </span>
  );
};

// Auto Breadcrumb (generates from URL path)
export const AutoBreadcrumb = ({ 
  path = window.location.pathname,
  homeLabel = 'Home',
  homeHref = '/',
  separator = '/',
  className = '',
  formatLabel = (segment) => segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
}) => {
  const segments = path.split('/').filter(Boolean);
  
  return (
    <Breadcrumb separator={separator} className={className}>
      <BreadcrumbItem href={homeHref} icon="🏠">
        {homeLabel}
      </BreadcrumbItem>
      
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = '/' + segments.slice(0, index + 1).join('/');
        const label = formatLabel(segment);
        
        return isLast ? (
          <BreadcrumbPage key={segment}>
            {label}
          </BreadcrumbPage>
        ) : (
          <BreadcrumbItem key={segment} href={href}>
            {label}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

// Breadcrumb with Dropdown
export const BreadcrumbDropdown = ({ 
  label,
  items = [],
  className = '',
  icon
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className={`
          flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700
          transition-colors duration-200 ${className}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon && <span>{icon}</span>}
        <span>{label}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                onClick={() => {
                  setIsOpen(false);
                  item.onClick?.();
                }}
              >
                <div className="flex items-center space-x-2">
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Responsive Breadcrumb
export const ResponsiveBreadcrumb = ({ 
  children,
  mobileMaxItems = 2,
  desktopMaxItems = null,
  className = ''
}) => {
  return (
    <>
      {/* Mobile Breadcrumb */}
      <div className="block md:hidden">
        <Breadcrumb maxItems={mobileMaxItems} className={className}>
          {children}
        </Breadcrumb>
      </div>
      
      {/* Desktop Breadcrumb */}
      <div className="hidden md:block">
        <Breadcrumb maxItems={desktopMaxItems} className={className}>
          {children}
        </Breadcrumb>
      </div>
    </>
  );
};

// Breadcrumb with Actions
export const ActionBreadcrumb = ({ 
  children,
  actions = [],
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <Breadcrumb>
        {children}
      </Breadcrumb>
      
      {actions.length > 0 && (
        <div className="flex items-center space-x-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`
                px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200
                ${action.variant === 'primary' 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              {action.icon && <span className="mr-1">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Breadcrumb;