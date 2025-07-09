/**
 * Comprehensive Team Management Data Seeder
 * Generates production-scale realistic team data with historical patterns
 */

const { faker } = require('@faker-js/faker');

class TeamDataSeeder {
  constructor(database) {
    this.db = database.db;
    this.mockDataTimestamp = new Date().toISOString();
  }

  /**
   * Seed comprehensive team management data
   */
  async seedTeamManagementData() {
    console.log('🏢 Seeding comprehensive team management data...');
    
    try {
      // Clear existing team data if needed
      await this.clearExistingTeamData();
      
      // Seed core team data
      const teams = await this.seedTeams();
      const members = await this.seedTeamMembers(teams);
      
      // Seed advanced team features
      await this.seedTeamProjects(teams, members);
      await this.seedTeamInvitations(teams);
      await this.seedTeamAnalytics(teams, members);
      await this.seedCollaborationData(teams, members);
      await this.seedWorkflowOptimizations(teams, members);
      await this.seedTeamSkills(members);
      await this.seedMentorshipPrograms(members);
      await this.seedTeamMetrics(teams, members);
      
      console.log('✅ Team management data seeding complete');
      return { success: true, message: 'Team management data seeded successfully' };
      
    } catch (error) {
      console.error('❌ Team data seeding failed:', error);
      throw error;
    }
  }

  /**
   * Clear existing team data (optional)
   */
  async clearExistingTeamData() {
    const tables = [
      'team_analytics', 'team_collaboration_metrics', 'team_workflow_optimizations',
      'team_invitations', 'team_projects', 'team_members', 'teams'
    ];
    
    for (const table of tables) {
      try {
        this.db.exec(`DELETE FROM ${table} WHERE is_mock_data = TRUE`);
      } catch (error) {
        // Table might not exist, continue
      }
    }
  }

  /**
   * Create extended team tables
   */
  createExtendedTeamTables() {
    this.db.exec(`
      -- Team invitations table
      CREATE TABLE IF NOT EXISTS team_invitations (
        id TEXT PRIMARY KEY,
        teamId TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        invitedBy INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        invitedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        acceptedAt TEXT,
        expiresAt TEXT,
        is_mock_data BOOLEAN DEFAULT FALSE,
        mock_data_category TEXT DEFAULT NULL,
        mock_data_created_at TEXT DEFAULT NULL,
        FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (invitedBy) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Team projects table
      CREATE TABLE IF NOT EXISTS team_projects (
        id TEXT PRIMARY KEY,
        teamId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'planning',
        progress INTEGER DEFAULT 0,
        startDate TEXT,
        dueDate TEXT,
        priority TEXT DEFAULT 'medium',
        budget REAL DEFAULT 0,
        spent REAL DEFAULT 0,
        leadId INTEGER,
        memberIds TEXT DEFAULT '[]',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        is_mock_data BOOLEAN DEFAULT FALSE,
        mock_data_category TEXT DEFAULT NULL,
        mock_data_created_at TEXT DEFAULT NULL,
        FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (leadId) REFERENCES users(id) ON DELETE SET NULL
      );

      -- Team analytics table
      CREATE TABLE IF NOT EXISTS team_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teamId TEXT NOT NULL,
        metricType TEXT NOT NULL,
        metricValue REAL NOT NULL,
        period TEXT NOT NULL,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT DEFAULT '{}',
        is_mock_data BOOLEAN DEFAULT FALSE,
        mock_data_category TEXT DEFAULT NULL,
        mock_data_created_at TEXT DEFAULT NULL,
        FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE
      );

      -- Team collaboration metrics table
      CREATE TABLE IF NOT EXISTS team_collaboration_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teamId TEXT NOT NULL,
        date TEXT NOT NULL,
        messages INTEGER DEFAULT 0,
        meetings INTEGER DEFAULT 0,
        collaborations INTEGER DEFAULT 0,
        efficiency REAL DEFAULT 0,
        satisfaction REAL DEFAULT 0,
        is_mock_data BOOLEAN DEFAULT FALSE,
        mock_data_category TEXT DEFAULT NULL,
        mock_data_created_at TEXT DEFAULT NULL,
        FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE
      );

      -- Team workflow optimizations table
      CREATE TABLE IF NOT EXISTS team_workflow_optimizations (
        id TEXT PRIMARY KEY,
        teamId TEXT NOT NULL,
        workflowName TEXT NOT NULL,
        currentEfficiency REAL DEFAULT 0,
        optimizedEfficiency REAL DEFAULT 0,
        status TEXT DEFAULT 'pending',
        bottlenecks TEXT DEFAULT '[]',
        suggestions TEXT DEFAULT '[]',
        impact TEXT DEFAULT 'medium',
        implementationEffort TEXT DEFAULT 'medium',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        is_mock_data BOOLEAN DEFAULT FALSE,
        mock_data_category TEXT DEFAULT NULL,
        mock_data_created_at TEXT DEFAULT NULL,
        FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_team_invitations_team ON team_invitations(teamId);
      CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
      CREATE INDEX IF NOT EXISTS idx_team_projects_team ON team_projects(teamId);
      CREATE INDEX IF NOT EXISTS idx_team_analytics_team_type ON team_analytics(teamId, metricType);
      CREATE INDEX IF NOT EXISTS idx_team_collaboration_team_date ON team_collaboration_metrics(teamId, date);
      CREATE INDEX IF NOT EXISTS idx_team_workflow_team ON team_workflow_optimizations(teamId);
    `);
  }

  /**
   * Seed teams with realistic data
   */
  async seedTeams() {
    this.createExtendedTeamTables();
    
    const teams = [];
    const departments = [
      'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Customer Success',
      'Data Science', 'DevOps', 'QA', 'Security', 'HR', 'Finance'
    ];
    
    const subscriptionTiers = ['team', 'enterprise'];
    
    // Create 50 teams across different departments
    for (let i = 0; i < 50; i++) {
      const department = faker.helpers.arrayElement(departments);
      const teamNumber = Math.floor(i / departments.length) + 1;
      
      const team = {
        id: `team_${String(i + 1).padStart(3, '0')}`,
        name: teamNumber > 1 ? `${department} Team ${teamNumber}` : `${department} Team`,
        description: faker.company.catchPhrase(),
        ownerId: faker.number.int({ min: 1, max: 6 }), // Use existing demo users as owners
        subscriptionTier: faker.helpers.arrayElement(subscriptionTiers),
        settings: JSON.stringify({
          allowMemberInvites: faker.datatype.boolean(),
          requireApprovalForProjects: faker.datatype.boolean(),
          defaultMemberRole: faker.helpers.arrayElement(['member', 'contributor']),
          workingHours: {
            start: '09:00',
            end: '17:00',
            timezone: faker.location.timeZone()
          }
        }),
        createdAt: faker.date.between({ 
          from: new Date('2023-01-01'), 
          to: new Date() 
        }).toISOString(),
        is_mock_data: true,
        mock_data_category: 'team_management',
        mock_data_created_at: this.mockDataTimestamp
      };
      
      teams.push(team);
    }
    
    // Insert teams
    const insertTeam = this.db.prepare(`
      INSERT INTO teams (
        id, name, description, ownerId, settings, createdAt,
        is_mock_data, mock_data_category, mock_data_created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    teams.forEach(team => {
      insertTeam.run(
        team.id, team.name, team.description, team.ownerId,
        team.settings, team.createdAt, team.is_mock_data,
        team.mock_data_category, team.mock_data_created_at
      );
    });
    
    console.log(`✅ Seeded ${teams.length} teams`);
    return teams;
  }

  /**
   * Seed team members with realistic distributions
   */
  async seedTeamMembers(teams) {
    const members = [];
    const roles = ['owner', 'admin', 'manager', 'member', 'contributor'];
    const roleWeights = [0.05, 0.1, 0.15, 0.6, 0.1]; // Distribution weights
    
    // Create additional users for team members (beyond the 6 demo users)
    const additionalUsers = [];
    for (let i = 0; i < 200; i++) {
      const user = {
        email: faker.internet.email(),
        username: faker.internet.userName(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        passwordHash: '$2a$12$dummy.hash.for.demo.users.only',
        role: 'user',
        subscriptionTier: faker.helpers.arrayElement(['free', 'individual_pro', 'team']),
        isActive: 1,
        isVerified: faker.datatype.boolean() ? 1 : 0,
        permissions: JSON.stringify(['team.basic']),
        profile: JSON.stringify({
          bio: faker.person.bio(),
          skills: faker.helpers.arrayElements([
            'JavaScript', 'Python', 'React', 'Node.js', 'Design', 'Marketing',
            'Sales', 'Analytics', 'Project Management', 'Leadership'
          ], { min: 2, max: 5 }),
          avatar: faker.image.avatar()
        }),
        createdAt: faker.date.between({ 
          from: new Date('2023-01-01'), 
          to: new Date() 
        }).toISOString(),
        is_mock_data: true,
        mock_data_category: 'team_management',
        mock_data_created_at: this.mockDataTimestamp
      };
      additionalUsers.push(user);
    }
    
    // Insert additional users
    const insertUser = this.db.prepare(`
      INSERT INTO users (
        email, username, firstName, lastName, passwordHash, role,
        subscriptionTier, isActive, isVerified, permissions, profile,
        createdAt, is_mock_data, mock_data_category, mock_data_created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    additionalUsers.forEach(user => {
      insertUser.run(
        user.email, user.username, user.firstName, user.lastName,
        user.passwordHash, user.role, user.subscriptionTier, user.isActive,
        user.isVerified, user.permissions, user.profile, user.createdAt,
        user.is_mock_data, user.mock_data_category, user.mock_data_created_at
      );
    });
    
    // Get all user IDs (including new ones)
    const allUsers = this.db.prepare('SELECT id FROM users ORDER BY id').all();
    const userIds = allUsers.map(u => u.id);
    
    // Assign members to teams
    teams.forEach(team => {
      const teamSize = faker.number.int({ min: 3, max: 15 });
      const selectedUsers = faker.helpers.arrayElements(userIds, teamSize);
      
      // Ensure team owner is included
      if (!selectedUsers.includes(team.ownerId)) {
        selectedUsers[0] = team.ownerId;
      }
      
      selectedUsers.forEach((userId, index) => {
        let role;
        if (userId === team.ownerId) {
          role = 'owner';
        } else {
          // Weighted random role selection
          const random = Math.random();
          let cumulative = 0;
          role = 'member'; // default
          
          for (let i = 0; i < roles.length; i++) {
            cumulative += roleWeights[i];
            if (random <= cumulative) {
              role = roles[i];
              break;
            }
          }
        }
        
        const member = {
          teamId: team.id,
          userId: userId,
          role: role,
          joinedAt: faker.date.between({ 
            from: new Date(team.createdAt), 
            to: new Date() 
          }).toISOString(),
          is_mock_data: true,
          mock_data_category: 'team_management',
          mock_data_created_at: this.mockDataTimestamp
        };
        
        members.push(member);
      });
    });
    
    // Insert team members
    const insertMember = this.db.prepare(`
      INSERT OR IGNORE INTO team_members (
        teamId, userId, role, joinedAt,
        is_mock_data, mock_data_category, mock_data_created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    members.forEach(member => {
      insertMember.run(
        member.teamId, member.userId, member.role, member.joinedAt,
        member.is_mock_data, member.mock_data_category, member.mock_data_created_at
      );
    });
    
    console.log(`✅ Seeded ${additionalUsers.length} additional users and ${members.length} team memberships`);
    return members;
  }

  /**
   * Seed team projects
   */
  async seedTeamProjects(teams, members) {
    const projects = [];
    const projectTypes = [
      'Website Redesign', 'Mobile App', 'API Development', 'Database Migration',
      'Marketing Campaign', 'Product Launch', 'Security Audit', 'Performance Optimization',
      'User Research', 'Feature Development', 'Bug Fixes', 'Documentation Update'
    ];
    
    const statuses = ['planning', 'in_progress', 'review', 'completed', 'on_hold'];
    const priorities = ['low', 'medium', 'high', 'critical'];
    
    // Create 3-8 projects per team
    teams.forEach(team => {
      const projectCount = faker.number.int({ min: 3, max: 8 });
      const teamMembers = members.filter(m => m.teamId === team.id);
      
      for (let i = 0; i < projectCount; i++) {
        const status = faker.helpers.arrayElement(statuses);
        const startDate = faker.date.between({ 
          from: new Date(team.createdAt), 
          to: new Date() 
        });
        
        const project = {
          id: `proj_${team.id}_${String(i + 1).padStart(2, '0')}`,
          teamId: team.id,
          name: `${faker.helpers.arrayElement(projectTypes)} ${i + 1}`,
          description: faker.lorem.paragraph(),
          status: status,
          progress: status === 'completed' ? 100 : 
                  status === 'in_progress' ? faker.number.int({ min: 20, max: 80 }) :
                  status === 'review' ? faker.number.int({ min: 80, max: 95 }) :
                  faker.number.int({ min: 0, max: 20 }),
          startDate: startDate.toISOString(),
          dueDate: faker.date.future({ refDate: startDate }).toISOString(),
          priority: faker.helpers.arrayElement(priorities),
          budget: faker.number.float({ min: 10000, max: 500000, precision: 100 }),
          spent: faker.number.float({ min: 1000, max: 50000, precision: 100 }),
          leadId: faker.helpers.arrayElement(teamMembers).userId,
          memberIds: JSON.stringify(
            faker.helpers.arrayElements(
              teamMembers.map(m => m.userId), 
              { min: 2, max: Math.min(5, teamMembers.length) }
            )
          ),
          createdAt: startDate.toISOString(),
          updatedAt: faker.date.between({ from: startDate, to: new Date() }).toISOString(),
          is_mock_data: true,
          mock_data_category: 'team_management',
          mock_data_created_at: this.mockDataTimestamp
        };
        
        projects.push(project);
      }
    });
    
    // Insert projects
    const insertProject = this.db.prepare(`
      INSERT INTO team_projects (
        id, teamId, name, description, status, progress, startDate, dueDate,
        priority, budget, spent, leadId, memberIds, createdAt, updatedAt,
        is_mock_data, mock_data_category, mock_data_created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    projects.forEach(project => {
      insertProject.run(
        project.id, project.teamId, project.name, project.description,
        project.status, project.progress, project.startDate, project.dueDate,
        project.priority, project.budget, project.spent, project.leadId,
        project.memberIds, project.createdAt, project.updatedAt,
        project.is_mock_data, project.mock_data_category, project.mock_data_created_at
      );
    });
    
    console.log(`✅ Seeded ${projects.length} team projects`);
    return projects;
  }

  /**
   * Seed team invitations
   */
  async seedTeamInvitations(teams) {
    const invitations = [];
    const statuses = ['pending', 'accepted', 'declined', 'expired'];
    const roles = ['member', 'contributor', 'manager'];
    
    // Create 2-5 invitations per team
    teams.forEach(team => {
      const invitationCount = faker.number.int({ min: 2, max: 5 });
      
      for (let i = 0; i < invitationCount; i++) {
        const invitedAt = faker.date.between({ 
          from: new Date(team.createdAt), 
          to: new Date() 
        });
        
        const invitation = {
          id: `inv_${team.id}_${String(i + 1).padStart(2, '0')}`,
          teamId: team.id,
          email: faker.internet.email(),
          role: faker.helpers.arrayElement(roles),
          invitedBy: team.ownerId,
          status: faker.helpers.arrayElement(statuses),
          invitedAt: invitedAt.toISOString(),
          acceptedAt: faker.datatype.boolean() ? 
            faker.date.between({ from: invitedAt, to: new Date() }).toISOString() : null,
          expiresAt: faker.date.future({ refDate: invitedAt }).toISOString(),
          is_mock_data: true,
          mock_data_category: 'team_management',
          mock_data_created_at: this.mockDataTimestamp
        };
        
        invitations.push(invitation);
      }
    });
    
    // Insert invitations
    const insertInvitation = this.db.prepare(`
      INSERT INTO team_invitations (
        id, teamId, email, role, invitedBy, status, invitedAt,
        acceptedAt, expiresAt, is_mock_data, mock_data_category, mock_data_created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    invitations.forEach(invitation => {
      insertInvitation.run(
        invitation.id, invitation.teamId, invitation.email, invitation.role,
        invitation.invitedBy, invitation.status, invitation.invitedAt,
        invitation.acceptedAt, invitation.expiresAt, invitation.is_mock_data,
        invitation.mock_data_category, invitation.mock_data_created_at
      );
    });
    
    console.log(`✅ Seeded ${invitations.length} team invitations`);
    return invitations;
  }

  /**
   * Seed team analytics data
   */
  async seedTeamAnalytics(teams, members) {
    const analytics = [];
    const metricTypes = [
      'productivity', 'collaboration', 'satisfaction', 'velocity',
      'burnout_risk', 'innovation_score', 'meeting_efficiency',
      'knowledge_sharing', 'response_time', 'task_completion'
    ];
    
    const periods = ['daily', 'weekly', 'monthly'];
    
    // Generate analytics for last 90 days
    teams.forEach(team => {
      const teamMemberCount = members.filter(m => m.teamId === team.id).length;
      
      for (let days = 0; days < 90; days++) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        
        metricTypes.forEach(metricType => {
          periods.forEach(period => {
            const baseValue = this.getBaseMetricValue(metricType, teamMemberCount);
            const variance = faker.number.float({ min: -0.2, max: 0.2 });
            const metricValue = Math.max(0, Math.min(100, baseValue + (baseValue * variance)));
            
            const analytic = {
              teamId: team.id,
              metricType: metricType,
              metricValue: Math.round(metricValue * 100) / 100,
              period: period,
              timestamp: date.toISOString(),
              metadata: JSON.stringify({
                teamSize: teamMemberCount,
                calculatedAt: new Date().toISOString(),
                factors: faker.helpers.arrayElements([
                  'team_size', 'project_complexity', 'workload', 'experience_level'
                ], { min: 1, max: 3 })
              }),
              is_mock_data: true,
              mock_data_category: 'team_management',
              mock_data_created_at: this.mockDataTimestamp
            };
            
            analytics.push(analytic);
          });
        });
      }
    });
    
    // Insert analytics
    const insertAnalytic = this.db.prepare(`
      INSERT INTO team_analytics (
        teamId, metricType, metricValue, period, timestamp, metadata,
        is_mock_data, mock_data_category, mock_data_created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    analytics.forEach(analytic => {
      insertAnalytic.run(
        analytic.teamId, analytic.metricType, analytic.metricValue,
        analytic.period, analytic.timestamp, analytic.metadata,
        analytic.is_mock_data, analytic.mock_data_category, analytic.mock_data_created_at
      );
    });
    
    console.log(`✅ Seeded ${analytics.length} team analytics records`);
    return analytics;
  }

  /**
   * Seed collaboration metrics
   */
  async seedCollaborationData(teams, members) {
    const collaborationMetrics = [];
    
    // Generate daily collaboration data for last 30 days
    teams.forEach(team => {
      const teamMemberCount = members.filter(m => m.teamId === team.id).length;
      
      for (let days = 0; days < 30; days++) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        
        const metric = {
          teamId: team.id,
          date: date.toISOString().split('T')[0],
          messages: faker.number.int({ min: 50, max: 300 }) * teamMemberCount,
          meetings: faker.number.int({ min: 1, max: 8 }),
          collaborations: faker.number.int({ min: 10, max: 60 }),
          efficiency: faker.number.float({ min: 65, max: 95, precision: 0.1 }),
          satisfaction: faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }),
          is_mock_data: true,
          mock_data_category: 'team_management',
          mock_data_created_at: this.mockDataTimestamp
        };
        
        collaborationMetrics.push(metric);
      }
    });
    
    // Insert collaboration metrics
    const insertMetric = this.db.prepare(`
      INSERT INTO team_collaboration_metrics (
        teamId, date, messages, meetings, collaborations, efficiency, satisfaction,
        is_mock_data, mock_data_category, mock_data_created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    collaborationMetrics.forEach(metric => {
      insertMetric.run(
        metric.teamId, metric.date, metric.messages, metric.meetings,
        metric.collaborations, metric.efficiency, metric.satisfaction,
        metric.is_mock_data, metric.mock_data_category, metric.mock_data_created_at
      );
    });
    
    console.log(`✅ Seeded ${collaborationMetrics.length} collaboration metrics`);
    return collaborationMetrics;
  }

  /**
   * Seed workflow optimizations
   */
  async seedWorkflowOptimizations(teams, members) {
    const optimizations = [];
    const workflowTypes = [
      'Code Review Process', 'Sprint Planning', 'Design Handoff',
      'Customer Feedback Processing', 'Marketing Campaign Planning',
      'Bug Triage', 'Release Management', 'Onboarding Process'
    ];
    
    const statuses = ['pending', 'in-progress', 'optimized', 'rejected'];
    const impacts = ['low', 'medium', 'high'];
    const efforts = ['low', 'medium', 'high'];
    
    // Create 3-6 workflow optimizations per team
    teams.forEach(team => {
      const optimizationCount = faker.number.int({ min: 3, max: 6 });
      
      for (let i = 0; i < optimizationCount; i++) {
        const currentEfficiency = faker.number.float({ min: 45, max: 85, precision: 0.1 });
        const improvement = faker.number.float({ min: 5, max: 25, precision: 0.1 });
        
        const optimization = {
          id: `opt_${team.id}_${String(i + 1).padStart(2, '0')}`,
          teamId: team.id,
          workflowName: faker.helpers.arrayElement(workflowTypes),
          currentEfficiency: currentEfficiency,
          optimizedEfficiency: Math.min(95, currentEfficiency + improvement),
          status: faker.helpers.arrayElement(statuses),
          bottlenecks: JSON.stringify(faker.helpers.arrayElements([
            'Manual approval delays', 'Information silos', 'Tool switching',
            'Communication gaps', 'Resource conflicts', 'Process complexity'
          ], { min: 1, max: 3 })),
          suggestions: JSON.stringify(faker.helpers.arrayElements([
            'Implement automated workflows', 'Improve tool integration',
            'Streamline approval process', 'Enhance communication channels',
            'Optimize resource allocation', 'Simplify procedures'
          ], { min: 2, max: 4 })),
          impact: faker.helpers.arrayElement(impacts),
          implementationEffort: faker.helpers.arrayElement(efforts),
          createdAt: faker.date.between({ 
            from: new Date(team.createdAt), 
            to: new Date() 
          }).toISOString(),
          updatedAt: faker.date.recent().toISOString(),
          is_mock_data: true,
          mock_data_category: 'team_management',
          mock_data_created_at: this.mockDataTimestamp
        };
        
        optimizations.push(optimization);
      }
    });
    
    // Insert workflow optimizations
    const insertOptimization = this.db.prepare(`
      INSERT INTO team_workflow_optimizations (
        id, teamId, workflowName, currentEfficiency, optimizedEfficiency,
        status, bottlenecks, suggestions, impact, implementationEffort,
        createdAt, updatedAt, is_mock_data, mock_data_category, mock_data_created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    optimizations.forEach(optimization => {
      insertOptimization.run(
        optimization.id, optimization.teamId, optimization.workflowName,
        optimization.currentEfficiency, optimization.optimizedEfficiency,
        optimization.status, optimization.bottlenecks, optimization.suggestions,
        optimization.impact, optimization.implementationEffort,
        optimization.createdAt, optimization.updatedAt, optimization.is_mock_data,
        optimization.mock_data_category, optimization.mock_data_created_at
      );
    });
    
    console.log(`✅ Seeded ${optimizations.length} workflow optimizations`);
    return optimizations;
  }

  /**
   * Seed team skills data
   */
  async seedTeamSkills(members) {
    const teamSkills = [];
    const skillCategories = {
      'technical': ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Kubernetes'],
      'design': ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
      'leadership': ['Project Management', 'Team Leadership', 'Strategic Planning', 'Mentoring'],
      'communication': ['Public Speaking', 'Technical Writing', 'Stakeholder Management', 'Negotiation'],
      'analytics': ['Data Analysis', 'Machine Learning', 'Statistics', 'Business Intelligence']
    };
    
    // Ensure skills exist in database
    Object.entries(skillCategories).forEach(([category, skills]) => {
      skills.forEach(skillName => {
        try {
          this.db.prepare(`
            INSERT OR IGNORE INTO skills (name, category, description, is_mock_data, mock_data_category, mock_data_created_at)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(
            skillName,
            category,
            faker.lorem.sentence(),
            true,
            'team_management',
            this.mockDataTimestamp
          );
        } catch (error) {
          // Skill might already exist
        }
      });
    });
    
    // Assign skills to team members
    members.forEach(member => {
      const skillCount = faker.number.int({ min: 2, max: 6 });
      const allSkills = Object.values(skillCategories).flat();
      const memberSkills = faker.helpers.arrayElements(allSkills, skillCount);
      
      memberSkills.forEach(skillName => {
        const skill = this.db.prepare('SELECT id FROM skills WHERE name = ?').get(skillName);
        if (skill) {
          try {
            this.db.prepare(`
              INSERT OR IGNORE INTO user_skills (
                userId, skillId, level, verified, lastUpdated,
                is_mock_data, mock_data_category, mock_data_created_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              member.userId,
              skill.id,
              faker.number.int({ min: 1, max: 5 }),
              faker.datatype.boolean() ? 1 : 0,
              faker.date.recent().toISOString(),
              true,
              'team_management',
              this.mockDataTimestamp
            );
          } catch (error) {
            // Skill assignment might already exist
          }
        }
      });
    });
    
    console.log(`✅ Seeded team skills for ${members.length} members`);
    return teamSkills;
  }

  /**
   * Seed mentorship programs
   */
  async seedMentorshipPrograms(members) {
    const mentorships = [];
    const goals = [
      'Improve technical skills', 'Career development', 'Leadership training',
      'Project management', 'Communication skills', 'Domain expertise'
    ];
    
    const statuses = ['pending', 'active', 'completed', 'paused'];
    
    // Create mentorship relationships (about 20% of members)
    const mentorshipCount = Math.floor(members.length * 0.2);
    
    for (let i = 0; i < mentorshipCount; i++) {
      const mentor = faker.helpers.arrayElement(members.filter(m =>
        ['owner', 'admin', 'manager'].includes(m.role)
      ));
      const mentee = faker.helpers.arrayElement(members.filter(m =>
        m.userId !== mentor.userId && ['member', 'contributor'].includes(m.role)
      ));
      
      if (mentor && mentee) {
        const startDate = faker.date.between({
          from: new Date('2023-06-01'),
          to: new Date()
        });
        
        const mentorship = {
          mentorId: mentor.userId,
          menteeId: mentee.userId,
          status: faker.helpers.arrayElement(statuses),
          startDate: startDate.toISOString(),
          endDate: faker.datatype.boolean() ?
            faker.date.future({ refDate: startDate }).toISOString() : null,
          goals: JSON.stringify(faker.helpers.arrayElements(goals, { min: 2, max: 4 })),
          progress: faker.number.int({ min: 0, max: 100 }),
          sessionsCompleted: faker.number.int({ min: 0, max: 20 }),
          nextSession: faker.date.future().toISOString(),
          satisfaction: faker.number.float({ min: 3.0, max: 5.0, precision: 0.1 }),
          createdAt: startDate.toISOString(),
          updatedAt: faker.date.recent().toISOString(),
          is_mock_data: true,
          mock_data_category: 'team_management',
          mock_data_created_at: this.mockDataTimestamp
        };
        
        mentorships.push(mentorship);
      }
    }
    
    // Insert mentorships
    const insertMentorship = this.db.prepare(`
      INSERT OR IGNORE INTO mentorship_relationships (
        mentorId, menteeId, status, startDate, endDate, goals, progress,
        sessionsCompleted, nextSession, satisfaction, createdAt, updatedAt,
        is_mock_data, mock_data_category, mock_data_created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    mentorships.forEach(mentorship => {
      insertMentorship.run(
        mentorship.mentorId, mentorship.menteeId, mentorship.status,
        mentorship.startDate, mentorship.endDate, mentorship.goals,
        mentorship.progress, mentorship.sessionsCompleted, mentorship.nextSession,
        mentorship.satisfaction, mentorship.createdAt, mentorship.updatedAt,
        mentorship.is_mock_data, mentorship.mock_data_category, mentorship.mock_data_created_at
      );
    });
    
    console.log(`✅ Seeded ${mentorships.length} mentorship relationships`);
    return mentorships;
  }

  /**
   * Seed team metrics and KPIs
   */
  async seedTeamMetrics(teams, members) {
    const metrics = [];
    const kpiTypes = [
      'sprint_velocity', 'code_quality', 'bug_resolution_time', 'customer_satisfaction',
      'team_retention', 'knowledge_sharing_index', 'innovation_rate', 'delivery_predictability'
    ];
    
    // Generate monthly metrics for each team for the last 12 months
    teams.forEach(team => {
      const teamMemberCount = members.filter(m => m.teamId === team.id).length;
      
      for (let month = 0; month < 12; month++) {
        const date = new Date();
        date.setMonth(date.getMonth() - month);
        
        kpiTypes.forEach(kpiType => {
          const baseValue = this.getBaseKPIValue(kpiType, teamMemberCount);
          const seasonalVariance = this.getSeasonalVariance(month, kpiType);
          const randomVariance = faker.number.float({ min: -0.15, max: 0.15 });
          
          const metricValue = Math.max(0,
            baseValue + (baseValue * seasonalVariance) + (baseValue * randomVariance)
          );
          
          const metric = {
            teamId: team.id,
            metricType: kpiType,
            metricValue: Math.round(metricValue * 100) / 100,
            period: 'monthly',
            timestamp: date.toISOString(),
            metadata: JSON.stringify({
              teamSize: teamMemberCount,
              month: date.getMonth() + 1,
              year: date.getFullYear(),
              trend: this.calculateTrend(metricValue, baseValue),
              benchmark: this.getIndustryBenchmark(kpiType)
            }),
            is_mock_data: true,
            mock_data_category: 'team_management',
            mock_data_created_at: this.mockDataTimestamp
          };
          
          metrics.push(metric);
        });
      }
    });
    
    // Insert metrics
    const insertMetric = this.db.prepare(`
      INSERT INTO team_analytics (
        teamId, metricType, metricValue, period, timestamp, metadata,
        is_mock_data, mock_data_category, mock_data_created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    metrics.forEach(metric => {
      insertMetric.run(
        metric.teamId, metric.metricType, metric.metricValue,
        metric.period, metric.timestamp, metric.metadata,
        metric.is_mock_data, metric.mock_data_category, metric.mock_data_created_at
      );
    });
    
    console.log(`✅ Seeded ${metrics.length} team KPI metrics`);
    return metrics;
  }

  /**
   * Helper method to get base metric values
   */
  getBaseMetricValue(metricType, teamSize) {
    const baseValues = {
      'productivity': 75 + (teamSize * 2),
      'collaboration': 80 - (teamSize * 0.5),
      'satisfaction': 4.2,
      'velocity': 70 + (teamSize * 1.5),
      'burnout_risk': Math.max(10, 30 - (teamSize * 2)),
      'innovation_score': 65 + (teamSize * 1.2),
      'meeting_efficiency': 75,
      'knowledge_sharing': 70 + (teamSize * 1.8),
      'response_time': Math.max(1, 5 - (teamSize * 0.3)),
      'task_completion': 85
    };
    
    return baseValues[metricType] || 70;
  }

  /**
   * Helper method to get base KPI values
   */
  getBaseKPIValue(kpiType, teamSize) {
    const baseValues = {
      'sprint_velocity': 20 + (teamSize * 3),
      'code_quality': 85,
      'bug_resolution_time': Math.max(1, 8 - teamSize),
      'customer_satisfaction': 4.3,
      'team_retention': 92,
      'knowledge_sharing_index': 70 + (teamSize * 2),
      'innovation_rate': 15 + teamSize,
      'delivery_predictability': 80
    };
    
    return baseValues[kpiType] || 75;
  }

  /**
   * Helper method to get seasonal variance
   */
  getSeasonalVariance(monthsAgo, metricType) {
    const currentMonth = new Date().getMonth();
    const targetMonth = (currentMonth - monthsAgo + 12) % 12;
    
    // Some metrics have seasonal patterns
    const seasonalPatterns = {
      'productivity': [0.1, 0.05, 0, -0.05, -0.1, -0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15],
      'satisfaction': [0.05, 0, -0.05, -0.1, -0.05, 0, 0.1, 0.05, 0, -0.05, 0, 0.1],
      'burnout_risk': [-0.1, -0.05, 0, 0.1, 0.15, 0.2, 0.1, 0.05, 0, -0.05, -0.1, -0.15]
    };
    
    return seasonalPatterns[metricType] ? seasonalPatterns[metricType][targetMonth] : 0;
  }

  /**
   * Helper method to calculate trend
   */
  calculateTrend(currentValue, baseValue) {
    const difference = ((currentValue - baseValue) / baseValue) * 100;
    if (difference > 5) return 'increasing';
    if (difference < -5) return 'decreasing';
    return 'stable';
  }

  /**
   * Helper method to get industry benchmarks
   */
  getIndustryBenchmark(kpiType) {
    const benchmarks = {
      'sprint_velocity': 25,
      'code_quality': 90,
      'bug_resolution_time': 5,
      'customer_satisfaction': 4.5,
      'team_retention': 95,
      'knowledge_sharing_index': 75,
      'innovation_rate': 20,
      'delivery_predictability': 85
    };
    
    return benchmarks[kpiType] || 80;
  }
}

module.exports = TeamDataSeeder;