import React from 'react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backUrl?: string;
  badge?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = true,
  backUrl = '/dashboard',
  badge
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Link 
              href={backUrl}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="text-lg">←</span>
              <span className="text-sm font-medium">Back</span>
            </Link>
          )}
          
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {badge && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ✨ {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        <Link 
          href="/dashboard"
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span className="text-lg">🏠</span>
          <span className="text-sm font-medium">Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default PageHeader;