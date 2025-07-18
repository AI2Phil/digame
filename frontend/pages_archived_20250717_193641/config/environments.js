import React from 'react';
import { Container } from '@mui/material';
import EnvironmentManagement from '../../src/components/config/EnvironmentManagement';

export default function EnvironmentManagementPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <EnvironmentManagement />
    </Container>
  );
}