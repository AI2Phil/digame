import React from 'react';
import { Container } from '@mui/material';
import MentorshipHub from '../../src/components/social/MentorshipHub';

export default const MentorshipPage: React.FC = () => {
  return (
    <Container maxWidth="xl">
      <MentorshipHub />
    </Container>
  );
}