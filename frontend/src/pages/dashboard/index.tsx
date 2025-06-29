import React, { useState } from 'react';
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

const MainDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'security' | 'mfa' | 'analytics' | 'workflows' | 'platform' | 'social' | 'onboarding' | 'integrations' | 'performance' | 'mobile' | 'api' | 'reporting' | 'settings' | 'testing' | 'deployment' | 'monitoring' | 'ai' | 'pwa' | 'search' | 'collaboration' | 'advanced-security' | 'notifications' | 'platform-analytics' | 'dashboard-builder' | 'export-tools'>('overview');
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

      {/* Feature Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Security Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Multi-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Enhanced account security</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={stats.security.mfa_enabled ? 'success' : 'warning'} 
                  size="sm"
                  icon={null}
                  onRemove={() => {}}
                >
                  {stats.security.mfa_enabled ? 'Enabled' : 'Setup Required'}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('mfa')}>
                  <Settings className="h-3 w-3 mr-1" />
                  Setup
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Threat Monitoring</h4>
                <p className="text-sm text-gray-600">Real-time security monitoring</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm" icon={null} onRemove={() => {}}>
                  {stats.security.threats_detected_today} Today
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('security')}>
                  <Eye className="h-3 w-3 mr-1" />
                  Monitor
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button 
                className="w-full" 
                onClick={() => setActiveView('security')}
              >
                <Shield className="h-4 w-4 mr-2" />
                View Security Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Advanced Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Revenue Predictions</h4>
                <p className="text-sm text-gray-600">ML-powered forecasting</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  +{stats.analytics.revenue_growth}%
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('analytics')}>
                  <BarChart3 className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Churn Analysis</h4>
                <p className="text-sm text-gray-600">Customer retention insights</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm" icon={null} onRemove={() => {}}>
                  {stats.analytics.churn_rate}% Rate
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('analytics')}>
                  <Users className="h-3 w-3 mr-1" />
                  Analyze
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button 
                className="w-full" 
                onClick={() => setActiveView('analytics')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Automation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Workflow Automation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Active Workflows</h4>
                <p className="text-sm text-gray-600">Automated processes</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm" icon={null} onRemove={() => {}}>
                  {stats.workflows.active_workflows} Active
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('workflows')}>
                  <Settings className="h-3 w-3 mr-1" />
                  Manage
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Cost Savings</h4>
                <p className="text-sm text-gray-600">Automation benefits</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  {formatCurrency(stats.workflows.automation_savings)}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('workflows')}>
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Report
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button 
                className="w-full" 
                onClick={() => setActiveView('workflows')}
              >
                <Zap className="h-4 w-4 mr-2" />
                View Workflow Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Platform Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-600" />
              Platform Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Multi-Tenant Management</h4>
                <p className="text-sm text-gray-600">Tenant oversight</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm" icon={null} onRemove={() => {}}>
                  {stats.platform.total_tenants} Tenants
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('platform')}>
                  <Building2 className="h-3 w-3 mr-1" />
                  Manage
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">System Monitoring</h4>
                <p className="text-sm text-gray-600">Health & performance</p>
              </div>
              <div className="flex items-center gap-2">
                {stats.platform.critical_alerts > 0 ? (
                  <Badge variant="error" size="sm" icon={null} onRemove={() => {}}>
                    {stats.platform.critical_alerts} Alerts
                  </Badge>
                ) : (
                  <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                    Healthy
                  </Badge>
                )}
                <Button variant="outline" size="sm" onClick={() => setActiveView('platform')}>
                  <Activity className="h-3 w-3 mr-1" />
                  Monitor
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button 
                className="w-full" 
                onClick={() => setActiveView('platform')}
              >
                <Building2 className="h-4 w-4 mr-2" />
                View Platform Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Collaboration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              Social Collaboration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Peer Matching</h4>
                <p className="text-sm text-gray-600">Connect with colleagues</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  89% Match Rate
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('social')}>
                  <Users className="h-3 w-3 mr-1" />
                  Connect
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Mentorship Programs</h4>
                <p className="text-sm text-gray-600">Learning partnerships</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm" icon={null} onRemove={() => {}}>
                  12 Active
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('social')}>
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Join
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('social')}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                View Social Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Onboarding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-cyan-600" />
              Interactive Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Setup Wizard</h4>
                <p className="text-sm text-gray-600">Multi-step configuration</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  94% Complete
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('onboarding')}>
                  <Settings className="h-3 w-3 mr-1" />
                  Setup
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Goal Setting</h4>
                <p className="text-sm text-gray-600">SMART objectives</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm" icon={null} onRemove={() => {}}>
                  3 Goals Set
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('onboarding')}>
                  <Eye className="h-3 w-3 mr-1" />
                  Review
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('onboarding')}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                View Onboarding System
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Integration Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5 text-emerald-600" />
              Integration Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Active Integrations</h4>
                <p className="text-sm text-gray-600">Third-party connections</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm" icon={null} onRemove={() => {}}>
                  12 Connected
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('integrations')}>
                  <Settings className="h-3 w-3 mr-1" />
                  Manage
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Webhook Endpoints</h4>
                <p className="text-sm text-gray-600">Event notifications</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  8 Active
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('integrations')}>
                  <Webhook className="h-3 w-3 mr-1" />
                  Configure
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('integrations')}
              >
                <Webhook className="h-4 w-4 mr-2" />
                View Integration Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Performance Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-red-600" />
              Performance Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">System Health</h4>
                <p className="text-sm text-gray-600">Real-time monitoring</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  99.9% Uptime
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('performance')}>
                  <Activity className="h-3 w-3 mr-1" />
                  Monitor
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Cache Performance</h4>
                <p className="text-sm text-gray-600">Memory optimization</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm" icon={null} onRemove={() => {}}>
                  85% Hit Rate
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('performance')}>
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Optimize
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('performance')}
              >
                <Monitor className="h-4 w-4 mr-2" />
                View Performance Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-pink-600" />
              Mobile Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Mobile Dashboard</h4>
                <p className="text-sm text-gray-600">Optimized mobile interface</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  Responsive
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('mobile')}>
                  <Smartphone className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Touch Navigation</h4>
                <p className="text-sm text-gray-600">Mobile-first design</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm" icon={null} onRemove={() => {}}>
                  Touch-friendly
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('mobile')}>
                  <Eye className="h-3 w-3 mr-1" />
                  Demo
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('mobile')}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                View Mobile Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-teal-600" />
              API Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Endpoint Monitoring</h4>
                <p className="text-sm text-gray-600">API health and performance</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  50+ Endpoints
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('api')}>
                  <Activity className="h-3 w-3 mr-1" />
                  Monitor
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">API Testing</h4>
                <p className="text-sm text-gray-600">Automated testing suite</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm" icon={null} onRemove={() => {}}>
                  23 Tests
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('api')}>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Test
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('api')}
              >
                <Code className="h-4 w-4 mr-2" />
                View API Management
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Reporting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-violet-600" />
              Advanced Reporting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Custom Reports</h4>
                <p className="text-sm text-gray-600">Build and schedule reports</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm" icon={null} onRemove={() => {}}>
                  15 Reports
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('reporting')}>
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Create
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Data Visualization</h4>
                <p className="text-sm text-gray-600">Interactive charts and graphs</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  Multi-format
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('reporting')}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Visualize
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('reporting')}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Advanced Reporting
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Testing Suite */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-amber-600" />
              Testing Suite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Automated Testing</h4>
                <p className="text-sm text-gray-600">Comprehensive test execution</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  98% Pass Rate
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('testing')}>
                  <TestTube className="h-3 w-3 mr-1" />
                  Run Tests
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Test Coverage</h4>
                <p className="text-sm text-gray-600">Code coverage analysis</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm" icon={null} onRemove={() => {}}>
                  87% Coverage
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('testing')}>
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Analyze
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('testing')}
              >
                <TestTube className="h-4 w-4 mr-2" />
                View Testing Suite
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Deployment Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-slate-600" />
              Deployment Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">CI/CD Pipelines</h4>
                <p className="text-sm text-gray-600">Automated deployment</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  5 Active
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('deployment')}>
                  <GitBranch className="h-3 w-3 mr-1" />
                  Manage
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Environment Health</h4>
                <p className="text-sm text-gray-600">Production monitoring</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm" icon={null} onRemove={() => {}}>
                  3 Environments
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('deployment')}>
                  <Monitor className="h-3 w-3 mr-1" />
                  Monitor
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('deployment')}
              >
                <GitBranch className="h-4 w-4 mr-2" />
                View Deployment Pipeline
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-600" />
              Advanced Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Real-time Alerts</h4>
                <p className="text-sm text-gray-600">System monitoring and alerting</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  3 Active
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('monitoring')}>
                  <Activity className="h-3 w-3 mr-1" />
                  Monitor
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Service Health</h4>
                <p className="text-sm text-gray-600">Infrastructure monitoring</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm" icon={null} onRemove={() => {}}>
                  99.9% Uptime
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('monitoring')}>
                  <Monitor className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('monitoring')}
              >
                <Activity className="h-4 w-4 mr-2" />
                View Monitoring Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI & Machine Learning */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              AI & Machine Learning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">ML Models</h4>
                <p className="text-sm text-gray-600">Intelligent predictions and insights</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  4 Active
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('ai')}>
                  <Brain className="h-3 w-3 mr-1" />
                  Manage
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">AI Insights</h4>
                <p className="text-sm text-gray-600">Automated recommendations</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm" icon={null} onRemove={() => {}}>
                  12 New
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('ai')}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Review
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('ai')}
              >
                <Brain className="h-4 w-4 mr-2" />
                View AI/ML Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progressive Web App */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-cyan-600" />
              Progressive Web App
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Offline Capabilities</h4>
                <p className="text-sm text-gray-600">App-like experience</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  Available
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('pwa')}>
                  <Smartphone className="h-3 w-3 mr-1" />
                  Install
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Push Notifications</h4>
                <p className="text-sm text-gray-600">Real-time updates</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm" icon={null} onRemove={() => {}}>
                  67% Enabled
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('pwa')}>
                  <Bell className="h-3 w-3 mr-1" />
                  Configure
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('pwa')}
              >
                <WifiOff className="h-4 w-4 mr-2" />
                View PWA Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-emerald-600" />
              Advanced Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Intelligent Search</h4>
                <p className="text-sm text-gray-600">Search across all platform data</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  12K+ Results
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('search')}>
                  <Search className="h-3 w-3 mr-1" />
                  Search
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Smart Filters</h4>
                <p className="text-sm text-gray-600">Advanced filtering and analytics</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm" icon={null} onRemove={() => {}}>
                  8 Filters
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('search')}>
                  <Filter className="h-3 w-3 mr-1" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('search')}
              >
                <Search className="h-4 w-4 mr-2" />
                View Search Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Collaboration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-purple-600" />
              Team Collaboration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Real-time Chat</h4>
                <p className="text-sm text-gray-600">Team communication channels</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  4 Channels
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('collaboration')}>
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Chat
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Video Calls</h4>
                <p className="text-sm text-gray-600">Voice and video collaboration</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm" icon={null} onRemove={() => {}}>
                  1 Active
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('collaboration')}>
                  <Users className="h-3 w-3 mr-1" />
                  Join
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('collaboration')}
              >
                <Hash className="h-4 w-4 mr-2" />
                View Collaboration Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Security & Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Advanced Security & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Compliance Score</h4>
                <p className="text-sm text-gray-600">Multi-framework compliance monitoring</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  94% Score
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('advanced-security')}>
                  <Shield className="h-3 w-3 mr-1" />
                  Monitor
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Policy Management</h4>
                <p className="text-sm text-gray-600">Security policies and access reviews</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm" icon={null} onRemove={() => {}}>
                  8 Pending
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('advanced-security')}>
                  <Settings className="h-3 w-3 mr-1" />
                  Review
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('advanced-security')}
              >
                <Shield className="h-4 w-4 mr-2" />
                View Security Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Notification Center */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-600" />
              Notification Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Unread Notifications</h4>
                <p className="text-sm text-gray-600">Critical alerts and updates</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="error" size="sm" icon={null} onRemove={() => {}}>
                  23 Unread
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('notifications')}>
                  <Bell className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Delivery Rate</h4>
                <p className="text-sm text-gray-600">Multi-channel notification delivery</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  98.5% Rate
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('notifications')}>
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Analytics
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('notifications')}
              >
                <Bell className="h-4 w-4 mr-2" />
                View Notification Center
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Platform Analytics & Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Platform Analytics & Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Usage Analytics</h4>
                <p className="text-sm text-gray-600">Advanced platform usage and optimization insights</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  12.8K Users
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('platform-analytics')}>
                  <BarChart3 className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Optimization Insights</h4>
                <p className="text-sm text-gray-600">AI-powered recommendations for improvement</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning" size="sm" icon={null} onRemove={() => {}}>
                  3 Insights
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('platform-analytics')}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Optimize
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('platform-analytics')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Platform Analytics
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Custom Dashboard Builder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Custom Dashboard Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Custom Dashboards</h4>
                <p className="text-sm text-gray-600">Create personalized dashboard views</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm" icon={null} onRemove={() => {}}>
                  5 Dashboards
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('dashboard-builder')}>
                  <Settings className="h-3 w-3 mr-1" />
                  Build
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Widget Templates</h4>
                <p className="text-sm text-gray-600">Drag-and-drop dashboard components</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  15+ Templates
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('dashboard-builder')}>
                  <Eye className="h-3 w-3 mr-1" />
                  Browse
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('dashboard-builder')}
              >
                <Settings className="h-4 w-4 mr-2" />
                View Dashboard Builder
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Export & Integration Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-green-600" />
              Export & Integration Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Data Exports</h4>
                <p className="text-sm text-gray-600">Scheduled and on-demand data exports</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm" icon={null} onRemove={() => {}}>
                  8 Jobs
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('export-tools')}>
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">System Integrations</h4>
                <p className="text-sm text-gray-600">External system connections and data sync</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="info" size="sm" icon={null} onRemove={() => {}}>
                  4 Connected
                </Badge>
                <Button variant="outline" size="sm" onClick={() => setActiveView('export-tools')}>
                  <Webhook className="h-3 w-3 mr-1" />
                  Integrate
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <Button
                className="w-full"
                onClick={() => setActiveView('export-tools')}
              >
                <Download className="h-4 w-4 mr-2" />
                View Export & Integration Tools
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Digame Platform</h1>
            {activeView !== 'overview' && (
              <Button variant="outline" size="sm" onClick={() => setActiveView('overview')}>
                ← Back to Overview
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'security' && <ThreatMonitoringDashboard />}
        {activeView === 'mfa' && <EnhancedMFASetup />}
        {activeView === 'analytics' && <RevenueAnalyticsDashboard />}
        {activeView === 'workflows' && <WorkflowAutomationDashboard />}
        {activeView === 'platform' && <PlatformManagementDashboard />}
        {activeView === 'social' && <SocialCollaborationDashboard />}
        {activeView === 'onboarding' && <InteractiveOnboardingSystem />}
        {activeView === 'integrations' && <IntegrationManagementDashboard />}
        {activeView === 'performance' && <PerformanceMonitoringDashboard />}
        {activeView === 'mobile' && <MobileNavigationDashboard />}
        {activeView === 'api' && <APIManagementDashboard />}
        {activeView === 'reporting' && <AdvancedReportingDashboard />}
        {activeView === 'settings' && <SystemConfigurationDashboard />}
        {activeView === 'testing' && <TestingSuite />}
        {activeView === 'deployment' && <DeploymentPipeline />}
        {activeView === 'monitoring' && <AdvancedMonitoringDashboard />}
        {activeView === 'ai' && <AIMLDashboard />}
        {activeView === 'pwa' && <PWADashboard />}
        {activeView === 'search' && <AdvancedSearchDashboard />}
        {activeView === 'collaboration' && <RealTimeCollaborationDashboard />}
        {activeView === 'advanced-security' && <AdvancedSecurityDashboard />}
        {activeView === 'notifications' && <AdvancedNotificationCenter />}
        {activeView === 'platform-analytics' && <PlatformAnalyticsDashboard />}
        {activeView === 'dashboard-builder' && <CustomDashboardBuilder />}
        {activeView === 'export-tools' && <AdvancedExportTools />}
      </div>
    </div>
  );
};

export default MainDashboard;