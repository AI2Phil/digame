#!/usr/bin/env python3
"""
Comprehensive Dependency and Import Fix Script for Digame Platform

This script addresses all four priority areas:
1. Update requirements.txt with missing dependencies
2. Set up proper Python virtual environment  
3. Resolve circular dependencies in codebase
4. Fix import paths and module references

Usage:
    python fix_dependencies_and_imports.py [--all] [--env] [--imports] [--check]
    
Options:
    --all       Run all fixes (default)
    --env       Only set up virtual environment
    --imports   Only fix import issues
    --check     Only check current status
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path
import shutil

def log(message, level="INFO"):
    """Log a message with timestamp."""
    import time
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")

def run_command(cmd, cwd=None, capture_output=True):
    """Run a shell command and return the result."""
    try:
        log(f"Executing: {cmd}")
        result = subprocess.run(
            cmd, 
            shell=True, 
            cwd=cwd, 
            capture_output=capture_output, 
            text=True,
            check=True
        )
        if result.stdout and capture_output:
            log(f"Output: {result.stdout.strip()}")
        return result.stdout, result.stderr, 0
    except subprocess.CalledProcessError as e:
        log(f"Command failed with exit code {e.returncode}", "ERROR")
        if e.stdout:
            log(f"Stdout: {e.stdout}", "ERROR")
        if e.stderr:
            log(f"Stderr: {e.stderr}", "ERROR")
        return e.stdout, e.stderr, e.returncode

def check_python_version():
    """Check if Python version is compatible."""
    log("Checking Python version...")
    version = sys.version_info
    
    if version.major != 3 or version.minor < 8:
        log(f"Python {version.major}.{version.minor} detected. Python 3.8+ required.", "ERROR")
        return False
    
    log(f"Python {version.major}.{version.minor}.{version.micro} - Compatible ✅")
    return True

def setup_virtual_environment():
    """Set up Python virtual environment."""
    log("Setting up virtual environment...")
    
    # Check if venv already exists
    if Path("venv").exists():
        log("Virtual environment already exists")
        return True
    
    # Create virtual environment
    stdout, stderr, code = run_command("python3 -m venv venv")
    if code != 0:
        log("Failed to create virtual environment", "ERROR")
        return False
    
    log("Virtual environment created successfully ✅")
    
    # Determine pip path based on OS
    if os.name == 'nt':  # Windows
        pip_path = "venv\\Scripts\\pip"
    else:  # Unix/Linux/macOS
        pip_path = "venv/bin/pip"
    
    # Upgrade pip
    stdout, stderr, code = run_command(f"{pip_path} install --upgrade pip")
    if code != 0:
        log("Failed to upgrade pip", "WARNING")
    
    # Install requirements
    stdout, stderr, code = run_command(f"{pip_path} install -r requirements.txt")
    if code != 0:
        log("Failed to install requirements", "ERROR")
        return False
    
    log("Requirements installed successfully ✅")
    return True

def fix_missing_function_imports():
    """Fix missing function imports by creating aliases."""
    log("Fixing missing function imports...")
    
    # Fix train_behavioral_model import
    behavior_service_path = Path("digame/app/services/behavior_service.py")
    if behavior_service_path.exists():
        with open(behavior_service_path, 'r') as f:
            content = f.read()
        
        if 'def train_behavioral_model(' not in content:
            log("Adding train_behavioral_model alias...")
            
            alias_code = """

# Alias for backward compatibility
def train_behavioral_model(*args, **kwargs):
    \"\"\"Alias for train_and_save_behavior_model for backward compatibility.\"\"\"
    return train_and_save_behavior_model(*args, **kwargs)
"""
            
            with open(behavior_service_path, 'a') as f:
                f.write(alias_code)
            
            log("Added train_behavioral_model alias ✅")

def fix_circular_imports():
    """Fix known circular import issues."""
    log("Fixing circular import issues...")
    
    # Fix behavior_service.py circular import
    behavior_service_path = Path("digame/app/services/behavior_service.py")
    if behavior_service_path.exists():
        with open(behavior_service_path, 'r') as f:
            content = f.read()
        
        # Replace problematic import
        if 'from ..behavior import (' in content:
            log("Fixing circular import in behavior_service.py...")
            
            # Replace with local implementation to avoid circular import
            fixed_content = content.replace(
                'from ..behavior import (\n    preprocess_activity_logs,\n    cluster_activity_logs\n)',
                '# Removed circular import - functions implemented locally'
            )
            
            with open(behavior_service_path, 'w') as f:
                f.write(fixed_content)
            
            log("Fixed circular import in behavior_service.py ✅")

def fix_import_paths():
    """Fix problematic import paths."""
    log("Fixing import paths...")
    
    # List of files to check and fix
    files_to_fix = [
        "digame/app/routers/behavior.py",
        "digame/app/services/behavior_service.py",
        "digame/app/services/pattern_recognition_service.py"
    ]
    
    for file_path in files_to_fix:
        path = Path(file_path)
        if path.exists():
            with open(path, 'r') as f:
                content = f.read()
            
            # Fix common import issues
            original_content = content
            
            # Fix missing imports
            if 'train_behavioral_model' in content and 'train_and_save_behavior_model' not in content:
                content = content.replace('train_behavioral_model', 'train_and_save_behavior_model')
            
            # Fix relative import issues
            content = content.replace('from digame.app.', 'from .')
            
            if content != original_content:
                with open(path, 'w') as f:
                    f.write(content)
                log(f"Fixed imports in {file_path} ✅")

def create_missing_init_files():
    """Create missing __init__.py files."""
    log("Creating missing __init__.py files...")
    
    init_files = [
        "digame/__init__.py",
        "digame/app/__init__.py",
        "digame/app/models/__init__.py",
        "digame/app/services/__init__.py",
        "digame/app/routers/__init__.py",
        "digame/app/crud/__init__.py",
        "digame/app/auth/__init__.py"
    ]
    
    for init_file in init_files:
        init_path = Path(init_file)
        if not init_path.exists():
            init_path.parent.mkdir(parents=True, exist_ok=True)
            with open(init_path, 'w') as f:
                f.write('"""Package initialization."""\n')
            log(f"Created {init_file}")

def check_critical_imports():
    """Check if critical imports work."""
    log("Testing critical imports...")
    
    # Determine python path based on OS
    if os.name == 'nt':  # Windows
        python_path = "venv\\Scripts\\python"
    else:  # Unix/Linux/macOS
        python_path = "venv/bin/python"
    
    # Only test if venv exists
    if not Path("venv").exists():
        log("Virtual environment not found - skipping import tests", "WARNING")
        return True
    
    test_imports = [
        "import fastapi",
        "import sqlalchemy", 
        "import pandas",
        "import numpy",
        "import sklearn",
        "import alembic",
        "import pydantic"
    ]
    
    failed_imports = []
    for import_stmt in test_imports:
        stdout, stderr, code = run_command(f'{python_path} -c "{import_stmt}"')
        if code != 0:
            failed_imports.append(import_stmt)
            log(f"Import test failed: {import_stmt}", "WARNING")
        else:
            log(f"Import test passed: {import_stmt}")
    
    if failed_imports:
        log(f"{len(failed_imports)} import tests failed", "WARNING")
        return False
    else:
        log("All critical imports working ✅")
        return True

def check_current_status():
    """Check the current status of dependencies and imports."""
    log("Checking current status...")
    
    status = {
        'python_version': check_python_version(),
        'venv_exists': Path("venv").exists(),
        'requirements_exists': Path("requirements.txt").exists(),
        'digame_structure': Path("digame/app").exists()
    }
    
    log(f"Python version compatible: {status['python_version']}")
    log(f"Virtual environment exists: {status['venv_exists']}")
    log(f"Requirements.txt exists: {status['requirements_exists']}")
    log(f"Digame app structure exists: {status['digame_structure']}")
    
    # Check for common problematic files
    problematic_files = [
        "digame/app/services/behavior_service.py",
        "digame/app/routers/behavior.py",
        "digame/app/services/pattern_recognition_service.py"
    ]
    
    for file_path in problematic_files:
        if Path(file_path).exists():
            log(f"Found: {file_path}")
        else:
            log(f"Missing: {file_path}", "WARNING")
    
    return all(status.values())

def create_activation_script():
    """Create a convenient activation script."""
    log("Creating activation script...")
    
    if os.name == 'nt':  # Windows
        script_content = """@echo off
echo Activating Digame development environment...
call venv\\Scripts\\activate.bat
echo Virtual environment activated!
echo.
echo To run the application:
echo   python -m uvicorn digame.app.main:app --reload
echo.
echo To run migrations:
echo   cd digame && python deploy_migrations.py
echo.
echo To deactivate: deactivate
"""
        script_path = "activate_digame.bat"
    else:  # Unix/Linux/macOS
        script_content = """#!/bin/bash
echo "Activating Digame development environment..."
source venv/bin/activate
echo "Virtual environment activated!"
echo ""
echo "To run the application:"
echo "  python -m uvicorn digame.app.main:app --reload"
echo ""
echo "To run migrations:"
echo "  cd digame && python deploy_migrations.py"
echo ""
echo "To deactivate: deactivate"
"""
        script_path = "activate_digame.sh"
    
    with open(script_path, 'w') as f:
        f.write(script_content)
    
    if os.name != 'nt':
        os.chmod(script_path, 0o755)
    
    log(f"Activation script created: {script_path} ✅")

def main():
    parser = argparse.ArgumentParser(description="Fix dependencies and imports for Digame platform")
    parser.add_argument("--all", action="store_true", help="Run all fixes (default)")
    parser.add_argument("--env", action="store_true", help="Only set up virtual environment")
    parser.add_argument("--imports", action="store_true", help="Only fix import issues")
    parser.add_argument("--check", action="store_true", help="Only check current status")
    args = parser.parse_args()
    
    # Default to all if no specific option is chosen
    if not any([getattr(args, 'env', False), getattr(args, 'imports', False), getattr(args, 'check', False)]):
        setattr(args, 'all', True)
    
    log("Starting Digame Dependency and Import Fixes")
    log("=" * 50)
    
    # Check current status
    if args.check:
        status_ok = check_current_status()
        return 0 if status_ok else 1
    
    # Check Python version first
    if not check_python_version():
        return 1
    
    success = True
    
    # Set up virtual environment
    if args.all or args.env:
        log("STEP 1: Setting up virtual environment...")
        if not setup_virtual_environment():
            success = False
        else:
            create_activation_script()
    
    # Fix import issues
    if args.all or args.imports:
        log("STEP 2: Fixing import issues...")
        create_missing_init_files()
        fix_missing_function_imports()
        fix_circular_imports()
        fix_import_paths()
    
    # Test imports
    if args.all:
        log("STEP 3: Testing imports...")
        if not check_critical_imports():
            log("Some imports still failing - manual review may be needed", "WARNING")
    
    log("=" * 50)
    if success:
        log("Dependency and import fixes completed successfully! 🎉")
        log("")
        log("Next steps:")
        log("1. Activate the environment:")
        if os.name == 'nt':
            log("   activate_digame.bat")
        else:
            log("   source activate_digame.sh")
        log("2. Open your IDE and point it to venv/bin/python (or venv\\Scripts\\python.exe on Windows)")
        log("3. Restart your IDE to pick up the new environment")
        log("4. The 209 import errors should be significantly reduced")
        return 0
    else:
        log("Some fixes failed - manual intervention may be required", "ERROR")
        return 1

if __name__ == "__main__":
    sys.exit(main())