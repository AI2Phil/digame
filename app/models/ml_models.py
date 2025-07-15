"""
Machine Learning Models for AI/ML API Management
Comprehensive model management, training, and prediction tracking
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON, Float, LargeBinary, Enum as DBEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from enum import Enum
from app.database import Base

class ModelType(str, Enum):
    CLASSIFICATION = "classification"
    REGRESSION = "regression"
    TIME_SERIES = "time_series"
    CLUSTERING = "clustering"
    NEURAL_NETWORK = "neural_network"
    DEEP_LEARNING = "deep_learning"
    REINFORCEMENT_LEARNING = "reinforcement_learning"

class ModelStatus(str, Enum):
    CREATED = "created"
    TRAINING = "training"
    TRAINED = "trained"
    DEPLOYED = "deployed"
    FAILED = "failed"
    ARCHIVED = "archived"

class TrainingStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class MLModel(Base):
    """Core ML Model management"""
    __table_args__ = {'extend_existing': True}
    __tablename__ = "ml_models"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    model_type = Column(DBEnum(ModelType), nullable=False)
    algorithm = Column(String(100), nullable=False)
    version = Column(String(50), default="1.0.0", nullable=False)
    status = Column(DBEnum(ModelStatus), default=ModelStatus.CREATED, nullable=False)
    
    # Model configuration
    hyperparameters = Column(JSON, nullable=True)
    feature_columns = Column(JSON, nullable=True)
    target_column = Column(String(100), nullable=True)
    
    # Performance metrics
    accuracy_score = Column(Float, nullable=True)
    precision_score = Column(Float, nullable=True)
    recall_score = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    mse_score = Column(Float, nullable=True)
    mae_score = Column(Float, nullable=True)
    r2_score = Column(Float, nullable=True)
    
    # Model artifacts
    model_path = Column(String(500), nullable=True)
    model_size_bytes = Column(Integer, nullable=True)
    model_binary = Column(LargeBinary, nullable=True)  # For small models
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_trained_at = Column(DateTime, nullable=True)
    deployed_at = Column(DateTime, nullable=True)
    
    # Relationships - temporarily disabled back_populates due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    creator = relationship("app.models.user.User")
    training_jobs = relationship("TrainingJob", back_populates="model", cascade="all, delete-orphan")
    predictions = relationship("ModelPrediction", back_populates="model", cascade="all, delete-orphan")
    evaluations = relationship("ModelEvaluation", back_populates="model", cascade="all, delete-orphan")
    deployments = relationship("ModelDeployment", back_populates="model", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<MLModel(id={self.id}, name='{self.name}', type='{self.model_type}', status='{self.status}')>"

class TrainingJob(Base):
    """Model training job tracking"""
    __table_args__ = {'extend_existing': True}
    __tablename__ = "training_jobs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ml_models.id"), nullable=False, index=True)
    job_name = Column(String(255), nullable=False)
    status = Column(DBEnum(TrainingStatus), default=TrainingStatus.PENDING, nullable=False)
    
    # Training configuration
    training_config = Column(JSON, nullable=False)
    dataset_path = Column(String(500), nullable=True)
    dataset_size = Column(Integer, nullable=True)
    
    # Training progress
    current_epoch = Column(Integer, default=0)
    total_epochs = Column(Integer, nullable=True)
    progress_percentage = Column(Float, default=0.0)
    
    # Training metrics
    training_loss = Column(Float, nullable=True)
    validation_loss = Column(Float, nullable=True)
    training_accuracy = Column(Float, nullable=True)
    validation_accuracy = Column(Float, nullable=True)
    
    # Execution details
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Resource usage
    cpu_usage_percent = Column(Float, nullable=True)
    memory_usage_mb = Column(Float, nullable=True)
    gpu_usage_percent = Column(Float, nullable=True)
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships - temporarily disabled back_populates due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    model = relationship("MLModel")
    creator = relationship("app.models.user.User")

    def __repr__(self):
        return f"<TrainingJob(id={self.id}, model_id={self.model_id}, status='{self.status}')>"

class ModelPrediction(Base):
    """Model prediction tracking"""
    __table_args__ = {'extend_existing': True}
    __tablename__ = "model_predictions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ml_models.id"), nullable=False, index=True)
    prediction_id = Column(String(100), nullable=False, index=True)
    
    # Input data
    input_data = Column(JSON, nullable=False)
    input_features = Column(JSON, nullable=True)
    
    # Prediction results
    predicted_value = Column(JSON, nullable=False)  # Can store various types
    confidence_score = Column(Float, nullable=True)
    probability_distribution = Column(JSON, nullable=True)
    
    # Prediction metadata
    prediction_time_ms = Column(Integer, nullable=True)
    model_version = Column(String(50), nullable=True)
    
    # Feedback and validation
    actual_value = Column(JSON, nullable=True)  # For later validation
    feedback_score = Column(Float, nullable=True)  # User feedback 1-5
    is_correct = Column(Boolean, nullable=True)
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships - temporarily disabled back_populates due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    model = relationship("MLModel")
    creator = relationship("app.models.user.User")

    def __repr__(self):
        return f"<ModelPrediction(id={self.id}, model_id={self.model_id}, prediction_id='{self.prediction_id}')>"

class ModelEvaluation(Base):
    """Model evaluation and testing results"""
    __table_args__ = {'extend_existing': True}
    __tablename__ = "model_evaluations"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ml_models.id"), nullable=False, index=True)
    evaluation_name = Column(String(255), nullable=False)
    
    # Evaluation configuration
    test_dataset_path = Column(String(500), nullable=True)
    test_dataset_size = Column(Integer, nullable=True)
    evaluation_config = Column(JSON, nullable=True)
    
    # Performance metrics
    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    auc_score = Column(Float, nullable=True)
    mse = Column(Float, nullable=True)
    mae = Column(Float, nullable=True)
    r2_score = Column(Float, nullable=True)
    
    # Detailed results
    confusion_matrix = Column(JSON, nullable=True)
    classification_report = Column(JSON, nullable=True)
    feature_importance = Column(JSON, nullable=True)
    
    # Metadata
    evaluated_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    evaluated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    model = relationship("MLModel")
    # Temporarily disabled back_populates due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    evaluator = relationship("app.models.user.User")

    def __repr__(self):
        return f"<ModelEvaluation(id={self.id}, model_id={self.model_id}, name='{self.evaluation_name}')>"

class ModelDeployment(Base):
    """Model deployment tracking"""
    __table_args__ = {'extend_existing': True}
    __tablename__ = "model_deployments"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(Integer, ForeignKey("ml_models.id"), nullable=False, index=True)
    deployment_name = Column(String(255), nullable=False)
    
    # Deployment configuration
    endpoint_url = Column(String(500), nullable=True)
    deployment_config = Column(JSON, nullable=True)
    environment = Column(String(50), default="production", nullable=False)  # dev, staging, production
    
    # Deployment status
    is_active = Column(Boolean, default=True, nullable=False)
    health_status = Column(String(50), default="healthy", nullable=False)
    
    # Performance monitoring
    request_count = Column(Integer, default=0)
    avg_response_time_ms = Column(Float, nullable=True)
    error_rate = Column(Float, default=0.0)
    uptime_percentage = Column(Float, default=100.0)
    
    # Resource usage
    cpu_usage = Column(Float, nullable=True)
    memory_usage = Column(Float, nullable=True)
    
    # Metadata
    deployed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    deployed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_health_check = Column(DateTime, nullable=True)
    
    # Relationships
    model = relationship("MLModel")
    # Temporarily disabled back_populates due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    deployer = relationship("app.models.user.User")

    def __repr__(self):
        return f"<ModelDeployment(id={self.id}, model_id={self.model_id}, name='{self.deployment_name}')>"

class DatasetMetadata(Base):
    """Dataset metadata for ML training"""
    __table_args__ = {'extend_existing': True}
    __tablename__ = "dataset_metadata"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Dataset details
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, nullable=True)
    format = Column(String(50), nullable=False)  # csv, json, parquet, etc.
    
    # Data statistics
    row_count = Column(Integer, nullable=True)
    column_count = Column(Integer, nullable=True)
    column_info = Column(JSON, nullable=True)  # Column names, types, statistics
    
    # Data quality
    missing_values_count = Column(Integer, nullable=True)
    duplicate_rows_count = Column(Integer, nullable=True)
    data_quality_score = Column(Float, nullable=True)
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships - temporarily disabled back_populates due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    creator = relationship("app.models.user.User")

    def __repr__(self):
        return f"<DatasetMetadata(id={self.id}, name='{self.name}', format='{self.format}')>"

class ExperimentRun(Base):
    """ML experiment tracking"""
    __table_args__ = {'extend_existing': True}
    __tablename__ = "experiment_runs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    experiment_name = Column(String(255), nullable=False, index=True)
    run_name = Column(String(255), nullable=False)
    
    # Experiment configuration
    model_config = Column(JSON, nullable=False)
    hyperparameters = Column(JSON, nullable=False)
    dataset_config = Column(JSON, nullable=False)
    
    # Results
    metrics = Column(JSON, nullable=True)
    artifacts = Column(JSON, nullable=True)  # Paths to saved artifacts
    
    # Execution details
    status = Column(String(50), default="running", nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    
    # Metadata
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    tags = Column(JSON, nullable=True)  # For organization and filtering
    notes = Column(Text, nullable=True)
    
    # Relationships - temporarily disabled back_populates due to registry conflicts
    # TODO: Re-enable after resolving SQLAlchemy registry mapping issues
    creator = relationship("app.models.user.User")

    def __repr__(self):
        return f"<ExperimentRun(id={self.id}, experiment='{self.experiment_name}', run='{self.run_name}')>"