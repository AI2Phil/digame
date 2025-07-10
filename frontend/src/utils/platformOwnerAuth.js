import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Platform Owner Access Control Utility
 * Provides centralized authentication and authorization for Platform Owner features
 */

// Mock user roles and permissions (in production, this would come from your auth system)
const PLATFORM_OWNER_ROLES = ['platform_owner', 'admin', 'super_admin'];
const PLATFORM_OWNER_PERMISSIONS = [
  'platform_management',
  'system_administration', 
  'analytics_access',
  'compliance_management',
  'developer_portal_access',
  'marketplace_management'
];

/**
 * Hook for Platform Owner access control
 * @returns {Object} Access control state and methods
 */
export const usePlatformOwnerAccess = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userPermissions, setUserPermissions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call to check user authentication and permissions
        // In production, this would be a real API call to your auth service
        const response = await simulateAuthCheck();
        
        const { user, permissions } = response;
        
        // Check if user has required role or permissions
        const hasRequiredRole = PLATFORM_OWNER_ROLES.includes(user.role);
        const hasRequiredPermissions = permissions.some(permission => 
          PLATFORM_OWNER_PERMISSIONS.includes(permission)
        );

        const accessGranted = hasRequiredRole || hasRequiredPermissions;

        setUserRole(user.role);
        setUserPermissions(permissions);
        setHasAccess(accessGranted);

        // Log access attempt for audit purposes
        logAccessAttempt({
          userId: user.id,
          role: user.role,
          permissions,
          accessGranted,
          timestamp: new Date().toISOString(),
          page: window.location.pathname
        });

      } catch (err) {
        console.error('Platform Owner access check failed:', err);
        setError(err.message);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, []);

  return { 
    hasAccess, 
    loading, 
    userRole, 
    userPermissions, 
    error,
    refreshAccess: () => window.location.reload()
  };
};

/**
 * Higher-order component for Platform Owner route protection
 * @param {React.Component} WrappedComponent - Component to protect
 * @returns {React.Component} Protected component
 */
export const withPlatformOwnerAuth = (WrappedComponent) => {
  return function ProtectedComponent(props) {
    const { hasAccess, loading, userRole, error } = usePlatformOwnerAccess();
    const router = useRouter();

    if (loading) {
      return <AccessLoadingScreen />;
    }

    if (error) {
      return <AccessErrorScreen error={error} />;
    }

    if (!hasAccess) {
      return <AccessDeniedScreen userRole={userRole} onReturn={() => router.push('/')} />;
    }

    return <WrappedComponent {...props} userRole={userRole} />;
  };
};

/**
 * Check if user has specific Platform Owner permission
 * @param {string} permission - Permission to check
 * @param {Array} userPermissions - User's current permissions
 * @returns {boolean} Whether user has the permission
 */
export const hasPermission = (permission, userPermissions = []) => {
  return userPermissions.includes(permission) || 
         userPermissions.includes('super_admin') ||
         userPermissions.includes('platform_management');
};

/**
 * Get user's access level for display purposes
 * @param {string} userRole - User's role
 * @param {Array} userPermissions - User's permissions
 * @returns {Object} Access level information
 */
export const getAccessLevel = (userRole, userPermissions = []) => {
  if (userRole === 'super_admin' || userPermissions.includes('super_admin')) {
    return { level: 'Super Admin', color: 'red', description: 'Full platform access' };
  }
  
  if (userRole === 'platform_owner' || userPermissions.includes('platform_management')) {
    return { level: 'Platform Owner', color: 'blue', description: 'Platform management access' };
  }
  
  if (userRole === 'admin' || userPermissions.includes('system_administration')) {
    return { level: 'Administrator', color: 'green', description: 'System administration access' };
  }
  
  return { level: 'Limited Access', color: 'yellow', description: 'Restricted access' };
};

// Simulate authentication check (replace with real API call)
const simulateAuthCheck = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate different user scenarios for testing
      const scenarios = [
        // Platform Owner - Full Access
        {
          user: { id: 'user_1', role: 'platform_owner', email: 'owner@company.com' },
          permissions: ['platform_management', 'system_administration', 'analytics_access', 'compliance_management']
        },
        // Admin - Partial Access
        {
          user: { id: 'user_2', role: 'admin', email: 'admin@company.com' },
          permissions: ['system_administration', 'analytics_access']
        },
        // Regular User - No Access
        {
          user: { id: 'user_3', role: 'user', email: 'user@company.com' },
          permissions: ['basic_access']
        }
      ];

      // For demo purposes, always return Platform Owner access
      // In production, this would be based on actual authentication
      resolve(scenarios[0]);
    }, 800);
  });
};

// Log access attempts for audit purposes
const logAccessAttempt = (accessData) => {
  // In production, this would send to your logging/audit system
  console.log('Platform Owner Access Attempt:', accessData);
  
  // Store in localStorage for demo purposes
  const existingLogs = JSON.parse(localStorage.getItem('platformOwnerAccessLogs') || '[]');
  existingLogs.push(accessData);
  
  // Keep only last 100 logs
  if (existingLogs.length > 100) {
    existingLogs.splice(0, existingLogs.length - 100);
  }
  
  localStorage.setItem('platformOwnerAccessLogs', JSON.stringify(existingLogs));
};

// Loading screen component
const AccessLoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Verifying Platform Owner access...</p>
      <p className="text-sm text-gray-500 mt-2">Checking authentication and permissions</p>
    </div>
  </div>
);

// Error screen component
const AccessErrorScreen = ({ error }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-md mx-auto text-center">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
        <p className="text-gray-600 mb-6">
          Unable to verify your access permissions. Please try again or contact support.
        </p>
        <div className="bg-red-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">
            <strong>Error:</strong> {error}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

// Access denied screen component
const AccessDeniedScreen = ({ userRole, onReturn }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-md mx-auto text-center">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to access Platform Owner features. 
          This area is restricted to platform administrators and owners only.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>Current Role:</strong> {userRole || 'Unknown'}
          </p>
          <p className="text-sm text-gray-700 mt-1">
            <strong>Required Role:</strong> Platform Owner, Admin, or Super Admin
          </p>
          <p className="text-sm text-gray-700 mt-1">
            <strong>Required Permissions:</strong> Platform Management
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={onReturn}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
          <button
            onClick={() => window.location.href = 'mailto:support@company.com?subject=Platform Owner Access Request'}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Request Access
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default {
  usePlatformOwnerAccess,
  withPlatformOwnerAuth,
  hasPermission,
  getAccessLevel
};