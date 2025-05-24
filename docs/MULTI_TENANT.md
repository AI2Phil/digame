# Multi-Tenant Infrastructure Documentation

## Overview

The Digame platform implements a comprehensive multi-tenant architecture that provides complete data isolation, customizable features, and scalable infrastructure for enterprise organizations. Each tenant represents an independent organization with its own users, data, configurations, and billing.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tenant Model](#tenant-model)
3. [Data Isolation](#data-isolation)
4. [Subscription Tiers](#subscription-tiers)
5. [User Management](#user-management)
6. [Feature Management](#feature-management)
7. [Security & Compliance](#security--compliance)
8. [API Reference](#api-reference)
9. [Administration](#administration)
10. [Monitoring & Analytics](#monitoring--analytics)

## Architecture Overview

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Multi-Tenant Platform                    │
├─────────────────────────────────────────────────────────────┤
│  Tenant A          │  Tenant B          │  Tenant C        │
│  ┌─────────────┐   │  ┌─────────────┐   │  ┌─────────────┐ │
│  │ Users       │   │  │ Users       │   │  │ Users       │ │
│  │ Settings    │   │  │ Settings    │   │  │ Settings    │ │
│  │ Data        │   │  │ Data        │   │  │ Data        │ │
│  │ Features    │   │  │ Features    │   │  │ Features    │ │
│  └─────────────┘   │  └─────────────┘   │  └─────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    Shared Infrastructure                     │
│  • Database Layer   • API Gateway      • Authentication     │
│  • File Storage     • Load Balancer    • Monitoring        │
│  • Cache Layer      • Message Queue    • Logging           │
└─────────────────────────────────────────────────────────────┘
```

### Key Principles

- **Complete Data Isolation**: Each tenant's data is completely isolated from other tenants
- **Customizable Features**: Per-tenant feature flags and configurations
- **Scalable Architecture**: Horizontal scaling support for growing tenant base
- **Security First**: Enterprise-grade security with audit logging
- **Flexible Billing**: Multiple subscription tiers with usage-based billing

## Tenant Model

### Core Tenant Entity

```sql
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    tenant_uuid UUID UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255) UNIQUE,
    
    -- Subscription & Billing
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    max_users INTEGER DEFAULT 10,
    storage_limit_gb INTEGER DEFAULT 5,
    api_rate_limit INTEGER DEFAULT 1000,
    
    -- Trial Management
    is_trial BOOLEAN DEFAULT TRUE,
    trial_ends_at TIMESTAMP,
    
    -- Configuration
    settings JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    features JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Contact Information
    admin_email VARCHAR(255) NOT NULL,
    admin_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT
);
```

### Tenant Properties

| Property | Type | Description |
|----------|------|-------------|
| `tenant_uuid` | UUID | Globally unique identifier for the tenant |
| `name` | String | Display name of the organization |
| `slug` | String | URL-friendly identifier (e.g., "acme-corp") |
| `domain` | String | Custom domain for tenant (optional) |
| `subscription_tier` | Enum | basic, professional, enterprise |
| `max_users` | Integer | Maximum number of users allowed |
| `storage_limit_gb` | Integer | Storage quota in gigabytes |
| `api_rate_limit` | Integer | API requests per hour limit |
| `is_trial` | Boolean | Whether tenant is in trial period |
| `trial_ends_at` | DateTime | Trial expiration date |
| `settings` | JSON | Tenant-specific configuration |
| `branding` | JSON | Custom branding (logo, colors, etc.) |
| `features` | JSON | Enabled features for this tenant |

## Data Isolation

### Database-Level Isolation

All tenant-specific data includes a `tenant_id` foreign key to ensure complete data separation:

```sql
-- Example: User table with tenant isolation
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    -- ... other fields
    UNIQUE(tenant_id, email)  -- Ensure email uniqueness per tenant
);

-- Example: Analytics data with tenant isolation
CREATE TABLE analytics_events (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    user_id INTEGER REFERENCES users(id),
    event_type VARCHAR(100),
    event_data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Application-Level Isolation

- **Automatic Tenant Context**: All database queries automatically include tenant filtering
- **API Security**: All API endpoints validate tenant access permissions
- **File Storage**: Tenant-specific file storage paths and access controls
- **Cache Isolation**: Tenant-specific cache keys and namespaces

### Row-Level Security (RLS)

PostgreSQL Row-Level Security policies ensure data isolation at the database level:

```sql
-- Enable RLS on tenant-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to restrict access to tenant's own data
CREATE POLICY tenant_isolation_policy ON users
    FOR ALL TO application_role
    USING (tenant_id = current_setting('app.current_tenant_id')::INTEGER);
```

## Subscription Tiers

### Basic Tier
- **Users**: Up to 10 users
- **Storage**: 5GB
- **API Calls**: 1,000/hour
- **Features**:
  - Core analytics
  - Basic social collaboration
  - Standard support
- **Price**: $29/month

### Professional Tier
- **Users**: Up to 50 users
- **Storage**: 100GB
- **API Calls**: 5,000/hour
- **Features**:
  - All Basic features
  - AI insights and recommendations
  - Advanced analytics
  - API access
  - Priority support
- **Price**: $99/month

### Enterprise Tier
- **Users**: Unlimited
- **Storage**: 1TB+
- **API Calls**: 25,000/hour
- **Features**:
  - All Professional features
  - Single Sign-On (SSO)
  - Advanced reporting with PDF generation
  - Audit logs and compliance
  - Custom integrations
  - Dedicated support
- **Price**: Custom pricing

### Feature Matrix

| Feature | Basic | Professional | Enterprise |
|---------|-------|--------------|------------|
| Core Analytics | ✅ | ✅ | ✅ |
| Social Collaboration | ✅ | ✅ | ✅ |
| AI Insights | ❌ | ✅ | ✅ |
| Advanced Analytics | ❌ | ✅ | ✅ |
| API Access | ❌ | ✅ | ✅ |
| Single Sign-On | ❌ | ❌ | ✅ |
| Advanced Reporting | ❌ | ❌ | ✅ |
| Audit Logs | ❌ | ❌ | ✅ |
| Custom Branding | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ |
| SLA Guarantee | ❌ | ❌ | ✅ |

## User Management

### Tenant-User Relationships

Users can belong to multiple tenants with different roles in each:

```sql
CREATE TABLE tenant_users (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(50) DEFAULT 'member',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP,
    UNIQUE(tenant_id, user_id)
);
```

### User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full tenant management, user management, billing, settings |
| **Manager** | User management, view analytics, manage projects |
| **Member** | Access features, view own data, collaborate |
| **Viewer** | Read-only access to shared resources |

### User Invitation System

```sql
CREATE TABLE tenant_invitations (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    invited_by_user_id INTEGER REFERENCES users(id),
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Feature Management

### Feature Flags

Features are controlled through the tenant's `features` JSON field:

```json
{
  "analytics": true,
  "social_collaboration": true,
  "ai_insights": false,
  "advanced_reporting": false,
  "api_access": true,
  "sso": false,
  "audit_logs": false,
  "custom_branding": true,
  "priority_support": false
}
```

### Dynamic Feature Checking

```python
def check_feature_access(tenant_id: int, feature_name: str) -> bool:
    tenant = get_tenant(tenant_id)
    return tenant.features.get(feature_name, False)

# Usage in API endpoints
@router.get("/advanced-analytics")
async def get_advanced_analytics(tenant_id: int = Depends(get_current_tenant)):
    if not check_feature_access(tenant_id, "ai_insights"):
        raise HTTPException(403, "Feature not available in your subscription")
    # ... return analytics data
```

### Feature Upgrade Flow

1. **Feature Request**: User attempts to access premium feature
2. **Permission Check**: System validates tenant's subscription tier
3. **Upgrade Prompt**: If not available, show upgrade options
4. **Billing Integration**: Process subscription upgrade
5. **Feature Activation**: Enable feature for tenant

## Security & Compliance

### Data Security

- **Encryption at Rest**: All tenant data encrypted using AES-256
- **Encryption in Transit**: TLS 1.3 for all API communications
- **Database Encryption**: Transparent Data Encryption (TDE) enabled
- **File Storage**: Encrypted S3 buckets with tenant-specific access

### Access Controls

- **Role-Based Access Control (RBAC)**: Granular permissions per tenant
- **API Authentication**: JWT tokens with tenant context
- **Session Management**: Secure session handling with timeout
- **IP Whitelisting**: Optional IP-based access restrictions

### Audit Logging

```sql
CREATE TABLE tenant_audit_logs (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Compliance Features

- **SOC 2 Type II**: Comprehensive audit trails and security controls
- **GDPR**: Data portability, right to deletion, consent management
- **HIPAA**: Healthcare data protection (Enterprise tier)
- **SOX**: Financial data controls and audit requirements

## API Reference

### Tenant Management

#### Create Tenant
```http
POST /api/tenants
Content-Type: application/json

{
  "name": "Acme Corporation",
  "admin_email": "admin@acme.com",
  "admin_name": "John Admin",
  "subscription_tier": "professional",
  "domain": "acme.digame.com"
}
```

#### Get Tenant Information
```http
GET /api/tenants/{tenant_id}
Authorization: Bearer {jwt_token}
```

#### Update Tenant Settings
```http
PUT /api/tenants/{tenant_id}
Content-Type: application/json

{
  "settings": {
    "timezone": "America/New_York",
    "date_format": "MM/DD/YYYY",
    "currency": "USD"
  },
  "branding": {
    "primary_color": "#007bff",
    "logo_url": "https://cdn.acme.com/logo.png"
  }
}
```

### User Management

#### Invite User to Tenant
```http
POST /api/tenants/{tenant_id}/invitations
Content-Type: application/json

{
  "email": "user@example.com",
  "role": "member"
}
```

#### Get Tenant Users
```http
GET /api/tenants/{tenant_id}/users?role=member&active=true
Authorization: Bearer {jwt_token}
```

### Usage & Limits

#### Get Tenant Usage
```http
GET /api/tenants/{tenant_id}/usage
Authorization: Bearer {jwt_token}

Response:
{
  "users": {"current": 12, "limit": 50},
  "storage": {"used_gb": 15.7, "limit_gb": 100},
  "api_calls": {"today": 1247, "limit": 5000}
}
```

## Administration

### Tenant Lifecycle Management

#### 1. Tenant Creation
- Validate organization information
- Set up initial admin user
- Configure default settings
- Initialize feature flags based on subscription
- Send welcome email with setup instructions

#### 2. Onboarding Process
- Admin user completes profile
- Configure organization settings
- Invite initial team members
- Set up integrations (optional)
- Complete billing setup

#### 3. Active Management
- Monitor usage and limits
- Handle subscription changes
- Manage user access and roles
- Configure features and settings
- Monitor security and compliance

#### 4. Offboarding
- Data export and backup
- User notification period
- Account suspension
- Data retention according to policy
- Final data deletion

### Billing Integration

```python
class TenantBillingService:
    def upgrade_subscription(self, tenant_id: int, new_tier: str):
        tenant = get_tenant(tenant_id)
        
        # Update subscription tier
        tenant.subscription_tier = new_tier
        
        # Update limits based on new tier
        tier_config = get_tier_configuration(new_tier)
        tenant.max_users = tier_config.max_users
        tenant.storage_limit_gb = tier_config.storage_limit
        tenant.api_rate_limit = tier_config.api_rate_limit
        
        # Enable new features
        tenant.features.update(tier_config.features)
        
        # Process billing change
        billing_service.update_subscription(tenant.id, new_tier)
        
        # Log the change
        audit_log.log_event(tenant.id, "subscription_upgraded", {
            "old_tier": tenant.subscription_tier,
            "new_tier": new_tier
        })
```

### Monitoring & Alerts

#### Usage Monitoring
- Real-time usage tracking for all limits
- Automated alerts at 80% and 95% thresholds
- Usage trend analysis and forecasting
- Billing anomaly detection

#### Performance Monitoring
- Per-tenant performance metrics
- Database query performance by tenant
- API response times and error rates
- Resource utilization tracking

#### Security Monitoring
- Failed authentication attempts
- Unusual access patterns
- Data access anomalies
- Compliance violation alerts

## Monitoring & Analytics

### Tenant Metrics Dashboard

#### Key Performance Indicators (KPIs)
- **Monthly Recurring Revenue (MRR)** per tenant
- **User Adoption Rate** and engagement metrics
- **Feature Utilization** across subscription tiers
- **Support Ticket Volume** and resolution times
- **Churn Risk Indicators** and retention metrics

#### Usage Analytics
```sql
-- Example: Monthly active users per tenant
SELECT 
    t.name as tenant_name,
    t.subscription_tier,
    COUNT(DISTINCT u.id) as monthly_active_users,
    AVG(session_duration) as avg_session_duration
FROM tenants t
JOIN users u ON u.tenant_id = t.id
JOIN user_sessions s ON s.user_id = u.id
WHERE s.created_at >= NOW() - INTERVAL '30 days'
GROUP BY t.id, t.name, t.subscription_tier
ORDER BY monthly_active_users DESC;
```

#### Revenue Analytics
- Subscription revenue by tier
- Upgrade/downgrade trends
- Customer lifetime value (CLV)
- Churn rate by subscription tier
- Revenue per user (ARPU)

### Health Checks

#### Tenant Health Score
Calculated based on:
- User engagement levels
- Feature adoption rate
- Support ticket frequency
- Payment history
- Usage pattern consistency

#### Automated Health Monitoring
```python
def calculate_tenant_health_score(tenant_id: int) -> float:
    metrics = {
        'user_engagement': get_engagement_score(tenant_id),
        'feature_adoption': get_adoption_score(tenant_id),
        'support_satisfaction': get_support_score(tenant_id),
        'payment_health': get_payment_score(tenant_id),
        'usage_consistency': get_usage_score(tenant_id)
    }
    
    weights = {
        'user_engagement': 0.3,
        'feature_adoption': 0.2,
        'support_satisfaction': 0.2,
        'payment_health': 0.2,
        'usage_consistency': 0.1
    }
    
    return sum(metrics[key] * weights[key] for key in metrics)
```

## Best Practices

### Development Guidelines

1. **Always Include Tenant Context**: Every database query must include tenant filtering
2. **Validate Tenant Access**: Check user permissions for tenant operations
3. **Use Tenant-Specific Caching**: Include tenant ID in cache keys
4. **Log Tenant Actions**: Comprehensive audit logging for compliance
5. **Test Multi-Tenant Scenarios**: Include tenant isolation in test suites

### Security Best Practices

1. **Principle of Least Privilege**: Users only access their tenant's data
2. **Regular Security Audits**: Automated and manual security assessments
3. **Data Encryption**: Encrypt sensitive data at rest and in transit
4. **Access Logging**: Log all data access for audit purposes
5. **Regular Backups**: Tenant-specific backup and recovery procedures

### Performance Optimization

1. **Database Indexing**: Optimize indexes for tenant-filtered queries
2. **Connection Pooling**: Efficient database connection management
3. **Caching Strategy**: Multi-level caching with tenant isolation
4. **Query Optimization**: Monitor and optimize slow queries
5. **Resource Monitoring**: Track per-tenant resource usage

## Troubleshooting

### Common Issues

#### Data Isolation Problems
- **Symptom**: Users seeing data from other tenants
- **Cause**: Missing tenant_id in query filters
- **Solution**: Implement automatic tenant filtering middleware

#### Performance Issues
- **Symptom**: Slow queries for large tenants
- **Cause**: Missing or inefficient database indexes
- **Solution**: Add composite indexes on (tenant_id, other_columns)

#### Feature Access Issues
- **Symptom**: Users can't access features they should have
- **Cause**: Incorrect feature flag configuration
- **Solution**: Verify tenant subscription tier and feature mapping

### Debugging Tools

#### Tenant Context Debugging
```python
def debug_tenant_context(request):
    return {
        'tenant_id': get_current_tenant_id(request),
        'user_id': get_current_user_id(request),
        'user_roles': get_user_roles(request),
        'enabled_features': get_enabled_features(request)
    }
```

#### Query Analysis
```sql
-- Find queries missing tenant filtering
SELECT query, calls, mean_time
FROM pg_stat_statements
WHERE query NOT LIKE '%tenant_id%'
  AND query LIKE '%SELECT%'
ORDER BY calls DESC;
```

## Future Enhancements

### Planned Features

1. **Multi-Region Support**: Deploy tenants across multiple geographic regions
2. **Advanced Analytics**: Per-tenant business intelligence and reporting
3. **API Rate Limiting**: More granular API rate limiting per tenant
4. **Custom Domains**: Full custom domain support with SSL certificates
5. **Data Residency**: Tenant-specific data location requirements
6. **Backup Scheduling**: Tenant-configurable backup schedules
7. **Integration Marketplace**: Tenant-specific third-party integrations

### Scalability Roadmap

1. **Horizontal Sharding**: Distribute tenants across multiple database shards
2. **Microservices**: Break down monolith into tenant-aware microservices
3. **Event-Driven Architecture**: Implement tenant-aware event streaming
4. **Auto-Scaling**: Automatic resource scaling based on tenant usage
5. **Global Load Balancing**: Intelligent routing based on tenant location

---

## Support

For technical support or questions about multi-tenant implementation:

- **Documentation**: [https://docs.digame.com/multi-tenant](https://docs.digame.com/multi-tenant)
- **API Reference**: [https://api.digame.com/docs](https://api.digame.com/docs)
- **Support Portal**: [https://support.digame.com](https://support.digame.com)
- **Developer Community**: [https://community.digame.com](https://community.digame.com)

---

*Last Updated: May 24, 2025*
*Version: 1.0*