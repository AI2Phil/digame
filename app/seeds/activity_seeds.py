"""
Activity Tracking Components Seeding Script
Comprehensive seeded data for all activity tracking elements
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date, time
import random
import json

from app.models.activity_models import (
    ActivityCategory, UserActivity, ProductivityMetric, 
    ActivityPattern, ActivityGoal
)

class ActivitySeeder:
    """Comprehensive seeder for activity tracking data"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def seed_all(self):
        """Seed all activity tracking data"""
        print("🌱 Seeding User Interface & Dashboard Components...")
        
        # Clear existing data
        self._clear_existing_data()
        
        # Seed data in dependency order
        self.seed_activity_categories()
        self.seed_user_activities()
        self.seed_productivity_metrics()
        self.seed_activity_patterns()
        self.seed_activity_goals()
        
        print("✅ User Interface & Dashboard Components seeded successfully!")
    
    def _clear_existing_data(self):
        """Clear existing activity data"""
        tables = [
            ActivityGoal, ActivityPattern, ProductivityMetric,
            UserActivity, ActivityCategory
        ]
        
        for table in tables:
            self.db.query(table).delete()
        self.db.commit()
    
    def seed_activity_categories(self):
        """Seed activity categories"""
        print("  📂 Seeding activity categories...")
        
        categories_data = [
            {
                "name": "Development",
                "description": "Software development and coding activities",
                "icon": "💻",
                "color": "#2563eb",
                "is_productive": True
            },
            {
                "name": "Meetings",
                "description": "Team meetings, calls, and collaborative sessions",
                "icon": "📞",
                "color": "#7c3aed",
                "is_productive": True
            },
            {
                "name": "Learning",
                "description": "Training, courses, and skill development",
                "icon": "📚",
                "color": "#16a34a",
                "is_productive": True
            },
            {
                "name": "Planning",
                "description": "Project planning and strategic thinking",
                "icon": "📋",
                "color": "#ea580c",
                "is_productive": True
            },
            {
                "name": "Break",
                "description": "Rest periods and personal time",
                "icon": "☕",
                "color": "#6b7280",
                "is_productive": False
            },
            {
                "name": "Email",
                "description": "Email communication and correspondence",
                "icon": "📧",
                "color": "#0891b2",
                "is_productive": True
            },
            {
                "name": "Research",
                "description": "Information gathering and analysis",
                "icon": "🔍",
                "color": "#059669",
                "is_productive": True
            },
            {
                "name": "Documentation",
                "description": "Writing documentation and reports",
                "icon": "📝",
                "color": "#7c2d12",
                "is_productive": True
            },
            {
                "name": "Testing",
                "description": "Quality assurance and testing activities",
                "icon": "🧪",
                "color": "#9333ea",
                "is_productive": True
            },
            {
                "name": "Administrative",
                "description": "Administrative tasks and paperwork",
                "icon": "📊",
                "color": "#dc2626",
                "is_productive": True
            },
            {
                "name": "Creative",
                "description": "Design and creative work",
                "icon": "🎨",
                "color": "#db2777",
                "is_productive": True
            },
            {
                "name": "Support",
                "description": "Customer support and help desk",
                "icon": "🎧",
                "color": "#0d9488",
                "is_productive": True
            }
        ]
        
        categories = []
        for cat_data in categories_data:
            category = ActivityCategory(**cat_data)
            categories.append(category)
        
        self.db.add_all(categories)
        self.db.commit()
        print(f"    ✓ Created {len(categories)} activity categories")
    
    def seed_user_activities(self):
        """Seed user activity records"""
        print("  📊 Seeding user activities...")
        
        # Get categories
        categories = self.db.query(ActivityCategory).all()
        category_map = {}
        for cat in categories:
            category_map[cat.name] = cat
        
        # Generate activities for multiple users over the last 90 days
        users = list(range(1, 21))  # 20 users
        activities = []
        
        for user_id in users:
            # Generate activities for last 90 days
            for day_offset in range(90):
                target_date = date.today() - timedelta(days=day_offset)
                
                # Skip weekends for some variety (70% chance to work on weekends)
                if target_date.weekday() >= 5 and random.random() < 0.3:
                    continue
                
                # Generate 4-12 activities per day
                daily_activities = random.randint(4, 12)
                
                # Start work day between 7-10 AM
                work_start_hour = random.randint(7, 10)
                current_time = datetime.combine(target_date, time(work_start_hour, 0))
                
                for _ in range(daily_activities):
                    # Choose activity type based on realistic distribution
                    activity_weights = {
                        "Development": 0.35,
                        "Meetings": 0.15,
                        "Email": 0.12,
                        "Planning": 0.08,
                        "Learning": 0.06,
                        "Documentation": 0.06,
                        "Testing": 0.05,
                        "Research": 0.04,
                        "Break": 0.04,
                        "Administrative": 0.03,
                        "Creative": 0.02,
                        "Support": 0.02
                    }
                    
                    category_name = random.choices(
                        list(activity_weights.keys()),
                        weights=list(activity_weights.values())
                    )[0]
                    
                    category = category_map[category_name]
                    
                    # Generate realistic duration based on activity type
                    if category_name == "Development":
                        duration = random.uniform(30, 180)  # 30min - 3h
                    elif category_name == "Meetings":
                        duration = random.uniform(15, 120)  # 15min - 2h
                    elif category_name == "Break":
                        duration = random.uniform(5, 30)    # 5-30min
                    elif category_name == "Email":
                        duration = random.uniform(10, 45)   # 10-45min
                    else:
                        duration = random.uniform(15, 90)   # 15min - 1.5h
                    
                    # Calculate end time
                    end_time = current_time + timedelta(minutes=duration)
                    
                    # Generate realistic productivity scores based on activity and time
                    base_productivity = 75
                    
                    # Time of day affects productivity
                    hour = current_time.hour
                    if 9 <= hour <= 11:  # Morning peak
                        base_productivity += random.uniform(5, 15)
                    elif 14 <= hour <= 16:  # Afternoon peak
                        base_productivity += random.uniform(0, 10)
                    elif hour >= 18:  # Evening decline
                        base_productivity -= random.uniform(5, 20)
                    
                    # Activity type affects productivity
                    if category_name == "Development":
                        base_productivity += random.uniform(-5, 10)
                    elif category_name == "Learning":
                        base_productivity += random.uniform(0, 15)
                    elif category_name == "Break":
                        base_productivity = random.uniform(20, 60)
                    elif category_name == "Meetings":
                        base_productivity += random.uniform(-10, 5)
                    
                    productivity_score = max(10.0, min(100.0, base_productivity + random.uniform(-10, 10)))
                    
                    # Generate activity titles
                    titles = {
                        "Development": [
                            "Feature implementation", "Bug fixing", "Code review",
                            "API development", "Frontend work", "Database optimization",
                            "Refactoring", "Unit testing", "Integration work"
                        ],
                        "Meetings": [
                            "Daily standup", "Sprint planning", "Code review meeting",
                            "Client call", "Team sync", "Architecture discussion",
                            "Retrospective", "One-on-one", "Project kickoff"
                        ],
                        "Learning": [
                            "Online course", "Technical reading", "Tutorial",
                            "Conference talk", "Workshop", "Skill practice",
                            "Documentation study", "Best practices research"
                        ],
                        "Email": [
                            "Email processing", "Client communication", "Team updates",
                            "Project coordination", "Administrative emails"
                        ],
                        "Break": [
                            "Coffee break", "Lunch", "Quick walk", "Personal time",
                            "Stretch break", "Social chat"
                        ]
                    }
                    
                    title = random.choice(titles.get(category_name, [f"{category_name} work"]))
                    
                    activity = UserActivity(
                        user_id=user_id,
                        category_id=category.id,
                        title=title,
                        description=f"{title} - {category.description}",
                        duration_minutes=duration,
                        start_time=current_time,
                        end_time=end_time,
                        productivity_score=productivity_score,
                        energy_level=random.randint(3, 10),
                        focus_level=random.randint(3, 10),
                        interruptions=random.randint(0, 5),
                        location=random.choice(["Office", "Home", "Coworking", "Remote"]),
                        device_used=random.choice(["Laptop", "Desktop", "Mobile", "Tablet"]),
                        tags=json.dumps([category_name.lower(), "work"]),
                        notes=f"Completed {title.lower()} with {productivity_score:.0f}% efficiency"
                    )
                    activities.append(activity)
                    
                    # Move to next activity with some gap
                    current_time = end_time + timedelta(minutes=random.randint(0, 15))
                    
                    # Don't work too late
                    if current_time.hour >= 19:
                        break
        
        # Batch insert for performance
        batch_size = 1000
        for i in range(0, len(activities), batch_size):
            batch = activities[i:i + batch_size]
            self.db.add_all(batch)
            self.db.commit()
        
        print(f"    ✓ Created {len(activities)} user activities")
    
    def seed_productivity_metrics(self):
        """Seed daily productivity metrics"""
        print("  📈 Seeding productivity metrics...")
        
        users = list(range(1, 21))  # 20 users
        metrics = []
        
        for user_id in users:
            # Generate metrics for last 90 days
            for day_offset in range(90):
                target_date = date.today() - timedelta(days=day_offset)
                
                # Get activities for this user and date
                day_start = datetime.combine(target_date, time.min)
                day_end = datetime.combine(target_date, time.max)
                
                day_activities = self.db.query(UserActivity).filter(
                    UserActivity.user_id == user_id,
                    UserActivity.start_time >= day_start,
                    UserActivity.start_time <= day_end
                ).all()
                
                if not day_activities:
                    continue
                
                # Calculate metrics from activities
                total_duration = sum(a.duration_minutes for a in day_activities)
                total_hours = total_duration / 60
                
                productive_activities = [a for a in day_activities if a.category.is_productive]
                productive_duration = sum(a.duration_minutes for a in productive_activities)
                productive_hours = productive_duration / 60
                
                # Calculate scores
                efficiency_score = sum(a.productivity_score * a.duration_minutes for a in day_activities) / total_duration if total_duration > 0 else 0
                focus_score = sum(a.focus_level * 10 * a.duration_minutes for a in day_activities) / total_duration if total_duration > 0 else 0
                energy_score = sum(a.energy_level * 10 * a.duration_minutes for a in day_activities) / total_duration if total_duration > 0 else 0
                
                # Find most productive hour
                hourly_productivity = {}
                for activity in day_activities:
                    hour = activity.start_time.hour
                    if hour not in hourly_productivity:
                        hourly_productivity[hour] = []
                    hourly_productivity[hour].append(activity.productivity_score)
                
                most_productive_hour = max(hourly_productivity.keys(), 
                                         key=lambda h: sum(hourly_productivity[h]) / len(hourly_productivity[h])) if hourly_productivity else 9
                
                # Calculate work type breakdown
                dev_activities = [a for a in day_activities if a.category.name == "Development"]
                meeting_activities = [a for a in day_activities if a.category.name == "Meetings"]
                learning_activities = [a for a in day_activities if a.category.name == "Learning"]
                
                deep_work_minutes = sum(a.duration_minutes for a in dev_activities if a.duration_minutes >= 30)
                meeting_minutes = sum(a.duration_minutes for a in meeting_activities)
                learning_minutes = sum(a.duration_minutes for a in learning_activities)
                
                # Count interruptions and context switches
                total_interruptions = sum(a.interruptions for a in day_activities)
                context_switches = len(day_activities) - 1  # Number of activity transitions
                
                metric = ProductivityMetric(
                    user_id=user_id,
                    date=target_date,
                    total_active_hours=total_hours,
                    productive_hours=productive_hours,
                    efficiency_score=efficiency_score,
                    focus_score=focus_score,
                    energy_score=energy_score,
                    most_productive_hour=most_productive_hour,
                    least_productive_hour=(most_productive_hour + 6) % 24,  # Opposite time
                    peak_productivity_start=f"{most_productive_hour:02d}:00",
                    peak_productivity_end=f"{(most_productive_hour + 2) % 24:02d}:00",
                    total_interruptions=total_interruptions,
                    context_switches=context_switches,
                    deep_work_minutes=deep_work_minutes,
                    meeting_minutes=meeting_minutes,
                    learning_minutes=learning_minutes,
                    planning_minutes=sum(a.duration_minutes for a in day_activities if a.category.name == "Planning")
                )
                metrics.append(metric)
        
        self.db.add_all(metrics)
        self.db.commit()
        print(f"    ✓ Created {len(metrics)} productivity metrics")
    
    def seed_activity_patterns(self):
        """Seed activity patterns and insights"""
        print("  🔍 Seeding activity patterns...")
        
        users = list(range(1, 21))  # 20 users
        patterns = []
        
        pattern_types = ["daily", "weekly", "monthly"]
        pattern_templates = {
            "daily": [
                "Morning productivity peak",
                "Afternoon energy dip",
                "Late day focus decline",
                "Consistent break timing"
            ],
            "weekly": [
                "Monday planning pattern",
                "Friday wrap-up routine",
                "Mid-week productivity peak",
                "Weekend work habits"
            ],
            "monthly": [
                "Sprint cycle productivity",
                "Month-end intensity",
                "Quarterly planning focus",
                "Seasonal productivity variation"
            ]
        }
        
        for user_id in users:
            # Generate 3-8 patterns per user
            num_patterns = random.randint(3, 8)
            
            for _ in range(num_patterns):
                pattern_type = random.choice(pattern_types)
                pattern_name = random.choice(pattern_templates[pattern_type])
                
                start_date = datetime.now() - timedelta(days=random.randint(30, 90))
                
                pattern = ActivityPattern(
                    user_id=user_id,
                    pattern_type=pattern_type,
                    pattern_name=pattern_name,
                    description=f"Detected {pattern_name.lower()} in user activity data",
                    confidence_score=random.uniform(0.6, 0.95),
                    frequency=random.choice(["daily", "weekly", "occasionally", "regularly"]),
                    impact_score=random.uniform(0.3, 0.8),
                    start_date=start_date,
                    end_date=None if random.random() < 0.7 else start_date + timedelta(days=random.randint(7, 60)),
                    is_active=random.random() < 0.8,
                    pattern_data=json.dumps({
                        "peak_hours": [9, 10, 11],
                        "avg_productivity": random.uniform(70, 90),
                        "frequency_per_week": random.randint(3, 7)
                    }),
                    recommendations=json.dumps([
                        "Schedule important tasks during peak hours",
                        "Take breaks during low-energy periods",
                        "Optimize meeting scheduling"
                    ])
                )
                patterns.append(pattern)
        
        self.db.add_all(patterns)
        self.db.commit()
        print(f"    ✓ Created {len(patterns)} activity patterns")
    
    def seed_activity_goals(self):
        """Seed activity goals"""
        print("  🎯 Seeding activity goals...")
        
        # Get categories
        categories = self.db.query(ActivityCategory).all()
        users = list(range(1, 21))  # 20 users
        goals = []
        
        goal_types = ["time", "efficiency", "focus", "learning", "productivity"]
        goal_templates = {
            "time": [
                "Spend 6 hours daily on development",
                "Limit meetings to 2 hours per day",
                "Dedicate 1 hour daily to learning"
            ],
            "efficiency": [
                "Achieve 85% productivity score",
                "Reduce context switching by 30%",
                "Minimize interruptions during deep work"
            ],
            "focus": [
                "Maintain focus for 2-hour blocks",
                "Complete tasks without interruption",
                "Improve concentration during meetings"
            ],
            "learning": [
                "Complete online course this month",
                "Read 2 technical articles daily",
                "Practice new skills weekly"
            ],
            "productivity": [
                "Increase daily output by 20%",
                "Complete all planned tasks",
                "Improve work-life balance"
            ]
        }
        
        statuses = ["active", "completed", "paused", "cancelled"]
        priorities = ["low", "medium", "high"]
        
        for user_id in users:
            # Generate 2-6 goals per user
            num_goals = random.randint(2, 6)
            
            for _ in range(num_goals):
                goal_type = random.choice(goal_types)
                title = random.choice(goal_templates[goal_type])
                
                # Set target values based on goal type
                if goal_type == "time":
                    target_value = random.uniform(4, 8)  # hours
                    unit = "hours"
                elif goal_type == "efficiency":
                    target_value = random.uniform(75, 95)  # percentage
                    unit = "percentage"
                else:
                    target_value = random.uniform(1, 10)  # generic score
                    unit = "score"
                
                start_date = datetime.now() - timedelta(days=random.randint(0, 60))
                target_date = start_date + timedelta(days=random.randint(7, 90))
                
                # Calculate progress
                days_elapsed = (datetime.now() - start_date).days
                total_days = (target_date - start_date).days
                progress_percentage = min(100.0, (days_elapsed / total_days * 100) + random.uniform(-20, 20))
                current_value = target_value * (progress_percentage / 100) + random.uniform(-target_value * 0.1, target_value * 0.1)
                
                status = random.choice(statuses)
                if progress_percentage >= 100:
                    status = "completed"
                elif progress_percentage < 10:
                    status = random.choice(["active", "paused"])
                
                goal = ActivityGoal(
                    user_id=user_id,
                    category_id=random.choice(categories).id if random.random() < 0.7 else None,
                    goal_type=goal_type,
                    title=title,
                    description=f"Goal to {title.lower()} by {target_date.strftime('%B %Y')}",
                    target_value=target_value,
                    current_value=max(0, current_value),
                    unit=unit,
                    target_date=target_date,
                    start_date=start_date,
                    status=status,
                    priority=random.choice(priorities),
                    is_recurring=random.random() < 0.3,
                    recurrence_pattern=random.choice(["daily", "weekly", "monthly"]) if random.random() < 0.3 else None,
                    progress_percentage=max(0, min(100, progress_percentage))
                )
                goals.append(goal)
        
        self.db.add_all(goals)
        self.db.commit()
        print(f"    ✓ Created {len(goals)} activity goals")


def seed_activity_data(db: Session):
    """Main function to seed all activity data"""
    seeder = ActivitySeeder(db)
    seeder.seed_all()


if __name__ == "__main__":
    from app.database import SessionLocal
    
    db = SessionLocal()
    try:
        seed_activity_data(db)
    finally:
        db.close()