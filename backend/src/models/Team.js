/**
 * Team Model with Collaboration Features
 */

class Team {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.description = data.description || '';
    this.ownerId = data.ownerId || null;
    this.subscriptionTier = data.subscriptionTier || 'team';
    this.members = data.members || [];
    this.invitations = data.invitations || [];
    this.projects = data.projects || [];
    this.settings = data.settings || {};
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.metadata = data.metadata || {};
  }

  /**
   * Add member to team
   */
  addMember(userId, role = 'member') {
    const existingMember = this.members.find(m => m.userId === userId);
    if (existingMember) {
      return false; // Member already exists
    }

    this.members.push({
      userId,
      role,
      joinedAt: new Date(),
      isActive: true,
      permissions: this.getDefaultPermissions(role)
    });

    this.updatedAt = new Date();
    return true;
  }

  /**
   * Remove member from team
   */
  removeMember(userId) {
    const memberIndex = this.members.findIndex(m => m.userId === userId);
    if (memberIndex === -1) {
      return false; // Member not found
    }

    this.members.splice(memberIndex, 1);
    this.updatedAt = new Date();
    return true;
  }

  /**
   * Update member role
   */
  updateMemberRole(userId, newRole) {
    const member = this.members.find(m => m.userId === userId);
    if (!member) {
      return false; // Member not found
    }

    member.role = newRole;
    member.permissions = this.getDefaultPermissions(newRole);
    this.updatedAt = new Date();
    return true;
  }

  /**
   * Get default permissions for role
   */
  getDefaultPermissions(role) {
    const rolePermissions = {
      'owner': ['*'],
      'admin': ['team.manage', 'team.invite', 'team.projects', 'team.analytics'],
      'manager': ['team.projects', 'team.analytics', 'team.invite'],
      'member': ['team.projects'],
      'viewer': ['team.view']
    };

    return rolePermissions[role] || ['team.view'];
  }

  /**
   * Check if user is member
   */
  isMember(userId) {
    return this.members.some(m => m.userId === userId && m.isActive);
  }

  /**
   * Get member by user ID
   */
  getMember(userId) {
    return this.members.find(m => m.userId === userId);
  }

  /**
   * Check if user has permission
   */
  userHasPermission(userId, permission) {
    const member = this.getMember(userId);
    if (!member || !member.isActive) return false;

    return member.permissions.includes('*') || member.permissions.includes(permission);
  }

  /**
   * Invite user to team
   */
  inviteUser(email, role = 'member', invitedBy) {
    const existingInvitation = this.invitations.find(i => i.email === email && i.status === 'pending');
    if (existingInvitation) {
      return false; // Invitation already exists
    }

    this.invitations.push({
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      role,
      invitedBy,
      invitedAt: new Date(),
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    this.updatedAt = new Date();
    return true;
  }

  /**
   * Accept invitation
   */
  acceptInvitation(invitationId, userId) {
    const invitation = this.invitations.find(i => i.id === invitationId);
    if (!invitation || invitation.status !== 'pending') {
      return false;
    }

    if (new Date() > invitation.expiresAt) {
      invitation.status = 'expired';
      return false;
    }

    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    invitation.acceptedBy = userId;

    // Add user as member
    this.addMember(userId, invitation.role);

    this.updatedAt = new Date();
    return true;
  }

  /**
   * Create project
   */
  createProject(projectData) {
    const project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: projectData.name,
      description: projectData.description || '',
      ownerId: projectData.ownerId,
      members: projectData.members || [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...projectData
    };

    this.projects.push(project);
    this.updatedAt = new Date();
    return project;
  }

  /**
   * Get team statistics
   */
  getStatistics() {
    const activeMembers = this.members.filter(m => m.isActive).length;
    const pendingInvitations = this.invitations.filter(i => i.status === 'pending').length;
    const activeProjects = this.projects.filter(p => p.status === 'active').length;

    return {
      totalMembers: activeMembers,
      pendingInvitations,
      activeProjects,
      totalProjects: this.projects.length,
      createdAt: this.createdAt,
      lastActivity: this.updatedAt
    };
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      ownerId: this.ownerId,
      subscriptionTier: this.subscriptionTier,
      members: this.members,
      invitations: this.invitations,
      projects: this.projects,
      settings: this.settings,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      statistics: this.getStatistics()
    };
  }

  /**
   * Convert to safe JSON (excludes sensitive data)
   */
  toSafeJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      subscriptionTier: this.subscriptionTier,
      memberCount: this.members.filter(m => m.isActive).length,
      projectCount: this.projects.filter(p => p.status === 'active').length,
      createdAt: this.createdAt,
      isActive: this.isActive
    };
  }
}

/**
 * Team Repository (In-memory for demo)
 */
class TeamRepository {
  constructor() {
    this.teams = new Map();
    this.nextId = 1;
    this.initializeDemoTeams();
  }

  /**
   * Initialize demo teams
   */
  initializeDemoTeams() {
    const demoTeams = [
      {
        id: 'team_001',
        name: 'Digital Innovation Team',
        description: 'Leading digital transformation initiatives',
        ownerId: 3, // Sarah Johnson (team lead)
        subscriptionTier: 'team',
        members: [
          {
            userId: 3,
            role: 'owner',
            joinedAt: new Date('2024-01-15'),
            isActive: true,
            permissions: ['*']
          },
          {
            userId: 4,
            role: 'member',
            joinedAt: new Date('2024-02-01'),
            isActive: true,
            permissions: ['team.projects']
          }
        ],
        projects: [
          {
            id: 'proj_001',
            name: 'AI Analytics Dashboard',
            description: 'Advanced analytics dashboard with AI insights',
            ownerId: 3,
            members: [3, 4],
            status: 'active',
            createdAt: new Date('2024-03-01'),
            updatedAt: new Date('2024-06-20')
          }
        ],
        settings: {
          allowMemberInvites: true,
          requireApprovalForProjects: false,
          defaultMemberRole: 'member'
        }
      },
      {
        id: 'team_002',
        name: 'Enterprise Solutions',
        description: 'Enterprise-grade solutions and integrations',
        ownerId: 1, // Admin
        subscriptionTier: 'enterprise',
        members: [
          {
            userId: 1,
            role: 'owner',
            joinedAt: new Date('2024-01-01'),
            isActive: true,
            permissions: ['*']
          },
          {
            userId: 2,
            role: 'admin',
            joinedAt: new Date('2024-01-05'),
            isActive: true,
            permissions: ['team.manage', 'team.invite', 'team.projects', 'team.analytics']
          }
        ],
        projects: [
          {
            id: 'proj_002',
            name: 'SSO Integration',
            description: 'Single Sign-On integration for enterprise clients',
            ownerId: 1,
            members: [1, 2],
            status: 'active',
            createdAt: new Date('2024-02-15'),
            updatedAt: new Date('2024-06-25')
          },
          {
            id: 'proj_003',
            name: 'Compliance Dashboard',
            description: 'Compliance monitoring and reporting dashboard',
            ownerId: 2,
            members: [1, 2],
            status: 'active',
            createdAt: new Date('2024-04-01'),
            updatedAt: new Date('2024-06-22')
          }
        ],
        settings: {
          allowMemberInvites: false,
          requireApprovalForProjects: true,
          defaultMemberRole: 'viewer'
        }
      }
    ];

    demoTeams.forEach(teamData => {
      const team = new Team(teamData);
      this.teams.set(team.id, team);
    });
  }

  /**
   * Find team by ID
   */
  findById(id) {
    return this.teams.get(id);
  }

  /**
   * Find teams by user ID
   */
  findByUserId(userId) {
    const userTeams = [];
    for (const team of this.teams.values()) {
      if (team.isMember(userId)) {
        userTeams.push(team);
      }
    }
    return userTeams;
  }

  /**
   * Create new team
   */
  create(teamData) {
    const team = new Team({
      ...teamData,
      id: teamData.id || `team_${this.nextId++}`
    });

    // Add owner as first member
    if (teamData.ownerId) {
      team.addMember(teamData.ownerId, 'owner');
    }

    this.teams.set(team.id, team);
    return team;
  }

  /**
   * Update team
   */
  update(id, updates) {
    const team = this.findById(id);
    if (!team) return null;

    Object.assign(team, updates);
    team.updatedAt = new Date();
    return team;
  }

  /**
   * Delete team
   */
  delete(id) {
    return this.teams.delete(id);
  }

  /**
   * Get all teams (with pagination)
   */
  findAll(options = {}) {
    const { page = 1, limit = 10, ownerId, subscriptionTier } = options;
    
    let teams = Array.from(this.teams.values());

    // Apply filters
    if (ownerId) teams = teams.filter(team => team.ownerId === ownerId);
    if (subscriptionTier) teams = teams.filter(team => team.subscriptionTier === subscriptionTier);

    // Apply pagination
    const total = teams.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTeams = teams.slice(startIndex, endIndex);

    return {
      teams: paginatedTeams,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = { Team, TeamRepository };