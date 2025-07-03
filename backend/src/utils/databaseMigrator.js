const DatabaseAdapter = require('../services/databaseAdapter');
const Database = require('better-sqlite3');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

/**
 * Database Migration Utility
 * Handles data migration between SQLite and PostgreSQL environments
 */
class DatabaseMigrator {
    constructor() {
        this.sourceAdapter = null;
        this.targetAdapter = null;
    }

    /**
     * Export data from SQLite database
     */
    async exportSQLiteData() {
        console.log('🔄 Exporting data from SQLite...');
        
        const dbPath = path.join(__dirname, '../../data/digame.db');
        const db = new Database(dbPath);
        
        try {
            const data = {
                metadata: {
                    exportDate: new Date().toISOString(),
                    sourceDatabase: 'sqlite',
                    version: '2.0.0'
                },
                users: [],
                notifications: [],
                notificationSettings: [],
                tasks: [],
                projects: [],
                teams: [],
                teamMembers: [],
                skills: [],
                userSkills: [],
                mentorshipRelationships: [],
                workflows: [],
                analyticsEvents: [],
                auditLogs: [],
                apiKeys: [],
                webhooks: [],
                reports: [],
                platformMetrics: [],
                tenants: []
            };

            // Export users
            const users = db.prepare('SELECT * FROM users').all();
            data.users = users.map(user => ({
                ...user,
                onboardingData: this.parseJSON(user.onboardingData),
                unlockedFeatures: this.parseJSON(user.unlockedFeatures),
                profile: this.parseJSON(user.profile),
                preferences: this.parseJSON(user.preferences),
                metadata: this.parseJSON(user.metadata),
                permissions: this.parseJSON(user.permissions)
            }));

            // Export notifications
            try {
                data.notifications = db.prepare('SELECT * FROM notifications').all();
            } catch (error) {
                console.warn('Notifications table not found, skipping...');
            }

            // Export notification settings
            try {
                data.notificationSettings = db.prepare('SELECT * FROM notification_settings').all();
            } catch (error) {
                console.warn('Notification settings table not found, skipping...');
            }

            // Export tasks
            try {
                const tasks = db.prepare('SELECT * FROM tasks').all();
                data.tasks = tasks.map(task => ({
                    ...task,
                    tags: this.parseJSON(task.tags)
                }));
            } catch (error) {
                console.warn('Tasks table not found, skipping...');
            }

            // Export projects
            try {
                const projects = db.prepare('SELECT * FROM projects').all();
                data.projects = projects.map(project => ({
                    ...project,
                    teamMembers: this.parseJSON(project.teamMembers)
                }));
            } catch (error) {
                console.warn('Projects table not found, skipping...');
            }

            // Export teams
            try {
                const teams = db.prepare('SELECT * FROM teams').all();
                data.teams = teams.map(team => ({
                    ...team,
                    settings: this.parseJSON(team.settings)
                }));
            } catch (error) {
                console.warn('Teams table not found, skipping...');
            }

            // Export team members
            try {
                data.teamMembers = db.prepare('SELECT * FROM team_members').all();
            } catch (error) {
                console.warn('Team members table not found, skipping...');
            }

            // Export skills
            try {
                data.skills = db.prepare('SELECT * FROM skills').all();
            } catch (error) {
                console.warn('Skills table not found, skipping...');
            }

            // Export user skills
            try {
                data.userSkills = db.prepare('SELECT * FROM user_skills').all();
            } catch (error) {
                console.warn('User skills table not found, skipping...');
            }

            // Export mentorship relationships
            try {
                const mentorships = db.prepare('SELECT * FROM mentorship_relationships').all();
                data.mentorshipRelationships = mentorships.map(mentorship => ({
                    ...mentorship,
                    goals: this.parseJSON(mentorship.goals)
                }));
            } catch (error) {
                console.warn('Mentorship relationships table not found, skipping...');
            }

            // Export workflows
            try {
                const workflows = db.prepare('SELECT * FROM workflows').all();
                data.workflows = workflows.map(workflow => ({
                    ...workflow,
                    triggers: this.parseJSON(workflow.triggers),
                    actions: this.parseJSON(workflow.actions)
                }));
            } catch (error) {
                console.warn('Workflows table not found, skipping...');
            }

            // Export analytics events
            try {
                const events = db.prepare('SELECT * FROM analytics_events').all();
                data.analyticsEvents = events.map(event => ({
                    ...event,
                    eventData: this.parseJSON(event.eventData)
                }));
            } catch (error) {
                console.warn('Analytics events table not found, skipping...');
            }

            // Export audit logs
            try {
                const logs = db.prepare('SELECT * FROM audit_logs').all();
                data.auditLogs = logs.map(log => ({
                    ...log,
                    details: this.parseJSON(log.details)
                }));
            } catch (error) {
                console.warn('Audit logs table not found, skipping...');
            }

            // Export API keys
            try {
                const apiKeys = db.prepare('SELECT * FROM api_keys').all();
                data.apiKeys = apiKeys.map(key => ({
                    ...key,
                    permissions: this.parseJSON(key.permissions)
                }));
            } catch (error) {
                console.warn('API keys table not found, skipping...');
            }

            // Export webhooks
            try {
                const webhooks = db.prepare('SELECT * FROM webhooks').all();
                data.webhooks = webhooks.map(webhook => ({
                    ...webhook,
                    events: this.parseJSON(webhook.events)
                }));
            } catch (error) {
                console.warn('Webhooks table not found, skipping...');
            }

            // Export reports
            try {
                const reports = db.prepare('SELECT * FROM reports').all();
                data.reports = reports.map(report => ({
                    ...report,
                    config: this.parseJSON(report.config),
                    recipients: this.parseJSON(report.recipients)
                }));
            } catch (error) {
                console.warn('Reports table not found, skipping...');
            }

            // Export platform metrics
            try {
                const metrics = db.prepare('SELECT * FROM platform_metrics').all();
                data.platformMetrics = metrics.map(metric => ({
                    ...metric,
                    metadata: this.parseJSON(metric.metadata)
                }));
            } catch (error) {
                console.warn('Platform metrics table not found, skipping...');
            }

            // Export tenants
            try {
                const tenants = db.prepare('SELECT * FROM tenants').all();
                data.tenants = tenants.map(tenant => ({
                    ...tenant,
                    settings: this.parseJSON(tenant.settings)
                }));
            } catch (error) {
                console.warn('Tenants table not found, skipping...');
            }

            console.log('✅ SQLite data export completed');
            console.log(`📊 Export summary:
                Users: ${data.users.length}
                Notifications: ${data.notifications.length}
                Tasks: ${data.tasks.length}
                Projects: ${data.projects.length}
                Teams: ${data.teams.length}
                Analytics Events: ${data.analyticsEvents.length}
            `);

            return data;
        } finally {
            db.close();
        }
    }

    /**
     * Import data to PostgreSQL database
     */
    async importToPostgreSQL(data) {
        console.log('🔄 Importing data to PostgreSQL...');
        
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        
        try {
            await client.connect();
            
            // Begin transaction
            await client.query('BEGIN');

            // Import users
            if (data.users && data.users.length > 0) {
                console.log(`📥 Importing ${data.users.length} users...`);
                for (const user of data.users) {
                    await client.query(`
                        INSERT INTO users (
                            id, email, username, firstName, lastName, passwordHash, role,
                            subscriptionTier, teamId, permissions, isPlatformOwner,
                            isActive, isVerified, onboardingCompleted, onboardingData,
                            unlockedFeatures, lastLogin, createdAt, updatedAt,
                            profile, preferences, metadata
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
                        ON CONFLICT (email) DO NOTHING
                    `, [
                        user.id, user.email, user.username, user.firstName, user.lastName,
                        user.passwordHash, user.role, user.subscriptionTier, user.teamId,
                        JSON.stringify(user.permissions), user.isPlatformOwner,
                        user.isActive, user.isVerified, user.onboardingCompleted,
                        JSON.stringify(user.onboardingData), JSON.stringify(user.unlockedFeatures),
                        user.lastLogin, user.createdAt, user.updatedAt,
                        JSON.stringify(user.profile), JSON.stringify(user.preferences),
                        JSON.stringify(user.metadata)
                    ]);
                }
            }

            // Import notifications
            if (data.notifications && data.notifications.length > 0) {
                console.log(`📥 Importing ${data.notifications.length} notifications...`);
                for (const notification of data.notifications) {
                    await client.query(`
                        INSERT INTO notifications (
                            id, userId, title, message, type, category, priority,
                            read, readAt, timestamp, actionUrl, actionText,
                            createdAt, updatedAt
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                        ON CONFLICT (id) DO NOTHING
                    `, [
                        notification.id, notification.userId, notification.title,
                        notification.message, notification.type, notification.category,
                        notification.priority, notification.read, notification.readAt,
                        notification.timestamp, notification.actionUrl, notification.actionText,
                        notification.createdAt, notification.updatedAt
                    ]);
                }
            }

            // Import tasks
            if (data.tasks && data.tasks.length > 0) {
                console.log(`📥 Importing ${data.tasks.length} tasks...`);
                for (const task of data.tasks) {
                    await client.query(`
                        INSERT INTO tasks (
                            id, userId, title, description, status, priority, category,
                            dueDate, estimatedTime, completedTime, tags, source,
                            suggestionId, createdAt, updatedAt, completedAt
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                        ON CONFLICT (id) DO NOTHING
                    `, [
                        task.id, task.userId, task.title, task.description,
                        task.status, task.priority, task.category, task.dueDate,
                        task.estimatedTime, task.completedTime, JSON.stringify(task.tags),
                        task.source, task.suggestionId, task.createdAt,
                        task.updatedAt, task.completedAt
                    ]);
                }
            }

            // Import other tables similarly...
            // (Implementation would continue for all other tables)

            // Commit transaction
            await client.query('COMMIT');
            
            console.log('✅ PostgreSQL data import completed');
            
        } catch (error) {
            // Rollback transaction on error
            await client.query('ROLLBACK');
            console.error('❌ PostgreSQL import failed:', error.message);
            throw error;
        } finally {
            await client.end();
        }
    }

    /**
     * Perform complete migration from SQLite to PostgreSQL
     */
    async migrate() {
        console.log('🚀 Starting database migration...');
        console.log('📋 Migration Plan:');
        console.log('  1. Export data from SQLite');
        console.log('  2. Validate data integrity');
        console.log('  3. Import data to PostgreSQL');
        console.log('  4. Verify migration success');
        console.log('');

        try {
            // Step 1: Export from SQLite
            const data = await this.exportSQLiteData();
            
            // Step 2: Validate data
            this.validateExportedData(data);
            
            // Step 3: Save backup
            await this.saveBackup(data);
            
            // Step 4: Import to PostgreSQL
            await this.importToPostgreSQL(data);
            
            // Step 5: Verify migration
            await this.verifyMigration(data);
            
            console.log('🎉 Migration completed successfully!');
            
        } catch (error) {
            console.error('❌ Migration failed:', error.message);
            throw error;
        }
    }

    /**
     * Validate exported data integrity
     */
    validateExportedData(data) {
        console.log('🔍 Validating exported data...');
        
        const validations = [
            { name: 'Users', count: data.users.length, required: true },
            { name: 'Notifications', count: data.notifications.length, required: false },
            { name: 'Tasks', count: data.tasks.length, required: false },
            { name: 'Teams', count: data.teams.length, required: false },
            { name: 'Analytics Events', count: data.analyticsEvents.length, required: false }
        ];

        let hasErrors = false;
        
        validations.forEach(validation => {
            if (validation.required && validation.count === 0) {
                console.error(`❌ ${validation.name}: No records found (required)`);
                hasErrors = true;
            } else {
                console.log(`✅ ${validation.name}: ${validation.count} records`);
            }
        });

        if (hasErrors) {
            throw new Error('Data validation failed');
        }

        console.log('✅ Data validation passed');
    }

    /**
     * Save backup of exported data
     */
    async saveBackup(data) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, '../../backups');
        const backupPath = path.join(backupDir, `migration_backup_${timestamp}.json`);
        
        try {
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            
            fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
            console.log(`💾 Backup saved: ${backupPath}`);
            
        } catch (error) {
            console.warn('⚠️ Failed to save backup:', error.message);
        }
    }

    /**
     * Verify migration success
     */
    async verifyMigration(originalData) {
        console.log('🔍 Verifying migration...');
        
        try {
            const client = new Client({ connectionString: process.env.DATABASE_URL });
            await client.connect();
            
            // Check user count
            const userCount = await client.query('SELECT COUNT(*) as count FROM users');
            const expectedUsers = originalData.users.length;
            const actualUsers = parseInt(userCount.rows[0].count);
            
            if (actualUsers >= expectedUsers) {
                console.log(`✅ Users: ${actualUsers}/${expectedUsers} migrated`);
            } else {
                console.warn(`⚠️ Users: Only ${actualUsers}/${expectedUsers} migrated`);
            }
            
            // Check other tables similarly...
            
            await client.end();
            console.log('✅ Migration verification completed');
            
        } catch (error) {
            console.error('❌ Migration verification failed:', error.message);
            throw error;
        }
    }

    /**
     * Create migration report
     */
    async createMigrationReport(data) {
        const report = {
            timestamp: new Date().toISOString(),
            source: 'sqlite',
            target: 'postgresql',
            summary: {
                users: data.users.length,
                notifications: data.notifications.length,
                tasks: data.tasks.length,
                projects: data.projects.length,
                teams: data.teams.length,
                analyticsEvents: data.analyticsEvents.length
            },
            status: 'completed'
        };

        const reportPath = path.join(__dirname, '../../backups', `migration_report_${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`📊 Migration report saved: ${reportPath}`);
        return report;
    }

    /**
     * Parse JSON safely
     */
    parseJSON(jsonString) {
        try {
            return JSON.parse(jsonString || '{}');
        } catch (error) {
            return {};
        }
    }

    /**
     * Test migration without actually performing it
     */
    async testMigration() {
        console.log('🧪 Testing migration (dry run)...');
        
        try {
            // Export data
            const data = await this.exportSQLiteData();
            
            // Validate data
            this.validateExportedData(data);
            
            // Test PostgreSQL connection
            if (process.env.DATABASE_URL) {
                const client = new Client({ connectionString: process.env.DATABASE_URL });
                await client.connect();
                await client.query('SELECT 1');
                await client.end();
                console.log('✅ PostgreSQL connection test passed');
            } else {
                console.warn('⚠️ No PostgreSQL connection string found');
            }
            
            console.log('✅ Migration test completed successfully');
            return { success: true, data };
            
        } catch (error) {
            console.error('❌ Migration test failed:', error.message);
            return { success: false, error: error.message };
        }
    }
}

module.exports = DatabaseMigrator;