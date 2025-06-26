import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { 
  Building, 
  Users, 
  Shield, 
  BarChart3, 
  Brain, 
  Zap, 
  Globe, 
  Key, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  ArrowLeft,
  Settings,
  Target,
  Workflow,
  FileText,
  Network,
  Lock,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/Alert';

export default function EnterpriseDashboardPage({ isDemoMode, onLogout }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  const [loading, setLoading] = useState(false);
  const [enterpriseData, setEnterpriseData] = useState({
    tenants: 5,
    totalUsers: 247,
    activeUsers: 189,
    aiTasksGenerated: 1543,
    automationsSaved: 89,
    securityAlerts: 3,
    apiCalls: 45672,
    storageUsed: 78.5,
    uptime: 99.97
  });

  const [aiMetrics, setAiMetrics] = useState({
    taskSuggestions: {
      total: 1543,
      accepted: 1205,
      automated: 89,
      avgPriority: 0.73
    },
    writingAssistance: {
      documentsProcessed: 2847,
      suggestionsApplied: 5692,
      timesSaved: 127.5
    },
    insights: {
      behavioralPatterns: 156,
      productivityGains: 23.4,
      processOptimizations: 67
    }
  });

  const [tenants, setTenants] = useState([
    {
      id: 1,
      name: "Acme Corporation",
      users: 45,
      subscription: "enterprise",
      status: "active",
      aiFeatures: true,
      lastActivity: "2025-05-24T10:30:00Z"
    },
    {
      id: 2,
      name: "TechStart Inc",
      users: 23,
      subscription: "professional",
      status: "active",
      aiFeatures: true,
      lastActivity: "2025-05-24T09:15:00Z"
    },
    {
      id: 3,
      name: "Global Dynamics",
      users: 89,
      subscription: "enterprise",
      status: "active",
      aiFeatures: true,
      lastActivity: "2025-05-24T11:45:00Z"
    }
  ]);

  const getSubscriptionColor = (tier) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Active Tenants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterpriseData.tenants}</div>
            <p className="text-xs text-green-600">+2 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterpriseData.totalUsers}</div>
            <p className="text-xs text-green-600">{enterpriseData.activeUsers} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Tasks Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterpriseData.aiTasksGenerated}</div>
            <p className="text-xs text-blue-600">{aiMetrics.taskSuggestions.accepted} accepted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterpriseData.automationsSaved}</div>
            <p className="text-xs text-green-600">Active workflows</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uptime</span>
              <span className="text-sm text-green-600">{enterpriseData.uptime}%</span>
            </div>
            <Progress value={enterpriseData.uptime} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Storage Usage</span>
              <span className="text-sm">{enterpriseData.storageUsed}%</span>
            </div>
            <Progress value={enterpriseData.storageUsed} className="h-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Calls Today</span>
              <span className="text-sm">{enterpriseData.apiCalls.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Security Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Security Alerts</span>
              <Badge variant={enterpriseData.securityAlerts > 5 ? "destructive" : "secondary"}>
                {enterpriseData.securityAlerts}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>SSO Configuration: Active</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Data Encryption: Enabled</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Audit Logging: Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Recent Enterprise Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Brain className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">AI Task Suggestions Generated</p>
                <p className="text-xs text-gray-600">45 new task suggestions across 3 tenants</p>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">New Tenant Onboarded</p>
                <p className="text-xs text-gray-600">Global Dynamics joined with Enterprise plan</p>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Automation Milestone</p>
                <p className="text-xs text-gray-600">100+ processes automated across platform</p>
              </div>
              <span className="text-xs text-gray-500">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

import { Switch } from '../components/ui/Switch'; // Assuming Switch component exists
import { Label } from '../components/ui/Label';   // Assuming Label component exists
import { Skeleton } from '../components/ui/Skeleton'; // For loading states

// Mock API service (replace with actual implementation)
const mockApiService = {
  getTenants: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 1, name: "Acme Corporation", users: 45, subscription: "enterprise", status: "active", aiFeatures: true, lastActivity: "2025-05-24T10:30:00Z" },
      { id: 2, name: "TechStart Inc", users: 23, subscription: "professional", status: "active", aiFeatures: true, lastActivity: "2025-05-24T09:15:00Z" },
      { id: 3, name: "Global Dynamics", users: 89, subscription: "enterprise", status: "active", aiFeatures: true, lastActivity: "2025-05-24T11:45:00Z" },
    ];
  },
  getTenantAiFeatures: async (tenantId) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Mock data based on tenant ID for variety
    if (tenantId === 1) {
      return {
        enable_communication_style_analysis: true, enable_meeting_insights: true,
        enable_task_management_ai: true, enable_writing_assistance: true,
        enable_behavioral_analytics: true, enable_workflow_automation: false,
        enable_intelligent_task_prioritization: true, enable_email_pattern_analysis: false,
        enable_language_learning_support: true, enable_skill_gap_analysis: true,
        enable_personalized_learning_recommendations: true,
      };
    } else if (tenantId === 2) {
      return {
        enable_communication_style_analysis: false, enable_meeting_insights: true,
        enable_task_management_ai: true, enable_writing_assistance: false,
        enable_behavioral_analytics: true, enable_workflow_automation: false,
        enable_intelligent_task_prioritization: true, enable_email_pattern_analysis: true,
        enable_language_learning_support: false, enable_skill_gap_analysis: false,
        enable_personalized_learning_recommendations: true,
      };
    }
    return { // Default for other tenants
        enable_communication_style_analysis: false, enable_meeting_insights: false,
        enable_task_management_ai: false, enable_writing_assistance: false,
        enable_behavioral_analytics: false, enable_workflow_automation: false,
        enable_intelligent_task_prioritization: false, enable_email_pattern_analysis: false,
        enable_language_learning_support: false, enable_skill_gap_analysis: false,
        enable_personalized_learning_recommendations: false,
    };
  },
  updateTenantAiFeature: async (tenantId, featureName, isEnabled) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    console.log(`MOCK API: Updated tenant ${tenantId}, feature ${featureName} to ${isEnabled}`);
    // Simulate success, return the updated tenant (or just a success message)
    // For this mock, we'll just return a success-like object.
    // The actual endpoint returns the updated Tenant object.
    return { success: true, tenantId, featureName, isEnabled };
  }
};

const aiFeatureConfigDefinition = [
  { key: "enable_communication_style_analysis", label: "Communication Style Analysis" },
  { key: "enable_meeting_insights", label: "Meeting Insights" },
  { key: "enable_task_management_ai", label: "Task Management AI" },
  { key: "enable_writing_assistance", label: "Writing Assistance" },
  { key: "enable_behavioral_analytics", label: "Behavioral Analytics" },
  { key: "enable_workflow_automation", label: "Workflow Automation" },
  { key: "enable_intelligent_task_prioritization", label: "Intelligent Task Prioritization" },
  { key: "enable_email_pattern_analysis", label: "Email Pattern Analysis" },
  { key: "enable_language_learning_support", label: "Language Learning Support" },
  { key: "enable_skill_gap_analysis", label: "Skill Gap Analysis" },
  { key: "enable_personalized_learning_recommendations", label: "Personalized Learning Recommendations" },
];


export default function EnterpriseDashboardPage({ isDemoMode, onLogout }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');

  // General loading for initial data
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  // Tenant AI Features state
  const [tenantAiConfigs, setTenantAiConfigs] = useState({}); // { tenantId: { featureKey: boolean, ... } }
  const [loadingTenantFeatures, setLoadingTenantFeatures] = useState({}); // { tenantId: boolean }
  const [updatingFeature, setUpdatingFeature] = useState({}); // { tenantId_featureKey: boolean }


  const [enterpriseData, setEnterpriseData] = useState({
    tenants: 0, // Will be updated from fetched tenants list length
    totalUsers: 247, activeUsers: 189, aiTasksGenerated: 1543,
    automationsSaved: 89, securityAlerts: 3, apiCalls: 45672,
    storageUsed: 78.5, uptime: 99.97
  });

  const [aiMetrics, setAiMetrics] = useState({
    taskSuggestions: { total: 1543, accepted: 1205, automated: 89, avgPriority: 0.73 },
    writingAssistance: { documentsProcessed: 2847, suggestionsApplied: 5692, timesSaved: 127.5 },
    insights: { behavioralPatterns: 156, productivityGains: 23.4, processOptimizations: 67 }
  });

  const [tenants, setTenants] = useState([]); // Will be fetched

  useEffect(() => {
    const loadInitialData = async () => {
      setPageLoading(true);
      setPageError(null);
      try {
        const fetchedTenants = await mockApiService.getTenants();
        setTenants(fetchedTenants);
        setEnterpriseData(prev => ({ ...prev, tenants: fetchedTenants.length }));

        // Fetch AI features for each tenant
        const featuresPromises = fetchedTenants.map(tenant =>
          mockApiService.getTenantAiFeatures(tenant.id).then(features => ({
            tenantId: tenant.id,
            features
          }))
        );
        const allFeaturesResults = await Promise.all(featuresPromises);
        const featuresMap = allFeaturesResults.reduce((acc, result) => {
          acc[result.tenantId] = result.features;
          return acc;
        }, {});
        setTenantAiConfigs(featuresMap);

      } catch (error) {
        console.error("Failed to load initial enterprise data:", error);
        setPageError("Failed to load enterprise data. Please try again.");
      } finally {
        setPageLoading(false);
      }
    };
    loadInitialData();
  }, []);


  const handleAiFeatureToggle = async (tenantId, featureKey, newIsEnabled) => {
    const stateKey = `${tenantId}_${featureKey}`;
    setUpdatingFeature(prev => ({ ...prev, [stateKey]: true }));
    try {
      await mockApiService.updateTenantAiFeature(tenantId, featureKey, newIsEnabled);
      setTenantAiConfigs(prev => ({
        ...prev,
        [tenantId]: {
          ...prev[tenantId],
          [featureKey]: newIsEnabled,
        }
      }));
    } catch (error) {
      console.error(`Failed to update feature ${featureKey} for tenant ${tenantId}:`, error);
      // Optionally revert UI or show error to user
      alert(`Error updating feature ${featureKey}. Please try again.`);
    } finally {
      setUpdatingFeature(prev => ({ ...prev, [stateKey]: false }));
    }
  };


  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Building className="h-4 w-4" />
              Active Tenants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterpriseData.tenants}</div>
            <p className="text-xs text-green-600">+2 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterpriseData.totalUsers}</div>
            <p className="text-xs text-green-600">{enterpriseData.activeUsers} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Tasks Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterpriseData.aiTasksGenerated}</div>
            <p className="text-xs text-blue-600">{aiMetrics.taskSuggestions.accepted} accepted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enterpriseData.automationsSaved}</div>
            <p className="text-xs text-green-600">Active workflows</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Uptime</span>
              <span className="text-sm text-green-600">{enterpriseData.uptime}%</span>
            </div>
            <Progress value={enterpriseData.uptime} className="h-2" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Storage Usage</span>
              <span className="text-sm">{enterpriseData.storageUsed}%</span>
            </div>
            <Progress value={enterpriseData.storageUsed} className="h-2" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Calls Today</span>
              <span className="text-sm">{enterpriseData.apiCalls.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Security Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Security Alerts</span>
              <Badge variant={enterpriseData.securityAlerts > 5 ? "destructive" : "secondary"}>
                {enterpriseData.securityAlerts}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>SSO Configuration: Active</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Data Encryption: Enabled</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Audit Logging: Active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-600" />
            Recent Enterprise Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Brain className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">AI Task Suggestions Generated</p>
                <p className="text-xs text-gray-600">45 new task suggestions across 3 tenants</p>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">New Tenant Onboarded</p>
                <p className="text-xs text-gray-600">Global Dynamics joined with Enterprise plan</p>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Automation Milestone</p>
                <p className="text-xs text-gray-600">100+ processes automated across platform</p>
              </div>
              <span className="text-xs text-gray-500">3 days ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAiFeaturesTab = () => {
    if (pageLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }

    if (pageError) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{pageError}</AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Tenant AI Feature Management
            </CardTitle>
            <CardDescription>
              Enable or disable specific AI features for each tenant.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {tenants.map(tenant => (
              <Card key={tenant.id} className="p-0">
                <CardHeader>
                  <CardTitle>{tenant.name}</CardTitle>
                  <CardDescription>Subscription: <Badge className={getSubscriptionColor(tenant.subscription)}>{tenant.subscription}</Badge></CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingTenantFeatures[tenant.id] ? (
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-6 w-2/3" />
                    </div>
                  ) : tenantAiConfigs[tenant.id] ? (
                    <div className="space-y-4">
                      {aiFeatureConfigDefinition.map(feature => {
                        const featureStateKey = `${tenant.id}_${feature.key}`;
                        const isCurrentlyUpdating = updatingFeature[featureStateKey];
                        const isEnabled = tenantAiConfigs[tenant.id]?.[feature.key] || false;

                        return (
                          <div key={feature.key} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                            <Label htmlFor={featureStateKey} className="text-sm font-medium">
                              {feature.label}
                            </Label>
                            <div className="flex items-center space-x-2">
                              {isCurrentlyUpdating && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />}
                              <Switch
                                id={featureStateKey}
                                checked={isEnabled}
                                onCheckedChange={(newStatus) => handleAiFeatureToggle(tenant.id, feature.key, newStatus)}
                                disabled={isCurrentlyUpdating}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">AI feature configuration not available for this tenant.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };


  const renderTenantsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tenant Management</h3>
        <Button className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      <div className="grid gap-4">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">{tenant.name}</h4>
                    <p className="text-sm text-gray-600">{tenant.users} users</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Badge className={getSubscriptionColor(tenant.subscription)}>
                    {tenant.subscription}
                  </Badge>
                  
                  {tenant.aiFeatures && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Brain className="h-3 w-3 mr-1" />
                      AI Enabled
                    </Badge>
                  )}
                  
                  <Badge className="bg-green-100 text-green-800">
                    {tenant.status}
                  </Badge>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Security Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="text-center p-4">
                <Lock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium">Data Encryption</h4>
                <p className="text-sm text-green-600">Active</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center p-4">
                <Key className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium">SSO Integration</h4>
                <p className="text-sm text-green-600">Configured</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center p-4">
                <Eye className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium">Audit Logging</h4>
                <p className="text-sm text-green-600">Enabled</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert variant="warning">
              <AlertTriangle className="h-5 w-5" /> {/* Icon can be part of Alert by variant */}
              <AlertDescription className="w-full">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">Unusual Login Pattern Detected</p>
                    <p className="text-xs text-muted-foreground">User: admin@acme.com - Multiple locations</p>
                  </div>
                  <span className="text-xs text-muted-foreground">1 hour ago</span>
                </div>
              </AlertDescription>
            </Alert>
            
            <Alert variant="success"> {/* Or "info", "default" based on actual Alert component variants */}
              <CheckCircle className="h-5 w-5" /> {/* Icon can be part of Alert by variant */}
              <AlertDescription className="w-full">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">Security Scan Completed</p>
                    <p className="text-xs text-muted-foreground">No vulnerabilities found</p>
                  </div>
                  <span className="text-xs text-muted-foreground">6 hours ago</span>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-3">
                <div className="digame-logo">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Enterprise Dashboard</span>
              </div>
              {isDemoMode && (
                <Badge variant="secondary">Demo Mode</Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Enterprise Command Center</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive oversight of your enterprise deployment, AI features, and tenant management.
          </p>
        </div>

        {/* Enterprise Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="ai-features" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Features</span>
            </TabsTrigger>
            <TabsTrigger value="tenants" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Tenants</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {renderOverviewTab()}
          </TabsContent>

          <TabsContent value="ai-features">
            {renderAiFeaturesTab()}
          </TabsContent>

          <TabsContent value="tenants">
            {renderTenantsTab()}
          </TabsContent>

          <TabsContent value="security">
            {renderSecurityTab()}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}