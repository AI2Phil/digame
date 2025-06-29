import React from 'react';

export interface LabelProps {
  className?: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  error?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  children?: React.ReactNode;
}

declare const Label: React.ForwardRefExoticComponent<LabelProps & React.RefAttributes<any>>;

export const EnhancedLabel: React.ForwardRefExoticComponent<any & React.RefAttributes<any>>;
export const Field: React.ForwardRefExoticComponent<any & React.RefAttributes<any>>;
export const LabelVariants: any;
export const useLabelState: () => any;
export const FormSection: React.ForwardRefExoticComponent<any & React.RefAttributes<any>>;
export const createFieldProps: (label: string, options?: any) => any;

export default Label;