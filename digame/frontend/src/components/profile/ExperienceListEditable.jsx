import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../ui/Dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { PlusCircle, Trash2 } from 'lucide-react';

const ExperienceItem = ({ experience, onDelete, isEditing }) => (
  <div className="mb-4 p-4 border rounded-md">
    <h3 className="font-semibold text-lg">{experience.jobTitle}</h3>
    <p className="text-sm text-gray-700">{experience.company}</p>
    {experience.duration && <p className="text-xs text-gray-500">{experience.duration}</p>}
    {experience.description && <p className="text-sm text-gray-600 mt-1">{experience.description}</p>}
    {isEditing && (
      <div className="mt-3">
        <Button variant="destructive" size="sm" onClick={() => onDelete(experience.id || experience.jobTitle)}>
          <Trash2 className="w-3 h-3 mr-1" /> Delete
        </Button>
      </div>
    )}
  </div>
);

const ExperienceForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [experience, setExperience] = useState({
    jobTitle: initialData.jobTitle || '',
    company: initialData.company || '',
    duration: initialData.duration || '',
    description: initialData.description || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExperience(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...experience, id: initialData.id || Date.now() }); // Use Date.now() for temp ID if new
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="jobTitle" value={experience.jobTitle} onChange={handleChange} placeholder="Job Title" required />
      <Input name="company" value={experience.company} onChange={handleChange} placeholder="Company" />
      <Input name="duration" value={experience.duration} onChange={handleChange} placeholder="Duration (e.g., May 2020 - Present)" />
      <Textarea name="description" value={experience.description} onChange={handleChange} placeholder="Job Description" rows={3} />
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </DialogClose>
        <Button type="submit">Save Experience</Button>
      </DialogFooter>
    </form>
  );
};

const ExperienceListEditable = ({ items = [], setItems, isEditing }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddItem = (newItem) => {
    setItems([...items, newItem]);
    setIsDialogOpen(false);
  };

  const handleDeleteItem = (itemId) => {
    setItems(items.filter(item => (item.id || item.jobTitle) !== itemId));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Experience</CardTitle>
        {isEditing && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="w-4 h-4 mr-2" /> Add Experience
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Experience</DialogTitle>
              </DialogHeader>
              <ExperienceForm
                onSubmit={handleAddItem}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {items && items.length > 0 ? (
          items.map((exp, index) => (
            <ExperienceItem
              key={exp.id || index}
              experience={exp}
              onDelete={handleDeleteItem}
              isEditing={isEditing}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">{isEditing ? "No experience entries added yet." : "No experience entries to display."}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ExperienceListEditable;
