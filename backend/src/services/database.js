const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const redisService = require('./redis');
const performanceMonitor = require('./performance');

class DatabaseService {
  constructor() {
    // Create database file in backend directory
    const dbPath = path.join(__dirname, '../../data/digame.db');
    this.db = new Database(dbPath);
    this.initializeExtendedSchema();
    this.initializeDemoUsers();
    this.seedExtendedData();
  }

  initializeExtendedSchema() {
    console.log('🔧 Initializing extended database schema...');
    
    // Core tables (already implemented)
    this.initializeUserTables();
    
    // Feature-specific tables
    this.initializeNotificationTables();
    this.initializeTaskTables();
    this.initializeTeamTables();
    this.initializeWorkflowTables();
    this.initializeAnalyticsTables();
    this.initializeSecurityTables();
    this.initializeReportTables();
    this.initializePlatformTables();
    
    console.log('✅ Extended schema initialization complete');
  }

  initializeUserTables() {
    // Create users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        passwordHash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        subscriptionTier TEXT DEFAULT 'free',
        teamId TEXT,
        permissions TEXT DEFAULT '[]',
        isPlatformOwner INTEGER DEFAULT 0,
        isActive INTEGER DEFAULT 1,
        isVerified INTEGER DEFAULT 0,
        onboardingCompleted INTEGER DEFAULT 0,
        onboardingData TEXT DEFAULT '{}',
        unlockedFeatures TEXT DEFAULT '[]',
        lastLogin TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        profile TEXT DEFAULT '{}',
        preferences TEXT DEFAULT '{}',
        metadata TEXT DEFAULT '{}'
      )
    `);

    // Add unlockedFeatures column if it doesn't exist (for existing databases)
    try {
      this.db.exec(`ALTER TABLE users ADD COLUMN unlockedFeatures TEXT DEFAULT '[]'`);
    } catch (error) {
      // Column already exists, ignore error
      if (!error.message.includes('duplicate column name')) {
        console.warn('Database migration warning:', error.message);
      }
    }

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscriptionTier);
    `);
  }

  initializeNotificationTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        category TEXT DEFAULT 'system',
        priority TEXT DEFAULT 'medium',
        read INTEGER DEFAULT 0,
        readAt TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        actionUrl TEXT,
        actionText TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE TABLE IF NOT EXISTS notification_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL UNIQUE,
        emailNotifications INTEGER DEFAULT 1,
        pushNotifications INTEGER DEFAULT 1,
        inAppNotifications INTEGER DEFAULT 1,
        weeklyDigest INTEGER DEFAULT 1,
        instantAlerts INTEGER DEFAULT 0,
        quietHoursEnabled INTEGER DEFAULT 0,
        quietHoursStart TEXT DEFAULT '22:00',
        quietHoursEnd TEXT DEFAULT '08:00',
        categories TEXT DEFAULT '{}',
        priorities TEXT DEFAULT '{}',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(userId, read);
      CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON notifications(timestamp);
    `);
  }

  initializeTaskTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        category TEXT DEFAULT 'general',
        dueDate TEXT,
        estimatedTime INTEGER,
        completedTime INTEGER,
        tags TEXT DEFAULT '[]',
        source TEXT DEFAULT 'manual',
        suggestionId INTEGER,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        completedAt TEXT,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'planning',
        progress INTEGER DEFAULT 0,
        startDate TEXT,
        dueDate TEXT,
        teamMembers TEXT DEFAULT '[]',
        priority TEXT DEFAULT 'medium',
        budget REAL DEFAULT 0,
        spent REAL DEFAULT 0,
        createdBy INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(userId, status);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(dueDate);
      CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(createdBy);
    `);
  }

  initializeTeamTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        ownerId INTEGER NOT NULL,
        settings TEXT DEFAULT '{}',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS team_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        teamId TEXT NOT NULL,
        userId INTEGER NOT NULL,
        role TEXT DEFAULT 'member',
        joinedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(teamId, userId)
      );

      CREATE TABLE IF NOT EXISTS skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS user_skills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        skillId INTEGER NOT NULL,
        level INTEGER DEFAULT 1,
        verified INTEGER DEFAULT 0,
        lastUpdated TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (skillId) REFERENCES skills(id) ON DELETE CASCADE,
        UNIQUE(userId, skillId)
      );

      CREATE TABLE IF NOT EXISTS mentorship_relationships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mentorId INTEGER NOT NULL,
        menteeId INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        startDate TEXT,
        endDate TEXT,
        goals TEXT DEFAULT '[]',
        progress INTEGER DEFAULT 0,
        sessionsCompleted INTEGER DEFAULT 0,
        nextSession TEXT,
        satisfaction REAL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (mentorId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (menteeId) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(teamId);
      CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(userId);
      CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(userId);
      CREATE INDEX IF NOT EXISTS idx_mentorship_mentor ON mentorship_relationships(mentorId);
      CREATE INDEX IF NOT EXISTS idx_mentorship_mentee ON mentorship_relationships(menteeId);
    `);
  }

  initializeWorkflowTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS workflows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'general',
        status TEXT DEFAULT 'draft',
        triggers TEXT DEFAULT '[]',
        actions TEXT DEFAULT '[]',
        runs INTEGER DEFAULT 0,
        successRate REAL DEFAULT 0,
        lastRun TEXT,
        complexity TEXT DEFAULT 'medium',
        templateId INTEGER,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_workflows_user_status ON workflows(userId, status);
    `);
  }

  initializeAnalyticsTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        eventType TEXT NOT NULL,
        eventData TEXT DEFAULT '{}',
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        sessionId TEXT,
        userAgent TEXT,
        ipAddress TEXT,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_analytics_events_user_timestamp ON analytics_events(userId, timestamp);
      CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(eventType);
    `);
  }

  initializeSecurityTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        action TEXT NOT NULL,
        resource TEXT,
        resourceId TEXT,
        details TEXT DEFAULT '{}',
        ipAddress TEXT,
        userAgent TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS api_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        name TEXT NOT NULL,
        keyHash TEXT NOT NULL,
        permissions TEXT DEFAULT '[]',
        lastUsed TEXT,
        expiresAt TEXT,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS webhooks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        events TEXT DEFAULT '[]',
        secret TEXT,
        isActive INTEGER DEFAULT 1,
        lastTriggered TEXT,
        successCount INTEGER DEFAULT 0,
        failureCount INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(userId, timestamp);
      CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(userId);
      CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(userId);
    `);
  }

  initializeReportTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        config TEXT DEFAULT '{}',
        status TEXT DEFAULT 'draft',
        lastGenerated TEXT,
        schedule TEXT,
        recipients TEXT DEFAULT '[]',
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(userId);
      CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
    `);
  }

  initializePlatformTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS platform_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metricType TEXT NOT NULL,
        metricValue REAL NOT NULL,
        metadata TEXT DEFAULT '{}',
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tenants (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        domain TEXT UNIQUE,
        settings TEXT DEFAULT '{}',
        subscriptionTier TEXT DEFAULT 'team',
        isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_platform_metrics_type ON platform_metrics(metricType);
      CREATE INDEX IF NOT EXISTS idx_platform_metrics_timestamp ON platform_metrics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_tenants_domain ON tenants(domain);
    `);
  }

  initializeDemoUsers() {
    // Check if demo users already exist
    const existingUsers = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (existingUsers.count > 0) {
      return; // Demo users already exist
    }

    // Hash for demo password "demo123"
    const demoPasswordHash = bcrypt.hashSync('demo123', 12);
    // Hash for Platform Owner password
    const platformOwnerPasswordHash = bcrypt.hashSync('Dalk3y1306', 12);
    
    const demoUsers = [
      {
        email: 'philip.a.oshea@gmail.com',
        username: 'philip',
        firstName: 'Philip',
        lastName: 'O\'Shea',
        passwordHash: platformOwnerPasswordHash,
        role: 'platform_owner',
        subscriptionTier: 'platform_owner',
        teamId: null,
        isPlatformOwner: 1,
        isVerified: 1,
        permissions: JSON.stringify(['*']),
        profile: JSON.stringify({
          bio: 'Platform Owner with full system access',
          avatar: '/avatars/philip.png'
        })
      },
      {
        email: 'admin@digame.com',
        username: 'admin',
        firstName: 'Platform',
        lastName: 'Administrator',
        passwordHash: demoPasswordHash,
        role: 'admin',
        subscriptionTier: 'platform_owner',
        teamId: null,
        isPlatformOwner: 1,
        isVerified: 1,
        permissions: JSON.stringify(['*']),
        profile: JSON.stringify({
          bio: 'Platform Administrator with full system access',
          avatar: '/avatars/admin.png'
        })
      },
      {
        email: 'demo@digame.com',
        username: 'demo',
        firstName: 'Demo',
        lastName: 'User',
        passwordHash: demoPasswordHash,
        role: 'user',
        subscriptionTier: 'enterprise',
        teamId: null,
        isPlatformOwner: 0,
        isVerified: 1,
        permissions: JSON.stringify(['analytics.*', 'ai.*', 'social.*', 'team.*']),
        profile: JSON.stringify({
          bio: 'Demo user with enterprise access',
          avatar: '/avatars/demo.png'
        })
      },
      {
        email: 'team.lead@company.com',
        username: 'teamlead',
        firstName: 'Sarah',
        lastName: 'Johnson',
        passwordHash: demoPasswordHash,
        role: 'team_lead',
        subscriptionTier: 'team',
        teamId: 'team_001',
        isPlatformOwner: 0,
        isVerified: 1,
        permissions: JSON.stringify(['analytics.advanced', 'ai.basic', 'social.*', 'team.manage']),
        profile: JSON.stringify({
          bio: 'Team Lead focused on productivity and collaboration',
          avatar: '/avatars/sarah.png'
        })
      },
      {
        email: 'pro.user@freelancer.com',
        username: 'prouser',
        firstName: 'Mike',
        lastName: 'Chen',
        passwordHash: demoPasswordHash,
        role: 'user',
        subscriptionTier: 'individual_pro',
        teamId: null,
        isPlatformOwner: 0,
        isVerified: 1,
        permissions: JSON.stringify(['analytics.advanced', 'ai.coaching', 'social.networking']),
        profile: JSON.stringify({
          bio: 'Professional freelancer leveraging AI tools',
          avatar: '/avatars/mike.png'
        })
      },
      {
        email: 'free.user@example.com',
        username: 'freeuser',
        firstName: 'Alex',
        lastName: 'Smith',
        passwordHash: demoPasswordHash,
        role: 'user',
        subscriptionTier: 'free',
        teamId: null,
        isPlatformOwner: 0,
        isVerified: 0,
        permissions: JSON.stringify(['analytics.basic', 'social.basic']),
        profile: JSON.stringify({
          bio: 'New user exploring the platform',
          avatar: '/avatars/alex.png'
        })
      }
    ];

    const insertUser = this.db.prepare(`
      INSERT INTO users (
        email, username, firstName, lastName, passwordHash, role, 
        subscriptionTier, teamId, permissions, isPlatformOwner, 
        isVerified, profile
      ) VALUES (
        @email, @username, @firstName, @lastName, @passwordHash, @role,
        @subscriptionTier, @teamId, @permissions, @isPlatformOwner,
        @isVerified, @profile
      )
    `);

    demoUsers.forEach(user => {
      insertUser.run(user);
    });

    console.log('Demo users initialized in database');
  }

  seedExtendedData() {
    console.log('🌱 Seeding extended database with sample data...');
    
    // Check if extended data already exists
    try {
      const existingNotifications = this.db.prepare('SELECT COUNT(*) as count FROM notifications').get();
      if (existingNotifications.count > 0) {
        console.log('Extended data already exists, skipping seeding');
        return;
      }
    } catch (error) {
      // Tables don't exist yet, continue with seeding
    }
    
    // Seed notifications for demo users
    this.seedNotifications();
    
    // Seed tasks and projects
    this.seedTasksAndProjects();
    
    // Seed team data
    this.seedTeamData();
    
    // Seed workflows
    this.seedWorkflows();
    
    // Seed skills and mentorship
    this.seedSkillsAndMentorship();
    
    // Seed sample analytics events
    this.seedAnalyticsEvents();
    
    console.log('✅ Extended data seeding complete');
  }

  seedNotifications() {
    const notifications = [
      {
        id: 'notif_001',
        userId: 1, // Philip O'Shea
        title: 'Welcome to Digame!',
        message: 'Your Platform Owner account has been successfully created. You have full access to all platform features.',
        type: 'success',
        category: 'system',
        priority: 'high',
        read: 0,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/platform-owner/console',
        actionText: 'View Console'
      },
      {
        id: 'notif_002',
        userId: 3, // Demo user
        title: 'New Team Member Invitation',
        message: 'You have been invited to join the "Development Team" workspace.',
        type: 'info',
        category: 'team',
        priority: 'high',
        read: 0,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/team/invitations',
        actionText: 'View Invitation'
      },
      {
        id: 'notif_003',
        userId: 4, // Team lead
        title: 'Task Assignment',
        message: 'You have been assigned to "Website Redesign" project as team lead.',
        type: 'info',
        category: 'task',
        priority: 'medium',
        read: 1,
        readAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/tasks/projects',
        actionText: 'View Project'
      },
      {
        id: 'notif_004',
        userId: 5, // Pro user
        title: 'AI Tools Update',
        message: 'New AI-powered task suggestions are now available in your dashboard.',
        type: 'success',
        category: 'update',
        priority: 'low',
        read: 0,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        actionUrl: '/ai-tools',
        actionText: 'Explore Features'
      }
    ];
    
    const insertNotification = this.db.prepare(`
      INSERT OR IGNORE INTO notifications (
        id, userId, title, message, type, category, priority,
        read, readAt, timestamp, actionUrl, actionText
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    notifications.forEach(notif => {
      insertNotification.run(
        notif.id, notif.userId, notif.title, notif.message,
        notif.type, notif.category, notif.priority, notif.read,
        notif.readAt || null, notif.timestamp, notif.actionUrl, notif.actionText
      );
    });

    // Seed notification settings for demo users
    const notificationSettings = [
      { userId: 1, emailNotifications: 1, pushNotifications: 1, weeklyDigest: 1 },
      { userId: 2, emailNotifications: 1, pushNotifications: 1, weeklyDigest: 1 },
      { userId: 3, emailNotifications: 1, pushNotifications: 0, weeklyDigest: 1 },
      { userId: 4, emailNotifications: 1, pushNotifications: 1, weeklyDigest: 1 },
      { userId: 5, emailNotifications: 0, pushNotifications: 1, weeklyDigest: 0 },
      { userId: 6, emailNotifications: 1, pushNotifications: 0, weeklyDigest: 1 }
    ];

    const insertNotificationSettings = this.db.prepare(`
      INSERT OR IGNORE INTO notification_settings (
        userId, emailNotifications, pushNotifications, weeklyDigest
      ) VALUES (?, ?, ?, ?)
    `);

    notificationSettings.forEach(settings => {
      insertNotificationSettings.run(
        settings.userId, settings.emailNotifications,
        settings.pushNotifications, settings.weeklyDigest
      );
    });
  }

  seedTasksAndProjects() {
    // Sample tasks for different users
    const tasks = [
      {
        userId: 3, // Demo user
        title: 'Complete Q1 Performance Review',
        description: 'Prepare and submit quarterly performance metrics',
        status: 'in_progress',
        priority: 'high',
        category: 'work',
        dueDate: '2024-02-15',
        estimatedTime: 120,
        tags: JSON.stringify(['review', 'quarterly', 'metrics'])
      },
      {
        userId: 4, // Team lead
        title: 'Update project documentation',
        description: 'Review and update technical documentation for new features',
        status: 'completed',
        priority: 'medium',
        category: 'development',
        dueDate: '2024-01-12',
        estimatedTime: 90,
        completedTime: 85,
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        tags: JSON.stringify(['documentation', 'technical'])
      },
      {
        userId: 5, // Pro user
        title: 'Design new landing page',
        description: 'Create mockups and prototypes for the new landing page',
        status: 'pending',
        priority: 'medium',
        category: 'design',
        dueDate: '2024-02-20',
        estimatedTime: 180,
        tags: JSON.stringify(['design', 'ui', 'landing'])
      },
      {
        userId: 4, // Team lead
        title: 'Team meeting preparation',
        description: 'Prepare agenda and materials for weekly team sync',
        status: 'pending',
        priority: 'medium',
        category: 'meetings',
        dueDate: '2024-01-16',
        estimatedTime: 30,
        tags: JSON.stringify(['meeting', 'agenda', 'team'])
      }
    ];
    
    const insertTask = this.db.prepare(`
      INSERT OR IGNORE INTO tasks (
        userId, title, description, status, priority, category,
        dueDate, estimatedTime, completedTime, completedAt, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    tasks.forEach(task => {
      insertTask.run(
        task.userId, task.title, task.description, task.status,
        task.priority, task.category, task.dueDate, task.estimatedTime,
        task.completedTime || null, task.completedAt || null, task.tags
      );
    });
    
    // Sample projects
    const projects = [
      {
        name: 'Website Redesign',
        description: 'Complete overhaul of company website with modern design and improved UX',
        status: 'in_progress',
        progress: 68,
        startDate: '2024-01-01',
        dueDate: '2024-02-15',
        teamMembers: JSON.stringify([3, 4, 5]), // Demo users
        priority: 'high',
        budget: 50000,
        spent: 32000,
        createdBy: 4 // Team lead
      },
      {
        name: 'Mobile App Development',
        description: 'Native mobile app for iOS and Android platforms',
        status: 'planning',
        progress: 15,
        startDate: '2024-02-01',
        dueDate: '2024-06-30',
        teamMembers: JSON.stringify([4, 5]),
        priority: 'medium',
        budget: 120000,
        spent: 8500,
        createdBy: 1 // Platform owner
      }
    ];
    
    const insertProject = this.db.prepare(`
      INSERT OR IGNORE INTO projects (
        name, description, status, progress, startDate, dueDate,
        teamMembers, priority, budget, spent, createdBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    projects.forEach(project => {
      insertProject.run(
        project.name, project.description, project.status, project.progress,
        project.startDate, project.dueDate, project.teamMembers,
        project.priority, project.budget, project.spent, project.createdBy
      );
    });
  }

  seedTeamData() {
    // Sample teams
    const teams = [
      {
        id: 'team_001',
        name: 'Development Team',
        description: 'Core development team for platform features',
        ownerId: 4, // Team lead
        settings: JSON.stringify({
          allowGuestAccess: false,
          requireApproval: true,
          defaultRole: 'member'
        })
      },
      {
        id: 'team_002',
        name: 'Design Team',
        description: 'UI/UX design and creative team',
        ownerId: 5, // Pro user
        settings: JSON.stringify({
          allowGuestAccess: true,
          requireApproval: false,
          defaultRole: 'member'
        })
      }
    ];
    
    const insertTeam = this.db.prepare(`
      INSERT OR IGNORE INTO teams (id, name, description, ownerId, settings)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    teams.forEach(team => {
      insertTeam.run(team.id, team.name, team.description, team.ownerId, team.settings);
    });
    
    // Sample team members
    const teamMembers = [
      { teamId: 'team_001', userId: 4, role: 'owner' },
      { teamId: 'team_001', userId: 3, role: 'member' },
      { teamId: 'team_001', userId: 5, role: 'member' },
      { teamId: 'team_002', userId: 5, role: 'owner' },
      { teamId: 'team_002', userId: 3, role: 'member' }
    ];
    
    const insertTeamMember = this.db.prepare(`
      INSERT OR IGNORE INTO team_members (teamId, userId, role)
      VALUES (?, ?, ?)
    `);
    
    teamMembers.forEach(member => {
      insertTeamMember.run(member.teamId, member.userId, member.role);
    });

    // Sample skills
    const skills = [
      { name: 'JavaScript', category: 'technical', description: 'Programming language for web development' },
      { name: 'React', category: 'technical', description: 'Frontend JavaScript library' },
      { name: 'Node.js', category: 'technical', description: 'Backend JavaScript runtime' },
      { name: 'UI/UX Design', category: 'design', description: 'User interface and experience design' },
      { name: 'Project Management', category: 'leadership', description: 'Planning and managing projects' },
      { name: 'Team Leadership', category: 'leadership', description: 'Leading and managing teams' },
      { name: 'Python', category: 'technical', description: 'Programming language for backend development' },
      { name: 'Figma', category: 'design', description: 'Design and prototyping tool' }
    ];

    const insertSkill = this.db.prepare(`
      INSERT OR IGNORE INTO skills (name, category, description)
      VALUES (?, ?, ?)
    `);

    skills.forEach(skill => {
      insertSkill.run(skill.name, skill.category, skill.description);
    });

    // Sample user skills
    const userSkills = [
      { userId: 3, skillId: 1, level: 4 }, // Demo user - JavaScript
      { userId: 3, skillId: 2, level: 3 }, // Demo user - React
      { userId: 4, skillId: 1, level: 5 }, // Team lead - JavaScript
      { userId: 4, skillId: 5, level: 5 }, // Team lead - Project Management
      { userId: 4, skillId: 6, level: 4 }, // Team lead - Team Leadership
      { userId: 5, skillId: 4, level: 5 }, // Pro user - UI/UX Design
      { userId: 5, skillId: 8, level: 4 }, // Pro user - Figma
      { userId: 5, skillId: 1, level: 3 }  // Pro user - JavaScript
    ];

    const insertUserSkill = this.db.prepare(`
      INSERT OR IGNORE INTO user_skills (userId, skillId, level)
      VALUES (?, ?, ?)
    `);

    userSkills.forEach(userSkill => {
      insertUserSkill.run(userSkill.userId, userSkill.skillId, userSkill.level);
    });
  }

  seedWorkflows() {
    const workflows = [
      {
        userId: 4, // Team lead
        name: 'Daily Standup Automation',
        description: 'Automatically collect team updates and generate standup reports',
        category: 'team',
        status: 'active',
        triggers: JSON.stringify(['schedule', 'team_update']),
        actions: JSON.stringify(['collect_updates', 'generate_report', 'send_notification']),
        runs: 47,
        successRate: 0.98,
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        complexity: 'medium'
      },
      {
        userId: 5, // Pro user
        name: 'Design Review Process',
        description: 'Automated workflow for design review and approval',
        category: 'design',
        status: 'active',
        triggers: JSON.stringify(['design_upload']),
        actions: JSON.stringify(['notify_reviewers', 'collect_feedback', 'update_status']),
        runs: 23,
        successRate: 0.96,
        lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        complexity: 'low'
      },
      {
        userId: 3, // Demo user
        name: 'Task Completion Tracker',
        description: 'Track task completion and update project progress',
        category: 'productivity',
        status: 'paused',
        triggers: JSON.stringify(['task_completed']),
        actions: JSON.stringify(['update_progress', 'notify_team']),
        runs: 12,
        successRate: 0.92,
        lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        complexity: 'low'
      }
    ];

    const insertWorkflow = this.db.prepare(`
      INSERT OR IGNORE INTO workflows (
        userId, name, description, category, status, triggers, actions,
        runs, successRate, lastRun, complexity
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    workflows.forEach(workflow => {
      insertWorkflow.run(
        workflow.userId, workflow.name, workflow.description, workflow.category,
        workflow.status, workflow.triggers, workflow.actions, workflow.runs,
        workflow.successRate, workflow.lastRun, workflow.complexity
      );
    });
  }

  seedSkillsAndMentorship() {
    // Sample mentorship relationships
    const mentorships = [
      {
        mentorId: 4, // Team lead as mentor
        menteeId: 3, // Demo user as mentee
        status: 'active',
        startDate: '2024-01-01',
        goals: JSON.stringify(['Improve JavaScript skills', 'Learn project management', 'Career development']),
        progress: 65,
        sessionsCompleted: 8,
        nextSession: '2024-01-20',
        satisfaction: 4.5
      },
      {
        mentorId: 5, // Pro user as mentor
        menteeId: 6, // Free user as mentee
        status: 'active',
        startDate: '2024-01-10',
        goals: JSON.stringify(['Learn UI/UX design', 'Build portfolio', 'Design thinking']),
        progress: 30,
        sessionsCompleted: 3,
        nextSession: '2024-01-25',
        satisfaction: 4.8
      }
    ];

    const insertMentorship = this.db.prepare(`
      INSERT OR IGNORE INTO mentorship_relationships (
        mentorId, menteeId, status, startDate, goals, progress,
        sessionsCompleted, nextSession, satisfaction
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    mentorships.forEach(mentorship => {
      insertMentorship.run(
        mentorship.mentorId, mentorship.menteeId, mentorship.status,
        mentorship.startDate, mentorship.goals, mentorship.progress,
        mentorship.sessionsCompleted, mentorship.nextSession, mentorship.satisfaction
      );
    });
  }

  seedAnalyticsEvents() {
    // Sample analytics events for the last 7 days
    const events = [];
    const eventTypes = ['page_view', 'task_created', 'task_completed', 'login', 'feature_used'];
    const userIds = [1, 2, 3, 4, 5, 6];

    // Generate sample events for the last 7 days
    for (let day = 0; day < 7; day++) {
      const dayTimestamp = new Date(Date.now() - day * 24 * 60 * 60 * 1000);
      
      // Generate 10-20 events per day
      const eventsPerDay = Math.floor(Math.random() * 11) + 10;
      
      for (let i = 0; i < eventsPerDay; i++) {
        const eventTimestamp = new Date(dayTimestamp.getTime() + Math.random() * 24 * 60 * 60 * 1000);
        const userId = userIds[Math.floor(Math.random() * userIds.length)];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        events.push({
          userId,
          eventType,
          eventData: JSON.stringify({
            page: eventType === 'page_view' ? '/dashboard' : undefined,
            feature: eventType === 'feature_used' ? 'ai_tools' : undefined,
            duration: Math.floor(Math.random() * 300) + 30
          }),
          timestamp: eventTimestamp.toISOString(),
          sessionId: `session_${userId}_${day}`,
          userAgent: 'Mozilla/5.0 (compatible; Digame/1.0)',
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`
        });
      }
    }

    const insertEvent = this.db.prepare(`
      INSERT INTO analytics_events (
        userId, eventType, eventData, timestamp, sessionId, userAgent, ipAddress
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    events.forEach(event => {
      insertEvent.run(
        event.userId, event.eventType, event.eventData, event.timestamp,
        event.sessionId, event.userAgent, event.ipAddress
      );
    });
  }

  // Enhanced database operations with caching and monitoring
  async findUserByEmail(email) {
    return await performanceMonitor.monitorDatabaseQuery('findUserByEmail', async () => {
      // Try cache first
      const cacheKey = `user:email:${email}`;
      const cachedUser = await redisService.get(cacheKey);
      if (cachedUser) {
        return cachedUser;
      }

      // Query database
      const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
      const user = stmt.get(email);
      
      if (user) {
        // Parse JSON fields
        user.permissions = JSON.parse(user.permissions || '[]');
        user.onboardingData = JSON.parse(user.onboardingData || '{}');
        user.unlockedFeatures = JSON.parse(user.unlockedFeatures || '[]');
        user.profile = JSON.parse(user.profile || '{}');
        user.preferences = JSON.parse(user.preferences || '{}');
        user.metadata = JSON.parse(user.metadata || '{}');
        
        // Cache for 1 hour
        await redisService.cacheUser(user.id, user, 3600);
        await redisService.set(cacheKey, user, 3600);
      }
      
      return user;
    });
  }

  async findUserById(id) {
    return await performanceMonitor.monitorDatabaseQuery('findUserById', async () => {
      // Try cache first
      const cachedUser = await redisService.getCachedUser(id);
      if (cachedUser) {
        return cachedUser;
      }

      // Query database
      const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
      const user = stmt.get(id);
      
      if (user) {
        // Parse JSON fields
        user.permissions = JSON.parse(user.permissions || '[]');
        user.onboardingData = JSON.parse(user.onboardingData || '{}');
        user.unlockedFeatures = JSON.parse(user.unlockedFeatures || '[]');
        user.profile = JSON.parse(user.profile || '{}');
        user.preferences = JSON.parse(user.preferences || '{}');
        user.metadata = JSON.parse(user.metadata || '{}');
        
        // Cache for 1 hour
        await redisService.cacheUser(id, user, 3600);
      }
      
      return user;
    });
  }

  async updateUser(id, userData) {
    return await performanceMonitor.monitorDatabaseQuery('updateUser', async () => {
      // Prepare update fields
      const updateFields = [];
      const values = [];
      
      Object.keys(userData).forEach(key => {
        if (key !== 'id') {
          updateFields.push(`${key} = ?`);
          // Stringify JSON fields
          if (['permissions', 'onboardingData', 'unlockedFeatures', 'profile', 'preferences', 'metadata'].includes(key)) {
            values.push(JSON.stringify(userData[key]));
          } else {
            values.push(userData[key]);
          }
        }
      });
      
      if (updateFields.length === 0) return null;
      
      updateFields.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(id);
      
      const stmt = this.db.prepare(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`);
      const result = stmt.run(...values);
      
      if (result.changes > 0) {
        // Invalidate cache
        await redisService.invalidateUserCache(id);
        
        // Return updated user
        return await this.findUserById(id);
      }
      
      return null;
    });
  }

  async createUser(userData) {
    return await performanceMonitor.monitorDatabaseQuery('createUser', async () => {
      // Prepare insert data
      const insertData = {
        ...userData,
        permissions: JSON.stringify(userData.permissions || []),
        onboardingData: JSON.stringify(userData.onboardingData || {}),
        unlockedFeatures: JSON.stringify(userData.unlockedFeatures || []),
        profile: JSON.stringify(userData.profile || {}),
        preferences: JSON.stringify(userData.preferences || {}),
        metadata: JSON.stringify(userData.metadata || {})
      };
      
      const stmt = this.db.prepare(`
        INSERT INTO users (
          email, username, firstName, lastName, passwordHash, role,
          subscriptionTier, teamId, permissions, isPlatformOwner,
          isActive, isVerified, onboardingCompleted, onboardingData,
          unlockedFeatures, profile, preferences, metadata
        ) VALUES (
          @email, @username, @firstName, @lastName, @passwordHash, @role,
          @subscriptionTier, @teamId, @permissions, @isPlatformOwner,
          @isActive, @isVerified, @onboardingCompleted, @onboardingData,
          @unlockedFeatures, @profile, @preferences, @metadata
        )
      `);
      
      const result = stmt.run(insertData);
      
      if (result.lastInsertRowid) {
        return await this.findUserById(result.lastInsertRowid);
      }
      
      return null;
    });
  }

  // Notification operations with caching
  async getUserNotifications(userId, limit = 50, offset = 0) {
    return await performanceMonitor.monitorDatabaseQuery('getUserNotifications', async () => {
      const cacheKey = `notifications:${userId}:${limit}:${offset}`;
      const cached = await redisService.get(cacheKey);
      if (cached) {
        return cached;
      }

      const stmt = this.db.prepare(`
        SELECT * FROM notifications
        WHERE userId = ?
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `);
      const notifications = stmt.all(userId, limit, offset);
      
      // Cache for 5 minutes
      await redisService.set(cacheKey, notifications, 300);
      return notifications;
    });
  }

  async markNotificationAsRead(notificationId, userId) {
    return await performanceMonitor.monitorDatabaseQuery('markNotificationAsRead', async () => {
      const stmt = this.db.prepare(`
        UPDATE notifications
        SET read = 1, readAt = CURRENT_TIMESTAMP
        WHERE id = ? AND userId = ?
      `);
      const result = stmt.run(notificationId, userId);
      
      if (result.changes > 0) {
        // Invalidate notification cache
        await redisService.invalidatePattern(`notifications:${userId}:*`);
      }
      
      return result.changes > 0;
    });
  }

  // Analytics operations with caching
  async getAnalyticsData(type, userId = null, timeRange = '7d') {
    return await performanceMonitor.monitorDatabaseQuery('getAnalyticsData', async () => {
      const cacheKey = `analytics:${type}:${userId || 'all'}:${timeRange}`;
      const cached = await redisService.getCachedAnalytics(cacheKey);
      if (cached) {
        return cached;
      }

      let query = 'SELECT * FROM analytics_events WHERE eventType = ?';
      const params = [type];
      
      if (userId) {
        query += ' AND userId = ?';
        params.push(userId);
      }
      
      // Add time range filter
      const timeRangeHours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720; // 30d
      query += ' AND timestamp > datetime("now", "-' + timeRangeHours + ' hours")';
      query += ' ORDER BY timestamp DESC';
      
      const stmt = this.db.prepare(query);
      const events = stmt.all(...params);
      
      // Cache for 15 minutes
      await redisService.cacheAnalytics(cacheKey, events, 900);
      return events;
    });
  }

  // Task operations with caching
  async getUserTasks(userId, status = null) {
    return await performanceMonitor.monitorDatabaseQuery('getUserTasks', async () => {
      const cacheKey = `tasks:${userId}:${status || 'all'}`;
      const cached = await redisService.get(cacheKey);
      if (cached) {
        return cached;
      }

      let query = 'SELECT * FROM tasks WHERE userId = ?';
      const params = [userId];
      
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      
      query += ' ORDER BY createdAt DESC';
      
      const stmt = this.db.prepare(query);
      const tasks = stmt.all(...params);
      
      // Parse JSON fields
      tasks.forEach(task => {
        task.tags = JSON.parse(task.tags || '[]');
      });
      
      // Cache for 10 minutes
      await redisService.set(cacheKey, tasks, 600);
      return tasks;
    });
  }

  // Health check with extended schema validation
  async getHealthStatus() {
    return await performanceMonitor.monitorDatabaseQuery('healthCheck', async () => {
      try {
        // Test basic connectivity
        const testQuery = this.db.prepare('SELECT 1 as test').get();
        
        // Check all tables exist
        const tables = [
          'users', 'notifications', 'notification_settings', 'tasks', 'projects',
          'teams', 'team_members', 'skills', 'user_skills', 'mentorship_relationships',
          'workflows', 'analytics_events', 'audit_logs', 'api_keys', 'webhooks',
          'reports', 'platform_metrics', 'tenants'
        ];
        
        const tableStatus = {};
        for (const table of tables) {
          try {
            const count = this.db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
            tableStatus[table] = {
              exists: true,
              recordCount: count.count
            };
          } catch (error) {
            tableStatus[table] = {
              exists: false,
              error: error.message
            };
          }
        }
        
        // Get database file size
        const dbPath = path.join(__dirname, '../../data/digame.db');
        const fs = require('fs');
        const stats = fs.statSync(dbPath);
        
        return {
          status: 'healthy',
          database: 'sqlite',
          connectivity: 'ok',
          tableStatus,
          databaseSize: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          extendedSchema: true,
          totalTables: Object.keys(tableStatus).length,
          healthyTables: Object.values(tableStatus).filter(t => t.exists).length
        };
      } catch (error) {
        return {
          status: 'unhealthy',
          error: error.message,
          database: 'sqlite'
        };
      }
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = DatabaseService;