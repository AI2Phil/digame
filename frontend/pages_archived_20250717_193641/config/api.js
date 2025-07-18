import React from 'react';
import { Container } from '@mui/material';
import ConfigurationAPI from '../../src/components/config/ConfigurationAPI';

export default function ConfigurationAPIPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <ConfigurationAPI />
    </Container>
  );
}