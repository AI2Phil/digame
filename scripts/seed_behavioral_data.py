"""
Behavioral Analysis Data Seeding Script
Creates behavioral models, patterns, and anomalies for testing AdvancedBehavioralAnalysis component
"""

import sys
import os
from datetime import datetime, timedelta
import random
import json
import pickle

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy.orm import Session
from sqlalchemy import text, select
from app.database import SessionLocal, engine
from app.models.behavior_model import BehavioralModel, BehavioralPattern
from app.models.anomaly import DetectedAnomaly

def seed_behavioral_data():
    """Seed behavioral models, patterns, and anomalies for testing"""
    print("Starting behavioral analysis data seeding...")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if behavioral models already exist using SQLAlchemy 2.0 ORM
        existing_models = db.query(BehavioralModel).count()
        if existing_models > 0:
            print(f"Found {existing_models} existing behavioral models. Clearing them first...")
            db.query(BehavioralPattern).delete()
            db.query(BehavioralModel).delete()
            db.commit()
        
        # Check if anomalies already exist using SQLAlchemy 2.0 ORM
        existing_anomalies = db.query(DetectedAnomaly).count()
        if existing_anomalies > 0:
            print(f"Found {existing_anomalies} existing anomalies. Clearing them first...")
            db.query(DetectedAnomaly).delete()
            db.commit()
        
        # Create behavioral models for users 1-3 using SQLAlchemy 2.0 ORM
        print("Creating behavioral models...")
        
        created_models = []
        
        for user_id in range(1, 4):  # Users 1, 2, 3
            # Create a behavioral model for each user using SQLAlchemy 2.0 ORM
            num_clusters = random.randint(3, 6)
            behavioral_model = BehavioralModel(
                user_id=user_id,
                name=f'User {user_id} Behavioral Model',
                version='1.0',
                algorithm='kmeans',
                parameters={
                    'n_clusters': num_clusters,
                    'random_state': 42,
                    'max_iter': 300
                },
                silhouette_score=round(random.uniform(0.3, 0.8), 3),
                num_clusters=num_clusters,
                model_data=pickle.dumps({'model_type': 'kmeans', 'trained': True})
            )
            
            db.add(behavioral_model)
            db.flush()  # Flush to get the ID
            created_models.append(behavioral_model)
            
            # Create behavioral patterns for this model using SQLAlchemy 2.0 ORM
            num_patterns = behavioral_model.num_clusters
            
            pattern_types = [
                ('Morning Productivity', 'High productivity pattern in morning hours'),
                ('Afternoon Focus', 'Deep work sessions in afternoon'),
                ('Communication Burst', 'Concentrated communication activities'),
                ('Research Mode', 'Extended research and analysis periods'),
                ('Meeting Heavy', 'Days with multiple meetings'),
                ('Creative Flow', 'Creative and planning activities')
            ]
            
            for pattern_idx in range(num_patterns):
                pattern_name, pattern_desc = random.choice(pattern_types)
                
                # Generate realistic temporal distribution
                temporal_dist = {
                    'hour_of_day': {
                        str(hour): round(random.uniform(0.1, 1.0), 2)
                        for hour in range(8, 19) if random.random() > 0.3
                    },
                    'day_of_week': {
                        str(day): round(random.uniform(0.2, 1.0), 2)
                        for day in range(7) if random.random() > 0.2
                    }
                }
                
                # Generate activity distribution
                activity_types = ['email_check', 'document_edit', 'meeting_join', 'code_review',
                                'task_complete', 'research', 'planning', 'communication']
                activity_dist = {
                    activity: round(random.uniform(0.1, 0.8), 2)
                    for activity in random.sample(activity_types, random.randint(3, 6))
                }
                
                # Generate context features
                context_features = {
                    'is_context_switch': round(random.uniform(0.1, 0.4), 2),
                    'focus_level': random.choice(['low', 'medium', 'high']),
                    'productivity_score': round(random.uniform(0.4, 0.9), 2)
                }
                
                behavioral_pattern = BehavioralPattern(
                    model_id=behavioral_model.id,
                    pattern_label=pattern_idx,
                    name=f"{pattern_name} - User {user_id}",
                    description=pattern_desc,
                    size=random.randint(15, 50),
                    centroid=[round(random.uniform(-2, 2), 3) for _ in range(5)],
                    representative_activities=[random.randint(1, 100) for _ in range(3)],
                    temporal_distribution=temporal_dist,
                    activity_distribution=activity_dist,
                    context_features=context_features
                )
                
                db.add(behavioral_pattern)
        
        # Create some anomalies using SQLAlchemy 2.0 ORM
        print("Creating behavioral anomalies...")
        
        anomaly_types = [
            ('Unusual Activity Spike', 'Unexpected increase in activity volume'),
            ('Pattern Deviation', 'Significant deviation from normal behavioral patterns'),
            ('Context Switch Anomaly', 'Unusual context switching behavior'),
            ('Productivity Drop', 'Significant decrease in productivity metrics'),
            ('Time Pattern Shift', 'Unusual shift in temporal activity patterns')
        ]
        
        for user_id in range(1, 4):
            # Create 2-4 anomalies per user
            num_anomalies = random.randint(2, 4)
            
            for _ in range(num_anomalies):
                anomaly_type, description = random.choice(anomaly_types)
                
                detected_anomaly = DetectedAnomaly(
                    user_id=user_id,
                    anomaly_type=anomaly_type,
                    description=f"{description} for User {user_id}",
                    severity_score=round(random.uniform(0.3, 0.9), 2),
                    related_activity_ids=[random.randint(1, 50) for _ in range(random.randint(1, 5))],
                    status=random.choice(['new', 'investigating', 'resolved'])
                )
                
                db.add(detected_anomaly)
        
        db.commit()
        print("✅ Behavioral analysis data seeding completed successfully!")
        
        # Show summary using SQLAlchemy 2.0 ORM
        models_count = db.query(BehavioralModel).count()
        patterns_count = db.query(BehavioralPattern).count()
        anomalies_count = db.query(DetectedAnomaly).count()
        
        print(f"Created:")
        print(f"- {models_count} behavioral models")
        print(f"- {patterns_count} behavioral patterns")
        print(f"- {anomalies_count} detected anomalies")
        
    except Exception as e:
        print(f"❌ Error during behavioral data seeding: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_behavioral_data()