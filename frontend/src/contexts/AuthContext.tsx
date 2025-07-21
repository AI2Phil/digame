import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

interface User {
  id: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email: string;
  username: string;
  role: string;
  subscriptionTier: string;
  teamId?: string | null;
  permissions: string[];
  isPlatformOwner: boolean;
  isActive: boolean;
  isVerified: boolean;
  lastLogin?: string | null;
  profile?: any;
  preferences?: any;
  accessibleFeatures?: string[];
  isDemoMode?: boolean;
  onboardingCompleted?: boolean;
  onboardingData?: {
    interests?: string[];
    goals?: string[];
    experienceLevel?: string;
    teamChoice?: string;
    [key: string]: any;
  };
  unlockedFeatures?: string[];
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: string;
}

interface AuthContextType {
  user: User | null;
  tokens: Tokens | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  login: (credentials: { username?: string; email?: string; password: string; rememberMe?: boolean }) => Promise<boolean>;
  logout: () => void;
  enterDemoMode: () => void;
  refreshToken: () => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
  hasFeatureAccess: (feature: string) => boolean;
  hasSubscriptionAccess: (tier: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);


  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check both localStorage and sessionStorage for tokens
      const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      const demoMode = localStorage.getItem('demoMode');
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      
      if (demoMode === 'true') {
        // Demo mode
        const demoUser: User = {
          id: 999,
          firstName: 'Demo',
          lastName: 'User',
          fullName: 'Demo User',
          email: 'demo@digame.com',
          username: 'demo',
          role: 'admin',
          subscriptionTier: 'enterprise',
          permissions: ['*'],
          isPlatformOwner: false,
          isActive: true,
          isVerified: true,
          isDemoMode: true,
          accessibleFeatures: ['*'],
          onboardingCompleted: false,
          onboardingData: {
            interests: ['analytics', 'ai', 'productivity'],
            goals: ['productivity', 'data_insights'],
            experienceLevel: 'advanced',
            teamChoice: 'individual'
          },
          unlockedFeatures: ['basic_analytics', 'advanced_analytics', 'ai_coaching']
        };
        setUser(demoUser);
        setIsAuthenticated(true);
        setIsDemoMode(true);
      } else if (accessToken) {
        // Set tokens first so apiService can use them
        setTokens({
          accessToken,
          refreshToken: refreshToken || '',
          expiresIn: rememberMe ? '30d' : '24h',
          tokenType: 'Bearer'
        });
        
        // Try to validate token with backend
        try {
          const response = await apiService.get('/auth/profile');
          
          if (response.ok) {
            const data = await response.json();
            
            // Transform backend user data to frontend User interface
            const transformedUser: User = {
              id: data.user.id,
              name: data.user.first_name && data.user.last_name
                ? `${data.user.first_name} ${data.user.last_name}`
                : data.user.username,
              firstName: data.user.first_name,
              lastName: data.user.last_name,
              fullName: data.user.first_name && data.user.last_name
                ? `${data.user.first_name} ${data.user.last_name}`
                : data.user.username,
              email: data.user.email,
              username: data.user.username,
              role: data.user.is_platform_owner ? 'platform_owner' : 'user',
              subscriptionTier: data.user.subscription_tier || 'free',
              teamId: data.user.tenant_id?.toString() || null,
              permissions: data.user.is_platform_owner ? ['*'] : [],
              isPlatformOwner: data.user.is_platform_owner || false,
              isActive: data.user.is_active || true,
              isVerified: data.user.email_verified || false,
              lastLogin: data.user.last_login,
              accessibleFeatures: data.user.is_platform_owner ? ['*'] : [],
              isDemoMode: false,
              onboardingCompleted: data.user.onboarding_completed || false,
              onboardingData: {},
              unlockedFeatures: data.user.is_platform_owner ? ['*'] : []
            };
            
            setUser(transformedUser);
            setIsAuthenticated(true);
            setIsDemoMode(false);
            console.log('Auth restored from stored tokens');
          } else if (response.status === 401 && refreshToken) {
            // Token expired, try to refresh
            console.log('Access token expired, attempting refresh...');
            const refreshed = await refreshTokens();
            if (!refreshed) {
              console.log('Token refresh failed, clearing auth data');
              clearAuthData();
            }
          } else {
            console.log('Auth validation failed, clearing auth data');
            clearAuthData();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // Try refresh token before clearing if we have one
          if (refreshToken) {
            console.log('Auth check failed, attempting token refresh...');
            const refreshed = await refreshTokens();
            if (!refreshed) {
              clearAuthData();
            }
          } else {
            clearAuthData();
          }
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const clearAuthData = () => {
    // Clear from both localStorage and sessionStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('demoMode');
    localStorage.removeItem('rememberMe');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    setUser(null);
    setTokens(null);
    setIsAuthenticated(false);
    setIsDemoMode(false);
  };

  const login = async (credentials: { username?: string; email?: string; password: string; rememberMe?: boolean }) => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Login called with rememberMe:', credentials.rememberMe);
      console.log('AuthContext: Full credentials object:', credentials);
      
      // Only send username and password to backend (remove rememberMe)
      const loginPayload = {
        username: credentials.username || credentials.email,
        password: credentials.password
      };
      console.log('AuthContext: Sending to backend:', loginPayload);
      
      const response = await apiService.post('/auth/login', loginPayload);
      
      if (response.ok) {
        const data = await response.json();
        console.log('AuthContext: Login response received:', data);
        
        // Transform backend response to match frontend expectations
        const tokens = {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: credentials.rememberMe ? '30d' : '24h',
          tokenType: data.token_type || 'Bearer'
        };
        
        // Transform backend user data to frontend User interface
        const transformedUser: User = {
          id: data.user.id,
          name: data.user.first_name && data.user.last_name
            ? `${data.user.first_name} ${data.user.last_name}`
            : data.user.username,
          firstName: data.user.first_name,
          lastName: data.user.last_name,
          fullName: data.user.first_name && data.user.last_name
            ? `${data.user.first_name} ${data.user.last_name}`
            : data.user.username,
          email: data.user.email,
          username: data.user.username,
          role: data.user.is_platform_owner ? 'platform_owner' : 'user',
          subscriptionTier: data.user.subscription_tier || 'free',
          teamId: data.user.tenant_id?.toString() || null,
          permissions: data.user.is_platform_owner ? ['*'] : [],
          isPlatformOwner: data.user.is_platform_owner || false,
          isActive: data.user.is_active || true,
          isVerified: data.user.email_verified || false,
          lastLogin: data.user.last_login,
          accessibleFeatures: data.user.is_platform_owner ? ['*'] : [],
          isDemoMode: false,
          onboardingCompleted: data.user.onboarding_completed || false,
          onboardingData: {},
          unlockedFeatures: data.user.is_platform_owner ? ['*'] : []
        };
        
        setUser(transformedUser);
        setTokens(tokens);
        setIsAuthenticated(true);
        setIsDemoMode(false);
        
        // Store tokens with persistence preference
        if (credentials.rememberMe) {
          console.log('AuthContext: Storing tokens in localStorage (persistent)');
          // Use localStorage for persistent storage
          localStorage.setItem('accessToken', tokens.accessToken);
          localStorage.setItem('refreshToken', tokens.refreshToken);
          localStorage.setItem('rememberMe', 'true');
        } else {
          console.log('AuthContext: Storing tokens in sessionStorage (session-only)');
          // Use sessionStorage for session-only storage
          sessionStorage.setItem('accessToken', tokens.accessToken);
          sessionStorage.setItem('refreshToken', tokens.refreshToken);
          localStorage.removeItem('rememberMe');
        }
        localStorage.removeItem('demoMode');
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTokens = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      console.log('Attempting to refresh tokens...');
      const response = await apiService.post('/auth/refresh', { refreshToken });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.tokens);
        
        // Update stored tokens in the same storage location
        const rememberMe = localStorage.getItem('rememberMe') === 'true';
        if (rememberMe) {
          localStorage.setItem('accessToken', data.tokens.accessToken);
          localStorage.setItem('refreshToken', data.tokens.refreshToken);
        } else {
          sessionStorage.setItem('accessToken', data.tokens.accessToken);
          sessionStorage.setItem('refreshToken', data.tokens.refreshToken);
        }
        
        // After successful token refresh, get updated user profile
        try {
          const profileResponse = await apiService.get('/auth/profile');
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            
            // Transform backend user data to frontend User interface
            const transformedUser: User = {
              id: profileData.user.id,
              name: profileData.user.first_name && profileData.user.last_name
                ? `${profileData.user.first_name} ${profileData.user.last_name}`
                : profileData.user.username,
              firstName: profileData.user.first_name,
              lastName: profileData.user.last_name,
              fullName: profileData.user.first_name && profileData.user.last_name
                ? `${profileData.user.first_name} ${profileData.user.last_name}`
                : profileData.user.username,
              email: profileData.user.email,
              username: profileData.user.username,
              role: profileData.user.is_platform_owner ? 'platform_owner' : 'user',
              subscriptionTier: profileData.user.subscription_tier || 'free',
              teamId: profileData.user.tenant_id?.toString() || null,
              permissions: profileData.user.is_platform_owner ? ['*'] : [],
              isPlatformOwner: profileData.user.is_platform_owner || false,
              isActive: profileData.user.is_active || true,
              isVerified: profileData.user.email_verified || false,
              lastLogin: profileData.user.last_login,
              accessibleFeatures: profileData.user.is_platform_owner ? ['*'] : [],
              isDemoMode: false,
              onboardingCompleted: profileData.user.onboarding_completed || false,
              onboardingData: {},
              unlockedFeatures: profileData.user.is_platform_owner ? ['*'] : []
            };
            
            setUser(transformedUser);
            setIsAuthenticated(true);
            setIsDemoMode(false);
            console.log('Token refresh successful, user profile updated');
          }
        } catch (profileError) {
          console.error('Failed to fetch profile after token refresh:', profileError);
        }
        
        return true;
      } else {
        console.log('Token refresh failed with status:', response.status);
        clearAuthData();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuthData();
      return false;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      if (!accessToken) return false;

      const response = await apiService.put('/auth/profile', updates);

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return true;
      } else {
        console.error('Profile update failed');
        return false;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  const enterDemoMode = async () => {
    try {
      // Create demo user locally without backend call
      const demoUser: User = {
        id: 999,
        firstName: 'Demo',
        lastName: 'User',
        fullName: 'Demo User',
        email: 'demo@digame.com',
        username: 'demo',
        role: 'admin',
        subscriptionTier: 'enterprise',
        permissions: ['*'],
        isPlatformOwner: false,
        isActive: true,
        isVerified: true,
        isDemoMode: true,
        accessibleFeatures: ['*'],
        onboardingCompleted: false,
        onboardingData: {
          interests: ['analytics', 'ai', 'productivity'],
          goals: ['productivity', 'data_insights'],
          experienceLevel: 'advanced',
          teamChoice: 'individual'
        },
        unlockedFeatures: ['basic_analytics', 'advanced_analytics', 'ai_coaching']
      };
      
      setUser(demoUser);
      setIsAuthenticated(true);
      setIsDemoMode(true);
      
      // Store demo mode flag
      localStorage.setItem('demoMode', 'true');
    } catch (error) {
      console.error('Demo mode error:', error);
    }
  };

  const logout = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      
      // Call backend logout if not in demo mode
      if (!isDemoMode && accessToken) {
        await apiService.post('/auth/logout', {}).catch(console.error);
      }
    } finally {
      clearAuthData();
    }
  };

  // Helper functions
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.isPlatformOwner) return true;
    return user.permissions.includes(permission) || user.permissions.includes('*');
  };

  const hasFeatureAccess = (feature: string): boolean => {
    if (!user) return false;
    if (user.isPlatformOwner) return true;
    return user.accessibleFeatures?.includes(feature) || user.accessibleFeatures?.includes('*') || false;
  };

  const hasSubscriptionAccess = (tier: string): boolean => {
    if (!user) return false;
    if (user.isPlatformOwner) return true;
    
    const tierHierarchy: { [key: string]: number } = {
      'free': 0,
      'individual_pro': 1,
      'team': 2,
      'enterprise': 3,
      'platform_owner': 4
    };

    const userTierLevel = tierHierarchy[user.subscriptionTier] || 0;
    const requiredTierLevel = tierHierarchy[tier] || 0;

    return userTierLevel >= requiredTierLevel;
  };

  return (
    <AuthContext.Provider value={{
      user,
      tokens,
      isAuthenticated,
      isDemoMode,
      isLoading,
      login,
      logout,
      enterDemoMode,
      refreshToken: refreshTokens,
      updateProfile,
      hasPermission,
      hasFeatureAccess,
      hasSubscriptionAccess
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Return safe defaults if context is null (during SSR or missing provider)
  if (!context) {
    return {
      user: null,
      tokens: null,
      isAuthenticated: false,
      isDemoMode: false,
      isLoading: true,
      login: async () => false,
      logout: () => {},
      enterDemoMode: () => {},
      refreshToken: async () => false,
      updateProfile: async () => false,
      hasPermission: () => false,
      hasFeatureAccess: () => false,
      hasSubscriptionAccess: () => false,
      isSSR: true
    };
  }
  
  return { ...context, isSSR: false };
};