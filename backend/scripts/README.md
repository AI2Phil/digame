# Backend Scripts Directory

This directory contains Node.js command-line interface (CLI) tools for managing the Digame backend services. These scripts provide comprehensive database management and intelligent cache operations for the Node.js backend server.

## 📋 Script Overview

| Script | Purpose | Usage | Status |
|--------|---------|-------|--------|
| [`database-cli.js`](#database-clijs) | Database management and operations | `node database-cli.js <command>` | ✅ Active |
| [`intelligent-cache-cli.js`](#intelligent-cache-clijs) | Advanced cache management and analytics | `node intelligent-cache-cli.js <command>` | ✅ Active |

---

## 🗄️ Database Management

### `database-cli.js`
**Purpose**: Comprehensive database management CLI tool for the Node.js backend

**Description**:
- Provides complete database lifecycle management for the Node.js backend
- Supports both SQLite (development) and PostgreSQL (production) databases
- Handles data migration, backup, export/import, and health monitoring
- Integrates with the backend's DatabaseAdapter and DatabaseMigrator services

**Usage**:
```bash
# Show database status
node backend/scripts/database-cli.js status

# Comprehensive health check
node backend/scripts/database-cli.js health

# Export database data
node backend/scripts/database-cli.js export [filename]

# Import data from file
node backend/scripts/database-cli.js import <filename>

# Migrate from SQLite to PostgreSQL
node backend/scripts/database-cli.js migrate

# Test migration (dry run)
node backend/scripts/database-cli.js test-migration

# Create backup
node backend/scripts/database-cli.js backup

# Clear cache layers
node backend/scripts/database-cli.js clear-cache

# Show database schema
node backend/scripts/database-cli.js schema

# List users
node backend/scripts/database-cli.js users

# Show help
node backend/scripts/database-cli.js help
```

**Features**:
- ✅ **Multi-Database Support**: Works with SQLite and PostgreSQL
- ✅ **Health Monitoring**: Comprehensive database health checks
- ✅ **Data Export/Import**: JSON-based data transfer capabilities
- ✅ **Migration Support**: SQLite to PostgreSQL migration with testing
- ✅ **Backup Management**: Automated backup creation and restoration
- ✅ **Schema Analysis**: Database structure inspection and reporting
- ✅ **Cache Integration**: Cache clearing and management
- ✅ **User Management**: User listing and analysis

**NPM Scripts Integration**:
```bash
# Available via package.json scripts
npm run db              # General database CLI
npm run db:status       # Database status
npm run db:health       # Health check
npm run db:export       # Export data
npm run db:backup       # Create backup
npm run db:migrate      # Run migration
npm run db:test-migration  # Test migration
npm run cache:clear     # Clear cache
```

**Database Schema Categories**:
- **Core**: users, notifications, notification_settings
- **Productivity**: tasks, projects
- **Collaboration**: teams, team_members, skills, user_skills, mentorship_relationships
- **Automation**: workflows
- **Analytics**: analytics_events
- **Security**: audit_logs, api_keys
- **Integration**: webhooks
- **Reporting**: reports
- **Platform**: platform_metrics, tenants

---

## 🤖 Intelligent Cache Management

### `intelligent-cache-cli.js`
**Purpose**: Advanced cache management and analytics CLI tool

**Description**:
- Provides comprehensive intelligent cache management capabilities
- Offers detailed analytics, performance metrics, and usage pattern analysis
- Supports predictive cache warming and auto-optimization
- Integrates with the backend's intelligentCacheManager and cacheWarmingStrategies

**Usage**:
```bash
# Get comprehensive analytics
node backend/scripts/intelligent-cache-cli.js analytics

# Check cache system health
node backend/scripts/intelligent-cache-cli.js health

# Execute cache warming strategy
node backend/scripts/intelligent-cache-cli.js warm <strategy-name>

# Execute predictive warming
node backend/scripts/intelligent-cache-cli.js predictive

# Run auto-optimization
node backend/scripts/intelligent-cache-cli.js optimize

# View usage patterns
node backend/scripts/intelligent-cache-cli.js patterns

# List warming strategies
node backend/scripts/intelligent-cache-cli.js strategies

# Clear cache data
node backend/scripts/intelligent-cache-cli.js clear [--patterns] [--metrics] [--all]

# Show help
node backend/scripts/intelligent-cache-cli.js help
```

**Features**:
- ✅ **Performance Analytics**: Comprehensive cache performance metrics
- ✅ **Usage Pattern Analysis**: Intelligent usage pattern tracking and analysis
- ✅ **Predictive Warming**: AI-driven cache warming based on usage patterns
- ✅ **Auto-Optimization**: Automatic cache optimization and tuning
- ✅ **Health Monitoring**: Real-time cache system health checks
- ✅ **Strategy Management**: Multiple cache warming strategies with scheduling
- ✅ **Pattern Recognition**: Advanced access pattern recognition and prediction
- ✅ **Multi-Cache Support**: Manages multiple cache types and layers

**NPM Scripts Integration**:
```bash
# Available via package.json scripts
npm run icache              # General intelligent cache CLI
npm run icache:analytics    # View analytics
npm run icache:health       # Health check
npm run icache:warm         # Execute warming
npm run icache:predictive   # Predictive warming
npm run icache:optimize     # Auto-optimization
npm run icache:patterns     # Usage patterns
npm run icache:strategies   # List strategies
npm run icache:clear        # Clear cache data
```

**Available Warming Strategies**:
- **critical-data**: Warm critical system data
- **user-behavior**: Warm based on user behavior patterns
- **analytics-reports**: Warm analytics and reporting data
- **api-endpoints**: Warm frequently accessed API endpoints
- **predictive-content**: Warm content based on predictions
- **peak-hours**: Warm data for peak usage hours

**Analytics Metrics**:
- **Performance**: Warming hits, predictive hits, pattern matches
- **Usage Patterns**: Total keys tracked, access frequency, top accessed keys
- **Cache Managers**: Status and performance of different cache types
- **Optimization**: Auto-optimization status and savings

---

## 🚀 Common Use Cases

### **Database Setup and Management**
```bash
# Check database status and health
npm run db:status
npm run db:health

# Export data for backup
npm run db:export backup-$(date +%Y%m%d).json

# Test migration before production
npm run db:test-migration

# Migrate to PostgreSQL
npm run db:migrate

# Create regular backup
npm run db:backup
```

### **Cache Performance Optimization**
```bash
# Check cache system health
npm run icache:health

# View comprehensive analytics
npm run icache:analytics

# Execute predictive warming
npm run icache:predictive

# Run auto-optimization
npm run icache:optimize

# View usage patterns
npm run icache:patterns
```

### **Development Workflow**
```bash
# Start with fresh cache
npm run icache:clear --all

# Warm critical data
npm run icache:warm critical-data

# Monitor performance
npm run icache:analytics

# Check database health
npm run db:health
```

### **Production Maintenance**
```bash
# Daily health checks
npm run db:health && npm run icache:health

# Weekly optimization
npm run icache:optimize

# Monthly backup
npm run db:backup

# Performance analysis
npm run icache:analytics
```

---

## 🔧 Technical Requirements

### **Node.js Dependencies**:
- **better-sqlite3**: SQLite database operations
- **pg**: PostgreSQL database operations
- **ioredis**: Redis cache operations
- **fs/path**: File system operations

### **Backend Service Dependencies**:
- **DatabaseAdapter**: Database abstraction layer
- **DatabaseMigrator**: Migration management service
- **intelligentCacheManager**: Advanced cache management
- **cacheWarmingStrategies**: Cache warming strategy implementation
- **cacheManager**: Basic cache operations

### **Environment Requirements**:
- Node.js 18.0.0+
- Access to backend database (SQLite/PostgreSQL)
- Redis server (for cache operations)
- Write permissions for backup/export operations

---

## 🛠️ Configuration

### **Environment Variables**:
```bash
# Database configuration
DATABASE_URL=postgresql://user:password@host:port/database  # For PostgreSQL migration
SQLITE_DB_PATH=./data/digame.db                            # SQLite database path

# Cache configuration
REDIS_URL=redis://localhost:6379/0                         # Redis connection

# Backup configuration
BACKUP_DIR=./backups                                        # Backup directory
```

### **Database Paths**:
- **SQLite Database**: `backend/data/digame.db`
- **Backup Directory**: `backend/backups/`
- **Export Directory**: Current working directory (configurable)

---

## 🔍 Troubleshooting

### **Common Issues**:

1. **Database Connection Errors**:
   ```bash
   # Check database status
   npm run db:status
   
   # Verify database file exists
   ls -la backend/data/digame.db
   ```

2. **Cache Connection Issues**:
   ```bash
   # Check cache health
   npm run icache:health
   
   # Clear problematic cache data
   npm run icache:clear --all
   ```

3. **Migration Problems**:
   ```bash
   # Test migration first
   npm run db:test-migration
   
   # Check PostgreSQL connection
   echo $DATABASE_URL
   ```

4. **Performance Issues**:
   ```bash
   # Analyze cache performance
   npm run icache:analytics
   
   # Run optimization
   npm run icache:optimize
   ```

### **Getting Help**:
- Run scripts with `help` command for detailed usage information
- Check script output logs for specific error messages
- Verify environment variables and database connectivity
- Review backend service logs for integration issues

---

## 📈 Script Maintenance

### **Adding New Commands**:
1. Add command to the appropriate CLI script
2. Update help text and documentation
3. Add corresponding NPM script to `package.json`
4. Test command functionality
5. Update this README with new command documentation

### **Script Standards**:
- ✅ Comprehensive error handling and logging
- ✅ Clear success/failure indicators with emojis
- ✅ Detailed help text and usage examples
- ✅ Integration with backend services
- ✅ NPM script integration for easy access
- ✅ Environment variable support

---

## 🔗 Related Documentation

- **Main Scripts**: `/scripts/README.md` - Root-level Python utility scripts
- **Backend Services**: `/backend/src/services/` - Service implementations
- **Database Documentation**: `/docs/Database/` - Database design and schema
- **Cache Documentation**: Backend cache service documentation

---

*Last Updated: January 4, 2025*
*Digame Backend Team*

---

## 📝 Recent Updates

**January 4, 2025**: Created comprehensive documentation for backend scripts:
- Added complete documentation for `database-cli.js` with all commands and features
- Added complete documentation for `intelligent-cache-cli.js` with analytics and optimization
- Documented NPM script integration and common use cases
- Added troubleshooting guide and maintenance procedures
- Organized documentation to match main scripts README structure