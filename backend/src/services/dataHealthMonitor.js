const { performance } = require('perf_hooks');

class DataHealthMonitor {
  constructor(database) {
    this.db = database;
    this.healthChecks = new Map();
    this.alertThresholds = {
      mockDataRatio: 90, // Alert if mock data exceeds 90%
      tableGrowthRate: 1000, // Alert if table grows by more than 1000 records/hour
      queryResponseTime: 1000, // Alert if queries take longer than 1 second
      diskUsage: 100 * 1024 * 1024, // Alert if database exceeds 100MB
      errorRate: 5 // Alert if error rate exceeds 5%
    };
  }

  /**
   * Perform comprehensive data health check
   */
  async performHealthCheck() {
    const startTime = performance.now();
    const healthReport = {
      timestamp: new Date().toISOString(),
      overall_status: 'healthy',
      checks: {},
      metrics: {},
      alerts: [],
      recommendations: []
    };

    try {
      // Run all health checks
      await Promise.all([
        this.checkDataIntegrity(healthReport),
        this.checkMockDataRatio(healthReport),
        this.checkTableSizes(healthReport),
        this.checkQueryPerformance(healthReport),
        this.checkDataQuality(healthReport),
        this.checkRelationalIntegrity(healthReport),
        this.checkIndexEfficiency(healthReport),
        this.checkDataDistribution(healthReport)
      ]);

      // Calculate overall status
      const failedChecks = Object.values(healthReport.checks).filter(check => check.status === 'failed').length;
      const warningChecks = Object.values(healthReport.checks).filter(check => check.status === 'warning').length;

      if (failedChecks > 0) {
        healthReport.overall_status = 'critical';
      } else if (warningChecks > 2) {
        healthReport.overall_status = 'warning';
      } else if (warningChecks > 0) {
        healthReport.overall_status = 'degraded';
      }

      // Add performance metrics
      healthReport.metrics.health_check_duration = Math.round(performance.now() - startTime);
      healthReport.metrics.checks_performed = Object.keys(healthReport.checks).length;
      healthReport.metrics.alerts_generated = healthReport.alerts.length;

    } catch (error) {
      healthReport.overall_status = 'error';
      healthReport.error = error.message;
    }

    return healthReport;
  }

  /**
   * Check data integrity
   */
  async checkDataIntegrity(report) {
    const check = {
      name: 'Data Integrity',
      status: 'healthy',
      details: {},
      issues: []
    };

    try {
      const tables = [
        'users', 'notifications', 'notification_settings', 'tasks', 'projects',
        'teams', 'team_members', 'skills', 'user_skills', 'mentorship_relationships',
        'workflows', 'analytics_events', 'audit_logs', 'api_keys', 'webhooks',
        'reports', 'platform_metrics', 'tenants'
      ];

      for (const table of tables) {
        try {
          // Check if table exists and is accessible
          const count = this.db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
          check.details[table] = {
            exists: true,
            record_count: count.count,
            accessible: true
          };

          // Check for NULL values in required fields (simplified)
          if (table === 'users') {
            const nullEmails = this.db.prepare(`SELECT COUNT(*) as count FROM users WHERE email IS NULL OR email = ''`).get();
            if (nullEmails.count > 0) {
              check.issues.push(`${nullEmails.count} users with missing email addresses`);
              check.status = 'warning';
            }
          }

        } catch (error) {
          check.details[table] = {
            exists: false,
            error: error.message,
            accessible: false
          };
          check.issues.push(`Table ${table}: ${error.message}`);
          check.status = 'failed';
        }
      }

    } catch (error) {
      check.status = 'failed';
      check.error = error.message;
    }

    report.checks.data_integrity = check;
  }

  /**
   * Check mock data ratio
   */
  async checkMockDataRatio(report) {
    const check = {
      name: 'Mock Data Ratio',
      status: 'healthy',
      details: {},
      ratios: {}
    };

    try {
      const tables = ['users', 'tasks', 'projects', 'teams', 'analytics_events'];
      let totalRecords = 0;
      let totalMockRecords = 0;

      for (const table of tables) {
        try {
          const total = this.db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
          const mock = this.db.prepare(`SELECT COUNT(*) as count FROM ${table} WHERE is_mock_data = TRUE`).get();
          
          const ratio = total.count > 0 ? (mock.count / total.count) * 100 : 0;
          
          check.details[table] = {
            total_records: total.count,
            mock_records: mock.count,
            real_records: total.count - mock.count,
            mock_ratio: Math.round(ratio * 10) / 10
          };

          check.ratios[table] = ratio;
          totalRecords += total.count;
          totalMockRecords += mock.count;

        } catch (error) {
          check.details[table] = { error: error.message };
        }
      }

      const overallRatio = totalRecords > 0 ? (totalMockRecords / totalRecords) * 100 : 0;
      check.overall_mock_ratio = Math.round(overallRatio * 10) / 10;

      // Check against threshold
      if (overallRatio > this.alertThresholds.mockDataRatio) {
        check.status = 'warning';
        report.alerts.push({
          type: 'mock_data_ratio',
          severity: 'warning',
          message: `Mock data ratio (${check.overall_mock_ratio}%) exceeds threshold (${this.alertThresholds.mockDataRatio}%)`,
          recommendation: 'Consider cleaning up mock data before production deployment'
        });
      }

    } catch (error) {
      check.status = 'failed';
      check.error = error.message;
    }

    report.checks.mock_data_ratio = check;
  }

  /**
   * Check table sizes and growth
   */
  async checkTableSizes(report) {
    const check = {
      name: 'Table Sizes',
      status: 'healthy',
      details: {},
      total_size_mb: 0
    };

    try {
      // Get database file size
      const fs = require('fs');
      const path = require('path');
      const dbPath = path.join(__dirname, '../../data/digame.db');
      
      try {
        const stats = fs.statSync(dbPath);
        check.total_size_mb = Math.round((stats.size / 1024 / 1024) * 100) / 100;
        
        if (stats.size > this.alertThresholds.diskUsage) {
          check.status = 'warning';
          report.alerts.push({
            type: 'disk_usage',
            severity: 'warning',
            message: `Database size (${check.total_size_mb}MB) is growing large`,
            recommendation: 'Consider archiving old data or optimizing storage'
          });
        }
      } catch (error) {
        check.details.file_size_error = error.message;
      }

      // Check individual table sizes (approximation)
      const tables = ['users', 'analytics_events', 'tasks', 'projects', 'notifications'];
      for (const table of tables) {
        try {
          const count = this.db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
          check.details[table] = {
            record_count: count.count,
            estimated_size_kb: Math.round(count.count * 0.5) // Rough estimate
          };
        } catch (error) {
          check.details[table] = { error: error.message };
        }
      }

    } catch (error) {
      check.status = 'failed';
      check.error = error.message;
    }

    report.checks.table_sizes = check;
  }

  /**
   * Check query performance
   */
  async checkQueryPerformance(report) {
    const check = {
      name: 'Query Performance',
      status: 'healthy',
      details: {},
      avg_response_time: 0
    };

    const testQueries = [
      { name: 'user_lookup', query: 'SELECT * FROM users LIMIT 10' },
      { name: 'analytics_aggregation', query: 'SELECT COUNT(*) FROM analytics_events WHERE timestamp > datetime("now", "-7 days")' },
      { name: 'team_join', query: 'SELECT u.firstName, u.lastName, t.name FROM users u JOIN team_members tm ON u.id = tm.userId JOIN teams t ON tm.teamId = t.id LIMIT 10' },
      { name: 'task_filtering', query: 'SELECT * FROM tasks WHERE status = "completed" AND completedAt > datetime("now", "-30 days") LIMIT 10' }
    ];

    const responseTimes = [];

    try {
      for (const testQuery of testQueries) {
        const startTime = performance.now();
        try {
          this.db.prepare(testQuery.query).all();
          const responseTime = performance.now() - startTime;
          responseTimes.push(responseTime);
          
          check.details[testQuery.name] = {
            response_time_ms: Math.round(responseTime * 100) / 100,
            status: responseTime > this.alertThresholds.queryResponseTime ? 'slow' : 'fast'
          };

          if (responseTime > this.alertThresholds.queryResponseTime) {
            check.status = 'warning';
          }

        } catch (error) {
          check.details[testQuery.name] = {
            error: error.message,
            status: 'failed'
          };
          check.status = 'failed';
        }
      }

      check.avg_response_time = responseTimes.length > 0 
        ? Math.round((responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) * 100) / 100
        : 0;

    } catch (error) {
      check.status = 'failed';
      check.error = error.message;
    }

    report.checks.query_performance = check;
  }

  /**
   * Check data quality
   */
  async checkDataQuality(report) {
    const check = {
      name: 'Data Quality',
      status: 'healthy',
      details: {},
      quality_score: 100
    };

    try {
      let qualityIssues = 0;
      let totalChecks = 0;

      // Check for duplicate emails
      try {
        const duplicateEmails = this.db.prepare(`
          SELECT email, COUNT(*) as count 
          FROM users 
          WHERE email IS NOT NULL 
          GROUP BY email 
          HAVING COUNT(*) > 1
        `).all();

        totalChecks++;
        if (duplicateEmails.length > 0) {
          qualityIssues++;
          check.details.duplicate_emails = {
            count: duplicateEmails.length,
            examples: duplicateEmails.slice(0, 3)
          };
        }
      } catch (error) {
        check.details.duplicate_emails = { error: error.message };
      }

      // Check for orphaned records
      try {
        const orphanedTasks = this.db.prepare(`
          SELECT COUNT(*) as count 
          FROM tasks t 
          LEFT JOIN users u ON t.userId = u.id 
          WHERE u.id IS NULL
        `).get();

        totalChecks++;
        if (orphanedTasks.count > 0) {
          qualityIssues++;
          check.details.orphaned_tasks = orphanedTasks.count;
        }
      } catch (error) {
        check.details.orphaned_tasks = { error: error.message };
      }

      // Check for invalid JSON fields
      try {
        const invalidJson = this.db.prepare(`
          SELECT COUNT(*) as count 
          FROM users 
          WHERE profile IS NOT NULL 
          AND profile != '' 
          AND json_valid(profile) = 0
        `).get();

        totalChecks++;
        if (invalidJson.count > 0) {
          qualityIssues++;
          check.details.invalid_json_profiles = invalidJson.count;
        }
      } catch (error) {
        check.details.invalid_json = { error: error.message };
      }

      // Calculate quality score
      check.quality_score = totalChecks > 0 
        ? Math.round(((totalChecks - qualityIssues) / totalChecks) * 100)
        : 100;

      if (check.quality_score < 90) {
        check.status = 'warning';
        report.recommendations.push('Review and clean up data quality issues to improve system reliability');
      }

    } catch (error) {
      check.status = 'failed';
      check.error = error.message;
    }

    report.checks.data_quality = check;
  }

  /**
   * Check relational integrity
   */
  async checkRelationalIntegrity(report) {
    const check = {
      name: 'Relational Integrity',
      status: 'healthy',
      details: {},
      violations: []
    };

    try {
      // Check foreign key constraints (simplified)
      const foreignKeyChecks = [
        {
          name: 'team_members_user_fk',
          query: `SELECT COUNT(*) as count FROM team_members tm LEFT JOIN users u ON tm.userId = u.id WHERE u.id IS NULL`
        },
        {
          name: 'team_members_team_fk',
          query: `SELECT COUNT(*) as count FROM team_members tm LEFT JOIN teams t ON tm.teamId = t.id WHERE t.id IS NULL`
        },
        {
          name: 'user_skills_user_fk',
          query: `SELECT COUNT(*) as count FROM user_skills us LEFT JOIN users u ON us.userId = u.id WHERE u.id IS NULL`
        },
        {
          name: 'user_skills_skill_fk',
          query: `SELECT COUNT(*) as count FROM user_skills us LEFT JOIN skills s ON us.skillId = s.id WHERE s.id IS NULL`
        }
      ];

      for (const fkCheck of foreignKeyChecks) {
        try {
          const result = this.db.prepare(fkCheck.query).get();
          check.details[fkCheck.name] = {
            violations: result.count,
            status: result.count > 0 ? 'violated' : 'valid'
          };

          if (result.count > 0) {
            check.violations.push({
              constraint: fkCheck.name,
              violation_count: result.count
            });
            check.status = 'warning';
          }

        } catch (error) {
          check.details[fkCheck.name] = { error: error.message };
        }
      }

    } catch (error) {
      check.status = 'failed';
      check.error = error.message;
    }

    report.checks.relational_integrity = check;
  }

  /**
   * Check index efficiency
   */
  async checkIndexEfficiency(report) {
    const check = {
      name: 'Index Efficiency',
      status: 'healthy',
      details: {},
      recommendations: []
    };

    try {
      // Get index information
      const indexes = this.db.prepare(`
        SELECT name, tbl_name, sql 
        FROM sqlite_master 
        WHERE type = 'index' 
        AND name NOT LIKE 'sqlite_%'
      `).all();

      check.details.total_indexes = indexes.length;
      check.details.indexes_by_table = {};

      indexes.forEach(index => {
        if (!check.details.indexes_by_table[index.tbl_name]) {
          check.details.indexes_by_table[index.tbl_name] = [];
        }
        check.details.indexes_by_table[index.tbl_name].push(index.name);
      });

      // Check for missing recommended indexes
      const recommendedIndexes = [
        { table: 'users', column: 'email', reason: 'Frequent lookups' },
        { table: 'analytics_events', column: 'timestamp', reason: 'Time-based queries' },
        { table: 'tasks', column: 'userId', reason: 'User task filtering' },
        { table: 'notifications', column: 'userId', reason: 'User notifications' }
      ];

      for (const recommended of recommendedIndexes) {
        const hasIndex = indexes.some(idx => 
          idx.tbl_name === recommended.table && 
          idx.sql && idx.sql.includes(recommended.column)
        );

        if (!hasIndex) {
          check.recommendations.push({
            table: recommended.table,
            column: recommended.column,
            reason: recommended.reason,
            suggested_sql: `CREATE INDEX IF NOT EXISTS idx_${recommended.table}_${recommended.column} ON ${recommended.table}(${recommended.column})`
          });
        }
      }

      if (check.recommendations.length > 0) {
        check.status = 'warning';
        report.recommendations.push('Consider adding recommended indexes to improve query performance');
      }

    } catch (error) {
      check.status = 'failed';
      check.error = error.message;
    }

    report.checks.index_efficiency = check;
  }

  /**
   * Check data distribution
   */
  async checkDataDistribution(report) {
    const check = {
      name: 'Data Distribution',
      status: 'healthy',
      details: {},
      patterns: {}
    };

    try {
      // Check user distribution by subscription tier
      const userTiers = this.db.prepare(`
        SELECT subscriptionTier, COUNT(*) as count 
        FROM users 
        GROUP BY subscriptionTier
      `).all();

      check.details.user_distribution = userTiers.reduce((acc, tier) => {
        acc[tier.subscriptionTier] = tier.count;
        return acc;
      }, {});

      // Check task status distribution
      const taskStatuses = this.db.prepare(`
        SELECT status, COUNT(*) as count 
        FROM tasks 
        GROUP BY status
      `).all();

      check.details.task_status_distribution = taskStatuses.reduce((acc, status) => {
        acc[status.status] = status.count;
        return acc;
      }, {});

      // Check temporal distribution of analytics events
      const eventDistribution = this.db.prepare(`
        SELECT DATE(timestamp) as date, COUNT(*) as count 
        FROM analytics_events 
        WHERE timestamp > datetime('now', '-7 days')
        GROUP BY DATE(timestamp)
        ORDER BY date
      `).all();

      check.details.recent_activity_distribution = eventDistribution;

      // Detect patterns
      if (eventDistribution.length > 0) {
        const avgDaily = eventDistribution.reduce((sum, day) => sum + day.count, 0) / eventDistribution.length;
        check.patterns.avg_daily_events = Math.round(avgDaily);
        
        const maxDaily = Math.max(...eventDistribution.map(day => day.count));
        const minDaily = Math.min(...eventDistribution.map(day => day.count));
        check.patterns.activity_variance = Math.round(((maxDaily - minDaily) / avgDaily) * 100);
      }

    } catch (error) {
      check.status = 'failed';
      check.error = error.message;
    }

    report.checks.data_distribution = check;
  }

  /**
   * Get health trends over time
   */
  async getHealthTrends(days = 7) {
    // This would typically store health check results over time
    // For now, return a simplified trend analysis
    return {
      period_days: days,
      trend_analysis: 'Health monitoring trends not yet implemented',
      recommendation: 'Implement historical health data storage for trend analysis'
    };
  }

  /**
   * Generate health recommendations
   */
  generateRecommendations(healthReport) {
    const recommendations = [];

    // Mock data ratio recommendations
    if (healthReport.checks.mock_data_ratio?.overall_mock_ratio > 80) {
      recommendations.push({
        priority: 'high',
        category: 'data_cleanup',
        title: 'High Mock Data Ratio',
        description: 'Consider cleaning up mock data before production deployment',
        action: 'Use the Data Management interface to remove mock data'
      });
    }

    // Performance recommendations
    if (healthReport.checks.query_performance?.avg_response_time > 500) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        title: 'Query Performance Optimization',
        description: 'Some queries are running slower than optimal',
        action: 'Review and optimize slow queries, consider adding indexes'
      });
    }

    // Data quality recommendations
    if (healthReport.checks.data_quality?.quality_score < 95) {
      recommendations.push({
        priority: 'medium',
        category: 'data_quality',
        title: 'Data Quality Improvement',
        description: 'Data quality issues detected that should be addressed',
        action: 'Review and clean up data quality issues identified in the health check'
      });
    }

    return recommendations;
  }
}

module.exports = DataHealthMonitor;