-- Platform Owner Advanced Analytics Database Schema Extensions
-- This schema extends the existing database with tables for advanced analytics and intelligence

-- ============================================================================
-- PLATFORM ANALYTICS EVENTS
-- ============================================================================

-- Core platform analytics events table
CREATE TABLE IF NOT EXISTS platform_analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_uuid TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL, -- 'user_action', 'system_metric', 'business_event'
    event_category TEXT NOT NULL, -- 'performance', 'user_behavior', 'system_health', 'business'
    event_subcategory TEXT, -- More specific categorization
    tenant_id TEXT,
    user_id INTEGER,
    session_id TEXT,
    event_data TEXT NOT NULL, -- JSON with detailed event information
    event_metadata TEXT DEFAULT '{}', -- JSON with additional metadata
    aggregation_level TEXT DEFAULT 'raw', -- 'raw', 'minute', 'hour', 'day', 'week', 'month'
    processing_status TEXT DEFAULT 'pending', -- 'pending', 'processed', 'aggregated', 'archived'
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    processed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_mock_data BOOLEAN DEFAULT FALSE,
    mock_data_category TEXT DEFAULT NULL,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Indexes for platform analytics events
CREATE INDEX IF NOT EXISTS idx_platform_analytics_type_timestamp ON platform_analytics_events(event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_category ON platform_analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_tenant ON platform_analytics_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_user ON platform_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_session ON platform_analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_processing ON platform_analytics_events(processing_status);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_aggregation ON platform_analytics_events(aggregation_level);

-- ============================================================================
-- PERFORMANCE METRICS TIME SERIES
-- ============================================================================

-- Time-series data for performance metrics
CREATE TABLE IF NOT EXISTS platform_performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_uuid TEXT UNIQUE NOT NULL,
    metric_type TEXT NOT NULL, -- 'response_time', 'throughput', 'error_rate', 'cpu_usage', 'memory_usage'
    metric_name TEXT NOT NULL,
    metric_value REAL NOT NULL,
    metric_unit TEXT, -- 'ms', 'requests/sec', 'percentage', 'bytes'
    dimensions TEXT DEFAULT '{}', -- JSON for multi-dimensional data (service, endpoint, region, etc.)
    tags TEXT DEFAULT '{}', -- JSON for additional tags
    tenant_id TEXT,
    service_name TEXT,
    endpoint_path TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    aggregation_window TEXT, -- '1m', '5m', '1h', '1d'
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_mock_data BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Indexes for performance metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type_timestamp ON platform_performance_metrics(metric_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON platform_performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_service ON platform_performance_metrics(service_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_tenant ON platform_performance_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_aggregation ON platform_performance_metrics(aggregation_window);

-- ============================================================================
-- AI/ML MODELS AND PREDICTIONS
-- ============================================================================

-- AI/ML model registry
CREATE TABLE IF NOT EXISTS platform_intelligence_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_uuid TEXT UNIQUE NOT NULL,
    model_name TEXT NOT NULL,
    model_type TEXT NOT NULL, -- 'predictive', 'classification', 'clustering', 'anomaly_detection'
    model_category TEXT NOT NULL, -- 'user_behavior', 'performance', 'business', 'security'
    model_version TEXT NOT NULL,
    model_description TEXT,
    training_data_size INTEGER,
    training_features TEXT, -- JSON array of feature names
    accuracy_score REAL,
    precision_score REAL,
    recall_score REAL,
    f1_score REAL,
    confidence_threshold REAL DEFAULT 0.8,
    last_trained TEXT,
    training_duration INTEGER, -- in seconds
    model_parameters TEXT, -- JSON with model hyperparameters
    model_artifacts_path TEXT, -- Path to stored model files
    is_active BOOLEAN DEFAULT TRUE,
    is_production BOOLEAN DEFAULT FALSE,
    created_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_mock_data BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for intelligence models
CREATE INDEX IF NOT EXISTS idx_intelligence_models_type ON platform_intelligence_models(model_type);
CREATE INDEX IF NOT EXISTS idx_intelligence_models_category ON platform_intelligence_models(model_category);
CREATE INDEX IF NOT EXISTS idx_intelligence_models_active ON platform_intelligence_models(is_active);
CREATE INDEX IF NOT EXISTS idx_intelligence_models_production ON platform_intelligence_models(is_production);

-- Model predictions and results
CREATE TABLE IF NOT EXISTS platform_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prediction_uuid TEXT UNIQUE NOT NULL,
    model_id INTEGER NOT NULL,
    prediction_type TEXT NOT NULL, -- 'user_churn', 'performance_forecast', 'anomaly_detection'
    input_data TEXT NOT NULL, -- JSON with input features
    prediction_result TEXT NOT NULL, -- JSON with prediction output
    confidence_score REAL,
    probability_scores TEXT, -- JSON with class probabilities
    feature_importance TEXT, -- JSON with feature importance scores
    actual_outcome TEXT, -- For accuracy tracking after the fact
    outcome_timestamp TEXT, -- When the actual outcome was recorded
    prediction_accuracy REAL, -- Calculated accuracy for this prediction
    tenant_id TEXT,
    user_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    expires_at TEXT, -- When this prediction becomes stale
    is_mock_data BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    FOREIGN KEY (model_id) REFERENCES platform_intelligence_models(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for predictions
CREATE INDEX IF NOT EXISTS idx_predictions_model ON platform_predictions(model_id);
CREATE INDEX IF NOT EXISTS idx_predictions_type ON platform_predictions(prediction_type);
CREATE INDEX IF NOT EXISTS idx_predictions_tenant ON platform_predictions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user ON platform_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created ON platform_predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_predictions_confidence ON platform_predictions(confidence_score);

-- ============================================================================
-- USER JOURNEY AND BEHAVIOR ANALYTICS
-- ============================================================================

-- User journey tracking
CREATE TABLE IF NOT EXISTS user_journey_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journey_uuid TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    session_id TEXT NOT NULL,
    tenant_id TEXT,
    event_sequence INTEGER NOT NULL, -- Order of events in the journey
    page_path TEXT,
    action_type TEXT NOT NULL, -- 'page_view', 'click', 'form_submit', 'api_call'
    action_target TEXT, -- Element clicked, form submitted, etc.
    action_data TEXT DEFAULT '{}', -- JSON with action-specific data
    duration_ms INTEGER, -- Time spent on this step
    referrer TEXT,
    user_agent TEXT,
    device_type TEXT, -- 'desktop', 'mobile', 'tablet'
    browser_name TEXT,
    operating_system TEXT,
    screen_resolution TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_mock_data BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Indexes for user journey events
CREATE INDEX IF NOT EXISTS idx_journey_events_user ON user_journey_events(user_id);
CREATE INDEX IF NOT EXISTS idx_journey_events_session ON user_journey_events(session_id);
CREATE INDEX IF NOT EXISTS idx_journey_events_tenant ON user_journey_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_journey_events_sequence ON user_journey_events(event_sequence);
CREATE INDEX IF NOT EXISTS idx_journey_events_action ON user_journey_events(action_type);
CREATE INDEX IF NOT EXISTS idx_journey_events_timestamp ON user_journey_events(timestamp);

-- Conversion funnel tracking
CREATE TABLE IF NOT EXISTS conversion_funnels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    funnel_uuid TEXT UNIQUE NOT NULL,
    funnel_name TEXT NOT NULL,
    funnel_description TEXT,
    funnel_steps TEXT NOT NULL, -- JSON array of funnel steps
    tenant_id TEXT,
    created_by INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_mock_data BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Conversion funnel results
CREATE TABLE IF NOT EXISTS conversion_funnel_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    result_uuid TEXT UNIQUE NOT NULL,
    funnel_id INTEGER NOT NULL,
    user_id INTEGER,
    session_id TEXT,
    tenant_id TEXT,
    step_number INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    step_completed BOOLEAN DEFAULT FALSE,
    step_timestamp TEXT,
    step_duration_ms INTEGER,
    conversion_rate REAL, -- Rate at this step
    drop_off_rate REAL, -- Drop-off rate at this step
    cohort_date TEXT, -- Date for cohort analysis
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_mock_data BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    FOREIGN KEY (funnel_id) REFERENCES conversion_funnels(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Indexes for conversion funnel results
CREATE INDEX IF NOT EXISTS idx_funnel_results_funnel ON conversion_funnel_results(funnel_id);
CREATE INDEX IF NOT EXISTS idx_funnel_results_user ON conversion_funnel_results(user_id);
CREATE INDEX IF NOT EXISTS idx_funnel_results_step ON conversion_funnel_results(step_number);
CREATE INDEX IF NOT EXISTS idx_funnel_results_cohort ON conversion_funnel_results(cohort_date);

-- ============================================================================
-- BUSINESS INTELLIGENCE AND ROI TRACKING
-- ============================================================================

-- Revenue and ROI tracking
CREATE TABLE IF NOT EXISTS platform_revenue_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_uuid TEXT UNIQUE NOT NULL,
    tenant_id TEXT,
    user_id INTEGER,
    revenue_type TEXT NOT NULL, -- 'subscription', 'usage', 'one_time', 'marketplace'
    revenue_category TEXT, -- 'new_customer', 'expansion', 'renewal', 'churn_recovery'
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    billing_period TEXT, -- 'monthly', 'yearly', 'one_time'
    feature_attribution TEXT, -- JSON mapping revenue to specific features
    cost_attribution TEXT, -- JSON with associated costs
    profit_margin REAL,
    customer_acquisition_cost REAL,
    lifetime_value REAL,
    churn_risk_score REAL,
    transaction_date TEXT NOT NULL,
    recognition_date TEXT, -- When revenue is recognized
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_mock_data BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for revenue metrics
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_tenant ON platform_revenue_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_user ON platform_revenue_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_type ON platform_revenue_metrics(revenue_type);
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_date ON platform_revenue_metrics(transaction_date);
CREATE INDEX IF NOT EXISTS idx_revenue_metrics_recognition ON platform_revenue_metrics(recognition_date);

-- Feature adoption and usage tracking
CREATE TABLE IF NOT EXISTS feature_adoption_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_uuid TEXT UNIQUE NOT NULL,
    feature_name TEXT NOT NULL,
    feature_category TEXT, -- 'core', 'premium', 'enterprise', 'ai_tools'
    tenant_id TEXT,
    user_id INTEGER,
    adoption_status TEXT NOT NULL, -- 'discovered', 'tried', 'adopted', 'power_user', 'churned'
    first_use_date TEXT,
    last_use_date TEXT,
    usage_frequency TEXT, -- 'daily', 'weekly', 'monthly', 'rarely'
    usage_count INTEGER DEFAULT 0,
    engagement_score REAL, -- 0-1 score based on usage patterns
    value_realization_score REAL, -- 0-1 score based on outcomes
    feedback_score REAL, -- User satisfaction score
    churn_risk REAL, -- Risk of churning from this feature
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_mock_data BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for feature adoption
CREATE INDEX IF NOT EXISTS idx_feature_adoption_feature ON feature_adoption_metrics(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_adoption_tenant ON feature_adoption_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feature_adoption_user ON feature_adoption_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_adoption_status ON feature_adoption_metrics(adoption_status);
CREATE INDEX IF NOT EXISTS idx_feature_adoption_engagement ON feature_adoption_metrics(engagement_score);

-- ============================================================================
-- SECURITY AND COMPLIANCE ANALYTICS
-- ============================================================================

-- Security events and threat detection
CREATE TABLE IF NOT EXISTS security_analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_uuid TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL, -- 'login_attempt', 'access_violation', 'data_access', 'privilege_escalation'
    severity_level TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    threat_category TEXT, -- 'brute_force', 'anomalous_access', 'data_exfiltration', 'insider_threat'
    user_id INTEGER,
    tenant_id TEXT,
    source_ip TEXT,
    user_agent TEXT,
    resource_accessed TEXT,
    action_attempted TEXT,
    success BOOLEAN,
    risk_score REAL, -- 0-1 risk assessment
    anomaly_score REAL, -- 0-1 anomaly detection score
    geolocation TEXT, -- JSON with location data
    device_fingerprint TEXT,
    session_id TEXT,
    event_data TEXT DEFAULT '{}', -- JSON with detailed event information
    investigation_status TEXT DEFAULT 'new', -- 'new', 'investigating', 'resolved', 'false_positive'
    assigned_to INTEGER, -- Security analyst assigned
    resolution_notes TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_mock_data BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for security analytics
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_analytics_events(severity_level);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_tenant ON security_analytics_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_events_risk ON security_analytics_events(risk_score);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON security_analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_events_status ON security_analytics_events(investigation_status);

-- Compliance monitoring and audit trails
CREATE TABLE IF NOT EXISTS compliance_audit_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_uuid TEXT UNIQUE NOT NULL,
    compliance_framework TEXT NOT NULL, -- 'GDPR', 'SOC2', 'HIPAA', 'PCI_DSS'
    audit_category TEXT NOT NULL, -- 'data_access', 'user_management', 'system_config', 'data_retention'
    event_type TEXT NOT NULL,
    user_id INTEGER,
    tenant_id TEXT,
    resource_type TEXT, -- 'user_data', 'system_config', 'audit_log'
    resource_id TEXT,
    action_performed TEXT,
    before_state TEXT, -- JSON with state before action
    after_state TEXT, -- JSON with state after action
    compliance_status TEXT, -- 'compliant', 'non_compliant', 'requires_review'
    risk_level TEXT, -- 'low', 'medium', 'high'
    remediation_required BOOLEAN DEFAULT FALSE,
    remediation_notes TEXT,
    retention_period INTEGER, -- Days to retain this audit record
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_mock_data BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Indexes for compliance audit events
CREATE INDEX IF NOT EXISTS idx_compliance_audit_framework ON compliance_audit_events(compliance_framework);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_category ON compliance_audit_events(audit_category);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_user ON compliance_audit_events(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_tenant ON compliance_audit_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_status ON compliance_audit_events(compliance_status);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_timestamp ON compliance_audit_events(timestamp);

-- ============================================================================
-- SYSTEM HEALTH AND OPERATIONAL METRICS
-- ============================================================================

-- System health scoring and monitoring
CREATE TABLE IF NOT EXISTS platform_health_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    score_uuid TEXT UNIQUE NOT NULL,
    component_name TEXT NOT NULL, -- 'database', 'api', 'cache', 'queue', 'overall'
    component_category TEXT, -- 'infrastructure', 'application', 'business'
    health_score REAL NOT NULL, -- 0-100 health score
    availability_score REAL,
    performance_score REAL,
    reliability_score REAL,
    security_score REAL,
    contributing_factors TEXT, -- JSON with factors affecting the score
    threshold_breaches TEXT, -- JSON with any threshold violations
    recommendations TEXT, -- JSON with improvement recommendations
    trend_direction TEXT, -- 'improving', 'stable', 'degrading'
    tenant_id TEXT,
    measurement_window TEXT, -- '5m', '1h', '1d'
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_mock_data BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Indexes for health scores
CREATE INDEX IF NOT EXISTS idx_health_scores_component ON platform_health_scores(component_name);
CREATE INDEX IF NOT EXISTS idx_health_scores_category ON platform_health_scores(component_category);
CREATE INDEX IF NOT EXISTS idx_health_scores_score ON platform_health_scores(health_score);
CREATE INDEX IF NOT EXISTS idx_health_scores_tenant ON platform_health_scores(tenant_id);
CREATE INDEX IF NOT EXISTS idx_health_scores_timestamp ON platform_health_scores(timestamp);

-- Incident tracking and management
CREATE TABLE IF NOT EXISTS platform_incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_uuid TEXT UNIQUE NOT NULL,
    incident_number TEXT UNIQUE NOT NULL, -- Human-readable incident number
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
    priority TEXT NOT NULL, -- 'p1', 'p2', 'p3', 'p4'
    status TEXT NOT NULL DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'closed'
    category TEXT, -- 'performance', 'security', 'data', 'infrastructure'
    affected_services TEXT, -- JSON array of affected services
    affected_users_count INTEGER DEFAULT 0,
    business_impact TEXT,
    root_cause TEXT,
    resolution_summary TEXT,
    created_by INTEGER,
    assigned_to INTEGER,
    escalated_to INTEGER,
    tenant_id TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    resolved_at TEXT,
    closed_at TEXT,
    time_to_detect INTEGER, -- Minutes from occurrence to detection
    time_to_resolve INTEGER, -- Minutes from detection to resolution
    is_mock_data BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (escalated_to) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Indexes for incidents
CREATE INDEX IF NOT EXISTS idx_incidents_status ON platform_incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON platform_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON platform_incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_assigned ON platform_incidents(assigned_to);
CREATE INDEX IF NOT EXISTS idx_incidents_tenant ON platform_incidents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_incidents_created ON platform_incidents(created_at);

-- ============================================================================
-- DATA QUALITY AND LINEAGE TRACKING
-- ============================================================================

-- Data quality monitoring
CREATE TABLE IF NOT EXISTS data_quality_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_uuid TEXT UNIQUE NOT NULL,
    dataset_name TEXT NOT NULL,
    table_name TEXT,
    column_name TEXT,
    quality_dimension TEXT NOT NULL, -- 'completeness', 'accuracy', 'consistency', 'timeliness', 'validity'
    quality_score REAL NOT NULL, -- 0-1 quality score
    record_count INTEGER,
    null_count INTEGER,
    duplicate_count INTEGER,
    invalid_count INTEGER,
    quality_rules TEXT, -- JSON with applied quality rules
    violations TEXT, -- JSON with quality violations found
    data_profile TEXT, -- JSON with data profiling results
    tenant_id TEXT,
    measurement_timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_mock_data BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Indexes for data quality metrics
CREATE INDEX IF NOT EXISTS idx_data_quality_dataset ON data_quality_metrics(dataset_name);
CREATE INDEX IF NOT EXISTS idx_data_quality_table ON data_quality_metrics(table_name);
CREATE INDEX IF NOT EXISTS idx_data_quality_dimension ON data_quality_metrics(quality_dimension);
CREATE INDEX IF NOT EXISTS idx_data_quality_score ON data_quality_metrics(quality_score);
CREATE INDEX IF NOT EXISTS idx_data_quality_tenant ON data_quality_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_data_quality_timestamp ON data_quality_metrics(measurement_timestamp);

-- ============================================================================
-- AGGREGATED ANALYTICS VIEWS
-- ============================================================================

-- Pre-aggregated hourly metrics for fast dashboard loading
CREATE TABLE IF NOT EXISTS platform_metrics_hourly (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_type TEXT NOT NULL,
    metric_category TEXT NOT NULL,
    tenant_id TEXT,
    hour_timestamp TEXT NOT NULL, -- Truncated to hour
    metric_values TEXT NOT NULL, -- JSON with aggregated values (avg, min, max, sum, count)
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_mock_data BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Indexes for hourly metrics
CREATE INDEX IF NOT EXISTS idx_metrics_hourly_type ON platform_metrics_hourly(metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_hourly_category ON platform_metrics_hourly(metric_category);
CREATE INDEX IF NOT EXISTS idx_metrics_hourly_tenant ON platform_metrics_hourly(tenant_id);
CREATE INDEX IF NOT EXISTS idx_metrics_hourly_timestamp ON platform_metrics_hourly(hour_timestamp);

-- Pre-aggregated daily metrics
CREATE TABLE IF NOT EXISTS platform_metrics_daily (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_type TEXT NOT NULL,
    metric_category TEXT NOT NULL,
    tenant_id TEXT,
    date_timestamp TEXT NOT NULL, -- Date only (YYYY-MM-DD)
    metric_values TEXT NOT NULL, -- JSON with aggregated values
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_mock_data BOOLEAN DEFAULT FALSE,
    
    -- Foreign key constraints
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL
);

-- Indexes for daily metrics
CREATE INDEX IF NOT EXISTS idx_metrics_daily_type ON platform_metrics_daily(metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_daily_category ON platform_metrics_daily(metric_category);
CREATE INDEX IF NOT EXISTS idx_metrics_daily_tenant ON platform_metrics_daily(tenant_id);
CREATE INDEX IF NOT EXISTS idx_metrics_daily_timestamp ON platform_metrics_daily(date_timestamp);

-- ============================================================================
-- SCHEMA METADATA AND VERSIONING
-- ============================================================================

-- Track schema versions and migrations
CREATE TABLE IF NOT EXISTS platform_schema_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version_number TEXT NOT NULL,
    schema_name TEXT NOT NULL,
    migration_script TEXT,
    applied_at TEXT DEFAULT CURRENT_TIMESTAMP,
    applied_by TEXT,
    rollback_script TEXT,
    notes TEXT
);

-- Insert initial schema version
INSERT OR IGNORE INTO platform_schema_versions (version_number, schema_name, notes)
VALUES ('1.0.0', 'platform-analytics-schema', 'Initial Platform Owner analytics schema');