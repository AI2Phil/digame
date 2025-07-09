const { faker } = require('@faker-js/faker');

class ReportingDataSeeder {
  constructor(db) {
    this.db = db;
  }

  async seedReportingData() {
    console.log('🔄 Starting comprehensive reporting data seeding...');
    
    try {
      // Create extended reporting tables
      await this.createReportingTables();
      
      // Seed comprehensive reporting data
      await this.seedReportTemplates();
      await this.seedCustomReports();
      await this.seedReportSchedules();
      await this.seedDataSources();
      await this.seedVisualizationConfigs();
      await this.seedReportAnalytics();
      await this.seedPredictiveModels();
      await this.seedReportSharing();
      await this.seedDashboardConfigs();
      await this.seedReportMetrics();
      
      console.log('✅ Reporting data seeding completed successfully');
      return { success: true, message: 'Reporting data seeded successfully' };
    } catch (error) {
      console.error('❌ Error seeding reporting data:', error);
      throw error;
    }
  }

  async createReportingTables() {
    const tables = [
      // Report Templates
      `CREATE TABLE IF NOT EXISTS report_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        template_type VARCHAR(50),
        config JSON,
        is_public BOOLEAN DEFAULT false,
        created_by INTEGER,
        tenant_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Custom Reports
      `CREATE TABLE IF NOT EXISTS custom_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        report_type VARCHAR(50),
        data_source VARCHAR(100),
        filters JSON,
        columns JSON,
        visualization_config JSON,
        schedule_config JSON,
        created_by INTEGER,
        tenant_id INTEGER,
        is_favorite BOOLEAN DEFAULT false,
        last_run DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Report Schedules
      `CREATE TABLE IF NOT EXISTS report_schedules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER,
        schedule_type VARCHAR(50),
        frequency VARCHAR(50),
        schedule_config JSON,
        recipients JSON,
        format VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        next_run DATETIME,
        last_run DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Data Sources
      `CREATE TABLE IF NOT EXISTS report_data_sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        source_type VARCHAR(50),
        connection_config JSON,
        schema_config JSON,
        refresh_frequency INTEGER,
        last_refresh DATETIME,
        status VARCHAR(20) DEFAULT 'active',
        tenant_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Visualization Configurations
      `CREATE TABLE IF NOT EXISTS visualization_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        chart_type VARCHAR(50),
        config JSON,
        theme VARCHAR(50),
        is_template BOOLEAN DEFAULT false,
        created_by INTEGER,
        tenant_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Report Analytics
      `CREATE TABLE IF NOT EXISTS report_analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER,
        user_id INTEGER,
        action VARCHAR(50),
        execution_time INTEGER,
        data_points INTEGER,
        filters_applied JSON,
        export_format VARCHAR(20),
        tenant_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Predictive Models
      `CREATE TABLE IF NOT EXISTS predictive_models (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        model_type VARCHAR(50),
        algorithm VARCHAR(100),
        training_data_source VARCHAR(100),
        accuracy_score DECIMAL(5,4),
        model_config JSON,
        predictions JSON,
        last_trained DATETIME,
        status VARCHAR(20) DEFAULT 'active',
        tenant_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Report Sharing
      `CREATE TABLE IF NOT EXISTS report_sharing (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER,
        shared_by INTEGER,
        shared_with INTEGER,
        share_type VARCHAR(50),
        permissions JSON,
        expires_at DATETIME,
        access_count INTEGER DEFAULT 0,
        last_accessed DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Dashboard Configurations
      `CREATE TABLE IF NOT EXISTS dashboard_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        layout JSON,
        widgets JSON,
        filters JSON,
        refresh_interval INTEGER,
        is_public BOOLEAN DEFAULT false,
        created_by INTEGER,
        tenant_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Report Metrics
      `CREATE TABLE IF NOT EXISTS report_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_id INTEGER,
        metric_name VARCHAR(100),
        metric_value DECIMAL(15,4),
        metric_type VARCHAR(50),
        calculation_method VARCHAR(100),
        time_period VARCHAR(50),
        dimensions JSON,
        tenant_id INTEGER,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const table of tables) {
      await this.db.exec(table);
    }
  }

  async seedReportTemplates() {
    const templates = [
      {
        name: 'Executive Summary Dashboard',
        description: 'High-level KPIs and metrics for executive reporting',
        category: 'Executive',
        template_type: 'dashboard',
        config: JSON.stringify({
          widgets: ['revenue_chart', 'user_growth', 'conversion_funnel', 'top_metrics'],
          layout: 'executive',
          refresh_interval: 3600
        }),
        is_public: true
      },
      {
        name: 'Sales Performance Report',
        description: 'Comprehensive sales metrics and pipeline analysis',
        category: 'Sales',
        template_type: 'report',
        config: JSON.stringify({
          metrics: ['revenue', 'deals_closed', 'pipeline_value', 'conversion_rate'],
          time_periods: ['daily', 'weekly', 'monthly', 'quarterly'],
          visualizations: ['line_chart', 'bar_chart', 'funnel']
        }),
        is_public: true
      },
      {
        name: 'User Engagement Analytics',
        description: 'User behavior and engagement tracking',
        category: 'Analytics',
        template_type: 'dashboard',
        config: JSON.stringify({
          metrics: ['dau', 'mau', 'session_duration', 'bounce_rate', 'retention'],
          segments: ['new_users', 'returning_users', 'power_users'],
          visualizations: ['cohort_analysis', 'funnel_analysis', 'heatmap']
        }),
        is_public: true
      },
      {
        name: 'Financial Performance Dashboard',
        description: 'Financial KPIs and budget tracking',
        category: 'Finance',
        template_type: 'dashboard',
        config: JSON.stringify({
          metrics: ['revenue', 'expenses', 'profit_margin', 'cash_flow', 'burn_rate'],
          comparisons: ['yoy', 'mom', 'budget_vs_actual'],
          alerts: ['budget_threshold', 'variance_alert']
        }),
        is_public: true
      },
      {
        name: 'Marketing Campaign Analysis',
        description: 'Campaign performance and ROI tracking',
        category: 'Marketing',
        template_type: 'report',
        config: JSON.stringify({
          metrics: ['impressions', 'clicks', 'conversions', 'cpa', 'roas'],
          channels: ['email', 'social', 'paid_search', 'display'],
          attribution: 'multi_touch'
        }),
        is_public: true
      },
      {
        name: 'Operational Efficiency Report',
        description: 'Process efficiency and productivity metrics',
        category: 'Operations',
        template_type: 'report',
        config: JSON.stringify({
          metrics: ['throughput', 'cycle_time', 'error_rate', 'utilization'],
          processes: ['support', 'fulfillment', 'onboarding'],
          benchmarks: 'industry_standard'
        }),
        is_public: true
      }
    ];

    for (let i = 0; i < templates.length; i++) {
      const template = templates[i];
      await this.db.run(`
        INSERT INTO report_templates (name, description, category, template_type, config, is_public, created_by, tenant_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        template.name,
        template.description,
        template.category,
        template.template_type,
        template.config,
        template.is_public,
        faker.number.int({ min: 1, max: 50 }),
        faker.number.int({ min: 1, max: 10 })
      ]);
    }
  }

  async seedCustomReports() {
    const reportTypes = ['table', 'chart', 'dashboard', 'pivot', 'summary'];
    const dataSources = ['users', 'orders', 'analytics', 'finance', 'support', 'marketing'];
    
    for (let i = 0; i < 100; i++) {
      const reportType = faker.helpers.arrayElement(reportTypes);
      const dataSource = faker.helpers.arrayElement(dataSources);
      
      await this.db.run(`
        INSERT INTO custom_reports (
          name, description, report_type, data_source, filters, columns, 
          visualization_config, schedule_config, created_by, tenant_id, 
          is_favorite, last_run
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        faker.company.buzzPhrase() + ' Report',
        faker.lorem.sentence(),
        reportType,
        dataSource,
        JSON.stringify({
          date_range: faker.helpers.arrayElement(['last_7_days', 'last_30_days', 'last_quarter']),
          filters: [
            { field: 'status', operator: 'equals', value: 'active' },
            { field: 'created_at', operator: 'greater_than', value: faker.date.recent({ days: 30 }).toISOString() }
          ]
        }),
        JSON.stringify([
          { name: 'id', type: 'number', visible: true },
          { name: 'name', type: 'string', visible: true },
          { name: 'created_at', type: 'date', visible: true },
          { name: 'value', type: 'currency', visible: true }
        ]),
        JSON.stringify({
          chart_type: faker.helpers.arrayElement(['line', 'bar', 'pie', 'area', 'scatter']),
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
          show_legend: true,
          show_grid: true
        }),
        JSON.stringify({
          enabled: faker.datatype.boolean(),
          frequency: faker.helpers.arrayElement(['daily', 'weekly', 'monthly']),
          time: '09:00',
          timezone: 'UTC'
        }),
        faker.number.int({ min: 1, max: 50 }),
        faker.number.int({ min: 1, max: 10 }),
        faker.datatype.boolean(),
        faker.date.recent({ days: 7 })
      ]);
    }
  }

  async seedReportSchedules() {
    const frequencies = ['daily', 'weekly', 'monthly', 'quarterly'];
    const formats = ['pdf', 'excel', 'csv', 'json'];
    
    for (let i = 0; i < 50; i++) {
      const frequency = faker.helpers.arrayElement(frequencies);
      
      await this.db.run(`
        INSERT INTO report_schedules (
          report_id, schedule_type, frequency, schedule_config, recipients, 
          format, is_active, next_run, last_run
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        faker.number.int({ min: 1, max: 100 }),
        'automated',
        frequency,
        JSON.stringify({
          time: faker.helpers.arrayElement(['09:00', '12:00', '18:00']),
          timezone: 'UTC',
          day_of_week: frequency === 'weekly' ? faker.number.int({ min: 1, max: 7 }) : null,
          day_of_month: frequency === 'monthly' ? faker.number.int({ min: 1, max: 28 }) : null
        }),
        JSON.stringify([
          { email: faker.internet.email(), name: faker.person.fullName() },
          { email: faker.internet.email(), name: faker.person.fullName() }
        ]),
        faker.helpers.arrayElement(formats),
        faker.datatype.boolean({ probability: 0.8 }),
        faker.date.future({ years: 0.1 }),
        faker.date.recent({ days: 30 })
      ]);
    }
  }

  async seedDataSources() {
    const sourceTypes = ['database', 'api', 'file', 'cloud_storage', 'third_party'];
    const statuses = ['active', 'inactive', 'error', 'syncing'];
    
    for (let i = 0; i < 25; i++) {
      const sourceType = faker.helpers.arrayElement(sourceTypes);
      
      await this.db.run(`
        INSERT INTO report_data_sources (
          name, source_type, connection_config, schema_config, 
          refresh_frequency, last_refresh, status, tenant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        faker.company.name() + ' ' + sourceType.charAt(0).toUpperCase() + sourceType.slice(1),
        sourceType,
        JSON.stringify({
          host: sourceType === 'database' ? faker.internet.domainName() : null,
          port: sourceType === 'database' ? faker.number.int({ min: 3000, max: 5432 }) : null,
          endpoint: sourceType === 'api' ? faker.internet.url() : null,
          auth_type: faker.helpers.arrayElement(['basic', 'oauth', 'api_key']),
          encrypted: true
        }),
        JSON.stringify({
          tables: ['users', 'orders', 'products', 'analytics'],
          primary_keys: { users: 'id', orders: 'order_id', products: 'product_id' },
          relationships: [
            { from: 'orders.user_id', to: 'users.id' },
            { from: 'orders.product_id', to: 'products.product_id' }
          ]
        }),
        faker.number.int({ min: 300, max: 86400 }), // 5 minutes to 24 hours
        faker.date.recent({ days: 1 }),
        faker.helpers.arrayElement(statuses),
        faker.number.int({ min: 1, max: 10 })
      ]);
    }
  }

  async seedVisualizationConfigs() {
    const chartTypes = ['line', 'bar', 'pie', 'area', 'scatter', 'heatmap', 'gauge', 'funnel'];
    const themes = ['default', 'dark', 'light', 'colorful', 'minimal', 'corporate'];
    
    for (let i = 0; i < 40; i++) {
      const chartType = faker.helpers.arrayElement(chartTypes);
      
      await this.db.run(`
        INSERT INTO visualization_configs (
          name, chart_type, config, theme, is_template, created_by, tenant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        faker.lorem.words(3) + ' ' + chartType.charAt(0).toUpperCase() + chartType.slice(1),
        chartType,
        JSON.stringify({
          colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
          animation: true,
          responsive: true,
          legend: { show: true, position: 'top' },
          grid: { show: true, color: '#E5E7EB' },
          axes: {
            x: { title: 'Time Period', format: 'date' },
            y: { title: 'Value', format: 'number' }
          },
          tooltip: { enabled: true, format: 'detailed' }
        }),
        faker.helpers.arrayElement(themes),
        faker.datatype.boolean({ probability: 0.3 }),
        faker.number.int({ min: 1, max: 50 }),
        faker.number.int({ min: 1, max: 10 })
      ]);
    }
  }

  async seedReportAnalytics() {
    const actions = ['view', 'export', 'share', 'schedule', 'edit', 'delete', 'duplicate'];
    const exportFormats = ['pdf', 'excel', 'csv', 'json', 'png'];
    
    // Generate 90 days of analytics data
    for (let day = 0; day < 90; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      
      // Generate 5-20 analytics entries per day
      const entriesPerDay = faker.number.int({ min: 5, max: 20 });
      
      for (let i = 0; i < entriesPerDay; i++) {
        const action = faker.helpers.arrayElement(actions);
        
        await this.db.run(`
          INSERT INTO report_analytics (
            report_id, user_id, action, execution_time, data_points, 
            filters_applied, export_format, tenant_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          faker.number.int({ min: 1, max: 100 }),
          faker.number.int({ min: 1, max: 50 }),
          action,
          faker.number.int({ min: 100, max: 5000 }), // milliseconds
          faker.number.int({ min: 10, max: 10000 }),
          JSON.stringify({
            date_range: faker.helpers.arrayElement(['last_7_days', 'last_30_days', 'custom']),
            filters: [
              { field: 'status', value: faker.helpers.arrayElement(['active', 'inactive']) },
              { field: 'category', value: faker.commerce.department() }
            ]
          }),
          action === 'export' ? faker.helpers.arrayElement(exportFormats) : null,
          faker.number.int({ min: 1, max: 10 }),
          new Date(date.getTime() + faker.number.int({ min: 0, max: 86400000 }))
        ]);
      }
    }
  }

  async seedPredictiveModels() {
    const modelTypes = ['regression', 'classification', 'clustering', 'time_series', 'anomaly_detection'];
    const algorithms = ['linear_regression', 'random_forest', 'neural_network', 'svm', 'gradient_boosting'];
    const statuses = ['active', 'training', 'inactive', 'error'];
    
    for (let i = 0; i < 15; i++) {
      const modelType = faker.helpers.arrayElement(modelTypes);
      const algorithm = faker.helpers.arrayElement(algorithms);
      
      await this.db.run(`
        INSERT INTO predictive_models (
          name, model_type, algorithm, training_data_source, accuracy_score, 
          model_config, predictions, last_trained, status, tenant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        faker.lorem.words(2) + ' ' + modelType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) + ' Model',
        modelType,
        algorithm,
        faker.helpers.arrayElement(['users', 'orders', 'analytics', 'finance']),
        faker.number.float({ min: 0.7, max: 0.99, fractionDigits: 4 }),
        JSON.stringify({
          features: ['feature_1', 'feature_2', 'feature_3'],
          hyperparameters: {
            learning_rate: faker.number.float({ min: 0.001, max: 0.1, fractionDigits: 4 }),
            max_depth: faker.number.int({ min: 3, max: 10 }),
            n_estimators: faker.number.int({ min: 50, max: 200 })
          },
          validation: { method: 'cross_validation', folds: 5 }
        }),
        JSON.stringify({
          next_30_days: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            predicted_value: faker.number.float({ min: 100, max: 1000, fractionDigits: 2 }),
            confidence: faker.number.float({ min: 0.6, max: 0.95, fractionDigits: 3 })
          }))
        }),
        faker.date.recent({ days: 30 }),
        faker.helpers.arrayElement(statuses),
        faker.number.int({ min: 1, max: 10 })
      ]);
    }
  }

  async seedReportSharing() {
    const shareTypes = ['view_only', 'edit', 'full_access', 'temporary'];
    
    for (let i = 0; i < 75; i++) {
      const shareType = faker.helpers.arrayElement(shareTypes);
      
      await this.db.run(`
        INSERT INTO report_sharing (
          report_id, shared_by, shared_with, share_type, permissions, 
          expires_at, access_count, last_accessed
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        faker.number.int({ min: 1, max: 100 }),
        faker.number.int({ min: 1, max: 50 }),
        faker.number.int({ min: 1, max: 50 }),
        shareType,
        JSON.stringify({
          can_view: true,
          can_edit: shareType === 'edit' || shareType === 'full_access',
          can_share: shareType === 'full_access',
          can_export: shareType !== 'view_only',
          can_schedule: shareType === 'full_access'
        }),
        shareType === 'temporary' ? faker.date.future({ years: 0.1 }) : null,
        faker.number.int({ min: 0, max: 50 }),
        faker.date.recent({ days: 30 })
      ]);
    }
  }

  async seedDashboardConfigs() {
    const layouts = ['grid', 'masonry', 'tabs', 'sidebar', 'fullscreen'];
    
    for (let i = 0; i < 30; i++) {
      const layout = faker.helpers.arrayElement(layouts);
      
      await this.db.run(`
        INSERT INTO dashboard_configs (
          name, layout, widgets, filters, refresh_interval, 
          is_public, created_by, tenant_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        faker.company.buzzPhrase() + ' Dashboard',
        JSON.stringify({
          type: layout,
          columns: faker.number.int({ min: 2, max: 4 }),
          responsive: true,
          spacing: faker.number.int({ min: 10, max: 30 })
        }),
        JSON.stringify([
          {
            id: 'widget_1',
            type: 'chart',
            title: 'Revenue Trend',
            position: { x: 0, y: 0, w: 6, h: 4 },
            config: { chart_type: 'line', data_source: 'revenue' }
          },
          {
            id: 'widget_2',
            type: 'metric',
            title: 'Total Users',
            position: { x: 6, y: 0, w: 3, h: 2 },
            config: { metric: 'user_count', format: 'number' }
          },
          {
            id: 'widget_3',
            type: 'table',
            title: 'Top Products',
            position: { x: 0, y: 4, w: 9, h: 4 },
            config: { data_source: 'products', limit: 10 }
          }
        ]),
        JSON.stringify({
          global_filters: [
            { name: 'date_range', type: 'daterange', default: 'last_30_days' },
            { name: 'region', type: 'select', options: ['US', 'EU', 'APAC'] }
          ],
          filter_interactions: true
        }),
        faker.number.int({ min: 300, max: 3600 }), // 5 minutes to 1 hour
        faker.datatype.boolean({ probability: 0.2 }),
        faker.number.int({ min: 1, max: 50 }),
        faker.number.int({ min: 1, max: 10 })
      ]);
    }
  }

  async seedReportMetrics() {
    const metricNames = [
      'revenue', 'profit_margin', 'user_count', 'conversion_rate', 'churn_rate',
      'avg_order_value', 'customer_lifetime_value', 'monthly_recurring_revenue',
      'cost_per_acquisition', 'return_on_ad_spend', 'net_promoter_score',
      'page_views', 'bounce_rate', 'session_duration', 'click_through_rate'
    ];
    
    const metricTypes = ['currency', 'percentage', 'count', 'ratio', 'score'];
    const timePeriods = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
    
    // Generate 6 months of metrics data
    for (let month = 0; month < 6; month++) {
      for (let day = 0; day < 30; day++) {
        const date = new Date();
        date.setMonth(date.getMonth() - month);
        date.setDate(day + 1);
        
        // Generate 3-8 metrics per day
        const metricsPerDay = faker.number.int({ min: 3, max: 8 });
        
        for (let i = 0; i < metricsPerDay; i++) {
          const metricName = faker.helpers.arrayElement(metricNames);
          const metricType = faker.helpers.arrayElement(metricTypes);
          
          let metricValue;
          switch (metricType) {
            case 'currency':
              metricValue = faker.number.float({ min: 1000, max: 100000, fractionDigits: 2 });
              break;
            case 'percentage':
              metricValue = faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
              break;
            case 'count':
              metricValue = faker.number.int({ min: 1, max: 10000 });
              break;
            case 'ratio':
              metricValue = faker.number.float({ min: 0.1, max: 10, fractionDigits: 3 });
              break;
            case 'score':
              metricValue = faker.number.float({ min: 1, max: 10, fractionDigits: 1 });
              break;
            default:
              metricValue = faker.number.float({ min: 0, max: 1000, fractionDigits: 2 });
          }
          
          await this.db.run(`
            INSERT INTO report_metrics (
              report_id, metric_name, metric_value, metric_type, 
              calculation_method, time_period, dimensions, tenant_id, recorded_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            faker.number.int({ min: 1, max: 100 }),
            metricName,
            metricValue,
            metricType,
            faker.helpers.arrayElement(['sum', 'average', 'count', 'median', 'max', 'min']),
            faker.helpers.arrayElement(timePeriods),
            JSON.stringify({
              region: faker.helpers.arrayElement(['US', 'EU', 'APAC']),
              channel: faker.helpers.arrayElement(['web', 'mobile', 'api']),
              segment: faker.helpers.arrayElement(['enterprise', 'smb', 'individual'])
            }),
            faker.number.int({ min: 1, max: 10 }),
            date
          ]);
        }
      }
    }
  }
}

module.exports = ReportingDataSeeder;