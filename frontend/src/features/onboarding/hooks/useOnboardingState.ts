import { useState, useEffect, useCallback } from 'react';
import {
    apiClient,
    // Assuming backend models are mirrored or imported from apiClient.ts or a shared types location
    // For now, define simplified local types or import from apiClient if they exist there
} from '../../../services/apiClient';

// Simplified local types for this hook, consistent with backend models
// In a real app, these might be more detailed or shared via OpenAPI generator / monorepo types
export interface OnboardingStepData {
  step_id: string;
  completed: boolean;
  data?: Record<string, any>;
}
export interface UserOnboardingStatus {
  user_id: string;
  current_step_id?: string | null;
  completed_all: boolean;
  last_updated: string; // ISO date string
  steps: OnboardingStepData[];
  preferences: Record<string, any>;
}
export interface OnboardingStepUpdatePayload {
    step_id: string;
    data?: Record<string, any>;
}
export interface OnboardingPreferencesUpdatePayload {
    preferences: Record<string, any>;
}


// Define step identifiers (consistent with GuidedSetupWizard.tsx and backend service)
export const ONBOARDING_STEPS = {
  WELCOME: 'welcome',
  PROFILE_INFO: 'profile_info',
  GOAL_SETTING: 'goal_setting',
  COMPLETED: 'completed', // This is a client-side conceptual step post-API completion
};


export const useOnboardingState = () => {
  const [status, setStatus] = useState<UserOnboardingStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOnboardingStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Ensure apiClient.ts has types that match backend (UserOnboardingStatus)
      const data = await apiClient.get<UserOnboardingStatus>('/onboarding/status');
      setStatus(data);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch onboarding status:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOnboardingStatus();
  }, [fetchOnboardingStatus]);

  const submitOnboardingStep = useCallback(async (stepUpdate: OnboardingStepUpdatePayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.post<UserOnboardingStatus, OnboardingStepUpdatePayload>('/onboarding/step', stepUpdate);
      setStatus(data);
      return data; // Return new status
    } catch (err) {
      setError(err as Error);
      console.error("Failed to submit onboarding step:", err);
      throw err; // Re-throw to allow components to handle it
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitOnboardingPreferences = useCallback(async (preferencesUpdate: OnboardingPreferencesUpdatePayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.post<UserOnboardingStatus, OnboardingPreferencesUpdatePayload>('/onboarding/preferences', preferencesUpdate);
      setStatus(data);
      return data; // Return new status
    } catch (err) {
      setError(err as Error);
      console.error("Failed to submit onboarding preferences:", err);
      throw err; // Re-throw
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Determine current client-side step based on API status.current_step_id
  // Or, if API returns completed_all, then client is at a conceptual "COMPLETED" step.
  let clientCurrentStep = ONBOARDING_STEPS.WELCOME; // Default if status is null
  if (status) {
    if (status.completed_all) {
        clientCurrentStep = ONBOARDING_STEPS.COMPLETED;
    } else if (status.current_step_id) {
        clientCurrentStep = status.current_step_id;
    }
    // Add more logic here if client-side step IDs differ from backend current_step_id
  }


  return {
    onboardingStatus: status,
    currentClientStep: clientCurrentStep, // This will be used by the wizard
    isLoading,
    error,
    fetchOnboardingStatus, // To allow manual refetch if needed
    submitOnboardingStep,
    submitOnboardingPreferences,
  };
};
