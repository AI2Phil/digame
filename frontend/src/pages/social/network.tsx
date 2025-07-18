import React from 'react';
import { Container } from '@mui/material';
import ProfessionalNetwork from '../../src/components/social/ProfessionalNetwork';

export default const NetworkPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <ProfessionalNetwork />
    </Container>
  );
}