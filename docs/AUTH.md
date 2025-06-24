# Authentication & Multi-Tenant Infrastructure Implementation Plan

## 🎯 Overview

This document outlines the comprehensive implementation plan for establishing the multi-tenant authentication infrastructure required to support the ACO (Access Control Organization) plan. The authentication system must support a hierarchical structure with Platform Owner at the top, followed by tenant-specific roles and user tiers.

## 🏗️ Current State Analysis

Based on codebase review, the platform currently has:
- ✅ **Basic JWT Authentication**: Working authentication with access/refresh tokens
- ✅ **RBAC Foundation**: Role-based access control with 6 hierarchical roles
- ✅ **Multi-Tenant Models**: Tenant, User, Role models exist
- ✅ **Security Middleware**: OWASP headers, rate limiting, CORS
- ⚠️ **Incomplete Platform Owner Hierarchy**: Needs enhancement for ACO implementation
- ⚠️ **Limited Tenant Analytics**: Basic tenant management without comprehensive insights

## 🎯 Implementation Goals

### **Primary Objectives**
1. **Platform Owner Supreme Access**: Unrestricted access to all tenants and features
2. **Tenant Isolation**: Complete data segregation between tenant organizations
3. **Hierarchical Authentication**: Clear authority levels from Platform Owner down
4. **Comprehensive Analytics**: Platform-wide usage metrics and insights for Platform Owner
5. **ACO Tier Integration**: Support for Free, Individual Pro, Team, and Enterprise tiers

### **Secondary Objectives**
1. **Audit & Compliance**: Complete audit trails for all authentication events
2. **Security Enhancement**: Advanced threat detection and monitoring
3. **Performance Optimization**: Efficient authentication with minimal overhead
4. **Scalability**: Support for thousands of tenants and millions of users

---

## 📋 Implementation Phases

### **Phase 1: Platform Owner Infrastructure (Week 1-2)**

#### **1.1 Enhanced User Model**
```python
# digame/app/models/user.py - Enhanced User Model
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Platform Owner Identification
    is_platform_owner = Column(Boolean, default=False, nullable=False)
    platform_owner_level = Column(Integer, default=0)  # 0=regular, 1=admin, 2=super_admin, 3=platform_owner
    
    # Tenant Association
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)  # Null for Platform Owner
    
    # ACO Tier Information
    subscription_tier = Column(String, default="free")  # free, individual_pro, team, enterprise
    subscription_status = Column(String, default="active")  # active, suspended, cancelled
    subscription_expires = Column(DateTime, nullable=True)
    is_founding_member = Column(Boolean, default=False)
    
    # Enhanced Security
    last_login = Column(DateTime, nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    account_locked_until = Column(DateTime, nullable=True)
    password_changed_at = Column(DateTime, default=func.now())
    
    # Audit Fields
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="users")
    created_tenants = relationship("Tenant", foreign_keys="Tenant.created_by")
```

#### **1.2 Enhanced Tenant Model**
```python
# digame/app/models/tenant.py - Enhanced Tenant Model
class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    
    # Subscription Information
    subscription_tier = Column(String, default="free")  # free, team, enterprise
    subscription_status = Column(String, default="trial")  # trial, active, suspended, cancelled
    subscription_expires = Column(DateTime, nullable=True)
    billing_email = Column(String, nullable=True)
    
    # Platform Owner Management
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)  # Platform Owner who created
    managed_by = Column(Integer, ForeignKey("users.id"), nullable=True)   # Assigned Platform Owner manager
    
    # Tenant Limits (based on subscription tier)
    max_users = Column(Integer, default=1)
    max_storage_gb = Column(Integer, default=1)
    max_api_calls_monthly = Column(Integer, default=1000)
    
    # Usage Tracking
    current_users = Column(Integer, default=0)
    current_storage_gb = Column(Float, default=0.0)
    current_api_calls_monthly = Column(Integer, default=0)
    
    # Audit Fields
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_activity = Column(DateTime, default=func.now())
    
    # Relationships
    users = relationship("User", back_populates="tenant")
    creator = relationship("User", foreign_keys=[created_by])
    manager = relationship("User", foreign_keys=[managed_by])
```

#### **1.3 Platform Owner Role System**
```python
# digame/app/models/platform_roles.py - New Platform Role System
class PlatformRole(Base):
    __tablename__ = "platform_roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    level = Column(Integer, nullable=False)  # 1=admin, 2=super_admin, 3=platform_owner
    description = Column(Text, nullable=True)
    
    # Permissions
    can_create_tenants = Column(Boolean, default=False)
    can_manage_all_tenants = Column(Boolean, default=False)
    can_access_all_data = Column(Boolean, default=False)
    can_modify_platform_settings = Column(Boolean, default=False)
    can_view_platform_analytics = Column(Boolean, default=False)
    can_manage_platform_users = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=func.now())

class UserPlatformRole(Base):
    __tablename__ = "user_platform_roles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    platform_role_id = Column(Integer, ForeignKey("platform_roles.id"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_at = Column(DateTime, default=func.now())
    
    user = relationship("User", foreign_keys=[user_id])
    platform_role = relationship("PlatformRole")
    assigner = relationship("User", foreign_keys=[assigned_by])
```

### **Phase 2: Enhanced Authentication Service (Week 2-3)**

#### **2.1 Platform Owner Authentication Service**
```python
# digame/app/services/platform_auth_service.py - New Platform Authentication Service
class PlatformAuthService:
    def __init__(self, db: Session):
        self.db = db
    
    def authenticate_platform_owner(self, email: str, password: str) -> Optional[User]:
        """Authenticate platform owner with enhanced security"""
        user = self.db.query(User).filter(
            User.email == email,
            User.is_platform_owner == True
        ).first()
        
        if not user:
            return None
            
        if user.account_locked_until and user.account_locked_until > datetime.utcnow():
            raise HTTPException(status_code=423, detail="Account temporarily locked")
            
        if not verify_password(password, user.hashed_password):
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.account_locked_until = datetime.utcnow() + timedelta(minutes=30)
            self.db.commit()
            return None
            
        # Reset failed attempts on successful login
        user.failed_login_attempts = 0
        user.last_login = datetime.utcnow()
        user.account_locked_until = None
        self.db.commit()
        
        return user
    
    def get_platform_owner_permissions(self, user: User) -> Dict[str, bool]:
        """Get comprehensive platform owner permissions"""
        if not user.is_platform_owner:
            return {}
            
        platform_roles = self.db.query(PlatformRole).join(UserPlatformRole).filter(
            UserPlatformRole.user_id == user.id
        ).all()
        
        permissions = {
            "can_create_tenants": False,
            "can_manage_all_tenants": False,
            "can_access_all_data": False,
            "can_modify_platform_settings": False,
            "can_view_platform_analytics": False,
            "can_manage_platform_users": False,
        }
        
        for role in platform_roles:
            for permission in permissions.keys():
                if getattr(role, permission, False):
                    permissions[permission] = True
                    
        return permissions
    
    def create_platform_owner(self, email: str, password: str, level: int = 3) -> User:
        """Create new platform owner (only by existing platform owner)"""
        hashed_password = get_password_hash(password)
        
        user = User(
            email=email,
            username=email.split('@')[0],
            hashed_password=hashed_password,
            is_platform_owner=True,
            platform_owner_level=level,
            tenant_id=None  # Platform owners don't belong to tenants
        )
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        # Assign platform role
        platform_role = self.db.query(PlatformRole).filter(
            PlatformRole.level == level
        ).first()
        
        if platform_role:
            user_role = UserPlatformRole(
                user_id=user.id,
                platform_role_id=platform_role.id,
                assigned_by=user.id  # Self-assigned for first platform owner
            )
            self.db.add(user_role)
            self.db.commit()
            
        return user
```

#### **2.2 Enhanced JWT Token Service**
```python
# digame/app/services/enhanced_jwt_service.py - Enhanced JWT with Platform Context
class EnhancedJWTService:
    def create_access_token(self, user: User, tenant_context: Optional[Tenant] = None) -> str:
        """Create JWT token with platform owner and tenant context"""
        
        # Get platform permissions if platform owner
        platform_permissions = {}
        if user.is_platform_owner:
            auth_service = PlatformAuthService(self.db)
            platform_permissions = auth_service.get_platform_owner_permissions(user)
        
        # Get tenant-specific permissions
        tenant_permissions = {}
        if tenant_context:
            tenant_permissions = self.get_tenant_permissions(user, tenant_context)
        
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "username": user.username,
            
            # Platform Owner Context
            "is_platform_owner": user.is_platform_owner,
            "platform_owner_level": user.platform_owner_level,
            "platform_permissions": platform_permissions,
            
            # Tenant Context
            "tenant_id": user.tenant_id,
            "tenant_context": tenant_context.id if tenant_context else None,
            "tenant_permissions": tenant_permissions,
            
            # Subscription Context
            "subscription_tier": user.subscription_tier,
            "subscription_status": user.subscription_status,
            "is_founding_member": user.is_founding_member,
            
            # Token Metadata
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=2),
            "token_type": "access"
        }
        
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
```

### **Phase 3: Platform Analytics Infrastructure (Week 3-4)**

#### **3.1 Platform Analytics Models**
```python
# digame/app/models/platform_analytics.py - Platform Analytics Models
class PlatformUsageMetric(Base):
    __tablename__ = "platform_usage_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Metric Information
    metric_type = Column(String, nullable=False)  # user_activity, api_calls, storage_usage, etc.
    metric_category = Column(String, nullable=False)  # authentication, features, performance, etc.
    metric_name = Column(String, nullable=False)
    metric_value = Column(Float, nullable=False)
    metric_unit = Column(String, nullable=True)  # requests, GB, users, etc.
    
    # Context
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)  # Null for platform-wide
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Dimensions
    subscription_tier = Column(String, nullable=True)
    feature_name = Column(String, nullable=True)
    endpoint_path = Column(String, nullable=True)
    
    # Temporal
    recorded_at = Column(DateTime, default=func.now(), index=True)
    period_start = Column(DateTime, nullable=True)
    period_end = Column(DateTime, nullable=True)
    
    # Relationships
    tenant = relationship("Tenant")
    user = relationship("User")

class PlatformHealthMetric(Base):
    __tablename__ = "platform_health_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Health Indicators
    metric_name = Column(String, nullable=False)  # response_time, error_rate, uptime, etc.
    current_value = Column(Float, nullable=False)
    threshold_warning = Column(Float, nullable=True)
    threshold_critical = Column(Float, nullable=True)
    status = Column(String, default="healthy")  # healthy, warning, critical
    
    # Service Context
    service_name = Column(String, nullable=True)
    component_name = Column(String, nullable=True)
    
    # Temporal
    measured_at = Column(DateTime, default=func.now(), index=True)
    
class TenantAnalyticsSummary(Base):
    __tablename__ = "tenant_analytics_summary"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    
    # User Metrics
    total_users = Column(Integer, default=0)
    active_users_daily = Column(Integer, default=0)
    active_users_weekly = Column(Integer, default=0)
    active_users_monthly = Column(Integer, default=0)
    
    # Usage Metrics
    total_api_calls = Column(Integer, default=0)
    total_storage_gb = Column(Float, default=0.0)
    total_features_used = Column(Integer, default=0)
    
    # Engagement Metrics
    avg_session_duration = Column(Float, default=0.0)
    total_logins = Column(Integer, default=0)
    feature_adoption_rate = Column(Float, default=0.0)
    
    # Financial Metrics
    monthly_revenue = Column(Float, default=0.0)
    lifetime_value = Column(Float, default=0.0)
    
    # Temporal
    summary_date = Column(Date, default=func.current_date(), index=True)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    tenant = relationship("Tenant")
```

#### **3.2 Platform Analytics Service**
```python
# digame/app/services/platform_analytics_service.py - Platform Analytics Service
class PlatformAnalyticsService:
    def __init__(self, db: Session):
        self.db = db
    
    def record_usage_metric(self, metric_type: str, metric_name: str, value: float, 
                          tenant_id: Optional[int] = None, user_id: Optional[int] = None,
                          **dimensions) -> PlatformUsageMetric:
        """Record a usage metric for platform analytics"""
        
        metric = PlatformUsageMetric(
            metric_type=metric_type,
            metric_category=dimensions.get('category', 'general'),
            metric_name=metric_name,
            metric_value=value,
            metric_unit=dimensions.get('unit'),
            tenant_id=tenant_id,
            user_id=user_id,
            subscription_tier=dimensions.get('subscription_tier'),
            feature_name=dimensions.get('feature_name'),
            endpoint_path=dimensions.get('endpoint_path')
        )
        
        self.db.add(metric)
        self.db.commit()
        return metric
    
    def get_platform_overview(self, days: int = 30) -> Dict[str, Any]:
        """Get comprehensive platform overview for Platform Owner"""
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Tenant Metrics
        total_tenants = self.db.query(Tenant).count()
        active_tenants = self.db.query(Tenant).filter(
            Tenant.last_activity >= start_date
        ).count()
        
        # User Metrics
        total_users = self.db.query(User).filter(User.is_platform_owner == False).count()
        active_users = self.db.query(User).filter(
            User.last_login >= start_date,
            User.is_platform_owner == False
        ).count()
        
        # Subscription Metrics
        subscription_breakdown = self.db.query(
            User.subscription_tier,
            func.count(User.id).label('count')
        ).filter(User.is_platform_owner == False).group_by(User.subscription_tier).all()
        
        # Revenue Metrics (estimated)
        tier_pricing = {"free": 0, "individual_pro": 19, "team": 49, "enterprise": 500}
        estimated_mrr = sum(
            tier_pricing.get(tier, 0) * count 
            for tier, count in subscription_breakdown
        )
        
        # Usage Metrics
        api_calls_today = self.db.query(func.sum(PlatformUsageMetric.metric_value)).filter(
            PlatformUsageMetric.metric_type == "api_calls",
            PlatformUsageMetric.recorded_at >= datetime.utcnow().date()
        ).scalar() or 0
        
        # Storage Usage
        total_storage = self.db.query(func.sum(Tenant.current_storage_gb)).scalar() or 0
        
        return {
            "overview": {
                "total_tenants": total_tenants,
                "active_tenants": active_tenants,
                "total_users": total_users,
                "active_users": active_users,
                "estimated_mrr": estimated_mrr,
                "total_storage_gb": total_storage,
                "api_calls_today": api_calls_today
            },
            "subscription_breakdown": dict(subscription_breakdown),
            "growth_metrics": self.get_growth_metrics(days),
            "health_status": self.get_platform_health(),
            "top_tenants": self.get_top_tenants_by_usage(limit=10)
        }
    
    def get_tenant_detailed_analytics(self, tenant_id: int, days: int = 30) -> Dict[str, Any]:
        """Get detailed analytics for a specific tenant"""
        
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # User Activity
        user_metrics = self.db.query(
            func.count(User.id).label('total_users'),
            func.count(case([(User.last_login >= start_date, 1)])).label('active_users')
        ).filter(User.tenant_id == tenant_id).first()
        
        # Feature Usage
        feature_usage = self.db.query(
            PlatformUsageMetric.feature_name,
            func.count(PlatformUsageMetric.id).label('usage_count'),
            func.sum(PlatformUsageMetric.metric_value).label('total_value')
        ).filter(
            PlatformUsageMetric.tenant_id == tenant_id,
            PlatformUsageMetric.recorded_at >= start_date
        ).group_by(PlatformUsageMetric.feature_name).all()
        
        # API Usage Trends
        api_trends = self.db.query(
            func.date(PlatformUsageMetric.recorded_at).label('date'),
            func.sum(PlatformUsageMetric.metric_value).label('api_calls')
        ).filter(
            PlatformUsageMetric.tenant_id == tenant_id,
            PlatformUsageMetric.metric_type == "api_calls",
            PlatformUsageMetric.recorded_at >= start_date
        ).group_by(func.date(PlatformUsageMetric.recorded_at)).all()
        
        return {
            "tenant_info": {
                "id": tenant.id,
                "name": tenant.name,
                "subscription_tier": tenant.subscription_tier,
                "subscription_status": tenant.subscription_status,
                "created_at": tenant.created_at
            },
            "user_metrics": {
                "total_users": user_metrics.total_users,
                "active_users": user_metrics.active_users,
                "utilization_rate": (user_metrics.total_users / tenant.max_users) * 100
            },
            "usage_metrics": {
                "current_storage_gb": tenant.current_storage_gb,
                "storage_utilization": (tenant.current_storage_gb / tenant.max_storage_gb) * 100,
                "current_api_calls": tenant.current_api_calls_monthly,
                "api_utilization": (tenant.current_api_calls_monthly / tenant.max_api_calls_monthly) * 100
            },
            "feature_usage": [
                {
                    "feature": usage.feature_name,
                    "usage_count": usage.usage_count,
                    "total_value": usage.total_value
                }
                for usage in feature_usage
            ],
            "api_trends": [
                {
                    "date": trend.date.isoformat(),
                    "api_calls": trend.api_calls
                }
                for trend in api_trends
            ]
        }
```

### **Phase 4: Enhanced Authorization Middleware (Week 4-5)**

#### **4.1 Platform Owner Authorization Decorator**
```python
# digame/app/auth/platform_decorators.py - Platform Authorization Decorators
from functools import wraps
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer

security = HTTPBearer()

def require_platform_owner(permission: Optional[str] = None):
    """Decorator to require platform owner access with optional specific permission"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract current user from dependencies
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            if not current_user.is_platform_owner:
                raise HTTPException(status_code=403, detail="Platform owner access required")
            
            if permission:
                auth_service = PlatformAuthService(kwargs.get('db'))
                permissions = auth_service.get_platform_owner_permissions(current_user)
                
                if not permissions.get(permission, False):
                    raise HTTPException(
                        status_code=403, 
                        detail=f"Platform owner permission '{permission}' required"
                    )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def require_tenant_access(allow_platform_owner: bool = True):
    """Decorator to require tenant access or platform owner override"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            tenant_id = kwargs.get('tenant_id')
            
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            # Platform owners can access any tenant
            if allow_platform_owner and current_user.is_platform_owner:
                return await func(*args, **kwargs)
            
            # Regular users must belong to the tenant
            if current_user.tenant_id != tenant_id:
                raise HTTPException(status_code=403, detail="Tenant access denied")
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def require_subscription_tier(required_tier: str):
    """Decorator to require specific subscription tier"""
    tier_hierarchy = {
        "free": 0,
        "individual_pro": 1,
        "team": 2,
        "enterprise": 3
    }
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            
            if not current_user:
                raise HTTPException(status_code=401, detail="Authentication required")
            
            # Platform owners bypass subscription requirements
            if current_user.is_platform_owner:
                return await func(*args, **kwargs)
            
            # Founding members get Individual Pro equivalent
            user_tier = current_user.subscription_tier
            if current_user.is_founding_member and user_tier == "free":
                user_tier = "individual_pro"
            
            user_tier_level = tier_hierarchy.get(user_tier, 0)
            required_tier_level = tier_hierarchy.get(required_tier, 0)
            
            if user_tier_level < required_tier_level:
                raise HTTPException(
                    status_code=402, 
                    detail=f"Subscription tier '{required_tier}' or higher required"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
```

#### **4.2 Enhanced Authentication Dependencies**
```python
# digame/app/auth/dependencies.py - Enhanced Authentication Dependencies
async def get_current_user(token: str = Depends(security), db: Session = Depends(get_db)) -> User:
    """Get current user with enhanced platform context"""
    
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
            
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    # Check if account is locked
    if user.account_locked_until and user.account_locked_until > datetime.utcnow():
        raise HTTPException(status_code=423, detail="Account temporarily locked")
    
    # Check subscription status
    if user.subscription_status == "suspended":
        raise HTTPException(status_code=402, detail="Account suspended")
    
    return user

async def get_platform_owner(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure current user is a platform owner"""
    if not current_user.is_platform_owner:
        raise HTTPException(status_code=403, detail="Platform owner access required")
    return current_user

async def get_tenant_context(
    tenant_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Tenant:
    """Get tenant context with access validation"""
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    # Platform owners can access any tenant
    if current_user.is_platform_owner:
        return tenant
    
    # Regular users must belong to the tenant
    if current_user.tenant_id != tenant_id:
        raise HTTPException(status_code=403, detail="Tenant access denied")
    
    return tenant
```

### **Phase 5: Platform Owner API Endpoints (Week 5-6)**

#### **5.1 Platform Management Router**
```python
# digame/app/routers/platform_management_router.py - Platform Management API
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional

router = APIRouter(prefix="/platform", tags=["Platform Management"])

@router.get("/overview")
@require_platform_owner("can_view_platform_analytics")
async def get_platform_overview(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """Get comprehensive platform overview and analytics"""
    
    analytics_service = PlatformAnalyticsService(db)
    overview = analytics_service.get_platform_overview(days)
    
    return {
        "status": "success",
        "data": overview,
        "requested_by": current_user.email,
        "period_days": days
    }

@router.get("/tenants")
@require_platform_owner("can_manage_all_tenants")
async def list_all_tenants(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    subscription_tier: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """List all tenants with filtering options"""
    
    query = db.query(Tenant)
    
    if subscription_tier:
        query = query.filter(Tenant.subscription_tier == subscription_tier)
    
    if status:
        query = query.filter(Tenant.subscription_status == status)
    
    total = query.count()
    tenants = query.offset(skip).limit(limit).all()
    
    return {
        "status": "success",
        "data": {
            "tenants": tenants,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    }

@router.get("/tenants/{tenant_id}/analytics")
@require_platform_owner("can_view_platform_analytics")
async def get_tenant_analytics(
    tenant_id: int,
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """Get detailed analytics for a specific tenant"""
    
    analytics_service = PlatformAnalyticsService(db)
    analytics = analytics_service.get_tenant_detailed_analytics(tenant_id, days)
    
    return {
        "status": "success",
        "data": analytics,
        "requested_by": current_user.email
    }

@router.post("/tenants")
@require_platform_owner("can_create_tenants")
async def create_tenant(
    tenant_data: TenantCreateSchema,
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """Create a new tenant organization"""
    
    # Check if tenant slug is unique
    existing = db.query(Tenant).filter(Tenant.slug == tenant_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tenant slug already exists")
    
    tenant = Tenant(
        name=tenant_data.name,
        slug=tenant_data.slug,
        subscription_tier=tenant_data.subscription_tier,
        subscription_status="active",
        created_by=current_user.id,
        managed_by=current_user.id,
        max_users=get_tier_limits(tenant_data.subscription_tier)["max_users"],
        max_storage_gb=get_tier_limits(tenant_data.subscription_tier)["max_storage_gb"],
        max_api_calls_monthly=get_tier_limits(tenant_data.subscription_tier)["max_api_calls_monthly"]
    )
    
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    
    # Record creation metric
    analytics_service = PlatformAnalyticsService(db)
    analytics_service.record_usage_metric(
        "tenant_management", "tenant_created", 1,
        category="platform_admin",
        subscription_tier=tenant_data.subscription_tier
    )
    
    return {
        "status": "success",
        "data": tenant,
        "message": f"Tenant '{tenant.name}' created successfully"
    }

@router.put("/tenants/{tenant_id}/subscription")
@require_platform_owner("can_manage_all_tenants")
async def update_tenant_subscription(
    tenant_id: int,
    subscription_data: TenantSubscriptionUpdateSchema,
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """Update tenant subscription tier and limits"""
    
    tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    
    old_tier = tenant.subscription_tier
    
    # Update subscription
    tenant.subscription_tier = subscription_data.subscription_tier
    tenant.subscription_status = subscription_data.subscription_status
    
    # Update limits based on new tier
    limits = get_tier_limits(subscription_data.subscription_tier)
    tenant.max_users = limits["max_users"]
    tenant.max_storage_gb = limits["max_storage_gb"]
    tenant.max_api_calls_monthly = limits["max_api_calls_monthly"]
    
    if subscription_data.subscription_expires:
        tenant.subscription_expires = subscription_data.subscription_expires
    
    db.commit()
    
    # Record subscription change
    analytics_service = PlatformAnalyticsService(db)
    analytics_service.record_usage_metric(
        "subscription_management", "tier_changed", 1,
        category="platform_admin",
        tenant_id=tenant_id,
        old_tier=old_tier,
        new_tier=subscription_data.subscription_tier
    )
    
    return {
        "status": "success",
        "data": tenant,
        "message": f"Tenant subscription updated from {old_tier} to {subscription_data.subscription_tier}"
    }

@router.get("/users")
@require_platform_owner("can_manage_platform_users")
async def list_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    subscription_tier: Optional[str] = Query(None),
    tenant_id: Optional[int] = Query(None),
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """List all platform users with filtering"""
    
    query = db.query(User).filter(User.is_platform_owner == False)
    
    if subscription_tier:
        query = query.filter(User.subscription_tier == subscription_tier)
    
    if tenant_id:
        query = query.filter(User.tenant_id == tenant_id)
    
    total = query.count()
    users = query.offset(skip).limit(limit).all()
    
    return {
        "status": "success",
        "data": {
            "users": users,
            "total": total,
            "skip": skip,
            "limit": limit
        }
    }

@router.get("/health")
@require_platform_owner("can_view_platform_analytics")
async def get_platform_health(
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """Get platform health metrics and status"""
    
    health_metrics = db.query(PlatformHealthMetric).filter(
        PlatformHealthMetric.measured_at >= datetime.utcnow() - timedelta(hours=1)
    ).all()
    
    # Calculate overall health score
    critical_count = sum(1 for m in health_metrics if m.status == "critical")
    warning_count = sum(1 for m in health_metrics if m.status == "warning")
    healthy_count = sum(1 for m in health_metrics if m.status == "healthy")
    
    total_metrics = len(health_metrics)
    health_score = (healthy_count / total_metrics * 100) if total_metrics > 0 else 100
    
    overall_status = "healthy"
    if critical_count > 0:
        overall_status = "critical"
    elif warning_count > 0:
        overall_status = "warning"
    
    return {
        "status": "success",
        "data": {
            "overall_status": overall_status,
            "health_score": health_score,
            "metrics_summary": {
                "healthy": healthy_count,
                "warning": warning_count,
                "critical": critical_count,
                "total": total_metrics
            },
            "detailed_metrics": health_metrics
        }
    }
```

#### **5.2 Platform Analytics Router**
```python
# digame/app/routers/platform_analytics_router.py - Platform Analytics API
from fastapi import APIRouter, Depends, Query
from datetime import datetime, timedelta
from typing import List, Optional

router = APIRouter(prefix="/platform/analytics", tags=["Platform Analytics"])

@router.get("/dashboard")
@require_platform_owner("can_view_platform_analytics")
async def get_analytics_dashboard(
    period: str = Query("30d", regex="^(1d|7d|30d|90d|1y)$"),
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """Get comprehensive analytics dashboard data"""
    
    # Parse period
    period_days = {"1d": 1, "7d": 7, "30d": 30, "90d": 90, "1y": 365}[period]
    start_date = datetime.utcnow() - timedelta(days=period_days)
    
    analytics_service = PlatformAnalyticsService(db)
    
    # Core metrics
    overview = analytics_service.get_platform_overview(period_days)
    
    # Growth trends
    growth_data = analytics_service.get_growth_trends(period_days)
    
    # Revenue analytics
    revenue_data = analytics_service.get_revenue_analytics(period_days)
    
    # Feature usage
    feature_usage = analytics_service.get_feature_usage_analytics(period_days)
    
    # Geographic distribution
    geo_data = analytics_service.get_geographic_distribution()
    
    return {
        "status": "success",
        "data": {
            "overview": overview,
            "growth_trends": growth_data,
            "revenue_analytics": revenue_data,
            "feature_usage": feature_usage,
            "geographic_distribution": geo_data,
            "period": period,
            "generated_at": datetime.utcnow()
        }
    }

@router.get("/revenue")
@require_platform_owner("can_view_platform_analytics")
async def get_revenue_analytics(
    period: str = Query("30d"),
    breakdown: str = Query("daily", regex="^(daily|weekly|monthly)$"),
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """Get detailed revenue analytics and projections"""
    
    period_days = {"1d": 1, "7d": 7, "30d": 30, "90d": 90, "1y": 365}[period]
    
    # Current MRR by tier
    mrr_by_tier = db.query(
        User.subscription_tier,
        func.count(User.id).label('subscribers'),
        func.sum(
            case([
                (User.subscription_tier == "individual_pro", 19),
                (User.subscription_tier == "team", 49),
                (User.subscription_tier == "enterprise", 500)
            ], else_=0)
        ).label('mrr')
    ).filter(
        User.is_platform_owner == False,
        User.subscription_status == "active"
    ).group_by(User.subscription_tier).all()
    
    # Revenue trends
    revenue_trends = analytics_service.get_revenue_trends(period_days, breakdown)
    
    # Churn analysis
    churn_data = analytics_service.get_churn_analysis(period_days)
    
    # LTV calculations
    ltv_data = analytics_service.calculate_customer_ltv()
    
    return {
        "status": "success",
        "data": {
            "mrr_by_tier": [
                {
                    "tier": tier.subscription_tier,
                    "subscribers": tier.subscribers,
                    "mrr": float(tier.mrr or 0)
                }
                for tier in mrr_by_tier
            ],
            "revenue_trends": revenue_trends,
            "churn_analysis": churn_data,
            "ltv_metrics": ltv_data,
            "period": period,
            "breakdown": breakdown
        }
    }

@router.get("/usage")
@require_platform_owner("can_view_platform_analytics")
async def get_usage_analytics(
    metric_type: Optional[str] = Query(None),
    tenant_id: Optional[int] = Query(None),
    period: str = Query("30d"),
    current_user: User = Depends(get_platform_owner),
    db: Session = Depends(get_db)
):
    """Get detailed usage analytics across the platform"""
    
    period_days = {"1d": 1, "7d": 7, "30d": 30, "90d": 90, "1y": 365}[period]
    start_date = datetime.utcnow() - timedelta(days=period_days)
    
    query = db.query(PlatformUsageMetric).filter(
        PlatformUsageMetric.recorded_at >= start_date
    )
    
    if metric_type:
        query = query.filter(PlatformUsageMetric.metric_type == metric_type)
    
    if tenant_id:
        query = query.filter(PlatformUsageMetric.tenant_id == tenant_id)
    
    # Aggregate by metric type
    usage_summary = query.with_entities(
        PlatformUsageMetric.metric_type,
        PlatformUsageMetric.metric_name,
        func.count(PlatformUsageMetric.id).label('count'),
        func.sum(PlatformUsageMetric.metric_value).label('total_value'),
        func.avg(PlatformUsageMetric.metric_value).label('avg_value')
    ).group_by(
        PlatformUsageMetric.metric_type,
        PlatformUsageMetric.metric_name
    ).all()
    
    # Top features by usage
    top_features = db.query(
        PlatformUsageMetric.feature_name,
        func.count(PlatformUsageMetric.id).label('usage_count'),
        func.count(func.distinct(PlatformUsageMetric.tenant_id)).label('tenant_count')
    ).filter(
        PlatformUsageMetric.recorded_at >= start_date,
        PlatformUsageMetric.feature_name.isnot(None)
    ).group_by(PlatformUsageMetric.feature_name).order_by(
        func.count(PlatformUsageMetric.id).desc()
    ).limit(20).all()
    
    return {
        "status": "success",
        "data": {
            "usage_summary": [
                {
                    "metric_type": usage.metric_type,
                    "metric_name": usage.metric_name,
                    "count": usage.count,
                    "total_value": float(usage.total_value or 0),
                    "avg_value": float(usage.avg_value or 0)
                }
                for usage in usage_summary
            ],
            "top_features": [
                {
                    "feature_name": feature.feature_name,
                    "usage_count": feature.usage_count,
                    "tenant_count": feature.tenant_count
                }
                for feature in top_features
            ],
            "period": period,
            "filters": {
                "metric_type": metric_type,
                "tenant_id": tenant_id
            }
        }
    }
```

### **Phase 6: Database Migrations & Setup (Week 6)**

#### **6.1 Database Migration Scripts**
```python
# migrations/versions/001_platform_owner_infrastructure.py - Database Migration
"""Platform Owner Infrastructure

Revision ID: 001_platform_owner
Revises: base
Create Date: 2025-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '001_platform_owner'
down_revision = 'base'
branch_labels = None
depends_on = None

def upgrade():
    # Enhance users table
    op.add_column('users', sa.Column('is_platform_owner', sa.Boolean(), default=False, nullable=False))
    op.add_column('users', sa.Column('platform_owner_level', sa.Integer(), default=0))
    op.add_column('users', sa.Column('subscription_tier', sa.String(), default='free'))
    op.add_column('users', sa.Column('subscription_status', sa.String(), default='active'))
    op.add_column('users', sa.Column('subscription_expires', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('is_founding_member', sa.Boolean(), default=False))
    op.add_column('users', sa.Column('last_login', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('failed_login_attempts', sa.Integer(), default=0))
    op.add_column('users', sa.Column('account_locked_until', sa.DateTime(), nullable=True))
    op.add_column('users', sa.Column('password_changed_at', sa.DateTime(), default=sa.func.now()))
    op.add_column('users', sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
    
    # Enhance tenants table
    op.add_column('tenants', sa.Column('subscription_tier', sa.String(), default='free'))
    op.add_column('tenants', sa.Column('subscription_status', sa.String(), default='trial'))
    op.add_column('tenants', sa.Column('subscription_expires', sa.DateTime(), nullable=True))
    op.add_column('tenants', sa.Column('billing_email', sa.String(), nullable=True))
    op.add_column('tenants', sa.Column('created_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=False))
    op.add_column('tenants', sa.Column('managed_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
    op.add_column('tenants', sa.Column('max_users', sa.Integer(), default=1))
    op.add_column('tenants', sa.Column('max_storage_gb', sa.Integer(), default=1))
    op.add_column('tenants', sa.Column('max_api_calls_monthly', sa.Integer(), default=1000))
    op.add_column('tenants', sa.Column('current_users', sa.Integer(), default=0))
    op.add_column('tenants', sa.Column('current_storage_gb', sa.Float(), default=0.0))
    op.add_column('tenants', sa.Column('current_api_calls_monthly', sa.Integer(), default=0))
    op.add_column('tenants', sa.Column('last_activity', sa.DateTime(), default=sa.func.now()))
    
    # Create platform_roles table
    op.create_table('platform_roles',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('name', sa.String(), unique=True, nullable=False),
        sa.Column('level', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('can_create_tenants', sa.Boolean(), default=False),
        sa.Column('can_manage_all_tenants', sa.Boolean(), default=False),
        sa.Column('can_access_all_data', sa.Boolean(), default=False),
        sa.Column('can_modify_platform_settings', sa.Boolean(), default=False),
        sa.Column('can_view_platform_analytics', sa.Boolean(), default=False),
        sa.Column('can_manage_platform_users', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )
    
    # Create user_platform_roles table
    op.create_table('user_platform_roles',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('platform_role_id', sa.Integer(), sa.ForeignKey('platform_roles.id'), nullable=False),
        sa.Column('assigned_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('assigned_at', sa.DateTime(), default=sa.func.now())
    )
    
    # Create platform_usage_metrics table
    op.create_table('platform_usage_metrics',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('metric_type', sa.String(), nullable=False),
        sa.Column('metric_category', sa.String(), nullable=False),
        sa.Column('metric_name', sa.String(), nullable=False),
        sa.Column('metric_value', sa.Float(), nullable=False),
        sa.Column('metric_unit', sa.String(), nullable=True),
        sa.Column('tenant_id', sa.Integer(), sa.ForeignKey('tenants.id'), nullable=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('subscription_tier', sa.String(), nullable=True),
        sa.Column('feature_name', sa.String(), nullable=True),
        sa.Column('endpoint_path', sa.String(), nullable=True),
        sa.Column('recorded_at', sa.DateTime(), default=sa.func.now(), index=True),
        sa.Column('period_start', sa.DateTime(), nullable=True),
        sa.Column('period_end', sa.DateTime(), nullable=True)
    )
    
    # Create platform_health_metrics table
    op.create_table('platform_health_metrics',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('metric_name', sa.String(), nullable=False),
        sa.Column('current_value', sa.Float(), nullable=False),
        sa.Column('threshold_warning', sa.Float(), nullable=True),
        sa.Column('threshold_critical', sa.Float(), nullable=True),
        sa.Column('status', sa.String(), default='healthy'),
        sa.Column('service_name', sa.String(), nullable=True),
        sa.Column('component_name', sa.String(), nullable=True),
        sa.Column('measured_at', sa.DateTime(), default=sa.func.now(), index=True)
    )
    
    # Create tenant_analytics_summary table
    op.create_table('tenant_analytics_summary',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('tenant_id', sa.Integer(), sa.ForeignKey('tenants.id'), nullable=False),
        sa.Column('total_users', sa.Integer(), default=0),
        sa.Column('active_users_daily', sa.Integer(), default=0),
        sa.Column('active_users_weekly', sa.Integer(), default=0),
        sa.Column('active_users_monthly', sa.Integer(), default=0),
        sa.Column('total_api_calls', sa.Integer(), default=0),
        sa.Column('total_storage_gb', sa.Float(), default=0.0),
        sa.Column('total_features_used', sa.Integer(), default=0),
        sa.Column('avg_session_duration', sa.Float(), default=0.0),
        sa.Column('total_logins', sa.Integer(), default=0),
        sa.Column('feature_adoption_rate', sa.Float(), default=0.0),
        sa.Column('monthly_revenue', sa.Float(), default=0.0),
        sa.Column('lifetime_value', sa.Float(), default=0.0),
        sa.Column('summary_date', sa.Date(), default=sa.func.current_date(), index=True),
        sa.Column('created_at', sa.DateTime(), default=sa.func.now())
    )

def downgrade():
    # Drop new tables
    op.drop_table('tenant_analytics_summary')
    op.drop_table('platform_health_metrics')
    op.drop_table('platform_usage_metrics')
    op.drop_table('user_platform_roles')
    op.drop_table('platform_roles')
    
    # Remove columns from tenants
    op.drop_column('tenants', 'last_activity')
    op.drop_column('tenants', 'current_api_calls_monthly')
    op.drop_column('tenants', 'current_storage_gb')
    op.drop_column('tenants', 'current_users')
    op.drop_column('tenants', 'max_api_calls_monthly')
    op.drop_column('tenants', 'max_storage_gb')
    op.drop_column('tenants', 'max_users')
    op.drop_column('tenants', 'managed_by')
    op.drop_column('tenants', 'created_by')
    op.drop_column('tenants', 'billing_email')
    op.drop_column('tenants', 'subscription_expires')
    op.drop_column('tenants', 'subscription_status')
    op.drop_column('tenants', 'subscription_tier')
    
    # Remove columns from users
    op.drop_column('users', 'created_by')
    op.drop_column('users', 'password_changed_at')
    op.drop_column('users', 'account_locked_until')
    op.drop_column('users', 'failed_login_attempts')
    op.drop_column('users', 'last_login')
    op.drop_column('users', 'is_founding_member')
    op.drop_column('users', 'subscription_expires')
    op.drop_column('users', 'subscription_status')
    op.drop_column('users', 'subscription_tier')
    op.drop_column('users', 'platform_owner_level')
    op.drop_column('users', 'is_platform_owner')
```

#### **6.2 Initial Data Setup Script**
```python
# scripts/setup_platform_owner.py - Initial Platform Owner Setup
"""
Script to set up the initial Platform Owner and platform roles
Run this after database migration to bootstrap the platform
"""

from sqlalchemy.orm import Session
from digame.app.database import get_db
from digame.app.models.user import User
from digame.app.models.platform_roles import PlatformRole, UserPlatformRole
from digame.app.auth.password import get_password_hash
import os
from datetime import datetime

def create_platform_roles(db: Session):
    """Create the standard platform roles"""
    
    roles = [
        {
            "name": "Platform Admin",
            "level": 1,
            "description": "Basic platform administration access",
            "can_view_platform_analytics": True,
            "can_manage_platform_users": False,
            "can_create_tenants": False,
            "can_manage_all_tenants": False,
            "can_access_all_data": False,
            "can_modify_platform_settings": False
        },
        {
            "name": "Platform Super Admin",
            "level": 2,
            "description": "Advanced platform administration with tenant management",
            "can_view_platform_analytics": True,
            "can_manage_platform_users": True,
            "can_create_tenants": True,
            "can_manage_all_tenants": True,
            "can_access_all_data": True,
            "can_modify_platform_settings": False
        },
        {
            "name": "Platform Owner",
            "level": 3,
            "description": "Full platform ownership with all permissions",
            "can_view_platform_analytics": True,
            "can_manage_platform_users": True,
            "can_create_tenants": True,
            "can_manage_all_tenants": True,
            "can_access_all_data": True,
            "can_modify_platform_settings": True
        }
    ]
    
    for role_data in roles:
        existing_role = db.query(PlatformRole).filter(PlatformRole.name == role_data["name"]).first()
        if not existing_role:
            role = PlatformRole(**role_data)
            db.add(role)
            print(f"Created platform role: {role_data['name']}")
    
    db.commit()

def create_initial_platform_owner(db: Session):
    """Create the initial platform owner"""
    
    # Get credentials from environment or prompt
    email = os.getenv("PLATFORM_OWNER_EMAIL")
    password = os.getenv("PLATFORM_OWNER_PASSWORD")
    
    if not email or not password:
        print("Please set PLATFORM_OWNER_EMAIL and PLATFORM_OWNER_PASSWORD environment variables")
        return None
    
    # Check if platform owner already exists
    existing_owner = db.query(User).filter(
        User.email == email,
        User.is_platform_owner == True
    ).first()
    
    if existing_owner:
        print(f"Platform owner {email} already exists")
        return existing_owner
    
    # Create platform owner
    hashed_password = get_password_hash(password)
    
    platform_owner = User(
        email=email,
        username=email.split('@')[0],
        hashed_password=hashed_password,
        is_platform_owner=True,
        platform_owner_level=3,
        tenant_id=None,  # Platform owners don't belong to tenants
        subscription_tier="platform_owner",
        subscription_status="active",
        created_at=datetime.utcnow()
    )
    
    db.add(platform_owner)
    db.commit()
    db.refresh(platform_owner)
    
    # Assign Platform Owner role
    platform_owner_role = db.query(PlatformRole).filter(PlatformRole.level == 3).first()
    if platform_owner_role:
        user_role = UserPlatformRole(
            user_id=platform_owner.id,
            platform_role_id=platform_owner_role.id,
            assigned_by=platform_owner.id  # Self-assigned
        )
        db.add(user_role)
        db.commit()
    
    print(f"Created initial platform owner: {email}")
    return platform_owner

def main():
    """Main setup function"""
    db = next(get_db())
    
    try:
        print("Setting up Platform Owner infrastructure...")
        
        # Create platform roles
        create_platform_roles(db)
        
        # Create initial platform owner
        platform_owner = create_initial_platform_owner(db)
        
        if platform_owner:
            print(f"\n✅ Platform Owner setup complete!")
            print(f"Email: {platform_owner.email}")
            print(f"Platform Owner Level: {platform_owner.platform_owner_level}")
            print(f"Created at: {platform_owner.created_at}")
            print(f"\n🔐 You can now log in with the Platform Owner credentials")
            print(f"🎯 Access platform management at: /platform/overview")
        
    except Exception as e:
        print(f"❌ Error during setup: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
```

---

## 🚀 Implementation Timeline & Next Steps

### **Immediate Actions (This Week)**

1. **Run Database Migration**
   ```bash
   # Apply the platform owner infrastructure migration
   alembic upgrade head
   ```

2. **Set Up Initial Platform Owner**
   ```bash
   # Set environment variables
   export PLATFORM_OWNER_EMAIL="your-email@domain.com"
   export PLATFORM_OWNER_PASSWORD="secure-password"
   
   # Run setup script
   python scripts/setup_platform_owner.py
   ```

3. **Test Platform Owner Authentication**
   - Log in with Platform Owner credentials
   - Verify access to `/platform/overview` endpoint
   - Test tenant creation and management

### **Week 1-2: Core Infrastructure**
- ✅ Enhanced User and Tenant models
- ✅ Platform Owner role system
- ✅ Enhanced JWT authentication
- ✅ Database migrations

### **Week 3-4: Analytics & Monitoring**
- ✅ Platform analytics infrastructure
- ✅ Usage metrics collection
- ✅ Health monitoring system
- ✅ Comprehensive reporting

### **Week 5-6: API & Integration**
- ✅ Platform management endpoints
- ✅ Analytics dashboard APIs
- ✅ Enhanced authorization middleware
- ✅ Testing

### **Week 7-8: ACO Integration**
- Integrate with existing ACO.md plan
- Implement subscription tier enforcement
- Launch founding member program
- Begin revenue generation

---

## 🎯 Key Benefits

### **For Platform Owner**
1. **Complete Control**: Supreme
access to all platform data and functionality
2. **Comprehensive Analytics**: Real-time insights into platform performance, user behavior, and revenue metrics
3. **Tenant Management**: Create, modify, and manage all tenant organizations
4. **Revenue Visibility**: Track MRR, churn, LTV, and subscription metrics
5. **Security Oversight**: Monitor authentication events, failed logins, and security threats

### **For Tenants**
1. **Data Isolation**: Complete separation from other tenant organizations
2. **Subscription Flexibility**: Clear tier-based feature access and limits
3. **Usage Transparency**: Visibility into their own usage metrics and limits
4. **Scalable Growth**: Easy upgrade paths as organizations grow

### **For Platform Security**
1. **Enhanced Authentication**: Multi-level security with account lockouts and monitoring
2. **Audit Trails**: Complete logging of all authentication and authorization events
3. **Role-Based Access**: Granular permissions based on platform roles
4. **Threat Detection**: Monitoring for suspicious authentication patterns

---

## 🔧 Technical Implementation Details

### **Authentication Flow**
```mermaid
sequenceDiagram
    participant U as User
    participant A as Auth Service
    participant P as Platform Service
    participant D as Database
    
    U->>A: Login Request
    A->>D: Validate Credentials
    D-->>A: User + Platform Roles
    A->>A: Generate JWT with Platform Context
    A-->>U: JWT Token
    
    U->>P: API Request + JWT
    P->>P: Validate JWT
    P->>P: Check Platform Permissions
    P->>P: Check Tenant Access
    P-->>U: Response
```

### **Platform Owner Hierarchy**
```
Platform Owner (Level 3)
├── Full platform access
├── All tenant management
├── Platform settings control
└── Complete analytics access

Platform Super Admin (Level 2)
├── Tenant management
├── User management
├── Analytics access
└── No platform settings

Platform Admin (Level 1)
├── Analytics access only
└── Read-only permissions
```

### **Subscription Tier Enforcement**
```python
# Example of tier-based feature gating
@router.post("/ai/advanced-analytics")
@require_subscription_tier("team")
async def advanced_analytics(current_user: User = Depends(get_current_user)):
    # Only Team and Enterprise tiers can access
    pass

@router.post("/integrations/custom")
@require_subscription_tier("enterprise")
async def custom_integrations(current_user: User = Depends(get_current_user)):
    # Only Enterprise tier can access
    pass
```

---

## 📊 Analytics & Monitoring

### **Key Metrics Tracked**
1. **User Metrics**: Registration, activation, retention, churn
2. **Usage Metrics**: API calls, feature usage, session duration
3. **Revenue Metrics**: MRR, ARR, LTV, churn rate
4. **Performance Metrics**: Response times, error rates, uptime
5. **Security Metrics**: Failed logins, suspicious activity, account lockouts

### **Dashboard Components**
1. **Platform Overview**: High-level KPIs and health status
2. **Tenant Analytics**: Detailed per-tenant usage and performance
3. **Revenue Dashboard**: Financial metrics and projections
4. **Usage Analytics**: Feature adoption and API usage patterns
5. **Security Dashboard**: Authentication events and threat monitoring

---

## 🔒 Security Considerations

### **Enhanced Security Features**
1. **Account Lockout**: Automatic lockout after failed login attempts
2. **Password Policies**: Strong password requirements and rotation
3. **Session Management**: Secure JWT tokens with proper expiration
4. **Audit Logging**: Complete audit trail of all authentication events
5. **Threat Monitoring**: Detection of suspicious authentication patterns

### **Platform Owner Security**
1. **Multi-Factor Authentication**: Required for Platform Owner accounts
2. **IP Restrictions**: Optional IP whitelisting for Platform Owner access
3. **Session Monitoring**: Real-time monitoring of Platform Owner sessions
4. **Emergency Access**: Secure emergency access procedures

---

## 🚀 Deployment & Operations

### **Environment Setup**
```bash
# Production environment variables
export PLATFORM_OWNER_EMAIL="owner@digame.com"
export PLATFORM_OWNER_PASSWORD="secure-platform-password"
export JWT_SECRET_KEY="your-secure-jwt-secret"
export DATABASE_URL="postgresql://user:pass@host:port/db"

# Optional security enhancements
export PLATFORM_OWNER_MFA_ENABLED="true"
export PLATFORM_OWNER_IP_WHITELIST="192.168.1.0/24"
export SESSION_TIMEOUT_HOURS="2"
```

### **Monitoring & Alerts**
1. **Health Checks**: Automated health monitoring for all services
2. **Performance Alerts**: Alerts for response time degradation
3. **Security Alerts**: Immediate alerts for security events
4. **Usage Alerts**: Notifications for usage limit approaches

---

## 📋 Testing Strategy

### **Authentication Testing**
1. **Unit Tests**: Test all authentication functions and decorators
2. **Integration Tests**: Test complete authentication flows
3. **Security Tests**: Test security features and edge cases
4. **Performance Tests**: Test authentication performance under load

### **Platform Owner Testing**
1. **Access Control Tests**: Verify Platform Owner permissions
2. **Tenant Management Tests**: Test tenant creation and management
3. **Analytics Tests**: Verify analytics data accuracy
4. **Security Tests**: Test Platform Owner security features

---

## 🎯 Success Criteria

### **Phase 1 Success Metrics**
- ✅ Platform Owner can authenticate successfully
- ✅ Platform Owner can access all tenant data
- ✅ Enhanced security features are operational
- ✅ Database migrations completed successfully

### **Phase 2 Success Metrics**
- ✅ Analytics infrastructure collecting data
- ✅ Platform health monitoring operational
- ✅ Usage metrics being tracked accurately
- ✅ Performance within acceptable thresholds

### **Phase 3 Success Metrics**
- ✅ All Platform Owner APIs functional
- ✅ Analytics dashboard displaying data
- ✅ Tenant management working correctly
- ✅ Security monitoring operational

---

## 🔄 Integration with ACO Plan

### **Seamless ACO Integration**
Once the Platform Owner infrastructure is complete, the ACO plan implementation becomes straightforward:

1. **Subscription Management**: Platform Owner can manage all tenant subscriptions
2. **Feature Gating**: Tier-based access controls are enforced automatically
3. **Revenue Tracking**: All subscription revenue is tracked and reported
4. **User Management**: Platform Owner can manage users across all tiers

### **ACO Implementation Timeline**
```
Week 1-6: Platform Owner Infrastructure (This Document)
Week 7-8: ACO Plan Implementation (docs/ACO.md)
Week 9-10: Founding Member Program Launch
Week 11-12: Public Launch with Full Tier System
```

---

## 📞 Support & Maintenance

### **Ongoing Maintenance**
1. **Regular Security Updates**: Keep authentication libraries updated
2. **Performance Monitoring**: Continuous monitoring of authentication performance
3. **Analytics Review**: Regular review of platform analytics and metrics
4. **User Feedback**: Incorporate user feedback for improvements

### **Emergency Procedures**
1. **Platform Owner Account Recovery**: Secure recovery procedures
2. **Security Incident Response**: Immediate response to security threats
3. **System Outage Response**: Rapid response to authentication outages
4. **Data Breach Response**: Comprehensive data breach response plan

---

## 🎉 Conclusion

The Platform Owner authentication infrastructure provides the foundation for successful ACO implementation and platform monetization. With comprehensive analytics, robust security, and hierarchical access control, the platform is ready to scale from startup to enterprise.

**Next Steps:**
1. ✅ Complete Platform Owner infrastructure implementation
2. 🎯 Integrate with ACO plan for subscription management
3. 🚀 Launch founding member program
4. 💰 Begin revenue generation

This infrastructure ensures the platform can grow sustainably while maintaining security, performance, and user experience standards.