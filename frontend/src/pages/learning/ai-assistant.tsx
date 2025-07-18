import React from 'react';
import { Container } from '@mui/material';
import AILearningAssistant from '../../components/learning/AILearningAssistant';

const AIAssistantPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <AILearningAssistant />
    </Container>
  );
};

export default AIAssistantPage;
