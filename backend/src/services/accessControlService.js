/**
 * Backend Access Control Service
 * Implements server-side access control for user tier validation
 * Complements the frontend AccessControlService
 */

const TIER_HIERARCHY = ['free', 'individual_pro', 'team', 'enterprise'];

const TIER_PERMISSIONS = {
  'free': {
    'core-platform': ['read'],
    'task-management': ['read', 'write'],
    'career-development': ['read'],
    'onboarding': ['read', 'write'],
    'web-analytics': ['read'],
    'mobile-analytics': ['read'],
    'basic-reports': ['read']
  },
  'individual_pro': {
    'core-platform': ['read', 'write'],
    'analytics': ['read', 'write'],
    'digital-twin': ['read', 'write'],
    'ai-tools': ['read', 'write'],
    'workflow': ['read', 'write'],
    'task-management': ['read', 'write'],
    'career-development': ['read', 'write'],
    'integrations': ['read', 'write'],
    'security': ['read', 'write'],
    'reports': ['read', 'write'],
    'onboarding': ['read', 'write'],
    'web-analytics': ['read', 'write'],
    'mobile-analytics': ['read', 'write'],
    'advanced-analytics': ['read'],
    'predictive-analytics': ['read'],
    'behavioral-analytics': ['read'],
    'pattern-recognition': ['read'],
    'ai-tools-hub': ['read', 'write'],
    'writing-assistance': ['read', 'write'],
    'ai-task-suggestions': ['read', 'write'],
    'digital-twin-basic': ['read', 'write'],
    'workflow-automation': ['read', 'write'],
    'custom-reports': ['read', 'write']
  },
  'team': {
    // Inherits individual-pro + team features
    'team-collaboration': ['read', 'write'],
    'team-management': ['read', 'write'],
    'team-dashboard': ['read', 'write'],
    'social-collaboration': ['read', 'write'],
    'mentorship': ['read', 'write'],
    'skill-analysis': ['read', 'write'],
    'real-time-collaboration': ['read', 'write'],
    'ai-predictions': ['read', 'write'],
    'twin-workspace': ['read', 'write'],
    'intelligence-api': ['read', 'write'],
    'voice-processing': ['read', 'write'],
    'document-processing': ['read', 'write'],
    'advanced-workflows': ['read', 'write'],
    'process-optimization': ['read', 'write'],
    'team-analytics': ['read', 'write'],
    'performance-monitoring': ['read', 'write'],
    'digital-twin-advanced': ['read', 'write']
  },
  'enterprise': {
    // Inherits team + enterprise features
    'enterprise-features': ['read', 'write', 'admin'],
    'enterprise-dashboard': ['read', 'write', 'admin'],
    'multi-tenant': ['read', 'write', 'admin'],
    'tenant-management': ['read', 'write', 'admin'],
    'market-intelligence': ['read', 'write'],
    'enterprise-analytics': ['read', 'write'],
    'custom-integrations': ['read', 'write', 'admin'],
    'twin-simulation': ['read', 'write'],
    'email-analysis': ['read', 'write'],
    'meeting-insights': ['read', 'write'],
    'communication-style': ['read', 'write'],
    'advanced-security': ['read', 'write', 'admin'],
    'compliance-center': ['read', 'write', 'admin'],
    'audit-logs': ['read', 'write', 'admin'],
    'sso': ['read', 'write', 'admin'],
    'enterprise-workflows': ['read', 'write', 'admin'],
    'api-management': ['read', 'write', 'admin'],
    'webhooks': ['read', 'write', 'admin'],
    'digital-twin-enterprise': ['read', 'write', 'admin']
  }
};

const FEATURE_LIMITS = {
  'free': {
    maxProjects: 3,
    maxIntegrations: 2,
    maxAPICallsPerMonth: 1000,
    maxStorageGB: 1,
    maxDigitalTwins: 0,
    maxWorkflows: 0,
    maxNotifications: 10,
    maxTasks: 50
  },
  'individual_pro': {
    maxProjects: 25,
    maxIntegrations: 10,
    maxAPICallsPerMonth: 10000,
    maxStorageGB: 10,
    maxDigitalTwins: 1,
    maxWorkflows: 5,
    maxNotifications: -1, // Unlimited
    maxTasks: -1 // Unlimited
  },
  'team': {
    maxUsers: 25,
    maxTeams: 5,
    maxProjects: 100,
    maxIntegrations: 25,
    maxAPICallsPerMonth: 50000,
    maxStorageGB: 100,
    maxDigitalTwins: 5,
    maxWorkflows: 25,
    maxNotifications: -1,
    maxTasks: -1
  },
  'enterprise': {
    maxUsers: -1, // Unlimited
    maxTeams: -1,
    maxProjects: -1,
    maxIntegrations: -1,
    maxAPICallsPerMonth: -1,
    maxStorageGB: -1,
    maxDigitalTwins: -1,
    maxWorkflows: -1,
    maxNotifications: -1,
    maxTasks: -1
  }
};

class AccessControlService {
  /**
   * Check if user can access specific feature
   * @param {Object} user - User object with role and subscriptionTier
   * @param {string} feature - Feature identifier
   * @param {string} action - Action type (read, write, admin)
   * @returns {boolean} Access permission
   */
  static canAccessFeature(user, feature, action = 'read') {
    // Platform owner has access to everything
    if (user?.isPlatformOwner || user?.is_platform_owner) {
      return true;
    }

    // Get user's subscription tier
    const userTier = user?.subscriptionTier || user?.subscription_tier || 'free';
    
    // Get tier permissions
    const tierPermissions = this.getTierPermissions(userTier);
    
    // Check if feature exists and action is allowed
    return tierPermissions[feature]?.includes(action) || false;
  }

  /**
   * Get all permissions for user based on tier
   * @param {Object} user - User object
   * @returns {Object} Permissions object with feature access
   */
  static getUserPermissions(user) {
    if (user?.isPlatformOwner || user?.is_platform_owner) {
      return this.getAllFeatures();
    }

    const userTier = user?.subscriptionTier || user?.subscription_tier || 'free';
    return this.getTierPermissions(userTier);
  }

  /**
   * Enforce usage limits based on subscription tier
   * @param {Object} user - User object
   * @param {string} feature - Feature identifier
   * @param {number} currentUsage - Current usage count
   * @returns {boolean} Whether usage is within limits
   */
  static enforceFeatureLimits(user, feature, currentUsage) {
    if (user?.isPlatformOwner || user?.is_platform_owner) {
      return true;
    }

    const userTier = user?.subscriptionTier || user?.subscription_tier || 'free';
    const limits = this.getFeatureLimits(userTier, feature);
    
    if (limits.maxUsage === -1) {
      return true; // Unlimited
    }
    
    return currentUsage < limits.maxUsage;
  }

  /**
   * Get tier permissions with inheritance
   * @param {string} subscriptionTier - User's subscription tier
   * @returns {Object} Combined permissions for the tier
   */
  static getTierPermissions(subscriptionTier) {
    const tierIndex = TIER_HIERARCHY.indexOf(subscriptionTier);
    if (tierIndex === -1) {
      return TIER_PERMISSIONS['free'] || {};
    }

    // Combine permissions from current tier and all lower tiers
    let combinedPermissions = {};
    
    for (let i = 0; i <= tierIndex; i++) {
      const tier = TIER_HIERARCHY[i];
      const tierPerms = TIER_PERMISSIONS[tier] || {};
      combinedPermissions = { ...combinedPermissions, ...tierPerms };
    }

    return combinedPermissions;
  }

  /**
   * Get feature limits for a specific tier
   * @param {string} subscriptionTier - User's subscription tier
   * @param {string} feature - Feature identifier
   * @returns {Object} Feature limits
   */
  static getFeatureLimits(subscriptionTier, feature) {
    const limits = FEATURE_LIMITS[subscriptionTier] || FEATURE_LIMITS['free'];
    
    // Map feature to limit type
    const featureLimitMap = {
      'projects': 'maxProjects',
      'integrations': 'maxIntegrations',
      'api-calls': 'maxAPICallsPerMonth',
      'storage': 'maxStorageGB',
      'digital-twins': 'maxDigitalTwins',
      'workflows': 'maxWorkflows',
      'notifications': 'maxNotifications',
      'tasks': 'maxTasks',
      'users': 'maxUsers',
      'teams': 'maxTeams'
    };

    const limitKey = featureLimitMap[feature] || 'maxUsage';
    const maxUsage = limits[limitKey] || 0;

    return {
      maxUsage,
      unlimited: maxUsage === -1,
      feature,
      tier: subscriptionTier
    };
  }

  /**
   * Get all available features (for platform owners)
   * @returns {Object} All features with full permissions
   */
  static getAllFeatures() {
    const allFeatures = {};
    
    // Combine all tier permissions
    Object.values(TIER_PERMISSIONS).forEach(tierPerms => {
      Object.keys(tierPerms).forEach(feature => {
        allFeatures[feature] = ['read', 'write', 'admin'];
      });
    });

    // Add platform owner exclusive features
    allFeatures['platform-console'] = ['read', 'write', 'admin'];
    allFeatures['platform-users'] = ['read', 'write', 'admin'];
    allFeatures['platform-revenue'] = ['read', 'write', 'admin'];
    allFeatures['platform-health'] = ['read', 'write', 'admin'];
    allFeatures['platform-settings'] = ['read', 'write', 'admin'];
    allFeatures['platform-test-zone'] = ['read', 'write', 'admin'];

    return allFeatures;
  }

  /**
   * Check if user has required subscription tier
   * @param {Object} user - User object
   * @param {string} requiredTier - Required subscription tier
   * @returns {boolean} Whether user meets tier requirement
   */
  static hasRequiredTier(user, requiredTier) {
    if (user?.isPlatformOwner || user?.is_platform_owner) {
      return true;
    }

    const userTier = user?.subscriptionTier || user?.subscription_tier || 'free';
    const userTierIndex = TIER_HIERARCHY.indexOf(userTier);
    const requiredTierIndex = TIER_HIERARCHY.indexOf(requiredTier);

    return userTierIndex >= requiredTierIndex;
  }

  /**
   * Get upgrade suggestions for user
   * @param {Object} user - User object
   * @returns {Array} Array of upgrade suggestions
   */
  static getUpgradeSuggestions(user) {
    const userTier = user?.subscriptionTier || user?.subscription_tier || 'free';
    const currentTierIndex = TIER_HIERARCHY.indexOf(userTier);
    
    if (currentTierIndex === -1 || currentTierIndex >= TIER_HIERARCHY.length - 1) {
      return []; // Already on highest tier or invalid tier
    }

    const nextTier = TIER_HIERARCHY[currentTierIndex + 1];
    const currentPermissions = this.getTierPermissions(userTier);
    const nextPermissions = this.getTierPermissions(nextTier);

    // Find new features in next tier
    const newFeatures = Object.keys(nextPermissions).filter(
      feature => !currentPermissions[feature]
    );

    const suggestions = [];

    if (newFeatures.length > 0) {
      suggestions.push({
        type: 'feature_unlock',
        title: `Unlock ${newFeatures.length} new features`,
        description: `Upgrade to ${nextTier.replace('_', ' ')} to access ${newFeatures.slice(0, 3).join(', ')}${newFeatures.length > 3 ? ' and more' : ''}`,
        targetTier: nextTier,
        newFeatures: newFeatures.slice(0, 5) // Limit to 5 features
      });
    }

    // Check for limit increases
    const currentLimits = FEATURE_LIMITS[userTier] || {};
    const nextLimits = FEATURE_LIMITS[nextTier] || {};

    Object.keys(nextLimits).forEach(limitKey => {
      const currentLimit = currentLimits[limitKey] || 0;
      const nextLimit = nextLimits[limitKey];

      if (nextLimit > currentLimit || nextLimit === -1) {
        suggestions.push({
          type: 'limit_increase',
          title: `Increase ${limitKey.replace('max', '').toLowerCase()} limit`,
          description: `Upgrade to ${nextTier.replace('_', ' ')} for ${nextLimit === -1 ? 'unlimited' : nextLimit} ${limitKey.replace('max', '').toLowerCase()}`,
          targetTier: nextTier,
          limitType: limitKey,
          currentLimit,
          newLimit: nextLimit
        });
      }
    });

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  /**
   * Validate API request based on user permissions
   * @param {Object} user - User object
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @returns {Object} Validation result
   */
  static validateAPIRequest(user, endpoint, method) {
    // Map endpoints to features
    const endpointFeatureMap = {
      '/api/analytics': 'analytics',
      '/api/ai-tools': 'ai-tools',
      '/api/digital-twin': 'digital-twin',
      '/api/workflow': 'workflow',
      '/api/tasks': 'task-management',
      '/api/teams': 'team-collaboration',
      '/api/enterprise': 'enterprise-features',
      '/api/platform-owner': 'platform-console',
      '/api/security': 'security',
      '/api/reports': 'reports',
      '/api/integrations': 'integrations'
    };

    // Determine required action based on HTTP method
    const methodActionMap = {
      'GET': 'read',
      'POST': 'write',
      'PUT': 'write',
      'PATCH': 'write',
      'DELETE': 'admin'
    };

    // Find matching feature for endpoint
    let feature = null;
    for (const [path, featureName] of Object.entries(endpointFeatureMap)) {
      if (endpoint.startsWith(path)) {
        feature = featureName;
        break;
      }
    }

    if (!feature) {
      return {
        allowed: false,
        reason: 'Unknown endpoint',
        code: 'UNKNOWN_ENDPOINT'
      };
    }

    const requiredAction = methodActionMap[method.toUpperCase()] || 'read';
    const hasAccess = this.canAccessFeature(user, feature, requiredAction);

    if (!hasAccess) {
      const userTier = user?.subscriptionTier || user?.subscription_tier || 'free';
      const suggestions = this.getUpgradeSuggestions(user);

      return {
        allowed: false,
        reason: `Insufficient permissions for ${feature}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredAction,
        feature,
        userTier,
        suggestions: suggestions.slice(0, 1) // Return one suggestion
      };
    }

    return {
      allowed: true,
      feature,
      action: requiredAction
    };
  }
}

module.exports = AccessControlService;