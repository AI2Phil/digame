# Digame Platform Scripts

This directory contains utility scripts for development, maintenance, and troubleshooting of the Digame platform. Each script serves a specific purpose in the development workflow.

## 📋 Script Overview

| Script | Purpose | Usage | Status |
|--------|---------|-------|--------|
| [`activate_digame.sh`](#activate_digamesh) | Environment activation | `source scripts/activate_digame.sh` | ✅ Active |
| [`setup_dev_env.py`](#setup_dev_envpy) | Development environment setup | `python scripts/setup_dev_env.py` | ✅ Active |
| [`fix_dependencies_and_imports.py`](#fix_dependencies_and_importspy) | Comprehensive dependency fixes | `python scripts/fix_dependencies_and_imports.py` | ✅ Active |
| [`fix_circular_imports.py`](#fix_circular_importspy) | Circular import analysis | `python scripts/fix_circular_imports.py` | ✅ Active |
| [`fix_import_paths.py`](#fix_import_pathspy) | Import path corrections | `python scripts/fix_import_paths.py` | ✅ Active |
| [`fix_pyrefly_errors.py`](#fix_pyrefly_errorspy) | Static analysis error fixes | `python scripts/fix_pyrefly_errors.py` | ✅ Active |
| [`fix_remaining_test_errors.py`](#fix_remaining_test_errorspy) | Test-specific error fixes | `python scripts/fix_remaining_test_errors.py` | ✅ Active |
| [`verify_and_cleanup_fixes.py`](#verify_and_cleanup_fixespy) | Fix verification and cleanup | `python scripts/verify_and_cleanup_fixes.py` | ✅ Active |
| [`integration_helper.py`](#integration_helperpy) | Integration analysis tool | `python scripts/integration_helper.py` | ✅ Active |

---

## 🚀 Quick Start Scripts

### `activate_digame.sh`
**Purpose**: Convenient environment activation script for development

**Description**: 
- Activates the Python virtual environment
- Displays helpful commands for running the application
- Shows migration and deactivation instructions

**Usage**:
```bash
# Make executable (first time only)
chmod +x scripts/activate_digame.sh

# Activate environment
source scripts/activate_digame.sh
```

**Features**:
- ✅ Virtual environment activation
- ✅ Command reference display
- ✅ Cross-platform compatibility

---

### `setup_dev_env.py`
**Purpose**: Comprehensive development environment setup and configuration

**Description**: 
- Sets up Python virtual environment from scratch
- Installs all required dependencies
- Validates Python version compatibility
- Tests critical imports
- Creates activation scripts

**Usage**:
```bash
# Full setup (recommended for new environments)
python scripts/setup_dev_env.py

# Clean install (removes existing venv)
python scripts/setup_dev_env.py --clean

# Check current environment status
python scripts/setup_dev_env.py --check
```

**Features**:
- ✅ Python 3.8+ version validation
- ✅ Virtual environment creation
- ✅ Dependency installation from requirements.txt
- ✅ Development mode package installation
- ✅ Import testing and validation
- ✅ Cross-platform activation script creation
- ✅ Comprehensive logging and error reporting

**Output**: Creates `venv/` directory and platform-specific activation scripts

---

## 🔧 Development & Maintenance Scripts

### `fix_dependencies_and_imports.py`
**Purpose**: Comprehensive solution for dependency and import issues

**Description**: 
- Addresses all four priority areas of dependency management
- Sets up virtual environment if missing
- Resolves circular dependencies
- Fixes import paths and module references
- Creates missing function aliases

**Usage**:
```bash
# Run all fixes (recommended)
python scripts/fix_dependencies_and_imports.py --all

# Only setup environment
python scripts/fix_dependencies_and_imports.py --env

# Only fix imports
python scripts/fix_dependencies_and_imports.py --imports

# Check current status
python scripts/fix_dependencies_and_imports.py --check
```

**Features**:
- ✅ Virtual environment setup and validation
- ✅ Missing function import fixes (e.g., `train_behavioral_model` alias)
- ✅ Circular import resolution
- ✅ Import path corrections
- ✅ Missing `__init__.py` file creation
- ✅ Critical import testing

---

### `fix_circular_imports.py`
**Purpose**: Advanced circular import detection and resolution

**Description**: 
- Analyzes the entire codebase for circular dependencies
- Uses AST parsing for accurate import analysis
- Generates dependency graphs
- Provides fix suggestions and strategies
- Creates detailed analysis reports

**Usage**:
```bash
# Analyze circular imports (default)
python scripts/fix_circular_imports.py --analyze

# Generate detailed report
python scripts/fix_circular_imports.py --report

# Attempt automatic fixes
python scripts/fix_circular_imports.py --fix

# Analyze specific directory
python scripts/fix_circular_imports.py --directory digame/app
```

**Features**:
- ✅ AST-based import analysis
- ✅ Dependency graph construction
- ✅ Cycle detection algorithms
- ✅ Fix strategy suggestions (late imports, TYPE_CHECKING, module restructuring)
- ✅ Detailed markdown report generation
- ✅ JSON analysis results export

**Output**: 
- `circular_import_analysis.json` - Analysis results
- `import_analysis_report.md` - Detailed report (with --report flag)

---

### `fix_import_paths.py`
**Purpose**: Targeted import path correction and standardization

**Description**: 
- Analyzes import statements for common issues
- Fixes relative vs absolute import inconsistencies
- Corrects missing function references
- Updates problematic import patterns
- Creates missing function aliases

**Usage**:
```bash
# Analyze import paths (default)
python scripts/fix_import_paths.py --analyze

# Apply fixes
python scripts/fix_import_paths.py --fix

# Preview fixes without applying
python scripts/fix_import_paths.py --dry-run
```

**Features**:
- ✅ Import pattern analysis and detection
- ✅ Automatic fix suggestions
- ✅ Dry-run mode for safe testing
- ✅ Missing function alias creation
- ✅ Relative/absolute import standardization
- ✅ Missing model class detection

---

## 🧪 Testing & Quality Scripts

### `fix_pyrefly_errors.py`
**Purpose**: Resolve static analysis errors in test files

**Description**: 
- Addresses SQLAlchemy model instantiation issues in tests
- Creates proper mock object factories
- Fixes unittest.main() call issues
- Generates .pyrefly-ignore configuration

**Usage**:
```bash
# Fix all Pyrefly errors in test files
python scripts/fix_pyrefly_errors.py
```

**Features**:
- ✅ Mock SQLAlchemy model factory creation
- ✅ Test file pattern detection and fixing
- ✅ unittest.main() issue resolution
- ✅ .pyrefly-ignore configuration generation
- ✅ Automatic test file discovery

**Output**: 
- Modified test files with mock factories
- `.pyrefly-ignore` configuration file

---

### `fix_remaining_test_errors.py`
**Purpose**: Address remaining test-specific static analysis issues

**Description**: 
- Enhanced mock model factory with better attribute handling
- Fixes specific service reference issues
- Updates mock patterns for better static analysis compatibility
- Comprehensive .pyrefly-ignore pattern updates

**Usage**:
```bash
# Fix remaining test errors
python scripts/fix_remaining_test_errors.py
```

**Features**:
- ✅ Enhanced MockModel class with `__getattr__` fallback
- ✅ UserService.pwd_context reference fixes
- ✅ unittest.main() call corrections
- ✅ Comprehensive .pyrefly-ignore pattern updates
- ✅ Default attribute handling for SQLAlchemy models

---

### `verify_and_cleanup_fixes.py`
**Purpose**: Final verification and cleanup of applied fixes

**Description**: 
- Verifies the integrity of applied fixes
- Cleans up any incorrectly transformed code
- Ensures proper mock factory implementation
- Applies final adjustments to test files

**Usage**:
```bash
# Verify and cleanup all fixes
python scripts/verify_and_cleanup_fixes.py
```

**Features**:
- ✅ Fix verification and validation
- ✅ Assertion issue corrections
- ✅ Mock factory usage cleanup
- ✅ Multi-line call formatting fixes
- ✅ Final test file adjustments

---

## 🔗 Integration & Analysis Scripts

### `integration_helper.py`
**Purpose**: Analysis and assistance for platform integration tasks

**Description**: 
- Provides integration analysis capabilities
- Assists with component migration and integration
- Analyzes compatibility between different platform versions
- Supports the DigitalTwinPro integration framework

**Usage**:
```bash
# Run integration analysis
python scripts/integration_helper.py --analyze

# Additional integration tasks (see script for specific options)
python scripts/integration_helper.py --help
```

**Features**:
- ✅ Integration compatibility analysis
- ✅ Component migration assistance
- ✅ Platform version comparison
- ✅ Integration framework support

---

## 📊 Script Execution Workflow

### For New Development Environment Setup:
```bash
1. python scripts/setup_dev_env.py --clean
2. source scripts/activate_digame.sh
3. python scripts/fix_dependencies_and_imports.py --check
```

### For Import Issue Resolution:
```bash
1. python scripts/fix_circular_imports.py --analyze --report
2. python scripts/fix_import_paths.py --fix
3. python scripts/fix_dependencies_and_imports.py --imports
```

### For Test Error Resolution:
```bash
1. python scripts/fix_pyrefly_errors.py
2. python scripts/fix_remaining_test_errors.py
3. python scripts/verify_and_cleanup_fixes.py
```

### For Integration Tasks:
```bash
1. python scripts/integration_helper.py --analyze
2. # Follow integration-specific workflow based on analysis results
```

---

## 🛠️ Common Use Cases

### **New Developer Onboarding**
```bash
# Complete environment setup for new developers
python scripts/setup_dev_env.py --clean
source scripts/activate_digame.sh
python scripts/fix_dependencies_and_imports.py --check
```

### **Resolving Import Errors**
```bash
# Comprehensive import issue resolution
python scripts/fix_circular_imports.py --analyze
python scripts/fix_import_paths.py --fix
python scripts/fix_dependencies_and_imports.py --imports
```

### **Fixing Test Issues**
```bash
# Complete test error resolution workflow
python scripts/fix_pyrefly_errors.py
python scripts/fix_remaining_test_errors.py
python scripts/verify_and_cleanup_fixes.py
```

### **Environment Troubleshooting**
```bash
# Diagnose and fix environment issues
python scripts/setup_dev_env.py --check
python scripts/fix_dependencies_and_imports.py --all
```

---

## 📝 Script Dependencies

### **Python Requirements**:
- Python 3.8+
- Standard library modules (ast, os, sys, subprocess, pathlib, etc.)
- Project dependencies (when testing imports)

### **System Requirements**:
- Unix/Linux/macOS or Windows
- Virtual environment support
- Write permissions in project directory

---

## 🔍 Troubleshooting

### **Common Issues**:

1. **Permission Errors**:
   ```bash
   chmod +x scripts/activate_digame.sh
   ```

2. **Python Version Issues**:
   ```bash
   python scripts/setup_dev_env.py --check
   ```

3. **Import Errors Persist**:
   ```bash
   python scripts/fix_dependencies_and_imports.py --all
   python scripts/fix_circular_imports.py --fix
   ```

4. **Test Errors Continue**:
   ```bash
   python scripts/fix_pyrefly_errors.py
   python scripts/fix_remaining_test_errors.py
   ```

### **Getting Help**:
- Most scripts support `--help` flag for detailed usage information
- Check script output logs for specific error messages
- Review generated reports (`.json`, `.md` files) for detailed analysis

---

## 📈 Script Maintenance

### **Adding New Scripts**:
1. Place script in `/scripts/` directory
2. Update this README.md with script documentation
3. Follow naming convention: `action_target.py` or `action_target.sh`
4. Include proper argument parsing and help text
5. Add logging and error handling

### **Script Standards**:
- ✅ Comprehensive argument parsing with `--help`
- ✅ Detailed logging with timestamps
- ✅ Error handling and graceful failure
- ✅ Dry-run modes where applicable
- ✅ Clear success/failure indicators
- ✅ Cross-platform compatibility

---

*Last Updated: June 22, 2025*
*Digame Platform Development Team*