import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import { Separator } from '../ui/Separator';

const Sidebar = ({ isDemoMode, onLogout, currentUser, isOpen, onToggle }) => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState({
    analytics: false,
    aiTools: false,
    social: false,
    tasks: false,
    enterprise: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const menuSections = [
    {
      id: 'analytics',
      title: 'Analytics',
      icon: '📊',
      items: [
        { label: 'Web Analytics', icon: '🌐', path: '/analytics/web' },
        { label: 'Mobile Analytics', icon: '📱', path: '/analytics/mobile' },
        { label: 'Behavioral Analytics', icon: '🧠', path: '/analytics/behavioral', subtitle: 'AI-POWERED' },
        { label: 'Predictive Analytics', icon: '🔮', path: '/analytics/predictive', subtitle: 'AI-POWERED' }
      ]
    },
    {
      id: 'aiTools',
      title: 'AI Tools',
      icon: '🤖',
      items: [
        { label: 'AI Tools Hub', icon: '🛠️', path: '/ai-tools' },
        { label: 'Writing Assistance', icon: '✍️', path: '/ai-tools?tab=writing', subtitle: 'WRITING & CONTENT' },
        { label: 'AI Task Suggestions', icon: '📋', path: '/tasks', subtitle: 'TASK MANAGEMENT' },
        { label: 'AI Insights', icon: '🧠', path: '/ai-tools?tab=insights', subtitle: 'INSIGHTS & ANALYTICS' },
        { label: 'AI Coaching', icon: '🎯', path: '/ai-tools?tab=coaching', subtitle: 'INSIGHTS & ANALYTICS' }
      ]
    },
    {
      id: 'social',
      title: 'Social',
      icon: '🤝',
      items: [
        { label: 'Social Collaboration', icon: '👥', path: '/social' },
        { label: 'AI Peer Matching', icon: '🧠', path: '/social?tab=peer-matching', subtitle: 'COLLABORATION' },
        { label: 'Mentorship Programs', icon: '🎓', path: '/social?tab=mentorship', subtitle: 'COLLABORATION' },
        { label: 'Project Collaboration', icon: '🎯', path: '/social?tab=projects', subtitle: 'COLLABORATION' },
        { label: 'Team Analytics', icon: '📈', path: '/social?tab=teams', subtitle: 'COLLABORATION' },
        { label: 'Industry Networking', icon: '🏢', path: '/social?tab=industry', subtitle: 'COLLABORATION' }
      ]
    },
    {
      id: 'tasks',
      title: 'Tasks',
      icon: '📋',
      items: [
        { label: 'Task Management', icon: '📋', path: '/tasks' },
        { label: 'AI Task Suggestions', icon: '🤖', path: '/tasks?tab=suggestions', subtitle: 'AI-POWERED' },
        { label: 'Process Automation', icon: '⚡', path: '/tasks?tab=automation', subtitle: 'AI-POWERED' },
        { label: 'Task Analytics', icon: '📊', path: '/tasks?tab=insights', subtitle: 'AI-POWERED' }
      ]
    },
    {
      id: 'enterprise',
      title: 'Enterprise',
      icon: '🏢',
      items: [
        { label: 'Enterprise Dashboard', icon: '🏢', path: '/enterprise' },
        { label: 'AI Feature Management', icon: '🤖', path: '/enterprise?tab=ai-features', subtitle: 'AI ENTERPRISE' },
        { label: 'Tenant Management', icon: '🏢', path: '/enterprise?tab=tenants', subtitle: 'AI ENTERPRISE' },
        { label: 'Security & Compliance', icon: '🔒', path: '/enterprise?tab=security', subtitle: 'AI ENTERPRISE' },
        { label: 'Enterprise Analytics', icon: '📊', path: '/enterprise?tab=overview', subtitle: 'ANALYTICS & INSIGHTS' }
      ]
    }
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-xl border-r border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
        w-80 flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="digame-logo">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Digame</span>
            {isDemoMode && (
              <Badge variant="info" className="text-xs">Demo</Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Dashboard */}
          <Button
            variant="ghost"
            className="w-full justify-start text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold"
            onClick={() => {
              navigate('/dashboard');
              onToggle();
            }}
          >
            <span className="mr-3 text-lg">🏠</span>
            Dashboard
          </Button>

          <Separator className="my-4" />

          {/* Menu Sections */}
          {menuSections.map((section) => (
            <div key={section.id} className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-between text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-medium"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg">{section.icon}</span>
                  {section.title}
                </div>
                {expandedSections[section.id] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>

              {/* Collapsible Section Items */}
              {expandedSections[section.id] && (
                <div className="ml-6 space-y-1 border-l border-gray-200 pl-4">
                  {section.items.map((item, index) => (
                    <div key={index}>
                      {item.subtitle && (
                        <div className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
                          {item.subtitle}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        onClick={() => {
                          navigate(item.path);
                          onToggle();
                        }}
                      >
                        <span className="mr-2 text-sm">{item.icon}</span>
                        {item.label}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Separator className="my-4" />

          {/* Reports */}
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-medium"
            onClick={() => {
              navigate('/reports');
              onToggle();
            }}
          >
            <span className="mr-3 text-lg">📋</span>
            Reports
          </Button>

          {/* Admin Dashboard - Conditional */}
          {(currentUser?.role === 'admin' || isDemoMode) && (
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-medium"
              onClick={() => {
                navigate('/admin/dashboard');
                onToggle();
              }}
            >
              <Shield className="w-4 h-4 mr-3" />
              Admin
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <Avatar className="w-10 h-10 mr-3">
              <AvatarFallback className="text-base">👤</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {isDemoMode ? "Demo User" : currentUser?.name || "User"}
              </p>
              {isDemoMode && <Badge variant="outline" className="text-xs">Demo Account</Badge>}
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onLogout();
              onToggle();
            }}
          >
            {isDemoMode ? 'Exit Demo' : 'Logout'}
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;