# CLI Workflow Integration Guide

This document explains how the CLI workflow has been updated to incorporate the new integration scripts and avoid conflicts.

## 🔄 Updated CLI Commands

### Development Environment

#### **Primary Development Command (Recommended)**
```bash
# Start integrated development environment with health checks
npm run dev
# This now runs: ./scripts/start-dev.sh
```

#### **Stop Development Environment**
```bash
# Clean shutdown of all development services
npm run dev:stop
# This runs: ./scripts/stop-dev.sh
```

#### **Legacy Development Command (Fallback)**
```bash
# Original concurrently-based development (without health checks)
npm run dev:legacy
# This runs: concurrently "npm run dev:frontend" "npm run dev:backend-node"
```

### Testing Workflows

#### **Complete E2E Testing (Recommended)**
```bash
# Full E2E testing with backend service management
npm run test:e2e
# This runs: setup-test-env.sh → playwright test → cleanup-test-env.sh
```

#### **Manual E2E Testing Control**
```bash
# Setup test environment
npm run test:e2e:setup

# Run tests (from frontend directory)
cd frontend && npm run test:e2e

# Cleanup test environment
npm run test:e2e:cleanup
```

#### **Frontend-Only E2E Testing**
```bash
# Run E2E tests without backend service management
cd frontend && npm run test:e2e
```

## 🚨 Breaking Changes and Migration

### What Changed

1. **`npm run dev`** now uses our enhanced integration script instead of basic `concurrently`
2. **New E2E workflow** includes automatic backend service management
3. **Added cleanup commands** for proper resource management

### Migration Path

#### For Existing Development Workflows:
```bash
# OLD (still works as npm run dev:legacy)
npm run dev

# NEW (enhanced with health checks and better error handling)
npm run dev
```

#### For Existing E2E Testing:
```bash
# OLD (frontend-only, may fail without backend)
cd frontend && npm run test:e2e

# NEW (full integration with backend services)
npm run test:e2e
```

## 🔧 CLI Command Reference

### Root Package.json Commands

| Command | Purpose | Script Path |
|---------|---------|-------------|
| `npm run dev` | **Enhanced development environment** | `./scripts/start-dev.sh` |
| `npm run dev:stop` | **Stop development environment** | `./scripts/stop-dev.sh` |
| `npm run dev:legacy` | Legacy development (concurrently) | Built-in concurrently |
| `npm run test:e2e` | **Full E2E testing with backend** | Integrated workflow |
| `npm run test:e2e:setup` | Setup test environment only | `./scripts/setup-test-env.sh` |
| `npm run test:e2e:cleanup` | Cleanup test environment only | `./scripts/cleanup-test-env.sh` |
| `npm run type-check` | **TypeScript type checking** | `cd frontend && npm run type-check` |
| `npm run lint` | **ESLint code linting** | `cd frontend && npm run lint` |
| `npm run lint:fix` | **ESLint auto-fix** | `cd frontend && npm run lint:fix` |

### Frontend Package.json Commands

| Command | Purpose | Notes |
|---------|---------|-------|
| `npm run test:e2e` | Basic E2E tests | No backend management |
| `npm run test:e2e:full` | **E2E with backend services** | Includes setup/cleanup |
| `npm run test:e2e:setup` | Setup test environment | Calls parent script |
| `npm run test:e2e:cleanup` | Cleanup test environment | Calls parent script |

## 🛡️ Conflict Prevention

### Port Management
- **Development**: Frontend (3000), Backend (8000)
- **Testing**: Frontend (3001), Backend (8001)
- **Scripts automatically handle port conflicts**

### Process Management
- **Enhanced scripts detect and handle existing processes**
- **Cleanup scripts ensure no orphaned processes**
- **Health checks prevent starting on occupied ports**

### Environment Isolation
- **Development and test environments use different databases**
- **Separate environment variable files (.env.local vs .env.test)**
- **Test cleanup ensures no cross-contamination**

## 📋 Recommended Workflows

### Daily Development
```bash
# Start development environment
npm run dev

# Work on features...

# Stop development environment (when done)
npm run dev:stop
```

### Testing Before Commit
```bash
# Run unit tests
npm run test:frontend

# Run full E2E tests with backend
npm run test:e2e

# All tests passed, ready to commit
```

### Debugging E2E Issues
```bash
# Setup test environment
npm run test:e2e:setup

# Run tests in debug mode
cd frontend && npm run test:e2e:debug

# Cleanup when done
npm run test:e2e:cleanup
```

### CI/CD Integration
```bash
# In CI pipeline
npm run install:all
npm run test:e2e  # Includes setup and cleanup
npm run build
```

## 🚀 Benefits of New Workflow

### Enhanced Development Experience
- ✅ **Health Checks**: Automatic service health validation
- ✅ **Error Recovery**: Better error handling and troubleshooting
- ✅ **Resource Management**: Proper cleanup and port management
- ✅ **Integration Testing**: Full frontend-backend integration validation

### Improved Testing Reliability
- ✅ **Service Orchestration**: Automatic backend service management for E2E tests
- ✅ **Environment Isolation**: Separate test environments prevent conflicts
- ✅ **Cleanup Automation**: Automatic cleanup prevents resource leaks
- ✅ **Consistent State**: Each test run starts with clean environment

### Better Developer Experience
- ✅ **Single Commands**: One command for complete workflows
- ✅ **Fallback Options**: Legacy commands available if needed
- ✅ **Clear Documentation**: Comprehensive usage documentation
- ✅ **Troubleshooting**: Built-in troubleshooting and error guidance

## 🔍 Troubleshooting

### If `npm run dev` fails:
1. Try `npm run dev:legacy` to use the old workflow
2. Check if ports 3000/8000 are already in use
3. Run `npm run dev:stop` to cleanup any stuck processes

### If E2E tests fail:
1. Run `npm run test:e2e:cleanup` to cleanup test environment
2. Try `npm run test:e2e:setup` to manually setup test environment
3. Check if ports 3001/8001 are available

### If scripts don't execute:
1. Ensure scripts have execute permissions: `chmod +x scripts/*.sh`
2. Check if you're running from the project root directory
3. Verify bash is available on your system

## 📝 Notes

- **All original commands still work** - we've added enhanced versions, not replaced
- **Scripts are cross-platform** - work on macOS, Linux, and Windows (WSL)
- **Graceful degradation** - if enhanced scripts fail, fallback to legacy commands
- **Comprehensive logging** - all scripts provide detailed output for debugging