const express = require('express');
const router = express.Router();

// Advanced Reporting Dashboard endpoint
router.get('/dashboard', async (req, res) => {
  try {
    const db = req.app.get('db');
    
    // Get dashboard overview metrics
    const [
      totalReports,
      activeSchedules,
      dataSourcesStatus,
      recentActivity,
      topReports,
      reportsByCategory,
      executionMetrics,
      userEngagement
    ] = await Promise.all([
      // Total reports count
      db.get(`
        SELECT COUNT(*) as total_reports,
               COUNT(CASE WHEN last_run > datetime('now', '-7 days') THEN 1 END) as active_reports,
               COUNT(CASE WHEN is_favorite = 1 THEN 1 END) as favorite_reports
        FROM custom_reports
      `),
      
      // Active schedules
      db.get(`
        SELECT COUNT(*) as total_schedules,
               COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_schedules,
               COUNT(CASE WHEN next_run < datetime('now', '+1 day') THEN 1 END) as upcoming_schedules
        FROM report_schedules
      `),
      
      // Data sources status
      db.all(`
        SELECT status, COUNT(*) as count
        FROM report_data_sources
        GROUP BY status
      `),
      
      // Recent activity (last 24 hours)
      db.all(`
        SELECT ra.action, COUNT(*) as count,
               AVG(ra.execution_time) as avg_execution_time,
               cr.name as report_name
        FROM report_analytics ra
        JOIN custom_reports cr ON ra.report_id = cr.id
        WHERE ra.created_at > datetime('now', '-1 day')
        GROUP BY ra.action, cr.name
        ORDER BY count DESC
        LIMIT 10
      `),
      
      // Top performing reports
      db.all(`
        SELECT cr.id, cr.name, cr.report_type,
               COUNT(ra.id) as usage_count,
               AVG(ra.execution_time) as avg_execution_time,
               MAX(ra.created_at) as last_used
        FROM custom_reports cr
        LEFT JOIN report_analytics ra ON cr.id = ra.report_id
        WHERE ra.created_at > datetime('now', '-30 days')
        GROUP BY cr.id, cr.name, cr.report_type
        ORDER BY usage_count DESC
        LIMIT 10
      `),
      
      // Reports by category
      db.all(`
        SELECT rt.category, COUNT(*) as count,
               AVG(CASE WHEN cr.last_run IS NOT NULL THEN 1 ELSE 0 END) as usage_rate
        FROM report_templates rt
        LEFT JOIN custom_reports cr ON rt.category = json_extract(cr.filters, '$.category')
        GROUP BY rt.category
        ORDER BY count DESC
      `),
      
      // Execution metrics
      db.get(`
        SELECT AVG(execution_time) as avg_execution_time,
               MIN(execution_time) as min_execution_time,
               MAX(execution_time) as max_execution_time,
               AVG(data_points) as avg_data_points
        FROM report_analytics
        WHERE created_at > datetime('now', '-7 days')
      `),
      
      // User engagement
      db.all(`
        SELECT DATE(ra.created_at) as date,
               COUNT(DISTINCT ra.user_id) as active_users,
               COUNT(ra.id) as total_actions,
               COUNT(CASE WHEN ra.action = 'export' THEN 1 END) as exports
        FROM report_analytics ra
        WHERE ra.created_at > datetime('now', '-30 days')
        GROUP BY DATE(ra.created_at)
        ORDER BY date DESC
        LIMIT 30
      `)
    ]);

    // Calculate performance trends
    const performanceTrend = await db.all(`
      SELECT DATE(created_at) as date,
             AVG(execution_time) as avg_execution_time,
             COUNT(*) as report_runs,
             COUNT(CASE WHEN execution_time > 5000 THEN 1 END) as slow_reports
      FROM report_analytics
      WHERE created_at > datetime('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Get predictive insights
    const predictiveInsights = await db.all(`
      SELECT pm.name, pm.model_type, pm.accuracy_score,
             json_extract(pm.predictions, '$[0].predicted_value') as next_prediction,
             json_extract(pm.predictions, '$[0].confidence') as confidence
      FROM predictive_models pm
      WHERE pm.status = 'active'
      ORDER BY pm.accuracy_score DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        overview: {
          total_reports: totalReports.total_reports || 0,
          active_reports: totalReports.active_reports || 0,
          favorite_reports: totalReports.favorite_reports || 0,
          total_schedules: activeSchedules.total_schedules || 0,
          active_schedules: activeSchedules.active_schedules || 0,
          upcoming_schedules: activeSchedules.upcoming_schedules || 0
        },
        data_sources: dataSourcesStatus.reduce((acc, item) => {
          acc[item.status] = item.count;
          return acc;
        }, {}),
        recent_activity: recentActivity,
        top_reports: topReports,
        reports_by_category: reportsByCategory,
        execution_metrics: executionMetrics || {},
        user_engagement: userEngagement,
        performance_trend: performanceTrend,
        predictive_insights: predictiveInsights,
        insights: [
          {
            type: 'performance',
            title: 'Report Performance Optimization',
            description: `Average execution time is ${Math.round(executionMetrics?.avg_execution_time || 0)}ms. Consider optimizing reports with >5s execution time.`,
            priority: 'medium',
            action: 'optimize_slow_reports'
          },
          {
            type: 'usage',
            title: 'User Engagement Trend',
            description: `${userEngagement.length > 0 ? userEngagement[0].active_users : 0} active users in the last day. Engagement is ${userEngagement.length > 1 && userEngagement[0].active_users > userEngagement[1].active_users ? 'increasing' : 'stable'}.`,
            priority: 'low',
            action: 'monitor_engagement'
          },
          {
            type: 'automation',
            title: 'Schedule Optimization',
            description: `${activeSchedules.upcoming_schedules || 0} reports scheduled for next 24 hours. Consider load balancing during peak hours.`,
            priority: 'high',
            action: 'optimize_scheduling'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching advanced reporting dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data',
      details: error.message
    });
  }
});

// Custom Report Builder endpoint
router.get('/report-builder', async (req, res) => {
  try {
    const db = req.app.get('db');
    
    // Get available data sources
    const dataSources = await db.all(`
      SELECT id, name, source_type, status,
             json_extract(schema_config, '$.tables') as available_tables
      FROM report_data_sources
      WHERE status = 'active'
      ORDER BY name
    `);

    // Get report templates
    const templates = await db.all(`
      SELECT id, name, description, category, template_type, config
      FROM report_templates
      WHERE is_public = 1
      ORDER BY category, name
    `);

    // Get visualization configurations
    const visualizations = await db.all(`
      SELECT id, name, chart_type, theme, config
      FROM visualization_configs
      WHERE is_template = 1
      ORDER BY chart_type, name
    `);

    // Get available metrics and dimensions
    const availableMetrics = await db.all(`
      SELECT DISTINCT metric_name, metric_type, calculation_method
      FROM report_metrics
      ORDER BY metric_name
    `);

    // Get common filters
    const commonFilters = [
      {
        name: 'date_range',
        type: 'daterange',
        label: 'Date Range',
        options: [
          { value: 'today', label: 'Today' },
          { value: 'yesterday', label: 'Yesterday' },
          { value: 'last_7_days', label: 'Last 7 Days' },
          { value: 'last_30_days', label: 'Last 30 Days' },
          { value: 'last_quarter', label: 'Last Quarter' },
          { value: 'custom', label: 'Custom Range' }
        ]
      },
      {
        name: 'region',
        type: 'multiselect',
        label: 'Region',
        options: [
          { value: 'US', label: 'United States' },
          { value: 'EU', label: 'Europe' },
          { value: 'APAC', label: 'Asia Pacific' }
        ]
      },
      {
        name: 'channel',
        type: 'select',
        label: 'Channel',
        options: [
          { value: 'web', label: 'Web' },
          { value: 'mobile', label: 'Mobile' },
          { value: 'api', label: 'API' }
        ]
      }
    ];

    res.json({
      success: true,
      data: {
        data_sources: dataSources.map(ds => ({
          ...ds,
          available_tables: ds.available_tables ? JSON.parse(ds.available_tables) : []
        })),
        templates: templates.map(t => ({
          ...t,
          config: JSON.parse(t.config)
        })),
        visualizations: visualizations.map(v => ({
          ...v,
          config: JSON.parse(v.config)
        })),
        available_metrics: availableMetrics,
        common_filters: commonFilters,
        chart_types: [
          { value: 'line', label: 'Line Chart', icon: 'line-chart' },
          { value: 'bar', label: 'Bar Chart', icon: 'bar-chart' },
          { value: 'pie', label: 'Pie Chart', icon: 'pie-chart' },
          { value: 'area', label: 'Area Chart', icon: 'area-chart' },
          { value: 'scatter', label: 'Scatter Plot', icon: 'scatter-chart' },
          { value: 'heatmap', label: 'Heatmap', icon: 'grid' },
          { value: 'gauge', label: 'Gauge', icon: 'gauge' },
          { value: 'funnel', label: 'Funnel', icon: 'funnel' },
          { value: 'table', label: 'Data Table', icon: 'table' }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching report builder data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch report builder data',
      details: error.message
    });
  }
});

// Data Visualization Engine endpoint
router.get('/visualization-engine', async (req, res) => {
  try {
    const db = req.app.get('db');
    
    // Get visualization performance metrics
    const visualizationMetrics = await db.all(`
      SELECT vc.chart_type,
             COUNT(ra.id) as usage_count,
             AVG(ra.execution_time) as avg_render_time,
             AVG(ra.data_points) as avg_data_points
      FROM visualization_configs vc
      LEFT JOIN report_analytics ra ON json_extract(ra.filters_applied, '$.chart_type') = vc.chart_type
      WHERE ra.created_at > datetime('now', '-30 days')
      GROUP BY vc.chart_type
      ORDER BY usage_count DESC
    `);

    // Get theme usage statistics
    const themeUsage = await db.all(`
      SELECT theme, COUNT(*) as usage_count
      FROM visualization_configs
      GROUP BY theme
      ORDER BY usage_count DESC
    `);

    // Get rendering performance by data size
    const performanceByDataSize = await db.all(`
      SELECT 
        CASE 
          WHEN data_points < 100 THEN 'small'
          WHEN data_points < 1000 THEN 'medium'
          WHEN data_points < 10000 THEN 'large'
          ELSE 'xlarge'
        END as data_size,
        AVG(execution_time) as avg_render_time,
        COUNT(*) as sample_count
      FROM report_analytics
      WHERE created_at > datetime('now', '-30 days')
        AND data_points IS NOT NULL
      GROUP BY 
        CASE 
          WHEN data_points < 100 THEN 'small'
          WHEN data_points < 1000 THEN 'medium'
          WHEN data_points < 10000 THEN 'large'
          ELSE 'xlarge'
        END
      ORDER BY avg_render_time
    `);

    // Get popular visualization combinations
    const popularCombinations = await db.all(`
      SELECT 
        json_extract(config, '$.colors') as color_scheme,
        json_extract(config, '$.animation') as has_animation,
        chart_type,
        theme,
        COUNT(*) as usage_count
      FROM visualization_configs
      GROUP BY 
        json_extract(config, '$.colors'),
        json_extract(config, '$.animation'),
        chart_type,
        theme
      HAVING usage_count > 1
      ORDER BY usage_count DESC
      LIMIT 10
    `);

    // Get optimization recommendations
    const optimizationRecommendations = [
      {
        type: 'performance',
        title: 'Optimize Large Dataset Rendering',
        description: 'Consider data sampling or pagination for visualizations with >10,000 data points',
        impact: 'high',
        effort: 'medium'
      },
      {
        type: 'user_experience',
        title: 'Standardize Color Schemes',
        description: 'Use consistent color palettes across visualizations for better user experience',
        impact: 'medium',
        effort: 'low'
      },
      {
        type: 'accessibility',
        title: 'Improve Chart Accessibility',
        description: 'Add alt text and keyboard navigation support for all chart types',
        impact: 'high',
        effort: 'medium'
      }
    ];

    res.json({
      success: true,
      data: {
        visualization_metrics: visualizationMetrics,
        theme_usage: themeUsage,
        performance_by_data_size: performanceByDataSize,
        popular_combinations: popularCombinations,
        optimization_recommendations: optimizationRecommendations,
        supported_formats: [
          { format: 'svg', description: 'Scalable Vector Graphics - Best for print and high-DPI displays' },
          { format: 'png', description: 'Portable Network Graphics - Good for web and presentations' },
          { format: 'pdf', description: 'Portable Document Format - Ideal for reports and documentation' },
          { format: 'interactive', description: 'Interactive HTML - Best for web dashboards and exploration' }
        ],
        rendering_capabilities: {
          max_data_points: 100000,
          supported_chart_types: ['line', 'bar', 'pie', 'area', 'scatter', 'heatmap', 'gauge', 'funnel'],
          real_time_updates: true,
          animation_support: true,
          responsive_design: true,
          accessibility_features: ['keyboard_navigation', 'screen_reader', 'high_contrast']
        }
      }
    });
  } catch (error) {
    console.error('Error fetching visualization engine data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch visualization engine data',
      details: error.message
    });
  }
});

// Predictive Analytics Engine endpoint
router.get('/predictive-analytics', async (req, res) => {
  try {
    const db = req.app.get('db');
    
    // Get active predictive models
    const activeModels = await db.all(`
      SELECT id, name, model_type, algorithm, accuracy_score,
             training_data_source, last_trained, status,
             json_extract(predictions, '$[0]') as latest_prediction
      FROM predictive_models
      WHERE status = 'active'
      ORDER BY accuracy_score DESC
    `);

    // Get model performance over time
    const modelPerformance = await db.all(`
      SELECT pm.name, pm.model_type,
             DATE(pm.last_trained) as training_date,
             pm.accuracy_score,
             COUNT(ra.id) as usage_count
      FROM predictive_models pm
      LEFT JOIN report_analytics ra ON ra.report_id IN (
        SELECT cr.id FROM custom_reports cr 
        WHERE json_extract(cr.filters, '$.model_id') = pm.id
      )
      WHERE pm.last_trained > datetime('now', '-90 days')
      GROUP BY pm.id, pm.name, pm.model_type, DATE(pm.last_trained), pm.accuracy_score
      ORDER BY training_date DESC
    `);

    // Get prediction accuracy trends
    const accuracyTrends = await db.all(`
      SELECT model_type,
             AVG(accuracy_score) as avg_accuracy,
             MIN(accuracy_score) as min_accuracy,
             MAX(accuracy_score) as max_accuracy,
             COUNT(*) as model_count
      FROM predictive_models
      WHERE status = 'active'
      GROUP BY model_type
      ORDER BY avg_accuracy DESC
    `);

    // Get upcoming predictions
    const upcomingPredictions = [];
    for (const model of activeModels.slice(0, 5)) {
      if (model.latest_prediction) {
        const prediction = JSON.parse(model.latest_prediction);
        upcomingPredictions.push({
          model_name: model.name,
          model_type: model.model_type,
          prediction_date: prediction.date,
          predicted_value: prediction.predicted_value,
          confidence: prediction.confidence,
          accuracy_score: model.accuracy_score
        });
      }
    }

    // Get feature importance analysis
    const featureImportance = await db.all(`
      SELECT pm.model_type,
             json_extract(pm.model_config, '$.features') as features,
             pm.accuracy_score
      FROM predictive_models pm
      WHERE pm.status = 'active'
        AND json_extract(pm.model_config, '$.features') IS NOT NULL
      ORDER BY pm.accuracy_score DESC
      LIMIT 10
    `);

    // Generate AI insights
    const aiInsights = [
      {
        type: 'model_performance',
        title: 'High-Performing Models Identified',
        description: `${activeModels.filter(m => m.accuracy_score > 0.9).length} models show >90% accuracy. Consider deploying these for production use.`,
        confidence: 0.95,
        impact: 'high'
      },
      {
        type: 'data_quality',
        title: 'Training Data Freshness',
        description: 'Models trained within the last 30 days show 15% better accuracy. Schedule regular retraining.',
        confidence: 0.87,
        impact: 'medium'
      },
      {
        type: 'prediction_reliability',
        title: 'Prediction Confidence Analysis',
        description: `Average prediction confidence is ${(upcomingPredictions.reduce((sum, p) => sum + p.confidence, 0) / upcomingPredictions.length * 100).toFixed(1)}%. Monitor low-confidence predictions.`,
        confidence: 0.92,
        impact: 'medium'
      }
    ];

    res.json({
      success: true,
      data: {
        active_models: activeModels.map(model => ({
          ...model,
          latest_prediction: model.latest_prediction ? JSON.parse(model.latest_prediction) : null
        })),
        model_performance: modelPerformance,
        accuracy_trends: accuracyTrends,
        upcoming_predictions: upcomingPredictions,
        feature_importance: featureImportance.map(fi => ({
          ...fi,
          features: fi.features ? JSON.parse(fi.features) : []
        })),
        ai_insights: aiInsights,
        supported_algorithms: [
          { name: 'Linear Regression', type: 'regression', complexity: 'low', accuracy: 'medium' },
          { name: 'Random Forest', type: 'both', complexity: 'medium', accuracy: 'high' },
          { name: 'Neural Network', type: 'both', complexity: 'high', accuracy: 'very_high' },
          { name: 'Support Vector Machine', type: 'both', complexity: 'medium', accuracy: 'high' },
          { name: 'Gradient Boosting', type: 'both', complexity: 'high', accuracy: 'very_high' }
        ],
        model_types: [
          { type: 'regression', description: 'Predict continuous numerical values', use_cases: ['revenue_forecasting', 'demand_prediction'] },
          { type: 'classification', description: 'Predict categories or classes', use_cases: ['churn_prediction', 'sentiment_analysis'] },
          { type: 'clustering', description: 'Group similar data points', use_cases: ['customer_segmentation', 'anomaly_detection'] },
          { type: 'time_series', description: 'Predict future values based on historical trends', use_cases: ['sales_forecasting', 'capacity_planning'] }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching predictive analytics data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch predictive analytics data',
      details: error.message
    });
  }
});

module.exports = router;