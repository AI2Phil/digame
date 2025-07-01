# Digame Platform Scripts (Backend/Infrastructure)

This directory contains backend-specific utility scripts for database migrations, Git operations, and infrastructure management within the Digame platform. These scripts are focused on deployment, database management, and version control operations.

## 📋 Script Overview

| Script | Purpose | Usage | Status |
|--------|---------|-------|--------|
| [`create_tables.py`](#create_tablespy) | Database table creation | `python create_tables.py` | ✅ Active |
| [`entrypoint.sh`](#entrypointsh) | Docker container entrypoint | Used by Docker | ✅ Active |
| [`deploy_migrations.py`](#deploy_migrationspy) | Database migration deployment | `python deploy_migrations.py` | ✅ Active |
| [`test_migrations.py`](#test_migrationspy) | Migration testing and validation | `python test_migrations.py` | ✅ Active |
| [`run_frontend_tests.sh`](#run_frontend_testssh) | Frontend testing automation | `./run_frontend_tests.sh` | ✅ Active |
| [`test_phase3_team_coordination.py`](#test_phase3_team_coordinationpy) | Team coordination demo | `python test_phase3_team_coordination.py` | ✅ Active |
| [`test_team_endpoints.py`](#test_team_endpointspy) | API endpoint testing | `python test_team_endpoints.py` | ✅ Active |
| [`update_admin_platform_owner.py`](#update_admin_platform_ownerpy) | Admin user management | `python update_admin_platform_owner.py` | ✅ Active |
| [`git-setup.py`](#git-setuppy) | Git repository initialization | `python git-setup.py init` | ✅ Active |
| [`simple_git.py`](#simple_gitpy) | Basic Git operations | `python simple_git.py status` | ✅ Active |
| [`git_remote.py`](#git_remotepy) | Remote repository management | `python git_remote.py push` | ✅ Active |
| [`git_status_summary.py`](#git_status_summarypy) | Repository status and guidance | `python git_status_summary.py` | ✅ Active |

---

## 🗄️ Database Management Scripts

### `create_tables.py`
**Purpose**: Direct database table creation using SQLAlchemy models

**Description**:
- Creates all database tables defined in SQLAlchemy models
- Bypasses Alembic migrations for direct table creation
- Useful for initial database setup and development environments
- Imports all models to ensure complete table creation

**Usage**:
```bash
# Create all database tables
python scripts/create_tables.py
```

**Features**:
- ✅ **Model Discovery**: Automatically imports all models from app.models
- ✅ **Table Creation**: Creates all tables using Base.metadata.create_all()
- ✅ **Table Listing**: Shows all created tables after completion
- ✅ **Database Engine**: Uses configured database engine from app.database
- ✅ **Error Handling**: Provides clear success/failure feedback

**When to Use**:
- Initial database setup in development
- Testing environments requiring fresh database
- Situations where Alembic migrations are not needed
- Quick database schema deployment

---

### `deploy_migrations.py`
**Purpose**: Automated database migration deployment for production and staging environments

**Description**: 
- Ensures database migrations are applied automatically during deployment
- Provides safe migration deployment with database availability checks
- Supports Docker containers, CI/CD pipelines, and manual deployments
- Includes backup point creation and migration integrity verification

**Usage**:
```bash
# Apply all pending migrations (production deployment)
python digame/scripts/deploy_migrations.py

# Check migration status without applying
python digame/scripts/deploy_migrations.py --check-only

# Force apply migrations (bypass warnings)
python digame/scripts/deploy_migrations.py --force
```

**Features**:
- ✅ **Database Availability Check**: Waits for database to be ready (max 30 attempts)
- ✅ **Migration Status Verification**: Checks current vs head revisions
- ✅ **Backup Point Creation**: Creates restore points before applying migrations
- ✅ **Safe Migration Application**: Applies migrations with timeout protection (10 minutes)
- ✅ **Integrity Verification**: Confirms migrations applied correctly
- ✅ **Comprehensive Logging**: Timestamped logs for deployment tracking
- ✅ **Error Handling**: Graceful failure with detailed error reporting

**Deployment Integration**:
```dockerfile
# Docker entrypoint example
RUN python digame/scripts/deploy_migrations.py
```

**CI/CD Integration**:
```yaml
# GitHub Actions example
- name: Deploy Database Migrations
  run: python digame/scripts/deploy_migrations.py --check-only
```

---

### `test_migrations.py`
**Purpose**: Comprehensive testing of database migration processes

**Description**: 
- Tests migration application and rollback functionality
- Verifies database schema creation and integrity
- Supports both SQLite (testing) and PostgreSQL (production) databases
- Validates foreign key constraints and table relationships

**Usage**:
```bash
# Test migrations with temporary SQLite database
python digame/scripts/test_migrations.py

# Test migrations against Docker PostgreSQL
python digame/scripts/test_migrations.py --docker
```

**Features**:
- ✅ **SQLite Testing**: Uses temporary database for safe testing
- ✅ **Schema Verification**: Confirms all expected tables are created
- ✅ **Foreign Key Validation**: Checks relationship constraints
- ✅ **Migration Rollback Testing**: Tests downgrade functionality
- ✅ **Re-migration Testing**: Verifies migrations can be reapplied
- ✅ **Docker Integration**: Tests against production-like PostgreSQL
- ✅ **Data Integrity Checks**: Framework for testing data relationships

**Expected Tables Verified**:
- `users`, `roles`, `permissions`, `user_roles`, `role_permissions`
- `activities`, `detected_anomalies`, `tasks`, `process_notes`, `jobs`
- `behavioral_models`, `behavioral_patterns`, `alembic_version`

---

## 🐳 Docker & Infrastructure Scripts

### `entrypoint.sh`
**Purpose**: Docker container entrypoint script for application startup

**Description**:
- Manages application startup in Docker containers
- Handles database connection waiting and health checks
- Supports multiple startup modes (dev, prod, migrate, sleep)
- Provides database migration execution and server startup

**Usage**:
```bash
# Development mode (with auto-reload)
./scripts/entrypoint.sh dev

# Production mode
./scripts/entrypoint.sh prod

# Run migrations only
./scripts/entrypoint.sh migrate

# Sleep mode (for debugging containers)
./scripts/entrypoint.sh sleep

# Custom command execution
./scripts/entrypoint.sh your-custom-command
```

**Features**:
- ✅ **Database Health Check**: Waits for database availability using netcat
- ✅ **Migration Support**: Runs Alembic migrations before startup
- ✅ **Multiple Modes**: Supports dev, prod, migrate, and sleep modes
- ✅ **Auto-reload**: Development mode includes file watching
- ✅ **Custom Commands**: Fallback to execute any provided command
- ✅ **Error Handling**: Graceful failure with clear error messages

**Docker Integration**:
```dockerfile
# Used as Docker ENTRYPOINT
ENTRYPOINT ["/app/scripts/entrypoint.sh"]
CMD ["prod"]
```

---

## 🧪 Testing & Quality Assurance Scripts

### `run_frontend_tests.sh`
**Purpose**: Automated frontend testing script

**Description**:
- Navigates to frontend directory and runs npm tests
- Handles npm installation and dependency management
- Provides comprehensive error handling and logging
- Designed for CI/CD integration and local development

**Usage**:
```bash
# Run frontend tests
./scripts/run_frontend_tests.sh
```

**Features**:
- ✅ **Directory Navigation**: Automatically changes to frontend directory
- ✅ **Dependency Installation**: Runs npm install before testing
- ✅ **Test Execution**: Runs npm test with proper error handling
- ✅ **Logging**: Provides detailed output for debugging
- ✅ **Exit Codes**: Returns appropriate exit codes for CI/CD

**CI/CD Integration**:
```yaml
# GitHub Actions example
- name: Run Frontend Tests
  run: ./scripts/run_frontend_tests.sh
```

### `test_phase3_team_coordination.py`
**Purpose**: Comprehensive demonstration of Phase 3 team coordination capabilities

**Description**:
- Demonstrates multi-twin orchestration and collaborative features
- Shows team creation, workload balancing, and skill optimization
- Includes meeting optimization and absence planning scenarios
- Provides team analytics and performance insights

**Usage**:
```bash
# Run comprehensive team coordination demo
python scripts/test_phase3_team_coordination.py
```

**Features**:
- ✅ **Team Creation**: Demonstrates team setup and member management
- ✅ **Workload Balancing**: Shows workload distribution optimization
- ✅ **Skill Optimization**: Identifies skill gaps and optimization opportunities
- ✅ **Meeting Optimization**: Finds optimal meeting times across timezones
- ✅ **Absence Planning**: Plans coverage for team member absences
- ✅ **Team Analytics**: Provides performance insights and recommendations

**Demo Scenarios**:
- Team creation with 4 members across different timezones
- Workload balancing with 87% confidence and 23.5% improvement
- Skill gap analysis and cross-training recommendations
- Meeting optimization across UTC-8 to UTC+1 timezones
- Vacation coverage planning with risk assessment

### `test_team_endpoints.py`
**Purpose**: API endpoint testing for team collaboration features

**Description**:
- Tests team collaboration API endpoints for functionality
- Verifies endpoint accessibility and response formats
- Provides comprehensive testing feedback and guidance
- Designed for development and deployment verification

**Usage**:
```bash
# Test team collaboration endpoints
python scripts/test_team_endpoints.py
```

**Features**:
- ✅ **Health Check**: Verifies server availability before testing
- ✅ **Endpoint Testing**: Tests GET requests to team-related endpoints
- ✅ **Response Validation**: Checks status codes and response formats
- ✅ **Error Handling**: Provides helpful error messages and guidance
- ✅ **Development Guidance**: Offers next steps for setup and testing

**Tested Endpoints**:
- `/api/teams` - List all teams
- `/api/teams/{id}` - Get team by ID
- `/api/teams/{id}/members` - Get team members
- `/api/teams/{id}/performance` - Get team performance metrics
- `/api/teams/{id}/skill-gaps` - Get team skill gaps
- `/api/teams/{id}/workflows` - Get team workflows

---

## 👤 User Management Scripts

### `update_admin_platform_owner.py`
**Purpose**: Updates admin user to Platform Owner status

**Description**:
- Elevates admin user privileges to Platform Owner level
- Updates database directly with SQL commands
- Provides safe user privilege management
- Includes comprehensive logging and error handling

**Usage**:
```bash
# Update admin user to Platform Owner
python scripts/update_admin_platform_owner.py
```

**Features**:
- ✅ **Direct SQL Updates**: Uses raw SQL for reliable privilege updates
- ✅ **Platform Owner Level**: Sets platform_owner_level to 3 (highest)
- ✅ **Timestamp Updates**: Updates user modification timestamps
- ✅ **Transaction Safety**: Uses database transactions with rollback
- ✅ **Verification**: Returns updated user information for confirmation

**Database Changes**:
- Sets `is_platform_owner = true`
- Sets `platform_owner_level = 3`
- Updates `updated_at` timestamp
- Targets user with email 'admin@digame.com'

---

## 🔧 Git Management Scripts

### `git-setup.py`
**Purpose**: Git repository initialization and configuration using pure Python

**Description**: 
- Provides Git functionality when git binary is not available (e.g., in containers)
- Uses dulwich (pure Python Git implementation) for all operations
- Handles repository initialization, user configuration, and basic operations

**Usage**:
```bash
# Initialize new Git repository
python digame/scripts/git-setup.py init

# Configure Git user
python digame/scripts/git-setup.py config 'Your Name' 'your.email@example.com'

# Add files to staging
python digame/scripts/git-setup.py add [files]

# Commit changes
python digame/scripts/git-setup.py commit 'Commit message'

# Check repository status
python digame/scripts/git-setup.py status
```

**Features**:
- ✅ **Pure Python Implementation**: No git binary dependency
- ✅ **Repository Initialization**: Creates new Git repositories
- ✅ **User Configuration**: Sets up Git user name and email
- ✅ **File Staging**: Adds files to Git staging area
- ✅ **Commit Creation**: Creates commits with messages
- ✅ **Status Checking**: Shows working tree status
- ✅ **Error Handling**: Provides helpful error messages and tips

---

### `simple_git.py`
**Purpose**: Simplified Git workflow interface for basic operations

**Description**: 
- Streamlined interface for common Git operations
- Designed for environments where standard git commands are unavailable
- Provides essential workflow commands with clear feedback

**Usage**:
```bash
# Initialize repository
python digame/scripts/simple_git.py init

# Configure user
python digame/scripts/simple_git.py config 'Name' 'email'

# Add all files
python digame/scripts/simple_git.py add-all

# Commit changes
python digame/scripts/simple_git.py commit 'message'

# Check status
python digame/scripts/simple_git.py status
```

**Features**:
- ✅ **Simplified Commands**: Easy-to-remember command interface
- ✅ **Add All Files**: Convenient staging of all changes
- ✅ **Clear Feedback**: Success/error messages with emojis
- ✅ **Usage Help**: Built-in help and examples
- ✅ **Error Recovery**: Helpful tips for common issues

---

### `git_remote.py`
**Purpose**: Remote repository operations and push functionality

**Description**: 
- Manages remote repository configuration
- Handles pushing to remote repositories (GitHub, GitLab, etc.)
- Provides remote repository listing and management

**Usage**:
```bash
# Add remote repository
python digame/scripts/git_remote.py add-remote origin https://github.com/user/repo.git

# List configured remotes
python digame/scripts/git_remote.py list-remotes

# Push to remote (default: origin main)
python digame/scripts/git_remote.py push

# Push to specific remote/branch
python digame/scripts/git_remote.py push origin main
```

**Features**:
- ✅ **Remote Management**: Add and configure remote repositories
- ✅ **Push Operations**: Push commits to remote repositories
- ✅ **Remote Listing**: Display configured remotes with URLs
- ✅ **Authentication Support**: Works with SSH keys and tokens
- ✅ **Error Guidance**: Helpful tips for authentication and setup issues

**Supported Remote URLs**:
- HTTPS: `https://github.com/username/repo.git`
- SSH: `git@github.com:username/repo.git`

---

### `git_status_summary.py`
**Purpose**: Comprehensive repository status and deployment guidance

**Description**: 
- Provides detailed Git repository status and statistics
- Shows commit history, remote configuration, and working tree status
- Offers guidance for pushing to remote repositories
- Includes multiple deployment strategy recommendations

**Usage**:
```bash
# Show comprehensive repository summary
python digame/scripts/git_status_summary.py
```

**Features**:
- ✅ **Repository Statistics**: Commit count and latest commit info
- ✅ **Remote Configuration**: Shows configured remotes and URLs
- ✅ **Working Tree Status**: Displays untracked, modified, and staged files
- ✅ **Deployment Guidance**: Multiple strategies for pushing to GitHub
- ✅ **Authentication Options**: GitHub CLI, manual upload, SSH, VSCode integration

**Deployment Strategies Provided**:
1. **GitHub CLI**: `gh auth login` and `gh repo create`
2. **Manual Upload**: Download/copy files and web interface upload
3. **Container SSH/Git**: Rebuild with proper Git tools and authentication
4. **VSCode Integration**: Use built-in Git extension and authentication

---

## 🚀 Common Use Cases

### **Database Setup and Deployment Workflow**
```bash
# 1. Create initial database tables (development)
python scripts/create_tables.py

# 2. Test migrations locally
python scripts/test_migrations.py

# 3. Deploy to staging/production
python scripts/deploy_migrations.py --check-only
python scripts/deploy_migrations.py

# 4. Verify deployment
python scripts/deploy_migrations.py --check-only
```

### **Docker Container Deployment**
```bash
# Development container startup
docker run -it myapp ./scripts/entrypoint.sh dev

# Production container startup
docker run -d myapp ./scripts/entrypoint.sh prod

# Migration-only container run
docker run --rm myapp ./scripts/entrypoint.sh migrate
```

### **Testing and Quality Assurance Workflow**
```bash
# 1. Test frontend components
./scripts/run_frontend_tests.sh

# 2. Test API endpoints
python scripts/test_team_endpoints.py

# 3. Run team coordination demo
python scripts/test_phase3_team_coordination.py

# 4. Test database migrations
python scripts/test_migrations.py
```

### **User Management and Setup**
```bash
# 1. Create database tables
python scripts/create_tables.py

# 2. Update admin privileges
python scripts/update_admin_platform_owner.py

# 3. Verify API endpoints
python scripts/test_team_endpoints.py
```

### **Git Repository Setup**
```bash
# 1. Initialize repository
python scripts/git-setup.py init

# 2. Configure user
python scripts/git-setup.py config 'Your Name' 'your.email@example.com'

# 3. Add and commit files
python scripts/simple_git.py add-all
python scripts/simple_git.py commit 'Initial commit'

# 4. Set up remote and push
python scripts/git_remote.py add-remote origin https://github.com/user/repo.git
python scripts/git_remote.py push
```

### **Development Environment Git Operations**
```bash
# Quick status check
python scripts/git_status_summary.py

# Add changes and commit
python scripts/simple_git.py add-all
python scripts/simple_git.py commit 'Feature implementation'

# Push to remote
python scripts/git_remote.py push
```

### **CI/CD Integration**
```bash
# Pre-deployment migration check
python scripts/test_migrations.py --docker

# Production deployment
python scripts/deploy_migrations.py

# Post-deployment verification
python scripts/deploy_migrations.py --check-only
```

---

## 🔧 Technical Requirements

### **Python Dependencies**:
- **dulwich**: Pure Python Git implementation
- **subprocess**: Command execution
- **sqlite3**: SQLite database testing
- **tempfile**: Temporary file operations
- **pathlib**: Path manipulation

### **External Dependencies**:
- **Alembic**: Database migration tool
- **PostgreSQL**: Production database (for Docker testing)
- **Docker Compose**: Container orchestration (optional)

### **Environment Requirements**:
- Python 3.8+
- Access to database (SQLite for testing, PostgreSQL for production)
- Write permissions in project directory
- Network access for remote Git operations

---

## 🛠️ Configuration

### **Database Configuration**:
Scripts use `alembic.ini` for database connection settings:
```ini
# PostgreSQL (production)
sqlalchemy.url = postgresql://user:password@host:port/database

# SQLite (testing)
sqlalchemy.url = sqlite:///path/to/database.db
```

### **Git Configuration**:
Scripts automatically configure Git user settings:
```bash
# Set via script
python digame/scripts/git-setup.py config 'Your Name' 'your.email@example.com'
```

---

## 🔍 Troubleshooting

### **Common Issues**:

1. **Database Connection Errors**:
   ```bash
   # Check database availability
   python digame/scripts/deploy_migrations.py --check-only
   ```

2. **Migration Conflicts**:
   ```bash
   # Force apply migrations
   python digame/scripts/deploy_migrations.py --force
   ```

3. **Git Authentication Issues**:
   ```bash
   # Check remote configuration
   python digame/scripts/git_remote.py list-remotes
   
   # Get deployment guidance
   python digame/scripts/git_status_summary.py
   ```

4. **Missing Dependencies**:
   ```bash
   pip install dulwich alembic
   ```

### **Getting Help**:
- Run scripts without arguments to see usage information
- Check script output logs for specific error messages
- Review alembic.ini for database configuration issues

---

## 📈 Script Maintenance

### **Adding New Scripts**:
1. Place script in `/digame/scripts/` directory
2. Update this README.md with script documentation
3. Follow naming convention: `action_target.py`
4. Include proper argument parsing and help text
5. Add comprehensive logging and error handling

### **Script Standards**:
- ✅ Comprehensive argument parsing with `--help`
- ✅ Detailed logging with timestamps
- ✅ Error handling and graceful failure
- ✅ Clear success/failure indicators
- ✅ Database connection safety checks
- ✅ Cross-platform compatibility

---

## 🔗 Related Documentation

- **Main Scripts**: `/scripts/README.md` - Root-level utility scripts
- **Database Migrations**: `/migrations/README.md` - Migration files and history
- **Deployment Guide**: `/docs/DEPLOYMENT.md` - Production deployment procedures
- **Development Setup**: `/docs/DEVELOPMENT.md` - Local development environment

---

*Last Updated: January 1, 2025*
*Digame Platform Backend Team*

---

## 📝 Recent Updates

**January 1, 2025**: Updated documentation to include newly organized scripts:
- Added `create_tables.py` - Direct database table creation
- Added `entrypoint.sh` - Docker container entrypoint script
- Added `run_frontend_tests.sh` - Frontend testing automation
- Added `test_phase3_team_coordination.py` - Team coordination demo
- Added `test_team_endpoints.py` - API endpoint testing
- Added `update_admin_platform_owner.py` - Admin user management
- Updated common use cases to include new workflow patterns
- Reorganized scripts from root directory for better project structure