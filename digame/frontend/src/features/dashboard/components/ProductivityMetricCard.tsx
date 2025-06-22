import React from 'react';
import { ProductivityMetricsGroup } from '../../../services/apiClient';

interface ProductivityMetricCardProps {
  data?: ProductivityMetricsGroup;
  isLoading: boolean;
  error?: Error | null;
}

const ProductivityMetricCard: React.FC<ProductivityMetricCardProps> = ({ data, isLoading, error }) => {
  if (isLoading) return <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>Loading Metrics...</div>;
  if (error) return <div style={{ padding: '20px', border: '1px solid red', margin: '10px', color: 'red' }}>Error loading metrics: {error.message}</div>;
  if (!data) return <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>No metrics data.</div>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ffc107', margin: '10px' }}>
      <h2>{data.title || 'Productivity Metrics'}</h2>
      {data.metrics.map((metric, index) => (
        <div key={index} style={{ margin: '5px 0' }}>
          <strong>{metric.name}:</strong> {metric.value} <em>({metric.trend})</em>
        </div>
      ))}
    </div>
  );
};

export default ProductivityMetricCard;
