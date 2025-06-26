import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../../../components/ui/Dialog'; // Using our Dialog
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/Card'; // Alternative: use Cards for steps

interface TourStep {
  id: string;
  title: string;
  content: React.ReactNode;
  targetElement?: string; // Placeholder for what element this step would highlight
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step1',
    title: 'Welcome to the Dashboard!',
    content: <p>This is where you'll find an overview of your productivity and activities. We'll point out a few key areas.</p>,
    targetElement: '#dashboard-summary-widget', // Example selector
  },
  {
    id: 'step2',
    title: 'Your Activity Feed',
    content: <p>Your recent activities and completed tasks will appear here, keeping you updated on your progress.</p>,
    targetElement: '#activity-feed-section', // Example selector
  },
  {
    id: 'step3',
    title: 'Goal Tracking',
    content: <p>Monitor your progress towards your defined goals in this section. Stay motivated!</p>,
    targetElement: '#goal-tracking-widget', // Example selector
  },
  {
    id: 'step4',
    title: 'Tour Complete!',
    content: <p>You're all set to explore. Remember, you can always find help in the support section.</p>,
  }
];

interface PlatformTourProps {
  isOpenInitially?: boolean;
  onComplete: () => void;
}

const PlatformTour: React.FC<PlatformTourProps> = ({ isOpenInitially = false, onComplete }) => {
  const [isOpen, setIsOpen] = useState(isOpenInitially);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = TOUR_STEPS[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setIsOpen(false);
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setIsOpen(false);
    onComplete(); // Or a specific skip action
  }

  if (!isOpen || !currentStep) {
    return null; // Or a button to start the tour if isOpenInitially is false
  }

  // Simple start button if tour is not open by default
  // This part is conceptual if the tour is part of a larger flow that controls its visibility.
  // For this component, we assume 'isOpen' is managed externally or starts open.


  // Using Dialog for the tour steps
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) { // If dialog is closed externally (e.g. Esc key)
        handleSkip();
      }
      setIsOpen(open);
    }}>
      {/* No DialogTrigger here as we control open state directly or assume it's part of a flow */}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{currentStep.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {currentStep.content}
          {currentStep.targetElement && (
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              (This would typically highlight: <code>{currentStep.targetElement}</code>)
            </p>
          )}
        </div>
        <DialogFooter className="justify-between">
          {currentStepIndex > 0 && currentStepIndex < TOUR_STEPS.length -1 ? (
            <Button variant="outline" onClick={handlePrevious}>Previous</Button>
          ) : (
            <div /> // Placeholder to keep space if no previous button
          )}
          <div className="flex space-x-2">
            {currentStepIndex < TOUR_STEPS.length - 1 && (
                 <Button variant="ghost" onClick={handleSkip}>Skip Tour</Button>
            )}
            <Button onClick={handleNext}>
              {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Alternative: Use a Card for a less intrusive tour step display (e.g., positioned absolutely)
  // This would require more complex positioning logic not suitable for this basic phase.
  // return (
  //   <div className="fixed bottom-4 right-4 z-50">
  //     <Card className="w-full max-w-sm">
  //       <CardHeader>
  //         <CardTitle>{currentStep.title}</CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         {currentStep.content}
  //         {currentStep.targetElement && (
  //           <p className="mt-2 text-xs text-gray-500">
  //             (Highlights: <code>{currentStep.targetElement}</code>)
  //           </p>
  //         )}
  //       </CardContent>
  //       <CardFooter className="flex justify-between">
  //         <Button variant="ghost" onClick={handlePrevious} disabled={currentStepIndex === 0}>Previous</Button>
  //         <Button onClick={handleNext}>
  //           {currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
  //         </Button>
  //       </CardFooter>
  //     </Card>
  //   </div>
  // );
};

export default PlatformTour;
