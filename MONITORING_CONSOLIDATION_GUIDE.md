# Monitoring Router Consolidation Guide

## Overview

The monitoring endpoints have been consolidated to eliminate conflicts and provide a unified monitoring experience. This guide outlines the changes and migration path.

## Consolidated Router

**New Router**: `consolidated_monitoring_router.py`
**Prefix**: `/api/monitoring`
**Tag**: "Consolidated Monitoring"

## Replaced Routers

### 1. performance_monitoring_router.py
- **Old Prefix**: `/api/performance`
- **Status**: DEPRECATED - Caused route conflicts with performance_router.py

### 2. performance_router.py  
- **Old Prefix**: `/api/performance`
- **Status**: DEPRECATED - Conflicted with performance_monitoring_router.py

### 3. advanced_monitoring_router.py
- **Old Prefix**: `/api/monitoring` 
- **Status**: CONSOLIDATED - Functionality merged into consolidated router

## Endpoint Migration Map

### Dashboard Endpoints
| Old Endpoint | New Endpoint | Notes |
|--------------|--------------|-------|
| `/api/monitoring/dashboard` | `/api/monitoring/dashboard` | Enhanced with comprehensive data |
| Various performance dashboards | `/api/monitoring/dashboard` | Unified dashboard |

### Performance Metrics
| Old Endpoint | New Endpoint | Notes |
|--------------|--------------|-------|
| `/api/performance/metrics` | `/api/monitoring/performance/metrics` | Moved under monitoring |
| `/api/performance/metrics/bulk` | `/api/monitoring/performance/metrics/bulk` | Bulk operations supported |

### User Experience
| Old Endpoint | New Endpoint | Notes |
|--------------|--------------|-------|
| `/api/performance/user-experience/analytics` | `/api/monitoring/user-experience/analytics` | Enhanced analytics |
| `/api/performance/user-experience/session` | `/api/monitoring/user-experience/session` | Session management |
| `/api/performance/user-experience` | `/api/monitoring/user-experience/metric` | Metric recording |

### System Health
| Old Endpoint | New Endpoint | Notes |
|--------------|--------------|-------|
| `/api/performance/health/status` | `/api/monitoring/health/status` | System health status |
| `/api/performance/monitoring/system-health` | `/api/monitoring/health/system` | Current system health |
| `/api/performance/health/check` | `/api/monitoring/health/check` | Manual health checks |

### Alerts
| Old Endpoint | New Endpoint | Notes |
|--------------|--------------|-------|
| `/api/monitoring/alerts` | `/api/monitoring/alerts` | Enhanced filtering |
| `/api/performance/alerts` | `/api/monitoring/alerts` | Consolidated alert management |
| `/api/monitoring/alerts/{alert_id}/action` | `/api/monitoring/alerts/{alert_id}/action` | Alert actions |

### Query Performance
| Old Endpoint | New Endpoint | Notes |
|--------------|--------------|-------|
| `/api/performance/query-performance` | `/api/monitoring/query-performance` | Query performance tracking |
| `/api/performance/query-optimization/analytics` | `/api/monitoring/query-optimization/analytics` | Query analytics |
| `/api/performance/query-optimization` | `/api/monitoring/query-optimization/recommendations` | Optimization recommendations |

### Real-time Monitoring
| Old Endpoint | New Endpoint | Notes |
|--------------|--------------|-------|
| `/api/performance/real-time/metrics` | `/api/monitoring/real-time/metrics` | Real-time metrics |

### Health Check
| Old Endpoint | New Endpoint | Notes |
|--------------|--------------|-------|
| `/api/performance/health` | `/api/monitoring/health` | Consolidated health check |
| `/api/monitoring/health` (advanced) | `/api/monitoring/health` | Enhanced health check |

## Key Improvements

### 1. Unified Dashboard
- Combines system metrics, alerts, service health, and performance trends
- Real-time data with actual system metrics where possible
- Comprehensive overview of all monitoring aspects

### 2. Consolidated Endpoints
- Single prefix `/api/monitoring` for all monitoring functionality
- Logical grouping of related endpoints
- Consistent response formats

### 3. Enhanced Features
- Better error handling and logging
- Improved real-time capabilities
- More comprehensive health checks
- Unified alert management

### 4. Eliminated Conflicts
- Resolved `/api/performance` prefix conflicts
- Single source of truth for monitoring
- Cleaner API structure

## Migration Steps

### For Frontend Applications
1. Update API client base URLs from `/api/performance` to `/api/monitoring`
2. Update endpoint paths according to migration map
3. Test all monitoring functionality
4. Update any hardcoded URLs in configuration

### For Backend Integration
1. Update import statements to use `consolidated_monitoring_router`
2. Remove references to deprecated routers
3. Update any internal service calls
4. Test monitoring functionality

### For Documentation
1. Update API documentation to reflect new endpoints
2. Update integration guides
3. Add deprecation notices for old endpoints

## Backward Compatibility

**Note**: The old endpoints are immediately deprecated. Update your applications to use the new consolidated endpoints.

## Testing

The consolidated router has been tested to ensure:
- All critical monitoring functionality is preserved
- Enhanced dashboard provides comprehensive monitoring data
- Real-time metrics work with actual system data
- Alert management is fully functional
- Health checks provide accurate system status

## Support

For questions about the monitoring consolidation:
1. Check this migration guide
2. Review the new consolidated router implementation
3. Test endpoints using the FastAPI docs at `/docs`
4. Verify functionality with the unified dashboard

## Benefits

1. **Simplified API Structure**: Single monitoring prefix eliminates confusion
2. **Enhanced Functionality**: Unified dashboard with comprehensive monitoring data
3. **Better Performance**: Optimized endpoints with improved caching and real-time data
4. **Easier Maintenance**: Single router to maintain instead of multiple overlapping ones
5. **Consistent Experience**: Unified response formats and error handling