import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { XCircle, PlusCircle } from 'lucide-react';

const ExperienceManagementSection = ({ experience, setEditData, isEditing, userData }) => {
  const [newExperience, setNewExperience] = useState({
    id: '',
    jobTitle: '',
    company: '',
    duration: '',
    description: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExperience(prev => ({ ...prev, [name]: value }));
  };

  const handleAddExperience = () => {
    if (!newExperience.jobTitle || !newExperience.company) return; // Basic validation
    const experienceToAdd = { ...newExperience, id: `temp-${Date.now().toString()}` };
    setEditData(prev => ({
      ...prev,
      experience: [...(prev.experience || []), experienceToAdd],
    }));
    setNewExperience({ id: '', jobTitle: '', company: '', duration: '', description: '' }); // Reset form
  };

  const handleRemoveExperience = (experienceId) => {
    setEditData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== experienceId),
    }));
  };

  const displayExperience = isEditing ? experience : userData?.experience;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Experience</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {experience?.map((exp) => (
              <div key={exp.id} className="p-3 border rounded-md space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{exp.jobTitle} at {exp.company}</p>
                    <p className="text-sm text-gray-500">{exp.duration}</p>
                    <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveExperience(exp.id)}>
                    <XCircle className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="p-4 border rounded-md space-y-3 bg-gray-50">
              <h3 className="text-md font-semibold">Add New Experience</h3>
              <Input name="jobTitle" value={newExperience.jobTitle} onChange={handleInputChange} placeholder="Job Title" />
              <Input name="company" value={newExperience.company} onChange={handleInputChange} placeholder="Company" />
              <Input name="duration" value={newExperience.duration} onChange={handleInputChange} placeholder="Duration (e.g., 2020-Present, Jan 2019 - Dec 2020)" />
              <Textarea name="description" value={newExperience.description} onChange={handleInputChange} placeholder="Description" rows={3} />
              <Button onClick={handleAddExperience} size="sm">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {displayExperience?.length > 0 ? (
              displayExperience.map((exp) => (
                <div key={exp.id} className="p-3 border rounded-md">
                  <h3 className="font-semibold">{exp.jobTitle} at {exp.company}</h3>
                  <p className="text-sm text-gray-500">{exp.duration}</p>
                  <p className="text-sm text-gray-600 mt-1">{exp.description}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No work experience listed.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExperienceManagementSection;
