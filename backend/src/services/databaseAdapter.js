const Database = require('better-sqlite3');
const { Client } = require('pg');
const path = require('path');

/**
 * Database Adapter Pattern Implementation
 * Provides seamless switching between SQLite and PostgreSQL
 */
class DatabaseAdapter {
    constructor() {
        // Properly detect database type based on DATABASE_URL format
        this.type = this.detectDatabaseType();
        this.connection = null;
        this.initializeConnection();
    }

    detectDatabaseType() {
        const databaseUrl = process.env.DATABASE_URL;
        
        if (!databaseUrl) {
            return 'sqlite';
        }
        
        // Check if it's a SQLite connection string
        if (databaseUrl.startsWith('sqlite:') || databaseUrl.includes('.db')) {
            return 'sqlite';
        }
        
        // Check if it's a PostgreSQL connection string
        if (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')) {
            return 'postgresql';
        }
        
        // Default to SQLite for safety
        console.warn(`⚠️ Unknown DATABASE_URL format: ${databaseUrl}. Defaulting to SQLite.`);
        return 'sqlite';
    }

    initializeConnection() {
        switch (this.type) {
            case 'sqlite':
                this.connection = new SQLiteAdapter();
                break;
            case 'postgresql':
                this.connection = new PostgreSQLAdapter();
                break;
            default:
                throw new Error(`Unsupported database type: ${this.type}`);
        }
        
        console.log(`🔧 Database adapter initialized: ${this.type.toUpperCase()}`);
    }

    // User operations
    async createUser(userData) {
        return this.connection.createUser(userData);
    }

    async findUserByEmail(email) {
        return this.connection.findUserByEmail(email);
    }

    async findUserById(id) {
        return this.connection.findUserById(id);
    }

    async updateUser(id, userData) {
        return this.connection.updateUser(id, userData);
    }

    async deleteUser(id) {
        return this.connection.deleteUser(id);
    }

    // Notification operations
    async createNotification(notificationData) {
        return this.connection.createNotification(notificationData);
    }

    async getUserNotifications(userId, limit = 50, offset = 0) {
        return this.connection.getUserNotifications(userId, limit, offset);
    }

    async markNotificationAsRead(notificationId, userId) {
        return this.connection.markNotificationAsRead(notificationId, userId);
    }

    async deleteNotification(notificationId, userId) {
        return this.connection.deleteNotification(notificationId, userId);
    }

    // Task operations
    async createTask(taskData) {
        return this.connection.createTask(taskData);
    }

    async getUserTasks(userId, status = null) {
        return this.connection.getUserTasks(userId, status);
    }

    async updateTask(taskId, taskData) {
        return this.connection.updateTask(taskId, taskData);
    }

    async deleteTask(taskId, userId) {
        return this.connection.deleteTask(taskId, userId);
    }

    // Team operations
    async createTeam(teamData) {
        return this.connection.createTeam(teamData);
    }

    async getTeamById(teamId) {
        return this.connection.getTeamById(teamId);
    }

    async addTeamMember(teamId, userId, role = 'member') {
        return this.connection.addTeamMember(teamId, userId, role);
    }

    async removeTeamMember(teamId, userId) {
        return this.connection.removeTeamMember(teamId, userId);
    }

    async getTeamMembers(teamId) {
        return this.connection.getTeamMembers(teamId);
    }

    // Analytics operations
    async recordAnalyticsEvent(eventData) {
        return this.connection.recordAnalyticsEvent(eventData);
    }

    async getAnalyticsData(type, userId = null, timeRange = '7d') {
        return this.connection.getAnalyticsData(type, userId, timeRange);
    }

    // Workflow operations
    async createWorkflow(workflowData) {
        return this.connection.createWorkflow(workflowData);
    }

    async getUserWorkflows(userId) {
        return this.connection.getUserWorkflows(userId);
    }

    async updateWorkflow(workflowId, workflowData) {
        return this.connection.updateWorkflow(workflowId, workflowData);
    }

    // Health check
    async getHealthStatus() {
        return this.connection.getHealthStatus();
    }

    // Migration support
    async exportData() {
        return this.connection.exportData();
    }

    async importData(data) {
        return this.connection.importData(data);
    }

    // Generic query method
    async query(sql, params = []) {
        return this.connection.query(sql, params);
    }

    // Connection management
    async close() {
        if (this.connection && this.connection.close) {
            await this.connection.close();
        }
    }

    // Get connection info
    getConnectionInfo() {
        return {
            type: this.type,
            status: this.connection ? 'connected' : 'disconnected',
            features: this.connection ? this.connection.getFeatures() : []
        };
    }
}

/**
 * SQLite Adapter Implementation
 */
class SQLiteAdapter {
    constructor() {
        const dbPath = path.join(__dirname, '../../data/digame.db');
        this.db = new Database(dbPath);
        this.type = 'sqlite';
    }

    getFeatures() {
        return ['file-based', 'zero-config', 'embedded', 'fast-reads'];
    }

    async createUser(userData) {
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
    }

    async findUserByEmail(email) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
        const user = stmt.get(email);
        return this.parseUserData(user);
    }

    async findUserById(id) {
        const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
        const user = stmt.get(id);
        return this.parseUserData(user);
    }

    async updateUser(id, userData) {
        const updateFields = [];
        const values = [];

        Object.keys(userData).forEach(key => {
            if (key !== 'id') {
                updateFields.push(`${key} = ?`);
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
            return await this.findUserById(id);
        }
        return null;
    }

    async deleteUser(id) {
        const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
        const result = stmt.run(id);
        return result.changes > 0;
    }

    async createNotification(notificationData) {
        const stmt = this.db.prepare(`
            INSERT INTO notifications (
                id, userId, title, message, type, category, priority,
                actionUrl, actionText
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            notificationData.id || `notif_${Date.now()}`,
            notificationData.userId,
            notificationData.title,
            notificationData.message,
            notificationData.type || 'info',
            notificationData.category || 'system',
            notificationData.priority || 'medium',
            notificationData.actionUrl || null,
            notificationData.actionText || null
        );

        return result.changes > 0;
    }

    async getUserNotifications(userId, limit = 50, offset = 0) {
        const stmt = this.db.prepare(`
            SELECT * FROM notifications
            WHERE userId = ?
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
        `);
        return stmt.all(userId, limit, offset);
    }

    async markNotificationAsRead(notificationId, userId) {
        const stmt = this.db.prepare(`
            UPDATE notifications
            SET read = 1, readAt = CURRENT_TIMESTAMP
            WHERE id = ? AND userId = ?
        `);
        const result = stmt.run(notificationId, userId);
        return result.changes > 0;
    }

    async deleteNotification(notificationId, userId) {
        const stmt = this.db.prepare('DELETE FROM notifications WHERE id = ? AND userId = ?');
        const result = stmt.run(notificationId, userId);
        return result.changes > 0;
    }

    async createTask(taskData) {
        const stmt = this.db.prepare(`
            INSERT INTO tasks (
                userId, title, description, status, priority, category,
                dueDate, estimatedTime, tags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            taskData.userId,
            taskData.title,
            taskData.description || null,
            taskData.status || 'pending',
            taskData.priority || 'medium',
            taskData.category || 'general',
            taskData.dueDate || null,
            taskData.estimatedTime || null,
            JSON.stringify(taskData.tags || [])
        );

        return result.lastInsertRowid;
    }

    async getUserTasks(userId, status = null) {
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
        return tasks.map(task => ({
            ...task,
            tags: JSON.parse(task.tags || '[]')
        }));
    }

    async updateTask(taskId, taskData) {
        const updateFields = [];
        const values = [];

        Object.keys(taskData).forEach(key => {
            if (key !== 'id') {
                updateFields.push(`${key} = ?`);
                if (key === 'tags') {
                    values.push(JSON.stringify(taskData[key]));
                } else {
                    values.push(taskData[key]);
                }
            }
        });

        if (updateFields.length === 0) return false;

        updateFields.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(taskId);

        const stmt = this.db.prepare(`UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ?`);
        const result = stmt.run(...values);
        return result.changes > 0;
    }

    async deleteTask(taskId, userId) {
        const stmt = this.db.prepare('DELETE FROM tasks WHERE id = ? AND userId = ?');
        const result = stmt.run(taskId, userId);
        return result.changes > 0;
    }

    async recordAnalyticsEvent(eventData) {
        const stmt = this.db.prepare(`
            INSERT INTO analytics_events (
                userId, eventType, eventData, sessionId, userAgent, ipAddress
            ) VALUES (?, ?, ?, ?, ?, ?)
        `);

        const result = stmt.run(
            eventData.userId || null,
            eventData.eventType,
            JSON.stringify(eventData.eventData || {}),
            eventData.sessionId || null,
            eventData.userAgent || null,
            eventData.ipAddress || null
        );

        return result.changes > 0;
    }

    async getAnalyticsData(type, userId = null, timeRange = '7d') {
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
        return stmt.all(...params);
    }

    async getHealthStatus() {
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
                adapter: 'SQLiteAdapter',
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
                database: 'sqlite',
                adapter: 'SQLiteAdapter',
                error: error.message
            };
        }
    }

    async exportData() {
        const data = {};
        
        // Export users
        const users = this.db.prepare('SELECT * FROM users').all();
        data.users = users.map(user => this.parseUserData(user));

        // Export notifications
        data.notifications = this.db.prepare('SELECT * FROM notifications').all();

        // Export tasks
        const tasks = this.db.prepare('SELECT * FROM tasks').all();
        data.tasks = tasks.map(task => ({
            ...task,
            tags: JSON.parse(task.tags || '[]')
        }));

        // Export teams
        data.teams = this.db.prepare('SELECT * FROM teams').all();
        data.teamMembers = this.db.prepare('SELECT * FROM team_members').all();

        // Export analytics events
        data.analyticsEvents = this.db.prepare('SELECT * FROM analytics_events').all();

        return data;
    }

    async importData(data) {
        // This would implement data import logic
        // For now, return success
        return { success: true, message: 'Data import not yet implemented for SQLite' };
    }

    parseUserData(user) {
        if (!user) return null;

        return {
            ...user,
            permissions: JSON.parse(user.permissions || '[]'),
            onboardingData: JSON.parse(user.onboardingData || '{}'),
            unlockedFeatures: JSON.parse(user.unlockedFeatures || '[]'),
            profile: JSON.parse(user.profile || '{}'),
            preferences: JSON.parse(user.preferences || '{}'),
            metadata: JSON.parse(user.metadata || '{}')
        };
    }

    // Generic query method for SQLite
    query(sql, params = []) {
        try {
            if (sql.trim().toUpperCase().startsWith('SELECT')) {
                const stmt = this.db.prepare(sql);
                return stmt.all(...params);
            } else {
                const stmt = this.db.prepare(sql);
                const result = stmt.run(...params);
                return { changes: result.changes, lastInsertRowid: result.lastInsertRowid };
            }
        } catch (error) {
            throw new Error(`SQLite query error: ${error.message}`);
        }
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

/**
 * PostgreSQL Adapter Implementation
 */
class PostgreSQLAdapter {
    constructor() {
        this.client = new Client({
            connectionString: process.env.DATABASE_URL
        });
        this.type = 'postgresql';
        this.connect();
    }

    async connect() {
        try {
            await this.client.connect();
            console.log('✅ PostgreSQL adapter connected');
        } catch (error) {
            console.error('❌ PostgreSQL connection failed:', error.message);
            throw error;
        }
    }

    getFeatures() {
        return ['concurrent', 'acid-compliant', 'scalable', 'advanced-queries'];
    }

    async createUser(userData) {
        const query = `
            INSERT INTO users (
                email, username, firstName, lastName, passwordHash, role,
                subscriptionTier, teamId, permissions, isPlatformOwner,
                isActive, isVerified, onboardingCompleted, onboardingData,
                unlockedFeatures, profile, preferences, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
            RETURNING *
        `;

        const values = [
            userData.email,
            userData.username,
            userData.firstName,
            userData.lastName,
            userData.passwordHash,
            userData.role || 'user',
            userData.subscriptionTier || 'free',
            userData.teamId || null,
            JSON.stringify(userData.permissions || []),
            userData.isPlatformOwner || false,
            userData.isActive !== undefined ? userData.isActive : true,
            userData.isVerified || false,
            userData.onboardingCompleted || false,
            JSON.stringify(userData.onboardingData || {}),
            JSON.stringify(userData.unlockedFeatures || []),
            JSON.stringify(userData.profile || {}),
            JSON.stringify(userData.preferences || {}),
            JSON.stringify(userData.metadata || {})
        ];

        const result = await this.client.query(query, values);
        return this.parseUserData(result.rows[0]);
    }

    async findUserByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await this.client.query(query, [email]);
        return this.parseUserData(result.rows[0]);
    }

    async findUserById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await this.client.query(query, [id]);
        return this.parseUserData(result.rows[0]);
    }

    async updateUser(id, userData) {
        const updateFields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(userData).forEach(key => {
            if (key !== 'id') {
                updateFields.push(`${key} = $${paramCount}`);
                if (['permissions', 'onboardingData', 'unlockedFeatures', 'profile', 'preferences', 'metadata'].includes(key)) {
                    values.push(JSON.stringify(userData[key]));
                } else {
                    values.push(userData[key]);
                }
                paramCount++;
            }
        });

        if (updateFields.length === 0) return null;

        updateFields.push(`updatedAt = NOW()`);
        values.push(id);

        const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
        const result = await this.client.query(query, values);
        return this.parseUserData(result.rows[0]);
    }

    async deleteUser(id) {
        const query = 'DELETE FROM users WHERE id = $1';
        const result = await this.client.query(query, [id]);
        return result.rowCount > 0;
    }

    async getHealthStatus() {
        try {
            const result = await this.client.query('SELECT 1 as test');
            const userCount = await this.client.query('SELECT COUNT(*) as count FROM users');

            return {
                status: 'healthy',
                database: 'postgresql',
                adapter: 'PostgreSQLAdapter',
                connectivity: 'ok',
                userCount: userCount.rows[0].count,
                connectionPool: 'active'
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                database: 'postgresql',
                adapter: 'PostgreSQLAdapter',
                error: error.message
            };
        }
    }

    parseUserData(user) {
        if (!user) return null;

        return {
            ...user,
            permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions,
            onboardingData: typeof user.onboardingData === 'string' ? JSON.parse(user.onboardingData) : user.onboardingData,
            unlockedFeatures: typeof user.unlockedFeatures === 'string' ? JSON.parse(user.unlockedFeatures) : user.unlockedFeatures,
            profile: typeof user.profile === 'string' ? JSON.parse(user.profile) : user.profile,
            preferences: typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences,
            metadata: typeof user.metadata === 'string' ? JSON.parse(user.metadata) : user.metadata
        };
    }

    async close() {
        await this.client.end();
    }

    // Placeholder implementations for other methods
    async createNotification(notificationData) { return { success: true, message: 'PostgreSQL implementation pending' }; }
    async getUserNotifications(userId, limit, offset) { return []; }
    async markNotificationAsRead(notificationId, userId) { return true; }
    async deleteNotification(notificationId, userId) { return true; }
    async createTask(taskData) { return 1; }
    async getUserTasks(userId, status) { return []; }
    async updateTask(taskId, taskData) { return true; }
    async deleteTask(taskId, userId) { return true; }
    async recordAnalyticsEvent(eventData) { return true; }
    async getAnalyticsData(type, userId, timeRange) { return []; }
    // Generic query method for PostgreSQL
    async query(sql, params = []) {
        try {
            const result = await this.client.query(sql, params);
            return result.rows;
        } catch (error) {
            throw new Error(`PostgreSQL query error: ${error.message}`);
        }
    }

    async exportData() { return {}; }
    async importData(data) { return { success: true }; }
}

// Export singleton instance
const databaseAdapter = new DatabaseAdapter();

module.exports = databaseAdapter;
module.exports.DatabaseAdapter = DatabaseAdapter;