#!/usr/bin/env python3
"""
Emergency SQLAlchemy Model Fix Script
Fixes critical syntax errors caused by previous automated fixes
"""

import os
import ast
import sys
from pathlib import Path

def validate_python_syntax(file_path):
    """Check if a Python file has valid syntax"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        ast.parse(content)
        return True, None
    except SyntaxError as e:
        return False, str(e)
    except Exception as e:
        return False, f"Error reading file: {e}"

def find_syntax_errors():
    """Find all model files with syntax errors"""
    error_files = []
    models_dir = Path("app/models")
    
    if not models_dir.exists():
        print("❌ app/models directory not found!")
        return []
    
    for py_file in models_dir.glob("*.py"):
        if py_file.name == "__init__.py":
            continue
            
        is_valid, error = validate_python_syntax(py_file)
        if not is_valid:
            error_files.append((py_file, error))
    
    return error_files

def main():
    """Main function to identify syntax errors"""
    print("🚨 Emergency SQLAlchemy Model Syntax Check")
    print("=" * 60)
    
    # Change to project root if script is run from scripts directory
    if os.path.basename(os.getcwd()) == "scripts":
        os.chdir("..")
    
    error_files = find_syntax_errors()
    
    if not error_files:
        print("✅ All model files have valid Python syntax!")
        return 0
    
    print(f"❌ Found {len(error_files)} files with syntax errors:")
    print()
    
    for file_path, error in error_files:
        print(f"🔴 {file_path}")
        print(f"   Error: {error}")
        print()
    
    print("🔧 These files need manual fixing or regeneration.")
    print("   The automated script corrupted the syntax.")
    print("   Consider restoring from git or fixing manually.")
    
    return 1

if __name__ == "__main__":
    sys.exit(main())