import React from 'react';
import { Box, Typography, Grid, Container, Card, CardContent } from '@mui/material';
import { KPICard } from '../../components/analytics/widgets/KPICard';

const KPITestPage = () => {
  // Sample KPI data for testing different scenarios
  const kpiData = [
    {
      title: "Total Revenue",
      data: {
        value: 45750.50,
        previous_value: 42300.00,
        change_percent: 8.2,
        trend: "up" as const,
        status: "excellent" as const,
        target_value: 50000,
        unit: "USD"
      },
      options: {
        format: "currency" as const,
        currency: "$",
        decimals: 2,
        show_trend: true,
        show_progress: true,
        color_scheme: "primary"
      }
    },
    {
      title: "Active Users",
      data: {
        value: 12847,
        previous_value: 11950,
        change_percent: 7.5,
        trend: "up" as const,
        status: "good" as const,
        target_value: 15000
      },
      options: {
        format: "number" as const,
        decimals: 0,
        show_trend: true,
        show_progress: true
      }
    },
    {
      title: "Conversion Rate",
      data: {
        value: 3.42,
        previous_value: 3.18,
        change_percent: 7.5,
        trend: "up" as const,
        status: "excellent" as const,
        target_value: 4.0
      },
      options: {
        format: "percentage" as const,
        decimals: 2,
        show_trend: true,
        show_progress: true
      }
    },
    {
      title: "Customer Satisfaction",
      data: {
        value: 4.7,
        previous_value: 4.5,
        change_percent: 4.4,
        trend: "up" as const,
        status: "excellent" as const,
        target_value: 5.0,
        unit: "out of 5"
      },
      options: {
        format: "number" as const,
        decimals: 1,
        show_trend: true,
        show_progress: true
      }
    },
    {
      title: "Monthly Churn Rate",
      data: {
        value: 2.1,
        previous_value: 2.8,
        change_percent: -25.0,
        trend: "down" as const,
        status: "excellent" as const,
        target_value: 2.0
      },
      options: {
        format: "percentage" as const,
        decimals: 1,
        show_trend: true,
        show_progress: true
      }
    },
    {
      title: "Server Uptime",
      data: {
        value: 99.97,
        previous_value: 99.85,
        change_percent: 0.12,
        trend: "up" as const,
        status: "excellent" as const,
        target_value: 99.9
      },
      options: {
        format: "percentage" as const,
        decimals: 2,
        show_trend: true,
        show_progress: true
      }
    },
    {
      title: "Support Tickets",
      data: {
        value: 23,
        previous_value: 31,
        change_percent: -25.8,
        trend: "down" as const,
        status: "good" as const,
        target_value: 20
      },
      options: {
        format: "number" as const,
        decimals: 0,
        show_trend: true,
        show_progress: true
      }
    },
    {
      title: "API Response Time",
      data: {
        value: 145,
        previous_value: 167,
        change_percent: -13.2,
        trend: "down" as const,
        status: "good" as const,
        target_value: 120,
        unit: "ms"
      },
      options: {
        format: "number" as const,
        decimals: 0,
        show_trend: true,
        show_progress: true
      }
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          KPI Cards Test
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Testing KPI card components with various data types and formatting options
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {kpiData.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card sx={{ height: 280 }}>
              <KPICard
                title={kpi.title}
                data={kpi.data}
                options={kpi.options}
              />
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          KPI Card Features Demonstrated
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Data Formats:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2 }}>
              <li>Currency formatting with symbols</li>
              <li>Percentage values with precision control</li>
              <li>Number formatting with locale support</li>
              <li>Custom units and labels</li>
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Visual Features:</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2 }}>
              <li>Trend indicators (up/down/flat)</li>
              <li>Status color coding (excellent/good/warning/critical)</li>
              <li>Progress bars for target tracking</li>
              <li>Change percentage with previous values</li>
            </Typography>
          </Grid>
        </Grid>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          These KPI cards demonstrate the database-driven approach where each card receives 
          structured data and displays it according to configurable options. The cards support 
          real-time updates, trend analysis, and target tracking.
        </Typography>
      </Box>
    </Container>
  );
};

export default KPITestPage;