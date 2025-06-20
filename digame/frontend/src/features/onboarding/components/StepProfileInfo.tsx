import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input'; // Path to Input
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';

interface StepProfileInfoProps {
  onNext: (data: { fullName: string; role: string }) => void;
  onPrevious: () => void;
}

const StepProfileInfo: React.FC<StepProfileInfoProps> = ({ onNext, onPrevious }) => {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = () => {
    // Basic validation can be added here
    if (fullName && role) {
      onNext({ fullName, role });
    } else {
      alert('Please fill in all fields.');
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>Tell us a bit about yourself.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
          <Input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g., Alex Doe"
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Role</label>
          <Input
            type="text"
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g., Software Engineer"
            className="mt-1"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>Previous</Button>
        <Button onClick={handleSubmit}>Next</Button>
      </CardFooter>
    </Card>
  );
};

export default StepProfileInfo;
