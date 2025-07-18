import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';

const OnboardingWizard = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    firstName: '',
    lastName: '',
    jobTitle: '',
    company: '',
    industry: '',
    teamSize: '',
    
    // Step 2: Goals & Use Cases
    primaryGoals: [],
    useCases: [],
    currentTools: [],
    challenges: [],
    
    // Step 3: Team Setup
    teamMembers: [],
    workspaceSettings: {
      name: '',
      description: '',
      visibility: 'private',
      notifications: true
    },
    
    // Step 4: Integrations
    selectedIntegrations: [],
    customIntegrations: [],
    
    // Step 5: Preferences
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      emailNotifications: true,
      pushNotifications: true,
      weeklyReports: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const totalSteps = 5;

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Consulting', 'Marketing', 'Real Estate', 'Other'
  ];

  const teamSizes = [
    '1-5', '6-10', '11-25', '26-50', '51-100', '101-500', '500+'
  ];

  const goalOptions = [
    'Improve team collaboration',
    'Streamline project management',
    'Enhance productivity',
    'Better reporting and analytics',
    'Automate workflows',
    'Improve customer experience',
    'Scale operations',
    'Reduce costs'
  ];

  const useCaseOptions = [
    'Project tracking',
    'Task management',
    'Team communication',
    'Resource planning',
    'Time tracking',
    'Client management',
    'Reporting and analytics',
    'Process automation'
  ];

  const currentToolOptions = [
    'Slack', 'Microsoft Teams', 'Asana', 'Trello', 'Jira', 'Monday.com',
    'Notion', 'Google Workspace', 'Microsoft 365', 'Salesforce', 'HubSpot', 'Other'
  ];

  const challengeOptions = [
    'Poor team communication',
    'Missed deadlines',
    'Lack of visibility',
    'Manual processes',
    'Data silos',
    'Inefficient workflows',
    'Limited reporting',
    'Scaling difficulties'
  ];

  const integrationOptions = [
    {
      name: 'Slack',
      description: 'Team communication and notifications',
      icon: '💬',
      category: 'Communication'
    },
    {
      name: 'Google Workspace',
      description: 'Email, calendar, and document integration',
      icon: '📧',
      category: 'Productivity'
    },
    {
      name: 'Microsoft 365',
      description: 'Office suite and collaboration tools',
      icon: '📊',
      category: 'Productivity'
    },
    {
      name: 'Salesforce',
      description: 'CRM and customer data synchronization',
      icon: '🏢',
      category: 'CRM'
    },
    {
      name: 'Jira',
      description: 'Issue tracking and project management',
      icon: '🎯',
      category: 'Development'
    },
    {
      name: 'GitHub',
      description: 'Code repository and development workflow',
      icon: '💻',
      category: 'Development'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleArrayToggle = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleTeamMemberAdd = () => {
    setFormData(prev => ({
      ...prev,
      teamMembers: [
        ...prev.teamMembers,
        { email: '', role: 'member', name: '' }
      ]
    }));
  };

  const handleTeamMemberUpdate = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const handleTeamMemberRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.company.trim()) newErrors.company = 'Company is required';
        if (!formData.industry) newErrors.industry = 'Industry is required';
        if (!formData.teamSize) newErrors.teamSize = 'Team size is required';
        break;
      case 2:
        if (formData.primaryGoals.length === 0) newErrors.primaryGoals = 'Select at least one goal';
        if (formData.useCases.length === 0) newErrors.useCases = 'Select at least one use case';
        break;
      case 3:
        if (!formData.workspaceSettings.name.trim()) {
          newErrors.workspaceName = 'Workspace name is required';
        }
        break;
      case 4:
        // Integrations are optional
        break;
      case 5:
        // Preferences have defaults
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const response = await fetch('/api/onboarding/wizard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/onboarding-wizard?completed=true');
      } else {
        throw new Error('Failed to complete onboarding');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setErrors({ submit: 'Failed to complete onboarding. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tell us about yourself</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Product Manager, Developer, CEO"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.company ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your company name"
              />
              {errors.company && (
                <p className="text-red-600 text-sm mt-1">{errors.company}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.industry ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select industry</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
                {errors.industry && (
                  <p className="text-red-600 text-sm mt-1">{errors.industry}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Team Size *
                </label>
                <select
                  value={formData.teamSize}
                  onChange={(e) => handleInputChange('teamSize', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.teamSize ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select team size</option>
                  {teamSizes.map(size => (
                    <option key={size} value={size}>{size} people</option>
                  ))}
                </select>
                {errors.teamSize && (
                  <p className="text-red-600 text-sm mt-1">{errors.teamSize}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">What are your goals?</h3>
              <p className="text-gray-600 mb-4">Select your primary goals (choose multiple)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {goalOptions.map(goal => (
                  <label key={goal} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.primaryGoals.includes(goal)}
                      onChange={() => handleArrayToggle('primaryGoals', goal)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{goal}</span>
                  </label>
                ))}
              </div>
              {errors.primaryGoals && (
                <p className="text-red-600 text-sm mt-1">{errors.primaryGoals}</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">How will you use the platform?</h3>
              <p className="text-gray-600 mb-4">Select your main use cases (choose multiple)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {useCaseOptions.map(useCase => (
                  <label key={useCase} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.useCases.includes(useCase)}
                      onChange={() => handleArrayToggle('useCases', useCase)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{useCase}</span>
                  </label>
                ))}
              </div>
              {errors.useCases && (
                <p className="text-red-600 text-sm mt-1">{errors.useCases}</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">What tools do you currently use?</h3>
              <p className="text-gray-600 mb-4">This helps us suggest relevant integrations</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentToolOptions.map(tool => (
                  <label key={tool} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.currentTools.includes(tool)}
                      onChange={() => handleArrayToggle('currentTools', tool)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{tool}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">What challenges are you facing?</h3>
              <p className="text-gray-600 mb-4">Help us understand your pain points</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {challengeOptions.map(challenge => (
                  <label key={challenge} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.challenges.includes(challenge)}
                      onChange={() => handleArrayToggle('challenges', challenge)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{challenge}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Set up your workspace</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workspace Name *
                  </label>
                  <input
                    type="text"
                    value={formData.workspaceSettings.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      workspaceSettings: {
                        ...prev.workspaceSettings,
                        name: e.target.value
                      }
                    }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.workspaceName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Acme Corp Workspace"
                  />
                  {errors.workspaceName && (
                    <p className="text-red-600 text-sm mt-1">{errors.workspaceName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.workspaceSettings.description}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      workspaceSettings: {
                        ...prev.workspaceSettings,
                        description: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Brief description of your workspace"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visibility
                  </label>
                  <select
                    value={formData.workspaceSettings.visibility}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      workspaceSettings: {
                        ...prev.workspaceSettings,
                        visibility: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="private">Private - Only invited members</option>
                    <option value="internal">Internal - Anyone in your organization</option>
                    <option value="public">Public - Anyone can join</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Invite team members</h3>
              <p className="text-gray-600 mb-4">Add your team members (you can do this later too)</p>
              
              {formData.teamMembers.map((member, index) => (
                <div key={index} className="flex items-center space-x-3 mb-3">
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) => handleTeamMemberUpdate(index, 'email', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email address"
                  />
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleTeamMemberUpdate(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Name"
                  />
                  <select
                    value={member.role}
                    onChange={(e) => handleTeamMemberUpdate(index, 'role', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleTeamMemberRemove(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={handleTeamMemberAdd}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                + Add Team Member
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Connect your tools</h3>
              <p className="text-gray-600 mb-6">
                Select the integrations you'd like to set up. You can add more later.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrationOptions.map(integration => (
                  <div
                    key={integration.name}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.selectedIntegrations.includes(integration.name)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleArrayToggle('selectedIntegrations', integration.name)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">{integration.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{integration.name}</h4>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {integration.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{integration.description}</p>
                      </div>
                      {formData.selectedIntegrations.includes(integration.name) && (
                        <div className="text-blue-600">✓</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Custom integrations</h3>
              <p className="text-gray-600 mb-4">
                Need a custom integration? Let us know what tools you'd like to connect.
              </p>
              <textarea
                value={formData.customIntegrations.join('\n')}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  customIntegrations: e.target.value.split('\n').filter(line => line.trim())
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="List any custom tools or services you'd like to integrate (one per line)"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Set your preferences</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Theme
                  </label>
                  <div className="flex space-x-4">
                    {['light', 'dark', 'auto'].map(theme => (
                      <label key={theme} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value={theme}
                          checked={formData.preferences.theme === theme}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              theme: e.target.value
                            }
                          }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700 capitalize">{theme}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    value={formData.preferences.language}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        language: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={formData.preferences.timezone}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      preferences: {
                        ...prev.preferences,
                        timezone: e.target.value
                      }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Notifications
                  </label>
                  <div className="space-y-3">
                    {[
                      { key: 'emailNotifications', label: 'Email notifications' },
                      { key: 'pushNotifications', label: 'Push notifications' },
                      { key: 'weeklyReports', label: 'Weekly summary reports' }
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.preferences[key]}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            preferences: {
                              ...prev.preferences,
                              [key]: e.target.checked
                            }
                          }))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-green-600 text-xl">🎉</div>
                <div>
                  <h4 className="font-medium text-green-900 mb-1">Almost done!</h4>
                  <p className="text-sm text-green-700">
                    You're all set! Click "Complete Setup" to finish your onboarding and start using the platform.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Setup Wizard"
        subtitle={`Step ${currentStep} of ${totalSteps}: Complete your platform setup`}
        breadcrumbs={[
          { label: 'Onboarding', href: '/onboarding-wizard' },
          { label: 'Setup Wizard', href: '/onboarding/wizard' }
        ]}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg font-medium ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>

          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i + 1 === currentStep
                    ? 'bg-blue-600'
                    : i + 1 < currentStep
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {currentStep < totalSteps ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Completing...' : 'Complete Setup'}
            </button>
          )}
        </div>

        {errors.submit && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need help? Our support team is here to assist you.
          </p>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;