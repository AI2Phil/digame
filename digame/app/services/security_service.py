"""
Advanced Security Controls service for enterprise features
"""

from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc, func
import uuid
import hashlib
import re
import ipaddress
import asyncio
from concurrent.futures import ThreadPoolExecutor

from ..models.security import (
    SecurityPolicy, SecurityViolation, SecurityScan, SecurityFinding,
    SecurityAuditLog, SecurityConfiguration
)
from ..models.user import User
from ..models.tenant import Tenant


class SecurityService:
    """Service for managing advanced security controls"""

    def __init__(self, db: Session):
        self.db = db
        self.executor = ThreadPoolExecutor(max_workers=2)

    # Security Policy Management
    def create_security_policy(
        self,
        tenant_id: int,
        name: str,
        category: str,
        policy_type: str,
        policy_rules: Dict[str, Any],
        created_by_user_id: int,
        **kwargs
    ) -> SecurityPolicy:
        """Create a new security policy"""
        
        policy = SecurityPolicy(
            tenant_id=tenant_id,
            name=name,
            description=kwargs.get("description"),
            category=category,
            severity=kwargs.get("severity", "medium"),
            policy_type=policy_type,
            policy_rules=policy_rules,
            enforcement_mode=kwargs.get("enforcement_mode", "enforce"),
            applies_to=kwargs.get("applies_to", {}),
            exceptions=kwargs.get("exceptions", []),
            priority=kwargs.get("priority", 100),
            created_by_user_id=created_by_user_id
        )
        
        self.db.add(policy)
        self.db.commit()
        self.db.refresh(policy)
        
        # Log policy creation
        self._log_security_event(
            tenant_id,
            "policy_created",
            "security",
            f"Security policy '{name}' created",
            policy_id=policy.id,
            user_id=created_by_user_id,
            details={"policy_type": policy_type, "category": category}
        )
        
        return policy

    def get_tenant_policies(
        self,
        tenant_id: int,
        category: Optional[str] = None,
        policy_type: Optional[str] = None,
        active_only: bool = True
    ) -> List[SecurityPolicy]:
        """Get security policies for a tenant"""
        
        query = self.db.query(SecurityPolicy).filter(
            SecurityPolicy.tenant_id == tenant_id
        )
        
        if active_only:
            query = query.filter(SecurityPolicy.is_active == True)
        
        if category:
            query = query.filter(SecurityPolicy.category == category)
        
        if policy_type:
            query = query.filter(SecurityPolicy.policy_type == policy_type)
        
        return query.order_by(desc(SecurityPolicy.priority)).all()

    def evaluate_policy_compliance(
        self,
        tenant_id: int,
        user_id: int,
        action: str,
        resource_type: str,
        resource_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Evaluate if an action complies with security policies"""
        
        # Get applicable policies
        policies = self.get_tenant_policies(tenant_id)
        user = self.db.query(User).filter(User.id == user_id).first()
        user_roles = user.roles if user else []
        
        violations = []
        warnings = []
        allowed = True
        
        for policy in policies:
            if not policy.is_applicable_to_user(user_id, user_roles):
                continue
            
            # Evaluate policy rules
            compliance_result = self._evaluate_policy_rules(
                policy, action, resource_type, resource_id, context
            )
            
            if not compliance_result["compliant"]:
                violation_data = {
                    "policy_id": policy.id,
                    "policy_name": policy.name,
                    "violation_type": compliance_result["violation_type"],
                    "severity": policy.severity,
                    "description": compliance_result["description"],
                    "enforcement_mode": policy.enforcement_mode
                }
                
                if policy.enforcement_mode == "enforce":
                    violations.append(violation_data)
                    allowed = False
                elif policy.enforcement_mode == "warn":
                    warnings.append(violation_data)
                
                # Log violation
                if policy.enforcement_mode in ["enforce", "warn"]:
                    self._create_security_violation(
                        tenant_id, policy.id, user_id, action,
                        resource_type, resource_id, compliance_result, context
                    )
        
        return {
            "allowed": allowed,
            "violations": violations,
            "warnings": warnings,
            "policies_evaluated": len(policies)
        }

    def _evaluate_policy_rules(
        self,
        policy: SecurityPolicy,
        action: str,
        resource_type: str,
        resource_id: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Evaluate specific policy rules"""
        
        rules = policy.policy_rules
        policy_type = policy.policy_type
        
        # Password policy evaluation
        if policy_type == "password_policy":
            return self._evaluate_password_policy(rules, context.get("password", ""))
        
        # Access control policy
        elif policy_type == "access_control":
            return self._evaluate_access_control_policy(rules, action, resource_type, context)
        
        # Session policy
        elif policy_type == "session_policy":
            return self._evaluate_session_policy(rules, context)
        
        # Data protection policy
        elif policy_type == "data_protection":
            return self._evaluate_data_protection_policy(rules, action, resource_type, context)
        
        # Network security policy
        elif policy_type == "network_security":
            return self._evaluate_network_security_policy(rules, context)
        
        # Default: compliant
        return {"compliant": True, "description": "Policy evaluation passed"}

    def _evaluate_password_policy(self, rules: Dict[str, Any], password: str) -> Dict[str, Any]:
        """Evaluate password against policy rules"""
        
        if not password:
            return {"compliant": True, "description": "No password to evaluate"}
        
        min_length = rules.get("min_length", 8)
        require_uppercase = rules.get("require_uppercase", True)
        require_lowercase = rules.get("require_lowercase", True)
        require_numbers = rules.get("require_numbers", True)
        require_symbols = rules.get("require_symbols", True)
        
        violations = []
        
        if len(password) < min_length:
            violations.append(f"Password must be at least {min_length} characters")
        
        if require_uppercase and not re.search(r'[A-Z]', password):
            violations.append("Password must contain uppercase letters")
        
        if require_lowercase and not re.search(r'[a-z]', password):
            violations.append("Password must contain lowercase letters")
        
        if require_numbers and not re.search(r'\d', password):
            violations.append("Password must contain numbers")
        
        if require_symbols and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            violations.append("Password must contain special characters")
        
        if violations:
            return {
                "compliant": False,
                "violation_type": "password_policy_violation",
                "description": "; ".join(violations)
            }
        
        return {"compliant": True, "description": "Password meets policy requirements"}

    def _evaluate_access_control_policy(
        self, rules: Dict[str, Any], action: str, resource_type: str, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Evaluate access control policy"""
        
        allowed_actions = rules.get("allowed_actions", [])
        restricted_resources = rules.get("restricted_resources", [])
        time_restrictions = rules.get("time_restrictions", {})
        
        # Check action restrictions
        if allowed_actions and action not in allowed_actions:
            return {
                "compliant": False,
                "violation_type": "unauthorized_action",
                "description": f"Action '{action}' is not permitted by policy"
            }
        
        # Check resource restrictions
        if resource_type in restricted_resources:
            return {
                "compliant": False,
                "violation_type": "restricted_resource_access",
                "description": f"Access to '{resource_type}' is restricted by policy"
            }
        
        # Check time restrictions
        if time_restrictions:
            current_hour = datetime.utcnow().hour
            allowed_hours = time_restrictions.get("allowed_hours", [])
            if allowed_hours and current_hour not in allowed_hours:
                return {
                    "compliant": False,
                    "violation_type": "time_restriction_violation",
                    "description": f"Access not permitted at current time ({current_hour}:00)"
                }
        
        return {"compliant": True, "description": "Access control policy satisfied"}

    def _evaluate_session_policy(self, rules: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate session security policy"""
        
        max_session_duration = rules.get("max_session_duration_hours", 24)
        max_idle_time = rules.get("max_idle_time_minutes", 480)
        require_fresh_auth = rules.get("require_fresh_auth_minutes", 60)
        
        session_start = context.get("session_start")
        last_activity = context.get("last_activity")
        last_auth = context.get("last_authentication")
        
        if session_start:
            session_duration = (datetime.utcnow() - session_start).total_seconds() / 3600
            if session_duration > max_session_duration:
                return {
                    "compliant": False,
                    "violation_type": "session_timeout",
                    "description": f"Session exceeded maximum duration of {max_session_duration} hours"
                }
        
        if last_activity:
            idle_time = (datetime.utcnow() - last_activity).total_seconds() / 60
            if idle_time > max_idle_time:
                return {
                    "compliant": False,
                    "violation_type": "session_idle_timeout",
                    "description": f"Session idle for {idle_time:.0f} minutes, exceeds limit of {max_idle_time}"
                }
        
        return {"compliant": True, "description": "Session policy satisfied"}

    def _evaluate_data_protection_policy(
        self, rules: Dict[str, Any], action: str, resource_type: str, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Evaluate data protection policy"""
        
        require_encryption = rules.get("require_encryption", True)
        sensitive_data_types = rules.get("sensitive_data_types", [])
        data_classification = context.get("data_classification", "public")
        
        if require_encryption and action in ["download", "export", "backup"]:
            if not context.get("encrypted", False):
                return {
                    "compliant": False,
                    "violation_type": "unencrypted_data_access",
                    "description": f"Action '{action}' requires encrypted data transmission"
                }
        
        if data_classification in sensitive_data_types:
            if not context.get("authorized_for_sensitive", False):
                return {
                    "compliant": False,
                    "violation_type": "unauthorized_sensitive_data_access",
                    "description": f"Access to {data_classification} data requires special authorization"
                }
        
        return {"compliant": True, "description": "Data protection policy satisfied"}

    def _evaluate_network_security_policy(self, rules: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluate network security policy"""
        
        allowed_ip_ranges = rules.get("allowed_ip_ranges", [])
        blocked_ip_ranges = rules.get("blocked_ip_ranges", [])
        require_vpn = rules.get("require_vpn", False)
        
        client_ip = context.get("client_ip")
        if not client_ip:
            return {"compliant": True, "description": "No IP address to evaluate"}
        
        try:
            ip = ipaddress.ip_address(client_ip)
            
            # Check blocked ranges first
            for blocked_range in blocked_ip_ranges:
                if ip in ipaddress.ip_network(blocked_range):
                    return {
                        "compliant": False,
                        "violation_type": "blocked_ip_access",
                        "description": f"Access from IP {client_ip} is blocked by policy"
                    }
            
            # Check allowed ranges
            if allowed_ip_ranges:
                allowed = False
                for allowed_range in allowed_ip_ranges:
                    if ip in ipaddress.ip_network(allowed_range):
                        allowed = True
                        break
                
                if not allowed:
                    return {
                        "compliant": False,
                        "violation_type": "unauthorized_ip_access",
                        "description": f"Access from IP {client_ip} is not in allowed ranges"
                    }
            
            # Check VPN requirement
            if require_vpn and not context.get("via_vpn", False):
                return {
                    "compliant": False,
                    "violation_type": "vpn_required",
                    "description": "VPN connection required by policy"
                }
            
        except ValueError:
            return {
                "compliant": False,
                "violation_type": "invalid_ip_address",
                "description": f"Invalid IP address: {client_ip}"
            }
        
        return {"compliant": True, "description": "Network security policy satisfied"}

    def _create_security_violation(
        self,
        tenant_id: int,
        policy_id: int,
        user_id: int,
        action: str,
        resource_type: str,
        resource_id: str,
        compliance_result: Dict[str, Any],
        context: Dict[str, Any]
    ):
        """Create a security violation record"""
        
        violation = SecurityViolation(
            tenant_id=tenant_id,
            policy_id=policy_id,
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            action_attempted=action,
            violation_type=compliance_result["violation_type"],
            severity="high",  # Default severity
            description=compliance_result["description"],
            details=context,
            detected_by="policy_engine",
            detection_method="rule_engine",
            response_action="log",
            ip_address=context.get("client_ip"),
            user_agent=context.get("user_agent"),
            session_id=context.get("session_id")
        )
        
        self.db.add(violation)
        self.db.commit()
        
        # Update policy violation count
        policy = self.db.query(SecurityPolicy).filter(SecurityPolicy.id == policy_id).first()
        if policy:
            policy.violations_count += 1
            policy.last_violation_at = datetime.utcnow()
            self.db.commit()

    # Security Scanning
    async def create_security_scan(
        self,
        tenant_id: int,
        name: str,
        scan_type: str,
        target_scope: Dict[str, Any],
        scan_config: Dict[str, Any],
        created_by_user_id: int
    ) -> SecurityScan:
        """Create and optionally start a security scan"""
        
        scan = SecurityScan(
            tenant_id=tenant_id,
            name=name,
            scan_type=scan_type,
            target_scope=target_scope,
            scan_config=scan_config,
            created_by_user_id=created_by_user_id
        )
        
        self.db.add(scan)
        self.db.commit()
        self.db.refresh(scan)
        
        # Log scan creation
        self._log_security_event(
            tenant_id,
            "security_scan_created",
            "security",
            f"Security scan '{name}' created",
            user_id=created_by_user_id,
            details={"scan_type": scan_type, "scan_id": scan.id}
        )
        
        return scan

    async def execute_security_scan(self, scan_id: int) -> SecurityScan:
        """Execute a security scan"""
        
        scan = self.db.query(SecurityScan).filter(SecurityScan.id == scan_id).first()
        if not scan:
            raise ValueError("Scan not found")
        
        scan.status = "running"
        scan.started_at = datetime.utcnow()
        self.db.commit()
        
        try:
            # Execute scan based on type
            if scan.scan_type == "vulnerability":
                findings = await self._execute_vulnerability_scan(scan)
            elif scan.scan_type == "compliance":
                findings = await self._execute_compliance_scan(scan)
            elif scan.scan_type == "configuration":
                findings = await self._execute_configuration_scan(scan)
            else:
                findings = []
            
            # Update scan results
            scan.status = "completed"
            scan.completed_at = datetime.utcnow()
            scan.duration_seconds = int((scan.completed_at - scan.started_at).total_seconds())
            scan.total_checks = len(findings)
            
            # Categorize findings
            critical_count = sum(1 for f in findings if f.get("severity") == "critical")
            high_count = sum(1 for f in findings if f.get("severity") == "high")
            medium_count = sum(1 for f in findings if f.get("severity") == "medium")
            low_count = sum(1 for f in findings if f.get("severity") == "low")
            
            scan.critical_issues = critical_count
            scan.high_issues = high_count
            scan.medium_issues = medium_count
            scan.low_issues = low_count
            scan.failed_checks = critical_count + high_count + medium_count + low_count
            scan.passed_checks = scan.total_checks - scan.failed_checks
            
            # Calculate scores
            scan.security_score = max(0, 100 - (critical_count * 25 + high_count * 10 + medium_count * 5 + low_count * 1))
            scan.compliance_score = (scan.passed_checks / scan.total_checks * 100) if scan.total_checks > 0 else 100
            
            self.db.commit()
            
            # Create finding records
            for finding_data in findings:
                finding = SecurityFinding(
                    scan_id=scan.id,
                    tenant_id=scan.tenant_id,
                    finding_type=finding_data.get("finding_type", "vulnerability"),
                    category=finding_data.get("category", "security"),
                    severity=finding_data.get("severity", "medium"),
                    title=finding_data.get("title", "Security Finding"),
                    description=finding_data.get("description", ""),
                    technical_details=finding_data.get("technical_details"),
                    affected_resource=finding_data.get("affected_resource"),
                    risk_score=finding_data.get("risk_score"),
                    remediation_steps=finding_data.get("remediation_steps"),
                    remediation_effort=finding_data.get("remediation_effort", "medium")
                )
                self.db.add(finding)
            
            self.db.commit()
            
        except Exception as e:
            scan.status = "failed"
            scan.completed_at = datetime.utcnow()
            scan.results_summary = {"error": str(e)}
            self.db.commit()
            raise
        
        return scan

    async def _execute_vulnerability_scan(self, scan: SecurityScan) -> List[Dict[str, Any]]:
        """Execute vulnerability scan (mock implementation)"""
        
        # Simulate scan execution
        await asyncio.sleep(2)
        
        # Mock vulnerability findings
        findings = [
            {
                "finding_type": "vulnerability",
                "category": "authentication",
                "severity": "high",
                "title": "Weak Password Policy",
                "description": "Password policy allows weak passwords that can be easily compromised",
                "technical_details": "Minimum password length is only 6 characters",
                "affected_resource": "user_authentication_system",
                "risk_score": 7.5,
                "remediation_steps": "Increase minimum password length to 12 characters and require complexity",
                "remediation_effort": "low"
            },
            {
                "finding_type": "vulnerability",
                "category": "encryption",
                "severity": "medium",
                "title": "Unencrypted Data Transmission",
                "description": "Some API endpoints transmit sensitive data without encryption",
                "technical_details": "HTTP endpoints found that should use HTTPS",
                "affected_resource": "api_endpoints",
                "risk_score": 5.0,
                "remediation_steps": "Enforce HTTPS for all API endpoints handling sensitive data",
                "remediation_effort": "medium"
            },
            {
                "finding_type": "vulnerability",
                "category": "access_control",
                "severity": "critical",
                "title": "Privilege Escalation Vulnerability",
                "description": "Users can escalate privileges through API manipulation",
                "technical_details": "Role validation bypass in user management API",
                "affected_resource": "user_management_api",
                "risk_score": 9.0,
                "remediation_steps": "Implement proper role validation and authorization checks",
                "remediation_effort": "high"
            }
        ]
        
        return findings

    async def _execute_compliance_scan(self, scan: SecurityScan) -> List[Dict[str, Any]]:
        """Execute compliance scan (mock implementation)"""
        
        await asyncio.sleep(1.5)
        
        # Mock compliance findings
        findings = [
            {
                "finding_type": "compliance",
                "category": "data_protection",
                "severity": "medium",
                "title": "GDPR Data Retention Policy",
                "description": "Data retention period exceeds GDPR requirements",
                "technical_details": "User data retained for 10 years, GDPR requires deletion after 7 years",
                "affected_resource": "user_data_storage",
                "risk_score": 4.0,
                "remediation_steps": "Update data retention policy to comply with GDPR requirements",
                "remediation_effort": "medium"
            },
            {
                "finding_type": "compliance",
                "category": "audit_logging",
                "severity": "low",
                "title": "Incomplete Audit Logging",
                "description": "Some security events are not being logged for compliance",
                "technical_details": "Password change events not logged",
                "affected_resource": "audit_logging_system",
                "risk_score": 2.0,
                "remediation_steps": "Enable logging for all security-relevant events",
                "remediation_effort": "low"
            }
        ]
        
        return findings

    async def _execute_configuration_scan(self, scan: SecurityScan) -> List[Dict[str, Any]]:
        """Execute configuration scan (mock implementation)"""
        
        await asyncio.sleep(1)
        
        # Mock configuration findings
        findings = [
            {
                "finding_type": "misconfiguration",
                "category": "network_security",
                "severity": "high",
                "title": "Open Network Ports",
                "description": "Unnecessary network ports are open and accessible",
                "technical_details": "Ports 22, 3306, 5432 are accessible from internet",
                "affected_resource": "network_configuration",
                "risk_score": 6.5,
                "remediation_steps": "Close unnecessary ports and restrict access to required services",
                "remediation_effort": "medium"
            }
        ]
        
        return findings

    # Security Configuration
    def get_security_configuration(self, tenant_id: int) -> Optional[SecurityConfiguration]:
        """Get security configuration for tenant"""
        
        return self.db.query(SecurityConfiguration).filter(
            SecurityConfiguration.tenant_id == tenant_id
        ).first()

    def update_security_configuration(
        self,
        tenant_id: int,
        updates: Dict[str, Any],
        user_id: int
    ) -> SecurityConfiguration:
        """Update security configuration"""
        
        config = self.get_security_configuration(tenant_id)
        if not config:
            config = SecurityConfiguration(
                tenant_id=tenant_id,
                created_by_user_id=user_id
            )
            self.db.add(config)
        
        # Apply updates
        for key, value in updates.items():
            if hasattr(config, key):
                setattr(config, key, value)
        
        config.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(config)
        
        # Log configuration change
        self._log_security_event(
            tenant_id,
            "security_configuration_updated",
            "security",
            "Security configuration updated",
            user_id=user_id,
            details={"updated_fields": list(updates.keys())}
        )
        
        return config

    # Analytics and Reporting
    def get_security_dashboard_data(self, tenant_id: int) -> Dict[str, Any]:
        """Get security dashboard analytics"""
        
        # Get recent violations
        recent_violations = self.db.query(SecurityViolation).filter(
            and_(
                SecurityViolation.tenant_id == tenant_id,
                SecurityViolation.occurred_at >= datetime.utcnow() - timedelta(days=30)
            )
        ).count()
        
        # Get policy compliance
        total_policies = self.db.query(SecurityPolicy).filter(
            and_(SecurityPolicy.tenant_id == tenant_id, SecurityPolicy.is_active == True)
        ).count()
        
        # Get recent scans
        recent_scans = self.db.query(SecurityScan).filter(
            and_(
                SecurityScan.tenant_id == tenant_id,
                SecurityScan.created_at >= datetime.utcnow() - timedelta(days=30)
            )
        ).count()
        
        # Get critical findings
        critical_findings = self.db.query(SecurityFinding).join(SecurityScan).filter(
            and_(
                SecurityScan.tenant_id == tenant_id,
                SecurityFinding.severity == "critical",
                SecurityFinding.status == "open"
            )
        ).count()
        
        return {
            "violations_last_30_days": recent_violations,
            "active_policies": total_policies,
            "scans_last_30_days": recent_scans,
            "critical_findings_open": critical_findings,
            "security_score": 85.5,  # Mock score
            "compliance_score": 92.3,  # Mock score
            "risk_level": "medium",
            "trends": {
                "violations_trend": "decreasing",
                "security_score_trend": "improving",
                "compliance_trend": "stable"
            }
        }

    def get_violation_analytics(
        self,
        tenant_id: int,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get violation analytics"""
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        violations = self.db.query(SecurityViolation).filter(
            and_(
                SecurityViolation.tenant_id == tenant_id,
                SecurityViolation.occurred_at >= start_date
            )
        ).all()
        
        # Analyze violations
        by_severity = {}
        by_type = {}
        by_day = {}
        
        for violation in violations:
            # By severity
            severity = violation.severity
            by_severity[severity] = by_severity.get(severity, 0) + 1
            
            # By type
            v_type = violation.violation_type
            by_type[v_type] = by_type.get(v_type, 0) + 1
            
            # By day
            day = violation.occurred_at.date().isoformat()
            by_day[day] = by_day.get(day, 0) + 1
        
        return {
            "total_violations": len(violations),
            "by_severity": by_severity,
            "by_type": by_type,
            "by_day": by_day,
            "period_days": days
        }

    # Utility Methods
    def _log_security_event(
        self,
        tenant_id: int,
        event_type: str,
        event_category: str,
        description: str,
        policy_id: Optional[int] = None,
        user_id: Optional[int] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        """Log security audit event"""
        
        audit_log = SecurityAuditLog(
            tenant_id=tenant_id,
            policy_id=policy_id,
            user_id=user_id,
            event_type=event_type,
            event_category=event_category,
            action=event_type,
            description=description,
            details=details or {}
        )
        
        self.db.add(audit_log)
        self.db.commit()

    def validate_password_strength(self, password: str, policy_rules: Dict[str, Any]) -> Dict[str, Any]:
        """Validate password against policy rules"""
        
        result = self._evaluate_password_policy(policy_rules, password)
        
        # Calculate strength score
        score = 0
        if len(password) >= 8:
            score += 20
        if len(password) >= 12:
            score += 10
        if re.search(r'[A-Z]', password):
            score += 20
        if re.search(r'[a-z]', password):
            score += 20
        if re.search(r'\d', password):
            score += 15
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            score += 15
        
        strength_level = "weak"
        if score >= 80:
            strength_level = "strong"
        elif score >= 60:
            strength_level = "medium"
        
        return {
            "compliant": result["compliant"],
            "strength_score": score,
            "strength_level": strength_level,
            "violations": result.get("description", "").split("; ") if not result["compliant"] else []
        }


def get_security_service(db: Session) -> SecurityService:
    """Get security service instance"""
    return SecurityService(db)