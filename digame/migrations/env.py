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
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# add your model's MetaData object here
# for 'autogenerate' support

# Import Base from the models package's __init__.py
from app.models import Base
# Import the models package itself to ensure all model modules within it are executed
# and their models are registered with the Base.
import app.models

# target_metadata should now contain all tables, including UserSetting
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
    url = config.get_main_option("sqlalchemy.url")
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
    global target_metadata # Ensure target_metadata is available

    # This path is taken by 'alembic revision --autogenerate'.
    # Configure context for 'offline' comparison (metadata vs. migration history).
    # No actual connection is made; URL is for dialect info.
    # The actual context.run_migrations() that generates the script text
    # is called by Alembic's revision command machinery after this env.py runs.
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        dialect_opts={"paramstyle": "named"},
        compare_type=True, # For autogenerate
        compare_server_default=True, # For autogenerate
        # Do not include literal_binds=True here.
        # Do not include include_object or process_revision_directives here unless needed.
    )
    # For 'revision --autogenerate', we only need to configure the context.
    # No 'context.run_migrations()' or 'context.begin_transaction()' here,
    # as that would be for applying migrations or for --sql mode output.

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
