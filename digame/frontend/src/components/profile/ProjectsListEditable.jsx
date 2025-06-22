import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Badge } from '../ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../ui/Dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { PlusCircle, Trash2, Edit2 } from 'lucide-react'; // Added Edit2 for potential future use

const ProjectItem = ({ project, onEdit, onDelete, isEditing }) => (
  <div className="mb-4 p-4 border rounded-md">
    <h3 className="font-semibold text-lg">{project.title}</h3>
    <p className="text-sm text-gray-600">{project.description}</p>
    {project.url && (
      <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
        View Project
      </a>
    )}
    <div className="mt-2">
      <span className="text-xs font-semibold">Technologies Used:</span>
      <div className="flex flex-wrap gap-1 mt-1">
        {(project.technologiesUsed || []).map((tech, index) => (
          <Badge key={index} variant="secondary">{tech}</Badge>
        ))}
      </div>
    </div>
    {isEditing && (
      <div className="mt-3 flex gap-2">
        {/* <Button variant="outline" size="sm" onClick={() => onEdit(project)}><Edit2 className="w-3 h-3 mr-1" /> Edit</Button> */}
        <Button variant="destructive" size="sm" onClick={() => onDelete(project.id || project.title)}><Trash2 className="w-3 h-3 mr-1" /> Delete</Button>
      </div>
    )}
  </div>
);

const ProjectForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [project, setProject] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    url: initialData.url || '',
    technologiesUsed_input: (initialData.technologiesUsed || []).join(', '),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const technologiesUsed = project.technologiesUsed_input.split(',').map(s => s.trim()).filter(s => s);
    onSubmit({ ...project, technologiesUsed, id: initialData.id || Date.now() }); // Use Date.now() for temp ID if new
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="title" value={project.title} onChange={handleChange} placeholder="Project Title" required />
      <Textarea name="description" value={project.description} onChange={handleChange} placeholder="Project Description" rows={3} />
      <Input name="url" value={project.url} onChange={handleChange} placeholder="Project URL" />
      <Textarea
        name="technologiesUsed_input"
        value={project.technologiesUsed_input}
        onChange={handleChange}
        placeholder="Technologies Used (comma-separated)"
        rows={2}
      />
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </DialogClose>
        <Button type="submit">Save Project</Button>
      </DialogFooter>
    </form>
  );
};

const ProjectsListEditable = ({ items = [], setItems, isEditing }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [editingProject, setEditingProject] = useState(null); // For editing existing item

  const handleAddProject = (newProject) => {
    setItems([...items, newProject]);
    setIsDialogOpen(false);
  };

  // const handleEditProject = (projectToEdit) => {
  //   setEditingProject(projectToEdit);
  //   setIsDialogOpen(true);
  // };

  // const handleUpdateProject = (updatedProject) => {
  //   setItems(items.map(p => (p.id === updatedProject.id ? updatedProject : p)));
  //   setEditingProject(null);
  //   setIsDialogOpen(false);
  // };

  const handleDeleteProject = (projectId) => {
    // If ID is missing (for newly added items not yet saved to backend), filter by title or another unique temp prop
    setItems(items.filter(p => (p.id || p.title) !== projectId));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Projects</CardTitle>
        {isEditing && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => { /*setEditingProject(null);*/ setIsDialogOpen(true); }}>
                <PlusCircle className="w-4 h-4 mr-2" /> Add Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{/*editingProject ? 'Edit Project' :*/ 'Add New Project'}</DialogTitle>
              </DialogHeader>
              <ProjectForm
                // initialData={editingProject || {}}
                onSubmit={/*editingProject ? handleUpdateProject :*/ handleAddProject}
                onCancel={() => { /*setEditingProject(null);*/ setIsDialogOpen(false); }}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {items && items.length > 0 ? (
          items.map((proj, index) => (
            <ProjectItem
              key={proj.id || index} // Use index as fallback key for new items without backend ID
              project={proj}
              // onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              isEditing={isEditing}
            />
          ))
        ) : (
          <p className="text-sm text-gray-500">{isEditing ? "No projects added yet. Click 'Add Project' to start." : "No projects to display."}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectsListEditable;
