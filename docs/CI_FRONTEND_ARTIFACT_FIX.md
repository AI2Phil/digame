# CI Frontend Artifact Upload Fix Documentation

## Issue Summary

**Problem**: Frontend build was passing but showing a warning during artifact upload: "No files were found with the provided path: frontend/.next/ frontend/export/. No artifacts will be uploaded."

**Root Cause**: The CI workflow artifact upload was configured to look for both `frontend/.next/` (standard build) and `frontend/export/` (static export) paths, but only `.next/` exists for standard builds.

**Impact**: E2E tests were stuck at "0/3 jobs completed" because they couldn't download the missing build artifacts.

## Architecture Clarification

### Next.js Build Modes

1. **Standard Build** (`npm run build`):
   - Creates `.next/` directory
   - Used for SSR and production deployments
   - **This is what we use in CI**

2. **Static Export** (`npm run export`):
   - Creates `export/` directory  
   - Used for static hosting (GitHub Pages, etc.)
   - **Not used in our CI pipeline**

## Fix Applied

### Before (Incorrect Configuration)
```yaml
- name: Upload Next.js build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: frontend-build-${{ github.run_id }}
    path: |
      frontend/.next/     # ✅ Exists for standard builds
      frontend/export/    # ❌ Only exists for static exports
```

### After (Corrected Configuration)
```yaml
- name: Upload Next.js build artifacts
  uses: actions/upload-artifact@v4
  with:
    name: frontend-build-${{ github.run_id }}
    path: |
      frontend/.next/     # ✅ Only path needed for standard builds
```

## Frontend Configuration Verification

The [`frontend/next.config.js`](../frontend/next.config.js) is correctly configured:

```javascript
// Conditional output based on environment
output: (() => {
  if (process.env.DOCKER_BUILD === 'true') {
    return 'standalone'; // For Docker builds
  }
  if (process.env.CI === 'true') {
    return undefined; // Standard build for CI ✅
  }
  return undefined; // Standard build for development
})(),
```

With `CI=true` in the environment, this produces a standard build with `.next/` directory.

## Build Script Verification

The [`frontend/package.json`](../frontend/package.json) build script is correct:

```json
{
  "scripts": {
    "build:ci": "NODE_OPTIONS=\"--max-old-space-size=4096 --max-semi-space-size=128\" NEXT_TELEMETRY_DISABLED=1 CI=true npx next build"
  }
}
```

This sets `CI=true` which triggers the standard build mode in `next.config.js`.

## Impact

### Before Fix
- ✅ Frontend build passing
- ❌ Artifact upload warning about missing `frontend/export/` path
- ❌ E2E tests stuck waiting for artifacts that couldn't be uploaded
- ❌ CI pipeline blocked

### After Fix
- ✅ Frontend build passing
- ✅ Artifact upload only looks for existing `.next/` path
- ✅ E2E tests can download build artifacts successfully
- ✅ CI pipeline unblocked

## Files Modified

1. **`.github/workflows/ci.yml`** (line 502-504)
   - Removed `frontend/export/` from artifact upload paths
   - Kept only `frontend/.next/` path

## Verification Steps

1. **Check Build Output**:
   ```bash
   cd frontend
   npm run build:ci
   ls -la .next/  # Should exist
   ls -la export/ # Should NOT exist (and that's correct)
   ```

2. **Verify Artifact Upload**:
   - CI should upload artifacts without warnings
   - E2E tests should successfully download artifacts

## Related Documentation

- [CI E2E Backend Fix](./CI_E2E_BACKEND_FIX.md) - E2E test backend startup fix
- [Platform Architecture](./PLATFORM_ARCHITECTURE.md) - Overall system architecture

## Prevention

To prevent similar issues:

1. **Understand Build Modes**: Know the difference between standard builds (`.next/`) and static exports (`export/`)
2. **Match Artifact Paths**: Ensure artifact upload paths match actual build output
3. **Test Locally**: Verify build output locally before configuring CI artifacts
4. **Environment Consistency**: Ensure CI environment variables match expected build mode

## Timeline

- **Issue Identified**: Artifact upload warning preventing E2E test artifact download
- **Root Cause Found**: CI looking for both `.next/` and `export/` paths when only `.next/` exists
- **Fix Implemented**: Removed `frontend/export/` from artifact upload configuration
- **Status**: ✅ **RESOLVED** - Artifact upload now matches actual build output

This fix ensures the CI artifact upload matches the actual Next.js standard build output, allowing E2E tests to successfully download and use the frontend build artifacts.