#!/usr/bin/env python3
"""
SQLAlchemy Model Fix Script
Adds __table_args__ = {'extend_existing': True} to all model classes
"""

import os
import re
import sys
from pathlib import Path

def fix_sqlalchemy_model(file_path):
    """Fix a single SQLAlchemy model file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Pattern to match class definitions that inherit from Base
        class_pattern = r'(class\s+\w+\(Base\):\s*\n)((?:\s*"""[\s\S]*?"""\s*\n)?)'
        
        def replace_class(match):
            class_def = match.group(1)
            docstring = match.group(2) if match.group(2) else ""
            
            # Check if __table_args__ already exists
            if '__table_args__' in docstring or '__table_args__' in class_def:
                return match.group(0)  # No change needed
            
            # Add __table_args__ after the class definition and docstring
            if docstring:
                return f"{class_def}{docstring}    __table_args__ = {{'extend_existing': True}}\n"
            else:
                return f"{class_def}    __table_args__ = {{'extend_existing': True}}\n"
        
        # Apply the fix
        fixed_content = re.sub(class_pattern, replace_class, content, flags=re.MULTILINE)
        
        # Only write if content changed
        if fixed_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def find_model_files():
    """Find all Python files containing SQLAlchemy models"""
    model_files = []
    
    # Search in app/models directory
    models_dir = Path("app/models")
    if models_dir.exists():
        for py_file in models_dir.glob("*.py"):
            if py_file.name != "__init__.py":
                # Check if file contains Base inheritance
                try:
                    with open(py_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if re.search(r'class\s+\w+\(Base\):', content):
                            model_files.append(py_file)
                except Exception as e:
                    print(f"Error reading {py_file}: {e}")
    
    return model_files

def main():
    """Main function to fix all SQLAlchemy models"""
    print("🔧 SQLAlchemy Model Fix Script")
    print("=" * 50)
    
    # Change to project root if script is run from scripts directory
    if os.path.basename(os.getcwd()) == "scripts":
        os.chdir("..")
    
    # Find all model files
    model_files = find_model_files()
    
    if not model_files:
        print("❌ No SQLAlchemy model files found!")
        return 1
    
    print(f"📁 Found {len(model_files)} model files to process")
    
    fixed_count = 0
    total_count = len(model_files)
    
    for model_file in model_files:
        print(f"🔄 Processing: {model_file}")
        
        if fix_sqlalchemy_model(model_file):
            print(f"✅ Fixed: {model_file}")
            fixed_count += 1
        else:
            print(f"⏭️  Skipped: {model_file} (already fixed or no changes needed)")
    
    print("\n" + "=" * 50)
    print(f"📊 Summary:")
    print(f"   Total files processed: {total_count}")
    print(f"   Files fixed: {fixed_count}")
    print(f"   Files skipped: {total_count - fixed_count}")
    
    if fixed_count > 0:
        print("\n✅ SQLAlchemy models have been fixed!")
        print("   All model classes now have __table_args__ = {'extend_existing': True}")
        print("\n🚀 Next steps:")
        print("   1. Run backend tests to verify fixes")
        print("   2. Commit the changes to git")
    else:
        print("\n✅ All SQLAlchemy models are already properly configured!")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())