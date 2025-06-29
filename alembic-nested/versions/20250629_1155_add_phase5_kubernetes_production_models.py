"""Add Phase 5 Kubernetes Production Models

Revision ID: 20250629_1155_add_phase5_kubernetes_production_models
Revises: 20250629_1130_add_phase4_websocket_pwa_models
Create Date: 2025-06-29 11:55:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250629_1155_add_phase5_kubernetes_production_models'
down_revision = '20250629_1130_add_phase4_websocket_pwa_models'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create kubernetes_deployments table
    op.create_table('kubernetes_deployments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('namespace', sa.String(length=255), nullable=False),
        sa.Column('deployment_name', sa.String(length=255), nullable=False),
        sa.Column('deployment_type', sa.String(length=100), nullable=False),
        sa.Column('desired_replicas', sa.Integer(), nullable=False),
        sa.Column('ready_replicas', sa.Integer(), nullable=False),
        sa.Column('available_replicas', sa.Integer(), nullable=False),
        sa.Column('updated_replicas', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('phase', sa.String(length=50), nullable=False),
        sa.Column('conditions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('cpu_request', sa.String(length=20), nullable=True),
        sa.Column('memory_request', sa.String(length=20), nullable=True),
        sa.Column('cpu_limit', sa.String(length=20), nullable=True),
        sa.Column('memory_limit', sa.String(length=20), nullable=True),
        sa.Column('image_name', sa.String(length=500), nullable=True),
        sa.Column('image_tag', sa.String(length=100), nullable=True),
        sa.Column('deployment_strategy', sa.String(length=50), nullable=False),
        sa.Column('health_check_path', sa.String(length=200), nullable=True),
        sa.Column('readiness_probe', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('liveness_probe', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('last_deployed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_rollout_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_k8s_deployment_namespace_name', 'kubernetes_deployments', ['namespace', 'deployment_name'], unique=False)
    op.create_index('idx_k8s_deployment_status', 'kubernetes_deployments', ['status'], unique=False)
    op.create_index('idx_k8s_deployment_type', 'kubernetes_deployments', ['deployment_type'], unique=False)

    # Create kubernetes_pods table
    op.create_table('kubernetes_pods',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('deployment_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pod_name', sa.String(length=255), nullable=False),
        sa.Column('namespace', sa.String(length=255), nullable=False),
        sa.Column('node_name', sa.String(length=255), nullable=True),
        sa.Column('phase', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('conditions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('restart_count', sa.Integer(), nullable=False),
        sa.Column('cpu_usage', sa.String(length=20), nullable=True),
        sa.Column('memory_usage', sa.String(length=20), nullable=True),
        sa.Column('cpu_usage_percentage', sa.Float(), nullable=True),
        sa.Column('memory_usage_percentage', sa.Float(), nullable=True),
        sa.Column('pod_ip', sa.String(length=45), nullable=True),
        sa.Column('host_ip', sa.String(length=45), nullable=True),
        sa.Column('container_count', sa.Integer(), nullable=False),
        sa.Column('ready_containers', sa.Integer(), nullable=False),
        sa.Column('container_statuses', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('finished_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['deployment_id'], ['kubernetes_deployments.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_k8s_pod_deployment', 'kubernetes_pods', ['deployment_id'], unique=False)
    op.create_index('idx_k8s_pod_namespace_name', 'kubernetes_pods', ['namespace', 'pod_name'], unique=False)
    op.create_index('idx_k8s_pod_status', 'kubernetes_pods', ['status'], unique=False)
    op.create_index('idx_k8s_pod_node', 'kubernetes_pods', ['node_name'], unique=False)

    # Create kubernetes_services table
    op.create_table('kubernetes_services',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('deployment_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('service_name', sa.String(length=255), nullable=False),
        sa.Column('namespace', sa.String(length=255), nullable=False),
        sa.Column('service_type', sa.String(length=50), nullable=False),
        sa.Column('cluster_ip', sa.String(length=45), nullable=True),
        sa.Column('external_ip', sa.String(length=45), nullable=True),
        sa.Column('ports', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('selector', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('endpoint_count', sa.Integer(), nullable=False),
        sa.Column('ready_endpoints', sa.Integer(), nullable=False),
        sa.Column('health_status', sa.String(length=50), nullable=False),
        sa.Column('load_balancer_ip', sa.String(length=45), nullable=True),
        sa.Column('load_balancer_hostname', sa.String(length=255), nullable=True),
        sa.Column('load_balancer_ingress', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['deployment_id'], ['kubernetes_deployments.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_k8s_service_namespace_name', 'kubernetes_services', ['namespace', 'service_name'], unique=False)
    op.create_index('idx_k8s_service_type', 'kubernetes_services', ['service_type'], unique=False)
    op.create_index('idx_k8s_service_health', 'kubernetes_services', ['health_status'], unique=False)

    # Create kubernetes_hpa table
    op.create_table('kubernetes_hpa',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('hpa_name', sa.String(length=255), nullable=False),
        sa.Column('namespace', sa.String(length=255), nullable=False),
        sa.Column('target_deployment', sa.String(length=255), nullable=False),
        sa.Column('min_replicas', sa.Integer(), nullable=False),
        sa.Column('max_replicas', sa.Integer(), nullable=False),
        sa.Column('current_replicas', sa.Integer(), nullable=False),
        sa.Column('desired_replicas', sa.Integer(), nullable=False),
        sa.Column('target_cpu_utilization', sa.Integer(), nullable=True),
        sa.Column('target_memory_utilization', sa.Integer(), nullable=True),
        sa.Column('current_cpu_utilization', sa.Integer(), nullable=True),
        sa.Column('current_memory_utilization', sa.Integer(), nullable=True),
        sa.Column('custom_metrics', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('external_metrics', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('conditions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('last_scale_time', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_k8s_hpa_namespace_name', 'kubernetes_hpa', ['namespace', 'hpa_name'], unique=False)
    op.create_index('idx_k8s_hpa_target', 'kubernetes_hpa', ['target_deployment'], unique=False)
    op.create_index('idx_k8s_hpa_status', 'kubernetes_hpa', ['status'], unique=False)

    # Create kubernetes_storage table
    op.create_table('kubernetes_storage',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pv_name', sa.String(length=255), nullable=True),
        sa.Column('pvc_name', sa.String(length=255), nullable=False),
        sa.Column('namespace', sa.String(length=255), nullable=False),
        sa.Column('storage_class', sa.String(length=255), nullable=True),
        sa.Column('capacity', sa.String(length=20), nullable=False),
        sa.Column('access_modes', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('volume_mode', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('used_capacity', sa.String(length=20), nullable=True),
        sa.Column('usage_percentage', sa.Float(), nullable=True),
        sa.Column('storage_backend', sa.String(length=100), nullable=True),
        sa.Column('volume_handle', sa.String(length=500), nullable=True),
        sa.Column('mount_path', sa.String(length=500), nullable=True),
        sa.Column('backup_enabled', sa.Boolean(), nullable=False),
        sa.Column('last_backup_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('snapshot_count', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('bound_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_k8s_storage_namespace_pvc', 'kubernetes_storage', ['namespace', 'pvc_name'], unique=False)
    op.create_index('idx_k8s_storage_class', 'kubernetes_storage', ['storage_class'], unique=False)
    op.create_index('idx_k8s_storage_status', 'kubernetes_storage', ['status'], unique=False)

    # Create kubernetes_monitoring table
    op.create_table('kubernetes_monitoring',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('component_name', sa.String(length=255), nullable=False),
        sa.Column('namespace', sa.String(length=255), nullable=False),
        sa.Column('component_type', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('version', sa.String(length=100), nullable=True),
        sa.Column('health_status', sa.String(length=50), nullable=False),
        sa.Column('uptime_seconds', sa.Integer(), nullable=True),
        sa.Column('cpu_usage', sa.Float(), nullable=True),
        sa.Column('memory_usage', sa.Float(), nullable=True),
        sa.Column('disk_usage', sa.Float(), nullable=True),
        sa.Column('targets_up', sa.Integer(), nullable=True),
        sa.Column('targets_total', sa.Integer(), nullable=True),
        sa.Column('rules_loaded', sa.Integer(), nullable=True),
        sa.Column('dashboards_count', sa.Integer(), nullable=True),
        sa.Column('users_count', sa.Integer(), nullable=True),
        sa.Column('alerts_count', sa.Integer(), nullable=True),
        sa.Column('active_alerts', sa.Integer(), nullable=True),
        sa.Column('silenced_alerts', sa.Integer(), nullable=True),
        sa.Column('inhibited_alerts', sa.Integer(), nullable=True),
        sa.Column('configuration', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('data_retention', sa.String(length=50), nullable=True),
        sa.Column('storage_size', sa.String(length=20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('last_health_check', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_k8s_monitoring_component', 'kubernetes_monitoring', ['component_name'], unique=False)
    op.create_index('idx_k8s_monitoring_type', 'kubernetes_monitoring', ['component_type'], unique=False)
    op.create_index('idx_k8s_monitoring_status', 'kubernetes_monitoring', ['status'], unique=False)

    # Create kubernetes_security table
    op.create_table('kubernetes_security',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('resource_name', sa.String(length=255), nullable=False),
        sa.Column('resource_type', sa.String(length=100), nullable=False),
        sa.Column('namespace', sa.String(length=255), nullable=True),
        sa.Column('subject_type', sa.String(length=50), nullable=True),
        sa.Column('subject_name', sa.String(length=255), nullable=True),
        sa.Column('role_name', sa.String(length=255), nullable=True),
        sa.Column('permissions', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('policy_types', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('pod_selector', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('ingress_rules', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('egress_rules', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('secret_type', sa.String(length=100), nullable=True),
        sa.Column('data_keys', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('compliance_status', sa.String(length=50), nullable=False),
        sa.Column('last_audit', sa.DateTime(timezone=True), nullable=True),
        sa.Column('access_count', sa.Integer(), nullable=False),
        sa.Column('violation_count', sa.Integer(), nullable=False),
        sa.Column('last_access', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_k8s_security_resource', 'kubernetes_security', ['resource_type', 'resource_name'], unique=False)
    op.create_index('idx_k8s_security_namespace', 'kubernetes_security', ['namespace'], unique=False)
    op.create_index('idx_k8s_security_status', 'kubernetes_security', ['status'], unique=False)
    op.create_index('idx_k8s_security_compliance', 'kubernetes_security', ['compliance_status'], unique=False)

    # Create kubernetes_ingress table
    op.create_table('kubernetes_ingress',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('ingress_name', sa.String(length=255), nullable=False),
        sa.Column('namespace', sa.String(length=255), nullable=False),
        sa.Column('ingress_class', sa.String(length=255), nullable=True),
        sa.Column('hosts', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('paths', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('backend_services', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('tls_enabled', sa.Boolean(), nullable=False),
        sa.Column('tls_secret_name', sa.String(length=255), nullable=True),
        sa.Column('ssl_certificate_status', sa.String(length=50), nullable=True),
        sa.Column('certificate_expiry', sa.DateTime(timezone=True), nullable=True),
        sa.Column('load_balancer_ip', sa.String(length=45), nullable=True),
        sa.Column('load_balancer_hostname', sa.String(length=255), nullable=True),
        sa.Column('load_balancer_status', sa.String(length=50), nullable=False),
        sa.Column('request_count_24h', sa.Integer(), nullable=False),
        sa.Column('error_count_24h', sa.Integer(), nullable=False),
        sa.Column('avg_response_time', sa.Float(), nullable=True),
        sa.Column('rate_limit_enabled', sa.Boolean(), nullable=False),
        sa.Column('rate_limit_config', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('security_headers', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('health_status', sa.String(length=50), nullable=False),
        sa.Column('last_health_check', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_k8s_ingress_namespace_name', 'kubernetes_ingress', ['namespace', 'ingress_name'], unique=False)
    op.create_index('idx_k8s_ingress_status', 'kubernetes_ingress', ['status'], unique=False)
    op.create_index('idx_k8s_ingress_ssl_status', 'kubernetes_ingress', ['ssl_certificate_status'], unique=False)

    # Create production_metrics table
    op.create_table('production_metrics',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('metric_name', sa.String(length=255), nullable=False),
        sa.Column('metric_type', sa.String(length=100), nullable=False),
        sa.Column('component', sa.String(length=255), nullable=True),
        sa.Column('value', sa.Float(), nullable=False),
        sa.Column('unit', sa.String(length=50), nullable=True),
        sa.Column('threshold_warning', sa.Float(), nullable=True),
        sa.Column('threshold_critical', sa.Float(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('alert_sent', sa.Boolean(), nullable=False),
        sa.Column('alert_acknowledged', sa.Boolean(), nullable=False),
        sa.Column('labels', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('collection_method', sa.String(length=100), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_prod_metrics_name_timestamp', 'production_metrics', ['metric_name', 'timestamp'], unique=False)
    op.create_index('idx_prod_metrics_type', 'production_metrics', ['metric_type'], unique=False)
    op.create_index('idx_prod_metrics_component', 'production_metrics', ['component'], unique=False)
    op.create_index('idx_prod_metrics_status', 'production_metrics', ['status'], unique=False)
    op.create_index('idx_prod_metrics_timestamp', 'production_metrics', ['timestamp'], unique=False)

    # Create deployment_history table
    op.create_table('deployment_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('deployment_name', sa.String(length=255), nullable=False),
        sa.Column('namespace', sa.String(length=255), nullable=False),
        sa.Column('revision', sa.Integer(), nullable=False),
        sa.Column('image_name', sa.String(length=500), nullable=False),
        sa.Column('image_tag', sa.String(length=100), nullable=False),
        sa.Column('deployment_config', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False),
        sa.Column('deployment_type', sa.String(length=50), nullable=False),
        sa.Column('deployment_duration', sa.Integer(), nullable=True),
        sa.Column('health_check_passed', sa.Boolean(), nullable=True),
        sa.Column('rollout_strategy', sa.String(length=50), nullable=False),
        sa.Column('change_description', sa.Text(), nullable=True),
        sa.Column('change_author', sa.String(length=255), nullable=True),
        sa.Column('change_ticket', sa.String(length=100), nullable=True),
        sa.Column('rollback_reason', sa.Text(), nullable=True),
        sa.Column('rollback_to_revision', sa.Integer(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_deploy_history_name_revision', 'deployment_history', ['deployment_name', 'revision'], unique=False)
    op.create_index('idx_deploy_history_status', 'deployment_history', ['status'], unique=False)
    op.create_index('idx_deploy_history_started', 'deployment_history', ['started_at'], unique=False)

    # Set default values for existing columns
    op.execute("ALTER TABLE kubernetes_deployments ALTER COLUMN namespace SET DEFAULT 'digital-twin-platform'")
    op.execute("ALTER TABLE kubernetes_deployments ALTER COLUMN desired_replicas SET DEFAULT 1")
    op.execute("ALTER TABLE kubernetes_deployments ALTER COLUMN ready_replicas SET DEFAULT 0")
    op.execute("ALTER TABLE kubernetes_deployments ALTER COLUMN available_replicas SET DEFAULT 0")
    op.execute("ALTER TABLE kubernetes_deployments ALTER COLUMN updated_replicas SET DEFAULT 0")
    op.execute("ALTER TABLE kubernetes_deployments ALTER COLUMN status SET DEFAULT 'Pending'")
    op.execute("ALTER TABLE kubernetes_deployments ALTER COLUMN phase SET DEFAULT 'Initializing'")
    op.execute("ALTER TABLE kubernetes_deployments ALTER COLUMN deployment_strategy SET DEFAULT 'RollingUpdate'")

    op.execute("ALTER TABLE kubernetes_pods ALTER COLUMN namespace SET DEFAULT 'digital-twin-platform'")
    op.execute("ALTER TABLE kubernetes_pods ALTER COLUMN phase SET DEFAULT 'Pending'")
    op.execute("ALTER TABLE kubernetes_pods ALTER COLUMN status SET DEFAULT 'Initializing'")
    op.execute("ALTER TABLE kubernetes_pods ALTER COLUMN restart_count SET DEFAULT 0")
    op.execute("ALTER TABLE kubernetes_pods ALTER COLUMN container_count SET DEFAULT 1")
    op.execute("ALTER TABLE kubernetes_pods ALTER COLUMN ready_containers SET DEFAULT 0")

    op.execute("ALTER TABLE kubernetes_services ALTER COLUMN namespace SET DEFAULT 'digital-twin-platform'")
    op.execute("ALTER TABLE kubernetes_services ALTER COLUMN service_type SET DEFAULT 'ClusterIP'")
    op.execute("ALTER TABLE kubernetes_services ALTER COLUMN endpoint_count SET DEFAULT 0")
    op.execute("ALTER TABLE kubernetes_services ALTER COLUMN ready_endpoints SET DEFAULT 0")
    op.execute("ALTER TABLE kubernetes_services ALTER COLUMN health_status SET DEFAULT 'Unknown'")

    op.execute("ALTER TABLE kubernetes_hpa ALTER COLUMN namespace SET DEFAULT 'digital-twin-platform'")
    op.execute("ALTER TABLE kubernetes_hpa ALTER COLUMN min_replicas SET DEFAULT 1")
    op.execute("ALTER TABLE kubernetes_hpa ALTER COLUMN max_replicas SET DEFAULT 10")
    op.execute("ALTER TABLE kubernetes_hpa ALTER COLUMN current_replicas SET DEFAULT 1")
    op.execute("ALTER TABLE kubernetes_hpa ALTER COLUMN desired_replicas SET DEFAULT 1")
    op.execute("ALTER TABLE kubernetes_hpa ALTER COLUMN status SET DEFAULT 'Unknown'")

    op.execute("ALTER TABLE kubernetes_storage ALTER COLUMN namespace SET DEFAULT 'digital-twin-platform'")
    op.execute("ALTER TABLE kubernetes_storage ALTER COLUMN volume_mode SET DEFAULT 'Filesystem'")
    op.execute("ALTER TABLE kubernetes_storage ALTER COLUMN status SET DEFAULT 'Pending'")
    op.execute("ALTER TABLE kubernetes_storage ALTER COLUMN backup_enabled SET DEFAULT false")
    op.execute("ALTER TABLE kubernetes_storage ALTER COLUMN snapshot_count SET DEFAULT 0")

    op.execute("ALTER TABLE kubernetes_monitoring ALTER COLUMN namespace SET DEFAULT 'digital-twin-platform'")
    op.execute("ALTER TABLE kubernetes_monitoring ALTER COLUMN status SET DEFAULT 'Unknown'")
    op.execute("ALTER TABLE kubernetes_monitoring ALTER COLUMN health_status SET DEFAULT 'Unknown'")

    op.execute("ALTER TABLE kubernetes_security ALTER COLUMN status SET DEFAULT 'Active'")
    op.execute("ALTER TABLE kubernetes_security ALTER COLUMN compliance_status SET DEFAULT 'Unknown'")
    op.execute("ALTER TABLE kubernetes_security ALTER COLUMN access_count SET DEFAULT 0")
    op.execute("ALTER TABLE kubernetes_security ALTER COLUMN violation_count SET DEFAULT 0")

    op.execute("ALTER TABLE kubernetes_ingress ALTER COLUMN namespace SET DEFAULT 'digital-twin-platform'")
    op.execute("ALTER TABLE kubernetes_ingress ALTER COLUMN tls_enabled SET DEFAULT false")
    op.execute("ALTER TABLE kubernetes_ingress ALTER COLUMN load_balancer_status SET DEFAULT 'Pending'")
    op.execute("ALTER TABLE kubernetes_ingress ALTER COLUMN request_count_24h SET DEFAULT 0")
    op.execute("ALTER TABLE kubernetes_ingress ALTER COLUMN error_count_24h SET DEFAULT 0")
    op.execute("ALTER TABLE kubernetes_ingress ALTER COLUMN rate_limit_enabled SET DEFAULT false")
    op.execute("ALTER TABLE kubernetes_ingress ALTER COLUMN status SET DEFAULT 'Pending'")
    op.execute("ALTER TABLE kubernetes_ingress ALTER COLUMN health_status SET DEFAULT 'Unknown'")

    op.execute("ALTER TABLE production_metrics ALTER COLUMN status SET DEFAULT 'Normal'")
    op.execute("ALTER TABLE production_metrics ALTER COLUMN alert_sent SET DEFAULT false")
    op.execute("ALTER TABLE production_metrics ALTER COLUMN alert_acknowledged SET DEFAULT false")

    op.execute("ALTER TABLE deployment_history ALTER COLUMN namespace SET DEFAULT 'digital-twin-platform'")
    op.execute("ALTER TABLE deployment_history ALTER COLUMN rollout_strategy SET DEFAULT 'RollingUpdate'")


def downgrade() -> None:
    # Drop tables in reverse order due to foreign key constraints
    op.drop_table('deployment_history')
    op.drop_table('production_metrics')
    op.drop_table('kubernetes_ingress')
    op.drop_table('kubernetes_security')
    op.drop_table('kubernetes_monitoring')
    op.drop_table('kubernetes_storage')
    op.drop_table('kubernetes_hpa')
    op.drop_table('kubernetes_services')
    op.drop_table('kubernetes_pods')
    op.drop_table('kubernetes_deployments')