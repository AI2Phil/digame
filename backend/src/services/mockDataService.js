const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class MockDataService {
  constructor(database) {
    this.db = database;
  }

  /**
   * Generate comprehensive mock data for all entities
   */
  async generateMockData(options = {}) {
    const {
      userCount = 50,
      teamCount = 10,
      projectCount = 25,
      taskCount = 200,
      analyticsEventCount = 1000,
      category = 'demo'
    } = options;

    const operationId = uuidv4();
    const timestamp = new Date().toISOString();

    try {
      // Record operation start
      const operation = this.db.prepare(`
        INSERT INTO data_management_operations (
          operation_uuid, operation_type, entity_types, status, started_at, metadata
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      operation.run(
        operationId,
        'seed',
        JSON.stringify(['users', 'teams', 'projects', 'tasks', 'analytics']),
        'running',
        timestamp,
        JSON.stringify({ userCount, teamCount, projectCount, taskCount, analyticsEventCount, category })
      );

      let totalRecords = 0;

      // Generate mock users
      const users = await this.generateMockUsers(userCount, category);
      totalRecords += users.length;

      // Generate mock teams
      const teams = await this.generateMockTeams(teamCount, users, category);
      totalRecords += teams.length;

      // Generate mock projects
      const projects = await this.generateMockProjects(projectCount, users, teams, category);
      totalRecords += projects.length;

      // Generate mock tasks
      const tasks = await this.generateMockTasks(taskCount, users, projects, category);
      totalRecords += tasks.length;

      // Generate mock analytics events
      const events = await this.generateMockAnalyticsEvents(analyticsEventCount, users, category);
      totalRecords += events.length;

      // Update operation as completed
      const updateOperation = this.db.prepare(`
        UPDATE data_management_operations 
        SET status = 'completed', completed_at = ?, affected_records = ?
        WHERE operation_uuid = ?
      `);
      
      updateOperation.run(new Date().toISOString(), totalRecords, operationId);

      return {
        operationId,
        totalRecords,
        breakdown: {
          users: users.length,
          teams: teams.length,
          projects: projects.length,
          tasks: tasks.length,
          analyticsEvents: events.length
        }
      };

    } catch (error) {
      // Update operation as failed
      const updateOperation = this.db.prepare(`
        UPDATE data_management_operations 
        SET status = 'failed', completed_at = ?, error_message = ?
        WHERE operation_uuid = ?
      `);
      
      updateOperation.run(new Date().toISOString(), error.message, operationId);
      throw error;
    }
  }

  /**
   * Generate realistic mock users
   */
  async generateMockUsers(count, category) {
    const users = [];
    const roles = ['user', 'team_lead', 'admin'];
    const subscriptionTiers = ['free', 'individual_pro', 'team', 'enterprise'];
    const firstNames = [
      'Alex', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'John', 'Maria',
      'Chris', 'Anna', 'James', 'Sophie', 'Robert', 'Elena', 'Michael'
    ];
    const lastNames = [
      'Johnson', 'Smith', 'Brown', 'Davis', 'Wilson', 'Miller', 'Moore',
      'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin'
    ];

    const insertUser = this.db.prepare(`
      INSERT INTO users (
        email, username, firstName, lastName, passwordHash, role,
        subscriptionTier, permissions, isVerified, is_mock_data,
        mock_data_category, mock_data_created_at, profile
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const passwordHash = bcrypt.hashSync('demo123', 12);
    const timestamp = new Date().toISOString();

    for (let i = 0; i < count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`;
      const email = `${username}@example.com`;
      const role = roles[Math.floor(Math.random() * roles.length)];
      const subscriptionTier = subscriptionTiers[Math.floor(Math.random() * subscriptionTiers.length)];

      const permissions = this.generatePermissionsForTier(subscriptionTier);
      const profile = {
        bio: `${role} with expertise in various areas`,
        avatar: `${firstName.charAt(0)}${lastName.charAt(0)}`,
        skills: this.generateRandomSkills(),
        experience: Math.floor(Math.random() * 15) + 1
      };

      const result = insertUser.run(
        email, username, firstName, lastName, passwordHash, role,
        subscriptionTier, JSON.stringify(permissions), 1, true,
        category, timestamp, JSON.stringify(profile)
      );

      users.push({
        id: result.lastInsertRowid,
        email,
        username,
        firstName,
        lastName,
        role,
        subscriptionTier
      });
    }

    return users;
  }

  /**
   * Generate realistic mock teams
   */
  async generateMockTeams(count, users, category) {
    const teams = [];
    const teamNames = [
      'Development Team', 'Design Team', 'Marketing Team', 'Sales Team',
      'Product Team', 'Engineering Team', 'Analytics Team', 'Support Team',
      'Research Team', 'Operations Team'
    ];

    const insertTeam = this.db.prepare(`
      INSERT INTO teams (
        id, name, description, ownerId, settings, is_mock_data,
        mock_data_category, mock_data_created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertTeamMember = this.db.prepare(`
      INSERT INTO team_members (
        teamId, userId, role, is_mock_data, mock_data_category, mock_data_created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const timestamp = new Date().toISOString();

    for (let i = 0; i < count; i++) {
      const teamId = `team_${uuidv4().substring(0, 8)}`;
      const name = teamNames[i % teamNames.length] + (i >= teamNames.length ? ` ${Math.floor(i / teamNames.length) + 1}` : '');
      const description = `${name} focused on delivering high-quality results`;
      const owner = users[Math.floor(Math.random() * users.length)];
      
      const settings = {
        allowGuestAccess: Math.random() > 0.5,
        requireApproval: Math.random() > 0.3,
        defaultRole: 'member'
      };

      insertTeam.run(
        teamId, name, description, owner.id, JSON.stringify(settings),
        true, category, timestamp
      );

      // Add team members
      const memberCount = Math.floor(Math.random() * 8) + 3; // 3-10 members
      const teamMembers = [owner]; // Owner is always a member
      
      // Add random members
      for (let j = 1; j < memberCount && j < users.length; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        if (!teamMembers.find(m => m.id === randomUser.id)) {
          teamMembers.push(randomUser);
        }
      }

      // Insert team members
      teamMembers.forEach((member, index) => {
        const role = index === 0 ? 'owner' : (Math.random() > 0.8 ? 'admin' : 'member');
        insertTeamMember.run(teamId, member.id, role, true, category, timestamp);
      });

      teams.push({
        id: teamId,
        name,
        description,
        ownerId: owner.id,
        memberCount: teamMembers.length
      });
    }

    return teams;
  }

  /**
   * Generate realistic mock projects
   */
  async generateMockProjects(count, users, teams, category) {
    const projects = [];
    const projectNames = [
      'Website Redesign', 'Mobile App Development', 'API Integration',
      'Database Migration', 'User Experience Improvement', 'Performance Optimization',
      'Security Enhancement', 'Feature Development', 'Bug Fix Sprint',
      'Documentation Update', 'Testing Automation', 'Analytics Implementation'
    ];

    const statuses = ['planning', 'in_progress', 'on_hold', 'completed'];
    const priorities = ['low', 'medium', 'high'];

    const insertProject = this.db.prepare(`
      INSERT INTO projects (
        name, description, status, progress, startDate, dueDate,
        teamMembers, priority, budget, spent, createdBy, is_mock_data,
        mock_data_category, mock_data_created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const timestamp = new Date().toISOString();

    for (let i = 0; i < count; i++) {
      const name = projectNames[i % projectNames.length] + (i >= projectNames.length ? ` ${Math.floor(i / projectNames.length) + 1}` : '');
      const description = `${name} project to improve platform capabilities and user experience`;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const progress = status === 'completed' ? 100 : Math.floor(Math.random() * 90);
      
      const startDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dueDate = new Date(Date.now() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const budget = Math.floor(Math.random() * 200000) + 10000;
      const spent = Math.floor(budget * (progress / 100) * (0.7 + Math.random() * 0.3));
      
      const createdBy = users[Math.floor(Math.random() * users.length)];
      const teamMemberCount = Math.floor(Math.random() * 6) + 2;
      const teamMembers = [];
      
      for (let j = 0; j < teamMemberCount; j++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        if (!teamMembers.includes(randomUser.id)) {
          teamMembers.push(randomUser.id);
        }
      }

      const result = insertProject.run(
        name, description, status, progress, startDate, dueDate,
        JSON.stringify(teamMembers), priority, budget, spent, createdBy.id,
        true, category, timestamp
      );

      projects.push({
        id: result.lastInsertRowid,
        name,
        status,
        progress,
        teamMembers: teamMembers.length
      });
    }

    return projects;
  }

  /**
   * Generate realistic mock tasks
   */
  async generateMockTasks(count, users, projects, category) {
    const tasks = [];
    const taskTitles = [
      'Update user interface', 'Fix authentication bug', 'Implement new feature',
      'Write documentation', 'Code review', 'Database optimization',
      'Security audit', 'Performance testing', 'User feedback analysis',
      'API endpoint creation', 'Mobile responsiveness', 'Error handling improvement'
    ];

    const statuses = ['pending', 'in_progress', 'completed', 'blocked'];
    const priorities = ['low', 'medium', 'high'];
    const categories = ['development', 'design', 'testing', 'documentation', 'research'];

    const insertTask = this.db.prepare(`
      INSERT INTO tasks (
        userId, title, description, status, priority, category,
        dueDate, estimatedTime, completedTime, completedAt, tags,
        is_mock_data, mock_data_category, mock_data_created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const timestamp = new Date().toISOString();

    for (let i = 0; i < count; i++) {
      const title = taskTitles[Math.floor(Math.random() * taskTitles.length)];
      const description = `${title} to improve system functionality and user experience`;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      const user = users[Math.floor(Math.random() * users.length)];
      const estimatedTime = Math.floor(Math.random() * 480) + 30; // 30 minutes to 8 hours
      const completedTime = status === 'completed' ? Math.floor(estimatedTime * (0.8 + Math.random() * 0.4)) : null;
      const completedAt = status === 'completed' ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null;
      
      const dueDate = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const tags = this.generateRandomTags(category);

      const result = insertTask.run(
        user.id, title, description, status, priority, category,
        dueDate, estimatedTime, completedTime, completedAt, JSON.stringify(tags),
        true, category, timestamp
      );

      tasks.push({
        id: result.lastInsertRowid,
        title,
        status,
        userId: user.id
      });
    }

    return tasks;
  }

  /**
   * Generate realistic mock analytics events
   */
  async generateMockAnalyticsEvents(count, users, category) {
    const events = [];
    const eventTypes = [
      'page_view', 'task_created', 'task_completed', 'login', 'logout',
      'feature_used', 'profile_updated', 'settings_changed', 'report_generated',
      'team_joined', 'project_created', 'collaboration_event'
    ];

    const insertEvent = this.db.prepare(`
      INSERT INTO analytics_events (
        userId, eventType, eventData, timestamp, sessionId, userAgent, ipAddress,
        is_mock_data, mock_data_category, mock_data_created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const mockDataTimestamp = new Date().toISOString();

    for (let i = 0; i < count; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
      const sessionId = `session_${user.id}_${Math.floor(Date.now() / (24 * 60 * 60 * 1000))}`;
      
      const eventData = this.generateEventData(eventType);
      const userAgent = 'Mozilla/5.0 (compatible; Digame/1.0)';
      const ipAddress = `192.168.1.${Math.floor(Math.random() * 255)}`;

      const result = insertEvent.run(
        user.id, eventType, JSON.stringify(eventData), timestamp,
        sessionId, userAgent, ipAddress, true, category, mockDataTimestamp
      );

      events.push({
        id: result.lastInsertRowid,
        eventType,
        userId: user.id,
        timestamp
      });
    }

    return events;
  }

  /**
   * Helper methods
   */
  generatePermissionsForTier(tier) {
    const permissions = {
      free: ['analytics.basic', 'social.basic'],
      individual_pro: ['analytics.advanced', 'ai.coaching', 'social.networking'],
      team: ['analytics.advanced', 'ai.basic', 'social.*', 'team.manage'],
      enterprise: ['analytics.*', 'ai.*', 'social.*', 'team.*', 'enterprise.*']
    };
    return permissions[tier] || permissions.free;
  }

  generateRandomSkills() {
    const allSkills = [
      'JavaScript', 'Python', 'React', 'Node.js', 'UI/UX Design',
      'Project Management', 'Data Analysis', 'Machine Learning',
      'DevOps', 'Marketing', 'Sales', 'Customer Support'
    ];
    const skillCount = Math.floor(Math.random() * 5) + 2;
    const skills = [];
    
    for (let i = 0; i < skillCount; i++) {
      const skill = allSkills[Math.floor(Math.random() * allSkills.length)];
      if (!skills.includes(skill)) {
        skills.push(skill);
      }
    }
    
    return skills;
  }

  generateRandomTags(category) {
    const tagsByCategory = {
      development: ['frontend', 'backend', 'api', 'database', 'testing'],
      design: ['ui', 'ux', 'mockup', 'prototype', 'branding'],
      testing: ['unit-test', 'integration', 'e2e', 'performance', 'security'],
      documentation: ['api-docs', 'user-guide', 'technical', 'tutorial'],
      research: ['user-research', 'market-analysis', 'competitive', 'survey']
    };
    
    const availableTags = tagsByCategory[category] || ['general', 'task', 'work'];
    const tagCount = Math.floor(Math.random() * 3) + 1;
    const tags = [];
    
    for (let i = 0; i < tagCount; i++) {
      const tag = availableTags[Math.floor(Math.random() * availableTags.length)];
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }
    
    return tags;
  }

  generateEventData(eventType) {
    const eventDataMap = {
      page_view: { page: '/dashboard', duration: Math.floor(Math.random() * 300) + 30 },
      task_created: { category: 'development', priority: 'medium' },
      task_completed: { duration: Math.floor(Math.random() * 240) + 15 },
      login: { method: 'email', success: true },
      logout: { duration: Math.floor(Math.random() * 3600) + 300 },
      feature_used: { feature: 'ai_tools', duration: Math.floor(Math.random() * 180) + 30 },
      profile_updated: { fields: ['bio', 'skills'] },
      settings_changed: { section: 'notifications' },
      report_generated: { type: 'analytics', format: 'pdf' },
      team_joined: { teamId: `team_${Math.random().toString(36).substr(2, 8)}` },
      project_created: { category: 'development', priority: 'high' },
      collaboration_event: { type: 'comment', targetType: 'task' }
    };
    
    return eventDataMap[eventType] || { type: eventType };
  }

  /**
   * Get data statistics
   */
  async getDataStatistics() {
    const tables = [
      'users', 'notifications', 'notification_settings', 'tasks', 'projects',
      'teams', 'team_members', 'skills', 'user_skills', 'mentorship_relationships',
      'workflows', 'analytics_events', 'audit_logs', 'api_keys', 'webhooks',
      'reports', 'platform_metrics', 'tenants'
    ];

    const statistics = {
      total: {},
      mock: {},
      real: {},
      byCategory: {}
    };

    for (const table of tables) {
      try {
        // Total count
        const totalStmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${table}`);
        const total = totalStmt.get();
        statistics.total[table] = total.count;

        // Mock data count
        const mockStmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${table} WHERE is_mock_data = TRUE`);
        const mock = mockStmt.get();
        statistics.mock[table] = mock.count;

        // Real data count
        statistics.real[table] = total.count - mock.count;

        // By category
        const categoryStmt = this.db.prepare(`
          SELECT mock_data_category, COUNT(*) as count 
          FROM ${table} 
          WHERE is_mock_data = TRUE AND mock_data_category IS NOT NULL
          GROUP BY mock_data_category
        `);
        const categories = categoryStmt.all();
        statistics.byCategory[table] = categories.reduce((acc, cat) => {
          acc[cat.mock_data_category] = cat.count;
          return acc;
        }, {});

      } catch (error) {
        console.warn(`Error getting statistics for ${table}:`, error.message);
        statistics.total[table] = 0;
        statistics.mock[table] = 0;
        statistics.real[table] = 0;
        statistics.byCategory[table] = {};
      }
    }

    return statistics;
  }

  /**
   * Clean up mock data
   */
  async cleanupMockData(options = {}) {
    const {
      categories = ['demo', 'test', 'development'],
      tables = null, // null means all tables
      dryRun = false
    } = options;

    const operationId = uuidv4();
    const timestamp = new Date().toISOString();

    const allTables = [
      'users', 'notifications', 'notification_settings', 'tasks', 'projects',
      'teams', 'team_members', 'skills', 'user_skills', 'mentorship_relationships',
      'workflows', 'analytics_events', 'audit_logs', 'api_keys', 'webhooks',
      'reports', 'platform_metrics', 'tenants'
    ];

    const tablesToClean = tables || allTables;
    let totalDeleted = 0;
    const deletionSummary = {};

    try {
      if (!dryRun) {
        // Record operation start
        const operation = this.db.prepare(`
          INSERT INTO data_management_operations (
            operation_uuid, operation_type, entity_types, status, started_at, metadata
          ) VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        operation.run(
          operationId,
          'cleanup',
          JSON.stringify(tablesToClean),
          'running',
          timestamp,
          JSON.stringify({ categories, dryRun })
        );
      }

      for (const table of tablesToClean) {
        try {
          const categoryFilter = categories.map(() => '?').join(',');
          const query = `
            ${dryRun ? 'SELECT COUNT(*) as count' : 'DELETE'} 
            FROM ${table} 
            WHERE is_mock_data = TRUE 
            AND mock_data_category IN (${categoryFilter})
          `;

          const stmt = this.db.prepare(query);
          const result = stmt.run(...categories);
          
          const deleted = dryRun ? result.count : result.changes;
          deletionSummary[table] = deleted;
          totalDeleted += deleted;

        } catch (error) {
          console.warn(`Error cleaning ${table}:`, error.message);
          deletionSummary[table] = 0;
        }
      }

      if (!dryRun) {
        // Update operation as completed
        const updateOperation = this.db.prepare(`
          UPDATE data_management_operations 
          SET status = 'completed', completed_at = ?, affected_records = ?
          WHERE operation_uuid = ?
        `);
        
        updateOperation.run(new Date().toISOString(), totalDeleted, operationId);
      }

      return {
        operationId: dryRun ? null : operationId,
        totalDeleted,
        deletionSummary,
        dryRun
      };

    } catch (error) {
      if (!dryRun) {
        // Update operation as failed
        const updateOperation = this.db.prepare(`
          UPDATE data_management_operations 
          SET status = 'failed', completed_at = ?, error_message = ?
          WHERE operation_uuid = ?
        `);
        
        updateOperation.run(new Date().toISOString(), error.message, operationId);
      }
      throw error;
    }
  }
}

module.exports = MockDataService;