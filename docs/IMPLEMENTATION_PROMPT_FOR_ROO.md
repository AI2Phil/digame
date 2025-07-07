# Mock Data Replacement Implementation Prompt for Roo

## Task Overview

You are tasked with systematically replacing mock data across the Digame platform with database-driven content to achieve production readiness. This is a critical blocker for go-live deployment.

## Current Status

- **Platform Completion**: 98% complete
- **Remaining Work**: Mock data replacement and database integration
- **Components Requiring Updates**: 100+ components across 14 major platform sections
- **Critical Priority**: PRODUCTION BLOCKER - Required for go-live

## Implementation Strategy

### Phase-Based Approach

Implement mock data replacement in batches, updating `/docs/AUDIT.md` after each phase completion to track progress.
**To use Browser to verify results, sign in as Platform Owner:**
- use Platform Owner credentials .. philip.a.oshea@gmail.com and Dalk3y1306

**note** I can see that the analytics router is using from ..database import get_db, which means it's using the database.py file. However, the productivity router is also using from ..database import get_db but the route isn't working. Let me check if there's an issue with the productivity router import in main.py. 

#### Phase 1: Critical Dashboard Components (Week 1)
**Priority**: CRITICAL - Core platform functionality

**Components to Update:**
- [`PlatformAnalyticsDashboard.tsx`](../frontend/src/components/analytics/PlatformAnalyticsDashboard.tsx)
- [`ProductivityMetricCard.jsx`](../frontend/src/components/dashboard/ProductivityMetricCard.jsx)
- [`PlatformManagementDashboard.tsx`](../frontend/src/components/admin/PlatformManagementDashboard.tsx)
- [`PerformanceDashboard.tsx`](../frontend/src/components/performance/PerformanceDashboard.tsx)
- [`MultiTenancyDashboard.jsx`](../frontend/src/components/enterprise/MultiTenancyDashboard.jsx)

**Database Tables Required:**
- `analytics_metrics` - Platform usage and engagement data
- `system_metrics` - Performance and health monitoring
- `tenants` - Multi-tenant organization data
- `users` - User accounts and activity

**After Phase 1 Completion:**
Update `/docs/AUDIT.md` by changing status for completed components:
```
| Component | Mock Data Present | Database Source Ready | Seeding Complete |
|-----------|-------------------|----------------------|------------------|
| [`PlatformAnalyticsDashboard.tsx`] | ✅ COMPLETED | ✅ Yes | ✅ Yes |
```

#### Phase 2: AI & Intelligence Components (Week 2)
**Priority**: HIGH - Advanced platform features

**Components to Update:**
- [`AIMLDashboard.tsx`](../frontend/src/components/ai/AIMLDashboard.tsx)
- [`AIPoweredAutomation.jsx`](../frontend/src/components/ai/AIPoweredAutomation.jsx)
- [`AdvancedBehavioralAnalysis.jsx`](../frontend/src/components/ai/AdvancedBehavioralAnalysis.jsx)
- [`PredictiveAnalyticsEngine.jsx`](../frontend/src/components/PredictiveAnalyticsEngine.jsx)
- [`DigitalTwinDashboard.tsx`](../frontend/src/components/digital-twin/DigitalTwinDashboard.tsx)

**Database Tables Required:**
- `ml_models` - AI/ML model configurations and performance
- `predictions` - Model outputs and confidence scores
- `behavioral_patterns` - User behavior analysis
- `digital_twins` - Twin status and learning progress
- `automation_rules` - AI-powered automation configurations

#### Phase 3: Collaboration & Workflow Components (Week 3)
**Priority**: HIGH - Team productivity features

**Components to Update:**
- [`RealTimeCollaborationDashboard.tsx`](../frontend/src/components/collaboration/RealTimeCollaborationDashboard.tsx)
- [`WorkflowAutomationDashboard.tsx`](../frontend/src/components/workflow/WorkflowAutomationDashboard.tsx)
- [`TeamManagement.tsx`](../frontend/src/components/team/TeamManagement.tsx)
- [`AdvancedTeamAnalytics.jsx`](../frontend/src/components/team/AdvancedTeamAnalytics.jsx)
- [`CollaborationOptimization.jsx`](../frontend/src/components/team/CollaborationOptimization.jsx)

**Database Tables Required:**
- `workspaces` - Collaboration workspace data
- `messages` - Real-time chat and communication
- `workflows` - Automation templates and executions
- `teams` - Team structure and analytics
- `collaboration_metrics` - Team interaction data

#### Phase 4: Monitoring & Integration Components (Week 4)
**Priority**: MEDIUM - Infrastructure and third-party features

**Components to Update:**
- [`AdvancedMonitoringDashboard.tsx`](../frontend/src/components/monitoring/AdvancedMonitoringDashboard.tsx)
- [`IntegrationDashboard.tsx`](../frontend/src/components/integrations/IntegrationDashboard.tsx)
- [`AdvancedReportingDashboard.tsx`](../frontend/src/components/reporting/AdvancedReportingDashboard.tsx)
- [`CustomReportBuilder.jsx`](../frontend/src/components/CustomReportBuilder.jsx)
- [`DataVisualizationEngine.jsx`](../frontend/src/components/DataVisualizationEngine.jsx)

**Database Tables Required:**
- `system_alerts` - Monitoring alerts and notifications
- `integrations` - Third-party API connections
- `reports` - Custom report configurations
- `data_sources` - Report data source definitions

## Implementation Instructions for Each Component

### Step 1: Identify Mock Data Patterns
For each component, locate and document:
- Hardcoded arrays with sample data
- Static object definitions with placeholder values
- Mock API response structures
- Hardcoded metrics and KPIs

### Step 2: Create Database Schema
- Design appropriate database tables
- Define relationships and constraints
- Create migration scripts
- Implement data seeding scripts

### Step 3: Update API Endpoints
- Replace mock data returns with database queries
- Implement proper error handling
- Add data validation and sanitization
- Ensure proper authentication and authorization

### Step 4: Update Frontend Components
- Replace hardcoded data with API calls
- Implement loading states and error handling
- Add data refresh mechanisms
- Ensure real-time updates where applicable

### Step 5: Data Seeding
- Create realistic sample data
- Ensure data volume matches production expectations
- Implement data relationships and dependencies
- Test data integrity and consistency

## AUDIT.md Update Process

After completing each phase, update `/docs/AUDIT.md` as follows:

### 1. Update Audit Summary Table
Change the "Database Ready" and "Seeding Complete" counts for the completed category:
```markdown
| Category | Total Items | Database Ready | Seeding Complete | Remaining |
|----------|-------------|----------------|------------------|-----------|
| **Analytics & Dashboards** | 15 | 15 | 15 | 0 |
```

### 2. Update Component Status
For each completed component, change the status:
```markdown
| [`ComponentName.tsx`] | ✅ COMPLETED | ✅ Yes | ✅ Yes | Database integrated, seeding complete |
```

### 3. Update Critical Production Blockers
Remove completed items from the critical blockers list and update the count.

### 4. Update Database Schema Status
Mark completed tables as ready:
```markdown
- ✅ `table_name` - Schema complete, seeding complete
```

### 5. Update API Endpoints Status
Mark completed API categories as functional:
```markdown
- ✅ Analytics APIs - Database integrated and functional
```

### 6. Update Implementation Progress
Add a new section tracking phase completion:
```markdown
## Implementation Progress

### Completed Phases
- ✅ **Phase 1**: Critical Dashboard Components (Completed: [Date])
- ✅ **Phase 2**: AI & Intelligence Components (Completed: [Date])
- 🔄 **Phase 3**: Collaboration & Workflow Components (In Progress)
- ⏳ **Phase 4**: Monitoring & Integration Components (Pending)
```

## Quality Assurance Checklist

After each phase, verify:
- [ ] All components display real data from database
- [ ] No hardcoded values remain in updated components
- [ ] Data refresh mechanisms work correctly
- [ ] Error handling is implemented for missing data
- [ ] Performance is acceptable with real data volumes
- [ ] Real-time updates function properly (where applicable)

## Testing Requirements

For each completed phase:
1. **Unit Testing**: Test individual component data loading
2. **Integration Testing**: Test API endpoint functionality
3. **Performance Testing**: Verify acceptable response times
4. **Data Validation**: Ensure data integrity and consistency
5. **User Acceptance Testing**: Verify business requirements are met

## Success Criteria

Each phase is considered complete when:
- All components in the phase display real database data
- No mock data remains in the updated components
- Database schema is properly implemented and seeded
- API endpoints return real data with proper error handling
- `/docs/AUDIT.md` is updated to reflect completion status
- All quality assurance checks pass

## Final Deliverable

Upon completion of all phases:
- Update the platform status to "100% Complete - Production Ready"
- Mark all 100+ components as database-integrated
- Confirm all critical production blockers are resolved
- Provide final production readiness certification

## Notes

- Prioritize components marked as "CRITICAL" in the audit
- Maintain backward compatibility during implementation
- Implement proper logging for debugging and monitoring
- Document any schema changes or API modifications
- Coordinate with DevOps for database deployment requirements

This systematic approach ensures complete mock data replacement while maintaining clear progress tracking through the AUDIT.md document updates.