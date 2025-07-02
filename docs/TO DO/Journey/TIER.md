# Subscription Tier Access Control Implementation Plan

## Current Tier Structure Analysis

### Existing Subscription Tiers

Based on the current codebase analysis, the platform supports the following subscription tiers:

```typescript
type SubscriptionTier = 'free' | 'individual_pro' | 'team' | 'enterprise';

const TIER_HIERARCHY = ['free', 'individual_pro', 'team', 'enterprise'];
```

### Current Access Control Implementation

**Location**: [`frontend/src/components/navigation/NextJSComprehensiveNavigation.tsx`](frontend/src/components/navigation/NextJSComprehensiveNavigation.tsx)

**Current Logic**:
```typescript
const hasSubscriptionTier = (minTier?: string): boolean => {
  if (!minTier) return true;
  if (!currentUser?.subscription_tier) return showAllFeatures;
  
  const tierHierarchy = ['free', 'individual_pro', 'team', 'enterprise'];
  const userTierIndex = tierHierarchy.indexOf(currentUser.subscription_tier);
  const requiredTierIndex = tierHierarchy.indexOf(minTier);
  
  return userTierIndex >= requiredTierIndex;
};
```

## Enhanced Tier-Based Access Control System

### Comprehensive Tier Definitions

```typescript
interface SubscriptionTierConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: TierFeature[];
  limits: TierLimits;
  order: number;
  isPopular?: boolean;
  badge?: string;
}

interface TierFeature {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'analytics' | 'ai' | 'collaboration' | 'enterprise' | 'platform';
  included: boolean;
  limited?: boolean;
  limit?: number;
}

interface TierLimits {
  maxUsers: number;
  maxTeams: number;
  maxProjects: number;
  maxIntegrations: number;
  maxAPICallsPerMonth: number;
  maxStorageGB: number;
  maxDigitalTwins: number;
  maxWorkflows: number;
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
  slaUptime?: number;
}
```

### Detailed Tier Configuration

```typescript
const SUBSCRIPTION_TIERS: SubscriptionTierConfig[] = [
  {
    id: 'free',
    name: 'free',
    displayName: 'Free',
    description: 'Perfect for individuals getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    order: 1,
    features: [
      // Core Platform
      { id: 'dashboard', name: 'Personal Dashboard', category: 'core', included: true },
      { id: 'profile', name: 'User Profile', category: 'core', included: true },
      { id: 'settings', name: 'Basic Settings', category: 'core', included: true },
      { id: 'notifications', name: 'Notifications', category: 'core', included: true, limited: true, limit: 10 },
      
      // Analytics (Limited)
      { id: 'web-analytics', name: 'Basic Web Analytics', category: 'analytics', included: true, limited: true },
      { id: 'mobile-analytics', name: 'Basic Mobile Analytics', category: 'analytics', included: true, limited: true },
      
      // Basic Productivity
      { id: 'task-management', name: 'Basic Task Management', category: 'core', included: true, limited: true, limit: 50 },
      { id: 'basic-reports', name: 'Basic Reports', category: 'analytics', included: true, limited: true },
      
      // Excluded Features
      { id: 'ai-tools', name: 'AI Tools', category: 'ai', included: false },
      { id: 'digital-twin', name: 'Digital Twin', category: 'ai', included: false },
      { id: 'team-features', name: 'Team Features', category: 'collaboration', included: false },
      { id: 'advanced-analytics', name: 'Advanced Analytics', category: 'analytics', included: false },
      { id: 'enterprise-features', name: 'Enterprise Features', category: 'enterprise', included: false }
    ],
    limits: {
      maxUsers: 1,
      maxTeams: 0,
      maxProjects: 3,
      maxIntegrations: 2,
      maxAPICallsPerMonth: 1000,
      maxStorageGB: 1,
      maxDigitalTwins: 0,
      maxWorkflows: 0,
      supportLevel: 'community'
    }
  },

  {
    id: 'individual_pro',
    name: 'individual_pro',
    displayName: 'Individual Pro',
    description: 'Advanced features for power users',
    monthlyPrice: 29,
    yearlyPrice: 290,
    order: 2,
    isPopular: true,
    badge: 'Most Popular',
    features: [
      // All Free Features
      ...SUBSCRIPTION_TIERS[0].features.map(f => ({ ...f, limited: false })),
      
      // AI Tools
      { id: 'ai-tools-hub', name: 'AI Tools Hub', category: 'ai', included: true },
      { id: 'writing-assistance', name: 'AI Writing Assistance', category: 'ai', included: true },
      { id: 'ai-task-suggestions', name: 'AI Task Suggestions', category: 'ai', included: true },
      { id: 'behavioral-analytics', name: 'Behavioral Analytics', category: 'analytics', included: true },
      
      // Digital Twin (Basic)
      { id: 'digital-twin-basic', name: 'Basic Digital Twin', category: 'ai', included: true, limited: true, limit: 1 },
      { id: 'pattern-recognition', name: 'Pattern Recognition', category: 'ai', included: true },
      
      // Advanced Analytics
      { id: 'advanced-analytics', name: 'Advanced Analytics', category: 'analytics', included: true },
      { id: 'predictive-analytics', name: 'Predictive Analytics', category: 'analytics', included: true },
      { id: 'custom-reports', name: 'Custom Reports', category: 'analytics', included: true },
      
      // Enhanced Productivity
      { id: 'workflow-automation', name: 'Basic Workflow Automation', category: 'core', included: true, limited: true, limit: 5 },
      { id: 'integrations', name: 'Third-party Integrations', category: 'core', included: true, limited: true, limit: 10 },
      
      // Excluded Features
      { id: 'team-features', name: 'Team Features', category: 'collaboration', included: false },
      { id: 'enterprise-features', name: 'Enterprise Features', category: 'enterprise', included: false }
    ],
    limits: {
      maxUsers: 1,
      maxTeams: 0,
      maxProjects: 25,
      maxIntegrations: 10,
      maxAPICallsPerMonth: 10000,
      maxStorageGB: 10,
      maxDigitalTwins: 1,
      maxWorkflows: 5,
      supportLevel: 'email'
    }
  },

  {
    id: 'team',
    name: 'team',
    displayName: 'Team',
    description: 'Collaboration features for teams',
    monthlyPrice: 99,
    yearlyPrice: 990,
    order: 3,
    features: [
      // All Individual Pro Features
      ...SUBSCRIPTION_TIERS[1].features.map(f => ({ ...f, limited: false })),
      
      // Team Collaboration
      { id: 'team-management', name: 'Team Management', category: 'collaboration', included: true },
      { id: 'team-dashboard', name: 'Team Dashboard', category: 'collaboration', included: true },
      { id: 'social-collaboration', name: 'Social Collaboration', category: 'collaboration', included: true },
      { id: 'mentorship', name: 'Mentorship Programs', category: 'collaboration', included: true },
      { id: 'skill-analysis', name: 'Skill Gap Analysis', category: 'collaboration', included: true },
      { id: 'real-time-collaboration', name: 'Real-time Collaboration', category: 'collaboration', included: true },
      
      // Enhanced AI Features
      { id: 'ai-predictions', name: 'AI Predictions', category: 'ai', included: true },
      { id: 'twin-workspace', name: 'Digital Twin Workspace', category: 'ai', included: true },
      { id: 'intelligence-api', name: 'Intelligence API', category: 'ai', included: true },
      { id: 'voice-processing', name: 'Voice Processing', category: 'ai', included: true },
      { id: 'document-processing', name: 'Document Processing', category: 'ai', included: true },
      
      // Advanced Workflows
      { id: 'advanced-workflows', name: 'Advanced Workflows', category: 'core', included: true },
      { id: 'process-optimization', name: 'Process Optimization', category: 'core', included: true },
      
      // Enhanced Analytics
      { id: 'team-analytics', name: 'Team Analytics', category: 'analytics', included: true },
      { id: 'performance-monitoring', name: 'Performance Monitoring', category: 'analytics', included: true },
      
      // Excluded Features
      { id: 'enterprise-features', name: 'Enterprise Features', category: 'enterprise', included: false }
    ],
    limits: {
      maxUsers: 25,
      maxTeams: 5,
      maxProjects: 100,
      maxIntegrations: 25,
      maxAPICallsPerMonth: 50000,
      maxStorageGB: 100,
      maxDigitalTwins: 5,
      maxWorkflows: 25,
      supportLevel: 'priority'
    }
  },

  {
    id: 'enterprise',
    name: 'enterprise',
    displayName: 'Enterprise',
    description: 'Full platform access with enterprise features',
    monthlyPrice: 299,
    yearlyPrice: 2990,
    order: 4,
    badge: 'Full Access',
    features: [
      // All Team Features
      ...SUBSCRIPTION_TIERS[2].features.map(f => ({ ...f, limited: false })),
      
      // Enterprise Features
      { id: 'enterprise-dashboard', name: 'Enterprise Dashboard', category: 'enterprise', included: true },
      { id: 'multi-tenant', name: 'Multi-Tenant Console', category: 'enterprise', included: true },
      { id: 'tenant-management', name: 'Tenant Management', category: 'enterprise', included: true },
      { id: 'market-intelligence', name: 'Market Intelligence', category: 'enterprise', included: true },
      { id: 'enterprise-analytics', name: 'Enterprise Analytics', category: 'enterprise', included: true },
      { id: 'custom-integrations', name: 'Custom Integrations', category: 'enterprise', included: true },
      
      // Advanced AI Features
      { id: 'twin-simulation', name: 'Digital Twin Simulation', category: 'ai', included: true },
      { id: 'email-analysis', name: 'Email Analysis', category: 'ai', included: true },
      { id: 'meeting-insights', name: 'Meeting Insights', category: 'ai', included: true },
      { id: 'communication-style', name: 'Communication Style Analysis', category: 'ai', included: true },
      
      // Security & Compliance
      { id: 'advanced-security', name: 'Advanced Security', category: 'enterprise', included: true },
      { id: 'compliance-center', name: 'Compliance Center', category: 'enterprise', included: true },
      { id: 'audit-logs', name: 'Advanced Audit Logs', category: 'enterprise', included: true },
      { id: 'sso', name: 'Single Sign-On', category: 'enterprise', included: true },
      
      // Advanced Workflows
      { id: 'enterprise-workflows', name: 'Enterprise Workflows', category: 'enterprise', included: true },
      { id: 'api-management', name: 'API Management', category: 'enterprise', included: true },
      { id: 'webhooks', name: 'Advanced Webhooks', category: 'enterprise', included: true }
    ],
    limits: {
      maxUsers: -1, // Unlimited
      maxTeams: -1, // Unlimited
      maxProjects: -1, // Unlimited
      maxIntegrations: -1, // Unlimited
      maxAPICallsPerMonth: -1, // Unlimited
      maxStorageGB: -1, // Unlimited
      maxDigitalTwins: -1, // Unlimited
      maxWorkflows: -1, // Unlimited
      supportLevel: 'dedicated',
      slaUptime: 99.9
    }
  }
];
```

## Menu Item Access Control Implementation

### Enhanced Access Control Logic

```typescript
interface MenuItemAccessControl {
  id: string;
  requiredTier?: SubscriptionTier;
  requiredFeatures?: string[];
  platformOwnerOnly?: boolean;
  betaFeature?: boolean;
  comingSoon?: boolean;
  customAccessCheck?: (user: User) => boolean;
}

// Enhanced menu items with tier-based access control
const ENHANCED_MENU_ITEMS: (MenuItem & MenuItemAccessControl)[] = [
  // Core Platform - Available to all tiers
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <BarChart3 />,
    path: '/dashboard',
    // No tier restriction - available to all
  },
  {
    id: 'profile',
    label: 'User Profile',
    icon: <User />,
    path: '/profile',
    // No tier restriction - available to all
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings />,
    path: '/settings',
    // No tier restriction - available to all
  },

  // Analytics - Tiered access
  {
    id: 'web-analytics',
    label: 'Web Analytics',
    icon: <Globe />,
    path: '/analytics/web',
    // Available to all tiers (limited for free)
  },
  {
    id: 'behavioral-analytics',
    label: 'Behavioral Analytics',
    icon: <Brain />,
    path: '/analytics/behavioral',
    requiredTier: 'individual_pro',
    requiredFeatures: ['behavioral-analytics'],
    badge: 'AI'
  },
  {
    id: 'predictive-analytics',
    label: 'Predictive Analytics',
    icon: <Eye />,
    path: '/analytics/predictive',
    requiredTier: 'individual_pro',
    requiredFeatures: ['predictive-analytics'],
    badge: 'AI'
  },
  {
    id: 'enterprise-analytics',
    label: 'Enterprise Analytics',
    icon: <BarChart3 />,
    path: '/analytics/enterprise',
    requiredTier: 'enterprise',
    requiredFeatures: ['enterprise-analytics']
  },

  // AI Tools - Individual Pro and above
  {
    id: 'ai-tools-hub',
    label: 'AI Tools Hub',
    icon: <Wrench />,
    path: '/ai-tools',
    requiredTier: 'individual_pro',
    requiredFeatures: ['ai-tools-hub']
  },
  {
    id: 'writing-assistance',
    label: 'Writing Assistance',
    icon: <FileText />,
    path: '/ai-tools/writing',
    requiredTier: 'individual_pro',
    requiredFeatures: ['writing-assistance'],
    badge: 'AI'
  },
  {
    id: 'voice-processing',
    label: 'Voice Processing',
    icon: <Mic />,
    path: '/ai-tools/voice',
    requiredTier: 'team',
    requiredFeatures: ['voice-processing'],
    badge: 'AI'
  },

  // Digital Twin - Individual Pro and above
  {
    id: 'my-digital-twin',
    label: 'My Digital Twin',
    icon: <Bot />,
    path: '/digital-twin/my-twin',
    requiredTier: 'individual_pro',
    requiredFeatures: ['digital-twin-basic']
  },
  {
    id: 'twin-simulation',
    label: 'Twin Simulation',
    icon: <Layers />,
    path: '/digital-twin/simulation',
    requiredTier: 'enterprise',
    requiredFeatures: ['twin-simulation'],
    badge: 'SIM'
  },

  // Team Features - Team tier and above
  {
    id: 'team-management',
    label: 'Team Management',
    icon: <Users />,
    path: '/teams',
    requiredTier: 'team',
    requiredFeatures: ['team-management']
  },
  {
    id: 'social-collaboration',
    label: 'Social Collaboration',
    icon: <MessageCircle />,
    path: '/teams/social',
    requiredTier: 'team',
    requiredFeatures: ['social-collaboration']
  },

  // Enterprise Features - Enterprise tier only
  {
    id: 'enterprise-dashboard',
    label: 'Enterprise Dashboard',
    icon: <Building />,
    path: '/enterprise',
    requiredTier: 'enterprise',
    requiredFeatures: ['enterprise-dashboard']
  },
  {
    id: 'multi-tenant',
    label: 'Multi-Tenant Console',
    icon: <Globe />,
    path: '/enterprise/multi-tenant',
    requiredTier: 'enterprise',
    requiredFeatures: ['multi-tenant']
  },

  // Platform Owner - Special access
  {
    id: 'platform-console',
    label: 'Platform Console',
    icon: <Server />,
    path: '/platform-owner/console',
    platformOwnerOnly: true
  },

  // Beta Features
  {
    id: 'ai-coaching',
    label: 'AI Coaching',
    icon: <Target />,
    path: '/ai-tools/coaching',
    requiredTier: 'team',
    betaFeature: true,
    badge: 'BETA'
  },

  // Coming Soon
  {
    id: 'mobile-app',
    label: 'Mobile App',
    icon: <Smartphone />,
    path: '/mobile',
    comingSoon: true,
    badge: 'SOON'
  }
];
```

### Access Control Service

```typescript
class TierAccessControlService {
  private currentUser: User | null = null;
  private tierConfig: SubscriptionTierConfig | null = null;

  constructor(user: User | null) {
    this.currentUser = user;
    this.tierConfig = this.getTierConfig(user?.subscription_tier);
  }

  private getTierConfig(tierName?: string): SubscriptionTierConfig | null {
    if (!tierName) return SUBSCRIPTION_TIERS[0]; // Default to free
    return SUBSCRIPTION_TIERS.find(tier => tier.name === tierName) || null;
  }

  // Check if user can access a specific menu item
  canAccessMenuItem(item: MenuItem & MenuItemAccessControl): boolean {
    // Platform owner check
    if (item.platformOwnerOnly) {
      return this.currentUser?.is_platform_owner === true;
    }

    // Coming soon features
    if (item.comingSoon) {
      return false; // Hide coming soon features
    }

    // Beta features (require explicit beta access)
    if (item.betaFeature) {
      return this.currentUser?.beta_access === true;
    }

    // Tier-based access
    if (item.requiredTier) {
      if (!this.hasRequiredTier(item.requiredTier)) {
        return false;
      }
    }

    // Feature-based access
    if (item.requiredFeatures) {
      return this.hasRequiredFeatures(item.requiredFeatures);
    }

    // Custom access check
    if (item.customAccessCheck) {
      return item.customAccessCheck(this.currentUser);
    }

    return true; // Default allow
  }

  private hasRequiredTier(requiredTier: SubscriptionTier): boolean {
    if (!this.currentUser?.subscription_tier) return false;
    
    const userTierIndex = TIER_HIERARCHY.indexOf(this.currentUser.subscription_tier);
    const requiredTierIndex = TIER_HIERARCHY.indexOf(requiredTier);
    
    return userTierIndex >= requiredTierIndex;
  }

  private hasRequiredFeatures(requiredFeatures: string[]): boolean {
    if (!this.tierConfig) return false;
    
    return requiredFeatures.every(featureId => {
      const feature = this.tierConfig!.features.find(f => f.id === featureId);
      return feature?.included === true;
    });
  }

  // Check if user has reached usage limits
  hasReachedLimit(limitType: keyof TierLimits): boolean {
    if (!this.tierConfig) return false;
    
    const limit = this.tierConfig.limits[limitType];
    if (limit === -1) return false; // Unlimited
    
    // Get current usage from user data
    const currentUsage = this.getCurrentUsage(limitType);
    return currentUsage >= limit;
  }

  private getCurrentUsage(limitType: keyof TierLimits): number {
    // This would fetch actual usage data from the backend
    // For now, return mock data
    const mockUsage = {
      maxUsers: this.currentUser?.team_members?.length || 0,
      maxTeams: this.currentUser?.teams?.length || 0,
      maxProjects: this.currentUser?.projects?.length || 0,
      maxIntegrations: this.currentUser?.integrations?.length || 0,
      maxAPICallsPerMonth: this.currentUser?.api_usage?.current_month || 0,
      maxStorageGB: this.currentUser?.storage_usage?.gb || 0,
      maxDigitalTwins: this.currentUser?.digital_twins?.length || 0,
      maxWorkflows: this.currentUser?.workflows?.length || 0
    };
    
    return mockUsage[limitType] || 0;
  }

  // Get upgrade suggestions
  getUpgradeSuggestions(): UpgradeSuggestion[] {
    if (!this.currentUser?.subscription_tier) return [];
    
    const currentTierIndex = TIER_HIERARCHY.indexOf(this.currentUser.subscription_tier);
    const nextTier = SUBSCRIPTION_TIERS[currentTierIndex + 1];
    
    if (!nextTier) return []; // Already on highest tier
    
    const suggestions: UpgradeSuggestion[] = [];
    
    // Find features that would be unlocked
    const newFeatures = nextTier.features.filter(feature => 
      feature.included && !this.hasRequiredFeatures([feature.id])
    );
    
    if (newFeatures.length > 0) {
      suggestions.push({
        type: 'feature_unlock',
        title: `Unlock ${newFeatures.length} new features`,
        description: `Upgrade to ${nextTier.displayName} to access ${newFeatures.map(f => f.name).join(', ')}`,
        targetTier: nextTier.name,
        features: newFeatures
      });
    }
    
    return suggestions;
  }
}

interface UpgradeSuggestion {
  type: 'feature_unlock' | 'limit_increase' | 'support_upgrade';
  title: string;
  description: string;
  targetTier: string;
  features?: TierFeature[];
}
```

### UI Components for Tier-Based Access

```typescript
// Tier badge component
const TierBadge: React.FC<{ tier: SubscriptionTier }> = ({ tier }) => {
  const config = SUBSCRIPTION_TIERS.find(t => t.name === tier);
  
  return (
    <Badge 
      variant={tier === 'enterprise' ? 'premium' : 'default'}
      className={`tier-badge tier-${tier}`}
    >
      {config?.displayName}
    </Badge>
  );
};

// Upgrade prompt component
const UpgradePrompt: React.FC<{ feature: string; requiredTier: SubscriptionTier }> = ({ 
  feature, 
  requiredTier 
}) => {
  const targetTier = SUBSCRIPTION_TIERS.find(t => t.name === requiredTier);
  
  return (
    <div className="upgrade-prompt">
      <div className="upgrade-content">
        <Lock className="w-6 h-6 text-gray-400" />
        <h3>Upgrade Required</h3>
        <p>
          {feature} is available with {targetTier?.displayName} plan
        </p>
        <Button variant="primary" onClick={() => handleUpgrade(requiredTier)}>
          Upgrade to {targetTier?.displayName}
        </Button>
      </div>
    </div>
  );
};

// Feature limit indicator
const FeatureLimitIndicator: React.FC<{ 
  limitType: keyof TierLimits; 
  current: number; 
  max: number 
}> = ({ limitType, current, max }) => {
  const percentage = max === -1 ? 0 : (current / max) * 100;
  const isNearLimit = percentage > 80;
  
  return (
    <div className="feature-limit-indicator">
      <div className="limit-header">
        <span>{limitType.replace('max', '').replace(/([A-Z])/g, ' $1')}</span>
        <span className={isNearLimit ? 'text-warning' : 'text-muted'}>
          {current} / {max === -1 ? '∞' : max}
        </span>
      </div>
      {max !== -1 && (
        <div className="limit-progress">
          <div 
            className={`progress-bar ${isNearLimit ? 'warning' : 'normal'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
      {isNearLimit && (
        <div className="limit-warning">
          <AlertTriangle className="w-4 h-4" />
          Approaching limit
        </div>
      )}
    </div>
  );
};
```

## Implementation Timeline

### Phase 1: Core Access Control (Week 1)
- ✅ Implement TierAccessControlService
- ✅ Update menu item definitions with tier requirements
- ✅ Add tier-based filtering to navigation components

### Phase 2: UI Components (Week 2)
- ✅ Create tier badges and upgrade prompts
- ✅ Implement feature limit indicators
- ✅ Add upgrade suggestion system

### Phase 3: Backend Integration (Week 3)
- ✅ Implement usage tracking for limits
- ✅ Add tier validation to API endpoints
- ✅ Create upgrade/downgrade workflows

### Phase 4: Testing & Optimization (Week 4)
- ✅ Test all tier combinations
- ✅ Optimize performance of access checks
- ✅ Add analytics for feature usage by tier

## Success Metrics

### Business Metrics
- **Upgrade Conversion Rate**: % of users who upgrade after seeing tier restrictions
- **Feature Adoption by Tier**: Usage patterns across different subscription levels
- **Revenue per User**: Average revenue by subscription tier
- **Churn Rate by Tier**: Retention rates for each subscription level

### User Experience Metrics
- **Feature Discovery**: How users discover premium features
- **Upgrade Friction**: Time from feature restriction to upgrade decision
- **Support Tickets**: Reduction in tier-related support requests
- **User Satisfaction**: Satisfaction scores by subscription tier

## Conclusion

This tier-based access control system provides:

1. **Clear Value Proposition**: Users understand what they get with each tier
2. **Smooth Upgrade Path**: Natural progression from free to enterprise
3. **Flexible Access Control**: Feature-based and usage-based restrictions
4. **Business Growth**: Drives subscription upgrades through feature gating
5. **Scalable Architecture**: Easy to add new tiers and features

The implementation ensures that users have a clear understanding of their current capabilities while providing compelling reasons to upgrade to higher tiers.