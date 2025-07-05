const { performance } = require('perf_hooks');

class PerformanceOptimizer {
  constructor(database) {
    this.db = database;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.batchSize = 1000;
    this.queryCache = new Map();
    this.performanceMetrics = {
      queryTimes: [],
      cacheHits: 0,
      cacheMisses: 0,
      batchOperations: 0
    };
  }

  /**
   * Execute query with performance optimization
   */
  async optimizedQuery(sql, params = [], options = {}) {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(sql, params);
    
    // Check cache first if enabled
    if (options.cache !== false && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        this.performanceMetrics.cacheHits++;
        return {
          data: cached.data,
          cached: true,
          executionTime: performance.now() - startTime,
          fromCache: true
        };
      } else {
        this.cache.delete(cacheKey);
      }
    }

    try {
      // Execute query
      const stmt = this.db.prepare(sql);
      let data;
      
      if (options.single) {
        data = stmt.get(params);
      } else {
        data = stmt.all(params);
      }

      const executionTime = performance.now() - startTime;
      this.performanceMetrics.queryTimes.push(executionTime);

      // Cache result if enabled
      if (options.cache !== false && data) {
        this.cache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
      }

      this.performanceMetrics.cacheMisses++;

      return {
        data: data,
        cached: false,
        executionTime: executionTime,
        fromCache: false
      };

    } catch (error) {
      throw new Error(`Query optimization failed: ${error.message}`);
    }
  }

  /**
   * Batch insert with optimization
   */
  async batchInsert(tableName, records, options = {}) {
    if (!records || records.length === 0) {
      return { inserted: 0, batches: 0, executionTime: 0 };
    }

    const startTime = performance.now();
    const batchSize = options.batchSize || this.batchSize;
    let totalInserted = 0;
    let batchCount = 0;

    try {
      // Get column names from first record
      const columns = Object.keys(records[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
      
      const stmt = this.db.prepare(sql);
      
      // Process in batches
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        
        const transaction = this.db.transaction((batchRecords) => {
          for (const record of batchRecords) {
            const values = columns.map(col => record[col]);
            stmt.run(values);
            totalInserted++;
          }
        });

        transaction(batch);
        batchCount++;
        this.performanceMetrics.batchOperations++;

        // Optional progress callback
        if (options.onProgress) {
          options.onProgress({
            processed: Math.min(i + batchSize, records.length),
            total: records.length,
            percentage: Math.round((Math.min(i + batchSize, records.length) / records.length) * 100)
          });
        }
      }

      const executionTime = performance.now() - startTime;

      return {
        inserted: totalInserted,
        batches: batchCount,
        executionTime: executionTime,
        recordsPerSecond: Math.round(totalInserted / (executionTime / 1000))
      };

    } catch (error) {
      throw new Error(`Batch insert failed: ${error.message}`);
    }
  }

  /**
   * Batch update with optimization
   */
  async batchUpdate(tableName, updates, whereColumn, options = {}) {
    if (!updates || updates.length === 0) {
      return { updated: 0, batches: 0, executionTime: 0 };
    }

    const startTime = performance.now();
    const batchSize = options.batchSize || this.batchSize;
    let totalUpdated = 0;
    let batchCount = 0;

    try {
      // Build update SQL
      const updateColumns = Object.keys(updates[0]).filter(col => col !== whereColumn);
      const setClause = updateColumns.map(col => `${col} = ?`).join(', ');
      const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereColumn} = ?`;
      
      const stmt = this.db.prepare(sql);
      
      // Process in batches
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize);
        
        const transaction = this.db.transaction((batchUpdates) => {
          for (const update of batchUpdates) {
            const values = [...updateColumns.map(col => update[col]), update[whereColumn]];
            const result = stmt.run(values);
            totalUpdated += result.changes;
          }
        });

        transaction(batch);
        batchCount++;
        this.performanceMetrics.batchOperations++;

        // Optional progress callback
        if (options.onProgress) {
          options.onProgress({
            processed: Math.min(i + batchSize, updates.length),
            total: updates.length,
            percentage: Math.round((Math.min(i + batchSize, updates.length) / updates.length) * 100)
          });
        }
      }

      const executionTime = performance.now() - startTime;

      return {
        updated: totalUpdated,
        batches: batchCount,
        executionTime: executionTime,
        recordsPerSecond: Math.round(totalUpdated / (executionTime / 1000))
      };

    } catch (error) {
      throw new Error(`Batch update failed: ${error.message}`);
    }
  }

  /**
   * Batch delete with optimization
   */
  async batchDelete(tableName, whereColumn, values, options = {}) {
    if (!values || values.length === 0) {
      return { deleted: 0, batches: 0, executionTime: 0 };
    }

    const startTime = performance.now();
    const batchSize = options.batchSize || this.batchSize;
    let totalDeleted = 0;
    let batchCount = 0;

    try {
      const sql = `DELETE FROM ${tableName} WHERE ${whereColumn} = ?`;
      const stmt = this.db.prepare(sql);
      
      // Process in batches
      for (let i = 0; i < values.length; i += batchSize) {
        const batch = values.slice(i, i + batchSize);
        
        const transaction = this.db.transaction((batchValues) => {
          for (const value of batchValues) {
            const result = stmt.run(value);
            totalDeleted += result.changes;
          }
        });

        transaction(batch);
        batchCount++;
        this.performanceMetrics.batchOperations++;

        // Optional progress callback
        if (options.onProgress) {
          options.onProgress({
            processed: Math.min(i + batchSize, values.length),
            total: values.length,
            percentage: Math.round((Math.min(i + batchSize, values.length) / values.length) * 100)
          });
        }
      }

      const executionTime = performance.now() - startTime;

      return {
        deleted: totalDeleted,
        batches: batchCount,
        executionTime: executionTime,
        recordsPerSecond: Math.round(totalDeleted / (executionTime / 1000))
      };

    } catch (error) {
      throw new Error(`Batch delete failed: ${error.message}`);
    }
  }

  /**
   * Paginated query with optimization
   */
  async paginatedQuery(sql, params = [], page = 1, pageSize = 100, options = {}) {
    const startTime = performance.now();
    
    try {
      // Get total count first
      const countSql = sql.replace(/SELECT .+ FROM/, 'SELECT COUNT(*) as total FROM');
      const countResult = await this.optimizedQuery(countSql, params, { single: true, cache: options.cache });
      const totalRecords = countResult.data.total;
      
      // Calculate pagination
      const offset = (page - 1) * pageSize;
      const totalPages = Math.ceil(totalRecords / pageSize);
      
      // Get paginated data
      const paginatedSql = `${sql} LIMIT ? OFFSET ?`;
      const paginatedParams = [...params, pageSize, offset];
      const dataResult = await this.optimizedQuery(paginatedSql, paginatedParams, { cache: options.cache });
      
      const executionTime = performance.now() - startTime;

      return {
        data: dataResult.data,
        pagination: {
          page: page,
          pageSize: pageSize,
          totalRecords: totalRecords,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        performance: {
          executionTime: executionTime,
          cached: dataResult.cached || countResult.cached
        }
      };

    } catch (error) {
      throw new Error(`Paginated query failed: ${error.message}`);
    }
  }

  /**
   * Optimize database indexes
   */
  async optimizeIndexes() {
    const startTime = performance.now();
    const results = {
      analyzed_tables: [],
      recommendations: [],
      created_indexes: [],
      execution_time: 0
    };

    try {
      // Get all tables
      const tables = this.db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type = 'table' 
        AND name NOT LIKE 'sqlite_%'
      `).all();

      for (const table of tables) {
        const tableName = table.name;
        results.analyzed_tables.push(tableName);

        // Analyze table structure
        const columns = this.db.prepare(`PRAGMA table_info(${tableName})`).all();
        const indexes = this.db.prepare(`
          SELECT name, sql FROM sqlite_master 
          WHERE type = 'index' 
          AND tbl_name = ? 
          AND name NOT LIKE 'sqlite_%'
        `).all([tableName]);

        // Check for missing indexes on foreign keys and frequently queried columns
        const recommendations = this.analyzeIndexNeeds(tableName, columns, indexes);
        results.recommendations.push(...recommendations);

        // Create recommended indexes
        for (const rec of recommendations) {
          if (rec.auto_create) {
            try {
              this.db.exec(rec.sql);
              results.created_indexes.push({
                table: tableName,
                index: rec.index_name,
                column: rec.column,
                sql: rec.sql
              });
            } catch (error) {
              // Index might already exist, continue
            }
          }
        }
      }

      // Run ANALYZE to update statistics
      this.db.exec('ANALYZE');

      results.execution_time = performance.now() - startTime;
      return results;

    } catch (error) {
      throw new Error(`Index optimization failed: ${error.message}`);
    }
  }

  /**
   * Analyze index needs for a table
   */
  analyzeIndexNeeds(tableName, columns, existingIndexes) {
    const recommendations = [];
    const existingIndexColumns = existingIndexes.map(idx => 
      idx.sql ? this.extractIndexColumns(idx.sql) : []
    ).flat();

    // Common patterns that benefit from indexes
    const indexPatterns = [
      { column: 'id', reason: 'Primary key lookups', priority: 'high' },
      { column: 'userId', reason: 'User-based filtering', priority: 'high' },
      { column: 'teamId', reason: 'Team-based filtering', priority: 'high' },
      { column: 'email', reason: 'Email lookups', priority: 'high' },
      { column: 'status', reason: 'Status filtering', priority: 'medium' },
      { column: 'createdAt', reason: 'Date-based queries', priority: 'medium' },
      { column: 'updatedAt', reason: 'Date-based queries', priority: 'medium' },
      { column: 'timestamp', reason: 'Time-based queries', priority: 'high' },
      { column: 'is_mock_data', reason: 'Mock data filtering', priority: 'medium' }
    ];

    for (const pattern of indexPatterns) {
      const column = columns.find(col => col.name === pattern.column);
      if (column && !existingIndexColumns.includes(pattern.column)) {
        recommendations.push({
          table: tableName,
          column: pattern.column,
          reason: pattern.reason,
          priority: pattern.priority,
          index_name: `idx_${tableName}_${pattern.column}`,
          sql: `CREATE INDEX IF NOT EXISTS idx_${tableName}_${pattern.column} ON ${tableName}(${pattern.column})`,
          auto_create: pattern.priority === 'high'
        });
      }
    }

    return recommendations;
  }

  /**
   * Extract column names from index SQL
   */
  extractIndexColumns(sql) {
    const match = sql.match(/\(([^)]+)\)/);
    if (match) {
      return match[1].split(',').map(col => col.trim());
    }
    return [];
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.queryCache.clear();
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    const queryTimes = this.performanceMetrics.queryTimes;
    const avgQueryTime = queryTimes.length > 0 
      ? queryTimes.reduce((a, b) => a + b, 0) / queryTimes.length 
      : 0;

    const cacheHitRate = this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses > 0
      ? (this.performanceMetrics.cacheHits / (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses)) * 100
      : 0;

    return {
      cache: {
        size: this.cache.size,
        hit_rate: Math.round(cacheHitRate * 100) / 100,
        hits: this.performanceMetrics.cacheHits,
        misses: this.performanceMetrics.cacheMisses
      },
      queries: {
        total_executed: queryTimes.length,
        average_time_ms: Math.round(avgQueryTime * 100) / 100,
        fastest_ms: queryTimes.length > 0 ? Math.min(...queryTimes) : 0,
        slowest_ms: queryTimes.length > 0 ? Math.max(...queryTimes) : 0
      },
      batch_operations: {
        total_batches: this.performanceMetrics.batchOperations
      }
    };
  }

  /**
   * Generate cache key
   */
  generateCacheKey(sql, params) {
    return `${sql}:${JSON.stringify(params)}`;
  }

  /**
   * Vacuum database to reclaim space
   */
  async vacuumDatabase() {
    const startTime = performance.now();
    
    try {
      // Get database size before vacuum
      const fs = require('fs');
      const path = require('path');
      const dbPath = path.join(__dirname, '../../data/digame.db');
      const sizeBefore = fs.statSync(dbPath).size;

      // Run vacuum
      this.db.exec('VACUUM');

      // Get database size after vacuum
      const sizeAfter = fs.statSync(dbPath).size;
      const spaceSaved = sizeBefore - sizeAfter;
      const executionTime = performance.now() - startTime;

      return {
        size_before_mb: Math.round((sizeBefore / 1024 / 1024) * 100) / 100,
        size_after_mb: Math.round((sizeAfter / 1024 / 1024) * 100) / 100,
        space_saved_mb: Math.round((spaceSaved / 1024 / 1024) * 100) / 100,
        space_saved_percentage: sizeBefore > 0 ? Math.round((spaceSaved / sizeBefore) * 100 * 100) / 100 : 0,
        execution_time_ms: Math.round(executionTime)
      };

    } catch (error) {
      throw new Error(`Database vacuum failed: ${error.message}`);
    }
  }
}

module.exports = PerformanceOptimizer;