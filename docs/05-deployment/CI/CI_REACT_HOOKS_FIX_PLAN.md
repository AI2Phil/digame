# CI React Hooks Violations Fix Plan

## Problem Analysis

The CI is failing with 100 React hooks violations and missing React imports, even though builds pass locally. The root cause is that the CI is linting **backup files and cache artifacts** scattered throughout the codebase.

### Evidence Found

1. **300+ backup files** with patterns like:
   - `.backup`
   - `.backup-imports` 
   - `.backup-syntax`
   - `.backup-prettier`
   - Archive files in `scripts/backups/`

2. **Cache and temporary files**:
   - Node modules cache files
   - Build artifacts
   - Log files containing code snippets
   - Report files with code examples

3. **Existing React fixing scripts** (already implemented):
   - `scripts/fix-react-hooks.js` - Comprehensive hooks violation fixer
   - `scripts/fix-react-imports.js` - Missing React imports fixer  
   - `scripts/fix-utility-hooks.js` - Utility hooks violations detector

## Solution Strategy

### Phase 1: Immediate Cleanup (Critical)

#### 1.1 Create Backup File Cleanup Script
```bash
# scripts/cleanup_backup_files.js
- Scan for all backup files (*.backup*, *.cache, *.tmp, *.log with code)
- Move to external backup directory (/Users/philiposhea/Documents/backup/)
- Generate cleanup report
- Update .gitignore patterns
```

#### 1.2 Clean Up Specific Patterns
- `scripts/backups/prettier_formatting/*.backup`
- `scripts/backups/syntax_fixes/*.backup` 
- `scripts/backups/import_path_fixes/*.backup`
- `frontend/.next/` build artifacts
- Node modules cache files
- Log files with code snippets

#### 1.3 Update .gitignore
```gitignore
# Backup files
*.backup
*.backup-*
**/backups/
*.cache
*.tmp

# Build artifacts  
.next/
node_modules/.cache/
*.log

# Reports with code
*-report.txt
*-report.json
```

### Phase 2: Run Existing React Scripts

#### 2.1 Execute React Hooks Fixer
```bash
cd scripts
node fix-react-hooks.js frontend/src/**/*.{jsx,tsx}
```

#### 2.2 Execute React Imports Fixer  
```bash
cd scripts
node fix-react-imports.js frontend/src
```

#### 2.3 Execute Utility Hooks Checker
```bash
cd scripts  
node fix-utility-hooks.js utils
```

### Phase 3: CI Configuration Updates

#### 3.1 Update ESLint Configuration
- Exclude backup file patterns
- Ensure proper React hooks rules
- Add ignore patterns for cache files

#### 3.2 Update GitHub Actions Workflow
- Add cleanup step before linting
- Exclude backup directories from analysis
- Generate clean reports

### Phase 4: Verification

#### 4.1 Local Testing
- Run ESLint locally on cleaned codebase
- Verify no backup files are being linted
- Test build process

#### 4.2 CI Testing
- Push changes and monitor CI
- Verify React hooks violations are resolved
- Check that legitimate issues are still caught

## Implementation Steps

### Step 1: Create Cleanup Script
Create `scripts/cleanup_backup_files.js` with:
- Recursive backup file detection
- Safe file moving (not deletion)
- Comprehensive reporting
- .gitignore updates

### Step 2: Execute Cleanup
```bash
# Run cleanup script
node scripts/cleanup_backup_files.js

# Run existing React scripts
node scripts/fix-react-hooks.js frontend/src/**/*.{jsx,tsx}
node scripts/fix-react-imports.js frontend/src  
node scripts/fix-utility-hooks.js utils
```

### Step 3: Update Configuration Files
- Update `.gitignore`
- Update ESLint configuration
- Update CI workflow

### Step 4: Test and Verify
- Local build test
- CI pipeline test
- Monitor for remaining issues

## Expected Outcomes

1. **CI React hooks violations reduced from 100 to 0-5** (legitimate issues only)
2. **Backup files moved to external directory** (not deleted, for safety)
3. **Clean CI pipeline** that only lints actual source code
4. **Improved .gitignore** to prevent future backup file commits
5. **Documentation** for maintaining clean codebase

## Risk Mitigation

1. **Backup files are moved, not deleted** - Can be restored if needed
2. **Incremental approach** - Test each step before proceeding
3. **Existing scripts are proven** - Already successfully used
4. **Local testing first** - Verify changes before CI

## Success Criteria

- [ ] CI build passes without React hooks violations
- [ ] Backup files moved to external directory
- [ ] .gitignore updated to prevent future issues
- [ ] Documentation updated
- [ ] No legitimate React issues masked

## Next Actions

1. Switch to Code mode to implement cleanup script
2. Execute backup file cleanup
3. Run existing React fixing scripts
4. Update configuration files
5. Test and verify CI pipeline