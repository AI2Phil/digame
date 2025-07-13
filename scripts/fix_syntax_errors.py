#!/usr/bin/env python3
"""
Quick syntax error fix for SQLAlchemy models
Fixes malformed __table_args__ declarations
"""

import os
import re
import sys
from pathlib import Path

def fix_syntax_errors(file_path):
    """Fix syntax errors in SQLAlchemy model files"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Fix malformed __table_args__ that start with dict but have orphaned Index lines
        # Pattern: __table_args__ = {'extend_existing': True}\n    Index(...)
        pattern = r"(__table_args__\s*=\s*\{'extend_existing':\s*True\})\s*\n(\s+Index\([^)]+\),?\s*\n)+"
        
        def fix_malformed_table_args(match):
            # Extract the orphaned Index lines
            full_match = match.group(0)
            lines = full_match.split('\n')
            
            # Find Index lines
            index_lines = []
            for line in lines[1:]:  # Skip the __table_args__ line
                if 'Index(' in line:
                    index_lines.append(line.strip().rstrip(','))
            
            if index_lines:
                # Create proper tuple format
                fixed = "    __table_args__ = (\n"
                for index_line in index_lines:
                    fixed += f"        {index_line},\n"
                fixed += "        {'extend_existing': True}\n    )"
                return fixed
            else:
                return match.group(1)  # Return original if no Index lines found
        
        content = re.sub(pattern, fix_malformed_table_args, content, flags=re.MULTILINE)
        
        # Fix orphaned closing parentheses
        content = re.sub(r'\n\s*\)\s*$', '', content, flags=re.MULTILINE)
        
        # Only write if content changed
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        
        return False
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return False

def main():
    """Main function to fix syntax errors"""
    print("🔧 SQLAlchemy Syntax Error Fix Script")
    print("=" * 50)
    
    # Change to project root if script is run from scripts directory
    if os.path.basename(os.getcwd()) == "scripts":
        os.chdir("..")
    
    # Find all model files
    model_files = []
    models_dir = Path("app/models")
    if models_dir.exists():
        for py_file in models_dir.glob("*.py"):
            if py_file.name != "__init__.py":
                model_files.append(py_file)
    
    if not model_files:
        print("❌ No model files found!")
        return 1
    
    print(f"📁 Checking {len(model_files)} model files for syntax errors")
    
    fixed_count = 0
    
    for model_file in model_files:
        was_fixed = fix_syntax_errors(model_file)
        if was_fixed:
            print(f"✅ Fixed syntax errors in: {model_file}")
            fixed_count += 1
    
    print(f"\n📊 Fixed syntax errors in {fixed_count} files")
    
    if fixed_count > 0:
        print("✅ Syntax errors have been fixed!")
    else:
        print("✅ No syntax errors found!")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())