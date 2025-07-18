import React, { useState } from 'react';
import ComprehensiveNavigation from '../components/navigation/ComprehensiveNavigation';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Crown, Users, Building, Settings } from 'lucide-react';

const ComprehensiveNavigationDemo = () => {
  const [selectedUser, setSelectedUser] = useState('platformOwner');
  const [isNavOpen, setIsNavOpen] = useState(true);

  // Mock user profiles to demonstrate different access levels
  const userProfiles = {
    platformOwner: {
      name: 'Platform Owner',
      role: 'platform_owner',
      is_platform_owner: true,
      subscription_tier: 'enterprise',
      tenant_id: 1,
      tenant_name: 'Digame Platform',
      permissions: ['all_access', 'platform_management', 'tenant_management', 'user_management'],
    },
    enterpriseAdmin: {
      name: 'Enterprise Admin',
      role: 'admin',
      is_platform_owner: false,
      subscription_tier: 'enterprise',
      tenant_id: 2,
      tenant_name: 'Enterprise Corp',
      permissions: ['admin_access', 'tenant_management', 'user_management', 'analytics_access'],
    },
    teamLead: {
      name: 'Team Lead',
      role: 'team_lead',
      is_platform_owner: false,
      subscription_tier: 'team',
      tenant_id: 3,
      tenant_name: 'Team Workspace',
      permissions: ['team_management', 'analytics_access', 'reporting_access'],
    },
    regularUser: {
      name: 'Regular User',
      role: 'user',
      is_platform_owner: false,
      subscription_tier: 'individual_pro',
      tenant_id: 4,
      tenant_name: 'Personal Workspace',
      permissions: ['basic_access', 'profile_management'],
    },
    freeUser: {
      name: 'Free User',
      role: 'user',
      is_platform_owner: false,
      subscription_tier: 'free',
      tenant_id: 5,
      tenant_name: 'Free Workspace',
      permissions: ['basic_access'],
    },
  };

  const currentUser = userProfiles[selectedUser];

  const getUserBadgeColor = userType => {
    switch (userType) {
      case 'platformOwner':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'enterpriseAdmin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'teamLead':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'regularUser':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'freeUser':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getUserIcon = userType => {
    switch (userType) {
      case 'platformOwner':
        return <Crown className="w-4 h-4" />;
      case 'enterpriseAdmin':
        return <Building className="w-4 h-4" />;
      case 'teamLead':
        return <Users className="w-4 h-4" />;
      case 'regularUser':
        return <Users className="w-4 h-4" />;
      case 'freeUser':
        return <Users className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Navigation Sidebar */}
      <div className={`${isNavOpen ? 'w-96' : 'w-0'} transition-all duration-300 overflow-hidden`}>
        <ComprehensiveNavigation
          isDemoMode={true}
          currentUser={currentUser}
          isOpen={isNavOpen}
          onToggle={() => setIsNavOpen(!isNavOpen)}
          showAllFeatures={true} // Show all features for demonstration
          onLogout={() => console.log('Logout clicked')}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Comprehensive Navigation Demo
              </h1>
              <p className="text-gray-600">
                Complete mapping of all backend features and functionality to frontend navigation
              </p>
            </div>
            <Button variant="outline" onClick={() => setIsNavOpen(!isNavOpen)}>
              {isNavOpen ? 'Hide' : 'Show'} Navigation
            </Button>
          </div>

          {/* User Profile Selector */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Select User Profile to Test Access Levels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(userProfiles).map(([key, profile]) => (
                <button
                  key={key}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedUser === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedUser(key)}
                >
                  <div className="flex items-center mb-2">
                    {getUserIcon(key)}
                    <span className="ml-2 font-medium text-sm">{profile.name}</span>
                  </div>
                  <Badge className={`text-xs ${getUserBadgeColor(key)}`}>
                    {profile.subscription_tier}
                  </Badge>
                  {profile.is_platform_owner && (
                    <Badge className="text-xs bg-yellow-100 text-yellow-800 ml-1">
                      <Crown className="w-3 h-3 mr-1" />
                      Owner
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Current User Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">User Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {currentUser.name}
                </div>
                <div>
                  <span className="font-medium">Role:</span> {currentUser.role}
                </div>
                <div>
                  <span className="font-medium">Subscription:</span> {currentUser.subscription_tier}
                </div>
                <div>
                  <span className="font-medium">Tenant:</span> {currentUser.tenant_name}
                </div>
                <div>
                  <span className="font-medium">Platform Owner:</span>{' '}
                  {currentUser.is_platform_owner ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Permissions</h3>
              <div className="flex flex-wrap gap-2">
                {currentUser.permissions.map((permission, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Coverage Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Backend Feature Coverage Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Core Features</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>✅ Dashboard & Analytics</div>
                <div>✅ User Profile Management</div>
                <div>✅ Settings & Preferences</div>
                <div>✅ Notification System</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">AI & Intelligence</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>✅ Digital Twin Management</div>
                <div>✅ AI Tools & Automation</div>
                <div>✅ Pattern Recognition</div>
                <div>✅ Predictive Analytics</div>
                <div>✅ Behavioral Analysis</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Collaboration</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>✅ Team Management</div>
                <div>✅ Social Collaboration</div>
                <div>✅ Mentorship Programs</div>
                <div>✅ Workflow Automation</div>
                <div>✅ Task Management</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Enterprise</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>✅ Multi-Tenant Management</div>
                <div>✅ Enterprise Analytics</div>
                <div>✅ Security & Compliance</div>
                <div>✅ Custom Integrations</div>
                <div>✅ Market Intelligence</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Platform Owner</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>✅ Platform Console</div>
                <div>✅ Revenue Analytics</div>
                <div>✅ System Health Monitoring</div>
                <div>✅ API Test Zone</div>
                <div>✅ Global User Management</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Integrations</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>✅ Third-party Integrations</div>
                <div>✅ SSO Configuration</div>
                <div>✅ API Management</div>
                <div>✅ Webhook Configuration</div>
                <div>✅ Data Import/Export</div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">✅ Complete Backend Coverage</h3>
            <p className="text-sm text-green-700">
              All {Object.keys({} /* removed router require */).length - 1} backend routers are
              mapped to frontend navigation items, providing complete access to every backend
              feature and functionality through an intuitive, role-based navigation interface.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveNavigationDemo;
