"""
Digital Twin Platform - Phase 5 Storage Models
Production Deployment with Kubernetes orchestration, comprehensive monitoring, and enterprise security
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, JSON, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class KubernetesDeployment(Base):
    """Kubernetes deployment tracking and status"""
    __tablename__ = "kubernetes_deployments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    namespace = Column(String(255), nullable=False, default="digital-twin-platform")
    deployment_name = Column(String(255), nullable=False)
    deployment_type = Column(String(100), nullable=False)  # api, database, monitoring, frontend
    
    # Deployment Configuration
    desired_replicas = Column(Integer, nullable=False, default=1)
    ready_replicas = Column(Integer, nullable=False, default=0)
    available_replicas = Column(Integer, nullable=False, default=0)
    updated_replicas = Column(Integer, nullable=False, default=0)
    
    # Status Information
    status = Column(String(50), nullable=False, default="Pending")  # Pending, Running, Failed, Succeeded
    phase = Column(String(50), nullable=False, default="Initializing")
    conditions = Column(JSONB, nullable=True)
    
    # Resource Configuration
    cpu_request = Column(String(20), nullable=True)  # e.g., "250m"
    memory_request = Column(String(20), nullable=True)  # e.g., "512Mi"
    cpu_limit = Column(String(20), nullable=True)  # e.g., "500m"
    memory_limit = Column(String(20), nullable=True)  # e.g., "1Gi"
    
    # Deployment Metadata
    image_name = Column(String(500), nullable=True)
    image_tag = Column(String(100), nullable=True)
    deployment_strategy = Column(String(50), nullable=False, default="RollingUpdate")
    
    # Health and Monitoring
    health_check_path = Column(String(200), nullable=True)
    readiness_probe = Column(JSONB, nullable=True)
    liveness_probe = Column(JSONB, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_deployed_at = Column(DateTime(timezone=True), nullable=True)
    last_rollout_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    pods = relationship("KubernetesPod", back_populates="deployment", cascade="all, delete-orphan")
    services = relationship("KubernetesService", back_populates="deployment", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_k8s_deployment_namespace_name', 'namespace', 'deployment_name'),
        Index('idx_k8s_deployment_status', 'status'),
        Index('idx_k8s_deployment_type', 'deployment_type'),
    )

class KubernetesPod(Base):
    """Kubernetes pod tracking and metrics"""
    __tablename__ = "kubernetes_pods"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deployment_id = Column(UUID(as_uuid=True), ForeignKey('kubernetes_deployments.id'), nullable=False)
    
    # Pod Identification
    pod_name = Column(String(255), nullable=False)
    namespace = Column(String(255), nullable=False, default="digital-twin-platform")
    node_name = Column(String(255), nullable=True)
    
    # Pod Status
    phase = Column(String(50), nullable=False, default="Pending")  # Pending, Running, Succeeded, Failed, Unknown
    status = Column(String(50), nullable=False, default="Initializing")
    conditions = Column(JSONB, nullable=True)
    restart_count = Column(Integer, nullable=False, default=0)
    
    # Resource Usage
    cpu_usage = Column(String(20), nullable=True)  # e.g., "250m"
    memory_usage = Column(String(20), nullable=True)  # e.g., "512Mi"
    cpu_usage_percentage = Column(Float, nullable=True)
    memory_usage_percentage = Column(Float, nullable=True)
    
    # Network Information
    pod_ip = Column(String(45), nullable=True)  # IPv4 or IPv6
    host_ip = Column(String(45), nullable=True)
    
    # Container Information
    container_count = Column(Integer, nullable=False, default=1)
    ready_containers = Column(Integer, nullable=False, default=0)
    container_statuses = Column(JSONB, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    deployment = relationship("KubernetesDeployment", back_populates="pods")
    
    # Indexes
    __table_args__ = (
        Index('idx_k8s_pod_deployment', 'deployment_id'),
        Index('idx_k8s_pod_namespace_name', 'namespace', 'pod_name'),
        Index('idx_k8s_pod_status', 'status'),
        Index('idx_k8s_pod_node', 'node_name'),
    )

class KubernetesService(Base):
    """Kubernetes service tracking and endpoints"""
    __tablename__ = "kubernetes_services"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deployment_id = Column(UUID(as_uuid=True), ForeignKey('kubernetes_deployments.id'), nullable=True)
    
    # Service Identification
    service_name = Column(String(255), nullable=False)
    namespace = Column(String(255), nullable=False, default="digital-twin-platform")
    service_type = Column(String(50), nullable=False, default="ClusterIP")  # ClusterIP, NodePort, LoadBalancer
    
    # Service Configuration
    cluster_ip = Column(String(45), nullable=True)
    external_ip = Column(String(45), nullable=True)
    ports = Column(JSONB, nullable=False)  # Array of port configurations
    selector = Column(JSONB, nullable=True)  # Label selector
    
    # Health and Status
    endpoint_count = Column(Integer, nullable=False, default=0)
    ready_endpoints = Column(Integer, nullable=False, default=0)
    health_status = Column(String(50), nullable=False, default="Unknown")  # Healthy, Unhealthy, Unknown
    
    # Load Balancer Information (if applicable)
    load_balancer_ip = Column(String(45), nullable=True)
    load_balancer_hostname = Column(String(255), nullable=True)
    load_balancer_ingress = Column(JSONB, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    deployment = relationship("KubernetesDeployment", back_populates="services")
    
    # Indexes
    __table_args__ = (
        Index('idx_k8s_service_namespace_name', 'namespace', 'service_name'),
        Index('idx_k8s_service_type', 'service_type'),
        Index('idx_k8s_service_health', 'health_status'),
    )

class KubernetesHPA(Base):
    """Horizontal Pod Autoscaler tracking"""
    __tablename__ = "kubernetes_hpa"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # HPA Identification
    hpa_name = Column(String(255), nullable=False)
    namespace = Column(String(255), nullable=False, default="digital-twin-platform")
    target_deployment = Column(String(255), nullable=False)
    
    # Scaling Configuration
    min_replicas = Column(Integer, nullable=False, default=1)
    max_replicas = Column(Integer, nullable=False, default=10)
    current_replicas = Column(Integer, nullable=False, default=1)
    desired_replicas = Column(Integer, nullable=False, default=1)
    
    # Metrics and Thresholds
    target_cpu_utilization = Column(Integer, nullable=True)  # Percentage
    target_memory_utilization = Column(Integer, nullable=True)  # Percentage
    current_cpu_utilization = Column(Integer, nullable=True)  # Percentage
    current_memory_utilization = Column(Integer, nullable=True)  # Percentage
    
    # Custom Metrics
    custom_metrics = Column(JSONB, nullable=True)
    external_metrics = Column(JSONB, nullable=True)
    
    # Status and Conditions
    status = Column(String(50), nullable=False, default="Unknown")  # Stable, Scaling, Failed
    conditions = Column(JSONB, nullable=True)
    last_scale_time = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Indexes
    __table_args__ = (
        Index('idx_k8s_hpa_namespace_name', 'namespace', 'hpa_name'),
        Index('idx_k8s_hpa_target', 'target_deployment'),
        Index('idx_k8s_hpa_status', 'status'),
    )

class KubernetesStorage(Base):
    """Persistent Volume and Storage tracking"""
    __tablename__ = "kubernetes_storage"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Storage Identification
    pv_name = Column(String(255), nullable=True)  # Persistent Volume name
    pvc_name = Column(String(255), nullable=False)  # Persistent Volume Claim name
    namespace = Column(String(255), nullable=False, default="digital-twin-platform")
    storage_class = Column(String(255), nullable=True)
    
    # Storage Configuration
    capacity = Column(String(20), nullable=False)  # e.g., "10Gi"
    access_modes = Column(JSONB, nullable=False)  # Array of access modes
    volume_mode = Column(String(50), nullable=False, default="Filesystem")
    
    # Usage and Status
    status = Column(String(50), nullable=False, default="Pending")  # Pending, Bound, Available, Released, Failed
    used_capacity = Column(String(20), nullable=True)  # e.g., "2.5Gi"
    usage_percentage = Column(Float, nullable=True)
    
    # Storage Backend Information
    storage_backend = Column(String(100), nullable=True)  # e.g., "aws-ebs", "gce-pd", "local"
    volume_handle = Column(String(500), nullable=True)
    mount_path = Column(String(500), nullable=True)
    
    # Backup and Snapshot Information
    backup_enabled = Column(Boolean, nullable=False, default=False)
    last_backup_at = Column(DateTime(timezone=True), nullable=True)
    snapshot_count = Column(Integer, nullable=False, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    bound_at = Column(DateTime(timezone=True), nullable=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_k8s_storage_namespace_pvc', 'namespace', 'pvc_name'),
        Index('idx_k8s_storage_class', 'storage_class'),
        Index('idx_k8s_storage_status', 'status'),
    )

class KubernetesMonitoring(Base):
    """Monitoring stack status and metrics"""
    __tablename__ = "kubernetes_monitoring"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Component Identification
    component_name = Column(String(255), nullable=False)  # prometheus, grafana, alertmanager
    namespace = Column(String(255), nullable=False, default="digital-twin-platform")
    component_type = Column(String(100), nullable=False)  # metrics, visualization, alerting
    
    # Component Status
    status = Column(String(50), nullable=False, default="Unknown")  # Running, Failed, Pending
    version = Column(String(100), nullable=True)
    health_status = Column(String(50), nullable=False, default="Unknown")  # Healthy, Unhealthy, Unknown
    
    # Metrics and Performance
    uptime_seconds = Column(Integer, nullable=True)
    cpu_usage = Column(Float, nullable=True)
    memory_usage = Column(Float, nullable=True)
    disk_usage = Column(Float, nullable=True)
    
    # Component-specific Metrics
    # Prometheus
    targets_up = Column(Integer, nullable=True)
    targets_total = Column(Integer, nullable=True)
    rules_loaded = Column(Integer, nullable=True)
    
    # Grafana
    dashboards_count = Column(Integer, nullable=True)
    users_count = Column(Integer, nullable=True)
    alerts_count = Column(Integer, nullable=True)
    
    # AlertManager
    active_alerts = Column(Integer, nullable=True)
    silenced_alerts = Column(Integer, nullable=True)
    inhibited_alerts = Column(Integer, nullable=True)
    
    # Configuration and Settings
    configuration = Column(JSONB, nullable=True)
    data_retention = Column(String(50), nullable=True)  # e.g., "15d"
    storage_size = Column(String(20), nullable=True)  # e.g., "20Gi"
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_health_check = Column(DateTime(timezone=True), nullable=True)
    
    # Indexes
    __table_args__ = (
        Index('idx_k8s_monitoring_component', 'component_name'),
        Index('idx_k8s_monitoring_type', 'component_type'),
        Index('idx_k8s_monitoring_status', 'status'),
    )

class KubernetesSecurity(Base):
    """Security policies and RBAC tracking"""
    __tablename__ = "kubernetes_security"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Security Resource Identification
    resource_name = Column(String(255), nullable=False)
    resource_type = Column(String(100), nullable=False)  # rbac, networkpolicy, secret, serviceaccount
    namespace = Column(String(255), nullable=True)  # Some resources are cluster-scoped
    
    # RBAC Information
    subject_type = Column(String(50), nullable=True)  # User, Group, ServiceAccount
    subject_name = Column(String(255), nullable=True)
    role_name = Column(String(255), nullable=True)
    permissions = Column(JSONB, nullable=True)  # Array of permissions
    
    # Network Policy Information
    policy_types = Column(JSONB, nullable=True)  # Ingress, Egress
    pod_selector = Column(JSONB, nullable=True)
    ingress_rules = Column(JSONB, nullable=True)
    egress_rules = Column(JSONB, nullable=True)
    
    # Secret Information
    secret_type = Column(String(100), nullable=True)  # Opaque, kubernetes.io/tls, etc.
    data_keys = Column(JSONB, nullable=True)  # Array of secret keys (not values)
    
    # Security Status
    status = Column(String(50), nullable=False, default="Active")  # Active, Inactive, Failed
    compliance_status = Column(String(50), nullable=False, default="Unknown")  # Compliant, NonCompliant, Unknown
    last_audit = Column(DateTime(timezone=True), nullable=True)
    
    # Security Metrics
    access_count = Column(Integer, nullable=False, default=0)
    violation_count = Column(Integer, nullable=False, default=0)
    last_access = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Indexes
    __table_args__ = (
        Index('idx_k8s_security_resource', 'resource_type', 'resource_name'),
        Index('idx_k8s_security_namespace', 'namespace'),
        Index('idx_k8s_security_status', 'status'),
        Index('idx_k8s_security_compliance', 'compliance_status'),
    )

class KubernetesIngress(Base):
    """Ingress controller and SSL certificate tracking"""
    __tablename__ = "kubernetes_ingress"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Ingress Identification
    ingress_name = Column(String(255), nullable=False)
    namespace = Column(String(255), nullable=False, default="digital-twin-platform")
    ingress_class = Column(String(255), nullable=True)
    
    # Ingress Configuration
    hosts = Column(JSONB, nullable=False)  # Array of hostnames
    paths = Column(JSONB, nullable=False)  # Array of path configurations
    backend_services = Column(JSONB, nullable=False)  # Array of backend service configurations
    
    # SSL/TLS Configuration
    tls_enabled = Column(Boolean, nullable=False, default=False)
    tls_secret_name = Column(String(255), nullable=True)
    ssl_certificate_status = Column(String(50), nullable=True)  # Valid, Expired, Invalid, Pending
    certificate_expiry = Column(DateTime(timezone=True), nullable=True)
    
    # Load Balancer Information
    load_balancer_ip = Column(String(45), nullable=True)
    load_balancer_hostname = Column(String(255), nullable=True)
    load_balancer_status = Column(String(50), nullable=False, default="Pending")
    
    # Traffic and Performance
    request_count_24h = Column(Integer, nullable=False, default=0)
    error_count_24h = Column(Integer, nullable=False, default=0)
    avg_response_time = Column(Float, nullable=True)  # milliseconds
    
    # Rate Limiting and Security
    rate_limit_enabled = Column(Boolean, nullable=False, default=False)
    rate_limit_config = Column(JSONB, nullable=True)
    security_headers = Column(JSONB, nullable=True)
    
    # Status and Health
    status = Column(String(50), nullable=False, default="Pending")  # Pending, Active, Failed
    health_status = Column(String(50), nullable=False, default="Unknown")  # Healthy, Unhealthy, Unknown
    last_health_check = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Indexes
    __table_args__ = (
        Index('idx_k8s_ingress_namespace_name', 'namespace', 'ingress_name'),
        Index('idx_k8s_ingress_status', 'status'),
        Index('idx_k8s_ingress_ssl_status', 'ssl_certificate_status'),
    )

class ProductionMetrics(Base):
    """Production deployment metrics and KPIs"""
    __tablename__ = "production_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Metric Identification
    metric_name = Column(String(255), nullable=False)
    metric_type = Column(String(100), nullable=False)  # performance, availability, security, cost
    component = Column(String(255), nullable=True)  # api, database, monitoring, etc.
    
    # Metric Values
    value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=True)  # percentage, milliseconds, count, bytes
    threshold_warning = Column(Float, nullable=True)
    threshold_critical = Column(Float, nullable=True)
    
    # Status and Alerting
    status = Column(String(50), nullable=False, default="Normal")  # Normal, Warning, Critical
    alert_sent = Column(Boolean, nullable=False, default=False)
    alert_acknowledged = Column(Boolean, nullable=False, default=False)
    
    # Context and Metadata
    labels = Column(JSONB, nullable=True)  # Additional metric labels
    description = Column(Text, nullable=True)
    collection_method = Column(String(100), nullable=True)  # prometheus, custom, external
    
    # Time Series Data
    timestamp = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes
    __table_args__ = (
        Index('idx_prod_metrics_name_timestamp', 'metric_name', 'timestamp'),
        Index('idx_prod_metrics_type', 'metric_type'),
        Index('idx_prod_metrics_component', 'component'),
        Index('idx_prod_metrics_status', 'status'),
        Index('idx_prod_metrics_timestamp', 'timestamp'),
    )

class DeploymentHistory(Base):
    """Deployment history and rollback tracking"""
    __tablename__ = "deployment_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Deployment Information
    deployment_name = Column(String(255), nullable=False)
    namespace = Column(String(255), nullable=False, default="digital-twin-platform")
    revision = Column(Integer, nullable=False)
    
    # Deployment Details
    image_name = Column(String(500), nullable=False)
    image_tag = Column(String(100), nullable=False)
    deployment_config = Column(JSONB, nullable=False)
    
    # Deployment Status
    status = Column(String(50), nullable=False)  # InProgress, Successful, Failed, RolledBack
    deployment_type = Column(String(50), nullable=False)  # Initial, Update, Rollback, Hotfix
    
    # Performance and Health
    deployment_duration = Column(Integer, nullable=True)  # seconds
    health_check_passed = Column(Boolean, nullable=True)
    rollout_strategy = Column(String(50), nullable=False, default="RollingUpdate")
    
    # Change Information
    change_description = Column(Text, nullable=True)
    change_author = Column(String(255), nullable=True)
    change_ticket = Column(String(100), nullable=True)
    
    # Rollback Information
    rollback_reason = Column(Text, nullable=True)
    rollback_to_revision = Column(Integer, nullable=True)
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes
    __table_args__ = (
        Index('idx_deploy_history_name_revision', 'deployment_name', 'revision'),
        Index('idx_deploy_history_status', 'status'),
        Index('idx_deploy_history_started', 'started_at'),
    )