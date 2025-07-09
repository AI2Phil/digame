"""
Security & Compliance Database Seeding Script
Creates comprehensive seed data for security models with realistic threat patterns
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.security_models import (
    AuditEvent, SecurityEvent, ComplianceCheck, Vulnerability,
    RiskAssessment, SecurityIncident, SecurityMetric
)
import json
import random
import uuid
from typing import List, Dict, Any

def seed_security_data():
    """Seed comprehensive security and compliance data"""
    db = next(get_db())
    
    try:
        # Clear existing data
        db.query(SecurityMetric).delete()
        db.query(SecurityIncident).delete()
        db.query(RiskAssessment).delete()
        db.query(Vulnerability).delete()
        db.query(ComplianceCheck).delete()
        db.query(SecurityEvent).delete()
        db.query(AuditEvent).delete()
        
        print("🔒 Seeding Security & Compliance Data...")
        
        # Seed Audit Events (10,000+ events over 90 days)
        print("   📋 Creating audit events...")
        audit_events = []
        base_time = datetime.utcnow()
        
        event_types = [
            'user_login', 'user_logout', 'password_change', 'profile_update',
            'data_access', 'data_export', 'data_delete', 'file_upload',
            'report_generate', 'report_export', 'system_config', 'user_create',
            'user_delete', 'role_change', 'permission_grant', 'api_access',
            'database_query', 'backup_create', 'backup_restore', 'system_restart'
        ]
        
        event_categories = [
            'authentication', 'data_access', 'system', 'admin', 'user_management',
            'configuration', 'backup', 'api', 'reporting', 'security'
        ]
        
        severities = ['info', 'warning', 'error', 'critical']
        outcomes = ['success', 'failure', 'partial']
        
        for i in range(12000):  # 12,000 audit events
            event_time = base_time - timedelta(
                days=random.randint(0, 90),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            event_type = random.choice(event_types)
            category = random.choice(event_categories)
            severity = random.choices(severities, weights=[70, 20, 8, 2])[0]
            outcome = random.choices(outcomes, weights=[85, 12, 3])[0]
            
            # Generate realistic IP addresses
            ip_addresses = [
                '192.168.1.100', '192.168.1.101', '10.0.0.50', '172.16.0.25',
                '203.0.113.45', '198.51.100.78', '192.0.2.123', '203.0.113.89'
            ]
            
            user_agents = [
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
                'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
                'PostmanRuntime/7.28.4', 'curl/7.68.0', 'Python-requests/2.25.1'
            ]
            
            details = {
                'session_duration': random.randint(300, 7200) if 'login' in event_type else None,
                'resource_accessed': f"/api/{random.choice(['users', 'reports', 'teams', 'data'])}/{random.randint(1, 1000)}",
                'data_size': random.randint(1024, 1048576) if 'data' in event_type else None,
                'execution_time_ms': random.randint(50, 5000),
                'browser': random.choice(['Chrome', 'Firefox', 'Safari', 'Edge']) if 'Mozilla' in random.choice(user_agents) else None
            }
            
            audit_event = AuditEvent(
                user_id=random.randint(1, 50) if random.random() > 0.1 else None,
                event_type=event_type,
                event_category=category,
                event_severity=severity,
                resource_type=random.choice(['user', 'team', 'report', 'model', 'data', 'system']),
                resource_id=str(random.randint(1, 1000)),
                resource_name=f"Resource {random.randint(1, 1000)}",
                action_performed=f"{event_type.replace('_', ' ').title()} performed",
                details_json=details,
                outcome=outcome,
                ip_address=random.choice(ip_addresses),
                user_agent=random.choice(user_agents),
                session_id=str(uuid.uuid4()),
                request_id=str(uuid.uuid4()),
                timestamp=event_time,
                retention_until=event_time + timedelta(days=2555)  # 7 years retention
            )
            audit_events.append(audit_event)
        
        db.add_all(audit_events)
        db.flush()
        
        # Seed Security Events (500+ security events)
        print("   🛡️ Creating security events...")
        security_events = []
        
        threat_types = [
            'failed_login', 'brute_force_attack', 'suspicious_activity', 'malware_detected',
            'phishing_attempt', 'data_exfiltration', 'privilege_escalation', 'sql_injection',
            'xss_attempt', 'ddos_attack', 'insider_threat', 'unauthorized_access',
            'suspicious_file_upload', 'anomalous_behavior', 'credential_stuffing'
        ]
        
        threat_categories = [
            'authentication', 'malware', 'data_breach', 'web_attack', 'network_attack',
            'insider_threat', 'phishing', 'ddos', 'privilege_abuse'
        ]
        
        severities = ['low', 'medium', 'high', 'critical']
        response_actions = ['blocked', 'quarantined', 'monitored', 'escalated', 'investigated']
        
        # Generate realistic threat IP addresses (including known bad actors)
        threat_ips = [
            '185.220.101.45', '198.98.51.189', '45.148.10.85', '89.248.165.2',
            '194.147.78.123', '103.85.24.156', '176.123.26.89', '91.240.118.172',
            '192.168.1.200', '10.0.0.99'  # Some internal IPs for insider threats
        ]
        
        countries = ['CN', 'RU', 'US', 'DE', 'FR', 'GB', 'JP', 'KR', 'IN', 'BR']
        
        for i in range(650):  # 650 security events
            event_time = base_time - timedelta(
                days=random.randint(0, 90),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            event_type = random.choice(threat_types)
            category = random.choice(threat_categories)
            severity = random.choices(severities, weights=[30, 40, 25, 5])[0]
            risk_score = {
                'low': random.uniform(0.0, 3.0),
                'medium': random.uniform(3.0, 6.0),
                'high': random.uniform(6.0, 8.5),
                'critical': random.uniform(8.5, 10.0)
            }[severity]
            
            attack_vectors = ['network', 'web', 'email', 'physical', 'social_engineering']
            detection_methods = ['rule_based', 'ml_model', 'anomaly_detection', 'signature_based', 'behavioral_analysis']
            
            details = {
                'attack_pattern': f"Pattern detected: {event_type}",
                'request_count': random.randint(1, 1000) if 'attack' in event_type else None,
                'payload_size': random.randint(100, 10000),
                'blocked_requests': random.randint(0, 500),
                'geolocation': {
                    'country': random.choice(countries),
                    'city': random.choice(['Beijing', 'Moscow', 'New York', 'London', 'Tokyo']),
                    'latitude': random.uniform(-90, 90),
                    'longitude': random.uniform(-180, 180)
                }
            }
            
            security_event = SecurityEvent(
                event_type=event_type,
                threat_category=category,
                severity=severity,
                risk_score=risk_score,
                source_ip=random.choice(threat_ips),
                source_country=random.choice(countries),
                source_asn=f"AS{random.randint(1000, 99999)}",
                user_agent=random.choice([
                    'curl/7.68.0', 'python-requests/2.25.1', 'Nmap NSE',
                    'sqlmap/1.5.2', 'Nikto/2.1.6', 'Mozilla/5.0 (compatible; Baiduspider/2.0)'
                ]),
                attack_vector=random.choice(attack_vectors),
                attack_signature=f"SIG_{event_type.upper()}_{random.randint(1000, 9999)}",
                payload_hash=f"sha256:{uuid.uuid4().hex}",
                detection_method=random.choice(detection_methods),
                detection_confidence=random.uniform(0.7, 0.99),
                false_positive_probability=random.uniform(0.01, 0.15),
                response_action=random.choice(response_actions),
                response_status=random.choices(['pending', 'in_progress', 'resolved', 'false_positive'], weights=[20, 30, 45, 5])[0],
                assigned_to=random.randint(1, 10) if random.random() > 0.3 else None,
                description=f"Security event detected: {event_type.replace('_', ' ').title()}",
                details_json=details,
                affected_systems=[f"system_{random.randint(1, 20)}" for _ in range(random.randint(1, 3))],
                timestamp=event_time,
                first_seen=event_time - timedelta(minutes=random.randint(0, 60)),
                last_seen=event_time + timedelta(minutes=random.randint(0, 30))
            )
            security_events.append(security_event)
        
        db.add_all(security_events)
        db.flush()
        
        # Seed Compliance Checks (200+ compliance checks)
        print("   ✅ Creating compliance checks...")
        compliance_checks = []
        
        frameworks = ['GDPR', 'HIPAA', 'SOX', 'PCI_DSS', 'ISO27001', 'NIST', 'SOC2']
        check_types = [
            'data_encryption', 'access_control', 'audit_logging', 'backup_procedures',
            'incident_response', 'vulnerability_management', 'user_training', 'network_security',
            'data_retention', 'privacy_controls', 'change_management', 'risk_assessment'
        ]
        
        categories = [
            'data_protection', 'access_control', 'encryption', 'monitoring',
            'incident_management', 'training', 'documentation', 'technical_controls'
        ]
        
        statuses = ['compliant', 'non_compliant', 'partial', 'not_applicable']
        
        for i in range(250):  # 250 compliance checks
            check_time = base_time - timedelta(
                days=random.randint(0, 90),
                hours=random.randint(0, 23)
            )
            
            framework = random.choice(frameworks)
            check_type = random.choice(check_types)
            category = random.choice(categories)
            status = random.choices(statuses, weights=[60, 25, 10, 5])[0]
            
            score = {
                'compliant': random.uniform(80.0, 100.0),
                'non_compliant': random.uniform(0.0, 50.0),
                'partial': random.uniform(50.0, 79.0),
                'not_applicable': 0.0
            }[status]
            
            findings = []
            recommendations = []
            
            if status == 'non_compliant':
                findings = [
                    f"Missing {check_type.replace('_', ' ')} implementation",
                    f"Inadequate {category.replace('_', ' ')} measures",
                    "Documentation gaps identified"
                ]
                recommendations = [
                    f"Implement proper {check_type.replace('_', ' ')} controls",
                    "Update documentation and procedures",
                    "Conduct staff training on compliance requirements"
                ]
            elif status == 'partial':
                findings = [f"Partial implementation of {check_type.replace('_', ' ')} controls"]
                recommendations = [f"Complete implementation of {check_type.replace('_', ' ')} requirements"]
            
            details = {
                'assessment_scope': f"{framework} {check_type}",
                'evidence_reviewed': random.randint(5, 50),
                'controls_tested': random.randint(3, 15),
                'exceptions_found': len(findings),
                'remediation_effort': random.choice(['low', 'medium', 'high'])
            }
            
            compliance_check = ComplianceCheck(
                check_type=check_type,
                check_category=category,
                check_name=f"{framework} - {check_type.replace('_', ' ').title()}",
                check_description=f"Compliance assessment for {check_type.replace('_', ' ')} under {framework} framework",
                framework=framework,
                control_id=f"{framework}-{random.randint(100, 999)}",
                requirement_level=random.choices(['required', 'recommended', 'optional'], weights=[70, 25, 5])[0],
                status=status,
                score=score,
                max_score=100.0,
                pass_threshold=80.0,
                details_json=details,
                evidence_json={'documents': [f"doc_{i}.pdf" for i in range(random.randint(1, 5))]},
                findings=findings,
                recommendations=recommendations,
                assessed_by=random.randint(1, 10),
                assessment_method=random.choice(['automated', 'manual', 'hybrid']),
                assessment_tool=random.choice(['Nessus', 'Qualys', 'Manual Review', 'Custom Script']),
                checked_at=check_time,
                next_check_due=check_time + timedelta(days=random.randint(30, 365)),
                remediation_status=random.choices(['pending', 'in_progress', 'completed'], weights=[30, 40, 30])[0] if status != 'compliant' else 'completed'
            )
            compliance_checks.append(compliance_check)
        
        db.add_all(compliance_checks)
        db.flush()
        
        # Seed Vulnerabilities (150+ vulnerabilities)
        print("   🔍 Creating vulnerabilities...")
        vulnerabilities = []
        
        vulnerability_types = [
            'buffer_overflow', 'sql_injection', 'xss', 'csrf', 'path_traversal',
            'privilege_escalation', 'authentication_bypass', 'information_disclosure',
            'denial_of_service', 'remote_code_execution', 'weak_encryption', 'insecure_deserialization'
        ]
        
        severities = ['critical', 'high', 'medium', 'low']
        attack_vectors = ['network', 'adjacent', 'local', 'physical']
        
        for i in range(180):  # 180 vulnerabilities
            discovered_time = base_time - timedelta(
                days=random.randint(0, 365),
                hours=random.randint(0, 23)
            )
            
            vuln_type = random.choice(vulnerability_types)
            severity = random.choices(severities, weights=[10, 30, 45, 15])[0]
            
            cvss_score = {
                'critical': random.uniform(9.0, 10.0),
                'high': random.uniform(7.0, 8.9),
                'medium': random.uniform(4.0, 6.9),
                'low': random.uniform(0.1, 3.9)
            }[severity]
            
            cve_year = random.randint(2020, 2024)
            cve_number = random.randint(1000, 99999)
            
            affected_systems = [
                f"web_server_{random.randint(1, 10)}",
                f"database_{random.randint(1, 5)}",
                f"application_{random.randint(1, 20)}"
            ]
            
            vulnerability = Vulnerability(
                cve_id=f"CVE-{cve_year}-{cve_number}",
                vulnerability_name=f"{vuln_type.replace('_', ' ').title()} in System Component",
                description=f"A {vuln_type.replace('_', ' ')} vulnerability has been identified that could allow an attacker to compromise system security.",
                severity=severity,
                cvss_score=cvss_score,
                cvss_vector=f"CVSS:3.1/AV:{random.choice(['N', 'A', 'L', 'P'])}/AC:{random.choice(['L', 'H'])}/PR:{random.choice(['N', 'L', 'H'])}/UI:{random.choice(['N', 'R'])}/S:{random.choice(['U', 'C'])}/C:{random.choice(['N', 'L', 'H'])}/I:{random.choice(['N', 'L', 'H'])}/A:{random.choice(['N', 'L', 'H'])}",
                exploitability_score=random.uniform(1.0, 4.0),
                impact_score=random.uniform(1.0, 6.0),
                affected_systems=affected_systems[:random.randint(1, 3)],
                affected_versions=['v1.0', 'v1.1', 'v2.0'][:random.randint(1, 3)],
                platform_impact={'windows': True, 'linux': True, 'macos': False},
                vulnerability_type=vuln_type,
                attack_vector=random.choice(attack_vectors),
                attack_complexity=random.choice(['low', 'high']),
                privileges_required=random.choice(['none', 'low', 'high']),
                user_interaction=random.choice(['none', 'required']),
                discovered_at=discovered_time,
                disclosed_at=discovered_time + timedelta(days=random.randint(1, 90)),
                published_at=discovered_time + timedelta(days=random.randint(90, 180)),
                discovered_by=random.choice(['Security Researcher', 'Internal Team', 'Bug Bounty', 'Automated Scan']),
                status=random.choices(['open', 'in_progress', 'resolved', 'wont_fix'], weights=[25, 35, 35, 5])[0],
                remediation_status=random.choices(['pending', 'in_progress', 'completed'], weights=[30, 40, 30])[0],
                remediation_priority=severity,
                patch_available=random.choice([True, False]),
                patch_url=f"https://security.example.com/patches/CVE-{cve_year}-{cve_number}" if random.choice([True, False]) else None,
                workaround_available=random.choice([True, False]),
                workaround_description="Implement network-level filtering" if random.choice([True, False]) else None,
                assigned_to=random.randint(1, 10) if random.random() > 0.2 else None,
                remediation_deadline=discovered_time + timedelta(days=random.randint(30, 180)),
                references_json=[
                    f"https://nvd.nist.gov/vuln/detail/CVE-{cve_year}-{cve_number}",
                    f"https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-{cve_year}-{cve_number}"
                ],
                exploit_available=random.choice([True, False]),
                exploit_maturity=random.choice(['unproven', 'proof_of_concept', 'functional', 'weaponized'])
            )
            vulnerabilities.append(vulnerability)
        
        db.add_all(vulnerabilities)
        db.flush()
        
        # Seed Risk Assessments (75+ risk assessments)
        print("   ⚠️ Creating risk assessments...")
        risk_assessments = []
        
        asset_types = ['system', 'data', 'process', 'facility', 'personnel', 'reputation']
        risk_categories = ['cyber', 'operational', 'financial', 'regulatory', 'strategic', 'reputational']
        
        for i in range(85):  # 85 risk assessments
            assessed_time = base_time - timedelta(
                days=random.randint(0, 180),
                hours=random.randint(0, 23)
            )
            
            asset_type = random.choice(asset_types)
            risk_category = random.choice(risk_categories)
            
            likelihood = random.uniform(1.0, 10.0)
            impact = random.uniform(1.0, 10.0)
            risk_score = (likelihood * impact) / 10.0  # Normalize to 0-10 scale
            
            risk_level = 'low'
            if risk_score >= 7.5:
                risk_level = 'critical'
            elif risk_score >= 5.0:
                risk_level = 'high'
            elif risk_score >= 2.5:
                risk_level = 'medium'
            
            threats = [
                f"Threat {j+1}: {random.choice(['Cyber attack', 'Data breach', 'System failure', 'Human error', 'Natural disaster'])}"
                for j in range(random.randint(2, 5))
            ]
            
            mitigations = [
                f"Mitigation {j+1}: {random.choice(['Implement security controls', 'Staff training', 'Process improvement', 'Technology upgrade', 'Insurance coverage'])}"
                for j in range(random.randint(2, 4))
            ]
            
            risk_assessment = RiskAssessment(
                assessment_name=f"Risk Assessment - {asset_type.title()} {i+1}",
                assessment_type='security',
                asset_type=asset_type,
                asset_name=f"{asset_type.title()} Asset {i+1}",
                asset_description=f"Critical {asset_type} asset requiring risk assessment",
                risk_score=risk_score,
                likelihood_score=likelihood,
                impact_score=impact,
                risk_level=risk_level,
                risk_category=risk_category,
                risk_subcategory=f"{risk_category}_specific",
                business_impact=random.choice(['revenue', 'reputation', 'operations', 'compliance']),
                threats_json=threats,
                threat_actors=['External hackers', 'Insider threats', 'Nation states'][:random.randint(1, 3)],
                attack_scenarios=[f"Scenario {j+1}" for j in range(random.randint(1, 3))],
                vulnerabilities_json=[f"Vulnerability {j+1}" for j in range(random.randint(1, 4))],
                existing_controls=[f"Control {j+1}" for j in range(random.randint(2, 6))],
                control_effectiveness=random.uniform(0.3, 0.9),
                mitigations_json=mitigations,
                mitigation_cost=random.uniform(10000, 500000),
                mitigation_timeline=random.choice(['1-3 months', '3-6 months', '6-12 months', '1-2 years']),
                residual_risk_score=risk_score * random.uniform(0.2, 0.6),
                assessed_by=random.randint(1, 10),
                assessment_method=random.choice(['quantitative', 'qualitative', 'hybrid']),
                assessment_framework=random.choice(['NIST', 'ISO27005', 'FAIR', 'OCTAVE']),
                assessed_at=assessed_time,
                review_due_date=assessed_time + timedelta(days=random.randint(180, 365)),
                status='active',
                approval_status=random.choices(['pending', 'approved', 'rejected'], weights=[20, 75, 5])[0]
            )
            risk_assessments.append(risk_assessment)
        
        db.add_all(risk_assessments)
        db.flush()
        
        # Seed Security Incidents (35+ security incidents)
        print("   🚨 Creating security incidents...")
        security_incidents = []
        
        incident_types = [
            'data_breach', 'malware_infection', 'ddos_attack', 'insider_threat',
            'phishing_attack', 'ransomware', 'unauthorized_access', 'system_compromise',
            'data_loss', 'service_disruption', 'credential_theft', 'social_engineering'
        ]
        
        for i in range(45):  # 45 security incidents
            incident_time = base_time - timedelta(
                days=random.randint(0, 365),
                hours=random.randint(0, 23)
            )
            
            incident_type = random.choice(incident_types)
            severity = random.choices(['critical', 'high', 'medium', 'low'], weights=[15, 30, 40, 15])[0]
            priority = random.choices(['urgent', 'high', 'medium', 'low'], weights=[10, 25, 45, 20])[0]
            
            status_options = ['open', 'investigating', 'contained', 'resolved', 'closed']
            status = random.choices(status_options, weights=[10, 20, 25, 30, 15])[0]
            
            incident = SecurityIncident(
                incident_id=f"INC-{datetime.now().year}-{str(i+1).zfill(3)}",
                incident_title=f"{incident_type.replace('_', ' ').title()} - System {random.randint(1, 20)}",
                incident_description=f"Security incident involving {incident_type.replace('_', ' ')} detected on system infrastructure.",
                incident_type=incident_type,
                incident_category=random.choice(['security', 'privacy', 'availability', 'integrity']),
                severity=severity,
                priority=priority,
                impact_scope=random.choice(['internal', 'external', 'customer_facing', 'public']),
                affected_systems=[f"system_{random.randint(1, 50)}" for _ in range(random.randint(1, 5))],
                affected_users_count=random.randint(0, 10000) if incident_type in ['data_breach', 'service_disruption'] else 0,
                data_compromised=incident_type in ['data_breach', 'insider_threat', 'unauthorized_access'],
                data_types_affected=['PII', 'Financial', 'Health', 'Credentials'][:random.randint(0, 4)] if incident_type == 'data_breach' else [],
                estimated_cost=random.uniform(5000, 500000),
                business_impact=f"Impact on {random.choice(['operations', 'revenue', 'reputation', 'compliance'])}",
                detected_at=incident_time,
                reported_at=incident_time + timedelta(minutes=random.randint(5, 120)),
                acknowledged_at=incident_time + timedelta(hours=random.randint(1, 8)) if status != 'open' else None,
                contained_at=incident_time + timedelta(hours=random.randint(4, 48)) if status in ['contained', 'resolved', 'closed'] else None,
                resolved_at=incident_time + timedelta(days=random.randint(1, 30)) if status in ['resolved', 'closed'] else None,
                status=status,
                workflow_stage=random.choice(['detection', 'analysis', 'containment', 'eradication', 'recovery']),
                assigned_to=random.randint(1, 10),
                incident_commander=random.randint(1, 5),
                response_team=[random.randint(1, 20) for _ in range(random.randint(3, 8))],
                root_cause=f"Root cause analysis: {incident_type.replace('_', ' ')} due to system vulnerability" if status in ['resolved', 'closed'] else None,
                investigation_findings=[f"Finding {j+1}" for j in range(random.randint(1, 5))] if status != 'open' else [],
                containment_actions=[f"Action {j+1}: Containment measure" for j in range(random.randint(1, 3))] if status in ['contained', 'resolved', 'closed'] else [],
                eradication_actions=[f"Action {j+1}: Eradication step" for j in range(random.randint(1, 3))] if status in ['resolved', 'closed'] else [],
                recovery_actions=[f"Action {j+1}: Recovery procedure" for j in range(random.randint(1, 3))] if status in ['resolved', 'closed'] else [],
                stakeholders_notified=['Management', 'Legal', 'PR', 'Customers'][:random.randint(1, 4)],
                external_reporting_required=severity in ['critical', 'high'] and incident_type == 'data_breach',
                regulatory_notifications=['Data Protection Authority'] if incident_type == 'data_breach' else [],
                customer_notification_sent=incident_type == 'data_breach' and severity in ['critical', 'high'],
                lessons_learned=f"Lessons learned from {incident_type} incident" if status == 'closed' else None,
                recommendations=[f"Recommendation {j+1}" for j in range(random.randint(1, 4))] if status == 'closed' else [],
                follow_up_actions=[f"Follow-up {j+1}" for j in range(random.randint(1, 3))] if status == 'closed' else [],
                created_by=random.randint(1, 10),
                created_at=incident_time
            )
            security_incidents.append(incident)
        
        db.add_all(security_incidents)
        db.flush()
        
        # Seed Security Metrics (200+ metrics over time)
        print("   📊 Creating security metrics...")
        security_metrics = []
        
        metric_names = [
            'vulnerability_count', 'patch_compliance_rate', 'incident_response_time',
            'security_training_completion', 'failed_login_attempts', 'malware_detections',
            'phishing_attempts_blocked', 'data_loss_prevention_alerts', 'access_violations',
            'security_scan_coverage', 'encryption_compliance', 'backup_success_rate',
            'firewall_rule_violations', 'intrusion_detection_alerts', 'compliance_score'
        ]
        
        metric_categories = [
            'vulnerability', 'incident', 'compliance', 'awareness', 'monitoring', 'prevention'
        ]
        
        for i in range(300):  # 300 security metrics
            metric_time = base_time - timedelta(
                days=random.randint(0, 90),
                hours=random.randint(0, 23)
            )
            
            metric_name = random.choice(metric_names)
            category = random.choice(metric_categories)
            
            # Generate realistic metric values based on metric type
            if 'rate' in metric_name or 'compliance' in metric_name:
                metric_value = random.uniform(75.0, 99.5)  # Percentage
                target_value = random.uniform(85.0, 95.0)
            elif 'count' in metric_name or 'attempts' in metric_name:
                metric_value = random.randint(0, 100)  # Count
                target_value = random.randint(0, 50)
            elif 'time' in metric_name:
                metric_value = random.uniform(5.0, 120.0)  # Minutes
                target_value = random.uniform(15.0, 60.0)
            elif 'score' in metric_name:
                metric_value = random.uniform(60.0, 100.0)  # Score
                target_value = random.uniform(80.0, 95.0)
            else:
                metric_value = random.uniform(0.0, 100.0)
                target_value = random.uniform(50.0, 90.0)
            
            # Determine trend
            previous_value = metric_value + random.uniform(-10.0, 10.0)
            if metric_value > previous_value:
                trend = 'improving'
            elif metric_value < previous_value:
                trend = 'declining'
            else:
                trend = 'stable'
            
            variance = ((metric_value - previous_value) / previous_value * 100) if previous_value != 0 else 0
            
            security_metric = SecurityMetric(
                metric_name=metric_name,
                metric_category=category,
                metric_type=random.choice(['count', 'percentage', 'ratio', 'score', 'time']),
                metric_value=metric_value,
                target_value=target_value,
                threshold_warning=target_value * 0.8,
                threshold_critical=target_value * 0.6,
                calculation_method=f"Automated calculation for {metric_name}",
                data_source=random.choice(['SIEM', 'Vulnerability Scanner', 'Manual Assessment', 'Automated Tool']),
                calculation_period=random.choice(['daily', 'weekly', 'monthly']),
                business_unit=random.choice(['IT', 'Security', 'Operations', 'Compliance']),
                system_component=random.choice(['Network', 'Endpoints', 'Servers', 'Applications', 'Database']),
                measurement_date=metric_time,
                previous_value=previous_value,
                trend_direction=trend,
                variance_percentage=variance,
                collected_by=random.choice(['Security Team', 'Automated System', 'Compliance Officer']),
                collected_at=metric_time
            )
            security_metrics.append(security_metric)
        
        db.add_all(security_metrics)
        
        db.commit()
        print("✅ Security & Compliance data seeded successfully!")
        print(f"   - {len(audit_events)} audit events")
        print(f"   - {len(security_events)} security events")
        print(f"   - {len(compliance_checks)} compliance checks")
        print(f"   - {len(vulnerabilities)} vulnerabilities")
        print(f"   - {len(risk_assessments)} risk assessments")
        print(f"   - {len(security_incidents)} security incidents")
        print(f"   - {len(security_metrics)} security metrics")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding security data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_security_data()