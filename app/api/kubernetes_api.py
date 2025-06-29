"""
Digital Twin Platform - Kubernetes API Endpoints
Phase 5: Production Deployment with Kubernetes orchestration, monitoring, and security
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import asyncio
import logging

from app.database import get_db
from app.auth.auth_dependencies import get_current_user
from app.models.twin_phase5 import (
    KubernetesDeployment, KubernetesPod, KubernetesService, KubernetesHPA,
    KubernetesStorage, KubernetesMonitoring, KubernetesSecurity, 
    KubernetesIngress, ProductionMetrics, DeploymentHistory
)
from app.models.user import User

router = APIRouter(prefix="/api/k8s", tags=["kubernetes"])
logger = logging.getLogger(__name__)

@router.get("/deployment/status")
async def get_deployment_status(
    namespace: str = "digital-twin-platform",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get Kubernetes deployment status and health metrics"""
    try:
        # Get all deployments in the namespace
        result = await db.execute(
            select(KubernetesDeployment).where(
                KubernetesDeployment.namespace == namespace
            ).order_by(KubernetesDeployment.deployment_name)
        )
        deployments = result.scalars().all()
        
        deployment_data = []
        for deployment in deployments:
            deployment_data.append({
                "name": deployment.deployment_name,
                "type": deployment.deployment_type,
                "ready_replicas": deployment.ready_replicas,
                "desired_replicas": deployment.desired_replicas,
                "available_replicas": deployment.available_replicas,
                "status": deployment.status,
                "phase": deployment.phase,
                "image": f"{deployment.image_name}:{deployment.image_tag}" if deployment.image_name else None,
                "strategy": deployment.deployment_strategy,
                "last_updated": deployment.updated_at.isoformat() if deployment.updated_at else None,
                "last_deployed": deployment.last_deployed_at.isoformat() if deployment.last_deployed_at else None
            })
        
        # Calculate overall health
        total_deployments = len(deployments)
        healthy_deployments = len([d for d in deployments if d.status == "Running" and d.ready_replicas == d.desired_replicas])
        health_percentage = (healthy_deployments / total_deployments * 100) if total_deployments > 0 else 0
        
        return {
            "namespace": namespace,
            "deployments": deployment_data,
            "summary": {
                "total_deployments": total_deployments,
                "healthy_deployments": healthy_deployments,
                "health_percentage": round(float(health_percentage), 2),
                "status": "Healthy" if health_percentage >= 90 else "Degraded" if health_percentage >= 70 else "Unhealthy"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting deployment status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get deployment status: {str(e)}"
        )

@router.get("/pods/metrics")
async def get_pod_metrics(
    namespace: str = "digital-twin-platform",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get pod resource usage and performance metrics"""
    try:
        # Get all pods in the namespace with their deployment info
        result = await db.execute(
            select(KubernetesPod, KubernetesDeployment).join(
                KubernetesDeployment, KubernetesPod.deployment_id == KubernetesDeployment.id
            ).where(
                KubernetesPod.namespace == namespace
            ).order_by(KubernetesPod.pod_name)
        )
        pods_with_deployments = result.all()
        
        pod_data = []
        total_cpu_usage = 0
        total_memory_usage = 0
        running_pods = 0
        
        for pod, deployment in pods_with_deployments:
            pod_info = {
                "name": pod.pod_name,
                "deployment": deployment.deployment_name,
                "node": pod.node_name,
                "status": pod.status,
                "phase": pod.phase,
                "restart_count": pod.restart_count,
                "cpu_usage": pod.cpu_usage,
                "memory_usage": pod.memory_usage,
                "cpu_usage_percentage": pod.cpu_usage_percentage,
                "memory_usage_percentage": pod.memory_usage_percentage,
                "cpu_limit": deployment.cpu_limit,
                "memory_limit": deployment.memory_limit,
                "ready_containers": pod.ready_containers,
                "total_containers": pod.container_count,
                "pod_ip": pod.pod_ip,
                "started_at": pod.started_at.isoformat() if pod.started_at else None
            }
            pod_data.append(pod_info)
            
            if pod.status == "Running":
                running_pods += 1
                if pod.cpu_usage_percentage:
                    total_cpu_usage += pod.cpu_usage_percentage
                if pod.memory_usage_percentage:
                    total_memory_usage += pod.memory_usage_percentage
        
        # Calculate averages
        avg_cpu_usage = (total_cpu_usage / running_pods) if running_pods > 0 else 0
        avg_memory_usage = (total_memory_usage / running_pods) if running_pods > 0 else 0
        
        return {
            "namespace": namespace,
            "pods": pod_data,
            "summary": {
                "total_pods": len(pod_data),
                "running_pods": running_pods,
                "avg_cpu_usage_percentage": round(float(avg_cpu_usage), 2),
                "avg_memory_usage_percentage": round(float(avg_memory_usage), 2),
                "pods_with_restarts": len([p for p, _ in pods_with_deployments if p.restart_count > 0])
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting pod metrics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get pod metrics: {str(e)}"
        )

@router.get("/services/health")
async def get_service_health(
    namespace: str = "digital-twin-platform",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check health status of all Kubernetes services"""
    try:
        # Get all services in the namespace
        result = await db.execute(
            select(KubernetesService).where(
                KubernetesService.namespace == namespace
            ).order_by(KubernetesService.service_name)
        )
        services = result.scalars().all()
        
        service_data = []
        healthy_services = 0
        
        for service in services:
            service_info = {
                "name": service.service_name,
                "type": service.service_type,
                "cluster_ip": service.cluster_ip,
                "external_ip": service.external_ip,
                "ports": service.ports,
                "endpoints": service.endpoint_count,
                "ready_endpoints": service.ready_endpoints,
                "health_status": service.health_status,
                "load_balancer_ip": service.load_balancer_ip,
                "load_balancer_hostname": service.load_balancer_hostname
            }
            service_data.append(service_info)
            
            if service.health_status == "Healthy":
                healthy_services += 1
        
        # Calculate overall service health
        total_services = len(services)
        health_percentage = (healthy_services / total_services * 100) if total_services > 0 else 0
        
        return {
            "namespace": namespace,
            "services": service_data,
            "summary": {
                "total_services": total_services,
                "healthy_services": healthy_services,
                "health_percentage": round(float(health_percentage), 2),
                "status": "Healthy" if health_percentage >= 90 else "Degraded" if health_percentage >= 70 else "Unhealthy"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting service health: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get service health: {str(e)}"
        )

@router.get("/scaling/status")
async def get_scaling_status(
    namespace: str = "digital-twin-platform",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get horizontal pod autoscaler status and metrics"""
    try:
        # Get all HPA configurations in the namespace
        result = await db.execute(
            select(KubernetesHPA).where(
                KubernetesHPA.namespace == namespace
            ).order_by(KubernetesHPA.hpa_name)
        )
        hpas = result.scalars().all()
        
        hpa_data = []
        for hpa in hpas:
            hpa_info = {
                "name": hpa.hpa_name,
                "target_deployment": hpa.target_deployment,
                "current_replicas": hpa.current_replicas,
                "desired_replicas": hpa.desired_replicas,
                "min_replicas": hpa.min_replicas,
                "max_replicas": hpa.max_replicas,
                "target_cpu_utilization": hpa.target_cpu_utilization,
                "current_cpu_utilization": hpa.current_cpu_utilization,
                "target_memory_utilization": hpa.target_memory_utilization,
                "current_memory_utilization": hpa.current_memory_utilization,
                "status": hpa.status,
                "last_scale_time": hpa.last_scale_time.isoformat() if hpa.last_scale_time else None,
                "scaling_active": hpa.current_replicas != hpa.desired_replicas
            }
            hpa_data.append(hpa_info)
        
        # Calculate scaling summary
        total_hpas = len(hpas)
        stable_hpas = len([h for h in hpas if h.status == "Stable"])
        scaling_hpas = len([h for h in hpas if h.current_replicas != h.desired_replicas])
        
        return {
            "namespace": namespace,
            "hpa": hpa_data,
            "summary": {
                "total_hpas": total_hpas,
                "stable_hpas": stable_hpas,
                "scaling_hpas": scaling_hpas,
                "autoscaling_enabled": total_hpas > 0
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting scaling status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get scaling status: {str(e)}"
        )

@router.get("/storage/status")
async def get_storage_status(
    namespace: str = "digital-twin-platform",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get persistent volume and storage class status"""
    try:
        # Get all storage resources in the namespace
        result = await db.execute(
            select(KubernetesStorage).where(
                KubernetesStorage.namespace == namespace
            ).order_by(KubernetesStorage.pvc_name)
        )
        storage_resources = result.scalars().all()
        
        storage_data = []
        total_capacity = 0.0
        total_used = 0.0
        
        for storage in storage_resources:
            # Parse capacity and usage (assuming format like "10Gi", "2.5Gi")
            try:
                capacity_str = str(storage.capacity) if storage.capacity else "0Gi"
                capacity_value = float(capacity_str.replace('Gi', '').replace('Mi', '').replace('Ki', ''))
                if 'Gi' in capacity_str:
                    capacity_gb = capacity_value
                elif 'Mi' in capacity_str:
                    capacity_gb = capacity_value / 1024
                else:
                    capacity_gb = capacity_value / (1024 * 1024)
                
                used_gb = 0.0
                if storage.used_capacity:
                    used_str = str(storage.used_capacity)
                    used_value = float(used_str.replace('Gi', '').replace('Mi', '').replace('Ki', ''))
                    if 'Gi' in used_str:
                        used_gb = used_value
                    elif 'Mi' in used_str:
                        used_gb = used_value / 1024
                    else:
                        used_gb = used_value / (1024 * 1024)
                
                total_capacity += capacity_gb
                total_used += used_gb
                
            except (ValueError, AttributeError):
                capacity_gb = 0.0
                used_gb = 0.0
            
            storage_info = {
                "pvc_name": storage.pvc_name,
                "pv_name": storage.pv_name,
                "storage_class": storage.storage_class,
                "capacity": storage.capacity,
                "used_capacity": storage.used_capacity,
                "usage_percentage": storage.usage_percentage,
                "status": storage.status,
                "access_modes": storage.access_modes,
                "volume_mode": storage.volume_mode,
                "storage_backend": storage.storage_backend,
                "backup_enabled": storage.backup_enabled,
                "last_backup": storage.last_backup_at.isoformat() if storage.last_backup_at else None,
                "snapshot_count": storage.snapshot_count
            }
            storage_data.append(storage_info)
        
        # Calculate storage summary
        bound_volumes = len([s for s in storage_resources if s.status == "Bound"])
        total_volumes = len(storage_resources)
        overall_usage = (total_used / total_capacity * 100) if total_capacity > 0 else 0
        
        return {
            "namespace": namespace,
            "persistent_volumes": storage_data,
            "summary": {
                "total_volumes": total_volumes,
                "bound_volumes": bound_volumes,
                "total_capacity_gb": round(total_capacity, 2),
                "total_used_gb": round(total_used, 2),
                "overall_usage_percentage": round(float(overall_usage), 2),
                "backup_enabled_count": len([s for s in storage_resources if s.backup_enabled])
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting storage status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get storage status: {str(e)}"
        )

@router.get("/security/status")
async def get_security_status(
    namespace: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get RBAC and security policy status"""
    try:
        # Build query based on namespace filter
        query = select(KubernetesSecurity)
        if namespace:
            query = query.where(KubernetesSecurity.namespace == namespace)
        
        result = await db.execute(query.order_by(KubernetesSecurity.resource_type, KubernetesSecurity.resource_name))
        security_resources = result.scalars().all()
        
        security_data = []
        resource_counts = {}
        compliant_resources = 0
        
        for security in security_resources:
            security_info = {
                "resource_name": security.resource_name,
                "resource_type": security.resource_type,
                "namespace": security.namespace,
                "status": security.status,
                "compliance_status": security.compliance_status,
                "subject_type": security.subject_type,
                "subject_name": security.subject_name,
                "role_name": security.role_name,
                "permissions": security.permissions,
                "access_count": security.access_count,
                "violation_count": security.violation_count,
                "last_audit": security.last_audit.isoformat() if security.last_audit else None,
                "last_access": security.last_access.isoformat() if security.last_access else None
            }
            security_data.append(security_info)
            
            # Count resource types
            resource_type = security.resource_type
            resource_counts[resource_type] = resource_counts.get(resource_type, 0) + 1
            
            if security.compliance_status == "Compliant":
                compliant_resources += 1
        
        # Calculate security summary
        total_resources = len(security_resources)
        compliance_percentage = (compliant_resources / total_resources * 100) if total_resources > 0 else 0
        total_violations = sum(s.violation_count for s in security_resources)
        
        return {
            "namespace": namespace or "cluster-wide",
            "security_resources": security_data,
            "summary": {
                "total_resources": total_resources,
                "compliant_resources": compliant_resources,
                "compliance_percentage": round(float(compliance_percentage), 2),
                "total_violations": total_violations,
                "resource_counts": resource_counts,
                "security_status": "Secure" if compliance_percentage >= 95 else "At Risk" if compliance_percentage >= 80 else "Vulnerable"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting security status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get security status: {str(e)}"
        )

@router.get("/monitoring/status")
async def get_monitoring_status(
    namespace: str = "digital-twin-platform",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get Prometheus, Grafana, and AlertManager status"""
    try:
        # Get all monitoring components in the namespace
        result = await db.execute(
            select(KubernetesMonitoring).where(
                KubernetesMonitoring.namespace == namespace
            ).order_by(KubernetesMonitoring.component_name)
        )
        monitoring_components = result.scalars().all()
        
        component_data = []
        running_components = 0
        total_alerts = 0
        
        for component in monitoring_components:
            component_info = {
                "name": component.component_name,
                "type": component.component_type,
                "status": component.status,
                "health_status": component.health_status,
                "version": component.version,
                "uptime_seconds": component.uptime_seconds,
                "cpu_usage": component.cpu_usage,
                "memory_usage": component.memory_usage,
                "disk_usage": component.disk_usage,
                "last_health_check": component.last_health_check.isoformat() if component.last_health_check else None
            }
            
            # Add component-specific metrics
            if component.component_name == "prometheus":
                component_info.update({
                    "targets_up": component.targets_up,
                    "targets_total": component.targets_total,
                    "rules_loaded": component.rules_loaded,
                    "data_retention": component.data_retention,
                    "storage_size": component.storage_size
                })
            elif component.component_name == "grafana":
                component_info.update({
                    "dashboards_count": component.dashboards_count,
                    "users_count": component.users_count,
                    "alerts_count": component.alerts_count
                })
                if component.alerts_count:
                    total_alerts += int(component.alerts_count) if component.alerts_count is not None else 0
            elif component.component_name == "alertmanager":
                component_info.update({
                    "active_alerts": component.active_alerts,
                    "silenced_alerts": component.silenced_alerts,
                    "inhibited_alerts": component.inhibited_alerts
                })
                if component.active_alerts:
                    total_alerts += int(component.active_alerts) if component.active_alerts is not None else 0
            
            component_data.append(component_info)
            
            if component.status == "Running":
                running_components += 1
        
        # Calculate monitoring summary
        total_components = len(monitoring_components)
        health_percentage = (running_components / total_components * 100) if total_components > 0 else 0
        
        return {
            "namespace": namespace,
            "components": component_data,
            "summary": {
                "total_components": total_components,
                "running_components": running_components,
                "health_percentage": round(float(health_percentage), 2),
                "total_alerts": total_alerts,
                "monitoring_status": "Operational" if health_percentage >= 90 else "Degraded" if health_percentage >= 70 else "Critical"
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting monitoring status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get monitoring status: {str(e)}"
        )

@router.get("/ingress/status")
async def get_ingress_status(
    namespace: str = "digital-twin-platform",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get ingress controller and SSL certificate status"""
    try:
        # Get all ingress resources in the namespace
        result = await db.execute(
            select(KubernetesIngress).where(
                KubernetesIngress.namespace == namespace
            ).order_by(KubernetesIngress.ingress_name)
        )
        ingress_resources = result.scalars().all()
        
        ingress_data = []
        active_ingresses = 0
        ssl_enabled_count = 0
        total_requests_24h = 0
        total_errors_24h = 0
        
        for ingress in ingress_resources:
            # Check SSL certificate expiry
            ssl_status = "N/A"
            days_until_expiry = None
            if ingress.tls_enabled and ingress.certificate_expiry:
                days_until_expiry = (ingress.certificate_expiry - datetime.utcnow()).days
                if days_until_expiry > 30:
                    ssl_status = "Valid"
                elif days_until_expiry > 7:
                    ssl_status = "Expiring Soon"
                else:
                    ssl_status = "Expired" if days_until_expiry <= 0 else "Critical"
            
            ingress_info = {
                "name": ingress.ingress_name,
                "hosts": ingress.hosts,
                "paths": ingress.paths,
                "backend_services": ingress.backend_services,
                "tls_enabled": ingress.tls_enabled,
                "ssl_certificate_status": ssl_status,
                "certificate_expiry": ingress.certificate_expiry.isoformat() if ingress.certificate_expiry else None,
                "days_until_expiry": days_until_expiry,
                "load_balancer_ip": ingress.load_balancer_ip,
                "load_balancer_hostname": ingress.load_balancer_hostname,
                "load_balancer_status": ingress.load_balancer_status,
                "status": ingress.status,
                "health_status": ingress.health_status,
                "request_count_24h": ingress.request_count_24h,
                "error_count_24h": ingress.error_count_24h,
                "avg_response_time": ingress.avg_response_time,
                "rate_limit_enabled": ingress.rate_limit_enabled,
                "last_health_check": ingress.last_health_check.isoformat() if ingress.last_health_check else None
            }
            ingress_data.append(ingress_info)
            
            if ingress.status == "Active":
                active_ingresses += 1
            if ingress.tls_enabled:
                ssl_enabled_count += 1
            
            total_requests_24h += int(ingress.request_count_24h) if ingress.request_count_24h is not None else 0
            total_errors_24h += int(ingress.error_count_24h) if ingress.error_count_24h is not None else 0
        
        # Calculate ingress summary
        total_ingresses = len(ingress_resources)
        error_rate = (total_errors_24h / total_requests_24h * 100) if total_requests_24h > 0 else 0
        
        return {
            "namespace": namespace,
            "ingress_resources": ingress_data,
            "summary": {
                "total_ingresses": total_ingresses,
                "active_ingresses": active_ingresses,
                "ssl_enabled_count": ssl_enabled_count,
                "total_requests_24h": total_requests_24h,
                "total_errors_24h": total_errors_24h,
                "error_rate_percentage": round(float(error_rate), 2) if error_rate is not None else 0.0,
                "avg_response_time": 0.0  # Simplified to avoid type issues - would be calculated from actual metrics in production
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting ingress status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get ingress status: {str(e)}"
        )

@router.get("/namespace/resources")
async def get_namespace_resources(
    namespace: str = "digital-twin-platform",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get namespace resource quotas and usage"""
    try:
        # Get resource usage across all resource types
        deployments_result = await db.execute(
            select(func.count(KubernetesDeployment.id)).where(
                KubernetesDeployment.namespace == namespace
            )
        )
        deployment_count = deployments_result.scalar() or 0
        
        pods_result = await db.execute(
            select(func.count(KubernetesPod.id)).where(
                KubernetesPod.namespace == namespace
            )
        )
        pod_count = pods_result.scalar() or 0
        
        services_result = await db.execute(
            select(func.count(KubernetesService.id)).where(
                KubernetesService.namespace == namespace
            )
        )
        service_count = services_result.scalar() or 0
        
        storage_result = await db.execute(
            select(func.count(KubernetesStorage.id)).where(
                KubernetesStorage.namespace == namespace
            )
        )
        storage_count = storage_result.scalar() or 0
        
        # Get recent metrics for resource usage trends
        metrics_result = await db.execute(
            select(ProductionMetrics).where(
                and_(
                    ProductionMetrics.metric_type == "performance",
                    ProductionMetrics.timestamp >= datetime.utcnow() - timedelta(hours=1)
                )
            ).order_by(ProductionMetrics.timestamp.desc()).limit(10)
        )
        recent_metrics = metrics_result.scalars().all()
        
        # Calculate resource quotas and limits (mock data for demonstration)
        resource_quotas = {
            "cpu_limit": "4000m",
            "memory_limit": "8Gi",
            "storage_limit": "100Gi",
            "pod_limit": 50,
            "service_limit": 20
        }
        
        resource_usage = {
            "cpu_used": "1200m",
            "memory_used": "3.2Gi",
            "storage_used": "25Gi",
            "pods_used": pod_count,
            "services_used": service_count
        }
        
        # Calculate usage percentages
        cpu_usage_pct = 30.0  # Mock calculation
        memory_usage_pct = 40.0  # Mock calculation
        storage_usage_pct = 25.0  # Mock calculation
        pod_usage_pct = (pod_count / 50) * 100
        service_usage_pct = (service_count / 20) * 100
        
        return {
            "namespace": namespace,
            "resource_quotas": resource_quotas,
            "resource_usage": resource_usage,
            "usage_percentages": {
                "cpu": round(cpu_usage_pct, 2),
                "memory": round(memory_usage_pct, 2),
                "storage": round(storage_usage_pct, 2),
                "pods": round(pod_usage_pct, 2),
                "services": round(service_usage_pct, 2)
            },
            "resource_counts": {
                "deployments": deployment_count,
                "pods": pod_count,
                "services": service_count,
                "storage_volumes": storage_count
            },
            "recent_metrics": [
                {
                    "metric_name": metric.metric_name,
                    "value": metric.value,
                    "unit": metric.unit,
                    "timestamp": metric.timestamp.isoformat()
                } for metric in recent_metrics
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting namespace resources: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get namespace resources: {str(e)}"
        )

@router.get("/cluster/info")
async def get_cluster_info(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get overall cluster information and node status"""
    try:
        # Get cluster-wide statistics
        total_deployments_result = await db.execute(select(func.count(KubernetesDeployment.id)))
        total_deployments = total_deployments_result.scalar() or 0
        
        total_pods_result = await db.execute(select(func.count(KubernetesPod.id)))
        total_pods = total_pods_result.scalar() or 0
        
        total_services_result = await db.execute(select(func.count(KubernetesService.id)))
        total_services = total_services_result.scalar() or 0
        
        # Get running pods
        running_pods_result = await db.execute(
            select(func.count(KubernetesPod.id)).where(KubernetesPod.status == "Running")
        )
        running_pods = running_pods_result.scalar() or 0
        
        # Get healthy services
        healthy_services_result = await db.execute(
            select(func.count(KubernetesService.id)).where(KubernetesService.health_status == "Healthy")
        )
        healthy_services = healthy_services_result.scalar() or 0
        
        # Calculate cluster health
        pod_health = (running_pods / total_pods * 100) if total_pods > 0 else 100
        service_health = (healthy_services / total_services * 100) if total_services > 0 else 100
        overall_health = (pod_health + service_health) / 2
        
        # Mock node information (in real implementation, this would come from Kubernetes API)
        node_info = [
            {
                "name": "node-1",
                "status": "Ready",
                "roles": ["control-plane", "master"],
                "age": "45d",
                "version": "v1.28.0",
                "cpu_capacity": "4",
                "memory_capacity": "8Gi",
                "cpu_usage": "45%",
                "memory_usage": "60%"
            },
            {
                "name": "node-2",
                "status": "Ready",
                "roles": ["worker"],
                "age": "45d",
                "version": "v1.28.0",
                "cpu_capacity": "4",
                "memory_capacity": "8Gi",
                "cpu_usage": "35%",
                "memory_usage": "50%"
            },
            {
                "name": "node-3",
                "status": "Ready",
                "roles": ["worker"],
                "age": "45d",
                "version": "v1.28.0",
                "cpu_capacity": "4",
                "memory_capacity": "8Gi",
                "cpu_usage": "40%",
                "memory_usage": "55%"
            }
        ]
        
        return {
            "cluster_info": {
                "name": "digital-twin-production-cluster",
                "version": "v1.28.0",
                "provider": "cloud-provider",
                "region": "us-west-2",
                "nodes": len(node_info),
                "ready_nodes": len([n for n in node_info if n["status"] == "Ready"])
            },
            "resource_summary": {
                "total_deployments": total_deployments,
                "total_pods": total_pods,
                "running_pods": running_pods,
                "total_services": total_services,
                "healthy_services": healthy_services,
                "pod_health_percentage": round(float(pod_health), 2),
                "service_health_percentage": round(float(service_health), 2),
                "overall_health_percentage": round(float(overall_health), 2)
            },
            "nodes": node_info,
            "cluster_status": "Healthy" if overall_health >= 90 else "Degraded" if overall_health >= 70 else "Unhealthy",
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error getting cluster info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get cluster info: {str(e)}"
        )