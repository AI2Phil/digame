# Database Migrations for Digame Platform

This directory contains the database migration scripts for the Digame platform using Alembic.

## Overview

The migration system provides:
- **Automatic deployment capability** during container startup
- **Data integrity testing** to ensure migrations work correctly
- **Rollback support** for safe database management
- **Multi-environment support** (development, testing, production)

## Migration Files

### Core Migrations

1. **`001_initial_schema.py`** - Creates all base tables:
   - `users` - User accounts and authentication
   - `roles` & `permissions` - Role-based access control
   - `activities` - User activity tracking
   - `tasks` - Task management
   - `process_notes` - User notes and documentation
   - `jobs` - Background job processing
   - `detected_anomalies` - Anomaly detection results

2. **`20250523_behavioral_models.py`** - Behavioral modeling tables:
   - `behavioral_models` - Trained behavioral models
   - `behavioral_patterns` - Identified behavioral patterns

### Configuration Files

- **`env.py`** - Alembic environment configuration
- **`alembic.ini`** - Alembic settings and database connection
- **`script.py.mako`** - Template for new migration files

## Usage

### Automatic Migrations (Recommended)

Migrations are automatically applied when the Docker container starts:

```bash
# Development mode (includes migrations)
docker-compose up

# Production mode (includes migrations)
docker-compose run backend prod

# Migration-only mode
docker-compose run backend migrate-only
```

### Manual Migration Commands

For manual migration management:

```bash
# Check current migration status
cd digame && alembic current

# Apply all pending migrations
cd digame && alembic upgrade head

# Rollback to previous migration
cd digame && alembic downgrade -1

# Rollback to specific migration
cd digame && alembic downgrade 001_initial_schema

# View migration history
cd digame && alembic history

# Create new migration
cd digame && alembic revision --autogenerate -m "Description of changes"
```

### Testing Migrations

Use the provided testing scripts:

```bash
# Test migrations with SQLite (safe for development)
cd digame && python test_migrations.py

# Test migrations with Docker PostgreSQL
cd digame && python test_migrations.py --docker

# Deploy migrations with verification
cd digame && python deploy_migrations.py

# Check migration status only
cd digame && python deploy_migrations.py --check-only
```

## Migration Development

### Creating New Migrations

1. **Modify your models** in `digame/app/models/`
2. **Generate migration**:
   ```bash
   cd digame && alembic revision --autogenerate -m "Add new feature"
   ```
3. **Review the generated migration** in `migrations/versions/`
4. **Test the migration**:
   ```bash
   python test_migrations.py
   ```
5. **Apply the migration**:
   ```bash
   alembic upgrade head
   ```

### Best Practices

1. **Always test migrations** before deploying to production
2. **Use descriptive migration messages** that explain the changes
3. **Review auto-generated migrations** to ensure they're correct
4. **Create backup points** before applying migrations in production
5. **Test rollback procedures** to ensure they work correctly

### Migration Naming Convention

- Use descriptive names: `add_user_preferences_table`
- Include date for major changes: `20250523_behavioral_models`
- Use snake_case for consistency

## Database Schema

### Core Tables

```sql
-- User management
users (id, username, email, hashed_password, ...)
roles (id, name, description, ...)
permissions (id, name, description, ...)
user_roles (user_id, role_id)
role_permissions (role_id, permission_id)

-- Activity tracking
activities (id, user_id, activity_type, timestamp, ...)
detected_anomalies (id, user_id, anomaly_type, severity, ...)

-- Task management
tasks (id, user_id, title, status, priority, ...)
process_notes (id, user_id, title, content, ...)

-- Background processing
jobs (id, job_type, status, parameters, result, ...)

-- Behavioral modeling
behavioral_models (id, user_id, algorithm, parameters, ...)
behavioral_patterns (id, model_id, pattern_label, ...)
```

### Foreign Key Relationships

- `activities.user_id` → `users.id`
- `behavioral_models.user_id` → `users.id`
- `behavioral_patterns.model_id` → `behavioral_models.id`
- `detected_anomalies.user_id` → `users.id`
- `detected_anomalies.activity_id` → `activities.id`
- `tasks.user_id` → `users.id`
- `process_notes.user_id` → `users.id`

## Troubleshooting

### Common Issues

1. **Migration fails with foreign key constraint error**:
   - Check that referenced tables exist
   - Ensure migration order is correct
   - Verify foreign key relationships

2. **Database connection timeout**:
   - Ensure database is running
   - Check connection string in `alembic.ini`
   - Verify network connectivity

3. **Migration already applied error**:
   - Check current migration status: `alembic current`
   - Use `alembic stamp head` to mark as applied without running

4. **Rollback fails**:
   - Check for data that would violate constraints
   - Consider data migration before schema rollback

### Recovery Procedures

1. **If migration fails mid-way**:
   ```bash
   # Check current state
   alembic current
   
   # Mark as failed migration
   alembic stamp <previous_revision>
   
   # Fix the migration and retry
   alembic upgrade head
   ```

2. **If database is corrupted**:
   - Restore from backup
   - Re-apply migrations from known good state
   - Use `test_migrations.py` to verify integrity

## Environment Variables

The migration system uses these environment variables:

- `DATABASE_URL` - Database connection string
- `ALEMBIC_CONFIG` - Path to alembic.ini (optional)

## Production Deployment

For production deployments:

1. **Create database backup** before migration
2. **Test migrations** in staging environment
3. **Use deployment script**:
   ```bash
   python deploy_migrations.py
   ```
4. **Verify migration integrity** after deployment
5. **Monitor application** for any issues

## Support

For migration-related issues:
1. Check the logs in the container output
2. Run `test_migrations.py` to diagnose issues
3. Review the migration files for any obvious problems
4. Check database connectivity and permissions