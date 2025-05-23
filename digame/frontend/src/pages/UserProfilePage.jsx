import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Form } from '../components/ui/Form';
import Avatar from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Tabs } from '../components/ui/Tabs';
import { Progress } from '../components/ui/Progress';

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
    location: '',
    website: '',
    linkedin: '',
    github: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/auth/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          bio: userData.bio || '',
          location: userData.location || '',
          website: userData.website || '',
          linkedin: userData.linkedin || '',
          github: userData.github || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/auth/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditing(false);
        // Show success message
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    // Reset form data to original user data
    setFormData({
      username: user.username || '',
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      linkedin: user.linkedin || '',
      github: user.github || ''
    });
  };

  const getOnboardingProgress = () => {
    if (!user?.onboarding_data) return 0;
    
    try {
      const onboardingData = typeof user.onboarding_data === 'string' 
        ? JSON.parse(user.onboarding_data) 
        : user.onboarding_data;
      
      const steps = ['goals', 'workStyle', 'skills', 'privacy'];
      const completedSteps = steps.filter(step => onboardingData[step]).length;
      return (completedSteps / steps.length) * 100;
    } catch {
      return 0;
    }
  };

  const getSkillBadges = () => {
    if (!user?.onboarding_data) return [];
    
    try {
      const onboardingData = typeof user.onboarding_data === 'string' 
        ? JSON.parse(user.onboarding_data) 
        : user.onboarding_data;
      
      return onboardingData.skills || [];
    } catch {
      return [];
    }
  };

  const ProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-6">
            <Avatar
              src={user?.avatar}
              alt={user?.username}
              fallback={user?.username?.charAt(0)?.toUpperCase() || 'U'}
              size="lg"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user?.username
                  }
                </h2>
                <Badge variant={user?.is_active ? 'success' : 'secondary'}>
                  {user?.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-gray-600">@{user?.username}</p>
              <p className="text-gray-600">{user?.email}</p>
              {user?.bio && (
                <p className="mt-2 text-gray-700">{user.bio}</p>
              )}
            </div>
            <div className="text-right">
              <Button
                variant={editing ? 'secondary' : 'primary'}
                onClick={() => editing ? handleCancelEdit() : setEditing(true)}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            {editing ? 'Update your personal information' : 'Your personal information'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <Input
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={!editing}
                placeholder="Enter username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!editing}
                placeholder="Enter email"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <Input
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                disabled={!editing}
                placeholder="Enter first name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <Input
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                disabled={!editing}
                placeholder="Enter last name"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                disabled={!editing}
                placeholder="Tell us about yourself"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!editing}
                placeholder="Enter location"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <Input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                disabled={!editing}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
          
          {editing && (
            <div className="mt-6 flex space-x-3">
              <Button onClick={handleSaveProfile}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const OnboardingTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
          <CardDescription>
            Your setup progress and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">{Math.round(getOnboardingProgress())}%</span>
              </div>
              <Progress value={getOnboardingProgress()} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Completion Status</h4>
                <Badge variant={user?.onboarding_completed ? 'success' : 'warning'}>
                  {user?.onboarding_completed ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Member Since</h4>
                <p className="text-sm text-gray-600">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills & Interests */}
      <Card>
        <CardHeader>
          <CardTitle>Skills & Interests</CardTitle>
          <CardDescription>
            Skills and areas of focus from your onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {getSkillBadges().length > 0 ? (
              getSkillBadges().map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-gray-500">No skills selected yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SecurityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Security</CardTitle>
          <CardDescription>
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Password</h4>
                <p className="text-sm text-gray-600">Last updated: Never</p>
              </div>
              <Button variant="outline">
                Change Password
              </Button>
            </div>
            
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <Button variant="outline">
                Enable 2FA
              </Button>
            </div>
            
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Active Sessions</h4>
                <p className="text-sm text-gray-600">Manage your active sessions</p>
              </div>
              <Button variant="outline">
                View Sessions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profile', content: <ProfileTab /> },
    { id: 'onboarding', label: 'Onboarding', content: <OnboardingTab /> },
    { id: 'security', label: 'Security', content: <SecurityTab /> }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your account settings and preferences
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant={user?.onboarding_completed ? 'success' : 'warning'}>
                  {user?.onboarding_completed ? 'Setup Complete' : 'Setup Pending'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
};

export default UserProfilePage;