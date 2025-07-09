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

def create_tables():
    """Create all database tables"""
    print("🏗️  Creating database tables...")
    
    # Create performance tables
    PerformanceBase.metadata.create_all(bind=engine)
    print("  ✓ Performance & Monitoring tables created")
    
    # Create activity tables
    ActivityBase.metadata.create_all(bind=engine)
    print("  ✓ User Interface & Dashboard tables created")

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
        
        print(f"\nDatabase Status:")
        print(f"  📊 Performance Data: Comprehensive test data with realistic patterns")
        print(f"  📈 Activity Data: 90 days of user activity across 20 users")
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