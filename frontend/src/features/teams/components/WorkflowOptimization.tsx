import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/Tabs';
import { useTeamManagement } from '../hooks/useTeamManagement.ts';
import { teamService } from '../services/teamService.ts';

interface TeamWorkflow {
  id: number;
  team_id: number;
  workflow_name: string;
  workflow_data: any;
  efficiency_score: number;
  created_at: string;
  updated_at: string;
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  dependencies: string[];
  assignee?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
}

interface WorkflowOptimization {
  workflow_id: number;
  bottlenecks: string[];
  suggestions: string[];
  potential_time_savings: number;
  efficiency_improvement: number;
}

const WorkflowOptimization: React.FC = () => {
  const { teams, selectedTeam, setSelectedTeam } = useTeamManagement();
  const [workflows, setWorkflows] = useState<TeamWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<TeamWorkflow | null>(null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [optimization, setOptimization] = useState<WorkflowOptimization | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStepDialog, setShowStepDialog] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    workflow_name: '',
    description: ''
  });
  const [newStep, setNewStep] = useState({
    name: '',
    description: '',
    duration_minutes: 30,
    assignee: ''
  });

  useEffect(() => {
    if (selectedTeam) {
      fetchWorkflows(selectedTeam.id);
    }
  }, [selectedTeam]);

  useEffect(() => {
    if (selectedWorkflow) {
      loadWorkflowSteps(selectedWorkflow);
      generateOptimizationSuggestions(selectedWorkflow);
    }
  }, [selectedWorkflow]);

  const fetchWorkflows = async (teamId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const workflowData = await teamService.getTeamWorkflows(teamId);
      setWorkflows(workflowData || []);
    } catch (err) {
      setError('Failed to fetch workflows');
      console.error('Error fetching workflows:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkflowSteps = (workflow: TeamWorkflow) => {
    // In a real implementation, this would fetch from the API
    // For now, we'll generate sample steps from workflow_data
    const steps: WorkflowStep[] = workflow.workflow_data?.steps || [
      {
        id: '1',
        name: 'Requirements Gathering',
        description: 'Collect and document project requirements',
        duration_minutes: 120,
        dependencies: [],
        assignee: 'Product Manager',
        status: 'completed'
      },
      {
        id: '2',
        name: 'Design Review',
        description: 'Review and approve design specifications',
        duration_minutes: 60,
        dependencies: ['1'],
        assignee: 'Design Lead',
        status: 'completed'
      },
      {
        id: '3',
        name: 'Development',
        description: 'Implement the feature according to specifications',
        duration_minutes: 480,
        dependencies: ['2'],
        assignee: 'Developer',
        status: 'in_progress'
      },
      {
        id: '4',
        name: 'Code Review',
        description: 'Peer review of implemented code',
        duration_minutes: 90,
        dependencies: ['3'],
        assignee: 'Senior Developer',
        status: 'pending'
      },
      {
        id: '5',
        name: 'Testing',
        description: 'Quality assurance testing',
        duration_minutes: 180,
        dependencies: ['4'],
        assignee: 'QA Engineer',
        status: 'pending'
      },
      {
        id: '6',
        name: 'Deployment',
        description: 'Deploy to production environment',
        duration_minutes: 30,
        dependencies: ['5'],
        assignee: 'DevOps Engineer',
        status: 'pending'
      }
    ];
    setWorkflowSteps(steps);
  };

  const generateOptimizationSuggestions = (workflow: TeamWorkflow) => {
    // Simulate optimization analysis
    const bottlenecks = [
      'Development phase takes 8 hours - consider breaking into smaller tasks',
      'Code review dependency creates waiting time',
      'Testing phase could be parallelized with development'
    ];

    const suggestions = [
      'Implement parallel development and testing workflows',
      'Add automated code review tools to reduce manual review time',
      'Break down large development tasks into smaller, manageable chunks',
      'Introduce daily standups to identify blockers early',
      'Use feature flags to enable continuous deployment'
    ];

    const optimization: WorkflowOptimization = {
      workflow_id: workflow.id,
      bottlenecks,
      suggestions,
      potential_time_savings: 180, // minutes
      efficiency_improvement: 25 // percentage
    };

    setOptimization(optimization);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'info';
      case 'blocked': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const calculateTotalDuration = (steps: WorkflowStep[]) => {
    return steps.reduce((total, step) => total + step.duration_minutes, 0);
  };

  const calculateCriticalPath = (steps: WorkflowStep[]) => {
    // Simplified critical path calculation
    // In a real implementation, this would use proper critical path method
    const sortedSteps = [...steps].sort((a, b) => a.dependencies.length - b.dependencies.length);
    return sortedSteps.map(step => step.id);
  };

  const handleCreateWorkflow = async () => {
    if (!selectedTeam || !newWorkflow.workflow_name.trim()) return;

    try {
      // In a real implementation, this would call an API
      console.log('Creating workflow:', newWorkflow);
      setNewWorkflow({ workflow_name: '', description: '' });
      setShowCreateDialog(false);
      fetchWorkflows(selectedTeam.id);
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  const handleAddStep = () => {
    if (!newStep.name.trim()) return;

    const step: WorkflowStep = {
      id: Date.now().toString(),
      name: newStep.name,
      description: newStep.description,
      duration_minutes: newStep.duration_minutes,
      dependencies: [],
      assignee: newStep.assignee,
      status: 'pending'
    };

    setWorkflowSteps(prev => [...prev, step]);
    setNewStep({ name: '', description: '', duration_minutes: 30, assignee: '' });
    setShowStepDialog(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading workflow optimization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workflow Optimization</h1>
        <div className="flex space-x-2">
          <select
            value={selectedTeam?.id || ''}
            onChange={(e) => {
              const teamId = parseInt(e.target.value);
              const team = teams.find(t => t.id === teamId);
              setSelectedTeam(team || null);
            }}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Select a team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
          {selectedTeam && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>Create Workflow</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Workflow</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Workflow Name</label>
                    <Input
                      value={newWorkflow.workflow_name}
                      onChange={(e) => setNewWorkflow(prev => ({ ...prev, workflow_name: e.target.value }))}
                      placeholder="e.g., Feature Development Process"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={newWorkflow.description}
                      onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the workflow purpose and scope"
                      className="w-full p-2 border rounded-md"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {selectedTeam ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflows List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Team Workflows</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedWorkflow?.id === workflow.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedWorkflow(workflow)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{workflow.workflow_name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Updated {new Date(workflow.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={getEfficiencyColor(workflow.efficiency_score)}
                          icon={null}
                          onRemove={() => {}}
                        >
                          {workflow.efficiency_score.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {workflows.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No workflows found. Create your first workflow to get started.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Details */}
          <div className="lg:col-span-2">
            {selectedWorkflow ? (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="steps">Steps</TabsTrigger>
                  <TabsTrigger value="optimization">Optimization</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedWorkflow.workflow_name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Efficiency Score</h4>
                          <div className="text-3xl font-bold text-blue-600">
                            {selectedWorkflow.efficiency_score.toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Total Duration</h4>
                          <div className="text-3xl font-bold text-green-600">
                            {Math.round(calculateTotalDuration(workflowSteps) / 60)}h
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Total Steps</h4>
                          <div className="text-3xl font-bold text-purple-600">
                            {workflowSteps.length}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Last Updated</h4>
                          <div className="text-sm text-gray-600">
                            {new Date(selectedWorkflow.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="steps">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Workflow Steps</CardTitle>
                        <Dialog open={showStepDialog} onOpenChange={setShowStepDialog}>
                          <DialogTrigger asChild>
                            <Button size="sm">Add Step</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Workflow Step</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Step Name</label>
                                <Input
                                  value={newStep.name}
                                  onChange={(e) => setNewStep(prev => ({ ...prev, name: e.target.value }))}
                                  placeholder="e.g., Code Review"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                  value={newStep.description}
                                  onChange={(e) => setNewStep(prev => ({ ...prev, description: e.target.value }))}
                                  placeholder="Describe what happens in this step"
                                  className="w-full p-2 border rounded-md"
                                  rows={2}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                                <Input
                                  type="number"
                                  value={newStep.duration_minutes}
                                  onChange={(e) => setNewStep(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2">Assignee</label>
                                <Input
                                  value={newStep.assignee}
                                  onChange={(e) => setNewStep(prev => ({ ...prev, assignee: e.target.value }))}
                                  placeholder="Who is responsible for this step"
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button variant="outline" onClick={() => setShowStepDialog(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleAddStep}>Add Step</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {workflowSteps.map((step, index) => (
                          <div key={step.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-medium">{step.name}</h4>
                                  <p className="text-sm text-gray-600">{step.description}</p>
                                </div>
                              </div>
                              <Badge 
                                variant={getStatusColor(step.status)}
                                icon={null}
                                onRemove={() => {}}
                              >
                                {step.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Duration:</span> {step.duration_minutes} min
                              </div>
                              <div>
                                <span className="font-medium">Assignee:</span> {step.assignee || 'Unassigned'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="optimization">
                  <Card>
                    <CardHeader>
                      <CardTitle>Optimization Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {optimization && (
                        <div className="space-y-6">
                          {/* Potential Improvements */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h4 className="font-medium text-green-800 mb-2">Time Savings</h4>
                              <div className="text-2xl font-bold text-green-600">
                                {Math.round(optimization.potential_time_savings / 60)}h
                              </div>
                              <p className="text-sm text-green-700">Potential reduction</p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h4 className="font-medium text-blue-800 mb-2">Efficiency Gain</h4>
                              <div className="text-2xl font-bold text-blue-600">
                                +{optimization.efficiency_improvement}%
                              </div>
                              <p className="text-sm text-blue-700">Improvement potential</p>
                            </div>
                          </div>

                          {/* Bottlenecks */}
                          <div>
                            <h4 className="font-medium mb-3">Identified Bottlenecks</h4>
                            <div className="space-y-2">
                              {optimization.bottlenecks.map((bottleneck, index) => (
                                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                  <div className="flex items-start space-x-2">
                                    <span className="text-red-600 mt-1">⚠️</span>
                                    <p className="text-sm text-red-800">{bottleneck}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Suggestions */}
                          <div>
                            <h4 className="font-medium mb-3">Optimization Suggestions</h4>
                            <div className="space-y-2">
                              {optimization.suggestions.map((suggestion, index) => (
                                <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                  <div className="flex items-start space-x-2">
                                    <span className="text-blue-600 mt-1">💡</span>
                                    <p className="text-sm text-blue-800">{suggestion}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle>Workflow Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <p className="text-gray-500">Workflow analytics and metrics will be displayed here.</p>
                        <p className="text-sm text-gray-400 mt-2">
                          This will show performance trends, completion rates, and cycle time analysis.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-500">Select a workflow to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Select a team to view workflow optimization</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkflowOptimization;