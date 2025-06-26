import React from 'react';
import { Box, Typography } from '@mui/material';

interface PieChartProps {
  data: any;
  options?: any;
  title?: string;
}

export const PieChart: React.FC<PieChartProps> = ({ data, options, title }) => {
  return (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        Pie Chart Component
      </Typography>
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        {title && `Title: ${title}`}
      </Typography>
      <Typography variant="caption" display="block">
        Data points: {Array.isArray(data) ? data.length : 'N/A'}
      </Typography>
    </Box>
  );
};

export default PieChart;