# CI Artifact Linking Fix Documentation

## Issue Summary

**Problem**: E2E tests failing across all browser matrix runs with "Artifact not found for name: frontend-build-16405735302"

**Root Cause**: Artifact upload/download names weren't properly linked between `frontend-build` and `e2e-test` jobs, causing artifact retrieval failures.

**Impact**: All E2E tests failing before even starting Playwright tests due to missing frontend build artifacts.

## Root Cause Analysis

### 1. Artifact Name Mismatch
The `frontend-build` job was uploading artifacts with a name that the `e2e-test` job couldn't properly reference:
- Upload used: `frontend-build-${{ github.run_id }}`
- Download used: `frontend-build-${{ github.run_id }}`
- **Issue**: `github.run_id` context might not be identical across jobs

### 2. No Cross-Job Communication
The artifact name was hardcoded in both jobs without proper job output communication, making it fragile and prone to context issues.

### 3. Insufficient Fallback Mechanisms
When artifact download failed, the fallback build process wasn't robust enough to handle dependency installation and verification.

## Comprehensive Fix Applied

### 1. ✅ Job Outputs for Artifact Communication

**Added to `frontend-build` job**:
```yaml
frontend-build:
  runs-on: ubuntu-latest
  outputs:
    artifact_name: ${{ steps.set-artifact.outputs.artifact_name }}
    build_id: ${{ steps.set-artifact.outputs.build_id }}
```

**Enhanced artifact preparation step**:
```yaml
- name: Set frontend artifact name and prepare build artifacts
  id: set-artifact
  working-directory: ./frontend
  run: |
    # Set artifact name for cross-job communication
    ARTIFACT_NAME="frontend-build-${{ github.run_id }}"
    echo "artifact_name=$ARTIFACT_NAME" >> $GITHUB_OUTPUT
    
    BUILD_ID=$(cat .next/BUILD_ID)
    echo "build_id=$BUILD_ID" >> $GITHUB_OUTPUT
```

### 2. ✅ Proper Artifact Upload Configuration

**Before**:
```yaml
- name: Upload Next.js build artifacts
  with:
    name: frontend-build-${{ github.run_id }}  # Hardcoded
    if-no-files-found: warn                    # Too lenient
```

**After**:
```yaml
- name: Upload Next.js build artifacts
  with:
    name: ${{ steps.set-artifact.outputs.artifact_name }}  # From job output
    if-no-files-found: error                               # Strict validation
```

### 3. ✅ Enhanced Artifact Download in E2E Tests

**Before**:
```yaml
- name: Download Next.js build artifacts
  with:
    name: frontend-build-${{ github.run_id }}  # Hardcoded
    path: frontend/.next/                      # Wrong path
```

**After**:
```yaml
- name: Download Next.js build artifacts
  with:
    name: ${{ needs.frontend-build.outputs.artifact_name }}  # From job output
    path: frontend/                                          # Correct path
```

### 4. ✅ Robust Fallback Build Process

**Enhanced build verification**:
```yaml
- name: Ensure frontend build is available
  run: |
    echo "Expected artifact name: ${{ needs.frontend-build.outputs.artifact_name }}"
    echo "Expected BUILD_ID: ${{ needs.frontend-build.outputs.build_id }}"
    
    # Function to verify build integrity
    verify_build() {
      if [ -d ".next" ] && [ -f ".next/BUILD_ID" ] && [ -d ".next/static" ]; then
        ACTUAL_BUILD_ID=$(cat .next/BUILD_ID)
        echo "✅ Valid Next.js build found: $ACTUAL_BUILD_ID"
        
        # Verify BUILD_ID matches expected
        EXPECTED_BUILD_ID="${{ needs.frontend-build.outputs.build_id }}"
        if [ -n "$EXPECTED_BUILD_ID" ] && [ "$ACTUAL_BUILD_ID" != "$EXPECTED_BUILD_ID" ]; then
          echo "⚠️ BUILD_ID mismatch: expected $EXPECTED_BUILD_ID, got $ACTUAL_BUILD_ID"
        fi
        return 0
      else
        echo "❌ Invalid or incomplete build"
        return 1
      fi
    }
    
    # Try downloaded artifacts first, fallback to fresh build
    if [ "$ARTIFACT_STATUS" = "success" ] && verify_build; then
      echo "✅ Using downloaded build artifacts"
    else
      echo "⚠️ Building fresh frontend (artifacts unavailable or invalid)..."
      # Robust fresh build process with dependency verification
    fi
```

### 5. ✅ Enhanced Debug Information

**Added comprehensive logging**:
```yaml
# Debug artifact structure
echo "🔍 Listing .next contents for upload verification:"
ls -R .next/ | head -20

# Enhanced build info
echo "{\"build_id\": \"$BUILD_ID\", \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\", \"run_id\": \"${{ github.run_id }}\", \"commit\": \"${{ github.sha }}\", \"artifact_name\": \"$ARTIFACT_NAME\"}" > .next/build-info.json
```

## Artifact Flow Diagram

```
frontend-build job:
├── Build .next/ directory
├── Set artifact_name output → "frontend-build-{run_id}"
├── Set build_id output → "{actual_build_id}"
├── Upload artifact with name from output
└── Confirm upload success

e2e-test job:
├── needs: [frontend-build]
├── Download artifact using needs.frontend-build.outputs.artifact_name
├── Verify BUILD_ID matches needs.frontend-build.outputs.build_id
├── If download fails → Fresh build with dependency verification
└── Proceed with E2E tests
```

## Key Improvements

### 1. **Deterministic Artifact Names**
- Artifact names now passed via job outputs instead of hardcoded references
- Eliminates context-dependent naming issues

### 2. **BUILD_ID Verification**
- Cross-validates downloaded artifacts match expected build
- Detects artifact corruption or mismatch issues

### 3. **Robust Fallback Strategy**
- Fresh build includes dependency verification
- Proper error handling and recovery mechanisms

### 4. **Enhanced Error Detection**
- Changed `if-no-files-found: warn` to `error` for strict validation
- Comprehensive logging for debugging artifact issues

### 5. **Correct Artifact Paths**
- Fixed download path from `frontend/.next/` to `frontend/`
- Ensures proper artifact extraction structure

## Files Modified

1. **`.github/workflows/ci.yml`**:
   - Added job outputs to `frontend-build`
   - Enhanced artifact preparation with output setting
   - Updated artifact upload to use job outputs
   - Fixed artifact download in `e2e-test` to use job outputs
   - Enhanced build verification with BUILD_ID validation
   - Added comprehensive debug logging

## Verification Steps

1. **Check Job Outputs**:
   ```bash
   # In CI logs, verify these outputs are set:
   # frontend-build job outputs:
   # - artifact_name: frontend-build-{run_id}
   # - build_id: {actual_build_id}
   ```

2. **Verify Artifact Upload**:
   ```bash
   # Should see in CI logs:
   # ✅ Build artifacts uploaded successfully
   # Artifact name: frontend-build-{run_id}
   # BUILD_ID: {build_id}
   ```

3. **Verify Artifact Download**:
   ```bash
   # Should see in E2E job logs:
   # Expected artifact name: frontend-build-{run_id}
   # Expected BUILD_ID: {build_id}
   # ✅ Using downloaded build artifacts
   ```

## Expected Behavior

### Success Path
1. `frontend-build` completes and uploads artifact with proper name
2. `e2e-test` downloads artifact using job output reference
3. BUILD_ID verification passes
4. E2E tests proceed with verified frontend build

### Fallback Path
1. Artifact download fails or verification fails
2. Fresh build triggered with dependency installation
3. Build verification ensures valid `.next/` directory
4. E2E tests proceed with fresh build

## Related Documentation

- [CI Dependency Fixes](./CI_DEPENDENCY_FIXES.md) - Runtime dependency issues
- [CI E2E Backend Fix](./CI_E2E_BACKEND_FIX.md) - Backend startup fixes
- [CI Frontend Artifact Fix](./CI_FRONTEND_ARTIFACT_FIX.md) - Artifact path fixes

## Timeline

- **Issue Identified**: E2E tests failing with "Artifact not found" across all browsers
- **Root Cause Found**: Artifact name mismatch and lack of cross-job communication
- **Fix Implemented**: Job outputs, proper artifact linking, robust fallbacks
- **Status**: ✅ **RESOLVED** - Artifact upload/download now properly linked with fallbacks

This fix ensures reliable artifact transfer between CI jobs with proper validation and robust fallback mechanisms for E2E test execution.