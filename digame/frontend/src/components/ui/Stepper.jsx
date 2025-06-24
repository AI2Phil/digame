import React, { createContext, useContext, useMemo } from 'react';
import { cn } from '../../lib/utils';
import { CheckIcon } from 'lucide-react';

const StepperContext = createContext({
  currentStep: 0,
  steps: [],
  setCurrentStep: () => {},
  isVertical: false,
  isClickable: false,
});

const useStepper = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('useStepper must be used within a StepperProvider');
  }
  return context;
};

/**
 * @typedef {object} Step
 * @property {string} id - A unique identifier for the step.
 * @property {string} label - The label to display for the step.
 * @property {React.ReactNode} [icon] - An optional icon for the step.
 * @property {React.ReactNode} [content] - Optional content to display when the step is active.
 * @property {boolean} [isCompleted] - Whether the step is completed.
 * @property {boolean} [isOptional] - Whether the step is optional.
 */

/**
 * Stepper component to guide users through a sequence of steps.
 * @param {object} props - The component props.
 * @param {number} [props.initialStep=0] - The initially active step index.
 * @param {Step[]} props.steps - An array of step objects.
 * @param {React.ReactNode} props.children - The content of the stepper, typically StepItem components.
 * @param {string} [props.className] - Additional CSS classes.
 * @param {'horizontal' | 'vertical'} [props.orientation='horizontal'] - The orientation of the stepper.
 * @param {boolean} [props.isClickable=false] - Whether steps are clickable to navigate.
 * @param {(stepIndex: number) => void} [props.onStepChange] - Callback when the step changes.
 */
const Stepper = ({
  initialStep = 0,
  steps: stepsArray,
  children,
  className,
  orientation = 'horizontal',
  isClickable = false,
  onStepChange,
  ...props
}) => {
  const [currentStep, setCurrentStep] = React.useState(initialStep);

  const isVertical = orientation === 'vertical';

  const steps = useMemo(
    () =>
      React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null;
        const stepProps = child.props;
        return {
          id: stepProps.id || `step-${index}`,
          label: stepProps.label,
          icon: stepProps.icon,
          content: stepProps.children, // Content is passed as children to StepItem
          isCompleted: stepProps.isCompleted || (currentStep > index),
          isOptional: stepProps.isOptional,
        };
      })?.filter(Boolean) || stepsArray, // Fallback to stepsArray if children are not StepItems directly
    [children, stepsArray, currentStep]
  );

  const handleSetCurrentStep = (index) => {
    if (isClickable || index < currentStep) { // Allow navigation to previous steps or if clickable
      setCurrentStep(index);
      if (onStepChange) {
        onStepChange(index);
      }
    }
  };

  const contextValue = {
    currentStep,
    steps,
    setCurrentStep: handleSetCurrentStep,
    isVertical,
    isClickable,
  };

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        className={cn(
          'flex w-full',
          isVertical ? 'flex-col' : 'flex-row justify-between items-start',
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
           if (!React.isValidElement(child)) return null;
            return React.cloneElement(child, {
                key: child.props.id || `step-item-${index}`,
                index,
                ...child.props,
            });
        })}
      </div>
      {steps[currentStep]?.content && (
        <div className={cn('mt-4 p-4 border rounded-md bg-background', isVertical && 'ml-12')}>
          {steps[currentStep].content}
        </div>
      )}
    </StepperContext.Provider>
  );
};

Stepper.displayName = 'Stepper';

/**
 * Represents a single step in the Stepper component.
 * @param {object} props - The component props.
 * @param {number} props.index - The index of the step (automatically passed by Stepper).
 * @param {string} props.label - The label for the step.
 * @param {React.ReactNode} [props.icon] - An optional icon for the step.
 * @param {React.ReactNode} [props.children] - The content for this step, displayed when active.
 * @param {boolean} [props.isCompleted] - Overrides completion status.
 * @param {boolean} [props.isOptional] - Marks the step as optional.
 * @param {string} [props.className] - Additional CSS classes for the step item.
 */
const StepItem = ({
  index,
  label,
  icon,
  children, // Content for the step
  isCompleted: stepCompleted,
  isOptional,
  className,
  ...props
}) => {
  const { currentStep, setCurrentStep, steps, isVertical, isClickable } = useStepper();
  const isActive = index === currentStep;
  const isCompleted = typeof stepCompleted === 'boolean' ? stepCompleted : currentStep > index;

  const stepIcon = icon || (isCompleted ? <CheckIcon className="h-5 w-5" /> : <span className="text-sm font-semibold">{index + 1}</span>);

  const handleStepClick = () => {
    if (isClickable || index < currentStep) {
      setCurrentStep(index);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center',
        isVertical ? 'flex-row mb-4' : 'flex-col text-center flex-1 relative',
        (isClickable || index < currentStep) && 'cursor-pointer',
        className
      )}
      onClick={handleStepClick}
      role="button"
      tabIndex={isClickable || index < currentStep ? 0 : -1}
      aria-current={isActive ? 'step' : undefined}
      {...props}
    >
      {/* Step Connector Line (Horizontal) */}
      {!isVertical && index > 0 && (
        <div
          className={cn(
            'absolute top-1/2 left-0 transform -translate-x-1/2 -translate-y-1/2 w-full h-0.5',
            isCompleted || isActive ? 'bg-primary' : 'bg-muted'
          )}
          style={{ zIndex: -1, top: 'calc(1.25rem / 2)' }} // Align with center of icon
        />
      )}
       {/* Step Connector Line (Vertical) */}
      {isVertical && index > 0 && (
         <div
          className={cn(
            'absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 h-full w-0.5',
            isCompleted || isActive ? 'bg-primary' : 'bg-muted'
          )}
          style={{ zIndex: -1, left: 'calc(1.25rem / 2)' }} // Align with center of icon
        />
      )}

      <div className={cn('flex items-center', isVertical ? 'flex-row' : 'flex-col')}>
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 rounded-full border-2',
            isActive ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground bg-muted',
            isCompleted && !isActive && 'border-primary bg-primary text-primary-foreground',
            (isClickable || index < currentStep) && 'hover:border-primary'
          )}
        >
          {stepIcon}
        </div>
        <div
          className={cn(
            'mt-2 text-sm font-medium',
            isActive ? 'text-primary' : 'text-muted-foreground',
            isVertical && 'ml-4 mt-0'
          )}
        >
          {label}
          {isOptional && <span className="text-xs text-muted-foreground ml-1">(Optional)</span>}
        </div>
      </div>
    </div>
  );
};

StepItem.displayName = 'StepItem';

export { Stepper, StepItem, useStepper };
