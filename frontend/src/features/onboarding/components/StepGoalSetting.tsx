import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } // Assuming Input can be used for text areas or we might need a TextArea component
from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';

interface StepGoalSettingProps {
  onComplete: (data: { primaryGoal: string }) => void;
  onPrevious: () => void;
}

const StepGoalSetting: React.FC<StepGoalSettingProps> = ({ onComplete, onPrevious }) => {
  const [primaryGoal, setPrimaryGoal] = useState('');

  const handleSubmit = () => {
    if (primaryGoal) {
      onComplete({ primaryGoal });
    } else {
      alert('Please define your primary goal.');
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Define Your Goals</CardTitle>
        <CardDescription>What's one primary goal you want to achieve using Digame?</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <label htmlFor="primaryGoal" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Primary Goal</label>
          {/* Using Input as a simple text area for now. A dedicated TextArea component might be better. */}
          <Input
            id="primaryGoal"
            value={primaryGoal}
            onChange={(e) => setPrimaryGoal(e.target.value)}
            placeholder="e.g., Improve focus time by 20%"
            className="mt-1" // Tailwind might need h-auto for textarea-like behavior if input is strictly h-10
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>Previous</Button>
        <Button onClick={handleSubmit}>Complete Setup</Button>
      </CardFooter>
    </Card>
  );
};

export default StepGoalSetting;
