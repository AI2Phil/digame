const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class BackupService {
  constructor(database) {
    this.db = database;
    this.backupDir = path.join(__dirname, '../../data/backups');
    this.ensureBackupDirectory();
  }

  async ensureBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      console.warn('Backup directory creation warning:', error.message);
    }
  }

  /**
   * Create a comprehensive backup
   */
  async createBackup(options = {}) {
    const {
      backupType = 'full',
      includeSchema = true,
      includeMockData = true,
      includeRealData = true,
      triggeredByUserId = null,
      description = ''
    } = options;

    const backupId = uuidv4();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `digame-backup-${backupType}-${timestamp}.json`;
    const filePath = path.join(this.backupDir, filename);

    try {
      // Get all tables
      const tables = [
        'users', 'notifications', 'notification_settings', 'tasks', 'projects',
        'teams', 'team_members', 'skills', 'user_skills', 'mentorship_relationships',
        'workflows', 'analytics_events', 'audit_logs', 'api_keys', 'webhooks',
        'reports', 'platform_metrics', 'tenants', 'data_management_operations', 'data_backups'
      ];

      const backupData = {
        metadata: {
          backupId,
          backupType,
          timestamp: new Date().toISOString(),
          version: '2.0.0',
          description,
          options: {
            includeSchema,
            includeMockData,
            includeRealData
          }
        },
        schema: {},
        data: {},
        statistics: {}
      };

      // Export schema information if requested
      if (includeSchema) {
        for (const table of tables) {
          try {
            const schemaInfo = this.db.prepare(`PRAGMA table_info(${table})`).all();
            backupData.schema[table] = schemaInfo;
          } catch (error) {
            console.warn(`Schema export warning for ${table}:`, error.message);
          }
        }
      }

      // Export data
      const entityCounts = {};
      for (const table of tables) {
        try {
          let query = `SELECT * FROM ${table}`;
          const conditions = [];

          // Filter based on data type preferences
          if (!includeMockData && !includeRealData) {
            // Skip data export
            backupData.data[table] = [];
            entityCounts[table] = 0;
            continue;
          } else if (!includeMockData) {
            conditions.push('(is_mock_data IS NULL OR is_mock_data = FALSE)');
          } else if (!includeRealData) {
            conditions.push('is_mock_data = TRUE');
          }

          if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
          }

          const data = this.db.prepare(query).all();
          backupData.data[table] = data;
          entityCounts[table] = data.length;

        } catch (error) {
          console.warn(`Data export warning for ${table}:`, error.message);
          backupData.data[table] = [];
          entityCounts[table] = 0;
        }
      }

      // Add statistics
      backupData.statistics = {
        totalTables: tables.length,
        entityCounts,
        totalRecords: Object.values(entityCounts).reduce((sum, count) => sum + count, 0)
      };

      // Write backup file
      await fs.writeFile(filePath, JSON.stringify(backupData, null, 2));

      // Get file size
      const stats = await fs.stat(filePath);
      const fileSizeBytes = stats.size;

      // Record backup in database
      const insertBackup = this.db.prepare(`
        INSERT INTO data_backups (
          backup_uuid, backup_type, file_path, file_size_bytes, 
          entity_counts, created_by_user_id, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      // Set expiration (30 days for full backups, 7 days for others)
      const expirationDays = backupType === 'full' ? 30 : 7;
      const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString();

      insertBackup.run(
        backupId,
        backupType,
        filePath,
        fileSizeBytes,
        JSON.stringify(entityCounts),
        triggeredByUserId,
        expiresAt
      );

      return {
        backupId,
        filename,
        filePath,
        fileSizeBytes,
        entityCounts,
        totalRecords: backupData.statistics.totalRecords,
        expiresAt
      };

    } catch (error) {
      // Clean up partial backup file
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.warn('Backup cleanup warning:', cleanupError.message);
      }
      throw error;
    }
  }

  /**
   * Create a pre-operation backup
   */
  async createPreOperationBackup(operationType, triggeredByUserId = null) {
    return await this.createBackup({
      backupType: 'pre_operation',
      includeSchema: false,
      includeMockData: true,
      includeRealData: true,
      triggeredByUserId,
      description: `Pre-operation backup before ${operationType}`
    });
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId, options = {}) {
    const {
      restoreSchema = false,
      restoreData = true,
      clearExistingData = false,
      dryRun = false
    } = options;

    // Get backup record
    const backup = this.db.prepare(`
      SELECT * FROM data_backups WHERE backup_uuid = ?
    `).get(backupId);

    if (!backup) {
      throw new Error('Backup not found');
    }

    // Check if backup file exists
    try {
      await fs.access(backup.file_path);
    } catch (error) {
      throw new Error('Backup file not found or inaccessible');
    }

    if (dryRun) {
      // Return what would be restored without actually doing it
      const backupContent = JSON.parse(await fs.readFile(backup.file_path, 'utf8'));
      return {
        dryRun: true,
        backupMetadata: backupContent.metadata,
        statistics: backupContent.statistics,
        wouldRestore: {
          schema: restoreSchema,
          data: restoreData,
          clearExisting: clearExistingData
        }
      };
    }

    // Actual restore logic would go here
    // This is a simplified implementation
    throw new Error('Restore functionality not yet implemented - use for backup verification only');
  }

  /**
   * List available backups
   */
  async listBackups(options = {}) {
    const { limit = 50, backupType = null, includeExpired = false } = options;

    let query = 'SELECT * FROM data_backups';
    const conditions = [];
    const params = [];

    if (backupType) {
      conditions.push('backup_type = ?');
      params.push(backupType);
    }

    if (!includeExpired) {
      conditions.push('(expires_at IS NULL OR expires_at > datetime("now"))');
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const backups = this.db.prepare(query).all(...params);

    // Parse JSON fields and add file existence check
    const backupsWithStatus = await Promise.all(
      backups.map(async (backup) => {
        let fileExists = false;
        let fileSizeMB = 0;

        try {
          await fs.access(backup.file_path);
          fileExists = true;
          const stats = await fs.stat(backup.file_path);
          fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
        } catch (error) {
          // File doesn't exist
        }

        return {
          ...backup,
          entity_counts: JSON.parse(backup.entity_counts || '{}'),
          file_exists: fileExists,
          file_size_mb: fileSizeMB,
          is_expired: backup.expires_at ? new Date(backup.expires_at) < new Date() : false
        };
      })
    );

    return backupsWithStatus;
  }

  /**
   * Clean up expired backups
   */
  async cleanupExpiredBackups() {
    const expiredBackups = this.db.prepare(`
      SELECT * FROM data_backups 
      WHERE expires_at IS NOT NULL AND expires_at < datetime("now")
    `).all();

    let deletedFiles = 0;
    let deletedRecords = 0;

    for (const backup of expiredBackups) {
      try {
        // Delete file
        await fs.unlink(backup.file_path);
        deletedFiles++;
      } catch (error) {
        console.warn(`Failed to delete backup file ${backup.file_path}:`, error.message);
      }

      // Delete database record
      try {
        const deleteStmt = this.db.prepare('DELETE FROM data_backups WHERE id = ?');
        deleteStmt.run(backup.id);
        deletedRecords++;
      } catch (error) {
        console.warn(`Failed to delete backup record ${backup.id}:`, error.message);
      }
    }

    return {
      expiredBackups: expiredBackups.length,
      deletedFiles,
      deletedRecords
    };
  }

  /**
   * Get backup statistics
   */
  async getBackupStatistics() {
    const stats = {
      totalBackups: 0,
      totalSizeMB: 0,
      backupsByType: {},
      oldestBackup: null,
      newestBackup: null,
      expiredBackups: 0
    };

    const backups = await this.listBackups({ limit: 1000, includeExpired: true });
    
    stats.totalBackups = backups.length;
    stats.totalSizeMB = backups.reduce((sum, backup) => sum + parseFloat(backup.file_size_mb || 0), 0);
    stats.expiredBackups = backups.filter(b => b.is_expired).length;

    // Group by type
    backups.forEach(backup => {
      if (!stats.backupsByType[backup.backup_type]) {
        stats.backupsByType[backup.backup_type] = 0;
      }
      stats.backupsByType[backup.backup_type]++;
    });

    // Find oldest and newest
    if (backups.length > 0) {
      stats.oldestBackup = backups[backups.length - 1].created_at;
      stats.newestBackup = backups[0].created_at;
    }

    return stats;
  }

  /**
   * Verify backup integrity
   */
  async verifyBackup(backupId) {
    const backup = this.db.prepare(`
      SELECT * FROM data_backups WHERE backup_uuid = ?
    `).get(backupId);

    if (!backup) {
      throw new Error('Backup not found');
    }

    const verification = {
      backupId,
      fileExists: false,
      fileReadable: false,
      jsonValid: false,
      hasMetadata: false,
      hasData: false,
      recordCounts: {},
      errors: []
    };

    try {
      // Check file existence
      await fs.access(backup.file_path);
      verification.fileExists = true;

      // Check file readability
      const content = await fs.readFile(backup.file_path, 'utf8');
      verification.fileReadable = true;

      // Check JSON validity
      const backupData = JSON.parse(content);
      verification.jsonValid = true;

      // Check structure
      verification.hasMetadata = !!backupData.metadata;
      verification.hasData = !!backupData.data;

      // Verify record counts
      if (backupData.data) {
        Object.keys(backupData.data).forEach(table => {
          verification.recordCounts[table] = backupData.data[table].length;
        });
      }

    } catch (error) {
      verification.errors.push(error.message);
    }

    return verification;
  }
}

module.exports = BackupService;