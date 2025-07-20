# CI Frontend Build Fix - Artifact Upload Issue

## Problem Analysis

The CI pipeline is failing with the error:
```
Run actions/upload-artifact@v4
Error: No files were found with the provided path: frontend/.next/. No artifacts will be uploaded.
```

## Root Cause

The issue is in [`frontend/next.config.js`](frontend/next.config.js:22) where the configuration has:

```javascript
// Enable standalone output for Docker builds
output: 'standalone',
```

When `output: 'standalone'` is set, Next.js creates a different build structure optimized for Docker containers instead of the standard `.next/` directory that the CI workflow expects for artifact upload.

## Solution

### 1. Fix Next.js Configuration

**File**: `frontend/next.config.js`

**Change line 22-23 from:**
```javascript
// Enable standalone output for Docker builds
output: 'standalone',
```

**To:**
```javascript
// Enable standalone output only for Docker builds, not for CI
output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
```

This ensures that:
- CI builds use the standard Next.js output structure (`.next/` directory)
- Docker builds can still use standalone output when `DOCKER_BUILD=true` is set
- The artifact upload will find the expected `.next/` directory

### 2. Alternative CI Workflow Fix (if config change not preferred)

**File**: `.github/workflows/ci.yml`

**Option A: Update artifact path to match standalone output**

Change lines 500-501 from:
```yaml
name: frontend-build-${{ github.run_id }}
path: frontend/.next/
```

To:
```yaml
name: frontend-build-${{ github.run_id }}
path: |
  frontend/.next/
  frontend/standalone/
```

**Option B: Add conditional artifact upload**

Replace the current upload step (lines 496-504) with:
```yaml
- name: Upload Next.js build artifacts
  uses: actions/upload-artifact@v4
  if: success()
  with:
    name: frontend-build-${{ github.run_id }}
    path: |
      frontend/.next/
      frontend/standalone/
    retention-days: 1
    if-no-files-found: warn
    compression-level: 6
```

### 3. Recommended Solution: Environment-Based Configuration

**File**: `frontend/next.config.js`

**Complete fix for lines 20-24:**
```javascript
// Conditional output based on environment
output: (() => {
  if (process.env.DOCKER_BUILD === 'true') {
    return 'standalone'; // For Docker builds
  }
  if (process.env.CI === 'true') {
    return undefined; // Standard build for CI
  }
  return undefined; // Standard build for development
})(),
```

### 4. Update CI Environment Variables

**File**: `.github/workflows/ci.yml`

Add to the build step environment (around line 347):
```yaml
- name: Build frontend with enhanced error capture
  working-directory: ./frontend
  env:
    NODE_ENV: production
    NEXT_TELEMETRY_DISABLED: 1
    CI: true
    DOCKER_BUILD: false  # Explicitly disable Docker build mode
```

## Implementation Priority

1. **Immediate Fix**: Update `frontend/next.config.js` with the conditional output configuration
2. **Verification**: Test that CI builds create `.next/` directory
3. **Fallback**: If needed, update CI workflow to handle both output types

## Testing

After implementing the fix:

1. **Local Test**:
   ```bash
   cd frontend
   npm run build:ci
   ls -la .next/  # Should show build output
   ```

2. **CI Test**: Push changes and verify:
   - Build completes successfully
   - `.next/` directory is created
   - Artifact upload succeeds
   - E2E tests can download and use artifacts

## Additional Considerations

### Docker Builds
For Docker builds, set the environment variable:
```dockerfile
ENV DOCKER_BUILD=true
```

### Development Builds
Development builds will continue to work normally with the standard Next.js output.

### Backward Compatibility
This change maintains backward compatibility while fixing the CI issue.

## Expected Outcome

After implementing this fix:
- ✅ CI builds will create the expected `.next/` directory
- ✅ Artifact upload will succeed
- ✅ E2E tests will have access to build artifacts
- ✅ Docker builds will still work with standalone output when needed
- ✅ Development builds remain unaffected

## Verification Steps

1. Check that `frontend/.next/BUILD_ID` exists after build
2. Verify artifact upload succeeds in CI
3. Confirm E2E tests can download and use artifacts
4. Test that Docker builds still work with `DOCKER_BUILD=true`

This fix addresses the immediate CI failure while maintaining flexibility for different deployment scenarios.