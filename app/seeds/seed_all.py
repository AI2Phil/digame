"""
Comprehensive Database Seeding Script
Seeds all Performance & Monitoring and User Interface & Dashboard Components
"""

import sys
import os
from pathlib import Path

# Add the parent directory to the path so we can import app modules
sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.performance_models import Base as PerformanceBase
from app.models.activity_models import Base as ActivityBase
from app.seeds.performance_seeds import seed_performance_data
from app.seeds.activity_seeds import seed_activity_data
from app.seeds.collaboration_seeds import seed_collaboration_data
from app.seeds.team_seeds import seed_team_data
from app.seeds.advanced_reporting_seed import seed_advanced_reporting_data
from app.seeds.ml_seeds import seed_ml_data
from app.seeds.security_seeds import seed_security_data

def create_tables():
    """Create all database tables"""
    print("🏗️  Creating database tables...")
    
    # Create performance tables
    PerformanceBase.metadata.create_all(bind=engine)
    print("  ✓ Performance & Monitoring tables created")
    
    # Create activity tables
    ActivityBase.metadata.create_all(bind=engine)
    print("  ✓ User Interface & Dashboard tables created")
    
    # Create collaboration tables
    from app.models.collaboration_models import Base as CollaborationBase
    CollaborationBase.metadata.create_all(bind=engine)
    print("  ✓ Real-Time Collaboration tables created")
    
    # Create team tables
    from app.models.team import Base as TeamBase
    TeamBase.metadata.create_all(bind=engine)
    print("  ✓ Team Management tables created")
    
    # Create reporting tables
    from app.models.reporting_models import Base as ReportingBase
    ReportingBase.metadata.create_all(bind=engine)
    print("  ✓ Advanced Reporting tables created")
    
    # Create ML tables
    from app.models.ml_models import Base as MLBase
    MLBase.metadata.create_all(bind=engine)
    print("  ✓ AI/ML Model Management tables created")
    
    # Create security tables
    from app.models.security_models import Base as SecurityBase
    SecurityBase.metadata.create_all(bind=engine)
    print("  ✓ Security & Compliance tables created")

def seed_all_data():
    """Seed all comprehensive test data"""
    print("\n🌱 Starting comprehensive database seeding...")
    
    db = SessionLocal()
    try:
        # Seed Performance & Monitoring Components
        print("\n" + "="*60)
        seed_performance_data(db)
        
        # Seed User Interface & Dashboard Components
        print("\n" + "="*60)
        seed_activity_data(db)
        
        # Seed Real-Time Collaboration Components
        print("\n" + "="*60)
        seed_collaboration_data()
        
        # Seed Team Management Components
        print("\n" + "="*60)
        seed_team_data()
        
        # Seed Advanced Reporting Components
        print("\n" + "="*60)
        seed_advanced_reporting_data()
        
        # Seed AI/ML Components
        print("\n" + "="*60)
        ml_results = seed_ml_data(db)
        print(f"  ✅ ML Data: {ml_results}")
        
        # Seed Security & Compliance Components
        print("\n" + "="*60)
        seed_security_data()
        
        print("\n" + "="*60)
        print("🎉 All seeding completed successfully!")
        print("\nSeeded Components:")
        print("  ✅ Performance & Monitoring Components")
        print("     - User Experience Analytics")
        print("     - Query Optimization")
        print("     - Bundle Analysis")
        print("     - Performance Monitoring")
        print("  ✅ User Interface & Dashboard Components")
        print("     - Activity Breakdown")
        print("     - Productivity Charts")
        print("     - Activity Management")
        print("     - Goal Tracking")
        print("  ✅ Real-Time Collaboration Components")
        print("     - Workspaces and Channels")
        print("     - Messages and Reactions")
        print("     - User Presence")
        print("     - Collaboration Sessions")
        print("  ✅ Team Management Components")
        print("     - Teams and Members")
        print("     - Performance Metrics")
        print("     - Skill Gap Analysis")
        print("     - Workflow Optimization")
        print("  ✅ Advanced Reporting Components")
        print("     - Report Templates")
        print("     - Data Sources")
        print("     - Predictive Models")
        print("     - Visualization Metrics")
        print("  ✅ AI/ML Model Management Components")
        print("     - ML Models and Training Jobs")
        print("     - Model Predictions and Evaluations")
        print("     - Model Deployments")
        print("     - Dataset Metadata")
        print("  ✅ Security & Compliance Components")
        print("     - Audit Events and Security Events")
        print("     - Compliance Checks and Vulnerabilities")
        print("     - Risk Assessments and Security Incidents")
        print("     - Security Metrics and KPIs")
        
        print(f"\nDatabase Status:")
        print(f"  📊 Performance Data: Comprehensive test data with realistic patterns")
        print(f"  📈 Activity Data: 90 days of user activity across 20 users")
        print(f"  💬 Collaboration Data: Workspaces, channels, messages, and sessions")
        print(f"  👥 Team Data: 12 teams with members, metrics, and workflows")
        print(f"  📋 Reporting Data: Templates, models, and analytics")
        print(f"  🔒 Security Data: Audit trails, threats, and compliance monitoring")
        print(f"  🎯 Goals & Patterns: Intelligent insights and recommendations")
        print(f"  🔧 Optimizations: Performance improvement suggestions")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def reset_and_seed():
    """Drop all tables, recreate them, and seed with fresh data"""
    print("🔄 Resetting database and seeding fresh data...")
    
    # Drop all tables
    print("  🗑️  Dropping existing tables...")
    PerformanceBase.metadata.drop_all(bind=engine)
    ActivityBase.metadata.drop_all(bind=engine)
    from app.models.collaboration_models import Base as CollaborationBase
    CollaborationBase.metadata.drop_all(bind=engine)
    from app.models.team import Base as TeamBase
    TeamBase.metadata.drop_all(bind=engine)
    from app.models.reporting_models import Base as ReportingBase
    ReportingBase.metadata.drop_all(bind=engine)
    from app.models.ml_models import Base as MLBase
    MLBase.metadata.drop_all(bind=engine)
    from app.models.security_models import Base as SecurityBase
    SecurityBase.metadata.drop_all(bind=engine)
    
    # Create tables
    create_tables()
    
    # Seed data
    seed_all_data()

def main():
    """Main seeding function with options"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Seed database with comprehensive test data')
    parser.add_argument('--reset', action='store_true', 
                       help='Drop existing tables and recreate with fresh data')
    parser.add_argument('--tables-only', action='store_true',
                       help='Only create tables, do not seed data')
    
    args = parser.parse_args()
    
    try:
        if args.reset:
            reset_and_seed()
        elif args.tables_only:
            create_tables()
            print("✅ Tables created successfully!")
        else:
            # Check if tables exist, create if needed
            try:
                create_tables()
            except Exception as e:
                print(f"Note: Tables may already exist ({e})")
            
            seed_all_data()
            
    except KeyboardInterrupt:
        print("\n⚠️  Seeding interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Seeding failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()