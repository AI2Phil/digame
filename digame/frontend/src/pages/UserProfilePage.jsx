import React, { useState, useEffect } from 'react';
import { 
  User, Settings, Target, Trophy, Calendar, 
  Edit, Save, X, Camera, Mail, Phone, MapPin,
  Briefcase, GraduationCap, Star, Award,
  Key, Bell, Shield, Palette, Globe
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/Dialog'; // Added DialogFooter, DialogClose
import { Textarea } from '../components/ui/Textarea'; // Added Textarea
import { Toast } from '../components/ui/Toast';
import apiService from '../services/apiService';
import GoalsManagementSection from '../components/profile/GoalsManagementSection';
import AchievementsSection from '../components/profile/AchievementsSection';
import SettingsManagementSection from '../components/profile/SettingsManagementSection';
import SocialProfileSection from '../components/profile/SocialProfileSection';
// Import the new editable list components
import ProjectsListEditable from '../components/profile/ProjectsListEditable';
import ExperienceListEditable from '../components/profile/ExperienceListEditable';
import EducationListEditable from '../components/profile/EducationListEditable';

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  // Initialize editData with the full structure expected
  const [editData, setEditData] = useState({
    username: '',
    email: '',
    bio: '',
    first_name: '',
    last_name: '',
    phone: '',
    location: '',
    timezone: '',
    job_title: '',
    company: '',
    industry: '',
    experience_level: '',
    detailedBio: '', // New field
    contactInfo: { linkedin: '', website: '', professionalEmail: '' }, // New field
    skills_input: '', // Temporary for comma-separated skills
    skills: [], // New field
    projects: [], // New field
    experience: [], // New field for experience_entries
    education: [], // New field for education_entries
  });
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const [userData, goalsData, achievementsData, apiKeysData] = await Promise.all([
        apiService.getCurrentUser(),
        apiService.getUserGoals(),
        apiService.getUserAchievements(),
        apiService.getApiKeys()
      ]);

      setUser(userData);
      // Populate editData with user data, handling new fields
      setEditData({
        username: userData.username || '',
        email: userData.email || '',
        bio: userData.bio || '', // Assuming existing 'bio' is short bio in header
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        phone: userData.phone || '', // Assuming these existed
        location: userData.location || '', // Assuming these existed
        timezone: userData.timezone || '', // Assuming these existed
        job_title: userData.job_title || '', // Assuming these existed
        company: userData.company || '', // Assuming these existed
        industry: userData.industry || '', // Assuming these existed
        experience_level: userData.experience_level || '', // Assuming these existed

        detailedBio: userData.detailed_bio || '',
        contactInfo: userData.contact_info || { linkedin: '', website: '', professionalEmail: '' },
        skills: userData.skills || [],
        skills_input: (userData.skills || []).join(', '), // For Textarea input
        projects: userData.projects || [],
        experience: userData.experience_entries || [], // Map from backend name
        education: userData.education_entries || [], // Map from backend name
      });
      setGoals(goalsData || []);
      setAchievements(achievementsData || []);
      setApiKeys(apiKeysData || []);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      Toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Prepare payload, parsing skills from skills_input
      const payload = {
        ...editData,
        skills: editData.skills_input.split(',').map(s => s.trim()).filter(s => s),
      };
      delete payload.skills_input; // Remove temporary field

      // Ensure contactInfo is an object, not null, if it was initially null and not edited
      if (!payload.contactInfo) {
        payload.contactInfo = { linkedin: '', website: '', professionalEmail: '' };
      }

      // Map experience back to experience_entries for the backend if needed,
      // or ensure UserUpdate schema on backend expects 'experience'.
      // Based on previous subtask, UserUpdate expects 'experience', 'projects', 'education'.
      // So, payload.experience, payload.projects, payload.education are correctly named.

      const updatedUser = await apiService.updateUserProfile(payload);
      setUser(updatedUser); // This updatedUser should have the server-side representation
      // Re-initialize editData based on the updatedUser to reflect server state (e.g. parsed JSON strings)
      setEditData({
        username: updatedUser.username || '',
        email: updatedUser.email || '',
        bio: updatedUser.bio || '',
        first_name: updatedUser.first_name || '',
        last_name: updatedUser.last_name || '',
        phone: updatedUser.phone || '',
        location: updatedUser.location || '',
        timezone: updatedUser.timezone || '',
        job_title: updatedUser.job_title || '',
        company: updatedUser.company || '',
        industry: updatedUser.industry || '',
        experience_level: updatedUser.experience_level || '',
        detailedBio: updatedUser.detailed_bio || '',
        contactInfo: updatedUser.contact_info || { linkedin: '', website: '', professionalEmail: '' },
        skills: updatedUser.skills || [],
        skills_input: (updatedUser.skills || []).join(', '),
        projects: updatedUser.projects || [],
        experience: updatedUser.experience_entries || [],
        education: updatedUser.education_entries || [],
      });
      setIsEditing(false);
      Toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Toast.error(`Failed to update profile: ${error.message}`);
    }
  };

  const handleCancelEdit = () => {
    // Reset editData from the current user state
    setEditData({
      username: user.username || '',
      email: user.email || '',
      bio: user.bio || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      location: user.location || '',
      timezone: user.timezone || '',
      job_title: user.job_title || '',
      company: user.company || '',
      industry: user.industry || '',
      experience_level: user.experience_level || '',
      detailedBio: user.detailed_bio || '',
      contactInfo: user.contact_info || { linkedin: '', website: '', professionalEmail: '' },
      skills: user.skills || [],
      skills_input: (user.skills || []).join(', '),
      projects: user.projects || [],
      experience: user.experience_entries || [],
      education: user.education_entries || [],
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await apiService.uploadAvatar(formData);
        setUser({ ...user, avatar: response.avatar_url });
        Toast.success('Avatar updated successfully');
      } catch (error) {
        Toast.error('Failed to upload avatar');
      }
    }
  };

  if (loading) {
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
            <TabsTrigger value="goals">Goals & Progress</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PersonalInfoCard 
                user={user}
                isEditing={isEditing}
                editData={editData}
                setEditData={setEditData}
              />
              <ProfessionalInfoCard 
                user={user}
                isEditing={isEditing}
                editData={editData}
                setEditData={setEditData}
              />
            </div>
            {/* Projects Section */}
            <ProjectsListEditable
              items={editData.projects}
              setItems={(newProjects) => setEditData(prev => ({ ...prev, projects: newProjects }))}
              isEditing={isEditing}
            />
            {/* Experience Section */}
            <ExperienceListEditable
              items={editData.experience}
              setItems={(newExperience) => setEditData(prev => ({ ...prev, experience: newExperience }))}
              isEditing={isEditing}
            />
            {/* Education Section */}
            <EducationListEditable
              items={editData.education}
              setItems={(newEducation) => setEditData(prev => ({ ...prev, education: newEducation }))}
              isEditing={isEditing}
            />
            <ActivitySummaryCard user={user} />
            {/* Kudos Count is displayed in ActivitySummaryCard and ProfileHeader */}
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <GoalsManagementSection goals={goals} setGoals={setGoals} />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <AchievementsSection achievements={achievements} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <SettingsManagementSection apiKeys={apiKeys} setApiKeys={setApiKeys} />
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <SocialProfileSection user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Profile Header Component
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
                <Badge variant="outline">Kudos: {user.kudos_count || 0}</Badge>
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
          {/* New Fields for PersonalInfoCard */}
          <Textarea
            value={editData.detailedBio || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, detailedBio: e.target.value }))}
            placeholder="Detailed Bio"
            rows={4}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
            <Input
              value={editData.contactInfo?.linkedin || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, linkedin: e.target.value } }))}
              placeholder="LinkedIn Profile URL"
              className="mb-2"
            />
            <Input
              value={editData.contactInfo?.website || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, website: e.target.value } }))}
              placeholder="Website URL"
              className="mb-2"
            />
            <Input
              value={editData.contactInfo?.professionalEmail || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, professionalEmail: e.target.value } }))}
              placeholder="Professional Email"
              type="email"
            />
          </div>
        </>
      ) : (
        <>
          <InfoItem icon={User} label="Full Name" value={`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Not provided'} />
          <InfoItem icon={Phone} label="Phone" value={user.phone || 'Not provided'} />
          <InfoItem icon={MapPin} label="Location" value={user.location || 'Not provided'} />
          <InfoItem icon={Globe} label="Timezone" value={user.timezone || 'Not provided'} />
          <InfoItem icon={Calendar} label="Member Since" value={new Date(user.created_at).toLocaleDateString()} />
          <InfoItem icon={User} label="Detailed Bio" value={user.detailed_bio || 'Not provided'} />
          <h4 className="text-sm font-medium text-gray-700 mt-3 mb-1">Contact Info:</h4>
          <InfoItem icon={Mail} label="LinkedIn" value={user.contact_info?.linkedin || 'Not provided'} />
          <InfoItem icon={Globe} label="Website" value={user.contact_info?.website || 'Not provided'} />
          <InfoItem icon={Mail} label="Professional Email" value={user.contact_info?.professionalEmail || 'Not provided'} />
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
          {/* New Field for Skills */}
          <div>
            <label htmlFor="skills_input" className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
            <Textarea
              id="skills_input"
              value={editData.skills_input || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, skills_input: e.target.value }))}
              placeholder="e.g., React, Node.js, Python"
              rows={3}
            />
          </div>
        </>
      ) : (
        <>
          <InfoItem icon={Briefcase} label="Job Title" value={user.job_title || 'Not provided'} />
          <InfoItem icon={Briefcase} label="Company" value={user.company || 'Not provided'} />
          <InfoItem icon={Briefcase} label="Industry" value={user.industry || 'Not provided'} />
          <InfoItem icon={GraduationCap} label="Experience" value={user.experience_level || 'Not provided'} />
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-3"><Star className="w-4 h-4 text-gray-500" /> Skills</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {(user.skills && user.skills.length > 0) ? user.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">{skill}</Badge>
              )) : <p className="font-medium">Not provided</p>}
            </div>
          </div>
        </>
      )}
    </CardContent>
  </Card>
);

// Activity Summary Card Component (Display Kudos here)
const ActivitySummaryCard = ({ user }) => (
  <Card>
    <CardHeader>
      <CardTitle>Activity Summary</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6"> {/* Adjusted grid for kudos */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {user.kudos_count || 0}
          </div>
          <p className="text-sm text-gray-600">Kudos Received</p>
        </div>
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
        {/* Removed streak days to make space for kudos, or adjust grid as needed */}
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

export default UserProfilePage;