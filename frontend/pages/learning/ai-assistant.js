import React from 'react';
import { Container } from '@mui/material';
import AILearningAssistant from '../../src/components/learning/AILearningAssistant';

export default function AIAssistantPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <AILearningAssistant />
    </Container>
  );
}