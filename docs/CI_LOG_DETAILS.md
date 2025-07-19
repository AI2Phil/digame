    Current runner version: '2.326.0'
Runner Image Provisioner
Operating System
Runner Image
GITHUB_TOKEN Permissions
Secret source: Actions
Prepare workflow directory
Prepare all required actions
Getting action download info
Download immutable action package 'actions/checkout@v4'
Download immutable action package 'actions/setup-node@v4'
Download immutable action package 'actions/cache@v4'
Download immutable action package 'actions/upload-artifact@v4'
Complete job name: frontend-build
2s
Run actions/checkout@v4
Syncing repository: AI2Phil/digame
Getting Git version info
Temporarily overriding HOME='/home/runner/work/_temp/eda12a2b-ec17-495b-a3cd-9694e36e8627' before making global git config changes
Adding repository directory to the temporary git global config as a safe directory
/usr/bin/git config --global --add safe.directory /home/runner/work/digame/digame
Deleting the contents of '/home/runner/work/digame/digame'
Initializing the repository
Disabling automatic garbage collection
Setting up auth
Fetching the repository
Determining the checkout info
/usr/bin/git sparse-checkout disable
/usr/bin/git config --local --unset-all extensions.worktreeConfig
Checking out the ref
/usr/bin/git log -1 --format=%H
be48edce8635d8c88bc3fec8ea11fa6ef34ecc55
4s
Run actions/setup-node@v4
Found in cache @ /opt/hostedtoolcache/node/22.17.0/x64
Environment details
/opt/hostedtoolcache/node/22.17.0/x64/bin/npm config get cache
/home/runner/.npm
Cache hit for: node-cache-Linux-x64-npm-8f9be462a69aefeb721a1b7a5f4f4106e9666dd85a9d3ce1bb7e9aa05449e9ef
Received 176160768 of 316835510 (55.6%), 166.2 MBs/sec
Received 316835510 of 316835510 (100.0%), 173.1 MBs/sec
Cache Size: ~302 MB (316835510 B)
/usr/bin/tar -xf /home/runner/work/_temp/3e5c2de8-f24c-4a3c-9d69-056796cf64e5/cache.tzst -P -C /home/runner/work/digame/digame --use-compress-program unzstd
Cache restored successfully
Cache restored from key: node-cache-Linux-x64-npm-8f9be462a69aefeb721a1b7a5f4f4106e9666dd85a9d3ce1bb7e9aa05449e9ef
2s
Run actions/cache@v4
Cache hit for: Linux-node-22.x-05eaf738ce765aa63d8a5c48ea176c14d895acf2bc6117c2cc137088ec00036f
Received 163577856 of 280640284 (58.3%), 156.0 MBs/sec
Received 280640284 of 280640284 (100.0%), 175.0 MBs/sec
Cache Size: ~268 MB (280640284 B)
/usr/bin/tar -xf /home/runner/work/_temp/5e2f09c6-d1e2-415b-8973-5748efce5ec3/cache.tzst -P -C /home/runner/work/digame/digame --use-compress-program unzstd
Cache restored successfully
Cache restored from key: Linux-node-22.x-05eaf738ce765aa63d8a5c48ea176c14d895acf2bc6117c2cc137088ec00036f
41s
Run if [ "$VERBOSE" = "true" ]; then
42s
Run if [ "$VERBOSE" = "true" ]; then
43s
Run if [ "$VERBOSE" = "true" ]; then
17s
Run if [ "$VERBOSE" = "true" ]; then
🔧 Running ESLint with auto-fix...
5s
Run echo "🔧 Fixing JSX runtime configuration..."
🔧 Fixing JSX runtime configuration...

added 2 packages, and audited 2165 packages in 4s

334 packages are looking for funding
  run `npm fund` for details

3 low severity vulnerabilities

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
Checking tsconfig.json JSX settings...
✅ JSX configuration is correct
    
    Run echo "🔧 Fixing React Hooks violations..."
🔧 Fixing React Hooks violations...
Checking for remaining hook violations...

/home/runner/work/digame/digame/frontend/src/components/intelligence/IntelligenceInsights.tsx
Warning:   154:6  warning  React Hook useCallback has a missing dependency: 'getSampleComprehensiveData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/onboarding/ConversionPrompt.jsx
Warning:   20:9  warning  The 'conversionPrompts' object makes the dependencies of useEffect Hook (at line 141) change on every render. Move it inside the useEffect callback. Alternatively, wrap the initialization of 'conversionPrompts' in its own useMemo() Hook  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/onboarding/FeatureHubShowcase.jsx
Warning:   75:9  warning  The 'allFeatures' object makes the dependencies of useEffect Hook (at line 406) change on every render. Move it inside the useEffect callback. Alternatively, wrap the initialization of 'allFeatures' in its own useMemo() Hook  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/onboarding/ProgressiveOnboarding.tsx
Warning:   105:6  warning  React Hook useEffect has a missing dependency: 'onboardingSteps'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/onboarding/ValueDemonstration.jsx
Warning:   137:6  warning  React Hook useEffect has a missing dependency: 'currentRoleValue.annualValue'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/performance/PerformanceDashboard.tsx
Warning:   88:6  warning  React Hook useEffect has a missing dependency: 'fetchDashboardData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
Warning:   95:6  warning  React Hook useEffect has a missing dependency: 'fetchDashboardData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/performance/RealTimePerformanceMonitor.tsx
Warning:   117:6  warning  React Hook useEffect has a missing dependency: 'initializePerformanceMonitoring'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/platform-owner/GoLiveChecklist.jsx
Warning:   169:6  warning  React Hook useEffect has a missing dependency: 'performGoLiveCheck'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/platform-owner/PlatformDashboard.tsx
Warning:   64:6  warning  React Hook useEffect has a missing dependency: 'fetchDashboardData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/platform-owner/PlatformSettings.tsx
Warning:   73:6  warning  React Hook useEffect has a missing dependency: 'fetchSettings'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/reports/AdvancedReportingDashboard.tsx
Warning:   86:6  warning  React Hook useEffect has a missing dependency: 'fetchDashboardData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/reports/CustomReportBuilder.jsx
Warning:   39:6  warning  React Hook useEffect has a missing dependency: 'fetchBuilderData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/reports/DataVisualizationEngine.jsx
Warning:   27:6  warning  React Hook useEffect has a missing dependency: 'fetchEngineData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/reports/PredictiveAnalyticsEngine.jsx
Warning:   24:6  warning  React Hook useEffect has a missing dependency: 'fetchEngineData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/security/AdvancedSecurityDashboard.tsx
Warning:   200:6  warning  React Hook useEffect has a missing dependency: 'fetchSecurityData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/security/AuditTrailAnalytics.jsx
Warning:   32:6  warning  React Hook useEffect has a missing dependency: 'fetchAuditData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/security/ComplianceManagementSystem.jsx
Warning:   28:6  warning  React Hook useEffect has a missing dependency: 'fetchComplianceData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/security/RiskAssessmentEngine.jsx
Warning:   33:6  warning  React Hook useEffect has a missing dependency: 'fetchRiskData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/security/SecurityDashboard.tsx
Warning:   72:6  warning  React Hook useEffect has a missing dependency: 'fetchDashboardData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/settings/APIKeySettings.tsx
Warning:   129:6  warning  React Hook useEffect has a missing dependency: 'loadAPIKeys'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/settings/AppearanceSettings.tsx
Warning:   56:6  warning  React Hook useEffect has a missing dependency: 'loadAppearanceSettings'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/settings/NotificationSettings.tsx
Warning:   75:6  warning  React Hook useEffect has a missing dependency: 'loadPreferences'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/settings/SecuritySettings.tsx
Warning:   60:6  warning  React Hook useEffect has a missing dependency: 'loadSecuritySettings'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/settings/SystemConfigurationDashboard.tsx
Warning:   85:6  warning  React Hook useEffect has a missing dependency: 'fetchConfigurationData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/settings/UserApiKeyManagement.jsx
Warning:   165:6  warning  React Hook useEffect has a missing dependency: 'fetchApiKeys'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/settings/UserProfileSettings.tsx
Warning:   37:6  warning  React Hook useEffect has a missing dependency: 'loadProfile'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/simulation/SimulationDashboard.tsx
Warning:   131:6  warning  React Hook useEffect has missing dependencies: 'loadAnalytics' and 'loadSimulations'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/social/MentorshipPlatform.jsx
Warning:   32:6  warning  React Hook useEffect has a missing dependency: 'fetchDashboardData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/social/PeerMessaging.jsx
Warning:   24:6  warning  React Hook useEffect has a missing dependency: 'loadMessages'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/social/SkillMatchingAlgorithm.jsx
Warning:   268:6  warning  React Hook useEffect has a missing dependency: 'steps.length'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/team/AdvancedTeamAnalytics.tsx
Warning:   291:6  warning  React Hook useEffect has a missing dependency: 'loadAnalyticsData'. Either include it or remove the dependency array    react-hooks/exhaustive-deps
Warning:   350:6  warning  React Hook useCallback has a missing dependency: 'loadAnalyticsData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/team/CollaborationOptimization.tsx
Warning:   339:6  warning  React Hook useEffect has a missing dependency: 'loadOptimizationData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/team/SocialFeaturesEnhancement.jsx
Warning:   214:6  warning  React Hook useEffect has missing dependencies: 'networkingOpportunities', 'peerMatchingData', 'socialInsights', and 'socialMetricsData'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/team/TeamManagement.tsx
Warning:   68:6  warning  React Hook useEffect has a missing dependency: 'loadUserTeams'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/team/TeamPerformanceInsights.jsx
Warning:   362:6  warning  React Hook useEffect has missing dependencies: 'kpiData', 'predictiveAnalytics', 'teamComparisonData', and 'teamPerformanceData'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/ui/Drawer.jsx
Warning:   259:6  warning  React Hook React.useEffect has missing dependencies: 'handleDragEnd' and 'handleDragMove'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/ui/Popover.jsx
Warning:   564:6  warning  React Hook React.useCallback has missing dependencies: 'contentRef' and 'triggerRef'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/ui/Toast.jsx
Warning:   72:6  warning  React Hook useEffect has a missing dependency: 'handleClose'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/ui/Toaster.jsx
Warning:   48:6  warning  React Hook React.useCallback has a missing dependency: 'removeToast'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/visualizations/VisualizationDashboard.jsx
Warning:   62:6  warning  React Hook useEffect has a missing dependency: 'fetchUserModels'. Either include it or remove the dependency array         react-hooks/exhaustive-deps
Warning:   69:6  warning  React Hook useEffect has a missing dependency: 'fetchVisualizationData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/workflow/AdvancedWorkflowAnalytics.jsx
Warning:   194:6  warning  React Hook useEffect has a missing dependency: 'loadWorkflowAnalytics'. Either include it or remove the dependency array    react-hooks/exhaustive-deps
Warning:   274:6  warning  React Hook useCallback has a missing dependency: 'loadWorkflowAnalytics'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/workflow/MonitoringDashboard.tsx
Warning:   81:6  warning  React Hook useEffect has a missing dependency: 'loadDashboardData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
Warning:   88:6  warning  React Hook useEffect has a missing dependency: 'loadDashboardData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/workflow/WorkflowAutomationDashboard.tsx
Warning:   56:6  warning  React Hook useEffect has a missing dependency: 'fetchDashboardData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/workflow/WorkflowMarketplace.jsx
Warning:   532:6  warning  React Hook useEffect has a missing dependency: 'loadMarketplaceData'. Either include it or remove the dependency array    react-hooks/exhaustive-deps
Warning:   603:6  warning  React Hook useCallback has a missing dependency: 'loadMarketplaceData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/components/workflow/WorkflowVisualDesigner.tsx
Warning:   87:9  warning  The 'updateStepPosition' function makes the dependencies of useCallback Hook (at line 141) change on every render. Move it inside the useCallback callback. Alternatively, wrap the definition of 'updateStepPosition' in its own useCallback() Hook  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/contexts/AuthContext.tsx
Warning:   156:6  warning  React Hook useEffect has a missing dependency: 'refreshTokens'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/features/onboarding/hooks/useEnhancedOnboarding.ts
Warning:   308:6  warning  React Hook useCallback has a missing dependency: 'STEP_SEQUENCE'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
Warning:   326:6  warning  React Hook useCallback has a missing dependency: 'STEP_SEQUENCE'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/features/teams/components/SkillGapVisualization.tsx
Warning:   47:6  warning  React Hook useEffect has a missing dependency: 'fetchSkillGaps'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/hooks/useTeamCoordination.ts
Warning:   21:6  warning  React Hook useEffect has a missing dependency: 'loadCoordinationHistory'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/admin/dashboard.jsx
Warning:   77:6  warning  React Hook useEffect has a missing dependency: 'loadDashboardData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/admin/index.tsx
Warning:   91:6  warning  React Hook useEffect has a missing dependency: 'loadDashboardData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/ai-tools/index.tsx
Warning:   24:6  warning  React Hook useEffect has a missing dependency: 'fetchAIToolsData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/ai/index.tsx
Warning:   44:6  warning  React Hook useEffect has a missing dependency: 'fetchAIData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/ai/insights.jsx
Warning:   44:6  warning  React Hook useEffect has a missing dependency: 'loadAiInsights'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/analytics/business-intelligence.jsx
Warning:   93:6  warning  React Hook useEffect has a missing dependency: 'loadBusinessIntelligence'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/analytics/dashboard.jsx
Warning:   58:6  warning  React Hook useEffect has a missing dependency: 'loadAnalyticsData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/analytics/index.tsx
Warning:   80:6  warning  React Hook useEffect has a missing dependency: 'loadAnalyticsData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/analytics/mobile-advanced.jsx
Warning:   64:6  warning  React Hook useEffect has missing dependencies: 'loadAdvancedMobileAnalytics' and 'setupRealTimeUpdates'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/analytics/mobile.jsx
Warning:   50:6  warning  React Hook useEffect has a missing dependency: 'loadMobileAnalytics'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/analytics/web-advanced.jsx
Warning:   67:6  warning  React Hook useEffect has a missing dependency: 'loadAdvancedAnalytics'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/career/index.tsx
Warning:   29:6  warning  React Hook useEffect has a missing dependency: 'fetchCareerData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/career/jobs.tsx
Warning:   67:6  warning  React Hook useEffect has a missing dependency: 'fetchJobsData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/career/learning.tsx
Warning:   258:6  warning  React Hook useEffect has a missing dependency: 'mockData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/career/network.tsx
Warning:   301:6  warning  React Hook useEffect has a missing dependency: 'mockData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/digital-twin/my-twin.tsx
Warning:   27:8  warning  React Hook useEffect has a missing dependency: 'fetchTwinData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/enterprise/multi-tenant.jsx
Warning:   44:6  warning  React Hook useEffect has a missing dependency: 'fetchTenantData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/learning/analytics.tsx
Warning:   27:6  warning  React Hook useEffect has a missing dependency: 'fetchAnalyticsData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/learning/certifications.tsx
Warning:   26:6  warning  React Hook useEffect has a missing dependency: 'fetchCertifications'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/learning/courses.tsx
Warning:   32:6  warning  React Hook useEffect has a missing dependency: 'fetchCourses'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/learning/profile-overview.jsx
Warning:   61:6  warning  React Hook useEffect has a missing dependency: 'toast'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/onboarding/index.tsx
Warning:   66:6  warning  React Hook useEffect has a missing dependency: 'initializeOnboarding'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/performance/advanced.jsx
Warning:   149:6  warning  React Hook useEffect has missing dependencies: 'initializePerformanceMonitoring' and 'tabs'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/platform-owner/revenue.jsx
Warning:   14:6  warning  React Hook useEffect has a missing dependency: 'fetchRevenueAnalytics'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/platform-owner/tenants.jsx
Warning:   57:6  warning  React Hook useEffect has a missing dependency: 'fetchTenants'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/reports/analytics.tsx
Warning:   14:6  warning  React Hook useEffect has a missing dependency: 'fetchAnalyticsData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/security/access.tsx
Warning:   325:6  warning  React Hook useEffect has a missing dependency: 'mockData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/security/audit.tsx
Warning:   270:6  warning  React Hook useEffect has a missing dependency: 'mockData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/settings.tsx
Warning:   99:6  warning  React Hook useEffect has a missing dependency: 'settingsTabs'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/social/analytics.tsx
Warning:   27:6  warning  React Hook useEffect has a missing dependency: 'fetchAnalyticsData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/social/collaboration-enhanced.jsx
Warning:   60:6  warning  React Hook useEffect has a missing dependency: 'loadSocialCollaborationData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/social/events.tsx
Warning:   34:6  warning  React Hook useEffect has a missing dependency: 'fetchEvents'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/social/forums.tsx
Warning:   200:6  warning  React Hook useEffect has missing dependencies: 'mockCategories' and 'mockPosts'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/social/peer-matching.tsx
Warning:   31:6  warning  React Hook useEffect has a missing dependency: 'fetchMatches'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/tasks/ai-suggestions.tsx
Warning:   42:6  warning  React Hook useEffect has a missing dependency: 'fetchAISuggestions'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/tasks/analytics.tsx
Warning:   37:6  warning  React Hook useEffect has a missing dependency: 'fetchTaskAnalytics'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/tasks/projects.tsx
Warning:   43:6  warning  React Hook useEffect has a missing dependency: 'fetchProjects'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/team/dashboard.tsx
Warning:   38:6  warning  React Hook useEffect has a missing dependency: 'fetchTeamData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/workflow/calendar.tsx
Warning:   273:6  warning  React Hook useEffect has a missing dependency: 'mockData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/workflow/index.tsx
Warning:   31:8  warning  React Hook useEffect has a missing dependency: 'fetchWorkflowData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/workflow/notes.tsx
Warning:   41:6  warning  React Hook useEffect has a missing dependency: 'fetchNotes'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/workflow/optimization.tsx
Warning:   40:6  warning  React Hook useEffect has a missing dependency: 'fetchOptimizations'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/pages/workflow/prioritization.tsx
Warning:   295:6  warning  React Hook useEffect has a missing dependency: 'mockData'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/digame/digame/frontend/src/utils/PerformanceOptimization.ts
Warning:   240:24  warning  React Hook useCallback received a function whose dependencies are unknown. Pass an inline function instead  react-hooks/exhaustive-deps

✖ 100 problems (0 errors, 100 warnings)
    
    
    
    
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/UserListPage". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/UserListPage". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/WorkflowAutomationPage". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/WorkflowAutomationPage". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/admin/config". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/admin/config". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/admin/dashboard". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/admin/dashboard". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/admin". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/admin". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/ai-tools/communication". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/ai-tools/communication". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/ai-tools/documents". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/ai-tools/documents". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/ai-tools/email". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/ai-tools/email". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/ai-tools". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/ai-tools". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/ai-tools/language". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/ai-tools/language". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/ai-tools/meetings". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/social/find-peers". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/social/find-peers". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/social". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/social". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/social/learning-partners". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/social/learning-partners". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/social/mentorship". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/social/mentorship". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/social/network". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/social/network". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/social/peer-matching". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/social/peer-matching". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/tasks/ai-suggestions". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/tasks/ai-suggestions". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/tasks/analytics". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/tasks/analytics". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/tasks". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/tasks". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/tasks/projects". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/tasks/projects". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/en/team/dashboard". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:253)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at Zc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:70:481)
    at Z (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:76:89)
    at $c (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:78:98)
Error occurred prerendering page "/es/team/dashboard". Read more: https://nextjs.org/docs/messages/prerender-error
TypeError: Cannot read properties of null (reading 'useState')
    at exports.useState (/home/runner/work/digame/digame/frontend/node_modules/react/cjs/react.production.min.js:25:394)
    at i (/home/runner/work/digame/digame/frontend/.next/server/chunks/4175.js:5:7895)
    at Wc (/home/runner/work/digame/digame/node_modules/react-dom/cjs/react-dom-server.browser.production.min.js:68:44)
⚠ No build cache found. Please configure build caching for faster rebuilds. Read more: https://nextjs.org/docs/messages/no-cache
  ▲ Next.js 14.2.30
  - Experiments (use with caution):
    · esmExternals



Frontend warnings

frontend-build: frontend/src/components/platform-owner/PlatformDashboard.tsx#L64
React Hook useEffect has a missing dependency: 'fetchDashboardData'. Either include it or remove the dependency array
frontend-build: frontend/src/components/platform-owner/GoLiveChecklist.jsx#L169
React Hook useEffect has a missing dependency: 'performGoLiveCheck'. Either include it or remove the dependency array
frontend-build: frontend/src/components/performance/RealTimePerformanceMonitor.tsx#L117
React Hook useEffect has a missing dependency: 'initializePerformanceMonitoring'. Either include it or remove the dependency array
frontend-build: frontend/src/components/performance/PerformanceDashboard.tsx#L95
React Hook useEffect has a missing dependency: 'fetchDashboardData'. Either include it or remove the dependency array
frontend-build: frontend/src/components/performance/PerformanceDashboard.tsx#L88
React Hook useEffect has a missing dependency: 'fetchDashboardData'. Either include it or remove the dependency array
frontend-build: frontend/src/components/onboarding/ValueDemonstration.jsx#L137
React Hook useEffect has a missing dependency: 'currentRoleValue.annualValue'. Either include it or remove the dependency array
frontend-build: frontend/src/components/onboarding/ProgressiveOnboarding.tsx#L105
React Hook useEffect has a missing dependency: 'onboardingSteps'. Either include it or remove the dependency array
frontend-build: frontend/src/components/onboarding/FeatureHubShowcase.jsx#L75
The 'allFeatures' object makes the dependencies of useEffect Hook (at line 406) change on every render. Move it inside the useEffect callback. Alternatively, wrap the initialization of 'allFeatures' in its own useMemo() Hook
frontend-build: frontend/src/components/onboarding/ConversionPrompt.jsx#L20
The 'conversionPrompts' object makes the dependencies of useEffect Hook (at line 141) change on every render. Move it inside the useEffect callback. Alternatively, wrap the initialization of 'conversionPrompts' in its own useMemo() Hook
frontend-build: frontend/src/components/intelligence/IntelligenceInsights.tsx#L154
React Hook useCallback has a missing dependency: 'getSampleComprehensiveData'. Either include it or remove the dependency array


Backend - clean test

Current runner version: '2.326.0'
Runner Image Provisioner
Operating System
Runner Image
GITHUB_TOKEN Permissions
Secret source: Actions
Prepare workflow directory
Prepare all required actions
Getting action download info
Download immutable action package 'actions/checkout@v4'
Download immutable action package 'actions/setup-node@v4'
Complete job name: backend-test
22s
Checking docker version
Clean up resources from previous jobs
Create local container network
Starting postgres service container
Waiting for all services to be ready
2s
Run actions/checkout@v4
Syncing repository: AI2Phil/digame
Getting Git version info
Temporarily overriding HOME='/home/runner/work/_temp/2934efec-c4ec-4e56-b671-21298157f6a1' before making global git config changes
Adding repository directory to the temporary git global config as a safe directory
/usr/bin/git config --global --add safe.directory /home/runner/work/digame/digame
Deleting the contents of '/home/runner/work/digame/digame'
Initializing the repository
Disabling automatic garbage collection
Setting up auth
Fetching the repository
Determining the checkout info
/usr/bin/git sparse-checkout disable
/usr/bin/git config --local --unset-all extensions.worktreeConfig
Checking out the ref
/usr/bin/git log -1 --format=%H
be48edce8635d8c88bc3fec8ea11fa6ef34ecc55
3s
Run actions/setup-node@v4
Found in cache @ /opt/hostedtoolcache/node/22.17.0/x64
Environment details
/opt/hostedtoolcache/node/22.17.0/x64/bin/npm config get cache
/home/runner/.npm
npm cache is not found
6s
Run if [ "$VERBOSE" = "true" ]; then
0s
Run if [ "$VERBOSE" = "true" ]; then
⚠️ Backend linting issues found but continuing
1s
Run if [ "$VERBOSE" = "true" ]; then
No tests yet
0s
Run echo "📁 Creating SQLite database directory to prevent startup crash..."
📁 Creating SQLite database directory to prevent startup crash...
✅ SQLite directory created: /home/runner/work/digame/digame/backend/data
0s
Run echo "⏳ Waiting for PostgreSQL..."
⏳ Waiting for PostgreSQL...
localhost:5432 - accepting connections
✅ PostgreSQL is ready
localhost:5432 - accepting connections
5s
Run echo "🚀 Verifying backend server can start on port $BACKEND_PORT..."
🚀 Verifying backend server can start on port 3001...

> digame-backend@1.0.0 start
> node src/server.js

ℹ️ Redis not configured - running without cache layer
🧠 Multi-layer cache manager initialized
🔧 Database adapter initialized: POSTGRESQL
🧠 Intelligent Cache Manager initialized with predictive capabilities
🔥 Advanced Cache Warming Strategies initialized
✅ Using environment port: 3001

🚀 Digame Backend Server Started Successfully!
================================================
📍 Server URL: http://localhost:3001
📊 Health check: http://localhost:3001/health
⚡ Performance: http://localhost:3001/health/performance
🗃️  Database: http://localhost:3001/health/database
🧠 Cache: http://localhost:3001/health/cache
🔧 Migration: http://localhost:3001/health/migration
🤖 Intelligent Cache: http://localhost:3001/api/intelligent-cache/health
🔥 Cache Warming: http://localhost:3001/api/intelligent-cache/strategies
📈 Cache Analytics: http://localhost:3001/api/intelligent-cache/analytics
🔐 Auth endpoint: http://localhost:3001/auth/login
🎮 Demo endpoint: http://localhost:3001/auth/demo
================================================

📝 Service registered at port 3001
✅ PostgreSQL adapter connected
✅ Backend server started successfully

🛑 Shutting down backend server...
🧹 Service unregistered
1s
Post job cleanup.
/usr/bin/tar --posix -cf cache.tzst --exclude cache.tzst -P -C /home/runner/work/digame/digame --files-from manifest.txt --use-compress-program zstdmt
Sent 12720144 of 12720144 (100.0%), 31.8 MBs/sec
Cache saved with the key: node-cache-Linux-x64-npm-8c8d9933646ed66bb48bf7415967f925fe562544a4a35a0d3f71024f25d42311
0s
Post job cleanup.
/usr/bin/git version
git version 2.50.1
Temporarily overriding HOME='/home/runner/work/_temp/16265667-60bc-4e32-9ca6-b366fb5d2160' before making global git config changes
Adding repository directory to the temporary git global config as a safe directory
/usr/bin/git config --global --add safe.directory /home/runner/work/digame/digame
/usr/bin/git config --local --name-only --get-regexp core\.sshCommand
/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'core\.sshCommand' && git config --local --unset-all 'core.sshCommand' || :"
/usr/bin/git config --local --name-only --get-regexp http\.https\:\/\/github\.com\/\.extraheader
http.https://github.com/.extraheader
/usr/bin/git config --local --unset-all http.https://github.com/.extraheader
/usr/bin/git submodule foreach --recursive sh -c "git config --local --name-only --get-regexp 'http\.https\:\/\/github\.com\/\.extraheader' && git config --local --unset-all 'http.https://github.com/.extraheader' || :"
0s
Print service container logs: 874fb596a63d411b878403557263fd9a_postgres15_c24ef6
/usr/bin/docker logs --details f003b627dedf8b074d4a83553ede26c1cc95d21fca680033c316b1a2db4b95dc
 initdb: warning: enabling "trust" authentication for local connections
 The files belonging to this database system will be owned by user "postgres".
 initdb: hint: You can change this by editing pg_hba.conf or using the option -A, or --auth-local and --auth-host, the next time you run initdb.
 This user must also own the server process.
 2025-07-19 02:39:53.337 UTC [1] LOG:  starting PostgreSQL 15.13 (Debian 15.13-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit
 2025-07-19 02:39:53.338 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
 2025-07-19 02:39:53.338 UTC [1] LOG:  listening on IPv6 address "::", port 5432
 2025-07-19 02:39:53.339 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
 2025-07-19 02:39:53.344 UTC [62] LOG:  database system was shut down at 2025-07-19 02:39:53 UTC
 2025-07-19 02:39:53.348 UTC [1] LOG:  database system is ready to accept connections
 2025-07-19 02:40:02.337 UTC [73] FATAL:  role "root" does not exist
 2025-07-19 02:40:12.452 UTC [81] FATAL:  role "root" does not exist
 2025-07-19 02:40:22.554 UTC [92] FATAL:  role "root" does not exist
 
 The database cluster will be initialized with locale "en_US.utf8".
 The default database encoding has accordingly been set to "UTF8".
 The default text search configuration will be set to "english".
 
 Data page checksums are disabled.
 
 fixing permissions on existing directory /var/lib/postgresql/data ... ok
 creating subdirectories ... ok
 selecting dynamic shared memory implementation ... posix
 selecting default max_connections ... 100
 selecting default shared_buffers ... 128MB
 selecting default time zone ... Etc/UTC
 creating configuration files ... ok
 running bootstrap script ... ok
 performing post-bootstrap initialization ... ok
 syncing data to disk ... ok
 
 
 Success. You can now start the database server using:
 
     pg_ctl -D /var/lib/postgresql/data -l logfile start
 
 waiting for server to start....2025-07-19 02:39:53.026 UTC [46] LOG:  starting PostgreSQL 15.13 (Debian 15.13-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit
 2025-07-19 02:39:53.027 UTC [46] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
 2025-07-19 02:39:53.030 UTC [49] LOG:  database system was shut down at 2025-07-19 02:39:52 UTC
 2025-07-19 02:39:53.034 UTC [46] LOG:  database system is ready to accept connections
  done
 server started
 CREATE DATABASE
 
 
 /usr/local/bin/docker-entrypoint.sh: ignoring /docker-entrypoint-initdb.d/*
 
 waiting for server to shut down...2025-07-19 02:39:53.216 UTC [46] LOG:  received fast shutdown request
 .2025-07-19 02:39:53.217 UTC [46] LOG:  aborting any active transactions
 2025-07-19 02:39:53.219 UTC [46] LOG:  background worker "logical replication launcher" (PID 52) exited with exit code 1
 2025-07-19 02:39:53.220 UTC [47] LOG:  shutting down
 2025-07-19 02:39:53.221 UTC [47] LOG:  checkpoint starting: shutdown immediate
 2025-07-19 02:39:53.240 UTC [47] LOG:  checkpoint complete: wrote 918 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.015 s, sync=0.002 s, total=0.020 s; sync files=301, longest=0.001 s, average=0.001 s; distance=4222 kB, estimate=4222 kB
 2025-07-19 02:39:53.246 UTC [46] LOG:  database system is shut down
  done
 server stopped
 
 PostgreSQL init process complete; ready for start up.
 
Stop and remove container: 874fb596a63d411b878403557263fd9a_postgres15_c24ef6
/usr/bin/docker rm --force f003b627dedf8b074d4a83553ede26c1cc95d21fca680033c316b1a2db4b95dc
f003b627dedf8b074d4a83553ede26c1cc95d21fca680033c316b1a2db4b95dc
Remove container network: github_network_b16ed03d745143edb48f3b2a82651ebf
/usr/bin/docker network rm github_network_b16ed03d745143edb48f3b2a82651ebf
github_network_b16ed03d745143edb48f3b2a82651ebf
1s
Cleaning up orphan processes