import React from 'react';
import { Container } from '@mui/material';
import LearningPartners from '../../src/components/social/LearningPartners';

export default const LearningPartnersPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <LearningPartners />
    </Container>
  );
}