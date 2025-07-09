import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';

interface ActivityCategory {
  name: string;
  value: number;
  color: string;
  icon: string;
  hours?: number;
  avgProductivity?: number;
}

interface ActivityData {
  categories: ActivityCategory[];
  totalHours: number;
  mostProductiveTime: string;
  efficiency: number;
  period?: string;
  dataSource?: string;
}

interface ActivityBreakdownProps {
  userId?: number;
  days?: number;
}

const ActivityBreakdown: React.FC<ActivityBreakdownProps> = ({ userId = 1, days = 7 }) => {
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityData = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        // Call the new database-driven API endpoint
        const response = await fetch(`http://localhost:8001/api/activity/breakdown?days=${days}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add authorization header if available
            ...(localStorage.getItem('token') && {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            })
          }
        });

        if (response.ok) {
          const data = await response.json();
          setActivityData(data);
        } else {
          throw new Error(`API request failed: ${response.status}`);
        }
      } catch (error) {
        console.error('Error fetching activity data:', error);
        setError('Failed to load activity data');
        
        // Enhanced fallback data
        setActivityData({
          categories: [
            { name: 'Development', value: 45, color: '#2563eb', icon: '💻', hours: 3.8, avgProductivity: 85 },
            { name: 'Meetings', value: 25, color: '#7c3aed', icon: '📞', hours: 2.1, avgProductivity: 72 },
            { name: 'Learning', value: 15, color: '#16a34a', icon: '📚', hours: 1.3, avgProductivity: 88 },
            { name: 'Planning', value: 10, color: '#ea580c', icon: '📋', hours: 0.8, avgProductivity: 78 },
            { name: 'Break', value: 5, color: '#6b7280', icon: '☕', hours: 0.4, avgProductivity: 45 }
          ],
          totalHours: 8.4,
          mostProductiveTime: '9:00 AM - 11:00 AM',
          efficiency: 82,
          period: `Last ${days} days`,
          dataSource: 'fallback'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [userId, days]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Activity Breakdown</CardTitle>
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-4 py-1"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 py-1"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 py-1"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activityData) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-600 mb-2 font-medium">No Activity Data</p>
          <p className="text-sm text-gray-500">Start tracking to see your breakdown</p>
        </CardContent>
      </Card>
    );
  }

  const { categories, totalHours, mostProductiveTime, efficiency } = activityData;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Activity Breakdown</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{activityData?.period || `Last ${days} days`}</span>
            {activityData?.dataSource && (
              <Badge variant={activityData.dataSource === 'database' ? 'default' : 'secondary'}>
                {activityData.dataSource === 'database' ? 'Live Data' : 'Demo Data'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Activity Categories */}
        <div className="space-y-4 mb-6">
          {categories.map((category, index) => (
            <div key={index} className="activity-item">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{category.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    {category.hours && (
                      <span className="text-xs text-gray-500">{category.hours}h</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900">{category.value}%</span>
                  {category.avgProductivity && (
                    <Badge variant="outline" className="text-xs">
                      {category.avgProductivity}% productive
                    </Badge>
                  )}
                </div>
              </div>
              <Progress value={category.value} className="h-2" />
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{totalHours}h</div>
              <div className="text-xs text-gray-600">Total Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{efficiency}%</div>
              <div className="text-xs text-gray-600">Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-gray-900">Peak Time</div>
              <div className="text-xs text-gray-600">{mostProductiveTime}</div>
            </div>
          </div>
        </div>

        {/* Interactive Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            {categories.map((category, index) => (
              <div key={index} className="flex items-center space-x-2 cursor-pointer hover:opacity-75 transition-opacity">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                ></div>
                <span className="text-xs text-gray-600">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityBreakdown;