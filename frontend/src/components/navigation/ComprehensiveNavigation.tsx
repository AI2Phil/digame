import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, ChevronDown, ChevronRight, Menu, X, Crown, Building, Globe, 
  Settings, Users, BarChart3, Brain, Zap, FileText, Calendar, 
  MessageSquare, Target, Briefcase, GraduationCap, Bell, Lock,
  Smartphone, Cloud, Database, Activity, TrendingUp, Search,
  Workflow, Bot, Mic, Eye, Download, Upload, Share, Code,
  Puzzle, Network, Layers, Server, Monitor, AlertTriangle,
  CheckCircle, Clock, Star, Award, Gift, Gamepad2, BookOpen,
  Camera, Video, Headphones, Map, Compass, Rocket, Lightbulb,
  Wrench, Cog, Filter, Archive, Bookmark, Flag, Hash, Link,
  Mail, Phone, MapPin, CreditCard, ShoppingCart, Package,
  Truck, Home, Coffee, Heart, Smile, ThumbsUp, MessageCircle
} from 'lucide-react';
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

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  subtitle?: string;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  minSubscriptionTier?: string;
  platformOwnerOnly?: boolean;
  description?: string;
}

interface MenuSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: MenuItem[];
  requiredRoles?: string[];
  requiredPermissions?: string[];
  minSubscriptionTier?: string;
  platformOwnerOnly?: boolean;
  description?: string;
}

interface ExpandedSections {
  [key: string]: boolean;
}

interface ComprehensiveNavigationProps {
  isDemoMode?: boolean;
  onLogout?: () => void;
  currentUser?: User | null;
  isOpen?: boolean;
  onToggle?: () => void;
  showAllFeatures?: boolean;
}

const ComprehensiveNavigation: React.FC<ComprehensiveNavigationProps> = ({ 
  isDemoMode = false, 
  onLogout = () => {}, 
  currentUser = null, 
  isOpen = true, 
  onToggle = () => {},
  showAllFeatures = true
}) => {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({});
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSection = (section: string): void => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Comprehensive menu sections mapping to ALL backend routers
  const menuSections: MenuSection[] = [
    {
      id: 'core',
      title: 'Core Platform',
      icon: <Home className="w-5 h-5" />,
      description: 'Essential platform features and dashboard',
      items: [
        { label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" />, path: '/dashboard', description: 'Main dashboard overview' },
        { label: 'User Profile', icon: <Users className="w-4 h-4" />, path: '/profile', description: 'User profile management' },
        { label: 'Settings', icon: <Settings className="w-4 h-4" />, path: '/settings', description: 'User settings and preferences' },
        { label: 'Notifications', icon: <Bell className="w-4 h-4" />, path: '/notifications', description: 'Notification center' }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Intelligence',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Comprehensive analytics and AI-powered insights',
      items: [
        { label: 'Web Analytics', icon: <Globe className="w-4 h-4" />, path: '/analytics/web', description: 'Web usage analytics' },
        { label: 'Mobile Analytics', icon: <Smartphone className="w-4 h-4" />, path: '/analytics/mobile', description: 'Mobile app analytics' },
        { label: 'Advanced Analytics', icon: <TrendingUp className="w-4 h-4" />, path: '/analytics/advanced', description: 'Advanced analytics dashboard' },
        { label: 'Behavioral Analytics', icon: <Brain className="w-4 h-4" />, path: '/analytics/behavioral', subtitle: 'AI-POWERED' },
        { label: 'Predictive Analytics', icon: <Eye className="w-4 h-4" />, path: '/analytics/predictive', subtitle: 'AI-POWERED' },
        { label: 'Pattern Recognition', icon: <Target className="w-4 h-4" />, path: '/analytics/patterns', subtitle: 'AI-POWERED' },
        { label: 'Anomaly Detection', icon: <AlertTriangle className="w-4 h-4" />, path: '/analytics/anomalies', subtitle: 'AI-POWERED' },
        { label: 'Performance Monitoring', icon: <Monitor className="w-4 h-4" />, path: '/analytics/performance', description: 'System performance metrics' },
        { label: 'Platform Analytics', icon: <Database className="w-4 h-4" />, path: '/analytics/platform', platformOwnerOnly: true }
      ]
    },
    {
      id: 'digitalTwin',
      title: 'Digital Twin & AI',
      icon: <Brain className="w-5 h-5" />,
      description: 'Digital twin creation and AI-powered features',
      items: [
        { label: 'My Digital Twin', icon: <Bot className="w-4 h-4" />, path: '/digital-twin/my-twin', subtitle: 'CORE PLATFORM' },
        { label: 'Digital Twin Onboarding', icon: <Rocket className="w-4 h-4" />, path: '/digital-twin/onboarding', description: 'Setup your digital twin' },
        { label: 'Intelligence API', icon: <Code className="w-4 h-4" />, path: '/digital-twin/intelligence', subtitle: 'API ACCESS' },
        { label: 'AI Predictions', icon: <Eye className="w-4 h-4" />, path: '/digital-twin/predictions', subtitle: 'PREDICTIONS' },
        { label: 'Twin Simulation', icon: <Layers className="w-4 h-4" />, path: '/digital-twin/simulation', subtitle: 'SIMULATION' },
        { label: 'Behavior Modeling', icon: <Brain className="w-4 h-4" />, path: '/digital-twin/behavior', subtitle: 'MODELING' },
        { label: 'Twin Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '/digital-twin/analytics', subtitle: 'INSIGHTS' }
      ]
    },
    {
      id: 'aiTools',
      title: 'AI Tools & Automation',
      icon: <Bot className="w-5 h-5" />,
      description: 'AI-powered tools and automation features',
      items: [
        { label: 'AI Tools Hub', icon: <Wrench className="w-4 h-4" />, path: '/ai-tools', description: 'Central AI tools dashboard' },
        { label: 'Writing Assistance', icon: <FileText className="w-4 h-4" />, path: '/ai-tools/writing', subtitle: 'CONTENT CREATION' },
        { label: 'Voice Processing', icon: <Mic className="w-4 h-4" />, path: '/ai-tools/voice', subtitle: 'VOICE AI' },
        { label: 'Document Processing', icon: <FileText className="w-4 h-4" />, path: '/ai-tools/documents', subtitle: 'DOCUMENT AI' },
        { label: 'Email Analysis', icon: <Mail className="w-4 h-4" />, path: '/ai-tools/email', subtitle: 'EMAIL AI' },
        { label: 'Meeting Insights', icon: <Video className="w-4 h-4" />, path: '/ai-tools/meetings', subtitle: 'MEETING AI' },
        { label: 'Communication Style', icon: <MessageSquare className="w-4 h-4" />, path: '/ai-tools/communication', subtitle: 'STYLE ANALYSIS' },
        { label: 'Mobile AI', icon: <Smartphone className="w-4 h-4" />, path: '/ai-tools/mobile', subtitle: 'MOBILE AI' },
        { label: 'Language Learning', icon: <GraduationCap className="w-4 h-4" />, path: '/ai-tools/language', subtitle: 'LEARNING AI' }
      ]
    },
    {
      id: 'workflow',
      title: 'Workflow & Automation',
      icon: <Workflow className="w-5 h-5" />,
      description: 'Workflow automation and process optimization',
      items: [
        { label: 'Workflow Automation', icon: <Zap className="w-4 h-4" />, path: '/workflow/automation', subtitle: 'AUTOMATION' },
        { label: 'Advanced Workflows', icon: <Network className="w-4 h-4" />, path: '/workflow/advanced', subtitle: 'ADVANCED' },
        { label: 'Process Optimization', icon: <TrendingUp className="w-4 h-4" />, path: '/workflow/optimization', subtitle: 'OPTIMIZATION' },
        { label: 'Process Notes', icon: <FileText className="w-4 h-4" />, path: '/workflow/notes', description: 'Process documentation' },
        { label: 'Task Prioritization', icon: <Flag className="w-4 h-4" />, path: '/workflow/prioritization', subtitle: 'TASK MANAGEMENT' },
        { label: 'Calendar Integration', icon: <Calendar className="w-4 h-4" />, path: '/workflow/calendar', description: 'Calendar management' }
      ]
    },
    {
      id: 'tasks',
      title: 'Task Management',
      icon: <CheckCircle className="w-5 h-5" />,
      description: 'Comprehensive task and project management',
      items: [
        { label: 'Task Management', icon: <CheckCircle className="w-4 h-4" />, path: '/tasks', description: 'Main task dashboard' },
        { label: 'AI Task Suggestions', icon: <Lightbulb className="w-4 h-4" />, path: '/tasks/ai-suggestions', subtitle: 'AI-POWERED' },
        { label: 'Task Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '/tasks/analytics', subtitle: 'INSIGHTS' },
        { label: 'Project Management', icon: <Briefcase className="w-4 h-4" />, path: '/tasks/projects', description: 'Project tracking' }
      ]
    },
    {
      id: 'teams',
      title: 'Team Collaboration',
      icon: <Users className="w-5 h-5" />,
      description: 'Team management and collaboration tools',
      items: [
        { label: 'Team Management', icon: <Users className="w-4 h-4" />, path: '/teams', description: 'Team dashboard' },
        { label: 'Team Dashboard', icon: <BarChart3 className="w-4 h-4" />, path: '/teams/dashboard', subtitle: 'TEAM INSIGHTS' },
        { label: 'Social Collaboration', icon: <MessageCircle className="w-4 h-4" />, path: '/teams/social', subtitle: 'COLLABORATION' },
        { label: 'Mentorship Programs', icon: <GraduationCap className="w-4 h-4" />, path: '/teams/mentorship', subtitle: 'MENTORSHIP' },
        { label: 'Skill Gap Analysis', icon: <Target className="w-4 h-4" />, path: '/teams/skills', subtitle: 'SKILLS ANALYSIS' },
        { label: 'Workflow Optimization', icon: <Workflow className="w-4 h-4" />, path: '/teams/workflows', subtitle: 'OPTIMIZATION' }
      ]
    },
    {
      id: 'career',
      title: 'Career Development',
      icon: <GraduationCap className="w-5 h-5" />,
      description: 'Career planning and professional development',
      items: [
        { label: 'Career Path Modeling', icon: <Map className="w-4 h-4" />, path: '/career/modeling', subtitle: 'CAREER PLANNING' },
        { label: 'Job Recommendations', icon: <Briefcase className="w-4 h-4" />, path: '/career/jobs', subtitle: 'JOB MATCHING' },
        { label: 'Skill Development', icon: <Star className="w-4 h-4" />, path: '/career/skills', description: 'Skill tracking' },
        { label: 'Learning Paths', icon: <BookOpen className="w-4 h-4" />, path: '/career/learning', description: 'Learning recommendations' },
        { label: 'Professional Network', icon: <Network className="w-4 h-4" />, path: '/career/network', description: 'Network building' }
      ]
    },
    {
      id: 'integrations',
      title: 'Integrations & APIs',
      icon: <Puzzle className="w-5 h-5" />,
      description: 'Third-party integrations and API management',
      items: [
        { label: 'Integration Hub', icon: <Puzzle className="w-4 h-4" />, path: '/integrations', description: 'Integration dashboard' },
        { label: 'Guest Integrations', icon: <Globe className="w-4 h-4" />, path: '/integrations/guest', description: 'Guest user integrations' },
        { label: 'SSO Configuration', icon: <Lock className="w-4 h-4" />, path: '/integrations/sso', subtitle: 'SINGLE SIGN-ON' },
        { label: 'API Management', icon: <Code className="w-4 h-4" />, path: '/integrations/api', subtitle: 'API ACCESS' },
        { label: 'Webhooks', icon: <Link className="w-4 h-4" />, path: '/integrations/webhooks', description: 'Webhook configuration' },
        { label: 'Data Export/Import', icon: <Download className="w-4 h-4" />, path: '/integrations/data', description: 'Data management' }
      ]
    },
    {
      id: 'security',
      title: 'Security & Compliance',
      icon: <Lock className="w-5 h-5" />,
      description: 'Security features and compliance tools',
      items: [
        { label: 'Security Dashboard', icon: <Shield className="w-4 h-4" />, path: '/security', description: 'Security overview' },
        { label: 'Multi-Factor Auth', icon: <Lock className="w-4 h-4" />, path: '/security/mfa', subtitle: 'MFA SETUP' },
        { label: 'Access Control', icon: <Users className="w-4 h-4" />, path: '/security/access', subtitle: 'RBAC' },
        { label: 'Audit Logs', icon: <FileText className="w-4 h-4" />, path: '/security/audit', description: 'Security audit logs' },
        { label: 'Compliance Center', icon: <CheckCircle className="w-4 h-4" />, path: '/security/compliance', subtitle: 'COMPLIANCE' }
      ]
    },
    {
      id: 'reporting',
      title: 'Reports & Publishing',
      icon: <FileText className="w-5 h-5" />,
      description: 'Report generation and content publishing',
      items: [
        { label: 'Reports Dashboard', icon: <FileText className="w-4 h-4" />, path: '/reports', description: 'Main reports dashboard' },
        { label: 'Custom Reports', icon: <BarChart3 className="w-4 h-4" />, path: '/reports/custom', description: 'Custom report builder' },
        { label: 'Publishing Center', icon: <Upload className="w-4 h-4" />, path: '/reports/publish', subtitle: 'PUBLISHING' },
        { label: 'Report Analytics', icon: <TrendingUp className="w-4 h-4" />, path: '/reports/analytics', subtitle: 'REPORT INSIGHTS' },
        { label: 'Scheduled Reports', icon: <Clock className="w-4 h-4" />, path: '/reports/scheduled', description: 'Automated reporting' }
      ]
    },
    {
      id: 'enterprise',
      title: 'Enterprise Features',
      icon: <Building className="w-5 h-5" />,
      description: 'Enterprise-grade features and management',
      minSubscriptionTier: 'enterprise',
      items: [
        { label: 'Enterprise Dashboard', icon: <Building className="w-4 h-4" />, path: '/enterprise', description: 'Enterprise overview' },
        { label: 'Multi-Tenant Console', icon: <Globe className="w-4 h-4" />, path: '/enterprise/multi-tenant', subtitle: 'MULTI-TENANT' },
        { label: 'Tenant Management', icon: <Building className="w-4 h-4" />, path: '/enterprise/tenants', subtitle: 'TENANT ADMIN' },
        { label: 'Market Intelligence', icon: <TrendingUp className="w-4 h-4" />, path: '/enterprise/market-intel', subtitle: 'MARKET INSIGHTS' },
        { label: 'Advanced Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '/enterprise/advanced-analytics', subtitle: 'ENTERPRISE ANALYTICS' },
        { label: 'Custom Integrations', icon: <Puzzle className="w-4 h-4" />, path: '/enterprise/integrations', subtitle: 'CUSTOM INTEGRATIONS' }
      ]
    },
    {
      id: 'platformOwner',
      title: 'Platform Owner',
      icon: <Crown className="w-5 h-5" />,
      description: 'Platform owner exclusive management tools',
      platformOwnerOnly: true,
      items: [
        { label: 'Platform Console', icon: <Server className="w-4 h-4" />, path: '/platform-owner/console', subtitle: 'PLATFORM MANAGEMENT' },
        { label: 'Tenant Management', icon: <Building className="w-4 h-4" />, path: '/platform-owner/tenants', subtitle: 'ALL TENANTS' },
        { label: 'User Management', icon: <Users className="w-4 h-4" />, path: '/platform-owner/users', subtitle: 'ALL USERS' },
        { label: 'Revenue Analytics', icon: <TrendingUp className="w-4 h-4" />, path: '/platform-owner/revenue', subtitle: 'BUSINESS INTELLIGENCE' },
        { label: 'System Health', icon: <Activity className="w-4 h-4" />, path: '/platform-owner/health', subtitle: 'MONITORING' },
        { label: 'Platform Settings', icon: <Settings className="w-4 h-4" />, path: '/platform-owner/settings', subtitle: 'CONFIGURATION' },
        { label: 'API Test Zone', icon: <Code className="w-4 h-4" />, path: '/platform-owner/test-zone', subtitle: 'DEVELOPMENT' }
      ]
    },
    {
      id: 'admin',
      title: 'Administration',
      icon: <Shield className="w-5 h-5" />,
      description: 'Administrative tools and configuration',
      requiredRoles: ['admin'],
      items: [
        { label: 'Admin Dashboard', icon: <Shield className="w-4 h-4" />, path: '/admin/dashboard', description: 'Admin overview' },
        { label: 'Admin Configuration', icon: <Settings className="w-4 h-4" />, path: '/admin/config', subtitle: 'SYSTEM CONFIG' },
        { label: 'RBAC Management', icon: <Lock className="w-4 h-4" />, path: '/admin/rbac', subtitle: 'ROLE MANAGEMENT' },
        { label: 'System Monitoring', icon: <Monitor className="w-4 h-4" />, path: '/admin/monitoring', subtitle: 'SYSTEM HEALTH' },
        { label: 'User Administration', icon: <Users className="w-4 h-4" />, path: '/admin/users', description: 'User management' }
      ]
    },
    {
      id: 'guest',
      title: 'Guest Features',
      icon: <Eye className="w-5 h-5" />,
      description: 'Guest user capabilities and analytics',
      items: [
        { label: 'Guest Dashboard', icon: <Eye className="w-4 h-4" />, path: '/guest', description: 'Guest user dashboard' },
        { label: 'Guest Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '/guest/analytics', subtitle: 'GUEST INSIGHTS' },
        { label: 'Guest Experience', icon: <Star className="w-4 h-4" />, path: '/guest/experience', subtitle: 'EXPERIENCE TRACKING' },
        { label: 'Guest Authentication', icon: <Lock className="w-4 h-4" />, path: '/guest/auth', description: 'Guest login options' }
      ]
    },
    {
      id: 'onboarding',
      title: 'Onboarding & Setup',
      icon: <Rocket className="w-5 h-5" />,
      description: 'User onboarding and initial setup',
      items: [
        { label: 'Onboarding Flow', icon: <Rocket className="w-4 h-4" />, path: '/onboarding', description: 'User onboarding' },
        { label: 'Enhanced Onboarding', icon: <Star className="w-4 h-4" />, path: '/onboarding/enhanced', subtitle: 'ADVANCED SETUP' },
        { label: 'Setup Wizard', icon: <Wrench className="w-4 h-4" />, path: '/onboarding/wizard', description: 'Guided setup' },
        { label: 'Getting Started', icon: <BookOpen className="w-4 h-4" />, path: '/onboarding/getting-started', description: 'Quick start guide' }
      ]
    }
  ];

  // Role-based access control functions
  const hasRole = (requiredRoles?: string[]): boolean => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!currentUser?.role) return showAllFeatures;
    return requiredRoles.includes(currentUser.role);
  };

  const hasPermission = (requiredPermissions?: string[]): boolean => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    if (!currentUser?.permissions) return showAllFeatures;
    return requiredPermissions.some(permission => 
      currentUser.permissions?.includes(permission)
    );
  };

  const hasSubscriptionTier = (minTier?: string): boolean => {
    if (!minTier) return true;
    if (!currentUser?.subscription_tier) return showAllFeatures;
    
    const tierHierarchy = ['free', 'individual_pro', 'team', 'enterprise'];
    const userTierIndex = tierHierarchy.indexOf(currentUser.subscription_tier);
    const requiredTierIndex = tierHierarchy.indexOf(minTier);
    
    return userTierIndex >= requiredTierIndex;
  };

  const isPlatformOwner = (): boolean => {
    return currentUser?.is_platform_owner === true || isDemoMode || showAllFeatures;
  };

  const canAccessMenuItem = (item: MenuItem): boolean => {
    if (!showAllFeatures) {
      if (item.platformOwnerOnly && !isPlatformOwner()) return false;
      if (!hasRole(item.requiredRoles)) return false;
      if (!hasPermission(item.requiredPermissions)) return false;
      if (!hasSubscriptionTier(item.minSubscriptionTier)) return false;
    }
    return true;
  };

  const canAccessMenuSection = (section: MenuSection): boolean => {
    if (!showAllFeatures) {
      if (section.platformOwnerOnly && !isPlatformOwner()) return false;
      if (!hasRole(section.requiredRoles)) return false;
      if (!hasPermission(section.requiredPermissions)) return false;
      if (!hasSubscriptionTier(section.minSubscriptionTier)) return false;
    }
    
    // Check if at least one item in the section is accessible
    return section.items.some(item => canAccessMenuItem(item));
  };

  // Filter menu sections and items based on search
  const filteredMenuSections = menuSections
    .filter(section => canAccessMenuSection(section))
    .map(section => ({
      ...section,
      items: section.items
        .filter(item => canAccessMenuItem(item))
        .filter(item => 
          searchTerm === '' || 
          item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }))
    .filter(section => section.items.length > 0);

  const totalFeatures = filteredMenuSections.reduce((total, section) => total + section.items.length, 0);

  return (
    <div className={`
      bg-white border-r border-gray-200 flex flex-col h-full w-96
      ${isOpen ? 'block' : 'hidden lg:block'}
      lg:block
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="digame-logo">
            <span className="text-white font-bold text-sm">D</span>
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900">Digame</span>
            <div className="text-xs text-gray-500">Complete Feature Access</div>
          </div>
          {isPlatformOwner() && (
            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
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

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search features..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          {totalFeatures} features available
        </div>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredMenuSections.map((section) => (
          <div key={section.id} className="space-y-1">
            <Button
              variant="ghost"
              className={`w-full justify-between hover:text-gray-900 hover:bg-gray-100 font-medium text-sm ${
                section.platformOwnerOnly 
                  ? 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100' 
                  : 'text-gray-700'
              }`}
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center">
                {section.icon}
                <div className="ml-3 text-left">
                  <div className="font-medium">{section.title}</div>
                  {section.description && (
                    <div className="text-xs text-gray-500">{section.description}</div>
                  )}
                </div>
                {section.platformOwnerOnly && (
                  <Crown className="w-3 h-3 ml-2 text-yellow-600" />
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {section.items.length}
                </Badge>
                {expandedSections[section.id] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
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
                      className={`w-full justify-start text-sm hover:text-gray-900 hover:bg-gray-50 ${
                        item.platformOwnerOnly ? 'text-yellow-600' : 'text-gray-600'
                      }`}
                      onClick={() => {
                        navigate(item.path);
                        if (window.innerWidth < 1024) {
                          onToggle();
                        }
                      }}
                    >
                      <div className="flex items-center w-full">
                        {item.icon}
                        <div className="ml-2 flex-1 text-left">
                          <div className="font-medium">{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500">{item.description}</div>
                          )}
                        </div>
                        {item.platformOwnerOnly && (
                          <Crown className="w-3 h-3 ml-auto text-yellow-500" />
                        )}
                      </div>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
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
              {isDemoMode && <Badge variant="outline" className="text-xs">Demo Account</Badge>}
              {currentUser?.subscription_tier && (
                <Badge variant="outline" className="text-xs capitalize">
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
            if (window.innerWidth < 1024) {
              onToggle();
            }
          }}
        >
          {isDemoMode ? 'Exit Demo' : 'Logout'}
        </Button>
      </div>
    </div>
  );
};

export default ComprehensiveNavigation;