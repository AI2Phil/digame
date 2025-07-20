import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import { apiClient, replaceApiUrl } from '../../lib/api-config';
import {
  Brain,
  MessageCircle,
  BarChart3,
  Settings,
  Activity,
  TrendingUp,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { TwinOverview } from './TwinOverview';
import { TwinWorkspace } from './TwinWorkspace';
import { TwinAnalytics } from './TwinAnalytics';
import { TwinSettings } from './TwinSettings';

interface DigitalTwin {
  id: string;
  name: string;
  status: 'initializing' | 'learning' | 'active' | 'paused' | 'error';
  learning_progress: number;
  accuracy_score: number;
  model_version?: string;
  last_training_at?: string;
  created_at: string;
  updated_at: string;
}

interface TwinDashboardProps {
  twinId: string;
  userId: string;
}

export const TwinDashboard: React.FC<TwinDashboardProps> = ({ twinId, userId }) => {
  const [twin, setTwin] = useState<DigitalTwin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchTwinData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${replaceApiUrl("")}/api/digital-twin/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch twin data');
      }

      const data = await response.json();
      if (data.success && data.data) {
        // Transform API response to component format
        const twinData = {
          id: data.data.twin_id,
          name: data.data.name || 'My Digital Twin',
          status: data.data.status,
          learning_progress: data.data.learning_progress,
          accuracy_score: data.data.accuracy_score,
          model_version: data.data.model_version,
          last_training_at: data.data.last_training,
          created_at: data.data.created_at,
          updated_at: new Date().toISOString()
        };
        setTwin(twinData);
      } else {
        // Fallback data
        setTwin({
          id: twinId,
          name: 'My Digital Twin',
          status: 'active',
          learning_progress: 75,
          accuracy_score: 85,
          model_version: '1.0.0',
          last_training_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [twinId]);

  useEffect(() => {
    fetchTwinData();
  }, [twinId, fetchTwinData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'learning': return 'bg-blue-500';
      case 'initializing': return 'bg-yellow-500';
      case 'paused': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'learning': return 'Learning';
      case 'initializing': return 'Initializing';
      case 'paused': return 'Paused';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading twin data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading twin</div>
          <div className="text-gray-600">{error}</div>
          <Button onClick={fetchTwinData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!twin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Twin not found</div>
      </div>
    );
  }

  return (
    <div className="twin-dashboard space-y-6">
      {/* Twin Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar
                src=""
                className="h-16 w-16"
                size="xl"
                fallback={<Brain className="h-8 w-8" />}
                status={null}
              />
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{twin.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge
                    variant="secondary"
                    className={`${getStatusColor(twin.status)} text-white`}
                    icon={null}
                    onRemove={() => {}}
                  >
                    {getStatusText(twin.status)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Created {new Date(twin.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Learning Progress</div>
                <div className="flex items-center space-x-2">
                  <Progress value={twin.learning_progress} className="w-24" />
                  <span className="text-sm font-medium">{twin.learning_progress}%</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">Accuracy Score</div>
                <div className="text-lg font-semibold text-green-600">
                  {twin.accuracy_score}%
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-2xl font-bold">{getStatusText(twin.status)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Learning</p>
                <p className="text-2xl font-bold">{twin.learning_progress}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Accuracy</p>
                <p className="text-2xl font-bold">{twin.accuracy_score}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Version</p>
                <p className="text-2xl font-bold">{twin.model_version || 'v1.0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="workspace" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Workspace</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <TwinOverview twin={twin} onRefresh={fetchTwinData} />
        </TabsContent>

        <TabsContent value="workspace" className="space-y-4">
          <TwinWorkspace twinId={twinId} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <TwinAnalytics twinId={twinId} twin={twin} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <TwinSettings twin={twin} onUpdate={fetchTwinData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TwinDashboard;