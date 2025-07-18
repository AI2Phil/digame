import React from 'react';
import { Box, Typography, Grid, Container } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardWidget from '../../src/components/analytics/widgets/DashboardWidget';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const WidgetsTestPage = () => {
  // Sample widget configurations for testing
  const testWidgets = [
    {
      id: 1,
      widget_uuid: 'widget-1',
      widget_type: 'kpi_card',
      title: 'Total Revenue',
      data_source_config: { type: 'revenue', params: {} },
      display_options: { 
        format: 'currency', 
        currency: '$',
        show_trend: true,
        show_progress: true 
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      widget_uuid: 'widget-2', 
      widget_type: 'kpi_card',
      title: 'Active Users',
      data_source_config: { type: 'users', params: {} },
      display_options: { 
        format: 'number',
        show_trend: true,
        show_progress: true 
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      widget_uuid: 'widget-3',
      widget_type: 'kpi_card', 
      title: 'Conversion Rate',
      data_source_config: { type: 'conversion', params: {} },
      display_options: { 
        format: 'percentage',
        show_trend: true,
        show_progress: true 
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      widget_uuid: 'widget-4',
      widget_type: 'line_chart',
      title: 'Revenue Trend',
      data_source_config: { type: 'revenue_trend', params: {} },
      display_options: { 
        chart_type: 'line',
        show_legend: true 
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      widget_uuid: 'widget-5',
      widget_type: 'bar_chart',
      title: 'Quarterly Performance',
      data_source_config: { type: 'quarterly', params: {} },
      display_options: { 
        chart_type: 'bar',
        show_legend: true 
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 6,
      widget_uuid: 'widget-6',
      widget_type: 'gauge',
      title: 'System Health',
      data_source_config: { type: 'health', params: {} },
      display_options: { 
        min: 0,
        max: 100,
        target: 80 
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Widgets Test
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Testing KPI cards and other widgets with database-driven data
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {testWidgets.map((widget) => (
          <Grid item xs={12} sm={6} md={4} key={widget.id}>
            <Box sx={{ height: 300 }}>
              <DashboardWidget
                widget={widget}
                filters={{}}
                timeRange={{ days: 30 }}
                isEditMode={false}
              />
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Test Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This page demonstrates the KPI cards and other analytics widgets pulling data from the
          <code>/analytics/widgets/{'{widget_id}'}/data</code> API endpoint. Each widget shows
          different data types and formatting options.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          The widgets automatically refresh every 30 seconds and support caching, error handling, 
          and various display options.
        </Typography>
      </Box>
    </Container>
    </QueryClientProvider>
  );
};

export default WidgetsTestPage;