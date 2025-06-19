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
import { Textarea } from '../components/ui/Textarea'; // Assuming Textarea component exists
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Progress } from '../components/ui/Progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog';
import { Toast } from '../components/ui/Toast';
import apiService from '../services/apiService';
import GoalsManagementSection from '../components/profile/GoalsManagementSection';
import AchievementsSection from '../components/profile/AchievementsSection';
import SettingsManagementSection from '../components/profile/SettingsManagementSection';
import SocialProfileSection from '../components/profile/SocialProfileSection';
import ProjectsManagementSection from '../components/profile/ProjectsManagementSection';
import ExperienceManagementSection from '../components/profile/ExperienceManagementSection';
import EducationManagementSection from '../components/profile/EducationManagementSection';

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editData, setEditData] = useState({});
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

      const initialEditData = {
        ...userData,
        detailedBio: userData.detailedBio || '',
        contactInfo: userData.contactInfo || { linkedin: '', website: '', professionalEmail: '' },
        projects: userData.projects || [],
        experience: userData.experience || [],
        education: userData.education || [],
      };
      setUser(initialEditData); // User state should also reflect the full structure
      setEditData(initialEditData);
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
      const updatedUser = await apiService.updateUserProfile(editData);
      setUser(updatedUser);
      setIsEditing(false);
      Toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      Toast.error('Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    // User state should already have the full structure from loadUserProfile
    setEditData(user);
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
            {/* New Repeatable Sections */}
            <ProjectsManagementSection
              projects={editData.projects}
              setEditData={setEditData}
              isEditing={isEditing}
              userData={user}
            />
            <ExperienceManagementSection
              experience={editData.experience}
              setEditData={setEditData}
              isEditing={isEditing}
              userData={user}
            />
            <EducationManagementSection
              education={editData.education}
              setEditData={setEditData}
              isEditing={isEditing}
              userData={user}
            />
            <ActivitySummaryCard user={user} />
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
          <Textarea
            value={editData.detailedBio || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, detailedBio: e.target.value }))}
            placeholder="Detailed Bio"
            rows={4}
          />
          <h3 className="text-sm font-medium text-gray-700 pt-2">Contact Information</h3>
          <Input
            value={editData.contactInfo?.linkedin || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, linkedin: e.target.value } }))}
            placeholder="LinkedIn Profile URL"
          />
          <Input
            value={editData.contactInfo?.website || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, website: e.target.value } }))}
            placeholder="Personal Website/Portfolio"
          />
          <Input
            value={editData.contactInfo?.professionalEmail || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, contactInfo: { ...prev.contactInfo, professionalEmail: e.target.value } }))}
            placeholder="Professional Email"
            type="email"
          />
        </>
      ) : (
        <>
          <InfoItem icon={User} label="Full Name" value={`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Not provided'} />
          <InfoItem icon={Phone} label="Phone" value={user.phone || 'Not provided'} />
          <InfoItem icon={Mail} label="Professional Email" value={user.contactInfo?.professionalEmail || 'Not provided'} />
          <InfoItem icon={MapPin} label="Location" value={user.location || 'Not provided'} />
          <InfoItem icon={Globe} label="Timezone" value={user.timezone || 'Not provided'} />
          <InfoItem icon={Calendar} label="Member Since" value={new Date(user.created_at).toLocaleDateString()} />
          {user.detailedBio && <InfoSection title="Detailed Bio" content={user.detailedBio} />}
          <h3 className="text-sm font-medium text-gray-700 pt-4">Contact Information</h3>
          <InfoItem icon={Globe} label="Website" value={user.contactInfo?.website || 'Not provided'} />
          <InfoItem icon={User} label="LinkedIn" value={user.contactInfo?.linkedin || 'Not provided'} />

        </>
      )}
    </CardContent>
  </Card>
);

// Helper for sections like Detailed Bio
const InfoSection = ({ title, content }) => (
  <div>
    <h4 className="text-sm font-medium text-gray-600">{title}</h4>
    <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
  </div>
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

export default UserProfilePage;