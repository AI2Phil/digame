# SQLAlchemy 2.0 Migration Checklist

## 📋 Pre-Migration Checklist

### Environment Preparation
- [ ] **Backup Database**: Create full database backup before migration
- [ ] **Test Environment**: Set up isolated test environment
- [ ] **Dependencies**: Update SQLAlchemy to 2.0+ in requirements.txt
- [ ] **Documentation**: Review current codebase for deprecated patterns

### Code Analysis
- [ ] **Search for `datetime.utcnow()`**: Find all instances across codebase
- [ ] **Search for `declarative_base()`**: Identify multiple Base class definitions
- [ ] **Review Model Files**: Check for timestamp column defaults
- [ ] **Check Import Statements**: Identify deprecated SQLAlchemy imports

---

## 🔧 Migration Steps

### Step 1: Update Base Class
- [ ] **Create Unified Base**: Update `app/database.py` with `DeclarativeBase`
```python
# ✅ New pattern
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass
```

- [ ] **Update Model Imports**: Change all model files to import unified Base
```python
# ✅ Update all models
from app.database import Base
```

- [ ] **Remove Old Base Classes**: Delete standalone `declarative_base()` instances

### Step 2: DateTime Migration
- [ ] **Add Timezone Import**: Add `timezone` to datetime imports
```python
# ✅ Update imports
from datetime import datetime, timezone
```

- [ ] **Replace `datetime.utcnow()`**: Update all instances
```python
# ❌ Old pattern
datetime.utcnow()

# ✅ New pattern  
datetime.now(timezone.utc)
```

- [ ] **Update Column Defaults**: Fix timestamp column defaults
```python
# ✅ New pattern
created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
```

### Step 3: Service Layer Updates
- [ ] **Authentication Services**: Update JWT token generation
- [ ] **Analytics Services**: Update event logging timestamps
- [ ] **Business Logic**: Update all datetime operations
- [ ] **API Endpoints**: Update response timestamps

### Step 4: Script Updates
- [ ] **Database Scripts**: Update migration and setup scripts
- [ ] **Utility Scripts**: Update data processing scripts
- [ ] **Test Scripts**: Update testing and demo scripts

---

## ✅ Validation Checklist

### Code Validation
- [ ] **No Deprecation Warnings**: Run application and check logs
- [ ] **Import Validation**: Verify all imports resolve correctly
- [ ] **Type Checking**: Run mypy or similar type checker
- [ ] **Linting**: Run flake8/pylint to catch issues

### Functional Testing
- [ ] **Database Operations**: Test CRUD operations
- [ ] **Authentication**: Test login/logout flows
- [ ] **API Endpoints**: Test all API responses
- [ ] **Background Tasks**: Test scheduled operations

### Performance Testing
- [ ] **Query Performance**: Verify no performance regression
- [ ] **Memory Usage**: Check for memory leaks
- [ ] **Connection Pooling**: Verify database connections
- [ ] **Response Times**: Measure API response times

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] **Model Tests**: Test model creation and relationships
- [ ] **Service Tests**: Test business logic functions
- [ ] **CRUD Tests**: Test database operations
- [ ] **DateTime Tests**: Verify timezone handling

### Integration Tests
- [ ] **API Tests**: Test complete request/response cycles
- [ ] **Database Tests**: Test with real database
- [ ] **Authentication Tests**: Test auth flows
- [ ] **Migration Tests**: Test database migrations

### End-to-End Tests
- [ ] **User Workflows**: Test complete user journeys
- [ ] **Admin Functions**: Test administrative operations
- [ ] **Data Processing**: Test batch operations
- [ ] **Reporting**: Test analytics and reports

---

## 📊 File-by-File Checklist

### Core Services (Priority 1)
- [ ] `app/services/enhanced_jwt_service.py`
- [ ] `app/services/rbac_service.py`
- [ ] `app/services/security_service.py`
- [ ] `app/services/analytics_service.py`
- [ ] `app/services/notification_service.py`

### Business Logic (Priority 2)
- [ ] `app/services/enterprise_dashboard_service.py`
- [ ] `app/services/workflow_automation_service.py`
- [ ] `app/services/integration_service.py`
- [ ] `app/services/reporting_service_part1.py`
- [ ] `app/services/reporting_service_part2.py`

### Advanced Features (Priority 3)
- [ ] `app/services/digital_twin_engine.py`
- [ ] `app/services/advanced_analytics.py`
- [ ] `app/services/market_intelligence_service.py`
- [ ] `app/services/career_path_modeling_service.py`

### Supporting Services (Priority 4)
- [ ] `app/services/gamification_service.py`
- [ ] `app/services/mentorship_service.py`
- [ ] `app/services/guest_user_service.py`
- [ ] `app/services/performance_monitoring_service.py`

### Model Files
- [ ] `app/database.py` - Primary Base class
- [ ] `app/models/reporting.py`
- [ ] `app/models/analytics.py`
- [ ] `app/models/sso.py`
- [ ] `app/models/twin_phase5.py`
- [ ] `app/models/twin_phase4.py`
- [ ] `app/models/market_intelligence.py`

### Scripts and Utilities
- [ ] `scripts/create_platform_owner.py`
- [ ] `scripts/setup_platform_owner.py`
- [ ] `scripts/seed_demo_users.py`
- [ ] `scripts/create_simple_platform_owner.py`
- [ ] `main.py`

---

## 🔍 Common Issues and Solutions

### Issue: Deprecation Warnings
**Symptoms**: `datetime.utcnow()` warnings in logs
**Solution**: Replace with `datetime.now(timezone.utc)`

### Issue: Import Errors
**Symptoms**: `ModuleNotFoundError` for SQLAlchemy imports
**Solution**: Update to SQLAlchemy 2.0 compatible imports

### Issue: Base Class Conflicts
**Symptoms**: Metadata conflicts between models
**Solution**: Use single unified Base class from `app.database`

### Issue: Timezone Errors
**Symptoms**: Naive datetime warnings or comparison errors
**Solution**: Always use timezone-aware datetimes

### Issue: Column Default Errors
**Symptoms**: Same timestamp for all records
**Solution**: Use lambda functions for column defaults

---

## 📈 Success Metrics

### Technical Metrics
- [ ] **Zero Deprecation Warnings**: No SQLAlchemy warnings in logs
- [ ] **All Tests Pass**: 100% test suite success rate
- [ ] **Performance Maintained**: No significant performance regression
- [ ] **Type Safety**: Clean mypy/type checker results

### Functional Metrics
- [ ] **Feature Parity**: All existing features work correctly
- [ ] **Data Integrity**: No data corruption or loss
- [ ] **API Compatibility**: All endpoints respond correctly
- [ ] **User Experience**: No user-facing issues

### Operational Metrics
- [ ] **Deployment Success**: Clean deployment to all environments
- [ ] **Monitoring**: All monitoring and alerting functional
- [ ] **Backup/Restore**: Database operations work correctly
- [ ] **Documentation**: Complete and accurate documentation

---

## 🚀 Post-Migration Tasks

### Code Quality
- [ ] **Code Review**: Peer review of all changes
- [ ] **Documentation Update**: Update technical documentation
- [ ] **Style Guide**: Update coding standards
- [ ] **Training**: Team training on SQLAlchemy 2.0

### Monitoring
- [ ] **Error Tracking**: Monitor for new error patterns
- [ ] **Performance Monitoring**: Track query performance
- [ ] **Log Analysis**: Review application logs
- [ ] **User Feedback**: Monitor user reports

### Maintenance
- [ ] **Dependency Updates**: Keep SQLAlchemy updated
- [ ] **Security Review**: Review security implications
- [ ] **Backup Strategy**: Update backup procedures
- [ ] **Disaster Recovery**: Test recovery procedures

---

## 📚 Resources

### Documentation
- [SQLAlchemy 2.0 User Guide](./SQLALCHEMY_2_USER_GUIDE.md)
- [Quick Reference](./SQLALCHEMY_2_QUICK_REFERENCE.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

### External Resources
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)
- [Migration Guide](https://docs.sqlalchemy.org/en/20/changelog/migration_20.html)
- [What's New in 2.0](https://docs.sqlalchemy.org/en/20/changelog/whatsnew_20.html)

### Tools
- **Search Commands**:
  ```bash
  # Find datetime.utcnow() usage
  grep -r "datetime.utcnow()" app/
  
  # Find declarative_base usage
  grep -r "declarative_base" app/
  
  # Find timezone imports
  grep -r "from datetime import.*timezone" app/
  ```

- **Validation Commands**:
  ```bash
  # Run tests
  python -m pytest
  
  # Check for deprecation warnings
  python -W error::DeprecationWarning main.py
  
  # Type checking
  mypy app/
  ```

---

## ✅ Migration Complete

When all items in this checklist are complete:

1. **Zero deprecation warnings** in application logs
2. **All tests passing** in test suite
3. **Documentation updated** with new patterns
4. **Team trained** on SQLAlchemy 2.0 usage
5. **Monitoring confirmed** all systems operational

**🎉 Congratulations! Your SQLAlchemy 2.0 migration is complete.**

---

*Last Updated: January 2025*
*Based on Digame Platform Migration Experience*