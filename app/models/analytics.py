"""
Advanced Analytics models for predictive performance modeling and ROI measurement
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

# Use the existing Base from the project
from ..database import Base
from .user import User as UserModel # Import User model with alias
User = UserModel  # type: ignore  # Assign to avoid type conflicts


class AnalyticsModel(Base):  # type: ignore
    """
    Predictive analytics models and their configurations
    """
    __tablename__ = "analytics_models"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    model_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    
    # Model metadata
    name = Column(String(255), nullable=False)  # type: ignore
    display_name = Column(String(255), nullable=False)  # type: ignore
    description = Column(Text, nullable=True)  # type: ignore
    model_type = Column(String(100), nullable=False, index=True)  # type: ignore  # performance, roi, productivity, churn, etc.
    category = Column(String(100), nullable=False, index=True)  # type: ignore  # predictive, descriptive, prescriptive
    
    # Model configuration
    algorithm = Column(String(100), nullable=False)  # type: ignore  # linear_regression, random_forest, neural_network, etc.
    features = Column(JSON, default=[])  # type: ignore  # Input features for the model
    target_variable = Column(String(255), nullable=False)  # type: ignore  # What the model predicts
    hyperparameters = Column(JSON, default={})  # type: ignore  # Model-specific parameters
    dimensions = Column(JSON, default=[])  # type: ignore # For multi-dimensional metrics: list of dimension names
    metrics = Column(JSON, default=[])  # type: ignore # For multi-dimensional metrics: list of metric names
    aggregation_types = Column(JSON, default={})  # type: ignore # For multi-dimensional metrics: e.g. {"metric_name": "SUM"}
    
    # Training configuration
    training_data_source = Column(String(255), nullable=False)  # type: ignore  # Source of training data
    training_period_days = Column(Integer, default=90)  # type: ignore  # How much historical data to use
    retrain_frequency_days = Column(Integer, default=7)  # type: ignore  # How often to retrain
    validation_split = Column(Float, default=0.2)  # type: ignore  # Validation data percentage
    
    # Model performance metrics
    accuracy_score = Column(Float, nullable=True)  # type: ignore
    precision_score = Column(Float, nullable=True)  # type: ignore
    recall_score = Column(Float, nullable=True)  # type: ignore
    f1_score = Column(Float, nullable=True)  # type: ignore
    r2_score = Column(Float, nullable=True)  # type: ignore
    mae_score = Column(Float, nullable=True)  # type: ignore  # Mean Absolute Error
    rmse_score = Column(Float, nullable=True)  # type: ignore  # Root Mean Square Error
    
    # Model status and lifecycle
    status = Column(String(50), default="draft")  # type: ignore  # draft, training, trained, deployed, deprecated
    version = Column(String(50), default="1.0.0")  # type: ignore
    is_active = Column(Boolean, default=True)  # type: ignore
    is_production = Column(Boolean, default=False)  # type: ignore
    
    # Training history
    last_trained_at = Column(DateTime, nullable=True)  # type: ignore
    training_duration_seconds = Column(Integer, nullable=True)  # type: ignore
    training_samples_count = Column(Integer, nullable=True)  # type: ignore
    
    # Usage statistics
    prediction_count = Column(Integer, default=0)  # type: ignore
    last_prediction_at = Column(DateTime, nullable=True)  # type: ignore
    
    # Model persistence and training metadata
    model_path = Column(String(512), nullable=True)  # type: ignore # Path to the serialized model file
    training_metadata = Column(JSON, nullable=True)  # type: ignore # Stores training details like feature columns, encodings, etc.

    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))  # type: ignore
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))  # type: ignore
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # type: ignore
    
    # Relationships
    predictions = relationship("AnalyticsPrediction", back_populates="model", cascade="all, delete-orphan")
    training_jobs = relationship("AnalyticsTrainingJob", back_populates="model", cascade="all, delete-orphan")
    roi_calculations = relationship("ROICalculation", back_populates="analytics_model")

    def __repr__(self):
        return f"<AnalyticsModel(id={self.id}, name='{self.name}', type='{self.model_type}')>"

    @property
    def is_trained(self):
        """Check if model has been trained"""
        return self.status in ["trained", "deployed"] and self.last_trained_at is not None

    @property
    def needs_retraining(self):
        """Check if model needs retraining based on frequency"""
        if not getattr(self, 'last_trained_at', None):
            return True
        
        days_since_training = (datetime.now(timezone.utc) - self.last_trained_at).days
        return days_since_training >= self.retrain_frequency_days

    @property
    def performance_summary(self):
        """Get model performance summary"""
        return {
            "accuracy": self.accuracy_score,
            "precision": self.precision_score,
            "recall": self.recall_score,
            "f1": self.f1_score,
            "r2": self.r2_score,
            "mae": self.mae_score,
            "rmse": self.rmse_score
        }


class AnalyticsPrediction(Base):  # type: ignore
    """
    Individual predictions made by analytics models
    """
    __tablename__ = "analytics_predictions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)  # type: ignore
    prediction_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))  # type: ignore
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)  # type: ignore
    model_id = Column(Integer, ForeignKey("analytics_models.id"), nullable=False, index=True)  # type: ignore
    
    # Prediction context
    entity_type = Column(String(100), nullable=False)  # type: ignore  # user, project, task, etc.
    entity_id = Column(Integer, nullable=False, index=True)  # type: ignore
    prediction_type = Column(String(100), nullable=False)  # type: ignore  # performance, churn, roi, etc.
    
    # Input data
    input_features = Column(JSON, default={})  # type: ignore  # Features used for prediction
    feature_importance = Column(JSON, default={})  # type: ignore  # Feature importance scores
    
    # Prediction results
    predicted_value = Column(Float, nullable=True)  # type: ignore # Made nullable for multi-dimensional results
    predicted_values_multi_dim = Column(JSON, nullable=True)  # type: ignore # For multi-dimensional results: {dim_val: predicted_value} or list of {dims: {}, value: X}
    confidence_score = Column(Float, nullable=True)  # type: ignore  # Model confidence (0-1)
    prediction_interval_lower = Column(Float, nullable=True)  # type: ignore  # Lower bound
    prediction_interval_upper = Column(Float, nullable=True)  # type: ignore  # Upper bound
    benchmark_comparison_data = Column(JSON, nullable=True)  # type: ignore # {benchmark_name: value, entity_value: value, difference: X}
    
    # Prediction metadata
    prediction_horizon_days = Column(Integer, nullable=True)  # type: ignore  # How far into future
    prediction_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)  # type: ignore
    expires_at = Column(DateTime, nullable=True)  # type: ignore  # When prediction becomes stale
    
    # Validation and feedback
    actual_value = Column(Float, nullable=True)  # type: ignore  # Actual outcome (for validation)
    prediction_error = Column(Float, nullable=True)  # type: ignore  # Difference from actual
    is_validated = Column(Boolean, default=False)  # type: ignore
    validation_date = Column(DateTime, nullable=True)  # type: ignore
    raw_prediction_output = Column(JSON, nullable=True)  # type: ignore # Store raw output from complex models if needed for later processing
    
    # Usage tracking
    view_count = Column(Integer, default=0)  # type: ignore
    last_viewed_at = Column(DateTime, nullable=True)  # type: ignore
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))  # type: ignore
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # type: ignore
    
    # Relationships
    model = relationship("AnalyticsModel", back_populates="predictions")

    def __repr__(self):
        return f"<AnalyticsPrediction(id={self.id}, type='{self.prediction_type}', value={self.predicted_value})>"

    @property
    def is_accurate(self, tolerance=0.1):
        """Check if prediction was accurate within tolerance"""
        if not getattr(self, 'is_validated', False) or getattr(self, 'actual_value', None) is None:
            return None
        
        error_rate = abs(self.prediction_error) / abs(self.actual_value) if self.actual_value != 0 else abs(self.prediction_error)  # type: ignore
        return error_rate <= tolerance

    @property
    def is_expired(self):
        """Check if prediction has expired"""
        if not getattr(self, 'expires_at', None):
            return False
        return datetime.now(timezone.utc) > self.expires_at

    def validate_prediction(self, actual_value: float):
        """Validate prediction against actual outcome"""
        setattr(self, 'actual_value', actual_value)
        setattr(self, 'prediction_error', actual_value - getattr(self, 'predicted_value', 0))
        setattr(self, 'is_validated', True)
        setattr(self, 'validation_date', datetime.now(timezone.utc))


class AnalyticsTrainingJob(Base):  # type: ignore
    """
    Training jobs for analytics models
    """
    __tablename__ = "analytics_training_jobs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    job_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    model_id = Column(Integer, ForeignKey("analytics_models.id"), nullable=False, index=True)
    
    # Job configuration
    job_type = Column(String(50), nullable=False)  # initial, retrain, hyperparameter_tuning
    training_config = Column(JSON, default={})  # Training parameters
    data_source_config = Column(JSON, default={})  # Data source configuration
    
    # Execution details
    status = Column(String(50), default="pending")  # pending, running, completed, failed, cancelled
    started_at = Column(DateTime, nullable=True, index=True)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    
    # Training data statistics
    training_samples = Column(Integer, nullable=True)
    validation_samples = Column(Integer, nullable=True)
    test_samples = Column(Integer, nullable=True)
    feature_count = Column(Integer, nullable=True)
    
    # Training results
    final_metrics = Column(JSON, default={})  # Final model performance metrics
    training_history = Column(JSON, default={})  # Training progress over epochs
    feature_importance = Column(JSON, default={})  # Feature importance scores
    
    # Resource usage
    cpu_time_seconds = Column(Integer, nullable=True)
    memory_usage_mb = Column(Integer, nullable=True)
    gpu_time_seconds = Column(Integer, nullable=True)
    
    # Error handling
    error_message = Column(Text, nullable=True)
    error_details = Column(JSON, default={})
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    triggered_by = Column(String(100), nullable=False)  # user, schedule, auto_retrain
    triggered_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    model = relationship("AnalyticsModel", back_populates="training_jobs")

    def __repr__(self):
        return f"<AnalyticsTrainingJob(id={self.id}, status='{self.status}', model_id={self.model_id})>"

    @property
    def is_completed(self):
        return self.status in ["completed", "failed", "cancelled"]

    @property
    def success_rate(self):
        """Calculate training success rate"""
        if not getattr(self, 'final_metrics', None):
            return 0.0
        return self.final_metrics.get("accuracy", 0.0) * 100

    @property
    def training_speed(self):
        """Calculate training speed (samples per second)"""
        if not getattr(self, 'duration_seconds', None) or not getattr(self, 'training_samples', None):
            return 0.0
        return self.training_samples / self.duration_seconds

    def mark_completed(self, success: bool = True, metrics: dict = None):  # type: ignore
        """Mark training job as completed"""
        setattr(self, 'completed_at', datetime.now(timezone.utc))
        if getattr(self, 'started_at', None):
            setattr(self, 'duration_seconds', int((getattr(self, 'completed_at', datetime.now(timezone.utc)) - getattr(self, 'started_at', datetime.now(timezone.utc))).total_seconds()))
        setattr(self, 'status', "completed" if success else "failed")
        if metrics:
            setattr(self, 'final_metrics', metrics)

    def can_retry(self):
        """Check if training job can be retried"""
        return self.status == "failed" and self.retry_count < self.max_retries


class ROICalculation(Base):  # type: ignore
    """
    ROI (Return on Investment) calculations and measurements
    """
    __tablename__ = "roi_calculations"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    calculation_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # ROI context
    entity_type = Column(String(100), nullable=False)  # project, user, team, feature, etc.
    entity_id = Column(Integer, nullable=False, index=True)
    calculation_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Time period
    period_start = Column(DateTime, nullable=False, index=True)
    period_end = Column(DateTime, nullable=False, index=True)
    period_days = Column(Integer, nullable=False)
    
    # Investment costs
    initial_investment = Column(Numeric(15, 2), default=0.0)  # Upfront costs
    operational_costs = Column(Numeric(15, 2), default=0.0)  # Ongoing costs
    labor_costs = Column(Numeric(15, 2), default=0.0)  # Human resource costs
    technology_costs = Column(Numeric(15, 2), default=0.0)  # Software/hardware costs
    training_costs = Column(Numeric(15, 2), default=0.0)  # Training and onboarding
    other_costs = Column(Numeric(15, 2), default=0.0)  # Miscellaneous costs
    total_investment = Column(Numeric(15, 2), nullable=False)
    
    # Returns and benefits
    revenue_increase = Column(Numeric(15, 2), default=0.0)  # Direct revenue gains
    cost_savings = Column(Numeric(15, 2), default=0.0)  # Cost reductions
    productivity_gains = Column(Numeric(15, 2), default=0.0)  # Productivity improvements
    efficiency_gains = Column(Numeric(15, 2), default=0.0)  # Process efficiency
    quality_improvements = Column(Numeric(15, 2), default=0.0)  # Quality benefits
    risk_reduction = Column(Numeric(15, 2), default=0.0)  # Risk mitigation value
    other_benefits = Column(Numeric(15, 2), default=0.0)  # Other quantifiable benefits
    total_benefits = Column(Numeric(15, 2), nullable=False)
    
    # ROI metrics
    roi_percentage = Column(Float, nullable=False)  # (Benefits - Investment) / Investment * 100
    net_present_value = Column(Numeric(15, 2), nullable=True)  # NPV calculation
    payback_period_months = Column(Float, nullable=True)  # Time to break even
    internal_rate_return = Column(Float, nullable=True)  # IRR percentage
    
    # Calculation methodology
    calculation_method = Column(String(100), default="simple")  # simple, npv, irr, payback
    discount_rate = Column(Float, default=0.1)  # Discount rate for NPV
    assumptions = Column(JSON, default={})  # Calculation assumptions
    data_sources = Column(JSON, default=[])  # Sources of data used
    
    # Confidence and validation
    confidence_level = Column(Float, nullable=True)  # Confidence in calculation (0-1)
    validation_status = Column(String(50), default="pending")  # pending, validated, disputed
    validation_notes = Column(Text, nullable=True)
    
    # Analytics integration
    analytics_model_id = Column(Integer, ForeignKey("analytics_models.id"), nullable=True)
    prediction_accuracy = Column(Float, nullable=True)  # If based on predictions
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    calculated_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    approved_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # Relationships
    analytics_model = relationship("AnalyticsModel", back_populates="roi_calculations")

    def __repr__(self):
        return f"<ROICalculation(id={self.id}, entity='{self.entity_type}', roi={self.roi_percentage}%)>"

    @property
    def is_positive_roi(self):
        """Check if ROI is positive"""
        return self.roi_percentage > 0

    @property
    def roi_category(self):
        """Categorize ROI performance"""
        if getattr(self, 'roi_percentage', 0) >= 50:
            return "excellent"
        elif getattr(self, 'roi_percentage', 0) >= 25:
            return "good"
        elif getattr(self, 'roi_percentage', 0) >= 10:
            return "fair"
        elif getattr(self, 'roi_percentage', 0) >= 0:
            return "break_even"
        else:
            return "negative"

    @property
    def monthly_roi(self):
        """Calculate monthly ROI rate"""
        if getattr(self, 'period_days', 0) <= 0:
            return 0.0
        return (self.roi_percentage / 100) * (30 / self.period_days)

    def calculate_roi_metrics(self):
        """Calculate all ROI metrics"""
        # Basic ROI calculation
        if getattr(self, 'total_investment', 0) > 0:
            setattr(self, 'roi_percentage', float((getattr(self, 'total_benefits', 0) - getattr(self, 'total_investment', 0)) / getattr(self, 'total_investment', 1) * 100))
        else:
            setattr(self, 'roi_percentage', 0.0)
        
        # Payback period calculation
        if getattr(self, 'total_benefits', 0) > 0:
            monthly_benefit = float(getattr(self, 'total_benefits', 0)) / (getattr(self, 'period_days', 30) / 30)
            if monthly_benefit > 0:
                setattr(self, 'payback_period_months', float(getattr(self, 'total_investment', 0)) / monthly_benefit)
        
        # Simple NPV calculation (more complex NPV would require cash flow projections)
        if getattr(self, 'discount_rate', None) and getattr(self, 'period_days', None):
            from decimal import Decimal
            years = getattr(self, 'period_days', 365) / 365
            discount_factor = Decimal(str(1 / ((1 + getattr(self, 'discount_rate', 0.1)) ** years)))
            setattr(self, 'net_present_value', float(getattr(self, 'total_benefits', 0) * discount_factor - getattr(self, 'total_investment', 0)))

    def update_totals(self):
        """Update total investment and benefits"""
        setattr(self, 'total_investment', (
            getattr(self, 'initial_investment', 0) + getattr(self, 'operational_costs', 0) + getattr(self, 'labor_costs', 0) +
            getattr(self, 'technology_costs', 0) + getattr(self, 'training_costs', 0) + getattr(self, 'other_costs', 0)
        ))
        
        setattr(self, 'total_benefits', (
            getattr(self, 'revenue_increase', 0) + getattr(self, 'cost_savings', 0) + getattr(self, 'productivity_gains', 0) +
            getattr(self, 'efficiency_gains', 0) + getattr(self, 'quality_improvements', 0) + getattr(self, 'risk_reduction', 0) +
            getattr(self, 'other_benefits', 0)
        ))


class PerformanceMetric(Base):  # type: ignore
    """
    Performance metrics and KPIs for analytics tracking
    """
    __tablename__ = "analytics_performance_metrics"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    metric_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Metric definition
    metric_name = Column(String(255), nullable=False, index=True)
    display_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    metric_type = Column(String(100), nullable=False)  # productivity, quality, efficiency, engagement
    category = Column(String(100), nullable=False)  # user, project, team, system
    
    # Measurement configuration
    entity_type = Column(String(100), nullable=False)  # user, project, task, etc.
    entity_id = Column(Integer, nullable=False, index=True)
    dimensions_values = Column(JSON, nullable=True)  # E.g., {"country": "USA", "department": "Sales"}
    measurement_unit = Column(String(50), nullable=False)  # percentage, count, hours, etc.
    calculation_method = Column(String(100), nullable=False)  # sum, average, ratio, etc.
    
    # Metric value
    current_value = Column(Float, nullable=False)
    previous_value = Column(Float, nullable=True)
    baseline_value = Column(Float, nullable=True)
    target_value = Column(Float, nullable=True)
    
    # Trend analysis
    trend_direction = Column(String(20), nullable=True)  # increasing, decreasing, stable
    trend_percentage = Column(Float, nullable=True)  # Percentage change
    trend_significance = Column(String(20), nullable=True)  # significant, minor, none
    
    # Time period
    measurement_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    period_type = Column(String(50), nullable=False)  # daily, weekly, monthly, quarterly
    
    # Thresholds and alerts
    warning_threshold = Column(Float, nullable=True)
    critical_threshold = Column(Float, nullable=True)
    alert_status = Column(String(50), default="normal")  # normal, warning, critical
    
    # Data quality
    data_completeness = Column(Float, default=1.0)  # Percentage of complete data
    data_accuracy = Column(Float, default=1.0)  # Estimated accuracy
    confidence_score = Column(Float, default=1.0)  # Confidence in measurement
    
    # Metadata
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    measured_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    predicted_by_model_id = Column(Integer, ForeignKey("analytics_models.id"), nullable=True) # If this metric value is a forecast

    # Relationships
    predicted_by_model = relationship("AnalyticsModel", foreign_keys=[predicted_by_model_id])


    def __repr__(self):
        return f"<PerformanceMetric(id={self.id}, name='{self.metric_name}', value={self.current_value})>"

    @property
    def is_improving(self):
        """Check if metric is improving"""
        if self.previous_value is None:
            return None
        return self.current_value > self.previous_value

    @property
    def target_achievement(self):
        """Calculate target achievement percentage"""
        if getattr(self, 'target_value', None) is None or getattr(self, 'target_value', 0) == 0:
            return None
        return (self.current_value / self.target_value) * 100

    @property
    def performance_status(self):
        """Get performance status based on thresholds"""
        if getattr(self, 'critical_threshold', None) is not None:
            if getattr(self, 'current_value', 0) <= getattr(self, 'critical_threshold', 0):
                return "critical"
        
        if getattr(self, 'warning_threshold', None) is not None:
            if getattr(self, 'current_value', 0) <= getattr(self, 'warning_threshold', 0):
                return "warning"
        
        return "normal"

    def calculate_trend(self):
        """Calculate trend direction and significance"""
        if getattr(self, 'previous_value', None) is None or getattr(self, 'previous_value', 0) == 0:
            setattr(self, 'trend_direction', "stable")
            setattr(self, 'trend_percentage', 0.0)
            setattr(self, 'trend_significance', "none")
            return
        
        change = getattr(self, 'current_value', 0) - getattr(self, 'previous_value', 0)
        setattr(self, 'trend_percentage', (change / getattr(self, 'previous_value', 1)) * 100)
        
        # Determine direction
        if abs(getattr(self, 'trend_percentage', 0)) < 1:
            setattr(self, 'trend_direction', "stable")
        elif getattr(self, 'trend_percentage', 0) > 0:
            setattr(self, 'trend_direction', "increasing")
        else:
            setattr(self, 'trend_direction', "decreasing")
        
        # Determine significance
        abs_change = abs(getattr(self, 'trend_percentage', 0))
        if abs_change >= 10:
            setattr(self, 'trend_significance', "significant")
        elif abs_change >= 3:
            setattr(self, 'trend_significance', "minor")
        else:
            setattr(self, 'trend_significance', "none")

# Dashboard Models

class AnalyticsDashboard(Base):  # type: ignore
    """
    Represents a customizable analytics dashboard belonging to a user.
    A dashboard consists of a name, description, tags, and a layout of widgets.
    """
    __tablename__ = "analytics_dashboards"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    dashboard_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True) # Owner

    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Layout stores an array of objects: { widget_config_id: int, x: int, y: int, w: int, h: int }
    # This means DashboardWidgetConfig instances are independent and can potentially be reused
    # if we change this, but for now, let's assume layout directly references widgets owned by this dashboard.
    # For simplicity, if widgets are strictly part of a dashboard (not shared),
    # the layout might just be positions, and widgets have a dashboard_id FK.
    # Let's go with widgets belonging to a dashboard for now.
    # layout field will store grid positions of widgets linked by dashboard_id on DashboardWidgetConfig.
    # So, layout here might be more about dashboard-level display preferences if widgets are fetched via relationship.
    # Or, it can be the primary store for widget placement if widget configs are more generic.

    # Simpler approach for now: layout stores widget IDs and their positions.
    # Actual widget configurations are separate.
    layout = Column(JSON, nullable=True, default=[]) # Example: [{"widget_id": 1, "x": 0, "y": 0, "w": 4, "h": 2}, ...]

    tags = Column(JSON, nullable=True, default=[]) # List of strings

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationship: A dashboard has multiple widget configurations
    # If DashboardWidgetConfig has a dashboard_id FK
    widgets = relationship("DashboardWidgetConfig", back_populates="dashboard", cascade="all, delete-orphan")
    owner = relationship("User") # Assuming User model is available via from ..models.user import User

    def __repr__(self):
        return f"<AnalyticsDashboard(id={self.id}, name='{self.name}')>"

class DashboardWidgetConfig(Base):  # type: ignore
    """
    Configuration for a single widget within an AnalyticsDashboard.
    Defines the widget's type, title, data source, and display options.
    Each widget is associated with a parent dashboard.
    """
    __tablename__ = "dashboard_widget_configs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    widget_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))

    dashboard_id = Column(Integer, ForeignKey("analytics_dashboards.id"), nullable=False, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True) # For data scoping, matches dashboard's tenant

    widget_type = Column(String(100), nullable=False) # E.g., "line_chart", "kpi_card", "bar_chart", "table"
    title = Column(String(255), nullable=False)

    # Defines the data to be fetched for this widget
    # Example: {"type": "performance_metric", "params": {"metric_name": "cpu_usage", "entity_id": "server_1"}}
    # Example: {"type": "analytics_prediction", "params": {"model_id": 1, "input_features": {...}}}
    data_source_config = Column(JSON, nullable=False)

    # Defines visual options for the widget
    # Example: {"color_scheme": "blue", "time_range": "last_7_days", "show_legend": true}
    display_options = Column(JSON, nullable=True, default={})

    # Grid position - alternative to storing in AnalyticsDashboard.layout if widgets are always part of a specific dashboard cell
    # For more flexible layouts (like react-grid-layout), storing x,y,w,h on the dashboard.layout referring to widget_id is better.
    # Let's assume dashboard.layout handles placement. This model defines the widget's content and type.

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    dashboard = relationship("AnalyticsDashboard", back_populates="widgets")

    def __repr__(self):
        return f"<DashboardWidgetConfig(id={self.id}, title='{self.title}', type='{self.widget_type}')>"