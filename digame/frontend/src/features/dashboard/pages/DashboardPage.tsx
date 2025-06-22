import React from 'react';
import ProductivityChart from '../components/ProductivityChart';
import ActivityBreakdown from '../components/ActivityBreakdown';
import ProductivityMetricCard from '../components/ProductivityMetricCard';
import RecentActivity from '../components/RecentActivity';

import {
  useProductivityChartData,
  useActivityBreakdownData,
  useProductivityMetricsData,
  useRecentActivitiesData
} from '../hooks/useDashboardData';

const DashboardPage: React.FC = () => {
  const { data: chartData, isLoading: chartLoading, error: chartError } = useProductivityChartData();
  const { data: breakdownData, isLoading: breakdownLoading, error: breakdownError } = useActivityBreakdownData();
  const { data: metricsData, isLoading: metricsLoading, error: metricsError } = useProductivityMetricsData();
  const { data: activitiesData, isLoading: activitiesLoading, error: activitiesError } = useRecentActivitiesData();

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <h1>Digame Dashboard</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <ProductivityChart data={chartData} isLoading={chartLoading} error={chartError} />
        <ActivityBreakdown data={breakdownData} isLoading={breakdownLoading} error={breakdownError} />
        <ProductivityMetricCard data={metricsData} isLoading={metricsLoading} error={metricsError} />
        <RecentActivity data={activitiesData} isLoading={activitiesLoading} error={activitiesError} />
      </div>
      {/*
        This page assumes it's rendered by a React app that has routing and
        can serve this page, e.g. via an App.tsx or similar.
        The backend also needs to be running and proxying /api/v1 requests correctly.
      */}
    </div>
  );
};

export default DashboardPage;
