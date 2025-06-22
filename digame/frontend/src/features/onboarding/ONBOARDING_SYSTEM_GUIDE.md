# Interactive Onboarding System Guide

This guide provides an overview of the Interactive Onboarding System, including its backend API, frontend components, and how they interact.

## Backend API (`/api/v1/onboarding`)

The backend provides services to manage a user's onboarding progress. It currently uses an in-memory store for data persistence (for simulation purposes).

**Models (`digame/app/models/onboarding_models.py`):**
- `UserOnboardingStatus`: Main model tracking user's overall onboarding state, current step, completed steps, and preferences.
- `OnboardingStep`: Represents an individual step in the onboarding flow.
- `OnboardingStepUpdate`: Payload for updating a step.
- `OnboardingPreferencesUpdate`: Payload for updating user preferences.

**API Endpoints (`digame/app/routers/onboarding_router.py`):**
- **GET `/status`**:
  - Retrieves the current `UserOnboardingStatus` for the authenticated user.
  - Initializes status if it's the user's first interaction.
- **POST `/step`**:
  - Updates an onboarding step. Expects `OnboardingStepUpdate` payload.
  - Marks step as complete, stores associated data, and determines the next `current_step_id`.
  - Returns the updated `UserOnboardingStatus`.
- **POST `/preferences`**:
  - Updates general user preferences collected during onboarding. Expects `OnboardingPreferencesUpdate` payload.
  - Returns the updated `UserOnboardingStatus`.

**Service Logic (`digame/app/services/onboarding_service.py`):**
- Manages the state and progression of onboarding steps.
- Defines a sequence of steps (e.g., "welcome", "profile_info", "goal_setting").

## Frontend Components

Located in `digame/frontend/src/features/onboarding/`.

### 1. Hook: `useOnboardingState.ts`
   (`hooks/useOnboardingState.ts`)

- **Purpose**: Centralizes all interactions with the backend onboarding API and manages the client-side view of onboarding status, loading, and error states.
- **Key Exports**:
    - `onboardingStatus`: The `UserOnboardingStatus` object from the backend (or null).
    - `currentClientStep`: A string representing the current step the UI should display (derived from `onboardingStatus`).
    - `isLoading`: Boolean indicating if an API call is in progress.
    - `error`: Error object if an API call fails.
    - `fetchOnboardingStatus()`: Function to fetch/refresh the status.
    - `submitOnboardingStep(payload: OnboardingStepUpdatePayload)`: Function to submit step data.
    - `submitOnboardingPreferences(payload: OnboardingPreferencesUpdatePayload)`: Function to submit preferences.
- **Usage**: Imported and used by `GuidedSetupWizard.tsx` to drive the wizard's state and API calls.

### 2. Guided Setup Wizard
   (`components/GuidedSetupWizard.tsx`)

- **Purpose**: Provides a multi-step UI for users to provide initial information and preferences.
- **Structure**:
    - Main `GuidedSetupWizard.tsx` container component.
    - Step-specific components:
        - `StepWelcome.tsx`
        - `StepProfileInfo.tsx` (collects full name, role)
        - `StepGoalSetting.tsx` (collects primary goal)
    - Uses UI components from `src/components/ui/` (Card, Button, Input).
- **Functionality**:
    - Uses the `useOnboardingState` hook to get current status and submit data.
    - Navigates users through a defined sequence of steps.
    - Displays a completion message.
    - Handles basic loading and error display for API interactions.
- **Example Invocation** (conceptual, if rendered by a router):
  ```tsx
  import GuidedSetupWizard from './features/onboarding/components/GuidedSetupWizard';
  // ...
  <GuidedSetupWizard />
  ```

### 3. Interactive Platform Tour
   (`components/PlatformTour.tsx`)

- **Purpose**: Provides a conceptual, step-by-step tour of key platform features.
- **Structure**:
    - Uses the `Dialog` and `Button` UI components from `src/components/ui/`.
    - Defines a series of tour steps (title, content, targetElement placeholder).
- **Functionality**:
    - Manages its own state for visibility (isOpen) and current tour step.
    - Allows navigation (Next, Previous, Skip) and completion.
    - Currently, `targetElement` highlighting is conceptual.
- **Props**:
    - `isOpenInitially?: boolean`: Whether the tour should be open when first rendered.
    - `onComplete: () => void`: Callback function when the tour is finished or skipped.
- **Example Invocation**:
  ```tsx
  import PlatformTour from './features/onboarding/components/PlatformTour';
  // ...
  const [showTour, setShowTour] = useState(true); // Or based on onboarding status
  // ...
  {showTour && <PlatformTour isOpenInitially={true} onComplete={() => setShowTour(false)} />}
  ```

## Interaction Flow (Example: Guided Setup)

1.  `GuidedSetupWizard` mounts and its `useOnboardingState` hook calls `GET /api/v1/onboarding/status`.
2.  Backend returns the user's current status (e.g., `current_step_id: "welcome"`).
3.  Wizard displays the `StepWelcome` component.
4.  User clicks "Next" on `StepWelcome`.
5.  `handleWelcomeNext` in wizard calls `submitOnboardingStep({ step_id: "welcome" })\`.
6.  Hook POSTs to `/api/v1/onboarding/step`. Backend updates status, sets next `current_step_id` to "profile_info".
7.  Hook receives updated status, `currentClientStep` changes.
8.  Wizard re-renders, now showing `StepProfileInfo`.
9.  User fills profile, clicks "Next". `handleProfileSubmit` calls `submitOnboardingStep({ step_id: "profile_info", data: {...} })\`.
10. Process repeats for "goal_setting".
11. After final step submission, backend sets `completed_all: true`.
12. Wizard displays a completion message.

## Triggering the Onboarding

- The `GuidedSetupWizard` would typically be shown to new users upon their first login, or if their `onboardingStatus.completed_all` is false.
- The `PlatformTour` could be triggered after the wizard, or offered as an option for users to re-take later. Logic to control its visibility would reside in the main application shell, potentially based on `onboardingStatus` or other user state.

---
This guide should help in understanding and further developing the onboarding system.
Remember that backend tests were created but not run due to environment limits, and frontend tests for the wizard need updating to mock the `useOnboardingState` hook.
