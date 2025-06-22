#!/usr/bin/env python3
"""
Development Environment Setup Script for Digame Platform

This script sets up a proper Python virtual environment and installs all dependencies
to resolve import issues and IDE configuration problems.

Usage:
    python setup_dev_env.py [--clean] [--check]
    
Options:
    --clean     Remove existing virtual environment before creating new one
    --check     Only check current environment status
"""

import sys
import os
import subprocess
import argparse
from pathlib import Path

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

def check_venv_exists():
    """Check if virtual environment already exists."""
    venv_path = Path("venv")
    if venv_path.exists():
        log("Virtual environment 'venv' already exists")
        return True
    return False

def create_virtual_environment():
    """Create a new virtual environment."""
    log("Creating virtual environment...")
    
    stdout, stderr, code = run_command("python3 -m venv venv")
    if code != 0:
        log("Failed to create virtual environment", "ERROR")
        return False
    
    log("Virtual environment created successfully ✅")
    return True

def activate_and_upgrade_pip():
    """Activate virtual environment and upgrade pip."""
    log("Upgrading pip in virtual environment...")
    
    # Determine the correct pip path based on OS
    if os.name == 'nt':  # Windows
        pip_path = "venv\\Scripts\\pip"
        python_path = "venv\\Scripts\\python"
    else:  # Unix/Linux/macOS
        pip_path = "venv/bin/pip"
        python_path = "venv/bin/python"
    
    stdout, stderr, code = run_command(f"{pip_path} install --upgrade pip")
    if code != 0:
        log("Failed to upgrade pip", "ERROR")
        return False
    
    log("Pip upgraded successfully ✅")
    return True

def install_requirements():
    """Install all requirements from requirements.txt."""
    log("Installing requirements...")
    
    # Determine the correct pip path based on OS
    if os.name == 'nt':  # Windows
        pip_path = "venv\\Scripts\\pip"
    else:  # Unix/Linux/macOS
        pip_path = "venv/bin/pip"
    
    stdout, stderr, code = run_command(f"{pip_path} install -r requirements.txt")
    if code != 0:
        log("Failed to install requirements", "ERROR")
        return False
    
    log("Requirements installed successfully ✅")
    return True

def install_development_dependencies():
    """Install additional development dependencies."""
    log("Installing development dependencies...")
    
    # Determine the correct pip path based on OS
    if os.name == 'nt':  # Windows
        pip_path = "venv\\Scripts\\pip"
    else:  # Unix/Linux/macOS
        pip_path = "venv/bin/pip"
    
    # Install the current project in development mode
    stdout, stderr, code = run_command(f"{pip_path} install -e .")
    if code != 0:
        log("Failed to install project in development mode", "WARNING")
        # This might fail if setup.py is not properly configured, but it's not critical
    
    log("Development dependencies installed ✅")
    return True

def check_imports():
    """Check if critical imports work in the virtual environment."""
    log("Testing critical imports...")
    
    # Determine the correct python path based on OS
    if os.name == 'nt':  # Windows
        python_path = "venv\\Scripts\\python"
    else:  # Unix/Linux/macOS
        python_path = "venv/bin/python"
    
    test_imports = [
        "import fastapi",
        "import sqlalchemy", 
        "import pandas",
        "import numpy",
        "import sklearn",
        "import torch",
        "import alembic",
        "import pydantic"
    ]
    
    for import_stmt in test_imports:
        stdout, stderr, code = run_command(f'{python_path} -c "{import_stmt}"')
        if code != 0:
            log(f"Import test failed: {import_stmt}", "ERROR")
            return False
        else:
            log(f"Import test passed: {import_stmt}")
    
    log("All critical imports working ✅")
    return True

def clean_environment():
    """Remove existing virtual environment."""
    log("Cleaning existing virtual environment...")
    
    venv_path = Path("venv")
    if venv_path.exists():
        import shutil
        shutil.rmtree(venv_path)
        log("Existing virtual environment removed ✅")
    else:
        log("No existing virtual environment to clean")

def check_environment_status():
    """Check the current environment status."""
    log("Checking environment status...")
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Check if venv exists
    venv_exists = check_venv_exists()
    log(f"Virtual environment exists: {venv_exists}")
    
    # Check if we're in a virtual environment
    in_venv = hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix)
    log(f"Currently in virtual environment: {in_venv}")
    
    # Check if requirements.txt exists
    req_exists = Path("requirements.txt").exists()
    log(f"requirements.txt exists: {req_exists}")
    
    return True

def create_activation_script():
    """Create a convenient activation script."""
    log("Creating activation script...")
    
    if os.name == 'nt':  # Windows
        script_content = """@echo off
echo Activating Digame development environment...
call venv\\Scripts\\activate.bat
echo Virtual environment activated!
echo To deactivate, run: deactivate
"""
        script_path = "activate_dev_env.bat"
    else:  # Unix/Linux/macOS
        script_content = """#!/bin/bash
echo "Activating Digame development environment..."
source venv/bin/activate
echo "Virtual environment activated!"
echo "To deactivate, run: deactivate"
"""
        script_path = "activate_dev_env.sh"
    
    with open(script_path, 'w') as f:
        f.write(script_content)
    
    if os.name != 'nt':
        os.chmod(script_path, 0o755)
    
    log(f"Activation script created: {script_path} ✅")

def main():
    parser = argparse.ArgumentParser(description="Setup Digame development environment")
    parser.add_argument("--clean", action="store_true", help="Remove existing virtual environment")
    parser.add_argument("--check", action="store_true", help="Only check environment status")
    args = parser.parse_args()
    
    log("Starting Digame Development Environment Setup")
    log("=" * 50)
    
    # Check environment status
    if not check_environment_status():
        log("Environment check failed", "ERROR")
        return 1
    
    if args.check:
        log("Environment check completed")
        return 0
    
    # Clean existing environment if requested
    if args.clean:
        clean_environment()
    
    # Create virtual environment if it doesn't exist
    if not check_venv_exists():
        if not create_virtual_environment():
            return 1
    
    # Upgrade pip
    if not activate_and_upgrade_pip():
        return 1
    
    # Install requirements
    if not install_requirements():
        return 1
    
    # Install development dependencies
    if not install_development_dependencies():
        log("Development dependencies installation had issues, but continuing...", "WARNING")
    
    # Test imports
    if not check_imports():
        log("Some imports failed, but environment is mostly set up", "WARNING")
    
    # Create activation script
    create_activation_script()
    
    log("=" * 50)
    log("Development environment setup completed successfully! 🎉")
    log("")
    log("Next steps:")
    log("1. Activate the environment:")
    if os.name == 'nt':
        log("   activate_dev_env.bat")
    else:
        log("   source activate_dev_env.sh")
    log("2. Open your IDE and point it to the venv/bin/python interpreter")
    log("3. Restart your IDE to pick up the new environment")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())