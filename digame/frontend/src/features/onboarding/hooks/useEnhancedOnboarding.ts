/**
 * Enhanced Onboarding Hook - Integrates with new backend persistence and analytics
 */

import { useState, useEffect, useCallback } from 'react';
import enhancedOnboardingService from '../../../services/enhancedOnboardingService';

// Types for enhanced onboarding
export interface EnhancedOnboardingStep {
  step_id: string;
  completed: boolean;
  data?: Record<string, any>;
}

export interface EnhancedOnboardingStatus {
  user_id: string;
  current_step_id?: string | null;
  completed_all: boolean;
  last_updated: string;
  steps: EnhancedOnboardingStep[];
  preferences: Record<string, any>;
}

export interface OnboardingMetrics {
  user_id: number;
  completion_percentage: number;
  completed_steps: number;
  total_steps: number;
  is_completed: boolean;
  time_to_complete: number | null;
  started_at?: string;
  completed_at?: string;
  current_step?: string;
}

export interface DashboardData {
  user_insights: {
    onboarding_status: string;
    completion_percentage: number;
    current_step: string | null;
    time_spent_total: number;
    steps_completed: number;
    total_steps: number;
    user_preferences: Record<string, any>;
    completion_date: string | null;
    started_date: string | null;
  };
  platform_insights: {
    overall_completion_rate: number;
    average_completion_time: number;
    most_challenging_step: string | null;
    user_satisfaction: number;
  };
  recommendations: string[];
  next_actions: string[];
}

export interface AnalyticsData {
  clicks_count?: number;
  form_submissions?: number;
  help_requests?: number;
  skip_actions?: number;
  device_type?: string;
  browser_info?: string;
  screen_resolution?: string;
  interaction_data?: Record<string, any>;
  errors_encountered?: string[];
}

export const useEnhancedOnboarding = () => {
  const [status, setStatus] = useState<EnhancedOnboardingStatus | null>(null);
  const [metrics, setMetrics] = useState<OnboardingMetrics | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData>({});

  // Step sequence for the enhanced onboarding
  const STEP_SEQUENCE = [
    'welcome',
    'profile_info', 
    'goal_setting',
    'preferences',
    'features',
    'final_summary'
  ];

  /**
   * Fetch onboarding status from enhanced backend
   */
  const fetchOnboardingStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await enhancedOnboardingService.getOnboardingStatus();
      setStatus(data);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch enhanced onboarding status:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch user metrics
   */
  const fetchUserMetrics = useCallback(async () => {
    try {
      const data = await enhancedOnboardingService.getUserMetrics();
      setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch user metrics:", err);
    }
  }, []);

  /**
   * Fetch dashboard data
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      const data = await enhancedOnboardingService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  }, []);

  /**
   * Update onboarding step with analytics
   */
  const updateOnboardingStep = useCallback(async (
    stepId: string,
    stepData?: Record<string, any> | null,
    additionalAnalytics?: Partial<AnalyticsData>
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      // Merge analytics data
      const analyticsData = enhancedOnboardingService.trackStepAnalytics(stepId, {
        ...analytics,
        ...additionalAnalytics
      });

      const data = await (enhancedOnboardingService as any).updateOnboardingStep(
        stepId,
        stepData,
        analyticsData
      );
      
      setStatus(data);
      
      // Reset analytics for next step
      setAnalytics({});
      
      // Refresh metrics and dashboard data
      await Promise.all([
        fetchUserMetrics(),
        fetchDashboardData()
      ]);
      
      return data;
    } catch (err) {
      setError(err as Error);
      console.error("Failed to update onboarding step:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [analytics, fetchUserMetrics, fetchDashboardData]);

  /**
   * Update user preferences
   */
  const updateUserPreferences = useCallback(async (preferences: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await enhancedOnboardingService.updateUserPreferences(preferences);
      setStatus(data);
      return data;
    } catch (err) {
      setError(err as Error);
      console.error("Failed to update user preferences:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Complete onboarding process
   */
  const completeOnboarding = useCallback(async (finalData: Record<string, any>) => {
    try {
      const data = await enhancedOnboardingService.completeOnboarding(finalData);
      setStatus(data);
      
      // Refresh all data
      await Promise.all([
        fetchUserMetrics(),
        fetchDashboardData()
      ]);
      
      return data;
    } catch (err) {
      setError(err as Error);
      console.error("Failed to complete onboarding:", err);
      throw err;
    }
  }, [fetchUserMetrics, fetchDashboardData]);

  /**
   * Save user feedback
   */
  const saveUserFeedback = useCallback(async (
    rating: number,
    feedbackText?: string | null,
    stepId?: string,
    feedbackCategories?: Record<string, any>
  ) => {
    try {
      return await (enhancedOnboardingService as any).saveUserFeedback(
        rating,
        feedbackText,
        stepId,
        feedbackCategories
      );
    } catch (err) {
      console.error("Failed to save user feedback:", err);
      throw err;
    }
  }, []);

  /**
   * Track analytics for current step
   */
  const trackAnalytics = useCallback((analyticsData: Partial<AnalyticsData>) => {
    setAnalytics(prev => ({
      ...prev,
      ...analyticsData
    }));
  }, []);

  /**
   * Track specific interactions
   */
  const trackClick = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      clicks_count: (prev.clicks_count || 0) + 1
    }));
  }, []);

  const trackFormSubmission = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      form_submissions: (prev.form_submissions || 0) + 1
    }));
  }, []);

  const trackHelpRequest = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      help_requests: (prev.help_requests || 0) + 1
    }));
  }, []);

  const trackSkipAction = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      skip_actions: (prev.skip_actions || 0) + 1
    }));
  }, []);

  const trackError = useCallback((error: string) => {
    setAnalytics(prev => ({
      ...prev,
      errors_encountered: [...(prev.errors_encountered || []), error]
    }));
  }, []);

  /**
   * Get current step information
   */
  const getCurrentStepInfo = useCallback(() => {
    if (!status) return null;

    const currentStepId = status.current_step_id || 'welcome';
    const currentStepIndex = STEP_SEQUENCE.indexOf(currentStepId);
    const totalSteps = STEP_SEQUENCE.length;
    const completedSteps = status.steps.filter(step => step.completed).length;
    const progress = (completedSteps / totalSteps) * 100;

    return {
      currentStepId,
      currentStepIndex,
      totalSteps,
      completedSteps,
      progress,
      isCompleted: status.completed_all,
      canGoNext: currentStepIndex < totalSteps - 1,
      canGoPrevious: currentStepIndex > 0,
      nextStepId: currentStepIndex < totalSteps - 1 ? STEP_SEQUENCE[currentStepIndex + 1] : null,
      previousStepId: currentStepIndex > 0 ? STEP_SEQUENCE[currentStepIndex - 1] : null
    };
  }, [status]);

  /**
   * Navigate to specific step
   */
  const navigateToStep = useCallback(async (stepId: string) => {
    if (!STEP_SEQUENCE.includes(stepId)) {
      throw new Error(`Invalid step ID: ${stepId}`);
    }

    try {
      await updateOnboardingStep(stepId, null, {
        interaction_data: { navigation: true }
      });
    } catch (err) {
      console.error(`Failed to navigate to step ${stepId}:`, err);
      throw err;
    }
  }, [updateOnboardingStep]);

  /**
   * Get step validation status
   */
  const getStepValidation = useCallback((stepId: string, stepData: any) => {
    switch (stepId) {
      case 'profile_info':
        return enhancedOnboardingService.validateProfileData(stepData);
      case 'goal_setting':
        return enhancedOnboardingService.validateGoalsData(stepData);
      default:
        return { isValid: true, errors: [] };
    }
  }, []);

  /**
   * Get recommended features for user
   */
  const getRecommendedFeatures = useCallback((role: string) => {
    return enhancedOnboardingService.getRecommendedFeatures(role);
  }, []);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await fetchOnboardingStatus();
      await Promise.all([
        fetchUserMetrics(),
        fetchDashboardData()
      ]);
    };

    initializeData();
  }, [fetchOnboardingStatus, fetchUserMetrics, fetchDashboardData]);

  return {
    // State
    onboardingStatus: status,
    userMetrics: metrics,
    dashboardData,
    isLoading,
    error,
    analytics,

    // Actions
    fetchOnboardingStatus,
    fetchUserMetrics,
    fetchDashboardData,
    updateOnboardingStep,
    updateUserPreferences,
    completeOnboarding,
    saveUserFeedback,

    // Analytics tracking
    trackAnalytics,
    trackClick,
    trackFormSubmission,
    trackHelpRequest,
    trackSkipAction,
    trackError,

    // Navigation and utilities
    getCurrentStepInfo,
    navigateToStep,
    getStepValidation,
    getRecommendedFeatures,

    // Constants
    STEP_SEQUENCE
  };
};

export default useEnhancedOnboarding;