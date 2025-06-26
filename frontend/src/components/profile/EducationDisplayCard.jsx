import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { GraduationCap } from 'lucide-react';

const EducationDisplayCard = ({ education }) => {
  if (!education) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <GraduationCap className="w-5 h-5 mr-2 text-green-600" />
          {education.institution}
        </CardTitle>
        <p className="text-sm text-gray-600">
          {education.degree}
          {education.fieldOfStudy && <span className="italic"> in {education.fieldOfStudy}</span>}
        </p>
        {education.graduationYear && <p className="text-xs text-gray-500">Graduated: {education.graduationYear}</p>}
      </CardHeader>
      {/* No CardContent needed if all info is in header, or can move some here */}
    </Card>
  );
};

export default EducationDisplayCard;
