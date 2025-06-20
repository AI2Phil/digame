import React from 'react';
import { RecentActivities as RecentActivitiesData } from '../../../services/apiClient';

interface RecentActivityProps {
  data?: RecentActivitiesData;
  isLoading: boolean;
  error?: Error | null;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ data, isLoading, error }) => {
  if (isLoading) return <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>Loading Recent Activities...</div>;
  if (error) return <div style={{ padding: '20px', border: '1px solid red', margin: '10px', color: 'red' }}>Error loading activities: {error.message}</div>;
  if (!data) return <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>No recent activity data.</div>;

  return (
    <div style={{ padding: '20px', border: '1px solid #17a2b8', margin: '10px' }}>
      <h2>{data.title || 'Recent Activities'}</h2>
      <ul>
        {data.activities.map(activity => (
          <li key={activity.id}>{activity.timestamp} - {activity.description} ({activity.status})</li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
