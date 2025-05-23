#!/usr/bin/env python3
"""
Import Path Correction Script for Digame Platform

This script analyzes and fixes import path issues in the codebase to resolve
module reference errors and improve IDE compatibility.

Usage:
    python fix_import_paths.py [--analyze] [--fix] [--dry-run]
    
Options:
    --analyze   Analyze import paths for issues
    --fix       Apply fixes to import paths
    --dry-run   Show what would be fixed without making changes
"""

import os
import re
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Tuple, Set, Optional
import ast

def log(message, level="INFO"):
    """Log a message with timestamp."""
    import time
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")

class ImportPathFixer:
    """Class to analyze and fix import paths."""
    
    def __init__(self, base_path: str = "digame"):
        self.base_path = Path(base_path)
        self.issues = []
        self.fixes_applied = []
        
    def find_python_files(self) -> List[Path]:
        """Find all Python files in the project."""
        python_files = []
        for path in self.base_path.rglob("*.py"):
            if "__pycache__" not in str(path):
                python_files.append(path)
        return python_files
    
    def analyze_file(self, file_path: Path) -> List[Dict]:
        """Analyze a single file for import issues."""
        issues = []
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
            
            for line_num, line in enumerate(lines, 1):
                line = line.strip()
                
                # Check for problematic import patterns
                if line.startswith('from ') or line.startswith('import '):
                    issue = self.check_import_line(line, file_path, line_num)
                    if issue:
                        issues.append(issue)
                        
        except Exception as e:
            log(f"Error analyzing {file_path}: {e}", "ERROR")
            
        return issues
    
    def check_import_line(self, line: str, file_path: Path, line_num: int) -> Optional[Dict]:
        """Check a single import line for issues."""
        # Common problematic patterns
        problematic_patterns = [
            # Circular import patterns
            (r'from \.\.behavior import', 'Potential circular import with behavior module'),
            (r'from \.\.services\.behavior_service import.*train_behavioral_model', 'Missing function in behavior_service'),
            
            # Incorrect relative imports
            (r'from \.\.\.', 'Triple dot relative import - check if correct'),
            
            # Missing modules
            (r'from \.\.models\.activity_features import ActivityEnrichedFeature', 'Check if ActivityEnrichedFeature exists'),
            
            # Inconsistent import styles
            (r'from digame\.app\.', 'Mixed absolute/relative imports - should be relative'),
        ]
        
        for pattern, description in problematic_patterns:
            if re.search(pattern, line):
                return {
                    'file': file_path,
                    'line_num': line_num,
                    'line': line,
                    'issue': description,
                    'pattern': pattern
                }
        
        return None
    
    def suggest_fix(self, issue: Dict) -> str:
        """Suggest a fix for an import issue."""
        line = issue['line']
        pattern = issue['pattern']
        
        # Specific fixes for known patterns
        if 'train_behavioral_model' in line:
            return line.replace('train_behavioral_model', 'train_and_save_behavior_model')
        
        elif 'from ...behavior import' in line:
            return line.replace('from ...behavior import', 'from ..behavior import')
        
        elif 'from digame.app.' in line:
            # Convert absolute to relative import
            relative_import = line.replace('from digame.app.', 'from .')
            return relative_import
        
        elif 'ActivityEnrichedFeature' in line:
            # This might need to be removed or replaced
            return f"# {line}  # TODO: Check if ActivityEnrichedFeature model exists"
        
        return line  # No fix suggested
    
    def apply_fix(self, file_path: Path, line_num: int, old_line: str, new_line: str, dry_run: bool = False) -> bool:
        """Apply a fix to a file."""
        if dry_run:
            log(f"DRY RUN - Would fix {file_path}:{line_num}")
            log(f"  OLD: {old_line}")
            log(f"  NEW: {new_line}")
            return True
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            if line_num <= len(lines):
                lines[line_num - 1] = new_line + '\n'
                
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.writelines(lines)
                
                log(f"Fixed {file_path}:{line_num}")
                return True
            else:
                log(f"Line number {line_num} out of range in {file_path}", "ERROR")
                return False
                
        except Exception as e:
            log(f"Error applying fix to {file_path}: {e}", "ERROR")
            return False
    
    def analyze_all_files(self) -> List[Dict]:
        """Analyze all Python files for import issues."""
        log("Analyzing import paths...")
        
        python_files = self.find_python_files()
        log(f"Found {len(python_files)} Python files")
        
        all_issues = []
        for file_path in python_files:
            issues = self.analyze_file(file_path)
            all_issues.extend(issues)
        
        self.issues = all_issues
        return all_issues
    
    def fix_all_issues(self, dry_run: bool = False) -> int:
        """Fix all identified import issues."""
        if not self.issues:
            log("No issues to fix")
            return 0
        
        fixes_applied = 0
        for issue in self.issues:
            suggested_fix = self.suggest_fix(issue)
            if suggested_fix != issue['line']:
                success = self.apply_fix(
                    issue['file'], 
                    issue['line_num'], 
                    issue['line'], 
                    suggested_fix, 
                    dry_run
                )
                if success:
                    fixes_applied += 1
                    self.fixes_applied.append({
                        'file': issue['file'],
                        'line_num': issue['line_num'],
                        'old': issue['line'],
                        'new': suggested_fix
                    })
        
        return fixes_applied

def create_missing_functions():
    """Create missing functions that are being imported."""
    log("Checking for missing functions...")
    
    # Check if train_behavioral_model exists in behavior_service
    behavior_service_path = Path("digame/app/services/behavior_service.py")
    if behavior_service_path.exists():
        with open(behavior_service_path, 'r') as f:
            content = f.read()
        
        if 'def train_behavioral_model(' not in content:
            log("Adding missing train_behavioral_model function alias")
            
            # Add alias at the end of the file
            alias_code = """

# Alias for backward compatibility
def train_behavioral_model(*args, **kwargs):
    \"\"\"Alias for train_and_save_behavior_model for backward compatibility.\"\"\"
    return train_and_save_behavior_model(*args, **kwargs)
"""
            
            with open(behavior_service_path, 'a') as f:
                f.write(alias_code)
            
            log("Added train_behavioral_model alias ✅")

def check_missing_models():
    """Check for missing model classes."""
    log("Checking for missing model classes...")
    
    # Check if ActivityEnrichedFeature exists
    activity_features_path = Path("digame/app/models/activity_features.py")
    if activity_features_path.exists():
        with open(activity_features_path, 'r') as f:
            content = f.read()
        
        if 'class ActivityEnrichedFeature' not in content:
            log("ActivityEnrichedFeature class not found", "WARNING")
            log("This may cause import errors in some files")
    else:
        log("activity_features.py not found", "WARNING")

def update_init_files():
    """Update __init__.py files to properly export modules."""
    log("Updating __init__.py files...")
    
    init_files = [
        "digame/app/__init__.py",
        "digame/app/models/__init__.py",
        "digame/app/services/__init__.py",
        "digame/app/routers/__init__.py",
        "digame/app/crud/__init__.py"
    ]
    
    for init_file in init_files:
        init_path = Path(init_file)
        if not init_path.exists():
            # Create empty __init__.py
            init_path.parent.mkdir(parents=True, exist_ok=True)
            with open(init_path, 'w') as f:
                f.write('"""Package initialization."""\n')
            log(f"Created {init_file}")

def main():
    parser = argparse.ArgumentParser(description="Fix import paths in Digame platform")
    parser.add_argument("--analyze", action="store_true", help="Analyze import paths")
    parser.add_argument("--fix", action="store_true", help="Apply fixes")
    parser.add_argument("--dry-run", action="store_true", help="Show fixes without applying")
    args = parser.parse_args()
    
    if not any([getattr(args, 'analyze', False), getattr(args, 'fix', False), getattr(args, 'dry_run', False)]):
        # Default to analyze
        setattr(args, 'analyze', True)
    
    log("Starting Import Path Analysis and Fixes")
    log("=" * 50)
    
    # Initialize fixer
    fixer = ImportPathFixer()
    
    # Analyze issues
    issues = fixer.analyze_all_files()
    
    log(f"Found {len(issues)} import issues")
    
    if issues:
        log("Import issues found:")
        for issue in issues:
            log(f"  {issue['file']}:{issue['line_num']} - {issue['issue']}")
            log(f"    {issue['line']}")
    
    # Apply fixes if requested
    if args.fix or args.dry_run:
        fixes_applied = fixer.fix_all_issues(dry_run=args.dry_run)
        
        if args.dry_run:
            log(f"DRY RUN: Would apply {fixes_applied} fixes")
        else:
            log(f"Applied {fixes_applied} fixes")
    
    # Additional fixes
    if args.fix and not args.dry_run:
        create_missing_functions()
        check_missing_models()
        update_init_files()
    
    log("=" * 50)
    if issues:
        log(f"Import path analysis completed with {len(issues)} issues found")
        if args.fix and not args.dry_run:
            log("Fixes have been applied - restart your IDE to see changes")
        return 1
    else:
        log("No import path issues found! ✅")
        return 0

if __name__ == "__main__":
    sys.exit(main())