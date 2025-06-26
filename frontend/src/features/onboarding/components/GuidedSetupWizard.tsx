import React, { useEffect } from 'react';
import StepWelcome from './StepWelcome';
import StepProfileInfo from './StepProfileInfo';
import StepGoalSetting from './StepGoalSetting';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button'; // For a potential retry button
import { useOnboardingState, ONBOARDING_STEPS, OnboardingStepUpdatePayload } from '../hooks/useOnboardingState';

const GuidedSetupWizard: React.FC = () => {
  const {
    onboardingStatus,
    currentClientStep, // Use this for rendering logic
    isLoading,
    error,
    submitOnboardingStep,
    // submitOnboardingPreferences, // We might call this at the end or as part of final step.
    fetchOnboardingStatus
  } = useOnboardingState();

  // This local state is for collecting data across multiple client-side "sub-steps"
  // before a single API call for a backend "step".
  // For simplicity now, we assume each client step maps to one backend step update.
  // const [collectedData, setCollectedData] = useState<Record<string, any>>({});


  const handleWelcomeNext = async () => {
    try {
      await submitOnboardingStep({ step_id: ONBOARDING_STEPS.WELCOME });
      // The hook will update onboardingStatus, and currentClientStep will change, triggering re-render.
    } catch (e) {
      // Handle error (e.g., show a toast)
      alert("Failed to save welcome step progress. Please try again.");
    }
  };

  const handleProfileSubmit = async (data: { fullName: string; role: string }) => {
    try {
      await submitOnboardingStep({
        step_id: ONBOARDING_STEPS.PROFILE_INFO,
        data: data
      });
    } catch (e) {
      alert("Failed to save profile information. Please try again.");
    }
  };

  const handleGoalSubmit = async (data: { primaryGoal: string }) => {
    try {
      // This is the final data collection step in this simple wizard
      // The backend's update_onboarding_step for "goal_setting" should mark completion if all prior steps done.
      const finalStatus = await submitOnboardingStep({
        step_id: ONBOARDING_STEPS.GOAL_SETTING,
        data: data
      });
      // Optionally, if preferences are separate:
      // if (finalStatus && finalStatus.completed_all) {
      //   await submitOnboardingPreferences({ preferences: { setupComplete: true } });
      // }
    } catch (e) {
      alert("Failed to save your goals. Please try again.");
    }
  };

  // For "previous" button, we don't need an API call, but the backend current_step_id
  // might not align if we go back. The backend should ideally be stateless regarding "current viewing step"
  // and only care about "completed steps" and "next logical incomplete step".
  // For this example, previous will be a bit naive and just set client state.
  // A more robust solution might involve telling the backend "user is viewing step X".
  // For now, we rely on the backend's `current_step_id` to drive the wizard's state after each POST.

  const handlePrevious = async (targetStep: string) => {
    // This is a conceptual "go back".
    // In a real app, you might want to ensure the backend status reflects this if it matters.
    // For now, we'll assume the hook refetches status or the component re-evaluates currentClientStep.
    // Or, we could have a local currentStep and sync with backend's `current_step_id` from `onboardingStatus`.
    // Let's keep it simple: the backend will always tell us what the *actual* current_step_id is.
    // So, clicking previous on "Goal Setting" should effectively mean we want to re-submit "Profile Info" if changes are made.
    // The backend will determine the next step.
    // To make "Previous" work smoothly without complex state, we'd need a local step override.
    // For this iteration, let's assume the user would have to re-submit the previous step's data if they go back and change it.
    // The hook's `currentClientStep` will be authoritative based on `onboardingStatus.current_step_id`.
    // So, a "previous" button might just re-render the previous form, and if the user submits it, it's a new POST for that step.

    // Simplification: The step components themselves will call submit for *their* step.
    // The "previous" button in StepProfileInfo would call a function that changes a local state variable
    // in this wizard to render StepWelcome. The `useOnboardingState` hook is for API interaction.
    // This requires a local current step state in this component as well.
    console.log("Previous button clicked, targetting step:", targetStep);
    // This part needs more thought for robust "previous" navigation with API state.
    // For now, the individual steps will just POST their own data.
    // The `currentClientStep` from the hook will be the source of truth.
  };


  if (isLoading && !onboardingStatus) { // Initial load
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading onboarding status...</p>
        {/* Add a spinner component here */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-red-600">Error loading onboarding: {error.message}</p>
        <Button onClick={fetchOnboardingStatus} className="mt-4">Try Again</Button>
      </div>
    );
  }

  if (!onboardingStatus) {
      return (
          <div className="flex items-center justify-center min-h-screen">
            <p>Could not load onboarding status. Please try refreshing.</p>
          </div>
      )
  }


  // Render current step based on currentClientStep from the hook
  const renderStep = () => {
    switch (currentClientStep) {
      case ONBOARDING_STEPS.WELCOME:
        return <StepWelcome onNext={handleWelcomeNext} />;
      case ONBOARDING_STEPS.PROFILE_INFO:
        // The onPrevious for StepProfileInfo would need to be handled by a local state change
        // to show Welcome, as the backend doesn't have a "previous" API.
        // For now, let's simplify: "Previous" buttons in sub-components might not be fully functional
        // if they need to revert backend state. They can revert local view.
        return <StepProfileInfo
                    onNext={handleProfileSubmit}
                    onPrevious={() => alert("Previous from Profile: Conceptual - would show Welcome step locally.")}
                />;
      case ONBOARDING_STEPS.GOAL_SETTING:
        return <StepGoalSetting
                    onComplete={handleGoalSubmit}
                    onPrevious={() => alert("Previous from Goals: Conceptual - would show Profile step locally.")}
                />;
      case ONBOARDING_STEPS.COMPLETED: // This is a client-side interpretation
        return (
          <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <CardTitle>Setup Complete!</CardTitle>
                <CardDescription>Your Digame journey begins now.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Thank you for completing the setup. All your information has been saved.</p>
              {onboardingStatus.preferences && Object.keys(onboardingStatus.preferences).length > 0 && (
                <div className="mt-4 text-left">
                  <h4 className="font-semibold">Preferences Saved:</h4>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                    {JSON.stringify(onboardingStatus.preferences, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        );
      default:
        // Could be that current_step_id from backend is null but not completed_all yet (edge case)
        // Or status is not yet loaded.
        if (isLoading) return <p>Loading step information...</p>;
        return (
            <Card className="w-full max-w-lg text-center">
                <CardHeader><CardTitle>Loading Onboarding...</CardTitle></CardHeader>
                <CardContent>
                    <p>Determining your current onboarding step. Please wait.</p>
                    <p className="text-xs text-gray-500 mt-2">Current API step: {onboardingStatus?.current_step_id || "Not set"}</p>
                </CardContent>
            </Card>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {isLoading && <p>Submitting data...</p>}
      {renderStep()}
    </div>
  );
};

export default GuidedSetupWizard;
