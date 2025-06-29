import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Play, Pause, RotateCcw, CheckCircle, XCircle, 
  AlertTriangle, Clock, GitBranch, Package,
  Server, Globe, Shield, Database, Monitor,
  Download, Upload, Settings, Eye, Edit,
  Trash2, Plus, Filter, Search, Calendar,
  Activity, TrendingUp, Zap, Users, Code
} from 'lucide-react';

interface Pipeline {
  id: string;
  name: string;
  description: string;
  repository: string;
  branch: string;
  status: 'idle' | 'running' | 'success' | 'failed' | 'cancelled';
  environment: 'development' | 'staging' | 'production';
  trigger: 'manual' | 'push' | 'schedule' | 'webhook';
  stages: PipelineStage[];
  created_at: string;
  last_run: string;
  run_count: number;
  success_rate: number;
  average_duration: number;
  next_scheduled?: string;
  auto_deploy: boolean;
  rollback_enabled: boolean;
}

interface PipelineStage {
  id: string;
  name: string;
  type: 'build' | 'test' | 'security' | 'deploy' | 'notify';
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  duration: number;
  started_at?: string;
  completed_at?: string;
  logs?: string;
  artifacts?: Array<{
    name: string;
    size: number;
    url: string;
  }>;
  dependencies: string[];
  parallel: boolean;
}

interface Deployment {
  id: string;
  pipeline_id: string;
  version: string;
  environment: string;
  status: 'pending' | 'deploying' | 'deployed' | 'failed' | 'rolled_back';
  deployed_by: string;
  deployed_at: string;
  rollback_target?: string;
  health_checks: Array<{
    name: string;
    status: 'passing' | 'failing';
    response_time: number;
    last_check: string;
  }>;
  metrics: {
    cpu_usage: number;
    memory_usage: number;
    request_count: number;
    error_rate: number;
  };
  commit_hash: string;
  commit_message: string;
  author: string;
}

interface Environment {
  id: string;
  name: string;
  type: 'development' | 'staging' | 'production';
  status: 'healthy' | 'degraded' | 'offline';
  url: string;
  current_version: string;
  last_deployment: string;
  auto_deploy: boolean;
  approval_required: boolean;
  approvers: string[];
  resource_limits: {
    cpu: string;
    memory: string;
    storage: string;
  };
  scaling: {
    min_instances: number;
    max_instances: number;
    current_instances: number;
  };
}

interface DeploymentMetrics {
  total_deployments: number;
  successful_deployments: number;
  failed_deployments: number;
  average_deployment_time: number;
  deployment_frequency: number;
  lead_time: number;
  mttr: number; // Mean Time To Recovery
  change_failure_rate: number;
  deployment_trends: Array<{
    date: string;
    deployments: number;
    success_rate: number;
    duration: number;
  }>;
}

export const DeploymentPipeline: React.FC = () => {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [metrics, setMetrics] = useState<DeploymentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'pipelines' | 'deployments' | 'environments' | 'metrics'>('overview');
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [runningPipelines, setRunningPipelines] = useState<Set<string>>(new Set());
  const [filterEnvironment, setFilterEnvironment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDeploymentData();
  }, []);

  const fetchDeploymentData = async () => {
    try {
      setLoading(true);
      
      const [pipelinesRes, deploymentsRes, environmentsRes, metricsRes] = await Promise.all([
        fetch('/api/deployment/pipelines', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/deployment/deployments', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/deployment/environments', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/deployment/metrics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (pipelinesRes.ok) {
        const data = await pipelinesRes.json();
        setPipelines(data.pipelines || []);
      }

      if (deploymentsRes.ok) {
        const data = await deploymentsRes.json();
        setDeployments(data.deployments || []);
      }

      if (environmentsRes.ok) {
        const data = await environmentsRes.json();
        setEnvironments(data.environments || []);
      }

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deployment data');
    } finally {
      setLoading(false);
    }
  };

  const handleRunPipeline = async (pipelineId: string) => {
    try {
      setRunningPipelines(prev => new Set(Array.from(prev).concat(pipelineId)));
      
      const response = await fetch(`/api/deployment/pipelines/${pipelineId}/run`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        // Poll for pipeline status
        const pollStatus = async () => {
          const statusRes = await fetch(`/api/deployment/pipelines/${pipelineId}/status`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (statusRes.ok) {
            const status = await statusRes.json();
            if (status.status === 'success' || status.status === 'failed' || status.status === 'cancelled') {
              setRunningPipelines(prev => {
                const updated = new Set(Array.from(prev));
                updated.delete(pipelineId);
                return updated;
              });
              await fetchDeploymentData();
            } else {
              setTimeout(pollStatus, 3000);
            }
          }
        };
        
        pollStatus();
      }
    } catch (err) {
      console.error('Failed to run pipeline:', err);
      setRunningPipelines(prev => {
        const updated = new Set(Array.from(prev));
        updated.delete(pipelineId);
        return updated;
      });
    }
  };

  const handleRollback = async (deploymentId: string) => {
    if (!confirm('Are you sure you want to rollback this deployment? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/deployment/deployments/${deploymentId}/rollback`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        await fetchDeploymentData();
      }
    } catch (err) {
      console.error('Failed to rollback deployment:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'deployed':
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'failed':
      case 'offline': return 'text-red-600 bg-red-100';
      case 'running':
      case 'deploying':
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'pending':
      case 'idle': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'deployed': return CheckCircle;
      case 'failed': return XCircle;
      case 'running':
      case 'deploying': return Play;
      case 'pending': return Clock;
      default: return AlertTriangle;
    }
  };

  const getEnvironmentIcon = (type: string) => {
    switch (type) {
      case 'development': return Code;
      case 'staging': return Package;
      case 'production': return Server;
      default: return Globe;
    }
  };

  const filteredPipelines = pipelines.filter(pipeline => {
    const matchesEnvironment = filterEnvironment === 'all' || pipeline.environment === filterEnvironment;
    const matchesSearch = pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pipeline.repository.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesEnvironment && matchesSearch;
  });

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Deployment Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Deployments</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.total_deployments}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {((metrics.successful_deployments / metrics.total_deployments) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Deploy Time</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.average_deployment_time}m</p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">MTTR</p>
                  <p className="text-2xl font-bold text-purple-600">{metrics.mttr}h</p>
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Environment Status */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {environments.map((env) => {
              const IconComponent = getEnvironmentIcon(env.type);
              return (
                <div key={env.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-gray-600" />
                      <h4 className="font-medium text-gray-900">{env.name}</h4>
                    </div>
                    <Badge 
                      variant={env.status === 'healthy' ? 'success' : env.status === 'degraded' ? 'warning' : 'error'} 
                      size="sm"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {env.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Version:</span>
                      <span className="ml-2 font-medium">{env.current_version}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Instances:</span>
                      <span className="ml-2 font-medium">{env.scaling.current_instances}/{env.scaling.max_instances}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Deploy:</span>
                      <span className="ml-2 font-medium">{new Date(env.last_deployment).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Deployments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {deployments.slice(0, 5).map((deployment) => {
              const StatusIcon = getStatusIcon(deployment.status);
              return (
                <div key={deployment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`h-5 w-5 ${getStatusColor(deployment.status).split(' ')[0]}`} />
                    <div>
                      <h4 className="font-medium text-gray-900">{deployment.version}</h4>
                      <p className="text-sm text-gray-600">{deployment.environment} • {deployment.deployed_by}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{new Date(deployment.deployed_at).toLocaleDateString()}</p>
                    <Badge 
                      variant={deployment.status === 'deployed' ? 'success' : deployment.status === 'failed' ? 'error' : 'warning'} 
                      size="xs"
                      icon={null}
                      onRemove={() => {}}
                    >
                      {deployment.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Pipelines */}
      <Card>
        <CardHeader>
          <CardTitle>Active Pipelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pipelines.filter(p => p.status === 'running').map((pipeline) => (
              <div key={pipeline.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{pipeline.name}</h4>
                    <p className="text-sm text-gray-600">{pipeline.environment} • {pipeline.branch}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-yellow-700">Running</span>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
            {pipelines.filter(p => p.status === 'running').length === 0 && (
              <p className="text-gray-500 text-center py-4">No active pipelines</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPipelinesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Deployment Pipelines</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pipelines..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select 
            value={filterEnvironment} 
            onChange={(e) => setFilterEnvironment(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Environments</option>
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Pipeline
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredPipelines.map((pipeline) => {
          const StatusIcon = getStatusIcon(pipeline.status);
          const isRunning = runningPipelines.has(pipeline.id);
          
          return (
            <Card key={pipeline.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <GitBranch className="h-5 w-5 text-gray-600" />
                      <h4 className="font-medium text-gray-900">{pipeline.name}</h4>
                      <Badge 
                        variant={pipeline.status === 'success' ? 'success' : pipeline.status === 'failed' ? 'error' : 'warning'} 
                        size="sm"
                        icon={null}
                        onRemove={() => {}}
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {isRunning ? 'Running' : pipeline.status}
                      </Badge>
                      <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                        {pipeline.environment}
                      </Badge>
                      {pipeline.auto_deploy && (
                        <Badge variant="info" size="xs" icon={null} onRemove={() => {}}>
                          Auto Deploy
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{pipeline.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">Repository:</span>
                        <span className="ml-2 font-medium">{pipeline.repository}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Branch:</span>
                        <span className="ml-2 font-medium">{pipeline.branch}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Runs:</span>
                        <span className="ml-2 font-medium">{pipeline.run_count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="ml-2 font-medium">{pipeline.success_rate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg Duration:</span>
                        <span className="ml-2 font-medium">{pipeline.average_duration}m</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Stages:</span>
                      {pipeline.stages.map((stage, index) => (
                        <Badge 
                          key={stage.id} 
                          variant={stage.status === 'success' ? 'success' : stage.status === 'failed' ? 'error' : 'outline'} 
                          size="xs"
                          icon={null}
                          onRemove={() => {}}
                        >
                          {stage.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRunPipeline(pipeline.id)}
                      disabled={isRunning}
                    >
                      {isRunning ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                      <span className="ml-1">{isRunning ? 'Running' : 'Run'}</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setSelectedPipeline(pipeline)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderDeploymentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Deployment History</h3>
        <div className="flex items-center gap-2">
          <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
            <option value="all">All Environments</option>
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {deployments.map((deployment) => {
          const StatusIcon = getStatusIcon(deployment.status);
          
          return (
            <Card key={deployment.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className={`h-5 w-5 ${getStatusColor(deployment.status).split(' ')[0]}`} />
                      <h4 className="font-medium text-gray-900">{deployment.version}</h4>
                      <Badge 
                        variant={deployment.status === 'deployed' ? 'success' : deployment.status === 'failed' ? 'error' : 'warning'} 
                        size="sm"
                        icon={null}
                        onRemove={() => {}}
                      >
                        {deployment.status}
                      </Badge>
                      <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                        {deployment.environment}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{deployment.commit_message}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">Deployed By:</span>
                        <span className="ml-2 font-medium">{deployment.deployed_by}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Author:</span>
                        <span className="ml-2 font-medium">{deployment.author}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Commit:</span>
                        <span className="ml-2 font-medium font-mono text-xs">{deployment.commit_hash.substring(0, 8)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Deployed:</span>
                        <span className="ml-2 font-medium">{new Date(deployment.deployed_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {deployment.status === 'deployed' && (
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-medium text-blue-900">{deployment.metrics.cpu_usage}%</div>
                          <div className="text-blue-700 text-xs">CPU</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-medium text-green-900">{deployment.metrics.memory_usage}%</div>
                          <div className="text-green-700 text-xs">Memory</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="font-medium text-purple-900">{deployment.metrics.request_count}</div>
                          <div className="text-purple-700 text-xs">Requests</div>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded">
                          <div className="font-medium text-orange-900">{deployment.metrics.error_rate}%</div>
                          <div className="text-orange-700 text-xs">Errors</div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {deployment.status === 'deployed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRollback(deployment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Rollback
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      Logs
                    </Button>
                    <Button size="sm" variant="outline">
                      <Monitor className="h-3 w-3 mr-1" />
                      Monitor
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderEnvironmentsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Deployment Environments</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Environment
        </Button>
      </div>

      <div className="space-y-4">
        {environments.map((env) => {
          const IconComponent = getEnvironmentIcon(env.type);
          
          return (
            <Card key={env.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <IconComponent className="h-6 w-6 text-gray-600" />
                      <h4 className="font-medium text-gray-900">{env.name}</h4>
                      <Badge
                        variant={env.status === 'healthy' ? 'success' : env.status === 'degraded' ? 'warning' : 'error'}
                        size="sm"
                        icon={null}
                        onRemove={() => {}}
                      >
                        {env.status}
                      </Badge>
                      <Badge variant="outline" size="sm" icon={null} onRemove={() => {}}>
                        {env.type}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-600">URL:</span>
                        <span className="ml-2 font-medium">{env.url}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Version:</span>
                        <span className="ml-2 font-medium">{env.current_version}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Instances:</span>
                        <span className="ml-2 font-medium">{env.scaling.current_instances}/{env.scaling.max_instances}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Auto Deploy:</span>
                        <span className="ml-2 font-medium">{env.auto_deploy ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">CPU Limit:</span>
                        <span className="ml-2 font-medium">{env.resource_limits.cpu}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Memory Limit:</span>
                        <span className="ml-2 font-medium">{env.resource_limits.memory}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Storage:</span>
                        <span className="ml-2 font-medium">{env.resource_limits.storage}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Globe className="h-3 w-3 mr-1" />
                      Visit
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline">
                      <Monitor className="h-3 w-3 mr-1" />
                      Monitor
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderMetricsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Deployment Metrics</h3>
      
      {/* DORA Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Deployment Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.deployment_frequency}</div>
              <div className="text-sm text-gray-600">per day</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Lead Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.lead_time}h</div>
              <div className="text-sm text-gray-600">commit to deploy</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">MTTR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{metrics.mttr}h</div>
              <div className="text-sm text-gray-600">mean time to recovery</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Change Failure Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.change_failure_rate}%</div>
              <div className="text-sm text-gray-600">failed deployments</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deployment Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Deployment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Deployment trends chart</p>
              <p className="text-sm text-gray-500">Frequency and success rate over time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelines.slice(0, 5).map((pipeline) => (
                <div key={pipeline.id} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{pipeline.name}</h4>
                    <p className="text-sm text-gray-600">{pipeline.environment}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{pipeline.success_rate}%</p>
                    <p className="text-sm text-gray-600">{pipeline.average_duration}m avg</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {environments.map((env) => (
                <div key={env.id} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{env.name}</h4>
                    <p className="text-sm text-gray-600">{env.type}</p>
                  </div>
                  <Badge
                    variant={env.status === 'healthy' ? 'success' : env.status === 'degraded' ? 'warning' : 'error'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {env.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading deployment data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Deployments</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchDeploymentData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Deployment Pipeline</h1>
            <p className="text-gray-600">Manage CI/CD pipelines, deployments, and environments</p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: Activity },
                { id: 'pipelines', label: 'Pipelines', icon: GitBranch },
                { id: 'deployments', label: 'Deployments', icon: Package },
                { id: 'environments', label: 'Environments', icon: Server },
                { id: 'metrics', label: 'Metrics', icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'pipelines' && renderPipelinesTab()}
          {activeTab === 'deployments' && renderDeploymentsTab()}
          {activeTab === 'environments' && renderEnvironmentsTab()}
          {activeTab === 'metrics' && renderMetricsTab()}
        </div>
      </div>

      {/* Pipeline Details Modal */}
      {selectedPipeline && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <Card className="max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedPipeline.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPipeline(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pipeline Configuration</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Repository:</span>
                    <span className="ml-2 font-medium">{selectedPipeline.repository}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Branch:</span>
                    <span className="ml-2 font-medium">{selectedPipeline.branch}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Environment:</span>
                    <span className="ml-2 font-medium">{selectedPipeline.environment}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Trigger:</span>
                    <span className="ml-2 font-medium">{selectedPipeline.trigger}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Pipeline Stages</h4>
                <div className="space-y-2">
                  {selectedPipeline.stages.map((stage, index) => {
                    const StageIcon = getStatusIcon(stage.status);
                    return (
                      <div key={stage.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <StageIcon className={`h-4 w-4 ${getStatusColor(stage.status).split(' ')[0]}`} />
                          <div>
                            <h5 className="font-medium text-gray-900">{stage.name}</h5>
                            <p className="text-sm text-gray-600">{stage.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{stage.duration}s</p>
                          <Badge
                            variant={stage.status === 'success' ? 'success' : stage.status === 'failed' ? 'error' : 'warning'}
                            size="xs"
                            icon={null}
                            onRemove={() => {}}
                          >
                            {stage.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedPipeline(null)}>
                  Close
                </Button>
                <Button onClick={() => handleRunPipeline(selectedPipeline.id)}>
                  <Play className="h-4 w-4 mr-2" />
                  Run Pipeline
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};