import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  User,
  Briefcase,
  Settings as SettingsIcon,
  Shield,
  CreditCard,
  Save,
  Upload,
  Plus,
  X,
} from 'lucide-react';

const ProfilePage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState({
    personal: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      location: '',
      timezone: '',
      language: 'en',
      avatar: null,
      bio: '',
      website: '',
      linkedIn: '',
      twitter: '',
      github: '',
    },
    professional: {
      jobTitle: '',
      company: '',
      department: '',
      manager: '',
      startDate: '',
      employeeId: '',
      workLocation: '',
      skills: [],
      certifications: [],
      experience: [],
      education: [],
    },
    preferences: {
      theme: 'light',
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: true,
      marketingEmails: false,
      dataSharing: false,
      twoFactorAuth: false,
      sessionTimeout: 30,
      defaultDashboard: 'overview',
    },
    privacy: {
      profileVisibility: 'team',
      showEmail: false,
      showPhone: false,
      showLocation: true,
      allowDirectMessages: true,
      allowMentions: true,
      searchable: true,
    },
    subscription: {
      tier: 'Individual Pro',
      status: 'active',
      billingCycle: 'monthly',
      nextBilling: '2024-02-15',
      usage: {
        apiCalls: 1250,
        storage: 2.3,
        teamMembers: 1,
      },
      limits: {
        apiCalls: 10000,
        storage: 10,
        teamMembers: 1,
      },
    },
  });

  const [newSkill, setNewSkill] = useState('');
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    date: '',
    expiryDate: '',
    credentialId: '',
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      const data = await response.json();
      setProfileData(prev => ({
        ...prev,
        ...data.profile,
      }));
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (section, data) => {
    setSaving(true);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data }),
      });

      if (response.ok) {
        setProfileData(prev => ({
          ...prev,
          [section]: { ...prev[section], ...data },
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async event => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await fetch('/api/auth/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(prev => ({
          ...prev,
          personal: { ...prev.personal, avatar: data.avatarUrl },
        }));
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      const updatedSkills = [
        ...profileData.professional.skills,
        {
          id: Date.now(),
          name: newSkill.trim(),
          level: 'intermediate',
          verified: false,
        },
      ];
      updateProfile('professional', { skills: updatedSkills });
      setNewSkill('');
    }
  };

  const removeSkill = skillId => {
    const updatedSkills = profileData.professional.skills.filter(skill => skill.id !== skillId);
    updateProfile('professional', { skills: updatedSkills });
  };

  const addCertification = () => {
    if (newCertification.name.trim()) {
      const updatedCertifications = [
        ...profileData.professional.certifications,
        {
          id: Date.now(),
          ...newCertification,
        },
      ];
      updateProfile('professional', { certifications: updatedCertifications });
      setNewCertification({
        name: '',
        issuer: '',
        date: '',
        expiryDate: '',
        credentialId: '',
      });
    }
  };

  const getCompletionPercentage = () => {
    const fields = [
      profileData.personal.firstName,
      profileData.personal.lastName,
      profileData.personal.email,
      profileData.personal.phone,
      profileData.personal.location,
      profileData.personal.bio,
      profileData.professional.jobTitle,
      profileData.professional.company,
      profileData.professional.skills.length > 0,
    ];

    const completed = fields.filter(field => field && field !== '').length;
    return Math.round((completed / fields.length) * 100);
  };

  const renderPersonalTab = () => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profileData.personal.avatar ? (
              <img
                src={profileData.personal.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-2xl text-gray-600">
                  {profileData.personal.firstName?.[0]}
                  {profileData.personal.lastName?.[0]}
                </span>
              </div>
            )}
          </div>
          <div>
            <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
            <p className="text-sm text-gray-500 mt-2">JPG, PNG up to 5MB</p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={profileData.personal.firstName}
              onChange={e =>
                setProfileData(prev => ({
                  ...prev,
                  personal: { ...prev.personal, firstName: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={profileData.personal.lastName}
              onChange={e =>
                setProfileData(prev => ({
                  ...prev,
                  personal: { ...prev.personal, lastName: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={profileData.personal.email}
              onChange={e =>
                setProfileData(prev => ({
                  ...prev,
                  personal: { ...prev.personal, email: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={profileData.personal.phone}
              onChange={e =>
                setProfileData(prev => ({
                  ...prev,
                  personal: { ...prev.personal, phone: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={profileData.personal.location}
              onChange={e =>
                setProfileData(prev => ({
                  ...prev,
                  personal: { ...prev.personal, location: e.target.value },
                }))
              }
              placeholder="City, Country"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
            <select
              value={profileData.personal.timezone}
              onChange={e =>
                setProfileData(prev => ({
                  ...prev,
                  personal: { ...prev.personal, timezone: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select timezone</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={profileData.personal.bio}
            onChange={e =>
              setProfileData(prev => ({
                ...prev,
                personal: { ...prev.personal, bio: e.target.value },
              }))
            }
            rows={3}
            placeholder="Tell us about yourself..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => updateProfile('personal', profileData.personal)}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );

  const renderProfessionalTab = () => (
    <div className="space-y-6">
      {/* Work Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Work Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input
              type="text"
              value={profileData.professional.jobTitle}
              onChange={e =>
                setProfileData(prev => ({
                  ...prev,
                  professional: { ...prev.professional, jobTitle: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              value={profileData.professional.company}
              onChange={e =>
                setProfileData(prev => ({
                  ...prev,
                  professional: { ...prev.professional, company: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {profileData.professional.skills.map(skill => (
            <span
              key={skill.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {skill.name}
              <button
                onClick={() => removeSkill(skill.id)}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newSkill}
            onChange={e => setNewSkill(e.target.value)}
            placeholder="Add a skill"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onKeyPress={e => e.key === 'Enter' && addSkill()}
          />
          <button
            onClick={addSkill}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => updateProfile('professional', profileData.professional)}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>User Profile - Digame</title>
        <meta
          name="description"
          content="Manage your personal information, professional details, and account settings"
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center space-x-3">
                <User className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
                  <p className="text-gray-600">
                    Manage your personal information, professional details, and account settings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Completion */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Profile Completion</h2>
              <span className="text-2xl font-bold text-blue-600">{getCompletionPercentage()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage()}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Complete your profile to unlock all features and improve your experience.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'personal', label: 'Personal Info', icon: User },
                { id: 'professional', label: 'Professional', icon: Briefcase },
                { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
                { id: 'privacy', label: 'Privacy', icon: Shield },
                { id: 'subscription', label: 'Subscription', icon: CreditCard },
              ].map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'personal' && renderPersonalTab()}
            {activeTab === 'professional' && renderProfessionalTab()}

            {activeTab === 'preferences' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Theme</label>
                    <select
                      value={profileData.preferences.theme}
                      onChange={e =>
                        setProfileData(prev => ({
                          ...prev,
                          preferences: { ...prev.preferences, theme: e.target.value },
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <input
                      type="checkbox"
                      checked={profileData.preferences.emailNotifications}
                      onChange={e =>
                        setProfileData(prev => ({
                          ...prev,
                          preferences: {
                            ...prev.preferences,
                            emailNotifications: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => updateProfile('preferences', profileData.preferences)}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Profile Visibility</label>
                    <select
                      value={profileData.privacy.profileVisibility}
                      onChange={e =>
                        setProfileData(prev => ({
                          ...prev,
                          privacy: { ...prev.privacy, profileVisibility: e.target.value },
                        }))
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="public">Public</option>
                      <option value="team">Team Only</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => updateProfile('privacy', profileData.privacy)}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 inline-flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Privacy Settings'}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Current Subscription</h3>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {profileData.subscription.tier}
                    </h4>
                    <p className="text-gray-600">
                      {profileData.subscription.billingCycle} billing • Next payment:{' '}
                      {profileData.subscription.nextBilling}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      profileData.subscription.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {profileData.subscription.status}
                  </span>
                </div>

                <div className="mt-6 flex space-x-4">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Upgrade Plan
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    View Billing History
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
