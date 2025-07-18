import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../../components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Progress } from '../../components/ui/Progress';
import {
  FolderOpen,
  Plus,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Star,
  Filter,
  Search,
  BarChart3,
  Settings,
  Edit,
  Trash2,
  Eye,
  Share,
  Archive,
  Target,
  Zap,
} from 'lucide-react';

const TaskProjects: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('active');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [activeTab]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/projects?status=${activeTab}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockProjects = [
    {
      id: 1,
      name: 'Website Redesign',
      description:
        'Complete overhaul of company website with modern design and improved user experience',
      status: 'in_progress',
      priority: 'high',
      progress: 68,
      startDate: '2024-01-01',
      dueDate: '2024-02-15',
      completedDate: null,
      teamMembers: [
        { id: 1, name: 'John Doe', role: 'Project Manager', avatar: 'JD' },
        { id: 2, name: 'Jane Smith', role: 'UI Designer', avatar: 'JS' },
        { id: 3, name: 'Mike Johnson', role: 'Developer', avatar: 'MJ' },
        { id: 4, name: 'Sarah Wilson', role: 'QA Tester', avatar: 'SW' },
      ],
      tasks: {
        total: 24,
        completed: 16,
        inProgress: 5,
        pending: 3,
        overdue: 2,
      },
      budget: {
        allocated: 50000,
        spent: 32000,
        remaining: 18000,
      },
      milestones: [
        { id: 1, name: 'Design Phase', completed: true, dueDate: '2024-01-15' },
        { id: 2, name: 'Development Phase', completed: false, dueDate: '2024-02-01' },
        { id: 3, name: 'Testing Phase', completed: false, dueDate: '2024-02-10' },
        { id: 4, name: 'Launch', completed: false, dueDate: '2024-02-15' },
      ],
      tags: ['web', 'design', 'frontend'],
      category: 'development',
      health: 'good',
      lastActivity: '2 hours ago',
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description:
        'Native mobile application for iOS and Android platforms with offline capabilities',
      status: 'planning',
      priority: 'medium',
      progress: 15,
      startDate: '2024-02-01',
      dueDate: '2024-06-30',
      completedDate: null,
      teamMembers: [
        { id: 5, name: 'Sarah Wilson', role: 'Lead Developer', avatar: 'SW' },
        { id: 6, name: 'Tom Brown', role: 'Mobile Developer', avatar: 'TB' },
        { id: 7, name: 'Lisa Davis', role: 'UX Designer', avatar: 'LD' },
      ],
      tasks: {
        total: 45,
        completed: 3,
        inProgress: 4,
        pending: 38,
        overdue: 0,
      },
      budget: {
        allocated: 120000,
        spent: 8500,
        remaining: 111500,
      },
      milestones: [
        { id: 1, name: 'Requirements Gathering', completed: true, dueDate: '2024-02-15' },
        { id: 2, name: 'Architecture Design', completed: false, dueDate: '2024-03-01' },
        { id: 3, name: 'MVP Development', completed: false, dueDate: '2024-04-15' },
        { id: 4, name: 'Beta Testing', completed: false, dueDate: '2024-05-30' },
      ],
      tags: ['mobile', 'ios', 'android', 'native'],
      category: 'development',
      health: 'excellent',
      lastActivity: '1 day ago',
    },
    {
      id: 3,
      name: 'Marketing Campaign Q1',
      description:
        'Comprehensive marketing campaign for Q1 product launch including digital and traditional media',
      status: 'completed',
      priority: 'high',
      progress: 100,
      startDate: '2023-12-01',
      dueDate: '2024-01-31',
      completedDate: '2024-01-28',
      teamMembers: [
        { id: 8, name: 'Emma Garcia', role: 'Marketing Manager', avatar: 'EG' },
        { id: 9, name: 'David Lee', role: 'Content Creator', avatar: 'DL' },
        { id: 10, name: 'Anna Kim', role: 'Social Media Manager', avatar: 'AK' },
      ],
      tasks: {
        total: 18,
        completed: 18,
        inProgress: 0,
        pending: 0,
        overdue: 0,
      },
      budget: {
        allocated: 75000,
        spent: 72000,
        remaining: 3000,
      },
      milestones: [
        { id: 1, name: 'Campaign Strategy', completed: true, dueDate: '2023-12-15' },
        { id: 2, name: 'Content Creation', completed: true, dueDate: '2024-01-10' },
        { id: 3, name: 'Campaign Launch', completed: true, dueDate: '2024-01-20' },
        { id: 4, name: 'Performance Analysis', completed: true, dueDate: '2024-01-31' },
      ],
      tags: ['marketing', 'campaign', 'digital', 'launch'],
      category: 'marketing',
      health: 'excellent',
      lastActivity: '3 days ago',
    },
    {
      id: 4,
      name: 'Data Migration Project',
      description: 'Migration of legacy data systems to new cloud-based infrastructure',
      status: 'at_risk',
      priority: 'high',
      progress: 45,
      startDate: '2023-11-15',
      dueDate: '2024-01-30',
      completedDate: null,
      teamMembers: [
        { id: 11, name: 'Robert Chen', role: 'Data Engineer', avatar: 'RC' },
        { id: 12, name: 'Maria Rodriguez', role: 'Database Admin', avatar: 'MR' },
        { id: 13, name: 'Kevin Park', role: 'Cloud Architect', avatar: 'KP' },
      ],
      tasks: {
        total: 32,
        completed: 12,
        inProgress: 8,
        pending: 12,
        overdue: 6,
      },
      budget: {
        allocated: 95000,
        spent: 68000,
        remaining: 27000,
      },
      milestones: [
        { id: 1, name: 'Data Assessment', completed: true, dueDate: '2023-12-01' },
        { id: 2, name: 'Infrastructure Setup', completed: true, dueDate: '2023-12-20' },
        { id: 3, name: 'Data Migration', completed: false, dueDate: '2024-01-15' },
        { id: 4, name: 'Testing & Validation', completed: false, dueDate: '2024-01-30' },
      ],
      tags: ['data', 'migration', 'cloud', 'infrastructure'],
      category: 'infrastructure',
      health: 'at_risk',
      lastActivity: '4 hours ago',
    },
  ];

  const currentProjects = projects.length > 0 ? projects : mockProjects;

  const filteredProjects = currentProjects.filter(project => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && ['in_progress', 'planning'].includes(project.status)) ||
      (activeTab === 'completed' && project.status === 'completed') ||
      (activeTab === 'at_risk' && project.status === 'at_risk');

    return matchesSearch && matchesTab;
  });

  const getStatusColor = status => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
        return 'secondary';
      case 'planning':
        return 'outline';
      case 'at_risk':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getHealthColor = health => {
    switch (health) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'at_risk':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const projectTabs = [
    { value: 'all', label: 'All Projects' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'at_risk', label: 'At Risk' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Project Management"
        subtitle="Manage and track project progress, team collaboration, and deliverables"
        icon={<FolderOpen className="h-8 w-8" />}
        breadcrumb={[
          { label: 'Tasks', href: '/tasks' },
          { label: 'Projects', href: '/tasks/projects' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {}} disabled={false}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {projectTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
              {tab.value === 'all'
                ? currentProjects.length
                : tab.value === 'active'
                  ? currentProjects.filter(p => ['in_progress', 'planning'].includes(p.status))
                      .length
                  : tab.value === 'completed'
                    ? currentProjects.filter(p => p.status === 'completed').length
                    : currentProjects.filter(p => p.status === 'at_risk').length}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={() => {}} disabled={false}>
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Project Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold">{currentProjects.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    currentProjects.filter(p => ['in_progress', 'planning'].includes(p.status))
                      .length
                  }
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">At Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {currentProjects.filter(p => p.status === 'at_risk').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    currentProjects.reduce((acc, p) => acc + p.progress, 0) / currentProjects.length
                  )}
                  %
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProjects.map(project => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant={getStatusColor(project.status)}>
                      {project.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant={getPriorityColor(project.priority)}>{project.priority}</Badge>
                  </div>
                  <p className="text-gray-600 text-sm">{project.description}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => {}} disabled={false}>
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {}} disabled={false}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => {}} disabled={false}>
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {/* Timeline */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Start Date:</span>
                  <p className="font-medium">{formatDate(project.startDate)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Due Date:</span>
                  <p className="font-medium">{formatDate(project.dueDate)}</p>
                </div>
              </div>

              {/* Team Members */}
              <div>
                <span className="text-gray-500 text-sm">Team:</span>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex -space-x-2">
                    {project.teamMembers.slice(0, 4).map(member => (
                      <div
                        key={member.id}
                        className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                        title={member.name}
                      >
                        {member.avatar}
                      </div>
                    ))}
                    {project.teamMembers.length > 4 && (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white">
                        +{project.teamMembers.length - 4}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {project.teamMembers.length} member{project.teamMembers.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Tasks Summary */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-lg font-bold text-green-600">{project.tasks.completed}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-lg font-bold text-blue-600">{project.tasks.inProgress}</div>
                  <div className="text-xs text-gray-600">In Progress</div>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <div className="text-lg font-bold text-gray-600">{project.tasks.pending}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
                <div className="bg-red-50 p-2 rounded">
                  <div className="text-lg font-bold text-red-600">{project.tasks.overdue}</div>
                  <div className="text-xs text-gray-600">Overdue</div>
                </div>
              </div>

              {/* Budget */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Budget</span>
                  <span className="text-sm text-gray-600">
                    {((project.budget.spent / project.budget.allocated) * 100).toFixed(0)}% used
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Allocated:</span>
                    <span className="font-medium">{formatCurrency(project.budget.allocated)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Spent:</span>
                    <span className="font-medium">{formatCurrency(project.budget.spent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Remaining:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(project.budget.remaining)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags and Health */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full ${getHealthColor(project.health).replace('text-', 'bg-')}`}
                  ></div>
                  <span className={`text-xs font-medium ${getHealthColor(project.health)}`}>
                    {project.health}
                  </span>
                </div>
              </div>

              {/* Last Activity */}
              <div className="text-xs text-gray-500 border-t pt-2">
                Last activity: {project.lastActivity}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'Create your first project to get started'}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskProjects;
