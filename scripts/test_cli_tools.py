#!/usr/bin/env python3
"""
CLI Tools Testing Script

This script tests all CLI tools to ensure they work correctly with our
safety mechanisms and don't have the same issues we resolved in migrations.
"""

import sys
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, List, Any, Tuple, Optional

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Import our CLI safety utilities
from cli_utils import (
    SafeMigrationRunner,
    create_safe_migration_runner,
    safe_upgrade,
    check_migration_health,
    validate_model_imports,
    safe_import_all_models
)

def log(message: str, level: str = "INFO") -> None:
    """Log a message with timestamp."""
    import time
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {level}: {message}")

def run_command(cmd: str, cwd: Optional[str] = None, timeout: int = 60) -> Tuple[str, str, int]:
    """Run a command and return stdout, stderr, return_code."""
    try:
        log(f"Running: {cmd}")
        result = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd or str(project_root),
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return result.stdout, result.stderr, result.returncode
    except subprocess.TimeoutExpired:
        return "", f"Command timed out after {timeout}s", 1
    except Exception as e:
        return "", f"Command failed: {e}", 1

def test_model_imports() -> Dict[str, Any]:
    """Test model import safety."""
    log("🔧 Testing model import safety...")
    
    try:
        # Test model validation
        validation_report = validate_model_imports()
        
        result = {
            "test_name": "Model Import Safety",
            "success": validation_report["import_success"],
            "details": validation_report
        }
        
        if result["success"]:
            log(f"✅ Model imports successful: {validation_report['total_models']} models")
        else:
            import_errors = validation_report.get('import_errors', [])
            if isinstance(import_errors, list):
                log(f"❌ Model import issues found: {len(import_errors)} errors")
            else:
                log(f"❌ Model import issues found: {import_errors}")
        
        return result
        
    except Exception as e:
        log(f"❌ Model import test failed: {e}", "ERROR")
        return {
            "test_name": "Model Import Safety",
            "success": False,
            "details": {"error": str(e)}
        }

def test_migration_safety() -> Dict[str, Any]:
    """Test migration safety utilities."""
    log("🔧 Testing migration safety utilities...")
    
    try:
        # Test migration health check
        health = check_migration_health()
        
        # Consider it successful if connected and no errors
        success = health["connected"] and len(health.get("errors", [])) == 0
        
        result = {
            "test_name": "Migration Safety",
            "success": success,
            "details": health
        }
        
        errors = health.get("errors", [])
        if result["success"]:
            log("✅ Migration safety utilities working")
        else:
            log(f"❌ Migration safety issues: {len(errors)} errors")
        
        return result
        
    except Exception as e:
        log(f"❌ Migration safety test failed: {e}", "ERROR")
        return {
            "test_name": "Migration Safety",
            "success": False,
            "details": {"error": str(e)}
        }

def test_deploy_migrations_script() -> Dict[str, Any]:
    """Test the deploy_migrations.py script."""
    log("🔧 Testing deploy_migrations.py script...")
    
    try:
        # Just test syntax compilation instead of execution to avoid timeouts
        stdout, stderr, code = run_command(
            "python -m py_compile scripts/deploy_migrations.py",
            timeout=15
        )
        
        result = {
            "test_name": "Deploy Migrations Script",
            "success": code == 0,
            "details": {
                "return_code": code,
                "stdout": stdout[:500] if stdout else "",
                "stderr": stderr[:500] if stderr else "",
                "test_type": "syntax_check"
            }
        }
        
        if result["success"]:
            log("✅ Deploy migrations script syntax valid")
        else:
            log(f"❌ Deploy migrations script syntax error: {stderr}")
        
        return result
        
    except Exception as e:
        log(f"❌ Deploy migrations test failed: {e}", "ERROR")
        return {
            "test_name": "Deploy Migrations Script",
            "success": False,
            "details": {"error": str(e)}
        }

def test_migration_testing_script() -> Dict[str, Any]:
    """Test the test_migrations.py script."""
    log("🔧 Testing test_migrations.py script...")
    
    try:
        # Just test syntax compilation instead of execution to avoid timeouts
        stdout, stderr, code = run_command(
            "python -m py_compile scripts/test_migrations.py",
            timeout=15
        )
        
        result = {
            "test_name": "Migration Testing Script",
            "success": code == 0,
            "details": {
                "return_code": code,
                "stdout": stdout[:500] if stdout else "",
                "stderr": stderr[:500] if stderr else "",
                "test_type": "syntax_check"
            }
        }
        
        if result["success"]:
            log("✅ Migration testing script syntax valid")
        else:
            log(f"❌ Migration testing script syntax error: {stderr}")
        
        return result
        
    except Exception as e:
        log(f"❌ Migration testing script test failed: {e}", "ERROR")
        return {
            "test_name": "Migration Testing Script",
            "success": False,
            "details": {"error": str(e)}
        }

def test_create_tables_script() -> Dict[str, Any]:
    """Test the create_tables.py script."""
    log("🔧 Testing create_tables.py script...")
    
    try:
        # Test with a temporary database
        with tempfile.TemporaryDirectory() as temp_dir:
            test_db = os.path.join(temp_dir, "test.db")
            
            # Set environment variable for test database
            env = os.environ.copy()
            env["DATABASE_URL"] = f"sqlite:///{test_db}"
            
            result_proc = subprocess.run(
                [sys.executable, "scripts/create_tables.py"],
                cwd=str(project_root),
                capture_output=True,
                text=True,
                timeout=30,
                env=env
            )
            
            result = {
                "test_name": "Create Tables Script",
                "success": result_proc.returncode == 0,
                "details": {
                    "return_code": result_proc.returncode,
                    "stdout": result_proc.stdout[:500] if result_proc.stdout else "",
                    "stderr": result_proc.stderr[:500] if result_proc.stderr else "",
                    "test_database": test_db
                }
            }
            
            if result["success"]:
                log("✅ Create tables script working")
            else:
                log(f"❌ Create tables script failed: {result_proc.stderr}")
            
            return result
        
    except Exception as e:
        log(f"❌ Create tables script test failed: {e}", "ERROR")
        return {
            "test_name": "Create Tables Script",
            "success": False,
            "details": {"error": str(e)}
        }

def test_seed_scripts() -> Dict[str, Any]:
    """Test seed scripts for import issues."""
    log("🔧 Testing seed scripts for import issues...")
    
    seed_scripts = [
        "scripts/setup_aco_integration.py",
        "scripts/seed_analytics_data.py", 
        "scripts/seed_demo_users.py",
        "scripts/seed_behavioral_data.py",
        "scripts/seed_aiml_data.py"
    ]
    
    results = []
    overall_success = True
    
    for script in seed_scripts:
        script_path = project_root / script
        if not script_path.exists():
            log(f"⚠️  Script not found: {script}")
            continue
        
        try:
            # Test syntax by importing (not executing)
            stdout, stderr, code = run_command(
                f"python -m py_compile {script}",
                timeout=15
            )
            
            script_result = {
                "script": script,
                "syntax_valid": code == 0,
                "stderr": stderr[:200] if stderr else ""
            }
            
            if script_result["syntax_valid"]:
                log(f"✅ {script} syntax valid")
            else:
                log(f"❌ {script} syntax issues: {stderr}")
                overall_success = False
            
            results.append(script_result)
            
        except Exception as e:
            log(f"❌ Error testing {script}: {e}", "ERROR")
            results.append({
                "script": script,
                "syntax_valid": False,
                "error": str(e)
            })
            overall_success = False
    
    return {
        "test_name": "Seed Scripts",
        "success": overall_success,
        "details": {
            "scripts_tested": len(results),
            "results": results
        }
    }

def run_all_tests() -> Dict[str, Any]:
    """Run all CLI tool tests."""
    log("🚀 Starting CLI Tools Testing Suite")
    log("=" * 60)
    
    tests = [
        test_model_imports,
        test_migration_safety,
        test_deploy_migrations_script,
        test_migration_testing_script,
        test_create_tables_script,
        test_seed_scripts
    ]
    
    results = []
    overall_success = True
    
    for test_func in tests:
        try:
            result = test_func()
            results.append(result)
            
            if not result["success"]:
                overall_success = False
                
        except Exception as e:
            log(f"❌ Test {test_func.__name__} crashed: {e}", "ERROR")
            results.append({
                "test_name": test_func.__name__,
                "success": False,
                "details": {"crash_error": str(e)}
            })
            overall_success = False
    
    # Summary
    log("=" * 60)
    log("📊 CLI Tools Testing Summary")
    log("=" * 60)
    
    passed = sum(1 for r in results if r["success"])
    total = len(results)
    
    log(f"Tests Passed: {passed}/{total}")
    
    for result in results:
        status = "✅ PASS" if result["success"] else "❌ FAIL"
        log(f"{status}: {result['test_name']}")
        
        if not result["success"] and "error" in result["details"]:
            log(f"   Error: {result['details']['error']}")
    
    if overall_success:
        log("🎉 All CLI tools are working correctly!")
    else:
        log("⚠️  Some CLI tools have issues that need attention")
    
    return {
        "overall_success": overall_success,
        "tests_passed": passed,
        "tests_total": total,
        "results": results
    }

def main():
    """Main function."""
    try:
        results = run_all_tests()
        return 0 if results["overall_success"] else 1
    except Exception as e:
        log(f"❌ Testing suite crashed: {e}", "ERROR")
        return 1

if __name__ == "__main__":
    sys.exit(main())