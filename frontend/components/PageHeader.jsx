import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

const PageHeader = ({ title, subtitle, breadcrumbs = [] }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Home className="w-4 h-4" />
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="w-4 h-4" />
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="hover:text-gray-700 transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-gray-900 font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;