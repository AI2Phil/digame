import React from 'react';
import { ProductivityChart as ProductivityChartData } from '../../../services/apiClient';

interface ProductivityChartProps {
  data?: ProductivityChartData;
  isLoading: boolean;
  error?: Error | null;
}

const ProductivityChart: React.FC<ProductivityChartProps> = ({ data, isLoading, error }) => {
  if (isLoading) return <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>Loading Productivity Chart...</div>;
  if (error) return <div style={{ padding: '20px', border: '1px solid red', margin: '10px', color: 'red' }}>Error loading chart: {error.message}</div>;
  if (!data) return <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>No productivity chart data.</div>;

  return (
    <div style={{ padding: '20px', border: '1px solid #007bff', margin: '10px' }}>
      <h2>{data.title || 'Productivity Chart'}</h2>
      {/* Basic rendering of data */}
      <ul>
        {data.data.map((item, index) => (
          <li key={index}>{item.date}: {item.score}</li>
        ))}
      </ul>
      {/* In a real component, this would be a chart library integration */}
    </div>
  );
};

export default ProductivityChart;
