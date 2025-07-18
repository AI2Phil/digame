import React from 'react';
import { Container } from '@mui/material';
import AILearningAssistant from '../../src/components/learning/AILearningAssistant';

export default const AIAssistantPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <AILearningAssistant />
    </Container>
  );
}