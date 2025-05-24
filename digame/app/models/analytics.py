"""
Advanced Analytics models for predictive performance modeling and ROI measurement
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float, Numeric
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

# Use the existing Base from the project
try:
    from ..database import Base
except ImportError:
    # Fallback for development
    Base = declarative_base()


class AnalyticsModel(Base):
    """
    Predictive analytics models and their configurations
    """
    __tablename__ = "analytics_models"

    id = Column(Integer, primary_key=True, index=True)
    model_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Model metadata
    name = Column(String(255), nullable=False)
    display_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    model_type = Column(String(100), nullable=False, index=True)  # performance, roi, productivity, churn, etc.
    category = Column(String(100), nullable=False, index=True)  # predictive, descriptive, prescriptive
    
    # Model configuration
    algorithm = Column(String(100), nullable=False)  # linear_regression, random_forest, neural_network, etc.
    features = Column(JSON, default=[])  # Input features for the model
    target_variable = Column(String(255), nullable=False)  # What the model predicts
    hyperparameters = Column(JSON, default={})  # Model-specific parameters
    
    # Training configuration
    training_data_source = Column(String(255), nullable=False)  # Source of training data
    training_period_days = Column(Integer, default=90)  # How much historical data to use
    retrain_frequency_days = Column(Integer, default=7)  # How often to retrain
    validation_split = Column(Float, default=0.2)  # Validation data percentage
    
    # Model performance metrics
    accuracy_score = Column(Float, nullable=True)
    precision_score = Column(Float, nullable=True)
    recall_score = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    r2_score = Column(Float, nullable=True)
    mae_score = Column(Float, nullable=True)  # Mean Absolute Error
    rmse_score = Column(Float, nullable=True)  # Root Mean Square Error
    
    # Model status and lifecycle
    status = Column(String(50), default="draft")  # draft, training, trained, deployed, deprecated
    version = Column(String(50), default="1.0.0")
    is_active = Column(Boolean, default=True)
    is_production = Column(Boolean, default=False)
    
    # Training history
    last_trained_at = Column(DateTime, nullable=True)
    training_duration_seconds = Column(Integer, nullable=True)
    training_samples_count = Column(Integer, nullable=True)
    
    # Usage statistics
    prediction_count = Column(Integer, default=0)
    last_prediction_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
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
        if not self.last_trained_at:
            return True
        
        days_since_training = (datetime.utcnow() - self.last_trained_at).days
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


class AnalyticsPrediction(Base):
    """
    Individual predictions made by analytics models
    """
    __tablename__ = "analytics_predictions"

    id = Column(Integer, primary_key=True, index=True)
    prediction_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    model_id = Column(Integer, ForeignKey("analytics_models.id"), nullable=False, index=True)
    
    # Prediction context
    entity_type = Column(String(100), nullable=False)  # user, project, task, etc.
    entity_id = Column(Integer, nullable=False, index=True)
    prediction_type = Column(String(100), nullable=False)  # performance, churn, roi, etc.
    
    # Input data
    input_features = Column(JSON, default={})  # Features used for prediction
    feature_importance = Column(JSON, default={})  # Feature importance scores
    
    # Prediction results
    predicted_value = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=True)  # Model confidence (0-1)
    prediction_interval_lower = Column(Float, nullable=True)  # Lower bound
    prediction_interval_upper = Column(Float, nullable=True)  # Upper bound
    
    # Prediction metadata
    prediction_horizon_days = Column(Integer, nullable=True)  # How far into future
    prediction_date = Column(DateTime, default=datetime.utcnow, index=True)
    expires_at = Column(DateTime, nullable=True)  # When prediction becomes stale
    
    # Validation and feedback
    actual_value = Column(Float, nullable=True)  # Actual outcome (for validation)
    prediction_error = Column(Float, nullable=True)  # Difference from actual
    is_validated = Column(Boolean, default=False)
    validation_date = Column(DateTime, nullable=True)
    
    # Usage tracking
    view_count = Column(Integer, default=0)
    last_viewed_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    model = relationship("AnalyticsModel", back_populates="predictions")

    def __repr__(self):
        return f"<AnalyticsPrediction(id={self.id}, type='{self.prediction_type}', value={self.predicted_value})>"

    @property
    def is_accurate(self, tolerance=0.1):
        """Check if prediction was accurate within tolerance"""
        if not self.is_validated or self.actual_value is None:
            return None
        
        error_rate = abs(self.prediction_error) / abs(self.actual_value) if self.actual_value != 0 else abs(self.prediction_error)
        return error_rate <= tolerance

    @property
    def is_expired(self):
        """Check if prediction has expired"""
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at

    def validate_prediction(self, actual_value: float):
        """Validate prediction against actual outcome"""
        self.actual_value = actual_value
        self.prediction_error = actual_value - self.predicted_value
        self.is_validated = True
        self.validation_date = datetime.utcnow()


class AnalyticsTrainingJob(Base):
    """
    Training jobs for analytics models
    """
    __tablename__ = "analytics_training_jobs"

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
    created_at = Column(DateTime, default=datetime.utcnow)
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
        if not self.final_metrics:
            return 0.0
        return self.final_metrics.get("accuracy", 0.0) * 100

    @property
    def training_speed(self):
        """Calculate training speed (samples per second)"""
        if not self.duration_seconds or not self.training_samples:
            return 0.0
        return self.training_samples / self.duration_seconds

    def mark_completed(self, success: bool = True, metrics: dict = None):
        """Mark training job as completed"""
        self.completed_at = datetime.utcnow()
        if self.started_at:
            self.duration_seconds = int((self.completed_at - self.started_at).total_seconds())
        self.status = "completed" if success else "failed"
        if metrics:
            self.final_metrics = metrics

    def can_retry(self):
        """Check if training job can be retried"""
        return self.status == "failed" and self.retry_count < self.max_retries


class ROICalculation(Base):
    """
    ROI (Return on Investment) calculations and measurements
    """
    __tablename__ = "roi_calculations"

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
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
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
        if self.roi_percentage >= 50:
            return "excellent"
        elif self.roi_percentage >= 25:
            return "good"
        elif self.roi_percentage >= 10:
            return "fair"
        elif self.roi_percentage >= 0:
            return "break_even"
        else:
            return "negative"

    @property
    def monthly_roi(self):
        """Calculate monthly ROI rate"""
        if self.period_days <= 0:
            return 0.0
        return (self.roi_percentage / 100) * (30 / self.period_days)

    def calculate_roi_metrics(self):
        """Calculate all ROI metrics"""
        # Basic ROI calculation
        if self.total_investment > 0:
            self.roi_percentage = float((self.total_benefits - self.total_investment) / self.total_investment * 100)
        else:
            self.roi_percentage = 0.0
        
        # Payback period calculation
        if self.total_benefits > 0:
            monthly_benefit = float(self.total_benefits) / (self.period_days / 30)
            if monthly_benefit > 0:
                self.payback_period_months = float(self.total_investment) / monthly_benefit
        
        # Simple NPV calculation (more complex NPV would require cash flow projections)
        if self.discount_rate and self.period_days:
            years = self.period_days / 365
            discount_factor = 1 / ((1 + self.discount_rate) ** years)
            self.net_present_value = float(self.total_benefits * discount_factor - self.total_investment)

    def update_totals(self):
        """Update total investment and benefits"""
        self.total_investment = (
            self.initial_investment + self.operational_costs + self.labor_costs +
            self.technology_costs + self.training_costs + self.other_costs
        )
        
        self.total_benefits = (
            self.revenue_increase + self.cost_savings + self.productivity_gains +
            self.efficiency_gains + self.quality_improvements + self.risk_reduction +
            self.other_benefits
        )


class PerformanceMetric(Base):
    """
    Performance metrics and KPIs for analytics tracking
    """
    __tablename__ = "performance_metrics"

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
    measurement_date = Column(DateTime, default=datetime.utcnow, index=True)
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
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    measured_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

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
        if self.target_value is None or self.target_value == 0:
            return None
        return (self.current_value / self.target_value) * 100

    @property
    def performance_status(self):
        """Get performance status based on thresholds"""
        if self.critical_threshold is not None:
            if self.current_value <= self.critical_threshold:
                return "critical"
        
        if self.warning_threshold is not None:
            if self.current_value <= self.warning_threshold:
                return "warning"
        
        return "normal"

    def calculate_trend(self):
        """Calculate trend direction and significance"""
        if self.previous_value is None or self.previous_value == 0:
            self.trend_direction = "stable"
            self.trend_percentage = 0.0
            self.trend_significance = "none"
            return
        
        change = self.current_value - self.previous_value
        self.trend_percentage = (change / self.previous_value) * 100
        
        # Determine direction
        if abs(self.trend_percentage) < 1:
            self.trend_direction = "stable"
        elif self.trend_percentage > 0:
            self.trend_direction = "increasing"
        else:
            self.trend_direction = "decreasing"
        
        # Determine significance
        abs_change = abs(self.trend_percentage)
        if abs_change >= 10:
            self.trend_significance = "significant"
        elif abs_change >= 3:
            self.trend_significance = "minor"
        else:
            self.trend_significance = "none"