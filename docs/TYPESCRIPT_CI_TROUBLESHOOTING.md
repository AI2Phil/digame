# TypeScript CI/CD Troubleshooting Guide

This document addresses the TypeScript compilation error you're seeing in CI/CD environments.

## 🚨 Error Analysis

**Error**: `Cannot find module '../../lib/api' or its corresponding type declarations.`

**File**: `src/components/security/SecurityDashboard.tsx(7,49)`

## 🔍 Root Cause Analysis

The error indicates that the CI/CD environment cannot find the `frontend/src/lib/api.ts` file, even though it exists locally and passes type checking.

### Potential Causes:

1. **Stale CI/CD Cache** - Build cache contains outdated file references
2. **Git Synchronization** - CI running on different branch/commit
3. **File System Case Sensitivity** - Linux CI vs macOS development
4. **Node Modules Cache** - TypeScript compiler cache issues
5. **Build Environment Differences** - Different TypeScript/Node.js versions

## 🛠️ Solutions

### Solution 1: Clear CI/CD Cache

```yaml
# GitHub Actions example
- name: Clear npm cache
  run: npm cache clean --force

- name: Clear TypeScript cache
  run: rm -rf node_modules/.cache

- name: Fresh install
  run: npm ci
```

### Solution 2: Verify File Existence in CI

Add a debug step to your CI pipeline:

```yaml
- name: Debug file structure
  run: |
    echo "=== Frontend file structure ==="
    find frontend/src -name "*.ts" -o -name "*.tsx" | head -20
    echo "=== API file check ==="
    ls -la frontend/src/lib/
    echo "=== SecurityDashboard imports ==="
    grep -n "import.*api" frontend/src/components/security/SecurityDashboard.tsx || true
```

### Solution 3: Force Git Sync

Ensure CI is using the latest code:

```yaml
- name: Checkout with full history
  uses: actions/checkout@v4
  with:
    fetch-depth: 0
    clean: true
```

### Solution 4: TypeScript Configuration Fix

Add to `frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/lib/*": ["src/lib/*"]
    },
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    ".next",
    "out"
  ]
}
```

### Solution 5: Alternative Import Strategy

If the issue persists, update the SecurityDashboard import:

```typescript
// Option A: Absolute import (if baseUrl is configured)
import { securityApi, checkBackendHealth } from '@/lib/api';

// Option B: Explicit file extension
import { securityApi, checkBackendHealth } from '../../lib/api.ts';

// Option C: Dynamic import fallback
const loadApi = async () => {
  try {
    return await import('../../lib/api');
  } catch (error) {
    console.error('Failed to load API module:', error);
    return null;
  }
};
```

### Solution 6: CI-Specific Build Script

Add to `package.json`:

```json
{
  "scripts": {
    "type-check:ci": "tsc --noEmit --skipLibCheck",
    "build:ci": "npm run type-check:ci && next build"
  }
}
```

## 🔧 Quick Fixes

### Fix 1: Immediate CI Resolution

```bash
# In your CI pipeline, before type checking:
cd frontend
rm -rf node_modules .next
npm ci
npm run type-check
```

### Fix 2: Verify File Permissions

```bash
# Ensure files have correct permissions
chmod 644 frontend/src/lib/api.ts
chmod 644 frontend/src/components/security/SecurityDashboard.tsx
```

### Fix 3: Force TypeScript Recompilation

```bash
# Clear TypeScript cache and recompile
rm -rf frontend/node_modules/.cache
rm -rf frontend/.next
cd frontend && npm run type-check
```

## 📋 Verification Steps

### Step 1: Local Verification
```bash
cd frontend
npm run type-check  # Should pass ✅
npm run build       # Should pass ✅
```

### Step 2: CI Environment Debug
```bash
# Add to CI pipeline
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo "TypeScript version: $(npx tsc --version)"
ls -la frontend/src/lib/api.ts
```

### Step 3: Import Resolution Test
```bash
# Test import resolution
cd frontend
node -e "console.log(require.resolve('./src/lib/api.ts'))"
```

## 🚀 Recommended CI Pipeline

```yaml
name: TypeScript Check
on: [push, pull_request]

jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          clean: true

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: 'frontend/package-lock.json'

      - name: Debug environment
        run: |
          echo "Node: $(node --version)"
          echo "npm: $(npm --version)"
          ls -la frontend/src/lib/

      - name: Install dependencies
        run: |
          cd frontend
          npm ci

      - name: TypeScript check
        run: |
          cd frontend
          npm run type-check

      - name: Build check
        run: |
          cd frontend
          npm run build
```

## 🎯 Expected Resolution

After implementing these fixes:

1. **CI cache cleared** ✅
2. **File structure verified** ✅
3. **TypeScript compilation passes** ✅
4. **Build succeeds** ✅

## 📞 If Issues Persist

If the error continues:

1. **Check the exact commit hash** CI is using
2. **Verify the branch** CI is building from
3. **Compare file timestamps** between local and CI
4. **Review CI logs** for any file system errors
5. **Test with a fresh clone** of the repository

The files exist and work locally, so this is definitely a CI/CD environment issue rather than a code problem.