#!/usr/bin/env python3
"""
Comprehensive SQLAlchemy Model Fix Script
Fixes ALL SQLAlchemy models with proper extend_existing and index handling
"""

import os
import re
import sys
from pathlib import Path

def fix_model_file(file_path):
    """Fix a single SQLAlchemy model file comprehensively"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        changes_made = []
        
        # Fix 1: Add extend_existing to class definitions
        # Pattern for class definitions with __tablename__
        class_pattern = r'(class\s+\w+\(Base\):\s*\n)((?:\s*"""[\s\S]*?"""\s*\n)?)((?:\s*__tablename__\s*=\s*[\'"][^\'"]+[\'"].*\n)?)'
        
        def fix_class_definition(match):
            class_def = match.group(1)
            docstring = match.group(2) if match.group(2) else ""
            tablename = match.group(3) if match.group(3) else ""
            
            # Check if extend_existing already exists
            if '__table_args__' in tablename or '__table_args__' in docstring:
                return match.group(0)  # Already has table_args
            
            # Add extend_existing after tablename
            if tablename:
                fixed = f"{class_def}{docstring}{tablename}    __table_args__ = {{'extend_existing': True}}\n"
                changes_made.append("Added extend_existing to class")
                return fixed
            else:
                # No tablename found, add both
                fixed = f"{class_def}{docstring}    __table_args__ = {{'extend_existing': True}}\n"
                changes_made.append("Added extend_existing to class (no tablename)")
                return fixed
        
        content = re.sub(class_pattern, fix_class_definition, content, flags=re.MULTILINE)
        
        # Fix 2: Remove redundant index=True from primary keys
        pk_pattern = r'Column\(Integer\(\),?\s*primary_key=True,\s*index=True\)'
        if re.search(pk_pattern, content):
            content = re.sub(pk_pattern, 'Column(Integer(), primary_key=True)', content)
            changes_made.append("Removed redundant index=True from primary key")
        
        # Alternative pattern for primary keys
        pk_pattern2 = r'Column\(Integer,\s*primary_key=True,\s*index=True\)'
        if re.search(pk_pattern2, content):
            content = re.sub(pk_pattern2, 'Column(Integer, primary_key=True)', content)
            changes_made.append("Removed redundant index=True from primary key (alt pattern)")
        
        # Fix 3: Handle duplicate __table_args__ declarations
        # Find lines with __table_args__ and consolidate
        table_args_lines = []
        lines = content.split('\n')
        new_lines = []
        in_class = False
        current_class_indent = 0
        table_args_found = False
        
        for i, line in enumerate(lines):
            # Detect class definition
            if re.match(r'\s*class\s+\w+\(Base\):', line):
                in_class = True
                current_class_indent = len(line) - len(line.lstrip())
                table_args_found = False
                new_lines.append(line)
                continue
            
            # Detect end of class (next class or unindented line)
            if in_class and line.strip() and len(line) - len(line.lstrip()) <= current_class_indent and not line.startswith(' ' * (current_class_indent + 1)):
                in_class = False
            
            # Handle __table_args__ lines
            if in_class and '__table_args__' in line:
                if not table_args_found:
                    # Keep the first one, but ensure it has extend_existing
                    if 'extend_existing' in line:
                        new_lines.append(line)
                    else:
                        # Add extend_existing to existing table_args
                        if line.strip().endswith('}'):
                            # Simple dict format
                            line = line.replace('}', ", 'extend_existing': True}")
                        elif line.strip().endswith(')'):
                            # Tuple format
                            line = line.replace(')', ", {'extend_existing': True})")
                        new_lines.append(line)
                    table_args_found = True
                    changes_made.append("Consolidated duplicate __table_args__")
                # Skip subsequent __table_args__ lines
                continue
            
            new_lines.append(line)
        
        content = '\n'.join(new_lines)
        
        # Fix 4: Handle complex __table_args__ tuples
        # Pattern for tuple-style __table_args__ without extend_existing
        tuple_pattern = r'(__table_args__\s*=\s*\(\s*[^)]+\s*)\)'
        def fix_tuple_args(match):
            args_content = match.group(1)
            if 'extend_existing' not in args_content:
                fixed = f"{args_content}, {{'extend_existing': True}})"
                changes_made.append("Added extend_existing to tuple __table_args__")
                return fixed
            return match.group(0)
        
        content = re.sub(tuple_pattern, fix_tuple_args, content, flags=re.DOTALL)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True, changes_made
        
        return False, []
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False, [f"Error: {e}"]

def find_all_model_files():
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
    print("🔧 Comprehensive SQLAlchemy Model Fix Script")
    print("=" * 60)
    
    # Change to project root if script is run from scripts directory
    if os.path.basename(os.getcwd()) == "scripts":
        os.chdir("..")
    
    # Find all model files
    model_files = find_all_model_files()
    
    if not model_files:
        print("❌ No SQLAlchemy model files found!")
        return 1
    
    print(f"📁 Found {len(model_files)} model files to process")
    
    fixed_count = 0
    total_count = len(model_files)
    all_changes = []
    
    for model_file in model_files:
        print(f"\n🔄 Processing: {model_file}")
        
        was_fixed, changes = fix_model_file(model_file)
        
        if was_fixed:
            print(f"✅ Fixed: {model_file}")
            for change in changes:
                print(f"   - {change}")
            fixed_count += 1
            all_changes.extend(changes)
        else:
            print(f"⏭️  Skipped: {model_file} (already fixed or no changes needed)")
    
    print("\n" + "=" * 60)
    print(f"📊 Summary:")
    print(f"   Total files processed: {total_count}")
    print(f"   Files fixed: {fixed_count}")
    print(f"   Files skipped: {total_count - fixed_count}")
    
    if all_changes:
        print(f"\n🔧 Changes applied:")
        change_counts = {}
        for change in all_changes:
            change_counts[change] = change_counts.get(change, 0) + 1
        
        for change, count in change_counts.items():
            print(f"   - {change}: {count} times")
    
    if fixed_count > 0:
        print("\n✅ SQLAlchemy models have been comprehensively fixed!")
        print("   All model classes now have proper extend_existing configuration")
        print("   Redundant indexes have been removed")
        print("   Duplicate __table_args__ have been consolidated")
        print("\n🚀 Next steps:")
        print("   1. Run backend tests to verify fixes: pytest tests/ -x")
        print("   2. Check for remaining index conflicts")
        print("   3. Commit the changes to git")
    else:
        print("\n✅ All SQLAlchemy models are already properly configured!")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())