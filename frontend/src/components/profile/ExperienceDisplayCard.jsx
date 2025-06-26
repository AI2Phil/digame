import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Briefcase } from 'lucide-react';

const ExperienceDisplayCard = ({ experience }) => {
  if (!experience) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
          {experience.jobTitle}
        </CardTitle>
        <p className="text-sm text-gray-600">{experience.company}</p>
        {experience.duration && <p className="text-xs text-gray-500">{experience.duration}</p>}
      </CardHeader>
      <CardContent>
        {experience.description && <p className="text-sm text-gray-700">{experience.description}</p>}
      </CardContent>
    </Card>
  );
};

export default ExperienceDisplayCard;
