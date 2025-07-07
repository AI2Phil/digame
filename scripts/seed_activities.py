"""
Digital Activities Seeding Script
Adds digital activities for testing ProductivityMetricCard
"""

import sys
import os
from datetime import datetime, timedelta
import random
import json

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import SessionLocal, engine

def seed_digital_activities():
    """Seed digital activities for testing"""
    print("Starting digital activities seeding...")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if activities already exist
        existing_count = db.execute(text("SELECT COUNT(*) FROM digital_activities")).scalar() or 0
        if existing_count > 0:
            print(f"Found {existing_count} existing activities. Clearing them first...")
            db.execute(text("DELETE FROM digital_activities"))
            db.commit()
        
        # Insert digital activities for testing ProductivityMetricCard
        print("Seeding digital activities...")
        activity_sql = """
        INSERT INTO digital_activities (user_id, activity_type, timestamp, details)
        VALUES (:user_id, :activity_type, :timestamp, :details)
        """
        
        activity_types = [
            'email_check', 'document_edit', 'meeting_join', 'code_review', 
            'task_complete', 'research', 'planning', 'communication',
            'file_upload', 'data_analysis', 'report_generation', 'testing'
        ]
        
        total_activities = 0
        
        # Generate activities for the last 7 days for users 1-3
        for user_id in range(1, 4):  # Users 1, 2, 3
            for day_offset in range(7):  # Last 7 days
                target_date = datetime.utcnow() - timedelta(days=day_offset)
                
                # Generate 3-8 activities per day per user
                daily_activities = random.randint(3, 8)
                
                for activity_num in range(daily_activities):
                    # Spread activities throughout the day
                    hour = random.randint(8, 18)  # 8 AM to 6 PM
                    minute = random.randint(0, 59)
                    
                    activity_time = target_date.replace(hour=hour, minute=minute, second=0, microsecond=0)
                    activity_type = random.choice(activity_types)
                    
                    # Create some details for the activity
                    details = {
                        "duration_minutes": random.randint(5, 120),
                        "productivity_score": round(random.uniform(0.3, 1.0), 2),
                        "focus_level": random.choice(["low", "medium", "high"]),
                        "context": f"User {user_id} {activity_type} activity"
                    }
                    
                    activity_data = {
                        'user_id': user_id,
                        'activity_type': activity_type,
                        'timestamp': activity_time,
                        'details': json.dumps(details)
                    }
                    
                    db.execute(text(activity_sql), activity_data)
                    total_activities += 1
        
        db.commit()
        print("✅ Digital activities seeding completed successfully!")
        print(f"Created {total_activities} digital activities for users 1-3 over the last 7 days")
        
        # Show today's activity count for each user
        today = datetime.utcnow().date()
        start_of_day = datetime.combine(today, datetime.min.time())
        end_of_day = datetime.combine(today, datetime.max.time())
        
        for user_id in range(1, 4):
            today_count = db.execute(text("""
                SELECT COUNT(*) FROM digital_activities 
                WHERE user_id = :user_id 
                AND timestamp >= :start_date 
                AND timestamp <= :end_date
            """), {
                'user_id': user_id,
                'start_date': start_of_day,
                'end_date': end_of_day
            }).scalar()
            
            print(f"- User {user_id}: {today_count} activities today")
        
    except Exception as e:
        print(f"❌ Error during activities seeding: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_digital_activities()