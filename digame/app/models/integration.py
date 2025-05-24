"""
Integration APIs models for third-party productivity tools and services
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey, Float
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

class IntegrationProvider(Base):
    """
    Third-party integration providers and their configurations
    """
    __tablename__ = "integration_providers"

    id = Column(Integer, primary_key=True, index=True)
    provider_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    
    # Provider metadata
    name = Column(String(255), nullable=False, unique=True)
    display_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)  # productivity, communication, storage, etc.
    
    # Provider configuration
    provider_type = Column(String(100), nullable=False)  # oauth2, api_key, webhook, etc.
    base_url = Column(String(500), nullable=True)
    api_version = Column(String(50), nullable=True)
    documentation_url = Column(String(500), nullable=True)
    
    # Authentication configuration
    auth_config = Column(JSON, default={})  # OAuth endpoints, scopes, etc.
    required_scopes = Column(JSON, default=[])  # Required permissions
    optional_scopes = Column(JSON, default=[])  # Optional permissions
    
    # Capabilities and features
    supported_features = Column(JSON, default=[])  # sync, webhook, real_time, etc.
    rate_limits = Column(JSON, default={})  # API rate limiting info
    webhook_support = Column(Boolean, default=False)
    real_time_sync = Column(Boolean, default=False)
    
    # Status and availability
    is_active = Column(Boolean, default=True)
    is_beta = Column(Boolean, default=False)
    maintenance_mode = Column(Boolean, default=False)
    
    # Usage statistics
    total_connections = Column(Integer, default=0)
    active_connections = Column(Integer, default=0)
    last_sync_at = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    connections = relationship("IntegrationConnection", back_populates="provider", cascade="all, delete-orphan")
    sync_logs = relationship("IntegrationSyncLog", back_populates="provider", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<IntegrationProvider(id={self.id}, name='{self.name}', category='{self.category}')>"

    @property
    def connection_success_rate(self):
        """Calculate connection success rate"""
        if self.total_connections == 0:
            return 0.0
        return (self.active_connections / self.total_connections) * 100

    def get_auth_url(self, redirect_uri: str, state: str = None) -> str:
        """Generate OAuth authorization URL"""
        if self.provider_type != "oauth2":
            return None
        
        auth_config = self.auth_config
        auth_url = auth_config.get("authorization_url")
        client_id = auth_config.get("client_id")
        
        if not auth_url or not client_id:
            return None
        
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": " ".join(self.required_scopes)
        }
        
        if state:
            params["state"] = state
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{auth_url}?{query_string}"


class IntegrationConnection(Base):
    """
    User connections to third-party services
    """
    __tablename__ = "integration_connections"

    id = Column(Integer, primary_key=True, index=True)
    connection_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    provider_id = Column(Integer, ForeignKey("integration_providers.id"), nullable=False, index=True)
    
    # Connection metadata
    connection_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Authentication data
    auth_type = Column(String(50), nullable=False)  # oauth2, api_key, basic, etc.
    access_token = Column(Text, nullable=True)  # Encrypted
    refresh_token = Column(Text, nullable=True)  # Encrypted
    token_expires_at = Column(DateTime, nullable=True)
    api_key = Column(Text, nullable=True)  # Encrypted
    
    # Connection configuration
    granted_scopes = Column(JSON, default=[])
    sync_settings = Column(JSON, default={})  # What to sync, frequency, etc.
    webhook_url = Column(String(500), nullable=True)
    webhook_secret = Column(String(255), nullable=True)
    
    # External service info
    external_user_id = Column(String(255), nullable=True)
    external_username = Column(String(255), nullable=True)
    external_email = Column(String(255), nullable=True)
    external_profile = Column(JSON, default={})
    
    # Status and health
    status = Column(String(50), default="active")  # active, inactive, error, expired
    last_sync_at = Column(DateTime, nullable=True)
    last_error = Column(Text, nullable=True)
    error_count = Column(Integer, default=0)
    
    # Usage statistics
    total_syncs = Column(Integer, default=0)
    successful_syncs = Column(Integer, default=0)
    failed_syncs = Column(Integer, default=0)
    data_transferred_bytes = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_used_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    provider = relationship("IntegrationProvider", back_populates="connections")
    sync_logs = relationship("IntegrationSyncLog", back_populates="connection", cascade="all, delete-orphan")
    data_mappings = relationship("IntegrationDataMapping", back_populates="connection", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<IntegrationConnection(id={self.id}, name='{self.connection_name}', status='{self.status}')>"

    @property
    def is_token_expired(self):
        """Check if access token is expired"""
        if not self.token_expires_at:
            return False
        return datetime.utcnow() > self.token_expires_at

    @property
    def sync_success_rate(self):
        """Calculate sync success rate"""
        if self.total_syncs == 0:
            return 0.0
        return (self.successful_syncs / self.total_syncs) * 100

    @property
    def health_score(self):
        """Calculate connection health score (0-100)"""
        if self.status != "active":
            return 0.0
        
        # Base score
        score = 100.0
        
        # Deduct for errors
        if self.error_count > 0:
            score -= min(self.error_count * 5, 50)
        
        # Deduct for low sync success rate
        success_rate = self.sync_success_rate
        if success_rate < 90:
            score -= (90 - success_rate)
        
        # Deduct for token expiration
        if self.is_token_expired:
            score -= 30
        
        return max(score, 0.0)

    def refresh_access_token(self):
        """Refresh the access token using refresh token"""
        # Implementation would make API call to refresh token
        pass

    def test_connection(self):
        """Test the connection to the external service"""
        # Implementation would make a test API call
        pass


class IntegrationSyncLog(Base):
    """
    Logs of integration synchronization operations
    """
    __tablename__ = "integration_sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    sync_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    connection_id = Column(Integer, ForeignKey("integration_connections.id"), nullable=False, index=True)
    provider_id = Column(Integer, ForeignKey("integration_providers.id"), nullable=False, index=True)
    
    # Sync operation details
    sync_type = Column(String(100), nullable=False)  # full, incremental, webhook, manual
    sync_direction = Column(String(50), nullable=False)  # import, export, bidirectional
    operation = Column(String(100), nullable=False)  # sync_tasks, sync_projects, sync_contacts, etc.
    
    # Execution details
    status = Column(String(50), default="running")  # running, completed, failed, cancelled
    started_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    
    # Data processing statistics
    records_processed = Column(Integer, default=0)
    records_created = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    records_deleted = Column(Integer, default=0)
    records_skipped = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    
    # Data transfer statistics
    data_sent_bytes = Column(Integer, default=0)
    data_received_bytes = Column(Integer, default=0)
    api_calls_made = Column(Integer, default=0)
    
    # Error handling
    error_message = Column(Text, nullable=True)
    error_details = Column(JSON, default={})
    retry_count = Column(Integer, default=0)
    max_retries = Column(Integer, default=3)
    
    # Sync configuration
    sync_config = Column(JSON, default={})  # Filters, mappings, etc.
    last_sync_cursor = Column(String(255), nullable=True)  # For incremental syncs
    
    # Metadata
    triggered_by = Column(String(100), nullable=False)  # user, schedule, webhook, system
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    connection = relationship("IntegrationConnection", back_populates="sync_logs")
    provider = relationship("IntegrationProvider", back_populates="sync_logs")

    def __repr__(self):
        return f"<IntegrationSyncLog(id={self.id}, operation='{self.operation}', status='{self.status}')>"

    @property
    def is_completed(self):
        return self.status in ["completed", "failed", "cancelled"]

    @property
    def success_rate(self):
        """Calculate record processing success rate"""
        if self.records_processed == 0:
            return 0.0
        successful = self.records_created + self.records_updated + self.records_deleted
        return (successful / self.records_processed) * 100

    @property
    def processing_speed(self):
        """Calculate records per second"""
        if not self.duration_seconds or self.duration_seconds == 0:
            return 0.0
        return self.records_processed / self.duration_seconds

    def mark_completed(self, success: bool = True):
        """Mark sync as completed"""
        self.completed_at = datetime.utcnow()
        self.duration_seconds = int((self.completed_at - self.started_at).total_seconds())
        self.status = "completed" if success else "failed"

    def can_retry(self):
        """Check if sync can be retried"""
        return self.status == "failed" and self.retry_count < self.max_retries


class IntegrationDataMapping(Base):
    """
    Data field mappings between internal and external systems
    """
    __tablename__ = "integration_data_mappings"

    id = Column(Integer, primary_key=True, index=True)
    mapping_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    connection_id = Column(Integer, ForeignKey("integration_connections.id"), nullable=False, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Mapping configuration
    entity_type = Column(String(100), nullable=False)  # task, project, user, etc.
    mapping_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Field mappings
    internal_fields = Column(JSON, default={})  # Internal field definitions
    external_fields = Column(JSON, default={})  # External field definitions
    field_mappings = Column(JSON, default={})  # Field mapping rules
    
    # Transformation rules
    transformations = Column(JSON, default={})  # Data transformation rules
    validation_rules = Column(JSON, default={})  # Data validation rules
    default_values = Column(JSON, default={})  # Default values for missing fields
    
    # Sync configuration
    sync_direction = Column(String(50), default="bidirectional")  # import, export, bidirectional
    conflict_resolution = Column(String(50), default="latest_wins")  # latest_wins, manual, skip
    
    # Status and usage
    is_active = Column(Boolean, default=True)
    last_used_at = Column(DateTime, nullable=True)
    usage_count = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    connection = relationship("IntegrationConnection", back_populates="data_mappings")

    def __repr__(self):
        return f"<IntegrationDataMapping(id={self.id}, entity_type='{self.entity_type}', name='{self.mapping_name}')>"

    def map_internal_to_external(self, internal_data: dict) -> dict:
        """Transform internal data to external format"""
        external_data = {}
        
        for internal_field, external_field in self.field_mappings.items():
            if internal_field in internal_data:
                value = internal_data[internal_field]
                
                # Apply transformations
                if internal_field in self.transformations:
                    transformation = self.transformations[internal_field]
                    value = self._apply_transformation(value, transformation)
                
                external_data[external_field] = value
            elif external_field in self.default_values:
                external_data[external_field] = self.default_values[external_field]
        
        return external_data

    def map_external_to_internal(self, external_data: dict) -> dict:
        """Transform external data to internal format"""
        internal_data = {}
        
        # Reverse mapping
        reverse_mappings = {v: k for k, v in self.field_mappings.items()}
        
        for external_field, internal_field in reverse_mappings.items():
            if external_field in external_data:
                value = external_data[external_field]
                
                # Apply reverse transformations
                if internal_field in self.transformations:
                    transformation = self.transformations[internal_field]
                    value = self._apply_reverse_transformation(value, transformation)
                
                internal_data[internal_field] = value
            elif internal_field in self.default_values:
                internal_data[internal_field] = self.default_values[internal_field]
        
        return internal_data

    def _apply_transformation(self, value, transformation):
        """Apply data transformation rule"""
        transform_type = transformation.get("type")
        
        if transform_type == "format_date":
            # Date format transformation
            from_format = transformation.get("from_format", "%Y-%m-%d")
            to_format = transformation.get("to_format", "%m/%d/%Y")
            try:
                date_obj = datetime.strptime(str(value), from_format)
                return date_obj.strftime(to_format)
            except:
                return value
        
        elif transform_type == "map_value":
            # Value mapping transformation
            value_map = transformation.get("value_map", {})
            return value_map.get(str(value), value)
        
        elif transform_type == "prefix":
            # Add prefix
            prefix = transformation.get("prefix", "")
            return f"{prefix}{value}"
        
        elif transform_type == "suffix":
            # Add suffix
            suffix = transformation.get("suffix", "")
            return f"{value}{suffix}"
        
        return value

    def _apply_reverse_transformation(self, value, transformation):
        """Apply reverse data transformation"""
        transform_type = transformation.get("type")
        
        if transform_type == "format_date":
            # Reverse date format transformation
            from_format = transformation.get("to_format", "%m/%d/%Y")
            to_format = transformation.get("from_format", "%Y-%m-%d")
            try:
                date_obj = datetime.strptime(str(value), from_format)
                return date_obj.strftime(to_format)
            except:
                return value
        
        elif transform_type == "map_value":
            # Reverse value mapping
            value_map = transformation.get("value_map", {})
            reverse_map = {v: k for k, v in value_map.items()}
            return reverse_map.get(str(value), value)
        
        elif transform_type == "prefix":
            # Remove prefix
            prefix = transformation.get("prefix", "")
            if str(value).startswith(prefix):
                return str(value)[len(prefix):]
            return value
        
        elif transform_type == "suffix":
            # Remove suffix
            suffix = transformation.get("suffix", "")
            if str(value).endswith(suffix):
                return str(value)[:-len(suffix)]
            return value
        
        return value

    def validate_data(self, data: dict, direction: str = "internal") -> dict:
        """Validate data against validation rules"""
        errors = []
        warnings = []
        
        fields = self.internal_fields if direction == "internal" else self.external_fields
        
        for field_name, field_config in fields.items():
            if field_name in data:
                value = data[field_name]
                
                # Required field validation
                if field_config.get("required", False) and not value:
                    errors.append(f"Field '{field_name}' is required")
                
                # Type validation
                expected_type = field_config.get("type")
                if expected_type and value is not None:
                    if expected_type == "string" and not isinstance(value, str):
                        errors.append(f"Field '{field_name}' must be a string")
                    elif expected_type == "integer" and not isinstance(value, int):
                        errors.append(f"Field '{field_name}' must be an integer")
                    elif expected_type == "boolean" and not isinstance(value, bool):
                        errors.append(f"Field '{field_name}' must be a boolean")
                
                # Length validation
                max_length = field_config.get("max_length")
                if max_length and isinstance(value, str) and len(value) > max_length:
                    errors.append(f"Field '{field_name}' exceeds maximum length of {max_length}")
            
            elif field_config.get("required", False):
                errors.append(f"Required field '{field_name}' is missing")
        
        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }


class IntegrationWebhook(Base):
    """
    Webhook configurations for real-time integration updates
    """
    __tablename__ = "integration_webhooks"

    id = Column(Integer, primary_key=True, index=True)
    webhook_uuid = Column(String(36), unique=True, index=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    connection_id = Column(Integer, ForeignKey("integration_connections.id"), nullable=False, index=True)
    
    # Webhook configuration
    webhook_url = Column(String(500), nullable=False)
    webhook_secret = Column(String(255), nullable=True)
    events = Column(JSON, default=[])  # List of events to listen for
    
    # Security and validation
    signature_header = Column(String(100), default="X-Signature")
    signature_algorithm = Column(String(50), default="sha256")
    verify_ssl = Column(Boolean, default=True)
    
    # Status and health
    is_active = Column(Boolean, default=True)
    last_triggered_at = Column(DateTime, nullable=True)
    total_triggers = Column(Integer, default=0)
    successful_triggers = Column(Integer, default=0)
    failed_triggers = Column(Integer, default=0)
    
    # Error tracking
    last_error = Column(Text, nullable=True)
    consecutive_failures = Column(Integer, default=0)
    max_failures = Column(Integer, default=5)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<IntegrationWebhook(id={self.id}, url='{self.webhook_url}', active={self.is_active})>"

    @property
    def success_rate(self):
        """Calculate webhook success rate"""
        if self.total_triggers == 0:
            return 0.0
        return (self.successful_triggers / self.total_triggers) * 100

    @property
    def is_healthy(self):
        """Check if webhook is healthy"""
        return (
            self.is_active and 
            self.consecutive_failures < self.max_failures and
            self.success_rate >= 80.0
        )

    def record_trigger(self, success: bool, error_message: str = None):
        """Record webhook trigger result"""
        self.last_triggered_at = datetime.utcnow()
        self.total_triggers += 1
        
        if success:
            self.successful_triggers += 1
            self.consecutive_failures = 0
            self.last_error = None
        else:
            self.failed_triggers += 1
            self.consecutive_failures += 1
            self.last_error = error_message
            
            # Disable webhook if too many consecutive failures
            if self.consecutive_failures >= self.max_failures:
                self.is_active = False