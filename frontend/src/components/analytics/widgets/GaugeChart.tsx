import React from 'react';
import { Box, Typography } from '@mui/material';

interface GaugeChartProps {
  data: any;
  options?: any;
  title?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({ data, options, title }) => {
  return (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        Gauge Chart Component
      </Typography>
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        {title && `Title: ${title}`}
      </Typography>
      <Typography variant="caption" display="block">
        Value: {data?.value || 'N/A'}
      </Typography>
    </Box>
  );
};

export default GaugeChart;