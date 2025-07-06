/**
 * Feature Hub Service
 * Manages feature discovery, categorization, and hub page navigation
 */

import { conversionTrackingService } from './conversionTrackingService';

class FeatureHubService {
  constructor() {
    this.features = this.initializeFeatures();
    this.categories = this.initializeCategories();
  }

  initializeCategories() {
    return [
      {
        id: 'core',
        title: 'Core Platform',
        icon: '🏠',
        description: 'Essential platform features and dashboard',
        priority: 1
      },
      {
        id: 'analytics',
        title: 'Analytics & Intelligence',
        icon: '📊',
        description: 'Comprehensive analytics and AI-powered insights',
        priority: 2
      },
      {
        id: 'ai-tools',
        title: 'AI Tools & Automation',
        icon: '🤖',
        description: 'AI-powered tools and automation features',
        priority: 3
      },
      {
        id: 'collaboration',
        title: 'Team Collaboration',
        icon: '👥',
        description: 'Team management and collaboration tools',
        priority: 4
      },
      {
        id: 'workflow',
        title: 'Workflow & Automation',
        icon: '⚡',
        description: 'Advanced workflow automation and process optimization',
        priority: 5
      },
      {
        id: 'mobile',
        title: 'Mobile Application',
        icon: '📱',
        description: 'Enhanced mobile features and cross-platform capabilities',
        priority: 6
      },
      {
        id: 'enterprise',
        title: 'Enterprise Features',
        icon: '🏢',
        description: 'Enterprise-grade features and management',
        priority: 7
      },
      {
        id: 'integrations',
        title: 'Integrations & APIs',
        icon: '🔗',
        description: 'Third-party integrations and API management',
        priority: 8
      }
    ];
  }

  initializeFeatures() {
    return {
      // Core Platform Features
      core: [
        {
          id: 'dashboard',
          title: 'Comprehensive Dashboard',
          description: 'Main dashboard with real-time insights and customizable widgets',
          path: '/dashboard',
          category: 'Core Platform',
          tier: 'Free',
          tags: ['dashboard', 'overview', 'widgets'],
          preview: 'Centralized view of all your metrics and activities',
          demoAvailable: true,
          popularity: 95
        },
        {
          id: 'profile-management',
          title: 'Advanced Profile Management',
          description: 'Comprehensive user profile with AI-powered recommendations',
          path: '/profile',
          category: 'Core Platform',
          tier: 'Free',
          tags: ['profile', 'settings', 'personalization'],
          preview: 'Manage your professional profile with AI insights',
          demoAvailable: true,
          popularity: 88
        },
        {
          id: 'notifications',
          title: 'Smart Notifications',
          description: 'Intelligent notification system with priority management',
          path: '/notifications',
          category: 'Core Platform',
          tier: 'Free',
          tags: ['notifications', 'alerts', 'smart'],
          preview: 'Stay informed with AI-prioritized notifications',
          demoAvailable: true,
          popularity: 82
        }
      ],

      // Analytics & Intelligence
      analytics: [
        {
          id: 'behavioral-analytics',
          title: 'Behavioral Analytics',
          description: 'AI-powered user behavior analysis with 4-tab interface',
          path: '/analytics/behavioral',
          category: 'AI-Powered Analytics',
          tier: 'Pro',
          tags: ['ai', 'behavior', 'analytics', 'insights'],
          preview: 'Understand behavior patterns with advanced AI analysis',
          demoAvailable: true,
          popularity: 92
        },
        {
          id: 'predictive-analytics',
          title: 'Predictive Analytics',
          description: 'Forecast trends and outcomes with machine learning',
          path: '/analytics/predictive',
          category: 'AI-Powered Analytics',
          tier: 'Team',
          tags: ['prediction', 'ml', 'forecasting', 'trends'],
          preview: 'Predict future outcomes with ML algorithms',
          demoAvailable: true,
          popularity: 89
        },
        {
          id: 'business-intelligence',
          title: 'Business Intelligence',
          description: 'Complete BI dashboard with 6-tab interface',
          path: '/analytics/business-intelligence',
          category: 'Business Intelligence',
          tier: 'Enterprise',
          tags: ['bi', 'dashboard', 'executive', 'kpi'],
          preview: 'Executive-level business intelligence dashboards',
          demoAvailable: true,
          popularity: 94
        },
        {
          id: 'data-visualization',
          title: 'Data Visualization Engine',
          description: 'Advanced visualization engine with 9 chart types',
          path: '/analytics/data-visualization',
          category: 'Visualization',
          tier: 'Pro',
          tags: ['charts', 'visualization', 'graphs', 'reports'],
          preview: 'Create stunning visualizations with advanced chart types',
          demoAvailable: true,
          popularity: 87
        },
        {
          id: 'custom-reports',
          title: 'Custom Report Builder',
          description: 'Comprehensive report builder with 4-tab interface',
          path: '/analytics/custom-reports',
          category: 'Reporting',
          tier: 'Pro',
          tags: ['reports', 'builder', 'custom', 'analytics'],
          preview: 'Build custom reports with drag-and-drop interface',
          demoAvailable: true,
          popularity: 85
        }
      ],

      // AI Tools & Automation
      'ai-tools': [
        {
          id: 'ai-behavioral-analysis',
          title: 'Advanced Behavioral Analysis',
          description: 'AI-powered user behavior pattern recognition',
          path: '/ai/behavioral-analysis',
          category: 'AI Enhancement',
          tier: 'Pro',
          tags: ['ai', 'behavior', 'patterns', 'analysis'],
          preview: 'Deep behavioral insights with AI pattern recognition',
          demoAvailable: true,
          popularity: 91
        },
        {
          id: 'predictive-modeling',
          title: 'Predictive Modeling',
          description: 'Advanced forecasting capabilities and recommendation engines',
          path: '/ai/predictive-modeling',
          category: 'AI Enhancement',
          tier: 'Team',
          tags: ['prediction', 'modeling', 'ai', 'recommendations'],
          preview: 'Build predictive models with AI assistance',
          demoAvailable: true,
          popularity: 88
        },
        {
          id: 'ai-automation',
          title: 'AI-Powered Automation',
          description: 'Intelligent automation features with AI decision making',
          path: '/ai/automation',
          category: 'AI Enhancement',
          tier: 'Team',
          tags: ['automation', 'ai', 'intelligent', 'workflows'],
          preview: 'Automate complex workflows with AI intelligence',
          demoAvailable: true,
          popularity: 93
        },
        {
          id: 'nlp-enhancement',
          title: 'NLP Enhancement',
          description: 'Natural language processing and conversation management',
          path: '/ai/nlp-enhancement',
          category: 'AI Enhancement',
          tier: 'Pro',
          tags: ['nlp', 'language', 'text', 'analysis'],
          preview: 'Advanced text analysis and language understanding',
          demoAvailable: true,
          popularity: 84
        }
      ],

      // Team Collaboration
      collaboration: [
        {
          id: 'team-analytics',
          title: 'Advanced Team Analytics',
          description: 'Enhanced team performance insights with 4-tab interface',
          path: '/teams/advanced-analytics',
          category: 'Team Enhancement',
          tier: 'Team',
          tags: ['team', 'analytics', 'performance', 'insights'],
          preview: 'Real-time team performance dashboards and insights',
          demoAvailable: true,
          popularity: 90
        },
        {
          id: 'collaboration-optimization',
          title: 'Collaboration Optimization',
          description: 'AI-powered team workflow optimization',
          path: '/teams/collaboration-optimization',
          category: 'Team Enhancement',
          tier: 'Team',
          tags: ['collaboration', 'optimization', 'ai', 'workflow'],
          preview: 'Optimize team workflows with AI recommendations',
          demoAvailable: true,
          popularity: 86
        },
        {
          id: 'performance-insights',
          title: 'Team Performance Insights',
          description: 'Comprehensive team analytics with predictive capabilities',
          path: '/teams/performance-insights',
          category: 'Team Enhancement',
          tier: 'Team',
          tags: ['performance', 'insights', 'predictive', 'team'],
          preview: 'Predict team performance trends and bottlenecks',
          demoAvailable: true,
          popularity: 88
        },
        {
          id: 'social-features',
          title: 'Social Features Enhancement',
          description: 'Advanced peer matching algorithms and networking tools',
          path: '/teams/social-features',
          category: 'Team Enhancement',
          tier: 'Team',
          tags: ['social', 'networking', 'matching', 'collaboration'],
          preview: 'Connect and collaborate with AI-powered matching',
          demoAvailable: true,
          popularity: 83
        }
      ],

      // Workflow & Automation
      workflow: [
        {
          id: 'workflow-analytics',
          title: 'Advanced Workflow Analytics',
          description: 'Real-time workflow performance metrics and AI insights',
          path: '/workflow/advanced-analytics',
          category: 'Advanced Workflow Engine',
          tier: 'Team',
          tags: ['workflow', 'analytics', 'performance', 'ai'],
          preview: 'Monitor and optimize workflow performance in real-time',
          demoAvailable: true,
          popularity: 89
        },
        {
          id: 'enhanced-triggers',
          title: 'Enhanced Workflow Triggers',
          description: 'Comprehensive trigger management for automation',
          path: '/workflow/enhanced-triggers',
          category: 'Advanced Workflow Engine',
          tier: 'Team',
          tags: ['triggers', 'automation', 'workflow', 'events'],
          preview: 'Set up complex automation triggers and conditions',
          demoAvailable: true,
          popularity: 87
        },
        {
          id: 'workflow-marketplace',
          title: 'Workflow Marketplace',
          description: 'Template library and community features',
          path: '/workflow/marketplace',
          category: 'Advanced Workflow Engine',
          tier: 'Team',
          tags: ['marketplace', 'templates', 'community', 'sharing'],
          preview: 'Access thousands of pre-built workflow templates',
          demoAvailable: true,
          popularity: 92
        },
        {
          id: 'advanced-features',
          title: 'Advanced Workflow Features',
          description: 'Enterprise workflow capabilities with parallel execution',
          path: '/workflow/advanced-features',
          category: 'Advanced Workflow Engine',
          tier: 'Enterprise',
          tags: ['advanced', 'enterprise', 'parallel', 'execution'],
          preview: 'Enterprise-grade workflow features and capabilities',
          demoAvailable: true,
          popularity: 85
        }
      ],

      // Mobile Application
      mobile: [
        {
          id: 'enhanced-mobile-features',
          title: 'Enhanced Mobile Features',
          description: 'Advanced mobile capabilities with offline sync',
          path: '/mobile/enhanced-features',
          category: 'Mobile Completion',
          tier: 'Pro',
          tags: ['mobile', 'offline', 'sync', 'features'],
          preview: 'Full-featured mobile app with offline capabilities',
          demoAvailable: true,
          popularity: 88
        },
        {
          id: 'mobile-ai-insights',
          title: 'Mobile AI Insights',
          description: 'Mobile-optimized AI-powered analytics',
          path: '/mobile/ai-insights',
          category: 'AI Mobile',
          tier: 'Pro',
          tags: ['mobile', 'ai', 'insights', 'analytics'],
          preview: 'AI insights optimized for mobile experience',
          demoAvailable: true,
          popularity: 86
        },
        {
          id: 'offline-service',
          title: 'Enhanced Offline Service',
          description: 'Sophisticated offline service with SQLite database',
          path: '/mobile/offline-service',
          category: 'Mobile Completion',
          tier: 'Pro',
          tags: ['offline', 'sqlite', 'sync', 'database'],
          preview: 'Work offline with automatic sync when connected',
          demoAvailable: true,
          popularity: 84
        },
        {
          id: 'mobile-analytics',
          title: 'Comprehensive Mobile Analytics',
          description: 'Feature-complete mobile analytics with 4-tab interface',
          path: '/mobile/analytics',
          category: 'Mobile Completion',
          tier: 'Pro',
          tags: ['mobile', 'analytics', 'comprehensive', 'metrics'],
          preview: 'Complete mobile analytics and performance monitoring',
          demoAvailable: true,
          popularity: 82
        }
      ],

      // Enterprise Features
      enterprise: [
        {
          id: 'multi-tenant-console',
          title: 'Multi-Tenant Console',
          description: 'Enterprise multi-tenant architecture management',
          path: '/enterprise/multi-tenant',
          category: 'Enterprise',
          tier: 'Enterprise',
          tags: ['multi-tenant', 'enterprise', 'management', 'console'],
          preview: 'Manage multiple tenants from single console',
          demoAvailable: false,
          popularity: 78
        },
        {
          id: 'security-compliance',
          title: 'Security & Compliance',
          description: 'Enterprise-grade security and compliance tools',
          path: '/security',
          category: 'Security',
          tier: 'Enterprise',
          tags: ['security', 'compliance', 'enterprise', 'audit'],
          preview: 'Complete security and compliance management',
          demoAvailable: true,
          popularity: 91
        },
        {
          id: 'advanced-analytics-enterprise',
          title: 'Advanced Enterprise Analytics',
          description: 'Enterprise-level analytics with custom dashboards',
          path: '/enterprise/advanced-analytics',
          category: 'Enterprise Analytics',
          tier: 'Enterprise',
          tags: ['enterprise', 'analytics', 'custom', 'dashboards'],
          preview: 'Enterprise-grade analytics and reporting',
          demoAvailable: true,
          popularity: 89
        }
      ],

      // Integrations & APIs
      integrations: [
        {
          id: 'integration-testing-suite',
          title: 'Integration Testing Suite',
          description: 'Complete testing for 40+ integration providers',
          path: '/integrations/testing-suite',
          category: 'Integration Ecosystem',
          tier: 'Team',
          tags: ['testing', 'integrations', 'providers', 'validation'],
          preview: 'Test and optimize all your integrations',
          demoAvailable: true,
          popularity: 87
        },
        {
          id: 'api-management',
          title: 'API Management Hub',
          description: 'Complete API and webhook management system',
          path: '/integrations/api-management',
          category: 'Integration Ecosystem',
          tier: 'Team',
          tags: ['api', 'management', 'webhooks', 'endpoints'],
          preview: 'Comprehensive API and webhook management',
          demoAvailable: true,
          popularity: 85
        },
        {
          id: 'custom-integration-builder',
          title: 'Custom Integration Builder',
          description: 'Visual workflow automation and custom integration creation',
          path: '/integrations/custom-builder',
          category: 'Integration Ecosystem',
          tier: 'Team',
          tags: ['custom', 'builder', 'visual', 'workflow'],
          preview: 'Build custom integrations with visual tools',
          demoAvailable: true,
          popularity: 88
        },
        {
          id: 'integration-analytics',
          title: 'Integration Analytics',
          description: 'Comprehensive performance monitoring and usage analytics',
          path: '/integrations/analytics',
          category: 'Integration Ecosystem',
          tier: 'Team',
          tags: ['analytics', 'performance', 'monitoring', 'usage'],
          preview: 'Monitor integration performance and usage',
          demoAvailable: true,
          popularity: 83
        }
      ]
    };
  }

  // Get features by category
  getFeaturesByCategory(categoryId) {
    return this.features[categoryId] || [];
  }

  // Get personalized features based on user role
  getPersonalizedFeatures(userRole, limit = 6) {
    const roleFeatureMap = {
      developer: ['ai-behavioral-analysis', 'predictive-modeling', 'workflow-analytics', 'custom-integration-builder', 'enhanced-mobile-features', 'behavioral-analytics'],
      manager: ['team-analytics', 'collaboration-optimization', 'performance-insights', 'workflow-marketplace', 'business-intelligence', 'advanced-analytics-enterprise'],
      executive: ['business-intelligence', 'advanced-analytics-enterprise', 'security-compliance', 'multi-tenant-console', 'predictive-analytics', 'enterprise-dashboard'],
      analyst: ['data-visualization', 'custom-reports', 'behavioral-analytics', 'predictive-analytics', 'integration-analytics', 'advanced-workflow-analytics']
    };

    const recommendedIds = roleFeatureMap[userRole] || roleFeatureMap.developer;
    const allFeatures = this.getAllFeatures();
    
    return recommendedIds
      .map(id => allFeatures.find(f => f.id === id))
      .filter(Boolean)
      .slice(0, limit);
  }

  // Get all features as flat array
  getAllFeatures() {
    const allFeatures = [];
    Object.values(this.features).forEach(categoryFeatures => {
      allFeatures.push(...categoryFeatures);
    });
    return allFeatures.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  // Search features
  searchFeatures(query, filters = {}) {
    const allFeatures = this.getAllFeatures();
    let results = allFeatures;

    // Text search
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(feature => 
        feature.title.toLowerCase().includes(searchTerm) ||
        feature.description.toLowerCase().includes(searchTerm) ||
        feature.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply filters
    if (filters.category) {
      results = results.filter(feature => feature.category === filters.category);
    }

    if (filters.tier) {
      results = results.filter(feature => feature.tier === filters.tier);
    }

    if (filters.demoAvailable !== undefined) {
      results = results.filter(feature => feature.demoAvailable === filters.demoAvailable);
    }

    return results;
  }

  // Track feature interaction
  trackFeatureInteraction(featureId, action, context = {}) {
    const feature = this.getAllFeatures().find(f => f.id === featureId);
    
    if (feature) {
      conversionTrackingService.trackEvent('FEATURE_INTERACTION', {
        featureId,
        featureName: feature.title,
        action,
        category: feature.category,
        tier: feature.tier,
        ...context
      });
    }
  }

  // Generate feature preview
  generateFeaturePreview(featureId) {
    const feature = this.getAllFeatures().find(f => f.id === featureId);
    
    if (!feature) return null;

    return {
      id: feature.id,
      title: feature.title,
      description: feature.description,
      preview: feature.preview,
      category: feature.category,
      tier: feature.tier,
      tags: feature.tags,
      demoAvailable: feature.demoAvailable,
      popularity: feature.popularity,
      path: feature.path,
      estimatedValue: this.calculateFeatureValue(feature),
      timeToValue: this.estimateTimeToValue(feature),
      userBenefits: this.generateUserBenefits(feature)
    };
  }

  // Calculate estimated feature value
  calculateFeatureValue(feature) {
    const baseValues = {
      'Free': 500,
      'Pro': 2000,
      'Team': 5000,
      'Enterprise': 15000
    };

    const popularityMultiplier = (feature.popularity || 50) / 100;
    const baseValue = baseValues[feature.tier] || 1000;
    
    return Math.round(baseValue * popularityMultiplier);
  }

  // Estimate time to value
  estimateTimeToValue(feature) {
    const timeMap = {
      'Free': '1 day',
      'Pro': '3 days',
      'Team': '1 week',
      'Enterprise': '2 weeks'
    };

    return timeMap[feature.tier] || '1 week';
  }

  // Generate user benefits
  generateUserBenefits(feature) {
    const benefitTemplates = {
      analytics: ['Gain deeper insights', 'Make data-driven decisions', 'Identify trends and patterns'],
      ai: ['Automate repetitive tasks', 'Get intelligent recommendations', 'Improve accuracy and efficiency'],
      collaboration: ['Enhance team productivity', 'Improve communication', 'Streamline workflows'],
      workflow: ['Automate processes', 'Reduce manual work', 'Increase consistency'],
      mobile: ['Work from anywhere', 'Stay connected on-the-go', 'Access real-time updates'],
      enterprise: ['Scale efficiently', 'Ensure compliance', 'Manage complex operations'],
      integration: ['Connect your tools', 'Eliminate data silos', 'Streamline workflows']
    };

    // Determine benefit category based on feature tags and category
    let benefitCategory = 'analytics'; // default
    
    if (feature.tags.includes('ai') || feature.category.includes('AI')) {
      benefitCategory = 'ai';
    } else if (feature.tags.includes('team') || feature.category.includes('Team')) {
      benefitCategory = 'collaboration';
    } else if (feature.tags.includes('workflow') || feature.category.includes('Workflow')) {
      benefitCategory = 'workflow';
    } else if (feature.tags.includes('mobile') || feature.category.includes('Mobile')) {
      benefitCategory = 'mobile';
    } else if (feature.tags.includes('enterprise') || feature.category.includes('Enterprise')) {
      benefitCategory = 'enterprise';
    } else if (feature.tags.includes('integration') || feature.category.includes('Integration')) {
      benefitCategory = 'integration';
    }

    return benefitTemplates[benefitCategory] || benefitTemplates.analytics;
  }

  // Get feature recommendations based on current exploration
  getRecommendations(exploredFeatureIds, userRole, limit = 3) {
    const allFeatures = this.getAllFeatures();
    const exploredFeatures = allFeatures.filter(f => exploredFeatureIds.includes(f.id));
    
    // Get features in similar categories
    const exploredCategories = Array.from(new Set(exploredFeatures.map(f => f.category)));
    const similarFeatures = allFeatures.filter(f => 
      !exploredFeatureIds.includes(f.id) && 
      exploredCategories.includes(f.category)
    );

    // Get role-based recommendations
    const roleFeatures = this.getPersonalizedFeatures(userRole, 10)
      .filter(f => !exploredFeatureIds.includes(f.id));

    // Combine and deduplicate
    const recommendations = [...similarFeatures, ...roleFeatures]
      .filter((feature, index, self) => 
        index === self.findIndex(f => f.id === feature.id)
      )
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, limit);

    return recommendations;
  }

  // Get categories
  getCategories() {
    return this.categories;
  }

  // Get category by ID
  getCategoryById(categoryId) {
    return this.categories.find(c => c.id === categoryId);
  }

  // Get feature statistics
  getFeatureStats() {
    const allFeatures = this.getAllFeatures();
    const totalFeatures = allFeatures.length;
    const demoFeatures = allFeatures.filter(f => f.demoAvailable).length;
    const tierCounts = {};
    const categoryCounts = {};

    allFeatures.forEach(feature => {
      tierCounts[feature.tier] = (tierCounts[feature.tier] || 0) + 1;
      categoryCounts[feature.category] = (categoryCounts[feature.category] || 0) + 1;
    });

    return {
      totalFeatures,
      demoFeatures,
      tierCounts,
      categoryCounts,
      averagePopularity: Math.round(
        allFeatures.reduce((sum, f) => sum + (f.popularity || 0), 0) / totalFeatures
      )
    };
  }
}

// Create singleton instance
const featureHubService = new FeatureHubService();

export { featureHubService };
export default featureHubService;