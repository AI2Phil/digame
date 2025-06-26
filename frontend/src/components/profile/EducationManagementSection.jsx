import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
// import { Textarea } from '../ui/Textarea'; // Not typically needed for education entries
import { XCircle, PlusCircle } from 'lucide-react';

const EducationManagementSection = ({ education, setEditData, isEditing, userData }) => {
  const [newEducation, setNewEducation] = useState({
    id: '',
    institution: '',
    degree: '',
    fieldOfStudy: '',
    graduationYear: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEducation(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEducation = () => {
    if (!newEducation.institution || !newEducation.degree) return; // Basic validation
    const educationToAdd = { ...newEducation, id: `temp-${Date.now().toString()}` };
    setEditData(prev => ({
      ...prev,
      education: [...(prev.education || []), educationToAdd],
    }));
    setNewEducation({ id: '', institution: '', degree: '', fieldOfStudy: '', graduationYear: '' }); // Reset form
  };

  const handleRemoveEducation = (educationId) => {
    setEditData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== educationId),
    }));
  };

  const displayEducation = isEditing ? education : userData?.education;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Education</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {education?.map((edu) => (
              <div key={edu.id} className="p-3 border rounded-md space-y-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{edu.institution}</p>
                    <p className="text-sm text-gray-600">{edu.degree} in {edu.fieldOfStudy}</p>
                    <p className="text-sm text-gray-500">Graduated: {edu.graduationYear}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveEducation(edu.id)}>
                    <XCircle className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="p-4 border rounded-md space-y-3 bg-gray-50">
              <h3 className="text-md font-semibold">Add New Education</h3>
              <Input name="institution" value={newEducation.institution} onChange={handleInputChange} placeholder="Institution" />
              <Input name="degree" value={newEducation.degree} onChange={handleInputChange} placeholder="Degree (e.g., B.Sc., M.A.)" />
              <Input name="fieldOfStudy" value={newEducation.fieldOfStudy} onChange={handleInputChange} placeholder="Field of Study (e.g., Computer Science)" />
              <Input name="graduationYear" value={newEducation.graduationYear} onChange={handleInputChange} placeholder="Graduation Year" />
              <Button onClick={handleAddEducation} size="sm">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {displayEducation?.length > 0 ? (
              displayEducation.map((edu) => (
                <div key={edu.id} className="p-3 border rounded-md">
                  <h3 className="font-semibold">{edu.institution}</h3>
                  <p className="text-sm text-gray-600">{edu.degree} in {edu.fieldOfStudy}</p>
                  <p className="text-sm text-gray-500">Graduated: {edu.graduationYear}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No education history listed.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EducationManagementSection;
