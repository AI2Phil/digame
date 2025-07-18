# Prettier Code Formatting Guide

## Overview

This document provides a comprehensive guide to the Prettier code formatting system implemented in the Digame platform. Prettier is an opinionated code formatter that ensures consistent code style across the entire codebase.

## Table of Contents

1. [Configuration](#configuration)
2. [Scripts](#scripts)
3. [Commands](#commands)
4. [Backup System](#backup-system)
5. [Troubleshooting](#troubleshooting)
6. [Best Practices](#best-practices)

## Configuration

### .prettierrc.json

The Prettier configuration file defines the formatting rules for the entire project:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": true,
  "proseWrap": "preserve"
}
```

**Configuration Explained:**
- `semi: true` - Always add semicolons at the end of statements
- `trailingComma: "es5"` - Add trailing commas where valid in ES5 (objects, arrays, etc.)
- `singleQuote: true` - Use single quotes instead of double quotes
- `printWidth: 80` - Wrap lines that exceed 80 characters
- `tabWidth: 2` - Use 2 spaces for indentation
- `useTabs: false` - Use spaces instead of tabs
- `bracketSpacing: true` - Add spaces inside object brackets `{ foo: bar }`
- `bracketSameLine: false` - Put closing brackets on new line
- `arrowParens: "avoid"` - Omit parentheses when possible in arrow functions
- `endOfLine: "lf"` - Use Unix line endings
- `quoteProps: "as-needed"` - Only quote object properties when necessary
- `jsxSingleQuote: true` - Use single quotes in JSX
- `proseWrap: "preserve"` - Don't wrap prose (markdown, etc.)

### .prettierignore

Files and directories excluded from formatting:

```
# Dependencies
node_modules/
.next/
dist/
build/

# Generated files
*.min.js
*.min.css
*.bundle.js

# Documentation
*.md
*.txt
README*
CHANGELOG*

# Configuration files
package*.json
*.config.js
*.config.ts

# Archives and backups
**/pages_archived_*/**
**/backups/**
**/*.backup

# Logs and temporary files
*.log
.env*
.DS_Store

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Test coverage
coverage/
.nyc_output/
```

## Scripts

### format_restored_pages.js

**Purpose:** Comprehensive code formatting script for the entire frontend codebase.

**Location:** `scripts/format_restored_pages.js`

**Features:**
- Batch processing of all TypeScript/JavaScript files
- Automatic backup creation before formatting
- Detailed progress reporting with timestamps
- Error handling and recovery
- Comprehensive statistics and reporting
- Support for both `.tsx` and `.jsx` files

**Usage:**
```bash
node scripts/format_restored_pages.js
```

**Output Example:**
```
[2025-07-18T13:35:01.806Z] INFO: 🎨 Starting Prettier Formatting for 210 Files
[2025-07-18T13:35:01.806Z] INFO: 📁 Target Directory: frontend/src/pages
[2025-07-18T13:35:01.806Z] INFO: 🎨 Formatting (1/210): HomePage.jsx
[2025-07-18T13:35:01.806Z] INFO: Created backup: scripts/backups/prettier_formatting/HomePage.jsx.2025-07-18T13-35-01-806Z.backup
[2025-07-18T13:35:01.806Z] SUCCESS:    ✅ Formatted successfully
[2025-07-18T13:35:01.806Z] INFO:    📊 Size: 15420 → 15456 chars (+36)
```

### fix_syntax_errors.js

**Purpose:** Automated syntax error correction before Prettier formatting.

**Location:** `scripts/fix_syntax_errors.js`

**Features:**
- Fixes common TypeScript/React syntax errors
- Handles invalid export statements
- Corrects missing closing braces
- Fixes invalid interface names
- Repairs malformed component structures
- Creates backups before modifications

**Usage:**
```bash
node scripts/fix_syntax_errors.js
```

**Common Fixes Applied:**
1. **Invalid Export Syntax:** `export default const ComponentName` → `const ComponentName = () => {}; export default ComponentName;`
2. **Missing Closing Braces:** Automatically adds missing `}` characters
3. **Invalid Interface Names:** Fixes interfaces with hyphens or invalid characters
4. **Component Structure:** Ensures proper React component structure

## Commands

### Basic Formatting Commands

#### Format All Files
```bash
# Format all files in the project
node scripts/format_restored_pages.js
```

#### Format Specific Directory
```bash
# Format files in a specific directory
npx prettier --write "frontend/src/pages/**/*.{ts,tsx,js,jsx}"
```

#### Check Formatting Without Changes
```bash
# Check if files need formatting (dry run)
npx prettier --check "frontend/src/pages/**/*.{ts,tsx,js,jsx}"
```

#### Format Single File
```bash
# Format a specific file
npx prettier --write frontend/src/pages/HomePage.jsx
```

### Advanced Commands

#### Format with Custom Config
```bash
# Use custom configuration file
npx prettier --config custom-prettier.json --write "src/**/*.{ts,tsx}"
```

#### Format and Show Differences
```bash
# Show what would change without applying
npx prettier --check --list-different "src/**/*.{ts,tsx}"
```

#### Format with Specific Parser
```bash
# Force specific parser
npx prettier --parser typescript --write file.ts
```

### Integration Commands

#### Pre-commit Hook
```bash
# Add to package.json scripts
"scripts": {
  "format": "prettier --write .",
  "format:check": "prettier --check .",
  "format:pages": "node scripts/format_restored_pages.js"
}
```

#### Git Integration
```bash
# Format only staged files
npx prettier --write $(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(ts|tsx|js|jsx)$')
```

## Backup System

### Automatic Backups

The formatting scripts automatically create backups before making changes:

**Backup Location:** `scripts/backups/prettier_formatting/`

**Backup Naming Convention:**
```
{filename}.{timestamp}.backup
```

**Example:**
```
HomePage.jsx.2025-07-18T13-35-01-806Z.backup
```

### Manual Backup Commands

#### Create Backup Before Formatting
```bash
# Create manual backup
cp -r frontend/src/pages frontend/src/pages.backup.$(date +%Y%m%d_%H%M%S)
```

#### Restore from Backup
```bash
# Restore specific file from backup
cp scripts/backups/prettier_formatting/HomePage.jsx.2025-07-18T13-35-01-806Z.backup frontend/src/pages/HomePage.jsx
```

### Backup Management

#### List Available Backups
```bash
# List all backups
ls -la scripts/backups/prettier_formatting/
```

#### Clean Old Backups
```bash
# Remove backups older than 7 days
find scripts/backups/prettier_formatting/ -name "*.backup" -mtime +7 -delete
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Syntax Errors Preventing Formatting

**Problem:** Prettier fails with syntax errors
```
Error: Couldn't parse the file
```

**Solution:** Run syntax fix script first
```bash
node scripts/fix_syntax_errors.js
node scripts/format_restored_pages.js
```

#### 2. File Permission Issues

**Problem:** Cannot write to files
```
Error: EACCES: permission denied
```

**Solution:** Check file permissions
```bash
chmod 644 frontend/src/pages/**/*.{ts,tsx,js,jsx}
```

#### 3. Large File Processing

**Problem:** Script times out on large files

**Solution:** Process files in smaller batches
```bash
# Format specific subdirectories
npx prettier --write "frontend/src/pages/admin/**/*.{ts,tsx}"
npx prettier --write "frontend/src/pages/config/**/*.{ts,tsx}"
```

#### 4. Configuration Conflicts

**Problem:** Inconsistent formatting results

**Solution:** Verify configuration files
```bash
# Check current config
npx prettier --find-config-path frontend/src/pages/HomePage.jsx

# Validate config
npx prettier --check-config .prettierrc.json
```

#### 5. Memory Issues

**Problem:** Out of memory errors during formatting

**Solution:** Increase Node.js memory limit
```bash
node --max-old-space-size=4096 scripts/format_restored_pages.js
```

### Debug Commands

#### Verbose Output
```bash
# Run with detailed logging
DEBUG=* node scripts/format_restored_pages.js
```

#### Check File Status
```bash
# Check if file needs formatting
npx prettier --check frontend/src/pages/HomePage.jsx
```

#### Validate Configuration
```bash
# Test configuration
npx prettier --help config
```

## Best Practices

### 1. Pre-formatting Checklist

Before running Prettier formatting:

- [ ] Ensure all files have valid syntax
- [ ] Run syntax fix script if needed
- [ ] Create manual backup of critical files
- [ ] Check available disk space for backups
- [ ] Verify Prettier configuration is correct

### 2. Formatting Workflow

**Recommended sequence:**
1. Fix syntax errors: `node scripts/fix_syntax_errors.js`
2. Run formatting: `node scripts/format_restored_pages.js`
3. Verify results: `npx prettier --check "frontend/src/pages/**/*.{ts,tsx}"`
4. Test application functionality
5. Commit changes with descriptive message

### 3. Team Collaboration

**Setup for team consistency:**
- Ensure all team members use the same `.prettierrc.json`
- Add pre-commit hooks to automatically format code
- Include formatting check in CI/CD pipeline
- Document any custom formatting rules

### 4. Performance Optimization

**For large codebases:**
- Process files in batches by directory
- Use `--cache` flag for repeated formatting
- Exclude unnecessary files in `.prettierignore`
- Consider parallel processing for very large projects

### 5. Maintenance

**Regular maintenance tasks:**
- Clean old backup files weekly
- Update Prettier version quarterly
- Review and update configuration annually
- Monitor formatting script performance

## File Extensions Supported

The formatting system supports the following file types:

- **TypeScript:** `.ts`, `.tsx`
- **JavaScript:** `.js`, `.jsx`
- **JSON:** `.json` (with limitations)
- **CSS:** `.css`, `.scss`, `.less`
- **HTML:** `.html`, `.htm`
- **Markdown:** `.md` (excluded by default)

## Integration with Development Tools

### VS Code Integration

Add to VS Code settings:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prettier.configPath": ".prettierrc.json"
}
```

### Git Hooks

Add to `.husky/pre-commit`:
```bash
#!/bin/sh
npx prettier --write --list-different $(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(ts|tsx|js|jsx)$')
git add $(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(ts|tsx|js|jsx)$')
```

### Package.json Scripts

Recommended scripts:
```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "format:pages": "node scripts/format_restored_pages.js",
    "fix-syntax": "node scripts/fix_syntax_errors.js",
    "format:full": "npm run fix-syntax && npm run format:pages"
  }
}
```

## Conclusion

This Prettier setup ensures consistent, professional code formatting across the entire Digame platform. The automated scripts provide enterprise-grade features including backup creation, error handling, and comprehensive reporting.

For additional support or questions about the formatting system, refer to the official Prettier documentation at https://prettier.io/docs/en/