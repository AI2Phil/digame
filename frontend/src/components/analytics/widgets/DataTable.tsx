import React from 'react';
import { Box, Typography } from '@mui/material';

interface DataTableProps {
  data: any;
  options?: any;
  title?: string;
}

export const DataTable: React.FC<DataTableProps> = ({ data, options, title }) => {
  return (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        Data Table Component
      </Typography>
      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
        {title && `Title: ${title}`}
      </Typography>
      <Typography variant="caption" display="block">
        Data rows: {Array.isArray(data) ? data.length : 'N/A'}
      </Typography>
    </Box>
  );
};

export default DataTable;