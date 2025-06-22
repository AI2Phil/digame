import React from 'react';
import { Button } from '../../../components/ui/Button'; // Assuming path to our Button
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card'; // Path to Card

interface StepWelcomeProps {
  onNext: () => void;
}

const StepWelcome: React.FC<StepWelcomeProps> = ({ onNext }) => {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Welcome to Digame!</CardTitle>
        <CardDescription>Let's get you set up for success.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This quick setup wizard will help you personalize your experience and define your initial goals.</p>
        <p className="mt-4">Click "Next" to begin.</p>
      </CardContent>
      <CardFooter>
        <Button onClick={onNext} className="ml-auto">Next</Button>
      </CardFooter>
    </Card>
  );
};

export default StepWelcome;
