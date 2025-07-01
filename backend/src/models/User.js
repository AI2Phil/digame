/**
 * User Model with SQLite Database and RBAC
 */

const DatabaseService = require('../services/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.email = data.email || '';
    this.username = data.username || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.passwordHash = data.passwordHash || '';
    this.role = data.role || 'user';
    this.subscriptionTier = data.subscriptionTier || 'free';
    this.teamId = data.teamId || null;
    this.permissions = Array.isArray(data.permissions) ? data.permissions : 
                      (typeof data.permissions === 'string' ? JSON.parse(data.permissions || '[]') : []);
    this.isPlatformOwner = Boolean(data.isPlatformOwner);
    this.isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;
    this.isVerified = Boolean(data.isVerified);
    this.onboardingCompleted = Boolean(data.onboardingCompleted);
    this.onboardingData = typeof data.onboardingData === 'string' ? 
                         JSON.parse(data.onboardingData || '{}') : 
                         (data.onboardingData || {
                           interests: [],
                           goals: [],
                           experience: '',
                           teamPreference: '',
                           completedSteps: []
                         });
    this.lastLogin = data.lastLogin ? new Date(data.lastLogin) : null;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.profile = typeof data.profile === 'string' ? 
                   JSON.parse(data.profile || '{}') : 
                   (data.profile || {});
    this.preferences = typeof data.preferences === 'string' ? 
                       JSON.parse(data.preferences || '{}') : 
                       (data.preferences || {});
    this.metadata = typeof data.metadata === 'string' ? 
                    JSON.parse(data.metadata || '{}') : 
                    (data.metadata || {});
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
 * User Repository with SQLite Database
 */
class UserRepository {
  constructor() {
    this.db = new DatabaseService();
  }

  /**
   * Convert database row to User instance
   */
  _rowToUser(row) {
    if (!row) return null;
    return new User(row);
  }

  /**
   * Find user by ID
   */
  findById(id) {
    const stmt = this.db.db.prepare('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id);
    return this._rowToUser(row);
  }

  /**
   * Find user by email
   */
  findByEmail(email) {
    const stmt = this.db.db.prepare('SELECT * FROM users WHERE email = ?');
    const row = stmt.get(email);
    return this._rowToUser(row);
  }

  /**
   * Find user by username
   */
  findByUsername(username) {
    const stmt = this.db.db.prepare('SELECT * FROM users WHERE username = ?');
    const row = stmt.get(username);
    return this._rowToUser(row);
  }

  /**
   * Authenticate user
   */
  authenticate(identifier, password) {
    const user = this.findByEmail(identifier) || this.findByUsername(identifier);
    
    if (!user || !user.isActive) return null;
    
    // Verify password against stored hash
    if (!user.passwordHash || !bcrypt.compareSync(password, user.passwordHash)) {
      return null;
    }
    
    user.updateLastLogin();
    this.update(user.id, { lastLogin: user.lastLogin.toISOString() });
    return user;
  }

  /**
   * Create new user
   */
  create(userData) {
    const stmt = this.db.db.prepare(`
      INSERT INTO users (
        email, username, firstName, lastName, passwordHash, role,
        subscriptionTier, teamId, permissions, isPlatformOwner,
        isActive, isVerified, onboardingCompleted, onboardingData,
        profile, preferences, metadata
      ) VALUES (
        @email, @username, @firstName, @lastName, @passwordHash, @role,
        @subscriptionTier, @teamId, @permissions, @isPlatformOwner,
        @isActive, @isVerified, @onboardingCompleted, @onboardingData,
        @profile, @preferences, @metadata
      )
    `);

    const data = {
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      passwordHash: userData.passwordHash,
      role: userData.role || 'user',
      subscriptionTier: userData.subscriptionTier || 'free',
      teamId: userData.teamId || null,
      permissions: JSON.stringify(userData.permissions || []),
      isPlatformOwner: userData.isPlatformOwner ? 1 : 0,
      isActive: userData.isActive !== undefined ? (userData.isActive ? 1 : 0) : 1,
      isVerified: userData.isVerified ? 1 : 0,
      onboardingCompleted: userData.onboardingCompleted ? 1 : 0,
      onboardingData: JSON.stringify(userData.onboardingData || {}),
      profile: JSON.stringify(userData.profile || {}),
      preferences: JSON.stringify(userData.preferences || {}),
      metadata: JSON.stringify(userData.metadata || {})
    };

    const result = stmt.run(data);
    return this.findById(result.lastInsertRowid);
  }

  /**
   * Update user
   */
  update(id, updates) {
    const user = this.findById(id);
    if (!user) return null;

    const fields = [];
    const values = { id };

    Object.keys(updates).forEach(key => {
      if (key === 'permissions' || key === 'onboardingData' || key === 'profile' || key === 'preferences' || key === 'metadata') {
        fields.push(`${key} = @${key}`);
        values[key] = typeof updates[key] === 'string' ? updates[key] : JSON.stringify(updates[key]);
      } else if (key === 'isPlatformOwner' || key === 'isActive' || key === 'isVerified' || key === 'onboardingCompleted') {
        fields.push(`${key} = @${key}`);
        values[key] = updates[key] ? 1 : 0;
      } else {
        fields.push(`${key} = @${key}`);
        values[key] = updates[key];
      }
    });

    fields.push('updatedAt = CURRENT_TIMESTAMP');

    const stmt = this.db.db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = @id`);
    stmt.run(values);

    return this.findById(id);
  }

  /**
   * Get all users (with pagination)
   */
  findAll(options = {}) {
    const { page = 1, limit = 10, role, subscriptionTier, teamId } = options;
    
    let whereClause = '';
    const params = {};
    const conditions = [];

    if (role) {
      conditions.push('role = @role');
      params.role = role;
    }
    if (subscriptionTier) {
      conditions.push('subscriptionTier = @subscriptionTier');
      params.subscriptionTier = subscriptionTier;
    }
    if (teamId) {
      conditions.push('teamId = @teamId');
      params.teamId = teamId;
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    // Get total count
    const countStmt = this.db.db.prepare(`SELECT COUNT(*) as count FROM users ${whereClause}`);
    const total = countStmt.get(params).count;

    // Get paginated results
    const offset = (page - 1) * limit;
    const stmt = this.db.db.prepare(`
      SELECT * FROM users ${whereClause} 
      ORDER BY createdAt DESC 
      LIMIT @limit OFFSET @offset
    `);
    
    const rows = stmt.all({ ...params, limit, offset });
    const users = rows.map(row => this._rowToUser(row));

    return {
      users,
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
    const stmt = this.db.db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

module.exports = { User, UserRepository };