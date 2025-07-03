#!/usr/bin/env node

const DatabaseAdapter = require('../src/services/databaseAdapter');
const DatabaseMigrator = require('../src/utils/databaseMigrator');
const { cacheManager } = require('../src/services/cacheManager');
const fs = require('fs');
const path = require('path');

/**
 * Database CLI Tool
 * Command-line interface for database management operations
 */
class DatabaseCLI {
    constructor() {
        this.adapter = new DatabaseAdapter();
        this.migrator = new DatabaseMigrator();
    }

    async run() {
        const args = process.argv.slice(2);
        const command = args[0];

        console.log('🗃️  Digame Database CLI Tool v2.0.0');
        console.log('=====================================');

        try {
            switch (command) {
                case 'status':
                    await this.showStatus();
                    break;
                case 'health':
                    await this.checkHealth();
                    break;
                case 'export':
                    await this.exportData(args[1]);
                    break;
                case 'import':
                    await this.importData(args[1]);
                    break;
                case 'migrate':
                    await this.migrate();
                    break;
                case 'test-migration':
                    await this.testMigration();
                    break;
                case 'clear-cache':
                    await this.clearCache();
                    break;
                case 'backup':
                    await this.createBackup();
                    break;
                case 'restore':
                    await this.restoreBackup(args[1]);
                    break;
                case 'schema':
                    await this.showSchema();
                    break;
                case 'users':
                    await this.listUsers();
                    break;
                case 'help':
                default:
                    this.showHelp();
                    break;
            }
        } catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    }

    async showStatus() {
        console.log('📊 Database Status\n');
        
        const connectionInfo = this.adapter.getConnectionInfo();
        const health = await this.adapter.getHealthStatus();
        
        console.log(`Database Type: ${connectionInfo.type.toUpperCase()}`);
        console.log(`Status: ${connectionInfo.status}`);
        console.log(`Features: ${connectionInfo.features.join(', ')}`);
        
        if (health.status === 'healthy') {
            console.log(`\n✅ Database is healthy`);
            if (health.totalTables) {
                console.log(`Tables: ${health.healthyTables}/${health.totalTables} healthy`);
            }
            if (health.databaseSize) {
                console.log(`Size: ${health.databaseSize}`);
            }
        } else {
            console.log(`\n❌ Database is unhealthy: ${health.error}`);
        }
    }

    async checkHealth() {
        console.log('🔍 Comprehensive Health Check\n');
        
        const health = await this.adapter.getHealthStatus();
        
        console.log(`Overall Status: ${health.status === 'healthy' ? '✅' : '❌'} ${health.status.toUpperCase()}`);
        
        if (health.tableStatus) {
            console.log('\nTable Status:');
            Object.entries(health.tableStatus).forEach(([table, status]) => {
                const icon = status.exists ? '✅' : '❌';
                const count = status.recordCount !== undefined ? ` (${status.recordCount} records)` : '';
                console.log(`  ${icon} ${table}${count}`);
            });
        }
        
        if (health.databaseSize) {
            console.log(`\nDatabase Size: ${health.databaseSize}`);
        }
    }

    async exportData(filename) {
        console.log('📤 Exporting database data...\n');
        
        const data = await this.migrator.exportSQLiteData();
        
        const exportPath = filename || `database_export_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const fullPath = path.resolve(exportPath);
        
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
        
        console.log(`✅ Data exported successfully to: ${fullPath}`);
        console.log(`📊 Export summary:`);
        console.log(`   Users: ${data.users.length}`);
        console.log(`   Notifications: ${data.notifications.length}`);
        console.log(`   Tasks: ${data.tasks.length}`);
        console.log(`   Teams: ${data.teams.length}`);
        console.log(`   Analytics Events: ${data.analyticsEvents.length}`);
    }

    async importData(filename) {
        if (!filename) {
            console.error('❌ Please specify a file to import');
            return;
        }
        
        console.log(`📥 Importing data from: ${filename}\n`);
        
        const fullPath = path.resolve(filename);
        if (!fs.existsSync(fullPath)) {
            console.error(`❌ File not found: ${fullPath}`);
            return;
        }
        
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        await this.migrator.importToPostgreSQL(data);
        
        console.log('✅ Data imported successfully');
    }

    async migrate() {
        console.log('🚀 Starting database migration...\n');
        
        if (!process.env.DATABASE_URL) {
            console.error('❌ DATABASE_URL not configured for PostgreSQL migration');
            return;
        }
        
        await this.migrator.migrate();
        console.log('✅ Migration completed successfully');
    }

    async testMigration() {
        console.log('🧪 Testing database migration (dry run)...\n');
        
        const result = await this.migrator.testMigration();
        
        if (result.success) {
            console.log('✅ Migration test passed');
            console.log(`📊 Test summary:`);
            console.log(`   Users: ${result.data.users.length}`);
            console.log(`   Total records: ${Object.values(result.data).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0)}`);
        } else {
            console.log(`❌ Migration test failed: ${result.error}`);
        }
    }

    async clearCache() {
        console.log('🧹 Clearing all caches...\n');
        
        await cacheManager.clear();
        console.log('✅ All caches cleared successfully');
    }

    async createBackup() {
        console.log('💾 Creating database backup...\n');
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, '../backups');
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        // Export data
        const data = await this.migrator.exportSQLiteData();
        
        // Save backup
        const backupPath = path.join(backupDir, `backup_${timestamp}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
        
        // Copy database file (if SQLite)
        if (this.adapter.getConnectionInfo().type === 'sqlite') {
            const dbPath = path.join(__dirname, '../data/digame.db');
            const dbBackupPath = path.join(backupDir, `digame_${timestamp}.db`);
            
            if (fs.existsSync(dbPath)) {
                fs.copyFileSync(dbPath, dbBackupPath);
                console.log(`✅ Database file backed up: ${dbBackupPath}`);
            }
        }
        
        console.log(`✅ Data backup created: ${backupPath}`);
    }

    async restoreBackup(filename) {
        if (!filename) {
            console.error('❌ Please specify a backup file to restore');
            return;
        }
        
        console.log(`🔄 Restoring from backup: ${filename}\n`);
        
        const fullPath = path.resolve(filename);
        if (!fs.existsSync(fullPath)) {
            console.error(`❌ Backup file not found: ${fullPath}`);
            return;
        }
        
        // This would implement restore logic
        console.log('⚠️  Restore functionality not yet implemented');
        console.log('   Use the import command for now: node database-cli.js import <file>');
    }

    async showSchema() {
        console.log('📋 Database Schema Information\n');
        
        const health = await this.adapter.getHealthStatus();
        
        if (health.tableStatus) {
            const categories = {
                'Core': ['users', 'notifications', 'notification_settings'],
                'Productivity': ['tasks', 'projects'],
                'Collaboration': ['teams', 'team_members', 'skills', 'user_skills', 'mentorship_relationships'],
                'Automation': ['workflows'],
                'Analytics': ['analytics_events'],
                'Security': ['audit_logs', 'api_keys'],
                'Integration': ['webhooks'],
                'Reporting': ['reports'],
                'Platform': ['platform_metrics', 'tenants']
            };
            
            Object.entries(categories).forEach(([category, tables]) => {
                console.log(`\n${category}:`);
                tables.forEach(table => {
                    const status = health.tableStatus[table];
                    if (status) {
                        const icon = status.exists ? '✅' : '❌';
                        const count = status.recordCount !== undefined ? ` (${status.recordCount} records)` : '';
                        console.log(`  ${icon} ${table}${count}`);
                    }
                });
            });
        }
    }

    async listUsers() {
        console.log('👥 User List\n');
        
        try {
            // This would use the adapter to get users
            console.log('User listing functionality would be implemented here');
            console.log('Use the health check to see user count: node database-cli.js health');
        } catch (error) {
            console.error('❌ Failed to list users:', error.message);
        }
    }

    showHelp() {
        console.log(`
Available Commands:

📊 Information:
  status              Show database connection status
  health              Comprehensive health check
  schema              Display database schema information
  users               List all users

🔄 Data Management:
  export [file]       Export database data to JSON
  import <file>       Import data from JSON file
  backup              Create complete database backup
  restore <file>      Restore from backup file

🚀 Migration:
  migrate             Migrate from SQLite to PostgreSQL
  test-migration      Test migration without executing

🧹 Maintenance:
  clear-cache         Clear all cache layers

❓ Help:
  help                Show this help message

Examples:
  node database-cli.js status
  node database-cli.js export my-backup.json
  node database-cli.js test-migration
  node database-cli.js health

Environment Variables:
  DATABASE_URL        PostgreSQL connection string (for migration)
  REDIS_URL          Redis connection string (for caching)
        `);
    }
}

// Run CLI if called directly
if (require.main === module) {
    const cli = new DatabaseCLI();
    cli.run().catch(error => {
        console.error('❌ CLI Error:', error.message);
        process.exit(1);
    });
}

module.exports = DatabaseCLI;