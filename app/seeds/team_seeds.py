"""
Team Management Database Seeding Script
Creates comprehensive seed data for team models with realistic business patterns
"""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.team import Team, TeamMember, TeamPerformanceMetric, TeamSkillGap, TeamWorkflow, TeamRoleEnum
from app.models.user import User
import json
import random
import math

def seed_team_data():
    """Seed comprehensive team management data"""
    db = SessionLocal()
    
    try:
        # Clear existing team data
        db.query(TeamWorkflow).delete()
        db.query(TeamSkillGap).delete()
        db.query(TeamPerformanceMetric).delete()
        db.query(TeamMember).delete()
        db.query(Team).delete()
        
        # Ensure we have users to work with
        users = db.query(User).all()
        if not users:
            # Create some basic users if none exist
            for i in range(20):
                user = User(
                    username=f"user{i+1}",
                    email=f"user{i+1}@company.com",
                    full_name=f"User {i+1}",
                    is_active=True
                )
                db.add(user)
            db.commit()
            users = db.query(User).all()
        
        # Team templates with realistic business scenarios
        team_templates = [
            {
                "name": "Frontend Development",
                "description": "React and TypeScript frontend development team focused on user experience and interface design",
                "size_range": (4, 8),
                "skills": ["React", "TypeScript", "CSS", "UI/UX Design", "Testing"],
                "workflows": ["Feature Development", "Code Review", "UI Testing", "Design System Maintenance"]
            },
            {
                "name": "Backend Engineering",
                "description": "Python and Node.js backend development team handling APIs, databases, and system architecture",
                "size_range": (5, 10),
                "skills": ["Python", "Node.js", "Database Design", "API Development", "System Architecture"],
                "workflows": ["API Development", "Database Optimization", "Security Implementation", "Performance Monitoring"]
            },
            {
                "name": "DevOps & Infrastructure",
                "description": "Cloud infrastructure and deployment automation team ensuring system reliability and scalability",
                "size_range": (3, 6),
                "skills": ["AWS", "Docker", "Kubernetes", "CI/CD", "Monitoring"],
                "workflows": ["Infrastructure Deployment", "Monitoring Setup", "Security Audits", "Backup Management"]
            },
            {
                "name": "Product Management",
                "description": "Product strategy and roadmap team coordinating between stakeholders and development teams",
                "size_range": (3, 7),
                "skills": ["Product Strategy", "User Research", "Analytics", "Roadmap Planning", "Stakeholder Management"],
                "workflows": ["Feature Planning", "User Research", "Roadmap Review", "Stakeholder Communication"]
            },
            {
                "name": "Data Science & Analytics",
                "description": "Machine learning and data analysis team providing insights and predictive capabilities",
                "size_range": (4, 8),
                "skills": ["Python", "Machine Learning", "Statistics", "Data Visualization", "SQL"],
                "workflows": ["Model Development", "Data Analysis", "Report Generation", "Algorithm Optimization"]
            },
            {
                "name": "Quality Assurance",
                "description": "Testing and quality assurance team ensuring product reliability and user satisfaction",
                "size_range": (3, 6),
                "skills": ["Test Automation", "Manual Testing", "Bug Tracking", "Performance Testing", "Security Testing"],
                "workflows": ["Test Planning", "Automated Testing", "Bug Verification", "Performance Analysis"]
            },
            {
                "name": "UX/UI Design",
                "description": "User experience and interface design team creating intuitive and engaging user interfaces",
                "size_range": (3, 6),
                "skills": ["UI Design", "UX Research", "Prototyping", "Design Systems", "User Testing"],
                "workflows": ["Design Research", "Prototyping", "User Testing", "Design System Updates"]
            },
            {
                "name": "Marketing & Growth",
                "description": "Digital marketing and growth team driving user acquisition and engagement",
                "size_range": (4, 8),
                "skills": ["Digital Marketing", "Content Creation", "SEO", "Analytics", "Growth Hacking"],
                "workflows": ["Campaign Planning", "Content Creation", "Performance Analysis", "A/B Testing"]
            },
            {
                "name": "Sales & Business Development",
                "description": "Sales team focused on customer acquisition and business relationship management",
                "size_range": (5, 10),
                "skills": ["Sales Strategy", "CRM Management", "Negotiation", "Lead Generation", "Customer Relations"],
                "workflows": ["Lead Qualification", "Sales Presentations", "Deal Negotiation", "Customer Onboarding"]
            },
            {
                "name": "Customer Success",
                "description": "Customer support and success team ensuring customer satisfaction and retention",
                "size_range": (4, 8),
                "skills": ["Customer Support", "Technical Writing", "Problem Solving", "Communication", "Product Knowledge"],
                "workflows": ["Ticket Resolution", "Customer Onboarding", "Success Metrics", "Feedback Collection"]
            },
            {
                "name": "Finance & Operations",
                "description": "Financial planning and operational efficiency team managing budgets and processes",
                "size_range": (3, 6),
                "skills": ["Financial Analysis", "Budget Planning", "Process Optimization", "Compliance", "Reporting"],
                "workflows": ["Budget Review", "Financial Reporting", "Process Improvement", "Compliance Audits"]
            },
            {
                "name": "Human Resources",
                "description": "People operations team focused on talent acquisition, development, and employee experience",
                "size_range": (3, 5),
                "skills": ["Talent Acquisition", "Employee Development", "Performance Management", "HR Policies", "Culture Building"],
                "workflows": ["Recruitment Process", "Performance Reviews", "Training Programs", "Policy Updates"]
            },
            {
                "name": "Security & Compliance",
                "description": "Information security and compliance team protecting systems and ensuring regulatory adherence",
                "size_range": (3, 6),
                "skills": ["Cybersecurity", "Compliance", "Risk Assessment", "Security Auditing", "Incident Response"],
                "workflows": ["Security Assessments", "Compliance Reviews", "Incident Response", "Policy Implementation"]
            },
            {
                "name": "Research & Development",
                "description": "Innovation and research team exploring new technologies and experimental features",
                "size_range": (4, 7),
                "skills": ["Research", "Prototyping", "Innovation", "Technology Evaluation", "Experimentation"],
                "workflows": ["Technology Research", "Prototype Development", "Feasibility Studies", "Innovation Reviews"]
            },
            {
                "name": "Mobile Development",
                "description": "iOS and Android mobile application development team",
                "size_range": (4, 8),
                "skills": ["iOS Development", "Android Development", "React Native", "Mobile UI/UX", "App Store Optimization"],
                "workflows": ["Mobile Development", "App Testing", "Store Deployment", "Performance Optimization"]
            }
        ]
        
        # Create teams
        created_teams = []
        user_index = 0
        
        for i, template in enumerate(team_templates[:12]):  # Create 12 teams
            size_range = template["size_range"]
            if isinstance(size_range, tuple) and len(size_range) == 2:
                team_size = random.randint(int(size_range[0]), int(size_range[1]))
            else:
                team_size = 5  # Default team size
            
            # Create team
            team = Team(
                name=template["name"],
                description=template["description"],
                created_by_user_id=users[user_index % len(users)].id,
                created_at=datetime.utcnow() - timedelta(days=random.randint(30, 365)),
                updated_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
            )
            db.add(team)
            db.flush()
            
            # Create team members with realistic role distribution
            team_members = []
            available_users = users[user_index:user_index + min(team_size, len(users) - user_index)]
            
            for j, user in enumerate(available_users):
                if j == 0:
                    role = TeamRoleEnum.ADMIN
                elif j == 1 and team_size > 3:
                    role = TeamRoleEnum.LEADER
                elif j < 3 and team_size > 5:
                    role = TeamRoleEnum.COORDINATOR
                else:
                    role = TeamRoleEnum.MEMBER
                
                member = TeamMember(
                    team_id=team.id,
                    user_id=user.id,
                    role=role,
                    joined_at=team.created_at + timedelta(days=random.randint(0, 30)),
                    custom_attributes={
                        "specialization": random.choice(template["skills"]) if isinstance(template["skills"], list) else "General",
                        "experience_level": random.choice(["junior", "mid", "senior", "lead"]),
                        "availability": random.choice(["full_time", "part_time", "contractor"])
                    }
                )
                db.add(member)
                team_members.append(member)
            
            user_index += team_size
            if user_index >= len(users):
                user_index = 0
            
            created_teams.append((team, template, team_members))
        
        db.flush()
        
        # Create performance metrics for each team (90 days of data)
        metric_types = [
            "Tasks Completed", "Code Quality Score", "Sprint Velocity", "Bug Resolution Rate",
            "Customer Satisfaction", "Team Collaboration Score", "Innovation Index", "Efficiency Rating",
            "Knowledge Sharing", "Goal Achievement", "Response Time", "Productivity Score"
        ]
        
        for team, template, members in created_teams:
            # Generate 90 days of performance data
            for days_ago in range(90):
                date = datetime.utcnow() - timedelta(days=days_ago)
                
                # Create 2-4 metrics per day
                for _ in range(random.randint(2, 4)):
                    metric_name = random.choice(metric_types)
                    
                    # Generate realistic metric values based on team performance trends
                    base_value = random.uniform(70, 95)
                    trend_factor = 1 + (days_ago / 365) * random.uniform(-0.2, 0.3)  # Slight improvement over time
                    seasonal_factor = 1 + 0.1 * math.sin(days_ago * 2 * 3.14159 / 30)  # Monthly cycles
                    
                    final_value = base_value * trend_factor * seasonal_factor
                    metric_value = {
                        "value": round(final_value, 2),
                        "unit": "percentage" if "Score" in metric_name or "Rate" in metric_name else "count",
                        "period": "daily",
                        "benchmark": round(base_value, 2),
                        "trend": "improving" if trend_factor > 1 else "stable"
                    }
                    
                    performance_metric = TeamPerformanceMetric(
                        team_id=team.id,
                        metric_name=metric_name,
                        metric_value=metric_value,
                        recorded_at=date,
                        notes=f"Automated metric collection for {metric_name.lower()}"
                    )
                    db.add(performance_metric)
        
        # Create skill gaps for each team
        skill_gap_templates = [
            "Advanced Python Programming", "Machine Learning Algorithms", "Cloud Architecture",
            "DevOps Automation", "UI/UX Design Principles", "Database Optimization",
            "Security Best Practices", "Agile Methodologies", "Leadership Skills",
            "Data Analysis", "Mobile Development", "API Design", "Testing Strategies",
            "Performance Optimization", "System Design", "Project Management"
        ]
        
        for team, template, members in created_teams:
            # Create 3-6 skill gaps per team
            team_skill_gaps = random.sample(skill_gap_templates, random.randint(3, 6))
            
            for skill in team_skill_gaps:
                priority = random.choice([0, 1, 1, 2])  # Weighted towards medium priority
                
                skill_gap = TeamSkillGap(
                    team_id=team.id,
                    skill_name=skill,
                    description=f"Team needs improvement in {skill.lower()} to enhance overall performance and meet project requirements.",
                    identified_at=datetime.utcnow() - timedelta(days=random.randint(1, 60)),
                    priority=priority,
                    suggested_development_plan=f"Implement training program for {skill.lower()} including workshops, online courses, and mentorship opportunities."
                )
                db.add(skill_gap)
        
        # Create workflows for each team
        for team, template, members in created_teams:
            for workflow_name in template["workflows"]:
                # Generate realistic workflow steps
                if "Development" in workflow_name:
                    steps = [
                        {"name": "Requirements Analysis", "duration": "2-4 hours", "owner": "Product Manager"},
                        {"name": "Technical Design", "duration": "4-8 hours", "owner": "Senior Developer"},
                        {"name": "Implementation", "duration": "1-3 days", "owner": "Development Team"},
                        {"name": "Code Review", "duration": "2-4 hours", "owner": "Tech Lead"},
                        {"name": "Testing", "duration": "4-8 hours", "owner": "QA Team"},
                        {"name": "Deployment", "duration": "1-2 hours", "owner": "DevOps Team"}
                    ]
                elif "Review" in workflow_name:
                    steps = [
                        {"name": "Preparation", "duration": "1-2 hours", "owner": "Team Lead"},
                        {"name": "Data Collection", "duration": "2-4 hours", "owner": "Team Members"},
                        {"name": "Analysis", "duration": "4-6 hours", "owner": "Analysts"},
                        {"name": "Review Meeting", "duration": "2 hours", "owner": "All Team Members"},
                        {"name": "Action Planning", "duration": "1-2 hours", "owner": "Team Lead"}
                    ]
                elif "Testing" in workflow_name:
                    steps = [
                        {"name": "Test Planning", "duration": "2-4 hours", "owner": "QA Lead"},
                        {"name": "Test Case Creation", "duration": "4-8 hours", "owner": "QA Team"},
                        {"name": "Test Execution", "duration": "1-2 days", "owner": "QA Team"},
                        {"name": "Bug Reporting", "duration": "2-4 hours", "owner": "QA Team"},
                        {"name": "Verification", "duration": "2-4 hours", "owner": "QA Team"}
                    ]
                else:
                    steps = [
                        {"name": "Planning", "duration": "1-2 hours", "owner": "Team Lead"},
                        {"name": "Execution", "duration": "4-8 hours", "owner": "Team Members"},
                        {"name": "Review", "duration": "1 hour", "owner": "Team Lead"},
                        {"name": "Documentation", "duration": "1-2 hours", "owner": "Team Members"}
                    ]
                
                # Determine optimization status and suggestions
                is_optimized = random.choice([0, 0, 1])  # 33% optimized
                optimization_suggestions = []
                
                if not is_optimized:
                    optimization_suggestions = [
                        "Automate repetitive tasks to reduce manual effort",
                        "Implement parallel processing where possible",
                        "Add quality gates to catch issues early",
                        "Improve communication between team members",
                        "Use templates and standardized processes",
                        "Implement continuous feedback loops"
                    ][:random.randint(2, 4)]
                
                workflow = TeamWorkflow(
                    team_id=team.id,
                    workflow_name=workflow_name,
                    description=f"Standardized process for {workflow_name.lower()} within the {team.name} team",
                    steps=steps,
                    is_optimized=is_optimized,
                    optimization_suggestions=optimization_suggestions,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(7, 90)),
                    updated_at=datetime.utcnow() - timedelta(days=random.randint(1, 7))
                )
                db.add(workflow)
        
        db.commit()
        
        # Print summary
        total_teams = len(created_teams)
        total_members = sum(len(members) for _, _, members in created_teams)
        total_metrics = db.query(TeamPerformanceMetric).count()
        total_skill_gaps = db.query(TeamSkillGap).count()
        total_workflows = db.query(TeamWorkflow).count()
        
        print("✅ Team management data seeded successfully!")
        print(f"   - {total_teams} teams created")
        print(f"   - {total_members} team members assigned")
        print(f"   - {total_metrics} performance metrics (90 days of data)")
        print(f"   - {total_skill_gaps} skill gaps identified")
        print(f"   - {total_workflows} workflows defined")
        print(f"   - Realistic business patterns and seasonal trends included")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding team data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_team_data()