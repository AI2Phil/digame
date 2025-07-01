const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

class DatabaseService {
  constructor() {
    // Create database file in backend directory
    const dbPath = path.join(__dirname, '../../data/digame.db');
    this.db = new Database(dbPath);
    this.initializeTables();
    this.initializeDemoUsers();
  }

  initializeTables() {
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
        lastLogin TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        profile TEXT DEFAULT '{}',
        preferences TEXT DEFAULT '{}',
        metadata TEXT DEFAULT '{}'
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscriptionTier);
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

  close() {
    this.db.close();
  }
}

module.exports = DatabaseService;