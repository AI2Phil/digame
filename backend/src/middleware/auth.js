const jwtService = require('../auth/jwt');
const { UserRepository } = require('../models/User');

const userRepository = new UserRepository();

/**
 * Authentication middleware
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwtService.verifyAccessToken(token);
    
    // Get user from repository
    const user = userRepository.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'User not found or inactive'
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    req.tokenPayload = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = jwtService.verifyAccessToken(token);
      const user = userRepository.findById(decoded.userId);
      
      if (user && user.isActive) {
        req.user = user;
        req.token = token;
        req.tokenPayload = decoded;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Role-based authorization middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    if (req.user.isPlatformOwner) {
      return next(); // Platform owners have access to everything
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Access denied',
        message: `Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 */
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    if (req.user.isPlatformOwner) {
      return next(); // Platform owners have all permissions
    }

    const hasPermission = req.user.hasAnyPermission(permissions);
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `Required permission: ${permissions.join(' or ')}`
      });
    }

    next();
  };
};

/**
 * Subscription tier authorization middleware
 */
const requireSubscription = (...tiers) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    if (req.user.isPlatformOwner) {
      return next(); // Platform owners have access to everything
    }

    const hasAccess = tiers.some(tier => req.user.hasSubscriptionAccess(tier));
    if (!hasAccess) {
      return res.status(403).json({
        error: 'Subscription upgrade required',
        message: `Required subscription: ${tiers.join(' or ')}`,
        currentTier: req.user.subscriptionTier,
        requiredTiers: tiers
      });
    }

    next();
  };
};

/**
 * Feature access authorization middleware
 */
const requireFeature = (feature) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please log in to access this resource'
      });
    }

    if (!req.user.canAccessFeature(feature)) {
      return res.status(403).json({
        error: 'Feature access denied',
        message: `Access to ${feature} requires a higher subscription tier`,
        currentTier: req.user.subscriptionTier,
        feature: feature
      });
    }

    next();
  };
};

/**
 * Team access authorization middleware
 */
const requireTeamAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }

  if (req.user.isPlatformOwner) {
    return next(); // Platform owners have access to all teams
  }

  const teamId = req.params.teamId || req.body.teamId || req.query.teamId;
  
  if (!teamId) {
    return res.status(400).json({
      error: 'Team ID required',
      message: 'Team ID must be provided'
    });
  }

  if (req.user.teamId !== teamId) {
    return res.status(403).json({
      error: 'Team access denied',
      message: 'You do not have access to this team'
    });
  }

  next();
};

/**
 * Rate limiting middleware (simple implementation)
 */
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [ip, timestamps] of requests.entries()) {
      const validTimestamps = timestamps.filter(time => time > windowStart);
      if (validTimestamps.length === 0) {
        requests.delete(ip);
      } else {
        requests.set(ip, validTimestamps);
      }
    }

    // Check current requests
    const userRequests = requests.get(key) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil(windowMs / 1000)} seconds.`,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request
    recentRequests.push(now);
    requests.set(key, recentRequests);

    next();
  };
};

/**
 * Demo mode detection middleware
 */
const detectDemoMode = (req, res, next) => {
  const isDemoMode = req.query.demo === 'true' || 
                    req.headers['x-demo-mode'] === 'true' ||
                    (req.user && req.user.username === 'demo');

  req.isDemoMode = isDemoMode;
  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  requirePermission,
  requireSubscription,
  requireFeature,
  requireTeamAccess,
  rateLimit,
  detectDemoMode
};