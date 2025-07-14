"""
Database utilities for handling index creation and test isolation.
"""

from sqlalchemy import text, inspect
from sqlalchemy.exc import OperationalError, IntegrityError
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

def index_exists(engine, table_name: str, index_name: str) -> bool:
    """
    Check if an index exists on a table.
    
    Args:
        engine: SQLAlchemy engine
        table_name: Name of the table
        index_name: Name of the index
        
    Returns:
        bool: True if index exists, False otherwise
    """
    try:
        inspector = inspect(engine)
        indexes = inspector.get_indexes(table_name)
        return any(idx['name'] == index_name for idx in indexes)
    except Exception as e:
        logger.warning(f"Could not check if index {index_name} exists: {e}")
        return False

def create_index_if_not_exists(engine, table_name: str, index_name: str, columns: List[str], unique: bool = False):
    """
    Create an index only if it doesn't already exist.
    
    Args:
        engine: SQLAlchemy engine
        table_name: Name of the table
        index_name: Name of the index
        columns: List of column names
        unique: Whether the index should be unique
    """
    if index_exists(engine, table_name, index_name):
        logger.debug(f"Index {index_name} already exists on table {table_name}")
        return
    
    try:
        unique_clause = "UNIQUE" if unique else ""
        columns_str = ", ".join(columns)
        sql = f"CREATE {unique_clause} INDEX IF NOT EXISTS {index_name} ON {table_name} ({columns_str})"
        
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
        
        logger.info(f"Created index {index_name} on table {table_name}")
    except (OperationalError, IntegrityError) as e:
        if "already exists" in str(e).lower():
            logger.debug(f"Index {index_name} already exists (caught during creation)")
        else:
            logger.error(f"Failed to create index {index_name}: {e}")
            raise

def drop_index_if_exists(engine, index_name: str):
    """
    Drop an index only if it exists.
    
    Args:
        engine: SQLAlchemy engine
        index_name: Name of the index
    """
    try:
        sql = f"DROP INDEX IF EXISTS {index_name}"
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
        logger.debug(f"Dropped index {index_name}")
    except Exception as e:
        logger.warning(f"Could not drop index {index_name}: {e}")

def safe_create_all_tables(metadata, engine, checkfirst: bool = True):
    """
    Safely create all tables with better error handling for index conflicts.
    
    Args:
        metadata: SQLAlchemy metadata object
        engine: SQLAlchemy engine
        checkfirst: Whether to check if tables exist first
    """
    try:
        metadata.create_all(bind=engine, checkfirst=checkfirst)
        logger.info("Successfully created all tables")
    except Exception as e:
        if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
            logger.warning(f"Some tables/indexes already exist: {e}")
            # Try to continue - tables might be partially created
            try:
                # Check if we have any tables at all
                inspector = inspect(engine)
                tables = inspector.get_table_names()
                if tables:
                    logger.info(f"Found existing tables: {tables}")
                else:
                    # No tables exist, so this is a real error
                    raise
            except Exception as check_error:
                logger.error(f"Failed to check existing tables: {check_error}")
                raise e
        else:
            logger.error(f"Failed to create tables: {e}")
            raise

def safe_drop_all_tables(metadata, engine):
    """
    Safely drop all tables with better error handling.
    
    Args:
        metadata: SQLAlchemy metadata object
        engine: SQLAlchemy engine
    """
    try:
        metadata.drop_all(bind=engine)
        logger.debug("Successfully dropped all tables")
    except Exception as e:
        logger.warning(f"Error dropping tables (may be expected): {e}")

def get_table_names(engine) -> List[str]:
    """
    Get list of table names in the database.
    
    Args:
        engine: SQLAlchemy engine
        
    Returns:
        List[str]: List of table names
    """
    try:
        inspector = inspect(engine)
        return inspector.get_table_names()
    except Exception as e:
        logger.error(f"Failed to get table names: {e}")
        return []

def cleanup_test_database(metadata, engine):
    """
    Clean up test database by dropping all tables and indexes.
    
    Args:
        metadata: SQLAlchemy metadata object
        engine: SQLAlchemy engine
    """
    try:
        # First try to drop all tables
        safe_drop_all_tables(metadata, engine)
        
        # Then try to drop any remaining indexes
        try:
            inspector = inspect(engine)
            for table_name in inspector.get_table_names():
                indexes = inspector.get_indexes(table_name)
                for index in indexes:
                    drop_index_if_exists(engine, index['name'])
        except Exception as e:
            logger.debug(f"Error cleaning up indexes: {e}")
            
    except Exception as e:
        logger.warning(f"Error during test database cleanup: {e}")