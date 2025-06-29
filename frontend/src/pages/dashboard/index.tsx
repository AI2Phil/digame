import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  Shield, BarChart3, Zap, Building2, Users, Activity,
  TrendingUp, AlertTriangle, CheckCircle, Clock,
  Settings, Eye, ArrowRight, RefreshCw, MessageSquare,
  UserPlus, Webhook, Monitor, Smartphone, Code, FileText,
  TestTube, GitBranch, Brain, WifiOff, Bell, Search, Hash, Filter,
  Download
} from 'lucide-react';

// Import the enhanced components
import { ThreatMonitoringDashboard } from '../../components/security/ThreatMonitoringDashboard';
import { EnhancedMFASetup } from '../../components/security/EnhancedMFASetup';
import { RevenueAnalyticsDashboard } from '../../components/analytics/RevenueAnalyticsDashboard';
import { WorkflowAutomationDashboard } from '../../components/workflow/WorkflowAutomationDashboard';
import { PlatformManagementDashboard } from '../../components/admin/PlatformManagementDashboard';
import { SocialCollaborationDashboard } from '../../components/social/SocialCollaborationDashboard';
import { InteractiveOnboardingSystem } from '../../components/onboarding/InteractiveOnboardingSystem';
import { IntegrationManagementDashboard } from '../../components/integration/IntegrationManagementDashboard';
import { PerformanceMonitoringDashboard } from '../../components/performance/PerformanceMonitoringDashboard';
import { MobileNavigationDashboard } from '../../components/mobile/MobileNavigationDashboard';
import { APIManagementDashboard } from '../../components/api/APIManagementDashboard';
import { AdvancedReportingDashboard } from '../../components/reporting/AdvancedReportingDashboard';
import { SystemConfigurationDashboard } from '../../components/settings/SystemConfigurationDashboard';
import { TestingSuite } from '../../components/testing/TestingSuite';
import { DeploymentPipeline } from '../../components/deployment/DeploymentPipeline';
import { AdvancedMonitoringDashboard } from '../../components/monitoring/AdvancedMonitoringDashboard';
import { AIMLDashboard } from '../../components/ai/AIMLDashboard';
import { PWADashboard } from '../../components/pwa/PWADashboard';
import { AdvancedSearchDashboard } from '../../components/search/AdvancedSearchDashboard';
import { RealTimeCollaborationDashboard } from '../../components/collaboration/RealTimeCollaborationDashboard';
import { AdvancedSecurityDashboard } from '../../components/security/AdvancedSecurityDashboard';
import { AdvancedNotificationCenter } from '../../components/notifications/AdvancedNotificationCenter';
import { PlatformAnalyticsDashboard } from '../../components/analytics/PlatformAnalyticsDashboard';
import { CustomDashboardBuilder } from '../../components/dashboard/CustomDashboardBuilder';
import { AdvancedExportTools } from '../../components/export/AdvancedExportTools';

interface DashboardStats {
  security: {
    mfa_enabled: boolean;
    threats_detected_today: number;
    security_score: number;
    last_security_scan: string;
  };
  analytics: {
    revenue_growth: number;
    active_users: number;
    conversion_rate: number;
    churn_rate: number;
  };
  workflows: {
    active_workflows: number;
    executions_today: number;
    success_rate: number;
    automation_savings: number;
  };
  platform: {
    total_tenants: number;
    system_uptime: number;
    api_calls_today: number;
    critical_alerts: number;
  };
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState<string>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    security: {
      mfa_enabled: true,
      threats_detected_today: 3,
      security_score: 92,
      last_security_scan: new Date().toISOString(),
    },
    analytics: {
      revenue_growth: 15.3,
      active_users: 1247,
      conversion_rate: 3.2,
      churn_rate: 2.1,
    },
    workflows: {
      active_workflows: 23,
      executions_today: 156,
      success_rate: 98.5,
      automation_savings: 45000,
    },
    platform: {
      total_tenants: 12,
      system_uptime: 99.97,
      api_calls_today: 45678,
      critical_alerts: 0,
    },
  });

  // Demo mode user
  const currentUser = {
    name: 'Demo User',
    email: 'demo@digame.com',
    role: 'admin'
  };

  const handleLogout = () => {
    navigate('/');
  };

  // Listen for route changes to update active view
  React.useEffect(() => {
    const handleRouteChange = () => {
      const path = location.pathname;
      if (path.includes('/analytics')) {
        setActiveView('analytics');
      } else if (path.includes('/ai-tools')) {
        setActiveView('ai');
      } else if (path.includes('/teams')) {
        setActiveView('social');
      } else if (path.includes('/social')) {
        setActiveView('social');
      } else if (path.includes('/tasks')) {
        setActiveView('workflows');
      } else if (path.includes('/enterprise')) {
        setActiveView('platform');
      } else if (path.includes('/reports')) {
        setActiveView('reporting');
      } else if (path.includes('/admin')) {
        setActiveView('platform');
      } else {
        setActiveView('overview');
      }
    };

    handleRouteChange();
  }, [location.pathname]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Digame Platform</h1>
        <p className="text-blue-100">
          Comprehensive platform management with advanced security, analytics, and automation
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('security')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className="text-2xl font-bold text-green-600">{stats.security.security_score}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.security.threats_detected_today} threats today
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('analytics')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Growth</p>
                <p className="text-2xl font-bold text-blue-600">+{stats.analytics.revenue_growth}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.analytics.active_users} active users
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('workflows')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Automation Rate</p>
                <p className="text-2xl font-bold text-purple-600">{stats.workflows.success_rate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.workflows.executions_today} executions today
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveView('platform')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Uptime</p>
                <p className="text-2xl font-bold text-green-600">{stats.platform.system_uptime}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.platform.total_tenants} tenants
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Security & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Advanced security monitoring, threat detection, and compliance management
            </p>
            <Button 
              className="w-full" 
              onClick={() => setActiveView('security')}
            >
              View Security Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Analytics & Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              ML-powered analytics, revenue predictions, and business intelligence
            </p>
            <Button 
              className="w-full" 
              onClick={() => setActiveView('analytics')}
            >
              View Analytics Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI & Machine Learning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              AI models, intelligent predictions, and automated insights
            </p>
            <Button 
              className="w-full" 
              onClick={() => setActiveView('ai')}
            >
              View AI/ML Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              Team Collaboration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Real-time collaboration, peer matching, and team management
            </p>
            <Button 
              className="w-full" 
              onClick={() => setActiveView('social')}
            >
              View Collaboration Tools
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              Workflow Automation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Process automation, workflow design, and execution monitoring
            </p>
            <Button 
              className="w-full" 
              onClick={() => setActiveView('workflows')}
            >
              View Automation Dashboard
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-red-600" />
              Enterprise Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Multi-tenant management, system administration, and platform oversight
            </p>
            <Button 
              className="w-full" 
              onClick={() => setActiveView('platform')}
            >
              View Enterprise Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                icon: CheckCircle,
                color: 'text-green-600',
                title: 'Security scan completed',
                description: 'No vulnerabilities detected',
                time: '2 minutes ago',
              },
              {
                icon: Zap,
                color: 'text-purple-600',
                title: 'Workflow automation executed',
                description: 'Data processing workflow completed successfully',
                time: '15 minutes ago',
              },
              {
                icon: Users,
                color: 'text-blue-600',
                title: 'New tenant onboarded',
                description: 'Acme Corp has been successfully set up',
                time: '1 hour ago',
              },
              {
                icon: BarChart3,
                color: 'text-green-600',
                title: 'Revenue milestone reached',
                description: 'Monthly recurring revenue exceeded target',
                time: '3 hours ago',
              },
            ].map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                  <Icon className={`h-5 w-5 ${activity.color}`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview();
      case 'security':
        return <ThreatMonitoringDashboard />;
      case 'mfa':
        return <EnhancedMFASetup />;
      case 'analytics':
        return <RevenueAnalyticsDashboard />;
      case 'workflows':
        return <WorkflowAutomationDashboard />;
      case 'platform':
        return <PlatformManagementDashboard />;
      case 'social':
        return <SocialCollaborationDashboard />;
      case 'onboarding':
        return <InteractiveOnboardingSystem />;
      case 'integrations':
        return <IntegrationManagementDashboard />;
      case 'performance':
        return <PerformanceMonitoringDashboard />;
      case 'mobile':
        return <MobileNavigationDashboard />;
      case 'api':
        return <APIManagementDashboard />;
      case 'reporting':
        return <AdvancedReportingDashboard />;
      case 'settings':
        return <SystemConfigurationDashboard />;
      case 'testing':
        return <TestingSuite />;
      case 'deployment':
        return <DeploymentPipeline />;
      case 'monitoring':
        return <AdvancedMonitoringDashboard />;
      case 'ai':
        return <AIMLDashboard />;
      case 'pwa':
        return <PWADashboard />;
      case 'search':
        return <AdvancedSearchDashboard />;
      case 'collaboration':
        return <RealTimeCollaborationDashboard />;
      case 'advanced-security':
        return <AdvancedSecurityDashboard />;
      case 'notifications':
        return <AdvancedNotificationCenter />;
      case 'platform-analytics':
        return <PlatformAnalyticsDashboard />;
      case 'dashboard-builder':
        return <CustomDashboardBuilder />;
      case 'export-tools':
        return <AdvancedExportTools />;
      default:
        return renderOverview();
    }
  };

  return (
    <DashboardLayout
      isDemoMode={true}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      <div className="p-6">
        {/* Navigation Header */}
        {activeView !== 'overview' && (
          <div className="mb-6">
            <Button variant="outline" size="sm" onClick={() => setActiveView('overview')}>
              ← Back to Overview
            </Button>
          </div>
        )}
        
        {/* Content */}
        {renderContent()}
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;