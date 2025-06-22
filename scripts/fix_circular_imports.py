#!/usr/bin/env python3
"""
Circular Import Detection and Resolution Script for Digame Platform

This script analyzes the codebase for circular import dependencies and provides
automated fixes where possible.

Usage:
    python fix_circular_imports.py [--analyze] [--fix] [--report]
    
Options:
    --analyze   Analyze the codebase for circular imports
    --fix       Attempt to automatically fix circular imports
    --report    Generate a detailed report of import dependencies
"""

import ast
import os
import sys
import argparse
from pathlib import Path
from typing import Dict, List, Set, Tuple
from collections import defaultdict, deque
import json

class ImportAnalyzer(ast.NodeVisitor):
    """AST visitor to analyze imports in Python files."""
    
    def __init__(self, file_path: str, base_path: str):
        self.file_path = file_path
        self.base_path = base_path
        self.imports = []
        self.from_imports = []
        
    def visit_Import(self, node):
        """Visit import statements."""
        for alias in node.names:
            self.imports.append({
                'module': alias.name,
                'alias': alias.asname,
                'line': node.lineno,
                'type': 'import'
            })
        self.generic_visit(node)
    
    def visit_ImportFrom(self, node):
        """Visit from...import statements."""
        if node.module:
            for alias in node.names:
                self.from_imports.append({
                    'module': node.module,
                    'name': alias.name,
                    'alias': alias.asname,
                    'line': node.lineno,
                    'level': node.level,
                    'type': 'from_import'
                })
        self.generic_visit(node)

def log(message, level="INFO"):
    """Log a message with timestamp."""
    import time
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")

def find_python_files(directory: str) -> List[str]:
    """Find all Python files in the directory."""
    python_files = []
    for root, dirs, files in os.walk(directory):
        # Skip __pycache__ directories
        dirs[:] = [d for d in dirs if d != '__pycache__']
        
        for file in files:
            if file.endswith('.py'):
                python_files.append(os.path.join(root, file))
    
    return python_files

def analyze_file_imports(file_path: str, base_path: str) -> Dict:
    """Analyze imports in a single Python file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        tree = ast.parse(content)
        analyzer = ImportAnalyzer(file_path, base_path)
        analyzer.visit(tree)
        
        return {
            'file': file_path,
            'imports': analyzer.imports,
            'from_imports': analyzer.from_imports
        }
    except Exception as e:
        log(f"Error analyzing {file_path}: {e}", "ERROR")
        return {'file': file_path, 'imports': [], 'from_imports': []}

def build_dependency_graph(files_data: List[Dict], base_path: str) -> Dict[str, Set[str]]:
    """Build a dependency graph from import data."""
    graph = defaultdict(set)
    
    for file_data in files_data:
        file_path = file_data['file']
        # Convert to module path
        rel_path = os.path.relpath(file_path, base_path)
        module_path = rel_path.replace(os.sep, '.').replace('.py', '')
        
        # Process imports
        for imp in file_data['imports'] + file_data['from_imports']:
            target_module = imp['module']
            
            # Handle relative imports
            if imp.get('level', 0) > 0:
                # Relative import
                parts = module_path.split('.')
                if imp['level'] == 1:
                    # Same package
                    if len(parts) > 1:
                        target_module = '.'.join(parts[:-1]) + '.' + target_module
                elif imp['level'] == 2:
                    # Parent package
                    if len(parts) > 2:
                        target_module = '.'.join(parts[:-2]) + '.' + target_module
            
            # Only track internal dependencies
            if target_module.startswith('digame') or target_module.startswith('app'):
                graph[module_path].add(target_module)
    
    return graph

def detect_cycles(graph: Dict[str, Set[str]]) -> List[List[str]]:
    """Detect cycles in the dependency graph using DFS."""
    cycles = []
    visited = set()
    rec_stack = set()
    
    def dfs(node, path):
        if node in rec_stack:
            # Found a cycle
            cycle_start = path.index(node)
            cycle = path[cycle_start:] + [node]
            cycles.append(cycle)
            return
        
        if node in visited:
            return
        
        visited.add(node)
        rec_stack.add(node)
        
        for neighbor in graph.get(node, []):
            dfs(neighbor, path + [node])
        
        rec_stack.remove(node)
    
    for node in graph:
        if node not in visited:
            dfs(node, [])
    
    return cycles

def analyze_circular_imports(directory: str = "digame") -> Dict:
    """Analyze the codebase for circular imports."""
    log("Analyzing circular imports...")
    
    base_path = os.path.abspath(directory)
    python_files = find_python_files(directory)
    
    log(f"Found {len(python_files)} Python files")
    
    # Analyze each file
    files_data = []
    for file_path in python_files:
        file_data = analyze_file_imports(file_path, base_path)
        files_data.append(file_data)
    
    # Build dependency graph
    graph = build_dependency_graph(files_data, base_path)
    
    # Detect cycles
    cycles = detect_cycles(graph)
    
    return {
        'files_analyzed': len(python_files),
        'dependency_graph': dict(graph),
        'cycles': cycles,
        'files_data': files_data
    }

def generate_import_report(analysis_result: Dict) -> str:
    """Generate a detailed import analysis report."""
    report = []
    report.append("# Digame Platform Import Analysis Report")
    report.append("=" * 50)
    report.append("")
    
    report.append(f"**Files Analyzed**: {analysis_result['files_analyzed']}")
    report.append(f"**Circular Dependencies Found**: {len(analysis_result['cycles'])}")
    report.append("")
    
    if analysis_result['cycles']:
        report.append("## Circular Dependencies")
        report.append("")
        for i, cycle in enumerate(analysis_result['cycles'], 1):
            report.append(f"### Cycle {i}")
            report.append("```")
            cycle_list = list(cycle)  # Convert to list for indexing
            for j, module in enumerate(cycle_list):
                if j < len(cycle_list) - 1:
                    report.append(f"{module} -> {cycle_list[j + 1]}")
                else:
                    report.append(f"{module} -> {cycle_list[0]}")
            report.append("```")
            report.append("")
    
    # Most imported modules
    import_counts = defaultdict(int)
    for module, deps in analysis_result['dependency_graph'].items():
        for dep in deps:
            import_counts[dep] += 1
    
    if import_counts:
        report.append("## Most Imported Modules")
        report.append("")
        sorted_imports = sorted(import_counts.items(), key=lambda x: x[1], reverse=True)
        for module, count in sorted_imports[:10]:
            report.append(f"- {module}: {count} imports")
        report.append("")
    
    return "\n".join(report)

def suggest_fixes(cycles: List[List[str]]) -> List[Dict]:
    """Suggest fixes for circular import issues."""
    suggestions = []
    
    for cycle in cycles:
        suggestion: Dict = {
            'cycle': cycle,
            'fixes': []
        }
        
        # Common fix strategies
        fix1 = {
            'strategy': 'Move shared code to a separate module',
            'description': 'Extract common functionality into a new module that both modules can import'
        }
        suggestion['fixes'].append(fix1)
        
        fix2 = {
            'strategy': 'Use late imports',
            'description': 'Move imports inside functions where they are used to delay the import'
        }
        suggestion['fixes'].append(fix2)
        
        fix3 = {
            'strategy': 'Use TYPE_CHECKING imports',
            'description': 'Import types only for type checking using typing.TYPE_CHECKING'
        }
        suggestion['fixes'].append(fix3)
        
        fix4 = {
            'strategy': 'Restructure modules',
            'description': 'Reorganize the code to eliminate the circular dependency'
        }
        suggestion['fixes'].append(fix4)
        
        suggestions.append(suggestion)
    
    return suggestions

def apply_automatic_fixes(files_data: List[Dict], cycles: List[List[str]]) -> List[str]:
    """Apply automatic fixes where possible."""
    fixes_applied = []
    
    # This is a simplified version - in practice, you'd need more sophisticated analysis
    log("Automatic fixes are not implemented yet - manual review required", "WARNING")
    
    return fixes_applied

def main():
    parser = argparse.ArgumentParser(description="Analyze and fix circular imports")
    parser.add_argument("--analyze", action="store_true", help="Analyze circular imports")
    parser.add_argument("--fix", action="store_true", help="Attempt automatic fixes")
    parser.add_argument("--report", action="store_true", help="Generate detailed report")
    parser.add_argument("--directory", default="digame", help="Directory to analyze")
    args = parser.parse_args()
    
    if not any([getattr(args, 'analyze', False), getattr(args, 'fix', False), getattr(args, 'report', False)]):
        # Default to analyze
        setattr(args, 'analyze', True)
    
    log("Starting Circular Import Analysis")
    log("=" * 50)
    
    # Analyze imports
    analysis_result = analyze_circular_imports(args.directory)
    
    if args.analyze or args.report:
        log(f"Analysis complete:")
        log(f"- Files analyzed: {analysis_result['files_analyzed']}")
        log(f"- Circular dependencies found: {len(analysis_result['cycles'])}")
        
        if analysis_result['cycles']:
            log("Circular dependencies detected:", "WARNING")
            for i, cycle in enumerate(analysis_result['cycles'], 1):
                log(f"  Cycle {i}: {' -> '.join(cycle)}", "WARNING")
            
            # Generate suggestions
            suggestions = suggest_fixes(analysis_result['cycles'])
            log("Suggested fixes:")
            for i, suggestion in enumerate(suggestions, 1):
                log(f"  For cycle {i}:")
                for fix in suggestion['fixes']:
                    log(f"    - {fix['strategy']}: {fix['description']}")
        else:
            log("No circular dependencies found! ✅")
    
    if args.report:
        report = generate_import_report(analysis_result)
        report_file = "import_analysis_report.md"
        with open(report_file, 'w') as f:
            f.write(report)
        log(f"Detailed report saved to: {report_file}")
    
    if args.fix:
        fixes = apply_automatic_fixes(analysis_result['files_data'], analysis_result['cycles'])
        if fixes:
            log(f"Applied {len(fixes)} automatic fixes")
            for fix in fixes:
                log(f"  - {fix}")
        else:
            log("No automatic fixes applied - manual intervention required")
    
    # Save analysis results
    results_file = "circular_import_analysis.json"
    with open(results_file, 'w') as f:
        # Convert sets to lists for JSON serialization
        serializable_result = {
            'files_analyzed': analysis_result['files_analyzed'],
            'dependency_graph': {k: list(v) for k, v in analysis_result['dependency_graph'].items()},
            'cycles': analysis_result['cycles']
        }
        json.dump(serializable_result, f, indent=2)
    log(f"Analysis results saved to: {results_file}")
    
    return 0 if not analysis_result['cycles'] else 1

if __name__ == "__main__":
    sys.exit(main())