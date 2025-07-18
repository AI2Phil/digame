import React from 'react';
import { Container } from '@mui/material';
import SkillTracking from '../../components/learning/SkillTracking';

const SkillTrackingPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <SkillTracking />
    </Container>
  );
};

export default SkillTrackingPage;
