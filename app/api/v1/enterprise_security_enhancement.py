"""
Enterprise Security Enhancement API Router
Implements Priority 4B: Enterprise Security Enhancement endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
import logging

from ...database import get_db
from ...services.enterprise_security_enhancement_service import get_enterprise_security_enhancement_service, EnterpriseSecurityEnhancementService
from ...auth.auth_service import get_current_user
from ...models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/enterprise-security", tags=["Enterprise Security Enhancement"])


@router.post("/security-scan/{tenant_id}")
async def perform_security_scan(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    service: EnterpriseSecurityEnhancementService = Depends(get_enterprise_security_enhancement_service)
) -> Dict[str, Any]:
    """
    Perform comprehensive security scan for enterprise tenant
    
    Returns:
    - Threat analysis and active threats
    - Vulnerability assessment
    - Compliance status check
    - Access control audit
    - Data protection status
    - Network security analysis
    - User behavior security analysis
    - Security recommendations
    - Overall security score
    """
    try:
        # Verify user has access to tenant security data
        if not _has_security_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to security data")
        
        result = await service.perform_comprehensive_security_scan(tenant_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error performing security scan for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/security-policy/{tenant_id}")
async def create_security_policy(
    tenant_id: int,
    policy_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    service: EnterpriseSecurityEnhancementService = Depends(get_enterprise_security_enhancement_service)
) -> Dict[str, Any]:
    """
    Create advanced security policy for tenant
    
    Parameters:
    - policy_data: Policy configuration including name, description, rules, enforcement level
    
    Returns:
    - Policy ID and creation status
    - Validation results
    """
    try:
        # Verify user has admin access to tenant
        if not _has_admin_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Admin access required to create security policies")
        
        result = await service.create_security_policy(tenant_id, policy_data)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating security policy for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/policy-enforcement/{tenant_id}")
async def enforce_security_policies(
    tenant_id: int,
    enforcement_request: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    service: EnterpriseSecurityEnhancementService = Depends(get_enterprise_security_enhancement_service)
) -> Dict[str, Any]:
    """
    Enforce security policies for user actions
    
    Parameters:
    - enforcement_request: Contains user_id, action, resource for policy evaluation
    
    Returns:
    - Policy enforcement result
    - Violations and warnings
    - Allowed/denied status
    """
    try:
        # Verify user has access to tenant
        if not _has_tenant_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to tenant")
        
        user_id = enforcement_request.get("user_id")
        action = enforcement_request.get("action")
        resource = enforcement_request.get("resource")
        
        if not all([user_id, action, resource]):
            raise HTTPException(status_code=400, detail="Missing required fields: user_id, action, resource")
        
        # Ensure proper types
        if not isinstance(user_id, int):
            raise HTTPException(status_code=400, detail="user_id must be an integer")
        if not isinstance(action, str):
            raise HTTPException(status_code=400, detail="action must be a string")
        if not isinstance(resource, str):
            raise HTTPException(status_code=400, detail="resource must be a string")
        
        result = await service.enforce_security_policies(tenant_id, user_id, action, resource)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error enforcing security policies for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/security-incident/{tenant_id}")
async def create_security_incident(
    tenant_id: int,
    incident_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    service: EnterpriseSecurityEnhancementService = Depends(get_enterprise_security_enhancement_service)
) -> Dict[str, Any]:
    """
    Create and manage security incident
    
    Parameters:
    - incident_data: Incident details including title, description, severity, category
    
    Returns:
    - Incident ID and creation status
    - Assigned team and workflow ID
    """
    try:
        # Verify user has security access
        if not _has_security_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Security access required to create incidents")
        
        result = await service.create_security_incident(tenant_id, incident_data)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating security incident for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/security-incident/{incident_id}")
async def update_security_incident(
    incident_id: str,
    status_update: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    service: EnterpriseSecurityEnhancementService = Depends(get_enterprise_security_enhancement_service)
) -> Dict[str, Any]:
    """
    Update security incident status and progress
    
    Parameters:
    - status_update: Status, actions, and progress updates
    
    Returns:
    - Updated incident status
    - Timeline and action history
    """
    try:
        # Add current user to update data
        status_update["updated_by"] = current_user.id
        
        result = await service.update_incident_status(incident_id, status_update)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating security incident {incident_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/security-dashboard/{tenant_id}")
async def get_security_dashboard(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    service: EnterpriseSecurityEnhancementService = Depends(get_enterprise_security_enhancement_service)
) -> Dict[str, Any]:
    """
    Get security dashboard with key metrics and alerts
    
    Returns:
    - Security score and trends
    - Active threats and incidents
    - Compliance status
    - Recent security events
    - Quick actions and recommendations
    """
    try:
        # Verify user has access to tenant security data
        if not _has_security_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Access denied to security dashboard")
        
        # Get comprehensive security scan for dashboard
        scan_result = await service.perform_comprehensive_security_scan(tenant_id)
        
        if "error" in scan_result:
            raise HTTPException(status_code=400, detail=scan_result["error"])
        
        # Compile dashboard data
        dashboard_data = {
            "tenant_id": tenant_id,
            "security_score": scan_result.get("overall_security_score", 0),
            "threat_summary": {
                "active_threats": scan_result.get("threat_analysis", {}).get("active_threats", 0),
                "threat_level": _calculate_threat_level(scan_result.get("threat_analysis", {})),
                "recent_events": len(scan_result.get("threat_analysis", {}).get("high_risk_events", []))
            },
            "compliance_summary": {
                "overall_score": scan_result.get("compliance_check", {}).get("overall_compliance_score", 0),
                "gaps_count": len(scan_result.get("compliance_check", {}).get("compliance_gaps", [])),
                "frameworks": ["GDPR", "SOX", "ISO27001", "HIPAA"]
            },
            "vulnerability_summary": {
                "critical": len(scan_result.get("vulnerability_assessment", {}).get("critical_vulnerabilities", [])),
                "medium": len(scan_result.get("vulnerability_assessment", {}).get("medium_vulnerabilities", [])),
                "low": len(scan_result.get("vulnerability_assessment", {}).get("low_vulnerabilities", [])),
                "score": scan_result.get("vulnerability_assessment", {}).get("vulnerability_score", 0)
            },
            "recommendations": scan_result.get("recommendations", [])[:5],  # Top 5 recommendations
            "last_scan": scan_result.get("scan_timestamp"),
            "quick_actions": _generate_security_quick_actions(scan_result)
        }
        
        return dashboard_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting security dashboard for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/compliance-report/{tenant_id}")
async def get_compliance_report(
    tenant_id: int,
    framework: Optional[str] = Query(None, description="Specific compliance framework (gdpr, sox, iso27001, hipaa)"),
    current_user: User = Depends(get_current_user),
    service: EnterpriseSecurityEnhancementService = Depends(get_enterprise_security_enhancement_service)
) -> Dict[str, Any]:
    """
    Get detailed compliance report
    
    Parameters:
    - framework: Optional specific framework to focus on
    
    Returns:
    - Detailed compliance status
    - Framework-specific requirements
    - Remediation recommendations
    - Compliance timeline and history
    """
    try:
        # Verify user has compliance access
        if not _has_compliance_access(current_user, tenant_id):
            raise HTTPException(status_code=403, detail="Compliance access required")
        
        # Get security scan for compliance data
        scan_result = await service.perform_comprehensive_security_scan(tenant_id)
        
        if "error" in scan_result:
            raise HTTPException(status_code=400, detail=scan_result["error"])
        
        compliance_data = scan_result.get("compliance_check", {})
        
        if framework:
            # Return specific framework data
            framework_key = f"{framework}_compliance"
            if framework_key in compliance_data:
                return {
                    "framework": framework.upper(),
                    "tenant_id": tenant_id,
                    "compliance_details": compliance_data[framework_key],
                    "generated_at": scan_result.get("scan_timestamp")
                }
            else:
                raise HTTPException(status_code=404, detail=f"Framework {framework} not found")
        
        # Return comprehensive compliance report
        return {
            "tenant_id": tenant_id,
            "overall_compliance": compliance_data,
            "summary": {
                "overall_score": compliance_data.get("overall_compliance_score", 0),
                "compliant_frameworks": _count_compliant_frameworks(compliance_data),
                "total_frameworks": 4,
                "gaps_requiring_attention": len(compliance_data.get("compliance_gaps", []))
            },
            "generated_at": scan_result.get("scan_timestamp")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting compliance report for tenant {tenant_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Helper functions

def _has_tenant_access(user: User, tenant_id: int) -> bool:
    """Check if user has access to tenant"""
    # Admin users have access to all tenants
    if hasattr(user, 'is_admin') and user.is_admin:
        return True
    
    # Users can only access their own tenant
    return user.tenant_id == tenant_id


def _has_security_access(user: User, tenant_id: int) -> bool:
    """Check if user has access to security data"""
    # Admin users have access to all security data
    if hasattr(user, 'is_admin') and user.is_admin:
        return True
    
    # Check if user is security admin for the tenant
    if user.tenant_id == tenant_id:
        return hasattr(user, 'role') and user.role in ['owner', 'admin', 'security_admin']
    
    return False


def _has_admin_access(user: User, tenant_id: int) -> bool:
    """Check if user has admin access to tenant"""
    # Admin users have access to all tenants
    if hasattr(user, 'is_admin') and user.is_admin:
        return True
    
    # Check if user is admin for the tenant
    if user.tenant_id == tenant_id:
        return hasattr(user, 'role') and user.role in ['owner', 'admin']
    
    return False


def _has_compliance_access(user: User, tenant_id: int) -> bool:
    """Check if user has access to compliance data"""
    # Admin users have access to all compliance data
    if hasattr(user, 'is_admin') and user.is_admin:
        return True
    
    # Check if user has compliance role for the tenant
    if user.tenant_id == tenant_id:
        return hasattr(user, 'role') and user.role in ['owner', 'admin', 'compliance_officer', 'security_admin']
    
    return False


def _calculate_threat_level(threat_analysis: Dict[str, Any]) -> str:
    """Calculate overall threat level"""
    active_threats = threat_analysis.get("active_threats", 0)
    
    if active_threats >= 5:
        return "critical"
    elif active_threats >= 3:
        return "high"
    elif active_threats >= 1:
        return "medium"
    else:
        return "low"


def _generate_security_quick_actions(scan_result: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Generate quick action suggestions based on scan results"""
    actions = []
    
    # Threat response actions
    active_threats = scan_result.get("threat_analysis", {}).get("active_threats", 0)
    if active_threats > 0:
        actions.append({
            "title": "Review Active Threats",
            "description": f"Address {active_threats} active security threats",
            "priority": "critical",
            "action_type": "threat_response"
        })
    
    # Vulnerability actions
    critical_vulns = len(scan_result.get("vulnerability_assessment", {}).get("critical_vulnerabilities", []))
    if critical_vulns > 0:
        actions.append({
            "title": "Patch Critical Vulnerabilities",
            "description": f"Apply patches for {critical_vulns} critical vulnerabilities",
            "priority": "high",
            "action_type": "vulnerability_management"
        })
    
    # Compliance actions
    compliance_gaps = len(scan_result.get("compliance_check", {}).get("compliance_gaps", []))
    if compliance_gaps > 0:
        actions.append({
            "title": "Address Compliance Gaps",
            "description": f"Resolve {compliance_gaps} compliance issues",
            "priority": "medium",
            "action_type": "compliance"
        })
    
    # Default action if no issues
    if not actions:
        actions.append({
            "title": "Security Status Good",
            "description": "No immediate security actions required",
            "priority": "low",
            "action_type": "monitoring"
        })
    
    return actions


def _count_compliant_frameworks(compliance_data: Dict[str, Any]) -> int:
    """Count number of compliant frameworks"""
    compliant_count = 0
    frameworks = ["gdpr_compliance", "sox_compliance", "iso27001_compliance", "hipaa_compliance"]
    
    for framework in frameworks:
        if framework in compliance_data:
            framework_data = compliance_data[framework]
            if isinstance(framework_data, dict) and framework_data.get("compliant", False):
                compliant_count += 1
    
    return compliant_count