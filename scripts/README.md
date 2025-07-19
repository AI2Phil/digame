# Digame Platform Scripts

This directory contains utility scripts for the Digame platform, including development tools, database management, Git operations, and infrastructure management. These scripts support both frontend development and backend operations.

## 📋 Script Overview

| Script | Purpose | Usage | Status |
|--------|---------|-------|--------|
| [`start-dev.sh`](#start-devsh) | Development environment startup | `./start-dev.sh` | ✅ Active |
| [`fix-all-imports.sh`](#fix-all-importssh) | Comprehensive UI import casing fix | `./fix-all-imports.sh` | ✅ Active |
| [`fix-imports.sh`](#fix-importssh) | Basic UI import casing fix | `./fix-imports.sh` | ✅ Active |
| [`fix-ui-imports.sh`](#fix-ui-importssh) | Advanced UI import casing fix | `./fix-ui-imports.sh` | ✅ Active |
| [`create_tables.py`](#create_tablespy) | Database table creation | `python create_tables.py` | ✅ Active |
| [`entrypoint.sh`](#entrypointsh) | Docker container entrypoint | Used by Docker | ✅ Active |
| [`deploy_migrations.py`](#deploy_migrationspy) | Database migration deployment | `python deploy_migrations.py` | ✅ Active |
| [`test_migrations.py`](#test_migrationspy) | Migration testing and validation | `python test_migrations.py` | ✅ Active |
| [`run_frontend_tests.sh`](#run_frontend_testssh) | Frontend testing automation | `./run_frontend_tests.sh` | ✅ Active |
| [`test_phase3_team_coordination.py`](#test_phase3_team_coordinationpy) | Team coordination demo | `python test_phase3_team_coordination.py` | ✅ Active |
| [`test_team_endpoints.py`](#test_team_endpointspy) | API endpoint testing | `python test_team_endpoints.py` | ✅ Active |
| [`update_admin_platform_owner.py`](#update_admin_platform_ownerpy) | Admin user management | `python update_admin_platform_owner.py` | ✅ Active |
| [`check_backend_db.py`](#check_backend_dbpy) | Node.js backend database inspection | `python check_backend_db.py` | ✅ Active |
| [`check_user_credentials.py`](#check_user_credentialspy) | User credential verification | `python check_user_credentials.py` | ✅ Active |
| [`check_db_schema.py`](#check_db_schemapy) | Database schema inspection | `python check_db_schema.py` | ✅ Active |
| [`create_platform_owner.py`](#create_platform_ownerpy) | Platform Owner user creation | `python create_platform_owner.py` | ✅ Active |
| [`create_simple_platform_owner.py`](#create_simple_platform_ownerpy) | Simple Platform Owner creation | `python create_simple_platform_owner.py` | ✅ Active |
| [`fix_platform_owner_onboarding.py`](#fix_platform_owner_onboardingpy) | Platform Owner onboarding fix | `python fix_platform_owner_onboarding.py` | ✅ Active |
| [`fix_platform_owner_password.py`](#fix_platform_owner_passwordpy) | Platform Owner password fix | `python fix_platform_owner_password.py` | ✅ Active |
| [`get_user_details.py`](#get_user_detailspy) | Individual user detail retrieval | `python get_user_details.py` | ✅ Active |
| [`simple_user_check.py`](#simple_user_checkpy) | Simple user table inspection | `python simple_user_check.py` | ✅ Active |
| [`git-setup.py`](#git-setuppy) | Git repository initialization | `python git-setup.py init` | ✅ Active |
| [`simple_git.py`](#simple_gitpy) | Basic Git operations | `python simple_git.py status` | ✅ Active |
| [`git_remote.py`](#git_remotepy) | Remote repository management | `python git_remote.py push` | ✅ Active |
| [`git_status_summary.py`](#git_status_summarypy) | Repository status and guidance | `python git_status_summary.py` | ✅ Active |
| [`fix_table_definitions.py`](#fix_table_definitionspy) | Database table definition fixes | `python fix_table_definitions.py` | ✅ Active |
| [`test_api_keys.py`](#test_api_keyspy) | API key testing and validation | `python test_api_keys.py` | ✅ Active |
| [`activate_digame.sh`](#activate_digamesh) | Environment activation script | `./activate_digame.sh` | ✅ Active |
| [`docker-cleanup.sh`](#docker-cleanupsh) | Docker storage cleanup and optimization | `./docker-cleanup.sh` | ✅ Active |
| [`system-monitor.sh`](#system-monitorsh) | System monitoring and health checks | `./system-monitor.sh` | ✅ Active |
| [`run-performance-tests.sh`](#run-performance-testssh) | Performance testing automation | `./run-performance-tests.sh` | ✅ Active |
| [`health-checks.sh`](#health-checkssh) | Infrastructure health monitoring | `./health-checks.sh` | ✅ Active |
| [`validate_pipeline.sh`](#validate_pipelinesh) | CI/CD pipeline validation | `./validate_pipeline.sh` | ✅ Active |
| [`deploy.sh`](#deploysh) | General deployment automation | `./deploy.sh` | ✅ Active |
| [`deploy-environment.sh`](#deploy-environmentsh) | Environment-specific deployment | `./deploy-environment.sh` | ✅ Active |
| [`deploy-production.sh`](#deploy-productionsh) | Production deployment automation | `./deploy-production.sh` | ✅ Active |
| [`production_deployment.py`](#production_deploymentpy) | Python production deployment tool | `python production_deployment.py` | ✅ Active |
| [`production_backup.py`](#production_backuppy) | Production backup automation | `python production_backup.py` | ✅ Active |
| [`production_environment.py`](#production_environmentpy) | Production environment management | `python production_environment.py` | ✅ Active |
| [`production_health_monitor.py`](#production_health_monitorpy) | Production health monitoring | `python production_health_monitor.py` | ✅ Active |
| [`setup_dev_env.py`](#setup_dev_envpy) | Development environment setup | `python setup_dev_env.py` | ✅ Active |
| [`setup_platform_owner.py`](#setup_platform_ownerpy) | Platform Owner setup automation | `python setup_platform_owner.py` | ✅ Active |
| [`setup_aco_integration.py`](#setup_aco_integrationpy) | ACO integration setup | `python setup_aco_integration.py` | ✅ Active |
| [`documentation_automation.py`](#documentation_automationpy) | Documentation generation automation | `python documentation_automation.py` | ✅ Active |
| [`integration_helper.py`](#integration_helperpy) | Integration testing helper | `python integration_helper.py` | ✅ Active |
| [`validate_nextjs_routing.js`](#validate_nextjs_routingjs) | Next.js routing validation | `node validate_nextjs_routing.js` | ✅ Active |
| [`upgrade_fastapi_python313.py`](#upgrade_fastapi_python313py) | FastAPI Python 3.13 upgrade | `python upgrade_fastapi_python313.py` | ✅ Active |
| [`verify_and_cleanup_fixes.py`](#verify_and_cleanup_fixespy) | Fix verification and cleanup | `python verify_and_cleanup_fixes.py` | ✅ Active |
| [`fix_circular_imports.py`](#fix_circular_importspy) | Circular import resolution | `python fix_circular_imports.py` | ✅ Active |
| [`fix_dependencies_and_imports.py`](#fix_dependencies_and_importspy) | Dependency and import fixes | `python fix_dependencies_and_imports.py` | ✅ Active |
| [`fix_import_paths.py`](#fix_import_pathspy) | Import path corrections | `python fix_import_paths.py` | ✅ Active |
| [`fix_pyrefly_errors.py`](#fix_pyrefly_errorspy) | Pyrefly error resolution | `python fix_pyrefly_errors.py` | ✅ Active |
| [`fix_remaining_test_errors.py`](#fix_remaining_test_errorspy) | Test error resolution | `python fix_remaining_test_errors.py` | ✅ Active |
| [`seed_test_data.py`](#seed_test_datapy) | Test data seeding | `python seed_test_data.py` | ✅ Active |
| [`seed_demo_users.py`](#seed_demo_userspy) | Demo user data seeding | `python seed_demo_users.py` | ✅ Active |
| [`seed_activities.py`](#seed_activitiespy) | Activity data seeding | `python seed_activities.py` | ✅ Active |
| [`seed_analytics_data.py`](#seed_analytics_datapy) | Analytics data seeding | `python seed_analytics_data.py` | ✅ Active |
| [`seed_behavioral_data.py`](#seed_behavioral_datapy) | Behavioral data seeding | `python seed_behavioral_data.py` | ✅ Active |
| [`seed_aiml_data.py`](#seed_aiml_datapy) | AI/ML data seeding | `python seed_aiml_data.py` | ✅ Active |
| [`seed_aiml_data_simple.py`](#seed_aiml_data_simplepy) | Simple AI/ML data seeding | `python seed_aiml_data_simple.py` | ✅ Active |
| [`simple_seed.py`](#simple_seedpy) | Simple data seeding utility | `python simple_seed.py` | ✅ Active |
| [`data-migration/migrate_mock_to_production.py`](#data-migrationmigrate_mock_to_productionpy) | Production migration tool | `python data-migration/migrate_mock_to_production.py` | ✅ Active |
| [`data-migration/validate_data_integrity.py`](#data-migrationvalidate_data_integritypy) | Data integrity validation | `python data-migration/validate_data_integrity.py` | ✅ Active |
| [`find-port.js`](#find-portjs) | Dynamic port detection utility | `node find-port.js` | ✅ Active |
| [`start-test-server.js`](#start-test-serverjs) | Test server startup with dynamic port management | `node start-test-server.js` | ✅ Active |
| [`fix_database_schema.py`](#fix_database_schemapy) | SQLAlchemy model conflicts and schema fixes | `python scripts/fix_database_schema.py` | ✅ Active |
| [`test_sqlalchemy_fixes.py`](#test_sqlalchemy_fixespy) | SQLAlchemy fixes validation and testing | `python scripts/test_sqlalchemy_fixes.py` | ✅ Active |
| [`start-dev.sh`](#start-devsh-integration) | Frontend-backend development environment startup | `./start-dev.sh` | ✅ Active |
| [`stop-dev.sh`](#stop-devsh) | Frontend-backend development environment shutdown | `./stop-dev.sh` | ✅ Active |
| [`setup-test-env.sh`](#setup-test-envsh) | Test environment setup with backend services | `./setup-test-env.sh` | ✅ Active |
| [`cleanup-test-env.sh`](#cleanup-test-envsh) | Test environment cleanup and teardown | `./cleanup-test-env.sh` | ✅ Active |
| [`debug_activity_model.py`](#debug_activity_modelpy) | ActivityEnrichedFeature model debugging and testing | `python scripts/debug_activity_model.py` | ✅ Active |
| [`debug_imports.py`](#debug_importspy) | UserRoleAssignment import conflicts debugging | `python scripts/debug_imports.py` | ✅ Active |
| [`debug_models.py`](#debug_modelspy) | SQLAlchemy model diagnostic and troubleshooting | `python scripts/debug_models.py` | ✅ Active |
| [`debug_test_user.py`](#debug_test_userpy) | User model creation debugging in test environment | `python scripts/debug_test_user.py` | ✅ Active |
| [`debug_user_class.py`](#debug_user_classpy) | User class import and registry debugging | `python scripts/debug_user_class.py` | ✅ Active |

---

## 🚀 Development & Build Scripts

### `start-dev.sh`
**Purpose**: Interactive development environment startup script with multiple backend options

**Description**:
- Provides interactive menu for choosing development environment configuration
- Supports Node.js backend (recommended), Python FastAPI backend, or both
- Handles dependency installation and service orchestration
- Includes proper cleanup and signal handling for graceful shutdown

**Usage**:
```bash
# Interactive startup (recommended)
./scripts/start-dev.sh

# Direct execution from root
./start-dev.sh
```

**Features**:
- ✅ **Dependency Management**: Automatically runs `npm run install:all`
- ✅ **Multiple Backend Options**: Node.js (port 8001), Python FastAPI (port 8002), or both
- ✅ **Frontend Integration**: Starts frontend on port 3001 when needed
- ✅ **Interactive Menu**: User-friendly selection of startup modes
- ✅ **Signal Handling**: Proper cleanup on SIGINT/SIGTERM
- ✅ **Environment Validation**: Checks for Node.js and Python installation

**Startup Options**:
1. **Node.js Backend Only** (Recommended) - Complete Test Zone functionality
2. **Python FastAPI Backend Only** - Basic backend with limited Test Zone
3. **Both Backends** (Dual Mode) - Node.js on 8001, Python on 8002
4. **Frontend Only** - Limited functionality without backend

**Environment Requirements**:
- Node.js installed and accessible via `node` command
- Python installed and accessible via `python` or `python3` command
- All project dependencies installed via `npm run install:all`

---

## 🎨 Frontend Development Scripts

### `fix-all-imports.sh`
**Purpose**: Comprehensive UI component import casing fix for Next.js webpack compatibility

**Description**:
- Fixes all UI component import casing issues across the entire frontend codebase
- Handles both `../ui/` and `./ui/` relative import paths
- Supports comprehensive list of UI components from shadcn/ui and custom components
- Provides verification and statistics on fixes applied

**Usage**:
```bash
# Fix all UI component import casing issues
./scripts/fix-all-imports.sh

# Run from project root
./fix-all-imports.sh
```

**Features**:
- ✅ **Comprehensive Coverage**: Fixes 40+ UI component import paths
- ✅ **Multiple Path Formats**: Handles `../ui/` and `./ui/` relative paths
- ✅ **File Type Support**: Processes `.jsx`, `.tsx`, and `.js` files
- ✅ **Statistics Tracking**: Reports files processed and fixes applied
- ✅ **Verification**: Checks for remaining lowercase imports after fixes
- ✅ **Backup Safety**: Creates backup files during processing (automatically cleaned)

**Components Fixed**:
- Basic: Card, Button, Badge, Progress, Input, Label, Textarea, Tabs, Select, Switch
- Advanced: Accordion, AlertDialog, AspectRatio, Avatar, Breadcrumb, Calendar, Carousel
- Forms: Checkbox, Form, RadioGroup, InputOTP
- Navigation: NavigationMenu, Menubar, ContextMenu, DropdownMenu
- Layout: Sheet, Sidebar, Separator, ScrollArea, Resizable
- Feedback: Toast, Toaster, Tooltip, HoverCard, Popover
- Interactive: Slider, Toggle, ToggleGroup, Command, Collapsible

**Webpack Compatibility**:
- Resolves case-sensitive import issues on Linux/production environments
- Ensures consistent PascalCase naming for all UI components
- Prevents webpack warnings about multiple modules with similar names

---

### `fix-imports.sh`
**Purpose**: Basic UI component import casing fix for common components

**Description**:
- Lightweight script for fixing the most common UI component import casing issues
- Focuses on essential components used throughout the application
- Simpler implementation for quick fixes during development

**Usage**:
```bash
# Fix basic UI component import casing
./scripts/fix-imports.sh
```

**Features**:
- ✅ **Essential Components**: Fixes 10 most common UI components
- ✅ **Fast Execution**: Lightweight processing for quick fixes
- ✅ **JSX Focus**: Specifically targets `.jsx` files
- ✅ **Backup Creation**: Creates backup files for safety

**Components Fixed**:
- Card, Button, Badge, Progress, Input, Label, Textarea, Tabs, Select, Switch

**Use Case**: Quick fixes during development when only basic components need correction

---

### `fix-ui-imports.sh`
**Purpose**: Advanced UI component import casing fix with detailed verification

**Description**:
- Advanced import fixing with line-by-line processing and detailed verification
- Provides comprehensive reporting and remaining issue identification
- Uses temporary file processing for safer operations

**Usage**:
```bash
# Fix UI imports with advanced verification
./scripts/fix-ui-imports.sh
```

**Features**:
- ✅ **Line-by-Line Processing**: Safer file modification approach
- ✅ **Detailed Verification**: Shows specific lines that need fixing
- ✅ **Comprehensive Reporting**: Detailed statistics and remaining issues
- ✅ **Multiple File Types**: Processes `.jsx`, `.tsx`, and `.js` files
- ✅ **Temporary File Safety**: Uses temporary files to prevent corruption

**Advanced Features**:
- Regex pattern matching for import detection
- Temporary file processing for safety
- Detailed remaining issue reporting with line numbers
- Support for both single and double quote imports

---

## 🔗 Frontend-Backend Integration Scripts

### `start-dev.sh` (Integration)
**Purpose**: Enhanced development environment startup with frontend-backend integration support

**Description**:
- Comprehensive development environment orchestration for integrated frontend-backend development
- Manages both FastAPI backend and Next.js frontend services with proper coordination
- Includes health checks, dependency validation, and graceful service management
- Provides enhanced error handling and troubleshooting for integration issues

**Usage**:
```bash
# Start integrated development environment
./scripts/start-dev.sh

# Run from project root
./start-dev.sh
```

**Features**:
- ✅ **Service Orchestration**: Coordinates FastAPI backend and Next.js frontend startup
- ✅ **Health Monitoring**: Monitors service health and provides status updates
- ✅ **Dependency Validation**: Ensures all required dependencies are installed
- ✅ **Port Management**: Manages port allocation (backend: 8000, frontend: 3000)
- ✅ **Error Recovery**: Provides troubleshooting guidance for common integration issues
- ✅ **Graceful Shutdown**: Handles SIGINT/SIGTERM for clean service termination

**Integration Features**:
- Backend health endpoint monitoring at `/health`
- Frontend-backend API connectivity validation
- CORS configuration verification
- Service worker registration handling
- Environment variable validation

---

### `stop-dev.sh`
**Purpose**: Clean shutdown of integrated development environment

**Description**:
- Gracefully stops all development services including backend and frontend
- Cleans up background processes and temporary files
- Provides comprehensive service termination with status reporting
- Ensures clean environment state for next startup

**Usage**:
```bash
# Stop all development services
./scripts/stop-dev.sh

# Run from project root
./stop-dev.sh
```

**Features**:
- ✅ **Process Management**: Identifies and terminates all related processes
- ✅ **Port Cleanup**: Frees up development ports (3000, 8000)
- ✅ **Status Reporting**: Reports termination status for each service
- ✅ **Cleanup Operations**: Removes temporary files and cleanup artifacts
- ✅ **Error Handling**: Handles stuck processes and provides manual cleanup guidance

**Cleanup Operations**:
- Terminates FastAPI backend processes
- Stops Next.js development server
- Cleans up Node.js and Python background processes
- Removes temporary log files and artifacts

---

### `setup-test-env.sh`
**Purpose**: Comprehensive test environment setup with backend service management

**Description**:
- Sets up isolated test environment with backend services for E2E testing
- Manages test database creation and seeding
- Configures environment variables for testing
- Provides service health validation before test execution

**Usage**:
```bash
# Setup test environment
./scripts/setup-test-env.sh

# Setup with custom configuration
./scripts/setup-test-env.sh --config test

# Validate test environment
./scripts/setup-test-env.sh --validate
```

**Features**:
- ✅ **Test Database Setup**: Creates isolated SQLite test database
- ✅ **Service Management**: Starts backend services for testing
- ✅ **Environment Isolation**: Configures test-specific environment variables
- ✅ **Health Validation**: Validates all services are ready for testing
- ✅ **Data Seeding**: Seeds test data for comprehensive E2E testing
- ✅ **Port Management**: Uses test-specific ports to avoid conflicts

**Test Environment Configuration**:
- Test database: `test_digame.db`
- Backend test port: 8001
- Frontend test port: 3001
- Test-specific environment variables
- Isolated test data and configurations

---

### `cleanup-test-env.sh`
**Purpose**: Test environment cleanup and resource management

**Description**:
- Comprehensive cleanup of test environment resources
- Terminates test services and processes
- Removes test databases and temporary files
- Ensures clean state for subsequent test runs

**Usage**:
```bash
# Cleanup test environment
./scripts/cleanup-test-env.sh

# Force cleanup (removes all test artifacts)
./scripts/cleanup-test-env.sh --force

# Cleanup with verification
./scripts/cleanup-test-env.sh --verify
```

**Features**:
- ✅ **Service Termination**: Stops all test-related services and processes
- ✅ **Database Cleanup**: Removes test databases and data files
- ✅ **File Management**: Cleans up temporary files and test artifacts
- ✅ **Port Liberation**: Frees up test ports for reuse
- ✅ **Verification**: Confirms complete cleanup and resource liberation
- ✅ **Error Recovery**: Handles stuck processes and resource conflicts

**Cleanup Operations**:
- Terminates backend test services
- Removes test database files
- Cleans up test logs and temporary files
- Frees test ports (8001, 3001)
- Removes test environment variables

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

### `fix_table_definitions.py`
**Purpose**: Database table definition fixes and schema corrections

**Description**:
- Fixes database table definition issues and schema inconsistencies
- Corrects column types, constraints, and relationships
- Handles table structure updates and migrations
- Provides safe schema modification with backup and rollback capabilities

**Usage**:
```bash
# Fix table definitions with automatic detection
python scripts/fix_table_definitions.py

# Fix specific table definitions
python scripts/fix_table_definitions.py --table users

# Dry run to see what would be fixed
python scripts/fix_table_definitions.py --dry-run
```

**Features**:
- ✅ **Schema Analysis**: Analyzes current table structures for issues
- ✅ **Automatic Fixes**: Applies common table definition corrections
- ✅ **Backup Creation**: Creates backups before making changes
- ✅ **Rollback Support**: Provides rollback capabilities for failed fixes
- ✅ **Constraint Validation**: Ensures foreign key and constraint integrity
- ✅ **Migration Integration**: Works with Alembic migration system

**Common Fixes Applied**:
- Column type corrections (VARCHAR lengths, data types)
- Missing NOT NULL constraints
- Foreign key relationship fixes
- Index creation for performance optimization
- Default value corrections

---

### `test_api_keys.py`
**Purpose**: API key testing and validation for external service integrations

**Description**:
- Tests API key functionality and connectivity to external services
- Validates API key permissions and access levels
- Provides comprehensive API endpoint testing
- Ensures proper authentication and authorization workflows

**Usage**:
```bash
# Test all configured API keys
python scripts/test_api_keys.py

# Test specific API service
python scripts/test_api_keys.py --service openai

# Test with verbose output
python scripts/test_api_keys.py --verbose

# Test API keys from specific environment
python scripts/test_api_keys.py --env production
```

**Features**:
- ✅ **Multi-Service Support**: Tests various API services (OpenAI, GitHub, etc.)
- ✅ **Permission Validation**: Checks API key permissions and access levels
- ✅ **Connectivity Testing**: Verifies network connectivity and response times
- ✅ **Rate Limit Checking**: Tests API rate limits and quota usage
- ✅ **Error Handling**: Provides detailed error reporting and troubleshooting
- ✅ **Environment Support**: Tests keys across different environments

**Supported API Services**:
- OpenAI API (GPT models, embeddings)
- GitHub API (repository access, actions)
- Database APIs (connection testing)
- Custom internal APIs

**Test Categories**:
- Authentication validation
- Permission scope verification
- Rate limit compliance
- Response format validation
- Error handling verification

---

## 🌟 Environment & Activation Scripts

### `activate_digame.sh`
**Purpose**: Environment activation script for Digame platform development

**Description**:
- Activates the Digame development environment with proper PATH and environment variables
- Sets up Python virtual environment and Node.js environment
- Configures database connections and API keys
- Provides consistent development environment across different systems

**Usage**:
```bash
# Activate Digame environment
source ./scripts/activate_digame.sh

# Or run directly
./scripts/activate_digame.sh
```

**Features**:
- ✅ **Environment Variables**: Sets up all required environment variables
- ✅ **Virtual Environment**: Activates Python virtual environment if available
- ✅ **Path Configuration**: Adds necessary paths to system PATH
- ✅ **Database Setup**: Configures database connection strings
- ✅ **API Configuration**: Sets up API keys and endpoints
- ✅ **Cross-Platform**: Works on macOS, Linux, and Windows (WSL)

**Environment Variables Set**:
- `DIGAME_ENV` - Environment type (development/staging/production)
- `DATABASE_URL` - Database connection string
- `API_BASE_URL` - Base URL for API endpoints
- `NODE_ENV` - Node.js environment setting

---

## 🐳 Docker & Infrastructure Scripts

### `docker-cleanup.sh`
**Purpose**: Docker storage cleanup and optimization for development environments

**Description**:
- Comprehensive Docker storage cleanup to reclaim disk space
- Removes unused containers, images, volumes, and networks
- Provides safe cleanup with confirmation prompts
- Includes system monitoring and storage analysis

**Usage**:
```bash
# Interactive cleanup with prompts
./scripts/docker-cleanup.sh

# Aggressive cleanup (removes everything unused)
./scripts/docker-cleanup.sh --aggressive

# Dry run to see what would be cleaned
./scripts/docker-cleanup.sh --dry-run
```

**Features**:
- ✅ **Storage Analysis**: Shows current Docker storage usage
- ✅ **Safe Cleanup**: Removes only unused Docker resources
- ✅ **Confirmation Prompts**: Interactive confirmation for destructive operations
- ✅ **Comprehensive Cleanup**: Handles containers, images, volumes, networks
- ✅ **Space Reporting**: Shows space reclaimed after cleanup
- ✅ **Build Cache Cleanup**: Removes Docker build cache

**Cleanup Categories**:
- Stopped containers and unused images
- Dangling and unused volumes
- Unused networks and build cache
- System-wide Docker cleanup

---

### `system-monitor.sh`
**Purpose**: System monitoring and health checks for development and production environments

**Description**:
- Monitors system resources (CPU, memory, disk, network)
- Provides real-time health status of services and containers
- Generates alerts for resource thresholds
- Includes Docker container monitoring and log analysis

**Usage**:
```bash
# Start continuous monitoring
./scripts/system-monitor.sh

# One-time health check
./scripts/system-monitor.sh --check

# Monitor with alerts
./scripts/system-monitor.sh --alerts

# Generate monitoring report
./scripts/system-monitor.sh --report
```

**Features**:
- ✅ **Resource Monitoring**: CPU, memory, disk, and network usage
- ✅ **Service Health**: Monitors Docker containers and services
- ✅ **Threshold Alerts**: Configurable alerts for resource limits
- ✅ **Log Analysis**: Analyzes application and system logs
- ✅ **Performance Metrics**: Collects and reports performance data
- ✅ **Historical Data**: Maintains monitoring history and trends

**Monitoring Categories**:
- System resources and performance
- Docker container health and logs
- Database connectivity and performance
- Network connectivity and latency

---

### `run-performance-tests.sh`
**Purpose**: Performance testing automation for load testing and benchmarking

**Description**:
- Automated performance testing using Locust and other testing tools
- Provides comprehensive load testing scenarios
- Generates performance reports and metrics
- Supports multiple testing environments and configurations

**Usage**:
```bash
# Run basic performance tests
./scripts/run-performance-tests.sh

# Run with specific user count and duration
./scripts/run-performance-tests.sh --users 100 --duration 300

# Run against specific environment
./scripts/run-performance-tests.sh --env staging

# Generate detailed reports
./scripts/run-performance-tests.sh --report
```

**Features**:
- ✅ **Load Testing**: Simulates multiple concurrent users
- ✅ **Performance Metrics**: Measures response times, throughput, error rates
- ✅ **Scenario Testing**: Tests various user workflows and API endpoints
- ✅ **Report Generation**: Creates detailed performance reports
- ✅ **Environment Support**: Tests against different environments
- ✅ **Threshold Validation**: Validates performance against defined thresholds

**Test Scenarios**:
- User authentication and registration
- API endpoint performance
- Database query performance
- Frontend page load times

---

### `health-checks.sh`
**Purpose**: Infrastructure health monitoring and service validation

**Description**:
- Comprehensive health checks for all system components
- Validates service availability and performance
- Provides detailed health status reports
- Supports automated monitoring and alerting

**Usage**:
```bash
# Run all health checks
./scripts/health-checks.sh

# Check specific services
./scripts/health-checks.sh --service database

# Continuous monitoring mode
./scripts/health-checks.sh --monitor

# Generate health report
./scripts/health-checks.sh --report
```

**Features**:
- ✅ **Service Validation**: Checks database, API, frontend availability
- ✅ **Performance Monitoring**: Measures response times and resource usage
- ✅ **Dependency Checking**: Validates external service dependencies
- ✅ **Alert Generation**: Sends alerts for failed health checks
- ✅ **Historical Tracking**: Maintains health check history
- ✅ **Dashboard Integration**: Provides data for monitoring dashboards

**Health Check Categories**:
- Database connectivity and performance
- API endpoint availability and response times
- Frontend application accessibility
- External service dependencies

---

### `validate_pipeline.sh`
**Purpose**: CI/CD pipeline validation and testing

**Description**:
- Validates CI/CD pipeline configuration and functionality
- Tests pipeline stages and deployment processes
- Provides comprehensive pipeline health assessment
- Ensures pipeline reliability and performance

**Usage**:
```bash
# Validate complete pipeline
./scripts/validate_pipeline.sh

# Validate specific pipeline stage
./scripts/validate_pipeline.sh --stage build

# Dry run validation
./scripts/validate_pipeline.sh --dry-run

# Generate validation report
./scripts/validate_pipeline.sh --report
```

**Features**:
- ✅ **Pipeline Testing**: Tests all pipeline stages and workflows
- ✅ **Configuration Validation**: Validates pipeline configuration files
- ✅ **Dependency Checking**: Ensures all pipeline dependencies are available
- ✅ **Performance Analysis**: Measures pipeline execution times
- ✅ **Error Detection**: Identifies potential pipeline issues
- ✅ **Best Practice Validation**: Ensures pipeline follows best practices

**Validation Categories**:
- Build process validation
- Test execution verification
- Deployment process testing
- Security and compliance checks

---

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

## 🚀 Deployment & Production Scripts

### `deploy.sh`
**Purpose**: General deployment automation for multiple environments

**Description**:
- Automated deployment script supporting multiple environments
- Handles build, test, and deployment processes
- Provides rollback capabilities and deployment validation
- Supports both staging and production deployments

**Usage**:
```bash
# Deploy to staging environment
./scripts/deploy.sh staging

# Deploy to production environment
./scripts/deploy.sh production

# Deploy with specific version
./scripts/deploy.sh production --version v1.2.3

# Dry run deployment
./scripts/deploy.sh staging --dry-run
```

**Features**:
- ✅ **Multi-Environment**: Supports staging, production, and custom environments
- ✅ **Build Automation**: Automated build and packaging processes
- ✅ **Health Validation**: Post-deployment health checks and validation
- ✅ **Rollback Support**: Automatic rollback on deployment failures
- ✅ **Version Management**: Supports versioned deployments
- ✅ **Notification Integration**: Sends deployment notifications

---

### `deploy-environment.sh`
**Purpose**: Environment-specific deployment with configuration management

**Description**:
- Environment-specific deployment script with configuration management
- Handles environment variables and configuration files
- Provides environment validation and setup
- Supports multiple deployment strategies

**Usage**:
```bash
# Deploy to specific environment
./scripts/deploy-environment.sh development

# Deploy with custom configuration
./scripts/deploy-environment.sh staging --config custom.env

# Validate environment before deployment
./scripts/deploy-environment.sh production --validate-only
```

**Features**:
- ✅ **Environment Configuration**: Manages environment-specific settings
- ✅ **Configuration Validation**: Validates configuration before deployment
- ✅ **Secret Management**: Handles sensitive configuration securely
- ✅ **Service Orchestration**: Coordinates multiple service deployments
- ✅ **Environment Isolation**: Ensures proper environment separation

---

### `deploy-production.sh`
**Purpose**: Production deployment automation with enhanced safety measures

**Description**:
- Production-specific deployment with enhanced safety and validation
- Includes comprehensive pre-deployment checks and validations
- Provides blue-green deployment and zero-downtime deployment options
- Includes automated backup and recovery procedures

**Usage**:
```bash
# Standard production deployment
./scripts/deploy-production.sh

# Blue-green deployment
./scripts/deploy-production.sh --strategy blue-green

# Deploy with maintenance mode
./scripts/deploy-production.sh --maintenance

# Emergency rollback
./scripts/deploy-production.sh --rollback
```

**Features**:
- ✅ **Safety Checks**: Comprehensive pre-deployment validation
- ✅ **Zero Downtime**: Blue-green and rolling deployment strategies
- ✅ **Backup Integration**: Automated backup before deployment
- ✅ **Monitoring Integration**: Real-time deployment monitoring
- ✅ **Emergency Procedures**: Quick rollback and recovery options
- ✅ **Compliance Logging**: Detailed audit logs for compliance

---

### `production_deployment.py`
**Purpose**: Python-based production deployment tool with advanced features

**Description**:
- Advanced Python deployment tool with database migration support
- Provides comprehensive deployment orchestration and monitoring
- Includes automated testing and validation during deployment
- Supports complex deployment workflows and dependencies

**Usage**:
```bash
# Standard production deployment
python scripts/production_deployment.py

# Deploy with migrations
python scripts/production_deployment.py --with-migrations

# Deploy specific version
python scripts/production_deployment.py --version v2.1.0

# Validate deployment readiness
python scripts/production_deployment.py --validate
```

**Features**:
- ✅ **Migration Support**: Automated database migration handling
- ✅ **Dependency Management**: Handles service dependencies and ordering
- ✅ **Real-time Monitoring**: Live deployment progress and health monitoring
- ✅ **Automated Testing**: Runs deployment tests and validations
- ✅ **Configuration Management**: Advanced configuration and secret handling
- ✅ **Notification System**: Comprehensive deployment notifications

---

### `production_backup.py`
**Purpose**: Production backup automation and management

**Description**:
- Automated backup system for production environments
- Supports database, file system, and configuration backups
- Provides backup scheduling, retention, and restoration capabilities
- Includes backup validation and integrity checking

**Usage**:
```bash
# Create full production backup
python scripts/production_backup.py

# Database-only backup
python scripts/production_backup.py --database-only

# Restore from backup
python scripts/production_backup.py --restore backup_20250106_120000

# Validate backup integrity
python scripts/production_backup.py --validate
```

**Features**:
- ✅ **Comprehensive Backups**: Database, files, and configuration backups
- ✅ **Scheduled Backups**: Automated backup scheduling and execution
- ✅ **Retention Management**: Automated backup cleanup and retention policies
- ✅ **Integrity Validation**: Backup verification and integrity checking
- ✅ **Restoration Tools**: Easy backup restoration and recovery
- ✅ **Compression**: Efficient backup compression and storage

---

### `production_environment.py`
**Purpose**: Production environment management and configuration

**Description**:
- Production environment setup and configuration management
- Handles environment provisioning and infrastructure setup
- Provides environment monitoring and maintenance capabilities
- Supports infrastructure as code and automated provisioning

**Usage**:
```bash
# Setup production environment
python scripts/production_environment.py setup

# Validate environment configuration
python scripts/production_environment.py validate

# Update environment settings
python scripts/production_environment.py update

# Monitor environment health
python scripts/production_environment.py monitor
```

**Features**:
- ✅ **Environment Provisioning**: Automated infrastructure setup
- ✅ **Configuration Management**: Centralized configuration handling
- ✅ **Health Monitoring**: Continuous environment health monitoring
- ✅ **Scaling Support**: Automated scaling and resource management
- ✅ **Security Configuration**: Security hardening and compliance
- ✅ **Disaster Recovery**: Backup and recovery procedures

---

### `production_health_monitor.py`
**Purpose**: Production health monitoring and alerting system

**Description**:
- Comprehensive production health monitoring and alerting
- Monitors application performance, resource usage, and service availability
- Provides real-time alerts and notification systems
- Includes performance analytics and trend analysis

**Usage**:
```bash
# Start health monitoring
python scripts/production_health_monitor.py

# Check current health status
python scripts/production_health_monitor.py --status

# Generate health report
python scripts/production_health_monitor.py --report

# Configure alert thresholds
python scripts/production_health_monitor.py --configure
```

**Features**:
- ✅ **Real-time Monitoring**: Continuous health and performance monitoring
- ✅ **Alert System**: Configurable alerts and notification channels
- ✅ **Performance Analytics**: Detailed performance metrics and analysis
- ✅ **Trend Analysis**: Historical data analysis and trend identification
- ✅ **Dashboard Integration**: Integration with monitoring dashboards
- ✅ **Incident Management**: Automated incident detection and response

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

## ⚙️ Setup & Development Environment Scripts

### `setup_dev_env.py`
**Purpose**: Development environment setup and configuration automation

**Description**:
- Automated setup of complete development environment
- Installs and configures all necessary dependencies and tools
- Sets up database, creates initial data, and configures services
- Provides consistent development environment across different systems

**Usage**:
```bash
# Setup complete development environment
python scripts/setup_dev_env.py

# Setup with specific configuration
python scripts/setup_dev_env.py --config development

# Reset development environment
python scripts/setup_dev_env.py --reset

# Validate development environment
python scripts/setup_dev_env.py --validate
```

**Features**:
- ✅ **Dependency Installation**: Installs Python, Node.js, and system dependencies
- ✅ **Database Setup**: Creates and configures development database
- ✅ **Service Configuration**: Configures all required services and APIs
- ✅ **Environment Validation**: Validates setup and configuration
- ✅ **Cross-Platform**: Works on macOS, Linux, and Windows
- ✅ **Version Management**: Manages tool and dependency versions

---

### `setup_platform_owner.py`
**Purpose**: Platform Owner setup automation with comprehensive configuration

**Description**:
- Automated Platform Owner account creation and configuration
- Sets up complete Platform Owner environment with permissions
- Configures team management and administrative capabilities
- Provides comprehensive onboarding and setup validation

**Usage**:
```bash
# Setup Platform Owner account
python scripts/setup_platform_owner.py

# Setup with custom configuration
python scripts/setup_platform_owner.py --config custom.json

# Validate Platform Owner setup
python scripts/setup_platform_owner.py --validate

# Reset Platform Owner configuration
python scripts/setup_platform_owner.py --reset
```

**Features**:
- ✅ **Account Creation**: Creates Platform Owner account with proper permissions
- ✅ **Environment Setup**: Configures Platform Owner environment and tools
- ✅ **Permission Management**: Sets up administrative permissions and access
- ✅ **Team Configuration**: Configures team management capabilities
- ✅ **Onboarding Automation**: Automated onboarding process completion
- ✅ **Validation Tools**: Comprehensive setup validation and testing

---

### `setup_aco_integration.py`
**Purpose**: ACO (Ant Colony Optimization) integration setup and configuration

**Description**:
- Sets up ACO integration for optimization algorithms
- Configures ACO parameters and optimization settings
- Provides ACO algorithm testing and validation
- Integrates ACO with existing platform optimization features

**Usage**:
```bash
# Setup ACO integration
python scripts/setup_aco_integration.py

# Configure ACO parameters
python scripts/setup_aco_integration.py --configure

# Test ACO algorithms
python scripts/setup_aco_integration.py --test

# Validate ACO integration
python scripts/setup_aco_integration.py --validate
```

**Features**:
- ✅ **Algorithm Integration**: Integrates ACO algorithms with platform
- ✅ **Parameter Configuration**: Configures ACO algorithm parameters
- ✅ **Performance Testing**: Tests ACO algorithm performance
- ✅ **Optimization Validation**: Validates optimization results
- ✅ **Integration Testing**: Tests integration with existing systems
- ✅ **Documentation**: Provides ACO integration documentation

---

### `documentation_automation.py`
**Purpose**: Documentation generation automation and maintenance

**Description**:
- Automated documentation generation from code and configuration
- Maintains up-to-date API documentation and user guides
- Generates deployment and operational documentation
- Provides documentation validation and quality checks

**Usage**:
```bash
# Generate all documentation
python scripts/documentation_automation.py

# Generate API documentation only
python scripts/documentation_automation.py --api-only

# Update existing documentation
python scripts/documentation_automation.py --update

# Validate documentation quality
python scripts/documentation_automation.py --validate
```

**Features**:
- ✅ **API Documentation**: Automated API documentation generation
- ✅ **Code Documentation**: Generates documentation from code comments
- ✅ **User Guides**: Creates and maintains user documentation
- ✅ **Deployment Docs**: Generates deployment and operational guides
- ✅ **Quality Validation**: Validates documentation completeness and quality
- ✅ **Multi-Format**: Supports multiple documentation formats

---

### `integration_helper.py`
**Purpose**: Integration testing helper and automation tool

**Description**:
- Provides comprehensive integration testing capabilities
- Automates integration test setup and execution
- Validates service integrations and API connectivity
- Supports end-to-end integration testing workflows

**Usage**:
```bash
# Run all integration tests
python scripts/integration_helper.py

# Test specific integration
python scripts/integration_helper.py --service database

# Setup integration test environment
python scripts/integration_helper.py --setup

# Generate integration test report
python scripts/integration_helper.py --report
```

**Features**:
- ✅ **Service Integration**: Tests integration between services
- ✅ **API Testing**: Comprehensive API integration testing
- ✅ **Database Integration**: Tests database connectivity and operations
- ✅ **End-to-End Testing**: Complete workflow integration testing
- ✅ **Test Automation**: Automated test execution and reporting
- ✅ **Environment Management**: Integration test environment setup

---

### `validate_nextjs_routing.js`
**Purpose**: Next.js routing validation and testing tool

**Description**:
- Validates Next.js application routing configuration
- Tests route accessibility and functionality
- Provides routing performance analysis
- Ensures proper routing setup and navigation

**Usage**:
```bash
# Validate all routes
node scripts/validate_nextjs_routing.js

# Test specific route
node scripts/validate_nextjs_routing.js --route /dashboard

# Performance analysis
node scripts/validate_nextjs_routing.js --performance

# Generate routing report
node scripts/validate_nextjs_routing.js --report
```

**Features**:
- ✅ **Route Validation**: Validates all application routes
- ✅ **Accessibility Testing**: Tests route accessibility and navigation
- ✅ **Performance Analysis**: Analyzes routing performance
- ✅ **Configuration Validation**: Validates routing configuration
- ✅ **Error Detection**: Identifies routing issues and errors
- ✅ **Report Generation**: Generates comprehensive routing reports

---

## 🔧 Code Quality & Fix Scripts

### `upgrade_fastapi_python313.py`
**Purpose**: FastAPI Python 3.13 upgrade automation and compatibility fixes

**Description**:
- Automates FastAPI upgrade to Python 3.13 compatibility
- Fixes compatibility issues and deprecated features
- Updates dependencies and configuration for Python 3.13
- Provides comprehensive upgrade validation and testing

**Usage**:
```bash
# Upgrade FastAPI to Python 3.13
python scripts/upgrade_fastapi_python313.py

# Dry run upgrade analysis
python scripts/upgrade_fastapi_python313.py --dry-run

# Validate upgrade compatibility
python scripts/upgrade_fastapi_python313.py --validate

# Rollback upgrade changes
python scripts/upgrade_fastapi_python313.py --rollback
```

**Features**:
- ✅ **Compatibility Fixes**: Fixes Python 3.13 compatibility issues
- ✅ **Dependency Updates**: Updates all dependencies for Python 3.13
- ✅ **Configuration Updates**: Updates configuration for new Python version
- ✅ **Validation Testing**: Comprehensive upgrade validation
- ✅ **Rollback Support**: Safe rollback of upgrade changes
- ✅ **Migration Guide**: Provides upgrade migration guidance

---

### `verify_and_cleanup_fixes.py`
**Purpose**: Fix verification and cleanup automation tool

**Description**:
- Verifies applied fixes and ensures proper implementation
- Cleans up temporary files and artifacts from fix processes
- Validates fix effectiveness and system stability
- Provides comprehensive fix reporting and documentation

**Usage**:
```bash
# Verify all applied fixes
python scripts/verify_and_cleanup_fixes.py

# Cleanup fix artifacts
python scripts/verify_and_cleanup_fixes.py --cleanup

# Generate fix report
python scripts/verify_and_cleanup_fixes.py --report

# Validate system stability
python scripts/verify_and_cleanup_fixes.py --validate
```

**Features**:
- ✅ **Fix Verification**: Verifies effectiveness of applied fixes
- ✅ **Cleanup Automation**: Cleans up temporary files and artifacts
- ✅ **Stability Testing**: Tests system stability after fixes
- ✅ **Report Generation**: Generates comprehensive fix reports
- ✅ **Rollback Detection**: Identifies fixes that need rollback
- ✅ **Documentation**: Documents fix history and outcomes

---

### `fix_circular_imports.py`
**Purpose**: Circular import detection and resolution tool

**Description**:
- Detects circular import dependencies in Python code
- Provides automated resolution strategies for circular imports
- Analyzes import structure and suggests refactoring
- Ensures clean import architecture and dependency management

**Usage**:
```bash
# Detect circular imports
python scripts/fix_circular_imports.py

# Fix detected circular imports
python scripts/fix_circular_imports.py --fix

# Analyze import structure
python scripts/fix_circular_imports.py --analyze

# Generate import dependency report
python scripts/fix_circular_imports.py --report
```

**Features**:
- ✅ **Circular Import Detection**: Identifies circular import patterns
- ✅ **Automated Resolution**: Provides automated fix strategies
- ✅ **Import Analysis**: Analyzes complete import structure
- ✅ **Refactoring Suggestions**: Suggests code refactoring approaches
- ✅ **Dependency Mapping**: Creates import dependency maps
- ✅ **Architecture Validation**: Validates import architecture

---

### `fix_dependencies_and_imports.py`
**Purpose**: Comprehensive dependency and import management tool

**Description**:
- Manages Python dependencies and import statements
- Fixes import errors and dependency conflicts
- Updates import statements and dependency versions
- Provides comprehensive dependency analysis and management

**Usage**:
```bash
# Fix all dependency and import issues
python scripts/fix_dependencies_and_imports.py

# Update dependencies only
python scripts/fix_dependencies_and_imports.py --dependencies

# Fix import statements only
python scripts/fix_dependencies_and_imports.py --imports

# Analyze dependency conflicts
python scripts/fix_dependencies_and_imports.py --analyze
```

**Features**:
- ✅ **Dependency Management**: Manages Python package dependencies
- ✅ **Import Fixing**: Fixes import statement errors
- ✅ **Conflict Resolution**: Resolves dependency conflicts
- ✅ **Version Management**: Manages dependency versions
- ✅ **Compatibility Checking**: Checks dependency compatibility
- ✅ **Automated Updates**: Automated dependency updates

---

### `fix_import_paths.py`
**Purpose**: Import path correction and standardization tool

**Description**:
- Corrects import paths and ensures proper module resolution
- Standardizes import path formats across the codebase
- Fixes relative and absolute import path issues
- Provides import path validation and optimization

**Usage**:
```bash
# Fix all import paths
python scripts/fix_import_paths.py

# Fix relative import paths
python scripts/fix_import_paths.py --relative

# Fix absolute import paths
python scripts/fix_import_paths.py --absolute

# Validate import paths
python scripts/fix_import_paths.py --validate
```

**Features**:
- ✅ **Path Correction**: Corrects incorrect import paths
- ✅ **Standardization**: Standardizes import path formats
- ✅ **Relative/Absolute**: Handles both relative and absolute imports
- ✅ **Module Resolution**: Ensures proper module resolution
- ✅ **Path Validation**: Validates import path correctness
- ✅ **Optimization**: Optimizes import path structure

---

### `fix_pyrefly_errors.py`
**Purpose**: Pyrefly-specific error resolution and compatibility fixes

**Description**:
- Fixes Pyrefly-specific errors and compatibility issues
- Resolves Pyrefly integration problems
- Updates Pyrefly configuration and dependencies
- Provides Pyrefly troubleshooting and error resolution

**Usage**:
```bash
# Fix all Pyrefly errors
python scripts/fix_pyrefly_errors.py

# Fix specific error type
python scripts/fix_pyrefly_errors.py --error-type config

# Validate Pyrefly integration
python scripts/fix_pyrefly_errors.py --validate

# Update Pyrefly configuration
python scripts/fix_pyrefly_errors.py --update-config
```

**Features**:
- ✅ **Error Resolution**: Fixes Pyrefly-specific errors
- ✅ **Integration Fixes**: Resolves Pyrefly integration issues
- ✅ **Configuration Updates**: Updates Pyrefly configuration
- ✅ **Compatibility Fixes**: Ensures Pyrefly compatibility
- ✅ **Troubleshooting**: Provides Pyrefly troubleshooting tools
- ✅ **Validation**: Validates Pyrefly setup and configuration

---

### `fix_remaining_test_errors.py`
**Purpose**: Test error resolution and test suite maintenance tool

**Description**:
- Identifies and fixes remaining test errors and failures
- Provides comprehensive test suite maintenance and optimization
- Fixes test configuration and setup issues
- Ensures test suite reliability and consistency

**Usage**:
```bash
# Fix all remaining test errors
python scripts/fix_remaining_test_errors.py

# Fix specific test category
python scripts/fix_remaining_test_errors.py --category unit

# Analyze test failures
python scripts/fix_remaining_test_errors.py --analyze

# Optimize test suite
python scripts/fix_remaining_test_errors.py --optimize
```

**Features**:
- ✅ **Error Resolution**: Fixes test errors and failures
- ✅ **Test Maintenance**: Maintains and optimizes test suite
- ✅ **Configuration Fixes**: Fixes test configuration issues
- ✅ **Reliability Improvement**: Improves test reliability
- ✅ **Performance Optimization**: Optimizes test execution
- ✅ **Coverage Analysis**: Analyzes test coverage and gaps

---

## 📊 Data Seeding & Management Scripts

### `seed_test_data.py`
**Purpose**: Comprehensive test data seeding for development and testing

**Description**:
- Seeds comprehensive test data for development and testing environments
- Provides realistic test data scenarios and edge cases
- Supports multiple data categories and relationships
- Ensures consistent test data across environments

**Usage**:
```bash
# Seed all test data
python scripts/seed_test_data.py

# Seed specific data category
python scripts/seed_test_data.py --category users

# Reset and reseed data
python scripts/seed_test_data.py --reset

# Validate seeded data
python scripts/seed_test_data.py --validate
```

**Features**:
- ✅ **Comprehensive Data**: Seeds all necessary test data categories
- ✅ **Realistic Scenarios**: Provides realistic test data scenarios
- ✅ **Relationship Management**: Maintains data relationships and integrity
- ✅ **Edge Case Coverage**: Includes edge cases and boundary conditions
- ✅ **Environment Consistency**: Ensures consistent data across environments
- ✅ **Data Validation**: Validates seeded data integrity

---

### `seed_demo_users.py`
**Purpose**: Demo user data seeding for demonstrations and testing

**Description**:
- Seeds demo user accounts for demonstrations and presentations
- Creates users with various roles and permission levels
- Provides realistic user profiles and activity data
- Supports demo scenario setup and configuration

**Usage**:
```bash
# Seed demo users
python scripts/seed_demo_users.py

# Seed specific user roles
python scripts/seed_demo_users.py --roles admin,user

# Create demo scenarios
python scripts/seed_demo_users.py --scenarios

# Reset demo users
python scripts/seed_demo_users.py --reset
```

**Features**:
- ✅ **Demo User Creation**: Creates realistic demo user accounts
- ✅ **Role Management**: Creates users with various roles and permissions
- ✅ **Profile Data**: Provides realistic user profiles and information
- ✅ **Activity Simulation**: Simulates user activity and interactions
- ✅ **Scenario Support**: Supports demo scenario setup
- ✅ **Reset Capability**: Easy reset and recreation of demo data

---

### `seed_activities.py`
**Purpose**: Activity data seeding for user engagement and analytics

**Description**:
- Seeds user activity data for engagement analytics
- Creates realistic activity patterns and user interactions
- Provides activity data for testing analytics and reporting
- Supports various activity types and engagement metrics

**Usage**:
```bash
# Seed activity data
python scripts/seed_activities.py

# Seed specific activity types
python scripts/seed_activities.py --types login,interaction

# Generate activity patterns
python scripts/seed_activities.py --patterns

# Validate activity data
python scripts/seed_activities.py --validate
```

**Features**:
- ✅ **Activity Generation**: Generates realistic user activity data
- ✅ **Pattern Creation**: Creates realistic activity patterns
- ✅ **Analytics Support**: Provides data for analytics and reporting
- ✅ **Engagement Metrics**: Supports engagement metric calculation
- ✅ **Time-based Data**: Creates time-based activity sequences
- ✅ **User Interaction**: Simulates user interactions and behaviors

---

### `seed_analytics_data.py`
**Purpose**: Analytics data seeding for reporting and business intelligence

**Description**:
- Seeds analytics data for reporting and business intelligence testing
- Creates metrics, KPIs, and performance data
- Provides historical data for trend analysis
- Supports dashboard and reporting system testing

**Usage**:
```bash
# Seed analytics data
python scripts/seed_analytics_data.py

# Seed specific metrics
python scripts/seed_analytics_data.py --metrics performance,usage

# Generate historical data
python scripts/seed_analytics_data.py --historical

# Create dashboard data
python scripts/seed_analytics_data.py --dashboard
```

**Features**:
- ✅ **Metrics Generation**: Generates business metrics and KPIs
- ✅ **Historical Data**: Creates historical data for trend analysis
- ✅ **Dashboard Support**: Provides data for dashboard testing
- ✅ **Performance Metrics**: Creates performance and usage metrics
- ✅ **Trend Simulation**: Simulates data trends and patterns
- ✅ **BI Testing**: Supports business intelligence system testing

---

### `seed_behavioral_data.py`
**Purpose**: Behavioral data seeding for AI/ML model training and testing

**Description**:
- Seeds behavioral data for AI/ML model training and validation
- Creates user behavior patterns and interaction data
- Provides data for behavioral analysis and prediction models
- Supports machine learning algorithm testing and validation

**Usage**:
```bash
# Seed behavioral data
python scripts/seed_behavioral_data.py

# Seed specific behavior types
python scripts/seed_behavioral_data.py --types navigation,interaction

# Generate behavior patterns
python scripts/seed_behavioral_data.py --patterns

# Create ML training data
python scripts/seed_behavioral_data.py --ml-training
```

**Features**:
- ✅ **Behavior Simulation**: Simulates realistic user behaviors
- ✅ **Pattern Generation**: Creates behavioral patterns and sequences
- ✅ **ML Data Support**: Provides data for machine learning training
- ✅ **Prediction Testing**: Supports behavioral prediction model testing
- ✅ **Analysis Support**: Enables behavioral analysis and insights
- ✅ **Model Validation**: Supports AI/ML model validation

---

### `seed_aiml_data.py`
**Purpose**: Comprehensive AI/ML data seeding for model training and testing

**Description**:
- Seeds comprehensive AI/ML training and testing data
- Creates datasets for various machine learning algorithms
- Provides labeled data for supervised learning models
- Supports deep learning and neural network training data

**Usage**:
```bash
# Seed AI/ML data
python scripts/seed_aiml_data.py

# Seed specific model data
python scripts/seed_aiml_data.py --model classification

# Generate training datasets
python scripts/seed_aiml_data.py --training

# Create validation data
python scripts/seed_aiml_data.py --validation
```

**Features**:
- ✅ **Dataset Creation**: Creates comprehensive ML datasets
- ✅ **Labeled Data**: Provides labeled data for supervised learning
- ✅ **Model Support**: Supports various ML model types
- ✅ **Training/Validation**: Creates training and validation datasets
- ✅ **Feature Engineering**: Supports feature engineering and selection
- ✅ **Algorithm Testing**: Enables ML algorithm testing and validation

---

### `seed_aiml_data_simple.py`
**Purpose**: Simple AI/ML data seeding for basic model testing

**Description**:
- Provides simple AI/ML data seeding for basic model testing
- Creates lightweight datasets for quick model validation
- Supports basic machine learning algorithm testing
- Provides simple data for proof-of-concept development

**Usage**:
```bash
# Seed simple AI/ML data
python scripts/seed_aiml_data_simple.py

# Create basic classification data
python scripts/seed_aiml_data_simple.py --classification

# Generate regression data
python scripts/seed_aiml_data_simple.py --regression

# Create clustering data
python scripts/seed_aiml_data_simple.py --clustering
```

**Features**:
- ✅ **Simple Datasets**: Creates simple, lightweight datasets
- ✅ **Quick Testing**: Enables quick model testing and validation
- ✅ **Basic Algorithms**: Supports basic ML algorithm testing
- ✅ **Proof of Concept**: Supports POC development and testing
- ✅ **Educational Use**: Suitable for learning and educational purposes
- ✅ **Fast Generation**: Quick data generation for rapid prototyping

---

### `simple_seed.py`
**Purpose**: Simple data seeding utility for basic development needs

**Description**:
- Provides simple data seeding for basic development and testing
- Creates minimal viable data for application functionality
- Supports quick setup of development environments
- Provides essential data for basic application testing

**Usage**:
```bash
# Simple data seeding
python scripts/simple_seed.py

# Seed minimal data
python scripts/simple_seed.py --minimal

# Reset and reseed
python scripts/simple_seed.py --reset

# Validate seeded data
python scripts/simple_seed.py --validate
```

**Features**:
- ✅ **Simple Setup**: Quick and simple data seeding
- ✅ **Minimal Data**: Creates minimal viable data sets
- ✅ **Fast Execution**: Quick execution for rapid development
- ✅ **Basic Testing**: Supports basic application testing
- ✅ **Development Focus**: Optimized for development environments
- ✅ **Easy Reset**: Simple data reset and recreation

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

### `create_platform_owner.py`
**Purpose**: Creates a new Platform Owner user with full SQLAlchemy integration

**Description**:
- Creates a comprehensive Platform Owner user account
- Uses SQLAlchemy models and proper password hashing
- Handles both new user creation and existing user updates
- Integrates with the main application's authentication system

**Usage**:
```bash
# Create new Platform Owner user
python scripts/create_platform_owner.py
```

**Features**:
- ✅ **SQLAlchemy Integration**: Uses app models and database configuration
- ✅ **Secure Password Hashing**: Uses platform authentication service
- ✅ **Duplicate Prevention**: Checks for existing users before creation
- ✅ **Full User Profile**: Sets all necessary user attributes
- ✅ **Subscription Management**: Configures platform owner subscription tier

**Default Credentials**:
- Email: `owner@digame.com`
- Password: `PlatformOwner123!`
- Username: `owner`
- Platform Owner Level: 3 (highest)

---

### `create_simple_platform_owner.py`
**Purpose**: Creates a Platform Owner user with direct SQLite operations

**Description**:
- Lightweight Platform Owner creation using direct SQLite commands
- Bypasses SQLAlchemy for simple, fast user creation
- Uses basic password hashing for development environments
- Ideal for quick setup and testing scenarios

**Usage**:
```bash
# Create Platform Owner with direct SQLite
python scripts/create_simple_platform_owner.py
```

**Features**:
- ✅ **Direct SQLite Access**: No ORM dependencies required
- ✅ **Simple Password Hashing**: Uses SHA256 for basic security
- ✅ **Minimal Dependencies**: Only requires sqlite3 and hashlib
- ✅ **Quick Setup**: Fast user creation for development
- ✅ **Update Capability**: Can update existing users to Platform Owner

**Default Credentials**:
- Email: `owner@digame.com`
- Password: `PlatformOwner123!`
- Username: `owner`
- Platform Owner Level: 3 (highest)

---

### `check_user_credentials.py`
**Purpose**: Comprehensive user credential verification and database inspection

**Description**:
- Searches for specific users by email address
- Displays complete user profile information
- Lists all users in the database for overview
- Uses SQLAlchemy for safe database access

**Usage**:
```bash
# Check specific user credentials (default: philip.a.oshea@gmail.com)
python scripts/check_user_credentials.py
```

**Features**:
- ✅ **User Search**: Finds users by email address
- ✅ **Complete Profile Display**: Shows all user attributes safely
- ✅ **Password Security**: Displays password hash status without exposing data
- ✅ **User Listing**: Shows all users in database
- ✅ **SQLAlchemy Integration**: Uses app models and database configuration

**Information Displayed**:
- User ID, username, email, names
- Account status (active, verified, guest)
- Platform owner status and level
- Subscription tier and status
- Login history and failed attempts
- Onboarding completion status

---

### `check_backend_db.py`
**Purpose**: Node.js backend database inspection and user verification

**Description**:
- Specifically checks the Node.js backend SQLite database
- Searches for users in the backend system
- Provides database file verification and user listing
- Designed for hybrid Python/Node.js environments

**Usage**:
```bash
# Check Node.js backend database for specific user
python scripts/check_backend_db.py
```

**Features**:
- ✅ **Backend Database Access**: Connects to `backend/data/digame.db`
- ✅ **File Verification**: Checks database file existence
- ✅ **User Search**: Searches for specific email addresses
- ✅ **Security Conscious**: Truncates password hashes in output
- ✅ **Fallback Listing**: Shows all users if target not found

**Target User**: `philip.a.oshea@gmail.com` (configurable in script)

**Database Path**: `backend/data/digame.db`

---

### `fix_platform_owner_onboarding.py`
**Purpose**: Fixes onboarding status for Platform Owner users in Node.js backend

**Description**:
- Updates onboarding completion status in the Node.js backend database
- Sets comprehensive onboarding data with realistic preferences
- Specifically targets Platform Owner users
- Provides verification of updates

**Usage**:
```bash
# Fix Platform Owner onboarding status
python scripts/fix_platform_owner_onboarding.py
```

**Features**:
- ✅ **Backend Database Updates**: Modifies Node.js backend database directly
- ✅ **Onboarding Completion**: Sets onboardingCompleted to true
- ✅ **Realistic Data**: Includes comprehensive onboarding preferences
- ✅ **Role-Specific**: Targets users with 'platform_owner' role
- ✅ **Update Verification**: Confirms changes were applied successfully

**Onboarding Data Set**:
- Interests: Analytics, AI, Productivity, Team Management
- Goals: Productivity, Data Insights, Team Optimization
- Experience Level: Expert
- Team Choice: Create Team

**Target User**: `philip.a.oshea@gmail.com` with role 'platform_owner'

---

### `check_db_schema.py`
**Purpose**: Comprehensive database schema inspection and analysis

**Description**:
- Examines the actual database structure and contents
- Lists all tables with their column definitions and data types
- Shows row counts and sample data for verification
- Provides detailed schema information for troubleshooting

**Usage**:
```bash
# Inspect complete database schema
python scripts/check_db_schema.py
```

**Features**:
- ✅ **Complete Schema Analysis**: Shows all tables and their structures
- ✅ **Column Details**: Displays data types, constraints, and defaults
- ✅ **Row Counting**: Shows record counts for each table
- ✅ **Sample Data**: Displays sample records from users table
- ✅ **Database Verification**: Confirms database file existence and accessibility

**Information Displayed**:
- Table names and structures
- Column names, types, and constraints
- Primary keys and NOT NULL constraints
- Default values and row counts
- Sample user data (with password hash truncation)

---

### `fix_platform_owner_password.py`
**Purpose**: Updates Platform Owner password with proper bcrypt hashing

**Description**:
- Fixes password hashing issues for Platform Owner accounts
- Uses proper bcrypt hashing compatible with the application
- Updates existing Platform Owner accounts with secure password hashes
- Ensures authentication compatibility with the main application

**Usage**:
```bash
# Fix Platform Owner password hashing
python scripts/fix_platform_owner_password.py
```

**Features**:
- ✅ **Bcrypt Hashing**: Uses proper bcrypt algorithm for security
- ✅ **Password Context**: Uses same hashing context as main application
- ✅ **Secure Updates**: Updates password hash safely in database
- ✅ **Verification**: Confirms successful password update
- ✅ **Error Handling**: Provides rollback on failure

**Target Account**:
- Email: `owner@digame.com`
- Password: `PlatformOwner123!`
- Uses bcrypt hashing with proper salt rounds

---

### `get_user_details.py`
**Purpose**: Retrieves detailed information for a specific user by ID

**Description**:
- Fetches complete user profile information by user ID
- Displays all user attributes in a readable format
- Provides secure handling of sensitive information
- Useful for debugging and user account verification

**Usage**:
```bash
# Get details for specific user (default: ID 2)
python scripts/get_user_details.py
```

**Features**:
- ✅ **User ID Lookup**: Finds users by their database ID
- ✅ **Complete Profile**: Shows all user table columns
- ✅ **Security Conscious**: Truncates password hashes for safety
- ✅ **Column Mapping**: Uses proper column names for display
- ✅ **Error Handling**: Graceful handling of missing users

**Default Target**: User ID 2 (`poshea100@hotmail.com`)

**Information Displayed**:
- All user table columns and values
- Truncated password hash for security
- Account status and configuration details

---

### `simple_user_check.py`
**Purpose**: Simple and direct users table inspection

**Description**:
- Provides straightforward access to users table information
- Checks table existence and structure
- Searches for specific users and lists all users
- Designed for quick database verification and troubleshooting

**Usage**:
```bash
# Check users table and search for specific user
python scripts/simple_user_check.py
```

**Features**:
- ✅ **Table Verification**: Confirms users table exists
- ✅ **Schema Display**: Shows table structure and column types
- ✅ **User Search**: Looks for specific email addresses
- ✅ **User Listing**: Shows all users when target not found
- ✅ **Fallback Information**: Lists available tables if users table missing

**Target User**: `philip.a.oshea@gmail.com` (configurable in script)

**Fallback Behavior**:
- Lists all available tables if users table doesn't exist
- Shows all users if target user not found
- Provides comprehensive database overview

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

## 📊 Data Management & Migration Scripts

### `data-migration/migrate_mock_to_production.py`
**Purpose**: Comprehensive production migration tool for transitioning from development to production

**Description**:
- Migrates from development environment with mock data to clean production environment
- Provides comprehensive pre-migration analysis and safety validation
- Performs selective mock data cleanup while preserving real user data
- Optimizes database for production use with indexing and statistics updates
- Generates detailed migration reports with metrics and recommendations

**Usage**:
```bash
# Dry run to see what would be done (recommended first step)
python scripts/data-migration/migrate_mock_to_production.py --dry-run

# Full migration with backup (production deployment)
python scripts/data-migration/migrate_mock_to_production.py --backup-first

# Migration preserving all users
python scripts/data-migration/migrate_mock_to_production.py --preserve-users

# Migration with custom database path
python scripts/data-migration/migrate_mock_to_production.py --db-path /path/to/database.db

# Verbose logging for debugging
python scripts/data-migration/migrate_mock_to_production.py --verbose
```

**Features**:
- ✅ **Pre-Migration Analysis**: Comprehensive database state analysis with statistics
- ✅ **Safety Validation**: Critical data identification and protection mechanisms
- ✅ **Mock Data Cleanup**: Selective removal of mock data with user preservation options
- ✅ **Database Optimization**: Production-ready index creation and statistics updates
- ✅ **Comprehensive Reporting**: Detailed migration reports with before/after metrics
- ✅ **Dry-Run Mode**: Safe testing without data modification for validation
- ✅ **Backup Integration**: Automatic pre-migration backups with compression
- ✅ **Error Handling**: Comprehensive error handling with rollback capabilities

**Migration Process**:
1. **Database Analysis**: Analyzes current data distribution (mock vs real)
2. **Critical Data Identification**: Identifies platform owners and essential users
3. **Safety Validation**: Validates migration can be performed safely
4. **Backup Creation**: Creates compressed backup before any changes
5. **Mock Data Cleanup**: Removes mock data while preserving real data
6. **Database Optimization**: Applies production indexes and optimizations
7. **Report Generation**: Creates comprehensive migration report

**Safety Features**:
- Platform owner validation (ensures at least one exists)
- Mock data ratio analysis with warnings
- Real user data protection
- Automatic backup creation
- Confirmation prompts for destructive operations
- Comprehensive audit logging

**Output Files**:
- Compressed backup: `backups/migration/pre_migration_backup_YYYYMMDD_HHMMSS.db.gz`
- Migration report: `backups/migration/migration_report_YYYYMMDD_HHMMSS.txt`
- Migration log: `migration_YYYYMMDD_HHMMSS.log`

---

### `data-migration/validate_data_integrity.py`
**Purpose**: Comprehensive data integrity validation and automated repair tool

**Description**:
- Validates data integrity after migration or cleanup operations
- Performs 8 different categories of integrity checks
- Identifies and optionally fixes common data integrity issues
- Generates detailed JSON reports with findings and recommendations
- Ensures database is in consistent and healthy state for production

**Usage**:
```bash
# Basic integrity validation
python scripts/data-migration/validate_data_integrity.py

# Validation with automatic issue fixing
python scripts/data-migration/validate_data_integrity.py --fix-issues

# Report-only mode (no fixes applied)
python scripts/data-migration/validate_data_integrity.py --report-only

# Custom database path
python scripts/data-migration/validate_data_integrity.py --db-path /path/to/database.db

# Verbose logging for detailed analysis
python scripts/data-migration/validate_data_integrity.py --verbose

# Custom output file for report
python scripts/data-migration/validate_data_integrity.py --output-file custom_report.json
```

**Features**:
- ✅ **Table Existence Validation**: Ensures all expected tables are present
- ✅ **Foreign Key Constraint Checking**: Validates referential integrity across tables
- ✅ **Data Consistency Analysis**: Identifies orphaned and inconsistent records
- ✅ **Mock Data Flagging Validation**: Ensures proper data categorization and flagging
- ✅ **Database Integrity Checks**: SQLite integrity validation and corruption detection
- ✅ **Automated Fixes**: Optional automatic repair of detected issues
- ✅ **Comprehensive Reporting**: JSON reports with detailed findings and recommendations
- ✅ **Exit Code Handling**: Proper exit codes for CI/CD integration

**Validation Categories**:
1. **Table Existence**: Verifies all 20+ expected tables are present
2. **Foreign Key Constraints**: Checks for constraint violations
3. **Data Consistency**: Identifies orphaned records across related tables
4. **Mock Data Flagging**: Validates proper `is_mock_data` flag usage
5. **Database Integrity**: SQLite PRAGMA integrity_check validation
6. **Orphaned Records**: Detects records without valid parent relationships
7. **NULL Flag Issues**: Identifies missing or incorrect mock data flags
8. **Schema Validation**: Confirms expected database structure

**Automated Fixes Available**:
- **Orphaned Record Cleanup**: Removes records without valid parent relationships
- **NULL Flag Correction**: Sets missing `is_mock_data` flags to FALSE
- **Constraint Violation Resolution**: Fixes foreign key constraint issues

**Expected Tables Validated**:
- Core: `users`, `notifications`, `notification_settings`
- Productivity: `tasks`, `projects`, `workflows`
- Collaboration: `teams`, `team_members`, `skills`, `user_skills`, `mentorship_relationships`
- Analytics: `analytics_events`, `reports`, `platform_metrics`
- Security: `audit_logs`, `api_keys`, `webhooks`
- Platform: `tenants`, `data_management_operations`, `data_backups`

**Report Format**:
```json
{
  "timestamp": "2025-01-05T11:18:00Z",
  "overall_status": "passed|warning|failed|error",
  "checks_performed": [...],
  "issues_found": [...],
  "fixes_applied": [...],
  "recommendations": [...]
}
```

**Exit Codes**:
- `0`: All checks passed
- `1`: Critical failures detected
- `2`: Warnings found (non-critical issues)

---

## 🚀 Common Use Cases

### **Frontend-Backend Integration Development Workflow**
```bash
# 1. Start integrated development environment
./scripts/start-dev.sh

# 2. Verify backend health and API connectivity
curl http://localhost:8000/health

# 3. Test frontend-backend integration
curl http://localhost:3000/api/health

# 4. Stop development environment cleanly
./scripts/stop-dev.sh
```

### **E2E Testing with Backend Services Workflow**
```bash
# 1. Setup test environment with backend services
./scripts/setup-test-env.sh

# 2. Run E2E tests with Playwright
cd frontend && npm run test:e2e

# 3. Cleanup test environment
./scripts/cleanup-test-env.sh
```

### **Development Environment Setup**
```bash
# 1. Start interactive development environment
./scripts/start-dev.sh

# 2. Fix any UI import casing issues
./scripts/fix-all-imports.sh

# 3. Run frontend tests
./scripts/run_frontend_tests.sh

# 4. Test API endpoints
python scripts/test_team_endpoints.py
```

### **Frontend Development Workflow**
```bash
# 1. Fix UI component import casing (comprehensive)
./scripts/fix-all-imports.sh

# 2. Quick fix for basic components only
./scripts/fix-imports.sh

# 3. Advanced fix with detailed verification
./scripts/fix-ui-imports.sh

# 4. Run frontend tests to verify fixes
./scripts/run_frontend_tests.sh
```

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

# 2. Create Platform Owner (SQLAlchemy method)
python scripts/create_platform_owner.py

# 3. Or create Platform Owner (Simple SQLite method)
python scripts/create_simple_platform_owner.py

# 4. Update admin privileges
python scripts/update_admin_platform_owner.py

# 5. Verify user credentials
python scripts/check_user_credentials.py

# 6. Verify API endpoints
python scripts/test_team_endpoints.py
```

### **Database Inspection and Troubleshooting**
```bash
# 1. Check complete database schema and structure
python scripts/check_db_schema.py

# 2. Check main application database users
python scripts/check_user_credentials.py

# 3. Simple users table inspection
python scripts/simple_user_check.py

# 4. Check Node.js backend database
python scripts/check_backend_db.py

# 5. Get specific user details by ID
python scripts/get_user_details.py

# 6. Fix Platform Owner password hashing
python scripts/fix_platform_owner_password.py

# 7. Fix Platform Owner onboarding issues
python scripts/fix_platform_owner_onboarding.py

# 8. Verify database tables and structure
python scripts/create_tables.py
```

### **Platform Owner Setup Workflow**
```bash
# 1. Create Platform Owner account
python scripts/create_platform_owner.py

# 2. Verify account creation
python scripts/check_user_credentials.py

# 3. Fix onboarding if using Node.js backend
python scripts/fix_platform_owner_onboarding.py

# 4. Test API access
python scripts/test_team_endpoints.py
```

### **Database Schema Management Workflow**
```bash
# 1. Check current schema for issues
python scripts/check_db_schema.py

# 2. Fix table definition issues
python scripts/fix_table_definitions.py --dry-run
python scripts/fix_table_definitions.py

# 3. Test migrations after fixes
python scripts/test_migrations.py

# 4. Validate data integrity
python scripts/data-migration/validate_data_integrity.py
```

### **API Integration Testing Workflow**
```bash
# 1. Test all API keys and services
python scripts/test_api_keys.py

# 2. Test specific API service
python scripts/test_api_keys.py --service openai

# 3. Test team collaboration endpoints
python scripts/test_team_endpoints.py

# 4. Run comprehensive API validation
python scripts/test_api_keys.py --verbose
```

### **Complete Development Environment Setup Workflow**
```bash
# 1. Activate Digame environment
source ./scripts/activate_digame.sh

# 2. Setup development environment
python scripts/setup_dev_env.py

# 3. Setup Platform Owner
python scripts/setup_platform_owner.py

# 4. Seed test data
python scripts/seed_test_data.py

# 5. Start development environment
./scripts/start-dev.sh

# 6. Validate setup
python scripts/integration_helper.py --validate
```

### **Production Deployment Workflow**
```bash
# 1. Validate pipeline before deployment
./scripts/validate_pipeline.sh

# 2. Run health checks
./scripts/health-checks.sh

# 3. Create production backup
python scripts/production_backup.py

# 4. Deploy to production
./scripts/deploy-production.sh

# 5. Monitor deployment health
python scripts/production_health_monitor.py

# 6. Validate deployment
python scripts/production_environment.py validate
```

### **Performance Testing and Monitoring Workflow**
```bash
# 1. Run performance tests
./scripts/run-performance-tests.sh

# 2. Monitor system resources
./scripts/system-monitor.sh --check

# 3. Check infrastructure health
./scripts/health-checks.sh

# 4. Generate performance report
./scripts/run-performance-tests.sh --report

# 5. Monitor production health
python scripts/production_health_monitor.py --status
```

### **Code Quality and Fix Workflow**
```bash
# 1. Fix circular imports
python scripts/fix_circular_imports.py

# 2. Fix dependencies and imports
python scripts/fix_dependencies_and_imports.py

# 3. Fix import paths
python scripts/fix_import_paths.py

# 4. Fix remaining test errors
python scripts/fix_remaining_test_errors.py

# 5. Verify and cleanup fixes
python scripts/verify_and_cleanup_fixes.py

# 6. Validate Next.js routing
node scripts/validate_nextjs_routing.js
```

### **Data Seeding and Management Workflow**
```bash
# 1. Seed basic test data
python scripts/simple_seed.py

# 2. Seed demo users
python scripts/seed_demo_users.py

# 3. Seed activity data
python scripts/seed_activities.py

# 4. Seed analytics data
python scripts/seed_analytics_data.py

# 5. Seed AI/ML data
python scripts/seed_aiml_data_simple.py

# 6. Validate all seeded data
python scripts/seed_test_data.py --validate
```

### **Docker and Infrastructure Management Workflow**
```bash
# 1. Clean up Docker storage
./scripts/docker-cleanup.sh

# 2. Monitor system resources
./scripts/system-monitor.sh

# 3. Run health checks
./scripts/health-checks.sh

# 4. Deploy environment
./scripts/deploy-environment.sh staging

# 5. Validate deployment
./scripts/validate_pipeline.sh

# 6. Monitor production health
python scripts/production_health_monitor.py
```

### **Documentation and Integration Workflow**
```bash
# 1. Generate documentation
python scripts/documentation_automation.py

# 2. Run integration tests
python scripts/integration_helper.py

# 3. Validate Next.js routing
node scripts/validate_nextjs_routing.js

# 4. Setup ACO integration
python scripts/setup_aco_integration.py

# 5. Upgrade FastAPI to Python 3.13
python scripts/upgrade_fastapi_python313.py --validate

# 6. Verify all fixes and cleanup
python scripts/verify_and_cleanup_fixes.py
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

## 🔗 Related Documentation

- **CLI Workflow Integration**: `/CLI_WORKFLOW_INTEGRATION.md` - Updated CLI commands and workflow integration
- **Main Scripts**: `/scripts/README.md` - Root-level utility scripts
- **Database Migrations**: `/migrations/README.md` - Migration files and history
- **Deployment Guide**: `/docs/DEPLOYMENT.md` - Production deployment procedures
- **Development Setup**: `/docs/DEVELOPMENT.md` - Local development environment

---

## 🔧 E2E Testing & Dynamic Port Management Scripts

### `find-port.js`
**Purpose**: Dynamic port detection utility for conflict-free testing environments

**Description**:
- Detects available ports dynamically to prevent conflicts during E2E testing
- Uses Node.js net module for reliable port availability checking
- Provides fallback port selection with configurable ranges
- Essential for parallel test execution and CI/CD environments

**Usage**:
```bash
# Find available port starting from 3000
node scripts/find-port.js

# Find available port with custom start
node scripts/find-port.js 8000

# Use in scripts for dynamic port allocation
PORT=$(node scripts/find-port.js 3000)
```

**Features**:
- ✅ **Dynamic Detection**: Automatically finds available ports
- ✅ **Conflict Prevention**: Prevents port conflicts in testing
- ✅ **Configurable Range**: Supports custom port ranges
- ✅ **Fast Execution**: Quick port detection for rapid testing
- ✅ **CI/CD Integration**: Designed for automated testing environments
- ✅ **Cross-Platform**: Works on all Node.js supported platforms

**Technical Implementation**:
- Uses Node.js `net.createServer()` for port testing
- Implements promise-based port checking
- Provides fallback mechanisms for port selection
- Returns first available port in specified range

---

### `start-test-server.js`
**Purpose**: Test server startup script with dynamic port management and configuration copying

**Description**:
- Starts Next.js test server with dynamic port detection
- Copies test-specific configuration files for E2E testing
- Manages test environment setup and teardown
- Provides health checks and server readiness validation

**Usage**:
```bash
# Start test server with dynamic port
node scripts/start-test-server.js

# Start with custom configuration
node scripts/start-test-server.js --config test

# Start with specific port range
node scripts/start-test-server.js --port-start 3000

# Verbose logging for debugging
node scripts/start-test-server.js --verbose
```

**Features**:
- ✅ **Dynamic Port Management**: Uses find-port.js for conflict-free ports
- ✅ **Configuration Management**: Copies test-specific Next.js config
- ✅ **Health Monitoring**: Validates server readiness before tests
- ✅ **Environment Setup**: Configures test environment variables
- ✅ **Graceful Shutdown**: Handles cleanup on process termination
- ✅ **Error Handling**: Comprehensive error handling and recovery

**Configuration Management**:
- Copies `next.config.test.js` to `next.config.js` for testing
- Restores original configuration after testing
- Manages environment-specific settings
- Handles configuration validation and backup

**Integration with E2E Tests**:
- Used by Playwright configuration for test server startup
- Provides server URL and port information to tests
- Ensures server is ready before test execution begins
- Manages server lifecycle during test runs

---

## 🗄️ Database Schema & SQLAlchemy Management Scripts

### `fix_database_schema.py`
**Purpose**: SQLAlchemy model conflicts and schema fixes for production readiness

**Description**:
- Resolves SQLAlchemy model conflicts and duplicate class definitions
- Fixes table definition issues and constraint conflicts
- Addresses index conflicts and relationship problems
- Ensures database schema consistency across environments

**Usage**:
```bash
# Fix all SQLAlchemy model conflicts
python scripts/fix_database_schema.py

# Dry run to see what would be fixed
python scripts/fix_database_schema.py --dry-run

# Fix specific model conflicts
python scripts/fix_database_schema.py --model PerformanceAlert

# Verbose output for debugging
python scripts/fix_database_schema.py --verbose
```

**Features**:
- ✅ **Model Conflict Resolution**: Fixes duplicate class definitions
- ✅ **Index Conflict Fixes**: Resolves index naming conflicts
- ✅ **Constraint Validation**: Ensures proper foreign key constraints
- ✅ **Schema Consistency**: Maintains consistent schema across environments
- ✅ **Backup Creation**: Creates backups before making changes
- ✅ **Rollback Support**: Provides rollback capabilities for failed fixes

**Common Fixes Applied**:
- Renames duplicate model classes (e.g., PerformanceAlert → GeneralPerformanceAlert)
- Updates import statements across affected files
- Fixes `__table_args__` configuration for proper table extension
- Resolves foreign key relationship conflicts
- Corrects index naming and constraint definitions

**Integration Points**:
- Works with SQLAlchemy models in `app/models/`
- Updates service files in `app/services/`
- Fixes test files in `tests/`
- Ensures compatibility with Alembic migrations

---

### `test_sqlalchemy_fixes.py`
**Purpose**: SQLAlchemy fixes validation and testing for database integrity

**Description**:
- Validates SQLAlchemy model fixes and schema integrity
- Tests database operations after schema modifications
- Provides comprehensive model relationship testing
- Ensures fixes don't break existing functionality

**Usage**:
```bash
# Test all SQLAlchemy fixes
python scripts/test_sqlalchemy_fixes.py

# Test specific model fixes
python scripts/test_sqlalchemy_fixes.py --model GeneralPerformanceAlert

# Run with detailed validation
python scripts/test_sqlalchemy_fixes.py --detailed

# Generate test report
python scripts/test_sqlalchemy_fixes.py --report
```

**Features**:
- ✅ **Model Validation**: Tests model definitions and relationships
- ✅ **Schema Testing**: Validates database schema integrity
- ✅ **Import Testing**: Tests import statements and dependencies
- ✅ **Relationship Validation**: Ensures foreign key relationships work
- ✅ **Performance Testing**: Tests query performance after fixes
- ✅ **Regression Testing**: Ensures fixes don't break existing functionality

**Test Categories**:
- **Model Import Tests**: Validates all models can be imported without conflicts
- **Schema Creation Tests**: Tests table creation and schema generation
- **Relationship Tests**: Validates foreign key relationships and joins
- **Query Tests**: Tests basic CRUD operations on fixed models
- **Performance Tests**: Measures query performance and optimization
- **Integration Tests**: Tests model integration with services and APIs

**Validation Checks**:
- Confirms no duplicate class definitions exist
- Validates proper `__table_args__` configuration
- Tests foreign key constraint integrity
- Ensures index definitions are correct
- Validates model relationships and joins
- Confirms backward compatibility with existing code

---
## 🐛 Debugging & Troubleshooting Scripts

### `debug_activity_model.py`
**Purpose**: ActivityEnrichedFeature model debugging and testing with multiple import source analysis

**Description**:
- Debugs ActivityEnrichedFeature model import conflicts and registry issues
- Tests multiple import sources to identify SQLAlchemy registry conflicts
- Provides comprehensive model analysis and troubleshooting capabilities
- Helps resolve model definition conflicts in complex SQLAlchemy applications

**Usage**:
```bash
# Debug ActivityEnrichedFeature model issues
python scripts/debug_activity_model.py

# Debug with verbose output
python scripts/debug_activity_model.py --verbose

# Test specific import source
python scripts/debug_activity_model.py --source app.models.analytics
```

**Features**:
- ✅ **Multiple Import Testing**: Tests imports from different module paths
- ✅ **Registry Analysis**: Analyzes SQLAlchemy registry for conflicts
- ✅ **Model Inspection**: Provides detailed model attribute analysis
- ✅ **Conflict Detection**: Identifies duplicate model definitions
- ✅ **Import Path Validation**: Validates correct import paths for models
- ✅ **Troubleshooting Guidance**: Provides specific guidance for resolving issues

**Import Sources Tested**:
- `app.models.analytics.ActivityEnrichedFeature`
- `app.models.ActivityEnrichedFeature`
- Direct model registry inspection
- Alternative import path validation

**Common Issues Resolved**:
- SQLAlchemy registry conflicts between model definitions
- Import path inconsistencies across modules
- Model attribute conflicts and inheritance issues
- Registry state inconsistencies during testing

---

### `debug_imports.py`
**Purpose**: UserRoleAssignment import conflicts debugging with comprehensive registry analysis

**Description**:
- Debugs UserRoleAssignment model import conflicts and SQLAlchemy registry issues
- Provides detailed analysis of import paths and model registration
- Tests multiple import sources to identify the root cause of conflicts
- Offers solutions for resolving complex SQLAlchemy model import issues

**Usage**:
```bash
# Debug UserRoleAssignment import conflicts
python scripts/debug_imports.py

# Debug with detailed registry analysis
python scripts/debug_imports.py --detailed

# Test specific import scenarios
python scripts/debug_imports.py --test-imports
```

**Features**:
- ✅ **Import Conflict Analysis**: Identifies conflicts between different import paths
- ✅ **Registry State Inspection**: Analyzes SQLAlchemy registry state and conflicts
- ✅ **Multiple Import Testing**: Tests various import scenarios and paths
- ✅ **Model Relationship Analysis**: Examines model relationships and dependencies
- ✅ **Error Pattern Recognition**: Identifies common error patterns and solutions
- ✅ **Resolution Strategies**: Provides specific strategies for resolving conflicts

**Import Paths Analyzed**:
- `app.models.user_management.UserRoleAssignment`
- `app.models.UserRoleAssignment`
- Registry-based model access
- Alternative import path validation

**Debugging Capabilities**:
- Model registration state analysis
- Import order dependency testing
- Registry conflict identification
- Model attribute and relationship validation

---

### `debug_models.py`
**Purpose**: SQLAlchemy model diagnostic and troubleshooting for core application models

**Description**:
- Provides comprehensive diagnostic capabilities for core SQLAlchemy models
- Tests model imports, relationships, and database operations
- Identifies and helps resolve model definition and registry conflicts
- Offers detailed analysis of User, Tenant, and Notification models

**Usage**:
```bash
# Run comprehensive model diagnostics
python scripts/debug_models.py

# Debug specific model
python scripts/debug_models.py --model User

# Test model relationships
python scripts/debug_models.py --test-relationships

# Analyze registry state
python scripts/debug_models.py --registry-analysis
```

**Features**:
- ✅ **Core Model Testing**: Tests User, Tenant, Notification, and related models
- ✅ **Relationship Validation**: Validates foreign key relationships and joins
- ✅ **Import Path Testing**: Tests multiple import paths for each model
- ✅ **Registry Diagnostics**: Analyzes SQLAlchemy registry state and conflicts
- ✅ **Database Operation Testing**: Tests basic CRUD operations on models
- ✅ **Comprehensive Reporting**: Provides detailed diagnostic reports

**Models Analyzed**:
- **User**: Core user model with authentication and profile data
- **Tenant**: Multi-tenancy support model
- **Notification**: User notification and messaging model
- **Related Models**: Associated models and relationships

**Diagnostic Categories**:
- Model import and registration validation
- Foreign key relationship testing
- Database schema consistency checks
- Model attribute and method validation
- Registry state and conflict analysis

---

### `debug_test_user.py`
**Purpose**: User model creation debugging in test environment with comprehensive validation

**Description**:
- Debugs User model creation issues specifically in test environments
- Provides detailed analysis of test-specific model creation problems
- Tests user creation workflows and identifies common test environment issues
- Offers solutions for test database setup and user model validation

**Usage**:
```bash
# Debug user creation in test environment
python scripts/debug_test_user.py

# Test with specific user data
python scripts/debug_test_user.py --test-data

# Debug test database setup
python scripts/debug_test_user.py --test-db-setup

# Validate test environment configuration
python scripts/debug_test_user.py --validate-env
```

**Features**:
- ✅ **Test Environment Focus**: Specifically designed for test environment debugging
- ✅ **User Creation Testing**: Tests various user creation scenarios and workflows
- ✅ **Test Database Validation**: Validates test database setup and configuration
- ✅ **Environment Analysis**: Analyzes test environment configuration and dependencies
- ✅ **Error Pattern Recognition**: Identifies common test environment error patterns
- ✅ **Solution Guidance**: Provides specific solutions for test environment issues

**Test Scenarios**:
- Basic user model creation and validation
- User creation with various attribute combinations
- Test database transaction handling
- User model relationship testing in test context

**Common Test Issues Resolved**:
- Test database setup and configuration problems
- User model validation failures in test environment
- Test transaction and rollback issues
- Test data isolation and cleanup problems

---

### `debug_user_class.py`
**Purpose**: User class import and registry debugging with import order testing

**Description**:
- Debugs User class import issues and SQLAlchemy registry conflicts
- Tests import order dependencies and their impact on model registration
- Provides comprehensive analysis of User class definition and registration
- Offers solutions for resolving User class import and registry issues

**Usage**:
```bash
# Debug User class import and registry issues
python scripts/debug_user_class.py

# Test import order dependencies
python scripts/debug_user_class.py --test-import-order

# Analyze registry state
python scripts/debug_user_class.py --registry-state

# Test alternative import paths
python scripts/debug_user_class.py --test-imports
```

**Features**:
- ✅ **Import Order Testing**: Tests how import order affects model registration
- ✅ **Registry State Analysis**: Analyzes SQLAlchemy registry state and User class registration
- ✅ **Multiple Import Path Testing**: Tests various import paths for User class
- ✅ **Class Definition Analysis**: Analyzes User class definition and attributes
- ✅ **Conflict Resolution**: Provides strategies for resolving import conflicts
- ✅ **Dependency Mapping**: Maps import dependencies and their relationships

**Import Order Scenarios Tested**:
- Different module import sequences
- Registry state before and after imports
- Impact of import order on model relationships
- Alternative import path validation

**Registry Analysis Features**:
- User class registration state inspection
- Registry conflict identification and resolution
- Model inheritance and relationship validation
- Class attribute and method analysis

---

### **Debugging Workflow Examples**

#### **SQLAlchemy Model Import Conflict Resolution**
```bash
# 1. Identify the specific model with import conflicts
python scripts/debug_models.py --model User

# 2. Analyze import paths and registry state
python scripts/debug_user_class.py --registry-state

# 3. Test import order dependencies
python scripts/debug_user_class.py --test-import-order

# 4. Resolve conflicts and validate fixes
python scripts/debug_models.py --test-relationships
```

#### **Test Environment User Creation Issues**
```bash
# 1. Debug test environment setup
python scripts/debug_test_user.py --validate-env

# 2. Test user creation workflows
python scripts/debug_test_user.py --test-data

# 3. Validate test database configuration
python scripts/debug_test_user.py --test-db-setup

# 4. Verify fixes with comprehensive testing
python scripts/debug_models.py --model User
```

#### **Complex Model Relationship Debugging**
```bash
# 1. Debug specific model relationships
python scripts/debug_activity_model.py --verbose

# 2. Analyze import conflicts
python scripts/debug_imports.py --detailed

# 3. Test model registry state
python scripts/debug_models.py --registry-analysis

# 4. Validate all model relationships
python scripts/debug_models.py --test-relationships
```

#### **Import Path Validation and Optimization**
```bash
# 1. Test all import paths for consistency
python scripts/debug_user_class.py --test-imports

# 2. Analyze ActivityEnrichedFeature import sources
python scripts/debug_activity_model.py --source app.models.analytics

# 3. Debug UserRoleAssignment import conflicts
python scripts/debug_imports.py --test-imports

# 4. Validate optimized import paths
python scripts/debug_models.py --model User
```

---


## 📝 Recent Updates
**January 19, 2025**: Added Debugging & Troubleshooting Scripts Documentation:
- Added comprehensive documentation for 5 debugging scripts moved from root to `/scripts/` directory
- Added [`debug_activity_model.py`](scripts/debug_activity_model.py) - ActivityEnrichedFeature model debugging with multiple import source testing
- Added [`debug_imports.py`](scripts/debug_imports.py) - UserRoleAssignment import conflict diagnosis with registry analysis
- Added [`debug_models.py`](scripts/debug_models.py) - Core SQLAlchemy model diagnostics for User, Tenant, Notification models
- Added [`debug_test_user.py`](scripts/debug_test_user.py) - User model creation debugging in test environment context
- Added [`debug_user_class.py`](scripts/debug_user_class.py) - User class import and registry debugging with import order testing
- Created new "🐛 Debugging & Troubleshooting Scripts" section with comprehensive documentation
- Added debugging workflow examples for SQLAlchemy model conflicts, test environment issues, and import path validation
- Updated script overview table to include all debugging scripts with proper usage examples
- Enhanced project maintenance capabilities with specialized debugging tools for complex SQLAlchemy issues


**January 13, 2025**: Completed Script Reorganization and Documentation Updates:
- Moved `fix_database_schema.py` from root to `/scripts/` directory - SQLAlchemy model conflicts and schema fixes
- Moved `test_sqlalchemy_fixes.py` from root to `/scripts/` directory - SQLAlchemy fixes validation and testing
- Created `find-port.js` - Dynamic port detection utility for conflict-free E2E testing environments
- Created `start-test-server.js` - Test server startup script with dynamic port management and configuration copying
- Updated [`frontend/playwright.config.ts`](../frontend/playwright.config.ts) to use root scripts directory and dynamic port system
- Updated [`scripts/README.md`](README.md) with comprehensive documentation for all new and moved scripts
- Added new script categories: "E2E Testing & Dynamic Port Management Scripts" and "Database Schema & SQLAlchemy Management Scripts"
- Enhanced script organization table with 4 new scripts for better project maintenance and testing infrastructure
- Implemented dynamic port detection system to prevent port conflicts during parallel E2E test execution
- Provided complete integration between Playwright E2E tests and backend service management

**January 13, 2025**: Added Frontend-Backend Integration Scripts and CLI Workflow Updates:
- Added `start-dev.sh` - Enhanced development environment startup with frontend-backend integration support
- Added `stop-dev.sh` - Clean shutdown of integrated development environment
- Added `setup-test-env.sh` - Comprehensive test environment setup with backend service management
- Added `cleanup-test-env.sh` - Test environment cleanup and resource management
- **Updated CLI Workflow**: Modified `package.json` scripts to integrate with new scripts
  - `npm run dev` now uses enhanced `start-dev.sh` with health checks
  - `npm run dev:stop` for clean environment shutdown
  - `npm run test:e2e` includes automatic backend service management
  - Added fallback `npm run dev:legacy` for original workflow
- Created comprehensive documentation for all integration scripts with usage examples and features
- Added new workflow sections for Frontend-Backend Integration Development and E2E Testing with Backend Services
- Enhanced script organization table with integration scripts for better project maintenance
- Provided complete integration testing capabilities with service orchestration and health monitoring
- Created `CLI_WORKFLOW_INTEGRATION.md` guide for migration and troubleshooting

**January 6, 2025**: Completed comprehensive script documentation and organization:
- Added detailed documentation for 34 additional scripts including environment, deployment, setup, code quality, and data seeding scripts
- Documented environment scripts: `activate_digame.sh`, `docker-cleanup.sh`, `system-monitor.sh`, `run-performance-tests.sh`, `health-checks.sh`, `validate_pipeline.sh`
- Documented deployment scripts: `deploy.sh`, `deploy-environment.sh`, `deploy-production.sh`, `production_deployment.py`, `production_backup.py`, `production_environment.py`, `production_health_monitor.py`
- Documented setup scripts: `setup_dev_env.py`, `setup_platform_owner.py`, `setup_aco_integration.py`, `documentation_automation.py`, `integration_helper.py`, `validate_nextjs_routing.js`
- Documented code quality scripts: `upgrade_fastapi_python313.py`, `verify_and_cleanup_fixes.py`, `fix_circular_imports.py`, `fix_dependencies_and_imports.py`, `fix_import_paths.py`, `fix_pyrefly_errors.py`, `fix_remaining_test_errors.py`
- Documented data seeding scripts: `seed_test_data.py`, `seed_demo_users.py`, `seed_activities.py`, `seed_analytics_data.py`, `seed_behavioral_data.py`, `seed_aiml_data.py`, `seed_aiml_data_simple.py`, `simple_seed.py`
- Added 8 new comprehensive workflow sections covering complete development setup, production deployment, performance testing, code quality, data management, Docker infrastructure, and documentation workflows
- Enhanced script organization table with all 70+ scripts now properly categorized and documented
- Provided complete usage examples, features, and technical details for all newly documented scripts

**January 6, 2025**: Moved additional utility scripts from root to `/scripts/` directory:
- Moved `fix_table_definitions.py` - Database table definition fixes and schema corrections
- Moved `test_api_keys.py` - API key testing and validation for external service integrations
- Added comprehensive documentation for database schema management and API testing scripts
- Updated common use cases to include database schema management and API integration testing workflows
- Enhanced script organization with additional utility scripts for better project maintenance

**January 6, 2025**: Moved development and frontend scripts from root to `/scripts/` directory:
- Moved `start-dev.sh` - Interactive development environment startup script
- Moved `fix-all-imports.sh` - Comprehensive UI component import casing fix
- Moved `fix-imports.sh` - Basic UI component import casing fix
- Moved `fix-ui-imports.sh` - Advanced UI component import casing fix with verification
- Added comprehensive documentation for all development and frontend scripts
- Updated common use cases to include development environment and frontend workflows
- Enhanced script organization for better project structure and maintainability

**January 4, 2025**: Moved and documented root-level scripts for better organization:
- Moved `check_backend_db.py` - Node.js backend database inspection
- Moved `check_user_credentials.py` - User credential verification and database inspection
- Moved `check_db_schema.py` - Complete database schema inspection and analysis
- Moved `create_platform_owner.py` - Platform Owner user creation with SQLAlchemy
- Moved `create_simple_platform_owner.py` - Simple Platform Owner creation with direct SQLite
- Moved `fix_platform_owner_onboarding.py` - Platform Owner onboarding status fixes
- Moved `fix_platform_owner_password.py` - Platform Owner password bcrypt hashing fixes
- Moved `get_user_details.py` - Individual user detail retrieval by ID
- Moved `simple_user_check.py` - Simple and direct users table inspection
- Added comprehensive documentation for all moved scripts
- Updated common use cases to include enhanced database inspection workflows
- Added new workflow sections for database troubleshooting and Platform Owner setup

**January 1, 2025**: Updated documentation to include newly organized scripts:
- Added `create_tables.py` - Direct database table creation
- Added `entrypoint.sh` - Docker container entrypoint script
- Added `run_frontend_tests.sh` - Frontend testing automation
- Added `test_phase3_team_coordination.py` - Team coordination demo
- Added `test_team_endpoints.py` - API endpoint testing
- Added `update_admin_platform_owner.py` - Admin user management
- Updated common use cases to include new workflow patterns
- Reorganized scripts from root directory for better project structure