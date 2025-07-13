#!/usr/bin/env python3
"""
CLI Model Import Safety Utilities

This module provides safe model import utilities for CLI scripts to prevent
the same SQLAlchemy model conflicts we resolved in the main application.

Based on the model fixes implemented to resolve declarative base conflicts.
"""

import sys
import os
import importlib
from pathlib import Path
from typing import Optional, List, Dict, Any, Type
import warnings


class ModelImportSafetyError(Exception):
    """Custom exception for model import safety issues"""
    pass


class SafeModelImporter:
    """
    Safe model importer that prevents the SQLAlchemy model conflicts
    we encountered in the main application.
    """
    
    def __init__(self, project_root: Optional[str] = None):
        self.project_root = Path(project_root) if project_root else Path.cwd()
        self.imported_modules: Dict[str, Any] = {}
        self.base_registry: Dict[int, Any] = {}
        
        # Add project root to Python path if not already there
        if str(self.project_root) not in sys.path:
            sys.path.insert(0, str(self.project_root))
    
    def log(self, message: str, level: str = "INFO") -> None:
        """Log a message."""
        print(f"[MODEL_IMPORT] {level}: {message}")
    
    def check_sqlalchemy_version(self) -> Dict[str, Any]:
        """Check SQLAlchemy version and compatibility."""
        try:
            import sqlalchemy
            version = sqlalchemy.__version__
            major_version = int(version.split('.')[0])
            
            compatibility_info: Dict[str, Any] = {
                "version": version,
                "major_version": major_version,
                "is_2x": major_version >= 2,
                "compatible": True,
                "warnings": []
            }
            
            if major_version < 1:
                compatibility_info["compatible"] = False
                compatibility_info["warnings"].append("SQLAlchemy version too old")
            elif major_version == 1:
                minor_version = int(version.split('.')[1])
                if minor_version < 4:
                    compatibility_info["warnings"].append("SQLAlchemy 1.4+ recommended for best compatibility")
            
            self.log(f"SQLAlchemy version: {version}")
            return compatibility_info
            
        except ImportError:
            return {
                "version": None,
                "major_version": 0,
                "is_2x": False,
                "compatible": False,
                "warnings": ["SQLAlchemy not installed"]
            }
    
    def safe_import_database_base(self) -> Any:
        """
        Safely import the database Base to prevent multiple declarative base issues.
        
        Returns the consolidated Base from app.database
        """
        try:
            # Import the consolidated database module
            from app.database import Base
            
            base_id = id(Base)
            if base_id in self.base_registry:
                self.log("Using existing Base instance")
                return self.base_registry[base_id]
            
            self.base_registry[base_id] = Base
            self.log("✓ Successfully imported consolidated database Base")
            return Base
            
        except ImportError as e:
            self.log(f"Failed to import database Base: {e}", "ERROR")
            raise ModelImportSafetyError(f"Could not import database Base: {e}")
    
    def safe_import_models(self, model_modules: List[str]) -> Dict[str, Any]:
        """
        Safely import model modules with conflict detection.
        
        Args:
            model_modules: List of model module names to import
            
        Returns:
            Dict mapping module names to imported modules
        """
        imported = {}
        
        # First, ensure we have the consolidated Base
        try:
            base = self.safe_import_database_base()
            self.log(f"Using Base: {base}")
        except ModelImportSafetyError:
            self.log("Could not import consolidated Base - proceeding with caution", "WARNING")
        
        for module_name in model_modules:
            try:
                self.log(f"Importing model module: {module_name}")
                
                # Check if already imported
                if module_name in self.imported_modules:
                    self.log(f"Module {module_name} already imported")
                    imported[module_name] = self.imported_modules[module_name]
                    continue
                
                # Import the module
                module = importlib.import_module(module_name)
                
                # Check for potential conflicts
                self._check_module_conflicts(module, module_name)
                
                self.imported_modules[module_name] = module
                imported[module_name] = module
                
                self.log(f"✓ Successfully imported {module_name}")
                
            except ImportError as e:
                self.log(f"Failed to import {module_name}: {e}", "ERROR")
                raise ModelImportSafetyError(f"Could not import {module_name}: {e}")
            except Exception as e:
                self.log(f"Unexpected error importing {module_name}: {e}", "ERROR")
                raise ModelImportSafetyError(f"Unexpected error with {module_name}: {e}")
        
        return imported
    
    def _check_module_conflicts(self, module: Any, module_name: str) -> None:
        """Check for potential conflicts in imported module."""
        
        # Check for multiple Base definitions
        bases_found = []
        for attr_name in dir(module):
            attr = getattr(module, attr_name)
            if hasattr(attr, 'registry') and hasattr(attr, 'metadata'):
                # This looks like a SQLAlchemy declarative base
                bases_found.append(attr_name)
        
        if len(bases_found) > 1:
            self.log(f"Warning: Multiple Base-like objects found in {module_name}: {bases_found}", "WARNING")
        
        # Check for extend_existing usage
        for attr_name in dir(module):
            attr = getattr(module, attr_name)
            if hasattr(attr, '__table__') and hasattr(attr.__table__, 'extend_existing'):
                if not getattr(attr.__table__, 'extend_existing', False):
                    self.log(f"Warning: {attr_name} in {module_name} may need extend_existing=True", "WARNING")
    
    def get_all_model_classes(self, modules: Dict[str, Any]) -> Dict[str, Type]:
        """
        Extract all SQLAlchemy model classes from imported modules.
        
        Args:
            modules: Dict of imported modules
            
        Returns:
            Dict mapping class names to model classes
        """
        model_classes = {}
        
        for module_name, module in modules.items():
            for attr_name in dir(module):
                attr = getattr(module, attr_name)
                
                # Check if this is a SQLAlchemy model class
                if (hasattr(attr, '__table__') and 
                    hasattr(attr, '__tablename__') and
                    hasattr(attr, 'query')):
                    
                    # Check for naming conflicts
                    if attr_name in model_classes:
                        existing_module = model_classes[attr_name].__module__
                        self.log(f"Warning: Model class name conflict: {attr_name} found in both {existing_module} and {module_name}", "WARNING")
                    
                    model_classes[attr_name] = attr
                    self.log(f"Found model class: {attr_name} (table: {attr.__tablename__})")
        
        return model_classes
    
    def validate_model_relationships(self, model_classes: Dict[str, Type]) -> List[str]:
        """
        Validate model relationships and foreign keys.
        
        Args:
            model_classes: Dict of model classes
            
        Returns:
            List of validation warnings/errors
        """
        issues = []
        
        for class_name, model_class in model_classes.items():
            try:
                # Check foreign key relationships
                if hasattr(model_class, '__table__'):
                    table = model_class.__table__
                    
                    for fk in table.foreign_keys:
                        target_table = fk.column.table.name
                        
                        # Check if target table exists in our models
                        target_found = False
                        for other_class_name, other_model in model_classes.items():
                            if hasattr(other_model, '__tablename__') and other_model.__tablename__ == target_table:
                                target_found = True
                                break
                        
                        if not target_found:
                            issues.append(f"{class_name}: Foreign key references unknown table '{target_table}'")
                
            except Exception as e:
                issues.append(f"{class_name}: Error validating relationships: {e}")
        
        return issues


def create_safe_model_importer(project_root: Optional[str] = None) -> SafeModelImporter:
    """Factory function to create a SafeModelImporter instance."""
    return SafeModelImporter(project_root=project_root)


def safe_import_all_models(project_root: Optional[str] = None) -> Dict[str, Any]:
    """
    Safely import all model modules from the app.models package.
    
    Args:
        project_root: Project root directory (optional)
        
    Returns:
        Dict of imported model modules
    """
    importer = create_safe_model_importer(project_root=project_root)
    
    # Standard model modules based on the project structure
    model_modules = [
        "app.models.user",
        "app.models.rbac", 
        "app.models.activity",
        "app.models.behavioral",
        "app.models.task",
        "app.models.process_note",
        "app.models.job",
        "app.models.social",
        "app.models.social_collaboration",
        "app.models.gamification",
        "app.models.team",
        "app.models.notification",
        "app.models.security",
        "app.models.reporting",
        "app.models.analytics",
        "app.models.integration",
        "app.models.workflow"
    ]
    
    # Filter to only existing modules
    existing_modules = []
    for module_name in model_modules:
        try:
            import importlib.util
            spec = importlib.util.find_spec(module_name)
            if spec is not None:
                existing_modules.append(module_name)
            else:
                importer.log(f"Module {module_name} not found, skipping")
        except (ImportError, ModuleNotFoundError):
            importer.log(f"Module {module_name} not found, skipping")
    
    return importer.safe_import_models(existing_modules)


def validate_model_imports(project_root: Optional[str] = None) -> Dict[str, Any]:
    """
    Validate all model imports and return a comprehensive report.
    
    Args:
        project_root: Project root directory (optional)
        
    Returns:
        Dict containing validation results
    """
    importer = create_safe_model_importer(project_root=project_root)
    
    # Check SQLAlchemy compatibility
    sqlalchemy_info = importer.check_sqlalchemy_version()
    
    # Import all models
    try:
        modules = safe_import_all_models(project_root=project_root)
        import_success = True
        import_errors = []
    except Exception as e:
        modules = {}
        import_success = False
        import_errors = [str(e)]
    
    # Get model classes
    model_classes = importer.get_all_model_classes(modules) if modules else {}
    
    # Validate relationships
    relationship_issues = importer.validate_model_relationships(model_classes) if model_classes else []
    
    return {
        "sqlalchemy_info": sqlalchemy_info,
        "import_success": import_success,
        "import_errors": import_errors,
        "modules_imported": list(modules.keys()),
        "model_classes_found": list(model_classes.keys()),
        "relationship_issues": relationship_issues,
        "total_models": len(model_classes),
        "total_modules": len(modules)
    }