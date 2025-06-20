import React from 'react';
import { ActivityBreakdown as ActivityBreakdownData } from '../../../services/apiClient';

interface ActivityBreakdownProps {
  data?: ActivityBreakdownData;
  isLoading: boolean;
  error?: Error | null;
}

const ActivityBreakdown: React.FC<ActivityBreakdownProps> = ({ data, isLoading, error }) => {
  if (isLoading) return <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>Loading Activity Breakdown...</div>;
  if (error) return <div style={{ padding: '20px', border: '1px solid red', margin: '10px', color: 'red' }}>Error loading breakdown: {error.message}</div>;
  if (!data) return <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>No activity breakdown data.</div>;

  return (
    <div style={{ padding: '20px', border: '1px solid #28a745', margin: '10px' }}>
      <h2>{data.title || 'Activity Breakdown'}</h2>
      <ul>
        {data.data.map((item, index) => (
          <li key={index}>{item.activity_name}: {item.percentage}% ({item.duration_minutes} mins)</li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityBreakdown;
