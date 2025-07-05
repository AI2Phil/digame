import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function NavigationHubFooter() {
  const [isExpanded, setIsExpanded] = useState(false);

  const navigationSections = [
    {
      title: 'Core Platform',
      count: 4,
      path: '/dashboard',
      color: 'blue'
    },
    {
      title: 'Analytics & AI',
      count: 9,
      path: '/analytics',
      color: 'purple'
    },
    {
      title: 'Digital Twin',
      count: 7,
      path: '/digital-twin',
      color: 'green'
    },
    {
      title: 'AI Tools',
      count: 9,
      path: '/ai-tools',
      color: 'orange'
    },
    {
      title: 'Workflow',
      count: 7,
      path: '/workflow',
      color: 'indigo'
    },
    {
      title: 'Tasks',
      count: 4,
      path: '/tasks',
      color: 'teal'
    },
    {
      title: 'Team',
      count: 6,
      path: '/team',
      color: 'pink'
    },
    {
      title: 'Career',
      count: 6,
      path: '/career',
      color: 'cyan'
    },
    {
      title: 'Enterprise',
      count: 6,
      path: '/enterprise',
      color: 'red'
    },
    {
      title: 'Security',
      count: 5,
      path: '/security',
      color: 'gray'
    },
    {
      title: 'Reports',
      count: 5,
      path: '/reports',
      color: 'emerald'
    },
    {
      title: 'Integration',
      count: 6,
      path: '/integration',
      color: 'violet'
    },
    {
      title: 'Admin',
      count: 5,
      path: '/admin',
      color: 'slate'
    },
    {
      title: 'Platform Owner',
      count: 11,
      path: '/platform-owner',
      color: 'yellow'
    }
  ];

  return (
    <div className={`bg-white border-t border-gray-200 transition-all duration-300 ease-in-out ${
      isExpanded ? 'h-auto' : 'h-16'
    }`}>
      {/* Always Visible Header Bar */}
      <div 
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">D</span>
          </div>
          <h4 className="text-sm font-semibold text-gray-900">Navigation Hub</h4>
          <span className="text-xs text-gray-500">14 sections • 95+ features</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {isExpanded ? 'Collapse' : 'Expand'}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </div>

      {/* Expandable Content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-6 pb-6">
          {/* Navigation Grid */}
          <div className="grid grid-cols-4 md:grid-cols-7 lg:grid-cols-14 gap-2 text-center mb-4">
            {navigationSections.map((section, index) => (
              <Link key={index} href={section.path}>
                <div className={`p-2 bg-${section.color}-50 rounded hover:bg-${section.color}-100 hover:shadow-sm transition-all duration-200 cursor-pointer border border-transparent hover:border-${section.color}-200 ${section.title === 'Platform Owner' ? 'border-yellow-200' : ''}`}>
                  <div className={`text-sm font-semibold text-${section.color}-600`}>{section.count}</div>
                  <div className={`text-xs text-${section.color}-700 leading-tight`}>{section.title}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Footer Info */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
              <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                <span className="font-medium">Digame Platform</span>
                <span>•</span>
                <span>Complete Feature Access</span>
              </div>
              <div>
                © 2025 Digame Platform
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}