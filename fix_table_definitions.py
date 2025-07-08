#!/usr/bin/env python3
"""
Script to fix SQLAlchemy table definition conflicts by adding extend_existing=True
"""

import re
import os

def fix_model_file(filepath):
    """Fix table definitions in a model file"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Pattern to match class definitions with __tablename__
    pattern = r'(class\s+\w+\(Base\):[^}]*?__tablename__\s*=\s*["\'][^"\']+["\'])'
    
    def add_table_args(match):
        class_def = match.group(1)
        if '__table_args__' not in class_def:
            # Find the line after __tablename__
            lines = class_def.split('\n')
            for i, line in enumerate(lines):
                if '__tablename__' in line:
                    # Insert __table_args__ after __tablename__
                    indent = len(line) - len(line.lstrip())
                    table_args_line = ' ' * indent + "__table_args__ = {'extend_existing': True}"
                    lines.insert(i + 1, table_args_line)
                    break
            return '\n'.join(lines)
        return class_def
    
    # Apply the fix
    fixed_content = re.sub(pattern, add_table_args, content, flags=re.DOTALL)
    
    # Write back if changed
    if fixed_content != content:
        with open(filepath, 'w') as f:
            f.write(fixed_content)
        print(f"Fixed: {filepath}")
        return True
    return False

# Fix all model files
model_files = [
    'app/models/workflow_automation.py',
    'app/models/reporting.py',
    'app/models/enterprise_dashboard.py',
    'app/models/market_intelligence.py',
    'app/models/performance_monitoring.py',
    'app/models/integration.py',
    'app/models/enterprise_sso.py',
    'app/models/twin_phase5.py',
    'app/models/twin_phase4.py',
    'app/models/simulation.py',
    'app/models/analytics.py'
]

for filepath in model_files:
    if os.path.exists(filepath):
        fix_model_file(filepath)
    else:
        print(f"File not found: {filepath}")