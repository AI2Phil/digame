"""
Comprehensive Digital Twin Data Seeding Script
Populates realistic digital twin data including twins, patterns, interactions, and learning data
"""

import asyncio
import random
import uuid
import sys
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session

# Add parent directory to path so we can import from app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine
from models.digital_twin import (
    DigitalTwin, ActivityPattern, BehavioralLearning, PredictionModel,
    SimulationResult, TwinInteraction, ActivityStream, TwinKnowledge
)
from models.user import User
from models.tenant import Tenant


class DigitalTwinDataSeeder:
    """Comprehensive digital twin data seeder with realistic patterns and interactions"""
    
    def __init__(self):
        self.db = SessionLocal()
        self.tenant_id = 1  # Default tenant for seeding
        self.user_ids = []
        self.twin_ids = []
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        self.db.close()

    async def seed_all_data(self):
        """Seed all digital twin data with proper relationships"""
        print("🧠 Starting comprehensive digital twin data seeding...")
        
        # Set random seed for reproducible data
        random.seed(42)
        
        # Seed in proper order due to foreign key relationships
        await self.seed_users_and_twins()
        await self.seed_activity_patterns()
        await self.seed_behavioral_learning()
        await self.seed_prediction_models()
        await self.seed_twin_interactions()
        await self.seed_activity_streams()
        await self.seed_twin_knowledge()
        await self.seed_simulation_results()
        
        self.db.commit()
        print("✅ Digital twin data seeding completed successfully!")

    async def seed_users_and_twins(self):
        """Seed users and their digital twins"""
        print("👥 Seeding users and digital twins...")
        
        # Get or create tenant
        tenant = self.db.query(Tenant).filter(Tenant.id == self.tenant_id).first()
        if not tenant:
            tenant = Tenant(
                id=self.tenant_id,
                name="Demo Organization",
                slug="demo-organization",
                domain="demo.digame.ai",
                subdomain="demo",
                admin_email="admin@demo.digame.ai",
                admin_name="Demo Admin",
                subscription_tier="enterprise",
                is_active=True,
                created_at=datetime.utcnow() - timedelta(days=90)
            )
            self.db.add(tenant)
            self.db.flush()
        
        # Sample user data for digital twins
        sample_users = [
            {"email": "alice.johnson@demo.com", "first_name": "Alice", "last_name": "Johnson", "role": "Data Scientist"},
            {"email": "bob.smith@demo.com", "first_name": "Bob", "last_name": "Smith", "role": "Product Manager"},
            {"email": "carol.davis@demo.com", "first_name": "Carol", "last_name": "Davis", "role": "Software Engineer"},
            {"email": "david.wilson@demo.com", "first_name": "David", "last_name": "Wilson", "role": "UX Designer"},
            {"email": "emma.brown@demo.com", "first_name": "Emma", "last_name": "Brown", "role": "Marketing Manager"},
            {"email": "frank.miller@demo.com", "first_name": "Frank", "last_name": "Miller", "role": "DevOps Engineer"},
            {"email": "grace.taylor@demo.com", "first_name": "Grace", "last_name": "Taylor", "role": "Business Analyst"},
            {"email": "henry.anderson@demo.com", "first_name": "Henry", "last_name": "Anderson", "role": "Team Lead"},
            {"email": "iris.thomas@demo.com", "first_name": "Iris", "last_name": "Thomas", "role": "QA Engineer"},
            {"email": "jack.white@demo.com", "first_name": "Jack", "last_name": "White", "role": "Sales Manager"},
        ]
        
        for i, user_data in enumerate(sample_users):
            # Create or get user
            user = self.db.query(User).filter(User.email == user_data["email"]).first()
            if not user:
                user = User(
                    email=user_data["email"],
                    username=user_data["email"].split("@")[0],  # Use email prefix as username
                    first_name=user_data["first_name"],
                    last_name=user_data["last_name"],
                    hashed_password="demo_password_hash",  # Demo password hash
                    tenant_id=self.tenant_id,
                    subscription_tier="team",
                    is_active=True,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(30, 90))
                )
                self.db.add(user)
                self.db.flush()
            
            self.user_ids.append(user.id)
            
            # Create digital twin for user
            twin_id = str(uuid.uuid4())
            twin_created = datetime.utcnow() - timedelta(days=random.randint(15, 60))
            
            # Realistic twin status distribution
            statuses = ["active", "learning", "active", "active", "learning"]  # Weighted towards active
            status = random.choice(statuses)
            
            # Learning progress based on creation date and activity
            days_since_creation = (datetime.utcnow() - twin_created).days
            base_progress = min(days_since_creation * 1.5, 95)  # 1.5% per day, max 95%
            learning_progress = max(15.0, base_progress + random.uniform(-10, 10))
            
            # Accuracy score correlates with learning progress
            accuracy_score = min(99.0, learning_progress * 0.9 + random.uniform(-5, 15))
            
            twin = DigitalTwin(
                id=twin_id,
                user_id=user.id,
                name=f"ProductivityTwin_{user.first_name}{user.last_name}",
                status=status,
                learning_progress=round(learning_progress, 1),
                accuracy_score=round(accuracy_score, 1),
                model_version=random.choice(["v2.0.1", "v2.1.0", "v2.1.1"]),
                last_training_at=twin_created + timedelta(days=random.randint(1, days_since_creation)),
                created_at=twin_created,
                updated_at=datetime.utcnow() - timedelta(hours=random.randint(1, 24))
            )
            
            self.db.add(twin)
            self.twin_ids.append(twin_id)
        
        print(f"   ✓ Created {len(sample_users)} users and digital twins")

    async def seed_activity_patterns(self):
        """Seed realistic activity patterns for digital twins"""
        print("📊 Seeding activity patterns...")
        
        pattern_types = [
            "productivity_peak", "focus_session", "break_pattern", "meeting_frequency",
            "task_completion", "energy_level", "collaboration_style", "work_rhythm",
            "learning_preference", "communication_pattern"
        ]
        
        pattern_count = 0
        for twin_id in self.twin_ids:
            # Each twin has 3-8 discovered patterns
            num_patterns = random.randint(3, 8)
            
            for _ in range(num_patterns):
                pattern_type = random.choice(pattern_types)
                
                # Generate realistic pattern data based on type
                pattern_data = self.generate_pattern_data(pattern_type)
                
                pattern = ActivityPattern(
                    id=str(uuid.uuid4()),
                    twin_id=twin_id,
                    pattern_type=pattern_type,
                    pattern_data=pattern_data,
                    confidence_score=round(random.uniform(0.6, 0.95), 3),
                    frequency_score=round(random.uniform(0.4, 0.9), 3),
                    impact_score=round(random.uniform(0.3, 0.8), 3),
                    discovered_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
                    validated_at=datetime.utcnow() - timedelta(days=random.randint(0, 15)) if random.random() > 0.3 else None
                )
                
                self.db.add(pattern)
                pattern_count += 1
        
        print(f"   ✓ Created {pattern_count} activity patterns")

    def generate_pattern_data(self, pattern_type: str) -> Dict[str, Any]:
        """Generate realistic pattern data based on pattern type"""
        if pattern_type == "productivity_peak":
            return {
                "peak_hours": [random.randint(8, 11), random.randint(13, 16)],
                "productivity_score": round(random.uniform(7.5, 9.5), 1),
                "consistency": round(random.uniform(0.7, 0.9), 2),
                "factors": ["energy_level", "meeting_schedule", "task_complexity"]
            }
        elif pattern_type == "focus_session":
            return {
                "average_duration": random.randint(45, 120),
                "optimal_duration": random.randint(60, 90),
                "interruption_tolerance": round(random.uniform(0.2, 0.8), 2),
                "preferred_environment": random.choice(["quiet", "background_music", "collaborative"])
            }
        elif pattern_type == "break_pattern":
            return {
                "frequency": random.randint(60, 180),  # minutes between breaks
                "duration": random.randint(5, 20),     # break duration
                "type": random.choice(["short_walk", "coffee", "social", "rest"]),
                "effectiveness": round(random.uniform(0.6, 0.9), 2)
            }
        elif pattern_type == "meeting_frequency":
            return {
                "daily_average": random.randint(2, 8),
                "optimal_count": random.randint(3, 5),
                "preferred_duration": random.randint(30, 60),
                "productivity_impact": round(random.uniform(-0.3, 0.2), 2)
            }
        elif pattern_type == "task_completion":
            return {
                "completion_rate": round(random.uniform(0.75, 0.95), 2),
                "average_time_ratio": round(random.uniform(0.8, 1.3), 2),  # actual vs estimated
                "preferred_complexity": random.choice(["simple", "moderate", "complex"]),
                "batch_size": random.randint(1, 5)
            }
        else:
            # Generic pattern data
            return {
                "score": round(random.uniform(0.5, 0.9), 2),
                "frequency": random.randint(1, 10),
                "impact": round(random.uniform(0.3, 0.8), 2),
                "trend": random.choice(["improving", "stable", "declining"])
            }

    async def seed_behavioral_learning(self):
        """Seed behavioral learning data for digital twins"""
        print("🧠 Seeding behavioral learning data...")
        
        behavior_categories = [
            "work_style", "communication", "learning", "decision_making",
            "stress_response", "collaboration", "time_management", "goal_setting"
        ]
        
        learning_count = 0
        for twin_id in self.twin_ids:
            # Each twin has 2-5 behavioral learning entries
            num_entries = random.randint(2, 5)
            
            for _ in range(num_entries):
                category = random.choice(behavior_categories)
                
                learning = BehavioralLearning(
                    id=str(uuid.uuid4()),
                    twin_id=twin_id,
                    behavior_category=category,
                    learning_data=self.generate_learning_data(category),
                    confidence_level=round(random.uniform(0.6, 0.9), 3),
                    learning_iteration=random.randint(1, 10),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 15))
                )
                
                self.db.add(learning)
                learning_count += 1
        
        print(f"   ✓ Created {learning_count} behavioral learning entries")

    def generate_learning_data(self, category: str) -> Dict[str, Any]:
        """Generate realistic learning data based on category"""
        if category == "work_style":
            return {
                "preference": random.choice(["structured", "flexible", "hybrid"]),
                "peak_performance": random.choice(["morning", "afternoon", "evening"]),
                "multitasking_ability": round(random.uniform(0.3, 0.8), 2),
                "planning_horizon": random.choice(["daily", "weekly", "monthly"])
            }
        elif category == "communication":
            return {
                "preferred_channels": random.sample(["email", "chat", "video", "in_person"], 2),
                "response_time": random.randint(15, 240),  # minutes
                "formality_level": round(random.uniform(0.3, 0.8), 2),
                "meeting_participation": round(random.uniform(0.4, 0.9), 2)
            }
        elif category == "learning":
            return {
                "learning_style": random.choice(["visual", "auditory", "kinesthetic", "reading"]),
                "retention_rate": round(random.uniform(0.6, 0.9), 2),
                "preferred_pace": random.choice(["fast", "moderate", "slow"]),
                "knowledge_sharing": round(random.uniform(0.4, 0.8), 2)
            }
        else:
            return {
                "primary_trait": random.choice(["analytical", "creative", "systematic", "intuitive"]),
                "adaptability": round(random.uniform(0.5, 0.9), 2),
                "consistency": round(random.uniform(0.6, 0.9), 2),
                "growth_rate": round(random.uniform(0.1, 0.3), 2)
            }

    async def seed_prediction_models(self):
        """Seed prediction models for digital twins"""
        print("🔮 Seeding prediction models...")
        
        model_types = [
            "productivity_forecast", "task_completion", "energy_prediction",
            "performance_trend", "goal_achievement", "skill_development"
        ]
        
        model_count = 0
        for twin_id in self.twin_ids:
            # Each twin has 3-6 prediction models
            for model_type in random.sample(model_types, random.randint(3, 6)):
                model = PredictionModel(
                    id=str(uuid.uuid4()),
                    twin_id=twin_id,
                    model_type=model_type,
                    model_parameters=self.generate_model_data(model_type),
                    accuracy_metrics={"accuracy": round(random.uniform(0.7, 0.95), 3)},
                    trained_at=datetime.utcnow() - timedelta(days=random.randint(1, 14)),
                    version=random.randint(1, 5),
                    is_active=random.random() > 0.3
                )
                
                self.db.add(model)
                model_count += 1
        
        print(f"   ✓ Created {model_count} prediction models")

    def generate_model_data(self, model_type: str) -> Dict[str, Any]:
        """Generate realistic model data based on type"""
        return {
            "algorithm": random.choice(["linear_regression", "random_forest", "neural_network", "gradient_boosting"]),
            "features": random.randint(5, 20),
            "training_accuracy": round(random.uniform(0.75, 0.95), 3),
            "validation_accuracy": round(random.uniform(0.70, 0.90), 3),
            "prediction_horizon": random.choice(["1_day", "3_days", "1_week", "1_month"]),
            "confidence_threshold": round(random.uniform(0.6, 0.8), 2),
            "last_prediction": (datetime.utcnow() - timedelta(hours=random.randint(1, 24))).isoformat()
        }

    async def seed_twin_interactions(self):
        """Seed twin interactions and conversations"""
        print("💬 Seeding twin interactions...")
        
        interaction_types = [
            "chat_query", "prediction_request", "insight_request", "goal_setting",
            "feedback_submission", "pattern_inquiry", "performance_review", "recommendation_request"
        ]
        
        interaction_count = 0
        for twin_id in self.twin_ids:
            # Each twin has 10-30 interactions
            num_interactions = random.randint(10, 30)
            
            for i in range(num_interactions):
                interaction_type = random.choice(interaction_types)
                
                interaction = TwinInteraction(
                    id=str(uuid.uuid4()),
                    twin_id=twin_id,
                    interaction_type=interaction_type,
                    input_data=self.generate_interaction_input(interaction_type),
                    response_data=self.generate_interaction_response(interaction_type),
                    processing_time_ms=random.randint(50, 500),
                    user_feedback=random.randint(1, 5) if random.random() > 0.3 else None,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
                )
                
                self.db.add(interaction)
                interaction_count += 1
        
        print(f"   ✓ Created {interaction_count} twin interactions")

    def generate_interaction_input(self, interaction_type: str) -> Dict[str, Any]:
        """Generate realistic interaction input data"""
        if interaction_type == "chat_query":
            queries = [
                "How can I improve my productivity?",
                "What are my peak performance hours?",
                "Show me my task completion patterns",
                "How should I plan my week?",
                "What skills should I focus on developing?"
            ]
            return {"query": random.choice(queries), "context": "general_inquiry"}
        elif interaction_type == "prediction_request":
            return {
                "prediction_type": random.choice(["productivity", "task_completion", "energy_level"]),
                "time_horizon": random.choice(["1_day", "3_days", "1_week"]),
                "context": "planning"
            }
        else:
            return {
                "type": interaction_type,
                "timestamp": datetime.utcnow().isoformat(),
                "user_context": random.choice(["work", "planning", "review", "learning"])
            }

    def generate_interaction_response(self, interaction_type: str) -> Dict[str, Any]:
        """Generate realistic interaction response data"""
        return {
            "response_type": "success",
            "confidence": round(random.uniform(0.7, 0.95), 2),
            "processing_time": random.randint(50, 500),
            "recommendations": random.randint(1, 5),
            "insights_provided": random.randint(1, 3),
            "follow_up_suggested": random.random() > 0.5
        }

    async def seed_activity_streams(self):
        """Seed activity stream data for real-time tracking"""
        print("📈 Seeding activity streams...")
        
        activity_types = [
            "task_started", "task_completed", "break_taken", "meeting_joined",
            "focus_session", "learning_activity", "collaboration", "goal_progress"
        ]
        
        stream_count = 0
        for twin_id in self.twin_ids:
            # Each twin has 20-50 recent activity stream entries
            num_activities = random.randint(20, 50)
            
            for i in range(num_activities):
                activity_type = random.choice(activity_types)
                
                activity = ActivityStream(
                    id=str(uuid.uuid4()),
                    twin_id=twin_id,
                    activity_type=activity_type,
                    activity_data=self.generate_activity_data(activity_type),
                    timestamp=datetime.utcnow() - timedelta(days=random.randint(0, 7), hours=random.randint(0, 23)),
                    processed=random.random() > 0.2  # 80% processed
                )
                
                self.db.add(activity)
                stream_count += 1
        
        print(f"   ✓ Created {stream_count} activity stream entries")

    def generate_activity_data(self, activity_type: str) -> Dict[str, Any]:
        """Generate realistic activity data"""
        if activity_type == "task_completed":
            return {
                "task_id": str(uuid.uuid4()),
                "duration": random.randint(15, 180),
                "complexity": random.choice(["low", "medium", "high"]),
                "satisfaction": random.randint(3, 5)
            }
        elif activity_type == "focus_session":
            return {
                "duration": random.randint(25, 120),
                "interruptions": random.randint(0, 5),
                "productivity_score": round(random.uniform(6.0, 9.5), 1),
                "environment": random.choice(["office", "home", "cafe", "library"])
            }
        else:
            return {
                "duration": random.randint(5, 60),
                "quality": round(random.uniform(0.5, 1.0), 2),
                "context": random.choice(["work", "personal", "learning", "social"])
            }

    async def seed_twin_knowledge(self):
        """Seed twin knowledge base entries"""
        print("📚 Seeding twin knowledge base...")
        
        knowledge_types = [
            "skill_assessment", "goal_tracking", "preference_learning", "habit_formation",
            "performance_insight", "recommendation_history", "feedback_analysis", "trend_analysis"
        ]
        
        knowledge_count = 0
        for twin_id in self.twin_ids:
            # Each twin has 5-12 knowledge entries
            num_entries = random.randint(5, 12)
            
            for _ in range(num_entries):
                knowledge_type = random.choice(knowledge_types)
                
                knowledge = TwinKnowledge(
                    id=str(uuid.uuid4()),
                    twin_id=twin_id,
                    knowledge_type=knowledge_type,
                    knowledge_data=self.generate_knowledge_data(knowledge_type),
                    confidence_score=round(random.uniform(0.6, 0.9), 3),
                    source=random.choice(["user_interaction", "pattern_analysis", "behavioral_learning", "simulation"]),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 45)),
                    updated_at=datetime.utcnow() - timedelta(days=random.randint(0, 15))
                )
                
                self.db.add(knowledge)
                knowledge_count += 1
        
        print(f"   ✓ Created {knowledge_count} knowledge base entries")

    def generate_knowledge_data(self, knowledge_type: str) -> Dict[str, Any]:
        """Generate realistic knowledge data"""
        if knowledge_type == "skill_assessment":
            return {
                "skills": {
                    "technical": round(random.uniform(0.6, 0.9), 2),
                    "communication": round(random.uniform(0.5, 0.8), 2),
                    "leadership": round(random.uniform(0.4, 0.7), 2),
                    "problem_solving": round(random.uniform(0.6, 0.9), 2)
                },
                "growth_areas": random.sample(["time_management", "delegation", "strategic_thinking", "creativity"], 2),
                "strengths": random.sample(["analytical", "detail_oriented", "collaborative", "innovative"], 2)
            }
        elif knowledge_type == "goal_tracking":
            return {
                "active_goals": random.randint(3, 8),
                "completion_rate": round(random.uniform(0.6, 0.9), 2),
                "average_timeline": random.randint(30, 90),
                "success_factors": ["clear_milestones", "regular_review", "accountability"]
            }
        else:
            return {
                "insights": random.randint(3, 10),
                "accuracy": round(random.uniform(0.7, 0.95), 2),
                "actionability": round(random.uniform(0.6, 0.9), 2),
                "impact_score": round(random.uniform(0.4, 0.8), 2)
            }

    async def seed_simulation_results(self):
        """Seed simulation results for scenario testing"""
        print("🔬 Seeding simulation results...")
        
        simulation_types = [
            "schedule_optimization", "workload_analysis", "goal_scenario", "skill_development",
            "team_collaboration", "productivity_experiment", "habit_change", "performance_boost"
        ]
        
        simulation_count = 0
        for twin_id in self.twin_ids:
            # Each twin has 2-6 simulation results
            num_simulations = random.randint(2, 6)
            
            for _ in range(num_simulations):
                simulation_type = random.choice(simulation_types)
                
                simulation = SimulationResult(
                    id=str(uuid.uuid4()),
                    twin_id=twin_id,
                    simulation_type=simulation_type,
                    input_parameters=self.generate_simulation_parameters(simulation_type),
                    simulation_results=self.generate_simulation_results_data(simulation_type),
                    confidence_score=round(random.uniform(0.7, 0.9), 3),
                    execution_time_ms=random.randint(100, 5000),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
                )
                
                self.db.add(simulation)
                simulation_count += 1
        
        print(f"   ✓ Created {simulation_count} simulation results")

    def generate_simulation_parameters(self, simulation_type: str) -> Dict[str, Any]:
        """Generate realistic simulation parameters"""
        if simulation_type == "schedule_optimization":
            return {
                "time_horizon": random.choice(["1_week", "2_weeks", "1_month"]),
                "constraints": ["meeting_blocks", "focus_time", "break_intervals"],
                "optimization_target": random.choice(["productivity", "work_life_balance", "energy_management"]),
                "flexibility": round(random.uniform(0.3, 0.8), 2)
            }
        elif simulation_type == "workload_analysis":
            return {
                "task_count": random.randint(10, 30),
                "complexity_distribution": {"low": 0.4, "medium": 0.4, "high": 0.2},
                "deadline_pressure": round(random.uniform(0.3, 0.8), 2),
                "resource_availability": round(random.uniform(0.6, 1.0), 2)
            }
        else:
            return {
                "duration": random.randint(7, 90),  # days
                "variables": random.randint(3, 8),
                "scenarios": random.randint(3, 10),
                "confidence_threshold": round(random.uniform(0.6, 0.8), 2)
            }

    def generate_simulation_results_data(self, simulation_type: str) -> Dict[str, Any]:
        """Generate realistic simulation results"""
        return {
            "predicted_outcome": round(random.uniform(0.6, 0.95), 2),
            "improvement_potential": round(random.uniform(0.1, 0.4), 2),
            "risk_factors": random.sample(["time_pressure", "resource_constraints", "complexity", "dependencies"], 2),
            "recommendations": random.randint(3, 7),
            "implementation_difficulty": round(random.uniform(0.2, 0.8), 2),
            "expected_timeline": random.randint(7, 60)  # days
        }


async def seed_digital_twin_database():
    """Main function to seed digital twin database"""
    async with DigitalTwinDataSeeder() as seeder:
        await seeder.seed_all_data()


if __name__ == "__main__":
    asyncio.run(seed_digital_twin_database())