import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Brain, BarChart3, Users, Zap, Smartphone, Crown, Shield, Globe,
  Code, Puzzle, FileText, Target, Calendar, MessageSquare, Settings,
  TrendingUp, Eye, Star, CheckCircle, ExternalLink, Play, ArrowRight } from
'lucide-react';
import { featureHubService } from '../../services/featureHubService';

const FeatureHubShowcase = ({
  selectedRole,
  onFeatureExplored,
  onHubPageNavigation,
  exploredFeatures = []
}) => {
  const [activeCategory, setActiveCategory] = useState('recommended');
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feature categories with comprehensive platform coverage
  const categories = [
  {
    id: 'recommended',
    title: 'Recommended for You',
    icon: <Star className="w-5 h-5" />,
    description: 'Personalized features based on your role'
  },
  {
    id: 'analytics',
    title: 'Analytics & Intelligence',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Comprehensive analytics and AI-powered insights'
  },
  {
    id: 'ai-tools',
    title: 'AI Tools & Automation',
    icon: <Brain className="w-5 h-5" />,
    description: 'AI-powered tools and automation features'
  },
  {
    id: 'collaboration',
    title: 'Team Collaboration',
    icon: <Users className="w-5 h-5" />,
    description: 'Team management and collaboration tools'
  },
  {
    id: 'workflow',
    title: 'Workflow & Automation',
    icon: <Zap className="w-5 h-5" />,
    description: 'Advanced workflow automation and process optimization'
  },
  {
    id: 'mobile',
    title: 'Mobile Application',
    icon: <Smartphone className="w-5 h-5" />,
    description: 'Enhanced mobile features and cross-platform capabilities'
  },
  {
    id: 'enterprise',
    title: 'Enterprise Features',
    icon: <Crown className="w-5 h-5" />,
    description: 'Enterprise-grade features and management'
  },
  {
    id: 'integrations',
    title: 'Integrations & APIs',
    icon: <Puzzle className="w-5 h-5" />,
    description: 'Third-party integrations and API management'
  }];


  // Comprehensive feature mapping from navigation data
  const allFeatures = {
    recommended: {
      developer: [
      {
        id: 'ai-behavioral-analysis',
        title: 'Advanced Behavioral Analysis',
        description: 'AI-powered user behavior pattern recognition with 4-tab interface',
        icon: <Brain className="w-6 h-6" />,
        path: '/ai/behavioral-analysis',
        category: 'AI Enhancement',
        tier: 'Pro',
        preview: 'Real-time code pattern analysis and optimization suggestions'
      },
      {
        id: 'predictive-modeling',
        title: 'Predictive Modeling',
        description: 'Advanced forecasting capabilities and recommendation engines',
        icon: <Eye className="w-6 h-6" />,
        path: '/ai/predictive-modeling',
        category: 'AI Enhancement',
        tier: 'Pro',
        preview: 'Predict code quality issues before they happen'
      },
      {
        id: 'workflow-automation',
        title: 'Workflow Automation',
        description: 'Complete workflow engine with marketplace and community features',
        icon: <Zap className="w-6 h-6" />,
        path: '/workflow/automation',
        category: 'Automation',
        tier: 'Team',
        preview: 'Automate repetitive development tasks and deployments'
      }],

      manager: [
      {
        id: 'team-analytics',
        title: 'Advanced Team Analytics',
        description: 'Enhanced team performance insights and collaboration metrics',
        icon: <BarChart3 className="w-6 h-6" />,
        path: '/teams/advanced-analytics',
        category: 'Team Enhancement',
        tier: 'Team',
        preview: 'Real-time team performance dashboards and insights'
      },
      {
        id: 'collaboration-optimization',
        title: 'Collaboration Optimization',
        description: 'AI-powered team workflow optimization and recommendations',
        icon: <Users className="w-6 h-6" />,
        path: '/teams/collaboration-optimization',
        category: 'Team Enhancement',
        tier: 'Team',
        preview: 'Optimize team workflows with AI recommendations'
      },
      {
        id: 'performance-insights',
        title: 'Team Performance Insights',
        description: 'Comprehensive team analytics with predictive capabilities',
        icon: <TrendingUp className="w-6 h-6" />,
        path: '/teams/performance-insights',
        category: 'Team Enhancement',
        tier: 'Team',
        preview: 'Predict team performance trends and bottlenecks'
      }],

      executive: [
      {
        id: 'business-intelligence',
        title: 'Business Intelligence',
        description: 'Complete BI dashboard with 6-tab interface',
        icon: <BarChart3 className="w-6 h-6" />,
        path: '/analytics/business-intelligence',
        category: 'Business Intelligence',
        tier: 'Enterprise',
        preview: 'Executive dashboards with real-time business metrics'
      },
      {
        id: 'predictive-analytics-engine',
        title: 'Predictive Analytics Engine',
        description: 'AI-powered analytics platform with 5-tab interface',
        icon: <Brain className="w-6 h-6" />,
        path: '/analytics/predictive-engine',
        category: 'AI Predictions',
        tier: 'Enterprise',
        preview: 'Forecast business outcomes with AI precision'
      },
      {
        id: 'enterprise-dashboard',
        title: 'Enterprise Dashboard',
        description: 'Enterprise-grade features and management overview',
        icon: <Crown className="w-6 h-6" />,
        path: '/enterprise',
        category: 'Enterprise',
        tier: 'Enterprise',
        preview: 'Complete enterprise management and oversight'
      }],

      analyst: [
      {
        id: 'data-visualization',
        title: 'Data Visualization Engine',
        description: 'Advanced visualization engine with 9 chart types',
        icon: <BarChart3 className="w-6 h-6" />,
        path: '/analytics/data-visualization',
        category: 'Visualization',
        tier: 'Pro',
        preview: 'Create stunning visualizations with advanced chart types'
      },
      {
        id: 'custom-reports',
        title: 'Custom Report Builder',
        description: 'Comprehensive report builder with 4-tab interface',
        icon: <FileText className="w-6 h-6" />,
        path: '/analytics/custom-reports',
        category: 'Reporting',
        tier: 'Pro',
        preview: 'Build custom reports with drag-and-drop interface'
      },
      {
        id: 'advanced-analytics',
        title: 'Advanced Analytics',
        description: 'Advanced analytics dashboard with comprehensive metrics',
        icon: <TrendingUp className="w-6 h-6" />,
        path: '/analytics/advanced',
        category: 'Analytics',
        tier: 'Pro',
        preview: 'Deep dive analytics with advanced statistical models'
      }]

    },
    analytics: [
    {
      id: 'behavioral-analytics',
      title: 'Behavioral Analytics',
      description: 'AI-powered user behavior analysis and insights',
      icon: <Brain className="w-6 h-6" />,
      path: '/analytics/behavioral',
      category: 'AI-Powered',
      tier: 'Pro',
      preview: 'Understand user behavior patterns with AI'
    },
    {
      id: 'predictive-analytics',
      title: 'Predictive Analytics',
      description: 'Forecast trends and outcomes with machine learning',
      icon: <Eye className="w-6 h-6" />,
      path: '/analytics/predictive',
      category: 'AI-Powered',
      tier: 'Team',
      preview: 'Predict future trends with ML algorithms'
    },
    {
      id: 'web-analytics',
      title: 'Web Analytics',
      description: 'Comprehensive web usage analytics and insights',
      icon: <Globe className="w-6 h-6" />,
      path: '/analytics/web',
      category: 'Web Analytics',
      tier: 'Basic',
      preview: 'Track website performance and user engagement'
    },
    {
      id: 'mobile-analytics',
      title: 'Mobile Analytics',
      description: 'Mobile app analytics and performance monitoring',
      icon: <Smartphone className="w-6 h-6" />,
      path: '/analytics/mobile',
      category: 'Mobile Analytics',
      tier: 'Basic',
      preview: 'Monitor mobile app usage and performance'
    }],

    'ai-tools': [
    {
      id: 'ai-tools-hub',
      title: 'AI Tools Hub',
      description: 'Central AI tools dashboard with comprehensive capabilities',
      icon: <Brain className="w-6 h-6" />,
      path: '/ai-tools',
      category: 'AI Hub',
      tier: 'Pro',
      preview: 'Access all AI tools from one central location'
    },
    {
      id: 'nlp-enhancement',
      title: 'NLP Enhancement',
      description: 'Natural language processing and conversation management',
      icon: <MessageSquare className="w-6 h-6" />,
      path: '/ai/nlp-enhancement',
      category: 'AI Enhancement',
      tier: 'Pro',
      preview: 'Advanced text analysis and language understanding'
    },
    {
      id: 'ai-automation',
      title: 'AI-Powered Automation',
      description: 'Intelligent automation features with AI decision making',
      icon: <Zap className="w-6 h-6" />,
      path: '/ai/automation',
      category: 'AI Enhancement',
      tier: 'Team',
      preview: 'Automate complex workflows with AI intelligence'
    }],

    collaboration: [
    {
      id: 'team-management',
      title: 'Team Management',
      description: 'Comprehensive team management and collaboration tools',
      icon: <Users className="w-6 h-6" />,
      path: '/teams',
      category: 'Team Collaboration',
      tier: 'Team',
      preview: 'Manage teams with advanced collaboration features'
    },
    {
      id: 'social-features',
      title: 'Social Features Enhancement',
      description: 'Advanced peer matching algorithms and networking tools',
      icon: <MessageSquare className="w-6 h-6" />,
      path: '/teams/social-features',
      category: 'Team Enhancement',
      tier: 'Team',
      preview: 'Connect and collaborate with AI-powered matching'
    }],

    workflow: [
    {
      id: 'workflow-marketplace',
      title: 'Workflow Marketplace',
      description: 'Template library and community features with searchable marketplace',
      icon: <Globe className="w-6 h-6" />,
      path: '/workflow/marketplace',
      category: 'Advanced Workflow Engine',
      tier: 'Team',
      preview: 'Access thousands of pre-built workflow templates'
    },
    {
      id: 'enhanced-triggers',
      title: 'Enhanced Workflow Triggers',
      description: 'Comprehensive trigger management for automation',
      icon: <Zap className="w-6 h-6" />,
      path: '/workflow/enhanced-triggers',
      category: 'Advanced Workflow Engine',
      tier: 'Team',
      preview: 'Set up complex automation triggers and conditions'
    }],

    mobile: [
    {
      id: 'enhanced-mobile-features',
      title: 'Enhanced Mobile Features',
      description: 'Advanced mobile capabilities including AI insights and offline sync',
      icon: <Smartphone className="w-6 h-6" />,
      path: '/mobile/enhanced-features',
      category: 'Mobile Completion',
      tier: 'Pro',
      preview: 'Full-featured mobile app with offline capabilities'
    },
    {
      id: 'mobile-ai-insights',
      title: 'Mobile AI Insights',
      description: 'Mobile-optimized AI-powered analytics and recommendations',
      icon: <Brain className="w-6 h-6" />,
      path: '/mobile/ai-insights',
      category: 'AI Mobile',
      tier: 'Pro',
      preview: 'AI insights optimized for mobile experience'
    }],

    enterprise: [
    {
      id: 'multi-tenant-console',
      title: 'Multi-Tenant Console',
      description: 'Enterprise multi-tenant architecture management',
      icon: <Crown className="w-6 h-6" />,
      path: '/enterprise/multi-tenant',
      category: 'Enterprise',
      tier: 'Enterprise',
      preview: 'Manage multiple tenants from single console'
    },
    {
      id: 'security-compliance',
      title: 'Security & Compliance',
      description: 'Enterprise-grade security and compliance tools',
      icon: <Shield className="w-6 h-6" />,
      path: '/security',
      category: 'Security',
      tier: 'Enterprise',
      preview: 'Complete security and compliance management'
    }],

    integrations: [
    {
      id: 'integration-testing-suite',
      title: 'Integration Testing Suite',
      description: 'Complete testing and optimization for 40+ integration providers',
      icon: <CheckCircle className="w-6 h-6" />,
      path: '/integrations/testing-suite',
      category: 'Integration Ecosystem',
      tier: 'Team',
      preview: 'Test and optimize all your integrations'
    },
    {
      id: 'custom-integration-builder',
      title: 'Custom Integration Builder',
      description: 'Visual workflow automation and custom integration creation',
      icon: <Code className="w-6 h-6" />,
      path: '/integrations/custom-builder',
      category: 'Integration Ecosystem',
      tier: 'Team',
      preview: 'Build custom integrations with visual tools'
    }]

  };

  useEffect(() => {
    setLoading(true);

    // Get features based on active category
    let categoryFeatures = [];

    if (activeCategory === 'recommended') {
      categoryFeatures = allFeatures.recommended[selectedRole] || allFeatures.recommended.developer;
    } else {
      categoryFeatures = allFeatures[activeCategory] || [];
    }

    setFeatures(categoryFeatures);
    setLoading(false);
  }, [activeCategory, selectedRole, allFeatures, setLoading, setFeatures, categoryFeatures]);

  const handleFeatureClick = (feature) => {
    onFeatureExplored(feature);
    onHubPageNavigation(feature.path, feature.title);
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Basic':return 'bg-gray-100 text-gray-700';
      case 'Pro':return 'bg-blue-100 text-blue-700';
      case 'Team':return 'bg-green-100 text-green-700';
      case 'Enterprise':return 'bg-purple-100 text-purple-700';
      default:return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) =>
        <Button
          key={category.id}
          variant={activeCategory === category.id ? "primary" : "outline"}
          size="sm"
          onClick={() => setActiveCategory(category.id)}
          className="flex items-center space-x-2">

            {category.icon}
            <span className="hidden sm:inline">{category.title}</span>
          </Button>
        )}
      </div>

      {/* Category Description */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {categories.find((c) => c.id === activeCategory)?.title}
        </h3>
        <p className="text-gray-600">
          {categories.find((c) => c.id === activeCategory)?.description}
        </p>
      </div>

      {/* Features Grid */}
      {loading ?
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) =>
        <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
        )}
        </div> :

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
          const isExplored = exploredFeatures.includes(feature.id);

          return (
            <Card
              key={feature.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
              isExplored ?
              'border-green-200 bg-green-50' :
              'border-gray-200 hover:border-blue-300'}`
              }
              onClick={() => handleFeatureClick(feature)}>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                    isExplored ? 'bg-green-100' : 'bg-blue-100'}`
                    }>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className={getTierColor(feature.tier)}>
                            {feature.tier}
                          </Badge>
                          {feature.category &&
                        <Badge variant="outline" className="text-xs">
                              {feature.category}
                            </Badge>
                        }
                        </div>
                      </div>
                    </div>
                    {isExplored ?
                  <CheckCircle className="w-5 h-5 text-green-600" /> :

                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  }
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                  
                  {feature.preview &&
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-700 font-medium mb-1">Preview:</p>
                      <p className="text-xs text-gray-600">{feature.preview}</p>
                    </div>
                }
                  
                  <div className="flex items-center justify-between">
                    <Button
                    size="sm"
                    variant={isExplored ? "outline" : "primary"}
                    className="flex items-center space-x-1">

                      {isExplored ?
                    <>
                          <Eye className="w-3 h-3" />
                          <span>Explored</span>
                        </> :

                    <>
                          <Play className="w-3 h-3" />
                          <span>Explore</span>
                        </>
                    }
                    </Button>
                    
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>);

        })}
        </div>
      }

      {/* Exploration Progress */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <span className="font-semibold">{exploredFeatures.length} Features Explored</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="font-semibold">
              {Math.min(100, Math.round(exploredFeatures.length / 10 * 100))}% Discovery Score
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm">
          {exploredFeatures.length < 5 ?
          `Explore ${5 - exploredFeatures.length} more features to unlock personalized recommendations` :
          "Great job! You're discovering the full power of our platform"
          }
        </p>
      </div>
    </div>);

};

export default FeatureHubShowcase;