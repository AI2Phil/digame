import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import {
  Workflow, Settings, Activity, Zap, Plus,
  FileText, Eye, BarChart3, Users, Clock,
  CheckCircle, AlertTriangle, TrendingUp
} from 'lucide-react';
import TemplateBuilder from '../components/workflow/TemplateBuilder';
import WorkflowVisualDesigner from '../components/workflow/WorkflowVisualDesigner';
import RuleConfiguration from '../components/workflow/RuleConfiguration';
import MonitoringDashboard from '../components/workflow/MonitoringDashboard';
import { WorkflowDefinition } from '../services/api/workflowAutomation';

interface WorkflowAutomationPageProps {}

const FEATURE_CARDS = [
  {
    id: 'templates',
    title: 'Workflow Templates',
    description: 'Create and manage reusable workflow templates with visual designer',
    icon: <FileText className="h-8 w-8" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    features: ['Visual Designer', 'Template Library', 'Version Control', 'Collaboration']
  },
  {
    id: 'automation',
    title: 'Automation Rules',
    description: 'Configure triggers and conditions for automated workflow execution',
    icon: <Zap className="h-8 w-8" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    features: ['Event Triggers', 'Conditional Logic', 'Rate Limiting', 'Priority Management']
  },
  {
    id: 'monitoring',
    title: 'Real-time Monitoring',
    description: 'Monitor workflow execution with detailed analytics and insights',
    icon: <Activity className="h-8 w-8" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    features: ['Live Dashboard', 'Performance Metrics', 'Error Tracking', 'Success Analytics']
  },
  {
    id: 'designer',
    title: 'Visual Designer',
    description: 'Design workflows with intuitive drag-and-drop interface',
    icon: <Settings className="h-8 w-8" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    features: ['Drag & Drop', 'Step Configuration', 'Connection Management', 'Real-time Preview']
  }
];

const QUICK_STATS = [
  {
    label: 'Active Workflows',
    value: '24',
    change: '+12%',
    trend: 'up',
    icon: <Workflow className="h-5 w-5" />
  },
  {
    label: 'Automation Rules',
    value: '18',
    change: '+5%',
    trend: 'up',
    icon: <Zap className="h-5 w-5" />
  },
  {
    label: 'Success Rate',
    value: '94.2%',
    change: '+2.1%',
    trend: 'up',
    icon: <CheckCircle className="h-5 w-5" />
  },
  {
    label: 'Avg Duration',
    value: '3.2m',
    change: '-15%',
    trend: 'down',
    icon: <Clock className="h-5 w-5" />
  }
];

export const WorkflowAutomationPage: React.FC<WorkflowAutomationPageProps> = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [designerWorkflow, setDesignerWorkflow] = useState<WorkflowDefinition>({
    start_step: '',
    steps: [],
    variables: {},
    settings: {}
  });

  const handleFeatureSelect = (featureId: string) => {
    setSelectedFeature(featureId);
    switch (featureId) {
      case 'templates':
        setActiveTab('templates');
        break;
      case 'automation':
        setActiveTab('automation');
        break;
      case 'monitoring':
        setActiveTab('monitoring');
        break;
      case 'designer':
        setActiveTab('designer');
        break;
      default:
        setActiveTab('overview');
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <Workflow className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Workflow Automation Platform
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
          Design, automate, and monitor business workflows with our comprehensive 
          automation platform. Create templates, set up rules, and track performance 
          all in one place.
        </p>
        <div className="flex justify-center space-x-4">
          <Button 
            size="lg" 
            onClick={() => handleFeatureSelect('templates')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Workflow
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => handleFeatureSelect('monitoring')}
          >
            <BarChart3 className="mr-2 h-5 w-5" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {QUICK_STATS.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${
                  stat.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <TrendingUp className={`h-4 w-4 mr-1 ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600 rotate-180'
                }`} />
                <span className={`text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-600 ml-1">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURE_CARDS.map((feature) => (
            <Card 
              key={feature.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${feature.borderColor} ${feature.bgColor}`}
              onClick={() => handleFeatureSelect(feature.id)}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${feature.bgColor} ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <p className="text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {feature.features.map((item, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-xs"
                        icon={<CheckCircle className="h-3 w-3" />}
                        onRemove={() => {}}
                      >
                        {item}
                      </Badge>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFeatureSelect(feature.id);
                    }}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Explore Feature
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-xl text-blue-900">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">Create Templates</h3>
              <p className="text-blue-700 text-sm">
                Design reusable workflow templates using our visual designer
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">Set Up Automation</h3>
              <p className="text-blue-700 text-sm">
                Configure triggers and rules for automatic workflow execution
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">Monitor & Optimize</h3>
              <p className="text-blue-700 text-sm">
                Track performance and optimize workflows with real-time analytics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="mb-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <Workflow className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Templates</span>
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Automation</span>
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Monitoring</span>
              </TabsTrigger>
              <TabsTrigger value="designer" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Designer</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="templates">
            <div className="bg-white rounded-lg shadow-sm">
              <TemplateBuilder />
            </div>
          </TabsContent>

          <TabsContent value="automation">
            <div className="bg-white rounded-lg shadow-sm">
              <RuleConfiguration />
            </div>
          </TabsContent>

          <TabsContent value="monitoring">
            <div className="bg-white rounded-lg shadow-sm">
              <MonitoringDashboard />
            </div>
          </TabsContent>

          <TabsContent value="designer">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Visual Workflow Designer</h2>
                <p className="text-gray-600">
                  Create and edit workflows using our intuitive drag-and-drop interface
                </p>
              </div>
              <WorkflowVisualDesigner
                workflowDefinition={designerWorkflow}
                onWorkflowChange={setDesignerWorkflow}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WorkflowAutomationPage;