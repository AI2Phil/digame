from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context
import os
import sys

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Add the app directory to Python path for imports
# In Docker container, we need to add /app to the path
sys.path.insert(0, '/app')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# add your model's MetaData object here
# for 'autogenerate' support

# Import Base and core models safely
try:
    from app.database import Base
    from app.models.user import User
except ImportError as e:
    print(f"Warning: Could not import core models: {e}")
    # Fallback to basic Base import
    try:
        from app.models.user import Base
    except ImportError:
        from app.database import Base

# Import other models with error handling
try:
    from app.models.tenant import Tenant
except ImportError:
    pass

try:
    from app.models.rbac import Role, Permission
except ImportError:
    pass

try:
    from app.models.project import Project
except ImportError:
    pass

try:
    from app.models.experience import Experience
except ImportError:
    pass

try:
    from app.models.education import Education
except ImportError:
    pass

# Import team collaboration models safely
try:
    from app.models.team import Team, TeamMember, TeamPerformanceMetric, TeamSkillGap, TeamWorkflow
except ImportError:
    pass

# Import dashboard and reporting models safely
try:
    from app.models.reporting import Report, ReportExecution, ReportSchedule, ReportSubscription, ReportTemplate, ReportAuditLog, ReportCache
except ImportError:
    pass

# Import Phase 1 models - Social Networking and Learning safely
try:
    from app.models.social import UserConnection, PeerMatch, SocialMetrics
except ImportError:
    pass

try:
    from app.models.learning import CourseCategory, Course, CourseEnrollment, LearningProgress, LearningRecommendation
except ImportError:
    pass

# Import any additional models that exist
try:
    import app.models  # This will register all available models
except ImportError as e:
    print(f"Warning: Could not import app.models package: {e}")

# target_metadata should now contain all tables due to explicit imports
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    # Try environment variable first, then fall back to alembic.ini
    url = os.environ.get("DATABASE_URL") or config.get_main_option("sqlalchemy.url")
    
    if not url:
        raise ValueError("No database URL found. Set DATABASE_URL environment variable or configure sqlalchemy.url in alembic.ini")
    
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True, # As per instructions for offline generation
        dialect_opts={"paramstyle": "named"},
        # compare_type=True, # Optional
        # render_as_batch=True # If using SQLite
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.
    This is the standard online configuration.
    """
    # Get configuration section
    configuration = config.get_section(config.config_ini_section) or {}
    
    # Use environment variable if available, otherwise use alembic.ini configuration
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        configuration["sqlalchemy.url"] = database_url
    elif not configuration.get("sqlalchemy.url"):
        # Ensure we have the fallback URL from alembic.ini
        fallback_url = config.get_main_option("sqlalchemy.url")
        if fallback_url:
            configuration["sqlalchemy.url"] = fallback_url
    
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
