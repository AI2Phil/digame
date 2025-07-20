import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Crown,
  Building,
  Shield,
  Menu,
  X,
  Globe,
  Settings as SettingsIcon,
  Users, BarChart3, Brain, Zap, FileText, Calendar,
  MessageSquare, Target, Briefcase, GraduationCap, Bell, Lock,
  Smartphone, Cloud, Database, Activity, TrendingUp,
  Workflow, Bot, Mic, Eye, Download, Upload, Share, Code, Store,
  Puzzle, Network, Layers, Server, Monitor, AlertTriangle,
  CheckCircle, Clock, Star, Award, Gift, Gamepad2, BookOpen,
  Camera, Video, Headphones, Map, Compass, Rocket, Lightbulb,
  Wrench, Cog, Filter, Archive, Bookmark, Flag, Hash, Link,
  Mail, Phone, MapPin, CreditCard, ShoppingCart, Package,
  Truck, Home, Coffee, Heart, Smile, ThumbsUp, MessageCircle,
  Key, Palette, Gauge, LineChart, PieChart, BarChart, Radar,
  Cpu, HardDrive, Wifi, Signal, Zap as Lightning, Shield as ShieldCheck,
  UserCheck, Settings2, Sliders, GitBranch, GitMerge, Boxes,
  Container, Layers2, Workflow as WorkflowIcon, Sparkles,
  Microscope, TestTube, FlaskConical, Beaker, Scale, Gavel,
  FileCheck, ClipboardCheck, UserCog, Users2, Building2,
  Factory, Warehouse, Store as StoreIcon, ShoppingBag, Handshake
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

interface NextJSComprehensiveNavigationProps {
  isDemoMode?: boolean;
  onLogout?: () => void;
  currentUser?: User | null;
  isOpen?: boolean;
  onToggle?: () => void;
  showAllFeatures?: boolean;
}

const NextJSComprehensiveNavigation: React.FC<NextJSComprehensiveNavigationProps> = ({
  isDemoMode = false,
  onLogout = () => {},
  currentUser = null,
  isOpen = true,
  onToggle = () => {},
  showAllFeatures = true
}) => {
  const router = useRouter();
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
        { label: 'Settings', icon: <SettingsIcon className="w-4 h-4" />, path: '/settings', description: 'Comprehensive account settings and preferences' },
        { label: 'API Keys', icon: <Key className="w-4 h-4" />, path: '/settings/api-keys', subtitle: 'AI SERVICES', description: 'Manage your third-party AI service API keys (OpenAI, Anthropic, etc.)' },
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
        { label: 'Revenue Analytics', icon: <CreditCard className="w-4 h-4" />, path: '/analytics/revenue', subtitle: 'BUSINESS INTELLIGENCE', description: 'Revenue insights, predictions, and churn analysis' },
        { label: 'KPI Cards Test', icon: <BarChart3 className="w-4 h-4" />, path: '/analytics/kpi-test', subtitle: 'WIDGET TESTING', description: 'KPI card components testing and validation' },
        { label: 'User Behavior Analytics', icon: <Users className="w-4 h-4" />, path: '/analytics/user-behavior', subtitle: 'USER INSIGHTS', description: 'Comprehensive user engagement and behavior analysis' },
        { label: 'Behavioral Analytics', icon: <Brain className="w-4 h-4" />, path: '/analytics/behavioral', subtitle: 'AI-POWERED' },
        { label: 'Predictive Analytics', icon: <Eye className="w-4 h-4" />, path: '/analytics/predictive', subtitle: 'AI-POWERED' },
        { label: 'Pattern Recognition', icon: <Target className="w-4 h-4" />, path: '/analytics/patterns', subtitle: 'AI-POWERED' },
        { label: 'Anomaly Detection', icon: <AlertTriangle className="w-4 h-4" />, path: '/analytics/anomalies', subtitle: 'AI-POWERED' },
        { label: 'Performance Monitoring', icon: <Monitor className="w-4 h-4" />, path: '/analytics/performance', description: 'System performance metrics' },
        { label: 'Performance Dashboard', icon: <Activity className="w-4 h-4" />, path: '/performance/monitoring-dashboard', subtitle: 'COMPREHENSIVE', description: 'Comprehensive performance monitoring with UX tracking, query optimization, and bundle analysis' },
        { label: 'Real-Time Monitor', icon: <Activity className="w-4 h-4" />, path: '/performance/real-time-monitor', subtitle: 'REAL-TIME', description: 'Live performance monitoring with automated optimizations' },
        { label: 'User Experience Tracking', icon: <Eye className="w-4 h-4" />, path: '/performance/user-experience', subtitle: 'UX MONITORING', description: 'Real-time user experience tracking and Core Web Vitals monitoring' },
        { label: 'Query Optimization', icon: <Database className="w-4 h-4" />, path: '/performance/query-optimization', subtitle: 'DATABASE OPTIMIZATION', description: 'Database query performance analysis and optimization recommendations' },
        { label: 'Bundle Analyzer', icon: <Package className="w-4 h-4" />, path: '/performance/bundle-analyzer', subtitle: 'BUNDLE OPTIMIZATION', description: 'Application bundle analysis and optimization recommendations' },
        { label: 'Dashboard Builder', icon: <Wrench className="w-4 h-4" />, path: '/analytics/dashboard-builder', subtitle: 'DASHBOARD TOOLS', description: 'Create and customize analytics dashboards' },
        { label: 'Platform Analytics', icon: <Database className="w-4 h-4" />, path: '/analytics/platform', platformOwnerOnly: true }
      ]
    },
    {
      id: 'digitalTwin',
      title: 'Digital Twin & AI',
      icon: <Brain className="w-5 h-5" />,
      description: 'Digital twin creation and AI-powered features',
      items: [
        { label: 'Digital Twin Dashboard', icon: <Brain className="w-4 h-4" />, path: '/digital-twin/dashboard', subtitle: 'DASHBOARD', description: 'Comprehensive digital twin management and analytics' },
        { label: 'Twin Overview', icon: <Eye className="w-4 h-4" />, path: '/digital-twin/overview', subtitle: 'OVERVIEW', description: 'Comprehensive overview of your digital twin learning and insights' },
        { label: 'Real-Time Twin Dashboard', icon: <Activity className="w-4 h-4" />, path: '/digital-twin/real-time', subtitle: 'REAL-TIME', description: 'Live twin status, learning progress, and real-time analytics' },
        { label: 'My Digital Twin', icon: <Bot className="w-4 h-4" />, path: '/digital-twin/my-twin', subtitle: 'CORE PLATFORM' },
        { label: 'Digital Twin Onboarding', icon: <Rocket className="w-4 h-4" />, path: '/digital-twin/onboarding', description: 'Setup your digital twin' },
        { label: 'Intelligence API', icon: <Code className="w-4 h-4" />, path: '/digital-twin/intelligence', subtitle: 'API ACCESS' },
        { label: 'AI Predictions', icon: <Eye className="w-4 h-4" />, path: '/digital-twin/predictions', subtitle: 'PREDICTIONS' },
        { label: 'Twin Insights', icon: <Lightbulb className="w-4 h-4" />, path: '/digital-twin/insights', subtitle: 'INSIGHTS', description: 'Comprehensive insights from your digital twin with recommendations and patterns' },
        { label: 'Twin Patterns', icon: <Target className="w-4 h-4" />, path: '/digital-twin/patterns', subtitle: 'PATTERNS', description: 'Behavioral patterns discovered by your digital twin' },
        { label: 'Twin Interaction', icon: <MessageSquare className="w-4 h-4" />, path: '/digital-twin/interaction', subtitle: 'CHAT', description: 'Interactive conversation with your digital twin' },
        { label: 'Twin Workspace', icon: <Brain className="w-4 h-4" />, path: '/digital-twin/workspace', subtitle: 'WORKSPACE', description: 'Advanced workspace with intent recognition and analytics' },
        { label: 'Twin Simulation', icon: <Layers className="w-4 h-4" />, path: '/digital-twin/simulation', subtitle: 'SIMULATION' },
        { label: 'Twin Settings', icon: <SettingsIcon className="w-4 h-4" />, path: '/digital-twin/settings', subtitle: 'SETTINGS', description: 'Configure your digital twin preferences and advanced options' },
        { label: 'Team Coordination', icon: <Users className="w-4 h-4" />, path: '/digital-twin/team-coordination', subtitle: 'TEAM COORDINATION', description: 'Orchestrate multi-twin optimization and team collaboration' },
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
        { label: 'Predictive Modeling', icon: <Eye className="w-4 h-4" />, path: '/ai/predictive-modeling', subtitle: 'PREDICTIVE AI', description: 'Advanced forecasting and recommendation engines' },
        { label: 'AI-Powered Automation', icon: <Bot className="w-4 h-4" />, path: '/ai/ai-automation', subtitle: 'AI AUTOMATION', description: 'Intelligent workflow automation with AI insights' },
        { label: 'Writing Assistance', icon: <FileText className="w-4 h-4" />, path: '/ai-tools/writing', subtitle: 'CONTENT CREATION' },
        { label: 'Communication Style', icon: <MessageSquare className="w-4 h-4" />, path: '/ai-tools/communication', subtitle: 'STYLE ANALYSIS' },
        { label: 'Language Learning', icon: <GraduationCap className="w-4 h-4" />, path: '/ai-tools/language', subtitle: 'LEARNING AI' },
        { label: 'NLP Enhancement', icon: <Bot className="w-4 h-4" />, path: '/ai-tools/nlp', subtitle: 'TEXT ANALYSIS' },
        { label: 'Voice Processing', icon: <Mic className="w-4 h-4" />, path: '/ai-tools/voice', subtitle: 'VOICE AI' },
        { label: 'Document Processing', icon: <FileText className="w-4 h-4" />, path: '/ai-tools/documents', subtitle: 'DOCUMENT AI' },
        { label: 'Email Analysis', icon: <Mail className="w-4 h-4" />, path: '/ai-tools/email', subtitle: 'EMAIL AI' },
        { label: 'Meeting Insights', icon: <Video className="w-4 h-4" />, path: '/ai-tools/meetings', subtitle: 'MEETING AI' }
      ]
    },
    {
      id: 'workflow',
      title: 'Workflow & Automation',
      icon: <Workflow className="w-5 h-5" />,
      description: 'Workflow automation and process optimization',
      items: [
        { label: 'Workflow Automation', icon: <Zap className="w-4 h-4" />, path: '/workflow/automation', subtitle: 'AUTOMATION' },
        { label: 'Advanced Workflow Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '/workflow/advanced-analytics', subtitle: 'ADVANCED ANALYTICS', description: 'Real-time workflow performance metrics, bottleneck analysis, and AI-powered optimization insights' },
        { label: 'Workflow Marketplace', icon: <Store className="w-4 h-4" />, path: '/workflow/marketplace', subtitle: 'MARKETPLACE', description: 'Discover, share, and collaborate on workflow templates with the community' },
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
      id: 'social',
      title: 'Social Networking',
      icon: <Network className="w-5 h-5" />,
      description: 'Professional networking and social collaboration platform',
      items: [
        { label: 'Social Collaboration Dashboard', icon: <Users className="w-4 h-4" />, path: '/social/collaboration', subtitle: 'NETWORKING HUB', description: 'Comprehensive professional networking platform with peer matching, mentorship programs, and learning partnerships' },
        { label: 'Peer Matching', icon: <Network className="w-4 h-4" />, path: '/social/peer-matching', subtitle: 'PEER DISCOVERY', description: 'AI-powered peer matching based on skills, goals, and compatibility factors' },
        { label: 'Professional Network', icon: <Users className="w-4 h-4" />, path: '/social/network', subtitle: 'NETWORK MANAGEMENT', description: 'Manage your professional connections and network growth' },
        { label: 'Mentorship Hub', icon: <GraduationCap className="w-4 h-4" />, path: '/social/mentorship', subtitle: 'MENTORSHIP PROGRAMS', description: 'Join mentorship programs or become a mentor in your expertise area' },
        { label: 'Learning Partners', icon: <BookOpen className="w-4 h-4" />, path: '/social/learning-partners', subtitle: 'COLLABORATIVE LEARNING', description: 'Find study buddies, project partners, and accountability partners' },
        { label: 'Community Forums', icon: <MessageCircle className="w-4 h-4" />, path: '/social/forums', subtitle: 'COMMUNITY ENGAGEMENT', description: 'Participate in professional discussions and knowledge sharing' },
        { label: 'Networking Events', icon: <Calendar className="w-4 h-4" />, path: '/social/events', subtitle: 'EVENTS & MEETUPS', description: 'Discover and attend professional networking events' },
        { label: 'Social Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '/social/analytics', subtitle: 'NETWORK INSIGHTS', description: 'Track your networking progress and collaboration metrics' }
      ]
    },
    {
      id: 'learning',
      title: 'Learning & Development',
      icon: <GraduationCap className="w-5 h-5" />,
      description: 'Comprehensive learning and skill development platform',
      items: [
        { label: 'Learning Dashboard', icon: <BookOpen className="w-4 h-4" />, path: '/learning/dashboard', subtitle: 'LEARNING HUB', description: 'Centralized learning dashboard with progress tracking and recommendations' },
        { label: 'Learning Paths', icon: <Target className="w-4 h-4" />, path: '/learning/paths', subtitle: 'STRUCTURED LEARNING', description: 'Curated learning paths for skill development and career advancement' },
        { label: 'Skills Assessment', icon: <Award className="w-4 h-4" />, path: '/learning/assessment', subtitle: 'SKILL EVALUATION', description: 'Comprehensive skills assessment and gap analysis' },
        { label: 'Course Catalog', icon: <BookOpen className="w-4 h-4" />, path: '/learning/courses', subtitle: 'COURSE LIBRARY', description: 'Browse and enroll in professional development courses' },
        { label: 'AI Learning Assistant', icon: <Bot className="w-4 h-4" />, path: '/learning/ai-assistant', subtitle: 'AI-POWERED LEARNING', description: 'Personalized AI learning assistant for adaptive education' },
        { label: 'Language Learning', icon: <Globe className="w-4 h-4" />, path: '/learning/language', subtitle: 'LANGUAGE SKILLS', description: 'AI-powered language learning and communication enhancement' },
        { label: 'Skill Tracking', icon: <TrendingUp className="w-4 h-4" />, path: '/learning/skill-tracking', subtitle: 'PROGRESS MONITORING', description: 'Track skill development progress and learning milestones' },
        { label: 'Learning Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '/learning/analytics', subtitle: 'LEARNING INSIGHTS', description: 'Detailed analytics on learning progress and effectiveness' },
        { label: 'Certification Hub', icon: <Award className="w-4 h-4" />, path: '/learning/certifications', subtitle: 'CERTIFICATIONS', description: 'Manage professional certifications and credentials' }
      ]
    },
    {
      id: 'teams',
      title: 'Team Collaboration',
      icon: <Users className="w-5 h-5" />,
      description: 'Team management and collaboration tools',
      items: [
        { label: 'Team Management', icon: <Users className="w-4 h-4" />, path: '/team', subtitle: 'CORE FEATURE', description: 'Team dashboard and member management - Required Next.js page integration' },
        { label: 'Team Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '/team/analytics', subtitle: 'ADVANCED ANALYTICS', description: 'Advanced team analytics with performance metrics, collaboration scoring, and AI-powered insights - Required Next.js page integration' },
        { label: 'Collaboration Optimization', icon: <Workflow className="w-4 h-4" />, path: '/team/collaboration', subtitle: 'COLLABORATION OPTIMIZATION', description: 'AI-powered workflow optimization and collaboration recommendations - Required Next.js page integration' },
        { label: 'Team Dashboard', icon: <BarChart3 className="w-4 h-4" />, path: '/team/dashboard', subtitle: 'TEAM INSIGHTS' },
        { label: 'Real-Time Collaboration', icon: <MessageSquare className="w-4 h-4" />, path: '/collaboration/real-time', subtitle: 'REAL-TIME COMMUNICATION', description: 'Real-time collaboration dashboard with messaging, video calls, and workspace collaboration - Required Next.js page integration' },
        { label: 'Social Collaboration', icon: <MessageCircle className="w-4 h-4" />, path: '/team/social', subtitle: 'COLLABORATION' },
        { label: 'Skill Gap Analysis', icon: <Target className="w-4 h-4" />, path: '/team/skills', subtitle: 'SKILLS ANALYSIS' }
      ]
    },
    {
      id: 'career',
      title: 'Career Development',
      icon: <GraduationCap className="w-5 h-5" />,
      description: 'Career growth and professional development',
      items: [
        { label: 'Career Dashboard', icon: <Briefcase className="w-4 h-4" />, path: '/career', description: 'Career overview' },
        { label: 'Job Opportunities', icon: <Target className="w-4 h-4" />, path: '/career/jobs', description: 'Job search and matching' },
        { label: 'Learning Paths', icon: <BookOpen className="w-4 h-4" />, path: '/career/learning', subtitle: 'SKILL DEVELOPMENT' },
        { label: 'Career Modeling', icon: <TrendingUp className="w-4 h-4" />, path: '/career/modeling', subtitle: 'AI-POWERED' },
        { label: 'Professional Network', icon: <Network className="w-4 h-4" />, path: '/career/network', description: 'Networking tools' },
        { label: 'Skills Assessment', icon: <Award className="w-4 h-4" />, path: '/career/skills', subtitle: 'ASSESSMENT' }
      ]
    },
    {
      id: 'reports',
      title: 'Reports & Publishing',
      icon: <FileText className="w-5 h-5" />,
      description: 'Report generation and content publishing',
      items: [
        { label: 'Advanced Reporting Dashboard', icon: <FileText className="w-4 h-4" />, path: '/reports', subtitle: 'BUSINESS INTELLIGENCE', description: 'Advanced reporting dashboard with comprehensive business intelligence and analytics - Required Next.js page integration (maps to /reporting/dashboard)' },
        { label: 'Custom Report Builder', icon: <Wrench className="w-4 h-4" />, path: '/reports/builder', subtitle: 'CUSTOM REPORT BUILDER', description: 'Custom report builder with advanced visualization and filtering capabilities - Required Next.js page integration (maps to /reporting/custom)' },
        { label: 'Data Visualization Engine', icon: <BarChart3 className="w-4 h-4" />, path: '/reports/visualization', subtitle: 'VISUALIZATION ENGINE', description: 'Data visualization engine with advanced rendering and optimization platform - Required Next.js page integration (maps to /reporting/visualizations)' },
        { label: 'Predictive Analytics Engine', icon: <Brain className="w-4 h-4" />, path: '/reports/predictive', subtitle: 'PREDICTIVE ANALYTICS', description: 'Predictive analytics engine with AI-powered forecasting and machine learning platform - Required Next.js page integration (maps to /reporting/predictive)', minSubscriptionTier: 'enterprise' },
        { label: 'Analytics Reports', icon: <BarChart3 className="w-4 h-4" />, path: '/reports/analytics', subtitle: 'DATA REPORTS' },
        { label: 'Scheduled Reports', icon: <Clock className="w-4 h-4" />, path: '/reports/scheduled', description: 'Automated reporting' },
        { label: 'Report Publishing', icon: <Share className="w-4 h-4" />, path: '/reports/publish', subtitle: 'PUBLISHING' }
      ]
    },
    {
      id: 'security',
      title: 'Security & Compliance',
      icon: <Shield className="w-5 h-5" />,
      description: 'Security management and compliance tools',
      items: [
        { label: 'Security Dashboard', icon: <Shield className="w-4 h-4" />, path: '/security', description: 'Security overview' },
        { label: 'Advanced Security Dashboard', icon: <Shield className="w-4 h-4" />, path: '/security/advanced-dashboard', subtitle: 'ADVANCED SECURITY', description: 'Comprehensive security monitoring with real-time threat detection' },
        { label: 'Compliance Management', icon: <CheckCircle className="w-4 h-4" />, path: '/security/compliance', subtitle: 'COMPLIANCE FRAMEWORKS', description: 'Automated compliance monitoring for SOC 2, ISO 27001, GDPR, HIPAA, and PCI DSS' },
        { label: 'Audit Trail Analytics', icon: <FileText className="w-4 h-4" />, path: '/security/audit-trail', subtitle: 'AUDIT ANALYTICS', description: 'Comprehensive audit log analysis with user activity monitoring' },
        { label: 'Risk Assessment Engine', icon: <AlertTriangle className="w-4 h-4" />, path: '/security/risk-assessment', subtitle: 'RISK MANAGEMENT', description: 'Advanced risk scoring with vulnerability assessment and threat modeling' },
        { label: 'Access Control', icon: <Lock className="w-4 h-4" />, path: '/security/access', subtitle: 'ACCESS MANAGEMENT' },
        { label: 'Audit Logs', icon: <FileText className="w-4 h-4" />, path: '/security/audit', description: 'Security audit trails' },
        { label: 'Multi-Factor Auth', icon: <Smartphone className="w-4 h-4" />, path: '/security/mfa', subtitle: 'MFA' }
      ]
    },
    {
      id: 'integration',
      title: 'Integration & APIs',
      icon: <Puzzle className="w-5 h-5" />,
      description: 'System integrations and API management',
      items: [
        { label: 'Integration Hub', icon: <Puzzle className="w-4 h-4" />, path: '/integrations', description: 'Comprehensive integration management and marketplace' },
        { label: 'Integration Management', icon: <BarChart3 className="w-4 h-4" />, path: '/integrations/management', subtitle: 'INTEGRATION MANAGEMENT', description: 'Monitor and manage integration connections, sync analytics, and third-party service management' },
        { label: 'Integration Marketplace', icon: <Store className="w-4 h-4" />, path: '/integrations/marketplace', subtitle: 'MARKETPLACE', description: 'Discover and install new integrations for your platform' },
        { label: 'OAuth Configuration', icon: <Shield className="w-4 h-4" />, path: '/integrations/configure', subtitle: 'OAUTH SETUP', description: 'Configure OAuth settings for third-party integrations' },
        { label: 'Webhook Management', icon: <Link className="w-4 h-4" />, path: '/integrations', subtitle: 'WEBHOOKS', description: 'Manage webhooks from the main integrations dashboard' },
        { label: 'API Keys & Settings', icon: <Key className="w-4 h-4" />, path: '/integrations', subtitle: 'API MANAGEMENT', description: 'Manage API keys and integration settings' },
        { label: 'Integration Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '/integrations', subtitle: 'ANALYTICS', description: 'View integration performance and analytics' }
      ]
    },
    {
      id: 'configuration',
      title: 'Advanced Configuration',
      icon: <Cog className="w-5 h-5" />,
      description: 'Enterprise-grade system configuration and management',
      minSubscriptionTier: 'team',
      items: [
        { label: 'System Configuration Dashboard', icon: <Cog className="w-4 h-4" />, path: '/admin/system-configuration', subtitle: 'CONFIGURATION HUB', description: 'Comprehensive system configuration management with enterprise-grade controls and monitoring' },
        { label: 'Configuration Categories', icon: <Layers className="w-4 h-4" />, path: '/admin/config/categories', subtitle: 'ORGANIZED SETTINGS', description: 'Browse configuration settings by category: Security, Database, Performance, Notifications' },
        { label: 'Configuration Backups', icon: <Archive className="w-4 h-4" />, path: '/admin/config/backups', subtitle: 'BACKUP MANAGEMENT', description: 'Create, manage, and restore configuration backups with version control' },
        { label: 'Configuration Monitoring', icon: <Monitor className="w-4 h-4" />, path: '/admin/config/monitoring', subtitle: 'DRIFT DETECTION', description: 'Monitor configuration changes and detect drift from expected values' },
        { label: 'Environment Management', icon: <Server className="w-4 h-4" />, path: '/config/environments', subtitle: 'ENVIRONMENT CONFIG', description: 'Manage configurations across different environments (dev, staging, production)' },
        { label: 'Configuration Templates', icon: <FileText className="w-4 h-4" />, path: '/config/templates', subtitle: 'TEMPLATES', description: 'Pre-configured templates for common system setups and deployments' },
        { label: 'Audit Trail', icon: <Clock className="w-4 h-4" />, path: '/config/audit', subtitle: 'CHANGE TRACKING', description: 'Complete audit trail of all configuration changes with user attribution' },
        { label: 'Configuration API', icon: <Code className="w-4 h-4" />, path: '/config/api', subtitle: 'API MANAGEMENT', description: 'Programmatic configuration management via REST API' }
      ]
    },
    {
      id: 'admin',
      title: 'Administration',
      icon: <SettingsIcon className="w-5 h-5" />,
      description: 'System administration and user management',
      minSubscriptionTier: 'team',
      items: [
        { label: 'Admin Dashboard', icon: <SettingsIcon className="w-4 h-4" />, path: '/admin/dashboard', description: 'Admin overview' },
        { label: 'User Management', icon: <Users className="w-4 h-4" />, path: '/admin/users', subtitle: 'USER ADMIN' },
        { label: 'System Analytics', icon: <BarChart3 className="w-4 h-4" />, path: '/admin/system-analytics', subtitle: 'SYSTEM ANALYTICS', description: 'System performance monitoring and analytics' },
        { label: 'System Monitoring', icon: <Monitor className="w-4 h-4" />, path: '/admin/monitoring', subtitle: 'MONITORING' },
        { label: 'Advanced Monitoring', icon: <Activity className="w-4 h-4" />, path: '/monitoring/advanced', subtitle: 'ADVANCED MONITORING', description: 'Advanced system monitoring, alerting, metrics tracking, and service health monitoring' },
        { label: 'Route Health Dashboard', icon: <Network className="w-4 h-4" />, path: '/admin/route-health', subtitle: 'ROUTE MONITORING', description: 'Real-time monitoring of navigation links, API calls, and import statements with automated health checks' },
        { label: 'RBAC Management', icon: <Shield className="w-4 h-4" />, path: '/admin/rbac', subtitle: 'ROLE MANAGEMENT' }
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
        { label: 'Multi-Tenancy Management', icon: <Globe className="w-4 h-4" />, path: '/enterprise/multi-tenancy', subtitle: 'MULTI-TENANCY', description: 'Comprehensive tenant administration, user management, and enterprise oversight' },
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
      description: 'Comprehensive platform management and intelligence command center',
      platformOwnerOnly: true,
      items: [
        // Existing Core Features
        { label: 'Platform Console', icon: <Server className="w-4 h-4" />, path: '/platform-owner/console', subtitle: 'PLATFORM MANAGEMENT', description: 'Central platform management dashboard' },
        { label: 'Intelligence Insights', icon: <Brain className="w-4 h-4" />, path: '/intelligence/insights', subtitle: 'AI ANALYTICS', description: 'Real-time intelligence metrics, model accuracy, and AI performance analytics' },
        { label: 'Go-Live Checklist', icon: <CheckCircle className="w-4 h-4" />, path: '/platform-owner/go-live-checklist', subtitle: 'PRODUCTION READINESS', description: 'Comprehensive go-live validation and production readiness assessment' },
        { label: 'Data Management', icon: <Database className="w-4 h-4" />, path: '/platform-owner/data-management', subtitle: 'DATA LIFECYCLE', description: 'Comprehensive data lifecycle management' },
        { label: 'Tenant Management', icon: <Building className="w-4 h-4" />, path: '/platform-owner/tenants', subtitle: 'ALL TENANTS', description: 'Multi-tenant oversight and management' },
        { label: 'User Management', icon: <Users className="w-4 h-4" />, path: '/platform-owner/users', subtitle: 'ALL USERS', description: 'Platform-wide user management' },
        { label: 'Revenue Analytics', icon: <TrendingUp className="w-4 h-4" />, path: '/platform-owner/revenue', subtitle: 'BUSINESS INTELLIGENCE', description: 'Revenue insights and business intelligence' },
        { label: 'System Health', icon: <Activity className="w-4 h-4" />, path: '/platform-owner/health', subtitle: 'MONITORING', description: 'System health monitoring and alerts' },
        { label: 'Route Health Dashboard', icon: <Network className="w-4 h-4" />, path: '/platform-owner/route-health', subtitle: 'ROUTE MONITORING', description: 'Comprehensive route health monitoring with real-time analytics, automated alerts, and CI/CD integration' },
        { label: 'Platform Settings', icon: <SettingsIcon className="w-4 h-4" />, path: '/platform-owner/settings', subtitle: 'CONFIGURATION', description: 'Platform configuration management' },
        { label: 'API Test Zone', icon: <Code className="w-4 h-4" />, path: '/platform-owner/test-zone', subtitle: 'DEVELOPMENT', description: 'API testing and validation tools' },
        { label: 'Service Discovery Test', icon: <Network className="w-4 h-4" />, path: '/service-test', subtitle: 'DEVELOPMENT', description: 'Dynamic service discovery testing' },

        // Category 1: Strategic Business Intelligence
        { label: 'Platform Performance Dashboard', icon: <Gauge className="w-4 h-4" />, path: '/platform-owner/performance-overview', subtitle: 'PERFORMANCE INTELLIGENCE', description: 'Comprehensive platform-wide performance metrics, response times, and user satisfaction scores' },
        { label: 'Competitive Intelligence Hub', icon: <Radar className="w-4 h-4" />, path: '/platform-owner/competitive-intelligence', subtitle: 'MARKET INTELLIGENCE', description: 'Market positioning, competitive analysis, feature comparison, and market trends' },
        { label: 'Platform ROI Analytics', icon: <PieChart className="w-4 h-4" />, path: '/platform-owner/roi-analytics', subtitle: 'ROI OPTIMIZATION', description: 'Return on investment tracking, cost per user, feature adoption rates, and revenue attribution' },
        { label: 'Strategic Planning Dashboard', icon: <GitBranch className="w-4 h-4" />, path: '/platform-owner/strategic-planning', subtitle: 'STRATEGIC PLANNING', description: 'Long-term platform strategy, feature roadmap, resource allocation, and milestone tracking' },

        // Category 2: Advanced Operations Management
        { label: 'Global System Orchestration', icon: <Boxes className="w-4 h-4" />, path: '/platform-owner/system-orchestration', subtitle: 'SYSTEM ORCHESTRATION', description: 'Cross-system coordination, service mesh management, load balancing, and auto-scaling controls' },
        { label: 'Incident Command Center', icon: <AlertTriangle className="w-4 h-4" />, path: '/platform-owner/incident-management', subtitle: 'INCIDENT MANAGEMENT', description: 'Centralized incident response, real-time alerts, escalation workflows, and post-mortem analysis' },
        { label: 'Capacity Planning Center', icon: <BarChart className="w-4 h-4" />, path: '/platform-owner/capacity-planning', subtitle: 'CAPACITY PLANNING', description: 'Resource forecasting, growth projections, capacity management, and cost optimization' },
        { label: 'Feature Flag Management', icon: <Flag className="w-4 h-4" />, path: '/platform-owner/feature-flags', subtitle: 'FEATURE CONTROL', description: 'Global feature rollout, A/B testing, gradual rollouts, and emergency shutoffs' },

        // Category 3: Advanced Analytics & Intelligence
        { label: 'User Journey Intelligence', icon: <GitMerge className="w-4 h-4" />, path: '/platform-owner/user-journey-analytics', subtitle: 'USER JOURNEY ANALYTICS', description: 'Deep user behavior analysis, conversion funnels, drop-off analysis, and engagement patterns' },
        { label: 'Platform Health Scoring', icon: <LineChart className="w-4 h-4" />, path: '/platform-owner/health-scoring', subtitle: 'HEALTH SCORING', description: 'Comprehensive platform health assessment, health scores, trend analysis, and predictive alerts' },
        { label: 'AI Model Observatory', icon: <Microscope className="w-4 h-4" />, path: '/platform-owner/ai-model-observatory', subtitle: 'AI MODEL MONITORING', description: 'Centralized AI model performance monitoring, accuracy tracking, bias detection, and optimization' },
        { label: 'Data Quality Command Center', icon: <TestTube className="w-4 h-4" />, path: '/platform-owner/data-quality', subtitle: 'DATA QUALITY', description: 'Platform-wide data quality monitoring, data lineage, quality scores, and anomaly detection' },

        // Category 4: Governance & Compliance
        { label: 'Compliance Dashboard', icon: <ShieldCheck className="w-4 h-4" />, path: '/platform-owner/compliance-dashboard', subtitle: 'COMPLIANCE MONITORING', description: 'Regulatory compliance monitoring, GDPR compliance, SOC 2 status, and audit trail management' },
        { label: 'Risk Management Center', icon: <Scale className="w-4 h-4" />, path: '/platform-owner/risk-management', subtitle: 'RISK MANAGEMENT', description: 'Enterprise risk assessment, risk scoring, threat modeling, and mitigation tracking' },
        { label: 'Audit Trail Analytics', icon: <FileCheck className="w-4 h-4" />, path: '/platform-owner/audit-analytics', subtitle: 'AUDIT ANALYTICS', description: 'Advanced audit log analysis, pattern detection, compliance reporting, and anomaly identification' },

        // Category 5: Developer & Partner Ecosystem
        { label: 'Developer Portal Management', icon: <UserCog className="w-4 h-4" />, path: '/platform-owner/developer-portal', subtitle: 'DEVELOPER ECOSYSTEM', description: 'Developer ecosystem management, API usage analytics, developer onboarding, and documentation management' },
        { label: 'Partner Integration Hub', icon: <Handshake className="w-4 h-4" />, path: '/platform-owner/partner-integrations', subtitle: 'PARTNER MANAGEMENT', description: 'Third-party integration management, integration health monitoring, partner analytics, and API versioning' },
        { label: 'Marketplace Management', icon: <StoreIcon className="w-4 h-4" />, path: '/platform-owner/marketplace-management', subtitle: 'MARKETPLACE OVERSIGHT', description: 'Platform marketplace oversight, app approval workflows, revenue sharing, and quality metrics' }
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

  const handleNavigation = (path: string) => {
    console.log('🔍 Navigation Debug - Attempting to navigate to:', path);
    console.log('🔍 Navigation Debug - Current user:', currentUser);
    console.log('🔍 Navigation Debug - Is platform owner:', isPlatformOwner());
    console.log('🔍 Navigation Debug - Current router path:', router.asPath);
    
    router.push(path);
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <div className={`
      bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ease-in-out
      ${isOpen ? 'w-96' : 'w-16'}
      overflow-hidden relative
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        {isOpen ? (
          <>
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
          </>
        ) : (
          <div className="flex items-center justify-center w-full">
            <div className="digame-logo">
              <span className="text-white font-bold text-sm">D</span>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      {isOpen && (
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
      )}

      {/* Navigation Content */}
      <div className={`flex-1 overflow-y-auto ${isOpen ? 'p-4 space-y-2' : 'p-2 space-y-1'}`}>
        {isOpen ? (
          // Full expanded menu
          filteredMenuSections.map((section) => (
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
                        onClick={() => handleNavigation(item.path)}
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
          ))
        ) : (
          // Collapsed menu - show only section icons
          filteredMenuSections.map((section) => (
            <div key={section.id} className="mb-2">
              <Button
                variant="ghost"
                size="icon"
                className={`w-12 h-12 hover:text-gray-900 hover:bg-gray-100 ${
                  section.platformOwnerOnly
                    ? 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                    : 'text-gray-700'
                }`}
                onClick={() => {
                  onToggle(); // Expand menu when clicking on collapsed icon
                  setTimeout(() => toggleSection(section.id), 100); // Small delay for smooth animation
                }}
                title={section.title}
              >
                {section.icon}
              </Button>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {isOpen ? (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-4">
            <Avatar
              className="w-10 h-10 mr-3"
              fallback={<span className="text-base">👤</span>}
              src=""
              alt=""
              name=""
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
      ) : (
        <div className="p-2 border-t border-gray-200">
          <Button
            variant="ghost"
            size="icon"
            className="w-12 h-12 mx-auto"
            onClick={() => {
              onLogout();
              if (window.innerWidth < 1024) {
                onToggle();
              }
            }}
            title={isDemoMode ? 'Exit Demo' : 'Logout'}
          >
            <Avatar
              className="w-8 h-8"
              fallback={<span className="text-sm">👤</span>}
              src=""
              alt=""
              name=""
            />
          </Button>
        </div>
      )}
    </div>
  );
};

export default NextJSComprehensiveNavigation;