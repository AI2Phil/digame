import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Link } from 'lucide-react'; // Using Link icon for URL

const ProjectDisplayCard = ({ project }) => {
  if (!project) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{project.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {project.description && <p className="text-sm text-gray-700 mb-2">{project.description}</p>}
        {project.url && (
          <a
            href={project.url.startsWith('http') ? project.url : `https://${project.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 hover:underline mb-2"
          >
            <Link className="w-4 h-4 mr-1" />
            View Project
          </a>
        )}
        {project.technologiesUsed && project.technologiesUsed.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-600 mb-1">Technologies Used:</h4>
            <div className="flex flex-wrap gap-2">
              {project.technologiesUsed.map((tech, index) => (
                <Badge key={index} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectDisplayCard;
