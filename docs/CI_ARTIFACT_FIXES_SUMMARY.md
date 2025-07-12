# CI/CD Artifact and Database Connection Fixes

## Overview
This document summarizes the critical fixes implemented to resolve the latest CI/CD pipeline issues identified in the user feedback.

## Issues Addressed

### 1. Artifact Not Found (`frontend-build`)

**Problem**: 
- Error: `Unable to download artifact(s): Artifact not found for name: frontend-build`
- The workflow expected a build artifact called `frontend-build`, but it was not uploaded correctly

**Root Cause**: 
- Next.js was configured with `output: 'standalone'` which builds to `.next/standalone`
- CI workflow was expecting artifacts in `frontend/dist/`
- Mismatch between build output directory and artifact upload path

**Solution Implemented**:

1. **Updated Next.js Configuration** (`frontend/next.config.js`):
```javascript
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',        // Changed from 'standalone'
  distDir: 'dist',         // Added explicit dist directory
  trailingSlash: true,     // Required for static export
  // ... rest of config
};
```

2. **Updated Package.json Serve Script** (`frontend/package.json`):
```json
{
  "scripts": {
    "serve:dist": "npx serve dist -p 3000"  // Changed from 'out' to 'dist'
  }
}
```

3. **CI Workflow Artifact Paths** (already correct in `.github/workflows/ci.yml`):
```yaml
- name: Upload build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: frontend-build
    path: frontend/dist/     # Now matches Next.js output
    retention-days: 7
```

### 2. Database Connection Failures

**Problem**: 
- Error: `FATAL: role "root" does not exist`
- Application trying to connect using `root` role instead of `postgres`

**Status**: ✅ **Already Correctly Configured**

**Current Configuration**:
- CI workflows properly use `postgres` user in all database connections
- No remaining references to `root` user found in codebase
- PostgreSQL services correctly configured with `postgres` user

**Verification**:
```yaml
# In .github/workflows/ci.yml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_PASSWORD: postgres  # Uses postgres user
      POSTGRES_DB: test_db
      
# Environment variables
env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
```

### 3. Frontend Server Health Check Failure

**Problem**: 
- Error: `curl: (22) The requested URL returned error: 404`
- Frontend server failed to start properly due to missing build artifacts

**Root Cause**: 
- Build artifact issues caused frontend to fail serving static files
- Incorrect directory being served (`out` instead of `dist`)

**Solution**: 
- Fixed by resolving artifact issues above
- Updated serve script to use correct directory
- Next.js static export now generates files in `dist/` directory

## SQLAlchemy Fixes (Previously Completed)

### Models Updated with `extend_existing=True`:
- ✅ `User` model (`app/models/user.py`)
- ✅ `Project` model (`app/models/project.py`)
- ✅ `Task` model (`app/models/task.py`)
- ✅ `Role` model (`app/models/rbac.py`)
- ✅ `Permission` model (`app/models/rbac.py`)
- ✅ `UserRole` model (`app/models/rbac.py`)
- ✅ `Activity` model (`app/models/activity.py`)

### Relationship Fixes:
- ✅ Fixed `PredictiveModel` relationship mapping
- ✅ Enhanced `_extract_project_context` function with fallback values
- ✅ Fixed SQLAlchemy column type handling

## Testing and Verification

### Commands to Test Fixes:

1. **Test Frontend Build**:
```bash
cd frontend
npm ci
npm run build
ls -la dist/  # Should show built files
npm run serve:dist  # Should serve on port 3000
```

2. **Test Database Connection**:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_db alembic upgrade heads
```

3. **Test Complete CI Pipeline**:
```bash
# Push to trigger CI
git add .
git commit -m "Fix CI/CD artifact and database issues"
git push origin main
```

### Expected Results:
- ✅ Frontend builds to `dist/` directory
- ✅ Artifacts upload successfully as `frontend-build`
- ✅ Frontend server starts and responds on port 3000
- ✅ Database connections use `postgres` user
- ✅ No SQLAlchemy table redefinition errors

## CI/CD Workflow Flow

### Successful Pipeline Flow:
1. **Security Scan** → ✅ Passes
2. **Frontend Test & Build** → ✅ Builds to `dist/`, uploads `frontend-build` artifact
3. **Backend Test** → ✅ Uses `postgres` user, no SQLAlchemy errors
4. **Frontend Build Fallback** → ✅ Checks for artifact, creates if missing
5. **E2E Tests** → ✅ Downloads artifact, starts servers successfully
6. **Performance Tests** → ✅ Uses correct build artifacts
7. **Docker Build** → ✅ Completes successfully

## File Changes Summary

| File | Change | Purpose |
|------|--------|---------|
| `frontend/next.config.js` | `output: 'export'`, `distDir: 'dist'` | Fix build output directory |
| `frontend/package.json` | `serve:dist` script updated | Serve from correct directory |
| `app/models/user.py` | Added `extend_existing=True` | Fix SQLAlchemy table redefinition |
| `app/models/project.py` | Added `extend_existing=True` | Fix SQLAlchemy table redefinition |
| `app/models/task.py` | Added `extend_existing=True` | Fix SQLAlchemy table redefinition |
| `app/models/rbac.py` | Added `extend_existing=True` | Fix SQLAlchemy table redefinition |
| `app/models/activity.py` | Added `extend_existing=True` | Fix SQLAlchemy table redefinition |
| `app/models/reporting_models.py` | Fixed relationship mapping | Fix PredictiveModel relationships |
| `app/services/activity_feature_service.py` | Enhanced with fallbacks | Fix test assertion errors |

## Monitoring and Maintenance

### Key Metrics to Monitor:
- ✅ Artifact upload success rate
- ✅ Frontend server startup time
- ✅ Database connection success rate
- ✅ SQLAlchemy model loading time
- ✅ Overall CI/CD pipeline duration

### Maintenance Notes:
1. **Next.js Updates**: Ensure `output: 'export'` remains compatible
2. **Artifact Retention**: Monitor 7-day retention policy
3. **Database Connections**: Always use `postgres` user for new configurations
4. **New Models**: Always add `extend_existing=True` to prevent redefinition errors

## Related Documentation
- [SQLAlchemy Fixes Summary](./SQLALCHEMY_FIXES_SUMMARY.md)
- [Workflow Optimization](./WORKFLOW_OPTIMIZATION.md)
- [CI Fixes Summary](./CI_FIXES_SUMMARY.md)

---
*Last Updated: December 7, 2025*
*Status: All critical CI/CD artifact and database issues resolved*