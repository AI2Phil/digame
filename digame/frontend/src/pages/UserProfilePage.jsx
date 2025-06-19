import React, { useState, useEffect } from 'react';
import { 
  User, Settings, Target, Trophy, Calendar, 
  Edit, Save, X, Camera, Mail, Phone, MapPin,
  Briefcase, GraduationCap, Star, Award, PlusCircle, Trash2, // Added PlusCircle, Trash2
  Key, Bell, Shield, Palette, Globe
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card'; // Added CardFooter
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea'; // Added Textarea
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/Avatar'; // Added AvatarFallback, AvatarImage
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog'; // Added DialogFooter
// Assuming Toast is available or use alert as fallback
// import { useToast } from '../components/ui/use-toast';
import apiService from '../services/apiService';
import GoalsManagementSection from '../components/profile/GoalsManagementSection';
import AchievementsSection from '../components/profile/AchievementsSection';
import SettingsManagementSection from '../components/profile/SettingsManagementSection';
import SocialProfileSection from '../components/profile/SocialProfileSection';

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editData, setEditData] = useState({}); // For main profile editing

  // States for sub-sections
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [userProjects, setUserProjects] = useState([]); // Added for projects

  // Loading/error states for projects
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState(null);

  // Dialog and form states for Projects
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // null for new, project object for edit
  const [projectFormMode, setProjectFormMode] = useState('add'); // 'add' or 'edit'

  // const { toast } = useToast(); // Example
  const showToast = (title, description, variant = "default") => {
    alert(`${title}: ${description} (Variant: ${variant})`); // Placeholder for actual toast
  };

  const loadUserProfileAndSubSections = async () => {
    setLoading(true);
    try {
      const promises = [
        apiService.getCurrentUser(), // Fetches main user data
        apiService.getUserGoals(),
        apiService.getUserAchievements(),
        apiService.getApiKeys(),
        apiService.getUserProjects() // Fetch user projects
      ];

      const [userData, goalsData, achievementsData, apiKeysData, projectsData] = await Promise.all(promises);

      setUser(userData);
      setEditData(userData); // Initialize main profile edit form
      setGoals(goalsData || []);
      setAchievements(achievementsData || []);
      setApiKeys(apiKeysData || []);
      setUserProjects(projectsData || []); // Set projects state

    } catch (error) {
      console.error('Failed to load user profile and sub-sections:', error);
      showToast('Error', 'Failed to load profile data.', 'destructive');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfileAndSubSections();
  }, []);


  const handleSaveProfile = async () => { // For main profile
    try {
      const updatedUser = await apiService.updateUserProfile(editData); // Uses /api/profile
      setUser(updatedUser);
      setIsEditing(false);
      showToast('Success', 'Profile updated successfully.', 'success');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast('Error', 'Failed to update profile.', 'destructive');
    }
  };

  const handleCancelEdit = () => { // For main profile
    setEditData(user); // Reset editData to current user state
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event) => { // For main profile avatar
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('avatar', file); // Key should match backend expectation
        const response = await apiService.uploadAvatar(formData); // Uses /api/profile/avatar
        setUser(prevUser => ({ ...prevUser, avatar: response.avatar_url }));
        showToast('Success', 'Avatar updated successfully.', 'success');
      } catch (error) {
        showToast('Error', 'Failed to upload avatar.', 'destructive');
      }
    }
  };

  // --- Project CRUD Handlers ---
  const openProjectDialog = (mode = 'add', project = null) => {
    setProjectFormMode(mode);
    setEditingProject(project); // If 'add', project is null; if 'edit', project is the item
    setIsProjectDialogOpen(true);
  };

  const handleProjectFormSubmit = async (formData) => {
    try {
      if (projectFormMode === 'edit' && editingProject) {
        const updatedProject = await apiService.updateUserProject(editingProject.id, formData);
        setUserProjects(userProjects.map(p => p.id === updatedProject.id ? updatedProject : p));
        showToast('Success', 'Project updated successfully.', 'success');
      } else {
        const newProject = await apiService.addUserProject(formData);
        setUserProjects([...userProjects, newProject]);
        showToast('Success', 'Project added successfully.', 'success');
      }
      setIsProjectDialogOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Failed to save project:', error);
      showToast('Error', `Failed to save project: ${error.message}`, 'destructive');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await apiService.deleteUserProject(projectId);
        setUserProjects(userProjects.filter(p => p.id !== projectId));
        showToast('Success', 'Project deleted successfully.', 'success');
      } catch (error) {
        console.error('Failed to delete project:', error);
        showToast('Error', `Failed to delete project: ${error.message}`, 'destructive');
      }
    }
  };
  // --- End Project CRUD Handlers ---


  if (loading && !user) { // Show loading only if user data isn't available yet
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <ProfileHeader 
          user={user}
          isEditing={isEditing}
          editData={editData}
          setEditData={setEditData}
          onEdit={() => setIsEditing(true)}
          onSave={handleSaveProfile}
          onCancel={handleCancelEdit}
          onAvatarUpload={handleAvatarUpload}
        />

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger> {/* Renamed/Added for Projects etc. */}
            <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PersonalInfoCard 
                user={user} // PersonalInfoCard unchanged for this task
                isEditing={isEditing} // Main profile editing
                editData={editData}   // Main profile editData
                setEditData={setEditData} // Main profile setEditData
              />
              <ProfessionalInfoCard 
                user={user} // ProfessionalInfoCard unchanged for this task
                isEditing={isEditing} // Main profile editing
                editData={editData}   // Main profile editData
                setEditData={setEditData} // Main profile setEditData
              />
            </div>
            <ActivitySummaryCard user={user} /> {/* Unchanged */}
          </TabsContent>

          {/* Portfolio Tab (New for Projects, Experience, Education) */}
          <TabsContent value="portfolio" className="space-y-6">
            <ProjectsSection
              projects={userProjects}
              loading={loadingProjects}
              error={projectsError}
              onAdd={() => openProjectDialog('add', null)}
              onEdit={(project) => openProjectDialog('edit', project)}
              onDelete={handleDeleteProject}
            />
            {/* Placeholder for Experience and Education sections */}
            {/* <ExperienceSection ... /> */}
            {/* <EducationSection ... /> */}
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <GoalsManagementSection goals={goals} setGoals={setGoals} /> {/* Unchanged */}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <AchievementsSection achievements={achievements} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsManagementSection apiKeys={apiKeys} setApiKeys={setApiKeys} /> {/* Unchanged */}
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <SocialProfileSection user={user} /> {/* Unchanged */}
          </TabsContent>
        </Tabs>

        {/* Project Form Dialog */}
        <ProjectFormDialog
          isOpen={isProjectDialogOpen}
          onClose={() => {
            setIsProjectDialogOpen(false);
            setEditingProject(null);
          }}
          onSubmit={handleProjectFormSubmit}
          initialData={editingProject}
          mode={projectFormMode}
        />

      </div>
    </div>
  );
};

// Profile Header Component (Unchanged for this task's core logic)
const ProfileHeader = ({ 
  user, 
  isEditing, 
  editData, 
  setEditData, 
  onEdit, 
  onSave, 
  onCancel, 
  onAvatarUpload 
}) => (
  <Card>
    <CardContent className="p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Avatar Section */}
        <div className="relative">
          <Avatar
            src={user.avatar}
            alt={user.username}
            fallback={user.username?.charAt(0).toUpperCase()}
            size="xl"
            className="w-24 h-24"
          />
          {isEditing && (
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={onAvatarUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  value={editData.username || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Username"
                />
                <Input
                  value={editData.email || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email"
                  type="email"
                />
              </div>
              <Input
                value={editData.bio || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Bio"
              />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
              <p className="text-gray-600 mt-1">{user.email}</p>
              {user.bio && <p className="text-gray-700 mt-2">{user.bio}</p>}
              <div className="flex items-center gap-2 mt-4">
                <Badge variant="default">{user.role || 'User'}</Badge>
                <Badge variant={user.is_active ? 'success' : 'destructive'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
                {user.verified && <Badge variant="success">Verified</Badge>}
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button onClick={onSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Personal Info Card Component
const PersonalInfoCard = ({ user, isEditing, editData, setEditData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <User className="w-5 h-5" />
        Personal Information
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {isEditing ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Input
              value={editData.first_name || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, first_name: e.target.value }))}
              placeholder="First Name"
            />
            <Input
              value={editData.last_name || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, last_name: e.target.value }))}
              placeholder="Last Name"
            />
          </div>
          <Input
            value={editData.phone || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="Phone Number"
          />
          <Input
            value={editData.location || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Location"
          />
          <Input
            value={editData.timezone || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, timezone: e.target.value }))}
            placeholder="Timezone"
          />
        </>
      ) : (
        <>
          <InfoItem icon={User} label="Full Name" value={`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Not provided'} />
          <InfoItem icon={Phone} label="Phone" value={user.phone || 'Not provided'} />
          <InfoItem icon={MapPin} label="Location" value={user.location || 'Not provided'} />
          <InfoItem icon={Globe} label="Timezone" value={user.timezone || 'Not provided'} />
          <InfoItem icon={Calendar} label="Member Since" value={new Date(user.created_at).toLocaleDateString()} />
        </>
      )}
    </CardContent>
  </Card>
);

// Professional Info Card Component
const ProfessionalInfoCard = ({ user, isEditing, editData, setEditData }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Briefcase className="w-5 h-5" />
        Professional Information
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {isEditing ? (
        <>
          <Input
            value={editData.job_title || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, job_title: e.target.value }))}
            placeholder="Job Title"
          />
          <Input
            value={editData.company || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, company: e.target.value }))}
            placeholder="Company"
          />
          <Input
            value={editData.industry || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, industry: e.target.value }))}
            placeholder="Industry"
          />
          <Input
            value={editData.experience_level || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, experience_level: e.target.value }))}
            placeholder="Experience Level"
          />
        </>
      ) : (
        <>
          <InfoItem icon={Briefcase} label="Job Title" value={user.job_title || 'Not provided'} />
          <InfoItem icon={Briefcase} label="Company" value={user.company || 'Not provided'} />
          <InfoItem icon={Briefcase} label="Industry" value={user.industry || 'Not provided'} />
          <InfoItem icon={GraduationCap} label="Experience" value={user.experience_level || 'Not provided'} />
          <InfoItem icon={Star} label="Skills" value={user.skills?.join(', ') || 'Not provided'} />
        </>
      )}
    </CardContent>
  </Card>
);

// Activity Summary Card Component
const ActivitySummaryCard = ({ user }) => (
  <Card>
    <CardHeader>
      <CardTitle>Activity Summary</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {user.stats?.total_sessions || 0}
          </div>
          <p className="text-sm text-gray-600">Total Sessions</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {user.stats?.goals_completed || 0}
          </div>
          <p className="text-sm text-gray-600">Goals Completed</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {user.stats?.achievements_earned || 0}
          </div>
          <p className="text-sm text-gray-600">Achievements</p>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {user.stats?.streak_days || 0}
          </div>
          <p className="text-sm text-gray-600">Day Streak</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Info Item Component
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <Icon className="w-4 h-4 text-gray-500" />
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  </div>
);

// --- Projects Section & Form Dialog (New Components for this task) ---
const ProjectsSection = ({ projects, loading, error, onAdd, onEdit, onDelete }) => {
  if (loading) return <p>Loading projects...</p>;
  if (error) return <p className="text-red-500">Error loading projects: {error}</p>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Showcase your work and contributions.</CardDescription>
        </div>
        <Button onClick={onAdd} size="sm"><PlusCircle className="w-4 h-4 mr-2" />Add Project</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects && projects.length > 0 ? (
          projects.map(project => (
            <Card key={project.id} className="p-4 flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{project.name}</h4>
                <p className="text-sm text-gray-600">{project.description}</p>
                {project.technologies && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {project.technologies.map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => onEdit(project)}><Edit className="w-3 h-3 mr-1" /> Edit</Button> {/* Changed EditIcon to Edit */}
                <Button variant="destructive" size="sm" onClick={() => onDelete(project.id)}><Trash2 className="w-3 h-3 mr-1" /> Delete</Button>
              </div>
            </Card>
          ))
        ) : (
          <p>No projects added yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

const ProjectFormDialog = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState(''); // Comma-separated string

  useEffect(() => {
    if (isOpen) { // Only update form when dialog opens or initialData changes while open
      if (initialData) {
        setName(initialData.name || '');
        setDescription(initialData.description || '');
        setTechnologies(initialData.technologies ? initialData.technologies.join(', ') : '');
      } else {
        // Reset form for 'add' mode
        setName('');
        setDescription('');
        setTechnologies('');
      }
    }
  }, [initialData, isOpen, mode]); // Add mode to dependencies if reset logic depends on it

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectData = {
      name,
      description,
      technologies: technologies.split(',').map(tech => tech.trim()).filter(tech => tech),
    };
    onSubmit(projectData);
  };

  // if (!isOpen) return null; // Dialog component handles its own visibility based on 'open' prop

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Project' : 'Add New Project'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit' ? "Update the details of your project." : "Add a new project to your profile."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">Project Name</label>
            <Input id="projectName" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700">Description</label>
            <Textarea id="projectDescription" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label htmlFor="projectTechnologies" className="block text-sm font-medium text-gray-700">Technologies (comma-separated)</label>
            <Input id="projectTechnologies" value={technologies} onChange={(e) => setTechnologies(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{mode === 'edit' ? 'Save Changes' : 'Add Project'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfilePage;