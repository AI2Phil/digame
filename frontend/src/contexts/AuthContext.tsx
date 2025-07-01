import React, { createContext, useContext, useState, useEffect } from 'react';

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
  login: (credentials: { username?: string; email?: string; password: string }) => Promise<boolean>;
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

  // API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const demoMode = localStorage.getItem('demoMode');
      
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
          accessibleFeatures: ['*']
        };
        setUser(demoUser);
        setIsAuthenticated(true);
        setIsDemoMode(true);
      } else if (accessToken) {
        // Try to validate token with backend
        try {
          const response = await fetch(`${apiUrl}/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setTokens({
              accessToken,
              refreshToken: refreshToken || '',
              expiresIn: '15m',
              tokenType: 'Bearer'
            });
            setIsAuthenticated(true);
            setIsDemoMode(false);
          } else {
            // Invalid token, try to refresh
            if (refreshToken) {
              const refreshed = await refreshTokens();
              if (!refreshed) {
                clearAuthData();
              }
            } else {
              clearAuthData();
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          clearAuthData();
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('demoMode');
    setUser(null);
    setTokens(null);
    setIsAuthenticated(false);
    setIsDemoMode(false);
  };

  const login = async (credentials: { username?: string; email?: string; password: string }) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setTokens(data.tokens);
        setIsAuthenticated(true);
        setIsDemoMode(data.user.isDemoMode || false);
        
        // Store tokens
        localStorage.setItem('accessToken', data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.tokens.refreshToken);
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
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await fetch(`${apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(data.tokens);
        
        // Update stored tokens
        localStorage.setItem('accessToken', data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.tokens.refreshToken);
        
        return true;
      } else {
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
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return false;

      const response = await fetch(`${apiUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(updates)
      });

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
        accessibleFeatures: ['*']
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
      const accessToken = localStorage.getItem('accessToken');
      
      // Call backend logout if not in demo mode
      if (!isDemoMode && accessToken) {
        await fetch(`${apiUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }).catch(console.error);
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
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};