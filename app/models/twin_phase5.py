"""
Digital Twin Platform - Phase 5 Storage Models
Production Deployment with Kubernetes orchestration, comprehensive monitoring, and enterprise security
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, JSON, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

# Use the existing Base from the project
from database import Base

class KubernetesDeployment(Base):  # type: ignore
    """Kubernetes deployment tracking and status"""
    __tablename__ = "kubernetes_deployments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # type: ignore
    namespace = Column(String(255), nullable=False, default="digital-twin-platform")  # type: ignore
    deployment_name = Column(String(255), nullable=False)  # type: ignore
    deployment_type = Column(String(100), nullable=False)  # type: ignore  # api, database, monitoring, frontend
    
    # Deployment Configuration
    desired_replicas = Column(Integer, nullable=False, default=1)  # type: ignore
    ready_replicas = Column(Integer, nullable=False, default=0)  # type: ignore
    available_replicas = Column(Integer, nullable=False, default=0)  # type: ignore
    updated_replicas = Column(Integer, nullable=False, default=0)  # type: ignore
    
    # Status Information
    status = Column(String(50), nullable=False, default="Pending")  # type: ignore  # Pending, Running, Failed, Succeeded
    phase = Column(String(50), nullable=False, default="Initializing")  # type: ignore
    conditions = Column(JSONB, nullable=True)  # type: ignore
    
    # Resource Configuration
    cpu_request = Column(String(20), nullable=True)  # type: ignore  # e.g., "250m"
    memory_request = Column(String(20), nullable=True)  # type: ignore  # e.g., "512Mi"
    cpu_limit = Column(String(20), nullable=True)  # type: ignore  # e.g., "500m"
    memory_limit = Column(String(20), nullable=True)  # type: ignore  # e.g., "1Gi"
    
    # Deployment Metadata
    image_name = Column(String(500), nullable=True)  # type: ignore
    image_tag = Column(String(100), nullable=True)  # type: ignore
    deployment_strategy = Column(String(50), nullable=False, default="RollingUpdate")  # type: ignore
    
    # Health and Monitoring
    health_check_path = Column(String(200), nullable=True)  # type: ignore
    readiness_probe = Column(JSONB, nullable=True)  # type: ignore
    liveness_probe = Column(JSONB, nullable=True)  # type: ignore
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())  # type: ignore
    last_deployed_at = Column(DateTime(timezone=True), nullable=True)  # type: ignore
    last_rollout_at = Column(DateTime(timezone=True), nullable=True)  # type: ignore
    
    # Relationships
    pods = relationship("KubernetesPod", back_populates="deployment", cascade="all, delete-orphan")
    services = relationship("KubernetesService", back_populates="deployment", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_k8s_deployment_namespace_name', 'namespace', 'deployment_name'),
        Index('idx_k8s_deployment_status', 'status'),
        Index('idx_k8s_deployment_type', 'deployment_type'),
    )

class KubernetesPod(Base):  # type: ignore
    """Kubernetes pod tracking and metrics"""
    __tablename__ = "kubernetes_pods"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # type: ignore
    deployment_id = Column(UUID(as_uuid=True), ForeignKey('kubernetes_deployments.id'), nullable=False)  # type: ignore
    
    # Pod Identification
    pod_name = Column(String(255), nullable=False)  # type: ignore
    namespace = Column(String(255), nullable=False, default="digital-twin-platform")  # type: ignore
    node_name = Column(String(255), nullable=True)  # type: ignore
    
    # Pod Status
    phase = Column(String(50), nullable=False, default="Pending")  # type: ignore  # Pending, Running, Succeeded, Failed, Unknown
    status = Column(String(50), nullable=False, default="Initializing")  # type: ignore
    conditions = Column(JSONB, nullable=True)  # type: ignore
    restart_count = Column(Integer, nullable=False, default=0)  # type: ignore
    
    # Resource Usage
    cpu_usage = Column(String(20), nullable=True)  # type: ignore  # e.g., "250m"
    memory_usage = Column(String(20), nullable=True)  # type: ignore  # e.g., "512Mi"
    cpu_usage_percentage = Column(Float, nullable=True)  # type: ignore
    memory_usage_percentage = Column(Float, nullable=True)  # type: ignore
    
    # Network Information
    pod_ip = Column(String(45), nullable=True)  # type: ignore  # IPv4 or IPv6
    host_ip = Column(String(45), nullable=True)  # type: ignore
    
    # Container Information
    container_count = Column(Integer, nullable=False, default=1)  # type: ignore
    ready_containers = Column(Integer, nullable=False, default=0)  # type: ignore
    container_statuses = Column(JSONB, nullable=True)  # type: ignore
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())  # type: ignore
    started_at = Column(DateTime(timezone=True), nullable=True)  # type: ignore
    finished_at = Column(DateTime(timezone=True), nullable=True)  # type: ignore
    
    # Relationships
    deployment = relationship("KubernetesDeployment", back_populates="pods")
    
    # Indexes
    __table_args__ = (
        Index('idx_k8s_pod_deployment', 'deployment_id'),
        Index('idx_k8s_pod_namespace_name', 'namespace', 'pod_name'),
        Index('idx_k8s_pod_status', 'status'),
        Index('idx_k8s_pod_node', 'node_name'),
    )

class KubernetesService(Base):  # type: ignore
    """Kubernetes service tracking and endpoints"""
    __tablename__ = "kubernetes_services"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # type: ignore
    deployment_id = Column(UUID(as_uuid=True), ForeignKey('kubernetes_deployments.id'), nullable=True)  # type: ignore
    
    # Service Identification
    service_name = Column(String(255), nullable=False)  # type: ignore
    namespace = Column(String(255), nullable=False, default="digital-twin-platform")  # type: ignore
    service_type = Column(String(50), nullable=False, default="ClusterIP")  # type: ignore  # ClusterIP, NodePort, LoadBalancer
    
    # Service Configuration
    cluster_ip = Column(String(45), nullable=True)  # type: ignore
    external_ip = Column(String(45), nullable=True)  # type: ignore
    ports = Column(JSONB, nullable=False)  # type: ignore  # Array of port configurations
    selector = Column(JSONB, nullable=True)  # type: ignore  # Label selector
    
    # Health and Status
    endpoint_count = Column(Integer, nullable=False, default=0)  # type: ignore
    ready_endpoints = Column(Integer, nullable=False, default=0)  # type: ignore
    health_status = Column(String(50), nullable=False, default="Unknown")  # type: ignore  # Healthy, Unhealthy, Unknown
    
    # Load Balancer Information (if applicable)
    load_balancer_ip = Column(String(45), nullable=True)  # type: ignore
    load_balancer_hostname = Column(String(255), nullable=True)  # type: ignore
    load_balancer_ingress = Column(JSONB, nullable=True)  # type: ignore
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())  # type: ignore
    
    # Relationships
    deployment = relationship("KubernetesDeployment", back_populates="services")
    
    # Indexes
    __table_args__ = (
        Index('idx_k8s_service_namespace_name', 'namespace', 'service_name'),
        Index('idx_k8s_service_type', 'service_type'),
        Index('idx_k8s_service_health', 'health_status'),
    )

class KubernetesHPA(Base):  # type: ignore
    """Horizontal Pod Autoscaler tracking"""
    __tablename__ = "kubernetes_hpa"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # type: ignore
    
    # HPA Identification
    hpa_name = Column(String(255), nullable=False)  # type: ignore
    namespace = Column(String(255), nullable=False, default="digital-twin-platform")  # type: ignore
    target_deployment = Column(String(255), nullable=False)  # type: ignore
    
    # Scaling Configuration
    min_replicas = Column(Integer, nullable=False, default=1)  # type: ignore
    max_replicas = Column(Integer, nullable=False, default=10)  # type: ignore
    current_replicas = Column(Integer, nullable=False, default=1)  # type: ignore
    desired_replicas = Column(Integer, nullable=False, default=1)  # type: ignore
    
    # Metrics and Thresholds
    target_cpu_utilization = Column(Integer, nullable=True)  # type: ignore  # Percentage
    target_memory_utilization = Column(Integer, nullable=True)  # type: ignore  # Percentage
    current_cpu_utilization = Column(Integer, nullable=True)  # type: ignore  # Percentage
    current_memory_utilization = Column(Integer, nullable=True)  # type: ignore  # Percentage
    
    # Custom Metrics
    custom_metrics = Column(JSONB, nullable=True)  # type: ignore
    external_metrics = Column(JSONB, nullable=True)  # type: ignore
    
    # Status and Conditions
    status = Column(String(50), nullable=False, default="Unknown")  # type: ignore  # Stable, Scaling, Failed
    conditions = Column(JSONB, nullable=True)  # type: ignore
    last_scale_time = Column(DateTime(timezone=True), nullable=True)  # type: ignore
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())  # type: ignore
    
    # Indexes
    __table_args__ = (
        Index('idx_k8s_hpa_namespace_name', 'namespace', 'hpa_name'),
        Index('idx_k8s_hpa_target', 'target_deployment'),
        Index('idx_k8s_hpa_status', 'status'),
    )

class KubernetesStorage(Base):  # type: ignore
    """Persistent Volume and Storage tracking"""
    __tablename__ = "kubernetes_storage"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # type: ignore
    
    # Storage Identification
    pv_name = Column(String(255), nullable=True)  # type: ignore  # Persistent Volume name
    pvc_name = Column(String(255), nullable=False)  # type: ignore  # Persistent Volume Claim name
    namespace = Column(String(255), nullable=False, default="digital-twin-platform")  # type: ignore
    storage_class = Column(String(255), nullable=True)  # type: ignore
    
    # Storage Configuration
    capacity = Column(String(20), nullable=False)  # type: ignore  # e.g., "10Gi"
    access_modes = Column(JSONB, nullable=False)  # type: ignore  # Array of access modes
    volume_mode = Column(String(50), nullable=False, default="Filesystem")  # type: ignore
    
    # Usage and Status
    status = Column(String(50), nullable=False, default="Pending")  # type: ignore  # Pending, Bound, Available, Released, Failed
    used_capacity = Column(String(20), nullable=True)  # type: ignore  # e.g., "2.5Gi"
    usage_percentage = Column(Float, nullable=True)  # type: ignore
    
    # Storage Backend Information
    storage_backend = Column(String(100), nullable=True)  # type: ignore  # e.g., "aws-ebs", "gce-pd", "local"
    volume_handle = Column(String(500), nullable=True)  # type: ignore
    mount_path = Column(String(500), nullable=True)  # type: ignore
    
    # Backup and Snapshot Information
    backup_enabled = Column(Boolean, nullable=False, default=False)  # type: ignore
    last_backup_at = Column(DateTime(timezone=True), nullable=True)  # type: ignore
    snapshot_count = Column(Integer, nullable=False, default=0)  # type: ignore
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())  # type: ignore
    bound_at = Column(DateTime(timezone=True), nullable=True)  # type: ignore
    
    # Indexes
    __table_args__ = (
        Index('idx_k8s_storage_namespace_pvc', 'namespace', 'pvc_name'),
        Index('idx_k8s_storage_class', 'storage_class'),
        Index('idx_k8s_storage_status', 'status'),
    )

class KubernetesMonitoring(Base):  # type: ignore
    """Monitoring stack status and metrics"""
    __tablename__ = "kubernetes_monitoring"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # type: ignore
    
    # Component Identification
    component_name = Column(String(255), nullable=False)  # type: ignore  # prometheus, grafana, alertmanager
    namespace = Column(String(255), nullable=False, default="digital-twin-platform")  # type: ignore
    component_type = Column(String(100), nullable=False)  # type: ignore  # metrics, visualization, alerting
    
    # Component Status
    status = Column(String(50), nullable=False, default="Unknown")  # type: ignore  # Running, Failed, Pending
    version = Column(String(100), nullable=True)  # type: ignore
    health_status = Column(String(50), nullable=False, default="Unknown")  # type: ignore  # Healthy, Unhealthy, Unknown
    
    # Metrics and Performance
    uptime_seconds = Column(Integer, nullable=True)  # type: ignore
    cpu_usage = Column(Float, nullable=True)  # type: ignore
    memory_usage = Column(Float, nullable=True)  # type: ignore
    disk_usage = Column(Float, nullable=True)  # type: ignore
    
    # Component-specific Metrics
    # Prometheus
    targets_up = Column(Integer, nullable=True)  # type: ignore
    targets_total = Column(Integer, nullable=True)  # type: ignore
    rules_loaded = Column(Integer, nullable=True)  # type: ignore
    
    # Grafana
    dashboards_count = Column(Integer, nullable=True)  # type: ignore
    users_count = Column(Integer, nullable=True)  # type: ignore
    alerts_count = Column(Integer, nullable=True)  # type: ignore
    
    # AlertManager
    active_alerts = Column(Integer, nullable=True)  # type: ignore
    silenced_alerts = Column(Integer, nullable=True)  # type: ignore
    inhibited_alerts = Column(Integer, nullable=True)  # type: ignore
    
    # Configuration and Settings
    configuration = Column(JSONB, nullable=True)  # type: ignore
    data_retention = Column(String(50), nullable=True)  # type: ignore  # e.g., "15d"
    storage_size = Column(String(20), nullable=True)  # type: ignore  # e.g., "20Gi"
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())  # type: ignore
    last_health_check = Column(DateTime(timezone=True), nullable=True)  # type: ignore
    
    # Indexes
    __table_args__ = (
        Index('idx_k8s_monitoring_component', 'component_name'),
        Index('idx_k8s_monitoring_type', 'component_type'),
        Index('idx_k8s_monitoring_status', 'status'),
    )

class KubernetesSecurity(Base):  # type: ignore
    """Security policies and RBAC tracking"""
    __tablename__ = "kubernetes_security"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # type: ignore
    
    # Security Resource Identification
    resource_name = Column(String(255), nullable=False)  # type: ignore
    resource_type = Column(String(100), nullable=False)  # type: ignore  # rbac, networkpolicy, secret, serviceaccount
    namespace = Column(String(255), nullable=True)  # type: ignore  # Some resources are cluster-scoped
    
    # RBAC Information
    subject_type = Column(String(50), nullable=True)  # type: ignore  # User, Group, ServiceAccount
    subject_name = Column(String(255), nullable=True)  # type: ignore
    role_name = Column(String(255), nullable=True)  # type: ignore
    permissions = Column(JSONB, nullable=True)  # type: ignore  # Array of permissions
    
    # Network Policy Information
    policy_types = Column(JSONB, nullable=True)  # type: ignore  # Ingress, Egress
    pod_selector = Column(JSONB, nullable=True)  # type: ignore
    ingress_rules = Column(JSONB, nullable=True)  # type: ignore
    egress_rules = Column(JSONB, nullable=True)  # type: ignore
    
    # Secret Information
    secret_type = Column(String(100), nullable=True)  # type: ignore  # Opaque, kubernetes.io/tls, etc.
    data_keys = Column(JSONB, nullable=True)  # type: ignore  # Array of secret keys (not values)
    
    # Security Status
    status = Column(String(50), nullable=False, default="Active")  # type: ignore  # Active, Inactive, Failed
    compliance_status = Column(String(50), nullable=False, default="Unknown")  # type: ignore  # Compliant, NonCompliant, Unknown
    last_audit = Column(DateTime(timezone=True), nullable=True)  # type: ignore
    
    # Security Metrics
    access_count = Column(Integer, nullable=False, default=0)  # type: ignore
    violation_count = Column(Integer, nullable=False, default=0)  # type: ignore
    last_access = Column(DateTime(timezone=True), nullable=True)  # type: ignore
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())  # type: ignore
    
    # Indexes
    __table_args__ = (
        Index('idx_k8s_security_resource', 'resource_type', 'resource_name'),
        Index('idx_k8s_security_namespace', 'namespace'),
        Index('idx_k8s_security_status', 'status'),
        Index('idx_k8s_security_compliance', 'compliance_status'),
    )

class KubernetesIngress(Base):  # type: ignore
    """Ingress controller and SSL certificate tracking"""
    __tablename__ = "kubernetes_ingress"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # type: ignore
    
    # Ingress Identification
    ingress_name = Column(String(255), nullable=False)  # type: ignore
    namespace = Column(String(255), nullable=False, default="digital-twin-platform")  # type: ignore
    ingress_class = Column(String(255), nullable=True)  # type: ignore
    
    # Ingress Configuration
    hosts = Column(JSONB, nullable=False)  # type: ignore  # Array of hostnames
    paths = Column(JSONB, nullable=False)  # type: ignore  # Array of path configurations
    backend_services = Column(JSONB, nullable=False)  # type: ignore  # Array of backend service configurations
    
    # SSL/TLS Configuration
    tls_enabled = Column(Boolean, nullable=False, default=False)  # type: ignore
    tls_secret_name = Column(String(255), nullable=True)  # type: ignore
    ssl_certificate_status = Column(String(50), nullable=True)  # type: ignore  # Valid, Expired, Invalid, Pending
    certificate_expiry = Column(DateTime(timezone=True), nullable=True)  # type: ignore
    
    # Load Balancer Information
    load_balancer_ip = Column(String(45), nullable=True)  # type: ignore
    load_balancer_hostname = Column(String(255), nullable=True)  # type: ignore
    load_balancer_status = Column(String(50), nullable=False, default="Pending")  # type: ignore
    
    # Traffic and Performance
    request_count_24h = Column(Integer, nullable=False, default=0)  # type: ignore
    error_count_24h = Column(Integer, nullable=False, default=0)  # type: ignore
    avg_response_time = Column(Float, nullable=True)  # type: ignore  # milliseconds
    
    # Rate Limiting and Security
    rate_limit_enabled = Column(Boolean, nullable=False, default=False)  # type: ignore
    rate_limit_config = Column(JSONB, nullable=True)  # type: ignore
    security_headers = Column(JSONB, nullable=True)  # type: ignore
    
    # Status and Health
    status = Column(String(50), nullable=False, default="Pending")  # type: ignore  # Pending, Active, Failed
    health_status = Column(String(50), nullable=False, default="Unknown")  # type: ignore  # Healthy, Unhealthy, Unknown
    last_health_check = Column(DateTime(timezone=True), nullable=True)  # type: ignore
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())  # type: ignore
    
    # Indexes
    __table_args__ = (
        Index('idx_k8s_ingress_namespace_name', 'namespace', 'ingress_name'),
        Index('idx_k8s_ingress_status', 'status'),
        Index('idx_k8s_ingress_ssl_status', 'ssl_certificate_status'),
    )

class ProductionMetrics(Base):  # type: ignore
    """Production deployment metrics and KPIs"""
    __tablename__ = "production_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # type: ignore
    
    # Metric Identification
    metric_name = Column(String(255), nullable=False)  # type: ignore
    metric_type = Column(String(100), nullable=False)  # type: ignore  # performance, availability, security, cost
    component = Column(String(255), nullable=True)  # type: ignore  # api, database, monitoring, etc.
    
    # Metric Values
    value = Column(Float, nullable=False)  # type: ignore
    unit = Column(String(50), nullable=True)  # type: ignore  # percentage, milliseconds, count, bytes
    threshold_warning = Column(Float, nullable=True)  # type: ignore
    threshold_critical = Column(Float, nullable=True)  # type: ignore
    
    # Status and Alerting
    status = Column(String(50), nullable=False, default="Normal")  # type: ignore  # Normal, Warning, Critical
    alert_sent = Column(Boolean, nullable=False, default=False)  # type: ignore
    alert_acknowledged = Column(Boolean, nullable=False, default=False)  # type: ignore
    
    # Context and Metadata
    labels = Column(JSONB, nullable=True)  # type: ignore  # Additional metric labels
    description = Column(Text, nullable=True)  # type: ignore
    collection_method = Column(String(100), nullable=True)  # type: ignore  # prometheus, custom, external
    
    # Time Series Data
    timestamp = Column(DateTime(timezone=True), nullable=False, server_default=func.now())  # type: ignore
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    
    # Indexes
    __table_args__ = (
        Index('idx_prod_metrics_name_timestamp', 'metric_name', 'timestamp'),
        Index('idx_prod_metrics_type', 'metric_type'),
        Index('idx_prod_metrics_component', 'component'),
        Index('idx_prod_metrics_status', 'status'),
        Index('idx_prod_metrics_timestamp', 'timestamp'),
    )

class DeploymentHistory(Base):  # type: ignore
    """Deployment history and rollback tracking"""
    __tablename__ = "deployment_history"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)  # type: ignore
    
    # Deployment Information
    deployment_name = Column(String(255), nullable=False)  # type: ignore
    namespace = Column(String(255), nullable=False, default="digital-twin-platform")  # type: ignore
    revision = Column(Integer, nullable=False)  # type: ignore
    
    # Deployment Details
    image_name = Column(String(500), nullable=False)  # type: ignore
    image_tag = Column(String(100), nullable=False)  # type: ignore
    deployment_config = Column(JSONB, nullable=False)  # type: ignore
    
    # Deployment Status
    status = Column(String(50), nullable=False)  # type: ignore  # InProgress, Successful, Failed, RolledBack
    deployment_type = Column(String(50), nullable=False)  # type: ignore  # Initial, Update, Rollback, Hotfix
    
    # Performance and Health
    deployment_duration = Column(Integer, nullable=True)  # type: ignore  # seconds
    health_check_passed = Column(Boolean, nullable=True)  # type: ignore
    rollout_strategy = Column(String(50), nullable=False, default="RollingUpdate")  # type: ignore
    
    # Change Information
    change_description = Column(Text, nullable=True)  # type: ignore
    change_author = Column(String(255), nullable=True)  # type: ignore
    change_ticket = Column(String(100), nullable=True)  # type: ignore
    
    # Rollback Information
    rollback_reason = Column(Text, nullable=True)  # type: ignore
    rollback_to_revision = Column(Integer, nullable=True)  # type: ignore
    
    # Timestamps
    started_at = Column(DateTime(timezone=True), nullable=False)  # type: ignore
    completed_at = Column(DateTime(timezone=True), nullable=True)  # type: ignore
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # type: ignore
    
    # Indexes
    __table_args__ = (
        Index('idx_deploy_history_name_revision', 'deployment_name', 'revision'),
        Index('idx_deploy_history_status', 'status'),
        Index('idx_deploy_history_started', 'started_at'),
    )