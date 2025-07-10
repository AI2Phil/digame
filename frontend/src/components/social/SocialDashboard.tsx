import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Users, MessageCircle, Target, TrendingUp, Star,
  Network, GraduationCap, BookOpen, Award, Eye,
  Plus, ArrowRight, Activity, Heart, Zap
} from 'lucide-react';

interface SocialMetrics {
  total_connections: number;
  active_mentorships: number;
  learning_partnerships: number;
  knowledge_shared: number;
  collaboration_score: number;
  network_growth_rate: number;
  engagement_level: 'low' | 'medium' | 'high';
}

interface RecentActivity {
  id: string;
  type: 'connection' | 'mentorship' | 'learning' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  user_name?: string;
  user_avatar?: string;
}

interface PeerSuggestion {
  id: string;
  name: string;
  title: string;
  company: string;
  compatibility_score: number;
  shared_skills: string[];
  avatar?: string;
}

export const SocialDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SocialMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [peerSuggestions, setPeerSuggestions] = useState<PeerSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSocialData();
  }, []);

  const fetchSocialData = async () => {
    try {
      setLoading(true);
      
      // For now, use mock data - will be replaced with actual API calls
      const mockMetrics: SocialMetrics = {
        total_connections: 47,
        active_mentorships: 3,
        learning_partnerships: 5,
        knowledge_shared: 12,
        collaboration_score: 78,
        network_growth_rate: 15.3,
        engagement_level: 'high'
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'connection',
          title: 'New Connection',
          description: 'Connected with Sarah Chen, Senior Developer at TechCorp',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          user_name: 'Sarah Chen'
        },
        {
          id: '2',
          type: 'mentorship',
          title: 'Mentorship Session',
          description: 'Completed React Advanced Patterns session with mentor',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: '3',
          type: 'learning',
          title: 'Learning Partnership',
          description: 'Started TypeScript study group with 3 peers',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: '4',
          type: 'achievement',
          title: 'Achievement Unlocked',
          description: 'Earned "Knowledge Sharer" badge for helping 10+ peers',
          timestamp: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      const mockSuggestions: PeerSuggestion[] = [
        {
          id: '1',
          name: 'Alex Rodriguez',
          title: 'Full Stack Developer',
          company: 'StartupXYZ',
          compatibility_score: 92,
          shared_skills: ['React', 'Node.js', 'TypeScript']
        },
        {
          id: '2',
          name: 'Maria Kim',
          title: 'UX Designer',
          company: 'DesignStudio',
          compatibility_score: 87,
          shared_skills: ['Design Systems', 'Figma', 'User Research']
        },
        {
          id: '3',
          name: 'David Thompson',
          title: 'DevOps Engineer',
          company: 'CloudTech',
          compatibility_score: 84,
          shared_skills: ['Docker', 'Kubernetes', 'AWS']
        }
      ];

      setMetrics(mockMetrics);
      setRecentActivity(mockActivity);
      setPeerSuggestions(mockSuggestions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load social data');
    } finally {
      setLoading(false);
    }
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'connection': return <Users className="h-4 w-4 text-blue-600" />;
      case 'mentorship': return <GraduationCap className="h-4 w-4 text-purple-600" />;
      case 'learning': return <BookOpen className="h-4 w-4 text-green-600" />;
      case 'achievement': return <Award className="h-4 w-4 text-yellow-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchSocialData}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Network className="h-6 w-6 text-blue-600" />
            Social Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Your professional networking hub</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Connect
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Network Connections',
              value: metrics.total_connections,
              subtitle: `+${metrics.network_growth_rate}% this month`,
              icon: Users,
              color: 'blue',
              href: '/social/network'
            },
            {
              title: 'Active Mentorships',
              value: metrics.active_mentorships,
              subtitle: 'Ongoing programs',
              icon: GraduationCap,
              color: 'purple',
              href: '/social/mentorship'
            },
            {
              title: 'Learning Partners',
              value: metrics.learning_partnerships,
              subtitle: 'Active collaborations',
              icon: BookOpen,
              color: 'green',
              href: '/social/learning-partners'
            },
            {
              title: 'Knowledge Shared',
              value: metrics.knowledge_shared,
              subtitle: 'Sessions this month',
              icon: Heart,
              color: 'red',
              href: '/social/analytics'
            },
          ].map((metric, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{metric.subtitle}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-${metric.color}-100`}>
                    <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                  </div>
                </div>
                <div className="mt-3 flex items-center text-sm text-blue-600 hover:text-blue-800">
                  <span>View details</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Collaboration Score */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Collaboration Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-lg font-medium text-gray-900">Overall Score</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-2xl font-bold ${
                    metrics.collaboration_score >= 80 ? 'text-green-600' :
                    metrics.collaboration_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metrics.collaboration_score}/100
                  </span>
                  <Badge 
                    variant={metrics.engagement_level === 'high' ? 'success' : 
                            metrics.engagement_level === 'medium' ? 'warning' : 'error'}
                    size="sm"
                    icon={null}
                    onRemove={() => {}}
                  >
                    {metrics.engagement_level} engagement
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Trending up</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className={`h-3 rounded-full ${
                  metrics.collaboration_score >= 80 ? 'bg-green-600' :
                  metrics.collaboration_score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${metrics.collaboration_score}%` }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium text-gray-900">Network Growth</p>
                <p className="text-green-600">+{metrics.network_growth_rate}%</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">Active Connections</p>
                <p className="text-blue-600">{metrics.total_connections}</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">Knowledge Sharing</p>
                <p className="text-purple-600">{metrics.knowledge_shared} sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Peer Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle>Suggested Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {peerSuggestions.map((peer) => (
                <div key={peer.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {peer.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{peer.name}</p>
                      <p className="text-sm text-gray-600">{peer.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs text-gray-500">{peer.compatibility_score}% match</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Connect
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm">
                <Target className="h-4 w-4 mr-2" />
                Find More Matches
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Find Peers', icon: Target, href: '/social/peer-matching', color: 'blue' },
              { label: 'Join Mentorship', icon: GraduationCap, href: '/social/mentorship', color: 'purple' },
              { label: 'Learning Partners', icon: BookOpen, href: '/social/learning-partners', color: 'green' },
              { label: 'Community Forums', icon: MessageCircle, href: '/social/forums', color: 'orange' },
            ].map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex-col gap-2 hover:shadow-md transition-shadow"
              >
                <action.icon className={`h-6 w-6 text-${action.color}-600`} />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialDashboard;