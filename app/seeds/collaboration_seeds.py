"""
Real-Time Collaboration Database Seeding Script
Creates comprehensive seed data for collaboration models with realistic communication patterns
"""

import random
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.db import get_db
from app.models.collaboration_models import (
    Workspace, WorkspaceMember, Channel, Message, MessageReaction,
    UserPresence, CollaborationSession, MessageAttachment,
    ChannelType, MessageType, SessionType, UserStatus
)
from app.models.user import User
from app.models.tenant import Tenant

def seed_collaboration_data():
    """Seed comprehensive collaboration data"""
    db = next(get_db())
    
    try:
        print("🌱 Starting collaboration data seeding...")
        
        # Get existing users and tenants
        users = db.query(User).limit(20).all()
        tenants = db.query(Tenant).limit(5).all()
        
        if not users:
            print("⚠️  No users found. Please seed user data first.")
            return
        
        if not tenants:
            print("⚠️  No tenants found. Creating default tenant...")
            default_tenant = Tenant(
                name="Default Organization",
                domain="default.digame.com",
                subscription_tier="enterprise",
                subscription_status="active"
            )
            db.add(default_tenant)
            db.commit()
            tenants = [default_tenant]
        
        # Create workspaces
        workspaces = create_workspaces(db, tenants, users)
        print(f"   ✓ Created {len(workspaces)} workspaces")
        
        # Create workspace members
        workspace_members = create_workspace_members(db, workspaces, users)
        print(f"   ✓ Created {len(workspace_members)} workspace memberships")
        
        # Create channels
        channels = create_channels(db, workspaces, users)
        print(f"   ✓ Created {len(channels)} channels")
        
        # Create messages
        messages = create_messages(db, channels, users)
        print(f"   ✓ Created {len(messages)} messages")
        
        # Create message reactions
        reactions = create_message_reactions(db, messages, users)
        print(f"   ✓ Created {len(reactions)} message reactions")
        
        # Create user presence data
        presence_records = create_user_presence(db, workspaces, users)
        print(f"   ✓ Created {len(presence_records)} user presence records")
        
        # Create collaboration sessions
        sessions = create_collaboration_sessions(db, workspaces, channels, users)
        print(f"   ✓ Created {len(sessions)} collaboration sessions")
        
        # Create message attachments
        attachments = create_message_attachments(db, messages, users)
        print(f"   ✓ Created {len(attachments)} message attachments")
        
        db.commit()
        print("✅ Collaboration data seeded successfully!")
        
        # Print summary
        print(f"\n📊 Collaboration Data Summary:")
        print(f"   - {len(workspaces)} workspaces across {len(tenants)} tenants")
        print(f"   - {len(workspace_members)} workspace memberships")
        print(f"   - {len(channels)} channels (public, private, direct)")
        print(f"   - {len(messages)} messages with realistic conversation patterns")
        print(f"   - {len(reactions)} message reactions and interactions")
        print(f"   - {len(presence_records)} user presence records")
        print(f"   - {len(sessions)} collaboration sessions (voice, video, screen share)")
        print(f"   - {len(attachments)} file attachments")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding collaboration data: {e}")
        raise
    finally:
        db.close()

def create_workspaces(db: Session, tenants: List[Tenant], users: List[User]) -> List[Workspace]:
    """Create realistic workspaces"""
    workspace_templates = [
        {
            "name": "Engineering Team",
            "description": "Main workspace for engineering collaboration and development discussions"
        },
        {
            "name": "Product & Design",
            "description": "Product management and design team coordination workspace"
        },
        {
            "name": "Marketing Hub",
            "description": "Marketing team collaboration and campaign planning workspace"
        },
        {
            "name": "Sales Operations",
            "description": "Sales team coordination and customer relationship management"
        },
        {
            "name": "Executive Leadership",
            "description": "Leadership team strategic planning and decision making"
        },
        {
            "name": "Customer Success",
            "description": "Customer support and success team collaboration"
        },
        {
            "name": "Operations Center",
            "description": "Operations and administrative team coordination"
        },
        {
            "name": "Research & Analytics",
            "description": "Data science and research team workspace"
        },
        {
            "name": "Quality Assurance",
            "description": "QA team testing coordination and bug tracking"
        },
        {
            "name": "DevOps & Infrastructure",
            "description": "Infrastructure and deployment coordination workspace"
        }
    ]
    
    workspaces = []
    for i, template in enumerate(workspace_templates):
        tenant = tenants[i % len(tenants)]
        creator = random.choice(users)
        
        workspace = Workspace(
            name=template["name"],
            description=template["description"],
            tenant_id=tenant.id,
            created_by=creator.id,
            created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(30, 180)),
            settings={
                "allow_guests": random.choice([True, False]),
                "require_approval": random.choice([True, False]),
                "message_retention": random.choice([30, 60, 90, 365]),
                "file_sharing": True,
                "max_file_size": random.choice([50, 100, 200]),
                "allowed_file_types": ["image", "document", "video", "audio"]
            }
        )
        
        db.add(workspace)
        workspaces.append(workspace)
    
    db.commit()
    return workspaces

def create_workspace_members(db: Session, workspaces: List[Workspace], users: List[User]) -> List[WorkspaceMember]:
    """Create workspace memberships with realistic role distributions"""
    members = []
    roles = ["admin", "moderator", "member", "guest"]
    role_weights = [0.1, 0.15, 0.7, 0.05]  # Distribution of roles
    
    for workspace in workspaces:
        # Add workspace creator as admin
        creator_member = WorkspaceMember(
            workspace_id=workspace.id,
            user_id=workspace.created_by,
            role="admin",
            joined_at=workspace.created_at,
            permissions={
                "can_create_channels": True,
                "can_invite_members": True,
                "can_manage_workspace": True,
                "can_delete_messages": True,
                "can_moderate": True
            }
        )
        db.add(creator_member)
        members.append(creator_member)
        
        # Add 5-15 additional members per workspace
        member_count = random.randint(5, 15)
        available_users = [u for u in users if u.id != workspace.created_by]
        selected_users = random.sample(available_users, min(member_count, len(available_users)))
        
        for user in selected_users:
            role = random.choices(roles, weights=role_weights)[0]
            
            # Set permissions based on role
            if role == "admin":
                permissions = {
                    "can_create_channels": True,
                    "can_invite_members": True,
                    "can_manage_workspace": True,
                    "can_delete_messages": True,
                    "can_moderate": True
                }
            elif role == "moderator":
                permissions = {
                    "can_create_channels": True,
                    "can_invite_members": True,
                    "can_manage_workspace": False,
                    "can_delete_messages": True,
                    "can_moderate": True
                }
            elif role == "member":
                permissions = {
                    "can_create_channels": True,
                    "can_invite_members": False,
                    "can_manage_workspace": False,
                    "can_delete_messages": False,
                    "can_moderate": False
                }
            else:  # guest
                permissions = {
                    "can_create_channels": False,
                    "can_invite_members": False,
                    "can_manage_workspace": False,
                    "can_delete_messages": False,
                    "can_moderate": False
                }
            
            member = WorkspaceMember(
                workspace_id=workspace.id,
                user_id=user.id,
                role=role,
                joined_at=workspace.created_at + timedelta(days=random.randint(0, 30)),
                permissions=permissions,
                last_seen=datetime.now(timezone.utc) - timedelta(hours=random.randint(0, 72))
            )
            
            db.add(member)
            members.append(member)
    
    db.commit()
    return members

def create_channels(db: Session, workspaces: List[Workspace], users: List[User]) -> List[Channel]:
    """Create channels with realistic naming and types"""
    channels = []
    
    # Standard channel templates for each workspace
    channel_templates = [
        {"name": "general", "description": "General team discussions and announcements", "type": ChannelType.PUBLIC},
        {"name": "random", "description": "Random conversations and team bonding", "type": ChannelType.PUBLIC},
        {"name": "announcements", "description": "Important team announcements", "type": ChannelType.PUBLIC},
        {"name": "development", "description": "Development discussions and code reviews", "type": ChannelType.PUBLIC},
        {"name": "design", "description": "Design discussions and creative collaboration", "type": ChannelType.PUBLIC},
        {"name": "support", "description": "Internal support and help requests", "type": ChannelType.PUBLIC},
        {"name": "leadership", "description": "Leadership team private discussions", "type": ChannelType.PRIVATE},
        {"name": "confidential", "description": "Confidential team matters", "type": ChannelType.PRIVATE},
    ]
    
    for workspace in workspaces:
        # Get workspace members
        workspace_members = db.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == workspace.id
        ).all()
        
        # Create 4-6 channels per workspace
        num_channels = random.randint(4, 6)
        selected_templates = random.sample(channel_templates, min(num_channels, len(channel_templates)))
        
        for template in selected_templates:
            creator = random.choice(workspace_members)
            
            # For private channels, select subset of members
            if template["type"] == ChannelType.PRIVATE:
                # Private channels have 2-5 members
                private_member_count = random.randint(2, min(5, len(workspace_members)))
                private_members = random.sample(workspace_members, private_member_count)
                member_ids = [m.user_id for m in private_members]
            else:
                member_ids = []
            
            channel = Channel(
                workspace_id=workspace.id,
                name=template["name"],
                description=template["description"],
                type=template["type"],
                created_by=creator.user_id,
                created_at=workspace.created_at + timedelta(days=random.randint(0, 7)),
                members=member_ids,
                member_count=len(member_ids) if member_ids else len(workspace_members),
                topic=f"Welcome to #{template['name']}! " + random.choice([
                    "Let's collaborate effectively.",
                    "Share ideas and stay connected.",
                    "Building great things together.",
                    "Communication is key to success."
                ])
            )
            
            db.add(channel)
            channels.append(channel)
    
    db.commit()
    return channels

def create_messages(db: Session, channels: List[Channel], users: List[User]) -> List[Message]:
    """Create realistic message conversations"""
    messages = []
    
    # Message templates for different contexts
    message_templates = {
        "general": [
            "Good morning team! Hope everyone has a great day ahead 🌅",
            "Just finished the quarterly review. Great progress everyone!",
            "Don't forget about the team lunch tomorrow at 12:30 PM",
            "New office policies have been updated. Please check your email.",
            "Congratulations to the team for hitting our monthly targets! 🎉",
            "Weather looks great today. Perfect for our outdoor team building activity.",
            "Reminder: All-hands meeting at 3 PM in the main conference room",
            "Coffee machine is fixed! ☕ Thanks to facilities team.",
        ],
        "development": [
            "Just pushed the latest changes to the feature branch 🚀",
            "Code review completed. Looks good to merge!",
            "Found a bug in the authentication module. Working on a fix.",
            "New deployment went live successfully. All systems green ✅",
            "Updated the API documentation with the latest endpoints",
            "Performance improvements are showing 30% faster load times",
            "Database migration completed without issues",
            "Unit tests are all passing. Ready for QA review.",
        ],
        "design": [
            "Updated the mockups based on yesterday's feedback",
            "New design system components are ready for review",
            "User research findings are very insightful. Great work team!",
            "Prototype is ready for user testing next week",
            "Color palette has been finalized. Love the new brand colors! 🎨",
            "Accessibility audit completed. Few minor fixes needed.",
            "Mobile designs are responsive and look fantastic",
            "Design handoff to development team is complete",
        ],
        "random": [
            "Anyone tried the new restaurant downtown? 🍕",
            "Great article about remote work productivity. Sharing the link...",
            "My cat decided to join the video call today 😸",
            "Weekend hiking trip was amazing! Beautiful weather.",
            "Finished reading that book recommendation. Highly recommend!",
            "New coffee blend in the kitchen is excellent ☕",
            "Anyone up for a quick game of ping pong?",
            "Happy Friday everyone! Any fun weekend plans?",
        ]
    }
    
    # System message templates
    system_messages = [
        "Deployment completed successfully ✅",
        "Backup process finished without errors",
        "System maintenance scheduled for tonight at 11 PM",
        "New team member joined the workspace. Welcome aboard! 👋",
        "Security scan completed. No issues found.",
        "Database optimization improved query performance by 25%",
    ]
    
    for channel in channels:
        # Get channel members (for private channels) or workspace members (for public channels)
        if channel.type == ChannelType.PRIVATE and channel.members:
            available_users = [u for u in users if u.id in channel.members]
        else:
            # Get all workspace members
            workspace_members = db.query(WorkspaceMember).filter(
                WorkspaceMember.workspace_id == channel.workspace_id
            ).all()
            available_users = [u for u in users if u.id in [m.user_id for m in workspace_members]]
        
        if not available_users:
            continue
        
        # Create 10-50 messages per channel
        message_count = random.randint(10, 50)
        
        # Get appropriate message templates based on channel name
        channel_name = str(channel.name)
        if channel_name in message_templates:
            templates = message_templates[channel_name]
        else:
            templates = message_templates["general"]
        
        for i in range(message_count):
            # 95% regular messages, 5% system messages
            if random.random() < 0.05:
                content = random.choice(system_messages)
                message_type = MessageType.SYSTEM
                user = None  # System messages don't have a user
            else:
                content = random.choice(templates)
                message_type = MessageType.TEXT
                user = random.choice(available_users)
            
            # Create message timestamp (spread over last 30 days)
            base_time = channel.created_at + timedelta(days=1)
            message_time = base_time + timedelta(
                days=random.randint(0, 30),
                hours=random.randint(8, 18),  # Business hours
                minutes=random.randint(0, 59)
            )
            
            # Occasionally create threaded messages
            thread_id = None
            if random.random() < 0.1 and messages:  # 10% chance of thread
                potential_parents = [m for m in messages if m.channel_id == channel.id and not m.thread_id]
                if potential_parents:
                    parent = random.choice(potential_parents)
                    thread_id = parent.id
            
            # Add mentions occasionally
            mentions = []
            if random.random() < 0.2:  # 20% chance of mentions
                mention_count = random.randint(1, min(3, len(available_users)))
                mentioned_users = random.sample(available_users, mention_count)
                mentions = [u.id for u in mentioned_users]
                # Add mention syntax to content
                for mentioned_user in mentioned_users:
                    content += f" @{mentioned_user.username}"
            
            message = Message(
                channel_id=channel.id,
                user_id=user.id if user else None,
                content=content,
                type=message_type,
                timestamp=message_time,
                thread_id=thread_id,
                mentions=mentions,
                is_pinned=random.random() < 0.02  # 2% chance of being pinned
            )
            
            db.add(message)
            messages.append(message)
            
            # Note: Channel updates will be done after all messages are created
            pass
    
    # Update channel statistics after all messages are created
    for channel in channels:
        channel_messages = [m for m in messages if m.channel_id == channel.id]
        if channel_messages:
            # Find the latest message
            latest_message = max(channel_messages, key=lambda m: m.timestamp)
            # Update using setattr to avoid SQLAlchemy column assignment issues
            setattr(channel, 'last_message_at', latest_message.timestamp)
            setattr(channel, 'last_message_id', latest_message.id)
        
        # Update message count
        setattr(channel, 'message_count', len(channel_messages))
    
    db.commit()
    return messages

def create_message_reactions(db: Session, messages: List[Message], users: List[User]) -> List[MessageReaction]:
    """Create realistic message reactions"""
    reactions = []
    
    # Common emoji reactions
    emoji_list = ["👍", "❤️", "😂", "😮", "😢", "😡", "🚀", "✅", "🎉", "☕", "🔥", "💯"]
    
    for message in messages:
        # 30% chance a message gets reactions
        if random.random() < 0.3:
            # 1-5 reactions per message
            reaction_count = random.randint(1, 5)
            
            for _ in range(reaction_count):
                emoji = random.choice(emoji_list)
                user = random.choice(users)
                
                # Check if this user already reacted with this emoji
                existing = any(
                    r.message_id == message.id and r.user_id == user.id and r.emoji == emoji
                    for r in reactions
                )
                
                if not existing:
                    reaction = MessageReaction(
                        message_id=message.id,
                        user_id=user.id,
                        emoji=emoji,
                        created_at=message.timestamp + timedelta(minutes=random.randint(1, 60))
                    )
                    
                    db.add(reaction)
                    reactions.append(reaction)
    
    db.commit()
    return reactions

def create_user_presence(db: Session, workspaces: List[Workspace], users: List[User]) -> List[UserPresence]:
    """Create user presence data"""
    presence_records = []
    
    status_distribution = {
        UserStatus.ONLINE: 0.3,
        UserStatus.AWAY: 0.2,
        UserStatus.BUSY: 0.15,
        UserStatus.OFFLINE: 0.35
    }
    
    custom_statuses = [
        "In a meeting",
        "Working from home",
        "On vacation",
        "Lunch break",
        "Focused work",
        "Available for questions",
        "Do not disturb",
        "Coffee break ☕"
    ]
    
    for user in users:
        # Create presence for random workspaces
        user_workspaces = random.sample(workspaces, random.randint(1, min(3, len(workspaces))))
        
        for workspace in user_workspaces:
            status = random.choices(
                list(status_distribution.keys()),
                weights=list(status_distribution.values())
            )[0]
            
            # Set last activity based on status
            if status == UserStatus.ONLINE:
                last_activity = datetime.now(timezone.utc) - timedelta(minutes=random.randint(0, 5))
            elif status == UserStatus.AWAY:
                last_activity = datetime.now(timezone.utc) - timedelta(minutes=random.randint(15, 60))
            elif status == UserStatus.BUSY:
                last_activity = datetime.now(timezone.utc) - timedelta(minutes=random.randint(5, 30))
            else:  # OFFLINE
                last_activity = datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 48))
            
            presence = UserPresence(
                user_id=user.id,
                workspace_id=workspace.id,
                status=status,
                custom_status=random.choice(custom_statuses) if random.random() < 0.4 else None,
                last_seen=last_activity,
                last_activity=last_activity,
                is_typing=False
            )
            
            db.add(presence)
            presence_records.append(presence)
    
    db.commit()
    return presence_records

def create_collaboration_sessions(db: Session, workspaces: List[Workspace], channels: List[Channel], users: List[User]) -> List[CollaborationSession]:
    """Create collaboration sessions"""
    sessions = []
    
    session_types = [SessionType.VOICE, SessionType.VIDEO, SessionType.SCREEN_SHARE]
    session_titles = [
        "Daily Standup",
        "Sprint Planning",
        "Code Review Session",
        "Design Critique",
        "Team Retrospective",
        "Product Demo",
        "Architecture Discussion",
        "Brainstorming Session",
        "Training Workshop",
        "Client Presentation"
    ]
    
    for workspace in workspaces:
        workspace_channels = [c for c in channels if c.workspace_id == workspace.id]
        workspace_members = db.query(WorkspaceMember).filter(
            WorkspaceMember.workspace_id == workspace.id
        ).all()
        
        if not workspace_channels or not workspace_members:
            continue
        
        # Create 2-5 sessions per workspace
        session_count = random.randint(2, 5)
        
        for _ in range(session_count):
            session_type = random.choice(session_types)
            channel = random.choice(workspace_channels)
            creator = random.choice(workspace_members)
            
            # Determine session status and timing
            if random.random() < 0.3:  # 30% active sessions
                status = "active"
                started_at = datetime.now(timezone.utc) - timedelta(minutes=random.randint(5, 120))
                ended_at = None
            elif random.random() < 0.6:  # 30% ended sessions
                status = "ended"
                started_at = datetime.now(timezone.utc) - timedelta(hours=random.randint(1, 48))
                ended_at = started_at + timedelta(minutes=random.randint(15, 180))
            else:  # 40% scheduled sessions
                status = "scheduled"
                started_at = None
                ended_at = None
            
            # Select participants (2-8 people)
            participant_count = random.randint(2, min(8, len(workspace_members)))
            participants = random.sample(workspace_members, participant_count)
            participant_ids = [p.user_id for p in participants]
            
            session = CollaborationSession(
                workspace_id=workspace.id,
                channel_id=channel.id,
                type=session_type,
                title=random.choice(session_titles),
                created_by=creator.user_id,
                participants=participant_ids,
                participant_count=len(participant_ids),
                status=status,
                started_at=started_at,
                ended_at=ended_at,
                is_recording=random.choice([True, False]) if status == "active" else False,
                max_participants=random.choice([10, 25, 50, 100])
            )
            
            db.add(session)
            sessions.append(session)
    
    db.commit()
    return sessions

def create_message_attachments(db: Session, messages: List[Message], users: List[User]) -> List[MessageAttachment]:
    """Create message attachments"""
    attachments = []
    
    file_types = [
        {"ext": "pdf", "mime": "application/pdf", "size_range": (100000, 5000000)},
        {"ext": "docx", "mime": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "size_range": (50000, 2000000)},
        {"ext": "xlsx", "mime": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "size_range": (30000, 1000000)},
        {"ext": "png", "mime": "image/png", "size_range": (100000, 3000000)},
        {"ext": "jpg", "mime": "image/jpeg", "size_range": (200000, 4000000)},
        {"ext": "mp4", "mime": "video/mp4", "size_range": (5000000, 50000000)},
        {"ext": "zip", "mime": "application/zip", "size_range": (1000000, 20000000)},
    ]
    
    file_names = [
        "project_proposal", "meeting_notes", "design_mockup", "code_review",
        "presentation_slides", "user_research", "technical_spec", "budget_analysis",
        "wireframes", "prototype_demo", "test_results", "deployment_guide"
    ]
    
    # 10% of messages have attachments
    messages_with_attachments = random.sample(messages, int(len(messages) * 0.1))
    
    for message in messages_with_attachments:
        # 1-3 attachments per message
        attachment_count = random.randint(1, 3)
        
        for _ in range(attachment_count):
            file_type = random.choice(file_types)
            file_name = random.choice(file_names)
            
            attachment = MessageAttachment(
                message_id=message.id,
                filename=f"{file_name}_{random.randint(1, 999)}.{file_type['ext']}",
                original_filename=f"{file_name}.{file_type['ext']}",
                file_size=random.randint(*file_type["size_range"]),
                mime_type=file_type["mime"],
                file_url=f"/files/attachments/{message.id}/{file_name}.{file_type['ext']}",
                uploaded_by=message.user_id,
                uploaded_at=message.timestamp + timedelta(seconds=random.randint(1, 30)),
                is_processed=True,
                is_virus_scanned=True,
                scan_result="clean"
            )
            
            db.add(attachment)
            attachments.append(attachment)
    
    db.commit()
    return attachments

if __name__ == "__main__":
    seed_collaboration_data()