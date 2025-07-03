/**
 * Access Control Middleware
 * Automatic access control enforcement for API endpoints
 * Integrates with AccessControlService for tier-based validation
 */

const AccessControlService = require('../services/accessControlService');

/**
 * Middleware to enforce access control on API routes
 * @param {Object} options - Configuration options
 * @param {string} options.feature - Feature identifier for the route
 * @param {string} options.action - Required action (read, write, admin)
 * @param {boolean} options.platformOwnerOnly - Restrict to platform owners only
 * @param {string} options.minTier - Minimum subscription tier required
 * @returns {Function} Express middleware function
 */
const enforceAccessControl = (options = {}) => {
  return (req, res, next) => {
    try {
      const user = req.user; // Assumes user is attached by auth middleware

      if (!user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED',
          message: 'Please log in to access this feature'
        });
      }

      // Platform owner check
      if (options.platformOwnerOnly) {
        if (!user.isPlatformOwner && !user.is_platform_owner) {
          return res.status(403).json({
            error: 'Platform owner access required',
            code: 'PLATFORM_OWNER_ONLY',
            message: 'This feature is restricted to platform owners',
            userTier: user.subscriptionTier || user.subscription_tier || 'free'
          });
        }
      }

      // Minimum tier check
      if (options.minTier) {
        if (!AccessControlService.hasRequiredTier(user, options.minTier)) {
          const suggestions = AccessControlService.getUpgradeSuggestions(user);
          return res.status(403).json({
            error: 'Insufficient subscription tier',
            code: 'TIER_UPGRADE_REQUIRED',
            message: `This feature requires ${options.minTier.replace('_', ' ')} subscription or higher`,
            userTier: user.subscriptionTier || user.subscription_tier || 'free',
            requiredTier: options.minTier,
            suggestions: suggestions.slice(0, 1)
          });
        }
      }

      // Feature-based access control
      if (options.feature) {
        const action = options.action || 'read';
        const hasAccess = AccessControlService.canAccessFeature(user, options.feature, action);

        if (!hasAccess) {
          const suggestions = AccessControlService.getUpgradeSuggestions(user);
          return res.status(403).json({
            error: 'Insufficient permissions',
            code: 'FEATURE_ACCESS_DENIED',
            message: `Access denied for feature: ${options.feature}`,
            feature: options.feature,
            requiredAction: action,
            userTier: user.subscriptionTier || user.subscription_tier || 'free',
            suggestions: suggestions.slice(0, 1)
          });
        }
      }

      // API endpoint validation (fallback)
      if (!options.feature && !options.platformOwnerOnly && !options.minTier) {
        const validation = AccessControlService.validateAPIRequest(
          user,
          req.path,
          req.method
        );

        if (!validation.allowed) {
          return res.status(403).json({
            error: validation.reason,
            code: validation.code,
            message: `Access denied for ${req.method} ${req.path}`,
            feature: validation.feature,
            requiredAction: validation.requiredAction,
            userTier: validation.userTier,
            suggestions: validation.suggestions
          });
        }

        // Attach validation info to request for logging
        req.accessControl = validation;
      }

      // Add user permissions to request for downstream use
      req.userPermissions = AccessControlService.getUserPermissions(user);
      
      next();
    } catch (error) {
      console.error('Access control middleware error:', error);
      return res.status(500).json({
        error: 'Access control validation failed',
        code: 'ACCESS_CONTROL_ERROR',
        message: 'An error occurred while validating access permissions'
      });
    }
  };
};

/**
 * Middleware to check usage limits for features
 * @param {string} limitType - Type of limit to check (projects, integrations, etc.)
 * @param {Function} getCurrentUsage - Function to get current usage count
 * @returns {Function} Express middleware function
 */
const enforceUsageLimits = (limitType, getCurrentUsage) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // Platform owners have unlimited usage
      if (user.isPlatformOwner || user.is_platform_owner) {
        return next();
      }

      // Get current usage
      const currentUsage = await getCurrentUsage(user, req);
      
      // Check if within limits
      const withinLimits = AccessControlService.enforceFeatureLimits(
        user,
        limitType,
        currentUsage
      );

      if (!withinLimits) {
        const userTier = user.subscriptionTier || user.subscription_tier || 'free';
        const limits = AccessControlService.getFeatureLimits(userTier, limitType);
        const suggestions = AccessControlService.getUpgradeSuggestions(user);

        return res.status(429).json({
          error: 'Usage limit exceeded',
          code: 'USAGE_LIMIT_EXCEEDED',
          message: `You have reached your ${limitType} limit`,
          limitType,
          currentUsage,
          maxUsage: limits.maxUsage,
          userTier,
          suggestions: suggestions.filter(s => s.type === 'limit_increase').slice(0, 1)
        });
      }

      // Attach usage info to request
      req.usageInfo = {
        limitType,
        currentUsage,
        withinLimits: true
      };

      next();
    } catch (error) {
      console.error('Usage limit middleware error:', error);
      return res.status(500).json({
        error: 'Usage limit validation failed',
        code: 'USAGE_LIMIT_ERROR'
      });
    }
  };
};

/**
 * Middleware to log access control events
 * @param {Object} options - Logging options
 * @returns {Function} Express middleware function
 */
const logAccessControl = (options = {}) => {
  return (req, res, next) => {
    const user = req.user;
    const timestamp = new Date().toISOString();
    
    // Log access attempt
    const logData = {
      timestamp,
      userId: user?.id,
      userTier: user?.subscriptionTier || user?.subscription_tier,
      isPlatformOwner: user?.isPlatformOwner || user?.is_platform_owner,
      method: req.method,
      path: req.path,
      feature: req.accessControl?.feature,
      action: req.accessControl?.action,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };

    // Log to console (in production, this would go to a proper logging service)
    if (options.verbose) {
      console.log('Access Control Log:', JSON.stringify(logData, null, 2));
    }

    // Attach to response for potential audit trail
    res.on('finish', () => {
      logData.statusCode = res.statusCode;
      logData.success = res.statusCode < 400;
      
      // Store in audit log (implement based on your logging infrastructure)
      if (options.auditLog) {
        // TODO: Implement audit logging to database or external service
      }
    });

    next();
  };
};

/**
 * Helper function to create feature-specific middleware
 * @param {string} feature - Feature identifier
 * @param {string} action - Required action
 * @returns {Function} Express middleware function
 */
const requireFeature = (feature, action = 'read') => {
  return enforceAccessControl({ feature, action });
};

/**
 * Helper function to create tier-specific middleware
 * @param {string} minTier - Minimum required tier
 * @returns {Function} Express middleware function
 */
const requireTier = (minTier) => {
  return enforceAccessControl({ minTier });
};

/**
 * Helper function to create platform owner middleware
 * @returns {Function} Express middleware function
 */
const requirePlatformOwner = () => {
  return enforceAccessControl({ platformOwnerOnly: true });
};

/**
 * Middleware to add tier information to response headers
 * @returns {Function} Express middleware function
 */
const addTierHeaders = () => {
  return (req, res, next) => {
    const user = req.user;
    
    if (user) {
      res.set({
        'X-User-Tier': user.subscriptionTier || user.subscription_tier || 'free',
        'X-Platform-Owner': user.isPlatformOwner || user.is_platform_owner ? 'true' : 'false',
        'X-Access-Level': user.isPlatformOwner || user.is_platform_owner ? 'platform' : 'user'
      });
    }

    next();
  };
};

module.exports = {
  enforceAccessControl,
  enforceUsageLimits,
  logAccessControl,
  requireFeature,
  requireTier,
  requirePlatformOwner,
  addTierHeaders
};