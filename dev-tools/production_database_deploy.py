#!/usr/bin/env python3
"""
Production Database Deployment Script
Deploys Phase 1 schema to production database with proper validation and rollback capabilities.
"""

import os
import sys
import psycopg2
from pathlib import Path
from typing import Dict, Any, List
import logging
from datetime import datetime
import json

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('production_deploy.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ProductionDatabaseDeployer:
    """Production database deployment manager"""
    
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.deployment_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.backup_file = f"backup_pre_phase1_{self.deployment_id}.sql"
        
    def validate_environment(self) -> bool:
        """Validate production environment before deployment"""
        logger.info("🔍 Validating production environment...")
        
        # Check database URL
        if not self.database_url:
            logger.error("❌ DATABASE_URL not provided")
            return False
            
        if not self.database_url.startswith(('postgresql://', 'postgres://')):
            logger.error("❌ Invalid PostgreSQL database URL")
            return False
            
        # Test database connection
        try:
            conn = psycopg2.connect(self.database_url)
            cursor = conn.cursor()
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            logger.info(f"✅ Database connection successful: {version}")
            conn.close()
            return True
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            return False
    
    def create_backup(self) -> bool:
        """Create database backup before deployment"""
        logger.info("💾 Creating database backup...")
        
        try:
            # Extract connection details from URL
            import urllib.parse as urlparse
            parsed = urlparse.urlparse(self.database_url)
            
            # Create pg_dump command
            dump_cmd = [
                'pg_dump',
                f'--host={parsed.hostname}',
                f'--port={parsed.port or 5432}',
                f'--username={parsed.username}',
                f'--dbname={parsed.path[1:]}',  # Remove leading slash
                '--verbose',
                '--clean',
                '--no-owner',
                '--no-privileges',
                f'--file={self.backup_file}'
            ]
            
            # Set password environment variable
            env = os.environ.copy()
            env['PGPASSWORD'] = parsed.password
            
            import subprocess
            result = subprocess.run(dump_cmd, env=env, capture_output=True, text=True)
            
            if result.returncode == 0:
                logger.info(f"✅ Database backup created: {self.backup_file}")
                return True
            else:
                logger.error(f"❌ Backup failed: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Backup creation failed: {e}")
            return False
    
    def deploy_phase1_schema(self) -> bool:
        """Deploy Phase 1 database schema"""
        logger.info("🚀 Deploying Phase 1 database schema...")
        
        try:
            conn = psycopg2.connect(self.database_url)
            cursor = conn.cursor()
            
            # Phase 1 schema deployment
            schema_sql = """
            -- ========================================
            -- SOCIAL NETWORKING TABLES
            -- ========================================
            
            -- User Connections Table
            CREATE TABLE IF NOT EXISTS user_connections (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                connected_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                connection_type VARCHAR(50) NOT NULL DEFAULT 'professional',
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                initiated_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                connected_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                UNIQUE(user_id, connected_user_id)
            );
            
            -- Peer Matching Table
            CREATE TABLE IF NOT EXISTS peer_matches (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                matched_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                compatibility_score DECIMAL(5,2) NOT NULL,
                match_factors JSONB,
                status VARCHAR(20) NOT NULL DEFAULT 'suggested',
                viewed_at TIMESTAMP WITH TIME ZONE,
                responded_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                UNIQUE(user_id, matched_user_id)
            );
            
            -- Social Metrics Table
            CREATE TABLE IF NOT EXISTS social_metrics (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
                total_connections INTEGER NOT NULL DEFAULT 0,
                active_mentorships INTEGER NOT NULL DEFAULT 0,
                learning_partnerships INTEGER NOT NULL DEFAULT 0,
                knowledge_shared INTEGER NOT NULL DEFAULT 0,
                collaboration_score INTEGER NOT NULL DEFAULT 0,
                network_growth_rate DECIMAL(5,2) NOT NULL DEFAULT 0.0,
                engagement_level VARCHAR(20) NOT NULL DEFAULT 'low',
                last_calculated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
            
            -- User Skills Table
            CREATE TABLE IF NOT EXISTS user_skills (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                skill_name VARCHAR(100) NOT NULL,
                proficiency_level VARCHAR(20) NOT NULL,
                years_experience INTEGER,
                is_seeking_mentorship BOOLEAN NOT NULL DEFAULT FALSE,
                is_offering_mentorship BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                UNIQUE(user_id, skill_name)
            );
            
            -- ========================================
            -- LEARNING & DEVELOPMENT TABLES
            -- ========================================
            
            -- Course Categories Table
            CREATE TABLE IF NOT EXISTS course_categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                parent_category_id INTEGER REFERENCES course_categories(id) ON DELETE SET NULL,
                sort_order INTEGER NOT NULL DEFAULT 0,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
            
            -- Courses Table
            CREATE TABLE IF NOT EXISTS courses (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                short_description VARCHAR(500),
                category_id INTEGER NOT NULL REFERENCES course_categories(id) ON DELETE RESTRICT,
                difficulty_level VARCHAR(20) NOT NULL DEFAULT 'beginner',
                duration_hours INTEGER,
                estimated_completion_days INTEGER,
                prerequisites JSONB,
                learning_objectives JSONB,
                skills_covered JSONB,
                instructor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                max_enrollments INTEGER,
                current_enrollments INTEGER NOT NULL DEFAULT 0,
                rating_average DECIMAL(3,2),
                rating_count INTEGER NOT NULL DEFAULT 0,
                is_published BOOLEAN NOT NULL DEFAULT FALSE,
                published_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
            
            -- Course Enrollments Table
            CREATE TABLE IF NOT EXISTS course_enrollments (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
                progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.0,
                status VARCHAR(20) NOT NULL DEFAULT 'enrolled',
                started_at TIMESTAMP WITH TIME ZONE,
                completed_at TIMESTAMP WITH TIME ZONE,
                last_accessed_at TIMESTAMP WITH TIME ZONE,
                time_spent_minutes INTEGER NOT NULL DEFAULT 0,
                enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                UNIQUE(user_id, course_id)
            );
            
            -- Learning Progress Table
            CREATE TABLE IF NOT EXISTS learning_progress (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                skill_name VARCHAR(100) NOT NULL,
                current_level VARCHAR(20) NOT NULL DEFAULT 'beginner',
                target_level VARCHAR(20),
                progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.0,
                courses_completed INTEGER NOT NULL DEFAULT 0,
                total_study_hours INTEGER NOT NULL DEFAULT 0,
                last_activity_at TIMESTAMP WITH TIME ZONE,
                target_completion_date DATE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                UNIQUE(user_id, skill_name)
            );
            
            -- Learning Recommendations Table
            CREATE TABLE IF NOT EXISTS learning_recommendations (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
                skill_name VARCHAR(100),
                recommendation_type VARCHAR(50) NOT NULL,
                recommendation_reason TEXT,
                confidence_score DECIMAL(3,2) NOT NULL,
                priority_score INTEGER NOT NULL DEFAULT 1,
                is_viewed BOOLEAN NOT NULL DEFAULT FALSE,
                is_accepted BOOLEAN,
                viewed_at TIMESTAMP WITH TIME ZONE,
                responded_at TIMESTAMP WITH TIME ZONE,
                expires_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            );
            """
            
            # Execute schema creation
            cursor.execute(schema_sql)
            
            # Create indexes for performance
            indexes_sql = """
            -- Social Networking Indexes
            CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_connections_connected_user_id ON user_connections(connected_user_id);
            CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status);
            CREATE INDEX IF NOT EXISTS idx_peer_matches_user_id ON peer_matches(user_id);
            CREATE INDEX IF NOT EXISTS idx_peer_matches_compatibility_score ON peer_matches(compatibility_score);
            CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
            CREATE INDEX IF NOT EXISTS idx_user_skills_skill_name ON user_skills(skill_name);
            
            -- Learning & Development Indexes
            CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);
            CREATE INDEX IF NOT EXISTS idx_courses_difficulty_level ON courses(difficulty_level);
            CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
            CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
            CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
            CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);
            CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id);
            CREATE INDEX IF NOT EXISTS idx_learning_progress_skill_name ON learning_progress(skill_name);
            CREATE INDEX IF NOT EXISTS idx_learning_recommendations_user_id ON learning_recommendations(user_id);
            CREATE INDEX IF NOT EXISTS idx_learning_recommendations_type ON learning_recommendations(recommendation_type);
            """
            
            cursor.execute(indexes_sql)
            
            # Insert sample data
            sample_data_sql = """
            -- Insert sample course categories
            INSERT INTO course_categories (name, description, sort_order) VALUES
            ('Programming', 'Software development and programming languages', 1),
            ('Data Science', 'Data analysis, machine learning, and statistics', 2),
            ('Design', 'UI/UX design, graphic design, and creative skills', 3),
            ('Business', 'Management, entrepreneurship, and business skills', 4),
            ('Communication', 'Public speaking, writing, and interpersonal skills', 5)
            ON CONFLICT (name) DO NOTHING;
            
            -- Insert sample courses
            INSERT INTO courses (title, description, category_id, difficulty_level, duration_hours, is_published) VALUES
            ('Python Fundamentals', 'Learn the basics of Python programming', 1, 'beginner', 20, TRUE),
            ('Advanced JavaScript', 'Master advanced JavaScript concepts', 1, 'advanced', 30, TRUE),
            ('Data Analysis with Pandas', 'Analyze data using Python Pandas library', 2, 'intermediate', 25, TRUE),
            ('UI/UX Design Principles', 'Learn fundamental design principles', 3, 'beginner', 15, TRUE),
            ('Project Management Basics', 'Introduction to project management', 4, 'beginner', 18, TRUE)
            ON CONFLICT DO NOTHING;
            """
            
            cursor.execute(sample_data_sql)
            
            # Commit all changes
            conn.commit()
            conn.close()
            
            logger.info("✅ Phase 1 schema deployed successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Schema deployment failed: {e}")
            if 'conn' in locals():
                conn.rollback()
                conn.close()
            return False
    
    def validate_deployment(self) -> bool:
        """Validate the deployed schema"""
        logger.info("🔍 Validating deployment...")
        
        expected_tables = [
            'user_connections', 'peer_matches', 'social_metrics', 'user_skills',
            'course_categories', 'courses', 'course_enrollments', 
            'learning_progress', 'learning_recommendations'
        ]
        
        try:
            conn = psycopg2.connect(self.database_url)
            cursor = conn.cursor()
            
            # Check tables exist
            cursor.execute("""
                SELECT table_name FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = ANY(%s)
            """, (expected_tables,))
            
            existing_tables = [row[0] for row in cursor.fetchall()]
            missing_tables = set(expected_tables) - set(existing_tables)
            
            if missing_tables:
                logger.error(f"❌ Missing tables: {missing_tables}")
                return False
            
            # Check sample data
            cursor.execute("SELECT COUNT(*) FROM course_categories")
            category_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM courses")
            course_count = cursor.fetchone()[0]
            
            logger.info(f"✅ All {len(expected_tables)} tables created successfully")
            logger.info(f"✅ Sample data: {category_count} categories, {course_count} courses")
            
            conn.close()
            return True
            
        except Exception as e:
            logger.error(f"❌ Validation failed: {e}")
            return False
    
    def deploy(self) -> bool:
        """Execute full production deployment"""
        logger.info(f"🚀 Starting production deployment {self.deployment_id}")
        
        # Step 1: Validate environment
        if not self.validate_environment():
            return False
        
        # Step 2: Create backup
        if not self.create_backup():
            logger.warning("⚠️ Backup failed, but continuing deployment")
        
        # Step 3: Deploy schema
        if not self.deploy_phase1_schema():
            logger.error("❌ Schema deployment failed")
            return False
        
        # Step 4: Validate deployment
        if not self.validate_deployment():
            logger.error("❌ Deployment validation failed")
            return False
        
        logger.info("🎉 Production deployment completed successfully!")
        logger.info(f"📋 Deployment ID: {self.deployment_id}")
        logger.info(f"💾 Backup file: {self.backup_file}")
        
        return True

def main():
    """Main deployment function"""
    print("🚀 Production Database Deployment for Phase 1")
    print("=" * 60)
    
    # Get database URL from environment
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("❌ DATABASE_URL environment variable not set")
        print("Usage: DATABASE_URL=postgresql://user:pass@host:port/db python production_database_deploy.py")
        return False
    
    # Confirm production deployment
    print(f"🎯 Target Database: {database_url.split('@')[1] if '@' in database_url else 'Unknown'}")
    confirm = input("⚠️  This will deploy to PRODUCTION. Continue? (yes/no): ")
    
    if confirm.lower() != 'yes':
        print("❌ Deployment cancelled")
        return False
    
    # Execute deployment
    deployer = ProductionDatabaseDeployer(database_url)
    success = deployer.deploy()
    
    if success:
        print("\n🎉 Production deployment completed successfully!")
        print("📊 Next steps:")
        print("   1. Update application configuration")
        print("   2. Restart application services")
        print("   3. Run integration tests")
        print("   4. Monitor application logs")
    else:
        print("\n❌ Production deployment failed!")
        print("🔧 Troubleshooting:")
        print("   1. Check production_deploy.log for details")
        print("   2. Verify database connectivity")
        print("   3. Check user permissions")
        print("   4. Consider rollback if needed")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)