import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  className?: string;
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  value?: string | string[];
  onChange?: (value: any) => void;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<any>>;

export default Select;