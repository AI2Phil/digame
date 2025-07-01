import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronDown, ChevronRight, Menu, X, Crown, Building, Globe, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import { Separator } from '../ui/Separator';

interface User {
  name?: string;
  role?: string;
  is_platform_owner?: boolean;
  subscription_tier?: string;
  tenant_id?: number;
  tenant_name?: string;
  permissions?: string[];
}

interface Tenant {
  id: number;
  name: string;
  slug: string;
  subscription_tier: string;
}

interface MenuItem {
  label: string;
  icon: string;
  path: string;
  subtitle?: string;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  minSubscriptionTier?: string;
  platformOwnerOnly?: boolean;
}

interface MenuSection {
  id: string;
  title: string;
  icon: string;
  items: MenuItem[];
  requiredRoles?: string[];
  requiredPermissions?: string[];
  minSubscriptionTier?: string;
  platformOwnerOnly?: boolean;
}

interface ExpandedSections {
  analytics: boolean;
  aiTools: boolean;
  digitalTwin: boolean;
  teams: boolean;
  social: boolean;
  tasks: boolean;
  enterprise: boolean;
  platformOwner: boolean;
  advancedEnterprise: boolean;
}

interface SidebarProps {
  isDemoMode: boolean;
  onLogout: () => void;
  currentUser?: User | null;
  isOpen: boolean;
  onToggle: () => void;
  availableTenants?: Tenant[];
  onTenantSwitch?: (tenantId: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isDemoMode, 
  onLogout, 
  currentUser, 
  isOpen, 
  onToggle, 
  availableTenants = [], 
  onTenantSwitch 
}) => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    analytics: false,
    aiTools: false,
    digitalTwin: false,
    teams: false,
    social: false,
    tasks: false,
    enterprise: false,
    platformOwner: false,
    advancedEnterprise: false
  });
  const [showTenantSelector, setShowTenantSelector] = useState(false);

  const toggleSection = (section: keyof ExpandedSections): void => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Role-based access control functions
  const hasRole = (requiredRoles?: string[]): boolean => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!currentUser?.role) return false;
    return requiredRoles.includes(currentUser.role);
  };

  const hasPermission = (requiredPermissions?: string[]): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    if (!currentUser?.permissions) return false;
    return requiredPermissions.some(permission => 
      currentUser.permissions?.includes(permission)
    );
  };

  const hasSubscriptionTier = (minTier?: string): boolean => {
    if (!minTier) return true;
    if (!currentUser?.subscription_tier) return false;
    
    const tierHierarchy = ['free', 'individual_pro', 'team', 'enterprise'];
    const userTierIndex = tierHierarchy.indexOf(currentUser.subscription_tier);
    const requiredTierIndex = tierHierarchy.indexOf(minTier);
    
    return userTierIndex >= requiredTierIndex;
  };

  const isPlatformOwner = (): boolean => {
    return currentUser?.is_platform_owner === true || isDemoMode;
  };

  const canAccessMenuItem = (item: MenuItem): boolean => {
    if (item.platformOwnerOnly && !isPlatformOwner()) return false;
    if (!hasRole(item.requiredRoles)) return false;
    if (!hasPermission(item.requiredPermissions)) return false;
    if (!hasSubscriptionTier(item.minSubscriptionTier)) return false;
    return true;
  };

  const canAccessMenuSection = (section: MenuSection): boolean => {
    if (section.platformOwnerOnly && !isPlatformOwner()) return false;
    if (!hasRole(section.requiredRoles)) return false;
    if (!hasPermission(section.requiredPermissions)) return false;
    if (!hasSubscriptionTier(section.minSubscriptionTier)) return false;
    
    // Check if at least one item in the section is accessible
    return section.items.some(item => canAccessMenuItem(item));
  };

  const handleTenantSwitch = (tenantId: number) => {
    if (onTenantSwitch) {
      onTenantSwitch(tenantId);
      setShowTenantSelector(false);
    }
  };

  const menuSections: MenuSection[] = [
    {
      id: 'analytics',
      title: 'Analytics',
      icon: '📊',
      items: [
        { label: 'Web Analytics', icon: '🌐', path: '/analytics/web' },
        { label: 'Mobile Analytics', icon: '📱', path: '/analytics/mobile' },
        { label: 'Behavioral Analytics', icon: '🧠', path: '/analytics/behavioral', subtitle: 'AI-POWERED', minSubscriptionTier: 'individual_pro' },
        { label: 'Predictive Analytics', icon: '🔮', path: '/analytics/predictive', subtitle: 'AI-POWERED', minSubscriptionTier: 'team' }
      ]
    },
    {
      id: 'aiTools',
      title: 'AI Tools',
      icon: '🤖',
      items: [
        { label: 'AI Tools Hub', icon: '🛠️', path: '/ai-tools' },
        { label: 'Writing Assistance', icon: '✍️', path: '/ai-tools?tab=writing', subtitle: 'WRITING & CONTENT', minSubscriptionTier: 'individual_pro' },
        { label: 'AI Task Suggestions', icon: '📋', path: '/tasks', subtitle: 'TASK MANAGEMENT', minSubscriptionTier: 'individual_pro' },
        { label: 'AI Insights', icon: '🧠', path: '/ai-tools?tab=insights', subtitle: 'INSIGHTS & ANALYTICS', minSubscriptionTier: 'team' },
        { label: 'AI Coaching', icon: '🎯', path: '/ai-tools?tab=coaching', subtitle: 'INSIGHTS & ANALYTICS', minSubscriptionTier: 'team' }
      ]
    },
    {
      id: 'digitalTwin',
      title: 'Digital Twin',
      icon: '🧠',
      minSubscriptionTier: 'individual_pro',
      items: [
        { label: 'My Digital Twin', icon: '🤖', path: '/digital-twin/my-twin', subtitle: 'CORE PLATFORM' },
        { label: 'Pattern Recognition', icon: '🎯', path: '/digital-twin/patterns', subtitle: 'PHASE 1A' },
        { label: 'AI Predictions', icon: '📈', path: '/digital-twin/predictions', subtitle: 'PHASE 1B', minSubscriptionTier: 'team' },
        { label: 'Twin Workspace', icon: '💬', path: '/digital-twin/workspace', subtitle: 'PHASE 1C', minSubscriptionTier: 'team' },
        { label: 'Twin Simulation', icon: '🔬', path: '/digital-twin/simulation', subtitle: 'PHASE 1C', minSubscriptionTier: 'enterprise' },
        { label: 'Intelligence API', icon: '🧮', path: '/digital-twin/intelligence', subtitle: 'PHASE 1B', minSubscriptionTier: 'team' },
        { label: 'Twin Analytics', icon: '📊', path: '/digital-twin/analytics', subtitle: 'INSIGHTS' },
        { label: 'Twin Settings', icon: '⚙️', path: '/digital-twin/settings', subtitle: 'CONFIGURATION' }
      ]
    },
    {
      id: 'teams',
      title: 'Teams',
      icon: '👥',
      minSubscriptionTier: 'team',
      items: [
        { label: 'Team Management', icon: '⚙️', path: '/teams', subtitle: 'TEAM COLLABORATION' },
        { label: 'Team Dashboard', icon: '📊', path: '/teams/dashboard', subtitle: 'TEAM COLLABORATION' },
        { label: 'Skill Gap Analysis', icon: '🎯', path: '/teams/skills', subtitle: 'TEAM COLLABORATION' },
        { label: 'Workflow Optimization', icon: '🔄', path: '/teams/workflows', subtitle: 'TEAM COLLABORATION' }
      ]
    },
    {
      id: 'social',
      title: 'Social',
      icon: '🤝',
      items: [
        { label: 'Social Collaboration', icon: '👥', path: '/social' },
        { label: 'AI Peer Matching', icon: '🧠', path: '/social?tab=peer-matching', subtitle: 'COLLABORATION', minSubscriptionTier: 'individual_pro' },
        { label: 'Mentorship Programs', icon: '🎓', path: '/social?tab=mentorship', subtitle: 'COLLABORATION', minSubscriptionTier: 'team' },
        { label: 'Project Collaboration', icon: '🎯', path: '/social?tab=projects', subtitle: 'COLLABORATION', minSubscriptionTier: 'team' },
        { label: 'Team Analytics', icon: '📈', path: '/social?tab=teams', subtitle: 'COLLABORATION', minSubscriptionTier: 'team' },
        { label: 'Industry Networking', icon: '🏢', path: '/social?tab=industry', subtitle: 'COLLABORATION', minSubscriptionTier: 'enterprise' }
      ]
    },
    {
      id: 'tasks',
      title: 'Tasks',
      icon: '📋',
      items: [
        { label: 'Task Management', icon: '📋', path: '/tasks' },
        { label: 'AI Task Suggestions', icon: '🤖', path: '/tasks?tab=suggestions', subtitle: 'AI-POWERED', minSubscriptionTier: 'individual_pro' },
        { label: 'Process Automation', icon: '⚡', path: '/tasks?tab=automation', subtitle: 'AI-POWERED', minSubscriptionTier: 'team' },
        { label: 'Task Analytics', icon: '📊', path: '/tasks?tab=insights', subtitle: 'AI-POWERED', minSubscriptionTier: 'team' }
      ]
    },
    {
      id: 'enterprise',
      title: 'Enterprise',
      icon: '🏢',
      minSubscriptionTier: 'enterprise',
      items: [
        { label: 'Enterprise Dashboard', icon: '🏢', path: '/enterprise' },
        { label: 'AI Feature Management', icon: '🤖', path: '/enterprise?tab=ai-features', subtitle: 'AI ENTERPRISE' },
        { label: 'Tenant Management', icon: '🏢', path: '/enterprise?tab=tenants', subtitle: 'AI ENTERPRISE' },
        { label: 'Security & Compliance', icon: '🔒', path: '/enterprise?tab=security', subtitle: 'AI ENTERPRISE' },
        { label: 'Enterprise Analytics', icon: '📊', path: '/enterprise?tab=overview', subtitle: 'ANALYTICS & INSIGHTS' }
      ]
    },
    {
      id: 'platformOwner',
      title: 'Platform Owner',
      icon: '👑',
      platformOwnerOnly: true,
      items: [
        { label: 'Platform Console', icon: '🏢', path: '/platform-owner/console', subtitle: 'PLATFORM MANAGEMENT' },
        { label: 'Tenant Management', icon: '🏗️', path: '/platform-owner/tenants', subtitle: 'PLATFORM MANAGEMENT' },
        { label: 'User Management', icon: '👥', path: '/platform-owner/users', subtitle: 'PLATFORM MANAGEMENT' },
        { label: 'Revenue Analytics', icon: '💰', path: '/platform-owner/revenue', subtitle: 'BUSINESS INTELLIGENCE' },
        { label: 'System Health', icon: '🔍', path: '/platform-owner/health', subtitle: 'MONITORING' },
        { label: 'Platform Settings', icon: '⚙️', path: '/platform-owner/settings', subtitle: 'CONFIGURATION' },
        { label: 'API Test Zone', icon: '🧪', path: '/platform-owner/test-zone', subtitle: 'DEVELOPMENT' }
      ]
    },
    {
      id: 'advancedEnterprise',
      title: 'Advanced Enterprise',
      icon: '🚀',
      minSubscriptionTier: 'enterprise',
      items: [
        { label: 'Multi-Tenant Console', icon: '🏢', path: '/enterprise/multi-tenant', subtitle: 'ADVANCED ENTERPRISE' },
        { label: 'Advanced Workflows', icon: '⚡', path: '/enterprise/workflows', subtitle: 'AUTOMATION' },
        { label: 'Market Intelligence', icon: '📈', path: '/enterprise/market-intel', subtitle: 'BUSINESS INTELLIGENCE' },
        { label: 'Custom Integrations', icon: '🔗', path: '/enterprise/integrations', subtitle: 'INTEGRATIONS' },
        { label: 'Advanced Analytics', icon: '📊', path: '/enterprise/advanced-analytics', subtitle: 'ANALYTICS' },
        { label: 'Compliance Center', icon: '🛡️', path: '/enterprise/compliance', subtitle: 'GOVERNANCE' }
      ]
    }
  ];

  // Filter menu sections based on user permissions
  const filteredMenuSections = menuSections.filter(section => canAccessMenuSection(section));

  return (
    <>
      {/* Sidebar */}
      <div className={`
        bg-white border-r border-gray-200 flex flex-col h-full w-80
        ${isOpen ? 'block' : 'hidden lg:block'}
        lg:block
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="digame-logo">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Digame</span>
            {isDemoMode && (
              <Badge variant="info" className="text-xs" icon="" onRemove={() => {}}>Demo</Badge>
            )}
            {isPlatformOwner() && (
              <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200" icon="" onRemove={() => {}}>
                <Crown className="w-3 h-3 mr-1" />
                Platform Owner
              </Badge>
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

        {/* Tenant Selector */}
        {availableTenants.length > 1 && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="relative">
              <Button
                variant="outline"
                className="w-full justify-between text-sm"
                onClick={() => setShowTenantSelector(!showTenantSelector)}
              >
                <div className="flex items-center">
                  <Building className="w-4 h-4 mr-2" />
                  {currentUser?.tenant_name || 'Select Tenant'}
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${showTenantSelector ? 'rotate-180' : ''}`} />
              </Button>
              
              {showTenantSelector && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {availableTenants.map((tenant) => (
                    <button
                      key={tenant.id}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                        currentUser?.tenant_id === tenant.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                      onClick={() => handleTenantSwitch(tenant.id)}
                    >
                      <div>
                        <div className="font-medium">{tenant.name}</div>
                        <div className="text-xs text-gray-500">{tenant.subscription_tier}</div>
                      </div>
                      {currentUser?.tenant_id === tenant.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Dashboard */}
          <Button
            variant="ghost"
            className="w-full justify-start text-blue-700 bg-blue-50 hover:bg-blue-100 font-semibold"
            onClick={() => {
              navigate('/dashboard');
              // Only close sidebar on mobile
              if (window.innerWidth < 1024) {
                onToggle();
              }
            }}
          >
            <span className="mr-3 text-lg">🏠</span>
            Dashboard
          </Button>

          <Separator />

          {/* Menu Sections */}
          {filteredMenuSections.map((section) => (
            <div key={section.id} className="space-y-1">
              <Button
                variant="ghost"
                className={`w-full justify-between hover:text-gray-900 hover:bg-gray-100 font-medium ${
                  section.platformOwnerOnly 
                    ? 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100' 
                    : 'text-gray-700'
                }`}
                onClick={() => toggleSection(section.id as keyof ExpandedSections)}
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg">{section.icon}</span>
                  {section.title}
                  {section.platformOwnerOnly && (
                    <Crown className="w-3 h-3 ml-2 text-yellow-600" />
                  )}
                </div>
                {expandedSections[section.id as keyof ExpandedSections] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </Button>

              {/* Collapsible Section Items */}
              {expandedSections[section.id as keyof ExpandedSections] && (
                <div className="ml-6 space-y-1 border-l border-gray-200 pl-4">
                  {section.items
                    .filter(item => canAccessMenuItem(item))
                    .map((item, index) => (
                    <div key={index}>
                      {item.subtitle && (
                        <div className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
                          {item.subtitle}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        className={`w-full justify-start text-sm hover:text-gray-900 hover:bg-gray-50 ${
                          item.platformOwnerOnly ? 'text-yellow-600' : 'text-gray-600'
                        }`}
                        onClick={() => {
                          navigate(item.path);
                          // Only close sidebar on mobile
                          if (window.innerWidth < 1024) {
                            onToggle();
                          }
                        }}
                      >
                        <span className="mr-2 text-sm">{item.icon}</span>
                        {item.label}
                        {item.platformOwnerOnly && (
                          <Crown className="w-3 h-3 ml-auto text-yellow-500" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Separator />

          {/* Reports */}
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100 font-medium"
            onClick={() => {
              navigate('/reports');
              // Only close sidebar on mobile
              if (window.innerWidth < 1024) {
                onToggle();
              }
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
                // Only close sidebar on mobile
                if (window.innerWidth < 1024) {
                  onToggle();
                }
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
            <Avatar
              className="w-10 h-10 mr-3"
              fallback={<span className="text-base">👤</span>}
              src=""
              alt=""
              name=""
              status=""
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {isDemoMode ? "Demo User" : currentUser?.name || "User"}
              </p>
              <div className="flex items-center space-x-2">
                {isDemoMode && <Badge variant="outline" className="text-xs" icon="" onRemove={() => {}}>Demo Account</Badge>}
                {currentUser?.subscription_tier && (
                  <Badge variant="outline" className="text-xs capitalize" icon="" onRemove={() => {}}>
                    {currentUser.subscription_tier.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              onLogout();
              // Only close sidebar on mobile
              if (window.innerWidth < 1024) {
                onToggle();
              }
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