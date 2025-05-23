#!/usr/bin/env python3
"""
DigitalTwinPro Integration Helper Script

This script assists with the integration of DigitalTwinPro into the Digame platform,
providing utilities for merging schemas, migrating components, and validating the integration.
"""

import os
import json
import shutil
import subprocess
from pathlib import Path
from typing import Dict, List, Any
import argparse

class IntegrationHelper:
    """Helper class for managing the DigitalTwinPro integration process"""
    
    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)
        self.digame_branch = "main"
        self.digitaltwinpro_branch = "feature/digitaltwinpro-integration"
        
    def analyze_project_structure(self) -> Dict[str, Any]:
        """Analyze the current project structure and identify integration points"""
        analysis = {
            "digame_components": self._scan_digame_components(),
            "digitaltwinpro_components": self._scan_digitaltwinpro_components(),
            "integration_opportunities": [],
            "conflicts": [],
            "recommendations": []
        }
        
        # Identify integration opportunities
        analysis["integration_opportunities"] = self._identify_integration_opportunities(analysis)
        
        # Identify potential conflicts
        analysis["conflicts"] = self._identify_conflicts(analysis)
        
        # Generate recommendations
        analysis["recommendations"] = self._generate_recommendations(analysis)
        
        return analysis
    
    def _scan_digame_components(self) -> Dict[str, List[str]]:
        """Scan Digame components on main branch"""
        components = {
            "backend_modules": [],
            "api_endpoints": [],
            "database_models": [],
            "services": [],
            "authentication": [],
            "ml_components": []
        }
        
        # Check if we're on the right branch to scan Digame components
        current_branch = self._get_current_branch()
        if current_branch != self.digitaltwinpro_branch:
            print(f"Note: Currently on {current_branch}, Digame component scan may be limited")
        
        # Scan backend modules
        backend_path = self.project_root / "digame" / "app"
        if backend_path.exists():
            components["backend_modules"] = [
                str(p.relative_to(backend_path)) 
                for p in backend_path.rglob("*.py")
                if not p.name.startswith("__")
            ]
        
        # Scan API endpoints
        routers_path = self.project_root / "digame" / "app" / "routers"
        if routers_path.exists():
            components["api_endpoints"] = [
                p.stem for p in routers_path.glob("*.py")
                if not p.name.startswith("__")
            ]
        
        # Scan database models
        models_path = self.project_root / "digame" / "app" / "models"
        if models_path.exists():
            components["database_models"] = [
                p.stem for p in models_path.glob("*.py")
                if not p.name.startswith("__")
            ]
        
        # Scan services
        services_path = self.project_root / "digame" / "app" / "services"
        if services_path.exists():
            components["services"] = [
                p.stem for p in services_path.glob("*.py")
                if not p.name.startswith("__")
            ]
        
        # Scan authentication components
        auth_path = self.project_root / "digame" / "app" / "auth"
        if auth_path.exists():
            components["authentication"] = [
                p.stem for p in auth_path.glob("*.py")
                if not p.name.startswith("__")
            ]
        
        return components
    
    def _scan_digitaltwinpro_components(self) -> Dict[str, List[str]]:
        """Scan DigitalTwinPro components on current branch"""
        components = {
            "frontend_pages": [],
            "react_components": [],
            "api_routes": [],
            "database_schema": [],
            "contexts": [],
            "ui_components": []
        }
        
        # Scan frontend pages
        pages_path = self.project_root / "client" / "src" / "pages"
        if pages_path.exists():
            components["frontend_pages"] = [
                p.stem for p in pages_path.glob("*.tsx")
            ]
        
        # Scan React components
        components_path = self.project_root / "client" / "src" / "components"
        if components_path.exists():
            components["react_components"] = [
                str(p.relative_to(components_path)) 
                for p in components_path.rglob("*.tsx")
            ]
        
        # Scan API routes
        server_path = self.project_root / "server"
        if server_path.exists():
            components["api_routes"] = [
                p.stem for p in server_path.glob("*.ts")
                if not p.name.startswith("__")
            ]
        
        # Scan database schema
        shared_path = self.project_root / "shared"
        if shared_path.exists():
            components["database_schema"] = [
                p.stem for p in shared_path.glob("*.ts")
            ]
        
        # Scan contexts
        contexts_path = self.project_root / "client" / "src" / "contexts"
        if contexts_path.exists():
            components["contexts"] = [
                p.stem for p in contexts_path.glob("*.tsx")
            ]
        
        # Scan UI components
        ui_path = self.project_root / "client" / "src" / "components" / "ui"
        if ui_path.exists():
            components["ui_components"] = [
                p.stem for p in ui_path.glob("*.tsx")
            ]
        
        return components
    
    def _identify_integration_opportunities(self, analysis: Dict[str, Any]) -> List[Dict[str, str]]:
        """Identify opportunities for integrating components"""
        opportunities = []
        
        digame = analysis["digame_components"]
        dtp = analysis["digitaltwinpro_components"]
        
        # Frontend enhancement opportunities
        if dtp["frontend_pages"]:
            opportunities.append({
                "type": "frontend_enhancement",
                "description": f"Integrate {len(dtp['frontend_pages'])} polished frontend pages",
                "components": dtp["frontend_pages"],
                "priority": "high"
            })
        
        # UI component library integration
        if dtp["ui_components"]:
            opportunities.append({
                "type": "ui_library",
                "description": f"Adopt {len(dtp['ui_components'])} modern UI components",
                "components": dtp["ui_components"],
                "priority": "high"
            })
        
        # Context management integration
        if dtp["contexts"]:
            opportunities.append({
                "type": "state_management",
                "description": f"Integrate {len(dtp['contexts'])} React contexts for better state management",
                "components": dtp["contexts"],
                "priority": "medium"
            })
        
        # API harmonization
        if digame["api_endpoints"] and dtp["api_routes"]:
            opportunities.append({
                "type": "api_harmonization",
                "description": "Merge and harmonize API endpoints from both platforms",
                "components": {
                    "digame_apis": digame["api_endpoints"],
                    "dtp_apis": dtp["api_routes"]
                },
                "priority": "high"
            })
        
        return opportunities
    
    def _identify_conflicts(self, analysis: Dict[str, Any]) -> List[Dict[str, str]]:
        """Identify potential conflicts in the integration"""
        conflicts = []
        
        # Technology stack conflicts
        conflicts.append({
            "type": "technology_stack",
            "description": "Backend technology mismatch: FastAPI (Digame) vs Express.js (DigitalTwinPro)",
            "resolution": "Migrate DigitalTwinPro APIs to FastAPI",
            "impact": "medium"
        })
        
        # Database schema conflicts
        conflicts.append({
            "type": "database_schema",
            "description": "Different database schemas and ORM approaches",
            "resolution": "Unify schemas and migrate to SQLAlchemy",
            "impact": "high"
        })
        
        # Authentication system conflicts
        conflicts.append({
            "type": "authentication",
            "description": "Different authentication approaches",
            "resolution": "Adopt Digame's RBAC system with DigitalTwinPro's UX enhancements",
            "impact": "medium"
        })
        
        return conflicts
    
    def _generate_recommendations(self, analysis: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate integration recommendations"""
        recommendations = []
        
        recommendations.append({
            "phase": "1",
            "title": "Backend API Migration",
            "description": "Migrate DigitalTwinPro's Express.js APIs to FastAPI",
            "effort": "2 weeks",
            "priority": "high"
        })
        
        recommendations.append({
            "phase": "2",
            "title": "Frontend Component Integration",
            "description": "Integrate DigitalTwinPro's React components with Digame's backend",
            "effort": "2 weeks",
            "priority": "high"
        })
        
        recommendations.append({
            "phase": "3",
            "title": "Feature Unification",
            "description": "Merge gamification and team features with ML capabilities",
            "effort": "2 weeks",
            "priority": "medium"
        })
        
        return recommendations
    
    def _get_current_branch(self) -> str:
        """Get the current Git branch"""
        try:
            result = subprocess.run(
                ["git", "branch", "--show-current"],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            return result.stdout.strip()
        except subprocess.SubprocessError:
            return "unknown"
    
    def create_integration_branch(self) -> bool:
        """Create a new integration branch for merging both platforms"""
        try:
            # Create new branch from main
            subprocess.run(
                ["git", "checkout", self.digame_branch],
                cwd=self.project_root,
                check=True
            )
            
            subprocess.run(
                ["git", "checkout", "-b", "feature/unified-platform"],
                cwd=self.project_root,
                check=True
            )
            
            print("✅ Created feature/unified-platform branch")
            return True
            
        except subprocess.SubprocessError as e:
            print(f"❌ Failed to create integration branch: {e}")
            return False
    
    def migrate_frontend_components(self, target_dir: str = "frontend-unified") -> bool:
        """Migrate DigitalTwinPro frontend components to unified structure"""
        try:
            # Switch to DigitalTwinPro branch
            subprocess.run(
                ["git", "checkout", self.digitaltwinpro_branch],
                cwd=self.project_root,
                check=True
            )
            
            # Create target directory
            target_path = self.project_root / target_dir
            target_path.mkdir(exist_ok=True)
            
            # Copy frontend components
            client_src = self.project_root / "client"
            if client_src.exists():
                shutil.copytree(
                    client_src,
                    target_path / "client",
                    dirs_exist_ok=True
                )
                print(f"✅ Copied frontend components to {target_dir}/client")
            
            # Copy package.json and config files
            for file in ["package.json", "vite.config.ts", "tailwind.config.ts"]:
                src_file = self.project_root / file
                if src_file.exists():
                    shutil.copy2(src_file, target_path / file)
                    print(f"✅ Copied {file}")
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to migrate frontend components: {e}")
            return False
    
    def generate_migration_script(self, output_file: str = "migration_script.sql") -> bool:
        """Generate SQL migration script for database schema unification"""
        migration_sql = """
-- DigitalTwinPro to Digame Database Migration Script
-- Generated automatically by integration helper

-- 1. Enhance users table with DigitalTwinPro fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_new_user BOOLEAN DEFAULT true;

-- 2. Create productivity_metrics table (from DigitalTwinPro)
CREATE TABLE IF NOT EXISTS productivity_metrics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    date TIMESTAMP DEFAULT NOW() NOT NULL,
    productivity_score INTEGER NOT NULL,
    focus_time INTEGER NOT NULL, -- in minutes
    tasks_completed INTEGER NOT NULL, -- percentage
    focused_work INTEGER NOT NULL, -- percentage
    meetings INTEGER NOT NULL, -- percentage
    email_and_messaging INTEGER NOT NULL, -- percentage
    other_activities INTEGER NOT NULL, -- percentage
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create digital_twin_status table (from DigitalTwinPro)
CREATE TABLE IF NOT EXISTS digital_twin_status (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    learning_capacity INTEGER NOT NULL, -- percentage
    communication_patterns INTEGER NOT NULL, -- percentage
    task_execution INTEGER NOT NULL, -- percentage
    meeting_behavior INTEGER NOT NULL, -- percentage
    last_updated TIMESTAMP DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create data_collection_settings table (from DigitalTwinPro)
CREATE TABLE IF NOT EXISTS data_collection_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    category TEXT NOT NULL,
    enabled BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Enhance activities table with DigitalTwinPro fields
ALTER TABLE activities ADD COLUMN IF NOT EXISTS application TEXT;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 6. Create analog_activities table (from DigitalTwinPro)
CREATE TABLE IF NOT EXISTS analog_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    timestamp TIMESTAMP DEFAULT NOW() NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_productivity_metrics_user_id ON productivity_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_metrics_date ON productivity_metrics(date);
CREATE INDEX IF NOT EXISTS idx_digital_twin_status_user_id ON digital_twin_status(user_id);
CREATE INDEX IF NOT EXISTS idx_data_collection_settings_user_id ON data_collection_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_analog_activities_user_id ON analog_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_analog_activities_timestamp ON analog_activities(timestamp);

-- 8. Insert default data collection settings for existing users
INSERT INTO data_collection_settings (user_id, category, enabled)
SELECT id, 'digital_monitoring', true FROM users
WHERE id NOT IN (SELECT DISTINCT user_id FROM data_collection_settings WHERE category = 'digital_monitoring');

INSERT INTO data_collection_settings (user_id, category, enabled)
SELECT id, 'analog_input', true FROM users
WHERE id NOT IN (SELECT DISTINCT user_id FROM data_collection_settings WHERE category = 'analog_input');

-- 9. Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_productivity_metrics_updated_at BEFORE UPDATE ON productivity_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_digital_twin_status_updated_at BEFORE UPDATE ON digital_twin_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_collection_settings_updated_at BEFORE UPDATE ON data_collection_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analog_activities_updated_at BEFORE UPDATE ON analog_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
"""
        
        try:
            output_path = self.project_root / output_file
            with open(output_path, 'w') as f:
                f.write(migration_sql)
            print(f"✅ Generated migration script: {output_file}")
            return True
        except Exception as e:
            print(f"❌ Failed to generate migration script: {e}")
            return False
    
    def run_analysis(self) -> None:
        """Run complete integration analysis and generate report"""
        print("🔍 Analyzing project structure for integration opportunities...")
        
        analysis = self.analyze_project_structure()
        
        # Generate analysis report
        report = {
            "integration_analysis": analysis,
            "timestamp": "2025-05-23T11:36:00Z",
            "current_branch": self._get_current_branch(),
            "project_root": str(self.project_root)
        }
        
        # Save analysis report
        report_path = self.project_root / "integration_analysis.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"✅ Analysis complete! Report saved to: {report_path}")
        
        # Print summary
        print("\n📊 Integration Analysis Summary:")
        print(f"   • Integration Opportunities: {len(analysis['integration_opportunities'])}")
        print(f"   • Potential Conflicts: {len(analysis['conflicts'])}")
        print(f"   • Recommendations: {len(analysis['recommendations'])}")
        
        print("\n🎯 Top Recommendations:")
        for i, rec in enumerate(analysis['recommendations'][:3], 1):
            print(f"   {i}. {rec['title']} (Phase {rec['phase']}, {rec['effort']})")

def main():
    """Main function for command-line usage"""
    parser = argparse.ArgumentParser(description="DigitalTwinPro Integration Helper")
    parser.add_argument("--analyze", action="store_true", help="Run integration analysis")
    parser.add_argument("--create-branch", action="store_true", help="Create unified integration branch")
    parser.add_argument("--migrate-frontend", action="store_true", help="Migrate frontend components")
    parser.add_argument("--generate-migration", action="store_true", help="Generate database migration script")
    parser.add_argument("--project-root", default=".", help="Project root directory")
    
    args = parser.parse_args()
    
    helper = IntegrationHelper(args.project_root)
    
    if args.analyze:
        helper.run_analysis()
    
    if args.create_branch:
        helper.create_integration_branch()
    
    if args.migrate_frontend:
        helper.migrate_frontend_components()
    
    if args.generate_migration:
        helper.generate_migration_script()
    
    if not any([args.analyze, args.create_branch, args.migrate_frontend, args.generate_migration]):
        print("🚀 DigitalTwinPro Integration Helper")
        print("Use --help to see available options")
        print("\nQuick start:")
        print("  python scripts/integration_helper.py --analyze")

if __name__ == "__main__":
    main()