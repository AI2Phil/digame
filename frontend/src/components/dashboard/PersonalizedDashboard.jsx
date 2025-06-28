import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  User, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Users, 
  Clock, 
  Award,
  ChevronRight,
  Star,
  Calendar,
  Lightbulb
} from 'lucide-react';

const PersonalizedDashboard = ({ user }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/experience/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setDashboardData(result.data);
    } catch (err) {
      setError(err.message);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 mb-4">Error loading dashboard: {error}</p>
              <Button onClick={fetchDashboardData}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    user_context,
    personalized_recommendations,
    learning_path,
    progress_insights,
    next_actions,
    content_feed,
    achievement_tracking,
    social_connections,
    time_optimization
  } = dashboardData || {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user?.first_name || user?.username}!
              </h1>
              <p className="text-blue-100">
                {user_context?.user_type === 'guest' 
                  ? `Day ${user_context.days_since_registration} of your guest experience`
                  : 'Your personalized learning journey continues'
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {user_context?.onboarding_completion || 0}%
              </div>
              <div className="text-sm text-blue-100">Profile Complete</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Engagement</p>
                  <p className="text-lg font-semibold capitalize">
                    {user_context?.engagement_level || 'New'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Achievements</p>
                  <p className="text-lg font-semibold">
                    {achievement_tracking?.unlocked?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Connections</p>
                  <p className="text-lg font-semibold">
                    {social_connections?.length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Daily Goal</p>
                  <p className="text-lg font-semibold">
                    {time_optimization?.daily_recommendation || '15 min'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Next Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Next Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {next_actions?.slice(0, 3).map((action, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={action.priority === 'high' ? 'destructive' : 'secondary'}>
                      {action.priority}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {action.estimated_time}
                    </span>
                  </div>
                  <h4 className="font-medium text-sm">{action.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">
                  Complete your profile to get personalized actions
                </p>
              )}
            </CardContent>
          </Card>

          {/* Learning Path */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Learning Path</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {learning_path?.status !== 'not_available' ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>
                        {learning_path?.progress_tracking?.completed_modules || 0}/
                        {learning_path?.progress_tracking?.total_modules || 12}
                      </span>
                    </div>
                    <Progress 
                      value={
                        ((learning_path?.progress_tracking?.completed_modules || 0) / 
                         (learning_path?.progress_tracking?.total_modules || 12)) * 100
                      } 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Current Level:</p>
                    <Badge variant="outline">{learning_path?.current_level}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Weekly Commitment:</p>
                    <p className="text-sm font-medium">{learning_path?.weekly_commitment}</p>
                  </div>
                  
                  <Button className="w-full" size="sm">
                    Continue Learning
                  </Button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-3">{learning_path?.message}</p>
                  <Button size="sm">Start Onboarding</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {personalized_recommendations?.slice(0, 3).map((rec, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{rec.type?.replace('_', ' ')}</Badge>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <h4 className="font-medium text-sm">{rec.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{rec.description}</p>
                  {rec.estimated_time && (
                    <p className="text-xs text-blue-600 mt-2">
                      ⏱️ {rec.estimated_time}
                    </p>
                  )}
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">
                  Complete your profile to get recommendations
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Content Feed and Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Curated Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {content_feed?.slice(0, 4).map((content, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex-shrink-0">
                    {content.type === 'article' && <BookOpen className="h-5 w-5 text-blue-600" />}
                    {content.type === 'video' && <Calendar className="h-5 w-5 text-red-600" />}
                    {content.type === 'report' && <TrendingUp className="h-5 w-5 text-green-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{content.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{content.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {content.category?.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {content.read_time || content.duration}
                      </span>
                    </div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-center py-4">
                  No content available yet
                </p>
              )}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Achievements</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievement_tracking?.unlocked?.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      +{achievement.points} points
                    </p>
                  </div>
                </div>
              )) || null}

              {achievement_tracking?.available?.slice(0, 2).map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg opacity-60">
                  <Award className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                    <div className="mt-2">
                      <Progress value={achievement.progress || 0} className="h-2" />
                    </div>
                  </div>
                </div>
              )) || null}

              {(!achievement_tracking?.unlocked?.length && !achievement_tracking?.available?.length) && (
                <p className="text-gray-500 text-center py-4">
                  Start your journey to unlock achievements
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress Insights */}
        {progress_insights && Object.keys(progress_insights).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Progress Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {progress_insights.completion_rate || 0}%
                  </div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {progress_insights.engagement_score ? 
                      Math.round(progress_insights.engagement_score * 100) : 0}%
                  </div>
                  <p className="text-sm text-gray-600">Engagement Score</p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {progress_insights.time_spent || 0}m
                  </div>
                  <p className="text-sm text-gray-600">Time Invested</p>
                </div>
              </div>

              {progress_insights.strengths?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Your Strengths:</h4>
                  <div className="flex flex-wrap gap-2">
                    {progress_insights.strengths.map((strength, index) => (
                      <Badge key={index} variant="secondary">{strength}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PersonalizedDashboard;