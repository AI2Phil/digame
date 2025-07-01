/**
 * User Model with RBAC and Team Management
 */

class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.email = data.email || '';
    this.username = data.username || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.role = data.role || 'user';
    this.subscriptionTier = data.subscriptionTier || 'free';
    this.teamId = data.teamId || null;
    this.permissions = data.permissions || [];
    this.isPlatformOwner = data.isPlatformOwner || false;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.isVerified = data.isVerified || false;
    this.onboardingCompleted = data.onboardingCompleted || false;
    this.onboardingData = data.onboardingData || {
      interests: [],
      goals: [],
      experience: '',
      teamPreference: '',
      completedSteps: []
    };
    this.lastLogin = data.lastLogin || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.profile = data.profile || {};
    this.preferences = data.preferences || {};
    this.metadata = data.metadata || {};
  }

  /**
   * Get user's full name
   */
  get fullName() {
    return `${this.firstName} ${this.lastName}`.trim() || this.username;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission) {
    if (this.isPlatformOwner) return true;
    return this.permissions.includes(permission) || this.permissions.includes('*');
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions) {
    if (this.isPlatformOwner) return true;
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(permissions) {
    if (this.isPlatformOwner) return true;
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * Check subscription tier access
   */
  hasSubscriptionAccess(requiredTier) {
    if (this.isPlatformOwner) return true;
    
    const tierHierarchy = {
      'free': 0,
      'individual_pro': 1,
      'team': 2,
      'enterprise': 3,
      'platform_owner': 4
    };

    const userTierLevel = tierHierarchy[this.subscriptionTier] || 0;
    const requiredTierLevel = tierHierarchy[requiredTier] || 0;

    return userTierLevel >= requiredTierLevel;
  }

  /**
   * Check if user can access feature
   */
  canAccessFeature(feature) {
    const featurePermissions = {
      // Analytics Features
      'analytics.basic': ['free'],
      'analytics.advanced': ['individual_pro', 'team', 'enterprise'],
      'analytics.mobile': ['individual_pro', 'team', 'enterprise'],
      'analytics.predictive': ['team', 'enterprise'],
      'analytics.export': ['individual_pro', 'team', 'enterprise'],

      // AI Tools
      'ai.basic': ['individual_pro', 'team', 'enterprise'],
      'ai.advanced': ['team', 'enterprise'],
      'ai.coaching': ['individual_pro', 'team', 'enterprise'],
      'ai.writing': ['individual_pro', 'team', 'enterprise'],

      // Social Features
      'social.basic': ['free'],
      'social.networking': ['individual_pro', 'team', 'enterprise'],
      'social.collaboration': ['team', 'enterprise'],
      'social.mentorship': ['individual_pro', 'team', 'enterprise'],

      // Team Features
      'team.create': ['team', 'enterprise'],
      'team.manage': ['team', 'enterprise'],
      'team.view': ['team', 'enterprise'],
      'team.invite': ['team', 'enterprise'],
      'team.analytics': ['team', 'enterprise'],
      'team.workflows': ['enterprise'],

      // Project Features
      'projects.view': ['individual_pro', 'team', 'enterprise'],
      'projects.create': ['individual_pro', 'team', 'enterprise'],
      'projects.manage': ['individual_pro', 'team', 'enterprise'],

      // Integration Features
      'integrations.view': ['team', 'enterprise'],
      'integrations.setup': ['team', 'enterprise'],

      // Analytics Features (extended)
      'analytics.view': ['individual_pro', 'team', 'enterprise'],

      // Enterprise Features
      'enterprise.sso': ['enterprise'],
      'enterprise.audit': ['enterprise'],
      'enterprise.compliance': ['enterprise'],
      'enterprise.custom_integrations': ['enterprise'],

      // Platform Owner Features
      'platform.admin': ['platform_owner'],
      'platform.users': ['platform_owner'],
      'platform.system': ['platform_owner'],
      'platform.billing': ['platform_owner']
    };

    if (this.isPlatformOwner) return true;

    const requiredTiers = featurePermissions[feature];
    if (!requiredTiers) return false;

    return requiredTiers.some(tier => this.hasSubscriptionAccess(tier));
  }

  /**
   * Get user's accessible features
   */
  getAccessibleFeatures() {
    const allFeatures = [
      'analytics.basic', 'analytics.advanced', 'analytics.mobile', 'analytics.predictive', 'analytics.export', 'analytics.view',
      'ai.basic', 'ai.advanced', 'ai.coaching', 'ai.writing',
      'social.basic', 'social.networking', 'social.collaboration', 'social.mentorship',
      'team.create', 'team.manage', 'team.view', 'team.invite', 'team.analytics', 'team.workflows',
      'projects.view', 'projects.create', 'projects.manage',
      'integrations.view', 'integrations.setup',
      'enterprise.sso', 'enterprise.audit', 'enterprise.compliance', 'enterprise.custom_integrations',
      'platform.admin', 'platform.users', 'platform.system', 'platform.billing'
    ];

    return allFeatures.filter(feature => this.canAccessFeature(feature));
  }

  /**
   * Update last login timestamp
   */
  updateLastLogin() {
    this.lastLogin = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Convert to JSON (safe for API responses)
   */
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      role: this.role,
      subscriptionTier: this.subscriptionTier,
      teamId: this.teamId,
      permissions: this.permissions,
      isPlatformOwner: this.isPlatformOwner,
      isActive: this.isActive,
      isVerified: this.isVerified,
      onboardingCompleted: this.onboardingCompleted,
      onboardingData: this.onboardingData,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      profile: this.profile,
      preferences: this.preferences,
      accessibleFeatures: this.getAccessibleFeatures()
    };
  }

  /**
   * Convert to safe JSON (excludes sensitive data)
   */
  toSafeJSON() {
    return {
      id: this.id,
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      role: this.role,
      subscriptionTier: this.subscriptionTier,
      isVerified: this.isVerified,
      profile: this.profile
    };
  }
}

/**
 * User Repository (In-memory for demo)
 */
class UserRepository {
  constructor() {
    this.users = new Map();
    this.nextId = 1;
    this.initializeDemoUsers();
  }

  /**
   * Initialize demo users
   */
  initializeDemoUsers() {
    const demoUsers = [
      {
        id: 1,
        email: 'admin@digame.com',
        username: 'admin',
        firstName: 'Platform',
        lastName: 'Administrator',
        role: 'admin',
        subscriptionTier: 'platform_owner',
        isPlatformOwner: true,
        isVerified: true,
        permissions: ['*'],
        profile: {
          bio: 'Platform Administrator with full system access',
          avatar: '/avatars/admin.png'
        }
      },
      {
        id: 2,
        email: 'demo@digame.com',
        username: 'demo',
        firstName: 'Demo',
        lastName: 'User',
        role: 'user',
        subscriptionTier: 'enterprise',
        isVerified: true,
        permissions: ['analytics.*', 'ai.*', 'social.*', 'team.*'],
        profile: {
          bio: 'Demo user with enterprise access',
          avatar: '/avatars/demo.png'
        }
      },
      {
        id: 3,
        email: 'team.lead@company.com',
        username: 'teamlead',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'team_lead',
        subscriptionTier: 'team',
        teamId: 'team_001',
        isVerified: true,
        permissions: ['analytics.advanced', 'ai.basic', 'social.*', 'team.manage'],
        profile: {
          bio: 'Team Lead focused on productivity and collaboration',
          avatar: '/avatars/sarah.png'
        }
      },
      {
        id: 4,
        email: 'pro.user@freelancer.com',
        username: 'prouser',
        firstName: 'Mike',
        lastName: 'Chen',
        role: 'user',
        subscriptionTier: 'individual_pro',
        isVerified: true,
        permissions: ['analytics.advanced', 'ai.coaching', 'social.networking'],
        profile: {
          bio: 'Professional freelancer leveraging AI tools',
          avatar: '/avatars/mike.png'
        }
      },
      {
        id: 5,
        email: 'free.user@example.com',
        username: 'freeuser',
        firstName: 'Alex',
        lastName: 'Smith',
        role: 'user',
        subscriptionTier: 'free',
        isVerified: false,
        permissions: ['analytics.basic', 'social.basic'],
        profile: {
          bio: 'New user exploring the platform',
          avatar: '/avatars/alex.png'
        }
      }
    ];

    demoUsers.forEach(userData => {
      const user = new User(userData);
      this.users.set(user.id, user);
      this.nextId = Math.max(this.nextId, user.id + 1);
    });
  }

  /**
   * Find user by ID
   */
  findById(id) {
    return this.users.get(parseInt(id));
  }

  /**
   * Find user by email
   */
  findByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  /**
   * Find user by username
   */
  findByUsername(username) {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return null;
  }

  /**
   * Authenticate user
   */
  authenticate(identifier, password) {
    // For demo purposes, accept any password
    // In production, this would verify hashed passwords
    const user = this.findByEmail(identifier) || this.findByUsername(identifier);
    
    if (!user || !user.isActive) return null;
    
    user.updateLastLogin();
    return user;
  }

  /**
   * Create new user
   */
  create(userData) {
    const user = new User({
      ...userData,
      id: this.nextId++
    });
    
    this.users.set(user.id, user);
    return user;
  }

  /**
   * Update user
   */
  update(id, updates) {
    const user = this.findById(id);
    if (!user) return null;

    Object.assign(user, updates);
    user.updatedAt = new Date();
    return user;
  }

  /**
   * Get all users (with pagination)
   */
  findAll(options = {}) {
    const { page = 1, limit = 10, role, subscriptionTier, teamId } = options;
    
    let users = Array.from(this.users.values());

    // Apply filters
    if (role) users = users.filter(user => user.role === role);
    if (subscriptionTier) users = users.filter(user => user.subscriptionTier === subscriptionTier);
    if (teamId) users = users.filter(user => user.teamId === teamId);

    // Apply pagination
    const total = users.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Delete user
   */
  delete(id) {
    return this.users.delete(parseInt(id));
  }
}

module.exports = { User, UserRepository };