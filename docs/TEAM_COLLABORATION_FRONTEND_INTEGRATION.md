# Team Collaboration Frontend Integration Guide

This guide provides comprehensive instructions for integrating the team collaboration frontend components into the Digame application.

## Overview

The team collaboration frontend implementation includes:
- Team management interface with CRUD operations
- Team dashboard with performance metrics and analytics
- Skill gap visualization with interactive analysis
- Workflow optimization interface with process improvement suggestions
- Advanced analytics service with AI-powered insights

## Components Structure

```
digame/frontend/src/features/teams/
├── components/
│   ├── TeamManagement.tsx          # Main team management interface
│   ├── TeamDashboard.tsx           # Performance metrics dashboard
│   ├── SkillGapVisualization.tsx   # Skill gap analysis and planning
│   └── WorkflowOptimization.tsx    # Workflow process optimization
├── hooks/
│   └── useTeamManagement.ts        # Team management state and operations
├── services/
│   ├── teamService.ts              # Team API service layer
│   └── advancedAnalyticsService.ts # Advanced analytics and AI insights
```

## Integration Steps

### 1. Router Integration

Add team collaboration routes to your main router:

```typescript
// In your main router file (e.g., App.tsx or routes.tsx)
import TeamManagement from './features/teams/components/TeamManagement';
import TeamDashboard from './features/teams/components/TeamDashboard';
import SkillGapVisualization from './features/teams/components/SkillGapVisualization';
import WorkflowOptimization from './features/teams/components/WorkflowOptimization';

// Add these routes to your router configuration
const routes = [
  {
    path: '/teams',
    component: TeamManagement,
    title: 'Team Management'
  },
  {
    path: '/teams/dashboard',
    component: TeamDashboard,
    title: 'Team Dashboard'
  },
  {
    path: '/teams/skills',
    component: SkillGapVisualization,
    title: 'Skill Gap Analysis'
  },
  {
    path: '/teams/workflows',
    component: WorkflowOptimization,
    title: 'Workflow Optimization'
  }
];
```

### 2. Navigation Menu Integration

Add team collaboration links to your navigation menu:

```typescript
// In your navigation component
const navigationItems = [
  // ... existing items
  {
    label: 'Teams',
    icon: 'users',
    children: [
      { label: 'Team Management', href: '/teams' },
      { label: 'Dashboard', href: '/teams/dashboard' },
      { label: 'Skill Analysis', href: '/teams/skills' },
      { label: 'Workflows', href: '/teams/workflows' }
    ]
  }
];
```

### 3. API Endpoint Configuration

Ensure your API client is configured to work with the team collaboration endpoints:

```typescript
// Update your API base URL if needed
const BASE_URL = '/api/v1'; // Should match your FastAPI backend

// The team service expects these endpoints to be available:
// GET    /api/v1/teams                    - List teams
// POST   /api/v1/teams                    - Create team
// GET    /api/v1/teams/{id}               - Get team details
// PUT    /api/v1/teams/{id}               - Update team
// DELETE /api/v1/teams/{id}               - Delete team
// GET    /api/v1/teams/{id}/members       - Get team members
// POST   /api/v1/teams/{id}/members       - Add team member
// DELETE /api/v1/teams/{id}/members/{mid} - Remove team member
// PUT    /api/v1/teams/{id}/members/{mid} - Update member role
// GET    /api/v1/teams/{id}/performance   - Get performance metrics
// GET    /api/v1/teams/{id}/skill-gaps    - Get skill gaps
// GET    /api/v1/teams/{id}/workflows     - Get workflows
```

### 4. Authentication Integration

Ensure the team components work with your authentication system:

```typescript
// In your API client, add authentication headers
export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    const token = getAuthToken(); // Your auth token retrieval method
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add auth header
      },
    });
    // ... rest of implementation
  },
  // ... other methods with auth headers
};
```

### 5. Permission System Integration

Add role-based access control to team features:

```typescript
// Example permission wrapper component
const TeamFeatureWrapper = ({ children, requiredPermission }) => {
  const { user, hasPermission } = useAuth();
  
  if (!hasPermission(requiredPermission)) {
    return <div>Access denied. You need {requiredPermission} permission.</div>;
  }
  
  return children;
};

// Usage in routes
<TeamFeatureWrapper requiredPermission="teams.manage">
  <TeamManagement />
</TeamFeatureWrapper>
```

## Component Usage Examples

### Basic Team Management

```typescript
import React from 'react';
import TeamManagement from './features/teams/components/TeamManagement';

const TeamsPage = () => {
  return (
    <div className="container mx-auto p-6">
      <TeamManagement />
    </div>
  );
};
```

### Dashboard Integration

```typescript
import React from 'react';
import TeamDashboard from './features/teams/components/TeamDashboard';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TeamDashboard />
    </div>
  );
};
```

### Custom Hook Usage

```typescript
import React from 'react';
import { useTeamManagement } from './features/teams/hooks/useTeamManagement';

const CustomTeamComponent = () => {
  const {
    teams,
    selectedTeam,
    isLoading,
    error,
    fetchTeams,
    createTeam,
    setSelectedTeam
  } = useTeamManagement();

  React.useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {teams.map(team => (
        <div key={team.id} onClick={() => setSelectedTeam(team)}>
          {team.name}
        </div>
      ))}
    </div>
  );
};
```

## Advanced Analytics Integration

### Using Advanced Analytics Service

```typescript
import React, { useState, useEffect } from 'react';
import { advancedAnalyticsService } from './features/teams/services/advancedAnalyticsService';

const AnalyticsComponent = ({ teamId }) => {
  const [insights, setInsights] = useState([]);
  const [predictions, setPredictions] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [analyticsInsights, performancePrediction] = await Promise.all([
          advancedAnalyticsService.getAnalyticsInsights(teamId),
          advancedAnalyticsService.predictTeamPerformance(teamId)
        ]);
        
        setInsights(analyticsInsights);
        setPredictions(performancePrediction);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      }
    };

    if (teamId) {
      loadAnalytics();
    }
  }, [teamId]);

  return (
    <div>
      <h2>Team Analytics</h2>
      {/* Render insights and predictions */}
    </div>
  );
};
```

## Styling and Theming

### CSS Classes Used

The components use Tailwind CSS classes. Ensure these are available:

```css
/* Core layout classes */
.container, .mx-auto, .p-6, .space-y-6
.grid, .grid-cols-1, .grid-cols-2, .grid-cols-3
.flex, .items-center, .justify-between
.min-h-screen, .h-full, .w-full

/* Component styling */
.bg-gray-50, .bg-white, .border, .rounded-lg
.text-gray-600, .text-gray-900, .font-medium, .font-bold
.hover:bg-gray-50, .transition-colors

/* Status colors */
.text-green-600, .bg-green-50, .border-green-200
.text-red-600, .bg-red-50, .border-red-200
.text-blue-600, .bg-blue-50, .border-blue-200
.text-yellow-600, .bg-yellow-50, .border-yellow-200
```

### Custom Theme Integration

```typescript
// If using a custom theme system
const teamTheme = {
  colors: {
    primary: '#3B82F6',    // Blue
    success: '#10B981',    // Green
    warning: '#F59E0B',    // Yellow
    error: '#EF4444',      // Red
    gray: '#6B7280'        // Gray
  },
  spacing: {
    container: '1200px',
    section: '2rem',
    component: '1rem'
  }
};
```

## Error Handling

### Global Error Boundary

```typescript
import React from 'react';

class TeamErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Team component error:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Something went wrong with the team features
          </h2>
          <p className="text-gray-600 mb-4">
            Please refresh the page or contact support if the problem persists.
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrap team components
<TeamErrorBoundary>
  <TeamManagement />
</TeamErrorBoundary>
```

## Performance Optimization

### Lazy Loading

```typescript
import React, { lazy, Suspense } from 'react';

// Lazy load team components
const TeamManagement = lazy(() => import('./features/teams/components/TeamManagement'));
const TeamDashboard = lazy(() => import('./features/teams/components/TeamDashboard'));
const SkillGapVisualization = lazy(() => import('./features/teams/components/SkillGapVisualization'));
const WorkflowOptimization = lazy(() => import('./features/teams/components/WorkflowOptimization'));

// Loading component
const TeamLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Usage with Suspense
<Suspense fallback={<TeamLoadingSpinner />}>
  <TeamManagement />
</Suspense>
```

### Data Caching

```typescript
// Example using React Query for caching
import { useQuery } from 'react-query';
import { teamService } from './features/teams/services/teamService';

const useTeamsQuery = () => {
  return useQuery(
    'teams',
    () => teamService.getTeams(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  );
};
```

## Testing Integration

### Component Testing

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TeamManagement from './TeamManagement';

// Mock the team service
jest.mock('../services/teamService', () => ({
  teamService: {
    getTeams: jest.fn(() => Promise.resolve([])),
    createTeam: jest.fn(() => Promise.resolve({ id: 1, name: 'Test Team' }))
  }
}));

describe('TeamManagement', () => {
  test('renders team management interface', async () => {
    render(<TeamManagement />);
    
    expect(screen.getByText('Team Management')).toBeInTheDocument();
    expect(screen.getByText('Create New Team')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Your Teams')).toBeInTheDocument();
    });
  });

  test('creates new team', async () => {
    render(<TeamManagement />);
    
    fireEvent.click(screen.getByText('Create New Team'));
    fireEvent.change(screen.getByPlaceholderText('Enter team name'), {
      target: { value: 'New Team' }
    });
    fireEvent.click(screen.getByText('Create Team'));
    
    await waitFor(() => {
      expect(teamService.createTeam).toHaveBeenCalledWith({
        name: 'New Team',
        description: ''
      });
    });
  });
});
```

## Deployment Considerations

### Environment Variables

```bash
# .env file
REACT_APP_API_BASE_URL=https://api.yourdomain.com/api/v1
REACT_APP_ANALYTICS_ENABLED=true
REACT_APP_TEAM_FEATURES_ENABLED=true
```

### Build Configuration

```json
{
  "scripts": {
    "build": "react-scripts build",
    "build:teams": "react-scripts build --env=teams",
    "test:teams": "react-scripts test --testPathPattern=teams"
  }
}
```

## Troubleshooting

### Common Issues

1. **API Endpoints Not Found (404)**
   - Verify backend team collaboration routes are implemented
   - Check API base URL configuration
   - Ensure authentication headers are included

2. **TypeScript Errors**
   - Verify all UI components are properly typed
   - Check that Badge and Avatar components have required props
   - Ensure API response types match interface definitions

3. **Styling Issues**
   - Confirm Tailwind CSS is properly configured
   - Check that all required CSS classes are available
   - Verify component styling doesn't conflict with existing styles

4. **Performance Issues**
   - Implement lazy loading for large components
   - Add data caching for frequently accessed team data
   - Optimize re-renders with React.memo and useCallback

### Debug Mode

```typescript
// Enable debug logging
const DEBUG_TEAMS = process.env.NODE_ENV === 'development';

if (DEBUG_TEAMS) {
  console.log('Team component rendered with props:', props);
}
```

## Next Steps

After integration, consider these enhancements:

1. **Real-time Updates**: Implement WebSocket connections for live team data
2. **Mobile Optimization**: Add responsive design improvements for mobile devices
3. **Accessibility**: Enhance ARIA labels and keyboard navigation
4. **Internationalization**: Add multi-language support for team features
5. **Advanced Visualizations**: Integrate chart libraries for better data visualization
6. **Export Features**: Add data export capabilities for reports and analytics

## Support

For additional support with team collaboration frontend integration:

1. Check the component documentation in each file
2. Review the backend API documentation
3. Test components in isolation using Storybook
4. Monitor browser console for error messages
5. Use React Developer Tools for debugging state management

The team collaboration frontend provides a comprehensive foundation for team management, analytics, and optimization features that can be extended and customized based on your specific requirements.