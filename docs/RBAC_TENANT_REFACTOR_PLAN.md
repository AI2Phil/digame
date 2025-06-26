# RBAC Tenant Architecture Refactor Plan

## Executive Summary

This document outlines a comprehensive plan to resolve the architectural conflicts between the existing RBAC system and the multi-tenant architecture, fix remaining test issues, and re-enable all disabled features.

## Current State Analysis

### Existing RBAC System
- Uses many-to-many table approach (`user_roles_table`, `role_permissions_table`)
- Models: `User`, `Role`, `Permission`
- No explicit `UserRole` model class
- Simple, flat structure without tenant awareness

### Tenant System Conflicts
- `TenantService` expects a `UserRole` model class (doesn't exist)
- `tenant.py` originally redefined `User` and `Role` models (conflicts with existing models)
- 48+ models reference `tenants.id` foreign keys but can't create tables due to conflicts
- Tenant-aware RBAC requires different relationship patterns

### Test Issues
- Mock models missing required attributes
- Foreign key constraint failures during table creation
- Temporarily disabled models and routers

## Strategic Decision: Option A - Create UserRole Model Class

**Recommendation**: Create a `UserRole` model class to bridge the existing many-to-many approach with tenant-aware functionality.

### Rationale
1. **Minimal Disruption**: Preserves existing RBAC functionality
2. **Backward Compatibility**: Existing code continues to work
3. **Tenant Integration**: Enables tenant-aware role assignments
4. **Service Compatibility**: Matches `TenantService` expectations
5. **Scalability**: Supports future multi-tenant features

## Phase 1: RBAC Model Refactoring

### 1.1 Create Enhanced UserRole Model
```python
# app/models/rbac.py - ADD to existing file

class UserRole(Base):
    """
    Enhanced UserRole model for tenant-aware role assignments
    Replaces the simple many-to-many table approach
    """
    __tablename__ = "user_roles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False, index=True)
    
    # Tenant support
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True, index=True)
    
    # Assignment tracking
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="user_roles")
    role = relationship("Role", back_populates="user_roles")
    assigner = relationship("User", foreign_keys=[assigned_by])
    
    # Unique constraint: user can have role only once per tenant
    __table_args__ = (
        UniqueConstraint('user_id', 'role_id', 'tenant_id', name='unique_user_role_tenant'),
    )
```

### 1.2 Update Existing Models

#### User Model Updates
```python
# app/models/user.py - UPDATE relationships

# REPLACE existing roles relationship:
roles = relationship(
    "Role",
    secondary="user_roles", 
    back_populates="users"
)

# WITH:
user_roles = relationship("UserRole", foreign_keys="UserRole.user_id", back_populates="user")
roles = association_proxy("user_roles", "role")  # Maintains backward compatibility
```

#### Role Model Updates
```python
# app/models/rbac.py - UPDATE Role class

# ADD to Role class:
user_roles = relationship("UserRole", back_populates="role")
users = association_proxy("user_roles", "user")  # Maintains backward compatibility
```

### 1.3 Migration Strategy
```python
# Create migration script: migrations/add_user_role_model.py

def upgrade():
    # 1. Create new user_roles table with enhanced structure
    # 2. Migrate data from old user_roles_table to new UserRole model
    # 3. Drop old user_roles_table
    # 4. Update foreign key constraints
```

## Phase 2: Tenant Model Integration

### 2.1 Clean Up Tenant Models
```python
# app/models/tenant.py - REMOVE conflicting model definitions

# REMOVE: User, Role, UserRole class definitions (lines 56-142)
# KEEP: Tenant, TenantSettings, TenantInvitation, TenantAuditLog
```

### 2.2 Add Tenant Relationships to Existing Models
```python
# app/models/user.py - ADD tenant support

class User(Base):
    # ... existing fields ...
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True, index=True)
    
    # ... existing relationships ...
    tenant = relationship("Tenant", back_populates="users")

# app/models/rbac.py - ADD tenant support to Role

class Role(Base):
    # ... existing fields ...
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True, index=True)
    
    # ... existing relationships ...
    tenant = relationship("Tenant", back_populates="roles")
```

### 2.3 Update Tenant Model
```python
# app/models/tenant.py - ADD back relationships

class Tenant(Base):
    # ... existing fields ...
    
    # Relationships
    users = relationship("User", back_populates="tenant")
    roles = relationship("Role", back_populates="tenant")
    user_roles = relationship("UserRole", back_populates="tenant")
    # ... other existing relationships ...
```

## Phase 3: Service Layer Updates

### 3.1 Update TenantService
```python
# app/services/tenant_service.py - UPDATE imports and methods

# UPDATE imports:
from ..models.tenant import Tenant, TenantSettings, TenantInvitation, TenantAuditLog
from ..models.user import User
from ..models.rbac import Role, UserRole  # Now imports the model class

# UPDATE methods to use UserRole model class instead of table operations
# All existing UserRole references will now work correctly
```

### 3.2 Create RBAC Service Enhancement
```python
# app/services/rbac_service.py - NEW file

class RBACService:
    """Enhanced RBAC service with tenant awareness"""
    
    def assign_role_to_user(self, user_id: int, role_id: int, tenant_id: int = None, assigned_by: int = None):
        """Assign role to user with optional tenant scoping"""
        
    def get_user_roles(self, user_id: int, tenant_id: int = None):
        """Get user roles, optionally filtered by tenant"""
        
    def check_permission(self, user_id: int, permission: str, tenant_id: int = None):
        """Check if user has permission, with tenant context"""
```

## Phase 4: Test Infrastructure Fixes

### 4.1 Fix Mock Model Creation
```python
# tests/conftest.py - CREATE enhanced mock factory

def create_mock_model(model_class, **kwargs):
    """Create properly structured mock models with all required attributes"""
    
    # For UserRole models
    if model_class.__name__ == 'UserRole':
        defaults = {
            'id': 1,
            'user_id': 1,
            'role_id': 1,
            'tenant_id': None,
            'assigned_at': datetime.utcnow(),
            'is_active': True
        }
        
    # For BehavioralModel models  
    elif model_class.__name__ == 'BehavioralModel':
        defaults = {
            'id': 1,
            'name': 'Test Model',
            'version': '1.0',
            'user_id': 1,
            'created_at': datetime.utcnow()
        }
        
    # For ProcessNote models
    elif model_class.__name__ == 'ProcessNote':
        defaults = {
            'id': 1,
            'occurrence_count': 1,
            'first_observed_at': datetime.utcnow(),
            'last_observed_at': datetime.utcnow(),
            'source_activity_ids': []
        }
    
    # Merge with provided kwargs
    final_kwargs = {**defaults, **kwargs}
    return model_class(**final_kwargs)
```

### 4.2 Update Test Files
```python
# tests/services/test_process_note_service.py - UPDATE mock creation

# REPLACE:
def create_mock_activity(id: int, user_id: int, activity_type: str, timestamp: datetime, details: dict = None) -> Activity:

# WITH:
def create_mock_activity(id: int, user_id: int, activity_type: str, timestamp: datetime, details: dict = None) -> Activity:
    if details is None:
        details = {}
    return create_mock_model(Activity, id=id, user_id=user_id, activity_type=activity_type, timestamp=timestamp, details=details)
```

### 4.3 Fix Admin RBAC Router Tests
```python
# tests/routers/test_admin_rbac_router.py - UPDATE to use UserRole model

# UPDATE imports:
from app.models.rbac import Role, Permission, UserRole

# UPDATE test fixtures to create UserRole instances instead of using table operations
```

## Phase 5: Re-enable Disabled Features

### 5.1 Re-enable Model Imports
```python
# app/models/__init__.py - RESTORE imports

from .comparative_benchmark import ComparativeBenchmark
from .dashboard_custom import AnalyticsDashboard, DashboardWidget, ReportDefinition
from .enterprise_sso import TenantSSOConfiguration

# ADD to __all__:
"ComparativeBenchmark",
"AnalyticsDashboard", 
"DashboardWidget",
"ReportDefinition",
"TenantSSOConfiguration",
"UserRole",  # NEW
```

### 5.2 Re-enable Tenant Router
```python
# app/main.py - RESTORE tenant router

from .routers import tenant_router
app.include_router(tenant_router.router, tags=["Tenant Management"])
```

### 5.3 Update Enterprise SSO Models
```python
# app/models/enterprise_sso.py - FIX metadata column name (already done)
# Ensure provider_metadata is used instead of metadata
```

## Phase 6: Database Migration

### 6.1 Create Migration Scripts
```sql
-- Migration: 001_add_tenant_support.sql

-- Add tenant_id to users table
ALTER TABLE users ADD COLUMN tenant_id INTEGER REFERENCES tenants(id);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);

-- Add tenant_id to roles table  
ALTER TABLE roles ADD COLUMN tenant_id INTEGER REFERENCES tenants(id);
CREATE INDEX idx_roles_tenant_id ON roles(tenant_id);

-- Create new user_roles table with enhanced structure
CREATE TABLE user_roles_new (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    role_id INTEGER NOT NULL REFERENCES roles(id),
    tenant_id INTEGER REFERENCES tenants(id),
    assigned_by INTEGER REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, role_id, tenant_id)
);

-- Migrate data from old user_roles table
INSERT INTO user_roles_new (user_id, role_id, assigned_at)
SELECT user_id, role_id, NOW() FROM user_roles;

-- Drop old table and rename new one
DROP TABLE user_roles;
ALTER TABLE user_roles_new RENAME TO user_roles;
```

## Phase 7: Testing and Validation

### 7.1 Test Categories
1. **Unit Tests**: Individual model and service tests
2. **Integration Tests**: RBAC + Tenant interaction tests  
3. **API Tests**: Router and endpoint tests
4. **Migration Tests**: Database schema migration validation

### 7.2 Test Scenarios
```python
# Key test scenarios to validate:

def test_tenant_scoped_role_assignment():
    """Test that roles can be assigned per tenant"""
    
def test_cross_tenant_permission_isolation():
    """Test that permissions don't leak across tenants"""
    
def test_backward_compatibility():
    """Test that existing RBAC code still works"""
    
def test_migration_data_integrity():
    """Test that data migration preserves all relationships"""
```

## Phase 8: Documentation and Cleanup

### 8.1 Update Documentation
- API documentation for new tenant-aware endpoints
- Database schema documentation
- Migration guide for existing deployments
- Developer guide for tenant-aware development

### 8.2 Code Cleanup
- Remove temporary workarounds and commented code
- Update type hints and docstrings
- Optimize database queries for tenant filtering
- Add proper error handling for tenant context

## Implementation Timeline

### Week 1: Foundation
- [ ] Phase 1: RBAC Model Refactoring
- [ ] Phase 2: Tenant Model Integration
- [ ] Create and test database migrations

### Week 2: Services and Tests  
- [ ] Phase 3: Service Layer Updates
- [ ] Phase 4: Test Infrastructure Fixes
- [ ] Validate all tests pass

### Week 3: Feature Re-enablement
- [ ] Phase 5: Re-enable Disabled Features
- [ ] Phase 6: Database Migration (staging)
- [ ] Integration testing

### Week 4: Production Readiness
- [ ] Phase 7: Testing and Validation
- [ ] Phase 8: Documentation and Cleanup
- [ ] Production deployment planning

## Risk Mitigation

### High-Risk Areas
1. **Data Migration**: Risk of data loss during user_roles table migration
2. **Backward Compatibility**: Risk of breaking existing RBAC functionality
3. **Performance**: Risk of query performance degradation with tenant filtering

### Mitigation Strategies
1. **Comprehensive Backup**: Full database backup before migration
2. **Staged Rollout**: Deploy to staging environment first
3. **Feature Flags**: Use feature flags to enable tenant features gradually
4. **Rollback Plan**: Detailed rollback procedures for each phase
5. **Performance Testing**: Load testing with tenant-scoped queries

## Success Criteria

### Technical Metrics
- [ ] All tests passing (100% test suite success)
- [ ] No breaking changes to existing RBAC API
- [ ] Database migration completes without data loss
- [ ] Query performance within 10% of baseline

### Functional Metrics
- [ ] Tenant-scoped role assignments working
- [ ] Cross-tenant permission isolation verified
- [ ] All previously disabled features re-enabled
- [ ] Admin RBAC router tests passing

## Conclusion

This refactor plan provides a comprehensive approach to resolving the RBAC/Tenant architecture conflicts while maintaining backward compatibility and enabling full multi-tenant functionality. The phased approach minimizes risk and allows for validation at each step.

The key innovation is the creation of a `UserRole` model class that bridges the existing many-to-many approach with tenant-aware functionality, providing the best of both worlds: simplicity for single-tenant use cases and full multi-tenant support when needed.