import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';

const GettingStartedGuide = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('overview');
  const [completedSections, setCompletedSections] = useState([]);
  const [progress, setProgress] = useState(0);

  const sections = [
    {
      id: 'overview',
      title: 'Platform Overview',
      icon: '🏠',
      estimatedTime: '5 min',
      description: 'Get familiar with the main features and navigation'
    },
    {
      id: 'navigation',
      title: 'Navigation Guide',
      icon: '🧭',
      estimatedTime: '3 min',
      description: 'Learn how to navigate through different sections'
    },
    {
      id: 'projects',
      title: 'Creating Projects',
      icon: '📁',
      estimatedTime: '7 min',
      description: 'Set up your first project and organize your work'
    },
    {
      id: 'tasks',
      title: 'Task Management',
      icon: '✅',
      estimatedTime: '8 min',
      description: 'Create, assign, and track tasks effectively'
    },
    {
      id: 'collaboration',
      title: 'Team Collaboration',
      icon: '👥',
      estimatedTime: '6 min',
      description: 'Invite team members and collaborate efficiently'
    },
    {
      id: 'integrations',
      title: 'Integrations Setup',
      icon: '🔗',
      estimatedTime: '10 min',
      description: 'Connect your favorite tools and services'
    },
    {
      id: 'reporting',
      title: 'Reports & Analytics',
      icon: '📊',
      estimatedTime: '5 min',
      description: 'Generate insights and track performance'
    },
    {
      id: 'tips',
      title: 'Pro Tips & Best Practices',
      icon: '💡',
      estimatedTime: '8 min',
      description: 'Advanced features and optimization strategies'
    }
  ];

  useEffect(() => {
    // Calculate progress based on completed sections
    const progressPercentage = (completedSections.length / sections.length) * 100;
    setProgress(progressPercentage);
  }, [completedSections]);

  const markSectionComplete = (sectionId) => {
    if (!completedSections.includes(sectionId)) {
      setCompletedSections(prev => [...prev, sectionId]);
    }
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Welcome to the Platform! 🎉</h3>
              <p className="text-gray-600 mb-6">
                This comprehensive platform is designed to streamline your workflow, enhance team collaboration, 
                and provide powerful insights into your projects and processes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-2xl mb-2">📋</div>
                <h4 className="font-semibold text-gray-900 mb-2">Project Management</h4>
                <p className="text-sm text-gray-600">
                  Organize work into projects, create tasks, set deadlines, and track progress with intuitive tools.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-2xl mb-2">👥</div>
                <h4 className="font-semibold text-gray-900 mb-2">Team Collaboration</h4>
                <p className="text-sm text-gray-600">
                  Invite team members, assign roles, share files, and communicate effectively in one place.
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-2xl mb-2">📊</div>
                <h4 className="font-semibold text-gray-900 mb-2">Analytics & Reporting</h4>
                <p className="text-sm text-gray-600">
                  Generate detailed reports, track KPIs, and gain insights into team performance and productivity.
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-2xl mb-2">🔗</div>
                <h4 className="font-semibold text-gray-900 mb-2">Integrations</h4>
                <p className="text-sm text-gray-600">
                  Connect with popular tools like Slack, Google Workspace, Jira, and many more.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-2xl mb-2">🔒</div>
                <h4 className="font-semibold text-gray-900 mb-2">Security & Privacy</h4>
                <p className="text-sm text-gray-600">
                  Enterprise-grade security with role-based access control and data encryption.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-2xl mb-2">📱</div>
                <h4 className="font-semibold text-gray-900 mb-2">Mobile Ready</h4>
                <p className="text-sm text-gray-600">
                  Access your work from anywhere with our responsive design and mobile apps.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Quick Start Checklist</h4>
              <div className="space-y-2">
                {[
                  'Complete your profile setup',
                  'Create your first project',
                  'Invite team members',
                  'Set up key integrations',
                  'Explore reporting features'
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-gray-300 rounded"></div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'navigation':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Navigation Guide 🧭</h3>
              <p className="text-gray-600 mb-6">
                Learn how to efficiently navigate through the platform and find what you need quickly.
              </p>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Main Navigation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">📊 Dashboard</h5>
                    <p className="text-sm text-gray-600">Your central hub with overview of all activities, recent updates, and key metrics.</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">📋 Tasks & Projects</h5>
                    <p className="text-sm text-gray-600">Manage your projects, create tasks, and track progress across all your work.</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">👥 Team</h5>
                    <p className="text-sm text-gray-600">Manage team members, roles, and collaboration settings.</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">📈 Analytics</h5>
                    <p className="text-sm text-gray-600">View detailed reports, performance metrics, and business insights.</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-mono">Ctrl + K</div>
                    <span className="text-gray-700">Open command palette for quick navigation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-mono">Ctrl + N</div>
                    <span className="text-gray-700">Create new task or project</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-mono">Ctrl + /</div>
                    <span className="text-gray-700">Open help and shortcuts</span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Search & Filters</h4>
                <p className="text-gray-600 mb-3">
                  Use the global search bar to find projects, tasks, team members, or any content across the platform.
                </p>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm text-gray-700 mb-2"><strong>Search Tips:</strong></p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Use quotes for exact phrases: "project alpha"</li>
                    <li>• Filter by type: task:urgent or project:marketing</li>
                    <li>• Search by assignee: @john or assigned:john</li>
                    <li>• Date ranges: created:last-week or due:today</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Creating Projects 📁</h3>
              <p className="text-gray-600 mb-6">
                Projects are the foundation of your work organization. Learn how to create and manage them effectively.
              </p>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Step 1: Create Your First Project</h4>
                <div className="space-y-3">
                  <p className="text-gray-600">Navigate to the Projects section and click "New Project"</p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-800"><strong>Pro Tip:</strong> Use descriptive project names and add detailed descriptions to help team members understand the project's purpose.</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Step 2: Project Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Basic Information</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Project name and description</li>
                      <li>• Start and end dates</li>
                      <li>• Priority level</li>
                      <li>• Project status</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Access & Permissions</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Visibility settings</li>
                      <li>• Team member access</li>
                      <li>• Role-based permissions</li>
                      <li>• Guest access options</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Step 3: Project Templates</h4>
                <p className="text-gray-600 mb-3">Save time by using pre-built templates for common project types:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded p-3 text-center">
                    <div className="text-2xl mb-2">🚀</div>
                    <h6 className="font-medium text-gray-800">Product Launch</h6>
                    <p className="text-xs text-gray-600">Marketing, development, and launch phases</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3 text-center">
                    <div className="text-2xl mb-2">📱</div>
                    <h6 className="font-medium text-gray-800">Software Development</h6>
                    <p className="text-xs text-gray-600">Agile workflow with sprints and releases</p>
                  </div>
                  <div className="bg-gray-50 rounded p-3 text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <h6 className="font-medium text-gray-800">Marketing Campaign</h6>
                    <p className="text-xs text-gray-600">Campaign planning and execution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Task Management ✅</h3>
              <p className="text-gray-600 mb-6">
                Master task creation, assignment, and tracking to keep your projects moving forward.
              </p>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Creating Effective Tasks</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Task Essentials</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Clear, actionable title</li>
                      <li>• Detailed description with acceptance criteria</li>
                      <li>• Appropriate priority level</li>
                      <li>• Realistic due date</li>
                      <li>• Relevant tags and labels</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <p className="text-sm text-green-800"><strong>Best Practice:</strong> Use the SMART criteria - Specific, Measurable, Achievable, Relevant, Time-bound.</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Task Assignment & Collaboration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Assignment Options</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Single assignee</li>
                      <li>• Multiple collaborators</li>
                      <li>• Team assignment</li>
                      <li>• Auto-assignment rules</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Collaboration Features</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Comments and discussions</li>
                      <li>• File attachments</li>
                      <li>• @mentions and notifications</li>
                      <li>• Activity timeline</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Task Status & Workflow</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { status: 'To Do', color: 'bg-gray-100 text-gray-800' },
                    { status: 'In Progress', color: 'bg-blue-100 text-blue-800' },
                    { status: 'Review', color: 'bg-yellow-100 text-yellow-800' },
                    { status: 'Done', color: 'bg-green-100 text-green-800' }
                  ].map((item, index) => (
                    <span key={index} className={`px-2 py-1 rounded text-xs font-medium ${item.color}`}>
                      {item.status}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Customize your workflow stages to match your team's process. Drag and drop tasks between columns for easy status updates.
                </p>
              </div>
            </div>
          </div>
        );

      case 'collaboration':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Collaboration 👥</h3>
              <p className="text-gray-600 mb-6">
                Learn how to effectively collaborate with your team members and manage permissions.
              </p>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Inviting Team Members</h4>
                <div className="space-y-3">
                  <p className="text-gray-600">Add team members to your workspace and projects:</p>
                  <ol className="text-sm text-gray-600 space-y-2">
                    <li>1. Go to Team section and click "Invite Members"</li>
                    <li>2. Enter email addresses (one per line or comma-separated)</li>
                    <li>3. Assign appropriate roles and permissions</li>
                    <li>4. Send invitations with a welcome message</li>
                  </ol>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Roles & Permissions</h4>
                <div className="space-y-3">
                  {[
                    { role: 'Owner', description: 'Full access to all features and settings', color: 'bg-red-100 text-red-800' },
                    { role: 'Admin', description: 'Manage projects, users, and most settings', color: 'bg-orange-100 text-orange-800' },
                    { role: 'Member', description: 'Create and manage tasks, participate in projects', color: 'bg-blue-100 text-blue-800' },
                    { role: 'Viewer', description: 'Read-only access to assigned projects', color: 'bg-gray-100 text-gray-800' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${item.color}`}>
                          {item.role}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Communication Tools</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">💬 Comments & Discussions</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Task-level comments</li>
                      <li>• Project discussions</li>
                      <li>• @mentions for notifications</li>
                      <li>• Rich text formatting</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">🔔 Notifications</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Real-time updates</li>
                      <li>• Email summaries</li>
                      <li>• Mobile push notifications</li>
                      <li>• Custom notification rules</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Integrations Setup 🔗</h3>
              <p className="text-gray-600 mb-6">
                Connect your favorite tools to create a seamless workflow across all your applications.
              </p>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Popular Integrations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Slack', icon: '💬', description: 'Team communication' },
                    { name: 'Google Workspace', icon: '📧', description: 'Email & calendar sync' },
                    { name: 'Jira', icon: '🎯', description: 'Issue tracking' },
                    { name: 'GitHub', icon: '💻', description: 'Code repository' },
                    { name: 'Salesforce', icon: '🏢', description: 'CRM integration' },
                    { name: 'Zoom', icon: '📹', description: 'Video conferencing' }
                  ].map((integration, index) => (
                    <div key={index} className="bg-gray-50 rounded p-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xl">{integration.icon}</span>
                        <h5 className="font-medium text-gray-800">{integration.name}</h5>
                      </div>
                      <p className="text-xs text-gray-600">{integration.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Setting Up Integrations</h4>
                <div className="space-y-3">
                  <ol className="text-sm text-gray-600 space-y-2">
                    <li>1. Navigate to Settings → Integrations</li>
                    <li>2. Browse available integrations or search for specific tools</li>
                    <li>3. Click "Connect" and follow the authentication process</li>
                    <li>4. Configure sync settings and permissions</li>
                    <li>5. Test the integration to ensure it's working correctly</li>
                  </ol>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p className="text-sm text-yellow-800"><strong>Note:</strong> Some integrations may require admin permissions or specific subscription plans.</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Integration Benefits</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">🔄 Automated Workflows</h5>
                    <p className="text-sm text-gray-600">Automatically create tasks from emails, sync calendar events, and update project status.</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">📊 Unified Reporting</h5>
                    <p className="text-sm text-gray-600">Combine data from multiple tools for comprehensive analytics and insights.</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">🔔 Smart Notifications</h5>
                    <p className="text-sm text-gray-600">Receive relevant updates across all your connected platforms.</p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">⚡ Increased Efficiency</h5>
                    <p className="text-sm text-gray-600">Reduce manual work and context switching between applications.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'reporting':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Reports & Analytics 📊</h3>
              <p className="text-gray-600 mb-6">
                Generate powerful insights and track performance with comprehensive reporting tools.
              </p>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Available Reports</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Project Progress', description: 'Track completion rates and milestones' },
                    { name: 'Team Performance', description: 'Analyze productivity and workload distribution' },
                    { name: 'Time Tracking', description: 'Monitor time spent on tasks and projects' },
                    { name: 'Budget Analysis', description: 'Track project costs and resource allocation' },
                    { name: 'Quality Metrics', description: 'Measure task completion quality and rework rates' },
                    { name: 'Custom Reports', description: 'Create tailored reports for specific needs' }
                  ].map((report, index) => (
                    <div key={index} className="bg-gray-50 rounded p-3">
                      <h5 className="font-medium text-gray-800 mb-1">{report.name}</h5>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Creating Custom Reports</h4>
                <div className="space-y-3">
                  <ol className="text-sm text-gray-600 space-y-2">
                    <li>1. Go to Analytics → Custom Reports</li>
                    <li>2. Select data sources (projects, tasks, time entries, etc.)</li>
                    <li>3. Choose metrics and dimensions</li>
                    <li>4. Apply filters and date ranges</li>
                    <li>5. Customize visualization (charts, tables, graphs)</li>
                    <li>6. Save and schedule automated delivery</li>
                  </ol>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Dashboard Widgets</h4>
                <p className="text-gray-600 mb-3">Add key metrics to your dashboard for quick insights:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { metric: 'Tasks Completed', icon: '✅' },
                    { metric: 'Project Health', icon: '🎯' },
                    { metric: 'Team Velocity', icon: '⚡' },
                    { metric: 'Budget Status', icon: '💰' }
                  ].map((widget, index) => (
                    <div key={index} className="bg-blue-50 rounded p-3 text-center">
                      <div className="text-xl mb-1">{widget.icon}</div>
                      <p className="text-xs text-gray-700">{widget.metric}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'tips':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Pro Tips & Best Practices 💡</h3>
              <p className="text-gray-600 mb-6">
                Advanced strategies and hidden features to maximize your productivity and team efficiency.
              </p>
            </div>

            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Productivity Tips</h4>
                <div className="space-y-4">
                  {[
                    {
                      tip: 'Use keyboard shortcuts',
                      description: 'Master Ctrl+K for quick navigation, Ctrl+N for new tasks, and Ctrl+/ for help.',
                      icon: '⌨️'
                    },
                    {
                      tip: 'Set up automation rules',
                      description: 'Automatically assign tasks, update statuses, and send notifications based on triggers.',
                      icon: '🤖'
                    },
                    {
                      tip: 'Use templates for recurring work',
                      description: 'Create project and task templates to standardize processes and save time.',
                      icon: '📋'
                    },
                    {
                      tip: 'Leverage bulk operations',
                      description: 'Select multiple tasks to update status, assignee, or due dates all at once.',
                      icon: '⚡'
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="text-xl">{item.icon}</div>
                      <div>
                        <h5 className="font-medium text-gray-800 mb-1">{item.tip}</h5>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Team Management Best Practices</h4>
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <h5 className="font-medium text-green-800 mb-1">🎯 Clear Communication</h5>
                    <p className="text-sm text-green-700">Use @mentions, clear task descriptions, and regular check-ins to keep everyone aligned.</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <h5 className="font-medium text-blue-800 mb-1">📊 Regular Reviews</h5>
                    <p className="text-sm text-blue-700">Schedule weekly team reviews to discuss progress, blockers, and upcoming priorities.</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded p-3">
                    <h5 className="font-medium text-purple-800 mb-1">🔄 Iterative Improvement</h5>
                    <p className="text-sm text-purple-700">Regularly review and optimize your workflows based on team feedback and performance data.</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Advanced Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">🔍 Advanced Search</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Use filters: status:open priority:high</li>
                      <li>• Date ranges: created:last-month</li>
                      <li>• Assignee search: assigned:@username</li>
                      <li>• Save frequent searches</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">📈 Custom Fields</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Add project-specific fields</li>
                      <li>• Track custom metrics</li>
                      <li>• Create dropdown options</li>
                      <li>• Use in reports and filters</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">🔗 API & Webhooks</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Integrate with custom tools</li>
                      <li>• Automate external workflows</li>
                      <li>• Real-time data sync</li>
                      <li>• Custom integrations</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">📱 Mobile Optimization</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Offline task management</li>
                      <li>• Push notifications</li>
                      <li>• Quick task creation</li>
                      <li>• Mobile-friendly interface</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Getting Started Guide"
        subtitle="Complete walkthrough of platform features and best practices"
        breadcrumbs={[
          { label: 'Onboarding', href: '/onboarding' },
          { label: 'Getting Started', href: '/onboarding/getting-started' }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Learning Progress</h2>
            <div className="text-sm text-gray-500">
              {completedSections.length} of {sections.length} sections completed
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{Math.round(progress)}% Complete</span>
            <span className="text-green-600 font-medium">
              {completedSections.length === sections.length ? 'All done! 🎉' : 'Keep going!'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-4">Guide Sections</h3>
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-50 border border-blue-200 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{section.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{section.title}</p>
                          {completedSections.includes(section.id) && (
                            <span className="text-green-600 text-sm">✓</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{section.estimatedTime}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => router.push('/onboarding')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Back to Onboarding
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {sections.find(s => s.id === activeSection)?.icon}
                  </span>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {sections.find(s => s.id === activeSection)?.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {sections.find(s => s.id === activeSection)?.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {sections.find(s => s.id === activeSection)?.estimatedTime}
                  </span>
                  {!completedSections.includes(activeSection) && (
                    <button
                      onClick={() => markSectionComplete(activeSection)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      Mark Complete
                    </button>
                  )}
                  {completedSections.includes(activeSection) && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Section Content */}
              <div className="prose max-w-none">
                {renderSectionContent()}
              </div>

              {/* Section Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.id === activeSection);
                    if (currentIndex > 0) {
                      setActiveSection(sections[currentIndex - 1].id);
                    }
                  }}
                  disabled={sections.findIndex(s => s.id === activeSection) === 0}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    sections.findIndex(s => s.id === activeSection) === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ← Previous Section
                </button>

                <button
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.id === activeSection);
                    if (currentIndex < sections.length - 1) {
                      setActiveSection(sections[currentIndex + 1].id);
                    }
                  }}
                  disabled={sections.findIndex(s => s.id === activeSection) === sections.length - 1}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    sections.findIndex(s => s.id === activeSection) === sections.length - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Next Section →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GettingStartedGuide;