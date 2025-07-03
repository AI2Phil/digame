import React, { useState } from 'react';
import Head from 'next/head';
import { Workflow, Plus, Play, Pause, Settings, Zap, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import PageHeader from '../../src/components/navigation/PageHeader';

export default function WorkflowAutomation() {
  const [activeTab, setActiveTab] = useState('workflows');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const workflows = [
    {
      id: 1,
      name: 'Daily Standup Automation',
      description: 'Automatically collect team updates and generate standup reports',
      status: 'active',
      triggers: 2,
      actions: 5,
      runs: 847,
      success_rate: 0.98,
      last_run: '2 hours ago',
      category: 'team',
      complexity: 'medium'
    },
    {
      id: 2,
      name: 'Lead Qualification Pipeline',
      description: 'Score and route leads based on engagement and profile data',
      status: 'active',
      triggers: 3,
      actions: 8,
      runs: 1234,
      success_rate: 0.94,
      last_run: '15 minutes ago',
      category: 'sales',
      complexity: 'high'
    },
    {
      id: 3,
      name: 'Content Publishing Schedule',
      description: 'Automatically publish and promote content across platforms',
      status: 'paused',
      triggers: 1,
      actions: 6,
      runs: 456,
      success_rate: 0.96,
      last_run: '1 day ago',
      category: 'marketing',
      complexity: 'medium'
    },
    {
      id: 4,
      name: 'Expense Report Processing',
      description: 'Extract data from receipts and create expense reports',
      status: 'active',
      triggers: 2,
      actions: 4,
      runs: 289,
      success_rate: 0.92,
      last_run: '30 minutes ago',
      category: 'finance',
      complexity: 'low'
    },
    {
      id: 5,
      name: 'Customer Onboarding Flow',
      description: 'Guide new customers through setup and initial configuration',
      status: 'draft',
      triggers: 4,
      actions: 12,
      runs: 0,
      success_rate: 0,
      last_run: 'Never',
      category: 'customer',
      complexity: 'high'
    }
  ];

  const templates = [
    {
      id: 1,
      name: 'Email Marketing Sequence',
      description: 'Automated email campaigns with personalization',
      category: 'marketing',
      complexity: 'medium',
      estimated_setup: '15 minutes'
    },
    {
      id: 2,
      name: 'Invoice Generation & Tracking',
      description: 'Create and track invoices with payment reminders',
      category: 'finance',
      complexity: 'low',
      estimated_setup: '10 minutes'
    },
    {
      id: 3,
      name: 'Social Media Scheduler',
      description: 'Schedule and cross-post content across platforms',
      category: 'marketing',
      complexity: 'medium',
      estimated_setup: '20 minutes'
    },
    {
      id: 4,
      name: 'Task Assignment & Tracking',
      description: 'Automatically assign and track project tasks',
      category: 'project',
      complexity: 'high',
      estimated_setup: '30 minutes'
    }
  ];

  const analytics = {
    total_workflows: 5,
    active_workflows: 3,
    total_runs: 2826,
    success_rate: 0.95,
    time_saved: '47 hours this month',
    cost_savings: '$2,340',
    top_categories: [
      { category: 'Marketing', count: 2, runs: 1200 },
      { category: 'Sales', count: 1, runs: 1234 },
      { category: 'Finance', count: 1, runs: 289 },
      { category: 'Team', count: 1, runs: 847 }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'marketing': return '📢';
      case 'sales': return '💰';
      case 'finance': return '💳';
      case 'team': return '👥';
      case 'customer': return '🤝';
      case 'project': return '📋';
      default: return '⚡';
    }
  };

  return (
    <>
      <Head>
        <title>Workflow & Automation - Digame</title>
        <meta name="description" content="Automate your workflows and boost productivity" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="Workflow & Automation"
          subtitle="Streamline processes and boost productivity with intelligent automation"
          icon={<Workflow className="w-6 h-6 text-purple-600" />}
          badge="AUTOMATION"
        />

        <div className="container mx-auto px-4 py-8">
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Workflows</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.total_workflows}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Workflow className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-green-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {analytics.active_workflows} active
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Runs</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.total_runs.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {Math.round(analytics.success_rate * 100)}% success rate
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Time Saved</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.time_saved}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-purple-600">
                  <Zap className="w-4 h-4 mr-1" />
                  Productivity boost
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cost Savings</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.cost_savings}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-orange-600">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  This month
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: 'workflows', label: 'My Workflows', icon: <Workflow className="w-4 h-4" /> },
                  { id: 'templates', label: 'Templates', icon: <Plus className="w-4 h-4" /> },
                  { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* My Workflows Tab */}
              {activeTab === 'workflows' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">My Workflows</h3>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                      <span>Create Workflow</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {workflows.map((workflow) => (
                      <div key={workflow.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getCategoryIcon(workflow.category)}</span>
                            <div>
                              <h4 className="font-semibold text-gray-900">{workflow.name}</h4>
                              <p className="text-sm text-gray-600">{workflow.description}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workflow.status)}`}>
                            {workflow.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{workflow.triggers}</div>
                            <div className="text-xs text-gray-500">Triggers</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{workflow.actions}</div>
                            <div className="text-xs text-gray-500">Actions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{workflow.runs}</div>
                            <div className="text-xs text-gray-500">Runs</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Success Rate:</span>
                            <span className="text-sm font-medium text-green-600">
                              {Math.round(workflow.success_rate * 100)}%
                            </span>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getComplexityColor(workflow.complexity)}`}>
                            {workflow.complexity} complexity
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Last run: {workflow.last_run}</span>
                          <div className="flex space-x-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              <Settings className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              {workflow.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Templates Tab */}
              {activeTab === 'templates' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Workflow Templates</h3>
                    <p className="text-gray-600">Get started quickly with pre-built automation templates</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {templates.map((template) => (
                      <div key={template.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3 mb-4">
                          <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                            <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                            <div className="flex items-center space-x-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getComplexityColor(template.complexity)}`}>
                                {template.complexity}
                              </span>
                              <span className="text-xs text-gray-500">
                                Setup: {template.estimated_setup}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                          Use Template
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Analytics Tab */}
              {activeTab === 'analytics' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Workflow Analytics</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Category Performance */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Performance by Category</h4>
                      <div className="space-y-4">
                        {analytics.top_categories.map((category, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <span className="text-xl">{getCategoryIcon(category.category.toLowerCase())}</span>
                              <div>
                                <div className="font-medium text-gray-900">{category.category}</div>
                                <div className="text-sm text-gray-600">{category.count} workflows</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">{category.runs.toLocaleString()}</div>
                              <div className="text-sm text-gray-600">runs</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
                      <div className="space-y-3">
                        {[
                          { workflow: 'Lead Qualification Pipeline', action: 'Completed successfully', time: '2 minutes ago', status: 'success' },
                          { workflow: 'Daily Standup Automation', action: 'Completed successfully', time: '1 hour ago', status: 'success' },
                          { workflow: 'Expense Report Processing', action: 'Completed successfully', time: '2 hours ago', status: 'success' },
                          { workflow: 'Content Publishing Schedule', action: 'Paused by user', time: '1 day ago', status: 'paused' },
                          { workflow: 'Lead Qualification Pipeline', action: 'Failed - API timeout', time: '2 days ago', status: 'error' }
                        ].map((activity, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`p-1 rounded-full ${
                              activity.status === 'success' ? 'bg-green-100' :
                              activity.status === 'error' ? 'bg-red-100' : 'bg-yellow-100'
                            }`}>
                              {activity.status === 'success' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : activity.status === 'error' ? (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              ) : (
                                <Pause className="w-4 h-4 text-yellow-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">{activity.workflow}</div>
                              <div className="text-sm text-gray-600">{activity.action}</div>
                              <div className="text-xs text-gray-500">{activity.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}