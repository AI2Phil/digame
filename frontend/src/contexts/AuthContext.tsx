import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  username?: string;
  isDemoMode?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<boolean>;
  logout: () => void;
  enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const demoMode = localStorage.getItem('demoMode');
      
      if (demoMode === 'true') {
        // Demo mode
        setUser({
          id: 999,
          name: 'Demo User',
          email: 'demo@digame.com',
          role: 'admin',
          username: 'demo',
          isDemoMode: true
        });
        setIsAuthenticated(true);
        setIsDemoMode(true);
      } else if (token) {
        // Try to validate token with backend
        try {
          const response = await fetch('http://localhost:8001/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setIsAuthenticated(true);
            setIsDemoMode(false);
          } else {
            // Invalid token, clear it
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:8001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
        setIsDemoMode(false);
        localStorage.setItem('token', data.token);
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

  const enterDemoMode = () => {
    const demoUser = {
      id: 999,
      name: 'Demo User',
      email: 'demo@digame.com',
      role: 'admin',
      username: 'demo',
      isDemoMode: true
    };
    
    setUser(demoUser);
    setIsAuthenticated(true);
    setIsDemoMode(true);
    localStorage.setItem('demoMode', 'true');
    localStorage.removeItem('token');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsDemoMode(false);
    localStorage.removeItem('token');
    localStorage.removeItem('demoMode');
    
    // Call backend logout if not in demo mode
    if (!isDemoMode) {
      fetch('http://localhost:8001/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }).catch(console.error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isDemoMode,
      isLoading,
      login,
      logout,
      enterDemoMode
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