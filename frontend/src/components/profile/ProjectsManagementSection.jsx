import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { XCircle, PlusCircle } from 'lucide-react';

const ProjectsManagementSection = ({ projects, setEditData, isEditing, userData }) => {
  const [newProject, setNewProject] = useState({
    id: '',
    title: '',
    description: '',
    url: '',
    technologiesUsed: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'technologiesUsed') {
      setNewProject(prev => ({ ...prev, technologiesUsed: value.split(',').map(tech => tech.trim()) }));
    } else {
      setNewProject(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProject = () => {
    if (!newProject.title) return; // Basic validation
    const projectToAdd = { ...newProject, id: `temp-${Date.now().toString()}` };
    setEditData(prev => ({
      ...prev,
      projects: [...(prev.projects || []), projectToAdd],
    }));
    setNewProject({ id: '', title: '', description: '', url: '', technologiesUsed: [] }); // Reset form
  };

  const handleRemoveProject = (projectId) => {
    setEditData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== projectId),
    }));
  };

  const displayProjects = isEditing ? projects : userData?.projects;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            {projects?.map((proj) => (
              <div key={proj.id} className="p-3 border rounded-md space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{proj.title}</p>
                    <p className="text-sm text-gray-600">{proj.description}</p>
                    {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">{proj.url}</a>}
                    {proj.technologiesUsed?.length > 0 && <p className="text-xs text-gray-500 mt-1">Tech: {proj.technologiesUsed.join(', ')}</p>}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveProject(proj.id)}>
                    <XCircle className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="p-4 border rounded-md space-y-3 bg-gray-50">
              <h3 className="text-md font-semibold">Add New Project</h3>
              <Input name="title" value={newProject.title} onChange={handleInputChange} placeholder="Project Title" />
              <Textarea name="description" value={newProject.description} onChange={handleInputChange} placeholder="Description" rows={3} />
              <Input name="url" value={newProject.url} onChange={handleInputChange} placeholder="Project URL (optional)" />
              <Input name="technologiesUsed" value={newProject.technologiesUsed.join(', ')} onChange={handleInputChange} placeholder="Technologies Used (comma-separated)" />
              <Button onClick={handleAddProject} size="sm">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {displayProjects?.length > 0 ? (
              displayProjects.map((proj) => (
                <div key={proj.id} className="p-3 border rounded-md">
                  <h3 className="font-semibold">{proj.title}</h3>
                  <p className="text-sm text-gray-600">{proj.description}</p>
                  {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">{proj.url}</a>}
                  {proj.technologiesUsed?.length > 0 && <p className="text-xs text-gray-500 mt-1">Technologies: {proj.technologiesUsed.join(', ')}</p>}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No projects listed.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectsManagementSection;
