import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Stepper, StepItem } from './Stepper';

describe('Stepper Component', () => {
  const mockSteps = [
    { id: 'step1', label: 'Step 1', content: <div>Content for Step 1</div> },
    { id: 'step2', label: 'Step 2', content: <div>Content for Step 2</div> },
    { id: 'step3', label: 'Step 3', content: <div>Content for Step 3</div> },
  ];

  test('renders Stepper with initial step active', () => {
    render(
      <Stepper initialStep={0}>
        {mockSteps.map((step) => (
          <StepItem key={step.id} label={step.label}>
            {step.content}
          </StepItem>
        ))}
      </Stepper>
    );
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Content for Step 1')).toBeInTheDocument();
    expect(screen.queryByText('Content for Step 2')).not.toBeInTheDocument();
  });

  test('renders Stepper vertically', () => {
    render(
      <Stepper initialStep={0} orientation="vertical">
        {mockSteps.map((step) => (
          <StepItem key={step.id} label={step.label}>
            {step.content}
          </StepItem>
        ))}
      </Stepper>
    );
    // Check for a class that indicates vertical orientation
    const stepperDiv = screen.getByText('Step 1').closest('div[class*="flex-col"]');
    // This check is a bit indirect, relying on the parent div of the whole stepper.
    // A more direct way would be to check the main div containing all StepItems.
    // For now, we find the parent of the Stepper's children.
    const stepperContainer = screen.getByText('Step 1').parentElement.parentElement.parentElement;
    expect(stepperContainer).toHaveClass('flex-col');
  });

  test('navigates to next step when clickable and step is clicked', () => {
    const handleStepChange = jest.fn();
    render(
      <Stepper initialStep={0} isClickable onStepChange={handleStepChange}>
        {mockSteps.map((step) => (
          <StepItem key={step.id} label={step.label}>
            {step.content}
          </StepItem>
        ))}
      </Stepper>
    );

    fireEvent.click(screen.getByText('Step 2'));
    expect(screen.getByText('Content for Step 2')).toBeInTheDocument();
    expect(handleStepChange).toHaveBeenCalledWith(1);
  });

  test('navigates to previous step when clicked (even if not generally clickable)', () => {
    render(
      <Stepper initialStep={1} isClickable={false}>
        {mockSteps.map((step) => (
          <StepItem key={step.id} label={step.label}>
            {step.content}
          </StepItem>
        ))}
      </Stepper>
    );

    expect(screen.getByText('Content for Step 2')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Step 1'));
    expect(screen.getByText('Content for Step 1')).toBeInTheDocument();
  });


  test('does not navigate to a future step if not clickable', () => {
    render(
      <Stepper initialStep={0} isClickable={false}>
        {mockSteps.map((step) => (
          <StepItem key={step.id} label={step.label}>
            {step.content}
          </StepItem>
        ))}
      </Stepper>
    );

    fireEvent.click(screen.getByText('Step 2'));
    expect(screen.getByText('Content for Step 1')).toBeInTheDocument();
    expect(screen.queryByText('Content for Step 2')).not.toBeInTheDocument();
  });

  test('marks steps as completed', () => {
    render(
      <Stepper initialStep={1}>
        {mockSteps.map((step) => (
          <StepItem key={step.id} label={step.label}>
            {step.content}
          </StepItem>
        ))}
      </Stepper>
    );
    // Step 1 (index 0) should be completed
    const step1Icon = screen.getByText('Step 1').previousSibling.firstChild;
    expect(step1Icon.tagName).toBe('svg'); // CheckIcon

    // Step 2 (index 1) is active
    const step2Icon = screen.getByText('Step 2').previousSibling.firstChild;
    expect(step2Icon.textContent).toBe('2'); // Shows number

    // Step 3 (index 2) is upcoming
    const step3Icon = screen.getByText('Step 3').previousSibling.firstChild;
    expect(step3Icon.textContent).toBe('3');
  });

  test('shows optional label', () => {
    render(
      <Stepper initialStep={0}>
        <StepItem label="Mandatory Step">Content</StepItem>
        <StepItem label="Optional Step" isOptional>Content</StepItem>
      </Stepper>
    );
    expect(screen.getByText('(Optional)')).toBeInTheDocument();
  });

  test('uses provided icons for steps', () => {
    const CustomIcon = () => <span data-testid="custom-icon">ICON</span>;
    render(
      <Stepper initialStep={0}>
        <StepItem label="Step A" icon={<CustomIcon />}>Content A</StepItem>
      </Stepper>
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  test('StepItem handles completion override', () => {
    render(
      <Stepper initialStep={0}>
        <StepItem label="Step X" isCompleted={true}>Content X</StepItem>
        <StepItem label="Step Y" isCompleted={false}>Content Y</StepItem>
      </Stepper>
    );
    // Step X should show CheckIcon due to isCompleted={true}
    const stepXIconContainer = screen.getByText('Step X').previousSibling;
    expect(stepXIconContainer.querySelector('svg')).toBeInTheDocument(); // CheckIcon

    // Step Y should show number '2' as it's not completed and not active.
    const stepYIconContainer = screen.getByText('Step Y').previousSibling;
    expect(stepYIconContainer.textContent).toContain('2');
  });
});
