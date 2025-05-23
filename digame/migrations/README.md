# Database Migrations

This directory contains database migration scripts for the Digame application. The migrations are managed using Alembic.

## Migration Files

- `env.py`: Alembic environment configuration
- `script.py.mako`: Template for migration scripts
- `versions/`: Directory containing individual migration scripts
  - `20250523_behavioral_models.py`: Adds tables for behavioral models and patterns

## Running Migrations

To run the migrations, use the following commands from the `digame` directory:

### Upgrade to the Latest Version

```bash
alembic upgrade head
```

### Downgrade to a Previous Version

```bash
alembic downgrade -1  # Downgrade one revision
```

or

```bash
alembic downgrade <revision_id>  # Downgrade to a specific revision
```

### Generate a New Migration

```bash
alembic revision -m "description of changes"
```

### Auto-generate a Migration Based on Model Changes

```bash
alembic revision --autogenerate -m "description of changes"
```

## Migration in Docker Environment

When running the application in Docker, migrations are typically run as part of the container startup process. The database connection URL is configured in `alembic.ini` to use the Docker service name:

```
sqlalchemy.url = postgresql://digame_user:digame_password@db:5432/digame_db
```

## Manual Migration Execution in Docker

To manually run migrations in the Docker environment:

```bash
docker-compose exec backend alembic upgrade head
```

## Migration History

- **20250523_behavioral_models**: Adds tables for behavioral models and patterns
  - Creates `behavioral_models` table for storing trained behavioral models
  - Creates `behavioral_patterns` table for storing identified behavioral patterns