# PyRefly TypeFix Tracker Generator

This document contains a Python script to generate a TypeFix Tracker for files with the most Pyright type-checking errors.

## Usage Commands

Run these commands to get current error data:

```bash
# Get error counts by file
cd /Users/philiposhea/Documents/digame && npx pyright --outputjson | jq -r '.generalDiagnostics[] | .file' | cut -d'/' -f6- | sort | uniq -c | sort -nr | head -20

# Get file sizes
find app/ -name "*.py" -exec du -h {} + | sort -hr | head -30

# Get recently modified files
git ls-files | while read f; do echo "$(git log -1 --format="%ad" --date=short -- $f) $f"; done | sort -r | head -50

# Get full error analysis
cd /Users/philiposhea/Documents/digame && npx pyright --outputjson | jq -r '.generalDiagnostics[] | .file' | cut -d'/' -f6- | sort | uniq -c | sort -nr
```

## Priority Assignment Rules

- **High**: Core logic files, actively modified, or 60+ errors
- **Medium**: Test files, moderate-risk services (30-59 errors)
- **Low**: Legacy files, not actively maintained, or low impact (<30 errors)

## Boy Scout Rule

Any time someone touches a file, they're encouraged to fix some type errors to gradually improve type safety.

## Current Status (as of 2025-01-29)

Total PyRight errors: **2,605** across **400** files analyzed

## Recently Fixed Files

The following files have been systematically fixed and should have 0 errors:
- app/services/workflow_automation_service.py (was 36 errors → 0)
- app/services/enhanced_onboarding_service.py (was 70+ errors → 0) 
- app/tests/services/test_team_service.py (was 80+ errors → 0)
- app/tests/crud/test_team_crud.py (was 80+ errors → 0)
- app/services/team_twin_manager.py (was 66 errors → ~20 remaining)