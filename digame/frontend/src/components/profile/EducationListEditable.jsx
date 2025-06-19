import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
// import { Textarea } from '../ui/Textarea'; // Not typically needed for education
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../ui/Dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { PlusCircle, Trash2 } from 'lucide-react';

const EducationItem = ({ education, onDelete, isEditing }) => (
  <div className="mb-4 p-4 border rounded-md">
    <h3 className="font-semibold text-lg">{education.institution}</h3>
    <p className="text-sm text-gray-700">{education.degree}{education.fieldOfStudy ? ` in ${education.fieldOfStudy}` : ''}</p>
    {education.graduationYear && <p className="text-xs text-gray-500">Graduated: {education.graduationYear}</p>}
    {isEditing && (
      <div className="mt-3">
        <Button variant="destructive" size="sm" onClick={() => onDelete(education.id || education.institution)}>
          <Trash2 className="w-3 h-3 mr-1" /> Delete
        </Button>
      </div>
    )}
  </div>
);

const EducationForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [education, setEducation] = useState({
    institution: initialData.institution || '',
    degree: initialData.degree || '',
    fieldOfStudy: initialData.fieldOfStudy || '',
    graduationYear: initialData.graduationYear || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEducation(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...education, id: initialData.id || Date.now() }); // Use Date.now() for temp ID if new
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="institution" value={education.institution} onChange={handleChange} placeholder="Institution Name" required />
      <Input name="degree" value={education.degree} onChange={handleChange} placeholder="Degree (e.g., B.S., M.S.)" />
      <Input name="fieldOfStudy" value={education.fieldOfStudy} onChange={handleChange} placeholder="Field of Study" />
      <Input name="graduationYear" value={education.graduationYear} onChange={handleChange} placeholder="Graduation Year" />
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </DialogClose>
        <Button type="submit">Save Education</Button>
      </DialogFooter>
    </form>
  );
};

const EducationListEditable = ({ items = [], setItems, isEditing }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddItem = (newItem) => {
    setItems([...items, newItem]);
    setIsDialogOpen(false);
  };

  const handleDeleteItem = (itemId) => {
    setItems(items.filter(item => (item.id || item.institution) !== itemId));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Education</CardTitle>
        {isEditing && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="w-4 h-4 mr-2" /> Add Education
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Education</DialogTitle>
              </DialogHeader>
              <EducationForm
                onSubmit={handleAddItem}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {items && items.length > 0 ? (
          items.map((edu, index) => (
            <EducationItem
              key={edu.id || index}
              education={edu}
              onDelete={handleDeleteItem}
              isEditing={isEditing}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">{isEditing ? "No education entries added yet." : "No education entries to display."}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default EducationListEditable;
