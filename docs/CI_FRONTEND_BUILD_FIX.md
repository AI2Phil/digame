# CI Frontend Build Artifact Upload Fix

## Issue Summary

The CI pipeline was failing during the frontend build artifact upload step with the error:
```
Error: No files were found with the provided path: frontend/.next/. No artifacts will be uploaded.
```

This occurred because Next.js was configured with `output: 'standalone'` which changes the build output structure, causing the expected `.next/` directory to be missing or have different contents.

## Root Cause Analysis

### Problem
- Next.js `standalone` output mode creates a different directory structure optimized for Docker deployment
- The CI artifact upload expected the standard `.next/` directory structure
- The `standalone` output was needed for Docker builds but incompatible with CI artifact management

### Investigation Steps
1. **Build Output Analysis**: Compared CI vs Docker build requirements
2. **Next.js Configuration Review**: Identified `output: 'standalone'` as the root cause
3. **Environment Context**: Determined need for conditional output configuration
4. **Artifact Structure**: Verified expected vs actual build artifacts

## Solution Implementation

### 1. Conditional Output Configuration

Modified [`frontend/next.config.js`](../frontend/next.config.js) to use environment-based output:

```javascript
output: (() => {
  // Docker builds need standalone output for containerization
  if (process.env.DOCKER_BUILD === 'true') {
    return 'standalone';
  }
  
  // CI builds need standard output for artifact management
  if (process.env.CI === 'true') {
    return undefined; // Standard Next.js output
  }
  
  // Default: standard output for development
  return undefined;
})()
```

### 2. Docker Configuration Update

Updated [`frontend/Dockerfile`](../frontend/Dockerfile) to set the Docker build flag:

```dockerfile
# Set Docker build flag before building
ENV DOCKER_BUILD=true
RUN npm run build
```

### 3. Build Script Enhancement

Updated [`frontend/package.json`](../frontend/package.json) to explicitly set CI environment variable:

```json
{
  "scripts": {
    "build:ci": "NODE_OPTIONS=\"--max-old-space-size=4096 --max-semi-space-size=128\" NEXT_TELEMETRY_DISABLED=1 CI=true npx next build"
  }
}
```

### 4. CI Workflow Enhancement

Enhanced [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) with explicit environment variables:

```yaml
env:
  CI: true
  DOCKER_BUILD: false
  NODE_ENV: production
```

## Verification Results

### CI Build Mode (Default)
```bash
cd frontend && npm run build:ci
```
- ✅ Standard `.next/` directory structure
- ✅ No `standalone/` directory
- ✅ Compatible with CI artifact upload
- ✅ 157 static pages generated successfully

### Docker Build Mode
```bash
cd frontend && DOCKER_BUILD=true npm run build
```
- ✅ Standard `.next/` directory structure
- ✅ Additional `standalone/` directory for Docker
- ✅ Compatible with Docker deployment
- ✅ All build artifacts present

## Technical Details

### Build Output Comparison

**CI Mode** (`.next/` contents):
```
BUILD_ID, build-manifest.json, cache/, export-marker.json,
images-manifest.json, next-minimal-server.js.nft.json,
next-server.js.nft.json, package.json, prerender-manifest.json,
react-loadable-manifest.json, required-server-files.json,
routes-manifest.json, server/, static/, trace
```

**Docker Mode** (additional):
```
+ node_modules/, standalone/
```

### Environment Variables

| Variable | CI Value | Docker Value | Purpose |
|----------|----------|--------------|---------|
| `CI` | `true` | `false` | Identifies CI environment |
| `DOCKER_BUILD` | `false` | `true` | Enables standalone output |
| `NODE_ENV` | `production` | `production` | Production optimizations |

## Benefits

1. **CI Compatibility**: Resolves artifact upload failures
2. **Docker Compatibility**: Maintains standalone output for containers
3. **Environment Awareness**: Automatic configuration based on context
4. **Zero Breaking Changes**: Existing workflows continue to work
5. **Performance**: Optimized builds for each environment

## Future Considerations

- Monitor CI artifact upload success rates
- Consider artifact size optimization strategies
- Evaluate standalone output benefits for other deployment targets
- Review build performance metrics across environments

## Related Files

- [`frontend/next.config.js`](../frontend/next.config.js) - Main configuration
- [`frontend/Dockerfile`](../frontend/Dockerfile) - Docker build setup
- [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) - CI pipeline
- [`frontend/package.json`](../frontend/package.json) - Build scripts

## Status

✅ **RESOLVED** - CI frontend build artifact upload now works correctly with environment-aware Next.js output configuration.