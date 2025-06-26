import React from 'react';
import { Stepper, StepItem } from './Stepper';
import { Button } from './Button'; // Assuming Button component exists for interaction

export default {
  title: 'UI/Stepper',
  component: Stepper,
  subcomponents: { StepItem },
  argTypes: {
    initialStep: { control: 'number', description: 'Index of the initially active step' },
    orientation: {
      control: 'radio',
      options: ['horizontal', 'vertical'],
      description: 'Orientation of the stepper',
    },
    isClickable: { control: 'boolean', description: 'Allow clicking steps to navigate' },
    onStepChange: { action: 'stepChanged', description: 'Callback when step changes' },
  },
  parameters: {
    layout: 'centered',
  },
};

const Template = (args) => {
  const [currentStep, setCurrentStep] = React.useState(args.initialStep || 0);

  const stepsContent = [
    { id: 'info', label: 'Personal Info', content: <div>Please enter your personal information.</div> },
    { id: 'account', label: 'Account Setup', content: <div>Set up your account details.</div>, isOptional: true },
    { id: 'payment', label: 'Payment', content: <div>Enter your payment details.</div> },
    { id: 'confirm', label: 'Confirmation', content: <div>Review and confirm your details.</div> },
  ];

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, stepsContent.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Update args for storybook control
  React.useEffect(() => {
    setCurrentStep(args.initialStep);
  }, [args.initialStep]);


  return (
    <div style={{ width: args.orientation === 'horizontal' ? '600px' : '300px', padding: '20px' }}>
      <Stepper {...args} initialStep={currentStep} onStepChange={(index) => { args.onStepChange(index); setCurrentStep(index); }}>
        {stepsContent.map((step, index) => (
          <StepItem key={step.id} label={step.label} isOptional={step.isOptional}>
            {step.content}
          </StepItem>
        ))}
      </Stepper>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handlePrev} disabled={currentStep === 0} variant="outline">
          Previous
        </Button>
        <Button onClick={handleNext} disabled={currentStep === stepsContent.length - 1}>
          Next
        </Button>
      </div>
      <p style={{marginTop: '10px', fontSize: '12px'}}>Current controlled step: {currentStep}</p>
    </div>
  );
};

export const DefaultHorizontal = Template.bind({});
DefaultHorizontal.args = {
  initialStep: 0,
  orientation: 'horizontal',
  isClickable: false,
};

export const ClickableHorizontal = Template.bind({});
ClickableHorizontal.args = {
  initialStep: 1,
  orientation: 'horizontal',
  isClickable: true,
};

export const DefaultVertical = Template.bind({});
DefaultVertical.args = {
  initialStep: 0,
  orientation: 'vertical',
  isClickable: false,
};

export const ClickableVertical = Template.bind({});
ClickableVertical.args = {
  initialStep: 1,
  orientation: 'vertical',
  isClickable: true,
};

const CustomIconsStepper = (args) => {
  const [currentStep, setCurrentStep] = React.useState(args.initialStep || 0);
   // Update args for storybook control
   React.useEffect(() => {
    setCurrentStep(args.initialStep);
  }, [args.initialStep]);

  const InfoIcon = () => <span>👤</span>;
  const SettingsIcon = () => <span>⚙️</span>;
  const PaymentIcon = () => <span>💳</span>;
  const ConfirmIcon = () => <span>👍</span>;


  const stepsContent = [
    { id: 'info', label: 'User Info', icon: <InfoIcon />, content: <div>User details here.</div> },
    { id: 'settings', label: 'Preferences', icon: <SettingsIcon />, content: <div>Configure preferences.</div> },
    { id: 'pay', label: 'Billing', icon: <PaymentIcon />, content: <div>Setup billing.</div> },
    { id: 'done', label: 'Finalize', icon: <ConfirmIcon />, content: <div>All set!</div> },
  ];

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, stepsContent.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <div style={{ width: args.orientation === 'horizontal' ? '600px' : '300px', padding: '20px' }}>
      <Stepper {...args} initialStep={currentStep} onStepChange={(index) => { args.onStepChange(index); setCurrentStep(index); }}>
        {stepsContent.map((step) => (
          <StepItem key={step.id} label={step.label} icon={step.icon}>
            {step.content}
          </StepItem>
        ))}
      </Stepper>
       <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={handlePrev} disabled={currentStep === 0} variant="outline">
          Previous
        </Button>
        <Button onClick={handleNext} disabled={currentStep === stepsContent.length - 1}>
          Next
        </Button>
      </div>
    </div>
  );
};

export const WithCustomIcons = CustomIconsStepper.bind({});
WithCustomIcons.args = {
  initialStep: 0,
  orientation: 'horizontal',
  isClickable: true,
};

export const NoStepContentOutside = (args) => {
    const [currentStep, setCurrentStep] = React.useState(args.initialStep || 0);
     // Update args for storybook control
    React.useEffect(() => {
        setCurrentStep(args.initialStep);
    }, [args.initialStep]);

    const stepsData = [
        { id: 'stepA', label: 'Step A', content: <div>Content for Step A (rendered inside)</div> },
        { id: 'stepB', label: 'Step B', content: <div>Content for Step B (rendered inside)</div> },
        { id: 'stepC', label: 'Step C', content: <div>Content for Step C (rendered inside)</div> },
    ];

    const handleNext = () => {
        setCurrentStep((prev) => Math.min(prev + 1, stepsData.length - 1));
    };

    const handlePrev = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };


    return (
        <div style={{ width: args.orientation === 'horizontal' ? '600px' : '300px', padding: '20px' }}>
            <Stepper {...args} initialStep={currentStep} onStepChange={(index) => { args.onStepChange(index); setCurrentStep(index); }}>
                {stepsData.map(step => (
                    <StepItem key={step.id} label={step.label}>
                        {/* Content is passed as children to StepItem and Stepper will render it */}
                        {step.content}
                    </StepItem>
                ))}
            </Stepper>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={handlePrev} disabled={currentStep === 0} variant="outline">
                    Previous
                </Button>
                <Button onClick={handleNext} disabled={currentStep === stepsData.length - 1}>
                    Next
                </Button>
            </div>
        </div>
    );
};

export const ContentInsideStepItem = NoStepContentOutside.bind({});
ContentInsideStepItem.args = {
  initialStep: 0,
  orientation: 'horizontal',
  isClickable: true,
};
ContentInsideStepItem.parameters = {
  docs: {
    description: {
      story: 'Demonstrates rendering step content directly if passed as children to `StepItem`. The `Stepper` component handles displaying the active step\'s content.',
    },
  },
};
