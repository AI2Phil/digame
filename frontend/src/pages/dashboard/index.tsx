import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PersonalizedDashboard from '../../components/dashboard/PersonalizedDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, TagBadge } from '../../components/ui/Badge';
import { Progress } from '../../components/ui/Progress';
import enhancedApiService from '../../services/enhancedApiService';
import {
  TrendingUp,
  Users,
  Target,
  BookOpen,
  Award,
  Clock,
  Lightbulb,
  ChevronRight,
  Star
} from 'lucide-react';

// Import dashboard components
import ProductivityChart from '../../components/dashboard/ProductivityChart';
import ActivityBreakdown from '../../components/dashboard/ActivityBreakdown';
import RecentActivity from '../../components/dashboard/RecentActivity';
import { EnhancedProductivityMetricCard } from '../../components/dashboard/ProductivityMetricCard';

interface DashboardPageProps {
  isDemoMode?: boolean;
  onLogout?: () => void;
  isNewUser?: boolean;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ isDemoMode: propIsDemoMode, onLogout: propOnLogout, isNewUser }) => {
  const router = useRouter();
  const { user, isAuthenticated, isDemoMode: authIsDemoMode, logout, isLoading } = useAuth();
  
  // Use AuthContext values or fallback to props
  const isDemoMode = authIsDemoMode || propIsDemoMode || false;
  const currentUser = user;
  
  const handleLogout = () => {
    if (propOnLogout) {
      propOnLogout();
    } else {
      logout();
      router.push('/login');
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <DashboardLayout isDemoMode={isDemoMode} currentUser={null} onLogout={handleLogout}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // Check if user has completed onboarding
  if (currentUser && !currentUser.onboardingCompleted && !isDemoMode) {
    router.push('/onboarding-wizard');
    return null;
  }

  return (
    <DashboardLayout isDemoMode={isDemoMode} currentUser={currentUser} onLogout={handleLogout}>
      <PersonalizedDashboard />
    </DashboardLayout>
  );
};

export default DashboardPage;