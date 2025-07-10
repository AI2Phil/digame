#!/usr/bin/env python3
"""
Phase 1 Database Deployment Script
Standalone script to deploy Phase 1 social networking and learning features database schema.
This bypasses migration conflicts and creates the schema directly.
"""

import os
import sys
import sqlite3
from pathlib import Path
from typing import Dict, Any
import tempfile

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

def create_phase1_schema(db_path: str) -> bool:
    """Create Phase 1 database schema directly"""
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("🔄 Creating Phase 1 database schema...")
        
        # ========================================
        # SOCIAL NETWORKING TABLES
        # ========================================
        
        # User Connections Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_connections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                connected_user_id INTEGER NOT NULL,
                connection_type VARCHAR(50) NOT NULL DEFAULT 'professional',
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                initiated_by INTEGER NOT NULL,
                connected_at DATETIME,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (connected_user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (initiated_by) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, connected_user_id)
            )
        """)
        
        # Peer Matching Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS peer_matches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                matched_user_id INTEGER NOT NULL,
                compatibility_score DECIMAL(5,2) NOT NULL,
                match_factors TEXT, -- JSON data
                status VARCHAR(20) NOT NULL DEFAULT 'suggested',
                viewed_at DATETIME,
                responded_at DATETIME,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (matched_user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, matched_user_id)
            )
        """)
        
        # Social Metrics Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS social_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                total_connections INTEGER NOT NULL DEFAULT 0,
                active_mentorships INTEGER NOT NULL DEFAULT 0,
                learning_partnerships INTEGER NOT NULL DEFAULT 0,
                knowledge_shared INTEGER NOT NULL DEFAULT 0,
                collaboration_score INTEGER NOT NULL DEFAULT 0,
                network_growth_rate DECIMAL(5,2) NOT NULL DEFAULT 0.0,
                engagement_level VARCHAR(20) NOT NULL DEFAULT 'low',
                last_calculated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        
        # User Skills Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                skill_name VARCHAR(100) NOT NULL,
                proficiency_level VARCHAR(20) NOT NULL,
                years_experience INTEGER,
                is_seeking_mentorship BOOLEAN NOT NULL DEFAULT 0,
                is_offering_mentorship BOOLEAN NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, skill_name)
            )
        """)
        
        # ========================================
        # LEARNING & DEVELOPMENT TABLES
        # ========================================
        
        # Course Categories Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS course_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                parent_category_id INTEGER,
                sort_order INTEGER NOT NULL DEFAULT 0,
                is_active BOOLEAN NOT NULL DEFAULT 1,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_category_id) REFERENCES course_categories(id) ON DELETE SET NULL
            )
        """)
        
        # Courses Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                short_description VARCHAR(500),
                category_id INTEGER NOT NULL,
                difficulty_level VARCHAR(20) NOT NULL DEFAULT 'beginner',
                duration_hours INTEGER,
                estimated_completion_days INTEGER,
                prerequisites TEXT, -- JSON data
                learning_objectives TEXT, -- JSON data
                skills_covered TEXT, -- JSON data
                instructor_id INTEGER,
                max_enrollments INTEGER,
                current_enrollments INTEGER NOT NULL DEFAULT 0,
                rating_average DECIMAL(3,2),
                rating_count INTEGER NOT NULL DEFAULT 0,
                is_published BOOLEAN NOT NULL DEFAULT 0,
                published_at DATETIME,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES course_categories(id) ON DELETE RESTRICT,
                FOREIGN KEY (instructor_id) REFERENCES users(id) ON DELETE SET NULL
            )
        """)
        
        # Course Enrollments Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS course_enrollments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                course_id INTEGER NOT NULL,
                progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.0,
                status VARCHAR(20) NOT NULL DEFAULT 'enrolled',
                started_at DATETIME,
                completed_at DATETIME,
                last_accessed_at DATETIME,
                time_spent_minutes INTEGER NOT NULL DEFAULT 0,
                enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
                UNIQUE(user_id, course_id)
            )
        """)
        
        # Learning Progress Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS learning_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                skill_name VARCHAR(100) NOT NULL,
                current_level VARCHAR(20) NOT NULL DEFAULT 'beginner',
                target_level VARCHAR(20),
                progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.0,
                courses_completed INTEGER NOT NULL DEFAULT 0,
                total_study_hours INTEGER NOT NULL DEFAULT 0,
                last_activity_at DATETIME,
                target_completion_date DATE,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE(user_id, skill_name)
            )
        """)
        
        # Learning Recommendations Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS learning_recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                course_id INTEGER,
                skill_name VARCHAR(100),
                recommendation_type VARCHAR(50) NOT NULL,
                recommendation_reason TEXT,
                confidence_score DECIMAL(3,2) NOT NULL,
                priority_score INTEGER NOT NULL DEFAULT 1,
                is_viewed BOOLEAN NOT NULL DEFAULT 0,
                is_accepted BOOLEAN,
                viewed_at DATETIME,
                responded_at DATETIME,
                expires_at DATETIME,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            )
        """)
        
        # ========================================
        # CREATE INDEXES FOR PERFORMANCE
        # ========================================
        
        indexes = [
            # Social Networking Indexes
            "CREATE INDEX IF NOT EXISTS idx_user_connections_user_id ON user_connections(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_user_connections_connected_user_id ON user_connections(connected_user_id)",
            "CREATE INDEX IF NOT EXISTS idx_user_connections_status ON user_connections(status)",
            "CREATE INDEX IF NOT EXISTS idx_peer_matches_user_id ON peer_matches(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_peer_matches_compatibility_score ON peer_matches(compatibility_score)",
            "CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_user_skills_skill_name ON user_skills(skill_name)",
            
            # Learning & Development Indexes
            "CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id)",
            "CREATE INDEX IF NOT EXISTS idx_courses_difficulty_level ON courses(difficulty_level)",
            "CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published)",
            "CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id)",
            "CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status)",
            "CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON learning_progress(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_learning_progress_skill_name ON learning_progress(skill_name)",
            "CREATE INDEX IF NOT EXISTS idx_learning_recommendations_user_id ON learning_recommendations(user_id)",
            "CREATE INDEX IF NOT EXISTS idx_learning_recommendations_type ON learning_recommendations(recommendation_type)"
        ]
        
        for index_sql in indexes:
            cursor.execute(index_sql)
        
        # ========================================
        # INSERT SAMPLE DATA
        # ========================================
        
        # Insert sample course categories
        cursor.execute("""
            INSERT OR IGNORE INTO course_categories (name, description, sort_order) VALUES
            ('Programming', 'Software development and programming languages', 1),
            ('Data Science', 'Data analysis, machine learning, and statistics', 2),
            ('Design', 'UI/UX design, graphic design, and creative skills', 3),
            ('Business', 'Management, entrepreneurship, and business skills', 4),
            ('Communication', 'Public speaking, writing, and interpersonal skills', 5)
        """)
        
        # Insert sample courses
        cursor.execute("""
            INSERT OR IGNORE INTO courses (title, description, category_id, difficulty_level, duration_hours, is_published) VALUES
            ('Python Fundamentals', 'Learn the basics of Python programming', 1, 'beginner', 20, 1),
            ('Advanced JavaScript', 'Master advanced JavaScript concepts', 1, 'advanced', 30, 1),
            ('Data Analysis with Pandas', 'Analyze data using Python Pandas library', 2, 'intermediate', 25, 1),
            ('UI/UX Design Principles', 'Learn fundamental design principles', 3, 'beginner', 15, 1),
            ('Project Management Basics', 'Introduction to project management', 4, 'beginner', 18, 1)
        """)
        
        conn.commit()
        conn.close()
        
        print("✅ Phase 1 database schema created successfully")
        return True
        
    except Exception as e:
        print(f"❌ Error creating Phase 1 schema: {e}")
        return False

def validate_schema(db_path: str) -> Dict[str, Any]:
    """Validate the created schema"""
    expected_tables = [
        'user_connections', 'peer_matches', 'social_metrics', 'user_skills',
        'course_categories', 'courses', 'course_enrollments',
        'learning_progress', 'learning_recommendations'
    ]
    
    results: Dict[str, Any] = {
        'tables_found': [],
        'tables_missing': [],
        'sample_data': {},
        'indexes_found': []
    }
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        actual_tables = [row[0] for row in cursor.fetchall()]
        
        for table in expected_tables:
            if table in actual_tables:
                results['tables_found'].append(table)
                
                # Get row count for sample data
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                results['sample_data'][table] = count
            else:
                results['tables_missing'].append(table)
        
        # Check indexes
        cursor.execute("SELECT name FROM sqlite_master WHERE type='index'")
        indexes = [row[0] for row in cursor.fetchall()]
        results['indexes_found'] = [idx for idx in indexes if idx.startswith('idx_')]
        
        conn.close()
        
    except Exception as e:
        results['error'] = str(e)
    
    return results

def main():
    """Main deployment function"""
    print("🚀 Phase 1 Database Deployment")
    print("=" * 50)
    
    # Create test database
    with tempfile.NamedTemporaryFile(suffix='.db', delete=False) as tmp_db:
        test_db_path = tmp_db.name
    
    try:
        # Deploy schema
        if not create_phase1_schema(test_db_path):
            print("❌ Schema deployment failed")
            return False
        
        # Validate schema
        print("\n🔍 Validating schema...")
        results = validate_schema(test_db_path)
        
        if 'error' in results:
            print(f"❌ Validation error: {results['error']}")
            return False
        
        # Report results
        print(f"\n📊 Validation Results:")
        print(f"   ✅ Tables created: {len(results['tables_found'])}")
        print(f"   ❌ Tables missing: {len(results['tables_missing'])}")
        print(f"   📈 Indexes created: {len(results['indexes_found'])}")
        
        if results['tables_missing']:
            print(f"   ⚠️  Missing tables: {results['tables_missing']}")
            return False
        
        print(f"\n📋 Sample Data:")
        for table, count in results['sample_data'].items():
            print(f"   {table}: {count} rows")
        
        print(f"\n🎉 Phase 1 database deployment completed successfully!")
        print(f"📍 Test database created at: {test_db_path}")
        print(f"\n💡 To deploy to production:")
        print(f"   1. Set DATABASE_URL environment variable")
        print(f"   2. Run: python dev-tools/deploy_phase1_database.py --production")
        
        return True
        
    finally:
        # Clean up test database
        if os.path.exists(test_db_path):
            os.unlink(test_db_path)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)